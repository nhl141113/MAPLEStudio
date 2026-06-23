# Todo 4: Bảng tiến độ & Chặn lỗi khẩn cấp (Circuit Breaker) - Task 4

## 🚧 TIẾN ĐỘ THỰC THI (Task 4)
- [ ] Bước 1: Render Logo M.A.P.L.E và thông điệp chào mừng tổ chức trong `Welcome-Popup.js`.
- [ ] Bước 2: Cài đặt nút hành động bắt đầu chuyển hướng đến trang `/welcome` bắt đầu Tour.
- [ ] Bước 3: Cập nhật nội dung thuyết minh hướng dẫn thực địa trong `Welcome-Tours.js`.
- [ ] Bước 4: Viết CSS đồng bộ giao diện tối/đỏ neon và các hiệu ứng quét dòng trong `Welcome.css`.
- [ ] Bước 5: Chạy kiểm tra cú pháp bằng Node.js và xác minh trực quan trên trình duyệt.

---

## 🚨 QUY TẮC CHẶN LỖI KHẨN CẤP (Circuit Breaker)
1. **Nguyên tắc cô lập:** Tuyệt đối không được để Popup chào mừng tự động hiển thị liên tục gây khó chịu cho thành viên cũ. Sử dụng localStorage để ghi nhớ trạng thái đã xem của người dùng.
2. **Ngưỡng ngắt lỗi sửa đổi:**
   * Nếu cơ chế ghi nhớ trạng thái của Popup bị lỗi khiến Popup lặp đi lặp lại vô hạn hoặc nút chuyển hướng không hoạt động quá **2 lần**, kích hoạt ngay Circuit Breaker.
   * Hành động rút lui an toàn: Tự động ẩn popup, khôi phục tệp `Welcome-Popup.js` về phiên bản cũ và nộp PR để bảo toàn lượt chạy thành công.
