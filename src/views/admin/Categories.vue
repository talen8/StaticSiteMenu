<template>
  <div class="p-6">
    <!-- 修改消息组件 -->
    <Message ref="messageRef" :duration="3000" />

    <div class="flex flex-col md:flex-row justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-center md:text-left w-full md:w-auto">分类管理</h2>
    </div>

    <!-- 使用通用表格组件 -->
    <AdminTable
      :columns="columns"
      :items="processedCategories"
      :loading="isLoading"
      search-placeholder="搜索分类..."
      :show-status-filter="true"
      :status-options="statusOptions"
      @update:filters="loadData"
      @add="showAddModal = true"
    >
      <!-- 自定义列内容 -->
      <template #name="{ item }">
        <div class="flex items-center w-48">
          <i
            :class="item.icon ? item.icon.split(' ') : ['fas', 'fa-folder', 'mr-2']"
            class="mr-2"
          ></i>
          <div class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</div>
        </div>
      </template>

      <template #siteCount="{ item }">
        <div class="text-sm text-gray-900 w-24 text-center">{{ item.siteCount }}</div>
      </template>

      <template #order_index="{ item }">
        <div class="flex items-center justify-center w-24">
          <button
            class="text-gray-400 hover:text-gray-600"
            :disabled="item.order_index <= 1"
            @click="moveCategory(item, 'up')"
          >
            <i class="fas fa-chevron-up"></i>
          </button>
          <span class="mx-2 text-sm text-gray-900">{{ item.order_index }}</span>
          <button
            class="text-gray-400 hover:text-gray-600"
            :disabled="item.order_index >= categories.length"
            @click="moveCategory(item, 'down')"
          >
            <i class="fas fa-chevron-down"></i>
          </button>
        </div>
      </template>

      <template #status="{ item }">
        <span
          :class="[
            'px-2 py-1 text-xs rounded-full w-20 inline-block text-center',
            item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          ]"
        >
          {{ item.status === 'active' ? '已启用' : '已禁用' }}
        </span>
      </template>

      <template #actions="{ item }">
        <div class="flex space-x-2 w-24">
          <button class="text-blue-600 hover:text-blue-800" @click="editCategory(item)">
            <i class="fas fa-edit"></i>
          </button>
          <button class="text-red-600 hover:text-red-800" @click="deleteCategory(item.id)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </template>
    </AdminTable>

    <!-- 添加/编辑分类弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-600 bg-opacity-50">
      <div class="flex items-center justify-center min-h-screen">
        <div class="bg-white rounded-lg p-8 w-full max-w-md">
          <h3 class="text-lg font-medium mb-4">{{ editingCategory ? '编辑分类' : '添加分类' }}</h3>
          <form @submit.prevent="saveCategory">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">分类名称</label>
                <input
                  v-model="categoryForm.name"
                  type="text"
                  class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">图标</label>
                <div class="mt-1 flex items-center">
                  <input
                    v-model="categoryForm.icon"
                    type="text"
                    class="block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500"
                    placeholder="fas fa-folder"
                  />
                  <button
                    type="button"
                    class="ml-2 px-3 py-2 border rounded-md hover:bg-gray-50"
                    @click="showIconPicker = true"
                  >
                    选择图标
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">状态</label>
                <select
                  v-model="categoryForm.status"
                  class="mt-1 block w-full border rounded-md shadow-sm p-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="active">启用</option>
                  <option value="inactive">禁用</option>
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

    <!-- 图标选择器弹窗 -->
    <div v-if="showIconPicker" class="fixed inset-0 bg-gray-600 bg-opacity-50">
      <div class="flex items-center justify-center min-h-screen">
        <div class="bg-white rounded-lg p-8 w-full max-w-2xl">
          <h3 class="text-lg font-medium mb-4">选择图标</h3>
          <div class="grid grid-cols-6 gap-4 max-h-96 overflow-y-auto">
            <button
              v-for="icon in availableIcons"
              :key="icon"
              class="p-2 text-center hover:bg-gray-50 rounded"
              @click="selectIcon(icon)"
            >
              <i :class="icon"></i>
            </button>
          </div>
          <div class="mt-4 flex justify-end">
            <button
              class="px-4 py-2 border rounded-md hover:bg-gray-50"
              @click="showIconPicker = false"
            >
              关闭
            </button>
          </div>
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

import { categoryApi } from '../../lib/db'

// 初始化状态管理
const adminStore = useAdminStore()
const { categories, sites } = storeToRefs(adminStore)

// 表格列配置
const columns = [
  { key: 'name', label: '分类名称' },
  { key: 'siteCount', label: '收录数量' },
  { key: 'order_index', label: '排序' },
  { key: 'status', label: '状态' },
  { key: 'actions', label: '操作' }
]

// 状态选项
const statusOptions = [
  { value: 'active', label: '已启用' },
  { value: 'inactive', label: '已禁用' }
]

// 状态管理
const showAddModal = ref(false)
const showIconPicker = ref(false)
const editingCategory = ref(null)
const categoryForm = ref({
  name: '',
  icon: '',
  status: 'active'
})

// 添加加载状态
const isLoading = ref(false)
const loading = ref(false)

// 可用的图标列表
const availableIcons = [
  'fas fa-folder',
  'fas fa-code',
  'fas fa-book',
  'fas fa-palette',
  'fas fa-database',
  'fas fa-gears',
  'fas fa-cloud',
  'fas fa-mobile',
  'fas fa-gamepad',
  'fas fa-shield',
  'fas fa-briefcase',
  'fas fa-graduation-cap',
  'fas fa-book-open',
  'fas fa-music',
  'fas fa-video',
  'fas fa-image',
  'fas fa-file',
  'fas fa-link',
  'fas fa-star',
  'fas fa-heart',
  'fas fa-tag',
  'fas fa-tags',
  'fas fa-list',
  'fas fa-th-large',
  'fas fa-th',
  'fas fa-th-list',
  'fas fa-check',
  'fas fa-times',
  'fas fa-plus',
  'fas fa-minus',
  'fas fa-search',
  'fas fa-cog',
  'fas fa-wrench',
  'fas fa-tools',
  'fas fa-chart-bar',
  'fas fa-chart-line',
  'fas fa-chart-pie',
  'fas fa-chart-area',
  'fas fa-table',
  'fas fa-calendar',
  'fas fa-clock',
  'fas fa-bell',
  'fas fa-envelope',
  'fas fa-comment',
  'fas fa-comments',
  'fas fa-user',
  'fas fa-users'
]

// 计算每个分类的收录数量
const getCategorySiteCount = (categoryId) => {
  return sites.value.filter((site) => site.category_id === categoryId).length
}

// 处理分类数据，添加收录数量
const processedCategories = computed(() => {
  return categories.value.map((category) => ({
    ...category,
    siteCount: getCategorySiteCount(category.id)
  }))
})

// 加载数据
const loadData = async () => {
  isLoading.value = true
  try {
    await adminStore.loadAllData()
  } catch (error) {
    console.error('加载数据失败:', error)
    showMessage('加载数据失败: ' + error.message, 'error')
  } finally {
    isLoading.value = false
  }
}

// 编辑分类
const editCategory = (category) => {
  try {
    if (!category) {
      showMessage('无效的分类数据', 'error')
      return
    }
    editingCategory.value = category
    categoryForm.value = { ...category }
    showAddModal.value = true
  } catch (error) {
    console.error('编辑分类失败:', error)
    showMessage('编辑分类失败: ' + error.message, 'error')
  }
}

// 关闭弹窗
const closeModal = () => {
  showAddModal.value = false
  showIconPicker.value = false
  editingCategory.value = null
  categoryForm.value = {
    name: '',
    icon: '',
    status: 'active'
  }
}

// 添加消息引用
const messageRef = ref(null)

// 修改消息显示函数
const showMessage = (message, type = 'info') => {
  if (messageRef.value) {
    messageRef.value.addMessage(message, type)
  }
}

// 修改保存分类函数
const saveCategory = async () => {
  try {
    loading.value = true

    // 表单验证
    if (!categoryForm.value.name.trim()) {
      showMessage('分类名称不能为空', 'error')
      return
    }

    if (editingCategory.value) {
      // 只发送数据库表中存在的字段
      const { name, icon, status } = categoryForm.value
      const updatedCategory = await categoryApi.update(editingCategory.value.id, {
        name,
        icon,
        status
      })
      adminStore.updateCategory(editingCategory.value.id, updatedCategory)
      showMessage('分类更新成功', 'success')
    } else {
      const newCategory = await categoryApi.create(categoryForm.value)
      adminStore.addCategory(newCategory)
      showMessage('分类创建成功', 'success')
    }
    closeModal()
  } catch (error) {
    console.error('保存分类失败:', error)
    showMessage('保存分类失败: ' + error.message, 'error')
  } finally {
    loading.value = false
  }
}

// 修改删除分类函数
const deleteCategory = async (id) => {
  if (!id) {
    showMessage('无效的分类ID', 'error')
    return
  }

  if (!confirm('确定要删除这个分类吗？')) return

  try {
    // 检查分类下是否有网站
    const categorySites = sites.value.filter((site) => site.category_id === id)
    if (categorySites.length > 0) {
      showMessage(
        `该分类下还有 ${categorySites.length} 个网站，请先移除这些网站后再删除分类`,
        'error'
      )
      return
    }

    await categoryApi.delete(id)
    adminStore.removeCategory(id)
    showMessage('分类删除成功', 'success')
  } catch (error) {
    console.error('删除分类失败:', error)
    showMessage('删除分类失败: ' + error.message, 'error')
  }
}

// 选择图标
const selectIcon = (icon) => {
  try {
    if (!icon) {
      showMessage('请选择有效的图标', 'error')
      return
    }
    categoryForm.value.icon = icon
    showIconPicker.value = false
  } catch (error) {
    console.error('选择图标失败:', error)
    showMessage('选择图标失败: ' + error.message, 'error')
  }
}

// 修改移动分类函数
const moveCategory = async (category, direction) => {
  isLoading.value = true
  try {
    const currentIndex = category.order_index
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (newIndex < 1 || newIndex > categories.value.length) {
      showMessage('无法移动分类：超出范围', 'error')
      return
    }

    const targetCategory = categories.value.find((c) => c.order_index === newIndex)
    if (!targetCategory) {
      showMessage('无法移动分类：目标位置无效', 'error')
      return
    }

    // 交换两个分类的排序
    await categoryApi.update(category.id, { order_index: newIndex })
    await categoryApi.update(targetCategory.id, { order_index: currentIndex })

    // 直接更新本地状态
    const updatedCategories = categories.value.map((c) => {
      if (c.id === category.id) {
        return { ...c, order_index: newIndex }
      }
      if (c.id === targetCategory.id) {
        return { ...c, order_index: currentIndex }
      }
      return c
    })

    // 按 order_index 排序
    updatedCategories.sort((a, b) => a.order_index - b.order_index)

    // 更新 store 中的分类数据
    adminStore.$patch({ categories: updatedCategories })

    showMessage('分类排序更新成功', 'success')
  } catch (error) {
    console.error('移动分类失败:', error)
    showMessage('移动分类失败: ' + error.message, 'error')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
