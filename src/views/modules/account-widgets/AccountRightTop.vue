<template>
  <div class="split-layout">
    <div class="split-left-4">
      <EChartPieRing
        variant="donut"
        :data="chartData"
        height="100%"
        :options="pieOptions"
        centerText="银行账户总数"
        centerSubText="19200"
      />
    </div>
    <div class="split-right-5 vertical-layout">
      <div class="tab-section">
        <TabSwitch v-model="activeTab" :options="tabOptions" />
      </div>
      <div class="table-section">
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
              direction="column"
              max-height="172px"
              :show-header="false"
              :dense="true"
              @sort-change="handleTableSort"
            />
          </template>
        </PagedCarousel>
      </div>
    </div>
  </div>
</template>

<script>
import EChartPieRing from "@/views/components/charts/EChartPieRing.vue";
import TabSwitch from "@/views/components/common/TabSwitch.vue";
import DataTable from "@/views/components/common/DataTable.vue";
import PagedCarousel from "@/views/components/common/PagedCarousel.vue";
import { formatNumber } from "@/utils/utils.js";

export default {
  name: "AccountRightTop",
  components: {
    EChartPieRing,
    TabSwitch,
    DataTable,
    PagedCarousel,
  },
  data() {
    return {
      activeTab: "view1",
      tabOptions: [
        { label: "直联", value: "view1" },
        { label: "非直联", value: "view2" },
      ],
      chartData: [
        { name: '直联', value: 14592 },
        { name: '非直联', value: 4608 },
      ],
      columns: [],
      tableData: [],
    };
  },
  computed: {
    pieOptions() {
      return this.getPieOptions(['#6C63F0', '#ED589D'], 'donut');
    }
  },
  watch: {
    activeTab(val) {
      this.fetchData(val);
    },
  },
  created() {
    this.initColumns();
    this.fetchData(this.activeTab);
  },
  methods: {
    getPieOptions(colors, variant = 'pie', legendConfig = {}) {
      const isDonut = variant === 'donut';
      const radius = isDonut ? ['55%', '85%'] : ['0%', '86%'];
      const center = isDonut ? ["50%", "55%"] : ["50%", "60%"];
      return {
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
    fetchData(val) {
      console.log('Fetching RightTop data for:', val);
      if (val === 'view1') { // 直联
        this.tableData = [
          { bankName: '中国银行', count: 1250, ratio: 35.5 },
          { bankName: '中国工商银行', count: 980, ratio: 28.2 },
          { bankName: '建设银行', count: 750, ratio: 21.3 },
          { bankName: '农业银行', count: 520, ratio: 15.0 },
          { bankName: '民生银行', count: 357, ratio: 13.6 },
          { bankName: '交通银行', count: 357, ratio: 12.3 },
          { bankName: '兴业银行', count: 357, ratio: 10.5 },
          { bankName: '光大银行', count: 357, ratio: 10.5 },
        ];
      } else { // 非直联
        this.tableData = [
          { bankName: '招商银行', count: 600, ratio: 40.0 },
          { bankName: '浦发银行', count: 500, ratio: 33.3 },
          { bankName: '兴业银行', count: 400, ratio: 26.7 },
        ];
      }
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
.split-left-4 {
  flex: 4;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.split-right-5 {
  flex: 5;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 10px;
}
.vertical-layout {
  padding: 0;
  flex-direction: column !important;
  align-items: stretch !important;
  justify-content: flex-start !important;
  overflow: hidden;
}
.tab-section {
  flex-shrink: 0;
  padding-bottom: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.table-section {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  width: 100%;
}
</style>
