# Task 10: Thiết kế Danh Bạ Đặc Vụ (AllUsers) với Bộ lọc Cấp bậc & Thao tác Nhanh

## 1. Chỉ dẫn kỹ thuật & Đường dẫn file cần sửa
* **Đường dẫn tệp JS Danh bạ:** `MediaWiki/AllUsers.js` (Địa chỉ thực thi: [AllUsers.js](file:///g:/Wiki/MediaWiki/AllUsers.js))
* **Đường dẫn tệp CSS Danh bạ:** `MediaWiki/AllUsers.css` (Địa chỉ thực thi: [AllUsers.css](file:///g:/Wiki/MediaUsers/AllUsers.css))

---

## 2. Phạm vi Logic & Các bước thực hiện

### Bước 1: Thiết kế thẻ đặc vụ trực quan (Agent Badge Card Layout)
* **Tệp cần sửa:** `MediaWiki/AllUsers.js`
* **Mục tiêu:** Render danh sách thành viên dưới dạng lưới các thẻ đặc vụ (Agent Cards). Mỗi thẻ hiển thị Avatar lớn, Tên đặc vụ, Cấp bậc Clearance (ví dụ: Level 3), Số lượt chỉnh sửa (Edits count), và Ngày gia nhập Tổ chức.
* **Phạm vi tác động:** Hàm render danh sách `buildUserCards()`.

### Bước 2: Tích hợp menu hành động nhanh (Quick Actions Overlay)
* **Tệp cần sửa:** `MediaWiki/AllUsers.js`
* **Mục tiêu:** Khi di chuột vào thẻ đặc vụ, hiển thị menu phủ lên (hover overlay) chứa 3 nút hành động nhanh:
  1. *Xem hồ sơ (Profile)* - Dẫn sang UserPage.
  2. *Gửi tin nhắn (Message)* - Kích hoạt MAPLE-Chat mở cuộc trò chuyện trực tiếp.
  3. *Tặng quà (Gift)* - Mở Modal gửi tặng quà nhanh từ Task 2.
* **Phạm vi tác động:** Hàm xử lý sự kiện hover và click trên card.

### Bước 3: Làm đẹp giao diện Danh bạ bằng CSS
* **Tệp cần sửa:** `MediaWiki/AllUsers.css`
* **Mục tiêu:**
  * Thiết kế lưới thẻ Responsive (Grid layout) co giãn linh hoạt theo kích thước màn hình.
  * Hiệu ứng mờ ảo (glassmorphism/blur background) và viền đỏ phát sáng cho các đặc vụ có cấp bậc cao nhất (Founder/Admin).

---

## 3. Lệnh Test thu hẹp cục bộ
* Kiểm tra cú pháp JS:
  ```bash
  node -c g:\Wiki\MediaWiki\AllUsers.js
  ```

---
*Khi hoàn thành mỗi bước nhỏ ở trên, hãy cập nhật dấu `[x]` vào tệp tương ứng `todo_10.md`.*
