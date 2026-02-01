// frontend/src/modules/auth/auth.store.ts
import { defineStore } from "pinia";
import { AxiosError } from "axios";
import * as authApi from "./auth.api";
import { getMeApi } from "@/modules/user/user.api"; 
import type {
  User,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
} from "./auth.api";
import { useToast } from "vue-toastification";

interface AuthState {
  token: string | null;
  user: User | null;
  isInitialized: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: localStorage.getItem("token") || null,
    user: null,
    isInitialized: false,
  }),

  getters: {
    isLoggedIn: (state): boolean => !!state.token && !!state.user,
  },

  actions: {
    setToken(token: string | null) {
      this.token = token;
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    },

    setUser(user: User | null) {
      this.user = user;
    },

    clearAuth() {
      this.setToken(null);
      this.setUser(null);
      this.isInitialized = false;
      const toast = useToast();
      toast.info("Bạn đã đăng xuất.");
    },

    async login(loginData: LoginPayload): Promise<LoginResponse> {
      const toast = useToast();
      try {
        const response = await authApi.login(loginData);
        this.setToken(response.token);
        this.setUser(response.user);
        this.isInitialized = true;
        toast.success("Đăng nhập thành công!");
        return response;
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>;
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Tài khoản hoặc mật khẩu không đúng.";
        toast.error(errorMessage);
        this.clearAuth();
        throw {
          message: errorMessage,
          raw: err,
        };
      }
    },

    async register(data: RegisterPayload): Promise<void> {
      const toast = useToast();
      try {
        await authApi.register(data);
        toast.success("Đăng ký thành công!");
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>;
        const errorMessage =
          err.response?.data?.message || err.message || "Đăng ký thất bại";
        toast.error(errorMessage);
        throw err.response?.data || { message: errorMessage };
      }
    },

    logout() {
      this.clearAuth();
    },

    // Khởi tạo store khi reload app
    async initialize(): Promise<void> {
      if (this.isInitialized) return;
      this.isInitialized = true; 

      if (this.token) {
        try {
          const response = await getMeApi();
          this.setUser(response.user);
        } catch (error: any) {
          console.error("Lỗi xác thực:", error);
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
             this.clearAuth();
          }
           // Don't clear auth on network errors or 500s, let the user retry or see error state
        }
      } else {
          this.setUser(null);
      }
    },
  },
});