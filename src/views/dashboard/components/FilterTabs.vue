<template>
  <div class="core-filter-bar">
    <div class="core-radios">
      <div
        v-for="opt in scopeOptions"
        :key="opt.value"
        :class="['core-radio', { active: scope === opt.value }]"
        @click="onScopeClick(opt.value)"
      >
        <!--        <span class="core-slab"></span>-->
        <span class="core-label">{{ opt.label }}</span>
      </div>
    </div>
    <div class="core-options">
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
            type="dates"
            v-model="timeValue"
            placeholder="选择一个或多个日期">
          </el-date-picker>
        </div>
        <div v-if="showTimeRangeType === 2">
          <el-date-picker
            type="months"
            v-model="timeValue"
            placeholder="选择一个或多个月">
          </el-date-picker>
        </div>
      </template>
    </div>

    <!--    <el-select
          v-model="innerTime"
          class="accent-select"
          size="small"
          :popper-append-to-body="true"
          popper-class="jsc-highest-popper"
          style="width: 120px"
          @change="onTimeChange"
        >
          <el-option
            v-for="item in timeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>-->
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
      const lastId = this.innerTime.at(-1)
      return ['111', '222'].indexOf(lastId) + 1
    },
  },
  methods: {
    // 切换范围
    onScopeClick(value) {
      this.$emit('change-scope', value)
    },
    // 切换时间
    onTimeChange(value) {
      console.log('切换时间', value)
      this.$emit('change-time', value)
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
  gap: 100px;

  ::v-deep .el-cascader {
    width: 150px;
  }
}

.core-radios {
  display: flex;
  gap: 100px;
}

.core-radio {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: #fff;
  font-size: 14px;
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
    color: #29F1FA;
  }
}


.core-label {
  font-size: 14px;
  color: #9EC7F0;
}


.core-options {
  display: flex;
  gap: 20px;

  ::v-deep .el-date-editor.el-input {
    width: 173px;

  }


  ::v-deep .el-input__inner {
    background: rgba(0, 152, 250, 0.45);
    border: 1px solid #0098FA;
    color: #BCDEFF;
    font-size: 14px;
    padding-right: 10px;
    //background: linear-gradient(135deg, rgba(0, 212, 255, 0.25), rgba(91, 141, 239, 0.25));
    //color: #fff;
    //border-color: rgba(0, 212, 255, 0.5);
  }

  ::v-deep .el-input__suffix {
    color: #fff;
  }
}

</style>


