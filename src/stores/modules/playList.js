import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlayListStore = defineStore(
  'vu3_music_playList',
  () => {
    // 播放列表的歌曲ID数据
    const playList = ref([])
    const setPlayList = (newPlayList) => {
      playList.value = newPlayList
    }
    const addDataToTop = (id) => {
      if (Array.isArray(id)) {
        // 过滤出不在 playList 中的 id
        playList.value = playList.value.filter((item) => !id.includes(item))
        // 将不重复的 id 插入到 playList 的开头
        playList.value.unshift(...id)
      } else {
        const index = playList.value.indexOf(id)
        if (index !== -1) {
          // 如果 id 已经存在于 playList 中，先移除已存在的 id
          playList.value.splice(index, 1)
        }
        // 然后将 id 插入到 playList 的开头
        playList.value.unshift(id)
      }
    }

    // 播放方式
    const playMode = ref('')
    const setPlayMode = (newPlayMode) => {
      playMode.value = newPlayMode
    }

    // 播放音量
    const volume = ref(50)
    const setVolume = (newVolume) => {
      volume.value = newVolume
    }

    return {
      playList,
      setPlayList,
      addDataToTop,
      playMode,
      setPlayMode,
      volume,
      setVolume
    }
  },
  { persist: true, expires: '1d' }
)
