<template>
  <div class="dangnhap-container">
    <main class="main-content">
      <LoginForm
        :key="formKey"
        @submit-login="handleApiLogin"
      />
    </main>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import LoginForm from "@/modules/auth/LoginForm.vue";
import { useAuthStore } from "../modules/auth/auth.store";

export default {
  name: "LoginView",
  components: {
    LoginForm,
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const formKey = ref(0);

    const handleApiLogin = async (loginData) => {
      try {
        await authStore.login(loginData);
        formKey.value += 1; 

        setTimeout(() => {
          router.push("/truyen-chu");
        }, 1500);
      } catch (error) {
        console.error("Lỗi khi đăng nhập:", error);
        formKey.value += 1;
      }
    };

    return {
      handleApiLogin,
      formKey,
    };
  },
};
</script>

<style scoped>
/* Giữ nguyên CSS cũ */
.dangnhap-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #1a1d29;
  color: #ffffff;
  font-family: "Roboto", sans-serif;
}

.main-content {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}
</style>