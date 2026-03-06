<template>
  <div class="rules-page-container">
    <div class="rules-aura-bg"></div>
    <div class="rules-content-card animate-fadeIn">
      <div class="rules-header">
        <i class="fas fa-comment-dots icon-spirit"></i>
        <h1>Truyền Âm (Liên Hệ)</h1>
      </div>
      
      <div class="rules-body">
        <div class="contact-grid">
          <div class="contact-card">
            <i class="fas fa-envelope-open-text"></i>
            <h4>Linh Thư (Email)</h4>
            <p>quocbao201104@gmail.com</p>
          </div>
          <div class="contact-card">
            <i class="fab fa-telegram"></i>
            <h4>Thần Thức (Zalo/Tele)</h4>
            <p>0372783767</p>
          </div>
          <div class="contact-card">
            <i class="fas fa-map-marker-alt"></i>
            <h4>Tọa Độ Tông Môn</h4>
            <p>Ho Chi Minh City, Viet Nam</p>
          </div>
          <div class="contact-card">
            <i class="fas fa-hourglass-half"></i>
            <h4>Thời Gian Phản Hồi</h4>
            <p>Trong vòng 1 "canh giờ" (hoặc 24h)</p>
          </div>
        </div>

        <section class="rules-section text-center">
          <h3>Mục đích truyền âm</h3>
          <p>
            Hỗ trợ lỗi nạp linh thạch, báo lỗi chương truyện, 
            yêu cầu hợp tác phát triển tông môn hoặc gia nhập đội ngũ đại lão.
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
