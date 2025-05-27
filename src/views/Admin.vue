// 管理后台布局组件
<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 移动端菜单按钮 -->
    <button
      class="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white hover:bg-gray-700"
      @click="toggleSidebar"
    >
      <i class="fas" :class="isSidebarOpen ? 'fa-times' : 'fa-bars'"></i>
    </button>

    <!-- 侧边栏导航 -->
    <div
      :class="[
        'fixed inset-y-0 left-0 w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out z-40',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div class="p-4 border-b border-gray-700">
        <div class="flex items-center justify-center space-x-3">
          <img
            :src="configStore.siteFavicon"
            :alt="configStore.siteTitle"
            class="w-10 h-10 rounded"
          />
          <h1 class="text-xl font-bold">{{ configStore.siteTitle }}</h1>
        </div>
      </div>
      <nav class="mt-8">
        <router-link
          to="/admin"
          exact
          exact-active-class="bg-gray-700"
          class="block px-4 py-2 hover:bg-gray-700"
        >
          <i class="fas fa-chart-line mr-2"></i>数据概览
        </router-link>
        <router-link to="/admin/categories" class="block px-4 py-2 hover:bg-gray-700">
          <i class="fas fa-sitemap mr-2"></i>分类管理
        </router-link>
        <router-link to="/admin/sites" class="block px-4 py-2 hover:bg-gray-700">
          <i class="fas fa-globe mr-2"></i>网站管理
        </router-link>
        <router-link to="/admin/tags" class="block px-4 py-2 hover:bg-gray-700">
          <i class="fas fa-tags mr-2"></i>标签管理
        </router-link>
        <router-link to="/admin/friend-links" class="block px-4 py-2 hover:bg-gray-700">
          <i class="fas fa-handshake mr-2"></i>友链管理
        </router-link>
        <router-link to="/admin/users" class="block px-4 py-2 hover:bg-gray-700">
          <i class="fas fa-users mr-2"></i>用户管理
        </router-link>
        <a href="#" class="block px-4 py-2 hover:bg-gray-700">
          <i class="fas fa-cog mr-2"></i>系统设置
        </a>
      </nav>

      <!-- 前往前台按钮 -->
      <div class="absolute bottom-0 w-full p-4 border-t border-gray-700">
        <a
          href="/"
          target="_blank"
          class="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <i class="fas fa-home mr-2"></i>前往前台
        </a>
      </div>
    </div>

    <!-- 遮罩层 -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
      @click="toggleSidebar"
    ></div>

    <!-- 主要内容区域 -->
    <div class="lg:ml-64 transition-all duration-300">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import { useConfigStore } from '../stores/config'

const configStore = useConfigStore()
const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

onMounted(async () => {
  await configStore.loadConfig()
})
</script>

<style scoped>
/* 当前路由链接样式 */
.router-link-active:not([exact]) {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
