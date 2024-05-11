import express from 'express'
const app = express()

// session认证 npm i express-session 用于服务器端渲染页面
import session from 'express-session'
app.use(
  session({
    secret: 'itheima',
    resave: false,
    saveUninitialized: true
  })
)
// 可以使用 req.session 来设置和获取对应属性值

// jwt认证 npm i express-jwt jsonwebtoken 用于前后端分离模式
// jsonwebtoken 用于生成JWT字符串
// express-jwt 将JWT字符串解析还原成json对象
import jwt from 'jsonwebtoken'
import expressJwt from 'express-jwt'
const secretKey = 'liuxuyao No2 ^_^!' // 密钥定义
// 信息对象，密钥，配置对象（token有效期）
const tokenStr = jwt.sign({}, secretKey, { expiresIn: '24h' })

/*********************************/
console.log(tokenStr)
/*********************************/

// 解密钥  unless中配置无需访问权限的路由
app.use(expressJwt({ secret: secretKey })).unless({ path: [] })

// 错误中间件
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.send({
      status: 401,
      message: '无效的token'
    })
  }
  res.send({
    status: 500,
    message: '未知错误'
  })
  next()
})
