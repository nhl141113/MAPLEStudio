/**
 * M.A.P.L.E — MediaWiki:TroGiup-Dossier.js  (mhd3)
 * Trang Trợ_giúp:Dossier — hướng dẫn sử dụng template Dossier
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    if (!pn || (pn !== 'Trợ_giúp:Dossier' && pn !== 'Tr%E1%BB%A3_gi%C3%BAp:Dossier')) {
        if (!/Tr[oợ].*gi[uú]p.*Dossier/i.test(decodeURIComponent(location.pathname))) return;
    }

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
                crumb: 'Dossier',
                eyebrow: 'Viết hồ sơ — Template Dossier',
                title: '<em>DOSSIER</em>',
                sub: 'Khung hồ sơ tổng hợp với header, ticker và sections linh hoạt.'
            }));

            var s1 = H.section({ id: 'intro', tag: '01 <em>//</em> Giới thiệu', heading: 'Giới Thiệu' });
            s1.appendChild(H.prose('Dossier là template hồ sơ tổng hợp của M.A.P.L.E Wiki — dùng để trình bày thông tin về thực thể, sự kiện, hoặc tài liệu bất kỳ dưới dạng hồ sơ mật có header, ticker chạy và footer hash. Toàn bộ layout được render tự động từ data-attributes.'));
            page.appendChild(s1);

            var s2 = H.section({ id: 'syntax', tag: '02 <em>//</em> Cú pháp', heading: 'Cú Pháp Cơ Bản' });
            s2.appendChild(H.code('Wikitext',
                '{{Dossier\n| header_left    = MAPLE ARCHIVE // DOC-001\n| header_right   = ACTIVE\n| ticker         = Dữ liệu A // Dữ liệu B\n| footer_hash    = 0xDEAD\n| footer_note    = Tài liệu nội bộ\n| side_left      = MAPLE\n| side_right     = ARCHIVE\n| anh_src        = https://url-anh.jpg\n| anh_ref        = VIS-001\n| anh_rating     = 16\n| anh_caption    = Chú thích\n| mo_ta          = Mô tả ngoại hình...\n| hanh_vi        = Mô tả hành vi...\n| quy_trinh      = Giao thức xử lý (tuỳ chọn)\n| aux_nhan_1     = Phân Loại\n| aux_noi_dung_1 = Entity-Class-A\n| aux_nhan_2     = Trạng Thái\n| aux_noi_dung_2 = Active\n}}'));
            page.appendChild(s2);

            var s3 = H.section({ id: 'params', tag: '03 <em>//</em> Tham số', heading: 'Danh Sách Tham Số' });
            s3.appendChild(H.params([
                ['header_left',    'Nhãn header trái (tên archive + mã tài liệu)', 'MAPLE ARCHIVE // DOC-001'],
                ['header_right',   'Nhãn header phải (trạng thái)', 'ACTIVE'],
                ['ticker',         'Văn bản chạy ngang, phân cách bằng //', 'M.A.P.L.E INTERNAL DOCUMENT'],
                ['footer_hash',    'Mã hash footer', '0xDEAD'],
                ['footer_note',    'Ghi chú footer', 'Tài liệu nội bộ'],
                ['side_left',      'Nhãn thanh bên trái', 'MAPLE'],
                ['side_right',     'Nhãn thanh bên phải', 'ARCHIVE'],
                ['anh_src',        'URL ảnh section Hình Dáng', '(trống)'],
                ['anh_ref',        'Mã tham chiếu ảnh', 'VIS-001'],
                ['anh_rating',     'Cấp độ ảnh: 13 / 16 / 18', '(trống)'],
                ['anh_caption',    'Chú thích ảnh', '(trống)'],
                ['mo_ta',          'Mô tả ngoại hình (section 01)', 'Chưa có dữ liệu.'],
                ['hanh_vi',        'Mô tả hành vi (section 02)', 'Chưa có dữ liệu.'],
                ['quy_trinh',      'Giao thức xử lý — section 03 (tuỳ chọn)', '(ẩn nếu trống)'],
                ['aux_nhan_1',     'Nhãn ô grid aux 1', 'Ghi Chú'],
                ['aux_noi_dung_1', 'Nội dung ô grid aux 1', '—'],
                ['aux_nhan_2',     'Nhãn ô grid aux 2', 'Phân Loại'],
                ['aux_noi_dung_2', 'Nội dung ô grid aux 2', '—'],
            ], ['Tham số', 'Mô tả', 'Mặc định']));
            page.appendChild(s3);

            var s4 = H.section({ id: 'notes', tag: '04 <em>//</em> Lưu ý', heading: 'Lưu Ý' });
            s4.appendChild(H.infobox('<strong>Quy trình tuỳ chọn:</strong> tham số quy_trinh sẽ ẩn hoàn toàn nếu để trống — không cần xoá dòng khỏi code.'));
            s4.appendChild(H.infobox('<strong>Ảnh bảo mật:</strong> nếu điền anh_rating (13/16/18), ảnh sẽ tự động hiển thị lớp bảo mật cần click để giải mã.'));
            s4.appendChild(H.infobox("<strong>Không dùng HTML:</strong> tham số mo_ta, hanh_vi, quy_trinh chỉ nhận wikitext — dùng '''bold''' thay cho &lt;strong&gt;, không dùng &lt;br&gt;.", true));
            page.appendChild(s4);
        });
      });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
