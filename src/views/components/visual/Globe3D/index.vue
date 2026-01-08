<template>
  <div class="globe3d-root">
    <div ref="loading" class="earth-loading">
      <div class="sk-chase">
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
        <div class="sk-chase-dot"></div>
      </div>
      <div><!--        加载资源中...--></div>
    </div>
    <div ref="html2canvas" class="css3d-wapper">
    </div>
    <div
      ref="earthCanvas"
      class="earth-canvas"
    ></div>
  </div>
</template>

<script>
import { World } from './engine'

export default {
  name: 'Globe3D',
  props: {
    globeCountryData: {
      type: [Object, Array],
      default: () => ({}),
    },
  },
  data() {
    return {
      renderEmptyCountry: false,
      isDestroyed: false,
    }
  },
  watch: {
    globeCountryData: {
      handler(val) {
        if (val && !this.world) {
          const hasData = Array.isArray(val) ? val.length > 0 : Object.keys(val).length > 0
          if (hasData) {
            this.initWorld()
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    initWorld() {
      this.$nextTick(() => {
        if (this.isDestroyed) return
        const dom = this.$refs.earthCanvas
        if (!dom) {
          return

        }
        this.world = new World({
          dom,
          globeCountryData: this.globeCountryData,
          renderEmptyCountry: this.renderEmptyCountry,
        })

        // Hide loading after initialization
        this.$nextTick(() => {
          if (this.$refs.loading) {
            this.$refs.loading.classList.add('out')
          }
        })
      })
    },
  },
  beforeDestroy() {
    this.isDestroyed = true
    if (this.world && typeof this.world.dispose === 'function') {
      this.world.dispose()
      this.world = null
    }
  },
}
</script>

<style lang="scss" scoped>
.globe3d-root {
  width: 100%;
  height: 100%;
  position: relative;
  background: transparent;
  overflow: hidden;
  /* 取消父容器的全局缩放（使用 dashboard 层设置的 --global-scale） */
  display: flex;
  justify-content: center;
  align-items: center;
  transform: scale(calc(1 / var(--global-scale, 1)));
  transform-origin: center center;
}

.earth-canvas {
  width: 100%;
  height: 100%;
}

.css3d-wapper {
  position: absolute;
  z-index: -1;
  left: -99999px;
  top: -99999px;
  background: rgba(0, 0, 0, 0);
  pointer-events: none;
  color: #fff;
}

.css3d-wapper {
  ::v-deep .fire-div {
    font-size: 20px;
    font-weight: 600;
    border-top: 3px solid #0cd1eb;
    padding: 6px 8px;
    min-width: 50px;
    background: rgba(40, 108, 181, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.earth-loading {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  background: rgba(1, 8, 38, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: #409eff;
  font-size: 15px;
  letter-spacing: 2px;
  overflow: hidden;
}

.earth-loading.out {
  animation: zoomOut 0.5s linear forwards;
  pointer-events: none;
}

.sk-chase {
  margin-bottom: 20px;
  width: 40px;
  height: 40px;
  position: relative;
  animation: sk-chase 2.5s infinite linear both;
}

.sk-chase-dot {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  animation: sk-chase-dot 2s infinite ease-in-out both;
}

.sk-chase-dot::before {
  content: '';
  display: block;
  width: 20%;
  height: 20%;
  background-color: #409eff;
  border-radius: 100%;
  animation: sk-chase-dot-before 2s infinite ease-in-out both;
}

.sk-chase-dot:nth-child(1) {
  animation-delay: -1.1s;
}

.sk-chase-dot:nth-child(2) {
  animation-delay: -1s;
}

.sk-chase-dot:nth-child(3) {
  animation-delay: -0.9s;
}

.sk-chase-dot:nth-child(4) {
  animation-delay: -0.8s;
}

.sk-chase-dot:nth-child(5) {
  animation-delay: -0.7s;
}

.sk-chase-dot:nth-child(6) {
  animation-delay: -0.6s;
}

.sk-chase-dot:nth-child(1)::before {
  animation-delay: -1.1s;
}

.sk-chase-dot:nth-child(2)::before {
  animation-delay: -1s;
}

.sk-chase-dot:nth-child(3)::before {
  animation-delay: -0.9s;
}

.sk-chase-dot:nth-child(4)::before {
  animation-delay: -0.8s;
}

.sk-chase-dot:nth-child(5)::before {
  animation-delay: -0.7s;
}

.sk-chase-dot:nth-child(6)::before {
  animation-delay: -0.6s;
}

@keyframes zoomOut {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
    transform: scale3d(1.3, 1.3, 1.3);
  }
  100% {
    opacity: 0;
  }
}

@keyframes sk-chase {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes sk-chase-dot {
  80%,
  100% {
    transform: rotate(360deg);
  }
}

@keyframes sk-chase-dot-before {
  50% {
    transform: scale(0.4);
  }
  0%,
  100% {
    transform: scale(1);
  }
}
</style>

