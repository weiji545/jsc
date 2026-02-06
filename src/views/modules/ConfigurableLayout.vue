<template>
  <div class="configurable-layout-page">
    <!-- 顶部布局切换器 -->
    <div class="layout-controls">
      <div 
        class="layout-btn" 
        :class="{ active: currentPreset === 'preset1' }" 
        @click="currentPreset = 'preset1'"
      >
        均分布局 (1:1)
      </div>
      <div 
        class="layout-btn" 
        :class="{ active: currentPreset === 'preset2' }" 
        @click="currentPreset = 'preset2'"
      >
        阶梯布局 (2:1 | 1:1:1 | 1:2)
      </div>
      <div 
        class="layout-btn" 
        :class="{ active: currentPreset === 'preset3' }" 
        @click="currentPreset = 'preset3'"
      >
        大屏布局 (2x2 + 1:1:1)
      </div>
    </div>

    <!-- 动态布局容器 -->
    <div class="layout-container" :class="currentPreset">
      <div 
        v-for="(item, index) in componentsToRender" 
        :key="item.id" 
        class="layout-item"
        :class="['item-' + (index + 1)]"
      >
        <CardPanel :title="item.title" :unit="item.unit">
          <component 
            :is="item.component" 
            v-bind="item.props"
            style="width: 100%; height: 100%;"
          />
        </CardPanel>
      </div>
    </div>
  </div>
</template>

<script>
import CardPanel from '../components/panels/CardPanel.vue'
import EChartBarLine from '../components/charts/EChartBarLine.vue'
import EChartPieRing from '../components/charts/EChartPieRing.vue'

export default {
  name: 'ConfigurableLayout',
  components: {
    CardPanel,
    EChartBarLine,
    EChartPieRing
  },
  data() {
    return {
      currentPreset: 'preset1',
      // 定义一系列可用的组件
      allComponents: [
        {
          id: 1,
          title: '趋势分析 - 收入统计',
          unit: '万元',
          component: 'EChartBarLine',
          props: {
            categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
            barData: [1500, 2300, 1800, 2100, 2800, 2400],
            lineData: [40, 55, 30, 45, 60, 50],
            legendName: '收入',
            series2Name: '增长率',
            visibleY: 'both'
          }
        },
        {
          id: 2,
          title: '分布统计 - 业务来源',
          unit: '万元',
          component: 'EChartPieRing',
          props: {
            data: [
              { name: '业务A', value: 1048 },
              { name: '业务B', value: 735 },
              { name: '业务C', value: 580 },
              { name: '业务D', value: 484 }
            ],
            variant: 'donut'
          }
        },
        {
          id: 3,
          title: '费用趋势',
          unit: '千元',
          component: 'EChartBarLine',
          props: {
            categories: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            barData: [120, 200, 150, 80, 70, 110, 130],
            legendName: '支出额'
          }
        },
        {
          id: 4,
          title: '项目进度',
          unit: '%',
          component: 'EChartPieRing',
          props: {
            data: [
              { name: '已完成', value: 65 },
              { name: '进行中', value: 25 },
              { name: '未开始', value: 10 }
            ],
            variant: 'pie'
          }
        },
        {
          id: 5,
          title: '风险评估',
          unit: '分',
          component: 'EChartBarLine',
          props: {
            categories: ['A区', 'B区', 'C区', 'D区'],
            barData: [85, 42, 63, 91],
            legendName: '风险值'
          }
        },
        {
          id: 6,
          title: '用户增长',
          unit: '人',
          component: 'EChartBarLine',
          props: {
            categories: ['Q1', 'Q2', 'Q3', 'Q4'],
            lineData: [500, 800, 1200, 1100],
            series2Name: '增长人数'
          }
        },
        {
          id: 7,
          title: '市场占有率',
          unit: '%',
          component: 'EChartPieRing',
          props: {
            data: [
              { name: '品牌A', value: 35 },
              { name: '品牌B', value: 25 },
              { name: '品牌C', value: 20 },
              { name: '其他', value: 20 }
            ],
            variant: 'donut'
          }
        },
        {
          id: 8,
          title: '核心数据概览',
          unit: 'M',
          component: 'EChartBarLine',
          props: {
            categories: ['2019', '2020', '2021', '2022', '2023', '2024'],
            barData: [300, 450, 600, 850, 1100, 1400],
            lineData: [20, 25, 30, 35, 40, 45],
            legendName: '数据总量',
            series2Name: '年度增速',
            visibleY: 'both'
          }
        }
      ]
    }
  },
  computed: {
    componentsToRender() {
      if (this.currentPreset === 'preset1') {
        // 第一种：均分空间, 展示所有组件（或前8个）
        return this.allComponents.slice(0, 8)
      } else if (this.currentPreset === 'preset2') {
        // 第二种：2:1 | 1:1:1 | 1:2, 需要 7 个组件
        return this.allComponents.slice(0, 7)
      } else if (this.currentPreset === 'preset3') {
        // 第三种：2*2 + 1:1:1, 需要 6 个组件
        return this.allComponents.slice(0, 6)
      }
      return []
    }
  }
}
</script>

<style lang="scss" scoped>
.configurable-layout-page {
  width: 100%;
  height: 100%;
  padding: 20px 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  color: #fff;
  overflow-y: auto;
}

.layout-controls {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  flex-shrink: 0;

  .layout-btn {
    padding: 8px 16px;
    background: rgba(41, 241, 250, 0.1);
    border: 1px solid rgba(41, 241, 250, 0.4);
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    color: #9EC7F0;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(41, 241, 250, 0.2);
      border-color: #29F1FA;
      color: #fff;
    }

    &.active {
      background: rgba(41, 241, 250, 0.3);
      border-color: #29F1FA;
      color: #fff;
      box-shadow: 0 0 10px rgba(41, 241, 250, 0.3);
    }
  }
}

.layout-container {
  flex: 1;
  display: grid;
  gap: 20px;
  min-height: 0;

  // 布局 1: 两列均分
  &.preset1 {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 320px;
  }

  // 布局 2: 第一行2 1, 第二行1 1 1, 第三行1 2
  &.preset2 {
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(3, 310px);

    .item-1 { grid-column: span 4; }
    .item-2 { grid-column: span 2; }
    .item-3 { grid-column: span 2; }
    .item-4 { grid-column: span 2; }
    .item-5 { grid-column: span 2; }
    .item-6 { grid-column: span 2; }
    .item-7 { grid-column: span 4; }
  }

  // 布局 3: 第一行2*2 1, 第三行1 1 1
  &.preset3 {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 310px);

    .item-1 {
      grid-column: span 2;
      grid-row: span 2;
    }
    .item-2 { grid-column: 3; grid-row: 1; }
    .item-3 { grid-column: 3; grid-row: 2; }
    .item-4 { grid-column: 1; grid-row: 3; }
    .item-5 { grid-column: 2; grid-row: 3; }
    .item-6 { grid-column: 3; grid-row: 3; }
  }
}

.layout-item {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: rgba(0, 40, 80, 0.2);
  border-radius: 4px;
}
</style>
