<template>
  <div :style="{ width: '100%', height: height + 'px' }" ref="chartRoot"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'EChartSparkline',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    height: {
      type: Number,
      default: 70
    },
    color: {
      type: String,
      default: '#00d4ff'
    }
  },
  data() {
    return { chart: null }
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
    data: { handler() { this.updateChart() }, deep: true }
  },
  methods: {
    initChart() {
      try {
        this.chart = echarts.init(this.$refs.chartRoot)
        this.updateChart()
      } catch (e) {
        console.warn('EChartSparkline init failed', e)
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
      const data = this.data || []
      // 颜色由调用方通过 prop `color` 决定（caller 将基于 percent 传入），若未传入则回退至数据包含负值判断
      const hasNegative = data.some((v) => typeof v === 'number' && v < 0)
      const passedColor = (this.color || '').toString()
      const fallbackLineColor = hasNegative ? '#FF3A3A' : '#3AACFF'
      const lineColor = passedColor ? passedColor : fallbackLineColor
      const isNegativeColor = lineColor.toLowerCase() === '#ff3a3a'
      // area 使用线性渐变（从不透明颜色到透明）
      const areaGradient = isNegativeColor
        ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#FF3A3A' },
          { offset: 1, color: 'rgba(8,65,111,0)' }
        ])
        : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#3AACFF' },
          { offset: 1, color: 'rgba(0,152,250,0)' }
        ])

      const option = {
        tooltip: { show: false },
        grid: { left: 0, right: 0, top: 30, bottom: 0 },
        xAxis: { type: 'category', data: data.map((_, i) => i + 1), show: false },
        yAxis: { type: 'value', show: false },
        series: [
          {
            type: 'line',
            data,
            smooth: true,
            symbol: 'none',
            lineStyle: { color: lineColor, width: 2 },
            areaStyle: { color: areaGradient }
          }
        ]
      }
      try {
        this.chart.setOption(option, true)
      } catch (e) {
        console.warn('EChartSparkline setOption failed', e)
      }
    }
  }
}
</script>

<style scoped>
div { width: 100% }
</style>


