<template>
  <div class="topview-container">
    
    <main class="main-content">
      <div class="container">
        
        <!-- THIÊN BẢNG HỎA CẤP HEADER -->
        <div class="section-header-block animate-fadeIn">
          <div class="title-wrapper">
             <i class="fas fa-fire-alt fire-main"></i>
             <h2 class="section-title">Thiên Bảng Hỏa Cấp</h2>
          </div>
          <p class="section-subtitle">Linh khí hội tụ - Vạn chúng chú mục</p>
          <div class="section-divider-aura">
            <div class="divider-dot"></div>
          </div>
        </div>

        <!-- LOADING SKELETON (TONE HỎA) -->
        <div v-if="topviewStore.loading" class="loading-container">
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
        <div v-else-if="topviewStore.error" class="error-message-aura">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Thiên cơ nhiễu loạn: {{ topviewStore.error }}</p>
        </div>

        <!-- EMPTY STATE -->
        <div v-else-if="topviewStore.topStories.length === 0" class="empty-state-aura">
          <i class="fas fa-burn"></i>
          <h3>Hỏa Quang Tắt Lịm</h3>
          <p>Chưa có linh vật nào đủ nhiệt độ để lên bảng.</p>
        </div>

        <!-- TOP STORIES LIST (LỆNH BÀI HỎA CẤP) -->
        <div v-else class="topview-content">
          <div class="topview-list-v2">
            <div 
              v-for="(story, index) in topviewStore.topStories" 
              :key="story.id" 
              class="ranking-pill hỏa-cấp"
              :class="getRankClass(index)"
            >
              <!-- Rank Aura (Hào quang Hỏa cho Top 3) -->
              <div v-if="index < 3" class="rank-aura-glow-fire"></div>

              <!-- Cảnh Giới Ấn (Rank Circle) -->
              <div class="rank-indicator">
                <div class="circle-inner">
                  <span class="rank-num">{{ index + 1 }}</span>
                  <i v-if="index < 3" class="fas fa-crown mini-crown"></i>
                </div>
              </div>

              <!-- Bìa Truyện -->
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
                    <i class="fas fa-feather-alt text-rose-500"></i> {{ story.tac_gia }}
                  </span>
                  <span class="stat-tag">
                    <i class="fas fa-eye text-orange-500"></i> {{ formatNumber(story.luot_xem) }}
                  </span>
                  <span v-if="story.luot_thich" class="stat-tag">
                    <i class="fas fa-heart text-pink-500"></i> {{ formatNumber(story.luot_thich) }}
                  </span>
                </div>
              </div>

              <!-- Nhiệt Độ (View Count Badge) -->
              <div class="score-crystal-fire">
                <div class="fire-row">
                   <i class="fas fa-fire-alt animate-pulse"></i>
                   <span class="val">{{ formatNumber(story.luot_xem) }}</span>
                </div>
                <span class="total">Nhiệt Độ</span>
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
import { useTopViewStore } from '@/modules/topview/topview.store';
import { getImageUrl } from "@/config/constants";

const topviewStore = useTopViewStore();

onMounted(() => {
  topviewStore.fetchTopView();
});

const getRankClass = (index: number): string => {
  if (index === 0) return 'rank-fire-1';
  if (index === 1) return 'rank-fire-2';
  if (index === 2) return 'rank-fire-3';
  return '';
};

const formatNumber = (num: number): string => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = '/placeholder.jpg';
};
</script>

<style scoped>
/* ===== CORE THEME - DARK CÀN KHÔN ===== */
.topview-container {
  min-height: 100vh;
  background: #0b0f19;
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
  padding-bottom: 50px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

/* ===== HEADER TU TIEN - HỎA CẤP ===== */
.section-header-block {
  text-align: center;
  margin-bottom: 60px;
}

.title-wrapper {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

.fire-main {
  font-size: 2.5rem;
  color: #f43f5e; /* Rose 500 */
  filter: drop-shadow(0 0 15px rgba(244, 63, 94, 0.6));
  margin-bottom: 10px;
}

.section-title {
  font-size: 3rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 5px;
  background: linear-gradient(to right, #f43f5e, #fff, #fb923c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 10px rgba(244, 63, 94, 0.3));
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
  background: linear-gradient(90deg, transparent, #f43f5e, transparent);
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
  background: #f43f5e;
  box-shadow: 0 0 10px #f43f5e;
}

/* ===== RANKING PILL (LỆNH BÀI HỎA) ===== */
.topview-list-v2 {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ranking-pill {
  display: flex;
  align-items: center;
  background: #131b2c;
  border: 1px solid #1e293b;
  border-radius: 50px;
  padding: 10px 25px 10px 10px;
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.ranking-pill:hover {
  transform: translateX(15px);
  border-color: #f43f5e60;
  background: #1a2436;
}

/* Rank Indicator */
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

/* Aura Glow Fire */
.rank-aura-glow-fire {
  position: absolute;
  inset: 0;
  border-radius: 50px;
  opacity: 0;
  filter: blur(25px);
  transition: opacity 0.4s;
  pointer-events: none;
}

.ranking-pill:hover .rank-aura-glow-fire {
  opacity: 0.15;
}

/* Top 1-2-3 Fire Colors */
.rank-fire-1 { border-color: #f43f5e80; }
.rank-fire-1 .circle-inner { border-color: #f43f5e; background: #f43f5e20; }
.rank-fire-1 .rank-num { color: #f43f5e; }
.rank-fire-1 .rank-aura-glow-fire { background: #f43f5e; }

.rank-fire-2 { border-color: #fb923c80; }
.rank-fire-2 .circle-inner { border-color: #fb923c; background: #fb923c20; }
.rank-fire-2 .rank-num { color: #fb923c; }
.rank-fire-2 .rank-aura-glow-fire { background: #fb923c; }

.rank-fire-3 { border-color: #facc1580; }
.rank-fire-3 .circle-inner { border-color: #facc15; background: #facc1520; }
.rank-fire-3 .rank-num { color: #facc15; }
.rank-fire-3 .rank-aura-glow-fire { background: #facc15; }

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
  box-shadow: 0 5px 15px rgba(0,0,0,0.5);
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
  color: #f43f5e;
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

.quality-tags {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.tag-pill {
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.2);
  color: #f43f5e;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 900;
}

.tag-pill.flame {
  background: rgba(251, 146, 60, 0.1);
  border-color: rgba(251, 146, 60, 0.3);
  color: #fb923c;
}

/* Score Crystal Fire */
.score-crystal-fire {
  background: #0b0f19;
  border: 1px solid #1e293b;
  padding: 10px 15px;
  border-radius: 20px;
  text-align: center;
  min-width: 90px;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
}

.fire-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #f43f5e;
}

.fire-row .val {
  font-size: 1.4rem;
  font-weight: 900;
}

.score-crystal-fire .total {
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
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .section-title { font-size: 1.8rem; letter-spacing: 2px; }
  
  /* Quay lại Grid 2 cột trên Mobile theo yêu cầu của Bảo */
  .topview-list-v2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .ranking-pill {
    flex-direction: column;
    border-radius: 20px;
    padding: 15px;
    height: 100%;
    align-items: center;
    text-align: center;
  }
  
  .rank-indicator {
    position: absolute;
    top: -10px;
    left: -10px;
    width: 40px;
    height: 40px;
  }
  
  .rank-num { font-size: 1rem; }
  
  .story-cover-pill {
    width: 100%;
    height: 140px;
    margin-left: 0;
    margin-bottom: 10px;
  }
  
  .story-details {
    margin-left: 0;
    width: 100%;
  }
  
  .title-link { font-size: 0.95rem; white-space: normal; line-height: 1.2; height: 2.4em; overflow: hidden; }
  
  .meta-row { flex-direction: column; gap: 4px; align-items: center; font-size: 0.7rem; }
  
  .score-crystal-fire {
    margin-top: 10px;
    width: 100%;
    min-width: auto;
    background: transparent;
    border: none;
    padding: 0;
    box-shadow: none;
  }
  
  .fire-row .val { font-size: 1rem; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>