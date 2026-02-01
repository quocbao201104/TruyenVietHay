<template>
  <div class="profile-page">
    
    <main class="profile-container">
      <div v-if="userStore.isProfileLoading" class="loading-state-message">
        Đang tải thông tin hồ sơ...
      </div>
      <div v-else-if="userStore.profileError" class="error-state-message">
        Lỗi: {{ userStore.getProfileError }}
        <p v-if="!userStore.profile && !authStore.token">
          Bạn cần đăng nhập để xem thông tin cá nhân.
          <router-link to="/dang-nhap">Đăng nhập ngay</router-link>
        </p>
      </div>
      <div v-else>
        <div class="section-title-wrapper">
          <h2 class="section-title-profile">Thông Tin Cá Nhân</h2>
          <div class="section-underline"></div>
        </div>

        <section class="profile-card">
          <div class="profile-header">
            <div class="profile-avatar-wrapper">
              <img
                :src="avatarUrl"
                alt="User Avatar"
                class="profile-avatar"
                @error="handleAvatarError"
                crossorigin="anonymous"
              />
            </div>

            <div class="profile-info">
              <h1 class="profile-name">
                {{ user?.full_name || "Người dùng" }}
              </h1>
              <p class="profile-username">
                @{{ user?.username || "username" }}
              </p>
            </div>
          </div>

          <div class="profile-details">
            <div class="detail-row">
              <i class="fas fa-envelope detail-icon"></i>
              <span class="detail-label">Email</span>
              <span class="detail-value">{{
                user?.email || "Không có dữ liệu"
              }}</span>
            </div>
            <div class="detail-row">
              <i class="fas fa-phone detail-icon"></i>
              <span class="detail-label">Số điện thoại</span>
              <span class="detail-value">{{
                user?.phone || "Không có dữ liệu"
              }}</span>
            </div>
            <div class="detail-row">
              <i class="fas fa-venus-mars detail-icon"></i>
              <span class="detail-label">Giới tính</span>
              <span class="detail-value">{{
                formatGender(user?.gender) || "Không có dữ liệu"
              }}</span>
            </div>
            <div class="detail-row">
              <i class="fas fa-calendar-alt detail-icon"></i>
              <span class="detail-label">Ngày tham gia</span>
              <span class="detail-value">{{
                formatDate(user?.created_at) || "Không có dữ liệu"
              }}</span>
            </div>
            <div class="detail-row">
              <i class="fas fa-user-tag detail-icon"></i>
              <span class="detail-label">Vai trò</span>
              <span
                class="detail-value role-badge"
                :class="{
                  'role-user': user?.role === 'user',
                  'role-author': user?.role === 'author',
                  'role-admin': user?.role === 'admin',
                }"
              >
                <i
                  :class="{
                    'fas fa-user': user?.role === 'user',
                    'fas fa-pen': user?.role === 'author',
                    'fas fa-crown': user?.role === 'admin',
                  }"
                ></i>
                {{
                  user?.role
                    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                    : "User"
                }}
              </span>
            </div>
          </div>
          
          <div class="gamification-section" v-if="currentLevel">
             <LevelCard 
                :level="currentLevel"
                :points="userPoints?.total_points || 0"
                :nextLevelPoints="currentLevel?.next_level_points || 100" 
                :nextLevelName="currentLevel?.next_level_name || ''"
             />
          </div>

          <div class="profile-nav">
            <router-link to="/user/cai-dat-thong-tin" class="profile-nav-tab">
              <i class="fas fa-cog"></i> Chỉnh sửa hồ sơ
            </router-link>
            <router-link to="/user/truyen-theo-doi" class="profile-nav-tab">
              <i class="fas fa-heart"></i> Truyện theo dõi
            </router-link>
            <router-link to="/user/lich-su-doc" class="profile-nav-tab">
              <i class="fas fa-book-open"></i> Lịch sử đọc
            </router-link>
            <router-link
              v-if="user?.role === 'author' || user?.role === 'admin'"
              to="/dang-truyen"
              class="profile-nav-tab"
            >
              <i class="fas fa-book"></i> Đăng Truyện
            </router-link>
            <router-link
              v-if="user?.role === 'admin'"
              to="/admin/quan-ly-nguoi-dung"
              class="profile-nav-tab"
            >
              <i class="fas fa-users"></i> Quản lý người dùng
            </router-link>
            <router-link
              v-if="user?.role === 'admin'"
              to="/admin/quan-ly-truyen"
              class="profile-nav-tab"
            >
              <i class="fas fa-list-check"></i> Quản lý truyện
            </router-link>
            <router-link
              v-if="user?.role === 'author'"
              to="/user/quan-ly-truyen"
              class="profile-nav-tab"
            >
              <i class="fas fa-list-check"></i> Quản lý truyện của tôi
            </router-link>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import { computed, onMounted } from "vue";
import { useAuthStore } from "@/modules/auth/auth.store";
import { useUserStore } from "@/modules/user/user.store";
import { getAvatarUrl } from "@/config/constants";
import LevelCard from "@/components/gamification/LevelCard.vue";
import { useGamification } from "@/composables/useGamification";
import { watch } from "vue";

export default {
  name: "ProfileView",
  setup() {
    const authStore = useAuthStore();
    const userStore = useUserStore();
    const { 
        currentLevel, 
        userPoints, 
        fetchCurrentLevel, 
        fetchUserPoints 
    } = useGamification();

    watch(() => userStore.user, (newUser) => {
        if (newUser && newUser.id) {
            fetchUserPoints(newUser.id);
            fetchCurrentLevel(newUser.id);
        }
    }, { immediate: true });

    onMounted(() => {
      userStore.fetchUserProfile();
    });

    const user = computed(() => userStore.getUserProfile);

    const avatarUrl = computed(() => {
      return getAvatarUrl(user.value?.avatar);
    });

    const handleAvatarError = (event) => {
      const img = event.target;
      if (!img.dataset.fallback) {
        console.error("Failed to load user avatar, switching to fallback.");
        img.src = getAvatarUrl(null);
        img.dataset.fallback = "true"; // Đánh dấu đã fallback 1 lần
      } else {
        console.warn("Fallback avatar also failed to load. Giving up.");
      }
    };

    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        return "Không hợp lệ";
      }
      return d.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const formatGender = (gender) => {
      if (!gender) return null;
      const genderMap = {
        male: "Nam",
        female: "Nữ",
        other: "Khác",
      };
      return genderMap[gender] || "Khác";
    };

    return {
      userStore,
      authStore,
      user,
      avatarUrl,
      handleAvatarError,
      formatDate,
      formatGender,
      currentLevel,
      userPoints
    };
  },
  components: {
      LevelCard
  }
};
</script>

<style scoped>
/* Import Google Fonts */
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700&family=Sora:wght@400;600&display=swap");

/* Import Font Awesome for icons */
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css");

/* Page wrapper */
.profile-page {
  min-height: 100vh;
  background: #1a1d29;
  color: #ffffff;
  position: relative;
  overflow: hidden;
}

/* Main container */
.profile-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* Loading/Error Messages */
.loading-state-message,
.error-state-message {
  text-align: center;
  font-size: 1.2rem;
  padding: 20px;
  background-color: #2a2d3a;
  border-radius: 10px;
  margin-top: 50px;
  border: 1px solid #383b4a;
  color: #cccccc;
}
.error-state-message {
  color: #f44336;
  border-color: #f44336;
}
.error-state-message a {
  color: #4caf50;
  text-decoration: none;
  font-weight: bold;
}
.error-state-message a:hover {
  text-decoration: underline;
}

/* Section Title and Underline for "Thông Tin Cá Nhân" */
.section-title-wrapper {
  margin-bottom: 30px;
  padding-top: 20px;
}

.section-title-profile {
  font-size: 2.5rem;
  font-weight: 700;
  color: #4caf50;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
  display: inline-block;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.section-underline {
  height: 4px;
  background: linear-gradient(90deg, transparent, #4caf50, transparent);
  margin: 0 auto;
  border-radius: 2px;
}

/* Profile card */
.profile-card {
  backdrop-filter: blur(15px);
  border: 2px solid #4caf50;
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: 0 0 25px rgba(76, 175, 80, 0.25);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: rgba(26, 29, 41, 0.9);
}

.profile-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 35px rgba(76, 175, 80, 0.35);
}

/* Profile header */
.profile-header {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  margin-bottom: 2rem;
}

/* Avatar */
.profile-avatar-wrapper {
  width: 160px;
  height: 160px;
  position: relative;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #4caf50;
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.4);
  transition: box-shadow 0.3s ease;
}

.profile-avatar:hover {
  box-shadow: 0 0 30px rgba(76, 175, 80, 0.6);
}

/* User info */
.profile-info {
  flex: 1;
}

.profile-name {
  font-family: "Sora", sans-serif;
  font-size: 2.25rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
  animation: fade-in 0.8s ease-in;
}

.profile-username {
  font-family: "Manrope", sans-serif;
  font-size: 1.5rem;
  color: #4caf50;
  font-weight: 600;
}

/* User details */
.profile-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.detail-row {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(76, 175, 80, 0.05);
  border-radius: 0.5rem;
  border-left: 4px solid #4caf50;
  transition: background 0.3s ease, transform 0.3s ease;
}

.detail-row:hover {
  background: rgba(76, 175, 80, 0.1);
  transform: translateX(5px);
}

.detail-icon {
  font-size: 1.5rem;
  color: #4caf50;
  margin-right: 1rem;
  animation: pulse 2s infinite;
}

.detail-label {
  font-family: "Manrope", sans-serif;
  font-size: 1rem;
  color: #a3a3a3;
  font-weight: 500;
  min-width: 140px;
}

.detail-value {
  font-family: "Manrope", sans-serif;
  font-size: 1.1rem;
  color: #ffffff;
  font-weight: 500;
}

/* Role badges */
.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 1rem;
  font-weight: 600;
  text-transform: capitalize;
}

.role-badge i {
  margin-right: 0.5rem;
}

.role-user {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border: 1px solid #3b82f6;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
  transition: box-shadow 0.3s ease;
}

.role-user:hover {
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
}

.role-author {
  background: rgba(234, 179, 8, 0.2);
  color: #eab308;
  border: 1px solid #eab308;
  animation: pulse 2s infinite;
}

.role-admin {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid #ef4444;
  transition: transform 0.3s ease;
}

.role-admin:hover {
  transform: scale(1.1);
}

/* Navigation tabs */
.profile-nav {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding-top: 1.5rem;
  border-top: 2px solid rgba(76, 175, 80, 0.3);
}

.profile-nav-tab {
  display: flex;
  align-items: center;
  padding: 0.75rem 2rem;
  background: rgba(76, 175, 80, 0.15);
  color: #4caf50;
  font-family: "Sora", sans-serif;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 0.5rem;
  text-decoration: none;
  border: 1px solid #4caf50;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.profile-nav-tab:hover {
  background: #4caf50;
  color: #ffffff;
  box-shadow: 0 0 15px rgba(76, 175, 80, 0.5);
}

.profile-nav-tab::after {
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

.profile-nav-tab:hover::after {
  width: 250px;
  height: 250px;
}

.profile-nav-tab i {
  margin-right: 0.5rem;
}

/* Animations */
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

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

/* Responsive */
/* Responsive */
@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
    max-width: 100%;
  }

  .profile-card {
    padding: 20px 15px;
    border: none;
    background: transparent;
    box-shadow: none;
    backdrop-filter: none;
  }

  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 15px;
    margin-bottom: 25px;
  }
  
  /* Reduced Title Size */
  .section-title-profile {
    font-size: 1.8rem; /* Was likely larger or default 2rem+ */
    margin-bottom: 5px;
  }

  .profile-avatar-wrapper {
    width: 120px;
    height: 120px;
    margin: 0 auto;
  }

  .profile-avatar {
     border-width: 3px;
  }

  .profile-name {
    font-size: 1.5rem; /* Reduced from 1.8rem */
    margin-bottom: 5px;
  }

  .profile-username {
    font-size: 1.1rem;
    opacity: 0.8;
  }

  .profile-details {
    gap: 10px;
    margin-bottom: 30px;
  }

  .detail-row {
    flex-direction: column; /* Stack label and value on very small screens if needed, or row */
    align-items: flex-start;
    padding: 12px;
    background: rgba(255,255,255,0.05);
    border-left: 3px solid #4caf50;
    gap: 5px;
  }

  .detail-icon {
    display: none; /* Hide icons to save space/cleaner look on mobile */
  }

  .detail-label {
    font-size: 0.85rem;
    color: #9ca3af;
    min-width: auto;
    margin-bottom: 2px;
  }

  .detail-value {
    font-size: 1rem;
    color: #fff;
    font-weight: 600;
  }

  .role-badge {
      margin-top: 5px;
      display: inline-flex;
  }

  /* Navigation Buttons - Stacked full width */
  .profile-nav {
    flex-direction: column;
    gap: 10px;
    padding-top: 0;
    border-top: none;
  }

  .profile-nav-tab {
    width: 100%;
    justify-content: space-between; /* Icon left, Text right, or centered */
    justify-content: center;
    padding: 12px;
    font-size: 1rem;
    background: #2a2d3a;
    border-color: rgba(255,255,255,0.1);
    color: #e5e7eb;
  }
  
  .profile-nav-tab:hover {
      background: #4caf50;
      color: #fff;
      border-color: #4caf50;
  }

  .profile-nav-tab i {
      margin-right: 8px;
  }
}
</style>
