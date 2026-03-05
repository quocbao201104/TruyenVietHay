<template>
  <div class="continue-reading-strip" v-if="authStore.isLoggedIn && hasHistory">
    <div class="strip-header">
      <h3 class="strip-title"><i class="fas fa-history"></i> Tiếp Tục Đọc</h3>
    </div>
    
    <div class="reading-list">
      <router-link 
        v-for="item in recentItems" 
        :key="item.truyen_id"
        :to="getChapterLink(item)"
        class="reading-item"
        :title="item.ten_truyen"
      >
        <div class="cover-wrapper">
          <img :src="getImageUrl(item.anh_bia)" :alt="item.ten_truyen" class="item-cover" />
          <div class="progress-bar">
            <div class="progress-fill" style="width: 100%"></div>
          </div>
        </div>
        <div class="item-info">
          <span class="chapter-tag">Chương {{ getChapterNumber(item) }}</span>
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
    return item.chuong_moi_nhat_so_chuong || '?';
};

const getChapterLink = (item: HistoryItem) => {
    // Determine link to the last read chapter
    const chapterSlug = item.chuong_slug;
    const storySlug = item.truyen_slug; 
    
    if (storySlug && chapterSlug) {
        return {
            path: `/truyen-chu/${storySlug}/${chapterSlug}`,
            query: { storyId: item.truyen_id }
        };
    }
    return `/truyen-chu/${storySlug}`;
};
</script>

<style scoped>
.continue-reading-strip {
  margin-bottom: 32px;
  background: rgba(31, 41, 55, 0.4);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 16px 24px;
  backdrop-filter: blur(10px);
}

.strip-header {
  margin-bottom: 12px;
}

.strip-title {
  font-size: 1rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.reading-list {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px; /* For scrollbar spacing */
}

/* Hide scrollbar for cleaner look but allow scroll */
.reading-list::-webkit-scrollbar {
  height: 4px;
}
.reading-list::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
}

.reading-item {
  flex: 0 0 140px; /* Fixed width */
  text-decoration: none;
  position: relative;
  transition: transform 0.2s;
}

.reading-item:hover {
  transform: translateY(-4px);
}

.cover-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}

.item-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(0,0,0,0.5);
}

.progress-fill {
  background: #facc15;
  height: 100%;
}

.item-info {
  width: 100%;
}

.chapter-tag {
  display: block;
  font-size: 0.65rem;
  color: #facc15;
  font-weight: 700;
  margin-bottom: 2px;
}

.item-title {
  color: #e5e7eb;
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Mobile */
@media (max-width: 640px) {
  .reading-item {
    flex: 0 0 110px;
  }
  .continue-reading-strip {
    padding: 12px 16px;
    margin: 0 -16px 24px -16px; /* Break container padding */
    border-radius: 0;
    border-left: none; 
    border-right: none;
  }
}
</style>
