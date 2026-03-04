<template>
  <div class="story-pict-placeholder-page">
    <main class="placeholder-container">
      <div class="placeholder-card animate-fadeIn">
        <div class="visual-wrapper">
          <div class="icon-glow"></div>
          <i class="fas fa-palette dev-icon"></i>
        </div>
        
        <h1 class="dev-title">Giao Diện Truyện Tranh</h1>
        <h2 class="dev-subtitle">Tính năng đang được phát triển</h2>
        
        <p class="dev-message">
          Các họa sư của chúng tôi đang ngày đêm tu luyện để mang đến trải nghiệm đọc truyện tranh tuyệt vời nhất. 
          Đạo hữu vui lòng chờ và quay lại sau nhé!
        </p>
        
        <div class="action-buttons">
          <button @click="goBack" class="btn-action btn-back">
            <i class="fas fa-arrow-left"></i> Quay lại
          </button>
          <router-link to="/truyen-chu" class="btn-action btn-home">
            <i class="fas fa-book"></i> Xem Truyện Chữ
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  if (router) {
    router.back();
  } else {
    window.history.back();
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap");

.story-pict-placeholder-page {
  min-height: calc(100vh - 80px); /* Tương đối với header */
  background-color: #0b0f19;
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background-image: radial-gradient(circle at 50% 30%, rgba(52, 211, 153, 0.05) 0%, transparent 50%);
}

.placeholder-container {
  width: 100%;
  max-width: 600px;
}

.placeholder-card {
  background: #131b2c;
  border: 1px solid #1e293b;
  border-radius: 24px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;
}

/* Ánh sáng trang trí góc */
.placeholder-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, transparent, #34d399, transparent);
}

.visual-wrapper {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 100px;
  margin-bottom: 2rem;
}

.icon-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #34d399;
  border-radius: 50%;
  filter: blur(25px);
  opacity: 0.2;
  animation: pulse 3s infinite alternate;
}

.dev-icon {
  font-size: 3.5rem;
  color: #34d399;
  position: relative;
  z-index: 10;
  text-shadow: 0 0 15px rgba(52, 211, 153, 0.5);
}

.dev-title {
  font-size: 2rem;
  font-weight: 800;
  color: #f8fafc;
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
}

.dev-subtitle {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fbbf24;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.dev-message {
  font-size: 1.05rem;
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 2.5rem;
  padding: 0 1rem;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  min-width: 180px;
}

.btn-home {
  background: #34d399;
  color: #0b0f19;
  border: 1px solid #34d399;
  box-shadow: 0 4px 15px rgba(52, 211, 153, 0.3);
}

.btn-home:hover {
  background: #10b981;
  border-color: #10b981;
  box-shadow: 0 6px 20px rgba(52, 211, 153, 0.4);
  transform: translateY(-2px);
}

.btn-back {
  background: transparent;
  color: #cbd5e1;
  border: 1px solid #334155;
}

.btn-back:hover {
  background: rgba(51, 65, 85, 0.5);
  color: #f8fafc;
  border-color: #475569;
  transform: translateY(-2px);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.6s ease-out forwards;
}

@keyframes pulse {
  0% { transform: scale(0.8); opacity: 0.1; }
  100% { transform: scale(1.2); opacity: 0.3; }
}

/* Responsive */
@media (max-width: 640px) {
  .placeholder-card {
    padding: 2rem 1.5rem;
    border-radius: 20px;
  }
  
  .dev-title {
    font-size: 1.6rem;
  }
  
  .dev-subtitle {
    font-size: 1rem;
  }
  
  .action-buttons {
    flex-direction: column-reverse;
  }
  
  .btn-action {
    width: 100%;
  }
}
</style>