<template>
  <div class="p-6">
    <!-- 添加消息组件 -->
    <Message ref="messageRef" />

    <!-- 页面标题 -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-center md:text-left w-full md:w-auto">用户管理</h2>
    </div>

    <!-- 用户列表表格 -->
    <AdminTable
      :columns="columns"
      :items="users"
      :loading="isLoading"
      search-placeholder="搜索用户..."
      :show-status-filter="true"
      :status-options="statusOptions"
      :showAddButton="false"
      @update:filters="fetchUsers"
    >
      <!-- 用户信息列 -->
      <template #username="{ item }">
        <div class="flex items-center w-48">
          <img
            :src="item.avatar_url || '/images/default/default-avatar.svg'"
            class="w-8 h-8 rounded-full mr-2"
            alt="avatar"
          />
          <div>
            <div class="text-sm font-medium text-gray-900">{{ item.username }}</div>
            <div class="text-xs text-gray-500">{{ item.email }}</div>
          </div>
        </div>
      </template>

      <!-- 角色列 -->
      <template #role="{ item }">
        <div class="text-sm text-gray-900">{{ roleLabels[item.role] || item.role }}</div>
      </template>

      <!-- 最后登录时间列 -->
      <template #lastLogin="{ item }">
        <div class="text-sm text-gray-500">{{ formatDate(item.last_login) }}</div>
      </template>

      <!-- 状态列 -->
      <template #status="{ item }">
        <span
          :class="[
            'px-2 py-1 text-xs rounded-full w-20 inline-block text-center',
            item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          ]"
        >
          {{ item.status === 'active' ? '已启用' : '未激活' }}
        </span>
      </template>

      <!-- 操作列 -->
      <template #actions="{ item }">
        <div class="flex space-x-2 w-24">
          <button class="text-blue-600 hover:text-blue-800" @click="editUser(item)">
            <i class="fas fa-edit"></i>
          </button>
          <button class="text-red-600 hover:text-red-800" @click="deleteUser(item.id)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </template>
    </AdminTable>

    <!-- 编辑用户弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-600 bg-opacity-50">
      <div class="flex items-center justify-center min-h-screen">
        <div class="bg-white rounded-lg p-8 w-full max-w-md">
          <h3 class="text-lg font-medium mb-4">编辑用户</h3>
          <form @submit.prevent="saveUser">
            <div class="space-y-4">
              <!-- 头像上传 -->
              <div class="flex justify-center mb-4">
                <AvatarUpload v-model="userForm.avatar_url" @upload="handleAvatarUpload" />
              </div>
              <!-- 用户信息表单 -->
              <div>
                <label class="block text-sm font-medium text-gray-700">用户名</label>
                <input
                  v-model="userForm.username"
                  type="text"
                  class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">邮箱</label>
                <input
                  v-model="userForm.email"
                  type="email"
                  class="mt-1 block w-full border rounded-md shadow-sm p-2 bg-gray-50"
                  readonly
                  disabled
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">角色</label>
                <select
                  v-model="userForm.role"
                  class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500"
                >
                  <option v-for="(label, value) in roleLabels" :key="value" :value="value">
                    {{ label }}
                  </option>
                </select>
              </div>
              <!-- 操作按钮 -->
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
// 导入依赖
import { storeToRefs } from 'pinia'
import { ref, onMounted } from 'vue'

import AdminTable from '@/components/admin/AdminTable.vue'
import AvatarUpload from '@/components/admin/AvatarUpload.vue'
import Message from '@/components/admin/Message.vue'
import { useAdminStore } from '@/stores/admin'

import { userApi } from '../../lib/db'

// 初始化状态管理
const adminStore = useAdminStore()
const { users } = storeToRefs(adminStore)

// 添加错误类型枚举
const ErrorType = {
  NETWORK: 'network',
  API: 'api',
  VALIDATION: 'validation'
}

// 格式化日期时间
const formatDate = (date) => {
  if (!date) return '-'

  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'

  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 表格列配置
const columns = [
  { key: 'username', label: '用户信息' },
  { key: 'role', label: '角色' },
  { key: 'lastLogin', label: '最后登录' },
  { key: 'status', label: '状态' },
  { key: 'actions', label: '操作' }
]

// 状态选项
const statusOptions = [
  { value: 'active', label: '已启用' },
  { value: 'inactive', label: '未激活' }
]

// 角色标签映射
const roleLabels = {
  admin: '管理员',
  user: '普通用户'
}

// 状态管理
const showAddModal = ref(false)
const editingUser = ref(null)
const userForm = ref({
  username: '',
  email: '',
  role: 'user',
  avatar_url: ''
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

// 获取用户列表
const fetchUsers = async () => {
  isLoading.value = true
  try {
    await adminStore.loadAllData()
  } catch (error) {
    handleError(error, ErrorType.API, '获取用户列表失败')
  } finally {
    isLoading.value = false
  }
}

// 保存用户信息
const saveUser = async () => {
  // 表单验证
  if (!userForm.value.username.trim()) {
    handleError(null, ErrorType.VALIDATION, '用户名不能为空')
    return
  }

  try {
    loading.value = true
    const updateData = {
      username: userForm.value.username,
      role: userForm.value.role
    }
    await userApi.updateUser(editingUser.value.id, updateData)
    // 强制重新加载所有数据
    await adminStore.loadAllData(true)
    showMessage('用户信息更新成功', 'success')
    closeModal()
  } catch (error) {
    handleError(error, ErrorType.API, '保存用户失败')
  } finally {
    loading.value = false
  }
}

// 处理头像上传
const handleAvatarUpload = async (formData) => {
  try {
    const file = formData.get('file')
    if (!file) {
      handleError(null, ErrorType.VALIDATION, '请选择要上传的头像')
      return
    }

    await userApi.uploadAvatar(editingUser.value.id, file)
    // 强制重新加载所有数据
    await adminStore.loadAllData(true)
    showMessage('头像上传成功', 'success')
  } catch (error) {
    handleError(error, ErrorType.API, '上传头像失败')
  }
}

// 编辑用户
const editUser = (user) => {
  editingUser.value = user
  userForm.value = {
    username: user.username,
    email: user.email,
    role: user.role,
    status: user.status,
    avatar_url: user.avatar_url
  }
  showAddModal.value = true
}

// 删除用户
const deleteUser = async (id) => {
  if (!confirm('确定要删除这个用户吗？')) return

  try {
    await userApi.deleteUser(id)
    // 强制重新加载所有数据
    await adminStore.loadAllData(true)
    showMessage('用户删除成功', 'success')
  } catch (error) {
    handleError(error, ErrorType.API, '删除用户失败')
  }
}

// 关闭弹窗并重置表单
const closeModal = () => {
  showAddModal.value = false
  editingUser.value = null
  userForm.value = {
    username: '',
    email: '',
    role: 'user',
    avatar_url: ''
  }
}

// 组件挂载时加载数据
onMounted(() => {
  fetchUsers()
})
</script>
