import axios from 'axios'
import { useUserStore } from '@/stores'

const baseURL = 'http://localhost:3000'

const instance = axios.create({
  // TODO 1. 基础地址，超时时间
  baseURL,
  timeout: 10000
})

// 添加请求拦截器
instance.interceptors.request.use(
  (config) => {
    // TODO 2. 携带token
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = userStore.token
    }
    return config
  },
  (err) => Promise.reject(err)
)

// 添加响应拦截器
instance.interceptors.response.use(
  async (res) => {
    // TODO 3. 处理业务失败
    // TODO 4. 摘取核心响应数据
    if (res.data && (res.data.status === 200 || Array.isArray(res.data))) {
      return res
    }
    // 处理业务失败
    ElMessage.error(res.data.message || '服务异常')
    if (res.data.message === '无效的token') {
      const userStore = useUserStore()
      userStore.removeToken()
      userStore.setUser({})
      userStore.setLikeSongsId([])
      userStore.setCreatedPlaylist([])
      window.location.reload()
    }
    return Promise.reject(res.data)
  },
  async (err) => {
    // TODO 5. 处理401错误

    // 错误的默认情况 => 只要给提示
    await ElMessage.error(err.response?.data.message || '服务异常')
    // 错误的特殊情况 => 401 权限不足 或 token 过期 => 拦截到登录
    if (err?.data?.data?.status === 401) {
      const userStore = useUserStore()
      userStore.removeToken()
      userStore.setUser({})
      userStore.setLikeSongsId([])
    }
    return Promise.reject(err)
  }
)

export default instance
export { baseURL }
