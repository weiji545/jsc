<template>
  <div class="right-middle-container" style="height: 100%;">
    <EChartBarLine
      v-if="scope === 'domestic'"
      :categories="domesticCategories"
      :bar-data="domesticBarData"
      :line-data="domesticLineData"
      :height="240"
      :unit="unit"
      :options="domesticOptions"
    />
    <EChartBarLine
      v-else-if="scope === 'overseas'"
      :categories="overseasCategories"
      :bar-data="overseasBarData"
      :line-data="[]"
      :height="240"
      :unit="unit"
      visible-y="bar"
      :options="overseasOptions"
    />
  </div>
</template>

<script>
import EChartBarLine from '../../components/charts/EChartBarLine.vue'

export default {
  name: 'RightMiddleChart',
  components: { EChartBarLine },
  props: {
    scope: String,
    unit: String,
    domesticCategories: Array,
    domesticBarData: Array,
    domesticLineData: Array,
    domesticOptions: Object,
    overseasCategories: Array,
    overseasBarData: Array,
    overseasOptions: Object
  }
}
</script>
