<template>
  <div class="world-map-container" ref="chartContainer"></div>
</template>

<script>
import * as echarts from 'echarts'
import worldJson from './world.json'
import { geoCoordMap } from './geo-coords.js'
import { formatNumber } from '@/utils/utils.js'
export default {
  name: 'WorldMap',
  props: {
    flowDataProp: {
      type: Array,
      default: () => [],
    },
    accountDataProp: {
      type: [Object, Array],
      default: () => ({}),
    },
  },
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
    this.processData()
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
  computed: {
    isDarkMode() {
      return this.$store.getters['theme/isDarkMode']
    }
  },
  watch: {
    isDarkMode: {
      handler() {
        this.updateThemeColors()
      },
    },
    flowDataProp: {
      handler() {
        this.processData()
      },
      deep: true,
    },
    accountDataProp: {
      handler() {
        this.processData()
      },
      deep: true,
    },
  },
  methods: {
    getThemeTitleColor() {
      try {
        const isLight = !this.$store.getters['theme/isDarkMode']
        const rootStyle = getComputedStyle(document.documentElement)
        const titleLight = rootStyle.getPropertyValue('--color-title-light').trim() || '#181818'
        const titleDark = rootStyle.getPropertyValue('--color-title-dark').trim() || '#FFFFFF'
        return isLight ? titleLight : titleDark
      } catch (e) {
        return '#FFFFFF'
      }
    },
    updateThemeColors() {
      if (this.chart) {
        this.chart.setOption(this.getChartOption())
      }
    },
    processData() {
      this.flowData = JSON.parse(JSON.stringify(this.flowDataProp || []))
      
      // 如果 accountDataProp 是数组，转换为以 name 为 key 的对象 Map，方便后续展示和匹配
      if (Array.isArray(this.accountDataProp)) {
        this.accountDataMap = this.accountDataProp.reduce((acc, item) => {
          if (item.name) acc[item.name] = item
          return acc
        }, {})
      } else {
        this.accountDataMap = this.accountDataProp || {}
      }

      // 将 accountDataMap 有数据的国家添加到 flowData 中，确保地图上有蓝点和标签
      if (this.flowData && this.accountDataMap) {
        const existingCenters = new Set(this.flowData.map((item) => item.center))
        Object.keys(this.accountDataMap).forEach((countryName) => {
          if (!existingCenters.has(countryName)) {
            this.flowData.push({
              center: countryName,
              flows: [],
            })
          }
        })
      }

      this.updateChart()
    },
    // fetchData removed
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
              date: dataItem[0].date,
              balance: dataItem[0].balance,
              inflow: dataItem[0].inflow,
              count: dataItem[0].count
            })
          }
        }
        return res
      }

      let series = []

      // 准备地图数据 - 包含所有有账户数据的国家及其余额
      const mapData = Object.entries(accountDataMap).map(([name, data]) => ({
        name: name,
        value: data.balance || 0,
        count: data.count || 0,
        label: {
          emphasis: {
            show: false, // 禁用center国家的黑底白字标签
          },
        },
      }))

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
          areaColor: null, // 使用visualMap的颜色
          borderWidth: 1.5,
          borderColor: '#FFB600',
          shadowColor: 'rgba(255,221,51,0.5)',
          shadowBlur: 10,
        },
        zoom: 1.05,
        map: 'world',
        // 为所有国家设置数据，包含余额信息
        data: mapData,
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
              color: '#FFFF00',
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
              color: '#FFFF00',
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
        visualMap: {
          show: true,
          type: 'piecewise',
          seriesIndex: [0],
          inverse: true,
          pieces: [
            {
              min: 0,
              max: 50000000,
              label: '0-5000万',
              color: 'rgba(78,156,239,0.9)',
            },
            {
              min: 50000001,
              max: 100000000,
              label: '5000万-1亿',
              color: 'rgba(38,92,224,0.9)',
            },
            {
              min: 100000001,
              max: 300000000,
              label: '1亿-3亿',
              color: 'rgba(24,66,161,0.9)',
            },
            { min: 300000001, label: '3亿以上', color: 'rgba(0,34,110,0.9)' },
          ],
          textStyle: {
            color: this.getThemeTitleColor(),
            fontSize: 12,
          },
          left: '0',
          bottom: '70px',
          itemWidth: 20,
          itemHeight: 20,
          itemGap: 6,
        },
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
                  <span style="color: #2AB8FF;">账户数量:</span> <span style="float: right; margin-left: 20px;">${formatNumber(data.count, 0)}</span><br/>
                  <span style="color: #2AB8FF;">账户余额:</span> <span style="float: right; margin-left: 20px;">${formatNumber(data.balance / 10000, 2)} 万元</span>
                </div>
              `
            }
            if (params.seriesType == 'lines') {
              const d = params.data
              return `
                <div style="font-size: 15px; font-weight: bold; margin-bottom: 6px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 4px;">资金流向详情</div>
                <div style="line-height: 22px;">
                  <span style="color: #2AB8FF;">日期:</span> <span style="float: right; margin-left: 20px;">${d.date || '-'}</span><br/>
                  <span style="color: #2AB8FF;">流向:</span> <span style="float: right; margin-left: 20px;">${d.fromName} -> ${d.toName}</span><br/>
                  <span style="color: #2AB8FF;">账户余额:</span> <span style="float: right; margin-left: 20px;">${formatNumber(d.balance)}</span><br/>
                  <span style="color: #2AB8FF;">资金流入:</span> <span style="float: right; margin-left: 20px;">${formatNumber(d.inflow)}</span><br/>
                  <span style="color: #2AB8FF;">流入笔数:</span> <span style="float: right; margin-left: 20px;">${d.count}</span>
                </div>
              `
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
