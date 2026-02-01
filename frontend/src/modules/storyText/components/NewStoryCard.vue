<template>
  <div @click="navigateToStory" class="new-story-card" role="link" tabindex="0">
    <div class="cover-wrapper">
      <img
        :src="story.anh_bia ? getImageUrl(story.anh_bia) : '/img/default-cover.png'"
        :alt="`Bìa truyện ${story.ten_truyen}`"
        class="cover"
        crossorigin="anonymous"
        loading="lazy"
      />
      <div class="overlay">
        <span class="read-more-icon">Đọc ngay</span>
      </div>
      <div class="chapter-badge">
        Chương {{ story.so_luong_chuong || story.so_chuong || 0 }}
      </div>
      <span :class="['status-tag', getStatusClass(story.trang_thai)]">
        <i v-if="getStatusClass(story.trang_thai) === 'status-completed'" class="fas fa-check-circle"></i>
        <i v-else-if="getStatusClass(story.trang_thai) === 'status-suggested'" class="fas fa-fire"></i>
        <i v-else class="fas fa-pencil-alt"></i>
        {{ getStatusText(story.trang_thai) }}
      </span>
    </div>

    <div class="card-content">
      <h3 class="title" :title="story.ten_truyen">{{ story.ten_truyen }}</h3>
      
      <div class="info-row">
        <span class="author-name"><i class="fas fa-pen-nib"></i> {{ story.tac_gia || 'Đang cập nhật' }}</span>
      </div>

      <div class="stats-row">
        <span class="stat"><i class="fas fa-eye"></i> {{ formatNumber(story.luot_xem) }}</span>
        <span class="stat"><i class="fas fa-clock"></i> {{ timeAgo(story.thoi_gian_cap_nhat) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';
import { getImageUrl } from "@/config/constants";

const props = defineProps({ story: Object });
const router = useRouter();

const navigateToStory = () => {
    // FIX: Manually blur the active element (this card) to prevent
    // browser focus-based scroll restoration on the destination page.
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
    router.push(`/truyen-chu/${props.story.slug}`);
};

// Local getImageUrl removed for global helper

const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

const timeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ";
    return "Vừa xong";
};

const getStatusText = (status) => {
  if (!status) return 'Đang ra';
  const s = status.toLowerCase().trim();
  if (s === 'hoan_thanh' || s.includes('hoàn') || s === 'completed') return 'Đã Full';
  if (s === 'de_xuat' || s.includes('đề xuất') || s === 'suggested') return 'Đề xuất';
  if (s === 'dang_ra' || s.includes('đang ra')) return 'Đang ra';
  return 'Đang ra';
};

const getStatusClass = (status) => {
  if (!status) return 'status-on-going';
  const s = status.toLowerCase().trim();
  if (s === 'hoan_thanh' || s.includes('hoàn') || s === 'completed') return 'status-completed';
  if (s === 'de_xuat' || s.includes('đề xuất') || s === 'suggested') return 'status-suggested';
  return 'status-on-going';
};
</script>

<style scoped>
.new-story-card {
  background: #1f2937; /* Darker gray background */
  border-radius: 12px;
  color: #e0e0e0;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.05);
  height: 100%;
  cursor: pointer;
  
  /* For horizontal scroll handled by parent */
  flex-shrink: 0;
  width: 100%; /* Context-dependent */
}

.new-story-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
}

.cover-wrapper {
  position: relative;
  width: 100%;
  padding-top: 140%; /* 5:7 Aspect Ratio */
  overflow: hidden;
}

.cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.new-story-card:hover .cover {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.new-story-card:hover .overlay {
  opacity: 1;
}

.read-more-icon {
  background-color: #22c55e;
  color: white;
  padding: 8px 16px;
  border-radius: 99px;
  font-weight: 700;
  font-size: 0.85rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  transform: translateY(10px);
  transition: transform 0.3s ease;
}

.new-story-card:hover .read-more-icon {
  transform: translateY(0);
}

.chapter-badge {
    position: absolute;
    bottom: 6px;
    right: 6px;
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 600;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.chapter-badge::before {
    content: '\f02d'; /* FontAwesome book icon code */
    font-family: "Font Awesome 6 Free";
    font-weight: 900;
    color: #4ade80; /* Green accent */
    font-size: 0.65rem;
}

.card-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 6px;
}

.title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.4;
  height: 2.8em; /* 2 lines */
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: color 0.2s;
}

.new-story-card:hover .title {
  color: #4ade80;
}

.info-row {
    font-size: 0.8rem;
    color: #9ca3af;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 4px;
}

.author-name {
    color: #d1d5db; /* Brighter gray */
    display: flex;
    align-items: center;
    gap: 6px;
}

.author-name i {
    color: #6b7280;
    font-size: 0.75rem;
}

.stats-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #9ca3af; /* Default text color */
    margin-top: auto; 
    padding-top: 8px;
    border-top: 1px solid rgba(255,255,255,0.05);
}

.stat {
    display: flex;
    align-items: center;
    gap: 5px;
}

/* Green Eye Icon */
.stat .fa-eye {
    color: #4ade80; /* Green accent */
}

/* Clock Icon & Time */
.stat .fa-clock {
    color: #60a5fa; /* Blue accent for time */
}

.stat:last-child {
    color: #9ca3af; /* Keep text gray */
}

/* IMPROVED STATUS BADGE */
.status-tag {
    position: absolute;
    top: 6px;
    left: 6px;
    padding: 4px 10px;
    border-radius: 20px 6px 20px 20px; /* Unique shape */
    font-size: 0.65rem;
    font-weight: 800;
    color: #fff;
    text-transform: uppercase;
    box-shadow: 0 4px 10px rgba(0,0,0,0.4);
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 4px;
    letter-spacing: 0.5px;
    border: 1px solid rgba(255,255,255,0.2);
    backdrop-filter: blur(4px);
}

.status-tag i {
    font-size: 0.7rem;
}

.status-completed { 
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4); 
}

.status-on-going { 
    background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
}

.status-suggested { 
    background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
    box-shadow: 0 4px 10px rgba(245, 158, 11, 0.4);
}

</style>