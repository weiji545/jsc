<template>
  <div class="dashboard-outer">
    <div class="dashboard-screen" :style="screenStyle">
      <div class="dashboard-container" :class="isDarkMode ? 'is-dark-mode' : 'is-light-mode'">
        <!-- Header 部分 -->
        <DashboardHeader
          @module-change="handleModuleChange"
          @currency-change="handleCurrencyChange"
        />

        <!-- 根据当前模块显示对应的页面 -->
        <component :is="currentModuleComponent" />
      </div>
    </div>
  </div>
</template>

<script>
import DashboardHeader from './components/DashboardHeader.vue'
import OverView from './modules/OverView.vue'
import Module2 from './modules/Module2.vue'
import Module3 from './modules/Module3.vue'

export default {
  name: 'Dashboard',
  components: {
    DashboardHeader,
    OverView,
    Module2,
    Module3
  },
  data() {
    return {
      currentModule: 'overView',
      currency: 'RMB',
      baseWidth: 1920,
      baseHeight: 1080,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      rafId: null
    }
  },
  provide() {
    // 兼容老组件使用 inject 的方式，提供一个基于 Vuex 的 getter
    return {
      getIsDarkMode: () => {
        try {
          return this.$store && this.$store.getters && typeof this.$store.getters['theme/isDarkMode'] !== 'undefined'
            ? this.$store.getters['theme/isDarkMode']
            : true
        } catch (e) {
          return true
        }
      }
    }
  },
  computed: {
    isDarkMode() {
      try {
        return this.$store && this.$store.getters && typeof this.$store.getters['theme/isDarkMode'] !== 'undefined'
          ? this.$store.getters['theme/isDarkMode']
          : true
      } catch (e) {
        return true
      }
    },
    // 根据当前模块返回对应的组件
    currentModuleComponent() {
      const moduleMap = {
        overView: OverView,
        module2: Module2,
        module3: Module3
      }
      return moduleMap[this.currentModule] || OverView
    },
    screenStyle() {
      const translate = `translate(${this.offsetX}px, ${this.offsetY}px)`
      const scale = `scale(${this.scale})`
      return {
        transform: `${translate} ${scale}`,
        transformOrigin: 'left top',
        // expose current scale as a CSS variable so children can cancel it if needed
        '--global-scale': this.scale
      }
    }
  },
  mounted() {
    this.updateScale()
    window.addEventListener('resize', this.queueUpdateScale, { passive: true })
    document.addEventListener('fullscreenchange', this.queueUpdateScale)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.queueUpdateScale)
    document.removeEventListener('fullscreenchange', this.queueUpdateScale)
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  },
  methods: {
    handleModuleChange(module) {
      this.currentModule = module
      console.log('切换到模块:', module)
    },
    handleCurrencyChange(currency) {
      this.currency = currency
      console.log('切换货币:', currency)
    },
    // 深色模式由 Vuex 管理，组件无需再处理本地状态
    queueUpdateScale() {
      if (this.rafId) return
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null
        this.updateScale()
      })
    },
    updateScale() {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const scale = Math.min(vw / this.baseWidth, vh / this.baseHeight)
      this.scale = Number(scale.toFixed(4))
      this.offsetX = (vw - this.baseWidth * this.scale) / 2
      this.offsetY = (vh - this.baseHeight * this.scale) / 2
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-outer {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  //background: linear-gradient( 90deg, #08194E 0%, #083391 51%, #000F35 100%), #FFFFFF;
  background-image: url("./img/bg.png");
}

.dashboard-screen {
  width: 1920px;
  height: 1080px;
}

.dashboard-container {
  width: 100%;
  height: 100%;
  background-size: 100% 100%;
  color: #fff;
  display: flex;
  flex-direction: column;
  font-family: 'Microsoft YaHei', '微软雅黑', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
</style>

