/**
 * M.A.P.L.E — MediaWiki:TroGiup-Lua.js  (mhd3)
 * Trang Trợ_giúp:Lua
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/Lua/i.test(decoded)) return;
    if (pn && pn !== 'Trợ_giúp:Lua' && !/Lua/i.test(decoded)) return;

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
                crumb: 'Lua Modules',
                eyebrow: 'Nâng cao — Lua & Scribunto',
                title: 'LUA <em>MODULES</em>',
                sub: 'Lập trình Lua qua extension Scribunto — tạo chức năng động phức tạp cho template.'
            }));

            var s1 = H.section({ id: 'what', tag: '01 <em>//</em> Khái niệm', heading: 'Lua Là Gì?' });
            s1.appendChild(H.prose([
                'Lua là ngôn ngữ lập trình nhẹ, được MediaWiki tích hợp qua extension Scribunto. Thay vì dùng parser functions phức tạp trong wikitext, bạn viết logic xử lý dữ liệu bằng Lua — đơn giản hơn, mạnh hơn, debug được.',
                'Lua modules lưu tại không gian tên "Mô-đun:" (Module:). Mỗi module là một file Lua có thể gọi từ template bằng {{#invoke:}}.'
            ]));
            s1.appendChild(H.infobox('<strong>Cần Scribunto:</strong> Lua hoạt động cần extension Scribunto đã cài. Miraheze hỗ trợ Scribunto mặc định — M.A.P.L.E Wiki có thể dùng Lua.'));
            page.appendChild(s1);

            var s2 = H.section({ id: 'create', tag: '02 <em>//</em> Tạo', heading: 'Tạo Module Lua' });
            s2.appendChild(H.prose('Tạo trang tại Mô-đun:Tên_module. Nội dung là code Lua. Module phải trả về một bảng (table) chứa các hàm có thể gọi từ bên ngoài.'));
            s2.appendChild(H.code('Mô-đun:Ví_dụ — module cơ bản',
                '-- Khai báo module\nlocal p = {}\n\n-- Hàm chào hỏi đơn giản\nfunction p.xin_chao(frame)\n    local ten = frame.args[1] or "bạn"\n    return "Xin chào, " .. ten .. "!"\nend\n\n-- Hàm xử lý tham số có tên\nfunction p.tinh_class(frame)\n    local level = tonumber(frame.args.level) or 1\n    if level >= 5 then return "Omega"\n    elseif level >= 4 then return "Kappa"\n    elseif level >= 3 then return "Theta"\n    else return "Alpha"\n    end\nend\n\nreturn p'));
            page.appendChild(s2);

            var s3 = H.section({ id: 'call', tag: '03 <em>//</em> Gọi', heading: 'Gọi Module Từ Template' });
            s3.appendChild(H.prose('Dùng parser function {{#invoke:}} để gọi một hàm trong module từ wikitext hoặc template:'));
            s3.appendChild(H.syntax([
                ['{{#invoke:Module|hàm}}',          'Gọi hàm không tham số'],
                ['{{#invoke:Module|hàm|tham_số}}',  'Gọi hàm với tham số vị trí'],
                ['{{#invoke:Module|hàm|key=value}}','Gọi hàm với tham số có tên'],
            ]));
            s3.appendChild(H.code('Gọi Mô-đun:Ví_dụ',
                '{{#invoke:Ví_dụ|xin_chao|GRIM}}\n<!-- Kết quả: Xin chào, GRIM! -->\n\n{{#invoke:Ví_dụ|tinh_class|level=4}}\n<!-- Kết quả: Kappa -->'));
            page.appendChild(s3);

            var s4 = H.section({ id: 'api', tag: '04 <em>//</em> mw.* API', heading: 'mw.* API Thường Dùng' });
            s4.appendChild(H.prose('Scribunto cung cấp thư viện mw.* để tương tác với MediaWiki:'));
            s4.appendChild(H.syntax([
                ['mw.title.getCurrentTitle()', 'Lấy thông tin trang hiện tại'],
                ['mw.ustring.len(str)',        'Độ dài chuỗi (hỗ trợ Unicode/UTF-8)'],
                ['mw.ustring.upper(str)',      'Chuyển UPPERCASE (hỗ trợ tiếng Việt)'],
                ['mw.text.split(str, pat)',    'Tách chuỗi theo pattern'],
                ['mw.text.trim(str)',          'Xóa khoảng trắng đầu/cuối'],
                ['mw.html.create("div")',      'Tạo element HTML'],
                ['frame:expandTemplate{...}',  'Nhúng template từ trong Lua'],
            ]));
            s4.appendChild(H.infobox('<strong>mw.ustring thay string:</strong> dùng mw.ustring thay vì string built-in khi xử lý tiếng Việt — string thuần Lua không xử lý UTF-8 đúng cách.'));
            page.appendChild(s4);

            var s5 = H.section({ id: 'tips', tag: '05 <em>//</em> Lưu ý', heading: 'Lưu Ý Khi Viết Lua' });
            s5.appendChild(H.infobox('<strong>Chỉ admin chỉnh sửa module chính:</strong> module dùng trong template chính thức cần admin duyệt trước khi deploy. Viết nháp tại Mô-đun:Người_dùng/[Tên]/TênModule.', true));
            s5.appendChild(H.infobox('<strong>Debug bằng mw.log:</strong> dùng mw.log("thông tin") để in debug — hiển thị trong Special:ExpandTemplates khi test.'));
            s5.appendChild(H.infobox('<strong>Giới hạn tài nguyên:</strong> mỗi trang có giới hạn thời gian và bộ nhớ cho Lua. Module quá phức tạp hoặc vòng lặp quá nhiều sẽ báo lỗi timeout.'));
            page.appendChild(s5);
        });
      });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
