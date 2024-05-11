import request from '@/utils/request'

// 获取歌手页面信息
export const getSingerAllInfo = (data) => {
  return request.post('/api/singAllInfo', {
    data: data
  })
} // data = { letter, pageNumber, pageSize, not} 对象

// 获取歌手详情信息
export const getSingerInfo = (data) => request.post('api/singerInfo', data) // data = { id, pageNumber, pageSize} 对象
