/* ============================================
   M.A.P.L.E — MediaWiki:DieuKhoan-KiemDuyet.js
   Điều Khoản — Kiểm Duyệt Từ Ngữ (2 bản theo độ tuổi)
   Giải thích logic bộ lọc 18+ vs 13–17. Trang con: Điều Khoản/Kiểm Duyệt.
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
                crumb:   'Điều Khoản Kiểm Duyệt Từ Ngữ',
                eyebrow: 'Moderation Policy v2.0 — Có hiệu lực từ 2026-06-18',
                title:   'KIỂM DUYỆT <em>TỪ NGỮ</em>',
                sub:     'M.A.P.L.E lọc từ ngữ theo HAI bản tuỳ độ tuổi: người lớn (18+) và dưới 18 (13–17). Bản dưới 18 nghiêm ngặt hơn để bảo vệ trẻ em.'
            })));

            /* 01 — Hai bản */
            var s1 = MH.section({ tag: '01 <em>//</em> Tổng quan', heading: 'Hai bản kiểm duyệt' });
            s1.appendChild(MH.infobox(
                'Mọi nội dung bạn gửi (bình luận, tin nhắn Chat, bài viết) đều được lọc từ ngữ. ' +
                'Hệ thống chọn <strong>một trong hai bản</strong> dựa trên độ tuổi của bạn — ' +
                'bản dưới 18 tuổi chặn nhiều hơn để phù hợp lứa tuổi.'));
            s1.appendChild(MH.roles([
                { role: '18+',   items: ['Bộ lọc tiêu chuẩn', 'Chặn tục tĩu / đe doạ / spam / lộ thông tin', 'Cho phép thảo luận chủ đề người lớn ở mức cho phép'] },
                { role: '13–17', items: ['Bộ lọc NGHIÊM NGẶT hơn', 'Chặn THÊM từ 18+/gợi dục rõ ràng', 'Chặn link 16+ (cờ bạc, nội dung người lớn)', 'Hạ ngưỡng cảnh báo → chặn', 'Chặt thông tin cá nhân (trường, lớp, MXH)'] }
            ]));
            page.appendChild(s1);

            /* 02 — Khác biệt cụ thể */
            var s2 = MH.section({ tag: '02 <em>//</em> Khác biệt', heading: 'Bản dưới 18 gắt hơn ở đâu?' });
            s2.appendChild(MH.steps([
                { main: 'Chặn thêm từ 18+/gợi dục rõ ràng', sub: 'Các từ tình dục/khiêu dâm tường minh bị chặn ở bản dưới 18, kể cả khi bản 18+ có thể cho qua.' },
                { main: 'Chặn link 16+', sub: 'Liên kết tới cờ bạc/cá cược trực tuyến và nội dung người lớn mức 16+ bị chặn (bản 18+ chỉ chặn 18+/bất hợp pháp).' },
                { main: 'Hạ ngưỡng cảnh báo → chặn', sub: 'Một số nội dung chỉ "nhắc nhở" ở bản 18+ (ví dụ viết toàn chữ hoa) sẽ bị chặn ở bản dưới 18.' },
                { main: 'Chặt thông tin cá nhân', sub: 'Chia sẻ tên trường, lớp, tài khoản mạng xã hội, địa chỉ… bị chặn chặt hơn để bảo vệ bạn khỏi bị lần ra ngoài đời.' }
            ]));
            page.appendChild(s2);

            /* 03 — Chống báo nhầm */
            var s3 = MH.section({ tag: '03 <em>//</em> Chống nhầm', heading: 'Vì sao bạn không bị chặn oan?' });
            s3.appendChild(MH.prose([
                'Bộ lọc chỉ siết các từ tục/18+ RÕ RÀNG. Những từ tiếng Việt đa nghĩa như "thuốc lá", "rượu", "bia", "cờ bạc", "cá độ" KHÔNG bị thêm vào danh sách chặn vì dễ nhầm với câu bình thường (ví dụ "thuốc là gì").',
                'Hệ thống khớp tiếng Việt theo DẤU chính xác và theo cụm có nghĩa xấu, kèm danh sách từ trắng — nên "các", "lớn", "cắt", "đường"… luôn được cho qua ở cả hai bản.'
            ]));
            page.appendChild(s3);

            /* 04 — Xác định tuổi */
            var s4 = MH.section({ tag: '04 <em>//</em> Độ tuổi', heading: 'Hệ thống biết tuổi bạn thế nào?' });
            s4.appendChild(MH.steps([
                { main: 'Khi đăng ký', sub: 'Bạn chọn nhóm tuổi (13+/16+/18+) ở bước "Độ tuổi". Lựa chọn này quyết định bản kiểm duyệt áp dụng.' },
                { main: 'Khi chưa rõ tuổi', sub: 'Nếu hệ thống không biết tuổi (tài khoản cũ, xoá dữ liệu trình duyệt), nó áp bản DƯỚI 18 (chặt hơn) để an toàn, và sẽ hỏi bạn khi lần đầu dùng Chat/Bình luận.' },
                { main: 'Đổi chế độ', sub: 'Vào trang cá nhân của bạn → mục "Chế độ nội dung" để xác nhận đủ 18 tuổi (nới) hoặc hạ về dưới 18 bất cứ lúc nào.' }
            ]));
            s4.appendChild(MH.infobox(
                'Khai gian tuổi để nới bộ lọc là <strong>vi phạm điều khoản</strong>. Xem ' +
                '<a href="/wiki/%C4%90i%E1%BB%81u_Kho%E1%BA%A3n/Gi%E1%BB%9Bi_H%E1%BA%A1n_Tu%E1%BB%95i">Chính sách Giới Hạn Tuổi</a>.', true));
            page.appendChild(s4);

            /* 05 — Luôn chặn */
            var s5 = MH.section({ tag: '05 <em>//</em> Tuyệt đối', heading: 'Nội dung bị chặn ở CẢ HAI bản' });
            s5.appendChild(MH.infobox(
                'Bất kể độ tuổi, các nội dung sau bị <strong>chặn vĩnh viễn</strong> và có thể bị báo cáo: ' +
                'lạm dụng trẻ em (CSAM) · hướng dẫn vũ khí/chất nổ · buôn ma tuý/dữ liệu trộm · khủng bố · ' +
                'spam · lộ thông tin cá nhân · liên kết dark web / lừa đảo / mã độc.', true));
            page.appendChild(s5);

            /* FAQ */
            var sf = MH.section({ tag: '06 <em>//</em> FAQ', heading: 'Câu hỏi thường gặp' });
            sf.appendChild(MH.faq([
                { q: 'Tôi đủ 18 nhưng bị chặn từ người lớn?', a: 'Có thể tài khoản đang ở chế độ dưới 18 (mặc định khi chưa rõ tuổi). Vào trang cá nhân → "Chế độ nội dung" → xác nhận đủ 18 tuổi.' },
                { q: 'Tôi viết câu bình thường mà bị chặn?', a: 'Bộ lọc tránh từ đa nghĩa, nhưng nếu vẫn bị nhầm, hãy báo cho BQT để chỉnh. Hệ thống không tự ý mở rộng sang từ dễ nhầm.' },
                { q: 'Đổi sang 18+ có mở khoá nội dung 18+ không?', a: 'Nó chỉ thay đổi mức LỌC TỪ NGỮ và link khi bạn gửi/đi tới. Nội dung hiển thị vẫn theo Chính sách Giới Hạn Tuổi riêng.' }
            ]));
            page.appendChild(sf);

            page.appendChild(MH.stuck({
                tag:  'Cần hỗ trợ?',
                text: 'Nếu bạn cho rằng nội dung bị chặn nhầm, liên hệ BQT qua email mapleofficialvn@gmail.com hoặc trang Phản hồi.'
            }));
        });
    }

    if (window.MHHelp) build(window.MHHelp);
    else if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(build);
})();
