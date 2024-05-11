import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfo } from '@/api/user'
import { getUserLikeSongId } from '@/api/music'
import { createSheetByUser } from '@/api/sheet'

// 用户模块 token setToken removeToken
export const useUserStore = defineStore(
  'vu3_music_user',
  () => {
    const token = ref('')
    const setToken = (newToken) => {
      token.value = newToken
    }
    const removeToken = () => {
      token.value = ''
    }

    const user = ref({})
    const getUser = async () => {
      const res = await getUserInfo() // 请求获取数据
      user.value = res.data.data
    }
    const setUser = (obj) => {
      user.value = obj
    }

    // 监听 getUser 函数
    const state = ref(true)
    const toggleState = () => {
      state.value = !state.value
    }

    // 用户喜欢的歌曲
    const likeSongsId = ref([])
    const getLikeSongsId = async () => {
      const res = await getUserLikeSongId() // 请求获取数据
      likeSongsId.value = res.data.data
    }
    const setLikeSongsId = (obj) => {
      likeSongsId.value = obj
    }

    // 用户创建的歌单
    const createdPlaylist = ref([])
    const getCreatedPlaylist = async () => {
      const res = await createSheetByUser() // 请求获取数据
      createdPlaylist.value = res.data.data.map((item) => {
        return { id: item.sheet_id, name: item.sheet_name }
      })
    }
    const setCreatedPlaylist = (obj) => {
      createdPlaylist.value = obj
    }

    return {
      token,
      setToken,
      removeToken,
      user,
      getUser,
      setUser,
      state,
      toggleState,
      likeSongsId,
      getLikeSongsId,
      setLikeSongsId,
      createdPlaylist,
      getCreatedPlaylist,
      setCreatedPlaylist
    }
  },
  {
    // persist: true
    persist: true // 持久化
  }
)
