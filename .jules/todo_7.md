# Todo 7: Bảng tiến độ & Chặn lỗi khẩn cấp (Circuit Breaker) - Task 7

## 🚧 TIẾN ĐỘ THỰC THI (Task 7)
- [ ] Bước 1: Lập trình bộ lọc che mờ dữ liệu bảo mật dựa trên Clearance Level trong `Dossier.js`.
- [ ] Bước 2: Triển khai hiệu ứng nghiêng 3D (3D Tilt & Glare) cho thẻ trong `RecordCard.js`.
- [ ] Bước 3: Viết CSS tạo thanh đen bảo mật, chữ mờ và dải sáng phản chiếu trong `Dossier.css`.
- [ ] Bước 4: Chạy kiểm tra lỗi cú pháp bằng Node.js và kiểm thử trực quan trên trình duyệt.

---

## 🚨 QUY TẮC CHẶN LỖI KHẨN CẤP (Circuit Breaker)
1. **Nguyên tắc cô lập:** Không để tính năng che mờ làm mất hoàn toàn wikitext gốc của trang, gây lỗi hư hỏng chỉ số SEO hoặc làm trống nội dung trang khi in.
2. **Ngưỡng ngắt lỗi sửa đổi:**
   * Nếu hiệu ứng che phủ dữ liệu làm lỗi hiển thị trắng trang hoặc không cho phép mở khóa nội dung quá **2 lần**, kích hoạt ngay Circuit Breaker.
   * Hành động rút lui an toàn: Tự động bỏ che phủ (hiển thị văn bản trần), nạp lại mã nguồn cũ và nộp PR để bảo toàn lượt chạy thành công.
