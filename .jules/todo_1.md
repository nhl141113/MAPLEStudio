# Todo 1: Bảng tiến độ & Chặn lỗi khẩn cấp (Circuit Breaker) - Task 1

## 🚧 TIẾN ĐỘ THỰC THI (Task 1)
- [ ] Bước 1: Thiết kế giao diện thanh bên Kênh Cộng Đồng trong `MAPLE-Chat.js`.
- [ ] Bước 2: Tạo cơ chế đọc/ghi dữ liệu tin nhắn công khai tại `Dự_án:Chat/Kênh/[ID]`.
- [ ] Bước 3: Triển khai RPBot xử lý các lệnh `/rank` và `/gift` trong khung chat.
- [ ] Bước 4: Viết mã nguồn cho ứng dụng Poll và trò chơi giải mã Decryption Game.
- [ ] Bước 5: Làm đẹp giao diện các thành phần mới trong `MAPLE-Chat.css`.
- [ ] Bước 6: Kiểm tra cú pháp bằng Node.js và xác minh.

---

## 🚨 QUY TẮC CHẶN LỖI KHẨN CẤP (Circuit Breaker)
1. **Nguyên tắc cô lập:** Tuyệt đối không thay đổi các logic chat 1-1 gốc khi tích hợp logic kênh cộng đồng để tránh gây lỗi hỏng tính năng cũ.
2. **Ngưỡng ngắt lỗi sửa đổi:** 
   * Nếu thực hiện chỉnh sửa mã nguồn tệp `MAPLE-Chat.js` và chạy kiểm tra cú pháp gặp lỗi liên tiếp quá **2 lần** mà không tự sửa được, lập tức kích hoạt Circuit Breaker.
   * Hành động rút lui an toàn: Khôi phục lại trạng thái sạch ban đầu của file `MAPLE-Chat.js` từ bản sao lưu gần nhất.
   * Tạo Pull Request hoặc nộp bài báo cáo lỗi cục bộ với phần mã nguồn cũ đã chạy ổn định để bảo toàn lượt tác vụ thành công, tránh bị timeout hoặc thất bại làm phí quota.
