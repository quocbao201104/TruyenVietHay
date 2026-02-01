<!-- src/App.vue -->
<template>
  <MainLayout>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </MainLayout>
</template>

<script setup>
import MainLayout from "./layouts/MainLayout.vue";
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppToast } from '@/composables/useAppToast';

const route = useRoute();
const router = useRouter();
const { showSuccessToast, showErrorToast, showWarningToast } = useAppToast();

watch(() => route.query.toast, (toastType) => {
  if (!toastType) return;

  const toastMap = {
    'session_expired': { type: 'error', msg: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' },
    'unauthorized': { type: 'error', msg: 'Bạn không có quyền truy cập trang này.' },
    'already_logged_in': { type: 'warning', msg: 'Bạn đang đăng nhập. Vội thế nhà bạn có cỗ à.' },
  };

  const notification = toastMap[toastType];
  if (notification) {
     if (notification.type === 'error') showErrorToast(notification.msg);
     else if (notification.type === 'warning') showWarningToast(notification.msg);
     else showSuccessToast(notification.msg);
     
     // Remove query param to clean URL
     const query = { ...route.query };
     delete query.toast;
     router.replace({ query }); 
  }
});
</script>

<!-- <style>
/* Reset CSS để loại bỏ style mặc định của browser */
html,
body {
  margin: 0 !important;
  padding: 0 !important;
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #1a1d29;
  color: #2c3e50;
  width: 100vw;
  min-height: 100vh;
  height: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Global Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> -->
