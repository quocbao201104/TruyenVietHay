<template>
  <div class="admin-story-management-page-xianxia">
    <main class="admin-story-container-aura">
      
      <!-- TIÊU ĐỀ CHƯỞNG QUẢN -->
      <div class="page-header-spirit animate-fadeIn">
        <h1 class="page-title-glow-admin">Chưởng Quản Bí Tịch</h1>
        <p class="page-subtitle">Kiểm soát linh khí vạn giới - Duyệt lãm tiên thư xuất thế</p>
        <div class="header-divider-spirit admin">
          <div class="dot"></div>
        </div>
      </div>

      <!-- BỘ LỌC LINH KHÍ -->
      <section class="filters-aura-section animate-fadeIn">
        <StoryFiltersSection
          :categories="categories"
          :initial-filters="filters"
          @apply-filters="handleApplyFilters"
          @clear-filters="handleClearFilters"
        />
      </section>

      <!-- BẢNG LỆNH BÀI TRUYỆN -->
      <section class="table-aura-section animate-fadeIn">
        <StoryTableSection
          :stories="storyStore.adminStories"
          :loading="storyStore.loading"
          @approve="handleApproveStory"
          @reject="handleRejectStory"
          @view-details="handleViewDetails"
          @delete="handleDeleteStory"
          @manage-chapters="handleManageChapters"
        />
      </section>

      <!-- PHÂN TẦNG LINH TRẬN (PAGINATION) -->
      <section class="pagination-aura-area">
        <PaginationSection
          v-if="storyStore.adminStoriesPagination.total_pages > 1"
          :current-page="storyStore.adminStoriesPagination.current_page"
          :total-pages="storyStore.adminStoriesPagination.total_pages"
          @goToPage="handleGoToPage"
        />
      </section>

      <!-- MODAL: CHI TIẾT THIÊN THƯ & DUYỆT LÃM -->
      <BaseModal :is-open="isViewDetailsModalOpen" @close="closeViewDetailsModal" title="Chi Tiết Thiên Thư & Duyệt Lãm">
        <div v-if="currentStoryDetails" class="spirit-modal-content">
          <div class="story-details-aura-scroll">
            
            <!-- Bìa Linh Vật -->
            <div class="story-cover-aura-display">
              <div class="cover-glow-container">
                <img
                  v-if="currentStoryDetails.anh_bia_url"
                  :src="currentStoryDetails.anh_bia_url"
                  alt="Linh vật diện mạo"
                  class="story-cover-spirit-large"
                  crossorigin="anonymous"
                  @error="handleModalImageError"
                />
                <div v-else class="no-image-spirit">
                  <i class="fas fa-eye-slash"></i>
                  <span>Vô ảnh bìa</span>
                </div>
              </div>
            </div>

            <!-- Lưới Thông Tin Căn Cơ -->
            <div class="story-spirit-info-grid">
              <div class="spirit-info-item"><strong>Mã Thần Số:</strong> <span>#{{ currentStoryDetails.id }}</span></div>
              <div class="spirit-info-item"><strong>Trạng Thái Tu Vi:</strong> <span class="capitalize">{{ currentStoryDetails.trang_thai }}</span></div>
              <div class="spirit-info-item"><strong>Căn Cơ Độc Giả:</strong> <span>{{ formatAgeRating(currentStoryDetails.age_rating) }}</span></div>
              <div class="spirit-info-item"><strong>Linh Khí Nguồn:</strong> <a :href="currentStoryDetails.link_nguon" target="_blank" class="text-blue-400 truncate">{{ currentStoryDetails.link_nguon || 'N/A' }}</a></div>
              <div class="spirit-info-item"><strong>Thời Gian Cảm Ứng:</strong> <span>{{ formatDate(currentStoryDetails.thoi_gian_cap_nhat) }}</span></div>
              <div class="spirit-info-item">
                <strong>Kiểm Duyệt Ấn:</strong> 
                <span :class="['pill-badge-status', getStatusClass(currentStoryDetails.trang_thai_kiem_duyet)]">
                  {{ formatStatus(currentStoryDetails.trang_thai_kiem_duyet) }}
                </span>
              </div>
            </div>

            <!-- Tóm Tắt Bí Tịch -->
            <div class="spirit-content-block">
              <h3 class="block-title"><i class="fas fa-feather-pointed mr-2"></i> Tóm Tắt Bí Tịch:</h3>
              <p class="spirit-text-p">{{ currentStoryDetails.mo_ta }}</p>
            </div>

            <!-- Ghi Chú Chưởng Quản -->
            <div class="spirit-content-block admin-aura">
              <h3 class="block-title"><i class="fas fa-user-shield mr-2"></i> Ghi Chú Chưởng Quản:</h3>
              <textarea v-model="currentStoryDetails.ghi_chu_admin" rows="3" placeholder="Ghi lại nhận định của chưởng quản..."></textarea>
            </div>

            <!-- Bản Thảo Linh Khí -->
            <div class="spirit-content-block">
              <h3 class="block-title"><i class="fas fa-scroll mr-2"></i> Bản Thảo Linh Khí:</h3>
              <div v-if="currentStoryDetails.sample_chapter_content" v-html="currentStoryDetails.sample_chapter_content" class="chapter-spirit-preview"></div>
              <p v-else class="no-spirit-content">Bản thảo trống không, không thể cảm ứng.</p>
            </div>
          </div>

          <!-- Hành Động Chưởng Quản -->
          <div class="modal-spirit-actions">
            <button @click="submitApproval('duyet')" class="btn-spirit-action approve">
               <i class="fas fa-check-circle"></i> Duyệt Thiên Thư
            </button>
            <button @click="submitApproval('tu_choi')" class="btn-spirit-action reject">
               <i class="fas fa-ban"></i> Phong Ấn Bí Tịch
            </button>
            <button @click="closeViewDetailsModal" class="btn-spirit-action cancel">Đóng</button>
          </div>
        </div>
        <div v-else class="spirit-loading-modal">
          <i class="fas fa-yin-yang fa-spin text-3xl mb-2"></i>
          <p>Đang thỉnh thiên thư...</p>
        </div>
      </BaseModal>

      <!-- MODAL: QUẢN LÝ TẦNG CHƯƠNG -->
      <BaseModal :is-open="isChapterModalOpen" @close="closeChapterModal" title="Quản Lý Tầng Chương">
        <div class="chapter-spirit-management-box">
            <div v-if="loadingChapters" class="spirit-loading-modal">
                <i class="fas fa-spinner fa-spin text-2xl mb-2"></i> Đang thỉnh danh sách chương...
            </div>
            <div v-else-if="!currentStoryChapters || currentStoryChapters.length === 0" class="no-spirit-content text-center py-10">
                <p>Bí tịch này chưa được khai phá tầng chương nào.</p>
            </div>
            <div v-else class="spirit-table-wrapper-scroll">
                <div class="modal-spirit-top-actions">
                  <button @click="handleApproveAllChapters" class="btn-spirit-action-small approve" :disabled="loadingChapters">
                      <i class="fas fa-check-double mr-2"></i> Duyệt Toàn Bộ
                  </button>
                </div>
                <table class="xianxia-admin-table">
                    <thead>
                        <tr>
                            <th>Tầng</th>
                            <th>Tiêu Đề Tầng</th>
                            <th>Ngày Xuất Thế</th>
                            <th>Trạng Thái</th>
                            <th class="text-center">Pháp Quyết</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="chapter in currentStoryChapters" :key="chapter.id" class="spirit-row">
                            <td class="text-center font-bold">{{ chapter.so_chuong }}</td>
                            <td>{{ chapter.tieu_de }}</td>
                            <td class="text-center opacity-60">{{ formatDate(chapter.thoi_gian_dang) }}</td>
                            <td class="text-center">
                                <span :class="['pill-badge-status', getStatusClass(chapter.trang_thai || 'cho_duyet')]">
                                    {{ formatStatus(chapter.trang_thai || 'cho_duyet') }}
                                </span>
                            </td>
                            <td class="actions-cell-spirit">
                                <div class="btn-group-spirit">
                                    <button v-if="chapter.trang_thai !== 'duyet'" @click="handleApproveChapter(chapter.id)" class="btn-mini approve" title="Duyệt"><i class="fas fa-check"></i></button>
                                    <button v-if="chapter.trang_thai !== 'tu_choi'" @click="handleRejectChapter(chapter.id)" class="btn-mini reject" title="Từ chối"><i class="fas fa-times"></i></button>
                                    <button @click="handleDeleteChapterAdmin(chapter.id)" class="btn-mini delete" title="Xóa"><i class="fas fa-trash-can"></i></button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      </BaseModal>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import StoryFiltersSection from '@/components/admin/StoryFiltersSection.vue';
import StoryTableSection from '@/components/admin/StoryTableSection.vue';
import PaginationSection from '@/components/admin/PaginationSection.vue'; 
import BaseModal from '@/components/common/BaseModal.vue';
import { useStoryStore } from '@/modules/storyText/story.store';
import { useChapterStore } from '@/modules/storyText/chapter/chapter.store';
import { useCategoryStore } from '@/modules/category/category.store';
import { useToast } from 'vue-toastification'; 
import { getImageUrl } from "@/config/constants"; 

const storyStore = useStoryStore();
const categoryStore = useCategoryStore();
const toast = useToast(); 

const filters = ref({
  page: 1,
  limit: 10,
  trang_thai_kiem_duyet: '',
  keyword: '',
  author_id: null,
  category_id: null,
});

const isViewDetailsModalOpen = ref(false);
const currentStoryDetails = ref<any>(null); 
const categories = ref<any[]>([]);

const fetchStories = () => {
  storyStore.fetchAdminStories(filters.value);
};

onMounted(async () => {
  fetchStories();
  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories();
  }
  categories.value = categoryStore.categories;
});

watch(() => filters.value.trang_thai_kiem_duyet, () => fetchStories());
watch(() => filters.value.keyword, () => fetchStories());
watch(() => filters.value.category_id, () => fetchStories());
watch(() => filters.value.page, () => fetchStories());

const handleApplyFilters = (newFilters: any) => {
  filters.value = { ...filters.value, ...newFilters, page: 1 };
};

const handleClearFilters = () => {
  filters.value = { page: 1, limit: 10, trang_thai_kiem_duyet: '', keyword: '', author_id: null, category_id: null };
};

const handleGoToPage = (page: number) => { filters.value.page = page; };

const handleViewDetails = async (storyId: number) => {
  isViewDetailsModalOpen.value = true;
  currentStoryDetails.value = null; 
  try {
    const story = await storyStore.fetchStoryById(storyId); 
    if (story) {
        currentStoryDetails.value = { ...story, anh_bia_url: getImageUrl(story.anh_bia) };
    } else {
        toast.error("Không tìm thấy thiên thư.");
        isViewDetailsModalOpen.value = false;
    }
  } catch (error) {
    toast.error("Thiên cơ nhiễu loạn, không thể tải dữ liệu.");
    isViewDetailsModalOpen.value = false;
  }
};

const closeViewDetailsModal = () => {
  isViewDetailsModalOpen.value = false;
  currentStoryDetails.value = null;
};

// Chapter Management
const chapterStore = useChapterStore();
const isChapterModalOpen = ref(false);
const currentStoryChapters = computed(() => chapterStore.chapterList);
const loadingChapters = computed(() => chapterStore.loading);
const currentStoryIdForChapters = ref<number | null>(null);

const handleManageChapters = async (storyId: number) => {
  currentStoryIdForChapters.value = storyId;
  isChapterModalOpen.value = true;
  await chapterStore.fetchAdminChapterList(storyId);
};

const closeChapterModal = () => {
  isChapterModalOpen.value = false;
  currentStoryIdForChapters.value = null;
};

const handleApproveChapter = async (id: number) => {
  if (confirm('Duyệt tầng chương này cho phép đạo hữu vạn giới tiếp cận?')) {
    await chapterStore.approveChapter(id, 'duyet');
    if (currentStoryIdForChapters.value) await chapterStore.fetchAdminChapterList(currentStoryIdForChapters.value);
  }
};

const handleRejectChapter = async (id: number) => {
  if (confirm('Phong ấn tầng chương này?')) {
    await chapterStore.approveChapter(id, 'tu_choi');
    if (currentStoryIdForChapters.value) await chapterStore.fetchAdminChapterList(currentStoryIdForChapters.value);
  }
};

const handleDeleteChapterAdmin = async (id: number) => {
  if (confirm('Làm biến mất vĩnh viễn tầng chương này?')) {
    await chapterStore.deleteChapter(id);
    if (currentStoryIdForChapters.value) await chapterStore.fetchAdminChapterList(currentStoryIdForChapters.value);
  }
};

const handleApproveAllChapters = async () => {
  if (currentStoryIdForChapters.value && confirm('Duyệt toàn bộ tầng chương của bí tịch này?')) {
    await chapterStore.approveAllChapters(currentStoryIdForChapters.value);
  }
};

const handleApproveStory = (storyId: number) => {
  executeStoryApproval(storyId, 'duyet');
};

const handleRejectStory = (storyId: number) => {
  executeStoryApproval(storyId, 'tu_choi');
};

const executeStoryApproval = async (storyId: number, action: 'duyet' | 'tu_choi') => {
  const msg = action === 'duyet' ? 'Khai mở bí tịch này cho vạn giới?' : 'Phong ấn bí tịch này vào hư không?';
  if (confirm(msg)) {
    try {
      await storyStore.approveOrRejectStory(storyId, action);
      if (isViewDetailsModalOpen.value && currentStoryDetails.value?.id === storyId) {
        closeViewDetailsModal();
      }
      fetchStories(); 
      toast.success(action === 'duyet' ? "Đã duyệt thiên thư!" : "Đã phong ấn bí tịch.");
    } catch (error) {
      toast.error("Pháp lực không đủ, thao tác thất bại.");
    }
  }
};

const submitApproval = async (action: 'duyet' | 'tu_choi') => {
  if (!currentStoryDetails.value?.id) return;
  await executeStoryApproval(currentStoryDetails.value.id, action);
};

const handleDeleteStory = async (id: number) => {
  if (confirm('Xóa vĩnh viễn bí tịch này khỏi càn khôn?')) {
    try {
      await storyStore.deleteStory(id);
      fetchStories();
    } catch (error) {
      toast.error("Không thể thực hiện xóa.");
    }
  }
};

const getStatusClass = (s: string) => ({ 'approved': s === 'duyet', 'pending': s === 'cho_duyet', 'rejected': s === 'tu_choi' });
const formatStatus = (s: string) => ({ 'duyet': 'Đã Duyệt', 'cho_duyet': 'Đợi Lệnh', 'tu_choi': 'Phong Ấn' }[s] || s);
const formatAgeRating = (v: number) => ({ 1: "Phổ Thông", 2: "13+", 3: "18+" }[v] || "N/A");
const formatDate = (d: string | undefined) => d ? new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
const handleModalImageError = (e: Event) => { (e.target as HTMLImageElement).style.display = 'none'; };
</script>

<style scoped>
/* ===== CORE THEME ADMIN XIANXIA ===== */
.admin-story-management-page-xianxia {
  min-height: 100vh;
  background: #0b0f19; /* Nền tối sâu đồng bộ */
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
  padding-bottom: 60px;
}

.admin-story-container-aura {
  max-width: 1350px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* Page Header */
.page-title-glow-admin {
  font-size: 3rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 5px;
  background: linear-gradient(to right, #a78bfa, #fff, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  filter: drop-shadow(0 0 15px rgba(167, 139, 250, 0.4));
}

.page-subtitle {
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.85rem;
  font-weight: 700;
  text-align: center;
  margin-top: 10px;
}

.header-divider-spirit {
  height: 1px;
  width: 300px;
  background: linear-gradient(90deg, transparent, #a78bfa, transparent);
  margin: 20px auto 40px;
  position: relative;
}
.header-divider-spirit .dot {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);
  width: 8px; height: 8px; background: #a78bfa; box-shadow: 0 0 10px #a78bfa;
}

/* Section Components */
.filters-aura-section { margin-bottom: 30px; }
.table-aura-section {
  background: #131b2c;
  border: 1px solid #1e293b;
  border-radius: 24px;
  padding: 5px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.4);
}

/* Modal Xianxia Styling */
.spirit-modal-content {
  padding: 15px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.story-details-aura-scroll {
  overflow-y: auto;
  padding-right: 15px;
  scrollbar-width: thin;
  scrollbar-color: #a78bfa #0b0f19;
}

.story-cover-aura-display {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.cover-glow-container {
  position: relative;
  width: 180px;
  height: 250px;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid rgba(167, 139, 250, 0.3);
  box-shadow: 0 0 30px rgba(167, 139, 250, 0.1);
}

.story-cover-spirit-large { width: 100%; height: 100%; object-fit: cover; }

.story-spirit-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  background: rgba(11, 15, 25, 0.5);
  padding: 25px;
  border-radius: 20px;
  border: 1px solid rgba(167, 139, 250, 0.1);
  margin-bottom: 25px;
}

.spirit-info-item { display: flex; flex-direction: column; gap: 4px; font-size: 0.9rem; }
.spirit-info-item strong { color: #a78bfa; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; }
.spirit-info-item span { color: #f8fafc; font-weight: 600; }

.pill-badge-status {
  padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 800; color: #fff;
}
.pill-badge-status.approved { background: #10b98120; border: 1px solid #10b981; color: #10b981; }
.pill-badge-status.pending { background: #facc1520; border: 1px solid #facc15; color: #facc15; }
.pill-badge-status.rejected { background: #f43f5e20; border: 1px solid #f43f5e; color: #f43f5e; }

.spirit-content-block {
  margin-bottom: 25px;
  padding: 25px;
  background: #0b0f19;
  border-radius: 20px;
  border: 1px solid #1e293b;
}

.block-title { color: #a78bfa; font-weight: 800; font-size: 0.95rem; margin-bottom: 15px; text-transform: uppercase; }
.spirit-text-p { line-height: 1.8; color: #94a3b8; }

.admin-aura textarea {
  width: 100%; background: #131b2c; border: 1px solid #334155; border-radius: 12px;
  padding: 15px; color: #fff; outline: none;
}
.admin-aura textarea:focus { border-color: #a78bfa; box-shadow: 0 0 10px rgba(167, 139, 250, 0.2); }

.chapter-spirit-preview {
  max-height: 300px; overflow-y: auto; background: #080a12; padding: 20px; border-radius: 12px; line-height: 1.8;
}

/* Modal Actions */
.modal-spirit-actions {
  display: flex; justify-content: flex-end; gap: 15px; padding-top: 25px; border-top: 1px solid #1e293b;
}

.btn-spirit-action {
  padding: 12px 25px; border-radius: 12px; font-weight: 800; font-size: 0.9rem; cursor: pointer; transition: all 0.3s;
}
.btn-spirit-action.approve { background: linear-gradient(135deg, #10b981, #059669); color: #0b0f19; border: none; }
.btn-spirit-action.reject { background: linear-gradient(135deg, #f43f5e, #e11d48); color: #fff; border: none; }
.btn-spirit-action.cancel { background: #1e293b; color: #64748b; border: 1px solid #334155; }

/* Chapter Management Modal Table */
.xianxia-admin-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
.xianxia-admin-table th { padding: 15px; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: #475569; letter-spacing: 1px; }
.spirit-row td { background: #0b0f19; padding: 15px; transition: all 0.3s; }
.spirit-row:hover td { background: #1a2436; border-color: #a78bfa30; }
.spirit-row td:first-child { border-radius: 12px 0 0 12px; }
.spirit-row td:last-child { border-radius: 0 12px 12px 0; }

.btn-group-spirit { display: flex; justify-content: center; gap: 8px; }
.btn-mini { width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer; transition: all 0.2s; color: #fff; }
.btn-mini.approve { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid #10b98130; }
.btn-mini.reject { background: rgba(244, 63, 94, 0.1); color: #f43f5e; border: 1px solid #f43f5e30; }
.btn-mini.delete { background: rgba(71, 85, 105, 0.1); color: #94a3b8; border: 1px solid #94a3b830; }
.btn-mini:hover { transform: scale(1.1); }

/* Animations */
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.8s ease-out; }

/* Responsive */
@media (max-width: 768px) {
  .story-spirit-info-grid { grid-template-columns: 1fr; }
  .modal-spirit-actions { flex-direction: column; }
  .btn-spirit-action { width: 100%; }
}
</style>