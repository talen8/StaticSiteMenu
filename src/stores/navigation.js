// 导航数据状态管理
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { categoryApi, siteApi } from '../lib/db'

// 导航状态管理存储
export const useNavigationStore = defineStore('navigation', () => {
  // 导航数据状态
  const categories = ref([]) // 分类列表
  const sites = ref([]) // 站点列表
  const loading = ref(false) // 加载状态
  const error = ref(null) // 错误信息
  const lastUpdated = ref(null) // 最后更新时间

  // 获取带站点的分类列表（计算属性）
  const getCategoriesWithSites = computed(() => {
    return categories.value
      .filter((category) => category.status === 'active') // 过滤活跃分类
      .map((category) => ({
        ...category,
        sites: sites.value.filter(
          (site) => site.category_id === category.id && site.status === 'approved' // 过滤已批准的站点
        )
      }))
      .filter((category) => category.sites.length > 0) // 过滤掉没有站点的分类
  })

  // 加载导航数据
  const loadData = async (force = false) => {
    // 检查缓存是否有效（5分钟内）
    if (!force && lastUpdated.value && Date.now() - lastUpdated.value < 5 * 60 * 1000) {
      return
    }

    loading.value = true
    error.value = null

    try {
      // 并行加载分类和站点数据
      const [categoriesData, sitesData] = await Promise.all([
        categoryApi.getAll(),
        siteApi.getAllWithTags()
      ])

      // 更新状态
      categories.value = categoriesData
      sites.value = sitesData
      lastUpdated.value = Date.now()
    } catch (err) {
      console.error('加载导航数据失败:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // 更新单个站点信息
  const updateSite = (siteId, updates) => {
    const index = sites.value.findIndex((site) => site.id === siteId)
    if (index !== -1) {
      sites.value[index] = { ...sites.value[index], ...updates }
    }
  }

  // 更新单个分类信息
  const updateCategory = (categoryId, updates) => {
    const index = categories.value.findIndex((category) => category.id === categoryId)
    if (index !== -1) {
      categories.value[index] = { ...categories.value[index], ...updates }
    }
  }

  // 添加新站点
  const addSite = (site) => {
    sites.value.push(site)
  }

  // 添加新分类
  const addCategory = (category) => {
    categories.value.push(category)
  }

  // 删除指定站点
  const removeSite = (siteId) => {
    sites.value = sites.value.filter((site) => site.id !== siteId)
  }

  // 删除指定分类
  const removeCategory = (categoryId) => {
    categories.value = categories.value.filter((category) => category.id !== categoryId)
  }

  return {
    // 状态
    categories,
    sites,
    loading,
    error,
    lastUpdated,

    // 计算属性
    getCategoriesWithSites,

    // 方法
    loadData,
    updateSite,
    updateCategory,
    addSite,
    addCategory,
    removeSite,
    removeCategory
  }
})
