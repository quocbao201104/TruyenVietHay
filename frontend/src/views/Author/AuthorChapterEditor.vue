<template>
  <div class="chapter-editor-page-xianxia">
    <main class="editor-container-spirit">
      
      <div class="header-section-spirit animate-fadeIn">
        <button @click="goBack" class="back-btn-spirit">
          <i class="fas fa-arrow-left"></i> Về Động Phủ
        </button>
        <h1 class="page-title-spirit">
          <i class="fas fa-feather-pointed text-emerald-400 mr-3"></i>
          {{ isEditMode ? 'Chỉnh Sửa Pháp Quyết' : 'Khai Mở Tầng Mới' }}
        </h1>
      </div>

      <div class="form-card-aura animate-fadeIn">
        <form @submit.prevent="handleSubmit" class="chapter-form-spirit">
          
          <div class="form-row-grid">
            <div class="form-group-spirit title-group">
              <label><i class="fas fa-heading mr-2"></i> Tên Tầng (Tiêu đề)</label>
              <div class="input-glow-wrapper">
                <input 
                  v-model="form.ten_chuong" 
                  type="text" 
                  placeholder="Ví dụ: Tầng 1: Khởi nguồn linh khí..."
                  required
                  class="form-input-spirit"
                >
              </div>
            </div>

            <div class="form-group-spirit number-group">
              <label><i class="fas fa-hashtag mr-2"></i> Tầng Số</label>
              <div class="input-glow-wrapper">
                <input 
                  v-model.number="form.so_chuong" 
                  type="number" 
                  min="1"
                  placeholder="Tự động tăng..."
                  class="form-input-spirit text-center"
                >
              </div>
            </div>
          </div>

          <div class="form-group-spirit content-group">
            <label class="flex justify-between items-end">
              <span><i class="fas fa-scroll mr-2"></i> Nội Dung Bản Thảo</span>
              <span class="text-xs text-slate-500 font-normal">Hỗ trợ ngắt dòng tự động</span>
            </label>
            <div class="textarea-glow-wrapper">
              <textarea 
                v-model="form.noi_dung"
                rows="25"
                placeholder="Truyền năng lượng vào ngòi bút... Viết ra những dòng thiên cổ..."
                required
                class="form-textarea-spirit scrollbar-magic"
              ></textarea>
            </div>
          </div>

          <div class="form-actions-spirit">
            <button type="submit" class="submit-btn-spirit" :disabled="loading">
              <template v-if="loading">
                <i class="fas fa-yin-yang fa-spin mr-2"></i> Đang phong ấn vào thiên thư...
              </template>
              <template v-else>
                <i class="fas fa-stamp mr-2"></i> {{ isEditMode ? 'Cập Nhật Bản Thảo' : 'Xuất Thế Tầng Này' }}
              </template>
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
            tieu_de: form.value.ten_chuong, 
            so_chuong: form.value.so_chuong,
            noi_dung: form.value.noi_dung
        };

        if (isEditMode.value) {
            await chapterStore.updateChapter(chapterId, payload);
            showSuccessToast('Đã lưu lại chỉnh sửa.');
        } else {
            await chapterStore.createChapter(payload);
            showSuccessToast('Bản thảo đã được gửi lên càn khôn chờ duyệt.');
        }
        goBack();
    } catch (error: any) {
        showErrorToast(error.message || 'Thiên cơ nhiễu loạn, thất bại.');
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    if (isEditMode.value) {
        loading.value = true;
        try {
            const found = await chapterStore.fetchChapterById(chapterId);
            
            if (found) {
                form.value.ten_chuong = found.tieu_de || found.ten_chuong; 
                form.value.so_chuong = found.so_chuong;
                form.value.noi_dung = found.noi_dung;
            } else {
                 showErrorToast("Không tìm thấy thông tin chương này.");
            }
        } catch (e) {
             console.error(e);
        } finally {
            loading.value = false;
        }
    } else {
        await chapterStore.fetchChapterList(storyId);
        const maxChap = Math.max(...chapterStore.chapterList.map(c => c.so_chuong), 0);
        form.value.so_chuong = maxChap + 1;
    }
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap");

.chapter-editor-page-xianxia {
  min-height: 100vh;
  background: #0b0f19;
  background-image: radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 60%);
  color: #cbd5e1;
  display: flex;
  flex-direction: column;
  font-family: 'Be Vietnam Pro', sans-serif;
  padding-bottom: 60px;
}

.editor-container-spirit {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  width: 100%;
}

/* HEADER KHU VỰC */
.header-section-spirit {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
  border-bottom: 1px dashed rgba(52, 211, 153, 0.2);
  padding-bottom: 15px;
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
  background: rgba(244, 63, 94, 0.1);
  border-color: rgba(244, 63, 94, 0.4);
  color: #f43f5e;
  transform: translateX(-5px);
}

.page-title-spirit {
  font-size: 1.8rem;
  color: #f8fafc;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  text-shadow: 0 0 15px rgba(52, 211, 153, 0.2);
}

/* FORM BẢN THẢO (GLASSMORPHISM) */
.form-card-aura {
  background: rgba(11, 15, 25, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 40px;
  border-radius: 20px;
  border: 1px solid rgba(52, 211, 153, 0.2);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
}

.form-row-grid {
  display: grid;
  grid-template-columns: 4fr 1fr; /* Tên dài, số ngắn */
  gap: 20px;
  margin-bottom: 25px;
}

.form-group-spirit {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group-spirit label {
  color: #34d399; /* Emerald Aura */
  font-weight: 800;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Wrappers để làm viền sáng (Glow border) */
.input-glow-wrapper, .textarea-glow-wrapper {
  position: relative;
  border-radius: 12px;
  background: #05080f;
}

.input-glow-wrapper::before, .textarea-glow-wrapper::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 13px;
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.5), transparent);
  z-index: 0;
  opacity: 0;
  transition: opacity 0.3s;
}

.input-glow-wrapper:focus-within::before, .textarea-glow-wrapper:focus-within::before {
  opacity: 1;
}

.form-input-spirit, .form-textarea-spirit {
  width: 100%;
  background: transparent;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 15px 20px;
  color: #f8fafc;
  font-family: inherit;
  font-size: 1.05rem;
  transition: all 0.3s;
  position: relative;
  z-index: 1;
  outline: none;
}

/* Khu vực text rộng rãi, dễ đọc */
.form-textarea-spirit {
  resize: vertical;
  min-height: 500px;
  line-height: 1.8;
  font-size: 1.1rem; /* Chữ to lên chút để dễ soạn thảo */
}

.form-input-spirit:focus, .form-textarea-spirit:focus {
  background: #080b14;
  border-color: transparent; /* Nhường chỗ cho glow wrapper */
}
.form-input-spirit::placeholder, .form-textarea-spirit::placeholder { color: #475569; font-style: italic; }

/* NÚT SUBMIT ẤN CHÚ */
.form-actions-spirit {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px dashed rgba(255,255,255,0.1);
  display: flex;
  justify-content: flex-end;
}

.submit-btn-spirit {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #0b0f19;
  padding: 15px 40px;
  border: none;
  border-radius: 12px;
  font-weight: 900;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.submit-btn-spirit:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(16, 185, 129, 0.6);
  background: linear-gradient(135deg, #34d399, #10b981);
}

.submit-btn-spirit:disabled {
  background: #334155;
  color: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
}

/* Custom Scrollbar cho Textarea */
.scrollbar-magic::-webkit-scrollbar { width: 8px; }
.scrollbar-magic::-webkit-scrollbar-track { background: transparent; }
.scrollbar-magic::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
.scrollbar-magic::-webkit-scrollbar-thumb:hover { background: #34d399; }

/* ANIMATION */
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.6s ease-out forwards; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .form-row-grid { grid-template-columns: 1fr; gap: 15px; }
  .header-section-spirit { flex-direction: column-reverse; align-items: flex-start; gap: 15px; }
  .page-title-spirit { font-size: 1.4rem; }
  .form-card-aura { padding: 25px 20px; }
  .submit-btn-spirit { width: 100%; }
}
</style>