# Task 4: Nâng cấp Trang và Trình hướng dẫn Welcome theo phong cách M.A.P.L.E trực quan

## 1. Chỉ dẫn kỹ thuật & Đường dẫn file cần sửa
* **Đường dẫn tệp JS Welcome chính:** `MediaWiki/Welcome.js` (Địa chỉ thực thi: [Welcome.js](file:///g:/Wiki/MediaWiki/Welcome.js))
* **Đường dẫn tệp JS Popup chào mừng:** `MediaWiki/Welcome-Popup.js` (Địa chỉ thực thi: [Welcome-Popup.js](file:///g:/Wiki/MediaWiki/Welcome-Popup.js))
* **Đường dẫn tệp JS các Tour hướng dẫn cụ thể:** `MediaWiki/Welcome-Tours.js` (Địa chỉ thực thi: [Welcome-Tours.js](file:///g:/Wiki/MediaWiki/Welcome-Tours.js))
* **Đường dẫn tệp CSS Welcome:** `MediaWiki/Welcome.css` (Địa chỉ thực thi: [Welcome.css](file:///g:/Wiki/MediaWiki/Welcome.css))

---

## 2. Phạm vi Logic & Các bước thực hiện

### Bước 1: Thiết kế giao diện Popup chào mừng trực quan với Logo & Dẫn hướng
* **Tệp cần sửa:** `MediaWiki/Welcome-Popup.js`
* **Mục tiêu:** Định hình lại Popup để hiển thị:
  * **Logo M.A.P.L.E:** Nhúng SVG logo đỏ rực rỡ đặc trưng của Tổ chức ở vị trí trung tâm phía trên.
  * **Tiêu đề chào mừng:** Chữ lớn nổi bật: *"Chào mừng tới Tổ chức M.A.P.L.E — Hệ thống Lưu trữ Trung ương"*.
  * **Nút hành động (Action Button):** Nút đỏ neon *"Bắt đầu Khảo sát Thực địa"* dẫn hướng người dùng trực tiếp tới trang có đuôi `/welcome` để bắt đầu chuỗi Tour.
* **Phạm vi tác động:** Hàm vẽ Modal Popup `showWelcomePopup()`.

### Bước 2: Tối ưu hóa các bước Tour hướng dẫn trực quan
* **Tệp cần sửa:** `MediaWiki/Welcome-Tours.js` và `MediaWiki/Welcome.js`
* **Mục tiêu:** Cải tiến nội dung thuyết minh từng bước hướng dẫn trên các trang (Trang Chủ, Kho Lưu Trữ, Nhiệm Vụ...). Nội dung ngắn gọn, súc tích, mang đậm phong cách huấn luyện đặc vụ sinh tồn trong Maze.
* **Phạm vi tác động:** Mảng dữ liệu các bước `tourSteps`.

### Bước 3: Tích hợp thanh đo tiến trình tour tối giản
* **Tệp cần sửa:** `MediaWiki/Welcome.js`
* **Mục tiêu:** Thêm một dòng đo tiến trình (ProgressBar) màu đỏ mờ chạy phía dưới mỗi thẻ Popover hướng dẫn để người dùng dễ theo dõi.
* **Phạm vi tác động:** Hàm cập nhật bước chuyển `updateStepIndicator()`.

### Bước 4: Tinh chỉnh CSS đồng bộ theme M.A.P.L.E Cyberpunk
* **Tệp cần sửa:** `MediaWiki/Welcome.css`
* **Mục tiêu:**
  * Giữ nguyên tông màu tối phối đỏ neon (`#ef4444`) chủ đạo của M.A.P.L.E.
  * Làm đẹp khung viền popup với hiệu ứng quét dòng nhạt (`scanline`) và bo góc mềm mại.
  * Tạo hiệu ứng nhấp nháy phát sáng nhẹ cho nút bắt đầu tour chào mừng để tăng tính tương tác.

---

## 3. Lệnh Test thu hẹp cục bộ
* Chạy kiểm tra lỗi cú pháp tệp JS chính:
  ```bash
  node -c g:\Wiki\MediaWiki\Welcome.js
  ```

---
*Khi hoàn thành mỗi bước nhỏ ở trên, hãy cập nhật dấu `[x]` vào tệp tương ứng `todo_4.md`.*
