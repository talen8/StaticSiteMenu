import yaml from 'js-yaml'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 全局配置状态管理
export const useConfigStore = defineStore('config', () => {
  // 站点基础配置
  const siteConfig = ref({
    title: '',
    description: '',
    keywords: '',
    author: '',
    language: '',
    favicon: ''
  })

  // 关于页面配置
  const aboutConfig = ref({
    social: [],
    follow: [],
    reward: []
  })

  // 主题样式配置
  const themeConfig = ref({
    primary_color: '',
    secondary_color: '',
    background_color: '',
    text_color: ''
  })

  // 页脚配置
  const footerConfig = ref({
    copyright_runtime: '',
    powered_by: '',
    friendly_links: {
      enable: false,
      quantity: 0
    },
    links: []
  })

  // 浮动工具栏配置
  const floatingButtonConfig = ref({
    enable: false,
    go_to_top: false,
    theme_switching: false,
    items: []
  })

  // 顶部导航配置
  const headerConfig = ref({
    items: []
  })

  // 搜索引擎配置
  const searchEngineConfig = ref([])

  // 站点信息计算属性
  const siteTitle = computed(() => siteConfig.value.title)
  const siteDescription = computed(() => siteConfig.value.description)
  const siteKeywords = computed(() => siteConfig.value.keywords)
  const siteAuthor = computed(() => siteConfig.value.author)
  const siteLanguage = computed(() => siteConfig.value.language)
  const siteFavicon = computed(() => siteConfig.value.favicon)

  // 从YAML配置文件加载配置
  const loadConfig = async () => {
    try {
      const response = await fetch('/config.yaml')
      const yamlText = await response.text()
      const config = yaml.load(yamlText)

      // 更新各模块配置状态
      siteConfig.value = config.site || {}
      aboutConfig.value = config.about || {}
      themeConfig.value = config.theme || {}
      footerConfig.value = config.footer || {}
      floatingButtonConfig.value = config.floating_button || {}
      headerConfig.value = config.header || {}
      searchEngineConfig.value = config.search_engine || []

      updateDocumentMeta()
    } catch (error) {
      console.error('加载配置失败:', error)
    }
  }

  // 更新文档元信息（标题、meta标签、favicon等）
  const updateDocumentMeta = () => {
    // 设置页面标题
    document.title = siteConfig.value.title || '网站导航'

    // 设置meta标签
    const metaTags = {
      description: siteConfig.value.description || '个人网站导航中心。',
      keywords: siteConfig.value.keywords || '网站导航,网址导航,网站推荐',
      author: siteConfig.value.author || 'Admin'
    }

    // 更新或创建meta标签
    Object.entries(metaTags).forEach(([name, content]) => {
      let meta = document.querySelector(`meta[name="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', name)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    })

    // 更新网站图标
    const favicon = document.querySelector('link[rel="icon"]')
    if (favicon) {
      favicon.setAttribute('href', siteConfig.value.favicon || '/favicon.png')
    }
  }

  // 更新指定配置项
  const updateConfig = (section, key, value) => {
    // 根据配置模块更新对应状态
    switch (section) {
      case 'site':
        siteConfig.value[key] = value
        break
      case 'about':
        aboutConfig.value[key] = value
        break
      case 'theme':
        themeConfig.value[key] = value
        break
      case 'footer':
        footerConfig.value[key] = value
        break
      case 'floating_button':
        floatingButtonConfig.value[key] = value
        break
      case 'header':
        headerConfig.value[key] = value
        break
      case 'search_engine':
        searchEngineConfig.value = value
        break
    }

    // 如果更新了站点配置，同步更新文档元信息
    if (section === 'site') {
      updateDocumentMeta()
    }
  }

  return {
    // 状态
    siteConfig,
    aboutConfig,
    themeConfig,
    footerConfig,
    floatingButtonConfig,
    headerConfig,
    searchEngineConfig,

    // 计算属性
    siteTitle,
    siteDescription,
    siteKeywords,
    siteAuthor,
    siteLanguage,
    siteFavicon,

    // 方法
    loadConfig,
    updateConfig
  }
})
