<template>
  <div class="author-chapter-management-page">
    <main class="author-chapter-management-container">
      <div class="header-section">
        <button @click="goBack" class="back-btn">
          <i class="fas fa-arrow-left"></i> Quay lại
        </button>
        <h1 class="page-title">Quản lý Chương</h1>
      </div>

      <div v-if="loadingStory" class="loading-story">Đang tải thông tin truyện...</div>
      <div v-else-if="story" class="story-context">
        <h2 class="story-title">Truyện: {{ story.ten_truyen }}</h2>
        <div class="actions">
             <button @click="goToAddChapter" class="add-chapter-btn">
                <i class="fas fa-plus"></i> Thêm Chương Mới
             </button>
        </div>
      </div>

      <div v-if="loadingChapters" class="loading-chapters">
        <div class="spinner"></div> Đang tải danh sách chương...
      </div>
      
      <div v-else-if="chapters.length === 0" class="no-data">
        <p>Chưa có chương nào.</p>
      </div>

      <div v-else class="table-responsive">
        <table class="chapter-table">
          <thead>
            <tr>
              <th>Số chương</th>
              <th>Tên chương</th>
              <th>Ngày tạo</th>
              <th>Lượt xem</th>
               <!-- Add status if chapters have approval status -->
              <th class="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="chapter in paginatedChapters" :key="chapter.id" class="chapter-row">
              <td>{{ chapter.so_chuong }}</td>
               <td>{{ chapter.tieu_de }}</td>
               <td>{{ formatDate(chapter.thoi_gian_dang) }}</td>
               <td>0</td> <!-- Placeholder if views not in API -->
               <td class="text-center actions-cell">
                 <button @click="handleEditChapter(chapter.id)" class="action-btn edit-btn" title="Sửa">
                   <i class="fas fa-edit"></i>
                 </button>
                 <button @click="handleDeleteChapter(chapter.id)" class="action-btn delete-btn" title="Xóa">
                   <i class="fas fa-trash-alt"></i>
                 </button>
               </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="pagination-controls">
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

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
};

const goBack = () => {
    router.push({ name: 'AuthorStoryManagement' });
};

const goToAddChapter = () => {
    router.push(`/author/story/${storyId}/chapter/add`);
};

const handleEditChapter = (chapterId: number) => {
    router.push(`/author/story/${storyId}/chapter/${chapterId}/edit`);
};

const handleDeleteChapter = async (chapterId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa chương này?')) {
        try {
            await chapterStore.deleteChapter(chapterId); // Ensure this action exists
            showSuccessToast('Xóa chương thành công');
            await chapterStore.fetchChapterList(storyId);
        } catch (error: any) {
            showErrorToast(error.message || 'Xóa chương thất bại');
        }
    }
};

onMounted(async () => {
    if (!storyId) {
        showErrorToast('Story ID missing');
        goBack();
        return;
    }
    await storyStore.fetchStoryById(storyId);
    await chapterStore.fetchChapterList(storyId);
});
</script>

<style scoped>
.author-chapter-management-page {
    min-height: 100vh;
    background: #1a1d29;
    color: #e0e0e0;
    display: flex;
    flex-direction: column;
    font-family: 'Manrope', sans-serif;
}

.author-chapter-management-container {
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    width: 100%;
}

.header-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
}

.back-btn {
    background: transparent;
    border: 1px solid #4ade80;
    color: #4ade80;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
}

.back-btn:hover {
    background: rgba(74, 222, 128, 0.1);
}

.page-title {
    font-size: 2rem;
    color: #22c55e;
    font-weight: 800;
}

.story-context {
    background: rgba(255, 255, 255, 0.05);
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.story-title {
    font-size: 1.5rem;
    color: white;
}

.add-chapter-btn {
    background: #22c55e;
    color: white;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background 0.2s;
}

.add-chapter-btn:hover {
    background: #16a34a;
}

.chapter-table {
    width: 100%;
    border-collapse: collapse;
    background: rgba(36, 40, 52, 0.5);
    border-radius: 8px;
    overflow: hidden;
}

.chapter-table th, .chapter-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chapter-table th {
    background: rgba(0, 0, 0, 0.2);
    color: #4ade80;
    font-weight: 700;
}

.chapter-row:hover {
    background: rgba(255, 255, 255, 0.02);
}

.actions-cell {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
}

.action-btn {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.edit-btn {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
}

.edit-btn:hover {
    background: rgba(59, 130, 246, 0.2);
}

.delete-btn {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

.delete-btn:hover {
    background: rgba(239, 68, 68, 0.2);
}

.no-data {
    text-align: center;
    padding: 3rem;
    color: #6b7280;
    font-style: italic;
}

.spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top: 2px solid #22c55e;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 0.5rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
    .story-context {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
}

.pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    padding-bottom: 2rem;
}

.pagination-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
    background: #22c55e;
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination-info {
    color: #9ca3af;
    font-size: 0.9rem;
}
</style>
