<template>
  <div class="right-middle-container" style="height: 100%;">
    <!-- 境内数据轮播 -->
    <PagedCarousel
      v-if="scope === 'domestic'"
      :items="domesticPages"
      :perPage="1"
      height="220px"
      :autoplay="true"
    >
      <template #item="{ item }">
        <EChartBarLine
          :categories="item.categories"
          :bar-data="item.barData"
          :line-data="item.lineData"
          :height="220"
          :width="433"
          :unit="unit"
          :options="domesticOptions"
          line-unit="笔"
        />
      </template>
    </PagedCarousel>

    <!-- 境外数据轮播 -->
    <PagedCarousel
      v-else-if="scope === 'overseas'"
      :items="overseasPages"
      :perPage="1"
      height="220px"
      :autoplay="true"
    >
      <template #item="{ item }">
        <EChartBarLine
          :categories="item.categories"
          :bar-data="item.barData"
          :line-data="[]"
          :height="220"
          :width="433"
          :unit="''"
          visible-y="bar"
          :options="overseasOptions"
        />
      </template>
    </PagedCarousel>
  </div>
</template>

<script>
import EChartBarLine from '../../components/charts/EChartBarLine.vue'
import PagedCarousel from '../../components/common/PagedCarousel.vue'

export default {
  name: 'RightMiddleChart',
  components: { EChartBarLine, PagedCarousel },
  props: {
    scope: String,
    unit: String,
    domesticCategories: Array,
    domesticBarData: Array,
    domesticLineData: Array,
    domesticOptions: Object,
    overseasCategories: Array,
    overseasBarData: Array,
    overseasOptions: Object,
  },
  computed: {
    domesticPages() {
      return this.splitData(
        this.domesticCategories,
        this.domesticBarData,
        this.domesticLineData
      )
    },
    overseasPages() {
      return this.splitData(
        this.overseasCategories,
        this.overseasBarData,
        []
      )
    },
  },
  methods: {
    splitData(categories, barData, lineData) {
      if (!categories || !categories.length) return []
      const mid = Math.ceil(categories.length / 2)
      return [
        {
          categories: categories.slice(0, mid),
          barData: barData ? barData.slice(0, mid) : [],
          lineData: lineData ? lineData.slice(0, mid) : [],
        },
        {
          categories: categories.slice(mid),
          barData: barData ? barData.slice(mid) : [],
          lineData: lineData ? lineData.slice(mid) : [],
        },
      ]
    },
  },
}
</script>

<style lang="scss" scoped>
.right-middle-container {
  position: relative;

  :deep(.el-carousel__indicators--outside) {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    text-align: center;
    line-height: normal;

    .el-carousel__indicator {
      padding: 0 4px;
    }

    .el-carousel__button {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      opacity: 1;
    }

    .el-carousel__indicator.is-active button {
      background: #29F1FA;
      width: 12px;
      border-radius: 3px;
    }
  }
}
</style>
