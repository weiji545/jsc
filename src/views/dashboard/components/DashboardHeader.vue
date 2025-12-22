<template>
  <div class="dashboard-header" :class="{ 'is-dark': isDarkMode, 'is-light': !isDarkMode }">
    <!-- 左侧：模块切换选项 -->
    <div class="header-left">
      <div
        v-for="item in modules"
        :key="item.value"
        class="header-tab"
        :class="{
          'header-tab--active': currentModule === item.value,
          'header-tab--disabled': item.disabled
        }"
        @click="handleTabClick(item)"
      >
        {{ item.label }}
      </div>
    </div>

    <!-- 中间：标题 -->
    <div class="header-center">
      <div class="dashboard-title"></div>
    </div>

    <!-- 右侧：功能按钮 -->
    <div class="header-right">
      <!-- 全屏切换按钮 -->
      <el-button
        circle
        size="small"
        @click="toggleFullscreen"
        class="header-btn"
      >
        <img v-if="!isFullscreen" :src="fullScreenIcon" class="fullscreen-icon" alt="全屏" />
        <img v-else :src="fullScreenIconShrink" class="fullscreen-icon" alt="取消全屏" />
      </el-button>

      <!-- 当前时间 -->
      <div class="time-display">
        <span class="time">{{ currentTime.time }}</span>
        <span class="date">{{ currentTime.date }}</span>
      </div>

      <!-- 货币下拉框 -->
      <el-select
        class="accent-select"
        v-model="currency"
        size="small"
        :popper-append-to-body="true"
        popper-class="jsc-highest-popper"
        style="width: 100px; margin: 0 10px;"
      >
        <el-option label="RMB" value="RMB"></el-option>
        <el-option label="DOLLAR" value="DOLLAR"></el-option>
      </el-select>

      <!-- 深色模式切换 -->
      <el-switch
        :value="isDarkMode"
        active-text="深"
        inactive-text="浅"
        active-color="#00d4ff"
        inactive-color="#ccc"
        @change="toggleDarkMode"
      />
    </div>
  </div>
</template>

<script>
import headlineImg from '@/views/dashboard/img/headline.png'
import fullScreenIcon from '@/views/dashboard/img/full-screen-icon.png'
import fullScreenIconShrink from '@/views/dashboard/img/full-screen-icon-shrink.png'

export default {
  name: 'DashboardHeader',
  props: {},
  data() {
    return {
      headlineImg,
      fullScreenIcon,
      fullScreenIconShrink,
      // 当前选中模块
      currentModule: 'overView',
      isFullscreen: false,
      currentTime: {
        time: '',
        date: ''
      },
      timeTimer: null,
      // 模块配置
      modules: [
        { label: '总览', value: 'overView', disabled: false },
        { label: '账户管理', value: 'module2', disabled: true },
        { label: '资金管理', value: 'module3', disabled: true }
      ]
    }
  },
  computed: {
    isDarkMode() {
      try {
        return !!(this.$store && this.$store.getters && this.$store.getters['theme/isDarkMode'])
      } catch (e) {
        return true
      }
    }
    ,
    // 货币使用 Vuex 全局状态，computed 双向绑定以便 v-model 使用
    currency: {
      get() {
        try {
          return this.$store && this.$store.getters && this.$store.getters['currency/selectedCurrency']
            ? this.$store.getters['currency/selectedCurrency']
            : 'RMB'
        } catch (e) {
          return 'RMB'
        }
      },
      set(val) {
        if (this.$store && this.$store.dispatch) {
          this.$store.dispatch('currency/setCurrency', val)
        }
        this.$emit('currency-change', val)
      }
    }
  },
  mounted() {
    this.updateTime()
    this.timeTimer = setInterval(() => {
      this.updateTime()
    }, 1000)
  },
  beforeDestroy() {
    if (this.timeTimer) {
      clearInterval(this.timeTimer)
    }
  },
  methods: {
    // 处理顶部三个选项点击
    handleTabClick(item) {
      if (item.disabled) return
      if (this.currentModule === item.value) return
      this.currentModule = item.value
      this.handleModuleChange(item.value)
    },
    // 更新当前时间
    updateTime() {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      this.currentTime.time = `${hours}:${minutes}:${seconds}`

      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      this.currentTime.date = `${year}年${month}月${day}日`
    },
    // 模块切换
    handleModuleChange(value) {
      this.$emit('module-change', value)
    },
    // 全屏切换
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
          this.isFullscreen = true
        }).catch(err => {
          console.error('全屏失败:', err)
        })
      } else {
        document.exitFullscreen().then(() => {
          this.isFullscreen = false
        }).catch(err => {
          console.error('退出全屏失败:', err)
        })
      }
    },
    // 深色模式切换
    toggleDarkMode(val) {
      // 使用 Vuex action 统一写入 state 与 localStorage
      if (this.$store && this.$store.dispatch) {
        this.$store.dispatch('theme/setDarkMode', val)
      }
      this.$emit('dark-mode-change', val)
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-header {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  background-image: url("../img/headline.png");
  background-size: 1246px 100%;
  background-position: center center;
  background-repeat: no-repeat;

  // 深色模式
  &.is-dark {
    background-color: rgba(2, 13, 42, 0.1);
  }

  // 浅色模式
  &.is-light {
    background-color: rgba(9, 109, 217, 1);
  }
}

.header-left {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  // 距离页面最左侧 67px (header 左边 padding 30px, 这里再往右 37px)
  margin-left: 37px;
}

.header-tab {
  font-size: 20px;
  color: #93c5ff;
  cursor: pointer;
  font-weight: normal;
  user-select: none;
}

// 选项间隔 52px
.header-tab + .header-tab {
  margin-left: 52px;
}

.header-tab--active {
  color: #ffffff;
  font-weight: bold;
}

.header-tab--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dashboard-title {
  margin: 0;
}

.header-right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;

  &::v-deep .el-switch__label.is-active {
    color: #ffffff;
  }

}

.header-btn {
  background: transparent !important;
  border: none !important;
  color: #fff;
  cursor: pointer;
  padding: 0;
  margin-right: -10px;

  &:hover {
    background: transparent !important;
    border: none !important;
    color: #fff;
  }

  &:focus {
    background: transparent !important;
    border: none !important;
  }
}

.time-display {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin: 0 10px;
  color: #fff;

  .time {
    font-size: 18px;
    font-weight: bold;
    line-height: 1.2;
  }

  .date {
    font-size: 12px;
    opacity: 0.8;
    line-height: 1.2;
  }
}

.fullscreen-icon {
  width: 50%;
  height: 50%;
  object-fit: contain;
  display: block;
  margin: 0 auto;
  cursor: pointer;
}

// Element UI 样式覆盖
::v-deep .el-radio-button__inner {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}

::v-deep .el-radio-button__orig-radio:checked + .el-radio-button__inner {
  background: rgba(0, 212, 255, 0.3);
  border-color: rgba(0, 212, 255, 0.5);
  color: #00d4ff;
}

::v-deep .el-select {
  .el-input__inner {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: #fff;
  }

  .el-input__suffix {
    .el-input__suffix-inner {
      color: #fff;
    }
  }
}

.accent-select {
  ::v-deep .el-input__inner {
    background: rgba(0,152,250,0.45);
    border: 1px solid #0098FA;
    color: #BCDEFF;
    font-size: 14px;
    //background: linear-gradient(135deg, rgba(0, 212, 255, 0.25), rgba(91, 141, 239, 0.25));
    //color: #fff;
    //border-color: rgba(0, 212, 255, 0.5);
  }

  ::v-deep .el-input__suffix {
    color: #fff;
  }
}
</style>

<style lang="scss">
.jsc-highest-popper,
.jsc-highest-popper.el-popper,
.jsc-highest-popper.el-select-dropdown {
  z-index: 20000 !important;
}
</style>

