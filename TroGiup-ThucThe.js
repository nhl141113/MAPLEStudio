/**
 * M.A.P.L.E — MediaWiki:TroGiup-ThucThe.js  (mhd3)
 * Trang Trợ_giúp:Thực_Thể — hướng dẫn template Hồ Sơ Thực Thể
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/Th[uự]c.*Th[eể]/i.test(decoded)) return;
    if (pn && pn !== 'Trợ_giúp:Thực_Thể' && !/Th[uự]c.*Th[eể]/i.test(decoded)) return;

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
                crumb: 'Hồ Sơ Thực Thể',
                eyebrow: 'Viết hồ sơ — Template Thực Thể',
                title: 'HỒ SƠ <em>THỰC THỂ</em>',
                sub: 'RecordCard thực thể — entity class, địa điểm, mức nguy hiểm và ảnh tham chiếu.'
            }));

            var s1 = H.section({ id: 'intro', tag: '01 <em>//</em> Giới thiệu', heading: 'Giới Thiệu' });
            s1.appendChild(H.prose('Template Hồ Sơ Thực Thể dùng để ghi chép thông tin về các thực thể (entity) trong The Maze — sinh vật, anomaly, hoặc bất kỳ đối tượng nào có khả năng gây nguy hiểm. Hiển thị dưới dạng RecordCard tích hợp trong Dossier.'));
            page.appendChild(s1);

            var s2 = H.section({ id: 'syntax', tag: '02 <em>//</em> Cú pháp', heading: 'Cú Pháp' });
            s2.appendChild(H.code('Wikitext',
                '{{Hồ Sơ Thực Thể\n| id         = MA-E001\n| tieu_de    = Tên thực thể\n| muc_do     = NGUY HIỂM CỰC ĐỘ\n| gap_tai    = Maze 011 / M.A.P.L.E\n| nguy_hiem  = Cấp 5\n| mo_ta      = Mô tả chi tiết thực thể...\n| ghi_chu    = Ghi chú thêm\n| anh_src    = https://url-anh.jpg\n| anh_ref    = VIS-001\n| anh_rating = 16\n| anh_caption= Chú thích ảnh\n}}'));
            page.appendChild(s2);

            var s3 = H.section({ id: 'params', tag: '03 <em>//</em> Tham số', heading: 'Danh Sách Tham Số' });
            s3.appendChild(H.params([
                ['id',          'Mã định danh duy nhất của thực thể', 'MA-E001'],
                ['tieu_de',     'Tên chính thức của thực thể', '—'],
                ['muc_do',      'Cấp độ phân loại / mức nguy hiểm', 'F.I.F.R.O'],
                ['gap_tai',     'Địa điểm gặp / nguồn phát hiện', 'Unknown'],
                ['nguy_hiem',   'Đánh giá mức độ nguy hiểm', 'Unknown'],
                ['mo_ta',       'Mô tả chi tiết về thực thể', '(trống)'],
                ['ghi_chu',     'Ghi chú bổ sung', '(trống)'],
                ['anh_src',     'URL ảnh tham chiếu', '(trống)'],
                ['anh_ref',     'Mã ảnh', 'VIS-001'],
                ['anh_rating',  '13/16/18 — ảnh bảo mật nếu có giá trị', '(trống = ảnh thường)'],
                ['anh_caption', 'Chú thích ảnh', '(trống)'],
            ], ['Tham số', 'Mô tả', 'Mặc định']));
            page.appendChild(s3);

            var s4 = H.section({ id: 'notes', tag: '04 <em>//</em> Lưu ý', heading: 'Lưu Ý' });
            s4.appendChild(H.infobox('<strong>Mã định danh:</strong> định dạng ID chuẩn MA-E + 3 chữ số (vd MA-E001, MA-E042). Kiểm tra Kho Lưu Trữ để tránh trùng ID.'));
            s4.appendChild(H.infobox('<strong>Ảnh bảo mật:</strong> khi có anh_rating, ảnh hiển thị lớp bảo mật cần click để giải mã. Để trống nếu ảnh không nhạy cảm.'));
            page.appendChild(s4);
        });
      });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
