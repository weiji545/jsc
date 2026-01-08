import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  NormalBlending,
  Object3D,
  Points,
  PointsMaterial,
  Raycaster,
  ShaderMaterial,
  SphereBufferGeometry,
  Sprite,
  SpriteMaterial,
  LinearFilter,
  TextureLoader,
  Vector2,
  Vector3
} from 'three'
import { CanvasTexture } from 'three'
import gsap from 'gsap'

import { earthVertex, earthFragment } from '../shaders/earth'
import {
  createAnimateLine,
  createLightPillar,
  createPointMesh,
  createWaveMesh,
  getCirclePoints,
  lon2xyz
} from '../utils/common'
import { flyArc } from '../utils/arc'

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
export default class Earth {
  constructor(options) {
    this.options = options
    
    // 如果是数组结构，转换为以 name (中文名) 为 key 的对象 map，方便后续高效匹配
    if (Array.isArray(this.options.globeCountryData)) {
      this.dataMap = this.options.globeCountryData.reduce((acc, item) => {
        if (item.name) acc[item.name] = item
        return acc
      }, {})
    } else {
      this.dataMap = this.options.globeCountryData || {}
    }

    this.group = new Group()
    this.group.name = 'group'
    this.group.scale.set(0, 0, 0)
    this.earthGroup = new Group()
    this.group.add(this.earthGroup)
    this.earthGroup.name = 'EarthGroup'

    this.markupPoint = new Group()
    this.markupPoint.name = 'markupPoint'
    this.waveMeshArr = []

    this.circleLineList = []
    this.circleList = []
    this.x = 0
    this.n = 0

    // 控制地球自转的参数
    // isRotation: 布尔值，true表示开启地球自动旋转，false表示停止旋转
    // rotateSpeed: 数值，控制地球旋转的速度，建议值范围：0.005-0.02
    this.isRotation = this.options.earth.isRotation

    this.raycaster = new Raycaster()
    this.mouse = new Vector2()
    this.isHovering = false
    this.hoveredRegion = null
    this.camera = null
    this.tooltipElement = null

    this.createTooltip()

    this.timeValue = 100
    this.uniforms = {
      glowColor: {
        value: new Color(0x0cd1eb)
      },
      scale: {
        type: 'f',
        value: -1
      },
      bias: {
        type: 'f',
        value: 1
      },
      power: {
        type: 'f',
        value: 3.3
      },
      time: {
        type: 'f',
        value: this.timeValue
      },
      isHover: {
        value: false
      },
      map: {
        value: null
      }
    }
  }

  async init() {
    return new Promise(async resolve => {
      this.createEarth(); // 创建地球
      // this.createStars(); // 添加星星
      this.createEarthGlow() // 创建地球辉光
      this.createEarthAperture() // 创建地球的大气层
      await this.createMarkupPoint() // 创建柱状点位
      await this.createSpriteLabel() // 创建标签
      // this.createAnimateCircle() // 创建环绕卫星
      // this.createFlyLine() // 创建飞线

      this.show()
      resolve()
    })
  }

  createEarth() {
    const earthGeometry = new SphereBufferGeometry(
      this.options.earth.radius,
      50,
      50
    )

    const earthBorder = new SphereBufferGeometry(
      this.options.earth.radius + 10,
      60,
      60
    )

    const pointMaterial = new PointsMaterial({
      color: 0x81ffff,
      transparent: true,
      sizeAttenuation: true,
      opacity: 0,
      vertexColors: false,
      size: 0.01
    })
    const points = new Points(earthBorder, pointMaterial)
    this.earthGroup.add(points)

    this.uniforms.map.value = this.options.textures.earth

    const earthMaterial = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: earthVertex,
      fragmentShader: earthFragment
    })

    earthMaterial.needsUpdate = true
    this.earth = new Mesh(earthGeometry, earthMaterial)
    this.earth.name = 'earth'
    this.earthGroup.add(this.earth)
  }

  createStars() {
    const vertices = []
    const colors = []
    for (let i = 0; i < 500; i++) {
      const vertex = new Vector3()
      vertex.x = 800 * Math.random() - 300
      vertex.y = 800 * Math.random() - 300
      vertex.z = 800 * Math.random() - 300
      vertices.push(vertex.x, vertex.y, vertex.z)
      colors.push(new Color(1, 1, 1))
    }

    this.around = new BufferGeometry()
    this.around.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3))
    this.around.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3))

    const aroundMaterial = new PointsMaterial({
      size: 2,
      sizeAttenuation: true,
      color: 0x4d76cf,
      transparent: true,
      opacity: 1,
      map: this.options.textures.gradient
    })

    this.aroundPoints = new Points(this.around, aroundMaterial)
    this.aroundPoints.name = '星空'
    this.aroundPoints.scale.set(1, 1, 1)
    this.group.add(this.aroundPoints)
  }

  createEarthGlow() {
    const R = this.options.earth.radius
    const texture = this.options.textures.glow

    const spriteMaterial = new SpriteMaterial({
      map: texture,
      color: 0x4390d1,
      transparent: true,
      opacity: 0.7,
      depthWrite: false
    })

    const sprite = new Sprite(spriteMaterial)
    sprite.scale.set(R * 3, R * 3, 1)
    this.earthGroup.add(sprite)
  }

  createEarthAperture() {
    const vertexShader = [
      'varying vec3	vVertexWorldPosition;',
      'varying vec3	vVertexNormal;',
      'varying vec4	vFragColor;',
      'void main(){',
      '	vVertexNormal	= normalize(normalMatrix * normal);',
      '	vVertexWorldPosition	= (modelMatrix * vec4(position, 1.0)).xyz;',
      '	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '}'
    ].join('\n')

    const aeroSphere = {
      uniforms: {
        coeficient: {
          type: 'f',
          value: 1
        },
        power: {
          type: 'f',
          value: 3
        },
        glowColor: {
          type: 'c',
          value: new Color(0x4390d1)
        }
      },
      vertexShader,
      fragmentShader: [
        'uniform vec3	glowColor;',
        'uniform float	coeficient;',
        'uniform float	power;',
        'varying vec3	vVertexNormal;',
        'varying vec3	vVertexWorldPosition;',
        'varying vec4	vFragColor;',
        'void main(){',
        '	vec3 worldCameraToVertex = vVertexWorldPosition - cameraPosition;',
        '	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;',
        '	viewCameraToVertex= normalize(viewCameraToVertex);',
        '	float intensity	= pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);',
        '	gl_FragColor = vec4(glowColor, intensity);',
        '}'
      ].join('\n')
    }

    const material1 = new ShaderMaterial({
      uniforms: aeroSphere.uniforms,
      vertexShader: aeroSphere.vertexShader,
      fragmentShader: aeroSphere.fragmentShader,
      blending: NormalBlending,
      transparent: true,
      depthWrite: false
    })
    const sphere = new SphereBufferGeometry(
      this.options.earth.radius,
      50,
      50
    )
    const mesh = new Mesh(sphere, material1)
    this.earthGroup.add(mesh)
  }

  // 判断区域是否应该渲染（有数据或开关允许渲染空数据）
  shouldRenderRegion(region) {
    const { renderEmptyCountry = false } = this.options || {}
    if (!this.dataMap || !region || !region.name) return false

    // 通过 name (中文名) 匹配
    const payload = this.dataMap[region.name]

    if (!payload) return false

    // 如果 accounts 或 balance 有一个为空，根据开关决定是否渲染
    const hasAccounts = payload.accounts !== null && payload.accounts !== undefined
    const hasBalance = payload.balance !== null && payload.balance !== undefined

    // 两个值都有值，或者开关允许渲染空数据
    return (hasAccounts && hasBalance) || renderEmptyCountry
  }

  async createMarkupPoint() {
    await Promise.all(this.options.data.map(async item => {
      // 检查是否应该渲染该区域
      if (!this.shouldRenderRegion(item.startArray)) {
        return
      }

      const radius = this.options.earth.radius
      const lon = item.startArray.E
      const lat = item.startArray.N

      this.punctuationMaterial = new MeshBasicMaterial({
        color: this.options.punctuation.circleColor,
        map: this.options.textures.label,
        transparent: true,
        depthWrite: false
      })

      const mesh = createPointMesh({ radius, lon, lat, material: this.punctuationMaterial })
      this.markupPoint.add(mesh)
      const lightPillar = createLightPillar({
        radius: this.options.earth.radius,
        lon,
        lat,
        index: 0,
        textures: this.options.textures,
        punctuation: this.options.punctuation
      })
      this.markupPoint.add(lightPillar)
      const waveMesh = createWaveMesh({ radius, lon, lat, textures: this.options.textures })
      this.markupPoint.add(waveMesh)
      this.waveMeshArr.push(waveMesh)

      await Promise.all(item.endArray.map(obj => {
        // 检查是否应该渲染该区域
        if (!this.shouldRenderRegion(obj)) {
          return
        }

        const lon2 = obj.E
        const lat2 = obj.N
        const mesh2 = createPointMesh({ radius, lon: lon2, lat: lat2, material: this.punctuationMaterial })
        this.markupPoint.add(mesh2)
        const lightPillar2 = createLightPillar({
          radius: this.options.earth.radius,
          lon: lon2,
          lat: lat2,
          index: 1,
          textures: this.options.textures,
          punctuation: this.options.punctuation
        })
        this.markupPoint.add(lightPillar2)
        const waveMesh2 = createWaveMesh({ radius, lon: lon2, lat: lat2, textures: this.options.textures })
        this.markupPoint.add(waveMesh2)
        this.waveMeshArr.push(waveMesh2)
      }))
      this.earthGroup.add(this.markupPoint)
    }))
  }

  createTextCanvas(text) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const scale = 2.5
    const fontSize = 36 * scale
    const paddingX = 24 * scale
    const paddingY = 12 * scale
    const borderTop = 3 * scale// thickness

    // Initial font setting to measure text
    ctx.font = `600 ${fontSize}px "Microsoft YaHei", sans-serif`
    const metrics = ctx.measureText(text)
    const textWidth = Math.ceil(metrics.width)

    // Calculate canvas size
    const width = textWidth + paddingX * 2
    const height = Math.ceil(fontSize * 1.2) + paddingY * 2 + borderTop

    // Set canvas dimensions (clears context)
    canvas.width = width
    canvas.height = height

    // Re-set context properties after resize
    ctx.font = `600 ${fontSize}px "Microsoft YaHei", sans-serif`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'

    // Draw Background
    ctx.fillStyle = 'rgba(40, 108, 181, 0.5)'
    ctx.fillRect(0, 0, width, height)

    // Draw Top Border
    ctx.fillStyle = '#0cd1eb'
    ctx.fillRect(0, 0, width, borderTop)

    // Draw Text
    ctx.fillStyle = '#ffffff'
    const x = width / 2
    // Vertical center inside the content area (excluding top border mostly, but keeping visual balance)
    const y = borderTop + paddingY + (fontSize * 1.2) / 2 * 0.9 // *0.9 for visual adjustment
    ctx.fillText(text, x, y)

    return canvas
  }

  async createSpriteLabel() {
    this.options.data.forEach(item => {
      let cityArry = []
      cityArry.push(item.startArray)
      cityArry = cityArry.concat(...item.endArray)
      cityArry.forEach(e => {
        // 检查是否应该渲染该区域的标签
        if (!this.shouldRenderRegion(e)) {
          return
        }

        const p = lon2xyz(this.options.earth.radius * 1.001, e.E, e.N)

        const canvas = this.createTextCanvas(e.name)
        const map = new CanvasTexture(canvas)

        map.minFilter = LinearFilter
        map.magFilter = LinearFilter

        const material = new SpriteMaterial({
          map,
          transparent: true
        })
        const sprite = new Sprite(material)

        // Scale calculation to match world units
        // Previous code: scale = (canvas.width / dpi) / 12
        // We can simplify. Let's say 12 pixels = 1 unit.
        // But since we are not using high-DPI scaling on the canvas manually (implied 1:1),
        // we might need to adjust.
        // Original code used 36px font.
        // Let's stick to a similar ratio.

        const pixelPerUnit = 24
        const worldWidth = canvas.width / pixelPerUnit
        const worldHeight = canvas.height / pixelPerUnit

        sprite.scale.set(worldWidth, worldHeight, 1)
        sprite.position.set(p.x * 1.1, p.y * 1.1, p.z * 1.1)
        this.earth.add(sprite)
      })
    })
  }

  createAnimateCircle() {
    const list = getCirclePoints({
      radius: this.options.earth.radius + 15,
      number: 150,
      closed: true
    })
    const mat = new MeshBasicMaterial({
      color: '#0c3172',
      transparent: true,
      opacity: 0.4,
      side: DoubleSide
    })
    const line = createAnimateLine({
      pointList: list,
      material: mat,
      number: 100,
      radius: 0.1
    })
    this.earthGroup.add(line)

    const l2 = line.clone()
    l2.scale.set(1.2, 1.2, 1.2)
    l2.rotateZ(Math.PI / 6)
    this.earthGroup.add(l2)

    const l3 = line.clone()
    l3.scale.set(0.8, 0.8, 0.8)
    l3.rotateZ(-Math.PI / 6)
    this.earthGroup.add(l3)

    const ball = new Mesh(
      new SphereBufferGeometry(this.options.satellite.size, 32, 32),
      new MeshBasicMaterial({
        color: '#e0b187'
      })
    )

    const ball2 = new Mesh(
      new SphereBufferGeometry(this.options.satellite.size, 32, 32),
      new MeshBasicMaterial({
        color: '#628fbb'
      })
    )

    const ball3 = new Mesh(
      new SphereBufferGeometry(this.options.satellite.size, 32, 32),
      new MeshBasicMaterial({
        color: '#806bdf'
      })
    )

    this.circleLineList.push(line, l2, l3)
    ball.name = '卫星'
    ball2.name = '卫星'
    ball3.name = '卫星'

    for (let i = 0; i < this.options.satellite.number; i++) {
      const ball01 = ball.clone()
      const num = Math.floor(list.length / this.options.satellite.number)
      ball01.position.set(
        list[num * (i + 1)][0] * 1,
        list[num * (i + 1)][1] * 1,
        list[num * (i + 1)][2] * 1
      )
      line.add(ball01)

      const ball02 = ball2.clone()
      const num02 = Math.floor(list.length / this.options.satellite.number)
      ball02.position.set(
        list[num02 * (i + 1)][0] * 1,
        list[num02 * (i + 1)][1] * 1,
        list[num02 * (i + 1)][2] * 1
      )
      l2.add(ball02)

      const ball03 = ball3.clone()
      const num03 = Math.floor(list.length / this.options.satellite.number)
      ball03.position.set(
        list[num03 * (i + 1)][0] * 1,
        list[num03 * (i + 1)][1] * 1,
        list[num03 * (i + 1)][2] * 1
      )
      l3.add(ball03)
    }
  }

  createFlyLine() {
    this.flyLineArcGroup = new Group()
    this.flyLineArcGroup.userData.flyLineArray = []
    this.earthGroup.add(this.flyLineArcGroup)

    this.options.data.forEach(cities => {
      cities.endArray.forEach(item => {
        const arcline = flyArc(
          this.options.earth.radius,
          cities.startArray.E,
          cities.startArray.N,
          item.E,
          item.N,
          this.options.flyLine
        )

        this.flyLineArcGroup.add(arcline)
        this.flyLineArcGroup.userData.flyLineArray.push(arcline.userData.flyLine)
      })
    })
  }

  show() {
    // 默认视角缩放的参数
    // scale 或 earth.scale: 数值，控制地球整体的缩放比例，1.0表示原始大小
    // 建议值范围：0.5-2.0，小于1缩小，大于1放大
    const targetScale = (this.options && (this.options.scale || (this.options.earth && this.options.earth.scale))) || 1.2
    gsap.to(this.group.scale, {
      x: targetScale,
      y: targetScale,
      z: targetScale,
      duration: 2,
      ease: 'Quadratic'
    })
  }

  createTooltip() {
    this.tooltipElement = document.createElement('div')
    this.tooltipElement.id = 'earth-tooltip'
    this.tooltipElement.style.cssText = `
      position: absolute;
      background: rgba(20, 40, 80, 0.95);
      border: 2px solid #0cd1eb;
      border-radius: 8px;
      padding: 12px 16px;
      color: #fff;
      font-size: 14px;
      line-height: 1.3;
      pointer-events: none;
      z-index: 9999;
      display: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
      box-sizing: border-box;
      max-width: 320px;
      white-space: normal;
      word-break: break-word;
      -webkit-font-smoothing: antialiased;
    `
    // 优先挂载到全屏容器或项目主容器，确保在全屏模式下可见
    const container = document.querySelector('.dashboard-outer') || document.body
    container.appendChild(this.tooltipElement)
  }

  cartesianToLonLat(point) {
    const x = point.x
    const y = point.y
    const z = point.z

    const radius = Math.sqrt(x * x + y * y + z * z)
    const lat = Math.asin(y / radius) * 180 / Math.PI
    let lon = Math.atan2(z, x) * 180 / Math.PI
    lon = -lon

    return { lon, lat }
  }

  normalizeLongitude(lon) {
    let res = lon
    while (res > 180) res -= 360
    while (res < -180) res += 360
    return res
  }

  calculateDistance(lon1, lat1, lon2, lat2) {
    let l1 = this.normalizeLongitude(lon1)
    let l2 = this.normalizeLongitude(lon2)

    const dLat = lat2 - lat1
    let dLon = l2 - l1

    if (dLon > 180) dLon -= 360
    if (dLon < -180) dLon += 360

    return Math.sqrt(dLat * dLat + dLon * dLon)
  }

  detectRegion(lon, lat) {
    const threshold = 20
    const normLon = this.normalizeLongitude(lon)

    let closestRegion = null
    let minDistance = threshold

    for (const item of this.options.data) {
      // 只检测应该渲染的区域
      if (!this.shouldRenderRegion(item.startArray)) {
        continue
      }

      const startLon = this.normalizeLongitude(item.startArray.E)
      const startDist = this.calculateDistance(normLon, lat, startLon, item.startArray.N)
      if (startDist < minDistance) {
        minDistance = startDist
        closestRegion = item.startArray
      }

      for (const end of item.endArray) {
        // 只检测应该渲染的区域
        if (!this.shouldRenderRegion(end)) {
          continue
        }

        const endLon = this.normalizeLongitude(end.E)
        const endDist = this.calculateDistance(normLon, lat, endLon, end.N)
        if (endDist < minDistance) {
          minDistance = endDist
          closestRegion = end
        }
      }
    }

    return closestRegion
  }

  handleMouseMove(event, camera) {
    if (!this.earth || !camera) return

    const rect = this.options.dom.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    // Throttle raycasting: only if we haven't done it recently or if we aren't already hovering
    // But for smooth hovering effect, we might need it.
    // Optimization: Check distance from center first?
    // Optimization: Limit frequency

    // Check if enough time passed since last check
    const now = Date.now()
    if (this._lastMouseMoveTime && (now - this._lastMouseMoveTime < 32)) { // ~30fps cap for raycasting
       return
    }
    this._lastMouseMoveTime = now

    this.raycaster.setFromCamera(this.mouse, camera)
    const intersects = this.raycaster.intersectObject(this.earth)

    if (intersects.length > 0) {
      const intersection = intersects[0]
      const point = intersection.point.clone()

      const localPoint = point.clone()
      const inverseMatrix = this.earth.matrixWorld.clone().invert()
      localPoint.applyMatrix4(inverseMatrix)
      localPoint.normalize()

      const { lon, lat } = this.cartesianToLonLat(localPoint)
      const region = this.detectRegion(lon, lat)

      if (region) {
        if (!this.isHovering || !this.hoveredRegion || this.hoveredRegion.name !== region.name) {
          this.isHovering = true
          this.hoveredRegion = region
          this.isRotation = false
        }
        this.showTooltip(event, region)
      } else {
        this.clearHover()
      }
    } else {
      this.clearHover()
    }
  }

  handleMouseLeave() {
    this.clearHover()
  }

  clearHover() {
    if (this.isHovering) {
      this.isHovering = false
      this.hoveredRegion = null
      this.isRotation = this.options.earth.isRotation
      this.hideTooltip()
    }
  }

  showTooltip(event, region) {
    if (!this.tooltipElement) return

    const regionData = this.getRegionData(region)

    this.tooltipElement.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px; color: #0cd1eb; font-size: 16px; border-bottom: 1px solid rgba(12, 209, 235, 0.18); padding-bottom: 6px;">
        ${region.name}
      </div>
      ${regionData ? `<div style="margin-top: 8px; padding-top: 8px; color: #a0d8ef;">${regionData}</div>` : ''}
    `

    // 显示后使用实际尺寸计算定位，避免在高 DPI/缩放下裁切
    this.tooltipElement.style.display = 'block'
    // 强制浏览器回流以确保 getBoundingClientRect 返回正确值
    const rect = this.tooltipElement.getBoundingClientRect()
    const offsetX = 12
    const offsetY = 12

    // 计算在容器内的相对坐标
    // 如果挂载到了 .dashboard-outer，且该容器处于全屏状态或占据全屏，clientX/Y 即为相对值
    // 这里增加对容器 offset 的检查以适应各种嵌入布局
    const container = this.tooltipElement.parentElement || document.body
    const containerRect = container.getBoundingClientRect()
    
    let left = event.clientX - containerRect.left + offsetX
    let top = event.clientY - containerRect.top + offsetY
    
    const viewportWidth = containerRect.width
    const viewportHeight = containerRect.height

    // 如果超出容器右侧, 放到左侧
    if (left + rect.width > viewportWidth) {
      left = Math.max(8, event.clientX - containerRect.left - rect.width - offsetX)
    }
    // 如果超出容器底部, 放到上方
    if (top + rect.height > viewportHeight) {
      top = Math.max(8, event.clientY - containerRect.top - rect.height - offsetY)
    }

    this.tooltipElement.style.left = left + 'px'
    this.tooltipElement.style.top = top + 'px'
  }

  hideTooltip() {
    if (this.tooltipElement) {
      this.tooltipElement.style.display = 'none'
    }
  }

  formatNumber(value) {
    if (value === null || value === undefined || typeof value !== 'number' || Number.isNaN(value)) return '-'
    return value.toLocaleString('zh-CN')
  }

  getRegionPayload(region) {
    const { renderEmptyCountry = false } = this.options || {}
    if (!this.dataMap || !region || !region.name) return null

    // 通过 name (中文名) 匹配
    const payload = this.dataMap[region.name]

    if (!payload) return null

    // 如果 accounts 或 balance 有一个为空，根据开关决定是否返回
    const hasAccounts = payload.accounts !== null && payload.accounts !== undefined
    const hasBalance = payload.balance !== null && payload.balance !== undefined

    if ((!hasAccounts || !hasBalance) && !renderEmptyCountry) {
      return null
    }

    return payload
  }

  getRegionData(region) {
    const payload = this.getRegionPayload(region)
    if (!payload) return ''

    const accountCount = payload.accountCount ?? payload.accounts
    const accountBalance = payload.accountBalance ?? payload.balance

    const countText = this.formatNumber(accountCount)
    const balanceText = this.formatNumber(accountBalance)

    return `
      <div style="display: grid; grid-template-columns: 88px 1fr; gap: 6px 10px;">
        <div style="color: #a0d8ef;">账户数量</div>
        <div style="color: #fff; font-weight: 600; text-align: right;">${countText}</div>
        <div style="color: #a0d8ef;">账户余额</div>
        <div style="color: #fff; font-weight: 600; text-align: right;">${balanceText}万</div>
      </div>
    `
  }

  setCamera(camera) {
    this.camera = camera
  }

  render() {
    this.flyLineArcGroup && this.flyLineArcGroup.userData.flyLineArray &&
      this.flyLineArcGroup.userData.flyLineArray.forEach(fly => {
        fly.rotation.z += this.options.flyLine.speed
        if (fly.rotation.z >= fly.flyEndAngle) fly.rotation.z = 0
      })

    // 地球自转动画逻辑
    // 当 isRotation 为 true 时，每帧增加地球的Y轴旋转角度
    // rotateSpeed 控制旋转速度，正值顺时针，负值逆时针
    if (this.isRotation) {
      this.earthGroup.rotation.y += this.options.earth.rotateSpeed
    }

    this.circleLineList.forEach(e => {
      e.rotateY(this.options.satellite.rotateSpeed)
    })

    this.uniforms.time.value =
      this.uniforms.time.value < -this.timeValue
        ? this.timeValue
        : this.uniforms.time.value - 1

    if (this.waveMeshArr.length) {
      this.waveMeshArr.forEach(mesh => {
        mesh.userData.scale += 0.007
        mesh.scale.set(
          mesh.userData.size * mesh.userData.scale,
          mesh.userData.size * mesh.userData.scale,
          mesh.userData.size * mesh.userData.scale
        )
        if (mesh.userData.scale <= 1.5) {
          mesh.material.opacity = (mesh.userData.scale - 1) * 2
        } else if (mesh.userData.scale > 1.5 && mesh.userData.scale <= 2) {
          mesh.material.opacity = 1 - (mesh.userData.scale - 1.5) * 2
        } else {
          mesh.userData.scale = 1
        }
      })
    }
  }

  dispose() {
    if (this.tooltipElement && this.tooltipElement.parentNode) {
      this.tooltipElement.parentNode.removeChild(this.tooltipElement)
      this.tooltipElement = null
    }

    if (this.options.dom) {
      this.options.dom.style.background = '#010826'
    }

    // Recursively dispose all objects in the group
    if (this.group) {
      this.group.traverse(obj => {
        if (obj.geometry) {
          obj.geometry.dispose()
        }

        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => {
              if (m.map) m.map.dispose()
              m.dispose()
            })
          } else {
            if (obj.material.map) obj.material.map.dispose()
            obj.material.dispose()
          }
        }
      })
    }

    this.waveMeshArr = []
    this.circleList = []
    this.circleLineList = []

    if (this.group) {
      gsap.killTweensOf(this.group.scale)
    }
  }
}


