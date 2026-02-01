<template>
  <div class="task-item" :class="{ 'completed': task.status === 'completed' }">
    <div class="task-info">
      <div class="task-header">
        <h4 class="task-title">{{ task.title }}</h4>
        <span v-if="task.is_daily" class="daily-badge">Hàng ngày</span>
      </div>
      <p class="task-desc">{{ task.description }}</p>
      <div class="task-reward">
        <i class="fas fa-coins"></i> +{{ task.points_awarded }} điểm
      </div>
    </div>
    
    <div class="task-action">
      <button 
        v-if="task.status === 'completed'" 
        class="btn-completed" 
        disabled
      >
        <i class="fas fa-check"></i> Đã xong
      </button>
      <span 
        v-else 
        class="status-tag incomplete"
      >
        Chưa hoàn thành
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskItem',
  props: {
    task: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['complete']
}
</script>

<style scoped>
.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.task-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(5px);
}

.task-item.completed {
  opacity: 0.7;
  border-color: rgba(76, 175, 80, 0.3);
}

.task-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.task-title {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.daily-badge {
  font-size: 0.7rem;
  background: #2196f3;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
}

.task-desc {
  font-size: 0.9rem;
  color: #aaa;
  margin: 0 0 8px 0;
}

.task-reward {
  font-size: 0.85rem;
  color: #ffca28;
  font-weight: 600;
}

.btn-claim {
  background: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-claim:hover:not(:disabled) {
  background: #43a047;
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

.btn-claim:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-completed {
  background: transparent;
  border: 1px solid #4caf50;
  color: #4caf50;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: default;
}

.status-tag {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-block;
}

.status-tag.incomplete {
  background: rgba(255, 255, 255, 0.1);
  color: #bbb;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

@media (max-width: 600px) {
    .task-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }
    
    .task-action {
        width: 100%;
        display: flex;
        justify-content: flex-end;
    }
}
</style>
