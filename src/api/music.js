import request from '@/utils/request'

// 获取首页--展示数据
export const musicGetIndex = () => request.get('/indexPage')

// 获取歌手页面--展示数据
export const musicGetSingeer = () => request.get('/singerPage')

// 获取排行榜页面--展示数据
export const musicGetCharts = () => request.get('/chartsPage')

// 获取歌曲--信息
export const musicGetLyrics = (id) =>
  request.get('/api/songInfo', {
    params: {
      id
    }
  })

// 歌曲--获取搜索的歌曲信息
export const musicGetSearchInfo = (data) =>
  request.post('/api/searchSongInfo', data)

// 获取用户喜欢的歌曲id
export const getUserLikeSongId = () => request.get('/my/userLikeSongs')
// 添加用户喜欢的歌曲
export const addUserLikeSongId = (id) =>
  request.put('/my/userLikeSongs', { song_id: id })
// 删除用户喜欢的歌曲
export const delUserLikeSongId = (id) =>
  request.delete('/my/userLikeSongs', { data: { song_id: id } })
// 添加歌曲到歌单
export const addSongToSheet = (song_id, sheet_id) =>
  request.put('/my/addSongToSheet', { song_id, sheet_id })

// 增加歌曲播放量
export const addSongPlayCount = (song_id) =>
  request.patch('/api/addPlayCount', { song_id })

// 所有歌曲
export const getAllSongInfo = () => request.get('/api/song/allSongInfo')
