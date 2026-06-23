# Todo 6: Bảng tiến độ & Chặn lỗi khẩn cấp (Circuit Breaker) - Task 6

## 🚧 TIẾN ĐỘ THỰC THI (Task 6)
- [x] Bước 1: Thiết kế giao diện cảnh báo an ninh màu đỏ rực trong `MAPLE-OpenLink.js`.
- [x] Bước 2: Tích hợp bộ đếm ngược 5 giây trước khi kích hoạt nút chuyển tiếp.
- [x] Bước 3: Tạo hiệu ứng chữ chạy mô phỏng quét mã độc trong thời gian chờ.
- [x] Bước 4: Chạy kiểm tra lỗi cú pháp JS bằng Node.js và click thử link ngoài để xác minh.

---

## 🚨 QUY TẮC CHẶN LỖI KHẨN CẤP (Circuit Breaker)
1. **Nguyên tắc cô lập:** Cổng bảo mật chỉ can thiệp vào các liên kết ngoài (External Links). Tuyệt đối không được chặn hoặc gây trễ các liên kết nội bộ trong Wiki (`/wiki/...`).
2. **Ngưỡng ngắt lỗi sửa đổi:**
   * Nếu xảy ra lỗi làm treo trình duyệt hoặc chặn toàn bộ liên kết (kể cả liên kết nội bộ) quá **2 lần**, kích hoạt ngay Circuit Breaker.
   * Hành động rút lui an toàn: Hủy bỏ việc chặn click, khôi phục tệp `MAPLE-OpenLink.js` về trạng thái mặc định ban đầu để bảo toàn quota lượt chạy thành công.
