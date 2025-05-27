// 侧边栏导航组件
<template>
  <div
    ref="sidebarRef"
    class="w-full md:w-[15%] p-4 md:p-6 overflow-y-auto bg-[#f3f4f6] sticky top-20 mb-6 shadow-[2px_5px_15px_-5px_rgba(0,0,0,0.15)] rounded-lg dark:bg-gray-800 dark:shadow-[2px_5px_15px_-5px_rgba(255,255,255,0.1)]"
  >
    <nav class="flex md:block overflow-x-auto md:overflow-x-visible scrollbar-hide">
      <div class="flex md:block space-x-4 md:space-x-0">
        <div
          v-for="category in getCategoriesWithSites"
          :key="category.id"
          class="mb-0 md:mb-4 flex-shrink-0 md:flex-shrink"
        >
          <a
            :href="'#' + category.id"
            class="category-header flex items-center text-gray-700 font-medium hover:text-blue-600 transition-colors dark:text-gray-300 dark:hover:text-blue-400 whitespace-nowrap px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            @click.prevent="scrollToCategory(category.id)"
          >
            <i :class="'fas fa-' + category.icon" class="mr-2 text-sm"></i>
            <span class="text-sm">{{ category.name }}</span>
          </a>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { ref, onMounted, onUnmounted } from 'vue'

import { useNavigationStore } from '../stores/navigation'

// 初始化状态管理
const navigationStore = useNavigationStore()
const { getCategoriesWithSites } = storeToRefs(navigationStore)
const sidebarRef = ref(null)

// 加载分类数据
const loadCategories = async () => {
  await navigationStore.loadData()
}

// 滚动到指定分类
const scrollToCategory = (categoryId) => {
  const element = document.getElementById(categoryId)
  if (element) {
    const headerHeight = 105 // 头部导航栏的高度
    const elementPosition = element.getBoundingClientRect().top
    const sidebarHeight = window.innerWidth < 768 ? 60 : 0 // 移动端额外偏移量
    const offsetPosition = elementPosition + window.pageYOffset - headerHeight - sidebarHeight - 20 // 额外减去20px作为缓冲

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })

    // 在移动端点击后自动隐藏导航栏
    if (window.innerWidth < 768) {
      const sidebar = document.querySelector('.sidebar')
      if (sidebar) {
        sidebar.classList.add('hidden')
      }
    }
  }
}

// 更新侧边栏高度
const updateSidebarHeight = () => {
  if (sidebarRef.value) {
    const viewportHeight = window.innerHeight
    const headerHeight = 105
    const footer = document.querySelector('footer')
    const contentBottom = document.querySelector('.content-bottom')

    if (!contentBottom) return

    const contentBottomRect = contentBottom.getBoundingClientRect()
    const footerTop = footer ? footer.getBoundingClientRect().top : viewportHeight

    // 在移动端不限制高度
    if (window.innerWidth < 768) {
      sidebarRef.value.style.height = 'auto'
      sidebarRef.value.style.maxHeight = 'none'
      // 在移动端添加额外的底部间距
      sidebarRef.value.style.marginBottom = '60px'
      return
    }

    // 计算侧边栏的最大高度
    const maxHeight = Math.min(
      viewportHeight - headerHeight,
      contentBottomRect.bottom - headerHeight,
      footerTop - headerHeight
    )

    // 设置最小高度限制
    const minHeight = 200
    const finalHeight = Math.max(maxHeight, minHeight)

    sidebarRef.value.style.height = `${finalHeight}px`
    sidebarRef.value.style.marginBottom = '0'
  }
}

// 组件挂载时初始化
onMounted(() => {
  loadCategories()
  updateSidebarHeight()
  window.addEventListener('scroll', updateSidebarHeight)
  window.addEventListener('resize', updateSidebarHeight)
  window.addEventListener('contentUpdated', updateSidebarHeight)
})

// 组件卸载时清理事件监听
onUnmounted(() => {
  window.removeEventListener('scroll', updateSidebarHeight)
  window.removeEventListener('resize', updateSidebarHeight)
  window.removeEventListener('contentUpdated', updateSidebarHeight)
})
</script>

<style scoped>
/* 隐藏滚动条但保持可滚动 */
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

/* 移动端优化 */
@media (max-width: 768px) {
  .category-header {
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
  .dark .category-header {
    border-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
