<template>
  <div :style="{ width: size + 'px', height: height + 'px' }" ref="chartRoot"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'EChartPieRing',
  props: {
    // data: array of { name, value }
    data: {
      type: Array,
      default: null
    },
    // variant: 'pie' => 普通饼图, 'donut' => 环形（内半径非 0）
    variant: {
      type: String,
      default: 'pie'
    },
    size: {
      type: Number,
      default: 240
    },
    height: {
      type: Number,
      default: 240
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      chart: null
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
    data: {
      handler() {
        this.updateChart()
      },
      deep: true
    },
    variant() {
      this.updateChart()
    },
    options: {
      handler() {
        this.updateChart()
      },
      deep: true
    }
  },
  methods: {
    initChart() {
      try {
        this.chart = echarts.init(this.$refs.chartRoot)
        this.updateChart()
      } catch (e) {
        console.warn('EChartPieRing init failed', e)
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
      if (!Array.isArray(this.data) || this.data.length === 0) {
        this.chart.setOption({ series: [] }, true)
        return
      }
      const isDonut = this.variant === 'donut'
      const defaultOption = {
        tooltip: { trigger: 'item' },
        // 默认显示 legend
        legend: { show: true },
        series: [
          {
            name: 'pie',
            type: 'pie',
            radius: isDonut ? ['45%', '70%'] : ['0%', '70%'],
            avoidLabelOverlap: false,
            // 非 donut 默认不显示 label，donut 模式下由使用方传入 label 配置
            label: { show: false },
            // 默认显示引导线
            labelLine: { show: true },
            color: ['#FAC858', '#097C38', '#91CC75', '#507AFC', '#93BEFF', '#283E81'],
            data: this.data
          }
        ]
      }
      let option = Object.assign({}, defaultOption)
      if (this.options && typeof this.options === 'object') {
        if (Array.isArray(this.options.series) && this.options.series[0]) {
          option.series[0] = Object.assign({}, option.series[0], this.options.series[0])
        }
        Object.keys(this.options).forEach((k) => {
          if (k === 'series') return
          option[k] = this.options[k]
        })
      }
      // donut 模式下，要求用户在 options.series[0].label 中传入 label 配置以控制 label 展示
      if (isDonut) {
        const series0 = option.series && option.series[0]
        const hasLabelConfig = series0 && series0.label && Object.keys(series0.label).length > 0
        if (hasLabelConfig) {
          series0.label = Object.assign({ show: true }, series0.label)
        } else {
          // 未提供 label 配置：禁用 label 并给出提示，避免展示不合适的默认文本
          if (series0) series0.label = Object.assign({}, series0.label || {}, { show: false })
          console.warn('EChartPieRing: variant="donut" requires label config in options.series[0].label to display labels')
        }
      }
      try {
        this.chart.setOption(option, true)
      } catch (e) {
        console.warn('EChartPieRing setOption failed', e)
      }
    }
  }
}
</script>

<style scoped>
div {
  width: 100%;
  height: 100%;
}
</style>


