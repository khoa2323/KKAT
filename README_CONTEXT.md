# README_CONTEXT — KKAT

Project: KKAT  
Repo: khoa2323/KKAT  
Language: JavaScript  
Commit anchor: 5b82698be503a13c86282f6b3b58af0a8cfa8f5f  
Updated: 2026-09-12

## TL;DR
Dự án web JS "KKAT". Mục tiêu hiện tại: hoàn thiện UI form cấu hình (config.js) và chuẩn hóa context package để chuyển ngữ cảnh giữa các AI (ChatGPT, Gemini, Copilot).

## Current Goals
- Review và cải thiện `config.js` (labels, placeholders, accessibility).
- Thêm file README_CONTEXT.md và/hoặc context.KKAT.json để Copilot có thể đọc.
- Thiết lập quy trình ingest thủ công (copy-paste) giữa các AI.

## Tasks (short)
1. Review config.js fields — in-progress  
2. Create README_CONTEXT.md (this file) — done/noted  
3. Provide ingest package & ACK pattern — done

## Important file (snippet)
Path: config.js

```js
window.APP_CONFIG = [
  { key: 'nguoi_nhan', label: 'Tên người nhận', type: 'text', placeholder: 'Nhập tên người nhận...' },
  { key: 'loi_chuc', label: 'Lời chúc sinh nhật', type: 'textarea', placeholder: 'Nhập lời chúc...' },
  { key: 'anh_nen', label: 'Link ảnh kỷ niệm', type: 'text', placeholder: 'Dán link ảnh tại đây...' }
];
```

## Ingest pattern
Start a message with:
INGEST-CONTEXT v1:
<full JSON package or TL;DR + tasks + 1–2 snippets>

Require: ACK JSON before other outputs.

---

## Bookmarklet (quick helper)
You can save the following JavaScript as a browser bookmark (name: "Wrap INGEST") to prepend the required header to whatever JSON/Markdown you have in the clipboard. Click the bookmark after copying your package to automatically add the "INGEST-CONTEXT v1:" prefix.

```javascript
javascript:(async()=>{try{const t=await navigator.clipboard.readText();if(!t.startsWith("INGEST-CONTEXT v1:")){await navigator.clipboard.writeText("INGEST-CONTEXT v1:\n"+t);alert("Đã thêm header INGEST-CONTEXT v1 vào Clipboard!")}}catch(e){alert("Lỗi truy cập Clipboard: "+e)}})();
```

(Alternatively, you can keep the bookmarklet locally in your browser bookmarks and use it when preparing context packages.)
