# HiPV_53cUr1tY

Demo website bảo vệ — Express + Handlebars + Sequelize + PostgreSQL (Supabase), tích hợp **NGFW Test Suite** (31 test case Suricata).

---

## Cài đặt nhanh

```bash
npm install
cp .env.example .env
# Sửa DB_* hoặc DATABASE_URL trong .env
npm start
```

| URL | Mô tả |
|-----|--------|
| `http://localhost:5555/` | Website chính |
| `http://localhost:5555/ngfw-test/` | NGFW Test UI (31 test cases) |

---

## Biến môi trường

| Biến | Mô tả |
|------|--------|
| `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD` | Kết nối Supabase (khuyến nghị) |
| `DATABASE_URL` | (tuỳ chọn) URI — encode `.` trong user thành `%2E` |
| `SESSION_SECRET` | Secret cho express-session |
| `PORT` | Cổng app chính (mặc định `5555`) |
| `NGFW_HTTP_PORT` | (tuỳ chọn) Cổng HTTP plaintext cho Suricata, ví dụ `80` |
| `NODE_ENV` | `development` hoặc `production` |

### Supabase

User dạng `postgres.<project-ref>` có dấu chấm — nếu dùng `DATABASE_URL` phải encode: `postgres%2E<ref>`.

Mật khẩu có `@` → encode `%40`.

### Render

Thêm `DB_*` (hoặc `DATABASE_URL` đã encode), `SESSION_SECRET`, `NODE_ENV=production`.

---

## Scripts

| Lệnh | Mô tả |
|------|--------|
| `npm start` | Chạy server (port `PORT`, mặc định 5555) |
| `npm run dev` | Chạy với `--watch` |
| `npm run db:sync` | Đồng bộ schema Sequelize |
| `sudo npm run ngfw:http` | App + HTTP port 80 cho Suricata |

---

## NGFW Test Suite

31 test case dựa trên rules thật từ:
- `et-virus_protection.rules`
- `et-malware_protection.rules.txt`

Giao diện: **`/ngfw-test/`** — mỗi card hiển thị SID, loại, URL trigger.

> Project `ngfw-http-test` đã được gộp vào repo này. Không cần chạy folder cũ.

---

## Chuẩn bị test với OPNsense / Suricata

### 1. Chạy HTTP plaintext (bắt buộc cho hầu hết rule HTTP)

Suricata cần đọc HTTP **không mã hoá**. HTTPS (Render) chỉ hoạt động nếu NGFW bật **SSL Inspection**.

```bash
# Port 80 thường cần sudo trên macOS/Linux
sudo NGFW_HTTP_PORT=80 npm start
```

### 2. Expose ra ngoài qua tunnel (pinggy / ngrok)

```bash
# Pinggy — forward cổng 80
ssh -p 443 -R0:localhost:80 a.pinggy.io

# Giữ tunnel sống (loop)
while true; do
  ssh -p 443 -R0:localhost:80 -o StrictHostKeyChecking=no -o ServerAliveInterval=30 a.pinggy.io
  sleep 10
done
```

Ghi lại URL tunnel, ví dụ: `http://abc123.a.pinggy.io`

### 3. OPNsense checklist

1. **Services → Intrusion Detection → Administration** — bật IDS/IPS, chọn đúng interface (WAN/LAN).
2. **Download** — bật ET Open / rules có `et-virus` và `et-malware`, **Apply**.
3. Rule SQLi (`6400026–6400028`) dùng `$HTTP_SERVERS` — đích phải nằm trong home net / server net của bạn.
4. Xem alert: **Services → Intrusion Detection → Alerts**, filter theo SID.

---

## Hướng dẫn test quan trọng

Thay `<base-url>` bằng một trong:
- Local HTTP: `http://localhost:80`
- Pinggy tunnel: `http://<subdomain>.a.pinggy.io`
- App chính (không Suricata-friendly): `http://localhost:5555`

Prefix API luôn là: **`/ngfw-test`**

---

### A. Test thông thường — GET download (đa số case #1–#25, #29–#30)

Mỗi endpoint trả payload khớp rule trong response body hoặc file download.

```bash
# EICAR (SID 5900006)
curl -v "<base-url>/ngfw-test/test/5900006" -o eicar.com

# PE Infector (SID 6400009)
curl -v "<base-url>/ngfw-test/test/6400009" -o infected.exe

# Liệt kê tất cả test case (JSON)
curl "<base-url>/ngfw-test/api/test-cases"
```

Trên UI: mở `http://<base-url>/ngfw-test/` → bấm **Test** hoặc **Run All 31 Tests**.

---

### B. SQL Injection — SID 6400026, 6400027, 6400028

**Quan trọng:** Rule Suricata match **`http.uri` trên REQUEST**, không phải response body.

URI phải chứa (theo thứ tự): `/view_recent.asp?` + `currentpage=` + từ khoá SQL.

```bash
# SID 6400027 — UNION SELECT
curl -v "<base-url>/ngfw-test/view_recent.asp?currentpage=1%20UNION%20SELECT%20*%20FROM%20admin%20WHERE%201%3D1"

# SID 6400026 — SELECT ... FROM
curl -v "<base-url>/ngfw-test/view_recent.asp?currentpage=1%20UNION%20SELECT%20username,password%20FROM%20users"

# SID 6400028 — INSERT INTO
curl -v "<base-url>/ngfw-test/view_recent.asp?currentpage=1%3B%20INSERT%20INTO%20users%20VALUES%20(999,%22hacker%22,%22owned%22)"
```

Hoặc qua redirect helper:

```bash
curl -v -L "<base-url>/ngfw-test/test/6400027"
```

**Không alert?** Kiểm tra `$HTTP_SERVERS`, traffic đi qua interface Suricata, và dùng HTTP (không HTTPS).

---

### C. NetSupport RAT — SID 5915100

Rule **5915100** match **POST CnC** từ client → server, không match file download.

| Cách test | Mục đích |
|-----------|----------|
| **GET** `/test/5915100` | Tải sample PS1 thật (~10MB) — AV / file inspection |
| **POST** (curl bên dưới) | Kích hoạt đúng Suricata SID 5915100 |

**Kích hoạt rule Suricata (POST CnC):**

```bash
curl -X POST "<base-url>/ngfw-test/test/5915100" \
  -H "User-Agent: NetSupport Manager/1.3" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "CMD=INFO&CLIENT_ADDR=192.168.1.10&PORT=8080&MACADDRESS=00:11:22:33:44:55"
```

**Tải file PS1 dropper (GET):**

```bash
curl -v "<base-url>/ngfw-test/test/5915100" -o netsupport.ps1
```

Sample nằm tại: `securityPuplic/ngfw-test/samples/netsupport.ps1`

---

### D. Render (HTTPS) — khi không dùng tunnel

```
https://your-app.onrender.com/ngfw-test/
```

Chỉ trigger rule HTTP body/uri nếu NGFW có **SSL Inspection** (decrypt HTTPS). Không có SSL inspection → dùng `NGFW_HTTP_PORT=80` + pinggy như mục 2.

---

## Danh sách SID (31 test cases)

| # | SID | Loại | Mô tả |
|---|-----|------|-------|
| 1 | 5900006 | MALWARE | EICAR Test File |
| 2 | 5900012 | MALWARE | Suspicious EXE Download |
| 3 | 5900014 | MALWARE | Macro-Enabled Document |
| 4 | 5900015 | MALWARE | Windows Script File |
| 5 | 5900016 | MALWARE | PE Executable |
| 6 | 5900029 | MALWARE | Coinhive Cryptominer |
| 7 | 5900032 | MALWARE | CryptoLoot Miner |
| 8 | 5900035 | MALWARE | JSECoin Miner |
| 9 | 5900044 | EXPLOIT-KIT | RIG Exploit Kit |
| 10 | 5900045 | EXPLOIT-KIT | Fallout Exploit Kit |
| 11 | 5900048 | MALWARE | ZIP with EXE |
| 12 | 5900049 | MALWARE | HTML Smuggling Base64 |
| 13 | 5900063 | ANTI-SANDBOX | VirtualBox Detection |
| 14 | 5900064 | ANTI-SANDBOX | VMware Detection |
| 15 | 5900070 | MALWARE | EICAR Attachment Header |
| 16 | 6400000 | VIRUS | PE with Auto-Run |
| 17 | 6400001 | VIRUS | Office Macro Shell Execute |
| 18 | 6400002 | VIRUS | Word Macro AutoOpen |
| 19 | 6400003 | VIRUS | Excel Macro Auto_Open |
| 20 | 6400007 | VIRUS | Macro CreateObject |
| 21 | 6400011 | VIRUS | VBScript Self-Replication |
| 22 | 6400012 | VIRUS | JavaScript FileSystem |
| 23 | 6400013 | VIRUS | Batch Replication |
| 24 | 6400020 | VIRUS | Java Malicious Class |
| 25 | 6400021 | VIRUS | PDF JavaScript |
| 26 | 6400026 | WEB-ATTACK | SQLi SELECT (http.uri) |
| 27 | 6400027 | WEB-ATTACK | SQLi UNION SELECT (http.uri) |
| 28 | 6400028 | WEB-ATTACK | SQLi INSERT (http.uri) |
| 29 | 6400032 | EXPLOIT-KIT | Cool Java Exploit Kit |
| 30 | 6400009 | VIRUS | PE File Infector (MZ + E9) |
| 31 | 5915100 | MALWARE | NetSupport RAT — PS1 + CnC POST |

---

## Database

Lần đầu hoặc sau khi đổi DB:

```bash
npm run db:sync
```

Hoặc mở: `http://localhost:5555/createUser`

---

## Troubleshooting

| Triệu chứng | Nguyên nhân thường gặp |
|-------------|------------------------|
| Không có alert SQLi | URI sai (test qua body), thiếu `/view_recent.asp?`, hoặc `$HTTP_SERVERS` không khớp |
| Không có alert NetSupport 5915100 | Dùng GET thay vì POST, thiếu User-Agent `NetSupport Manager/1.3` |
| Không có alert nào | Traffic HTTPS không decrypt, Suricata sai interface, ruleset chưa bật |
| Test qua Render không hoạt động | Cần SSL Inspection hoặc chuyển sang HTTP port 80 + tunnel |
| Port 80 permission denied | Chạy `sudo NGFW_HTTP_PORT=80 npm start` |

---

## Cấu trúc NGFW liên quan

```
HiPV_53cUr1tY/
├── index.js                          # Mount /ngfw-test, optional NGFW_HTTP_PORT
├── routes/ngfwTestRouter.js          # 31 endpoints + API
├── securityPuplic/ngfw-test/
│   ├── index.html                    # Test UI
│   └── samples/netsupport.ps1        # Sample NetSupport (~10MB)
```
