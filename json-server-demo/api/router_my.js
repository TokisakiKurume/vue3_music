// 1.导入路由对象
import jwt from 'jsonwebtoken'
import express from 'express'
import expressJwt from 'express-jwt'
import multer from 'multer'
import { baseUrl, port } from './server.js'
import fs from 'fs'
import {
  queryUserThrough,
  queryUserId,
  quseryUserInfo,
  updateUserInfo,
  updateUserAvatar,
  updateUserPassword,
  queryUserPassword,
  querySheetNumber,
  addSheetAndLabel,
  queryUserSheet,
  querySheetById,
  querySheetLabelBySheetId,
  updateSheetInfo,
  UserAllSheetInfo,
  deleteSheetById,
  queryUserLikeSongByUserId,
  queryUserLikeSheetById,
  deleteLikeSheet,
  addUserLikeSong,
  deltetUserLikeSong,
  addSongToSheet,
  checkSongToSheet,
  userIsLikeSheet,
  addUserLikeSheet,
  deleteSheetSong
} from './mysql.js'

const router = express.Router()
const secretKey = 'liuxuyao No2 ^_^!' // 密钥定义
let newFilename // 存入用户头像的图片名称
router.use(express.json())
router.use(express.urlencoded({ extended: true }))

// wexpress-jwt中间件token解密
router.use(
  expressJwt.expressjwt({ secret: secretKey, algorithms: ['HS256'] }).unless({
    path: ['/my/login']
  })
)
// 配置 multer 中间件来处理上传
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'assets/upload_img') // 设置上传文件的目录
  },
  filename: function (req, file, cb) {
    const originalname = file.originalname // 获取原始文件名
    const extension = originalname.split('.').pop() // 获取原始文件后缀
    newFilename = `user_${req.auth.userId}.` + extension // 构建新的文件名（不更改后缀）
    cb(null, newFilename)
  }
})
// 定义文件过滤器
const fileFilter = (req, file, cb) => {
  // 检查文件类型
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('只允许上传图片文件'))
  }
  cb(null, true)
}
// 设置上传文件的限制
const limits = {
  fileSize: 2 * 1024 * 1024 // 2MB
}
let upload = multer({
  storage: storage,
  fileFilter: fileFilter
})

// 用户模块路由
router.post('/login', (req, res) => {
  // 1.获取请求体参数
  const username = req.body.username
  const password = req.body.password
  // 2.调用数据库查询方法
  if (username && password) {
    queryUserThrough(username, password).then(async (result) => {
      // 3.判断查询结果
      if (result) {
        const userId = await queryUserId(username, password)
        const tokenStr =
          'Bearer ' +
          jwt.sign({ userId }, secretKey, {
            expiresIn: '24h'
          })
        res.send({
          status: 200,
          message: '登录成功',
          data: {
            token: tokenStr
          }
        })
      } else {
        res.send({
          status: 401,
          message: '用户名或密码错误'
        })
      }
    })
  } else {
    res.send({
      status: 401,
      message: '用户名或密码错误'
    })
  }
})
router.get('/userInfo', (req, res) => {
  quseryUserInfo(req.auth.userId).then((result) => {
    const userInfo = Object.assign({}, result)
    delete userInfo.user_id
    delete userInfo.user_password
    res.send({
      status: 200,
      message: '请求发送成功',
      data: userInfo
    })
  })
})
router.put('/userInfo', (req, res) => {
  const userInfo = req.body
  if (userInfo) {
    updateUserInfo(req.auth.userId, userInfo.nickname, userInfo.email).then(
      () => {
        res.send({
          status: 200,
          message: '请求发送成功'
        })
      }
    )
  } else {
    res.send({
      status: 401,
      message: '请求发送失败'
    })
  }
})
router.patch('/avatar', upload.single('image'), (req, res) => {
  const id = req.auth.userId
  const url = `${baseUrl}:${port}/assets/upload_img/${newFilename}`
  updateUserAvatar(id, url).then(() => {
    res.send({
      status: 200,
      message: '请求发送成功'
    })
  })
})
router.patch('/password', (req, res) => {
  const old_password = req.body.old_pwd
  const new_password = req.body.new_pwd
  if (old_password && new_password) {
    queryUserPassword(req.auth.userId).then((result) => {
      if (result !== old_password) {
        res.send({
          status: 401,
          message: '原密码错误'
        })
      } else {
        updateUserPassword(req.auth.userId, new_password).then(() => {
          res.send({
            status: 200,
            message: '请求发送成功'
          })
        })
      }
    })
  } else {
    res.send({
      status: 401,
      message: '请求发送失败'
    })
  }
})
const verifyToken = (req) => {
  return new Promise((resolve, reject) => {
    const token = req.auth
    if (!token) {
      reject({ message: '未提供 token' })
    }

    // 检查 JWT 是否过期
    const currentUnixTime = Math.floor(Date.now() / 1000)
    if (token.exp <= currentUnixTime) {
      // JWT 已经过期
      reject({ message: 'token 已经过期' })
    }

    // 如果 token 的有效期在 0 小时到 12 小时之间，则生成一个新的 token
    // const tokenExpirationTime = token.exp - currentUnixTime
    // if (tokenExpirationTime > 0 && tokenExpirationTime <= 24 * 3600) {
    //   const newToken = jwt.sign({ userId: token.userId }, secretKey, {
    //     expiresIn: '24h'
    //   })
    //   console.log('验证成功')
    //   resolve({ message: 'token 验证成功', newToken })
    // }

    // JWT 验证成功且未过期
    resolve({ message: 'token 验证成功' })
  })
} // 返回验证 token 的 promise 对象
router.get('/verifyToken', (req, res) => {
  verifyToken(req)
    .then((result) => {
      res.send({
        status: 200,
        message: result.message,
        data: result.newToken
      })
    })
    .catch((error) => {
      res.status(401).json(error)
    })
})
router.get('/userLikeSong', (req, res) => {
  queryUserLikeSongByUserId(req.auth.userId)
    .then((result) => {
      res.send({
        status: 200,
        message: '请求发送成功',
        data: result ? result : []
      })
    })
    .catch(() => {
      res.send({
        status: 401,
        message: '请求发送失败'
      })
    })
})

// 歌单模块
let number // 当前歌单的ID
storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'assets/upload_img') // 设置上传文件的目录
  },
  filename: async function (req, file, cb) {
    const originalname = file.originalname // 获取原始文件名
    const extension = originalname.split('.').pop() // 获取原始文件后缀
    number = (await querySheetNumber()) + 1
    newFilename = `sheet_undefined.` + extension // 构建新的文件名（不更改后缀）
    cb(null, newFilename)
  }
})
upload = multer({ storage: storage, fileFilter: fileFilter, limits: limits })
// 新建歌单
router.put('/newSheet', upload.single('image'), (req, res) => {
  // 获取原始文件路径
  const originalFilePath = `assets/upload_img/${newFilename}`
  newFilename =
    newFilename.split('_')[0] + '_' + number + '.' + newFilename.split('.')[1]
  // 构建新的文件路径
  const newFilePath = `assets/upload_img/${newFilename}`
  // 重命名文件
  fs.renameSync(originalFilePath, newFilePath)
  const url = `${baseUrl}:${port}/assets/upload_img/${newFilename}`
  addSheetAndLabel(req.auth.userId, req.body, url, number)
    .then(() => {
      res.send({ status: 200, message: '新建歌单成功' })
    })
    .catch((error) => {
      console.error('添加歌单和标签关系失败:', error)
      res.status(500).send({ error: '添加歌单和标签关系失败' })
    })
})
// 更新编辑歌单
router.patch('/updateSheet', upload.single('image'), (req, res) => {
  const { sheet_id, name, privacy, labelId } = req.body
  if (newFilename) {
    // 获取原始文件路径
    const originalFilePath = `assets/upload_img/${newFilename}`
    newFilename =
      newFilename.split('_')[0] +
      '_' +
      sheet_id +
      '.' +
      newFilename.split('.')[1]
    // 构建新的文件路径
    const newFilePath = `assets/upload_img/${newFilename}`
    // 重命名文件
    fs.renameSync(originalFilePath, newFilePath)
  }

  let picSrc = null
  if (req.file) picSrc = `${baseUrl}:${port}/assets/upload_img/${newFilename}`
  updateSheetInfo(sheet_id, name, privacy, labelId, 1, picSrc)
    .then((result) => {
      res.send({
        status: 200,
        message: '更新歌单成功',
        data: result
      })
    })
    .catch(() => {
      res.status(500).send({ error: '更新歌单失败' })
    })
})
// 用户是否有权限进入当前的编辑歌单
router.post('/editableSheet', (req, res) => {
  const sheetId = req.body.id
  const userId = req.auth.userId
  if (sheetId && userId) {
    queryUserSheet(userId, sheetId).then((result) => {
      if (result) {
        querySheetById(sheetId).then((sheetInfo) => {
          delete sheetInfo.user_id
          querySheetLabelBySheetId(sheetId).then((label) => {
            res.send({
              status: 200,
              message: '歌单可编辑',
              data: { ...sheetInfo, labelId: label }
            })
          })
        })
      } else {
        res.send({
          status: 401,
          message: '该歌单无权限编辑'
        })
      }
    })
  } else {
    res.send({
      status: 401,
      message: '缺少查询条件'
    })
  }
})
// 用户创建的歌单信息
router.get('/userSheetInfo', async (req, res) => {
  const userId = req.auth.userId
  if (!userId) {
    return res.status(401).send({
      status: 401,
      message: '缺少查询条件'
    })
  }

  try {
    const userSheetInfo = await UserAllSheetInfo(userId)
    if (!userSheetInfo) return res.send({ status: 200, data: [] })

    // 使用 map 方法遍历数组中的每个元素，并返回对应的查询用户信息的 Promise
    const userInfoPromises = userSheetInfo.map(async (sheet) => {
      const userInfo = await quseryUserInfo(sheet.user_id)
      delete userInfo.user_id
      delete userInfo.user_email
      delete userInfo.user_password
      delete userInfo.user_picSrc
      delete sheet.user_id
      delete sheet.sheet_playCount
      delete sheet.state
      delete sheet.sheet_playCollention
      return { ...sheet, user: userInfo }
    })

    // 等待所有用户信息查询完成
    const userInfoResults = await Promise.all(userInfoPromises)

    res.status(200).send({
      status: 200,
      message: '查询成功',
      data: userInfoResults
    })
  } catch (error) {
    res.status(500).send({
      status: 500,
      message: '查询用户歌单信息时出错'
    })
  }
})
// 用户删除歌单
router.delete('/deleteSheet', (req, res) => {
  const sheet_id = req.body.sheet_id
  const userId = req.auth.userId
  if (sheet_id) {
    queryUserSheet(userId, sheet_id)
      .then(() => {
        deleteSheetById(sheet_id).then(() => {
          res.send({
            status: 200,
            message: '删除歌单成功'
          })
        })
      })
      .catch(() => {
        res.status(401).send({
          status: 401,
          message: '该歌单无权限删除'
        })
      })
  } else {
    res.send({
      status: 401,
      message: '缺少查询条件'
    })
  }
})
// 用户喜欢的歌单
router.get('/userLikeSheet', (req, res) => {
  const userId = req.auth.userId
  queryUserLikeSheetById(userId)
    .then(async (result) => {
      const userInfoPromises = result.map(async (sheet) => {
        const userInfo = await quseryUserInfo(sheet.user_id)
        delete userInfo.user_id
        delete userInfo.user_email
        delete userInfo.user_password
        delete userInfo.user_picSrc
        delete sheet.user_id
        delete sheet.sheet_playCount
        delete sheet.state
        delete sheet.sheet_playCollention
        return { ...sheet, user: userInfo }
      })
      // 等待所有用户信息查询完成
      const userInfoResults = await Promise.all(userInfoPromises)
      res.send({
        status: 200,
        message: '查询成功',
        data: userInfoResults
      })
    })
    .catch((err) => {
      res.send({
        status: 200,
        message: '查询失败: ' + err.message
      })
    })
})
// 删除用户喜欢的歌单
router.delete('/deleteLikeSheet', (req, res) => {
  const sheet_id = req.body.sheet_id
  const userId = req.auth.userId
  if (sheet_id) {
    queryUserSheet(userId, sheet_id)
      .then(() => {
        deleteLikeSheet(sheet_id, userId).then(() => {
          res.send({
            status: 200,
            message: '删除歌单成功'
          })
        })
      })
      .catch(() => {
        res.status(401).send({
          status: 401,
          message: '删除歌单失败'
        })
      })
  } else {
    res.send({
      status: 401,
      message: '缺少查询条件'
    })
  }
})
// 添加用户喜欢的歌单
router.put('/userLikeSheet', (req, res) => {
  const user_id = req.auth.userId
  const sheet_id = req.body.sheet_id
  addUserLikeSheet(sheet_id, user_id).then(() => {
    res.send({
      status: 200,
      message: '添加成功'
    })
  })
})
// 用户是否喜欢歌单
router.get('/userIsSheet', (req, res) => {
  const userId = req.auth.userId
  const sheet_id = req.query.id
  userIsLikeSheet(sheet_id, userId).then((result) => {
    res.send({
      status: 200,
      message: '查询成功',
      result
    })
  })
})
// 删除歌单中的歌曲
router.delete('/sheetSong', (req, res) => {
  const song_id = req.body.song_id
  const sheet_id = req.body.sheet_id
  deleteSheetSong(sheet_id, song_id).then(() => {
    res.send({
      status: 200,
      message: '删除成功'
    })
  })
})

// 歌曲模块
// 查询用户喜欢的歌曲
router.get('/userLikeSongs', (req, res) => {
  const userId = req.auth.userId
  queryUserLikeSongByUserId(userId)
    .then((result) => {
      if (!result) return res.send({ status: 200, data: [] })
      const songId = result.map((song) => song.song_id)
      res.send({
        status: 200,
        message: '查询成功',
        data: songId
      })
    })
    .catch((err) => {
      res.send({
        status: 401,
        message: '查询失败:' + err.message
      })
    })
})
// 添加用户喜欢的歌曲
router.put('/userLikeSongs', (req, res) => {
  const songId = req.body.song_id
  const userId = req.auth.userId
  if (songId?.length > 0) {
    Promise.all(
      songId.map(async (songId) => {
        await addUserLikeSong(userId, songId)
      })
    )
      .then(() => {
        res.send({
          status: 200,
          message: '添加成功'
        })
      })
      .catch(() => {
        res.send({
          status: 401,
          message: '添加失败'
        })
      })
  } else {
    res.send({
      status: 401,
      message: '缺少查询条件'
    })
  }
})
// 删除用户喜欢的歌曲
router.delete('/userLikeSongs', (req, res) => {
  const songIds = req.body.song_id
  const userId = req.auth.userId
  if (songIds) {
    Promise.all(
      songIds.map(async (songId) => {
        await deltetUserLikeSong(userId, songId)
      })
    )
      .then(() => {
        res.send({
          status: 200,
          message: '删除成功'
        })
      })
      .catch((err) => {
        console.log(err.message)
        res.send({
          status: 401,
          message: '删除失败'
        })
      })
  } else {
    res.send({
      status: 401,
      message: '缺少查询条件'
    })
  }
})
// 将歌曲添加到创建的歌单中
router.put('/addSongToSheet', (req, res) => {
  const songIds = req.body.song_id
  const sheetId = req.body.sheet_id
  Promise.all(
    songIds.map(async (songId) => {
      const number = await checkSongToSheet(songId, sheetId)
      if (number !== 1) return songId
    })
  ).then((addSongIds) => {
    // 在这里等待 Promise.all 的结果
    // 过滤掉值为 undefined 的元素
    addSongIds = addSongIds.filter((item) => item !== undefined)
    if (addSongIds.length > 0) {
      Promise.all(
        addSongIds.map(async (item) => {
          await addSongToSheet(item, sheetId)
        })
      )
        .then(() => {
          res.send({
            status: 200,
            message: '添加成功'
          })
        })
        .catch((err) => {
          console.error(err)
          res.send({
            status: 401,
            message: '添加失败'
          })
        })
    } else {
      res.send({
        status: 401,
        message: '该歌曲已存在于该歌单'
      })
    }
  })
})

export default router
