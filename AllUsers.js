/**
 * M.A.P.L.E — MediaWiki:AllUsers.js
 * Trang Dự án:All User — danh sách thành viên với rank, search, filter
 */
(function () {
    'use strict';

    var cfg = mw.config.get(['wgPageName', 'wgNamespaceNumber', 'wgScript']);

    /* Chỉ chạy trên trang Dự án:All User (namespace 4) */
    var normalizedPage = (cfg.wgPageName || '').replace(/_/g, ' ');
    if (normalizedPage !== 'Dự án:All User' && normalizedPage !== 'Du an:All User' &&
        cfg.wgPageName !== 'D%E1%BB%B1_%C3%A1n:All_User') {
        /* fallback: detect bởi namespace và title substring */
        if (cfg.wgNamespaceNumber !== 4 || normalizedPage.indexOf('All User') === -1) return;
    }

    /* ── Rank detection (giống UserPage) ── */
    function detectRank(grps) {
        if (grps.indexOf('founder')         !== -1) return 'founder';
        if (grps.indexOf('bureaucrat')      !== -1) return 'bureaucrat';
        if (grps.indexOf('checkuser')       !== -1 ||
            grps.indexOf('oversight')       !== -1 ||
            grps.indexOf('suppress')        !== -1) return 'sysop';
        if (grps.indexOf('sysop')           !== -1) return 'sysop';
        if (grps.indexOf('interface-admin') !== -1) return 'interface-admin';
        if (grps.indexOf('overseer')        !== -1) return 'overseer';
        if (grps.indexOf('archivist')       !== -1) return 'archivist';
        if (grps.indexOf('kiểm-duyệt')      !== -1 ||
            grps.indexOf('reviewer')        !== -1) return 'reviewer';
        if (grps.indexOf('senior-writer')   !== -1) return 'senior-writer';
        if (grps.indexOf('writer')          !== -1) return 'writer';
        if (grps.indexOf('confirmed')       !== -1 ||
            grps.indexOf('autoconfirmed')   !== -1) return 'member';
        if (grps.indexOf('user')            !== -1 ||
            grps.indexOf('*')              !== -1) return 'user';
        return 'guest';
    }

    var RANK_META = {
        guest:            { label: 'GUEST',           color: '#52525b', tier: 0  },
        user:             { label: 'ĐỘC GIẢ',         color: '#71717a', tier: 1  },
        member:           { label: 'THÀNH VIÊN',       color: '#3b82f6', tier: 2  },
        writer:           { label: 'WRITER',           color: '#8b5cf6', tier: 3  },
        'senior-writer':  { label: 'SENIOR WRITER',    color: '#a855f7', tier: 4  },
        reviewer:         { label: 'KIỂM DUYỆT VIÊN', color: '#f59e0b', tier: 5  },
        archivist:        { label: 'ARCHIVIST',        color: '#06b6d4', tier: 6  },
        overseer:         { label: 'OVERSEER',         color: '#10b981', tier: 7  },
        'interface-admin':{ label: 'INTERFACE ADMIN',  color: '#f97316', tier: 8  },
        sysop:            { label: 'QUẢN TRỊ VIÊN',    color: '#ef4444', tier: 9  },
        bureaucrat:       { label: 'BUREAUCRAT',       color: '#ef4444', tier: 10 },
        founder:          { label: 'FOUNDER',          color: '#fbbf24', tier: 11 },
    };

    function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
    function txt(n, t) { n.textContent = t; return n; }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    /* ── CSS — load từ MediaWiki:AllUsers.css ── */
    function injectCSS() {
        if (document.getElementById('au-css')) return;
        var link = document.createElement('link');
        link.id   = 'au-css';
        link.rel  = 'stylesheet';
        link.href = '/index.php?title=MediaWiki:AllUsers.css&action=raw&ctype=text/css';
        document.head.appendChild(link);
    }

    /* ── Fetch user list via MediaWiki API ── */
    function fetchUsers(apcontinue, accumulated, callback) {
        var params = 'action=query&list=allusers&aulimit=500&auprop=groups|registration|editcount&format=json&formatversion=2';
        if (apcontinue) params += '&aucontinue=' + encodeURIComponent(apcontinue);

        var api = new mw.Api();
        api.get({
            action: 'query',
            list: 'allusers',
            aulimit: 500,
            auprop: 'groups|registration|editcount',
            format: 'json',
            formatversion: 2,
            aucontinue: apcontinue || undefined
        }).done(function(data) {
            var users = (data.query && data.query.allusers) || [];
            accumulated = accumulated.concat(users);
            if (data.continue && data.continue.aucontinue && accumulated.length < 2000) {
                fetchUsers(data.continue.aucontinue, accumulated, callback);
            } else {
                callback(accumulated);
            }
        }).fail(function() {
            callback(accumulated);
        });
    }

    /* ── Build ── */
    function build() {
        var mwText = document.querySelector('#mw-content-text');
        if (!mwText) return;

        injectCSS();

        var root = el('div', 'au-root');

        /* Header */
        var header = el('div', 'au-header');
        header.innerHTML = '<h1 class="au-title">// DANH SÁCH THÀNH VIÊN — M.A.P.L.E</h1><p class="au-sub">Tất cả thành viên đã đăng ký · Cập nhật theo thời gian thực</p>';
        root.appendChild(header);

        /* Controls */
        var controls = el('div', 'au-controls');
        var searchInput = el('input', 'au-search');
        searchInput.placeholder = 'TÌM KIẾM THÀNH VIÊN…'; searchInput.type = 'text';
        controls.appendChild(searchInput);

        var filterWrap = el('div', 'au-filter');
        var FILTER_RANKS = [
            { key: 'all',            label: 'TẤT CẢ',     color: '#52525b' },
            { key: 'founder',        label: 'FOUNDER',     color: '#fbbf24' },
            { key: 'bureaucrat',     label: 'BUREAUCRAT',  color: '#ef4444' },
            { key: 'sysop',          label: 'QTV',         color: '#ef4444' },
            { key: 'overseer',       label: 'OVERSEER',    color: '#10b981' },
            { key: 'archivist',      label: 'ARCHIVIST',   color: '#06b6d4' },
            { key: 'reviewer',       label: 'KIỂM DUYỆT',  color: '#f59e0b' },
            { key: 'senior-writer',  label: 'SR.WRITER',   color: '#a855f7' },
            { key: 'writer',         label: 'WRITER',      color: '#8b5cf6' },
            { key: 'member',         label: 'THÀNH VIÊN',  color: '#3b82f6' },
            { key: 'user',           label: 'ĐỘC GIẢ',    color: '#71717a' },
        ];
        var activeFilter = 'all';
        var filterBtns = {};
        FILTER_RANKS.forEach(function(f) {
            var btn = el('button', 'au-filter-btn' + (f.key === 'all' ? ' active' : ''));
            btn.textContent = f.key === 'all' ? f.label : f.label;
            btn.style.setProperty('--au-color', f.color);
            if (f.key === 'all') btn.style.setProperty('--au-color', '#ef4444');
            btn.dataset.rank = f.key;
            filterBtns[f.key] = btn;
            btn.addEventListener('click', function() {
                Object.values(filterBtns).forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                activeFilter = f.key;
                renderCards(searchInput.value.trim());
            });
            filterWrap.appendChild(btn);
        });
        controls.appendChild(filterWrap);

        var countEl = el('span', 'au-count'); countEl.textContent = ''; controls.appendChild(countEl);
        root.appendChild(controls);

        /* Grid */
        var grid = el('div', 'au-grid');
        root.appendChild(grid);

        /* Loading state */
        var loadingEl = el('div', 'au-loading'); loadingEl.textContent = '// ĐANG TẢI DANH SÁCH THÀNH VIÊN…';
        grid.appendChild(loadingEl);

        mwText.innerHTML = '';
        mwText.appendChild(root);

        /* Fetch all users */
        var allUsers = [];

        fetchUsers(null, [], function(users) {
            allUsers = users.filter(function(u) {
                /* Lọc bỏ bot và tài khoản hệ thống */
                var grps = u.groups || [];
                var name = u.name || '';
                return grps.indexOf('bot') === -1 &&
                       name.indexOf('MediaWiki') === -1 &&
                       name.indexOf('MAPLE Bot') === -1 &&
                       name !== '';
            });

            /* Sắp xếp theo tier giảm dần, sau đó theo tên */
            allUsers.sort(function(a, b) {
                var ra = detectRank(a.groups || []);
                var rb = detectRank(b.groups || []);
                var ta = RANK_META[ra] ? RANK_META[ra].tier : 0;
                var tb = RANK_META[rb] ? RANK_META[rb].tier : 0;
                if (tb !== ta) return tb - ta;
                return a.name.localeCompare(b.name);
            });

            renderCards('');
        });

        /* Search handler */
        var searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(function() { renderCards(searchInput.value.trim()); }, 180);
        });

        function renderCards(query) {
            grid.innerHTML = '';

            var q = query.toLowerCase();
            var filtered = allUsers.filter(function(u) {
                if (q && u.name.toLowerCase().indexOf(q) === -1) return false;
                if (activeFilter !== 'all') {
                    var r = detectRank(u.groups || []);
                    if (r !== activeFilter) return false;
                }
                return true;
            });

            countEl.textContent = filtered.length + ' / ' + allUsers.length + ' THÀNH VIÊN';

            if (!filtered.length) {
                var emptyEl = el('div', 'au-empty');
                emptyEl.textContent = query ? 'Không tìm thấy "' + query + '".' : 'Không có thành viên nào trong nhóm này.';
                grid.appendChild(emptyEl);
                return;
            }

            filtered.forEach(function(u) {
                var grps  = u.groups || [];
                var rank  = detectRank(grps);
                var rm    = RANK_META[rank] || RANK_META.user;

                var card = el('a', 'au-card');
                card.href = '/wiki/User:' + encodeURIComponent(u.name);

                var top = el('div', 'au-card-top');

                var av = el('div', 'au-avatar');
                av.style.borderColor = rm.color;
                av.style.color       = rm.color;
                av.style.boxShadow   = '0 0 10px ' + rm.color + '44';
                av.textContent = u.name.charAt(0).toUpperCase();
                top.appendChild(av);

                var nameWrap = el('div', '');
                var nameEl = el('div', 'au-name'); nameEl.textContent = u.name; nameWrap.appendChild(nameEl);
                var badge = el('span', 'au-rank-badge');
                badge.style.background = rm.color;
                badge.style.boxShadow  = '0 0 6px ' + rm.color + '66';
                badge.textContent = '// ' + rm.label;
                nameWrap.appendChild(badge);
                top.appendChild(nameWrap);
                card.appendChild(top);

                var meta = el('div', 'au-meta');
                if (u.editcount !== undefined) {
                    var ecEl = el('span', ''); ecEl.innerHTML = '<span>' + u.editcount + '</span> sửa đổi'; meta.appendChild(ecEl);
                }
                if (u.registration) {
                    var regDate = new Date(u.registration);
                    var regEl = el('span', '');
                    regEl.innerHTML = 'Tham gia <span>' + regDate.toLocaleDateString('vi-VN') + '</span>';
                    meta.appendChild(regEl);
                }
                var tierEl = el('span', ''); tierEl.innerHTML = 'Tier <span>' + rm.tier + '</span>'; meta.appendChild(tierEl);
                card.appendChild(meta);

                grid.appendChild(card);
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else {
        build();
    }

})();
