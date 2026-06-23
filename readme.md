# 🍁 M.A.P.L.E Wiki — Central Archive System

Chào mừng đến với mã nguồn giao diện và hệ thống của **M.A.P.L.E Wiki** (Mapping, Assessment, Protocol, Logistics, Education). Đây là một hệ thống Wiki tùy chỉnh cao độ chạy trên nền tảng MediaWiki (Miraheze), được thiết kế để mô phỏng một cơ sở dữ liệu của một tổ chức giả tưởng đang nghiên cứu và sinh tồn trong "The Maze".

Dự án sử dụng JavaScript (JS) và CSS thuần để "khoác áo mới" hoàn toàn cho MediaWiki, mang đến trải nghiệm như một ứng dụng web hiện đại (SPA) với giao diện Dark Mode (JetBrains Mono, Đen/Đỏ), hệ thống Chat realtime, Gamification, và các hiệu ứng màn hình (Scanline, Noise, Glitch).

---

## 📂 Cấu trúc Thư mục

- **`MediaWiki/`**: Trái tim của dự án. Chứa toàn bộ các file `.js` và `.css`. Các file này cần được copy và dán vào không gian tên `MediaWiki:` tương ứng trên Wiki (VD: `MediaWiki:Common.js`).
- **`else/`**: Chứa các file nháp (Draft), text thô, thiết kế hệ thống (Design Docs), và cốt truyện (Lore) chưa được đưa lên Wiki hoặc đang chờ code giao diện.
- **`tro giup/`**: Các bản nháp văn bản thuần túy cho mục Trợ giúp, FAQ.
- **`Updatalog.txt`**: Nhật ký cập nhật (Changelog) cực kỳ chi tiết của dự án, ghi chép lại mọi thay đổi kiến trúc và tính năng.
    
---

## 🌟 Các Hệ Thống Cốt Lõi (Core Systems)

### 1. Giao diện & Trải nghiệm (UI/UX)
- **`Common.css` / `Common.js`**: Nền tảng boot của Wiki. Xử lý logic tải module (`loadAsync`), khởi tạo hiệu ứng toàn cục (Noise, Scanline, Vignette), SEO, và quản lý Giấy phép.
- **`GlobalNav.js`**: Thanh điều hướng toàn cục, Sidebar, Burger Menu, Nút Chat nhanh, và Dropdown Tài khoản.
- **`Welcome.js`**: Hệ thống *Welcome Tour* hướng dẫn tân thủ tương tác trực tiếp qua từng trang (kích hoạt bằng đuôi `/welcome`).

### 2. Tương tác Cộng đồng & Gamification
- **`UserPage.js`**: Ghi đè trang cá nhân (`Người_dùng:Tên`) thành App Profile với 6 tab (Tổng quan, Đóng góp, Huy hiệu, Thành tựu, Bạn bè, Cài đặt). Hỗ trợ custom bio, banner, màu sắc.
- **`MAPLE-Chat.js`**: Hệ thống Chat nội bộ Realtime (1-1, Nhóm), Inbox, Kết bạn, với giao diện Floating Panel và Full-page App.
- **`AchievementCatalog.js` & `ThanhTuu.js`**: CSDL ~178 Thành tựu và 109 Huy hiệu, tính Điểm Uy Tín (RP) qua hoạt động (đọc, đăng nhập, viết bài).
- **`NhiemVu.js`**: Bảng công việc thực địa (Ngày/Tuần/Tháng), tự động kiểm chứng và cộng RP.

### 3. Tạo Bài & Lưu Trữ Nội Dung (Dossier)
- **`CreateDossier.js`**: Công cụ "Tạo Bài Mới" trực quan, điền form tự động sinh mã Wikitext chuẩn, hỗ trợ nhiều mẫu (Thực thể, Vật phẩm, Nhật ký, Sự kiện...).
- **`Dossier.js` & `RecordCard.js`**: Hệ thống render wikitext thành các thẻ hồ sơ bảo mật cao, hỗ trợ animation, rating, clearance level.
- **`KhoLuuTru-Article.js`**: Giao diện Bài viết mới với 2 tab (Tóm tắt / Thông tin Metadata), tích hợp bình luận và đánh giá.

### 4. Hệ Thống Kiểm Duyệt (Moderation)
- **`MAPLE-SubmitWait.js`**: Màn hình chờ + Quét bài viết phía Client (Client-check) chống spam, doxxing, toxic trước khi đẩy vào Hàng chờ (Pending).
- **`MAPLE-Moderation.js`**: Bộ lọc từ ngữ V2.0 cực mạnh, chia theo nhóm tuổi (13-17 chặt chẽ, 18+ nới lỏng). Khớp homoglyph, chặn link bẩn.
- **`Gadget-MapleCensor.js`**: Bảng điều khiển (Dashboard) dành cho Admin duyệt bài. Có AI nhận xét, chấm điểm rủi ro, phân loại tự động và tính thống kê.

### 5. Ecosystem & Tiện Ích
- **`MAPLE-Notify.js`**: Hệ thống đẩy thông báo chuông (Comments, Achievements, Moderation).
- **`MAPLE-OpenLink.js`**: Cổng chuyển hướng an toàn khi người dùng click vào Link ngoài (External Link Guard), chặn tuyệt đối Phishing/CSAM/Darkweb.
- **`WhatsNews.js`**: Cửa sổ "Có gì mới" tự động cập nhật, hỗ trợ nhúng trang thật (iframe) để tương tác trực tiếp hoặc hiển thị Mockup.

---

## 🗺️ Bản Đồ Đường Dẫn (Wiki Routes)

Để truy cập các tính năng, hãy vào các đường dẫn sau trên trình duyệt (thêm tiền tố domain Wiki của bạn):

### 🏠 Khu vực Chính (Main)
- `/wiki/Trang_Chính` — Trang chủ với các thông số realtime, Quick Access, và hệ thống tab.
- `/wiki/Kho_Lưu_Trữ` — Nơi tra cứu mọi hồ sơ (Thực thể, Vật phẩm, Nhật ký...).
- `/wiki/Thủ_Tục` — Cẩm nang các quy trình sinh tồn (SOP).
- `/wiki/Tạo_Bài_Mới` — Công cụ tạo hồ sơ chuẩn M.A.P.L.E.

### 👥 Khu vực Cộng đồng
- `/wiki/Thành_Tựu` — Bảng xếp hạng RP, danh sách các danh hiệu và huy hiệu.
- `/wiki/Nhiệm_Vụ` — Bảng nhiệm vụ nhận RP (Hàng ngày/Tuần/Tháng).
- `/wiki/Sự_Kiện` — Các cuộc thi, event đang và sắp diễn ra.
- `/wiki/Bảng_Tin` — Thông báo từ Ban Quản Trị.
- `/wiki/Dự_án:All_User` — Bảng danh sách toàn bộ thành viên.
- `/wiki/Donate` — Thông tin gây quỹ và ủng hộ dự án.
- `/wiki/Dự_án:Phản_hồi` — Trung tâm báo cáo lỗi, khiếu nại và góp ý.

### ⚙️ Cá Nhân & Hệ Thống
- `/wiki/User:[Tên_Bạn]` — Trang Hồ sơ cá nhân của bạn.
- `/wiki/User:[Tên_Bạn]/Chat` — Ứng dụng MAPLE Chat (Chế độ toàn trang).
- `/wiki/User:[Tên_Bạn]/Chờ_Duyệt` — Theo dõi các bài viết bạn đã gửi lên hàng chờ.
- `/wiki/Thông_báo/[Tên_Bạn]` — Xem chi tiết hộp thư thông báo (chuông).
- `/wiki/Admin:Censor` — Bảng kiểm duyệt (Dành riêng cho Kiểm Duyệt Viên / Admin).

### 📚 Tài liệu & Điều khoản (Docs)
- `/wiki/Trợ_giúp` — Trang hướng dẫn sử dụng hệ thống Wiki.
- `/wiki/Trợ_giúp:[Tên_Chủ_Đề]` — Các bài HD cụ thể (VD: *Avatar*, *CSS_JS*, *Wikitext*...).
- `/wiki/Hướng_Dẫn_Viết` — Tiêu chuẩn trình bày và biên soạn hồ sơ.
- `/wiki/Điều_Khoản` — Điều khoản sử dụng chính của M.A.P.L.E.
- `/wiki/Điều_Khoản/[Tính_năng]` — Các quy định nhỏ (VD: *Chat*, *Bình_Luận*, *Lọc_từ*...).
- `/wiki/Dự_án:Điều_khoản_nội_dung` — Điều khoản chi tiết dành cho Writer.
- `/wiki/Dự_án:Bản_quyền` — Tổng hợp về các Giấy phép (MCL, CC, M-SA).

---

## 🚀 Cách Cài Đặt / Cập Nhật

1. Copy toàn bộ text bên trong một file `.js` (hoặc `.css`) ở thư mục `MediaWiki/`.
2. Lên Wiki, đăng nhập tài khoản có quyền (Interface Administrator).
3. Truy cập vào thanh tìm kiếm: `MediaWiki:[Tên file]` (VD: `MediaWiki:MAPLE-Chat.js`).
4. Nếu trang không tồn tại, tạo mới. Nếu đã có, bấm **Chỉnh sửa**.
5. Dán mã nguồn vào, lưu trang.
6. Ấn `Ctrl + F5` (hoặc xoá cache) để trải nghiệm thay đổi.

*(Lưu ý: Mọi module đều phải được khai báo trong `MediaWiki:Common.js` thông qua hàm `loadAsync()` hoặc `loadSequence()` mới có thể hoạt động).*

---
*M.A.P.L.E Wiki Developer Team - "We Map The Unknown"*