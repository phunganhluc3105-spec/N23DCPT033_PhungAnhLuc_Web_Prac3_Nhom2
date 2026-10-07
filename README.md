> **Bài thực hành Lab 3_Nhóm2: Fullstack Integration — Next.js 15 & Express.js REST API**  
> **Môn học**: Lập trình Web  
> **Sinh viên thực hiện**: Phùng Anh Lực  
> **Mã số sinh viên**: N23DCPT033 — Lớp: D23CQPTUD01-N

---

## 🌐 Đường Dẫn Triển Khai Trực Tiếp (Live Deployment)

- 🚀 **Frontend (Vercel)**: [https://n23-dcpt-033-phung-anh-luc-web-prac-fawn.vercel.app/](https://n23-dcpt-033-phung-anh-luc-web-prac-fawn.vercel.app/)
- ⚙️ **Backend API (Render)**: [https://n23dcpt033-phunganhluc-web-prac3-nhom2.onrender.com/](https://n23dcpt033-phunganhluc-web-prac3-nhom2.onrender.com/)
- 🩺 **API Health Check**: [https://n23dcpt033-phunganhluc-web-prac3-nhom2.onrender.com/api/health](https://n23dcpt033-phunganhluc-web-prac3-nhom2.onrender.com/api/health)

---

1. **Quản lý Bài viết (Posts CRUD)**: Xem danh sách, tạo bài viết mới, chỉnh sửa bài viết qua modal popup, xoá bài viết.
2. **Cập nhật Giao diện Tức thì (Optimistic UI Updates)**: Trải nghiệm xoá bài viết không cần tải lại trang hoặc chờ đợi API round-trip.
3. **Quản lý Bình luận (Comments System)**: Trang chi tiết bài viết dynamic `/posts/[id]`, đếm số lượng bình luận trên từng thẻ bài, thêm bình luận và xoá bình luận.
4. **Bộ lọc & Tìm kiếm**: Lọc bài viết theo danh mục (*Architecture, Interior, Nordic Spaces, Editorial Journal*) và tìm kiếm theo tiêu đề.
5. **Caching & Trạng thái Đồng bộ**: Tích hợp `@tanstack/react-query` v5 tối ưu hoá network request và query invalidation.
6. **Lưu trữ Bền vững Cấp File**: Tích hợp `backend/data.json` với `fs.promises` xử lý đọc/ghi bất đồng bộ an toàn.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Ngôn ngữ**: TypeScript
- **Styling**: Tailwind CSS với bộ bảng màu Editorial ấm áp (*Sand, Espresso, Terracotta*)
- **Data Fetching & State**: [TanStack Query v5](https://tanstack.com/query/latest) (`@tanstack/react-query`)
- **HTTP Client**: Axios (instance tập trung tại `lib/api.ts`)
- **Icons & Toast**: `lucide-react`, `react-hot-toast`

### Backend
- **Nền tảng**: Node.js & Express.js
- **Middleware**: `cors` (hỗ trợ dynamic origins & Vercel previews), `dotenv`, request logger
- **Lưu trữ**: File-based persistent storage (`data.json`)
- **Triển khai**: Render (Web Service Node.js), Vercel (Next.js Edge/Serverless)

---

## 📂 Cấu Trúc Thư Mục (Project Structure)

```text
fullstack-blog/
├── backend/                             # Express REST API Server
│   ├── .env.example                     # Mẫu biến môi trường backend
│   ├── data.json                        # File lưu trữ dữ liệu Posts & Comments
│   ├── package.json                     # Cấu hình dependencies backend
│   └── server.js                        # Toàn bộ mã nguồn API & Routing
├── frontend/                            # Next.js App Router Client
│   ├── app/
│   │   ├── layout.tsx                   # Root layout, Providers & Toaster
│   │   ├── page.tsx                     # Trang chủ: Danh sách bài, bộ lọc, form & modal
│   │   ├── globals.css                  # Custom styling & Design Tokens
│   │   └── posts/[id]/page.tsx          # Trang chi tiết bài viết & module bình luận
│   ├── components/                      # UI Components tái sử dụng
│   ├── lib/
│   │   ├── api.ts                       # Axios client cấu hình base URL
│   │   └── query-provider.tsx           # React Query Provider bọc toàn app
│   ├── types/
│   │   └── blog.ts                      # TypeScript Interfaces (Post, Comment, ...)
│   ├── package.json
│   └── next.config.ts
├── docs/                                # Tài liệu chi tiết
│   ├── API_DOCUMENTATION.md             # Chi tiết Request/Response các Endpoints
│   └── DEPLOYMENT.md                    # Hướng dẫn deploy chi tiết từng bước
├── Fullstack_Blog_API.postman_collection.json # Postman Collection kiểm thử API
├── ROADMAP.md                           # Kế hoạch phát triển và commit log
└── README.md                            # Tài liệu tổng quan dự án
```

---

## 🔌 Danh Sách REST API Endpoints


| Nhóm | Method | Endpoint | Mô tả | Chi tiết |
| :--- | :---: | :--- | :--- | :--- |
| **System** | `GET` | `/` | Kiểm tra tình trạng server | Root Welcome & Version |
| **System** | `GET` | `/api/health` | Uptime & ping status cho Cloud Bot | Health Check |
| **Posts** | `GET` | `/api/posts` | Lấy danh sách tất cả bài viết | Kèm `commentsCount` |
| **Posts** | `GET` | `/api/posts/:id` | Lấy chi tiết 1 bài viết | Kèm danh sách comments |
| **Posts** | `POST` | `/api/posts` | Tạo bài viết mới | Body: `{ title, content, author, category, imageUrl }` |
| **Posts** | `PUT` | `/api/posts/:id` | Chỉnh sửa bài viết *(Bonus 1)* | Body: `{ title, content, author, category, imageUrl }` |
| **Posts** | `DELETE`| `/api/posts/:id` | Xóa bài viết | Xoá kèm comments |
| **Comments** | `GET` | `/api/posts/:id/comments` | Lấy bình luận của bài viết | Trả về mảng bình luận |
| **Comments** | `POST`| `/api/posts/:id/comments` | Gửi bình luận mới *(Bonus 4)* | Body: `{ author, content }` |
| **Comments** | `DELETE`| `/api/comments/:commentId` | Xoá bình luận theo ID | Trả về thông báo thành công |

---

## 💻 Hướng Dẫn Cài Đặt & Chạy Dưới Local (Local Development)

### 1. Yêu cầu tiên quyết
- Node.js version 18.x hoặc 20.x trở lên
- npm hoặc yarn/pnpm

### 2. Khởi chạy Backend
```bash
# 1. Di chuyển vào thư mục backend
cd backend

# 2. Cài đặt các thư viện
npm install

# 3. Tạo file .env từ mẫu
cp .env.example .env
# (Nội dung .env mặc định: PORT=5000, ALLOWED_ORIGINS=http://localhost:3000)

# 4. Chạy server ở chế độ dev
npm run dev
# hoặc: npm start
```
> Server backend sẽ chạy tại: `http://localhost:5000`

### 3. Khởi chạy Frontend
Mở một cửa sổ Terminal mới:
```bash
# 1. Di chuyển vào thư mục frontend
cd frontend

# 2. Cài đặt các thư viện
npm install

# 3. Tạo file .env.local
cp .env.example .env.local
# Đảm bảo cấu hình: NEXT_PUBLIC_API_URL=http://localhost:5000

# 4. Khởi chạy máy chủ phát triển Next.js
npm run dev
```
> Truy cập giao diện ứng dụng tại: `http://localhost:3000`
