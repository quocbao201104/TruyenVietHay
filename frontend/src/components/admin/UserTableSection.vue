<template>
  <div class="user-table-section">
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <div v-else class="user-table-wrapper">
      <table>
        <thead>
          <tr>
            <th @click="requestSort('id')" :class="{ 'sortable': true, 'sorted-asc': sortColumn === 'id' && sortDirection === 'asc', 'sorted-desc': sortColumn === 'id' && sortDirection === 'desc' }">
              ID <i v-if="sortColumn === 'id'" :class="['fas', sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"></i>
            </th>
            <th @click="requestSort('username')" :class="{ 'sortable': true, 'sorted-asc': sortColumn === 'username' && sortDirection === 'asc', 'sorted-desc': sortColumn === 'username' && sortDirection === 'desc' }">
              Username <i v-if="sortColumn === 'username'" :class="['fas', sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"></i>
            </th>
            <th @click="requestSort('email')" :class="{ 'sortable': true, 'sorted-asc': sortColumn === 'email' && sortDirection === 'asc', 'sorted-desc': sortColumn === 'email' && sortDirection === 'desc' }">
              Email <i v-if="sortColumn === 'email'" :class="['fas', sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"></i>
            </th>
            <th @click="requestSort('full_name')" :class="{ 'sortable': true, 'sorted-asc': sortColumn === 'full_name' && sortDirection === 'asc', 'sorted-desc': sortColumn === 'full_name' && sortDirection === 'desc' }">
              Họ & Tên <i v-if="sortColumn === 'full_name'" :class="['fas', sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"></i>
            </th>
            <th @click="requestSort('role')" :class="{ 'sortable': true, 'sorted-asc': sortColumn === 'role' && sortDirection === 'asc', 'sorted-desc': sortColumn === 'role' && sortDirection === 'desc' }">
              Quyền <i v-if="sortColumn === 'role'" :class="['fas', sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"></i>
            </th>
            <th @click="requestSort('status')" :class="{ 'sortable': true, 'sorted-asc': sortColumn === 'status' && sortDirection === 'asc', 'sorted-desc': sortColumn === 'status' && sortDirection === 'desc' }">
              Trạng thái <i v-if="sortColumn === 'status'" :class="['fas', sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"></i>
            </th>
            <th @click="requestSort('created_at')" :class="{ 'sortable': true, 'sorted-asc': sortColumn === 'created_at' && sortDirection === 'asc', 'sorted-desc': sortColumn === 'created_at' && sortDirection === 'desc' }">
              Ngày tạo <i v-if="sortColumn === 'created_at'" :class="['fas', sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"></i>
            </th>
            <th class="text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="users.length === 0">
            <td colspan="8" class="text-center py-4 text-gray-400">Không tìm thấy người dùng nào.</td>
          </tr>
          <tr v-else v-for="(user, index) in users" :key="user.id" :class="['user-row', { 'even-row': index % 2 === 0, 'odd-row': index % 2 !== 0 }]">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.full_name }}</td>
            <td>
              <span class="role-badge" :class="{
                'role-user': user.role === 'user',
                'role-author': user.role === 'author',
                'role-admin': user.role === 'admin',
              }">
                <i :class="{
                  'fas fa-user': user.role === 'user',
                  'fas fa-pen': user.role === 'author',
                  'fas fa-crown': user.role === 'admin',
                }"></i>
                {{ user.role.charAt(0).toUpperCase() + user.role.slice(1) }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="user.status === 'active' ? 'status-active' : 'status-blocked'">
                {{ user.status === 'active' ? 'Hoạt động' : 'Bị khóa' }}
              </span>
              <small v-if="user.status === 'blocked' && user.ban_until" class="ban-until-text">
                đến {{ formatDate(user.ban_until) }}
              </small>
            </td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td class="actions-cell">
              <div class="actions-dropdown" v-click-outside="() => closeDropdown(user.id)">
                <button
                  class="action-btn action-toggle-btn"
                  @click.stop="toggleDropdown(user.id)"
                  :disabled="authStore.user?.id === user.id"
                  title="Tùy chọn hành động"
                >
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="dropdown-menu" :class="{ 'dropdown-up': index >= users.length - 2 }" v-show="activeDropdownId === user.id">
                  <div v-if="user.status === 'active'" class="dropdown-item">
                    <CustomSelect
                      :model-value="selectedBanDuration[user.id] || ''"
                      :options="banDurationOptions"
                      placeholder="Khóa"
                      class="dropdown-select"
                      @update:modelValue="newValue => confirmBan(user.id, newValue)"
                    />
                  </div>
                  <button
                    v-else
                    @click="handleUnbanUser(user.id)"
                    class="dropdown-item dropdown-item-button unlock-btn"
                    title="Mở khóa"
                  >
                    <i class="fas fa-unlock"></i> Mở khóa
                  </button>

                  <div class="dropdown-item">
                    <CustomSelect
                      :model-value="user.role"
                      :options="userRoleOptions"
                      placeholder="Đổi vai trò"
                      class="dropdown-select"
                      @update:modelValue="newRole => handleChangeUserRole(user.id, newRole as ('user' | 'author' | 'admin'))"
                      :disabled="user.role === 'admin'"
                    />
                  </div>

                  <button
                    @click="handleDeleteUser(user.id)"
                    class="dropdown-item dropdown-item-button delete-btn"
                    :disabled="user.role === 'admin'"
                    title="Xóa người dùng"
                  >
                    <i class="fas fa-trash-alt"></i> Xóa
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore } from '@/modules/auth/auth.store';
import CustomSelect from '@/components/common/CustomSelect.vue';
import type { User } from '@/types/user';

// Định nghĩa props mà component này nhận từ component cha
const props = defineProps({
  users: {
    type: Array as () => User[],
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  sortColumn: {
    type: String,
    required: true,
  },
  sortDirection: {
    type: String as () => 'asc' | 'desc',
    required: true,
  },
  selectedBanDuration: {
    type: Object as () => { [key: number]: string | null },
    required: true,
  },
});

// Định nghĩa emit để gửi sự kiện lên component cha
const emit = defineEmits([
  'requestSort',
  'confirmBan',
  'handleUnbanUser',
  'handleDeleteUser',
  'handleChangeUserRole',
]);

const authStore = useAuthStore();

// Trạng thái cho dropdown menu
const activeDropdownId = ref<number | null>(null);

// Directive để xử lý click bên ngoài (đóng dropdown)
const vClickOutside = {
  mounted(el: HTMLElement, binding: any) {
    (el as any).__ClickOutsideHandler__ = (event: MouseEvent) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', (el as any).__ClickOutsideHandler__);
  },
  unmounted(el: HTMLElement) {
    if ((el as any).__ClickOutsideHandler__) {
      document.removeEventListener('click', (el as any).__ClickOutsideHandler__);
    }
  },
};

// Hàm đóng/mở dropdown
const toggleDropdown = (userId: number) => {
  if (activeDropdownId.value === userId) {
    activeDropdownId.value = null; 
  } else {
    activeDropdownId.value = userId;
  }
};

const closeDropdown = (userId: number) => {
    if (activeDropdownId.value === userId) {
        activeDropdownId.value = null;
    }
};

// Computed properties cho options của CustomSelect
const banDurationOptions = computed(() => [
  { value: '1', label: '1 ngày' },
  { value: '3', label: '3 ngày' },
  { value: '5', label: '5 ngày' },
  { value: '7', label: '7 ngày' },
  { value: '30', label: '30 ngày' },
  { value: '0', label: 'Vĩnh viễn' },
]);

const userRoleOptions = computed(() => [
  { value: 'user', label: 'User' },
  { value: 'author', label: 'Author' },
  { value: 'admin', label: 'Admin' },
]);

// Hàm định dạng ngày
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Ngày không hợp lệ";
  }
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};

// Hàm request sắp xếp
const requestSort = (column: string) => {
  emit('requestSort', column);
};

// Hàm confirm Ban
const confirmBan = (userId: number, durationValue: string | number) => {
  emit('confirmBan', userId, durationValue);
  activeDropdownId.value = null; // Đóng dropdown sau khi chọn
};

// Hàm xử lý Unban
const handleUnbanUser = (userId: number) => {
  emit('handleUnbanUser', userId);
  activeDropdownId.value = null; // Đóng dropdown sau khi chọn
};

// Hàm xử lý Delete
const handleDeleteUser = (userId: number) => {
  emit('handleDeleteUser', userId);
  activeDropdownId.value = null; // Đóng dropdown sau khi chọn
};

// Hàm xử lý thay đổi vai trò
const handleChangeUserRole = (userId: number, newRole: 'user' | 'author' | 'admin') => {
  emit('handleChangeUserRole', userId, newRole);
  activeDropdownId.value = null; // Đóng dropdown sau khi chọn
};
</script>

<style scoped>
/* Container chính của bảng người dùng */
.user-table-section {
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  /* font-family: 'Manrope', sans-serif; */
  color: #ffffff;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 4px solid rgba(34, 197, 94, 0.2);
  border-top-color: #22c55e;
  animation: spin 1s linear infinite;
}

.user-table-wrapper {
  overflow-x: auto;
  border-radius: 0.75rem;
  background: rgba(26, 29, 41, 0.7);
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  min-width: 900px;
}

th,
td {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid rgba(34, 197, 94, 0.2);
  vertical-align: middle;
  font-size: 0.9rem;
  /* font-family: 'Manrope', sans-serif; */
}

/* Điều chỉnh chiều rộng cột sau khi bỏ avatar */
th:nth-child(1), td:nth-child(1) { width: 5%; } /* ID */
th:nth-child(2), td:nth-child(2) { width: 15%; } /* Username */
th:nth-child(3), td:nth-child(3) { width: 20%; } /* Email */
th:nth-child(4), td:nth-child(4) { width: 15%; } /* Họ & Tên */
th:nth-child(5), td:nth-child(5) { width: 10%; } /* Quyền */
th:nth-child(6), td:nth-child(6) { width: 20%; } /* Trạng thái */
th:nth-child(7), td:nth-child(7) { width: 12%; } /* Ngày tạo */
th:nth-child(8), td:nth-child(8) { width: 12%; } /* Hành động */


th {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  /* font-family: 'Sora', sans-serif; */
}

.user-row.even-row {
  background-color: rgba(26, 29, 41, 0.7);
}

.user-row.odd-row {
  background-color: rgba(36, 40, 52, 0.7);
}

.user-row:hover {
  background: rgba(34, 197, 94, 0.08);
}

/* Sắp xếp cột */
th.sortable {
  cursor: pointer;
  position: relative;
  padding-right: 25px;
}

th.sortable i {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.3s ease;
}

th.sortable.sorted-asc i {
  color: #22c55e;
}

th.sortable.sorted-desc i {
  color: #22c55e;
}

/* Badges */
.role-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: capitalize;
}

.role-badge i {
  margin-right: 0.4rem;
}

.role-user {
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
  border: 1px solid #93c5fd;
}

.role-author {
  background: rgba(234, 179, 8, 0.15);
  color: #fde047;
  border: 1px solid #fde047;
}

.role-admin {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid #f87171;
}

.status-active {
  background: rgba(34, 197, 94, 0.15);
  color: #6ee7b7;
}

.status-blocked {
  background: rgba(249, 115, 22, 0.15);
  color: #fdba74;
}

.ban-until-text {
  display: block;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.3rem;
}

/* Actions Dropdown */
.actions-cell {
    position: relative; 
    overflow: visible; 
}

.actions-dropdown {
    position: relative;
    display: inline-block;
}

.action-btn.action-toggle-btn {
    padding: 0.5rem;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.action-btn.action-toggle-btn:hover:not(:disabled) {
    background: rgba(34, 197, 94, 0.1);
    border-color: #22c55e;
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: #2a2d3a;
    border: 1px solid #22c55e;
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    min-width: 200px;
    z-index: 10; 
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    color: #e5e7eb;
    font-size: 0.9rem;
    transition: background-color 0.2s ease, color 0.2s ease;
    border-radius: 0.3rem;
}

.dropdown-item-button {
    background: none;
    border: none;
    text-align: left;
    width: 100%;
    cursor: pointer;
}

.dropdown-item:hover:not(:disabled),
.dropdown-item-button:hover:not(:disabled) {
    background-color: rgba(34, 197, 94, 0.15);
    color: #22c55e;
}

.dropdown-item-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.dropdown-select {
    width: 100% !important; 
    font-size: 0.85rem !important; 
}

.unlock-btn {
  color: #22c55e;
}

.delete-btn {
  color: #ef4444;
}

/* Animations */
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .user-table-wrapper {
    overflow-x: auto;
  }
  table {
    min-width: 600px;
  }
  th, td {
    padding: 0.75rem 0.5rem;
    font-size: 0.8rem;
  }
  .action-btn.action-toggle-btn {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
  .dropdown-menu {
      min-width: 140px;
      padding: 0.4rem;
  }
  .dropdown-item, .dropdown-select {
      font-size: 0.8rem !important;
      padding: 0.4rem 0.6rem;
  }
}

.dropdown-menu.dropdown-up {
    top: auto;
    bottom: 100%;
    margin-bottom: 0.5rem;
}
</style>