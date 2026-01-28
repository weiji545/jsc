<template>
  <div class="card-panel" :class="{ 'is-dark': isDarkMode, 'is-light': !isDarkMode, 'is-long': isLong, 'has-bottom-corner': showBottomCorner }" :style="panelStyle">
    <div class="card-title" :style="titleBgStyle">
      <div class="card-title-main">
        <slot name="title">{{ title }}</slot>
        <span class="currency-indicator" v-if="showCurrency">
          <img src="../../img/warning-currency.png" alt="" class="currency-icon"/>
          <span class="currency-text">{{ currencyText }}</span>
        </span>
      </div>
      <div class="card-unit-wrapper">
        <!-- Configurable Left Action -->
        <div v-if="actionLeft && actionLeft.options" class="action-group left" :style="{'margin-right': !displayUnit && !actionRight ? '87px' : ''}">
           <el-radio-group v-if="actionLeft.type === 'radio'" v-model="actionLeftValue" size="mini" :style="{'margin-right': displayUnit ? '9px' : 0}">
              <el-radio v-for="opt in actionLeft.options" :key="opt.value" :label="opt.value">{{ opt.label }}</el-radio>
           </el-radio-group>
        </div>
        <slot name="action-left"></slot>
        <div v-if="displayUnit" class="card-unit">单位: {{ displayUnit }}</div>
        <slot name="action-right"></slot>
        <!-- Configurable Right Action -->
        <div v-if="actionRight && actionRight.options" class="action-group right">
           <div v-if="actionRight.type === 'text'" class="text-toggle-group">
              <div v-for="(opt) in actionRight.options" :key="opt.value" class="text-toggle-item">
                  <button
                          class="text-toggle-btn"
                          :class="{ active: actionRightValue === opt.value }"
                          @click="actionRightValue = opt.value">
                      {{ opt.label }}
                  </button>
              </div>
           </div>
        </div>
      </div>
      <!-- 仅长条模式显示额外的 title-tabs（不影响其他 panel） -->
      <div v-if="isLong" class="card-title-tabs">
        <slot name="title-tabs"></slot>
      </div>
    </div>
    <div
      class="card-content"
      :class="{ 'is-dark': isDarkMode, 'is-light': !isDarkMode }"
      :style="contentPaddingStyle"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CardPanel',
  props: {
    title: {
      type: String,
      default: '',
    },
    unit: {
      type: String,
      default: '',
    },
    // card-content 的 padding 配置，默认都为 0
    contentPadding: {
      type: Object,
      default: () => ({
        paddingTop: 12, // card-title 与 card-content 之间的间距，默认 12px, 下面还有一处需要更改
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 0,
      }),
    }
    ,
    // 是否为长条模式（中间下方的长窗口）
    isLong: {
      type: Boolean,
      default: false,
    }
    ,
    // 长条模式的可配置尺寸（默认与样式一致）
    longWidth: {
      type: String,
      default: '100%',
    },
    longHeight: {
      type: String,
      default: '100%',
    }
    ,
    // 是否显示容器底部的装饰边角图片（默认关闭）
    showBottomCorner: {
      type: Boolean,
      default: true,
    },
    // 是否显示币种指示器（默认关闭）
    showCurrency: {
      type: Boolean,
      default: false,
    },
    // 左侧操作配置 { type: 'radio'|'text', options: [{label, value}], value: Any }
    actionLeft: {
      type: Object,
      default: null,
    },
    // 右侧操作配置
    actionRight: {
      type: Object,
      default: null,
    },
  },
  computed: {
    isDarkMode() {
      try {
        return !!(this.$store && this.$store.getters['theme/isDarkMode'])
      } catch (e) {
        return true
      }
    },
    displayUnit() {
      return (this.unit || '').trim()
    },
    currencyText() {
      try {
        const currency = this.$store?.getters?.['currency/selectedCurrency'] || 'RMB'
        return currency === 'DOLLAR' ? '以美元计价' : '以人民币计价'
      } catch (e) {
        return '以人民币计价'
      }
    },
    // 计算最终的 padding 样式
    contentPaddingStyle() {
      const padding = {
        paddingTop: this.contentPadding.paddingTop ?? 12,
        paddingLeft: this.contentPadding.paddingLeft || 0,
        paddingRight: this.contentPadding.paddingRight || 0,
        paddingBottom: this.contentPadding.paddingBottom || 0,
      }

      // 转换为 CSS 样式对象
      return {
        paddingTop: padding.paddingTop + 'px',
        paddingLeft: padding.paddingLeft + 'px',
        paddingRight: padding.paddingRight + 'px',
        paddingBottom: padding.paddingBottom + 'px',
      }
    },
    panelStyle() {
      if (!this.isLong) return {}
      return {
        width: this.longWidth,
        height: this.longHeight,
      }
    },
    actionLeftValue: {
      get() {
        return this.actionLeft ? this.actionLeft.value : null
      },
      set(val) {
        this.$emit('action-left-change', val)
      }
    },
    actionRightValue: {
      get() {
        return this.actionRight ? this.actionRight.value : null
      },
      set(val) {
        this.$emit('action-right-change', val)
      }
    },
    titleBgStyle() {
      if (this.isLong) return {}
      if (!this.actionRight || !this.actionRight.options) return {}

      const idx = this.actionRight.options.findIndex(opt => opt.value === this.actionRight.value)

      if (idx === 0 || idx === 1) {
        const suffix = idx + 1
        const imgName = this.isDarkMode
          ? `subtitle-active-${suffix}.png`
          : `subtitle-light-active-${suffix}.png`
        try {
          return {
            backgroundImage: `url(${require('../../img/' + imgName)})`
          }
        } catch (e) {
          return {}
        }
      }
      return {}
    },
  },
  mounted() {
    this.preloadImages()
  },
  methods: {
    preloadImages() {
      const imagesToPreload = [
        'subtitle-active-1.png',
        'subtitle-active-2.png',
        'subtitle-light-active-1.png',
        'subtitle-light-active-2.png'
      ]

      imagesToPreload.forEach(name => {
        try {
          // Utilise webpack's require to get the correct path
          const imgUrl = require('../../img/' + name)
          const img = new Image()
          img.src = imgUrl
        } catch (e) {
          // Ignore if image not found
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.card-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.card-title {
  width: 100%;
  height: 43px;
  padding-left: 42px;
  padding-right: 12px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 7px;
  font-weight: 600;
  background-image: url('../../img/subtitle.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

.card-panel.is-long .card-title {
  padding-right: 0;
}


.card-title-main {
  /* 保持非长模式下的原始行为 */
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
  font-size: 20px;
}

.currency-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.currency-icon {
  width: 11px;
  height: 11px;
  display: block;
}

.currency-text {
  font-size: 12px;
  font-weight: 400;
  color: #9E9E9E;
}

.card-unit-wrapper {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;

  .action-group {
    &.left {
      margin-right: -9px;
    }

    &.right {
      margin-right: 16px;
    }
  }
}

.card-unit {
  /* 恢复默认单位样式，长模式下另作覆盖 */
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;
}

/* 仅在长条模式下应用三等分布局与 tabs 样式，避免影响其他区域 */
.card-panel.is-long .card-title > * {
  flex: 0 0 38%;
  display: flex;
  align-items: center;
  min-width: 0;
}

.card-panel.is-long .card-title-main {
  justify-content: flex-start;
  display: flex;
  align-items: center;
}

.card-panel.is-long .card-unit-wrapper {
  flex: 0 0 24%;
  margin-left: 0;
  justify-content: flex-end;
  //text-align: center;
}

.card-panel.is-long .card-title-tabs {
  flex: 1;
  justify-content: flex-end;
  display: flex;
  align-items: center;
}

.card-panel.is-dark .card-unit {
  color: rgba(255, 255, 255, 0.65);
}

.card-panel.is-light .card-unit {
  color: #666666;
}

/* 针对通过 slot 插入的 title-tabs 样式，仅在长条模式下生效 */
.card-panel.is-long ::v-deep .title-tabs-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.card-panel.is-long ::v-deep .title-tabs-wrapper .period-switch {
  display: flex;
  align-items: center;
  gap: 12px;
  color: inherit;
  font-weight: 400;
}

.card-panel.is-long ::v-deep .title-tabs-wrapper .period-switch label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
}

.card-panel.is-long ::v-deep .title-tabs-wrapper .period-switch input[type="radio"] {
  margin: 0;
  width: 14px;
  height: 14px;
  accent-color: #29F1FA;
}

.card-panel.is-long ::v-deep .title-tabs-wrapper .text-toggle {
  display: flex;
  gap: 12px;
  align-items: center;
}

.card-panel.is-long ::v-deep .title-tabs-wrapper .text-toggle .text-btn {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px 6px;
  font-size: 14px;
  position: relative;
  font-weight: 400;
  width: 96px;
  text-align: center;
}

.card-panel.is-long ::v-deep .title-tabs-wrapper .text-toggle .text-btn.selected {
  color: #29F1FA;
  font-weight: 700;
}

.card-panel.is-long.is-light ::v-deep .title-tabs-wrapper .text-toggle .text-btn.selected {
  color: #096DD9;
}

/* 被选中文字按钮下方的平行四边形指示条（仅长条模式） */
.card-panel.is-long ::v-deep .title-tabs-wrapper .text-toggle .text-btn.selected::after {
  content: '';
  position: absolute;
  left: 55%;
  transform: translateX(-46%) skewX(-60deg);
  bottom: -8px;
  width: 102px;
  height: 5px;
  background: #29F1FA;
  border-radius: 1px;
}

.card-panel.is-long.is-light ::v-deep .title-tabs-wrapper .text-toggle .text-btn.selected::after {
  background: #096DD9;
}

// 标题颜色使用 CSS 变量
.card-panel.is-dark .card-title {
  color: var(--color-title-dark, #FFFFFF);
}

.card-panel.is-light .card-title {
  color: var(--color-title-light, #181818);
  /* 浅色模式下使用浅色版背景图替换默认背景 */
  background-image: url('../../img/subtitle-light.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #FFFFFF;
}

/* 深浅模式下，覆盖 card 内 slot 内容的 .ring-label 颜色 */
.card-panel.is-dark {
  ::v-deep .ring-label {
    color: var(--color-label2-dark, #c3e2ff);
  }
}

.card-panel.is-light {
  ::v-deep .ring-label {
    color: var(--color-label2-light, #666666);
  }
}

.card-content {
  flex: 1;
  padding: 0; // 默认 padding 为 0，通过 prop 配置
  overflow: hidden;
  display: flex;
  flex-direction: column;

  // 深色模式
  &.is-dark {
    background: rgba(0, 60, 123, 0.1625);

    // 文字数字部分颜色同标题（使用 CSS 变量）
    ::v-deep .text-number,
    ::v-deep .data-number,
    ::v-deep .summary-number,
    ::v-deep .ring-value,
    ::v-deep .region-value {
      color: var(--color-title-dark, #FFFFFF);
    }

    // 文字提示部分颜色（使用 CSS 变量）
    ::v-deep .text-label,
    ::v-deep .data-label,
    ::v-deep .summary-label,
    ::v-deep .region-name {
      color: var(--color-label-dark, #9EC7F0);
    }
  }

  // 浅色模式
  &.is-light {
    background: #FFFFFF;

    // 文字数字部分颜色同标题（使用 CSS 变量）
    ::v-deep .text-number,
    ::v-deep .data-number,
    ::v-deep .summary-number,
    ::v-deep .ring-value,
    ::v-deep .region-value {
      color: var(--color-title-light, #181818);
    }

    // 文字提示部分颜色（使用 CSS 变量）
    ::v-deep .text-label,
    ::v-deep .data-label,
    ::v-deep .summary-label,
    ::v-deep .region-name {
      color: var(--color-label-light, #666666);
    }
  }
}

.title-bar {
  width: 2px;
  height: 50%;
  background: #00d4ff;
  display: inline-block;
}

.title-icon {
  width: 14px;
  height: 18px;
  background: linear-gradient(135deg, #00d4ff, #5b8def);
  clip-path: polygon(0 0, 100% 15%, 100% 85%, 0 100%);
  opacity: 0.9;
}

/* 长条模式样式（用于中间下方长窗口） */
.card-panel.is-long {
  width: 100%; // 918px;
  height: 213px;
}

.card-panel.is-long .card-title {
  background-image: url('../../img/subtitle-long.png');
}

/* 长条模式浅色背景替换 */
.card-panel.is-long.is-light .card-title {
  background-image: url('../../img/subtitle-long-light.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

/* 可选：容器底部的装饰边角图片（仅在 prop showBottomCorner 为 true 时生效） */
.card-panel.has-bottom-corner {
  background-image: url('../../img/container-bottom-corner.png');
  background-repeat: no-repeat;
  background-position: bottom center;
  background-size: contain;
}

.card-panel.is-long.has-bottom-corner {
  background-image: url('../../img/container-bottom-corner-long.png');
}

/* Text Toggle Button Styles */
.text-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #9EC7F0;
  padding: 0 4px;
  transition: color 0.3s;

  .card-panel.is-light & {
    color: #666666;
  }
}
.text-toggle-btn.active {
  color: #29F1FA;
  font-weight: bold;

  .card-panel.is-light & {
    color: #096DD9;
  }
}
.text-toggle-group {
  display: flex;
  align-items: center;
}
.text-toggle-sep {
  color: #9EC7F0;
  margin: 0 4px;
  font-size: 12px;
}
.text-toggle-item {
  display: flex;
  align-items: center;
}
</style>

<style lang="scss" scoped>
/* Scoped styles override for el-radio inside this component */
::v-deep .el-radio {
  color: #BCDEFF; /* Unchecked color */
  margin: 0 8px 0 0;
  display: inline-flex;
  align-items: center;
  transition: all 0.3s;

  .card-panel.is-light & {
    color: #666666;
  }
}

::v-deep .el-radio__label {
  padding-left: 5px;
  font-weight: 400;
}

::v-deep .el-radio__inner {
  background-color: transparent;
  border-color: #409EFF; // Default el-radio border

  .card-panel.is-dark & {
    border-color: #5b8def;
  }

  .card-panel.is-light & {
    border-color: #DCDFE6;
  }
}

::v-deep .el-radio.is-checked {
  .el-radio__label {
    color: #29F1FA;

    .card-panel.is-light & {
      color: #096DD9;
    }
  }

  .el-radio__inner {
    border-color: #29F1FA;
    background: #29F1FA;

    .card-panel.is-light & {
      border-color: #096DD9;
      background: #096DD9;
    }
  }
}
</style>

