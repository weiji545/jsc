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

  async createEarth() {
    this.earth = new Earth({
      data: Data,
      globeCountryData: this.option.globeCountryData,
      renderEmptyCountry: this.option.renderEmptyCountry ?? false,
      dom: this.option.dom,
      textures: this.resources.textures,
      earth: {
        radius: 50,
        rotateSpeed: 0.001,
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

    const loading = document.querySelector('#loading')
    if (loading) {
      loading.classList.add('out')
    }
  }

  setupMouseEvents() {
    const handleMouseMove = event => {
      this.earth.handleMouseMove(event, this.camera)
    }

    const handleMouseLeave = () => {
      this.earth.handleMouseLeave()
    }

    this.option.dom.addEventListener('mousemove', handleMouseMove)
    this.option.dom.addEventListener('mouseleave', handleMouseLeave)
  }

  render() {
    requestAnimationFrame(this.render.bind(this))
    this.renderer.render(this.scene, this.camera)
    this.controls && this.controls.update()
    this.earth && this.earth.render()
  }
}


