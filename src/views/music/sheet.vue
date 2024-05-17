<script setup>
import { ArrowDownBold, ArrowUpBold } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  musicGetLabels,
  getAllSheet,
  updatePlayCount,
  getSheetSongs
} from '@/api/sheet'
import { setupTabJump } from '@/utils/tabJump'
import { usePlayListStore } from '@/stores'

setupTabJump()

const show = ref(false) // 歌单标题显示
// 显示切换
const toggleShow = () => {
  show.value = !show.value
}
const sheetFilter = ref([]) // 过滤的歌单
// 歌单选择
const selectSheet = (e) => {
  const active = document.querySelector('.container > .show span.active')
  const p = document.querySelector('.container > .title > p')
  if (e.target instanceof HTMLSpanElement) {
    active.classList.remove('active')
    e.target.classList.add('active')
    p.textContent = e.target.textContent
    toggleShow()
    // 根据 id 过滤歌单
    const labelId = e.target.dataset.id
    if (labelId === '精选歌单') {
      sheetFilter.value = sheetData.value
    } else {
      sheetFilter.value = sheetData.value.filter((item) =>
        item.labelsId.includes(Number(labelId))
      )
    }
  }
}

// 路径跳转
const router = useRouter()
const playListStore = usePlayListStore()
const jumpSongDetail = async (e) => {
  // 阻止冒泡
  e.stopPropagation()
  const sheet_id = e.target.dataset.id
  const playCountItem = sheetData.value.find((item) => {
    if (item.sheet_id === +sheet_id)
      item.sheet_playCount = +item.sheet_playCount + 1
    return item.sheet_id === +sheet_id
  })
  const playCount = +playCountItem.sheet_playCount + 1
  await updatePlayCount({ sheet_id, playCount })
  // 跳转到音乐播放页面并加入该歌单的第一页 歌曲
  getSheetSongs({
    sheet_id: e.target.dataset.id,
    pageSize: 20,
    pageNumber: 1
  }).then((songs) => {
    let songsId = []
    if (songs.data.data) songsId = songs.data.data.map((song) => song.song_id)
    playListStore.addDataToTop(songsId)
    window.open('/song_detail', '/song_detail')
  })
}
const jumpSheetDetail = (e) => {
  router.push(`/music/sheet/sheet_detail/${e.target.dataset.id}`)
}

// 歌单分类标签
const labelsData = ref({ title: '', son_title: ['son_title1', 'son_title2'] })
const getLabelData = async () => {
  const res = await musicGetLabels()
  const sortedLabelsData = res.data.data.sort((a, b) => {
    return a.id - b.id // 根据 id 进行升序排序
  })
  labelsData.value = sortedLabelsData
}
getLabelData()

// 所有歌单信息
const sheetData = ref({
  sheet_name: '',
  sheet_picSrc: '',
  sheet_playCount: 0,
  sheet_playCollention: 0,
  labelsId: []
})
const getSheetData = async () => {
  const res = await getAllSheet()
  sheetData.value = res.data.data
  sheetFilter.value = sheetData.value
}
getSheetData()
</script>

<template>
  <div class="container">
    <!-- 标题 -->
    <div class="title" @click="toggleShow">
      <p>精选歌单</p>
      <el-icon v-show="!show">
        <ArrowDownBold />
      </el-icon>
      <el-icon v-show="show">
        <ArrowUpBold />
      </el-icon>
    </div>
    <!-- 歌单标签列表 -->
    <div class="show" v-show="show" @click="selectSheet">
      <div class="title">默认</div>
      <span class="title-son active" data-id="精选歌单">精选歌单</span>
      <div v-for="(item, index) in labelsData" :key="index">
        <div class="title">{{ item.title }}</div>
        <span
          class="title-son"
          v-for="item_son in item.son_title"
          :key="item_son.labelItem_id"
          :data-id="item_son.labelItem_id"
          >{{ item_son.labelItem_name }}</span
        >
      </div>
    </div>
    <!-- 内容展示 -->
    <div class="main" v-show="sheetFilter.length !== 0">
      <div class="pack">
        <div class="content" v-for="(item, index) in sheetFilter" :key="index">
          <div class="img">
            <el-avatar
              :src="item.sheet_picSrc"
              alt=""
              class="img1"
              shape="square"
            />
            <div class="mask" :data-id="item.sheet_id" @click="jumpSheetDetail">
              <img
                src="@/assets/cont/icon_play.png"
                alt=""
                :data-id="item.sheet_id"
                @click="jumpSongDetail"
              />
            </div>
          </div>
          <div
            class="sheet-title"
            @click="jumpSheetDetail"
            :data-id="item.sheet_id"
          >
            {{ item.sheet_name }}
          </div>
          <div class="play">播放量：{{ item.sheet_playCount }}</div>
        </div>
      </div>
      <!-- <el-pagination background layout="prev, pager, next" :total="1000" /> -->
    </div>
    <el-empty
      v-show="sheetFilter.length === 0"
      description="暂无该分类数据哦~"
      :image-size="250"
    />
  </div>
</template>

<style lang="scss" scoped>
.container {
  width: 1200px;
  margin: 10px auto 0;
  position: relative;

  .title {
    width: 150px;
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-bottom: 30px;

    p {
      user-select: none;
      margin-right: 8px;
      font-weight: bolder;
      font-size: 1.5em;
    }
  }

  .show {
    width: 70%;
    height: 513.79px;
    padding: 0 15px 0;
    overflow: auto;
    position: absolute;
    background-color: white;
    z-index: 2;

    .title {
      font-weight: bolder;
      cursor: default;
      margin: 15px 0 10px;
      user-select: none;
    }

    .title-son {
      user-select: none;
      display: inline-block;
      cursor: pointer;
      padding: 2px 10px;
      border-radius: 16px;
      background-color: #f7f7f7;
      margin: 0 20px 15px 0;

      &:hover {
        color: white;
        background-color: rgb(49, 194, 124);
      }
    }

    .active {
      background-color: rgb(49, 194, 124);
      color: white;
      font-weight: 400;
    }

    &::-webkit-scrollbar {
      width: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: #9c9c9c;
    }
  }

  .main {
    --el-color-primary: #31c27c;

    .pack {
      display: flex;
      flex-wrap: wrap;

      .content {
        position: relative;
        --n: 5;
        --space: calc(100% - var(--n) * 225px);
        --h: calc(var(--space) / var(--n) / 2);
        margin: 0px var(--h) 20px;

        .img {
          overflow: hidden;
          width: 225px;
          height: 225px;
          position: relative;

          .mask {
            position: absolute;
            cursor: pointer;
            top: 0;
            width: 225px;
            height: 225px;
            background: rgba(0, 0, 0, 0.3);
            display: none;

            img {
              width: 70px;
              height: 70px;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
          }

          &:hover .mask {
            display: block;
          }

          .img1 {
            width: 225px;
            height: 225px;
            transition: all 0.4s;
          }

          &:hover .img1 {
            transform: scale(1.05);
          }
        }

        .sheet-title {
          margin: 5px 0;

          &:hover {
            font-weight: bolder;
            cursor: pointer;
          }
        }

        .play {
          color: gray;
        }
      }
    }

    .el-pagination {
      margin: 10px 0 50px;
    }
  }
}
</style>
