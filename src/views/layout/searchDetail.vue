<script setup>
import PlayLisy from '@/components/PlayList.vue'
import SearchBorder from './components/SearchBorder.vue'
import { useRoute } from 'vue-router'
import { watch, ref } from 'vue'
import { setupTabJump } from '@/utils/tabJump'

setupTabJump()

const route = useRoute()
const content = ref(route.params.string || '')
watch(
  () => route.params.string,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      content.value = newValue
    }
  }
)

const playList = ref() // 搜索组件传递数据 传入搜索组件
const paginationData = ref() // 分页数据 传入PlayList组件
// 搜索组件返回的数据
const handleDataFromChild = (dataValue) => {
  const { data: searchData, ...otherData } = dataValue
  playList.value = searchData
  paginationData.value = otherData
  console.log(paginationData.value)
}
// PlayList 返回的页数变化
const pageNumber = ref()
const pageSizeChange = (number) => {
  pageNumber.value = number
}
</script>

<template>
  <div class="top">
    <SearchBorder
      :content="content"
      @pass-data-to-parent="handleDataFromChild"
      :pageNumber="pageNumber"
    ></SearchBorder>
  </div>
  <div class="main" v-show="playList?.length > 0">
    <p
      style="
        width: 1200px;
        margin: 20px auto 0;
        font-size: 20px;
        font-weight: bolder;
      "
    >
      搜索结果
    </p>
    <PlayLisy
      :delete="false"
      :tableData="playList"
      :paginationDataFromParent="paginationData"
      @pageSizeChange="pageSizeChange"
    ></PlayLisy>
  </div>
  <el-empty
    description="查无数据"
    :image-size="250"
    v-show="playList?.length <= 0"
  />
</template>

<style scoped lang="scss">
.top {
  width: 100%;
  height: 30vh;
  background: url('@/assets/cont/newSong_bg.jpg');
  display: flex;
  justify-content: center;
  align-items: center;

  :deep(.el-input) {
    width: 600px;

    .el-input__wrapper {
      width: 100%;
      height: 40px;
    }
  }
}
</style>
