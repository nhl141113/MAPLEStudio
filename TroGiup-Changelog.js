/**
 * M.A.P.L.E — MediaWiki:TroGiup-Changelog.js  (mhd3)
 * Trang Trợ_giúp:Changelog — lịch sử cập nhật hệ thống wiki
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/Changelog/i.test(decoded)) return;
    if (pn && pn !== 'Trợ_giúp:Changelog' && !/Changelog/i.test(decoded)) return;

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
        });
    }

    function whenReady(cb) {
        if (window.MHHelp) return cb(window.MHHelp);
        if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(function (H) { if (H) cb(H); });
        var n = 0, t = setInterval(function () {
            if (window.MHHelp) { clearInterval(t); cb(window.MHHelp); }
            else if (++n > 40) clearInterval(t);
        }, 50);
    }

    var CHANGELOG = [
        { version: 'v3.0.0', date: '2026-06-12', badge: 'new', changes: [
            'Hệ thống Dossier mới — engine render từ data-attributes thay thế class-based cũ',
            'Template mới: Hồ Sơ Thực Thể, Hồ Sơ Nhật Ký, Hồ Sơ Vật Phẩm',
            'Template mới: Ảnh Bảo Mật, Phân Loại Nội Dung',
            'Viết lại TroGiup.js + TroGiup.css — đồng nhất theme với HomePage',
            'Thêm 8 trang con Trợ Giúp với hướng dẫn chi tiết từng template',
            'Thêm Glossary và Changelog',
            'MAPLE-Toolbar.js cập nhật snippet cho tất cả template mới',
        ]},
        { version: 'v2.1.0', date: '2026-05', badge: 'update', changes: [
            'Dossier.js — thêm layout "record" cho RecordCard tích hợp',
            'SecureImage.js — cải thiện animation giải mã',
            'Rating.js — thêm tag display',
            'Classified.js — thêm animation khi click',
        ]},
        { version: 'v2.0.0', date: '2026-03', badge: 'new', changes: [
            'Dossier.js khởi tạo — hệ thống hồ sơ đa section',
            'GlobalNav.js — thanh điều hướng toàn cục',
            'MAPLE-Editor.js + MAPLE-Toolbar.js — trình soạn thảo tùy chỉnh',
            'Kho Lưu Trữ.js — trang danh sách hồ sơ có tìm kiếm',
        ]},
        { version: 'v1.0.0', date: '2025', badge: 'new', changes: [
            'Khởi tạo wiki M.A.P.L.E',
            'HomePage.js + HomePage.css',
            'Rating.js, RecordCard.js, SecureImage.js, Classified.js — các component độc lập',
            'Template cơ bản: Dossier (cũ), Thực thể, Nhật ký, HSVậtPhẩm',
        ]},
    ];

    var BADGE_LABEL = { 'new': 'Mới', 'fix': 'Fix', 'update': 'Cập Nhật' };

    function build() {
      whenReady(function (H) {
        H.mount(function (page) {
            page.appendChild(H.hero({
                crumb: 'Changelog',
                eyebrow: 'Tham khảo — Lịch sử cập nhật',
                title: '<em>CHANGELOG</em>',
                sub: 'Lịch sử cập nhật hệ thống template, tính năng và nội dung wiki.'
            }));

            CHANGELOG.forEach(function (entry) {
                var badge = (entry.badge === 'fix' || entry.badge === 'update') ? entry.badge : 'new';
                var sec = H.section({ id: 'cl-' + entry.version });
                sec.appendChild(H.el('div', 'mhd3-cl-head',
                    '<span class="mhd3-cl-ver">' + esc(entry.version) + '</span>' +
                    '<span class="mhd3-cl-date">' + esc(entry.date) + '</span>' +
                    '<span class="mhd3-cl-badge ' + badge + '">' + esc(BADGE_LABEL[badge]) + '</span>'));
                var items = entry.changes.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('');
                sec.appendChild(H.prose('<ul>' + items + '</ul>'));
                page.appendChild(sec);
            });
        });
      });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
