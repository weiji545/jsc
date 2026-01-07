# 解决组件切换卡死问题 - 优化总结

## 问题描述
项目嵌入在其他项目中，通过选项卡切换时，再次进入首页会出现约 10 秒的浏览器卡死。

## 根本原因

### 1. **组件未完全销毁** (最严重)
- `CoreOverviewPanel.vue` 中使用 `v-if` 切换组件，但 Vue 可能会复用 DOM 节点
- 特别是 `Globe3D` (Three.js WebGL) 组件，如果销毁不及时，会导致：
  - WebGL 上下文泄漏（浏览器限制上下文数量）
  - 渲染循环（requestAnimationFrame）继续运行
  - 内存中残留大量 3D 对象（几何体、材质、纹理）

### 2. **全局 ID 冲突**
- `Globe3D` 组件使用 `id="loading"` 和 `id="earth-canvas"`
- 多次创建组件时会导致 ID 冲突，querySelector 获取到错误的 DOM

### 3. **异步操作未中断**
- 组件销毁后，异步的 `fetchData()` 和 `$nextTick()` 仍可能执行
- 导致尝试操作已销毁的 DOM 或初始化已销毁的实例

## 解决方案

### 1. 强制组件完全重建 (`CoreOverviewPanel.vue`)

**添加 `key` 属性：**
```vue
<transition name="fade" mode="out-in">
  <Globe3D v-if="scope === 'global'" key="globe-3d"/>
  <ChinaMap v-else-if="scope === 'domestic'" key="china-map"/>
  <WorldMap v-else-if="scope === 'overseas'" key="world-map"/>
</transition>
```

**作用：**
- `key` 确保每次切换时 Vue 完全销毁旧组件并创建新组件
- `mode="out-in"` 确保旧组件完全销毁后再渲染新组件
- `transition` 提供平滑的过渡效果，避免视觉闪烁

### 2. 消除 ID 冲突 (`Globe3D/index.vue`)

**修改前：**
```vue
<div id="loading" class="earth-loading">
<div id="earth-canvas" ref="earthCanvas">
```

**修改后：**
```vue
<div ref="loading" class="earth-loading">
<div ref="earthCanvas" class="earth-canvas">
```

**同步修改 `World.js`：**
```javascript
// 删除
const loading = document.querySelector('#loading')

// 改为在 Vue 组件中处理
this.$refs.loading.classList.add('out')
```

### 3. 防止异步操作在销毁后执行 (`Globe3D/index.vue`)

**添加销毁标志：**
```javascript
data() {
  return {
    isDestroyed: false,
  }
},

beforeDestroy() {
  this.isDestroyed = true
  if (this.world) {
    this.world.dispose()
    this.world = null
  }
},

async fetchData() {
  const res = await getOverviewData()
  if (this.isDestroyed) return  // 关键：检查是否已销毁
  // ...
},

initWorld() {
  this.$nextTick(() => {
    if (this.isDestroyed) return  // 关键：检查是否已销毁
    // ...
  })
}
```

### 4. 之前已完成的优化（回顾）

#### 4.1 移除 ECharts 实例的响应式绑定
- 从所有图表组件的 `data()` 中删除 `chart: null`
- 避免 Vue 对复杂 ECharts 对象进行深度响应式处理

#### 4.2 完善资源销毁
- **ECharts 组件**：确保 `chart.dispose()` + `chart = null`
- **Three.js 组件**：
  - 销毁渲染器：`renderer.dispose()`
  - 销毁控制器：`controls.dispose()`
  - 销毁几何体和材质：递归调用 `dispose()`
  - 停止 GSAP 动画：`gsap.killTweensOf()`
  - 移除 DOM 元素：`removeChild(renderer.domElement)`

#### 4.3 修复 ChinaMap ID 冲突
- 将 `document.getElementById('shadow-map')` 改为 `this.$refs.shadowMap`
- 将 `document.getElementById('main-map')` 改为 `this.$refs.mainMap`

## 优化效果

### 切换前（问题）
1. 切换到其他选项卡 → `Globe3D` 未完全销毁
2. WebGL 上下文、渲染循环、事件监听器继续占用资源
3. 切换回首页 → 创建新的 `Globe3D` 实例
4. 浏览器尝试初始化新的 WebGL 上下文 → **卡死 10 秒**（等待旧上下文释放 + GC）

### 切换后（优化）
1. 切换到其他选项卡 → `key` 变化 → Vue 立即调用 `beforeDestroy`
2. `isDestroyed = true` → 阻止所有异步操作
3. `world.dispose()` → 完全释放 WebGL 资源
4. 旧组件完全销毁（`mode="out-in"`）
5. 切换回首页 → 创建全新的 `Globe3D` 实例 → **流畅无卡顿**

## 测试建议

1. **快速切换测试**：在选项卡之间快速来回切换 10 次，观察是否卡顿
2. **内存监控**：打开 Chrome DevTools → Performance Monitor，观察：
   - JS Heap Size（应该在切换后下降）
   - DOM Nodes（应该保持稳定）
   - GPU Memory（应该在切换后释放）
3. **WebGL 上下文检查**：
   ```javascript
   // 在控制台运行
   console.log(document.querySelectorAll('canvas').length)
   ```
   切换后应该只有当前组件的 canvas，不应累积

## 关键代码位置

- `src/views/components/panels/CoreOverviewPanel.vue` - 添加 key 和 transition
- `src/views/components/visual/Globe3D/index.vue` - 移除 ID，添加销毁标志
- `src/views/components/visual/Globe3D/engine/world/World.js` - 移除 querySelector
- `src/views/components/visual/ChinaMap/index.vue` - 使用 ref 替代 ID
- 所有 EChart 组件 - 从 data() 中移除 chart 实例
