<template>
  <div class="core-filter-bar">
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
        @change="onTimeChange">
      </el-cascader>

      <template v-if="showTimeRangeType > 0">
        <div v-if="showTimeRangeType === 1">
          <el-date-picker
            v-model="timeValue"
            value-format="yyyy-MM-dd"
            :clearable="false"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptionsDate"
            @focus="choiceDate = null"
            @change="onRangeChange">
          </el-date-picker>
        </div>
        <div v-if="showTimeRangeType === 2">
          <el-date-picker
            v-model="timeValue"
            value-format="yyyy-MM-dd"
            type="monthrange"
            :clearable="false"
            range-separator="-"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            :picker-options="pickerOptionsMonth"
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


  ::v-deep .el-input__inner {
    background: #142765; // rgba(0, 152, 250, 0.45);
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
    background: #142765; // rgba(0, 152, 250, 0.45);
    color: #BCDEFF;
    font-size: 14px;
  }

  ::v-deep .el-input__suffix {
    color: #fff;
  }
}

</style>


