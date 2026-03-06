<template>
  <footer class="footer-xianxia">
    <div class="footer-aura-glow"></div>
    
    <div class="footer-content-container">
      <div class="footer-section sect-sect-identity">
        <router-link to="/" class="footer-logo-link">
          <img src="@/assets/images/logo.png" alt="TruyenVietHay Logo" class="footer-logo-spirit" />
        </router-link>
        <p class="spirit-description">
          Dẫn lối đạo hữu vào cõi tiên, khám phá những bí tịch huyền huyễn, 
          vượt qua nghịch cảnh mạt thế. Chúc đạo hữu sớm ngày đại thành!
        </p>
        <div class="spirit-social-links">
          <a href="https://www.facebook.com/truyenviethay" class="social-aura-icon"><i class="fab fa-facebook-f"></i></a>
          <a href="https://discord.gg/m5JecZwy" class="social-aura-icon"><i class="fab fa-discord"></i></a>
          <a href="https://www.tiktok.com/@truyenviethay" class="social-aura-icon"><i class="fab fa-tiktok"></i></a>
        </div>
      </div>

      <div class="footer-section">
        <h4 class="footer-spirit-title">Đạo Lộ</h4>
        <nav class="footer-spirit-nav">
          <router-link to="/truyen-chu" class="footer-nav-link">Truyện Chữ</router-link>
          <router-link to="/xep-hang" class="footer-nav-link">Bảng Xếp Hạng</router-link>
          <router-link to="/truyen-hot" class="footer-nav-link">Truyện Hot</router-link>
          <router-link to="/the-loai" class="footer-nav-link">Thể Loại</router-link>
        </nav>
      </div>

      <div class="footer-section">
        <h4 class="footer-spirit-title">Quy Tắc</h4>
        <nav class="footer-spirit-nav">
          <router-link to="/chinh-sach-bao-mat" class="footer-nav-link">Thiên Cơ Lệnh</router-link>
          <router-link to="/dieu-khoan-su-dung" class="footer-nav-link">Môn Quy</router-link>
          <router-link to="/ban-quyen" class="footer-nav-link">Bản Quyền</router-link>
          <router-link to="/lien-he" class="footer-nav-link">Truyền Âm</router-link>
        </nav>
      </div>
    <div class="footer-section sect-apps">
    <h4 class="footer-spirit-title">App</h4>
    <p class="spirit-text-sm">Mang cả thế giới truyện vào điện thoại.</p>
    <div class="app-aura-buttons">
      <div class="app-btn-mock install-pwa-btn" @click="handleInstallApp">
        <i class="fas fa-magic"></i>
        <span>Android</span>
      </div>
      
      <div class="app-btn-mock">
        <i class="fab fa-apple"></i>
        <span>iOS (Dùng Safari > Share)</span>
      </div>
    </div>
  </div>
    </div>

    <div class="footer-bottom-aura">
      <div class="bottom-aura-content">
        <span class="copyright-spirit">
          &copy; 2026 <span class="text-emerald-400">TruyenVietHay</span>. Tu luyện bởi <strong>Võ Đình Quốc Bảo</strong>.
        </span>
        <div class="bottom-spirit-badges">
          <span>Hệ thống: V2.1.0</span>
          <span>Pháp khí: Antigravity</span>
        </div>
      </div>
    </div>
  </footer>
</template>
<script setup>
import { ref, onMounted } from 'vue'

const installPrompt = ref(null)

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Chặn trình duyệt tự hiện bảng cài đặt mặc định
    e.preventDefault()
    // Lưu sự kiện để kích hoạt sau
    installPrompt.value = e
  })
})

const handleInstallApp = async () => {
  if (!installPrompt.value) {
    alert("Đạo hữu có thể dùng tính năng 'Thêm vào màn hình chính' trong menu trình duyệt!")
    return
  }
  // Hiện bảng cài đặt của PWA
  installPrompt.value.prompt()
  const { outcome } = await installPrompt.value.userChoice
  if (outcome === 'accepted') {
    installPrompt.value = null
  }
}
</script>

<style scoped>
.install-pwa-btn {
  background: rgba(52, 211, 153, 0.1) !important;
  border: 1px solid #34d399 !important;
  animation: auraPulse 2s infinite;
}

@keyframes auraPulse {
  0% { box-shadow: 0 0 5px rgba(52, 211, 153, 0.2); }
  50% { box-shadow: 0 0 15px rgba(52, 211, 153, 0.5); }
  100% { box-shadow: 0 0 5px rgba(52, 211, 153, 0.2); }
}
</style>
<style scoped>
.footer-xianxia {
  position: relative;
  background: #0b0f19;
  padding-top: 60px;
  border-top: 1px solid rgba(52, 211, 153, 0.1);
  overflow: hidden;
  color: #94a3b8;
}

/* Hiệu ứng hào quang dưới đáy */
.footer-aura-glow {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 100px;
  background: radial-gradient(circle, rgba(52, 211, 153, 0.05) 0%, transparent 70%);
  filter: blur(40px);
  pointer-events: none;
}

.footer-content-container {
  max-width: 1440px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
  gap: 40px;
  padding: 0 40px 60px;
}

.footer-logo-spirit {
  height: 45px;
  margin-bottom: 20px;
  filter: drop-shadow(0 0 5px rgba(52, 211, 153, 0.1));
}

.spirit-description {
  line-height: 1.7;
  font-size: 0.9rem;
  margin-bottom: 25px;
  color: #64748b;
}

.footer-spirit-title {
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 25px;
  position: relative;
}

.footer-spirit-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -8px;
  width: 30px;
  height: 2px;
  background: #34d399;
  box-shadow: 0 0 5px #34d399;
}

.footer-spirit-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-nav-link {
  color: #64748b;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}

.footer-nav-link:hover {
  color: #34d399;
  transform: translateX(8px);
}

.footer-nav-link::before {
  content: '✦';
  font-size: 0.6rem;
  margin-right: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.footer-nav-link:hover::before {
  opacity: 1;
}

/* Socials & Apps */
.spirit-social-links {
  display: flex;
  gap: 15px;
}

.social-aura-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  border: 1px solid rgba(255,255,255,0.05);
  transition: all 0.3s;
}

.social-aura-icon:hover {
  background: rgba(52, 211, 153, 0.1);
  color: #34d399;
  border-color: #34d39960;
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.app-aura-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.app-btn-mock {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 15px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.app-btn-mock:hover {
  background: rgba(255,255,255,0.05);
  border-color: rgba(52, 211, 153, 0.3);
}

.app-btn-mock i {
  font-size: 1.2rem;
  color: #34d399;
}

.app-btn-mock span {
  font-size: 0.8rem;
  font-weight: 600;
}

/* Bottom Bar */
.footer-bottom-aura {
  padding: 25px 40px;
  background: #090d16;
  border-top: 1px solid rgba(255,255,255,0.02);
}

.bottom-aura-content {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright-spirit {
  font-size: 0.85rem;
  color: #475569;
}

.bottom-spirit-badges {
  display: flex;
  gap: 20px;
  font-size: 0.75rem;
  color: #334155;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Responsive */
@media (max-width: 1024px) {
  .footer-content-container {
    grid-template-columns: 1fr 1fr;
    gap: 50px;
  }
}

@media (max-width: 640px) {
  .footer-content-container {
    grid-template-columns: 1fr;
    padding: 0 25px 40px;
  }
  .bottom-aura-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
}
</style>