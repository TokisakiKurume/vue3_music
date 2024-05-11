<script setup>
import { ref, watch } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useUserStore } from '@/stores'

const router = useRouter()
const routerStr = router.currentRoute.value.path.split('/')
const activeIndex = ref('/mymusic/' + routerStr[2])

const userStore = useUserStore()
watch(
  () => userStore.state,
  async () => {
    userStore.user.user_picSrc += `?random=${Math.random()}`
  }
)
</script>

<template>
  <div class="container">
    <div class="main">
      <el-avatar :size="120" :src="userStore.user.user_picSrc" />
      <p class="username">
        {{ userStore.user.user_nick || userStore.user.user_name }}
      </p>
    </div>
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      router
    >
      <el-menu-item index="/mymusic/like">我喜欢</el-menu-item>
      <el-menu-item index="/mymusic/create">我创建的歌单</el-menu-item>
    </el-menu>
  </div>
  <RouterView></RouterView>
</template>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 40vh;
  background: url('@/assets/cont/rank_bg.jpg') no-repeat;

  .main {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    height: 80%;

    .username {
      color: white;
      margin-top: 20px;
      font-size: 20px;
    }
  }

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
      color: white;
      border-bottom: none;
      margin: 0 5px;
      font-size: 16px;
    }
  }
}
</style>
