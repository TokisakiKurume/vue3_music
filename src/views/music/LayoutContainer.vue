<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const activeIndex = ref(router.currentRoute.value.path)

watch(
  () => route.fullPath,
  (newValue) => {
    activeIndex.value = newValue
  }
)
</script>

<template>
  <el-menu
    :default-active="activeIndex"
    class="el-menu-demo"
    mode="horizontal"
    router
  >
    <el-menu-item index="/music/index">首页</el-menu-item>
    <el-menu-item index="/music/singer">歌手</el-menu-item>
    <!-- <el-menu-item index="/music/album">专辑</el-menu-item> -->
    <el-menu-item index="/music/charts">排行榜</el-menu-item>
    <el-menu-item index="/music/sheet">歌单</el-menu-item>
  </el-menu>
  <RouterView></RouterView>
</template>

<style lang="scss" scoped>
.el-menu-demo {
  --el-menu-active-color: rgb(49, 194, 124);
  --el-menu-hover-text-color: rgb(49, 194, 124);
  --el-menu-hover-bg-color: transparent;
  width: 1523.7px;
  height: 50px;
  border-bottom: none;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  user-select: none;

  .el-menu-item {
    border-bottom: none;
    margin: 0 5px;
    font-size: 16px;
  }
}
</style>
