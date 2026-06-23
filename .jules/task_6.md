# Task 6: Nâng cấp Cổng Chuyển Hướng An Toàn (MAPLE-OpenLink) với Đồng hồ đếm ngược

## 1. Chỉ dẫn kỹ thuật & Đường dẫn file cần sửa
* **Đường dẫn tệp JS Cổng bảo mật:** `MediaWiki/MAPLE-OpenLink.js` (Địa chỉ thực thi: [MAPLE-OpenLink.js](file:///g:/Wiki/MediaWiki/MAPLE-OpenLink.js))
* **Đường dẫn tệp CSS Cổng bảo mật:** `MediaWiki/MAPLE-Base.css` hoặc CSS tùy biến trong cổng bảo mật.

---

## 2. Phạm vi Logic & Các bước thực hiện

### Bước 1: Thiết kế giao diện Cảnh báo Đe dọa cao cấp (Hacker Guard Theme)
* **Tệp cần sửa:** `MediaWiki/MAPLE-OpenLink.js`
* **Mục tiêu:** Khi người dùng click vào link ngoài, thay thế màn hình chuyển tiếp đơn giản bằng một giao diện cảnh báo mang tính quân sự/cyberpunk rực sắc đỏ: *"CẢNH BÁO: BẠN ĐANG RỜI KHỎI MẠNG LƯỚI BẢO MẬT M.A.P.L.E"*. Hiển thị tên miền đích và đánh giá mức độ tin cậy.
* **Phạm vi tác động:** Hàm khởi tạo màn hình cảnh báo `renderWarningScreen()`.

### Bước 2: Tích hợp đồng hồ đếm ngược chuyển trang tự động (Countdown Redirector)
* **Tệp cần sửa:** `MediaWiki/MAPLE-OpenLink.js`
* **Mục tiêu:** Thêm đồng hồ đếm ngược 5 giây trực quan. Nút "Tiếp tục" chỉ sáng lên khi hết 5 giây để ép người dùng đọc kỹ cảnh báo bảo mật.
* **Phạm vi tác động:** Thiết lập vòng lặp đếm ngược `startCountdown()`.

### Bước 3: Tạo hiệu ứng quét mã độc (Malware Scanning Simulation Animation)
* **Tệp cần sửa:** `MediaWiki/MAPLE-OpenLink.js`
* **Mục tiêu:** Hiển thị hiệu ứng chữ chạy mô phỏng việc quét kiểm tra tệp tin độc hại (Malware/Phishing scan) trong thời gian đếm ngược để tăng tính trực quan bảo mật của Tổ chức.

---

## 3. Lệnh Test thu hẹp cục bộ
* Kiểm tra lỗi cú pháp JS:
  ```bash
  node -c g:\Wiki\MediaWiki\MAPLE-OpenLink.js
  ```

---
*Khi hoàn thành mỗi bước nhỏ ở trên, hãy cập nhật dấu `[x]` vào tệp tương ứng `todo_6.md`.*
