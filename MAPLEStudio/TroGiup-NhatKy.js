/**
 * M.A.P.L.E — MediaWiki:TroGiup-NhatKy.js  (mhd3)
 * Trang Trợ_giúp:Nhật_Ký — hướng dẫn template Hồ Sơ Nhật Ký
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/Nh[aậ]t.*K[yý]/i.test(decoded)) return;
    if (pn && pn !== 'Trợ_giúp:Nhật_Ký' && !/Nh[aậ]t.*K[yý]/i.test(decoded)) return;

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
                crumb: 'Hồ Sơ Nhật Ký',
                eyebrow: 'Viết hồ sơ — Template Nhật Ký',
                title: 'HỒ SƠ <em>NHẬT KÝ</em>',
                sub: 'Ghi chép sự kiện thực địa, báo cáo điều tra và tài liệu nội bộ M.A.P.L.E.'
            }));

            var s1 = H.section({ id: 'intro', tag: '01 <em>//</em> Giới thiệu', heading: 'Giới Thiệu' });
            s1.appendChild(H.prose('Template Hồ Sơ Nhật Ký dùng để ghi lại các sự kiện, báo cáo thực địa, hoặc tài liệu điều tra của M.A.P.L.E. Khác với Hồ Sơ Thực Thể, nhật ký tập trung vào sự kiện và nguồn tư liệu thay vì đặc điểm sinh vật.'));
            page.appendChild(s1);

            var s2 = H.section({ id: 'syntax', tag: '02 <em>//</em> Cú pháp', heading: 'Cú Pháp' });
            s2.appendChild(H.code('Wikitext',
                '{{Hồ Sơ Nhật Ký\n| id         = MA-D001\n| tieu_de    = Tiêu đề nhật ký\n| muc_do     = CONFIDENTIAL\n| nguon      = Nhân viên / Thiết bị thu thập\n| phan_loai  = Báo Cáo Thực Địa\n| mo_ta      = Nội dung chi tiết nhật ký...\n| ghi_chu    = Ghi chú bổ sung\n}}'));
            page.appendChild(s2);

            var s3 = H.section({ id: 'params', tag: '03 <em>//</em> Tham số', heading: 'Danh Sách Tham Số' });
            s3.appendChild(H.params([
                ['id',        'Mã định danh duy nhất', 'MA-D001'],
                ['tieu_de',   'Tiêu đề nhật ký / báo cáo', '—'],
                ['muc_do',    'Mức độ bảo mật / phân loại', 'CONFIDENTIAL'],
                ['nguon',     'Nguồn tư liệu: tên nhân viên, thiết bị, v.v.', 'Unknown'],
                ['phan_loai', 'Loại tài liệu: Báo Cáo Thực Địa / Ghi Chép / Phân Tích', 'Unknown'],
                ['mo_ta',     'Nội dung chính của nhật ký', '(trống)'],
                ['ghi_chu',   'Ghi chú bổ sung hoặc footnote', '(trống)'],
            ], ['Tham số', 'Mô tả', 'Mặc định']));
            page.appendChild(s3);

            var s4 = H.section({ id: 'notes', tag: '04 <em>//</em> Lưu ý', heading: 'Lưu Ý' });
            s4.appendChild(H.infobox('<strong>Mã định danh:</strong> định dạng ID chuẩn MA-D + 3 chữ số (vd MA-D001).'));
            s4.appendChild(H.infobox('<strong>Không có ảnh:</strong> Hồ Sơ Nhật Ký không có trường ảnh. Nếu cần ảnh minh hoạ, dùng template Ảnh Bảo Mật riêng trước hoặc sau.'));
            page.appendChild(s4);
        });
      });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
