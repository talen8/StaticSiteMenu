<template>
  <div
    class="min-h-screen bg-[#f7f9fe] dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          设置新密码
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">请输入您的新密码</p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="password" class="sr-only">新密码</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-800"
              placeholder="新密码"
            />
          </div>
          <div>
            <label for="confirmPassword" class="sr-only">确认新密码</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-800"
              placeholder="确认新密码"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg
                class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
            {{ loading ? '处理中...' : '重置密码' }}
          </button>
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center">
          {{ error }}
        </div>

        <div v-if="success" class="text-green-500 text-sm text-center">
          密码重置成功！正在跳转到登录页面...
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

import { supabase } from '@/lib/supabase'

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const isFormValid = computed(
  () =>
    password.value &&
    confirmPassword.value &&
    password.value === confirmPassword.value &&
    password.value.length >= 6
)

let authListener = null

onMounted(async () => {
  try {
    if (sessionStorage.getItem('is_password_reset') !== 'true') {
      throw new Error('无效的重置密码链接')
    }

    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()
    if (sessionError || !session) {
      throw new Error('重置密码链接已失效，请重新申请')
    }
  } catch (err) {
    error.value = err.message
  }
})

onUnmounted(() => {
  authListener?.data.subscription.unsubscribe()
})

const handleSubmit = async () => {
  if (!isFormValid.value) {
    error.value = '请确保密码长度至少为6位，且两次输入的密码一致'
    return
  }

  try {
    loading.value = true
    error.value = ''
    success.value = false

    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()
    if (sessionError || !session) throw new Error('重置密码链接已失效，请重新申请')

    const { error: updateError } = await supabase.auth.updateUser({
      password: password.value
    })
    if (updateError) throw updateError

    sessionStorage.removeItem('is_password_reset')
    success.value = true
    await supabase.auth.signOut()
    // 只有在成功重置密码后才跳转到登录页面
    window.location.href = '/auth/login'
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
