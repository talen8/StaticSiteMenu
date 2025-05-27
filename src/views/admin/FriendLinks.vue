<template>
  <div class="p-6">
    <!-- 修改消息提醒组件的使用方式 -->
    <Message ref="messageRef" />

    <div class="flex flex-col md:flex-row justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-center md:text-left w-full md:w-auto">友链管理</h2>
    </div>

    <!-- 使用通用表格组件 -->
    <AdminTable
      :columns="columns"
      :items="friendLinks"
      :loading="isLoading"
      search-placeholder="搜索友链..."
      :show-status-filter="true"
      :status-options="statusOptions"
      @add="showAddModal = true"
    >
      <!-- 自定义列内容 -->
      <template #name="{ item }">
        <div class="flex items-center">
          <img
            :src="item.favicon_url || defaultIcon"
            :alt="item.name"
            class="w-6 h-6 rounded bg-gray-50 object-contain mr-2 border border-gray-100 flex-shrink-0"
            @error="handleImageError"
          />
          <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
        </div>
      </template>

      <template #url="{ item }">
        <a :href="item.url" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm">
          {{ item.url }}
        </a>
      </template>

      <template #description="{ item }">
        <div class="text-sm text-gray-900">{{ item.description }}</div>
      </template>

      <template #status="{ item }">
        <span
          :class="[
            'px-2 py-1 text-xs rounded-full w-20 inline-block text-center',
            getStatusClass(item.status)
          ]"
        >
          {{ getStatusText(item.status) }}
        </span>
      </template>

      <template #actions="{ item }">
        <div class="flex space-x-2">
          <template v-if="item.status === 'pending'">
            <button
              class="text-green-600 hover:text-green-800"
              title="通过"
              @click="updateLinkStatus(item.id, 'approved')"
            >
              <i class="fas fa-check"></i>
            </button>
            <button
              class="text-red-600 hover:text-red-800"
              title="拒绝"
              @click="updateLinkStatus(item.id, 'rejected')"
            >
              <i class="fas fa-times"></i>
            </button>
          </template>
          <button class="text-blue-600 hover:text-blue-800" title="编辑" @click="editLink(item)">
            <i class="fas fa-edit"></i>
          </button>
          <button class="text-red-600 hover:text-red-800" title="删除" @click="deleteLink(item.id)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </template>
    </AdminTable>

    <!-- 添加/编辑友链弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-600 bg-opacity-50">
      <div class="flex items-center justify-center min-h-screen">
        <div class="bg-white rounded-lg p-8 w-full max-w-md">
          <h3 class="text-lg font-medium mb-4">
            {{ editingLink ? '编辑友链' : '添加友链' }}
          </h3>
          <form @submit.prevent="saveLink">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">网站名称</label>
                <input
                  v-model="linkForm.name"
                  type="text"
                  class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">网站链接</label>
                <input
                  v-model="linkForm.url"
                  type="url"
                  class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">网站描述</label>
                <input
                  v-model="linkForm.description"
                  type="text"
                  class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">网站图标</label>
                <input
                  v-model="linkForm.favicon_url"
                  type="url"
                  class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500"
                  placeholder="https://example.com/favicon.ico"
                  required
                />
                <div v-if="linkForm.favicon_url" class="mt-2">
                  <img
                    :src="linkForm.favicon_url"
                    :alt="linkForm.name"
                    class="w-6 h-6 rounded bg-gray-50 object-contain border border-gray-100"
                    @error="handleImageError"
                  />
                </div>
              </div>
              <div v-if="editingLink">
                <label class="block text-sm font-medium text-gray-700">状态</label>
                <select
                  v-model="linkForm.status"
                  class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="pending">待审核</option>
                  <option value="approved">已通过</option>
                  <option value="rejected">已拒绝</option>
                </select>
              </div>
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
                  class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="loading"
                >
                  <i class="fas" :class="loading ? 'fa-spinner fa-spin' : ''"></i>
                  <span>{{ loading ? '保存中...' : '保存' }}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { ref, onMounted } from 'vue'

import AdminTable from '@/components/admin/AdminTable.vue'
import Message from '@/components/admin/Message.vue'
import { friendLinkApi } from '@/lib/db'
import { useAdminStore } from '@/stores/admin'

// 初始化状态管理
const adminStore = useAdminStore()
const { friendLinks } = storeToRefs(adminStore)

// 添加错误类型枚举
const ErrorType = {
  NETWORK: 'network',
  API: 'api',
  VALIDATION: 'validation'
}

// 表格列配置
const columns = [
  { key: 'name', label: '网站名称' },
  { key: 'url', label: '网站链接' },
  { key: 'description', label: '网站描述' },
  { key: 'status', label: '状态' },
  { key: 'actions', label: '操作' }
]

// 状态选项
const statusOptions = [
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' }
]

// 状态管理
const showAddModal = ref(false)
const editingLink = ref(null)
const linkForm = ref({
  name: '',
  url: '',
  description: '',
  favicon_url: '',
  status: 'pending'
})

// 数据管理
const defaultIcon = '/images/default/default-icon.svg'

// 添加加载状态
const isLoading = ref(false)
const loading = ref(false)

// 修改消息配置
const messageRef = ref(null)

// 显示消息
const showMessage = (message, type = 'info') => {
  messageRef.value.addMessage(message, type)
}

// 错误处理函数
const handleError = (error, type, message) => {
  console.error(`[${type}] ${message}`, error)
  showMessage(message, type === ErrorType.VALIDATION ? 'warning' : 'error')
}

// 获取友链列表
const fetchFriendLinks = async () => {
  isLoading.value = true
  try {
    await adminStore.loadAllData()
  } catch (error) {
    handleError(error, ErrorType.API, '获取友链列表失败')
  } finally {
    isLoading.value = false
  }
}

// 获取状态样式
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

// 获取状态文本
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

// 处理图片加载错误
const handleImageError = (event) => {
  event.target.src = defaultIcon
}

// 编辑友链
const editLink = (link) => {
  editingLink.value = link
  linkForm.value = { ...link }
  showAddModal.value = true
}

// 关闭弹窗
const closeModal = () => {
  showAddModal.value = false
  editingLink.value = null
  linkForm.value = {
    name: '',
    url: '',
    description: '',
    favicon_url: '',
    status: 'approved' // 默认设置为已通过
  }
}

// 保存友链
const saveLink = async () => {
  // 表单验证
  if (!linkForm.value.name.trim()) {
    handleError(null, ErrorType.VALIDATION, '网站名称不能为空')
    return
  }
  if (!linkForm.value.url.trim()) {
    handleError(null, ErrorType.VALIDATION, '网站链接不能为空')
    return
  }
  if (!linkForm.value.description.trim()) {
    handleError(null, ErrorType.VALIDATION, '网站描述不能为空')
    return
  }
  if (!linkForm.value.favicon_url.trim()) {
    handleError(null, ErrorType.VALIDATION, '网站图标不能为空')
    return
  }

  try {
    loading.value = true
    if (editingLink.value) {
      const updatedLink = await friendLinkApi.update(editingLink.value.id, linkForm.value)
      adminStore.updateFriendLink(editingLink.value.id, updatedLink)
      showMessage('友链更新成功', 'success')
    } else {
      const newLink = await friendLinkApi.create(linkForm.value)
      adminStore.addFriendLink(newLink)
      showMessage('友链添加成功', 'success')
    }
    closeModal()
  } catch (error) {
    handleError(error, ErrorType.API, '保存友链失败')
  } finally {
    loading.value = false
  }
}

// 删除友链
const deleteLink = async (id) => {
  if (!confirm('确定要删除这个友链吗？')) return

  try {
    await friendLinkApi.delete(id)
    adminStore.removeFriendLink(id)
    showMessage('友链删除成功', 'success')
  } catch (error) {
    handleError(error, ErrorType.API, '删除友链失败')
  }
}

// 更新友链状态
const updateLinkStatus = async (id, status) => {
  try {
    const updatedLink = await friendLinkApi.update(id, { status })
    adminStore.updateFriendLink(id, updatedLink)
    showMessage(`友链已${status === 'approved' ? '通过' : '拒绝'}`, 'success')
  } catch (error) {
    handleError(error, ErrorType.API, '更新友链状态失败')
  }
}

onMounted(() => {
  fetchFriendLinks()
})
</script>
