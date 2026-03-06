<template>
  <div class="author-chapter-management-page-xianxia">
    <main class="author-chapter-container-spirit">
      
      <div class="header-section-spirit animate-fadeIn">
        <button @click="goBack" class="back-btn-spirit">
          <i class="fas fa-arrow-left"></i> Về Động Phủ
        </button>
        <h1 class="page-title-spirit">Quản Lý Tầng Chương</h1>
      </div>

      <div v-if="loadingStory" class="spirit-loading-box animate-fadeIn">
        <div class="yin-yang-spinner"></div>
        <p>Đang cảm ứng thông tin bí tịch...</p>
      </div>

      <div v-else-if="story" class="story-context-aura animate-fadeIn">
        <div class="story-info-group">
          <div>
            <span class="context-label">Đang quản lý bí tịch:</span>
            <h2 class="story-title-glow">{{ story.ten_truyen }}</h2>
          </div>
        </div>
        <div class="actions-group-spirit">
           <button @click="isReverseOrder = !isReverseOrder" class="btn-spirit-secondary mr-3">
              <i :class="['fas', isReverseOrder ? 'fa-sort-numeric-down-alt' : 'fa-sort-numeric-up']"></i>
              {{ isReverseOrder ? 'Mới Nhất' : 'Cũ Nhất' }}
           </button>
           <button @click="goToAddChapter" class="btn-spirit-primary">
              <i class="fas fa-scroll mr-2"></i> Chương Mới
           </button>
        </div>
      </div>

      <div v-if="loadingChapters" class="spirit-loading-box py-12 animate-fadeIn">
        <div class="yin-yang-spinner"></div> 
        <p>Đang quét thần thức qua các chương...</p>
      </div>
      
      <div v-else-if="chapters.length === 0" class="no-spirit-data animate-fadeIn">
        <i class="fas fa-wind"></i>
        <p>Bí tịch này chưa có tầng chương nào được khai phá.</p>
      </div>

      <div v-else class="spirit-table-wrapper scrollbar-magic animate-fadeIn">
        <table class="xianxia-table">
          <thead>
            <tr>
              <th class="w-20 text-center">Tầng Số</th>
              <th>Tiêu Đề Tầng</th>
              <th class="w-32 text-center">Ngày Tụ Linh</th>
              <th class="w-28 text-center">Tụ Khí (Views)</th>
              <th class="w-28 text-center">Pháp Quyết</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="chapter in paginatedChapters" :key="chapter.id" class="spirit-row">
              <td class="text-center font-black text-emerald-400">{{ chapter.so_chuong }}</td>
              <td class="font-medium text-slate-200">{{ chapter.tieu_de }}</td>
              <td class="text-center text-xs text-slate-400">{{ formatDate(chapter.thoi_gian_dang) }}</td>
              <td class="text-center font-bold text-slate-300">
                <i class="fas fa-eye text-emerald-500/50 mr-1"></i> {{ chapter.luot_xem || 0 }}
              </td>
              <td class="actions-cell-spirit text-center">
                 <div class="btn-group-spirit">
                   <button @click="handleEditChapter(chapter.id)" class="btn-mini edit" title="Chỉnh sửa bản thảo">
                     <i class="fas fa-pen-nib"></i>
                   </button>
                   <button @click="handleDeleteChapter(chapter.id)" class="btn-mini delete" title="Xóa bỏ tầng này">
                     <i class="fas fa-trash-can"></i>
                   </button>
                 </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="pagination-aura-controls animate-fadeIn">
           <button 
               @click="changePage(currentPage - 1)" 
               :disabled="currentPage === 1"
               class="pagination-spirit-btn"
           >
               <i class="fas fa-chevron-left"></i>
           </button>
           
           <span class="pagination-spirit-info">Tầng {{ currentPage }} / {{ totalPages }}</span>
           
           <button 
               @click="changePage(currentPage + 1)" 
               :disabled="currentPage === totalPages"
               class="pagination-spirit-btn"
           >
               <i class="fas fa-chevron-right"></i>
           </button>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStoryStore } from '@/modules/storyText/story.store';
import { useChapterStore } from '@/modules/storyText/chapter/chapter.store';
import { useAppToast } from '@/composables/useAppToast';

const route = useRoute();
const router = useRouter();
const storyStore = useStoryStore();
const chapterStore = useChapterStore();
const { showSuccessToast, showErrorToast } = useAppToast();

const storyId = Number(route.params.storyId);
const story = computed(() => storyStore.currentStory);
const loadingStory = computed(() => storyStore.loading);
const chapters = computed(() => chapterStore.chapterList);
const loadingChapters = computed(() => chapterStore.loading);

// Sorting & Pagination Logic
const isReverseOrder = ref(false);
const currentPage = ref(1);
const itemsPerPage = 20;

const sortedChapters = computed(() => {
    const list = [...chapters.value];
    if (isReverseOrder.value) {
        return list.reverse();
    }
    return list;
});

const paginatedChapters = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedChapters.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(sortedChapters.value.length / itemsPerPage));

const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const goBack = () => {
    router.push({ name: 'AuthorDashboard' });
};

const goToAddChapter = () => {
    router.push(`/author/story/${storyId}/chapter/add`);
};

const handleEditChapter = (chapterId: number) => {
    router.push(`/author/story/${storyId}/chapter/${chapterId}/edit`);
};

const handleDeleteChapter = async (chapterId: number) => {
    if (confirm('Cảnh báo: Bạn có chắc chắn muốn hủy diệt chương này? Hành động không thể phục hồi!')) {
        try {
            await chapterStore.deleteChapter(chapterId); 
            showSuccessToast('Đã hủy diệt chương thành công.');
            await chapterStore.fetchChapterList(storyId);
            // Kiểm tra và lùi trang nếu trang hiện tại bị trống sau khi xóa
            if (paginatedChapters.value.length === 0 && currentPage.value > 1) {
                currentPage.value--;
            }
        } catch (error: any) {
            showErrorToast(error.message || 'Thiên cơ nhiễu loạn, xóa thất bại.');
        }
    }
};

onMounted(async () => {
    if (!storyId) {
        showErrorToast('Không tìm thấy thông tin bí tịch.');
        goBack();
        return;
    }
    await storyStore.fetchStoryById(storyId);
    await chapterStore.fetchChapterList(storyId);
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap");

.author-chapter-management-page-xianxia {
    min-height: 100vh;
    background: #0b0f19;
    background-image: radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 60%);
    color: #cbd5e1;
    display: flex;
    flex-direction: column;
    font-family: 'Be Vietnam Pro', sans-serif;
}

.author-chapter-container-spirit {
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    width: 100%;
}

/* HEADER KHU VỰC */
.header-section-spirit {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 30px;
}

.back-btn-spirit {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #94a3b8;
    padding: 8px 20px;
    border-radius: 50px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
}

.back-btn-spirit:hover {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.4);
    color: #34d399;
    transform: translateX(-5px);
}

.page-title-spirit {
    font-size: 2rem;
    color: #f8fafc;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0;
    text-shadow: 0 0 15px rgba(52, 211, 153, 0.2);
}

/* STORY CONTEXT (BẢNG NGỌC) */
.story-context-aura {
    background: rgba(11, 15, 25, 0.6);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(52, 211, 153, 0.2);
    padding: 25px 30px;
    border-radius: 20px;
    margin-bottom: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}

.story-info-group {
    display: flex;
    align-items: center;
}

.context-label {
    display: block;
    font-size: 0.8rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
    margin-bottom: 4px;
}

.story-title-glow {
    font-size: 1.6rem;
    color: #fff;
    font-weight: 800;
    margin: 0;
    text-shadow: 0 0 10px rgba(255,255,255,0.2);
}

.btn-spirit-primary {
    background: linear-gradient(135deg, #10b981, #059669);
    color: #0b0f19;
    padding: 12px 25px;
    border-radius: 12px;
    border: none;
    font-weight: 800;
    font-size: 0.95rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.btn-spirit-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.5);
    background: linear-gradient(135deg, #34d399, #10b981);
}

.btn-spirit-secondary {
    background: rgba(30, 41, 59, 0.5);
    color: #94a3b8;
    padding: 10px 20px;
    border-radius: 12px;
    border: 1px solid #334155;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s;
}

.btn-spirit-secondary:hover {
    background: rgba(51, 65, 85, 0.8);
    color: #f8fafc;
    border-color: #475569;
}

.actions-group-spirit {
    display: flex;
    align-items: center;
    gap: 20px;
}

/* BẢNG CHƯƠNG (TABLE) */
.spirit-table-wrapper {
    background: #131b2c;
    border-radius: 20px;
    border: 1px solid #1e293b;
    overflow-x: auto;
    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}

.scrollbar-magic::-webkit-scrollbar { height: 6px; }
.scrollbar-magic::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
.scrollbar-magic::-webkit-scrollbar-thumb { background: rgba(52, 211, 153, 0.3); border-radius: 10px; }
.scrollbar-magic::-webkit-scrollbar-thumb:hover { background: rgba(52, 211, 153, 0.6); }

.xianxia-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 700px;
}

.xianxia-table th {
    background: rgba(11, 15, 25, 0.8);
    color: #34d399;
    padding: 16px 20px;
    text-align: left;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 0.8rem;
    border-bottom: 2px solid #1e293b;
    white-space: nowrap;
}

.spirit-row td {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    vertical-align: middle;
    transition: background 0.2s;
}

.spirit-row:hover td {
    background: rgba(52, 211, 153, 0.05);
}

/* BUTTONS TRONG BẢNG */
.btn-group-spirit {
    display: flex;
    gap: 8px;
    justify-content: center;
}

.btn-mini {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    font-size: 0.9rem;
}

.btn-mini.edit { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2); }
.btn-mini.edit:hover { background: #3b82f6; color: #fff; transform: scale(1.1); box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4); }

.btn-mini.delete { background: rgba(244, 63, 94, 0.1); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.2); }
.btn-mini.delete:hover { background: #f43f5e; color: #fff; transform: scale(1.1); box-shadow: 0 4px 10px rgba(244, 63, 94, 0.4); }

/* TRẠNG THÁI TRỐNG & LOADING */
.spirit-loading-box, .no-spirit-data {
    text-align: center;
    padding: 60px 20px;
    color: #64748b;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(11, 15, 25, 0.4);
    border-radius: 20px;
    border: 1px dashed #1e293b;
}

.no-spirit-data i { font-size: 3.5rem; color: #34d399; opacity: 0.3; margin-bottom: 15px; }

.yin-yang-spinner {
    width: 40px; height: 40px;
    border: 4px solid rgba(52, 211, 153, 0.2);
    border-top-color: #34d399;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* PHÂN TẦNG (PAGINATION) */
.pagination-aura-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-top: 40px;
}

.pagination-spirit-btn {
    background: #131b2c;
    border: 1px solid #1e293b;
    color: #f8fafc;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
}

.pagination-spirit-btn:hover:not(:disabled) {
    background: rgba(52, 211, 153, 0.1);
    color: #34d399;
    border-color: #34d399;
    box-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
}

.pagination-spirit-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: transparent;
}

.pagination-spirit-info {
    color: #94a3b8;
    font-weight: 700;
    font-size: 0.95rem;
    letter-spacing: 1px;
}

/* ANIMATION */
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }

/* RESPONSIVE */
@media (max-width: 768px) {
    .story-context-aura {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
    }
    .actions-group { width: 100%; }
    .btn-spirit-primary { width: 100%; justify-content: center; }
    .page-title-spirit { font-size: 1.5rem; }
}
</style>