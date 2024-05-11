// 格式化时间函数
const formatTime = (time) => {
  if (isNaN(time)) {
    return '00:00' // 处理 NaN 输入的情况
  }
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// 时间解析成秒（00:00:00）
const parseTime = (timeStr) => {
  const str = timeStr.split(']')[0].substring(1)
  const min = str.split(':')[0]
  const sec = str.split(':')[1]
  return Number(min) * 60 + Number(sec)
}

export { formatTime, parseTime }
