# Task 8: Nâng cấp Bảng Nhiệm Vụ (NhiemVu) với Nút Nhận Thưởng & Đếm ngược Reset

## 1. Chỉ dẫn kỹ thuật & Đường dẫn file cần sửa
* **Đường dẫn tệp JS Nhiệm vụ:** `MediaWiki/NhiemVu.js` (Địa chỉ thực thi: [NhiemVu.js](file:///g:/Wiki/MediaWiki/NhiemVu.js))
* **Đường dẫn tệp CSS Nhiệm vụ:** `MediaWiki/NhiemVu.css` (Địa chỉ thực thi: [NhiemVu.css](file:///g:/Wiki/MediaWiki/NhiemVu.css))

---

## 2. Phạm vi Logic & Các bước thực hiện

### Bước 1: Thay thế cơ chế cộng RP thụ động bằng Nút "Nhận RP" chủ động
* **Tệp cần sửa:** `MediaWiki/NhiemVu.js`
* **Mục tiêu:** Khi một nhiệm vụ được kiểm chứng hoàn thành (màu xanh lá), không tự cộng điểm ngầm. Hiển thị một nút "Nhận RP" nhấp nháy nổi bật. Click vào nút sẽ gọi API cộng RP vào trang cá nhân của thành viên, phát âm thanh chúc mừng và hiển thị hiệu ứng pháo hoa nổi (Toast/Notify).
* **Phạm vi tác động:** Hàm kiểm tra trạng thái nhiệm vụ `checkTaskCompletion()` và hàm vẽ nút thưởng.

### Bước 2: Thiết lập Đồng hồ đếm ngược thời gian reset nhiệm vụ (Reset Timer)
* **Tệp cần sửa:** `MediaWiki/NhiemVu.js`
* **Mục tiêu:** Thêm đồng hồ đếm ngược thời gian thực (Giờ:Phút:Giây) ở góc trên bảng nhiệm vụ chỉ ra thời gian còn lại trước khi bước sang ngày mới (đối với Daily) hoặc tuần mới (đối với Weekly) để reset nhiệm vụ.
* **Phạm vi tác động:** Hàm đếm ngược thời gian `startResetTimer()`.

### Bước 3: Viết hiệu ứng nhận thưởng trong CSS
* **Tệp cần sửa:** `MediaWiki/NhiemVu.css`
* **Mục tiêu:** Tạo CSS hiệu ứng nhấp nháy phát sáng (pulse) cho nút nhận quà, thiết lập giao diện đếm ngược gọn gàng, và hiệu ứng pháo hoa bụi sáng bay lên khi click nhận thưởng thành công.

---

## 3. Lệnh Test thu hẹp cục bộ
* Kiểm tra cú pháp JS:
  ```bash
  node -c g:\Wiki\MediaWiki\NhiemVu.js
  ```

---
*Khi hoàn thành mỗi bước nhỏ ở trên, hãy cập nhật dấu `[x]` vào tệp tương ứng `todo_8.md`.*
