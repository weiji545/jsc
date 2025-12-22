import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// 创建 three 场景 / 摄像机 / 渲染器 / 控制器
export class Basic {
  constructor(dom) {
    this.dom = dom
    this.initScenes()
    this.setControls()
  }

  // 初始化场景
  initScenes() {
    this.scene = new THREE.Scene()

    const width = this.dom?.offsetWidth || window.innerWidth
    const height = this.dom?.offsetHeight || window.innerHeight

    this.camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      1,
      100000
    )
    this.camera.position.set(0, 30, -250)

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(width, height)
    this.renderer.domElement.style.display = 'block'
    this.renderer.domElement.style.width = '100%'
    this.renderer.domElement.style.height = '100%'
    this.dom.appendChild(this.renderer.domElement)
  }

  // 设置控制器
  setControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.autoRotateSpeed = 3
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.enableZoom = true
    this.controls.minDistance = 100
    this.controls.maxDistance = 300
    this.controls.enablePan = false
  }
}


