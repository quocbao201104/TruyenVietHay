<template>
  <div class="search-view-container">
    
    <main class="main-content">
      <div class="container">
        <!-- Page Header -->
        <div class="page-header">
          <h1 class="page-title">
            <i class="fas fa-search"></i>
            Tìm Kiếm Truyện
          </h1>
          <p v-if="keyword" class="search-keyword">
            Kết quả tìm kiếm cho: <span>"{{ keyword }}"</span>
          </p>
        </div>

        <div class="content-layout">
          <!-- Filters Sidebar -->
          <aside class="filters-sidebar">
            <!-- Search Input -->
            <div class="filter-section">
              <div class="filter-header">
                <i class="fas fa-keyboard"></i>
                <h3>Từ khóa</h3>
              </div>
              <div class="search-input-wrapper">
                <input
                  v-model="filters.keyword"
                  type="text"
                  placeholder="Nhập tên truyện..."
                  class="search-input"
                  @keydown.enter="applyFilters"
                />
                <button @click="applyFilters" class="search-btn">
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>

            <!-- Genre Filter -->
            <div class="filter-section">
              <div class="filter-header">
                <i class="fas fa-bookmark"></i>
                <h3>Thể loại</h3>
              </div>
              <div v-if="loadingGenres" class="filter-loading">
                <i class="fas fa-spinner fa-spin"></i> Đang tải...
              </div>
              <div v-else class="genre-list">
                <label
                  v-for="genre in genres"
                  :key="genre.id_theloai"
                  class="genre-item"
                >
                  <input
                    type="checkbox"
                    :value="genre.id_theloai"
                    v-model="filters.selectedGenres"
                    @change="applyFilters"
                  />
                  <span class="genre-name">{{ genre.ten_theloai }}</span>
                </label>
              </div>
            </div>

            <!-- Status Filter -->
            <div class="filter-section">
              <div class="filter-header">
                <i class="fas fa-tasks"></i>
                <h3>Trạng thái</h3>
              </div>
              <div class="status-list">
                <label class="status-item">
                  <input
                    type="radio"
                    value=""
                    v-model="filters.status"
                    @change="applyFilters"
                  />
                  <span>Tất cả</span>
                </label>
                <label class="status-item">
                  <input
                    type="radio"
                    value="dang_ra"
                    v-model="filters.status"
                    @change="applyFilters"
                  />
                  <span>Đang ra</span>
                </label>
                <label class="status-item">
                  <input
                    type="radio"
                    value="hoan_thanh"
                    v-model="filters.status"
                    @change="applyFilters"
                  />
                  <span>Hoàn thành</span>
                </label>
                <label class="status-item">
                  <input
                    type="radio"
                    value="de_xuat"
                    v-model="filters.status"
                    @change="applyFilters"
                  />
                  <span>Đề xuất</span>
                </label>
              </div>
            </div>

            <!-- Sort Filter -->
            <div class="filter-section">
              <div class="filter-header">
                <i class="fas fa-sort"></i>
                <h3>Sắp xếp</h3>
              </div>
              <select v-model="filters.sortBy" @change="applyFilters" class="sort-select">
                <option value="thoi_gian_cap_nhat">Mới cập nhật</option>
                <option value="luot_xem">Xem nhiều nhất</option>
                <option value="luot_thich">Được yêu thích</option>
                <option value="ten_truyen">Tên A-Z</option>
              </select>
            </div>

            <!-- Advanced Filters Toggle -->
            <div class="advanced-toggle">
              <button @click="showAdvanced = !showAdvanced" class="toggle-btn">
                <i :class="showAdvanced ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                Bộ lọc nâng cao
              </button>
            </div>

            <!-- Advanced Filters (Collapsible) -->
            <div v-show="showAdvanced" class="advanced-filters">
              <!-- View Count Filter -->
              <div class="filter-section">
                <div class="filter-header">
                  <i class="fas fa-eye"></i>
                  <h3>Lượt xem</h3>
                </div>
                <div class="range-list">
                  <label class="range-item">
                    <input
                      type="radio"
                      value=""
                      v-model="filters.viewRange"
                      @change="applyFilters"
                    />
                    <span>Tất cả</span>
                  </label>
                  <label class="range-item">
                    <input
                      type="radio"
                      value="0-10000"
                      v-model="filters.viewRange"
                      @change="applyFilters"
                    />
                    <span>< 10K</span>
                  </label>
                  <label class="range-item">
                    <input
                      type="radio"
                      value="10000-100000"
                      v-model="filters.viewRange"
                      @change="applyFilters"
                    />
                    <span>10K - 100K</span>
                  </label>
                  <label class="range-item">
                    <input
                      type="radio"
                      value="100000-1000000"
                      v-model="filters.viewRange"
                      @change="applyFilters"
                    />
                    <span>100K - 1M</span>
                  </label>
                  <label class="range-item">
                    <input
                      type="radio"
                      value="1000000-"
                      v-model="filters.viewRange"
                      @change="applyFilters"
                    />
                    <span>> 1M</span>
                  </label>
                </div>
              </div>

              <!-- Chapter Count Filter -->
              <div class="filter-section">
                <div class="filter-header">
                  <i class="fas fa-book"></i>
                  <h3>Số chương</h3>
                </div>
                <div class="range-list">
                  <label class="range-item">
                    <input
                      type="radio"
                      value=""
                      v-model="filters.chapterRange"
                      @change="applyFilters"
                    />
                    <span>Tất cả</span>
                  </label>
                  <label class="range-item">
                    <input
                      type="radio"
                      value="0-100"
                      v-model="filters.chapterRange"
                      @change="applyFilters"
                    />
                    <span>< 100 chương</span>
                  </label>
                  <label class="range-item">
                    <input
                      type="radio"
                      value="100-500"
                      v-model="filters.chapterRange"
                      @change="applyFilters"
                    />
                    <span>100 - 500 chương</span>
                  </label>
                  <label class="range-item">
                    <input
                      type="radio"
                      value="500-"
                      v-model="filters.chapterRange"
                      @change="applyFilters"
                    />
                    <span>> 500 chương</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Clear Filters Button -->
            <button @click="clearAllFilters" class="clear-all-btn">
              <i class="fas fa-times-circle"></i>
              Xóa tất cả bộ lọc
            </button>
          </aside>

          <!-- Results Section -->
          <section class="results-section">
            <div class="results-header">
              <div class="results-count">
                <i class="fas fa-list"></i>
                <span v-if="!loading">
                  Tìm thấy <strong>{{ totalResults }}</strong> kết quả
                </span>
                <span v-else>Đang tìm kiếm...</span>
              </div>
            </div>

            <div v-if="loading" class="loading-state">
              <div class="skeleton-grid">
                <div v-for="n in 12" :key="n" class="skeleton-card">
                  <div class="skeleton-cover"></div>
                  <div class="skeleton-content">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line short"></div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="error" class="error-state">
              <i class="fas fa-exclamation-triangle"></i>
              <p>{{ error }}</p>
            </div>

            <div v-else-if="stories.length === 0" class="empty-state">
              <i class="fas fa-search"></i>
              <h3>Không tìm thấy kết quả</h3>
              <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>

            <div v-else class="stories-grid">
              <NewStoryCard
                v-for="story in stories"
                :key="story.id"
                :story="story"
              />
            </div>

            <div v-if="totalPages > 1" class="pagination">
              <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="pagination-btn"
              >
                <i class="fas fa-chevron-left"></i>
                Trước
              </button>

              <div class="page-numbers">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="['page-btn', { active: page === currentPage }]"
                >
                  {{ page }}
                </button>
              </div>

              <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="pagination-btn"
              >
                Sau
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
const showAdvanced = ref(false);

// Filters
const filters = ref({
  keyword: '',
  selectedGenres: [] as number[],
  status: '',
  sortBy: 'thoi_gian_cap_nhat',
  viewRange: '',
  chapterRange: '',
});

// Computed
const keyword = computed(() => filters.value.keyword);

const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - 2);
  let end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// Methods
const fetchGenres = async () => {
  loadingGenres.value = true;
  try {
    const response = await axios.get('/api/theloai');
    // Backend returns { data: [...] } so we need response.data.data
    genres.value = response.data.data || [];

  } catch (err) {
    console.error('Failed to load genres:', err);
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

  if (filters.value.keyword && filters.value.keyword.trim() !== '') {
    params.keyword = filters.value.keyword.trim();
  }

  // Status filter - map frontend values to database values
  if (filters.value.status && filters.value.status !== '') {
    // Map frontend status values to database values
    const statusMap: Record<string, string> = {
      'dang_ra': 'dang_ra',
      'hoan_thanh': 'hoan_thanh', 
      'de_xuat': 'de_xuat',
    };
    params.trang_thai = statusMap[filters.value.status] || filters.value.status;
  }

  // View range
  if (filters.value.viewRange && filters.value.viewRange !== '') {
    const [min, max] = filters.value.viewRange.split('-');
    if (min && min !== '') params.min_views = parseInt(min);
    if (max && max !== '') params.max_views = parseInt(max);
  }

  // Chapter range
  if (filters.value.chapterRange && filters.value.chapterRange !== '') {
    const [min, max] = filters.value.chapterRange.split('-');
    if (min && min !== '') params.min_chapters = parseInt(min);
    if (max && max !== '') params.max_chapters = parseInt(max);
  }

  // Genres - Multi-selection
  if (filters.value.selectedGenres.length > 0) {
    params.category_ids = filters.value.selectedGenres.join(',');
  }


  return params;
};

const fetchStories = async () => {
  loading.value = true;
  error.value = null;

  try {
    const params = buildQueryParams();
    const response = await axios.get('/api/truyen/public', { params });
    // console.log('API response:', response.data);

    stories.value = response.data.data || [];
    totalResults.value = response.data.pagination?.total || 0;
    totalPages.value = response.data.pagination?.total_pages || 1;
    currentPage.value = response.data.pagination?.current_page || 1;



    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err: any) {
    console.error('Search error:', err);
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
  filters.value = {
    keyword: '',
    selectedGenres: [],
    status: '',
    sortBy: 'thoi_gian_cap_nhat',
    viewRange: '',
    chapterRange: '',
  };
  currentPage.value = 1;
  updateURL();
};

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  updateURL();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const updateURL = () => {
  const query: any = {};

  if (filters.value.keyword) query.keyword = filters.value.keyword;
  if (filters.value.status) query.status = filters.value.status;
  if (filters.value.sortBy !== 'thoi_gian_cap_nhat') query.sort = filters.value.sortBy;
  if (filters.value.viewRange) query.views = filters.value.viewRange;
  if (filters.value.chapterRange) query.chapters = filters.value.chapterRange;
  if (filters.value.selectedGenres.length > 0) {
    query.genres = filters.value.selectedGenres.join(',');
  }
  if (currentPage.value > 1) query.page = currentPage.value;

  router.replace({ query });
};

const loadFromURL = () => {
  const query = route.query;

  filters.value.keyword = (query.keyword as string) || '';
  filters.value.status = (query.status as string) || '';
  filters.value.sortBy = (query.sort as string) || 'thoi_gian_cap_nhat';
  filters.value.viewRange = (query.views as string) || '';
  filters.value.chapterRange = (query.chapters as string) || '';

  if (query.genres) {
    filters.value.selectedGenres = (query.genres as string)
      .split(',')
      .map(id => parseInt(id))
      .filter(id => !isNaN(id));
  }

  currentPage.value = parseInt(query.page as string) || 1;
};

// Lifecycle
onMounted(() => {
  fetchGenres();
  loadFromURL();
  fetchStories();
});

// Watch route changes
watch(() => route.query, () => {
  if (route.name === 'SearchView') {
    // Only fetch if params actually changed to avoid loop if duplicate
    loadFromURL();
    fetchStories();
  }
});
</script>

<style scoped>
/* Container */
.search-view-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #1a1d29;
  color: #ffffff;
  font-family: "Be Vietnam Pro", sans-serif;
}

.main-content {
  flex-grow: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 40px 20px;
}

.container {
  width: 100%;
}

/* Page Header */
.page-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.page-title i {
  color: #4caf50;
}

.search-keyword {
  font-size: 1.1rem;
  color: #999;
}

.search-keyword span {
  color: #4caf50;
  font-weight: 600;
}

/* Layout */
.content-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
}

/* Filters Sidebar */
.filters-sidebar {
  background: #2a2d3a;
  border-radius: 12px;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.filter-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-section:last-child {
  border-bottom: none;
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.filter-header i {
  color: #4caf50;
  font-size: 1.1rem;
}

.filter-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

/* Search Input */
.search-input-wrapper {
  display: flex;
  gap: 8px;
}

.search-input {
  flex-grow: 1;
  background: #1a1d29;
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  padding: 10px 12px;
  color: #ffffff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.search-btn {
  background: #4caf50;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  background: #66bb6a;
  transform: scale(1.05);
}

/* Genre List - Grid Layout Override */
.filter-loading {
  text-align: center;
  color: #999;
  padding: 20px;
}

.genre-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 Columns */
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 5px; /* Space for scrollbar */
}

/* Custom Scrollbar */
.genre-list::-webkit-scrollbar {
    width: 6px;
}
.genre-list::-webkit-scrollbar-track {
    background: #1a1d29; 
    border-radius: 4px;
}
.genre-list::-webkit-scrollbar-thumb {
    background: #4caf50; 
    border-radius: 4px;
}
.genre-list::-webkit-scrollbar-thumb:hover {
    background: #66bb6a; 
}

.genre-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  background: rgba(255, 255, 255, 0.03);
}

.genre-item:hover {
  background: rgba(76, 175, 80, 0.2);
}

.genre-item input[type="checkbox"] {
  cursor: pointer;
  width: 14px;
  height: 14px;
  accent-color: #4caf50;
}

.genre-name {
  font-size: 0.85rem;
  color: #cccccc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Status & Other Lists */
.status-list, .range-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-item,
.range-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.status-item:hover,
.range-item:hover {
  background: rgba(76, 175, 80, 0.1);
}

.status-item input[type="radio"],
.range-item input[type="radio"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: #4caf50;
}

.status-item span,
.range-item span {
  font-size: 0.9rem;
  color: #cccccc;
}

/* Sort Select */
.sort-select {
  width: 100%;
  background: #1a1d29;
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  padding: 10px 12px;
  color: #ffffff;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}

.sort-select:focus {
  border-color: #4caf50;
}

.sort-select option {
  background: #1a1d29;
  color: #ffffff;
}

/* Advanced Toggle */
.advanced-toggle {
  margin: 20px 0;
}

.toggle-btn {
  width: 100%;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  padding: 12px;
  color: #4caf50;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: rgba(76, 175, 80, 0.2);
  transform: translateY(-2px);
}

.advanced-filters {
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Clear All Button */
.clear-all-btn {
  width: 100%;
  background: #d32f2f;
  border: none;
  border-radius: 8px;
  padding: 12px;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.clear-all-btn:hover {
  background: #b71c1c;
  transform: translateY(-2px);
}

/* Results Section */
.results-section {
  flex-grow: 1;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.results-count {
  font-size: 1.1rem;
  color: #cccccc;
  display: flex;
  align-items: center;
  gap: 10px;
}

.results-count i {
  color: #4caf50;
}

.results-count strong {
  color: #ffffff;
  font-size: 1.2rem;
}

/* Grid & States */
.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 25px;
}

.empty-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
  background: #2a2d3a;
  border-radius: 12px;
}

.empty-state i,
.error-state i {
  font-size: 4rem;
  color: #4caf50;
  margin-bottom: 20px;
}

.error-state i {
  color: #d32f2f;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #ffffff;
  margin-bottom: 10px;
}

.empty-state p,
.error-state p {
  color: #999;
}

/* Skeleton Loading */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 25px;
}

.skeleton-card {
  background: #2a2d3a;
  border-radius: 12px;
  overflow: hidden;
}

.skeleton-cover {
  width: 100%;
  padding-top: 140%;
  background: #374151;
  animation: pulse 1.5s infinite;
}

.skeleton-content {
  padding: 12px;
}

.skeleton-line {
  height: 16px;
  background: #374151;
  border-radius: 4px;
  margin-bottom: 8px;
  animation: pulse 1.5s infinite;
}

.skeleton-line.short {
  width: 60%;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 0.8; }
  100% { opacity: 0.6; }
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 40px;
}

.pagination-btn {
  background: #2a2d3a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #4caf50;
  border-color: #4caf50;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.page-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cccccc;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover {
  border-color: #4caf50;
  color: #4caf50;
}

.page-btn.active {
  background: #4caf50;
  border-color: #4caf50;
  color: #ffffff;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-layout {
    grid-template-columns: 250px 1fr;
  }
}

@media (max-width: 768px) {
  .content-layout {
    grid-template-columns: 1fr;
  }

  .filters-sidebar {
    position: relative;
    top: 0;
    max-height: none;
    margin-bottom: 30px;
  }
}


.clear-all-btn:hover {
  background: #f44336;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
}

/* Results Section */
.results-section {
  min-height: 500px;
}

.results-header {
  margin-bottom: 25px;
  padding: 15px 20px;
  background: #2a2d3a;
  border-radius: 8px;
}

.results-count {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  color: #cccccc;
}

.results-count i {
  color: #4caf50;
}

.results-count strong {
  color: #4caf50;
  font-weight: 700;
}

/* Loading State */
.loading-state {
  padding: 20px 0;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.skeleton-card {
  background: #2a2d3a;
  border-radius: 12px;
  overflow: hidden;
  animation: pulse 1.5s infinite;
}

.skeleton-cover {
  width: 100%;
  padding-top: 140%;
  background: linear-gradient(90deg, #2a2d3a 25%, #3e4256 50%, #2a2d3a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  padding: 12px;
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, #2a2d3a 25%, #3e4256 50%, #2a2d3a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 10px;
}

.skeleton-line.short {
  width: 60%;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Error State */
.error-state {
  text-align: center;
  padding: 60px 20px;
  background: #2a2d3a;
  border-radius: 12px;
  color: #f44336;
}

.error-state i {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.7;
}

.error-state p {
  font-size: 1.1rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: #2a2d3a;
  border-radius: 12px;
}

.empty-state i {
  font-size: 5rem;
  color: #4caf50;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 10px;
}

.empty-state p {
  font-size: 1rem;
  color: #999;
}

/* Stories Grid */
.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 40px;
  padding: 20px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #2a2d3a;
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  padding: 10px 20px;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(76, 175, 80, 0.2);
  border-color: #4caf50;
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-btn {
  width: 40px;
  height: 40px;
  background: #2a2d3a;
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover {
  background: rgba(76, 175, 80, 0.2);
  border-color: #4caf50;
}

.page-btn.active {
  background: #4caf50;
  border-color: #4caf50;
  color: #ffffff;
}

/* Custom Scrollbar */
.genre-list::-webkit-scrollbar {
  width: 6px;
}

.genre-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.genre-list::-webkit-scrollbar-thumb {
  background: rgba(76, 175, 80, 0.3);
  border-radius: 10px;
}

.genre-list::-webkit-scrollbar-thumb:hover {
  background: rgba(76, 175, 80, 0.5);
}

/* Responsive */
@media (max-width: 1024px) {
  .content-layout {
    grid-template-columns: 250px 1fr;
    gap: 20px;
  }

  .filters-sidebar {
    padding: 15px;
  }
}

@media (max-width: 768px) {
  .content-layout {
    grid-template-columns: 1fr;
  }

  .filters-sidebar {
    position: static;
    margin-bottom: 20px;
  }

  .stories-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }

  .page-title {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 20px 10px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .stories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .pagination-btn {
    padding: 8px 12px;
    font-size: 0.8rem;
  }

  .page-btn {
    width: 35px;
    height: 35px;
    font-size: 0.85rem;
  }
}
</style>
