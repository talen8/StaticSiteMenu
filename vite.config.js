import path from 'path'
import { fileURLToPath } from 'url'

import vue from '@vitejs/plugin-vue'
import yaml from 'js-yaml'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'yaml-loader',
      transform(code, id) {
        if (id.endsWith('.yaml') || id.endsWith('.yml')) {
          const data = yaml.load(code)
          return {
            code: `export default ${JSON.stringify(data)}`,
            map: null
          }
        }
      }
    }
  ],
  css: {
    postcss: './postcss.config.js'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    // 启用压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除 console
        drop_debugger: true // 生产环境移除 debugger
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vue-vendor'
            }
            if (id.includes('echarts')) {
              return 'echarts-vendor'
            }
            if (id.includes('@iconify')) {
              return 'iconify-vendor'
            }
            if (id.includes('pinia') || id.includes('vue-router')) {
              return 'vue-core-vendor'
            }
            return 'vendor'
          }
        }
      }
    }
  }
})
