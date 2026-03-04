<template>
  <div class="user-management-page-xianxia">
    <main class="user-management-container-aura">
      
      <!-- TIÊU ĐỀ CHƯỞNG QUẢN -->
      <div class="page-header-spirit animate-fadeIn">
        <h1 class="page-title-glow-admin">Khống Chế Chúng Sinh</h1>
        <p class="page-subtitle">Thiên Cơ Lệnh - Quản lý căn cơ và trật tự vạn giới đạo hữu</p>
        <div class="header-divider-spirit admin">
          <div class="dot"></div>
        </div>
      </div>

      <!-- LINH ĐÀI NHÂN SỐ (STATS) -->
      <section class="stats-aura-section animate-fadeIn">
        <UserStatsSection
          :totalUsers="totalUsersCount"
          :activeUsers="activeUsersCount"
          :blockedUsers="blockedUsersCount"
          :authorUsers="authorUsersCount"
        />
      </section>

      <!-- LINH ĐÀI TRUY VẾT (FILTERS) -->
      <section class="filters-aura-section animate-fadeIn">
        <div class="glass-filter-box">
          <UserFiltersSection
            :searchTerm="currentSearchTerm"
            :selectedRole="selectedRole"
            :selectedStatus="selectedStatus"
            @update:searchTerm="newSearchTerm => currentSearchTerm = newSearchTerm"
            @update:selectedRole="newRole => selectedRole = newRole"
            @update:selectedStatus="newStatus => selectedStatus = newStatus"
            @applyFilters="fetchUsers"
          />
        </div>
      </section>

      <!-- BẢNG MỆNH BÀI CHÚNG SINH (TABLE) -->
      <section class="table-aura-section animate-fadeIn">
        <div class="spirit-table-wrapper">
          <UserTableSection
            :users="users"
            :isLoading="isLoading"
            :sortColumn="sortColumn"
            :sortDirection="sortDirection"
            :selectedBanDuration="selectedBanDuration"
            @requestSort="requestSort"
            @confirmBan="confirmBan"
            @handleUnbanUser="handleUnbanUser"
            @handleDeleteUser="handleDeleteUser"
            @handleChangeUserRole="handleChangeUserRole"
          />
        </div>
      </section>

      <!-- PHÂN TẦNG LINH TRẬN (PAGINATION) -->
      <section class="pagination-aura-area">
        <PaginationSection
          :currentPage="currentPage"
          :totalPages="totalPages"
          @goToPage="goToPage"
        />
      </section>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/modules/auth/auth.store';
import {
    getUsersApi,
    banUserApi,
    unbanUserApi,
    deleteUserApi,
    updateUserRoleApi,
} from '@/modules/user/user.api';

import UserStatsSection from '@/components/admin/UserStatsSection.vue';
import UserFiltersSection from '@/components/admin/UserFiltersSection.vue';
import UserTableSection from '@/components/admin/UserTableSection.vue';
import PaginationSection from '@/components/admin/PaginationSection.vue';

import type { User } from '@/types/user';

const toast = useToast();
const authStore = useAuthStore();

const users = ref<User[]>([]);
const isLoading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const currentSearchTerm = ref('');
const selectedRole = ref('');
const selectedStatus = ref('');
const limit = 10;
const selectedBanDuration = ref<{ [key: number]: string | null }>({});

const totalUsersCount = ref(0);
const activeUsersCount = ref(0);
const blockedUsersCount = ref(0);
const authorUsersCount = ref(0);

const sortColumn = ref('id');
const sortDirection = ref<'asc' | 'desc'>('asc');

const fetchUsers = async () => {
    isLoading.value = true;
    try {
        const response = await getUsersApi({
            page: currentPage.value,
            limit: limit,
            search: currentSearchTerm.value,
            role: selectedRole.value,
            status: selectedStatus.value,
            sortBy: sortColumn.value,
            sortOrder: sortDirection.value,
        });
        users.value = response.data;
        totalPages.value = response.pagination.totalPages;
        currentPage.value = response.pagination.page;

        if (response.stats) {
            totalUsersCount.value = response.stats.totalUsers;
            activeUsersCount.value = response.stats.activeUsers;
            blockedUsersCount.value = response.stats.blockedUsers;
            authorUsersCount.value = response.stats.authorUsers;
        }
    } catch (error: any) {
        toast.error('Cảm ứng thất bại: ' + (error.response?.data?.message || error.message));
    } finally {
        isLoading.value = false;
    }
};

const requestSort = (column: string) => {
    if (sortColumn.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn.value = column;
        sortDirection.value = 'asc';
    }
    fetchUsers();
};

const confirmBan = async (userId: number, durationValue: string | number) => {
    selectedBanDuration.value[userId] = durationValue.toString();
    const durationDays = durationValue === '0' ? null : Number(durationValue);

    if (confirm(`Trục xuất đạo hữu ID ${userId} vào hư không ${durationDays !== null ? `trong ${durationDays} ngày` : 'vĩnh viễn'}?`)) {
        try {
            await banUserApi(userId, durationDays);
            toast.success('Đã thi triển cấm chế thành công!');
            await fetchUsers();
        } catch (error: any) {
            toast.error('Pháp lực không đủ: ' + (error.response?.data?.message || error.message));
        }
    }
    selectedBanDuration.value[userId] = '';
};

const handleUnbanUser = async (userId: number) => {
    if (confirm(`Giải trừ phong ấn cho đạo hữu ID ${userId}?`)) {
        try {
            await unbanUserApi(userId);
            toast.success('Đã thu hồi cấm chế!');
            await fetchUsers();
        } catch (error: any) {
            toast.error('Thao tác thất bại!');
        }
    }
};

const handleDeleteUser = async (userId: number) => {
    if (confirm(`Làm biến mất hoàn toàn đạo hữu ID ${userId} khỏi lục giới?`)) {
        try {
            await deleteUserApi(userId);
            toast.success('Đã xóa bỏ danh tính!');
            await fetchUsers();
        } catch (error: any) {
            toast.error('Thao tác thất bại!');
        }
    }
};

const handleChangeUserRole = async (userId: number, newRole: 'user' | 'author' | 'admin') => {
    if (confirm(`Cải biến căn cơ của đạo hữu ID ${userId} thành ${newRole}?`)) {
        try {
            await updateUserRoleApi(userId, newRole);
            toast.success(`Đã cải biến thiên phú thành công!`);
            await fetchUsers();
        } catch (error: any) {
            toast.error('Không thể cải biến căn cơ!');
        }
    }
};

const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

onMounted(() => {
    fetchUsers();
});

watch(currentPage, () => {
    fetchUsers();
});
</script>

<style scoped>
/* ===== CORE THEME ADMIN XIANXIA ===== */
.user-management-page-xianxia {
  min-height: 100vh;
  background: #0b0f19; /* Nền tối sâu đồng bộ */
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
  padding-bottom: 80px;
}

.user-management-container-aura {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* Page Header */
.page-title-glow-admin {
  font-size: 3rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 5px;
  background: linear-gradient(to right, #a78bfa, #fff, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  filter: drop-shadow(0 0 15px rgba(167, 139, 250, 0.4));
}

.page-subtitle {
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.85rem;
  font-weight: 700;
  text-align: center;
  margin-top: 10px;
}

.header-divider-spirit {
  height: 1px;
  width: 300px;
  background: linear-gradient(90deg, transparent, #a78bfa, transparent);
  margin: 20px auto 50px;
  position: relative;
}
.header-divider-spirit .dot {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);
  width: 10px; height: 10px; background: #a78bfa; box-shadow: 0 0 10px #a78bfa;
}

/* Filter Box Glassmorphism */
.glass-filter-box {
  background: rgba(19, 27, 44, 0.6);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 24px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

/* Table Section */
.table-aura-section {
  background: #131b2c;
  border: 1px solid #1e293b;
  border-radius: 24px;
  padding: 5px; /* Để bảng tràn viền mượt */
  box-shadow: 0 15px 40px rgba(0,0,0,0.4);
  overflow: hidden;
}

.spirit-table-wrapper {
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #a78bfa #0b0f19;
}

/* Stats Area */
.stats-aura-section {
  margin-bottom: 40px;
}

/* Pagination Xianxia Area */
.pagination-aura-area {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

/* Animations */
@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.8s ease-out; }

/* Responsive */
@media (max-width: 1024px) {
  .page-title-glow-admin { font-size: 2.2rem; }
  .user-management-container-aura { padding: 20px 15px; }
}

@media (max-width: 640px) {
  .page-title-glow-admin { font-size: 1.8rem; }
}
</style>