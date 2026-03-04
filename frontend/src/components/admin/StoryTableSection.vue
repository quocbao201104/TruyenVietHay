<template>
  <div class="story-table-section">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <span>Đang tải dữ liệu...</span>
    </div>

    <div v-if="!loading && stories.length === 0" class="no-data-message">
      <i class="fas fa-box-open"></i>
      <span>Không tìm thấy truyện nào.</span>
    </div>

    <div v-if="!loading && stories.length > 0" class="table-responsive">
      <table class="story-table">
        <thead>
          <tr>
            <th @click="requestSort('id')" :class="{ 'sortable': true, 'sorted-asc': sortColumn === 'id' && sortDirection === 'asc', 'sorted-desc': sortColumn === 'id' && sortDirection === 'desc' }">
              ID <i v-if="sortColumn === 'id'" :class="['fas', sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"></i>
            </th>
            <th>Ảnh bìa</th>
            <th @click="requestSort('ten_truyen')" :class="{ 'sortable': true, 'sorted-asc': sortColumn === 'ten_truyen' && sortDirection === 'asc', 'sorted-desc': sortColumn === 'ten_truyen' && sortDirection === 'desc' }">
              Tên truyện <i v-if="sortColumn === 'ten_truyen'" :class="['fas', sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"></i>
            </th>
            <th @click="requestSort('tac_gia')" :class="{ 'sortable': true, 'sorted-asc': sortColumn === 'tac_gia' && sortDirection === 'asc', 'sorted-desc': sortColumn === 'tac_gia' && sortDirection === 'desc' }">
              Tác giả <i v-if="sortColumn === 'tac_gia'" :class="['fas', sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"></i>
            </th>
            <th @click="requestSort('trang_thai_kiem_duyet')" :class="{ 'sortable': true, 'sorted-asc': sortColumn === 'trang_thai_kiem_duyet' && sortDirection === 'asc', 'sorted-desc': sortColumn === 'trang_thai_kiem_duyet' && sortDirection === 'desc' }">
              Trạng thái duyệt <i v-if="sortColumn === 'trang_thai_kiem_duyet'" :class="['fas', sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"></i>
            </th>
            <th @click="requestSort('thoi_gian_cap_nhat')" :class="{ 'sortable': true, 'sorted-asc': sortColumn === 'thoi_gian_cap_nhat' && sortDirection === 'asc', 'sorted-desc': sortColumn === 'thoi_gian_cap_nhat' && sortDirection === 'desc' }">
              Thời gian cập nhật <i v-if="sortColumn === 'thoi_gian_cap_nhat'" :class="['fas', sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down']"></i>
            </th>
            <th class="text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(story, index) in stories" :key="story.id" :class="['story-row', { 'even-row': index % 2 === 0, 'odd-row': index % 2 !== 0 }]">
            <td class="text-center">{{ story.id }}</td>
            <td class="cover-image-cell">
              <img
                v-if="story.anh_bia && getImageUrl(story.anh_bia)"
                :src="getImageUrl(story.anh_bia)"
                alt="Ảnh bìa"
                class="story-cover-thumb"
                crossorigin="anonymous"
                @error="handleImageError"
              />
              <div v-else class="no-image-placeholder-small">
                <i class="fas fa-image"></i>
                <span>Không ảnh</span>
              </div>
            </td>
            <td>
              <router-link :to="`/truyen-chu/${story.slug}`" class="story-name-link">
                {{ story.ten_truyen }}
              </router-link>
            </td>
            <td>{{ story.ten_tac_gia || story.tac_gia }}</td>
            <td class="text-center">
              <span :class="['status-badge', getStatusClass(story.trang_thai_kiem_duyet)]">
                {{ formatStatus(story.trang_thai_kiem_duyet) }}
              </span>
            </td>
            <td>{{ formatDate(story.thoi_gian_cap_nhat) }}</td>
            <td class="actions-cell">
              <div class="actions-dropdown" v-click-outside="() => closeDropdown(story.id)">
                <button
                  class="action-btn action-toggle-btn"
                  @click.stop="toggleDropdown(story.id)"
                  title="Tùy chọn hành động"
                >
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="dropdown-menu" :class="{ 'dropdown-up': index >= stories.length - 2 }" v-show="activeDropdownId === story.id">
                  <button 
                    v-if="story.trang_thai_kiem_duyet === 'cho_duyet'"
                    @click="emit('approve', story.id)"
                    class="dropdown-item dropdown-item-button approve-btn-dropdown"
                    title="Duyệt truyện"
                  >
                    <i class="fas fa-check"></i> Duyệt
                  </button>
                  <button 
                    v-if="story.trang_thai_kiem_duyet === 'cho_duyet'"
                    @click="emit('reject', story.id)"
                    class="dropdown-item dropdown-item-button reject-btn-dropdown"
                    title="Từ chối truyện"
                  >
                    <i class="fas fa-times"></i> Từ chối
                  </button>
                  <button 
                    @click="emit('manage-chapters', story.id)"
                    class="dropdown-item dropdown-item-button chapter-btn-dropdown"
                    title="Quản lý chương"
                  >
                    <i class="fas fa-list"></i> QL Chương
                  </button>
                  <button @click="emit('view-details', story.id)" class="dropdown-item dropdown-item-button view-details-btn-dropdown" title="Xem chi tiết">
                    <i class="fas fa-eye"></i> Chi tiết
                  </button>
                  <button @click="emit('delete', story.id)" class="dropdown-item dropdown-item-button delete-btn-dropdown" title="Xóa truyện">
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
import { onMounted, ref, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { getImageUrl } from "@/config/constants";

const router = useRouter();

interface Story {
  id: number;
  ten_truyen: string;
  tac_gia: string;
  ten_tac_gia?: string;
  mo_ta: string;
  anh_bia: string; 
  slug: string;
  trang_thai_kiem_duyet: 'cho_duyet' | 'duyet' | 'tu_choi';
  thoi_gian_cap_nhat: string;
}

const props = defineProps({
  stories: {
    type: Array as () => Story[],
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  sortColumn: { // Thêm prop sortColumn
    type: String,
    default: 'id',
  },
  sortDirection: { // Thêm prop sortDirection
    type: String as () => 'asc' | 'desc',
    default: 'asc',
  },
  isAuthorView: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['approve', 'reject', 'view-details', 'delete', 'requestSort', 'manage-chapters', 'edit']);

// Local getFinalImageUrl removed for global getImageUrl

const activeDropdownId = ref<number | null>(null);

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
    document.removeEventListener('click', (el as any).__ClickOutsideHandler__);
  },
};

const toggleDropdown = (storyId: number) => {
  if (activeDropdownId.value === storyId) {
    activeDropdownId.value = null;
  } else {
    activeDropdownId.value = storyId;
  }
};

const closeDropdown = (storyId: number) => {
    if (activeDropdownId.value === storyId) {
        activeDropdownId.value = null;
    }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'duyet':
      return 'status-approved';
    case 'cho_duyet':
      return 'status-pending';
    case 'tu_choi':
    default:
      return 'status-rejected';
  }
};

const formatStatus = (status: string) => {
  switch (status) {
    case 'duyet':
      return 'Đã duyệt';
    case 'cho_duyet':
      return 'Chờ duyệt';
    case 'tu_choi':
      return 'Từ chối';
    default:
      return status;
  }
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleDateString('vi-VN', options);
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.style.display = 'none';
  const parentCell = target.closest('.cover-image-cell');
  if (parentCell && !parentCell.querySelector('.no-image-placeholder-small')) {
    const placeholder = document.createElement('div');
    placeholder.className = 'no-image-placeholder-small';
    placeholder.innerHTML = '<i class="fas fa-image"></i> <span>Không ảnh</span>';
    parentCell.prepend(placeholder);
  }
};

const requestSort = (column: string) => {
  let newDirection = 'asc';
  if (props.sortColumn === column) {
    newDirection = props.sortDirection === 'asc' ? 'desc' : 'asc';
  }
  emit('requestSort', { column, direction: newDirection });
};

onBeforeUnmount(() => {
    document.removeEventListener('click', (document as any).__ClickOutsideHandler__);
});
</script>


<style scoped>
.story-table-section {
  background: rgba(36, 40, 52, 0.7);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  /* font-family: 'Manrope', sans-serif; */
  color: #ffffff;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 0.75rem;
  color: #22c55e;
  font-size: 1.2rem;
  font-weight: 600;
}

.spinner {
  border: 4px solid rgba(34, 197, 94, 0.3);
  border-top: 4px solid #22c55e;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-data-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #a0a0a0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.no-data-message .fas {
  font-size: 3rem;
  color: #6b7280;
}

.table-responsive {
  overflow-x: auto;
}

.story-table {
  width: 100%;
  border-collapse: separate; 
  border-spacing: 0; 
  margin-top: 1rem;
  border-radius: 0.75rem; 
  overflow: hidden; 
  table-layout: fixed; 
  min-width: 900px; 
}

.story-table th,
.story-table td {
  padding: 1rem;
  text-align: left; 
  border-bottom: 1px solid rgba(75, 85, 99, 0.5);
  /* font-family: 'Manrope', sans-serif; */ 
  vertical-align: middle;
}

/* Column Widths & Text Alignment */
.story-table th:nth-child(1), .story-table td:nth-child(1) { width: 5%; text-align: center; } /* ID */
.story-table th:nth-child(2), .story-table td:nth-child(2) { text-align: center; } /* Ảnh bìa */
.story-table th:nth-child(3), .story-table td:nth-child(3) { width: 25%; text-align: left; } /* Tên truyện */
.story-table th:nth-child(4), .story-table td:nth-child(4) { width: 15%; text-align: left; } /* Tác giả */
.story-table th:nth-child(5), .story-table td:nth-child(5) { width: 15%; text-align: center; } /* Trạng thái duyệt */
.story-table th:nth-child(6), .story-table td:nth-child(6) { width: 15%; text-align: center; } /* Thời gian cập nhật */
.story-table th:nth-child(7), .story-table td:nth-child(7) { width: 15%; text-align: center; } /* Hành động */


.story-table th {
  background-color: #2a2d3a; 
  color: #4caf50; 
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.9rem;
  border-bottom: 2px solid #4caf50; 
  letter-spacing: 0.5px;
  position: relative; 
}

.story-table tr:first-child th:first-child {
  border-top-left-radius: 0.75rem;
}
.story-table tr:first-child th:last-child {
  border-top-right-radius: 0.75rem;
}

.story-table td {
  background-color: rgba(26, 29, 41, 0.7); 
  color: #e0e0e0; 
  font-size: 0.95rem;
}

.story-table tbody tr:last-child td {
  border-bottom: none; 
}

.story-table tbody tr.odd-row td {
  background-color: rgba(36, 40, 52, 0.7); 
}

.story-table tbody tr.story-row:hover {
  background-color: rgba(76, 175, 80, 0.1); 
  cursor: pointer;
}

/* Sortable Headers */
th.sortable {
  cursor: pointer;
}

th.sortable i {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.3s ease;
}

th.sortable.sorted-asc i,
th.sortable.sorted-desc i {
  color: #22c55e;
}


.cover-image-cell {
  align-items: center;
  height: 80px; 
}

.story-cover-thumb {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 0.5rem;
  border: 1px solid #4caf50; 
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.story-cover-thumb:hover {
  transform: scale(1.05);
}

.no-image-placeholder-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 0.7rem;
  text-align: center;
  width: 60px;
  height: 80px;
  border: 1px dashed #4b5563;
  border-radius: 0.5rem;
  background-color: rgba(0, 0, 0, 0.1);
}

.no-image-placeholder-small .fas {
  font-size: 1.5rem;
  margin-bottom: 0.2rem;
}

.story-name-link {
  color: #4ade80; 
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Giới hạn 2 dòng */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.story-name-link:hover {
  color: #22c55e; 
  text-decoration: underline;
}

/* Status Badges - Synced with UserTableSection styles */
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 0.9rem;
  border-radius: 999px; /* Pill shape */
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: capitalize;
  color: #ffffff; /* Default color, overridden by specific status classes */
}

.status-approved {
  background: rgba(34, 197, 94, 0.15); /* light green background */
  color: #6ee7b7; /* brighter green text */
  border: 1px solid #6ee7b7;
}

.status-pending {
  background: rgba(234, 179, 8, 0.15); /* light yellow background */
  color: #fde047; /* brighter yellow text */
  border: 1px solid #fde047;
}

.status-rejected {
  background: rgba(239, 68, 68, 0.15); /* light red background */
  color: #f87171; /* brighter red text */
  border: 1px solid #f87171;
}

/* Actions Dropdown - Synced with UserTableSection styles */
.actions-cell {
  position: relative;
  overflow: visible; 
  text-align: center;
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

.action-btn.action-toggle-btn:hover {
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
  min-width: 150px; 
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
  background: none;
  border: none;
  text-align: left;
  width: 100%;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.approve-btn-dropdown {
  color: #22c55e;
}
.reject-btn-dropdown {
  color: #ef4444;
}
.view-details-btn-dropdown {
  color: #3b82f6;
}
.delete-btn-dropdown {
  color: #ef4444;
}
.chapter-btn-dropdown {
  color: #f59e0b; /* Amber/Orange color */
}


@media (max-width: 1024px) {
  .story-table th,
  .story-table td {
    padding: 0.8rem;
    font-size: 0.9rem;
  }
  .story-cover-thumb, .no-image-placeholder-small {
    width: 50px;
    height: 70px;
  }
  .action-btn.action-toggle-btn {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
  .dropdown-menu {
    min-width: 130px;
    padding: 0.4rem;
  }
  .dropdown-item {
    font-size: 0.8rem;
    padding: 0.4rem 0.6rem;
  }
}

@media (max-width: 768px) {
  .story-table-section {
    padding: 1rem;
  }
  .story-table th,
  .story-table td {
    padding: 0.6rem;
    font-size: 0.8rem;
  }
  .story-cover-thumb, .no-image-placeholder-small {
    width: 40px;
    height: 60px;
  }
  .status-badge {
    padding: 0.2rem 0.4rem;
    font-size: 0.7rem;
    min-width: 60px;
  }
  .action-btn.action-toggle-btn {
    font-size: 0.9rem;
    width: 30px;
    height: 30px;
  }
  .story-table {
    min-width: 700px; /* Điều chỉnh min-width cho màn hình nhỏ hơn */
  }
}

@media (max-width: 480px) {
  .story-table {
    font-size: 0.75rem;
    min-width: 600px;
  }
  .story-table th,
  .story-table td {
    padding: 0.5rem;
  }
  .story-cover-thumb, .no-image-placeholder-small {
    width: 30px;
    height: 45px;
  }
  .story-name-link {
    font-size: 0.8rem;
  }
  .action-btn.action-toggle-btn {
    font-size: 0.8rem;
    width: 28px;
    height: 28px;
  }
}

.dropdown-menu.dropdown-up {
  top: auto;
  bottom: 100%;
  margin-bottom: 0.5rem;
}
</style>