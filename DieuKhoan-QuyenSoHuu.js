/* ============================================
   M.A.P.L.E — MediaWiki:DieuKhoan-QuyenSoHuu.js
   Điều Khoản — Quyền Sở Hữu Trí Tuệ Khi Rời Wiki
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
                crumb:   'Quyền Sở Hữu Trí Tuệ',
                eyebrow: 'IP & Content Ownership Policy v1.0 — Có hiệu lực từ 2026-01-01',
                title:   'QUYỀN SỞ HỮU <em>KHI RỜI WIKI</em>',
                sub:     'Bài đã đăng thuộc Wiki vĩnh viễn theo giấy phép MCL v1 / M BY-SA 1.0. Tài liệu này giải thích bạn giữ được gì và những gì không thể thu hồi.'
            })));

            /* 01 — Bạn sở hữu gì */
            var s1 = MH.section({ tag: '01 <em>//</em> Sở hữu', heading: 'Bạn sở hữu gì khi tạo nội dung?' });
            s1.appendChild(MH.roles([
                {
                    role: 'Bạn GIỮ',
                    items: [
                        'Quyền được ghi nhận là tác giả gốc',
                        'Quyền lấy lại nội dung để dùng ở nơi khác (trích dẫn cá nhân)',
                        'Ý tưởng thuần túy (concept) chưa đăng công khai'
                    ]
                },
                {
                    role: 'Bạn KHÔNG sở hữu độc quyền',
                    items: [
                        'Bài đã đăng thuộc giấy phép MCL v1 / M BY-SA 1.0',
                        'Wiki có quyền lưu trữ, hiển thị, và sử dụng nội dung đó',
                        'Cộng đồng có thể tiếp tục, sửa đổi, xây dựng lên bài của bạn'
                    ]
                }
            ]));
            page.appendChild(s1);

            /* 02 — Giấy phép MCL v1 */
            var s2 = MH.section({ tag: '02 <em>//</em> Giấy phép', heading: 'Giấy phép MCL v1 / M BY-SA 1.0' });
            s2.appendChild(MH.infobox(
                '<strong>⚠️ BÀI ĐÃ ĐĂNG THUỘC WIKI VĨNH VIỄN</strong><br>' +
                'Khi đăng bài lên Wiki, bạn đồng ý với giấy phép <strong>MCL v1 / M BY-SA 1.0 (MAPLE Content License)</strong>. ' +
                'Giấy phép này KHÔNG THỂ thu hồi sau khi áp dụng.', true));
            s2.appendChild(MH.steps([
                { main: 'Ai cũng có thể chia sẻ bài của bạn', sub: 'Phải ghi nguồn: "Nguồn: M.A.P.L.E Wiki" + tên tác giả gốc.' },
                { main: 'Ai cũng có thể chỉnh sửa bài của bạn', sub: 'Phải ghi rõ thay đổi so với bản gốc.' },
                { main: 'Wiki lưu trữ bài vĩnh viễn', sub: 'Bài được giữ lại trong hệ thống Wiki, không tự động xóa khi bạn rời đi.' },
                { main: 'Không dùng thương mại', sub: 'Không ai có thể sử dụng nội dung Wiki cho mục đích thương mại mà không xin phép.' }
            ]));
            page.appendChild(s2);

            /* 03 — Khi rời Wiki */
            var s3 = MH.section({ tag: '03 <em>//</em> Khi rời', heading: 'Khi bạn rời Wiki — điều gì xảy ra?' });
            s3.appendChild(MH.steps([
                { main: 'Bài viết', sub: 'Vẫn tồn tại. Tên bạn vẫn hiển thị trong lịch sử bài (tác giả gốc). Cộng đồng có thể tiếp tục bổ sung.' },
                { main: 'Hình ảnh / Media bạn upload', sub: 'Vẫn tồn tại. Nếu là ảnh bạn vẽ/tạo → bạn vẫn là tác giả gốc.' },
                { main: 'Tài khoản', sub: 'Tên tài khoản vẫn hiển thị trong lịch sử bài. Profile có thể được archive theo yêu cầu.' }
            ]));
            page.appendChild(s3);

            /* 04 — Có thể yêu cầu gì */
            var s4 = MH.section({ tag: '04 <em>//</em> Yêu cầu', heading: 'Bạn có thể yêu cầu gì khi rời?' });
            s4.appendChild(MH.steps([
                { main: 'Archive bài (ẩn khỏi công khai)', sub: 'Liên hệ BQT. Bài sẽ bị ẩn khỏi tìm kiếm và trang chính, nhưng vẫn tồn tại trong hệ thống theo MCL v1. KHÔNG xóa vĩnh viễn.' },
                { main: 'Ẩn danh tính', sub: 'Yêu cầu đổi tên tác giả thành "[Tác giả ẩn danh]". BQT chỉnh sửa thủ công từng bài.' },
                { main: 'Gỡ thông tin cá nhân', sub: 'Nếu bài chứa số điện thoại, địa chỉ thật của bạn → BQT sẽ ẩn/xóa phần thông tin đó (không xóa cả bài).' }
            ]));
            s4.appendChild(MH.infobox(
                '<strong>Không thể yêu cầu:</strong> Xóa vĩnh viễn bài đã đăng (MCL v1 — bài thuộc Wiki vĩnh viễn) · ' +
                'Thu hồi giấy phép MCL v1 · Ngăn cộng đồng tiếp tục bài · ' +
                'Xóa toàn bộ lịch sử chỉnh sửa kỹ thuật · Xóa trích dẫn bài trong bài khác.', true));
            page.appendChild(s4);

            /* 05 — Trường hợp đặc biệt */
            var s5 = MH.section({ tag: '05 <em>//</em> Đặc biệt', heading: 'Trường hợp đặc biệt' });
            s5.appendChild(MH.steps([
                { main: 'Bị khóa vĩnh viễn', sub: 'Bài vẫn tồn tại (nếu không vi phạm) theo MCL v1. Bài vi phạm nghiêm trọng → BQT có thể archive/ẩn. Không thể yêu cầu xóa bài sau khi bị khóa vĩnh viễn.' },
                { main: 'Tác giả qua đời', sub: 'Gia đình / người đại diện có thể liên hệ BQT. BQT sẽ gắn nhãn tưởng niệm (nếu gia đình đồng ý). Không ai được sửa đổi lớn bài của người đã mất (chỉ typo).' },
                { main: 'Wiki đóng cửa', sub: 'BQT thông báo trước 30 ngày. Bạn có thể tải về nội dung của mình. Wiki export toàn bộ dữ liệu (MediaWiki XML).' }
            ]));
            page.appendChild(s5);

            /* FAQ */
            var sf = MH.section({ tag: '06 <em>//</em> FAQ', heading: 'Câu hỏi thường gặp' });
            sf.appendChild(MH.faq([
                { q: 'Tôi muốn xóa bài mình đã viết, có được không?', a: 'Không thể xóa vĩnh viễn theo MCL v1. BQT sẽ archive bài (ẩn khỏi công khai) theo yêu cầu. Liên hệ BQT kèm tên bài + lý do.' },
                { q: 'Tôi rời Wiki, bài của tôi có bị xóa không?', a: 'Không. Bài vẫn tồn tại và tên bạn vẫn được ghi nhận là tác giả gốc. Nếu không muốn bài hiển thị → yêu cầu BQT archive.' },
                { q: 'Ai đó đang nhận bài của tôi là của họ, phải làm gì?', a: 'Gửi kháng cáo cho BQT kèm bằng chứng (bản nháp, timestamp). BQT xem xét trong 14 ngày dựa trên lịch sử chỉnh sửa.' },
                { q: 'Tôi có thể đăng lại nội dung Wiki của mình lên nơi khác không?', a: 'Được, cho mục đích cá nhân (không thương mại). Phải ghi "Nguồn: M.A.P.L.E Wiki" và tên tác giả gốc. Dùng thương mại → xin phép BQT trước.' }
            ]));
            page.appendChild(sf);

            page.appendChild(MH.stuck({
                tag:  'Muốn ẩn hoặc archive bài?',
                text: 'Liên hệ BQT qua email mapleofficialvn@gmail.com với tên bài + lý do. BQT phản hồi trong 3–7 ngày.'
            }));
        });
    }

    if (window.MHHelp) build(window.MHHelp);
    else if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(build);
})();
