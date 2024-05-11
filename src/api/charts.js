import request from '@/utils/request'

// 排行榜信息
export const getChartsInfo = () => request.get('/api/charts')

// 新歌排行
export const getChartNewSong = () => request.get('/api/chart/newSong')

// 热歌排行
export const getChartHotSong = () => request.get('/api/chart/hotSong')

// 华语
export const getChartChinese = () => request.get('/api/chart/chinese')

// 韩国
export const getChartKorean = () => request.get('/api/chart/korean')

// 日本
export const getChartJapanese = () => request.get('/api/chart/japanese')

// 欧美
export const getChartEnglish = () => request.get('/api/chart/english')
