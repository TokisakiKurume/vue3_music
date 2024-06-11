<script setup>
import PlayList from '@/components/PlayList.vue'
import {
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  watchEffect,
  nextTick
} from 'vue'
import { formatTime, parseTime } from '@/utils/format'
import {
  musicGetLyrics,
  delUserLikeSongId,
  addUserLikeSongId,
  addSongPlayCount
} from '@/api/music'
import { usePlayListStore, useUserStore } from '@/stores'

const imgUrl = ref('https://picsum.photos/200')
const value_slider = ref(0) // 进度条的值
const userStore = useUserStore()
const playListStore = usePlayListStore()

// 获取播放列表的歌单信息
const playList = ref([
  {
    song_id: 1,
    song_name: '',
    song_picSrc: null,
    song_originSrc: '',
    song_content: null,
    song_time: '',
    song_playCount: null,
    song_like: null,
    singer_name: ''
  }
])
const getPlayList = async () => {
  const infoPromises = playListStore.playList.map(async (item) => {
    const res = await musicGetLyrics(item)
    return res.data.data
  })

  const infosData = await Promise.all(infoPromises)

  // 根据 playListStore.playList 中的顺序重新排序数据
  const orderedData = playListStore.playList.map((id) => {
    const index = playListStore.playList.indexOf(id)
    return infosData[index]
  })

  playList.value = orderedData
}
getPlayList()

// 音频设置
const audioPlayer = ref()
const audioSound = ref(playListStore.volume || 50)
nextTick(() => (audioPlayer.value.volume = audioSound.value / 100)) // 默认音量
const changeVolume = () => {
  audioPlayer.value.volume = audioSound.value / 100
  playListStore.setVolume(audioSound.value)
}

const playAudio = ref(null) // 当前播放的歌曲ID
const musicPlay = ref(false) // 是否播放
const currentTime = ref('0:00')
const totalTime = ref('0:00')
const indexP = ref() // 高亮P标签的index
const isDragging = ref(false) // 添加一个状态来表示是否正在拖拽进度条
const isPlayEnd = ref(false) //音乐是否播放完成
let psRandom = [] // 伪随机判定数组
const likeSong = ref(false) // 当前歌曲是否喜欢
const updateCurrentTime = () => {
  const audio = audioPlayer.value
  const duration = audio.duration
  const current = (value_slider.value / 100) * duration

  // 更新当前时间
  currentTime.value = formatTime(current)
}
const updateTime = () => {
  let lastCurrentTime = 0
  if (!isDragging.value) {
    const audio = audioPlayer.value
    const duration = audio.duration
    const current = audio.currentTime

    // 更新当前时间
    currentTime.value = formatTime(current)

    // 更新总时间
    if (duration) {
      totalTime.value = formatTime(duration)
    }

    // 更新进度条值
    if (!value_slider.value) {
      value_slider.value = 0
    }
    value_slider.value = (current / duration) * 100

    // 当前时间超过总时间且上次更新时的当前时间小于总时间时，触发播放结束逻辑
    if (current >= duration && lastCurrentTime < duration) {
      value_slider.value = 0
      isPlayEnd.value = true
      currentTime.value = formatTime(current)
    }

    // 更新上一次更新时的当前时间
    lastCurrentTime = current

    if (lrcData.value) {
      indexP.value = findIndex()
      setOffset()
    }
  } else {
    const audio = audioPlayer.value
    const current = audio.currentTime

    // 更新当前时间
    currentTime.value = formatTime(current)
  }
}
const seekAudio = () => {
  const audio = audioPlayer.value
  const duration = audio.duration
  const newValue = value_slider.value

  // 计算新的播放时间
  const newTime = ((newValue / 100) * duration).toFixed(0)

  // 跳转到新的播放时间
  audio.currentTime = newTime
}
const toggleMusicPlay = () => {
  musicPlay.value = !musicPlay.value
  if (musicPlay.value) {
    audioPlayer.value.play()
  } else {
    audioPlayer.value.pause()
  }
}

// 歌词滚动
const result = ref() //获取后端传递的数据
const lyrics = ref()
const lrcData = ref()
const getLyrics = async () => {
  const res = await musicGetLyrics(playAudio.value)
  result.value = res.data.data
  lyrics.value = res.data.data.song_content
  lrcData.value = parseLrc()
}
if (playListStore.playList.length > 0) {
  playAudio.value = playListStore.playList[0]
  psRandom = [playAudio.value]
  getLyrics()
  addSongPlayCount(playAudio.value)
}

// 解析歌词字符串
const parseLrc = () => {
  if (lyrics.value) {
    const line = lyrics.value.split('\r\n')
    const res = []
    for (let i = 0; i < line.length; i++) {
      const str = line[i]

      const obj = {
        time: parseTime(str),
        words: str.split(']')[1]
      }

      res.push(obj)
    }
    return res
  }
}
// 设置包裹歌词容器.content的偏移量
const setOffset = () => {
  const doms = {
    container: document.querySelector(
      '#app > div > div.main > div.right > div'
    ),
    content: document.querySelector(
      '#app > div > div.main > div.right > div > div'
    )
  }
  // 容器高度
  const containerHeight = doms.container.clientHeight
  // p的高度
  // const PHeight = doms.content.children[0].clientHeight
  // const h1 = PHeight * indexP.value + PHeight / 2
  let h1 = 0,
    PHeight,
    prevPHeight = doms.content.children[0].clientHeight / 2
  for (let i = 0; i <= indexP.value; i++) {
    if (i !== 0) prevPHeight = doms.content.children[i - 1].clientHeight
    PHeight = doms.content.children[i].clientHeight // 获取第 i 个 p 元素的高度
    h1 += PHeight // 将当前元素的高度加到累加值中
  }
  h1 = h1 - prevPHeight / 2 - PHeight / 2
  let offset = h1 - containerHeight / 2
  if (offset < 0) {
    offset = offset * -1
    return (doms.content.style.transform = `translateY(${offset}px)`)
  }
  doms.content.style.transform = `translateY(-${offset}px)`
}
// 计算高亮歌词的下标
const findIndex = () => {
  if (!lrcData.value) return
  const audio = audioPlayer.value
  const curTime = audio.currentTime
  for (let i = 0; i < lrcData.value.length; i++) {
    if (curTime < lrcData.value[i].time) return i - 1
  }
  return lrcData.value.length - 1
}

// 获取页面相关数据
const songSrc = ref('')
const songName = ref('')
const singerName = ref('')
watch(
  () => result.value,
  (newValue) => {
    // 图片路径
    imgUrl.value =
      newValue.song_picSrc || `https://picsum.photos/200?${newValue.song_id}`
    // 歌曲路径
    songSrc.value = newValue.song_originSrc
    // 歌曲名称
    songName.value = newValue.song_name
    // 歌手
    singerName.value = newValue.singer_name
    totalTime.value = newValue.song_time
  }
)

// 监听歌曲的选择播放
const changePlaySongId = async (id) => {
  playAudio.value = id
  value_slider.value = 0
  await getLyrics().then(() => {
    if (musicPlay.value) {
      audioPlayer.value.play()
    } else {
      toggleMusicPlay()
    }
  })
}
// 监听歌曲的删除
const deleteSongId = async (ids) => {
  // 如果传入的是单个id
  if (!Array.isArray(ids)) {
    ids = [ids]
  }
  // 从本地删除歌曲ID
  playListStore.setPlayList(
    playListStore.playList.filter((item) => !ids.includes(item))
  )
  // 获取过滤后的歌曲信息
  await getPlayList().then(async () => {
    if (ids.includes(playAudio.value)) {
      if (playListStore.playList.length > 0) {
        playAudio.value = playListStore.playList[0]
        await getLyrics().then(() => {
          if (musicPlay.value) {
            audioPlayer.value.play()
          } else {
            audioPlayer.value.pause()
          }
        })
      } else {
        // 最后一个删除
        playAudio.value = null
        window.location.reload()
      }
    }
  })
}

let visibilityChangeHandler
const visible = ref(false) // 页面可见性
onMounted(() => {
  // 监听页面切换事件
  visibilityChangeHandler = () => {
    if (document.visibilityState === 'visible') {
      // 页面变为可见时的操作
      visible.value = true
    } else if (document.visibilityState === 'hidden') {
      // 页面变为不可见时的操作
      visible.value = false
    }
  }
  document.addEventListener('visibilitychange', visibilityChangeHandler)
})
onBeforeUnmount(() => {
  // 防止内存泄漏
  document.removeEventListener('visibilitychange', visibilityChangeHandler)
})

/* 歌曲列表的标签选择 */
const state = ref(false) // 喜欢当前歌曲的状态变化
const loadSrc = ref(null) // 当前歌曲下载路径
const deleteLikesById = async () => {
  state.value = !state.value
  userStore.setLikeSongsId(
    userStore.likeSongsId.filter((item) => playAudio.value !== item)
  )
  await delUserLikeSongId([playAudio.value])
} // 删除喜欢
const addLikesById = async () => {
  state.value = !state.value
  if (userStore.token) {
    let list = userStore.likeSongsId
    list.push(playAudio.value)
    userStore.setLikeSongsId(list)
    await addUserLikeSongId([playAudio.value])
  } else {
    ElMessage.warning('请登陆后重试')
  }
} // 添加喜欢
// 顺序播放
const orderPlay = () => {
  const index = playListStore.playList.indexOf(playAudio.value)
  if (index === playListStore.playList.length - 1 && isPlayEnd.value) {
    toggleMusicPlay()
  } else {
    playAudio.value = playListStore.playList[index + 1]
  }
}
// 单曲循环
const singleLoop = () => {
  toggleMusicPlay()
  toggleMusicPlay()
  addSongPlayCount(playAudio.value)
}
// 列表循环
const listLoop = () => {
  const index = playListStore.playList.indexOf(playAudio.value)
  if (index === playListStore.playList.length - 1 && isPlayEnd.value) {
    playAudio.value = playListStore.playList[0]
  } else {
    playAudio.value = playListStore.playList[index + 1]
  }
}
// 随机播放
const randomPlay = () => {
  // 判断伪随机数组是否填满
  if (psRandom.length === playListStore.playList.length) {
    psRandom = []
  }
  let randomIndex = Math.floor(Math.random() * playListStore.playList.length)
  // 如果当前播放的音频是随机选择的音频，则重新生成随机索引
  while (
    psRandom.includes(playListStore.playList[randomIndex]) &&
    playAudio.value !== playListStore.playList[randomIndex]
  ) {
    randomIndex = Math.floor(Math.random() * playListStore.playList.length)
  }
  playAudio.value = playListStore.playList[randomIndex]
  psRandom.push(playAudio.value)
}
const playMethods = {
  orderPlay: orderPlay,
  singleLoop: singleLoop,
  listLoop: listLoop,
  randomPlay: randomPlay
}
let playFunction = orderPlay
const playMode = ref(playListStore.playMode)
nextTick(() => {
  // 判断用户播放方式
  if (!playListStore.playMode) {
    playListStore.setPlayMode('orderPlay')
  } else {
    playFunction = playMethods[playListStore.playMode]
    playMode.value = playListStore.playMode
  }
})

// 选择播放方式
const selectPlayMethod = (e) => {
  if (e.target.tagName !== 'I') return
  playFunction = playMethods[e.target.dataset.name]
  playListStore.setPlayMode(e.target.dataset.name)
  playMode.value = e.target.dataset.name
}
// 监控歌曲播完后的事件执行
watchEffect(() => {
  loadSrc.value =
    playList.value.find((song) => song.song_id === playAudio.value)
      ?.song_originSrc || ''
  likeSong.value = userStore.likeSongsId.includes(playAudio.value)
  if (isPlayEnd.value) {
    playFunction()
    isPlayEnd.value = false
    getLyrics().then(() => {
      if (musicPlay.value) {
        audioPlayer.value.play()
      } else {
        audioPlayer.value.pause()
      }
    })
  }
})
// 最后给歌曲增加播放量
watch([playAudio, musicPlay], async (newVlaue, oldValue) => {
  if (newVlaue[1] && newVlaue[0] !== oldValue[0])
    await addSongPlayCount(newVlaue[0])
})
</script>

<template>
  <div class="container">
    <audio ref="audioPlayer" @timeupdate="updateTime" :src="songSrc" />
    <div class="top">
      <p>
        {{ userStore.user.user_nick || userStore.user.user_name }}
      </p>
      <el-avatar :size="50" :src="userStore.user.user_picSrc"></el-avatar>
    </div>
    <div class="main">
      <div class="all">
        <div class="left">
          <PlayList
            :play="false"
            :pagination="false"
            :tableData="playList"
            @changePlaySongId="changePlaySongId"
            @deleteSongId="deleteSongId"
            :visible="visible"
            :state="state"
            :showWaveAvi="playAudio"
            :waveAvi="true"
            :playState="musicPlay"
          ></PlayList>
        </div>
      </div>
      <div class="right">
        <img :src="imgUrl" alt="" />
        <p class="song-title">歌曲名：{{ songName }}</p>
        <p class="singer">歌手：{{ singerName }}</p>
        <div class="lyric">
          <div class="content" v-show="lrcData">
            <p
              v-for="(item, index) in lrcData"
              :key="index"
              :class="index === indexP ? 'active' : ''"
            >
              {{ item.words }}
            </p>
          </div>
          <el-empty
            description="无歌词"
            :image-size="100"
            style="margin-top: -45px"
            v-show="!lrcData"
          />
        </div>
      </div>
    </div>
    <div class="bottom">
      <div class="button">
        <i class="iconfont icon-play-previous"></i>
        <i
          class="iconfont icon-pause"
          v-show="musicPlay"
          @click="toggleMusicPlay"
        ></i>
        <i
          class="iconfont icon-play1"
          v-show="!musicPlay"
          @click="toggleMusicPlay"
        ></i>
        <i class="iconfont icon-play-next"></i>
      </div>
      <div class="progress-bar">
        <div class="info">
          <p class="text">{{ songName }} - {{ singerName }}</p>
          <p class="time">{{ currentTime }} / {{ totalTime }}</p>
        </div>
        <div class="bar">
          <el-slider
            v-model="value_slider"
            :show-tooltip="false"
            @input="
              () => {
                isDragging = true
                updateCurrentTime()
              }
            "
            size="small"
            @change="
              () => {
                isDragging = false
                seekAudio()
              }
            "
          />
        </div>
      </div>
      <div class="select" @click="selectPlayMethod">
        <i
          :class="[
            'iconfont',
            'icon-shunxubofang',
            playMode === 'orderPlay' ? 'active' : ''
          ]"
          title="顺序播放"
          data-name="orderPlay"
        ></i>
        <i
          :class="[
            'iconfont',
            'icon-danquxunhuan',
            playMode === 'singleLoop' ? 'active' : ''
          ]"
          title="单曲循环"
          data-name="singleLoop"
        ></i>
        <i
          :class="[
            'iconfont',
            'icon-liebiaoxunhuan',
            playMode === 'listLoop' ? 'active' : ''
          ]"
          title="列表循环"
          data-name="listLoop"
        ></i>
        <i
          :class="[
            'iconfont',
            'icon-suijibofang',
            playMode === 'randomPlay' ? 'active' : ''
          ]"
          title="随机播放"
          data-name="randomPlay"
        ></i>
        <span
          class="iconfont icon-hear"
          title="喜欢"
          v-show="!likeSong"
          @click="addLikesById"
        ></span>
        <span
          class="iconfont icon-hear-full"
          style="color: red"
          v-show="likeSong"
          @click="deleteLikesById"
        ></span>
        <a
          class="iconfont icon-xiazai"
          title="下载"
          v-show="playAudio"
          style="font-size: 21px; margin-top: -2px"
          download
          :href="loadSrc"
          target="_blank"
        ></a>
        <span
          class="iconfont icon-24gl-volumeHigh"
          style="font-weight: bolder"
          title="音量调节"
          v-show="audioSound > 0"
        ></span>
        <span
          class="iconfont icon-24gl-volumeDisable"
          style="font-weight: bolder"
          title="音量调节"
          v-show="audioSound <= 0"
        ></span>
        <div class="slider">
          <p>{{ audioSound }}</p>
          <el-slider
            v-model="audioSound"
            vertical
            height="50px"
            :show-tooltip="false"
            @input="changeVolume"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
body {
  background-color: #fafafa;
}
.container {
  width: 100%;

  .top {
    display: flex;
    flex-direction: row-reverse;
    user-select: none;
    padding: 10px;

    p {
      margin-left: 5px;
      line-height: 50px;
    }
  }

  .main {
    height: 65vh;
    padding-left: 100px;
    display: flex;

    .all {
      height: 100%;
      width: 65%;

      .left {
        height: 100%;
        overflow: auto;

        &::-webkit-scrollbar {
          width: 12px;
        }

        &::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 5px;
        }

        &::-webkit-scrollbar-thumb:hover {
          background-color: #b2b2b2;
        }

        :deep(.container) {
          background-color: transparent;
          margin: 0;
          padding: 0;
        }
      }
    }

    .right {
      width: 35%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      img {
        width: 200px;
        height: 200px;
        background-color: pink;
      }

      & > p {
        margin: 10px 0 0 0;
      }

      .lyric {
        height: 190px;
        width: 300px;
        margin-top: 20px;
        text-align: center;
        overflow: hidden;
        mask-image: linear-gradient(
          to top,
          transparent 5%,
          white 50%,
          white 60%,
          transparent 95%
        );

        .content {
          transition: all 0.4s;

          p {
            padding-bottom: 10px;
            font-weight: lighter;
          }

          p.active {
            color: #31c27c;
            font-weight: bold;
            transform: scale(1.1);
          }
        }
      }
    }
  }

  .bottom {
    position: absolute;
    height: 128.44px;
    width: 1500px;
    bottom: 0;
    display: flex;

    .button {
      width: 25%;
      display: flex;
      align-items: center;
      justify-content: center;

      .iconfont {
        font-size: 40px;
        color: rgb(162, 159, 159);
        cursor: pointer;
        margin-right: 15px;

        &:hover {
          color: #31c27c;
        }
      }
    }

    .progress-bar {
      --el-color-primary: #31c27c;
      width: 40%;
      display: flex;
      flex-direction: column;
      justify-content: center;

      :deep(.el-slider) {
        --el-slider-button-size: 12px;
        --el-slider-height: 4px;

        .el-slider__button {
          vertical-align: initial;
        }
      }

      .info {
        color: gray;
        font-size: 14px;
        display: flex;
        justify-content: space-between;
      }
    }

    .select {
      width: 25%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      .iconfont {
        display: block;
        font-size: 25px;
        color: gray;
        margin-right: 20px;
        cursor: pointer;
        a {
          display: inline-block;
          width: 25px;
          height: 25px;
        }

        &.active {
          color: #31c27c;
        }
      }

      .icon-24gl-volumeHigh:hover ~ .slider,
      .icon-24gl-volumeDisable:hover ~ .slider {
        visibility: visible;
      }

      .slider {
        position: absolute;
        top: -25px;
        left: 290px;
        display: flex;
        flex-direction: column;
        align-content: center;
        visibility: hidden;

        p {
          color: gray;
          text-align: center;
        }

        :deep(.el-slider) {
          --el-slider-height: 4px;
          --el-slider-button-size: 12px;

          margin-top: 5px;

          .el-slider__button {
            margin-left: -2px;
          }
        }

        &:hover {
          visibility: visible;
        }
      }
    }
  }
}
</style>
