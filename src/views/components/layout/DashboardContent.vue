<template>
  <div class="dashboard-content">
    <!-- 左侧区域：455px -->
    <div class="content-left">
      <CardPanel style="height: 318px;" :title="getPanelTitle('left',0)" :unit="getPanelUnit('left',0)" :showBottomCorner="getPanelShowBottomCorner('left',0)" :showCurrency="getPanelShowCurrency('left',0)" :actionLeft="getPanelAction('left',0,'actionLeft')" :actionRight="getPanelAction('left',0,'actionRight')" :contentPadding="getPanelContentPadding('left',0)" class="content-item" @action-left-change="onActionChange('left', 0, 'left', $event)" @action-right-change="onActionChange('left', 0, 'right', $event)">
        <template #title>
          <span>{{ getPanelTitle('left', 0) }}</span>
        </template>
        <template #action-left>
          <slot name="left-top-action-left"></slot>
        </template>
        <template #action-right>
          <slot name="left-top-action-right"></slot>
        </template>
        <div class="panel-content">
          <!-- 左侧上方内容插槽 -->
          <slot name="left-top"></slot>
        </div>
      </CardPanel>

      <CardPanel :title="getPanelTitle('left',1)" :unit="getPanelUnit('left',1)" :showBottomCorner="getPanelShowBottomCorner('left',1)" :showCurrency="getPanelShowCurrency('left',1)" :actionLeft="getPanelAction('left',1,'actionLeft')" :actionRight="getPanelAction('left',1,'actionRight')" :contentPadding="getPanelContentPadding('left',1)" class="content-item" @action-left-change="onActionChange('left', 1, 'left', $event)" @action-right-change="onActionChange('left', 1, 'right', $event)">
        <template #title>
          <span>{{ getPanelTitle('left', 1) }}</span>
        </template>
        <div class="panel-content">
          <!-- 左侧中间内容插槽 -->
          <slot name="left-middle"></slot>
        </div>
      </CardPanel>

      <CardPanel :title="getPanelTitle('left',2)" :unit="getPanelUnit('left',2)" :showBottomCorner="getPanelShowBottomCorner('left',2)" :showCurrency="getPanelShowCurrency('left',2)" :actionLeft="getPanelAction('left',2,'actionLeft')" :actionRight="getPanelAction('left',2,'actionRight')" :contentPadding="getPanelContentPadding('left',2)" class="content-item" @action-left-change="onActionChange('left', 2, 'left', $event)" @action-right-change="onActionChange('left', 2, 'right', $event)">
        <template #title>
          <span>{{ getPanelTitle('left', 2) }}</span>
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
      <div :class="['center-top', { 'has-global-bg': scope === 'global' || scope === 'overseas' }]">
        <!-- 数据展示区域 -->
        <div class="data-display">
          <div class="data-item" v-for="(item, index) in dataList" :key="index">
            <div class="data-content">
              <div class="data-number">
                <template v-if="item.unit === '万元'">
                  <span class="num-value" :style="{'font-size': dataList.length > 2 ? '40px' : '50px'}">{{ formatLargeNumber(item.value, item.decimals, true, item.unit).value }}</span>
                  <span class="num-suffix">{{ formatLargeNumber(item.value, item.decimals, true, item.unit).suffix }}</span>
                </template>
                <template v-else>
                  <span class="num-value" :style="{'font-size': dataList.length > 2 ? '40px' : '50px'}">{{ formatNumber(item.value, item.decimals || 0) }}</span>
                  <span class="num-suffix">{{ item.unit }}</span>
                </template>
              </div>
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
        <CardPanel :title="panelsConfig.center.title" :unit="centerBottomMode === null ? '' : panelsConfig.center.unit" class="center-bottom-panel" :isLong="true" :showBottomCorner="getPanelShowBottomCorner('center',0)" :showCurrency="getPanelShowCurrency('center',0)" :actionLeft="getPanelAction('center',0,'actionLeft')" :actionRight="getPanelAction('center',0,'actionRight')" :contentPadding="getPanelContentPadding('center',0)" @action-left-change="onActionChange('center', 0, 'left', $event)" @action-right-change="onActionChange('center', 0, 'right', $event)">
          <template #title>
            <slot name="center-bottom-title">
              <span>{{ panelsConfig.center.title }}</span>
            </slot>
          </template>
          <!-- center-bottom 专属的 title-tabs（包含周/月 单选与两个文字按钮） -->
          <template #title-tabs>
            <div class="title-tabs-wrapper">
              <div class="period-switch">
                <span style="opacity: 0.7">时间维度:</span>
                <span v-show="centerPeriodComputed === 'day'">天</span>
                <span v-show="centerPeriodComputed === 'month'">月</span>
<!--                <label><input type="radio" name="centerPeriod" value="day" v-model="centerPeriodComputed"/>天</label>-->
<!--                <label><input type="radio" name="centerPeriod" value="month" v-model="centerPeriodComputed"/>月</label>-->
                 <span v-if="centerBottomMode === null" style="margin-left: 20px; font-size: 12px; font-weight: 400; opacity: 1;">单位: {{ panelsConfig.center.unit }}</span>
              </div>
              <div class="text-toggle" v-if="centerBottomMode !== null">
                <button type="button" :class="['text-btn', { selected: centerBottomModeComputed === 'a' }]" @click="centerBottomModeComputed = 'a'">
                  资金交易趋势
                </button>
                <button type="button" :class="['text-btn', { selected: centerBottomModeComputed === 'b' }]" @click="centerBottomModeComputed = 'b'">
                  大额支付
                </button>
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
      <CardPanel style="height: 318px;" :title="getPanelTitle('right',0)" :unit="getPanelUnit('right',0)" :showBottomCorner="getPanelShowBottomCorner('right',0)" :showCurrency="getPanelShowCurrency('right',0)" :actionLeft="getPanelAction('right',0,'actionLeft')" :actionRight="getPanelAction('right',0,'actionRight')" :contentPadding="getPanelContentPadding('right',0)" class="content-item" @action-left-change="onActionChange('right', 0, 'left', $event)" @action-right-change="onActionChange('right', 0, 'right', $event)">
        <template #title>
          <span>{{ getPanelTitle('right', 0) }}</span>
        </template>
        <div class="panel-content">
          <!-- 右侧上方内容插槽 -->
          <slot name="right-top"></slot>
        </div>
      </CardPanel>

      <CardPanel :title="getPanelTitle('right',1)" :unit="getPanelUnit('right',1)" :showBottomCorner="getPanelShowBottomCorner('right',1)" :showCurrency="getPanelShowCurrency('right',1)" :actionLeft="getPanelAction('right',1,'actionLeft')" :actionRight="getPanelAction('right',1,'actionRight')" :contentPadding="getPanelContentPadding('right',1)" class="content-item" @action-left-change="onActionChange('right', 1, 'left', $event)" @action-right-change="onActionChange('right', 1, 'right', $event)">
        <template #title>
          <span>{{ getPanelTitle('right', 1) }}</span>
        </template>
        <div class="panel-content">
          <!-- 右侧中间内容插槽 -->
          <slot name="right-middle"></slot>
        </div>
      </CardPanel>

      <CardPanel :title="getPanelTitle('right',2)" :unit="getPanelUnit('right',2)" :showBottomCorner="getPanelShowBottomCorner('right',2)" :showCurrency="getPanelShowCurrency('right',2)" :actionLeft="getPanelAction('right',2,'actionLeft')" :actionRight="getPanelAction('right',2,'actionRight')" :contentPadding="getPanelContentPadding('right',2)" class="content-item" @action-left-change="onActionChange('right', 2, 'left', $event)" @action-right-change="onActionChange('right', 2, 'right', $event)">
        <template #title>
          <span>{{ getPanelTitle('right', 2) }}</span>
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
import CardPanel from '../panels/CardPanel.vue'
import { formatNumber, formatLargeNumber } from '../../../utils/utils.js'

export default {
  name: 'DashboardContent',
  components: {
    CardPanel,
  },
  data() {
    // 中间下方面板的局部状态（周/月 与 文字按钮切换）
    return {
      // internal fallback for center mode when parent does not control it
      centerBottomModeInternal: 'a',
      centerPeriodInternal: 'day',
    }
  },
  props: {
    dataList: {
      type: Array,
      default: () => [
        { label: '', value: 0 },
        { label: '', value: 0 },
      ],
    },
    // allow parent to control centerBottomMode via .sync (if provided)
    centerBottomMode: {
      type: String,
      default: null,
    },
    centerPeriod: {
      type: String,
      default: null,
    },
    // panelsConfig: 可配置左右侧三个 panel 的 title/unit
    panelsConfig: {
      type: Object,
      default: () => ({}),
    },
    // scope: 当前统计维度 (global/domestic/overseas)
    scope: {
      type: String,
      default: 'global',
    },
  },
  computed: {
    centerPeriodComputed: {
      get() {
        return this.centerPeriod !== null ? this.centerPeriod : this.centerPeriodInternal
      },
      set(val) {
        if (this.centerPeriod !== null) {
          this.$emit('update:centerPeriod', val)
        } else {
          this.centerPeriodInternal = val
        }
      },
    },
    // proxy for centerBottomMode: prefer parent-controlled prop, otherwise use internal state
    centerBottomModeComputed: {
      get() {
        return this.centerBottomMode !== null ? this.centerBottomMode : this.centerBottomModeInternal
      },
      set(val) {
        if (this.centerBottomMode !== null) {
          // parent is controlling value -> emit update for .sync
          this.$emit('update:centerBottomMode', val)
        } else {
          this.centerBottomModeInternal = val
        }
      },
    },
  },
  methods: {
    formatNumber,
    formatLargeNumber,
    // 安全读取 panelsConfig 中的 title 与 unit，若缺失返回空字符串
    getPanelTitle(side, idx) {
      try {
        return (this.panelsConfig && this.panelsConfig[side] && this.panelsConfig[side][idx] &&
          this.panelsConfig[side][idx].title) || ''
      } catch (e) {
        return ''
      }
    },
    getPanelUnit(side, idx) {
      try {
        return (this.panelsConfig && this.panelsConfig[side] && this.panelsConfig[side][idx] &&
          this.panelsConfig[side][idx].unit) || ''
      } catch (e) {
        return ''
      }
    }
    ,
    // 从 panelsConfig 中读取是否显示底部边角装饰，未配置时默认 false
    getPanelShowBottomCorner(side, idx) {
      try {
        const item = Array.isArray(this.panelsConfig[side]) ? this.panelsConfig[side][idx] : this.panelsConfig[side]
        return !(item && item.showBottomCorner === false)
      } catch (e) {
        return false
      }
    },
    // 从 panelsConfig 中读取是否显示币种配置，未配置时默认 false
    getPanelShowCurrency(side, idx) {
      try {
        const item = Array.isArray(this.panelsConfig[side]) ? this.panelsConfig[side][idx] : this.panelsConfig[side]
        return !!(item && item.showCurrency)
      } catch (e) {
        return false
      }
    },
    // 安全读取 panelsConfig 中的 actionLeft / actionRight 配置
    getPanelAction(side, idx, prop) {
      try {
        const item = Array.isArray(this.panelsConfig[side]) ? this.panelsConfig[side][idx] : this.panelsConfig[side]
        return (item && item[prop]) || null
      } catch (e) {
        return null
      }
    }
    ,
    // 从 panelsConfig 中读取 contentPadding；支持 side 为对象或数组的情况，未配置时返回空对象
    getPanelContentPadding(side, idx) {
      try {
        const sideConfig = this.panelsConfig && this.panelsConfig[side]
        if (!sideConfig) return {}
        // 如果 sideConfig 是数组（左右两侧），读取对应索引
        if (Array.isArray(sideConfig)) {
          return (sideConfig[idx] && sideConfig[idx].contentPadding) || {}
        }
        // 如果 sideConfig 是对象（如 center）
        return sideConfig.contentPadding || {}
      } catch (e) {
        return {}
      }
    },
    // 处理action变化事件
    onActionChange(side, index, actionType, value) {
      // 转发事件到父组件，携带位置和类型信息
      this.$emit('panel-action-change', {
        side,      // 'left', 'center', 'right'
        index,     // 0, 1, 2
        actionType, // 'left' or 'right'
        value      // 新的值
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.dashboard-content {
  flex: 1;
  display: flex;
  gap: 15px;
  padding: 15px;
  overflow: hidden;
  height: calc(100% - 80px);
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

.period-switch {
  span {
    font-size: 14px;
  }
  //cursor: not-allowed;
  //
  //label, input {
  //  pointer-events: none;
  //}
}

// 核心区域（上方）
.center-top {
  flex: 1;
  min-height: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
  overflow: hidden;
  backdrop-filter: blur(10px);

  &.has-global-bg {
    background-image: url("../../img/earth-bg.png");
    background-size: 100% 237px;
    background-position-y: calc(100% - 20px);
    background-repeat: no-repeat;
  }
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
  color: #3AACFF;
  // 第一个数据项数字颜色 #24D9B5
  &:nth-child(1) .data-number {
    color: #24D9B5;
  }

  // // 第二个数据项数字颜色 #3AACFF
  // &:nth-child(2) .data-number {
  //   color: #3AACFF;
  // }

  // // 第三个数据项数字颜色 #24D9B5（如果只有3个，可以循环使用）
  // &:nth-child(3) .data-number {
  //   color: #24D9B5;
  // }

  /* 浅色模式下统一使用变量 */
  .is-light-mode & .data-number {
    color: var(--color-title-light, #181818) !important;
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
  display: flex;
  align-items: baseline; // 确保底部对齐

  .num-value {
    font-size: 50px;
  }

  .num-suffix {
    font-size: 22px;
    margin-left: 2px;
  }
}

.data-label {
  font-size: 18px;
  /* 深色模式使用标题色变量 */
  color: var(--color-title-dark, #FFFFFF);
  text-align: left;
}

/* 浅色模式下 data-label 使用 --color-label-light */
.is-light-mode .data-label {
  color: var(--color-label-light, #666666) !important;
}

/* 趋势标题颜色 */
.trend-title {
  color: #FFFFFF;

  .is-light-mode & {
    color: var(--color-title-light, #181818);
  }
}

.center-top-content {
  flex: 1;
  overflow: hidden;
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
  height: 310px;
  flex-shrink: 0;
}

.panel-content {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

// 响应式布局（可选，根据需求调整）
@media (max-width: 1600px) {
  .dashboard-content {
    gap: 10px;
    padding: 10px;
  }

  /* responsive adjustments removed for now */
}

@media (max-width: 1366px) {
  .dashboard-title {
    font-size: 24px !important;
  }
}
</style>

