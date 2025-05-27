// 网站首页英雄区域组件
<script setup>
import { ref, computed, onMounted } from 'vue'

import { useConfigStore } from '@/stores/config'

// 初始化状态管理
const configStore = useConfigStore()
const searchQuery = ref('')
const searchEngine = ref('')

// 获取搜索引擎配置并格式化
const searchEngines = computed(() => {
  return configStore.searchEngineConfig.map((engine) => ({
    id: engine.name,
    name: engine.name.charAt(0).toUpperCase() + engine.name.slice(1),
    url: engine.url,
    placeholder: engine.placeholder
  }))
})

// 初始化搜索引擎选择
onMounted(() => {
  const savedEngine = localStorage.getItem('preferredSearchEngine')

  if (savedEngine && searchEngines.value.some((engine) => engine.id === savedEngine)) {
    searchEngine.value = savedEngine
  } else if (searchEngines.value.length > 0) {
    searchEngine.value = searchEngines.value[0].id
    localStorage.setItem('preferredSearchEngine', searchEngine.value)
  }
})

// 处理搜索请求
const handleSearch = () => {
  if (!searchQuery.value.trim()) return
  const engine = searchEngines.value.find((e) => e.id === searchEngine.value)
  if (engine) {
    window.open(engine.url + encodeURIComponent(searchQuery.value), '_blank')
  }
}

// 切换搜索引擎
const selectEngine = (engineId) => {
  searchEngine.value = engineId
  localStorage.setItem('preferredSearchEngine', engineId)
}

// 获取当前选中的搜索引擎
const currentEngine = () => searchEngines.value.find((e) => e.id === searchEngine.value)
</script>

<template>
  <div
    class="relative h-[50vh] md:h-[70vh] bg-cover bg-center"
    style="
      background-image: url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80');
    "
  >
    <div class="absolute inset-0 bg-black/30"></div>
    <div class="relative h-full flex items-center justify-center">
      <div class="w-full max-w-2xl px-4">
        <!-- 搜索框 -->
        <div class="flex bg-white rounded-lg shadow-lg overflow-hidden h-10 md:h-12 items-center">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="currentEngine() ? currentEngine().placeholder : '输入搜索关键词...'"
            class="flex-1 px-3 md:px-5 text-sm md:text-base text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent h-full rounded-l-lg"
            @keyup.enter="handleSearch"
          />
          <button
            class="px-3 md:px-5 bg-red-500 text-sm md:text-base text-white focus:outline-none hover:bg-red-600 transition-colors duration-200 flex items-center justify-center h-full rounded-r-lg"
            @click="handleSearch"
          >
            <i class="fas fa-search"></i>
          </button>
        </div>

        <!-- 搜索引擎选项 -->
        <div
          class="flex justify-center mt-4 space-x-4 md:space-x-6 text-white text-sm md:text-base"
        >
          <div
            v-for="engine in searchEngines"
            :key="engine.id"
            class="relative cursor-pointer group"
            @click="selectEngine(engine.id)"
          >
            <span
              :class="{ 'border-b-2 border-white font-bold': searchEngine === engine.id }"
              class="pb-1"
            >
              {{ engine.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
