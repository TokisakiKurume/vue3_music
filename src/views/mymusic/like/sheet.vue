<script setup>
import ShowSheet from '@/views/mymusic/components/SheetShow.vue'
import { getUserLikeSheet } from '@/api/sheet'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const data = ref()
const getData = async () => {
  const res = await getUserLikeSheet()
  data.value = res.data.data
}
getData()
// 监听子组件的删除事件重新获取数据
const reload = () => {
  getData()
}
</script>

<template>
  <div class="container" v-show="data">
    <ShowSheet
      v-for="(item, index) in data"
      :key="index"
      :edit="false"
      :sheet="item"
      @reload="reload"
    ></ShowSheet>
  </div>
  <el-empty description="暂无喜欢的歌单哟！" :image-size="200" v-show="!data">
    <el-button type="primary" @click="() => router.push('/music/sheet')"
      >去添加</el-button
    >
  </el-empty>
</template>

<style scoped lang="scss">
.container {
  width: 1200px;
  margin: auto;
  display: flex;
  flex-wrap: wrap;
}
</style>
