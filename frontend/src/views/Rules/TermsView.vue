<template>
  <div class="rules-page-container">
    <div class="rules-aura-bg"></div>
    <div class="rules-content-card animate-fadeIn">
      <div class="rules-header">
        <i class="fas fa-scroll icon-spirit"></i>
        <h1>Môn Quy (Điều Khoản Sử Dụng)</h1>
      </div>
      
      <div class="rules-body">
        <section class="rules-section">
          <h3><i class="fas fa-users-rays"></i> Tôn trọng đạo hữu</h3>
          <p>
            Cấm bình luận khiếm nhã, xúc phạm tông môn hoặc các đạo hữu khác. 
            Sự hòa thuận giữa các tu sĩ là nền tảng của sự phát triển. 
            Vi phạm nghiêm trọng sẽ bị "phế bỏ tu vi" (khóa tài khoản) vĩnh viễn.
          </p>
        </section>

        <section class="rules-section">
          <h3><i class="fas fa-book-journal-whills"></i> Nội dung linh tịch</h3>
          <p>
            Không đăng tải nội dung đồi trụy, phản động hoặc vi phạm pháp luật 
            nước Cộng hòa Xã hội Chủ nghĩa Việt Nam. Các tác phẩm phải lành mạnh 
            và mang tính giải trí cao.
          </p>
        </section>

        <section class="rules-section">
          <h3><i class="fas fa-key"></i> Trách nhiệm cá nhân</h3>
          <p>
            Đạo hữu tự bảo quản "pháp bảo" (tài khoản) của mình. 
            Mọi tổn thất do lộ mật khẩu cho người khác, tông môn sẽ không chịu trách nhiệm bồi hoàn.
          </p>
        </section>

        <section class="rules-section">
          <h3><i class="fas fa-gem"></i> Tu vi ảo</h3>
          <p>
            Các danh hiệu, cấp bậc, linh thạch trên trang web chỉ có giá trị tinh thần 
            trong phạm vi TruyenVietHay. Chúng không có giá trị quy đổi trong thế giới phàm trần.
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
