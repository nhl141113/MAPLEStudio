/* ============================================
   M.A.P.L.E — MediaWiki:DieuKhoan-TaoBlog.js
   Điều Khoản — Tạo Bài Viết / Blog / Dossier
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
                crumb:   'Điều Khoản Tạo Bài',
                eyebrow: 'Content Creation Policy v1.0 — Có hiệu lực từ 2026-01-01',
                title:   'TẠO BÀI VIẾT <em>/ BLOG / DOSSIER</em>',
                sub:     'Quy tắc khi viết, tạo, và đăng bài viết trên Wiki M.A.P.L.E. Chỉ Writer mới có quyền tạo bài.'
            })));

            /* 01 — Định nghĩa */
            var s1 = MH.section({ tag: '01 <em>//</em> Định nghĩa', heading: 'Các loại bài viết' });
            s1.appendChild(MH.steps([
                { main: 'Hồ sơ thực thể (Entity Dossier)', sub: 'Tài liệu về sinh vật, nhân vật, tổ chức trong thế giới M.A.P.L.E / The Maze.' },
                { main: 'Hồ sơ vật phẩm (Item)', sub: 'Tài liệu về vật phẩm, vũ khí, thiết bị trong lore.' },
                { main: 'Nhật ký (Log)', sub: 'Nhật ký sự kiện, báo cáo thực địa, hồ sơ tình huống.' },
                { main: 'Bài tương tác (Blog post)', sub: 'Bài phân tích, lý thuyết, góc nhìn về lore.' },
                { main: 'Dossier (tổng hợp)', sub: 'Hồ sơ tổng hợp nhiều nguồn, nhiều góc độ về một chủ đề.' }
            ]));
            s1.appendChild(MH.infobox('Tất cả loại bài đều phải tuân theo điều khoản này.'));
            page.appendChild(s1);

            /* 02 — Điều kiện */
            var s2 = MH.section({ tag: '02 <em>//</em> Điều kiện', heading: 'Điều kiện để tạo bài' });
            s2.appendChild(MH.infobox(
                '<strong>⚠️ CHỈ WRITER MỚI CÓ QUYỀN TẠO BÀI!</strong><br>' +
                'Nếu chưa có vai trò Writer → KHÔNG ĐƯỢC TẠO BÀI. Hãy kiếm RP và xin cấp Writer (xem mục 07).', true));
            s2.appendChild(MH.steps([
                { main: 'RP ≥ 200 (Tier 2)', sub: 'Kiếm RP từ bình luận, vote, hoàn thiện hồ sơ, xác thực email.' },
                { main: 'Tuổi tài khoản ≥ 7 ngày', sub: 'Chống bot và tài khoản giả lập.' },
                { main: 'Email đã xác thực', sub: 'Vào trang cá nhân → Cài đặt → Email → Gửi email xác thực.' },
                { main: 'Viết 1–2 bài mẫu chất lượng cao', sub: 'BQT xem xét chất lượng bài mẫu khi phê duyệt đơn.' },
                { main: 'Đơn xin Writer được BQT phê duyệt', sub: 'Gửi đơn tại trang cá nhân hoặc email BQT. Thời gian xét: 7–14 ngày.' }
            ]));
            page.appendChild(s2);

            /* 03 — Nội dung */
            var s3 = MH.section({ tag: '03 <em>//</em> Nội dung', heading: 'Quy tắc nội dung bài viết' });
            s3.appendChild(MH.roles([
                {
                    role: 'BÀI HỢP LỆ',
                    items: [
                        'Tuân theo format chuẩn (Dossier, Entity, Item, Log)',
                        'Nội dung liên quan lore M.A.P.L.E / The Maze',
                        'Có tóm tắt, mô tả chi tiết rõ ràng',
                        'Chất lượng: rõ ràng, ít lỗi chính tả',
                        'Kèm ảnh / tài liệu tham khảo (nếu có)'
                    ]
                },
                {
                    role: 'BÀI BỊ TỪ CHỐI',
                    items: [
                        'Spam / quảng cáo / không liên quan',
                        'Sao chép bài của người khác (plagiarism)',
                        'Nội dung xúc phạm / bạo lực / phân biệt',
                        'Doxxing (thông tin cá nhân người thật)',
                        'Test/thử nghiệm ("Testing 123")',
                        'Bài quá ngắn hoặc thiếu cấu trúc'
                    ]
                }
            ]));
            page.appendChild(s3);

            /* 04 — Chất lượng */
            var s4 = MH.section({ tag: '04 <em>//</em> Chất lượng', heading: 'Tiêu chuẩn chất lượng BQT xem xét' });
            s4.appendChild(MH.steps([
                { main: 'Ngôn ngữ', sub: 'Chủ yếu tiếng Việt · Được trộn tiếng Anh nếu cần lore · Chính tả đủ để đọc được.' },
                { main: 'Nội dung', sub: 'Tuân theo setting lore · Không xung đột với bài khác · Có cấu trúc logic.' },
                { main: 'Định dạng', sub: 'Dùng template đúng (Entity, Item, Log) · Tiêu đề rõ ràng · Phân chia mục hợp lý.' },
                { main: 'Ảnh / Media', sub: 'Định dạng hợp lệ (JPG, PNG, GIF < 5MB) · Có chú thích / nguồn · Ảnh nhạy cảm dùng SecureImage.' }
            ]));
            page.appendChild(s4);

            /* 05 — Quy trình duyệt */
            var s5 = MH.section({ tag: '05 <em>//</em> Quy trình', heading: 'Quy trình duyệt bài (tất cả bài phải qua hàng chờ)' });
            s5.appendChild(MH.infobox('<strong>BẮT BUỘC:</strong> Tất cả bài viết (kể cả Writer) phải qua hàng chờ duyệt!'));
            s5.appendChild(MH.steps([
                { main: 'Bạn viết bài', sub: 'Tạo bài (phải là Writer) → Bài tự động vào "Hàng chờ" (pending queue).' },
                { main: 'BQT kiểm duyệt', sub: 'Xem xét nội dung, chất lượng, format. Thời gian: 1–7 ngày.' },
                { main: 'Phê duyệt (Approve)', sub: 'Bài được công khai · +50 RP cho tác giả · Cộng đồng có thể bình luận.' },
                { main: 'Từ chối (Decline)', sub: 'Bạn nhận thông báo lý do · Có thể sửa & nộp lại · Không bị trừ RP.' }
            ]));
            s5.appendChild(MH.prose(['Không đồng ý với quyết định? Gửi kháng cáo cho BQT trong 7 ngày · Email: mapleofficialvn@gmail.com · Nội dung: tên bài + lý do kháng cáo.']));
            page.appendChild(s5);

            /* 06 — Quyền tác giả */
            var s6 = MH.section({ tag: '06 <em>//</em> Quyền tác giả', heading: 'Quyền tác giả & chỉnh sửa' });
            s6.appendChild(MH.roles([
                {
                    role: 'Bạn có quyền',
                    items: [
                        'Chỉnh sửa bài của mình bất kỳ lúc nào',
                        'Yêu cầu BQT archive bài (ẩn khỏi công khai)',
                        'Ghi tiêu đề, mô tả, thẻ (tags)',
                        'Trả lời bình luận / làm rõ nội dung'
                    ]
                },
                {
                    role: 'Người khác có quyền',
                    items: [
                        'Bình luận / góp ý dưới bài',
                        'Sửa typo / lỗi chính tả (bạn duyệt)',
                        'BQT sửa cấu trúc / định dạng',
                        'BQT archive nếu vi phạm MCL v1'
                    ]
                }
            ]));
            s6.appendChild(MH.infobox(
                'Theo giấy phép <strong>MCL v1 / M BY-SA 1.0</strong>: bài đã đăng thuộc Wiki vĩnh viễn. ' +
                'BQT CHỈ ARCHIVE (ẩn khỏi công khai), không xóa vĩnh viễn theo yêu cầu tác giả.'));
            page.appendChild(s6);

            /* 07 — Xin Writer */
            var s7 = MH.section({ tag: '07 <em>//</em> Xin Writer', heading: 'Trở thành Writer (để có quyền tạo bài)' });
            s7.appendChild(MH.steps([
                { main: 'Bước 1: Đạt đủ điều kiện', sub: 'RP ≥ 200 · Tuổi tài khoản ≥ 7 ngày · Email đã xác thực.' },
                { main: 'Bước 2: Chuẩn bị 1–2 bài mẫu', sub: 'Viết bài chất lượng cao · Tuân theo format · Nội dung đầy đủ.' },
                { main: 'Bước 3: Gửi đơn xin Writer', sub: 'Tìm nút "Xin cấp Writer" trên trang cá nhân · Hoặc email: mapleofficialvn@gmail.com · Nội dung: tên tài khoản + link bài mẫu + lý do xin.' },
                { main: 'Bước 4: Đợi BQT xem xét', sub: 'Thời gian: 7–14 ngày · Phê duyệt → được cấp Writer · Từ chối → được hướng dẫn cải thiện.' }
            ]));
            page.appendChild(s7);

            /* FAQ */
            var sf = MH.section({ tag: '08 <em>//</em> FAQ', heading: 'Câu hỏi thường gặp' });
            sf.appendChild(MH.faq([
                { q: 'Tôi chưa là Writer, có thể viết thử bài mẫu ở đâu?', a: 'Dùng trang Sandbox cá nhân (Người_dùng:{tên}/Sandbox) để viết thử. Khi đủ điều kiện, dùng bài mẫu đó để nộp đơn Writer.' },
                { q: 'Bài của tôi bị từ chối, phải làm gì?', a: 'Xem thông báo từ BQT để biết lý do. Sửa theo hướng dẫn → nộp lại. Nếu không đồng ý → kháng cáo trong 7 ngày.' },
                { q: 'Tôi có thể đăng lại bài Wiki của mình lên blog cá nhân không?', a: 'Được, cho mục đích phi thương mại. Phải ghi "Nguồn: M.A.P.L.E Wiki" và tên tác giả gốc. Dùng thương mại → xin phép BQT trước.' },
                { q: 'Bài của tôi bị xóa mà tôi không vi phạm gì?', a: 'Gửi kháng cáo cho BQT trong 7 ngày kèm tên bài + lý do. BQT xem xét và phản hồi trong 7 ngày. Bài chỉ bị xóa vĩnh viễn khi vi phạm pháp luật nghiêm trọng.' }
            ]));
            page.appendChild(sf);

            page.appendChild(MH.stuck({
                tag:  'Muốn xin cấp Writer hoặc kháng cáo bài?',
                text: 'Email mapleofficialvn@gmail.com với tên tài khoản + link bài mẫu + yêu cầu. BQT phản hồi trong 7–14 ngày.'
            }));
        });
    }

    if (window.MHHelp) build(window.MHHelp);
    else if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(build);
})();
