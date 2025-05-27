<script setup>
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'

import { supabase } from '../lib/supabase'
import { useConfigStore } from '../stores/config'
import { useUserStore } from '../stores/user'

// 初始化状态管理
const configStore = useConfigStore()
const userStore = useUserStore()
const { isAuthenticated, isAdmin } = storeToRefs(userStore)

// 导航菜单项
const menuItems = computed(() => configStore.headerConfig.items)

// 判断链接是否为外部链接
const isExternalLink = (path) => {
  return path.startsWith('http://') || path.startsWith('https://')
}

// 用户退出登录处理
const handleSignOut = async () => {
  await userStore.signOut()
}

// 网站提交相关状态
const showSubmitModal = ref(false)
const categories = ref([])
const siteForm = ref({
  name: '',
  url: '',
  description: '',
  favicon_url: '',
  category_id: ''
})
const defaultIcon = '/images/default/default-icon.svg'
const loading = ref(false)

// 获取网站分类列表
const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) throw error
    categories.value = data
  } catch (error) {
    console.error('获取分类列表失败:', error)
    showMessage('获取分类列表失败', 'error')
  }
}

// 处理网站图标加载失败
const handleImageError = (event) => {
  event.target.src = defaultIcon
}

// 提交新网站
const submitSite = async () => {
  try {
    loading.value = true
    // 表单验证
    if (
      !siteForm.value.name ||
      !siteForm.value.url ||
      !siteForm.value.description ||
      !siteForm.value.favicon_url
    ) {
      showMessage('请填写所有必填项', 'error')
      return
    }

    // URL格式验证
    try {
      new URL(siteForm.value.url)
    } catch (error) {
      showMessage('请输入有效的网站地址', error)
      return
    }

    const { error } = await supabase
      .from('sites')
      .insert({
        name: siteForm.value.name,
        url: siteForm.value.url,
        description: siteForm.value.description,
        favicon_url: siteForm.value.favicon_url,
        category_id: siteForm.value.category_id || null,
        status: 'pending',
        submit_time: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('提交失败:', error)
      showMessage('提交失败：' + error.message, 'error')
      return
    }

    showMessage('网站提交成功，等待审核', 'success')
    showSubmitModal.value = false
    // 重置表单
    siteForm.value = {
      name: '',
      url: '',
      description: '',
      favicon_url: '',
      category_id: ''
    }
  } catch (error) {
    console.error('提交网站失败:', error)
    showMessage('提交网站失败，请稍后重试', 'error')
  } finally {
    loading.value = false
  }
}

// 显示消息提示
const showMessage = (message) => {
  alert(message)
}

// 打开网站提交弹窗
const handleOpenSubmitModal = () => {
  showSubmitModal.value = true
  fetchCategories()
}

const isMobileMenuOpen = ref(false)

// 切换移动端菜单
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// 关闭移动端菜单
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <header
    class="fixed top-4 left-1/2 z-50 -translate-x-1/2 w-[96%] rounded-2xl backdrop-blur-lg bg-white/90 shadow-2xl border border-white/60 dark:bg-gray-800/90 dark:border-gray-700"
  >
    <nav class="flex items-center justify-between h-16 px-4 md:px-8">
      <div class="flex items-center space-x-4">
        <router-link
          to="/"
          class="text-xl font-bold text-gray-800 hover:text-gray-600 transition-colors dark:text-white dark:hover:text-gray-400"
        >
          {{ configStore.siteTitle }}
        </router-link>
      </div>

      <!-- 桌面端导航 -->
      <div class="hidden md:flex items-center space-x-6">
        <template v-for="item in menuItems" :key="item.url">
          <a
            v-if="isExternalLink(item.url)"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-700 hover:text-black text-base font-medium transition-colors dark:text-gray-300 dark:hover:text-white"
          >
            <i v-if="item.icon" :class="item.icon" class="mr-1"></i>
            {{ item.name }}
          </a>
          <router-link
            v-else
            :to="item.url"
            class="text-gray-700 hover:text-black text-base font-medium transition-colors dark:text-gray-300 dark:hover:text-white"
          >
            <i v-if="item.icon" :class="item.icon" class="mr-1"></i>
            {{ item.name }}
          </router-link>
        </template>
        <button
          class="text-gray-700 hover:text-black text-base font-medium transition-colors dark:text-gray-300 dark:hover:text-white"
          @click="handleOpenSubmitModal"
        >
          提交网站
        </button>
        <div class="relative group">
          <button
            class="p-2 text-gray-600 hover:text-black text-xl dark:text-gray-300 dark:hover:text-white"
          >
            <i class="fas fa-user"></i>
          </button>
          <div
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-50 opacity-0 scale-95 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:scale-100 dark:bg-gray-800 dark:shadow-xl"
          >
            <!-- 未登录状态 -->
            <template v-if="!isAuthenticated">
              <router-link
                to="/auth/login"
                class="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition-colors duration-150 dark:text-gray-200 dark:hover:bg-gray-700"
                >登录</router-link
              >
              <router-link
                to="/auth/register"
                class="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition-colors duration-150 dark:text-gray-200 dark:hover:bg-gray-700"
                >注册</router-link
              >
              <router-link
                to="/auth/reset-password"
                class="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition-colors duration-150 dark:text-gray-200 dark:hover:bg-gray-700"
                >找回密码</router-link
              >
            </template>
            <!-- 已登录状态 -->
            <template v-else>
              <router-link
                to="/profile"
                class="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition-colors duration-150 dark:text-gray-200 dark:hover:bg-gray-700"
                >个人中心</router-link
              >
              <!-- 管理员显示后台管理选项 -->
              <a
                v-if="isAdmin"
                href="/admin"
                target="_blank"
                class="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition-colors duration-150 dark:text-gray-200 dark:hover:bg-gray-700"
                >后台管理</a
              >
              <button
                class="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 transition-colors duration-150 dark:text-gray-200 dark:hover:bg-gray-700"
                @click="handleSignOut"
              >
                退出登录
              </button>
            </template>
          </div>
        </div>
        <button
          class="p-2 text-gray-600 hover:text-black text-xl dark:text-gray-300 dark:hover:text-white"
        >
          <i class="fas fa-search"></i>
        </button>
      </div>

      <!-- 移动端菜单按钮 -->
      <button
        class="md:hidden p-2 text-gray-600 hover:text-black text-xl dark:text-gray-300 dark:hover:text-white"
        @click="toggleMobileMenu"
      >
        <i class="fas" :class="isMobileMenuOpen ? 'fa-times' : 'fa-bars'"></i>
      </button>
    </nav>

    <!-- 移动端导航菜单 -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-b-2xl border-t border-gray-100 dark:border-gray-700"
    >
      <div class="px-4 py-2 space-y-2">
        <template v-for="item in menuItems" :key="item.url">
          <a
            v-if="isExternalLink(item.url)"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            class="block py-2 text-gray-700 hover:text-black text-base font-medium transition-colors dark:text-gray-300 dark:hover:text-white"
            @click="closeMobileMenu"
          >
            <i v-if="item.icon" :class="item.icon" class="mr-1"></i>
            {{ item.name }}
          </a>
          <router-link
            v-else
            :to="item.url"
            class="block py-2 text-gray-700 hover:text-black text-base font-medium transition-colors dark:text-gray-300 dark:hover:text-white"
            @click="closeMobileMenu"
          >
            <i v-if="item.icon" :class="item.icon" class="mr-1"></i>
            {{ item.name }}
          </router-link>
        </template>
        <button
          class="w-full text-left py-2 text-gray-700 hover:text-black text-base font-medium transition-colors dark:text-gray-300 dark:hover:text-white"
          @click="handleOpenSubmitModal"
        >
          提交网站
        </button>
        <div class="border-t border-gray-100 dark:border-gray-700 pt-2">
          <!-- 未登录状态 -->
          <template v-if="!isAuthenticated">
            <router-link
              to="/auth/login"
              class="block py-2 text-gray-700 hover:text-black text-base font-medium transition-colors dark:text-gray-300 dark:hover:text-white"
              @click="closeMobileMenu"
              >登录</router-link
            >
            <router-link
              to="/auth/register"
              class="block py-2 text-gray-700 hover:text-black text-base font-medium transition-colors dark:text-gray-300 dark:hover:text-white"
              @click="closeMobileMenu"
              >注册</router-link
            >
            <router-link
              to="/auth/reset-password"
              class="block py-2 text-gray-700 hover:text-black text-base font-medium transition-colors dark:text-gray-300 dark:hover:text-white"
              @click="closeMobileMenu"
              >找回密码</router-link
            >
          </template>
          <!-- 已登录状态 -->
          <template v-else>
            <router-link
              to="/profile"
              class="block py-2 text-gray-700 hover:text-black text-base font-medium transition-colors dark:text-gray-300 dark:hover:text-white"
              @click="closeMobileMenu"
              >个人中心</router-link
            >
            <a
              v-if="isAdmin"
              href="/admin"
              target="_blank"
              class="block py-2 text-gray-700 hover:text-black text-base font-medium transition-colors dark:text-gray-300 dark:hover:text-white"
              @click="closeMobileMenu"
              >后台管理</a
            >
            <button
              class="w-full text-left py-2 text-gray-700 hover:text-black text-base font-medium transition-colors dark:text-gray-300 dark:hover:text-white"
              @click="handleSignOut"
            >
              退出登录
            </button>
          </template>
        </div>
      </div>
    </div>
  </header>

  <!-- 网站提交弹窗 -->
  <div
    v-if="showSubmitModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium dark:text-white">提交网站</h3>
        <button
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          @click="showSubmitModal = false"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
      <form class="space-y-4" @submit.prevent="submitSite">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">网站名称</label>
          <input
            v-model="siteForm.name"
            type="text"
            class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">网站地址</label>
          <input
            v-model="siteForm.url"
            type="url"
            class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">所属分类</label>
          <select
            v-model="siteForm.category_id"
            class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">由管理员决定</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">网站描述</label>
          <textarea
            v-model="siteForm.description"
            rows="3"
            class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          ></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">网站图标</label>
          <input
            v-model="siteForm.favicon_url"
            type="url"
            class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
          <div v-if="siteForm.favicon_url" class="mt-2">
            <img
              :src="siteForm.favicon_url"
              :alt="siteForm.name"
              class="w-6 h-6 rounded bg-gray-50 object-contain border border-gray-100 dark:bg-gray-700 dark:border-gray-600"
              @error="handleImageError"
            />
          </div>
        </div>
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            @click="showSubmitModal = false"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {{ loading ? '提交中...' : '提交' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
