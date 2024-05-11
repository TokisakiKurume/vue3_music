import { createRouter, createWebHistory } from 'vue-router'
import { getVerifyToken } from '@/api/user'
import { useUserStore } from '@/stores'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/music/index' },
    { path: '/music', redirect: '/music/index' },
    { path: '/login', component: () => import('@/views/login/LoginPage.vue') },
    { path: '/VIP', component: () => import('@/views/vip/index.vue') },
    {
      path: '/song_detail',
      component: () => import('@/views/music/songDetail.vue')
    },
    {
      path: '/music',
      component: () => import('@/views/layout/Layout.vue'),
      children: [
        {
          path: '',
          component: () => import('@/views/music/LayoutContainer.vue'),
          children: [
            {
              path: '/music/singer',
              component: () => import('@/views/music/singer.vue')
            },
            {
              path: '/music/index',
              component: () => import('@/views/music/index.vue')
            },
            {
              path: '/music/sheet',
              component: () => import('@/views/music/sheet.vue')
            },
            {
              path: '/music/charts',
              component: () => import('@/views/music/charts.vue')
            },
            {
              path: '/music/singer/singer_detail/:id',
              component: () => import('@/views/music/singerDetail.vue')
            },
            {
              path: '/music/sheet/sheet_detail/:id',
              component: () => import('@/views/music/sheetDetail.vue')
            }
          ]
        },
        {
          path: '/music/search/:string?',
          component: () => import('@/views/layout/searchDetail.vue')
        },
        {
          path: '/mymusic',
          component: () => import('@/views/mymusic/index.vue'),
          redirect: '/mymusic/like',
          children: [
            {
              path: '/mymusic/like',
              component: () =>
                import('@/views/mymusic/like/LayoutContainer.vue'),
              redirect: '/mymusic/like/song',
              children: [
                {
                  path: '/mymusic/like/song',
                  component: () => import('@/views/mymusic/like/song.vue')
                },
                {
                  path: '/mymusic/like/sheet',
                  component: () => import('@/views/mymusic/like/sheet.vue')
                }
              ]
            },
            {
              path: '/mymusic/create',
              component: () => import('@/views/mymusic/create/index.vue')
            }
          ]
        },
        {
          path: '/mymusic/sheet_edit/:id?',
          component: () => import('@/views/mymusic/sheetEdit.vue')
        }
      ]
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore() // 获取用户存储库实例

  // 在路由导航发生前执行一些逻辑
  if (to.path.startsWith('/mymusic')) {
    try {
      if (userStore.token) {
        await getVerifyToken() // 获取验证 token 的响应
      } else {
        ElMessage.error('请登陆后进入')
        next('/music') // 跳转到首页
      }
      // 如果验证通过，则继续路由导航
      next()
    } catch (error) {
      console.error(error) // 处理验证失败的情况，例如跳转到登录页等
      // 如果验证失败，你可以选择跳转到登录页或者其他页面
      next('/login') // 跳转到登录页
    }
  } else {
    // 如果用户没有 token 或者访问的路径不是以 'mylike' 开头，则直接继续路由导航
    next()
  }
})

export default router
