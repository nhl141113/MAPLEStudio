# Todo 10: Bảng tiến độ & Chặn lỗi khẩn cấp (Circuit Breaker) - Task 10

## 🚧 TIẾN ĐỘ THỰC THI (Task 10)
- [ ] Bước 1: Render lưới danh sách thẻ đặc vụ với thông số avatar, rank, edit count trong `AllUsers.js`.
- [ ] Bước 2: Thiết lập menu hành động nhanh (Overlay) liên kết trực tiếp với Chat và Gifting System.
- [ ] Bước 3: Tạo kiểu Grid, Glassmorphic và hiệu ứng phát sáng cấp bậc cao trong `AllUsers.css`.
- [ ] Bước 4: Chạy kiểm tra lỗi cú pháp JS bằng Node.js và xác minh chức năng lọc thành viên trên trình duyệt.

---

## 🚨 QUY TẮC CHẶN LỖI KHẨN CẤP (Circuit Breaker)
1. **Nguyên tắc cô lập:** Tuyệt đối không gọi các API ghi dữ liệu hoặc sửa đổi dữ liệu hệ thống từ trang AllUsers, đảm bảo trang này hoạt động ở chế độ Đọc (Read-only) an toàn, tránh gây tải nặng cho máy chủ khi danh sách thành viên quá lớn.
2. **Ngưỡng ngắt lỗi sửa đổi:**
   * Nếu logic lọc hoặc phân trang gây đơ trình duyệt hoặc tải chậm làm đứt kết nối quá **2 lần**, kích hoạt ngay Circuit Breaker.
   * Hành động rút lui an toàn: Hủy bỏ các hiệu ứng hover phức tạp, trả về danh sách dạng bảng đơn giản của MediaWiki và nộp PR để kết thúc tác vụ thành công.
