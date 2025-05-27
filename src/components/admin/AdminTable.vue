<template>
  <div class="bg-white rounded-lg shadow">
    <!-- 表格头部 -->
    <div class="p-4 border-b">
      <div class="flex md:flex-row flex-wrap items-start md:items-center gap-4">
        <!-- 左侧筛选区域 -->
        <div class="flex flex-col md:flex-row flex-wrap items-center gap-4 flex-1">
          <!-- 搜索框 -->
          <div class="relative w-full md:w-64">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="searchPlaceholder"
              class="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:border-blue-500"
            />
            <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>

          <!-- 筛选按钮组 -->
          <div class="flex w-full md:w-auto gap-4">
            <!-- 状态筛选 -->
            <select
              v-if="showStatusFilter"
              v-model="statusFilter"
              class="w-[60%] md:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">所有状态</option>
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>

            <!-- 重置按钮 -->
            <button
              class="w-[40%] md:w-auto px-4 py-2 text-gray-600 hover:text-gray-800 border rounded-lg hover:bg-gray-50"
              @click="resetFilters"
            >
              重置筛选
            </button>
          </div>

          <!-- 自定义筛选器插槽 -->
          <slot name="filters"></slot>
        </div>

        <!-- 右侧添加按钮 -->
        <div class="w-full md:w-auto">
          <button
            v-if="showAddButton"
            class="w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            @click="$emit('add')"
          >
            <i class="fas fa-plus mr-2"></i>
            添加
          </button>
        </div>
      </div>
    </div>

    <!-- 表格内容 -->
    <div class="overflow-x-auto">
      <div class="relative min-h-[400px]">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                class="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading" class="animate-pulse">
              <td :colspan="columns.length" class="px-6 py-4 text-center">
                <div class="flex justify-center items-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              </td>
            </tr>
            <tr v-else-if="items.length === 0" class="hover:bg-gray-50">
              <td :colspan="columns.length" class="px-6 py-4 text-center text-gray-500">
                暂无数据
              </td>
            </tr>
            <tr v-for="(item, index) in paginatedItems" :key="item.id">
              <td v-for="column in columns" :key="column.key" class="px-6 py-4 whitespace-nowrap">
                <slot :name="column.key" :item="item" :index="index">
                  {{ item[column.key] }}
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 分页 -->
    <div class="px-6 py-4 border-t">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-700">
          显示 {{ pagination.start }} 到 {{ pagination.end }} 条，共 {{ pagination.total }} 条
        </div>
        <div class="flex space-x-2">
          <button
            v-for="page in pagination.pages"
            :key="page"
            :class="[
              'px-3 py-1 rounded',
              page === pagination.current
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  // 表格列配置
  columns: {
    type: Array,
    required: true
  },
  // 是否显示添加按钮
  showAddButton: {
    type: Boolean,
    default: true
  },
  // 数据源
  items: {
    type: Array,
    required: true
  },
  // 搜索框占位符
  searchPlaceholder: {
    type: String,
    default: '搜索...'
  },
  // 是否显示状态筛选
  showStatusFilter: {
    type: Boolean,
    default: false
  },
  // 状态选项
  statusOptions: {
    type: Array,
    default: () => []
  },
  // 每页显示数量
  perPage: {
    type: Number,
    default: 10
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:filters', 'add'])

// 状态管理
const searchQuery = ref('')
const statusFilter = ref('')

// 分页
const pagination = ref({
  current: 1,
  perPage: props.perPage,
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

// 过滤后的数据
const filteredItems = computed(() => {
  return props.items.filter((item) => {
    const matchesSearch = Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    const matchesStatus = !statusFilter.value || item.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

// 分页后的数据
const paginatedItems = computed(() => {
  const start = (pagination.value.current - 1) * pagination.value.perPage
  const end = start + pagination.value.perPage
  return filteredItems.value.slice(start, end)
})

// 监听筛选条件变化
watch([searchQuery, statusFilter], () => {
  emit('update:filters', {
    search: searchQuery.value,
    status: statusFilter.value
  })
  pagination.value.current = 1
})

// 监听数据源变化
watch(
  () => props.items,
  () => {
    pagination.value.total = filteredItems.value.length
  },
  { immediate: true }
)

// 方法
const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
}

const changePage = (page) => {
  pagination.value.current = page
}
</script>

<style scoped>
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
