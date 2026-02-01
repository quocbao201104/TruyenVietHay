<template>
  <div class="favorites-view-container">
    
    <main class="main-content">
      <div class="container">
        <!-- Page Header -->
        <div class="section-header-block">
          <h2 class="section-title">Truyện Đang Theo Dõi</h2>
          <div class="section-divider"></div>
        </div>

        <!-- Loading Skeleton -->
        <div v-if="favoriteStore.loading" class="loading-container">
          <div class="skeleton-grid">
            <div v-for="n in 12" :key="n" class="skeleton-card">
              <div class="skeleton-image"></div>
              <div class="skeleton-text"></div>
              <div class="skeleton-text short"></div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="favoriteStore.error" class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>{{ favoriteStore.error }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="favoriteStore.favorites.length === 0" class="empty-state">
          <i class="fas fa-heart-broken"></i>
          <h3>Bạn chưa theo dõi truyện nào</h3>
          <p>Hãy khám phá và theo dõi những truyện yêu thích của bạn!</p>
          <router-link to="/truyen-chu" class="explore-btn">
            <i class="fas fa-compass"></i>
            Khám phá truyện
          </router-link>
        </div>

        <!-- Favorites Grid -->
        <div v-else class="favorites-content">
          <div class="favorites-grid">
            <div v-for="story in favoriteStore.favorites" :key="story.id" class="story-wrapper relative group">
              <NewStoryCard :story="story" />
              
              <!-- Unfavorite Button - Absolute Overlay -->
              <button 
                class="unfavorite-btn" 
                @click.prevent.stop="handleUnfollow(story.id, story.ten_truyen)"
                title="Bỏ theo dõi"
              >
                <i class="fas fa-heart"></i>
              </button>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="favoriteStore.totalPages > 1" class="pagination-container">
            <button 
              class="pagination-btn" 
              :disabled="!favoriteStore.hasPrevPage"
              @click="favoriteStore.prevPage()"
            >
              <i class="fas fa-chevron-left"></i>
              Trước
            </button>
            
            <span class="pagination-info">
              Trang {{ favoriteStore.pagination.page }} / {{ favoriteStore.totalPages }}
            </span>
            
            <button 
              class="pagination-btn" 
              :disabled="!favoriteStore.hasNextPage"
              @click="favoriteStore.nextPage()"
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
import { useFavoriteStore } from '@/modules/favorite/favorite.store';
import { getImageUrl } from "@/config/constants";
import NewStoryCard from '@/modules/storyText/components/NewStoryCard.vue';

const favoriteStore = useFavoriteStore();

// Fetch favorites on mount
onMounted(() => {
  favoriteStore.fetchFavorites();
});

// Handle image load error
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = '/placeholder.jpg';
};

// Handle unfollow click - Immediate Action
const handleUnfollow = async (storyId: number, storyTitle: string) => {
  await favoriteStore.toggleFollow(storyId);
};
</script>

<style scoped>
/* ===== Container & Layout ===== */
.favorites-view-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #1a1d29;
  color: #ffffff;
  font-family: "Be Vietnam Pro", "Roboto", sans-serif;
}

.main-content {
  flex-grow: 1;
  max-width: 1400px;
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

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.skeleton-card {
  background: #2a2d3a;
  border-radius: 12px;
  overflow: hidden;
}

.skeleton-image {
  width: 100%;
  height: 280px;
  background: linear-gradient(90deg, #2a2d3a 25%, #3e4256 50%, #2a2d3a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-text {
  height: 20px;
  background: linear-gradient(90deg, #2a2d3a 25%, #3e4256 50%, #2a2d3a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin: 12px 15px;
  border-radius: 4px;
}

.skeleton-text.short {
  width: 60%;
  height: 16px;
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

/* ===== Favorites Grid ===== */
.favorites-content {
  margin-top: 20px;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.story-wrapper {
  position: relative;
  height: 100%;
}

/* ===== Unfavorite Button ===== */
.unfavorite-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.9); /* Red */
  border: none;
  color: #ffffff;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1; /* Always visible */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  z-index: 10; /* Ensure on top of card */
  backdrop-filter: blur(4px);
}

.unfavorite-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(220, 38, 38, 0.4);
}

.unfavorite-btn:active {
  transform: scale(0.95);
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
@media (max-width: 1200px) {
  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
  }

  .favorites-grid, .skeleton-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }

  .story-image-wrapper {
    height: 220px;
  }

  .pagination-container {
    flex-direction: column;
    gap: 15px;
  }

  .pagination-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 20px 10px;
  }

  .section-title {
    font-size: 1.6rem;
  }

  .favorites-grid, .skeleton-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .story-image-wrapper {
    height: 200px;
  }

  .story-title {
    font-size: 0.95rem;
  }

  .empty-state {
    padding: 50px 15px;
  }

  .empty-state h3 {
    font-size: 1.3rem;
  }

  .empty-state i {
    font-size: 3rem;
  }
}


</style>
