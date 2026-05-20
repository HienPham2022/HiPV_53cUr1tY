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
