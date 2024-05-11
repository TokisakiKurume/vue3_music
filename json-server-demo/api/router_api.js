// 导入路由对象
import express from 'express'
import getModifiedLrc from '../utils/songLrc.js'
import {
  querySongById,
  querySingerById,
  querySingerByLetter,
  querySongByLikeStr,
  querySongBySingerId,
  queryAllLabel,
  queryAllVisibleSheet,
  querySheetLabelBySheetId,
  updateSheetPlayCount,
  querySheetById,
  queryLabelItemName,
  querySheetSongsId,
  quseryUserInfo,
  querySheetSongsNumber,
  queryChartsItemById,
  queryCharts,
  queryNewSong,
  addSongPlayCount,
  queryHotSong,
  queryChineseSong,
  queryKoreanSong,
  queryEnglishSong,
  queryJapaneseSong,
  queryAllSong
} from './mysql.js'

// 创建路由对象
const router = express.Router()
router.use(express.json())
router.use(express.urlencoded({ extended: true }))

// 歌曲模块路由
// 获取对应 id 歌曲信息
router.get('/songInfo', (req, res) => {
  const id = req.query.id
  if (id) {
    querySongById(id).then((result) => {
      querySingerById(result.singer_id).then((singer) => {
        if (!result.song_content) {
          const my_res = {
            ...result,
            singer_name: singer.singer_name
          }
          delete my_res.singer_id
          res.send({
            status: 200,
            data: my_res
          })
        } else {
          getModifiedLrc(result.song_content).then((lrcContent) => {
            const my_res = {
              ...result,
              singer_name: singer.singer_name,
              song_content: lrcContent
            }
            delete my_res.singer_id
            res.send({
              status: 200,
              data: my_res
            })
          })
        }
      })
    })
  } else {
    res.send({
      status: 400,
      message: '缺少歌曲id'
    })
  }
})
// 获取搜索的歌曲信息
router.post('/searchSongInfo', (req, res) => {
  const { str, pageNumber, pageSize } = req.body
  if (!str && !pageNumber && !pageSize) {
    res.send({
      status: 400,
      message: '缺少查询条件'
    })
  } else {
    querySongByLikeStr(str, pageSize, pageNumber).then((result) => {
      res.send({
        status: 200,
        data: result
      })
    })
  }
})
// 增加歌曲播放量
router.patch('/addPlayCount', (req, res) => {
  const songId = req.body.song_id
  addSongPlayCount(songId)
    .then(() => {
      res.send({
        status: 200,
        message: '添加成功'
      })
    })
    .catch((err) => {
      console.log(err.message)
      res.send({
        status: 400,
        message: '添加失败'
      })
    })
})

// 暂时无用
router.get('/song/allSongInfo', (req, res) => {
  queryAllSong()
    .then((songs) => {
      let my_res = []
      Promise.all(
        songs.map((song) => {
          return querySingerById(song.singer_id)
            .then((sing) => {
              delete song.singer_id
              if (song.song_playCount === null) song.song_playCount = 0
              my_res.push({
                ...song,
                singer_name: sing.singer_name
              })
            })
            .catch((error) => {
              console.log(error.message)
              res.send({
                status: 500,
                message: '请求失败'
              })
            })
        })
      ).then(() => {
        res.send({
          status: 200,
          data: my_res.sort((a, b) => a.song_id - b.song_id)
        })
      })
    })
    .catch(() => {
      res.send({
        status: 400,
        message: '查询失败'
      })
    })
})

// 歌手模块路由
// 获取对应 id 歌手信息
router.post('/singerInfo', (req, res) => {
  const { id, pageNumber, pageSize } = req.body
  if (id && pageNumber && pageSize) {
    querySingerById(id).then((result) => {
      querySongBySingerId(id, pageSize, pageNumber).then((result1) => {
        res.send({
          status: 200,
          data: { ...result, ...result1 }
        })
      })
    })
  } else {
    res.send({
      status: 400,
      message: '缺少查询条件'
    })
  }
})
// 获取歌手页面的数据
router.post('/singAllInfo', (req, res) => {
  const { letter, pageNumber, pageSize, not } = req.body.data
  if (pageNumber && pageSize) {
    querySingerByLetter(letter, pageNumber, pageSize, not).then((result) => {
      res.send({
        status: 200,
        data: result
      })
    })
  } else {
    res.send({
      status: 400,
      message: '缺少查询条件'
    })
  }
})

/* 排行榜 */
router.get('/charts', (req, res) => {
  queryCharts()
    .then((charts) => {
      let my_res = []
      Promise.all(
        charts.map(async (item) => {
          const chartsItem = await queryChartsItemById(item.chart_id)
          delete chartsItem.map((item) => delete item.chart_id)
          my_res.push({ ...item, chartItem: chartsItem })
        })
      )
        .then(() => {
          res.send({
            status: 200,
            data: my_res.sort((a, b) => a.chart_id - b.chart_id)
          })
        })
        .catch((err) => {
          console.log(err.message)
          res.send({
            status: 500,
            message: '请求失败'
          })
        })
    })
    .catch(() => {
      res.send({
        status: 500,
        message: '请求失败'
      })
    })
})
router.get('/chart/newSong', (req, res) => {
  queryNewSong().then((songs) => {
    let my_res = []
    Promise.all(
      songs.map((song) => {
        return querySingerById(song.singer_id)
          .then((sing) => {
            delete song.singer_id
            if (song.song_playCount === null) song.song_playCount = 0
            my_res.push({
              ...song,
              singer_name: sing.singer_name
            })
          })
          .catch((error) => {
            console.log(error.message)
            res.send({
              status: 500,
              message: '请求失败'
            })
          })
      })
    )
      .then(() => {
        res.send({
          status: 200,
          data: my_res.sort((a, b) => b.update_time - a.update_time)
        })
      })
      .catch((err) => {
        console.log(err.message)
        res.send({
          status: 500,
          message: '请求失败'
        })
      })
  })
})
router.get('/chart/hotSong', (req, res) => {
  queryHotSong().then((songs) => {
    let my_res = []
    Promise.all(
      songs.map((song) => {
        return querySingerById(song.singer_id)
          .then((sing) => {
            delete song.singer_id
            if (song.song_playCount === null) song.song_playCount = 0
            my_res.push({
              ...song,
              singer_name: sing.singer_name
            })
          })
          .catch((error) => {
            console.log(error.message)
            res.send({
              status: 500,
              message: '请求失败'
            })
          })
      })
    )
      .then(() => {
        res.send({
          status: 200,
          data: my_res.sort((a, b) => b.song_playCount - a.song_playCount)
        })
      })
      .catch((err) => {
        console.log(err.message)
        res.send({
          status: 500,
          message: '请求失败'
        })
      })
  })
})
router.get('/chart/chinese', (req, res) => {
  queryChineseSong().then((songs) => {
    let my_res = []
    Promise.all(
      songs.map((song) => {
        return querySingerById(song.singer_id)
          .then((sing) => {
            delete song.singer_id
            if (song.song_playCount === null) song.song_playCount = 0
            my_res.push({
              ...song,
              singer_name: sing.singer_name
            })
          })
          .catch((error) => {
            console.log(error.message)
            res.send({
              status: 500,
              message: '请求失败'
            })
          })
      })
    )
      .then(() => {
        res.send({
          status: 200,
          data: my_res.sort((a, b) => b.song_playCount - a.song_playCount)
        })
      })
      .catch((err) => {
        console.log(err.message)
        res.send({
          status: 500,
          message: '请求失败'
        })
      })
  })
})
router.get('/chart/korean', (req, res) => {
  queryKoreanSong().then((songs) => {
    let my_res = []
    Promise.all(
      songs.map((song) => {
        return querySingerById(song.singer_id)
          .then((sing) => {
            delete song.singer_id
            if (song.song_playCount === null) song.song_playCount = 0
            my_res.push({
              ...song,
              singer_name: sing.singer_name
            })
          })
          .catch((error) => {
            console.log(error.message)
            res.send({
              status: 500,
              message: '请求失败'
            })
          })
      })
    )
      .then(() => {
        res.send({
          status: 200,
          data: my_res.sort((a, b) => b.update_time - a.update_time)
        })
      })
      .catch((err) => {
        console.log(err.message)
        res.send({
          status: 500,
          message: '请求失败'
        })
      })
  })
})
router.get('/chart/english', (req, res) => {
  queryEnglishSong().then((songs) => {
    let my_res = []
    Promise.all(
      songs.map((song) => {
        return querySingerById(song.singer_id)
          .then((sing) => {
            delete song.singer_id
            if (song.song_playCount === null) song.song_playCount = 0
            my_res.push({
              ...song,
              singer_name: sing.singer_name
            })
          })
          .catch((error) => {
            console.log(error.message)
            res.send({
              status: 500,
              message: '请求失败'
            })
          })
      })
    )
      .then(() => {
        res.send({
          status: 200,
          data: my_res.sort((a, b) => b.update_time - a.update_time)
        })
      })
      .catch((err) => {
        console.log(err.message)
        res.send({
          status: 500,
          message: '请求失败'
        })
      })
  })
})
router.get('/chart/japanese', (req, res) => {
  queryJapaneseSong().then((songs) => {
    let my_res = []
    Promise.all(
      songs.map((song) => {
        return querySingerById(song.singer_id)
          .then((sing) => {
            delete song.singer_id
            if (song.song_playCount === null) song.song_playCount = 0
            my_res.push({
              ...song,
              singer_name: sing.singer_name
            })
          })
          .catch((error) => {
            console.log(error.message)
            res.send({
              status: 500,
              message: '请求失败'
            })
          })
      })
    )
      .then(() => {
        res.send({
          status: 200,
          data: my_res.sort((a, b) => b.update_time - a.update_time)
        })
      })
      .catch((err) => {
        console.log(err.message)
        res.send({
          status: 500,
          message: '请求失败'
        })
      })
  })
})

// 歌单模块
// 获取所有的标签标题
router.get('/labelAllInfo', (req, res) => {
  queryAllLabel().then((result) => {
    res.send({
      status: 200,
      data: result
    })
  })
})
// 查询所有的歌单信息
router.get('/sheetAllInfo', (req, res) => {
  queryAllVisibleSheet().then(async (result) => {
    try {
      let my_res = await Promise.all(
        result.map(async (sheet) => {
          const labels = await querySheetLabelBySheetId(sheet.sheet_id)
          let labelsId = []
          if (labels) labelsId = labels.map((item) => item.labelItem_id)
          delete sheet.user_id
          delete sheet.sheet_visible
          delete sheet.state
          if (!sheet.sheet_playCount) sheet.sheet_playCount = 0
          if (!sheet.sheet_playCollention) sheet.sheet_playCollention = 0
          return {
            ...sheet,
            labelsId: labelsId
          }
        })
      )
      my_res.sort((a, b) => a.sheet_id - b.sheet_id)
      res.send({
        status: 200,
        data: my_res
      })
    } catch (error) {
      // 处理错误
      console.error(error)
      res.status(500).send({
        status: 500,
        message: '请求失败'
      })
    }
  })
})
// 更新歌单播放量
router.patch('/updateSheetPlayCount', (req, res) => {
  const sheet_id = req.body.sheet_id
  const playCount = req.body.playCount
  if (sheet_id) {
    updateSheetPlayCount(sheet_id, playCount).then(() => {
      res.send({
        status: 200,
        message: '更新成功'
      })
    })
  } else {
    res.send({
      status: 400,
      message: '缺少更新条件'
    })
  }
})
// 查询指定歌单信息
router.get('/sheetInfo', (req, res) => {
  const sheet_id = req.query.sheet_id
  if (sheet_id) {
    querySheetById(sheet_id).then((result) => {
      if (result === null) {
        res.send({
          status: 401,
          message: '歌单不存在'
        })
        return
      } else if (+result.sheet_visible === 0) {
        res.send({
          status: 401,
          message: '歌单不可见'
        })
        return
      }
      querySheetLabelBySheetId(result.sheet_id).then(async (labelsItemId) => {
        // 标签名称
        let labelsName = ['暂无']
        if (labelsItemId) {
          const name = await Promise.all(
            labelsItemId.map((item) => {
              return queryLabelItemName(item.labelItem_id)
            })
          )
          labelsName = name.map((item) => {
            return item[0].labelItem_name
          })
        }
        // 用户信息
        const user = await quseryUserInfo(result.user_id)
        // 校正字段
        delete result.user_id
        delete result.sheet_visible
        delete result.state
        delete user.user_id
        delete user.user_password
        delete user.user_email
        delete user.user_picSrc
        if (result.sheet_playCollention === null)
          result.sheet_playCollention = 0
        if (result.sheet_playCount === null) result.sheet_playCount = 0
        res.send({
          status: 200,
          data: { ...result, labelsName: labelsName, user: user }
        })
      })
    })
  } else {
    res.send({
      status: 401,
      message: '缺少歌单id'
    })
  }
})
// 查询指定歌单歌曲
router.post('/sheetSong', (req, res) => {
  const { sheet_id, pageSize, pageNumber } = req.body
  querySheetSongsId(sheet_id, pageSize, pageNumber)
    .then(async (songsId) => {
      if (!songsId) {
        res.send({
          status: 200,
          message: '该歌单无歌曲'
        })
        return
      }
      const songs = await Promise.all(
        songsId.map(async (item) => {
          const song = await querySongById(item.song_id)
          const singer = await querySingerById(song.singer_id)
          return { ...song, ...singer }
          // ...querySingerById(item.singer_id)
        })
      )
      // 对 songs 数组根据 song_id 进行排序
      songs.sort((a, b) => {
        return a.song_id - b.song_id
      })
      const total = await querySheetSongsNumber(sheet_id)
      res.send({
        status: 200,
        total,
        data: songs
      })
    })
    .catch((err) => {
      console.error(err)
      res.status(500).send({
        status: 500,
        message: '请求失败'
      })
    })
})

// 向外导出路由对象
export default router
