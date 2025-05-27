<template>
  <div
    class="min-h-screen bg-[#f7f9fe] dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          {{ isLogin ? '登录您的账号' : '注册新账号' }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          或者
          <router-link
            :to="isLogin ? '/auth/register' : '/auth/login'"
            class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            {{ isLogin ? '注册新账号' : '登录已有账号' }}
          </router-link>
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">邮箱地址</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-800"
              placeholder="邮箱地址"
            />
          </div>
          <div>
            <label for="password" class="sr-only">密码</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-800"
              :class="{ 'rounded-b-md': isLogin }"
              placeholder="密码"
            />
          </div>
          <div v-if="!isLogin">
            <label for="confirmPassword" class="sr-only">确认密码</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-800"
              placeholder="确认密码"
            />
          </div>
        </div>

        <div v-if="isLogin" class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="rememberMe"
              name="remember-me"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              记住我
            </label>
          </div>

          <div class="text-sm">
            <router-link
              to="/auth/forgot-password"
              class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              忘记密码？
            </router-link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || (!isLogin && !isFormValid)"
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
                  :fill-rule="isLogin ? 'evenodd' : 'evenodd'"
                  :d="
                    isLogin
                      ? 'M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                      : 'M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
                  "
                  :clip-rule="isLogin ? 'evenodd' : 'evenodd'"
                />
              </svg>
            </span>
            {{ loading ? (isLogin ? '登录中...' : '注册中...') : isLogin ? '登录' : '注册' }}
          </button>
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center">
          {{ error }}
        </div>

        <div v-if="success && !isLogin" class="text-green-500 text-sm text-center">
          注册成功！请查收邮件完成验证。
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import { useUserStore } from '@/stores/user'

const props = defineProps({
  isLogin: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()
const userStore = useUserStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const rememberMe = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref(false)

const isFormValid = computed(() => {
  if (props.isLogin) return true
  return (
    email.value &&
    password.value &&
    confirmPassword.value &&
    password.value === confirmPassword.value &&
    password.value.length >= 6
  )
})

const handleSubmit = async () => {
  if (!props.isLogin && !isFormValid.value) {
    error.value = '请填写所有必填项，并确保密码长度至少为6位'
    return
  }

  try {
    loading.value = true
    error.value = ''
    success.value = false

    if (props.isLogin) {
      const { success: signInSuccess, error: signInError } = await userStore.signIn(
        email.value,
        password.value
      )

      if (signInSuccess) {
        router.push('/')
      } else {
        error.value = signInError
      }
    } else {
      const { success: signUpSuccess, error: signUpError } = await userStore.signUp(
        email.value,
        password.value
      )

      if (signUpSuccess) {
        success.value = true
        // 清空表单
        email.value = ''
        password.value = ''
        confirmPassword.value = ''
      } else {
        error.value = signUpError
      }
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
