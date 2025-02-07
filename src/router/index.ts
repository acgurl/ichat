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
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = (to.meta as RouteMeta).requiresAuth
  if (requiresAuth && (!storage.getApiKey() || !storage.getApiUrl())) {
    next('/settings')
  } else {
    document.title = (to.meta.title as string) || 'iChat'
    next()
  }
})

export default router
