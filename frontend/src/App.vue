<!-- src/App.vue -->
<template>
  <div v-if="authStore.isInitialLoading" class="app-loading">
    <div class="loader-container">
      <div class="loader"></div>
      <p>Đang tải dữ liệu...</p>
    </div>
  </div>
  <MainLayout v-else>
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
import { useAuthStore } from '@/modules/auth/auth.store';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
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

<style>
/* Reset CSS */
html,
body {
  margin: 0 !important;
  padding: 0 !important;
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  background: #1a1d29;
}

#app {
  font-family: 'Be Vietnam Pro', Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #1a1d29;
  color: #ffffff;
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

/* Premium Loading Screen */
.app-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #1a1d29;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loader-container {
  text-align: center;
}

.loader {
  width: 48px;
  height: 48px;
  border: 4px solid #3b82f6;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
  margin-bottom: 1rem;
}

.loader-container p {
  color: #3b82f6;
  font-weight: 500;
  letter-spacing: 0.05em;
  font-size: 0.9rem;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
</style>
