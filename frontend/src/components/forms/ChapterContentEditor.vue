<template>
  <div class="chapter-content-editor">
    <editor
      :api-key="apiKey"
      :init="editorConfig"
      v-model="editorContent"
    ></editor>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Editor from '@tinymce/tinymce-vue';

interface Props {
  modelValue: string;
  apiKey: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const editorContent = ref(props.modelValue);

const editorConfig = {
  height: 400,
  menubar: false,
  plugins: [
    'advlist autolink lists link image charmap print preview anchor',
    'searchreplace visualblocks code fullscreen',
    'insertdatetime media table paste code help wordcount'
  ],
  toolbar:
    'undo redo | formatselect | bold italic backcolor | \
    alignleft aligncenter alignright alignjustify | \
    bullist numlist outdent indent | removeformat | help',
  content_style: 'body { font-family: "Be Vietnam Pro", Helvetica, Arial, sans-serif; font-size:14px; color: #e0e0e0; background-color: #333; }',
  skin: 'oxide-dark', 
  content_css: 'dark', 
};

watch(() => props.modelValue, (newValue) => {
  if (newValue !== editorContent.value) {
    editorContent.value = newValue;
  }
});

watch(editorContent, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>

<style scoped>
.chapter-content-editor {
  border-radius: 8px;
  overflow: hidden; 
  border: 1px solid #22c55e; /* Màu xanh lá cây cho viền TinyMCE */
  box-shadow: inset 0 0 5px rgba(34, 197, 94, 0.2);
}

/* Override TinyMCE internal styles with green theme */
:deep(.tox .tox-editor-header) {
  background-color: #3a3f4b !important;
  border-bottom: 1px solid #22c55e !important; /* Xanh lá */
}

:deep(.tox .tox-toolbar-group) {
  background-color: #3a3f4b !important;
}

:deep(.tox .tox-toolbar__group) {
  border-right: 1px solid #22c55e !important; /* Xanh lá */
}

:deep(.tox .tox-menubar) {
    background-color: #3a3f4b !important;
    border-bottom: 1px solid #22c55e !important; /* Xanh lá */
}

:deep(.tox .tox-statusbar) {
    background-color: #3a3f4b !important;
    border-top: 1px solid #22c55e !important; /* Xanh lá */
    color: #e0e0e0 !important;
}

:deep(.tox .tox-tbtn) {
    color: #e0e0e0 !important;
}

:deep(.tox .tox-tbtn:hover) {
    background-color: #4b5563 !important; /* Nền hover nhẹ hơn */
}

:deep(.tox .tox-tbtn--enabled) { /* Màu cho nút đang active */
  background-color: #22c55e !important;
  color: #1a1d29 !important;
}

:deep(.tox .tox-tbtn--enabled:hover) {
  background-color: #4ade80 !important;
}

:deep(.tox .tox-collection__item--active) {
  background-color: #22c55e !important;
  color: #1a1d29 !important;
}

:deep(.tox .tox-selectfield) {
  background-color: #444 !important;
  border-color: #22c55e !important;
  color: #e0e0e0 !important;
}

:deep(.tox .tox-selectfield:focus) {
  box-shadow: 0 0 5px rgba(34, 197, 94, 0.5) !important;
}
</style>