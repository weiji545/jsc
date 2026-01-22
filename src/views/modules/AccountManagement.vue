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
      <AccountLeftBottom />
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
          :show-fund-flow-option="true"
          :scope="balanceScope"
          :scope-options="balanceScopes"
          :time="balanceTime"
          :time-options="balanceTimeOptions"
          :fund-flow-domestic-options="fundFlowDomesticOptions"
          :fund-flow-overseas-options="fundFlowOverseasOptions"
          @change-scope="changeBalanceScope"
          @change-time="(val) => (balanceTime = val)"
          @change-custom-time="handleCustomTimeChange"
          @change-fund-flow="handleFundFlowChange"
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
      <AccountRightTop />
    </template>
    <template #right-middle>
      <AccountRightMiddle />
    </template>
    <template #right-bottom>
      <AccountRightBottom />
    </template>
  </DashboardContent>
</template>

<script>
import DashboardContent from "../components/layout/DashboardContent.vue";
import CoreOverviewPanel from "../components/panels/CoreOverviewPanel.vue";
import FilterTabs from "../components/common/FilterTabs.vue";
import EChartBarLine from "../components/charts/EChartBarLine.vue";
import AccountRightTop from "./account-widgets/AccountRightTop.vue";
import AccountRightMiddle from "./account-widgets/AccountRightMiddle.vue";
import AccountRightBottom from "./account-widgets/AccountRightBottom.vue";
import AccountLeftBottom from "./account-widgets/AccountLeftBottom.vue";
import { getOverviewData, getChinaMapData, getChinaMapFlowData, getWorldMapFlowData } from '../../api/dashboard';

export default {
  name: "AccountManagement",
  components: {
    DashboardContent,
    CoreOverviewPanel,
    FilterTabs,
    EChartBarLine,
    AccountRightTop,
    AccountRightMiddle,
    AccountRightBottom,
    AccountLeftBottom,
  },
  data() {
    return {
      // 境内外资金流向
      fundFlowDomesticOptions: [
        {
          label: '资金流入',
          value: 'inflow',
          children: [
            {
              label: '北京',
              value: 'beijing',
            }, {
              label: '上海',
              value: 'shanghai',
            }],
        },
        {
          label: '资金流出',
          value: 'outflow',
          children: [
            {
              label: '杭州',
              value: 'hangzhou',
            }, {
              label: '深圳',
              value: 'shenzhen',
            }],
        }],
      fundFlowOverseasOptions: [
        {
          label: '资金流入',
          value: 'inflow',
          children: [
            {
              label: '美国',
              value: 'USA',
            }, {
              label: '中国',
              value: 'China',
            }],
        },
        {
          label: '资金流出',
          value: 'outflow',
          children: [
            {
              label: '北京',
              value: 'beijing',
            }, {
              label: '上海',
              value: 'shanghai',
            }],
        }],
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
            actionLeft: {
              type: "radio",
              value: "bank",
              options: [
                { label: "银行", value: "bank" },
                { label: "机构", value: "institution" },
              ],
            },
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
    };
  },
  computed: {},
  watch: {},
  created() {
    this.fetchMapData()
  },
  methods: {
    changeBalanceScope(val) {
      this.balanceScope = val
      this.updatePanelTitles()
    },
    handleCustomTimeChange(payload) {
      this.customTimeRange = payload
    },
    handleFundFlowChange(payload) {
      console.log('handleFundFlowChange', payload)
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
    // initTableColumns removed

    // 初始化表格数据
    // initTableData removed

    // 请求左侧模块数据
    fetchLeftPanelData(index) {
       console.log(`Fetching Left[${index}] data`)
    },
    // 请求中间模块数据
    fetchCenterPanelData() {
      const config = this.panelsConfig.center
      const leftVal = config.actionLeft ? config.actionLeft.value : null
      console.log(`Fetching Center data. ActionLeft: ${leftVal}`)
    },
    // 请求右侧模块数据
    fetchRightPanelData(index) {
       console.log(`Fetching Right[${index}] data`)
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

</style>

