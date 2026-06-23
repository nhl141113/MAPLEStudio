/**
 * M.A.P.L.E — MediaWiki:TroGiup-Bang.js  (mhd3)
 * Trang Trợ_giúp:Bảng
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/B[aả]ng/i.test(decoded)) return;
    if (pn && pn !== 'Trợ_giúp:Bảng' && !/B[aả]ng/i.test(decoded)) return;

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
                crumb: 'Bảng Biểu',
                eyebrow: 'Cú pháp — Bảng wikitable',
                title: 'BẢNG <em>BIỂU</em>',
                sub: 'Tạo và định dạng bảng wikitable để trình bày dữ liệu có cấu trúc.'
            }));

            var s1 = H.section({ id: 'basic', tag: '01 <em>//</em> Cơ bản', heading: 'Cú Pháp Bảng Cơ Bản' });
            s1.appendChild(H.prose('Bảng wiki dùng ký hiệu đặc biệt ở đầu dòng. Mỗi bảng bắt đầu bằng <code>{|</code> và kết thúc bằng <code>|}</code>. Hàng bắt đầu bằng <code>|-</code> và ô bắt đầu bằng <code>|</code> (ô thường) hoặc <code>!</code> (tiêu đề).'));
            s1.appendChild(H.syntax([
                ['{|', 'Bắt đầu bảng — có thể thêm thuộc tính CSS ở đây'],
                ['|-', 'Bắt đầu hàng mới'],
                ['|',  'Ô dữ liệu thông thường'],
                ['!',  'Ô tiêu đề (in đậm, nền khác)'],
                ['|}', 'Kết thúc bảng'],
                ['||', 'Phân cách ô trên cùng 1 dòng'],
                ['!!', 'Phân cách tiêu đề trên cùng 1 dòng'],
                ['|+', 'Tiêu đề bảng (caption)'],
            ]));
            s1.appendChild(H.code('Bảng 2×2 đơn giản',
                '{| class="wikitable"\n|-\n| Ô 1 || Ô 2\n|-\n| Ô 3 || Ô 4\n|}'));
            page.appendChild(s1);

            var s2 = H.section({ id: 'header', tag: '02 <em>//</em> Tiêu đề', heading: 'Tiêu Đề Cột' });
            s2.appendChild(H.prose('Dùng <code>!</code> thay vì <code>|</code> để tạo ô tiêu đề — tự động in đậm và có nền khác. Thường đặt ở hàng đầu tiên:'));
            s2.appendChild(H.code('Bảng có tiêu đề cột',
                '{| class="wikitable"\n! Tên       !! ID      !! Class\n|-\n| GRIM      || MA-E007 || Kappa\n|-\n| HOLLOW    || MA-E012 || Lambda\n|}'));
            page.appendChild(s2);

            var s3 = H.section({ id: 'style', tag: '03 <em>//</em> Định dạng', heading: 'Định Dạng & Class CSS' });
            s3.appendChild(H.prose('Thêm thuộc tính CSS trực tiếp vào dòng <code>{|</code> (toàn bảng), <code>|-</code> (hàng), hoặc <code>|</code> (ô). Class "wikitable" cho bảng kiểu mặc định của MediaWiki.'));
            s3.appendChild(H.code('Thêm class và style',
                '{| class="wikitable" style="width:100%"\n|-\n! style="width:30%"|Thuộc tính !! Giá trị\n|-\n| style="color:#ef4444"|Nguy hiểm || Cấp 4\n|}'));
            s3.appendChild(H.infobox('<strong>class="wikitable sortable":</strong> thêm "sortable" vào class để cho phép người dùng click tiêu đề cột để sắp xếp. Yêu cầu JS của MediaWiki.'));
            page.appendChild(s3);

            var s4 = H.section({ id: 'merge', tag: '04 <em>//</em> Gộp ô', heading: 'Gộp Ô (colspan / rowspan)' });
            s4.appendChild(H.prose('Dùng thuộc tính <code>colspan</code> (gộp theo chiều ngang) và <code>rowspan</code> (gộp theo chiều dọc) để tạo ô chiếm nhiều cột hoặc hàng:'));
            s4.appendChild(H.code('Gộp ô',
                '{| class="wikitable"\n|-\n! colspan="2" | Thông Tin Chung\n|-\n| Tên || GRIM\n|-\n| rowspan="2" | Class || Kappa\n|-\n| Nguy hiểm cấp 4\n|}'));
            page.appendChild(s4);

            var s5 = H.section({ id: 'sortable', tag: '05 <em>//</em> Sắp xếp', heading: 'Bảng Có Thể Sắp Xếp' });
            s5.appendChild(H.prose('Thêm class "sortable" để người đọc có thể click vào tiêu đề cột để sắp xếp dữ liệu tăng/giảm dần. Rất hữu ích cho danh sách dài như danh sách thực thể.'));
            s5.appendChild(H.code('Bảng sortable',
                '{| class="wikitable sortable"\n! Tên !! ID !! Nguy hiểm\n|-\n| GRIM   || MA-E007 || 4\n|-\n| HOLLOW || MA-E012 || 2\n|-\n| NULL   || MA-E001 || 5\n|}'));
            s5.appendChild(H.infobox('<strong>Sắp xếp tự động:</strong> MediaWiki nhận biết kiểu dữ liệu — số, ngày, chữ — và sắp xếp đúng kiểu. Đảm bảo dữ liệu nhất quán trong một cột.'));
            page.appendChild(s5);
        });
      });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
