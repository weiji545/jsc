<template>
  <div class="echart-bar-line-wrapper" :style="{ width: width ? width + 'px' : '100%', height: height + 'px' }">
    <div ref="chartRoot" style="width: 100%; height: 100%;"></div>
    <div v-if="isDataEmpty" class="no-data-text" :style="{ color: axisLabelColor }">暂无数据</div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { formatNumber } from '@/utils/utils.js'

export default {
  name: 'EChartBarLine',
  props: {
    categories: {
      type: Array,
      default: () => [],
    },
    barData: {
      type: Array,
      default: () => [],
    },
    lineData: {
      type: Array,
      default: () => [],
    },
    width: {
      type: Number,
      default: 0,
    },
    height: {
      type: [Number, String],
      default: 260,
    },
    // 可配置显示哪条 y 轴，支持 'bar' | 'line' | 'both' | ['bar','line']（默认仅显示折线的 y 轴）
    visibleY: {
      type: [String, Array],
      default: () => 'line',
    },
    // 是否显示 y 轴名称（提示文字），默认不显示
    showYAxisName: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Object,
      default: () => ({}),
    }
    ,
    // 可直接通过该 prop 指定折线颜色（优先于内部默认颜色）
    lineColor: {
      type: String,
      default: null,
    }
    ,
    // tooltip 显示的单位，父组件可通过 panelsConfig 传入
    unit: {
      type: String,
      default: '',
    }
    ,
    // 第二个序列（通常是折线）的单位，例如 '笔'
    lineUnit: {
      type: String,
      default: '',
    }
    ,
    // 可选：覆盖第一个 y 轴的名称（例如境外模式下显示 '汇率'）
    yAxisName: {
      type: String,
      default: null,
    }
    ,
    // 可选：第二序列（折线）显示名称，父组件可通过 options.series2Name 覆盖
    series2Name: {
      type: String,
      default: '交易笔数',
    }
    ,
    // 可选：图例 / 第一个序列显示名称（例如 '金额'），由父组件传入
    legendName: {
      type: String,
      default: '账户余额',
    },
    xAxisMaxLength: {
      type: Number,
      default: 100,
    },
    // Chart direction: 'vertical' | 'horizontal'
    direction: {
      type: String,
      default: 'vertical',
    },
    // Customize bar max width
    barMaxWidth: {
      type: Number,
      default: 26,
    },
  },
  data() {
    return {
      op: {
        tooltip: { trigger: 'axis' },
        legend: {
          data: [
            {
              name: this.legendName || '账户余额',
              textStyle: { color: '#9E9E9E' },
            }, {
              name: this.series2Name || '交易笔数',
              textStyle: { color: '#9E9E9E' },
            }],
        },
        grid: { left: 30, right: 30, top: 25, bottom: 20, borderColor: '#636363' },
        xAxis: { type: 'category', data: this.categories || [], axisLabel: { color: '#9E9E9E' } },
        yAxis: [
          {
            type: 'value',
            name: this.legendName || '账户余额',
            axisLabel: { color: '#636363' },
            axisLine: { show: false },
          },
          {
            type: 'value',
            name: this.series2Name || '交易笔数',
            axisLabel: { color: '#636363' },
            axisLine: { show: false },
          },
        ],
        series: [
          {
            name: this.legendName || '账户余额',
            type: 'bar',
            data: this.barData || [],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#00d4ff' },
                { offset: 1, color: '#5b8def' },
              ]),
            },
            barMaxWidth: 26,
          },
          {
            name: this.series2Name || '交易笔数',
            type: 'line',
            yAxisIndex: 1,
            data: this.lineData || [],
            // smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: { color: '#FAC858' },
            lineStyle: { color: '#FAC858', width: 2 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(255, 209, 102, 0.3)' },
                { offset: 1, color: 'rgba(255, 209, 102, 0.05)' },
              ]),
            },
          },
        ],
      },
      _lastAxisLabelColor: null,
      _themePoll: null,
    }
  },
  computed: {
    isDataEmpty() {
      const barEmpty = !this.barData || this.barData.length === 0
      const lineEmpty = !this.lineData || this.lineData.length === 0
      return barEmpty && lineEmpty
    },
    axisLabelColor() {
      return this._lastAxisLabelColor || '#9E9E9E'
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
      this.initResizeObserver()
    })
    window.addEventListener('resize', this.resizeHandler)
    // 启动轮询检查 CSS 变量变化，确保主题切换时图表实时重绘
    try {
      this._lastAxisLabelColor = this.getAxisLabelColor()
      this._themePoll = setInterval(() => {
        try {
          const cur = this.getAxisLabelColor()
          if (cur !== this._lastAxisLabelColor) {
            this._lastAxisLabelColor = cur
            this.updateChart()
          }
        } catch (e) {}
      }, 300)
    } catch (e) {}
  },
  beforeDestroy() {
    this.disposeChart()
    this.destroyResizeObserver()
    window.removeEventListener('resize', this.resizeHandler)
    if (this._themePoll) {
      clearInterval(this._themePoll)
      this._themePoll = null
    }
  },
  watch: {
    categories() { this.updateChart() },
    barData: { handler() { this.updateChart() }, deep: true },
    lineData: { handler() { this.updateChart() }, deep: true },
    options: { handler() { this.updateChart() }, deep: true },
    direction() { this.updateChart() },
  },
  methods: {
    initChart() {
      try {
        const container = this.$refs.chartRoot
        if (!container) return

        if (this.chart) {
          this.chart.dispose()
        }

        this.chart = echarts.init(container)
        this.updateChart()

        // 彻底解决高度 0 问题
        setTimeout(() => {
          if (this.chart) {
            this.chart.resize()
          }
        }, 100)
      } catch (e) {
        console.warn('EChartBarLine init failed', e)
      }
    },
    initResizeObserver() {
      if (window.ResizeObserver && this.$refs.chartRoot) {
        this._resizeObserver = new ResizeObserver(() => {
          if (this.chart) {
            this.chart.resize()
          }
        })
        this._resizeObserver.observe(this.$refs.chartRoot)
      }
    },
    destroyResizeObserver() {
      if (this._resizeObserver) {
        this._resizeObserver.disconnect()
        this._resizeObserver = null
      }
    },
    disposeChart() {
      try {
        if (this.chart) {
          this.chart.dispose()
          this.chart = null
        }
      } catch (e) {}
    },
    resizeHandler() {
      if (this.chart && this.chart.resize) this.chart.resize()
    },
    // 根据文档根节点样式变量和 Vuex/localStorage 判断深色模式，返回轴标签颜色
    getAxisLabelColor() {
      try {
        const rootStyle = getComputedStyle(document.documentElement)
        const labelDark = (rootStyle.getPropertyValue('--color-label2-dark') || '').trim() || '#c3e2ff'
        const labelLight = (rootStyle.getPropertyValue('--color-label2-light') || '').trim() || '#666666'
        const isDark = !!(this.$store && this.$store.getters['theme/isDarkMode'])
        return isDark ? labelDark : labelLight
      } catch (e) {
        return '#9E9E9E'
      }
    },
    updateChart() {
      if (!this.chart) return
      if (this.isDataEmpty) {
        this.chart.clear()
        return
      }
      const effectiveLegendName = (this.options && this.options.legendName) || this.legendName || '账户余额'
      const effectiveSeries2Name = (this.options && this.options.series2Name) || this.series2Name || '交易笔数'
      const isHorizontal = this.direction === 'horizontal'

      // 主题判断
      let isDark = true
      try {
        const root = document && document.documentElement
        if (root && root.classList) {
          isDark = !root.classList.contains('is-light-mode')
        }
      } catch (e) {}

      const legendInactiveColor = isDark ? '#BCDEFF' : '#666666'
      const tooltipBarLabel = (this.options && this.options.tooltipBarName) || effectiveLegendName

      const visibleCfg = this.visibleY
      let showBarAxis = false
      let showLineAxis = false
      if (Array.isArray(visibleCfg)) {
        showBarAxis = visibleCfg.includes('bar')
        showLineAxis = visibleCfg.includes('line')
      } else if (visibleCfg === 'both') {
        showBarAxis = showLineAxis = true
      } else if (visibleCfg === 'bar') {
        showBarAxis = true
      } else {
        showLineAxis = true
      }

      // 构建 categoryAxis
      const categoryAxis = {
        type: 'category',
        data: this.categories || [],
        axisLabel: {
          color: '#9E9E9E',
          formatter: (value) => {
            if (value && value.length > this.xAxisMaxLength) {
              // 简单截断
              return value.substring(0, this.xAxisMaxLength - 1) + '..'
            }
            return value
          },
        },
        axisLine: {
          show: true,
          lineStyle: { color: '#636363' },
        },
        boundaryGap: true,
      }
      // 水平模式下，Y轴(分类轴)通常inverse=true，使得第一个数据在顶部
      if (isHorizontal) {
        categoryAxis.inverse = true
      }

      // 构建 Value Axes
      const valueAxisBar = {
        type: 'value',
        show: showBarAxis,
        name: this.showYAxisName && showBarAxis ? effectiveLegendName : '',
        // position determined by axis index usually, but explicit works too
        position: isHorizontal ? 'bottom' : 'left',
        axisLabel: { color: '#9E9E9E' },
        axisLine: { show: false },
        splitLine: {
          show: true,
          lineStyle: { color: '#636363' },
        },
      }

      const valueAxisLine = {
        type: 'value',
        show: showLineAxis,
        name: this.showYAxisName && showLineAxis ? effectiveSeries2Name : '',
        position: isHorizontal ? 'top' : (showBarAxis ? 'right' : 'left'),
        axisLabel: { color: '#9E9E9E' },
        axisLine: { show: false },
        splitLine: {
          show: !showBarAxis,
          lineStyle: { color: '#636363' },
        },
      }

      const yAxisArray = [valueAxisBar, valueAxisLine]

      // Gradient Coords
      const gradientCoords = isHorizontal ? [0, 0, 1, 0] : [0, 0, 0, 1]

      const baseOption = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderColor: '#00d4ff',
          textStyle: { color: '#fff' },
        },
        legend: {
          textStyle: { color: '#9E9E9E' },
          inactiveColor: legendInactiveColor,
          data: (function () {
            const arr = [effectiveLegendName]
            if ((this.lineData && this.lineData.length > 0) && showLineAxis) {
              arr.push(effectiveSeries2Name)
            }
            return arr
          }.bind(this))(),
        },
        grid: {
          left: '50px',
          right: '30px',
          top: '18%',
          bottom: '15%',
          containLabel: false,
        },
        // Assign axes dynamically based on direction
        xAxis: isHorizontal ? yAxisArray : categoryAxis,
        yAxis: isHorizontal ? categoryAxis : yAxisArray,
        series: [
          {
            name: effectiveLegendName,
            type: 'bar',
            yAxisIndex: 0,
            xAxisIndex: 0,
            data: this.barData || [],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(...gradientCoords, [
                { offset: 0, color: '#3FB4F0' },
                { offset: 1, color: '#086ED9' },
              ]),
            },
            barMaxWidth: this.barMaxWidth,
            z: 2,
          },
          ...((this.lineData && this.lineData.length > 0) ? [
            {
              name: effectiveSeries2Name,
              type: 'line',
              yAxisIndex: isHorizontal ? 0 : 1,
              xAxisIndex: isHorizontal ? 1 : 0,
              data: this.lineData || [],
              symbol: 'circle',
              symbolSize: 6,
              itemStyle: { color: '#FAC858' },
              lineStyle: { color: '#FAC858', width: 2 },
              z: 3,
            }] : []),
        ],
      }

      const option = Object.assign(baseOption, this.options)

      // Apply lineColor prop if provided (must happen after options merge)
      try {
        const effectiveLineColor = this.lineColor || (this.options && this.options.lineColor) || null
        if (effectiveLineColor && option.series && option.series[1]) {
          option.series[1].itemStyle = Object.assign({}, option.series[1].itemStyle, { color: effectiveLineColor })
          option.series[1].lineStyle = Object.assign({}, option.series[1].lineStyle, { color: effectiveLineColor })
        }
      } catch (e) {}

      // 修正 legend 合并 - 确保颜色不被覆盖
      if (this.options && this.options.legend) {
        const mergedLegend = Object.assign({}, option.legend, this.options.legend)
        // 保持 textStyle.color 为 #9E9E9E
        if (!mergedLegend.textStyle) {
          mergedLegend.textStyle = { color: '#9E9E9E' }
        } else if (!mergedLegend.textStyle.color) {
          mergedLegend.textStyle.color = '#9E9E9E'
        }
        option.legend = mergedLegend
      }

      // Tooltip Formatter
      try {
        const effectiveUnit = this.unit || (this.options && this.options.unit) || ''
        const effectiveLineUnit = this.lineUnit || (this.options && this.options.lineUnit) || ''
        const unitSuffix = effectiveUnit ? ' ' + effectiveUnit : ''
        const lineUnitSuffix = effectiveLineUnit ? ' ' + effectiveLineUnit : ''
        option.tooltip.formatter = function (params) {
          try {
            const axis = params && params[0] && params[0].axisValue ? params[0].axisValue : ''
            let lines = `<div style="margin-bottom:4px;font-weight:bold;">${axis}</div>`
            ;(params || []).forEach((p) => {
              if (!p) return
              p.marker = p.marker.replace('[object Object]', '#509AE2')
              const isBar = p.seriesName === effectiveLegendName
              const name = isBar ? tooltipBarLabel : p.seriesName
              const suffix = isBar ? unitSuffix : lineUnitSuffix
              const val = (typeof p.value !== 'undefined' ? p.value : (p.data && p.data.value)) || 0
              // Determine decimal places based on whether it's a bar (usually larger numbers) or line
              const decimals = isBar ? 2 : 0
              const formattedVal = formatNumber(val, decimals)
              lines += `<div style="display:flex;justify-content:space-between;align-items:center;">
                <span>${p.marker} ${name}:</span>
                <span style="margin-left:12px;font-weight:bold;">${formattedVal}${suffix}</span>
              </div>`
            })
            return lines
          } catch (e) { return '' }
        }
      } catch (e) {}

      try {
        this.chart.setOption(option, true)
      } catch (e) {
        console.warn('EChartBarLine setOption failed', e)
      }
    },
  },
}
</script>

<style scoped>
.echart-bar-line-wrapper {
  position: relative;
}
.no-data-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  font-weight: bold;
}
</style>


