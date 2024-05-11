import request from '@/utils/request'

// 登录--用户账密验证
export const loginUser = (data) => request.post('/my/login', data)

// 用户--更新头像
export const updateAvatar = (data) => request.patch('/my/avatar', data)

// 用户--获取用户信息
export const getUserInfo = () => request.get('/my/userInfo')

// 用户--更新用户密码
export const updateUserPassword = (data) => request.patch('/my/password', data)

// 用户--更新用户信息
export const updateUserInfo = (data) => request.put('/my/userInfo', data)

// 用户-- token 是否失效
export const getVerifyToken = () => request.get('/my/verifyToken')

// 用户--喜欢的歌曲
export const getUserLikeSong = () => request.get('/my/userLikeSong')
