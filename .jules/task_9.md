# Task 9: Nâng cấp Hệ thống Phản hồi & Báo lỗi (Feedback System) với Dashboard Quản trị viên

## 1. Chỉ dẫn kỹ thuật & Đường dẫn file cần sửa
* **Đường dẫn tệp JS giao diện Phản hồi:** `MediaWiki/PhanHoi.js` (Địa chỉ thực thi: [PhanHoi.js](file:///g:/Wiki/MediaWiki/PhanHoi.js))
* **Đường dẫn tệp JS Popup gửi nhanh:** `MediaWiki/PhanHoi-Popup.js` (Địa chỉ thực thi: [PhanHoi-Popup.js](file:///g:/Wiki/MediaWiki/PhanHoi-Popup.js))
* **Đường dẫn tệp CSS Phản hồi:** `MediaWiki/PhanHoi.css` (Địa chỉ thực thi: [PhanHoi.css](file:///g:/Wiki/MediaWiki/PhanHoi.css))

---

## 2. Phạm vi Logic & Các bước thực hiện

### Bước 1: Xây dựng form gửi báo lỗi có phân loại chi tiết (Detailed Feedback Form)
* **Tệp cần sửa:** `MediaWiki/PhanHoi-Popup.js`
* **Mục tiêu:** Popup gửi phản hồi cho phép chọn loại báo cáo (Lỗi giao diện, Lỗi tính năng, Góp ý, Dữ liệu hồ sơ sai) kèm theo mức độ nghiêm trọng (Thấp, Trung bình, Cao, Khẩn cấp).
* **Phạm vi tác động:** Hàm render Form `buildFeedbackForm()`.

### Bước 2: Thiết lập Dashboard theo dõi tiến độ xử lý cho Quản trị viên (Feedback Kanban)
* **Tệp cần sửa:** `MediaWiki/PhanHoi.js`
* **Mục tiêu:** Hiển thị danh sách các phản hồi đã gửi dưới dạng bảng hoặc thẻ phân loại theo trạng thái: *Đang chờ (Pending), Đang xử lý (In-Progress), Đã sửa (Fixed), Đã từ chối (Rejected)*. Cho phép Admin đổi trạng thái trực tiếp bằng 1 cú click chuột.
* **Phạm vi tác động:** Hàm vẽ danh sách phản hồi `renderFeedbackDashboard()`.

### Bước 3: Định dạng màu sắc trạng thái trong CSS
* **Tệp cần sửa:** `MediaWiki/PhanHoi.css`
* **Mục tiêu:** CSS nhãn trạng thái trực quan: Màu đỏ (Khẩn cấp/Pending), Màu vàng (In-progress), Màu xanh lục (Fixed). Thiết kế hiệu ứng bóng đổ và viền kẻ tinh tế cho các thẻ báo cáo phản hồi.

---

## 3. Lệnh Test thu hẹp cục bộ
* Kiểm tra cú pháp JS:
  ```bash
  node -c g:\Wiki\MediaWiki\PhanHoi.js
  ```

---
*Khi hoàn thành mỗi bước nhỏ ở trên, hãy cập nhật dấu `[x]` vào tệp tương ứng `todo_9.md`.*
