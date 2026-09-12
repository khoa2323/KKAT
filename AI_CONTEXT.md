# AI_CONTEXT

Quy tắc phát triển và lưu trữ ngữ cảnh (AI Context) cho dự án KKAT

1) Single Source of Truth
- `config.js` là nguồn dữ liệu chuẩn (Single Source of Truth) cho cấu hình form, template và metadata. Mọi thay đổi liên quan đến fields, validation, hoặc template phải được cập nhật trong `config.js` trước khi chỉnh sửa `index.html`, `app.js`, `template.html`, hoặc `style.css`.

2) Cấu trúc hệ thống
- Các file cốt lõi:
  - `config.js` (SSOT)
  - `index.html` (entry)
  - `app.js` (logic & rendering)
  - `template.html` (HTML template / preview)
  - `style.css` (giao diện)

3) Quy trình phát triển
- Bước 1: Thêm/Chỉnh sửa field hoặc template trong `config.js`.
- Bước 2: Chạy local để kiểm tra (ví dụ `python3 -m http.server 8000`).
- Bước 3: Kiểm tra QA theo `TESTING.md`.
- Bước 4: Commit thay đổi `config.js` trước, sau đó commit các file khác (app.js/index.html/template.html/style.css).

4) Truyền dữ liệu qua URL
- Khi truyền payload qua URL (ví dụ để preview hoặc share), payload phải được nén/encode bằng Base64 và gắn dưới tên tham số `payload`.
  - Ví dụ: `https://your-site/?payload=eyJ...`  (payload là Base64 của JSON)
  - Khi giải mã, app phải validate schema dựa trên `config.js` trước khi render bất kỳ nội dung nào.

5) Tiêu chuẩn cho AI / Copilot ingestion
- Khi Copilot hoặc bất kỳ AI internal tool nào ingest ngữ cảnh, hãy chỉ ingest `config.js` và `AI_CONTEXT.md` cho logic liên quan đến cấu hình.
- Versioning: Thêm `context_version` vào `config.js` khi thay đổi lớn (breaking change) để AI agents có thể detect và re-ingest.

6) Định nghĩa templates
- Các template định nghĩa layout/field set — chi tiết cấu trúc được lưu trong `config.js` (biến `window.APP_TEMPLATES`).

---

File này do team/agent quản lý; chỉnh sửa phải kèm commit message rõ ràng (ví dụ: `docs(ai): update AI_CONTEXT rules`) và được review trước khi merge.
