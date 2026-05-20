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
| `DATABASE_URL` | Chuỗi kết nối Supabase (URI) |
| `SESSION_SECRET` | Secret cho express-session |
| `PORT` | Cổng server (mặc định 5555) |
| `NODE_ENV` | `development` hoặc `production` |

### Supabase

1. **Project Settings → Database → Connection string → URI**
2. Thay `[YOUR-PASSWORD]` bằng mật khẩu database (không có dấu `[]`)
3. Nếu mật khẩu có ký tự `@`, encode thành `%40` trong URI

Ví dụ:

```
postgresql://postgres:H13n815387%40@db.hzooluqlxxqtnzlkdwbi.supabase.co:5432/postgres
```

### Render

Trong **Environment** của Web Service, thêm:

- **Key:** `DATABASE_URL`
- **Value:** URI Supabase đã thay mật khẩu (giống `.env`)

Thêm `SESSION_SECRET` và `NODE_ENV=production` nếu deploy production.

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
