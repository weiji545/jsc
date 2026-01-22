<template>
  <PagedCarousel :items="chartDisplayData" :per-page="5" height="220px">
    <template #page="{ pageItems, pageIndex }">
      <EChartBarLine
        :categories="packetChartData(pageItems).categories"
        :barData="packetChartData(pageItems).values"
        :visibleY="'bar'"
        :xAxisMaxLength="4"
        unit="户"
        height="220"
        direction="horizontal"
        :barMaxWidth="13"
        :valueAxisMax="axisMax"
        @axis-ticks="(payload) => handleTicks(payload, pageIndex)"
        :options="{
          legend: { show: false },
          grid: { left: 70, top: 20, bottom: 30 },
        }"
      />
    </template>
  </PagedCarousel>
</template>

<script>
import EChartBarLine from "@/views/components/charts/EChartBarLine.vue";
import PagedCarousel from "@/views/components/common/PagedCarousel.vue";

export default {
  name: "AccountLeftBottom",
  components: {
    EChartBarLine,
    PagedCarousel,
  },
  data() {
    return {
      axisMax: null,
      rawData: {
         categories: [
          "中国", "美国", "日本", "俄罗斯", "玻利维亚",
          "法国", "德国", "英国", "澳大利亚", "加拿大",
          "新加坡", "韩国", "意大利", "巴西", "印度"
        ],
        values: [
          12002, 10000, 8000, 7000, 1200,
          1000, 950, 900, 850, 800,
          750, 700, 650, 600, 550
        ],
      }
    };
  },
  computed: {
    // 将 rawData 转换为对象数组供 PagedCarousel 使用
    chartDisplayData() {
      if (!this.rawData || !this.rawData.categories) return [];
      return this.rawData.categories.map((cat, idx) => ({
        category: cat,
        value: this.rawData.values[idx] || 0
      }));
    },
  },
  methods: {
    // 将分页后的对象数组还原为 Categories/Values 格式供 Chart 使用
    packetChartData(items) {
      return {
        categories: items.map(i => i.category),
        values: items.map(i => i.value)
      };
    },
    // 处理坐标轴刻度，用于统一翻页后的坐标轴最大值
    handleTicks(payload, pageIndex) {
      if (pageIndex === 0 && payload && payload.max) {
        this.axisMax = payload.max;
      }
    },
  },
};
</script>

<style scoped>
</style>
