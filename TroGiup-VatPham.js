/**
 * M.A.P.L.E — MediaWiki:TroGiup-VatPham.js  (mhd3)
 * Trang Trợ_giúp:Vật_Phẩm — hướng dẫn template Hồ Sơ Vật Phẩm
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/V[aậ]t.*Ph[aẩ]m/i.test(decoded)) return;
    if (pn && pn !== 'Trợ_giúp:Vật_Phẩm' && !/V[aậ]t.*Ph[aẩ]m/i.test(decoded)) return;

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
                crumb: 'Hồ Sơ Vật Phẩm',
                eyebrow: 'Viết hồ sơ — Template Vật Phẩm',
                title: 'HỒ SƠ <em>VẬT PHẨM</em>',
                sub: 'Kiểm kê đồ vật thu hồi — độ hiếm, loại, công dụng và ảnh tham chiếu.'
            }));

            var s1 = H.section({ id: 'intro', tag: '01 <em>//</em> Giới thiệu', heading: 'Giới Thiệu' });
            s1.appendChild(H.prose('Template Hồ Sơ Vật Phẩm dùng để phân loại và ghi chép các đồ vật thu hồi từ The Maze — công cụ, vũ khí, artifact, hoặc bất kỳ vật thể nào được M.A.P.L.E kiểm kê. Ảnh hiển thị dưới dạng thông thường (không có lớp bảo mật).'));
            page.appendChild(s1);

            var s2 = H.section({ id: 'syntax', tag: '02 <em>//</em> Cú pháp', heading: 'Cú Pháp' });
            s2.appendChild(H.code('Wikitext',
                '{{Hồ Sơ Vật Phẩm\n| id       = MA-I001\n| tieu_de  = Tên vật phẩm\n| muc_do   = ITEM-CLASS-A\n| do_hiem  = Huyền Thoại\n| loai     = Vũ Khí / Công Cụ / Artifact\n| mo_ta    = Mô tả chi tiết vật phẩm...\n| ghi_chu  = Ghi chú bổ sung\n| anh_src  = https://url-anh.jpg\n| anh_ref  = VIS-001\n}}'));
            page.appendChild(s2);

            var s3 = H.section({ id: 'params', tag: '03 <em>//</em> Tham số', heading: 'Danh Sách Tham Số' });
            s3.appendChild(H.params([
                ['id',      'Mã định danh duy nhất', 'MA-I001'],
                ['tieu_de', 'Tên vật phẩm', '—'],
                ['muc_do',  'Class phân loại của vật phẩm', 'ITEM-CLASS-A'],
                ['do_hiem', 'Độ hiếm: Phổ Thông / Hiếm / Sử Thi / Huyền Thoại', 'Unknown'],
                ['loai',    'Loại: Vũ Khí / Công Cụ / Artifact / Tiêu Hao', 'Unknown'],
                ['mo_ta',   'Mô tả chi tiết, công dụng, cách sử dụng', '(trống)'],
                ['ghi_chu', 'Ghi chú bổ sung, lưu ý khi sử dụng', '(trống)'],
                ['anh_src', 'URL ảnh vật phẩm', '(trống)'],
                ['anh_ref', 'Mã ảnh', 'VIS-001'],
            ], ['Tham số', 'Mô tả', 'Mặc định']));
            page.appendChild(s3);

            var s4 = H.section({ id: 'notes', tag: '04 <em>//</em> Lưu ý', heading: 'Lưu Ý' });
            s4.appendChild(H.infobox('<strong>Mã định danh:</strong> định dạng ID chuẩn MA-I + 3 chữ số (vd MA-I001).'));
            s4.appendChild(H.infobox('<strong>Ảnh không bảo mật:</strong> ảnh vật phẩm luôn hiển thị thông thường. Để dùng ảnh bảo mật, dùng template Ảnh Bảo Mật riêng.'));
            page.appendChild(s4);
        });
      });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
