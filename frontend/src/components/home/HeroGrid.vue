<template>
  <div class="hero-grid-container" v-if="stories.length > 0">
    <!-- MOBILE HERO STATIC BANNER -->
    <div class="hero-mobile-static mobile-only">
      <div class="mobile-bg-wrapper">
        <img src="@/assets/images/banner-mobile.png" alt="Truyện Việt Hay Banner" class="mobile-bg-img" />
        <!-- Lớp phủ gradient đen lên phần chữ để đảm bảo dễ đọc -->
        <div class="mobile-vignette"></div>
      </div>

      <div class="mobile-content-wrapper">
        <h1 class="grand-title-mobile">
          <div class="title-line">
            <span class="word-glow">KHÁM PHÁ</span>
          </div>
          <div class="title-line">
            <span class="word-glow-emerald">THIÊN THƯ</span>
          </div>
        </h1>
        
        <p class="slogan-mobile">VẠN GIỚI KHAI NGUYÊN - TIÊN LỘ THÔNG THIÊN</p>

        <div class="action-buttons-mobile">
          <router-link to="/truyen-chu" class="spirit-btn-sm emerald">
            <div class="btn-aura-sm"></div>
            <span class="btn-inner-sm">TRUYỆN CHỮ</span>
          </router-link>
          <router-link to="/truyen-tranh" class="spirit-btn-sm azure">
            <div class="btn-aura-sm"></div>
            <span class="btn-inner-sm">TRUYỆN TRANH</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- DESKTOP: Main Highlight (Left) -->
    <div class="main-highlight desktop-only">
      <transition name="fade" mode="out-in">
        <div class="highlight-content" :key="mainStory.id || 'default'">
          <img 
            :src="getImageUrl(mainStory.anh_bia)" 
          class="main-cover-bg" 
          alt="Background" 
        />
        <div class="overlay-gradient"></div>
        
        <div class="highlight-info">
          <span class="badge-hot">
            <i class="fas fa-fire"></i> Hot Nhất
          </span>
          <h2 class="main-title">{{ mainStory.ten_truyen }}</h2>
          <div class="main-meta">
            <span class="author"><i class="fas fa-pen-nib"></i> {{ mainStory.tac_gia || 'Đang cập nhật' }}</span>
            <span class="stats"><i class="fas fa-eye"></i> {{ formatNumber(mainStory.luot_xem) }} lượt xem</span>
          </div>
          <p class="main-summary">{{ truncateText(mainStory.mo_ta, 120) }}</p>
          
          <div class="actions">
            <div @click="navigateToStory(mainStory.slug)" class="btn-read-now" role="link" tabindex="0" style="cursor: pointer">
              Đọc Ngay <i class="fas fa-arrow-right"></i>
            </div>
            <div @click="navigateToStory(mainStory.slug)" class="btn-info" role="link" tabindex="0" style="cursor: pointer">
              <i class="fas fa-info-circle"></i> Chi tiết
            </div>
          </div>
        </div>

        <!-- Floating Cover Image -->
        <div class="floating-cover">
          <img 
            :src="getImageUrl(mainStory.anh_bia)" 
            :alt="mainStory.ten_truyen" 
            class="book-cover-3d"
          />
        </div> <!-- end floating-cover -->
        </div> <!-- end highlight-content -->
      </transition>
    </div>

    <!-- DESKTOP: Side Trending List (Right) -->
    <div class="side-trending desktop-only">
      <h3 class="side-title">Thịnh Hành <i class="fas fa-chart-line"></i></h3>
      <div class="trending-list">
        <div 
          v-for="(story, index) in sideStories" 
          :key="story.id" 
          @click="navigateToStory(story.slug)"
          class="trending-item"
          role="link"
          tabindex="0"
          style="cursor: pointer"
        >
          <div class="item-rank" :class="`rank-${getRank(index)}`">{{ getRank(index) }}</div>
          <img 
            :src="getImageUrl(story.anh_bia)" 
            :alt="story.ten_truyen" 
            class="item-cover"
          />
          <div class="item-info">
            <h4 class="item-title">{{ story.ten_truyen }}</h4>
            <div class="item-meta">
              <span class="meta-genre">{{ story.the_loai_chinh || 'Tiên Hiệp' }}</span>
              <span class="dot">•</span>
              <span class="meta-views"><i class="fas fa-eye"></i> {{ formatNumber(story.luot_xem) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { getImageUrl } from "@/config/constants";

const router = useRouter();

const navigateToStory = (slug: string) => {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
    router.push(`/truyen-chu/${slug}`);
};

const props = defineProps({
  stories: {
    type: Array as () => any[],
    required: true,
    default: () => []
  },
  trendingStories: {
    type: Array as () => any[],
    required: false,
    default: () => []
  }
});

const currentIndex = ref(0);
let intervalId: any = null;

onMounted(() => {
  intervalId = setInterval(() => {
    if (props.stories && props.stories.length > 1) {
      // Loop through up to top 5 stories
      const maxItems = Math.min(5, props.stories.length);
      currentIndex.value = (currentIndex.value + 1) % maxItems;
    }
  }, 5000); // Change banner every 5 seconds
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});

const mainStory = computed(() => props.stories[currentIndex.value] || {});

// Logic: If specific trending list provided, it starts from Rank 1. 
// If fall backing to main list (offset 1), it starts from Rank 2.
const isSeparateList = computed(() => props.trendingStories.length > 0);

const sideStories = computed(() => {
  if (isSeparateList.value) {
    return props.trendingStories.slice(0, 3);
  }
  return props.stories.slice(1, 4); // Take next 4 items from main list
});

const getRank = (index: number) => {
  return isSeparateList.value ? index + 1 : index + 2;
};

const formatNumber = (num: number) => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const truncateText = (text: string, length: number) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};
</script>

<style scoped>
.hero-grid-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  height: 480px;
  margin-bottom: 40px;
}

/* --- LEFT MAIN highlight --- */
.main-highlight {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: #1f2937;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  transition: transform 0.3s ease;
}

.main-highlight:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(74, 222, 128, 0.1);
}

.highlight-content {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 40px;
  display: flex;
  align-items: center;
}

.main-cover-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(40px) brightness(0.4);
  z-index: 1;
}

.overlay-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(17,24,39,0.95) 0%, rgba(17,24,39,0.7) 60%, rgba(17,24,39,0.2) 100%);
  z-index: 2;
}

.highlight-info {
  position: relative;
  z-index: 10;
  max-width: 60%;
  color: white;
}

.badge-hot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #ef4444, #f59e0b);
  padding: 6px 14px;
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
}

.main-title {
  font-size: 2.8rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 16px;
  background: linear-gradient(to right, #ffffff, #d1d5db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.main-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  color: #9ca3af;
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.main-summary {
  color: #d1d5db;
  line-height: 1.6;
  margin-bottom: 30px;
  font-size: 1.05rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn-read-now {
  background: #22c55e;
  color: #fff;
  padding: 12px 28px;
  border-radius: 12px;
  font-weight: 700;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-read-now:hover {
  background: #16a34a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
}

.btn-info {
  background: rgba(255,255,255,0.1);
  color: #fff;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  backdrop-filter: blur(10px);
  transition: all 0.2s;
}

.btn-info:hover {
  background: rgba(255,255,255,0.2);
}

/* Floating 3D Cover */
.floating-cover {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 220px; /* Adjust based on needs */
  height: 330px;
}

.book-cover-3d {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: -10px 10px 20px rgba(0,0,0,0.5);
  transform: perspective(1000px) rotateY(-15deg);
  transition: transform 0.3s ease;
}

.main-highlight:hover .book-cover-3d {
  transform: perspective(1000px) rotateY(0deg) scale(1.05);
}

/* Banner Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}


/* --- RIGHT SIDE Trending --- */
/* --- RIGHT SIDE Trending --- */
.side-trending {
  background: linear-gradient(145deg, rgba(31, 41, 55, 0.6) 0%, rgba(17, 24, 39, 0.8) 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  height: 100%;
}

.side-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.side-title i {
  color: #f59e0b;
  filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.4));
}

.trending-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.trending-item {
  display: flex;
  gap: 16px;
  text-decoration: none;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  align-items: center;
  position: relative;
  overflow: hidden;
}

.trending-item:hover {
  background: rgba(255, 255, 255, 0.07);
  transform: translateX(6px);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

/* Rank Badges */
.item-rank {
  font-size: 1.1rem;
  font-weight: 900;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #fff;
  background: #374151; /* Default/Fallback */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

/* Specific Ranks */
.rank-1 {
  background: linear-gradient(135deg, #FFD700, #FDB931);
  color: #92400e;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
  font-size: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.rank-2 {
  background: linear-gradient(135deg, #E0E0E0, #BDBDBD);
  color: #4b5563;
  box-shadow: 0 0 15px rgba(192, 192, 192, 0.3);
  font-size: 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.rank-3 {
  background: linear-gradient(135deg, #CD7F32, #A0522D);
  color: #5d2e0e;
  box-shadow: 0 0 15px rgba(205, 127, 50, 0.3);
  font-size: 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.rank-4, .rank-5 {
  background: rgba(255, 255, 255, 0.1);
  color: #9ca3af;
}

.item-cover {
  width: 54px; /* Slightly larger */
  height: 76px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.trending-item:hover .item-cover {
  transform: scale(1.05) rotate(2deg);
}

.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.item-title {
  color: #f3f4f6;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s;
}

.trending-item:hover .item-title {
  color: #4ade80; /* Green accent on hover */
}

.item-meta {
  font-size: 0.8rem;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-genre {
  color: #60a5fa; /* Blue accent for genre */
  font-weight: 500;
}

.dot {
  font-weight: bold;
  opacity: 0.5;
}

.meta-views {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-views i {
  font-size: 0.75rem;
  color: #10b981; /* Green eye icon */
}

/* --- RESPONSIVE --- */
@media (max-width: 1024px) {
  .hero-grid-container {
    height: auto;
    grid-template-columns: 1fr;
  }
  
  .side-trending {
    display: flex;
    margin-top: -24px;
    background: transparent;
    border: none;
    box-shadow: none;
    backdrop-filter: none;
    padding: 0;
  }

  .side-title {
    display: none;
  }

  .trending-list {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 20px;
    gap: 16px;
  }

  /* Scrollbar hider */
  .trending-list::-webkit-scrollbar {
    height: 4px;
  }
  .trending-list::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.2);
    border-radius: 4px;
  }

  .trending-item {
    min-width: 260px; /* Wider cards on horizontal scroll */
    background: rgba(31, 41, 55, 0.8);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
}

/* --- Mobile Only Utility --- */
.hero-mobile-static {
  display: none;
}

/* --- RESPONSIVE --- */
@media (max-width: 1024px) {
  .hero-grid-container {
    display: block;
    height: auto;
    margin-bottom: 32px;
  }
  
  .desktop-only {
    display: none !important;
  }
  
  /* Enable Mobile Static Banner */
  .hero-mobile-static {
    position: relative;
    width: 100vw;
    height: 60vh; /* Banner cao 60% màn hình điện thoại */
    left: -12px; /* Kéo bù lề của Container (nếu có padding), tạm định -12px theo padding 640px của StoryListView */
    display: flex;
    flex-direction: column;
    justify-content: flex-end; /* Ép nội dung xuống đáy */
    overflow: hidden;
  }
  
  /* Trong màn 640px padding main-content-spirit là 12px, ta margin left, right -12px để fullbleed */
  @media (max-width: 640px) {
    .hero-mobile-static {
      left: 0;
      margin-left: -12px;
      margin-right: -12px;
      width: calc(100% + 24px); 
    }
  }

  .mobile-bg-wrapper {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .mobile-bg-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
  }

  .mobile-vignette {
    position: absolute;
    inset: 0;
    /* Chuyển mờ dần thành đen ở dưới đáy để chữ nổi bật */
    background: linear-gradient(to bottom, transparent 30%, rgba(5,7,10,0.6) 60%, #0b0f19 100%);
  }

  /* 3. Nội dung (Chữ + Nút) */
  .mobile-content-wrapper {
    position: relative;
    z-index: 10;
    padding: 20px 15px 40px;
    text-align: center;
    font-family: 'Be Vietnam Pro', sans-serif;
  }

  .grand-title-mobile {
    font-family: 'Spectral', serif;
    font-size: 3rem;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    letter-spacing: 2px;
  }

  .title-line { display: flex; justify-content: center; gap: 10px; }

  .word-glow { color: #fff; text-shadow: 0 0 15px rgba(255,255,255,0.5), 0 4px 10px rgba(0,0,0,0.8); }
  .word-glow-emerald { color: #6ee7b7; text-shadow: 0 0 20px rgba(52,211,153,0.6), 0 4px 10px rgba(0,0,0,0.8); }

  .slogan-mobile {
    font-family: 'Cinzel', serif;
    font-size: 0.75rem;
    color: #ffffff;
    letter-spacing: 2px;
    margin-bottom: 25px;
    font-weight: 700;
  }

  /* 4. Nút Hành Động */
  .action-buttons-mobile {
    display: flex;
    justify-content: center;
    gap: 15px;
    width: 100%;
  }

  .spirit-btn-sm {
    position: relative;
    flex: 1;
    padding: 12px 0;
    text-decoration: none;
    border-radius: 50px;
    overflow: hidden;
  }

  .btn-inner-sm {
    position: relative;
    z-index: 2;
    color: white;
    font-weight: 700;
    font-size: 0.85rem;
    letter-spacing: 1px;
  }

  .btn-aura-sm { position: absolute; inset: 0; z-index: 1; opacity: 0.9; }

  .spirit-btn-sm.emerald { border: 1px solid transparent; }
  .spirit-btn-sm.emerald .btn-aura-sm { background: linear-gradient(135deg, #10b981, #047857); }
  .spirit-btn-sm.azure { border: 1px solid rgba(255,255,255,0.3); }
  .spirit-btn-sm.azure .btn-aura-sm { background: transparent; backdrop-filter: blur(5px); }
}

@media (max-width: 768px) {
  /* Inherits from 1024px, no major changes needed as slider is responsive */
}
</style>
