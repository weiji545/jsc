<template>
  <div class="region-analysis">
    <div class="region_top">
      <div class="region_top_left">金额</div>
      <div class="region_top_right">
        账户数量
        <div class="triangle_group" @click="toggleOrder">
          <div :class="orderByAsc ? 'triangle-up-on' : 'triangle-up-off'"></div>
          <div :class="orderByAsc ? 'triangle-down-off' : 'triangle-down-on'"></div>
        </div>
      </div>
    </div>
    <div class="region-list">
      <PagedCarousel
        class="region-paged"
        :items="data"
        :perPage="5"
        :autoplay="false"
        :loop="false"
        height="210px"
      >
        <template #item="{ item, index }">
          <div class="region-row" :key="item.name">
            <div class="region_item">
              <img
                v-if="index < 3"
                :src="rankingIcons[index]"
                alt=""
                class="region_item_img"
              />
              <div v-else class="region_item_img rank-number">
                {{ index + 1 }}
              </div>
              <div class="region_item_right">
                <div class="region_item_info">
                  <div class="region-name">
                    <span>NO.0{{ index + 1 }} {{ item.name }}</span>
                    <span>{{ item.count || 0 }}</span>
                  </div>
                  <span class="region-value">{{ formatNumber(item.value) }}</span>
                </div>
                <div class="region_item_line">
                  <div
                    class="regin_item_gropress"
                    :style="{ width: progressWidth(item.value) }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </PagedCarousel>
    </div>
  </div>
</template>

<script>
import PagedCarousel from '../../components/common/PagedCarousel.vue'
import { formatNumber } from '../../../../utils/utils.js'
import ranking1 from '../../img/ranking-1.png'
import ranking2 from '../../img/ranking-2.png'
import ranking3 from '../../img/ranking-3.png'

export default {
  name: 'RegionRankList',
  components: { PagedCarousel },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    orderByAsc: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      rankingIcons: [ranking1, ranking2, ranking3]
    }
  },
  methods: {
    formatNumber,
    toggleOrder() {
      this.$emit('update:orderByAsc', !this.orderByAsc)
    },
    progressWidth(value) {
      if (!this.data || !this.data.length) return '0%'
      const max = this.data[0].value || 1
      return Math.min(100, (value / max) * 100) + '%'
    }
  }
}
</script>

<style lang="scss" scoped>
.region_top {
  display: flex;
  justify-content: center;
  font-size: 12px;
  color: #9e9e9e;
}

.region_top_left {
  margin-right: 21px;
  display: flex;
  align-items: center;
}

.region_top_left::before {
  display: inline-block;
  content: '';
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
  content: '';
  margin-right: 5px;
  width: 10px;
  height: 10px;
  background: #0cd9b5;
}

.triangle_group {
  margin-left: 7px;
  display: flex;
  cursor: pointer;
  gap: 5px;

  .triangle-up-on {
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 10px solid #0cd9b5;
  }

  .triangle-up-off {
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 10px solid #9e9e9e;
  }

  .triangle-down-on {
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 10px solid #0cd9b5;
  }

  .triangle-down-off {
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 10px solid #9e9e9e;
  }
}

.region_item {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  width: 100%;
  height: 100%;
}

.region_item_img {
  width: 20px;
  height: 23px;
}

.rank-number {
  width: 28px;
  height: 30px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.2);
  color: #cfcfcf;
  font-weight: 600;
}

.region-paged ::v-deep .slide-row {
  flex-direction: column;
  gap: 2px;
  align-items: stretch;
}

.region_item_right {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 90%;
  height: 28px;
}

.region_item_info {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.region_item_line {
  width: 100%;
  height: 8px;
  background: #0cd9b5;
  border-radius: 4px;
}

.regin_item_gropress {
  height: 8px;
  background: #0098fa;
  border-radius: 4px;
}

.region-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 38px;
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
</style>
