/* ============================================
   M.A.P.L.E — MediaWiki:DieuKhoan-BaiRac.js
   Điều Khoản — Bài Viết Rác & Bảo Trì Nội Dung
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
                crumb:   'Điều Khoản Bài Viết Rác',
                eyebrow: 'Content Maintenance Policy v1.0 — Có hiệu lực từ 2026-01-01',
                title:   'BÀI VIẾT RÁC <em>& BẢO TRÌ</em>',
                sub:     'Quy tắc về bài viết chất lượng thấp, bài bị bỏ hoang, và quy trình BQT dọn dẹp / bảo tồn nội dung Wiki.'
            })));

            /* 01 — Nhãn bài */
            var s1 = MH.section({ tag: '01 <em>//</em> Nhãn bài', heading: 'BQT gắn nhãn trước khi xử lý' });
            s1.appendChild(MH.prose(['Trước khi xóa hoặc archive, BQT sẽ gắn nhãn và thông báo cho tác giả có 14 ngày để sửa chữa.']));
            s1.appendChild(MH.steps([
                { main: '[CẦN BỔ SUNG]', sub: 'Bài quá ngắn, cần thêm nội dung. Tác giả có 30 ngày bổ sung.' },
                { main: '[NGHI VẤN CHẤT LƯỢNG]', sub: 'Nội dung không rõ ràng hoặc có vấn đề về độ chính xác lore.' },
                { main: '[TRÙNG LẶP]', sub: 'Nội dung giống bài đã có ≥ 90%. Sẽ được gộp hoặc xóa bài trùng.' },
                { main: '[KHÔNG LIÊN QUAN]', sub: 'Không thuộc lore M.A.P.L.E. Xóa sau 7 ngày.' },
                { main: '[BỎ HOANG]', sub: 'Không có chỉnh sửa > 6 tháng, tác giả không còn hoạt động. BQT có thể archive hoặc mở cho cộng đồng tiếp tục.' },
                { main: '[CHỜ XÓA]', sub: 'Sắp bị xóa. Tác giả có 7 ngày kháng cáo.' }
            ]));
            page.appendChild(s1);

            /* 02 — Loại bài rác */
            var s2 = MH.section({ tag: '02 <em>//</em> Loại bài rác', heading: 'Các loại bài rác & cách xử lý' });
            s2.appendChild(MH.steps([
                { main: 'Bài test / thử nghiệm', sub: '"aaa", "hello world", "1234" → Xóa ngay, không cần cảnh báo. Trừ RP tác giả (-5 RP/bài). Tái phạm 3+ lần → cảnh báo chính thức.' },
                { main: 'Bài quá ngắn (Stub)', sub: 'Gắn nhãn [CẦN BỔ SUNG]. Tác giả có 30 ngày bổ sung. Nếu không → archive (không xóa). RP không bị trừ lần đầu.' },
                { main: 'Bài không liên quan lore', sub: '"Công thức nấu phở", "Review điện thoại" → Gắn nhãn [KHÔNG LIÊN QUAN] → Xóa sau 7 ngày. Không trừ RP (lần đầu, có thể là nhầm).' },
                { main: 'Bài trùng lặp / sao chép', sub: 'Giữ bài cũ hơn hoặc chất lượng tốt hơn. Gộp nội dung nếu có phần bổ sung. Sao chép từ người khác → trừ RP (-20 RP).' },
                { main: 'Bài vi phạm lore nghiêm trọng', sub: 'BQT chỉnh sửa + ghi chú lý do. Hoặc liên hệ tác giả để cùng sửa. Tác giả có quyền phản bác nếu có bằng chứng lore.' }
            ]));
            page.appendChild(s2);

            /* 03 — Archive vs xóa */
            var s3 = MH.section({ tag: '03 <em>//</em> Archive', heading: 'Archive vs. Xóa vĩnh viễn' });
            s3.appendChild(MH.infobox(
                'Theo giấy phép <strong>MCL v1</strong>: Wiki LUÔN ưu tiên <strong>archive</strong> (lưu trữ, ẩn khỏi công khai) ' +
                'thay vì xóa vĩnh viễn. Tác giả yêu cầu xóa → BQT CHỈ ARCHIVE, không xóa vĩnh viễn.'));
            s3.appendChild(MH.roles([
                {
                    role: 'ARCHIVE (ưu tiên)',
                    items: [
                        'Bài dang dở nhưng có nội dung lore',
                        'Bài của tác giả không còn hoạt động',
                        'Bài cũ lỗi thời nhưng có giá trị lịch sử',
                        'Bài bị thay thế bởi bài mới tốt hơn',
                        'Tác giả yêu cầu ẩn bài'
                    ]
                },
                {
                    role: 'XÓA VĨNH VIỄN (đặc biệt)',
                    items: [
                        'Bài chứa nội dung vi phạm pháp luật nghiêm trọng (doxxing, CSAM)',
                        'Bài spam/quảng cáo hoàn toàn không có giá trị lore',
                        'Bài test hoàn toàn ("aaa", "1234")',
                        'Có yêu cầu pháp lý (DMCA takedown)'
                    ]
                }
            ]));
            s3.appendChild(MH.prose(['Bài được archive: không hiển thị trên trang chính/tìm kiếm, vẫn có URL truy cập nếu có link trực tiếp, tác giả có thể yêu cầu khôi phục bất kỳ lúc nào.']));
            page.appendChild(s3);

            /* 04 — Quyền cộng đồng với bài bỏ hoang */
            var s4 = MH.section({ tag: '04 <em>//</em> Bài bỏ hoang', heading: 'Quyền cộng đồng với bài bỏ hoang' });
            s4.appendChild(MH.steps([
                { main: 'Được phép (không cần xin)', sub: 'Sửa lỗi chính tả, typo · Bổ sung thông tin lore đã xác nhận · Cập nhật format theo template mới · Gắn tag / liên kết với bài khác.' },
                { main: 'Không được phép', sub: 'Xóa nội dung gốc của tác giả · Thay đổi hướng lore tác giả đã đặt · Ghi tên mình là "tác giả chính".' },
                { main: 'Muốn "tiếp quản" bài', sub: 'Liên hệ BQT xin phép. BQT sẽ ghi nhận bạn là "đồng tác giả" hoặc "người duy trì".' }
            ]));
            page.appendChild(s4);

            /* FAQ */
            var sf = MH.section({ tag: '05 <em>//</em> FAQ', heading: 'Câu hỏi thường gặp' });
            sf.appendChild(MH.faq([
                { q: 'Bài của tôi bị gắn nhãn [CẦN BỔ SUNG], phải làm gì?', a: 'Bổ sung nội dung trong vòng 30 ngày. Nếu cần thêm thời gian → liên hệ BQT xin gia hạn. BQT sẽ xóa nhãn sau khi bài đủ chất lượng.' },
                { q: 'Bài của tôi bị archive mà tôi không đồng ý?', a: 'Gửi kháng cáo cho BQT trong 30 ngày sau khi bị xử lý kèm lý do + nội dung muốn sửa. BQT xem xét trong 7 ngày.' },
                { q: 'Tôi muốn tiếp tục một bài bỏ hoang của người khác, có được không?', a: 'Được nhưng phải liên hệ BQT xin phép trước. BQT sẽ kiểm tra và ghi nhận bạn là người duy trì.' },
                { q: 'Bài của tôi bị xóa vì "test" nhưng tôi không có ý test?', a: 'Gửi kháng cáo cho BQT trong 7 ngày. BQT sẽ khôi phục nếu bài có giá trị thực sự.' }
            ]));
            page.appendChild(sf);

            page.appendChild(MH.stuck({
                tag:  'Bài bị gắn nhãn hoặc archive?',
                text: 'Liên hệ BQT ngay qua MAPLE Chat hoặc email mapleofficialvn@gmail.com để được hướng dẫn sửa chữa.'
            }));
        });
    }

    if (window.MHHelp) build(window.MHHelp);
    else if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(build);
})();
