# Todo 5: Bảng tiến độ & Chặn lỗi khẩn cấp (Circuit Breaker) - Task 5

## 🚧 TIẾN ĐỘ THỰC THI (Task 5)
- [ ] Bước 1: Triển khai thanh đo mức độ rủi ro đổi màu động dựa trên dữ liệu bài viết.
- [ ] Bước 2: Thiết kế khung nhận xét và đề xuất tự động của Trợ lý AI.
- [ ] Bước 3: Làm đẹp giao diện dashboard kiểm duyệt với CSS và hiệu ứng nút bấm.
- [ ] Bước 4: Chạy kiểm tra cú pháp JS bằng Node.js và xác minh chức năng duyệt bài.

---

## 🚨 QUY TẮC CHẶN LỖI KHẨN CẤP (Circuit Breaker)
1. **Nguyên tắc cô lập:** Tuyệt đối không làm thay đổi hay mất dữ liệu các bài viết lưu tại tệp JSON `Maple-Pending.json` khi chạy thử tính năng duyệt/từ chối.
2. **Ngưỡng ngắt lỗi sửa đổi:**
   * Nếu thao tác duyệt bài làm trống hoặc hỏng định dạng tệp JSON lưu trữ quá **2 lần**, kích hoạt ngay Circuit Breaker.
   * Hành động rút lui an toàn: Hủy thao tác ghi dữ liệu, tải lại mã nguồn cũ để Admin duyệt bài thủ công và nộp PR an toàn.
