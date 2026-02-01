<template>
  <div class="not-found-page">
    

    <main class="not-found-container">
      <div class="not-found-card">
        <div class="error-visual">
          <i class="fas fa-ghost ghost-icon"></i>
          <h1 class="error-code">404</h1>
        </div>
        <h2 class="error-title">Ôi không! Không tìm thấy trang.</h2>
        <p class="error-message">
          Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên, hoặc không tồn tại.
          Đừng lo lắng, bạn có thể quay lại trang an toàn.
        </p>
        <div class="action-buttons">
          <router-link to="/truyen-chu" class="btn-home">
            <i class="fas fa-home"></i> Về Trang Chủ
          </router-link>
          </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'; 

// const router = useRouter();
// const goBack = () => {
//   router.go(-1); // Quay lại trang trước đó
// };
</script>

<style scoped>
/* General Page Layout */
.not-found-page {
  min-height: 100vh;
  background: #1a1d29; 
  color: #ffffff;
  display: flex;
  flex-direction: column;
  font-family: 'Manrope', sans-serif;
}

.not-found-container {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.not-found-card {
  backdrop-filter: blur(15px);
  border-radius: 1rem;
  text-align: center;
  max-width: 800px;
  width: 100%;
  animation: fade-in-up 0.8s ease-out;
}

.error-visual {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  position: relative;
}

.ghost-icon {
  font-size: 5rem;
  color: #ef4444; 
  margin-right: 1rem;
  animation: float-shimmer 2s infinite ease-in-out;
}

.error-code {
  font-family: 'Sora', sans-serif;
  font-size: 6rem; 
  font-weight: 700;
  color: #22c55e; 
  line-height: 1;
  text-shadow: 0 0 15px rgba(34, 197, 94, 0.5);
}

.error-title {
  font-family: 'Sora', sans-serif;
  font-size: 2.2rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.btn-home,
.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1.8rem;
  border-radius: 0.75rem;
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-home {
  background: #22c55e;
  color: #1a1d29;
  border: 1px solid #22c55e;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
}

.btn-home:hover {
  background: #4ade80;
  box-shadow: 0 6px 20px rgba(34, 197, 94, 0.6);
  transform: translateY(-2px);
}

.btn-back {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: #ffffff;
  transform: translateY(-2px);
}

/* Animations */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float-shimmer {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-8px) scale(1.05);
    opacity: 0.8;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .not-found-card {
    padding: 2rem 1.5rem;
  }
  .error-code {
    font-size: 5rem;
  }
  .ghost-icon {
    font-size: 4rem;
  }
  .error-title {
    font-size: 1.8rem;
  }
  .error-message {
    font-size: 1rem;
  }
  .action-buttons {
    flex-direction: column;
    gap: 1rem;
  }
  .btn-home,
  .btn-back {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .not-found-card {
    padding: 1.5rem 1rem;
  }
  .error-code {
    font-size: 4rem;
  }
  .ghost-icon {
    font-size: 3.5rem;
  }
  .error-title {
    font-size: 1.5rem;
  }
  .error-message {
    font-size: 0.9rem;
  }
}
</style>