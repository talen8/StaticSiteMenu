// 标签管理页面组件
<template>
  <div class="p-6">
    <!-- 添加消息组件 -->
    <Message ref="messageRef" />

    <!-- 页面标题和操作按钮 -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-center md:text-left w-full md:w-auto">标签管理</h2>
    </div>

    <!-- 标签列表表格 -->
    <AdminTable
      :columns="columns"
      :items="processedTags"
      :loading="isLoading"
      search-placeholder="搜索标签..."
      @update:filters="loadData"
      @add="showAddModal = true"
    >
      <!-- 标签名称列 -->
      <template #name="{ item }">
        <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
      </template>

      <!-- 使用数量列 -->
      <template #siteCount="{ item }">
        <div class="text-sm text-gray-900">{{ item.siteCount }}</div>
      </template>

      <!-- 操作列 -->
      <template #actions="{ item }">
        <div class="flex space-x-2">
          <button class="text-blue-600 hover:text-blue-800" @click="editTag(item)">
            <i class="fas fa-edit"></i>
          </button>
          <button class="text-red-600 hover:text-red-800" @click="deleteTag(item.id)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </template>
    </AdminTable>

    <!-- 添加/编辑标签弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-600 bg-opacity-50">
      <div class="flex items-center justify-center min-h-screen">
        <div class="bg-white rounded-lg p-8 w-full max-w-md">
          <h3 class="text-lg font-medium mb-4">{{ editingTag ? '编辑标签' : '添加标签' }}</h3>
          <form @submit.prevent="saveTag">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">标签名称</label>
                <input
                  v-model="tagForm.name"
                  type="text"
                  class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500"
                  required
                />
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
import { ref, onMounted, computed } from 'vue'

import AdminTable from '@/components/admin/AdminTable.vue'
import Message from '@/components/admin/Message.vue'
import { useAdminStore } from '@/stores/admin'

import { tagApi } from '../../lib/db'

// 初始化状态管理
const adminStore = useAdminStore()
const { tags, sites } = storeToRefs(adminStore)

// 添加错误类型枚举
const ErrorType = {
  NETWORK: 'network',
  API: 'api',
  VALIDATION: 'validation'
}

// 表格列配置
const columns = [
  { key: 'name', label: '标签名称' },
  { key: 'siteCount', label: '使用数量' },
  { key: 'actions', label: '操作' }
]

// 状态管理
const showAddModal = ref(false)
const editingTag = ref(null)
const tagForm = ref({
  name: ''
})

// 添加加载状态
const isLoading = ref(false)
const loading = ref(false)

// 添加消息引用
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

// 加载数据
const loadData = async () => {
  isLoading.value = true
  try {
    await adminStore.loadAllData()
  } catch (error) {
    handleError(error, ErrorType.API, '加载数据失败')
  } finally {
    isLoading.value = false
  }
}

// 编辑标签
const editTag = (tag) => {
  editingTag.value = tag
  tagForm.value = { ...tag }
  showAddModal.value = true
}

// 关闭弹窗并重置表单
const closeModal = () => {
  showAddModal.value = false
  editingTag.value = null
  tagForm.value = {
    name: ''
  }
}

// 保存标签
const saveTag = async () => {
  if (!tagForm.value.name.trim()) {
    handleError(null, ErrorType.VALIDATION, '标签名称不能为空')
    return
  }

  try {
    loading.value = true
    if (editingTag.value) {
      // 只更新name字段
      const updateData = { name: tagForm.value.name }
      const updatedTag = await tagApi.update(editingTag.value.id, updateData)
      adminStore.updateTag(editingTag.value.id, updatedTag)
      showMessage('标签更新成功', 'success')
    } else {
      // 检查标签名是否已存在
      const existingTag = tags.value.find(
        (t) => t.name.toLowerCase() === tagForm.value.name.toLowerCase()
      )
      if (existingTag) {
        handleError(null, ErrorType.VALIDATION, '标签名称已存在')
        return
      }
      // 只创建name字段
      const createData = { name: tagForm.value.name }
      const newTag = await tagApi.create(createData)
      adminStore.addTag(newTag)
      showMessage('标签创建成功', 'success')
    }
    closeModal()
  } catch (error) {
    handleError(error, ErrorType.API, '保存标签失败')
  } finally {
    loading.value = false
  }
}

// 删除标签
const deleteTag = async (id) => {
  if (!confirm('确定要删除这个标签吗？')) return

  try {
    // 检查标签是否正在使用
    const tagSiteCount = getTagSiteCount(id)
    if (tagSiteCount > 0) {
      handleError(null, ErrorType.VALIDATION, `该标签正在被${tagSiteCount}个网站使用，无法删除`)
      return
    }

    await tagApi.delete(id)
    adminStore.removeTag(id)
    showMessage('标签删除成功', 'success')
  } catch (error) {
    handleError(error, ErrorType.API, '删除标签失败')
  }
}

// 计算每个标签的使用数量
const getTagSiteCount = (tagId) => {
  return sites.value.filter((site) => site.tags && site.tags.some((t) => t.id === tagId)).length
}

// 处理标签数据，添加使用数量
const processedTags = computed(() => {
  return tags.value.map((tag) => ({
    ...tag,
    siteCount: getTagSiteCount(tag.id)
  }))
})

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>
