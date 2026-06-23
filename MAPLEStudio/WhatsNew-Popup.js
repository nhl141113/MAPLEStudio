/**
 * ════════════════════════════════════════════════════════════════════════
 * M.A.P.L.E — MediaWiki:WhatsNew-Popup.js
 * Popup "What's New" tự động kiểu Chrome / Microsoft.
 *
 * - Nạp TOÀN CỤC ở mọi trang (Common.js, khối GLOBAL MODULES).
 * - Đọc MediaWiki:WhatsNews-data.json → lấy field "version".
 * - Nếu version KHÁC localStorage('maple_whatsnew_seen') → hiện popup 1 LẦN,
 *   rồi lưu version. Không hiện lại cho tới khi version tăng (có cập nhật mới).
 * - Không hiện trên chính trang Dự án:WhatsNew, chỉ chạy ở action=view.
 *
 * Nội dung popup lấy từ data.popup { heading, intro, highlights[] };
 * nếu thiếu → tự dựng từ item mới nhất.
 * ════════════════════════════════════════════════════════════════════════
 */
(function () {
    'use strict';

    var SEEN_KEY = 'maple_whatsnew_seen';
    var NEWS_PAGE = '/wiki/Dự_án:WhatsNew';

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
        });
    }

    function getSeen() {
        try { return localStorage.getItem(SEEN_KEY); } catch (e) { return null; }
    }
    function setSeen(v) {
        try { localStorage.setItem(SEEN_KEY, String(v)); } catch (e) {}
    }

    function injectCSS() {
        if (document.getElementById('mwn-popup-style')) return;
        var s = document.createElement('style');
        s.id = 'mwn-popup-style';
        s.textContent = [
            '#mwn-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;',
            'justify-content:center;padding:20px;background:rgba(2,2,2,.78);',
            'backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);',
            'animation:mwn-fade .22s ease;font-family:"JetBrains Mono",ui-monospace,monospace}',
            '@keyframes mwn-fade{from{opacity:0}to{opacity:1}}',
            '@keyframes mwn-pop{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:none}}',

            '#mwn-card{width:min(440px,100%);max-height:88vh;overflow:auto;background:#070707;',
            'border:1px solid #1a1a1a;border-top:2px solid #ef4444;box-shadow:0 24px 80px rgba(0,0,0,.6);',
            'animation:mwn-pop .26s cubic-bezier(.22,1,.36,1)}',

            '.mwn-hero{padding:30px 28px 22px;text-align:center;position:relative;',
            'background:radial-gradient(ellipse 80% 70% at 50% 0%,rgba(239,68,68,.12),transparent 70%)}',
            '.mwn-spark{font-size:2.2rem;line-height:1;margin-bottom:14px}',
            '.mwn-eyebrow{font-size:8px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;',
            'color:#ef4444;margin-bottom:10px}',
            '.mwn-title{font-size:17px;font-weight:700;color:#e4e4e7;letter-spacing:.02em;',
            'text-transform:uppercase;margin:0 0 8px;line-height:1.3}',
            '.mwn-intro{font-size:10px;color:#71717a;line-height:1.7;margin:0}',

            '.mwn-body{padding:6px 28px 8px}',
            '.mwn-list{list-style:none;margin:0;padding:0}',
            '.mwn-li{display:flex;gap:11px;align-items:flex-start;padding:11px 0;',
            'border-bottom:1px solid #0e0e0e;font-size:10.5px;color:#a1a1aa;line-height:1.65}',
            '.mwn-li:last-child{border-bottom:none}',
            '.mwn-li-dot{flex-shrink:0;width:16px;height:16px;border-radius:50%;margin-top:1px;',
            'background:#140000;border:1px solid #3f0000;color:#ef4444;font-size:9px;',
            'display:flex;align-items:center;justify-content:center}',

            '.mwn-foot{padding:18px 28px 24px;display:flex;gap:9px}',
            '.mwn-btn{flex:1;padding:11px 14px;font-family:"JetBrains Mono",monospace;font-size:9px;',
            'font-weight:700;letter-spacing:.14em;text-transform:uppercase;border:1px solid;cursor:pointer;',
            'text-decoration:none!important;text-align:center;transition:all .16s}',
            '.mwn-btn-ghost{background:transparent;color:#71717a;border-color:#1f1f1f}',
            '.mwn-btn-ghost:hover{background:#0d0d0d;border-color:#52525b;color:#a1a1aa}',
            '.mwn-btn-go{background:#ef4444;color:#fff!important;border-color:#ef4444}',
            '.mwn-btn-go:hover{background:#dc2626;border-color:#dc2626;box-shadow:0 0 16px rgba(239,68,68,.35)}',

            '.mwn-ver{text-align:center;font-size:7.5px;letter-spacing:.2em;text-transform:uppercase;',
            'color:#52525b;padding-bottom:18px}',
            '@media(max-width:480px){.mwn-title{font-size:15px}.mwn-foot{flex-direction:column}}',
        ].join('');
        document.head.appendChild(s);
    }

    function close(overlay) {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        document.removeEventListener('keydown', onKey);
    }
    var _overlay = null;
    function onKey(e) { if (e.key === 'Escape') close(_overlay); }

    function render(data) {
        injectCSS();

        var popup = (data && data.popup) || {};
        var items = (data && data.items) || [];
        var latest = items.slice().sort(function (a, b) {
            return String(b.date || '').localeCompare(String(a.date || ''));
        })[0] || {};

        var heading = popup.heading || latest.title || 'Có gì mới';
        var intro   = popup.intro || latest.body || 'Bản cập nhật mới vừa được phát hành.';
        var highlights = (popup.highlights && popup.highlights.length)
            ? popup.highlights
            : (latest.body ? [latest.body] : []);

        var overlay = document.createElement('div');
        overlay.id = 'mwn-overlay';
        _overlay = overlay;

        var lis = highlights.map(function (h) {
            return '<li class="mwn-li"><span class="mwn-li-dot">✓</span><span>' + esc(h) + '</span></li>';
        }).join('');

        overlay.innerHTML =
            '<div id="mwn-card" role="dialog" aria-modal="true">' +
                '<div class="mwn-hero">' +
                    '<div class="mwn-spark">✨</div>' +
                    '<div class="mwn-eyebrow">// M.A.P.L.E — What\'s New</div>' +
                    '<h2 class="mwn-title">' + esc(heading) + '</h2>' +
                    '<p class="mwn-intro">' + esc(intro) + '</p>' +
                '</div>' +
                (lis ? '<div class="mwn-body"><ul class="mwn-list">' + lis + '</ul></div>' : '') +
                '<div class="mwn-foot">' +
                    '<a class="mwn-btn mwn-btn-ghost" href="' + NEWS_PAGE + '" data-ext-skip="1">Xem tất cả</a>' +
                    '<button class="mwn-btn mwn-btn-go" type="button" id="mwn-ok">Đã hiểu</button>' +
                '</div>' +
                '<div class="mwn-ver">Phiên bản ' + esc((data && data.version) || '?') + '</div>' +
            '</div>';

        /* Đóng khi click nền hoặc nút "Đã hiểu" */
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) close(overlay);
        });
        overlay.querySelector('#mwn-ok').addEventListener('click', function () { close(overlay); });
        document.addEventListener('keydown', onKey);

        document.body.appendChild(overlay);
    }

    function init() {
        var cfg = (typeof mw !== 'undefined' && mw.config) ? mw.config : null;
        if (!cfg) return;
        if (cfg.get('wgAction') !== 'view') return;

        /* Không bật trên chính trang bảng tin */
        var pn = cfg.get('wgPageName') || '';
        var norm = pn;
        try { norm = decodeURIComponent(pn); } catch (e) {}
        norm = norm.replace(/_/g, ' ');
        if (norm === 'Dự án:WhatsNew') return;

        if (typeof $ === 'undefined' || !$.getJSON) return;

        $.getJSON(cfg.get('wgScriptPath') + '/api.php', {
            action: 'query', titles: 'MediaWiki:WhatsNews-data.json',
            prop: 'revisions', rvprop: 'content', rvslots: 'main',
            format: 'json', origin: '*'
        }).done(function (apiData) {
            try {
                var pages = apiData.query.pages;
                var pid = Object.keys(pages)[0];
                if (pid === '-1' || !pages[pid].revisions) return;
                var data = JSON.parse(pages[pid].revisions[0].slots.main['*']);
                var version = (data && data.version != null) ? String(data.version) : null;
                if (!version) return; /* không có version → không bật popup */
                if (getSeen() === version) return; /* đã xem bản này rồi */

                render(data);
                setSeen(version); /* đánh dấu đã xem — không bật lại cho tới version mới */
            } catch (e) { /* JSON lỗi → im lặng, không làm phiền người dùng */ }
        });
        /* .fail → im lặng: popup là tính năng phụ, không báo lỗi */
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
