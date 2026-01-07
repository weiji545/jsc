# 修复图表尺寸异常问题

## 问题描述
页面刷新后，左下和右下的饼图（环形图）以及下方的柱状折线图出现宽高异常。

## 根本原因

### 1. DOM 渲染时序问题
当我们从 `data()` 中移除 `chart` 实例后，虽然解决了响应式性能问题，但引入了新的时序问题：
- `mounted()` 钩子执行时，DOM 可能还没有完全渲染完成
- 此时调用 `echarts.init()` 会获取到容器尺寸为 0
- 导致图表以 0x0 的尺寸初始化，后续即使容器尺寸正常也无法自动调整

### 2. 容器尺寸未明确
部分父容器（如 `.pie-wrapper` 和 `.donut-wrapper`）只设置了 `height: 100%`，缺少 `width: 100%`，在某些布局情况下可能导致宽度计算异常。

## 解决方案

### 1. 使用 `$nextTick` 延迟初始化

**所有图表组件的 `mounted()` 改为：**
```javascript
mounted() {
  this.$nextTick(() => {
    this.initChart()
  })
  window.addEventListener('resize', this.resizeHandler)
}
```

**作用：**
- `$nextTick` 确保在 DOM 更新完成后再初始化图表
- 此时容器已经有了正确的尺寸

**影响的组件：**
- `EChartPieRing.vue`
- `EChartBarLine.vue`
- `EChartRingBar.vue`
- `EChartSparkline.vue`
- `EchartGauge.vue`

### 2. 添加容器尺寸验证和重试机制

**在 `initChart()` 中添加检查：**
```javascript
initChart() {
  try {
    const container = this.$refs.chartRoot
    if (!container) {
      console.warn('chartRoot ref not found')
      return
    }
    
    // 确保容器有有效尺寸
    const width = container.offsetWidth
    const height = container.offsetHeight
    if (width === 0 || height === 0) {
      console.warn('container has zero dimensions, retrying...')
      setTimeout(() => this.initChart(), 100)
      return
    }
    
    this.chart = echarts.init(container)
    this.updateChart()
  } catch (e) {
    console.warn('init failed', e)
  }
}
```

**作用：**
- 检测容器尺寸是否有效
- 如果尺寸为 0，延迟 100ms 后重试
- 避免以错误尺寸初始化图表

**影响的组件：**
- `EChartPieRing.vue`
- `EChartBarLine.vue`

### 3. 修复父容器 CSS

**`OverView.vue` 中：**
```scss
.pie-wrapper, .donut-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;  // 新增
  height: 100%;
}
```

**作用：**
- 确保容器宽度明确为 100%
- 避免 flex 布局下的宽度计算异常

### 4. 在缩放更新后触发 resize 事件

**`src/views/index.vue` 的 `updateScale()` 中：**
```javascript
updateScale() {
  // ... 缩放计算逻辑
  this.$nextTick(() => {
    this.$emit('scale-changed')
    // 触发 resize 事件，确保所有图表正确调整尺寸
    window.dispatchEvent(new Event('resize'))
  })
}
```

**作用：**
- 在页面缩放更新后，主动触发 `resize` 事件
- 所有图表的 `resizeHandler` 会被调用
- 确保图表尺寸与容器同步

## 初始化流程（修复后）

```
页面加载
  ↓
mounted() 钩子触发
  ↓
$nextTick() - 等待 DOM 渲染完成
  ↓
initChart() - 检查容器尺寸
  ↓
尺寸有效？
  ├─ 是 → echarts.init() → 正常初始化
  └─ 否 → setTimeout 100ms → 重试 initChart()
  ↓
updateScale() 触发
  ↓
dispatchEvent('resize')
  ↓
所有图表 resize() → 尺寸同步
```

## 测试方法

### 1. 刷新测试
- 硬刷新页面（Ctrl+Shift+R）
- 检查所有图表是否正常显示
- 打开控制台，不应看到 "zero dimensions" 警告

### 2. 尺寸检查
在控制台运行：
```javascript
// 检查所有图表容器尺寸
document.querySelectorAll('[ref="chartRoot"]').forEach(el => {
  console.log(el.offsetWidth, el.offsetHeight)
})
// 所有值应该 > 0
```

### 3. 窗口缩放测试
- 调整浏览器窗口大小
- 所有图表应该平滑调整尺寸
- 不应出现变形或空白

## 关键改动文件

- `src/views/components/charts/EChartPieRing.vue` - $nextTick + 尺寸验证
- `src/views/components/charts/EChartBarLine.vue` - $nextTick + 尺寸验证
- `src/views/components/charts/EChartRingBar.vue` - $nextTick
- `src/views/components/charts/EChartSparkline.vue` - $nextTick
- `src/views/components/charts/EchartGauge.vue` - $nextTick
- `src/views/modules/OverView.vue` - 容器 width: 100%
- `src/views/index.vue` - 触发 resize 事件

## 注意事项

1. **不要在 `data()` 中声明 `chart` 实例** - 这会导致性能问题
2. **始终使用 `$nextTick` 初始化图表** - 确保 DOM 已渲染
3. **在 `beforeDestroy` 中调用 `dispose()`** - 防止内存泄漏
4. **监听 `resize` 事件** - 确保图表响应窗口变化
