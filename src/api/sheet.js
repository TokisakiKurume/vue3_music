import request from '@/utils/request'

// 获取歌单--标签
export const musicGetLabels = () => request.get('/api/labelAllInfo')

// 歌单--新建歌单
export const addSheet = (data) => request.put('/my/newSheet', data)

// 歌单--用户对歌单是否可编辑
export const editSheetByUser = (data) =>
  request.post('/my/editableSheet', { id: data }) // data: {id}

// 歌单--编辑更新歌单
export const updateSheetInfo = (data) => request.patch('/my/updateSheet', data)

// 歌单--用户创建
export const createSheetByUser = () => request.get('/my/userSheetInfo')

// 歌单--删除歌单
export const deleteSheetByUser = (id) =>
  request.delete('/my/deleteSheet', { data: { sheet_id: id } })

// 歌单--用户喜欢的歌单信息
export const getUserLikeSheet = () => request.get('/my/userLikeSheet')

// 歌单--删除用户喜欢的歌单
export const deleteUserLikeSheet = (id) =>
  request.delete('/my/deleteLikeSheet', { data: { sheet_id: id } })

// 歌单--全部歌单
export const getAllSheet = () => request.get('/api/sheetAllInfo')

// 歌单--播放量更新
export const updatePlayCount = (data) =>
  request.patch('/api/updateSheetPlayCount', data) // data: { sheet_id, playCount }

// 歌单--指定歌单信息
export const getSheetInfo = (sheet_id) =>
  request.get('/api/sheetInfo', { params: { sheet_id } })

// 歌单--歌曲信息
export const getSheetSongs = (data) => request.post('/api/sheetSong', data) // data: { song_id, pageSize, pageNumber}

// 歌单--用户是否喜欢
export const userIsLikeSheet = (id) =>
  request.get('/my/userIsSheet', { params: { id } })

// 歌单--添加用户喜欢的歌单
export const addUserLikeSheet = (id) =>
  request.put('/my/userLikeSheet', { sheet_id: id })

// 删除歌单中的音乐
export const deltetSheetSong = (sheet_id, song_id) =>
  request.delete('/my/sheetSong', { data: { sheet_id, song_id } })
