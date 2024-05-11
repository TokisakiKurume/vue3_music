// npm i express cors mysql

import express from 'express'
import cors from 'cors'
import multer from 'multer'

const app = express()
export const port = 3000
export const baseUrl = 'http://127.0.0.1'

// 启用跨域
app.use(cors())

// 使用express.static中间件将assets文件夹暴露出去
app.use('/assets/cont', express.static('assets/cont'))
app.use('/assets/upload_img', express.static('assets/upload_img'))
app.use('/assets/music', express.static('assets/music'))
app.use('/assets/lrc', express.static('assets/lrc'))
// 设置静态文件目录
// app.use('/', express.static('assets/dist'))
// app.use('/VIP', express.static('assets/dist'))
// app.use('/song_detail', express.static('assets/dist'))

// 导入其他路由
import router_api from './router_api.js'
import router_my from './router_my.js'
app.use('/api', router_api)
app.use('/my', router_my)

// 测试路由
{
  app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  app.get('/indexPage', (req, res) => {
    res.json({
      status: 200,
      recommendIndex: [
        {
          sheet_id: '31',
          pictureSrc: `${baseUrl}:${port}/assets/cont/carousel_img1.jpg`
        },
        {
          sheet_id: '32',
          pictureSrc: `${baseUrl}:${port}/assets/cont/carousel_img2.jpg`
        },
        {
          sheet_id: '33',
          pictureSrc: `${baseUrl}:${port}/assets/cont/carousel_img3.jpg`
        },
        {
          sheet_id: '34',
          pictureSrc: `${baseUrl}:${port}/assets/cont/carousel_img4.jpg`
        },
        {
          sheet_id: '35',
          pictureSrc: `${baseUrl}:${port}/assets/cont/carousel_img5.jpg`
        }
      ]
    })
  })
}

// 错误中间件
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.send({
      status: 401,
      message: '无效的token'
    })
  } else if (err instanceof multer.MulterError) {
    // Multer 错误，例如文件大小超过限制
    return res.status(400).json({ message: '图片不满足要求' })
  }
  res.send({
    status: 500,
    message: '未知错误'
  })
  next()
})

// 启动 Express 服务器
app.listen(port, () => {
  console.log(`Express app listening on port ${baseUrl}:${port}`)
})
