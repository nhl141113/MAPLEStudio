/**
 * M.A.P.L.E — MediaWiki:UserPage.js v6
 * - Bỏ toàn bộ "Trang thảo luận" → thay bằng MAPLE-Chat (openMapleChat helper)
 * - Action buttons (kết bạn/nhắn tin/báo cáo) trong hero khi xem trang người khác
 * - Ẩn tab CÀI ĐẶT khi xem trang người khác
 * - ĐÓNG GÓP đồng bộ API thực (usercontribs + editcount)
 * - Fetch editcount + registration từ API
 */
(function () {
    'use strict';

    var cfg = mw.config.get([
        'wgPageName', 'wgUserId', 'wgUserName', 'wgUserGroups',
        'wgNamespaceNumber', 'wgTitle', 'wgUploadPath', 'wgScript'
    ]);

    if (cfg.wgNamespaceNumber !== 2) return;
    if (cfg.wgTitle && cfg.wgTitle.indexOf('/') !== -1) return;

    var pageUser       = cfg.wgTitle || '';
    var viewerName     = cfg.wgUserName || '';
    var viewerGroups   = cfg.wgUserGroups || [];
    var viewerLoggedIn = cfg.wgUserId !== 0;
    var isOwn          = viewerLoggedIn && pageUser === viewerName;

    /* ═══════════════════════════════════════════════════
       RANK
    ═══════════════════════════════════════════════════ */
    function detectRank(grps) {
        /* ── Subrank (ngoài thang tier thường — ưu tiên kiểm tra trước) ── */
        if (grps.indexOf('blocked')         !== -1 ||
            grps.indexOf('banned')          !== -1) return 'banned';
        if (grps.indexOf('bot')             !== -1) return 'bot';

        /* ── Thang chính (8 bậc, đã gọn) ── */
        if (grps.indexOf('founder')         !== -1 ||
            grps.indexOf('bureaucrat')      !== -1) return 'founder';   /* gộp 2 bậc cao nhất */
        if (grps.indexOf('checkuser')       !== -1 ||
            grps.indexOf('oversight')       !== -1 ||
            grps.indexOf('suppress')        !== -1 ||
            grps.indexOf('sysop')           !== -1) return 'sysop';     /* gộp CU/OS vào sysop */
        if (grps.indexOf('interface-admin') !== -1) return 'interface-admin';
        if (grps.indexOf('kiểm-duyệt')      !== -1 ||
            grps.indexOf('reviewer')        !== -1 ||
            grps.indexOf('overseer')        !== -1 ||
            grps.indexOf('archivist')       !== -1) return 'reviewer';  /* gộp overseer/archivist */
        if (grps.indexOf('senior-writer')   !== -1 ||
            grps.indexOf('writer')          !== -1) return 'writer';    /* gộp senior-writer */
        if (grps.indexOf('confirmed')       !== -1 ||
            grps.indexOf('autoconfirmed')   !== -1) return 'member';
        if (grps.indexOf('user')            !== -1) return 'user';
        return 'guest';
    }

    var MAX_TIER = 7; /* Founder — bậc cao nhất trên thang chính */

    var RANK_META = {
        /* ── Thang chính (tier 0–7) ── */
        guest:            { label: 'GUEST',            color: '#52525b', glow: 'rgba(82,82,91,0.25)',    badge: '—',  tier: 0, desc: 'Chưa đăng nhập.' },
        user:             { label: 'ĐỘC GIẢ',          color: '#71717a', glow: 'rgba(113,113,122,0.25)', badge: 'R',  tier: 1, desc: 'Thành viên cơ bản — đọc và theo dõi trang.' },
        member:           { label: 'THÀNH VIÊN',        color: '#3b82f6', glow: 'rgba(59,130,246,0.28)',  badge: 'M',  tier: 2, desc: 'Tài khoản đã xác thực — có thể chỉnh sửa nội dung.' },
        writer:           { label: 'WRITER',            color: '#8b5cf6', glow: 'rgba(139,92,246,0.28)',  badge: 'W',  tier: 3, desc: 'Biên soạn viên — đóng góp hồ sơ và tài liệu cho wiki.' },
        reviewer:         { label: 'KIỂM DUYỆT VIÊN',  color: '#f59e0b', glow: 'rgba(245,158,11,0.32)',  badge: 'KD', tier: 4, desc: 'Kiểm duyệt nội dung và quản lý kho lưu trữ.' },
        'interface-admin':{ label: 'LẬP TRÌNH VIÊN',   color: '#f97316', glow: 'rgba(249,115,22,0.32)',  badge: 'LTV',tier: 5, desc: 'Quản lý giao diện — chỉnh sửa CSS/JS và MediaWiki namespace.' },
        sysop:            { label: 'QUẢN TRỊ VIÊN',     color: '#ef4444', glow: 'rgba(239,68,68,0.35)',   badge: 'QT', tier: 6, desc: 'Quản trị hệ thống — toàn quyền nội dung và thành viên.' },
        founder:          { label: 'FOUNDER',           color: '#fbbf24', glow: 'rgba(251,191,36,0.5)',   badge: '★',  tier: 7, desc: 'Người sáng lập M.A.P.L.E Wiki — kiến tạo và phân quyền toàn hệ thống.' },

        /* ── Subrank (ngoài thang tier — không hiển thị thanh tiến trình) ── */
        bot:              { label: 'BOT',               color: '#22d3ee', glow: 'rgba(34,211,238,0.32)',  badge: '⚙', tier: null, sub: true, desc: 'Tài khoản tự động — thực thi tác vụ bảo trì wiki.' },
        banned:           { label: 'BỊ CẤM',            color: '#dc2626', glow: 'rgba(220,38,38,0.4)',    badge: '⊘', tier: null, sub: true, desc: 'Tài khoản bị đình chỉ do vi phạm quy tắc cộng đồng.' },
    };

    var RANK_PERMS = {
        member:           ['Chỉnh sửa trang wiki', 'Tải lên tệp', 'Đánh dấu trang theo dõi'],
        writer:           ['Tất cả quyền Thành Viên', 'Tạo hồ sơ mới', 'Dùng MAPLE Editor', 'Gửi bài chờ duyệt'],
        reviewer:         ['Tất cả quyền Writer', 'Duyệt bài đăng', 'Xem hàng chờ kiểm duyệt', 'Quản lý kho lưu trữ'],
        'interface-admin':['Tất cả quyền Kiểm Duyệt', 'Chỉnh sửa CSS/JS', 'MediaWiki namespace', 'Gadget & tiện ích'],
        sysop:            ['Tất cả quyền Lập Trình Viên', 'Xóa trang', 'Khóa/mở khóa thành viên', 'Rollback'],
        founder:          ['Toàn quyền hệ thống', 'Cấp/thu quyền các nhóm', 'Cài đặt tiện ích mở rộng', 'Kiến trúc wiki'],
        /* Subrank */
        bot:              ['Thực thi tác vụ tự động', 'Sửa hàng loạt (bot flag)', 'Không tính rate-limit'],
        banned:           ['Bị đình chỉ — không thể chỉnh sửa'],
    };

    var ALL_BADGES = [
        { icon: '◉', label: 'THAM GIA',        desc: 'Đã tạo tài khoản M.A.P.L.E',               minTier: 1 },
        { icon: '✎', label: 'BIÊN TẬP VIÊN',   desc: 'Tài khoản đã xác thực — có thể chỉnh sửa', minTier: 2 },
        { icon: '✦', label: 'WRITER',           desc: 'Được công nhận là biên soạn viên',          minTier: 3 },
        { icon: '⬡', label: 'KIỂM DUYỆT',      desc: 'Phụ trách kiểm duyệt & lưu trữ nội dung',  minTier: 4 },
        { icon: '⟡', label: 'LẬP TRÌNH VIÊN', desc: 'Quản lý giao diện & mã hệ thống',          minTier: 5 },
        { icon: '⚙', label: 'QUẢN TRỊ VIÊN',   desc: 'Quản trị hệ thống wiki',                   minTier: 6 },
        { icon: '★', label: 'FOUNDER',          desc: 'Người sáng lập M.A.P.L.E Wiki',            minTier: 7 },
    ];

    /* ═══════════════════════════════════════════════════
       PROFILE — wiki subpage User:X/Maple-Profile
    ═══════════════════════════════════════════════════ */
    var PROFILE_PAGE = 'User:' + pageUser.replace(/ /g, '_') + '/Maple-Profile';
    var CACHE_KEY    = 'maple_profile_cache_' + pageUser.replace(/\s/g, '_');
    var FRIENDS_KEY  = 'maple_friends_' + (viewerName || 'guest').replace(/\s/g, '_');

    var DEFAULT_PROFILE = {
        bio: '', slogan: '', accentOverride: '', bannerColor: '',
        bannerImage: '', fontFamily: '', statusMood: '', statusEmoji: '',
        headerLayout: 'default', /* 'default' | 'centered' | 'minimal' */
        widgets: { showStats: true, showBadges: true, showActiveFlair: true, showJoinDate: true, showStatus: true, showContribGraph: false },
        contacts: [], showContacts: false,
        privacy: { allowFriends: true, allowMessages: true, showInList: true, showFriendList: true },
        donate: { enabled: false, bankName: '', accountNumber: '', accountHolder: '', qrImage: '', momo: '', note: '' },
    };

    /* ═══════════════════════════════════════════════════
       DONATE — điều kiện bật tab (mặc định TẮT)
       Chỉ bật được khi: Admin (sysop/interface-admin/founder)
       HOẶC Writer/KDV có ≥10 bài chất lượng (suy từ thành tựu writer_* đã trao,
       tức đã qua kiểm duyệt — server-curated; hoặc BQT trao 'donor_eligible').
    ═══════════════════════════════════════════════════ */
    var DONATE_ADMIN_RANKS  = { founder: 1, sysop: 1, 'interface-admin': 1 };
    var DONATE_WRITER_RANKS = { writer: 1, reviewer: 1 };
    var DONATE_QUALITY_ACH  = { writer_100: 100, writer_50: 50, writer_25: 25, writer_10: 10 };
    function donateApprovedCount(list) {
        var max = 0;
        (list || []).forEach(function (x) { if (x && DONATE_QUALITY_ACH[x.id]) max = Math.max(max, DONATE_QUALITY_ACH[x.id]); });
        return max;
    }
    function donateEligible(rank, list) {
        if (DONATE_ADMIN_RANKS[rank]) return true;
        if ((list || []).some(function (x) { return x && x.id === 'donor_eligible'; })) return true;
        if (DONATE_WRITER_RANKS[rank] && donateApprovedCount(list) >= 10) return true;
        return false;
    }

    function loadProfileCache() {
        try { var r = localStorage.getItem(CACHE_KEY); return r ? Object.assign({}, DEFAULT_PROFILE, JSON.parse(r)) : null; }
        catch(e) { return null; }
    }
    function saveProfileCache(p) {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(p)); } catch(e) {}
    }

    var API = new mw.Api();

    /* ═══════════════════════════════════════════════════
       AVATAR — SocialProfile (cùng domain) hoặc chữ cái
    ═══════════════════════════════════════════════════ */

    var _avatarCache = {};

    /* SocialProfile avatar — probe Special:UserProfileAvatar/{username} (cùng domain, CSP ok) */
    function fetchAvatar(username, userId, callback) {
        if (_avatarCache[username] !== undefined) { callback(_avatarCache[username]); return; }
        var url = mw.config.get('wgServer') + '/wiki/Special:UserProfileAvatar/' + encodeURIComponent(username);
        var img = new Image();
        img.onload  = function() { _avatarCache[username] = url; callback(url); };
        img.onerror = function() { _avatarCache[username] = null; callback(null); };
        img.src = url;
    }

    /* Tạo màu avatar từ username (dùng khi không có ảnh) */
    function usernameColor(name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        var colors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#06b6d4','#ec4899','#ef4444','#84cc16'];
        return colors[Math.abs(hash) % colors.length];
    }

    /* ═══════════════════════════════════════════════════
       SOCIALPROFILE API — friends + profile (có fallback localStorage)
    ═══════════════════════════════════════════════════ */
    var _spAvailable = null; /* null=chưa check, true/false */

    function _checkSP(cb) {
        if (_spAvailable !== null) { cb(_spAvailable); return; }
        mw.loader.using('ext.socialprofile.userprofile.js', function() {
            _spAvailable = true; cb(true);
        }, function() {
            _spAvailable = false; cb(false);
        });
    }

    /* Lấy profile SP — dùng wgUserProfile nếu đang xem trang SP của chính user đó */
    function fetchSPProfile(username, callback) {
        /* SP inject wgUserProfile vào mw.config khi render trang User:[name] */
        var spData = mw.config.get('wgUserProfile');
        if (spData && spData.user_name === username) {
            callback({
                about:    spData.about     || spData.real_name || '',
                location: spData.location  || '',
                website:  spData.website   || '',
            });
        } else {
            callback(null);
        }
    }

    /* ── SocialProfile UserRelationship — URL Special page CHUẨN ──
       Tên đúng: Special:AddRelationship / Special:RemoveRelationship
       (KHÔNG phải AddFriend/RemoveFriend). rel_type=1 = bạn bè, 2 = đối thủ. */
    function spAddRelationshipUrl(username) {
        return mw.util.getUrl('Special:AddRelationship') +
            '?user=' + encodeURIComponent(username) + '&rel_type=1';
    }
    function spRemoveRelationshipUrl(username) {
        return mw.util.getUrl('Special:RemoveRelationship') +
            '?user=' + encodeURIComponent(username);
    }
    function spViewRelationshipsUrl(username) {
        return mw.util.getUrl('Special:ViewRelationships') +
            '?user=' + encodeURIComponent(username);
    }

    /* Kết bạn — nếu có SocialProfile: điều hướng tới trang AddRelationship thật;
       nếu không: lưu localStorage. */
    function spAddFriend(username, callback) {
        _checkSP(function(hasSP) {
            if (hasSP && mw.config.get('wgFriendingEnabled') !== false) {
                callback(false, 'redirect');
            } else {
                addFriend(username); callback(true, null);
            }
        });
    }

    function spRemoveFriend(username, callback) {
        _checkSP(function(hasSP) {
            if (hasSP && mw.config.get('wgFriendingEnabled') !== false) {
                callback(false, 'redirect');
            } else {
                removeFriend(username); callback(true, null);
            }
        });
    }

    /* Lấy danh sách bạn bè.
       LƯU Ý: SocialProfile KHÔNG có API list module để đọc bạn bè (chỉ có action
       module 'socialprofile-request-response'). Vì vậy ta dùng localStorage làm
       nguồn hiển thị, và link "Xem tất cả" trỏ tới Special:ViewRelationships thật. */
    function fetchSPFriends(username, callback) {
        callback(loadFriends());
    }

    /* (Giữ stub cũ để tương thích — không còn gọi API không tồn tại) */
    function _legacyFetchSPFriends(username, callback) {
        API.get({ action: 'query', list: 'socialfriends', sfuser: username,
            sflimit: 500, format: 'json' })
        .done(function(data) {
            var list = data.query && data.query.socialfriends;
            if (list && list.length) {
                callback(list.map(function(f) { return f.user || f.title || f; }));
            } else {
                callback(loadFriends());
            }
        }).fail(function() { callback(loadFriends()); });
    }

    function fetchProfile(callback) {
        var cached = loadProfileCache();
        if (cached) { callback(cached); }

        API.get({
            action: 'query', titles: PROFILE_PAGE,
            prop: 'revisions', rvprop: 'content', rvslots: 'main',
            format: 'json', formatversion: 2
        }).done(function(data) {
            try {
                var page = data.query && data.query.pages && data.query.pages[0];
                if (page && !page.missing && page.revisions && page.revisions[0]) {
                    var rev     = page.revisions[0];
                    var content = (rev.slots && rev.slots.main && rev.slots.main.content) ||
                                  rev.content || rev['*'] || '{}';
                    var profile = JSON.parse(content);
                    profile = Object.assign({}, DEFAULT_PROFILE, profile);
                    if (!profile.privacy) profile.privacy = DEFAULT_PROFILE.privacy;
                    saveProfileCache(profile);
                    callback(profile);
                } else {
                    callback(cached || Object.assign({}, DEFAULT_PROFILE));
                }
            } catch(e) { callback(cached || Object.assign({}, DEFAULT_PROFILE)); }
        }).fail(function() { callback(cached || Object.assign({}, DEFAULT_PROFILE)); });
    }

    function saveProfile(data, onSuccess, onError) {
        if (!isOwn) {
            if (onError) onError('Từ chối truy cập: Bạn không có quyền chỉnh sửa thông tin trang cá nhân của thành viên này.');
            return;
        }
        API.get({ action: 'query', meta: 'tokens', type: 'csrf', format: 'json' })
        .done(function(tokenData) {
            var token = tokenData.query && tokenData.query.tokens && tokenData.query.tokens.csrftoken;
            if (!token || token === '+\\') { if (onError) onError('Chưa đăng nhập'); return; }
            API.post({
                action: 'edit', title: PROFILE_PAGE, format: 'json',
                text: JSON.stringify(data),
                summary: 'Cập nhật hồ sơ cá nhân',
                token: token
            }).done(function(res) {
                if (res.error && res.error.code === 'badtoken') {
                    /* Token hết hạn — thử lần 2 */
                    API.get({ action: 'query', meta: 'tokens', type: 'csrf', format: 'json' })
                    .done(function(d2) {
                        var t2 = d2.query && d2.query.tokens && d2.query.tokens.csrftoken;
                        if (!t2 || t2 === '+\\') { if (onError) onError('Token không hợp lệ'); return; }
                        API.post({
                            action: 'edit', title: PROFILE_PAGE, format: 'json',
                            text: JSON.stringify(data),
                            summary: 'Cập nhật hồ sơ cá nhân', token: t2
                        }).done(function() { saveProfileCache(data); if (onSuccess) onSuccess(); })
                          .fail(function() { if (onError) onError('Lỗi kết nối (retry)'); });
                    }).fail(function() { if (onError) onError('Không lấy được token'); });
                } else if (res.edit && (res.edit.result === 'Success' || res.edit.nochange !== undefined)) {
                    saveProfileCache(data); if (onSuccess) onSuccess();
                } else {
                    if (onError) onError(res.error ? res.error.info : 'Lỗi không xác định');
                }
            }).fail(function() { if (onError) onError('Lỗi kết nối'); });
        }).fail(function() { if (onError) onError('Không lấy được token'); });
    }

    /* Lấy bio từ trang User:[tên] trên login.miraheze.org (Meta wiki) */
    function fetchWikiIntro(username, callback) {
        /* Meta Miraheze là cross-origin — dùng action=parse trên API nội bộ làm fallback,
           nhưng trước tiên thử lấy từ trang User: của wiki này */
        API.get({
            action: 'query', titles: 'User:' + username,
            prop: 'revisions', rvprop: 'content', rvslots: 'main',
            format: 'json', formatversion: 2
        }).done(function(data) {
            try {
                var page = data.query && data.query.pages && data.query.pages[0];
                if (page && !page.missing && page.revisions && page.revisions[0]) {
                    var rev  = page.revisions[0];
                    var raw  = (rev.slots && rev.slots.main && rev.slots.main.content) ||
                               rev.content || rev['*'] || '';
                    if (raw.trim()) { callback(cleanWikitext(raw)); return; }
                }
                /* Không có trang User: trên wiki này — thử Meta qua mw.loader */
                fetchMetaBio(username, callback);
            } catch(e) { fetchMetaBio(username, callback); }
        }).fail(function() { fetchMetaBio(username, callback); });
    }

    /* Lấy bio từ meta.miraheze.org/wiki/User:[tên] qua fetch CORS public */
    function fetchMetaBio(username, callback) {
        /* User page toàn cục của Miraheze nằm ở meta.miraheze.org, không phải login.miraheze.org */
        var url = 'https://meta.miraheze.org/w/api.php' +
            '?action=query&titles=User:' + encodeURIComponent(username) +
            '&prop=revisions&rvprop=content&rvslots=main' +
            '&format=json&formatversion=2&origin=*';
        fetch(url)
        .then(function(res) { return res.ok ? res.json() : null; })
        .then(function(data) {
            if (!data) { callback(null); return; }
            try {
                var pages = data.query && data.query.pages;
                var page  = Array.isArray(pages) ? pages[0] : pages[Object.keys(pages)[0]];
                if (!page || page.missing !== undefined) { callback(null); return; }
                var rev = page.revisions && page.revisions[0];
                if (!rev) { callback(null); return; }
                var raw = (rev.slots && rev.slots.main && rev.slots.main.content) ||
                          rev['*'] || rev.content || '';
                callback(cleanWikitext(raw) || null);
            } catch(e) { callback(null); }
        }).catch(function() { callback(null); });
    }

    function cleanWikitext(raw) {
        /* Bóc template lồng nhau {{...}} nhiều lớp */
        var s = raw, prev;
        do { prev = s; s = s.replace(/\{\{[^{}]*\}\}/g, ''); } while (s !== prev);

        s = s
            .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1') /* [[link|text]] → text */
            .replace(/\[https?:\/\/\S+\s+([^\]]+)\]/g, '$1')  /* [url text] → text */
            .replace(/\[https?:\/\/\S+\]/g, '')                /* [url] → xóa */
            .replace(/'''?/g, '')                              /* bold/italic */
            .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '')        /* <ref>...</ref> */
            .replace(/<[^>]+>/g, '')                           /* HTML tags */
            .replace(/^[ \t]*[=]{1,6}[ \t]*(.+?)[ \t]*[=]{1,6}[ \t]*$/gm, '── $1 ──') /* heading → label */
            .replace(/^[ \t]*[*#]+[ \t]*/gm, '• ')            /* list items → bullet */
            .replace(/^[ \t]*[:;]+[ \t]*/gm, '  ')            /* indent/def list */
            .replace(/^\s*[|!][^\n]*/gm, '')                  /* table rows */
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        return s;
    }

    function loadFriends() {
        try { return JSON.parse(localStorage.getItem(FRIENDS_KEY) || '[]'); } catch(e) { return []; }
    }
    function saveFriends(list) { try { localStorage.setItem(FRIENDS_KEY, JSON.stringify(list)); } catch(e) {} }
    function isFriend(u) { return loadFriends().indexOf(u) !== -1; }
    function addFriend(u) { var l = loadFriends(); if (l.indexOf(u) === -1) { l.push(u); saveFriends(l); } }
    function removeFriend(u) { saveFriends(loadFriends().filter(function(f) { return f !== u; })); }

    /* ── DOM Helpers ── */
    function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
    function txt(n, t) { n.textContent = t; return n; }
    function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
    function copyText(t, btn) {
        function ok() { if (!btn) return; var o = btn.textContent; btn.textContent = '✓'; setTimeout(function(){ btn.textContent = o; }, 1200); }
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t).then(ok); return; }
        } catch (e) {}
        try { var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select();
            document.execCommand('copy'); document.body.removeChild(ta); ok(); } catch (e2) {}
    }

    /* Mở MAPLE-Chat với một thành viên — fallback sang trang /Chat toàn trang nếu chưa load */
    function openMapleChat(partner) {
        if (window.MAPLEChat && window.MAPLEChat.openChatWith) {
            window.MAPLEChat.openChatWith(partner);
        } else if (window.MAPLEChat && window.MAPLEChat.open) {
            window.MAPLEChat.open();
        } else {
            var who = viewerName || partner || '';
            window.location.href = '/wiki/Ng%C6%B0%E1%BB%9Di_d%C3%B9ng:' + encodeURIComponent(who) + '/Chat';
        }
    }

    function buildCard(labelText, actionHref, actionLabel) {
        var card = el('div', 'up-card');
        var head = el('div', 'up-card-head');
        var lbl  = el('span', 'up-card-label'); txt(lbl, labelText); head.appendChild(lbl);
        if (actionHref) {
            var act = el('a', 'up-card-action'); act.href = actionHref;
            act.textContent = actionLabel || '→'; head.appendChild(act);
        }
        card.appendChild(head);
        card.appendChild(el('div', 'up-card-body'));
        return card;
    }

    var LOGO_SVG =
        '<svg width="72" height="72" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs><filter id="up-glow"><feGaussianBlur stdDeviation="2" result="b"/>' +
        '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
        '<path d="M50 5L95 40L80 95H20L5 40L50 5Z" stroke="#450a0a" stroke-width="0.8" opacity="0.5"/>' +
        '<g filter="url(#up-glow)">' +
        '<path d="M50 15V85M50 15L85 45L50 40L15 45L50 15Z" stroke="#ef4444" stroke-width="2" stroke-linejoin="miter"/>' +
        '<path d="M30 60L50 85L70 60" stroke="#ef4444" stroke-width="2"/>' +
        '</g>' +
        '<circle cx="50" cy="40" r="5.5" fill="#ef4444" filter="url(#up-glow)" class="maple-eye-pulse"/>' +
        '</svg>';

    var CONTACT_PLATFORMS = {
        facebook:  { label: 'Facebook',      icon: 'f', prefix: 'https://facebook.com/' },
        youtube:   { label: 'YouTube',        icon: '▶', prefix: 'https://youtube.com/@' },
        gmail:     { label: 'Gmail',          icon: '✉', prefix: 'mailto:' },
        miraheze:  { label: 'Miraheze',       icon: '◈', prefix: 'https://meta.miraheze.org/wiki/User:' },
        discord:   { label: 'Discord',        icon: '⌥', prefix: '' },
        twitter:   { label: 'Twitter / X',    icon: '✕', prefix: 'https://x.com/' },
        github:    { label: 'GitHub',         icon: '⊙', prefix: 'https://github.com/' },
        tiktok:    { label: 'TikTok',         icon: '♪', prefix: 'https://tiktok.com/@' },
        instagram: { label: 'Instagram',      icon: '◎', prefix: 'https://instagram.com/' },
        telegram:  { label: 'Telegram',       icon: '✈', prefix: 'https://t.me/' },
        custom:    { label: 'Khác (URL đầy đủ)', icon: '→', prefix: '' },
    };

    /* ═══════════════════════════════════════════════════
       BUILD PAGE
    ═══════════════════════════════════════════════════ */
    function buildPage(ownerGroups, ownerUserId, ownerInfo) {
        var RANK        = detectRank(ownerGroups);
        var meta        = RANK_META[RANK];
        var uploadPath  = cfg.wgUploadPath || '/images';
        var ownerEditcount    = (ownerInfo && ownerInfo.editcount    != null) ? ownerInfo.editcount    : null;
        var ownerRegistration = (ownerInfo && ownerInfo.registration != null) ? ownerInfo.registration : null;
        var _heroActionsEl    = null; /* ref để refresh khi profile reload */

        /* ── Chế độ nội dung theo tuổi (đọc/đổi qua MAPLE.Moderation) ──
           Hiển thị bản kiểm duyệt đang áp + nút chuyển. Người ≥18 xác nhận để nới;
           có thể hạ về dưới-18 bất cứ lúc nào. Lưu qua setAudience (localStorage). */
        function buildAudienceControl() {
            var wrap = el('div', 'up-audience');

            function modAud() {
                var M = window.MAPLE && window.MAPLE.Moderation;
                return (M && M.getAudience) ? M.getAudience() : 'teen';
            }
            function setAud(age) {
                var M = window.MAPLE && window.MAPLE.Moderation;
                if (M && M.setAudience) M.setAudience(age);
                else { try { localStorage.setItem('maple_signup_age', String(age)); } catch (e) {} }
                try { localStorage.setItem('maple_age_asked', '1'); } catch (e) {}
                paint();
            }

            function paint() {
                wrap.innerHTML = '';
                var aud = modAud();
                var isAdult = (aud === 'adult');

                var lbl = el('div', 'up-audience-label');
                txt(lbl, '// CHẾ ĐỘ NỘI DUNG');
                wrap.appendChild(lbl);

                var state = el('div', 'up-audience-state ' + (isAdult ? 'is-adult' : 'is-teen'));
                txt(state, isAdult ? '🔓 Người lớn (18+)' : '🔒 Dưới 18 tuổi (chặt hơn)');
                wrap.appendChild(state);

                var btn = el('button', 'up-audience-btn');
                txt(btn, isAdult ? 'Chuyển về chế độ dưới 18' : 'Tôi đủ 18 tuổi — nới chế độ');
                btn.addEventListener('click', function () { setAud(isAdult ? 13 : 18); });
                wrap.appendChild(btn);

                var note = el('a', 'up-audience-note');
                note.href = '/wiki/%C4%90i%E1%BB%81u_Kho%E1%BA%A3n/Ki%E1%BB%83m_Duy%E1%BB%87t';
                txt(note, 'Cách kiểm duyệt theo tuổi hoạt động →');
                wrap.appendChild(note);
            }

            paint();
            return wrap;
        }

        /* ── Populate hero action buttons ── */
        function populateHeroActions(container, profile) {
            container.innerHTML = '';
            if (!viewerLoggedIn) {
                var guestFriendBtn = el('button', 'up-ha-btn');
                guestFriendBtn.textContent = '◎ Kết bạn';
                guestFriendBtn.addEventListener('click', function() {
                    if (window.MAPLE && window.MAPLE.showGuestGate) {
                        window.MAPLE.showGuestGate('edit');
                    } else {
                        var loginUrl = '/wiki/Special:UserLogin?returnto=' + encodeURIComponent(cfg.wgPageName);
                        window.location.href = loginUrl;
                    }
                });
                container.appendChild(guestFriendBtn);

                var guestMsgBtn = el('button', 'up-ha-btn');
                guestMsgBtn.textContent = '💬 Nhắn tin';
                guestMsgBtn.addEventListener('click', function() {
                    if (window.MAPLE && window.MAPLE.showGuestGate) {
                        window.MAPLE.showGuestGate('edit');
                    } else {
                        var loginUrl = '/wiki/Special:UserLogin?returnto=' + encodeURIComponent(cfg.wgPageName);
                        window.location.href = loginUrl;
                    }
                });
                container.appendChild(guestMsgBtn);

                var guestReportBtn = el('a', 'up-ha-btn up-ha-report');
                guestReportBtn.href = '/wiki/D%E1%BB%B1_%C3%A1n:B%C3%A1o_C%C3%A1o?action=edit&section=new&preloadtitle=' +
                    encodeURIComponent('Báo cáo vi phạm: ' + pageUser.replace(/_/g, ' '));
                guestReportBtn.textContent = '⚑ Báo cáo';
                container.appendChild(guestReportBtn);
                return;
            }

            var privacy      = (profile && profile.privacy) ? profile.privacy : DEFAULT_PROFILE.privacy;
            var allowFriends  = privacy.allowFriends  !== false;
            var allowMessages = privacy.allowMessages !== false;
            var alreadyFriend = isFriend(pageUser);

            /* Kết bạn — thử SocialProfile API trước, fallback localStorage */
            var friendBtn = el('button', 'up-ha-btn' + (alreadyFriend ? ' up-ha-active' : '') + (!allowFriends ? ' up-ha-disabled' : ''));
            friendBtn.textContent = alreadyFriend ? '◉ Đã kết bạn' : '◎ Kết bạn';
            if (!allowFriends) {
                friendBtn.disabled = true;
                friendBtn.title = 'Thành viên này không nhận kết bạn';
            } else {
                friendBtn.addEventListener('click', function() {
                    friendBtn.disabled = true;
                    if (isFriend(pageUser)) {
                        spRemoveFriend(pageUser, function(ok, err) {
                            if (err === 'redirect') {
                                window.location.href = spRemoveRelationshipUrl(pageUser);
                                return;
                            }
                            removeFriend(pageUser);
                            friendBtn.textContent = '◎ Kết bạn';
                            friendBtn.classList.remove('up-ha-active');
                            friendBtn.disabled = false;
                        });
                    } else {
                        spAddFriend(pageUser, function(ok, err) {
                            if (err === 'redirect') {
                                window.location.href = spAddRelationshipUrl(pageUser);
                                return;
                            }
                            addFriend(pageUser); /* sync localStorage cũng */
                            friendBtn.textContent = '◉ Đã kết bạn';
                            friendBtn.classList.add('up-ha-active');
                            friendBtn.disabled = false;
                        });
                    }
                });
            }
            container.appendChild(friendBtn);

            /* Nhắn tin — mở MAPLE-Chat nếu available, fallback User Board / talk page */
            var msgBtn = el('button', 'up-ha-btn' + (!allowMessages ? ' up-ha-disabled' : ''));
            msgBtn.textContent = '💬 Nhắn tin';
            if (!allowMessages) {
                msgBtn.disabled = true;
                msgBtn.title = 'Thành viên này không nhận tin nhắn';
            } else {
                msgBtn.addEventListener('click', function() {
                    openMapleChat(pageUser);
                });
            }
            container.appendChild(msgBtn);

            /* Báo cáo — luôn khả dụng */
            var reportBtn = el('a', 'up-ha-btn up-ha-report');
            reportBtn.href = '/wiki/D%E1%BB%B1_%C3%A1n:B%C3%A1o_C%C3%A1o?action=edit&section=new&preloadtitle=' +
                encodeURIComponent('Báo cáo vi phạm: ' + pageUser.replace(/_/g, ' '));
            reportBtn.textContent = '⚑ Báo cáo';
            container.appendChild(reportBtn);
        }

        /* ══ HERO ══ */
        function buildHero(profile) {
            var accentColor = profile.accentOverride || meta.color;
            var accentGlow  = profile.accentOverride ? profile.accentOverride + '55' : meta.glow;

            var hero = el('div', 'up-hero');
            hero.style.setProperty('--up-color', accentColor);
            hero.style.setProperty('--up-glow',  accentGlow);

            var inner = el('div', 'up-hero-inner');

            /* Avatar */
            var avWrap   = el('div', 'up-avatar-wrap');
            var avImg    = document.createElement('img');
            avImg.className = 'up-avatar up-avatar-img';
            avImg.style.borderColor = accentColor;
            avImg.style.boxShadow = '0 0 24px ' + accentGlow + ', inset 0 0 16px rgba(0,0,0,0.6)';
            var avLetter = el('div', 'up-avatar up-avatar-letter');
            avLetter.style.borderColor = accentColor;
            avLetter.style.boxShadow = '0 0 24px ' + accentGlow + ', inset 0 0 16px rgba(0,0,0,0.6)';
            avLetter.style.color = accentColor;
            txt(avLetter, pageUser.charAt(0).toUpperCase());
            avImg.style.display = 'none';
            avWrap.appendChild(avImg);
            avWrap.appendChild(avLetter);

            /* Màu avatar theo username khi không có ảnh */
            var uColor = usernameColor(pageUser);
            avLetter.style.background = uColor + '22';
            avLetter.style.color = uColor;

            /* Thử Gravatar (chỉ có khi xem trang của chính mình) */
            fetchAvatar(pageUser, ownerUserId, function(url) {
                if (url) {
                    avImg.src = url;
                    avImg.onload  = function() { avImg.style.display = 'block'; avLetter.style.display = 'none'; };
                    avImg.onerror = function() { avImg.style.display = 'none';  avLetter.style.display = 'flex'; };
                    if (avImg.complete && avImg.naturalWidth > 0) {
                        avImg.style.display = 'block'; avLetter.style.display = 'none';
                    }
                }
            });
            inner.appendChild(avWrap);

            var info = el('div', 'up-hero-info');

            var rankBadge = el('div', 'up-rank-badge');
            rankBadge.style.background = accentColor;
            rankBadge.style.boxShadow  = '0 0 10px ' + accentGlow;
            txt(rankBadge, '// ' + meta.label);
            info.appendChild(rankBadge);

            var name = el('h1', 'up-username');
            name.textContent = pageUser.replace(/_/g, ' ');
            info.appendChild(name);

            if (profile.slogan) {
                var slogan = el('p', 'up-bio-slogan');
                slogan.style.borderLeftColor = accentColor;
                slogan.style.color           = accentColor;
                slogan.textContent = profile.slogan;
                info.appendChild(slogan);
            } else {
                var rankDesc = el('p', 'up-rank-desc'); txt(rankDesc, meta.desc); info.appendChild(rankDesc);
            }

            /* Status / Mood hiển thị nếu có */
            var showStatus = !profile.widgets || profile.widgets.showStatus !== false;
            if (showStatus && (profile.statusMood || profile.statusEmoji)) {
                var statusRow = el('div', 'up-status-row');
                if (profile.statusEmoji) {
                    var statusEmoji = el('span', 'up-status-emoji'); statusEmoji.textContent = profile.statusEmoji;
                    statusRow.appendChild(statusEmoji);
                }
                if (profile.statusMood) {
                    var statusText = el('span', 'up-status-text'); statusText.textContent = profile.statusMood;
                    statusRow.appendChild(statusText);
                }
                info.appendChild(statusRow);
            }

            if (meta.tier != null) {
                /* Thanh tiến trình tier — chỉ cho rank thường */
                var tierWrap = el('div', 'up-tier-wrap');
                var tierBar  = el('div', 'up-tier-bar');
                var tierFill = el('div', 'up-tier-fill');
                tierFill.style.width      = Math.round(meta.tier / MAX_TIER * 100) + '%';
                tierFill.style.background = accentColor;
                tierFill.style.boxShadow  = '0 0 8px ' + accentGlow;
                tierBar.appendChild(tierFill); tierWrap.appendChild(tierBar);
                var tierLabel = el('span', 'up-tier-label');
                tierLabel.textContent = 'TIER ' + meta.tier + ' / ' + MAX_TIER;
                tierLabel.style.color = accentColor;
                tierWrap.appendChild(tierLabel);
                info.appendChild(tierWrap);
            } else {
                /* Subrank (Bot / Bị cấm) — nhãn đặc biệt thay thanh tier */
                var subWrap = el('div', 'up-tier-wrap');
                var subTag  = el('span', 'up-tier-label');
                subTag.textContent = '◆ ' + meta.label + ' — TÀI KHOẢN ĐẶC BIỆT';
                subTag.style.color = accentColor;
                subWrap.appendChild(subTag);
                info.appendChild(subWrap);
            }

            var statItems = [
                { label: 'NHÓM', value: meta.label },
                { label: 'TIER', value: (meta.tier != null ? meta.tier + ' / ' + MAX_TIER : '—') },
                { label: 'WIKI', value: 'M.A.P.L.E' },
            ];
            if (ownerEditcount != null) {
                statItems.splice(1, 0, { label: 'SỬA ĐỔI', value: ownerEditcount.toLocaleString('vi-VN') });
            }
            if (ownerRegistration) {
                var regYear = new Date(ownerRegistration).getFullYear();
                statItems.push({ label: 'THAM GIA', value: 'T' + regYear });
            }

            var stats = el('div', 'up-stats');
            statItems.forEach(function(s) {
                var item = el('div', 'up-stat-item');
                var lbl = el('span', 'up-stat-label'); txt(lbl, s.label); item.appendChild(lbl);
                var val = el('span', 'up-stat-value'); txt(val, s.value); item.appendChild(val);
                stats.appendChild(item);
            });
            info.appendChild(stats);

            /* Action buttons khi xem trang người khác */
            if (!isOwn && viewerLoggedIn) {
                _heroActionsEl = el('div', 'up-hero-actions');
                populateHeroActions(_heroActionsEl, profile);
                info.appendChild(_heroActionsEl);
            }

            /* Chế độ nội dung theo tuổi (chỉ trên trang của chính mình) */
            if (isOwn && viewerLoggedIn) {
                info.appendChild(buildAudienceControl());
            }

            inner.appendChild(info);

            /* Banner — gradient + image overlay */
            if (profile.bannerColor || profile.bannerImage) {
                var banner = el('div', 'up-overview-banner');
                if (profile.bannerImage && profile.bannerColor) {
                    banner.style.background = profile.bannerColor;
                    banner.style.backgroundImage = 'url(' + JSON.stringify(profile.bannerImage) + ')';
                    banner.style.backgroundSize = 'cover';
                    banner.style.backgroundPosition = 'center';
                } else if (profile.bannerImage) {
                    banner.style.backgroundImage = 'url(' + JSON.stringify(profile.bannerImage) + ')';
                    banner.style.backgroundSize = 'cover';
                    banner.style.backgroundPosition = 'center';
                } else {
                    banner.style.background = profile.bannerColor;
                }
                hero.appendChild(banner);
            }

            var logoWrap = el('div', 'up-hero-logo');
            logoWrap.innerHTML = LOGO_SVG;
            inner.appendChild(logoWrap);

            hero.appendChild(inner);
            return hero;
        }

        /* Render full bio text — heading ── X ── thành styled span, giữ xuống dòng */
        function renderBio(container, text, source) {
            container.className = 'up-prose';
            container.innerHTML = '';
            var lines = text.split('\n');
            var buf   = '';
            function flushBuf() {
                if (!buf.trim()) { buf = ''; return; }
                var t  = document.createTextNode(buf);
                container.appendChild(t);
                buf = '';
            }
            lines.forEach(function(line, i) {
                var heading = line.match(/^──\s+(.+?)\s+──$/);
                if (heading) {
                    flushBuf();
                    var sp = document.createElement('span');
                    sp.className   = 'up-bio-section';
                    sp.textContent = heading[1];
                    container.appendChild(sp);
                } else {
                    buf += line + (i < lines.length - 1 ? '\n' : '');
                }
            });
            flushBuf();
            if (source) {
                var note = document.createElement('span');
                note.className   = 'up-bio-source';
                note.textContent = '— nguồn: ' + source;
                container.appendChild(note);
            }
        }

        /* ══ TAB: TỔNG QUAN ══ */
        function buildOverview(profile) {
            var accentColor = profile.accentOverride || meta.color;
            var wrap = el('div', 'up-tab-content');

            var bioCard = buildCard('// GIỚI THIỆU');
            var bioBody = bioCard.querySelector('.up-card-body');

            if (profile.bio) {
                var bioP = el('p', 'up-prose'); bioP.textContent = profile.bio; bioBody.appendChild(bioP);
            } else {
                var bioHolder = el('p', 'up-prose up-muted');
                bioHolder.textContent = 'Đang tải giới thiệu…';
                bioBody.appendChild(bioHolder);
                /* Ưu tiên: SocialProfile bio → Miraheze Meta → trang User: wiki */
                fetchSPProfile(pageUser, function(spData) {
                    var spBio = spData && (spData.about || spData.real_name || spData.location);
                    if (spBio) {
                        var spText = '';
                        if (spData.about)     spText += spData.about + '\n';
                        if (spData.location)  spText += '── Địa điểm ──\n' + spData.location + '\n';
                        if (spData.website)   spText += '── Website ──\n' + spData.website + '\n';
                        renderBio(bioHolder, spText.trim(), 'SocialProfile');
                    } else {
                        fetchMetaBio(pageUser, function(metaText) {
                            if (metaText) {
                                renderBio(bioHolder, metaText, 'Miraheze');
                            } else {
                                fetchWikiIntro(pageUser, function(wikiText) {
                                    if (wikiText) {
                                        renderBio(bioHolder, wikiText, null);
                                    } else {
                                        bioHolder.textContent = isOwn
                                            ? 'Bạn chưa có giới thiệu. Vào tab "Cài Đặt" để thêm.'
                                            : 'Thành viên chưa để lại giới thiệu.';
                                    }
                                });
                            }
                        });
                    }
                });
            }
            if (isOwn) {
                var editBtn = el('button', 'up-btn up-btn-sm');
                editBtn.textContent = '✎  Chỉnh sửa';
                editBtn.style.borderColor = accentColor; editBtn.style.color = accentColor;
                editBtn.addEventListener('click', function() {
                    var s = document.querySelector('.up-tab-btn[data-tab="settings"]');
                    if (s) s.click();
                });
                bioBody.appendChild(editBtn);
            }
            wrap.appendChild(bioCard);

            var infoCard = buildCard('// THÔNG TIN TÀI KHOẢN');
            var infoBody = infoCard.querySelector('.up-card-body');
            var tbl = el('table', 'up-info-table');
            var rows = [
                { k: 'Tên thành viên', v: pageUser.replace(/_/g, ' ') },
                { k: 'Cấp bậc',        v: meta.label },
                { k: 'Tier',           v: (meta.tier != null ? meta.tier + ' / ' + MAX_TIER : 'Đặc biệt') },
                { k: 'Nhóm quyền',     v: ownerGroups.filter(function(g) { return g !== '*'; }).join(', ') || '—' },
            ];
            if (ownerEditcount != null) rows.push({ k: 'Tổng sửa đổi', v: ownerEditcount.toLocaleString('vi-VN') });
            if (ownerRegistration) rows.push({ k: 'Ngày tham gia', v: new Date(ownerRegistration).toLocaleDateString('vi-VN') });
            rows.forEach(function(r) {
                var tr = document.createElement('tr');
                tr.innerHTML = '<td class="up-info-key">' + esc(r.k) + '</td><td class="up-info-val">' + esc(r.v) + '</td>';
                tbl.appendChild(tr);
            });
            infoBody.appendChild(tbl);
            wrap.appendChild(infoCard);

            var hierCard = buildCard('// CẤP BẬC WIKI');
            var hierBody = hierCard.querySelector('.up-card-body');
            var hierList = el('div', 'up-hierarchy');
            [
                { rank: 'founder',         label: 'Founder' },
                { rank: 'sysop',           label: 'Quản Trị Viên' },
                { rank: 'interface-admin', label: 'Lập Trình Viên' },
                { rank: 'reviewer',        label: 'Kiểm Duyệt Viên' },
                { rank: 'writer',          label: 'Writer' },
                { rank: 'member',          label: 'Thành Viên (confirmed)' },
                { rank: 'user',            label: 'Độc Giả (user)' },
            ].forEach(function(h) {
                var rm  = RANK_META[h.rank];
                var row = el('div', 'up-hier-row' + (h.rank === RANK ? ' current' : ''));
                if (h.rank === RANK) row.style.setProperty('--up-color', accentColor);
                var dot = el('span', 'up-hier-dot'); dot.style.background = rm.color;
                if (h.rank === RANK) dot.style.boxShadow = '0 0 8px ' + rm.glow;
                row.appendChild(dot);
                var lbl = el('span', 'up-hier-label'); lbl.textContent = h.label;
                if (h.rank === RANK) lbl.style.color = accentColor;
                row.appendChild(lbl);
                if (h.rank === RANK) {
                    var cur = el('span', 'up-hier-current'); cur.textContent = '← HIỆN TẠI'; cur.style.color = accentColor;
                    row.appendChild(cur);
                }
                hierList.appendChild(row);
            });
            hierBody.appendChild(hierList);
            wrap.appendChild(hierCard);

            var ctcCard = buildCard('// LIÊN HỆ');
            var ctcBody = ctcCard.querySelector('.up-card-body');
            var ctcList = el('div', 'up-contact-list');
            [
                { label: isOwn ? 'Mở MAPLE Chat' : 'Nhắn tin (MAPLE Chat)', icon: '💬', chat: true },
                { label: 'Gửi email',        href: '/wiki/%C4%90%E1%BA%B7c_bi%E1%BB%87t:G%E1%BB%ADi_th%C6%B0/' + encodeURIComponent(pageUser), icon: '✉' },
                { label: 'Đóng góp',         href: '/wiki/%C4%90%E1%BA%B7c_bi%E1%BB%87t:%C4%90%C3%B3ng_g%C3%B3p/' + encodeURIComponent(pageUser), icon: '◎' },
            ].forEach(function(lk) {
                var a = el('a', 'up-contact-item'); a.href = lk.href || '#';
                a.innerHTML = '<span class="up-contact-icon">' + lk.icon + '</span><span class="up-contact-label">' + esc(lk.label) + '</span><span class="up-contact-arrow">→</span>';
                if (lk.chat) {
                    a.addEventListener('click', function(e) {
                        e.preventDefault();
                        if (isOwn) { openMapleChat(viewerName); } else { openMapleChat(pageUser); }
                    });
                }
                ctcList.appendChild(a);
            });
            ctcBody.appendChild(ctcList);
            wrap.appendChild(ctcCard);

            return wrap;
        }

        /* ══ TAB: ĐÓNG GÓP — đồng bộ API thực ══ */
        function buildContribs() {
            var wrap = el('div', 'up-tab-content');

            /* Thống kê tổng quan */
            var statsCard = buildCard('// THỐNG KÊ');
            var statsBody = statsCard.querySelector('.up-card-body');
            var statsGrid = el('div', 'up-contrib-stats');
            [
                { label: 'TỔNG SỬA ĐỔI', value: ownerEditcount != null ? ownerEditcount.toLocaleString('vi-VN') : '—' },
                { label: 'NĂM THAM GIA',  value: ownerRegistration ? new Date(ownerRegistration).getFullYear() : '—' },
            ].forEach(function(s) {
                var item = el('div', 'up-contrib-stat-item');
                var v = el('div', 'up-contrib-stat-value'); txt(v, s.value); item.appendChild(v);
                var l = el('div', 'up-contrib-stat-label'); txt(l, s.label); item.appendChild(l);
                statsGrid.appendChild(item);
            });
            statsBody.appendChild(statsGrid);
            wrap.appendChild(statsCard);

            /* Đóng góp gần đây — fetch API */
            var recentCard = buildCard('// ĐÓNG GÓP GẦN ĐÂY',
                '/wiki/%C4%90%E1%BA%B7c_bi%E1%BB%87t:%C4%90%C3%B3ng_g%C3%B3p/' + encodeURIComponent(pageUser),
                'Xem tất cả →');
            var recentBody = recentCard.querySelector('.up-card-body');
            var loadMsg = el('p', 'up-prose up-muted'); loadMsg.textContent = '// Đang đồng bộ từ wiki…';
            recentBody.appendChild(loadMsg);
            wrap.appendChild(recentCard);

            API.get({
                action: 'query', list: 'usercontribs',
                ucuser: pageUser, uclimit: 15,
                ucprop: 'title|timestamp|comment|sizediff',
                format: 'json', formatversion: 2
            }).done(function(data) {
                recentBody.innerHTML = '';
                var contribs = (data.query && data.query.usercontribs) || [];
                if (!contribs.length) {
                    var noC = el('p', 'up-prose up-muted'); noC.textContent = 'Chưa có đóng góp nào.';
                    recentBody.appendChild(noC); return;
                }
                var list = el('div', 'up-contrib-list');
                contribs.forEach(function(c) {
                    var dt   = new Date(c.timestamp);
                    var dStr = dt.toLocaleDateString('vi-VN') + ' ' +
                        dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                    var diff      = c.sizediff !== undefined ? (c.sizediff > 0 ? '+' + c.sizediff : String(c.sizediff)) : '';
                    var diffColor = c.sizediff > 0 ? '#22c55e' : (c.sizediff < 0 ? '#ef4444' : '#52525b');
                    var item = el('div', 'up-contrib-item');
                    item.innerHTML =
                        '<a class="up-contrib-title" href="/wiki/' + encodeURIComponent(c.title.replace(/ /g,'_')) + '">' + esc(c.title) + '</a>' +
                        '<div class="up-contrib-meta">' +
                        '<span class="up-contrib-date">' + esc(dStr) + '</span>' +
                        (diff ? '<span class="up-contrib-diff" style="color:' + diffColor + '">' + esc(diff) + '</span>' : '') +
                        (c.comment ? '<span class="up-contrib-comment">' + esc(c.comment.slice(0, 100)) + '</span>' : '') +
                        '</div>';
                    list.appendChild(item);
                });
                recentBody.appendChild(list);
            }).fail(function() {
                recentBody.innerHTML = '';
                var errP = el('p', 'up-prose up-muted'); errP.textContent = 'Không thể tải đóng góp.';
                recentBody.appendChild(errP);
            });

            /* Công cụ nhanh */
            var toolCard = buildCard('// CÔNG CỤ');
            var toolList = el('div', 'up-contact-list');
            [
                { label: 'Nhật ký hành động',  href: '/wiki/%C4%90%E1%BA%B7c_bi%E1%BB%87t:Nh%E1%BA%ADt_k%C3%BD/' + encodeURIComponent(pageUser), icon: '▣' },
                { label: 'Trang đã tạo',       href: '/wiki/%C4%90%E1%BA%B7c_bi%E1%BB%87t:Trang_%C4%91%C6%B0%E1%BB%A3c_t%E1%BA%A1o_b%E1%BB%9Fi/' + encodeURIComponent(pageUser), icon: '⊞' },
                { label: 'Tệp đã tải lên',    href: '/wiki/%C4%90%E1%BA%B7c_bi%E1%BB%87t:T%E1%BB%87p_c%E1%BB%A7a/' + encodeURIComponent(pageUser), icon: '⊗' },
                { label: 'Bài chờ duyệt',      href: '/wiki/User:' + encodeURIComponent(pageUser) + '/Ch%E1%BB%9D_Duy%E1%BB%87t', icon: '⏳' },
            ].forEach(function(lk) {
                var a = el('a', 'up-contact-item'); a.href = lk.href;
                a.innerHTML = '<span class="up-contact-icon">' + lk.icon + '</span><span class="up-contact-label">' + esc(lk.label) + '</span><span class="up-contact-arrow">→</span>';
                toolList.appendChild(a);
            });
            toolCard.querySelector('.up-card-body').appendChild(toolList);
            wrap.appendChild(toolCard);

            return wrap;
        }

        /* ══ TAB: HUY HIỆU ══ */
        function buildBadges() {
            var wrap    = el('div', 'up-tab-content');
            var effTier = (meta.tier != null) ? meta.tier : 0; /* subrank: chưa mở badge tier */
            var earned  = ALL_BADGES.filter(function(b) { return effTier >= b.minTier; });
            var locked  = ALL_BADGES.filter(function(b) { return effTier <  b.minTier; });

            /* Rank card */
            var rankCard = el('div', 'up-card');
            rankCard.style.setProperty('--up-color', meta.color);
            var rankHead = el('div', 'up-card-head');
            var rankLbl  = el('span', 'up-card-label'); txt(rankLbl, '// CẤP BẬC HIỆN TẠI'); rankHead.appendChild(rankLbl);
            rankCard.appendChild(rankHead);
            var rankBody = el('div', 'up-card-body up-badge-rank-summary');
            rankBody.innerHTML =
                '<div class="up-clearance-level" style="color:' + meta.color + ';text-shadow:0 0 30px ' + meta.glow + '">' +
                (meta.tier != null ? 'TIER-' + meta.tier : esc(meta.badge)) + '</div>' +
                '<div class="up-clearance-name" style="color:' + meta.color + '">' + esc(meta.label) + '</div>' +
                '<div class="up-prose up-muted" style="margin:0">' + esc(meta.desc) + '</div>';
            rankCard.appendChild(rankBody);
            wrap.appendChild(rankCard);

            /* ── Thẻ ĐIỂM UY TÍN (RP) + Tier — từ AchievementCatalog ── */
            var CAT = window.MAPLE && window.MAPLE.catalog;
            if (CAT) {
                var rpCard = buildCard('// ĐIỂM UY TÍN (RP)');
                var rpBody = rpCard.querySelector('.up-card-body');
                var rpLoad = el('p', 'up-prose up-muted'); rpLoad.textContent = '// Đang tính RP…';
                rpBody.appendChild(rpLoad);
                wrap.appendChild(rpCard);

                API.get({
                    action: 'query', titles: 'MediaWiki:UserAchievements.json',
                    prop: 'revisions', rvprop: 'content', rvslots: 'main',
                    format: 'json', formatversion: 2
                }).done(function(resp) {
                    var data = {};
                    try {
                        var pg  = resp.query && resp.query.pages && resp.query.pages[0];
                        var rev = pg && pg.revisions && pg.revisions[0];
                        var t   = (rev && ((rev.slots && rev.slots.main && rev.slots.main.content) || rev.content || rev['*'])) || '{}';
                        data = JSON.parse(t);
                    } catch(e) {}
                    var central = data[pageUser.replace(/ /g, '_')] || data[pageUser] || [];
                    /* Gộp thành tựu TỰ GHI NHẬN của user (đồng bộ) rồi mới tính RP */
                    API.get({
                        action: 'query', titles: CAT.userAchPage(pageUser), prop: 'revisions',
                        rvprop: 'content', rvslots: 'main', format: 'json', formatversion: 2
                    }).done(function(r2) {
                        var earnedMap = {}, actionRP = 0;
                        try {
                            var p2 = r2.query && r2.query.pages && r2.query.pages[0];
                            var v2 = p2 && !p2.missing && p2.revisions && p2.revisions[0];
                            if (v2) {
                                var t2 = (v2.slots && v2.slots.main && v2.slots.main.content) || v2.content || '{}';
                                var j2 = JSON.parse(t2);
                                earnedMap = j2.earned || {};
                                actionRP = (j2.stats && j2.stats.rp) || 0;
                            }
                        } catch(e) {}
                        renderRP(CAT.mergeEarned(central, earnedMap), actionRP);
                    }).fail(function() { renderRP(central, 0); });

                    function renderRP(list, actionRP) {
                        actionRP = actionRP || 0;
                        var achRP = CAT.computeRP(list);
                        var rp   = achRP + actionRP;
                        var tier = CAT.tierOf(rp);
                        var next = CAT.nextTier(rp);
                        var pct  = next ? Math.max(4, Math.round((rp - tier.min) / (next.min - tier.min) * 100)) : 100;
                        rpBody.innerHTML = '';
                        var box = el('div', 'up-rp-box');
                        box.innerHTML =
                            '<div class="up-rp-main"><span class="up-rp-num">' + rp.toLocaleString('vi-VN') + '</span><span class="up-rp-unit">RP</span></div>' +
                            '<div class="up-rp-tier" style="color:' + tier.color + ';border-color:' + tier.color + '55">TIER ' + tier.n + ' · ' + esc(tier.label) + '</div>' +
                            '<div class="up-rp-bar"><div class="up-rp-fill" style="width:' + pct + '%;background:' + tier.color + ';box-shadow:0 0 8px ' + tier.color + '88"></div></div>' +
                            '<div class="up-rp-next">' + (next ? ('Còn ' + (next.min - rp).toLocaleString('vi-VN') + ' RP → Tier ' + next.n + ' ' + esc(next.label)) : 'Đã đạt Tier tối đa 👑') + '</div>' +
                            '<div class="up-rp-break">' + achRP.toLocaleString('vi-VN') + ' từ thành tựu · ' + actionRP.toLocaleString('vi-VN') + ' từ hoạt động</div>' +
                            '<div class="up-rp-note">Tier UY TÍN ≠ rank quyền — RP để hiển thị/ghi nhận, không mua quyền.</div>';
                        rpBody.appendChild(box);
                    }
                }).fail(function() {
                    rpBody.innerHTML = '';
                    var e = el('p', 'up-prose up-muted'); e.textContent = 'Không tính được RP.';
                    rpBody.appendChild(e);
                });
            }

            /* Badge grid (huy hiệu vai trò theo cấp bậc) */
            var badgeCard = buildCard('// HUY HIỆU VAI TRÒ — ' + earned.length + ' / ' + ALL_BADGES.length + ' MỞ KHÓA');
            var grid = el('div', 'up-badge-grid');
            earned.forEach(function(a) {
                var badge = el('div', 'up-badge');
                var icon  = el('div', 'up-badge-icon'); icon.style.color = meta.color; icon.style.textShadow = '0 0 10px ' + meta.glow; txt(icon, a.icon);
                badge.appendChild(icon);
                var lb = el('div', 'up-badge-label'); txt(lb, a.label); badge.appendChild(lb);
                var db = el('div', 'up-badge-desc');  txt(db, a.desc);  badge.appendChild(db);
                grid.appendChild(badge);
            });
            locked.forEach(function(a) {
                var badge = el('div', 'up-badge up-badge-locked');
                var lkI = el('div', 'up-badge-icon'); txt(lkI, '?'); badge.appendChild(lkI);
                var lkL = el('div', 'up-badge-label'); txt(lkL, '???'); badge.appendChild(lkL);
                var rk  = Object.keys(RANK_META).find(function(k) { return RANK_META[k].tier === a.minTier; }) || 'member';
                var lkD = el('div', 'up-badge-desc'); txt(lkD, 'Tier ' + a.minTier + ' — ' + RANK_META[rk].label); badge.appendChild(lkD);
                grid.appendChild(badge);
            });
            badgeCard.querySelector('.up-card-body').appendChild(grid);
            wrap.appendChild(badgeCard);

            return wrap;
        }

        /* ══ TAB: THÀNH TỰU — chỉ JSON trophies ══ */
        function buildRewards() {
            var wrap = el('div', 'up-tab-content');

            var trophyDesc = buildCard('// THÀNH TỰU ĐẶC BIỆT');
            var dp = el('p', 'up-prose up-muted');
            dp.textContent = 'Thành tựu được trao bởi ban quản trị M.A.P.L.E dựa trên đóng góp của thành viên.';
            trophyDesc.querySelector('.up-card-body').appendChild(dp);
            wrap.appendChild(trophyDesc);

            var loadCard = buildCard('// ĐANG TẢI…');
            wrap.appendChild(loadCard);

            API.get({
                action: 'query', titles: 'MediaWiki:UserAchievements.json',
                prop: 'revisions', rvprop: 'content', rvslots: 'main',
                format: 'json', formatversion: 2
            }).done(function(resp) {
                wrap.removeChild(loadCard);
                var data = {};
                try {
                    var pg  = resp.query && resp.query.pages && resp.query.pages[0];
                    var rev = pg && pg.revisions && pg.revisions[0];
                    var txt = rev && ((rev.slots && rev.slots.main && rev.slots.main.content) || rev.content || rev['*']) || '{}';
                    data = JSON.parse(txt);
                } catch(e) {}
                var CAT2 = window.MAPLE && window.MAPLE.catalog;
                var central = data[pageUser.replace(/ /g, '_')] || data[pageUser] || [];
                var RC = { common: '#71717a', uncommon: '#3b82f6', rare: '#22d3ee', epic: '#c084fc',
                    legendary: '#facc15', mythic: '#f472b6', ancient: '#2dd4bf', artifact: '#fb923c',
                    immortal: '#fb7185', exclusive: '#e879f9', ultimate: '#fda4af', relic: '#38bdf8', divine: '#fde68a' };
                var CAT_ORDER = ['Rank', 'Đóng Góp', 'Nội Dung', 'Cộng Đồng', 'Đặc Biệt'];

                /* Gộp thành tựu TỰ GHI NHẬN (đồng bộ) rồi mới hiển thị */
                if (CAT2) {
                    API.get({
                        action: 'query', titles: CAT2.userAchPage(pageUser), prop: 'revisions',
                        rvprop: 'content', rvslots: 'main', format: 'json', formatversion: 2
                    }).done(function(r2) {
                        var em = {};
                        try {
                            var p2 = r2.query && r2.query.pages && r2.query.pages[0];
                            var v2 = p2 && !p2.missing && p2.revisions && p2.revisions[0];
                            if (v2) { var t2 = (v2.slots && v2.slots.main && v2.slots.main.content) || v2.content || '{}'; em = (JSON.parse(t2).earned) || {}; }
                        } catch(e) {}
                        renderTrophies(CAT2.mergeEarned(central, em));
                    }).fail(function() { renderTrophies(central); });
                } else { renderTrophies(central); }

                function renderTrophies(trophies) {
                    if (!trophies.length) {
                        var ec = buildCard('// CHƯA CÓ THÀNH TỰU');
                        var ep = el('p', 'up-prose up-muted'); ep.textContent = 'Chưa có thành tựu nào. Hãy hoạt động để mở khoá!';
                        ec.querySelector('.up-card-body').appendChild(ep); wrap.appendChild(ec); return;
                    }

                    var sumCard  = buildCard('// TỔNG KẾT — ' + trophies.length + ' THÀNH TỰU');
                    var sumStats = el('div', 'up-trophy-summary');
                    var rarities = {};
                    trophies.forEach(function(t) { rarities[t.rarity || 'common'] = (rarities[t.rarity || 'common'] || 0) + 1; });
                    Object.keys(rarities).forEach(function(r) {
                        var chip = el('div', 'up-trophy-rarity-chip');
                        chip.style.borderColor = RC[r] || '#71717a'; chip.style.color = RC[r] || '#71717a';
                        chip.textContent = rarities[r] + '× ' + r.toUpperCase();
                        sumStats.appendChild(chip);
                    });
                    sumCard.querySelector('.up-card-body').appendChild(sumStats);
                    wrap.appendChild(sumCard);

                    var grouped = {};
                    trophies.forEach(function(t) { var c = t.category || 'Đặc Biệt'; if (!grouped[c]) grouped[c] = []; grouped[c].push(t); });
                    var cats = CAT_ORDER.filter(function(c) { return grouped[c]; });
                    Object.keys(grouped).forEach(function(c) { if (cats.indexOf(c) === -1) cats.push(c); });
                    cats.forEach(function(cat) {
                        var catCard = buildCard('// ' + cat.toUpperCase());
                        var tgrid   = el('div', 'up-trophy-grid');
                        grouped[cat].forEach(function(t) {
                            var rc   = RC[t.rarity || 'common'] || '#71717a';
                            var tile = el('div', 'up-trophy-tile');
                            tile.style.setProperty('--trophy-color', rc); tile.style.borderColor = rc + '44';
                            var ie = el('div', 'up-trophy-icon'); ie.style.color = rc; ie.style.textShadow = '0 0 12px ' + rc + '88'; ie.textContent = t.icon || '★';
                            var le = el('div', 'up-trophy-label'); le.textContent = t.label || '';
                            var de = el('div', 'up-trophy-desc');  de.textContent = t.desc  || '';
                            tile.appendChild(ie); tile.appendChild(le); tile.appendChild(de);
                            if (t.date) { var dte = el('div', 'up-trophy-date'); dte.textContent = t.date; tile.appendChild(dte); }
                            var re = el('div', 'up-trophy-rarity'); re.style.color = rc; re.textContent = (t.rarity || 'COMMON').toUpperCase();
                            tile.appendChild(re); tgrid.appendChild(tile);
                        });
                        catCard.querySelector('.up-card-body').appendChild(tgrid);
                        wrap.appendChild(catCard);
                    });
                }
            }).fail(function() {
                wrap.removeChild(loadCard);
                var errCard = buildCard('// LỖI TẢI DỮ LIỆU');
                var ep = el('p', 'up-prose up-muted'); ep.textContent = 'Không thể tải dữ liệu thành tựu.';
                errCard.querySelector('.up-card-body').appendChild(ep); wrap.appendChild(errCard);
            });
            return wrap;
        }

        /* ══ TAB: DONATE — nhận ủng hộ (bank / QR) ══ */
        function buildDonate(profile) {
            var wrap = el('div', 'up-tab-content');
            var d = (profile && profile.donate) || {};
            var who = pageUser.replace(/_/g, ' ');

            var head = buildCard('// ỦNG HỘ ' + who.toUpperCase());
            var intro = el('p', 'up-prose');
            intro.textContent = isOwn
                ? 'Thông tin nhận ủng hộ của bạn. Người xem có thể chuyển khoản hoặc quét QR để ủng hộ.'
                : 'Ủng hộ ' + who + ' qua chuyển khoản hoặc quét mã QR bên dưới. Cảm ơn bạn! ❤️';
            head.querySelector('.up-card-body').appendChild(intro);
            wrap.appendChild(head);

            var hasBank = d.bankName || d.accountNumber || d.accountHolder;
            if (!hasBank && !d.qrImage && !d.momo) {
                var ec = buildCard('// CHƯA CÓ THÔNG TIN');
                var ep = el('p', 'up-prose up-muted');
                ep.textContent = isOwn ? 'Bạn chưa nhập thông tin. Vào tab "Cài Đặt" → mục NHẬN ỦNG HỘ.'
                                       : 'Thành viên chưa cung cấp thông tin ủng hộ.';
                ec.querySelector('.up-card-body').appendChild(ep); wrap.appendChild(ec); return wrap;
            }

            function infoRow(parent, k, v) {
                var row = el('div', 'up-donate-row');
                var ke = el('span', 'up-donate-key'); ke.textContent = k;
                var ve = el('span', 'up-donate-val'); ve.textContent = v;
                var cp = el('button', 'up-donate-copy'); cp.textContent = '⧉'; cp.title = 'Sao chép';
                cp.addEventListener('click', function () { copyText(v, cp); });
                row.appendChild(ke); row.appendChild(ve); row.appendChild(cp); parent.appendChild(row);
            }

            if (hasBank) {
                var bankCard = buildCard('// CHUYỂN KHOẢN NGÂN HÀNG');
                var bb = bankCard.querySelector('.up-card-body');
                if (d.bankName)      infoRow(bb, 'Ngân hàng', d.bankName);
                if (d.accountNumber) infoRow(bb, 'Số tài khoản', d.accountNumber);
                if (d.accountHolder) infoRow(bb, 'Chủ tài khoản', d.accountHolder);
                wrap.appendChild(bankCard);
            }
            if (d.momo) {
                var momoCard = buildCard('// VÍ MOMO');
                infoRow(momoCard.querySelector('.up-card-body'), 'Số MoMo', d.momo);
                wrap.appendChild(momoCard);
            }
            if (d.qrImage) {
                var qrCard = buildCard('// QUÉT MÃ QR');
                var img = document.createElement('img');
                img.className = 'up-donate-qr'; img.src = d.qrImage; img.alt = 'Mã QR ủng hộ ' + who;
                img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
                qrCard.querySelector('.up-card-body').appendChild(img);
                wrap.appendChild(qrCard);
            }
            if (d.note) {
                var noteCard = buildCard('// LỜI NHẮN');
                var npp = el('p', 'up-prose'); npp.textContent = d.note;
                noteCard.querySelector('.up-card-body').appendChild(npp);
                wrap.appendChild(noteCard);
            }
            return wrap;
        }

        /* ══ TAB: LIÊN HỆ ══ */
        function buildContacts(profile) {
            var wrap     = el('div', 'up-tab-content');
            var contacts = (profile && Array.isArray(profile.contacts)) ? profile.contacts : [];
            var accentColor = profile.accentOverride || meta.color;

            if (!contacts.length) {
                var emptyCard = buildCard('// LIÊN HỆ CÁ NHÂN');
                var ep = el('p', 'up-prose up-muted');
                ep.textContent = isOwn
                    ? 'Bạn chưa thêm thông tin liên hệ. Vào tab "Cài Đặt" để thêm.'
                    : 'Thành viên này chưa có thông tin liên hệ.';
                emptyCard.querySelector('.up-card-body').appendChild(ep);
                if (isOwn) {
                    var toSettBtn = el('button', 'up-btn up-btn-sm');
                    toSettBtn.textContent = '⚙  Cài Đặt liên hệ';
                    toSettBtn.style.borderColor = accentColor; toSettBtn.style.color = accentColor;
                    toSettBtn.addEventListener('click', function() {
                        var s = document.querySelector('.up-tab-btn[data-tab="settings"]');
                        if (s) s.click();
                    });
                    emptyCard.querySelector('.up-card-body').appendChild(toSettBtn);
                }
                wrap.appendChild(emptyCard);
                return wrap;
            }

            var card = buildCard('// LIÊN HỆ — ' + pageUser.replace(/_/g, ' ').toUpperCase());
            var list = el('div', 'up-contact-list');
            contacts.forEach(function(c) {
                var pm = CONTACT_PLATFORMS[c.platform] || CONTACT_PLATFORMS.custom;
                var a  = el('a', 'up-contact-item');
                a.href   = c.url || '#';
                if (c.url && !c.url.startsWith('mailto:')) {
                    a.target = '_blank'; a.rel = 'noopener noreferrer';
                }
                var labelText = pm.label + (c.handle ? ' — ' + c.handle : '');
                a.innerHTML =
                    '<span class="up-contact-icon">' + esc(pm.icon) + '</span>' +
                    '<span class="up-contact-label">' + esc(labelText) + '</span>' +
                    '<span class="up-contact-arrow">→</span>';
                list.appendChild(a);
            });
            card.querySelector('.up-card-body').appendChild(list);
            wrap.appendChild(card);

            if (isOwn) {
                var editCard = buildCard('// QUẢN LÝ');
                var editBtn  = el('button', 'up-btn up-btn-sm');
                editBtn.textContent = '⚙  Quản lý liên hệ';
                editBtn.style.borderColor = accentColor; editBtn.style.color = accentColor;
                editBtn.addEventListener('click', function() {
                    var s = document.querySelector('.up-tab-btn[data-tab="settings"]');
                    if (s) s.click();
                });
                editCard.querySelector('.up-card-body').appendChild(editBtn);
                wrap.appendChild(editCard);
            }

            return wrap;
        }

        /* ══ TAB: BẠN BÈ ══ */
        function buildSocial(profile) {
            var wrap    = el('div', 'up-tab-content');
            var privacy = (profile && profile.privacy) ? profile.privacy : DEFAULT_PROFILE.privacy;

            if (!viewerLoggedIn) {
                var loginCard = buildCard('// YÊU CẦU ĐĂNG NHẬP');
                var lp = el('p', 'up-prose up-muted'); lp.textContent = 'Đăng nhập để kết bạn và nhắn tin với thành viên này.';
                var lb = el('a', 'up-btn up-btn-sm'); lb.href = mw.util.getUrl('Special:UserLogin'); lb.textContent = '→ Đăng nhập';
                loginCard.querySelector('.up-card-body').appendChild(lp);
                loginCard.querySelector('.up-card-body').appendChild(lb);
                wrap.appendChild(loginCard);
                return wrap;
            }

            if (isOwn) {
                /* Tải bạn bè từ SocialProfile (fallback localStorage) */
                var listCard = buildCard('// DANH SÁCH BẠN BÈ');
                var listBody = listCard.querySelector('.up-card-body');
                var fLoadMsg = el('p', 'up-prose up-muted'); fLoadMsg.textContent = 'Đang tải…';
                listBody.appendChild(fLoadMsg);
                wrap.appendChild(listCard);

                fetchSPFriends(viewerName, function(friends) {
                    listBody.innerHTML = '';
                    var hd = listCard.querySelector('.up-card-label');
                    if (hd) hd.textContent = '// DANH SÁCH BẠN BÈ — ' + friends.length + ' NGƯỜI';

                    if (!friends.length) {
                        var ep = el('p', 'up-prose up-muted');
                        ep.textContent = 'Bạn chưa kết bạn với ai. Ghé trang thành viên khác để kết bạn.';
                        listBody.appendChild(ep);
                    } else {
                        var fList = el('div', 'up-contact-list');
                        friends.forEach(function(fname) {
                            var row = el('div', 'up-social-friend-row');
                            var avWrapF = el('span', 'up-social-av');
                            avWrapF.textContent = fname.charAt(0).toUpperCase();
                            /* Thử load avatar nhỏ */
                            fetchAvatar(fname, null, function(url) {
                                if (url) {
                                    var img = document.createElement('img');
                                    img.src = url; img.className = 'up-social-av-img';
                                    img.onload  = function() { avWrapF.innerHTML = ''; avWrapF.appendChild(img); };
                                }
                            });
                            var fLink = el('a', 'up-contact-item');
                            fLink.href = '/wiki/User:' + encodeURIComponent(fname);
                            fLink.innerHTML = '<span class="up-contact-label">' + esc(fname) + '</span><span class="up-contact-arrow">→</span>';
                            var chatFBtn = el('button', 'up-btn up-btn-sm');
                            chatFBtn.textContent = '💬';
                            chatFBtn.title = 'Chat với ' + fname;
                            chatFBtn.addEventListener('click', function() {
                                if (window.MAPLEChat && window.MAPLEChat.openChatWith) {
                                    window.MAPLEChat.openChatWith(fname);
                                } else {
                                    window.location.href = mw.util.getUrl('Special:UserBoard/' + fname);
                                }
                            });
                            var rmBtn = el('button', 'up-btn up-btn-sm up-btn-ghost up-social-remove-btn');
                            rmBtn.textContent = '✕';
                            rmBtn.title = 'Xóa bạn bè';
                            rmBtn.addEventListener('click', function() {
                                spRemoveFriend(fname, function(ok, err) {
                                    if (err === 'redirect') {
                                        window.open(spRemoveRelationshipUrl(fname), '_blank');
                                        return;
                                    }
                                    removeFriend(fname);
                                    row.style.opacity = '0.4'; rmBtn.disabled = true;
                                });
                            });
                            row.appendChild(avWrapF); row.appendChild(fLink);
                            row.appendChild(chatFBtn); row.appendChild(rmBtn);
                            fList.appendChild(row);
                        });
                        listBody.appendChild(fList);
                    }
                });

                var chatCard = buildCard('// NHẮN TIN & CHAT');
                var chatList = el('div', 'up-contact-list');
                [
                    { label: 'Mở MAPLE Chat',                icon: '💬', chat: true },
                    { label: 'MAPLE Chat (toàn trang)',      href: '/wiki/Ng%C6%B0%E1%BB%9Di_d%C3%B9ng:' + encodeURIComponent(viewerName) + '/Chat', icon: '🗖' },
                    { label: 'User Board của tôi',           href: mw.util.getUrl('Special:UserBoard/' + viewerName), icon: '◫' },
                    { label: 'Bạn bè của tôi',               href: spViewRelationshipsUrl(viewerName), icon: '◈' },
                    { label: 'Lời mời kết bạn',              href: mw.util.getUrl('Special:ViewRelationshipRequests'), icon: '✉' },
                    { label: 'Danh sách thành viên',         href: '/wiki/D%E1%BB%B1_%C3%A1n:All_User', icon: '◎' },
                ].forEach(function(lk) {
                    var a = el('a', 'up-contact-item'); a.href = lk.href || '#';
                    a.innerHTML = '<span class="up-contact-icon">' + lk.icon + '</span><span class="up-contact-label">' + esc(lk.label) + '</span><span class="up-contact-arrow">→</span>';
                    if (lk.chat) {
                        a.addEventListener('click', function(e) { e.preventDefault(); openMapleChat(viewerName); });
                    }
                    chatList.appendChild(a);
                });
                chatCard.querySelector('.up-card-body').appendChild(chatList);
                wrap.appendChild(chatCard);

            } else {
                /* Xem trang người khác — hiện trạng thái kết bạn đầy đủ */
                var alreadyFriend = isFriend(pageUser);
                var allowFriends  = privacy.allowFriends  !== false;
                var allowMessages = privacy.allowMessages !== false;

                var actCard = buildCard('// KẾT NỐI VỚI ' + pageUser.replace(/_/g, ' ').toUpperCase());
                var actBody = actCard.querySelector('.up-card-body');
                var actRow  = el('div', 'up-social-action-row');

                if (allowFriends) {
                    var friendBtn2 = el('button', 'up-btn' + (alreadyFriend ? ' up-btn-ghost' : ''));
                    friendBtn2.style.borderColor = alreadyFriend ? '#52525b' : meta.color;
                    friendBtn2.style.color       = alreadyFriend ? '#52525b' : meta.color;
                    friendBtn2.textContent = alreadyFriend ? '◉  Đã kết bạn' : '◎  Kết bạn';
                    friendBtn2.addEventListener('click', function() {
                        friendBtn2.disabled = true;
                        if (isFriend(pageUser)) {
                            spRemoveFriend(pageUser, function(ok, err) {
                                if (err === 'redirect') {
                                    window.location.href = spRemoveRelationshipUrl(pageUser);
                                    return;
                                }
                                removeFriend(pageUser);
                                friendBtn2.textContent = '◎  Kết bạn';
                                friendBtn2.className = 'up-btn';
                                friendBtn2.style.borderColor = meta.color; friendBtn2.style.color = meta.color;
                                friendBtn2.disabled = false;
                            });
                        } else {
                            spAddFriend(pageUser, function(ok, err) {
                                if (err === 'redirect') {
                                    window.location.href = spAddRelationshipUrl(pageUser);
                                    return;
                                }
                                addFriend(pageUser);
                                friendBtn2.textContent = '◉  Đã kết bạn';
                                friendBtn2.className = 'up-btn up-btn-ghost';
                                friendBtn2.style.borderColor = '#52525b'; friendBtn2.style.color = '#52525b';
                                friendBtn2.disabled = false;
                            });
                        }
                    });
                    actRow.appendChild(friendBtn2);
                } else {
                    var noFriendNote = el('span', 'up-ha-disabled-note');
                    noFriendNote.textContent = '◎  Kết bạn (bị hạn chế)';
                    actRow.appendChild(noFriendNote);
                }

                if (allowMessages) {
                    /* Nút mở MAPLE Chat trực tiếp */
                    var chatBtn2 = el('button', 'up-btn up-btn-sm');
                    chatBtn2.style.borderColor = meta.color;
                    chatBtn2.style.color       = meta.color;
                    chatBtn2.textContent = '💬  Chat';
                    chatBtn2.addEventListener('click', function () {
                        openMapleChat(pageUser);
                    });
                    actRow.appendChild(chatBtn2);

                    /* User Board — SocialProfile */
                    var boardBtn = el('a', 'up-btn up-btn-sm up-btn-ghost');
                    boardBtn.href = mw.util.getUrl('Special:UserBoard/' + pageUser);
                    boardBtn.textContent = '◫  User Board';
                    actRow.appendChild(boardBtn);
                }

                actBody.appendChild(actRow);

                if (!allowFriends || !allowMessages) {
                    var privNote = el('p', 'up-prose up-muted'); privNote.style.marginTop = '0.75rem';
                    privNote.textContent = 'Thành viên này đã giới hạn một số tùy chọn kết nối.';
                    actBody.appendChild(privNote);
                }

                var noteP = el('p', 'up-prose up-muted'); noteP.style.marginTop = '0.5rem';
                noteP.textContent = 'Kết bạn lưu trên thiết bị này. Nhắn tin trực tiếp qua MAPLE Chat.';
                actBody.appendChild(noteP);
                wrap.appendChild(actCard);
            }

            return wrap;
        }

        /* ══ TAB: CÀI ĐẶT ══ */
        function buildSettings(profile) {
            var wrap = el('div', 'up-tab-content');

            if (!isOwn) {
                var noCard = buildCard('// CHỈ DÀNH CHO CHỦ TRANG');
                var np = el('p', 'up-prose up-muted'); np.textContent = 'Bạn chỉ có thể tùy chỉnh trang cá nhân của chính mình.';
                noCard.querySelector('.up-card-body').appendChild(np); wrap.appendChild(noCard);
                return wrap;
            }

            var accentColor = profile.accentOverride || meta.color;

            var bioCard = buildCard('// HỒ SƠ CÁ NHÂN');
            var bioForm = el('div', 'up-customize-form');

            var fillRow = el('div', 'up-form-group');
            var fillBtn = el('button', 'up-btn up-btn-sm up-btn-ghost'); fillBtn.style.marginTop = '0';
            fillBtn.textContent = '↓ Tự động điền từ trang Miraheze';
            var fillStatus = el('span', 'up-form-save-status'); fillStatus.style.marginLeft = '0.5rem';
            fillRow.appendChild(fillBtn); fillRow.appendChild(fillStatus);
            bioForm.appendChild(fillRow);

            var sloganGrp = el('div', 'up-form-group');
            var sloganLbl = el('label', 'up-form-label'); sloganLbl.textContent = 'Khẩu hiệu (slogan)';
            var sloganInp = el('input', 'up-form-input');
            sloganInp.type = 'text'; sloganInp.placeholder = 'VD: // Nhà văn tự do …'; sloganInp.maxLength = 100;
            sloganInp.value = profile.slogan || '';
            sloganGrp.appendChild(sloganLbl); sloganGrp.appendChild(sloganInp);
            bioForm.appendChild(sloganGrp);

            var bioGrp = el('div', 'up-form-group');
            var bioLbl  = el('label', 'up-form-label'); bioLbl.textContent = 'Giới thiệu bản thân';
            var bioTA   = el('textarea', 'up-form-textarea');
            bioTA.placeholder = 'Viết vài dòng về bản thân bạn…'; bioTA.rows = 5; bioTA.maxLength = 800;
            bioTA.value = profile.bio || '';
            var bioCount = el('span', 'up-form-count'); bioCount.textContent = (profile.bio || '').length + ' / 800';
            bioTA.addEventListener('input', function() { bioCount.textContent = bioTA.value.length + ' / 800'; });
            bioGrp.appendChild(bioLbl); bioGrp.appendChild(bioTA); bioGrp.appendChild(bioCount);
            bioForm.appendChild(bioGrp);

            fillBtn.addEventListener('click', function() {
                fillBtn.disabled = true; fillStatus.textContent = 'Đang tải từ Miraheze…'; fillStatus.style.color = '#71717a';
                fetchMetaBio(viewerName, function(text) {
                    if (text) {
                        bioTA.value = text.slice(0, 800); bioCount.textContent = bioTA.value.length + ' / 800';
                        fillStatus.textContent = '✓ Đã điền từ Miraheze!'; fillStatus.style.color = '#22c55e';
                    } else {
                        /* Fallback: thử trang User: trong wiki */
                        fetchWikiIntro(viewerName, function(text2) {
                            if (text2) {
                                bioTA.value = text2.slice(0, 800); bioCount.textContent = bioTA.value.length + ' / 800';
                                fillStatus.textContent = '✓ Đã điền từ trang User:'; fillStatus.style.color = '#22c55e';
                            } else {
                                fillStatus.textContent = 'Không tìm thấy giới thiệu nào.'; fillStatus.style.color = '#f59e0b';
                            }
                            fillBtn.disabled = false;
                        });
                        return;
                    }
                    fillBtn.disabled = false;
                });
            });

            bioCard.querySelector('.up-card-body').appendChild(bioForm);
            wrap.appendChild(bioCard);

            var colorCard = buildCard('// GIAO DIỆN TRANG');
            var colorForm = el('div', 'up-customize-form');

            var colorGrp = el('div', 'up-form-group');
            var colorLbl = el('label', 'up-form-label'); colorLbl.textContent = 'Màu accent (ghi đè màu rank)';
            var colorRow = el('div', 'up-form-color-row');
            var colorInp = el('input', 'up-form-color'); colorInp.type = 'color'; colorInp.value = profile.accentOverride || meta.color;
            var colorRst = el('button', 'up-btn up-btn-sm up-btn-ghost'); colorRst.textContent = '↺ Reset';
            colorRst.addEventListener('click', function() { colorInp.value = meta.color; });
            var presetRow = el('div', 'up-form-preset-row');
            ['#ef4444','#3b82f6','#8b5cf6','#10b981','#f59e0b','#06b6d4','#ec4899','#fbbf24'].forEach(function(pc) {
                var chip = el('button', 'up-form-preset-chip');
                chip.style.background = pc; chip.style.borderColor = pc; chip.title = pc;
                chip.addEventListener('click', function() { colorInp.value = pc; });
                presetRow.appendChild(chip);
            });
            colorRow.appendChild(colorInp); colorRow.appendChild(colorRst);
            colorGrp.appendChild(colorLbl); colorGrp.appendChild(colorRow); colorGrp.appendChild(presetRow);
            colorForm.appendChild(colorGrp);

            var bannerGrp = el('div', 'up-form-group');
            var bannerLbl = el('label', 'up-form-label'); bannerLbl.textContent = 'Banner đầu trang (CSS gradient, để trống để ẩn)';
            var bannerInp = el('input', 'up-form-input');
            bannerInp.type = 'text'; bannerInp.placeholder = 'VD: linear-gradient(135deg, #450a0a, #1e1b4b)';
            bannerInp.value = profile.bannerColor || '';
            bannerGrp.appendChild(bannerLbl); bannerGrp.appendChild(bannerInp);
            colorForm.appendChild(bannerGrp);

            /* Banner image URL */
            var bannerImgGrp = el('div', 'up-form-group');
            var bannerImgLbl = el('label', 'up-form-label'); bannerImgLbl.textContent = 'Ảnh banner (URL, hiển thị đằng sau gradient)';
            var bannerImgInp = el('input', 'up-form-input');
            bannerImgInp.type = 'text'; bannerImgInp.placeholder = 'https://example.com/banner.jpg';
            bannerImgInp.value = profile.bannerImage || '';
            var bannerImgPrev = el('div', 'up-form-banner-preview');
            if (profile.bannerImage) {
                bannerImgPrev.style.cssText = 'margin-top:6px;height:60px;border-radius:3px;border:1px solid #1a1a1a;background:url(' + JSON.stringify(profile.bannerImage) + ') center/cover no-repeat;';
            }
            bannerImgInp.addEventListener('input', function() {
                var url = bannerImgInp.value.trim();
                if (url) bannerImgPrev.style.cssText = 'margin-top:6px;height:60px;border-radius:3px;border:1px solid #1a1a1a;background:url(' + JSON.stringify(url) + ') center/cover no-repeat;';
                else bannerImgPrev.style.cssText = '';
            });
            bannerImgGrp.appendChild(bannerImgLbl); bannerImgGrp.appendChild(bannerImgInp);
            bannerImgGrp.appendChild(bannerImgPrev);
            colorForm.appendChild(bannerImgGrp);

            /* Font selection */
            var fontGrp = el('div', 'up-form-group');
            var fontLbl = el('label', 'up-form-label'); fontLbl.textContent = 'Font chữ trang cá nhân';
            var fontSel = el('select', 'up-form-input up-form-select');
            var FONTS = [
                { value: '',                    label: 'Mặc định (JetBrains Mono)' },
                { value: 'Inter',               label: 'Inter (Sans-serif sạch)' },
                { value: 'Roboto Mono',         label: 'Roboto Mono (Monospace)' },
                { value: 'Merriweather',        label: 'Merriweather (Serif cổ điển)' },
                { value: 'Fira Code',           label: 'Fira Code (Code ligature)' },
            ];
            FONTS.forEach(function(f) {
                var opt = document.createElement('option'); opt.value = f.value; opt.textContent = f.label;
                if ((profile.fontFamily || '') === f.value) opt.selected = true;
                fontSel.appendChild(opt);
            });
            fontGrp.appendChild(fontLbl); fontGrp.appendChild(fontSel);
            colorForm.appendChild(fontGrp);

            /* Theme presets */
            var themeGrp = el('div', 'up-form-group');
            var themeLbl = el('label', 'up-form-label'); themeLbl.textContent = 'Theme preset';
            var THEME_PRESETS = [
                { name: 'Mặc định',   accent: '', banner: '' },
                { name: 'Máu',        accent: '#dc2626', banner: 'linear-gradient(135deg,#450a0a,#1a0000)' },
                { name: 'Đại Dương',  accent: '#06b6d4', banner: 'linear-gradient(135deg,#083344,#164e63)' },
                { name: 'Tím Galaxy', accent: '#8b5cf6', banner: 'linear-gradient(135deg,#1e1b4b,#0f0720)' },
                { name: 'Rừng',       accent: '#10b981', banner: 'linear-gradient(135deg,#052e16,#0a1a0a)' },
                { name: 'Hoàng Kim',  accent: '#fbbf24', banner: 'linear-gradient(135deg,#1c0a00,#3d2800)' },
            ];
            var themeRow = el('div', 'up-theme-presets');
            THEME_PRESETS.forEach(function(t) {
                var chip = el('button', 'up-theme-chip');
                chip.title = t.name;
                chip.innerHTML = '<span class="up-theme-chip-dot" style="background:' + (t.accent || meta.color) + '"></span>' + t.name;
                chip.addEventListener('click', function() {
                    if (t.accent) colorInp.value = t.accent;
                    else colorInp.value = meta.color;
                    if (t.banner) bannerInp.value = t.banner;
                    themeRow.querySelectorAll('.up-theme-chip').forEach(function(c) { c.classList.remove('active'); });
                    chip.classList.add('active');
                });
                themeRow.appendChild(chip);
            });
            themeGrp.appendChild(themeLbl); themeGrp.appendChild(themeRow);
            colorForm.appendChild(themeGrp);

            colorCard.querySelector('.up-card-body').appendChild(colorForm);
            wrap.appendChild(colorCard);

            /* ── Card: Status / Mood ── */
            var statusCard = buildCard('// STATUS & MOOD');
            var statusForm = el('div', 'up-customize-form');
            var statusNote = el('p', 'up-prose up-muted');
            statusNote.textContent = 'Hiển thị trạng thái hoặc câu trạng thái ngắn dưới tên trong hero.';
            statusForm.appendChild(statusNote);

            var moodEmojiGrp = el('div', 'up-form-group');
            var moodEmojiLbl = el('label', 'up-form-label'); moodEmojiLbl.textContent = 'Emoji trạng thái';
            var moodEmojiInp = el('input', 'up-form-input');
            moodEmojiInp.type = 'text'; moodEmojiInp.placeholder = 'VD: 🔥 💻 ✍️'; moodEmojiInp.maxLength = 4;
            moodEmojiInp.value = profile.statusEmoji || '';
            moodEmojiInp.style.width = '80px';
            var QUICK_EMOJIS = ['🔥','💻','✍️','📖','🎮','🎵','😴','🏃','🌙','⚡','🌿','🎯'];
            var emojiRow = el('div', 'up-emoji-quick-row');
            QUICK_EMOJIS.forEach(function(e) {
                var btn = el('button', 'up-emoji-quick-btn'); btn.textContent = e; btn.type = 'button';
                btn.addEventListener('click', function() { moodEmojiInp.value = e; });
                emojiRow.appendChild(btn);
            });
            moodEmojiGrp.appendChild(moodEmojiLbl); moodEmojiGrp.appendChild(moodEmojiInp);
            moodEmojiGrp.appendChild(emojiRow);
            statusForm.appendChild(moodEmojiGrp);

            var moodTextGrp = el('div', 'up-form-group');
            var moodTextLbl = el('label', 'up-form-label'); moodTextLbl.textContent = 'Câu trạng thái';
            var moodTextInp = el('input', 'up-form-input');
            moodTextInp.type = 'text'; moodTextInp.placeholder = 'VD: Đang viết hồ sơ mới…'; moodTextInp.maxLength = 80;
            moodTextInp.value = profile.statusMood || '';
            moodTextGrp.appendChild(moodTextLbl); moodTextGrp.appendChild(moodTextInp);
            statusForm.appendChild(moodTextGrp);

            statusCard.querySelector('.up-card-body').appendChild(statusForm);
            wrap.appendChild(statusCard);

            /* ── Card: Bố cục trang ── */
            var layoutCard = buildCard('// BỐ CỤC TRANG');
            var layoutForm = el('div', 'up-customize-form');
            var layoutLbl = el('label', 'up-form-label'); layoutLbl.textContent = 'Kiểu hero header';
            var LAYOUTS = [
                { value: 'default',  label: 'Mặc định',  desc: 'Avatar trái, thông tin phải' },
                { value: 'centered', label: 'Căn giữa',  desc: 'Avatar + thông tin căn giữa' },
                { value: 'minimal',  label: 'Tối giản',  desc: 'Chỉ tên + rank, không stats' },
            ];
            var layoutGrid = el('div', 'up-layout-grid');
            var layoutInputs = {};
            LAYOUTS.forEach(function(ly) {
                var opt = el('label', 'up-layout-opt' + ((profile.headerLayout || 'default') === ly.value ? ' active' : ''));
                var radio = el('input'); radio.type = 'radio'; radio.name = 'up-layout'; radio.value = ly.value;
                radio.checked = (profile.headerLayout || 'default') === ly.value;
                layoutInputs[ly.value] = radio;
                radio.addEventListener('change', function() {
                    layoutGrid.querySelectorAll('.up-layout-opt').forEach(function(o) { o.classList.remove('active'); });
                    opt.classList.add('active');
                });
                var optTitle = el('span', 'up-layout-opt-title'); optTitle.textContent = ly.label;
                var optDesc = el('span', 'up-layout-opt-desc'); optDesc.textContent = ly.desc;
                opt.appendChild(radio); opt.appendChild(optTitle); opt.appendChild(optDesc);
                layoutGrid.appendChild(opt);
            });
            layoutForm.appendChild(layoutLbl); layoutForm.appendChild(layoutGrid);
            layoutCard.querySelector('.up-card-body').appendChild(layoutForm);
            wrap.appendChild(layoutCard);

            /* ── Card: Widget hiển thị ── */
            var widgetCard = buildCard('// WIDGET & HIỂN THỊ');
            var widgetForm = el('div', 'up-customize-form');
            var widgetNote = el('p', 'up-prose up-muted');
            widgetNote.textContent = 'Chọn các widget hiển thị trên trang cá nhân của bạn.';
            widgetForm.appendChild(widgetNote);

            var currentWidgets = profile.widgets || {};
            var WIDGET_TOGGLES = [
                { key: 'showStats',        label: 'Thống kê (sửa đổi, ngày tham gia)' },
                { key: 'showBadges',       label: 'Huy hiệu trong tổng quan' },
                { key: 'showActiveFlair',  label: 'Hiệu ứng avatar theo rank cao' },
                { key: 'showJoinDate',     label: 'Ngày tham gia trong hero' },
                { key: 'showStatus',       label: 'Hiện status / mood trong hero' },
                { key: 'showContribGraph', label: 'Biểu đồ đóng góp (tính năng thử nghiệm)' },
            ];
            var widgetInputs = {};
            WIDGET_TOGGLES.forEach(function(tg) {
                var row = el('div', 'up-form-toggle-row');
                var lbl = el('label', 'up-form-toggle-label');
                var chk = el('input', 'up-form-toggle'); chk.type = 'checkbox';
                chk.checked = currentWidgets[tg.key] !== false; /* default true */
                widgetInputs[tg.key] = chk;
                var span = document.createElement('span'); span.textContent = tg.label;
                lbl.appendChild(chk); lbl.appendChild(span); row.appendChild(lbl); widgetForm.appendChild(row);
            });
            widgetCard.querySelector('.up-card-body').appendChild(widgetForm);
            wrap.appendChild(widgetCard);

            var privCard = buildCard('// QUYỀN RIÊNG TƯ');
            var privForm = el('div', 'up-customize-form');
            var privNote2 = el('p', 'up-prose up-muted');
            privNote2.textContent = 'Cài đặt riêng tư lưu lên wiki — có hiệu lực khi người khác xem trang của bạn.';
            privForm.appendChild(privNote2);

            var currentPrivacy = (profile && profile.privacy) ? profile.privacy : DEFAULT_PROFILE.privacy;
            var PRIV_TOGGLES = [
                { key: 'allowFriends',   label: 'Cho phép người khác kết bạn với tôi' },
                { key: 'allowMessages',  label: 'Cho phép người lạ nhắn tin (MAPLE Chat)' },
                { key: 'showInList',     label: 'Hiển thị trong danh sách thành viên' },
                { key: 'showFriendList', label: 'Cho phép người khác xem danh sách bạn bè' },
            ];
            var privInputs = {};
            PRIV_TOGGLES.forEach(function(tg) {
                var row = el('div', 'up-form-toggle-row');
                var lbl = el('label', 'up-form-toggle-label');
                var chk = el('input', 'up-form-toggle'); chk.type = 'checkbox'; chk.checked = currentPrivacy[tg.key] !== false;
                privInputs[tg.key] = chk;
                var span = document.createElement('span'); span.textContent = tg.label;
                lbl.appendChild(chk); lbl.appendChild(span); row.appendChild(lbl); privForm.appendChild(row);
            });
            privCard.querySelector('.up-card-body').appendChild(privForm);
            wrap.appendChild(privCard);

            /* ── Hồ sơ xã hội (SocialProfile) — toàn bộ trang đặc biệt thật ── */
            var spCard = buildCard('// HỒ SƠ XÃ HỘI');
            var spList = el('div', 'up-contact-list');
            [
                { label: 'Đổi ảnh đại diện (Avatar)',  href: mw.util.getUrl('Special:UploadAvatar'),               icon: '🖼' },
                { label: 'Chỉnh sửa hồ sơ',            href: mw.util.getUrl('Special:EditProfile'),                icon: '✎' },
                { label: 'Cập nhật thông tin hồ sơ',   href: mw.util.getUrl('Special:UpdateProfile'),              icon: '↻' },
                { label: 'Bạn bè của tôi',             href: spViewRelationshipsUrl(viewerName),                   icon: '◈' },
                { label: 'Lời mời kết bạn',            href: mw.util.getUrl('Special:ViewRelationshipRequests'),   icon: '✉' },
                { label: 'User Board của tôi',         href: mw.util.getUrl('Special:UserBoard/' + viewerName),    icon: '◫' },
                { label: 'Gửi tin hàng loạt (Blast)',  href: mw.util.getUrl('Special:SendBoardBlast'),             icon: '📢' },
                { label: 'Quà tặng của tôi',           href: mw.util.getUrl('Special:ViewGifts'),                  icon: '🎁' },
                { label: 'Bảng xếp hạng thành viên',   href: mw.util.getUrl('Special:TopUsers'),                   icon: '★' },
                { label: 'Chuyển kiểu trang cá nhân',  href: mw.util.getUrl('Special:ToggleUserPage'),             icon: '⇄' },
            ].forEach(function(lk) {
                var a = el('a', 'up-contact-item'); a.href = lk.href;
                a.innerHTML = '<span class="up-contact-icon">' + lk.icon + '</span><span class="up-contact-label">' + esc(lk.label) + '</span><span class="up-contact-arrow">→</span>';
                spList.appendChild(a);
            });
            spCard.querySelector('.up-card-body').appendChild(spList);
            wrap.appendChild(spCard);

            var wikiCard = buildCard('// TÀI KHOẢN WIKI');
            var wikiList = el('div', 'up-contact-list');
            [
                { label: 'Tùy chọn tài khoản',        href: mw.util.getUrl('Special:Preferences'), icon: '⚙' },
                { label: 'Hồ sơ Miraheze',             href: 'https://meta.miraheze.org/wiki/User:' + encodeURIComponent(viewerName), icon: '◈' },
                { label: 'Đổi mật khẩu',               href: mw.util.getUrl('Special:ChangePassword'), icon: '🔑' },
                { label: 'Bài chờ duyệt của tôi',      href: '/wiki/User:' + encodeURIComponent(viewerName) + '/Ch%E1%BB%9D_Duy%E1%BB%87t', icon: '⏳' },
            ].forEach(function(lk) {
                var a = el('a', 'up-contact-item'); a.href = lk.href;
                a.innerHTML = '<span class="up-contact-icon">' + lk.icon + '</span><span class="up-contact-label">' + esc(lk.label) + '</span><span class="up-contact-arrow">→</span>';
                wikiList.appendChild(a);
            });
            wikiCard.querySelector('.up-card-body').appendChild(wikiList);
            wrap.appendChild(wikiCard);

            /* ── Liên Hệ Cá Nhân ── */
            var currentContacts = (profile.contacts && Array.isArray(profile.contacts))
                ? profile.contacts.map(function(c) { return Object.assign({}, c); })
                : [];

            var contactCard = buildCard('// LIÊN HỆ CÁ NHÂN');
            var contactForm = el('div', 'up-customize-form');

            /* Toggle hiện/ẩn tab */
            var scRow = el('div', 'up-form-toggle-row');
            var scLbl = el('label', 'up-form-toggle-label');
            var showContactsChk = el('input', 'up-form-toggle');
            showContactsChk.type = 'checkbox'; showContactsChk.checked = profile.showContacts === true;
            var scSpan = document.createElement('span'); scSpan.textContent = 'Hiện tab Liên Hệ trên hồ sơ của tôi';
            scLbl.appendChild(showContactsChk); scLbl.appendChild(scSpan); scRow.appendChild(scLbl);
            contactForm.appendChild(scRow);

            /* Danh sách hiện tại */
            var contactsListEl = el('div', 'up-contacts-manage-list');
            function renderContactsList() {
                contactsListEl.innerHTML = '';
                if (!currentContacts.length) {
                    var noC = el('p', 'up-prose up-muted'); noC.style.margin = '0.5rem 0';
                    noC.textContent = 'Chưa có liên hệ nào.'; contactsListEl.appendChild(noC); return;
                }
                currentContacts.forEach(function(c, i) {
                    var pm  = CONTACT_PLATFORMS[c.platform] || CONTACT_PLATFORMS.custom;
                    var row = el('div', 'up-contacts-manage-row');
                    row.innerHTML =
                        '<span class="up-cm-icon">' + esc(pm.icon) + '</span>' +
                        '<span class="up-cm-platform">' + esc(pm.label) + '</span>' +
                        '<span class="up-cm-url">' + esc(c.handle || c.url || '') + '</span>';
                    var rmBtn = el('button', 'up-btn up-btn-sm up-btn-ghost');
                    rmBtn.textContent = '✕'; rmBtn.style.marginTop = '0';
                    rmBtn.addEventListener('click', function() {
                        currentContacts.splice(i, 1); renderContactsList();
                    });
                    row.appendChild(rmBtn);
                    contactsListEl.appendChild(row);
                });
            }
            renderContactsList();
            contactForm.appendChild(contactsListEl);

            /* Thêm liên hệ mới */
            var addContactNote = el('p', 'up-form-label'); addContactNote.style.marginTop = '0.75rem';
            addContactNote.textContent = 'THÊM LIÊN HỆ MỚI';
            contactForm.appendChild(addContactNote);

            var addRow = el('div', 'up-contacts-add-row');
            var platformSel = el('select', 'up-form-input up-form-select');
            Object.keys(CONTACT_PLATFORMS).forEach(function(key) {
                var opt = document.createElement('option'); opt.value = key;
                opt.textContent = CONTACT_PLATFORMS[key].label; platformSel.appendChild(opt);
            });
            var handleInp = el('input', 'up-form-input');
            handleInp.type = 'text'; handleInp.placeholder = 'Tên người dùng hoặc URL đầy đủ…';
            var addBtn = el('button', 'up-btn up-btn-sm');
            addBtn.textContent = '+ Thêm'; addBtn.style.borderColor = accentColor; addBtn.style.color = accentColor;
            addBtn.style.marginTop = '0';
            addBtn.addEventListener('click', function() {
                var platform = platformSel.value;
                var handle   = handleInp.value.trim();
                if (!handle) return;
                var pm  = CONTACT_PLATFORMS[platform] || CONTACT_PLATFORMS.custom;
                var url = pm.prefix ? pm.prefix + handle : handle;
                currentContacts.push({ platform: platform, handle: handle, url: url });
                handleInp.value = '';
                renderContactsList();
            });
            addRow.appendChild(platformSel);
            addRow.appendChild(handleInp);
            addRow.appendChild(addBtn);
            contactForm.appendChild(addRow);

            contactCard.querySelector('.up-card-body').appendChild(contactForm);
            wrap.appendChild(contactCard);

            /* ── NHẬN ỦNG HỘ (DONATE) — mặc định TẮT, gate theo quyền/đóng góp ── */
            var donateCard = buildCard('// NHẬN ỦNG HỘ (DONATE)');
            var donateBody = donateCard.querySelector('.up-card-body');
            var dprof = (profile && profile.donate) || {};
            var donateCanEnable = false;

            var dGate = el('p', 'up-prose up-muted'); dGate.textContent = '⏳ Đang kiểm tra điều kiện…';
            donateBody.appendChild(dGate);

            var dForm = el('div', 'up-customize-form'); dForm.style.display = 'none';

            var dToggleRow = el('div', 'up-form-toggle-row');
            var dToggleLbl = el('label', 'up-form-toggle-label');
            var donateEnabledChk = el('input', 'up-form-toggle'); donateEnabledChk.type = 'checkbox';
            donateEnabledChk.checked = dprof.enabled === true;
            var dToggleSpan = document.createElement('span'); dToggleSpan.textContent = 'Bật tab Donate trên trang của tôi';
            dToggleLbl.appendChild(donateEnabledChk); dToggleLbl.appendChild(dToggleSpan);
            dToggleRow.appendChild(dToggleLbl); dForm.appendChild(dToggleRow);

            function dField(labelText, ph, val) {
                var grp = el('div', 'up-form-group');
                var lb  = el('label', 'up-form-label'); lb.textContent = labelText;
                var inp = el('input', 'up-form-input'); inp.type = 'text'; inp.placeholder = ph; inp.value = val || '';
                grp.appendChild(lb); grp.appendChild(inp); dForm.appendChild(grp);
                return inp;
            }
            var bankNameInp  = dField('Ngân hàng', 'VD: Vietcombank', dprof.bankName);
            var accNumInp    = dField('Số tài khoản', 'VD: 0123456789', dprof.accountNumber);
            var accHolderInp = dField('Chủ tài khoản', 'VD: NGUYEN VAN A', dprof.accountHolder);
            var momoInp      = dField('Ví MoMo (tuỳ chọn)', 'VD: 09xxxxxxxx', dprof.momo);
            var qrInp        = dField('Ảnh QR (URL, tuỳ chọn)', 'https://…/qr.png', dprof.qrImage);
            var dQrPrev = el('div', 'up-form-banner-preview');
            if (dprof.qrImage) dQrPrev.style.cssText = 'margin-top:6px;height:90px;width:90px;border-radius:3px;border:1px solid #1a1a1a;background:url(' + JSON.stringify(dprof.qrImage) + ') center/contain no-repeat;';
            qrInp.addEventListener('input', function () {
                var u = qrInp.value.trim();
                dQrPrev.style.cssText = u ? 'margin-top:6px;height:90px;width:90px;border-radius:3px;border:1px solid #1a1a1a;background:url(' + JSON.stringify(u) + ') center/contain no-repeat;' : '';
            });
            dForm.appendChild(dQrPrev);

            var dNoteGrp = el('div', 'up-form-group');
            var dNoteLbl = el('label', 'up-form-label'); dNoteLbl.textContent = 'Lời nhắn (tuỳ chọn)';
            var dNoteTA  = el('textarea', 'up-form-textarea'); dNoteTA.rows = 3; dNoteTA.maxLength = 300;
            dNoteTA.placeholder = 'VD: Cảm ơn bạn đã ủng hộ wiki ❤️'; dNoteTA.value = dprof.note || '';
            dNoteGrp.appendChild(dNoteLbl); dNoteGrp.appendChild(dNoteTA); dForm.appendChild(dNoteGrp);
            donateBody.appendChild(dForm);
            wrap.appendChild(donateCard);

            API.get({
                action: 'query', titles: 'MediaWiki:UserAchievements.json',
                prop: 'revisions', rvprop: 'content', rvslots: 'main', format: 'json', formatversion: 2
            }).done(function (resp) {
                var data = {};
                try {
                    var pg  = resp.query && resp.query.pages && resp.query.pages[0];
                    var rev = pg && pg.revisions && pg.revisions[0];
                    var t   = (rev && ((rev.slots && rev.slots.main && rev.slots.main.content) || rev.content || rev['*'])) || '{}';
                    data = JSON.parse(t);
                } catch (e) {}
                var list = data[viewerName.replace(/ /g, '_')] || data[viewerName] || [];
                donateCanEnable = donateEligible(RANK, list);
                if (donateCanEnable) {
                    dGate.textContent = '✓ Bạn đủ điều kiện bật Donate (' +
                        (DONATE_ADMIN_RANKS[RANK] ? 'Admin' : 'Writer/KDV ≥10 bài đã duyệt') + ').';
                    dGate.style.color = '#22c55e';
                    dForm.style.display = '';
                } else {
                    dGate.innerHTML = '🔒 Chỉ <b>Admin</b> hoặc <b>Writer/KDV có ≥10 bài chất lượng (đã duyệt)</b> ' +
                        'mới bật được tab Donate. Cứ tiếp tục đóng góp nhé!';
                    donateEnabledChk.checked = false;
                }
            }).fail(function () { dGate.textContent = 'Không kiểm tra được điều kiện (thử lại sau).'; });

            /* ── Save ── */
            var saveCard = buildCard('// LƯU THAY ĐỔI');
            var saveRow  = el('div', 'up-form-save-row');
            var saveBtn  = el('button', 'up-btn');
            saveBtn.textContent = '✓  Lưu & đồng bộ lên wiki';
            saveBtn.style.borderColor = accentColor; saveBtn.style.color = accentColor;
            var saveStatus = el('span', 'up-form-save-status');

            saveBtn.addEventListener('click', function() {
                saveBtn.disabled = true; saveStatus.textContent = 'Đang lưu…'; saveStatus.style.color = '#71717a';
                var privData = {};
                PRIV_TOGGLES.forEach(function(tg) { privData[tg.key] = privInputs[tg.key].checked; });
                var widgetData = {};
                WIDGET_TOGGLES.forEach(function(tg) { widgetData[tg.key] = widgetInputs[tg.key].checked; });
                var selectedLayout = 'default';
                Object.keys(layoutInputs).forEach(function(k) { if (layoutInputs[k].checked) selectedLayout = k; });
                var newProfile = {
                    bio:            bioTA.value.trim(),
                    slogan:         sloganInp.value.trim(),
                    accentOverride: colorInp.value !== meta.color ? colorInp.value : '',
                    bannerColor:    bannerInp.value.trim(),
                    bannerImage:    bannerImgInp.value.trim(),
                    fontFamily:     fontSel.value,
                    statusEmoji:    moodEmojiInp.value.trim(),
                    statusMood:     moodTextInp.value.trim(),
                    headerLayout:   selectedLayout,
                    widgets:        widgetData,
                    contacts:       currentContacts,
                    showContacts:   showContactsChk.checked,
                    privacy:        privData,
                    donate: {
                        enabled:       donateCanEnable && donateEnabledChk.checked,
                        bankName:      bankNameInp.value.trim(),
                        accountNumber: accNumInp.value.trim(),
                        accountHolder: accHolderInp.value.trim(),
                        qrImage:       qrInp.value.trim(),
                        momo:          momoInp.value.trim(),
                        note:          dNoteTA.value.trim(),
                    },
                };
                saveProfile(newProfile, function() {
                    var root = document.querySelector('.up-root');
                    if (root) root.style.setProperty('--up-color', newProfile.accentOverride || meta.color);
                    
                    if (window.MAPLE && window.MAPLE.award) {
                        if (newProfile.accentOverride || newProfile.bannerColor || newProfile.bannerImage) {
                            window.MAPLE.award('decorator');
                        }
                        if (newProfile.donate && newProfile.donate.enabled) {
                            window.MAPLE.award('generous_soul');
                        }
                    }

                    saveStatus.textContent = '✓ Đã lưu lên wiki!'; saveStatus.style.color = '#22c55e';
                    saveBtn.disabled = false;
                    setTimeout(function() { saveStatus.textContent = ''; }, 4000);
                }, function(err) {
                    saveStatus.textContent = '✗ Lỗi: ' + err; saveStatus.style.color = '#ef4444';
                    saveBtn.disabled = false;
                });
            });

            saveRow.appendChild(saveBtn); saveRow.appendChild(saveStatus);
            saveCard.querySelector('.up-card-body').appendChild(saveRow);
            wrap.appendChild(saveCard);

            return wrap;
        }

        /* ── Verification & Account Status Helpers ── */
        function fetchVerificationStatus(callback) {
            var status = {
                email: '',
                emailVerified: false,
                accountAgeDays: 0,
                rp: 0
            };

            API.get({
                action: 'query',
                meta: 'userinfo',
                uiprop: 'email|registration',
                format: 'json',
                formatversion: 2
            }).done(function (uinfoResp) {
                var uinfo = uinfoResp.query && uinfoResp.query.userinfo;
                if (uinfo) {
                    status.email = uinfo.email || '';
                    status.emailVerified = !!uinfo.emailauthenticated;
                    
                    var regDate = uinfo.registration ? new Date(uinfo.registration) : new Date();
                    status.accountAgeDays = Math.floor((new Date() - regDate) / (1000 * 60 * 60 * 24));
                }

                var CAT = window.MAPLE && window.MAPLE.catalog;
                if (!CAT) {
                    callback(status);
                    return;
                }

                API.get({
                    action: 'query',
                    titles: 'MediaWiki:UserAchievements.json',
                    prop: 'revisions',
                    rvprop: 'content',
                    rvslots: 'main',
                    format: 'json',
                    formatversion: 2
                }).done(function (achResp) {
                    var data = {};
                    try {
                        var pg  = achResp.query && achResp.query.pages && achResp.query.pages[0];
                        var rev = pg && pg.revisions && pg.revisions[0];
                        var t   = (rev && ((rev.slots && rev.slots.main && rev.slots.main.content) || rev.content || rev['*'])) || '{}';
                        data = JSON.parse(t);
                    } catch (e) {}

                    var central = data[viewerName.replace(/ /g, '_')] || data[viewerName] || [];

                    API.get({
                        action: 'query',
                        titles: CAT.userAchPage(viewerName),
                        prop: 'revisions',
                        rvprop: 'content',
                        rvslots: 'main',
                        format: 'json',
                        formatversion: 2
                    }).done(function (r2) {
                        var earnedMap = {}, actionRP = 0;
                        try {
                            var p2 = r2.query && r2.query.pages && r2.query.pages[0];
                            var v2 = p2 && !p2.missing && p2.revisions && p2.revisions[0];
                            if (v2) {
                                var t2 = (v2.slots && v2.slots.main && v2.slots.main.content) || v2.content || '{}';
                                var j2 = JSON.parse(t2);
                                earnedMap = j2.earned || {};
                                actionRP = (j2.stats && j2.stats.rp) || 0;
                            }
                        } catch (e) {}

                        var fullList = CAT.mergeEarned(central, earnedMap);
                        status.rp = CAT.computeRP(fullList) + actionRP;
                        callback(status);
                    }).fail(function () {
                        var fullList = CAT.mergeEarned(central, {});
                        status.rp = CAT.computeRP(fullList);
                        callback(status);
                    });
                }).fail(function () {
                    callback(status);
                });
            }).fail(function () {
                callback(status);
            });
        }

        function buildVerifyPanel(profile) {
            var wrap = el('div', 'up-tab-content');
            var card = buildCard('// XÁC THỰC TÀI KHOẢN & EMAIL');
            var body = card.querySelector('.up-card-body');

            var loadingEl = el('p', 'up-prose up-muted');
            loadingEl.textContent = '⏳ Đang tải thông tin tài khoản…';
            body.appendChild(loadingEl);
            wrap.appendChild(card);

            API.get({
                action: 'query',
                meta: 'userinfo',
                uiprop: 'email|registration',
                format: 'json',
                formatversion: 2
            }).done(function(res) {
                body.innerHTML = '';
                var uinfo = res.query && res.query.userinfo;
                if (!uinfo) {
                    var err = el('p', 'up-prose up-muted');
                    err.textContent = '❌ Không thể truy xuất thông tin tài khoản.';
                    body.appendChild(err);
                    return;
                }

                var email = uinfo.email || '';
                var isEmailVerified = !!uinfo.emailauthenticated;

                var infoSection = el('div', 'up-customize-form');
                
                var emailRow = el('div', 'up-form-group');
                var emailLbl = el('label', 'up-form-label');
                emailLbl.textContent = 'Địa chỉ Email';
                
                var emailInputWrap = el('div', 'up-input-wrap');
                emailInputWrap.style.display = 'flex';
                emailInputWrap.style.gap = '8px';
                emailInputWrap.style.alignItems = 'center';

                var emailInp = el('input', 'up-form-input');
                emailInp.type = 'text';
                emailInp.value = email || '(Chưa liên kết email)';
                emailInp.readOnly = true;
                emailInp.style.opacity = '0.7';
                emailInp.style.flex = '1';

                var changeEmailBtn = el('a', 'up-btn');
                changeEmailBtn.href = '/wiki/Special:ChangeEmail';
                changeEmailBtn.target = '_blank';
                changeEmailBtn.textContent = email ? '⚙ Thay đổi' : '🔗 Liên kết Email';
                changeEmailBtn.style.padding = '8px 12px';
                changeEmailBtn.style.fontSize = '10px';
                changeEmailBtn.style.whiteSpace = 'nowrap';
                changeEmailBtn.style.textDecoration = 'none';

                emailInputWrap.appendChild(emailInp);
                emailInputWrap.appendChild(changeEmailBtn);

                emailRow.appendChild(emailLbl);
                emailRow.appendChild(emailInputWrap);
                infoSection.appendChild(emailRow);

                var statusRow = el('div', 'up-form-group');
                var statusLbl = el('label', 'up-form-label');
                statusLbl.textContent = 'Trạng thái xác thực';
                var statusBadge = el('div', 'up-audience-state ' + (isEmailVerified ? 'is-adult' : 'is-teen'));
                statusBadge.textContent = isEmailVerified ? '✓ Đã xác thực' : '✗ Chưa xác thực';
                statusBadge.style.display = 'inline-block';
                statusBadge.style.marginTop = '4px';
                statusRow.appendChild(statusLbl);
                statusRow.appendChild(statusBadge);
                infoSection.appendChild(statusRow);

                body.appendChild(infoSection);

                if (!isEmailVerified) {
                    var btnGrp = el('div', 'up-form-group');
                    var verifyBtn = el('a', 'up-btn');
                    verifyBtn.href = '/wiki/Special:ConfirmEmail';
                    verifyBtn.target = '_blank';
                    verifyBtn.textContent = '✉ Gửi email xác thực';
                    verifyBtn.style.marginTop = '12px';
                    verifyBtn.style.textDecoration = 'none';
                    verifyBtn.style.display = 'inline-block';

                    verifyBtn.addEventListener('click', function(e) {
                        if (!email) {
                            e.preventDefault();
                            var confirmLink = confirm('Tài khoản của bạn chưa được liên kết với bất kỳ địa chỉ Email nào.\n\nNhấn "OK" để chuyển sang trang liên kết Email (Special:ChangeEmail) và cập nhật địa chỉ Email của bạn trước!');
                            if (confirmLink) {
                                window.open('/wiki/Special:ChangeEmail', '_blank');
                            }
                        }
                    });

                    btnGrp.appendChild(verifyBtn);
                    body.appendChild(btnGrp);

                    var guideText = el('p', 'up-prose up-muted');
                    guideText.style.marginTop = '16px';
                    guideText.innerHTML = '📌 <b>Hướng dẫn xác thực tài khoản:</b><br>' +
                        'Nhấn nút phía trên để chuyển sang trang xác nhận. Hệ thống sẽ gửi một email kèm liên kết kích hoạt. ' +
                        'Bạn chỉ cần nhấp vào liên kết đó để hoàn tất xác thực.<br><br>' +
                        '💡 <b>Tại sao cần xác thực & Lợi ích:</b><br>' +
                        '• <b>Bảo mật tài khoản:</b> Bảo vệ tài khoản và giúp khôi phục mật khẩu an toàn khi quên.<br>' +
                        '• <b>Mở khóa tính năng:</b> Kích hoạt các tính năng liên lạc, gửi thư điện tử giữa các thành viên.<br>' +
                        '• <b>Đặc quyền đặc vụ:</b> Đủ điều kiện tham gia thảo luận (M.A.P.L.E Chat, bình luận) và ứng tuyển quyền Writer để đóng góp bài viết.';
                    body.appendChild(guideText);
                } else {
                    var okText = el('p', 'up-prose up-muted');
                    okText.style.marginTop = '16px';
                    okText.style.color = '#22c55e';
                    okText.innerHTML = '🎉 <b>Chúc mừng!</b> Email của bạn đã được xác thực thành công. Bạn hiện có toàn quyền ' +
                        'sử dụng các tính năng M.A.P.L.E Chat, Bình luận và nộp đơn xin quyền Writer.';
                    body.appendChild(okText);
                }

                var checklistCard = buildCard('// TIÊU CHUẨN XÁC THỰC TÀI KHOẢN');
                var checkBody = checklistCard.querySelector('.up-card-body');
                
                var regDate = ownerRegistration ? new Date(ownerRegistration) : new Date();
                var diffDays = Math.floor((new Date() - regDate) / (1000 * 60 * 60 * 24));

                fetchVerificationStatus(function(vStatus) {
                    renderChecklist(isEmailVerified, diffDays, vStatus.rp);
                });

                function renderChecklist(emailOk, days, rpPoints) {
                    checkBody.innerHTML = '';
                    
                    var table = el('table', 'up-info-table');
                    table.style.width = '100%';
                    table.style.borderCollapse = 'collapse';

                    function addCheckRow(label, desc, isChecked) {
                        var tr = el('tr');
                        var tdCheck = el('td');
                        tdCheck.style.padding = '12px 16px';
                        tdCheck.style.width = '40px';
                        tdCheck.style.fontSize = '1.2rem';
                        tdCheck.style.fontWeight = 'bold';
                        tdCheck.style.color = isChecked ? '#22c55e' : '#ef4444';
                        tdCheck.textContent = isChecked ? '✓' : '✗';
                        
                        var tdInfo = el('td');
                        tdInfo.style.padding = '12px 16px';
                        tdInfo.innerHTML = '<strong>' + label + '</strong><div style="font-size:0.8rem;color:#71717a;margin-top:2px;">' + desc + '</div>';

                        tr.appendChild(tdCheck);
                        tr.appendChild(tdInfo);
                        table.appendChild(tr);
                    }

                    addCheckRow(
                        'Xác thực Email',
                        'Bắt buộc để gửi bình luận, tin nhắn Chat và tạo hồ sơ. Hiện tại: ' + (emailOk ? 'Đã xác thực' : 'Chưa xác thực'),
                        emailOk
                    );

                    addCheckRow(
                        'Tuổi tài khoản ≥ 7 ngày',
                        'Yêu cầu tối thiểu để đảm bảo chống spam. Hiện tại: ' + days + ' ngày',
                        days >= 7
                    );

                    addCheckRow(
                        'Điểm Uy Tín (RP) ≥ 1',
                        'Yêu cầu tối thiểu để gửi tin nhắn MAPLE Chat. Hiện tại: ' + rpPoints + ' RP',
                        rpPoints >= 1
                    );

                    addCheckRow(
                        'Điểm Uy Tín (RP) ≥ 200',
                        'Điều kiện để ứng tuyển quyền Writer sáng tác. Hiện tại: ' + rpPoints + ' RP',
                        rpPoints >= 200
                    );

                    checkBody.appendChild(table);
                }

                wrap.appendChild(checklistCard);

            }).fail(function() {
                body.innerHTML = '';
                var err = el('p', 'up-prose up-muted');
                err.textContent = '❌ Không thể tải thông tin từ API. Vui lòng tải lại trang.';
                body.appendChild(err);
            });

            return wrap;
        }

        function buildWriterPanel(profile) {
            var wrap = el('div', 'up-tab-content');
            var card = buildCard('// ĐĂNG KÝ QUYỀN WRITER');
            var body = card.querySelector('.up-card-body');

            var loadingEl = el('p', 'up-prose up-muted');
            loadingEl.textContent = '⏳ Đang kiểm tra điều kiện đăng ký…';
            body.appendChild(loadingEl);
            wrap.appendChild(card);

            fetchVerificationStatus(function(status) {
                body.innerHTML = '';

                var pageTitle = 'Dự án:Xin quyền Writer/' + viewerName;
                API.get({
                    action: 'query',
                    titles: pageTitle,
                    prop: 'revisions',
                    rvprop: 'content',
                    rvslots: 'main',
                    format: 'json',
                    formatversion: 2
                }).done(function(res) {
                    var pg = res.query && res.query.pages && res.query.pages[0];
                    var isPending = false;
                    if (pg && !pg.missing) {
                        var rev = pg.revisions && pg.revisions[0];
                        var content = (rev && (rev.content || (rev.slots && rev.slots.main && rev.slots.main.content))) || '';
                        var match = content.match(/<!--\s*MAPLE_WR_APP:(.*?)\s*-->/);
                        if (match) {
                            try {
                                var meta = JSON.parse(match[1]);
                                if (meta.status === 'pending') {
                                    isPending = true;
                                }
                            } catch(e) {}
                        }
                    }

                    if (isPending) {
                        var pendingBox = el('div', 'up-customize-form');
                        pendingBox.style.textAlign = 'center';
                        pendingBox.style.padding = '24px 0';
                        
                        var title = el('h3');
                        title.textContent = '⏳ ĐƠN CỦA BẠN ĐANG CHỜ DUYỆT';
                        title.style.color = '#f59e0b';
                        title.style.fontSize = '1.1rem';
                        title.style.marginBottom = '12px';

                        var desc = el('p', 'up-prose up-muted');
                        var pageUrl = mw.util ? mw.util.getUrl(pageTitle) : '/wiki/' + encodeURIComponent(pageTitle);
                        desc.innerHTML = 'Hệ thống ghi nhận bạn đã nộp đơn đăng ký quyền Writer.<br>' +
                            'Đơn đang được Ban Quản Trị xem xét. Vui lòng không nộp thêm đơn mới.<br><br>' +
                            '<a href="' + pageUrl + '" target="_blank" style="color:var(--up-color, #ef4444);text-decoration:underline;">Xem đơn của bạn tại đây ➔</a>';

                        pendingBox.appendChild(title);
                        pendingBox.appendChild(desc);
                        body.appendChild(pendingBox);
                        return;
                    }

                    var checklistEl = el('div', 'up-customize-form');
                    checklistEl.style.borderBottom = '1px solid #1a1a1a';
                    checklistEl.style.paddingBottom = '16px';
                    checklistEl.style.marginBottom = '20px';

                    var checkTitle = el('p', 'up-form-label');
                    checkTitle.textContent = 'ĐIỀU KIỆN ỨNG TUYỂN WRITER';
                    checklistEl.appendChild(checkTitle);

                    var emailOk = status.emailVerified;
                    var ageOk = status.accountAgeDays >= 7;
                    var rpOk = status.rp >= 200;
                    var allOk = emailOk && ageOk && rpOk;

                    function createCheckItem(label, current, required, isOk) {
                        var row = el('div', 'up-form-toggle-row');
                        row.style.marginBottom = '8px';
                        row.style.fontSize = '0.9rem';
                        var mark = el('span');
                        mark.textContent = isOk ? '✓ ' : '✗ ';
                        mark.style.color = isOk ? '#22c55e' : '#ef4444';
                        mark.style.fontWeight = 'bold';
                        mark.style.marginRight = '8px';

                        var text = el('span');
                        text.innerHTML = '<strong>' + label + '</strong>: ' + current + ' (Yêu cầu: ' + required + ')';
                        text.style.color = isOk ? 'var(--up-t1)' : '#71717a';

                        row.appendChild(mark);
                        row.appendChild(text);
                        checklistEl.appendChild(row);
                    }

                    createCheckItem('Xác thực Email', emailOk ? 'Đã xác thực' : 'Chưa xác thực', 'Bắt buộc', emailOk);
                    createCheckItem('Tuổi tài khoản', status.accountAgeDays + ' ngày', '≥ 7 ngày', ageOk);
                    createCheckItem('Điểm Uy Tín (RP)', status.rp + ' RP', '≥ 200 RP', rpOk);

                    body.appendChild(checklistEl);

                    if (!allOk) {
                        var warnBox = el('div', 'up-customize-form');
                        warnBox.style.padding = '16px';
                        warnBox.style.background = 'rgba(239, 68, 68, 0.05)';
                        warnBox.style.border = '1px solid rgba(239, 68, 68, 0.15)';
                        warnBox.style.borderRadius = '6px';
                        
                        var warnP = el('p', 'up-prose');
                        warnP.style.color = '#ef4444';
                        warnP.style.margin = '0';
                        warnP.innerHTML = '🔒 <b>Hệ thống đăng ký đang khóa:</b> Bạn chưa đạt đủ tất cả điều kiện cần thiết để ứng tuyển quyền Writer. Hãy hoàn thiện xác thực email, tích lũy điểm RP thông qua hoạt động đóng góp, bình luận hoặc tương tác để mở khóa.';
                        
                        warnBox.appendChild(warnP);
                        body.appendChild(warnBox);
                        return;
                    }

                    var form = el('div', 'up-customize-form');

                    var genreGrp = el('div', 'up-form-group');
                    var genreLbl = el('label', 'up-form-label');
                    genreLbl.innerHTML = 'Thể loại sáng tác bạn mong muốn <span style="color:#ef4444">*</span>';
                    var genrePresets = ['Thực thể', 'Vật phẩm', 'Nhật ký', 'Tài liệu lore', 'Bài ngoại truyện', 'Lore cốt lõi'];
                    var genreRow = el('div', 'up-theme-presets');
                    var selectedGenres = [];

                    genrePresets.forEach(function(g) {
                        var chip = el('button', 'up-theme-chip');
                        chip.type = 'button';
                        chip.textContent = g;
                        chip.addEventListener('click', function() {
                            var idx = selectedGenres.indexOf(g);
                            if (idx === -1) {
                                selectedGenres.push(g);
                                chip.classList.add('active');
                            } else {
                                selectedGenres.splice(idx, 1);
                                chip.classList.remove('active');
                            }
                            validate();
                        });
                        genreRow.appendChild(chip);
                    });
                    genreGrp.appendChild(genreLbl);
                    genreGrp.appendChild(genreRow);
                    form.appendChild(genreGrp);

                    var ratingGrp = el('div', 'up-form-group');
                    var ratingLbl = el('label', 'up-form-label');
                    ratingLbl.innerHTML = 'Rating nội dung dự kiến <span style="color:#ef4444">*</span>';
                    var ratingSel = el('select', 'up-form-input up-form-select');
                    var rOpts = [
                        { v: '', t: '— Chọn rating —' },
                        { v: '13+', t: '13+ (An toàn, bạo lực nhẹ)' },
                        { v: '16+', t: '16+ (Bạo lực trung bình, trưởng thành nhẹ)' },
                        { v: '18+', t: '18+ (Bạo lực nặng, kinh dị, nhạy cảm)' }
                    ];
                    rOpts.forEach(function(o) {
                        var opt = document.createElement('option');
                        opt.value = o.v;
                        opt.textContent = o.t;
                        ratingSel.appendChild(opt);
                    });
                    ratingSel.addEventListener('change', validate);
                    ratingGrp.appendChild(ratingLbl);
                    ratingGrp.appendChild(ratingSel);
                    form.appendChild(ratingGrp);

                    var ideaGrp = el('div', 'up-form-group');
                    var ideaLbl = el('label', 'up-form-label');
                    ideaLbl.innerHTML = 'Giới thiệu ngắn về ý tưởng đầu tiên của bạn <span style="color:#ef4444">*</span>';
                    var ideaTA = el('textarea', 'up-form-textarea');
                    ideaTA.placeholder = 'Thực thể là gì? Cơ chế hoạt động ra sao? Kết nối với lore thế giới ntn? (Ít nhất 30 ký tự)';
                    ideaTA.rows = 4;
                    ideaTA.maxLength = 1500;
                    var ideaCount = el('span', 'up-form-count');
                    ideaCount.textContent = '0 / 1500';
                    ideaTA.addEventListener('input', function() {
                        ideaCount.textContent = ideaTA.value.length + ' / 1500';
                        validate();
                    });
                    ideaGrp.appendChild(ideaLbl);
                    ideaGrp.appendChild(ideaTA);
                    ideaGrp.appendChild(ideaCount);
                    form.appendChild(ideaGrp);

                    var expGrp = el('div', 'up-form-group');
                    var expLbl = el('label', 'up-form-label');
                    expGrp.textContent = 'Kinh nghiệm sáng tác của bạn (nếu có)';
                    var expTA = el('textarea', 'up-form-textarea');
                    expTA.placeholder = 'Đã từng viết trên wiki khác, wattpad, truyện ngắn... (Không bắt buộc)';
                    expTA.rows = 3;
                    expTA.maxLength = 600;
                    var expCount = el('span', 'up-form-count');
                    expCount.textContent = '0 / 600';
                    expTA.addEventListener('input', function() {
                        expCount.textContent = expTA.value.length + ' / 600';
                    });
                    expGrp.appendChild(expLbl);
                    expGrp.appendChild(expTA);
                    expGrp.appendChild(expCount);
                    form.appendChild(expGrp);

                    var sampleGrp = el('div', 'up-form-group');
                    var sampleLbl = el('label', 'up-form-label');
                    sampleLbl.textContent = 'Đường dẫn bài viết mẫu (nếu có)';
                    var sampleInp = el('input', 'up-form-input');
                    sampleInp.type = 'text';
                    sampleInp.placeholder = 'https://... (Không bắt buộc)';
                    sampleGrp.appendChild(sampleLbl);
                    sampleGrp.appendChild(sampleInp);
                    form.appendChild(sampleGrp);

                    var agreeRow = el('div', 'up-form-toggle-row');
                    agreeRow.style.marginTop = '16px';
                    var agreeLbl = el('label', 'up-form-toggle-label');
                    var agreeChk = el('input', 'up-form-toggle');
                    agreeChk.type = 'checkbox';
                    agreeChk.addEventListener('change', validate);
                    var agreeSpan = document.createElement('span');
                    agreeSpan.innerHTML = 'Tôi đồng ý tuân thủ <a href="/wiki/D%E1%BB%B1_%C3%A1n:%C4%90i%E1%BB%81u_kho%E1%BA%A3n_n%E1%BB%99i_dung" target="_blank" style="color:var(--up-color, #ef4444);text-decoration:underline;">Điều khoản Nội dung</a> và <a href="/wiki/D%E1%BB%B1_%C3%A1n:B%E1%BA%A3n_quy%E1%BB%81n" target="_blank" style="color:var(--up-color, #ef4444);text-decoration:underline;">Bản quyền</a>.';
                    agreeLbl.appendChild(agreeChk);
                    agreeLbl.appendChild(agreeSpan);
                    agreeRow.appendChild(agreeLbl);
                    form.appendChild(agreeRow);

                    var submitRow = el('div', 'up-form-save-row');
                    submitRow.style.marginTop = '24px';
                    var submitBtn = el('button', 'up-btn');
                    submitBtn.textContent = 'Gửi đơn đăng ký';
                    submitBtn.disabled = true;
                    submitBtn.style.borderColor = '#52525b';
                    submitBtn.style.color = '#71717a';

                    var submitStatus = el('span', 'up-form-save-status');
                    submitStatus.style.marginLeft = '12px';

                    submitRow.appendChild(submitBtn);
                    submitRow.appendChild(submitStatus);
                    form.appendChild(submitRow);

                    body.appendChild(form);

                    function validate() {
                        var genresOk = selectedGenres.length > 0;
                        var ratingOk = !!ratingSel.value;
                        var ideaOk = ideaTA.value.trim().length >= 30;
                        var agreeOk = agreeChk.checked;

                        var valid = genresOk && ratingOk && ideaOk && agreeOk;
                        submitBtn.disabled = !valid;
                        
                        var accentColor = profile.accentOverride || '#ef4444';
                        if (valid) {
                            submitBtn.style.borderColor = accentColor;
                            submitBtn.style.color = accentColor;
                        } else {
                            submitBtn.style.borderColor = '#52525b';
                            submitBtn.style.color = '#71717a';
                        }
                    }

                    submitBtn.addEventListener('click', function() {
                        submitBtn.disabled = true;
                        submitStatus.textContent = 'Đang gửi đơn ứng tuyển…';
                        submitStatus.style.color = '#71717a';

                        var now = new Date();
                        var dateStr = now.getFullYear() + '-' +
                                      String(now.getMonth() + 1).padStart(2, '0') + '-' +
                                      String(now.getDate()).padStart(2, '0');
                        var timeStr = String(now.getHours()).padStart(2, '0') + ':' +
                                      String(now.getMinutes()).padStart(2, '0');

                        var wikiText = [
                            '== Đơn xin quyền Writer ==',
                            '; Người nộp đơn: [[Người dùng:' + viewerName + '|' + viewerName + ']]',
                            '; Ngày nộp: ' + dateStr + ' ' + timeStr + ' (giờ địa phương)',
                            '; Thể loại: ' + selectedGenres.join(', '),
                            '; Rating dự kiến: ' + ratingSel.value,
                            '',
                            '=== Ý tưởng ===',
                            ideaTA.value.trim(),
                            '',
                            expTA.value.trim() ? ('=== Kinh nghiệm ===\n' + expTA.value.trim() + '\n') : '',
                            sampleInp.value.trim() ? ('=== Link mẫu ===\n' + sampleInp.value.trim() + '\n') : '',
                            '<!-- MAPLE_WR_APP:{"user":"' + viewerName + '","date":"' + dateStr + '","status":"pending"} -->'
                        ].filter(Boolean).join('\n');

                        API.post({
                            action: 'edit',
                            title: pageTitle,
                            text: wikiText,
                            summary: 'Nộp đơn xin quyền Writer qua Trang cá nhân [bot]',
                            token: mw.user.tokens.get('csrfToken')
                        }).done(function() {
                            submitStatus.textContent = '✓ Đơn đã được gửi thành công!';
                            submitStatus.style.color = '#22c55e';
                            
                            setTimeout(function() {
                                body.innerHTML = '';
                                var pendingBox = el('div', 'up-customize-form');
                                pendingBox.style.textAlign = 'center';
                                pendingBox.style.padding = '24px 0';
                                
                                var title = el('h3');
                                title.textContent = '⏳ ĐƠN CỦA BẠN ĐANG CHỜ DUYỆT';
                                title.style.color = '#f59e0b';
                                title.style.fontSize = '1.1rem';
                                title.style.marginBottom = '12px';

                                var desc = el('p', 'up-prose up-muted');
                                var pageUrl = mw.util ? mw.util.getUrl(pageTitle) : '/wiki/' + encodeURIComponent(pageTitle);
                                desc.innerHTML = 'Hệ thống ghi nhận bạn đã nộp đơn đăng ký quyền Writer.<br>' +
                                    'Đơn đang được Ban Quản Trị xem xét. Vui lòng không nộp thêm đơn mới.<br><br>' +
                                    '<a href="' + pageUrl + '" target="_blank" style="color:var(--up-color, #ef4444);text-decoration:underline;">Xem đơn của bạn tại đây ➔</a>';

                                pendingBox.appendChild(title);
                                pendingBox.appendChild(desc);
                                body.appendChild(pendingBox);
                            }, 2000);

                        }).fail(function(code, errObj) {
                            var errMsg = (errObj && errObj.error && errObj.error.info) || code || 'Lỗi không xác định';
                            submitStatus.textContent = '✗ Lỗi: ' + errMsg;
                            submitStatus.style.color = '#ef4444';
                            submitBtn.disabled = false;
                        });
                    });
                }).fail(function() {
                    var err = el('p', 'up-prose up-muted');
                    err.textContent = '❌ Không thể truy vấn thông tin đơn đăng ký.';
                    body.appendChild(err);
                });
            });

            return wrap;
        }

        function buildFriendRequestsPanel(profile) {
            var wrap = el('div', 'up-tab-content');
            var card = buildCard('// YÊU CẦU KẾT BẠN ĐANG CHỜ');
            var body = card.querySelector('.up-card-body');

            var loadingEl = el('p', 'up-prose up-muted');
            loadingEl.textContent = '⏳ Đang tải danh sách lời mời kết bạn…';
            body.appendChild(loadingEl);
            wrap.appendChild(card);

            var friendReqPage = 'Người_dùng:' + viewerName.replace(/ /g, '_') + '/Chat/FriendRequests';
            var friendsPage = 'Người_dùng:' + viewerName.replace(/ /g, '_') + '/Chat/Friends';

            // Helper để đọc JSON từ wiki page
            function readWikiJSON(title, def, cb) {
                API.get({
                    action: 'query',
                    titles: title,
                    prop: 'revisions',
                    rvprop: 'content',
                    rvslots: 'main',
                    format: 'json',
                    formatversion: 2
                }).done(function(data) {
                    var pg = data.query && data.query.pages && data.query.pages[0];
                    if (!pg || pg.missing !== undefined) return cb(def);
                    var rev = pg.revisions && pg.revisions[0];
                    if (!rev) return cb(def);
                    var text = (rev.slots && rev.slots.main && rev.slots.main.content) || rev.content || rev['*'] || '';
                    try {
                        cb(JSON.parse(text));
                    } catch(e) {
                        cb(def);
                    }
                }).fail(function() {
                    cb(def);
                });
            }

            // Helper để ghi JSON lên wiki page
            function writeWikiJSON(title, obj, summary, cb) {
                API.post({
                    action: 'edit',
                    title: title,
                    text: JSON.stringify(obj, null, 2),
                    summary: summary,
                    token: mw.user.tokens.get('csrfToken'),
                    format: 'json'
                }).done(function(res) {
                    cb(!res.error);
                }).fail(function() {
                    cb(false);
                });
            }

            function loadAndRender() {
                readWikiJSON(friendReqPage, { requests: [] }, function(reqData) {
                    var requests = reqData.requests || [];
                    body.innerHTML = '';

                    if (!requests.length) {
                        var noReq = el('p', 'up-prose up-muted');
                        noReq.textContent = 'Không có lời mời kết bạn nào đang chờ duyệt.';
                        body.appendChild(noReq);
                    } else {
                        var reqList = el('div', 'up-contact-list');
                        requests.forEach(function(req) {
                            var fromUser = req.from;
                            var row = el('div', 'up-social-friend-row');
                            row.style.display = 'flex';
                            row.style.alignItems = 'center';
                            row.style.justifyContent = 'space-between';
                            row.style.padding = '12px';
                            row.style.borderBottom = '1px solid #1a1a1a';

                            var leftArea = el('div');
                            leftArea.style.display = 'flex';
                            leftArea.style.alignItems = 'center';

                            var avWrap = el('span', 'up-social-av');
                            avWrap.textContent = fromUser.charAt(0).toUpperCase();
                            fetchAvatar(fromUser, null, function(url) {
                                if (url) {
                                    var img = document.createElement('img');
                                    img.src = url;
                                    img.className = 'up-social-av-img';
                                    img.onload = function() {
                                        avWrap.innerHTML = '';
                                        avWrap.appendChild(img);
                                    };
                                }
                            });

                            var userLink = el('a');
                            userLink.href = mw.util.getUrl('User:' + fromUser);
                            userLink.textContent = fromUser;
                            userLink.style.marginLeft = '12px';
                            userLink.style.fontWeight = 'bold';
                            userLink.style.color = 'var(--up-t1)';

                            leftArea.appendChild(avWrap);
                            leftArea.appendChild(userLink);

                            var btnGroup = el('div');
                            btnGroup.style.display = 'flex';
                            btnGroup.style.gap = '8px';

                            var acceptBtn = el('button', 'up-btn up-btn-sm');
                            acceptBtn.textContent = '✓ Đồng ý';
                            acceptBtn.style.borderColor = '#22c55e';
                            acceptBtn.style.color = '#22c55e';
                            acceptBtn.addEventListener('click', function() {
                                acceptBtn.disabled = true;
                                declineBtn.disabled = true;
                                handleAccept(fromUser);
                            });

                            var declineBtn = el('button', 'up-btn up-btn-sm up-btn-ghost');
                            declineBtn.textContent = '✕ Từ chối';
                            declineBtn.style.color = '#ef4444';
                            declineBtn.addEventListener('click', function() {
                                acceptBtn.disabled = true;
                                declineBtn.disabled = true;
                                handleDecline(fromUser);
                            });

                            btnGroup.appendChild(acceptBtn);
                            btnGroup.appendChild(declineBtn);

                            row.appendChild(leftArea);
                            row.appendChild(btnGroup);
                            reqList.appendChild(row);
                        });
                        body.appendChild(reqList);
                    }
                });
            }

            function handleAccept(fromUser) {
                // Đọc danh sách bạn bè hiện tại và requests
                readWikiJSON(friendsPage, { friends: [], pendingOut: [] }, function(friendsData) {
                    readWikiJSON(friendReqPage, { requests: [] }, function(reqData) {
                        var myFriends = friendsData.friends || [];
                        var pendingOut = friendsData.pendingOut || [];
                        var reqs = reqData.requests || [];

                        // Cập nhật danh sách của mình
                        if (myFriends.indexOf(fromUser) === -1) myFriends.push(fromUser);
                        var updatedReqs = reqs.filter(function(r) { return r.from !== fromUser; });

                        // Lưu FriendRequests của mình
                        writeWikiJSON(friendReqPage, { requests: updatedReqs }, 'MAPLE-UserPage: Chấp nhận kết bạn', function(ok1) {
                            if (!ok1) {
                                alert('Lỗi khi cập nhật danh sách lời mời.');
                                loadAndRender();
                                return;
                            }
                            // Lưu Friends của mình
                            writeWikiJSON(friendsPage, { friends: myFriends, pendingOut: pendingOut }, 'MAPLE-UserPage: Cập nhật bạn bè', function(ok2) {
                                // Cập nhật bạn bè cho đối phương
                                var theirFriendsPage = 'Người_dùng:' + fromUser.replace(/ /g, '_') + '/Chat/Friends';
                                readWikiJSON(theirFriendsPage, { friends: [], pendingOut: [] }, function(theirData) {
                                    var theirFriends = theirData.friends || [];
                                    var theirPending = (theirData.pendingOut || []).filter(function(u) { return u !== viewerName; });
                                    if (theirFriends.indexOf(viewerName) === -1) theirFriends.push(viewerName);

                                    writeWikiJSON(theirFriendsPage, { friends: theirFriends, pendingOut: theirPending }, 'MAPLE-UserPage: ' + viewerName + ' đã chấp nhận lời mời', function() {
                                        loadAndRender();
                                    });
                                });
                            });
                        });
                    });
                });
            }

            function handleDecline(fromUser) {
                readWikiJSON(friendReqPage, { requests: [] }, function(reqData) {
                    var reqs = reqData.requests || [];
                    var updatedReqs = reqs.filter(function(r) { return r.from !== fromUser; });

                    writeWikiJSON(friendReqPage, { requests: updatedReqs }, 'MAPLE-UserPage: Từ chối kết bạn', function() {
                        loadAndRender();
                    });
                });
            }

            loadAndRender();
            return wrap;
        }

        /* ══ MAIN BUILD ══ */
        function build(profile) {
            var mwText = document.querySelector('#mw-content-text');
            if (!mwText) return;

            /* Hoàn thiện hồ sơ (có bio) → +10 RP một lần (chỉ trang của chính mình) */
            if (isOwn && profile && profile.bio && profile.bio.trim() &&
                window.MAPLE && window.MAPLE.ach && window.MAPLE.ach.rpOnce) {
                window.MAPLE.ach.rpOnce('profile', 10, 'Hoàn thiện hồ sơ');
            }

            var fh = document.querySelector('#firstHeading');
            if (fh) fh.style.display = 'none';

            var s = document.createElement('style');
            s.textContent =
                '.vector-column-start,#mw-panel,.vector-main-menu-container,' +
                'header.mw-header,.vector-header-container,.vector-sticky-header,' +
                '#vector-sticky-header,.vector-page-titlebar,.vector-page-toolbar,' +
                '.vector-column-end,#footer,.mw-footer-container,' +
                '#firstHeading,.mw-indicators,#siteSub,#contentSub,' +
                '.printfooter,#catlinks,.mw-body-header{display:none!important}' +
                '.mw-page-container,#mw-content-text,.mw-body,#content,' +
                '.vector-column-content,.mw-page-container-inner{' +
                'padding:0!important;margin:0!important;max-width:100%!important;' +
                'width:100%!important;background:transparent!important;' +
                'border:none!important;box-shadow:none!important}' +
                'html,body{background:#050505!important}';
            document.head.appendChild(s);

            var accentColor = profile.accentOverride || meta.color;
            var accentGlow  = profile.accentOverride ? profile.accentOverride + '55' : meta.glow;

            var root = el('div', 'up-root');
            root.setAttribute('data-rank', RANK);
            root.style.setProperty('--up-color', accentColor);
            root.style.setProperty('--up-glow',  accentGlow);
            if (profile.fontFamily) {
                root.style.fontFamily = '"' + profile.fontFamily + '", ' + (
                    profile.fontFamily === 'Merriweather' ? 'Georgia, serif' : 'ui-monospace, monospace'
                );
            }
            if (profile.headerLayout) root.setAttribute('data-layout', profile.headerLayout);

            root.appendChild(buildHero(profile));

            /* Tab LIÊN HỆ hiện nếu owner hoặc người dùng đã bật showContacts */
            var TABS = [
                { id: 'overview', label: 'TỔNG QUAN' },
                { id: 'contribs', label: 'ĐÓNG GÓP'  },
                { id: 'badges',   label: 'HUY HIỆU'  },
                { id: 'rewards',  label: 'THÀNH TỰU' },
                { id: 'social',   label: 'BẠN BÈ'    },
            ];
            if (isOwn || profile.showContacts) TABS.splice(3, 0, { id: 'contact', label: 'LIÊN HỆ' });
            /* Tab DONATE — mặc định tắt; chỉ hiện khi chủ trang đã bật (gắn điều kiện ở Cài Đặt) */
            if (profile.donate && profile.donate.enabled) TABS.push({ id: 'donate', label: '💝 DONATE' });
            if (isOwn) {
                TABS.push({ id: 'verify', label: 'XÁC THỰC' });
                var rankMeta = RANK_META[RANK];
                if (rankMeta && rankMeta.tier !== null && rankMeta.tier < 3) {
                    TABS.push({ id: 'writer', label: 'XIN WRITER' });
                }
                TABS.push({ id: 'friendrequests', label: 'LỜI MỜI KẾT BẠN' });
                TABS.push({ id: 'settings', label: 'CÀI ĐẶT' });
            }

            var tabWrap = el('div', 'up-tab-wrap');
            var tabBar  = el('div', 'up-tab-bar');
            TABS.forEach(function(tab) {
                var btn = el('button', 'up-tab-btn'); btn.dataset.tab = tab.id; txt(btn, tab.label); tabBar.appendChild(btn);
            });
            var tabBody = el('div', 'up-tab-body');

            var PANELS = {
                overview: function() { return buildOverview(profile); },
                contribs: buildContribs,
                badges:   buildBadges,
                rewards:  buildRewards,
                donate:   function() { return buildDonate(profile); },
                contact:  function() { return buildContacts(profile); },
                social:   function() { return buildSocial(profile); },
                settings: function() { return buildSettings(profile); },
            };
            if (isOwn) {
                PANELS.verify = function() { return buildVerifyPanel(profile); };
                PANELS.writer = function() { return buildWriterPanel(profile); };
                PANELS.friendrequests = function() { return buildFriendRequestsPanel(profile); };
            }

            function showTab(id) {
                tabBody.innerHTML = '';
                if (PANELS[id]) tabBody.appendChild(PANELS[id]());
                tabBar.querySelectorAll('.up-tab-btn').forEach(function(b) {
                    b.classList.toggle('active', b.dataset.tab === id);
                });
            }

            tabBar.addEventListener('click', function(e) {
                var btn = e.target.closest ? e.target.closest('.up-tab-btn') : null;
                if (!btn && e.target.classList && e.target.classList.contains('up-tab-btn')) btn = e.target;
                if (btn && btn.dataset.tab) showTab(btn.dataset.tab);
            });

            tabWrap.appendChild(tabBar);
            tabWrap.appendChild(tabBody);
            root.appendChild(tabWrap);

            mwText.innerHTML = '';
            mwText.appendChild(root);
            showTab('overview');
        }

        /* Khởi động: tải profile trước, sau đó build */
        fetchProfile(function(profile) {
            if (!document.querySelector('.up-root')) {
                build(profile);
            } else {
                /* Profile refresh từ wiki */
                var root = document.querySelector('.up-root');
                if (root && profile.accentOverride) {
                    root.style.setProperty('--up-color', profile.accentOverride);
                }
                /* Cập nhật hero action buttons với privacy thực */
                if (!isOwn && _heroActionsEl) {
                    populateHeroActions(_heroActionsEl, profile);
                }
            }
        });

    } /* end buildPage() */

    /* ═══════════════════════════════════════════════════
       ENTRY POINT — fetch owner groups + editcount + registration
    ═══════════════════════════════════════════════════ */
    function start() {
        if (isOwn) {
            try {
                var today = new Date().toISOString().split('T')[0];
                localStorage.setItem('maple_profile_visit_' + viewerName.replace(/\s/g, '_') + '_' + today, '1');
            } catch(e){}
        }
        API.get({
            action: 'query', list: 'users',
            ususers: pageUser,
            usprop: 'groups|editcount|registration',
            format: 'json', formatversion: 2
        }).done(function(data) {
            var user   = data.query && data.query.users && data.query.users[0];
            var groups = isOwn ? viewerGroups : ((user && user.groups) || ['user']);
            var userId = isOwn ? cfg.wgUserId  : (user && user.userid);
            buildPage(groups, userId, {
                editcount:    user ? user.editcount    : null,
                registration: user ? user.registration : null,
            });
        }).fail(function() {
            buildPage(isOwn ? viewerGroups : ['user'], isOwn ? cfg.wgUserId : null, {});
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

})();