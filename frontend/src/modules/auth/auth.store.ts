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
  isInitialLoading: boolean;
}

let initializationPromise: Promise<void> | null = null;

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: localStorage.getItem("token") || null,
    user: null,
    isInitialized: false,
    isInitialLoading: false,
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
      this.isInitialLoading = false;
      initializationPromise = null;
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

    async googleLogin(token: string): Promise<LoginResponse> {
      const toast = useToast();
      try {
        const response = await authApi.googleLoginApi(token);
        this.setToken(response.token);
        this.setUser(response.user);
        this.isInitialized = true;
        toast.success("Đăng nhập Google thành công!");
        return response;
      } catch (error: unknown) {
        const err = error as AxiosError<{ message?: string }>;
        const errorMessage =
          err.response?.data?.message || err.message || "Đăng nhập Google thất bại";
        toast.error(errorMessage);
        this.clearAuth();
        throw { message: errorMessage, raw: err };
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
      if (initializationPromise) return initializationPromise;

      this.isInitialLoading = true;
      initializationPromise = (async () => {
        if (this.token) {
          try {
            const response = await getMeApi();
            this.setUser(response.user);
          } catch (error: any) {
            console.error("Lỗi xác thực (Initialize):", error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
              this.clearAuth();
            }
          }
        } else {
          this.setUser(null);
        }
        this.isInitialized = true;
        this.isInitialLoading = false;
        initializationPromise = null;
      })();

      return initializationPromise;
    },
  },
});
  