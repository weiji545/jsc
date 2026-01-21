<template>
  <div class="data-table-wrapper" :style="{ flexDirection: direction }" :class="{ 'header-only': headerOnly }">
    <el-table
      :data="tableData"
      size="small"
      style="width:100%"
      :max-height="maxHeight"
      :show-header="showHeader"
      :class="{ 'is-dense': dense }"
      @sort-change="handleSortChange"
    >
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :align="column.align || 'center'"
        :header-align="column.headerAlign || 'center'"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :sortable="column.sortable || false"
        :show-overflow-tooltip="!column.maxLength && column.showOverflowTooltip !== false"
      >
        <template slot-scope="scope">
          <el-tooltip
            v-if="column.maxLength && isTruncated(scope.row, column)"
            effect="dark"
            :content="String(getRawDisplayValue(scope.row, column))"
            placement="top"
          >
            <span>{{ getTruncatedValue(scope.row, column) }}</span>
          </el-tooltip>
          <span v-else>{{ getRawDisplayValue(scope.row, column) }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { formatNumber } from '@/utils/utils.js'

export default {
  name: 'DataTable',
  props: {
    // 表格数据
    tableData: {
      type: Array,
      default: () => []
    },
    // 列配置
    columns: {
      type: Array,
      default: () => []
    },
    // 最大高度
    maxHeight: {
      type: String,
      default: '170px'
    },
    // 布局方向 row/column
    direction: {
      type: String,
      default: 'row'
    },
    // 是否显示表头
    showHeader: {
      type: Boolean,
      default: true
    },
    // 是否只显示表头（隐藏内容）
    headerOnly: {
      type: Boolean,
      default: false
    },
    // 紧凑模式（减小行高）
    dense: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleSortChange({ prop, order }) {
      this.$emit('sort-change', { prop, order })
    },
    // 获取原始显示值（应用 formatter 如果有）
    getRawDisplayValue(row, column) {
      const cellValue = row[column.prop]
      if (column.formatter && typeof column.formatter === 'function') {
        const val = column.formatter(row, column, cellValue)
        return (val === undefined || val === null) ? '' : val
      }
      return (cellValue === undefined || cellValue === null) ? '' : cellValue
    },
    // 获取截断后的显示值
    getTruncatedValue(row, column) {
      const val = this.getRawDisplayValue(row, column)
      if (column.maxLength && val && String(val).length > column.maxLength) {
        return String(val).substring(0, column.maxLength - 1) + '..'
      }
      return val
    },
    // 判断是否被截断
    isTruncated(row, column) {
      if (!column.maxLength) return false
      const val = this.getRawDisplayValue(row, column)
      return val && String(val).length > column.maxLength
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
    }
  }
}
</script>

<style lang="scss" scoped>
.data-table-wrapper {
  display: flex;
  height: 100%;
  width: 100%;
  max-width: 100%; // 确保不超过父容器
  overflow: hidden; // 防止溢出

  &.header-only {
    height: auto !important;
    min-height: 0 !important;

    ::v-deep .el-table__body-wrapper {
      display: none !important;
    }
    ::v-deep .el-table__empty-block {
      display: none !important;
    }
  }
}

/* 局部表格样式覆盖 */
::v-deep .el-table {
  font-size: 14px;
  table-layout: fixed; // 固定表格布局，严格遵守列宽

  &.is-dense {
    .el-table__cell {
      padding: 0px 0 !important; // 紧凑模式
      height: 32px !important; // 强制降低行高
    }
  }

  &::before {
    height: 0;
  }

  &, tr, .el-table__cell {
    background: transparent !important;
  }

  // 彻底隐藏gutter列
  th.gutter,
  td.gutter,
  colgroup col[name="gutter"] {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
    padding: 0 !important;
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
    position: relative;
    color: var(--color-title, #fff) !important;
    border: none !important;
    padding: 3px 0; // 默认稍微紧凑一点，原先可能是 12px

    // 文本溢出处理
    .cell {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: normal; // 防止行高撑开
    }
  }


  .el-table__body-wrapper {
    // 隐藏纵向滚动条
    &::-webkit-scrollbar {
      width: 0; // 隐藏纵向滚动条
      height: 6px; // 保留横向滚动条
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

    // 彻底禁用纵向滚动
    overflow-y: hidden !important;
  }

  .el-table__header-wrapper {
    display: flex;
    height: 37px;
    background: linear-gradient(180deg, #1C3B68 0%, rgba(47, 61, 82, 0.0885) 100%);

    th {
      background: transparent;
      color: var(--color-title, #fff) !important;
    }
  }
}
</style>
