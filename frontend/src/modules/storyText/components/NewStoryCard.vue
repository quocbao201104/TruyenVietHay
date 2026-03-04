<template>
  <div @click="navigateToStory" class="xianxia-story-card" role="link" tabindex="0">
    <!-- KHUNG ẢNH (LINH VẬT COVER) -->
    <div class="cover-aura-wrapper">
      <img
        :src="story.anh_bia ? getImageUrl(story.anh_bia) : '/img/default-cover.png'"
        :alt="`Bìa truyện ${story.ten_truyen}`"
        class="story-cover-img"
        crossorigin="anonymous"
        loading="lazy"
      />
      
      <!-- Lớp phủ khi Hover (Linh Lực Overlay) -->
      <div class="aura-overlay">
        <div class="read-btn-spirit">
          <i class="fas fa-eye-low-vision mr-2"></i>
          Lĩnh Hội
        </div>
      </div>

      <!-- NGỌC PHIẾN CHƯƠNG (Jade Chapter Badge) -->
      <div class="jade-chapter-badge">
        <i class="fas fa-scroll text-[9px] text-emerald-400"></i>
        <span>{{ story.chuong_moi || `Chương ${story.so_chuong || story.so_luong_chuong || 0}` }}</span>
      </div>  

      <!-- CẢNH GIỚI TAG (Status Sigil) - GIỮ MÀU ĐẶC, KHÔNG TRONG SUỐT -->
      <div :class="['sigil-status', getStatusClass(story.trang_thai)]">
        <i v-if="getStatusClass(story.trang_thai) === 'status-completed'" class="fas fa-circle-check"></i>
        <i v-else-if="getStatusClass(story.trang_thai) === 'status-suggested'" class="fas fa-fire-flame-curved"></i>
        <i v-else class="fas fa-atom animate-spin-slow"></i>
        <span class="sigil-text">{{ getStatusText(story.trang_thai) }}</span>
      </div>
    </div>

    <!-- NỘI DUNG CHI TIẾT -->
    <div class="card-spirit-content">
      <h3 class="story-title-main" :title="story.ten_truyen">
        {{ story.ten_truyen }}
      </h3>
      
      <div class="meta-spirit-row">
        <span class="author-spirit">
          <i class="fas fa-feather-pointed"></i> 
          {{ story.tac_gia || 'Ẩn Danh' }}
        </span>
      </div>

      <div class="stats-spirit-footer">
    <div class="stat-spirit">
        <i class="fas fa-eye text-blue-400"></i> 
        <span>{{ formatNumber(story.luot_xem) }}</span>
    </div>

    <div class="stat-spirit">
        <i class="fas fa-clock text-slate-400"></i>
        <span>{{ timeAgo(story.thoi_gian_cap_nhat) }}</span>
    </div>
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
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
    router.push(`/truyen-chu/${props.story.slug}`);
};

const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
};

const timeAgo = (date) => {
    if (!date) return 'Vừa xong';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ";
    return "Mới đây";
};

const getStatusText = (status) => {
  if (!status) return 'Đang Ra';
  const s = status.toLowerCase().trim();
  if (s === 'hoan_thanh' || s.includes('hoàn thành')) return 'Viên Mãn';
  return 'Đang Ra';
};

const getStatusClass = (status) => {
  if (!status) return 'status-on-going';
  const s = status.toLowerCase().trim();
  if (s === 'hoan_thanh' || s.includes('hoàn thành')) return 'status-completed';
  return 'status-on-going';
};
</script>

<style scoped>
/* Import Be Vietnam Pro */
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap");

.xianxia-story-card {
  font-family: 'Be Vietnam Pro', sans-serif;
  background: #131b2c;
  border-radius: 16px;
  color: #cbd5e1;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #1e293b;
  height: 100%;
  cursor: pointer;
  position: relative;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.xianxia-story-card:hover {
  transform: translateY(-6px);
  border-color: #34d39960;
  box-shadow: 0 12px 25px -5px rgba(0, 0, 0, 0.6), 0 0 15px rgba(52, 211, 153, 0.1);
}

.cover-aura-wrapper {
  position: relative;
  width: 100%;
  padding-top: 140%;
  overflow: hidden;
  background: #0b0f19;
}

/* Lớp phủ tối mờ đáy ảnh để nổi chữ */
.cover-aura-wrapper::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.6) 100%);
  pointer-events: none;
  z-index: 1;
}

.story-cover-img {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease-out;
}

.xianxia-story-card:hover .story-cover-img {
  transform: scale(1.1);
}

.aura-overlay {
  position: absolute;
  inset: 0;
  background: rgba(11, 15, 25, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: 0.3s;
  z-index: 5;
}

.xianxia-story-card:hover .aura-overlay { opacity: 1; }

.read-btn-spirit {
  background: #34d399;
  color: #0b0f19;
  padding: 8px 18px;
  border-radius: 50px;
  font-weight: 800;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* BADGES */
.jade-chapter-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: #0b0f19;
  color: #fff;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.6rem;
  font-weight: 700;
  border: 1px solid rgba(52, 211, 153, 0.2);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 4px;
}

.sigil-status {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 10px;
  border-radius: 12px 4px 12px 12px;
  font-size: 0.55rem;
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.4);
}

.status-completed { background: #059669; border: 1px solid rgba(255,255,255,0.2); }
.status-on-going { background: #2563eb; border: 1px solid rgba(255,255,255,0.2); }
.status-suggested { background: #d97706; border: 1px solid rgba(255,255,255,0.2); }

/* CONTENT */
.card-spirit-content {
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 6px;
}

.story-title-main {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.4;
  height: 2.8em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: color 0.2s;
}

.xianxia-story-card:hover .story-title-main { color: #34d399; }

.author-spirit {
  font-size: 0.75rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
}

.author-spirit i { color: #34d39980; font-size: 0.65rem; }

.stats-spirit-footer {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.stat-spirit {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  font-weight: 700;
  color: #475569;
}

.animate-spin-slow { animation: spin 8s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .story-title-main { font-size: 0.9rem; }
}
</style>