# Task 2: Xây dựng hệ thống Tặng Quà (Gifting System)

## 1. Chỉ dẫn kỹ thuật & Đường dẫn file cần sửa
* **Đường dẫn tệp JS giao diện cá nhân:** `MediaWiki/UserPage.js` (Địa chỉ thực thi: [UserPage.js](file:///g:/Wiki/MediaWiki/UserPage.js))
* **Đường dẫn tệp CSS giao diện cá nhân:** `MediaWiki/UserPage.css` (Địa chỉ thực thi: [UserPage.css](file:///g:/Wiki/MediaWiki/UserPage.css))
* **Đường dẫn tệp gửi thông báo/tin nhắn:**
  * `MediaWiki/MAPLE-Chat.js` (Địa chỉ thực thi: [MAPLE-Chat.js](file:///g:/Wiki/MediaWiki/MAPLE-Chat.js))
  * `MediaWiki/MAPLE-Notify.js` (Địa chỉ thực thi: [MAPLE-Notify.js](file:///g:/Wiki/MediaWiki/MAPLE-Notify.js))
* **Nơi lưu dữ liệu quà tặng & RP:** `Người_dùng:[Tên]/Maple-Profile` (Trang cấu hình JSON cá nhân của từng thành viên).

---

## 2. Phạm vi Logic & Các bước thực hiện

### Bước 1: Thêm nút "Tặng Quà" tại trang cá nhân của thành viên khác
* **Tệp cần sửa:** `MediaWiki/UserPage.js`
* **Mục tiêu:** Khi xem UserPage của người khác (`wgNamespaceNumber === 2 && wgTitle !== CURRENT_USER`), chèn thêm nút "Tặng Quà" (Send Gift) vào thanh hành động (action row) bên cạnh nút "Chat".
* **Phạm vi tác động:** Hàm khởi tạo/vẽ trang cá nhân `renderUserPageActionButtons()`.

### Bước 2: Thiết kế hộp thoại danh mục Quà Tặng (Gift Catalog Modal)
* **Tệp cần sửa:** `MediaWiki/UserPage.js`
* **Mục tiêu:** Khi click nút "Tặng Quà", mở Modal hiển thị 3 vật phẩm:
  1. **Hộp tiếp tế (Supply Crate):** 10 RP.
  2. **La bàn Maze (Maze Compass):** 30 RP.
  3. **Huyết thanh Kháng độc (Anti-toxin Serum):** 50 RP.
  * Hiển thị nút "Xác nhận gửi" và kiểm tra xem RP hiện tại của người gửi có đủ để mua vật phẩm hay không.

### Bước 3: Cập nhật dữ liệu RP và lịch sử quà tặng (Profile Transaction)
* **Tệp cần sửa:** `MediaWiki/UserPage.js`
* **Mục tiêu:** Khi xác nhận gửi quà:
  * Trừ số RP tương ứng từ trang JSON `Người_dùng:[Người_Gửi]/Maple-Profile` của người gửi.
  * Cộng số RP hoặc cập nhật số lượng vật phẩm nhận được vào trang JSON `Người_dùng:[Người_Nhận]/Maple-Profile` của người nhận.
  * Ghi nhật ký lịch sử quà tặng nhận được (Gifts Received History).
* **Phạm vi tác động:** Hàm xử lý sự kiện click gửi quà `sendGiftTransaction()`.

### Bước 4: Tự động gửi tin nhắn chat và thông báo đẩy (Notifications)
* **Tệp cần sửa:** `MediaWiki/MAPLE-Chat.js` và `MediaWiki/MAPLE-Notify.js`
* **Mục tiêu:**
  * Tự động gửi tin nhắn hệ thống vào cuộc hội thoại chat 1-1 giữa 2 người: *"Đặc vụ [A] đã gửi tặng bạn một [Tên Vật Phẩm]!"*.
  * Đồng thời trigger một thông báo Toast dạng đẩy nổi ở góc màn hình của người nhận nếu họ đang online.

### Bước 5: Viết CSS cho Hộp thoại Quà tặng
* **Tệp cần sửa:** `MediaWiki/UserPage.css`
* **Mục tiêu:** Thiết kế giao diện Modal chọn quà tặng đẹp mắt, bố cục dạng Grid hiển thị 3 vật phẩm kèm hình vẽ/icon, hiệu ứng hover chọn viền neon đỏ/amber tương thích với phong cách Cyberpunk của trang.

---

## 3. Lệnh Test thu hẹp cục bộ
* Kiểm tra lỗi cú pháp tệp Javascript đã chỉnh sửa:
  ```bash
  node -c g:\Wiki\MediaWiki\UserPage.js
  ```

---
*Khi hoàn thành mỗi bước nhỏ ở trên, hãy cập nhật dấu `[x]` vào tệp tương ứng `todo_2.md`.*
