<template>
  <div class="avatar-upload">
    <div class="relative">
      <img
        :src="previewUrl || modelValue || '/images/default/default-avatar.svg'"
        class="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
        alt="avatar"
      />
      <div
        class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
        @click="openFileInput"
      >
        <i class="fas fa-camera text-white text-xl"></i>
      </div>
    </div>

    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />

    <!-- 裁剪弹窗 -->
    <div
      v-if="showCropModal"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h3 class="text-lg font-medium mb-4">裁剪头像</h3>
        <div class="mb-4">
          <vue-cropper
            ref="cropper"
            :src="cropImage"
            :aspect-ratio="1"
            :view-mode="1"
            :auto-crop-area="1"
            :background="true"
            :rotatable="false"
            :zoomable="true"
            :guides="true"
            :center="true"
            :highlight="true"
            :crop-box-movable="true"
            :crop-box-resizable="true"
            :toggle-drag-mode-on-dblclick="false"
            class="w-full h-96"
          />
        </div>
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            class="px-4 py-2 border rounded-md hover:bg-gray-50"
            @click="cancelCrop"
          >
            取消
          </button>
          <button
            type="button"
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            @click="handleCrop"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import VueCropper from 'vue-cropperjs'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'upload'])

const fileInput = ref(null)
const cropper = ref(null)
const showCropModal = ref(false)
const cropImage = ref('')
const previewUrl = ref('')

// 打开文件选择器
const openFileInput = () => {
  fileInput.value.click()
}

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  // 验证文件大小（最大2MB）
  if (file.size > 2 * 1024 * 1024) {
    alert('图片大小不能超过2MB')
    return
  }

  // 读取文件并显示裁剪界面
  const reader = new FileReader()
  reader.onload = (e) => {
    cropImage.value = e.target.result
    showCropModal.value = true
  }
  reader.readAsDataURL(file)
}

// 取消裁剪
const cancelCrop = () => {
  showCropModal.value = false
  cropImage.value = ''
  fileInput.value.value = ''
}

// 裁剪图片
const handleCrop = async () => {
  if (!cropper.value) return

  const canvas = cropper.value.getCroppedCanvas({
    width: 200,
    height: 200
  })

  // 将裁剪后的图片转换为Blob
  canvas.toBlob(
    async (blob) => {
      // 创建FormData对象
      const formData = new FormData()
      formData.append('file', blob, 'avatar.jpg')

      try {
        // 触发上传事件
        emit('upload', formData)

        // 更新预览
        previewUrl.value = canvas.toDataURL('image/jpeg')

        // 关闭裁剪弹窗
        showCropModal.value = false
        cropImage.value = ''
        fileInput.value.value = ''
      } catch (error) {
        console.error('上传头像失败:', error)
        alert('上传头像失败')
      }
    },
    'image/jpeg',
    0.9
  )
}

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      previewUrl.value = ''
    }
  }
)
</script>

<style>
@import 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.12/cropper.min.css';
</style>

<style scoped>
.avatar-upload {
  display: inline-block;
}
</style>
