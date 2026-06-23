/* ============================================
   M.A.P.L.E — MediaWiki:DieuKhoan-GioiHanTuoi.js
   Điều Khoản — Giới Hạn Tuổi & Xác Nhận Tuổi
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
                crumb:   'Điều Khoản Giới Hạn Tuổi',
                eyebrow: 'Age Policy v1.0 — Có hiệu lực từ 2026-01-01',
                title:   'GIỚI HẠN <em>TUỔI</em>',
                sub:     'Quy định về độ tuổi tối thiểu, phân loại nội dung theo tuổi, và trách nhiệm khi khai gian tuổi.'
            })));

            /* 01 — Tuổi tối thiểu */
            var s1 = MH.section({ tag: '01 <em>//</em> Tuổi tối thiểu', heading: 'Yêu cầu độ tuổi' });
            s1.appendChild(MH.infobox(
                'Theo Điều Kiện Dịch Vụ của <strong>Miraheze</strong> (nền tảng máy chủ Wiki): ' +
                'người dùng phải từ <strong>≥ 13 tuổi</strong> mới được tạo tài khoản. ' +
                'Wiki không chịu trách nhiệm nếu tài khoản vi phạm quy tắc này.'));
            s1.appendChild(MH.roles([
                { role: '13+', items: ['Công khai cho tất cả', 'Lore chính, nhân vật, thảo luận thông thường', 'Không cần xác minh tuổi'] },
                { role: '16+', items: ['Bạo lực điều độ, chủ đề tâm lý nặng', 'Nội dung gợi dục nhẹ', 'Khuyến cáo: người 13–15 cần sự đồng ý phụ huynh'] },
                { role: '18+', items: ['Chỉ người ≥ 18 tuổi', 'Tình dục rõ ràng, bạo lực cực độ', 'Yêu cầu tự xác nhận tuổi trong cài đặt'] }
            ]));
            s1.appendChild(MH.infobox(
                'Độ tuổi của bạn còn quyết định <strong>mức lọc từ ngữ</strong> khi bình luận / chat: ' +
                'người dưới 18 dùng bộ lọc nghiêm ngặt hơn. Xem chi tiết: ' +
                '<a href="/wiki/%C4%90i%E1%BB%81u_Kho%E1%BA%A3n/Ki%E1%BB%83m_Duy%E1%BB%87t">Điều Khoản Kiểm Duyệt Từ Ngữ</a>.'));
            page.appendChild(s1);

            /* 02 — Xác minh tuổi */
            var s2 = MH.section({ tag: '02 <em>//</em> Xác minh', heading: 'Cách xác minh tuổi (nội dung 18+)' });
            s2.appendChild(MH.steps([
                { main: 'Người dùng tự xác nhận', sub: 'Chọn "Tôi ≥ 18 tuổi" trong cài đặt tài khoản. Wiki ghi nhận và lưu vào session.' },
                { main: 'Không xác minh bằng giấy tờ', sub: 'Wiki chỉ dựa trên tuyên bố của bạn. Nếu bạn khai gian → toàn bộ trách nhiệm thuộc về bạn.' },
                { main: 'Xác minh lại khi cần', sub: 'Nếu xóa cookie hoặc đăng xuất → phải xác minh lại.' }
            ]));
            page.appendChild(s2);

            /* 03 — Khai gian tuổi */
            var s3 = MH.section({ tag: '03 <em>//</em> Khai gian', heading: 'Trách nhiệm khi khai gian tuổi' });
            s3.appendChild(MH.infobox(
                'Nếu bạn khai gian tuổi: <strong>Wiki không chịu trách nhiệm</strong> · ' +
                'Bạn vi phạm Điều Kiện Dịch Vụ · Tài khoản có thể bị xóa ngay · Không có quyền kháng cáo.', true));
            s3.appendChild(MH.steps([
                { main: 'Cảnh báo lần 1', sub: 'BQT thông báo qua MAPLE Chat hoặc Thông báo. Yêu cầu xác thực hoặc xóa tài khoản trong 7 ngày.' },
                { main: 'Cảnh báo lần 2', sub: 'Khóa tài khoản tạm thời 30 ngày.' },
                { main: 'Vi phạm lặp lại (3+ lần)', sub: 'Xóa tài khoản vĩnh viễn. Không thể kháng cáo.' }
            ]));
            page.appendChild(s3);

            /* 04 — Phụ huynh */
            var s4 = MH.section({ tag: '04 <em>//</em> Phụ huynh', heading: 'Dành cho phụ huynh & người giám hộ' });
            s4.appendChild(MH.prose([
                'Wiki cung cấp các nhãn cảnh báo tuổi (13+, 16+, 18+) nhưng không thể ngăn chặn 100% nếu trẻ tự ý truy cập.',
                'Wiki khuyến khích phụ huynh: quản lý mật khẩu tài khoản con em, hạn chế truy cập nội dung 18+ ở mức router/thiết bị.'
            ]));
            s4.appendChild(MH.steps([
                { main: 'Quyền của phụ huynh', sub: 'Yêu cầu xóa tài khoản con em (gửi email xác thực danh tính) · Báo cáo nội dung không phù hợp độ tuổi · Yêu cầu BQT hạn chế quyền truy cập.' },
                { main: 'Cách liên hệ', sub: 'Email: mapleofficialvn@gmail.com · Nội dung: tên tài khoản + lý do + yêu cầu. BQT xem xét trong 7 ngày.' }
            ]));
            page.appendChild(s4);

            /* 05 — Luật quốc tế */
            var s5 = MH.section({ tag: '05 <em>//</em> Pháp lý', heading: 'Quy định quốc tế' });
            s5.appendChild(MH.prose([
                'Wiki vận hành trên hạ tầng Miraheze (Hoa Kỳ & Anh), áp dụng GDPR (bảo vệ dữ liệu người < 16 tuổi tại EU) và luật Hoa Kỳ.',
                'Một số quốc gia có quy định tuổi khác (VD: Hàn Quốc = 18+). Wiki dùng tiêu chuẩn quốc tế (13+ cơ bản + xác minh 18+). Bạn tự chịu trách nhiệm tuân thủ luật địa phương.'
            ]));
            page.appendChild(s5);

            /* FAQ */
            var sf = MH.section({ tag: '06 <em>//</em> FAQ', heading: 'Câu hỏi thường gặp' });
            sf.appendChild(MH.faq([
                { q: 'Tôi 15 tuổi có xem được nội dung 16+ không?', a: 'Được nếu có sự đồng ý của phụ huynh. Wiki không xác minh điều này — đây là trách nhiệm gia đình. Wiki chỉ gắn nhãn cảnh báo.' },
                { q: 'Tôi chọn "Tôi ≥ 18" nhưng thực ra chưa đủ tuổi, có sao không?', a: 'Đây là khai gian tuổi. Nếu bị phát hiện → tài khoản bị xóa không kháng cáo. Wiki không chịu trách nhiệm về hậu quả.' },
                { q: 'Nội dung 18+ của Wiki có hợp pháp không?', a: 'Có, trong giới hạn luật Hoa Kỳ. Tuyệt đối cấm nội dung liên quan đến người dưới 18 tuổi (CSAM) — vi phạm = báo cáo cơ quan pháp luật ngay.' }
            ]));
            page.appendChild(sf);

            page.appendChild(MH.stuck({
                tag:  'Phụ huynh cần hỗ trợ?',
                text: 'Liên hệ BQT qua email mapleofficialvn@gmail.com để yêu cầu hỗ trợ liên quan đến tài khoản con em.'
            }));
        });
    }

    if (window.MHHelp) build(window.MHHelp);
    else if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(build);
})();
