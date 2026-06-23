/* ============================================
   M.A.P.L.E — MediaWiki:DongGop.js
   Trang Đóng Góp / Bắt Đầu — hướng dẫn người mới cộng tác
   Yêu cầu: TroGiup-Common.js (window.MHHelp) đã nạp trước (Common.js lo).
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
                crumb:   'Đóng Góp',
                eyebrow: 'Người mới bắt đầu từ đây — 5 bước để trở thành cộng tác viên M.A.P.L.E',
                title:   'ĐÓNG GÓP <em>& BẮT ĐẦU</em>',
                sub:     'Mọi tài liệu trong Maze đều do cộng đồng viết nên. Đây là chỗ của bạn.'
            })));

            /* 01 — Lộ trình 5 bước */
            var s1 = MH.section({ tag: '01 <em>//</em> Lộ trình', heading: 'Năm bước đầu tiên' });
            s1.appendChild(MH.steps([
                { main: 'Tạo tài khoản', sub: 'Đăng ký miễn phí qua Miraheze để mở khoá quyền chỉnh sửa.' },
                { main: 'Đọc Hướng Dẫn Viết', sub: 'Nắm tiêu chuẩn biên soạn hồ sơ thực thể / vật phẩm / nhật ký.' },
                { main: 'Đọc Quy Tắc', sub: 'Hiểu nội quy & đạo đức cộng đồng trước khi đăng bài.' },
                { main: 'Viết bài đầu tiên', sub: 'Dùng bản mẫu chuẩn, gắn phân loại độ tuổi, thêm cảnh báo nếu cần.' },
                { main: 'Gửi qua hàng chờ', sub: 'Bài được Kiểm Duyệt Viên xem xét. Sửa theo góp ý và bài sẽ lên Kho Lưu Trữ.' }
            ]));
            page.appendChild(s1);

            /* 02 — Bạn có thể đóng góp gì */
            var s2 = MH.section({ tag: '02 <em>//</em> Hình thức', heading: 'Bạn có thể làm gì?' });
            s2.appendChild(MH.prose([
                '<strong>Viết hồ sơ thực thể/vật phẩm/nhật ký</strong> — mở rộng thế giới Maze.',
                '<strong>Cải thiện bài có sẵn</strong> — sửa chính tả, bổ sung chi tiết, gắn cảnh báo còn thiếu.',
                '<strong>Tham gia thảo luận & sự kiện</strong> — góp ý, bình chọn, viết blog cộng đồng.'
            ]));
            page.appendChild(s2);

            /* 03 — Liên kết nhanh */
            var s3 = MH.section({ tag: '03 <em>//</em> Bắt đầu ngay', heading: 'Liên kết hữu ích' });
            var bs = MH.btns();
            bs.appendChild(MH.btn('/wiki/Special:CreateAccount', 'Tạo tài khoản', true));
            bs.appendChild(MH.btn('/wiki/H%C6%B0%E1%BB%9Bng_D%E1%BA%ABn_Vi%E1%BA%BFt', 'Hướng Dẫn Viết'));
            bs.appendChild(MH.btn('/wiki/Quy_T%E1%BA%AFc', 'Quy Tắc'));
            bs.appendChild(MH.btn('/wiki/Tr%E1%BB%A3_gi%C3%BAp', 'Trợ Giúp'));
            s3.appendChild(bs);
            page.appendChild(s3);

            /* FAQ */
            var sf = MH.section({ tag: '04 <em>//</em> FAQ', heading: 'Câu hỏi thường gặp' });
            sf.appendChild(MH.faq([
                { q: 'Tôi chưa biết wikitext, viết được không?', a: 'Được. Trình soạn thảo M.A.P.L.E có thanh công cụ hỗ trợ. Xem thêm <a href="/wiki/Tr%E1%BB%A3_gi%C3%BAp">Trợ Giúp</a>.' },
                { q: 'Bao lâu thì bài được duyệt?', a: 'Tuỳ số lượng hàng chờ và Kiểm Duyệt Viên trực. Hãy kiên nhẫn và theo dõi phản hồi.' },
                { q: 'Tôi có cần xin phép trước khi viết?', a: 'Không. Cứ viết theo Hướng Dẫn Viết & Quy Tắc. Nếu trùng chủ đề, hãy phối hợp với tác giả gốc.' }
            ]));
            page.appendChild(sf);

            page.appendChild(MH.stuck({
                tag:  'Vẫn bối rối khi bắt đầu?',
                text: 'Nhắn đội ngũ quản trị — chúng tôi sẵn sàng dẫn bạn đi từng bước.'
            }));
        });
    }

    if (window.MHHelp) build(window.MHHelp);
    else if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(build);
})();
