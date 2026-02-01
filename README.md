# TruyenVietHay - Nền Tảng Đọc Truyện Online

TruyenVietHay là một ứng dụng web full-stack hiện đại cho phép người dùng đọc, quản lý và chia sẻ các tác phẩm truyện chữ. Hệ thống bao gồm giao diện người dùng thân thiện (Frontend) và hệ thống quản lý dữ liệu mạnh mẽ (Backend), tích hợp lưu trữ đám mây và cơ sở dữ liệu hiệu năng cao.

## 🚀 Tính Năng Chính

*   **Đọc Truyện**: Giao diện đọc truyện tùy biến, hỗ trợ mục lục, điều hướng chương.
*   **Quản Lý Tài Khoản**: Đăng ký, đăng nhập, quản lý thông tin cá nhân.
*   **Hệ Thống Gamification (Mới)**:
    *   **Cấp Độ & Tu Tiên**: Hệ thống phân cấp người dùng dựa trên điểm kinh nghiệm (EXP).
    *   **Nhiệm Vụ (User Tasks)**: Hệ thống nhiệm vụ hàng ngày và tự động (đọc chương, cập nhật profile).
    *   **Đổi Thưởng**: Cửa hàng vật phẩm, sử dụng **Linh Thạch** (Currency) để mua quà tặng và vật phẩm.
    *   **Kho Đồ**: Quản lý vật phẩm đã nhận/mua.
*   **Hiệu Năng & Caching (Mới)**:
    *   **Cache Layer**: Tích hợp `node-cache` giảm tải Database cho các truy vấn phổ biến (BXH, Truyện hot).
    *   **Database Query Optimization**: Tối ưu hóa Indexes và Fulltext Search.
*   **Tương Tác**: Bình luận, đánh giá, yêu thích, theo dõi truyện.
*   **Đăng Truyện**: Người dùng có thể upload truyện, quản lý chương (cần quyền admin/fresher).
*   **Tìm Kiếm Nâng Cao**: Lọc theo thể loại, trạng thái, số chương.
*   **Responsive**: Tương thích hoàn toàn với Mobile và Desktop.

## 🛠 Tech Stack

### Frontend
*   **Core**: Vue 3 (Composition API), TypeScript
*   **Build Tool**: Vite
*   **State Management**: Pinia
*   **Routing**: Vue Router
*   **Styling**: Tailwind CSS
*   **UI Components**: FontAwesome, Swiper, Vue Toastification
*   **HTTP Client**: Axios

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MySQL (sử dụng thư viện `mysql2` với Connection Pooling)
*   **Authentication**: JWT (JSON Web Tokens)
*   **Security**: Helmet, CORS, XSS-Clean, Rate Limiting
*   **Media Storage**: Cloudinary SDK

### Infrastructure
*   **Frontend Hosting**: Vercel
*   **Backend Hosting**: Render
*   **Database**: Aiven MySQL
*   **Media**: Cloudinary

## 📂 Cá Trúc Thư Mục

```
truyenviethay_new/
├── backend/                # Source code Backend (Node.js/Express)
│   ├── config/             # Cấu hình DB, Cloudinary
│   ├── controllers/        # Xử lý logic nghiệp vụ
│   ├── middleware/         # Middleware (Auth, Upload, Error)
│   ├── models/             # Tương tác Database
│   ├── routes/             # Định nghĩa API endpoints
│   └── index.js            # Entry point
│
├── frontend/               # Source code Frontend (Vue 3)
│   ├── src/
│   │   ├── components/     # UI Components tái sử dụng
│   │   ├── views/          # Các trang chính (Pages)
│   │   ├── stores/         # Pinia Stores
│   │   └── services/       # API Services
│   └── vite.config.ts      # Cấu hình Vite
└── README.md
```

## 💻 Cài Đặt & Chạy Local

### Yêu cầu
*   Node.js >= 18.0.0
*   npm hoặc yarn
*   Git

### 1. Clone dự án
```bash
git clone <repository-url>
cd truyenviethay_new
```

### 2. Cấu hình Backend
Di chuyển vào thư mục backend và cài đặt dependencies:
```bash
cd backend
npm install
```
Tạo file `.env` trong thư mục `backend/` dựa trên nội dung sau:
```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database (Aiven hoặc Local)
DB_HOST=...
DB_PORT=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Security
JWT_SECRET=YOUR_SUPER_SECRET_KEY
```
Chạy server backend:
```bash
npm start
# Hoặc chế độ dev
npm run dev
```

### 3. Cấu hình Frontend
Di chuyển vào thư mục frontend và cài đặt dependencies:
```bash
cd ../frontend
npm install
```
Tạo file `.env` trong thư mục `frontend/` (hoặc `.env.local`):
```env
# URL của Backend API chạy local
VITE_API_URL=http://localhost:3000
```
Chạy frontend dev server:
```bash
npm run dev
```
Truy cập `http://localhost:5173` để trải nghiệm ứng dụng.

## 📝 API Documentation
Backend cung cấp các endpoint chính:
*   `/api/auth`: Đăng ký, Đăng nhập
*   `/api/truyen`: Quản lý truyện
*   `/api/chuong`: Quản lý chương
*   `/api/user`: Thông tin người dùng
*   ... (Xem chi tiết trong thư mục `backend/routes`)
