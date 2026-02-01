<template>
    <div class="user-management-page">

        <main class="user-management-container">
            <section class="admin-dashboard-card">
                <div class="section-title-wrapper">
                    <h2 class="section-title">Quản lý người dùng</h2>
                    <div class="section-underline"></div>
                </div>

                <UserStatsSection
                    :totalUsers="totalUsersCount"
                    :activeUsers="activeUsersCount"
                    :blockedUsers="blockedUsersCount"
                    :authorUsers="authorUsersCount"
                />

                <UserFiltersSection
                    :searchTerm="currentSearchTerm"
                    :selectedRole="selectedRole"
                    :selectedStatus="selectedStatus"
                    @update:searchTerm="newSearchTerm => currentSearchTerm = newSearchTerm"
                    @update:selectedRole="newRole => selectedRole = newRole"
                    @update:selectedStatus="newStatus => selectedStatus = newStatus"
                    @applyFilters="fetchUsers"
                />

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

        if (response.stats) { // Kiểm tra nếu object stats tồn tại
            totalUsersCount.value = response.stats.totalUsers;
            activeUsersCount.value = response.stats.activeUsers;
            blockedUsersCount.value = response.stats.blockedUsers;
            authorUsersCount.value = response.stats.authorUsers;
        } else {

            console.warn("API /api/admin/users không trả về dữ liệu thống kê 'stats'.");
            totalUsersCount.value = 0;
            activeUsersCount.value = 0;
            blockedUsersCount.value = 0;
            authorUsersCount.value = 0;
        }

    } catch (error: any) {
        toast.error('Lỗi khi tải danh sách người dùng: ' + (error.response?.data?.message || error.message));
        console.error('Fetch users error:', error);
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

    if (confirm(`Bạn có chắc chắn muốn cấm người dùng ID ${userId} ${durationDays !== null ? `trong ${durationDays} ngày` : 'vĩnh viễn'}?`)) {
        try {
            await banUserApi(userId, durationDays);
            toast.success('Cấm người dùng thành công!');
            await fetchUsers();
        } catch (error: any) {
            toast.error('Lỗi khi cấm người dùng: ' + (error.response?.data?.message || error.message));
            console.error('Ban user error:', error);
        }
    }
    selectedBanDuration.value[userId] = '';
};

const handleUnbanUser = async (userId: number) => {
    if (confirm(`Bạn có chắc chắn muốn bỏ cấm người dùng ID ${userId}?`)) {
        try {
            await unbanUserApi(userId);
            toast.success('Bỏ cấm người dùng thành công!');
            await fetchUsers();
        } catch (error: any) {
            toast.error('Lỗi khi bỏ cấm người dùng: ' + (error.response?.data?.message || error.message));
            console.error('Unban user error:', error);
        }
    }
};

const handleDeleteUser = async (userId: number) => {
    if (confirm(`Bạn có chắc chắn muốn xóa người dùng ID ${userId} vĩnh viễn?`)) {
        try {
            await deleteUserApi(userId);
            toast.success('Xóa người dùng thành công!');
            await fetchUsers();
        } catch (error: any) {
            toast.error('Lỗi khi xóa người dùng: ' + (error.response?.data?.message || error.message));
            console.error('Delete user error:', error);
        }
    }
};

const handleChangeUserRole = async (userId: number, newRole: 'user' | 'author' | 'admin') => {
    if (confirm(`Bạn có chắc chắn muốn đổi vai trò của người dùng ID ${userId} thành ${newRole}?`)) {
        try {
            await updateUserRoleApi(userId, newRole);
            toast.success(`Đã đổi vai trò của người dùng ID ${userId} thành ${newRole}!`);
            await fetchUsers();
        } catch (error: any) {
            toast.error('Lỗi khi đổi vai trò người dùng: ' + (error.response?.data?.message || error.message));
            console.error('Change user role error:', error);
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
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700&family=Sora:wght@400;600&display=swap');

/* Import Font Awesome for icons */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

/* General Page Layout */
.user-management-page {
    min-height: 100vh;
    background: #1a1d29;
    color: #ffffff;
    position: relative;
    overflow-x: hidden;
    font-family: 'Manrope', sans-serif;
}

.user-management-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2rem;
}

/* Thẻ bao ngoài cho toàn bộ phần admin (thống kê, lọc, bảng, phân trang) */
.admin-dashboard-card {
    background: rgba(26, 29, 41, 0.7);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(34, 197, 94, 0.4);
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.admin-dashboard-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 30px rgba(34, 197, 94, 0.3);
}

.section-title-wrapper {
    margin-bottom: 2rem;
    text-align: center;
}

.section-title {
    font-family: 'Sora', sans-serif;
    font-size: 2rem;
    font-weight: 600;
    color: #22c55e;
    margin-bottom: 0.5rem;
    animation: fade-in 0.8s ease-in;
}

.section-underline {
    height: 3px;
    background: #22c55e;
    width: 80px;
    margin: 0 auto;
    border-radius: 1px;
}

/* Animations */
@keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 768px) {
    .admin-dashboard-card {
        padding: 1.5rem;
    }
    .section-title {
        font-size: 1.75rem;
    }
}

@media (max-width: 480px) {
    .admin-dashboard-card {
        padding: 1rem;
    }
    .section-title {
        font-size: 1.5rem;
    }
}
</style>