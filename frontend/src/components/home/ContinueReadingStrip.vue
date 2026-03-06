<template>
  <div class="continue-reading-strip" v-if="authStore.isLoggedIn && hasHistory">
    <div class="strip-header">
      <h3 class="strip-title">
        <i class="fas fa-history text-yellow-500"></i> Ký Ức Tu Luyện
      </h3>
    </div>
    
    <div class="reading-list">
      <router-link 
        v-for="item in recentItems" 
        :key="item.truyen_id"
        :to="getChapterLink(item)"
        class="reading-spirit-item"
        :title="item.ten_truyen"
      >
        <div class="cover-aura-wrapper">
          <img :src="getImageUrl(item.anh_bia)" :alt="item.ten_truyen" class="item-cover-img" />
          
          <div class="bottom-vignette"></div>

          <span class="chapter-badge-overlay">
            Chương {{ getChapterNumber(item) }}
          </span>

          <div class="spirit-progress-bar">
            <div class="spirit-progress-fill" style="width: 100%"></div>
          </div>
        </div>

        <div class="item-spirit-info">
          <h4 class="item-title">{{ item.ten_truyen }}</h4>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useAuthStore } from "@/modules/auth/auth.store";
import { useHistoryStore } from "@/modules/history/history.store";
import { getImageUrl } from "@/config/constants";
import type { HistoryItem } from '@/modules/history/history.service';

const authStore = useAuthStore();
const historyStore = useHistoryStore();

onMounted(() => {
  if (authStore.isLoggedIn) {
     // Fetch silently without blocking UI
     historyStore.fetchHistory(1);
  }
});

const recentItems = computed(() => {
    return historyStore.history.slice(0, 5); // Show last 5
});

const hasHistory = computed(() => recentItems.value.length > 0);

const getChapterNumber = (item: HistoryItem) => {
    // Priority: so_chuong (number) > full title string
    if (item.chuong_moi_nhat_so_chuong !== null && item.chuong_moi_nhat_so_chuong !== undefined) {
      return item.chuong_moi_nhat_so_chuong;
    }
    return item.chuong_moi_nhat?.replace(/\D/g, '') || '?';
};

const getChapterLink = (item: HistoryItem) => {
    // Determine link to the last read chapter
    const chapterSlug = item.chuong_slug;
    const storySlug = item.truyen_slug; 
    
    if (storySlug && chapterSlug) {
        return {
            path: `/truyen-chu/${storySlug}/${chapterSlug}`
        };
    }
    if (storySlug) {
        return `/truyen-chu/${storySlug}`;
    }
    return '/'; // Fallback
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap");

/* ===== KHUNG CHÍNH (CONTAINER) ===== */
.continue-reading-strip {
  margin-bottom: 35px;
  background: rgba(11, 15, 25, 0.6); /* Nền kính tối */
  border: 1px solid rgba(52, 211, 153, 0.15); /* Viền linh khí mờ */
  border-radius: 20px;
  padding: 20px 24px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  font-family: 'Be Vietnam Pro', sans-serif;
}

/* ===== TIÊU ĐỀ ===== */
.strip-header {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.strip-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #f1f5f9;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

.strip-title i {
  filter: drop-shadow(0 0 8px rgba(234, 179, 8, 0.5));
}

/* ===== DANH SÁCH CUỘN ===== */
.reading-list {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 10px; /* Nhường chỗ cho Scrollbar và Box-shadow */
  scroll-behavior: smooth;
  /* Ẩn scrollbar trên Firefox */
  scrollbar-width: thin;
  scrollbar-color: rgba(52, 211, 153, 0.3) transparent;
}

/* Custom Scrollbar cho Webkit (Chrome/Safari) */
.reading-list::-webkit-scrollbar { height: 6px; }
.reading-list::-webkit-scrollbar-track { background: transparent; }
.reading-list::-webkit-scrollbar-thumb {
  background: rgba(52, 211, 153, 0.2);
  border-radius: 10px;
}
.reading-list::-webkit-scrollbar-thumb:hover { background: rgba(52, 211, 153, 0.5); }

/* ===== THẺ TRUYỆN (CARD ITEM) ===== */
.reading-spirit-item {
  flex: 0 0 140px; /* Chiều rộng cố định */
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
}

@media (hover: hover) {
  .reading-spirit-item:hover {
    transform: translateY(-5px);
  }

  .reading-spirit-item:hover .item-cover-img {
    transform: scale(1.1);
  }

  .reading-spirit-item:hover .item-title {
    color: #34d399; /* Chuyển màu Aura khi hover */
  }
}

/* KHUNG ẢNH BÌA */
.cover-aura-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.item-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}



/* Lớp phủ chân ảnh */
.bottom-vignette {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.4) 25%, transparent 60%);
  pointer-events: none;
  z-index: 1;
}

/* Tag Chương (Nằm trên ảnh) */
.chapter-badge-overlay {
  position: absolute;
  bottom: 8px;
  left: 8px;
  font-size: 0.65rem;
  color: #fbbf24; /* Vàng rực rỡ */
  font-weight: 800;
  z-index: 2;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
}

/* Thanh Tiến Độ (Linh Lực) */
.spirit-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: rgba(0, 0, 0, 0.6);
  z-index: 2;
}

.spirit-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #fbbf24); /* Chuyển màu từ lục sang vàng */
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
  border-radius: 0 2px 2px 0;
}

/* THÔNG TIN CHỮ */
.item-spirit-info {
  width: 100%;
  padding: 0 4px;
}

.item-title {
  color: #e2e8f0;
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s;
}



/* ===== MOBILE OPTIMIZATION ===== */
@media (max-width: 640px) {
  .reading-spirit-item {
    flex: 0 0 120px; /* Thu nhỏ thẻ trên Mobile */
  }
  
  .continue-reading-strip {
    padding: 16px;
    margin: 0 -12px 24px -12px; /* Tràn lề màn hình mobile */
    border-radius: 0;
    border-left: none; 
    border-right: none;
  }

  .strip-title {
    font-size: 1rem;
  }

  .item-title {
    font-size: 0.8rem;
  }
}
</style>