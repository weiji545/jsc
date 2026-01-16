<template>
  <div class="account-summary">
    <div class="summary-top">
      <div
        class="summary-box"
        :class="{ 'summary-box--highlight': highlightScope === 'domestic' }"
      >
        <div class="summary-text">
          <div class="summary-number">
            {{ formatNumber(domesticValue, decimals) }}
          </div>
          <div class="summary-label">{{ domesticLabel }}</div>
        </div>
      </div>
      <div
        class="summary-box"
        :class="{ 'summary-box--highlight': highlightScope === 'overseas' }"
      >
        <div class="summary-text">
          <div class="summary-number">
            {{ formatNumber(overseasValue, decimals) }}
          </div>
          <div class="summary-label">{{ overseasLabel }}</div>
        </div>
      </div>
    </div>
    <div class="summary-bottom">
      <PagedCarousel
        :items="carouselItems"
        :perPage="4"
        :interval="5000"
        :autoplay="true"
      >
        <template #item="{ item, index }">
          <div :key="index" class="ring-card">
            <div class="ring" :class="{ negative: item.percent < 0 }">
              <!-- 环比增长 -->
              <div v-if="variant === 'sparkline'" class="trend-badge">
                <div class="trend-label">月度环比增长</div>
                <div
                  class="trend-value"
                  :style="{ color: item.percent >= 0 ? '#0098FA' : '#FF3A3A' }"
                >
                  {{ (item.percent >= 0 ? '+' : '') + item.percent }}%
                </div>
              </div>

              <EChartRingBar
                v-if="variant === 'ring'"
                :percent="item.percent"
                :size="92"
                :height="92"
              />
              <EChartSparkline
                v-else-if="variant === 'sparkline'"
                :data="item.data"
                :height="70"
                :color="item.percent >= 0 ? '#3AACFF' : '#FF3A3A'"
              />

              <div
                v-if="variant === 'ring'"
                class="ring-percent"
                :style="{ color: textColor }"
              >
                {{ item.percent }}%
              </div>
            </div>
            <div class="ring-value" :style="{ color: textColor }">
              {{ formatCellValue(item) }}
            </div>
            <el-tooltip class="item" effect="dark" :content="item.label" placement="top">
              <div class="ring-label">{{ item.label }}</div>
            </el-tooltip>
          </div>
        </template>
      </PagedCarousel>
    </div>
  </div>
</template>

<script>
import PagedCarousel from '../../components/common/PagedCarousel.vue'
import EChartRingBar from '../../components/charts/EChartRingBar.vue'
import EChartSparkline from '../../components/charts/EChartSparkline.vue'
import { formatNumber } from '../../../utils/utils.js'

export default {
  name: 'OverviewMetricPanel',
  components: { PagedCarousel, EChartRingBar, EChartSparkline },
  props: {
    domesticValue: [Number, String],
    domesticLabel: String,
    overseasValue: [Number, String],
    overseasLabel: String,
    highlightScope: String,
    carouselItems: Array,
    variant: {
      type: String, // 'ring' or 'sparkline'
      default: 'ring',
    },
    decimals: {
      type: Number,
      default: 0,
    },
    textColor: {
      type: String,
      default: '#fff',
    },
  },
  methods: {
    formatNumber,
    formatCellValue(item) {
      if (this.variant === 'ring') {
        return formatNumber(item.value, this.decimals)
      } else {
        const sum = (item.data || []).reduce((a, b) => a + b, 0)
        return formatNumber(sum, 2)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
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
  background: linear-gradient(180deg, rgba(19, 83, 173, 0.15) 0%, rgba(19, 64, 138, 0.09) 50%, rgba(5, 102, 225, 0.18) 100%);
  min-height: 0;
}

.summary-box--highlight {
  border-left: 6px solid #29f1fa;
  padding-left: 21px;

  /* 浅色模式下改为 #096DD9 */
  .is-light-mode & {
    border-color: #096DD9;
  }
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 105px;
}

.ring {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  position: relative;

  &.negative {
    filter: drop-shadow(0 0 6px rgba(255, 95, 95, 0.35));
  }

  &:not(.negative) {
    filter: drop-shadow(0 0 6px rgba(0, 212, 255, 0.35));
  }
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

.ring-value {
  font-size: 16px;
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
  -webkit-box-orient: vertical;
  word-break: break-word;
  text-align: center;
  color: var(--color-label2-dark, #c3e2ff);
}

.trend-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  font-size: 12px;
  line-height: 1;
  text-align: left;
  z-index: 20;

  .trend-label {
    font-size: 12px;
  }

  .trend-value {
    font-size: 12px;
    font-weight: 600;
    margin-top: 5px;
  }
}
</style>
