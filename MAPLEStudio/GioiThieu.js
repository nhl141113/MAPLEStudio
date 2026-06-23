/* ============================================
   M.A.P.L.E — MediaWiki:GioiThieu.js
   Trang Giới Thiệu / Portal — về tổ chức & thế giới M.A.P.L.E
   Yêu cầu: TroGiup-Common.js (window.MHHelp) đã nạp trước (Common.js lo).
   ============================================ */
(function () {
    'use strict';

    function bigLogoHero(MH) {
        var h = MH.hero({
            crumb:   'Giới Thiệu',
            eyebrow: 'Cổng thông tin chính thức — Tổ chức M.A.P.L.E, chi nhánh Việt Nam',
            title:   'TỔ CHỨC <em>M.A.P.L.E</em>',
            sub:     'Ghi chép, phân loại và lưu trữ mọi điều bất thường bên trong The Maze.'
        });
        var logo = (window.MAPLE && window.MAPLE.logoSVG) ? window.MAPLE.logoSVG(88) : '';
        h.insertBefore(MH.el('div', 'mhd3-hero-logo', logo), h.firstChild);
        return h;
    }

    function build(MH) {
        MH.mount(function (page) {

            page.appendChild(bigLogoHero(MH));

            /* 01 — Là gì */
            var s1 = MH.section({ tag: '01 <em>//</em> Tổng quan', heading: 'M.A.P.L.E là gì?' });
            s1.appendChild(MH.prose([
                '<strong>M.A.P.L.E</strong> là một dự án sáng tác hợp tác (collaborative fiction) theo phong cách ' +
                'hồ sơ mật — nơi cộng đồng cùng xây dựng một vũ trụ kinh dị/huyền bí xoay quanh <strong>The Maze</strong>.',
                'Mỗi bài viết là một hồ sơ: thực thể, vật phẩm dị thường, nhật ký sống sót hoặc thủ tục an toàn. ' +
                'Tất cả được phân loại theo mức độ truy cập và độ tuổi, lưu trong cơ sở dữ liệu trung tâm.'
            ]));
            page.appendChild(s1);

            /* 02 — The Maze */
            var s2 = MH.section({ tag: '02 <em>//</em> Thế giới', heading: 'The Maze' });
            s2.appendChild(MH.prose(
                'The Maze là một không gian mê cung bất định, nơi các thực thể và hiện tượng dị thường tồn tại. ' +
                'Nhân sự M.A.P.L.E ghi nhận, nghiên cứu và biên soạn giao thức sinh tồn để những người đến sau có cơ hội sống sót.'));
            s2.appendChild(MH.infobox(
                'Mới làm quen thế giới? Bắt đầu với <a href="/wiki/Th%E1%BB%A7_T%E1%BB%A5c">Thủ Tục sinh tồn</a> ' +
                'rồi duyệt <a href="/wiki/Kho_L%C6%B0u_Tr%E1%BB%AF">Kho Lưu Trữ</a> để đọc hồ sơ thực thể.'));
            page.appendChild(s2);

            /* 03 — Tổ chức */
            var s3 = MH.section({ tag: '03 <em>//</em> Tổ chức', heading: 'Cấu trúc nhân sự' });
            s3.appendChild(MH.roles([
                { role: 'Độc Giả / Thành Viên', items: ['Đọc & bình luận', 'Tạo tài khoản'] },
                { role: 'Writer', items: ['Viết & chỉnh sửa hồ sơ'], edit: true },
                { role: 'Kiểm Duyệt Viên', items: ['Duyệt hàng chờ', 'Quản lý nội dung'], edit: true },
                { role: 'Quản Trị / Founder', items: ['Vận hành hệ thống', 'Phân quyền'], edit: true }
            ]));
            page.appendChild(s3);

            /* 04 — Khám phá */
            var s4 = MH.section({ tag: '04 <em>//</em> Khám phá', heading: 'Bắt đầu khám phá' });
            var bs = MH.btns();
            bs.appendChild(MH.btn('/wiki/Kho_L%C6%B0u_Tr%E1%BB%AF', 'Kho Lưu Trữ', true));
            bs.appendChild(MH.btn('/wiki/Th%E1%BB%A7_T%E1%BB%A5c', 'Thủ Tục'));
            bs.appendChild(MH.btn('/wiki/%C4%90%C3%B3ng_G%C3%B3p', 'Đóng Góp'));
            bs.appendChild(MH.btn('/wiki/Quy_T%E1%BA%AFc', 'Quy Tắc'));
            bs.appendChild(MH.btn('/wiki/Tr%E1%BB%A3_gi%C3%BAp', 'Trợ Giúp'));
            s4.appendChild(bs);
            page.appendChild(s4);

            page.appendChild(MH.stuck({
                tag:  'Muốn tham gia đội ngũ?',
                text: 'Nhắn đội ngũ quản trị để biết cách trở thành Writer hoặc Kiểm Duyệt Viên.'
            }));
        });
    }

    if (window.MHHelp) build(window.MHHelp);
    else if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(build);
})();
