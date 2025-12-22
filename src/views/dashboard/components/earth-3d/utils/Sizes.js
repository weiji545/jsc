import { EventEmitter } from 'pietile-eventemitter'

// 屏幕尺寸管理，来自 3d-earth-main 的 Sizes 类，去掉 TS 类型
export default class Sizes {
  constructor(options) {
    this.emitter = new EventEmitter()

    this.$sizeViewport = options.dom

    this.resizeObserver = null

    this.viewport = {
      width: 0,
      height: 0
    }

    this.resize = this.resize.bind(this)
    window.addEventListener('resize', this.resize)

    if (typeof ResizeObserver !== 'undefined' && this.$sizeViewport) {
      this.resizeObserver = new ResizeObserver(() => this.resize())
      this.resizeObserver.observe(this.$sizeViewport)
    }

    this.resize()
  }

  $on(event, fun) {
    this.emitter.on(
      event,
      () => {
        fun()
      }
    )
  }

  resize() {
    this.viewport.width = this.$sizeViewport?.offsetWidth || window.innerWidth
    this.viewport.height = this.$sizeViewport?.offsetHeight || window.innerHeight
    this.emitter.emit('resize')
  }
}


