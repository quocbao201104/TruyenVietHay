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

/* ===== CORE BACKGROUND ===== */
.story-list-page-xianxia {
  min-height: 100vh;
  background-color: #05080f; /* Tối hơn một chút để các khối nổi bật lên */
  background-image: radial-gradient(circle at 50% 0%, rgba(52, 211, 153, 0.03) 0%, transparent 70%);
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
  border-radius: 20px; /* Đồng bộ góc bo của HeroGrid */
  overflow: hidden;
}

.continue-cultivation-area {
  margin-bottom: 60px;
  position: relative;
  z-index: 10;
}

/* ===== GRID LAYOUT ===== */
.content-body-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 40px;
}

.spirit-block { margin-bottom: 50px; }

/* ===== LINH KHÍ TRẬN (SECTION HEADERS) ===== */
.spirit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 12px;
  position: relative;
}

/* Đường line phân cách ma thuật */
.spirit-header::after {
  content: ''; 
  position: absolute; 
  bottom: 0; 
  left: 0; 
  width: 100%; 
  height: 1px;
  background: linear-gradient(90deg, rgba(52, 211, 153, 0.4) 0%, rgba(52, 211, 153, 0.05) 50%, transparent 100%);
}

.spirit-header::before {
  content: ''; 
  position: absolute; 
  bottom: -1px; 
  left: 0; 
  width: 80px; 
  height: 3px;
  background: #34d399; 
  box-shadow: 0 0 15px #34d399;
  border-radius: 50px;
  z-index: 2;
}

.spirit-title {
  font-size: 1.4rem;
  font-weight: 900;
  color: #f8fafc;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
}

.spirit-title i { filter: drop-shadow(0 0 8px currentColor); }

/* Đổi màu theme cho các Header khác nhau */
.spirit-title.gold { color: #fbbf24; }
.spirit-header:has(.spirit-title.gold)::before { background: #fbbf24; box-shadow: 0 0 15px #fbbf24; }
.spirit-header:has(.spirit-title.gold)::after { background: linear-gradient(90deg, rgba(251, 191, 36, 0.4) 0%, transparent 100%); }

.spirit-title.sky { color: #38bdf8; }
.spirit-header:has(.spirit-title.sky)::before { background: #38bdf8; box-shadow: 0 0 15px #38bdf8; }
.spirit-header:has(.spirit-title.sky)::after { background: linear-gradient(90deg, rgba(56, 189, 248, 0.4) 0%, transparent 100%); }

.view-all-spirit {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #34d399;
  letter-spacing: 1px;
  padding: 6px 16px;
  border-radius: 50px;
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.2);
  transition: all 0.3s;
}

@media (hover: hover) {
  .view-all-spirit:hover {
    background: #34d399;
    color: #05080f;
    box-shadow: 0 0 15px rgba(52, 211, 153, 0.4);
  }
}

.view-all-spirit.gold { color: #fbbf24; background: rgba(251, 191, 36, 0.1); border-color: rgba(251, 191, 36, 0.2); }
@media (hover: hover) {
  .view-all-spirit.gold:hover { background: #fbbf24; color: #05080f; box-shadow: 0 0 15px rgba(251, 191, 36, 0.4); }
}

.view-all-spirit.sky { color: #38bdf8; background: rgba(56, 189, 248, 0.1); border-color: rgba(56, 189, 248, 0.2); }
@media (hover: hover) {
  .view-all-spirit.sky:hover { background: #38bdf8; color: #05080f; box-shadow: 0 0 15px rgba(56, 189, 248, 0.4); }
}

/* Grid mặc định cho Desktop */
.spirit-grid-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
  gap: 24px; /* Tăng gap để StoryCard thở */
}

/* ===== THIÊN CƠ CÁC (SIDEBAR - GLASSMORPHISM) ===== */
.sticky-spirit-box { 
  position: sticky; 
  top: 90px; 
  display: flex; 
  flex-direction: column; 
  gap: 30px; 
}

.sidebar-card-aura { 
  background: rgba(11, 15, 25, 0.6); 
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(52, 211, 153, 0.15); 
  border-radius: 20px; 
  padding: 24px; 
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.sidebar-title-xianxia { 
  font-size: 1.1rem; 
  font-weight: 900; 
  color: #34d399; 
  text-transform: uppercase; 
  letter-spacing: 1.5px; 
  margin-bottom: 24px; 
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 0 10px rgba(52, 211, 153, 0.3);
  border-bottom: 1px dashed rgba(52, 211, 153, 0.2);
  padding-bottom: 15px;
}

/* THIÊN BẢNG LIST */
.ranking-spirit-list, .ranking-spirit-list-mobile { display: flex; flex-direction: column; gap: 12px; }

.ranking-spirit-item {
  display: flex; align-items: center; gap: 15px; padding: 12px;
  background: transparent;
  border: 1px solid transparent; 
  border-radius: 12px; cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

@media (hover: hover) {
  .ranking-spirit-item:hover {
    background: rgba(52, 211, 153, 0.05);
    border-color: rgba(52, 211, 153, 0.2);
    transform: translateX(5px);
  }
}

.rank-orb {
  width: 34px; height: 34px; flex-shrink: 0; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 1rem; color: #94a3b8; 
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 2;
}

/* Lệnh Bài Top 1-2-3 */
.rank-orb.top-1 { background: rgba(251, 191, 36, 0.1); border-color: #fbbf24; color: #fbbf24; box-shadow: 0 0 15px rgba(251, 191, 36, 0.3); text-shadow: 0 0 5px #fbbf24; }
.rank-orb.top-2 { background: rgba(226, 232, 240, 0.1); border-color: #e2e8f0; color: #e2e8f0; box-shadow: 0 0 15px rgba(226, 232, 240, 0.2); text-shadow: 0 0 5px #e2e8f0; }
.rank-orb.top-3 { background: rgba(217, 119, 6, 0.1); border-color: #d97706; color: #d97706; box-shadow: 0 0 15px rgba(217, 119, 6, 0.2); text-shadow: 0 0 5px #d97706; }

/* ===== CHUẨN HÓA LẠI CĂN CHỈNH THIÊN BẢNG ===== */

.rank-details {
  flex-grow: 1;
  min-width: 0; 
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start; /* Ép tất cả nội dung canh trái tuyệt đối */
  gap: 4px; /* Khoảng cách vừa phải giữa tên và lượt xem */
}

.rank-name { 
  margin: 0; /* QUAN TRỌNG: Xóa margin mặc định của thẻ h4 làm lệch form */
  padding: 0;
  font-size: 0.95rem; 
  font-weight: 700; 
  color: #f1f5f9; 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis; 
  width: 100%;
  line-height: 1.2; /* Ép chiều cao chữ vừa vặn */
  transition: color 0.3s;
}

@media (hover: hover) {
  .ranking-spirit-item:hover .rank-name { color: #34d399; }
}

.rank-val { 
  margin: 0;
  font-size: 0.75rem; 
  color: #64748b; 
  font-weight: 600; 
  display: flex; 
  align-items: center; 
  gap: 6px; /* Khoảng cách giữa icon mắt và số */
  line-height: 1;
}

/* Icon con mắt màu lục bảo */
.rank-val::before { 
  content: '\f06e'; 
  font-family: 'Font Awesome 6 Free'; 
  font-weight: 900; 
  color: #34d399; 
  font-size: 0.75rem; 
}

.spirit-more-link, .spirit-more-link-mobile {
  display: block; text-align: center; margin-top: 20px;
  color: #94a3b8; font-size: 0.8rem; font-weight: 700; text-transform: uppercase;
  transition: color 0.3s;
  text-decoration: none;
}
@media (hover: hover) {
  .spirit-more-link:hover, .spirit-more-link-mobile:hover { color: #34d399; }
}

/* CĂN CƠ PHÂN LOẠI (TAG CLOUD) */
.tag-cloud-spirit { display: flex; flex-wrap: wrap; gap: 10px; }

.tag-pill-spirit {
  padding: 8px 16px; 
  background: rgba(255, 255, 255, 0.03); 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  border-radius: 50px;
  color: #cbd5e1; 
  font-size: 0.8rem; 
  font-weight: 600; 
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@media (hover: hover) {
  .tag-pill-spirit:hover {
    background: rgba(52, 211, 153, 0.1);
    border-color: #34d399;
    color: #34d399;
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(52, 211, 153, 0.2);
  }
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

  .spirit-header { margin-bottom: 20px; }
  .spirit-title { font-size: 1.2rem; }

  /* Lưới 2 cột cho Mobile để to rõ, dễ bấm */
  .spirit-grid-responsive {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .spirit-block { margin-bottom: 40px; }

  /* Bảng xếp hạng trên mobile cũng xài Glassmorphism */
  .ranking-spirit-list-mobile {
    background: rgba(11, 15, 25, 0.6);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    padding: 15px;
    border-radius: 20px;
    border: 1px solid rgba(52, 211, 153, 0.15);
  }
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
</style>