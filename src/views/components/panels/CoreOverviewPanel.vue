<template>
  <div class="core-panel">
    <transition name="fade" mode="out-in">
      <Globe3D
        v-if="scope === 'global'"
        key="globe-3d"
        :globe-country-data="globeCountryData"
      />
      <ChinaMap
        v-else-if="scope === 'domestic'"
        key="china-map"
        :map-data="chinaMapData"
        :flow-data-prop="chinaMapFlowData"
        @province-click="$emit('province-click', $event)"
      />
      <WorldMap
        v-else-if="scope === 'overseas'"
        key="world-map"
        :flow-data-prop="worldMapFlowData"
        :account-data-prop="worldAccountData"
        @country-click="$emit('country-click', $event)"
      />
    </transition>
  </div>
</template>

<script>
import Globe3D from '../visual/Globe3D'
import ChinaMap from '../visual/ChinaMap'
import WorldMap from '../visual/WorldMap'

export default {
  name: 'CoreOverviewPanel',
  components: { Globe3D, ChinaMap, WorldMap },
  props: {
    scope: {
      type: String,
      default: 'global',
    },
    globeCountryData: {
      type: [Object, Array],
      default: () => ({}),
    },
    chinaMapData: {
      type: Array,
      default: () => [],
    },
    chinaMapFlowData: {
      type: Array,
      default: () => [],
    },
    worldMapFlowData: {
      type: Array,
      default: () => [],
    },
    worldAccountData: {
      type: Array,
      default: () => [],
    },
  },
}
</script>

<style lang="scss" scoped>
.core-panel {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

:deep(.globe-wrapper) {
  width: 100%;
  height: 100%;
}

/* 过渡动画 - 确保旧组件完全销毁后再显示新组件 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* 确保过渡期间组件占据完整空间 */
.fade-enter-active, .fade-leave-active {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>

