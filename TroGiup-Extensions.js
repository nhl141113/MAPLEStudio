/**
 * M.A.P.L.E — MediaWiki:TroGiup-Extensions.js  (mhd3)
 * Trang Trợ_giúp:Extensions
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/Extensions/i.test(decoded)) return;
    if (pn && pn !== 'Trợ_giúp:Extensions' && !/Extensions/i.test(decoded)) return;

    function whenReady(cb) {
        if (window.MHHelp) return cb(window.MHHelp);
        if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(function (H) { if (H) cb(H); });
        var n = 0, t = setInterval(function () {
            if (window.MHHelp) { clearInterval(t); cb(window.MHHelp); }
            else if (++n > 40) clearInterval(t);
        }, 50);
    }

    var EXTENSIONS = [
        ['Scribunto',       'Chạy Lua modules — template phức tạp & xử lý dữ liệu động'],
        ['ParserFunctions', 'Hàm điều kiện trong wikitext: #if, #switch, #ifeq, #expr…'],
        ['Cite',            'Trích dẫn & chú thích nguồn — <ref> và <references/>'],
        ['SyntaxHighlight', 'Tô màu cú pháp code — hỗ trợ nhiều ngôn ngữ'],
        ['CategoryTree',    'Xem cây thể loại dạng cây có thể mở rộng'],
        ['TemplateData',    'Metadata cho template — hiển thị tham số trong VisualEditor'],
        ['Variables',       'Lưu & đọc biến trong phạm vi một trang wiki'],
    ];

    function build() {
      whenReady(function (H) {
        H.mount(function (page) {
            page.appendChild(H.hero({
                crumb: 'Extensions',
                eyebrow: 'Nâng cao — Tiện ích mở rộng',
                title: '<em>EXTENSIONS</em>',
                sub: 'Các extension MediaWiki đang hoạt động trên M.A.P.L.E Wiki và cách tận dụng.'
            }));

            var s1 = H.section({ id: 'active', tag: '01 <em>//</em> Đang dùng', heading: 'Extension Đang Hoạt Động' });
            s1.appendChild(H.prose('M.A.P.L.E Wiki chạy trên Miraheze — hỗ trợ tập hợp extension chuẩn của Miraheze. Các extension sau đang hoạt động và có thể dùng:'));
            s1.appendChild(H.params(EXTENSIONS, ['Extension', 'Công dụng']));
            page.appendChild(s1);

            var s2 = H.section({ id: 'parser', tag: '02 <em>//</em> Parser', heading: 'Parser Functions' });
            s2.appendChild(H.prose('ParserFunctions cung cấp các hàm điều kiện và tính toán trong wikitext — rất hữu ích khi tạo template linh hoạt:'));
            s2.appendChild(H.syntax([
                ['{{#if: đk | đúng | sai}}',          'Kiểm tra chuỗi khác rỗng'],
                ['{{#ifeq: A | B | đúng | sai}}',     'So sánh hai giá trị bằng nhau'],
                ['{{#switch: v | a=r1 | #default=…}}','Switch / case'],
                ['{{#expr: 2 + 2}}',                  'Tính toán số học'],
                ['{{#len: chuỗi}}',                   'Độ dài chuỗi'],
                ['{{#ifexist: Trang | đúng | sai}}',  'Kiểm tra trang tồn tại'],
            ]));
            page.appendChild(s2);

            var s3 = H.section({ id: 'request', tag: '03 <em>//</em> Yêu cầu', heading: 'Yêu Cầu Bổ Sung Extension' });
            s3.appendChild(H.prose('Muốn bật thêm extension không có trong danh sách? Liên hệ admin với thông tin: tên extension, lý do cần thiết, và link trang MediaWiki Extension chính thức.'));
            s3.appendChild(H.infobox('<strong>Không phải extension nào cũng khả dụng:</strong> Miraheze có danh sách extension cho phép. Extension ngoài danh sách đó không thể cài dù admin muốn.', true));
            s3.appendChild(H.infobox('<strong>Kiểm tra extension đang dùng:</strong> vào <a href="/wiki/Special:Version">Special:Version</a> để xem toàn bộ danh sách extension, phiên bản MediaWiki và thông tin kỹ thuật.'));
            var b = H.btns();
            b.appendChild(H.contactAdminBtn('↗ Yêu cầu extension', true));
            s3.appendChild(b);
            page.appendChild(s3);
        });
      });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
