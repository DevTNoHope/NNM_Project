# 🚀 HopeFund - Deployment Guide

## Architecture Overview

```
[Vercel - Frontend]  →  [Render - Backend]  →  [Aiven - MySQL]
   (React/Vite)          (Node.js/Docker)        (Free Tier)
```

---

## Step 1: Setup Database — Aiven (Free)

1. Truy cập https://aiven.io → Đăng ký bằng GitHub
2. Tạo **MySQL** service → chọn plan **Free**
3. Chờ tạo xong → vào **Overview** tab → copy thông tin kết nối:
   - `Host`
   - `Port`
   - `User`
   - `Password`
   - `Available databases` (tên database)
4. Mở **MySQL Workbench** → tạo kết nối mới với thông tin trên
5. Chạy file `database/schema.sql` để tạo bảng
6. Chạy file `database/seed.sql` để thêm dữ liệu mẫu (nếu cần)

---

## Step 2: Setup Backend — Render (Free)

1. Truy cập https://render.com → Đăng ký bằng GitHub
2. **New** → **Web Service** → Kết nối repo GitHub
3. Cấu hình:
   - **Name**: `hopefund-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Instance Type**: `Free`
4. Thêm **Environment Variables** (lấy giá trị từ `.env` local, đổi DB sang Aiven):

   | Variable | Value |
   |---|---|
   | `PORT` | `5000` |
   | `DB_HOST` | Host từ Aiven |
   | `DB_PORT` | Port từ Aiven |
   | `DB_USER` | User từ Aiven |
   | `DB_PASSWORD` | Password từ Aiven |
   | `DB_NAME` | Database name từ Aiven |
   | `JWT_ACCESS_SECRET` | Giữ nguyên từ `.env` |
   | `JWT_REFRESH_SECRET` | Giữ nguyên từ `.env` |
   | `JWT_ACCESS_EXPIRES_IN` | `1h` |
   | `JWT_REFRESH_EXPIRES_IN` | `7d` |
   | `CLIENT_URL` | *(Để trống, cập nhật sau Bước 3)* |
   | `GOOGLE_CLIENT_ID` | Giữ nguyên từ `.env` |
   | `MAIL_HOST` | `smtp.gmail.com` |
   | `MAIL_PORT` | `587` |
   | `MAIL_USER` | Giữ nguyên từ `.env` |
   | `MAIL_PASS` | Giữ nguyên từ `.env` |
   | `MAIL_FROM` | Giữ nguyên từ `.env` |
   | `ADMIN_PRIVATE_KEY` | Giữ nguyên từ `.env` |
   | `RPC_URL` | Giữ nguyên từ `.env` |
   | `DONATION_TOKEN_ADDRESS` | Giữ nguyên từ `.env` |
   | `FACTORY_ADDRESS` | Giữ nguyên từ `.env` |
   | `EXCHANGE_RATE_API` | `https://open.er-api.com/v6/latest/USD` |
   | `VNPAY_TMN_CODE` | Giữ nguyên từ `.env` |
   | `VNPAY_HASH_SECRET` | Giữ nguyên từ `.env` |
   | `VNPAY_URL` | Giữ nguyên từ `.env` |
   | `VNPAY_RETURN_URL` | `https://<tên-backend>.onrender.com/api/donations/vnpay-return` |
   | `CLOUDINARY_CLOUD_NAME` | Giữ nguyên từ `.env` |
   | `CLOUDINARY_API_KEY` | Giữ nguyên từ `.env` |
   | `CLOUDINARY_API_SECRET` | Giữ nguyên từ `.env` |
   | `PINATA_JWT` | Giữ nguyên từ `.env` |
   | `PINATA_GATEWAY` | Giữ nguyên từ `.env` |

5. Bấm **Deploy** → chờ build Docker image + deploy
6. Khi xong, copy URL backend (vd: `https://hopefund-backend.onrender.com`)
7. Test: truy cập `https://hopefund-backend.onrender.com/api/health` → phải trả về `{"ok": true}`

---

## Step 3: Setup Frontend — Vercel (Free)

1. Truy cập https://vercel.com → Đăng ký bằng GitHub
2. **Add New** → **Project** → Chọn repo GitHub
3. Cấu hình:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
4. Thêm **Environment Variables**:

   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | `https://<tên-backend>.onrender.com/api` |
   | `VITE_GOOGLE_CLIENT_ID` | Google Client ID |

5. Bấm **Deploy** → chờ build
6. Khi xong, copy URL frontend (vd: `https://hopefund.vercel.app`)

---

## Step 4: Cập nhật CLIENT_URL trên Render

1. Quay lại **Render** → vào service backend
2. **Environment** → sửa biến `CLIENT_URL` = URL frontend từ Bước 3
3. Render sẽ tự động redeploy

---

## Step 5: Setup CI/CD — GitHub Actions (Tùy chọn)

> Chỉ cần làm khi muốn tự động deploy mỗi lần push code vào `main`

### 5.1 Lấy Render Deploy Hook
- Render → Service → **Settings** → **Deploy Hook** → Copy URL

### 5.2 Lấy Vercel Token
- Vào https://vercel.com/account/tokens → **Create Token** → Copy

### 5.3 Lấy Vercel Project Info
```bash
npm i -g vercel
cd frontend
vercel login
vercel link
```
Sau khi link, mở file `.vercel/project.json` → copy `orgId` và `projectId`

### 5.4 Thêm GitHub Secrets
Vào repo GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret Name | Value |
|---|---|
| `RENDER_DEPLOY_HOOK_URL` | Deploy Hook URL từ Render |
| `VERCEL_TOKEN` | Token từ Vercel |
| `VERCEL_ORG_ID` | `orgId` từ `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `projectId` từ `.vercel/project.json` |

### 5.5 Thêm GitHub Variables
Vào **Variables** tab (cùng trang):

| Variable Name | Value |
|---|---|
| `VITE_API_URL` | URL backend + `/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google Client ID |

---

## Tóm tắt luồng

```
1. Aiven  (DB)       → Tạo MySQL, import schema + seed
2. Render (Backend)   → Deploy Docker, thêm env vars
3. Vercel (Frontend)  → Deploy Vite, thêm env vars
4. Cập nhật           → CLIENT_URL trên Render = URL Vercel
5. CI/CD  (Optional)  → GitHub Secrets cho auto-deploy
```

## Lưu ý quan trọng

- **Render Free Tier**: Server sẽ tắt sau 15 phút không có request. Lần truy cập đầu tiên sẽ mất ~30s để khởi động lại (cold start).
- **Aiven Free Tier**: Giới hạn 1 database, đủ dùng cho project.
- **KHÔNG commit file `.env`** lên Git — chỉ commit `.env.example`.
- Nếu VNPay sandbox không hoạt động với domain Render, bạn có thể test CRYPTO donation thay thế.
