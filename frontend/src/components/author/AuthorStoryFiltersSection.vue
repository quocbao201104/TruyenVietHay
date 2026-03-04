<template>
  <div class="author-story-filters">
    <div class="filter-row">
      <!-- Keyword Search -->
      <div class="filter-group keyword-group">
        <label for="keyword" class="filter-label">Từ khóa</label>
        <div class="input-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input
            id="keyword"
            v-model="filters.keyword"
            type="text"
            placeholder="Tìm theo tên truyện..."
            class="filter-input"
            @keyup.enter="applyFilters"
          />
        </div>
      </div>

       <!-- Category Filter -->
       <div class="filter-group">
        <label for="category" class="filter-label">Thể loại</label>
        <select id="category" v-model="filters.category_id" class="filter-select">
          <option v-for="cat in formattedCategories" :key="cat.value" :value="cat.value">
            {{ cat.label }}
          </option>
        </select>
      </div>

      <!-- Status Filter -->
      <div class="filter-group">
        <label for="status" class="filter-label">Trạng thái</label>
        <select id="status" v-model="filters.trang_thai_kiem_duyet" class="filter-select">
          <option value="">Tất cả trạng thái</option>
          <option value="cho_duyet">Chờ duyệt</option>
          <option value="duyet">Đã duyệt</option>
          <option value="tu_choi">Bị từ chối</option>
        </select>
      </div>

      <!-- Buttons -->
      <div class="filter-buttons">
        <button @click="applyFilters" class="btn btn-apply">
          <i class="fas fa-filter"></i> Lọc
        </button>
        <button @click="clearFilters" class="btn btn-clear">
          <i class="fas fa-sync-alt"></i> Đặt lại
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps({
  categories: {
    type: Array as () => any[],
    default: () => [],
  },
});

const emit = defineEmits(['apply-filters', 'clear-filters']);

const filters = ref({
  keyword: '',
  trang_thai_kiem_duyet: '',
  category_id: null as number | null,
});

const formattedCategories = computed(() => {
  if (!Array.isArray(props.categories)) return [{ value: null, label: 'Tất cả thể loại' }];
  return [{ value: null, label: 'Tất cả thể loại' }, ...props.categories.map(cat => ({
    value: cat.id_theloai,
    label: cat.ten_theloai,
  }))];
});

const applyFilters = () => {
  emit('apply-filters', { ...filters.value });
};

const clearFilters = () => {
  filters.value = {
    keyword: '',
    trang_thai_kiem_duyet: '',
    category_id: null,
  };
  emit('clear-filters');
};
</script>

<style scoped>
.author-story-filters {
  background: rgba(36, 40, 52, 0.7);
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(34, 197, 94, 0.2);
  margin-bottom: 2rem;
  /* font-family: 'Manrope', sans-serif; */
  color: #e0e0e0;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 200px;
}

.keyword-group {
    flex: 2; 
}

.filter-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4ade80;
}

.input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.filter-input,
.filter-select {
  width: 100%;
  padding: 0.7rem 1rem 0.7rem 2.5rem; /* Space for icon */
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(75, 85, 99, 0.5);
  border-radius: 0.5rem;
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.filter-select {
    padding-left: 1rem;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1em;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

.filter-buttons {
  display: flex;
  gap: 1rem;
  min-width: 200px;
}

.btn {
  padding: 0.7rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  flex: 1;
}

.btn-apply {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.btn-apply:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #2ecc71 0%, #22c55e 100%);
}

.btn-clear {
  background: rgba(75, 85, 99, 0.3);
  color: #d1d5db;
  border: 1px solid rgba(75, 85, 99, 0.5);
}

.btn-clear:hover {
  background: rgba(75, 85, 99, 0.5);
  color: #fff;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .filter-buttons {
    margin-top: 0.5rem;
  }
}
</style>
