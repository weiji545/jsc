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
    // 可配置显示哪条 y 轴，支持 'bar' | 'line' | 'both' | ['bar','line']（默认仅显示折线的 y 轴）
    visibleY: {
      type: [String, Array],
      default: () => 'line'
    },
    // 是否显示 y 轴名称（提示文字），默认不显示
    showYAxisName: {
      type: Boolean,
      default: false
    },
    options: {
      type: Object,
      default: () => ({})
    }
    ,
    // 可直接通过该 prop 指定折线颜色（优先于内部默认颜色）
    lineColor: {
      type: String,
      default: null
    }
    ,
    // tooltip 显示的单位，父组件可通过 panelsConfig 传入
    unit: {
      type: String,
      default: ''
    }
    ,
    // 可选：覆盖第一个 y 轴的名称（例如境外模式下显示 '汇率'）
    yAxisName: {
      type: String,
      default: null
    }
    ,
    // 可选：第二序列（折线）显示名称，父组件可通过 options.series2Name 覆盖
    series2Name: {
      type: String,
      default: '交易笔数'
    }
    ,
    // 可选：图例 / 第一个序列显示名称（例如 '金额'），由父组件传入
    legendName: {
      type: String,
      default: '账户余额'
    }
  },
  data() {
    return {
      chart: null,
      op: {
        tooltip: { trigger: 'axis' },
        legend: { data: [{
            name: this.legendName || '账户余额',
            textStyle: { color: '#9E9E9E' }
          },{
            name: this.series2Name || '交易笔数',
            textStyle: { color: '#9E9E9E' }
          }] },
        grid: { left: 30, right: 30, top: 25, bottom: 20 ,borderColor:'#636363'},
        xAxis: { type: 'category', data: this.categories || [], axisLabel: { color: '#9E9E9E' } },
        yAxis: [
          { type: 'value', name: this.legendName || '账户余额', axisLabel: { color: '#636363' } },
          { type: 'value', name: this.series2Name || '交易笔数', axisLabel: { color: '#636363' } }
        ],
        series: [
          {
            name: this.legendName || '账户余额',
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
            name: this.series2Name || '交易笔数',
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
      },
      _lastAxisLabelColor: null,
      _themePoll: null
    }
  },
  mounted() {
    this.initChart()
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
    window.removeEventListener('resize', this.resizeHandler)
    try {
      if (this._themePoll) {
        clearInterval(this._themePoll)
        this._themePoll = null
      }
    } catch (e) {}
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
        const storeVal = this.$store && this.$store.getters && this.$store.getters['theme/isDarkMode']
        const lsVal = localStorage.getItem('isDarkMode')
        const isDark = typeof storeVal !== 'undefined'
          ? !!storeVal
          : lsVal
            ? lsVal === 'true' || lsVal === '1' || lsVal === 'dark'
            : true
        return isDark ? labelDark : labelLight
      } catch (e) {
        return '#9E9E9E'
      }
    },
    updateChart() {
      if (!this.chart) return
      const axisLabelColor = this.getAxisLabelColor()
      const effectiveLegendName = (this.options && this.options.legendName) || this.legendName || '账户余额'
      const effectiveSeries2Name = (this.options && this.options.series2Name) || this.series2Name || '交易笔数'
      // 主题判断：优先根据根节点 class（is-light-mode / is-dark-mode）判断，避免与其它存储产生不一致
      let isDark = true
      try {
        const root = document && document.documentElement
        if (root && root.classList) {
          isDark = !root.classList.contains('is-light-mode')
        } else {
          const storeVal = this.$store && this.$store.getters && this.$store.getters['theme/isDarkMode']
          const lsVal = localStorage.getItem('isDarkMode')
          isDark =
            typeof storeVal !== 'undefined'
              ? !!storeVal
              : lsVal
              ? lsVal === 'true' || lsVal === '1' || lsVal === 'dark'
              : true
        }
      } catch (e) {}
      const legendActiveColor = isDark ? '#29F1FA' : '#096DD9'
      const legendInactiveColor = isDark ? '#BCDEFF' : '#666666'
      const tooltipBarLabel = (this.options && this.options.tooltipBarName) || effectiveLegendName
      // 解析 visibleY 配置，确定是否显示 bar/line 的 y 轴（默认只显示折线 y 轴）
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

      // 构建 yAxis 配置，确保单轴时显示在左侧，不显示 name（除非 showYAxisName 为 true）
      const yAxisArray = []
      if (showBarAxis && showLineAxis) {
        yAxisArray.push({ name: this.showYAxisName ? effectiveLegendName : '', axisLabel: { color: axisLabelColor }, show: true, position: 'left' })
        yAxisArray.push({ name: this.showYAxisName ? effectiveSeries2Name : '', axisLabel: { color: axisLabelColor }, show: true, position: 'right' })
      } else if (showBarAxis) {
        yAxisArray.push({ name: this.showYAxisName ? effectiveLegendName : '', axisLabel: { color: axisLabelColor }, show: true, position: 'left' })
        yAxisArray.push({ name: '', axisLabel: { color: axisLabelColor }, show: false })
      } else if (showLineAxis) {
        yAxisArray.push({ name: '', axisLabel: { color: axisLabelColor }, show: false })
        yAxisArray.push({ name: this.showYAxisName ? effectiveSeries2Name : '', axisLabel: { color: axisLabelColor }, show: true, position: 'left' })
      } else {
        yAxisArray.push({ name: '', axisLabel: { color: axisLabelColor }, show: false })
        yAxisArray.push({ name: '', axisLabel: { color: axisLabelColor }, show: false })
      }

      yAxisArray.forEach(yAxis => {
        yAxis.type = 'value'
        yAxis.axisLine = {
          show: false // 隐藏背景网格线
        }
      })

      const option = Object.assign({
        tooltip: { trigger: 'axis' },
        legend: {
          textStyle: { color: legendActiveColor },
          inactiveColor: legendInactiveColor,
          data: (function () {
            const arr = [effectiveLegendName]
            if (showLineAxis) arr.push(effectiveSeries2Name)
            return arr
          })()
        },
        grid: { left: 30, right: 30, top: 25, bottom: 20, borderColor: '#636363' },
        xAxis: { type: 'category', data: this.categories || [], axisLabel: { color: axisLabelColor } },
        yAxis: yAxisArray,
        series: [
            {
            name: effectiveLegendName,
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
            name: effectiveSeries2Name,
            type: 'line',
            yAxisIndex: 1,
            data: this.lineData || [],
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: { color: '#24D9B5' },
            lineStyle: { color: '#24D9B5' },
            // areaStyle: {
            //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            //     { offset: 0, color: 'rgba(255, 209, 102, 0.3)' },
            //     { offset: 1, color: 'rgba(255, 209, 102, 0.05)' }
            //   ])
            // }
          }
        ]
      }, this.options)
      // 确保 legend 的颜色与显示项在合并 options 后仍然正确（覆盖用户传入的 legend 配置）
      try {
        option.legend = option.legend || {}
        option.legend.textStyle = Object.assign({}, option.legend.textStyle || {}, { color: legendActiveColor })
        option.legend.inactiveColor = option.legend.inactiveColor || legendInactiveColor
        option.legend.data = option.legend.data && option.legend.data.length ? option.legend.data : (showLineAxis ? [effectiveLegendName, effectiveSeries2Name] : [effectiveLegendName])
      } catch (e) {}
      // tooltip formatter：在账户余额与数量后追加单位（来自 prop unit 或 options.unit）
      try {
        const effectiveUnit = this.unit || (this.options && this.options.unit) || ''
        const unitSuffix = effectiveUnit ? ' ' + effectiveUnit : ''
        option.tooltip = option.tooltip || {}
        option.tooltip.formatter = function (params) {
          // params 为数组（按 axis），第一行为横坐标
          try {
            const axis = params && params[0] && params[0].axisValue ? params[0].axisValue : ''
            let lines = axis ? axis + '</br>' : ''
            ;(params || []).forEach((p) => {
              if (!p) return
              const name = p.seriesName === effectiveLegendName ? tooltipBarLabel : (p.seriesName === effectiveSeries2Name ? effectiveSeries2Name : '数量')
              const val = (typeof p.value !== 'undefined' ? p.value : (p.data && p.data.value)) || 0
              // ${p.marker}
              lines += `${name}: ${val}${unitSuffix}</br>`
            })
            return lines
          } catch (e) {
            return ''
          }
        }
      } catch (e) {}
      // 如果外部传入了 lineColor，则覆盖默认折线样式（保留 bar 的默认渐变）
      try {
        const effectiveLineColor = this.lineColor || (this.options && this.options.lineColor) || null
        if (effectiveLineColor && option.series && option.series[1]) {
          option.series[1].itemStyle = Object.assign({}, option.series[1].itemStyle, { color: effectiveLineColor })
          option.series[1].lineStyle = Object.assign({}, option.series[1].lineStyle, { color: effectiveLineColor })
          // 覆盖 areaStyle 为与折线颜色协调的渐变（半透明）
          // option.series[1].areaStyle = {
          //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          //     { offset: 0, color: 'rgba(253,204,0,0.25)' },
          //     { offset: 1, color: 'rgba(253,204,0,0.05)' }
          //   ])
          // }
        }
      } catch (e) {}
      // 如果传入了 yAxisName，则仅替换第一个轴的 name（保持自动构造的 yAxis 逻辑）
      try {
        if (this.yAxisName && option && Array.isArray(option.yAxis) && option.yAxis.length > 0) {
          option.yAxis = option.yAxis.map((ya, idx) => {
            if (idx === 0) {
              return Object.assign({}, ya, { name: this.yAxisName })
            }
            return ya
          })
        }
      } catch (e) {}
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


