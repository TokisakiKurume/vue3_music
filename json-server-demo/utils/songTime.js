import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import ffprobePath from '@ffprobe-installer/ffprobe'
import ffmpeg from 'fluent-ffmpeg'

// 定义视频文件路径
ffmpeg.setFfmpegPath(ffmpegPath.path)
ffmpeg.setFfprobePath(ffprobePath.path)

const formatTime = (url) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(url, (err, data) => {
      if (err) {
        reject(err)
      } else {
        let time = data.format.duration.toFixed(2)
        time = _formatTime(time)
        resolve(time)
      }
    })
  })
}

const _formatTime = (time) => {
  if (isNaN(time)) {
    return '00:00' // 处理 NaN 输入的情况
  }
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default formatTime
