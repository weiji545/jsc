<template>
  <div class="container">
    <div class="maps-container">
      <!-- 阴影地图 - 只用于显示阴影 -->
      <div ref="shadowMap" class="map-instance"></div>
      <!-- 主地图 - 用于交互和显示数据 -->
      <div ref="mainMap" class="map-instance"></div>
    </div>
  </div>
</template>
<script>
import * as echarts from 'echarts'
import chinaJson from './china.json'
export default {
  name: 'ChinaMap',
  props: {
    mapData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      highlightProvinces: [],
      currentHighlightIndex: 0,
      highlightInterval: 30000,
      isRotating: false,
      highlightTimer: null,
      outId: null,
      initTimerId: null,
      geojsonData: null,
      // mapData: [], // Removed as it is now a prop
    }
  },
  mounted() {
    if (this.mapData && this.mapData.length) {
      this.initMaps()
    }
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.highlightTimer) clearInterval(this.highlightTimer)
    if (this.outId) clearTimeout(this.outId)
    if (this.initTimerId) clearTimeout(this.initTimerId)

    // Dispose ECharts instances to prevent memory leaks
    if (this.shadowChart) {
      this.shadowChart.dispose()
      this.shadowChart = null
    }
    if (this.mainChart) {
      this.mainChart.dispose()
      this.mainChart = null
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
    mapData: {
      handler(val) {
        if (val && val.length) {
          this.initMaps()
        }
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
      if (this.mainChart) {
        this.mainChart.setOption({
          visualMap: {
            textStyle: {
              color: this.getThemeTitleColor(),
            },
          },
        })
      }
    },
    // fetchData() removed as data is now provided via props
    async initMaps() {
      // 注册地图数据
      echarts.registerMap('china', chinaJson)

      // 获取所有省份名称以补全 0 值数据
      const allProvinces = []
      chinaJson.features.forEach((feature) => {
        if (feature.properties && feature.properties.name) {
          allProvinces.push(feature.properties.name)
        }
      })

      // 将 API 数据与所有省份对齐，增加模糊匹配鲁棒性
      const finalData = allProvinces.map(name => {
        const item = (this.mapData || []).find(d =>
          name === d.name ||
          name.startsWith(d.name) ||
          d.name.startsWith(name)
        )
        // 保持 name 为 GeoJSON 中的标准名称，合并业务数据
        return item ? { ...item, name } : { name, value: 0 }
      })

      // 提取前三名作为轮播重点（只轮播有余额的城市）
      this.highlightProvinces = finalData
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 3)
        .map(item => item.name);

      this.currentHighlightIndex = 0;

      // ========== 初始化阴影地图 ==========
      const shadowDom = this.$refs.shadowMap
      if (!shadowDom) return
      this.shadowChart = echarts.init(shadowDom)

      const shadowOption = {
        backgroundColor: 'transparent',
        tooltip: {
          show: false, // 阴影层不显示tooltip
        },
        series: [
          {
            type: 'map',
            map: 'china',
            roam: false, // 不允许缩放和平移
            silent: true, // 不响应任何事件
            zoom: 1.2,
            center: [104.195397, 35.86166],
            label: {
              show: false, // 不显示标签
            },
            itemStyle: {
              areaColor: 'rgba(11, 79, 157, 0.6)', // 深色阴影
              borderColor: 'rgba(0, 0, 0, 0.8)',
              borderWidth: 1,
              shadowColor: 'rgba(0, 0, 0, 0.8)',
              shadowBlur: 10,
              shadowOffsetX: 5,
              shadowOffsetY: 5,
            },
            emphasis: {
              disabled: true, // 禁用高亮
            },
            select: {
              disabled: true, // 禁用选择
            },
            // data: allData.map(item => ({
            //   ...item,
            //   value: 0 // 阴影层不需要数据值
            // }))
          },
        ],
        // 移除不必要的组件
        visualMap: { show: false },
        legend: { show: false },
        grid: { show: false },
        xAxis: { show: false },
        yAxis: { show: false },
      }

      this.shadowChart.setOption(shadowOption)

      // ========== 初始化主地图 ==========
      const mainDom = this.$refs.mainMap
      if (!mainDom) return

      this.mainChart = echarts.init(mainDom)
      const mainOption = {
        backgroundColor: 'transparent',
        tooltip: {
          show: true,
          trigger: 'item',
          alwaysShowContent: true, // 确保轮播时内容不消失
          formatter: (params) => {
            // 尝试获取业务数据
            const businessData = params.data || {}
            const val = businessData.value !== undefined ? businessData.value : (params.value || 0)
            const count = businessData.count || 0
            return `
              <div style="
                padding: 16px;
                background: rgba(10, 25, 41, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 12px;
                border: 1px solid rgba(0, 212, 255, 0.4);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                min-width: 200px;
                color: #fff;
                font-family: inherit;
              ">
                <div style="
                  margin-bottom: 12px;
                  color: #00D4FF;
                  font-weight: bold;
                  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                  padding-bottom: 8px;
                  font-size: 16px;
                  display: flex;
                  align-items: center;
                ">
                  <span style="
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #FFDD33;
                    margin-right: 8px;
                    box-shadow: 0 0 8px #FFDD33;
                  "></span>
                  ${params.name}
                </div>
                <div style="margin: 8px 0; color: rgba(255,255,255,0.8); font-size: 14px; display: flex; justify-content: space-between;">
                  <span>账户数量:</span>
                  <span style="color: #00D4FF; font-weight: bold;">${count}</span>
                </div>
                <div style="margin: 8px 0; color: rgba(255,255,255,0.8); font-size: 14px; display: flex; justify-content: space-between;">
                  <span>账户余额:</span>
                  <span style="color: #FFDD33; font-weight: bold;">${(val / 10000).toFixed(2)} 万元</span>
                </div>
              </div>`
          },
          backgroundColor: 'transparent',
          borderWidth: 0,
          padding: 0,
          extraCssText: 'z-index: 999999; pointer-events: none;',
        },
        visualMap: {
          show: true,
          type: 'piecewise',
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
          bottom: 'left',
          itemWidth: 20,
          itemHeight: 20,
          itemGap: 6,
        },
        series: [
          {
            type: 'map',
            map: 'china',
            roam: false, // 禁用鼠标拖拽和缩放
            zoom: 1.2,
            center: [104.195397, 35.86166],
            label: {
              show: true,
              color: '#fff',
              fontSize: 11,
              fontWeight: 'normal',
            },
            itemStyle: {
              areaColor: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(78,156,239,0.3)',
                  },
                  {
                    offset: 1,
                    color: 'rgba(38,92,224,0.4)',
                  },
                ],
              },
              borderColor: 'rgba(40,110,202,0.8)',
              borderWidth: 1,
            },
            emphasis: {
              label: {
                show: true,
                color: '#FFDD33',
                fontSize: 14,
                fontWeight: 'bold',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: [3, 6],
                borderRadius: 4,
              },
              itemStyle: {
                // areaColor: {
                //   type: 'linear',
                //   x: 0,
                //   y: 0,
                //   x2: 0,
                //   y2: 1,
                //   colorStops: [{
                //     offset: 0,
                //     color: '#FFDD33'
                //   }, {
                //     offset: 1,
                //     color: '#FFBB11'
                //   }]
                // },
                areaColor: null,
                borderColor: '#FFB600',
                borderWidth: 1.5,
                shadowColor: 'rgba(255,221,51,0.5)',
                shadowBlur: 10,
              },
            },
            data: finalData,
          },
        ],
      }

      this.mainChart.setOption(mainOption)
      this.bindChartEvents()

      this.$nextTick(() => {
        if (this.shadowChart) {
          this.shadowChart.resize()
        }
        if (this.mainChart) {
          this.mainChart.resize()
        }
        
        // 延迟启动轮播，确保地图完全渲染完成
        if (this.initTimerId) clearTimeout(this.initTimerId)
        this.initTimerId = setTimeout(() => {
          this.startHighlight()
          this.initTimerId = null
        }, 500)
      })
    },
    formatNumber(num) {
      // if (num >= 100000000) {
      //   return (num / 100000000).toFixed(1) + '亿'
      // } else if (num >= 10000) {
      //   return (num / 10000).toFixed(1) + '万'
      // }
      return num.toString().toFixed(2) + '万'
    },
    bindChartEvents() {
      this.mainChart.on('mouseover', (params) => {
        if (this.outId) clearTimeout(this.outId)
        if (params.seriesType === 'map') {
          this.stopHighlight()
          // 手动触发高亮显示变化
          this.mainChart.dispatchAction({
            type: 'highlight',
            seriesIndex: 0,
            dataIndex: params.dataIndex
          })
        }
      })

      // 鼠标移出时恢复自动高亮
      this.mainChart.on('mouseout', (params) => {
        if (this.outId) clearTimeout(this.outId)
        if (params.seriesType === 'map') {
          // 先清除当前高亮
          this.clearCurrentHighlight()
          this.outId = setTimeout(() => {
            this.startHighlight()
          }, 3000) // 延迟3秒后恢复轮播
        }
      })

      // 同步两个地图的视图
      this.mainChart.on('georoam', (params) => {
        const mainOption = this.mainChart.getOption()
        const series = mainOption.series[0]

        if (series && series.zoom && series.center) {
          this.shadowChart.setOption({
            series: [
              {
                zoom: series.zoom,
                center: series.center,
              },
            ],
          })
        }
      })
    },
    startHighlight() {
      this.stopHighlight()

      // 确保从第一个省份开始
      this.currentHighlightIndex = 0
      
      this.isRotating = true
      this.highlightTimer = setInterval(() => {
        this.highlightNextProvince()
      }, this.highlightInterval)
      // 立即高亮第一个省份
      if (this.highlightProvinces.length > 0) {
        this.highlightSpecificProvince(this.highlightProvinces[0])
      }
    },
    stopHighlight() {
      if (this.highlightTimer) {
        clearInterval(this.highlightTimer)
        this.highlightTimer = null
      }
      this.isRotating = false
    },
    highlightNextProvince() {
      if (this.highlightProvinces.length === 0) return

      this.currentHighlightIndex =
        (this.currentHighlightIndex + 1) % this.highlightProvinces.length
      const provinceName = this.highlightProvinces[this.currentHighlightIndex]

      this.highlightSpecificProvince(provinceName)
    },
    highlightSpecificProvince(provinceName) {
      if (!this.mainChart) return
      
      // 验证省份是否在轮播列表中
      if (!this.highlightProvinces.includes(provinceName)) {
        console.warn('[ChinaMap] Province not in highlight list:', provinceName)
        return
      }

      // 先清除之前所有可能的高亮（防止堆叠）
      this.mainChart.dispatchAction({
        type: 'downplay',
        seriesIndex: 0
      });

      // 获取当前省份在数据中的索引
      const dataIndex = this.mainChart.getModel().getSeriesByIndex(0).getData().indexOfName(provinceName);

      if (dataIndex > -1) {
        // 高亮
        this.mainChart.dispatchAction({
          type: 'highlight',
          seriesIndex: 0,
          dataIndex: dataIndex
        });

        // 显式触发 Tooltip
        this.mainChart.dispatchAction({
          type: 'showTip',
          seriesIndex: 0,
          dataIndex: dataIndex
        });
      } else {
        console.warn('[ChinaMap] Province not found in map data:', provinceName)
      }
    },
    clearCurrentHighlight() {
      if (!this.mainChart) return
      
      this.mainChart.dispatchAction({
        type: 'downplay',
        seriesIndex: 0,
      })
      
      this.mainChart.dispatchAction({
        type: 'hideTip'
      })
    },
    handleResize() {
      if (this.shadowChart && typeof this.shadowChart.resize === 'function') {
        this.shadowChart.resize()
      }
      if (this.mainChart && typeof this.mainChart.resize === 'function') {
        this.mainChart.resize()
      }
    },
  },
}
</script>
<style scoped>
.container {
  /* position: relative;
      width: 1600px;
      height: 800px;
      margin: 20px; */
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
}

/* 地图容器 */
.maps-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 阴影地图容器 - 向下偏移形成阴影效果 */
.map-instance {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 阴影地图容器 - 向下偏移形成阴影效果 */
div[ref="shadowMap"], .map-instance:first-child {
  top: 15px;
  z-index: 1;
}

/* 主地图容器 - 正常位置 */
div[ref="mainMap"], .map-instance:last-child {
  top: 0;
  z-index: 2;
}

#shadow-map {
  position: absolute;
  top: 15px;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* 主地图容器 - 正常位置 */
#main-map {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

/* 控制面板 */
.control-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
  background: rgba(10, 22, 64, 0.9);
  backdrop-filter: blur(10px);
  padding: 15px;
  border-radius: 8px;
  color: white;
  width: 220px;
  border: 1px solid rgba(78, 156, 239, 0.3);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.control-panel h3 {
  margin-bottom: 10px;
  font-size: 16px;
  color: #4e9cef;
  text-align: center;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(78, 156, 239, 0.3);
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

button {
  padding: 10px;
  background: linear-gradient(135deg, #265ce0 0%, #1842a1 100%);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  flex: 1;
}

button:hover {
  background: linear-gradient(135deg, #3d6fe0 0%, #2652b1 100%);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(38, 92, 224, 0.3);
}

button:active {
  transform: translateY(0);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.highlight-info {
  margin: 10px 0;
}

.info-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 8px;
  border-radius: 4px;
  margin: 5px 0;
  border-left: 3px solid #4e9cef;
}

.current-province {
  color: #ffdd33;
  font-weight: bold;
  font-size: 14px;
}

.interval-control {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.interval-control label {
  display: block;
  margin-bottom: 5px;
  color: #4e9cef;
  font-size: 12px;
}

.interval-control input {
  width: 100%;
  padding: 6px;
  border-radius: 4px;
  border: 1px solid rgba(78, 156, 239, 0.5);
  background: rgba(255, 255, 255, 0.1);
  color: white;
}
</style>