<template>
  <div class="settings-page">
    <main class="settings-container">
      <div v-if="userStore.isProfileLoading" class="loading-state-message">
        Đang tải thông tin hồ sơ...
      </div>
      <div v-else-if="userStore.profileError" class="error-state-message">
        Lỗi: {{ userStore.getProfileError }}
        <p v-if="!userStore.profile && !authStore.token">
          Bạn cần đăng nhập để chỉnh sửa thông tin cá nhân.
          <router-link to="/dang-nhap">Đăng nhập ngay</router-link>
        </p>
      </div>
      <section v-else class="settings-card">
        <h1 class="settings-title">Cài Đặt Thông Tin</h1>
        <form @submit.prevent="handleSubmit" class="settings-form">
          <div class="form-group avatar-group">
            <label class="form-label">Ảnh đại diện</label>
            <div class="avatar-preview">
              <img
                :src="avatarPreview || avatarUrl"
                alt="Avatar Preview"
                class="avatar-img"
                @error="handleAvatarError"
                crossorigin="anonymous"
              />

              <input
                type="file"
                accept="image/jpeg,image/png"
                @change="handleAvatarChange"
                class="avatar-input"
                ref="avatarInput"
              />
              <button
                type="button"
                class="avatar-btn"
                @click="avatarInput?.click()"
              >
                <i class="fas fa-camera"></i> Chọn ảnh
              </button>
            </div>
            <span v-if="errors.avatar" class="error">{{ errors.avatar }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Họ và tên</label>
            <input
              type="text"
              v-model="form.full_name"
              class="form-input"
              placeholder="Nhập họ và tên"
              :class="{ 'is-invalid': errors.full_name }"
            />
            <span v-if="errors.full_name" class="error">{{
              errors.full_name
            }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input
              type="email"
              v-model="form.email"
              class="form-input"
              placeholder="Nhập email"
              :class="{ 'is-invalid': errors.email }"
            />
            <span v-if="errors.email" class="error">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Số điện thoại</label>
            <input
              type="text"
              v-model="form.phone"
              class="form-input"
              placeholder="Nhập số điện thoại"
              :class="{ 'is-invalid': errors.phone }"
            />
            <span v-if="errors.phone" class="error">{{ errors.phone }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Giới tính</label>
            <CustomSelect
              v-model="form.gender"
              :options="genderOptions"
              :is-invalid="!!errors.gender"
              placeholder="-- Chọn giới tính --"
            />
            <span v-if="errors.gender" class="error">{{ errors.gender }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Mật khẩu hiện tại</label>
            <input
              type="password"
              v-model="form.current_password"
              class="form-input"
              placeholder="Nhập mật khẩu hiện tại"
              :class="{ 'is-invalid': errors.current_password }"
            />
            <span v-if="errors.current_password" class="error">{{
              errors.current_password
            }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Mật khẩu mới</label>
            <input
              type="password"
              v-model="form.new_password"
              class="form-input"
              placeholder="Nhập mật khẩu mới"
              :class="{ 'is-invalid': errors.new_password }"
            />
            <span v-if="errors.new_password" class="error">{{
              errors.new_password
            }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              v-model="form.confirm_new_password"
              class="form-input"
              placeholder="Nhập lại mật khẩu mới"
              :class="{ 'is-invalid': errors.confirm_new_password }"
            />
            <span v-if="errors.confirm_new_password" class="error">{{
              errors.confirm_new_password
            }}</span>
          </div>

          <div class="form-group agree-group">
            <label class="agree-label">
              <input
                type="checkbox"
                v-model="form.agree"
                :class="{ 'is-invalid': errors.agree }"
              />
              Đồng ý thay đổi thông tin
            </label>
            <span v-if="errors.agree" class="error">{{ errors.agree }}</span>
          </div>

          <button
            type="submit"
            class="submit-btn"
            :disabled="userStore.isUpdatingProfile"
          >
            <i class="fas fa-save"></i>
            {{ userStore.isUpdatingProfile ? "Đang lưu..." : "Lưu thay đổi" }}
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

// SỬA DÒNG NÀY: Định nghĩa kiểu rõ ràng cho originalForm
const originalForm = ref<
  Omit<
    typeof form.value,
    | "avatar"
    | "current_password"
    | "new_password"
    | "confirm_new_password"
    | "agree"
  >
>({
  full_name: "",
  email: "",
  phone: "",
  gender: "other",
});

const avatarPreview = ref<string | null>(null);
const errors = ref<FormErrors>({});
const avatarInput = ref<HTMLInputElement | null>(null);  

const genderOptions = ref([
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
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
    toast.error("Vui lòng đăng nhập để chỉnh sửa thông tin!");
    router.push("/dang-nhap");
    return;
  }
  userStore.fetchUserProfile();
});

const avatarUrl = computed(() => {
  // Nếu có avatar từ backend → return đầy đủ URL
  return getAvatarUrl(userStore.getUserProfile?.avatar);
});

const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = getAvatarUrl(null);
};

const handleAvatarChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      errors.value.avatar = "Chỉ hỗ trợ JPG/PNG";
      form.value.avatar = null;
      avatarPreview.value = null;
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      errors.value.avatar = "Ảnh tối đa 5MB";
      form.value.avatar = null;
      avatarPreview.value = null;
      return;
    }
    form.value.avatar = file;
    avatarPreview.value = URL.createObjectURL(file);
    errors.value.avatar = "";
  } else {
    form.value.avatar = null;
    avatarPreview.value = null;
    errors.value.avatar = "";
  }
};

const validateForm = (): boolean => {
  errors.value = {};
  let isValid = true;

  if (!form.value.full_name) {
    errors.value.full_name = "Họ và tên không được để trống";
    isValid = false;
  } else if (form.value.full_name.length > 50) {
    errors.value.full_name = "Họ và tên tối đa 50 ký tự";
    isValid = false;
  }

  if (!form.value.email) {
    errors.value.email = "Email không được để trống";
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = "Email không hợp lệ";
    isValid = false;
  }

  if (!form.value.phone) {
    errors.value.phone = "Số điện thoại không được để trống";
    isValid = false;
  } else if (!/^0\d{9,10}$/.test(form.value.phone)) {
    errors.value.phone = "SĐT phải 10-11 số và bắt đầu bằng 0";
    isValid = false;
  }

  if (!["male", "female", "other"].includes(form.value.gender)) {
    errors.value.gender = "Vui lòng chọn giới tính";
    isValid = false;
  }

  if (
    form.value.current_password ||
    form.value.new_password ||
    form.value.confirm_new_password
  ) {
    if (!form.value.current_password) {
      errors.value.current_password = "Vui lòng nhập mật khẩu hiện tại";
      isValid = false;
    } else if (form.value.current_password.length < 6) {
      errors.value.current_password = "Mật khẩu tối thiểu 6 ký tự";
      isValid = false;
    }

    if (!form.value.new_password) {
      errors.value.new_password = "Vui lòng nhập mật khẩu mới";
      isValid = false;
    } else if (form.value.new_password.length < 6) {
      errors.value.new_password = "Mật khẩu mới tối thiểu 6 ký tự";
      isValid = false;
    }

    if (!form.value.confirm_new_password) {
      errors.value.confirm_new_password = "Vui lòng xác nhận mật khẩu mới";
      isValid = false;
    } else if (form.value.confirm_new_password !== form.value.new_password) {
      errors.value.confirm_new_password = "Mật khẩu xác nhận không khớp";
      isValid = false;
    }
  }

  if (!form.value.agree) {
    errors.value.agree = "Vui lòng đồng ý thay đổi";
    isValid = false;
  }

  return isValid;
};

const hasProfileChanged = computed(() => {
  return (
    form.value.full_name !== originalForm.value.full_name ||
    form.value.email !== originalForm.value.email ||
    form.value.phone !== originalForm.value.phone ||
    form.value.gender !== originalForm.value.gender ||
    form.value.avatar !== null
  );
});

const hasPasswordChanged = computed(() => {
  return (
    form.value.current_password &&
    form.value.new_password &&
    form.value.confirm_new_password
  );
});

const handleSubmit = async () => {
  if (!validateForm()) {
    toast.error("Vui lòng kiểm tra lại thông tin đã nhập!");
    return;
  }

  if (!hasProfileChanged.value && !hasPasswordChanged.value) {
    toast.info("Không có thông tin nào để cập nhật.");
    return;
  }

  try {
    if (hasProfileChanged.value) {
      const updatePayload: UpdateUserPayload = {};
      if (form.value.full_name !== originalForm.value.full_name)
        updatePayload.full_name = form.value.full_name;
      if (form.value.email !== originalForm.value.email)
        updatePayload.email = form.value.email;
      if (form.value.phone !== originalForm.value.phone)
        updatePayload.phone = form.value.phone;
      if (form.value.gender !== originalForm.value.gender)
        updatePayload.gender = form.value.gender as "male" | "female" | "other";

      // Xử lý avatar:
      if (form.value.avatar) {
        // Nếu có file mới được chọn
        updatePayload.avatar = form.value.avatar;
      } else if (
        avatarPreview.value === null &&
        userStore.getUserProfile?.avatar &&
        userStore.getUserProfile.avatar !==
          "/uploads_img/avatar/default-avatar.jpg"
      ) {
        updatePayload.avatar = null;
      }
      if (Object.keys(updatePayload).length > 0) {
        await userStore.updateUserProfile(updatePayload);
      }
    }

    if (hasPasswordChanged.value) {
      const changePassPayload: ChangePasswordPayload = {
        old_password: form.value.current_password,
        new_password: form.value.new_password,
      };
      await userStore.changeUserPassword(changePassPayload);
      form.value.current_password = "";
      form.value.new_password = "";
      form.value.confirm_new_password = "";
    }

    form.value.agree = false;
    router.push("/user/thong-tin-ca-nhan");
  } catch (error: any) {
    // console.error đã có trong userStore actions, không cần log lại đây trừ khi muốn debug đặc biệt
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700&family=Sora:wght@400;600&display=swap");
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css");

.settings-page {
  min-height: 100vh;
  background: #1a1d29;
  color: #ffffff;
  position: relative;
  overflow: hidden;
}

.header {
  position: sticky;
  top: 0;
  z-index: 1000;
}

.settings-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Dòng "Thông tin cá nhân" với gạch chân */
.section-title-wrapper {
  text-align: center;
  margin-bottom: 30px;
  padding-top: 20px;
}

.section-title-profile {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
  display: inline-block;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.section-underline {
  width: 120px;
  height: 4px;
  background: linear-gradient(90deg, transparent, #4caf50, transparent);
  margin: 0 auto;
  border-radius: 2px;
}

.settings-card {
  background: rgba(26, 29, 41, 0.9);
  backdrop-filter: blur(15px);
  border: 2px solid #4caf50;
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: 0 0 25px rgba(76, 175, 80, 0.25);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: fade-in 0.8s ease-in;
}

.settings-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 35px rgba(76, 175, 80, 0.35);
}

.settings-title {
  font-family: "Sora", sans-serif;
  font-size: 2.25rem;
  font-weight: 700;
  color: #a4f9a4;
  margin-bottom: 2rem;
  text-align: center;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-family: "Manrope", sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #cccccc;
}

.form-input {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 0.5rem;
  color: #ffffff;
  font-family: "Manrope", sans-serif;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #4caf50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
}

.form-input.is-invalid {
  border-color: #ef4444;
}

.avatar-group {
  align-items: center;
  gap: 1rem;
}

.avatar-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.avatar-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #4caf50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
}

.avatar-input {
  display: none;
}

.avatar-btn {
  padding: 0.5rem 1rem;
  background: rgba(76, 175, 80, 0.15);
  color: #4caf50;
  border: 1px solid #4caf50;
  border-radius: 0.5rem;
  font-family: "Manrope", sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-btn:hover {
  background: #4caf50;
  color: #ffffff;
}

.agree-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.agree-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: "Manrope", sans-serif;
  font-size: 0.9rem;
  color: #ffffff;
}

.agree-label input {
  width: 1.2rem;
  height: 1.2rem;
  accent-color: #4caf50;
}

.error {
  color: #ef4444;
  font-family: "Manrope", sans-serif;
  font-size: 0.85rem;
  margin-top: -0.3rem;
}

.submit-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  color: #ffffff;
  font-family: "Sora", sans-serif;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  box-shadow: 0 0 15px rgba(76, 175, 80, 0.5);
}

.submit-btn::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
}

.submit-btn:hover::after {
  width: 250px;
  height: 250px;
}

.submit-btn i {
  margin-right: 0.5rem;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: linear-gradient(90deg, #333, #555);
  box-shadow: none;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .settings-container {
    padding: 1.5rem 1rem;
  }

  .settings-card {
    padding: 1.5rem;
  }

  .settings-title {
    font-size: 1.75rem;
  }
  .section-title-profile {
    font-size: 2rem;
  }
  .section-underline {
    width: 90px;
  }

  .avatar-img {
    width: 80px;
    height: 80px;
  }

  .form-input,
  .avatar-btn {
    font-size: 0.9rem;
  }

  .submit-btn {
    padding: 0.5rem 1.5rem;
    font-size: 0.9rem;
  }

  .agree-label {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .settings-card {
    padding: 1rem;
  }

  .settings-title {
    font-size: 1.5rem;
  }
  .section-title-profile {
    font-size: 1.8rem;
  }
  .section-underline {
    width: 70px;
  }

  .avatar-img {
    width: 60px;
    height: 60px;
  }

  .avatar-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }

  .form-group {
    gap: 0.3rem;
  }

  .form-label {
    font-size: 0.9rem;
  }

  .form-input {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }

  .error {
    font-size: 0.8rem;
  }

  .submit-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  .agree-label {
    font-size: 0.8rem;
  }
}
</style>
