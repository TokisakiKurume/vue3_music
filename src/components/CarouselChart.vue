<script setup>
import { nextTick, ref, watch } from 'vue'
import { usePlayListStore } from '@/stores'
import { getSheetSongs } from '@/api/sheet'
import { useRouter } from 'vue-router'

const props = defineProps({
  type: {
    type: String,
    default: 'text'
  },
  dataList: Array
})

const playList = usePlayListStore()

const router = useRouter()
// 跳转到播放页面
const jumpToPlaylist = (songId, sheetId) => {
  if (songId) {
    playList.addDataToTop(songId)
    window.open('/song_detail', '/song_detail')
  } else if (sheetId) {
    getSheetSongs({
      sheet_id: sheetId,
      pageSize: 20,
      pageNumber: 1
    }).then((songs) => {
      const ids = songs.data.data.map((song) => song.song_id)
      playList.addDataToTop(ids)
      window.open('/song_detail', '/song_detail')
    })
  }
}
// 跳转到歌单详情页面
const jumpToSheetDetail = (e) => {
  e.stopPropagation()
  if (!e.target.dataset.sheet_id) return
  const sheetId = e.target.dataset.sheet_id
  router.push(`/music/sheet/sheet_detail/${sheetId}`)
}

const dataListLength = ref(0) // 用于存储 dataList 的长度
// 根据index分页展示
const dataListCeli = (index) => {
  if (dataListLength.value <= 4 && props.dataList) return props.dataList
  else if (props.dataList) {
    return props.dataList.slice(index * 4, (index + 1) * 4)
  }
}

watch(
  () => props.dataList,
  (newVal) => {
    if (Array.isArray(newVal)) {
      dataListLength.value = newVal.length // 更新 dataListLength 的值
    }
  }
)
nextTick(() => {})
</script>

<template>
  <div class="block" m="t-4">
    <el-carousel
      trigger="click"
      height="450px"
      :autoplay="type === 'text' ? false : true"
      :arrow="dataListLength > 4 ? 'hover' : 'never'"
      :indicator-position="dataListLength > 4 ? '' : 'none'"
    >
      <el-carousel-item v-for="(item, index) in dataListLength / 4" :key="item">
        <div
          v-for="(div, index_son) in dataListCeli(index)"
          :key="index_son"
          class="div_item"
          @click="jumpToPlaylist(div.song_id, div.sheet_id)"
        >
          <div class="img">
            <el-avatar
              :src="
                div.song_picSrc ||
                div.sheet_picSrc ||
                `https://picsum.photos/300?random=${div.song_id}`
              "
              alt=""
              :size="300"
              shape="square"
            />
            <div class="mask">
              <img src="@/assets/cont/icon_play.png" alt="" />
            </div>
          </div>
          <div class="text" v-if="type === 'text'">
            <p>{{ div.song_name }}</p>
            <span>{{ div.singer_name }}</span>
          </div>
          <div
            class="hotSong"
            v-if="type === 'hotSong'"
            @click="jumpToSheetDetail"
          >
            <p :data-sheet_id="div.sheet_id">{{ div.sheet_name }}</p>
            <span :data-sheet_id="div.sheet_id"
              >播放量： {{ div.sheet_playCount }}</span
            >
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<style lang="scss" scoped>
.block {
  .el-carousel__item {
    color: #475669;
    margin: 0;
    text-align: center;
    display: flex;
    justify-content: center;

    .div_item {
      position: relative;
      overflow: hidden;

      .img {
        height: 300px;
        width: 300px;
        transition: all 0.5s;
        cursor: pointer;

        .mask {
          height: 300px;
          width: 300px;
          background-color: rgba(5, 5, 5, 0.5);
          position: absolute;
          top: 0px;
          line-height: 300px;
          opacity: 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }

      &:hover .img {
        transition: all 0.5s;
        transform: scale(1.05);
      }

      &:hover .mask {
        transition: all 0.5s;
        opacity: 0.9;
      }

      &:hover .text span,
      &:hover .hotSong span {
        color: #c1e9d5;
      }

      span {
        color: #999;
      }

      .text {
        width: 300px;
        height: 100px;
        background-color: #050505;
        color: white;
        opacity: 0.7;
        display: flex;
        flex-direction: column;
        justify-content: center;
        cursor: pointer;
      }

      .hotSong {
        width: 300px;
        height: 150px;
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;

        p {
          color: white;
          cursor: pointer;
        }
        span {
          cursor: pointer;
        }
      }

      &:nth-child(2n-1) .hotSong {
        background-color: #333333;
      }

      &:nth-child(2n) .hotSong {
        background-color: #414141;
      }

      &:hover .text,
      &:hover .hotSong {
        background-color: #31c27c;
        opacity: 1;
      }
    }
  }

  :deep(.el-carousel__arrow) {
    width: 75px;
    height: 100px;
    border-radius: 0;
    background-color: black;
    opacity: 0.2;
    position: absolute;
    top: 175px;
    transition: width 0.3s;

    &:hover {
      background-color: #31c27c;
      width: 80px;
      opacity: 1;
    }

    .el-icon svg {
      width: 75px;
      height: 100px;

      & path {
        transform: scale(1.5);
      }
    }
  }
}
</style>
