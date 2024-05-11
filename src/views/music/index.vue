<script setup>
import CarouselChart from '../../components/CarouselChart.vue'
import { ref, watch } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import { RouterLink, useRouter } from 'vue-router'
import { musicGetIndex } from '@/api/music'
import { useUserStore, usePlayListStore } from '@/stores'
import { getVerifyToken } from '@/api/user'
import {
  getChartHotSong,
  getChartChinese,
  getChartEnglish,
  getChartKorean,
  getChartsInfo,
  getChartNewSong
} from '@/api/charts'
import { getAllSheet } from '@/api/sheet'
import { setupTabJump } from '@/utils/tabJump'

setupTabJump()

const activeName = ref('first')

const handleClick = (tab, event) => {
  console.log(tab, event)
}

// 渲染数据
const data = ref()
const All = ref() // 新歌首发-全部
const Chinese = ref() // 新歌首发-华语
const Western = ref() // 新歌首发-欧美
const Korea = ref() // 新歌首发-韩国
const recommend = ref() // 精彩推荐
const ranking = ref([
  {
    chart_name: '',
    chartItem_name: '',
    songs: [
      {
        song_id: 1,
        song_name: '',
        singer_name: ''
      }
    ]
  }
]) // 排行榜
const hotSheetList = ref([
  {
    sheet_id: 1,
    sheet_name: '',
    sheet_picSrc: '',
    sheet_playCount: 0,
    sheet_playCollention: 0,
    labelsId: []
  }
]) // 热门歌单

const getDate = async () => {
  const res = await musicGetIndex()
  data.value = res.data
}
getDate()
// 新歌首发数据获取
{
  const getAll = async () => {
    const res = await getChartHotSong()
    All.value = res.data.data.slice(0, 4)
  }
  const getChinese = async () => {
    const res = await getChartChinese()
    Chinese.value = res.data.data.slice(0, 4)
  }
  const getWestern = async () => {
    const res = await getChartEnglish()
    Western.value = res.data.data.slice(0, 4)
  }
  const getKorea = async () => {
    const res = await getChartKorean()
    Korea.value = res.data.data.slice(0, 4)
  }
  getAll()
  getChinese()
  getWestern()
  getKorea()
}

// 排行榜数据获取
{
  const getList = async () => {
    const res = await getChartsInfo()
    const chartInfo = res.data.data
    let flag = 0
    while (ranking.value.length < 5) {
      for (const chart of chartInfo) {
        const chartItem = chart.chartItem[flag]
        if (chartItem) {
          ranking.value.push({
            chart_name: chart.chart_name,
            chartItem_name: chartItem.chartItem_name
          })
        }
      }
      flag += 1
    }
    ranking.value = ranking.value.slice(1, 5)
  }
  getList()
  const fetchData = async (fetchFunction, chartItemName) => {
    let res = await fetchFunction()
    res = res.data.data.slice(0, 4)
    ranking.value.forEach((chart) => {
      if (chart.chartItem_name === chartItemName) {
        chart.songs = res.map((song) => ({
          song_id: song.song_id,
          song_name: song.song_name,
          singer_name: song.singer_name
        }))
      }
    })
  }

  const getNewSong = () => fetchData(getChartNewSong, '新歌')
  const getChineseSong = () => fetchData(getChartChinese, '华语')
  const getHotSong = () => fetchData(getChartHotSong, '热歌')
  const getKoreanSong = () => fetchData(getChartKorean, '韩国')

  getNewSong()
  getChineseSong()
  getHotSong()
  getKoreanSong()
}
// 排行榜播放音乐
const playListStore = usePlayListStore()
const playChartAll = (songs) => {
  const ids = songs.map((song) => song.song_id)
  playListStore.addDataToTop(ids)
  window.open('/song_detail', '/song_detail')
}
const playChartSingle = (e) => {
  const id = e.target.dataset.id
  if (id) {
    playListStore.addDataToTop([+id])
    window.open('/song_detail', '/song_detail')
  }
}

// 热门歌单数据获取
const router = useRouter()
{
  const getHotSheet = async () => {
    const res = await getAllSheet()
    const list = res.data.data
    hotSheetList.value = list
      .sort((a, b) => b.sheet_playCount - a.sheet_playCount)
      .slice(0, 8)
  }
  getHotSheet()
}
const recommendSheet = (e) => {
  const sheetId = e.target.dataset.id
  router.push(`/music/sheet/sheet_detail/${sheetId}`)
}

watch(
  () => data.value,
  (newValue) => {
    recommend.value = newValue.recommendIndex
  }
)

const userStore = useUserStore()
watch(
  () => userStore.user,
  () => {
    if (!userStore.user) {
      setTimeout(() => {
        window.location.reload()
      }, 500)
    }
  }
)
// 判断 token 是否过期
const isToken = async () => {
  if (userStore.token) {
    const res = await getVerifyToken()
    if (res.data.data) {
      userStore.setToken(res.data.data)
    }
  }
}
isToken()
</script>

<template>
  <div class="container">
    <!-- 新歌首发 -->
    <div class="newSong">
      <h1>新歌首发</h1>
      <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane label="全部" name="first">
          <CarouselChart :dataList="All"></CarouselChart>
        </el-tab-pane>
        <el-tab-pane label="华语" name="second">
          <CarouselChart :dataList="Chinese"></CarouselChart>
        </el-tab-pane>
        <el-tab-pane label="欧美" name="third">
          <CarouselChart :dataList="Western"></CarouselChart>
        </el-tab-pane>
        <el-tab-pane label="韩国" name="fourth">
          <CarouselChart :dataList="Korea"></CarouselChart>
        </el-tab-pane>
      </el-tabs>
      <RouterLink to="/music/charts" class="all"
        >全部<el-icon class="icon"> <ArrowRight /> </el-icon
      ></RouterLink>
    </div>
    <!-- 精彩推荐 -->
    <div class="recommend">
      <h1>精彩推荐</h1>
      <el-carousel type="card" height="280px" trigger="click" :autoplay="false">
        <el-carousel-item v-for="(item, index) in recommend" :key="index">
          <img
            :src="item.pictureSrc"
            alt=""
            :data-id="item.sheet_id"
            @click="recommendSheet"
          />
        </el-carousel-item>
      </el-carousel>
    </div>
    <!-- 排行榜 -->
    <div class="ranking">
      <h1>排行榜</h1>
      <RouterLink to="/music/charts" class="all"
        >全部<el-icon class="icon"> <ArrowRight /> </el-icon
      ></RouterLink>
      <div class="main">
        <div class="item" v-for="(item, index) in ranking" :key="index">
          <div class="mask"></div>
          <div class="play" @click="playChartAll(item.songs)"></div>
          <div class="content-top">
            {{ item.chart_name }}
            <h2>{{ item.chartItem_name }}</h2>
          </div>
          <div class="content-bottom" @click="playChartSingle">
            <div v-for="(item_son, index_son) in item.songs" :key="index_son">
              <p class="song" :data-id="item_son.song_id">
                {{ index_son + 1 }}&nbsp;&nbsp;{{ item_son.song_name }}
              </p>
              <br />
              <p class="author" :data-id="item_son.song_id">
                {{ item_son.singer_name }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 热门歌单 -->
    <div class="hotSong">
      <h1>热门歌单</h1>
      <CarouselChart type="hotSong" :dataList="hotSheetList"></CarouselChart>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  width: 99.2vw;

  & > div {
    width: 100%;
  }

  h1 {
    font-weight: lighter;
    color: white;
    font-size: 3em;
    margin: 50px 30px;
    text-align: center;
  }

  .newSong {
    --el-color-primary: white;
    --el-text-color-primary: gray;
    --el-border-color-light: transparent;
    --el-font-size-base: 16px;
    height: 685px;
    background: url('@/assets/cont/newSong_bg.jpg') center;
    overflow: auto;
    position: relative;

    :deep(.el-tabs__nav-scroll) {
      display: flex;
      justify-content: center;

      .el-tabs__active-bar {
        background-color: transparent;
      }
    }

    .all {
      color: white;
      cursor: pointer;
      position: absolute;
      top: 173px;
      right: 170px;
      text-decoration: none;

      &:hover {
        color: rgb(49, 194, 124);
      }

      .icon {
        vertical-align: -15%;
      }
    }
  }

  .recommend {
    height: 500px;

    h1 {
      color: black;
    }

    :deep(.el-carousel__indicators) {
      display: none;
    }

    .el-carousel__item--card {
      width: 40%;
    }

    .is-in-stage {
      margin-left: 5%;
    }

    .el-carousel__item img {
      width: 100%;
      height: 100%;
    }
  }

  .ranking {
    height: 100vh;
    background-image: url('@/assets/cont/rank_bg.jpg');
    background-size: 100% 100%;
    display: flex;
    flex-direction: column;
    position: relative;

    .all {
      color: white;
      cursor: pointer;
      position: absolute;
      top: 154px;
      right: 170px;
      z-index: 3001;
      text-decoration: none;

      &:hover {
        color: rgb(49, 194, 124);
      }

      .icon {
        vertical-align: -15%;
      }
    }

    .main {
      height: 80%;
      display: flex;
      justify-content: center;

      .item {
        width: 19.5%;
        height: 85%;
        margin-top: 30px;
        background-image: url('@/assets/cont/rank_list_bg.jpg');
        background-size: 400% 100%;
        color: rgb(232, 230, 230);
        position: relative;
        transition: all 0.4s;

        .mask {
          width: 100%;
          height: 100%;
          background-color: black;
          opacity: 0;
          position: absolute;
          transition: all 0.4s;
        }

        .play {
          position: absolute;
          width: 24%;
          height: 14%;
          margin: 130px 38%;
          opacity: 0;
          background-image: url('@/assets/cont/icon_play.png');
          background-position: center;
          background-size: cover;
          transition: all 0.4s;
        }

        &:hover .mask {
          opacity: 0.3;
        }

        &:hover .play {
          opacity: 1;
        }

        &:hover {
          background-size: 412% 103%;
        }

        .content-top {
          text-align: center;
          transform: scale(1.2);
          font-weight: lighter;
          margin-top: 40px;

          h2 {
            font-weight: 549;
            font-size: 26px;
          }
        }

        .content-bottom {
          position: relative;
          z-index: 1;
          margin: 50% 50px;
          color: #ffffff;

          .song {
            cursor: pointer;
            display: inline-block;
          }

          .author {
            display: inline-block;
            cursor: pointer;
            margin: 0 0 15px 20px;
            color: rgb(181, 180, 180);
          }
        }

        @for $i from 1 through 4 {
          &:nth-child(#{$i}) {
            background-position: 33.3% * $i;
          }
        }
      }
    }
  }

  .hotSong {
    height: 100vh;
    display: flex;
    flex-direction: column;

    h1 {
      color: black;
    }

    :deep(.el-carousel__indicators) {
      .is-active {
        .el-carousel__button {
          background-color: white;
        }
      }

      .el-carousel__button {
        background-color: gray;
      }
    }
  }
}
</style>
