<template>
  <div class="rules-page-container">
    <div class="rules-aura-bg"></div>
    <div class="rules-content-card animate-fadeIn">
      <div class="rules-header">
        <i class="fas fa-eye-slash icon-spirit"></i>
        <h1>Thiên Cơ Lệnh (Chính Sách Bảo Mật)</h1>
      </div>
      
      <div class="rules-body">
        <section class="rules-section">
          <h3><i class="fas fa-wind"></i> Thu thập linh khí (Dữ liệu)</h3>
          <p>
            Chúng tôi thu thập thông tin cơ bản (Email, Tên hiển thị) khi đạo hữu "nhập môn" (đăng ký) 
            để lưu trữ lộ trình tu luyện (lịch sử đọc). Điều này giúp hệ thống nhận diện và bảo vệ 
            quá trình tu hành của đạo hữu qua các cõi.
          </p>
        </section>

        <section class="rules-section">
          <h3><i class="fas fa-shield-halved"></i> Bảo mật trận pháp</h3>
          <p>
            Mật khẩu của đạo hữu được mã hóa bằng "trận pháp" hiện đại (bcrypt/hash), ngay cả 
            các Đại Lão (Admin) cũng không thể xem được. Dữ liệu của đạo hữu được phong ấn an toàn 
            trong Linh Đài của hệ thống.
          </p>
        </section>

        <section class="rules-section">
          <h3><i class="fas fa-hand-holding-heart"></i> Truyền tin</h3>
          <p>
            Chúng tôi tuyệt đối không bán thông tin đạo hữu cho "ma đạo" (bên thứ ba) để trục lợi. 
            Mọi thông tin chỉ được sử dụng trong nội bộ tông môn TruyenVietHay để nâng cao trải nghiệm tu luyện.
          </p>
        </section>

        <section class="rules-section">
          <h3><i class="fas fa-cookie-bite"></i> Linh Đan (Cookies)</h3>
          <p>
            Sử dụng cookies để ghi nhớ trạng thái đăng nhập, giúp đạo hữu không phải nhập mật khẩu 
            mỗi lần "vượt ranh giới". Đạo hữu có thể tùy chỉnh trình duyệt để từ chối cookies, 
            nhưng điều này có thể làm gián đoạn quá trình vận hành linh khí.
          </p>
        </section>
      </div>

      <div class="rules-footer">
        <router-link to="/" class="back-home-btn">
          <i class="fas fa-arrow-left"></i> Quay về Tông Môn
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "@/assets/css/rules-style.css";
</style>
