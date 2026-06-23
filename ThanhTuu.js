/* ============================================
   M.A.P.L.E — MediaWiki:ThanhTuu.js
   Trang Thành Tựu & Vinh Danh — 3 tab:
     • VINH DANH  — bảng xếp hạng theo RP + Tier (đọc UserAchievements.json)
     • THÀNH TỰU  — catalog ~120 thành tựu / 16 nhóm (window.MAPLE.catalog)
     • HUY HIỆU   — catalog ~155 huy hiệu / 13 loại
   Yêu cầu: nạp AchievementCatalog.js TRƯỚC (Common.js loadSequence).
   ============================================ */
(function () {
    function init() {
        var target = document.getElementById('tt-root-placeholder')
                  || document.getElementById('mw-content-text');
        if (!target) return;

        var CAT = window.MAPLE && window.MAPLE.catalog;
        if (!CAT) {
            target.innerHTML = '<p style="color:#ef4444;padding:2rem;font-family:monospace">' +
                '// LỖI: chưa nạp được AchievementCatalog.js</p>';
            return;
        }

        function esc(s) {
            return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
            });
        }
        function logo(sz) { return (window.MAPLE && window.MAPLE.logoSVG) ? window.MAPLE.logoSVG(sz) : ''; }
        function rarityMeta(r) { return CAT.RARITY[r] || CAT.RARITY.common; }

        var currentUser = (mw.config.get('wgUserName') || '').replace(/_/g, ' ');
        var selfEarnedMap = {}; /* thành tựu tự ghi nhận của user hiện tại (đồng bộ) */

        target.innerHTML =
            '<div id="tt-root"><div class="tt-loading">' +
            '<div class="tt-spin"></div>// ĐANG TẢI BẢNG VINH DANH...</div></div>';

        $.getJSON(mw.config.get('wgScriptPath') + '/api.php', {
            action: 'query', titles: 'MediaWiki:UserAchievements.json',
            prop: 'revisions', rvprop: 'content', rvslots: 'main', format: 'json', origin: '*'
        }).done(function (d) {
            var data = {};
            try {
                var pages = d.query.pages;
                var raw = pages[Object.keys(pages)[0]].revisions[0].slots.main['*'];
                data = JSON.parse(raw);
            } catch (e) {}
            /* Nạp thêm thành tựu TỰ GHI NHẬN của user hiện tại để tính tiến độ "đã mở X/Y" */
            if (currentUser && CAT.userAchPage) {
                $.getJSON(mw.config.get('wgScriptPath') + '/api.php', {
                    action: 'query', titles: CAT.userAchPage(currentUser),
                    prop: 'revisions', rvprop: 'content', rvslots: 'main', format: 'json', origin: '*'
                }).done(function (d2) {
                    try {
                        var pg = d2.query.pages; var p = pg[Object.keys(pg)[0]];
                        if (p && p.revisions) selfEarnedMap = (JSON.parse(p.revisions[0].slots.main['*']).earned) || {};
                    } catch (e) {}
                    render(data);
                }).fail(function () { render(data); });
            } else { render(data); }
        }).fail(function () { render({}); });

        /* ── tập id huy hiệu/thành tựu user hiện tại đã sở hữu (trung tâm + tự ghi nhận) ── */
        function mineSet(data) {
            var set = {};
            var list = (currentUser && data[currentUser]) || [];
            list.forEach(function (x) { if (x && x.id) set[x.id] = true; });
            Object.keys(selfEarnedMap).forEach(function (id) { set[id] = true; });
            return set;
        }

        /* ════════ TAB 1: VINH DANH ════════ */
        function renderLeaderboard(data) {
            var users = Object.keys(data).map(function (name) {
                var list = data[name] || [];
                return { name: name, list: list, rp: CAT.computeRP(list) };
            }).filter(function (u) { return u.list.length; });

            users.sort(function (a, b) { return b.rp - a.rp || b.list.length - a.list.length; });

            var cards = users.map(function (u, i) {
                var tier = CAT.tierOf(u.rp);
                var badges = u.list.slice().sort(function (a, b) {
                    return rarityMeta(b.rarity).rank - rarityMeta(a.rarity).rank;
                }).map(function (b) {
                    var r = rarityMeta(b.rarity);
                    return '<div class="tt-badge ' + r.cls + '" title="' + esc(b.desc) + '">' +
                        '<span class="tt-badge-ico">' + esc(b.icon || '◈') + '</span>' +
                        '<span class="tt-badge-body">' +
                        '<span class="tt-badge-label">' + esc(b.label) + '</span>' +
                        '<span class="tt-badge-meta">' + esc((b.category || '') + (b.date ? ' · ' + b.date : '')) + '</span>' +
                        '</span>' +
                        '<span class="tt-badge-rarity">' + r.label + '</span>' +
                        '</div>';
                }).join('');

                return '<div class="tt-user" style="animation-delay:' + (i * 0.04) + 's">' +
                    '<div class="tt-user-hd">' +
                        '<span class="tt-rank">#' + (i + 1) + '</span>' +
                        '<a class="tt-user-name" href="/wiki/Th%C3%A0nh_vi%C3%AAn:' + encodeURIComponent(u.name) + '">' + esc(u.name) + '</a>' +
                        '<span class="tt-tier-chip tt-tier-' + tier.n + '">TIER ' + tier.n + ' · ' + esc(tier.label) + '</span>' +
                        '<span class="tt-rp-chip">' + u.rp + ' RP</span>' +
                        '<span class="tt-user-count">' + u.list.length + ' huy hiệu</span>' +
                    '</div>' +
                    '<div class="tt-badges">' + badges + '</div>' +
                    '</div>';
            }).join('');

            return '<div class="tt-roster">' +
                (cards || '<div class="tt-empty">// CHƯA CÓ DỮ LIỆU VINH DANH</div>') + '</div>' +
                '<div class="tt-footer">' +
                    '<a href="/wiki/Special:TopUsers">↗ Bảng xếp hạng đầy đủ (TopUsers)</a>' +
                    '<a href="/wiki/Trang_Ch%C3%ADnh">← Trang Chủ</a>' +
                '</div>';
        }

        /* ════════ thẻ catalog dùng chung ════════ */
        function catCard(item, earned, isHiddenType) {
            var r = rarityMeta(item.rarity);
            var hide = (item.hidden || isHiddenType) && !earned;
            var cls = 'tt-cat-card ' + r.cls + (earned ? ' tt-earned' : ' tt-unearned') + (hide ? ' tt-locked' : '');
            var ico = hide ? '?' : (item.icon || '◈');
            var lab = hide ? '???' : item.label;
            var how = hide ? 'Bí mật — tự khám phá 👀' : item.desc;
            var flags = '';
            if (item.limited) flags += '<span class="tt-flag tt-flag-limited">LIMITED</span>';
            if (earned) flags += '<span class="tt-flag tt-flag-have">✓ ĐÃ CÓ</span>';
            return '<div class="' + cls + '" title="' + esc(hide ? 'Huy hiệu ẩn' : item.label) + '">' +
                '<span class="tt-cat-ico">' + esc(ico) + '</span>' +
                '<span class="tt-cat-body">' +
                    '<span class="tt-cat-label">' + esc(lab) + '</span>' +
                    '<span class="tt-cat-how">' + esc(how) + '</span>' +
                    (flags ? '<span class="tt-cat-flags">' + flags + '</span>' : '') +
                '</span>' +
                '<span class="tt-badge-rarity">' + r.label + '</span>' +
                '</div>';
        }

        /* ════════ TAB 2: THÀNH TỰU ════════ */
        function renderAchGrid(mine, rarityFilter) {
            return CAT.achGroups.map(function (g) {
                var items = g.items.filter(function (a) {
                    return !rarityFilter || a.rarity === rarityFilter;
                });
                if (!items.length) return '';
                var cards = items.map(function (a) { return catCard(a, !!mine[a.id], false); }).join('');
                return '<div class="tt-group">' +
                    '<h3 class="tt-group-title">' + esc(g.group) +
                        ' <span class="tt-group-n">' + items.length + '</span></h3>' +
                    '<div class="tt-cat-grid">' + cards + '</div>' +
                '</div>';
            }).join('');
        }

        /* ════════ TAB 3: HUY HIỆU ════════ */
        function renderBadgeGrid(mine, typeFilter) {
            return CAT.badgeTypes.map(function (t) {
                if (typeFilter && t.type !== typeFilter) return '';
                var isHiddenType = (t.type === 'secret' || t.type === 'combo');
                var cards = t.items.map(function (b) {
                    return catCard(b, !!mine[b.id], isHiddenType);
                }).join('');
                return '<div class="tt-group">' +
                    '<h3 class="tt-group-title">' + esc(t.label) +
                        ' <span class="tt-group-sub">' + esc(t.note || '') + '</span>' +
                        ' <span class="tt-group-n">' + t.items.length + '</span></h3>' +
                    '<div class="tt-cat-grid">' + cards + '</div>' +
                '</div>';
            }).join('');
        }

        /* ── chip lọc ── */
        function rarityChips(active) {
            var order = ['common','rare','epic','legendary','mythic','ancient','artifact','immortal','exclusive','ultimate','relic','divine'];
            var html = '<button class="tt-chip' + (!active ? ' tt-chip-on' : '') + '" data-rarity="">TẤT CẢ</button>';
            order.forEach(function (r) {
                html += '<button class="tt-chip ' + CAT.RARITY[r].cls + (active === r ? ' tt-chip-on' : '') +
                    '" data-rarity="' + r + '">' + esc(CAT.RARITY[r].label) + '</button>';
            });
            return html;
        }
        function typeChips(active) {
            var html = '<button class="tt-chip' + (!active ? ' tt-chip-on' : '') + '" data-type="">TẤT CẢ</button>';
            CAT.badgeTypes.forEach(function (t) {
                html += '<button class="tt-chip' + (active === t.type ? ' tt-chip-on' : '') +
                    '" data-type="' + t.type + '">' + esc(t.label.replace(/^HUY HIỆU /, '')) + '</button>';
            });
            return html;
        }

        /* ════════ RENDER TỔNG ════════ */
        function render(data) {
            var mine = mineSet(data);
            var users = Object.keys(data).filter(function (n) { return (data[n] || []).length; });
            var totalRP = users.reduce(function (a, n) { return a + CAT.computeRP(data[n]); }, 0);
            var myAchHave = CAT.achievements.filter(function (a) { return mine[a.id]; }).length;
            var myBadgeHave = CAT.badges.filter(function (b) { return mine[b.id]; }).length;

            target.innerHTML =
                '<div id="tt-root">' +
                '<div class="tt-hero">' +
                    '<div class="tt-hero-logo">' + logo(72) + '</div>' +
                    '<div class="tt-eyebrow">// HỆ THỐNG THÀNH TỰU · HUY HIỆU · UY TÍN</div>' +
                    '<h1 class="tt-title">THÀNH TỰU <span>&amp; VINH DANH</span></h1>' +
                    '<p class="tt-sub">Ghi nhận đóng góp của các thành viên cho cộng đồng M.A.P.L.E.</p>' +
                    '<div class="tt-stats">' +
                        '<div class="tt-stat"><b>' + users.length + '</b><span>Thành viên</span></div>' +
                        '<div class="tt-stat"><b>' + totalRP.toLocaleString('vi-VN') + '</b><span>Tổng RP</span></div>' +
                        '<div class="tt-stat"><b>' + CAT.achievements.length + '</b><span>Thành tựu</span></div>' +
                        '<div class="tt-stat"><b>' + CAT.badges.length + '</b><span>Huy hiệu</span></div>' +
                    '</div>' +
                '</div>' +
                '<div class="tt-tabs">' +
                    '<button class="tt-tab-btn tt-tab-on" data-tab="vinh">🏆 VINH DANH</button>' +
                    '<button class="tt-tab-btn" data-tab="ach">✦ THÀNH TỰU</button>' +
                    '<button class="tt-tab-btn" data-tab="badge">🎖️ HUY HIỆU</button>' +
                '</div>' +
                '<div class="tt-panel tt-panel-on" data-panel="vinh">' + renderLeaderboard(data) + '</div>' +
                '<div class="tt-panel" data-panel="ach">' +
                    '<div class="tt-progress">Đã mở <b>' + myAchHave + '</b> / ' + CAT.achievements.length + ' thành tựu' +
                        (currentUser ? '' : ' <i>(đăng nhập để xem tiến độ)</i>') + '</div>' +
                    '<div class="tt-filters" data-filter="rarity">' + rarityChips('') + '</div>' +
                    '<div class="tt-catalog" id="tt-ach-grid">' + renderAchGrid(mine, '') + '</div>' +
                '</div>' +
                '<div class="tt-panel" data-panel="badge">' +
                    '<div class="tt-progress">Đã sở hữu <b>' + myBadgeHave + '</b> / ' + CAT.badges.length + ' huy hiệu' +
                        (currentUser ? '' : ' <i>(đăng nhập để xem tiến độ)</i>') + '</div>' +
                    '<div class="tt-filters" data-filter="type">' + typeChips('') + '</div>' +
                    '<div class="tt-catalog" id="tt-badge-grid">' + renderBadgeGrid(mine, '') + '</div>' +
                '</div>' +
                '</div>';

            wire(data, mine);
        }

        function wire(data, mine) {
            var root = document.getElementById('tt-root');
            if (!root) return;

            /* Tabs */
            root.querySelectorAll('.tt-tab-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var tab = btn.getAttribute('data-tab');
                    root.querySelectorAll('.tt-tab-btn').forEach(function (b) { b.classList.toggle('tt-tab-on', b === btn); });
                    root.querySelectorAll('.tt-panel').forEach(function (p) {
                        p.classList.toggle('tt-panel-on', p.getAttribute('data-panel') === tab);
                    });
                });
            });

            /* Lọc độ hiếm (thành tựu) */
            var rf = root.querySelector('.tt-filters[data-filter="rarity"]');
            if (rf) rf.addEventListener('click', function (e) {
                var btn = e.target.closest('.tt-chip'); if (!btn) return;
                var r = btn.getAttribute('data-rarity') || '';
                rf.querySelectorAll('.tt-chip').forEach(function (c) { c.classList.toggle('tt-chip-on', c === btn); });
                document.getElementById('tt-ach-grid').innerHTML = renderAchGrid(mine, r);
            });

            /* Lọc loại (huy hiệu) */
            var tf = root.querySelector('.tt-filters[data-filter="type"]');
            if (tf) tf.addEventListener('click', function (e) {
                var btn = e.target.closest('.tt-chip'); if (!btn) return;
                var t = btn.getAttribute('data-type') || '';
                tf.querySelectorAll('.tt-chip').forEach(function (c) { c.classList.toggle('tt-chip-on', c === btn); });
                document.getElementById('tt-badge-grid').innerHTML = renderBadgeGrid(mine, t);
            });
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
