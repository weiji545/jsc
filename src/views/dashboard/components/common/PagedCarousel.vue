<template>
  <div class="paged-carousel">
    <el-carousel :autoplay="autoplay" :interval="interval" :loop="loop" :height="height" indicator-position="outside">
      <el-carousel-item v-for="(slide, sidx) in slides" :key="sidx">
        <div class="slide-row">
          <template v-for="(it, idx) in slide">
            <!-- 将 item 与 index 暴露给父级 slot -->
            <slot name="item" :item="it" :index="sidx * perPage + idx"></slot>
          </template>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script>
export default {
  name: 'PagedCarousel',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    perPage: {
      type: Number,
      default: 4
    },
    autoplay: {
      type: Boolean,
      default: false
    },
    interval: {
      type: Number,
      default: 5000
    },
    loop: {
      type: Boolean,
      default: true
    },
    height: {
      type: String,
      default: '147px'
    }
  },
  computed: {
    slides() {
      const res = []
      if (!Array.isArray(this.items) || this.items.length === 0) return res
      for (let i = 0; i < this.items.length; i += this.perPage) {
        res.push(this.items.slice(i, i + this.perPage))
      }
      return res
    }
  }
}
</script>

<style scoped>
.paged-carousel ::v-deep .el-carousel__arrow {
  display: none;
}

.paged-carousel ::v-deep .el-carousel__button {
  background: #D8D8D8;
}

.paged-carousel ::v-deep .is-active .el-carousel__button {
  background: #29F1FA;
}

.paged-carousel ::v-deep .el-carousel__indicator--horizontal {
  padding: 4px 4px;
}

.slide-row {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: start;
}
/* 将指示器小横线改为小圆点 */
.paged-carousel ::v-deep .el-carousel__indicator button {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  margin: 0 6px;
  border: none;
  padding: 0;
}
.paged-carousel ::v-deep .el-carousel__indicator .is-active {
  background: #00d4ff;
}
.paged-carousel {
  width: 100%;
  display: block;
  box-sizing: border-box;
}
.paged-carousel ::v-deep .el-carousel__item {
  display: flex;
  align-items: center;
  justify-content: center;
}
.slide-row {
  justify-content: start;
  width: 100%;
}
.slide-row > * {
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
}
</style>


