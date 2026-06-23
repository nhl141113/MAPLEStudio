/**
 * M.A.P.L.E — MediaWiki:TroGiup-DangKy.js  (mhd3)
 * Trang Trợ_giúp:Đăng_ký
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/[Đd][aă]ng.*[Kk][yý]/i.test(decoded)) return;
    if (pn && pn !== 'Trợ_giúp:Đăng_ký' && !/[Đd][aă]ng.*[Kk][yý]/i.test(decoded)) return;

    function whenReady(cb) {
        if (window.MHHelp) return cb(window.MHHelp);
        if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(function (H) { if (H) cb(H); });
        var n = 0, t = setInterval(function () {
            if (window.MHHelp) { clearInterval(t); cb(window.MHHelp); }
            else if (++n > 40) clearInterval(t);
        }, 50);
    }

    function build() {
      whenReady(function (H) {
        H.mount(function (page) {
            page.appendChild(H.hero({
                crumb: 'Đăng Ký',
                eyebrow: 'Bắt đầu — Đăng ký tài khoản',
                title: 'ĐĂNG <em>KÝ</em>',
                sub: 'Tạo tài khoản, quyền hạn thành viên và trang cá nhân.'
            }));

            var s1 = H.section({ id: 'why', tag: '01 <em>//</em> Lý do', heading: 'Tại Sao Cần Tài Khoản?' });
            s1.appendChild(H.prose('Không có tài khoản, bạn chỉ có thể đọc nội dung ở mức hạn chế — không thể tạo trang mới, chỉnh sửa, xem tài liệu từ 16+ trở lên, hoặc sử dụng các tính năng tùy chỉnh của wiki.'));
            s1.appendChild(H.infobox('<strong>Miễn phí:</strong> đăng ký không tốn phí và không yêu cầu thông tin cá nhân ngoài địa chỉ email.'));
            page.appendChild(s1);

            var s2 = H.section({ id: 'how', tag: '02 <em>//</em> Các bước', heading: 'Cách Đăng Ký' });
            s2.appendChild(H.steps([
                { main: 'Nhấn <strong>"Tạo tài khoản"</strong> ở góc trên bên phải trang wiki', sub: 'Hoặc vào: <a href="/wiki/Special:CreateAccount">Special:CreateAccount</a>' },
                { main: 'Điền <strong>tên người dùng</strong>', sub: 'Tên hiển thị công khai trên mọi chỉnh sửa. Chọn tên phù hợp phong cách M.A.P.L.E (ví dụ: Agent_07, Dr_Reyes…)' },
                { main: 'Điền mật khẩu và xác nhận mật khẩu' },
                { main: 'Điền địa chỉ email', sub: 'Khuyến nghị — cần thiết để khôi phục mật khẩu' },
                { main: 'Nhấn <strong>"Tạo tài khoản của bạn"</strong>' },
                { main: 'Xin cấp quyền Writer để bắt đầu đóng góp', sub: 'Nhắn cho admin qua MAPLE Chat (nút bên dưới)' },
            ]));
            s2.appendChild(H.infobox('<strong>Xin quyền Writer:</strong> tài khoản mới chưa tự động có quyền tạo bài. Nhắn cho admin để được cấp quyền Writer.'));
            var s2b = H.btns();
            s2b.appendChild(H.contactAdminBtn('↗ Xin quyền Writer', true));
            s2.appendChild(s2b);
            page.appendChild(s2);

            var s3 = H.section({ id: 'roles', tag: '03 <em>//</em> Quyền hạn', heading: 'Quyền Hạn Thành Viên' });
            s3.appendChild(H.roles([
                { role: 'Tài Khoản Mới', items: ['Đọc tất cả tài liệu (kể cả 18+)', 'Chat / Bình chọn / Khiếu nại'] },
                { role: 'Writer', edit: true, items: ['Tất cả quyền Tài Khoản Mới', 'Tạo trang mới', 'Sửa trang do mình tạo', 'Yêu cầu bản mẫu mới'] },
                { role: 'Kiểm Duyệt Viên', edit: true, items: ['Tất cả quyền Writer', 'Truy cập trang riêng Admin', 'Duyệt / từ chối bài', 'Cấm thành viên vi phạm'] },
                { role: 'Lập Trình Viên', edit: true, items: ['Tất cả quyền Writer', 'Tạo/sửa trang MediaWiki', 'Chỉnh sửa file .js / .css'] },
                { role: 'Quản Trị Viên', edit: true, items: ['Xóa & khôi phục trang', 'Khóa / mở khóa trang', 'Cấm thành viên', 'Toàn quyền MediaWiki'] },
            ]));
            page.appendChild(s3);

            var s4 = H.section({ id: 'userpage', tag: '04 <em>//</em> Cá nhân', heading: 'Trang Cá Nhân' });
            s4.appendChild(H.prose([
                'Sau khi đăng ký, bạn có trang cá nhân tại Người_dùng:[TênCủaBạn]. Dùng để giới thiệu bản thân, lưu bản nháp bài viết, và theo dõi công việc đang làm.',
                'Bài viết nháp lưu tại Người_dùng:[Tên]/Chờ_Duyệt. Khi sẵn sàng, gửi lên hàng chờ để admin xem xét trước khi chuyển sang không gian chính thức.'
            ]));
            page.appendChild(s4);
        });
      });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
