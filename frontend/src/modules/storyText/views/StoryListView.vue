<template>
  <div class="story-list-page-xianxia">
    
    <main class="main-content-spirit">
      <!-- THIÊN PHẨM LINH THƯ - Hero Gate -->
      <section class="hero-aura-wrapper animate-fadeIn">
        <HeroGrid 
          :stories="hotStories.slice(0, 5)" 
          :trendingStories="topMonthlyStories"
        />
      </section>

      <!-- TIẾP TỤC TU LUYỆN - Jade Slip Strip -->
      <div class="continue-cultivation-area">
        <ContinueReadingStrip />
      </div>

      <div class="content-body-grid">
        <!-- TẢ ĐẠO: LINH KHÍ TRẬN (Main Column) -->
        <div class="main-col-spirit">
          
          <!-- 1. MỚI XUẤT THẾ -->
          <section class="spirit-block">
            <div class="spirit-header">
              <h2 class="spirit-title">
                <i class="fas fa-sparkles text-emerald-400"></i>
                Linh Khí Mới
              </h2>
              <router-link to="/tim-kiem" class="view-all-spirit">
                Tầm Tiên <i class="fas fa-arrow-right-long ml-1"></i>
              </router-link>
            </div>
            
            <div class="spirit-grid-responsive">
              <NewStoryCard 
                v-for="story in newStories" 
                :key="story.id" 
                :story="story" 
              />
            </div>
          </section>

          <!-- 2. THIÊN CẤP ĐÁNH GIÁ -->
          <section class="spirit-block">
            <div class="spirit-header">
              <h2 class="spirit-title gold">
                <i class="fas fa-crown text-yellow-500"></i>
                Thiên Cấp
              </h2>
              <router-link to="/xep-hang" class="view-all-spirit gold">Thiên Bảng</router-link>
            </div>
            <div class="spirit-grid-responsive">
              <NewStoryCard 
                v-for="story in topRatedStories.slice(0, 8)" 
                :key="story.id" 
                :story="story" 
              />
            </div>
          </section>

          <!-- 3. CÔNG ĐỨC VIÊN MÃN -->
          <section class="spirit-block">
            <div class="spirit-header">
              <h2 class="spirit-title sky">
                <i class="fas fa-circle-check text-sky-400"></i>
                Viên Mãn
              </h2>
              <router-link to="/tim-kiem?status=hoan_thanh" class="view-all-spirit sky">Toàn Thư</router-link>
            </div>
            <div class="spirit-grid-responsive">
              <NewStoryCard 
                v-for="story in completedStories.slice(0, 8)" 
                :key="story.id" 
                :story="story" 
              />
            </div>
          </section>

          <!-- MOBILE ONLY SECTIONS (Bảng xếp hạng di động) -->
          <div class="mobile-extra-aura">
            <section class="spirit-block">
              <div class="spirit-header">
                <h2 class="spirit-title">🔥 Thiên Bảng</h2>
              </div>
              <div class="ranking-spirit-list-mobile">
                <div 
                  v-for="(story, index) in topViewStories.slice(0, 5)" 
                  :key="'mb-'+story.id" 
                  @click="navigateToStory(story.slug)"
                  class="ranking-spirit-item"
                >
                  <div class="rank-orb" :class="`top-${index + 1}`">{{ index + 1 }}</div>
                  <div class="rank-details">
                    <h4 class="rank-name">{{ story.ten_truyen }}</h4>
                    <span class="rank-val">{{ formatNumber(story.luot_xem) }} lượt xem</span>
                  </div>
                </div>
              </div>
              <router-link to="/truyen-hot" class="spirit-more-link-mobile">Xem tất cả</router-link>
            </section>

            <section class="spirit-block">
              <h3 class="sidebar-title-xianxia">📜 Căn Cơ Phân Loại</h3>
              <div class="tag-cloud-spirit">
                <router-link 
                  v-for="cat in categories" 
                  :key="cat.id_theloai"
                  :to="`/the-loai?categories=${cat.id_theloai}`"
                  class="tag-pill-spirit"
                >
                  {{ cat.ten_theloai }}
                </router-link>
              </div>
            </section>
          </div>
        </div>

        <!-- HỮU ĐẠO: THIÊN CƠ CÁC (Sidebar - Desktop Only) -->
        <aside class="sidebar-col-spirit">
          <div class="sticky-spirit-box">
            <div class="sidebar-card-aura ranking">
              <h3 class="sidebar-title-xianxia">🔥 Thiên Bảng</h3>
              <div class="ranking-spirit-list">
                <div 
                  v-for="(story, index) in topViewStories.slice(0, 5)" 
                  :key="story.id" 
                  @click="navigateToStory(story.slug)"
                  class="ranking-spirit-item"
                >
                  <div class="rank-orb" :class="`top-${index + 1}`">{{ index + 1 }}</div>
                  <div class="rank-details">
                    <h4 class="rank-name">{{ story.ten_truyen }}</h4>
                    <span class="rank-val">{{ formatNumber(story.luot_xem) }} lượt xem</span>
                  </div>
                  <i v-if="index < 3" class="fas fa-fire-alt text-rose-500/40 text-[10px]"></i>
                </div>
              </div>
              <router-link to="/truyen-hot" class="spirit-more-link">Xem tất cả...</router-link>
            </div>

            <div class="sidebar-card-aura categories">
              <h3 class="sidebar-title-xianxia">📜 Căn Cơ Phân Loại</h3>
              <div class="tag-cloud-spirit">
                <router-link 
                  v-for="cat in categories" 
                  :key="cat.id_theloai"
                  :to="`/the-loai?categories=${cat.id_theloai}`"
                  class="tag-pill-spirit"
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
import { Story, getHotStories } from "@/modules/storyText/story.service";
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
const hotStories = ref<Story[]>([]);
const topMonthlyStories = ref<Story[]>([]);
const topRatedStories = ref<Story[]>([]);
const completedStories = ref<Story[]>([]);

const fetchAllData = async () => {
  try {
    const results = await Promise.all([
      storyStore.fetchCategories(),
      storyStore.fetchNewStories(10),
      storyStore.fetchTopViewStories(10),
      getHotStories(5),
      storyStore.fetchTopMonthlyStories(5),
      storyStore.fetchTopRatedStories(8),
      storyStore.fetchCompletedStories(10)
    ]);

    categories.value = results[0];
    newStories.value = results[1];
    topViewStories.value = results[2];
    hotStories.value = results[3];
    topMonthlyStories.value = results[4];
    topRatedStories.value = results[5];
    completedStories.value = results[6];
  } catch (err) {
    console.error("Thiên cơ bị nhiễu loạn:", err);
  }
};

const formatNumber = (num: number) => {
  if (!num) return '0';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

onMounted(() => {
  fetchAllData();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap");

.story-list-page-xianxia {
  min-height: 100vh;
  background-color: #0b0f19;
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
  overflow-x: hidden;
}

.main-content-spirit {
  max-width: 1440px;
  margin: 0 auto;
  padding: 30px 25px 80px;
}

/* ===== HERO & STRIP ===== */
.hero-aura-wrapper {
  margin-bottom: 50px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0,0,0,0.5);
}

.continue-cultivation-area {
  margin-bottom: 60px;
}

/* ===== GRID LAYOUT ===== */
.content-body-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 40px;
}

.spirit-block { margin-bottom: 50px; }

.spirit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(52, 211, 153, 0.1);
  position: relative;
}

.spirit-header::after {
  content: ''; position: absolute; bottom: -1px; left: 0; width: 60px; height: 2px;
  background: #34d399; box-shadow: 0 0 10px #34d399;
}

.spirit-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.spirit-title.gold { color: #fbbf24; }
.spirit-title.sky { color: #38bdf8; }

.view-all-spirit {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #34d399;
  letter-spacing: 1px;
}

/* Grid mặc định cho Desktop */
.spirit-grid-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
  gap: 20px;
}

/* Sidebar Styles */
.sticky-spirit-box { position: sticky; top: 100px; display: flex; flex-direction: column; gap: 30px; }
.sidebar-card-aura { background: #131b2c; border: 1px solid #1e293b; border-radius: 20px; padding: 22px; }
.sidebar-title-xianxia { font-size: 0.95rem; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 20px; }

.ranking-spirit-list, .ranking-spirit-list-mobile { display: flex; flex-direction: column; gap: 12px; }
.ranking-spirit-item {
  display: flex; align-items: center; gap: 15px; padding: 12px 15px;
  background: linear-gradient(145deg, #131b2c, #0b0f19);
  border: 1px solid rgba(255, 255, 255, 0.05); 
  border-radius: 12px; cursor: pointer;
  transition: all 0.3s ease;
}
.ranking-spirit-item:hover {
  transform: translateY(-2px);
  border-color: rgba(52, 211, 153, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}
.rank-orb {
  width: 32px; height: 32px; flex-shrink: 0; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 0.85rem; color: #94a3b8; background: rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
}
.rank-orb.top-1 { background: linear-gradient(135deg, #fbbf24, #d97706); color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.5); box-shadow: 0 0 10px rgba(251, 191, 36, 0.3); }
.rank-orb.top-2 { background: linear-gradient(135deg, #cbd5e1, #94a3b8); color: #0f172a; box-shadow: 0 0 10px rgba(203, 213, 225, 0.2); }
.rank-orb.top-3 { background: linear-gradient(135deg, #b45309, #78350f); color: #fff; box-shadow: 0 0 10px rgba(180, 83, 9, 0.3); }

.rank-details {
  flex-grow: 1;
  min-width: 0; /* Important for text-overflow to work in flex container */
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rank-name { 
  font-size: 0.9rem; 
  font-weight: 700; 
  color: #f8fafc; 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis; 
  width: 100%;
}
.rank-val { font-size: 0.75rem; color: #34d399; font-weight: 600; }

.tag-cloud-spirit { display: flex; flex-wrap: wrap; gap: 8px; }
.tag-pill-spirit {
  padding: 6px 12px; background: #0b0f19; border: 1px solid #1e293b; border-radius: 50px;
  color: #94a3b8; font-size: 0.7rem; font-weight: 700; text-decoration: none;
}

.mobile-extra-aura { display: none; }

/* ===== MOBILE OPTIMIZATION (ĐỘT PHÁ CẢNH GIỚI) ===== */
@media (max-width: 1024px) {
  .content-body-grid { grid-template-columns: 1fr; }
  .sidebar-col-spirit { display: none; }
  .mobile-extra-aura { display: block; margin-top: 20px; }
}

@media (max-width: 640px) {
  .main-content-spirit { padding: 15px 12px; }
  
  .hero-aura-wrapper { margin-bottom: 30px; border-radius: 16px; }
  .continue-cultivation-area { margin-bottom: 40px; }

  .spirit-header { margin-bottom: 15px; }
  .spirit-title { font-size: 1.1rem; }

  /* QUAN TRỌNG: Chuyển sang lưới 2 cột thay vì cuộn ngang để duyệt truyện sướng hơn */
  .spirit-grid-responsive {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .spirit-block { margin-bottom: 40px; }

  /* Bảng xếp hạng trên mobile */
  .ranking-spirit-list-mobile {
    background: #131b2c;
    padding: 15px;
    border-radius: 20px;
    border: 1px solid #1e293b;
  }
  
  .spirit-more-link-mobile {
    display: block; text-align: center; margin-top: 15px;
    color: #34d399; font-size: 0.75rem; font-weight: 800; text-transform: uppercase;
  }
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
</style>