/* ============================================
   M.A.P.L.E — MediaWiki:DieuKhoan-QuyenGop.js
   Điều Khoản — Chính Sách Quyên Góp / Donate
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
                crumb:   'Chính Sách Quyên Góp',
                eyebrow: 'Donation Policy v1.0 — Có hiệu lực từ 2026-01-01',
                title:   'CHÍNH SÁCH <em>QUYÊN GÓP</em>',
                sub:     'Wiki M.A.P.L.E là dự án phi thương mại. Tài liệu này giải thích cách quyên góp, tiền dùng vào đâu, và những gì Wiki không chịu trách nhiệm.'
            })));

            /* 01 — Phi thương mại */
            var s1 = MH.section({ tag: '01 <em>//</em> Phi thương mại', heading: 'Wiki là dự án phi thương mại' });
            s1.appendChild(MH.steps([
                { main: 'Không bán quảng cáo', sub: 'Wiki không chạy quảng cáo bên thứ ba.' },
                { main: 'Không bán dữ liệu', sub: 'Dữ liệu người dùng không bao giờ được bán.' },
                { main: 'Không tính phí truy cập', sub: 'Mọi nội dung đều miễn phí. Quyên góp hoàn toàn tự nguyện.' },
                { main: 'Tiền quyên góp dùng cho', sub: 'Bảo trì máy chủ (hosting, bandwidth) · Phát triển công cụ/plugin · Quản lý & điều hành · Thưởng cho BQT/mod tình nguyện khi cần.' }
            ]));
            page.appendChild(s1);

            /* 02 — Cách quyên góp */
            var s2 = MH.section({ tag: '02 <em>//</em> Cách quyên góp', heading: 'Phương thức quyên góp chính thức' });
            s2.appendChild(MH.steps([
                { main: 'Quyên góp cho quỹ Wiki', sub: 'Qua trang Miraheze hoặc nút "Donate" trên menu Wiki. Tiền đi vào quỹ Wiki, dùng cho hosting và phát triển.' },
                { main: 'Hỏi BQT trước khi gửi', sub: 'Không chắc phương thức nào là chính thức? Email mapleofficialvn@gmail.com hỏi trước. BQT sẽ cung cấp thông tin mới nhất.' }
            ]));
            s2.appendChild(MH.infobox(
                '<strong>Quyên góp cho cá nhân (tác giả, Admin, BQT):</strong> Được phép — nhưng đó là tiền riêng của cá nhân, ' +
                'KHÔNG phải quỹ Wiki, KHÔNG dùng để phát triển Wiki. ' +
                'Wiki không quản lý, không chịu trách nhiệm nếu có tranh chấp.'));
            page.appendChild(s2);

            /* 03 — Không chịu trách nhiệm */
            var s3 = MH.section({ tag: '03 <em>//</em> Rủi ro', heading: 'Wiki không chịu trách nhiệm khi' });
            s3.appendChild(MH.infobox(
                'Nếu bạn quyên góp qua <strong>mã QR cá nhân / PayPal / Momo / tài khoản ngân hàng cá nhân</strong> của BQT ' +
                '(thay vì tài khoản chính thức Wiki): Wiki không có dữ liệu giao dịch, không thể giúp lấy lại tiền, ' +
                'không chịu trách nhiệm pháp lý nếu BQT biển thủ. ' +
                'Tranh chấp phải giải quyết trực tiếp với cá nhân đó.', true));
            s3.appendChild(MH.steps([
                { main: 'Tiền bị mất khi gửi qua cá nhân', sub: 'Giải quyết trực tiếp với người nhận. Wiki không can thiệp.' },
                { main: 'Không biết tiền đi đâu', sub: 'Hỏi cá nhân nhận. Wiki không có dữ liệu.' },
                { main: 'Muốn lấy lại tiền', sub: 'Wiki không hoàn lại quyên góp sau khi nhận (trừ lỗi hệ thống rõ ràng).' }
            ]));
            page.appendChild(s3);

            /* 04 — Quy định */
            var s4 = MH.section({ tag: '04 <em>//</em> Quy định', heading: 'Khi bạn quyên góp, bạn đồng ý' });
            s4.appendChild(MH.steps([
                { main: 'Quyên góp là quà tặng tự nguyện', sub: 'Không mua đặc quyền. Wiki dùng tiền theo phán đoán của BQT. Bạn không kiểm soát cách dùng tiền.' },
                { main: 'Không có quy đổi / đền bù', sub: 'Không thăng hạng RP tự động · Không ưu tiên duyệt bài · Không miễn xử phạt.' },
                { main: 'Không hoàn lại', sub: 'Nếu Wiki đóng cửa hoặc bị hack → tiền không hoàn lại. Không thể kiện Wiki.' },
                { main: 'Không là hợp đồng pháp lý', sub: 'Quyên góp = quà tặng, không có giấy tờ pháp lý ràng buộc.' }
            ]));
            page.appendChild(s4);

            /* 05 — Ưu đãi */
            var s5 = MH.section({ tag: '05 <em>//</em> Ưu đãi', heading: 'Ưu đãi (tùy chọn, không bắt buộc)' });
            s5.appendChild(MH.prose(['Wiki CÓ THỂ tặng những điều sau cho người quyên góp — nhưng không cam kết:']));
            s5.appendChild(MH.steps([
                { main: 'Badge "Nhà tài trợ" / "Supporter"', sub: 'Hiển thị trên trang cá nhân.' },
                { main: 'Ghi tên trên trang Cảm ơn', sub: 'Hiển thị ẩn danh hoặc công khai tùy bạn chọn.' },
                { main: 'RP thưởng (tùy chọn)', sub: '+50~100 RP cho quyên góp lớn. Tùy quyết định BQT, không bắt buộc.' }
            ]));
            s5.appendChild(MH.infobox(
                '<strong>Quyên góp KHÔNG mua được:</strong> Quyền xóa bài của người khác · Quyền làm mod/BQT · ' +
                'Quyền vi phạm quy tắc · Quyền khóa tài khoản người khác.'));
            page.appendChild(s5);

            /* FAQ */
            var sf = MH.section({ tag: '06 <em>//</em> FAQ', heading: 'Câu hỏi thường gặp' });
            sf.appendChild(MH.faq([
                { q: 'Tôi muốn quyên góp, phải làm thế nào?', a: 'Email BQT tại mapleofficialvn@gmail.com để hỏi phương thức quyên góp hiện tại. Hoặc dùng nút Donate trên menu Wiki (nếu có).' },
                { q: 'Quyên góp cho tác giả bài mình thích có được không?', a: 'Hoàn toàn được. Đó là giao dịch giữa bạn và cá nhân tác giả. Wiki không liên quan và không chịu trách nhiệm về giao dịch đó.' },
                { q: 'Tiền quyên góp có được công khai không?', a: 'Wiki công bố báo cáo chi tiêu định kỳ (mỗi quý hoặc năm). Tên người quyên góp ẩn danh hoặc công khai tùy lựa chọn của bạn khi quyên góp.' },
                { q: 'Tôi nghi ngờ BQT dùng sai tiền, phải làm gì?', a: 'Liên hệ BQT yêu cầu giải trình. Cộng đồng có quyền yêu cầu thanh tra. Miraheze cũng có thể can thiệp nếu có bằng chứng gian lận.' }
            ]));
            page.appendChild(sf);

            page.appendChild(MH.stuck({
                tag:  'Câu hỏi về quyên góp?',
                text: 'Liên hệ BQT qua email mapleofficialvn@gmail.com để được tư vấn phương thức quyên góp chính thức.'
            }));
        });
    }

    if (window.MHHelp) build(window.MHHelp);
    else if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(build);
})();
