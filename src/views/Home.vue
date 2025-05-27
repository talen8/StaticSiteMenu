// 主页组件
<template>
  <div class="app min-h-screen bg-[#f7f9fe] dark:bg-gray-900">
    <Header />
    <Hero />
    <div class="flex flex-col md:flex-row pt-8 px-4 md:px-8">
      <Sidebar class="w-full md:w-64 mb-4 md:mb-0" />
      <Content class="w-full md:flex-1" />
    </div>
    <Footer />
    <FloatingTools />
  </div>
</template>

<script setup>
// 导入页面组件
import Content from '../components/Content.vue'
import FloatingTools from '../components/FloatingTools.vue'
import Footer from '../components/Footer.vue'
import Header from '../components/Header.vue'
import Hero from '../components/Hero.vue'
import Sidebar from '../components/Sidebar.vue'
</script>
