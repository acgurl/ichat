import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, RouteLocationNormalized } from 'vue-router'
import storage from '../utils/storage'

interface RouteMeta {
  requiresAuth?: boolean;
  title?: string;
}

// 使用 type 注解
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: {
      title: '首页 - iChat'
    }
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('../views/ChatView.vue'),
    meta: { 
      requiresAuth: true,
      title: '对话 - iChat'
    } as RouteMeta
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue'),
    meta: {
      title: '设置 - iChat'
    }
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
