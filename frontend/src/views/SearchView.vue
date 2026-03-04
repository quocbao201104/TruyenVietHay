<template>
  <div class="search-view-container">
    
    <main class="main-content">
      <div class="container">
        
        <!-- THIÊN CƠ CÁC HEADER -->
        <div class="page-header animate-fadeIn">
          <h1 class="page-title-xianxia">
            <i class="fas fa-dharmachakra animate-spin-slow"></i>
            Thiên Cơ Các
          </h1>
          <p class="page-subtitle">Tầm tiên lộ - Tìm kiếm linh vật trong vạn giới</p>
          <div v-if="keyword" class="search-result-info">
            Đang cảm ứng linh khí cho: <span>"{{ keyword }}"</span>
          </div>
          <div class="header-divider"></div>
        </div>

        <div class="content-layout">
          
          <!-- BỘ LỌC LINH KHÍ (SIDEBAR) -->
          <aside class="filters-sidebar-xianxia">
            <div class="sidebar-inner">
              
              <!-- Search Input (Linh Lực Tìm Kiếm) -->
              <div class="filter-block">
                <div class="block-header">
                  <i class="fas fa-wand-magic-sparkles"></i>
                  <h3>Linh Lực Tìm Kiếm</h3>
                </div>
                <div class="aura-search-wrapper">
                  <input
                    v-model="filters.keyword"
                    type="text"
                    placeholder="Nhập danh tính linh vật..."
                    class="aura-input"
                    @keydown.enter="applyFilters"
                  />
                  <button @click="applyFilters" class="aura-btn">
                    <i class="fas fa-search"></i>
                  </button>
                </div>
              </div>

              <!-- Genre Filter (Phân Loại Căn Cơ) -->
              <div class="filter-block">
                <div class="block-header">
                  <i class="fas fa-scroll"></i>
                  <h3>Phân Loại Căn Cơ</h3>
                </div>
                <div v-if="loadingGenres" class="filter-loading">
                  <i class="fas fa-yin-yang fa-spin"></i>
                </div>
                <div v-else class="genre-grid-xianxia">
                  <label
                    v-for="genre in genres"
                    :key="genre.id_theloai"
                    class="genre-chip"
                    :class="{ 'active': filters.selectedGenres.includes(genre.id_theloai) }"
                  >
                    <input
                      type="checkbox"
                      :value="genre.id_theloai"
                      v-model="filters.selectedGenres"
                      @change="applyFilters"
                      hidden
                    />
                    <span class="chip-text">{{ genre.ten_theloai }}</span>
                  </label>
                </div>
              </div>

              <!-- Status Filter (Trạng Thái Tu Vi) -->
              <div class="filter-block">
                <div class="block-header">
                  <i class="fas fa-hourglass-half"></i>
                  <h3>Trạng Thái Tu Vi</h3>
                </div>
                <div class="status-options">
                  <label v-for="opt in [{v:'', l:'Tất Cả'}, {v:'dang_ra', l:'Đang Ra'}, {v:'hoan_thanh', l:'Đã Viên Mãn'}]" 
                         :key="opt.v" class="status-pill">
                    <input type="radio" :value="opt.v" v-model="filters.status" @change="applyFilters" hidden />
                    <span class="pill-btn" :class="{ 'active': filters.status === opt.v }">{{ opt.l }}</span>
                  </label>
                </div>
              </div>

              <!-- Sort Filter (Thứ Tự Thiên Bảng) -->
              <div class="filter-block">
                <div class="block-header">
                  <i class="fas fa-sort-amount-down"></i>
                  <h3>Thứ Tự Thiên Bảng</h3>
                </div>
                <div class="custom-select-wrapper">
                  <select v-model="filters.sortBy" @change="applyFilters" class="xianxia-select">
                    <option value="thoi_gian_cap_nhat">Mới Cập Nhật</option>
                    <option value="luot_xem">Xem Nhiều Nhất</option>
                    <option value="luot_thich">Được Yêu Thích</option>
                    <option value="ten_truyen">Tên A-Z</option>
                  </select>
                </div>
              </div>

              <!-- Clear Button -->
              <button @click="clearAllFilters" class="clear-btn-xianxia">
                <i class="fas fa-trash-restore"></i>
                Xóa Bỏ Ám Ký
              </button>
            </div>
          </aside>

          <!-- KẾT QUẢ HIỂN THỊ -->
          <section class="results-container-xianxia">
            
            <div class="results-top-bar">
               <div class="count-badge">
                 <i class="fas fa-list-ul"></i>
                 <span>Tìm thấy <strong class="text-emerald-400">{{ totalResults }}</strong> linh vật</span>
               </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="loading-aura-overlay">
               <div class="aura-spinner">
                 <div class="dot"></div>
                 <div class="dot"></div>
                 <div class="dot"></div>
               </div>
               <p>Đang cảm ứng vạn giới...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="state-box error">
              <i class="fas fa-exclamation-triangle"></i>
              <p>Thiên cơ nhiễu loạn: {{ error }}</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="stories.length === 0" class="state-box empty">
              <i class="fas fa-ghost"></i>
              <h3>Không tìm thấy linh vật</h3>
              <p>Thử thay đổi ám ký hoặc linh lực tìm kiếm</p>
            </div>

            <!-- Stories Grid -->
            <div v-else class="stories-grid-xianxia">
              <NewStoryCard
                v-for="story in stories"
                :key="story.id"
                :story="story"
              />
            </div>

            <!-- PHÂN TRANG (PAGINATION) -->
            <div v-if="totalPages > 1" class="xianxia-pagination">
              <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="page-nav">
                <i class="fas fa-chevron-left"></i>
              </button>

              <div class="page-numbers">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="['page-num', { active: page === currentPage }]"
                >
                  {{ page }}
                </button>
              </div>

              <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="page-nav">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>

          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NewStoryCard from '@/modules/storyText/components/NewStoryCard.vue';
import axios from '@/utils/axios';

const route = useRoute();
const router = useRouter();

// State
const loading = ref(false);
const loadingGenres = ref(false);
const error = ref<string | null>(null);
const stories = ref<any[]>([]);
const genres = ref<any[]>([]);
const totalResults = ref(0);
const currentPage = ref(1);
const totalPages = ref(1);

// Filters
const filters = ref({
  keyword: '',
  selectedGenres: [] as number[],
  status: '',
  sortBy: 'thoi_gian_cap_nhat',
});

// Computed Pages
const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - 2);
  let end = Math.min(totalPages.value, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

const keyword = computed(() => filters.value.keyword);

// Methods
const fetchGenres = async () => {
  loadingGenres.value = true;
  try {
    const response = await axios.get('/api/theloai');
    genres.value = response.data.data || [];
  } catch (err) {
    genres.value = [];
  } finally {
    loadingGenres.value = false;
  }
};

const buildQueryParams = () => {
  const params: any = {
    page: currentPage.value,
    limit: 18,
    sort_by: filters.value.sortBy,
    order: 'DESC',
  };
  if (filters.value.keyword?.trim()) params.keyword = filters.value.keyword.trim();
  if (filters.value.status) params.trang_thai = filters.value.status;
  if (filters.value.selectedGenres.length > 0) params.category_ids = filters.value.selectedGenres.join(',');
  return params;
};

const fetchStories = async () => {
  loading.value = true;
  error.value = null;
  try {
    const params = buildQueryParams();
    const response = await axios.get('/api/truyen/public', { params });
    stories.value = response.data.data || [];
    totalResults.value = response.data.pagination?.total || 0;
    totalPages.value = response.data.pagination?.total_pages || 1;
    currentPage.value = response.data.pagination?.current_page || 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Có lỗi xảy ra khi tìm kiếm';
    stories.value = [];
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  currentPage.value = 1;
  updateURL();
};

const clearAllFilters = () => {
  filters.value = { keyword: '', selectedGenres: [], status: '', sortBy: 'thoi_gian_cap_nhat' };
  currentPage.value = 1;
  updateURL();
};

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  updateURL();
};

const updateURL = () => {
  const query: any = {};
  if (filters.value.keyword) query.keyword = filters.value.keyword;
  if (filters.value.status) query.status = filters.value.status;
  if (filters.value.sortBy !== 'thoi_gian_cap_nhat') query.sort = filters.value.sortBy;
  if (filters.value.selectedGenres.length > 0) query.genres = filters.value.selectedGenres.join(',');
  if (currentPage.value > 1) query.page = currentPage.value;
  router.replace({ query });
};

const loadFromURL = () => {
  const query = route.query;
  filters.value.keyword = (query.keyword as string) || '';
  filters.value.status = (query.status as string) || '';
  filters.value.sortBy = (query.sort as string) || 'thoi_gian_cap_nhat';
  if (query.genres) {
    filters.value.selectedGenres = (query.genres as string).split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
  }
  currentPage.value = parseInt(query.page as string) || 1;
};

onMounted(() => {
  fetchGenres();
  loadFromURL();
  fetchStories();
});

watch(() => route.query, () => {
  if (route.name === 'SearchView') {
    loadFromURL();
    fetchStories();
  }
});
</script>

<style scoped>
/* ===== CONTAINER & GLOBAL ===== */
.search-view-container {
  min-height: 100vh;
  background: #0b0f19;
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* ===== PAGE HEADER XIANXIA ===== */
.page-header {
  text-align: center;
  margin-bottom: 50px;
}

.page-title-xianxia {
  font-size: 3rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 5px;
  background: linear-gradient(to right, #34d399, #fff, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-flex;
  align-items: center;
  gap: 20px;
  filter: drop-shadow(0 0 10px rgba(52, 211, 153, 0.3));
}

.page-subtitle {
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-top: 10px;
}

.search-result-info {
  margin-top: 15px;
  font-size: 1rem;
  color: #94a3b8;
}

.search-result-info span {
  color: #34d399;
  font-weight: 700;
}

.header-divider {
  height: 1px;
  width: 300px;
  background: linear-gradient(90deg, transparent, #34d399, transparent);
  margin: 25px auto;
}

/* ===== LAYOUT ===== */
.content-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 40px;
  align-items: start;
}

/* ===== SIDEBAR FILTERS ===== */
.filters-sidebar-xianxia {
  background: #131b2c;
  border: 1px solid #1e293b;
  border-radius: 24px;
  padding: 25px;
  position: sticky;
  top: 40px;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.filter-block {
  margin-bottom: 30px;
}

.block-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.block-header i {
  color: #34d399;
  font-size: 1.1rem;
}

.block-header h3 {
  font-size: 0.9rem;
  font-weight: 800;
  color: #f8fafc;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Aura Search Input */
.aura-search-wrapper {
  display: flex;
  gap: 10px;
}

.aura-input {
  flex: 1;
  background: #0b0f19;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 12px 15px;
  color: #fff;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.aura-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.2);
  outline: none;
}

.aura-btn {
  background: #34d399;
  color: #0b0f19;
  border: none;
  border-radius: 12px;
  width: 45px;
  cursor: pointer;
  transition: all 0.3s;
}

.aura-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px #34d399;
}

/* Genre Grid */
.genre-grid-xianxia {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.genre-chip {
  background: #0b0f19;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 8px 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.genre-chip .chip-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.genre-chip:hover {
  border-color: #34d39960;
  background: #34d39905;
}

.genre-chip.active {
  background: #34d39915;
  border-color: #34d399;
}

.genre-chip.active .chip-text {
  color: #34d399;
}

/* Status Pills */
.status-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pill-btn {
  display: block;
  padding: 10px 15px;
  background: #0b0f19;
  border: 1px solid #1e293b;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s;
}

.pill-btn.active {
  background: #34d399;
  color: #0b0f19;
  border-color: #34d399;
  box-shadow: 0 5px 15px rgba(52, 211, 153, 0.3);
}

/* Select */
.xianxia-select {
  width: 100%;
  background: #0b0f19;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 12px;
  color: #fff;
  font-size: 0.85rem;
  cursor: pointer;
}

/* Clear Button */
.clear-btn-xianxia {
  width: 100%;
  padding: 15px;
  background: #ef444410;
  border: 1px solid #ef444430;
  color: #ef4444;
  border-radius: 12px;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 1px;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.3s;
}

.clear-btn-xianxia:hover {
  background: #ef4444;
  color: #fff;
}

/* ===== RESULTS SECTION ===== */
.results-top-bar {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #1e293b;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #131b2c;
  padding: 8px 18px;
  border-radius: 50px;
  border: 1px solid #1e293b;
  font-size: 0.85rem;
}

.count-badge i { color: #34d399; }

.stories-grid-xianxia {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 25px;
}

/* State Boxes */
.state-box {
  text-align: center;
  padding: 100px 20px;
  background: #131b2c;
  border-radius: 24px;
  border: 1px solid #1e293b;
}

.state-box i { font-size: 4rem; margin-bottom: 20px; opacity: 0.2; }
.state-box.error i { color: #ef4444; opacity: 0.5; }

/* ===== PAGINATION ===== */
.xianxia-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 50px;
}

.page-nav {
  width: 45px;
  height: 45px;
  background: #131b2c;
  border: 1px solid #1e293b;
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.page-nav:disabled { opacity: 0.2; cursor: not-allowed; }
.page-nav:hover:not(:disabled) { border-color: #34d399; color: #34d399; }

.page-numbers {
  display: flex;
  gap: 8px;
}

.page-num {
  width: 45px;
  height: 45px;
  background: transparent;
  border: 1px solid #1e293b;
  border-radius: 12px;
  color: #64748b;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.page-num.active {
  background: #34d399;
  color: #0b0f19;
  border-color: #34d399;
  box-shadow: 0 5px 15px rgba(52, 211, 153, 0.3);
}

/* ===== ANIMATIONS ===== */
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 12s infinite linear;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.8s ease-out;
}

/* Aura Spinner */
.loading-aura-overlay {
  text-align: center;
  padding: 100px 0;
}

.aura-spinner {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

.aura-spinner .dot {
  width: 12px;
  height: 12px;
  background: #34d399;
  border-radius: 50%;
  animation: aura-bounce 1.4s infinite ease-in-out both;
}

.aura-spinner .dot:nth-child(1) { animation-delay: -0.32s; }
.aura-spinner .dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes aura-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .content-layout { grid-template-columns: 280px 1fr; gap: 20px; }
}

@media (max-width: 768px) {
  .content-layout { grid-template-columns: 1fr; }
  .filters-sidebar-xianxia { position: static; max-height: none; }
  .page-title-xianxia { font-size: 2rem; }
  .stories-grid-xianxia { grid-template-columns: repeat(2, 1fr); gap: 15px; }
}
</style>