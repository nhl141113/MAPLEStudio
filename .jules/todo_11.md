# Todo 11: Bảng tiến độ & Chặn lỗi khẩn cấp (Circuit Breaker) - Task 11

## 🚧 TIẾN ĐỘ THỰC THI (Task 11)
- [ ] Bước 1: Chia nhỏ form nhập liệu thành quy trình Wizard 4 bước trực quan trong `CreateDossier.js`.
- [ ] Bước 2: Thiết kế cột xem trước trực tiếp (Live Preview Card) cập nhật dữ liệu khi gõ phím.
- [ ] Bước 3: Lập trình bộ sinh wikitext tự động ẩn dưới nền để người dùng không cần biết code wikitext.
- [ ] Bước 4: Viết CSS cho thanh tiến trình bước, các nút chuyển hướng và các khung gợi ý Tooltip.
- [ ] Bước 5: Chạy kiểm tra lỗi cú pháp JS bằng Node.js và tạo thử một bài viết mẫu để xác minh.

---

## 🚨 QUY TẮC CHẶN LỖI KHẨN CẤP (Circuit Breaker)
1. **Nguyên tắc cô lập:** Trình tạo bài mới chỉ hoạt động tại trang `/wiki/Tạo_Bài_Mới`. Đảm bảo các hàm tự sinh wikitext không gửi các ký tự lạ hoặc thẻ HTML lỗi làm vỡ cấu trúc cơ sở dữ liệu trang thật của MediaWiki.
2. **Ngưỡng ngắt lỗi sửa đổi:**
   * Nếu nút "Xuất bản" bị lỗi API hoặc tạo ra trang trắng/trang bị vỡ định dạng wikitext liên tiếp quá **2 lần**, kích hoạt ngay Circuit Breaker.
   * Hành động rút lui an toàn: Trả về biểu mẫu điền thô wikitext cơ bản của hệ thống để người dùng tự nhập tay wikitext, khôi phục lại file cũ và nộp PR an toàn.
