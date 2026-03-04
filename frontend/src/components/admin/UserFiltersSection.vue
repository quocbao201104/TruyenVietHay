<template>
  <div class="user-filters-section">
    <div class="filter-search-group">
      <div class="search-wrapper">
        <i class="fas fa-search search-icon"></i>
        <input
          :value="searchTerm"
          type="text"
          placeholder="Tìm kiếm theo username, email, tên..."
          class="search-input"
          @input="updateSearchTerm"
          @keyup.enter="applyFilters"
        />
      </div>

      <CustomSelect
        :model-value="selectedRole"
        :options="roleOptions"
        placeholder="Tất cả vai trò"
        class="filter-wrapper"
        @update:modelValue="updateRole"
      />
      <CustomSelect
        :model-value="selectedStatus"
        :options="statusOptions"
        placeholder="Tất cả trạng thái"
        class="filter-wrapper"
        @update:modelValue="updateStatus"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CustomSelect from '@/components/common/CustomSelect.vue';

// Định nghĩa các props mà component này sẽ nhận
const props = defineProps({
  searchTerm: {
    type: String,
    default: '',
  },
  selectedRole: {
    type: String,
    default: '',
  },
  selectedStatus: {
    type: String,
    default: '',
  },
});

// Định nghĩa các emit để gửi sự kiện lên component cha
const emit = defineEmits(['update:searchTerm', 'update:selectedRole', 'update:selectedStatus', 'applyFilters']);

// Computed properties cho options của CustomSelect
const roleOptions = computed(() => [
  { value: '', label: 'Tất cả vai trò' },
  { value: 'user', label: 'User' },
  { value: 'author', label: 'Author' },
  { value: 'admin', label: 'Admin' },
]);

const statusOptions = computed(() => [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hoạt động' },
  { value: 'blocked', label: 'Bị khóa' },
]);

// Hàm cập nhật searchTerm và emit sự kiện
const updateSearchTerm = (event: Event) => {
  emit('update:searchTerm', (event.target as HTMLInputElement).value);
};

// Hàm cập nhật selectedRole và emit sự kiện cùng với applyFilters
const updateRole = (newValue: string) => {
  emit('update:selectedRole', newValue);
  emit('applyFilters');
};

// Hàm cập nhật selectedStatus và emit sự kiện cùng với applyFilters
const updateStatus = (newValue: string) => {
  emit('update:selectedStatus', newValue);
  emit('applyFilters');
};

// Hàm emit sự kiện applyFilters khi nhấn Enter trong ô tìm kiếm
const applyFilters = () => {
  emit('applyFilters');
};
</script>

<style scoped>
/* Container chính của phần lọc và tìm kiếm */
.user-filters-section {
  border: 1px solid rgba(34, 197, 94, 0.3); 
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  /* font-family: 'Manrope', sans-serif; */
}

/* Nhóm các input và select */
.filter-search-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  align-items: center;
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
}

.search-input {
  width: 100%;
  padding: 0.9rem 0.9rem 0.9rem 3rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid #22c55e;
  color: #ffffff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-input:focus {
  outline: none;
  border-color: #4ade80;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.4);
}

.filter-wrapper {
  width: 100%;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .filter-search-group {
    grid-template-columns: 1fr;
  }
}
</style>