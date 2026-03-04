<template>
  <div class="user-stats-cards">
    <div class="stat-card">
      <div class="card-icon total">
        <i class="fas fa-users"></i>
      </div>
      <div class="card-content">
        <span class="card-title">Tổng số người dùng</span>
        <span class="card-value">{{ totalUsers }}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="card-icon active">
        <i class="fas fa-user-check"></i>
      </div>
      <div class="card-content">
        <span class="card-title">Đang hoạt động</span>
        <span class="card-value">{{ activeUsers }}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="card-icon blocked">
        <i class="fas fa-user-slash"></i>
      </div>
      <div class="card-content">
        <span class="card-title">Đã bị khóa</span>
        <span class="card-value">{{ blockedUsers }}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="card-icon author">
        <i class="fas fa-feather-alt"></i>
      </div>
      <div class="card-content">
        <span class="card-title">Tổng số tác giả</span>
        <span class="card-value">{{ authorUsers }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Định nghĩa các props mà component này sẽ nhận
const props = defineProps({
  totalUsers: {
    type: Number,
    default: 0,
  },
  activeUsers: {
    type: Number,
    default: 0,
  },
  blockedUsers: {
    type: Number,
    default: 0,
  },
  authorUsers: {
    type: Number,
    default: 0,
  },
});
</script>

<style scoped>
/* Container cho các thẻ thống kê */
.user-stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  padding: 0 1rem;
}

/* Kiểu dáng cho từng thẻ thống kê */
.stat-card {
  background: rgba(36, 40, 52, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(34, 197, 94, 0.3); 
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  /* font-family: 'Manrope', sans-serif; */ 
  color: #ffffff;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.4);
}

/* Kiểu dáng icon */
.card-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 1.5rem;
  color: #fff;
  background-color: rgba(34, 197, 94, 0.6);
}

/* Các màu sắc riêng cho từng loại icon */
.card-icon.total {
  background-color: rgba(59, 130, 246, 0.6); 
}

.card-icon.active {
  background-color: rgba(34, 197, 94, 0.6); 
}

.card-icon.blocked {
  background-color: rgba(249, 115, 22, 0.6); 
}

.card-icon.author {
  background-color: rgba(234, 179, 8, 0.6);
}


/* Nội dung thẻ (tiêu đề và giá trị) */
.card-content {
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.25rem;
}

.card-value {
  /* font-family: 'Sora', sans-serif; */
  font-size: 1.8rem;
  font-weight: 600;
  color: #22c55e; 
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .user-stats-cards {
    grid-template-columns: 1fr;
    padding: 0 0.5rem;
  }
  .stat-card {
    padding: 1rem;
    flex-direction: row; 
    text-align: left;
  }
  .card-value {
    font-size: 1.5rem;
  }
}
</style>