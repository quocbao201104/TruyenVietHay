<template>
  <div class="author-apply-container">
    <div class="apply-card">
      <h1 class="title">Đăng Ký Làm Tác Giả</h1>
      <p class="subtitle">Hãy chia sẻ câu chuyện của bạn với hàng ngàn độc giả.</p>

      <form @submit.prevent="handleSubmit" class="apply-form">
        <div class="form-group">
          <label for="penName">Bút danh (Pen Name)</label>
          <input 
            type="text" 
            id="penName" 
            v-model="form.pen_name" 
            placeholder="Tên hiển thị dưới mỗi tác phẩm"
            required
            :disabled="isSubmitting"
          />
        </div>

        <div class="form-group">
          <label for="bio">Giới thiệu ngắn</label>
          <textarea 
            id="bio" 
            v-model="form.bio" 
            placeholder="Bạn định viết về thể loại gì? (Tu tiên, Mạt thế...)"
            rows="3"
            :disabled="isSubmitting"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="experience">Link/Tác phẩm mẫu (nếu có)</label>
          <input 
            type="text" 
            id="experience" 
            v-model="form.experience" 
            placeholder="Dẫn link tác phẩm cũ hoặc kinh nghiệm viết lách"
            :disabled="isSubmitting"
          />
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="agreed" 
              required
              :disabled="isSubmitting"
            />
            Tôi cam kết không vi phạm bản quyền hoặc đăng tải nội dung cấm.
          </label>
        </div>

        <button 
          type="submit" 
          class="submit-btn" 
          :disabled="isSubmitting || !agreed"
        >
          <span v-if="isSubmitting" class="loader"></span>
          {{ isSubmitting ? 'Đang gửi...' : 'Gửi Đơn Đăng Ký' }}
        </button>
      </form>

      <div class="note">
        <p><strong>Lưu ý:</strong> Đơn đăng ký sẽ được Admin duyệt trong vòng 24-48h. Bạn sẽ nhận được thông báo khi có kết quả.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useUserStore } from '@/modules/user/user.store';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';

const userStore = useUserStore();
const router = useRouter();
const toast = useToast();

const form = reactive({
  pen_name: '',
  bio: '',
  experience: ''
});

const agreed = ref(false);
const isSubmitting = ref(false);

const handleSubmit = async () => {
  if (!agreed.value) {
    toast.warning("Vui lòng xác nhận cam kết.");
    return;
  }

  isSubmitting.value = true;
  try {
    await userStore.applyToBeAuthor(form);
    router.push({ name: 'Profile' });
  } catch (error) {
    // Error handled in store
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.author-apply-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  min-height: 80vh;
}

.apply-card {
  background: var(--bg-card, #1e1e2d);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.title {
  font-size: 2rem;
  color: #fff;
  margin-bottom: 8px;
  text-align: center;
  font-weight: 700;
}

.subtitle {
  color: #a2a2c2;
  text-align: center;
  margin-bottom: 32px;
}

.apply-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #e2e2e2;
  font-weight: 500;
  font-size: 0.95rem;
}

.form-group input, 
.form-group textarea {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
  color: #fff;
  font-family: inherit;
  transition: all 0.3s ease;
}

.form-group input:focus, 
.form-group textarea:focus {
  outline: none;
  border-color: #6366f1;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.checkbox-group {
  margin-top: 10px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #a2a2c2;
  font-size: 0.9rem;
  cursor: pointer;
  line-height: 1.4;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  cursor: pointer;
}

.submit-btn {
  margin-top: 10px;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.submit-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.note {
  margin-top: 30px;
  padding: 15px;
  background: rgba(99, 102, 241, 0.1);
  border-left: 4px solid #6366f1;
  border-radius: 4px;
  color: #a2a2c2;
  font-size: 0.85rem;
}

.note strong {
  color: #6366f1;
}

.loader {
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
