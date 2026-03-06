<template>
  <div class="author-dashboard-page-xianxia">
    <main class="dashboard-container-aura">
      
      <!-- TIÊU ĐỀ LINH ĐÀI -->
      <div class="page-header-spirit animate-fadeIn">
        <h1 class="page-title-glow">Huyền Thiên Điện</h1>
        <p class="page-subtitle">Linh đài quản trị - Nơi khởi nguồn của vạn giới bí tịch</p>
        <div class="header-divider-spirit">
          <div class="dot"></div>
        </div>
      </div>

      <!-- PHẦN 1: LINH ĐÀI THỐNG KÊ (STAT CARDS) -->
      <section class="stats-aura-section">
        <div class="stats-spirit-grid">
          <AuthorDashboardStatCard
            :value="totals.total_views"
            label="Linh Khí Hội Tụ (Lượt xem)"
            icon="fas fa-eye"
            glow-color="#10b981"
          />
          <AuthorDashboardStatCard
            :value="totals.total_comments"
            label="Luận Đạo Số (Bình luận)"
            icon="fas fa-comments"
            glow-color="#3b82f6"
          />
        </div>
      </section>

      <!-- PHẦN 2: ĐẠO LỘ TĂNG TRƯỞNG (CHART) -->
      <section class="chart-aura-section animate-fadeIn">
        <div class="section-title-aura">
          <i class="fas fa-chart-line text-emerald-400"></i>
          <h2>Biến Động Linh Khí (7 ngày)</h2>
        </div>
        <div class="spirit-chart-wrapper">
          <AuthorDashboardChart
            :key="chartKey"
            :labels="chartData.labels"
            :series="chartData.series"
            :loading="dashboardLoading"
          />
        </div>
      </section>

        <!-- PHẦN 3: VÙNG TÁC NGHIỆP (TABS & CONTENT) -->
        <section class="table-aura-section">
          <div class="section-header-row">
            <div class="tab-spirit-navigation">
              <button 
                :class="['tab-aura-btn', { 'active': currentTab === 'stories' }]"
                @click="currentTab = 'stories'"
              >
                <i class="fas fa-book-journal-whills mr-2"></i> Linh Thư
              </button>
              <button 
                :class="['tab-aura-btn', { 'active': currentTab === 'inbox' }]"
                @click="currentTab = 'inbox'"
              >
                <i class="fas fa-envelope mr-2"></i> Hộp Thư
                <span v-if="notificationStore.unreadCount > 0" class="tab-badge-spirit">
                  {{ notificationStore.unreadCount }}
                </span>
              </button>
            </div>
            
            <router-link v-if="currentTab === 'stories'" :to="{ name: 'SubmitStory' }" class="btn-create-spirit">
              <i class="fas fa-wand-sparkles mr-2"></i> Khai Phá Linh Thư
            </router-link>
          </div>

          <div v-if="currentTab === 'stories'" class="stories-management-container animate-fadeIn">
            <!-- Bộ lọc linh khí -->
            <div class="filters-spirit-box">
              <AuthorStoryFiltersSection
                :categories="categories"
                @apply-filters="handleApplyFilters"
                @clear-filters="handleClearFilters"
              />
            </div>

            <!-- Bảng lệnh bài truyện -->
            <div class="spirit-table-container">
              <AuthorStoryTableSection
                :stories="storyStore.authorStories"
                :loading="storyStore.authorStoriesLoading"
                :sortColumn="currentSortColumn"
                :sortDirection="currentSortDirection"
                @view-details="handleViewDetails"
                @edit="handleEditStory"
                @manage-chapters="handleManageChapters"
                @delete="handleDeleteStory"
                @requestSort="handleSortRequest"
              />
            </div>

            <!-- PHÂN TẦNG LINH TRẬN (PAGINATION) -->
            <div
              v-if="storyStore.authorStoriesPagination.total_pages > 1"
              class="xianxia-pagination"
            >
              <button
                class="page-nav-btn"
                :disabled="storyStore.authorStoriesPagination.current_page === 1"
                @click="handlePageChange(storyStore.authorStoriesPagination.current_page - 1)"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              
              <div class="page-counter">
                Tầng <span class="current">{{ storyStore.authorStoriesPagination.current_page }}</span> / {{ storyStore.authorStoriesPagination.total_pages }}
              </div>

              <button
                class="page-nav-btn"
                :disabled="storyStore.authorStoriesPagination.current_page === storyStore.authorStoriesPagination.total_pages"
                @click="handlePageChange(storyStore.authorStoriesPagination.current_page + 1)"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <!-- PHẦN HỘP THƯ (INBOX) -->
          <div v-else class="inbox-management-container animate-fadeIn">
            <NotificationInbox />
          </div>
        </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { getAuthorDashboard } from "@/modules/author/author.api";
import { useStoryStore } from "@/modules/storyText/story.store";
import { useCategoryStore } from "@/modules/category/category.store";
import AuthorDashboardStatCard from "@/components/author/AuthorDashboardStatCard.vue";
import AuthorDashboardChart from "@/components/author/AuthorDashboardChart.vue";
import AuthorStoryFiltersSection from "@/components/author/AuthorStoryFiltersSection.vue";
import AuthorStoryTableSection from "@/components/author/AuthorStoryTableSection.vue";
import NotificationInbox from "@/components/author/NotificationInbox.vue";
import { useNotificationStore } from "@/modules/notification/notification.store";
import { useAppToast } from "@/composables/useAppToast";

const router = useRouter();
const storyStore = useStoryStore();
const categoryStore = useCategoryStore();
const notificationStore = useNotificationStore();
const { showSuccessToast, showErrorToast } = useAppToast();

const currentTab = ref('stories'); // 'stories' or 'inbox'

const categories = computed(() => categoryStore.categories as any[]);

// Dashboard state
const dashboardLoading = ref(true);
const totals = ref({ total_views: 0, total_comments: 0 });
const chartData = ref<{
  labels: string[];
  series: { name: string; data: number[] }[];
}>({
  labels: [],
  series: [],
});
const chartKey = ref(0);

// Filter and pagination state
const currentPage = ref(1);
const currentLimit = ref(10);
const currentKeyword = ref("");
const currentStatus = ref("");
const currentCategoryId = ref<number | null>(null);
const currentSortColumn = ref("thoi_gian_cap_nhat");
const currentSortDirection = ref<"asc" | "desc">("desc");

const fetchDashboard = async () => {
  dashboardLoading.value = true;
  try {
    const res = await getAuthorDashboard();
    totals.value = res.data.totals;
    chartData.value = {
      labels: res.data.chart?.labels || [],
      series: res.data.chart?.series || [],
    };
    chartKey.value += 1;
  } catch (err) {
    showErrorToast("Không thể cảm ứng dữ liệu dashboard.");
    chartData.value = { labels: [], series: [] };
  } finally {
    dashboardLoading.value = false;
  }
};

const fetchStories = async () => {
  await storyStore.fetchAuthorStories({
    page: currentPage.value,
    limit: currentLimit.value,
    keyword: currentKeyword.value,
    trang_thai_kiem_duyet: currentStatus.value,
    category_id: currentCategoryId.value,
    sort_by: currentSortColumn.value,
    order: currentSortDirection.value,
  });
};

onMounted(async () => {
  if (categories.value.length === 0) {
    await categoryStore.fetchCategories();
  }
  fetchDashboard();
  fetchStories();
  notificationStore.fetchNotifications(true); // Pre-fetch for badge
});

watch(
  [
    currentPage,
    currentKeyword,
    currentStatus,
    currentCategoryId,
    currentSortColumn,
    currentSortDirection,
  ],
  () => {
    fetchStories();
  }
);

const handleApplyFilters = (filters: {
  keyword: string;
  trang_thai_kiem_duyet: string;
  category_id: number | null;
}) => {
  currentPage.value = 1;
  currentKeyword.value = filters.keyword;
  currentStatus.value = filters.trang_thai_kiem_duyet;
  currentCategoryId.value = filters.category_id;
};

const handleClearFilters = () => {
  currentPage.value = 1;
  currentKeyword.value = "";
  currentStatus.value = "";
  currentCategoryId.value = null;
};

const handlePageChange = (page: number) => {
  if (page > 0 && page <= storyStore.authorStoriesPagination.total_pages) {
    currentPage.value = page;
  }
};

const handleSortRequest = ({
  column,
  direction,
}: {
  column: string;
  direction: "asc" | "desc";
}) => {
  currentSortColumn.value = column;
  currentSortDirection.value = direction;
  currentPage.value = 1;
};

const handleViewDetails = (storyId: number) => {
  const story = storyStore.authorStories.find((s) => s.id === storyId);
  if (story?.slug) router.push(`/truyen-chu/${story.slug}`);
};

const handleManageChapters = (storyId: number) => {
  router.push(`/author/story/${storyId}/chapters`);
};

const handleEditStory = (storyId: number) => {
  router.push({ name: "SubmitStory", params: { id: String(storyId) } });
};

const handleDeleteStory = async (storyId: number) => {
  if (!confirm("Đạo hữu chắc chắn muốn xóa linh thư này? Hành động này sẽ làm biến mất hoàn toàn tâm huyết của đạo hữu.")) return;
  try {
    await storyStore.deleteStory(storyId);
    showSuccessToast("Đã xóa linh thư thành công.");
    fetchStories();
    fetchDashboard();
  } catch {
    showErrorToast("Không thể thực hiện xóa.");
  }
};
</script>

<style scoped>
/* ===== CORE THEME XIANXIA ===== */
.author-dashboard-page-xianxia {
  min-height: 100vh;
  background: #0b0f19; /* Nền tối sâu đồng bộ */
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
  padding-bottom: 60px;
}

.dashboard-container-aura {
  max-width: 1300px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* Page Header */
.page-header-spirit {
  text-align: center;
  margin-bottom: 50px;
}

.page-title-glow {
  font-size: 2.8rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 4px;
  background: linear-gradient(to right, #34d399, #fff, #34d399);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 10px rgba(52, 211, 153, 0.3));
}

.page-subtitle {
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-top: 10px;
}

.header-divider-spirit {
  height: 1px;
  width: 240px;
  background: linear-gradient(90deg, transparent, #34d399, transparent);
  margin: 20px auto;
  position: relative;
}

.header-divider-spirit .dot {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);
  width: 8px; height: 8px; background: #34d399; box-shadow: 0 0 10px #34d399;
}

/* Sections Global */
.section-title-aura {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;
}

.section-title-aura h2 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Stats Section */
.stats-aura-section { margin-bottom: 40px; }
.stats-spirit-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}

/* Chart Section */
.chart-aura-section {
  background: #131b2c;
  border: 1px solid #1e293b;
  border-radius: 24px;
  padding: 30px;
  margin-bottom: 40px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.spirit-chart-wrapper {
  background: #0b0f19;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255,255,255,0.03);
}

/* Table Management Section */
.table-aura-section {
  background: #131b2c;
  border: 1px solid #1e293b;
  border-radius: 24px;
  padding: 30px;
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.btn-create-spirit {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #0b0f19;
  padding: 12px 28px;
  border-radius: 12px;
  font-weight: 900;
  text-transform: uppercase;
  font-size: 0.8rem;
  text-decoration: none;
  letter-spacing: 1px;
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
  transition: all 0.3s;
}

.btn-create-spirit:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 15px 25px rgba(16, 185, 129, 0.3);
}

.filters-spirit-box {
  background: #0b0f19;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 30px;
  border: 1px solid #1e293b;
}

.spirit-table-container {
  margin-bottom: 30px;
}

/* Pagination Xianxia */
.xianxia-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding-top: 30px;
  border-top: 1px dashed #1e293b;
}

.page-nav-btn {
  width: 45px; height: 45px;
  background: #0b0f19; border: 1px solid #1e293b; border-radius: 12px;
  color: #64748b; cursor: pointer; transition: all 0.3s;
}

.page-nav-btn:hover:not(:disabled) {
  border-color: #34d399;
  color: #34d399;
  box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
}

.page-nav-btn:disabled { opacity: 0.2; cursor: not-allowed; }

/* TABS NAVIGATION */
.tab-spirit-navigation {
  display: flex;
  gap: 10px;
  background: #0b0f19;
  padding: 6px;
  border-radius: 12px;
  border: 1px solid #1e293b;
}

.tab-aura-btn {
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  position: relative;
}

.tab-aura-btn.active {
  background: #1e293b;
  color: #34d399;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.tab-badge-spirit {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #f43f5e;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 900;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #0b0f19;
}

.page-counter {
  font-size: 0.9rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.page-counter .current { color: #34d399; font-weight: 900; }

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn { animation: fadeIn 0.8s ease-out; }

/* Responsive */
@media (max-width: 1024px) {
  .stats-spirit-grid { grid-template-columns: 1fr; }
  .section-header-row { flex-direction: column; gap: 20px; }
  .btn-create-spirit { width: 100%; text-align: center; }
}

@media (max-width: 640px) {
  .page-title-glow { font-size: 1.8rem; }
  .chart-aura-section, .table-aura-section { padding: 20px 15px; border-radius: 16px; }
}
</style>