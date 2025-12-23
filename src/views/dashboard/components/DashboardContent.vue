<template>
  <div class="dashboard-content">
    <!-- 左侧区域：455px -->
    <div class="content-left">
      <CardPanel style="height: 318px;" :title="getPanelTitle('left',0)" :unit="getPanelUnit('left',0)" :showBottomCorner="getPanelShowBottomCorner('left',0)" class="content-item">
        <template #title>
          <span>{{ getPanelTitle('left',0) }}</span>
        </template>
        <div class="panel-content">
          <!-- 左侧上方内容插槽 -->
          <slot name="left-top"></slot>
        </div>
      </CardPanel>

      <CardPanel :title="getPanelTitle('left',1)" :unit="getPanelUnit('left',1)" :showBottomCorner="getPanelShowBottomCorner('left',1)" class="content-item">
        <template #title>
          <span>{{ getPanelTitle('left',1) }}</span>
        </template>
        <div class="panel-content">
          <!-- 左侧中间内容插槽 -->
          <slot name="left-middle"></slot>
        </div>
      </CardPanel>

      <CardPanel :title="getPanelTitle('left',2)" :unit="getPanelUnit('left',2)" :showBottomCorner="getPanelShowBottomCorner('left',2)" class="content-item">
        <template #title>
          <span>{{ getPanelTitle('left',2) }}</span>
        </template>
        <div class="panel-content">
          <!-- 左侧下方内容插槽 -->
          <slot name="left-bottom"></slot>
        </div>
      </CardPanel>
    </div>

    <!-- 中间区域：50% -->
    <div class="content-center">
      <!-- 核心区域（上方） -->
      <div class="center-top">
        <!-- 数据展示区域 -->
        <div class="data-display">
          <div class="data-item" v-for="(item, index) in dataList" :key="index">
            <div class="data-content">
              <div class="data-number">{{ formatNumber(item.value, item.decimals || 0) }}</div>
              <div class="data-label">{{ item.label }}</div>
            </div>
          </div>
        </div>
        <!-- 核心区域内容插槽 -->
        <div class="center-top-content">
          <slot name="center-top"></slot>
        </div>
      </div>

      <!-- 下层区域 -->
      <div class="center-bottom">
        <CardPanel :title="panelsConfig.center.title" :unit="panelsConfig.center.unit" class="center-bottom-panel" :titleGap="0" :is-long="true" :showBottomCorner="getPanelShowBottomCorner('center',0)">
          <template #title>
            <slot name="center-bottom-title">
              <span>{{ panelsConfig.center.title }}</span>
            </slot>
          </template>
          <!-- center-bottom 专属的 title-tabs（包含周/月 单选与两个文字按钮） -->
          <template #title-tabs>
            <div class="title-tabs-wrapper">
              <div class="period-switch">
                <label><input type="radio" name="centerPeriod" value="week" v-model="centerPeriod" />周</label>
                <label><input type="radio" name="centerPeriod" value="month" v-model="centerPeriod" />月</label>
              </div>
              <div class="text-toggle">
                <button type="button" :class="['text-btn', { selected: centerMode === 'a' }]" @click="centerMode = 'a'">资金交易趋势</button>
                <button type="button" :class="['text-btn', { selected: centerMode === 'b' }]" @click="centerMode = 'b'">大额支付</button>
              </div>
            </div>
          </template>
          <div class="panel-content">
            <!-- 下层区域内容插槽 -->
            <slot name="center-bottom"></slot>
          </div>
        </CardPanel>
      </div>
    </div>

    <!-- 右侧区域：455px -->
    <div class="content-right">
      <CardPanel style="height: 318px;" :title="getPanelTitle('right',0)" :unit="getPanelUnit('right',0)" :showBottomCorner="getPanelShowBottomCorner('right',0)" class="content-item">
        <template #title>
          <span>{{ getPanelTitle('right',0) }}</span>
        </template>
        <div class="panel-content">
          <!-- 右侧上方内容插槽 -->
          <slot name="right-top"></slot>
        </div>
      </CardPanel>

      <CardPanel :title="getPanelTitle('right',1)" :unit="getPanelUnit('right',1)" :showBottomCorner="getPanelShowBottomCorner('right',1)" class="content-item">
        <template #title>
          <span>{{ getPanelTitle('right',1) }}</span>
        </template>
        <div class="panel-content">
          <!-- 右侧中间内容插槽 -->
          <slot name="right-middle"></slot>
        </div>
      </CardPanel>

      <CardPanel :title="getPanelTitle('right',2)" :unit="getPanelUnit('right',2)" :showBottomCorner="getPanelShowBottomCorner('right',2)" class="content-item">
        <template #title>
          <span>{{ getPanelTitle('right',2) }}</span>
        </template>
        <div class="panel-content">
          <!-- 右侧下方内容插槽 -->
          <slot name="right-bottom"></slot>
        </div>
      </CardPanel>
    </div>
  </div>
</template>

<script>
import CardPanel from './CardPanel.vue'
import { formatNumber } from '../../../utils/utils.js'

export default {
  name: 'DashboardContent',
  components: {
    CardPanel
  },
  data() {
    // 中间下方面板的局部状态（周/月 与 文字按钮切换）
    return {
      centerPeriod: 'week',
      centerMode: 'a'
    }
  },
  props: {
    dataList: {
      type: Array,
      default: () => [
        { label: '', value: 0 },
        { label: '', value: 0 },
      ]
    },
    // panelsConfig: 可配置左右侧三个 panel 的 title/unit
    panelsConfig: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    formatNumber,
    // 安全读取 panelsConfig 中的 title 与 unit，若缺失返回空字符串
    getPanelTitle(side, idx) {
      try {
        return (this.panelsConfig && this.panelsConfig[side] && this.panelsConfig[side][idx] && this.panelsConfig[side][idx].title) || ''
      } catch (e) {
        return ''
      }
    },
    getPanelUnit(side, idx) {
      try {
        return (this.panelsConfig && this.panelsConfig[side] && this.panelsConfig[side][idx] && this.panelsConfig[side][idx].unit) || ''
      } catch (e) {
        return ''
      }
    }
    ,
    // 从 panelsConfig 中读取是否显示底部边角装饰，未配置时默认 false
    getPanelShowBottomCorner(side, idx) {
      try {
        return !!(this.panelsConfig && this.panelsConfig[side] && this.panelsConfig[side][idx] && this.panelsConfig[side][idx].showBottomCorner)
      } catch (e) {
        return false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-content {
  flex: 1;
  display: flex;
  gap: 15px;
  padding: 15px;
  overflow: hidden;
  height: calc(100vh - 80px);
}

// 左侧区域：固定宽度 455px
.content-left {
  width: 455px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  //gap: 15px;
  flex-shrink: 0;
}

// 中间区域：50%
.content-center {
  width: 50%;
  height: 100%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

// 核心区域（上方）
.center-top {
  flex: 1;
  min-height: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

// 数据展示区域
.data-display {
  position: absolute;
  top: -10px;
  left: 20px;
  right: 20px;
  z-index: 10;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 20px 0;
}

.data-item {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;

  // 第一个数据项数字颜色 #24D9B5
  &:nth-child(1) .data-number {
    color: #24D9B5;
  }

  // 第二个数据项数字颜色 #3AACFF
  &:nth-child(2) .data-number {
    color: #3AACFF;
  }

  // 第三个数据项数字颜色 #24D9B5（如果只有3个，可以循环使用）
  &:nth-child(3) .data-number {
    color: #24D9B5;
  }
  /* 浅色模式下统一为 #181818（全局 light 模式类或 card-panel.is-light 都会生效） */
  .is-light-mode .dashboard-content .data-number,
  :deep(.card-panel.is-light) .dashboard-content .data-number {
    color: #181818 !important;
  }
}

.data-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.data-number {
  font-size: 50px;
  font-weight: bold;
  line-height: 1.2;
  margin-bottom: 10px;
  text-align: left;
}

.data-label {
  font-size: 18px;
  /* 深色模式使用标题色变量 */
  color: var(--color-title-dark, #FFFFFF);
  text-align: left;
}

/* 浅色模式下 data-label 使用 --color-label-light */
.is-light-mode .dashboard-content .data-label,
:deep(.card-panel.is-light) .dashboard-content .data-label {
  color: var(--color-label-light, #666666) !important;
}

.center-top-content {
  flex: 1;
  overflow: auto;
  min-height: 0;
  margin-top: 0; // 移除之前的 margin，因为 data-display 已经定位了
}

// 下层区域（下方，高度约是两侧小部分的三分之二）
.center-bottom {
  height: 213px;
  flex-shrink: 0;
}

.center-bottom-panel {
  width: 100%;
  height: 100%;
}

// 右侧区域：固定宽度 455px
.content-right {
  width: 455px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  //gap: 15px;
  flex-shrink: 0;
}

// 左右两侧的卡片项 - 固定尺寸
.content-item {
  width: 455px;
  height: 302px;
  flex-shrink: 0;
}

.panel-content {
  width: 100%;
  height: 100%;
  overflow: auto;
}

// 响应式布局（可选，根据需求调整）
@media (max-width: 1600px) {
  .dashboard-content {
    gap: 10px;
    padding: 10px;
  }

  .content-left,
  .content-right {
    //gap: 10px;
  }
}

@media (max-width: 1366px) {
  .dashboard-title {
    font-size: 24px !important;
  }
}
</style>

