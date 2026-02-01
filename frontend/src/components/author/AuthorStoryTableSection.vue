<template>
  <div class="author-story-table">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <span>Đang tải truyện...</span>
    </div>

    <div v-if="!loading && stories.length === 0" class="no-data-message">
       <i class="fas fa-book-open"></i>
       <p>Bạn chưa có truyện nào.</p>
    </div>

    <div v-if="!loading && stories.length > 0" class="table-container">
      <table>
        <thead>
          <tr>
            <th @click="requestSort('id')" class="sortable">ID</th>
            <th>Ảnh bìa</th>
            <th @click="requestSort('ten_truyen')" class="sortable">Tên truyện</th>
            <th @click="requestSort('trang_thai_kiem_duyet')" class="sortable text-center">Trạng thái</th>
            <th @click="requestSort('thoi_gian_cap_nhat')" class="sortable text-center">Cập nhật cuối</th>
             <th class="text-center">Số chương</th>
            <th class="text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="story in stories" :key="story.id">
            <td>#{{ story.id }}</td>
            <td class="cover-cell">
               <img 
                v-if="story.anh_bia" 
                :src="getImageUrl(story.anh_bia)" 
                @error="handleImageError"
                alt="Cover" 
                class="story-cover"
              />
              <div v-else class="no-cover">
                <i class="fas fa-image"></i>
              </div>
            </td>
            <td class="title-cell">
              <span class="story-title">{{ story.ten_truyen }}</span>
            </td>
            <td class="text-center">
              <span :class="['status-badge', getStatusClass(story.trang_thai_kiem_duyet)]">
                {{ formatStatus(story.trang_thai_kiem_duyet) }}
              </span>
            </td>
            <td class="text-center text-sm text-gray-400">
               {{ formatDate(story.thoi_gian_cap_nhat) }}
            </td>
             <td class="text-center font-bold">
               {{ story.so_luong_chuong || story.so_chuong || 0 }}
             </td>
            <td class="actions-cell">
               <div class="action-buttons">
                  <button @click="emit('manage-chapters', story.id)" class="btn-icon btn-chapters" title="Quản lý chương">
                    <i class="fas fa-list"></i>
                  </button>
                  <button @click="emit('edit', story.id)" class="btn-icon btn-edit" title="Chỉnh sửa truyện">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="emit('delete', story.id)" class="btn-icon btn-delete" title="Xóa truyện">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                  <button @click="emit('view-details', story.id)" class="btn-icon btn-view" title="Xem trang truyện">
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
// defineProps and defineEmits are compiler macros and don't need to be imported in <script setup>
import { getImageUrl } from "@/config/constants";

interface Story {
  id: number;
  ten_truyen: string;
  anh_bia: string | null;
  slug: string;
  trang_thai_kiem_duyet: string;
  thoi_gian_cap_nhat: string;
  so_chuong: number;
  so_luong_chuong?: number;
}

const props = defineProps({
  stories: {
    type: Array as () => Story[],
    required: true,
  },
  loading: Boolean,
  sortColumn: String,
  sortDirection: String,
});

const emit = defineEmits(['view-details', 'edit', 'delete', 'manage-chapters', 'requestSort']);

// Local getFinalImageUrl removed for global getImageUrl

const handleImageError = (e: Event) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) {
        parent.innerHTML = '<div class="no-cover"><i class="fas fa-image"></i></div>';
    }
};

const getStatusClass = (status: string) => {
   switch (status) {
    case 'duyet': return 'status-approved';
    case 'cho_duyet': return 'status-pending';
    case 'tu_choi': return 'status-rejected';
    default: return 'status-pending';
  }
};

const formatStatus = (status: string) => {
    const map: any = {
        'duyet': 'Đã duyệt',
        'cho_duyet': 'Chờ duyệt',
        'tu_choi': 'Từ chối'
    };
    return map[status] || status;
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', { 
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit' 
    });
};

const requestSort = (column: string) => {
    let direction = 'asc';
    if (props.sortColumn === column && props.sortDirection === 'asc') {
        direction = 'desc';
    }
    emit('requestSort', { column, direction });
};
</script>

<style scoped>
.author-story-table {
  background: rgba(36, 40, 52, 0.7);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(34, 197, 94, 0.2);
  min-height: 200px;
  position: relative;
  font-family: 'Manrope', sans-serif;
  color: #e0e0e0;
}

.loading-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    color: #22c55e;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255,255,255,0.1);
    border-top-color: #22c55e;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

.no-data-message {
    padding: 3rem;
    text-align: center;
    color: #9ca3af;
}

.no-data-message i {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.table-container {
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
    color: #4ade80;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    white-space: nowrap;
}

td {
    padding: 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    background: transparent;
}

tr:hover td {
    background: rgba(255,255,255,0.02);
}

.sortable { cursor: pointer; }
.sortable:hover { color: #fff; }

.cover-cell {
    width: 60px;
    padding: 0.5rem;
}

.story-cover {
    width: 45px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid rgba(255,255,255,0.2);
}

.no-cover {
    width: 45px;
    height: 60px;
    background: rgba(0,0,0,0.3);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
}

.story-title {
    font-weight: 600;
    color: white;
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 99px;
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
}

.status-approved { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
.status-pending { background: rgba(234, 179, 8, 0.2); color: #facc15; }
.status-rejected { background: rgba(239, 68, 68, 0.2); color: #f87171; }

.actions-cell {
    text-align: center;
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
}

.btn-icon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    background: rgba(255,255,255,0.05);
    color: #9ca3af;
}

.btn-icon:hover {
    transform: translateY(-2px);
}

.btn-chapters { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
.btn-chapters:hover { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }

.btn-edit { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
.btn-edit:hover { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }

.btn-delete { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
.btn-delete:hover { background: rgba(239, 68, 68, 0.2); color: #f87171; }

.btn-view { color: #22c55e; background: rgba(34, 197, 94, 0.1); }
.btn-view:hover { background: rgba(34, 197, 94, 0.2); color: #4ade80; }

.text-center { text-align: center; }
.text-sm { font-size: 0.85rem; }
.font-bold { font-weight: 700; }
.text-gray-400 { color: #9ca3af; }

/* Force table scroll on mobile */
@media (max-width: 768px) {
  table {
    min-width: 800px; /* Ensure table is wide enough to trigger scroll */
  }
}
</style>
