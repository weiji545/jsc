<template>
  <div :style="{ width: size, height: height }" ref="chartRoot"></div>
</template>

<script>
import * as echarts from 'echarts'
import { formatNumber } from '@/utils/utils.js'

export default {
  name: 'EChartPieRing',
  props: {
    // data: array of { name, value }
    data: {
      type: Array,
      default: null,
    },
    // variant: 'pie' => 普通饼图, 'donut' => 环形（内半径非 0）
    variant: {
      type: String,
      default: 'pie',
    },
    size: {
      type: String,
      default: '100%',
    },
    height: {
      type: String,
      default: '100%',
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    // tooltip 中显示的单位（由父组件通过 panelsConfig 传入）
    unit: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      _themePoll: null,
      _lastTheme: null,
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
      this.initResizeObserver()
    })
    window.addEventListener('resize', this.resizeHandler)
  },
  beforeDestroy() {
    this.disposeChart()
    this.destroyResizeObserver()
    window.removeEventListener('resize', this.resizeHandler)
  },
  computed: {
    isDarkMode() {
      return this.$store.getters['theme/isDarkMode']
    }
  },
  watch: {
    data: {
      handler() {
        this.updateChart()
      },
      deep: true,
    },
    variant() {
      this.updateChart()
    },
    options: {
      handler() {
        this.updateChart()
      },
      deep: true,
    },
    isDarkMode: {
      handler() {
        this.updateChart()
      },
    },
  },
  methods: {
    initChart() {
      try {
        const container = this.$refs.chartRoot
        if (!container) return
        
        // 如果实例已存在，先销毁
        if (this.chart) {
          this.chart.dispose()
        }

        this.chart = echarts.init(container)
        this.updateChart()

        // 核心修复：即使初始尺寸为0，也要在下个宏任务强制 resize 一次
        // 这能解决某些由于 flex/grid 还没结算完成导致的尺寸问题
        setTimeout(() => {
          if (this.chart) {
            this.chart.resize()
          }
        }, 100)
      } catch (e) {
        console.warn('EChartPieRing init failed', e)
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
      if (this.chart) {
        this.chart.dispose()
        this.chart = null
      }
    },
    resizeHandler() {
      if (this.chart && this.chart.resize) this.chart.resize()
    },
    getThemeColors() {
      try {
        const isLight = !this.$store.getters['theme/isDarkMode']
        const rootStyle = getComputedStyle(document.documentElement)
        const labelLight = rootStyle.getPropertyValue('--color-label-light').trim() || '#666666'
        const titleDark = rootStyle.getPropertyValue('--color-title-dark').trim() || '#FFFFFF'
        return isLight ? labelLight : titleDark
      } catch (e) {
        return '#FFFFFF'
      }
    },
    updateChart() {
      if (!this.chart) return
      if (!Array.isArray(this.data) || this.data.length === 0) {
        this.chart.setOption({ series: [] }, true)
        return
      }
      const isDonut = this.variant === 'donut'
      // 为 legend/tooltip 格式化使用当前 data 的值，通过闭包传入 dataList
      const dataList = this.data || []
      const unit = this.unit || ''
      
      // 统一判定“空”数据的辅助函数
      const isEmpty = (v) => v === null || v === undefined || v === ''

      let totalValue = 0
      dataList.forEach(d => {
        if (!isEmpty(d.value)) {
          totalValue += Number(d.value)
        }
      })

      const legendFormatter = function (name) {
        const it = dataList.find((d) => d.name === name)
        if (!it) return name
        // const displayValue = isEmpty(it.value) ? '-' : formatNumber(it.value)
        
        // ECharts 4.8.0 不支持 overflow: 'truncate'，在此处手动处理截断
        let displayName = name
        // 阈值设为 6，大约对应原本设置的 width: 50
        if (displayName && displayName.length > 5) {
          displayName = displayName.substring(0, 5) + '..'
        }
        
        // 使用 rich 文本标记，配合 legend.textStyle.rich 进行对齐
        // return `{name|${displayName}} {value|${displayValue}}`
        return `{name|${displayName}}`
      }
      const defaultOption = {
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            // params: 单点数据对象
            // 获取原始数值以便判定是否显示 '-'
            const rawValue = params.data && Object.prototype.hasOwnProperty.call(params.data, 'originalValue') 
              ? params.data.originalValue 
              : params.value
            
            const displayValue = isEmpty(rawValue) ? '-' : formatNumber(rawValue)
            const unitStr = unit ? ' ' + unit : ''
            const str = `
              ${params.name}</br>
              数量: ${displayValue}${unitStr}</br>
              占比: ${params.percent}%
              `
            // ${params.marker}
            return str
          },
        },
        // 默认显示 legend，支持翻页
        legend: {
          show: true,
          type: 'scroll',
          orient: 'vertical',
          left: '80%',
          align: 'left',
          top: 'middle',
          itemWidth: 14,
          itemHeight: 14,
          formatter: legendFormatter,
          textStyle: {
            color: this.getThemeColors(),
            fontSize: 12,
            rich: {
              name: {
                width: 36,
              },
              value: {
                width: 36,
              },
            },
          },
          // 开启 legend tooltip，方便用户看到被截断的完整文字
          tooltip: {
            show: true,
            formatter: function (params) {
              const name = params.name
              const it = dataList.find((d) => d.name === name)
              if (!it) return name
              const displayValue = isEmpty(it.value) ? '-' : formatNumber(it.value)
              const unitStr = unit ? ' ' + unit : ''

              let percentStr = '0.00%'
              const valNum = !isEmpty(it.value) ? Number(it.value) : 0
              if (totalValue > 0) {
                percentStr = ((valNum / totalValue) * 100).toFixed(2) + '%'
              }

              return `${name}<br/>数量: ${displayValue}${unitStr}<br/>占比: ${percentStr}`
            },
          },
          height: '85%', // 增加纵向可用高度
          pageButtonItemGap: 5,
          pageButtonGap: 10,
          pageIconColor: '#29F1FA',
          pageIconInactiveColor: '#666',
          pageIconSize: 12,
          pageTextStyle: {
            color: this.getThemeColors(),
            fontSize: 12,
          },
        },
        series: [
          {
            name: 'pie',
            type: 'pie',
            radius: isDonut ? ['38%', '63%'] : ['0%', '63%'],
            center: ['38%', '53%'],
            avoidLabelOverlap: true,
            label: {
              show: true,
              formatter: (params) => {
                const rawValue = params.data && Object.prototype.hasOwnProperty.call(params.data, 'originalValue')
                  ? params.data.originalValue
                  : params.value
                return isEmpty(rawValue) ? `${params.name}: -` : `${params.name}: ${params.percent}%`
              },
              color: this.getThemeColors(),
            },
            labelLine: {
              length: 5,
              smooth: false,
            },
            color: [
              '#FAC858',
              '#097C38',
              '#91CC75',
              '#507AFC',
              '#93BEFF',
              '#283E81',
            ],
            data: dataList.map(it => ({
              ...it,
              originalValue: it.value,
              value: isEmpty(it.value) ? 0 : it.value
            })),
          },
        ],
      }
      let option = Object.assign({}, defaultOption)
      if (this.options && typeof this.options === 'object') {
        if (Array.isArray(this.options.series) && this.options.series[0]) {
          option.series[0] = Object.assign(
            {},
            option.series[0],
            this.options.series[0],
          )
        }
        // 合并顶层配置：对 tooltip 与 legend 做合并以保留默认 formatter/formatter 函数
        Object.keys(this.options).forEach((k) => {
          if (k === 'series') return
          if (
            k === 'tooltip' &&
            this.options.tooltip &&
            typeof this.options.tooltip === 'object' &&
            option.tooltip &&
            typeof option.tooltip === 'object'
          ) {
            option.tooltip = Object.assign({}, option.tooltip, this.options.tooltip)
            return
          }
          if (
            k === 'legend' &&
            this.options.legend &&
            typeof this.options.legend === 'object' &&
            option.legend &&
            typeof option.legend === 'object'
          ) {
            option.legend = Object.assign({}, option.legend, this.options.legend)
            return
          }
          option[k] = this.options[k]
        })
      }
      // 如果用户在顶层 options 中传入 color 数组，要优先用于 series 的颜色
      // 默认 option.series[0].color 会覆盖顶层 color，故在此处将其同步到 series[0].color
      if (this.options && Array.isArray(this.options.color)) {
        const series0 = option.series && option.series[0]
        if (series0) {
          series0.color = this.options.color
        } else {
          option.color = this.options.color
        }
      }
      // donut 模式下，要求用户在 options.series[0].label 中传入 label 配置以控制 label 展示
      if (isDonut) {
        const series0 = option.series && option.series[0]
        const hasLabelConfig =
          series0 && series0.label && Object.keys(series0.label).length > 0
        if (hasLabelConfig) {
          series0.label = Object.assign({ show: true }, series0.label)
        } else {
          // 未提供 label 配置：禁用 label 并给出提示，避免展示不合适的默认文本
          if (series0)
            series0.label = Object.assign({}, series0.label || {}, {
              show: false,
            })
          console.warn(
            'EChartPieRing: variant="donut" requires label config in options.series[0].label to display labels',
          )
        }
      }
      try {
        this.chart.setOption(option, true)
      } catch (e) {
        console.warn('EChartPieRing setOption failed', e)
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
