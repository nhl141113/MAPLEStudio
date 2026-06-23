# Todo 2: Bảng tiến độ & Chặn lỗi khẩn cấp (Circuit Breaker) - Task 2

## 🚧 TIẾN ĐỘ THỰC THI (Task 2)
- [ ] Bước 1: Render nút "Tặng Quà" trên giao diện UserPage của thành viên khác.
- [ ] Bước 2: Thiết kế khung Modal lựa chọn 3 loại quà tặng kèm giá trị RP tương ứng.
- [ ] Bước 3: Lập trình logic giao dịch trừ/cộng RP và cập nhật tệp JSON cá nhân của hai bên.
- [ ] Bước 4: Tích hợp cơ chế tự động gửi tin nhắn chat và bắn Toast thông báo nhận quà.
- [ ] Bước 5: Bổ sung CSS tạo hiệu ứng phát sáng cho Modal quà tặng trong `UserPage.css`.
- [ ] Bước 6: Kiểm tra cú pháp bằng Node.js và xác minh thực địa.

---

## 🚨 QUY TẮC CHẶN LỖI KHẨN CẤP (Circuit Breaker)
1. **Nguyên tắc cô lập:** Tuyệt đối không để quá trình trừ/cộng RP bị lỗi dẫn đến việc bị trùng lặp giao dịch hoặc lưu trữ sai định dạng JSON làm hỏng trang cá nhân của thành viên.
2. **Ngưỡng ngắt lỗi sửa đổi:**
   * Nếu mã nguồn giao dịch JSON ghi đè trang cá nhân gặp lỗi API liên tiếp quá **2 lần**, kích hoạt ngay cơ chế Circuit Breaker.
   * Hành động rút lui an toàn: Hủy bỏ tiến trình sửa đổi dữ liệu RP, khôi phục lại mã nguồn Javascript sạch từ bản sao lưu gần nhất.
   * Nộp bài hoặc tạo Pull Request với phần giao diện hiển thị cũ để giữ an toàn cho dữ liệu điểm số của người dùng toàn hệ thống.
