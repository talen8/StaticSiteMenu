<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Header />
    <Banner
      title="个人中心"
      bg="https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80"
    />

    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- 加载状态 -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"
          ></div>
        </div>

        <!-- 个人信息卡片 -->
        <div
          v-else-if="userStore.user"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden dark:shadow-[-2px_5px_15px_-5px_rgba(255,255,255,0.1)]"
        >
          <!-- 顶部背景 -->
          <div
            class="h-32 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30"
          ></div>

          <!-- 个人信息内容 -->
          <div class="px-6 pb-6">
            <!-- 头像和基本信息 -->
            <div class="flex flex-col sm:flex-row items-center -mt-16">
              <div class="relative">
                <div
                  class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center overflow-hidden"
                >
                  <img
                    v-if="userStore.user.user_metadata?.avatar_url"
                    :src="userStore.user.user_metadata.avatar_url"
                    :alt="userStore.user.user_metadata?.username || '用户头像'"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-4xl font-bold text-gray-600 dark:text-gray-400">{{
                    userInitials
                  }}</span>
                </div>
                <button
                  class="absolute bottom-0 right-0 bg-blue-500 dark:bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                  @click="handleAvatarClick"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                    />
                  </svg>
                </button>
                <input
                  ref="avatarInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarChange"
                />
              </div>
              <div class="mt-4 sm:mt-0 sm:ml-8 text-center sm:text-left">
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
                  {{ userStore.user.user_metadata?.username || '未设置用户名' }}
                </h2>
                <p class="text-gray-600 dark:text-gray-400">{{ userStore.user.email }}</p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                  >
                    {{ roleLabels[userStore.role] || '普通用户' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 详细信息 -->
            <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- 账户信息 -->
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">账户信息</h3>
                <div class="space-y-3">
                  <div class="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <div>
                      <p class="text-sm text-gray-500 dark:text-gray-400">注册时间</p>
                      <p class="font-medium text-gray-900 dark:text-gray-200">
                        {{ formatDate(userStore.user.created_at) }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 4.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V4.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 011-1z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <div>
                      <p class="text-sm text-gray-500 dark:text-gray-400">最后登录</p>
                      <p class="font-medium text-gray-900 dark:text-gray-200">
                        {{ formatDate(userStore.user.last_sign_in_at) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 安全设置 -->
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">安全设置</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      <div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white">登录密码</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                          定期更换密码可以保护账号安全
                        </p>
                      </div>
                    </div>
                    <button
                      class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      @click="handlePasswordChange"
                    >
                      修改
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="mt-8 flex justify-end">
              <button
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                @click="handleProfileEdit"
              >
                编辑资料
              </button>
            </div>
          </div>
        </div>

        <!-- 未登录状态 -->
        <div v-else class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">请先登录以查看个人信息</p>
        </div>
      </div>
    </div>

    <FloatingTools />
    <Footer />

    <!-- 编辑资料弹窗 -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">编辑个人资料</h3>
          <button
            class="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            @click="closeEditModal"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="handleProfileSave">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">用户名</label>
            <input
              v-model="editForm.username"
              type="text"
              class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">邮箱</label>
            <input
              v-model="editForm.email"
              type="email"
              class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
              disabled
            />
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">邮箱地址不可修改</p>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
              @click="closeEditModal"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="loading"
            >
              <i class="fas" :class="loading ? 'fa-spinner fa-spin' : ''"></i>
              <span>{{ loading ? '保存中...' : '保存' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 修改密码弹窗 -->
    <div
      v-if="showPasswordModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">修改密码</h3>
          <button
            class="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            @click="closePasswordModal"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="handlePasswordSave">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >当前密码</label
            >
            <input
              v-model="passwordForm.currentPassword"
              type="password"
              class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">新密码</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
              minlength="6"
            />
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">密码长度至少6位</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >确认新密码</label
            >
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
              @click="closePasswordModal"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="loading"
            >
              <i class="fas" :class="loading ? 'fa-spinner fa-spin' : ''"></i>
              <span>{{ loading ? '保存中...' : '保存' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import Banner from '@/components/Banner.vue'
import FloatingTools from '@/components/FloatingTools.vue'
import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import { userApi } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const avatarInput = ref(null)
const loading = ref(true)
const showEditModal = ref(false)
const showPasswordModal = ref(false)
const editForm = ref({
  username: '',
  email: ''
})
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 角色标签
const roleLabels = {
  admin: '管理员',
  user: '普通用户'
}

// 计算用户首字母
const userInitials = computed(() => {
  return userStore.user?.user_metadata?.username?.charAt(0) || '?'
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 处理头像点击
const handleAvatarClick = () => {
  avatarInput.value.click()
}

// 处理头像变更
const handleAvatarChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    loading.value = true
    await userApi.uploadAvatar(userStore.user.id, file)
    // 更新用户状态
    await userStore.fetchUser()
  } catch (error) {
    console.error('上传头像失败:', error)
    // TODO: 显示错误提示
  } finally {
    loading.value = false
  }
}

// 处理密码修改
const handlePasswordChange = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  showPasswordModal.value = true
}

// 关闭密码修改弹窗
const closePasswordModal = () => {
  showPasswordModal.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

// 保存新密码
const handlePasswordSave = async () => {
  try {
    // 验证新密码
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      alert('两次输入的新密码不一致')
      return
    }

    if (passwordForm.value.newPassword.length < 6) {
      alert('新密码长度至少6位')
      return
    }

    loading.value = true

    // 更新密码
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.value.newPassword
    })

    if (error) throw error

    alert('密码修改成功')
    closePasswordModal()
  } catch (error) {
    console.error('修改密码失败:', error)
    alert(error.message || '修改密码失败')
  } finally {
    loading.value = false
  }
}

// 处理资料编辑
const handleProfileEdit = () => {
  editForm.value = {
    username: userStore.user.user_metadata?.username || '',
    email: userStore.user.email || ''
  }
  showEditModal.value = true
}

// 关闭编辑弹窗
const closeEditModal = () => {
  showEditModal.value = false
  editForm.value = {
    username: '',
    email: ''
  }
}

// 保存个人资料
const handleProfileSave = async () => {
  try {
    loading.value = true
    await userApi.updateUser(userStore.user.id, {
      username: editForm.value.username
    })
    await userStore.fetchUser()
    closeEditModal()
  } catch (error) {
    console.error('保存个人资料失败:', error)
    // TODO: 显示错误提示
  } finally {
    loading.value = false
  }
}

// 获取用户信息
onMounted(async () => {
  try {
    if (!userStore.user) {
      await userStore.init()
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
  } finally {
    loading.value = false
  }
})
</script>
