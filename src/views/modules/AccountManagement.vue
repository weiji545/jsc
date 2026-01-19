<template>
  <DashboardContent
    :data-list="dataList"
    :panelsConfig="panelsConfig"
    :scope="balanceScope"
    v-loading="false"
    element-loading-text="加载中..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.7)"
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
        :options="{ legend: { show: false }, grid: { left: 70, top: 20, bottom: 50 } }"
      />
    </template>
    <template #center-top>
      <div class="module-content">模块二 - 核心区域内容</div>
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
      <div class="module-content">模块二 - 右上内容</div>
    </template>
    <template #right-middle>
      <div class="module-content">模块二 - 右中内容</div>
    </template>
    <template #right-bottom>
      <div class="module-content">模块二 - 右下内容</div>
    </template>
  </DashboardContent>
</template>

<script>
import DashboardContent from '../components/layout/DashboardContent.vue'
import EChartBarLine from '../components/charts/EChartBarLine.vue'

export default {
  name: 'AccountManagement',
  components: {
    DashboardContent,
    EChartBarLine,
  },
  data() {
    return {
      // 模块二的数据展示列表
      dataList: [
        { label: '模块二', value: 1230000 },
        { label: '数据二', value: 4560000 },
        { label: '统计二', value: 789000 },
      ],
      balanceScope: 'global',
      panelsConfig: {
        left: [
          {
            title: '银行分布-账户性质',
            unit: '',
            actionLeft: {
              type: 'radio',
              value: 'bank',
              options: [
                { label: '银行', value: 'bank' },
                { label: '机构', value: 'institution' },
              ]
            },
            actionRight: {
              type: 'text',
              value: 'amount',
              options: [
                { label: '金额', value: 'amount' },
                { label: '数量', value: 'count' },
              ]
            }
          },
          {
            title: '银行分布-账户币种',
            unit: '户',
            showBottomCorner: true,
            contentPadding: { paddingTop: 9, paddingLeft: 14, paddingRight: 14 },
          },
          { title: '开户行所在国家地区',
            unit: '户',
            actionLeft: {
              type: 'radio',
              value: 'bank',
              options: [
                { label: '银行', value: 'bank' },
                { label: '机构', value: 'institution' },
              ]
            },
          },
        ],
        center: { title: '近期趋势分析', unit: '万元', contentPadding: { paddingTop: 0 } },
        right: [
          { title: '直联渠道',
            unit: '万元',
            actionLeft: { title: '开户行所在国家地区',
            unit: '户',
            actionLeft: {
              type: 'radio',
              value: 'bank',
              options: [
                { label: '银行', value: 'bank' },
                { label: '机构', value: 'institution' },
              ]
            },
          },
          },
          { title: '直联渠道',
            unit: '万元',
            actionLeft: { title: '开户行所在国家地区',
            unit: '户',
            actionLeft: {
              type: 'radio',
              value: 'bank',
              options: [
                { label: '银行', value: 'bank' },
                { label: '机构', value: 'institution' },
              ]
            },
          },
          },
          { title: '账户状态',
            unit: '万元',
            actionLeft: { title: '开户行所在国家地区',
            unit: '户',
            actionLeft: {
              type: 'radio',
              value: 'bank',
              options: [
                { label: '银行', value: 'bank' },
                { label: '机构', value: 'institution' },
              ]
            },
          },
          },
        ],
      },
      leftBottomData: {
        categories: ['中国', '美国', '日本', '俄罗斯', '玻利维亚共和国'],
        values: [12000, 10000, 8000, 7000, 1200],
      },
      centerBottomData: {
        categories: (function() {
          const arr = []
          for(let i=6; i>=0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const m = String(d.getMonth() + 1).padStart(2, '0')
            const day = String(d.getDate()).padStart(2, '0')
            arr.push(`${m}-${day}`)
          }
          return arr
        })(),
        values: [1500, 1600, 1550, 1700, 1650, 1800, 1900],
      },
    }
  },
}
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
.text-toggle-group {
  display: flex;
  align-items: center;
}
.text-toggle-sep {
  color: #9EC7F0;
  margin: 0 4px;
  font-size: 12px;
}
</style>

