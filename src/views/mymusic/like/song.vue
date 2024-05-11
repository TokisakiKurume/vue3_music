<script setup>
import PlayList from '@/components/PlayList.vue'
import { getUserLikeSong } from '@/api/user'
import { delUserLikeSongId } from '@/api/music'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { setupTabJump } from '@/utils/tabJump'

setupTabJump()

const router = useRouter()

const data = ref()
const getData = async () => {
  const res = await getUserLikeSong()
  data.value = res.data.data
}
getData()

// 删除我喜欢的歌曲
const deleteSongId = (ids) => {
  // 如果传入的是单个id 变成数组
  if (!Array.isArray(ids)) {
    ids = [ids]
  }
  delUserLikeSongId(ids).then(() => {
    getData()
  })
}

// 做到实时更新数据
const visibilityChangeHandler = () => {
  if (document.visibilityState === 'visible') {
    // 页面变为可见时的操作
    getData()
  }
}
onMounted(() => {
  // 监听页面切换事件
  document.addEventListener('visibilitychange', visibilityChangeHandler)
})
onBeforeUnmount(() => {
  // 防止内存泄漏
  document.removeEventListener('visibilitychange', visibilityChangeHandler)
})
</script>

<template>
  <div class="container" v-show="data?.length > 0">
    <PlayList
      :love="false"
      :img="false"
      :pagination="false"
      :tableData="data"
      @deleteSongId="deleteSongId"
    ></PlayList>
  </div>
  <el-empty
    description="暂无喜欢的歌曲哟！"
    :image-size="200"
    v-show="data?.length <= 0"
  >
    <el-button type="primary" @click="() => router.push('/music/charts')"
      >去添加</el-button
    >
  </el-empty>
</template>

<style scoped lang="scss"></style>
