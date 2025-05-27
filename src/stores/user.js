// 用户状态管理
import { defineStore } from 'pinia'

import { supabase, adminClient } from '@/lib/supabase'

// 用户状态管理存储
export const useUserStore = defineStore('user', {
  // 状态定义
  state: () => ({
    user: null, // 当前用户信息
    role: null, // 用户角色
    loading: false, // 加载状态
    error: null // 错误信息
  }),

  // 计算属性
  getters: {
    isAuthenticated: (state) => !!state.user, // 是否已认证
    isAdmin: (state) => state.role === 'admin' // 是否是管理员
  },

  // 操作方法
  actions: {
    // 初始化用户状态
    async init() {
      try {
        const {
          data: { user }
        } = await supabase.auth.getUser()
        this.user = user
      } catch (error) {
        console.error('Error initializing user:', error)
        this.error = error.message
      }
    },

    // 获取用户信息
    async fetchUser() {
      try {
        this.loading = true
        this.error = null

        // 获取当前会话
        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession()
        if (sessionError) {
          console.error('获取会话失败:', sessionError)
          this.error = '获取会话失败'
          return
        }

        if (!session) {
          this.user = null
          this.role = null
          return
        }

        // 获取用户信息
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser()
        if (userError) {
          console.error('获取用户信息失败:', userError)
          this.error = '获取用户信息失败'
          return
        }

        if (user) {
          this.user = user
          // 获取用户角色
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle()

          if (roleError) {
            console.error('获取用户角色失败:', roleError)
            this.error = '获取用户角色失败'
            return
          }

          // 如果没有角色数据，创建默认用户角色
          if (!roleData) {
            const { error: insertError } = await supabase.from('user_roles').insert([
              {
                id: session.user.id,
                role: 'user'
              }
            ])

            if (insertError) {
              console.error('创建用户角色失败:', insertError)
              this.error = '创建用户角色失败'
              return
            }

            this.role = 'user'
          } else {
            this.role = roleData.role
          }
        }
      } catch (error) {
        console.error('获取用户信息时发生错误:', error)
        this.error = error.message
        // 如果是会话错误，清除用户状态
        if (error.message.includes('Auth session missing')) {
          this.user = null
          this.role = null
        }
      } finally {
        this.loading = false
      }
    },

    // 用户登录
    async signIn(email, password) {
      this.loading = true
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        this.user = data.user
        await this.fetchUser() // 获取完整的用户信息，包括角色
        return { success: true }
      } catch (error) {
        console.error('Error signing in:', error)
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // 用户注册
    async signUp(email, password) {
      try {
        this.loading = true
        this.error = null

        // 检查是否是第一个用户（第一个用户自动成为管理员）
        const { count, error: countError } = await adminClient
          .from('user_roles')
          .select('*', { count: 'exact', head: true })

        if (countError) {
          console.error('检查用户数量失败:', countError)
          throw countError
        }

        const isFirstUser = count === 0

        // 注册新用户
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              email_confirmed: false
            }
          }
        })

        if (error) {
          console.error('注册失败:', error)
          throw error
        }

        // 创建用户角色（第一个用户为管理员，其他为普通用户）
        const { error: roleError } = await adminClient.from('user_roles').insert([
          {
            id: data.user.id,
            role: isFirstUser ? 'admin' : 'user'
          }
        ])

        if (roleError) {
          console.error('创建用户角色失败:', roleError)
          throw roleError
        }

        return { success: true }
      } catch (error) {
        console.error('注册失败:', error)
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    // 用户登出
    async signOut() {
      try {
        await supabase.auth.signOut()
        this.user = null
        this.role = null
      } catch (error) {
        console.error('Error signing out:', error)
        this.error = error.message
      }
    },

    // 重置密码
    async resetPassword(email) {
      try {
        this.loading = true
        this.error = null

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?type=recovery`
        })

        if (error) {
          console.error('重置密码失败:', error)
          throw error
        }

        return { success: true }
      } catch (error) {
        console.error('重置密码失败:', error)
        this.error = error.message
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    }
  }
})
