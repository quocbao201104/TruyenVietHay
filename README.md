# 📚 TruyenVietHay — Nền Tảng Đọc Truyện Online

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://truyen-viet-hay.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://truyenviethay-backend-zjfg.onrender.com)
[![Database](https://img.shields.io/badge/Database-Aiven%20MySQL-FF6054?logo=mysql)](https://aiven.io)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-42b883?logo=vue.js)](https://vuejs.org)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js)](https://nodejs.org)

TruyenVietHay là ứng dụng web full-stack hiện đại cho phép người dùng đọc, quản lý và chia sẻ các tác phẩm truyện chữ tiếng Việt. Hệ thống bao gồm giao diện đọc truyện thân thiện, quản lý nội dung cho tác giả, hệ thống gamification và bảng quản trị cho admin.

---

## 🌐 Demo

| Môi trường | URL |
|---|---|
| Frontend (Production) | [truyen-viet-hay.vercel.app](https://truyen-viet-hay.vercel.app) |
| Backend API | [truyenviethay-backend-zjfg.onrender.com](https://truyenviethay-backend-zjfg.onrender.com) |

---

## 🚀 Tính Năng Chính

### 👤 Người Dùng
- **Đăng ký / Đăng nhập** — JWT-based auth, hỗ trợ đăng nhập Google OAuth
- **Hồ sơ cá nhân** — Cập nhật avatar, thông tin cá nhân
- **Lịch sử đọc** — Theo dõi truyện đã đọc và vị trí chương
- **Theo dõi truyện** — Nhận thông báo khi có chương mới
- **Đánh giá & Bình luận** — Rating sao, bình luận từng chương

### 📖 Đọc Truyện
- Giao diện đọc tùy chỉnh (font, cỡ chữ)
- Điều hướng chương trước/sau
- Mục lục chương đầy đủ
- Đếm lượt xem & hot score tự động

### ✍️ Tác Giả
- Upload và quản lý truyện của mình
- Đăng chương mới, chỉnh sửa nội dung
- Xem thống kê lượt xem, theo dõi
- Truyện cần được admin duyệt trước khi public

### 🛡️ Quản Trị (Admin)
- Duyệt / từ chối truyện và chương
- Quản lý người dùng, phân quyền
- Xem cache monitoring (hot stories, top monthly)
- Gửi thông báo hệ thống

### 🎮 Gamification
- **Điểm EXP & Cấp độ** — Tự động lên cấp khi hoàn thành hoạt động
- **Huy hiệu cấp độ** — Badge hiển thị bên cạnh username
- **Nhiệm vụ hàng ngày** — Đọc chương, cập nhật profile, v.v.
- **Linh Thạch (Currency)** — Tiêu tệ nội tệ để mua vật phẩm
- **Cửa hàng & Kho đồ** — Đổi thưởng, quản lý vật phẩm

### ⚡ Hiệu Năng
- **Cache Layer** (`node-cache`) — Giảm tải DB cho BXH, truyện hot
- **Fulltext Search** — Tìm kiếm nhanh theo tên/tác giả
- **Connection Pooling** (40 connections) — Xử lý đồng thời cao
- **Rate Limiting** — Bảo vệ API khỏi spam
- **PWA** — Hỗ trợ Progressive Web App, offline-ready

---

## 🛠 Tech Stack

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| **Vue 3** | 3.x | Core framework (Composition API) |
| **TypeScript** | 5.x | Type safety |
| **Vite** | 6.x | Build tool & dev server |
| **Pinia** | 2.x | State management |
| **Vue Router** | 4.x | Client-side routing |
| **Axios** | 1.x | HTTP client |
| **Vanilla CSS** | — | Styling (không dùng Tailwind) |
| **Swiper** | — | Slider/carousel |
| **FontAwesome** | 6.x | Icons |
| **date-fns** | — | Format thời gian |
| **vite-plugin-pwa** | — | PWA support |

### Backend
| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| **Node.js** | 18+ | Runtime |
| **Express.js** | 4.x | Web framework |
| **mysql2** | 3.x | MySQL driver + Connection Pool |
| **JWT** | — | Authentication |
| **Helmet** | — | HTTP security headers |
| **CORS** | — | Cross-origin resource sharing |
| **xss-clean** | — | XSS protection |
| **express-rate-limit** | — | Rate limiting |
| **node-cache** | — | In-memory caching |
| **Cloudinary** | — | Image/media storage |
| **multer** | — | File upload middleware |
| **compression** | — | Gzip response |
| **winston** | — | Logging |

### Infrastructure
| Thành phần | Dịch vụ |
|---|---|
| Frontend Hosting | [Vercel](https://vercel.com) |
| Backend Hosting | [Render](https://render.com) |
| Database | [Aiven MySQL](https://aiven.io) |
| Media Storage | [Cloudinary](https://cloudinary.com) |

---

## 📂 Cấu Trúc Thư Mục

```
truyenviethay_new/
├── backend/
│   ├── config/
│   │   ├── db.js                  # MySQL connection pool (Aiven)
│   │   └── cloudinary.js          # Cloudinary setup
│   ├── controllers/               # Business logic handlers
│   │   ├── auth.controller.js
│   │   ├── story.controller.js
│   │   ├── chapter.controller.js
│   │   ├── comment.controller.js
│   │   ├── follow.controller.js
│   │   ├── notification.controller.js
│   │   ├── rating.controller.js
│   │   ├── badge.controller.js
│   │   ├── userLevel.controller.js
│   │   ├── userPoint.controller.js
│   │   ├── userTask.controller.js
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js                # JWT authenticate & authorize
│   │   ├── upload_img.js          # Multer + Cloudinary upload
│   │   ├── errorHandler.js        # Global error middleware
│   │   └── validate.js
│   ├── models/                    # Raw SQL query functions
│   │   ├── story.model.js
│   │   ├── chapter.model.js
│   │   ├── comment.model.js
│   │   ├── follow.model.js
│   │   ├── rating.model.js
│   │   ├── levelBadge.model.js
│   │   └── ...
│   ├── routes/                    # Express routers
│   │   ├── story.routes.js
│   │   ├── chapter.routes.js
│   │   ├── auth.routes.js
│   │   ├── notification.routes.js
│   │   ├── badge.routes.js
│   │   └── ...
│   ├── services/                  # Complex business logic
│   │   ├── notification.services.js
│   │   ├── story.services.js
│   │   └── ...
│   ├── utils/
│   │   ├── cache.js               # node-cache wrapper (getOrSet)
│   │   ├── logger.js              # Winston logger
│   │   ├── slugify.js             # Tạo slug từ tên truyện
│   │   └── sanitize.js            # XSS sanitizer
│   ├── migrations/                # SQL migration scripts
│   └── index.js                   # Entry point
│
├── frontend/
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── assets/                # Images, fonts
│   │   ├── components/
│   │   │   ├── layout/            # AppHeader, AppFooter
│   │   │   └── ui/                # Shared UI components
│   │   ├── modules/               # Feature modules (co-located)
│   │   │   ├── auth/              # auth.store.ts, auth.api.ts
│   │   │   ├── notification/      # notification.store.ts, notification.api.ts
│   │   │   ├── story/
│   │   │   ├── chapter/
│   │   │   ├── user/
│   │   │   └── ...
│   │   ├── views/                 # Page-level components
│   │   ├── composables/           # Reusable Vue composables
│   │   ├── config/
│   │   │   └── constants.ts       # API base URL, image helpers
│   │   ├── router/                # Vue Router config
│   │   ├── utils/
│   │   │   └── axios.ts           # Axios instance với interceptors
│   │   └── main.ts
│   ├── vercel.json                # SPA routing fix cho Vercel
│   └── vite.config.ts
│
├── screenshots/                   # App screenshots
└── README.md
```

---

## 💻 Cài Đặt & Chạy Local

### Yêu cầu
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- MySQL (local hoặc Aiven cloud)

### 1. Clone dự án
```bash
git clone https://github.com/quocbao201104/TruyenVietHay.git
cd TruyenVietHay
```

### 2. Cấu hình Backend

```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend/`:
```env
# Server
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database (Aiven MySQL hoặc local)
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Cloudinary (upload ảnh bìa)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth (tùy chọn)
GOOGLE_CLIENT_ID=your_google_client_id
```

Chạy backend:
```bash
npm start          # Production
npm run dev        # Development (nodemon)
```

Backend chạy tại: `http://localhost:3000`

### 3. Cấu hình Frontend

```bash
cd ../frontend
npm install
```

Tạo file `.env` trong thư mục `frontend/`:
```env
VITE_API_URL=http://localhost:3000
```

Chạy frontend:
```bash
npm run dev        # Dev server
npm run build      # Production build
npm run preview    # Preview production build
```

Frontend chạy tại: `http://localhost:5173`

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Đăng ký | — |
| POST | `/api/auth/login` | Đăng nhập | — |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại | ✅ |

### Truyện
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/api/truyen/public` | Danh sách truyện (có phân trang, filter) | — |
| GET | `/api/truyen/hot-stories` | Top truyện hot | — |
| GET | `/api/truyen/top-thang` | Top truyện tháng | — |
| GET | `/api/truyen/slug/:slug` | Chi tiết truyện theo slug | — |
| POST | `/api/truyen` | Tạo truyện mới | ✅ Author |
| PUT | `/api/truyen/:id` | Cập nhật truyện | ✅ Author/Admin |
| DELETE | `/api/truyen/:id` | Xóa truyện | ✅ Author/Admin |
| GET | `/api/truyen/truyen-cua-toi` | Truyện của tôi | ✅ Author |
| GET | `/api/truyen/cho-duyet` | Truyện chờ duyệt | ✅ Admin |
| PUT | `/api/truyen/:id/duyet-truyen` | Duyệt / từ chối | ✅ Admin |

### Chương
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/api/chuong/truyen/:id` | Danh sách chương theo truyện | — |
| GET | `/api/chuong/:id` | Chi tiết chương | — |
| POST | `/api/chuong` | Thêm chương mới | ✅ Author |
| PUT | `/api/chuong/:id` | Sửa chương | ✅ Author |
| DELETE | `/api/chuong/:id` | Xóa chương | ✅ Author/Admin |

### Người Dùng & Gamification
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/api/user/profile` | Hồ sơ cá nhân | ✅ |
| PUT | `/api/user/profile` | Cập nhật hồ sơ | ✅ |
| GET | `/api/levels` | Thông tin cấp độ | ✅ |
| GET | `/api/tasks` | Nhiệm vụ hôm nay | ✅ |
| GET | `/api/points` | Điểm & lịch sử | ✅ |
| GET | `/api/currency` | Số dư Linh Thạch | ✅ |
| GET | `/api/rewards` | Danh sách phần thưởng | ✅ |
| GET | `/api/badges` | Huy hiệu cấp độ | — |

### Tương Tác
| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| GET | `/api/comments` | Bình luận | — |
| POST | `/api/comments` | Đăng bình luận | ✅ |
| GET | `/api/follow` | Truyện đang theo dõi | ✅ |
| POST | `/api/follow` | Theo dõi / bỏ theo dõi | ✅ |
| GET | `/api/like/:storyId` | Trạng thái yêu thích | ✅ |
| POST | `/api/like` | Thích / bỏ thích | ✅ |
| GET | `/api/ratings/:storyId` | Rating truyện | — |
| POST | `/api/ratings` | Đánh giá | ✅ |
| GET | `/api/notifications` | Thông báo | ✅ |
| GET | `/api/history` | Lịch sử đọc | ✅ |

---

## 🚢 Deploy

### Frontend (Vercel)
1. Import repo lên Vercel
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Thêm biến môi trường `VITE_API_URL = https://your-backend.onrender.com`

> File `vercel.json` đã được cấu hình sẵn để hỗ trợ SPA routing (Vue Router history mode).

### Backend (Render)
1. Tạo **Web Service** mới
2. **Root Directory**: `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `node index.js`
5. Thêm tất cả biến môi trường từ file `.env` vào Render dashboard

---

## 🗃️ Database Schema (Tóm tắt)

| Bảng | Mô tả |
|---|---|
| `users_new` | Tài khoản người dùng |
| `truyen_new` | Thông tin truyện |
| `chuong` | Chương truyện |
| `truyen_theloai` | Truyện ↔ Thể loại (nhiều-nhiều) |
| `theloai` | Danh mục thể loại |
| `binh_luan` | Bình luận |
| `theo_doi` | Danh sách theo dõi |
| `yeu_thich` | Yêu thích truyện |
| `ratings` | Đánh giá sao |
| `lich_su_doc` | Lịch sử đọc |
| `truyen_views` | Lượt xem theo ngày (dùng cho BXH tháng) |
| `thong_bao` | Thông báo người dùng |
| `level_badges` | Huy hiệu cấp độ |
| `user_levels` | Cấp độ người dùng |
| `user_points` | Điểm EXP |
| `user_tasks` | Nhiệm vụ đang thực hiện |
| `tasks` | Định nghĩa nhiệm vụ |
| `rewards` | Phần thưởng |
| `user_rewards` | Kho đồ người dùng |
| `user_currency` | Số dư Linh Thạch |

---

## 🔐 Phân Quyền

| Role | Quyền hạn |
|---|---|
| `user` | + Đăng nhập, bình luận, theo dõi, đánh giá, nhận thông báo |
| `author` | + Upload/quản lý truyện và chương của mình |
| `admin` | + Duyệt nội dung, quản lý người dùng, xem cache |

---

## 📄 License

Dự án này được xây dựng cho mục đích học tập và phát triển cá nhân.
