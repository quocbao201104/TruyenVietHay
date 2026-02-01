<template>
  <div class="category-view-container">
    
    <main class="main-content">
      <div class="container">
        <!-- Page Header -->
        <div class="page-header">
          <h1 class="page-title">
            <i class="fas fa-bookmark"></i>
            Thể Loại Truyện
          </h1>
          <p class="page-subtitle">Khám phá truyện theo thể loại yêu thích</p>
        </div>

        <!-- Category Selection -->
        <div class="category-selection">
          <div v-if="loadingCategories" class="categories-loading">
            <i class="fas fa-spinner fa-spin"></i>
            Đang tải thể loại...
          </div>

          <div v-else class="category-chips">
            <button
              @click="clearSelection"
              :class="['category-chip', { active: selectedCategories.length === 0 }]"
            >
              <i class="fas fa-list"></i>
              Tất cả
            </button>

            <button
              v-for="category in categories"
              :key="category.id_theloai"
              @click="toggleCategory(category.id_theloai)"
              :class="['category-chip', { active: selectedCategories.includes(category.id_theloai) }]"
            >
              <i v-if="selectedCategories.includes(category.id_theloai)" class="fas fa-check-circle" style="margin-right: 5px;"></i>
              {{ category.ten_theloai }}
            </button>
          </div>
        </div>

        <!-- Selected Category Info -->
        <div v-if="selectedCategoryInfo" class="category-info-banner">
          <div class="category-info-content">
            <h2>
              {{ selectedCategoryInfo.ten_theloai }}
              <span v-if="selectedCategories.length > 1" class="badge-count">
                ({{ selectedCategories.length }})
              </span>
            </h2>
            <p v-if="selectedCategoryInfo.mo_ta">{{ selectedCategoryInfo.mo_ta }}</p>
            <div v-if="selectedCategories.length > 0" class="selected-categories-list">
              <span 
                v-for="catId in selectedCategories" 
                :key="catId"
                class="selected-category-tag"
              >
                {{ categories.find(c => c.id_theloai === catId)?.ten_theloai }}
                <button 
                  @click.stop="toggleCategory(catId)" 
                  class="remove-category-btn"
                  title="Bỏ chọn"
                >
                  <i class="fas fa-times"></i>
                </button>
              </span>
            </div>
          </div>
        </div>

        <!-- Results Section -->
        <section class="results-section">
          <!-- Results Header -->
          <div class="results-header">
            <div class="results-count">
              <i class="fas fa-book"></i>
              <span v-if="!loading">
                <strong>{{ totalResults }}</strong> truyện
              </span>
              <span v-else>Đang tải...</span>
            </div>

            <!-- Sort Options -->
            <div class="sort-wrapper">
              <label>Sắp xếp:</label>
              <select v-model="sortBy" @change="fetchStories" class="sort-select">
                <option value="thoi_gian_cap_nhat">Mới cập nhật</option>
                <option value="luot_xem">Xem nhiều nhất</option>
                <option value="luot_thich">Được yêu thích</option>
                <option value="ten_truyen">Tên A-Z</option>
              </select>
            </div>
          </div>

          <!-- Loading State -->
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

          <!-- Error State -->
          <div v-else-if="error" class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <p>{{ error }}</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="stories.length === 0" class="empty-state">
            <i class="fas fa-book-open"></i>
            <h3>Chưa có truyện</h3>
            <p>Thể loại này chưa có truyện nào</p>
          </div>

          <!-- Stories Grid -->
          <div v-else class="stories-grid">
            <NewStoryCard
              v-for="story in stories"
              :key="story.id"
              :story="story"
            />
          </div>

          <!-- Pagination -->
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
const loadingCategories = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);
const categories = ref<any[]>([]);
const stories = ref<any[]>([]);
const selectedCategories = ref<number[]>([]); // Changed to array for multiple selection
const sortBy = ref('thoi_gian_cap_nhat');
const currentPage = ref(1);
const totalResults = ref(0);
const totalPages = ref(1);

// Computed
const selectedCategoryInfo = computed(() => {
  if (selectedCategories.value.length === 0) return null;
  if (selectedCategories.value.length === 1) {
    return categories.value.find(cat => cat.id_theloai === selectedCategories.value[0]);
  }
  return {
    ten_theloai: `${selectedCategories.value.length} thể loại đã chọn`,
    mo_ta: `Đang lọc theo ${selectedCategories.value.length} thể loại`
  };
});

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
const fetchCategories = async () => {
  loadingCategories.value = true;
  try {
    const response = await axios.get('/api/theloai');
    // Backend returns { data: [...] } so we need response.data.data
    categories.value = response.data.data || [];
  } catch (err) {
    console.error('Failed to load categories:', err);
  } finally {
    loadingCategories.value = false;
  }
};

const fetchStories = async () => {
  loading.value = true;
  error.value = null;

  try {
    const params: any = {
      page: currentPage.value,
      limit: 18,
      sort_by: sortBy.value,
      order: 'DESC',
    };

    // Send category_ids as comma-separated string if any categories are selected
    if (selectedCategories.value.length > 0) {
      params.category_ids = selectedCategories.value.join(',');
    }


    const response = await axios.get('/api/truyen/public', { params });

    stories.value = response.data.data || [];
    totalResults.value = response.data.pagination?.total || 0;
    totalPages.value = response.data.pagination?.total_pages || 1;
    currentPage.value = response.data.pagination?.current_page || 1;



    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err: any) {
    console.error('Failed to load stories:', err);
    error.value = err.response?.data?.message || 'Có lỗi xảy ra khi tải truyện';
    stories.value = [];
  } finally {
    loading.value = false;
  }
};

const toggleCategory = (categoryId: number) => {
  const index = selectedCategories.value.indexOf(categoryId);
  if (index > -1) {
    // Remove category if already selected
    selectedCategories.value.splice(index, 1);
  } else {
    // Add category if not selected
    selectedCategories.value.push(categoryId);
  }
  currentPage.value = 1;
  updateURL();
  fetchStories();
};

const clearSelection = () => {
  selectedCategories.value = [];
  currentPage.value = 1;
  updateURL();
  fetchStories();
};

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  updateURL();
  fetchStories();
};

const updateURL = () => {
  const query: any = {};

  // Store selected categories as comma-separated string in URL
  if (selectedCategories.value.length > 0) {
    query.categories = selectedCategories.value.join(',');
  }

  if (sortBy.value !== 'thoi_gian_cap_nhat') {
    query.sort = sortBy.value;
  }

  if (currentPage.value > 1) {
    query.page = currentPage.value;
  }

  router.replace({ query });
};

const loadFromURL = () => {
  const query = route.query;

  // Load multiple categories from URL (comma-separated)
  if (query.categories) {
    const categoryIds = (query.categories as string).split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    selectedCategories.value = categoryIds;
  }

  // Support legacy single category parameter for backward compatibility
  if (query.category && selectedCategories.value.length === 0) {
    selectedCategories.value = [parseInt(query.category as string)];
  }

  if (query.sort) {
    sortBy.value = query.sort as string;
  }

  if (query.page) {
    currentPage.value = parseInt(query.page as string);
  }
};

// Lifecycle
onMounted(() => {
  fetchCategories();
  loadFromURL();
  fetchStories();
});

// Watch route changes
watch(() => route.query, () => {
  if (route.name === 'CategoryView') {
    loadFromURL();
    fetchStories();
  }
});
</script>

<style scoped>
/* Container */
.category-view-container {
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
  margin-bottom: 40px;
  text-align: center;
}

.page-title {
  font-size: 2.8rem;
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

.page-subtitle {
  font-size: 1.1rem;
  color: #999;
}

/* Category Selection */
.category-selection {
  margin-bottom: 40px;
}

.categories-loading {
  text-align: center;
  padding: 30px;
  color: #4caf50;
  font-size: 1.1rem;
}

.categories-loading i {
  margin-right: 10px;
}

.category-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  padding: 20px;
  background: #2a2d3a;
  border-radius: 12px;
}

.category-chip {
  padding: 10px 20px;
  background: #1a1d29;
  border: 2px solid rgba(76, 175, 80, 0.3);
  border-radius: 20px;
  color: #cccccc;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-chip:hover {
  border-color: #4caf50;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.category-chip.active {
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  border-color: #4caf50;
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.4);
}

.category-chip i {
  font-size: 0.9rem;
}

/* Category Info Banner */
.category-info-banner {
  margin-bottom: 30px;
  padding: 25px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05));
  border-left: 4px solid #4caf50;
  border-radius: 8px;
}

.category-info-content h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #4caf50;
  margin-bottom: 10px;
}

.category-info-content p {
  font-size: 1rem;
  color: #cccccc;
  line-height: 1.6;
}

.badge-count {
  font-size: 0.9rem;
  color: #66bb6a;
  font-weight: 400;
}

.selected-categories-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
}

.selected-category-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid #4caf50;
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 0.85rem;
  color: #4caf50;
}

.remove-category-btn {
  background: transparent;
  border: none;
  color: #4caf50;
  cursor: pointer;
  padding: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.remove-category-btn:hover {
  background: rgba(76, 175, 80, 0.3);
  color: #ffffff;
}

/* Results Section */
.results-section {
  min-height: 500px;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.sort-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-wrapper label {
  font-size: 0.9rem;
  color: #cccccc;
}

.sort-select {
  background: #1a1d29;
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 6px;
  padding: 8px 12px;
  color: #ffffff;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
}

.sort-select:focus {
  border-color: #4caf50;
}

.sort-select option {
  background: #1a1d29;
  color: #ffffff;
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

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .category-chips {
    gap: 8px;
  }

  .category-chip {
    padding: 8px 16px;
    font-size: 0.85rem;
  }

  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .stories-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 20px 10px;
  }

  .page-title {
    font-size: 1.6rem;
  }

  .category-chips {
    padding: 15px;
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