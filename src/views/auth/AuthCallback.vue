<template>
  <div
    class="min-h-screen bg-[#f7f9fe] dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          {{ loading ? '处理中...' : title }}
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {{ message }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)
const title = ref('')
const message = ref('')

onMounted(async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const isPasswordReset =
      urlParams.get('type') === 'recovery' || hashParams.get('type') === 'recovery'

    if (isPasswordReset) {
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })

        if (sessionError) throw sessionError

        sessionStorage.setItem('is_password_reset', 'true')
        title.value = '密码重置'
        message.value = '正在跳转到密码重置页面...'
        router.replace('/auth/reset-password')
        return
      }
    }

    const {
      data: { session },
      error
    } = await supabase.auth.getSession()
    if (error) throw error

    if (session) {
      await userStore.fetchUser()
      title.value = '邮箱验证成功'
      message.value = '正在跳转到登录页面...'
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } else {
      title.value = '验证失败'
      message.value = '请重新尝试或联系管理员'
    }
  } catch (error) {
    console.error('认证回调处理失败:', error)
    title.value = '发生错误'
    message.value = error.message
  } finally {
    loading.value = false
  }
})
</script>
