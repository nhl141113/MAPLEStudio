/**
 * M.A.P.L.E — MediaWiki:TroGiup-Template.js  (mhd3)
 * Trang Trợ_giúp:Template
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/Template/i.test(decoded)) return;
    if (pn && pn !== 'Trợ_giúp:Template' && !/Template/i.test(decoded)) return;

    function whenReady(cb) {
        if (window.MHHelp) return cb(window.MHHelp);
        if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(function (H) { if (H) cb(H); });
        var n = 0, t = setInterval(function () {
            if (window.MHHelp) { clearInterval(t); cb(window.MHHelp); }
            else if (++n > 40) clearInterval(t);
        }, 50);
    }

    var MAPLE_TEMPLATES = [
        { name: 'Dossier',            desc: 'Khung hồ sơ chính — sections, ticker, ảnh, record, aux grid' },
        { name: 'Hồ Sơ Thực Thể',    desc: 'RecordCard thực thể — ID, class, nguy hiểm, mô tả, ảnh bảo mật' },
        { name: 'Hồ Sơ Nhật Ký',     desc: 'RecordCard nhật ký — phân loại, nguồn, ngày ghi chép' },
        { name: 'Hồ Sơ Vật Phẩm',    desc: 'RecordCard vật phẩm — độ hiếm, loại, công dụng' },
        { name: 'Phân Loại Nội Dung', desc: 'Thẻ cảnh báo độ tuổi — đặt đầu trang, bắt buộc với 13/16/18+' },
        { name: 'Ảnh Bảo Mật',       desc: 'Ảnh có lớp che overlay — click để giải mã' },
    ];

    function build() {
      whenReady(function (H) {
        H.mount(function (page) {
            page.appendChild(H.hero({
                crumb: 'Template',
                eyebrow: 'Cú pháp — Template MediaWiki',
                title: '<em>TEMPLATE</em>',
                sub: 'Gọi template, truyền tham số và tạo template tái sử dụng trên nhiều trang.'
            }));

            var s1 = H.section({ id: 'call', tag: '01 <em>//</em> Gọi', heading: 'Gọi Template' });
            s1.appendChild(H.prose('Template là trang trong không gian tên "Bản Mẫu:" (Template:) — gọi template bằng cú pháp hai dấu ngoặc nhọn. Template được nhúng trực tiếp vào trang khi render.'));
            s1.appendChild(H.syntax([
                ['{{Tên template}}',      'Gọi template không có tham số'],
                ['{{Tên|tham_số_1|...}}', 'Gọi với tham số vị trí (positional)'],
                ['{{Tên|key=value}}',     'Gọi với tham số có tên (named)'],
                ['{{subst:Tên}}',         'Nhúng trực tiếp nội dung vào trang'],
            ]));
            page.appendChild(s1);

            var s2 = H.section({ id: 'params', tag: '02 <em>//</em> Tham số', heading: 'Tham Số' });
            s2.appendChild(H.prose('Tham số truyền vào template theo hai kiểu: vị trí (positional) dùng số thứ tự {{{1}}}, {{{2}}}… hoặc có tên (named) dùng {{{tên_param}}}. Tham số có tên rõ ràng hơn và khuyến nghị dùng trong M.A.P.L.E templates.'));
            s2.appendChild(H.code('Tham số vị trí',
                '{{Ví dụ|Giá trị 1|Giá trị 2}}\n\n<!-- Trong template, lấy bằng: -->\n{{{1}}} và {{{2}}}'));
            s2.appendChild(H.code('Tham số có tên (khuyến nghị)',
                '{{Hồ Sơ Thực Thể\n| id       = MA-E007\n| ten      = Thực Thể GRIM\n| class    = Kappa\n| nguyhiem = 4\n| mota     = Mô tả ngắn gọn...\n}}'));
            s2.appendChild(H.infobox('<strong>Tham số mặc định:</strong> có thể đặt giá trị mặc định: {{{tên|mặc định}}}. Nếu không truyền, template dùng giá trị mặc định thay vì hiển thị trống.'));
            page.appendChild(s2);

            var s3 = H.section({ id: 'create', tag: '03 <em>//</em> Tạo', heading: 'Tạo Template Mới' });
            s3.appendChild(H.prose('Tạo trang tại Bản_Mẫu:Tên_template. Nội dung trang chính là nội dung sẽ được nhúng vào trang gọi template.'));
            s3.appendChild(H.code('Cấu trúc template cơ bản',
                '<!-- Bản_Mẫu:Thông Báo -->\n<div style="border: 1px solid #ef4444; padding: 1rem; background: rgba(239,68,68,0.04);">\n  <strong>{{{tiêu_đề|Thông Báo}}}</strong>\n  <p>{{{nội_dung|Nhập nội dung thông báo ở đây.}}}</p>\n</div>\n\n<noinclude>\n<!-- Phần noinclude chỉ hiển thị khi xem trang template, không nhúng -->\n== Cách dùng ==\n{{Thông Báo|tiêu_đề=Tiêu đề|nội_dung=Nội dung}}\n</noinclude>'));
            s3.appendChild(H.infobox('<strong>noinclude vs includeonly:</strong> &lt;noinclude&gt; chỉ hiển thị trên trang template; &lt;includeonly&gt; chỉ nhúng vào bài. Dùng noinclude cho phần hướng dẫn.'));
            page.appendChild(s3);

            var s4 = H.section({ id: 'magic', tag: '04 <em>//</em> Magic words', heading: 'Magic Words' });
            s4.appendChild(H.prose('Magic words là các từ khóa đặc biệt của MediaWiki — không phải template nhưng dùng cú pháp tương tự:'));
            s4.appendChild(H.syntax([
                ['{{PAGENAME}}',     'Tên trang hiện tại (không namespace)'],
                ['{{FULLPAGENAME}}', 'Tên trang đầy đủ (kể cả namespace)'],
                ['{{NAMESPACE}}',    'Namespace hiện tại'],
                ['{{CURRENTYEAR}}',  'Năm hiện tại'],
                ['{{CURRENTDATE}}',  'Ngày hiện tại'],
                ['{{#if:{{{p|}}}|y|n}}', 'Parser function — kiểm tra điều kiện'],
            ]));
            page.appendChild(s4);

            var s5 = H.section({ id: 'list', tag: '05 <em>//</em> M.A.P.L.E', heading: 'Template M.A.P.L.E' });
            s5.appendChild(H.prose('Danh sách template chính thức của M.A.P.L.E Wiki:'));
            s5.appendChild(H.steps(MAPLE_TEMPLATES.map(function (t) {
                return { main: '<strong>{{' + t.name + '}}</strong>', sub: t.desc };
            })));
            s5.appendChild(H.infobox('<strong>Xem hướng dẫn chi tiết:</strong> mỗi template có hướng dẫn tham số riêng tại trang Trợ_giúp tương ứng (Dossier, Hồ Sơ Thực Thể…).'));
            page.appendChild(s5);
        });
      });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
