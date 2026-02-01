<template>
  <div class="chapter-editor-page">
    <main class="editor-container">
      <div class="header-section">
        <button @click="goBack" class="back-btn">
          <i class="fas fa-arrow-left"></i> Hủy / Quay lại
        </button>
        <h1 class="page-title">{{ isEditMode ? 'Chỉnh Sửa Chương' : 'Thêm Chương Mới' }}</h1>
      </div>

      <div class="form-card">
          <form @submit.prevent="handleSubmit" class="chapter-form">
              
              <div class="form-group">
                  <label>Tên Chương</label>
                  <input 
                    v-model="form.ten_chuong" 
                    type="text" 
                    placeholder="Ví dụ: Chương 1: Mở đầu"
                    required
                    class="form-input"
                  >
              </div>

               <div class="form-group">
                  <label>Số Chương (Tự động tăng nếu để trống)</label>
                  <input 
                    v-model.number="form.so_chuong" 
                    type="number" 
                    min="1"
                    placeholder="Nhập số chương"
                    class="form-input"
                  >
              </div>

              <div class="form-group">
                  <label>Nội Dung</label>
                   <!-- Simple Textarea for now, could be Rich Text Editor -->
                  <textarea 
                    v-model="form.noi_dung"
                    rows="20"
                    placeholder="Nhập nội dung chương..."
                    required
                    class="form-textarea"
                  ></textarea>
              </div>

              <div class="form-actions">
                  <button type="submit" class="submit-btn" :disabled="loading">
                      <span v-if="loading"><div class="spinner"></div> Đang xử lý...</span>
                      <span v-else>{{ isEditMode ? 'Cập Nhật' : 'Đăng Chương' }}</span>
                  </button>
              </div>
          </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useChapterStore } from '@/modules/storyText/chapter/chapter.store';
import { useAppToast } from '@/composables/useAppToast';

const route = useRoute();
const router = useRouter();
const chapterStore = useChapterStore();
const { showSuccessToast, showErrorToast } = useAppToast();

const isEditMode = computed(() => !!route.params.chapterId);
const storyId = Number(route.params.storyId);
const chapterId = Number(route.params.chapterId);
const loading = ref(false);

const form = ref({
    ten_chuong: '',
    so_chuong: null as number | null,
    noi_dung: ''
});

const goBack = () => {
    router.push(`/author/story/${storyId}/chapters`);
};

const handleSubmit = async () => {
    loading.value = true;
    try {
        const payload = {
            truyen_id: storyId,
            tieu_de: form.value.ten_chuong, // Backend expects 'tieu_de'
            so_chuong: form.value.so_chuong,
            noi_dung: form.value.noi_dung
        };

        if (isEditMode.value) {
            await chapterStore.updateChapter(chapterId, payload);
            showSuccessToast('Cập nhật chương thành công!');
        } else {
            await chapterStore.createChapter(payload);
            showSuccessToast('Thêm chương mới thành công!');
        }
        goBack();
    } catch (error: any) {
        showErrorToast(error.message || 'Có lỗi xảy ra.');
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    if (isEditMode.value) {
        // Fetch existing chapter
        loading.value = true;
        try {
            // Need a getChapterById? or use chapterList. 
            // Often best to have getChapterById API. 
            // If getChapterById doesn't exist, we might scrape from list if available or fetch details.
            // Let's assume fetchFromList is safer for now or we added getChapterById recently?
            // Checking chapter.service.ts... we might need to add getChapterById if not by slug.
            // We have getChapterBySlug. If we have ID, we might not have API for it?
            // Usually we have /api/chuong/:id for edit.
            
            // Wait, we need to load currrent chapter data.
            // I'll assume we can use `getChapterById` or similar. 
            // Since we didn't explicitly add `getChapterById` in prev turns (only getStoryById), 
            // I might need to rely on the list or add it.
            // Actually `chapter.service.ts` has `updateChapter(id, data)` so likely there's a `getOne`?
            // If not, I'll try to find it in the store if loaded, else error.
            
            // Fetch specific chapter directly (works for draft/pending too)
            const found = await chapterStore.fetchChapterById(chapterId);
            
            if (found) {
                form.value.ten_chuong = found.tieu_de || found.ten_chuong; // Backend returns 'tieu_de'
                form.value.so_chuong = found.so_chuong;
                form.value.noi_dung = found.noi_dung;
            } else {
                 showErrorToast("Không tìm thấy thông tin chương.");
            }
        } catch (e) {
             console.error(e);
        } finally {
            loading.value = false;
        }
    } else {
        // New mode - maybe auto-fill next chapter number
        await chapterStore.fetchChapterList(storyId);
        const maxChap = Math.max(...chapterStore.chapterList.map(c => c.so_chuong), 0);
        form.value.so_chuong = maxChap + 1;
    }
});
</script>

<style scoped>
.chapter-editor-page {
    min-height: 100vh;
    background: #1a1d29;
    color: #e0e0e0;
    display: flex;
    flex-direction: column;
    font-family: 'Manrope', sans-serif;
}

.editor-container {
    flex: 1;
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
    width: 100%;
}

.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.back-btn {
    background: transparent;
    border: 1px solid #6b7280;
    color: #9ca3af;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
}

.back-btn:hover {
    border-color: #fff;
    color: #fff;
}

.page-title {
    font-size: 2rem;
    color: #22c55e;
    font-weight: 800;
}

.form-card {
    background: rgba(36, 40, 52, 0.5);
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #4ade80;
    font-weight: 600;
}

.form-input, .form-textarea {
    width: 100%;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 0.8rem;
    color: white;
    font-family: inherit;
    font-size: 1rem;
    transition: border-color 0.2s;
}

.form-input:focus, .form-textarea:focus {
    outline: none;
    border-color: #22c55e;
}

.form-textarea {
    resize: vertical;
    min-height: 400px;
    line-height: 1.6;
}

.submit-btn {
    background: #22c55e;
    color: white;
    width: 100%;
    padding: 1rem;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    justify-content: center;
    align-items: center;
}

.submit-btn:hover:not(:disabled) {
    background: #16a34a;
}

.submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255,255,255,0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 10px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
