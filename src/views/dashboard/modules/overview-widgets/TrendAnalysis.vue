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
        :unit="unit"
        :line-unit="lineUnit"
      />
    </div>

    <!-- 大额支付视角 -->
    <div v-else class="large-payments">
      <div class="large-left">
        <el-table :data="tableData" size="small" style="width:100%" max-height="170px" @sort-change="handleSortChange">
          <el-table-column align="center" header-align="center" prop="index" label="序号" width="78" :formatter="formatIndex"></el-table-column>
          <el-table-column align="center" header-align="center" prop="payer" label="付款账户" sortable="custom"></el-table-column>
          <el-table-column align="center" header-align="center" prop="payee" label="收款帐户" sortable="custom"></el-table-column>
          <el-table-column align="center" header-align="center" prop="amount" label="付款金额(万元)" :formatter="formatTableAmount" sortable="custom"></el-table-column>
          <el-table-column align="center" header-align="center" prop="date" label="支付日期" sortable="custom"></el-table-column>
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
      default: 'a',
    },
    categories: Array,
    barData: Array,
    lineData: Array,
    tableData: Array,
    gaugeValue: {
      type: Number,
      default: 95,
    },
    unit: {
      type: String,
      default: '',
    },
    lineUnit: {
      type: String,
      default: '',
    },
  },
  methods: {
    handleSortChange({ prop, order }) {
      this.$emit('sort-change', { prop, order })
    },
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
    },
  },
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
  font-size: 14px;

  &::before {
    height: 0;
  }

  &, tr, .el-table__cell {
    background: transparent !important;
  }

  tbody tr {
    cursor: pointer;
    position: relative;

    &:hover {
      background-image: url("../../img/line-hover.png") !important;
      background-size: 100% 100% !important;
      background-repeat: no-repeat !important;

      td.el-table__cell {
        color: #73C8FD !important;

        // 在第一列显示箭头
        &:first-child::before {
          content: '';
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          display: block;
          width: 12px;
          height: 11px;
          background-image: url("../../img/line-arrow.png");
          background-size: 100% 100%;
          background-repeat: no-repeat;
          z-index: 1;
        }
      }
    }
  }

  .el-table__cell {
    position: relative; // 确保子元素绝对定位生效
    color: var(--color-title, #fff) !important;
    border: none !important;
  }

  .el-table__body-wrapper {
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 212, 255, 0.6);
      border-radius: 3px;

      &:hover {
        background: rgba(0, 212, 255, 0.8);
      }
    }
  }

  .el-table__header-wrapper {
    background: linear-gradient(180deg, #1C3B68 0%, rgba(47, 61, 82, 0.0885) 100%);

    th {
      background: transparent;
      color: var(--color-title, #fff) !important;
    }
  }
}

</style>
