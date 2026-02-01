<template>
  <header class="header">
    <div class="header-content">
      <div class="header-left">
        <router-link to="/truyen-chu" class="logo-link">
          <img
            src="@/assets/images/logo.png"
            alt="TruyenVietHay Logo"
            class="logo"
          />
        </router-link>

        <div class="search-bar" @click="handleSearchBarClick">
          <i class="fas fa-magnifying-glass search-icon"></i>
          <input
            ref="searchInputRef"
            type="text"
            placeholder="Tìm kiếm truyện..."
            class="search-input"
            v-model="searchQuery"
            @input="handleSearchInput"
            @focus="handleSearchFocus"
            @keydown.enter="handleSearchSubmit"
          />
          <i 
            v-if="searchQuery" 
            class="fas fa-times-circle clear-icon" 
            @click="clearSearch"
          ></i>
          
          <!-- Search Suggestions Dropdown -->
          <div 
            v-if="showSuggestions && searchQuery" 
            class="search-suggestions"
            @mousedown.prevent
          >
            <!-- Loading State -->
            <div v-if="searchLoading" class="suggestion-loading">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Đang tìm kiếm...</span>
            </div>

            <!-- No Results -->
            <div v-else-if="searchResults.length === 0" class="suggestion-empty">
              <i class="fas fa-search"></i>
              <span>Không tìm thấy kết quả cho "{{ searchQuery }}"</span>
            </div>

            <!-- Results List -->
            <div v-else class="suggestion-results">
              <router-link
                v-for="story in searchResults"
                :key="story.id"
                :to="`/truyen-chu/${story.slug}`"
                class="suggestion-story-item"
                @click="closeSuggestions"
              >
                <img 
                  :src="getStoryImageUrl(story.anh_bia)"
                  :alt="story.ten_truyen"
                  class="suggestion-cover"
                  @error="handleImageError"
                />
                <div class="suggestion-info">
                  <div class="suggestion-title">{{ story.ten_truyen }}</div>
                  <div class="suggestion-author">
                    <i class="fas fa-pen-nib"></i>
                    {{ story.tac_gia || 'Đang cập nhật' }}
                  </div>
                  <div class="suggestion-stats">
                    <span><i class="fas fa-eye"></i> {{ formatViews(story.luot_xem) }}</span>
                  </div>
                </div>
              </router-link>

              <!-- See All Results Button -->
              <router-link
                :to="`/tim-kiem?keyword=${encodeURIComponent(searchQuery)}`"
                class="suggestion-see-all"
                @click="closeSuggestions"
              >
                <i class="fas fa-arrow-right"></i>
                Xem toàn bộ kết quả
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="header-right">
        <nav class="nav-menu">
          <router-link to="/the-loai" class="nav-link">Thể loại</router-link>

          <router-link to="/xep-hang" class="nav-link">Xếp Hạng</router-link>
          
          <router-link to="/truyen-hot" class="nav-link"
            >Truyện Hot</router-link
          >
          <router-link to="/tim-kiem" class="nav-link">Tìm kiếm</router-link>

        </nav>

        <span class="separator">|</span>

        <!-- Notification Bell -->
        <div v-if="isLoggedIn" class="notification-wrapper">
          <div class="notification-icon-container" @click="toggleNotification">
            <i
              class="fas fa-bell notification-icon"
              :class="{ active: showNotifications }"
            ></i>
            <span v-if="unreadCount > 0" class="notification-badge">{{
              unreadCount > 99 ? "99+" : unreadCount
            }}</span>
          </div>

          <div
            v-if="showNotifications"
            class="notification-dropdown"
            @click.stop
          >
            <div class="notification-header">
              <h3>Thông báo</h3>
              <button
                v-if="unreadCount > 0"
                @click="markAllRead"
                class="mark-all-read"
              >
                Đánh dấu tất cả đã đọc
              </button>
            </div>

            <div class="notification-list">
              <div v-if="notifications.length === 0" class="notification-empty">
                <i class="far fa-bell-slash"></i>
                <p>Không có thông báo nào</p>
              </div>

              <div
                v-else
                v-for="notif in notifications"
                :key="notif.id"
                class="notification-item"
                :class="{ unread: notif.status === 'unread' }"
                @click="handleNotificationClick(notif)"
              >
                <div class="notif-icon">
                  <i class="fas fa-info-circle" style="color: #4caf50"></i>
                </div>
                <div class="notif-content">
                  <p v-html="notif.content"></p>
                  <span class="notif-time">{{
                    formatTime(notif.created_at)
                  }}</span>
                </div>
                <div
                  v-if="notif.status === 'unread'"
                  class="notif-status"
                ></div>
              </div>

              <div
                v-if="hasMore"
                class="load-more-notif"
                @click="loadMoreNotifications"
              >
                Xem thêm
              </div>
            </div>
          </div>
        </div>

        <div v-if="isLoggedIn" class="user-menu">
          <div class="avatar-wrapper" @click="toggleDropdown">
            <img
              :src="avatarUrl"
              alt="User Avatar"
              class="user-avatar"
              @error="handleAvatarError"
              crossorigin="anonymous"
            />

            <i
              class="fas fa-caret-down dropdown-toggle-icon"
              :class="{ rotate: showDropdown }"
            ></i>
          </div>

          <div v-if="showDropdown" class="user-dropdown">
            <div class="user-greeting">
              <img
                :src="avatarUrl"
                alt="User Avatar"
                class="greeting-avatar"
                @error="handleAvatarError"
                crossorigin="anonymous"
              />
              <span>Chào, {{ userFullName }}!</span>
            </div>
            <router-link to="/user/thong-tin-ca-nhan" class="dropdown-item">
              <i class="fas fa-user"></i> Thông Tin Cá Nhân
            </router-link>
            <router-link to="/user/truyen-theo-doi" class="dropdown-item">
              <i class="fas fa-bookmark"></i> Truyện Theo Dõi
            </router-link>
            <router-link to="/user/lich-su-doc" class="dropdown-item">
              <i class="fas fa-history"></i> Lịch Sử Đọc
            </router-link>
            <router-link to="/user/cai-dat-thong-tin" class="dropdown-item">
              <i class="fas fa-cog"></i> Cài Đặt Thông Tin
            </router-link>
            <div class="dropdown-item logout" @click="handleLogout">
              <i class="fas fa-sign-out-alt"></i> Đăng Xuất
            </div>
          </div>
        </div>

        <router-link v-else to="/dang-nhap" class="login-button">
          <i class="fas fa-user login-icon"></i>
          Đăng nhập
        </router-link>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAppToast } from "@/composables/useAppToast";
import { useAuthStore } from "@/modules/auth/auth.store";
import axios from "@/utils/axios";
import { useNotificationStore } from "@/modules/notification/notification.store";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getAvatarUrl, getImageUrl } from "@/config/constants";

export default {
  name: "AppHeader",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const showDropdown = ref(false);
    const searchQuery = ref("");
    const showSuggestions = ref(false);
    const searchResults = ref([]);
    const searchLoading = ref(false);
    const searchInputRef = ref(null);
    let searchTimeout = null;

    const notificationStore = useNotificationStore();
    const showNotifications = ref(false);

    // Watch login state
    watch(() => authStore.token, (newToken) => {
        if (newToken) {
            notificationStore.fetchNotifications(true);
        } else {
            notificationStore.$reset();
        }
    });

    onMounted(() => {
      authStore.initialize();
      if (authStore.token) {
         notificationStore.fetchNotifications(true);
      }
      document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
      if (searchTimeout) clearTimeout(searchTimeout);
    });

    const isLoggedIn = computed(() => !!authStore.token && !!authStore.user);

    const userFullName = computed(
      () => authStore.user?.full_name || "Người dùng"
    );

    const avatarUrl = computed(() => {
      return getAvatarUrl(authStore.user?.avatar);
    });

    const avatarErrored = ref(false);

    const handleAvatarError = (event) => {
      if (!avatarErrored.value) {
        console.warn("Avatar load failed, switching to fallback.");
        avatarErrored.value = true;
        event.target.src = getAvatarUrl(null);
      } else {
        console.error("Fallback avatar also failed. Giving up.");
      }
    };

    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value;
      if (showDropdown.value) showNotifications.value = false;
    };

    const { showSuccessToast } = useAppToast();

    const handleLogout = () => {
      authStore.logout();
      showDropdown.value = false;
      showSuccessToast("Đăng xuất thành công!");
      router.push("/truyen-chu");
    };

    // ===== Search Functionality =====
    const performSearch = async (keyword) => {
      if (!keyword || keyword.trim().length < 2) {
        searchResults.value = [];
        return;
      }

      searchLoading.value = true;
      try {
        const response = await axios.get('/api/truyen/public', {
          params: {
            keyword: keyword.trim(),
            limit: 5,
            sort_by: 'luot_xem',
            order: 'DESC'
          }
        });
        
        searchResults.value = response.data.data || [];
      } catch (error) {
        console.error('Search error:', error);
        searchResults.value = [];
      } finally {
        searchLoading.value = false;
      }
    };

    const handleSearchInput = () => {
      if (searchTimeout) clearTimeout(searchTimeout);
      
      searchTimeout = setTimeout(() => {
        performSearch(searchQuery.value);
      }, 300); // Debounce 300ms
    };

    const handleSearchFocus = () => {
      showSuggestions.value = true;
      if (searchQuery.value && searchQuery.value.trim().length >= 2) {
        performSearch(searchQuery.value);
      }
    };

    const handleSearchBarClick = (event) => {
      // Prevent bubbling to document click handler
      event.stopPropagation();
    };

    const handleClickOutside = (event) => {
      const searchBar = event.target.closest('.search-bar');
      const notifWrapper = event.target.closest('.notification-wrapper');
      const userMenu = event.target.closest('.user-menu');

      if (!searchBar) {
        showSuggestions.value = false;
      }
      if (!notifWrapper) {
         showNotifications.value = false;
      }
      if (!userMenu) {
         showDropdown.value = false;
      }
    };

    const clearSearch = () => {
      searchQuery.value = '';
      searchResults.value = [];
      showSuggestions.value = false;
    };

    const closeSuggestions = () => {
      showSuggestions.value = false;
    };

    const handleSearchSubmit = () => {
      if (searchQuery.value.trim()) {
        router.push(`/tim-kiem?keyword=${encodeURIComponent(searchQuery.value.trim())}`);
        showSuggestions.value = false;
      }
    };

    const getStoryImageUrl = (imagePath) => {
      return getImageUrl(imagePath);
    };

    const handleImageError = (event) => {
      event.target.src = '/placeholder.jpg';
    };

    const formatViews = (views) => {
      if (!views) return '0';
      if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
      if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
      return views.toString();
    };

    // Notification logic
    const notifications = computed(() => notificationStore.notifications);
    const unreadCount = computed(() => notificationStore.unreadCount);
    const hasMore = computed(() => notificationStore.hasMore);

    const toggleNotification = () => {
        showNotifications.value = !showNotifications.value;
        if (showNotifications.value) {
             showDropdown.value = false;
        }
    };
    
    const handleNotificationClick = async (notif) => {
        if (notif.status === 'unread') {
            await notificationStore.markAsRead(notif.id);
        }
    };

    const markAllRead = async () => {
        await notificationStore.markAllAsRead();
    };

    const loadMoreNotifications = async (e) => {
        e.stopPropagation();
        await notificationStore.fetchNotifications();
    };
    
    const formatTime = (date) => {
        if (!date) return '';
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
        } catch (e) {
            return 'Vừa xong';
        }
    };

    return {
      isLoggedIn,
      userFullName,
      avatarUrl,
      showDropdown,
      toggleDropdown,
      handleLogout,
      searchQuery,
      showSuggestions,
      searchResults,
      searchLoading,
      searchInputRef,
      handleSearchInput,
      handleSearchFocus,
      handleSearchBarClick,
      clearSearch,
      closeSuggestions,
      handleSearchSubmit,
      getStoryImageUrl,
      handleImageError,
      formatViews,
      handleAvatarError,

      // Notifications
      toggleNotification,
      showNotifications,
      notifications,
      unreadCount,
      hasMore,
      handleNotificationClick,
      markAllRead,
      loadMoreNotifications,
      formatTime
    };
      

  },
};
</script>

<style scoped>
/* Import Google Fonts cho typography */
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");

/* Header */
.header {
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: #1a1d29;
  animation: fadeInScale 0.6s ease-in-out;
}

/* Hiệu ứng fade-in và scale cho header */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Hiệu ứng fade-in từ trái cho header-left */
.header-left {
  animation: fadeInLeft 0.8s ease-in-out;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Hiệu ứng fade-in từ phải cho header-right */
.header-right {
  animation: fadeInRight 0.8s ease-in-out;
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

/* Bên trái: Logo và Tìm kiếm */
.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-left: 0;
}

/* Logo */
.logo-link {
  text-decoration: none;
}

.logo {
  width: 100px;
  height: auto;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

/* Thanh tìm kiếm */
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  border: 2px solid #4caf50;
  border-radius: 25px;
  padding: 8px 12px;
  width: 280px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

.search-bar:hover {
  border-color: #4caf50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
}

.search-bar:has(.search-input:focus) {
  border-color: #4caf50;
  box-shadow: 0 0 15px rgba(76, 175, 80, 0.5);
}

.search-icon {
  font-size: 1rem;
  color: #cccccc;
  margin-right: 10px;
}

.search-input {
  background: none;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 0.85rem;
  width: 100%;
}

.search-input::placeholder {
  color: #cccccc;
}

.clear-icon {
  font-size: 0.9rem;
  color: #999;
  cursor: pointer;
  transition: color 0.3s ease;
  margin-left: 8px;
}

.clear-icon:hover {
  color: #ff6b6b;
}

/* Search Suggestions Dropdown */
.search-suggestions {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #2a2d3a;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  animation: slideDown 0.3s ease-out;
  border: 1px solid rgba(76, 175, 80, 0.2);
  max-height: 450px;
  overflow-y: auto;
  min-width: 400px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading State */
.suggestion-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 30px 20px;
  color: #4caf50;
  font-size: 0.9rem;
}

.suggestion-loading i {
  font-size: 1.2rem;
}

/* Empty State */
.suggestion-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 30px 20px;
  color: #999;
  font-size: 0.85rem;
  text-align: center;
}

.suggestion-empty i {
  font-size: 2rem;
  opacity: 0.5;
}

/* Results Container */
.suggestion-results {
  padding: 8px;
}

/* Story Item in Suggestions */
.suggestion-story-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.suggestion-story-item:last-of-type {
  border-bottom: none;
}

.suggestion-story-item:hover {
  background: rgba(76, 175, 80, 0.1);
  transform: translateX(5px);
}

.suggestion-cover {
  width: 50px;
  height: 70px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.suggestion-info {
  flex-grow: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.suggestion-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.3;
}

.suggestion-author {
  font-size: 0.75rem;
  color: #999;
  display: flex;
  align-items: center;
  gap: 5px;
}

.suggestion-author i {
  font-size: 0.7rem;
}

.suggestion-stats {
  font-size: 0.7rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}

.suggestion-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.suggestion-stats i {
  color: #4caf50;
  font-size: 0.7rem;
}

/* See All Results Button */
.suggestion-see-all {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  margin-top: 8px;
  background: linear-gradient(135deg, #4caf50, #66bb6a);
  color: #ffffff;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.suggestion-see-all:hover {
  background: linear-gradient(135deg, #66bb6a, #4caf50);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  transform: translateY(-2px);
}

.suggestion-see-all i {
  font-size: 0.9rem;
  transition: transform 0.3s ease;
}

.suggestion-see-all:hover i {
  transform: translateX(5px);
}

/* Custom Scrollbar for Suggestions */
.search-suggestions::-webkit-scrollbar {
  width: 6px;
}

.search-suggestions::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.search-suggestions::-webkit-scrollbar-thumb {
  background: rgba(76, 175, 80, 0.3);
  border-radius: 10px;
}

.search-suggestions::-webkit-scrollbar-thumb:hover {
  background: rgba(76, 175, 80, 0.5);
}

/* Bên phải: Menu và Đăng nhập */
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-right: 0;
}

/* Menu điều hướng */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  position: relative;
  color: #ffffff;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #4caf50;
}

/* Hiệu ứng gạch chân khi hover */
.nav-link::after {
  content: "";
  position: absolute;
  width: 0;
  height: 2px;
  background: #4caf50;
  bottom: -4px;
  left: 0;
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}

/* Các style liên quan đến dropdown Thể loại đã bị xóa */
/* .dropdown, .dropdown-toggle, .genre-toggle-icon, .dropdown-menu, .dropdown-item, .dropdown-divider không còn được sử dụng */

/* Dấu phân cách */
.separator {
  color: #cccccc;
  font-size: 1.5rem;
  line-height: 1;
}

/* Nút Đăng nhập */
.login-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  background: #ffffff;
  color: #1a1a1a;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 25px;
  border: 1px solid #ffffff;
  transition: all 0.3s ease;
}

.login-icon {
  font-size: 0.8rem;
}

.login-button:hover {
  background: #e0e0e0;
  border-color: #e0e0e0;
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}


/* Notification Styles */
.notification-wrapper {
    position: relative;
    cursor: pointer;
    margin-right: 15px;
}

.notification-icon-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    transition: background 0.3s;
}

.notification-icon-container:hover {
    background: rgba(255, 255, 255, 0.1);
}

.notification-icon {
    font-size: 1.2rem;
    color: #e0e0e0;
    transition: color 0.3s;
}

.notification-icon.active {
    color: #4caf50;
}

.notification-badge {
    position: absolute;
    top: 5px;
    right: 5px;
    background: #ef4444;
    color: white;
    font-size: 0.65rem;
    font-weight: bold;
    min-width: 16px;
    height: 16px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    border: 2px solid #1a1d29;
}

.notification-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: -60px; /* Adjust based on alignment */
    width: 360px;
    background: #2a2d3a; /* Darker background */
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 1001;
    overflow: hidden;
    animation: fadeIn 0.2s ease-out;
}

.notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.2);
}

.notification-header h3 {
    margin: 0;
    font-size: 1rem;
    color: #fff;
    font-weight: 600;
}

.mark-all-read {
    background: none;
    border: none;
    color: #4caf50;
    font-size: 0.8rem;
    cursor: pointer;
    padding: 0;
}

.mark-all-read:hover {
    text-decoration: underline;
}

.notification-list {
    max-height: 400px;
    overflow-y: auto;
}

.notification-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    cursor: pointer;
    transition: background 0.2s;
    position: relative;
}

.notification-item:hover {
    background: rgba(255, 255, 255, 0.05);
}

.notification-item.unread {
    background: rgba(76, 175, 80, 0.1);
}

.notif-content {
    flex: 1;
}

.notif-content p {
    margin: 0 0 4px 0;
    font-size: 0.9rem;
    color: #e0e0e0;
    line-height: 1.4;
}

.notif-time {
    font-size: 0.75rem;
    color: #9ca3af;
}

.notif-status {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4caf50;
    margin-top: 6px;
}

.load-more-notif {
    text-align: center;
    padding: 10px;
    color: #4caf50;
    font-size: 0.85rem;
    cursor: pointer;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.load-more-notif:hover {
    background: rgba(255, 255, 255, 0.05);
}

.notification-empty {
    padding: 40px 20px;
    text-align: center;
    color: #9ca3af;
}

.notification-empty i {
    font-size: 2rem;
    margin-bottom: 10px;
    opacity: 0.5;
}


/* Scrollbar for notification list */
.notification-list::-webkit-scrollbar {
    width: 6px;
}
.notification-list::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
}
.notification-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

/* Avatar và Dropdown người dùng */
.user-menu {
  position: relative;
}

.avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  position: relative;
}

.user-avatar {
  width: 33px;
  height: 33px;
  border-radius: 50%;
  border: 2px solid #4caf50;
  object-fit: cover;
  transition: all 0.3s ease;
}

.avatar-wrapper:hover .user-avatar {
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(76, 175, 80, 0.5);
}

.avatar-wrapper:hover::after {
  content: "";
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(76, 175, 80, 0.3);
  animation: ripple 1s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.dropdown-toggle-icon {
  color: #ffffff;
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.dropdown-toggle-icon.rotate {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: linear-gradient(
    135deg,
    rgba(34, 34, 34, 0.9) 0%,
    rgba(51, 51, 51, 0.9) 100%
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
  z-index: 100;
  min-width: 290px;
  animation: scaleFadeIn 0.3s ease-out;
}

@keyframes scaleFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.user-greeting {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  color: #4caf50;
  font-weight: 600;
  font-size: 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  animation: pulseGlow 2s infinite ease-in-out;
}

.greeting-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #4caf50;
  object-fit: cover;
}

@keyframes pulseGlow {
  0% {
    box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(76, 175, 80, 0.5);
  }
  100% {
    box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
  }
}

.user-dropdown .dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  color: #ffffff;
  font-size: 0.8rem;
  border-radius: 5px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.user-dropdown .dropdown-item i {
  color: #4caf50;
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.user-dropdown .dropdown-item:hover i {
  transform: rotate(15deg);
}

.user-dropdown .dropdown-item:hover {
  background: linear-gradient(
    90deg,
    rgba(76, 175, 80, 0.2) 0%,
    rgba(255, 215, 0, 0.2) 100%
  );
  color: #ffffff;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
  transform: translateX(5px);
}

.user-dropdown .dropdown-item:hover span {
  background: linear-gradient(90deg, #4caf50, #ffd700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.user-dropdown .dropdown-item::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.user-dropdown .dropdown-item:hover::after {
  transform: translateX(100%);
}

.user-dropdown .logout {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #d32f2f;
  cursor: pointer;
}

.user-dropdown .logout:hover {
  background: linear-gradient(
    90deg,
    rgba(211, 47, 47, 0.2) 0%,
    rgba(255, 85, 85, 0.2) 100%
  );
  color: #ff5555;
  box-shadow: 0 0 10px rgba(211, 47, 47, 0.3);
  transform: translateX(5px);
}

.user-dropdown .logout:hover span {
  background: linear-gradient(90deg, #d32f2f, #ff5555);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 10px;
  }

  .header-left {
    width: 100%;
    justify-content: space-between;
  }

  .logo {
    width: 100px;
  }

  .search-bar {
    width: 100%;
    max-width: 250px;
    padding: 6px 10px;
  }

  .search-input {
    font-size: 0.8rem;
  }

  .search-icon {
    font-size: 0.9rem;
  }

  .header-right {
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }

  .nav-menu {
    gap: 10px;
  }

  .nav-link,
  .dropdown-toggle {
    font-size: 0.7rem;
  }

  .dropdown-menu {
    left: -50%;
    transform: translateX(50%);
  }

  .dropdown-item {
    font-size: 0.7rem;
  }

  .genre-toggle-icon {
    font-size: 0.7rem;
  }

  .separator {
    font-size: 1.2rem;
  }

  .login-button {
    font-size: 0.7rem;
    padding: 4px 10px;
  }

  .login-icon {
    font-size: 0.7rem;
  }

  .user-avatar {
    width: 28px;
    height: 28px;
  }

  .dropdown-toggle-icon {
    font-size: 0.8rem;
  }

  .user-dropdown {
    right: -10px;
    min-width: 180px;
  }

  .greeting-avatar {
    width: 20px;
    height: 20px;
  }

  .user-greeting {
    font-size: 0.8rem;
  }

  .user-dropdown .dropdown-item {
    font-size: 0.7rem;
    padding: 8px 12px;
  }

  .user-dropdown .dropdown-item i {
    font-size: 0.9rem;
  }
}
</style>
