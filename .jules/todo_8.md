# Todo 8: Bảng tiến độ & Chặn lỗi khẩn cấp (Circuit Breaker) - Task 8

## 🚧 TIẾN ĐỘ THỰC THI (Task 8)
- [ ] Bước 1: Viết logic nút bấm "Nhận RP" và cơ chế gọi API ghi đè điểm số vào trang JSON cá nhân.
- [ ] Bước 2: Thiết lập đồng hồ đếm ngược thời gian thực dựa trên giờ hệ thống trong `NhiemVu.js`.
- [ ] Bước 3: Thiết kế CSS cho nút nhận thưởng, hiệu ứng phát sáng và hoạt ảnh chúc mừng.
- [ ] Bước 4: Chạy kiểm tra cú pháp JS bằng Node.js và xác minh lưu dữ liệu RP thành công.

---

## 🚨 QUY TẮC CHẶN LỖI KHẨN CẤP (Circuit Breaker)
1. **Nguyên tắc cô lập:** Tuyệt đối không để xảy ra lỗi ghi đè trùng lặp điểm (exploits) hoặc ghi sai cú pháp làm hỏng tệp JSON điểm số của người dùng.
2. **Ngưỡng ngắt lỗi sửa đổi:**
   * Nếu thao tác nhấn nút nhận RP bị lỗi kết nối hoặc làm mất dữ liệu điểm cũ của thành viên quá **2 lần**, kích hoạt ngay Circuit Breaker.
   * Hành động rút lui an toàn: Hủy tính năng nhận thủ công, trả về cơ chế cộng điểm tự động cũ của hệ thống và nộp PR để kết thúc tác vụ an toàn.
