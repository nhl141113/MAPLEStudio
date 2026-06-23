# Task 1: Thiết kế Kênh Cộng Đồng, Bot và App trong MAPLE-Chat

## 1. Chỉ dẫn kỹ thuật & Đường dẫn file cần sửa
* **Đường dẫn tệp JS:** `MediaWiki/MAPLE-Chat.js` (Địa chỉ thực thi: [MAPLE-Chat.js](file:///g:/Wiki/MediaWiki/MAPLE-Chat.js))
* **Đường dẫn tệp CSS:** `MediaWiki/MAPLE-Chat.css` (Địa chỉ thực thi: [MAPLE-Chat.css](file:///g:/Wiki/MediaWiki/MAPLE-Chat.css))
* **Dữ liệu cấu hình mẫu:** `MediaWiki:Chat-Channels.json` (Trang cấu hình lưu các kênh `#general`, `#field-reports`, `#bot-commands`, `#mini-apps`).
* **Không gian tên lưu trữ tin nhắn công khai:** `Dự_án:Chat/Kênh/[ID]` (Dạng cấu trúc dữ liệu JSON lưu trữ tin nhắn cộng đồng).

---

## 2. Phạm vi Logic & Các bước thực hiện

### Bước 1: Khởi tạo giao diện máy chủ Cộng đồng (Community Channels Sidebar)
* **Tệp cần sửa:** `MediaWiki/MAPLE-Chat.js`
* **Mục tiêu:** Thêm khu vực **"KÊNH CỘNG ĐỒNG"** trong thanh bên trái (sidebar) của giao diện chat. Nạp dữ liệu cấu hình từ `MediaWiki:Chat-Channels.json` qua `apiReadJSON`.
* **Phạm vi tác động:** Hàm xây dựng thanh bên (inbox list/sidebar renderer).

### Bước 2: Thiết lập cơ chế Polling tin nhắn công khai
* **Tệp cần sửa:** `MediaWiki/MAPLE-Chat.js`
* **Mục tiêu:** Khi người dùng click vào một kênh cộng đồng, chuyển đổi luồng nạp và lưu tin nhắn từ `Người_dùng:[A]/Chat/[ID]` sang `Dự_án:Chat/Kênh/[ID]`. Sử dụng `apiReadJSON` và `apiWriteJSON` với quyền ghi công khai cho mọi thành viên đã đăng nhập.
* **Phạm vi tác động:** Các hàm `pollUpdates()`, `doSend()`, `loadConversation()`.

### Bước 3: Tích hợp RPBot & Xử lý cú pháp lệnh (Command Parser)
* **Tệp cần sửa:** `MediaWiki/MAPLE-Chat.js`
* **Mục tiêu:** Chặn sự kiện gửi tin nhắn (trước khi ghi lên wiki) để kiểm tra các lệnh:
  * `/rank`: Tự động gọi API truy vấn RP hiện tại và Clearance Level của người gửi, sau đó Bot phản hồi trực tiếp bằng một tin nhắn ảo từ hệ thống: `[BOT] RPBot`.
  * `/gift @username [RP]`: Kiểm tra số RP của người gửi, thực hiện trừ RP của người gửi và cộng vào profile người nhận thông qua ghi đè JSON ở `User:Name/Maple-Profile`, sau đó gửi tin nhắn xác nhận ảo.
* **Phạm vi tác động:** Hàm xử lý gửi tin nhắn `doSend()`, hàm lọc cú pháp lệnh `parseSlashCommand()`.

### Bước 4: Tích hợp Ứng dụng Mini (Poll App & Decryption Game)
* **Tệp cần sửa:** `MediaWiki/MAPLE-Chat.js`
* **Mục tiêu:**
  * Lệnh `/poll "Câu hỏi" "Lựa chọn 1" "Lựa chọn 2"`: Tạo tin nhắn có cấu trúc đặc biệt lưu trữ tùy chọn khảo sát. Render giao diện có nút click chọn phương án và hiển thị biểu đồ kết quả thời gian thực.
  * Hacking/Decryption Game: Tạo một panel trò chơi giải mã mini dạng canvas/HTML (Fallout hacking style) hiển thị ngay trong khung chat khi click nút "Mở Ứng Dụng". Khi thắng, tự động cộng 10 RP vào tài khoản người chơi.
* **Phạm vi tác động:** Bộ lọc render tin nhắn `renderMessage()`, khung tương tác ứng dụng `openAppPanel()`.

### Bước 5: Tạo kiểu dáng phong cách Cyberpunk/Discord
* **Tệp cần sửa:** `MediaWiki/MAPLE-Chat.css`
* **Mục tiêu:**
  * Định dạng danh sách kênh với ký tự `#`.
  * Tạo nhãn `[BOT]` màu đỏ/neon nổi bật cho RPBot.
  * Tạo kiểu cho bảng bình chọn Poll và giao diện game giải mã trực quan.
* **Phạm vi tác động:** Bổ sung các lớp CSS vào cuối file.

---

## 3. Lệnh Test thu hẹp cục bộ
* Lệnh kiểm tra lỗi cú pháp JS:
  ```bash
  node -c g:\Wiki\MediaWiki\MAPLE-Chat.js
  ```

---
*Khi hoàn thành mỗi bước nhỏ ở trên, hãy cập nhật dấu `[x]` vào tệp tương ứng `todo_1.md`.*
