# Task 3: Nâng cấp Trang Chủ (HomePage) với Live Status Terminal & Tiện ích Hồ sơ tiêu biểu

## 1. Chỉ dẫn kỹ thuật & Đường dẫn file cần sửa
* **Đường dẫn tệp JS Trang chủ:** `MediaWiki/HomePage.js` (Địa chỉ thực thi: [HomePage.js](file:///g:/Wiki/MediaWiki/HomePage.js))
* **Đường dẫn tệp CSS Trang chủ:** `MediaWiki/HomePage.css` (Địa chỉ thực thi: [HomePage.css](file:///g:/Wiki/MediaWiki/HomePage.css))
* **Dữ liệu bài viết/tin tức mẫu:** `MediaWiki:WhatsNews-data.json` hoặc gọi trực tiếp API của MediaWiki để lấy danh sách bài viết mới.

---

## 2. Phạm vi Logic & Các bước thực hiện

### Bước 1: Thiết kế hộp cảnh báo và thông số thiết bị giả lập (System Diagnostics Console)
* **Tệp cần sửa:** `MediaWiki/HomePage.js`
* **Mục tiêu:** Bổ sung một widget ở phần đầu hoặc bên hông Trang chủ hiển thị:
  * Trạng thái CPU/RAM/Băng thông tải giả lập của hệ thống dữ liệu M.A.P.L.E (nhấp nháy ngẫu nhiên nhẹ tạo cảm giác realtime).
  * Mức độ cảnh báo an ninh toàn khu vực Maze (Ví dụ: `THREAT LEVEL: CRITICAL` - Dữ liệu cập nhật theo múi giờ thực tế hoặc ngẫu nhiên).
* **Phạm vi tác động:** Hàm khởi tạo layout trang chủ `init()`.

### Bước 2: Bổ sung khung tìm kiếm nhanh và bài viết tiêu biểu (Featured Dossier Widget)
* **Tệp cần sửa:** `MediaWiki/HomePage.js`
* **Mục tiêu:** 
  * Tự động quét các bài viết mới từ API MediaWiki (dùng `action: 'query', list: 'recentchanges'`).
  * Chọn ngẫu nhiên một hồ sơ (Dossier) và hiển thị thẻ "Hồ Sơ Nổi Bật Trong Ngày" dạng khối thông tin bảo mật, hiển thị tiêu đề, tóm tắt và Clearance Level yêu cầu.
* **Phạm vi tác động:** Tạo hàm phụ `renderFeaturedDossier(data)`.

### Bước 3: Tạo giao diện hộp lệnh mini (Interactive Mini-CLI Console)
* **Tệp cần sửa:** `MediaWiki/HomePage.js`
* **Mục tiêu:** Thêm một ô nhập lệnh mô phỏng dòng lệnh DOS/Unix cổ ở dưới chân Trang chủ:
  * Người dùng có thể gõ các lệnh đơn giản như `help` (liệt kê danh sách lệnh), `diagnose` (quét lỗi giả lập), `clearance` (hiển thị thông tin đặc vụ đăng nhập).
  * Hiển thị phản hồi tức thì kiểu văn bản xanh lá/đỏ chạy dọc cổ điển.
* **Phạm vi tác động:** Thêm hàm `initMiniConsole()`.

### Bước 4: Viết CSS tạo hiệu ứng CRT / Scanline cho CLI Console
* **Tệp cần sửa:** `MediaWiki/HomePage.css`
* **Mục tiêu:** Thiết kế giao diện cho hộp lệnh CLI và khung Diagnostics: nền đen, chữ xanh lục neon, font chữ monospace (JetBrains Mono/Courier New), hiệu ứng con trỏ nhấp nháy liên tục (`blink`), và hiệu ứng màn hình CRT quét dòng nhẹ (`scanline`).

---

## 3. Lệnh Test thu hẹp cục bộ
* Chạy kiểm thử cú pháp Javascript của Trang chủ:
  ```bash
  node -c g:\Wiki\MediaWiki\HomePage.js
  ```

---
*Khi hoàn thành mỗi bước nhỏ ở trên, hãy cập nhật dấu `[x]` vào tệp tương ứng `todo_3.md`.*
