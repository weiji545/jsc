<template>
  <div class="core-panel">
    <Globe3D v-if="scope === 'global'" />
    <ChinaMap v-else-if="scope === 'domestic'"/>
  </div>
</template>

<script>
import Globe3D from './Globe3D.vue'
import ChinaMap from '../components/chinamap/ChinaMap.vue'

export default {
  name: 'CoreOverviewPanel',
  components: { Globe3D, ChinaMap },
  props: {
    scope: {
      type: String,
      default: 'global'
    },
  }
}
</script>

<style lang="scss" scoped>
.core-panel {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.globe-wrapper) {
  width: 100%;
  height: 100%;
}
</style>

