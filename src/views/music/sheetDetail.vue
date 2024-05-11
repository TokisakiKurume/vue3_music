<script setup>
import PlayList from '@/components/PlayList.vue'
import { User } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import {
  getSheetInfo,
  getSheetSongs,
  userIsLikeSheet,
  deleteUserLikeSheet,
  addUserLikeSheet,
  deltetSheetSong
} from '@/api/sheet'
import { ref, reactive } from 'vue'
import { useUserStore } from '@/stores'
import { ElMessage } from 'element-plus'
import { setupTabJump } from '@/utils/tabJump'

setupTabJump()

const route = useRoute()
const userStore = useUserStore()
// 获取路由参数
const id = route.params.id

// 歌单信息
const sheetData = ref({
  sheet_name: '',
  sheet_picSrc: '',
  sheet_playCount: 0,
  sheet_playCollention: 0,
  labelsName: [],
  user: {
    user_name: '',
    user_nick: ''
  }
})
const getSheetData = async () => {
  const res = await getSheetInfo(id)
  sheetData.value = res.data.data
}
getSheetData()
// 歌单歌曲信息
const songData = ref()
const pagination = reactive({
  total: 0,
  pageNumber: 1,
  pageSize: 20
})
const getSongData = async () => {
  const res = await getSheetSongs({
    sheet_id: id,
    pageSize: pagination.pageSize,
    pageNumber: pagination.pageNumber
  })
  songData.value = res.data.data
  pagination.total = res.data.total
}
getSongData()
// 用户对歌单是否喜欢
const userLikeSheet = ref(false) // 五角星颜色变化
const isLike = async () => {
  const res = await userIsLikeSheet(id)
  userLikeSheet.value = res.data.result
}
if (userStore.token) isLike() // 需登录才能判定是否喜欢
const changeStar = async () => {
  if (!userStore.token) return ElMessage.warning('请登陆后重试')
  if (userLikeSheet.value) {
    userLikeSheet.value = false
    // 实时变化数量
    sheetData.value.sheet_playCollention =
      +sheetData.value.sheet_playCollention - 1
    await deleteUserLikeSheet(id)
  } else {
    userLikeSheet.value = true
    sheetData.value.sheet_playCollention =
      +sheetData.value.sheet_playCollention + 1
    await addUserLikeSheet(id)
  }
  isLike()
}

// 权限判定，该歌单是否为用户创建
const isCreator = ref()
const getCreator = () => {
  isCreator.value = userStore.createdPlaylist.some((item) => {
    return item.id === +id
  })
}
if (userStore.token) getCreator()
// 若是用户创建则可以进行歌曲删除操作 子组件回传删除的点击
const deleteSong = (songId) => {
  deltetSheetSong(id, songId).then(() => {
    ElMessage.success('删除成功')
    getSongData()
  })
}

// 子传父 歌单页数变化
const pageSizeChange = (number) => {
  pagination.pageNumber = number
  getSongData()
}
</script>

<template>
  <div class="container">
    <div class="top">
      <div class="img">
        <el-avatar
          :src="sheetData.sheet_picSrc"
          alt=""
          :size="200"
          shape="square"
        />
      </div>
      <div class="content" style="margin-left: 20px">
        <p class="title" style="font-size: 30px; color: black">
          {{ sheetData.sheet_name }}
        </p>
        <p class="creater">
          <el-icon style="vertical-align: middle">
            <User />
          </el-icon>
          {{ sheetData.user.user_nick || sheetData.user.user_name }}
        </p>
        <p class="lable">
          标签:
          <span v-for="(item, index) in sheetData.labelsName" :key="index"
            >&nbsp;{{ item }}&nbsp;</span
          >
        </p>
        <p>播放量：{{ sheetData.sheet_playCount }}</p>
        <p>收藏量：{{ sheetData.sheet_playCollention }}</p>
        <i
          class="iconfont icon-star"
          title="歌单收藏"
          @click="changeStar"
          v-show="!userLikeSheet"
        ></i>
        <i
          class="iconfont icon-star active"
          title="歌单已收藏"
          @click="changeStar"
          v-show="userLikeSheet"
        ></i>
        <!-- {{ isCreator }} -->
        <!-- {{ !isCreator }} -->
      </div>
    </div>
    <PlayList
      :delete="isCreator"
      :add="!isCreator"
      :paginationDataFromParent="pagination"
      :tableData="songData"
      @pageSizeChange="pageSizeChange"
      @deleteSongId="deleteSong"
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
      p {
        margin-bottom: 10px;
        color: gray;
      }
      .iconfont {
        color: gray;
        font-size: 28px;
        cursor: pointer;
        &.active {
          color: #ea9518;
        }
      }
    }
  }
}
</style>
