<template>
  <div class="core-filter-bar" :class="{ 'is-dark': isDarkMode, 'is-light': !isDarkMode }">
    <div class="core-radios">
      <div
        v-for="opt in scopeOptions"
        :key="opt.value"
        :class="['core-radio', { active: scope === opt.value }]"
        @click="onScopeClick(opt.value)"
      >
        <span class="core-label">{{ opt.label }}</span>
      </div>
    </div>
    <div class="core-options" :style="{flex: showTimeRangeType > 0 ? 2.5 : 1}">
      <el-cascader
        v-model="innerTime"
        class="accent-select"
        :options="timeOptions"
        :props="{ expandTrigger: 'hover' }"
        :popper-class="isDarkMode ? 'filter-cascader-popper dark-mode' : 'filter-cascader-popper'"
        @change="onTimeChange">
      </el-cascader>

      <template v-if="showTimeRangeType > 0">
        <div v-if="showTimeRangeType === 1">
          <el-date-picker
            v-model="timeValue"
            class="accent-select"
            value-format="yyyy-MM-dd"
            :clearable="false"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptionsDate"
            :popper-class="isDarkMode ? 'filter-date-popper dark-mode' : 'filter-date-popper'"
            @focus="choiceDate = null"
            @change="onRangeChange">
          </el-date-picker>
        </div>
        <div v-if="showTimeRangeType === 2">
          <el-date-picker
            v-model="timeValue"
            class="accent-select"
            value-format="yyyy-MM-dd"
            type="monthrange"
            :clearable="false"
            range-separator="-"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            :picker-options="pickerOptionsMonth"
            :popper-class="isDarkMode ? 'filter-date-popper dark-mode' : 'filter-date-popper'"
            @focus="choiceDate = null"
            @change="onRangeChange">
          </el-date-picker>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FilterTabs',
  props: {
    scope: {
      type: String,
      default: 'global',
    },
    scopeOptions: {
      type: Array,
      default: () => [],
    },
    time: {
      type: Array,
      default: () => [],
      // type: String,
      // default: 'week'
    },
    timeOptions: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      innerTime: this.time,
      timeValue: '',
      choiceDate: null,
      pickerOptionsDate: {
        onPick: ({ maxDate, minDate }) => {
          this.choiceDate = minDate ? minDate.getTime() : null
          if (maxDate) {
            this.choiceDate = null
          }
        },
        disabledDate: (time) => {
          // 不能选超过当天的日期
          if (time.getTime() > Date.now()) {
            return true
          }
          if (!this.choiceDate) return false
          const choice = new Date(this.choiceDate)
          return (
            time.getFullYear() !== choice.getFullYear() ||
            time.getMonth() !== choice.getMonth()
          )
        },
      },
      pickerOptionsMonth: {
        onPick: ({ maxDate, minDate }) => {
          this.choiceDate = minDate ? minDate.getTime() : null
          if (maxDate) {
            this.choiceDate = null
          }
        },
        disabledDate: (time) => {
          const now = new Date()
          // 不能选择超过当前月
          if (time.getFullYear() > now.getFullYear() || (time.getFullYear() === now.getFullYear() && time.getMonth() > now.getMonth())) {
            return true
          }
          if (!this.choiceDate) return false
          const choice = new Date(this.choiceDate)
          // 必须在同一年内，且不允许选择相同的月份（必须跨月）
          return (
            time.getFullYear() !== choice.getFullYear() ||
            time.getMonth() === choice.getMonth()
          )
        },
      },
    }
  },
  watch: {
    time(val) {
      this.innerTime = val
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
    // 根据当前选中货币返回用于展示的 dataList
    showTimeRangeType() {
      const lastId = this.innerTime[this.innerTime.length - 1]
      return ['customizedDay', 'customizedMonth'].indexOf(lastId) + 1
    },
  },
  methods: {
    // 切换范围
    onScopeClick(value) {
      console.log('change-scope', value)
      this.$emit('change-scope', value)
    },
    // 切换时间
    onTimeChange(value) {
      console.log('切换时间', value)
      this.$emit('change-time', value)
      // 切换类型时清空自定义选择的值
      this.timeValue = ''

      if (value && value.length === 2) {
        const lastId = value[1]
        const now = new Date()
        if (lastId === 'month') {
          const first = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          const last = new Date(now.getFullYear(), now.getMonth(), 0)
          this.$emit('change-custom-time', {
            startBsnDate: this.formatDate(first),
            endBsnDate: this.formatDate(last),
          })
        } else if (lastId === 'year') {
          const first = new Date(now.getFullYear(), 0, 1)
          this.$emit('change-custom-time', {
            startBsnDate: this.formatDate(first),
            endBsnDate: this.formatDate(now),
          })
        } else if (lastId === '7') {
          const start = new Date()
          start.setDate(now.getDate() - 6) // 包括今天在内的近7天
          this.$emit('change-custom-time', {
            startBsnDate: this.formatDate(start),
            endBsnDate: this.formatDate(now),
          })
        }
      }
    },
    // 处理日期范围变化
    onRangeChange(val) {
      if (val && val.length === 2) {
        let start = val[0]
        let end = val[1]
        if (this.showTimeRangeType === 2) {
          // 月份模式
          const endDate = new Date(end)
          const now = new Date()
          if (endDate.getFullYear() === now.getFullYear() && endDate.getMonth() === now.getMonth()) {
            // 选择当前月的时候 endBsnDate返回的应该是当天
            end = this.formatDate(now)
          } else {
            // 否则取当月最后一天
            end = this.getLastDayOfMonth(end)
          }
        }
        const payload = {
          startBsnDate: start,
          endBsnDate: end,
        }
        console.log('change-custom-time', payload)
        this.$emit('change-custom-time', payload)
      }
    },
    formatDate(date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },
    getLastDayOfMonth(dateStr) {
      const date = new Date(dateStr)
      const y = date.getFullYear()
      const m = date.getMonth()
      const lastDay = new Date(y, m + 1, 0)
      return this.formatDate(lastDay)
    },
  },
}
</script>

<style lang="scss" scoped>
.core-filter-bar {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 60px;

  ::v-deep .el-cascader {
    width: 150px;
  }
}

.core-radios {
  display: flex;
  flex: 2;
  justify-content: space-evenly;
}

.core-radio {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: #9EC7F0; // Default dark unselected
  font-size: 14px;
  justify-content: space-between;

  .is-light-mode & {
    color: var(--color-label-light, #666666); // Light unselected
  }
}

.core-slab {
  width: 40px;
  height: 10px;
  background: rgba(255, 255, 255, 0.25);
  clip-path: polygon(0 0, 90% 0, 100% 100%, 10% 100%);
  margin-top: 4px;
}

.core-radio.active {
  .core-slab {
    background: #00d4ff;
  }

  .core-label {
    color: #29F1FA; // Dark selected
  }

  .is-light-mode & {
    .core-label {
      color: #0098FA; // Light selected
    }
  }
}

.core-label {
  font-size: 14px;
}

.data-number {
  .is-light-mode & {
    color: var(--color-title-light, #181818);
  }
}


.core-options {
  display: flex;
  justify-content: space-evenly;
  flex: 1;

  ::v-deep .el-date-editor.el-input {
    width: 173px;
  }

  // 深色模式下的输入框样式
  .is-dark & {
    ::v-deep .el-input__inner {
      background: #142765;
      border: 1px solid #0098FA;
      color: #BCDEFF;
      font-size: 14px;
      padding-right: 10px;
      max-width: 220px;

      .el-range-separator {
        color: #BCDEFF;
        padding: 0;
      }

      .el-range__close-icon {
        width: 0;
      }
    }

    ::v-deep .el-date-editor .el-range-input {
      background: #142765;
      color: #BCDEFF;
      font-size: 14px;
    }

    ::v-deep .el-input__suffix {
      color: #fff;
    }
  }

  // 浅色模式下的输入框样式（使用默认样式）
  .is-light & {
    ::v-deep .el-input__inner {
      font-size: 14px;
      padding-right: 10px;
      max-width: 220px;
    }

    ::v-deep .el-date-editor .el-range-input {
      font-size: 14px;
    }
  }
}

// 深色模式下的 accent-select 样式
.core-filter-bar.is-dark {
  .accent-select {
    ::v-deep .el-input__inner {
      background: #142765 !important;
      border: 1px solid #0098FA !important;
      color: #BCDEFF !important;
    }

    ::v-deep .el-input__suffix {
      color: #fff !important;
    }

    ::v-deep .el-date-editor .el-range-input {
      background: #142765 !important;
      color: #BCDEFF !important;
    }

    ::v-deep .el-range-separator {
      color: #BCDEFF !important;
    }
  }
}

// 浅色模式下的 accent-select 样式（使用默认样式）
.core-filter-bar.is-light {
  .accent-select {
    ::v-deep .el-input__inner {
      font-size: 14px;
    }
  }
}

</style>

<style lang="scss">
// Cascader 下拉框样式
.filter-cascader-popper {
  z-index: 20000 !important;
}

// 深色模式下的 Cascader 下拉框
.filter-cascader-popper.dark-mode {
  background: #142765 !important;
  border: 1px solid #0098FA !important;

  .el-cascader-menu {
    background: transparent !important;
    border-right: 1px solid rgba(0, 152, 250, 0.3) !important;
  }

  .el-cascader-node {
    color: #BCDEFF !important;

    &:hover {
      background: rgba(0, 152, 250, 0.2) !important;
    }

    &.in-active-path,
    &.is-active {
      color: #FFFFFF !important;
      font-weight: bold;
    }

    &.is-disabled {
      color: rgba(188, 222, 255, 0.4) !important;
      cursor: not-allowed;
    }
  }

  .el-cascader-menu__wrap {
    background: transparent !important;
  }
}

// Date Picker 下拉框样式
.filter-date-popper {
  z-index: 20000 !important;
}

// 深色模式下的 Date Picker 下拉框
.filter-date-popper.dark-mode {
  background: #142765 !important;
  border: 1px solid #0098FA !important;

  .el-picker-panel__body-wrapper {
    background: transparent !important;
  }

  .el-date-range-picker__content {
    background: transparent !important;
  }

  .el-picker-panel__content {
    background: transparent !important;
  }

  // 头部（年月选择）
  .el-date-range-picker__header,
  .el-picker-panel__icon-btn {
    color: #BCDEFF !important;
  }

  .el-date-picker__header-label {
    color: #BCDEFF !important;

    &:hover {
      color: #FFFFFF !important;
    }
  }

  // 星期标题
  .el-date-table th {
    color: #BCDEFF !important;
    border-bottom: 1px solid rgba(0, 152, 250, 0.3) !important;
  }

  // 日期单元格
  .el-date-table td {
    color: #BCDEFF !important;

    &.available:hover {
      color: #FFFFFF !important;
      background: rgba(0, 152, 250, 0.2) !important;
    }

    &.today span {
      color: #00d4ff !important;
      font-weight: bold;
    }

    &.current:not(.disabled) span {
      background: rgba(0, 152, 250, 0.5) !important;
      color: #FFFFFF !important;
    }

    &.start-date span,
    &.end-date span {
      background: rgba(0, 152, 250, 0.5) !important;
      color: #FFFFFF !important;
    }

    &.in-range div,
    &.in-range div:hover {
      background: rgba(0, 152, 250, 0.2) !important;
    }

    &.disabled {
      color: rgba(188, 222, 255, 0.3) !important;
      background: transparent !important;

      span {
        background: transparent !important;
        color: rgba(188, 222, 255, 0.3) !important;
      }

      div {
        background: transparent !important;
        color: rgba(188, 222, 255, 0.3) !important;
      }

      &:hover {
        background: transparent !important;
        color: rgba(188, 222, 255, 0.3) !important;
      }
    }

    &.prev-month,
    &.next-month {
      color: rgba(188, 222, 255, 0.4) !important;
    }
  }

  // 月份选择器
  .el-month-table td {
    color: #BCDEFF !important;

    .cell {
      color: #BCDEFF !important;

      &:hover {
        color: #FFFFFF !important;
        background: rgba(0, 152, 250, 0.2) !important;
      }
    }

    &.today .cell {
      color: #00d4ff !important;
      font-weight: bold;
    }

    &.current:not(.disabled) .cell {
      background: rgba(0, 152, 250, 0.5) !important;
      color: #FFFFFF !important;
    }

    &.start-date .cell,
    &.end-date .cell {
      background: rgba(0, 152, 250, 0.5) !important;
      color: #FFFFFF !important;
    }

    &.in-range .cell,
    &.in-range .cell:hover {
      background: rgba(0, 152, 250, 0.2) !important;
      color: #FFFFFF !important;
    }

    &.in-range div,
    &.in-range div:hover {
      background: rgba(0, 152, 250, 0.2) !important;
    }

    &.disabled .cell {
      color: rgba(188, 222, 255, 0.3) !important;
      background: transparent !important;

      &:hover {
        background: transparent !important;
        color: rgba(188, 222, 255, 0.3) !important;
      }
    }

    &.disabled {
      &:hover {
        background: transparent !important;
      }
    }
  }

  // 年份选择器
  .el-year-table td {
    color: #BCDEFF !important;

    .cell {
      color: #BCDEFF !important;

      &:hover {
        color: #FFFFFF !important;
        background: rgba(0, 152, 250, 0.2) !important;
      }
    }

    &.today .cell {
      color: #00d4ff !important;
      font-weight: bold;
    }

    &.current:not(.disabled) .cell {
      background: rgba(0, 152, 250, 0.5) !important;
      color: #FFFFFF !important;
    }

    &.disabled .cell {
      color: rgba(188, 222, 255, 0.3) !important;
      background: transparent !important;

      &:hover {
        background: transparent !important;
        color: rgba(188, 222, 255, 0.3) !important;
      }
    }

    &.disabled {
      &:hover {
        background: transparent !important;
      }
    }
  }

  // 时间选择器
  .el-time-panel {
    background: transparent !important;
    border: none !important;
  }

  .el-time-spinner__item {
    color: #BCDEFF !important;

    &:hover:not(.disabled):not(.active) {
      background: rgba(0, 152, 250, 0.2) !important;
    }

    &.active:not(.disabled) {
      color: #FFFFFF !important;
      font-weight: bold;
    }

    &.disabled {
      color: rgba(188, 222, 255, 0.3) !important;
    }
  }
}
</style>
