<script setup>
import { Edit, Delete } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  deleteSheetByUser,
  deleteUserLikeSheet,
  getSheetSongs
} from '@/api/sheet'
import { usePlayListStore } from '@/stores'
import { setupTabJump } from '@/utils/tabJump'

setupTabJump()
const playListStore = usePlayListStore()

const props = defineProps({
  // 图标显示
  edit: {
    type: Boolean,
    default: true
  },
  // 歌单数据显示
  sheet: {
    type: Object,
    default: () => ({
      // 使用函数作为默认值，确保每次返回一个新的对象
      sheet_id: '',
      sheet_name: '',
      sheet_picSrc: '',
      user: {
        user_name: '',
        user_nick: ''
      }
    })
  }
})

const emit = defineEmits(['reload'])

// 图标功能
const router = useRouter()
const playIcon = (e) => {
  e.stopPropagation()
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
const editIcon = (e) => {
  e.stopPropagation()
  router.push(`/mymusic/sheet_edit/${e.currentTarget.dataset.id}`)
}
const deleteIcon = (e) => {
  e.stopPropagation()
  const id = e.currentTarget.dataset.id
  const name = `<strong>${props.sheet.sheet_name}</strong>`
  ElMessageBox.confirm(`确定删除名为 ${name} 的歌单吗？`, '警告', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
    dangerouslyUseHTMLString: true // 允许消息中使用 HTML
  }).then(async () => {
    let res
    if (props.edit) {
      res = await deleteSheetByUser(id)
    } else {
      res = await deleteUserLikeSheet(id)
    }
    ElMessage({
      type: 'success',
      message: res.data.message
    })
    emit('reload')
  })
}
</script>

<template>
  <div class="content">
    <div class="img">
      <el-avatar :src="sheet.sheet_picSrc" shape="square" :size="225" alt="" />
      <div class="mask">
        <div
          class="center"
          @click="
            () => router.push(`/music/sheet/sheet_detail/${sheet.sheet_id}`)
          "
        >
          <i
            class="iconfont icon-play"
            style="font-size: 28px"
            title="播放"
            @click="playIcon"
            :data-id="sheet.sheet_id"
          ></i>
          <el-icon
            title="编辑"
            v-if="edit"
            @click="editIcon"
            :data-id="sheet.sheet_id"
          >
            <Edit />
          </el-icon>
          <el-icon title="删除" @click="deleteIcon" :data-id="sheet.sheet_id">
            <Delete />
          </el-icon>
        </div>
      </div>
    </div>
    <div class="sheet-title">{{ sheet.sheet_name }}</div>
    <div class="author">
      {{ sheet.user.user_nick || sheet.user.user_name || '暂无' }}
    </div>
  </div>
</template>

<style scoped lang="scss">
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
      background: rgba(0, 0, 0, 0.5) no-repeat center center;
      display: none;

      .center {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;

        i {
          color: white;
          font-size: 24px;
          margin-left: 10px;

          &:hover {
            color: #31c27c;
          }
        }
      }
    }

    &:hover .mask {
      display: block;
    }

    img {
      width: 225px;
      height: 225px;
      transition: all 0.4s;
    }

    &:hover img {
      transform: scale(1.05);
    }
  }

  .sheet-title {
    margin: 5px 0;

    &:hover {
      color: #31c27c;
      cursor: pointer;
    }
  }

  .author {
    color: gray;
    user-select: none;
  }
}
</style>
