/* ============================================
   M.A.P.L.E — MediaWiki:SuKien.js  v3.1
   Trang Sự Kiện — index (timeline) + trang chi tiết Sự_Kiện/{ID}
   Dữ liệu: MediaWiki:SuKien-data.json

   Schema mỗi sự kiện:
   {
     id, title, desc, content, date, start, end, status,
     participants, leaderboard[], allowSubmit, specialTabs[],
     badge,           — huy hiệu độc quyền (tên)
     accentColor,     — màu chủ đạo (hex, vd "#ef4444")
     bannerImage,     — URL ảnh banner đầu trang
     themePageSuffix, — khi tham gia: tải theme từ /Sự_kiện:{id}/theme (thêm vào mọi trang)
     rules,           — quy tắc tham gia (HTML/text)
     rewards[],       — [{ type:"badge"|"rp", value, label }]
     maxParticipants, — giới hạn số người (0 = không giới hạn)
     minRP            — RP tối thiểu để tham gia (0 = không yêu cầu)
   }

   Thông báo qua EventNotifier (danh tính giả lập):
     · Trang Thông_báo/{username} (namespace chính)
     · Inbox MAPLE-Chat: Người_dùng:{username}/Chat/Inbox
   ============================================ */
(function () {
    function init() {
        var target = document.getElementById('sk-root-placeholder')
                  || document.getElementById('mw-content-text');
        if (!target) return;

        /* ── Hằng số ── */
        var STATUS = {
            ongoing:  { label: 'ĐANG DIỄN RA', cls: 'sk-ongoing'  },
            upcoming: { label: 'SẮP TỚI',      cls: 'sk-upcoming' },
            past:     { label: 'ĐÃ KẾT THÚC',  cls: 'sk-past'     }
        };
        var ADMIN_GROUPS    = ['sysop', 'bureaucrat', 'interface-admin'];
        var NOTIFIER_NAME   = 'EventNotifier';  /* Tên hiển thị tài khoản ảo */
        var NOTIF_PAGE_PRE  = 'Thông_báo/';     /* Thông_báo/{username} */

        /* ── Helpers ── */
        function esc(s) {
            return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
            });
        }
        function logo(sz) { return (window.MAPLE && window.MAPLE.logoSVG) ? window.MAPLE.logoSVG(sz) : ''; }

        /* ── MediaWiki context ── */
        var cfg        = mw.config.get(['wgPageName','wgUserId','wgUserName','wgUserGroups','wgScriptPath']);
        var isLoggedIn = cfg.wgUserId !== 0;
        var userName   = cfg.wgUserName || '';
        var userGroups = cfg.wgUserGroups || [];
        var isAdmin    = ADMIN_GROUPS.some(function (g) { return userGroups.indexOf(g) !== -1; });
        var scriptPath = cfg.wgScriptPath || '';
        var API        = new mw.Api();

        /* ── Xác định subpage ── */
        var pn  = cfg.wgPageName || '';
        var dec = pn; try { dec = decodeURIComponent(pn); } catch (e) {}
        var norm = dec.replace(/_/g, ' ');
        var subId = null;
        var mPage = norm.match(/^Sự Kiện\/(.+)$/);
        if (mPage) subId = mPage[1].trim();

        target.innerHTML = '<div id="sk-root"><div class="sk-loading"><div class="sk-spin"></div>// ĐANG TẢI SỰ KIỆN...</div></div>';

        /* ── Load dữ liệu sự kiện ── */
        $.getJSON(scriptPath + '/api.php', {
            action: 'query', titles: 'MediaWiki:SuKien-data.json',
            prop: 'revisions', rvprop: 'content', rvslots: 'main', format: 'json', origin: '*'
        }).done(function (d) {
            try {
                var pages = d.query.pages, pg = pages[Object.keys(pages)[0]];
                var data = (pg.missing !== undefined) ? { events: [] } : JSON.parse(pg.revisions[0].slots.main['*']);
                if (subId) renderDetail(data, subId);
                else       renderIndex(data);
            } catch (e) {
                target.innerHTML = '<p style="color:#ef4444;padding:2rem;font-family:monospace">// LỖI PARSE: ' + esc(e.message) + '</p>';
            }
        }).fail(function (x, s) {
            target.innerHTML = '<p style="color:#ef4444;padding:2rem;font-family:monospace">// LỖI KẾT NỐI: ' + esc(s) + '</p>';
        });

        /* ── Kiểm tra thông báo pending khi vào bất kỳ trang sự kiện nào ── */
        if (isLoggedIn) checkPendingNotifications();

        function evUrl(ev) { return '/wiki/S%E1%BB%B1_Ki%E1%BB%87n/' + encodeURIComponent(ev.id || ''); }

        /* ════════════════════════════════════════════════════════
           THỜI GIAN
        ════════════════════════════════════════════════════════ */
        function parseTs(s) {
            if (!s) return null;
            s = String(s).trim();
            var mx = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})(?:[ T](\d{1,2}):(\d{2}))?$/);
            if (mx) return new Date(+mx[3], +mx[2]-1, +mx[1], mx[4]?+mx[4]:0, mx[5]?+mx[5]:0, 0).getTime();
            var t = Date.parse(s);
            return isNaN(t) ? null : t;
        }
        function liveStatus(ev) {
            var s = parseTs(ev.start), e = parseTs(ev.end), now = Date.now();
            if (s === null && e === null) return { key: ev.status || 'upcoming' };
            if (s !== null && now < s)   return { key: 'upcoming', target: s, kind: 'start' };
            if (e !== null && now >= e)  return { key: 'past' };
            return { key: 'ongoing', target: (e !== null ? e : null), kind: 'end' };
        }
        function fmtCountdown(ms) {
            if (ms < 0) ms = 0;
            var s = Math.floor(ms / 1000);
            var dd = Math.floor(s / 86400); s -= dd * 86400;
            var h  = Math.floor(s / 3600);  s -= h * 3600;
            var mn = Math.floor(s / 60);    s -= mn * 60;
            function p(n) { return (n < 10 ? '0' : '') + n; }
            return [
                { v: dd,   u: 'NGÀY' }, { v: p(h),  u: 'GIỜ' },
                { v: p(mn),u: 'PHÚT' }, { v: p(s),  u: 'GIÂY' }
            ].map(function (x) {
                return '<span class="sk-cd-cell"><b>' + x.v + '</b><i>' + x.u + '</i></span>';
            }).join('');
        }
        var _cdTimer = null;

        /* ════════════════════════════════════════════════════════
           INDEX — timeline
        ════════════════════════════════════════════════════════ */
        function renderIndex(data) {
            var events = data.events || [];
            var rows = events.map(function (ev, i) {
                var st = STATUS[ev.status] || STATUS.upcoming;
                var detail = ev.id
                    ? '<a class="sk-link" href="' + evUrl(ev) + '">Xem chi tiết →</a>'
                    : (ev.link ? '<a class="sk-link" href="' + esc(ev.link) + '">Xem chi tiết →</a>' : '');
                var accent = ev.accentColor ? ' style="border-left-color:' + esc(ev.accentColor) + '"' : '';
                return '<div class="sk-item ' + st.cls + '" style="animation-delay:' + (i * 0.06) + 's">' +
                    '<div class="sk-dot"' + (ev.accentColor ? ' style="border-color:' + esc(ev.accentColor) + ';box-shadow:0 0 8px ' + esc(ev.accentColor) + '40"' : '') + '></div>' +
                    '<div class="sk-content"' + accent + '>' +
                        '<div class="sk-meta"><span class="sk-status">' + st.label + '</span>' +
                            (ev.badge ? '<span class="sk-badge-pill">🏅 ' + esc(ev.badge) + '</span>' : '') +
                            '<time class="sk-date">' + esc(ev.date || ev.start || '') + '</time></div>' +
                        '<h2 class="sk-name">' + (ev.id
                            ? '<a href="' + evUrl(ev) + '">' + esc(ev.title || '') + '</a>'
                            : esc(ev.title || '')) + '</h2>' +
                        '<p class="sk-desc">' + esc(ev.desc || '') + '</p>' + detail +
                    '</div>' +
                    '</div>';
            }).join('');

            target.innerHTML =
                '<div id="sk-root">' +
                '<div class="sk-hero">' +
                    '<div class="sk-hero-logo">' + logo(64) + '</div>' +
                    '<div class="sk-eyebrow">// DÒNG SỰ KIỆN M.A.P.L.E</div>' +
                    '<h1 class="sk-title">SỰ <span>KIỆN</span></h1>' +
                    '<p class="sk-sub">Cuộc thi viết, hoạt động cộng đồng và các cột mốc của wiki.</p>' +
                '</div>' +
                (isAdmin ? '<div class="sk-admin-bar"><button class="sk-create-btn" id="sk-open-create">+ Tạo Sự Kiện Mới</button></div>' : '') +
                '<div class="sk-timeline">' + (rows || '<div class="sk-empty">// CHƯA CÓ SỰ KIỆN NÀO</div>') + '</div>' +
                '<div class="sk-footer"><a href="/wiki/Trang_Ch%C3%ADnh">← Trang Chủ</a>' +
                    '<a href="/wiki/B%E1%BA%A3ng_Tin">Bảng Tin →</a></div>' +
                '</div>';

            if (isAdmin) wireCreateForm(data, null);
        }

        /* ════════════════════════════════════════════════════════
           DETAIL — Sự_Kiện/{ID}
        ════════════════════════════════════════════════════════ */
        function renderDetail(data, id) {
            var ev = (data.events || []).filter(function (e) {
                return String(e.id) === String(id);
            })[0];

            if (!ev) {
                target.innerHTML =
                    '<div id="sk-root"><div class="sk-detail">' +
                    '<div class="sk-d-logo">' + logo(64) + '</div>' +
                    '<div class="sk-empty">// KHÔNG TÌM THẤY SỰ KIỆN "<b>' + esc(id) + '</b>"</div>' +
                    '<div class="sk-footer"><a href="/wiki/S%E1%BB%B1_Ki%E1%BB%87n">← Tất cả sự kiện</a></div>' +
                    '</div></div>';
                return;
            }

            var ls  = liveStatus(ev);
            var st  = STATUS[ls.key] || STATUS.upcoming;
            var acc = ev.accentColor || '#ef4444';
            document.title = (ev.title || 'Sự kiện') + ' — M.A.P.L.E Wiki';

            /* Inject CSS biến accent cho sự kiện này */
            injectEventAccent(acc);

            /* Kiểm tra & áp theme sự kiện nếu user đã tham gia */
            if (ev.themePageSuffix && isLoggedIn) applyEventThemeIfJoined(ev);

            /* ── Xây tab list ── */
            var tabs = [{ id: 'tab-join', label: 'Tham Gia & Mô Tả' }];
            if (ev.leaderboard && ev.leaderboard.length)
                tabs.push({ id: 'tab-rank',  label: 'Bảng Xếp Hạng' });
            if (ev.allowSubmit)
                tabs.push({ id: 'tab-sub',   label: 'Nộp Bài' });
            if (ev.specialTabs && ev.specialTabs.length) {
                ev.specialTabs.forEach(function (t) {
                    tabs.push({ id: 'tab-sp-' + esc(t.id), label: esc(t.label) });
                });
            }

            var tabBar = tabs.map(function (t, i) {
                return '<button class="sk-tab-btn' + (i === 0 ? ' sk-tab-active' : '') +
                    '" data-tab="' + t.id + '">' + t.label + '</button>';
            }).join('');

            var panelJoin = buildPanelJoin(ev, ls);
            var panelRank = (ev.leaderboard && ev.leaderboard.length) ? buildPanelRank(ev) : '';
            var panelSub  = ev.allowSubmit ? buildPanelSubmit(ev) : '';
            var panelsSp  = (ev.specialTabs || []).map(function (t) {
                return '<div class="sk-tab-panel" id="tab-sp-' + esc(t.id) + '" style="display:none">' +
                    '<div class="sk-d-eyebrow">// ' + esc(t.label).toUpperCase() + '</div>' +
                    '<div class="sk-d-content">' + (t.content || '') + '</div></div>';
            }).join('');

            target.innerHTML =
                '<div id="sk-root"><article class="sk-detail ' + st.cls + '">' +
                    /* Banner ảnh */
                    (ev.bannerImage ? '<div class="sk-d-banner" style="background-image:url(\'' + esc(ev.bannerImage) + '\')"></div>' : '') +
                    /* Breadcrumb */
                    '<div class="sk-d-bc"><a href="/wiki/S%E1%BB%B1_Ki%E1%BB%87n">Sự Kiện</a>' +
                        '<span class="sk-d-sep">/</span><span>' + esc(ev.title || '') + '</span></div>' +
                    /* Header */
                    '<div class="sk-d-head">' +
                        '<div class="sk-d-logo">' + logo(58) + '</div>' +
                        '<span class="sk-status sk-d-status">' + st.label + '</span>' +
                        '<h1 class="sk-d-title">' + esc(ev.title || '') + '</h1>' +
                        (ev.badge ? '<div class="sk-ev-badge">🏅 ' + esc(ev.badge) + '</div>' : '') +
                        buildRewardChips(ev) +
                    '</div>' +
                    /* Tabs */
                    '<div class="sk-tab-bar">' + tabBar + '</div>' +
                    '<div class="sk-tab-panels">' + panelJoin + panelRank + panelSub + panelsSp + '</div>' +
                    /* Admin */
                    (isAdmin ? '<div class="sk-admin-bar sk-admin-bar--detail"><button class="sk-create-btn" id="sk-open-create">✏ Chỉnh Sửa Sự Kiện</button></div>' : '') +
                    '<div class="sk-footer"><a href="/wiki/S%E1%BB%B1_Ki%E1%BB%87n">← Tất cả sự kiện</a>' +
                        '<a href="/wiki/Trang_Ch%C3%ADnh">Trang Chủ →</a></div>' +
                '</article></div>';

            wireDetail(ev, ls);
            wireTabs();
            if (isAdmin) wireCreateForm(data, ev);
        }

        /* ── Inject CSS biến màu accent ── */
        function injectEventAccent(color) {
            var old = document.getElementById('sk-accent-style');
            if (old) old.remove();
            var style = document.createElement('style');
            style.id = 'sk-accent-style';
            style.textContent =
                ':root { --sk-accent: ' + color + '; --sk-accent-dim: ' + color + '22; }' +
                '.sk-tab-btn.sk-tab-active { color: var(--sk-accent); border-bottom-color: var(--sk-accent); }' +
                '.sk-join-btn:not(.sk-join-login):not(.sk-join-notify):not(.sk-join-on):not(.sk-join-off) { background: var(--sk-accent); border-color: var(--sk-accent); }' +
                '.sk-d-time { border-left-color: var(--sk-accent) !important; }' +
                '.sk-d-title { color: #f4f4f5; }';
            document.head.appendChild(style);
        }

        /* ── Áp theme toàn wiki khi user đã tham gia sự kiện ── */
        function applyEventThemeIfJoined(ev) {
            var JKEY = 'maple_ev_join_' + ev.id;
            var joined = false;
            try { joined = localStorage.getItem(JKEY) === '1'; } catch(e){}
            if (!joined) return;
            /* Load CSS từ trang /Sự_kiện:{id}/theme */
            var themeTitle = 'Sự_kiện:' + ev.id + '/theme';
            mw.loader.load(scriptPath + '?title=' + encodeURIComponent(themeTitle) + '.css&action=raw&ctype=text/css', 'text/css');
        }

        /* ── Chips phần thưởng ── */
        function buildRewardChips(ev) {
            if (!ev.rewards || !ev.rewards.length) return '';
            var chips = ev.rewards.map(function (r) {
                var icon = r.type === 'badge' ? '🏅' : r.type === 'rp' ? '⭐' : '🎁';
                return '<span class="sk-reward-chip">' + icon + ' ' + esc(r.label || r.value) + '</span>';
            }).join('');
            return '<div class="sk-rewards-row">' + chips + '</div>';
        }

        /* ════════════════════════════════════════════════════════
           PANEL — Tham Gia & Mô Tả
        ════════════════════════════════════════════════════════ */
        function buildPanelJoin(ev, ls) {
            var cdBlock =
                '<div class="sk-d-action">' +
                    '<div class="sk-cd-wrap" id="sk-countdown"></div>' +
                    buildJoinBtn(ev, ls) +
                    '<div class="sk-join-count" id="sk-join-count"></div>' +
                    (ev.maxParticipants ? '<div class="sk-join-cap" id="sk-join-cap"></div>' : '') +
                '</div>';

            var timeBlock =
                '<div class="sk-d-time">' +
                    '<div class="sk-d-eyebrow">// THỜI GIAN</div>' +
                    '<div class="sk-d-time-row">' +
                        '<div class="sk-d-time-cell"><span class="sk-d-time-lbl">Bắt đầu</span>' +
                            '<span class="sk-d-time-val">' + esc(ev.start || ev.date || '—') + '</span></div>' +
                        '<span class="sk-d-arrow">→</span>' +
                        '<div class="sk-d-time-cell"><span class="sk-d-time-lbl">Kết thúc</span>' +
                            '<span class="sk-d-time-val">' + esc(ev.end || '—') + '</span></div>' +
                    '</div>' +
                '</div>';

            var rulesBlock = ev.rules
                ? '<div class="sk-d-rules"><div class="sk-d-eyebrow">// QUY TẮC THAM GIA</div>' +
                  '<div class="sk-d-content">' + ev.rules + '</div></div>'
                : '';

            var bodyBlock =
                '<div class="sk-d-body">' +
                    '<div class="sk-d-eyebrow">// MÔ TẢ CHUNG</div>' +
                    '<div class="sk-d-content">' + (ev.content || esc(ev.desc || 'Chưa có nội dung chi tiết.')) + '</div>' +
                '</div>';

            return '<div class="sk-tab-panel" id="tab-join">' + cdBlock + timeBlock + rulesBlock + bodyBlock + '</div>';
        }

        /* ── Nút tham gia (login-aware) ── */
        function buildJoinBtn(ev, ls) {
            if (ls.key === 'past')
                return '<button class="sk-join-btn sk-join-off" disabled>⊘ Đã kết thúc</button>';
            if (!isLoggedIn) {
                return '<button class="sk-join-btn sk-join-login" id="sk-join">→ Đăng nhập để tham gia</button>';
            }
            if (ls.key === 'upcoming')
                return '<button class="sk-join-btn sk-join-notify" id="sk-join">🔔 Thông báo cho tôi</button>';
            return '<button class="sk-join-btn" id="sk-join">🚀 Tham gia ngay</button>';
        }

        /* ════════════════════════════════════════════════════════
           PANEL — Bảng Xếp Hạng
        ════════════════════════════════════════════════════════ */
        function buildPanelRank(ev) {
            var lb = (ev.leaderboard || ev.ranking || []).slice();
            lb.sort(function (a, b) { return (Number(b.score) || 0) - (Number(a.score) || 0); });
            var rows = lb.map(function (p, i) {
                var medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ('#' + (i + 1));
                var nm = p.user || p.name || '—';
                var cell = p.user
                    ? '<a href="/wiki/Th%C3%A0nh_vi%C3%AAn:' + encodeURIComponent(p.user) + '">' + esc(nm) + '</a>'
                    : esc(nm);
                return '<tr class="sk-lb-row' + (i < 3 ? ' sk-lb-top' : '') + '">' +
                    '<td class="sk-lb-rank">' + medal + '</td>' +
                    '<td class="sk-lb-name">' + cell + '</td>' +
                    '<td class="sk-lb-score">' + esc(String(p.score != null ? p.score : '')) + '</td>' +
                    '<td class="sk-lb-note">' + esc(p.note || '') + '</td>' +
                    '</tr>';
            }).join('');
            return '<div class="sk-tab-panel" id="tab-rank" style="display:none">' +
                '<div class="sk-d-board"><div class="sk-d-eyebrow">// BẢNG XẾP HẠNG</div>' +
                '<table class="sk-lb"><thead><tr>' +
                    '<th>#</th><th>Thành viên</th><th>Điểm</th><th>Ghi chú</th>' +
                '</tr></thead><tbody>' + rows + '</tbody></table></div></div>';
        }

        /* ════════════════════════════════════════════════════════
           PANEL — Nộp Bài
        ════════════════════════════════════════════════════════ */
        function buildPanelSubmit(ev) {
            if (!isLoggedIn) {
                var loginUrl = '/wiki/Special:UserLogin?returnto=' + encodeURIComponent(cfg.wgPageName);
                return '<div class="sk-tab-panel" id="tab-sub" style="display:none">' +
                    '<div class="sk-d-eyebrow">// NỘP BÀI</div>' +
                    '<p class="sk-d-content"><a href="' + loginUrl + '">Đăng nhập</a> để nộp bài tham gia sự kiện.</p>' +
                    '</div>';
            }
            return '<div class="sk-tab-panel" id="tab-sub" style="display:none">' +
                '<div class="sk-d-eyebrow">// NỘP BÀI</div>' +
                '<div class="sk-submit-wrap">' +
                    '<p class="sk-submit-hint">Nhập tên trang wiki bài viết bạn muốn nộp:</p>' +
                    '<div class="sk-submit-row">' +
                        '<input id="sk-sub-input" class="sk-sub-input" type="text" placeholder="Ví dụ: Tên bài viết"/>' +
                        '<button id="sk-sub-btn" class="sk-join-btn">Nộp bài</button>' +
                    '</div>' +
                    '<div id="sk-sub-msg" class="sk-sub-msg"></div>' +
                    '<div id="sk-sub-list" class="sk-sub-list"></div>' +
                '</div>' +
                '</div>';
        }

        /* ════════════════════════════════════════════════════════
           WIRE — Tab switcher
        ════════════════════════════════════════════════════════ */
        function wireTabs() {
            var btns   = document.querySelectorAll('.sk-tab-btn');
            var panels = document.querySelectorAll('.sk-tab-panel');
            [].forEach.call(btns, function (btn) {
                btn.addEventListener('click', function () {
                    [].forEach.call(btns,   function (b) { b.classList.remove('sk-tab-active'); });
                    [].forEach.call(panels, function (p) { p.style.display = 'none'; });
                    btn.classList.add('sk-tab-active');
                    var panel = document.getElementById(btn.getAttribute('data-tab'));
                    if (panel) panel.style.display = '';
                });
            });
        }

        /* ════════════════════════════════════════════════════════
           WIRE — Đếm ngược + nút tham gia / thông báo
        ════════════════════════════════════════════════════════ */
        function wireDetail(ev, ls) {
            var cdWrap = document.getElementById('sk-countdown');
            function tick() {
                if (!cdWrap) return;
                var ls2 = liveStatus(ev);
                if (ls2.key === 'past') {
                    cdWrap.innerHTML = '<div class="sk-cd-label sk-cd-done">⊘ SỰ KIỆN ĐÃ KẾT THÚC</div>';
                    if (_cdTimer) { clearInterval(_cdTimer); _cdTimer = null; }
                    refreshJoin(); return;
                }
                if (ls2.target == null) {
                    var msg2 = ls2.key === 'upcoming' ? '● SẮP DIỄN RA' : '● ĐANG DIỄN RA — không thời hạn';
                    cdWrap.innerHTML = '<div class="sk-cd-label">' + msg2 + '</div>';
                    if (_cdTimer) { clearInterval(_cdTimer); _cdTimer = null; }
                    return;
                }
                var lbl2 = ls2.kind === 'start' ? 'BẮT ĐẦU SAU' : 'KẾT THÚC SAU';
                cdWrap.innerHTML = '<div class="sk-cd-label">⏳ ' + lbl2 + '</div>' +
                    '<div class="sk-cd-grid">' + fmtCountdown(ls2.target - Date.now()) + '</div>';
            }
            if (_cdTimer) { clearInterval(_cdTimer); _cdTimer = null; }
            if (cdWrap) { tick(); _cdTimer = setInterval(tick, 1000); }

            /* Giới hạn người tham gia */
            var capEl = document.getElementById('sk-join-cap');
            var JKEY  = 'maple_ev_join_'   + ev.id;
            var NKEY  = 'maple_ev_notify_' + ev.id;
            var base  = Number(ev.participants) || 0;
            var maxP  = Number(ev.maxParticipants) || 0;

            function isJoined()    { try { return localStorage.getItem(JKEY) === '1'; } catch(e) { return false; } }
            function isNotifying() { try { return localStorage.getItem(NKEY) === '1'; } catch(e) { return false; } }
            function setJoined(v)    { try { v ? localStorage.setItem(JKEY,'1') : localStorage.removeItem(JKEY); } catch(e){} }
            function setNotifying(v) { try { v ? localStorage.setItem(NKEY,'1') : localStorage.removeItem(NKEY); } catch(e){} }

            function refreshJoin() {
                var jbtn   = document.getElementById('sk-join');
                var jcount = document.getElementById('sk-join-count');
                if (!jcount) return;
                var j = isJoined();
                var total = base + (j ? 1 : 0);
                jcount.textContent = total.toLocaleString('vi-VN') + ' người tham gia';
                if (capEl && maxP) {
                    var pct = Math.min(100, Math.round(total / maxP * 100));
                    capEl.innerHTML = '<div class="sk-cap-bar"><div class="sk-cap-fill" style="width:' + pct + '%"></div></div>' +
                        '<span class="sk-cap-txt">' + total + ' / ' + maxP + ' chỗ</span>';
                }
                if (!jbtn) return;
                var curSt = liveStatus(ev).key;
                if (curSt === 'past') {
                    jbtn.textContent = '⊘ Đã kết thúc'; jbtn.disabled = true;
                    jbtn.className   = 'sk-join-btn sk-join-off'; return;
                }
                jbtn.disabled = false;
                if (curSt === 'upcoming') {
                    var n = isNotifying();
                    jbtn.className   = 'sk-join-btn sk-join-notify' + (n ? ' sk-notify-on' : '');
                    jbtn.textContent = n ? '🔔 Đã đăng ký thông báo (bấm để huỷ)' : '🔔 Thông báo cho tôi';
                    return;
                }
                /* Kiểm tra giới hạn */
                if (maxP && total >= maxP && !j) {
                    jbtn.textContent = '⊘ Đã đủ người'; jbtn.disabled = true;
                    jbtn.className   = 'sk-join-btn sk-join-off'; return;
                }
                /* Kiểm tra minRP */
                if (ev.minRP && !j) {
                    /* RP hiện tại chỉ check được nếu MAPLE.userRP expose — fallback: cho tham gia */
                    var userRP = (window.MAPLE && window.MAPLE.userRP) ? window.MAPLE.userRP : Infinity;
                    if (userRP < ev.minRP) {
                        jbtn.textContent = '⊘ Cần RP ≥ ' + ev.minRP; jbtn.disabled = true;
                        jbtn.className   = 'sk-join-btn sk-join-off'; return;
                    }
                }
                jbtn.className   = 'sk-join-btn' + (j ? ' sk-join-on' : '');
                jbtn.textContent = j ? '✓ Đã tham gia (bấm để huỷ)' : '🚀 Tham gia ngay';
            }

            var jbtn = document.getElementById('sk-join');
            if (!jbtn) return;
            if (!isLoggedIn) {
                jbtn.addEventListener('click', function () {
                    if (window.MAPLE && window.MAPLE.showGuestGate) {
                        window.MAPLE.showGuestGate('edit');
                    } else {
                        var loginUrl = '/wiki/Special:UserLogin?returnto=' + encodeURIComponent(cfg.wgPageName);
                        window.location.href = loginUrl;
                    }
                });
                refreshJoin();
                return;
            }

            jbtn.addEventListener('click', function () {
                var curSt = liveStatus(ev).key;
                if (curSt === 'past') return;

                if (curSt === 'upcoming') {
                    /* Toggle notify */
                    if (isNotifying()) {
                        setNotifying(false);
                        refreshJoin();
                    } else {
                        setNotifying(true);
                        refreshJoin();
                        /* Gửi thông báo qua 2 kênh */
                        sendEventNotification(ev, 'notify');
                        showNotifyPanel(ev);
                    }
                    return;
                }

                /* Tham gia / huỷ tham gia */
                var wasJoined = isJoined();
                setJoined(!wasJoined);
                refreshJoin();

                /* Áp theme nếu có */
                if (!wasJoined && ev.themePageSuffix) applyEventThemeIfJoined(ev);

                /* Gửi thông báo xác nhận tham gia */
                if (!wasJoined) {
                    sendEventNotification(ev, 'join');
                    if (window.MAPLE && window.MAPLE.ach) {
                        var ach = window.MAPLE.ach;
                        ach.rpAdd(5, 'join_event', 15, 'Tham gia sự kiện 🎫');
                        
                        var totalEventsJoined = 0;
                        try {
                            for (var i = 0; i < localStorage.length; i++) {
                                var k = localStorage.key(i);
                                if (k && k.indexOf('maple_ev_join_') === 0 && localStorage.getItem(k) === '1') {
                                    totalEventsJoined++;
                                }
                            }
                        } catch(e){}
                        
                        if (totalEventsJoined >= 1) {
                            window.MAPLE.award('event_join');
                            window.MAPLE.award('event_first');
                        }
                        if (totalEventsJoined >= 3) {
                            window.MAPLE.award('event_3');
                        }
                        if (totalEventsJoined >= 5) {
                            window.MAPLE.award('event_for_fun');
                            window.MAPLE.award('event_veteran');
                        }
                    }
                }
            });

            /* Nộp bài */
            if (ev.allowSubmit) wireSubmit(ev);
            refreshJoin();
        }

        /* ════════════════════════════════════════════════════════
           THÔNG BÁO — EventNotifier (danh tính giả lập)
           Gửi đến:
             1. Thông_báo/{username}   (namespace chính)
             2. Người_dùng:{username}/Chat/Inbox  (MAPLE-Chat)
        ════════════════════════════════════════════════════════ */
        /* Gửi 1 thông báo EventNotifier — ưu tiên lõi chung MAPLE.notify (1 nguồn duy nhất);
           fallback code cũ writeNotifPage+writeChatNotif nếu MAPLE-Notify chưa nạp. */
        function emitNotif(notifPage, title, body, now) {
            var N = window.MAPLE && window.MAPLE.notify;
            if (N && N.toUser) {
                N.toUser(userName, { from: NOTIFIER_NAME, title: title, body: body, summary: NOTIFIER_NAME + ': thông báo sự kiện' });
            } else {
                writeNotifPage(notifPage, title, body, now);
                writeChatNotif(userName, title, body, now);
            }
        }

        function sendEventNotification(ev, type) {
            if (!isLoggedIn || !userName) return;
            var notifPage  = NOTIF_PAGE_PRE + encodeURIComponent(userName).replace(/%20/g, '_');
            var now        = new Date().toISOString();
            var startFmt   = ev.start || '?';
            var evLink     = evUrl(ev);
            /* Nút tham gia dẫn thẳng tới trang sự kiện — class only, CSS lo style */
            var joinBtn    = '<a href="' + evLink + '" class="notif-join-btn">🚀 Tham gia ngay</a>';

            var msgTitle, msgBody;
            if (type === 'notify') {
                /* Gửi ngay: xác nhận đăng ký */
                msgTitle = '🔔 Đã đăng ký thông báo: ' + (ev.title || ev.id);
                msgBody  = 'Bạn đã đăng ký nhận thông báo cho sự kiện <b>' + esc(ev.title || ev.id) + '</b>. ' +
                           'Sự kiện sẽ bắt đầu vào <b>' + esc(startFmt) + '</b>.<br>' +
                           '<a href="' + evLink + '">Xem sự kiện →</a>';
                emitNotif(notifPage, msgTitle, msgBody, now);

                /* Lên lịch: khi đến giờ bắt đầu gửi thêm thông báo "Đã bắt đầu" kèm nút */
                var startTs = parseTs(ev.start);
                if (startTs) {
                    var delay = startTs - Date.now();
                    if (delay > 0) {
                        setTimeout(function () {
                            /* Kiểm tra chưa gửi (checkPendingNotifications có thể đã gửi trước) */
                            var SKEY2 = 'maple_ev_started_notif_' + ev.id;
                            var sent2 = false;
                            try { sent2 = localStorage.getItem(SKEY2) === '1'; } catch(e){}
                            if (sent2) return;
                            var startTitle = '🎉 Sự kiện đã bắt đầu: ' + (ev.title || ev.id);
                            var startBody  = 'Sự kiện <b>' + esc(ev.title || ev.id) + '</b> đã bắt đầu!<br>' + joinBtn;
                            var ts2 = new Date().toISOString();
                            emitNotif(notifPage, startTitle, startBody, ts2);
                            try { localStorage.setItem(SKEY2, '1'); } catch(e){}
                            try { localStorage.removeItem('maple_ev_notify_' + ev.id); } catch(e){}
                        }, delay);
                    }
                }
            } else if (type === 'join') {
                msgTitle = '🚀 Bạn đã tham gia: ' + (ev.title || ev.id);
                msgBody  = 'Bạn đã tham gia sự kiện <b>' + esc(ev.title || ev.id) + '</b>! ' +
                           (ev.badge ? 'Huy hiệu <b>' + esc(ev.badge) + '</b> sẽ được trao khi sự kiện kết thúc. ' : '') +
                           '<br>' + joinBtn;
                emitNotif(notifPage, msgTitle, msgBody, now);
            } else if (type === 'start') {
                /* Gọi từ checkPendingNotifications khi mở lại trang */
                msgTitle = '🎉 Sự kiện đã bắt đầu: ' + (ev.title || ev.id);
                msgBody  = 'Sự kiện <b>' + esc(ev.title || ev.id) + '</b> đã bắt đầu!<br>' + joinBtn;
                emitNotif(notifPage, msgTitle, msgBody, now);
            }
        }

        /* Ghi trang Thông_báo/{user}: JSON mảng thông báo */
        function writeNotifPage(pageTitle, msgTitle, msgBody, now) {
            API.get({
                action: 'query', titles: pageTitle,
                prop: 'revisions', rvprop: 'content', rvslots: 'main',
                format: 'json', formatversion: 2
            }).done(function (d) {
                var pages = d.query && d.query.pages;
                var pg    = pages && pages[0];
                var list  = [];
                if (pg && !pg.missing) {
                    try { list = JSON.parse((pg.revisions[0].slots.main.content) || '[]'); } catch(e){}
                }
                if (!Array.isArray(list)) list = [];
                list.unshift({ ts: now, from: NOTIFIER_NAME, title: msgTitle, body: msgBody, read: false });
                /* Giữ tối đa 50 thông báo */
                if (list.length > 50) list = list.slice(0, 50);
                API.get({ action: 'query', meta: 'tokens', type: 'csrf', format: 'json' })
                    .done(function (td) {
                        var token = td.query && td.query.tokens && td.query.tokens.csrftoken;
                        if (!token || token === '+\\') return;
                        API.post({
                            action: 'edit', title: pageTitle,
                            text: JSON.stringify(list, null, 2),
                            summary: NOTIFIER_NAME + ': thông báo sự kiện',
                            token: token, format: 'json'
                        });
                    });
            });
        }

        /* Ghi vào Người_dùng:{user}/Chat/Inbox để hiển thị trong MAPLE-Chat */
        function writeChatNotif(toUser, msgTitle, msgBody, now) {
            var inboxTitle = 'Người_dùng:' + toUser.replace(/ /g, '_') + '/Chat/Inbox';
            API.get({
                action: 'query', titles: inboxTitle,
                prop: 'revisions', rvprop: 'content', rvslots: 'main',
                format: 'json', formatversion: 2
            }).done(function (d) {
                var pages = d.query && d.query.pages;
                var pg    = pages && pages[0];
                var inbox = { conversations: [] };
                if (pg && !pg.missing) {
                    try { inbox = JSON.parse(pg.revisions[0].slots.main.content || '{}'); } catch(e){}
                }
                var convs = inbox.conversations || [];

                /* Tìm hoặc tạo conversation với EventNotifier */
                var NOTIF_CONV_ID = 'SYS-EVENTNOTIFIER';
                var existing = convs.filter(function (c) { return c.convId === NOTIF_CONV_ID; })[0];
                if (!existing) {
                    convs.unshift({
                        convId: NOTIF_CONV_ID, partner: NOTIFIER_NAME,
                        isGroup: false, title: NOTIFIER_NAME,
                        lastMsg: msgTitle.slice(0, 60), unread: 1, ts: now,
                        owner: NOTIFIER_NAME, isSystem: true
                    });
                } else {
                    existing.lastMsg  = msgTitle.slice(0, 60);
                    existing.unread   = (existing.unread || 0) + 1;
                    existing.ts       = now;
                    existing.isSystem = true; /* đảm bảo flag luôn đúng dù conv cũ */
                    /* Đưa lên đầu */
                    convs.splice(convs.indexOf(existing), 1);
                    convs.unshift(existing);
                }

                API.get({ action: 'query', meta: 'tokens', type: 'csrf', format: 'json' })
                    .done(function (td) {
                        var token = td.query && td.query.tokens && td.query.tokens.csrftoken;
                        if (!token || token === '+\\') return;
                        API.post({
                            action: 'edit', title: inboxTitle,
                            text: JSON.stringify({ conversations: convs }, null, 2),
                            summary: NOTIFIER_NAME + ': thông báo sự kiện',
                            token: token, format: 'json'
                        });
                        /* Ghi nội dung tin nhắn vào trang conversation */
                        writeChatConvMsg(toUser, NOTIF_CONV_ID, msgTitle, msgBody, now, token);
                    });
            });
        }

        /* Ghi tin nhắn vào trang conversation của EventNotifier */
        function writeChatConvMsg(toUser, convId, msgTitle, msgBody, now, token) {
            var convPage = 'Người_dùng:' + NOTIFIER_NAME.replace(/ /g, '_') + '/Chat/' + convId;
            API.get({
                action: 'query', titles: convPage,
                prop: 'revisions', rvprop: 'content', rvslots: 'main',
                format: 'json', formatversion: 2
            }).done(function (d) {
                var pages = d.query && d.query.pages;
                var pg    = pages && pages[0];
                var conv  = { id: convId, owner: NOTIFIER_NAME, partner: toUser, messages: [], created: now, isSystem: true };
                if (pg && !pg.missing) {
                    try { conv = JSON.parse(pg.revisions[0].slots.main.content || '{}'); } catch(e){}
                }
                if (!Array.isArray(conv.messages)) conv.messages = [];
                conv.messages.push({
                    id:      'm-' + Date.now().toString(36),
                    from:    NOTIFIER_NAME,
                    content: '<b>' + msgTitle + '</b><br>' + msgBody,
                    ts:      now,
                    isSystem: true
                });
                API.post({
                    action: 'edit', title: convPage,
                    text: JSON.stringify(conv, null, 2),
                    summary: NOTIFIER_NAME + ': thông báo sự kiện',
                    token: token, format: 'json'
                });
            });
        }

        /* ── Kiểm tra thông báo pending (đăng ký notify + sự kiện đã bắt đầu) ── */
        function checkPendingNotifications() {
            $.getJSON(scriptPath + '/api.php', {
                action: 'query', titles: 'MediaWiki:SuKien-data.json',
                prop: 'revisions', rvprop: 'content', rvslots: 'main', format: 'json', origin: '*'
            }).done(function (d) {
                try {
                    var pages = d.query.pages, pg = pages[Object.keys(pages)[0]];
                    if (pg.missing !== undefined) return;
                    var data = JSON.parse(pg.revisions[0].slots.main['*']);
                    (data.events || []).forEach(function (ev) {
                        var NKEY    = 'maple_ev_notify_' + ev.id;
                        /* SKEY: đã gửi thông báo "started" rồi — tránh gửi lại mỗi lần load trang */
                        var SKEY    = 'maple_ev_started_notif_' + ev.id;
                        var registered = false;
                        var alreadySent = false;
                        try { registered  = localStorage.getItem(NKEY) === '1'; } catch(e){}
                        try { alreadySent = localStorage.getItem(SKEY) === '1'; } catch(e){}
                        if (!registered || alreadySent) return;
                        var startTs = parseTs(ev.start);
                        /* Chỉ gửi khi sự kiện thực sự đã bắt đầu VÀ chưa gửi lần nào */
                        if (startTs && Date.now() >= startTs) {
                            sendEventNotification(ev, 'start');
                            /* Đánh dấu đã gửi — không gửi lại dù user mở lại trang */
                            try { localStorage.setItem(SKEY, '1'); } catch(e){}
                            try { localStorage.removeItem(NKEY); } catch(e){}
                        }
                    });
                } catch(e) {}
            });
        }

        /* ── Mini panel xác nhận đăng ký thông báo ── */
        function showNotifyPanel(ev) {
            var old = document.getElementById('sk-notify-panel');
            if (old) old.remove();
            var startTs = parseTs(ev.start);
            var panel   = document.createElement('div');
            panel.id    = 'sk-notify-panel';
            panel.className = 'sk-notify-panel';
            panel.innerHTML =
                '<div class="sk-np-title">🔔 ĐÃ ĐĂNG KÝ THÔNG BÁO</div>' +
                '<div class="sk-np-name">' + esc(ev.title || '') + '</div>' +
                (startTs ? '<div class="sk-np-cd" id="sk-np-cd"></div>' : '<div class="sk-np-cd">Sắp diễn ra</div>') +
                '<div class="sk-np-note">Khi sự kiện bắt đầu, <b>EventNotifier</b> sẽ gửi thông báo đến trang Thông_báo của bạn và MAPLE-Chat.</div>' +
                '<button class="sk-np-close" id="sk-np-close">Đóng</button>';

            document.getElementById('sk-root').appendChild(panel);

            if (startTs) {
                (function tickNp() {
                    var rem = startTs - Date.now();
                    var npCd = document.getElementById('sk-np-cd');
                    if (!npCd) return;
                    if (rem <= 0) { npCd.innerHTML = '<span style="color:var(--sk-accent,#4ade80)">● SỰ KIỆN ĐÃ BẮT ĐẦU!</span>'; return; }
                    npCd.innerHTML = '<div class="sk-cd-grid">' + fmtCountdown(rem) + '</div>';
                    setTimeout(tickNp, 1000);
                })();
            }
            document.getElementById('sk-np-close').addEventListener('click', function () { panel.remove(); });
        }

        /* ════════════════════════════════════════════════════════
           WIRE — Nộp bài
        ════════════════════════════════════════════════════════ */
        function wireSubmit(ev) {
            var subBtn   = document.getElementById('sk-sub-btn');
            var subInput = document.getElementById('sk-sub-input');
            var subMsg   = document.getElementById('sk-sub-msg');
            var subList  = document.getElementById('sk-sub-list');
            if (!subBtn || !subInput) return;
            var SKEY = 'maple_ev_sub_' + ev.id;

            function loadSubs() { try { return JSON.parse(localStorage.getItem(SKEY) || '[]'); } catch(e) { return []; } }
            function saveSubs(a) { try { localStorage.setItem(SKEY, JSON.stringify(a)); } catch(e){} }
            function renderSubs() {
                if (!subList) return;
                var subs = loadSubs();
                if (!subs.length) { subList.innerHTML = ''; return; }
                subList.innerHTML = '<div class="sk-d-eyebrow" style="margin-top:16px">// BÀI ĐÃ NỘP</div>' +
                    subs.map(function (s, i) {
                        return '<div class="sk-sub-item">' +
                            '<a href="/wiki/' + encodeURIComponent(s) + '" target="_blank">' + esc(s) + '</a>' +
                            '<button class="sk-sub-rm" data-i="' + i + '">✕</button></div>';
                    }).join('');
                [].forEach.call(subList.querySelectorAll('.sk-sub-rm'), function (btn) {
                    btn.addEventListener('click', function () {
                        var arr = loadSubs(); arr.splice(+btn.getAttribute('data-i'), 1);
                        saveSubs(arr); renderSubs();
                    });
                });
            }
            renderSubs();
            subBtn.addEventListener('click', function () {
                var val = subInput.value.trim();
                if (!val) { subMsg.textContent = 'Vui lòng nhập tên trang.'; subMsg.className = 'sk-sub-msg sk-sub-err'; return; }
                var arr = loadSubs();
                if (arr.indexOf(val) !== -1) { subMsg.textContent = 'Bài này đã được nộp.'; subMsg.className = 'sk-sub-msg sk-sub-err'; return; }
                arr.push(val); saveSubs(arr);
                subInput.value = '';
                subMsg.textContent = '✓ Đã nộp: ' + val; subMsg.className = 'sk-sub-msg sk-sub-ok';
                renderSubs();
            });
        }

        /* ════════════════════════════════════════════════════════
           ADMIN — Form tạo / chỉnh sửa sự kiện
        ════════════════════════════════════════════════════════ */
        function wireCreateForm(data, editEv) {
            var openBtn = document.getElementById('sk-open-create');
            if (!openBtn) return;
            openBtn.addEventListener('click', function () {
                var old = document.getElementById('sk-create-modal');
                if (old) { old.remove(); return; }
                buildCreateModal(data, editEv);
            });
        }

        function buildCreateModal(data, editEv) {
            var isEdit = !!editEv;
            var ev     = editEv || {};
            var modal  = document.createElement('div');
            modal.id   = 'sk-create-modal';
            modal.className = 'sk-create-modal';

            /* ── Chuẩn bị dữ liệu specialTabs ── */
            var spTabsJson = JSON.stringify(ev.specialTabs || [], null, 2);
            /* ── Chuẩn bị rewards ── */
            var rewardsJson = JSON.stringify(ev.rewards || [], null, 2);

            modal.innerHTML =
                '<div class="sk-cm-header">' +
                    '<span class="sk-cm-title">' + (isEdit ? '✏ CHỈNH SỬA SỰ KIỆN' : '+ TẠO SỰ KIỆN MỚI') + '</span>' +
                    '<button class="sk-cm-close" id="sk-cm-close">✕</button>' +
                '</div>' +
                '<div class="sk-cm-body">' +

                /* ── Nhóm 1: Cơ bản ── */
                '<div class="sk-cm-section">// CƠ BẢN</div>' +
                '<div class="sk-cm-row sk-cm-row--2">' +
                    '<div><label class="sk-cm-lbl">ID sự kiện <span class="sk-cm-req">*</span></label>' +
                    '<input id="sk-cm-id" class="sk-cm-input" type="text" value="' + esc(ev.id || '') + '" placeholder="vd: event-2026-summer"/></div>' +
                    '<div><label class="sk-cm-lbl">Tiêu đề <span class="sk-cm-req">*</span></label>' +
                    '<input id="sk-cm-title" class="sk-cm-input" type="text" value="' + esc(ev.title || '') + '" placeholder="Tên sự kiện"/></div>' +
                '</div>' +
                '<div class="sk-cm-row sk-cm-row--2">' +
                    '<div><label class="sk-cm-lbl">Thời gian bắt đầu</label>' +
                    '<input id="sk-cm-start" class="sk-cm-input" type="text" value="' + esc(ev.start || '') + '" placeholder="dd/mm/yyyy HH:mm"/></div>' +
                    '<div><label class="sk-cm-lbl">Thời gian kết thúc</label>' +
                    '<input id="sk-cm-end" class="sk-cm-input" type="text" value="' + esc(ev.end || '') + '" placeholder="dd/mm/yyyy HH:mm"/></div>' +
                '</div>' +
                '<div class="sk-cm-row">' +
                    '<label class="sk-cm-lbl">Mô tả ngắn (timeline)</label>' +
                    '<input id="sk-cm-desc" class="sk-cm-input" type="text" value="' + esc(ev.desc || '') + '" placeholder="Mô tả ngắn"/>' +
                '</div>' +
                '<div class="sk-cm-row">' +
                    '<label class="sk-cm-lbl">Nội dung chi tiết (HTML)</label>' +
                    '<textarea id="sk-cm-content" class="sk-cm-textarea" rows="4" placeholder="Nội dung đầy đủ...">' + esc(ev.content || '') + '</textarea>' +
                '</div>' +
                '<div class="sk-cm-row">' +
                    '<label class="sk-cm-lbl">Quy tắc tham gia (HTML)</label>' +
                    '<textarea id="sk-cm-rules" class="sk-cm-textarea" rows="3" placeholder="Quy tắc, điều kiện...">' + esc(ev.rules || '') + '</textarea>' +
                '</div>' +

                /* ── Nhóm 2: Giao diện ── */
                '<div class="sk-cm-section">// GIAO DIỆN</div>' +
                '<div class="sk-cm-row sk-cm-row--2">' +
                    '<div><label class="sk-cm-lbl">Màu chủ đạo (hex)</label>' +
                    '<div class="sk-cm-color-row">' +
                    '<input id="sk-cm-accent" class="sk-cm-input sk-cm-input--color" type="color" value="' + esc(ev.accentColor || '#ef4444') + '"/>' +
                    '<input id="sk-cm-accent-txt" class="sk-cm-input" type="text" value="' + esc(ev.accentColor || '#ef4444') + '" placeholder="#ef4444"/>' +
                    '</div></div>' +
                    '<div><label class="sk-cm-lbl">URL ảnh banner</label>' +
                    '<input id="sk-cm-banner" class="sk-cm-input" type="text" value="' + esc(ev.bannerImage || '') + '" placeholder="https://..."/></div>' +
                '</div>' +
                '<div class="sk-cm-row sk-cm-row--2">' +
                    '<div><label class="sk-cm-lbl">Theme class (CSS class vào body)</label>' +
                    '<input id="sk-cm-theme" class="sk-cm-input" type="text" value="' + esc(ev.themeClass || '') + '" placeholder="vd: sk-theme-summer"/></div>' +
                    '<div><label class="sk-cm-lbl">Theme suffix trang wiki</label>' +
                    '<input id="sk-cm-themedyn" class="sk-cm-input" type="text" value="' + esc(ev.themePageSuffix || '') + '" placeholder="vd: summer2026 → /Sự_kiện:summer2026/theme"/></div>' +
                '</div>' +

                /* ── Nhóm 3: Phần thưởng & Điều kiện ── */
                '<div class="sk-cm-section">// PHẦN THƯỞNG & ĐIỀU KIỆN</div>' +
                '<div class="sk-cm-row sk-cm-row--2">' +
                    '<div><label class="sk-cm-lbl">Huy hiệu độc quyền</label>' +
                    '<input id="sk-cm-badge" class="sk-cm-input" type="text" value="' + esc(ev.badge || '') + '" placeholder="Tên huy hiệu"/></div>' +
                    '<div><label class="sk-cm-lbl">Số người tối đa (0 = không giới hạn)</label>' +
                    '<input id="sk-cm-maxp" class="sk-cm-input" type="number" min="0" value="' + esc(String(ev.maxParticipants || 0)) + '"/></div>' +
                '</div>' +
                '<div class="sk-cm-row sk-cm-row--2">' +
                    '<div><label class="sk-cm-lbl">RP tối thiểu để tham gia (0 = không yêu cầu)</label>' +
                    '<input id="sk-cm-minrp" class="sk-cm-input" type="number" min="0" value="' + esc(String(ev.minRP || 0)) + '"/></div>' +
                    '<div><label class="sk-cm-lbl"></label><div style="padding-top:22px">' +
                    '<label class="sk-cm-check"><input type="checkbox" id="sk-cm-submit"' + (ev.allowSubmit ? ' checked' : '') + '/> Cho phép nộp bài</label></div></div>' +
                '</div>' +
                '<div class="sk-cm-row">' +
                    '<label class="sk-cm-lbl">Phần thưởng (JSON array)</label>' +
                    '<textarea id="sk-cm-rewards" class="sk-cm-textarea sk-cm-textarea--code" rows="3" placeholder=\'[{"type":"badge","value":"SummerBadge","label":"Huy hiệu Mùa Hè"}]\'>' + esc(rewardsJson) + '</textarea>' +
                    '<span class="sk-cm-hint">type: "badge" | "rp" | "item". value: ID. label: tên hiển thị.</span>' +
                '</div>' +

                /* ── Nhóm 4: Tab đặc biệt ── */
                '<div class="sk-cm-section">// TAB ĐẶC BIỆT</div>' +
                '<div class="sk-cm-row">' +
                    '<label class="sk-cm-lbl">Danh sách tab tuỳ chỉnh (JSON array)</label>' +
                    '<textarea id="sk-cm-sptabs" class="sk-cm-textarea sk-cm-textarea--code" rows="4" placeholder=\'[{"id":"rules","label":"Luật Chơi","content":"<p>...</p>"}]\'>' + esc(spTabsJson) + '</textarea>' +
                    '<span class="sk-cm-hint">Mỗi tab cần: id (duy nhất), label (tên tab), content (HTML).</span>' +
                '</div>' +

                /* ── Actions ── */
                '<div class="sk-cm-actions">' +
                    '<button id="sk-cm-preview-btn" class="sk-cm-btn sk-cm-btn--sec">👁 Xem JSON</button>' +
                    '<button id="sk-cm-save-btn" class="sk-cm-btn sk-cm-btn--pri">' + (isEdit ? '💾 Lưu thay đổi' : '✓ Tạo sự kiện') + '</button>' +
                '</div>' +
                '<div id="sk-cm-json-out" class="sk-cm-json" style="display:none"></div>' +
                '<div id="sk-cm-msg" class="sk-cm-msg"></div>' +
                '</div>';

            var skRoot = document.getElementById('sk-root');
            if (skRoot) skRoot.appendChild(modal); else document.body.appendChild(modal);

            /* Sync color picker ↔ text input */
            var colorPicker = document.getElementById('sk-cm-accent');
            var colorTxt    = document.getElementById('sk-cm-accent-txt');
            if (colorPicker && colorTxt) {
                colorPicker.addEventListener('input', function () { colorTxt.value = colorPicker.value; });
                colorTxt.addEventListener('input', function () {
                    if (/^#[0-9a-fA-F]{6}$/.test(colorTxt.value)) colorPicker.value = colorTxt.value;
                });
            }

            document.getElementById('sk-cm-close').addEventListener('click', function () { modal.remove(); });
            document.getElementById('sk-cm-preview-btn').addEventListener('click', function () {
                var out = document.getElementById('sk-cm-json-out');
                out.style.display = out.style.display === 'none' ? '' : 'none';
                if (out.style.display !== 'none') {
                    var result = collectForm(data, isEdit, ev);
                    out.textContent = result ? JSON.stringify(result, null, 2) : '// LỖI DỮ LIỆU — xem console';
                }
            });
            document.getElementById('sk-cm-save-btn').addEventListener('click', function () {
                saveEvent(data, isEdit, ev, modal);
            });
        }

        function collectForm(data, isEdit, editEv) {
            function v(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
            function chk(id) { var el = document.getElementById(id); return el ? el.checked : false; }
            function parseJsonField(id) {
                var raw = v(id); if (!raw) return undefined;
                try { return JSON.parse(raw); } catch(e) { return null; /* null → lỗi */ }
            }

            var rewards  = parseJsonField('sk-cm-rewards');
            var spTabs   = parseJsonField('sk-cm-sptabs');
            if (rewards === null || spTabs === null) return null; /* lỗi JSON */

            var newEv = {
                id:             v('sk-cm-id'),
                title:          v('sk-cm-title'),
                start:          v('sk-cm-start') || undefined,
                end:            v('sk-cm-end')   || undefined,
                desc:           v('sk-cm-desc')  || undefined,
                content:        v('sk-cm-content') || undefined,
                rules:          v('sk-cm-rules')   || undefined,
                accentColor:    v('sk-cm-accent-txt') || undefined,
                bannerImage:    v('sk-cm-banner')  || undefined,
                themeClass:     v('sk-cm-theme')   || undefined,
                themePageSuffix:v('sk-cm-themedyn')|| undefined,
                badge:          v('sk-cm-badge')   || undefined,
                maxParticipants:parseInt(v('sk-cm-maxp'),10) || undefined,
                minRP:          parseInt(v('sk-cm-minrp'),10) || undefined,
                allowSubmit:    chk('sk-cm-submit') || undefined,
                rewards:        (rewards && rewards.length) ? rewards : undefined,
                specialTabs:    (spTabs  && spTabs.length)  ? spTabs  : undefined,
                participants:   (isEdit && editEv.participants) || 0
            };
            /* Xoá undefined */
            Object.keys(newEv).forEach(function (k) { if (newEv[k] === undefined) delete newEv[k]; });
            /* Tính status */
            newEv.status = liveStatus(newEv).key;

            var events = (data && data.events) ? data.events.slice() : [];
            if (isEdit) {
                var idx = -1;
                events.forEach(function (e, i) { if (String(e.id) === String(editEv.id)) idx = i; });
                if (idx !== -1) events[idx] = newEv; else events.push(newEv);
            } else {
                events.push(newEv);
            }
            return { events: events };
        }

        function saveEvent(data, isEdit, editEv, modal) {
            var msgEl = document.getElementById('sk-cm-msg');
            var idVal = (document.getElementById('sk-cm-id') || {}).value || '';
            var ttVal = (document.getElementById('sk-cm-title') || {}).value || '';
            if (!idVal.trim() || !ttVal.trim()) {
                msgEl.textContent = '⚠ Vui lòng điền ID và tiêu đề.';
                msgEl.className = 'sk-cm-msg sk-cm-err'; return;
            }
            var newData = collectForm(data, isEdit, editEv);
            if (!newData) {
                msgEl.textContent = '⚠ Dữ liệu JSON không hợp lệ (Phần thưởng hoặc Tab đặc biệt bị lỗi).';
                msgEl.className = 'sk-cm-msg sk-cm-err'; return;
            }
            msgEl.textContent = '⏳ Đang lưu...'; msgEl.className = 'sk-cm-msg';
            API.get({ action: 'query', meta: 'tokens', type: 'csrf', format: 'json' })
                .done(function (d) {
                    var token = d.query && d.query.tokens && d.query.tokens.csrftoken;
                    if (!token || token === '+\\') { msgEl.textContent = '✕ Không lấy được token.'; msgEl.className = 'sk-cm-msg sk-cm-err'; return; }
                    API.post({
                        action: 'edit', title: 'MediaWiki:SuKien-data.json',
                        text: JSON.stringify(newData, null, 2),
                        summary: (isEdit ? 'Cập nhật: ' : 'Tạo mới: ') + ttVal.trim(),
                        token: token, format: 'json'
                    }).done(function (r) {
                        if (r.edit && r.edit.result === 'Success') {
                            msgEl.textContent = '✓ Đã lưu! Đang tải lại...'; msgEl.className = 'sk-cm-msg sk-cm-ok';
                            setTimeout(function () { location.reload(); }, 1500);
                        } else {
                            msgEl.textContent = '✕ ' + JSON.stringify(r); msgEl.className = 'sk-cm-msg sk-cm-err';
                        }
                    }).fail(function (x, s) {
                        msgEl.textContent = '✕ ' + s; msgEl.className = 'sk-cm-msg sk-cm-err';
                    });
                }).fail(function () {
                    msgEl.textContent = '✕ Không lấy được token CSRF.'; msgEl.className = 'sk-cm-msg sk-cm-err';
                });
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
