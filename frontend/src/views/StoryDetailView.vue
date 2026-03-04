<template>
  <div class="story-detail-page-xianxia">
    <!-- TRẠNG THÁI LOADING -->
    <main v-if="loading" class="detail-container">
      <section class="story-hero-loading">
        <div class="skeleton-aura">
          <SkeletonLoader width="240px" height="340px" borderRadius="16px" />
          <div class="skeleton-info">
            <SkeletonLoader width="60%" height="48px" style="margin-bottom: 20px" />
            <SkeletonLoader width="40%" height="24px" style="margin-bottom: 30px" />
            <div class="flex gap-4">
              <SkeletonLoader width="120px" height="80px" borderRadius="12px" />
              <SkeletonLoader width="120px" height="80px" borderRadius="12px" />
              <SkeletonLoader width="120px" height="80px" borderRadius="12px" />
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- TRẠNG THÁI LỖI -->
    <main v-else-if="error" class="error-container-xianxia">
      <div class="error-box">
        <i class="fas fa-ghost text-5xl mb-4 opacity-30"></i>
        <p class="error-msg">Thiên cơ nhiễu loạn: {{ error }}</p>
        <router-link to="/" class="back-link-aura">Trở lại phàm trần</router-link>
      </div>
    </main>

    <!-- NỘI DUNG CHÍNH -->
    <main v-else-if="story" class="detail-container animate-fadeIn">
      
      <!-- STORY HERO SECTION (Khối thông tin chính theo chuẩn ảnh mẫu) -->
      <section class="story-hero-section">
        <div class="hero-content">
          
          <!-- Bìa Truyện -->
          <div class="cover-wrapper">
            <img 
              :src="getImageUrl(story.anh_bia)" 
              :alt="story.ten_truyen" 
              class="story-cover-main"
              @error="handleImageError"
            >
            <div class="status-sigil-detail" :class="statusClass">
               {{ formatStatus(story.trang_thai) }}
            </div>
          </div>

          <!-- Thông tin truyện -->
          <div class="info-content">
            <h1 class="story-title-main">{{ story.ten_truyen }}</h1>
            
            <div class="meta-row">
              <span class="author-link">
                <i class="fas fa-leaf text-emerald-500"></i> {{ story.tac_gia || 'Đang cập nhật' }}
              </span>
              
              <div class="genre-tags" v-if="story.genres && story.genres.length">
                <i class="fas fa-book-open text-slate-500"></i>
                <router-link 
                  v-for="(genre, index) in story.genres" 
                  :key="genre.id_theloai"
                  :to="`/the-loai?categories=${genre.id_theloai}`"
                  class="genre-tag"
                >
                  {{ genre.ten_theloai }}<span v-if="Number(index) < story.genres.length - 1" class="text-slate-600">, </span>
                </router-link>
              </div>
            </div>

            <!-- Chỉ số linh khí (Stats Boxes) -->
            <div class="stats-grid">
              <div class="stat-box">
                <span class="value">{{ story.so_luong_chuong || 0 }}</span>
                <span class="label">CHƯƠNG</span>
              </div>
              <div class="stat-box">
                <span class="value">{{ formatNumber(story.luot_xem || 0) }}</span>
                <span class="label">LƯỢT XEM</span>
              </div>
              <div class="stat-box rating-stat">
                <div class="rating-val">
                  <i class="fas fa-star text-yellow-500 text-sm"></i>
                  <span class="value">{{ ratingStats.avg_rating > 0 ? Number(ratingStats.avg_rating).toFixed(1) : '5.0' }}</span>
                </div>
                <span class="label">{{ ratingStats.total_ratings || 0 }} ĐÁNH GIÁ</span>
              </div>
            </div>

            <!-- Hành động (Action Buttons) -->
            <div class="actions-row">
              <router-link v-if="firstChapterSlug" :to="`/truyen-chu/${story.slug}/${firstChapterSlug}`" class="btn-primary">
                <i class="fas fa-book-reader mr-2"></i> BẮT ĐẦU TU LUYỆN
              </router-link>
              
              <button @click="toggleFollow" class="btn-secondary" :class="{ 'followed': isFollowed }">
                <i class="fas fa-heart"></i>
                <span>{{ isFollowed ? 'Đang Theo Dõi' : 'Theo Dõi' }}</span>
              </button>

              <button @click="handleToggleLike" class="btn-like" :class="{ 'liked': isLiked }">
                <i class="fas fa-thumbs-up"></i>
                <span>{{ isLiked ? 'Đã Thích' : 'Thích' }}</span>
              </button>
            </div>

            <!-- Rating Input (Định Phẩm) -->
            <div class="rating-input-box">
              <span class="label">Định phẩm linh thư:</span>
              <div class="star-group">
                <i 
                  v-for="star in 5" 
                  :key="star"
                  @click="handleRating(star)"
                  @mouseenter="hoverRating = star"
                  @mouseleave="hoverRating = 0"
                  :class="['fas fa-star', { 
                    'active': star <= (hoverRating || userRating),
                    'hover': star <= hoverRating
                  }]"
                ></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TABS ĐIỀU HƯỚNG (Kiểu đường kẻ ngang dưới) -->
      <div class="tabs-nav-clean">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-item', { active: currentTab === tab.id }]"
          @click="currentTab = tab.id"
        >
          <i class="fas" :class="tab.icon"></i>
          {{ tab.label }}
        </button>
      </div>

      <!-- NỘI DUNG CHI TIẾT THEO TAB -->
      <section class="tab-content-area animate-fadeIn">
        
        <!-- Tab: Giới Thiệu (Tóm tắt) -->
        <div v-if="currentTab === 'intro'" class="content-panel intro">
            <h3 class="panel-title"><i class="fas fa-feather"></i> Tóm Tắt Bí Tịch</h3>
            <div class="description-text">{{ story.mo_ta }}</div>
        </div>

        <!-- Tab: Chương (Danh sách) -->
        <div v-if="currentTab === 'chapters'" class="content-panel chapters">
             <div class="panel-header-row">
               <h3 class="panel-title"><i class="fas fa-list-ul"></i> Danh Sách Chương</h3>
               <span class="text-sm text-slate-500">{{ chapters.length }} chương</span>
             </div>
             
             <div v-if="chapterLoading" class="loading-state">Đang thỉnh chương...</div>
             <div v-else-if="chapters.length === 0" class="empty-state">Bí tịch chưa được viết...</div>
             <div v-else>
               <div class="chapter-grid">
                 <router-link 
                   v-for="chap in paginatedChapters" 
                   :key="chap.id" 
                   :to="`/truyen-chu/${story?.slug}/${chap.slug}`"
                   class="chapter-item"
                 >
                   <span class="chap-name">{{ chap.ten_chuong || chap.tieu_de }}</span>
                   <span class="chap-time">{{ formatDate(chap.thoi_gian_dang) }}</span>
                 </router-link>
               </div>

               <!-- Phân trang -->
               <div class="pagination-bar" v-if="totalPages > 1">
                   <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="page-btn"><i class="fas fa-chevron-left"></i></button>
                   <span class="page-text">Tầng {{ currentPage }} / {{ totalPages }}</span>
                   <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="page-btn"><i class="fas fa-chevron-right"></i></button>
               </div>
             </div>
        </div>

        <!-- Tab: Bình Luận (Luận Đạo) -->
        <div v-if="currentTab === 'comments'" class="content-panel comments">
           <h3 class="panel-title"><i class="fas fa-comments"></i> Khu Vực Luận Đạo</h3>
           <CommentList :story-id="story.id" />
        </div>
      </section>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useStoryStore } from '@/modules/storyText/story.store';
import { useChapterStore } from '@/modules/storyText/chapter/chapter.store';
import { useFavoriteStore } from '@/modules/favorite/favorite.store'; 
import { useRatingStore } from '@/modules/rating/rating.store';
import CommentList from '@/modules/comment/CommentList.vue';
import SkeletonLoader from '@/components/common/SkeletonLoader.vue';
import { incrementViewCount } from "@/modules/storyText/story.service";
import { getImageUrl } from "@/config/constants";

const route = useRoute();
const storyStore = useStoryStore();
const chapterStore = useChapterStore();
const favoriteStore = useFavoriteStore();
const ratingStore = useRatingStore();

const hoverRating = ref(0);
const userRating = computed(() => ratingStore.userRating);
const ratingStats = computed(() => ratingStore.stats);

const currentTab = ref('intro');
const tabs = [
  { id: 'intro', label: 'BẢN THẢO', icon: 'fa-book-open' },
  { id: 'chapters', label: 'BÍ TỊCH', icon: 'fa-list-ol' },
  { id: 'comments', label: 'LUẬN ĐẠO', icon: 'fa-comments' },
];

const story = computed(() => storyStore.currentStory);
const loading = computed(() => storyStore.loading);
const error = computed(() => storyStore.error);
const isLiked = computed(() => storyStore.isLiked);

const chapters = computed(() => chapterStore.chapterList);
const chapterLoading = computed(() => chapterStore.loading);

// Phân trang
const currentPage = ref(1);
const itemsPerPage = 30; // Hiện 30 chương cho đẹp lưới
const paginatedChapters = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return chapters.value.slice(start, start + itemsPerPage);
});
const totalPages = computed(() => Math.ceil(chapters.value.length / itemsPerPage));
const changePage = (page: number) => { if (page >= 1 && page <= totalPages.value) currentPage.value = page; };

const firstChapterSlug = computed(() => chapters.value.length > 0 ? chapters.value[0].slug : null);

// Follow/Like Logic
const isFollowed = computed(() => story.value ? favoriteStore.favorites.some(f => f.id === story.value?.id) : false);
const toggleFollow = async () => {
    if (!story.value) return;
    await favoriteStore.toggleFollow(story.value.id);
    await favoriteStore.fetchFavorites();
};
const handleToggleLike = async () => {
    if (story.value) await storyStore.toggleLike(story.value.id);
};

const handleRating = async (rating: number) => {
    if (story.value) await ratingStore.submitUserRating(story.value.id, rating);
};

const formatDate = (d?: string | null) => {
    if (!d) return '';
    const date = new Date(d);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

const handleImageError = (e: Event) => { (e.target as HTMLImageElement).src = '/img/default-cover.png'; };

const formatStatus = (s: string) => {
  const map: any = { 'dang_ra': 'Đang Ra', 'hoan_thanh': 'Viên Mãn', 'suspended': 'Tạm Ngưng' };
  return map[s] || 'Đang Ra';
};

const statusClass = computed(() => {
  if (!story.value) return '';
  const s = story.value.trang_thai;
  return s === 'hoan_thanh' ? 'completed' : (s === 'dang_ra' ? 'ongoing' : 'suspended');
});

const fetchData = async () => {
    const slug = route.params.slug as string;
    if (slug) {
        storyStore.clearData();
        chapterStore.clearChapterList();
        await storyStore.fetchStoryBySlug(slug); 
        if (story.value) {
            await Promise.all([
                chapterStore.fetchChapterList(story.value.id),
                favoriteStore.fetchFavorites(),
                storyStore.fetchLikeStatus(story.value.id),
                ratingStore.fetchRatings(story.value.id)
            ]);
            incrementViewCount(story.value.id);
        }
    }
};

const formatNumber = (num: number) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

onMounted(() => {
    if (route.query.tab) currentTab.value = route.query.tab as string;
    fetchData();
});

watch(() => route.params.slug, () => { if (route.name === 'StoryDetail') fetchData(); });
</script>

<style scoped>
/* Import font Be Vietnam Pro */
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap");

/* ===== CORE THEME ===== */
.story-detail-page-xianxia {
  min-height: 100vh;
  background-color: #0b0f19; /* Nền đen sâu */
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
  padding-bottom: 60px;
}

.detail-container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* ===== HERO SECTION (Tối giản, Khối hộp theo ảnh mẫu) ===== */
.story-hero-section {
  background-color: #131b2c; /* Thẻ card màu xanh đen đậm */
  border-radius: 16px;
  padding: 35px 40px;
  margin-bottom: 40px;
}

.hero-content {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

/* Ảnh Bìa */
.cover-wrapper {
  flex-shrink: 0;
  width: 220px;
  height: 310px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  background: #0b0f19;
}

.story-cover-main {
  width: 100%; height: 100%;
  object-fit: cover;
}

.status-sigil-detail {
  position: absolute;
  top: 10px; left: 10px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #fff;
}
.status-sigil-detail.completed { background: #10b981; }
.status-sigil-detail.ongoing { background: #3b82f6; }

/* Thông tin chính */
.info-content { flex: 1; }

.story-title-main {
  font-size: 2.2rem;
  font-weight: 800;
  color: #f8fafc;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  margin-bottom: 25px;
  color: #94a3b8;
  font-size: 0.95rem;
}

.author-link { font-weight: 600; color: #cbd5e1; }
.genre-tags { display: flex; gap: 8px; align-items: center; }
.genre-tag { color: #10b981; text-decoration: none; font-weight: 500; }
.genre-tag:hover { text-decoration: underline; }

/* 3 Ô THỐNG KÊ (Stats Boxes) */
.stats-grid {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

.stat-box {
  background: #0f172a; /* Màu nền ô tối hơn một chút */
  border-radius: 12px;
  padding: 15px 25px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 130px;
  border: 1px solid rgba(255,255,255,0.02);
}

.stat-box .value { font-size: 1.4rem; font-weight: 800; color: #f8fafc; line-height: 1; margin-bottom: 6px; }
.stat-box .label { font-size: 0.7rem; color: #64748b; font-weight: 700; letter-spacing: 0.5px; }

.rating-stat .rating-val { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 6px; }
.rating-stat .rating-val .value { margin-bottom: 0; }

/* NÚT BẤM (Buttons Row) */
.actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 25px;
}

.btn-primary {
  background: #10b981; /* Xanh lục bảo trơn như mẫu */
  color: #fff;
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
}
.btn-primary:hover { background: #059669; }

.btn-secondary {
  background: #1e293b;
  color: #cbd5e1;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #334155;
  transition: all 0.2s;
}
.btn-secondary:hover { background: #334155; }
.btn-secondary.followed { color: #f43f5e; border-color: #f43f5e50; }

.btn-like {
  background: #1e293b;
  color: #cbd5e1;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #334155;
  transition: all 0.2s;
}
.btn-like.liked { background: #3b82f6; color: #fff; border-color: #3b82f6; }
.btn-like:hover:not(.liked) { background: #334155; }

/* RATING INPUT */
.rating-input-box {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.05);
}
.rating-input-box .label { font-size: 0.9rem; color: #94a3b8; font-weight: 500; }
.star-group { display: flex; gap: 6px; font-size: 1.2rem; color: #334155; }
.star-group i { cursor: pointer; transition: 0.2s; }
.star-group i.active, .star-group i.hover { color: #fbbf24; }

/* ===== TABS NAVIGATION (Thiết kế kẻ gạch dưới) ===== */
.tabs-nav-clean {
  display: flex;
  gap: 30px;
  border-bottom: 2px solid #1e293b;
  margin-bottom: 30px;
}

.tab-item {
  background: none;
  border: none;
  padding: 15px 0;
  font-size: 1rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  position: relative;
  transition: 0.3s;
}
.tab-item:hover { color: #cbd5e1; }
.tab-item.active { color: #10b981; }
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -2px; /* Đè lên border của container */
  left: 0; right: 0;
  height: 2px;
  background-color: #10b981;
}

/* ===== TAB CONTENT ===== */
.content-panel {
  background: #131b2c;
  border-radius: 16px;
  padding: 30px 40px;
}

.panel-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #f8fafc;
  margin-bottom: 20px;
  display: flex; align-items: center; gap: 10px;
}

.panel-header-row {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px;
}
.panel-header-row .panel-title { margin-bottom: 0; }

.description-text {
  line-height: 1.8;
  color: #94a3b8;
  white-space: pre-line;
  font-size: 1.05rem;
}

/* Chapter Grid */
.chapter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.chapter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: #0f172a;
  border-radius: 8px;
  text-decoration: none;
  transition: 0.2s;
  border: 1px solid transparent;
}
.chapter-item:hover { background: #1e293b; border-color: #334155; }
.chap-name { color: #cbd5e1; font-weight: 500; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 15px; }
.chap-time { font-size: 0.75rem; color: #64748b; flex-shrink: 0; }

/* Pagination */
.pagination-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
}
.page-btn {
  width: 36px; height: 36px; border-radius: 8px;
  background: #1e293b; border: 1px solid #334155; color: #fff;
  transition: 0.2s; cursor: pointer;
}
.page-btn:hover:not(:disabled) { background: #334155; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.page-text { font-weight: 600; color: #94a3b8; font-size: 0.9rem; }


/* ===== TỐI ƯU MOBILE (NHỎ GỌN & CÂN ĐỐI) ===== */
@media (max-width: 768px) {
  .detail-container { padding: 15px 12px; }

  .story-hero-section {
    padding: 20px 15px;
    border-radius: 12px;
  }

  .hero-content {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .cover-wrapper {
    width: 140px; /* Thu nhỏ ảnh bìa trên mobile */
    height: 200px;
    border-radius: 8px;
  }

  .info-content {
    width: 100%;
    text-align: center; /* Căn giữa thông tin trên mobile */
  }

  .story-title-main { font-size: 1.5rem; margin-bottom: 8px; }
  
  .meta-row { 
    justify-content: center; 
    margin-bottom: 20px; 
    font-size: 0.85rem;
  }

  /* Chỉnh lại Stats Boxes trên Mobile */
  .stats-grid {
    gap: 10px;
  }
  .stat-box {
    min-width: 0; flex: 1; /* Chia đều 3 cột */
    padding: 10px 5px;
    border-radius: 8px;
  }
  .stat-box .value { font-size: 1.1rem; }
  .stat-box .label { font-size: 0.6rem; }

  /* Nút bấm trên Mobile */
  .actions-row {
    flex-direction: column; /* Đọc truyện nằm trên, Theo dõi/Thích nằm dưới */
    gap: 10px;
    margin-bottom: 20px;
  }
  .btn-primary { width: 100%; justify-content: center; padding: 14px; }
  
  .btn-group-mobile { display: flex; gap: 10px; width: 100%; } /* Bao bọc Follow và Like nếu cần */
  .btn-secondary, .btn-like { width: 100%; justify-content: center; }

  .rating-input-box {
    flex-direction: column;
    gap: 8px;
    padding-top: 15px;
  }

  .tabs-nav-clean {
    gap: 15px;
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 2px;
  }
  .tab-item { font-size: 0.9rem; padding: 12px 10px; }

  .content-panel { padding: 20px 15px; border-radius: 12px; }
  .panel-title { font-size: 1.1rem; }
  .description-text { font-size: 0.95rem; }
  
  .chapter-grid { grid-template-columns: 1fr; } /* 1 cột trên mobile */
  .chapter-item { padding: 12px 15px; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn { animation: fadeIn 0.4s ease-out; }
</style>