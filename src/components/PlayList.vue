<script setup>
import {
  ref,
  nextTick,
  watch,
  onMounted,
  onBeforeUnmount,
  onUnmounted,
  watchEffect
} from 'vue'
import '@/assets/iconfont/iconfont.css'
import { Plus, Delete } from '@element-plus/icons-vue'
import EventBus from '@/utils/EventBus'
import { usePlayListStore, useUserStore } from '@/stores'
import {
  addUserLikeSongId,
  delUserLikeSongId,
  addSongToSheet
} from '@/api/music'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

// 初始化仓库信息
const userStore = useUserStore()
const playListStore = usePlayListStore()
const likeSongsId = ref([])
const initLikeSong = async () => {
  if (userStore.token) await userStore.getLikeSongsId()
  likeSongsId.value = userStore.likeSongsId
}
const likeSheet = ref([])
const initCreateSheet = async () => {
  if (userStore.token) await userStore.getCreatedPlaylist()
  likeSheet.value = userStore.createdPlaylist
}
initLikeSong()
initCreateSheet()

const router = useRouter()

// 父传子 复用组件
const props = defineProps({
  // 显示
  play: {
    // play 图标
    type: Boolean,
    default: true
  },
  add: {
    // add 图标
    type: Boolean,
    default: true
  },
  love: {
    // love 图标
    type: Boolean,
    default: true
  },
  download: {
    // download 图标
    type: Boolean,
    default: true
  },
  delete: {
    // delete 图标
    type: Boolean,
    default: true
  },
  img: {
    // img 图片
    type: Boolean,
    default: true
  },
  pagination: {
    // pagination 分页组件
    type: Boolean,
    default: true
  },
  // 表格数据
  tableData: {
    type: Array,
    default: () => {
      return []
    }
  },
  // 分页数据
  paginationDataFromParent: {
    type: Object,
    default: () => {
      return {}
    }
  },
  // 页面可见性
  visible: {
    type: Boolean,
    default: false
  },
  state: {
    type: Boolean,
    default: false
  }, // 父组件数据变化
  waveAvi: {
    type: Boolean,
    default: false
  }, // 播放中动画
  showWaveAvi: {
    type: Number,
    default: 0
  },
  playState: {
    type: Boolean,
    default: false
  }
})
// 分页数据
const paginationData = ref({
  total: 20,
  pageNumber: 1,
  pageSize: 20
})

const tableData_demo = ref()
const waveRef = ref()

// 显示每列的小图标
const toggleShowIcon = (row) => {
  row.showIcon = !row.showIcon
}

// 小图标功能
const playIcon = (id) => {
  playListStore.addDataToTop(id)
  window.open('/song_detail', '/song_detail')
}
const loadIcon = (link) => {
  window.open(link)
}
const deleteLikesById = async (ids, e) => {
  e.stopPropagation()
  if (!Array.isArray(ids)) ids = [ids]
  likeSongsId.value = likeSongsId.value.filter((item) => !ids.includes(item))
  userStore.setLikeSongsId(likeSongsId.value)
  await delUserLikeSongId(ids)
}
const addLikesById = async (id, e) => {
  e.stopPropagation()
  if (userStore.token) {
    likeSongsId.value.push(id)
    userStore.setLikeSongsId(likeSongsId.value)
    const ids = [id]
    await addUserLikeSongId(ids)
  } else {
    ElMessage.warning('请登陆后重试')
  }
}
// 添加歌单
const addSongId = ref([]) // 点击加号时的歌曲Id
const sheetListRef = ref([{ id: 0, name: '请登陆后操作' }])
const sheetListShow = (ids, e) => {
  if (!Array.isArray(ids)) {
    addSongId.value = [ids]
  } else {
    addSongId.value = ids
  }

  const sheetList = sheetListRef.value
  const x = e.clientX
  const y = e.clientY
  sheetList.style.left = x + 'px'
  sheetList.style.top = y + 'px'
  sheetList.style.display = 'block'
  e.stopPropagation()
}
const handleDocumentClick = (event) => {
  const sheetList = sheetListRef.value
  if (!sheetList) return

  // 判断点击事件的目标是否是指定元素或其子元素
  if (!sheetList.contains(event.target)) {
    sheetList.style.display = 'none'
  }
}
onMounted(() => {
  // 在组件挂载时添加事件监听器
  document.addEventListener('click', handleDocumentClick)
})
onUnmounted(() => {
  // 在组件卸载时移除事件监听器
  document.removeEventListener('click', handleDocumentClick)
})
// 将歌加入喜欢
const addSheetSong = async (e) => {
  if (e.target.dataset.id === 0) {
    router.replace('/login')
    return
  }
  const songId = addSongId.value
  const sheetId = e.target.dataset.id
  await addSongToSheet(songId, sheetId).then(() => {
    ElMessage.success('添加成功')
    sheetListRef.value.style.display = 'none'
    tableRef.value.clearSelection()
  })
}
// 将歌加入播放列表
const addPlayList = () => {
  const select = tableData_demo.value.filter((item) => item.select)
  playListStore.addDataToTop(select.map((item) => item.song_id))
  window.open('/song_detail', '/song_detail')
  sheetListRef.value.style.display = 'none'
  tableRef.value.clearSelection()
}

// 表格每列的选中情况
const tableRef = ref()
const likeShow = ref(false) // 大图标喜欢展示
const handleSelectionChange = (val) => {
  val = val.map((item) => item.song_id)
  tableData_demo.value.forEach((item) => {
    item.select = val.includes(item.song_id)
  })
  // 判断图标的喜欢与否
  if (val.length > 0) {
    likeShow.value = val.every((item) => likeSongsId.value.includes(item))
  } else {
    likeShow.value = false
  }
}
const checkSongSelection = () => {
  const tableData = tableData_demo.value
  const select = tableData.filter((item) => item.select)
  if (select.length === 0) {
    ElMessage.warning('请选择歌曲后操作')
    return false
  }
  return select.map((item) => item.song_id)
}

// 子传父的函数
const emit = defineEmits(['pageSizeChange', 'changePlaySongId', 'deleteSongId'])
/* 大图标按钮功能 */
const playAllSong = () => {
  playListStore.addDataToTop(tableData_demo.value.map((item) => item.song_id))
  window.open('/song_detail', '/song_detail')
}
const addSong = (e) => {
  const res = checkSongSelection()
  if (!res) return
  sheetListShow(res, e)
}
const deleteSelectSong = () => {
  const res = checkSongSelection()
  if (!res) return
  emit('deleteSongId', res)
  // 清除总显示
  tableRef.value.clearSelection()
}
const addLikeWithSongs = async () => {
  const res = checkSongSelection()
  if (!res) return
  if (!userStore.token) return ElMessage.warning('请登陆后重试')
  if (likeShow.value) return ElMessage.warning('该歌曲已添加喜欢')
  const data = res.filter((id) => !likeSongsId.value.includes(id))
  await addUserLikeSongId(data).then(() => {
    likeSongsId.value = likeSongsId.value.concat(data)
    userStore.setLikeSongsId(likeSongsId.value)
    ElMessage.success('添加成功')
    tableRef.value.clearSelection()
  })
}

// 监听父组件传过来的值
watch(
  [() => props.tableData, () => props.paginationDataFromParent],
  (newValue, oldValue) => {
    if (newValue[0] !== oldValue[0]) tableData_demo.value = newValue[0]
    if (newValue[1] !== oldValue[1]) paginationData.value = newValue[1]
  }
)
// 监听页数变化给父组件回传
watch(
  () => paginationData.value.pageNumber,
  (newValue) => {
    emit('pageSizeChange', newValue)
    // 当用户换页，把之前的选项清除
    nextTick(() => {
      tableRef.value.clearSelection()
    })
  }
)
// 监听歌曲的选择情况进行播放 回传到歌曲播放列表
const changePlaySongId = (row) => {
  emit('changePlaySongId', row.song_id)
}
// 回传删除的歌曲ID
const deleteIcon = (id) => {
  emit('deleteSongId', id)
}

// 事件总线 来自 Layout的搜索组件
let searchCompletedHandler
onMounted(() => {
  // 监听搜索完成事件
  searchCompletedHandler = (dataValue) => {
    const { data: searchData, ...otherData } = dataValue
    tableData_demo.value = searchData
    paginationData.value = otherData
  }
  EventBus.$on('search-completed', searchCompletedHandler)
})
onBeforeUnmount(() => {
  // 防止内存泄漏
  EventBus.$off('search-completed', searchCompletedHandler)
})

// 页面可见性
watchEffect(() => {
  if (props.visible) {
    initLikeSong()
    initCreateSheet()
  }
  if (waveRef.value) {
    if (props.playState) {
      waveRef.value.style.display = 'flex'
    } else {
      waveRef.value.style.display = 'none'
    }
  }
})
// 当数据源变化重新初始化渲染数据
watch(
  () => props.state,
  () => {
    initLikeSong()
    initCreateSheet()
  }
)
</script>

<template>
  <div class="container">
    <div class="sheetList" ref="sheetListRef">
      <ul>
        <li @click="addPlayList"><i>播放列表</i></li>
        <li
          v-for="(item, index) in likeSheet"
          :key="index"
          :data-id="item.id"
          @click="addSheetSong"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
    <div class="operation">
      <div class="play" v-if="play" @click="playAllSong">
        <i class="iconfont icon-play"></i>播放全部
      </div>
      <div class="add" v-if="add" @click="addSong">
        <i class="iconfont icon-add"></i> 添加到
      </div>
      <div class="love" v-if="love" @click="addLikeWithSongs">
        <i
          class="iconfont icon-love1"
          style="font-size: 17.5px; color: red"
          v-show="likeShow"
        ></i>
        <i
          class="iconfont icon-love"
          style="font-size: 16px"
          v-show="!likeShow"
        ></i>
        我喜欢
      </div>
      <!-- 批量下载暂未解决（请求头？ 触发浏览器自动下载） -->
      <!-- <div class="download" v-if="download">
        <i class="iconfont icon-i-down"></i>下载
      </div> -->
      <div class="delete" v-if="props.delete" @click="deleteSelectSong">
        <el-icon class="iconfont">
          <Delete />
        </el-icon>
        删除
      </div>
      <!-- <div class="piliangcaozuo"><i class="iconfont icon-icon-piliangcaozuo"></i> 批量操作</div> -->
    </div>
    <div class="content">
      <el-table
        :data="tableData_demo"
        stripe
        style="width: 100%"
        @cell-mouse-enter="toggleShowIcon"
        @cell-mouse-leave="toggleShowIcon"
        @selection-change="handleSelectionChange"
        @row-click="changePlaySongId"
        ref="tableRef"
        row-key="song_id"
        empty-text="无歌曲数据"
      >
        <el-table-column
          type="selection"
          width="55"
          :reserve-selection="true"
          :selectable="(row) => !row.disabled"
        />
        <el-table-column type="index" width="50" />
        <el-table-column label="歌曲" width="370">
          <template #default="{ row }">
            <el-avatar
              :src="
                row.song_picSrc || `https://picsum.photos/200?${row.song_id}`
              "
              :size="50"
              style="float: left"
              v-if="img"
            />
            <p style="line-height: 50px">&nbsp;{{ row.song_name }}</p>
          </template>
        </el-table-column>
        <el-table-column width="80">
          <template #default="{ row }">
            <div
              class="music-waves"
              v-show="waveAvi"
              ref="waveRef"
              v-if="showWaveAvi === row.song_id"
            >
              <div class="wave"></div>
              <div class="wave"></div>
              <div class="wave"></div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="singer_name" label="歌手" width="150" />
        <el-table-column label="时长" width="200">
          <template #default="{ row }">
            <p style="line-height: 50px" v-show="!row.showIcon">
              {{ row.song_time }}
            </p>
            <div class="icon" v-show="row.showIcon">
              <i
                class="iconfont icon-play"
                style="font-size: 24px; margin-right: 8px"
                title="播放"
                v-if="play"
                :data-id="row.song_id"
                @click="playIcon(row.song_id)"
              ></i>
              <el-icon
                style="font-size: 20px; margin-right: 10px"
                title="添加到"
                v-if="add"
              >
                <span @click="sheetListShow(row.song_id, $event)"
                  ><Plus
                /></span>
              </el-icon>
              <i
                class="iconfont icon-love"
                style="font-size: 15px; vertical-align: top; margin-right: 8px"
                title="喜欢"
                v-if="love"
                v-show="!likeSongsId.includes(row.song_id)"
                @click="addLikesById(row.song_id, $event)"
              ></i>
              <i
                class="iconfont icon-love1"
                style="
                  font-size: 17px;
                  vertical-align: top;
                  margin-right: 8px;
                  color: red;
                "
                title="喜欢"
                v-if="love"
                v-show="likeSongsId.includes(row.song_id)"
                @click="deleteLikesById(row.song_id, $event)"
              ></i>
              <i
                class="iconfont icon-i-down"
                style="font-size: 20px"
                title="下载"
                @click="loadIcon(row.song_originSrc)"
                v-if="download"
              ></i>
              <el-icon
                @click="deleteIcon(row.song_id)"
                style="font-size: 20px; margin-left: 8px"
                v-if="props.delete"
                title="删除"
              >
                <Delete />
              </el-icon>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        layout="prev, pager, next"
        :hide-on-single-page="true"
        :total="paginationData.total"
        :pageSize="paginationData.pageSize"
        v-model:current-page="paginationData.pageNumber"
        style="margin: 20px auto"
        v-if="pagination"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  width: 910px;
  margin: auto;
  padding-top: 20px;
  background-color: #fafafa;
  overflow: hidden;
  display: flex;
  justify-content: center;
  flex-direction: column;

  .sheetList {
    display: none;
    width: 180px;
    max-height: 200px;
    background-color: #fcfcfc;
    box-shadow: 0 0 5px 5px rgba($color: #000000, $alpha: 0.2);
    position: absolute;
    z-index: 4;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 5px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: #b2b2b2;
    }
    ul {
      list-style: none;

      li {
        padding: 5px;
        cursor: pointer;
        &:hover {
          background-color: rgba($color: #ccc, $alpha: 0.5);
        }
      }
    }
  }

  .operation {
    cursor: pointer;
    display: flex;

    div {
      padding: 8px 15px;
      margin: 0 5px 0 8px;
      border-radius: 20px;

      .iconfont {
        font-size: 20px;
        vertical-align: bottom;
        color: gray;
      }

      &:not(.play) {
        border: 1px solid #c9c9c9;
      }

      &:not(.play):hover {
        background-color: #ededed;
      }
    }

    .play {
      background-color: #31c27c;
      color: white;

      .iconfont {
        color: white;
      }

      &:hover {
        background-color: #2caf6f;
      }
    }

    .add {
      .iconfont {
        font-size: 14px;
        vertical-align: middle;
      }
    }

    .download {
      .iconfont {
        font-size: 18px;
        vertical-align: middle;
      }
    }

    .piliangcaozuo {
      .iconfont {
        font-size: 14px;
        vertical-align: middle;
        margin-top: 5px;
      }
    }

    .delete {
      .iconfont {
        vertical-align: top;
      }
    }

    .content {
      --el-color-primary: #31c27c;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      user-select: none;
      padding-top: 200px;

      .icon {
        i:hover {
          color: #31c27c;
          cursor: pointer;
        }
      }
    }
  }

  .content {
    --el-color-primary: #31c27c;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    user-select: none;
    margin-top: 20px;

    .music-waves {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      width: 27px;
      height: 30px;
      overflow: hidden;

      .wave {
        --h: 20px;
        width: 8px;
        height: var(--h);
        transform: translateY(calc(var(--h) * 4 / 5));
        background-color: #31c27c;
        animation: waveAnimation 1.5s infinite 0s alternate;

        &:nth-child(2) {
          animation: waveAnimation 1s infinite 0.1s alternate;
        }
        &:nth-child(3) {
          animation: waveAnimation 1s infinite 0.2s alternate;
        }

        @keyframes waveAnimation {
          0% {
            transform: translateY(calc(var(--h) * 4 / 5));
          }
          25% {
            transform: translateY(calc(var(--h) * 1 / 5));
          }
          50% {
            transform: translateY(calc(var(--h) * 3 / 5));
          }
          75% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(calc(var(--h) * 4 / 5));
          }
        }
      }
    }

    .icon {
      i:hover {
        color: #31c27c;
        cursor: pointer;
      }
    }
  }
}
</style>
