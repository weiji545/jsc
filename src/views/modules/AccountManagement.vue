<template>
  <DashboardContent :data-list="dataList">
    <template #left-top>
      <div class="module-content">模块二 - 左上内容</div>
    </template>
    <template #left-middle>
      <div class="module-content">模块二 - 左中内容</div>
    </template>
    <template #left-bottom>
      <div class="module-content">模块二 - 左下内容</div>
    </template>
    <template #center-top>
      <div class="module-content">模块二 - 核心区域内容</div>
    </template>
    <template #center-bottom>
      <div class="module-content">模块二 - 下层区域内容</div>
    </template>
    <template #right-top>
      <div class="module-content">模块二 - 右上内容</div>
    </template>
    <template #right-middle>
      <div class="module-content">模块二 - 右中内容</div>
    </template>
    <template #right-bottom>
      <div class="module-content">模块二 - 右下内容</div>
    </template>
  </DashboardContent>
</template>

<script>
import DashboardContent from '../components/layout/DashboardContent.vue'

export default {
  name: 'AccountManagement',
  components: {
    DashboardContent,
  },
  data() {
    return {
      // 模块二的数据展示列表
      dataList: [
        { label: '模块二', value: 1230000 },
        { label: '数据二', value: 4560000 },
        { label: '统计二', value: 789000 },
      ],
    }
  },
}
</script>

<style lang="scss" scoped>
.module-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
}
</style>

