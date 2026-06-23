/**
 * M.A.P.L.E — MediaWiki:TroGiup-AvatarLoi.js (mhd3)
 * Trang Trợ_giúp:Avatar / Hình đại diện không load
 */
(function () {
    'use strict';
    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/Avatar/i.test(decoded)) return;

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
                crumb: 'Sự cố Kỹ thuật',
                eyebrow: 'Trợ giúp — Tài khoản',
                title: 'AVATAR <em>KHÔNG LOAD</em>',
                sub: 'Avatar bạn hiển thị ảnh xám, bị lỗi, hoặc không load được? Dưới đây là nguyên nhân và cách khắc phục.'
            }));

            var s1 = H.section({ id: 'causes', tag: '01', heading: 'Nguyên nhân thường gặp' });
            s1.appendChild(H.prose('Hệ thống có thể từ chối tải ảnh đại diện của bạn vì một trong các lý do sau:'));
            var ul1 = document.createElement('ul');
            ul1.innerHTML = '<li>Ảnh quá lớn (> 5MB)</li><li>Định dạng ảnh không hỗ trợ</li><li>URL link ảnh bị "chết" (link ngoài không còn hoạt động)</li><li>Ảnh bị xóa khỏi hệ thống</li><li>Cache browser lỗi (hiển thị ảnh cũ)</li><li>Kết nối internet yếu</li>';
            s1.appendChild(ul1);
            page.appendChild(s1);

            var s2 = H.section({ id: 'step1', tag: '02', heading: 'Bước 1: Kiểm tra định dạng & khối lượng' });
            s2.appendChild(H.prose('Kích thước tối đa cho phép là <strong>5MB</strong>. Nên dùng ảnh vuông tỷ lệ 1:1. Các định dạng được hỗ trợ:'));
            var ul2 = document.createElement('ul');
            ul2.innerHTML = '<li>✅ JPG / JPEG</li><li>✅ PNG</li><li>✅ GIF (hoạt động được)</li><li>❌ WebP (có thể lỗi)</li><li>❌ AVIF / BMP / TIFF / SVG (không hỗ trợ hoặc cấm vì bảo mật)</li>';
            s2.appendChild(ul2);
            page.appendChild(s2);

            var s3 = H.section({ id: 'step2', tag: '03', heading: 'Bước 2: Nén hoặc Convert ảnh' });
            s3.appendChild(H.prose('Nếu ảnh quá lớn hoặc sai định dạng, bạn có thể dùng các công cụ sau:'));
            s3.appendChild(H.code('Công cụ Online', '1. TinyPNG (tinypng.com) — Nén ảnh tự động giữ chất lượng\n2. CloudConvert (cloudconvert.com) — Đổi đuôi ảnh sang PNG/JPG'));
            s3.appendChild(H.prose('Hoặc dùng công cụ Paint (Windows), ImageOptim (Mac) để lưu lại dưới dạng PNG.'));
            page.appendChild(s3);

            var s4 = H.section({ id: 'step3', tag: '04', heading: 'Bước 3: Xóa cache trình duyệt' });
            s4.appendChild(H.prose('Đôi khi avatar cũ vẫn hiển thị dù bạn đã upload ảnh mới lên thành công. Hãy thử Xóa cache:'));
            s4.appendChild(H.keys([
                { key: 'Ctrl + F5', desc: 'Hard Refresh (Windows)' },
                { key: 'Cmd + Shift + R', desc: 'Hard Refresh (Mac)' },
                { key: 'Ctrl + Shift + Del', desc: 'Mở menu xóa cache (Chrome/Edge)' }
            ]));
            page.appendChild(s4);
        });
      });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
    else build();
})();