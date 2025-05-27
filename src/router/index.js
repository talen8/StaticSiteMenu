// 路由配置文件
import { createRouter, createWebHistory } from 'vue-router'

import { useUserStore } from '@/stores/user'

// 定义路由配置
const routes = [
  // 公共页面路由
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  {
    path: '/friends',
    name: 'Friends',
    component: () => import('../views/Friends.vue')
  },
  // 认证相关路由
  {
    path: '/auth/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/auth/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/auth/ForgotPassword.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/auth/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/auth/ResetPassword.vue'),
    meta: { requiresGuest: true, allowResetPassword: true }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('@/views/auth/AuthCallback.vue')
  },
  // 用户相关路由
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  // 管理后台路由
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/admin/Dashboard.vue')
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('../views/admin/Categories.vue')
      },
      {
        path: 'sites',
        name: 'Sites',
        component: () => import('../views/admin/Sites.vue')
      },
      {
        path: 'tags',
        name: 'Tags',
        component: () => import('../views/admin/Tags.vue')
      },
      {
        path: 'friend-links',
        name: 'FriendLinks',
        component: () => import('@/views/admin/FriendLinks.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/admin/Users.vue')
      }
    ]
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // 确保用户信息已加载
  if (!userStore.user && !userStore.loading) {
    await userStore.fetchUser()
  }

  // 管理员权限检查
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next('/')
    return
  }

  // 登录状态检查
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/auth/login')
    return
  }

  // 游客页面访问控制
  if (to.meta.requiresGuest && userStore.isAuthenticated && !to.meta.allowResetPassword) {
    next('/')
    return
  }

  next()
})

export default router
