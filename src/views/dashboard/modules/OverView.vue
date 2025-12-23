<template>
  <DashboardContent :data-list="dataList" :panelsConfig="panelsConfig">
    <!-- 左上：境内账户数量 -->
    <template #left-top>
      <div class="account-summary">
        <div class="summary-top">
          <div class="summary-box" :class="{ 'summary-box--highlight': balanceScope === 'domestic' }">
            <div class="summary-text">
              <div class="summary-number">
                {{ formatNumber(overview.accountsSummary.domestic) }}
              </div>
              <div class="summary-label">境内账户总量</div>
            </div>
          </div>
          <div class="summary-box" :class="{ 'summary-box--highlight': balanceScope === 'overseas' }">
            <div class="summary-text">
              <div class="summary-number">
                {{ formatNumber(overview.accountsSummary.overseas) }}
              </div>
              <div class="summary-label">境外账户总量</div>
            </div>
          </div>
        </div>
        <div class="summary-bottom">
          <PagedCarousel :items="overview.ringMetrics" :perPage="4" :interval="5000" :autoplay="true">
            <template #item="{ item, index }">
              <div
                :key="index"
                class="ring-card"
              >
                <div
                  class="ring"
                  :class="{ negative: item.percent < 0 }"
                  :style="ringStyle(item.percent)"
                >
                  <EChartRingBar :percent="item.percent" :size="92" :height="92"/>
                  <!-- 使用 DOM 显示百分比，替代 ECharts graphic -->
                  <div
                    class="ring-percent"
                    :style="{ color: textColor, fontSize: '18px', fontWeight: 500 }"
                  >
                    {{ item.percent }}%
                  </div>
                </div>
                <div
                  class="ring-value"
                  :style="{ color: item.percent < 0 ? '#D92424' : '#24D9B5' }"
                >
                  {{ formatNumber(item.value) }}
                </div>
                <div class="ring-label">{{ item.label }}</div>
              </div>
            </template>
          </PagedCarousel>
        </div>
      </div>
    </template>

    <!-- 左中：账户区域统计（列表展示） -->
    <template #left-middle>
      <div class="region_top">
        <div class="region_top_left">金额</div>
        <div class="region_top_right">
          账户数量
          <div class="triangle-up"></div>
          <div class="triangle-down"></div>
        </div>
      </div>
      <div class="region-list">
        <div
          class="region-row"
          v-for="item in convertedRegionPie"
          :key="item.name"
        >
          <div class="region_item">
            <img :src="ranking1" alt="" class="region_item_img" />
            <div class="region_item_right">
              <div class="region_item_info">
                <div class="region-name">
                  <span>NO.01{{ item.name }}</span>
                  <span>456</span>
                </div>
                <span class="region-value">{{ formatNumber(item.value) }}</span>
              </div>
              <div class="region_item_line">
                <div class="regin_item_gropress"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 左下：饼图 + legends -->
    <template #left-bottom>
      <div class="pie-wrapper">
        <!-- 左侧：饼图（使用 EChartDonut 但将 radius 设置为 0% 以呈现普通饼图） -->
        <EChartPieRing
          :data="convertedCurrencyPie"
          variant="pie"
          :options="{ color: currencyColors, tooltip: { trigger: 'item' } }"
        />
      </div>
    </template>

    <!-- 中间上方：核心区域（地球 / 地图） + 通用选项卡 -->
    <template #center-top>
      <div class="core-top">
        <CoreOverviewPanel :scope="balanceScope" :time="balanceTime"/>
        <FilterTabs
          :scope="balanceScope"
          :scope-options="balanceScopes"
          :time="balanceTime"
          :time-options="balanceTimeOptions"
          @change-scope="changeBalanceScope"
          @change-time="(val) => (balanceTime = val)"
        />
      </div>
    </template>

    <!-- 中间下方：趋势分析 -->
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
      <EChartBarLine :categories="trendData[trendTab].categories" :bar-data="convertedTrendBar" :line-data="trendData[trendTab].line" :height="170"/>
    </template>

    <!-- 右上：按“账户数量统计”布局显示资金统计（境内/境外交易金额），下方使用 EChartSparkline -->
    <template #right-top>
      <div class="account-summary">
        <div class="summary-top">
          <div class="summary-box" :class="{ 'summary-box--highlight': balanceScope === 'domestic' }">
            <div class="summary-text">
              <div class="summary-number">
                {{ formatNumber((overview.transactionAmount && overview.transactionAmount.domestic) ||
                overview.accountsSummary.domestic, 2)
                }}
              </div>
              <div class="summary-label">境内交易金额</div>
            </div>
          </div>
          <div class="summary-box" :class="{ 'summary-box--highlight': balanceScope === 'overseas' }">
            <div class="summary-text">
              <div class="summary-number">
                {{ formatNumber((overview.transactionAmount && overview.transactionAmount.overseas) ||
                overview.accountsSummary.overseas, 2)
                }}
              </div>
              <div class="summary-label">境外交易金额</div>
            </div>
          </div>
        </div>
        <div class="summary-bottom">
          <PagedCarousel :items="overview.rightTopLines" :perPage="4" :interval="5000" :autoplay="true">
            <template #item="{ item, index }">
              <div
                :key="index"
                class="ring-card"
              >
                <div
                  class="ring"
                >
                  <!-- 环比增长徽章（绝对定位，显示在图表左上角） -->
                  <div class="trend-badge">
                    <div class="trend-label">环比增长</div>
                    <div class="trend-value" :style="{ color: (item.percent >= 0 ? '#0098FA' : '#FF3A3A') }">
                      {{ (item.percent >= 0 ? '+' : '') + item.percent }}%
                    </div>
                  </div>
                  <EChartSparkline :data="item.data" :height="70" :color="item.percent >= 0 ? '#3AACFF' : '#FF3A3A'"/>
                </div>
                <div
                  class="ring-value"
                  :style="{ color: textColor }"
                >
                  {{ formatNumber((item.data || []).reduce((a, b) => a + b, 0), 2) }}
                </div>
                <div class="ring-label">{{ item.label }}</div>
              </div>
            </template>
          </PagedCarousel>
        </div>
      </div>
    </template>

    <!-- 右中：柱 + 线 -->
    <template #right-middle>
      <EChartBarLine :categories="overview.rightMiddle.categories" :bar-data="convertedRightMidBar" :line-data="overview.rightMiddle.line" :height="240"/>
    </template>

    <!-- 右下：环形图 + legends -->
    <template #right-bottom>
      <div class="donut-wrapper">
        <EChartPieRing :data="donutData" variant="donut"/>
      </div>
    </template>
  </DashboardContent>
</template>

<script>
import DashboardContent from '../components/DashboardContent.vue'
import CoreOverviewPanel from '../components/CoreOverviewPanel.vue'
import FilterTabs from '../components/FilterTabs.vue'
import PagedCarousel from '../components/PagedCarousel.vue'
import EChartRingBar from '../components/charts/EChartRingBar.vue'
import EChartPieRing from '../components/charts/EChartPieRing.vue'
import EChartBarLine from '../components/charts/EChartBarLine.vue'
import EChartSparkline from '../components/charts/EChartSparkline.vue'
import { overviewData as overview } from '../data/mock.js'
import { formatNumber } from '../../../utils/utils.js'
import ranking1 from "../img/ranking-1.png";
import ranking2 from "../img/ranking-2.png";
import ranking3 from "../img/ranking-3.png";

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
  },
  data() {
    return {
      ranking1,
      // baseDataList 保留基础数据（不随展示货币变化）
      baseDataList: [
        { label: '账户总数', value: 183220, isAmount: false },
        { label: '账户余额总数', value: 56200, isAmount: true, decimals: 2 },
      ],
      // panelsConfig 由 OverView 传入 DashboardContent，以便集中配置每个 panel 的 title/unit
      // 现在也可以通过 showBottomCorner 控制底部边角装饰
      panelsConfig: {
        left: [
          { title: '账户数量统计', unit: '户' },
          { title: '账户区域统计', unit: '户', showBottomCorner: true },
          { title: '账户币种统计', unit: '户', showBottomCorner: true },
        ],
        center: { title: '资金交易分析', unit: '万元' },
        right: [
          { title: '资金金额统计', unit: '万元' },
          { title: '存款金额统计', unit: '万元', showBottomCorner: true },
          { title: '币种余额统计', unit: '万元', showBottomCorner: true },
        ],
      },
      overview,
      // 账户币种统计使用的颜色与数据
      currencyColors: ['#FAC858', '#097C38', '#91CC75', '#507AFC', '#93BEFF', '#283E81'],
      trendTab: 'trade',
      trendTabs: [
        { label: '资金交易趋势', value: 'trade' },
        { label: '大额支付', value: 'large' },
      ],
      trendData: {
        trade: {
          categories: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月'],
          bar: [320, 280, 360, 420, 390, 450, 480, 510],
          line: [12, 8, 15, 18, 10, 16, 14, 20],
        },
        large: {
          categories: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月'],
          bar: [180, 210, 160, 240, 260, 230, 280, 300],
          line: [5, 9, -3, 12, 8, -5, 10, 14],
        },
        cash: {
          categories: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月'],
          bar: [260, 240, 300, 280, 320, 350, 330, 360],
          line: [6, 4, 10, -2, 9, 7, 5, 11],
        },
      },
      // 通用组件已替代原有实例化逻辑，相关实例/refs 已移除
      balanceScope: 'global',
      balanceScopes: [
        { label: '全局', value: 'global' },
        { label: '境内', value: 'domestic' },
        { label: '境外', value: 'overseas' },
      ],
      balanceTime: 'week',
      balanceTimeOptions: [
        { label: '本周', value: 'week' },
        { label: '上周', value: 'lastWeek' },
        { label: '本月', value: 'month' },
        { label: '上月', value: 'lastMonth' },
        { label: '近一年', value: 'year' },
      ],
    }
  },
  computed: {
    // 根据当前选中货币返回用于展示的 dataList
    dataList() {
      const convert = (this.$store && this.$store.getters && this.$store.getters['currency/convert'])
        ? this.$store.getters['currency/convert']
        : (v) => v
      return (this.baseDataList || []).map((it) => {
        if (it.isAmount) {
          return Object.assign({}, it, { value: convert(it.value) })
        }
        return it
      })
    },
    // 账户币种统计：固定数据（可在未来改为从后端或 mock 中读取）
    convertedCurrencyPie() {
      const list = (this.overview && this.overview.currencyPie) || []
      // 保持与其它 computed 的风格，返回新对象数组
      return list.map((it) => Object.assign({}, it))
    },
    // 右下环形图 legend 使用的数据（不随 balanceScope 变化，固定使用 global）
    donutData() {
      const list = (this.overview && this.overview.balanceRing && this.overview.balanceRing.global) || []
      const convert = (this.$store && this.$store.getters && this.$store.getters['currency/convert'])
        ? this.$store.getters['currency/convert']
        : (v) => v
      return list.map((it) => Object.assign({}, it, { value: convert(it.value) }))
    },
    // 左下地区饼图数据，随 currency 转换
    convertedRegionPie() {
      const list = this.overview.regionPie || []
      const convert = (this.$store && this.$store.getters && this.$store.getters['currency/convert'])
        ? this.$store.getters['currency/convert']
        : (v) => v
      return list.map((it) => Object.assign({}, it, { value: convert(it.value) }))
    },
    // trend / rightMid 的金额需要基于当前货币转换
    convertedRightMidBar() {
      const bar = (this.overview && this.overview.rightMiddle && this.overview.rightMiddle.bar) || []
      const convert = (this.$store && this.$store.getters && this.$store.getters['currency/convert'])
        ? this.$store.getters['currency/convert']
        : (v) => v
      return bar.map((v) => convert(v))
    },
    convertedTrendBar() {
      const current = this.trendData[this.trendTab] || { bar: [] }
      const convert = (this.$store && this.$store.getters && this.$store.getters['currency/convert'])
        ? this.$store.getters['currency/convert']
        : (v) => v
      return (current.bar || []).map((v) => convert(v))
    },
    // 文字颜色使用 Vuex 管理的深色模式状态，localStorage 仅作缓存回退
    textColor() {
      try {
        const titleDark = getComputedStyle(document.documentElement).getPropertyValue('--color-title-dark').trim() ||
          '#fff'
        const titleLight = getComputedStyle(document.documentElement).getPropertyValue('--color-title-light').trim() ||
          '#000'

        // 优先从 Vuex 读取，其次回退到 localStorage，默认深色
        const storeVal = this.$store && this.$store.getters && this.$store.getters['theme/isDarkMode']
        const lsVal = localStorage.getItem('isDarkMode')
        const isDark = typeof storeVal !== 'undefined'
          ? !!storeVal
          : (lsVal ? (lsVal === 'true' || lsVal === '1' || lsVal === 'dark') : true)

        return isDark ? titleDark : titleLight
      } catch (e) {
        return '#fff'
      }
    },
  },
  mounted() {
    // 通用图表组件会自行初始化并响应数据变化
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    formatNumber,
    // 主题状态由 Vuex 管理，localStorage 仍作为缓存由其他地方写入
    ringStyle(percent) {
      // 使用 ECharts 渲染环形图，样式由 ECharts 控制
      return {}
    },
    // 使用通用组件渲染，移除手动初始化/销毁逻辑
    handleResize() {
      // 通用组件会自行响应 window resize，无需手动调用 resize
    },
    changeTrendTab(tab) {
      if (this.trendTab === tab) return
      this.trendTab = tab
      // EChartBarLine 会响应 props 更新并重绘
    },
    changeBalanceScope(val) {
      if (this.balanceScope === val) return
      this.balanceScope = val
      // balanceScope 仍用于其它面板，但 donutData 与左下饼图不受其影响
    },
  },
}
</script>

<style lang="scss" scoped>
.module-content.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
}

.account-summary {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;
}

.summary-top {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  min-height: 0;
}

.summary-box {
  display: flex;
  align-items: center;
  padding: 0 27px;
  // padding: 10px 12px;
  // background: linear-gradient( 180deg, rgba(19,83,173,0.5) 0%, rgba(19,64,138,0.3) 50%, rgba(5,102,225,0.6) 100%);
  background: linear-gradient(
      180deg,
      rgba(19, 83, 173, 0.15) 0%,
      rgba(19, 64, 138, 0.09) 50%,
      rgba(5, 102, 225, 0.18) 100%
  );
  min-height: 0;
}

.summary-box--highlight {
  border-left: 6px solid #29F1FA;
  padding-left: 21px;
}

.summary-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.summary-number {
  font-size: 28px;
  font-weight: 500;
  color: #00d4ff;
  line-height: 1.1;
}

.summary-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.summary-bottom {
  flex: 2;
  display: flex;
  flex-direction: row;
  gap: 12px;
  min-height: 0;
}

.ring-card {
  //flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 105px;
  //background: rgba(255, 255, 255, 0.05);
  //border: 1px solid rgba(255, 255, 255, 0.08);
  //border-radius: 8px;
  //padding: 12px;
  //gap: 6px;
}

.ring {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  transition: all 0.2s ease;
  position: relative;
}

/* 环比增长徽章（显示在每个小图表的左上角） */
.trend-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  font-size: 12px;
  line-height: 1;
  text-align: left;
  z-index: 20;
}

.trend-badge .trend-label {
  font-size: 12px;
  color: var(--color-label2-dark, #9EC7F0);
}

.trend-badge .trend-value {
  font-size: 12px;
  font-weight: 600;
  margin-top: 5px;
}

/* 深浅模式下 ring 内徽章颜色跟随变量 */
::v-deep .card-panel.is-dark .trend-badge .trend-label {
  color: var(--color-label2-dark, #9EC7F0);
}

::v-deep .card-panel.is-light .trend-badge .trend-label {
  color: var(--color-label2-light, #666666);
}

.ring-chart {
  width: 92px;
  height: 92px;
}

.ring-percent {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  font-weight: 500;
  pointer-events: none;
}

.ring.negative {
  filter: drop-shadow(0 0 6px rgba(255, 95, 95, 0.35));
}

.ring:not(.negative) {
  filter: drop-shadow(0 0 6px rgba(0, 212, 255, 0.35));
}

.ring-inner {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #0f1b2d;
  font-size: 18px;
  font-weight: bold;
}

.ring-value {
  font-size: 16px;
  color: #fff;
}

.ring-label {
  font-size: 14px;
  max-width: 74px;
  height: 36px;
  line-height: 18px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
  text-align: center;
  // 使用配置的 label2Dark 颜色（深色模式），加 !important 以确保不被覆盖
  color: var(--color-label2-dark, #c3e2ff);
}

// 浅色模式下使用 label2Light, 加 !important
:deep(.card-panel.is-light) .ring-label {
  color: var(--color-label2-light, #666666) !important;
}

.region_top {
  display: flex;
  justify-content: center;
  font-size: 12px;
  color: #9e9e9e;
}
.region_top_left {
  margin-right: 21px;
}
.region_top_left::before {
  display: inline-block;
  content: "";
  margin-right: 5px;
  width: 10px;
  height: 10px;
  background: #0098fa;
}
.region_top_right {
  display: flex;
  align-items: center;
}
.region_top_right::before {
  display: inline-block;
  content: "";
  margin-right: 5px;
  width: 10px;
  height: 10px;
  background: #0cd9b5;
}
.triangle-down {
  margin-left: 3px;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 10px solid #9e9e9e;
}
.triangle-up {
  margin-left: 6px;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 10px solid #0cd9b5;
}
.region_item {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}
.region_item_img {
  width: 28px;
  height: 30px;
}
.region_item_right {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width:90%;
  height: 35px;
}
.region_item_info {
  display: flex;
  justify-content: space-between;
}
.region_item_line {
  width: 100%;
  height: 8px;
  background: #0CD9B5;
  border-radius: 4px 4px 4px 4px;
}
.regin_item_gropress {
  width: 50%;
  height: 8px;
  background: #0098FA;
  border-radius: 4px 4px 4px 4px;
}

.region-list {
  display: flex;
  flex-direction: column;
  //gap: 10px;
}

.region-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 42px;
  // margin-bottom: 10px;
  // padding: 8px 10px;
  // background: rgba(255, 255, 255, 0.04);
  // border: 1px solid rgba(255, 255, 255, 0.08);
  // border-radius: 6px;
}

.region-name {
  display: flex;
  justify-content: space-between;
  width: 50%;
  color: #fff;
}

.region-value {
  color: #00d4ff;
  font-weight: bold;
}

.pie-wrapper {
  display: grid;
  //grid-template-columns: 2fr 1fr;
  //gap: 10px;
  align-items: center;
  height: 100%;
}

.pie-chart {
  width: 100%;
  height: 220px;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  color: #fff;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 8px 10px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00d4ff, #5b8def);
  margin-right: 6px;
}

.legend-name {
  flex: 1;
}

.legend-value {
  color: #00d4ff;
  font-weight: bold;
}

.trend-title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.trend-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
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
}

.trend-tab.active {
  border-color: rgba(0, 212, 255, 0.8);
  color: #00d4ff;
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.25);
}

.trend-chart {
  width: 100%;
  height: 260px;
}

.top-line-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 12px;
  height: 100%;
}

.line-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.line-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
}

.line-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #00d4ff;
}

.sparkline {
  flex: 1;
  width: 100%;
  height: 70px;
}

.donut-wrapper {
  display: grid;
  //grid-template-columns: 2fr 1fr;
  //gap: 12px;
  align-items: center;
  height: 100%;
}

.donut-chart {
  width: 100%;
  height: 240px;
}

.donut-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: stretch;
}

.donut-radios {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.donut-radio {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.donut-radio .radio-slab {
  width: 32px;
  height: 10px;
  background: rgba(255, 255, 255, 0.25);
  clip-path: polygon(0 0, 90% 0, 100% 100%, 10% 100%);
}

.donut-radio.active .radio-slab {
  background: #00d4ff;
}

.donut-radio .radio-label {
  color: #fff;
  font-size: 14px;
}

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

.accent-select {
  ::v-deep .el-input__inner {
    background: linear-gradient(
        135deg,
        rgba(0, 212, 255, 0.25),
        rgba(91, 141, 239, 0.25)
    );
    border-color: rgba(0, 212, 255, 0.5);
    color: #fff;
  }

  ::v-deep .el-input__suffix {
    color: #fff;
  }
}

/* 强制深色模式下 ring-label 使用深色变量，覆盖其它样式 */
::v-deep .card-panel.is-dark .ring-label {
  color: var(--color-label2-dark, #c3e2ff) !important;
}
</style>
