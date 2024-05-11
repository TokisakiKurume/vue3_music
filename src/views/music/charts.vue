<script setup>
import { ref, nextTick, onBeforeUnmount, onMounted } from 'vue'
import '@/assets/iconfont/iconfont.css'
import PlayList from '@/components/PlayList.vue'
import {
  getChartsInfo,
  getChartNewSong,
  getChartHotSong,
  getChartChinese,
  getChartEnglish,
  getChartJapanese,
  getChartKorean
} from '@/api/charts'
import { usePlayListStore } from '@/stores'
import { setupTabJump } from '@/utils/tabJump'

setupTabJump()

// 选择栏样式渲染
const selectList = (e) => {
  const active = document.querySelector('.title-son.active')
  if (e.target.classList.contains('title-son')) {
    active.classList.remove('active')
    e.target.classList.add('active')
    showMainTitle()
  }
}
// 主题展示
const showMainTitle = () => {
  const active = document.querySelector('.title-son.active')
  const main_title = document.querySelector('.main .title')
  main_title.textContent = active.textContent
}
// 监控本地歌曲播放列表
const playListStore = usePlayListStore()
onMounted(() => {
  window.onfocus = function () {
    playListStore.setPlayList(
      JSON.parse(localStorage.getItem('vu3_music_playList')).playList
    )
  }
})
onBeforeUnmount(() => {
  // 移除 window.onfocus 事件监听器
  window.onfocus = null
})

// 排行榜类别数据
const data = ref([
  {
    chart_id: 0,
    chart_name: '',
    chartItem: [
      {
        chartItem_id: 0,
        chartItem_name: ''
      },
      {
        chartItem_id: 0,
        chartItem_name: ''
      }
    ]
  }
])
const getData = async () => {
  getChartsInfo().then((res) => {
    data.value = res.data.data
    // 保证主题的初始渲染
    nextTick(() => showMainTitle())
  })
}
getData()

const playList = ref([
  {
    song_id: 1,
    song_name: '',
    song_picSrc: '',
    song_originSrc: '',
    song_content: '',
    song_time: '',
    song_playCount: '',
    update_time: '',
    singer_name: ''
  }
])
// 新歌排行
const getNewSong = async () => {
  const res = await getChartNewSong()
  playList.value = res.data.data
}
getNewSong()
// 热歌排行
const getHotSong = async () => {
  const res = await getChartHotSong()
  playList.value = res.data.data
}
// 地区--华语
const getChineseSong = async () => {
  const res = await getChartChinese()
  playList.value = res.data.data
}
// 地区--欧美
const getEnglishSong = async () => {
  const res = await getChartEnglish()
  playList.value = res.data.data
}
// 地区--日本
const getJapaneseSong = async () => {
  const res = await getChartJapanese()
  playList.value = res.data.data
}
// 地区--韩国
const getKoreanSong = async () => {
  const res = await getChartKorean()
  playList.value = res.data.data
}

// 展示数据变化
const handleClick = (name) => {
  switch (name) {
    case '新歌':
      getNewSong()
      break
    case '热歌':
      getHotSong()
      break
    case '华语':
      getChineseSong()
      break
    case '欧美':
      getEnglishSong()
      break
    case '日本':
      getJapaneseSong()
      break
    case '韩国':
      getKoreanSong()
      break
    default:
      break
  }
}
</script>

<template>
  <div class="container">
    <div class="nav">
      <div
        v-for="(item, index) in data"
        :key="index"
        @click="selectList"
        style="margin-bottom: 30px"
      >
        <p class="title">{{ item.chart_name }}</p>
        <p
          :class="['title-son', { active: index_son === 0 && index === 0 }]"
          v-for="(item_son, index_son) in item.chartItem"
          :key="index_son"
          @click="handleClick(item_son.chartItem_name)"
        >
          {{ item_son.chartItem_name }}
        </p>
      </div>
    </div>
    <div class="main">
      <p class="title"></p>
      <PlayList :delete="false" :tableData="playList"></PlayList>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  width: 100%;
  margin: auto;
  padding-top: 50px;
  background-color: #fafafa;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: flex-start;

  .nav {
    border: 1px solid #e7e7e7;
    width: 15%;
    float: left;
    background-color: #fafafa;

    .title {
      margin: 15px 10px;
      padding-bottom: 15px;
      font-size: 20px;
      border-bottom: #e7e7e7 1px solid;
    }

    .title-son {
      padding: 10px;
      cursor: pointer;

      &:not(.active):hover {
        color: #31c27c;
      }
    }

    .active {
      background-color: #31c27c;
      color: white;
    }
  }

  .main {
    width: 65%;
    margin-left: 20px;
    float: right;
    background-color: #fafafa;

    .title {
      font-size: 24px;
      margin: 15px 10px;
      padding-bottom: 15px;
    }

    :deep(.container) {
      padding-top: 0;
    }
  }
}
</style>
