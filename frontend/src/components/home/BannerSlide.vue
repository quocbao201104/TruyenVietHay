<template>
  <!-- ROOT CONTAINER -->
  <div class="banner-slide-aura" :class="{ active: isActive }">
    <!-- ========================================== -->
    <!-- GIAO DIỆN MOBILE (BANNER TĨNH THEO MOCKUP) -->
    <!-- Chỉ hiển thị trên slide đầu tiên để tránh lặp lại nhiều lần -->
    <!-- ========================================== -->
    <div v-if="isFirstSlide" class="mobile-static-banner mobile-only">
      <div class="mobile-bg-wrapper">
        <img src="https://res.cloudinary.com/dg9ftuhv4/image/upload/v1772805142/truyenviethay/banners/banner-mobile.png" alt="Truyện Việt Hay Banner" class="mobile-bg-img" />
        <!-- Lớp phủ gradient đen lên phần chữ để đảm bảo dễ đọc -->
        <div class="mobile-vignette"></div>
      </div>

      <div class="mobile-content-wrapper">
        <h1 class="grand-title-mobile">
          <div class="title-line">
            <span class="word-glow">KHÁM PHÁ</span>
          </div>
          <div class="title-line">
            <span class="word-glow-emerald">THIÊN THƯ</span>
          </div>
        </h1>
        
        <p class="slogan-mobile">VẠN GIỚI KHAI NGUYÊN - TIÊN LỘ THÔNG THIÊN</p>

        <div class="action-buttons-mobile">
          <router-link to="/truyen-chu" class="spirit-btn-sm emerald">
            <div class="btn-aura-sm"></div>
            <span class="btn-inner-sm">TRUYỆN CHỮ</span>
          </router-link>
          <router-link to="/truyen-tranh" class="spirit-btn-sm azure">
            <div class="btn-aura-sm"></div>
            <span class="btn-inner-sm">TRUYỆN TRANH</span>
          </router-link>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getImageUrl } from "@/config/constants";

const props = defineProps({
  story: { type: Object, required: true },
  isActive: { type: Boolean, default: false },
  // Thêm prop index để nhận biết slide đầu tiên
  index: { type: Number, default: 0 }
});

const coverUrl = computed(() => getImageUrl(props.story.anh_bia));

// Chỉ render Banner Mobile tĩnh ở slide đầu tiên để tránh bị đè chồng
const isFirstSlide = computed(() => props.index === 0 || props.index === 1);

const formatNumber = (num: number) => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

const truncateText = (text: string, length: number) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Spectral:wght@700;800&family=Be+Vietnam+Pro:wght@400;500;700;800&family=Cinzel:wght@700;900&display=swap");

.banner-slide-aura {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 15px;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.2;
  transform: scale(0.92);
  font-family: 'Be Vietnam Pro', sans-serif;
}
.banner-slide-aura.active { opacity: 1; transform: scale(1); z-index: 10; }

/* Cấu trúc ẩn hiện giữa Mobile & Desktop */
.desktop-only { display: block; }
.mobile-only { display: none; }

/* ===== DESKTOP STYLES (Giữ nguyên) ===== */
.slide-jade-scroll {
  position: relative; width: 100%; height: 100%;
  border-radius: 24px; overflow: hidden;
  background-color: #0b0f19;
  border: 1px solid rgba(52, 211, 153, 0.2);
  box-shadow: 0 20px 50px rgba(0,0,0,0.6);
}
.cover-spirit-wrapper { position: absolute; inset: 0; z-index: 1; }
.cover-bg-aura { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: blur(40px) brightness(0.3); opacity: 0.8; }
.cover-img-spirit {
  position: absolute; top: 0; right: 0; width: 60%; height: 100%; object-fit: cover;
  mask-image: linear-gradient(to right, transparent, black 30%);
  -webkit-mask-image: linear-gradient(to right, transparent, black 30%);
}
.info-spirit-wrapper {
  position: relative; z-index: 10; width: 55%; height: 100%; padding: 50px; display: flex; flex-direction: column;
  justify-content: center; align-items: flex-start; background: linear-gradient(90deg, #0b0f19 0%, rgba(11, 15, 25, 0.8) 60%, transparent 100%);
}
.badge-spirit-suggested {
  background: linear-gradient(135deg, #fbbf24, #d97706); color: #0b0f19;
  padding: 5px 14px; border-radius: 50px; font-size: 0.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; box-shadow: 0 0 15px rgba(251, 191, 36, 0.3);
}
.title-spectral {
  font-family: 'Spectral', serif; font-size: 3rem; font-weight: 800; color: #fff; line-height: 1.1; margin-bottom: 15px; text-shadow: 0 4px 15px rgba(0,0,0,0.5); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.meta-spirit-row { display: flex; align-items: center; gap: 15px; color: #94a3b8; font-size: 0.9rem; font-weight: 600; margin-bottom: 25px; }
.description-spirit { font-size: 1rem; color: #cbd5e1; line-height: 1.7; margin-bottom: 35px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; opacity: 0.8; }
.btn-khai-mon-aura { background: #34d399; color: #0b0f19; padding: 14px 35px; border-radius: 12px; font-weight: 900; font-size: 0.85rem; text-decoration: none; transition: all 0.3s; letter-spacing: 1px; box-shadow: 0 10px 20px rgba(52, 211, 153, 0.2); }
.btn-khai-mon-aura:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(52, 211, 153, 0.4); }

/* ===== MOBILE STYLES (ĐỔI SANG BANNER TĨNH) ===== */
@media (max-width: 768px) {
  .banner-slide-aura { padding: 0; opacity: 1; transform: scale(1); }
  .desktop-only { display: none !important; }
  .mobile-only { display: block; }

  /* 1. Bao bọc Banner Tĩnh */
  .mobile-static-banner {
    position: relative;
    width: 100vw;
    height: 60vh; /* Banner cao 60% màn hình điện thoại */
    left: -15px; /* Kéo bù lề của Carousel nếu có */
    display: flex;
    flex-direction: column;
    justify-content: flex-end; /* Ép nội dung xuống đáy */
    overflow: hidden;
  }

  /* 2. Ảnh Nền và Lớp phủ */
  .mobile-bg-wrapper {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .mobile-bg-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
  }

  .mobile-vignette {
    position: absolute;
    inset: 0;
    /* Chuyển mờ dần thành đen ở dưới đáy để chữ nổi bật */
    background: linear-gradient(to bottom, transparent 30%, rgba(5,7,10,0.6) 60%, #0b0f19 100%);
  }

  /* 3. Nội dung (Chữ + Nút) */
  .mobile-content-wrapper {
    position: relative;
    z-index: 10;
    padding: 20px 15px 40px;
    text-align: center;
  }

  .grand-title-mobile {
    font-family: 'Spectral', serif;
    font-size: 3rem;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    letter-spacing: 2px;
  }

  .title-line { display: flex; justify-content: center; gap: 10px; }

  .word-glow { color: #fff; text-shadow: 0 0 15px rgba(255,255,255,0.5), 0 4px 10px rgba(0,0,0,0.8); }
  .word-glow-emerald { color: #6ee7b7; text-shadow: 0 0 20px rgba(52,211,153,0.6), 0 4px 10px rgba(0,0,0,0.8); }

  .slogan-mobile {
    font-family: 'Cinzel', serif;
    font-size: 0.75rem;
    color: #ffffff;
    letter-spacing: 2px;
    margin-bottom: 25px;
    font-weight: 700;
  }

  /* 4. Nút Hành Động */
  .action-buttons-mobile {
    display: flex;
    justify-content: center;
    gap: 15px;
    width: 100%;
  }

  .spirit-btn-sm {
    position: relative;
    flex: 1;
    padding: 12px 0;
    text-decoration: none;
    border-radius: 50px;
    overflow: hidden;
  }

  .btn-inner-sm {
    position: relative;
    z-index: 2;
    color: white;
    font-weight: 700;
    font-size: 0.85rem;
    letter-spacing: 1px;
  }

  .btn-aura-sm { position: absolute; inset: 0; z-index: 1; opacity: 0.9; }

  .spirit-btn-sm.emerald { border: 1px solid transparent; }
  .spirit-btn-sm.emerald .btn-aura-sm { background: linear-gradient(135deg, #10b981, #047857); }
  .spirit-btn-sm.azure { border: 1px solid rgba(255,255,255,0.3); }
  .spirit-btn-sm.azure .btn-aura-sm { background: transparent; backdrop-filter: blur(5px); }
}
</style>