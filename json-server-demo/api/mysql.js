import formatTime from '../utils/songTime.js'
import pinyin from '../utils/pinyin.js'
// 导入mysql模块
import mysql from 'mysql'
// 建立与数据库的连接
// 服务器数据库
const db = mysql.createPool({
  host: '122.152.215.30',
  user: 'root',
  password: '7b45fae31f0fdcbe',
  database: 'vue3_music'
})

// // 本地数据库
// const db = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: 'root',
//   database: 'vue3_music'
// })

// 测试连接是否成功
// db.query('select 1', (err, result) => {
//   if (err) { console.log.error(err) }
//   else { console.log(result) }
// })

// 测试
// const str = 'select * from users'
// db.query(str, (err, result) => {
//   console.log(result)
//   // 插入、更新、删除数据时可以用 result.affectedRow 是否等于一判断插入是否成功
//   console.log(result.affectedRow)
// })

// 用户表操作
export const queryUserThrough = (username, password) => {
  return new Promise((resolve, reject) => {
    db.query(
      'select user_password from users where user_name=?',
      username,
      (err, result) => {
        if (err) return reject(err)
        if (result.length === 0) return resolve(null) // 用户不存在
        const { user_password } = result[0]
        resolve(user_password === password)
      }
    )
  })
}
export const queryUserId = (username, password) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT user_id FROM users WHERE user_name=? and user_password=?',
      [username, password],
      (err, result) => {
        if (err) return reject(err)
        if (result.length === 0) return resolve(null) // 用户不存在
        const { user_id } = result[0]
        resolve(user_id)
      }
    )
  })
}
export const queryUserPassword = (userId) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT user_password FROM users WHERE user_id=?',
      userId,
      (err, result) => {
        if (err) return reject(err)
        if (result.length === 0) return resolve(null) // 用户不存在
        const { user_password } = result[0]
        resolve(user_password)
      }
    )
  })
}
export const quseryUserInfo = (userId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE user_id=?', userId, (err, result) => {
      if (err) return reject(err)
      if (result.length === 0) return resolve(null) // 用户不存在
      resolve(result[0])
    })
  })
}
export const updateUserInfo = (userId, nickname, email) => {
  return new Promise((resolve, reject) => {
    db.query(
      'UPDATE users SET user_nick=?, user_email=? WHERE user_id=?',
      [nickname, email, userId],
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}
export const updateUserPassword = (userId, password) => {
  return new Promise((resolve, reject) => {
    db.query(
      'UPDATE users SET user_password=? WHERE user_id=?',
      [password, userId],
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}
export const updateUserAvatar = (userId, avatar) => {
  return new Promise((resolve, reject) => {
    db.query(
      'UPDATE users SET user_picSrc=? WHERE user_id=?',
      [avatar, userId],
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}

// 歌曲操作
export const querySongById = (songId) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM songs WHERE song_id=?', songId, (err, result) => {
      if (err) return reject(err)
      if (result.length === 0) return resolve(null) // 用户不存在
      const { song_id, song_originSrc, song_time } = result[0]
      if (!song_time) {
        updateSongTimeById(song_id, song_originSrc)
          .then(() => {
            return formatTime(song_originSrc)
          })
          .then((time) => {
            result[0].song_time = time
            resolve(result[0])
          })
      } else {
        resolve(result[0]) // 如果已经有时长信息，则直接返回 result[0]
      }
    })
  })
}
const updateSongTimeById = (songId, songSrc) => {
  return new Promise((resolve, reject) => {
    formatTime(songSrc).then((time) => {
      db.query(
        'UPDATE songs SET song_time=? WHERE song_id=?',
        [time, songId],
        (err, result) => {
          if (err) return reject(err)
          resolve(result)
        }
      )
    })
  })
} // 调用 querySongById 自动触发该函数
export const querySongByLikeStr = (str, pageSize, pageNumber) => {
  return new Promise((resolve, reject) => {
    let sqlStrDb, sqlStrWhere, sqlParams
    if (str) {
      sqlStrDb =
        'SELECT songs.*, singers.singer_name FROM songs inner JOIN singers ON songs.singer_id = singers.singer_id WHERE song_name LIKE ? OR singer_name LIKE ? Limit ? OFFSET ?'
      sqlStrWhere = `FROM songs inner JOIN singers ON songs.singer_id = singers.singer_id WHERE song_name LIKE '%${str}%' OR singer_name LIKE '%${str}%'`
      sqlParams = [
        `%${str}%`,
        `%${str}%`,
        +pageSize,
        (pageNumber - 1) * pageSize
      ]
    } else {
      sqlStrDb = 'SELECT * FROM songs limit ? offset ?'
      sqlStrWhere = 'FROM songs'
      sqlParams = [+pageSize, (pageNumber - 1) * pageSize]
    }
    querySongNumberBySql(sqlStrWhere).then((number) => {
      db.query(sqlStrDb, sqlParams, (err, result) => {
        if (err) return reject(err)
        const my_res = { data: result, total: number }
        resolve(my_res)
      })
    })
  })
}
const querySongNumberBySql = (whereSqlStr) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT COUNT(*) ' + whereSqlStr, (err, result) => {
      if (err) return reject(err)
      resolve(result[0]['COUNT(*)'])
    })
  })
}
export const querySongBySingerId = (singerId, pageSize, pageNumber) => {
  return new Promise((resolve, reject) => {
    const sqlStrDb = 'SELECT * from songs where singer_id=? Limit ? OFFSET ?'
    const sqlStrWhere = `from songs WHERE singer_id = ${singerId}`
    querySongNumberBySql(sqlStrWhere).then((number) => {
      db.query(
        sqlStrDb,
        [singerId, +pageSize, (pageNumber - 1) * pageSize],
        async (err, result) => {
          if (err) return reject(err)
          const songAllinfo = await Promise.all(
            result.map(async (item) => {
              const singer = await querySingerById(item.singer_id)
              return { ...item, ...singer }
            })
          )
          const my_res = { data: songAllinfo, total: number }
          resolve(my_res)
        }
      )
    })
  })
}
export const queryUserLikeSongByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    const sqlStrDb = 'SELECT * FROM user_song WHERE user_id=?'
    db.query(sqlStrDb, userId, async (err, result) => {
      if (err) {
        return reject(err)
      }

      if (result.length === 0) {
        return resolve(null) // 用户不存在
      }

      // 获取用户喜欢的歌曲ID数组
      const songIds = result.map((userSong) => userSong.song_id)

      try {
        // 使用 Promise.all 将所有的歌曲信息查询请求并行执行
        const songsWithDetails = await Promise.all(songIds.map(querySongById))
        const result = await Promise.all(
          songsWithDetails.map(async (item) => {
            const singer = await querySingerById(item.singer_id)
            return { ...item, ...singer }
          })
        )
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })
  })
}
export const addUserLikeSong = (userId, songId) => {
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO user_song (user_id, song_id) VALUES (?,?)',
      [userId, songId],
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}
export const deltetUserLikeSong = (userId, songId) => {
  return new Promise((resolve, reject) => {
    db.query(
      'DELETE FROM user_song WHERE user_id=? AND song_id=?',
      [userId, songId],
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}
export const addSongToSheet = (songId, sheetId) => {
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO song_sheet (sheet_id, song_id) VALUES (?,?)',
      [sheetId, songId],
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}
export const checkSongToSheet = (songId, sheetId) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM song_sheet WHERE sheet_id=? AND song_id=?',
      [sheetId, songId],
      (err, result) => {
        if (err) return reject(err)
        resolve(result.length)
      }
    )
  })
}
export const addSongPlayCount = (songId) => {
  return new Promise((resolve, reject) => {
    db.query(
      'UPDATE songs SET song_playCount=IFNULL(song_playCount, 0) + 1 WHERE song_id=?',
      songId,
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}
export const queryAllSong = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM songs', (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

// 歌手操作
export const querySingerById = (singerId) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM singers WHERE singer_id=?',
      singerId,
      (err, result) => {
        if (err) return reject(err)
        if (result.length === 0) return resolve(null) // 用户不存在
        const { singer_name, singer_spell, singer_id } = result[0]
        if (!singer_spell) {
          updateSingerSpellById(singer_name, singer_id)
          result[0].singer_spell = pinyin(singer_name)
        }
        resolve(result[0])
      }
    )
  })
}
const updateSingerSpellById = (singerName, singerId) => {
  return new Promise((resolve, reject) => {
    const spell = pinyin(singerName)
    db.query(
      'UPDATE singers SET singer_spell=? WHERE singer_id=?',
      [spell, singerId],
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
} // 调用 querySingerById 自动触发该函数
export const querySingerByLetter = (
  letter,
  pageNumber,
  pageSize,
  not = null
) => {
  return new Promise((resolve, reject) => {
    let sqlStr = ''
    if (!letter) sqlStr = 'SELECT * FROM singers'
    else {
      const letterString = letter.map((char) => `'${char}'`).join(',')
      if (not) {
        sqlStr = `SELECT * FROM singers WHERE NOT SUBSTRING(singer_spell FROM 1 FOR 1) IN (${letterString})`
        not = 'not'
      } else {
        sqlStr = `SELECT * FROM singers WHERE SUBSTRING(singer_spell FROM 1 FOR 1) IN (${letterString})`
      }
    }
    queryTopSinger(sqlStr).then((top_result) => {
      const sqlStrNumber = sqlStr.substring(21)
      querySingerNumberBySql(sqlStrNumber).then((number) => {
        let sqlParams = [+pageSize, (pageNumber - 1) * pageSize + 8]
        let sqlQuery = sqlStr + ' LIMIT ? OFFSET ?'
        db.query(sqlQuery, sqlParams, (err, result) => {
          if (err) return reject(err)
          const combinedResult = {
            top_data: top_result,
            data: result,
            total: number - 8
          }
          resolve(combinedResult)
        })
      })
    })
  })
}
const queryTopSinger = (sqlStr) => {
  return new Promise((resolve, reject) => {
    db.query(sqlStr + ' limit 8', (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
} // 返回8个主要歌手
const querySingerNumberBySql = (whereSqlStr) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT COUNT(*) FROM singers' + whereSqlStr, (err, result) => {
      if (err) return reject(err)
      resolve(result[0]['COUNT(*)'])
    })
  })
} // 返回分页查询的总数量

// 获取全部分类标签
export const queryAllLabel = () => {
  return new Promise((resolve, reject) => {
    let my_res = []
    queryLabelAllDATA().then((number) => {
      // 使用 Promise.all 来处理并行异步操作
      const promises = []
      for (let i = 1; i < number.length + 1; i++) {
        const promise = queryLabelItemByMainLabelId(i).then((result) => {
          my_res.push({
            id: number[i - 1].label_id,
            title: number[i - 1].label_name,
            son_title: result
          })
        })
        promises.push(promise)
      }
      // 等待所有异步操作完成后再 resolve 结果
      Promise.all(promises)
        .then(() => {
          resolve(my_res)
        })
        .catch((error) => {
          // 处理查询所有标签失败的情况
          reject(error)
        })
    })
  })
}
const queryLabelAllDATA = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM labels', (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
} // 查询所有主标题
const queryLabelItemByMainLabelId = (labelId) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT labelItem_id, labelItem_name FROM label_item where label_id=?',
      labelId,
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
} // 根据主标题查询其余下的子标题
export const queryLabelItemName = (labelItemId) => {
  return new Promise((resolve, reject) => {
    const sqlStr = 'SELECT labelItem_name FROM label_item where labelItem_id=?'
    db.query(sqlStr, labelItemId, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

/* 排行榜 */
export const queryChartsItemById = (chartId) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM chart_item where chart_id=?',
      chartId,
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}
export const queryCharts = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM charts', (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}
export const queryNewSong = () => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM songs ORDER BY update_time desc limit 20',
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
} // 到歌曲表中查询时间进行排序
export const queryHotSong = () => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM songs ORDER BY song_playCount desc limit 20',
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
} // 到歌曲表中查询播放量进行排序
export const queryChineseSong = () => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM songs WHERE song_language="华语" ORDER BY song_playCount desc limit 20',
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}
export const queryKoreanSong = () => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM songs WHERE song_language="韩语" ORDER BY song_playCount desc limit 20',
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}
export const queryEnglishSong = () => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM songs WHERE song_language="英语" ORDER BY song_playCount desc limit 20',
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}
export const queryJapaneseSong = () => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM songs WHERE song_language="日语" ORDER BY song_playCount desc limit 20',
      (err, result) => {
        if (err) return reject(err)
        resolve(result)
      }
    )
  })
}

// 歌单操作
export const querySheetNumber = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT MAX(sheet_id) FROM sheets', (err, result) => {
      if (err) return reject(err)
      if (!result[0]['MAX(sheet_id)']) return resolve(0)
      resolve(result[0]['MAX(sheet_id)'])
    })
  })
}
export const addSheetAndLabel = (userId, sheetInfo, picSrc, sheetId) => {
  const { name, privacy, labelId } = sheetInfo
  const sheetVisible = privacy === 'true' ? 1 : 0 // 将布尔值转换为整数值
  let labelsId = null
  if (labelId) labelsId = labelId.split(',')
  return new Promise((resolve, reject) => {
    const sqlStr =
      'INSERT INTO sheets(sheet_name,sheet_picSrc,sheet_visible,user_id,state) values(?,?,?,?,1)'
    db.query(sqlStr, [name, picSrc, sheetVisible, userId], (err) => {
      if (err) {
        reject(err)
      } else {
        addSheetLabelRelation(labelsId, sheetId)
          .then(() => {
            resolve()
          })
          .catch((error) => {
            reject(error)
          })
      }
    })
  })
}
const addSheetLabelRelation = (labelsId, sheetId) => {
  return new Promise((resolve, reject) => {
    if (labelsId === null) {
      resolve('成功') // 显式调用 resolve() 来解决 Promise
    } else {
      const promises = labelsId.map((labelId) => {
        return new Promise((resolve, reject) => {
          const sqlStr =
            'insert into sheet_label_item (sheet_id, labelItem_id) values(?,?)'
          db.query(sqlStr, [sheetId, labelId], (error, result) => {
            if (error) {
              reject(error)
            } else {
              resolve(result)
            }
          })
        })
      })

      Promise.all(promises)
        .then((results) => {
          resolve(results)
        })
        .catch((error) => {
          reject(error)
        })
    }
  })
}
export const queryUserSheet = (userId, sheetId) => {
  return new Promise((resolve, reject) => {
    const sqlStr =
      'SELECT * FROM sheets WHERE user_id=? AND sheet_id=? AND state = 1'
    db.query(sqlStr, [userId, sheetId], (err, result) => {
      if (err) return reject(err)
      if (result.length === 0) return resolve(null)
      resolve(result)
    })
  })
} // 查询该歌单是否是该用户创建
export const querySheetById = (sheetId) => {
  return new Promise((resolve, reject) => {
    const sqlStr = 'SELECT * FROM sheets WHERE sheet_id=? AND state = 1'
    db.query(sqlStr, sheetId, (err, result) => {
      if (err) return reject(err)
      if (result.length === 0) return resolve(null)
      resolve(result[0])
    })
  })
}
export const querySheetLabelBySheetId = (sheetId) => {
  return new Promise((resolve, reject) => {
    const sqlStr = 'SELECT labelItem_id FROM sheet_label_item WHERE sheet_id=?'
    db.query(sqlStr, sheetId, (err, result) => {
      if (err) return reject(err)
      if (result.length === 0) return resolve(null)
      resolve(result)
    })
  })
}
export const querySheetStateBySheetId = (sheetId) => {
  return new Promise((resolve, reject) => {
    const sqlStr =
      'SELECT * FROM sheets WHERE sheet_id=? AND state=1 AND sheet_visible=1'
    db.query(sqlStr, sheetId, (err, result) => {
      if (err) return reject(err)
      if (result.length === 0) return resolve(null)
      if (result[0]['state'] === 0) return reject({ message: '歌单不存在' })
      resolve(result[0])
    })
  })
} // 检查歌单的开放权限
export const updateSheetInfo = (
  sheetId,
  sheetName,
  privacy,
  labelId,
  state,
  sheetPicsrc = null
) => {
  return new Promise((resolve, reject) => {
    const sheetVisible = privacy === 'true' ? 1 : 0 // 将布尔值转换为整数值
    const sqlParams = [sheetName, sheetVisible, state, sheetId]
    let sqlStr =
      'update sheets set sheet_name=?, sheet_visible=?, state=? where sheet_id=?'

    if (sheetPicsrc) {
      sqlParams.splice(1, 0, sheetPicsrc) // 在第二个位置插入 sheetPicsrc
      sqlStr =
        'update sheets set sheet_name=?, sheet_picSrc=?, sheet_visible=?, state=? where sheet_id=?'
    }

    deleteSheetLabelRelation(sheetId).then(() => {
      // 先删除对应关系表
      let labelsId = null
      if (labelId) labelsId = labelId.split(',')
      addSheetLabelRelation(labelsId, sheetId).then(() => {
        // 再建立标签关系表
        db.query(sqlStr, sqlParams, (err, result) => {
          // 最后更新歌单表
          if (err) return reject(err)
          if (result.length === 0) return resolve(null)
          resolve(result)
        })
      })
    })
  })
}
const deleteSheetLabelRelation = (sheetId) => {
  return new Promise((resolve, reject) => {
    const sqlStr = 'delete from sheet_label_item where sheet_id=?'
    db.query(sqlStr, sheetId, (err, result) => {
      if (err) return reject(err)
      if (result.length === 0) return resolve(null)
      resolve(result)
    })
  })
}
export const UserAllSheetInfo = (userId) => {
  return new Promise((resolve, reject) => {
    const sqlStr = 'SELECT * FROM sheets WHERE user_id=? AND state = 1'
    db.query(sqlStr, userId, (err, result) => {
      if (err) return reject(err)
      if (result.length === 0) return resolve(null)
      resolve(result)
    })
  })
}
export const deleteSheetById = (sheetId) => {
  return new Promise((resolve, reject) => {
    const sqlStr = 'UPDATE sheets SET state=0 WHERE sheet_id=?'
    db.query(sqlStr, sheetId, (err, result) => {
      if (err) return reject(err)
      if (result.length === 0) return resolve(null)
      resolve(result)
    })
  })
}
export const queryUserLikeSheetById = (userId) => {
  return new Promise((resolve, reject) => {
    const sqlStr = 'select sheet_id from user_sheet_like where user_id=?'
    db.query(sqlStr, userId, async (err, result) => {
      if (err) return reject(err)
      if (result.length === 0) return resolve(null)
      const sheetIds = result.map((item) => {
        return item['sheet_id']
      })
      try {
        let sheetInfos = []
        await Promise.all(
          sheetIds.map((sheetId) =>
            querySheetInfoBySheetId(sheetId).then((result) => {
              sheetInfos.push(result)
            })
          )
        )
        resolve(sheetInfos)
      } catch (error) {
        reject(error)
      }
    })
  })
}
const querySheetInfoBySheetId = (sheetId) => {
  return new Promise((resolve, reject) => {
    const sqlStr = 'SELECT * from sheets WHERE sheet_id=?'
    db.query(sqlStr, sheetId, (err, result) => {
      if (err) return reject(err)
      if (result.length === 0) return resolve(null)
      resolve(result[0])
    })
  })
}
export const deleteLikeSheet = (sheetId, userId) => {
  return new Promise((resolve, reject) => {
    const sqlStr = 'delete from user_sheet_like where sheet_id=? and user_id=?'
    db.query(sqlStr, [sheetId, userId], (err, result) => {
      if (err) return reject(err)
      if (result.length === 0) return resolve(null)
      resolve(result)
    })
  })
}
export const queryAllVisibleSheet = () => {
  return new Promise((resolve, reject) => {
    const sqlStr = 'SELECT * FROM sheets WHERE state = 1 AND sheet_visible = 1'
    db.query(sqlStr, (err, result) => {
      if (err) return reject(err)
      if (result.length === 0) return resolve(null)
      resolve(result)
    })
  })
}
export const updateSheetPlayCount = (sheetId, playCount) => {
  return new Promise((resolve, reject) => {
    const sqlStr = 'update sheets set sheet_playCount=? where sheet_id=?'
    db.query(sqlStr, [playCount, sheetId], (err, result) => {
      if (err) return reject(err)
      if (result.length === 0) return resolve(null)
      resolve(result)
    })
  })
}
export const querySheetSongsId = (sheetId, pageSize, pageNumber) => {
  return new Promise((resolve, reject) => {
    const sqlStr =
      'SELECT song_id FROM song_sheet WHERE sheet_id=? Limit ? offset ?'
    db.query(
      sqlStr,
      [sheetId, +pageSize, (pageNumber - 1) * pageSize],
      (err, result) => {
        if (err) return reject(err)
        if (result.length === 0) return resolve(null)
        resolve(result)
      }
    )
  })
}
export const querySheetSongsNumber = (sheetId) => {
  return new Promise((resolve, reject) => {
    const sqlStr = 'SELECT count(*) FROM song_sheet WHERE sheet_id=?'
    db.query(sqlStr, sheetId, (err, result) => {
      if (err) return reject(err)
      if (result.length === 0) return resolve(null)
      resolve(result[0]['count(*)'])
    })
  })
}
export const userIsLikeSheet = (sheetId, userId) => {
  return new Promise((resolve, reject) => {
    const sqlStr =
      'select * from user_sheet_like where sheet_id=? and user_id=?'
    db.query(sqlStr, [sheetId, userId], (err, result) => {
      if (err) return reject(err)
      if (result.length === 0) return resolve(false)
      resolve(true)
    })
  })
}
export const addUserLikeSheet = (sheetId, userId) => {
  return new Promise((resolve, reject) => {
    const sqlStr =
      'insert into user_sheet_like (sheet_id, user_id) values (?,?)'
    db.query(sqlStr, [sheetId, userId], (err, result) => {
      if (err) return reject(err)
      if (result.length === 0) return resolve(null)
      resolve(result)
    })
  })
}
export const deleteSheetSong = (sheetId, songId) => {
  return new Promise((resolve, reject) => {
    const sqlStr = 'delete from song_sheet where sheet_id=? and song_id=?'
    db.query(sqlStr, [sheetId, songId], (err, result) => {
      if (err) return reject(err)
      if (result.length === 0) return resolve(null)
      resolve(result)
    })
  })
}
