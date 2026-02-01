<template>
  <div class="story-list-page">
    
    <main class="main-content">
      <!-- HERO GRID SECTION (Replaces Carousel) -->
      <HeroGrid 
        :stories="topViewStories.slice(0, 1)" 
        :trendingStories="topMonthlyStories"
      />

      <!-- PERSONALIZATION ZONE -->
      <ContinueReadingStrip />

      <div class="content-body">
        <!-- LEFT COLUMN (75%) -->
        <div class="main-col">
          <!-- 1. Fresh Updates -->
          <section class="section-block">
            <div class="section-header">
              <h2 class="section-title">✨ Mới Cập Nhật</h2>
              <router-link to="/tim-kiem" class="view-all">Xem tất cả <i class="fas fa-arrow-right"></i></router-link>
            </div>
            
            <div class="stories-grid">
              <NewStoryCard 
                v-for="story in newStories" 
                :key="story.id" 
                :story="story" 
              />
            </div>
          </section>

          <!-- 2. Completed Stories (Horizontal Scroll) -->
          <!-- Placeholder for now, or reuse Top Rated as example -->
          <section class="section-block">
            <div class="section-header">
              <h2 class="section-title">🏆 Đánh Giá Cao</h2>
              <router-link to="/xep-hang" class="view-all">Xem BXH</router-link>
            </div>
            <div class="stories-grid">
              <NewStoryCard 
                v-for="story in topRatedStories.slice(0, 8)" 
                :key="story.id" 
                :story="story" 
              />
            </div>
          </section>

          <!-- 3. Completed Stories -->
          <section class="section-block">
            <div class="section-header">
              <h2 class="section-title">✅ Đã Hoàn Thành</h2>
              <router-link to="/tim-kiem?status=hoan_thanh" class="view-all">Xem tất cả <i class="fas fa-arrow-right"></i></router-link>
            </div>
            <div class="stories-grid">
              <NewStoryCard 
                v-for="story in completedStories" 
                :key="story.id" 
                :story="story" 
              />
            </div>
          </section>

          <!-- MOBILE ONLY SECTIONS (When Sidebar is hidden) -->
          <div class="mobile-only-sections">
             <!-- Mobile Categories (Moved from Sidebar) -->
            <section class="section-block mobile-cat-block">
              <h3 class="widget-title" style="border:none; padding:0; margin-bottom:12px;">🏷️ Khám Phá Nhanh</h3>
              <div class="tag-cloud-mobile">
                <router-link 
                  v-for="cat in categories" 
                  :key="cat.id_theloai"
                  :to="`/the-loai?category=${cat.id_theloai}`"
                  class="tag-chip-mobile"
                >
                  {{ cat.ten_theloai }}
                </router-link>
              </div>
            </section>
          </div>
        </div>

        <!-- RIGHT SIDEBAR (25%) -->
        <aside class="sidebar-col">
          <div class="sticky-wrapper">
             <!-- Ranking Widget -->
            <div class="sidebar-widget ranking-widget">
              <h3 class="widget-title">🔥 Bảng Xếp Hạng</h3>
              <div class="ranking-list">
                <div 
                  v-for="(story, index) in topViewStories.slice(0, 10)" 
                  :key="story.id" 
                  @click="navigateToStory(story.slug)"
                  class="ranking-item"
                  role="link"
                  tabindex="0"
                  style="cursor: pointer"
                >
                  <div class="rank-number" :class="`rank-${index + 1}`">{{ index + 1 }}</div>
                  <div class="rank-info">
                    <h4 class="rank-title">{{ story.ten_truyen }}</h4>
                    <span class="rank-views">{{ formatNumber(story.luot_xem) }} view</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Category Cloud -->
            <div class="sidebar-widget category-widget">
              <h3 class="widget-title">🏷️ Thể Loại</h3>
              <div class="tag-cloud">
                <router-link 
                  v-for="cat in categories" 
                  :key="cat.id_theloai"
                  :to="`/the-loai?category=${cat.id_theloai}`"
                  class="tag-chip"
                >
                  {{ cat.ten_theloai }}
                </router-link>
              </div>
            </div>
          </div>
        </aside>
      </div>

    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getAllCategories } from "@/modules/category/category.service";
import { getPublicStories, Story } from "@/modules/storyText/story.service";
import { getTopViewStories } from "@/modules/topview/topview.service";
import { getTopRatedStories } from "@/modules/ranking/ranking.service";
import { getTopMonthlyStories } from "@/modules/storyText/story.service";
import { getImageUrl } from "@/config/constants";
import type { Category } from "@/types/category";
import NewStoryCard from "@/modules/storyText/components/NewStoryCard.vue";
import HeroGrid from "@/components/home/HeroGrid.vue"; 
import ContinueReadingStrip from "@/components/home/ContinueReadingStrip.vue";
import { useStoryStore } from "@/modules/storyText/story.store";
import { useRouter } from "vue-router";

const storyStore = useStoryStore();
const router = useRouter();

const navigateToStory = (slug: string) => {
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
    router.push(`/truyen-chu/${slug}`);
};

const categories = ref<Category[]>([]);
const newStories = ref<Story[]>([]);
const topViewStories = ref<Story[]>([]);
const topMonthlyStories = ref<Story[]>([]); // New ref
const topRatedStories = ref<Story[]>([]);
const completedStories = ref<Story[]>([]);

const fetchAllData = async () => {
  try {
    // Use cached store methods instead of direct service calls
    categories.value = await storyStore.fetchCategories();
    newStories.value = await storyStore.fetchNewStories(10);
    topViewStories.value = await storyStore.fetchTopViewStories(5);
    topMonthlyStories.value = await storyStore.fetchTopMonthlyStories(5);
    topRatedStories.value = await storyStore.fetchTopRatedStories(5);
    completedStories.value = await storyStore.fetchCompletedStories(10);
  } catch (err) {
    console.error("Error fetching home page data:", err);
  }
};

const formatNumber = (num: number) => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

onMounted(() => {
  fetchAllData();
});
</script>

<style scoped>
.story-list-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #111827;
  font-family: 'Manrope', sans-serif;
  color: #fff;
}

.main-content {
  flex: 1;
  max-width: 1440px; /* Wider container for 75/25 split */
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
}

/* --- Layout Grid --- */
.content-body {
  display: grid;
  grid-template-columns: 3fr 1fr; /* 75% - 25% roughly */
  gap: 32px;
}

/* --- Main Column --- */
.main-col {
  min-width: 0; /* Prevent grid blowout */
}

.section-block {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 12px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #facc15;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.view-all {
  color: #4ade80;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.view-all:hover {
  color: #22c55e;
  transform: translateX(5px);
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

/* --- Sidebar Column --- */
.sidebar-col {
  display: flex;
  flex-direction: column;
  /* gap handled by wrapper now or widget margin */
}

.sticky-wrapper {
  display: flex;
  flex-direction: column;
  gap: 32px;
  position: sticky;
  top: 90px; /* Adjust based on header height */
  align-self: start;
}

.sidebar-widget {
  background: rgba(31, 41, 55, 0.5);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255,255,255,0.05);
}

.widget-title {
  font-size: 1.25rem;
  border-left: 4px solid #f59e0b;
  padding-left: 12px;
  margin-bottom: 20px;
  color: #fff;
}

/* Ranking Widget */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.2s;
}

.ranking-item:hover {
  background: rgba(255,255,255,0.05);
}

.rank-number {
  font-size: 1.25rem;
  font-weight: 800;
  width: 30px;
  text-align: center;
  color: #6b7280;
}

.rank-1 { color: #f59e0b; font-size: 1.5rem; }
.rank-2 { color: #94a3b8; font-size: 1.4rem; }
.rank-3 { color: #a16207; font-size: 1.3rem; }

.rank-info {
  flex: 1;
  min-width: 0;
}

.rank-title {
  font-size: 0.95rem;
  color: #e5e7eb;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-views {
  font-size: 0.8rem;
  color: #9ca3af;
}

/* Tag Cloud */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-chip {
  padding: 6px 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  color: #d1d5db;
  text-decoration: none;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.tag-chip:hover {
  background: #f59e0b;
  color: #111827;
  border-color: #f59e0b;
}

/* --- Responsive --- */
@media (max-width: 1024px) {
  .content-body {
    grid-template-columns: 1fr;
  }
  
  .sidebar-col {
    display: none; /* Or move to bottom */
  }
}

@media (max-width: 640px) {
  .main-content {
    padding: 1rem;
  }
  
  .stories-grid {
    display: flex;
    grid-template-columns: none;
    gap: 16px;
    overflow-x: auto;
    padding-bottom: 20px; /* Space for scrollbar/shadow */
    margin: 0 -16px; /* Break container padding */
    padding-left: 16px;
    padding-right: 16px;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  .stories-grid::-webkit-scrollbar {
    display: none; /* Hide scrollbar for cleaner look */
  }
  
  /* Adjust cards inside the rail */
  .stories-grid > * {
    flex: 0 0 160px; /* Fixed width for cards */
    scroll-snap-align: start;
  }
}

/* --- Mobile Only Sections --- */
.mobile-only-sections {
  display: none; /* Hidden on Desktop */
}

@media (max-width: 1024px) {
  .mobile-only-sections {
    display: block;
    margin-top: 40px;
    border-top: 1px solid rgba(255,255,255,0.1);
    padding-top: 24px;
  }
  
  .mobile-scroll-list {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding-bottom: 12px;
  }

  /* Scrollbar styling for mobile list */
  .mobile-scroll-list::-webkit-scrollbar {
    height: 4px;
  }
  .mobile-scroll-list::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.2);
    border-radius: 4px;
  }

  .mobile-rank-card {
    flex: 0 0 140px;
    position: relative;
    text-decoration: none;
  }

  .rank-badge {
    position: absolute;
    top: -8px;
    left: -8px;
    background: #374151;
    color: #fff;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 0.8rem;
    z-index: 2;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  }

  .rank-bg-1 { background: #f59e0b; color: #000; }
  .rank-bg-2 { background: #94a3b8; color: #000; }
  .rank-bg-3 { background: #a16207; color: #fff; }

  .mobile-rank-cover {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  }

  .mobile-rank-info {
    width: 100%;
  }

  .rank-name {
    color: #e5e7eb;
    font-size: 0.85rem;
    font-weight: 600;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.3;
    margin-bottom: 4px;
  }

  .rank-stat {
    font-size: 0.75rem;
    color: #9ca3af;
    display: block;
  }

  /* Tag Cloud Mobile */
  .tag-cloud-mobile {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag-chip-mobile {
    padding: 8px 16px;
    background: rgba(255,255,255,0.1);
    border-radius: 99px;
    color: #d1d5db;
    text-decoration: none;
    font-size: 0.9rem;
    border: 1px solid rgba(255,255,255,0.1);
  }
}
</style>