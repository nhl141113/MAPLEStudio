/**
 * M.A.P.L.E — MediaWiki:TroGiup-GioiThieu.js  (mhd3)
 * Trang Trợ_giúp:Giới_thiệu
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/Gi[oớ]i.*thi[eệ]u/i.test(decoded)) return;
    if (pn && pn !== 'Trợ_giúp:Giới_thiệu' && !/Gi[oớ]i.*thi[eệ]u/i.test(decoded)) return;

    function whenReady(cb) {
        if (window.MHHelp) return cb(window.MHHelp);
        if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(function (H) { if (H) cb(H); });
        var n = 0, t = setInterval(function () {
            if (window.MHHelp) { clearInterval(t); cb(window.MHHelp); }
            else if (++n > 40) clearInterval(t);
        }, 50);
    }

    var TEMPLATES = [
        ['{{Dossier}}',            'Khung hồ sơ tổng hợp (dùng cho phần lớn bài viết)'],
        ['{{Hồ Sơ Thực Thể}}',    'Hồ sơ entity dạng RecordCard'],
        ['{{Hồ Sơ Nhật Ký}}',     'Ghi chép sự kiện thực địa'],
        ['{{Hồ Sơ Vật Phẩm}}',    'Kiểm kê đồ vật thu hồi'],
        ['{{Ảnh Bảo Mật}}',        'Ảnh có lớp mã hóa click-to-reveal'],
        ['{{Phân Loại Nội Dung}}', 'Thẻ cảnh báo độ tuổi 13/16/18+'],
    ];

    function build() {
      whenReady(function (H) {
        H.mount(function (page) {
            page.appendChild(H.hero({
                crumb: 'Giới Thiệu',
                eyebrow: 'Bắt đầu — Giới thiệu về M.A.P.L.E',
                title: 'GIỚI <em>THIỆU</em>',
                sub: 'Tổ chức M.A.P.L.E — The Maze — và hệ thống tài liệu wiki.'
            }));

            var s1 = H.section({ id: 'maple', tag: '01 <em>//</em> Tổng quan', heading: 'M.A.P.L.E Wiki Là Gì?' });
            s1.appendChild(H.prose([
                'M.A.P.L.E Wiki là hệ thống lưu trữ tài liệu hư cấu của tổ chức M.A.P.L.E (Mapping, Assessment, Protocol, Logistics, Education) — một tổ chức hoạt động trong thế giới The Maze. Wiki này dùng để ghi chép hồ sơ thực thể, nhật ký thực địa, vật phẩm thu hồi, và các tài liệu nội bộ.',
                'Toàn bộ nội dung là sáng tác hư cấu. Mọi "sự kiện", "thực thể", và "giao thức" đều là phần của thế giới The Maze — <strong>không có thật</strong> trong cuộc sống thực.'
            ]));
            s1.appendChild(H.infobox(
                '<strong>Tổ chức:</strong> M.A.P.L.E &nbsp;·&nbsp; ' +
                '<strong>Nền tảng:</strong> Miraheze / MediaWiki &nbsp;·&nbsp; ' +
                '<strong>Thể loại:</strong> Wiki hư cấu / SCP-like &nbsp;·&nbsp; ' +
                '<strong>Ngôn ngữ:</strong> Tiếng Việt'));
            page.appendChild(s1);

            var s2 = H.section({ id: 'maze', tag: '02 <em>//</em> Bối cảnh', heading: 'The Maze Là Gì?' });
            s2.appendChild(H.prose([
                'The Maze là không gian mê cung hư cấu — một hệ thống vô tận các mê cung được sắp xếp theo thứ tự từ 001 đến vô hạn. Những người "No-Clip" (rơi xuyên khỏi thực tại thông thường) sẽ xuất hiện ở Maze số 001.',
                'M.A.P.L.E hoạt động bên trong và xung quanh The Maze, có nhiệm vụ: điều phối và hỗ trợ người bị mắc kẹt, nghiên cứu và phân loại các thực thể, thu hồi và kiểm kê vật phẩm bất thường, duy trì hệ thống tài liệu nội bộ.'
            ]));
            page.appendChild(s2);

            var s3 = H.section({ id: 'contrib', tag: '03 <em>//</em> Đóng góp', heading: 'Ai Có Thể Đóng Góp?' });
            s3.appendChild(H.prose([
                'Bất kỳ thành viên đã đăng ký đều có thể viết và chỉnh sửa trang wiki sau khi được cấp quyền Writer. Mọi bài viết phải tuân theo điều khoản nội dung và chuẩn định dạng của M.A.P.L.E.',
                'Trước khi bắt đầu viết, hãy đọc: <a href="/wiki/Trợ_giúp:Quy_tắc">Trợ_giúp:Quy_tắc</a> (điều khoản cộng đồng), <a href="/wiki/Trợ_giúp:Dossier">Trợ_giúp:Dossier</a> (template hồ sơ chính), và <a href="/wiki/Trợ_giúp:Wikitext">Trợ_giúp:Wikitext</a> (cú pháp wiki cơ bản).'
            ]));
            page.appendChild(s3);

            var s4 = H.section({ id: 'template', tag: '04 <em>//</em> Hệ thống', heading: 'Hệ Thống Template' });
            s4.appendChild(H.prose(
                'M.A.P.L.E Wiki sử dụng hệ thống template tùy chỉnh thay vì wikitext thuần. Phần lớn nội dung được render tự động từ data-attributes thông qua JavaScript — bạn chỉ cần điền tham số đúng định dạng.'));
            s4.appendChild(H.steps(TEMPLATES.map(function (row) {
                return { main: '<strong>' + row[0] + '</strong>', sub: row[1] };
            })));
            page.appendChild(s4);
        });
      });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
