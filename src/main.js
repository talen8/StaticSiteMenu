// 应用程序入口文件
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import './style.css'
import App from './App.vue'
import router from './router'

// 创建Vue应用实例
const app = createApp(App)

// 创建Pinia状态管理实例
const pinia = createPinia()

// 注册全局插件
app.use(pinia) // 注册Pinia状态管理
app.use(router) // 注册Vue Router路由

// 注册全局指令
app.directive('lazy', {
  mounted(el, binding) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.src = binding.value
            observer.unobserve(el)
          }
        })
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    )

    // 设置脉冲加载动画占位图
    el.src = `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" stroke-width="4"/>
        <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" stroke-width="4">
          <animate
            attributeName="r"
            values="45;35;45"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-opacity"
            values="1;0.2;1"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="50" cy="50" r="35" fill="none" stroke="#3b82f6" stroke-width="4" stroke-opacity="0.5">
          <animate
            attributeName="r"
            values="35;25;35"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-opacity"
            values="0.5;0.8;0.5"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="50" cy="50" r="25" fill="none" stroke="#3b82f6" stroke-width="4" stroke-opacity="0.8">
          <animate
            attributeName="r"
            values="25;15;25"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-opacity"
            values="0.8;1;0.8"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    `)}`

    observer.observe(el)
  }
})

app.mount('#app') // 挂载应用到DOM
