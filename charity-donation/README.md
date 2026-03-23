🎗 Charity Donation Platform

Nền tảng quyên góp thiện nguyện sử dụng:

Backend: Node.js + Express (MVC)

Frontend: React.js + Vite

Database: MySQL

Auth: Google Login (OAuth2)

📁 Cấu trúc thư mục dự án
charity-donation/
│
├── backend/ # Server API (Express + MySQL)
├── frontend/ # Client (React + Vite)
├── database/ # File schema SQL
├── docs/ # Tài liệu, sơ đồ, API spec
└── README.md
🖥 Backend Structure (Node.js + Express - MVC)
backend/
src/
config/ # Cấu hình hệ thống (DB, env)
controllers/ # Xử lý request → gọi service → trả response
middleware/ # Middleware (auth, error handler...)
models/ # Làm việc trực tiếp với MySQL (query)
routes/ # Định nghĩa API endpoint
services/ # Business logic
utils/ # Hàm hỗ trợ chung
validators/ # Validate request data
database/ # (optional) seed/migration
app.js # Khởi tạo express app
server.js # Entry point
.env
package.json
📌 Ý nghĩa từng tầng (MVC chuẩn)
1️⃣ Routes

Chỉ định URL và chuyển request vào controller.

Ví dụ:

GET /api/projects
POST /api/projects
2️⃣ Controller

Nhận request

Gọi service

Trả response

Không viết logic phức tạp ở đây

3️⃣ Service

Xử lý logic nghiệp vụ

Tính toán

Gọi model

4️⃣ Model

Viết query MySQL

Chỉ làm việc với DB

5️⃣ Middleware

Xác thực JWT

Phân quyền role

Xử lý lỗi chung

🌐 Frontend Structure (React + Vite)
frontend/
src/
api/ # Axios config + gọi API
components/ # Component tái sử dụng
layouts/ # Layout chung (Navbar, Footer)
pages/ # Mỗi trang 1 folder
routes/ # Cấu hình React Router
utils/ # Helper functions
App.jsx
main.jsx
📌 Nguyên tắc tổ chức FE

pages/ = mỗi trang 1 thư mục

components/ = dùng lại nhiều nơi

api/ = không gọi axios trực tiếp trong component

Không viết logic API trong UI component

🗄 Database

File schema nằm tại:

database/schema.sql

Chạy lệnh sau trong MySQL:

CREATE DATABASE charity_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

Sau đó import file schema.

⚙ Hướng dẫn cài đặt dự án
1️⃣ Clone project
git clone <repo-url>
cd charity-donation
2️⃣ Cài đặt Backend
cd backend
npm install

Tạo file .env:

PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=charity_db

Chạy server:

npm run dev

Backend sẽ chạy tại:

http://localhost:5000
3️⃣ Cài đặt Frontend
cd frontend
npm install
npm run dev

Frontend sẽ chạy tại:

http://localhost:5173
🧑‍💻 Quy tắc làm việc nhóm
🌿 Git Flow

Branch chính:

main # production
dev # branch phát triển chung
feature/\* # branch tính năng

Ví dụ:

feature/auth
feature/projects
feature/donations
📝 Quy ước đặt tên
📌 Backend file naming
projects.routes.js
projects.controller.js
projects.service.js
projects.model.js
📌 API endpoint naming
Method Endpoint
GET /api/projects
GET /api/projects/:id
POST /api/projects
POST /api/projects/:id/donate
📌 Database naming

Table: snake_case

Column: snake_case

FK: user_id, project_id

Timestamp: created_at, updated_at

📌 Biến trong JS

camelCase cho biến và function

PascalCase cho Component React

🔐 Quy tắc viết code Backend

✔ Controller không viết query
✔ Model không xử lý business logic
✔ Service không trả response trực tiếp
✔ Middleware không viết logic nghiệp vụ

🎨 Quy tắc viết code Frontend

✔ Không gọi axios trực tiếp trong component
✔ Tách component lớn thành component nhỏ
✔ Có loading state
✔ Có error handling

📦 Package sử dụng
Backend

express

mysql2

dotenv

cors

(dev)

nodemon

Frontend

react-router-dom

axios

🚀 Quy trình phát triển tính năng

Ví dụ thêm feature “Donations”:

Tạo file:

donations.routes.js

donations.controller.js

donations.service.js

donations.model.js

Tạo API

Test bằng Postman

Tạo page hoặc component FE

Kết nối API

Tạo Pull Request

🧪 Kiểm tra trước khi push

Không console.log thừa

Không commit file .env

Code format sạch

Test endpoint bằng Postman

📌 Mục tiêu kiến trúc

Đơn giản

Dễ mở rộng

Theo chuẩn MVC

Không phức tạp hóa

Dễ bảo trì

📞 Tài khoản demo (sẽ cập nhật sau)

Admin:

Founder:

User:

-- 11/3 (Hari)
Chỉnh db
USE charity_db;
ALTER TABLE users
MODIFY google_sub VARCHAR(255) NULL;

USE charity_db;
ALTER TABLE users
MODIFY email VARCHAR(255) NULL;

-- 12/3(Hai)
USE charity_db;
ALTER TABLE users
ADD COLUMN is_verified TINYINT(1) DEFAULT 0;

ALTER TABLE users
ADD CONSTRAINT unique_wallet UNIQUE (linked_wallet);

--22/3
use charity_db;

-- 1. Cập nhật ENUM cho status để bao gồm PENDING_EMAIL và đặt làm mặc địn
ALTER TABLE withdraw_requests 
MODIFY COLUMN status ENUM('PENDING_EMAIL', 'PENDING', 'APPROVED', 'REJECTED', 'CLAIMED') 
DEFAULT 'PENDING_EMAIL';
-- 2. Thêm cột phân loại rút tiền (Crypto/Banking)
ALTER TABLE withdraw_requests 
ADD COLUMN type ENUM('CRYPTO', 'BANKING') NOT NULL DEFAULT 'CRYPTO';
-- 3. Thêm các cột thông tin ngân hàng
ALTER TABLE withdraw_requests 
ADD COLUMN bank_name VARCHAR(255) NULL,
ADD COLUMN account_number VARCHAR(100) NULL,
ADD COLUMN account_name VARCHAR(255) NULL;
-- 4. Thêm cột token xác thực email
ALTER TABLE withdraw_requests 
ADD COLUMN verification_token VARCHAR(255) NULL;

ALTER TABLE withdraw_approvals ADD COLUMN deadline BIGINT AFTER nonce;

-- 22/3 (Phase 3: IPFS + Vault)
ALTER TABLE projects ADD COLUMN ipfs_cid VARCHAR(255) NULL;
ALTER TABLE projects ADD COLUMN meta_hash VARCHAR(255) NULL;
