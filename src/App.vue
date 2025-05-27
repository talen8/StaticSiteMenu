// 应用程序根组件
<script setup>
import { onMounted } from 'vue'

import { useConfigStore } from './stores/config'

// 初始化全局配置状态
const configStore = useConfigStore()

// 组件挂载时加载全局配置
onMounted(() => {
  configStore.loadConfig()
})
</script>

<template>
  <router-view></router-view>
</template>

<style>
/* 引入Font Awesome图标库 */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
</style>
