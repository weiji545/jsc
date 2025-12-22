<template>
  <div class="card-panel" :class="{ 'is-dark': isDarkMode, 'is-light': !isDarkMode, 'is-long': isLong, 'has-bottom-corner': showBottomCorner }" :style="panelStyle">
    <div class="card-title">
      <div class="card-title-main">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="displayUnit" class="card-unit">单位: {{ displayUnit }}</div>
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
      default: ''
    },
    unit: {
      type: String,
      default: ''
    },
    // card-title 与 card-content 之间的间距，默认 12px
    titleGap: {
      type: Number,
      default: 12
    },
    // card-content 的 padding 配置，默认都为 0
    contentPadding: {
      type: Object,
      default: () => ({
        paddingTop: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 0
      })
    }
    ,
    // 是否为长条模式（中间下方的长窗口）
    isLong: {
      type: Boolean,
      default: false
    }
    ,
    // 长条模式的可配置尺寸（默认与样式一致）
    longWidth: {
      type: Number,
      default: 918
    },
    longHeight: {
      type: Number,
      default: 213
    }
    ,
    // 是否显示容器底部的装饰边角图片（默认关闭）
    showBottomCorner: {
      type: Boolean,
      default: false
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
    displayUnit() {
      return (this.unit || '').trim()
    },
    // 计算最终的 padding 样式
    contentPaddingStyle() {
      const padding = {
        paddingTop: this.contentPadding.paddingTop || 0,
        paddingLeft: this.contentPadding.paddingLeft || 0,
        paddingRight: this.contentPadding.paddingRight || 0,
        paddingBottom: this.contentPadding.paddingBottom || 0
      }

      // 如果设置了 titleGap，覆盖 paddingTop
      if (this.titleGap !== undefined && this.titleGap !== null) {
        padding.paddingTop = this.titleGap
      }

      // 转换为 CSS 样式对象
      return {
        paddingTop: padding.paddingTop + 'px',
        paddingLeft: padding.paddingLeft + 'px',
        paddingRight: padding.paddingRight + 'px',
        paddingBottom: padding.paddingBottom + 'px'
      }
    }
    ,
    panelStyle() {
      if (!this.isLong) return {}
      return {
        width: this.longWidth + 'px',
        height: this.longHeight + 'px'
      }
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
  background-image: url('@/views/dashboard/img/subtitle.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

.card-title-main {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.card-unit {
  margin-left: auto;
  font-size: 12px;
  font-weight: 400;
}

.card-panel.is-dark .card-unit {
  color: rgba(255, 255, 255, 0.65);
}

.card-panel.is-light .card-unit {
  color: #666666;
}

// 标题颜色使用 CSS 变量
.card-panel.is-dark .card-title {
  color: var(--color-title-dark, #FFFFFF);
}

.card-panel.is-light .card-title {
  color: var(--color-title-light, #181818);
  /* 浅色模式下使用浅色版背景图替换默认背景 */
  background-image: url('@/views/dashboard/img/subtitle-light.png');
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
    background: rgba(0,60,123,0.1625);

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
  width: 918px;
  height: 213px;
}

.card-panel.is-long .card-title {
  background-image: url('@/views/dashboard/img/subtitle-long.png');
}

/* 长条模式浅色背景替换 */
.card-panel.is-long.is-light .card-title {
  background-image: url('@/views/dashboard/img/subtitle-long-light.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

/* 可选：容器底部的装饰边角图片（仅在 prop showBottomCorner 为 true 时生效） */
.card-panel.has-bottom-corner {
  background-image: url('@/views/dashboard/img/container-bottom-corner.png');
  background-repeat: no-repeat;
  background-position: bottom center;
  background-size: contain;
}
</style>

