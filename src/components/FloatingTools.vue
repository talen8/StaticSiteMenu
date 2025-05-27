<template>
  <div
    v-if="configStore.floatingButtonConfig.enable"
    class="fixed bottom-4 md:bottom-8 right-4 md:right-8 flex flex-col gap-2 md:gap-3 z-50"
  >
    <!-- 返回顶部按钮 -->
    <button
      v-if="configStore.floatingButtonConfig.go_to_top"
      v-show="showBackToTop"
      class="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gray-200 shadow-md hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center text-gray-700"
      title="返回顶部"
      @click="scrollToTop"
    >
      <i class="fas fa-arrow-up text-xs md:text-sm"></i>
    </button>

    <!-- 主题切换按钮 -->
    <button
      v-if="configStore.floatingButtonConfig.theme_switching"
      class="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gray-200 shadow-md hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center text-gray-700"
      :title="isDarkMode ? '切换到亮色模式' : '切换到暗色模式'"
      @click="toggleTheme"
    >
      <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'" class="text-xs md:text-sm"></i>
    </button>

    <!-- 自定义浮动按钮 -->
    <template v-for="item in configStore.floatingButtonConfig.items" :key="item.name">
      <div class="relative group">
        <button
          v-if="item.url"
          class="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gray-200 shadow-md hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center text-gray-700"
          :title="item.name"
          @click="handleButtonClick(item)"
        >
          <i :class="item.icon" class="text-xs md:text-sm"></i>
        </button>
        <button
          v-else-if="item.img"
          class="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gray-200 shadow-md hover:bg-gray-300 transition-colors duration-200 flex items-center justify-center text-gray-700"
          :title="item.name"
          @click="handleButtonClick(item)"
        >
          <i :class="item.icon" class="text-xs md:text-sm"></i>
        </button>

        <!-- 图片预览弹窗 -->
        <div
          v-if="item.img && item.img !== '#'"
          class="absolute right-full mr-2 top-1/2 -translate-y-1/2 hidden group-hover:block bg-white p-2 rounded-lg shadow-lg z-50 border border-gray-200"
        >
          <div class="relative w-24 h-24 md:w-32 md:h-32">
            <img
              :src="item.img"
              :alt="item.name"
              class="absolute inset-0 w-full h-full object-contain"
              @error="handleImageError"
              @load="handleImageLoad"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

import { useConfigStore } from '../stores/config'

// 初始化状态管理
const configStore = useConfigStore()
const showBackToTop = ref(false)
const isDarkMode = ref(false)

// 监听浮动按钮配置变化
watch(() => configStore.floatingButtonConfig, { deep: true })

// 处理图片加载失败
const handleImageError = (event) => {
  console.error('图片加载失败:', event.target.src)
  event.target.src = '/images/default-avatar.png'
}

// 监听页面滚动
const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

// 平滑滚动到页面顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 处理浮动按钮点击事件
const handleButtonClick = (item) => {
  if (item.url && item.url !== '#') {
    window.open(item.url, '_blank')
  }
}

// 初始化主题设置
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  isDarkMode.value = savedTheme === 'dark'
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  }
}

// 切换明暗主题
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark')
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

// 组件挂载时初始化
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  initTheme()
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.dark {
  color-scheme: dark;
}
</style>
