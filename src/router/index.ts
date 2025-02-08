import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import storage from '../utils/storage'

// 修改元数据类型定义
type RouteMeta = {
  requiresAuth?: boolean;
  title?: string;
  [key: string | symbol]: unknown;
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: {
      title: '首页'
    } satisfies RouteMeta
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('../views/ChatView.vue'),
    meta: {
      requiresAuth: true,
      title: '对话 - iChat'
    } satisfies RouteMeta
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue'),
    meta: {
      title: '设置 - iChat'
    } satisfies RouteMeta
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue') // 动态导入
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/ChatView.vue') // 动态导入
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue') // 动态导入
    }
  ]
})

router.beforeEach((to, from, next) => {
  // 添加路由错误处理
  if (to.matched.length === 0) {
    next({ name: 'home' })
    return
  }

  // 检查 API 配置
  const apiKey = storage.getApiKey()
  const apiUrl = storage.getApiUrl()

  if (!apiKey || !apiUrl) {
    if (to.name !== 'settings') {
      next({ name: 'settings' })
      return
    }
  }

  document.title = (to.meta.title as string) || 'iChat'
  next()
})

export default router
