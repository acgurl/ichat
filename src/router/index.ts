import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, RouteLocationNormalized } from 'vue-router'
import storage from '../utils/storage'

interface RouteMeta {
  requiresAuth?: boolean;
}

// 使用 type 注解
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('../views/ChatView.vue'),
    meta: { requiresAuth: true } as RouteMeta
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue')
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
    next()
  }
})

export default router
