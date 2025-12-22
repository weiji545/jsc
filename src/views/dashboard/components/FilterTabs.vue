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
    <el-select
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
    </el-select>
  </div>
</template>

<script>
export default {
  name: 'FilterTabs',
  props: {
    scope: {
      type: String,
      default: 'global'
    },
    scopeOptions: {
      type: Array,
      default: () => []
    },
    time: {
      type: String,
      default: 'week'
    },
    timeOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      innerTime: this.time
    }
  },
  watch: {
    time(val) {
      this.innerTime = val
    }
  },
  methods: {
    // 切换范围
    onScopeClick(value) {
      this.$emit('change-scope', value)
    },
    // 切换时间
    onTimeChange(value) {
      this.$emit('change-time', value)
    }
  }
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

</style>


