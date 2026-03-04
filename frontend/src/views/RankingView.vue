<template>
  <div class="ranking-container">
    
    <main class="main-content">
      <div class="container">
        
        <!-- THIÊN BẢNG HEADER -->
        <div class="section-header-block animate-fadeIn">
          <div class="title-wrapper">
             <i class="fas fa-crown crown-main"></i>
             <h2 class="section-title">Thiên Bảng Đánh Giá</h2>
          </div>
          <p class="section-subtitle">Thần vật xuất thế - Vạn người bái phục</p>
          <div class="section-divider-aura">
            <div class="divider-dot"></div>
          </div>
        </div>

        <!-- LOADING SKELETON (ĐÃ ĐỔI TONE MÀU TU TIÊN) -->
        <div v-if="rankingStore.loading" class="loading-container">
          <div class="skeleton-list">
            <div v-for="n in 10" :key="n" class="skeleton-item-pill">
              <div class="skeleton-rank-circle"></div>
              <div class="skeleton-cover-v2"></div>
              <div class="skeleton-content-v2">
                <div class="shimmer-line"></div>
                <div class="shimmer-line short"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- ERROR STATE -->
        <div v-else-if="rankingStore.error" class="error-message-aura">
          <i class="fas fa-biohazard"></i>
          <p>Thiên cơ nhiễu loạn: {{ rankingStore.error }}</p>
        </div>

        <!-- EMPTY STATE -->
        <div v-else-if="rankingStore.topRatedStories.length === 0" class="empty-state-aura">
          <i class="fas fa-scroll"></i>
          <h3>Vô Danh Bảng</h3>
          <p>Chưa có linh vật nào đủ phẩm cấp để lên bảng.</p>
        </div>

        <!-- TOP RATED LIST (LỆNH BÀI THIÊN BẢNG) -->
        <div v-else class="ranking-content">
          <div class="ranking-list-v2">
            <div 
              v-for="(story, index) in rankingStore.topRatedStories" 
              :key="story.id" 
              class="ranking-pill"
              :class="getRankClass(index)"
            >
              <!-- Rank Aura (Hào quang phía sau cho Top 3) -->
              <div v-if="index < 3" class="rank-aura-glow"></div>

              <!-- Cảnh Giới Ấn (Rank Circle) -->
              <div class="rank-indicator">
                <div class="circle-inner">
                  <span class="rank-num">{{ index + 1 }}</span>
                  <i v-if="index < 3" class="fas fa-crown mini-crown"></i>
                </div>
              </div>

              <!-- Bìa Truyện (Linh Vật) -->
              <router-link :to="`/truyen-chu/${story.slug}`" class="story-cover-pill">
                <img 
                  :src="getImageUrl(story.anh_bia)" 
                  :alt="story.ten_truyen"
                  class="cover-img"
                  @error="handleImageError"
                />
              </router-link>

              <!-- Thông Tin Chi Tiết -->
              <div class="story-details">
                <router-link :to="`/truyen-chu/${story.slug}`" class="title-link">
                  {{ story.ten_truyen }}
                </router-link>
                
                <div class="meta-row">
                  <span class="author-tag">
                    <i class="fas fa-feather-alt"></i> {{ story.tac_gia }}
                  </span>
                  <span class="stat-tag">
                    <i class="fas fa-eye"></i> {{ formatNumber(story.luot_xem) }}
                  </span>
                  <span v-if="story.total_ratings" class="stat-tag">
                    <i class="fas fa-comment-dots"></i> {{ formatNumber(story.total_ratings) }}
                  </span>
                </div>
              </div>

              <!-- Linh Đan Score (Rating Badge) -->
              <div class="score-crystal">
                <div class="star-row">
                   <i class="fas fa-star"></i>
                   <span class="val">{{ Number(story.avg_rating).toFixed(1) }}</span>
                </div>
                <span class="total">/ 5.0</span>
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

onMounted(() => {
  rankingStore.fetchTopRated();
});

const getRankClass = (index: number): string => {
  if (index === 0) return 'rank-top-1';
  if (index === 1) return 'rank-top-2';
  if (index === 2) return 'rank-top-3';
  return '';
};

const formatNumber = (num: number): string => {
  if (!num) return '0';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = '/placeholder.jpg';
};
</script>

<style scoped>
/* ===== CORE THEME ===== */
.ranking-container {
  min-height: 100vh;
  background: #0b0f19; /* Nền tối sâu */
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
  padding-bottom: 50px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

/* ===== HEADER TU TIEN ===== */
.section-header-block {
  text-align: center;
  margin-bottom: 60px;
}

.title-wrapper {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

.crown-main {
  font-size: 2.5rem;
  color: #fbbf24;
  filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.6));
  margin-bottom: 10px;
}

.section-title {
  font-size: 3rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 5px;
  background: linear-gradient(to right, #fbbf24, #fff, #fbbf24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.3));
}

.section-subtitle {
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-top: 10px;
}

.section-divider-aura {
  height: 1px;
  width: 300px;
  background: linear-gradient(90deg, transparent, #fbbf24, transparent);
  margin: 20px auto;
  position: relative;
}

.divider-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: #fbbf24;
  box-shadow: 0 0 10px #fbbf24;
}

/* ===== RANKING PILL (LỆNH BÀI) ===== */
.ranking-list-v2 {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ranking-pill {
  display: flex;
  align-items: center;
  background: #131b2c;
  border: 1px solid #1e293b;
  border-radius: 50px; /* Kiểu Pill */
  padding: 10px 25px 10px 10px;
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.ranking-pill:hover {
  transform: translateX(15px);
  border-color: #34d39960;
  background: #1a2436;
}

/* Rank Indicator (Circle) */
.rank-indicator {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  padding: 3px;
  background: #1e293b;
  border-radius: 50%;
  z-index: 5;
}

.circle-inner {
  width: 100%;
  height: 100%;
  background: #0b0f19;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #334155;
  position: relative;
}

.rank-num {
  font-size: 1.5rem;
  font-weight: 900;
  color: #475569;
}

/* Aura Glow & Top Rank Colors */
.rank-aura-glow {
  position: absolute;
  inset: 0;
  border-radius: 50px;
  opacity: 0;
  filter: blur(20px);
  transition: opacity 0.4s;
  pointer-events: none;
}

.ranking-pill:hover .rank-aura-glow {
  opacity: 0.15;
}

/* Top 1 - Kim */
.rank-top-1 { border-color: #fbbf2460; }
.rank-top-1 .circle-inner { border-color: #fbbf24; background: #fbbf2420; }
.rank-top-1 .rank-num { color: #fbbf24; }
.rank-top-1 .rank-aura-glow { background: #fbbf24; }

/* Top 2 - Ngân */
.rank-top-2 { border-color: #cbd5e160; }
.rank-top-2 .circle-inner { border-color: #cbd5e1; background: #cbd5e120; }
.rank-top-2 .rank-num { color: #cbd5e1; }
.rank-top-2 .rank-aura-glow { background: #cbd5e1; }

/* Top 3 - Đồng */
.rank-top-3 { border-color: #b4530960; }
.rank-top-3 .circle-inner { border-color: #b45309; background: #b4530920; }
.rank-top-3 .rank-num { color: #b45309; }
.rank-top-3 .rank-aura-glow { background: #b45309; }

.mini-crown {
  position: absolute;
  top: -8px;
  font-size: 0.7rem;
  color: inherit;
}

/* Story Cover */
.story-cover-pill {
  width: 70px;
  height: 95px;
  border-radius: 12px;
  overflow: hidden;
  margin-left: 10px;
  flex-shrink: 0;
  box-shadow: 0 5px 15px rgba(0,0,0,0.4);
  border: 1px solid #334155;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.ranking-pill:hover .cover-img {
  transform: scale(1.1);
}

/* Story Details */
.story-details {
  flex-grow: 1;
  margin-left: 20px;
  min-width: 0;
}

.title-link {
  font-size: 1.3rem;
  font-weight: 800;
  color: #f8fafc;
  text-decoration: none;
  display: block;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s;
}

.title-link:hover {
  color: #34d399;
}

.meta-row {
  display: flex;
  gap: 15px;
  font-size: 0.8rem;
  color: #64748b;
}

.meta-row span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.meta-row i {
  color: #34d399;
}

.quality-tags {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.tag-pill {
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.2);
  color: #34d399;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 900;
}

.tag-pill.gold {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.3);
  color: #fbbf24;
}

/* Score Crystal */
.score-crystal {
  background: #0b0f19;
  border: 1px solid #1e293b;
  padding: 10px 15px;
  border-radius: 20px;
  text-align: center;
  min-width: 80px;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
}

.star-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #fbbf24;
}

.star-row .val {
  font-size: 1.4rem;
  font-weight: 900;
}

.score-crystal .total {
  font-size: 0.6rem;
  color: #475569;
  text-transform: uppercase;
  font-weight: 700;
}

/* ===== SKELETON ANIMATION ===== */
.skeleton-item-pill {
  height: 100px;
  background: #131b2c;
  border-radius: 50px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  overflow: hidden;
  position: relative;
}

.shimmer-line {
  height: 15px;
  background: #1e293b;
  margin-bottom: 10px;
  border-radius: 4px;
  width: 200px;
}

.shimmer-line::after {
  content: "";
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.05), transparent);
  animation: shimmer-swipe 2s infinite;
}

@keyframes shimmer-swipe {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .section-title { font-size: 1.8rem; letter-spacing: 2px; }
  
  .ranking-pill {
    border-radius: 20px;
    padding-right: 15px;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  
  .story-details {
    width: calc(100% - 170px);
    margin-left: 10px;
  }
  
  .title-link { font-size: 1rem; }
  
  .score-crystal {
    order: 3;
    margin-top: 10px;
    width: 100%;
    padding: 5px;
    background: transparent;
    border: none;
    box-shadow: none;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 5px;
  }

  .star-row .val { font-size: 1rem; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>