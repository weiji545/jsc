<template>
  <div class="core-panel">
    <Globe3D v-if="scope === 'global'" />
    <ChinaMap v-else-if="scope === 'domestic'"/>
    <WorldMap v-else-if="scope === 'overseas'"/>
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

