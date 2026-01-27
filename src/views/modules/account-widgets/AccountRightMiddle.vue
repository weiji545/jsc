<template>
  <div class="split-layout">
    <div class="split-left-1">
      <EChartPieRing
        variant="pie"
        :data="chartData"
        height="100%"
        :options="pieOptions"
      />
    </div>
    <div class="split-right-2">
      <DataTable
        :columns="columns"
        :header-only="true"
        style="margin-bottom: 0;"
      />
      <PagedCarousel :items="tableData" :per-page="5" height="172px">
        <template #page="{ pageItems }">
          <DataTable
            :table-data="pageItems"
            :columns="columns"
            direction="row"
            max-height="172px"
            :show-header="false"
            :dense="true"
            @sort-change="handleTableSort"
          />
        </template>
      </PagedCarousel>
    </div>
  </div>
</template>

<script>
import EChartPieRing from "@/views/components/charts/EChartPieRing.vue";
import DataTable from "@/views/components/common/DataTable.vue";
import PagedCarousel from "@/views/components/common/PagedCarousel.vue";
import { formatNumber } from "@/utils/utils.js";

export default {
  name: "AccountRightMiddle",
  components: {
    EChartPieRing,
    DataTable,
    PagedCarousel,
  },
  data() {
    return {
      chartData: [
        { name: '活期啊啊啊啊啊', value: 35 },
        { name: '定期啊啊啊啊啊', value: 32 },
        { name: '协定啊啊啊啊啊', value: 20 },
        { name: '通知啊啊啊啊啊', value: 13 },
        { name: '东亚啊啊啊啊啊', value: 13 },
        { name: '其他啊啊啊啊啊', value: 13 },
      ],
      columns: [],
      tableData: [],
    };
  },
  computed: {
    pieOptions() {
      return this.getPieOptions(['#FAC858', '#283E81', '#91CC75', '#507AFC', '#097C38', '#93BEFF'], 'pie', {
        type: 'plain',
        orient: 'horizontal',
        width: 130,
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 8,
        left: 'center',
        top: '5%',
      });
    }
  },
  created() {
    this.initColumns();
    this.initData();
  },
  methods: {
    getPieOptions(colors, variant = 'pie', legendConfig = {}) {
      const isDonut = variant === 'donut';
      const radius = isDonut ? ['55%', '85%'] : ['0%', '86%'];
      const center = isDonut ? ["50%", "55%"] : ["50%", "60%"];
      return {
        tooltip: {
          confine: true
        },
        color: colors,
        legend: {
          top: "0%",
          left: "center",
          orient: "horizontal",
          width: 180,
          itemGap: 15,
          ...legendConfig,
        },
        series: [
          {
            radius: radius,
            center: center,
            labelLine: { show: false },
            label: {
              show: true,
              position: "inside",
              color: "#fff",
              formatter: "{d}%",
            },
          },
        ],
      };
    },
    initColumns() {
      const formatPercent = (row, column, cellValue) => {
        return cellValue ? cellValue + '%' : '-';
      };

      this.columns = [
        {
          prop: 'bankName',
          label: '银行名称',
          width: '100',
          maxLength: 4,
          showOverflowTooltip: true
        },
        {
          prop: 'type',
          label: '类型',
          width: '60'
        },
        {
          prop: 'count',
          label: '数量',
          width: '70',
          formatter: (row, column, cellValue) => formatNumber(cellValue, 0)
        },
        {
          prop: 'ratio',
          label: '占比',
          width: '70',
          formatter: formatPercent
        },
      ];
    },
    initData() {
      this.tableData = [
        { bankName: '中国银行', type: '活期', count: 450, ratio: 36.0 },
        { bankName: '中国工商银行', type: '定期', count: 380, ratio: 30.4 },
        { bankName: '建设银行', type: '协定', count: 250, ratio: 20.0 },
        { bankName: '农业银行', type: '通知', count: 170, ratio: 13.6 },
        { bankName: '民生银行', type: '通知', count: 140, ratio: 11.6 },
        { bankName: '兴业银行', type: '通知', count: 130, ratio: 10.4 },
      ];
    },
    handleTableSort(payload) {
        console.log('Sort change:', payload);
    }
  },
};
</script>

<style scoped>
.split-layout {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
}
.split-left-1 {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  overflow: hidden;
}
.split-right-2 {
  flex: 2;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  overflow: hidden;
  flex-direction: column;
}
</style>
