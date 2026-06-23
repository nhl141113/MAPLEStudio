/* ============================================
   M.A.P.L.E — MediaWiki:DieuKhoan-Writer.js
   Trang Điều Khoản Nội Dung (dành cho Writer)
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
                crumb:   'Điều Khoản Nội Dung',
                eyebrow: 'Content Terms of Service v4.0 — Có hiệu lực từ 2026-01-01',
                title:   'ĐIỀU KHOẢN <em>NỘI DUNG</em>',
                sub:     'Tài liệu này quy định tiêu chuẩn sáng tác cho mọi Writer đóng góp bài viết lên M.A.P.L.E Wiki. Đăng bài = bạn đã đọc và đồng ý.'
            })));

            /* 01 — Chất lượng & nguyên bản */
            var s1 = MH.section({ tag: '01 <em>//</em> Nguyên bản', heading: 'Chất lượng và tính nguyên bản' });
            s1.appendChild(MH.infobox(
                'Tài liệu này khác với <a href="/wiki/D%E1%BB%B1_%C3%A1n:%C4%90i%E1%BB%81u_kho%E1%BA%A3n_ng%C6%B0%E1%BB%9Di_d%C3%B9ng">Điều khoản Người Dùng</a> ' +
                '(ứng xử cộng đồng) và <a href="/wiki/D%E1%BB%B1_%C3%A1n:B%E1%BA%A3n_quy%E1%BB%81n">Điều khoản Bản quyền</a> (giấy phép). ' +
                'Trang này chỉ nói về <strong>nội dung bài viết</strong>.'
            ));
            s1.appendChild(MH.steps([
                {
                    main: 'Bài phải là của bạn',
                    sub:  'M.A.P.L.E không phải bãi rác copy-paste. Cấm chép từ SCP Foundation, Backrooms Wiki hay bất kỳ nguồn nào khác. ' +
                          'Lấy ≥50% nội dung/cấu trúc/ý chính từ nguồn khác mà không khai báo = vi phạm. ' +
                          'Tham khảo rồi viết lại bằng lời của mình → hoàn toàn OK.'
                },
                {
                    main: 'Giới hạn sử dụng AI',
                    sub:  'AI sinh ra ≥60% nội dung chính (text, ý tưởng cốt lõi) = vi phạm. ' +
                          'Được phép dùng AI để: sửa lỗi chính tả, cải thiện văn phong, brainstorm ý tưởng (nhưng phải tự viết lại), ' +
                          'tạo ảnh minh họa (ghi chú "AI-generated"), viết code CSS/JS hỗ trợ bài. ' +
                          'Không được phép: để AI viết thay toàn bộ nội dung lore, nhân vật, dialog.'
                },
                {
                    main: 'Không phá lore cốt lõi',
                    sub:  'M.A.P.L.E tôn trọng sáng tạo tự do. Nhưng nếu muốn thay đổi khái niệm nền tảng ' +
                          '(định nghĩa thực thể, khu vực, cơ chế chính của The Maze) → liên hệ BQT xin phép trước. ' +
                          'Tự ý thay đổi = bài bị xoá, không cảnh báo.'
                },
                {
                    main: 'Chất lượng tối thiểu',
                    sub:  'Bài quá sơ sài (stub không có kế hoạch phát triển), spam nội dung vô nghĩa, hoặc vandalism ' +
                          '= bị từ chối/xoá qua hàng chờ kiểm duyệt.'
                }
            ]));
            page.appendChild(s1);

            /* 02 — Phân loại */
            var s2 = MH.section({ tag: '02 <em>//</em> Phân loại', heading: 'Phân loại nội dung' });
            s2.appendChild(MH.prose([
                'Dùng <strong>đúng rating</strong> — đây là trách nhiệm của Writer, không phải BQT.'
            ]));
            s2.appendChild(MH.roles([
                { name: '13+', desc: 'An toàn. Bạo lực nhẹ. Không có tình dục.' },
                { name: '16+', desc: 'Bạo lực trung bình. Yếu tố trưởng thành nhẹ.' },
                { name: '18+', desc: 'Bạo lực nặng, tình dục, trauma nặng, self-harm reference. Bắt buộc cảnh báo rõ ràng.' }
            ]));
            s2.appendChild(MH.steps([
                {
                    main: 'Nội dung kinh dị và gore',
                    sub:  'Được chấp nhận nếu có ý nghĩa với cốt truyện hoặc nhân vật — đây là wiki kinh dị, gore là một phần của thể loại. ' +
                          'Mô tả bạo lực chỉ để "gây sốc" mà không có mục đích tường thuật = bị xoá. ' +
                          'Bài có gore nặng bắt buộc rating 18+ và cảnh báo rõ ràng.'
                },
                {
                    main: 'Nội dung 18+ và tình dục',
                    sub:  'Được phép nếu đặt sau lớp bảo vệ (Ảnh Bảo Mật / phân loại 18+). ' +
                          'Không được xuất hiện ở đầu bài hoặc phần tóm tắt hiển thị công khai.'
                },
                {
                    main: 'Cảnh báo nội dung (Content Warning)',
                    sub:  'Bắt buộc với: trauma nặng, self-harm, tự tử, lạm dụng, phân biệt đối xử trong lore. ' +
                          'Dùng bản mẫu Phân Loại chuẩn — không tự ý viết cảnh báo kiểu khác.'
                }
            ]));
            s2.appendChild(MH.prose([
                'Phân loại sai = Warning. BQT có quyền điều chỉnh rating nếu đánh giá mức hiện tại chưa phù hợp với nội dung thực tế.'
            ]));
            page.appendChild(s2);

            /* 03 — Ranh giới pháp lý */
            var s3 = MH.section({ tag: '03 <em>//</em> Pháp lý', heading: 'Ranh giới pháp lý và đạo đức' });
            s3.appendChild(MH.steps([
                {
                    main: 'Không chính trị và tôn giáo thực tế',
                    sub:  'Cấm dùng Wiki để cổ xuý quan điểm chính trị/tôn giáo thực tế, hoặc tạo xung đột có chủ ý dựa trên chúng. ' +
                          'Thế giới hư cấu có hệ thống chính trị/tôn giáo riêng → hoàn toàn OK, miễn là không nhắm vào thực tế.'
                },
                {
                    main: 'Không cổ xuý tội ác thực tế',
                    sub:  'Cấm nội dung khuyến khích hoặc hướng dẫn chi tiết có thể áp dụng thực tế: khủng bố, tự tử, bạo lực có tổ chức. ' +
                          'Mô tả tội ác trong lore hư cấu → OK nếu không phải hướng dẫn thực hành. ' +
                          'Vi phạm = TERMINATION ngay lập tức.'
                }
            ]));
            s3.appendChild(MH.infobox(
                '<strong>Tuyệt đối cấm nội dung xâm hại trẻ em (CSAM).</strong> ' +
                'Mọi nội dung mô tả, gợi ý hoặc cổ xuý hành vi tình dục hoặc bạo lực nhắm vào người dưới 18 tuổi — dù là hư cấu. ' +
                'Vi phạm = TERMINATION ngay + báo cáo cơ quan có thẩm quyền. <strong>Không có quy trình kháng cáo.</strong>', true));
            s3.appendChild(MH.prose([
                '<strong>Tuân thủ pháp luật Hoa Kỳ.</strong> Wiki hoạt động trên hạ tầng Miraheze (Hoa Kỳ). ' +
                'Nội dung vi phạm DMCA, CSAM laws hoặc các quy định liên bang = bị xoá ngay và có thể bị báo cáo cơ quan chức năng.'
            ]));
            page.appendChild(s3);

            /* 04 — Bản quyền & tài sản */
            var s4 = MH.section({ tag: '04 <em>//</em> Bản quyền', heading: 'Bản quyền và tài sản' });
            s4.appendChild(MH.steps([
                {
                    main: 'Không sao chép có bản quyền',
                    sub:  'Cấm đăng văn bản, nhân vật, artwork, lore từ tác phẩm có bản quyền ' +
                          '(sách, truyện, wiki khác, game, phim) mà không có quyền sử dụng hợp lệ.'
                },
                {
                    main: 'Quyền của tác giả',
                    sub:  'Bài đăng lên Wiki vẫn là tài sản tinh thần của bạn. M.A.P.L.E có quyền lưu trữ, ' +
                          'hiển thị và backup nội dung, nhưng không dùng cho mục đích thương mại. ' +
                          'Xem chi tiết về giấy phép tại Điều khoản Bản quyền.'
                },
                {
                    main: 'Không sửa bài người khác',
                    sub:  'Sửa nội dung có ý nghĩa (>20% bài) mà chưa xin phép tác giả = Warning. ' +
                          'Ngoại lệ không cần xin trước: sửa lỗi chính tả nhỏ, link hỏng, CSS — sau đó thông báo tác giả.'
                }
            ]));
            s4.appendChild(MH.btns([
                MH.btn('/wiki/D%E1%BB%B1_%C3%A1n:B%E1%BA%A3n_quy%E1%BB%81n', '📄 Điều khoản Bản quyền', false)
            ]));
            page.appendChild(s4);

            /* 05 — Hệ thống vi phạm */
            var s5 = MH.section({ tag: '05 <em>//</em> Vi phạm', heading: 'Hệ thống xử lý vi phạm' });
            s5.appendChild(MH.roles([
                {
                    name: 'Strike 1 — Warning',
                    desc: 'Đình chỉ đăng bài 3 ngày. Bài vi phạm bị ẩn để sửa lại. ' +
                          'VD: phân loại rating sai, sửa bài người khác, stub quá sơ sài.'
                },
                {
                    name: 'Strike 2 — Isolation',
                    desc: 'Cấm toàn bộ hoạt động (đăng bài, chỉnh sửa) trong 14 ngày. Bài cũ vẫn hiển thị. ' +
                          'VD: tái phạm Strike 1, copy-paste một phần khai báo không đầy đủ, AI-assisted quá mức.'
                },
                {
                    name: 'Strike 3 — Termination',
                    desc: 'Khoá vĩnh viễn + Blacklist. Bài bị ẩn hoặc xoá tuỳ nội dung. ' +
                          'VD: copy-paste rõ ràng, AI viết bài, cổ xuý tội ác, CSAM.'
                }
            ]));
            s5.appendChild(MH.infobox(
                '<strong>Xoá vĩnh viễn (không qua 3 bước):</strong> đạo văn rõ ràng không thể sửa, vi phạm Điều 3.2–3.3, ' +
                'có yêu cầu pháp lý (DMCA takedown), spam/vandalism/hack. ' +
                'Lỗi khác → bài chỉ bị ẩn đến khi sửa xong.'
            ));
            s5.appendChild(MH.prose([
                'Kháng cáo: gửi cho BQT trong vòng 7 ngày kể từ quyết định, kèm lý do cụ thể và bằng chứng. ' +
                'Spam kháng cáo vô lý → cộng thêm 1 Strike.'
            ]));
            s5.appendChild(MH.btns([
                MH.btn('/wiki/D%E1%BB%B1_%C3%A1n:Kh%C3%A1ng_c%C3%A1o', '⚖️ Trang Kháng cáo', false)
            ]));
            page.appendChild(s5);

            /* 06 — Quyền hạn BQT */
            var s6 = MH.section({ tag: '06 <em>//</em> BQT', heading: 'Quyền hạn Ban Quản Trị' });
            s6.appendChild(MH.prose([
                'BQT có quyền yêu cầu tác giả chỉnh sửa nếu bài có vấn đề về trình bày, phân loại sai hoặc cấu trúc lộn xộn. ' +
                'Tác giả có <strong>7 ngày</strong> để sửa — quá hạn thì bài bị ẩn cho đến khi hoàn thiện.',
                'BQT có quyền điều chỉnh rating, thêm/sửa cảnh báo nội dung, hoặc di chuyển bài sang namespace phù hợp ' +
                'mà không cần xin phép tác giả — sau đó sẽ thông báo.',
                'Quyết định của BQT sau khi xem xét kháng cáo hợp lệ là quyết định cuối cùng trong phạm vi Wiki.'
            ]));
            page.appendChild(s6);

            /* FAQ */
            var sf = MH.section({ tag: '07 <em>//</em> FAQ', heading: 'Câu hỏi thường gặp' });
            sf.appendChild(MH.faq([
                {
                    q: 'Role-play trong bài có được không?',
                    a: 'Được — đây là wiki sáng tác, role-play chính là nội dung chính. ' +
                       'Điều khoản này KHÔNG cấm role-play trong bài viết. ' +
                       'Những quy định về ứng xử trong Chat thuộc Điều khoản Người Dùng, không liên quan ở đây.'
                },
                {
                    q: 'Tôi có thể dùng AI để viết không?',
                    a: 'Được dùng hỗ trợ (sửa văn phong, ảnh minh họa, brainstorm ý tưởng) nhưng không được để AI viết thay ' +
                       '≥60% nội dung chính. Bài AI-ghostwritten sẽ bị xoá và tính Strike 3 ngay.'
                },
                {
                    q: 'Bài của tôi bị ẩn mà không báo trước, sao vậy?',
                    a: 'Thường xảy ra khi bài vi phạm rating, lore cốt lõi hoặc bản quyền. ' +
                       'BQT sẽ để lại lý do trên trang thảo luận hoặc nhắn trong Chat. ' +
                       'Nếu bạn cho rằng việc ẩn không hợp lý → kháng cáo trong 7 ngày.'
                },
                {
                    q: 'Tôi muốn thay đổi một khái niệm nền tảng của The Maze, có được không?',
                    a: 'Liên hệ BQT trước và trình bày ý tưởng. Nếu được phê duyệt → bạn là người mở canon mới. ' +
                       'Không xin phép mà tự đổi → bài bị xoá ngay.'
                },
                {
                    q: 'Tôi có thể viết về nhân vật của tác giả khác không?',
                    a: 'Được nếu tác giả đó đồng ý. Cần xin phép trước và ghi công rõ ràng trong bài. ' +
                       'Viết không xin phép = vi phạm Điều 4.3, tính Warning.'
                }
            ]));
            page.appendChild(sf);

            /* CTA */
            page.appendChild(MH.stuck({
                tag:  'Muốn trở thành Writer?',
                text: 'Xem hướng dẫn xin quyền Writer và quy trình kiểm duyệt bài đầu tiên.'
            }));
            page.appendChild(MH.btns([
                MH.btn('/wiki/D%E1%BB%B1_%C3%A1n:Xin_quy%E1%BB%81n_Writer', '✍️ Xin quyền Writer', true),
                MH.btn('/wiki/D%E1%BB%B1_%C3%A1n:B%E1%BA%A3n_quy%E1%BB%81n', '📄 Điều khoản Bản quyền', false)
            ]));
        });
    }

    if (window.MHHelp) build(window.MHHelp);
    else if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(build);
})();
