<template>
  <div class="admin-story-management-page">

    <main class="admin-story-management-container">
      <h1 class="page-title">Quản lý Truyện</h1>

      <StoryFiltersSection
        :categories="categories"
        :initial-filters="filters"
        @apply-filters="handleApplyFilters"
        @clear-filters="handleClearFilters"
      />

      <StoryTableSection
        :stories="storyStore.adminStories"
        :loading="storyStore.loading"
        @approve="handleApproveStory"
        @reject="handleRejectStory"
        @view-details="handleViewDetails"
        @delete="handleDeleteStory"
        @manage-chapters="handleManageChapters"
      />

      <PaginationSection
        v-if="storyStore.adminStoriesPagination.total_pages > 1"
        :current-page="storyStore.adminStoriesPagination.current_page"
        :total-pages="storyStore.adminStoriesPagination.total_pages"
        @goToPage="handleGoToPage"
      />

      <BaseModal :is-open="isViewDetailsModalOpen" @close="closeViewDetailsModal" title="Chi tiết Truyện và Duyệt">
        <div v-if="currentStoryDetails">
          <div class="story-details-content">
            <div class="story-cover-display">
              <h3>Ảnh bìa truyện:</h3>
              <img
                v-if="currentStoryDetails.anh_bia_url"
                :src="currentStoryDetails.anh_bia_url"
                alt="Ảnh bìa"
                class="story-cover-large"
                crossorigin="anonymous"
                @error="handleModalImageError"
              />
              <div v-else class="no-image-placeholder-large">
                <i class="fas fa-image"></i>
                <span>Không có ảnh bìa</span>
              </div>
            </div>

            <div class="story-info-grid">
              <div class="info-item"><strong>ID:</strong> <span>{{ currentStoryDetails.id }}</span></div>
              <div class="info-item"><strong>Tên truyện:</strong> <span>{{ currentStoryDetails.ten_truyen }}</span></div>
              <div class="info-item"><strong>Tác giả:</strong> <span>{{ currentStoryDetails.tac_gia }}</span></div>
              <div class="info-item"><strong>Slug:</strong> <span>{{ currentStoryDetails.slug }}</span></div>
              <div class="info-item"><strong>Trạng thái:</strong> <span>{{ currentStoryDetails.trang_thai }}</span></div>
              <div class="info-item"><strong>Tình trạng:</strong> <span>{{ currentStoryDetails.tinh_trang }}</span></div>
              <div class="info-item"><strong>Trạng thái viết:</strong> <span>{{ currentStoryDetails.trang_thai_viet }}</span></div>
              <div class="info-item"><strong>Yếu tố nhạy cảm:</strong> <span>{{ currentStoryDetails.yeu_to_nhay_cam ? 'Có' : 'Không' }}</span></div>
              <div class="info-item"><strong>Link nguồn:</strong> <a :href="currentStoryDetails.link_nguon" target="_blank">{{ currentStoryDetails.link_nguon || 'N/A' }}</a></div>
              <div class="info-item"><strong>Mục tiêu:</strong> <span>{{ currentStoryDetails.muc_tieu }}</span></div>
              <div class="info-item"><strong>Đối tượng độc giả:</strong> <span>{{ currentStoryDetails.doi_tuong_doc_gia }}</span></div>
              <div class="info-item"><strong>Thời gian cập nhật:</strong> <span>{{ formatDate(currentStoryDetails.thoi_gian_cap_nhat) }}</span></div>
              <div class="info-item"><strong>Trạng thái kiểm duyệt:</strong> <span :class="['status-badge', getStatusClass(currentStoryDetails.trang_thai_kiem_duyet)]">{{ formatStatus(currentStoryDetails.trang_thai_kiem_duyet) }}</span></div>
            </div>

            <div class="story-description">
              <h3>Mô tả:</h3>
              <p>{{ currentStoryDetails.mo_ta }}</p>
            </div>

            <div class="admin-notes">
              <h3>Ghi chú Admin:</h3>
              <textarea v-model="currentStoryDetails.ghi_chu_admin" rows="3" placeholder="Thêm ghi chú của admin..."></textarea>
            </div>

            <div class="story-ratings">
              <h3>Đánh giá nội dung:</h3>
              <input type="number" v-model.number="currentStoryDetails.danh_gia_noi_dung" min="0" max="10" class="rating-input" />
              <h3>Đánh giá văn phong:</h3>
              <input type="number" v-model.number="currentStoryDetails.danh_gia_van_phong" min="0" max="10" class="rating-input" />
              <h3>Đánh giá sáng tạo:</h3>
              <input type="number" v-model.number="currentStoryDetails.danh_gia_sang_tao" min="0" max="10" class="rating-input" />
            </div>

            <div class="chapters-preview-section">
              <h3>Chương mẫu / Chương đầu tiên:</h3>
              <div v-if="currentStoryDetails.sample_chapter_content" v-html="currentStoryDetails.sample_chapter_content" class="chapter-content-preview"></div>
              <p v-else class="no-content-message">Không có chương mẫu hoặc nội dung chương đầu tiên được cung cấp.</p>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="submitApproval('duyet')" class="action-btn approve-btn">Duyệt truyện</button>
            <button @click="submitApproval('tu_choi')" class="action-btn reject-btn">Từ chối truyện</button>
            <button @click="closeViewDetailsModal" class="action-btn cancel-btn">Đóng</button>
          </div>
        </div>
        <div v-else class="loading-modal-content">Đang tải thông tin truyện...</div>
      </BaseModal>

      <!-- Chapter Management Modal -->
      <BaseModal 
        :is-open="isChapterModalOpen" 
        @close="closeChapterModal" 
        title="Quản lý Chương"
      >
        <div class="chapter-management-modal-content">
           <div v-if="loadingChapters" class="loading-modal-content">
                <i class="fas fa-spinner fa-spin"></i> Đang tải danh sách chương...
           </div>
           <div v-else-if="!currentStoryChapters || currentStoryChapters.length === 0" class="no-data-message">
                <p>Truyện này chưa có chương nào.</p>
           </div>
           <div v-else class="table-responsive">
                <div class="modal-header-actions" style="margin-bottom: 1rem; display: flex; justify-content: flex-end;">
                  <button 
                      @click="handleApproveAllChapters" 
                      class="action-btn approve-btn" 
                      :disabled="loadingChapters"
                  >
                      <i class="fas fa-check-double"></i> Duyệt tất cả
                  </button>
                </div>
                <table class="story-table chapter-admin-table">
                    <thead>
                        <tr>
                            <th>Số chương</th>
                            <th>Tiêu đề</th>
                            <th>Ngày đăng</th>
                            <th>Lượt xem</th>
                            <th>Trạng thái</th>
                            <th class="text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="chapter in currentStoryChapters" :key="chapter.id" class="story-row">
                            <td class="text-center">{{ chapter.so_chuong }}</td>
                            <td>{{ chapter.tieu_de }}</td>
                            <td class="text-center">{{ formatDate(chapter.thoi_gian_dang) }}</td>
                            <td class="text-center">0</td> <!-- Views logic if available -->
                            <td class="text-center">
                                <span :class="['status-badge', getStatusClass(chapter.trang_thai || 'cho_duyet')]">
                                    {{ formatStatus(chapter.trang_thai || 'cho_duyet') }}
                                </span>
                            </td>
                            <td class="actions-cell">
                                <div class="actions-row-center">
                                    <button 
                                        v-if="chapter.trang_thai !== 'duyet'"
                                        @click="handleApproveChapter(chapter.id)" 
                                        class="action-btn-small approve-btn-small"
                                        title="Duyệt"
                                    >
                                        <i class="fas fa-check"></i>
                                    </button>
                                     <button 
                                        v-if="chapter.trang_thai !== 'tu_choi'"
                                        @click="handleRejectChapter(chapter.id)" 
                                        class="action-btn-small reject-btn-small"
                                        title="Từ chối"
                                    >
                                        <i class="fas fa-times"></i>
                                    </button>
                                    <button 
                                        @click="handleDeleteChapterAdmin(chapter.id)" 
                                        class="action-btn-small delete-btn-small"
                                        title="Xóa"
                                    >
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
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
import { useChapterStore } from '@/modules/storyText/chapter/chapter.store'; // Import Chapter Store
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
  // Fetch categories only if not already loaded
  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories();
  }
  categories.value = categoryStore.categories;
});

// Watch only specific filter changes that should trigger refetch
// Removed deep watch - it was causing infinite loop with pagination updates
watch(() => filters.value.trang_thai_kiem_duyet, () => fetchStories());
watch(() => filters.value.keyword, () => fetchStories());
watch(() => filters.value.author_id, () => fetchStories());
watch(() => filters.value.category_id, () => fetchStories());
watch(() => filters.value.page, () => fetchStories());

const handleApplyFilters = (newFilters: any) => {
  filters.value = { ...filters.value, ...newFilters, page: 1 };
};

const handleClearFilters = () => {
  filters.value = {
    page: 1,
    limit: 10,
    trang_thai_kiem_duyet: '',
    keyword: '',
    author_id: null,
    category_id: null,
  };
};

const handleGoToPage = (page: number) => {
  filters.value.page = page;
};

const handleApproveStory = async (storyId: number) => {
  if (confirm('Bạn có chắc chắn muốn DUYỆT truyện này không?')) {
    try {
      await storyStore.approveOrRejectStory(storyId, 'duyet');
      // toast.success handled in store
      fetchStories(); 
    } catch (error) {
      console.error("Lỗi khi duyệt truyện:", error);
      toast.error("Có lỗi xảy ra khi duyệt truyện.");
    }
  }
};

const handleRejectStory = async (storyId: number) => {
  if (confirm('Bạn có chắc chắn muốn TỪ CHỐI truyện này không?')) {
    try {
      await storyStore.approveOrRejectStory(storyId, 'tu_choi');
      // toast.success handled in store
      fetchStories(); 
    } catch (error) {
      console.error("Lỗi khi từ chối truyện:", error);
      toast.error("Có lỗi xảy ra khi từ chối truyện.");
    }
  }
};

const handleViewDetails = async (storyId: number) => {
  isViewDetailsModalOpen.value = true;
  currentStoryDetails.value = null; 

  try {
    const story = await storyStore.fetchStoryById(storyId); 
    if (story) {
        currentStoryDetails.value = {
            ...story, 
            anh_bia_url: getImageUrl(story.anh_bia),
        };
    } else {
        console.error("Không tìm thấy truyện với ID:", storyId);
        toast.error("Không tìm thấy thông tin chi tiết truyện.");
        isViewDetailsModalOpen.value = false;
    }
  } catch (error) {
    console.error("Lỗi khi tải thông tin truyện để xem chi tiết:", error);
    toast.error("Không thể tải thông tin chi tiết truyện.");
    isViewDetailsModalOpen.value = false;
  }
};



const closeViewDetailsModal = () => {
  isViewDetailsModalOpen.value = false;
  currentStoryDetails.value = null;
};

// Chapter Management Logic
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
  // Clear list potentially if needed, but store handles reactivity
};

const handleApproveChapter = async (chapterId: number) => {
  if (confirm('Bạn có chắc chắn muốn DUYỆT chương này không?')) {
    try {
      await chapterStore.approveChapter(chapterId, 'duyet');
      if (currentStoryIdForChapters.value) {
        await chapterStore.fetchAdminChapterList(currentStoryIdForChapters.value);
      }
    } catch (error) {
       // Error handled in store
    }
  }
};

const handleRejectChapter = async (chapterId: number) => {
  if (confirm('Bạn có chắc chắn muốn TỪ CHỐI chương này không?')) {
     try {
      await chapterStore.approveChapter(chapterId, 'tu_choi');
      if (currentStoryIdForChapters.value) {
        await chapterStore.fetchAdminChapterList(currentStoryIdForChapters.value);
      }
    } catch (error) {
       // Error handled in store
    }
  }
};

const handleDeleteChapterAdmin = async (chapterId: number) => {
  if (confirm('Bạn có chắc chắn muốn XÓA chương này không?')) {
    try {
      await chapterStore.deleteChapter(chapterId);
       if (currentStoryIdForChapters.value) {
        await chapterStore.fetchAdminChapterList(currentStoryIdForChapters.value);
      }
    } catch (error) {
      // Error handled in store
    }
  }
};

const handleApproveAllChapters = async () => {
  if (currentStoryIdForChapters.value && confirm('Bạn có chắc chắn muốn DUYỆT TẤT CẢ chương của truyện này không?')) {
    try {
      await chapterStore.approveAllChapters(currentStoryIdForChapters.value);
    } catch (error) {
       // Error handled in store
    }
  }
};

const submitApproval = async (action: 'duyet' | 'tu_choi') => {
  if (!currentStoryDetails.value || !currentStoryDetails.value.id) {
    toast.error('Không có thông tin truyện để xử lý.');
    return;
  }

  const confirmMessage = action === 'duyet' 
    ? 'Bạn có chắc chắn muốn DUYỆT truyện này không?' 
    : 'Bạn có chắc chắn muốn TỪ CHỐI truyện này không?';

  if (confirm(confirmMessage)) {
    try {
      await storyStore.approveOrRejectStory(currentStoryDetails.value.id, action);
      // toast.success handled in store
      closeViewDetailsModal();
      fetchStories(); 
    } catch (error) {
      console.error(`Lỗi khi ${action} truyện:`, error);
      toast.error(`Có lỗi xảy ra khi ${action} truyện.`);
    }
  }
};

const handleDeleteStory = async (storyId: number) => {
  if (confirm('Bạn có chắc chắn muốn XÓA truyện này vĩnh viễn không?')) {
    try {
      await storyStore.deleteStory(storyId);
      // toast.success handled in store
      if (storyStore.adminStories.length === 0 && filters.value.page > 1) {
          filters.value.page--;
      } else {
          fetchStories();
      }
    } catch (error) {
      console.error("Lỗi khi xóa truyện:", error);
      toast.error("Có lỗi xảy ra khi xóa truyện.");
    }
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'duyet': return 'status-approved';
    case 'cho_duyet': return 'status-pending';
    case 'tu_choi': return 'status-rejected';
    default: return '';
  }
};

const formatStatus = (status: string) => {
  switch (status) {
    case 'duyet': return 'Đã duyệt';
    case 'cho_duyet': return 'Chờ duyệt';
    case 'tu_choi': return 'Từ chối';
    default: return status;
  }
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleDateString('vi-VN', options);
};

const handleModalImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.style.display = 'none'; 
  const parentContainer = target.closest('.story-cover-display');
  if (parentContainer && !parentContainer.querySelector('.no-image-placeholder-large')) {
    const placeholder = document.createElement('div');
    placeholder.className = 'no-image-placeholder-large';
    placeholder.innerHTML = '<i class="fas fa-image"></i> <span>Không có ảnh bìa</span>';
    parentContainer.appendChild(placeholder);
  }
};
</script>

<style scoped>
.admin-story-management-page {
  min-height: 100vh;
  background: #1a1d29;
  color: #ffffff;
  position: relative;
  overflow: hidden;
  font-family: 'Manrope', sans-serif;
}

.admin-story-management-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-title {
  font-size: 2.5rem;
  color: #22c55e;
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 800;
  text-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
}

.story-details-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  max-height: 70vh; 
  overflow-y: auto; 
  scrollbar-width: thin; 
  scrollbar-color: #4ade80 #2d313d; 
}

.story-details-content::-webkit-scrollbar {
  width: 8px;
}

.story-details-content::-webkit-scrollbar-track {
  background: #2d313d;
  border-radius: 10px;
}

.story-details-content::-webkit-scrollbar-thumb {
  background-color: #4ade80;
  border-radius: 10px;
  border: 2px solid #2d313d;
}

.story-cover-display {
  text-align: center;
  margin-bottom: 1rem;
}

.story-cover-display h3 {
  color: #4ade80;
  margin-bottom: 0.8rem;
  font-size: 1.2rem;
}

.story-cover-large {
  max-width: 200px;
  max-height: 300px;
  object-fit: contain;
  border-radius: 0.75rem;
  border: 2px solid #22c55e;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.no-image-placeholder-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 1rem;
  text-align: center;
  width: 200px;
  height: 300px;
  border: 2px dashed #4b5563;
  border-radius: 0.75rem;
  background-color: rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

.no-image-placeholder-large .fas {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.story-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
  gap: 1.2rem 1.5rem; 
  background: rgba(36, 40, 52, 0.5);
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.info-item {
  display: flex;
  flex-direction: column; 
  gap: 0.2rem;
  font-size: 0.95rem;
}

.info-item strong {
  color: #4caf50; 
  font-size: 1.05rem; 
  margin-bottom: 0.2em; 
}

.info-item span {
  color: #d1d5db;
  word-break: break-word;
}

.info-item a {
  color: #3b82f6; 
  text-decoration: none;
  word-break: break-all; 
  transition: color 0.2s ease;
}

.info-item a:hover {
  color: #60a5fa;
  text-decoration: underline;
}

.story-description, .admin-notes, .chapters-preview-section, .story-ratings {
  background: rgba(36, 40, 52, 0.5);
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.story-description h3, .admin-notes h3, .chapters-preview-section h3, .story-ratings h3 {
  color: #4ade80;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.story-description p, .no-content-message {
  white-space: pre-wrap; 
  word-wrap: break-word; 
  color: #d1d5db;
  line-height: 1.6;
}

.chapter-content-preview {
  max-height: 300px; 
  overflow-y: auto; 
  background-color: rgba(0, 0, 0, 0.1);
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #4b5563;
  color: #d1d5db;
  line-height: 1.7;
  font-size: 1rem;
  scrollbar-width: thin; 
  scrollbar-color: #4ade80 #2d313d; 
}

.chapter-content-preview::-webkit-scrollbar {
  width: 8px;
}

.chapter-content-preview::-webkit-scrollbar-track {
  background: #2d313d;
  border-radius: 10px;
}

.chapter-content-preview::-webkit-scrollbar-thumb {
  background-color: #4ade80;
  border-radius: 10px;
  border: 2px solid #2d313d;
}

.admin-notes textarea {
  width: 100%;
  min-height: 100px;
  padding: 0.8rem;
  border-radius: 0.5rem;
  border: 1px solid #4b5563;
  background-color: #2d313d;
  color: #d1d5db;
  font-family: 'Manrope', sans-serif;
  resize: vertical;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.admin-notes textarea:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.3);
}

.story-ratings input[type="number"] {
  width: 80px; 
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #4b5563;
  background-color: #2d313d;
  color: #d1d5db;
  font-family: 'Manrope', sans-serif;
  margin-bottom: 10px;
  -moz-appearance: textfield; 
  appearance: textfield; 
  text-align: center;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.story-ratings input[type="number"]::-webkit-outer-spin-button,
.story-ratings input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.story-ratings input[type="number"]:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.3);
}

.modal-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  border: none;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.approve-btn {
  background: linear-gradient(90deg, #22c55e, #4ade80);
  color: #ffffff;
}

.approve-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(34, 197, 94, 0.4);
}

.reject-btn {
  background: linear-gradient(90deg, #ef4444, #f87171);
  color: #ffffff;
}

.reject-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4);
}

.cancel-btn {
  background: #6b7280;
  color: #ffffff;
}

.cancel-btn:hover {
  background: #4b5563;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(75, 85, 99, 0.4);
}

.loading-modal-content {
  text-align: center;
  padding: 20px;
  font-size: 1.1rem;
  color: #d1d5db;
}

.status-badge {
  padding: 0.4rem 0.8rem; 
  border-radius: 0.75rem; 
  font-size: 0.85rem; 
  font-weight: 600;
  color: #ffffff;
  display: inline-block;
  text-align: center;
  min-width: 90px; 
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.status-approved {
  background-color: #28a745; 
}

.status-pending {
  background-color: #ffc107; 
  color: #343a40; 
}

.status-rejected {
  background-color: #dc3545; 
}

@media (max-width: 768px) {
  .admin-story-management-container {
    padding: 1rem;
  }
  .page-title {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }
  .modal-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  .action-btn {
    width: 100%;
    justify-content: center;
    font-size: 0.9rem;
    padding: 0.6rem 1.2rem;
  }
  .story-info-grid {
    grid-template-columns: 1fr;
  }
  .story-cover-large, .no-image-placeholder-large {
    max-width: 150px;
    max-height: 225px;
  }
  .story-details-content {
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  .admin-story-management-container {
    padding: 0.5rem;
  }
  .page-title {
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }
  .story-details-content {
    padding: 0.5rem;
  }
  .story-ratings input[type="number"] {
    width: 60px;
    padding: 0.4rem;
    font-size: 0.9rem;
  }
}

.chapter-management-modal-content {
    background: rgba(36, 40, 52, 0.5);
    padding: 1rem;
    border-radius: 0.75rem;
    border: 1px solid rgba(34, 197, 94, 0.2);
}

.chapter-admin-table {
    width: 100%;
    margin-top: 0;
    border-collapse: collapse; /* Ensure clean borders */
}

.chapter-admin-table th, 
.chapter-admin-table td {
    padding: 0.75rem;
    font-size: 0.9rem;
}

.actions-row-center {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
}

.action-btn-small {
    width: 30px;
    height: 30px;
    border-radius: 0.4rem;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    font-size: 0.8rem;
    color: #fff;
}

.approve-btn-small {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.3);
}

.approve-btn-small:hover {
    background: rgba(34, 197, 94, 0.4);
}

.reject-btn-small {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

.reject-btn-small:hover {
    background: rgba(239, 68, 68, 0.4);
}

.delete-btn-small {
    background: rgba(107, 114, 128, 0.2);
    color: #9ca3af;
    border: 1px solid rgba(107, 114, 128, 0.3);
}

.delete-btn-small:hover {
    background: rgba(107, 114, 128, 0.4);
    color: #fff;
}
</style>