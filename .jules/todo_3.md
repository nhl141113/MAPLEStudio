# Todo 3: Bảng tiến độ & Chặn lỗi khẩn cấp (Circuit Breaker) - Task 3

## 🚧 TIẾN ĐỘ THỰC THI (Task 3)
- [ ] Bước 1: Triển khai khung thông số chẩn đoán hệ thống realtime (Diagnostics Console).
- [ ] Bước 2: Lấy dữ liệu API và hiển thị Widget hồ sơ tiêu biểu (Featured Dossier Widget).
- [ ] Bước 3: Xây dựng trình xử lý dòng lệnh Mini-CLI Console ở cuối Trang chủ.
- [ ] Bước 4: Viết CSS cho màn hình CRT, văn bản nhấp nháy và hiệu ứng CLI trong `HomePage.css`.
- [ ] Bước 5: Chạy kiểm tra lỗi cú pháp Node.js và kiểm tra hiển thị thực tế trên trình duyệt.

---

## 🚨 QUY TẮC CHẶN LỖI KHẨN CẤP (Circuit Breaker)
1. **Nguyên tắc cô lập:** Không can thiệp vào các thành phần Header/Footer mặc định của hệ thống MediaWiki hoặc các liên kết điều hướng cốt lõi để tránh hỏng bố cục trang chính.
2. **Ngưỡng ngắt lỗi sửa đổi:**
   * Nếu mã nguồn JavaScript chèn vào trang chủ gặp lỗi xung đột làm trắng màn hình trang chính (`Trang_Chính`) quá **2 lần**, lập tức kích hoạt Circuit Breaker.
   * Hành động rút lui an toàn: Hủy bỏ việc chèn mã, tải lại mã nguồn sạch ban đầu để đảm bảo trang chính của Wiki luôn hiển thị bình thường.
   * Đóng tác vụ và nộp PR với phần giao diện chẩn đoán tĩnh (static) thay vì động nếu lỗi phát sinh từ hàm API/MutationObserver.
