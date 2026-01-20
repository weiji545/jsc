<template>
  <div class="custom-tab-switch">
    <div
      v-for="(item, index) in options"
      :key="item.value"
      class="tab-item"
      :class="{
        'active': value === item.value,
        'first-item': index === 0,
        'last-item': index === options.length - 1
      }"
      @click="$emit('input', item.value)"
    >
      {{ item.label }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'TabSwitch',
  props: {
    value: {
      type: [String, Number],
      required: true
    },
    options: {
      type: Array,
      default: () => [],
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-tab-switch {
  display: flex;
  width: 100%;
  height: 29px;
  border: 2px solid #0098FA;
  box-sizing: border-box;
  /* Assuming no border-radius is explicitly requested, but usually 2-4px looks better.
     I will stick to strict requirements or minimal defaults. */
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;

  /* Unselected state */
  color: #BCDEFF;
  background: linear-gradient( 0deg, rgba(9,136,255,0.5) 0%, rgba(9,17,39,0) 100%);

  &.active {
    /* Selected state */
    font-weight: bold;
    color: #FFFFFF;
    background: #204F8E;
  }

  /* Border between items */
  &:not(:last-child) {
    border-right: 2px solid #0098FA;
  }
}
</style>
