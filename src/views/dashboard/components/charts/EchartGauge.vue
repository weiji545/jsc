<template>
  <div
    ref="chart"
    :style="{ width: width, height: height }"
    class="echart-gauge"
  ></div>
</template>

<script>
import echarts from 'echarts'

export default {
  name: 'EchartGauge',
  props: {
    value: { type: Number, default: 0 },
    width: { type: String, default: '100%' },
    height: { type: String, default: '170px' },
    options: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      chart: null,
    }
  },
  mounted() {
    // 防止重复初始化
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
    this.initChart()
    window.addEventListener('resize', this.resize)
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
    window.removeEventListener('resize', this.resize)
  },
  watch: {
    value() {
      this.setOption()
    },
    options: {
      handler() {
        this.setOption()
      },
      deep: true,
    },
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chart)
      this.setOption()
    },
    setOption() {
      const value = Math.round(this.value)
      const dataArr = [{ value, name: '支付资金占比' }]

      const color = new echarts.graphic.LinearGradient(0, 0, 1, 0, [
        { offset: 0, color: '#61AFDC' },   // 起始浅蓝
        { offset: 0.3, color: '#6CC2D7' }, // 快速进入过渡青
        { offset: 0.7, color: '#6CC2D7' }, // 保持过渡青
        { offset: 1, color: '#85F2CC' }    // 结束浅绿
      ])

      const colorSet = [
        [value / 100, color],
        [1, '#15337C'],
      ]

      const rich = {
        white: {
          fontSize: 24,
          color: '#fff',
          fontWeight: '500',
          padding: [-20, 0, 0, 0],
        },
        bule: {
          fontSize: 24,
          fontFamily: 'DINBold',
          color: '#fff',
          fontWeight: '700',
          padding: [-10, 0, 0, 0],
        },
        text: {
          width: 82,
          height: 16,
          fontSize: 12,
          color: '#24C4DA',
          textAlign: 'center',
          lineHeight: 16,
        },
        size: {
          height: 0,
          padding: [90, 0, 0, 0],
        },
      }

      const option = {
        series: [
          {
            type: 'gauge',
            radius: '70%',
            startAngle: '225',
            endAngle: '-45',
            pointer: { show: false },
            detail: {
              formatter: function (val) {
                const num = Math.round(val)
                return (
                  '{bule|' +
                  num +
                  '}{white|%}' +
                  '{size|' +
                  '}\n{text|支付资金占比}'
                )
              },
              rich: rich,
              offsetCenter: ['0%', '0%'],
            },
            data: dataArr,
            title: { show: false },
            axisLine: {
              show: true,
              lineStyle: {
                color: colorSet,
                width: 8,
                opacity: 1,
              },
            },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
          }],
      }

      const merged = Object.assign({}, option, this.options || {})
      if (this.chart) {
        this.chart.setOption(merged, true)
      }
    },
    resize() {
      if (this.chart) this.chart.resize()
    },
  },
}
</script>

<style scoped>
.echart-gauge {
  display: block;
  background-image: url("../../img/gauge-bg.png");
  background-size: 80% 80%;
  background-position: center;
  background-repeat: no-repeat;
}
</style>


