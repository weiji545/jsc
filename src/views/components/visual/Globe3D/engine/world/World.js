import {
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  WebGLRenderer
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { Basic } from './Basic'
import Sizes from '../utils/Sizes'
import { Resources } from './Resources'
import Earth from './Earth'
import Data from './Data'

// three 场景总管，封装自 3d-earth-main 的 World 类
export default class World {
  constructor(option) {
    this.option = option

    this.basic = new Basic(option.dom)
    this.scene = this.basic.scene
    this.renderer = this.basic.renderer
    this.controls = this.basic.controls
    this.camera = this.basic.camera

    this.sizes = new Sizes({ dom: option.dom })

    this.sizes.$on('resize', () => {
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(Number(this.sizes.viewport.width), Number(this.sizes.viewport.height))
      this.camera.aspect = Number(this.sizes.viewport.width) / Number(this.sizes.viewport.height)
      this.camera.updateProjectionMatrix()
      this.controls && this.controls.update()
    })

    this.resources = new Resources(async () => {
      await this.createEarth()
      this.render()
    })
  }

  /**
   * 基于Three.js的3D地球组件类
   * 提供地球渲染、旋转控制、数据点位显示、交互等功能
   *
   * @param {Object} options - 配置选项
   * @param {Object} options.earth - 地球相关配置
   * @param {number} options.earth.radius - 地球半径，默认50
   * @param {boolean} options.earth.isRotation - 是否开启自动旋转，默认true
   * @param {number} options.earth.rotateSpeed - 旋转速度，默认0.01
   * @param {number} options.earth.scale - 地球缩放比例，默认1.0
   * @param {number} options.scale - 整体缩放比例（优先级高于earth.scale），默认1.0
   */

  async createEarth() {
    this.earth = new Earth({
      data: Data,
      globeCountryData: this.option.globeCountryData,
      renderEmptyCountry: this.option.renderEmptyCountry ?? false,
      dom: this.option.dom,
      textures: this.resources.textures,
      earth: {
        radius: 50,
        rotateSpeed: 0.001, // 自转速度
        isRotation: true
      },
      satellite: {
        show: true,
        rotateSpeed: -0.01,
        size: 1,
        number: 2
      },
      punctuation: {
        circleColor: 0x3892ff,
        lightColumn: {
          startColor: 0xe4007f,
          endColor: 0xffffff
        }
      },
      flyLine: {
        color: 0xf3ae76,
        flyLineColor: 0xff7714,
        speed: 0.004
      }
    })

    this.scene.add(this.earth.group)

    await this.earth.init()

    this.earth.setCamera(this.camera)
    this.setupMouseEvents()

    // Loading element is now handled by the Vue component
    // No need to query by ID
  }

  setupMouseEvents() {
    this._handleMouseMove = event => {
      this.earth.handleMouseMove(event, this.camera)
    }

    this._handleMouseLeave = () => {
      this.earth.handleMouseLeave()
    }

    this.option.dom.addEventListener('mousemove', this._handleMouseMove)
    this.option.dom.addEventListener('mouseleave', this._handleMouseLeave)
  }

  render() {
    if (this.isDestroyed) return
    this.animationFrameId = requestAnimationFrame(this.render.bind(this))
    this.renderer.render(this.scene, this.camera)
    this.controls && this.controls.update()
    this.earth && this.earth.render()
  }

  dispose() {
    this.isDestroyed = true
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }

    if (this.sizes) {
      this.sizes.dispose()
    }

    // Dispose Earth
    if (this.earth) {
      this.earth.dispose()
    }

    // Dispose Basic (renderer, controls)
    if (this.controls) {
      this.controls.dispose()
      this.controls = null
    }

    if (this.renderer) {
      this.renderer.dispose()
      if (this.option.dom && this.renderer.domElement && this.renderer.domElement.parentNode === this.option.dom) {
        this.option.dom.removeChild(this.renderer.domElement)
      }
      this.renderer = null
    }

    // Remove listeners
    if (this.option.dom) {
      if (this._handleMouseMove) this.option.dom.removeEventListener('mousemove', this._handleMouseMove)
      if (this._handleMouseLeave) this.option.dom.removeEventListener('mouseleave', this._handleMouseLeave)
    }
  }
}


