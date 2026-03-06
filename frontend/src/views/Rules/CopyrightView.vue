<template>
  <div class="rules-page-container">
    <div class="rules-aura-bg"></div>
    <div class="rules-content-card animate-fadeIn">
      <div class="rules-header">
        <i class="fas fa-fingerprint icon-spirit"></i>
        <h1>Bản Quyền (Copyright)</h1>
      </div>
      
      <div class="rules-body">
        <section class="rules-section">
          <h3><i class="fas fa-landmark"></i> Nguồn gốc linh tịch</h3>
          <p>
            Truyện trên hệ thống được sưu tầm từ internet hoặc do các "tác giả" tự sáng tác. 
            Chúng tôi tôn trọng công sức của mọi đạo hữu trong việc tạo ra tri thức.
          </p>
        </section>

        <section class="rules-section">
          <h3><i class="fas fa-bell"></i> Yêu cầu gỡ bỏ</h3>
          <p>
            Nếu bất kỳ đạo hữu hay tông môn nào phát hiện nội dung vi phạm bản quyền 
            thuộc sở hữu của mình, hãy gửi "Truyền Âm" (liên hệ). 
            Chúng tôi sẽ lập tức "thu hồi" (xóa) trong vòng 24-48 giờ sau khi xác minh.
          </p>
        </section>

        <section class="rules-section">
          <h3><i class="fas fa-ban"></i> Cấm sao chép</h3>
          <p>
            Nghiêm cấm dùng "pháp thuật" (tool crawl) để lấy dữ liệu hàng loạt từ 
            hệ thống mà chưa được sự đồng ý của Bảo (Admin). Hành vi này làm kiệt quệ 
            linh mạch của tông môn.
          </p>
        </section>

        <section class="rules-section">
          <h3><i class="fas fa-user-check"></i> Trách nhiệm nội dung</h3>
          <p>
            Chúng tôi không chịu trách nhiệm hoàn toàn về nội dung do người dùng tự đăng tải, 
            nhưng cam kết sẽ kiểm duyệt gắt gao để loại bỏ các "ma công" gây hại.
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
