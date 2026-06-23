/**
 * M.A.P.L.E — MediaWiki:TroGiup-AnhBaoMat.js  (mhd3)
 * Trang Trợ_giúp:Ảnh_Bảo_Mật — hướng dẫn template Ảnh Bảo Mật
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/[AẢ]nh.*B[aả]o/i.test(decoded)) return;
    if (pn && pn !== 'Trợ_giúp:Ảnh_Bảo_Mật' && !/[AẢ]nh.*B[aả]o/i.test(decoded)) return;

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
                crumb: 'Ảnh Bảo Mật',
                eyebrow: 'Bản mẫu — Ảnh bảo mật',
                title: 'ẢNH <em>BẢO MẬT</em>',
                sub: 'Hiển thị ảnh với lớp mã hóa — click để giải mã và xem nội dung.'
            }));

            var s1 = H.section({ id: 'intro', tag: '01 <em>//</em> Giới thiệu', heading: 'Giới Thiệu' });
            s1.appendChild(H.prose('Template Ảnh Bảo Mật hiển thị ảnh với lớp mã hóa phủ lên — người dùng cần click để "giải mã" và xem ảnh thực sự. Dùng khi ảnh chứa nội dung nhạy cảm, kinh dị, hoặc hình ảnh thực thể nguy hiểm.'));
            page.appendChild(s1);

            var s2 = H.section({ id: 'syntax', tag: '02 <em>//</em> Cú pháp', heading: 'Cú Pháp' });
            s2.appendChild(H.code('Wikitext',
                '{{Ảnh Bảo Mật\n| src     = https://url-anh.jpg\n| ref     = VIS-001\n| level   = 4\n| rating  = 16\n| caption = Chú thích ảnh sau khi giải mã\n| ratio   = 16/9\n}}'));
            page.appendChild(s2);

            var s3 = H.section({ id: 'params', tag: '03 <em>//</em> Tham số', heading: 'Danh Sách Tham Số' });
            s3.appendChild(H.params([
                ['src',     'URL ảnh (bắt buộc)', '(trống)'],
                ['ref',     'Mã tham chiếu ảnh', 'VIS-001'],
                ['level',   'Cấp độ bảo mật 1–5 (hiển thị trên lớp phủ)', '4'],
                ['rating',  'Cấp độ nội dung: 13 / 16 / 18', '(trống)'],
                ['caption', 'Chú thích hiển thị sau khi mở', '(trống)'],
                ['ratio',   'Tỉ lệ ảnh: 16/9 | 4/3 | 3/4 | 1/1', '16/9'],
            ], ['Tham số', 'Mô tả', 'Mặc định']));
            page.appendChild(s3);

            var s4 = H.section({ id: 'notes', tag: '04 <em>//</em> Lưu ý', heading: 'Lưu Ý' });
            s4.appendChild(H.infobox('<strong>Bắt buộc có src:</strong> tham số src là bắt buộc. Nếu để trống, template sẽ hiển thị khung trống.', true));
            s4.appendChild(H.infobox('<strong>Level vs Rating:</strong> level là cấp bảo mật kỹ thuật (1–5), rating là cấp độ nội dung cho người xem (13/16/18). Hai tham số độc lập.'));
            s4.appendChild(H.infobox('<strong>Dùng trong Dossier:</strong> để nhúng ảnh bảo mật vào Dossier, dùng anh_src + anh_rating thay vì template này. Template này chỉ dùng khi cần ảnh độc lập ngoài Dossier.'));
            page.appendChild(s4);
        });
      });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
