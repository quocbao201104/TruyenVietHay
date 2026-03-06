// frontend/src/modules/user/user.store.ts
import { defineStore } from "pinia";
import { useToast } from "vue-toastification";
import { getMeApi, updateMeApi, changePasswordApi, applyAuthorApi, getAuthorApplicationStatusApi } from "./user.api";
import type { User, UpdateUserPayload, ChangePasswordPayload, AuthorApplicationPayload } from "@/types/user";
import { useAuthStore } from "@/modules/auth/auth.store";

interface UserState {
  profile: User | null;
  isLoadingProfile: boolean;
  profileError: string | null;
  isUpdatingProfile: boolean;
  updateProfileError: string | null;
  applicationStatus: any | null;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    profile: null,
    isLoadingProfile: false,
    profileError: null,
    isUpdatingProfile: false,
    updateProfileError: null,
    applicationStatus: null,
  }),

  getters: {
    getUserProfile: (state) => state.profile,
    isProfileLoading: (state) => state.isLoadingProfile,
    getProfileError: (state) => state.profileError,
    getAuthorApplicationStatus: (state) => state.applicationStatus,
  },

  actions: {
    async fetchUserProfile() {
      const authStore = useAuthStore();
      const toast = useToast();
      this.isLoadingProfile = true;
      this.profileError = null;

      if (!authStore.token) {
        this.profileError = "Người dùng chưa đăng nhập.";
        this.isLoadingProfile = false;
        return;
      }

      try {
        const response = await getMeApi();
        if (response.user.avatar) {
            response.user.avatar = response.user.avatar + '?' + Date.now();
        }
        
        // Handle token refresh if role changed in backend
        if (response.token) {
          authStore.setToken(response.token);
          console.log("Auth token refreshed due to role change");
        }

        this.profile = response.user;
        authStore.setUser(response.user);
      } catch (error: any) {
        this.profileError = error.message || "Không thể tải thông tin hồ sơ.";
        console.error("Lỗi fetchUserProfile:", error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          authStore.logout();
          toast.info("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        }
      } finally {
        this.isLoadingProfile = false;
      }
    },

    async fetchApplicationStatus() {
        try {
            const response = await getAuthorApplicationStatusApi();
            this.applicationStatus = response.application;
            return response.application;
        } catch (error) {
            console.error("Lỗi fetchApplicationStatus:", error);
            return null;
        }
    },

    async updateUserProfile(data: UpdateUserPayload) {
      const authStore = useAuthStore();
      const toast = useToast();
      this.isUpdatingProfile = true;
      this.updateProfileError = null;

      try {
        const response = await updateMeApi(data);

        if (response.user) {
            if (response.user.avatar) {
                response.user.avatar = response.user.avatar + '?' + Date.now();
            }
            this.profile = response.user;
            authStore.setUser(response.user);
        } else {
            await this.fetchUserProfile();
        }
        
        toast.success("Cập nhật thông tin thành công!");
      } catch (error: any) {
        this.updateProfileError = error.message || "Cập nhật thông tin thất bại.";
        toast.error("Lỗi cập nhật hồ sơ: " + this.updateProfileError);
        console.error("Lỗi updateUserProfile action:", error);
        throw error;
      } finally {
        this.isUpdatingProfile = false;
      }
    },

    async changeUserPassword(data: ChangePasswordPayload) {
      const toast = useToast();
      try {
        await changePasswordApi(data);
        toast.success("Đổi mật khẩu thành công!");
      } catch (error: any) {
        toast.error("Đổi mật khẩu thất bại: " + (error.response?.data?.message || error.message || "Lỗi không xác định."));
        console.error("Lỗi changeUserPassword action:", error);
        throw error;
      }
    },

    async applyToBeAuthor(data: AuthorApplicationPayload) {
      const toast = useToast();
      try {
        const response = await applyAuthorApi(data);
        toast.success(response.message || "Gửi đơn đăng ký thành công!");
        await this.fetchApplicationStatus(); // Refresh status
        return response;
      } catch (error: any) {
        const message = error.response?.data?.message || error.message || "Gửi đơn đăng ký thất bại.";
        toast.error(message);
        console.error("Lỗi applyToBeAuthor action:", error);
        throw error;
      }
    },
  },
});