// 关于页面组件
<template>
  <div class="app min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-300">
    <Header />
    <Banner
      title="关于我们"
      bg="https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80"
    />
    <div class="container mx-auto px-4 py-8 mt-8">
      <!-- 主要介绍 -->
      <div
        class="bg-white rounded-lg shadow-lg p-8 mb-8 dark:bg-gray-800 dark:shadow-[-2px_5px_15px_-5px_rgba(255,255,255,0.1)]"
      >
        <div class="prose max-w-none dark:text-gray-300">
          <p class="mb-4 text-lg">
            欢迎来到
            {{
              configStore.siteConfig.title
            }}！这是一个专注于为开发者提供优质网站导航的平台。在这里，您可以快速找到各类开发工具、学习资源、技术社区等优质网站。
          </p>
          <p class="mb-4 text-lg">
            这个平台的使命是帮助开发者提高工作效率，让网络导航变得更加简单和高效。通过精心筛选和分类，致力于为每一位用户提供最优质的网站资源。
          </p>
        </div>
      </div>

      <!-- 平台特色 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div
          class="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800 dark:shadow-[-2px_5px_15px_-5px_rgba(255,255,255,0.1)]"
        >
          <div class="text-blue-500 text-3xl mb-4">
            <i class="fas fa-search"></i>
          </div>
          <h3 class="text-xl font-semibold mb-3 dark:text-white">精准分类</h3>
          <p class="text-gray-600 dark:text-gray-300">
            精心设计的分类系统，让您快速找到所需的网站资源。每个分类都经过专业筛选，确保内容质量。
          </p>
        </div>
        <div
          class="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800 dark:shadow-[-2px_5px_15px_-5px_rgba(255,255,255,0.1)]"
        >
          <div class="text-green-500 text-3xl mb-4">
            <i class="fas fa-sync-alt"></i>
          </div>
          <h3 class="text-xl font-semibold mb-3 dark:text-white">实时更新</h3>
          <p class="text-gray-600 dark:text-gray-300">
            持续更新网站资源，确保信息的时效性。定期检查网站可用性，及时更新失效链接。
          </p>
        </div>
        <div
          class="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800 dark:shadow-[-2px_5px_15px_-5px_rgba(255,255,255,0.1)]"
        >
          <div class="text-purple-500 text-3xl mb-4">
            <i class="fas fa-users"></i>
          </div>
          <h3 class="text-xl font-semibold mb-3 dark:text-white">社区驱动</h3>
          <p class="text-gray-600 dark:text-gray-300">
            开放网站提交功能，让用户参与共建。通过社区的力量，不断丰富和完善网站资源库。
          </p>
        </div>
      </div>

      <!-- 联系方式 -->
      <div
        class="bg-white rounded-lg shadow-lg p-8 dark:bg-gray-800 dark:shadow-[-2px_5px_15px_-5px_rgba(255,255,255,0.1)] mb-8"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-xl font-medium mb-4 dark:text-white">联系方式</h3>
            <ul class="space-y-4 text-gray-600 dark:text-gray-300">
              <li
                v-for="social in configStore.aboutConfig.social"
                :key="social.name"
                class="flex items-center group"
              >
                <div
                  class="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mr-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors"
                >
                  <i :class="social.icon"></i>
                </div>
                <div class="flex-1">
                  <div class="text-sm text-gray-500 dark:text-gray-400">{{ social.name }}</div>
                  <div class="flex items-center">
                    <template v-if="social.url">
                      <a
                        :href="social.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                      >
                        {{ social.url_text || social.url }}
                      </a>
                    </template>
                    <template v-else>
                      <span
                        v-if="social.copy"
                        class="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer"
                        @click="copyToClipboard(social.url_text)"
                      >
                        {{ social.url_text }}
                      </span>
                      <span v-else class="text-gray-600 dark:text-gray-300">{{
                        social.url_text
                      }}</span>
                    </template>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-xl font-medium mb-4 dark:text-white">关注我们</h3>
            <div class="grid grid-cols-3 gap-4">
              <a
                v-for="follow in configStore.aboutConfig.follow"
                :key="follow.name"
                :href="follow.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex flex-col items-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
              >
                <i
                  :class="follow.icon"
                  :style="{ color: follow.color }"
                  class="text-2xl group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors"
                ></i>
                <span class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ follow.name }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- 赞赏支持 -->
      <div
        v-if="configStore.aboutConfig.reward && configStore.aboutConfig.reward.length > 0"
        class="bg-white rounded-lg shadow-lg p-8 dark:bg-gray-800 dark:shadow-[-2px_5px_15px_-5px_rgba(255,255,255,0.1)]"
      >
        <h3 class="text-xl font-medium mb-4 dark:text-white">赞赏支持</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          <div
            v-for="reward in configStore.aboutConfig.reward"
            :key="reward.name"
            class="text-center"
          >
            <div class="relative w-full aspect-square max-w-[200px] mx-auto">
              <img
                :src="reward.img"
                :alt="reward.name"
                class="w-full h-full object-contain rounded-lg shadow-md"
                @error="handleImageError"
              />
            </div>
            <h4 class="text-lg font-medium mt-4 dark:text-white">{{ reward.name }}</h4>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    <FloatingTools />
  </div>
</template>

<script setup>
// 导入组件和依赖
import { onMounted } from 'vue'

import Banner from '@/components/Banner.vue'

import FloatingTools from '../components/FloatingTools.vue'
import Footer from '../components/Footer.vue'
import Header from '../components/Header.vue'
import { useConfigStore } from '../stores/config'

// 初始化配置存储
const configStore = useConfigStore()

// 复制文本到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('复制成功！')
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请手动复制')
  }
}

// 组件挂载时加载配置
onMounted(async () => {
  await configStore.loadConfig()
})
</script>
