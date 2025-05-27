<template>
  <div class="p-4 md:p-6">
    <!-- 修改消息提醒组件的使用方式 -->
    <Message ref="messageRef" />
    <div class="flex flex-col md:flex-row justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-center md:text-left w-full md:w-auto">网站管理</h2>
    </div>

    <div class="flex flex-col lg:flex-row gap-4">
      <!-- 分类树 -->
      <div class="w-full lg:w-52 bg-white rounded-lg shadow">
        <div
          class="p-4 border-b flex justify-between items-center cursor-pointer hover:bg-gray-50 lg:cursor-default lg:hover:bg-transparent"
          @click="toggleCategoryList"
        >
          <h3 class="font-medium">分类列表</h3>
          <i
            v-if="isMobile"
            class="fas text-gray-500"
            :class="isCategoryListOpen ? 'fa-chevron-up' : 'fa-chevron-down'"
          ></i>
        </div>
        <div
          class="p-2 transition-all duration-300"
          :class="['lg:block', isCategoryListOpen ? 'block' : 'hidden']"
        >
          <div
            :class="[
              'px-3 py-2 rounded-lg cursor-pointer mb-1',
              selectedCategory === null ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
            ]"
            @click="selectCategory(null)"
          >
            <i class="fas fa-folder mr-2"></i>
            全部网站
            <span class="float-right text-gray-500">{{ sites.length }}</span>
          </div>
          <div
            v-for="category in categories"
            :key="category.id"
            :class="[
              'px-3 py-2 rounded-lg cursor-pointer mb-1',
              selectedCategory === category.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
            ]"
            @click="selectCategory(category.id)"
          >
            <i class="fas fa-folder mr-2"></i>
            {{ category.name }}
            <span class="float-right text-gray-500">
              {{ getCategorySiteCount(category.id) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 网站列表 -->
      <div class="flex-1">
        <AdminTable
          :columns="columns"
          :items="filteredSites"
          :loading="isLoading"
          search-placeholder="搜索网站..."
          :show-status-filter="true"
          :status-options="statusOptions"
          @update:filters="loadData"
          @add="showAddModal = true"
        >
          <!-- 自定义列内容 -->
          <template #name="{ item, index }">
            <div
              class="flex items-center w-[200px]"
              :draggable="selectedCategory !== null"
              :class="['hover:bg-gray-50', selectedCategory !== null ? 'cursor-move' : '']"
              @dragstart="dragStart($event, index)"
              @dragover.prevent
              @drop="drop($event, index)"
            >
              <img
                :src="item.favicon_url || defaultIcon"
                :alt="item.name"
                class="w-6 h-6 rounded bg-gray-50 object-contain mr-2 border border-gray-100 flex-shrink-0"
                @error="handleImageError"
              />
              <div class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</div>
            </div>
          </template>

          <template #url="{ item }">
            <a
              :href="item.url"
              target="_blank"
              class="text-blue-600 hover:text-blue-800 text-sm w-[200px] block truncate"
            >
              {{ item.url }}
            </a>
          </template>

          <template #tags="{ item }">
            <div class="flex flex-wrap gap-1 w-[150px]">
              <span
                v-for="tag in item.tags"
                :key="tag.id"
                class="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full truncate max-w-[80px]"
              >
                {{ tag.name }}
              </span>
            </div>
          </template>

          <template #status="{ item }">
            <span
              :class="[
                'px-2 py-1 text-xs rounded-full w-[100px] inline-block text-center',
                getStatusClass(item.status)
              ]"
            >
              {{ getStatusText(item.status) }}
            </span>
          </template>

          <template #actions="{ item }">
            <div class="flex space-x-2 w-[120px]">
              <template v-if="item.status === 'pending'">
                <button
                  class="text-green-600 hover:text-green-800"
                  title="通过"
                  @click="updateSiteStatus(item.id, 'approved')"
                >
                  <i class="fas fa-check"></i>
                </button>
                <button
                  class="text-red-600 hover:text-red-800"
                  title="拒绝"
                  @click="updateSiteStatus(item.id, 'rejected')"
                >
                  <i class="fas fa-times"></i>
                </button>
              </template>
              <button
                class="text-blue-600 hover:text-blue-800"
                title="编辑"
                @click="editSite(item)"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="text-red-600 hover:text-red-800"
                title="删除"
                @click="deleteSite(item.id)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </template>
        </AdminTable>
      </div>
    </div>

    <!-- 添加/编辑网站弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-600 bg-opacity-50">
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-lg w-full max-w-2xl">
          <div class="p-4 md:p-6 border-b">
            <h3 class="text-lg font-medium">{{ editingSite ? '编辑网站' : '添加网站' }}</h3>
          </div>
          <div class="p-4 md:p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <form id="siteForm" @submit.prevent="saveSite">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">网站名称</label>
                  <input
                    v-model="siteForm.name"
                    type="text"
                    class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">网站地址</label>
                  <div class="flex flex-col md:flex-row gap-2">
                    <input
                      v-model="siteForm.url"
                      type="url"
                      class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500"
                      required
                    />
                    <button
                      type="button"
                      class="mt-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center gap-2"
                      :disabled="isParsing"
                      @click="parseWebsite"
                    >
                      <span v-if="isParsing" class="animate-spin">
                        <i class="fas fa-spinner"></i>
                      </span>
                      {{ isParsing ? '解析中...' : '解析' }}
                    </button>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">网站图标</label>
                  <div class="flex flex-col md:flex-row gap-2">
                    <input
                      v-model="siteForm.favicon_url"
                      type="url"
                      class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500"
                      required
                    />
                    <button
                      type="button"
                      class="mt-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center gap-2"
                      :disabled="!siteForm.favicon_url || isParsing"
                      @click="uploadFavicon"
                    >
                      <i class="fas fa-upload"></i>
                      上传
                    </button>
                  </div>
                  <div v-if="siteForm.favicon_url" class="mt-2">
                    <img
                      :src="siteForm.favicon_url"
                      :alt="siteForm.name"
                      class="w-6 h-6 rounded bg-gray-50 object-contain border border-gray-100"
                      @error="handleImageError"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">所属分类</label>
                  <select
                    v-model="siteForm.category_id"
                    class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option v-for="category in categories" :key="category.id" :value="category.id">
                      {{ category.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">网站描述</label>
                  <textarea
                    v-model="siteForm.description"
                    rows="3"
                    class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500"
                    required
                  ></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">标签</label>
                  <div class="mt-1 flex flex-wrap gap-2 p-2 border rounded-md">
                    <span
                      v-for="(tag, index) in siteForm.tags"
                      :key="index"
                      class="inline-flex items-center px-2 py-1 rounded-md text-sm bg-blue-100 text-blue-700"
                    >
                      {{ tag }}
                      <button
                        type="button"
                        class="ml-1 text-blue-500 hover:text-blue-700"
                        @click="removeTag(index)"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </span>
                    <div class="relative flex-1 min-w-[120px] tag-input-container">
                      <input
                        v-model="newTag"
                        type="text"
                        placeholder="输入标签后按回车添加"
                        class="w-full outline-none"
                        @input="filterExistingTags"
                        @keydown.enter.prevent="addTag"
                        @keydown.tab.prevent="addTag"
                        @keydown.comma.prevent="addTag"
                        @focus="showTagSuggestions = true"
                      />
                      <!-- 标签建议下拉框 -->
                      <div
                        v-if="showTagSuggestions && filteredExistingTags.length > 0"
                        class="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto"
                      >
                        <div
                          v-for="tag in filteredExistingTags"
                          :key="tag"
                          class="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                          @click="selectExistingTag(tag)"
                        >
                          {{ tag }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="editingSite">
                  <label class="block text-sm font-medium text-gray-700">状态</label>
                  <select
                    v-model="siteForm.status"
                    class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="pending">待审核</option>
                    <option value="approved">已通过</option>
                    <option value="rejected">已拒绝</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          <div class="p-4 md:p-6 border-t bg-gray-50">
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                class="px-4 py-2 border rounded-md hover:bg-gray-50"
                @click="closeModal"
              >
                取消
              </button>
              <button
                type="submit"
                form="siteForm"
                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="loading"
              >
                <i class="fas" :class="loading ? 'fa-spinner fa-spin' : ''"></i>
                <span>{{ loading ? '保存中...' : '保存' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 审核弹窗 -->
    <div v-if="showReviewModal" class="fixed inset-0 bg-gray-600 bg-opacity-50">
      <div class="flex items-center justify-center min-h-screen">
        <div class="bg-white rounded-lg p-8 w-full max-w-md">
          <h3 class="text-lg font-medium mb-4">网站快速审核</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">所属分类</label>
              <select
                v-model="reviewForm.category_id"
                class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500"
                required
              >
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">网站图标</label>
              <div class="flex gap-2">
                <input
                  v-model="reviewForm.favicon_url"
                  type="url"
                  class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  class="mt-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center gap-2"
                  :disabled="isParsing"
                  @click="parseReviewSiteIcon"
                >
                  <span v-if="isParsing" class="animate-spin">
                    <i class="fas fa-spinner"></i>
                  </span>
                  <i class="fas fa-sync-alt"></i>
                </button>
                <button
                  type="button"
                  class="mt-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center gap-2"
                  :disabled="!reviewForm.favicon_url || isParsing"
                  @click="uploadReviewSiteIcon"
                >
                  <i class="fas fa-upload"></i>
                </button>
              </div>
              <div v-if="reviewForm.favicon_url" class="mt-2">
                <img
                  :src="reviewForm.favicon_url"
                  :alt="reviewingSite?.name"
                  class="w-6 h-6 rounded bg-gray-50 object-contain border border-gray-100"
                  @error="handleImageError"
                />
              </div>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                class="px-4 py-2 border rounded-md hover:bg-gray-50"
                @click="closeReviewModal"
              >
                取消
              </button>
              <button
                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                @click="submitReview"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { ref, computed, onMounted, onUnmounted } from 'vue'

import AdminTable from '@/components/admin/AdminTable.vue'
import Message from '@/components/admin/Message.vue'
import { supabase } from '@/lib/supabase'
import { useAdminStore } from '@/stores/admin'

import { siteApi, tagApi, siteTagApi, categorySiteOrderApi } from '../../lib/db'

// 初始化状态管理
const adminStore = useAdminStore()
const { categories, tags, sites } = storeToRefs(adminStore)

// 表格列配置
const columns = [
  { key: 'name', label: '网站名称', width: '200px' },
  { key: 'url', label: '网站地址', width: '200px' },
  { key: 'tags', label: '标签', width: '150px' },
  { key: 'status', label: '状态', width: '100px' },
  { key: 'actions', label: '操作', width: '120px' }
]

// 状态选项
const statusOptions = [
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' }
]

// 状态管理
const searchQuery = ref('')
const statusFilter = ref('')
const tagFilter = ref('')
const showAddModal = ref(false)
const showReviewModal = ref(false)
const editingSite = ref(null)
const reviewingSite = ref(null)
const selectedCategory = ref(null)
const newTag = ref('')
const showTagSuggestions = ref(false)
const filteredExistingTags = ref([])

// 添加分页状态
const pagination = ref({
  current: 1,
  perPage: 10,
  total: 0,
  get start() {
    return (this.current - 1) * this.perPage + 1
  },
  get end() {
    return Math.min(this.current * this.perPage, this.total)
  },
  get pages() {
    const totalPages = Math.ceil(this.total / this.perPage)
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
})

const siteForm = ref({
  name: '',
  url: '',
  favicon_url: '',
  category_id: '',
  description: '',
  tags: [],
  status: 'approved'
})

const reviewForm = ref({
  category_id: '',
  favicon_url: ''
})

const defaultIcon = '/images/default/default-icon.svg'

// 添加加载状态
const isLoading = ref(false)
const loading = ref(false)

// 添加解析状态
const isParsing = ref(false)

// 修改消息配置
const messageRef = ref(null)

// 修改生成文件名的函数
const generateFileName = async (url) => {
  // 验证URL格式
  if (!url) {
    showMessage('URL不能为空', 'warning')
    throw new Error('URL不能为空')
  }

  // 移除URL中可能存在的空格
  url = url.trim()

  // 检查URL格式
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname

    // 使用 Web Crypto API 生成哈希
    const msgBuffer = new TextEncoder().encode(domain)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

    // 使用更精确的时间戳（纳秒级）
    const timestamp = Math.floor(performance.now())

    // 获取文件扩展名
    const extension = url.split('.').pop()?.toLowerCase() || 'ico'
    const validExtensions = ['ico', 'png', 'jpg', 'jpeg', 'svg', 'gif']
    const finalExtension = validExtensions.includes(extension) ? extension : 'ico'

    // 限制文件名长度，只使用哈希值的前16位
    const shortHash = hashHex.substring(0, 16)

    return `${shortHash}_${timestamp}.${finalExtension}`
  } catch (error) {
    console.error('生成文件名失败:', error)
    showMessage('生成文件名失败：' + error.message, 'error')
    throw error
  }
}

// 修改parseWebsite函数
const parseWebsite = async () => {
  if (!siteForm.value.url) {
    showMessage('请输入网站URL', 'warning')
    return
  }

  isParsing.value = true
  try {
    // 验证URL格式
    try {
      new URL(siteForm.value.url)
    } catch (error) {
      showMessage('无效的URL格式', error, 'warning')
      throw new Error('无效的URL格式')
    }

    // 获取网站信息
    const response = await fetch(
      `https://api.pearktrue.cn/api/website/info/?url=${encodeURIComponent(siteForm.value.url)}`
    )
    if (!response.ok) {
      throw new Error('API请求失败')
    }
    const data = await response.json()
    if (data.code !== 200) {
      throw new Error('获取网站信息失败')
    }

    // 设置网站标题和描述
    if (!data.data || !data.data.title) {
      throw new Error('无法获取网站信息')
    }

    siteForm.value.name = data.data.title || ''
    siteForm.value.description = data.data.description || ''

    // 检查当前图标URL是否是Supabase存储库的URL
    const isSupabaseUrl = siteForm.value.favicon_url?.includes(
      supabase.storage.from('site-icons').getPublicUrl('').data.publicUrl
    )

    // 只有当当前图标不是Supabase存储库的URL时，才更新图标
    if (!isSupabaseUrl && data.data.icon) {
      siteForm.value.favicon_url = `https://api.allorigins.win/raw?url=${encodeURIComponent(data.data.icon)}`
    }
  } catch (error) {
    if (error.message === '无效的URL格式') {
      showMessage('无效的URL格式', 'warning')
    } else if (
      error.message === 'API请求失败' ||
      error.message === '获取网站信息失败' ||
      error.message === '无法获取网站信息'
    ) {
      showMessage('无法获取网站信息，请检查网站地址是否正确', 'error')
    } else {
      showMessage('网络请求失败，请稍后重试', 'error')
    }
  } finally {
    isParsing.value = false
  }
}

// 修改uploadFavicon函数
const uploadFavicon = async () => {
  if (!siteForm.value.favicon_url) {
    showMessage('请先输入图标URL', 'warning')
    return
  }

  try {
    // 使用 allorigins.win 作为代理获取图标
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(siteForm.value.favicon_url)}`
    const response = await fetch(proxyUrl)
    if (!response.ok) {
      throw new Error('获取图标失败')
    }

    const blob = await response.blob()
    // 使用图标URL生成文件名
    const fileName = await generateFileName(siteForm.value.favicon_url)

    // 上传到Supabase
    const { error: uploadError } = await supabase.storage
      .from('site-icons')
      .upload(fileName, blob, {
        contentType: 'image/x-icon',
        upsert: true
      })

    if (uploadError) {
      throw new Error('上传图标失败')
    }

    // 获取公共URL
    const {
      data: { publicUrl }
    } = supabase.storage.from('site-icons').getPublicUrl(fileName)

    // 更新表单中的图标URL
    siteForm.value.favicon_url = publicUrl
    showMessage('图标上传成功', 'success')
  } catch (error) {
    console.error('上传图标失败:', error)
    showMessage('上传图标失败：' + error.message, 'error')
  }
}

// 显示消息的函数
const showMessage = (message, type = 'info') => {
  messageRef.value.addMessage(message, type)
}

// 加载数据
const loadData = async () => {
  isLoading.value = true
  try {
    await adminStore.loadAllData()
  } catch (error) {
    console.error('加载数据失败:', error)
    showMessage('加载数据失败：' + error.message, 'error')
  } finally {
    isLoading.value = false
  }
}

// 计算属性
const filteredSites = computed(() => {
  const filtered = sites.value.filter((site) => {
    const matchesSearch =
      site.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      site.url.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      site.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory =
      selectedCategory.value === null || site.category_id === selectedCategory.value
    const matchesStatus = !statusFilter.value || site.status === statusFilter.value
    const matchesTag =
      !tagFilter.value ||
      (site.tags &&
        site.tags.some((tag) => tag.name.toLowerCase().includes(tagFilter.value.toLowerCase())))
    return matchesSearch && matchesCategory && matchesStatus && matchesTag
  })

  // 更新分页总数
  pagination.value.total = filtered.length

  // 按照分类-站点排序表的排序序列大小进行排序
  if (selectedCategory.value !== null) {
    // 如果选择了具体分类，按照该分类下的排序进行排序
    return filtered.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
  } else {
    // 如果是全部网站，先按照分类排序，再按照每个分类下的排序进行排序
    return filtered.sort((a, b) => {
      // 首先按照分类排序
      const categoryA = categories.value.find((c) => c.id === a.category_id)
      const categoryB = categories.value.find((c) => c.id === b.category_id)
      if (categoryA && categoryB) {
        if (categoryA.order_index !== categoryB.order_index) {
          return categoryA.order_index - categoryB.order_index
        }
      }
      // 如果分类相同或无法比较，则按照站点排序
      return (a.order_index || 0) - (b.order_index || 0)
    })
  }
})

const selectCategory = (categoryId) => {
  try {
    selectedCategory.value = categoryId
    pagination.value.current = 1
  } catch (error) {
    console.error('选择分类失败:', error)
    showMessage('选择分类失败：' + error.message, 'error')
  }
}

const getCategorySiteCount = (categoryId) => {
  return sites.value.filter((site) => site.category_id === categoryId).length
}

const getStatusClass = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return '待审核'
    case 'approved':
      return '已通过'
    case 'rejected':
      return '已拒绝'
    default:
      return '未知状态'
  }
}

const handleImageError = (event) => {
  console.error('图片加载失败:', event.target.src)
  event.target.src = defaultIcon
  showMessage('图片加载失败，已使用默认图标', 'warning')
}

const editSite = async (site) => {
  try {
    editingSite.value = site
    const siteTags = await siteTagApi.getBySiteId(site.id)
    siteForm.value = {
      ...site,
      tags: siteTags.map((tag) => tag.name)
    }
    showAddModal.value = true
  } catch (error) {
    console.error('获取网站标签失败:', error)
    showMessage('获取网站标签失败：' + error.message, 'error')
  }
}

const closeModal = () => {
  try {
    showAddModal.value = false
    editingSite.value = null
    isParsing.value = false
    siteForm.value = {
      name: '',
      url: '',
      favicon_url: '',
      category_id: '',
      description: '',
      tags: [],
      status: 'approved'
    }
  } catch (error) {
    console.error('关闭模态框失败:', error)
    showMessage('关闭模态框失败：' + error.message, 'error')
  }
}

const saveSite = async () => {
  try {
    loading.value = true
    if (editingSite.value) {
      const { tags, order_index, ...siteData } = siteForm.value
      const updatedSite = await siteApi.update(editingSite.value.id, siteData)
      await siteTagApi.updateSiteTags(editingSite.value.id, tags)
      adminStore.updateSite(editingSite.value.id, updatedSite)

      // 只有当新旧分类都不为空时才处理分类关联
      if (siteData.category_id && editingSite.value.category_id) {
        if (siteData.category_id !== editingSite.value.category_id) {
          await categorySiteOrderApi.delete(editingSite.value.category_id, editingSite.value.id)
          const categorySites = sites.value.filter(
            (site) => site.category_id === siteData.category_id
          )
          await categorySiteOrderApi.setOrder(
            siteData.category_id,
            editingSite.value.id,
            categorySites.length + 1
          )
        }
      } else if (siteData.category_id) {
        // 如果新分类不为空，但旧分类为空，添加新分类关联
        const categorySites = sites.value.filter(
          (site) => site.category_id === siteData.category_id
        )
        await categorySiteOrderApi.setOrder(
          siteData.category_id,
          editingSite.value.id,
          categorySites.length + 1
        )
      } else if (editingSite.value.category_id) {
        // 如果新分类为空，但旧分类不为空，删除旧分类关联
        await categorySiteOrderApi.delete(editingSite.value.category_id, editingSite.value.id)
      }
      showMessage('网站更新成功', 'success')
    } else {
      const { tags, order_index, ...siteData } = siteForm.value
      const newSite = await siteApi.create({
        ...siteData,
        status: 'approved',
        submit_time: new Date().toISOString()
      })
      await siteTagApi.updateSiteTags(newSite.id, tags)
      adminStore.addSite(newSite)

      // 如果新站点有分类，添加分类关联
      if (siteData.category_id) {
        const categorySites = sites.value.filter(
          (site) => site.category_id === siteData.category_id
        )
        await categorySiteOrderApi.setOrder(
          siteData.category_id,
          newSite.id,
          categorySites.length + 1
        )
      }
      showMessage('网站添加成功', 'success')
    }
    closeModal()
  } catch (error) {
    console.error('保存网站失败:', error)
    showMessage('保存网站失败：' + error.message, 'error')
  } finally {
    loading.value = false
  }
}

const submitReview = async () => {
  if (!reviewingSite.value) {
    showMessage('未找到要审核的网站', 'error')
    return
  }

  try {
    const updateData = {
      status: 'approved',
      review_time: new Date().toISOString(),
      category_id: reviewForm.value.category_id,
      favicon_url: reviewForm.value.favicon_url
    }

    // 如果分类发生变化，更新分类关联
    if (reviewForm.value.category_id !== reviewingSite.value.category_id) {
      if (reviewingSite.value.category_id) {
        await categorySiteOrderApi.delete(reviewingSite.value.category_id, reviewingSite.value.id)
      }
      const categorySites = sites.value.filter(
        (site) => site.category_id === reviewForm.value.category_id
      )
      await categorySiteOrderApi.setOrder(
        reviewForm.value.category_id,
        reviewingSite.value.id,
        categorySites.length + 1
      )
    }

    const updatedSite = await siteApi.update(reviewingSite.value.id, updateData)
    adminStore.updateSite(reviewingSite.value.id, updatedSite)
    closeReviewModal()
    showMessage('网站已通过', 'success')
  } catch (error) {
    console.error('提交失败:', error)
    showMessage('提交失败：' + error.message, 'error')
  }
}

const closeReviewModal = () => {
  try {
    showReviewModal.value = false
    reviewingSite.value = null
    isParsing.value = false
    reviewForm.value = {
      category_id: '',
      favicon_url: ''
    }
  } catch (error) {
    console.error('关闭审核模态框失败:', error)
    showMessage('关闭审核模态框失败：' + error.message, 'error')
  }
}

const deleteSite = async (id) => {
  if (!confirm('确定要删除这个网站吗？')) return

  try {
    await siteApi.delete(id)
    adminStore.removeSite(id)
    showMessage('网站删除成功', 'success')
  } catch (error) {
    console.error('删除网站失败:', error)
    showMessage('删除网站失败：' + error.message, 'error')
  }
}

// 标签相关方法
const getAllExistingTags = () => {
  return tags.value.map((tag) => tag.name)
}

const filterExistingTags = () => {
  try {
    const query = newTag.value.toLowerCase().trim()
    if (!query) {
      filteredExistingTags.value = []
      return
    }

    const existingTags = getAllExistingTags()
    filteredExistingTags.value = existingTags.filter(
      (tag) => tag.toLowerCase().includes(query) && !siteForm.value.tags.includes(tag)
    )
  } catch (error) {
    console.error('过滤标签失败:', error)
    showMessage('过滤标签失败：' + error.message, 'error')
  }
}

const selectExistingTag = (tag) => {
  try {
    if (!siteForm.value.tags.includes(tag)) {
      siteForm.value.tags.push(tag)
    }
    newTag.value = ''
    showTagSuggestions.value = false
  } catch (error) {
    console.error('选择标签失败:', error)
    showMessage('选择标签失败：' + error.message, 'error')
  }
}

const addTag = async () => {
  const tag = newTag.value.trim()
  if (tag && !siteForm.value.tags.includes(tag)) {
    try {
      const newTagData = await tagApi.create({ name: tag })
      siteForm.value.tags.push(tag)
      adminStore.addTag(newTagData)
    } catch (error) {
      console.error('添加标签失败:', error)
      showMessage('添加标签失败：' + error.message, 'error')
    }
  }
  newTag.value = ''
  showTagSuggestions.value = false
}

const removeTag = (index) => {
  try {
    siteForm.value.tags.splice(index, 1)
  } catch (error) {
    console.error('移除标签失败:', error)
    showMessage('移除标签失败：' + error.message, 'error')
  }
}

const closeTagSuggestions = (event) => {
  try {
    const tagInputContainer = document.querySelector('.tag-input-container')
    if (tagInputContainer && !tagInputContainer.contains(event.target)) {
      showTagSuggestions.value = false
    }
  } catch (error) {
    console.error('关闭标签建议失败:', error)
    showMessage('关闭标签建议失败：' + error.message, 'error')
  }
}

// 添加拖拽相关的方法
const dragStart = (event, index) => {
  try {
    event.dataTransfer.setData('text/plain', index)
  } catch (error) {
    console.error('开始拖拽失败:', error)
    showMessage('开始拖拽失败：' + error.message, 'error')
  }
}

const drop = async (event, toIndex) => {
  try {
    // 只在选择具体分类时允许排序
    if (selectedCategory.value === null) return

    const fromIndex = parseInt(event.dataTransfer.getData('text/plain'))
    if (fromIndex !== toIndex) {
      await moveSite(fromIndex, toIndex)
    }
  } catch (error) {
    console.error('拖拽排序失败:', error)
    showMessage('拖拽排序失败：' + error.message, 'error')
  }
}

// 修改 moveSite 方法
const moveSite = async (fromIndex, toIndex) => {
  if (selectedCategory.value === null) return

  isLoading.value = true
  try {
    // 获取当前分类下的所有网站
    const categorySites = filteredSites.value.filter(
      (site) => site.category_id === selectedCategory.value
    )

    // 创建新的排序数组
    const newOrder = [...categorySites]
    const [movedSite] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, movedSite)

    // 获取新的排序后的站点ID数组
    const siteIds = newOrder.map((site) => site.id)

    // 重新排序
    await categorySiteOrderApi.reorderCategorySites(selectedCategory.value, siteIds)

    // 更新 store 中的数据
    await adminStore.loadAllData(true)
    showMessage('排序更新成功', 'success')
  } catch (error) {
    console.error('更新排序失败:', error)
    showMessage('更新排序失败：' + error.message, 'error')
  } finally {
    isLoading.value = false
  }
}

const updateSiteStatus = async (id, status) => {
  try {
    if (status === 'rejected') {
      // 直接拒绝
      const updatedSite = await siteApi.update(id, {
        status: 'rejected',
        review_time: new Date().toISOString()
      })
      adminStore.updateSite(id, updatedSite)
      showMessage('网站已拒绝', 'success')
    } else {
      // 打开审核表单设置分类和图标
      reviewingSite.value = sites.value.find((site) => site.id === id)
      if (reviewingSite.value) {
        reviewForm.value = {
          category_id: reviewingSite.value.category_id || '',
          favicon_url: reviewingSite.value.favicon_url || ''
        }
        showReviewModal.value = true
      }
    }
  } catch (error) {
    console.error('操作失败:', error)
    showMessage('操作失败：' + error.message, 'error')
  }
}

// 添加审核窗口的图标解析函数
const parseReviewSiteIcon = async () => {
  if (!reviewingSite.value?.url) {
    showMessage('网站地址无效', 'error')
    return
  }

  isParsing.value = true
  try {
    // 获取网站信息
    const response = await fetch(
      `https://api.pearktrue.cn/api/website/info/?url=${encodeURIComponent(reviewingSite.value.url)}`
    )
    if (!response.ok) {
      throw new Error('API请求失败')
    }
    const data = await response.json()
    if (data.code !== 200 || !data.data?.icon) {
      throw new Error('获取网站图标失败')
    }

    // 使用备选方案获取图标
    reviewForm.value.favicon_url = `https://api.allorigins.win/raw?url=${encodeURIComponent(data.data.icon)}`
    showMessage('图标解析成功', 'success')
  } catch (error) {
    console.error('解析图标失败:', error)
    showMessage('解析图标失败：' + error.message, 'error')
  } finally {
    isParsing.value = false
  }
}

// 添加审核窗口的图标上传函数
const uploadReviewSiteIcon = async () => {
  if (!reviewForm.value.favicon_url) {
    showMessage('请先输入图标URL', 'warning')
    return
  }

  try {
    // 使用 allorigins.win 作为代理获取图标
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(reviewForm.value.favicon_url)}`
    const response = await fetch(proxyUrl)
    if (!response.ok) {
      throw new Error('获取图标失败')
    }

    const blob = await response.blob()
    // 使用图标URL生成文件名
    const fileName = await generateFileName(reviewForm.value.favicon_url)

    // 上传到Supabase
    const { error: uploadError } = await supabase.storage
      .from('site-icons')
      .upload(fileName, blob, {
        contentType: 'image/x-icon',
        upsert: true
      })

    if (uploadError) {
      throw new Error('上传图标失败')
    }

    // 获取公共URL
    const {
      data: { publicUrl }
    } = supabase.storage.from('site-icons').getPublicUrl(fileName)

    // 更新表单中的图标URL
    reviewForm.value.favicon_url = publicUrl
    showMessage('图标上传成功', 'success')
  } catch (error) {
    console.error('上传图标失败:', error)
    showMessage('上传图标失败：' + error.message, 'error')
  }
}

// 添加分类列表折叠状态
const isCategoryListOpen = ref(false)

// 添加切换分类列表显示的方法
const toggleCategoryList = () => {
  isCategoryListOpen.value = !isCategoryListOpen.value
}

// 在组件挂载时，根据屏幕宽度设置初始状态
const isMobile = ref(false)

// 修改 handleResize 函数
const handleResize = () => {
  isMobile.value = window.innerWidth < 1024
  isCategoryListOpen.value = window.innerWidth >= 1024
}

// 在 onMounted 中初始化
onMounted(() => {
  document.addEventListener('click', closeTagSuggestions)
  loadData()
  // 初始化移动端状态
  isMobile.value = window.innerWidth < 1024
  isCategoryListOpen.value = window.innerWidth >= 1024
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.cursor-move {
  cursor: move;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
