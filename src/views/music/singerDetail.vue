<script setup>
import PlayList from '@/components/PlayList.vue'
import { useRoute } from 'vue-router'
import { getSingerInfo } from '@/api/singer'
import { ref, reactive } from 'vue'
import { setupTabJump } from '@/utils/tabJump'

setupTabJump()

const route = useRoute()

// 获取路由参数
const id = route.params.id

const data = ref() // 指定歌手歌曲信息
const singerInfo = reactive({ name: '', intro: '', picSrc: '', songTotal: 0 }) // 渲染数据
// 分页数据
const pagination = reactive({
  total: 20,
  pageNumber: 1,
  pageSize: 20
})
// 获取所需数据
const getData = async () => {
  const res = await getSingerInfo({
    id,
    pageNumber: pagination.pageNumber,
    pageSize: pagination.pageSize
  })
  const { data: currentData, ...otherData } = res.data.data
  data.value = currentData
  singerInfo.name = otherData.singer_name
  singerInfo.intro = otherData.singer_intro
  singerInfo.picSrc = otherData.singer_picSrc
  singerInfo.songTotal = otherData.total
  pagination.total = otherData.total
}
getData()

// PlayList 返回的页数变化
const pageSizeChange = (number) => {
  pagination.pageNumber = number
  getData()
}
</script>

<template>
  <div class="container">
    <div class="top">
      <div class="img">
        <img
          :src="singerInfo.picSrc || `https://picsum.photos/200?${id}`"
          alt=""
          width="200"
          height="200"
          style="border-radius: 50%; background-color: pink"
        />
      </div>
      <div class="content" style="margin-left: 20px">
        <p class="title" style="font-size: 30px; color: black">
          {{ singerInfo.name }}
        </p>
        <p class="creater">简介：{{ singerInfo.intro || '暂无' }}</p>
        <p class="lable" style="color: black; font-size: 20px">
          单曲&nbsp;
          <span>{{ singerInfo.songTotal }}</span>
        </p>
      </div>
    </div>
    <PlayList
      :delete="false"
      :tableData="data"
      :paginationDataFromParent="pagination"
      @pageSizeChange="pageSizeChange"
    ></PlayList>
  </div>
</template>

<style scoped lang="scss">
.container {
  .top {
    width: 900px;
    margin: auto;
    display: flex;

    .content {
      display: flex;
      flex-direction: column;
      justify-content: center;

      p {
        margin-bottom: 10px;
        color: gray;
      }
    }
  }
}
</style>
