/* ============================================
   M.A.P.L.E — MediaWiki:QuyTac.js
   Trang Quy Tắc cộng đồng (namespace chính)
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
                crumb:   'Quy Tắc',
                eyebrow: 'Bộ quy tắc & đạo đức cộng đồng M.A.P.L.E — áp dụng cho mọi thành viên',
                title:   'QUY TẮC <em>CỘNG ĐỒNG</em>',
                sub:     'Đọc kỹ trước khi đóng góp. Vi phạm có thể dẫn tới khoá quyền hoặc cấm tài khoản.'
            })));

            /* 01 — Nguyên tắc chung */
            var s1 = MH.section({ tag: '01 <em>//</em> Nguyên tắc chung', heading: 'Tôn trọng & xây dựng' });
            s1.appendChild(MH.prose([
                'M.A.P.L.E là dự án sáng tác hợp tác. Hãy <strong>tôn trọng</strong> công sức của người khác, ' +
                'giữ thái độ xây dựng và thiện chí trong mọi trao đổi.',
                'Mọi nội dung phải phù hợp thuần phong mỹ tục, tuân thủ pháp luật và chính sách của Miraheze.'
            ]));
            page.appendChild(s1);

            /* 02 — Nội dung & biên tập */
            var s2 = MH.section({ tag: '02 <em>//</em> Nội dung', heading: 'Tiêu chuẩn bài viết' });
            s2.appendChild(MH.steps([
                { main: 'Đúng định dạng', sub: 'Dùng các bản mẫu chuẩn (Hồ Sơ Thực Thể / Vật Phẩm / Nhật Ký, Dossier) và phân loại nội dung đúng độ tuổi.' },
                { main: 'Nguyên bản & dẫn nguồn', sub: 'Không sao chép bài của wiki khác. Nếu phỏng theo, hãy ghi rõ nguồn cảm hứng.' },
                { main: 'Gắn cảnh báo phù hợp', sub: 'Nội dung nhạy cảm phải dùng bản mẫu Phân Loại + Ảnh Bảo Mật, đặt mức tuổi đúng (13+/16+/18+).' },
                { main: 'Chất lượng tối thiểu', sub: 'Bài quá sơ sài, spam hoặc phá hoại sẽ bị từ chối/xoá khi qua hàng chờ kiểm duyệt.' }
            ]));
            page.appendChild(s2);

            /* 03 — Ứng xử */
            var s3 = MH.section({ tag: '03 <em>//</em> Ứng xử', heading: 'Quy tắc giao tiếp' });
            s3.appendChild(MH.infobox(
                '<strong>Nghiêm cấm:</strong> công kích cá nhân, phân biệt đối xử, quấy rối, ngôn từ thù ghét, ' +
                'spam, và chia sẻ liên kết độc hại. Hệ thống kiểm duyệt từ ngữ & liên kết được bật toàn site.', true));
            s3.appendChild(MH.prose([
                'Tranh luận về nội dung là bình thường — nhưng hãy nhắm vào <strong>vấn đề</strong>, không nhắm vào <strong>con người</strong>.',
                'Tôn trọng quyết định của Kiểm Duyệt Viên và Quản Trị Viên. Nếu không đồng ý, hãy phản hồi lịch sự qua MAPLE Chat.'
            ]));
            page.appendChild(s3);

            /* 04 — Vi phạm */
            var s4 = MH.section({ tag: '04 <em>//</em> Xử lý', heading: 'Khi vi phạm' });
            s4.appendChild(MH.steps([
                { main: 'Nhắc nhở', sub: 'Vi phạm nhẹ lần đầu — cảnh báo & hướng dẫn sửa.' },
                { main: 'Gỡ/khoá nội dung', sub: 'Nội dung vi phạm bị gỡ hoặc khoá chỉnh sửa.' },
                { main: 'Hạn chế quyền', sub: 'Tái phạm — tạm thu hồi quyền chỉnh sửa.' },
                { main: 'Cấm tài khoản', sub: 'Vi phạm nghiêm trọng (phá hoại, nội dung phạm pháp) — cấm vĩnh viễn, có thể báo cáo cơ quan chức năng.' }
            ]));
            page.appendChild(s4);

            /* FAQ */
            var sf = MH.section({ tag: '05 <em>//</em> FAQ', heading: 'Câu hỏi thường gặp' });
            sf.appendChild(MH.faq([
                { q: 'Tôi vừa bị từ chối bài, phải làm sao?', a: 'Đọc lý do trong hàng chờ kiểm duyệt, sửa theo góp ý rồi gửi lại. Xem thêm <a href="/wiki/H%C6%B0%E1%BB%9Bng_D%E1%BA%ABn_Vi%E1%BA%BFt">Hướng Dẫn Viết</a>.' },
                { q: 'Ai có quyền duyệt bài?', a: 'Kiểm Duyệt Viên trở lên. Xem hệ thống vai trò tại trang cá nhân của bạn.' },
                { q: 'Tôi có thể viết nội dung 18+ không?', a: 'Được, nếu gắn phân loại độ tuổi đúng và dùng bản mẫu Ảnh Bảo Mật cho phần nhạy cảm. Nội dung phạm pháp thì tuyệt đối không.' }
            ]));
            page.appendChild(sf);

            /* Liên hệ */
            page.appendChild(MH.stuck({
                tag:  'Có thắc mắc về quy tắc?',
                text: 'Nhắn trực tiếp cho đội ngũ quản trị — chúng tôi sẽ giải thích và hỗ trợ bạn.'
            }));
        });
    }

    if (window.MHHelp) build(window.MHHelp);
    else if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(build);
})();
