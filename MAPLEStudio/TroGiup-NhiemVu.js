/**
 * M.A.P.L.E — MediaWiki:TroGiup-NhiemVu.js  (mhd3)
 * Trang Trợ_giúp:Nhiệm_Vụ — hướng dẫn người mới về tính năng Nhiệm Vụ + RP.
 * Nguồn: tro giup/15_Nhiem_Vu.txt
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/Nhi[eệ]m.*V[uụ]/i.test(decoded)) return;
    if (pn && !/Nhi[eệ]m.*V[uụ]/i.test(decodeURIComponent(pn)) && !/Nhi[eệ]m.*V[uụ]/i.test(decoded)) return;

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
        });
    }

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
                crumb: 'Nhiệm Vụ',
                eyebrow: 'Hướng dẫn — Việc cần làm',
                title: 'NHIỆM VỤ <em>THỰC ĐỊA</em>',
                sub: 'Hoàn thành nhiệm vụ M.A.P.L.E giao để tự động nhận Điểm Uy Tín (RP).'
            }));

            /* 1. Giới thiệu */
            var s1 = H.section({ tag: '01 <em>//</em> Tổng quan', heading: 'Nhiệm Vụ là gì?' });
            s1.appendChild(H.prose(
                'Nhiệm Vụ là cách M.A.P.L.E “giao việc” cho thành viên. Hoàn thành nhiệm vụ sẽ ' +
                '<strong>tự động cộng Điểm Uy Tín (RP)</strong> vào hồ sơ của bạn — không cần xin, ' +
                'không cần ai duyệt thủ công. Hệ thống tự kiểm tra hoạt động thật của bạn rồi trao điểm.'
            ));
            s1.appendChild(H.infobox('Truy cập tại trang <a href="/wiki/Nhiệm_Vụ"><strong>Nhiệm Vụ</strong></a>. Cần đăng nhập để theo dõi tiến độ.'));
            page.appendChild(s1);

            /* 2. Ba loại nhiệm vụ */
            var s2 = H.section({ tag: '02 <em>//</em> Phân loại', heading: 'Ba loại nhiệm vụ' });
            s2.appendChild(H.prose([
                '<strong>📅 NGÀY</strong> — làm mới mỗi ngày (điểm danh, đọc vài hồ sơ). RP nhỏ, dễ lấy.',
                '<strong>🗓️ TUẦN</strong> — làm mới mỗi tuần (viết 1 bài, giữ chuỗi 7 ngày). RP vừa.',
                '<strong>🏆 THÁNG</strong> — làm mới mỗi tháng (viết 3 bài, đọc 50 hồ sơ). RP lớn nhất.'
            ]));
            s2.appendChild(H.prose(
                'Mỗi loại tự đặt lại khi sang chu kỳ mới: nhiệm vụ ngày reset lúc 0h, nhiệm vụ tuần ' +
                'reset đầu tuần, nhiệm vụ tháng reset đầu tháng.'
            ));
            page.appendChild(s2);

            /* 3. Cách hoàn thành */
            var s3 = H.section({ tag: '03 <em>//</em> Hướng dẫn', heading: 'Cách hoàn thành & nhận RP' });
            s3.appendChild(H.steps([
                { main: 'Mở trang <strong>Nhiệm Vụ</strong>', sub: 'Cần đăng nhập tài khoản.' },
                { main: 'Xem 3 tab Ngày / Tuần / Tháng', sub: 'Mỗi thẻ có thanh tiến độ (đã làm / mục tiêu).' },
                { main: 'Hoạt động bình thường trên wiki', sub: 'Đọc hồ sơ, điểm danh, viết bài…' },
                { main: 'Mở lại trang Nhiệm Vụ khi đủ điều kiện', sub: 'Hệ thống tự cộng RP, hiện “✨ +N RP”, thẻ chuyển “✓ ĐÃ NHẬN RP”.' }
            ]));
            s3.appendChild(H.infobox(
                'RP của mỗi nhiệm vụ chỉ nhận <strong>một lần</strong> trong mỗi chu kỳ. Tải lại trang ' +
                'không cộng thêm. Sang chu kỳ mới, nhiệm vụ đó lại có thể làm lại.'
            ));
            page.appendChild(s3);

            /* 4. Cách kiểm tra điều kiện */
            var s4 = H.section({ tag: '04 <em>//</em> Minh bạch', heading: 'Điều kiện được kiểm tra thế nào?' });
            s4.appendChild(H.prose(
                'Hệ thống <strong>không tin số bạn tự khai</strong> — nó kiểm tra từ dữ liệu thật:'
            ));
            s4.appendChild(H.prose([
                '<strong>Đọc hồ sơ</strong> → đếm số bài bạn thật sự mở (đồng bộ theo tài khoản).',
                '<strong>Điểm danh / chuỗi ngày</strong> → tính theo lịch sử đăng nhập của bạn.',
                '<strong>Bài được duyệt</strong> → đếm các bài do bạn viết và đã được Kiểm Duyệt Viên duyệt.'
            ]));
            s4.appendChild(H.infobox('Cách “hoàn thành” duy nhất là thật sự làm — đọc thật, viết thật. Không có mẹo lách.', true));
            page.appendChild(s4);

            /* 5. RP để làm gì */
            var s5 = H.section({ tag: '05 <em>//</em> Phần thưởng', heading: 'Điểm Uy Tín (RP) dùng để làm gì?' });
            s5.appendChild(H.prose(
                'RP tích lũy nâng <strong>Cấp Uy Tín</strong> của bạn (Người Mới → Tin Cậy → Cộng Tác → ' +
                'Kỳ Cựu → Huyền Thoại) và mở khóa khung/huy hiệu hiển thị trên trang cá nhân. ' +
                'Xem chi tiết tại trang <a href="/wiki/Thành_Tựu">Thành Tựu</a>.'
            ));
            page.appendChild(s5);

            /* 6. FAQ */
            var s6 = H.section({ tag: '06 <em>//</em> FAQ', heading: 'Câu hỏi thường gặp' });
            s6.appendChild(H.faq([
                { q: 'Tôi đã đọc đủ bài mà tiến độ chưa tăng?',
                  a: esc('Thử tải lại trang Nhiệm Vụ. Tiến độ đọc được tính khi bạn ở lại trang đủ lâu (không tính lướt qua). Mỗi bài chỉ tính 1 lần trong chu kỳ.') },
                { q: 'Tôi không thấy nhiệm vụ nào?',
                  a: esc('Có thể Ban Quản Trị chưa giao nhiệm vụ cho chu kỳ này, hoặc bạn chưa đăng nhập.') },
                { q: 'RP có bị mất khi sang chu kỳ mới không?',
                  a: esc('Không. RP đã nhận là của bạn vĩnh viễn. Chỉ có nhiệm vụ được làm mới.') },
                { q: 'Ai tạo ra nhiệm vụ và quyết định mức RP?',
                  a: esc('Chỉ Ban Quản Trị (Admin/Kiểm Duyệt Viên). Danh sách có thể thay đổi theo từng đợt — hãy ghé thường xuyên.') }
            ]));
            page.appendChild(s6);

            page.appendChild(H.stuck({
                tag: 'Cần hỗ trợ?',
                text: 'Gặp vấn đề với nhiệm vụ hoặc RP? Nhắn trực tiếp cho đội ngũ quản trị qua MAPLE Chat.'
            }));
        });
      });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
