// 页面横幅组件
<template>
  <div class="relative h-[50vh] bg-cover bg-center" :style="{ backgroundImage: `url('${bg}')` }">
    <div class="absolute inset-0 bg-black/30"></div>
    <div class="relative h-full flex items-center justify-center">
      <h1 class="text-4xl font-bold text-white">{{ title }}</h1>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

// 组件属性定义
defineProps({
  title: {
    type: String,
    required: true
  },
  bg: {
    type: String,
    required: true
  }
})
</script>
