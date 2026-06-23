# Task 11: Nâng cấp Công Cụ Tạo Hồ Sơ Mới (CreateDossier) trực quan hóa tối đa cho người dùng

## 1. Chỉ dẫn kỹ thuật & Đường dẫn file cần sửa
* **Đường dẫn tệp JS Tạo hồ sơ:** `MediaWiki/CreateDossier.js` (Địa chỉ thực thi: [CreateDossier.js](file:///g:/Wiki/MediaWiki/CreateDossier.js))
* **Đường dẫn tệp CSS Tạo hồ sơ:** `MediaWiki/CreateDossier.css` (Địa chỉ thực thi: [CreateDossier.css](file:///g:/Wiki/MediaWiki/CreateDossier.css))

---

## 2. Phạm vi Logic & Các bước thực hiện

### Bước 1: Xây dựng trình hướng dẫn từng bước (Step-by-step Wizard Interface)
* **Tệp cần sửa:** `MediaWiki/CreateDossier.js`
* **Mục tiêu:** Chia biểu mẫu nhập liệu dài hiện tại thành một trình thuật sĩ (Wizard Form) 4 bước cực kỳ trực quan:
  * **Bước 1:** Chọn Mẫu Hồ Sơ (Thực thể Maze, Vật phẩm đặc dị, Nhật ký thực địa...). Minh họa bằng hình ảnh/icon lớn dễ chọn.
  * **Bước 2:** Nhập Thông Tin Nhận Diện (Tên hồ sơ, Mã số định danh, Cấp độ bảo mật Clearance).
  * **Bước 3:** Nhập Nội Dung Chi Tiết (Mô tả vật lý, Đặc tính dị thường, Quy trình quản thúc an toàn).
  * **Bước 4:** Kiểm tra & Xuất bản (Xem lại toàn bộ và bấm nút đăng bài).
* **Phạm vi tác động:** Hàm khởi tạo form `initFormWizard()`.

### Bước 2: Thiết lập khung xem trước thời gian thực (Live Preview Panel)
* **Tệp cần sửa:** `MediaWiki/CreateDossier.js`
* **Mục tiêu:** Bố trí giao diện 2 cột: Cột trái nhập thông tin, cột phải hiển thị một thẻ Hồ sơ mô phỏng (Live Preview Card). Khi người dùng gõ phím nhập Tên, Mã số hay chọn Cấp độ bảo mật, thẻ bên phải sẽ tự động cập nhật hiển thị ngay lập tức để họ thấy trước bài viết của mình trông như thế nào.
* **Phạm vi tác động:** Hàm đồng bộ dữ liệu xem trước `updateLivePreview()`.

### Bước 3: Đơn giản hóa việc điền Wikitext (Auto-Wikitext Generator)
* **Tệp cần sửa:** `MediaWiki/CreateDossier.js`
* **Mục tiêu:** Tự động hóa 100% quá trình tạo mã nguồn wikitext phức tạp ở hậu trường. Người dùng chỉ cần nhập văn bản thuần túy, hệ thống tự động bọc thẻ CSS, thêm bản mẫu (template) và lưu thẳng lên Wiki bằng API khi bấm nút "Xuất bản hồ sơ".
* **Phạm vi tác động:** Hàm tạo wikitext `generateWikitext()`.

### Bước 4: Viết CSS cho Wizard Form và Trực quan hóa Live Preview
* **Tệp cần sửa:** `MediaWiki/CreateDossier.css`
* **Mục tiêu:**
  * CSS thanh tiến trình từng bước (`ProgressBar / StepIndicator`) nằm trên đầu trang.
  * Thiết kế cột Live Preview có hiệu ứng trượt nhẹ, bo góc, nền tối và chữ đỏ/xanh chuẩn thiết bị bảo mật M.A.P.L.E.
  * Tạo các gợi ý nhập liệu (tooltips) nổi lên khi người dùng di chuột vào các ô nhập thông tin nhạy cảm.

---

## 3. Lệnh Test thu hẹp cục bộ
* Kiểm tra lỗi cú pháp JS:
  ```bash
  node -c g:\Wiki\MediaWiki\CreateDossier.js
  ```

---
*Khi hoàn thành mỗi bước nhỏ ở trên, hãy cập nhật dấu `[x]` vào tệp tương ứng `todo_11.md`.*
