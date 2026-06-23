/* ============================================
   M.A.P.L.E — MediaWiki:DuAn-GioiThieu.js
   Trang Dự án:Giới thiệu — về Wiki, cộng đồng & cách tham gia
   Yêu cầu: TroGiup-Common.js (window.MHHelp) đã nạp trước (Common.js lo).
   ============================================ */
(function () {
    'use strict';

    function build(MH) {
        MH.mount(function (page) {

            var h = MH.hero({
                crumb:   'Giới thiệu',
                eyebrow: 'Cổng thông tin chính thức — Dự án M.A.P.L.E Wiki',
                title:   'CHÀO MỪNG ĐẾN <em>M.A.P.L.E</em>',
                sub:     'Một cơ sở dữ liệu hồ sơ mật về những điều bất thường bên trong The Maze — được xây dựng bởi cộng đồng.'
            });
            var logo = (window.MAPLE && window.MAPLE.logoSVG) ? window.MAPLE.logoSVG(88) : '';
            h.insertBefore(MH.el('div', 'mhd3-hero-logo', logo), h.firstChild);
            page.appendChild(h);

            /* 01 — Wiki này là gì */
            var s1 = MH.section({ tag: '01 <em>//</em> Tổng quan', heading: 'Wiki này là gì?' });
            s1.appendChild(MH.prose([
                '<strong>M.A.P.L.E Wiki</strong> là nền tảng lưu trữ và chia sẻ nội dung sáng tác hư cấu của dự án ' +
                '<strong>M.A.P.L.E</strong> — một tổ chức hư cấu chuyên ghi chép, phân loại và nghiên cứu ' +
                'các thực thể, vật phẩm dị thường và hiện tượng bí ẩn bên trong <strong>The Maze</strong>.',
                'Lấy cảm hứng từ thể loại SCP Foundation và creepypasta, mỗi bài viết trên Wiki là một hồ sơ: ' +
                'thực thể, vật phẩm, nhật ký sống sót, hoặc giao thức an toàn — được trình bày theo phong cách tài liệu nội bộ.'
            ]));
            s1.appendChild(MH.infobox(
                'Wiki vận hành trên nền tảng <strong>Miraheze</strong> — phi lợi nhuận, không quảng cáo. ' +
                'Mọi nội dung đều do cộng đồng tạo ra và duy trì.'));
            page.appendChild(s1);

            /* 02 — The Maze */
            var s2 = MH.section({ tag: '02 <em>//</em> Thế giới', heading: 'The Maze là gì?' });
            s2.appendChild(MH.prose([
                '<strong>The Maze</strong> là một không gian mê cung vô hạn, nơi các quy luật vật lý thông thường ' +
                'không còn đáng tin cậy. Thực thể sinh sống ở đây, môi trường biến đổi không theo quy luật, ' +
                'và mỗi người lạc vào đều đối mặt với một thực tại khác.',
                'Nhiệm vụ của M.A.P.L.E là ghi nhận mọi thứ — dù nguy hiểm đến đâu — để những người đến sau ' +
                'có thêm cơ hội sống sót và hiểu được bản chất thực sự của The Maze.'
            ]));
            page.appendChild(s2);

            /* 03 — Hệ thống hồ sơ */
            var s3 = MH.section({ tag: '03 <em>//</em> Nội dung', heading: 'Hệ thống hồ sơ' });
            s3.appendChild(MH.steps([
                { main: 'Hồ Sơ Thực Thể', sub: 'Phân loại, mô tả hành vi, mức độ nguy hiểm và giao thức xử lý các sinh vật/thực thể dị thường trong The Maze.' },
                { main: 'Vật Phẩm Dị Thường', sub: 'Ghi chép các đồ vật có tính chất bất thường — nguồn gốc, tác dụng, rủi ro và điều kiện lưu trữ an toàn.' },
                { main: 'Nhật Ký Sống Sót', sub: 'Ghi chép từ những người đã trải nghiệm The Maze trực tiếp — là nguồn dữ liệu quý giá nhất và nguy hiểm nhất.' },
                { main: 'Giao Thức & Thủ Tục', sub: 'Hướng dẫn hành động trong các tình huống cụ thể — được biên soạn từ dữ liệu thu thập và xác minh bởi đội nghiên cứu.' }
            ]));
            page.appendChild(s3);

            /* 04 — Phân quyền */
            var s4 = MH.section({ tag: '04 <em>//</em> Cộng đồng', heading: 'Vai trò trong Wiki' });
            s4.appendChild(MH.roles([
                { role: 'Độc Giả', items: ['Đọc tất cả nội dung công khai', 'Bình luận & thảo luận', 'Tham gia sự kiện'] },
                { role: 'Writer', items: ['Tạo và chỉnh sửa hồ sơ', 'Gửi bài qua hàng chờ duyệt', 'Tích lũy Điểm Uy Tín (RP)'], edit: true },
                { role: 'Kiểm Duyệt Viên', items: ['Xét duyệt hàng chờ', 'Quản lý nội dung', 'Hỗ trợ Writer mới'], edit: true },
                { role: 'BQT / Founder', items: ['Vận hành hệ thống', 'Phân quyền & chính sách', 'Quản trị kỹ thuật'], edit: true }
            ]));
            page.appendChild(s4);

            /* 05 — Tính năng đặc thù */
            var s5 = MH.section({ tag: '05 <em>//</em> Tính năng', heading: 'Điểm nổi bật' });
            s5.appendChild(MH.steps([
                { main: 'Hệ thống Điểm Uy Tín (RP)', sub: 'Đóng góp chất lượng → nhận RP → mở khóa quyền truy cập và huy hiệu đặc biệt.' },
                { main: 'Phân loại độ tuổi', sub: 'Nội dung được phân loại 13+ / 16+ / 18+. Mỗi mức có lớp bảo vệ riêng để đảm bảo phù hợp người đọc.' },
                { main: 'MAPLE Chat', sub: 'Hệ thống nhắn tin nội bộ — thảo luận trực tiếp với cộng đồng, không cần app bên ngoài.' },
                { main: 'Sự kiện định kỳ', sub: 'Sự kiện viết lore, thử thách sáng tác và nhiệm vụ cộng đồng — phần thưởng huy hiệu độc quyền.' }
            ]));
            page.appendChild(s5);

            /* 06 — Bắt đầu */
            var s6 = MH.section({ tag: '06 <em>//</em> Bắt đầu', heading: 'Làm sao để tham gia?' });
            s6.appendChild(MH.prose([
                'Chỉ cần tạo tài khoản Miraheze (miễn phí) là bạn đã có thể đọc, bình luận và theo dõi Wiki. ' +
                'Để đóng góp nội dung, hãy đăng ký vai trò Writer — xem hướng dẫn tại trang Đóng Góp.'
            ]));
            var bs = MH.btns();
            bs.appendChild(MH.btn('/wiki/Kho_L%C6%B0u_Tr%E1%BB%AF',       'Kho Lưu Trữ', true));
            bs.appendChild(MH.btn('/wiki/Th%E1%BB%A7_T%E1%BB%A5c',         'Thủ Tục'));
            bs.appendChild(MH.btn('/wiki/%C4%90%C3%B3ng_G%C3%B3p',          'Đóng Góp'));
            bs.appendChild(MH.btn('/wiki/Quy_T%E1%BA%AFc',                  'Quy Tắc'));
            bs.appendChild(MH.btn('/wiki/%C4%90i%E1%BB%81u_Kho%E1%BA%A3n',  'Điều Khoản'));
            s6.appendChild(bs);
            page.appendChild(s6);

            page.appendChild(MH.stuck({
                tag:  'Muốn tham gia đội ngũ?',
                text: 'Liên hệ BQT qua MAPLE Chat để biết cách trở thành Writer hoặc Kiểm Duyệt Viên.'
            }));
        });
    }

    if (window.MHHelp) build(window.MHHelp);
    else if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(build);
})();
