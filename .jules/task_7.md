# Task 7: Nâng cấp Thẻ Hồ Sơ Bảo Mật (Dossier & RecordCard) với Bộ lọc Che phủ Thông tin

## 1. Chỉ dẫn kỹ thuật & Đường dẫn file cần sửa
* **Đường dẫn tệp JS Thẻ hồ sơ:** `MediaWiki/Dossier.js` (Địa chỉ thực thi: [Dossier.js](file:///g:/Wiki/MediaWiki/Dossier.js))
* **Đường dẫn tệp JS Cấu trúc thẻ:** `MediaWiki/RecordCard.js` (Địa chỉ thực thi: [RecordCard.js](file:///g:/Wiki/MediaWiki/RecordCard.js))
* **Đường dẫn tệp CSS Thẻ hồ sơ:** `MediaWiki/Dossier.css` (Địa chỉ thực thi: [Dossier.css](file:///g:/Wiki/MediaWiki/Dossier.css))

---

## 2. Phạm vi Logic & Các bước thực hiện

### Bước 1: Triển khai tính năng Bộ lọc Nhạy cảm (Clearance Masking Filter)
* **Tệp cần sửa:** `MediaWiki/Dossier.js`
* **Mục tiêu:** Tự động phát hiện các thẻ văn bản được đánh dấu là bảo mật (ví dụ: `<div class="classified-data">`). Thực hiện che mờ (blur) hoặc bôi đen dạng thanh mật (black bar). Khi người dùng nhấp chuột vào (click-to-reveal) và họ có đủ Clearance Level tương ứng, văn bản mới hiển thị kèm âm thanh bíp bíp nhẹ.
* **Phạm vi tác động:** Hàm xử lý thẻ bảo mật `applyClearanceMasking()`.

### Bước 2: Thêm hiệu ứng 3D Glare cho thẻ Hồ sơ
* **Tệp cần sửa:** `MediaWiki/RecordCard.js`
* **Mục tiêu:** Thêm hiệu ứng di chuột (hover) phản chiếu ánh sáng 3D (3D Glare/Tilt effect) tạo độ bóng bẩy trực quan cho thẻ sinh vật/vật phẩm khi xem trên máy tính.
* **Phạm vi tác động:** Hàm gắn sự kiện di chuột `initCardTilt()`.

### Bước 3: Thiết kế CSS cho hiệu ứng Che phủ & 3D Glare
* **Tệp cần sửa:** `MediaWiki/Dossier.css`
* **Mục tiêu:**
  * CSS lớp `.classified-data` với hiệu ứng `filter: blur(5px)` và chuyển tiếp mượt mà `transition: filter 0.3s`.
  * CSS lớp `.glare-effect` để tạo dải bóng sáng chạy xéo qua thẻ khi rê chuột.

---

## 3. Lệnh Test thu hẹp cục bộ
* Kiểm tra cú pháp JS:
  ```bash
  node -c g:\Wiki\MediaWiki\Dossier.js
  ```

---
*Khi hoàn thành mỗi bước nhỏ ở trên, hãy cập nhật dấu `[x]` vào tệp tương ứng `todo_7.md`.*
