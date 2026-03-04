<template>
  <div class="pagination-section">
    <div class="pagination">
      <button :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)" class="pagination-btn">
        <i class="fas fa-chevron-left"></i> Trước
      </button>
      <span class="pagination-info">Trang {{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)" class="pagination-btn">
        Tiếp <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Định nghĩa props mà component này nhận từ component cha
const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['goToPage']);

const goToPage = (page: number) => {
  emit('goToPage', page);
};
</script>

<style scoped>
/* Container chính của phần phân trang */
.pagination-section {
  background: rgba(36, 40, 52, 0.7); 
  border: 1px solid rgba(34, 197, 94, 0.3); 
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-top: 2rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  /* font-family: 'Manrope', sans-serif; */
  color: #ffffff;
  display: flex;
  justify-content: center; 
  align-items: center;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: transparent;
  color: #22c55e;
  border: 1px solid #22c55e;
  border-radius: 0.5rem;
  /* font-family: 'Sora', sans-serif; */
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #22c55e;
  color: #ffffff;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
}

.pagination-btn:disabled {
  border-color: #4b5563;
  color: #6b7280;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.95rem;
  color: #ffffff;
}

/* Responsive */
@media (max-width: 480px) {
  .pagination {
    flex-direction: column;
    gap: 0.75rem;
  }
  .pagination-btn {
    width: 100%;
  }
}
</style>