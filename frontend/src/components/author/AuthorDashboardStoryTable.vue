<template>
  <div class="dashboard-table">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <span>Đang tải...</span>
    </div>

    <div v-if="!loading && stories.length === 0" class="no-data">
      <i class="fas fa-book-open"></i>
      <p>Bạn chưa có truyện nào.</p>
    </div>

    <div v-if="!loading && stories.length > 0" class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Ảnh bìa</th>
            <th>Tên truyện</th>
            <th class="text-center">Trạng thái</th>
            <th class="text-center">Cập nhật cuối</th>
            <th class="text-center">Số chương</th>
            <th class="text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="story in stories" :key="story.id">
            <td class="cover-cell">
              <img
                v-if="story.anh_bia"
                :src="getImageUrl(story.anh_bia)"
                @error="handleImageError"
                alt="Cover"
                class="story-cover"
              />
              <div v-else class="no-cover"><i class="fas fa-image"></i></div>
            </td>
            <td class="title-cell">
              <span class="story-title">{{ story.ten_truyen }}</span>
            </td>
            <td class="text-center">
              <span :class="['status-badge', getStatusClass(story.trang_thai_kiem_duyet)]">
                {{ formatStatus(story.trang_thai_kiem_duyet) }}
              </span>
            </td>
            <td class="text-center text-muted">
              {{ formatDate(story.thoi_gian_cap_nhat) }}
            </td>
            <td class="text-center font-bold">
              {{ story.chuong_moi || story.so_luong_chuong || 0 }}
            </td>
            <td class="actions-cell">
              <div class="action-buttons">
                <button
                  @click="emit('stats', story.id)"
                  class="btn-icon btn-stats"
                  title="Thống kê"
                >
                  <i class="fas fa-chart-bar"></i>
                </button>
                <button
                  @click="emit('manage-chapters', story.id)"
                  class="btn-icon btn-chapters"
                  title="Quản lý chương"
                >
                  <i class="fas fa-list"></i>
                </button>
                <button
                  @click="emit('edit', story.id)"
                  class="btn-icon btn-edit"
                  title="Chỉnh sửa"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  @click="emit('delete', story.id)"
                  class="btn-icon btn-delete"
                  title="Xóa"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
                <button
                  @click="emit('view-details', story.id)"
                  class="btn-icon btn-view"
                  title="Xem trang"
                >
                  <i class="fas fa-external-link-alt"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getImageUrl } from "@/config/constants";

interface Story {
  id: number;
  ten_truyen: string;
  anh_bia: string | null;
  slug: string;
  trang_thai_kiem_duyet: string;
  thoi_gian_cap_nhat: string;
  so_chuong?: number;
  so_luong_chuong?: number;
  chuong_moi?: string;
}

defineProps<{
  stories: Story[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "stats", id: number): void;
  (e: "manage-chapters", id: number): void;
  (e: "edit", id: number): void;
  (e: "delete", id: number): void;
  (e: "view-details", id: number): void;
}>();

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  const parent = target.parentElement;
  if (parent) {
    parent.innerHTML = '<div class="no-cover"><i class="fas fa-image"></i></div>';
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "duyet":
      return "status-approved";
    case "cho_duyet":
      return "status-pending";
    case "tu_choi":
      return "status-rejected";
    default:
      return "status-pending";
  }
};

const formatStatus = (status: string) => {
  const map: Record<string, string> = {
    duyet: "Đã duyệt",
    cho_duyet: "Chờ duyệt",
    tu_choi: "Từ chối",
  };
  return map[status] || status;
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style scoped>
.dashboard-table {
  background: rgba(36, 40, 52, 0.7);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  position: relative;
  /* font-family: "Manrope", sans-serif; */
  color: #e0e0e0;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  color: #10b981;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.no-data {
  padding: 3rem;
  text-align: center;
  color: #9ca3af;
}

.no-data i {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  opacity: 0.5;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #9ca3af;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.875rem;
}

td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.cover-cell {
  width: 60px;
  padding: 0.5rem;
}

.story-cover {
  width: 45px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.no-cover {
  width: 45px;
  height: 60px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.story-title {
  font-weight: 600;
  color: #fff;
}

.status-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-approved {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}
.status-pending {
  background: rgba(234, 179, 8, 0.2);
  color: #facc15;
}
.status-rejected {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.text-center {
  text-align: center;
}
.text-muted {
  color: #9ca3af;
  font-size: 0.85rem;
}
.font-bold {
  font-weight: 700;
}

.actions-cell {
  text-align: center;
}

.action-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.btn-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.05);
  color: #9ca3af;
}

.btn-icon:hover {
  transform: scale(1.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn-stats {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.btn-stats:hover {
  background: rgba(59, 130, 246, 0.25);
  color: #60a5fa;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.3);
}

.btn-chapters {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}
.btn-chapters:hover {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.btn-edit {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
}
.btn-edit:hover {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
}

.btn-delete {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}
.btn-delete:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.btn-view {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}
.btn-view:hover {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

@media (max-width: 768px) {
  table {
    min-width: 700px;
  }
}
</style>
