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

  .is-light-mode & {
    border-color: #8CD1FD;
  }
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;

  /* Unselected state (Dark mode default) */
  color: #BCDEFF;
  background: linear-gradient( 0deg, rgba(9,136,255,0.5) 0%, rgba(9,17,39,0) 100%);

  &.active {
    /* Selected state (Dark mode default) */
    font-weight: bold;
    color: #FFFFFF;
    background: #204F8E;
  }

  /* Border between items (Dark mode default) */
  &:not(:last-child) {
    border-right: 2px solid #0098FA;
  }

  /* Light mode styles */
  .is-light-mode & {
    color: #666666;
    background: #FFFFFF;

    &:not(:last-child) {
      border-right: 2px solid #8CD1FD;
    }

    &.active {
      color: #FFFFFF;
      background: #53BAFC;
      font-weight: bold;

      /* Active border in light mode */
      &::after {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border: 2px solid #0098FA;
        pointer-events: none;
        z-index: 1;
      }
    }
  }
}
</style>

