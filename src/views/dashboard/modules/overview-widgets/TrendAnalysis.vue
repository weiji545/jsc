<template>
  <div class="trend-analysis-container" style="height: 100%;">
    <!-- 资金交易趋势视角 -->
    <div v-if="mode === 'a'" class="chart-mode">
      <EChartBarLine
        :categories="categories"
        :bar-data="barData"
        :line-data="lineData"
        :height="170"
        line-color="#24D9B5"
      />
    </div>

    <!-- 大额支付视角 -->
    <div v-else class="large-payments">
      <div class="large-left">
        <el-table :data="tableData" size="small" style="width:100%" max-height="170px">
          <el-table-column align="center" header-align="center" prop="index" label="序号" width="78" :formatter="formatIndex"></el-table-column>
          <el-table-column align="center" header-align="center" prop="payer" label="付款账户"></el-table-column>
          <el-table-column align="center" header-align="center" prop="payee" label="收款帐户"></el-table-column>
          <el-table-column align="center" header-align="center" prop="amount" label="付款金额(万元)" :formatter="formatTableAmount"></el-table-column>
          <el-table-column align="center" header-align="center" prop="date" label="支付日期"></el-table-column>
        </el-table>
      </div>
      <div class="large-right">
        <div class="gauge-wrapper">
          <EchartGauge :value="gaugeValue" width="140px" height="140px"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EChartBarLine from '../../components/charts/EChartBarLine.vue'
import EchartGauge from '../../components/charts/EchartGauge.vue'
import { formatNumber } from '../../../../utils/utils.js'

export default {
  name: 'TrendAnalysis',
  components: { EChartBarLine, EchartGauge },
  props: {
    mode: {
      type: String,
      default: 'a'
    },
    categories: Array,
    barData: Array,
    lineData: Array,
    tableData: Array,
    gaugeValue: {
      type: Number,
      default: 95
    }
  },
  methods: {
    formatTableAmount(row, column, cellValue) {
      return formatNumber(cellValue, 2)
    },
    formatIndex(row, column, cellValue) {
      try {
        const v = typeof cellValue === 'undefined' || cellValue === null ? (row && row.index) || 0 : cellValue
        return String(Number(v)).padStart(3, '0')
      } catch (e) {
        return String(cellValue || '')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.large-payments {
  display: flex;
  height: 100%;
  gap: 12px;
}

.large-left {
  flex: 1;
  min-width: 0;
}

.large-right {
  width: 165px;
  flex-shrink: 0;
}

.gauge-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

/* 局部表格样式覆盖 */
::v-deep .el-table {
  &::before { height: 0; }
  &, tr, .el-table__cell { background: transparent !important; }
  .el-table__cell { color: var(--color-title-dark, #fff); border: none; }
  
  .el-table__body-wrapper {
    &::-webkit-scrollbar { width: 6px; height: 6px; }
    &::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 212, 255, 0.6);
      border-radius: 3px;
      &:hover { background: rgba(0, 212, 255, 0.8); }
    }
  }

  .el-table__header-wrapper {
    background: linear-gradient(180deg, #1C3B68 0%, rgba(47, 61, 82, 0.0885) 100%);
    th { background: transparent; color: var(--color-title-dark, #fff); }
  }
}

:deep(.card-panel.is-light) .el-table .el-table__header-wrapper th {
  color: var(--color-title-light, #181818) !important;
}
</style>
