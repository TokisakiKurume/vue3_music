<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeIndex = ref(router.currentRoute.value.path)
</script>

<template>
  <el-menu
    :default-active="activeIndex"
    class="el-menu-demo"
    mode="horizontal"
    router
  >
    <el-menu-item index="/mymusic/like/song">歌曲</el-menu-item>
    <el-menu-item index="/mymusic/like/sheet">歌单</el-menu-item>
  </el-menu>
  <RouterView></RouterView>
</template>

<style lang="scss" scoped>
.el-menu-demo {
  --el-menu-active-color: rgb(49, 194, 124);
  --el-menu-hover-text-color: rgb(49, 194, 124);
  --el-menu-hover-bg-color: transparent;
  --el-menu-border-color: transparent;
  width: 1200px;
  height: 50px;
  border-bottom: none;
  align-items: center;
  margin: auto;
  user-select: none;
  background-color: transparent;

  .el-menu-item {
    color: black;
    border-bottom: none;
    margin: 0 5px;
    font-size: 16px;
  }
}
</style>
