<template>
  <div class="trang-chu-xianxia">
    <section class="hero-gate">
      <div class="hero-bg-wrapper">
        <img 
          src="https://res.cloudinary.com/dg9ftuhv4/image/upload/v1772805144/truyenviethay/banners/banner-desktop.jpg" 
          alt="TruyenVietHay Background" 
          class="hero-bg-image"
          crossorigin="anonymous"
        />
        <div class="hero-vignette"></div>
      </div>

      <div class="container relative z-10">
        <div class="hero-content">
          <div class="logo-wrapper animate-float">
            <img src="@/assets/images/logo.png" alt="TruyenVietHay Logo" class="logo-spirit" />
            <p class="slogan-spirit">Thế giới truyện Việt trong tầm tay bạn</p>
          </div>

          <h1 class="tieu-de-chinh">
            Đọc Truyện Miễn Phí, Nhanh Và Mượt Mà<br/>
            <span class="text-highlight">Cộng Đồng Tác Giả Tài Năng, Cùng Nhau Sáng Tạo</span>
          </h1>

          <div class="nut-dieu-huong">
            <router-link to="/truyen-chu" class="btn-spirit emerald">
              <i class="fas fa-book-open mr-2"></i> Truyện Chữ
            </router-link>
            <router-link to="/truyen-tranh" class="btn-spirit azure">
              <i class="fas fa-image mr-2"></i> Truyện Tranh
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <section class="gioi-thieu-sect">
      <div class="container">
        <div class="section-header-spirit">
          <h2 class="tieu-de-phu">
GIỚI THIỆU VỀ TRUYỆN VIỆT HAY
          </h2>
          <p class="noi-dung-lead">
            Nền tảng đọc truyện online miễn phí mới 2026. Nơi kết nối tâm hồn yêu văn chương của hàng triệu độc giả, mang đến không gian đọc truyện chất lượng cao đậm chất Việt.
          </p>
        </div>

        <div class="stats-grid-aura">
          <div class="stat-card">
            <i class="fas fa-book-journal-whills stat-icon emerald"></i>
            <span class="con-so">50.000+</span>
            <span class="mo-ta">Tựa truyện</span>
          </div>
          <div class="stat-card">
            <i class="fas fa-users stat-icon azure"></i>
            <span class="con-so">2.000.000+</span>
            <span class="mo-ta">Độc giả</span>
          </div>
          <div class="stat-card">
            <i class="fas fa-feather-pointed stat-icon gold"></i>
            <span class="con-so">5.000+</span>
            <span class="mo-ta">Tác giả</span>
          </div>
        </div>

        <h3 class="tieu-de-nho">Điểm Khác Biệt Làm Nên Cảnh Giới</h3>

        <div class="features-grid-spirit">
          <div class="feature-card">
            <div class="feature-icon"><i class="fas fa-layer-group"></i></div>
            <h4 class="feature-title">Kho Truyện Đồ Sộ</h4>
            <p class="feature-desc">Hơn 50.000+ tựa truyện đa thể loại: Tiên hiệp, kiếm hiệp, ngôn tình, khoa học viễn tưởng và văn học đương đại Việt.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon"><i class="fas fa-bolt"></i></div>
            <h4 class="feature-title">Cập Nhật Thần Tốc</h4>
            <p class="feature-desc">100+ chương truyện mới mỗi ngày. Đội ngũ biên tập viên chuyên nghiệp đảm bảo nội dung chuẩn mực, sắc nét.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon"><i class="fas fa-handshake"></i></div>
            <h4 class="feature-title">Cộng Đồng Sáng Tạo</h4>
            <p class="feature-desc">Kết nối với 5.000+ tác giả tài năng. Tương tác trực tiếp, đóng góp ý tưởng và tham gia các cuộc thi sáng tác.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon"><i class="fas fa-mobile-screen"></i></div>
            <h4 class="feature-title">Trải Nghiệm Đỉnh Cao</h4>
            <p class="feature-desc">Giao diện tối ưu mọi thiết bị. Chế độ đọc ban đêm, lưu trang tự động, tùy chỉnh font chữ bảo vệ mắt.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon"><i class="fas fa-brain"></i></div>
            <h4 class="feature-title">Đề Cử Thông Minh</h4>
            <p class="feature-desc">Công nghệ AI phân tích sở thích để gợi ý truyện phù hợp. Đồng bộ bộ sưu tập cá nhân trên mọi thiết bị.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon"><i class="fas fa-gem"></i></div>
            <h4 class="feature-title">Hỗ Trợ Tác Giả</h4>
            <p class="feature-desc">Chính sách chia sẻ lợi nhuận công bằng, hệ thống đánh giá minh bạch và workshop nâng cao nghiệp vụ.</p>
          </div>
        </div>

        <div class="ket-thuc-box">
          <p class="ket-thuc-text">
            <strong>TruyenVietHay</strong> không chỉ là nơi đọc truyện, mà còn là ngôi nhà chung của những người yêu văn chương. Hãy gia nhập cùng chúng tôi để trải nghiệm những trang sách <strong>đậm chất Việt</strong> nhất.
          </p>
        </div>

        <div class="copyright-spirit">
          © 2026 TruyenVietHay. Bản quyền thuộc về TruyenVietHay Team.
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "HomeView",
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap");

.trang-chu-xianxia {
  font-family: "Be Vietnam Pro", sans-serif;
  background-color: #05080f; /* Nền tối sâu */
  color: #cbd5e1;
  min-height: 100vh;
  overflow-x: hidden;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ===== HERO GATE ===== */
/* ===== TỐI ƯU ÁNH SÁNG HERO BANNER ===== */
.hero-gate {
  position: relative;
  min-height: 90vh; /* Tăng chiều cao để thấy rõ background */
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  /* Thêm một lớp màu nền Indigo sâu làm gốc để tránh đen tuyền */
  background-color: #050b18; 
}

.hero-bg-wrapper {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.hero-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
  /* Giảm Blur xuống và tăng độ sáng (brightness) nhẹ */
  filter: blur(2px) brightness(0.7) saturate(1.1);
  transform: scale(1.02);
  animation: spiritMove 30s ease-in-out infinite alternate;
}

/* LỚP PHỦ ÁNH SÁNG TÂM ĐIỂM (Mấu chốt để không bị tối quá) */
.hero-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 50%, 
    rgba(52, 211, 153, 0.1) 0%, /* Hào quang xanh nhẹ ở tâm */
    rgba(5, 11, 24, 0.6) 50%,    /* Mờ dần */
    #05080f 100%                 /* Đen sâu ở rìa */
  );
}

/* Hiệu ứng trôi nổi nhẹ nhàng cho background */
@keyframes spiritMove {
  from { transform: scale(1.02) translate(0, 0); }
  to { transform: scale(1.1) translate(-1%, -2%); }
}

.hero-content {
  position: relative;
  z-index: 10;
  padding: 60px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-wrapper { margin-bottom: 30px; }

.logo-spirit {
  width: 280px;
  height: auto;
  margin: 0 auto;
  filter: drop-shadow(0 0 15px rgba(52, 211, 153, 0.4));
  transition: transform 0.4s ease;
}
.logo-spirit:hover { transform: scale(1.05); filter: drop-shadow(0 0 25px rgba(52, 211, 153, 0.6)); }

.slogan-spirit {
  font-size: 1.2rem;
  color: #94a3b8;
  margin-top: 15px;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-weight: 700;
}

.tieu-de-chinh {
  font-size: 2.2rem;
  font-weight: 800;
  max-width: 900px;
  margin: 0 auto 40px;
  color: #f8fafc;
  line-height: 1.5;
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.8);
}
.text-highlight {
  background: linear-gradient(to right, #34d399, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Nút Tụ Linh */
.nut-dieu-huong {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-spirit {
  display: inline-flex;
  align-items: center;
  padding: 16px 40px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 800;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.btn-spirit.emerald {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #05080f;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}
.btn-spirit.emerald:hover { background: linear-gradient(135deg, #34d399, #6ee7b7); box-shadow: 0 8px 30px rgba(16, 185, 129, 0.6); transform: translateY(-3px); }

.btn-spirit.azure {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f8fafc;
  backdrop-filter: blur(10px);
}
.btn-spirit.azure:hover { background: rgba(255, 255, 255, 0.1); border-color: #60a5fa; color: #60a5fa; box-shadow: 0 8px 30px rgba(96, 165, 250, 0.3); transform: translateY(-3px); }

/* ===== PHẦN GIỚI THIỆU ===== */
.gioi-thieu-sect {
  padding: 80px 0;
  background-image: radial-gradient(circle at 50% 100%, rgba(52, 211, 153, 0.03) 0%, transparent 60%);
}

.section-header-spirit {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 50px;
}

.tieu-de-phu {
  font-size: 2rem;
  font-weight: 900;
  color: #f8fafc;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.noi-dung-lead {
  font-size: 1.15rem;
  line-height: 1.8;
  color: #94a3b8;
}

/* Các con số (Stats) */
.stats-grid-aura {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-bottom: 70px;
}

.stat-card {
  background: rgba(11, 15, 25, 0.6);
  border: 1px solid rgba(52, 211, 153, 0.1);
  border-radius: 20px;
  padding: 30px 20px;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: transform 0.3s;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}
.stat-card:hover { transform: translateY(-5px); border-color: rgba(52, 211, 153, 0.3); }

.stat-icon { font-size: 2.5rem; margin-bottom: 15px; display: block; }
.stat-icon.emerald { color: #34d399; filter: drop-shadow(0 0 10px rgba(52, 211, 153, 0.5)); }
.stat-icon.azure { color: #60a5fa; filter: drop-shadow(0 0 10px rgba(96, 165, 250, 0.5)); }
.stat-icon.gold { color: #fbbf24; filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.5)); }

.con-so { display: block; font-size: 2.5rem; font-weight: 900; color: #f8fafc; margin-bottom: 5px; text-shadow: 0 2px 10px rgba(255,255,255,0.2); }
.mo-ta { font-size: 1rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }

/* Features Grid */
.tieu-de-nho {
  text-align: center; font-size: 1.5rem; font-weight: 800; color: #34d399;
  margin-bottom: 40px; text-transform: uppercase; letter-spacing: 1px;
}

.features-grid-spirit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 25px;
  margin-bottom: 60px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 30px;
  border-radius: 16px;
  transition: all 0.3s ease;
}
.feature-card:hover { background: rgba(52, 211, 153, 0.05); border-color: rgba(52, 211, 153, 0.3); transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.4); }

.feature-icon {
  width: 50px; height: 50px; border-radius: 12px;
  background: rgba(52, 211, 153, 0.1); color: #34d399;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; margin-bottom: 20px;
}

.feature-title { font-size: 1.2rem; font-weight: 700; color: #f1f5f9; margin-bottom: 10px; }
.feature-desc { font-size: 0.95rem; color: #94a3b8; line-height: 1.6; }

/* Kết thúc box */
.ket-thuc-box {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 8, 15, 0));
  border-left: 4px solid #34d399;
  padding: 30px;
  border-radius: 0 16px 16px 0;
  max-width: 900px;
  margin: 0 auto 50px;
}
.ket-thuc-text { font-size: 1.1rem; line-height: 1.8; color: #cbd5e1; margin: 0; }
.ket-thuc-text strong { color: #34d399; }

/* Copyright */
.copyright-spirit {
  text-align: center; color: #475569; font-size: 0.9rem; font-weight: 600;
  padding-top: 30px; border-top: 1px dashed rgba(255, 255, 255, 0.1);
}

/* Animations */
@keyframes slowZoom { 0% { transform: scale(1.05); } 100% { transform: scale(1.15); } }
@keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
.animate-float { animation: float 6s ease-in-out infinite; }

/* Responsive */
@media (max-width: 900px) {
  .tieu-de-chinh { font-size: 1.8rem; }
  .stats-grid-aura { grid-template-columns: 1fr; gap: 20px; margin-bottom: 50px; }
  .features-grid-spirit { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .logo-spirit { width: 220px; }
  .slogan-spirit { font-size: 1rem; }
  .tieu-de-chinh { font-size: 1.5rem; padding: 0 10px; }
  .btn-spirit { width: 100%; justify-content: center; }
  .nut-dieu-huong { flex-direction: column; width: 100%; padding: 0 20px; }
  .tieu-de-phu { font-size: 1.5rem; }
}
</style>