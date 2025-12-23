<template>
  <div :style="{ width: '100%', height: height + 'px' }" ref="chartRoot"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'EChartBarLine',
  props: {
    categories: {
      type: Array,
      default: () => []
    },
    barData: {
      type: Array,
      default: () => []
    },
    lineData: {
      type: Array,
      default: () => []
    },
    height: {
      type: Number,
      default: 260
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      chart: null,
      op: {
        tooltip: { trigger: 'axis' },
        legend: { data: [{
            name: '账户余额',
            textStyle: { color: '#9E9E9E' }
          },{
            name: '交易笔数',
            textStyle: { color: '#9E9E9E' }
          }] },
        grid: { left: 30, right: 30, top: 25, bottom: 20 ,borderColor:'#636363'},
        xAxis: { type: 'category', data: this.categories || [], axisLabel: { color: '#9E9E9E' } },
        yAxis: [
          { type: 'value', name: '账户余额', axisLabel: { color: '#636363' } },
          { type: 'value', name: '交易笔数', axisLabel: { color: '#636363' } }
        ],
        series: [
          {
            name: '账户余额',
            type: 'bar',
            data: this.barData || [],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#00d4ff' },
                { offset: 1, color: '#5b8def' }
              ])
            },
            barMaxWidth: 26
          },
          {
            name: '交易笔数',
            type: 'line',
            yAxisIndex: 1,
            data: this.lineData || [],
            // smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: { color: '#24D9B5' },
            lineStyle: { color: '#24D9B5' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(255, 209, 102, 0.3)' },
                { offset: 1, color: 'rgba(255, 209, 102, 0.05)' }
              ])
            }
          }
        ]
      }

    }
  },
  mounted() {
    this.initChart()
    window.addEventListener('resize', this.resizeHandler)
  },
  beforeDestroy() {
    this.disposeChart()
    window.removeEventListener('resize', this.resizeHandler)
  },
  watch: {
    categories() { this.updateChart() },
    barData: { handler() { this.updateChart() }, deep: true },
    lineData: { handler() { this.updateChart() }, deep: true },
    options: { handler() { this.updateChart() }, deep: true }
  },
  methods: {
    initChart() {
      try {
        this.chart = echarts.init(this.$refs.chartRoot)
        this.updateChart()
      } catch (e) {
        console.warn('EChartBarLine init failed', e)
      }
    },
    disposeChart() {
      if (this.chart) {
        this.chart.dispose()
        this.chart = null
      }
    },
    resizeHandler() {
      if (this.chart && this.chart.resize) this.chart.resize()
    },
    updateChart() {
      if (!this.chart) return
      const option = Object.assign({
        tooltip: { trigger: 'axis' },
        legend: {
          data: [
            {
              name: '账户余额',
              textStyle: { color: '#9E9E9E' }
            },
            {
              name: '交易笔数',
              textStyle: { color: '#9E9E9E' }
            }
          ]
        },
        grid: { left: 30, right: 30, top: 25, bottom: 20, borderColor: '#636363' },
        xAxis: { type: 'category', data: this.categories || [], axisLabel: { color: '#9E9E9E' } },
        yAxis: [
          { type: 'value', name: '账户余额', axisLabel: { color: '#636363' } },
          { type: 'value', name: '交易笔数', axisLabel: { color: '#636363' } }
        ],
        series: [
          {
            name: '账户余额',
            type: 'bar',
            data: this.barData || [],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#00d4ff' },
                { offset: 1, color: '#5b8def' }
              ])
            },
            barMaxWidth: 26
          },
          {
            name: '交易笔数',
            type: 'line',
            yAxisIndex: 1,
            data: this.lineData || [],
            // smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: { color: '#24D9B5' },
            lineStyle: { color: '#24D9B5' },
            // areaSty  le: {
            //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            //     { offset: 0, color: 'rgba(255, 209, 102, 0.3)' },
            //     { offset: 1, color: 'rgba(255, 209, 102, 0.05)' }
            //   ])
            // }
          }
        ]
      }, this.options)
      try {
        this.chart.setOption(option, true)
      } catch (e) {
        console.warn('EChartBarLine setOption failed', e)
      }
    }
  }
}
</script>

<style scoped>
div { width: 100% }
</style>


