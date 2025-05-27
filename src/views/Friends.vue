<template>
  <div>
    <Header />
    <Banner
      title="友情链接"
      bg="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80"
    />
    <main class="container mx-auto px-4 py-8">
      <!-- 友链列表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <a
          v-for="link in approvedLinks"
          :key="link.id"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="block bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 group"
        >
          <div class="flex items-center">
            <div class="relative">
              <img
                :src="link.favicon_url || '/images/default/default-icon.svg'"
                :alt="link.name"
                class="w-12 h-12 rounded-xl bg-white dark:bg-gray-700 object-contain p-2 mr-4 border border-gray-100 dark:border-gray-600 shadow-sm group-hover:border-blue-500 dark:group-hover:border-blue-400 transition-colors duration-200"
                @error="handleImageError"
              />
            </div>
            <div class="flex-1 min-w-0">
              <h3
                class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200 truncate"
              >
                {{ link.name }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                {{ link.description }}
              </p>
            </div>
            <i
              class="fas fa-external-link-alt text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200 ml-2"
            ></i>
          </div>
        </a>
      </div>

      <!-- 申请说明 -->
      <div class="max-w-7xl mx-auto bg-white mb-8">
        <div class="space-y-6">
          <h2 class="text-xl font-medium text-gray-900">友情链接申请须知</h2>

          <div class="space-y-6">
            <!-- 申请方式 -->
            <div>
              <h3 class="text-base font-medium text-gray-900 mb-2">申请方式</h3>
              <p class="text-gray-600">
                请先在您的网站添加好本站友链，然后通过下方表单提交申请。请务必填写<strong
                  >网站名称、网址、简介和 LOGO 图标</strong
                >。建议将友链放置在<strong>网站首页或友情链接页面</strong>等显眼位置。
              </p>
            </div>

            <!-- 收录标准 -->
            <div>
              <h3 class="text-base font-medium text-gray-900 mb-2">收录标准</h3>
              <ul class="space-y-2 text-gray-600">
                <li>
                  •
                  网站内容需与<strong>开发、技术、学习、工具</strong>等相关，优先收录<strong>原创内容丰富、持续更新</strong>的优质站点。包括编程教程、技术博客、开发工具等类型。
                </li>
                <li>
                  •
                  网站可正常访问，<strong>无恶意弹窗、病毒、低俗或违法内容</strong>。网站应保持良好的用户体验，界面设计合理。
                </li>
                <li>
                  •
                  网站需<strong>无明显封禁、屏蔽</strong>等影响正常访问的情况。确保网站能够被正常访问，不会出现地区限制等问题。
                </li>
                <li>
                  •
                  已在贵站合适位置添加本站友链。友链应包含<strong>本站名称、网址和简介</strong>，并保持链接可正常访问。
                </li>
              </ul>
            </div>

            <!-- 不收录类型 -->
            <div>
              <h3 class="text-base font-medium text-gray-900 mb-2">不收录类型</h3>
              <ul class="space-y-2 text-gray-600">
                <li>
                  •
                  涉及<strong>违法、违规、擦边球、博彩、色情、网赚、采集、镜像、垃圾站</strong>等内容的网站。包括传播违法信息、提供博彩服务、发布色情内容等。
                </li>
                <li>
                  •
                  <strong>长期不更新、无法访问、内容与开发无关</strong
                  >的网站。具体包括：<strong>超过3个月未更新内容</strong>的网站、经常性无法访问的网站等。
                </li>
              </ul>
            </div>

            <!-- 友情提示 -->
            <div>
              <h3 class="text-base font-medium text-gray-900 mb-2">友情提示</h3>
              <ul class="space-y-2 text-gray-600">
                <li>
                  •
                  申请审核一般<strong>1-2天</strong>，审核通过后会尽快添加。如果申请未通过，请根据反馈进行调整后重新申请。
                </li>
                <li>
                  •
                  <strong>长期无法访问或内容因变更不符</strong
                  >的友链将被移除，恢复后可重新申请。我们会先通过邮件通知您，如果问题持续存在，可能会暂时移除友链。
                </li>
                <li>
                  •
                  欢迎互访、交流，共同建设优质开发者社区！我们鼓励友链网站之间进行<strong>良性互动，分享优质内容，交流技术经验</strong>。
                </li>
              </ul>
            </div>
          </div>

          <!-- 示例卡片 -->
          <div class="bg-gray-50 p-4 rounded">
            <div class="space-y-2 text-gray-600">
              <div>网站名称：{{ siteInfo.title }}</div>
              <div>网站地址：{{ siteInfo.url }}</div>
              <div>网站简介：{{ siteInfo.description }}</div>
              <div>网站图标：{{ siteInfo.favicon }}</div>
            </div>
          </div>

          <!-- 提示信息 -->
          <div class="text-sm text-gray-500">
            PS：如因无法访问或贵站未添加本站友链等原因，本站有权暂停或移除友链。如恢复请留言通知，谢谢理解！
          </div>
        </div>
      </div>

      <!-- 友链申请表单 -->
      <div
        class="max-w-4xl mx-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700"
      >
        <div class="flex items-center mb-8">
          <div
            class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-4 shadow-md"
          >
            <i class="fas fa-link text-white text-2xl"></i>
          </div>
          <div>
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">申请友链</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              请填写以下信息，我们会尽快审核
            </p>
          </div>
        </div>
        <form class="space-y-6" @submit.prevent="submitFriendLink">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 左侧列 -->
            <div class="space-y-6">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <i class="fas fa-globe mr-2 text-blue-500"></i>网站名称
                </label>
                <div class="relative">
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="请输入您的网站名称"
                  />
                  <i
                    class="fas fa-pencil-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  ></i>
                </div>
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <i class="fas fa-link mr-2 text-blue-500"></i>网站链接
                </label>
                <div class="relative">
                  <input
                    v-model="form.url"
                    type="url"
                    required
                    class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://example.com"
                  />
                  <i
                    class="fas fa-external-link-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  ></i>
                </div>
              </div>
            </div>

            <!-- 右侧列 -->
            <div class="space-y-6">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <i class="fas fa-align-left mr-2 text-blue-500"></i>网站描述
                </label>
                <div class="relative">
                  <input
                    v-model="form.description"
                    rows="3"
                    class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="请简单描述您的网站"
                  />
                  <i class="fas fa-comment-alt absolute left-3 top-4 text-gray-400"></i>
                </div>
              </div>
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <i class="fas fa-image mr-2 text-blue-500"></i>网站图标
                </label>
                <div class="relative">
                  <input
                    v-model="form.favicon_url"
                    type="url"
                    class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://example.com/favicon.ico"
                  />
                  <i
                    class="fas fa-image absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  ></i>
                </div>
                <div v-if="form.favicon_url" class="mt-2 flex items-center">
                  <img
                    :src="form.favicon_url"
                    :alt="form.name"
                    class="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 object-contain border border-gray-200 dark:border-gray-600 shadow-sm"
                    @error="handleImageError"
                  />
                  <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">图标预览</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 提交按钮 -->
          <div class="flex justify-end mt-8">
            <button
              type="submit"
              class="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-8 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="loading"
            >
              <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
              <span>{{ loading ? '提交中...' : '提交申请' }}</span>
            </button>
          </div>
        </form>
      </div>
    </main>
    <FloatingTools />
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import Banner from '@/components/Banner.vue'
import FloatingTools from '@/components/FloatingTools.vue'
import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import { supabase } from '@/lib/supabase'
import { useConfigStore } from '@/stores/config'

const configStore = useConfigStore()

const form = ref({
  name: '',
  url: '',
  description: '',
  favicon_url: ''
})

const loading = ref(false)
const approvedLinks = ref([])

const siteInfo = ref({
  title: '',
  url: '',
  description: '',
  favicon: ''
})

function isAbsoluteUrl(url) {
  if (!url) return false
  const u = url.trim().toLowerCase()
  return u.startsWith('http://') || u.startsWith('https://') || u.startsWith('//')
}

onMounted(async () => {
  // 优先用全局配置
  await configStore.loadConfig?.()
  siteInfo.value.title = configStore.siteConfig?.title || document.title
  siteInfo.value.url = configStore.siteConfig?.url || window.location.origin
  siteInfo.value.description = configStore.siteConfig?.description || getMetaDescription() || ''
  let favicon = configStore.siteConfig?.favicon || getFavicon() || '/favicon.ico'
  if (isAbsoluteUrl(favicon)) {
    siteInfo.value.favicon = favicon
  } else if (favicon.startsWith('/')) {
    siteInfo.value.favicon = siteInfo.value.url.replace(/\/$/, '') + favicon
  } else {
    siteInfo.value.favicon = favicon
  }

  fetchApprovedLinks()
})

function getMetaDescription() {
  const meta = document.querySelector('meta[name="description"]')
  return meta ? meta.getAttribute('content') : ''
}
function getFavicon() {
  const link = document.querySelector('link[rel~="icon"]')
  return link ? link.href : ''
}

// 获取已通过的友链列表
const fetchApprovedLinks = async () => {
  try {
    const { data, error } = await supabase
      .from('friend_links')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) throw error
    approvedLinks.value = data
  } catch (error) {
    console.error('获取友链列表失败:', error)
  }
}

// 提交友链申请
const submitFriendLink = async () => {
  loading.value = true
  try {
    const { error } = await supabase.from('friend_links').insert([
      {
        ...form.value,
        status: 'pending'
      }
    ])

    if (error) throw error

    // 重置表单
    form.value = {
      name: '',
      url: '',
      description: '',
      favicon_url: ''
    }

    alert('友链申请已提交，请等待审核')
  } catch (error) {
    console.error('提交友链申请失败:', error)
    alert('提交失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理图片加载错误
const handleImageError = (e) => {
  e.target.src = '/images/default/default-icon.svg'
}
</script>
