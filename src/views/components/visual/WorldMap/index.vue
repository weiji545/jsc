<template>
  <div class="world-map-container" ref="chartContainer"></div>
</template>

<script>
import * as echarts from 'echarts'
import worldJson from './world.json'
import { geoCoordMap } from './geo-coords.js'
import { getWorldMapFlowData, getWorldAccountData } from '../../../../api/dashboard'

export default {
  name: 'WorldMap',
  data() {
    return {
      flowData: [],
      accountDataMap: {},
      highlightCountries: [],
      currentHighlightIndex: 0,
      highlightInterval: 30000,
      isRotating: false,
      highlightTimer: null,
      outId: null,
    }
  },
  mounted() {
    this.initChart()
    this.fetchData()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.highlightTimer) clearInterval(this.highlightTimer)
    if (this.outId) clearTimeout(this.outId)
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    async fetchData() {
      try {
        const [flowRes, accountRes] = await Promise.all([
          getWorldMapFlowData(),
          getWorldAccountData(),
        ])

        if (flowRes.code === 200) {
          this.flowData = flowRes.data || []
        }
        if (accountRes.code === 200) {
          this.accountDataMap = accountRes.data || {}
        }

        // 将accountRes有数据的国家添加到flowData中
        if (this.flowData && this.accountDataMap) {
          const existingCenters = new Set(this.flowData.map(item => item.center))
          Object.keys(this.accountDataMap).forEach(countryName => {
            if (!existingCenters.has(countryName)) {
              this.flowData.push({
                center: countryName,
                flows: []
              })
            }
          })
        }

        this.updateChart()
      } catch (error) {
        console.error('Failed to fetch world map data:', error)
      }
    },
    initChart() {
      if (!this.$refs.chartContainer) return

      // Register the world map
      echarts.registerMap('world', worldJson)

      const chart = echarts.init(this.$refs.chartContainer)
      this.chart = chart

      const option = this.getChartOption()
      chart.setOption(option)
      this.bindChartEvents()
    },
    updateChart() {
      if (this.chart) {
        // 计算balance最高的前三名国家
        this.highlightCountries = Object.entries(this.accountDataMap)
          .slice()
          .sort((a, b) => b[1].balance - a[1].balance)
          .slice(0, 3)
          .map(item => item[0])
        const option = this.getChartOption()
        this.chart.setOption(option)

        // 启动轮播
        this.startHighlight()
      }
    },
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    },
    startHighlight() {
      this.stopHighlight()

      this.isRotating = true
      this.highlightTimer = setInterval(() => {
        this.highlightNextCountry()
      }, this.highlightInterval)
      // 立即高亮第一个国家
      if (this.highlightCountries.length > 0) {
        this.highlightSpecificCountry(this.highlightCountries[0])
      }
    },
    stopHighlight() {
      if (this.highlightTimer) {
        clearInterval(this.highlightTimer)
        this.highlightTimer = null
      }
      this.isRotating = false
      // 清除当前高亮
      this.clearCurrentHighlight()
    },
    highlightNextCountry() {
      if (this.highlightCountries.length === 0) return

      this.currentHighlightIndex =
        (this.currentHighlightIndex + 1) % this.highlightCountries.length
      const countryName = this.highlightCountries[this.currentHighlightIndex]

      this.highlightSpecificCountry(countryName)
    },
    highlightSpecificCountry(countryName) {
      if (!this.chart) return

      // 先清除之前所有可能的高亮（防止堆叠）
      this.chart.dispatchAction({
        type: 'downplay',
        seriesIndex: 0
      })

      // 获取当前国家在数据中的索引
      const dataIndex = this.chart.getModel().getSeriesByIndex(0).getData().indexOfName(countryName)

      if (dataIndex > -1) {
        // 高亮
        this.chart.dispatchAction({
          type: 'highlight',
          seriesIndex: 0,
          dataIndex: dataIndex
        })

        // 显式触发 Tooltip
        this.chart.dispatchAction({
          type: 'showTip',
          seriesIndex: 0,
          dataIndex: dataIndex
        })
      }
    },
    clearCurrentHighlight() {
      this.chart.dispatchAction({
        type: 'downplay',
        seriesIndex: 0
      })
    },
    bindChartEvents() {
      this.chart.on('mouseover', (params) => {
        if (this.outId) clearTimeout(this.outId)
        if (params.seriesType === 'map') {
          this.stopHighlight()
          // 手动触发高亮显示背景色
          this.chart.dispatchAction({
            type: 'highlight',
            seriesIndex: 0,
            dataIndex: params.dataIndex
          })
        }
      })

      // 鼠标移出时恢复自动高亮
      this.chart.on('mouseout', (params) => {
        if (this.outId) clearTimeout(this.outId)
        if (params.seriesType === 'map') {
          // 先清除当前高亮
          this.clearCurrentHighlight()
          this.outId = setTimeout(() => {
            this.startHighlight()
          }, 3000) // 延迟3秒后恢复轮播
        }
      })
    },
    getChartOption() {
      const colorList = [
        '#4ab2e5', '#4fb6d2', '#52b9c7', '#5abead', '#f34e2b', '#f56321',
        '#f56f1c', '#f58414', '#f58f0e', '#f5a305', '#e7ab0b', '#dfae10',
        '#d5b314', '#c1bb1f', '#b9be23', '#a6c62c', '#96cc34',
      ]

      const flowCenters = this.flowData || []
      const accountDataMap = this.accountDataMap || {}

      // 收集所有center国家的名称，这些国家有蓝底白字的标签
      // hover和自动循环时不显示黑底白字的emphasis标签，避免重叠
      const centerCountries = new Set()
      flowCenters.forEach(center => {
        centerCountries.add(center.center)
      })

      const convertData = function (data) {
        let res = []
        for (let i = 0; i < data.length; i++) {
          let dataItem = data[i]
          let fromCoord = geoCoordMap[dataItem[0].name]
          let toCoord = geoCoordMap[dataItem[1].name]
          if (fromCoord && toCoord) {
            res.push({
              fromName: dataItem[0].name,
              toName: dataItem[1].name,
              coords: [fromCoord, toCoord],
              value: dataItem[0].value,
            })
          }
        }
        return res
      }

      let series = []

      // 添加底图系列
      series.push({
        type: 'map',
        roam: false,
        label: {
          show: false, // 默认隐藏，hover时显示
        },
        tooltip: { show: true },
        itemStyle: {
          borderColor: 'rgb(147, 235, 248)',
          borderWidth: 0.1,
          areaColor: {
            type: 'radial',
            x: 0.5,
            y: 0.5,
            r: 0.8,
            colorStops: [
              { offset: 0, color: 'rgb(210,246,253)' },
              { offset: 1, color: 'rgb(154,210,244)' },
            ],
            globalCoord: true,
          },
        },
        emphasis: {
          label: {
            show: true,
            color: '#fff',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: [2, 4],
            borderRadius: 2,
          },
          areaColor: 'rgb(46,229,206)',
          borderWidth: 0.1,
        },
        zoom: 1.05,
        map: 'world',
        // 为center国家禁用hover时的默认标签，避免与蓝底白字标签重叠
        data: Array.from(centerCountries).map(name => ({
          name: name,
          label: {
            emphasis: {
              show: false, // 禁用center国家的黑底白字标签
            },
          },
        })),
      })

      flowCenters.forEach((item) => {
        const centerName = item.center
        const flows = item.flows || []

        series.push(
          {
            name: centerName + '流向',
            type: 'lines',
            zlevel: 2,
            effect: {
              show: true,
              period: 4,
              trailLength: 0.4,
              symbol: 'arrow',
              symbolSize: 7,
            },
            lineStyle: {
              color: (p) => colorList[p.dataIndex] || '#' +
                ('00000' + ((Math.random() * 16777215 + 0.5) >> 0).toString(16)).slice(-6),
              width: 1,
              opacity: 1,
              curveness: 0.3,
            },
            label: { show: false, position: 'middle', formatter: '{b}' },
            data: convertData(flows),
          },
          {
            type: 'effectScatter',
            coordinateSystem: 'geo',
            zlevel: 2,
            rippleEffect: {
              period: 15,
              brushType: 'stroke',
              scale: 4,
            },
            label: {
              show: true, // 显示流向源头的国家标签
              position: 'top',
              offset: [0, -5],
              formatter: '{b}',
              color: '#fff',
              fontSize: 10,
              backgroundColor: 'rgba(0,0,0,0.3)',
              padding: [2, 4],
              borderRadius: 2,
            },
            emphasis: {
              show: true,
              scale: true,
              label: {
                show: true,
                backgroundColor: '#000',
                padding: 4,
                borderRadius: 2,
                color: '#fff',
                fontSize: 12,
              },
            },
            symbol: 'circle',
            symbolSize: (val) => 4 + (val[2] || 0) / 1000,
            itemStyle: {
              color: (p) => colorList[p.dataIndex] || '#' +
                ('00000' + ((Math.random() * 16777215 + 0.5) >> 0).toString(16)).slice(-6),
            },
            data: flows.map((dataItem) => {
              const coord = geoCoordMap[dataItem[0].name]
              return coord ? {
                name: dataItem[0].name,
                value: coord.concat([dataItem[0].value]),
              } : null
            }).filter(i => i),
          },
          {
            type: 'scatter',
            coordinateSystem: 'geo',
            zlevel: 2,
            label: {
              show: true,
              position: 'right',
              backgroundColor: '#1535A8',
              color: '#fff',
              padding: [4, 8],
              borderRadius: 4,
              formatter: '{b}',
            },
            emphasis: { show: true },
            symbol: 'circle',
            symbolSize: 1,
            itemStyle: {
              show: false,
              color: '#1535A8',
            },
            data: [
              {
                name: centerName,
                value: (geoCoordMap[centerName] || [0, 0]).concat([10]),
              }],
          },
        )
      })

      return {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderColor: '#2AB8FF',
          borderWidth: 1,
          padding: [8, 12],
          textStyle: {
            color: '#fff',
            fontSize: 14,
          },
          formatter: (params) => {
            const name = params.name || (params.data && params.data.name)
            const data = accountDataMap[name]
            if (data) {
              return `
                <div style="font-size: 15px; font-weight: bold; margin-bottom: 6px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 4px;">${name}</div>
                <div style="line-height: 22px;">
                  <span style="color: #2AB8FF;">账户数量:</span> <span style="float: right; margin-left: 20px;">${data.count}</span><br/>
                  <span style="color: #2AB8FF;">账户余额:</span> <span style="float: right; margin-left: 20px;">￥${data.balance}</span>
                </div>
              `
            }
            if (params.seriesType == 'lines') {
              return params.data.fromName + ' -> ' + params.data.toName + '<br />' + params.data.value
            }
            return name
          },
        },
        geo: {
          map: 'world',
          aspectScale: 0.75,
          zoom: 1.05,
          tooltip: { show: true },
          scaleLimit: { min: 1, max: 5 },
          label: { show: false },
          roam: false,
          itemStyle: {
            areaColor: {
              type: 'radial',
              x: 0.5,
              y: 0.5,
              r: 0.8,
              colorStops: [
                { offset: 0, color: '#09132c' },
                { offset: 1, color: '#274d68' },
              ],
              globalCoord: true,
            },
            shadowColor: 'rgb(58,115,192)',
            shadowOffsetX: 10,
            shadowOffsetY: 11,
          },
          emphasis: { areaColor: '#2AB8FF', borderWidth: 0, color: '#fff', label: { show: false } },
        },
        series: series,
      }
    },
  },
}
</script>

<style scoped>
.world-map-container {
  width: 100%;
  height: 100%;
}
</style>
