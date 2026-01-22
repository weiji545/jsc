<template>
  <div class="split-layout">
    <div class="split-left-4">
      <EChartPieRing
        variant="donut"
        :data="chartData"
        height="100%"
        :options="pieOptions"
        centerText="账户总数"
        centerSubText="19200"
      />
    </div>
    <div class="split-right-5 vertical-layout">
      <div class="tab-section">
        <TabSwitch v-model="activeTab" :options="tabOptions" />
      </div>
      <DataTable
        :columns="columns"
        :header-only="true"
        style="margin-bottom: 0;"
      />
      <PagedCarousel :items="tableData" :per-page="5" height="157px">
        <template #page="{ pageItems }">
          <DataTable
            :table-data="pageItems"
            :columns="columns"
            direction="column"
            max-height="157px"
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
import TabSwitch from "@/views/components/common/TabSwitch.vue";
import DataTable from "@/views/components/common/DataTable.vue";
import PagedCarousel from "@/views/components/common/PagedCarousel.vue";
import { formatNumber } from "@/utils/utils.js";

export default {
  name: "AccountRightBottom",
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
        { label: "正常", value: "view1" },
        { label: "销户", value: "view2" },
      ],
      chartData: [
        { name: '正常', value: 14592 },
        { name: '销户', value: 4608 },
      ],
      columns: [],
      tableData: [],
    };
  },
  computed: {
    pieOptions() {
      return this.getPieOptions(['#4396F3', '#5EC8C1'], 'donut');
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
      this.columns = [
        {
          prop: 'bankName',
          label: '银行名称',
          width: '120',
          maxLength: 4,
          showOverflowTooltip: true
        },
        {
          prop: 'accountCount',
          label: '账户数量',
          width: '100',
          formatter: (row, column, cellValue) => formatNumber(cellValue, 0)
        },
      ];
    },
    fetchData(val) {
      console.log('Fetching RightBottom data for:', val);
      if (val === 'view1') { // 正常
        this.tableData = [
          { bankName: '中国银行', accountCount: 5680 },
          { bankName: '中国工商银行', accountCount: 4320 },
          { bankName: '建设银行', accountCount: 3200 },
          { bankName: '农业银行', accountCount: 2150 },
          { bankName: '浦发银行', accountCount: 1750 },
          { bankName: '民生银行', accountCount: 1620 },
        ];
      } else { // 销户
        this.tableData = [
          { bankName: '民生银行', accountCount: 120 },
          { bankName: '光大银行', accountCount: 80 },
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
</style>
