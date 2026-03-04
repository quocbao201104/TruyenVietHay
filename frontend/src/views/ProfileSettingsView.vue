<template>
  <div class="settings-page-xianxia">
    <main class="settings-container-aura">
      
      <!-- TRẠNG THÁI CẢM ỨNG (LOADING) -->
      <div v-if="userStore.isProfileLoading" class="loading-spirit-state">
        <i class="fas fa-yin-yang fa-spin text-4xl mb-4 text-emerald-400"></i>
        <p>Đang cảm ứng tiên cơ đạo hữu...</p>
      </div>

      <!-- TRẠNG THÁI LỖI -->
      <div v-else-if="userStore.profileError" class="error-spirit-state">
        <div class="error-box-aura">
          <i class="fas fa-circle-exclamation text-red-500 text-3xl mb-3"></i>
          <p>Thiên cơ nhiễu loạn: {{ userStore.getProfileError }}</p>
          <router-link v-if="!userStore.profile && !authStore.token" to="/dang-nhap" class="btn-re-login">
            Khởi động lại tu luyện
          </router-link>
        </div>
      </div>

      <!-- FORM CẢI BIẾN CĂN CƠ -->
      <section v-else class="settings-aura-card animate-fadeIn">
        <h1 class="settings-title-glow">Cải Biến Căn Cơ</h1>
        <p class="settings-subtitle">Chỉnh sửa thông tin để hoàn thiện đạo lộ tu tiên</p>

        <form @submit.prevent="handleSubmit" class="settings-spirit-form">
          
          <!-- LINH ẢNH DIỆN MẠO (AVATAR) -->
          <div class="form-group avatar-aura-group">
            <label class="spirit-label">Linh Ảnh Diện Mạo</label>
            <div class="avatar-aura-selector">
              <div class="avatar-ring-wrapper">
                <div class="aura-ring animate-spin-slow"></div>
                <img
                  :src="avatarPreview || avatarUrl"
                  alt="Avatar Preview"
                  class="avatar-img-aura"
                  @error="handleAvatarError"
                  crossorigin="anonymous"
                />
              </div>

              <input
                type="file"
                accept="image/jpeg,image/png"
                @change="handleAvatarChange"
                class="hidden-input"
                ref="avatarInput"
              />
              <button
                type="button"
                class="btn-spirit-upload"
                @click="avatarInput?.click()"
              >
                <i class="fas fa-camera-retro mr-2"></i> Thu Thập Linh Ảnh
              </button>
            </div>
            <span v-if="errors.avatar" class="error-aura-text">{{ errors.avatar }}</span>
          </div>

          <!-- THÔNG TIN ĐỊNH DANH -->
          <div class="form-spirit-grid">
            <div class="spirit-group">
              <label class="spirit-label">Đạo Hiệu Thế Danh (Họ tên)</label>
              <input
                type="text"
                v-model="form.full_name"
                class="spirit-input"
                placeholder="Nhập đạo hiệu..."
                :class="{ 'invalid-aura': errors.full_name }"
              />
              <span v-if="errors.full_name" class="error-aura-text">{{ errors.full_name }}</span>
            </div>

            <div class="spirit-group">
              <label class="spirit-label">Truyền Tin Khí (Email)</label>
              <input
                type="email"
                v-model="form.email"
                class="spirit-input"
                placeholder="Nhập email liên lạc..."
                :class="{ 'invalid-aura': errors.email }"
              />
              <span v-if="errors.email" class="error-aura-text">{{ errors.email }}</span>
            </div>

            <div class="spirit-group">
              <label class="spirit-label">Liên Lạc Phù (SĐT)</label>
              <input
                type="text"
                v-model="form.phone"
                class="spirit-input"
                placeholder="Nhập số liên lạc..."
                :class="{ 'invalid-aura': errors.phone }"
              />
              <span v-if="errors.phone" class="error-aura-text">{{ errors.phone }}</span>
            </div>

            <div class="spirit-group">
              <label class="spirit-label">Đạo Thể (Giới tính)</label>
              <CustomSelect
                v-model="form.gender"
                :options="genderOptions"
                :is-invalid="!!errors.gender"
                placeholder="-- Chọn đạo thể --"
              />
              <span v-if="errors.gender" class="error-aura-text">{{ errors.gender }}</span>
            </div>
          </div>

          <!-- CẢI BIẾN KHẨU QUYẾT (PASSWORD) -->
          <div class="password-aura-section">
            <h3 class="section-spirit-title"><i class="fas fa-key mr-2"></i> Cải Biến Khẩu Quyết</h3>
            
            <div class="form-spirit-grid mt-4">
              <div class="spirit-group">
                <label class="spirit-label">Khẩu Quyết Hiện Tại</label>
                <input
                  type="password"
                  v-model="form.current_password"
                  class="spirit-input"
                  placeholder="********"
                  :class="{ 'invalid-aura': errors.current_password }"
                />
                <span v-if="errors.current_password" class="error-aura-text">{{ errors.current_password }}</span>
              </div>

              <div class="spirit-group">
                <label class="spirit-label">Khẩu Quyết Mới</label>
                <input
                  type="password"
                  v-model="form.new_password"
                  class="spirit-input"
                  placeholder="********"
                  :class="{ 'invalid-aura': errors.new_password }"
                />
                <span v-if="errors.new_password" class="error-aura-text">{{ errors.new_password }}</span>
              </div>

              <div class="spirit-group">
                <label class="spirit-label">Xác Nhận Khẩu Quyết</label>
                <input
                  type="password"
                  v-model="form.confirm_new_password"
                  class="spirit-input"
                  placeholder="********"
                  :class="{ 'invalid-aura': errors.confirm_new_password }"
                />
                <span v-if="errors.confirm_new_password" class="error-aura-text">{{ errors.confirm_new_password }}</span>
              </div>
            </div>
          </div>

          <!-- XÁC NHẬN LINH ƯỚC -->
          <div class="spirit-agree-box">
            <label class="spirit-checkbox-label">
              <input
                type="checkbox"
                v-model="form.agree"
                class="spirit-checkbox"
                :class="{ 'invalid-aura': errors.agree }"
              />
              <span class="ml-3">Tôi xác nhận cải biến những thông tin trên vào căn cơ tu tiên.</span>
            </label>
            <span v-if="errors.agree" class="error-aura-text block mt-1">{{ errors.agree }}</span>
          </div>

          <button
            type="submit"
            class="btn-khai-thien"
            :disabled="userStore.isUpdatingProfile"
          >
            <i class="fas" :class="userStore.isUpdatingProfile ? 'fa-yin-yang fa-spin' : 'fa-floppy-disk'"></i>
            <span>{{ userStore.isUpdatingProfile ? "Đang vận công..." : "Lưu Giữ Tiên Cơ" }}</span>
          </button>
        </form>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/auth.store";
import { useUserStore } from "@/modules/user/user.store";
import CustomSelect from "@/components/common/CustomSelect.vue";
import type { UpdateUserPayload, ChangePasswordPayload } from "@/types/user";
import { useToast } from "vue-toastification";
import { getAvatarUrl } from "@/config/constants";

interface FormErrors {
  full_name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  avatar?: string;
  current_password?: string;
  new_password?: string;
  confirm_new_password?: string;
  agree?: string;
}

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const toast = useToast();

const form = ref({
  full_name: "",
  email: "",
  phone: "",
  gender: "other",
  avatar: null as File | null,
  current_password: "",
  new_password: "",
  confirm_new_password: "",
  agree: false,
});

const originalForm = ref({
  full_name: "",
  email: "",
  phone: "",
  gender: "other",
});

const avatarPreview = ref<string | null>(null);
const errors = ref<FormErrors>({});
const avatarInput = ref<HTMLInputElement | null>(null);  

const genderOptions = ref([
  { value: "male", label: "Nam Đạo" },
  { value: "female", label: "Nữ Đạo" },
  { value: "other", label: "Linh Thể" },
]);

watch(
  () => userStore.profile,
  (newProfile) => {
    if (newProfile) {
      form.value.full_name = newProfile.full_name || "";
      form.value.email = newProfile.email || "";
      form.value.phone = newProfile.phone || "";
      form.value.gender = newProfile.gender || "other";

      originalForm.value = {
        full_name: newProfile.full_name || "",
        email: newProfile.email || "",
        phone: newProfile.phone || "",
        gender: newProfile.gender || "other",
      };
      avatarPreview.value = null;
    }
  },
  { immediate: true }
);

onMounted(async () => {
  if (!authStore.token) {
    toast.error("Đạo hữu chưa nhập môn, không thể cải biến căn cơ!");
    router.push("/dang-nhap");
    return;
  }
  userStore.fetchUserProfile();
});

const avatarUrl = computed(() => getAvatarUrl(userStore.getUserProfile?.avatar));

const handleAvatarError = (event: Event) => {
  (event.target as HTMLImageElement).src = getAvatarUrl(null);
};

const handleAvatarChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      errors.value.avatar = "Chỉ thỉnh được ảnh JPG/PNG";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      errors.value.avatar = "Linh ảnh không quá 5MB";
      return;
    }
    form.value.avatar = file;
    avatarPreview.value = URL.createObjectURL(file);
    errors.value.avatar = "";
  }
};

const validateForm = (): boolean => {
  errors.value = {};
  let isValid = true;

  if (!form.value.full_name?.trim()) { errors.value.full_name = "Đạo hiệu không thể để trống"; isValid = false; }
  if (!form.value.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) { errors.value.email = "Truyền tin khí không hợp lệ"; isValid = false; }
  if (!form.value.phone?.trim() || !/^0\d{9,10}$/.test(form.value.phone)) { errors.value.phone = "Liên lạc phù không đúng định dạng"; isValid = false; }

  if (form.value.current_password || form.value.new_password) {
    if (!form.value.current_password) { errors.value.current_password = "Cần khẩu quyết cũ"; isValid = false; }
    if (form.value.new_password.length < 6) { errors.value.new_password = "Khẩu quyết mới tối thiểu 6 chữ"; isValid = false; }
    if (form.value.new_password !== form.value.confirm_new_password) { errors.value.confirm_new_password = "Khẩu quyết xác nhận không khớp"; isValid = false; }
  }

  if (!form.value.agree) { errors.value.agree = "Cần xác nhận tiên ước"; isValid = false; }
  return isValid;
};

const hasProfileChanged = computed(() => (
  form.value.full_name !== originalForm.value.full_name ||
  form.value.email !== originalForm.value.email ||
  form.value.phone !== originalForm.value.phone ||
  form.value.gender !== originalForm.value.gender ||
  form.value.avatar !== null
));

const hasPasswordChanged = computed(() => !!(form.value.current_password && form.value.new_password));

const handleSubmit = async () => {
  if (!validateForm()) { toast.error("Thông tin chưa chuẩn xác!"); return; }
  if (!hasProfileChanged.value && !hasPasswordChanged.value) { toast.info("Tiên cơ không có gì thay đổi."); return; }

  try {
    if (hasProfileChanged.value) {
      const updatePayload: UpdateUserPayload = {};
      if (form.value.full_name !== originalForm.value.full_name) updatePayload.full_name = form.value.full_name;
      if (form.value.email !== originalForm.value.email) updatePayload.email = form.value.email;
      if (form.value.phone !== originalForm.value.phone) updatePayload.phone = form.value.phone;
      if (form.value.gender !== originalForm.value.gender) updatePayload.gender = form.value.gender as any;
      if (form.value.avatar) updatePayload.avatar = form.value.avatar;

      await userStore.updateUserProfile(updatePayload);
    }

    if (hasPasswordChanged.value) {
      await userStore.changeUserPassword({
        old_password: form.value.current_password,
        new_password: form.value.new_password,
      });
    }

    toast.success("Cải biến căn cơ hoàn tất!");
    router.push("/user/thong-tin-ca-nhan");
  } catch (error: any) {}
};
</script>

<style scoped>
/* ===== CORE THEME XIANXIA ===== */
.settings-page-xianxia {
  min-height: 100vh;
  background: #0b0f19; /* Nền tối sâu đồng bộ */
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
  padding-bottom: 60px;
}

.settings-container-aura {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Loading/Error States */
.loading-spirit-state, .error-spirit-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

/* Settings Card */
.settings-aura-card {
  background: #131b2c;
  border: 1px solid #1e293b;
  border-radius: 30px;
  padding: 50px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  position: relative;
  overflow: hidden;
}

.settings-title-glow {
  font-size: 2.5rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 4px;
  text-align: center;
  background: linear-gradient(to right, #34d399, #fff, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 10px rgba(52, 211, 153, 0.3));
}

.settings-subtitle {
  text-align: center;
  color: #64748b;
  margin-bottom: 40px;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.settings-spirit-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Avatar Selector */
.avatar-aura-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.avatar-aura-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.avatar-ring-wrapper {
  position: relative;
  width: 130px;
  height: 130px;
}

.aura-ring {
  position: absolute;
  inset: -8px;
  border: 2px dashed rgba(52, 211, 153, 0.3);
  border-radius: 50%;
}

.avatar-img-aura {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #34d399;
  box-shadow: 0 0 20px rgba(52, 211, 153, 0.2);
}

.btn-spirit-upload {
  background: rgba(52, 211, 153, 0.05);
  border: 1px solid #34d399;
  color: #34d399;
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-spirit-upload:hover {
  background: #34d399;
  color: #0b0f19;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.4);
}

/* Form Grid & Inputs */
.form-spirit-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}

.spirit-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.spirit-label {
  font-size: 0.8rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.spirit-input {
  background: #0b0f19;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 12px 18px;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.spirit-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 15px rgba(52, 211, 153, 0.15);
  outline: none;
}

.spirit-input.invalid-aura { border-color: #f43f5e; }

/* Password Section */
.password-aura-section {
  margin-top: 20px;
  padding-top: 30px;
  border-top: 1px dashed rgba(255, 255, 255, 0.05);
}

.section-spirit-title {
  font-size: 1rem;
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
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
  width: 18px;
  height: 18px;
  accent-color: #34d399;
}

/* Submit Button */
.btn-khai-thien {
  margin-top: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 40px;
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
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 20px 40px rgba(16, 185, 129, 0.4);
}

.btn-khai-thien:disabled { opacity: 0.5; cursor: not-allowed; }

.error-aura-text { color: #f43f5e; font-size: 0.75rem; font-weight: 700; margin-top: 4px; }

/* Animations */
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.8s ease-out; }
.animate-spin-slow { animation: spin 10s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* Responsive */
@media (max-width: 768px) {
  .settings-aura-card { padding: 30px 20px; }
  .form-spirit-grid { grid-template-columns: 1fr; }
  .btn-khai-thien { width: 100%; }
  .settings-title-glow { font-size: 1.8rem; }
}
</style>