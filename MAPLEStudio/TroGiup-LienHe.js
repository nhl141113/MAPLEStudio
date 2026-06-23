/**
 * M.A.P.L.E — MediaWiki:TroGiup-LienHe.js  (mhd3 + MAPLE-Chat)
 * Trang Trợ_giúp:Liên_hệ
 * Nút hành động chính giờ MỞ MAPLE-Chat với admin (không trỏ trang tĩnh nữa).
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/Li[eê]n.*h[eệ]/i.test(decoded)) return;
    if (pn && pn !== 'Trợ_giúp:Liên_hệ' && !/Li[eê]n.*h[eệ]/i.test(decoded)) return;

    /* Chờ MHHelp (Common.js nạp TroGiup-Common trước; phòng race vẫn chờ qua hook) */
    function whenReady(cb) {
        if (window.MHHelp) return cb(window.MHHelp);
        if (typeof mw !== 'undefined' && mw.hook) {
            mw.hook('maple.help.ready').add(function (H) { if (H) cb(H); });
        }
        var n = 0, t = setInterval(function () {
            if (window.MHHelp) { clearInterval(t); cb(window.MHHelp); }
            else if (++n > 40) { clearInterval(t); }
        }, 50);
    }

    function build() {
      whenReady(function (H) {
        H.mount(function (page) {
            page.appendChild(H.hero({
                crumb: 'Liên Hệ',
                eyebrow: 'Cộng đồng — Liên hệ ban quản trị',
                title: 'LIÊN <em>HỆ</em>',
                sub: 'Nhắn trực tiếp cho admin qua MAPLE Chat, hoặc dùng các kênh phụ bên dưới.'
            }));

            /* ── 01 — Nhắn tin cho Admin (kênh chính) ── */
            var s1 = H.section({ id: 'chat', tag: '01 <em>//</em> Kênh chính', heading: 'Nhắn Tin Cho Admin' });
            s1.appendChild(H.prose(
                'Cách nhanh nhất để liên hệ là nhắn trực tiếp cho quản trị viên qua hệ thống ' +
                '<strong>MAPLE Chat</strong> — tin nhắn nội bộ ngay trên wiki, admin nhận thông báo và phản hồi sớm nhất. ' +
                'Bạn cần <strong>đăng nhập</strong> để dùng tính năng này.'));
            var s1b = H.btns();
            s1b.appendChild(H.contactAdminBtn('↗ Nhắn tin cho Admin', true));
            s1.appendChild(s1b);
            page.appendChild(s1);

            /* ── 02 — Kênh phụ ── */
            var s2 = H.section({ id: 'channels', tag: '02 <em>//</em> Kênh phụ', heading: 'Các Kênh Khác' });
            s2.appendChild(H.prose([
                '<strong>Gmail:</strong> mapleofficialvn@gmail.com · maplewikiofficialvn@gmail.com',
                '<strong>Discord:</strong> Server Discord chính thức M.A.P.L.E — phù hợp trao đổi nhanh, thời gian thực.',
                '<strong>Trang thảo luận bài viết:</strong> dùng tab “Thảo luận” khi vấn đề gắn với một trang cụ thể.'
            ]));
            s2.appendChild(H.infobox('<strong>Không spam:</strong> đừng gửi cùng một vấn đề nhiều lần — admin đọc theo thứ tự. Spam có thể khiến phản hồi chậm hoặc bị bỏ qua.', true));
            page.appendChild(s2);

            /* ── 03 — Vấn đề kỹ thuật ── */
            var s3 = H.section({ id: 'technical', tag: '03 <em>//</em> Kỹ thuật', heading: 'Vấn Đề Kỹ Thuật' });
            s3.appendChild(H.prose('Nếu gặp lỗi kỹ thuật (template không render, JS không chạy, CSS sai…), hãy thử các bước sau trước khi báo:'));
            s3.appendChild(H.steps([
                { main: 'Xóa cache trước', sub: 'Ctrl+F5 (Windows) / Cmd+Shift+R (Mac)' },
                { main: 'Mở console trình duyệt', sub: 'F12 → tab Console để xem lỗi JS cụ thể' },
                { main: 'Ghi lại thông tin', sub: 'Tên trang, trình duyệt đang dùng, nội dung lỗi hiển thị' },
                { main: 'Đính kèm ảnh chụp màn hình khi nhắn cho admin' }
            ]));
            page.appendChild(s3);

            /* ── 04 — Báo cáo vi phạm ── */
            var s4 = H.section({ id: 'report', tag: '04 <em>//</em> Báo cáo', heading: 'Báo Cáo Vi Phạm' });
            s4.appendChild(H.infobox('<strong>Không tự ý xóa:</strong> để admin xử lý đúng quy trình. Tự ý xóa nội dung người khác có thể bị coi là vi phạm.', true));
            s4.appendChild(H.prose(
                'Khi báo cáo, cung cấp: <strong>link trang vi phạm</strong>, <strong>điều khoản bị vi phạm</strong> (Điều mấy), ' +
                'và <strong>mô tả ngắn gọn</strong>. Với vi phạm Điều 3, ưu tiên Gmail hoặc Discord để xử lý nhanh nhất.'));
            page.appendChild(s4);

            /* ── 05 — Đề xuất ── */
            var s5 = H.section({ id: 'suggest', tag: '05 <em>//</em> Góp ý', heading: 'Đề Xuất & Góp Ý' });
            s5.appendChild(H.prose(
                'Muốn đề xuất template mới, tính năng, hoặc thay đổi quy tắc? Nhắn cho admin kèm mô tả rõ ý tưởng và lý do. ' +
                'BQT đọc tất cả đề xuất dù không phải lúc nào cũng thực hiện được ngay.'));
            s5.appendChild(H.infobox('<strong>Thời gian phản hồi:</strong> thường 24–48 giờ. Khẩn cấp → liên hệ đồng thời nhiều kênh.'));
            page.appendChild(s5);

            page.appendChild(H.stuck({
                tag: 'Cần hỗ trợ ngay?',
                text: 'Nhắn trực tiếp cho đội ngũ quản trị qua MAPLE Chat — chúng tôi sẽ xem xét cụ thể trường hợp của bạn.'
            }));
        });
      });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
