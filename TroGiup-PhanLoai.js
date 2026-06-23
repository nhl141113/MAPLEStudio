/**
 * M.A.P.L.E — MediaWiki:TroGiup-PhanLoai.js  (mhd3)
 * Trang Trợ_giúp:Phân_Loại — hướng dẫn template Phân Loại Nội Dung
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/Ph[aâ]n.*Lo[aạ]i/i.test(decoded)) return;
    if (pn && pn !== 'Trợ_giúp:Phân_Loại' && !/Ph[aâ]n.*Lo[aạ]i/i.test(decoded)) return;

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
                crumb: 'Phân Loại Nội Dung',
                eyebrow: 'Bản mẫu — Phân loại nội dung',
                title: 'PHÂN LOẠI <em>NỘI DUNG</em>',
                sub: 'Thẻ cảnh báo độ tuổi và nội dung nhạy cảm — đặt đầu mỗi trang cần cảnh báo.'
            }));

            var s1 = H.section({ id: 'intro', tag: '01 <em>//</em> Giới thiệu', heading: 'Giới Thiệu' });
            s1.appendChild(H.prose('Template Phân Loại Nội Dung hiển thị thẻ cảnh báo độ tuổi và nội dung nhạy cảm ở đầu trang. Bắt buộc đặt trước mọi nội dung 13+ / 16+ / 18+ để người đọc biết trước khi tiếp tục.'));
            page.appendChild(s1);

            var s2 = H.section({ id: 'syntax', tag: '02 <em>//</em> Cú pháp', heading: 'Cú Pháp' });
            s2.appendChild(H.code('Wikitext',
                '{{Phân Loại Nội Dung\n| muc        = 16\n| mo_ta      = Trang này chứa nội dung...\n| canh_bao   = Bạo lực;Ngôn ngữ mạnh;Kinh dị\n| loi_khuyen = Dành cho độc giả từ 16 tuổi trở lên.\n| tag        = #bao-luc #16+\n}}'));
            page.appendChild(s2);

            var s3 = H.section({ id: 'params', tag: '03 <em>//</em> Tham số', heading: 'Danh Sách Tham Số' });
            s3.appendChild(H.params([
                ['muc',        'Cấp độ tuổi: 13 / 16 / 18', '13'],
                ['mo_ta',      'Mô tả ngắn về nội dung trang', 'Không có mô tả.'],
                ['canh_bao',   'Danh sách cảnh báo, phân cách bằng dấu ;', '(trống)'],
                ['loi_khuyen', 'Lời khuyên cho người đọc', '(trống)'],
                ['tag',        'Hashtag phân loại, phân cách bằng dấu cách', '(trống)'],
            ], ['Tham số', 'Mô tả', 'Mặc định']));
            page.appendChild(s3);

            var s4 = H.section({ id: 'notes', tag: '04 <em>//</em> Lưu ý', heading: 'Lưu Ý' });
            s4.appendChild(H.infobox('<strong>Vị trí bắt buộc:</strong> template này phải đặt ở đầu trang, trước tất cả nội dung khác kể cả {{Hồ Sơ Thực Thể}} hay {{Dossier}}.', true));
            s4.appendChild(H.infobox('<strong>Dấu chấm phẩy cho canh_bao:</strong> tham số canh_bao dùng ; để phân tách nhiều mục, không dùng dấu phẩy hay xuống dòng.'));
            page.appendChild(s4);
        });
      });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
