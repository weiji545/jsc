<template>
  <div class="dashboard-outer" :class="{'white-bg': !isDarkMode}">
    <div class="dashboard-screen" :style="screenStyle">
      <div class="dashboard-container" :class="isDarkMode ? 'is-dark-mode' : 'is-light-mode'">
        <!-- Header 部分 -->
        <DashboardHeader
          :active-module="currentModule"
          @module-change="handleModuleChange"
          @currency-change="handleCurrencyChange"
        />

        <!-- 根据当前模块显示对应的页面 -->
        <component :is="currentModuleComponent" :key="currency" />
      </div>
    </div>
  </div>
</template>

<script>
import DashboardHeader from './components/layout/DashboardHeader.vue'
import OverView from './modules/OverView.vue'
import AccountManagement from './modules/AccountManagement.vue'
import Module3 from './modules/Module3.vue'

export default {
  name: 'Dashboard',
  components: {
    DashboardHeader,
    OverView,
    AccountManagement,
    Module3
  },
  data() {
    return {
      currentModule: 'AccountManagement',
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
        AccountManagement: AccountManagement,
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
  watch: {
    '$route.path': {
      handler() {
        const path = this.$route.path
        if (path === '/accountManagement') {
          this.currentModule = 'AccountManagement'
        } else if (path === '/overview') {
          this.currentModule = 'overView'
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.updateScale()
    window.addEventListener('resize', this.queueUpdateScale, { passive: true })
    document.addEventListener('fullscreenchange', this.queueUpdateScale)
    document.addEventListener('webkitfullscreenchange', this.queueUpdateScale)
    document.addEventListener('mozfullscreenchange', this.queueUpdateScale)
    document.addEventListener('MSFullscreenChange', this.queueUpdateScale)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.queueUpdateScale)
    document.removeEventListener('fullscreenchange', this.queueUpdateScale)
    document.removeEventListener('webkitfullscreenchange', this.queueUpdateScale)
    document.removeEventListener('mozfullscreenchange', this.queueUpdateScale)
    document.removeEventListener('MSFullscreenChange', this.queueUpdateScale)
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  },
  methods: {
    handleModuleChange(module) {
      if (this.currentModule === module) return
      this.currentModule = module
      console.log('切换到模块:', module)
      
      let path = '/overview'
      if (module === 'AccountManagement') {
        path = '/accountManagement'
      } else if (module === 'overView') {
        path = '/overview'
      }
      
      this.$router.push({
        path: path,
        query: this.$route.query 
      }).catch(err => {
        if (err.name !== 'NavigationDuplicated') {
          console.warn(err)
        }
      })
    },
    handleCurrencyChange(currency) {
      this.currency = currency
      console.log('切换货币:', currency)
    },
    queueUpdateScale() {
      if (this.rafId) return
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null
        this.updateScale()
      })
    },
    updateScale() {
      const containerWidth = this.$el ? this.$el.clientWidth : window.innerWidth
      const scale = containerWidth / this.baseWidth
      this.scale = Number(scale.toFixed(4))
      this.offsetX = 0
      this.offsetY = 0
      this.$nextTick(() => {
        this.$emit('scale-changed')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-outer {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  //background: linear-gradient( 90deg, #08194E 0%, #083391 51%, #000F35 100%), #FFFFFF;
  background-image: url("./img/bg.png");
}

.white-bg {
  background-image: url("./img/white-bg.png");
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

