# HiPV_53cUr1tY

Demo website bảo vệ — Express + Handlebars + Sequelize + PostgreSQL (Supabase).

## Cài đặt

```bash
npm install
cp .env.example .env
# Sửa DATABASE_URL trong .env bằng URI Supabase của bạn
npm start
```

## Biến môi trường

| Biến | Mô tả |
|------|--------|
| `DB_HOST` | Host pooler Supabase |
| `DB_PORT` | Cổng (5432) |
| `DB_DATABASE` | Tên database (`postgres`) |
| `DB_USER` | User (`postgres.<project-ref>`) |
| `DB_PASSWORD` | Mật khẩu database |
| `DATABASE_URL` | (tuỳ chọn) URI — phải encode `.` trong user thành `%2E` |
| `SESSION_SECRET` | Secret cho express-session |
| `PORT` | Cổng server (mặc định 5555) |
| `NODE_ENV` | `development` hoặc `production` |

### Supabase

1. **Project Settings → Database → Connection string → URI**
2. Thay `[YOUR-PASSWORD]` bằng mật khẩu database (không có dấu `[]`)
3. Nếu mật khẩu có ký tự `@`, encode thành `%40` trong URI

**Lưu ý:** User Supabase dạng `postgres.xxx` có dấu chấm — nếu chỉ dùng `DATABASE_URL` không encode, Sequelize sẽ đọc nhầm user thành `postgres` và báo lỗi authentication.

**Cách 1 (khuyến nghị)** — thêm từng biến trên Render:

```
DB_HOST=aws-1-ap-northeast-2.pooler.supabase.com
DB_PORT=5432
DB_DATABASE=postgres
DB_USER=postgres.hzooluqlxxqtnzlkdwbi
DB_PASSWORD=<mật-khẩu-của-bạn>
```

**Cách 2** — chỉ dùng `DATABASE_URL` (encode dấu chấm + `@` trong mật khẩu):

```
postgresql://postgres%2Ehzooluqlxxqtnzlkdwbi:H13n815387%40@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

### Render

Thêm các biến `DB_*` (hoặc `DATABASE_URL` đã encode đúng), cùng `SESSION_SECRET` và `NODE_ENV=production`.

## Đồng bộ bảng database

Lần đầu hoặc sau khi đổi DB:

```bash
# Chạy server rồi mở trình duyệt:
http://localhost:5555/createUser
```

Hoặc:

```bash
npm run db:sync
```

## Scripts

- `npm start` — chạy server
- `npm run dev` — chạy với `--watch`
- `npm run db:sync` — đồng bộ schema Sequelize

## NGFW Test Suite

Test tính năng phát hiện malware của Next Generation Firewall với **30 test cases** từ các file Suricata rules thực tế:
- `et-virus_protection.rules`
- `et-malware_protection.rules.txt`

### Truy cập

**Local:**
```
http://localhost:5555/ngfw-test/
```

**Render (HTTPS):**
```
https://your-app-name.onrender.com/ngfw-test/
```

### Danh sách SID

| # | SID | Loại | Mô tả |
|---|-----|------|-------|
| 1-15 | 5900006-5900070 | MALWARE | EICAR, EXE, Macro, Cryptominer, Exploit Kit |
| 16-25 | 6400000-6400021 | VIRUS | Office Macro, VBScript, JavaScript, Java, PDF |
| 26-28 | 6400026-6400028 | WEB-ATTACK | SQL Injection |
| 29-30 | 6400032-6400033 | EXPLOIT-KIT | Java Exploit, EXE from file share |

### Cách test

1. Cấu hình NGFW để inspect traffic HTTPS từ client đến web server
2. Mở trang `/ngfw-test/` trên trình duyệt
3. Click "Test" trên từng test case hoặc "Run All 30 Tests"
4. Kiểm tra NGFW Dashboard/Logs với SID tương ứng

**Lưu ý:** NGFW cần cấu hình SSL Inspection để giải mã HTTPS traffic.
