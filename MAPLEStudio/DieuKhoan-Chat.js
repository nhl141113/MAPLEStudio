/* ============================================
   M.A.P.L.E — MediaWiki:DieuKhoan-Chat.js
   Điều Khoản — MAPLE Chat
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
                crumb:   'Điều Khoản MAPLE Chat',
                eyebrow: 'Chat Policy v1.0 — Có hiệu lực từ 2026-01-01',
                title:   'ĐIỀU KHOẢN <em>MAPLE CHAT</em>',
                sub:     'Quy tắc khi sử dụng MAPLE Chat — hệ thống nhắn tin riêng tư giữa các thành viên Wiki.'
            })));

            /* 01 — Điều kiện */
            var s1 = MH.section({ tag: '01 <em>//</em> Điều kiện', heading: 'Yêu cầu để dùng Chat' });
            s1.appendChild(MH.steps([
                { main: 'Điểm uy tín (RP) ≥ 1', sub: 'Tài khoản mới (RP = 0) chưa thể dùng Chat. Cách kiếm RP: bình luận, vote, hoàn thiện hồ sơ, xác thực email.' },
                { main: 'Tuổi tài khoản ≥ 7 ngày', sub: 'Chống bot và tài khoản giả lập.' },
                { main: 'Email đã xác thực', sub: 'Vào trang cá nhân → Cài đặt → Email → Gửi email xác thực.' }
            ]));
            s1.appendChild(MH.infobox('Thiếu bất kỳ điều kiện nào trong 3 điều kiện trên → không thể sử dụng MAPLE Chat.'));
            page.appendChild(s1);

            /* 02 — Quy tắc */
            var s2 = MH.section({ tag: '02 <em>//</em> Quy tắc', heading: 'Quy tắc chat' });
            s2.appendChild(MH.prose(['MAPLE Chat là nhắn tin thật — không phải sân khấu role-play mặc định.']));
            s2.appendChild(MH.steps([
                { main: 'Được phép', sub: 'Chào hỏi · Thảo luận lore/nội dung bài · Hỏi BQT về quy tắc · Kết bạn · Role-play nếu CẢ HAI BÊN đồng ý rõ ràng.' },
                { main: 'Nghiêm cấm', sub: 'Lăng mạ / đe dọa · Quấy rối / tiếp tục nhắn khi bị yêu cầu dừng · Phân biệt chủng tộc/giới tính/tôn giáo · Spam · Doxxing · Yêu cầu nội dung 18+ từ người dưới 18 · Link độc hại · Mạo danh.' }
            ]));
            page.appendChild(s2);

            /* 03 — Role-play */
            var s3 = MH.section({ tag: '03 <em>//</em> Role-play', heading: 'Role-play trong Chat' });
            s3.appendChild(MH.steps([
                { main: 'Được role-play khi', sub: 'Cả 2 bên thỏa thuận rõ ràng · Nội dung không xúc phạm/phân biệt · Có đánh dấu rõ đang nhập vai (VD: "[IC] Tôi là...").' },
                { main: 'Không được phép', sub: 'Dùng nhân vật để lăng mạ người thật · Viện lý do "tôi đang nhập vai" để nói điều xúc phạm. Vẫn là vi phạm.' }
            ]));
            page.appendChild(s3);

            /* 04 — Ranh giới */
            var s4 = MH.section({ tag: '04 <em>//</em> Ranh giới', heading: 'Ranh giới cá nhân' });
            s4.appendChild(MH.infobox(
                'Nếu ai yêu cầu <strong>"Đừng nhắn tin tôi nữa"</strong> → bạn PHẢI dừng ngay lập tức. ' +
                'Tiếp tục nhắn = quấy rối, bị xử lý theo hình phạt.', true));
            s4.appendChild(MH.prose([
                'Để chặn ai: Chat → Settings → Block [tên]. Người đó sẽ không thể gửi tin tới bạn.',
                'Lưu ý: Tài khoản được đánh dấu là <strong>App</strong> không thể bị chặn.'
            ]));
            page.appendChild(s4);

            /* 05 — Hình phạt */
            var s5 = MH.section({ tag: '05 <em>//</em> Hình phạt', heading: 'Khóa chat' });
            s5.appendChild(MH.steps([
                { main: 'Tái phạm quấy rối / spam', sub: 'Khóa chat 7–14 ngày.' },
                { main: 'Quấy rối có chủ đích', sub: 'Khóa chat 14–30 ngày.' },
                { main: 'Phân biệt / bạo lực / doxxing', sub: 'Khóa vĩnh viễn + xem xét khóa tài khoản.' }
            ]));
            s5.appendChild(MH.prose(['Gian lận: dùng nhiều tài khoản để lừa đảo qua Chat, gửi tin giả mạo BQT, phối hợp quấy rối 1 người → hình phạt nặng nhất (Điều 7.2 Điều khoản Người Dùng).']));
            page.appendChild(s5);

            /* 06 — Quyền BQT */
            var s6 = MH.section({ tag: '06 <em>//</em> BQT', heading: 'Quyền của BQT trong Chat' });
            s6.appendChild(MH.prose([
                'BQT <strong>có quyền</strong>: xem nội dung chat khi điều tra vi phạm · khóa chat · xóa tin nhắn vi phạm · cảnh báo / trừ RP / khóa tài khoản.',
                'BQT <strong>không</strong>: xem chat để "nghe lén" mà không có lý do · chia sẻ nội dung chat riêng tư của bạn.'
            ]));
            page.appendChild(s6);

            /* FAQ */
            var sf = MH.section({ tag: '07 <em>//</em> FAQ', heading: 'Câu hỏi thường gặp' });
            sf.appendChild(MH.faq([
                { q: 'Tôi không gửi được tin nhắn, lỗi gì?', a: 'Kiểm tra 3 điều kiện: RP ≥ 1, tài khoản ≥ 7 ngày, email xác thực. Nếu đủ cả 3 mà vẫn lỗi → kiểm tra chat có đang bị khóa không, hoặc liên hệ BQT.' },
                { q: '"Người dùng này đã chặn bạn" nghĩa là gì?', a: 'Người nhận đã chặn bạn trong cài đặt chat của họ. Đây là quyền cá nhân của họ. Yêu cầu họ gỡ chặn, hoặc liên hệ BQT nếu bạn cho rằng việc chặn là không công bằng.' },
                { q: 'Chat bị khóa, phải làm sao?', a: 'Gửi email kháng cáo mapleofficialvn@gmail.com ghi tên tài khoản + lý do + cam kết tuân thủ. BQT xem xét trong 7 ngày.' },
                { q: 'Tôi bị quấy rối qua Chat, phải làm gì?', a: 'Chụp màn hình làm bằng chứng → chặn người đó → báo cáo BQT qua email hoặc trang Phản Hồi. BQT sẽ xử lý trong 24 giờ.' }
            ]));
            page.appendChild(sf);

            page.appendChild(MH.stuck({
                tag:  'Chat bị lỗi hoặc bị khóa?',
                text: 'Liên hệ BQT qua email mapleofficialvn@gmail.com hoặc trang Phản Hồi để được hỗ trợ nhanh nhất.'
            }));
        });
    }

    if (window.MHHelp) build(window.MHHelp);
    else if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(build);
})();
