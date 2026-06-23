# Todo 9: Bảng tiến độ & Chặn lỗi khẩn cấp (Circuit Breaker) - Task 9

## 🚧 TIẾN ĐỘ THỰC THI (Task 9)
- [ ] Bước 1: Thiết kế form gửi phản hồi phân cấp mức độ nghiêm trọng trong `PhanHoi-Popup.js`.
- [ ] Bước 2: Lập trình Dashboard quản trị viên phân loại thẻ phản hồi và đổi trạng thái trong `PhanHoi.js`.
- [ ] Bước 3: Tạo kiểu dáng nhãn màu sắc trạng thái nổi bật trong `PhanHoi.css`.
- [ ] Bước 4: Chạy kiểm tra lỗi cú pháp JS bằng Node.js và gửi thử một phản hồi mẫu để xác minh.

---

## 🚨 QUY TẮC CHẶN LỖI KHẨN CẤP (Circuit Breaker)
1. **Nguyên tắc cô lập:** Tuyệt đối không can thiệp vào cơ sở dữ liệu chung hoặc cấu trúc lưu trữ của các bài viết chính trên wiki khi lưu phản hồi. Chỉ sửa đổi tệp JSON chuyên biệt dành cho phản hồi của người dùng.
2. **Ngưỡng ngắt lỗi sửa đổi:**
   * Nếu thao tác lưu hoặc đổi trạng thái phản hồi làm trắng trang Dashboard phản hồi quá **2 lần**, kích hoạt ngay Circuit Breaker.
   * Hành động rút lui an toàn: Khôi phục lại trạng thái cũ của tệp `PhanHoi.js`, bỏ qua lưu trữ động và nộp PR để bảo toàn quota lượt chạy thành công.
