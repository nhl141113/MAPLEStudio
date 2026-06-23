/**
 * M.A.P.L.E — MediaWiki:MAPLE-Apps.js
 * APP DRAWER — "ngăn ứng dụng" mở từ navbar (lưới icon kiểu màn hình điện thoại).
 *
 * Tự chèn nút ▦ vào .maple-nav-right (do GlobalNav render) → bấm mở panel lưới app.
 * Đăng ký app bằng mảng APPS (dễ thêm app mới). Gồm:
 *   - Lối tắt tính năng sẵn có (Sự kiện, Bảng tin, Thành tựu, Nhiệm vụ, Chat, Thông báo)
 *   - Widget The Maze (gọi window.MAPLE.widgetMaze.open) — không phải notifier
 *
 * CSS nội tuyến (không cần @import Common.css). Nạp toàn cục từ Common.js.
 */
(function () {
    'use strict';

    if (typeof mw === 'undefined' || !mw.util) return;

    var isLoggedIn = mw.config.get('wgUserId') !== 0;
    var userName   = mw.config.get('wgUserName') || '';

    function url(page) { return mw.util.getUrl(page); }

    /* ── Danh mục app (dễ mở rộng) ──
       type:'link' → mở trang; type:'action' → gọi hàm; gate:'login' → cần đăng nhập */
    function appList() {
        var apps = [
            { icon: '🎉', label: 'Sự Kiện',  color: '#ef4444', type: 'link', href: url('Sự Kiện') },
            { icon: '📰', label: 'Bảng Tin',  color: '#3b82f6', type: 'link', href: url('Bảng Tin') },
            { icon: '🏆', label: 'Thành Tựu', color: '#eab308', type: 'link', href: url('Thành Tựu') },
            { icon: '🎯', label: 'Nhiệm Vụ',  color: '#22c55e', type: 'link', href: url('Nhiệm Vụ') },
            { icon: '🗺️', label: 'Kho Lưu Trữ', color: '#a1a1aa', type: 'link', href: url('Kho Lưu Trữ') },
            { icon: '🧭', label: 'The Maze',  color: '#8b5cf6', type: 'action', action: 'maze' }
        ];
        if (isLoggedIn) {
            apps.push({ icon: '💬', label: 'Chat',      color: '#06b6d4', type: 'action', action: 'chat' });
            apps.push({ icon: '🔔', label: 'Thông Báo', color: '#f59e0b', type: 'link', href: url('Thông báo/' + userName) });
        }
        return apps;
    }

    function injectCSS() {
        if (document.getElementById('mapp-style')) return;
        var s = document.createElement('style');
        s.id = 'mapp-style';
        s.textContent = [
            /* Nút trên navbar */
            '.maple-nav-apps{position:relative;display:flex;align-items:center;justify-content:center;',
            '  width:34px;height:34px;background:transparent;border:1px solid #1f1f1f;color:#a1a1aa;',
            '  cursor:pointer;transition:all .15s;font-size:15px;line-height:1}',
            '.maple-nav-apps:hover,.maple-nav-apps.open{color:#ef4444;border-color:#7f1d1d;background:rgba(239,68,68,.06)}',
            /* Overlay + panel */
            '#mapp-overlay{position:fixed;inset:0;z-index:9000;display:none;background:rgba(2,2,2,.55);',
            '  backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}',
            '#mapp-overlay.open{display:block;animation:mapp-fade .18s ease}',
            '@keyframes mapp-fade{from{opacity:0}to{opacity:1}}',
            '#mapp-panel{position:fixed;top:64px;right:14px;z-index:9001;width:min(340px,calc(100vw - 28px));',
            '  background:#070707;border:1px solid #1a1a1a;border-top:2px solid #ef4444;',
            '  box-shadow:0 24px 70px rgba(0,0,0,.65);font-family:"JetBrains Mono",ui-monospace,monospace;',
            '  display:none;animation:mapp-pop .22s cubic-bezier(.22,1,.36,1)}',
            '#mapp-panel.open{display:block}',
            '@keyframes mapp-pop{from{opacity:0;transform:translateY(-8px) scale(.98)}to{opacity:1;transform:none}}',
            '.mapp-head{padding:14px 16px 10px;border-bottom:1px solid #111}',
            '.mapp-eyebrow{font-size:7px;letter-spacing:.3em;color:#ef4444;text-transform:uppercase;margin-bottom:3px}',
            '.mapp-title{font-size:12px;font-weight:700;color:#e4e4e7;letter-spacing:.06em}',
            '.mapp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:14px}',
            '.mapp-app{display:flex;flex-direction:column;align-items:center;gap:7px;padding:14px 6px;',
            '  border:1px solid #141414;background:#0a0a0a;cursor:pointer;text-decoration:none;',
            '  transition:all .15s;color:#a1a1aa}',
            '.mapp-app:hover{border-color:#2a2a2a;background:#0e0e0e;transform:translateY(-2px);text-decoration:none}',
            '.mapp-app-icon{font-size:1.5rem;line-height:1}',
            '.mapp-app-label{font-size:8px;letter-spacing:.1em;text-transform:uppercase;text-align:center;color:#71717a}',
            '.mapp-app:hover .mapp-app-label{color:#e4e4e7}',
            '.mapp-foot{padding:8px 16px 14px;font-size:7.5px;letter-spacing:.12em;color:#3f3f46;text-align:center}',
            '@media(max-width:480px){#mapp-panel{top:auto;bottom:0;right:0;left:0;width:100%;border-top:2px solid #ef4444}}'
        ].join('');
        document.head.appendChild(s);
    }

    var _open = false;
    function setOpen(v) {
        _open = v;
        var ov = document.getElementById('mapp-overlay');
        var pn = document.getElementById('mapp-panel');
        var bt = document.getElementById('maple-nav-apps');
        if (ov) ov.classList.toggle('open', v);
        if (pn) pn.classList.toggle('open', v);
        if (bt) bt.classList.toggle('open', v);
    }

    function doAction(act) {
        setOpen(false);
        if (act === 'maze') {
            if (window.MAPLE && window.MAPLE.widgetMaze && window.MAPLE.widgetMaze.open) {
                window.MAPLE.widgetMaze.open();
            }
            return;
        }
        if (act === 'chat') {
            var fab = document.getElementById('mpc-fab') || document.getElementById('maple-nav-chat');
            if (fab) fab.click();
            else location.href = url('Người dùng:' + userName + '/Chat');
            return;
        }
    }

    function buildPanel() {
        if (document.getElementById('mapp-panel')) return;

        var overlay = document.createElement('div');
        overlay.id = 'mapp-overlay';
        overlay.addEventListener('click', function () { setOpen(false); });
        document.body.appendChild(overlay);

        var panel = document.createElement('div');
        panel.id = 'mapp-panel';
        panel.setAttribute('role', 'dialog');

        var grid = appList().map(function (a) {
            var inner =
                '<span class="mapp-app-icon" style="filter:drop-shadow(0 0 6px ' + a.color + '55)">' + a.icon + '</span>' +
                '<span class="mapp-app-label">' + a.label + '</span>';
            if (a.type === 'link') {
                return '<a class="mapp-app" href="' + a.href + '" data-ext-skip="1">' + inner + '</a>';
            }
            return '<button class="mapp-app" type="button" data-action="' + a.action + '">' + inner + '</button>';
        }).join('');

        panel.innerHTML =
            '<div class="mapp-head">' +
                '<div class="mapp-eyebrow">// M.A.P.L.E</div>' +
                '<div class="mapp-title">Ứng dụng</div>' +
            '</div>' +
            '<div class="mapp-grid">' + grid + '</div>' +
            '<div class="mapp-foot">Bấm một ứng dụng để mở</div>';
        document.body.appendChild(panel);

        panel.querySelectorAll('button[data-action]').forEach(function (b) {
            b.addEventListener('click', function () { doAction(b.getAttribute('data-action')); });
        });

        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && _open) setOpen(false); });
    }

    function insertNavButton() {
        var navRight = document.querySelector('.maple-nav-right');
        if (!navRight || document.getElementById('maple-nav-apps')) return false;

        var btn = document.createElement('button');
        btn.id = 'maple-nav-apps';
        btn.className = 'maple-nav-apps';
        btn.type = 'button';
        btn.title = 'Ứng dụng';
        btn.setAttribute('aria-label', 'Ứng dụng');
        btn.textContent = '▦';
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            buildPanel();
            setOpen(!_open);
        });

        /* Chèn trước .maple-live-badge nếu có, nếu không thì cuối navRight */
        var live = navRight.querySelector('.maple-live-badge');
        if (live) navRight.insertBefore(btn, live);
        else navRight.appendChild(btn);
        return true;
    }

    function init() {
        injectCSS();
        /* GlobalNav render navbar async → thử chèn, nếu chưa có thì poll ngắn */
        if (insertNavButton()) return;
        var tries = 0;
        var t = setInterval(function () {
            if (insertNavButton() || ++tries > 30) clearInterval(t);
        }, 200);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
