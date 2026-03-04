<template>
  <div class="category-view-container">
    
    <main class="main-content">
      <div class="container">
        
        <!-- THIÊN THƯ HEADER -->
        <div class="page-header animate-fadeIn">
          <h1 class="page-title-xianxia">
            <i class="fas fa-bookmark text-emerald-400"></i>
            Linh Anh Phân Loại
          </h1>
          <p class="page-subtitle">Khám phá bí tịch theo căn cơ và duyên phận</p>
          <div class="header-divider"></div>
        </div>

        <!-- CATEGORY SELECTION (CĂN CƠ CHIPS) -->
        <div class="category-selection-area">
          <div v-if="loadingCategories" class="categories-loading-aura">
            <i class="fas fa-yin-yang fa-spin"></i>
            <span>Đang cảm ứng thể loại...</span>
          </div>

          <div v-else class="xianxia-chips-container">
            <button
              @click="clearSelection"
              :class="['xianxia-chip', { active: selectedCategories.length === 0 }]"
            >
              <i class="fas fa-infinity"></i>
              Toàn Thể
            </button>

            <button
              v-for="category in categories"
              :key="category.id_theloai"
              @click="toggleCategory(category.id_theloai)"
              :class="['xianxia-chip', { active: selectedCategories.includes(category.id_theloai) }]"
            >
              <i v-if="selectedCategories.includes(category.id_theloai)" class="fas fa-check-circle animate-pulse"></i>
              {{ category.ten_theloai }}
            </button>
          </div>
        </div>

        <!-- SELECTED INFO BANNER (LINH KHÍ BANNER) -->
        <div v-if="selectedCategoryInfo" class="category-info-aura animate-slideUp">
          <div class="aura-content">
            <div class="title-row">
               <h2>{{ selectedCategoryInfo.ten_theloai }}</h2>
               <span v-if="selectedCategories.length > 1" class="aura-badge">
                {{ selectedCategories.length }} Phẩm Cấp
               </span>
            </div>
            <p v-if="selectedCategoryInfo.mo_ta">{{ selectedCategoryInfo.mo_ta }}</p>
            
            <div v-if="selectedCategories.length > 0" class="tag-cloud">
              <span 
                v-for="catId in selectedCategories" 
                :key="catId"
                class="xianxia-tag"
              >
                {{ categories.find(c => c.id_theloai === catId)?.ten_theloai }}
                <button @click.stop="toggleCategory(catId)" class="tag-remove">
                  <i class="fas fa-times"></i>
                </button>
              </span>
            </div>
          </div>
        </div>

        <!-- RESULTS SECTION -->
        <section class="results-section-xianxia">
          <!-- Filter Header -->
          <div class="filter-header-bar">
            <div class="results-info">
              <i class="fas fa-scroll text-emerald-500"></i>
              <span v-if="!loading">Tìm thấy <strong class="text-emerald-400">{{ totalResults }}</strong> bộ linh thư</span>
              <span v-else>Đang truy vấn...</span>
            </div>

            <div class="sort-box-xianxia">
              <label>Thứ tự:</label>
              <select v-model="sortBy" @change="fetchStories" class="xianxia-select">
                <option value="thoi_gian_cap_nhat">Mới Cập Nhật</option>
                <option value="luot_xem">Xem Nhiều Nhất</option>
                <option value="luot_thich">Được Yêu Thích</option>
                <option value="ten_truyen">Tên A-Z</option>
              </select>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="loading-grid-aura">
            <div class="skeleton-grid">
              <div v-for="n in 12" :key="n" class="skeleton-card-pill">
                <div class="skeleton-image"></div>
                <div class="skeleton-text-block">
                  <div class="line"></div>
                  <div class="line short"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="state-message error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Thiên cơ nhiễu loạn: {{ error }}</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="stories.length === 0" class="state-message empty">
            <i class="fas fa-ghost"></i>
            <h3>Vô Thư Bảng</h3>
            <p>Thể loại này chưa có linh vật nào trú ngụ.</p>
          </div>

          <!-- Stories Grid (Linh Thư Lưới) -->
          <div v-else class="stories-grid-xianxia">
            <NewStoryCard
              v-for="story in stories"
              :key="story.id"
              :story="story"
            />
          </div>

          <!-- PAGINATION (PHÂN TRANG LINH TRẬN) -->
          <div v-if="totalPages > 1" class="xianxia-pagination">
            <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="nav-btn">
              <i class="fas fa-chevron-left"></i>
            </button>

            <div class="num-group">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="['num-btn', { active: page === currentPage }]"
              >
                {{ page }}
              </button>
            </div>

            <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="nav-btn">
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
const selectedCategories = ref<number[]>([]);
const sortBy = ref('thoi_gian_cap_nhat');
const currentPage = ref(1);
const totalResults = ref(0);
const totalPages = ref(1);

// Computed Info
const selectedCategoryInfo = computed(() => {
  if (selectedCategories.value.length === 0) return null;
  if (selectedCategories.value.length === 1) {
    return categories.value.find(cat => cat.id_theloai === selectedCategories.value[0]);
  }
  return {
    ten_theloai: `${selectedCategories.value.length} Linh Phẩm`,
    mo_ta: `Đang cảm ứng linh khí từ ${selectedCategories.value.length} thể loại đã chọn`
  };
});

const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - 2);
  let end = Math.min(totalPages.value, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

// Logic Fetch
const fetchCategories = async () => {
  loadingCategories.value = true;
  try {
    const response = await axios.get('/api/theloai');
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
    if (selectedCategories.value.length > 0) {
      params.category_ids = selectedCategories.value.join(',');
    }
    const response = await axios.get('/api/truyen/public', { params });
    stories.value = response.data.data || [];
    totalResults.value = response.data.pagination?.total || 0;
    totalPages.value = response.data.pagination?.total_pages || 1;
    currentPage.value = response.data.pagination?.current_page || 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Có lỗi xảy ra khi tải truyện';
    stories.value = [];
  } finally {
    loading.value = false;
  }
};

const toggleCategory = (categoryId: number) => {
  const index = selectedCategories.value.indexOf(categoryId);
  if (index > -1) selectedCategories.value.splice(index, 1);
  else selectedCategories.value.push(categoryId);
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
  if (selectedCategories.value.length > 0) query.categories = selectedCategories.value.join(',');
  if (sortBy.value !== 'thoi_gian_cap_nhat') query.sort = sortBy.value;
  if (currentPage.value > 1) query.page = currentPage.value;
  router.replace({ query });
};

const loadFromURL = () => {
  const query = route.query;
  if (query.categories) {
    selectedCategories.value = (query.categories as string).split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
  }
  if (query.sort) sortBy.value = query.sort as string;
  if (query.page) currentPage.value = parseInt(query.page as string);
};

onMounted(() => {
  fetchCategories();
  loadFromURL();
  fetchStories();
});

watch(() => route.query, () => {
  if (route.name === 'CategoryView') {
    loadFromURL();
    fetchStories();
  }
});
</script>

<style scoped>
/* ===== CONTAINER & BG ===== */
.category-view-container {
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

/* ===== HEADER XIANXIA ===== */
.page-header {
  text-align: center;
  margin-bottom: 40px;
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
  gap: 15px;
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

.header-divider {
  height: 1px;
  width: 300px;
  background: linear-gradient(90deg, transparent, #34d399, transparent);
  margin: 25px auto;
}

/* ===== CATEGORY CHIPS (PILLS) ===== */
.category-selection-area {
  margin-bottom: 40px;
}

.categories-loading-aura {
  text-align: center;
  padding: 30px;
  color: #34d399;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.xianxia-chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  padding: 25px;
  background: #131b2c;
  border-radius: 24px;
  border: 1px solid #1e293b;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.xianxia-chip {
  padding: 10px 22px;
  background: #0b0f19;
  border: 1px solid #334155;
  border-radius: 50px; /* Pill Shape */
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  gap: 8px;
}

.xianxia-chip:hover {
  border-color: #34d39960;
  color: #34d399;
  transform: translateY(-2px);
  background: #34d39905;
}

.xianxia-chip.active {
  background: #34d39915;
  border-color: #34d399;
  color: #34d399;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.2);
}

/* ===== INFO BANNER ===== */
.category-info-aura {
  margin-bottom: 35px;
  padding: 25px;
  background: linear-gradient(135deg, #131b2c, #0b0f19);
  border-left: 4px solid #34d399;
  border-radius: 16px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.3);
}

.title-row {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 8px;
}

.title-row h2 {
  font-size: 1.8rem;
  font-weight: 900;
  color: #f8fafc;
}

.aura-badge {
  font-size: 0.7rem;
  font-weight: 900;
  padding: 3px 10px;
  background: #34d39920;
  color: #34d399;
  border: 1px solid #34d39940;
  border-radius: 50px;
  text-transform: uppercase;
}

.aura-content p {
  color: #94a3b8;
  font-size: 0.9rem;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
}

.xianxia-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #34d39910;
  border: 1px solid #34d39930;
  border-radius: 8px;
  padding: 5px 12px;
  font-size: 0.8rem;
  color: #34d399;
  font-weight: 700;
}

.tag-remove {
  background: transparent;
  border: none;
  color: #34d399;
  cursor: pointer;
  opacity: 0.6;
}

.tag-remove:hover { opacity: 1; }

/* ===== RESULTS AREA ===== */
.filter-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
  padding: 15px 25px;
  background: #131b2c;
  border-radius: 16px;
  border: 1px solid #1e293b;
}

.results-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
}

.sort-box-xianxia {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
}

.xianxia-select {
  background: #0b0f19;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 8px 15px;
  color: #fff;
  font-size: 0.8rem;
  cursor: pointer;
}

/* Stories Grid */
.stories-grid-xianxia {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 25px;
}

/* States */
.state-message {
  text-align: center;
  padding: 100px 20px;
  background: #131b2c;
  border-radius: 24px;
}

.state-message i { font-size: 4rem; margin-bottom: 20px; opacity: 0.2; }
.state-message.error i { color: #ef4444; opacity: 0.5; }

/* ===== PAGINATION ===== */
.xianxia-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 50px;
}

.nav-btn {
  width: 45px;
  height: 45px;
  background: #131b2c;
  border: 1px solid #1e293b;
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-btn:disabled { opacity: 0.2; cursor: not-allowed; }
.nav-btn:hover:not(:disabled) { border-color: #34d399; color: #34d399; }

.num-group {
  display: flex;
  gap: 8px;
}

.num-btn {
  width: 45px;
  height: 45px;
  background: transparent;
  border: 1px solid #1e293b;
  border-radius: 12px;
  color: #64748b;
  font-weight: 700;
  cursor: pointer;
}

.num-btn.active {
  background: #34d399;
  color: #0b0f19;
  border-color: #34d399;
  box-shadow: 0 5px 15px rgba(52, 211, 153, 0.3);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn { animation: fadeIn 0.8s ease-out; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slideUp { animation: slideUp 0.5s ease-out; }

/* Responsive */
@media (max-width: 768px) {
  .page-title-xianxia { font-size: 2rem; }
  .xianxia-chips-container { padding: 15px; }
  .xianxia-chip { padding: 8px 16px; font-size: 0.75rem; }
  .filter-header-bar { flex-direction: column; gap: 15px; align-items: flex-start; }
  .stories-grid-xianxia { grid-template-columns: repeat(2, 1fr); gap: 15px; }
}
</style>