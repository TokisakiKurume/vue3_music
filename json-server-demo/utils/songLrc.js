import http from 'http'

// 创建获取 lrc 数据的函数
const getModifiedLrc = (lrcUrl) => {
  // 返回一个 Promise 对象，用于处理异步操作
  return new Promise((resolve, reject) => {
    // 创建 HTTP 请求
    const request = http.get(lrcUrl, (response) => {
      let data = ''
      // 接收数据
      response.on('data', (chunk) => {
        data += chunk
      })
      // 数据接收完成
      response.on('end', () => {
        // 将数据按行分割成数组
        const lines = data.split('\n')
        // 删除第一行
        if (lines[0].trim() === '[00:00.00]欢迎来访爱听音乐网 www.2t58.com')
          lines.shift()
        // 重新组合剩余的行
        const modifiedData = lines.join('\n')
        // 将修改后的数据传递给 resolve 函数
        resolve(modifiedData)
        // resolve(data)
      })
    })

    // 处理请求错误
    request.on('error', (error) => {
      // 如果请求出错，将错误信息传递给 reject 函数
      reject(error)
    })
  })
}

// 导出函数
export default getModifiedLrc
