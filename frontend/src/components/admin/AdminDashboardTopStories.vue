<template>
  <div class="top-stories-table">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <span>Đang tải...</span>
    </div>

    <div v-else-if="!loading && stories.length === 0" class="no-data">
      <i class="fas fa-chart-bar"></i>
      <p>Chưa có dữ liệu truyện.</p>
    </div>

    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th class="rank-col">#</th>
            <th>Ảnh bìa</th>
            <th>Tên truyện</th>
            <th>Tác giả</th>
            <th class="text-right">Lượt xem</th>
            <th class="text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(story, idx) in stories" :key="story.id">
            <td class="rank-col">{{ idx + 1 }}</td>
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
            <td class="author-cell">{{ story.tac_gia || "—" }}</td>
            <td class="text-right views-cell">
              {{ (story.luot_xem || 0).toLocaleString("vi-VN") }}
            </td>
            <td class="text-center">
              <router-link
                :to="`/truyen-chu/${story.slug}`"
                class="btn-view"
                title="Xem truyện"
              >
                <i class="fas fa-external-link-alt"></i>
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getImageUrl } from "@/config/constants";

interface TopStory {
  id: number;
  ten_truyen: string;
  slug: string;
  luot_xem: number;
  tac_gia?: string;
  anh_bia?: string | null;
}

defineProps<{
  stories: TopStory[];
  loading?: boolean;
}>();

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  const parent = target.parentElement;
  if (parent) {
    parent.innerHTML = '<div class="no-cover"><i class="fas fa-image"></i></div>';
  }
};
</script>

<style scoped>
.top-stories-table {
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.6);
  z-index: 10;
  color: #a78bfa;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #a78bfa;
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

.rank-col {
  width: 48px;
  text-align: center;
  font-weight: 700;
  color: #a78bfa;
}

.cover-cell {
  width: 50px;
  padding: 0.5rem;
}

.story-cover {
  width: 40px;
  height: 54px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.no-cover {
  width: 40px;
  height: 54px;
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

.author-cell {
  color: #9ca3af;
  font-size: 0.9rem;
}

.views-cell {
  font-weight: 600;
  color: #a78bfa;
}

.text-right {
  text-align: right;
}
.text-center {
  text-align: center;
}

.btn-view {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: #a78bfa;
  background: rgba(167, 139, 250, 0.12);
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-view:hover {
  background: rgba(167, 139, 250, 0.25);
  color: #c4b5fd;
  transform: scale(1.08);
  box-shadow: 0 0 12px rgba(167, 139, 250, 0.3);
}

@media (max-width: 768px) {
  table {
    min-width: 600px;
  }
}
</style>
