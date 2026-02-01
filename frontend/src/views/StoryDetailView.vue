<template>
  <div class="story-detail-page">
    <main v-if="loading" class="detail-container">
      <section class="story-info-section">
        <div class="cover-wrapper">
          <SkeletonLoader width="100%" height="100%" borderRadius="8px" />
        </div>
        <div class="info-content">
          <SkeletonLoader width="70%" height="40px" style="margin-bottom: 1rem" />
          <div class="meta-row" style="margin-bottom: 20px">
             <SkeletonLoader width="150px" height="20px" />
             <SkeletonLoader width="100px" height="20px" />
          </div>
           <div class="stats-row" style="margin-bottom: 2rem">
             <SkeletonLoader width="80px" height="50px" />
             <SkeletonLoader width="80px" height="50px" />
             <SkeletonLoader width="80px" height="50px" />
             <SkeletonLoader width="120px" height="50px" />
          </div>
          <div class="actions-row">
            <SkeletonLoader width="140px" height="48px" borderRadius="8px" />
            <SkeletonLoader width="140px" height="48px" borderRadius="8px" />
            <SkeletonLoader width="100px" height="48px" borderRadius="8px" />
          </div>
        </div>
      </section>
    </main>

    <main v-else-if="error" class="error-container">
      <p class="error-msg">{{ error }}</p>
      <router-link to="/" class="back-link">Quay lại trang chủ</router-link>
    </main>

    <main v-else-if="story" class="detail-container">
      <!-- Story Header/Hero Section -->
        <section class="story-info-section" :style="{ '--blur-bg-image': `url(${getImageUrl(story.anh_bia)})` }">
        <div class="cover-wrapper">
          <img 
            :src="getImageUrl(story.anh_bia)" 
            :alt="story.ten_truyen" 
            class="story-cover"
            @error="handleImageError"
          >
        </div>

        <div class="info-content">
          <h1 class="story-title">{{ story.ten_truyen }}</h1>
          
          <div class="meta-row">
            <span class="author"><i class="fas fa-user-pen"></i> {{ story.tac_gia }}</span>
            <span class="status-badge">{{ story.trang_thai }}</span>
            
            <div class="story-genres" v-if="story.genres && story.genres.length">
                <i class="fas fa-tags"></i>
                <router-link 
                    v-for="(genre, index) in story.genres" 
                    :key="genre.id_theloai"
                    :to="`/the-loai?category=${genre.id_theloai}`"
                    class="genre-link"
                >
                    {{ genre.ten_theloai }}<span v-if="Number(index) < story.genres.length - 1">, </span>
                </router-link>
            </div>
          </div>

          <div class="stats-row">
            <div class="stat-item">
              <span class="value">{{ story.so_luong_chuong || 0 }}</span>
              <span class="label">Chương</span>
            </div>
            <div class="stat-item">
              <span class="value">{{ story.luot_xem || 0 }}</span>
              <span class="label">Lượt xem</span>
            </div>
            <!-- Add rating/likes if available -->
             <div class="stat-item">
              <span class="value">{{ story.luot_thich || 0 }}</span>
              <span class="label">Lượt Thích</span>
            </div>
            <div class="stat-item">
              <span class="value rating-value">
                <i class="fas fa-star" style="color: #fbbf24;"></i>
                {{ ratingStats.avg_rating && Number(ratingStats.avg_rating) > 0 ? Number(ratingStats.avg_rating).toFixed(1) : 'N/A' }}
              </span>
              <span class="label">Đánh giá ({{ ratingStats.total_ratings || 0 }})</span>
            </div>
          </div>

        <!-- Corrected Actions Row -->
        <div class="actions-row">
            <router-link v-if="firstChapterSlug && story" :to="`/truyen-chu/${story.slug}/${firstChapterSlug}`" class="btn-read">
                <i class="fas fa-book-open"></i> Đọc Ngay
            </router-link>
            
            <button @click="toggleFollow" class="btn-follow" :class="{ 'followed': isFollowed }">
                <i class="fas" :class="isFollowed ? 'fa-heart' : 'fa-heart-circle-plus'"></i>
                {{ isFollowed ? 'Đang Theo Dõi' : 'Theo Dõi' }}
            </button>

            <button @click="handleToggleLike" class="btn-like" :class="{ 'liked': isLiked }">
                <i class="fas fa-thumbs-up"></i>
                {{ isLiked ? 'Đã Thích' : 'Thích' }} 
            </button>
        </div>

          <!-- Rating Section -->
          <div class="rating-section">
            <div class="rating-label">Đánh giá của bạn:</div>
            <div class="stars-input">
              <i 
                v-for="star in 5" 
                :key="star"
                @click="handleRating(star)"
                @mouseenter="hoverRating = star"
                @mouseleave="hoverRating = 0"
                :class="['fas fa-star star-icon', { 
                  'active': star <= (hoverRating || userRating),
                  'hover': star <= hoverRating
                }]"
              ></i>
            </div>
          </div>

        </div>
      </section>

      <!-- Tabs Navigation -->
      <div class="tabs-nav">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: currentTab === tab.id }]"
          @click="currentTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <section class="tab-content">
        <!-- Introduction Tab -->
        <div v-if="currentTab === 'intro'" class="intro-panel">
            <h3 class="panel-title">Giới thiệu</h3>
            <p class="description-text">{{ story.mo_ta }}</p>
        </div>

        <!-- Chapters Tab -->
        <div v-if="currentTab === 'chapters'" class="chapters-panel">
             <h3 class="panel-title">Danh sách chương</h3>
             <!-- Use shared/local component or simple list -->
             <div v-if="chapterLoading" class="text-center py-4">Đang tải chương...</div>
             <div v-else-if="chapters.length === 0" class="text-center py-4 text-gray-400">Chưa có chương nào.</div>
             <div v-else>
               <div class="chapter-grid">
                 <router-link 
                   v-for="chap in paginatedChapters" 
                   :key="chap.id" 
                   :to="`/truyen-chu/${story?.slug}/${chap.slug}`"
                   class="chapter-item"
                 >
                   <span class="chap-title">{{ chap.ten_chuong || chap.tieu_de }}</span>
                   <span class="chap-date">{{ formatDate(chap.thoi_gian_dang || chap.created_at || '') }}</span>
                 </router-link>
               </div>

               <!-- Pagination Controls -->
               <div class="pagination-controls" v-if="totalPages > 1">
                   <button 
                       @click="changePage(currentPage - 1)" 
                       :disabled="currentPage === 1"
                       class="pagination-btn"
                   >
                       <i class="fas fa-chevron-left"></i>
                   </button>
                   
                   <span class="pagination-info">Trang {{ currentPage }} / {{ totalPages }}</span>
                   
                   <button 
                       @click="changePage(currentPage + 1)" 
                       :disabled="currentPage === totalPages"
                       class="pagination-btn"
                   >
                       <i class="fas fa-chevron-right"></i>
                   </button>
               </div>
             </div>
        </div>

        <!-- Comments Tab -->
        <div v-if="currentTab === 'comments'" class="comments-panel">
           <CommentList :story-id="story.id" />
        </div>
      </section>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';
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
  { id: 'intro', label: 'Giới Thiệu' },
  { id: 'chapters', label: 'Danh Sách Chương' },
  { id: 'comments', label: 'Bình Luận' },
];

const story = computed(() => storyStore.currentStory);
const loading = computed(() => storyStore.loading);
const error = computed(() => storyStore.error);
const isLiked = computed(() => storyStore.isLiked);
const likeCount = computed(() => storyStore.likeCount);

const handleToggleLike = async () => {
    if (!story.value) return;
    try {
        await storyStore.toggleLike(story.value.id);
    } catch (error) {
        console.error('Toggle like error:', error);
    }
};

const chapters = computed(() => chapterStore.chapterList);
const chapterLoading = computed(() => chapterStore.loading);

// Pagination Logic
const currentPage = ref(1);
const itemsPerPage = 20;

const paginatedChapters = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return chapters.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(chapters.value.length / itemsPerPage));

const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

const firstChapterSlug = computed(() => {
    if (chapters.value.length > 0) {
        // Assuming chapters are sorted asc by default or logic needs to ensure it
        return chapters.value[0].slug;
    }
    return null;
});

// Follow Logic
const isFollowed = computed(() => {
    if (!story.value) return false;
    // Check if story ID exists in favorite list
    return favoriteStore.favorites.some(f => f.id === story.value.id);
});

const toggleFollow = async () => {
    if (!story.value) return;
    try {
        await favoriteStore.toggleFollow(story.value.id);
        // Refresh favorites list to reflect the change
        await favoriteStore.fetchFavorites();
    } catch (error) {
        console.error('Toggle follow error:', error);
    }
};

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
};

const handleImageError = (e: Event) => {
    (e.target as HTMLImageElement).src = '/img/default-cover.png';
};

// Local getImageUrl removed, using global helper

const handleRating = async (rating: number) => {
    if (!story.value) return;
    try {
        await ratingStore.submitUserRating(story.value.id, rating);
    } catch (error) {
        console.error('Rating error:', error);
    }
};

const fetchData = async () => {
    const slug = route.params.slug as string;
    if (slug) {
        storyStore.clearData();
        chapterStore.clearChapterList();
        
        await storyStore.fetchStoryBySlug(slug); 
        
        if (story.value) {
           await chapterStore.fetchChapterList(story.value.id);
           incrementViewCount(story.value.id);
           await favoriteStore.fetchFavorites();
           await storyStore.fetchLikeStatus(story.value.id);
           await ratingStore.fetchRatings(story.value.id);
        }
    }
};



onMounted(() => {
    if (route.query.tab) {
        currentTab.value = route.query.tab as string;
    }
    fetchData();
});

watch(() => route.params.slug, (newSlug, oldSlug) => {
    if (route.name === 'StoryDetail' && newSlug !== oldSlug) {
        fetchData();
    }
});
</script>

<style scoped>
/* Basic Styles - Detailed styling can be enhanced */
.story-detail-page {
    min-height: 100vh;
    background-color: #1a1d29;
    color: #fff;
    font-family: 'Manrope', sans-serif;
}

.detail-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

.story-info-section {
    display: flex;
    gap: 2rem;
    margin-bottom: 3rem;
    background: rgba(255,255,255,0.05);
    padding: 2rem;
    border-radius: 12px;
}

.cover-wrapper {
    flex-shrink: 0;
    width: 240px;
    height: 320px;
    overflow: hidden;
    border-radius: 8px;
}

.story-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
}

.info-content {
    flex-grow: 1;
}

.story-title {
    font-size: 2.5rem;
    font-weight: 800;
    color: #4ade80;
    margin-bottom: 1rem;
}

.meta-row {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    margin-bottom: 1.5rem;
    color: #ccc;
    font-size: 1.1rem;
}

.status-badge {
    padding: 2px 10px;
    background: #374151;
    border-radius: 4px;
    font-size: 0.9rem;
}

.story-genres {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #9ca3af;
    font-size: 0.95rem;
}

.genre-link {
    color: #4ade80;
    text-decoration: none;
    transition: color 0.2s;
}

.genre-link:hover {
    color: #22c55e;
    text-decoration: underline;
}

.stats-row {
  display: flex;
  gap: 3rem;
  margin-bottom: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.1);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding: 1rem 0;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-item .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
}

.stat-item .label {
    font-size: 0.9rem;
    color: #9ca3af;
}

.genres-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 2rem;
}

.genre-tag {
    padding: 4px 12px;
    border: 1px solid #4ade80;
    color: #4ade80;
    border-radius: 20px;
    font-size: 0.9rem;
}

.actions-row {
    display: flex;
    gap: 12px;
    margin-top: 20px;
    flex-wrap: wrap;
}

.btn-read, .btn-follow, .btn-like {
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-read {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
    text-decoration: none;
    border: none;
}

.btn-read:hover {
    background: linear-gradient(135deg, #16a34a, #15803d);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
}

.btn-follow {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    border: none;
}

.btn-follow:hover {
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.btn-follow.followed {
    background: linear-gradient(135deg, #f87171, #ef4444);
}

.btn-like {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border: none;
}

.btn-like:hover {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-like.liked {
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
}

/* Tabs */
.tabs-nav {
    display: flex;
    gap: 2rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    margin-bottom: 2rem;
}

.tab-btn {
    padding: 1rem 0;
    background: none;
    border: none;
    color: #9ca3af;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    position: relative;
    transition: color 0.3s;
}

.tab-btn:hover {
    color: white;
}

.tab-btn.active {
    color: #4ade80;
}

.tab-btn.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 3px;
    background: #4ade80;
}

.panel-title {
    font-size: 1.5rem;
    color: #fff;
    margin-bottom: 1rem;
    border-left: 4px solid #4ade80;
    padding-left: 1rem;
}

.description-text {
    line-height: 1.8;
    color: #d1d5db;
    white-space: pre-line;
}

.chapter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
}

.chapter-item {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    background: rgba(255,255,255,0.05);
    border-radius: 8px;
    text-decoration: none;
    color: #d1d5db;
    transition: background 0.2s;
}

.chapter-item:hover {
    background: rgba(45, 212, 191, 0.1);
    color: #4ade80;
}

.chap-title {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0 1rem;
}

.chap-date {
    font-size: 0.85rem;
    color: #6b7280;
}

/* Rating Section */
.rating-section {
    margin-top: 1rem;
    padding: 1rem;
    background: rgba(255,255,255,0.03);
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.rating-label {
    font-size: 1rem;
    color: #d1d5db;
    font-weight: 600;
}

.stars-input {
    display: flex;
    gap: 0.5rem;
}

.star-icon {
    font-size: 1.8rem;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
}

.star-icon.active {
    color: #fbbf24;
}

.star-icon.hover {
    color: #fbbf24;
    transform: scale(1.1);
}

.rating-value {
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

/* Pagination Styles */
.pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255,255,255,0.05);
}

.pagination-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
    background: #4ade80;
    color: #000;
    transform: translateY(-2px);
}

.pagination-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.pagination-info {
    color: #9ca3af;
    font-size: 0.95rem;
    font-weight: 600;
}

/* Responsive */
/* Responsive & Mobile Optimization */
@media (max-width: 768px) {
    .detail-container {
        padding: 0;
        max-width: 100%;
    }

    /* Mobile Hero/Header Section */
    .story-info-section {
        flex-direction: column;
        align-items: center;
        text-align: center;
        background: transparent;
        padding: 0;
        margin-bottom: 0;
        position: relative;
        overflow: hidden;
    }

    /* Blurred Background Effect */
    .story-info-section::before {
        content: '';
        position: absolute;
        top: -20px;
        left: -20px;
        right: -20px;
        height: 380px;
        background-color: #1a1d29;
        background-image: var(--blur-bg-image);
        background-size: cover;
        background-position: center;
        filter: blur(40px) brightness(0.4);
        z-index: 0;
        opacity: 0.8;
    }

    .cover-wrapper {
        position: relative;
        z-index: 1;
        width: 140px;
        height: 200px;
        margin-top: 2rem;
        box-shadow: 0 8px 16px rgba(0,0,0,0.5);
        border: 2px solid rgba(255,255,255,0.1);
    }

    .info-content {
        position: relative;
        z-index: 1;
        width: 100%;
        padding: 1.5rem 1rem;
        background: linear-gradient(to bottom, transparent, #1a1d29 10%);
        margin-top: -60px; /* Pull content up to overlap blur */
        padding-top: 70px;
    }

    .story-title {
        font-size: 1.6rem;
        line-height: 1.3;
        margin-bottom: 0.5rem;
        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }

    .meta-row {
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.8rem;
        font-size: 0.9rem;
        margin-bottom: 1rem;
    }

    /* Stats Row - Horizontal Scroll or Grid */
    .stats-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        background: rgba(255,255,255,0.05);
        border-radius: 12px;
        padding: 1rem;
        margin: 1rem 0;
        border: none;
    }
    
    .stat-item {
        flex-direction: row; /* Horizontal stat items */
        justify-content: center;
        gap: 8px;
    }
    
    .stat-item .value {
        font-size: 1.1rem;
    }

    /* Action Buttons */
    .actions-row {
        justify-content: space-between;
        gap: 12px;
        padding: 0 0.5rem;
    }

    .btn-read {
        flex: 1;
        justify-content: center;
        background: #22c55e; /* Solid color for better visibility */
    }
    
    .btn-follow, .btn-like {
        padding: 12px;
        width: 48px; /* Square buttons */
        height: 48px;
        justify-content: center;
        font-size: 0; /* Hide text */
    }
    
    .btn-follow i, .btn-like i {
         font-size: 1.2rem;
         margin: 0;
    }

    /* Tabs */
    .tabs-nav {
        margin: 0 -1rem 1rem -1rem;
        padding: 0 1rem;
        gap: 1.5rem;
        overflow-x: auto;
        justify-content: flex-start; /* Left align scrollable tabs */
        -webkit-overflow-scrolling: touch;
        border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .tab-btn {
        white-space: nowrap;
        padding: 12px 0;
    }

    /* Chapter List */
    .chapter-grid {
        grid-template-columns: 1fr; /* Single column list */
        gap: 8px;
    }

    .chapter-item {
        background: transparent;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        border-radius: 0;
        padding: 12px 0;
    }
    
    .chapter-item:hover {
         background: transparent;
    }

    /* Rating Section */
    .rating-section {
        flex-direction: column;
        background: rgba(255,255,255,0.05);
        margin: 1rem 0;
    }
}
</style>

