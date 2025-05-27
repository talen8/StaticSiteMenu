<template>
  <div class="message-container">
    <TransitionGroup name="message-fade">
      <div
        v-for="(msg, index) in messages"
        :key="msg.id"
        :class="[
          'message-item',
          'px-4 py-3 rounded-lg shadow-lg z-50 max-w-md mb-3',
          msg.type === 'error'
            ? 'bg-red-50 text-red-700 border border-red-200'
            : msg.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : msg.type === 'warning'
                ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
        ]"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <i
              :class="[
                'mr-2 text-lg',
                msg.type === 'error'
                  ? 'fas fa-times-circle'
                  : msg.type === 'success'
                    ? 'fas fa-check-circle'
                    : msg.type === 'warning'
                      ? 'fas fa-exclamation-circle'
                      : 'fas fa-info-circle'
              ]"
            ></i>
            <span class="text-sm">{{ msg.content }}</span>
          </div>
          <button
            class="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
            @click="removeMessage(msg.id)"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const emit = defineEmits(['close'])

const messages = ref([])
let messageId = 0

// 添加新消息
const addMessage = (content, type) => {
  const id = messageId++
  messages.value.push({
    id,
    content,
    type,
    timer:
      props.duration > 0
        ? setTimeout(() => {
            removeMessage(id)
          }, props.duration)
        : null
  })
}

// 移除消息
const removeMessage = (id) => {
  const index = messages.value.findIndex((msg) => msg.id === id)
  if (index > -1) {
    const message = messages.value[index]
    if (message.timer) {
      clearTimeout(message.timer)
    }
    messages.value.splice(index, 1)
    emit('close')
  }
}

// 监听props变化
watch(
  () => props.message,
  (newMessage) => {
    if (newMessage) {
      addMessage(newMessage, props.type)
    }
  },
  { immediate: true }
)

// 组件方法
defineExpose({
  addMessage,
  close: () => {
    messages.value.forEach((msg) => {
      if (msg.timer) {
        clearTimeout(msg.timer)
      }
    })
    messages.value = []
  }
})
</script>

<style scoped>
.message-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.message-item {
  backdrop-filter: blur(8px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: fit-content;
  min-width: 300px;
}

.message-fade-enter-active,
.message-fade-leave-active {
  transition: all 0.3s ease;
}

.message-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.message-fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.message-fade-move {
  transition: transform 0.3s ease;
}
</style>
