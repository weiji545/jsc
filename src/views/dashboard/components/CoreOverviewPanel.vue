<template>
  <div class="core-panel">
    <Globe3D :scope="scope" :time="time" />
  </div>
</template>

<script>
import Globe3D from './Globe3D.vue'

export default {
  name: 'CoreOverviewPanel',
  components: { Globe3D },
  props: {
    scope: {
      type: String,
      default: 'global'
    },
    time: {
      type: String,
      default: 'week'
    }
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

