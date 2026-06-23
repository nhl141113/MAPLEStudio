/**
 * M.A.P.L.E — MediaWiki:TroGiup-CSSJS.js  (mhd3)
 * Trang Trợ_giúp:CSS_JS
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/CSS[_\s]?JS/i.test(decoded)) return;
    if (pn && pn !== 'Trợ_giúp:CSS_JS' && !/CSS[_\s]?JS/i.test(decoded)) return;

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
                crumb: 'CSS & JavaScript',
                eyebrow: 'Nâng cao — Tùy chỉnh giao diện',
                title: 'CSS & <em>JAVASCRIPT</em>',
                sub: 'Tùy chỉnh giao diện bằng CSS và thêm tính năng tương tác bằng JavaScript.'
            }));

            var s1 = H.section({ id: 'personal', tag: '01 <em>//</em> Cá nhân', heading: 'CSS/JS Cá Nhân' });
            s1.appendChild(H.prose('Mỗi tài khoản có thể có file CSS và JS riêng, chỉ áp dụng cho tài khoản đó — không ảnh hưởng người dùng khác.'));
            s1.appendChild(H.code('Vị trí file cá nhân',
                'Người_dùng:[Tên_tài_khoản]/common.css   ← CSS áp dụng toàn wiki cho bạn\nNgười_dùng:[Tên_tài_khoản]/common.js    ← JS áp dụng toàn wiki cho bạn'));
            s1.appendChild(H.prose('Ví dụ: muốn đổi font của wiki sang serif chỉ cho mình, thêm vào Người_dùng:Tên/common.css:'));
            s1.appendChild(H.code('CSS cá nhân ví dụ',
                '/* Đổi font body sang serif */\n#content {\n    font-family: Georgia, serif !important;\n}\n\n/* Ẩn sidebar */\n#mw-panel {\n    display: none !important;\n}'));
            s1.appendChild(H.infobox('<strong>Cần đăng nhập:</strong> CSS/JS cá nhân chỉ load khi bạn đăng nhập. Người dùng chưa đăng nhập sẽ không thấy thay đổi của bạn.'));
            page.appendChild(s1);

            var s2 = H.section({ id: 'common', tag: '02 <em>//</em> Global', heading: 'MediaWiki:Common.css / Common.js' });
            s2.appendChild(H.prose('Common.css và Common.js là file global — áp dụng cho TẤT CẢ người dùng và TẤT CẢ trang. Chỉ admin (Interface admin) mới có quyền chỉnh sửa.'));
            s2.appendChild(H.code('File global',
                'MediaWiki:Common.css   ← CSS global toàn wiki\nMediaWiki:Common.js    ← JS global toàn wiki'));
            s2.appendChild(H.infobox('<strong>Chỉ admin chỉnh sửa:</strong> muốn thêm style global, nhắn cho admin và mô tả rõ yêu cầu. Admin sẽ xem xét và thêm vào file global nếu phù hợp.', true));
            page.appendChild(s2);

            var s3 = H.section({ id: 'scope', tag: '03 <em>//</em> Phạm vi', heading: 'Phạm Vi Tác Dụng CSS' });
            s3.appendChild(H.prose('CSS trên wiki áp dụng toàn trang (vì không có shadow DOM). Để CSS chỉ ảnh hưởng một trang cụ thể, dùng body class của trang đó:'));
            s3.appendChild(H.code('Scope CSS theo trang',
                '/* Chỉ áp dụng cho trang "Kho_Lưu_Trữ" */\nbody.page-Kho_L_u_Tr_ .wikitable {\n    border: 1px solid #ef4444;\n}\n\n/* Áp dụng cho tất cả trang trong namespace "Trợ_giúp" */\nbody[class*="page-Tr_gi_p"] h2 {\n    color: #ef4444;\n}'));
            s3.appendChild(H.infobox('<strong>body class tên trang:</strong> MediaWiki tạo class body dạng "page-[TenTrang]" với tên trang được encode rút gọn. Kiểm tra bằng F12 → inspect body element.'));
            page.appendChild(s3);

            var s4 = H.section({ id: 'patterns', tag: '04 <em>//</em> Patterns', heading: 'Patterns JS Thường Dùng' });
            s4.appendChild(H.prose('Một số pattern JavaScript hữu ích trong MediaWiki:'));
            s4.appendChild(H.code('Lấy tên trang hiện tại',
                'var pageName = mw.config.get("wgPageName");\nvar namespace = mw.config.get("wgNamespaceNumber");\nvar isMainPage = mw.config.get("wgIsMainPage");'));
            s4.appendChild(H.code('Chờ DOM load (IIFE pattern — khuyến nghị)',
                '(function () {\n    function init() {\n        // code của bạn ở đây\n        var content = document.getElementById("mw-content-text");\n    }\n    if (document.readyState === "loading") {\n        document.addEventListener("DOMContentLoaded", init);\n    } else {\n        init();\n    }\n})();'));
            s4.appendChild(H.infobox('<strong>Không dùng $(document).ready:</strong> M.A.P.L.E Wiki dùng IIFE pattern. $(document).ready có thể không hoạt động đúng trên Miraheze do thứ tự load script.'));
            page.appendChild(s4);

            var s5 = H.section({ id: 'debug', tag: '05 <em>//</em> Debug', heading: 'Debug CSS/JS' });
            s5.appendChild(H.prose('Khi CSS/JS không hoạt động như mong đợi:'));
            s5.appendChild(H.steps([
                { main: '<strong>Xóa cache trình duyệt</strong>', sub: 'Ctrl+F5 (Windows) / Cmd+Shift+R (Mac)' },
                { main: 'Mở <strong>F12 → Console</strong> xem lỗi JS' },
                { main: 'F12 → Network → filter "css"/"js"', sub: 'Kiểm tra file có load không' },
                { main: 'F12 → Elements → inspect element', sub: 'Xem CSS nào đang apply' },
                { main: 'Thêm <strong>?action=purge</strong> vào URL', sub: 'Xóa cache server' },
            ]));
            s5.appendChild(H.infobox('<strong>console.log:</strong> thêm console.log() khi debug. Nhớ xóa trước khi gửi code cho admin — log quá nhiều làm chậm trình duyệt.'));
            page.appendChild(s5);
        });
      });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
