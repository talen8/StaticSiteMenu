import { defineStore } from 'pinia'
import { ref } from 'vue'

import {
  categoryApi,
  tagApi,
  siteApi,
  categorySiteOrderApi,
  friendLinkApi,
  userApi
} from '../lib/db'

// 管理后台数据状态管理
export const useAdminStore = defineStore('admin', () => {
  // 数据状态
  const categories = ref([]) // 分类列表
  const tags = ref([]) // 标签列表
  const sites = ref([]) // 站点列表
  const friendLinks = ref([]) // 友链列表
  const users = ref([]) // 用户列表
  const loading = ref(false) // 加载状态
  const error = ref(null) // 错误信息
  const lastUpdated = ref(null) // 最后更新时间

  // 加载所有数据
  const loadAllData = async (force = false) => {
    // 检查缓存是否有效（5分钟内）
    if (!force && lastUpdated.value && Date.now() - lastUpdated.value < 5 * 60 * 1000) {
      return
    }

    loading.value = true
    error.value = null

    try {
      const [
        categoriesData,
        tagsData,
        sitesData,
        allCategoryOrders,
        friendLinksData,
        usersResponse
      ] = await Promise.all([
        categoryApi.getAll(),
        tagApi.getAll(),
        siteApi.getAllWithTags(),
        // 加载所有分类的站点排序信息
        Promise.all(
          (await categoryApi.getAll()).map((category) =>
            categorySiteOrderApi.getByCategoryId(category.id)
          )
        ),
        friendLinkApi.getAll(),
        userApi.getUsers()
      ])

      // 更新数据
      categories.value = categoriesData
      tags.value = tagsData
      sites.value = sitesData.map((site) => {
        const siteOrders = allCategoryOrders.flat().filter((order) => order.site_id === site.id)
        const currentOrder = siteOrders.find((order) => order.category_id === site.category_id)
        return {
          ...site,
          order_index: currentOrder ? currentOrder.order_index : 0
        }
      })
      friendLinks.value = friendLinksData
      users.value = usersResponse.data || []

      lastUpdated.value = Date.now()
    } catch (err) {
      console.error('加载数据失败:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新单个分类
  const updateCategory = (categoryId, updates) => {
    const index = categories.value.findIndex((category) => category.id === categoryId)
    if (index !== -1) {
      categories.value[index] = { ...categories.value[index], ...updates }
    }
  }

  // 更新单个标签
  const updateTag = (tagId, updates) => {
    const index = tags.value.findIndex((tag) => tag.id === tagId)
    if (index !== -1) {
      tags.value[index] = { ...tags.value[index], ...updates }
    }
  }

  // 更新单个站点
  const updateSite = (siteId, updates) => {
    const index = sites.value.findIndex((site) => site.id === siteId)
    if (index !== -1) {
      sites.value[index] = { ...sites.value[index], ...updates }
    }
  }

  // 更新单个友链
  const updateFriendLink = (friendLinkId, updates) => {
    const index = friendLinks.value.findIndex((link) => link.id === friendLinkId)
    if (index !== -1) {
      friendLinks.value[index] = { ...friendLinks.value[index], ...updates }
    }
  }

  // 更新单个用户
  const updateUser = (userId, updates) => {
    const index = users.value.findIndex((user) => user.id === userId)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...updates }
    }
  }

  // 添加新分类
  const addCategory = (category) => {
    categories.value.push(category)
  }

  // 添加新标签
  const addTag = (tag) => {
    tags.value.push(tag)
  }

  // 添加新站点
  const addSite = (site) => {
    sites.value.push(site)
  }

  // 添加新友链
  const addFriendLink = (friendLink) => {
    friendLinks.value.push(friendLink)
  }

  // 添加新用户
  const addUser = (user) => {
    users.value.push(user)
  }

  // 删除分类
  const removeCategory = (categoryId) => {
    categories.value = categories.value.filter((category) => category.id !== categoryId)
  }

  // 删除标签
  const removeTag = (tagId) => {
    tags.value = tags.value.filter((tag) => tag.id !== tagId)
  }

  // 删除站点
  const removeSite = (siteId) => {
    sites.value = sites.value.filter((site) => site.id !== siteId)
  }

  // 删除友链
  const removeFriendLink = (friendLinkId) => {
    friendLinks.value = friendLinks.value.filter((link) => link.id !== friendLinkId)
  }

  // 删除用户
  const removeUser = (userId) => {
    users.value = users.value.filter((user) => user.id !== userId)
  }

  return {
    // 状态
    categories,
    tags,
    sites,
    friendLinks,
    users,
    loading,
    error,
    lastUpdated,

    // 方法
    loadAllData,
    updateCategory,
    updateTag,
    updateSite,
    updateFriendLink,
    updateUser,
    addCategory,
    addTag,
    addSite,
    addFriendLink,
    addUser,
    removeCategory,
    removeTag,
    removeSite,
    removeFriendLink,
    removeUser
  }
})
