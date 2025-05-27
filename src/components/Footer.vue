// 网站页脚组件
<template>
  <footer class="bg-gray-100 py-6 dark:bg-gray-900 dark:text-gray-400">
    <div class="container px-4 md:pl-16 md:pr-4 text-left text-gray-600 dark:text-gray-400">
      <!-- 友情链接区域 -->
      <div v-if="footerConfig.friendly_links.enable" class="mb-4">
        <h3 class="text-sm font-semibold mb-2 dark:text-white">友情链接</h3>
        <div class="flex flex-wrap justify-start gap-x-4 gap-y-2 text-xs">
          <a
            v-for="link in approvedLinks"
            :key="link.id"
            :href="link.url"
            target="_blank"
            class="hover:text-gray-800 dark:hover:text-white flex items-center"
          >
            {{ link.name }}
          </a>
          <router-link to="/friends" class="hover:text-gray-800 dark:hover:text-white"
            >更多链接</router-link
          >
        </div>
      </div>

      <!-- 版权和备案信息区域 -->
      <div class="text-xs flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0">
        <span class="md:mr-2"
          >Copyright © {{ footerConfig.copyright_runtime }}-2025
          {{ footerConfig.powered_by }}</span
        >
        <div class="flex flex-wrap items-center gap-x-2">
          <a
            v-for="(link, index) in footerConfig.links"
            :key="link.name"
            :href="link.url"
            target="_blank"
            class="hover:text-gray-800 dark:hover:text-white"
          >
            {{ link.name }}
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import { supabase } from '@/lib/supabase'
import { useConfigStore } from '@/stores/config'

// 初始化状态管理
const configStore = useConfigStore()
const friendLinks = ref([])

// 获取页脚配置信息
const footerConfig = computed(() => configStore.footerConfig)

// 获取已审核通过的友情链接
const approvedLinks = computed(() => {
  return friendLinks.value
    .filter((link) => link.status === 'approved')
    .slice(0, footerConfig.value.friendly_links.quantity)
})

// 获取友情链接列表
const fetchFriendLinks = async () => {
  try {
    const { data, error } = await supabase
      .from('friend_links')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    friendLinks.value = data
  } catch (error) {
    console.error('获取友链列表失败:', error)
  }
}

// 组件挂载时加载友情链接
onMounted(() => {
  fetchFriendLinks()
})
</script>

<style scoped>
/* 自定义样式 */
</style>
