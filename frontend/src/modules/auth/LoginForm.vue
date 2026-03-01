<template>
  <div class="khuVucForm">
    <router-link to="/"><img src="/logo.png" class="login-logo" /></router-link>
    <h2 class="form-title">Đăng Nhập</h2>

    <form @submit.prevent="handleLogin">
      <div class="nhomForm">
        <BaseInput v-model="formData.username" label="Email hoặc Username" type="text" iconClass="fas fa-id-badge" />
        <span class="loi-nho" v-if="errors.username">{{
          errors.username
        }}</span>
      </div>

      <div class="nhomForm">
        <BaseInput v-model="formData.password" label="Mật khẩu" :type="passwordFieldType" iconClass="fas fa-lock">
          <button type="button" class="toggle-password" @click="togglePassword">
            <i :class="[
              'fas',
              passwordFieldType === 'password' ? 'fa-eye-slash' : 'fa-eye',
            ]"></i>
          </button>
        </BaseInput>
        <span class="loi-nho" v-if="errors.password">{{
          errors.password
        }}</span>
      </div>

      <div class="nhomForm forgot-password">
        <div class="remember-me">
          <input type="checkbox" id="remember-me" v-model="formData.rememberMe" />
          <label for="remember-me">Ghi nhớ mật khẩu</label>
        </div>
        <router-link to="/quen-mat-khau">Quên mật khẩu?</router-link>
      </div>

      <button type="submit" class="login-btn ripple">Đăng Nhập</button>
    </form>

    <div class="social-login">
      <div class="divider">
        <span>Hoặc đăng nhập bằng</span>
      </div>
      <div class="google-signin-container">
        <GoogleLogin :callback="onGoogleCallback" />
      </div>
    </div>

    <p class="login-link">
      Chưa có tài khoản? <router-link to="/dang-ky">Đăng ký ngay</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import BaseInput from "@/components/common/BaseInput.vue";

const emit = defineEmits(["submit-login", "submit-google-login"]);

const formData = reactive({
  username: "",
  password: "",
  rememberMe: false,
});

const errors = reactive({
  username: "",
  password: "",
});

const passwordFieldType = ref("password");

const togglePassword = () => {
  passwordFieldType.value =
    passwordFieldType.value === "password" ? "text" : "password";
};

const validateForm = () => {
  errors.username = !formData.username
    ? "Vui lòng nhập email hoặc username"
    : "";
  errors.password = !formData.password ? "Vui lòng nhập mật khẩu" : "";
  return !errors.username && !errors.password;
};

const handleLogin = () => {
  if (validateForm()) {
    emit("submit-login", { ...formData });
  }
};

const onGoogleCallback = (response) => {
  if (response.credential) {
    emit("submit-google-login", response.credential);
  }
};
</script>

<style scoped>
.khuVucForm {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 30px;
  border: 1px solid #4caf50;
  border-radius: 10px;
  background: #1a1d29;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.6s ease-out;
}

.login-logo {
  width: 100px;
  margin: 0 auto 15px;
  display: block;
  transition: transform 0.3s ease;
}

.login-logo:hover {
  transform: scale(1.1);
}

.form-title {
  font-size: 2rem;
  font-weight: 600;
  color: #4caf50;
  margin-bottom: 10px;
  text-align: center;
}

.nhomForm {
  margin-bottom: 20px;
}

.toggle-password {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #4caf50;
}

.toggle-password i {
  font-size: 1rem;
}

.toggle-password:hover {
  color: #388e3c;
}

.forgot-password {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #cccccc;
}

.remember-me input[type="checkbox"] {
  accent-color: #4caf50;
}

.forgot-password a {
  color: #4caf50;
  text-decoration: none;
}

.forgot-password a:hover {
  text-decoration: underline;
  color: #388e3c;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: linear-gradient(90deg, #388e3c, #4caf50);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3);
}

.social-login {
  margin: 20px 0;
  text-align: center;
  color: #cccccc;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #444;
}

.divider span {
  padding: 0 12px;
  font-size: 0.85rem;
  color: #999;
  white-space: nowrap;
}

.google-signin-container {
  display: flex;
  justify-content: center;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #cccccc;
}

.login-link a {
  color: #4caf50;
  font-weight: 500;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
  color: #388e3c;
}

.loi-nho {
  color: #ff5252;
  font-size: 0.8rem;
  display: block;
  margin-top: 5px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ripple {
  position: relative;
  overflow: hidden;
}
</style>