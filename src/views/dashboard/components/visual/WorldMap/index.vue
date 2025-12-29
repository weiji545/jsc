<template>
  <div class="world-map-container" ref="chartContainer"></div>
</template>

<script>
import * as echarts from 'echarts'
import worldJson from './world.json'
import { geoCoordMap } from './geo-coords.js'
import { getWorldMapFlowData, getWorldAccountData } from '@/api/dashboard'

export default {
  name: 'WorldMap',
  data() {
    return {
      chart: null,
      flowData: [],
      accountDataMap: {},
    }
  },
  mounted() {
    this.initChart()
    this.fetchData()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.chart) {
      this.chart.dispose()
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
          this.flowData = flowRes.data
        }
        if (accountRes.code === 200) {
          this.accountDataMap = accountRes.data
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
    },
    updateChart() {
      if (this.chart) {
        const option = this.getChartOption()
        this.chart.setOption(option)
      }
    },
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    },
    getChartOption() {
      const colorList = [
        '#4ab2e5', '#4fb6d2', '#52b9c7', '#5abead', '#f34e2b', '#f56321',
        '#f56f1c', '#f58414', '#f58f0e', '#f5a305', '#e7ab0b', '#dfae10',
        '#d5b314', '#c1bb1f', '#b9be23', '#a6c62c', '#96cc34',
      ]

      const flowCenters = this.flowData || []
      const accountDataMap = this.accountDataMap || {}

      // 收集所有已经有标签的国家名称，避免 hover 时重复显示
      const labeledCountries = new Set()
      flowCenters.forEach(center => {
        labeledCountries.add(center.center)
        if (center.flows) {
          center.flows.forEach(flow => {
            labeledCountries.add(flow[0].name)
          })
        }
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
        // 为已有标签的国家单独禁用 hover 时的默认标签
        data: Array.from(labeledCountries).map(name => ({
          name: name,
          label: {
            emphasis: {
              show: false,
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
