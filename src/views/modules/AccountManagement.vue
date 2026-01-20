<template>
  <DashboardContent
    :data-list="dataList"
    :panelsConfig="panelsConfig"
    :scope="balanceScope"
    v-loading="false"
    element-loading-text="加载中..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.7)"
    @panel-action-change="handlePanelActionChange"
  >
    <template #left-top>
      <div class="module-content">模块二 - 左上内容</div>
    </template>
    <template #left-middle>
      <div class="module-content">模块二 - 左中内容</div>
    </template>
    <template #left-bottom>
      <EChartBarLine
        :categories="leftBottomData.categories"
        :barData="leftBottomData.values"
        :visibleY="'bar'"
        :xAxisMaxLength="4"
        unit="户"
        height="260"
        direction="horizontal"
        :barMaxWidth="13"
        :options="{
          legend: { show: false },
          grid: { left: 70, top: 20, bottom: 50 },
        }"
      />
    </template>
    <template #center-top>
      <div class="core-top">
        <CoreOverviewPanel
          :scope="balanceScope"
          :globe-country-data="globeCountryData"
          :china-map-data="chinaMapData"
          :china-map-flow-data="chinaMapFlowData"
          :world-map-flow-data="worldMapFlowData"
          :world-account-data="globeCountryData"
        />
        <FilterTabs
          :showFundFlowOption="false"
          :scope="balanceScope"
          :scope-options="balanceScopes"
          :time="balanceTime"
          :time-options="balanceTimeOptions"
          @change-scope="changeBalanceScope"
          @change-time="(val) => (balanceTime = val)"
          @change-custom-time="handleCustomTimeChange"
        />
      </div>
    </template>
    <template #center-bottom>
      <EChartBarLine
        :categories="centerBottomData.categories"
        :barData="centerBottomData.values"
        :lineData="centerBottomData.values"
        legendName="账户余额"
        series2Name="趋势"
        unit="万元"
        height="180"
        line-color="#24D9B5"
        :options="{ grid: { top: 30, left: 70, right: 30, bottom: 40 } }"
      />
    </template>
    <template #right-top>
      <div class="split-layout">
        <div class="split-left-4">
          <EChartPieRing
            variant="donut"
            :data="rightTopData"
            height="100%"
            :options="getPieOptions(['#6C63F0', '#ED589D'], 'donut')"
            centerText="银行账户总数"
            centerSubText="19200"
          />
        </div>
        <div class="split-right-5 vertical-layout">
          <div class="tab-section">
            <TabSwitch v-model="rightTopSwitch" :options="rightTopOptions" />
          </div>
          <div class="table-section">
            <DataTable
              :table-data="rightTopTableData"
              :columns="rightTopColumns"
              direction="column"
              max-height="200px"
              @sort-change="handleTableSort"
            />
          </div>
        </div>
      </div>
    </template>
    <template #right-middle>
      <div class="split-layout">
        <div class="split-left-1">
          <EChartPieRing
            variant="pie"
            :data="rightMiddleData"
            height="100%"
            :options="getPieOptions(['#FAC858', '#283E81', '#91CC75', '#507AFC', '#097C38', '#93BEFF'], 'pie', {
              type: 'plain',
              orient: 'horizontal',
              width: 165,
              itemWidth: 10,
              itemHeight: 10,
              itemGap: 8,
              left: 'center',
              top: '5%',
            })"
          />
        </div>
        <div class="split-right-2">
          <DataTable
            :table-data="rightMiddleTableData"
            :columns="rightMiddleColumns"
            direction="row"
            max-height="250px"
            @sort-change="handleTableSort"
          />
        </div>
      </div>
    </template>
    <template #right-bottom>
      <div class="split-layout">
        <div class="split-left-4">
          <EChartPieRing
            variant="donut"
            :data="rightBottomData"
            height="100%"
            :options="getPieOptions(['#4396F3', '#5EC8C1'], 'donut')"
            centerText="账户总数"
            centerSubText="19200"
          />
        </div>
        <div class="split-right-5 vertical-layout">
          <div class="tab-section">
            <TabSwitch v-model="rightBottomSwitch" :options="rightBottomOptions" />
          </div>
          <div class="table-section">
            <DataTable
              :table-data="rightBottomTableData"
              :columns="rightBottomColumns"
              direction="column"
              max-height="200px"
              @sort-change="handleTableSort"
            />
          </div>
        </div>
      </div>
    </template>
  </DashboardContent>
</template>

<script>
import DashboardContent from "../components/layout/DashboardContent.vue";
import CoreOverviewPanel from "../components/panels/CoreOverviewPanel.vue";
import FilterTabs from "../components/common/FilterTabs.vue";
import EChartBarLine from "../components/charts/EChartBarLine.vue";
import EChartPieRing from "../components/charts/EChartPieRing.vue";
import TabSwitch from "../components/common/TabSwitch.vue";
import DataTable from "../components/common/DataTable.vue";
import { getOverviewData, getChinaMapData, getChinaMapFlowData, getWorldMapFlowData } from '../../api/dashboard';

export default {
  name: "AccountManagement",
  components: {
    DashboardContent,
    CoreOverviewPanel,
    FilterTabs,
    EChartBarLine,
    EChartPieRing,
    TabSwitch,
    DataTable,
  },
  data() {
    return {
      // 模块二的数据展示列表
      dataList: [
        { label: "模块一", value: 12300.23 },
        { label: "数据二", value: 4560000.46, unit: '' },
        { label: "统计三", value: 789000, unit: '个' },
        { label: "统计四", value: 95000, unit: '户' },
      ],
      balanceScope: "global",
      balanceTime: ['day', '7'],
      customTimeRange: { startBsnDate: '', endBsnDate: '' },
      balanceScopes: [
        { label: '全局', value: 'global' },
        { label: '境内', value: 'domestic' },
        { label: '境外', value: 'overseas' },
      ],
      balanceTimeOptions: [
        {
          value: 'day',
          label: '按天',
          children: [
            { value: '7', label: '近7天' },
            { value: 'month', label: '近一月' },
            { value: 'customizedDay', label: '自定义天' },
          ],
        },
        {
          value: 'month',
          label: '按月',
          children: [
            { value: 'year', label: '近一年' },
            { value: 'customizedMonth', label: '自定义月' },
          ],
        },
      ],
      globeCountryData: [],
      chinaMapData: [],
      chinaMapFlowData: [],
      worldMapFlowData: [],
      panelsConfig: {
        left: [
          {
            title: "账户性质",
            unit: "",
            actionLeft: {
              type: "radio",
              value: "bank",
              options: [
                { label: "银行", value: "bank" },
                { label: "机构", value: "institution" },
              ],
            },
            actionRight: {
              type: "text",
              value: "amount",
              options: [
                { label: "金额", value: "amount" },
                { label: "数量", value: "count" },
              ],
            },
          },
          {
            title: "账户金额",
            showBottomCorner: true,
            contentPadding: {
              paddingTop: 9,
              paddingLeft: 14,
              paddingRight: 14,
            },
            actionLeft: {
              type: "radio",
              value: "bank",
              options: [
                { label: "银行", value: "bank" },
                { label: "机构", value: "institution" },
              ],
            },
            actionRight: {
              type: "text",
              value: "amount",
              options: [
                { label: "金额", value: "amount" },
                { label: "数量", value: "count" },
              ],
            },
          },
          {
            title: "开户行所在国家地区",
            unit: "户",
          },
        ],
        center: {
          title: "近期趋势分析",
          unit: "万元",
          contentPadding: { paddingTop: 0 },
        },
        right: [
          {
            title: "直联渠道",
            actionLeft: {
              type: "radio",
              value: "bank",
              options: [
                { label: "银行", value: "bank" },
                { label: "机构", value: "institution" },
              ],
            },
          },
          {
            title: "存款类型",
            actionLeft: {
              type: "radio",
              value: "bank",
              options: [
                { label: "银行", value: "bank" },
                { label: "机构", value: "institution" },
              ],
            },
          },
          {
            title: "账户状态",
            actionLeft: {
              type: "radio",
              value: "bank",
              options: [
                { label: "银行", value: "bank" },
                { label: "机构", value: "institution" },
              ],
            },
            // actionRight: {
            //   type: 'text',
            //   value: 'amount',
            //   options: [
            //     { label: '状态', value: 'amount' },
            //     { label: '详情', value: 'count' },
            //   ]
            // }
          },
        ],
      },
      leftBottomData: {
        categories: ["中国", "美国", "日本", "俄罗斯", "玻利维亚共和国"],
        values: [12000, 10000, 8000, 7000, 1200],
      },
      centerBottomData: {
        categories: (function () {
          const arr = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            arr.push(`${m}-${day}`);
          }
          return arr;
        })(),
        values: [1500, 1600, 1550, 1700, 1650, 1800, 1900],
      },
      rightTopSwitch: "view1",
      rightTopOptions: [
        { label: "直联", value: "view1" },
        { label: "非直联", value: "view2" },
      ],
      rightTopData: [
        { name: '直联', value: 14592 },
        { name: '非直联', value: 4608 },
      ],
      rightMiddleData: [
        { name: '活期', value: 35 },
        { name: '定期', value: 32 },
        { name: '协定', value: 20 },
        { name: '通知', value: 13 },
        { name: '东亚', value: 13 },
        { name: '其他', value: 13 },
      ],
      rightBottomSwitch: "view1",
      rightBottomOptions: [
        { label: "正常", value: "view1" },
        { label: "销户", value: "view2" },
      ],
      rightBottomData: [
        { name: '正常', value: 14592 },
        { name: '销户', value: 4608 },
      ],
      // 表格列配置
      rightTopColumns: [],
      rightMiddleColumns: [],
      rightBottomColumns: [],
      // 右上表格数据
      rightTopTableData: [],
      // 右中表格数据
      rightMiddleTableData: [],
      // 右下表格数据
      rightBottomTableData: [],
    };
  },
  watch: {
    // 监听右上 Tab 切换
    rightTopSwitch(val) {
      this.fetchRightTopTableData(val)
    },
    // 监听右下 Tab 切换
    rightBottomSwitch(val) {
      this.fetchRightBottomTableData(val)
    },
  },
  created() {
    this.initTableColumns()
    this.initTableData()
    this.fetchMapData()
  },
  methods: {
    getPieOptions(colors, variant = 'pie', legendConfig = {}) {
      const isDonut = variant === 'donut'
      const radius = isDonut ? ['55%', '85%'] : ['0%', '86%'];
      const center = isDonut ? ["50%", "55%"] : ["50%", "60%"];
      return {
        color: colors,
        legend: {
          top: "0%",
          left: "center",
          orient: "horizontal",
          width: 180, // Force wrapping (approx 2 items per line)
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
    changeBalanceScope(val) {
      this.balanceScope = val
      this.updatePanelTitles()
    },
    handleCustomTimeChange(payload) {
      this.customTimeRange = payload
    },
    async fetchMapData() {
      try {
        const [overviewRes, chinaRes, chinaFlowRes, flowRes] = await Promise.all([
          getOverviewData(),
          getChinaMapData(),
          getChinaMapFlowData(),
          getWorldMapFlowData(),
        ]);

        if (overviewRes.code === 200) {
           this.globeCountryData = overviewRes.data.globeCountryData || [];
        }
        if (chinaRes.code === 200) this.chinaMapData = chinaRes.data;
        if (chinaFlowRes.code === 200) this.chinaMapFlowData = chinaFlowRes.data;
        if (flowRes.code === 200) this.worldMapFlowData = flowRes.data;
      } catch (error) {
        console.error('Failed to fetch map data:', error);
      }
    },
    updatePanelTitles() {
      // 左中 (Index 1) 标题逻辑 - 始终生效
      const leftPanel = this.panelsConfig.left[1]
      const leftActionRightValue = leftPanel.actionRight ? leftPanel.actionRight.value : 'amount'
      if (leftActionRightValue === 'amount') {
        leftPanel.title = '账户金额'
      } else {
        leftPanel.title = '账户数量'
      }

      // 当 balanceScope 为 overseas 时，动态更新右中标题
      if (this.balanceScope === 'overseas') {
        // 右中 (Index 1) 标题逻辑
        const rightPanel = this.panelsConfig.right[1]
        const rightActionLeftValue = rightPanel.actionLeft ? rightPanel.actionLeft.value : 'bank'
        if (rightActionLeftValue === 'bank') {
          rightPanel.title = '银行类型'
        } else {
          rightPanel.title = '机构类型'
        }
      } else {
        // 非 overseas 时，恢复右中默认标题
        this.panelsConfig.right[1].title = '存款类型'
      }
    },
    // 处理panel action变化事件
    handlePanelActionChange({ side, index, actionType, value }) {
      console.log('Panel action changed:', { side, index, actionType, value })

      // 更新panelsConfig中相应的值
      try {
        const panelConfig = this.panelsConfig[side]
        if (Array.isArray(panelConfig)) {
          // left 或 right 侧，是数组
          if (panelConfig[index]) {
            const actionKey = actionType === 'left' ? 'actionLeft' : 'actionRight'
            if (panelConfig[index][actionKey]) {
              panelConfig[index][actionKey].value = value

              // 触发重新请求
              if (side === 'left') {
                this.fetchLeftPanelData(index)
              } else if (side === 'right') {
                this.fetchRightPanelData(index)
              }
            }
          }
        } else if (panelConfig) {
          // center 侧，是对象
          const actionKey = actionType === 'left' ? 'actionLeft' : 'actionRight'
          if (panelConfig[actionKey]) {
            panelConfig[actionKey].value = value

            // 触发重新请求
            if (side === 'center') {
              this.fetchCenterPanelData()
            }
          }
        }
      } catch (e) {
        console.error('Error updating panel action:', e)
      }

      this.updatePanelTitles()
    },
    // 初始化表格列配置
    initTableColumns() {
      // 引入formatter方法
      const formatNumber = require('@/utils/utils.js').formatNumber
      const formatPercent = (row, column, cellValue) => {
        return cellValue ? cellValue + '%' : '-'
      }

      // 右上：银行名称 数量 占比
      this.rightTopColumns = [
        {
          prop: 'bankName',
          label: '银行名称',
          width: '100',
          maxLength: 4, // 超过4个字符显示省略号
          showOverflowTooltip: true // hover时显示完整内容
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
      ]

      // 右中：银行名称 类型 数量 占比
      this.rightMiddleColumns = [
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
      ]

      // 右下：银行名称 账户数量
      this.rightBottomColumns = [
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
      ]
    },
    // 初始化表格数据
    initTableData() {
      this.fetchRightTopTableData(this.rightTopSwitch)
      this.fetchRightBottomTableData(this.rightBottomSwitch)

      // 右中数据（固定展示）
      this.rightMiddleTableData = [
        { bankName: '中国银行', type: '活期', count: 450, ratio: 36.0 },
        { bankName: '中国工商银行', type: '定期', count: 380, ratio: 30.4 },
        { bankName: '建设银行', type: '协定', count: 250, ratio: 20.0 },
        { bankName: '农业银行', type: '通知', count: 170, ratio: 13.6 },
      ]
    },
    // 请求右上表格数据
    fetchRightTopTableData(val) {
      console.log('Fetching RightTop data for:', val)
      // 模拟根据不同 Tab 加载不同数据
      if (val === 'view1') { // 直联
        this.rightTopTableData = [
          { bankName: '中国银行', count: 1250, ratio: 35.5 },
          { bankName: '中国工商银行', count: 980, ratio: 28.2 },
          { bankName: '建设银行', count: 750, ratio: 21.3 },
          { bankName: '农业银行', count: 520, ratio: 15.0 },
        ]
      } else { // 非直联
        this.rightTopTableData = [
          { bankName: '招商银行', count: 600, ratio: 40.0 },
          { bankName: '浦发银行', count: 500, ratio: 33.3 },
          { bankName: '兴业银行', count: 400, ratio: 26.7 },
        ]
      }
    },
    // 请求右下表格数据
    fetchRightBottomTableData(val) {
      console.log('Fetching RightBottom data for:', val)
      // 模拟请求
      if (val === 'view1') { // 正常
        this.rightBottomTableData = [
          { bankName: '中国银行', accountCount: 5680 },
          { bankName: '中国工商银行', accountCount: 4320 },
          { bankName: '建设银行', accountCount: 3200 },
          { bankName: '农业银行', accountCount: 2150 },
        ]
      } else { // 销户
        this.rightBottomTableData = [
          { bankName: '民生银行', accountCount: 120 },
          { bankName: '光大银行', accountCount: 80 },
        ]
      }
    },
    // 请求左侧模块数据
    fetchLeftPanelData(index) {
      const config = this.panelsConfig.left[index]
      const leftVal = config.actionLeft ? config.actionLeft.value : null
      const rightVal = config.actionRight ? config.actionRight.value : null
      console.log(`Fetching Left[${index}] data. ActionLeft: ${leftVal}, ActionRight: ${rightVal}`)

      // 模拟数据刷新逻辑
      // 这里可以根据不同 index 展示不同的 Mock 数据逻辑
    },
    // 请求中间模块数据
    fetchCenterPanelData() {
      const config = this.panelsConfig.center
      const leftVal = config.actionLeft ? config.actionLeft.value : null
      console.log(`Fetching Center data. ActionLeft: ${leftVal}`)
    },
    // 请求右侧模块数据
    fetchRightPanelData(index) {
      const config = this.panelsConfig.right[index]
      const leftVal = config.actionLeft ? config.actionLeft.value : null
      const rightVal = config.actionRight ? config.actionRight.value : null
      console.log(`Fetching Right[${index}] data. ActionLeft: ${leftVal}, ActionRight: ${rightVal}`)

      // 特殊处理右侧各模块，因为它们有独立的数据变量
      if (index === 0) {
        this.fetchRightTopTableData(this.rightTopSwitch)
      } else if (index === 1) {
        // 刷新右中表格数据
        this.rightMiddleTableData = [
          { bankName: '招商银行', type: '活期', count: 120, ratio: 10.0 },
          { bankName: '浦发银行', type: '定期', count: 80, ratio: 8.0 },
        ]
      } else if (index === 2) {
        this.fetchRightBottomTableData(this.rightBottomSwitch)
      }
    },
    // 处理表格排序
    handleTableSort({ prop, order }) {
      console.log('Table sort changed:', { prop, order })
      // 这里可以添加排序逻辑或发起API请求
    },
  },
};
</script>

<style lang="scss" scoped>
.module-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
}

.core-top {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 10px;
  width: 100%;

  // 让地球组件占用更多空间
  :deep(.core-panel) {
    flex: 1;
    min-height: 0;
  }

  // FilterTabs 使用绝对定位
  :deep(.core-filter-bar) {
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: 20px;
    z-index: 10;
  }
}

.text-toggle-group {
  display: flex;
  align-items: center;
}
.text-toggle-sep {
  color: #9ec7f0;
  margin: 0 4px;
  font-size: 12px;
}
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
.split-left-1 {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0; // 关键：允许flex子元素收缩
  overflow: hidden; // 防止溢出
}
.split-right-2 {
  flex: 2;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0; // 关键：允许flex子元素收缩
  overflow: hidden; // 防止溢出
}

// 垂直布局样式
.vertical-layout {
  padding: 0;
  flex-direction: column !important;
  align-items: stretch !important;
  justify-content: flex-start !important;
  overflow: hidden; // 防止溢出
}

// TabSwitch区域
.tab-section {
  flex-shrink: 0;
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 表格区域
.table-section {
  flex: 1;
  min-height: 0; // 关键：允许flex子元素收缩
  overflow: hidden; // 防止溢出
  width: 100%; // 确保不超过父容器宽度
}
</style>

