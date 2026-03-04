<template>
  <div class="trang-chu">
    <!-- Phần hero -->
    <section class="hero">
      <div class="container">
        <div class="logo-wrapper">
          <img
            src="@/assets/images/logo.png"
            alt="TruyenVietHay Logo"
            class="logo"
          />
          <p class="slogan">Thế giới truyện Việt trong tầm tay bạn</p>
        </div>

        <h1 class="tieu-de-chinh">
          Đọc Truyện Miễn Phí, Nhanh Và Mượt Mà, Cộng Đồng Tác Giả Tài Năng,
          Cùng Nhau Sáng Tạo
        </h1>

        <div class="nut-dieu-huong">
          <router-link to="/truyen-chu" class="nut-truyen nut-truyen-chu">
            Truyện Chữ <span class="mui-ten">→</span>
          </router-link>
          <router-link to="/truyen-tranh" class="nut-truyen nut-truyen-tranh">
            Truyện Tranh <span class="mui-ten">→</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Phần giới thiệu -->
    <section class="gioi-thieu">
      <div class="container">
        <h2 class="tieu-de-phu">
          Giới thiệu về TruyenVietHay – Truyện Hay Truyện Việt - Nền tảng đọc
          truyện online miễn phí mới 2025
        </h2>

        <p class="noi-dung">
          <strong>TruyenVietHay</strong> tự hào là nền tảng đọc truyện trực
          tuyến hàng đầu Việt Nam, nơi kết nối tâm hồn yêu văn chương của hàng
          triệu độc giả. Với sứ mệnh "Lan tỏa văn hóa đọc", chúng tôi mang đến
          không gian đọc truyện chất lượng cao hoàn toàn miễn phí, nơi mỗi câu
          chữ đều thấm đẫm tinh thần Việt.
        </p>

        <h3 class="tieu-de-nho">Điểm khác biệt chỉ có tại TruyenVietHay</h3>

        <ul class="danh-sach">
          <li>
            <strong>Kho truyện đồ sộ đa thể loại:</strong> Hơn 50.000+ tựa
            truyện từ cổ điển đến hiện đại, đáp ứng mọi gu đọc: ngôn tình lãng
            mạn, kiếm hiệp kỳ ảo, trinh thám hồi hộp, khoa học viễn tưởng sáng
            tạo, và cả những tác phẩm văn học đương đại đậm chất Việt.
          </li>

          <li>
            <strong>Cập nhật nhanh - chất lượng cao:</strong> Mỗi ngày có 100+
            chương truyện mới được đăng tải. Đội ngũ biên tập viên chuyên nghiệp
            đảm bảo nội dung chuẩn mực, hình ảnh sắc nét.
          </li>

          <li>
            <strong>Cộng đồng sáng tạo rộng lớn:</strong> Kết nối với 5.000+ tác
            giả tài năng từ Bắc chí Nam. Bạn có thể tương tác trực tiếp với tác
            giả, đóng góp ý tưởng hoặc tham gia các cuộc thi sáng tác thường
            niên.
          </li>

          <li>
            <strong>Trải nghiệm đọc đỉnh cao:</strong> Giao diện được tối ưu hóa
            cho mọi thiết bị. Chế độ đọc ban đêm, lưu trang tự động, điều chỉnh
            font chữ giúp bảo vệ mắt và nâng cao trải nghiệm.
          </li>

          <li>
            <strong>Hệ thống đề cử thông minh:</strong> Công nghệ AI phân tích
            sở thích để gợi ý những truyện phù hợp nhất với bạn. Bộ sưu tập cá
            nhân cho phép lưu trữ và đồng bộ trên mọi thiết bị.
          </li>

          <li>
            <strong>Hỗ trợ tác giả toàn diện:</strong> Chính sách chia sẻ lợi
            nhuận công bằng, hệ thống đánh giá minh bạch và các workshop nâng
            cao nghiệp vụ dành cho tác giả.
          </li>
        </ul>

        <div class="thong-tin-them">
          <h4 class="tieu-de-nho">Con số ấn tượng</h4>
          <div class="so-lieu">
            <div class="so-lieu-item">
              <span class="con-so">50.000+</span>
              <span class="mo-ta">Tựa truyện</span>
            </div>
            <div class="so-lieu-item">
              <span class="con-so">2.000.000+</span>
              <span class="mo-ta">Độc giả</span>
            </div>
            <div class="so-lieu-item">
              <span class="con-so">5.000+</span>
              <span class="mo-ta">Tác giả</span>
            </div>
          </div>
        </div>

        <p class="ket-thuc">
          <strong>TruyenVietHay</strong> không chỉ là nơi đọc truyện, mà còn là
          ngôi nhà chung của những người yêu văn chương. Dù bạn là độc giả thích
          khám phá hay tác giả muốn chia sẻ tác phẩm, chúng tôi luôn chào đón
          bạn với những trải nghiệm <strong>đậm chất Việt</strong> nhất.
        </p>

        <div class="copyright">
          © 2024 TruyenVietHay. Bản quyền thuộc về TruyenVietHay Team.
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

<style>
/* Reset CSS */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

/* Font chữ */

/* Layout chính */
.trang-chu {
  font-family: "Be Vietnam Pro", sans-serif;
  background-color: #1a1d29;
  color: #ffffff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Phần Hero */
.hero {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 40px 0;
}

.logo-wrapper {
  margin-bottom: 30px;
}

.logo {
  width: 260px;
  height: auto;
  margin: 0 auto;
  display: block;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.1));
}

.logo:hover {
  transform: scale(1.05);
}

.slogan {
  font-size: 1.3rem;
  color: #a1a1aa;
  margin-top: 15px;
  letter-spacing: 0.5px;
}

.tieu-de-chinh {
  font-size: 2rem;
  font-weight: 600;
  max-width: 800px;
  margin: 0 auto 30px;
  color: #fff;
  line-height: 1.4;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Nút điều hướng */
.nut-dieu-huong {
  display: flex;
  gap: 30px;
  justify-content: center;
}

.nut-truyen {
  display: inline-flex;
  align-items: center;
  padding: 16px 42px;
  border-radius: 30px;
  font-size: 1.2rem;
  font-weight: 600;
  text-decoration: none;
  color: white;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nut-truyen::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: 0.5s;
}

.nut-truyen:hover::before {
  left: 100%;
}

.nut-truyen-chu {
  background: linear-gradient(135deg, #4ade80, #22c55e);
  box-shadow: 0 4px 15px rgba(74, 222, 128, 0.3);
}

.nut-truyen-tranh {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.nut-truyen:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.mui-ten {
  margin-left: 8px;
  transition: transform 0.3s ease;
}

.nut-truyen:hover .mui-ten {
  transform: translateX(5px);
}

/* Phần giới thiệu */
.gioi-thieu {
  padding: 50px 0;
  background-color: #1a1d29;
  border-top: 1px solid #2a2f42;
}

.tieu-de-phu {
  font-size: 1.8rem;
  font-weight: 700;
  color: #facc15;
  margin-bottom: 30px;
  text-align: center;
  position: relative;
  padding-bottom: 10px;
}

.tieu-de-phu::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: #facc15;
}

.noi-dung {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #d4d4d8;
  margin-bottom: 25px;
  text-align: center;
}

.tieu-de-nho {
  font-size: 1.4rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 20px;
  text-align: center;
}

.danh-sach {
  list-style-type: none;
  margin-bottom: 25px;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.danh-sach li {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #d4d4d8;
  margin-bottom: 12px;
  padding-left: 30px;
  position: relative;
  transition: transform 0.2s ease;
}

.danh-sach li::before {
  content: "▹";
  color: #4ade80;
  font-size: 1.2rem;
  position: absolute;
  left: 0;
  top: 0;
}

.danh-sach li:hover {
  transform: translateX(5px);
}

.danh-sach li strong {
  color: #ffffff;
}

/* Phần số liệu */
.thong-tin-them {
  margin: 40px 0;
}

.so-lieu {
  display: flex;
  justify-content: space-around;
  margin: 30px 0;
  flex-wrap: wrap;
}

.so-lieu-item {
  text-align: center;
  margin: 15px;
  min-width: 150px;
}

.con-so {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #facc15;
  margin-bottom: 5px;
}

.mo-ta {
  font-size: 0.9rem;
  color: #a1a1aa;
}

/* Kết thúc */
.ket-thuc {
  font-size: 1.2rem;
  line-height: 1.8;
  color: #d4d4d8;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.ket-thuc strong {
  color: #facc15;
}

/* Copyright */
.copyright {
  margin-top: 50px;
  text-align: center;
  color: #a1a1aa;
  font-size: 0.9rem;
  padding-top: 20px;
  border-top: 1px solid #2a2f42;
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    min-height: 70vh;
    padding: 30px 0;
  }

  .logo {
    width: 180px;
  }

  .slogan {
    font-size: 1rem;
  }

  .tieu-de-chinh {
    font-size: 1.6rem;
    padding: 0 15px;
  }

  .nut-dieu-huong {
    flex-direction: column;
    gap: 20px;
  }

  .nut-truyen {
    padding: 14px 30px;
    font-size: 1.1rem;
  }

  .tieu-de-phu {
    font-size: 1.5rem;
    padding: 0 15px;
  }

  .noi-dung,
  .danh-sach li,
  .ket-thuc {
    font-size: 1rem;
    padding: 0 15px;
  }

  .danh-sach li {
    padding-left: 25px;
  }

  .so-lieu {
    flex-direction: column;
    align-items: center;
  }

  .so-lieu-item {
    margin: 10px 0;
  }

  .copyright {
    margin-top: 30px;
    font-size: 0.8rem;
  }
}
</style>
