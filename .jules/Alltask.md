# Alltask: Chỉ thị thực thi tối cao cho Google Jules AI (Single Run)

## 🎯 Chỉ thị bắt buộc
Bạn phải hoàn thành toàn bộ 11 tác vụ độc lập dưới đây trong **DUY NHẤT MỘT LẦN CHẠY (Single Run)** để tối ưu chi phí tác vụ của hệ thống. 

Hãy thực thi theo đúng quy trình sau:
1. Mở và thực hiện tuần tự từng tệp chỉ dẫn kỹ thuật con từ `.jules/task_1.md` đến `.jules/task_11.md`.
2. Khi hoàn thành từng nhiệm vụ nhỏ hoặc nhiệm vụ lớn, hãy cập nhật dấu `[x]` vào tệp tiến độ con `.jules/todo_X.md` tương ứng và tệp tiến độ tổng `.jules/AllTodo.md`.
3. Tuân thủ nghiêm ngặt nguyên tắc **Strict Context Isolation** (Cách ly bối cảnh): chỉ chỉnh sửa các tệp tin trong phạm vi đã định, không sửa đổi lan man sang các module khác.

---

## 🚨 Chiến lược rút lui an toàn (Circuit Breaker tối cao)
1. **Kiểm soát lỗi cục bộ:** 
   * Đối với mỗi tệp chỉ dẫn con (`task_X.md`), nếu bạn cố gắng sửa đổi tệp mã nguồn và chạy kiểm tra cú pháp cục bộ gặp lỗi liên tiếp quá **2 lần**, hãy **lập tức dừng việc sửa đổi tệp đó**.
   * Thực hiện khôi phục (rollback) tệp tin bị lỗi đó về phiên bản gốc sạch gần nhất.
2. **Tiếp tục tiến trình:** 
   * Bỏ qua tệp con đang bị lỗi để tiếp tục thực hiện các tệp nhiệm vụ còn lại trong danh sách. Giữ nguyên mã nguồn sạch của các phần việc đã hoàn thành thành công trước đó.
3. **Xuất bản kết quả:** 
   * Ngay sau khi hoàn tất các phần việc khả thi (hoặc gặp lỗi ngắt mạch quá nhiều), lập tức nộp bài và tạo **DUY NHẤT MỘT PULL REQUEST (PR) TỔNG** chứa toàn bộ các chỉnh sửa thành công.
   * Tuyệt đối không để xảy ra hiện tượng Timeout hoặc Gặp lỗi toàn cục khiến toàn bộ lượt chạy (quota tác vụ) bị tính là THẤT BẠI.
