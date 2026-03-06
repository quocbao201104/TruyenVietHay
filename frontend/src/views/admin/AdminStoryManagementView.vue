<template>
  <div class="admin-story-management-page-xianxia">
    <main class="admin-story-container-aura">
      
      <div class="page-header-spirit animate-fadeIn">
        <h1 class="page-title-glow-admin">Chưởng Quản Bí Tịch</h1>
        <p class="page-subtitle">Kiểm soát linh khí vạn giới - Duyệt lãm tiên thư xuất thế</p>
        <div class="header-divider-spirit admin">
          <div class="dot"></div>
        </div>
      </div>

      <section class="filters-aura-section animate-fadeIn">
        <StoryFiltersSection
          :categories="categories"
          :initial-filters="filters"
          @apply-filters="handleApplyFilters"
          @clear-filters="handleClearFilters"
        />
      </section>

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

      <section class="pagination-aura-area">
        <PaginationSection
          v-if="storyStore.adminStoriesPagination.total_pages > 1"
          :current-page="storyStore.adminStoriesPagination.current_page"
          :total-pages="storyStore.adminStoriesPagination.total_pages"
          @goToPage="handleGoToPage"
        />
      </section>

      <BaseModal :is-open="isViewDetailsModalOpen" @close="closeViewDetailsModal" title="Chi Tiết Thiên Thư">
        <div v-if="currentStoryDetails" class="spirit-modal-content">
          <div class="story-details-aura-scroll scrollbar-magic">
            <div class="story-header-layout">
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

              <div class="story-spirit-info-grid">
                <div class="spirit-info-card">
                  <strong>Mã Thần Số</strong>
                  <span>#{{ currentStoryDetails.id }}</span>
                </div>
                <div class="spirit-info-card">
                  <strong>Kiểm Duyệt Ấn</strong>
                  <span :class="['pill-badge-status', getStatusClass(currentStoryDetails.trang_thai_kiem_duyet)]">
                    {{ formatStatus(currentStoryDetails.trang_thai_kiem_duyet) }}
                  </span>
                </div>
                <div class="spirit-info-card">
                  <strong>Trạng Thái Tu Vi</strong>
                  <span class="capitalize text-emerald-400">{{ currentStoryDetails.trang_thai }}</span>
                </div>
                <div class="spirit-info-card">
                  <strong>Căn Cơ Độc Giả</strong>
                  <span class="text-amber-400">{{ formatAgeRating(currentStoryDetails.age_rating) }}</span>
                </div>
                <div class="spirit-info-card full-width">
                  <strong>Linh Khí Nguồn</strong>
                  <a :href="currentStoryDetails.link_nguon" target="_blank" class="source-link truncate">
                    {{ currentStoryDetails.link_nguon || 'Không rõ lai lịch' }}
                  </a>
                </div>
              </div>
            </div>

            <div class="spirit-content-block">
              <h3 class="block-title"><i class="fas fa-book-open text-purple-400 mr-2"></i> Tóm Tắt Bí Tịch</h3>
              <p class="spirit-text-p">{{ currentStoryDetails.mo_ta }}</p>
            </div>

            <div class="spirit-content-block">
              <h3 class="block-title"><i class="fas fa-scroll text-yellow-400 mr-2"></i> Bản Thảo Khai Mở</h3>
              <div v-if="currentStoryDetails.sample_chapter_content" class="chapter-spirit-preview scrollbar-magic">
                <div v-html="currentStoryDetails.sample_chapter_content"></div>
              </div>
              <p v-else class="no-spirit-content">Bản thảo trống không, không thể cảm ứng.</p>
            </div>

            <div class="spirit-content-block admin-aura">
              <h3 class="block-title"><i class="fas fa-pen-fancy text-rose-400 mr-2"></i> Bút Tích Chưởng Quản</h3>
              <textarea v-model="currentStoryDetails.ghi_chu_admin" class="admin-aura-textarea" rows="2" placeholder="Ghi lại nhận định của bạn tại đây..."></textarea>
            </div>
          </div>

          <div class="modal-spirit-actions">
            <button @click="closeViewDetailsModal" class="btn-spirit-action cancel">Đóng Tàng Kinh Các</button>
            <div class="action-group-right">
              <button @click="submitApproval('tu_choi')" class="btn-spirit-action reject">
                 <i class="fas fa-ban"></i> Phong Ấn
              </button>
              <button @click="submitApproval('duyet')" class="btn-spirit-action approve">
                 <i class="fas fa-check-circle"></i> Duyệt Thiên Thư
              </button>
            </div>
          </div>
        </div>
        <div v-else class="spirit-loading-modal">
          <div class="yin-yang-spinner"></div>
          <p>Đang thỉnh thiên thư...</p>
        </div>
      </BaseModal>

      <BaseModal :is-open="isChapterModalOpen" @close="closeChapterModal" title="Quản Lý Tầng Chương">
        <div class="chapter-spirit-management-box">
          <div v-if="loadingChapters" class="spirit-loading-modal">
            <div class="yin-yang-spinner"></div>
            <p>Đang quét thần thức qua các chương...</p>
          </div>
          
          <div v-else-if="!currentStoryChapters || currentStoryChapters.length === 0" class="no-spirit-content empty-chapters">
            <i class="fas fa-wind text-4xl mb-3 opacity-50"></i>
            <p>Bí tịch này chưa được khai phá tầng chương nào.</p>
          </div>
          
          <div v-else class="chapter-table-layout">
            <div class="modal-spirit-top-actions">
              <div class="chapter-stats">
                Tổng cộng: <span class="text-emerald-400 font-bold">{{ currentStoryChapters.length }}</span> tầng
              </div>
              <div class="flex gap-3">
                <button @click="toggleChapterSort" class="btn-spirit-action-small sort-btn">
                  <i class="fas" :class="isReversed ? 'fa-sort-numeric-down-alt' : 'fa-sort-numeric-up-alt'"></i>
                  {{ isReversed ? 'Cũ Nhất' : 'Mới Nhất' }}
                </button>
                <button @click="handleApproveAllChapters" class="btn-spirit-action-small approve" :disabled="loadingChapters">
                    <i class="fas fa-check-double mr-2"></i> Đại Xá
                </button>
              </div>
            </div>

            <div class="spirit-table-wrapper-scroll scrollbar-magic">
                <table class="xianxia-admin-table">
                    <thead>
                        <tr>
                            <th class="w-16 text-center">Tầng</th>
                            <th>Tiêu Đề</th>
                            <th class="w-32 text-center">Ngày Tụ Linh</th>
                            <th class="w-24 text-center">Trạng Thái</th>
                            <th class="w-32 text-center">Pháp Quyết</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="chapter in displayChapters" :key="chapter.id" class="spirit-row">
                            <td class="text-center font-black text-purple-400">{{ chapter.so_chuong }}</td>
                            <td class="font-medium text-slate-200">
                                {{ chapter.tieu_de }}
                                <i v-if="chapter.trang_thai === 'tu_choi' && chapter.ly_do_tu_choi" 
                                   class="fas fa-exclamation-triangle text-rose-500 ml-2" 
                                   :title="chapter.ly_do_tu_choi"></i>
                            </td>
                            <td class="text-center text-xs text-slate-400">{{ formatDate(chapter.thoi_gian_dang) }}</td>
                            <td class="text-center">
                                <span :class="['pill-badge-status small', getStatusClass(chapter.trang_thai || 'cho_duyet')]">
                                    {{ formatChapterStatus(chapter.trang_thai || 'cho_duyet') }}
                                </span>
                            </td>
                            <td class="actions-cell-spirit">
                                <div class="btn-group-spirit">
                                    <button @click="openChapterDetail(chapter)" class="btn-mini view" title="Xem Nội Dung"><i class="fas fa-eye"></i></button>
                                    <button v-if="chapter.trang_thai !== 'duyet'" @click="handleApproveChapter(chapter.id)" class="btn-mini approve" title="Duyệt"><i class="fas fa-check"></i></button>
                                    <button v-if="chapter.trang_thai !== 'tu_choi'" @click="promptRejectChapter(chapter.id)" class="btn-mini reject" title="Từ chối"><i class="fas fa-times"></i></button>
                                    <button @click="handleDeleteChapterAdmin(chapter.id)" class="btn-mini delete" title="Xóa vĩnh viễn"><i class="fas fa-trash-can"></i></button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
          </div>
        </div>
      </BaseModal>

      <BaseModal :is-open="isChapterDetailModalOpen" @close="isChapterDetailModalOpen = false" title="Chi Tiết Chương">
        <div class="spirit-modal-content" v-if="selectedChapter">
           <h3 class="text-xl text-purple-400 font-bold mb-4 border-b border-purple-500/20 pb-2">
             Tầng {{ selectedChapter.so_chuong }}: {{ selectedChapter.tieu_de }}
           </h3>
           
           <div class="chapter-spirit-preview scrollbar-magic" v-html="selectedChapter.noi_dung || 'Chưa thể tải nội dung tầng này.'"></div>
           
           <div v-if="selectedChapter.ly_do_tu_choi" class="mt-4 p-4 bg-rose-900/20 border border-rose-500/30 rounded-xl">
               <h4 class="text-rose-400 font-bold text-sm mb-1"><i class="fas fa-exclamation-circle"></i> Thiên Âm Khiển Trách (Lý do phong ấn):</h4>
               <p class="text-rose-200/80 text-sm">{{ selectedChapter.ly_do_tu_choi }}</p>
           </div>

           <div class="modal-spirit-actions mt-4">
              <button @click="isChapterDetailModalOpen = false" class="btn-spirit-action cancel">Đóng Lại</button>
              <div class="action-group-right">
                <button v-if="selectedChapter.trang_thai !== 'tu_choi'" @click="promptRejectChapter(selectedChapter.id)" class="btn-spirit-action reject">Phong Ấn</button>
                <button v-if="selectedChapter.trang_thai !== 'duyet'" @click="handleApproveChapter(selectedChapter.id)" class="btn-spirit-action approve">Duyệt Chương</button>
              </div>
           </div>
        </div>
      </BaseModal>

      <BaseModal :is-open="isRejectPromptOpen" @close="isRejectPromptOpen = false" title="Phong Ấn Tầng Chương">
        <div class="spirit-modal-content p-4">
          <p class="mb-3 text-slate-300">Vui lòng để lại thiên âm (lý do) để đạo hữu sửa đổi:</p>
          <textarea v-model="rejectReasonText" class="admin-aura-textarea" rows="4" placeholder="Nội dung vi phạm, sai chính tả..."></textarea>
          
          <div class="modal-spirit-actions mt-4">
            <button @click="isRejectPromptOpen = false" class="btn-spirit-action cancel">Hủy Yếu Quyết</button>
            <button @click="submitRejectChapter" class="btn-spirit-action reject" :disabled="!rejectReasonText.trim()">
              <i class="fas fa-gavel"></i> Phán Quyết
            </button>
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
  page: 1, limit: 10, trang_thai_kiem_duyet: '', keyword: '', author_id: null, category_id: null,
});

const isViewDetailsModalOpen = ref(false);
const currentStoryDetails = ref<any>(null); 
const categories = ref<any[]>([]);

const fetchStories = () => { storyStore.fetchAdminStories(filters.value); };

onMounted(async () => {
  fetchStories();
  if (categoryStore.categories.length === 0) await categoryStore.fetchCategories();
  categories.value = categoryStore.categories;
});

watch(() => filters.value.trang_thai_kiem_duyet, () => fetchStories());
watch(() => filters.value.keyword, () => fetchStories());
watch(() => filters.value.category_id, () => fetchStories());
watch(() => filters.value.page, () => fetchStories());

const handleApplyFilters = (newFilters: any) => { filters.value = { ...filters.value, ...newFilters, page: 1 }; };
const handleClearFilters = () => { filters.value = { page: 1, limit: 10, trang_thai_kiem_duyet: '', keyword: '', author_id: null, category_id: null }; };
const handleGoToPage = (page: number) => { filters.value.page = page; };

// --- Chi tiết truyện ---
const handleViewDetails = async (storyId: number) => {
  isViewDetailsModalOpen.value = true;
  currentStoryDetails.value = null; 
  try {
    const story = await storyStore.fetchStoryById(storyId); 
    if (story) currentStoryDetails.value = { ...story, anh_bia_url: getImageUrl(story.anh_bia) };
    else { toast.error("Không tìm thấy thiên thư."); isViewDetailsModalOpen.value = false; }
  } catch (error) {
    toast.error("Thiên cơ nhiễu loạn, không thể tải dữ liệu.");
    isViewDetailsModalOpen.value = false;
  }
};
const closeViewDetailsModal = () => { isViewDetailsModalOpen.value = false; currentStoryDetails.value = null; };

// --- Quản lý Chương ---
const chapterStore = useChapterStore();
const isChapterModalOpen = ref(false);
const currentStoryChapters = computed(() => chapterStore.chapterList);
const loadingChapters = computed(() => chapterStore.loading);
const currentStoryIdForChapters = ref<number | null>(null);

// Xử lý đảo ngược danh sách chương
const isReversed = ref(true); // Mặc định hiển thị Mới Nhất lên đầu
const displayChapters = computed(() => {
  if (!currentStoryChapters.value) return [];
  const arr = [...currentStoryChapters.value];
  return isReversed.value ? arr.reverse() : arr;
});
const toggleChapterSort = () => { isReversed.value = !isReversed.value; };

const handleManageChapters = async (storyId: number) => {
  currentStoryIdForChapters.value = storyId;
  isChapterModalOpen.value = true;
  await chapterStore.fetchAdminChapterList(storyId);
};
const closeChapterModal = () => { isChapterModalOpen.value = false; currentStoryIdForChapters.value = null; };

// Xem chi tiết một chương
const isChapterDetailModalOpen = ref(false);
const selectedChapter = ref<any>(null);
const openChapterDetail = async (chapter: any) => {
  // Nếu API list chương không trả về noi_dung, bạn cần fetch lại chi tiết chương ở đây.
  if (!chapter.noi_dung) {
    try {
      selectedChapter.value = await chapterStore.fetchChapterById(chapter.id);
    } catch (error) {
       toast.error("Thiên cơ bị che khuất, không thể tải nội dung tầng chương này.");
       return;
    }
  } else {
    selectedChapter.value = chapter; 
  }
  isChapterDetailModalOpen.value = true;
};

// Duyệt và Từ chối
const handleApproveChapter = async (id: number) => {
  if (confirm('Duyệt tầng chương này cho phép đạo hữu vạn giới tiếp cận?')) {
    await chapterStore.approveChapter(id, 'duyet');
    if (currentStoryIdForChapters.value) await chapterStore.fetchAdminChapterList(currentStoryIdForChapters.value);
    if (selectedChapter.value && selectedChapter.value.id === id) isChapterDetailModalOpen.value = false;
  }
};

// Xử lý Modal Từ chối chương kèm lý do
const isRejectPromptOpen = ref(false);
const rejectReasonText = ref('');
const rejectingChapterId = ref<number | null>(null);

const promptRejectChapter = (id: number) => {
  rejectingChapterId.value = id;
  rejectReasonText.value = '';
  isRejectPromptOpen.value = true;
};

const submitRejectChapter = async () => {
  if (rejectingChapterId.value && rejectReasonText.value.trim()) {
    // Đảm bảo store approveChapter hỗ trợ param thứ 3 (reason)
    await chapterStore.approveChapter(rejectingChapterId.value, 'tu_choi', rejectReasonText.value);
    if (currentStoryIdForChapters.value) await chapterStore.fetchAdminChapterList(currentStoryIdForChapters.value);
    
    // Đóng các modal liên quan
    isRejectPromptOpen.value = false;
    if (selectedChapter.value && selectedChapter.value.id === rejectingChapterId.value) {
        isChapterDetailModalOpen.value = false;
    }
  }
};

const handleDeleteChapterAdmin = async (id: number) => {
  if (confirm('Cảnh báo: Làm biến mất vĩnh viễn tầng chương này?')) {
    await chapterStore.deleteChapter(id);
    if (currentStoryIdForChapters.value) await chapterStore.fetchAdminChapterList(currentStoryIdForChapters.value);
  }
};

const handleApproveAllChapters = async () => {
  if (currentStoryIdForChapters.value && confirm('Đại xá: Duyệt toàn bộ tầng chương của bí tịch này?')) {
    await chapterStore.approveAllChapters(currentStoryIdForChapters.value);
  }
};

// --- Quản lý Duyệt Truyện ---
const executeStoryApproval = async (storyId: number, action: 'duyet' | 'tu_choi') => {
  const msg = action === 'duyet' ? 'Khai mở bí tịch này cho vạn giới?' : 'Phong ấn bí tịch này vào hư không?';
  if (confirm(msg)) {
    try {
      await storyStore.approveOrRejectStory(storyId, action);
      if (isViewDetailsModalOpen.value && currentStoryDetails.value?.id === storyId) closeViewDetailsModal();
      fetchStories(); 
      toast.success(action === 'duyet' ? "Đã duyệt thiên thư!" : "Đã phong ấn bí tịch.");
    } catch (error) { toast.error("Pháp lực không đủ, thao tác thất bại."); }
  }
};
const handleApproveStory = (storyId: number) => executeStoryApproval(storyId, 'duyet');
const handleRejectStory = (storyId: number) => executeStoryApproval(storyId, 'tu_choi');
const submitApproval = async (action: 'duyet' | 'tu_choi') => {
  if (!currentStoryDetails.value?.id) return;
  await executeStoryApproval(currentStoryDetails.value.id, action);
};

const handleDeleteStory = async (id: number) => {
  if (confirm('CẢNH BÁO: Hủy diệt vĩnh viễn bí tịch này khỏi càn khôn? Mọi chương sẽ biến mất!')) {
    try { await storyStore.deleteStory(id); fetchStories(); toast.success("Đã hủy diệt."); } 
    catch (error) { toast.error("Không thể thực hiện hủy diệt."); }
  }
};

// --- Utils ---
const getStatusClass = (s: string) => ({ 'approved': s === 'duyet' || s === 'da_duyet', 'pending': s === 'cho_duyet', 'rejected': s === 'tu_choi' });
const formatStatus = (s: string) => ({ 'duyet': 'Đã Duyệt', 'cho_duyet': 'Đợi Lệnh', 'tu_choi': 'Phong Ấn' }[s] || s);
const formatChapterStatus = (s: string) => ({ 'da_duyet': 'Đã Duyệt', 'duyet': 'Đã Duyệt', 'cho_duyet': 'Chờ Duyệt', 'tu_choi': 'Phong Ấn' }[s] || s);
const formatAgeRating = (v: number) => ({ 1: "Phổ Thông", 2: "13+", 3: "18+" }[v] || "Không Rõ");
const formatDate = (d: string | undefined) => d ? new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'N/A';
const handleModalImageError = (e: Event) => { (e.target as HTMLImageElement).style.display = 'none'; };
</script>

<style scoped>
/* ===== CORE THEME ADMIN XIANXIA ===== */
.admin-story-management-page-xianxia {
  min-height: 100vh;
  background: #05080f;
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
  padding-bottom: 60px;
}

.admin-story-container-aura {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* Page Header */
.page-title-glow-admin {
  font-size: 2.5rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 4px;
  background: linear-gradient(to right, #34d399, #fff, #34d399);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  filter: drop-shadow(0 0 15px rgba(168, 85, 247, 0.4));
  margin-bottom: 5px;
}

.page-subtitle {
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.85rem;
  font-weight: 700;
  text-align: center;
}

.header-divider-spirit {
  height: 1px;
  width: 200px;
  background: linear-gradient(90deg, transparent, #a855f7, transparent);
  margin: 15px auto 40px;
  position: relative;
}
.header-divider-spirit .dot {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);
  width: 6px; height: 6px; background: #a855f7; box-shadow: 0 0 10px #a855f7;
}

/* Custom Scrollbar (Linh Mạch) */
.scrollbar-magic::-webkit-scrollbar { width: 6px; height: 6px; }
.scrollbar-magic::-webkit-scrollbar-track { background: #0b0f19; border-radius: 10px; }
.scrollbar-magic::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
.scrollbar-magic::-webkit-scrollbar-thumb:hover { background: #a855f7; }

/* ===== MODAL CHUNG ===== */
.spirit-modal-content {
  display: flex;
  flex-direction: column;
  max-height: 85vh; 
}

.story-details-aura-scroll {
  overflow-y: auto;
  padding: 10px 20px 20px 10px;
  flex-grow: 1;
}

.story-header-layout {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}

.cover-glow-container {
  flex-shrink: 0;
  width: 160px;
  height: 240px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(168, 85, 247, 0.4);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 20px rgba(168, 85, 247, 0.2);
  background: #131b2c;
}

.story-cover-spirit-large { width: 100%; height: 100%; object-fit: cover; }

/* Grid Thông tin dạng Card */
.story-spirit-info-grid {
  flex-grow: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  align-content: start;
}

.spirit-info-card {
  background: rgba(11, 15, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}
.spirit-info-card.full-width { grid-column: span 2; }
.spirit-info-card strong { color: #94a3b8; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; }
.spirit-info-card span, .source-link { color: #f8fafc; font-size: 0.95rem; font-weight: 700; }
.source-link:hover { color: #a855f7; text-decoration: underline; }

/* Pill Status */
.pill-badge-status {
  display: inline-block; padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; text-align: center;
}
.pill-badge-status.small { padding: 3px 8px; font-size: 0.7rem; }
.pill-badge-status.approved { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.5); color: #34d399; }
.pill-badge-status.pending { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.5); color: #fbbf24; }
.pill-badge-status.rejected { background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.5); color: #f43f5e; }

/* Blocks Nội dung */
.spirit-content-block {
  background: rgba(11, 15, 25, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.block-title { font-size: 1rem; font-weight: 800; color: #cbd5e1; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 8px;}
.spirit-text-p { line-height: 1.7; color: #cbd5e1; font-size: 0.95rem; }

.chapter-spirit-preview {
  max-height: 400px; 
  overflow-y: auto; 
  background: #080b14; 
  padding: 20px; 
  border-radius: 8px; 
  line-height: 1.8;
  font-size: 0.95rem;
  color: #e2e8f0;
  border: 1px solid #1e293b;
  white-space: pre-wrap;
}

/* Textarea dùng chung */
.admin-aura-textarea {
  width: 100%; background: #080b14; border: 1px solid #334155; border-radius: 8px;
  padding: 12px; color: #fff; outline: none; font-family: inherit; resize: vertical;
}
.admin-aura-textarea:focus { border-color: #a855f7; box-shadow: 0 0 10px rgba(168, 85, 247, 0.2); }

/* Modal Actions (Bottom) */
.modal-spirit-actions {
  display: flex; justify-content: space-between; align-items: center; 
  padding: 20px 10px 0; border-top: 1px solid #1e293b;
  background: #0b0f19;
}
.action-group-right { display: flex; gap: 15px; }

.btn-spirit-action {
  padding: 10px 24px; border-radius: 10px; font-weight: 800; font-size: 0.9rem; cursor: pointer; transition: all 0.3s;
  display: flex; align-items: center; gap: 8px;
}
.btn-spirit-action:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-spirit-action.approve { background: linear-gradient(135deg, #10b981, #059669); color: #0b0f19; border: none; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
.btn-spirit-action.approve:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-2px); }
.btn-spirit-action.reject { background: rgba(244, 63, 94, 0.1); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.5); }
.btn-spirit-action.reject:hover:not(:disabled) { background: #f43f5e; color: #fff; }
.btn-spirit-action.cancel { background: transparent; color: #94a3b8; border: 1px solid #334155; }
.btn-spirit-action.cancel:hover { background: rgba(255,255,255,0.05); color: #fff; }

/* ===== MODAL 2: BẢNG CHƯƠNG ===== */
.chapter-spirit-management-box {
  display: flex;
  flex-direction: column;
  max-height: 75vh;
}

.modal-spirit-top-actions {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 15px; padding: 0 5px;
}

.btn-spirit-action-small {
  padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; border: none;
}
.btn-spirit-action-small.approve { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
.btn-spirit-action-small.approve:hover:not(:disabled) { background: #10b981; color: #fff; }
.btn-spirit-action-small.sort-btn { background: rgba(168, 85, 247, 0.1); color: #a855f7; border: 1px solid rgba(168, 85, 247, 0.3); }
.btn-spirit-action-small.sort-btn:hover { background: #a855f7; color: #fff; }

.chapter-table-layout { display: flex; flex-direction: column; overflow: hidden; }

.spirit-table-wrapper-scroll {
  overflow-y: auto;
  border: 1px solid #1e293b;
  border-radius: 12px;
  background: #0b0f19;
}

.xianxia-admin-table { width: 100%; border-collapse: collapse; }
.xianxia-admin-table th { 
  padding: 12px 15px; 
  font-size: 0.75rem; 
  text-transform: uppercase; 
  color: #a855f7; 
  font-weight: 800;
  background: #131b2c; 
  position: sticky; 
  top: 0; 
  z-index: 10;
  border-bottom: 2px solid #1e293b;
}

.spirit-row { border-bottom: 1px solid rgba(255,255,255,0.02); transition: background 0.2s; }
.spirit-row:hover { background: rgba(168, 85, 247, 0.05); }
.spirit-row td { padding: 12px 15px; vertical-align: middle; }

/* Buttons Mini trong Bảng */
.btn-group-spirit { display: flex; justify-content: center; gap: 6px; }
.btn-mini { width: 32px; height: 32px; border-radius: 6px; border: none; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; font-size: 0.85rem;}
.btn-mini.view { background: rgba(56, 189, 248, 0.1); color: #38bdf8; }
.btn-mini.view:hover { background: #38bdf8; color: #fff; }
.btn-mini.approve { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.btn-mini.approve:hover { background: #10b981; color: #fff; }
.btn-mini.reject { background: rgba(245, 158, 11, 0.1); color: #fbbf24; }
.btn-mini.reject:hover { background: #fbbf24; color: #fff; }
.btn-mini.delete { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }
.btn-mini.delete:hover { background: #f43f5e; color: #fff; }

/* Trạng thái Loading / Trống */
.spirit-loading-modal { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 50px 0; color: #a855f7; }
.yin-yang-spinner { width: 40px; height: 40px; border: 4px solid rgba(168, 85, 247, 0.2); border-top-color: #a855f7; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 15px; }
.empty-chapters { text-align: center; padding: 60px 0; color: #64748b; }

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.4s ease-out; }

/* Responsive */
@media (max-width: 900px) {
  .story-header-layout { flex-direction: column; align-items: center; }
  .story-spirit-info-grid { width: 100%; }
}
@media (max-width: 640px) {
  .story-spirit-info-grid { grid-template-columns: 1fr; }
  .spirit-info-card.full-width { grid-column: span 1; }
  .modal-spirit-actions { flex-direction: column-reverse; gap: 15px; }
  .action-group-right { width: 100%; flex-direction: column; }
  .btn-spirit-action { width: 100%; justify-content: center; }
}
</style>