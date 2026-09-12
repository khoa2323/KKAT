# TESTING.md

Đây là checklist QA thủ công cho repository `KKAT` — tập trung vào form được render động từ `window.APP_CONFIG`.

## Test Environment
- Mở repo: https://github.com/khoa2323/KKAT
- Chạy server tĩnh (ví dụ Python): `python3 -m http.server 8000`
- Mở: `http://localhost:8000/index.html`
- Sử dụng Chrome/Firefox và DevTools Console để kiểm tra payload/console.log

## Test Cases

### Test Case 01 — Render động
- Mục tiêu: Kiểm tra 3 input xuất hiện đầy đủ theo `window.APP_CONFIG`.
- Bước:
  1. Load trang index.html.
  2. Kiểm tra DOM để có các trường:
     - `nguoi_nhan` => `input[type="text"]`
     - `loi_chuc` => `textarea`
     - `anh_nen` => `input[type="url"]` hoặc `input[type="text"]` với placeholder tương ứng
- Kết quả mong đợi: Tất cả 3 trường tồn tại, label và placeholder đúng.

### Test Case 02 — Required Validation
- Mục tiêu: Các trường bắt buộc phải báo lỗi khi bỏ trống.
- Bước:
  1. Để trống các trường bắt buộc (ví dụ `nguoi_nhan`, `loi_chuc` nếu quy định là required).
  2. Click nút Submit.
- Kết quả mong đợi:
  - Các thông báo lỗi hiển thị dưới mỗi trường (thẻ `div.error` hoặc `small.help` có class `error`).
  - Con trỏ (focus) chuyển tới trường lỗi đầu tiên.

### Test Case 03 — MaxLength & Regex
- Mục tiêu: Ràng buộc độ dài và định dạng URL ảnh.
- Bước:
  1. Nhập `loi_chuc` > 500 ký tự.
  2. Nhập `anh_nen` là URL không có đuôi ảnh (ví dụ `https://example.com/image` hoặc `not-a-url`).
  3. Click Submit.
- Kết quả mong đợi:
  - Form chặn submit.
  - Hiển thị `div.error[role="alert"]` hoặc tương đương cho mỗi lỗi.
  - Thông báo rõ ràng (ví dụ: "Lời chúc phải nhỏ hơn 500 ký tự", "URL phải dẫn tới file ảnh (.jpg/.png/.gif)").

### Test Case 04 — Accessibility (a11y)
- Mục tiêu: Kiểm tra thuộc tính ARIA và ID tham chiếu.
- Bước:
  1. Khi có lỗi, kiểm tra thuộc tính `aria-describedby` của input/textarea trỏ tới ID của thẻ help/error.
  2. Kiểm tra `aria-invalid="true"` được đặt trên trường có lỗi.
- Kết quả mong đợi:
  - `aria-describedby` trỏ tới một element tồn tại.
  - Trường lỗi có `aria-invalid="true"`.

### Test Case 05 — Success Payload
- Mục tiêu: Khi nhập dữ liệu hợp lệ, form gửi payload chuẩn.
- Bước:
  1. Nhập hợp lệ mọi trường (ví dụ `nguoi_nhan: "Nguyen Van A"`, `loi_chuc` ngắn, `anh_nen: https://.../photo.jpg`).
  2. Click Submit.
- Kết quả mong đợi:
  - Browser gọi `alert()` (nếu implement) báo thành công.
  - DevTools Console log ra JSON payload chuẩn, ví dụ:

```json
{
  "nguoi_nhan": "Nguyen Van A",
  "loi_chuc": "Chúc mừng sinh nhật...",
  "anh_nen": "https://.../photo.jpg"
}
```

## Steps để lặp lại / Notes
- Nếu form được render bằng `window.APP_CONFIG`, thử sửa `config.js` (thêm/xóa field) và refresh để kiểm tra dynamic render.
- Kiểm tra sự nhất quán giữa `label`, `placeholder` và `name/key` của input.
- Nếu định dạng URL được yêu cầu, test thêm các biến thể: http/https, có query params, có fragment.

## Prompt sẵn để dán vào Copilot Sidebar (Option C)
Sao chép và dán nguyên block dưới đây vào Copilot Chat trong VS Code để Copilot xác nhận ingest context version 2 và kiểm tra hàm renderForm:

```
@workspace Đã hoàn tất Task 1 và push commit 39bff8c lên branch main (gồm index.html, app.js, styles.css và context.KKAT.json version 2). Vui lòng xác nhận ingest thành công context mới và kiểm tra tính hợp lệ của hàm renderForm trong app.js.
```

---

Nếu bạn muốn, tôi sẽ commit file này lên `main` ngay bây giờ (tôi đã sẵn sàng). Hoặc nếu bạn muốn cập nhật `config.js` trước (ví dụ đổi `anh_nen` sang `type: 'url'`), nói tôi biết để tôi cập nhật trước khi commit TESTING.md.
