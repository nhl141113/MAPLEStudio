/**
 * M.A.P.L.E — MediaWiki:TroGiup-Wikitext.js  (mhd3)
 * Trang Trợ_giúp:Wikitext
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/Wikitext/i.test(decoded)) return;
    if (pn && pn !== 'Trợ_giúp:Wikitext' && !/Wikitext/i.test(decoded)) return;

    function whenReady(cb) {
        if (window.MHHelp) return cb(window.MHHelp);
        if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(function (H) { if (H) cb(H); });
        var n = 0, t = setInterval(function () {
            if (window.MHHelp) { clearInterval(t); cb(window.MHHelp); }
            else if (++n > 40) clearInterval(t);
        }, 50);
    }

    function build() {
      whenReady(function (H) {
        H.mount(function (page) {
            page.appendChild(H.hero({
                crumb: 'Wikitext',
                eyebrow: 'Cú pháp — Wikitext cơ bản',
                title: 'WIKI<em>TEXT</em>',
                sub: 'Ngôn ngữ đánh dấu MediaWiki — định dạng, liên kết, ảnh, bảng.'
            }));

            var s1 = H.section({ id: 'format', tag: '01 <em>//</em> Định dạng', heading: 'Định Dạng Văn Bản' });
            s1.appendChild(H.syntax([
                ["'''văn bản'''",        'In đậm'],
                ["''văn bản''",          'In nghiêng'],
                ["'''''văn bản'''''",    'In đậm + nghiêng'],
                ['<u>văn bản</u>',       'Gạch chân'],
                ['<s>văn bản</s>',       'Gạch ngang (strikethrough)'],
                ['<code>văn bản</code>', 'Code inline (monospace)'],
                ['<br>',                 'Xuống dòng (không tạo đoạn mới)'],
                ['(dòng trống)',         'Tạo đoạn văn mới'],
            ]));
            page.appendChild(s1);

            var s2 = H.section({ id: 'headings', tag: '02 <em>//</em> Tiêu đề', heading: 'Tiêu Đề' });
            s2.appendChild(H.syntax([
                ['= Tiêu đề =',       'h1 — ít dùng (tương đương tên trang)'],
                ['== Tiêu đề ==',     'h2 — mục chính'],
                ['=== Tiêu đề ===',   'h3 — mục phụ'],
                ['==== Tiêu đề ====', 'h4 — mục nhỏ'],
            ]));
            s2.appendChild(H.code('Ví dụ', '== Hành Vi ==\n=== Phản Ứng Với Ánh Sáng ===\n=== Phản Ứng Với Âm Thanh ==='));
            page.appendChild(s2);

            var s3 = H.section({ id: 'links', tag: '03 <em>//</em> Liên kết', heading: 'Liên Kết' });
            s3.appendChild(H.syntax([
                ['[[Tên trang]]',             'Liên kết trong wiki'],
                ['[[Tên trang|Hiển thị]]',    'Liên kết với tên tùy chỉnh'],
                ['[[Tên trang#Mục tiêu đề]]', 'Liên kết đến mục cụ thể'],
                ['[https://example.com Tên]', 'Liên kết ngoài'],
                ['[https://example.com]',     'Liên kết ngoài (tự đánh số [1])'],
            ]));
            s3.appendChild(H.code('Ví dụ', '[[Trợ_giúp:Dossier|Hướng dẫn Dossier]]\n[[Kho Lưu Trữ]]'));
            page.appendChild(s3);

            var s4 = H.section({ id: 'lists', tag: '04 <em>//</em> Danh sách', heading: 'Danh Sách' });
            s4.appendChild(H.syntax([
                ['* Mục 1',    'Danh sách chấm tròn (ul)'],
                ['** Mục con', 'Thụt vào một cấp'],
                ['# Mục 1',    'Danh sách đánh số (ol)'],
                ['; Thuật ngữ','Danh sách định nghĩa (dt)'],
                [': Định nghĩa','Giải thích (dd)'],
            ]));
            page.appendChild(s4);

            var s5 = H.section({ id: 'images', tag: '05 <em>//</em> Hình ảnh', heading: 'Hình Ảnh' });
            s5.appendChild(H.syntax([
                ['[[Tập tin:tên.jpg]]',                 'Ảnh kích thước gốc'],
                ['[[Tập tin:tên.jpg|300px]]',           'Ảnh rộng 300px'],
                ['[[Tập tin:tên.jpg|thumb|Chú thích]]', 'Thumbnail có chú thích'],
                ['[[Tập tin:tên.jpg|right|200px]]',     'Ảnh bên phải, 200px'],
            ]));
            page.appendChild(s5);

            var s6 = H.section({ id: 'misc', tag: '06 <em>//</em> Khác', heading: 'Khác' });
            s6.appendChild(H.syntax([
                ['----',              'Đường kẻ ngang (hr)'],
                ['__TOC__',           'Hiển thị mục lục tại vị trí này'],
                ['__NOTOC__',         'Ẩn mục lục tự động'],
                ['__NOEDITSECTION__', 'Ẩn nút [sửa đổi] bên cạnh tiêu đề'],
                ['[[Thể loại:Tên]]',  'Thêm trang vào thể loại (đặt cuối trang)'],
            ]));
            page.appendChild(s6);
        });
      });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
