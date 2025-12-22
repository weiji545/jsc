<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
// 全局样式重置
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #0a1929;
}

#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* 隐藏全局滚动条，防止下拉弹层时抖动 */
::-webkit-scrollbar {
  width: 0;
  height: 0;
}

/* 下拉弹层不影响主体布局 */
:global(.el-select-dropdown),
:global(.el-popper) {
  margin: 0;
}
</style>
