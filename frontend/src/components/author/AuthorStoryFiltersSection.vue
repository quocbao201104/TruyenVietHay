<template>
  <div class="admin-story-filters-aura">
    <div class="filter-row">
      <div class="filter-group keyword-group">
        <label for="keyword" class="filter-label">Thần Thức Tìm Kiếm</label>
        <div class="input-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input
            id="keyword"
            v-model="filters.keyword"
            type="text"
            placeholder="Tìm theo tên bí tịch, đạo hữu..."
            class="filter-input"
            @keyup.enter="applyFilters"
          />
        </div>
      </div>

       <div class="filter-group">
        <label for="category" class="filter-label">Căn Cơ Thể Loại</label>
        <select id="category" v-model="filters.category_id" class="filter-select">
          <option v-for="cat in formattedCategories" :key="cat.value" :value="cat.value">
            {{ cat.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="status" class="filter-label">Trạng Thái Tu Vi</label>
        <select id="status" v-model="filters.trang_thai_kiem_duyet" class="filter-select">
          <option value="">Vạn giới (Tất cả)</option>
          <option value="cho_duyet">Chờ duyệt (Ẩn thế)</option>
          <option value="duyet">Đã duyệt (Xuất thế)</option>
          <option value="tu_choi">Từ chối (Phong ấn)</option>
        </select>
      </div>

      <div class="filter-buttons">
        <button @click="applyFilters" class="btn-spirit btn-apply">
          <i class="fas fa-magic"></i> Thi Triển
        </button>
        <button @click="clearFilters" class="btn-spirit btn-clear">
          <i class="fas fa-rotate-right"></i> Phá Trận
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
  if (!Array.isArray(props.categories)) return [{ value: null, label: 'Tất cả linh căn' }];
  return [{ value: null, label: 'Tất cả linh căn' }, ...props.categories.map(cat => ({
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
/* ===== ADMIN FILTERS XIANXIA ===== */
.admin-story-filters-aura {
  background: rgba(11, 15, 25, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 25px;
  border-radius: 20px;
  border: 1px solid rgba(168, 85, 247, 0.2); /* Viền Aura Tím */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  margin-bottom: 30px;
  font-family: 'Be Vietnam Pro', sans-serif;
  color: #e2e8f0;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 220px;
}

.keyword-group {
    flex: 2; 
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 800;
  color: #a855f7; /* Tím quyền lực Admin */
  text-transform: uppercase;
  letter-spacing: 1px;
}

.input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  transition: color 0.3s;
}

.filter-input,
.filter-select {
  width: 100%;
  padding: 12px 15px 12px 40px; /* Space for icon */
  background: #080b14; /* Nền input tối đặc */
  border: 1px solid #1e293b;
  border-radius: 12px;
  color: #f8fafc;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.filter-select {
    padding-left: 15px;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 15px center;
    background-size: 1.2em;
    cursor: pointer;
}

/* Highlight màu tím khi Focus */
.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #a855f7;
  background: #0b0f19;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15);
}

.filter-input:focus + .search-icon { color: #a855f7; }
.filter-input::placeholder { color: #475569; font-style: italic; }

.filter-buttons {
  display: flex;
  gap: 15px;
  min-width: 250px;
}

.btn-spirit {
  padding: 12px 25px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  flex: 1;
}

.btn-apply {
  background: linear-gradient(135deg, #a855f7, #d946ef);
  color: white;
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
}

.btn-apply:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(168, 85, 247, 0.5);
  background: linear-gradient(135deg, #9333ea, #c026d3);
}

.btn-clear {
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-clear:hover {
  background: rgba(244, 63, 94, 0.1);
  color: #f43f5e;
  border-color: rgba(244, 63, 94, 0.3);
}

/* Mobile Responsive */
@media (max-width: 900px) {
  .filter-row { gap: 15px; }
  .filter-buttons { width: 100%; }
}

@media (max-width: 640px) {
  .admin-story-filters-aura { padding: 20px 15px; border-radius: 16px; }
  .filter-row { flex-direction: column; align-items: stretch; }
  .filter-group { min-width: 100%; }
  .filter-buttons { flex-direction: column; }
}
</style>