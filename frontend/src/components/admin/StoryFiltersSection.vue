<template>
  <div class="story-filters-section">
    <div class="filter-group">
      <label for="statusFilter" class="filter-label"><i class="fas fa-filter icon"></i> Trạng thái duyệt:</label>
      <CustomSelect
        id="statusFilter"
        :options="statusOptions"
        v-model="internalFilters.trang_thai_kiem_duyet"
        placeholder="Tất cả trạng thái"
      />
    </div>

    <div class="filter-group">
      <label for="categoryFilter" class="filter-label"><i class="fas fa-tags icon"></i> Thể loại:</label>
      <CustomSelect
        id="categoryFilter"
        :options="formattedCategories"
        v-model="internalFilters.category_id"
        placeholder="Tất cả thể loại"
      />
    </div>

    <div class="filter-group search-group">
      <label for="keywordSearch" class="filter-label"><i class="fas fa-search icon"></i> Tìm kiếm:</label>
      <div class="search-input-wrapper">
        <input
          type="text"
          id="keywordSearch"
          v-model="internalFilters.keyword"
          placeholder="Tên truyện hoặc tác giả"
          class="filter-input"
          @keyup.enter="applyFilters"
        />
        <button
          v-if="internalFilters.keyword"
          @click="clearKeyword"
          class="clear-search-btn"
          title="Xóa tìm kiếm"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <div class="filter-actions">
      <button @click="applyFilters" class="apply-btn">
        <i class="fas fa-check-circle"></i> Áp dụng
      </button>
      <button @click="clearAllFilters" class="clear-btn" title="Xóa tất cả bộ lọc">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, PropType, computed } from 'vue';
import CustomSelect from '@/components/common/CustomSelect.vue';

interface Filters {
  trang_thai_kiem_duyet: string;
  keyword: string;
  author_id: number | null;
  category_id: number | null;
}

interface Category {
  id_theloai: number;
  ten_theloai: string;
  slug: string;
}

const props = defineProps({
  initialFilters: {
    type: Object as PropType<Filters>,
    default: () => ({
      trang_thai_kiem_duyet: '',
      keyword: '',
      author_id: null,
      category_id: null,
    }),
  },
  categories: {
    type: Array as PropType<Category[]>,
    required: true,
  },
});

const emit = defineEmits(['applyFilters', 'clearFilters']);

const internalFilters = ref<Filters>({ ...props.initialFilters });

const statusOptions = ref([
  { value: '', label: 'Tất cả' },
  { value: 'cho_duyet', label: 'Chờ duyệt' },
  { value: 'da_duyet', label: 'Đã duyệt' },
  { value: 'tu_choi', label: 'Từ chối' },
]);

const formattedCategories = computed(() => {
  if (!Array.isArray(props.categories)) return [{ value: null, label: 'Tất cả' }];
  return [{ value: null, label: 'Tất cả' }, ...props.categories.map(cat => ({
    value: cat.id_theloai,
    label: cat.ten_theloai,
  }))];
});

watch(() => props.initialFilters, (newFilters) => {
  internalFilters.value = { ...newFilters };
}, { deep: true });

const applyFilters = () => {
  emit('applyFilters', internalFilters.value);
};

const clearKeyword = () => {
  internalFilters.value.keyword = '';
  applyFilters();
};

const clearAllFilters = () => {
  internalFilters.value = {
    trang_thai_kiem_duyet: '',
    keyword: '',
    author_id: null,
    category_id: null,
  };
  emit('clearFilters');
};
</script>

<style scoped>
.story-filters-section {
  background: rgba(36, 40, 52, 0.7);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: flex-end;
  /* font-family: 'Manrope', sans-serif; */
  color: #ffffff;
}

.filter-group {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 1rem;
  font-weight: 600;
  color: #e0e0e0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label .icon {
  color: #22c55e;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.filter-input {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid #4b5563;
  color: #ffffff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
  width: 100%; 
  padding-right: 2.5rem; 
}

.filter-input:focus {
  border-color: #22c55e;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
  outline: none;
}

.clear-search-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #a0a0a0;
  cursor: pointer;
  font-size: 1rem;
  transition: color 0.2s ease;
}

.clear-search-btn:hover {
  color: #ffffff;
}

.filter-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.apply-btn,
.clear-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  border: none;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.apply-btn {
  background: linear-gradient(90deg, #22c55e, #4ade80);
  color: #1a1d29;
}

.apply-btn:hover {
  background: linear-gradient(90deg, #4ade80, #22c55e);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(34, 197, 94, 0.4);
}

.clear-btn {
  background: #6b7280;
  color: #ffffff;
  width: 45px;
  height: 45px;
  justify-content: center;
}

.clear-btn:hover {
  background: #4b5563;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(75, 85, 99, 0.4);
}

@media (max-width: 768px) {
  .story-filters-section {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 1rem;
  }
  .filter-group {
    min-width: unset;
    width: 100%;
  }
  .filter-actions {
    flex-direction: row; 
    justify-content: space-between; 
    gap: 0.75rem;
  }
  .apply-btn {
    flex-grow: 1; 
    justify-content: center;
  }
  .clear-btn {
    width: auto; 
    flex-shrink: 0; 
  }
}

@media (max-width: 480px) {
  .filter-actions {
    flex-direction: column; 
  }
  .apply-btn, .clear-btn {
    width: 100%;
  }
}
</style>