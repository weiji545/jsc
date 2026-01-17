<template>
  <DashboardContent
    :data-list="dataList"
    :panelsConfig="panelsConfigComputed"
    :centerBottomMode.sync="centerBottomMode"
    :centerPeriod.sync="centerPeriodSync"
    :scope="balanceScope"
    v-loading="false && isLoading"
    element-loading-text="加载中..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.7)"
  >
    <!-- 左上 账户数量统计 -->
    <template #left-top>
      <OverviewMetricPanel
        :domestic-value="overview.accountsSummary.domestic"
        domestic-label="境内账户总量"
        :overseas-value="overview.accountsSummary.overseas"
        overseas-label="境外账户总量"
        :highlight-scope="balanceScope"
        :carousel-items="overview.ringMetrics"
        variant="ring"
        :text-color="textColor"
      />
    </template>

    <!-- 左中 账户区域统计（列表展示） -->
    <template #left-middle>
      <RegionRankList
        :key="`region-${balanceScope}-${fakeUpdateKey}`"
        :data="convertedRegionPie"
        :order-by-asc.sync="leftTopOrderByAsc"
        @change-order="handleRegionSortChange"
      />
    </template>

    <!-- 左下 账户币种统计 饼图 + legends -->
    <template #left-bottom>
      <div class="pie-wrapper">
        <!-- 左侧 饼图（使用 EChartDonut 但将 radius 设置为 0% 以呈现普通饼图） -->
        <EChartPieRing
          :data="convertedCurrencyPie"
          variant="pie"
          :options="{ color: currencyColors, tooltip: { trigger: 'item' } }"
          :unit="panelsConfigComputed.left[2].unit"
        />
      </div>
    </template>

    <!-- 中间上方 核心区域（地球 / 地图） + 通用选项卡 -->
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

    <!-- 中间下方 余额变动趋势分析 -->
    <template #center-bottom-title>
      <div class="trend-title-bar">
        <div class="trend-title">余额变动趋势分析</div>
      </div>
    </template>
    <template #center-tabs>
      <div class="trend-tabs">
        <button
          v-for="tab in trendTabs"
          :key="tab.value"
          :class="['trend-tab', { active: trendTab === tab.value }]"
          @click="changeTrendTab(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>
    </template>
    <template #center-bottom>
      <TrendAnalysis
        :mode="centerBottomMode"
        :categories="trendData[trendTab].categories"
        :bar-data="convertedTrendBar"
        :line-data="trendData[trendTab].line"
        :table-data="largePayments"
        :unit="panelsConfigComputed.center.unit"
        line-unit="笔"
        @sort-change="handleTrendSortChange"
      />
    </template>

    <!-- 右上 资金金额统计 ，下方使用 EChartSparkline -->
    <template #right-top>
      <OverviewMetricPanel
        :domestic-value="overview.transactionAmount.domestic || overview.accountsSummary.domestic"
        domestic-label="境内交易金额"
        :overseas-value="overview.transactionAmount.overseas || overview.accountsSummary.overseas"
        overseas-label="境外交易金额"
        :highlight-scope="balanceScope"
        :carousel-items="overview.rightTopLines"
        variant="sparkline"
        :decimals="2"
        :text-color="textColor"
      />
    </template>

<!--    右中 存款金额统计-->
    <template #right-middle>
      <RightMiddleChart
        :scope="previousBalanceScope"
        :unit="panelsConfigComputed.right[1].unit"
        :domestic-categories="overview.rightMiddle.categories"
        :domestic-bar-data="convertedRightMidBar"
        :domestic-line-data="overview.rightMiddle.line"
        :domestic-options="rightMidEchartOptions"
        :overseas-categories="exchangeCategories"
        :overseas-bar-data="convertedExchangeBar"
        :overseas-options="exchangeEchartOptions"
      />
    </template>

    <!-- 右下 环形图 + legends -->
    <template #right-bottom>
      <div class="donut-wrapper">
        <EChartPieRing
          :data="donutData"
          variant="donut"
          :options="rightBottomData"
          :unit="panelsConfigComputed.right[2].unit"
        />
      </div>
    </template>
  </DashboardContent>
</template>

<script>
import DashboardContent from '../components/layout/DashboardContent.vue'
import CoreOverviewPanel from '../components/panels/CoreOverviewPanel.vue'
import FilterTabs from '../components/common/FilterTabs.vue'
import PagedCarousel from '../components/common/PagedCarousel.vue'
import EChartRingBar from '../components/charts/EChartRingBar.vue'
import EChartPieRing from '../components/charts/EChartPieRing.vue'
import EChartBarLine from '../components/charts/EChartBarLine.vue'
import EChartSparkline from '../components/charts/EChartSparkline.vue'
import EchartGauge from '../components/charts/EchartGauge.vue'
import RankingStats from './overview-widgets/RegionRankList.vue'
import OverviewMetricPanel from './overview-widgets/OverviewMetricPanel.vue'
import TrendAnalysis from './overview-widgets/TrendAnalysis.vue'
import RightMiddleChart from './overview-widgets/RightMiddleChart.vue'
import {
  getOverviewData,
  getBaseDataList,
  getRegionList,
  getExchangeRates,
  getTrendData,
  getChinaMapData,
  getChinaMapFlowData,
  getWorldMapFlowData,
  getWorldAccountData,
} from '../../api/dashboard'
import { formatNumber } from '../../utils/utils.js'

export default {
  name: 'OverView',
  components: {
    DashboardContent,
    CoreOverviewPanel,
    FilterTabs,
    PagedCarousel,
    EChartRingBar,
    EChartPieRing,
    EChartBarLine,
    EChartSparkline,
    EchartGauge,
    RegionRankList: RankingStats,
    OverviewMetricPanel,
    TrendAnalysis,
    RightMiddleChart,
  },
  data() {
    return {
      isLoading: false,
      // ========== 时间范围 ==========
      customTimeRange: {
        startBsnDate: '',
        endBsnDate: '',
      },
      // ========== 基础数据 ==========
      baseDataList: [],
      overview: {
        accountsSummary: { domestic: 0, overseas: 0 },
        ringMetrics: [],
        transactionAmount: { domestic: 0, overseas: 0 },
        regionPie: [],
        currencyPie: [],
        rightTopLines: [],
        rightMiddle: { categories: [], bar: [], line: [] },
        balanceRing: [],
      },
      globeCountryData: [],
      regionList: [],
      exchangeRates: [],
      chinaMapData: [],
      chinaMapFlowData: [],
      worldMapFlowData: [],
      trendData: {
        trade: { categories: [], bar: [], line: [] },
        large: { categories: [], bar: [], line: [] },
        cash: { categories: [], bar: [], line: [] },
      },

      // ========== 面板配置 ==========
      panelsConfig: {
        left: [
          { title: '账户数量统计', unit: '户', showCurrency: true, showBottomCorner: false },
          {
            title: '账户区域统计',
            unit: '户',
            showCurrency: true,
            contentPadding: { paddingTop: 9, paddingLeft: 14, paddingRight: 14 },
          },
          { title: '账户币种统计', unit: '户', showCurrency: true },
        ],
        center: { title: '余额变动趋势分析', unit: '万元', contentPadding: { paddingTop: 0 }, showCurrency: true },
        right: [
          { title: '资金金额统计', unit: '万元', showCurrency: true, showBottomCorner: false },
          { title: '存款金额统计', unit: '万元', showCurrency: true },
          { title: '币种余额统计', unit: '万元', showCurrency: true },
        ],
      },

      // ========== 视图状态 ==========
      balanceScope: 'global',
      previousBalanceScope: 'domestic',
      balanceTime: ['day', '7'],
      trendTab: 'large',
      centerBottomMode: 'a',
      trendSort: { prop: '', order: '' },
      leftTopOrderByAsc: false,
      fakeUpdateKey: Date.now(), // 用于强制重新渲染区域统计

      // ========== 选项配置 ==========
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
      trendTabs: [
        { label: '资金交易趋势', value: 'trade' },
        { label: '大额支付', value: 'large' },
      ],

      // ========== 图表配置 ==========
      currencyColors: ['#FAC858', '#097C38', '#91CC75', '#507AFC', '#93BEFF', '#283E81'],
      rightBottomData: {
        title: {
          text: '余额占比',
          left: '31%',
          top: '48%',
          textStyle: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
        },
        series: [
          {
            color: ['#F27629', '#FDCC00', '#3B72AD', '#00BAFF', '#0098FA', '#29F1FA'],
          },
        ],
      },
      rightMidEchartOptions: {
        legendName: '金额',
        legend: { show: true },
      },
      exchangeEchartOptions: {
        legendName: '金额',
        legend: { show: true },
        yAxis: [{ type: 'value', axisLabel: { color: '#9E9E9E' }, axisLine: { show: false } }, { show: false }],
        tooltipBarName: '兑换汇率',
      },
    }
  },
  computed: {
    // 根据当前选中货币返回用于展示的 dataList
    dataList() {
      const convert =
        this.$store &&
        this.$store.getters &&
        this.$store.getters['currency/convert']
          ? this.$store.getters['currency/convert']
          : (v) => v
      return (this.baseDataList || []).map((it) => {
        if (it.isAmount) {
          return Object.assign({}, it, { value: convert(it.value) })
        }
        return it
      })
    },
    // 账户币种统计 固定数据（可在未来改为从后端或 mock 中读取）
    convertedCurrencyPie() {
      const list = (this.overview && this.overview.currencyPie) || []
      // 保持与其它 computed 的风格，返回新对象数组
      return list.map((it) => Object.assign({}, it))
    },
    // 右下环形图 legend 使用的数据（不随 balanceScope 变化，固定使用 global）
    donutData() {
      const list = (this.overview && this.overview.balanceRing) || []
      const convert =
        this.$store &&
        this.$store.getters &&
        this.$store.getters['currency/convert']
          ? this.$store.getters['currency/convert']
          : (v) => v
      return list.map((it) =>
        Object.assign({}, it, { value: convert(it.value) }),
      )
    },
    // 左下地区饼图数据，随 currency 转换
    convertedRegionPie() {
      // 优先使用组件内部生成的假数据（便于本地预览），否则回退到 overview.regionPie
      const rawList =
        (this.regionList && this.regionList.length && this.regionList) ||
        (this.overview && this.overview.regionPie) ||
        []
      const convert =
        this.$store &&
        this.$store.getters &&
        this.$store.getters['currency/convert']
          ? this.$store.getters['currency/convert']
          : (v) => v
      // 返回新的对象数组，不再强制按金额排序，以尊重接口返回的顺序（如按金额排序）
      return rawList.map((it) => Object.assign({}, it, { value: convert(it.value) }))
    },
    // trend / rightMid 的金额需要基于当前货币转换
    convertedRightMidBar() {
      const bar =
        (this.overview &&
          this.overview.rightMiddle &&
          this.overview.rightMiddle.bar) ||
        []
      const convert =
        this.$store &&
        this.$store.getters &&
        this.$store.getters['currency/convert']
          ? this.$store.getters['currency/convert']
          : (v) => v
      return bar.map((v) => Number(convert(v) || 0))
    },
    // 境外模式下用于展示的汇率柱状图数据
    exchangeCategories() {
      return (this.exchangeRates || []).map((it) => it.name)
    },
    convertedExchangeBar() {
      const convert =
        this.$store &&
        this.$store.getters &&
        this.$store.getters['currency/convert']
          ? this.$store.getters['currency/convert']
          : (v) => v
      return (this.exchangeRates || []).map((it) => Number(convert(it.value) || 0))
    },
    convertedTrendBar() {
      const current = this.trendData[this.trendTab] || { bar: [] }
      const convert =
        this.$store &&
        this.$store.getters &&
        this.$store.getters['currency/convert']
          ? this.$store.getters['currency/convert']
          : (v) => v
      return (current.bar || []).map((v) => Number(convert(v) || 0))
    },
    // 用于大额支付表格的示例数据（从 mock trendData.large 映射生成）
    largePayments() {
      // 优先使用后端返回的具体列表 list，如果没有则回退并生成
      const list = (this.trendData && this.trendData.large && this.trendData.large.list)
      if (list && list.length) {
        return list.map((it, idx) => ({
          ...it,
          index: idx + 1,
        }))
      }

      const raw = (this.trendData && this.trendData.large && this.trendData.large.bar) || []
      return raw.map((v, idx) => ({
        index: idx + 1,
        payer: `付款账户${idx + 1}`,
        payee: `收款账户${idx + 1}`,
        amount: Number((v || 0).toFixed(2)),
        date: '2025-12-24',
      }))
    },
    // 文字颜色使用 Vuex 管理的深色模式状态，localStorage 仅作缓存回退
    textColor() {
      try {
        const titleDark =
          getComputedStyle(document.documentElement).getPropertyValue('--color-title-dark').trim() || '#fff'
        const titleLight =
          getComputedStyle(document.documentElement).getPropertyValue('--color-title-light').trim() || '#000'

        // 统一使用 theme 模块的命名空间 getter
        const isDark = !!(this.$store && this.$store.getters['theme/isDarkMode'])

        return isDark ? titleDark : titleLight
      } catch (e) {
        return '#fff'
      }
    },
    // 根据当前 balanceScope 动态调整 panelsConfig 境外模式下将右侧中间标题改为“汇率统计”
    panelsConfigComputed() {
      try {
        const cfg = JSON.parse(JSON.stringify(this.panelsConfig || {}))
        if (cfg && cfg.right && cfg.right[1]) {
          cfg.right[1].title = this.previousBalanceScope === 'overseas' ? '汇率统计' : cfg.right[1].title
          cfg.right[1].unit = this.previousBalanceScope === 'overseas' ? '元' : cfg.right[1].unit
        }
        return cfg
      } catch (e) {
        return this.panelsConfig
      }
    },
    // 将平衡时间（天/月）与 DashboardContent 中的单选按钮同步
    centerPeriodSync: {
      get() {
        return this.balanceTime && this.balanceTime[0]
      },
      set(val) {
        // 当用户在中间下方面板切换 天/月 时，同步更新全局的 balanceTime
        if (val === 'day') {
          this.balanceTime = ['day', '7']
        } else if (val === 'month') {
          this.balanceTime = ['month', '31']
        }
      },
    },
    // 计算标准的时间范围返回值
    standardizedTimeRange() {
      const now = new Date()
      // 辅助函数：格式化日期
      const format = (date) => {
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
      }
      // 辅助函数：获取上个月的第一天和最后一天
      const getLastMonthRange = (baseDate) => {
        const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1)
        const lastDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 0)
        return { startDate: format(firstDay), endDate: format(lastDay) }
      }

      const mode = this.balanceTime[0]
      const subType = this.balanceTime[1]

      if (mode === 'day') {
        // 当按'天'时, 不论选择的是哪天,startDate和endDate分别为当前(new Date())上个月的第一天 and 最后一天
        return getLastMonthRange(now)
      } else if (mode === 'month') {
        if (subType === 'month') {
          // 选择'近一月'startDate和endDate 分别为当前(new Date())上个月的第一天和最后一天
          return getLastMonthRange(now)
        } else if (subType === 'year') {
          // 选择'近一年'时 为当年第一天 和 当天
          const firstDay = new Date(now.getFullYear(), 0, 1)
          return { startDate: format(firstDay), endDate: format(now) }
        } else if (subType === 'customizedMonth') {
          // 选择'自定义月'时, 为结束月份 的第一天和最后一天(如果是当月 则选择当天 不能超过当天)
          if (!this.customTimeRange || !this.customTimeRange.endBsnDate) {
            return { startDate: '', endDate: '' }
          }
          const endBsnDate = new Date(this.customTimeRange.endBsnDate)
          const firstDay = new Date(endBsnDate.getFullYear(), endBsnDate.getMonth(), 1)
          let lastDay
          if (endBsnDate.getFullYear() === now.getFullYear() && endBsnDate.getMonth() === now.getMonth()) {
            // 如果是当月 则选择当天
            lastDay = now
          } else {
            // 结束月份 的最后一天
            lastDay = new Date(endBsnDate.getFullYear(), endBsnDate.getMonth() + 1, 0)
          }
          return { startDate: format(firstDay), endDate: format(lastDay) }
        }
      }
      return { startDate: '', endDate: '' }
    },
  },
  watch: {
    // 监听统计范围的变化
    balanceScope: {
      handler(val) {
        this.updateData(val)
      },
    },
    // 监听时间维度的变化
    balanceTime: {
      handler() {
        this.updateData(this.balanceScope)
      },
      deep: true,
    },
    // 监听币种切换
    '$store.state.currency.selectedCurrency'(val) {
      console.log('[Currency Change] 币种已切换为:', val)
      // 可以在此处添加逻辑，比如手动刷新某些非响应式数据
    },
  },
  mounted() {
    this.updateData(this.balanceScope)
    // 通用图表组件会自行初始化并响应数据变化
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    /**
     * 统一的数据刷新调度器
     * @param {string} scope 当前的统计范围 (global/domestic/overseas)
     */
    async updateData(scope) {
      console.log(`[UpdateData] Scope: ${scope}, Time:`, this.balanceTime)

      // 此处可以根据 scope 或 time 执行特定的前置逻辑
      // 比如在特定模式下才开启某些实时推送，或预处理某些参数

      // 调用通用的数据获取接口
      await this.fetchData()

      // 如果有仅在特定范围（如境内）才需要调用的额外接口，可以在下面判断
      if (scope === 'domestic') {
        // await this.fetchSpecificDomesticData()
      }
    },
    getQueryData() {
      this.isLoading = true
      const params = {
        scope: this.balanceScope,
        time: this.balanceTime,
      }
      http.get('/api/query', params).then((res) => {
        this.dataList = res.data.map(i => ({name: i.name}))
      }).finally(() => {
        this.isLoading = false
      })
    },
    async fetchData() {
      this.isLoading = true


      try {
        const [overviewRes, baseRes, regionRes, exchangeRes, trendRes, chinaRes, chinaFlowRes, flowRes] = await Promise.all([
          getOverviewData(),
          getBaseDataList(),
          getRegionList(this.leftTopOrderByAsc),
          getExchangeRates(),
          getTrendData(this.trendSort),
          getChinaMapData(),
          getChinaMapFlowData(),
          getWorldMapFlowData(),
        ])

        if (overviewRes.code === 200) {
          const { globeCountryData, ...rest } = overviewRes.data
          this.overview = rest
          this.globeCountryData = globeCountryData || []
        }
        if (baseRes.code === 200) this.baseDataList = baseRes.data
        if (regionRes.code === 200) this.regionList = regionRes.data
        if (exchangeRes.code === 200) this.exchangeRates = exchangeRes.data
        if (trendRes.code === 200) this.trendData = trendRes.data
        if (chinaRes.code === 200) this.chinaMapData = chinaRes.data
        if (chinaFlowRes.code === 200) this.chinaMapFlowData = chinaFlowRes.data
        if (flowRes.code === 200) this.worldMapFlowData = flowRes.data
      } catch (error) {
        console.error('Failed to fetch overview data:', error)
      } finally {
        this.isLoading = false
      }
    },
    formatNumber,
    changeBalanceScope(val) {
      if (this.balanceScope === val) return
      if (val !== 'global') {
        this.previousBalanceScope = val
      }
      this.balanceScope = val
      // 更新 fakeUpdateKey 以强制重新渲染区域统计组件
      this.fakeUpdateKey = Date.now()
    },
    handleCustomTimeChange(payload) {
      this.customTimeRange = payload
      console.log('Parent received custom time:', payload)
      // TODO: 根据 customTimeRange 重新获取数据
      // this.fetchData()
    },
    changeTrendTab(val) {
      this.trendTab = val
      this.centerBottomMode = val === 'large' ? 'b' : 'a'
    },
    async handleTrendSortChange({ prop, order }) {
      // payer ascending
      // payer descending
      // payee ascending
      // amount ascending
      // date ascending
      this.trendSort = { prop, order }
      try {
        const res = await getTrendData(this.trendSort)
        if (res.code === 200) {
          this.trendData = res.data
        }
      } catch (e) {
        console.error('Failed to sort trend data:', e)
      }
    },
    async handleRegionSortChange(val) {
      try {
        const res = await getRegionList(val)
        if (res.code === 200) {
          this.regionList = res.data
        }
      } catch (e) {
        console.error('Failed to fetch sorted region list:', e)
      }
    },
    handleResize() {
      // 用于手动触发图表 resize (如果需要)
      // 子组件通常已通过 ResizeObserver 处理
    },
  },
}
</script>

<style lang="scss" scoped>
.core-top {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 10px;

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

.pie-wrapper, .donut-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 150px; /* 保护初始高度 */
  flex: 1;           /* 强制拉伸 */
  position: relative;
}

.trend-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;

  .is-light-mode & {
    color: var(--color-title-light, #181818) !important;
  }
}

.trend-tabs {
  display: flex;
  gap: 8px;
}

.trend-tab {
  padding: 6px 12px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;

  &.active {
    border-color: rgba(0, 212, 255, 0.8);
    color: #00d4ff;
    box-shadow: 0 0 8px rgba(0, 212, 255, 0.25);
  }
}

/* 覆盖 DashboardContent 中的单选按钮颜色 */
:deep(.period-switch input[type="radio"]) {
  accent-color: #29F1FA;
}
</style>
