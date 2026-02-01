<template>
  <div class="ranking-container">
    
    <main class="main-content">
      <div class="container">
        <!-- Page Header -->
        <div class="section-header-block">
          <h2 class="section-title">
            <i class="fas fa-star"></i>
            Xếp Hạng Đánh Giá
          </h2>
          <p class="section-subtitle">Top truyện được đánh giá cao nhất</p>
          <div class="section-divider"></div>
        </div>

        <!-- Loading Skeleton -->
        <div v-if="rankingStore.loading" class="loading-container">
          <div class="skeleton-list">
            <div v-for="n in 20" :key="n" class="skeleton-item">
              <div class="skeleton-rank"></div>
              <div class="skeleton-cover"></div>
              <div class="skeleton-content">
                <div class="skeleton-text"></div>
                <div class="skeleton-text short"></div>
              </div>
              <div class="skeleton-views"></div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="rankingStore.error" class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>{{ rankingStore.error }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="rankingStore.topRatedStories.length === 0" class="empty-state">
          <i class="fas fa-star-half-alt"></i>
          <h3>Chưa có dữ liệu</h3>
          <p>Danh sách xếp hạng sẽ được cập nhật sớm!</p>
        </div>

        <!-- Top Rated Stories List -->
        <div v-else class="ranking-content">
          <div class="ranking-list">
            <div 
              v-for="(story, index) in rankingStore.topRatedStories" 
              :key="story.id" 
              class="ranking-item"
              :class="getRankClass(index)"
            >
              <!-- Rank Badge -->
              <div class="rank-badge">
                <span class="rank-number">{{ index + 1 }}</span>
                <i v-if="index < 3" class="fas fa-crown rank-icon"></i>
              </div>

              <!-- Story Cover -->
              <router-link :to="`/truyen-chu/${story.slug}`" class="story-cover">
                <img 
                  :src="getImageUrl(story.anh_bia)" 
                  :alt="story.ten_truyen"
                  class="cover-image"
                  @error="handleImageError"
                />
              </router-link>

              <!-- Story Info -->
              <div class="story-info">
                <router-link :to="`/truyen-chu/${story.slug}`" class="story-title">
                  {{ story.ten_truyen }}
                </router-link>
                
                <div class="story-author">
                  <i class="fas fa-pen-nib"></i>
                  {{ story.tac_gia }}
                </div>

                <div class="story-stats">
                  <span class="stat-item">
                    <i class="fas fa-eye"></i>
                    {{ formatNumber(story.luot_xem) }} lượt xem
                  </span>
                  <span v-if="story.total_ratings" class="stat-item">
                    <i class="fas fa-comment"></i>
                    {{ formatNumber(story.total_ratings) }} đánh giá
                  </span>
                </div>
              </div>

              <!-- Rating Badge -->
              <div class="rating-badge">
                <i class="fas fa-star"></i>
                <span class="rating-value">{{ Number(story.avg_rating).toFixed(1) }}</span>
                <span class="rating-label">/ 5.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRankingStore } from '@/modules/ranking/ranking.store';
import { getImageUrl } from "@/config/constants";

const rankingStore = useRankingStore();

// Fetch top rated stories on mount
onMounted(() => {
  rankingStore.fetchTopRated();
});

// Get rank class based on position
const getRankClass = (index: number): string => {
  if (index === 0) return 'rank-1';
  if (index === 1) return 'rank-2';
  if (index === 2) return 'rank-3';
  return '';
};

// Format number with K/M suffix
const formatNumber = (num: number): string => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

// Get image URL with proper path handling
// Local getImageUrl removed for global helper

// Handle image load error
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = '/placeholder.jpg';
};
</script>

<style scoped>
/* ===== Container & Layout ===== */
.ranking-container {
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
  margin-bottom: 10px;
  display: inline-flex;
  align-items: center;
  gap: 15px;
}

.section-title i {
  color: #fbbf24;
  animation: star-pulse 2s infinite;
}

@keyframes star-pulse {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
  50% { transform: scale(1.1) rotate(5deg); opacity: 0.8; }
}

.section-subtitle {
  font-size: 1.1rem;
  color: #999;
  margin-bottom: 15px;
}

.section-divider {
  height: 4px;
  width: 200px;
  background: linear-gradient(90deg, transparent, #fbbf24, transparent);
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
  gap: 16px;
}

.skeleton-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #2a2d3a;
  border-radius: 12px;
  padding: 16px;
}

.skeleton-rank {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #2a2d3a 25%, #3e4256 50%, #2a2d3a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-cover {
  width: 80px;
  height: 110px;
  border-radius: 8px;
  background: linear-gradient(90deg, #2a2d3a 25%, #3e4256 50%, #2a2d3a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-text {
  height: 18px;
  background: linear-gradient(90deg, #2a2d3a 25%, #3e4256 50%, #2a2d3a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-text.short {
  width: 60%;
  height: 14px;
}

.skeleton-views {
  width: 80px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(90deg, #2a2d3a 25%, #3e4256 50%, #2a2d3a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
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
  margin: 20px 0;
}

.empty-state i {
  font-size: 4rem;
  color: #fbbf24;
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
}

/* ===== Ranking List ===== */
.ranking-content {
  margin-top: 20px;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #2a2d3a;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
}

.ranking-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  border-color: #fbbf24;
}

/* Special styling for top 3 */
.ranking-item.rank-1 {
  background: linear-gradient(135deg, #2a2d3a 0%, #fbbf2420 100%);
  border-color: #ffd700;
}

.ranking-item.rank-2 {
  background: linear-gradient(135deg, #2a2d3a 0%, #fbbf2415 100%);
  border-color: #c0c0c0;
}

.ranking-item.rank-3 {
  background: linear-gradient(135deg, #2a2d3a 0%, #fbbf2410 100%);
  border-color: #cd7f32;
}

/* Rank Badge */
.rank-badge {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #3e4256;
  flex-shrink: 0;
}

.rank-1 .rank-badge {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.rank-2 .rank-badge {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
  box-shadow: 0 0 15px rgba(192, 192, 192, 0.5);
}

.rank-3 .rank-badge {
  background: linear-gradient(135deg, #cd7f32, #e8a66d);
  box-shadow: 0 0 15px rgba(205, 127, 50, 0.5);
}

.rank-number {
  font-size: 1.4rem;
  font-weight: 900;
  color: #1a1d29;
}

.rank-1 .rank-number,
.rank-2 .rank-number,
.rank-3 .rank-number {
  color: #1a1d29;
}

.rank-icon {
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 0.7rem;
  color: #ffd700;
  filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.8));
}

/* Story Cover */
.story-cover {
  flex-shrink: 0;
  width: 80px;
  height: 110px;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.ranking-item:hover .story-cover {
  transform: scale(1.05);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Story Info */
.story-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.story-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  text-decoration: none;
  transition: color 0.3s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.story-title:hover {
  color: #fbbf24;
}

.story-author {
  font-size: 0.9rem;
  color: #999;
  display: flex;
  align-items: center;
  gap: 6px;
}

.story-author i {
  font-size: 0.8rem;
}

.story-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.85rem;
  color: #666;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.stat-item i {
  color: #fbbf24;
}

/* Rating Badge */
.rating-badge {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fbbf24, #fcd34d);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.rating-badge i {
  font-size: 1.2rem;
  color: #1a1d29;
  margin-bottom: 4px;
}

.rating-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a1d29;
}

.rating-label {
  font-size: 0.75rem;
  color: #1a1d29;
  opacity: 0.7;
}

/* ===== Responsive Design ===== */
/* ===== Responsive Design ===== */
@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
  }

  /* Convert List to Grid 2 Columns */
  .ranking-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .ranking-item {
    flex-direction: column;
    align-items: flex-start;
    padding: 12px;
    height: 100%;
    position: relative;
    border: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  .rank-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    width: 32px;
    height: 32px;
    z-index: 2;
    box-shadow: 0 2px 5px rgba(0,0,0,0.5);
  }

  .rank-number {
    font-size: 1rem;
  }

  .rank-icon {
    top: -4px;
    right: -4px;
    font-size: 0.6rem;
  }

  /* Cover becomes top part of card */
  .story-cover {
    width: 100%;
    height: auto;
    aspect-ratio: 2/3;
    margin-bottom: 10px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }
  
  .story-info {
    width: 100%;
    flex-basis: auto;
    gap: 6px;
  }

  .story-title {
    font-size: 1rem;
    line-height: 1.3;
    margin-bottom: 4px;
    min-height: 2.6em; /* Align cards */
  }

  .story-author {
    font-size: 0.8rem;
    margin-bottom: 4px;
  }

  .story-stats {
    flex-wrap: wrap;
    gap: 8px;
    font-size: 0.75rem;
  }

  .rating-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 4px 8px;
    border-radius: 8px;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    box-shadow: none;
    flex-direction: row;
    gap: 4px;
  }

  .rating-badge i {
    font-size: 0.8rem;
    color: #fbbf24;
    margin: 0;
  }

  .rating-value {
    font-size: 0.9rem;
    color: #fff;
  }

  .rating-label {
    display: none;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 16px;
  }
  
  .ranking-list {
    gap: 12px;
  }
}
</style>
