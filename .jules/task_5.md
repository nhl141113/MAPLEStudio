# Task 5: Nâng cấp Bảng Kiểm Duyệt (Admin Censor Panel) với Chỉ số Rủi ro AI

## 1. Chỉ dẫn kỹ thuật & Đường dẫn file cần sửa
* **Đường dẫn tệp JS Bảng duyệt bài:** `MediaWiki/Gadget-MapleCensor.js` (Địa chỉ thực thi: [Gadget-MapleCensor.js](file:///g:/Wiki/MediaWiki/Gadget-MapleCensor.js))
* **Đường dẫn tệp JS Hàng chờ:** `MediaWiki/MAPLE-SubmitWait.js` (Địa chỉ thực thi: [MAPLE-SubmitWait.js](file:///g:/Wiki/MediaWiki/MAPLE-SubmitWait.js))
* **Dữ liệu hàng chờ bài viết:** `MediaWiki:Maple-Pending.json` (Lưu danh sách bài chờ duyệt).

---

## 2. Phạm vi Logic & Các bước thực hiện

### Bước 1: Tích hợp thanh đo mức độ rủi ro (Risk Scoring Bar)
* **Tệp cần sửa:** `MediaWiki/Gadget-MapleCensor.js`
* **Mục tiêu:** Thêm một thanh đo trực quan (0% - 100%) hiển thị mức độ rủi ro của bài viết đang chờ duyệt (ví dụ: phát hiện ngôn từ độc hại, chứa dữ liệu nhạy cảm hay định dạng wikitext lỗi). Thanh đo đổi màu từ Xanh lục (An toàn) -> Cam -> Đỏ rực (Nguy hiểm).
* **Phạm vi tác động:** Hàm render thông tin chi tiết bài viết `renderCensorDetail()`.

### Bước 2: Bổ sung khu vực nhận xét của Trợ lý AI giả lập (AI Assistant Advice)
* **Tệp cần sửa:** `MediaWiki/Gadget-MapleCensor.js`
* **Mục tiêu:** Hiển thị một khung nhận xét tự động từ "Trí tuệ nhân tạo giả lập của M.A.P.L.E" gợi ý cho Kiểm Duyệt Viên lý do duyệt hoặc từ chối bài viết này một cách nhanh chóng.
* **Phạm vi tác động:** Thêm hàm render trợ giúp AI `renderAISuggestions()`.

### Bước 3: CSS làm đẹp Bảng Kiểm Duyệt
* **Tệp cần sửa:** `MediaWiki/MAPLE-Base.css` hoặc tiêm CSS trực tiếp vào Gadget.
* **Mục tiêu:** Thiết kế giao diện Dashboard khoa học, gọn gàng với bố cục màu xám tối và vàng hổ phách (amber), tạo hiệu ứng chuyển động mượt mà cho thanh đo rủi ro và các nút "Duyệt" (Approve) / "Từ chối" (Reject).

---

## 3. Lệnh Test thu hẹp cục bộ
* Kiểm tra lỗi cú pháp JS:
  ```bash
  node -c g:\Wiki\MediaWiki\Gadget-MapleCensor.js
  ```

---
*Khi hoàn thành mỗi bước nhỏ ở trên, hãy cập nhật dấu `[x]` vào tệp tương ứng `todo_5.md`.*
