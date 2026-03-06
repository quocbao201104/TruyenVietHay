<template>
  <div class="hero-grid-container" v-if="stories.length > 0">
    <!-- MOBILE HERO STATIC BANNER -->
    <div class="hero-mobile-static mobile-only">
      <div class="mobile-bg-wrapper">
        <img src="https://res.cloudinary.com/dg9ftuhv4/image/upload/v1772805142/truyenviethay/banners/banner-mobile.png" alt="Truyện Việt Hay Banner" class="mobile-bg-img" />
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
/* ===== CORE LAYOUT ===== */
.hero-grid-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  height: 480px;
  margin-bottom: 40px;
  font-family: 'Be Vietnam Pro', sans-serif;
}

/* =========================================
   LEFT MAIN HIGHLIGHT (KHU VỰC TỤ LINH)
   ========================================= */
.main-highlight {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: #0b0f19; /* Nền sâu như hư không */
  border: 1px solid rgba(52, 211, 153, 0.15); /* Viền linh khí nhạt */
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (hover: hover) {
  .main-highlight:hover {
    transform: translateY(-4px);
    border-color: rgba(52, 211, 153, 0.4);
    box-shadow: 0 25px 50px rgba(52, 211, 153, 0.15), inset 0 0 20px rgba(52, 211, 153, 0.05);
  }

  .btn-read-now:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(52, 211, 153, 0.5);
    background: linear-gradient(135deg, #34d399, #6ee7b7);
  }

  .btn-info:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .main-highlight:hover .book-cover-3d {
    transform: perspective(1000px) rotateY(-5deg) scale(1.05);
    box-shadow: -20px 20px 40px rgba(0, 0, 0, 0.8), 0 0 50px rgba(52, 211, 153, 0.4);
  }

  .trending-item:hover {
    background: rgba(52, 211, 153, 0.05);
    border-color: rgba(52, 211, 153, 0.2);
    transform: translateX(5px);
  }

  .trending-item:hover .item-cover {
    transform: scale(1.1) rotate(2deg);
    box-shadow: 0 6px 15px rgba(52, 211, 153, 0.3);
  }

  .trending-item:hover .item-title { color: #34d399; }
}

.highlight-content {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 40px;
  display: flex;
  align-items: center;
}

/* Glassmorphism Background */
.main-cover-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(45px) brightness(0.6) saturate(1.2); /* Mờ mịt, tăng bão hòa màu */
  z-index: 1;
  transform: scale(1.1); /* Tránh viền trắng khi blur */
}

.overlay-gradient {
  position: absolute;
  inset: 0;
  /* Phủ từ đen đặc (chỗ chứa chữ) sang trong suốt mờ ảo (chỗ chứa ảnh 3D) */
  background: linear-gradient(90deg, #05080f 0%, rgba(11, 15, 25, 0.85) 55%, rgba(11, 15, 25, 0.2) 100%);
  z-index: 2;
}

.highlight-info {
  position: relative;
  z-index: 10;
  max-width: 60%;
  color: white;
}

/* Badge dạng Ngọc Giản */
.badge-hot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.4);
  color: #f43f5e;
  padding: 6px 16px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 800;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 0 15px rgba(244, 63, 94, 0.2);
}

.main-title {
  font-size: 2.8rem;
  font-weight: 900;
  line-height: 1.2;
  margin-bottom: 16px;
  background: linear-gradient(to right, #ffffff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.main-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  color: #94a3b8;
  margin-bottom: 24px;
  font-size: 0.95rem;
  font-weight: 500;
}
.main-meta i { color: #34d399; } /* Điểm nhấn aura xanh */

.main-summary {
  color: #cbd5e1;
  line-height: 1.7;
  margin-bottom: 35px;
  font-size: 1.05rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
}

/* Nút Hành Động (Tụ Linh Đan) */
.actions {
  display: flex;
  gap: 16px;
}

.btn-read-now {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #05080f;
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  box-shadow: 0 6px 20px rgba(52, 211, 153, 0.3);
}



.btn-info {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  padding: 12px 28px;
  border-radius: 12px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}



/* Bìa Truyện 3D Tỏa Hào Quang */
.floating-cover {
  position: absolute;
  right: 50px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 220px;
  height: 330px;
}

.book-cover-3d {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  /* Phối hợp bóng tối (depth) và hào quang (glow) */
  box-shadow: -15px 15px 30px rgba(0, 0, 0, 0.7), 0 0 30px rgba(52, 211, 153, 0.2);
  transform: perspective(1000px) rotateY(-15deg);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}



/* =========================================
   RIGHT SIDE TRENDING (THIÊN BẢNG)
   ========================================= */
.side-trending {
  background: rgba(11, 15, 25, 0.7);
  border-radius: 20px;
  padding: 24px 20px;
  border: 1px solid rgba(52, 211, 153, 0.15); /* Đồng bộ viền linh khí */
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  height: 100%;
}

.side-title {
  font-size: 1.3rem;
  font-weight: 900;
  color: #34d399; /* Aura Primary */
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px dashed rgba(52, 211, 153, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(52, 211, 153, 0.3);
}

.side-title i {
  color: #fbbf24;
  filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.5));
}

.trending-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.trending-item {
  display: flex;
  gap: 16px;
  padding: 10px;
  border-radius: 12px;
  background: transparent;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  align-items: center;
  position: relative;
}



/* Rank Badges - Lệnh Bài Xếp Hạng */
.item-rank {
  font-size: 1rem;
  font-weight: 900;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%; /* Tròn như đan dược */
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  z-index: 2;
}

/* Khí Tràng Top 1-2-3 */
.rank-1 { background: rgba(251, 191, 36, 0.1); border-color: #fbbf24; color: #fbbf24; box-shadow: 0 0 15px rgba(251, 191, 36, 0.3); text-shadow: 0 0 5px #fbbf24; }
.rank-2 { background: rgba(226, 232, 240, 0.1); border-color: #e2e8f0; color: #e2e8f0; box-shadow: 0 0 15px rgba(226, 232, 240, 0.2); text-shadow: 0 0 5px #e2e8f0; }
.rank-3 { background: rgba(217, 119, 6, 0.1); border-color: #d97706; color: #d97706; box-shadow: 0 0 15px rgba(217, 119, 6, 0.2); text-shadow: 0 0 5px #d97706; }

.item-cover {
  width: 50px;
  height: 70px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s ease;
}



.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.item-title {
  color: #f1f5f9;
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s;
}



.item-meta {
  font-size: 0.8rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-genre { color: #60a5fa; font-weight: 600; }
.dot { opacity: 0.5; font-size: 10px; }
.meta-views i { color: #34d399; margin-right: 4px; }

/* Banner Fade Transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* =========================================
   RESPONSIVE (MOBILE & TABLET)
   ========================================= */
.hero-mobile-static { display: none; }

@media (max-width: 1024px) {
  .hero-grid-container {
    height: auto;
    grid-template-columns: 1fr;
    margin-bottom: 32px;
  }
  
  .desktop-only { display: none !important; }
  
  /* Mobile Static Banner */
  .hero-mobile-static {
    position: relative;
    width: 100vw;
    height: 60vh;
    left: -12px; /* Kéo bù lề của Container */
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    overflow: hidden;
  }
  
  @media (max-width: 640px) {
    .hero-mobile-static {
      left: 0;
      margin-left: -12px;
      margin-right: -12px;
      width: calc(100% + 24px); 
    }
  }

  .mobile-bg-wrapper { position: absolute; inset: 0; z-index: 1; }
  .mobile-bg-img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
  .mobile-vignette { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 30%, rgba(5,7,10,0.6) 60%, #0b0f19 100%); }

  .mobile-content-wrapper {
    position: relative;
    z-index: 10;
    padding: 20px 15px 40px;
    text-align: center;
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
  .word-glow-emerald { color: #34d399; text-shadow: 0 0 20px rgba(52,211,153,0.6), 0 4px 10px rgba(0,0,0,0.8); }

  .slogan-mobile {
    font-family: 'Cinzel', serif;
    font-size: 0.75rem;
    color: #cbd5e1;
    letter-spacing: 2px;
    margin-bottom: 25px;
    font-weight: 700;
  }

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

  .btn-inner-sm { position: relative; z-index: 2; color: white; font-weight: 700; font-size: 0.85rem; letter-spacing: 1px; }
  .btn-aura-sm { position: absolute; inset: 0; z-index: 1; opacity: 0.9; }

  .spirit-btn-sm.emerald { border: 1px solid transparent; }
  .spirit-btn-sm.emerald .btn-aura-sm { background: linear-gradient(135deg, #10b981, #047857); }
  .spirit-btn-sm.azure { border: 1px solid rgba(255,255,255,0.3); }
  .spirit-btn-sm.azure .btn-aura-sm { background: transparent; backdrop-filter: blur(5px); }
}
</style>