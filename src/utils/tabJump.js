import { usePlayListStore } from '@/stores'
import { onMounted, onBeforeUnmount } from 'vue'

/* 解决两个tab页跳转时pinia的歌曲列表仓库的值不一致问题 */
export const setupTabJump = () => {
  const playListStore = usePlayListStore()

  const handleTabFocus = () => {
    playListStore.setPlayList(
      JSON.parse(localStorage.getItem('vu3_music_playList')).playList
    )
    playListStore.setPlayMode(
      JSON.parse(localStorage.getItem('vu3_music_playList')).playMode
    )
    playListStore.setVolume(
      JSON.parse(localStorage.getItem('vu3_music_playList')).volume
    )
    console.log(JSON.parse(localStorage.getItem('vu3_music_playList')).volume)
  }

  onMounted(() => {
    window.onfocus = handleTabFocus
  })

  onBeforeUnmount(() => {
    window.onfocus = null
  })
}
