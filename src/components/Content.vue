// 网站内容展示组件
<template>
  <div class="content md:pl-8 w-full md:w-[85%] dark:text-gray-200">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="text-red-500 text-center p-4">
      {{ error }}
    </div>

    <!-- 内容展示 -->
    <div v-else>
      <div
        v-for="category in getCategoriesWithSites"
        :key="category.id"
        class="bg-white rounded-lg p-4 md:p-6 mb-6 shadow-[-2px_5px_15px_-5px_rgba(0,0,0,0.15)] dark:bg-gray-800 dark:shadow-[-2px_5px_15px_-5px_rgba(255,255,255,0.1)]"
      >
        <h2 :id="category.id" class="text-xl font-bold text-gray-700 mb-3 dark:text-white">
          <i :class="'fas fa-' + category.icon" class="text-base"></i>
          {{ category.name }}
        </h2>
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
        >
          <a
            v-for="site in category.sites"
            :key="site.id"
            :href="site.url"
            target="_blank"
            rel="noopener noreferrer"
            class="bg-[#f8f8f8] rounded-lg shadow-sm p-3 md:p-4 hover:shadow-md transition-shadow flex flex-col cursor-pointer no-underline dark:bg-gray-700 dark:hover:shadow-lg"
            @click="handleSiteClick(site)"
          >
            <!-- 网站卡片头部：图标、标题、描述 -->
            <div class="flex items-start mb-2">
              <img
                v-lazy="site.favicon_url || defaultIcon"
                :alt="site.name"
                class="w-8 h-8 md:w-10 md:h-10 rounded bg-gray-50 object-contain mr-3 border border-gray-100 flex-shrink-0 dark:bg-gray-600 dark:border-gray-500"
                @error="handleImageError"
              />
              <div class="flex-1 min-w-0">
                <div
                  class="font-semibold text-gray-900 text-sm md:text-base truncate dark:text-white"
                >
                  {{ site.name }}
                </div>
                <div class="text-xs md:text-sm text-gray-500 truncate mt-0.5 dark:text-gray-400">
                  {{ site.description }}
                </div>
              </div>
            </div>

            <!-- 网站卡片底部：标签、箭头 -->
            <div class="flex items-center justify-between gap-1 mt-auto">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="tag in site.tags"
                  :key="tag.id"
                  class="px-1.5 md:px-2 py-0.5 bg-gray-200 text-black text-xs rounded-md hover:bg-gray-300 transition-colors cursor-pointer dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                  @click.stop="filterByTag(tag.name)"
                >
                  # {{ tag.name }}
                </span>
              </div>
              <i class="fas fa-chevron-right text-gray-400 ml-2 dark:text-gray-500"></i>
            </div>
          </a>
        </div>
      </div>
    </div>
    <div ref="contentBottom" class="content-bottom"></div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { ref, onMounted } from 'vue'

import { visitApi } from '../lib/db'
import { useNavigationStore } from '../stores/navigation'

// 初始化状态管理
const navigationStore = useNavigationStore()
const { getCategoriesWithSites, loading, error } = storeToRefs(navigationStore)

// 默认图标和DOM引用
const defaultIcon = '/images/default/default-icon.svg'
const contentBottom = ref(null)
const selectedTag = ref(null)

// 加载数据
const loadData = async () => {
  await navigationStore.loadData()
}

// 处理图标加载失败
const handleImageError = (event) => {
  event.target.src = defaultIcon
}

// 标签筛选功能
const filterByTag = (tag) => {
  selectedTag.value = tag
}

// 记录网站访问
const handleSiteClick = async (site) => {
  try {
    await visitApi.recordVisit(site.id)
  } catch (error) {
    console.error('记录访问失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>
