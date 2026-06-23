/* ============================================
   M.A.P.L.E — MediaWiki:ThongBao.js
   Trang Thông_báo/{username} — notification center
   Đọc JSON từ chính trang đó, render đẹp, mark as read.
   ============================================ */
(function () {
    'use strict';

    function init() {
        var cfg      = mw.config.get(['wgPageName', 'wgUserName', 'wgUserId', 'wgScriptPath']);
        var pageName = cfg.wgPageName || '';
        var userName = cfg.wgUserName || '';
        var isLoggedIn = !!cfg.wgUserId;
        var scriptPath = cfg.wgScriptPath || '';

        /* Chỉ chạy trên trang Thông_báo/{ai đó} */
        var m = pageName.match(/^Th%C3%B4ng_b%C3%A1o\/(.+)$/) ||
                pageName.match(/^Thông_báo\/(.+)$/) ||
                decodeURIComponent(pageName).match(/^Thông_báo\/(.+)$/);
        if (!m) return;
        var pageOwner = decodeURIComponent(m[1]).replace(/_/g, ' ');
        var isOwn = isLoggedIn && userName === pageOwner;

        var host = document.getElementById('mw-content-text');
        if (!host) return;

        /* ── CSS ── */
        if (!document.getElementById('tb-css')) {
            var s = document.createElement('style');
            s.id = 'tb-css';
            s.textContent = [
                '#tb-root{max-width:720px;margin:0 auto;padding:32px 16px 80px;font-family:"JetBrains Mono",monospace}',
                '.tb-hero{margin-bottom:32px}',
                '.tb-eyebrow{font-size:9px;letter-spacing:.2em;color:#52525b;text-transform:uppercase;margin-bottom:8px}',
                '.tb-title{font-size:1.6rem;font-weight:700;letter-spacing:.04em;color:#f4f4f5;margin:0 0 6px}',
                '.tb-title em{color:#ef4444;font-style:normal}',
                '.tb-sub{font-size:.8rem;color:#52525b;line-height:1.6}',
                '.tb-toolbar{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;align-items:center}',
                '.tb-btn{font-size:9px;letter-spacing:.12em;padding:5px 12px;border:1px solid #1e1e1e;',
                '  background:transparent;color:#71717a;cursor:pointer;transition:all .15s;font-family:inherit;text-transform:uppercase}',
                '.tb-btn:hover{border-color:#52525b;color:#e4e4e7}',
                '.tb-btn.danger:hover{border-color:#450a0a;color:#ef4444}',
                '.tb-count{font-size:9px;color:#52525b;letter-spacing:.1em;margin-left:auto}',
                '.tb-empty{text-align:center;padding:60px 20px;color:#52525b;font-size:.85rem;letter-spacing:.08em}',
                '.tb-empty-icon{font-size:2rem;margin-bottom:12px}',
                '.tb-list{display:flex;flex-direction:column;gap:2px}',
                '.tb-item{display:flex;gap:14px;padding:16px;border:1px solid #141414;',
                '  background:#090909;transition:background .15s,border-color .15s;cursor:default;position:relative}',
                '.tb-item.unread{border-left:2px solid #eab308;background:#0a0900}',
                '.tb-item.unread .tb-item-title{color:#f4f4f5}',
                '.tb-item-icon{flex-shrink:0;width:32px;height:32px;display:flex;align-items:center;',
                '  justify-content:center;font-size:1rem;background:#111;border:1px solid #1e1e1e;border-radius:2px}',
                '.tb-item-body{flex:1;min-width:0}',
                '.tb-item-title{font-size:.82rem;font-weight:600;color:#a1a1aa;letter-spacing:.02em;',
                '  margin-bottom:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
                '.tb-item-text{font-size:.78rem;color:#52525b;line-height:1.6}',
                '.tb-item-text a{color:#ef4444;text-decoration:none}',
                '.tb-item-text a:hover{text-decoration:underline}',
                '.tb-item-text .notif-join-btn{display:inline-block;margin-top:8px;padding:5px 14px;',
                '  background:#ef4444;color:#fff!important;font-weight:700;font-size:10px;',
                '  letter-spacing:.08em;text-decoration:none!important;border-radius:3px}',
                '.tb-item-meta{display:flex;align-items:center;gap:8px;margin-top:6px}',
                '.tb-item-from{font-size:.68rem;letter-spacing:.1em;color:#52525b;text-transform:uppercase}',
                '.tb-item-ts{font-size:.68rem;color:#52525b;margin-left:auto}',
                '.tb-unread-dot{width:6px;height:6px;border-radius:50%;background:#eab308;',
                '  flex-shrink:0;align-self:flex-start;margin-top:6px;box-shadow:0 0 6px rgba(234,179,8,.5)}',
                '.tb-item-del{position:absolute;top:10px;right:10px;background:transparent;border:none;',
                '  color:#52525b;cursor:pointer;font-size:.75rem;padding:2px 6px;',
                '  transition:color .15s;font-family:inherit}',
                '.tb-item-del:hover{color:#ef4444}',
                '.tb-read-btn{background:transparent;border:none;font-size:.65rem;letter-spacing:.1em;',
                '  color:#52525b;cursor:pointer;font-family:inherit;padding:0;text-transform:uppercase;',
                '  transition:color .15s}',
                '.tb-read-btn:hover{color:#eab308}',
                '.tb-guest{text-align:center;padding:60px 20px;color:#52525b;font-size:.85rem}',
                /* Lọc theo app */
                '.tb-filter{font-family:inherit;font-size:9px;letter-spacing:.1em;padding:5px 10px;',
                '  border:1px solid #1e1e1e;background:#090909;color:#a1a1aa;cursor:pointer;text-transform:uppercase}',
                '.tb-filter:focus{outline:none;border-color:#ef4444}',
                /* Panel cài đặt notifier */
                '.tb-settings{border:1px solid #141414;background:#070707;margin-bottom:20px;padding:14px 16px}',
                '.tb-settings-hd{font-size:9px;letter-spacing:.18em;color:#ef4444;text-transform:uppercase;margin-bottom:12px}',
                '.tb-set-row{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #0e0e0e}',
                '.tb-set-row:last-child{border-bottom:none}',
                '.tb-set-name{font-size:.78rem;color:#a1a1aa;display:flex;align-items:center;gap:8px}',
                '.tb-toggle{font-family:inherit;font-size:8.5px;letter-spacing:.1em;padding:4px 12px;cursor:pointer;',
                '  border:1px solid #1e1e1e;background:transparent;text-transform:uppercase;transition:all .15s}',
                '.tb-toggle.on{color:#22c55e;border-color:#196327}',
                '.tb-toggle.off{color:#52525b;border-color:#1e1e1e}'
            ].join('');
            document.head.appendChild(s);
        }

        /* ── Helpers ── */
        function esc(s) {
            return String(s||'').replace(/[&<>"']/g,function(c){
                return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
            });
        }
        function fmtTs(ts) {
            if (!ts) return '';
            var d = new Date(ts);
            if (isNaN(d)) return ts;
            var now = new Date();
            var diff = Math.floor((now - d) / 1000);
            if (diff < 60)   return 'vừa xong';
            if (diff < 3600) return Math.floor(diff/60) + ' phút trước';
            if (diff < 86400)return Math.floor(diff/3600) + ' giờ trước';
            if (diff < 604800) return Math.floor(diff/86400) + ' ngày trước';
            return d.toLocaleDateString('vi-VN');
        }
        function notifIcon(from, title) {
            if (/EventNotifier/i.test(from)) {
                if (/bắt đầu|started/i.test(title)) return '🎉';
                if (/đăng ký|notify/i.test(title))  return '🔔';
                if (/tham gia|join/i.test(title))    return '🚀';
                return '📢';
            }
            if (/CommentBot/i.test(from))     return '💬';
            if (/AchievementBot/i.test(from)) return '🏆';
            if (/ModerationBot/i.test(from)) {
                if (/từ chối|reject/i.test(title)) return '❌';
                return '✅';
            }
            return '📬';
        }
        /* Nhãn app hiển thị + để cấu hình bật/tắt */
        var APP_LABELS = {
            'EventNotifier':  'Sự kiện',
            'CommentBot':     'Bình luận',
            'AchievementBot': 'Thành tựu',
            'ModerationBot':  'Kiểm duyệt'
        };

        var API = new mw.Api();
        var notifPageTitle = decodeURIComponent(pageName);
        var notifs = [];
        var filterFrom = '';      /* '' = tất cả; hoặc tên app */
        var showSettings = false; /* panel cài đặt notifier */

        function loadAndRender() {
            host.innerHTML = '<div id="tb-root"><div class="tb-empty"><div class="tb-empty-icon">⏳</div>Đang tải thông báo...</div></div>';
            API.get({
                action: 'query', titles: notifPageTitle,
                prop: 'revisions', rvprop: 'content', rvslots: 'main',
                format: 'json', formatversion: 2
            }).done(function (d) {
                var pages = d.query && d.query.pages;
                var pg    = pages && pages[0];
                if (!pg || pg.missing !== undefined) {
                    notifs = [];
                } else {
                    try {
                        var raw = (pg.revisions[0].slots.main.content) || '[]';
                        notifs = JSON.parse(raw);
                        if (!Array.isArray(notifs)) notifs = [];
                    } catch(e) { notifs = []; }
                }
                render();
            }).fail(function () { notifs = []; render(); });
        }

        function saveNotifs(cb) {
            API.get({ action: 'query', meta: 'tokens', type: 'csrf', format: 'json' })
                .done(function (td) {
                    var token = td.query && td.query.tokens && td.query.tokens.csrftoken;
                    if (!token || token === '+\\') return;
                    API.post({
                        action: 'edit', title: notifPageTitle,
                        text: JSON.stringify(notifs, null, 2),
                        summary: 'Cập nhật thông báo',
                        token: token, format: 'json'
                    }).done(function () { if (cb) cb(); });
                });
        }

        function markAllRead() {
            notifs.forEach(function (n) { n.read = true; });
            saveNotifs(render);
        }

        function deleteNotif(idx) {
            notifs.splice(idx, 1);
            saveNotifs(render);
        }

        function markOneRead(idx) {
            if (notifs[idx]) { notifs[idx].read = true; saveNotifs(render); }
        }

        function clearAll() {
            notifs = [];
            saveNotifs(render);
        }

        function render() {
            var root = document.getElementById('tb-root');
            if (!root) {
                host.innerHTML = '<div id="tb-root"></div>';
                root = document.getElementById('tb-root');
            }

            var unreadCount = notifs.filter(function(n){ return !n.read; }).length;
            var logo = (window.MAPLE && window.MAPLE.logoSVG) ? window.MAPLE.logoSVG(36) : '';

            var heroHtml =
                '<div class="tb-hero">' +
                '<div class="tb-eyebrow">' + logo + ' // THÔNG BÁO HỆ THỐNG</div>' +
                '<h1 class="tb-title">THÔNG <em>BÁO</em></h1>' +
                '<p class="tb-sub">Của <strong>' + esc(pageOwner) + '</strong>' +
                (unreadCount > 0 ? ' — <span style="color:#eab308">' + unreadCount + ' chưa đọc</span>' : ' — Tất cả đã đọc') +
                '</p>' +
                '</div>';

            /* Các app có mặt trong danh sách thông báo (để dựng dropdown lọc) */
            var fromsPresent = [];
            notifs.forEach(function (n) {
                var f = n.from || 'Hệ thống';
                if (fromsPresent.indexOf(f) === -1) fromsPresent.push(f);
            });

            var toolbarHtml = '';
            if (isOwn && notifs.length > 0) {
                var filterOpts = '<option value="">Tất cả (' + notifs.length + ')</option>' +
                    fromsPresent.map(function (f) {
                        var lbl = APP_LABELS[f] || f;
                        var cnt = notifs.filter(function (n) { return (n.from||'Hệ thống') === f; }).length;
                        return '<option value="' + esc(f) + '"' + (filterFrom === f ? ' selected' : '') + '>' +
                               esc(lbl) + ' (' + cnt + ')</option>';
                    }).join('');
                toolbarHtml =
                    '<div class="tb-toolbar">' +
                    (unreadCount > 0 ?
                        '<button class="tb-btn" id="tb-mark-all">✓ Đánh dấu tất cả đã đọc</button>' : '') +
                    '<button class="tb-btn danger" id="tb-clear-all">🗑 Xoá tất cả</button>' +
                    '<button class="tb-btn" id="tb-settings-btn">⚙ Cài đặt</button>' +
                    '<select class="tb-filter" id="tb-filter">' + filterOpts + '</select>' +
                    '<span class="tb-count">' + notifs.length + ' thông báo</span>' +
                    '</div>';
            }

            /* Panel cài đặt: bật/tắt từng app notifier (qua MAPLE.notify.setEnabled) */
            var settingsHtml = '';
            if (isOwn && showSettings) {
                var N = window.MAPLE && window.MAPLE.notify;
                var rows = Object.keys(APP_LABELS).map(function (app) {
                    var on = !N || N.isEnabled === undefined ? true : N.isEnabled(app);
                    return '<div class="tb-set-row">' +
                        '<span class="tb-set-name">' + notifIcon(app, '') + ' ' + esc(APP_LABELS[app]) + '</span>' +
                        '<button class="tb-toggle ' + (on ? 'on' : 'off') + '" data-app="' + esc(app) + '">' +
                        (on ? 'Đang bật' : 'Đã tắt') + '</button>' +
                        '</div>';
                }).join('');
                settingsHtml =
                    '<div class="tb-settings">' +
                    '<div class="tb-settings-hd">// Cài đặt thông báo — bật/tắt từng nguồn</div>' +
                    rows +
                    '</div>';
            }

            var listHtml = '';
            if (!isOwn && !isLoggedIn) {
                listHtml = '<div class="tb-guest">Đăng nhập để xem thông báo.</div>';
            } else if (!isOwn) {
                listHtml = '<div class="tb-guest" style="color:#52525b">Trang thông báo cá nhân — chỉ chủ sở hữu có thể xem.</div>';
            } else if (notifs.length === 0) {
                listHtml = '<div class="tb-empty"><div class="tb-empty-icon">🔕</div>Chưa có thông báo nào.</div>';
            } else {
                /* Lọc theo app nhưng GIỮ index gốc để mark/delete đúng phần tử */
                var visible = notifs.map(function (n, i) { return { n: n, i: i }; })
                    .filter(function (o) { return !filterFrom || (o.n.from || 'Hệ thống') === filterFrom; });
                if (!visible.length) {
                    listHtml = '<div class="tb-empty"><div class="tb-empty-icon">🔍</div>Không có thông báo nào khớp bộ lọc.</div>';
                } else {
                    listHtml = '<div class="tb-list">';
                    visible.forEach(function (o) {
                        var n = o.n, i = o.i;
                        var icon = notifIcon(n.from || '', n.title || '');
                        var unread = !n.read;
                        listHtml +=
                            '<div class="tb-item' + (unread ? ' unread' : '') + '" data-idx="' + i + '">' +
                            (unread ? '<div class="tb-unread-dot"></div>' : '') +
                            '<div class="tb-item-icon">' + icon + '</div>' +
                            '<div class="tb-item-body">' +
                            '<div class="tb-item-title">' + esc(n.title || '') + '</div>' +
                            '<div class="tb-item-text">' + (n.body || '') + '</div>' +
                            '<div class="tb-item-meta">' +
                            '<span class="tb-item-from">' + esc(n.from || 'Hệ thống') + '</span>' +
                            (unread ? '<button class="tb-read-btn" data-read="' + i + '">Đánh dấu đã đọc</button>' : '') +
                            '<span class="tb-item-ts">' + esc(fmtTs(n.ts)) + '</span>' +
                            '</div>' +
                            '</div>' +
                            '<button class="tb-item-del" data-del="' + i + '" title="Xoá">✕</button>' +
                            '</div>';
                    });
                    listHtml += '</div>';
                }
            }

            root.innerHTML = heroHtml + toolbarHtml + settingsHtml + listHtml;

            /* Wire buttons */
            var markAllBtn = document.getElementById('tb-mark-all');
            var clearBtn   = document.getElementById('tb-clear-all');
            if (markAllBtn) markAllBtn.addEventListener('click', markAllRead);
            if (clearBtn)   clearBtn.addEventListener('click', function () {
                if (confirm('Xoá toàn bộ ' + notifs.length + ' thông báo?')) clearAll();
            });
            var filterEl = document.getElementById('tb-filter');
            if (filterEl) filterEl.addEventListener('change', function () {
                filterFrom = filterEl.value; render();
            });
            var setBtn = document.getElementById('tb-settings-btn');
            if (setBtn) setBtn.addEventListener('click', function () {
                showSettings = !showSettings; render();
            });
            root.querySelectorAll('.tb-toggle').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var app = btn.getAttribute('data-app');
                    var N = window.MAPLE && window.MAPLE.notify;
                    if (!N || !N.setEnabled) return;
                    var nowOn = N.isEnabled(app);
                    N.setEnabled(app, !nowOn); /* đảo trạng thái */
                    render();
                });
            });

            root.querySelectorAll('[data-del]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    deleteNotif(+btn.getAttribute('data-del'));
                });
            });
            root.querySelectorAll('[data-read]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    markOneRead(+btn.getAttribute('data-read'));
                });
            });
        }

        loadAndRender();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
