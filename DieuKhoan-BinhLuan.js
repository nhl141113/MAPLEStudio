/* ============================================
   M.A.P.L.E — MediaWiki:DieuKhoan-BinhLuan.js
   Điều Khoản — Bình Luận (Comments)
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
                crumb:   'Điều Khoản Bình Luận',
                eyebrow: 'Comment Policy v1.0 — Có hiệu lực từ 2026-01-01',
                title:   'ĐIỀU KHOẢN <em>BÌNH LUẬN</em>',
                sub:     'Quy tắc khi bình luận trên các bài viết trong Wiki. Gửi bình luận = bạn đồng ý với toàn bộ nội dung tài liệu này.'
            })));

            /* 01 — Điều kiện */
            var s1 = MH.section({ tag: '01 <em>//</em> Điều kiện', heading: 'Yêu cầu để bình luận' });
            s1.appendChild(MH.steps([
                { main: 'Đã đăng nhập', sub: 'Khách (chưa đăng nhập) không thể bình luận.' },
                { main: 'Tuổi tài khoản ≥ 7 ngày', sub: 'Tài khoản quá mới bị giới hạn để chống bot và spam.' },
                { main: 'Email đã xác thực', sub: 'Vào trang cá nhân → Cài đặt → Email → Gửi email xác thực.' },
                { main: 'Không bị chặn bình luận', sub: 'Nếu tài khoản đang bị BQT cấm bình luận, mọi bình luận sẽ bị chặn tự động.' }
            ]));
            s1.appendChild(MH.infobox('Thiếu bất kỳ điều kiện nào trong 4 điều kiện trên → không thể bình luận.'));
            page.appendChild(s1);

            /* 02 — Nội dung */
            var s2 = MH.section({ tag: '02 <em>//</em> Nội dung', heading: 'Quy tắc nội dung bình luận' });
            s2.appendChild(MH.prose([
                '<strong>Được phép:</strong> phản ứng tích cực, đặt câu hỏi về nội dung, góp ý xây dựng, chia sẻ kinh nghiệm liên quan, sửa typo nhỏ kèm bằng chứng.',
                'Thay vì viết "Bài này dở", hãy chỉ ra cụ thể tại sao và đề xuất cải thiện. Phê bình <strong>bài viết</strong>, không phê bình <strong>con người</strong>.'
            ]));
            s2.appendChild(MH.infobox(
                '<strong>Nghiêm cấm:</strong> Spam / quảng cáo · Toxic / lăng mạ · Phân biệt chủng tộc / giới tính / tôn giáo · ' +
                'Doxxing · Đe dọa / bạo lực · Bình luận quá dài (> 5000 chữ) không có nội dung · ' +
                'Tranh cãi chính trị hoặc tôn giáo thực tế · Spam kiểu "676767" hay nội dung vô nghĩa lặp lại.', true));
            page.appendChild(s2);

            /* 03 — Bình luận bị chặn */
            var s3 = MH.section({ tag: '03 <em>//</em> Bị chặn', heading: 'Khi bình luận bị chặn' });
            s3.appendChild(MH.prose(['Bình luận sẽ bị chặn hoặc vào hàng chờ duyệt khi:']));
            s3.appendChild(MH.steps([
                { main: 'Chứa từ khóa cấm', sub: 'Từ ngữ xúc phạm, link ngoài, từ khóa spam (buy, click, quảng cáo), nội dung bạo lực.' },
                { main: 'Tài khoản mới (< 7 ngày)', sub: 'Bình luận vào hàng chờ 1–3 ngày. Xác thực email + hoàn thiện hồ sơ giúp được duyệt nhanh hơn.' },
                { main: 'RP thấp (< 50)', sub: 'Bình luận vào hàng chờ 1–2 ngày. Kiếm RP từ vote, hoàn thiện profile, xác thực email.' },
                { main: 'Bình luận quá dài hoặc định dạng lạ', sub: 'Chia thành nhiều bình luận nhỏ hơn. Tránh dùng HTML thô.' }
            ]));
            s3.appendChild(MH.prose([
                'Khi bị chặn: không xuất hiện ngay — bạn thấy thông báo "đang chờ xét duyệt". ' +
                'BQT duyệt trong 4–12 giờ (tối đa 7 ngày). Nếu qua 7 ngày vẫn chưa thấy → liên hệ BQT.'
            ]));
            page.appendChild(s3);

            /* 04 — Spam */
            var s4 = MH.section({ tag: '04 <em>//</em> Spam', heading: 'Spam bình luận' });
            s4.appendChild(MH.steps([
                { main: 'Bình luận quá ngắn / vô nghĩa lặp lại', sub: '"Haha", "ok" gửi đi gửi lại nhiều lần vào nhiều bài = spam. Một lần "hay!" thì được, nhiều lần không có nội dung thì không.' },
                { main: 'Edit spam', sub: 'Sửa bình luận liên tục chỉ để đẩy lên trên ("ok" → "okk" → "okkk") = spam, bị xóa.' },
                { main: 'Comment lặp nhiều bài', sub: 'Copy cùng một bình luận gửi vào 5+ bài khác nhau = spam, bị trừ RP.' }
            ]));
            page.appendChild(s4);

            /* 05 — Hình phạt */
            var s5 = MH.section({ tag: '05 <em>//</em> Hình phạt', heading: 'Xử lý vi phạm' });
            s5.appendChild(MH.steps([
                { main: 'Công kích / lăng mạ cá nhân', sub: 'Xóa bình luận + cảnh báo.' },
                { main: 'Spam / quấy rối liên tục', sub: 'Xóa + trừ RP (-10 tới -50).' },
                { main: 'Phân biệt / bạo lực / doxxing', sub: 'Xóa + khóa tài khoản (có thể ngay lập tức, không cần 3 bước). Trường hợp doxxing/bạo lực nghiêm trọng có thể báo cáo cơ quan pháp luật.' }
            ]));
            s5.appendChild(MH.prose(['Thời gian cấm bình luận: nhẹ 3–7 ngày · nặng 14–30 ngày · vĩnh viễn nếu tái phạm nhiều lần.']));
            page.appendChild(s5);

            /* FAQ */
            var sf = MH.section({ tag: '06 <em>//</em> FAQ', heading: 'Câu hỏi thường gặp' });
            sf.appendChild(MH.faq([
                { q: 'Tôi bình luận xong không thấy hiện, vì sao?', a: 'Bình luận đang trong hàng chờ duyệt. BQT sẽ xét trong 4–12 giờ. Kiểm tra tab History của trang để xem trạng thái.' },
                { q: 'Bình luận của tôi bị xóa mà không có lý do?', a: 'BQT xóa bình luận vi phạm quy tắc. Kiểm tra lại bình luận có chứa link ngoài, từ khóa spam, hoặc nội dung công kích không. Nếu không đồng ý → liên hệ BQT kháng cáo.' },
                { q: 'Tôi có thể đặt link trong bình luận không?', a: 'Link ngoài (URL http://) bị chặn tự động để chống phishing. Dùng [[Tên trang]] để liên kết nội bộ Wiki thay thế.' },
                { q: 'Bị cấm bình luận, phải làm sao?', a: 'Gửi email kháng cáo tới mapleofficialvn@gmail.com ghi tên tài khoản + lý do xin gỡ + cam kết tuân thủ. BQT xem xét trong 7 ngày.' }
            ]));
            page.appendChild(sf);

            page.appendChild(MH.stuck({
                tag:  'Bình luận bị chặn oan?',
                text: 'Liên hệ BQT qua MAPLE Chat hoặc email mapleofficialvn@gmail.com để được hỗ trợ.'
            }));
        });
    }

    if (window.MHHelp) build(window.MHHelp);
    else if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(build);
})();
