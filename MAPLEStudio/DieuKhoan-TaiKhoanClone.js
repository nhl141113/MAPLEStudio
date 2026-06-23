/* ============================================
   M.A.P.L.E — MediaWiki:DieuKhoan-TaiKhoanClone.js
   Điều Khoản — Tài Khoản Clone / Rối (Multi-Account)
   Yêu cầu: TroGiup-Common.js (window.MHHelp) đã nạp trước.
   ============================================ */
(function () {
    'use strict';

    function withLogo(MH, heroEl) {
        var logo = (window.MAPLE && window.MAPLE.logoSVG) ? window.MAPLE.logoSVG(56) : '';
        heroEl.insertBefore(MH.el('div', 'mhd3-hero-logo', logo), heroEl.firstChild);
        return heroEl;
    }

    function build(MH) {
        MH.mount(function (page) {

            page.appendChild(withLogo(MH, MH.hero({
                crumb:   'Điều Khoản Tài Khoản Clone',
                eyebrow: 'Multi-Account Policy v1.0 — Có hiệu lực từ 2026-01-01',
                title:   'TÀI KHOẢN <em>CLONE / RỐI</em>',
                sub:     'Quy tắc về việc sở hữu nhiều tài khoản, tài khoản giả mạo, và cách hệ thống phát hiện & xử lý vi phạm.'
            })));

            /* 01 — Nguyên tắc */
            var s1 = MH.section({ tag: '01 <em>//</em> Nguyên tắc', heading: 'Mỗi người — một tài khoản chính' });
            s1.appendChild(MH.infobox(
                '<strong>Mỗi người chỉ được phép 1 tài khoản hoạt động chính.</strong> ' +
                'Mục đích: hệ thống RP công bằng (không tự vote cho mình), ngăn spam, bảo vệ tính minh bạch cộng đồng.'));
            page.appendChild(s1);

            /* 02 — Khi nào được phép */
            var s2 = MH.section({ tag: '02 <em>//</em> Được phép', heading: 'Tài khoản phụ — khi nào được phép?' });
            s2.appendChild(MH.steps([
                { main: 'Tài khoản dự phòng (Backup)', sub: 'Khi tài khoản chính bị lỗi / không đăng nhập được. PHẢI thông báo BQT ngay. KHÔNG được hoạt động song song 2 tài khoản cùng lúc.' },
                { main: 'Tài khoản Bot / Tool (do BQT cấp phép)', sub: 'Phải đăng ký với BQT. Gắn nhãn "[Bot]" rõ ràng trong tên hoặc trang cá nhân. Chỉ hoạt động trong phạm vi BQT cho phép.' },
                { main: 'Tài khoản Test (do BQT/Dev)', sub: 'Chỉ dùng để thử tính năng mới. Phải được BQT phê duyệt. Không tương tác với cộng đồng.' }
            ]));
            s2.appendChild(MH.infobox(
                '<strong>Không được phép:</strong> Dùng tài khoản phụ để vote/react cho tài khoản chính · ' +
                'Né tránh lệnh cấm (ban evasion) · Giả vờ là người khác · ' +
                'Tạo tài khoản mới sau khi bị khóa mà không xin phép BQT.', true));
            page.appendChild(s2);

            /* 03 — Dấu hiệu nghi ngờ */
            var s3 = MH.section({ tag: '03 <em>//</em> Phát hiện', heading: 'Dấu hiệu bị nghi ngờ là clone' });
            s3.appendChild(MH.prose(['BQT có thể điều tra nếu phát hiện:']));
            s3.appendChild(MH.steps([
                { main: '2 tài khoản cùng IP hoặc thiết bị', sub: 'Hệ thống ghi nhận thông tin kỹ thuật khi đăng nhập.' },
                { main: 'Hành vi, văn phong rất giống nhau', sub: 'Cách viết, thời gian hoạt động, nội dung tương tác trùng khớp.' },
                { main: 'Tài khoản mới xuất hiện ngay sau khi bị khóa', sub: 'Đây là dấu hiệu rõ ràng nhất của ban evasion.' },
                { main: 'Tài khoản mới liên tục vote/bảo vệ tài khoản cũ', sub: 'Đặc biệt trong các tranh cãi cộng đồng.' }
            ]));
            page.appendChild(s3);

            /* 04 — Xử lý */
            var s4 = MH.section({ tag: '04 <em>//</em> Xử lý', heading: 'Hình phạt khi xác nhận là clone' });
            s4.appendChild(MH.steps([
                { main: 'Clone đơn giản (không cố tình lừa)', sub: 'Cảnh báo lần 1 + xóa tài khoản phụ. RP bị điều chỉnh (xóa RP kiếm từ tài khoản phụ).' },
                { main: 'Sockpuppet / Vote manipulation', sub: 'Xóa tài khoản phụ ngay · Trừ RP tài khoản chính (-50 tới -200 RP) · Khóa tài khoản chính 14–30 ngày.' },
                { main: 'Ban evasion (né tránh lệnh cấm)', sub: 'Xóa tài khoản mới ngay · Kéo dài thời gian khóa tài khoản chính · Tái phạm → khóa vĩnh viễn.' },
                { main: 'Mạo danh người khác', sub: 'Xóa tài khoản ngay · Khóa IP (nếu cần) · Có thể báo cáo lên Miraheze hoặc cơ quan pháp luật.' }
            ]));
            page.appendChild(s4);

            /* 05 — Tự khai báo */
            var s5 = MH.section({ tag: '05 <em>//</em> Tự khai', heading: 'Tự khai báo — giảm hình phạt' });
            s5.appendChild(MH.infobox(
                'Nếu bạn đang có tài khoản phụ vì lý do hợp lệ, hãy chủ động liên hệ BQT <strong>trước khi bị phát hiện</strong>. ' +
                'Tự khai = không bị xử phạt (nếu lý do hợp lý). Bị phát hiện = hình phạt nặng hơn nhiều.'));
            s5.appendChild(MH.prose([
                'Email: mapleofficialvn@gmail.com · Nội dung: tên 2 tài khoản + lý do tạo tài khoản phụ.'
            ]));
            page.appendChild(s5);

            /* FAQ */
            var sf = MH.section({ tag: '06 <em>//</em> FAQ', heading: 'Câu hỏi thường gặp' });
            sf.appendChild(MH.faq([
                { q: 'Tôi quên mật khẩu tài khoản cũ, tạo tài khoản mới có được không?', a: 'Được, nhưng phải thông báo BQT ngay. Ghi rõ tên tài khoản cũ + tên tài khoản mới + lý do. BQT sẽ hướng dẫn xử lý tài khoản cũ.' },
                { q: 'Tôi và người thân dùng chung máy tính, có bị nghi là clone không?', a: 'Có thể bị điều tra. Hãy chủ động email BQT giải thích tình huống để tránh hiểu nhầm.' },
                { q: 'Phát hiện ai đó đang dùng clone, tôi phải làm gì?', a: 'Báo cáo BQT qua email hoặc MAPLE Chat kèm bằng chứng (screenshot, tên 2 tài khoản). BQT sẽ điều tra.' },
                { q: 'Tài khoản bot có được phép không?', a: 'Có, nhưng phải đăng ký với BQT và gắn nhãn [Bot] rõ ràng. Bot không đăng ký = bị xóa.' }
            ]));
            page.appendChild(sf);

            page.appendChild(MH.stuck({
                tag:  'Cần khai báo tài khoản phụ?',
                text: 'Liên hệ BQT sớm nhất có thể. Tự khai trước khi bị phát hiện sẽ không bị xử phạt nếu lý do hợp lệ.'
            }));
        });
    }

    if (window.MHHelp) build(window.MHHelp);
    else if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(build);
})();
