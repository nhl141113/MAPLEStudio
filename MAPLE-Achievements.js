/* ============================================
   M.A.P.L.E — MediaWiki:MAPLE-Achievements.js
   LỚP TỰ GHI NHẬN THÀNH TỰU (đồng bộ theo user).
   - Lưu vào trang riêng của user: Thành viên:<user>/Maple-Achievements.json
     → đồng bộ qua mọi thiết bị (khác localStorage thuần).
   - window.MAPLE.award(id) / window.MAPLE.ach.award(id): mở khoá 1 thành tựu.
   - Tự phát hiện vài mốc an toàn phía client (welcome, đọc bài, chuỗi login, cú đêm…).
   - Easter egg (HomePage…) gọi window.MAPLE.award('konami_code') / 'open_door'.
   Cần window.MAPLE.catalog (AchievementCatalog.js) — Common.js nạp trước.
   LƯU Ý (NT-5): đây là tự-ghi-nhận để HIỂN THỊ/gamification, không phải gate quyền.
   ============================================ */
(function () {
    function init() {
        if (!window.MAPLE || !window.MAPLE.catalog) return;
        if (window.MAPLE.ach) return; /* đã khởi tạo */

        var CAT = window.MAPLE.catalog;
        var user = mw.config.get('wgUserName');
        var loggedIn = mw.config.get('wgUserId') !== 0;
        if (!loggedIn || !user) return;

        var PAGE = CAT.userAchPage(user);
        var CACHE = 'maple_ach_' + user.replace(/\s/g, '_');
        var READKEY = 'maple_readset_' + user.replace(/\s/g, '_');
        var api = new mw.Api();
        var data = { earned: {}, stats: {} };
        var dirty = false, saveTimer = null;

        function pad(n) { return (n < 10 ? '0' : '') + n; }
        function dstr(ms) { var d = ms ? new Date(ms) : new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
        function today() { return dstr(); }
        function yesterday() { return dstr(Date.now() - 86400000); }

        /* ── Toast ── */
        function toast(msg) {
            var t = document.createElement('div');
            t.className = 'maple-ach-toast'; t.textContent = msg;
            document.body.appendChild(t);
            requestAnimationFrame(function () { t.classList.add('in'); });
            setTimeout(function () {
                t.classList.remove('in');
                setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 400);
            }, 4200);
        }

        /* ── Cache (localStorage) ── */
        function loadCache() {
            try { var r = localStorage.getItem(CACHE); if (r) data = JSON.parse(r); } catch (e) {}
            if (!data.earned) data.earned = {};
            if (!data.stats) data.stats = {};
        }
        function saveCache() { try { localStorage.setItem(CACHE, JSON.stringify(data)); } catch (e) {} }

        function scheduleSave() {
            dirty = true; saveCache();
            if (saveTimer) clearTimeout(saveTimer);
            saveTimer = setTimeout(flush, 1800);
        }
        function flush() {
            if (!dirty) return;
            dirty = false;
            api.postWithToken('csrf', {
                action: 'edit', title: PAGE,
                text: JSON.stringify({ earned: data.earned, stats: data.stats }, null, '\t'),
                summary: 'Cập nhật thành tựu (tự ghi nhận)', format: 'json'
            }).fail(function () { dirty = true; }); /* giữ cờ để thử lại lần sau */
        }

        /* ── Award ── */
        function award(id) {
            var it = CAT.byId(id);
            if (!it || data.earned[id]) return false;
            data.earned[id] = today();
            var rp = CAT.isAchievement(id) ? CAT.rarityRP(it.rarity) : 0;
            scheduleSave();
            toast('🏆 Mở khoá: ' + it.label + (rp ? ' (+' + rp + ' RP)' : ''));
            return true;
        }
        function has(id) { return !!data.earned[id]; }

        /* ── ĐIỂM UY TÍN từ HÀNH ĐỘNG (cap/ngày + lợi-ích-giảm-dần) — mục 2 he-thong-diem ── */
        function todayCaps() {
            if (data.stats.capDay !== today()) { data.stats.capDay = today(); data.stats.caps = {}; }
            if (!data.stats.caps) data.stats.caps = {};
            return data.stats.caps;
        }
        function rpAdd(amount, capKey, dailyCap, toastMsg) {
            if (amount <= 0) return 0;
            if (dailyCap) {
                var caps = todayCaps(), used = caps[capKey] || 0, remain = dailyCap - used;
                if (remain <= 0) return 0;
                if (used >= dailyCap * 0.5) amount = amount * 0.5; /* lợi-ích-giảm-dần sau 50% cap */
                amount = Math.min(amount, remain);
                caps[capKey] = used + amount;
            }
            data.stats.rp = Math.round(((data.stats.rp || 0) + amount) * 100) / 100;
            scheduleSave();
            if (toastMsg) toast('✨ +' + amount + ' RP — ' + toastMsg);
            return amount;
        }
        function rpOnce(flag, amount, label) {
            if (!data.stats.flags) data.stats.flags = {};
            if (data.stats.flags[flag]) return 0;
            data.stats.flags[flag] = today();
            data.stats.rp = (data.stats.rp || 0) + amount;
            scheduleSave();
            toast('✨ +' + amount + ' RP — ' + (label || ''));
            return amount;
        }
        function actionRP() { return data.stats.rp || 0; }
        function achievementRP() {
            var list = Object.keys(data.earned).map(function (id) { return CAT.entryFromId(id, data.earned[id]); }).filter(Boolean);
            return CAT.computeRP(list);
        }
        function totalRP() { return achievementRP() + actionRP(); }

        /* ── Hợp nhất dữ liệu server + cache (union, không mất mốc) ── */
        function mergeServer(parsed) {
            var se = (parsed && parsed.earned) || {};
            Object.keys(se).forEach(function (id) {
                if (!data.earned[id]) data.earned[id] = se[id];
            });
            var ss = (parsed && parsed.stats) || {};
            var st = data.stats;
            st.reads = Math.max(st.reads || 0, ss.reads || 0);
            st.streak = Math.max(st.streak || 0, ss.streak || 0);
            if (!st.lastLogin || (ss.lastLogin && ss.lastLogin > st.lastLogin)) st.lastLogin = ss.lastLogin || st.lastLogin;
            saveCache();
        }

        function fetchData(cb) {
            loadCache();
            api.get({
                action: 'query', titles: PAGE, prop: 'revisions',
                rvprop: 'content', rvslots: 'main', format: 'json', formatversion: 2
            }).done(function (r) {
                try {
                    var pg = r.query && r.query.pages && r.query.pages[0];
                    if (pg && !pg.missing && pg.revisions && pg.revisions[0]) {
                        var rev = pg.revisions[0];
                        var t = (rev.slots && rev.slots.main && rev.slots.main.content) || rev.content || '{}';
                        mergeServer(JSON.parse(t));
                    }
                } catch (e) {}
                cb && cb();
            }).fail(function () { cb && cb(); });
        }

        /* ── Tự phát hiện vài mốc an toàn ── */
        function detect() {
            var ns = mw.config.get('wgNamespaceNumber');
            var isMain = mw.config.get('wgIsMainPage');
            var action = mw.config.get('wgAction') || 'view';
            var hour = new Date().getHours();

            award('welcome');

            /* Chuỗi đăng nhập + điểm điểm danh */
            var t = today();
            if (data.stats.lastLogin !== t) {
                data.stats.streak = (data.stats.lastLogin === yesterday()) ? ((data.stats.streak || 0) + 1) : 1;
                data.stats.lastLogin = t;
                scheduleSave();
                rpAdd(1, 'checkin', 1); /* điểm danh mỗi ngày: +1 (1 lần/ngày) */
            }
            var sk = data.stats.streak || 0;
            if (sk >= 7) award('streak_7');
            if (sk >= 30) award('streak_30');
            if (sk >= 100) award('streak_100');
            /* Thưởng chuỗi: +10 mỗi chu kỳ 7 ngày */
            if (sk > 0 && sk % 7 === 0 && data.stats.streakBonusAt !== sk) {
                data.stats.streakBonusAt = sk;
                rpAdd(10, 'streakbonus', 0, 'Chuỗi ' + sk + ' ngày 🔥');
            }

            if (hour >= 0 && hour < 4) award('night_owl');
            if (hour >= 5 && hour < 7) award('early_bird');

            /* Xác thực email: +15 (1 lần) — đọc trạng thái qua userinfo */
            api.get({ action: 'query', meta: 'userinfo', uiprop: 'email', format: 'json', formatversion: 2 })
                .done(function (u) {
                    var ui = u && u.query && u.query.userinfo;
                    if (ui && ui.emailauthenticated) {
                        rpOnce('email', 15, 'Xác thực email ✓');
                        award('verified_agent');
                    }
                });

            /* Đọc bài (namespace chính, không phải trang chủ) */
            if (ns === 0 && !isMain && action === 'view') {
                var key = mw.config.get('wgPageName');
                var set = {};
                try { set = JSON.parse(localStorage.getItem(READKEY) || '{}'); } catch (e) {}
                if (!set[key]) {
                    set[key] = 1;
                    try { localStorage.setItem(READKEY, JSON.stringify(set)); } catch (e) {}
                    data.stats.reads = (data.stats.reads || 0) + 1;
                    scheduleSave();
                }
                award('first_read');
                var rc = data.stats.reads || 0;
                if (rc >= 50) award('bookworm_50');
                if (rc >= 200) award('bookworm_200');
                if (rc >= 500) award('knowledge_hoarder');
                var cats = mw.config.get('wgCategories') || [];
                if (cats.indexOf('Thực thể') !== -1 || document.querySelector('.maple-record-entity')) award('first_contact');

                /* Điểm ĐỌC: dwell ≥ 30s, bài-duy-nhất/ngày, cap 20/ngày, lợi-ích-giảm-dần */
                var rday = 'maple_rpread_' + user.replace(/\s/g, '_') + '_' + today();
                var rset = {};
                try { rset = JSON.parse(localStorage.getItem(rday) || '{}'); } catch (e) {}
                if (!rset[key]) {
                    setTimeout(function () {
                        if (document.hidden) return; /* chuyển tab/không tương tác → bỏ */
                        try { rset = JSON.parse(localStorage.getItem(rday) || '{}'); } catch (e) {}
                        if (rset[key]) return;
                        rset[key] = 1;
                        try { localStorage.setItem(rday, JSON.stringify(rset)); } catch (e) {}
                        rpAdd(2, 'read', 20);
                    }, 30000);
                }
            }

            /* Đếm số bài đã duyệt để phát thưởng Writer */
            var pendingUrl = mw.config.get('wgServer') + mw.config.get('wgScript') + '?title=MediaWiki:Maple-Pending.json&action=raw&ctype=application/json';
            jQuery.ajax({ url: pendingUrl, dataType: 'text', cache: false }).done(function (raw) {
                var list = [];
                try {
                    raw = raw.replace(/,\s*([}\]])/g, '$1');
                    var parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) list = parsed;
                    else if (parsed && Array.isArray(parsed.pending)) list = parsed.pending;
                } catch (e) {}
                if (!Array.isArray(list)) return;
                var unorm = user.replace(/_/g, ' ').toLowerCase();
                var approved = list.filter(function (it) {
                    var st = it.status || 'pending';
                    var au = (it.author || '').replace(/_/g, ' ').toLowerCase();
                    return st === 'approved' && au === unorm;
                });
                
                var count = approved.length;
                if (count > 0) {
                    award('first_article');
                    if (count >= 10) award('writer_10');
                    if (count >= 25) award('writer_25');
                    if (count >= 50) award('writer_50');
                    if (count >= 100) award('writer_100');
                    
                    if (!data.stats.rewardedArticles) data.stats.rewardedArticles = [];
                    var dirtyArticles = false;
                    approved.forEach(function (it) {
                        if (it.id && data.stats.rewardedArticles.indexOf(it.id) === -1) {
                            var added = rpAdd(10, 'approved_article', 30, 'Bài viết được duyệt 🎉');
                            if (added > 0) {
                                data.stats.rewardedArticles.push(it.id);
                                dirtyArticles = true;
                            }
                        }
                    });
                    if (dirtyArticles) scheduleSave();
                }
            });
        }

        /* ── Public API ── */
        window.MAPLE.ach = {
            award: award, has: has, ready: false,
            data: function () { return data; },
            earnedMap: function () { return data.earned; },
            rpAdd: rpAdd, rpOnce: rpOnce,
            actionRP: actionRP, achievementRP: achievementRP, totalRP: totalRP
        };
        window.MAPLE.award = function (id) { return award(id); };

        fetchData(function () {
            window.MAPLE.ach.ready = true;
            detect();
            window.addEventListener('beforeunload', flush);
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
