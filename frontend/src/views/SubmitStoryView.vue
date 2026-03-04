<template>
  <div class="submit-story-page-xianxia">
    <main class="submit-spirit-container">
      
      <!-- TIÊU ĐỀ LINH ĐÀI -->
      <div class="page-header-spirit animate-fadeIn">
        <h1 class="page-title-glow">
          {{ route.params.id ? 'Cập Nhật Bí Tịch' : 'Khai Phá Linh Thư' }}
        </h1>
        <p class="page-subtitle">Nơi đạo hữu đặt những viên gạch đầu tiên cho một đại giới mới</p>
        <div class="header-divider-spirit">
          <div class="dot"></div>
        </div>
      </div>

      <section class="submit-aura-card animate-fadeIn">
        <form @submit.prevent="handleSubmit" class="submit-spirit-form">
          
          <!-- THÔNG TIN CƠ BẢN (BASIC INFO) -->
          <div class="form-spirit-section">
            <h3 class="section-spirit-title"><i class="fas fa-id-card-clip mr-2 text-emerald-400"></i> Danh Tính Bí Tịch</h3>
            <StoryBasicInfoForm 
              v-model="story" 
              :default-author-name="authStore.user?.username" 
              :submitted="submitted"
              :initial-cover-url="story.anh_bia_url"
              @validation-error="handleFileValidationError"
              @delete-initial-cover="handleDeleteCover"
            />
          </div>

          <!-- PHÂN LOẠI CĂN CƠ (CATEGORY) -->
          <div class="form-spirit-section">
            <h3 class="section-spirit-title"><i class="fas fa-scroll mr-2 text-emerald-400"></i> Căn Cơ Phân Loại</h3>
            <StoryCategorySelector 
              :categories="categories" 
              v-model="story.the_loai_ids" 
              :submitted="submitted"
            />
          </div>

          <!-- TRẠNG THÁI TU VI (STATUS) -->
          <div class="form-spirit-section">
            <h3 class="section-spirit-title"><i class="fas fa-hourglass-half mr-2 text-emerald-400"></i> Trạng Thái Tu Vi</h3>
            <StoryStatusSelects 
              v-model="story" 
              :submitted="submitted"
            />
          </div>

          <!-- CHI TIẾT PHỤ -->
          <div class="form-spirit-grid">
            <div class="spirit-group">
              <label for="linkNguon" class="spirit-label"><i class="fas fa-link mr-2"></i> Linh Khí Nguồn (nếu có)</label>
              <input 
                type="url" 
                id="linkNguon" 
                v-model="story.link_nguon" 
                class="spirit-input" 
                placeholder="https://truyen-nguon.com/..."
              >
            </div>

            <div class="spirit-group">
              <label for="ageRating" class="spirit-label"><i class="fas fa-users-viewfinder mr-2"></i> Định Tầm Độc Giả</label>
              <select 
                id="ageRating" 
                v-model="story.age_rating" 
                class="spirit-select-custom"
              >
                <option value="" disabled>-- Chọn đối tượng --</option>
                <option :value="1">Mọi đạo hữu (Phổ thông)</option>
                <option :value="2">Trúc Cơ trở lên (13+)</option>
                <option :value="3">Nguyên Anh trở lên (18+)</option>
              </select>
              <span v-if="submitted && !story.age_rating" class="error-aura-text">Vui lòng chọn tầm độc giả.</span>
            </div>
          </div>

          <!-- CHƯƠNG MẪU (SAMPLE CONTENT) -->
          <div class="form-spirit-section">
            <h3 class="section-spirit-title"><i class="fas fa-feather-pointed mr-2 text-emerald-400"></i> Bản Thảo Khởi Đầu</h3>
            <div class="spirit-group">
              <textarea
                id="chuongMau"
                v-model="story.chuong_mau"
                rows="10"
                class="spirit-textarea"
                placeholder="Nhập những dòng linh khí đầu tiên cho bí tịch này..."
              ></textarea>
              <span v-if="submitted && (!story.chuong_mau || story.chuong_mau.trim() === '')" class="error-aura-text">Nội dung chương mẫu không được để trống.</span>
            </div>
          </div>
          
          <!-- XÁC NHẬN LINH ƯỚC -->
          <div class="spirit-agree-box">
            <label class="spirit-checkbox-label">
              <input
                type="checkbox"
                v-model="agreeToSubmit"
                class="spirit-checkbox"
                :class="{ 'invalid-aura': submitted && !agreeToSubmit }"
              />
              <span class="ml-3">Tôi muốn khai phá bí tịch này và cam kết nội dung tuân thủ tiên quy.</span>
            </label>
            <span v-if="submitted && !agreeToSubmit" class="error-aura-text block mt-1">Đạo hữu phải ký linh ước để tiếp tục.</span>
          </div>

          <!-- NÚT GỬI (KHAI THIÊN) -->
          <div class="submit-action-area">
            <button type="submit" class="btn-khai-thien" :disabled="loading">
              <i class="fas" :class="loading ? 'fa-yin-yang fa-spin' : 'fa-wand-magic-sparkles'"></i>
              <span>{{ loading ? 'Đang vận công...' : (route.params.id ? 'Cập Nhật Bí Tịch' : 'Khai Thiên Lập Đạo') }}</span>
            </button>
            <p v-if="errorMessage" class="error-aura-msg">{{ errorMessage }}</p>
          </div>
        </form>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/modules/auth/auth.store';
import { useToast } from 'vue-toastification';
import { useRouter, useRoute } from 'vue-router';
import axios from '@/utils/axios'; 

import StoryBasicInfoForm from '@/components/forms/StoryBasicInfoForm.vue';
import StoryCategorySelector from '@/components/forms/StoryCategorySelector.vue';
import StoryStatusSelects from '@/components/forms/StoryStatusSelects.vue';
import { getImageUrl } from "@/config/constants";

const authStore = useAuthStore();
const toast = useToast();
const router = useRouter();
const route = useRoute();

const story = ref({
  ten_truyen: '',
  tac_gia: authStore.user?.username || '', 
  mo_ta: '',
  the_loai_ids: [], 
  trang_thai: 'dang_ra', 
  link_nguon: '',
  age_rating: 1,
  chuong_mau: '', 
  anh_bia: null, 
  anh_bia_url: null,
  user_id: authStore.user?.id,
});

const categories = ref([]);
const loading = ref(false);
const errorMessage = ref('');
const submitted = ref(false); 
const fileErrors = ref({ anh_bia: '' });
const agreeToSubmit = ref(false); 
const isCoverDeleted = ref(false);

const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/theloai'); 
    categories.value = response.data.data;
  } catch (error) {
    toast.error('Không thể tải linh pháp thể loại.');
  }
};

const handleFileValidationError = ({ field, message }) => {
  fileErrors.value[field] = message;
};

const handleDeleteCover = () => {
    story.value.anh_bia_url = null;
    isCoverDeleted.value = true;
};

const validateForm = () => {
  let isValid = true;
  errorMessage.value = ''; 
  fileErrors.value.anh_bia = ''; 

  if (!story.value.ten_truyen?.trim()) { isValid = false; errorMessage.value = 'Tên truyện không được để trống.'; }
  if (!story.value.tac_gia?.trim()) { isValid = false; errorMessage.value = 'Tên tác giả không được để trống.'; }
  
  const isEditMode = !!route.params.id;
  if (!isEditMode) {
    if (!story.value.mo_ta?.trim()) { isValid = false; errorMessage.value = 'Mô tả không được để trống.'; }
    if (!story.value.the_loai_ids?.length) { isValid = false; errorMessage.value = 'Vui lòng chọn ít nhất một thể loại.'; }
    if (!story.value.chuong_mau?.trim()) { isValid = false; errorMessage.value = 'Nội dung chương mẫu không được để trống.'; }
    if (!story.value.anh_bia) { isValid = false; errorMessage.value = 'Ảnh bìa là bắt buộc cho linh thư mới.'; }
  }

  if (!agreeToSubmit.value) {
    isValid = false;
    errorMessage.value = 'Đạo hữu phải đồng ý linh ước để đăng truyện.';
  }

  if (!isValid && errorMessage.value) {
    toast.error(errorMessage.value);
  }
  return isValid;
};

const handleSubmit = async () => {
  submitted.value = true; 
  if (!validateForm()) return;

  loading.value = true;
  const isEditMode = !!route.params.id;
  const storyId = route.params.id; 

  const formData = new FormData();
  formData.append('ten_truyen', story.value.ten_truyen);
  formData.append('tac_gia', story.value.tac_gia);
  formData.append('mo_ta', story.value.mo_ta);
  formData.append('trang_thai', story.value.trang_thai);
  formData.append('link_nguon', story.value.link_nguon);
  formData.append('age_rating', story.value.age_rating);
  formData.append('chuong_mau', story.value.chuong_mau);
  formData.append('user_id', story.value.user_id);
  
  if (story.value.anh_bia) {
    formData.append('anh_bia', story.value.anh_bia);
  } else if (isEditMode && isCoverDeleted.value) {
    formData.append('delete_cover_image', 'true');
  }

  story.value.the_loai_ids.forEach(id => {
    formData.append('theloai_ids[]', id); 
  });

  try {
    let response;
    if (isEditMode) {
        response = await axios.put(`/api/truyen/${storyId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    } else {
        response = await axios.post('/api/truyen', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    }
    
    toast.success(response.data.message);
    if (isEditMode) router.push({ name: 'AuthorStoryManagement' });
    else router.push('/user/thong-tin-ca-nhan');
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Đã xảy ra lỗi khi cảm ứng thiên địa.';
    toast.error(errorMessage.value);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCategories();
  if (route.params.id) {
    const fetchStoryDetails = async () => {
        try {
            loading.value = true;
            const res = await axios.get(`/api/truyen/${route.params.id}`);
            const data = res.data;
            story.value = {
                ten_truyen: data.ten_truyen || '',
                tac_gia: data.tac_gia || '',
                mo_ta: data.mo_ta || '',
                the_loai_ids: data.genres ? data.genres.map(g => g.id_theloai) : [],
                trang_thai: data.trang_thai || 'dang_ra',
                link_nguon: data.link_nguon || '',
                age_rating: data.age_rating || 1,
                chuong_mau: data.sample_chapter_content || '',
                anh_bia: null,
                anh_bia_url: data.anh_bia ? getImageUrl(data.anh_bia) : null,
                user_id: authStore.user?.id,
            };
        } catch (error) {
            toast.error("Không thể thỉnh thông tin bí tịch.");
            router.push({ name: 'AuthorStoryManagement' });
        } finally {
            loading.value = false;
        }
    };
    fetchStoryDetails();
  }
});
</script>

<style scoped>
/* ===== CORE THEME XIANXIA ===== */
.submit-story-page-xianxia {
  min-height: 100vh;
  background: #0b0f19; /* Nền tối sâu đồng bộ */
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
  padding-bottom: 80px;
}

.submit-spirit-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Page Header */
.page-header-spirit {
  text-align: center;
  margin-bottom: 50px;
}

.page-title-glow {
  font-size: 3rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 4px;
  background: linear-gradient(to right, #34d399, #fff, #34d399);
  -webkit-background-clip: text;
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

/* Form Aura Card */
.submit-aura-card {
  background: #131b2c;
  border: 1px solid #1e293b;
  border-radius: 30px;
  padding: 50px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  position: relative;
  overflow: hidden;
}

.submit-spirit-form {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.form-spirit-section {
  padding-bottom: 20px;
  border-bottom: 1px dashed rgba(52, 211, 153, 0.1);
}

.section-spirit-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
}

/* Grid for smaller inputs */
.form-spirit-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}

/* Form Groups & Inputs */
.spirit-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.spirit-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.spirit-input, .spirit-textarea, .spirit-select-custom {
  background: #0b0f19;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 14px 18px;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.spirit-input:focus, .spirit-textarea:focus, .spirit-select-custom:focus {
  border-color: #34d399;
  background: #0b0f19;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.15);
  outline: none;
}

.spirit-textarea {
  resize: vertical;
  line-height: 1.6;
}

.spirit-select-custom {
  cursor: pointer;
}

/* Agreement Box */
.spirit-agree-box {
  background: rgba(52, 211, 153, 0.03);
  padding: 20px;
  border-radius: 16px;
  border: 1px solid rgba(52, 211, 153, 0.1);
}

.spirit-checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #94a3b8;
  font-weight: 600;
}

.spirit-checkbox {
  width: 20px;
  height: 20px;
  accent-color: #34d399;
}

/* Action Area & Main Button */
.submit-action-area {
  text-align: center;
  padding-top: 20px;
}

.btn-khai-thien {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 18px 50px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #0b0f19;
  border-radius: 16px;
  font-weight: 900;
  text-transform: uppercase;
  font-size: 1rem;
  letter-spacing: 2px;
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.btn-khai-thien:hover:not(:disabled) {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 20px 40px rgba(16, 185, 129, 0.4);
}

.btn-khai-thien:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(1);
}

.error-aura-text { color: #f43f5e; font-size: 0.75rem; font-weight: 700; margin-top: 4px; }
.error-aura-msg { color: #f43f5e; font-weight: 800; margin-top: 20px; font-size: 0.9rem; }

/* Animations */
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.8s ease-out; }

/* Responsive */
@media (max-width: 768px) {
  .submit-aura-card { padding: 30px 20px; }
  .form-spirit-grid { grid-template-columns: 1fr; }
  .btn-khai-thien { width: 100%; justify-content: center; }
  .page-title-glow { font-size: 2rem; }
}
</style>