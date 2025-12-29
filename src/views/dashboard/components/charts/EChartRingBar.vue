<template>
  <div :style="{ width: size + 'px', height: height + 'px' }" ref="chartRoot"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'EChartRingBar',
  props: {
    percent: {
      type: Number,
      default: null,
    },
    size: {
      type: Number,
      default: 240,
    },
    height: {
      type: Number,
      default: 240,
    },
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      chart: null,
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
    percent() {
      this.updateChart()
    },
    options: {
      handler() {
        this.updateChart()
      },
      deep: true,
    },
  },
  methods: {
    initChart() {
      try {
        this.chart = echarts.init(this.$refs.chartRoot)
        this.updateChart()
      } catch (e) {
        console.warn('EChartRingBar init failed', e)
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
      if (this.percent === null || typeof this.percent !== 'number') {
        this.chart.setOption({ series: [] }, true)
        return
      }
      const p = Math.max(0, Math.min(100, Math.abs(this.percent)))
      const defaultOption = {
        angleAxis: {
          type: 'value',
          max: 100,
          startAngle: 90,
          show: false,
          clockwise: this.percent > 0,
        },
        radiusAxis: { type: 'category', show: false },
        polar: { center: ['50%', '50%'], radius: ['67%', '83%'] },
        series: [
          {
            name: '',
            type: 'bar',
            roundCap: true,
            barWidth: 10,
            showBackground: true,
            backgroundStyle: { color: 'rgba(188,188,188,0.2)' },
            data: [p],
            coordinateSystem: 'polar',
            silent: true,
            hoverAnimation: false,
            itemStyle: {
              color: this.percent < 0 ? '#D92424' : '#24D9B5',
            },
          },
        ],
      }
      const option = Object.assign({}, defaultOption, this.options || {})
      try {
        this.chart.setOption(option, true)
      } catch (e) {
        console.warn('EChartRingBar setOption failed', e)
      }
    },
  },
}
</script>

<style scoped>
div {
  width: 100%;
  height: 100%;
}
</style>


