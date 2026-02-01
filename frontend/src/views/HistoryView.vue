<template>
  <div class="history-view-container">
    
    <main class="main-content">
      <div class="container">
        <!-- Page Header -->
        <div class="section-header-block">
          <h2 class="section-title">Lịch Sử Đọc</h2>
          <div class="section-divider"></div>
        </div>

        <!-- Loading Skeleton -->
        <div v-if="historyStore.loading" class="loading-container">
          <div class="skeleton-list">
            <div v-for="n in 6" :key="n" class="skeleton-item">
              <div class="skeleton-image"></div>
              <div class="skeleton-content">
                <div class="skeleton-text"></div>
                <div class="skeleton-text short"></div>
                <div class="skeleton-text shorter"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="historyStore.error" class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>{{ historyStore.error }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="historyStore.history.length === 0" class="empty-state">
          <i class="fas fa-book-reader"></i>
          <h3>Bạn chưa đọc truyện nào</h3>
          <p>Lịch sử đọc sẽ được lưu lại để bạn tiếp tục đọc dễ dàng hơn!</p>
          <router-link to="/truyen-chu" class="explore-btn">
            <i class="fas fa-compass"></i>
            Khám phá truyện
          </router-link>
        </div>

        <!-- History List -->
        <div v-else class="history-content">
          <div class="history-list">
            <div v-for="item in historyStore.history" :key="item.truyen_id" class="history-item">
              <!-- Story Cover -->
              <router-link :to="`/truyen-chu/${item.truyen_slug}`" class="history-cover">
                <img 
                  :src="item.anh_bia" 
                  :alt="item.ten_truyen"
                  class="cover-image"
                  @error="handleImageError"
                />
              </router-link>

              <!-- Story Info -->
              <div class="history-info">
                <router-link :to="`/truyen-chu/${item.truyen_slug}`" class="story-title">
                  {{ item.ten_truyen }}
                </router-link>
                
                <div class="chapter-info">
                  <span class="label">Đọc tiếp:</span>
                  <span class="chapter-text">{{ item.chuong_moi_nhat }}</span>
                </div>

                <div class="time-info">
                  <i class="far fa-clock"></i>
                  <span>{{ timeAgo(item.thoi_gian_doc) }}</span>
                </div>
              </div>

              <!-- Continue Reading Button -->
              <router-link 
                v-if="item.chuong_slug"
                :to="`/truyen-chu/${item.truyen_slug}/${item.chuong_slug}`" 
                class="continue-btn"
              >
                <i class="fas fa-play"></i>
                Đọc tiếp
              </router-link>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="historyStore.pagination.total_pages > 1" class="pagination-container">
            <button 
              class="pagination-btn" 
              :disabled="!historyStore.hasPrevPage"
              @click="historyStore.prevPage()"
            >
              <i class="fas fa-chevron-left"></i>
              Trước
            </button>
            
            <span class="pagination-info">
              Trang {{ historyStore.pagination.page }} / {{ historyStore.pagination.total_pages }}
            </span>
            
            <button 
              class="pagination-btn" 
              :disabled="!historyStore.hasNextPage"
              @click="historyStore.nextPage()"
            >
              Sau
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useHistoryStore } from '@/modules/history/history.store';

const historyStore = useHistoryStore();

// Fetch history on mount
onMounted(() => {
  historyStore.fetchHistory();
});

// Handle image load error
// Handle image load error
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = '/placeholder.jpg';
};

const timeAgo = (date: string) => {
    if (!date) return '';
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " phút";
    return "Vừa xong";
};
</script>

<style scoped>
/* ===== Container & Layout ===== */
.history-view-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #1a1d29;
  color: #ffffff;
  font-family: "Be Vietnam Pro", "Roboto", sans-serif;
}

.main-content {
  flex-grow: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 40px 20px;
}

.container {
  width: 100%;
}

/* ===== Header Section ===== */
.section-header-block {
  margin-bottom: 40px;
  text-align: center;
}

.section-title {
  font-size: 2.8rem;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 15px;
  display: inline-block;
}

.section-divider {
  height: 4px;
  width: 200px;
  background: linear-gradient(90deg, transparent, #4caf50, transparent);
  margin: 0 auto;
  border-radius: 2px;
}

/* ===== Loading Skeleton ===== */
.loading-container {
  padding: 20px 0;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skeleton-item {
  display: flex;
  gap: 20px;
  background: #2a2d3a;
  border-radius: 12px;
  padding: 20px;
}

.skeleton-image {
  width: 100px;
  height: 140px;
  background: linear-gradient(90deg, #2a2d3a 25%, #3e4256 50%, #2a2d3a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
  flex-shrink: 0;
}

.skeleton-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
}

.skeleton-text {
  height: 20px;
  background: linear-gradient(90deg, #2a2d3a 25%, #3e4256 50%, #2a2d3a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-text.short {
  width: 70%;
  height: 16px;
}

.skeleton-text.shorter {
  width: 40%;
  height: 14px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* ===== Error State ===== */
.error-message {
  text-align: center;
  padding: 60px 20px;
  background: #2a2d3a;
  border-radius: 12px;
  border: 2px solid #f44336;
  margin: 20px 0;
}

.error-message i {
  font-size: 3rem;
  color: #f44336;
  margin-bottom: 20px;
}

.error-message p {
  font-size: 1.2rem;
  color: #cccccc;
}

/* ===== Empty State ===== */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: #2a2d3a;
  border-radius: 12px;
  border: 2px dashed #4caf50;
  margin: 20px 0;
}

.empty-state i {
  font-size: 4rem;
  color: #4caf50;
  margin-bottom: 20px;
  opacity: 0.7;
}

.empty-state h3 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 10px;
}

.empty-state p {
  font-size: 1.1rem;
  color: #cccccc;
  margin-bottom: 30px;
}

.explore-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  color: #ffffff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.explore-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  background: linear-gradient(135deg, #66bb6a, #4caf50);
}

/* ===== History List ===== */
.history-content {
  margin-top: 20px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.history-item {
  display: flex;
  gap: 20px;
  background: #2a2d3a;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.history-item:hover {
  border-color: #4caf50;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.2);
}

.history-cover {
  flex-shrink: 0;
  width: 100px;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.history-item:hover .history-cover {
  transform: scale(1.05);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.history-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

.story-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffffff;
  text-decoration: none;
  transition: color 0.3s ease;
}

.story-title:hover {
  color: #4caf50;
}

.chapter-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
}

.chapter-info .label {
  color: #999;
}

.chapter-info .chapter-text {
  color: #4caf50;
  font-weight: 600;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #666;
}

.time-info i {
  font-size: 0.85rem;
}

.continue-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  color: #ffffff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  height: fit-content;
  align-self: center;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  background: linear-gradient(135deg, #66bb6a, #4caf50);
}

/* ===== Pagination ===== */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
  padding: 20px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #2a2d3a;
  color: #ffffff;
  border: 2px solid #4caf50;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #4caf50;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  border-color: #666;
}

.pagination-info {
  font-size: 1.1rem;
  font-weight: 600;
  color: #4caf50;
  padding: 0 20px;
}

/* ===== Responsive Design ===== */
/* Responsive Design */
@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
  }

  /* Vertical List of Horizontal Cards */
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .history-item {
    flex-direction: row; /* Horizontal layout */
    align-items: flex-start;
    padding: 12px;
    background: #2a2d3a;
    border: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    gap: 12px;
  }

  .history-cover {
    width: 90px;
    height: 120px; /* Exact size */
    aspect-ratio: auto;
    border-radius: 6px;
    margin-bottom: 0;
    flex-shrink: 0;
  }

  .history-info {
    width: auto;
    flex: 1;
    gap: 6px;
    align-items: flex-start;
    min-width: 0; /* Prevent overflow */
  }

  .story-title {
    font-size: 1rem;
    line-height: 1.3;
    min-height: auto;
    margin-bottom: 4px;
    /* standard property for compatibility */
    line-clamp: 2; 
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .chapter-info {
    font-size: 0.85rem;
    flex-wrap: nowrap;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    justify-content: flex-start;
  }
  
  .chapter-info .label {
      display: inline-block; /* Show label again if room permits, or keep hidden */
      display: none;
  }

  .time-info {
    font-size: 0.75rem;
    margin-top: 4px;
    justify-content: flex-start;
  }

  /* Compact Continue Button - Positioned absolutely or integrated */
  .continue-btn {
    width: auto;
    padding: 6px 12px;
    margin-top: 8px;
    font-size: 0.8rem;
    background: rgba(76, 175, 80, 0.15); /* Subtler button */
    color: #4ade80;
    border: 1px solid rgba(76, 175, 80, 0.3);
  }

  .pagination-container {
    flex-direction: row;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 12px;
  }
  
  .history-cover {
    width: 80px;
    height: 110px;
  }
}
</style>
