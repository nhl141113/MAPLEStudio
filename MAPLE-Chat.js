/**
 * M.A.P.L.E — MediaWiki:MAPLE-Chat.js  v2.0
 *
 * Hệ thống nhắn tin nội bộ, lưu trên wiki pages, realtime polling.
 *
 * ── 2 giao diện ───────────────────────────────────────────────────────────────
 *  • Panel nổi nhỏ (góc phải dưới)  — chat nhanh trên mọi trang
 *  • App full page (User:[Tên]/Chat) — giao diện riêng 3 cột, nhiều tính năng hơn:
 *      rail (hồ sơ + lọc Tất cả/Trực tiếp/Nhóm + tìm kiếm + danh sách)
 *      · khu chat giữa · cột thông tin phải (hồ sơ đối phương / thành viên nhóm / ảnh)
 *
 * ── Lưu trữ ──────────────────────────────────────────────────────────────────
 *  Hộp thư đến  : Người_dùng:[Tên]/Chat/Inbox          (JSON: danh sách cuộc hội thoại)
 *  Chat 1-1     : Người_dùng:[A]/Chat/[ID]              (JSON: messages)
 *  Chat nhóm    : Người_dùng:[Owner]/Chat/G-[GID]       (JSON: messages)
 *  Yêu cầu kết bạn: Người_dùng:[Tên]/Chat/FriendRequests (JSON)
 *  Danh sách bạn: Người_dùng:[Tên]/Chat/Friends         (JSON)
 *
 * ── Tính năng ─────────────────────────────────────────────────────────────────
 *  • Chat 1-1 với ID ngẫu nhiên xuyên suốt
 *  • Chat nhóm với G-[GID]
 *  • Kết bạn — phải đợi đối phương đồng ý
 *  • Realtime polling 5s (không cần F5)
 *  • Emoji reactions, reply, edit (15 phút), delete
 *  • Slash commands: /image /quote /spoiler /code /bold /hr /link
 *  • @mention trong chat
 *  • Trạng thái online/offline
 *  • Thông báo tin nhắn mới (badge + title blink)
 *  • Tìm kiếm bạn bè
 *  • Danh sách cuộc hội thoại với preview tin nhắn cuối
 *
 * ── Kích hoạt ─────────────────────────────────────────────────────────────────
 *  Tự động inject floating chat button khi user đăng nhập.
 *  Mở full chat trên trang Người_dùng:[Tên]/Chat (Special page tương đương).
 */
(function (mw, $) {
    'use strict';

    /* ════════════════════════════════════════════════════════════════════════
       GUARDS & CONFIG
    ════════════════════════════════════════════════════════════════════════ */
    var cfg = mw.config.get(['wgUserName', 'wgUserGroups', 'wgPageName', 'wgNamespaceNumber']);
    var CURRENT_USER = cfg.wgUserName;
    if (!CURRENT_USER) return; /* Chỉ hoạt động khi đã đăng nhập */

    var POLL_INTERVAL      = 5000;   /* 5 giây polling khi panel mở (giảm ping) */
    var POLL_INTERVAL_CHAT = 4000;   /* 4 giây khi đang trong chat view (giảm ping) */
    var EDIT_WINDOW_MS  = 15 * 60 * 1000;
    var MAX_MSG_LEN     = 2000;
    var REACTIONS_LIST  = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

    /* ════════════════════════════════════════════════════════════════════════
       PAGE TITLE HELPERS
    ════════════════════════════════════════════════════════════════════════ */
    function inboxPage(user)        { return 'Người_dùng:' + user + '/Chat/Inbox'; }
    function friendsPage(user)      { return 'Người_dùng:' + user + '/Chat/Friends'; }
    function friendReqPage(user)    { return 'Người_dùng:' + user + '/Chat/FriendRequests'; }
    function chatPage(user, convId) { return 'Người_dùng:' + user + '/Chat/' + convId; }
    function presencePage(user)     { return 'Người_dùng:' + user + '/Chat/Presence'; }
    function blockedPage(user)      { return 'Người_dùng:' + user + '/Chat/Blocked'; }

    /* Tạo conversation ID ngẫu nhiên */
    function genConvId() {
        return Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    }
    function genGroupId() {
        return 'G-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 4).toUpperCase();
    }
    function genMsgId() {
        return 'm-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 5);
    }

    /* ════════════════════════════════════════════════════════════════════════
       API HELPERS
    ════════════════════════════════════════════════════════════════════════ */
    var API = new mw.Api();

    /* ── apiRead: hỗ trợ cả MW 1.35+ (rvslots) lẫn cũ hơn ── */
    function apiRead(title, cb) {
        API.get({
            action:      'query',
            titles:      title,
            prop:        'revisions',
            rvprop:      'content|timestamp',
            rvslots:     'main',
            format:      'json',
            formatversion: 2
        }).done(function(data) {
            var pages = (data.query && data.query.pages) || [];
            var page  = pages[0];
            if (!page || page.missing !== undefined) return cb({ missing: true });
            var rev  = page.revisions && page.revisions[0];
            if (!rev) return cb({ missing: true });
            /* MW 1.35+ lưu trong slots.main.content, cũ hơn lưu trong rev.content */
            var text = (rev.slots && rev.slots.main && rev.slots.main.content) ||
                       rev.content || rev['*'] || '';
            cb({ missing: false, text: text, ts: rev.timestamp || '' });
        }).fail(function(code, err) {
            /* Fallback: thử lại không có rvslots cho wiki cũ */
            API.get({
                action: 'query', titles: title,
                prop: 'revisions', rvprop: 'content|timestamp',
                format: 'json'
            }).done(function(data2) {
                var pages2 = (data2.query && data2.query.pages) || {};
                var pid    = Object.keys(pages2)[0];
                var page2  = pages2[pid];
                if (!page2 || page2.missing !== undefined) return cb({ missing: true });
                var rev2 = page2.revisions && page2.revisions[0];
                if (!rev2) return cb({ missing: true });
                var text2 = rev2['*'] || rev2.content || '';
                cb({ missing: false, text: text2, ts: rev2.timestamp || '' });
            }).fail(function() { cb({ error: true }); });
        });
    }

    function apiWrite(title, text, summary, cb) {
        function doEdit(token) {
            API.post({
                action: 'edit', title: title, text: text, token: token,
                summary: summary || 'MAPLE-Chat: auto-update', format: 'json'
            }).done(function(res) {
                /* badtoken = token cache cũ, fetch lại 1 lần */
                if (res.error && (res.error.code === 'badtoken' || res.error.code === 'invalidsession')) {
                    fetchToken(function(t2) { if (t2) API.post({
                        action: 'edit', title: title, text: text, token: t2,
                        summary: summary || 'MAPLE-Chat: auto-update', format: 'json'
                    }).done(function(){ cb(true); }).fail(function(){ cb(false); });
                    else cb(false); });
                } else {
                    cb(!res.error);
                }
            }).fail(function() { cb(false); });
        }
        function fetchToken(next) {
            API.get({ action: 'query', meta: 'tokens', type: 'csrf', format: 'json' })
            .done(function(d) {
                var t = d.query && d.query.tokens && d.query.tokens.csrftoken;
                /* +\ là anon token — chưa login, không cho write */
                if (!t || t === '+\\') { next(null); return; }
                next(t);
            }).fail(function() { next(null); });
        }
        fetchToken(function(token) {
            if (!token) { cb(false); return; }
            doEdit(token);
        });
    }

    function apiReadJSON(title, def, cb) {
        apiRead(title, function(res) {
            if (res.missing || res.error) return cb(def);
            try { cb(JSON.parse(res.text)); } catch(e) { cb(def); }
        });
    }

    function apiWriteJSON(title, obj, summary, cb) {
        apiWrite(title, JSON.stringify(obj, null, 2), summary, cb || function(){});
    }

    /* ── Avatar: SocialProfile (cùng domain) + màu từ username fallback ── */
    var _chatAvatarCache = {};
    var _chatAvatarOrder = [];
    var CHAT_AVATAR_MAX  = 200; /* giới hạn cache để tránh phình vô hạn */
    function _avatarCacheSet(key, val) {
        if (!_chatAvatarCache.hasOwnProperty(key)) {
            _chatAvatarOrder.push(key);
            if (_chatAvatarOrder.length > CHAT_AVATAR_MAX) {
                delete _chatAvatarCache[_chatAvatarOrder.shift()];
            }
        }
        _chatAvatarCache[key] = val;
    }

    function _chatUsernameColor(name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        var colors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#06b6d4','#ec4899','#ef4444','#84cc16'];
        return colors[Math.abs(hash) % colors.length];
    }

    /* SocialProfile avatar — cùng domain nên không bị CSP block */
    function fetchChatAvatar(username, cb) {
        if (_chatAvatarCache[username] !== undefined) { cb(_chatAvatarCache[username]); return; }
        var url = mw.config.get('wgServer') + '/wiki/Special:UserProfileAvatar/' + encodeURIComponent(username);
        var img = new Image();
        img.onload  = function() { _avatarCacheSet(username, url); cb(url); };
        img.onerror = function() { _avatarCacheSet(username, null); cb(null); };
        img.src = url;
    }

    /* Tạo element avatar (ảnh hoặc chữ cái màu) cho chat */
    function buildChatAvEl(username, size) {
        var wrap = document.createElement('div');
        wrap.className = 'mpc-msg-av';
        var color = _chatUsernameColor(username);
        wrap.style.background = color + '22';
        wrap.style.color = color;
        wrap.style.borderColor = color + '55';
        wrap.textContent = (username || '?').charAt(0).toUpperCase();
        if (size) { wrap.style.width = size; wrap.style.height = size; }
        fetchChatAvatar(username, function(url) {
            if (!url) return;
            var img = document.createElement('img');
            img.src = url; img.className = 'mpc-msg-av-img';
            img.onload = function() { if (!wrap.isConnected) return; wrap.innerHTML = ''; wrap.appendChild(img); };
        });
        return wrap;
    }

    /* ── Lấy bio ngắn từ trang User:[name] ── */
    function fetchUserBio(username, cb) { fetchUserBioFromWiki(username, cb); }

    function fetchUserBioFromWiki(username, cb) {
        API.get({
            action: 'query', titles: 'User:' + username,
            prop: 'revisions', rvprop: 'content',
            rvslots: 'main', format: 'json', formatversion: 2
        }).done(function(data) {
            var pages = (data.query && data.query.pages) || [];
            var page  = pages[0];
            if (!page || page.missing !== undefined) return cb('');
            var rev  = page.revisions && page.revisions[0];
            if (!rev) return cb('');
            var text = (rev.slots && rev.slots.main && rev.slots.main.content) ||
                       rev.content || rev['*'] || '';
            var lines = text.split('\n');
            var bio   = '';
            for (var i = 0; i < lines.length; i++) {
                var l = lines[i].trim();
                if (!l || l.charAt(0) === '{' || l.charAt(0) === '[' ||
                    l.charAt(0) === '=' || l.charAt(0) === '<' ||
                    l.indexOf('__') === 0) continue;
                bio = l.replace(/\[\[([^\]|]+)\|?[^\]]*\]\]/g, '$1')
                        .replace(/'{2,}/g, '').replace(/\{\{[^}]+\}\}/g, '').trim();
                if (bio.length > 10) break;
            }
            cb(bio.slice(0, 100));
        }).fail(function() { cb(''); });
    }

    /* ════════════════════════════════════════════════════════════════════════
       HELPERS
    ════════════════════════════════════════════════════════════════════════ */
    function esc(s) {
        return String(s || '')
            .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
    }
    function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
    function fmtTime(iso) {
        if (!iso) return '';
        var d = new Date(iso);
        var now = new Date();
        if (d.toDateString() === now.toDateString()) {
            return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) + ' ' +
               d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    function isAdmin() {
        var g = cfg.wgUserGroups || [];
        return g.indexOf('sysop') !== -1 || g.indexOf('bureaucrat') !== -1 || g.indexOf('founder') !== -1;
    }

    /* ════════════════════════════════════════════════════════════════════════
       MODERATION (giản lược — dùng lại pattern cốt lõi từ MAPLE-Comments)
    ════════════════════════════════════════════════════════════════════════ */
    function modCheck(text) {
        if (!text || !text.trim()) return 'Tin nhắn không được để trống.';
        if (text.trim().length > MAX_MSG_LEN) return 'Tin nhắn quá dài (tối đa ' + MAX_MSG_LEN + ' ký tự).';
        return null; /* null = OK */
    }

    /* ════════════════════════════════════════════════════════════════════════
       LINK RELAY — wrap external links qua trang cảnh báo
    ════════════════════════════════════════════════════════════════════════ */
    var RELAY_BASE   = 'https://maplewikivn.miraheze.org/wiki/D%E1%BB%B1_%C3%A1n:Open/link';
    var CHAT_DOMAINS = ['maplewikivn.miraheze.org', 'miraheze.org'];

    function isChatExternal(href) {
        if (!href) return false;
        if (href.charAt(0) === '/' || href.charAt(0) === '#' || href.charAt(0) === '?') return false;
        if (/^(mailto|tel|javascript):/i.test(href)) return false;
        try {
            var u = new URL(href);
            if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
            var h = u.hostname.toLowerCase();
            for (var di = 0; di < CHAT_DOMAINS.length; di++) {
                if (h === CHAT_DOMAINS[di] || h.endsWith('.' + CHAT_DOMAINS[di])) return false;
            }
            if (h === location.hostname) return false;
            return true;
        } catch (e) { return false; }
    }

    function relayHref(href) {
        if (!isChatExternal(href)) return href;
        return RELAY_BASE + '?url=' + encodeURIComponent(href);
    }

    /* ════════════════════════════════════════════════════════════════════════
       RICH TEXT RENDERER (giống MAPLE-Comments)
    ════════════════════════════════════════════════════════════════════════ */
    function renderRich(text) {
        if (!text) return '';
        return String(text).split('\n').map(renderRichLine).join('<br>');
    }
    function renderRichLine(line) {
        var res = '', rem = line;
        var patterns = [
            { re: /^\/hr\b/, fn: function() { return '<hr class="mpc-hr">'; } },
            { re: /^\/(link|image|quote|spoiler|code|bold):([^\n]*)/, fn: renderSlash },
            { re: /^@([\wÀ-ɏḀ-ỿ_]+)/, fn: function(m) {
                return '<span class="mpc-mention">@' + esc(m[1]) + '</span>';
            }},
            { re: /^(https?:\/\/[^\s<>"']+)/, fn: function(m) {
                return '<a href="' + esc(relayHref(m[1])) + '" target="_blank" rel="noopener">' + esc(m[1]) + '</a>';
            }},
        ];
        while (rem.length > 0) {
            var matched = false;
            for (var i = 0; i < patterns.length; i++) {
                var m = rem.match(patterns[i].re);
                if (m) { res += patterns[i].fn(m); rem = rem.slice(m[0].length); matched = true; break; }
            }
            if (!matched) { res += esc(rem[0]); rem = rem.slice(1); }
        }
        return res;
    }
    function renderSlash(m) {
        var cmd = m[1], val = m[2].trim();
        switch(cmd) {
            case 'link': {
                var pts = val.split('|'), url = pts[0].trim(), lbl = pts[1] ? pts[1].trim() : url;
                return '<a href="' + esc(relayHref(url)) + '" target="_blank" rel="noopener" class="mpc-link">🔗 ' + esc(lbl) + '</a>';
            }
            case 'image':   return '<img class="mpc-img" src="' + esc(val) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">';
            case 'quote':   return '<div class="mpc-quote">' + esc(val) + '</div>';
            case 'spoiler': return '<span class="mpc-spoiler"><span class="mpc-spoiler-text">' + esc(val) + '</span><span class="mpc-spoiler-hint">🙈 click để xem</span></span>';
            case 'code':    return '<code class="mpc-code">' + esc(val) + '</code>';
            case 'bold':    return '<strong>' + esc(val) + '</strong>';
        }
        return esc(m[0]);
    }

    /* ════════════════════════════════════════════════════════════════════════
       STATE
    ════════════════════════════════════════════════════════════════════════ */
    var STATE = {
        open:        false,
        activeConv:  null,    /* { id, partner, isGroup, title, owner } */
        convData:    {},      /* convId → { messages:[], participants:[] } */
        inbox:       [],      /* [{ convId, partner, lastMsg, unread, ts }] */
        friends:     [],      /* [username] */
        friendReqs:  [],      /* [{ from, ts }] — yêu cầu nhận được */
        pendingReqs: [],      /* [{ to, ts }]   — yêu cầu đã gửi */
        blocked:     [],      /* [username] — danh sách đã chặn */
        view:        'inbox', /* 'inbox' | 'chat' | 'friends' | 'newchat' | 'newgroup' */
        pollTimer:   null,
        unreadTotal: 0,
        titleBlink:  null,
    };

    /* ════════════════════════════════════════════════════════════════════════
       FRIENDS MANAGEMENT
    ════════════════════════════════════════════════════════════════════════ */
    function loadFriends(cb) {
        apiReadJSON(friendsPage(CURRENT_USER), { friends: [], pendingOut: [] }, function(data) {
            STATE.friends    = data.friends    || [];
            STATE.pendingReqs = data.pendingOut || [];
            cb && cb();
        });
    }

    function loadFriendRequests(cb) {
        apiReadJSON(friendReqPage(CURRENT_USER), { requests: [] }, function(data) {
            STATE.friendReqs = data.requests || [];
            cb && cb();
        });
    }

    function saveFriends(cb) {
        apiWriteJSON(friendsPage(CURRENT_USER), { friends: STATE.friends, pendingOut: STATE.pendingReqs },
            'MAPLE-Chat: Cập nhật danh sách bạn bè', cb);
    }

    /* Gửi lời mời kết bạn → ghi vào FriendRequests của đối phương */
    function sendFriendRequest(toUser, cb) {
        if (STATE.friends.indexOf(toUser) !== -1) return cb(false, 'Đã là bạn bè.');
        if (STATE.pendingReqs.indexOf(toUser) !== -1) return cb(false, 'Đã gửi lời mời rồi.');
        apiReadJSON(friendReqPage(toUser), { requests: [] }, function(data) {
            var reqs = data.requests || [];
            var already = reqs.filter(function(r){ return r.from === CURRENT_USER; });
            if (already.length) return cb(false, 'Đã gửi lời mời rồi.');
            reqs.push({ from: CURRENT_USER, ts: new Date().toISOString() });
            apiWriteJSON(friendReqPage(toUser), { requests: reqs }, 'MAPLE-Chat: Lời mời kết bạn từ ' + CURRENT_USER, function(ok) {
                if (!ok) return cb(false, 'Không thể gửi lời mời.');
                if (STATE.pendingReqs.indexOf(toUser) === -1) STATE.pendingReqs.push(toUser);
                saveFriends(function() { cb(true, null); });
            });
        });
    }

    /* Chấp nhận lời mời → thêm vào friends list của cả 2 phía, xóa request */
    function acceptFriendRequest(fromUser, cb) {
        /* Thêm vào friends của mình */
        if (STATE.friends.indexOf(fromUser) === -1) STATE.friends.push(fromUser);
        /* Xóa khỏi requests nhận */
        STATE.friendReqs = STATE.friendReqs.filter(function(r){ return r.from !== fromUser; });

        /* Ghi FriendRequests của mình */
        apiWriteJSON(friendReqPage(CURRENT_USER), { requests: STATE.friendReqs }, 'MAPLE-Chat: Đã chấp nhận lời mời', function() {
            saveFriends(function() {
                /* Thêm mình vào friends list của đối phương */
                apiReadJSON(friendsPage(fromUser), { friends: [], pendingOut: [] }, function(data) {
                    var theirFriends = data.friends || [];
                    var theirPending = (data.pendingOut || []).filter(function(u){ return u !== CURRENT_USER; });
                    if (theirFriends.indexOf(CURRENT_USER) === -1) theirFriends.push(CURRENT_USER);
                    apiWriteJSON(friendsPage(fromUser), { friends: theirFriends, pendingOut: theirPending },
                        'MAPLE-Chat: ' + CURRENT_USER + ' đã chấp nhận lời mời', function() {
                            
                            // Trigger friend achievements
                            if (window.MAPLE && window.MAPLE.ach) {
                                window.MAPLE.award('social'); // first friend
                                if (STATE.friends.length >= 10) {
                                    window.MAPLE.award('socialite'); // 10 friends
                                }
                                if (typeof window.MAPLE.clearUserStatusCache === 'function') {
                                    window.MAPLE.clearUserStatusCache();
                                }
                            }

                            cb && cb();
                        });
                });
            });
        });
    }

    /* Từ chối lời mời */
    function declineFriendRequest(fromUser, cb) {
        STATE.friendReqs = STATE.friendReqs.filter(function(r){ return r.from !== fromUser; });
        apiWriteJSON(friendReqPage(CURRENT_USER), { requests: STATE.friendReqs }, 'MAPLE-Chat: Từ chối lời mời', function() { cb && cb(); });
    }

    /* ════════════════════════════════════════════════════════════════════════
       PRESENCE (Online Status)
    ════════════════════════════════════════════════════════════════════════ */
    var PRESENCE_INTERVAL_MS = 60000; /* cập nhật mỗi 60s (giảm ping) */
    var PRESENCE_ONLINE_MS   = 120000; /* online nếu ts < 2 phút */
    var _presenceTimer       = null;
    var _presenceCache       = {}; /* username → { online, ts, fetchedAt } */

    /* Ghi presence của mình */
    function updatePresence() {
        var data = { ts: new Date().toISOString(), status: 'online' };
        apiWriteJSON(presencePage(CURRENT_USER), data, 'MAPLE-Chat: presence');
    }

    /* Đọc presence của user khác */
    function getPresence(username, cb) {
        var now = Date.now();
        var cached = _presenceCache[username];
        /* Cache 20s để tránh gọi API quá nhiều */
        if (cached && (now - cached.fetchedAt) < 20000) { cb(cached.online); return; }
        apiReadJSON(presencePage(username), null, function(data) {
            var online = false;
            if (data && data.ts) {
                online = (now - new Date(data.ts).getTime()) < PRESENCE_ONLINE_MS;
            }
            _presenceCache[username] = { online: online, fetchedAt: now };
            cb(online);
        });
    }

    /* Bắt đầu vòng cập nhật presence */
    function startPresence() {
        updatePresence();
        if (_presenceTimer) clearInterval(_presenceTimer);
        _presenceTimer = setInterval(updatePresence, PRESENCE_INTERVAL_MS);
    }

    /* Tạo dot element online/offline */
    function buildOnlineDot(isOnline) {
        var dot = document.createElement('div');
        dot.className = 'mpc-online-dot' + (isOnline ? '' : ' mpc-offline-dot');
        return dot;
    }

    /* ════════════════════════════════════════════════════════════════════════
       BLOCK USER
    ════════════════════════════════════════════════════════════════════════ */
    function loadBlocked(cb) {
        apiReadJSON(blockedPage(CURRENT_USER), { blocked: [] }, function(data) {
            STATE.blocked = data.blocked || [];
            cb && cb();
        });
    }

    function saveBlocked(cb) {
        apiWriteJSON(blockedPage(CURRENT_USER), { blocked: STATE.blocked },
            'MAPLE-Chat: Cập nhật danh sách chặn', cb);
    }

    function isBlocked(username) {
        return STATE.blocked.indexOf(username) !== -1;
    }

    function blockUser(username, cb) {
        if (STATE.blocked.indexOf(username) === -1) STATE.blocked.push(username);
        saveBlocked(cb);
    }

    function unblockUser(username, cb) {
        STATE.blocked = STATE.blocked.filter(function(u){ return u !== username; });
        saveBlocked(cb);
    }

    /* ════════════════════════════════════════════════════════════════════════
       INBOX
    ════════════════════════════════════════════════════════════════════════ */
    function loadInbox(cb) {
        apiReadJSON(inboxPage(CURRENT_USER), { conversations: [] }, function(data) {
            STATE.inbox = data.conversations || [];
            cb && cb();
        });
    }

    function saveInbox(cb) {
        apiWriteJSON(inboxPage(CURRENT_USER), { conversations: STATE.inbox }, 'MAPLE-Chat: Cập nhật inbox', cb);
    }

    /* Đảm bảo conversation tồn tại trong inbox */
    function ensureInboxEntry(convId, partner, isGroup, title, ts) {
        var existing = STATE.inbox.filter(function(c){ return c.convId === convId; })[0];
        if (!existing) {
            STATE.inbox.unshift({ convId: convId, partner: partner, isGroup: !!isGroup, title: title || partner, lastMsg: '', unread: 0, ts: ts || new Date().toISOString() });
        }
    }

    /* ════════════════════════════════════════════════════════════════════════
       CONVERSATION DATA
    ════════════════════════════════════════════════════════════════════════ */
    function loadConv(conv, cb) {
        var owner = conv.isGroup ? CURRENT_USER : (conv.owner || CURRENT_USER);
        var page  = chatPage(owner, conv.id);
        apiReadJSON(page, { id: conv.id, messages: [], participants: [] }, function(data) {
            STATE.convData[conv.id] = data;
            cb && cb(data);
        });
    }

    function saveConv(conv, data, summary, cb) {
        var owner = conv.isGroup ? CURRENT_USER : (conv.owner || CURRENT_USER);
        var page  = chatPage(owner, conv.id);
        apiWriteJSON(page, data, summary || 'MAPLE-Chat: cập nhật tin nhắn', cb);
    }

    /* Gửi tin nhắn */
    function sendMessage(conv, content, replyTo, cb) {
        var err = modCheck(content);
        if (err) return cb(false, err);

        var owner = conv.isGroup ? (conv.owner || CURRENT_USER) : (conv.owner || CURRENT_USER);
        var page  = chatPage(owner, conv.id);

        apiReadJSON(page, { id: conv.id, messages: [], participants: [], title: conv.title }, function(data) {
            if (!Array.isArray(data.messages)) data.messages = [];
            var msg = {
                id:        genMsgId(),
                from:      CURRENT_USER,
                content:   content.trim(),
                replyTo:   replyTo || null,
                ts:        new Date().toISOString(),
                editedAt:  null,
                deleted:   false,
                reactions: {}
            };
            data.messages.push(msg);

            /* Cập nhật participants */
            if (!Array.isArray(data.participants)) data.participants = [];
            if (data.participants.indexOf(CURRENT_USER) === -1) data.participants.push(CURRENT_USER);

            apiWriteJSON(page, data, 'MAPLE-Chat: tin nhắn từ ' + CURRENT_USER, function(ok) {
                if (!ok) return cb(false, 'Không thể gửi tin nhắn.');
                STATE.convData[conv.id] = data;

                /* Trigger achievements & RP for chat message */
                if (window.MAPLE && window.MAPLE.ach) {
                    window.MAPLE.award('first_message');
                    var ach = window.MAPLE.ach;
                    var stats = ach.data().stats || {};
                    stats.totalChatMsgs = (stats.totalChatMsgs || 0) + 1;
                    ach.rpAdd(1, 'chat_msg', 5, 'Gửi tin nhắn chat ✓');
                }

                /* Cập nhật inbox của mình */
                var myEntry = STATE.inbox.filter(function(c){ return c.convId === conv.id; })[0];
                if (myEntry) { myEntry.lastMsg = content.slice(0, 60); myEntry.ts = msg.ts; }
                saveInbox();

                /* Nếu chat 1-1: cập nhật inbox của đối phương */
                if (!conv.isGroup && conv.partner && conv.partner !== CURRENT_USER) {
                    notifyPartner(conv, msg);
                }

                cb(true, null, msg);
            });
        });
    }

    /* Thông báo inbox cho đối phương (1-1) */
    function notifyPartner(conv, msg) {
        apiReadJSON(inboxPage(conv.partner), { conversations: [] }, function(data) {
            var convs = data.conversations || [];
            var entry = convs.filter(function(c){ return c.convId === conv.id; })[0];
            if (!entry) {
                convs.unshift({ convId: conv.id, partner: CURRENT_USER, isGroup: false,
                    title: CURRENT_USER, lastMsg: msg.content.slice(0, 60),
                    unread: 1, ts: msg.ts, owner: conv.owner || CURRENT_USER });
            } else {
                entry.lastMsg = msg.content.slice(0, 60);
                entry.unread  = (entry.unread || 0) + 1;
                entry.ts      = msg.ts;
            }
            apiWriteJSON(inboxPage(conv.partner), { conversations: convs }, 'MAPLE-Chat: thông báo từ ' + CURRENT_USER);
        });
    }

    /* Xóa / sửa tin nhắn */
    function editMessage(conv, msgId, newContent, cb) {
        var err = modCheck(newContent);
        if (err) return cb(false, err);
        var owner = conv.owner || CURRENT_USER;
        var page  = chatPage(owner, conv.id);
        apiReadJSON(page, { messages: [] }, function(data) {
            var msg = (data.messages || []).filter(function(m){ return m.id === msgId; })[0];
            if (!msg) return cb(false, 'Không tìm thấy tin nhắn.');
            if (msg.from !== CURRENT_USER) return cb(false, 'Không có quyền.');
            var age = Date.now() - new Date(msg.ts).getTime();
            if (age > EDIT_WINDOW_MS && !isAdmin()) return cb(false, 'Quá 15 phút không thể sửa.');
            msg.content  = newContent.trim();
            msg.editedAt = new Date().toISOString();
            apiWriteJSON(page, data, 'MAPLE-Chat: sửa tin nhắn', function(ok) {
                if (ok) STATE.convData[conv.id] = data;
                cb(ok, ok ? null : 'Lỗi lưu.');
            });
        });
    }

    function deleteMessage(conv, msgId, cb) {
        var owner = conv.owner || CURRENT_USER;
        var page  = chatPage(owner, conv.id);
        apiReadJSON(page, { messages: [] }, function(data) {
            var msg = (data.messages || []).filter(function(m){ return m.id === msgId; })[0];
            if (!msg) return cb(false);
            if (msg.from !== CURRENT_USER && !isAdmin()) return cb(false);
            msg.deleted = true; msg.content = '[Tin nhắn đã bị xóa]';
            apiWriteJSON(page, data, 'MAPLE-Chat: xóa tin nhắn', function(ok) {
                if (ok) STATE.convData[conv.id] = data;
                cb(ok);
            });
        });
    }

    function toggleReaction(conv, msgId, emoji, cb) {
        var owner = conv.owner || CURRENT_USER;
        var page  = chatPage(owner, conv.id);
        apiReadJSON(page, { messages: [] }, function(data) {
            var msg = (data.messages || []).filter(function(m){ return m.id === msgId; })[0];
            if (!msg) return cb(false);
            if (!msg.reactions) msg.reactions = {};
            if (!Array.isArray(msg.reactions[emoji])) msg.reactions[emoji] = [];
            var idx = msg.reactions[emoji].indexOf(CURRENT_USER);
            if (idx === -1) msg.reactions[emoji].push(CURRENT_USER);
            else msg.reactions[emoji].splice(idx, 1);
            apiWriteJSON(page, data, 'MAPLE-Chat: reaction', function(ok) {
                if (ok) STATE.convData[conv.id] = data;
                cb(ok, msg.reactions);
            });
        });
    }

    /* ════════════════════════════════════════════════════════════════════════
       START NEW CONVERSATION
    ════════════════════════════════════════════════════════════════════════ */
    function startConversation(partner, cb) {
        /* Tìm xem đã có conv với người này chưa */
        var existing = STATE.inbox.filter(function(c){ return !c.isGroup && c.partner === partner; })[0];
        if (existing) {
            return cb(existing.convId, existing);
        }
        var convId = genConvId();
        var conv   = { id: convId, partner: partner, isGroup: false, title: partner, owner: CURRENT_USER };

        /* Khởi tạo page chat */
        var initData = {
            id: convId, title: partner,
            participants: [CURRENT_USER, partner],
            isGroup: false, messages: [], created: new Date().toISOString()
        };
        var page = chatPage(CURRENT_USER, convId);
        apiWriteJSON(page, initData, 'MAPLE-Chat: Bắt đầu cuộc trò chuyện với ' + partner, function(ok) {
            if (!ok) return cb(null, null);
            ensureInboxEntry(convId, partner, false, partner, initData.created);
            saveInbox(function() { cb(convId, conv); });
        });
    }

    function startGroupChat(members, groupName, cb) {
        var gid    = genGroupId();
        var conv   = { id: gid, isGroup: true, title: groupName, owner: CURRENT_USER, partner: null };
        var allMembers = [CURRENT_USER].concat(members.filter(function(m){ return m !== CURRENT_USER; }));
        var initData = {
            id: gid, title: groupName, isGroup: true,
            participants: allMembers, owner: CURRENT_USER,
            messages: [], created: new Date().toISOString()
        };
        var page = chatPage(CURRENT_USER, gid);
        apiWriteJSON(page, initData, 'MAPLE-Chat: Tạo nhóm ' + groupName, function(ok) {
            if (!ok) return cb(null, null);
            ensureInboxEntry(gid, null, true, groupName, initData.created);
            /* Thêm group vào inbox của tất cả thành viên */
            members.forEach(function(m) {
                if (m === CURRENT_USER) return;
                apiReadJSON(inboxPage(m), { conversations: [] }, function(data) {
                    var convs = data.conversations || [];
                    if (!convs.filter(function(c){ return c.convId === gid; }).length) {
                        convs.unshift({ convId: gid, partner: null, isGroup: true,
                            title: groupName, lastMsg: '', unread: 0,
                            ts: initData.created, owner: CURRENT_USER });
                    }
                    apiWriteJSON(inboxPage(m), { conversations: convs }, 'MAPLE-Chat: thêm vào nhóm ' + groupName);
                });
            });
            saveInbox(function() { cb(gid, conv); });
        });
    }

    /* ════════════════════════════════════════════════════════════════════════
       POLLING — panel mở: 5s; panel đóng: 20s (background)
    ════════════════════════════════════════════════════════════════════════ */
    var BG_POLL_INTERVAL = 45000; /* 45s khi panel đóng (giảm ping nền) */

    function startPolling() {
        stopPolling();
        var interval = (STATE.view === 'chat') ? POLL_INTERVAL_CHAT : POLL_INTERVAL;
        STATE.pollTimer = setInterval(pollUpdates, interval);
    }

    /* Restart với đúng interval khi đổi view */
    function adjustPollingRate() {
        if (STATE.open) startPolling();
    }

    function stopPolling() {
        if (STATE.pollTimer) { clearInterval(STATE.pollTimer); STATE.pollTimer = null; }
    }

    function pollUpdates() {
        /* ── Inbox: luôn poll dù panel đóng hay mở ── */
        loadInbox(function() {
            var prevUnread = STATE.unreadTotal;
            updateUnreadBadge();
            /* Nếu có tin mới khi panel đóng → show browser notification */
            if (STATE.unreadTotal > prevUnread && !STATE.open) {
                showBrowserNotification(STATE.unreadTotal - prevUnread);
            }
            if (STATE.open && STATE.view === 'inbox') renderInboxList();
        });

        if (!STATE.open) return; /* Chỉ poll chi tiết khi panel mở */

        /* ── Conversation hiện tại: reload nếu có tin mới ── */
        if (STATE.activeConv && STATE.view === 'chat') {
            var conv  = STATE.activeConv;
            var owner = conv.owner || CURRENT_USER;
            var page  = chatPage(owner, conv.id);
            apiReadJSON(page, { messages: [] }, function(data) {
                var old = STATE.convData[conv.id];
                var oldMsgs = (old && old.messages || []).filter(function(m){ return !m._pending; });
                var newMsgs = data.messages || [];
                /* Detect thay đổi: khác length hoặc tin cuối bị edit/delete */
                var changed = oldMsgs.length !== newMsgs.length;
                if (!changed && newMsgs.length > 0) {
                    var lastOld = oldMsgs[oldMsgs.length - 1];
                    var lastNew = newMsgs[newMsgs.length - 1];
                    changed = lastOld.id !== lastNew.id ||
                              lastOld.content !== lastNew.content ||
                              lastOld.deleted !== lastNew.deleted ||
                              lastOld.editedAt !== lastNew.editedAt;
                }
                if (changed) {
                    var wasAtBottom = isScrolledToBottom();
                    STATE.convData[conv.id] = data;
                    renderMessages(data);
                    if (wasAtBottom) scrollToBottom();
                }
            });
        }

        /* ── Friend requests + Board messages ── */
        loadFriendRequests(function() {
            updateFriendReqBadge();
            checkBoardMessages();
        });
    }

    function isScrolledToBottom() {
        var el = document.getElementById('mpc-messages');
        if (!el) return true;
        return el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    }

    function scrollToBottom() {
        var el = document.getElementById('mpc-messages');
        if (el) el.scrollTop = el.scrollHeight;
    }

    /* Browser Notification API */
    function showBrowserNotification(count) {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'granted') {
            new Notification('MAPLE Chat', {
                body: 'Bạn có ' + count + ' tin nhắn mới',
                icon: '/favicon.ico',
                tag: 'maple-chat'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }

    /* Background poll khi panel đóng */
    var bgPollTimer = null;
    function startBgPolling() {
        if (bgPollTimer) return;
        bgPollTimer = setInterval(function() {
            if (!STATE.open) pollUpdates();
        }, BG_POLL_INTERVAL);
    }
    function stopBgPolling() {
        if (bgPollTimer) { clearInterval(bgPollTimer); bgPollTimer = null; }
    }

    /* ════════════════════════════════════════════════════════════════════════
       USER SEARCH (MediaWiki API)
    ════════════════════════════════════════════════════════════════════════ */
    function searchUsers(query, cb) {
        if (!query || query.length < 2) return cb([]);
        API.get({
            action: 'query', list: 'allusers',
            auprefix: query, aulimit: 10,
            format: 'json', formatversion: 2
        }).done(function(data) {
            var users = (data.query && data.query.allusers) || [];
            cb(users.map(function(u){ return u.name; }).filter(function(n){ return n !== CURRENT_USER; }));
        }).fail(function(){ cb([]); });
    }

    /* ════════════════════════════════════════════════════════════════════════
       CSS INJECT
    ════════════════════════════════════════════════════════════════════════ */
    function injectCSS() {
        if (document.getElementById('mpc-style')) return;
        var link = document.createElement('link');
        link.id   = 'mpc-style';
        link.rel  = 'stylesheet';
        link.href = '/index.php?title=MediaWiki:MAPLE-Chat.css&action=raw&ctype=text/css';
        document.head.appendChild(link);
    }

    /* ════════════════════════════════════════════════════════════════════════
       BUILD UI SHELL
    ════════════════════════════════════════════════════════════════════════ */
    var UI = {}; /* Sẽ giữ các element tham chiếu */

    function buildShell() {
        if (document.getElementById('mpc-shell')) return;

        /* Floating button */
        var fab = el('button', 'mpc-fab');
        fab.id  = 'mpc-fab';
        fab.innerHTML = '<span class="mpc-fab-icon">💬</span><span class="mpc-fab-badge" id="mpc-badge" style="display:none">0</span>';
        fab.title = 'MAPLE Chat';
        document.body.appendChild(fab);
        UI.fab   = fab;
        UI.badge = document.getElementById('mpc-badge');

        /* Panel */
        var panel = el('div', 'mpc-panel');
        panel.id  = 'mpc-shell';
        panel.style.display = 'none';
        panel.innerHTML = [
            '<div class="mpc-panel-header">',
            '  <div class="mpc-panel-title"><span class="mpc-slash">//</span> M.A.P.L.E CHAT</div>',
            '  <div class="mpc-panel-actions">',
            '    <button class="mpc-hdr-btn" id="mpc-btn-friends" title="Bạn bè">👥<span class="mpc-freq-badge" id="mpc-freq-badge" style="display:none">!</span></button>',
            '    <a class="mpc-hdr-btn" id="mpc-btn-board" title="User Board" target="_blank" href="' + mw.util.getUrl('Special:UserBoard/' + CURRENT_USER) + '">◫<span class="mpc-board-badge" id="mpc-board-badge" style="display:none"></span></a>',
            '    <a class="mpc-hdr-btn" id="mpc-btn-rel" title="Bạn bè (SocialProfile)" target="_blank" href="' + mw.util.getUrl('Special:ViewRelationships') + '?user=' + encodeURIComponent(CURRENT_USER) + '">◈</a>',
            '    <button class="mpc-hdr-btn" id="mpc-btn-newchat" title="Chat mới">✉️</button>',
            '    <button class="mpc-hdr-btn" id="mpc-btn-newgroup" title="Nhóm mới">👥+</button>',
            '    <a class="mpc-hdr-btn" id="mpc-btn-fullpage" title="Mở trang Chat đầy đủ" target="_blank" href="' + mw.util.getUrl('User:' + CURRENT_USER + '/Chat') + '">🖥️</a>',
            '    <button class="mpc-hdr-btn mpc-close-btn" id="mpc-close">✕</button>',
            '  </div>',
            '</div>',
            '<div class="mpc-panel-body" id="mpc-body"></div>',
            '<div class="mpc-panel-status" id="mpc-status"></div>',
        ].join('');
        document.body.appendChild(panel);
        UI.panel     = panel;
        UI.body      = document.getElementById('mpc-body');
        UI.statusBar = document.getElementById('mpc-status');

        /* Events */
        fab.addEventListener('click', togglePanel);
        document.getElementById('mpc-close').addEventListener('click', closePanel);
        document.getElementById('mpc-btn-friends').addEventListener('click', showFriendsView);
        document.getElementById('mpc-btn-newchat').addEventListener('click', showNewChatView);
        document.getElementById('mpc-btn-newgroup').addEventListener('click', showNewGroupView);
    }

    function togglePanel() {
        if (STATE.open) closePanel(); else openPanel();
    }

    function verifyChatAccess(isFullPage, onPass) {
        if (!CURRENT_USER) {
            if (isFullPage) {
                var mwText = document.querySelector('#mw-content-text');
                if (mwText) {
                    mwText.innerHTML = '<div style="font-family:\'JetBrains Mono\',monospace;text-align:center;padding:48px;color:#a1a1aa;background:#050505;min-height:100vh;">Bạn cần đăng nhập để sử dụng MAPLE Chat.</div>';
                }
            } else {
                alert('Bạn cần đăng nhập để sử dụng MAPLE Chat.');
            }
            return;
        }

        if (typeof window.MAPLE !== 'undefined' && window.MAPLE.getUserStatus) {
            window.MAPLE.getUserStatus(function (status) {
                var isSysop = status.groups && (status.groups.indexOf('sysop') !== -1 || status.groups.indexOf('founder') !== -1 || status.groups.indexOf('interface-admin') !== -1);
                var isWriter = status.groups && status.groups.indexOf('writer') !== -1;
                var bypass = isSysop;
                
                var ageOk = status.accountAgeDays >= 7 || isWriter;
                var emailOk = status.emailVerified;
                var rpOk = status.rp >= 1 || isWriter;

                if (!status.isLoggedIn) {
                    if (isFullPage) {
                        var mwText = document.querySelector('#mw-content-text');
                        if (mwText) {
                            mwText.innerHTML = '<div style="font-family:\'JetBrains Mono\',monospace;text-align:center;padding:48px;color:#a1a1aa;background:#050505;min-height:100vh;">Bạn cần đăng nhập để sử dụng MAPLE Chat.</div>';
                        }
                    } else {
                        alert('Bạn cần đăng nhập để sử dụng MAPLE Chat.');
                    }
                    return;
                }

                var container = isFullPage ? document.querySelector('#mw-content-text') : UI.panel;

                // 1. Lock Check (Criteria not met)
                if (!bypass && (!emailOk || !ageOk || !rpOk)) {
                    if (!isFullPage) {
                        STATE.open = true;
                        UI.panel.style.display = 'flex';
                    }
                    renderAccessOverlay(container, isFullPage, 'lock', {
                        emailOk: emailOk,
                        ageOk: ageOk,
                        rpOk: rpOk
                    });
                    return;
                }

                // 2. Terms Check (TOS not agreed)
                var CHAT_TOS_KEY = 'maple_tos_chat_seen';
                if (!localStorage.getItem(CHAT_TOS_KEY)) {
                    if (!isFullPage) {
                        STATE.open = true;
                        UI.panel.style.display = 'flex';
                    }
                    renderAccessOverlay(container, isFullPage, 'terms', null, function () {
                        try { localStorage.setItem(CHAT_TOS_KEY, '1'); } catch (e) {}
                        var oldOverlay = document.getElementById('mpc-verify-blocker');
                        if (oldOverlay) oldOverlay.remove();
                        onPass();
                    });
                    return;
                }

                // 3. All passed
                var oldOverlay = document.getElementById('mpc-verify-blocker');
                if (oldOverlay) oldOverlay.remove();
                onPass();
            });
            return;
        }

        onPass();
    }

    function renderAccessOverlay(container, isFullPage, type, data, onAgree) {
        if (!container) return;
        var overlay = document.getElementById('mpc-verify-blocker');
        if (overlay) overlay.remove();

        overlay = document.createElement('div');
        overlay.id = 'mpc-verify-blocker';
        
        var wrapperStyle = 'position:absolute;inset:0;background:#050505;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;box-sizing:border-box;font-family:"JetBrains Mono",monospace;';
        if (isFullPage) {
            wrapperStyle = 'position:fixed;inset:0;background:#050505;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;box-sizing:border-box;font-family:"JetBrains Mono",monospace;';
        }
        overlay.style.cssText = wrapperStyle;

        var lockIcon = document.createElement('div');
        lockIcon.textContent = type === 'lock' ? '🔒' : '📝';
        lockIcon.style.fontSize = '2.5rem';
        lockIcon.style.marginBottom = '16px';

        var title = document.createElement('div');
        title.style.color = '#ef4444';
        title.style.fontSize = '0.9rem';
        title.style.fontWeight = 'bold';
        title.style.letterSpacing = '0.1em';
        title.style.marginBottom = '12px';

        var desc = document.createElement('div');
        desc.style.color = '#a1a1aa';
        desc.style.fontSize = '0.78rem';
        desc.style.lineHeight = '1.6';

        var btnGrp = document.createElement('div');
        btnGrp.style.marginTop = '20px';
        btnGrp.style.display = 'flex';
        btnGrp.style.gap = '12px';

        if (type === 'lock') {
            title.textContent = 'CHAT HỆ THỐNG ĐANG KHÓA (CHỐNG SPAM)';
            desc.innerHTML = 'Để chống spam và bảo vệ cộng đồng, tài khoản cần đạt:<br><br>' +
                '<span style="color:' + (data.emailOk ? '#22c55e' : '#ef4444') + '">• Xác thực Email (' + (data.emailOk ? 'Đạt' : 'Thiếu') + ')</span><br>' +
                '<span style="color:' + (data.ageOk ? '#22c55e' : '#ef4444') + '">• Tuổi nick ≥ 7 ngày (' + (data.ageOk ? 'Đạt' : 'Thiếu') + ')</span><br>' +
                '<span style="color:' + (data.rpOk ? '#22c55e' : '#ef4444') + '">• Điểm Uy Tín ≥ 1 RP (' + (data.rpOk ? 'Đạt' : 'Thiếu') + ')</span><br><br>' +
                'Vui lòng vào <a href="/wiki/Special:Preferences" style="color:#ef4444;text-decoration:underline;">Tùy chọn tài khoản</a> để xác thực hoặc vào Trang cá nhân để kiểm tra chi tiết.';

            var closeBtn = document.createElement('button');
            closeBtn.textContent = isFullPage ? 'QUAY LẠI TRANG CHỦ' : 'ĐÓNG';
            closeBtn.style.cssText = 'padding:8px 16px;background:transparent;border:1px solid #27272a;color:#a1a1aa;font-family:inherit;font-size:0.75rem;cursor:pointer;border-radius:4px;';
            closeBtn.addEventListener('click', function() {
                if (isFullPage) {
                    window.location.href = mw.util.getUrl('Trang_Chính');
                } else {
                    closePanel();
                }
            });
            btnGrp.appendChild(closeBtn);
        } else {
            title.textContent = 'ĐIỀU KHOẢN SỬ DỤNG CHAT (CHỐNG SPAM)';
            title.style.color = '#fbbf24';
            
            var termsScroll = document.createElement('div');
            termsScroll.style.cssText = 'width:100%;max-width:360px;max-height:180px;overflow-y:auto;background:#0d0d0d;border:1px solid #27272a;border-radius:4px;padding:12px;text-align:left;font-size:0.72rem;line-height:1.5;color:#c8c8c8;margin:12px 0;box-sizing:border-box;scrollbar-width:thin;scrollbar-color:#3f3f46 #0d0d0d;';
            termsScroll.innerHTML = 
                '<h4 style="margin:0 0 8px 0;color:#fbbf24;font-size:0.78rem;border-bottom:1px solid #27272a;padding-bottom:4px;font-family:inherit;">QUY TẮC SỬ DỤNG MAPLE CHAT (TOS v1.0)</h4>' +
                '<b>01 // ĐIỀU KIỆN SỬ DỤNG:</b><br>' +
                '• Tài khoản phải đạt: Điểm uy tín (RP) ≥ 1, Tuổi nick ≥ 7 ngày, Email đã xác thực.<br><br>' +
                '<b>02 // QUY TẮC ỨNG XỬ CHUNG:</b><br>' +
                '• MAPLE Chat là kênh nhắn tin thật giữa các thành viên, không phải sân khấu mặc định để nhập vai (role-play).<br>' +
                '• <b>Được phép:</b> Chào hỏi, kết bạn, thảo luận bài viết/lore, trao đổi cùng BQT. Chỉ nhập vai khi cả hai bên đồng ý.<br>' +
                '• <b>Nghiêm cấm:</b> Lăng mạ, đe dọa, spam quảng cáo, gửi liên kết độc hại, doxxing hoặc mạo danh.<br><br>' +
                '<b>03 // QUY TẮC NHẬP VAI (ROLE-PLAY):</b><br>' +
                '• Chỉ nhập vai khi cả hai bên thỏa thuận rõ ràng, nội dung lành mạnh và có ký hiệu phân biệt rõ (VD: "[IC] Tôi là..."). Không dùng lý do "nhập vai" để xúc phạm người khác.<br><br>' +
                '<b>04 // RANH GIỚI CÁ NHÂN:</b><br>' +
                '• Nếu đối phương yêu cầu <b>"Đừng nhắn tin cho tôi nữa"</b>, bạn BẮT BUỘC phải dừng lại ngay lập tức. Tiếp tục gửi tin sẽ cấu thành hành vi quấy rối.<br><br>' +
                '<b>05 // KHUNG HÌPH PHẠT:</b><br>' +
                '• Tái phạm spam hoặc quấy rối: Khóa Chat từ 7–14 ngày.<br>' +
                '• Quấy rối có chủ đích hoặc nghiêm trọng: Khóa Chat từ 14–30 ngày.<br>' +
                '• Kỳ thị, bạo lực, doxxing hoặc mạo danh BQT: Khóa Chat vĩnh viễn và xem xét khóa tài khoản toàn cục.<br><br>' +
                '<b>06 // QUYỀN HẠN CỦA BAN QUẢN TRỊ (BQT):</b><br>' +
                '• BQT có quyền truy xuất lịch sử chat của tài khoản khi có báo cáo quấy rối hoặc để điều tra vi phạm. BQT cam kết bảo mật thông tin riêng tư và không đọc lén khi không có lý do điều tra chính đáng.';

            desc.innerHTML = '';
            desc.appendChild(termsScroll);
            
            var noteSpan = document.createElement('span');
            noteSpan.textContent = 'Vui lòng kéo xuống đọc hết và nhấn "Đồng ý" để tiếp tục.';
            noteSpan.style.cssText = 'color:#71717a;font-size:0.7rem;display:block;margin-top:6px;';
            desc.appendChild(noteSpan);
            
            var detailsLink = document.createElement('a');
            detailsLink.href = mw.util.getUrl('Điều_Khoản/Chat');
            detailsLink.target = '_blank';
            detailsLink.textContent = 'Xem chi tiết trang Điều Khoản Chat →';
            detailsLink.style.cssText = 'color:#fbbf24;text-decoration:underline;font-size:0.72rem;display:block;margin-top:8px;';
            desc.appendChild(detailsLink);

            var agreeBtn = document.createElement('button');
            agreeBtn.textContent = 'ĐỒNG Ý & TIẾP TỤC';
            agreeBtn.style.cssText = 'padding:8px 16px;background:#ef4444;border:none;color:#fff;font-family:inherit;font-size:0.75rem;font-weight:bold;cursor:pointer;border-radius:4px;box-shadow:0 0 10px rgba(239,68,68,0.4);';
            agreeBtn.addEventListener('click', function() {
                if (onAgree) onAgree();
            });

            var cancelBtn = document.createElement('button');
            cancelBtn.textContent = isFullPage ? 'HỦY & VỀ TRANG CHỦ' : 'TỪ CHỐI';
            cancelBtn.style.cssText = 'padding:8px 16px;background:transparent;border:1px solid #27272a;color:#a1a1aa;font-family:inherit;font-size:0.75rem;cursor:pointer;border-radius:4px;';
            cancelBtn.addEventListener('click', function() {
                if (isFullPage) {
                    window.location.href = mw.util.getUrl('Trang_Chính');
                } else {
                    closePanel();
                }
            });

            btnGrp.appendChild(agreeBtn);
            btnGrp.appendChild(cancelBtn);
        }

        overlay.appendChild(lockIcon);
        overlay.appendChild(title);
        overlay.appendChild(desc);
        overlay.appendChild(btnGrp);
        container.appendChild(overlay);
    }

    function openPanel() {
        verifyChatAccess(false, function () {
            mw.hook('maple.feature.first_use').fire({ feature: 'chat' });
            STATE.open = true;
            UI.panel.style.display = 'flex';
            startPresence();
            loadInbox(function() {
                loadFriends(function() {
                    loadFriendRequests(function() {
                        loadBlocked(function() {
                            updateUnreadBadge();
                            updateFriendReqBadge();
                            showInboxView();
                            startPolling();
                        });
                    });
                });
            });
        });
    }

    function closePanel() {
        STATE.open = false;
        UI.panel.style.display = 'none';
        stopPolling();
    }

    function setStatus(msg, type) {
        UI.statusBar.textContent = msg;
        UI.statusBar.className   = 'mpc-panel-status' + (type ? ' mpc-status-' + type : '');
        if (msg) setTimeout(function(){ UI.statusBar.textContent = ''; UI.statusBar.className = 'mpc-panel-status'; }, 3000);
    }

    /* ════════════════════════════════════════════════════════════════════════
       VIEWS
    ════════════════════════════════════════════════════════════════════════ */

    /* ── INBOX VIEW ── */
    function showInboxView() {
        STATE.view = 'inbox';
        adjustPollingRate();
        renderInboxList();
    }

    function renderInboxList() {
        if (IS_FULL_PAGE && UI.fpConvs) { renderFPConvList(); return; }
        var body = UI.body;
        body.innerHTML = '';

        if (!STATE.inbox.length) {
            body.innerHTML = '<div class="mpc-empty"><div class="mpc-empty-icon">💬</div><div>Chưa có cuộc trò chuyện nào.<br>Nhấn ✉️ để bắt đầu chat!</div></div>';
            return;
        }

        var sorted = STATE.inbox.slice().sort(function(a,b){ return new Date(b.ts) - new Date(a.ts); });
        sorted.forEach(function(conv) {
            var isActive = STATE.activeConv && STATE.activeConv.id === conv.convId;
            var item = el('div', 'mpc-conv-item' + (conv.unread ? ' mpc-conv-unread' : '') + (isActive ? ' mpc-conv-active' : ''));
            item.dataset.convid = conv.convId;

            /* Avatar */
            if (conv.isGroup) {
                var avDiv = el('div', 'mpc-conv-av'); avDiv.textContent = '👥'; item.appendChild(avDiv);
            } else {
                var partnerName = conv.partner || conv.title || '?';
                var avEl = buildChatAvEl(partnerName, '38px');
                avEl.className = 'mpc-conv-av mpc-msg-av';
                /* Thêm dot online/offline */
                var dotEl = buildOnlineDot(false); /* mặc định offline, cập nhật async */
                avEl.appendChild(dotEl);
                (function(de, pn) {
                    getPresence(pn, function(online) {
                        de.className = 'mpc-online-dot' + (online ? '' : ' mpc-offline-dot');
                    });
                })(dotEl, partnerName);
                item.appendChild(avEl);
            }

            var infoDiv = el('div', 'mpc-conv-info');
            var nameDiv = el('div', 'mpc-conv-name');
            nameDiv.textContent = conv.title || conv.partner || conv.convId;
            if (conv.isGroup) { var gb = el('span', 'mpc-group-badge'); gb.textContent = 'NHÓM'; nameDiv.appendChild(gb); }
            if (conv.isSystem) {
                var appBadge = el('span', 'mpc-app-badge');
                appBadge.innerHTML = '✓ APP';
                nameDiv.appendChild(appBadge);
            }
            var previewDiv = el('div', 'mpc-conv-preview');
            previewDiv.textContent = (conv.lastMsg || '').slice(0, 50);
            infoDiv.appendChild(nameDiv);
            infoDiv.appendChild(previewDiv);

            var metaDiv = el('div', 'mpc-conv-meta');
            var timeDiv = el('div', 'mpc-conv-time'); timeDiv.textContent = fmtTime(conv.ts);
            metaDiv.appendChild(timeDiv);
            if (conv.unread) { var bdg = el('div', 'mpc-conv-badge'); bdg.textContent = conv.unread; metaDiv.appendChild(bdg); }

            item.appendChild(infoDiv);
            item.appendChild(metaDiv);
            item.addEventListener('click', function() {
                if (IS_FULL_PAGE) openConvFullPage(conv);
                else openConversation(conv);
            });
            body.appendChild(item);
        });
    }

    /* ── CHAT VIEW ── */
    function openConversation(convMeta) {
        STATE.view = 'chat';
        adjustPollingRate();
        STATE.activeConv = {
            id:      convMeta.convId,
            partner: convMeta.partner,
            isGroup: convMeta.isGroup,
            title:   convMeta.title,
            owner:   convMeta.owner || CURRENT_USER
        };

        /* Đánh dấu đã đọc */
        convMeta.unread = 0;
        saveInbox();
        updateUnreadBadge();

        loadConv(STATE.activeConv, function(data) {
            renderChatView(data);
            scrollToBottom();
        });
    }

    function renderChatView(data) {
        var conv  = STATE.activeConv;
        var body  = UI.body;
        body.innerHTML = '';

        /* Header */
        var hdr = el('div', 'mpc-chat-header');
        hdr.innerHTML =
            '<button class="mpc-back-btn" id="mpc-back">← Quay lại</button>' +
            '<div id="mpc-chat-av-slot"></div>' +
            '<div class="mpc-chat-title-wrap">' +
            '<div class="mpc-chat-title">' + esc(conv.title || conv.partner || conv.id) +
            (conv.isGroup ? ' <span class="mpc-group-badge">NHÓM</span>' : '') + '</div>' +
            '<div class="mpc-chat-bio" id="mpc-chat-bio"></div>' +
            '</div>' +
            '<div class="mpc-chat-actions">' +
            '<button class="mpc-hdr-btn" id="mpc-search-btn" title="Tìm tin nhắn">🔍</button>' +
            (!conv.isGroup && conv.partner ? '<button class="mpc-hdr-btn" id="mpc-view-profile" title="Xem trang">👤</button>' : '') +
            (!conv.isGroup && conv.partner ? '<a class="mpc-hdr-btn" id="mpc-user-board" title="User Board" href="' + mw.util.getUrl('Special:UserBoard/' + (conv.partner || '')) + '" target="_blank">◫</a>' : '') +
            (!conv.isGroup && conv.partner ? '<button class="mpc-hdr-btn" id="mpc-block-btn" title="Tuỳ chọn" style="position:relative;">⚠</button>' : '') +
            '</div>';
        body.appendChild(hdr);

        /* Inject avatar vào header slot */
        var avSlot = document.getElementById('mpc-chat-av-slot');
        if (avSlot) {
            var partnerName = conv.isGroup ? (conv.title || 'G') : (conv.partner || '?');
            var avEl = buildChatAvEl(partnerName, '34px');
            avEl.className = 'mpc-chat-av';
            avSlot.appendChild(avEl);
        }

        /* Tự động lấy bio từ đối phương */
        if (!conv.isGroup && conv.partner) {
            fetchUserBio(conv.partner, function(bio) {
                var bioEl = document.getElementById('mpc-chat-bio');
                if (bioEl) {
                    /* Thêm online status dưới tên */
                    var statusRow = el('div', 'mpc-chat-status-row');
                    var statusDot = buildOnlineDot(false);
                    statusDot.id = 'mpc-hdr-presence-dot';
                    var statusText = el('span', 'mpc-offline-status');
                    statusText.id = 'mpc-hdr-presence-text';
                    statusText.textContent = 'Đang tải…';
                    statusRow.appendChild(statusDot);
                    statusRow.appendChild(statusText);
                    if (bio) bioEl.textContent = bio;
                    bioEl.parentNode.insertBefore(statusRow, bioEl.nextSibling);
                    getPresence(conv.partner, function(online) {
                        var dot  = document.getElementById('mpc-hdr-presence-dot');
                        var txt  = document.getElementById('mpc-hdr-presence-text');
                        if (dot) dot.className = 'mpc-online-dot' + (online ? '' : ' mpc-offline-dot');
                        if (txt) {
                            txt.className = online ? 'mpc-online-status' : 'mpc-offline-status';
                            txt.textContent = online ? 'Đang online' : 'Offline';
                        }
                    });
                }
            });
        }

        document.getElementById('mpc-back').addEventListener('click', function() {
            if (STATE.activeConv) clearTyping(STATE.activeConv);
            STATE.activeConv = null;
            loadInbox(function() { showInboxView(); });
        });
        var searchBtn = document.getElementById('mpc-search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                var d = STATE.convData[conv.id];
                showSearchView(conv, d);
            });
        }
        var profileBtn = document.getElementById('mpc-view-profile');
        if (profileBtn && conv.partner) {
            profileBtn.addEventListener('click', function() {
                window.open('/wiki/Người_dùng:' + encodeURIComponent(conv.partner), '_blank');
            });
        }

        /* Block button dropdown */
        var blockBtn = document.getElementById('mpc-block-btn');
        if (blockBtn && conv.partner) {
            blockBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                var existMenu = document.getElementById('mpc-block-menu');
                if (existMenu) { existMenu.parentNode.removeChild(existMenu); return; }
                var menu = el('div', 'mpc-block-menu');
                menu.id = 'mpc-block-menu';
                var blocked = isBlocked(conv.partner);
                var menuItem = el('button', 'mpc-block-menu-item');
                menuItem.textContent = blocked ? '🔓 Bỏ chặn ' + conv.partner : '🚫 Chặn ' + conv.partner;
                menuItem.addEventListener('click', function() {
                    menu.parentNode && menu.parentNode.removeChild(menu);
                    if (blocked) {
                        unblockUser(conv.partner, function() {
                            setStatus('Đã bỏ chặn ' + conv.partner, 'ok');
                            var banner = document.getElementById('mpc-block-banner');
                            if (banner) banner.parentNode.removeChild(banner);
                        });
                    } else {
                        blockUser(conv.partner, function() {
                            setStatus('Đã chặn ' + conv.partner, 'warn');
                            renderBlockBanner(conv.partner, body);
                        });
                    }
                });
                menu.appendChild(menuItem);
                blockBtn.appendChild(menu);
                setTimeout(function() {
                    document.addEventListener('click', function closeMenu(e2) {
                        if (!menu.contains(e2.target)) {
                            menu.parentNode && menu.parentNode.removeChild(menu);
                            document.removeEventListener('click', closeMenu);
                        }
                    });
                }, 0);
            });
        }

        /* Block banner nếu đã chặn */
        if (!conv.isGroup && conv.partner && isBlocked(conv.partner)) {
            renderBlockBanner(conv.partner, body);
        }

        /* Messages container */
        var msgsEl = el('div', 'mpc-messages');
        msgsEl.id  = 'mpc-messages';
        body.appendChild(msgsEl);

        /* Input area — ẩn hoàn toàn với conversation hệ thống (isSystem) */
        if (conv.isSystem) {
            var roBar = el('div', 'mpc-readonly-bar');
            roBar.innerHTML =
                '<span class="mpc-readonly-icon">🔔</span>' +
                '<span class="mpc-readonly-text">Đây là kênh thông báo từ <b>EventNotifier</b> — chỉ đọc.</span>' +
                '<a class="mpc-readonly-link" href="/wiki/Th%C3%B4ng_b%C3%A1o/' +
                encodeURIComponent(CURRENT_USER) + '">Xem tất cả →</a>';
            body.appendChild(roBar);
        } else {
            var inputArea = buildInputArea(conv);
            body.appendChild(inputArea);
        }

        renderMessages(data);
    }

    function renderMessages(data) {
        var msgsEl = document.getElementById('mpc-messages');
        if (!msgsEl) return;
        var msgs = (data && data.messages) || [];
        msgsEl.innerHTML = '';

        if (!msgs.length) {
            msgsEl.innerHTML = '<div class="mpc-empty"><div class="mpc-empty-icon">✨</div><div>Bắt đầu cuộc trò chuyện!</div></div>';
            return;
        }

        msgs.forEach(function(msg) {
            var isOwn = msg.from === CURRENT_USER;
            var wrap  = el('div', 'mpc-msg-wrap' + (isOwn ? ' mpc-msg-own' : '') + (msg._pending ? ' mpc-msg-pending' : ''));
            wrap.dataset.id = msg.id;

            var replyHtml = '';
            if (msg.replyTo && msg.replyTo.from) {
                replyHtml = '<div class="mpc-reply-ref">↩ <strong>' + esc(msg.replyTo.from) + '</strong>: ' + esc((msg.replyTo.text || '').slice(0, 60)) + '</div>';
            }

            var bodyHtml;
            if (msg.deleted) {
                bodyHtml = '<em class="mpc-deleted">[Tin nhắn đã bị xóa]</em>';
            } else if (msg.isSystem) {
                /* Tin nhắn hệ thống (EventNotifier…) chứa HTML tin cậy — render trực tiếp */
                bodyHtml = msg.content || '';
            } else {
                bodyHtml = renderRich(msg.content || '');
            }

            /* Reactions */
            var reactHtml = '';
            if (!msg.deleted) {
                var reactions = msg.reactions || {};
                var reactionBtns = REACTIONS_LIST.map(function(emoji) {
                    var users = Array.isArray(reactions[emoji]) ? reactions[emoji] : [];
                    var count = users.length;
                    var active = users.indexOf(CURRENT_USER) !== -1 ? ' active' : '';
                    return count > 0
                        ? '<button class="mpc-react-btn' + active + '" data-emoji="' + esc(emoji) + '" data-msgid="' + esc(msg.id) + '">' + emoji + ' ' + count + '</button>'
                        : '';
                }).join('');

                var addReactHtml = '<span class="mpc-react-add" data-msgid="' + esc(msg.id) + '">+😊</span>';
                if (reactionBtns || true) {
                    reactHtml = '<div class="mpc-reactions">' + reactionBtns + addReactHtml + '</div>';
                }
            }

            /* Actions */
            var actHtml = '';
            if (!msg.deleted) {
                var isPinned = (data && Array.isArray(data.pinned)) ? data.pinned.indexOf(msg.id) !== -1 : false;
                actHtml = '<div class="mpc-msg-actions">';
                actHtml += '<button class="mpc-act" data-action="reply" data-msgid="' + esc(msg.id) + '" data-from="' + esc(msg.from) + '" data-text="' + esc((msg.content||'').slice(0,100)) + '" title="Trả lời">↩</button>';
                actHtml += '<button class="mpc-act" data-action="pin" data-msgid="' + esc(msg.id) + '" title="' + (isPinned ? 'Bỏ ghim' : 'Ghim') + '">' + (isPinned ? '📌' : '📍') + '</button>';
                if (isOwn) {
                    actHtml += '<button class="mpc-act" data-action="edit" data-msgid="' + esc(msg.id) + '" data-content="' + esc(msg.content||'') + '" title="Sửa">✏️</button>';
                    actHtml += '<button class="mpc-act" data-action="delete" data-msgid="' + esc(msg.id) + '" title="Xóa">🗑️</button>';
                }
                if (isAdmin()) {
                    if (!isOwn) actHtml += '<button class="mpc-act" data-action="delete" data-msgid="' + esc(msg.id) + '" title="Xóa (Admin)">🛡️</button>';
                }
                actHtml += '</div>';
            }

            var editedHtml = msg.editedAt ? '<span class="mpc-edited">(đã sửa)</span>' : '';

            /* Avatar (chữ cái màu + Gravatar nếu là mình) */
            if (!isOwn) {
                wrap.appendChild(buildChatAvEl(msg.from || '?'));
            }

            var colDiv = document.createElement('div');
            colDiv.className = 'mpc-msg-col';
            colDiv.innerHTML =
                (!isOwn ? '<div class="mpc-msg-from">' + esc(msg.from) + '</div>' : '') +
                replyHtml +
                '<div class="mpc-msg-bubble">' + bodyHtml + '</div>' +
                editedHtml +
                '<div class="mpc-msg-time">' + fmtTime(msg.ts) + '</div>' +
                reactHtml + actHtml;
            wrap.appendChild(colDiv);

            msgsEl.appendChild(wrap);
        });

        /* Bind events */
        bindMessageEvents(msgsEl);

        /* Spoiler */
        msgsEl.querySelectorAll('.mpc-spoiler').forEach(function(sp) {
            sp.addEventListener('click', function() { sp.classList.toggle('revealed'); });
        });
    }

    function bindMessageEvents(container) {
        container.addEventListener('click', function(e) {
            var btn = e.target.closest('[data-action]');
            if (!btn) {
                /* Reaction button */
                var rBtn = e.target.closest('.mpc-react-btn');
                if (rBtn) {
                    var emoji  = rBtn.dataset.emoji;
                    var msgId  = rBtn.dataset.msgid;
                    doReaction(msgId, emoji);
                }
                /* Add reaction picker */
                var addBtn = e.target.closest('.mpc-react-add');
                if (addBtn) showReactionPicker(addBtn, addBtn.dataset.msgid);
                return;
            }

            var action  = btn.dataset.action;
            var msgId   = btn.dataset.msgid;
            var conv    = STATE.activeConv;
            if (!conv) return;

            if (action === 'reply') {
                var from  = btn.dataset.from;
                var text  = btn.dataset.text;
                setReplyQuote(msgId, from, text);
            } else if (action === 'pin') {
                pinMessage(conv, msgId, function(ok) {
                    if (ok) {
                        loadConv(conv, function(d) {
                            renderMessages(d);
                            renderPinnedBanner(d, conv);
                        });
                    }
                });
            } else if (action === 'edit') {
                var content = btn.dataset.content;
                startEditInline(btn, msgId, content);
            } else if (action === 'delete') {
                if (!confirm('Xóa tin nhắn này?')) return;
                deleteMessage(conv, msgId, function(ok) {
                    if (ok) { loadConv(conv, function(data){ renderMessages(data); }); }
                    else setStatus('Không thể xóa.', 'err');
                });
            }
        });
    }

    /* Inline edit */
    function startEditInline(btn, msgId, content) {
        var wrap = btn.closest('.mpc-msg-wrap');
        if (!wrap) return;
        var bubble = wrap.querySelector('.mpc-msg-bubble');
        if (!bubble) return;
        bubble.innerHTML =
            '<textarea class="mpc-inline-edit" style="width:100%;min-height:60px;">' + esc(content) + '</textarea>' +
            '<div style="display:flex;gap:6px;margin-top:4px;">' +
            '<button class="mpc-send-btn mpc-edit-save" style="font-size:11px;padding:4px 10px;">💾 Lưu</button>' +
            '<button class="mpc-edit-cancel" style="font-size:11px;padding:4px 10px;">Hủy</button>' +
            '</div>';
        bubble.querySelector('.mpc-edit-save').addEventListener('click', function() {
            var newContent = bubble.querySelector('.mpc-inline-edit').value;
            editMessage(STATE.activeConv, msgId, newContent, function(ok, err) {
                if (ok) { loadConv(STATE.activeConv, function(data){ renderMessages(data); }); }
                else setStatus(err || 'Lỗi.', 'err');
            });
        });
        bubble.querySelector('.mpc-edit-cancel').addEventListener('click', function() {
            loadConv(STATE.activeConv, function(data){ renderMessages(data); });
        });
    }

    /* Reaction picker */
    function showReactionPicker(anchor, msgId) {
        var existing = document.getElementById('mpc-react-picker');
        if (existing) existing.parentNode.removeChild(existing);
        var picker = el('div', 'mpc-react-picker');
        picker.id  = 'mpc-react-picker';
        REACTIONS_LIST.forEach(function(emoji) {
            var btn = el('button', 'mpc-react-picker-btn');
            btn.textContent = emoji;
            btn.addEventListener('click', function() {
                doReaction(msgId, emoji);
                picker.parentNode && picker.parentNode.removeChild(picker);
            });
            picker.appendChild(btn);
        });
        anchor.parentNode.appendChild(picker);
        setTimeout(function() {
            document.addEventListener('click', function cleanup(e) {
                if (!picker.contains(e.target)) { picker.parentNode && picker.parentNode.removeChild(picker); document.removeEventListener('click', cleanup); }
            });
        }, 0);
    }

    function doReaction(msgId, emoji) {
        var conv = STATE.activeConv;
        if (!conv) return;
        toggleReaction(conv, msgId, emoji, function(ok) {
            if (ok) { loadConv(conv, function(data){ renderMessages(data); }); }
        });
    }

    /* Reply quote */
    var replyingTo = null;
    function setReplyQuote(msgId, from, text) {
        replyingTo = { id: msgId, from: from, text: text };
        var refEl = document.getElementById('mpc-reply-quote');
        if (refEl) {
            refEl.style.display = 'flex';
            refEl.querySelector('.mpc-rq-text').textContent = from + ': ' + text.slice(0, 80);
        }
    }
    function clearReplyQuote() {
        replyingTo = null;
        var refEl = document.getElementById('mpc-reply-quote');
        if (refEl) refEl.style.display = 'none';
    }

    /* Render banner cảnh báo khi đã chặn partner */
    function renderBlockBanner(partner, container) {
        var existing = document.getElementById('mpc-block-banner');
        if (existing) existing.parentNode.removeChild(existing);
        var banner = el('div', 'mpc-block-banner');
        banner.id = 'mpc-block-banner';
        banner.innerHTML = '🚫 Bạn đã chặn <strong>' + esc(partner) + '</strong>. Họ không thể nhắn tin với bạn.';
        var unblockBtn = document.createElement('button');
        unblockBtn.textContent = 'Bỏ chặn';
        unblockBtn.addEventListener('click', function() {
            unblockUser(partner, function() {
                banner.parentNode && banner.parentNode.removeChild(banner);
                setStatus('Đã bỏ chặn ' + partner, 'ok');
            });
        });
        banner.appendChild(unblockBtn);
        /* Chèn ngay trước messages */
        var msgsEl = document.getElementById('mpc-messages');
        if (msgsEl && msgsEl.parentNode) {
            msgsEl.parentNode.insertBefore(banner, msgsEl);
        } else if (container) {
            container.appendChild(banner);
        }
    }

    /* ── INPUT AREA ── */
    var INPUT_TOOLS = [
        { cmd: 'image',   icon: '🖼',  label: 'Ảnh (URL)',       placeholder: 'https://…',            suffix: '' },
        { cmd: 'link',    icon: '🔗',  label: 'Link',             placeholder: 'https://… | Tên link', suffix: '' },
        { cmd: 'quote',   icon: '💬',  label: 'Trích dẫn',       placeholder: 'Nội dung trích dẫn',   suffix: '' },
        { cmd: 'spoiler', icon: '🙈',  label: 'Spoiler',          placeholder: 'Nội dung ẩn',          suffix: '' },
        { cmd: 'code',    icon: '💻',  label: 'Code',             placeholder: 'code ở đây',           suffix: '' },
        { cmd: 'bold',    icon: '𝐁',   label: 'In đậm',          placeholder: 'Văn bản đậm',          suffix: '' },
        { cmd: 'hr',      icon: '━',   label: 'Đường kẻ ngang',  placeholder: null,                   suffix: '' },
    ];

    function buildInputArea(conv) {
        var wrap = el('div', 'mpc-input-wrap');

        /* Tool bar */
        var toolbar = el('div', 'mpc-toolbar');
        INPUT_TOOLS.forEach(function(tool) {
            var btn = el('button', 'mpc-tool-btn');
            btn.type = 'button';
            btn.title = tool.label;
            btn.innerHTML = '<span class="mpc-tool-icon">' + tool.icon + '</span>';
            btn.addEventListener('click', function() {
                var inp = document.getElementById('mpc-input');
                if (!inp) return;
                var insert = '';
                if (tool.cmd === 'hr') {
                    insert = '/hr';
                } else if (tool.placeholder) {
                    insert = '/' + tool.cmd + ':' + tool.placeholder;
                }
                /* Chèn vào vị trí con trỏ */
                var start = inp.selectionStart;
                var end   = inp.selectionEnd;
                var before = inp.value.slice(0, start);
                var after  = inp.value.slice(end);
                /* Thêm xuống dòng nếu trước đó không trống */
                if (before.length > 0 && before[before.length - 1] !== '\n') before += '\n';
                inp.value = before + insert + after;
                /* Đặt con trỏ sau prefix để user gõ thẳng */
                var cursorPos = before.length + '/' .length + tool.cmd.length + (tool.cmd !== 'hr' ? 1 : 0); /* sau dấu : */
                if (tool.cmd === 'hr') cursorPos = before.length + insert.length;
                else cursorPos = before.length + ('/' + tool.cmd + ':').length;
                /* Nếu có placeholder, select toàn bộ placeholder */
                if (tool.placeholder && tool.cmd !== 'hr') {
                    inp.setSelectionRange(cursorPos, cursorPos + tool.placeholder.length);
                } else {
                    inp.setSelectionRange(cursorPos, cursorPos);
                }
                inp.focus();
                inp.dispatchEvent(new Event('input'));
            });
            toolbar.appendChild(btn);
        });

        wrap.appendChild(toolbar);

        /* Reply quote */
        var rq = el('div', 'mpc-reply-quote'); rq.id = 'mpc-reply-quote'; rq.style.display = 'none';
        rq.innerHTML = '<span class="mpc-rq-text"></span><button class="mpc-rq-cancel" id="mpc-rq-cancel">✕</button>';
        wrap.appendChild(rq);

        /* Typing indicator */
        var tyRow = el('div', 'mpc-typing-row'); tyRow.id = 'mpc-typing-row'; tyRow.style.display = 'none';
        tyRow.innerHTML = '<span class="mpc-typing-dot"></span><span class="mpc-typing-dot"></span><span class="mpc-typing-dot"></span><span class="mpc-typing-name"></span>';
        wrap.appendChild(tyRow);

        /* Input row */
        var inputRow = el('div', 'mpc-input-row');
        inputRow.innerHTML =
            '<textarea class="mpc-textarea" id="mpc-input" placeholder="Nhắn tin… (Enter gửi · Shift+Enter xuống dòng)" maxlength="' + MAX_MSG_LEN + '" rows="1"></textarea>' +
            '<button class="mpc-send-btn" id="mpc-send" title="Gửi (Enter)">↑</button>';
        wrap.appendChild(inputRow);

        return wrap;
    }

    function bindInputEvents() {
        var input   = document.getElementById('mpc-input');
        var sendBtn = document.getElementById('mpc-send');
        var rqCancel = document.getElementById('mpc-rq-cancel');
        if (!input || !sendBtn) return;

        rqCancel && rqCancel.addEventListener('click', clearReplyQuote);

        /* Auto-resize textarea */
        input.addEventListener('input', function() {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
            /* Typing indicator */
            if (STATE.activeConv) sendTyping(STATE.activeConv);
        });
        /* Poll typing mỗi 2s khi ở chat view.
           Xoá interval cũ trước khi tạo mới → tránh tích lũy nhiều interval
           khi bindInputEvents() được gọi lại (memory/CPU leak). */
        if (STATE._typingPoll) { clearInterval(STATE._typingPoll); STATE._typingPoll = null; }
        STATE._typingPoll = setInterval(function() {
            if (STATE.activeConv && STATE.view === 'chat') {
                pollTyping(STATE.activeConv);
            } else {
                clearInterval(STATE._typingPoll);
                STATE._typingPoll = null;
            }
        }, 2000);

        /* Slash command autocomplete */
        buildSlashMenu(input);

        /* Ctrl+Enter hoặc Enter (không Shift) để gửi */
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                doSend();
            }
        });

        sendBtn.addEventListener('click', doSend);
    }

    function doSend() {
        var input   = document.getElementById('mpc-input');
        var conv    = STATE.activeConv;
        if (!input || !conv) return;
        var content = input.value.trim();
        if (!content) return;

        /* Kiểm tra chặn */
        if (!conv.isGroup && conv.partner && isBlocked(conv.partner)) {
            setStatus('Bạn đã chặn người này. Bỏ chặn để nhắn tin.', 'err');
            return;
        }

        /* Kiểm duyệt nội dung (MAPLE-Moderation dùng chung) — chặn từ ngữ vi phạm */
        var _M = (window.MAPLE && window.MAPLE.Moderation);
        if (_M && typeof _M.check === 'function') {
            var mod = _M.check(content, { minLen: 1, maxLen: MAX_MSG_LEN, allcaps: false });
            if (mod.blocked) {
                setStatus(mod.reason || 'Tin nhắn chứa nội dung không phù hợp.', 'err');
                return;
            }
        }

        var rTo = replyingTo ? { id: replyingTo.id, from: replyingTo.from, text: replyingTo.text } : null;
        clearReplyQuote();
        input.value = ''; input.style.height = 'auto';

        /* Optimistic: hiện tin ngay, không đợi API */
        var tempMsg = {
            id: 'temp-' + Date.now(), from: CURRENT_USER,
            content: content, replyTo: rTo,
            ts: new Date().toISOString(), editedAt: null,
            deleted: false, reactions: {}, _pending: true
        };
        var data = STATE.convData[conv.id];
        if (!data) data = STATE.convData[conv.id] = { id: conv.id, messages: [], participants: [] };
        data.messages.push(tempMsg);
        renderMessages(data);
        scrollToBottom();

        sendMessage(conv, content, rTo, function(ok, err, realMsg) {
            /* Xóa tin tạm, thay bằng tin thật */
            var d = STATE.convData[conv.id];
            if (d) d.messages = d.messages.filter(function(m){ return m.id !== tempMsg.id; });
            if (!ok) {
                setStatus(err || 'Không gửi được.', 'err');
                if (d) renderMessages(d);
                return;
            }
            /* realMsg đã được push vào d.messages bởi sendMessage, re-render */
            if (d) renderMessages(d);
        });
    }

    /* Slash command menu */
    function buildSlashMenu(textarea) {
        var CMDS = [
            { cmd: 'image',   icon: '🖼️', desc: 'Nhúng ảnh từ URL' },
            { cmd: 'quote',   icon: '💬', desc: 'Blockquote' },
            { cmd: 'spoiler', icon: '🙈', desc: 'Ẩn nội dung' },
            { cmd: 'code',    icon: '💻', desc: 'Code block' },
            { cmd: 'bold',    icon: '𝐁',  desc: 'In đậm' },
            { cmd: 'link',    icon: '🔗', desc: 'Đính kèm link' },
            { cmd: 'hr',      icon: '━',  desc: 'Đường kẻ' },
        ];
        var menu = null;

        function getQuery() {
            var m = textarea.value.slice(0, textarea.selectionStart).match(/\/(\w*)$/);
            return m ? m[1].toLowerCase() : null;
        }
        function destroyMenu() { if (menu && menu.parentNode) menu.parentNode.removeChild(menu); menu = null; }
        function render(items) {
            destroyMenu(); if (!items.length) return;
            menu = el('div', 'mpc-slash-menu');
            items.forEach(function(item, i) {
                var row = el('div', 'mpc-slash-item' + (i === 0 ? ' focused' : ''));
                row.innerHTML = '<span>' + item.icon + '</span><span class="mpc-slash-name">/' + esc(item.cmd) + '</span><span class="mpc-slash-desc">' + esc(item.desc) + '</span>';
                row.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    var pos = textarea.selectionStart;
                    var before = textarea.value.slice(0, pos).replace(/\/\w*$/, '/' + item.cmd + (item.cmd === 'hr' ? '' : ':'));
                    var after  = textarea.value.slice(pos);
                    textarea.value = before + after;
                    textarea.setSelectionRange(before.length, before.length);
                    destroyMenu(); textarea.focus();
                });
                menu.appendChild(row);
            });
            textarea.parentNode.style.position = 'relative';
            textarea.parentNode.appendChild(menu);
        }

        textarea.addEventListener('input', function() {
            var q = getQuery();
            if (q === null) { destroyMenu(); return; }
            render(CMDS.filter(function(c){ return c.cmd.indexOf(q) === 0; }));
        });
        textarea.addEventListener('blur', function() { setTimeout(destroyMenu, 150); });
        textarea.addEventListener('keydown', function(e) {
            if (!menu) return;
            var items = menu.querySelectorAll('.mpc-slash-item');
            if (e.key === 'Escape') { destroyMenu(); }
            else if (e.key === 'ArrowDown') {
                e.preventDefault();
                var fi = menu.querySelector('.focused');
                var idx = Array.from(items).indexOf(fi);
                items.forEach(function(it){ it.classList.remove('focused'); });
                if (items[(idx + 1) % items.length]) items[(idx + 1) % items.length].classList.add('focused');
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                var fi2 = menu.querySelector('.focused');
                var idx2 = Array.from(items).indexOf(fi2);
                items.forEach(function(it){ it.classList.remove('focused'); });
                if (items[(idx2 - 1 + items.length) % items.length]) items[(idx2 - 1 + items.length) % items.length].classList.add('focused');
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                var f = menu.querySelector('.focused');
                if (f) { e.preventDefault(); f.dispatchEvent(new MouseEvent('mousedown')); }
            }
        });
    }

    /* ── FRIENDS VIEW ── */
    function showFriendsView() {
        STATE.view = 'friends';
        var body = UI.body;
        body.innerHTML = '';

        var hdr = el('div', 'mpc-chat-header');
        hdr.innerHTML = '<button class="mpc-back-btn" id="mpc-back-friends">← Quay lại</button><div class="mpc-chat-title">👥 Bạn bè</div>';
        body.appendChild(hdr);
        document.getElementById('mpc-back-friends').addEventListener('click', showInboxView);

        /* Tab bar: BẠN BÈ | LỜI MỜI (N) */
        var reqCount = STATE.friendReqs.length;
        var tabBar = el('div', 'mpc-req-tab-bar');
        tabBar.innerHTML =
            '<button class="mpc-req-tab active" id="mpc-fr-tab-friends">BẠN BÈ</button>' +
            '<button class="mpc-req-tab" id="mpc-fr-tab-reqs">LỜI MỜI' + (reqCount ? ' (' + reqCount + ')' : '') + '</button>';
        body.appendChild(tabBar);

        var panelFriends = el('div'); panelFriends.id = 'mpc-fr-panel-friends';
        var panelReqs    = el('div'); panelReqs.id = 'mpc-fr-panel-reqs'; panelReqs.style.display = 'none';
        body.appendChild(panelFriends);
        body.appendChild(panelReqs);

        /* Switch tab */
        document.getElementById('mpc-fr-tab-friends').addEventListener('click', function() {
            document.getElementById('mpc-fr-tab-friends').classList.add('active');
            document.getElementById('mpc-fr-tab-reqs').classList.remove('active');
            panelFriends.style.display = '';
            panelReqs.style.display = 'none';
        });
        document.getElementById('mpc-fr-tab-reqs').addEventListener('click', function() {
            document.getElementById('mpc-fr-tab-reqs').classList.add('active');
            document.getElementById('mpc-fr-tab-friends').classList.remove('active');
            panelFriends.style.display = 'none';
            panelReqs.style.display = '';
        });

        /* ── Panel BẠN BÈ ── */
        var friendSection = el('div', 'mpc-section');
        friendSection.innerHTML = '<div class="mpc-section-title">// DANH SÁCH BẠN BÈ (' + STATE.friends.length + ')</div>';

        if (!STATE.friends.length) {
            var epF = el('div', 'mpc-empty-sm'); epF.textContent = 'Chưa có bạn bè nào. Tìm kiếm bên dưới!';
            friendSection.appendChild(epF);
        } else {
            STATE.friends.forEach(function(fname) {
                var row = el('div', 'mpc-friend-row');
                var avEl = buildChatAvEl(fname, '32px');
                row.appendChild(avEl);
                var nameSpan = el('span', 'mpc-friend-name'); nameSpan.textContent = fname;
                row.appendChild(nameSpan);
                var chatBtn = el('button', 'mpc-chat-friend-btn');
                chatBtn.textContent = '💬 Chat';
                chatBtn.addEventListener('click', function() {
                    startConversation(fname, function(convId, conv) {
                        if (!convId) return setStatus('Không thể mở chat.', 'err');
                        var meta = STATE.inbox.filter(function(c){ return c.convId === convId; })[0] ||
                            { convId: convId, partner: fname, isGroup: false, title: fname, unread: 0, ts: new Date().toISOString(), owner: CURRENT_USER };
                        openConversation(meta);
                    });
                });
                row.appendChild(chatBtn);
                friendSection.appendChild(row);
            });
        }
        panelFriends.appendChild(friendSection);

        /* Add friend search */
        var addSection = el('div', 'mpc-section');
        addSection.innerHTML =
            '<div class="mpc-section-title">// THÊM BẠN</div>' +
            '<div class="mpc-search-row">' +
            '<input class="mpc-search-input" id="mpc-add-friend-input" placeholder="Tìm tên người dùng…" type="text">' +
            '<button class="mpc-send-btn" id="mpc-add-friend-btn" style="padding:0 12px;">Tìm</button>' +
            '</div>' +
            '<div id="mpc-user-results"></div>';
        panelFriends.appendChild(addSection);

        var addInput   = document.getElementById('mpc-add-friend-input');
        var addBtn2    = document.getElementById('mpc-add-friend-btn');
        var resultsEl  = document.getElementById('mpc-user-results');

        function doSearch() {
            var q = addInput.value.trim();
            if (!q) return;
            searchUsers(q, function(names) {
                resultsEl.innerHTML = '';
                if (!names.length) { resultsEl.innerHTML = '<div class="mpc-empty-sm">Không tìm thấy.</div>'; return; }
                names.forEach(function(name) {
                    var isFriend  = STATE.friends.indexOf(name) !== -1;
                    var isPending = STATE.pendingReqs.indexOf(name) !== -1;
                    var row = el('div', 'mpc-friend-row');
                    var avEl = buildChatAvEl(name, '32px'); row.appendChild(avEl);
                    var nameSpan = el('span', 'mpc-friend-name'); nameSpan.textContent = name; row.appendChild(nameSpan);
                    if (isFriend) {
                        var t = el('span', 'mpc-tag-friend'); t.textContent = '✔ Bạn bè'; row.appendChild(t);
                    } else if (isPending) {
                        var t2 = el('span', 'mpc-tag-pending'); t2.textContent = '⏳ Đã gửi'; row.appendChild(t2);
                    } else {
                        var addB = el('button', 'mpc-add-btn'); addB.textContent = '➕ Kết bạn';
                        addB.addEventListener('click', function() {
                            sendFriendRequest(name, function(ok, err) {
                                if (ok) { addB.outerHTML = '<span class="mpc-tag-pending">⏳ Đã gửi</span>'; setStatus('Đã gửi lời mời đến ' + name, 'ok'); }
                                else setStatus(err || 'Lỗi.', 'err');
                            });
                        });
                        row.appendChild(addB);
                    }
                    resultsEl.appendChild(row);
                });
            });
        }

        addBtn2.addEventListener('click', doSearch);
        addInput.addEventListener('keydown', function(e){ if (e.key === 'Enter') doSearch(); });

        /* ── Panel LỜI MỜI ── */
        var reqInnerSection = el('div', 'mpc-section');
        if (!STATE.friendReqs.length) {
            reqInnerSection.innerHTML = '<div class="mpc-empty-sm">Không có lời mời nào.</div>';
        } else {
            STATE.friendReqs.forEach(function(req) {
                var item = el('div', 'mpc-req-item');
                var avEl = buildChatAvEl(req.from, '32px');
                item.appendChild(avEl);
                var nameSpan = el('span', 'mpc-req-name'); nameSpan.textContent = req.from; item.appendChild(nameSpan);
                var timeSpan = el('span', 'mpc-req-time'); timeSpan.textContent = fmtTime(req.ts); item.appendChild(timeSpan);
                var acceptBtn = el('button', 'mpc-req-btn accept'); acceptBtn.textContent = '✔ Chấp nhận';
                acceptBtn.addEventListener('click', function() {
                    acceptFriendRequest(req.from, function() {
                        setStatus(req.from + ' đã là bạn bè!', 'ok');
                        showFriendsView();
                    });
                });
                var declineBtn = el('button', 'mpc-req-btn decline'); declineBtn.textContent = '✕ Từ chối';
                declineBtn.addEventListener('click', function() {
                    declineFriendRequest(req.from, function() { showFriendsView(); });
                });
                item.appendChild(acceptBtn);
                item.appendChild(declineBtn);
                reqInnerSection.appendChild(item);
            });
        }
        panelReqs.appendChild(reqInnerSection);
    }

    /* ── NEW CHAT VIEW ── */
    function showNewChatView() {
        STATE.view = 'newchat';
        var body = UI.body;
        body.innerHTML = '';

        var hdr = el('div', 'mpc-chat-header');
        hdr.innerHTML = '<button class="mpc-back-btn" id="mpc-back-nc">← Quay lại</button><div class="mpc-chat-title">✉️ Chat mới</div>';
        body.appendChild(hdr);
        document.getElementById('mpc-back-nc').addEventListener('click', showInboxView);

        var content = el('div', 'mpc-section');
        content.innerHTML =
            '<div class="mpc-section-title">// CHỌN NGƯỜI DÙNG</div>' +
            '<div class="mpc-search-row">' +
            '<input class="mpc-search-input" id="mpc-nc-input" placeholder="Tìm tên người dùng…" type="text">' +
            '<button class="mpc-send-btn" id="mpc-nc-search" style="padding:0 12px;">Tìm</button>' +
            '</div>' +
            '<div id="mpc-nc-results"></div>';
        body.appendChild(content);

        /* Friends shortcut */
        if (STATE.friends.length) {
            var friendsShortcut = el('div', 'mpc-section');
            friendsShortcut.innerHTML = '<div class="mpc-section-title">// BẠN BÈ</div>';
            STATE.friends.forEach(function(fname) {
                var row = el('div', 'mpc-friend-row');
                row.innerHTML = '<span class="mpc-friend-av">' + esc(fname.charAt(0).toUpperCase()) + '</span><span class="mpc-friend-name">' + esc(fname) + '</span><button class="mpc-chat-friend-btn" data-name="' + esc(fname) + '">💬 Chat</button>';
                row.querySelector('.mpc-chat-friend-btn').addEventListener('click', function() {
                    openOrStartChat(fname);
                });
                friendsShortcut.appendChild(row);
            });
            body.appendChild(friendsShortcut);
        }

        var ncInput   = document.getElementById('mpc-nc-input');
        var ncSearch  = document.getElementById('mpc-nc-search');
        var ncResults = document.getElementById('mpc-nc-results');

        function doNcSearch() {
            searchUsers(ncInput.value.trim(), function(names) {
                ncResults.innerHTML = '';
                names.forEach(function(name) {
                    var row = el('div', 'mpc-friend-row');
                    row.innerHTML = '<span class="mpc-friend-av">' + esc(name.charAt(0).toUpperCase()) + '</span><span class="mpc-friend-name">' + esc(name) + '</span><button class="mpc-chat-friend-btn">💬 Chat</button>';
                    row.querySelector('.mpc-chat-friend-btn').addEventListener('click', function() { openOrStartChat(name); });
                    ncResults.appendChild(row);
                });
                if (!names.length) ncResults.innerHTML = '<div class="mpc-empty-sm">Không tìm thấy.</div>';
            });
        }
        ncSearch.addEventListener('click', doNcSearch);
        ncInput.addEventListener('keydown', function(e){ if (e.key === 'Enter') doNcSearch(); });
    }

    function openOrStartChat(partner) {
        startConversation(partner, function(convId, conv) {
            if (!convId) return setStatus('Không thể tạo cuộc trò chuyện.', 'err');
            var meta = STATE.inbox.filter(function(c){ return c.convId === convId; })[0] ||
                { convId: convId, partner: partner, isGroup: false, title: partner, unread: 0, ts: new Date().toISOString(), owner: CURRENT_USER };
            if (IS_FULL_PAGE) { renderFPConvList(); openConvFullPage(meta); }
            else openConversation(meta);
        });
    }

    /* ── NEW GROUP VIEW ── */
    function showNewGroupView() {
        STATE.view = 'newgroup';
        var body = UI.body;
        body.innerHTML = '';

        var hdr = el('div', 'mpc-chat-header');
        hdr.innerHTML = '<button class="mpc-back-btn" id="mpc-back-ng">← Quay lại</button><div class="mpc-chat-title">👥+ Tạo nhóm</div>';
        body.appendChild(hdr);
        document.getElementById('mpc-back-ng').addEventListener('click', showInboxView);

        var selectedMembers = [];
        var content = el('div', 'mpc-section');
        content.innerHTML =
            '<div class="mpc-section-title">// TÊN NHÓM</div>' +
            '<input class="mpc-search-input" id="mpc-group-name" placeholder="Tên nhóm…" type="text" style="margin-bottom:12px;"><br>' +
            '<div class="mpc-section-title">// THÊM THÀNH VIÊN</div>' +
            '<div class="mpc-search-row">' +
            '<input class="mpc-search-input" id="mpc-ng-input" placeholder="Tìm người dùng…" type="text">' +
            '<button class="mpc-send-btn" id="mpc-ng-search" style="padding:0 12px;">Tìm</button>' +
            '</div>' +
            '<div id="mpc-ng-selected" class="mpc-selected-members"></div>' +
            '<div id="mpc-ng-results"></div>' +
            '<button class="mpc-send-btn" id="mpc-create-group" style="margin-top:12px;width:100%;padding:10px;">✔ Tạo nhóm</button>';
        body.appendChild(content);

        function renderSelected() {
            var sel = document.getElementById('mpc-ng-selected');
            sel.innerHTML = selectedMembers.map(function(m) {
                return '<span class="mpc-member-chip">' + esc(m) + ' <span class="mpc-rm-member" data-name="' + esc(m) + '">✕</span></span>';
            }).join('');
            sel.querySelectorAll('.mpc-rm-member').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    selectedMembers = selectedMembers.filter(function(n){ return n !== btn.dataset.name; });
                    renderSelected();
                });
            });
        }

        var ngInput   = document.getElementById('mpc-ng-input');
        var ngSearch  = document.getElementById('mpc-ng-search');
        var ngResults = document.getElementById('mpc-ng-results');

        ngSearch.addEventListener('click', function() {
            searchUsers(ngInput.value.trim(), function(names) {
                ngResults.innerHTML = '';
                names.forEach(function(name) {
                    var row = el('div', 'mpc-friend-row');
                    var added = selectedMembers.indexOf(name) !== -1;
                    row.innerHTML = '<span class="mpc-friend-av">' + esc(name.charAt(0).toUpperCase()) + '</span><span class="mpc-friend-name">' + esc(name) + '</span>' +
                        (added ? '<span class="mpc-tag-friend">✔ Đã thêm</span>' : '<button class="mpc-add-btn">+ Thêm</button>');
                    var addBtn = row.querySelector('.mpc-add-btn');
                    if (addBtn) {
                        addBtn.addEventListener('click', function() {
                            if (selectedMembers.indexOf(name) === -1) selectedMembers.push(name);
                            renderSelected();
                            addBtn.outerHTML = '<span class="mpc-tag-friend">✔ Đã thêm</span>';
                        });
                    }
                    ngResults.appendChild(row);
                });
            });
        });
        ngInput.addEventListener('keydown', function(e){ if (e.key === 'Enter') ngSearch.click(); });

        /* Cũng load friends để chọn nhanh */
        if (STATE.friends.length) {
            var fSec = el('div', 'mpc-section');
            fSec.innerHTML = '<div class="mpc-section-title">// BẠN BÈ</div>';
            STATE.friends.forEach(function(fname) {
                var row = el('div', 'mpc-friend-row');
                var added = selectedMembers.indexOf(fname) !== -1;
                row.innerHTML = '<span class="mpc-friend-av">' + esc(fname.charAt(0).toUpperCase()) + '</span><span class="mpc-friend-name">' + esc(fname) + '</span>' +
                    '<button class="mpc-add-btn" data-name="' + esc(fname) + '">+ Thêm</button>';
                row.querySelector('.mpc-add-btn').addEventListener('click', function() {
                    if (selectedMembers.indexOf(fname) === -1) { selectedMembers.push(fname); renderSelected(); }
                    setStatus(fname + ' đã thêm vào nhóm.', 'ok');
                });
                fSec.appendChild(row);
            });
            body.appendChild(fSec);
        }

        document.getElementById('mpc-create-group').addEventListener('click', function() {
            var gname = (document.getElementById('mpc-group-name').value || '').trim();
            if (!gname) return setStatus('Nhập tên nhóm.', 'err');
            if (!selectedMembers.length) return setStatus('Thêm ít nhất 1 thành viên.', 'err');
            startGroupChat(selectedMembers, gname, function(gid, conv) {
                if (!gid) return setStatus('Không thể tạo nhóm.', 'err');
                setStatus('Đã tạo nhóm ' + gname + '!', 'ok');
                var meta = { convId: gid, partner: null, isGroup: true, title: gname, unread: 0, ts: new Date().toISOString(), owner: CURRENT_USER };
                openConversation(meta);
            });
        });
    }

    /* ════════════════════════════════════════════════════════════════════════
       UNREAD BADGE + TITLE BLINK
    ════════════════════════════════════════════════════════════════════════ */
    function updateUnreadBadge() {
        var total = STATE.inbox.reduce(function(s, c){ return s + (c.unread || 0); }, 0);
        STATE.unreadTotal = total;
        if (!UI.badge) return;
        if (total > 0) {
            UI.badge.textContent = total > 99 ? '99+' : total;
            UI.badge.style.display = 'flex';
        } else {
            UI.badge.style.display = 'none';
        }
        /* Title blink */
        if (total > 0 && !document.hasFocus() && !document.hidden) {
            startTitleBlink(total);
        } else {
            stopTitleBlink();
        }
    }

    var originalTitle = document.title;
    function startTitleBlink(count) {
        if (STATE.titleBlink) return;
        var alt = false;
        STATE.titleBlink = setInterval(function() {
            document.title = alt ? originalTitle : '(' + count + ') Tin nhắn mới — MAPLE';
            alt = !alt;
        }, 1500);
    }
    function stopTitleBlink() {
        if (STATE.titleBlink) { clearInterval(STATE.titleBlink); STATE.titleBlink = null; document.title = originalTitle; }
    }

    function updateFriendReqBadge() {
        var badge = document.getElementById('mpc-freq-badge');
        if (!badge) return;
        if (STATE.friendReqs.length > 0) { badge.style.display = 'inline'; badge.textContent = STATE.friendReqs.length; }
        else badge.style.display = 'none';
    }

    /* UserWelcome / SocialProfile — kiểm tra board messages chưa đọc */
    function checkBoardMessages() {
        var badge = document.getElementById('mpc-board-badge');
        if (!badge) return;
        /* SP inject wgUserBoardNewMessageCount vào mw.config */
        var count = mw.config.get('wgUserBoardNewMessageCount');
        if (count && count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }
    }

    /* ════════════════════════════════════════════════════════════════════════
       PANEL BODY MutationObserver — bind input events sau khi DOM thay đổi
    ════════════════════════════════════════════════════════════════════════ */
    function watchForInput() {
        var obs = new MutationObserver(function() {
            var input = document.getElementById('mpc-input');
            if (input && !input.dataset.bound) {
                input.dataset.bound = '1';
                bindInputEvents();
            }
        });
        if (UI.body) obs.observe(UI.body, { childList: true, subtree: true });
    }

    /* ════════════════════════════════════════════════════════════════════════
       FULL PAGE MODE (Người_dùng:[Tên]/Chat)
    ════════════════════════════════════════════════════════════════════════ */
    function maybeFullPage() {
        /* wgPageName luôn dùng _ (ví dụ: Người_dùng:Beestudio2026/Chat) */
        var raw = cfg.wgPageName || '';
        var norm = raw.replace(/ /g, '_');
        console.log('[MAPLE-Chat] wgPageName:', raw, '| norm:', norm, '| ns:', cfg.wgNamespaceNumber);

        /* Namespace 2 = User namespace — cách đáng tin cậy nhất */
        /* Chỉ match /Chat (không phải /Chat/Inbox hay /Chat/G-xxx) */
        if (cfg.wgNamespaceNumber === 2 && /\/Chat\/?$/.test(norm)) {
            buildFullPage();
            return;
        }
        /* Fallback text match */
        if (/^(?:Ng.{1,15}i_d.{1,5}ng|User):([^/]+)\/Chat\/?$/i.test(norm)) {
            buildFullPage();
        }
    }

    var IS_FULL_PAGE = false;

    /* Bộ lọc danh sách hội thoại ở full page */
    var FP = { q: '', tab: 'all' };

    function buildFullPage() {
        var mwText = document.querySelector('#mw-content-text');
        if (!mwText) return;

        verifyChatAccess(true, function () {
            IS_FULL_PAGE = true;

            /* Ẩn chrome wiki + panel/FAB nổi — trang /Chat là một app riêng */
            var s = document.createElement('style');
            s.textContent =
                '.vector-column-start,#mw-panel,.vector-column-end,#footer,.mw-footer-container,' +
                '.vector-page-titlebar,.vector-page-toolbar,.mw-body-header,' +
                '#siteSub,#contentSub,.printfooter,#catlinks,.mw-indicators{display:none!important}' +
                '.mw-page-container,#mw-content-text,.mw-body,#content,' +
                '.vector-column-content,.mw-page-container-inner{' +
                'padding:0!important;margin:0!important;max-width:100%!important;' +
                'width:100%!important;background:transparent!important;border:none!important;box-shadow:none!important}' +
                '#firstHeading{display:none!important}' +
                '#mpc-fab{display:none!important}' +
                '#mpc-shell{display:none!important}';
            document.head.appendChild(s);
            mwText.innerHTML = '';

            STATE.open = true;
            if (UI.panel) UI.panel.style.display = 'none';

            /* ── App 3 cột riêng cho full page ── */
            var app = el('div', 'mpc-fp');
            app.id = 'mpc-fp';
            app.innerHTML =
                '<aside class="mpc-fp-rail">' +
                  '<div class="mpc-fp-brand"><span class="mpc-slash">//</span> M.A.P.L.E CHAT</div>' +
                  '<div class="mpc-fp-me" id="mpc-fp-me"></div>' +
                  '<div class="mpc-fp-actions">' +
                    '<button class="mpc-fp-action" id="mpc-fp-new">✉️ Chat mới</button>' +
                    '<button class="mpc-fp-action" id="mpc-fp-newgroup">👥﹢ Nhóm</button>' +
                    '<button class="mpc-fp-action" id="mpc-fp-friends">👥 Bạn bè<span class="mpc-freq-badge" id="mpc-freq-badge" style="display:none">!</span></button>' +
                  '</div>' +
                  '<div class="mpc-fp-search-wrap">' +
                    '<input class="mpc-fp-search" id="mpc-fp-search" type="text" placeholder="Tìm cuộc trò chuyện…">' +
                  '</div>' +
                  '<div class="mpc-fp-tabs">' +
                    '<button class="mpc-fp-tab active" data-tab="all">Tất cả</button>' +
                    '<button class="mpc-fp-tab" data-tab="direct">Trực tiếp</button>' +
                    '<button class="mpc-fp-tab" data-tab="group">Nhóm</button>' +
                  '</div>' +
                  '<div class="mpc-fp-convs" id="mpc-fp-convs"></div>' +
                  '<div class="mpc-panel-status" id="mpc-status"></div>' +
                '</aside>' +
                '<main class="mpc-fp-main" id="mpc-fp-main"></main>' +
                '<aside class="mpc-fp-info" id="mpc-fp-info"></aside>';
            mwText.appendChild(app);

            /* Tham chiếu UI */
            UI.fpConvs   = document.getElementById('mpc-fp-convs');
            UI.body      = UI.fpConvs;  /* để pollUpdates() → renderInboxList() refresh đúng chỗ */
            UI.mainArea  = document.getElementById('mpc-fp-main');
            UI.infoArea  = document.getElementById('mpc-fp-info');
            UI.statusBar = document.getElementById('mpc-status');
            UI.badge     = document.getElementById('mpc-badge');

            /* Quan sát input trong khu vực main để bind sự kiện */
            watchForInputIn(UI.mainArea);

            /* Sự kiện rail */
            document.getElementById('mpc-fp-new').addEventListener('click', showNewChatViewFP);
            document.getElementById('mpc-fp-newgroup').addEventListener('click', showNewGroupViewFP);
            document.getElementById('mpc-fp-friends').addEventListener('click', showFriendsViewFP);

            var searchEl = document.getElementById('mpc-fp-search');
            searchEl.addEventListener('input', function() {
                FP.q = searchEl.value.trim().toLowerCase();
                renderFPConvList();
            });
            app.querySelectorAll('.mpc-fp-tab').forEach(function(t) {
                t.addEventListener('click', function() {
                    app.querySelectorAll('.mpc-fp-tab').forEach(function(x){ x.classList.remove('active'); });
                    t.classList.add('active');
                    FP.tab = t.dataset.tab;
                    renderFPConvList();
                });
            });

            renderFPMe();
            showWelcomeFP();
            startPresence();

            loadInbox(function() {
                loadFriends(function() {
                    loadFriendRequests(function() {
                        loadBlocked(function() {
                            updateUnreadBadge();
                            updateFriendReqBadge();
                            renderFPConvList();
                            startPolling();
                        });
                    });
                });
            });
        });
    }

    /* Thẻ hồ sơ người dùng hiện tại trên rail */
    function renderFPMe() {
        var me = document.getElementById('mpc-fp-me');
        if (!me) return;
        me.innerHTML = '';
        var av = buildChatAvEl(CURRENT_USER, '44px');
        av.classList.add('mpc-fp-me-av');
        me.appendChild(av);
        var info = el('div', 'mpc-fp-me-info');
        info.innerHTML =
            '<div class="mpc-fp-me-name">' + esc(CURRENT_USER) + '</div>' +
            '<div class="mpc-fp-me-status"><span class="mpc-online-dot"></span>Trực tuyến</div>';
        me.appendChild(info);
        var prof = el('a', 'mpc-fp-me-link');
        prof.href = '/wiki/Người_dùng:' + encodeURIComponent(CURRENT_USER);
        prof.title = 'Trang cá nhân';
        prof.textContent = '👤';
        me.appendChild(prof);
    }

    /* Danh sách hội thoại có lọc theo tab + từ khoá */
    function renderFPConvList() {
        var box = UI.fpConvs;
        if (!box) return;
        box.innerHTML = '';

        var items = STATE.inbox.slice().sort(function(a,b){ return new Date(b.ts) - new Date(a.ts); });
        items = items.filter(function(c) {
            if (FP.tab === 'direct' && c.isGroup) return false;
            if (FP.tab === 'group'  && !c.isGroup) return false;
            if (FP.q) {
                var name = (c.title || c.partner || '').toLowerCase();
                var last = (c.lastMsg || '').toLowerCase();
                if (name.indexOf(FP.q) === -1 && last.indexOf(FP.q) === -1) return false;
            }
            return true;
        });

        if (!items.length) {
            box.innerHTML = '<div class="mpc-empty-sm">' +
                (FP.q ? 'Không khớp “' + esc(FP.q) + '”.' : 'Chưa có cuộc trò chuyện. Nhấn ✉️ Chat mới.') +
                '</div>';
            return;
        }

        items.forEach(function(conv) {
            var isActive = STATE.activeConv && STATE.activeConv.id === conv.convId;
            var item = el('div', 'mpc-conv-item' + (conv.unread ? ' mpc-conv-unread' : '') + (isActive ? ' mpc-conv-active' : ''));
            item.dataset.convid = conv.convId;

            if (conv.isGroup) {
                var avG = el('div', 'mpc-conv-av'); avG.textContent = '👥'; item.appendChild(avG);
            } else {
                var fpPartnerName = conv.partner || conv.title || '?';
                var avEl = buildChatAvEl(fpPartnerName, '40px');
                avEl.className = 'mpc-conv-av mpc-msg-av';
                /* Online dot */
                var fpDot = buildOnlineDot(false);
                avEl.appendChild(fpDot);
                (function(de, pn) {
                    getPresence(pn, function(online) {
                        de.className = 'mpc-online-dot' + (online ? '' : ' mpc-offline-dot');
                    });
                })(fpDot, fpPartnerName);
                item.appendChild(avEl);
            }

            var infoD = el('div', 'mpc-conv-info');
            var nameD = el('div', 'mpc-conv-name');
            nameD.textContent = conv.title || conv.partner || conv.convId;
            if (conv.isGroup) { var gb = el('span', 'mpc-group-badge'); gb.textContent = 'NHÓM'; nameD.appendChild(gb); }
            var pv = el('div', 'mpc-conv-preview'); pv.textContent = (conv.lastMsg || '').slice(0, 50);
            infoD.appendChild(nameD); infoD.appendChild(pv);

            var metaD = el('div', 'mpc-conv-meta');
            var tD = el('div', 'mpc-conv-time'); tD.textContent = fmtTime(conv.ts); metaD.appendChild(tD);
            if (conv.unread) { var bd = el('div', 'mpc-conv-badge'); bd.textContent = conv.unread; metaD.appendChild(bd); }

            item.appendChild(infoD); item.appendChild(metaD);
            item.addEventListener('click', function() { openConvFullPage(conv); });
            box.appendChild(item);
        });
    }

    /* Màn hình chào mừng giữa app khi chưa chọn hội thoại */
    function showWelcomeFP() {
        STATE.view = 'inbox';
        adjustPollingRate();
        var main = UI.mainArea;
        if (!main) return;
        if (UI.infoArea) UI.infoArea.classList.remove('open');

        var total   = STATE.inbox.length;
        var unread  = STATE.inbox.reduce(function(s,c){ return s + (c.unread || 0); }, 0);
        var friends = STATE.friends.length;

        main.innerHTML =
            '<div class="mpc-fp-welcome">' +
              '<div class="mpc-fp-welcome-logo">💬</div>' +
              '<div class="mpc-fp-welcome-title">M.A.P.L.E CHAT</div>' +
              '<div class="mpc-fp-welcome-sub">Chọn một cuộc trò chuyện bên trái, hoặc bắt đầu cuộc mới.</div>' +
              '<div class="mpc-fp-welcome-stats">' +
                '<div class="mpc-fp-stat"><span class="mpc-fp-stat-num">' + total   + '</span><span class="mpc-fp-stat-lbl">HỘI THOẠI</span></div>' +
                '<div class="mpc-fp-stat"><span class="mpc-fp-stat-num">' + unread  + '</span><span class="mpc-fp-stat-lbl">CHƯA ĐỌC</span></div>' +
                '<div class="mpc-fp-stat"><span class="mpc-fp-stat-num">' + friends + '</span><span class="mpc-fp-stat-lbl">BẠN BÈ</span></div>' +
              '</div>' +
              '<div class="mpc-fp-welcome-hint">Mẹo: dùng /image /quote /spoiler /code /bold /link /hr · @mention bạn bè</div>' +
            '</div>';
    }

    /* Full page: mở conversation vào khu vực main + thông tin bên phải */
    function openConvFullPage(convMeta) {
        STATE.view = 'chat';
        adjustPollingRate();
        STATE.activeConv = {
            id:      convMeta.convId,
            partner: convMeta.partner,
            isGroup: convMeta.isGroup,
            title:   convMeta.title,
            owner:   convMeta.owner || CURRENT_USER
        };
        convMeta.unread = 0;
        saveInbox();
        updateUnreadBadge();
        renderFPConvList(); /* cập nhật rail + highlight active */

        var main = UI.mainArea;
        if (!main) return;
        main.innerHTML = '';

        /* Header */
        var hdr = el('div', 'mpc-chat-header mpc-fp-chat-header');
        var partnerFP = STATE.activeConv.isGroup
            ? (STATE.activeConv.title || 'Nhóm')
            : (STATE.activeConv.partner || '?');
        var avFP = buildChatAvEl(partnerFP, '36px');
        avFP.className = 'mpc-chat-av';
        hdr.appendChild(avFP);

        var titleWrap = el('div', 'mpc-chat-title-wrap');
        var titleDiv  = el('div', 'mpc-chat-title');
        titleDiv.textContent = STATE.activeConv.title || STATE.activeConv.partner || STATE.activeConv.id;
        if (STATE.activeConv.isGroup) { var gb = el('span', 'mpc-group-badge'); gb.textContent = 'NHÓM'; titleDiv.appendChild(gb); }
        var bioDiv = el('div', 'mpc-chat-bio'); bioDiv.id = 'mpc-chat-bio';
        titleWrap.appendChild(titleDiv);
        titleWrap.appendChild(bioDiv);
        hdr.appendChild(titleWrap);

        var actionsDiv = el('div', 'mpc-chat-actions');
        /* Nút ẩn/hiện cột thông tin */
        var infoToggle = el('button', 'mpc-hdr-btn');
        infoToggle.title = 'Thông tin'; infoToggle.textContent = 'ⓘ';
        infoToggle.addEventListener('click', function() {
            if (UI.infoArea) UI.infoArea.classList.toggle('open');
        });
        actionsDiv.appendChild(infoToggle);
        hdr.appendChild(actionsDiv);
        main.appendChild(hdr);

        if (!STATE.activeConv.isGroup && STATE.activeConv.partner) {
            fetchUserBio(STATE.activeConv.partner, function(bio) {
                var bioEl = document.getElementById('mpc-chat-bio');
                if (bioEl && bio) bioEl.textContent = bio;
            });
        }

        var msgsEl = el('div', 'mpc-messages');
        msgsEl.id  = 'mpc-messages';
        main.appendChild(msgsEl);
        main.appendChild(buildInputArea(STATE.activeConv));

        /* Bind input ngay (observer chỉ quan sát main area) */
        var inp = document.getElementById('mpc-input');
        if (inp && !inp.dataset.bound) { inp.dataset.bound = '1'; bindInputEvents(); }

        loadConv(STATE.activeConv, function(data) {
            renderMessages(data);
            renderPinnedBanner(data, STATE.activeConv);
            scrollToBottom();
            renderFPInfo(STATE.activeConv, data);
        });

        if (UI.infoArea) UI.infoArea.classList.add('open');
    }

    /* Cột thông tin bên phải: hồ sơ đối phương / thành viên nhóm + media */
    function renderFPInfo(conv, data) {
        var info = UI.infoArea;
        if (!info) return;
        info.innerHTML = '';

        var headName = conv.isGroup ? (conv.title || 'Nhóm') : (conv.partner || '?');
        var head = el('div', 'mpc-fp-info-head');
        var av = buildChatAvEl(headName, '76px');
        av.classList.add('mpc-fp-info-av');
        head.appendChild(av);
        var nm = el('div', 'mpc-fp-info-name'); nm.textContent = headName; head.appendChild(nm);

        if (conv.isGroup) {
            var gtag = el('div', 'mpc-fp-info-tag'); gtag.textContent = 'NHÓM CHAT'; head.appendChild(gtag);
        } else {
            var bio = el('div', 'mpc-fp-info-bio'); bio.id = 'mpc-fp-info-bio'; bio.textContent = '…'; head.appendChild(bio);
            fetchUserBio(conv.partner, function(b) {
                var e = document.getElementById('mpc-fp-info-bio');
                if (e) e.textContent = b || 'Chưa có giới thiệu.';
            });
        }
        info.appendChild(head);

        /* Hành động */
        var acts = el('div', 'mpc-fp-info-actions');
        if (!conv.isGroup && conv.partner) {
            var aProf = el('a', 'mpc-fp-info-btn');
            aProf.href = '/wiki/Người_dùng:' + encodeURIComponent(conv.partner); aProf.target = '_blank';
            aProf.textContent = '👤 Trang cá nhân'; acts.appendChild(aProf);
            var aBoard = el('a', 'mpc-fp-info-btn');
            aBoard.href = mw.util.getUrl('Special:UserBoard/' + conv.partner); aBoard.target = '_blank';
            aBoard.textContent = '◫ User Board'; acts.appendChild(aBoard);

            var isFr = STATE.friends.indexOf(conv.partner) !== -1;
            var isPend = STATE.pendingReqs.indexOf(conv.partner) !== -1;
            if (!isFr && !isPend) {
                var aFriend = el('button', 'mpc-fp-info-btn');
                aFriend.textContent = '➕ Kết bạn';
                aFriend.addEventListener('click', function() {
                    sendFriendRequest(conv.partner, function(ok, err) {
                        if (ok) { aFriend.textContent = '⏳ Đã gửi'; aFriend.disabled = true; setStatus('Đã gửi lời mời.', 'ok'); }
                        else setStatus(err || 'Lỗi.', 'err');
                    });
                });
                acts.appendChild(aFriend);
            } else {
                var tag = el('div', 'mpc-fp-info-frtag');
                tag.textContent = isFr ? '✔ Đã là bạn bè' : '⏳ Đã gửi lời mời';
                acts.appendChild(tag);
            }
        }
        info.appendChild(acts);

        /* Thành viên nhóm */
        if (conv.isGroup) {
            var parts = (data && data.participants) || [];
            var memSec = el('div', 'mpc-fp-info-sec');
            memSec.innerHTML = '<div class="mpc-fp-info-sec-title">// THÀNH VIÊN (' + parts.length + ')</div>';
            parts.forEach(function(p) {
                var row = el('div', 'mpc-fp-info-member');
                var pav = buildChatAvEl(p, '26px'); row.appendChild(pav);
                var pn = el('span', 'mpc-fp-info-member-name'); pn.textContent = p + (p === CURRENT_USER ? ' (bạn)' : ''); row.appendChild(pn);
                memSec.appendChild(row);
            });
            info.appendChild(memSec);
        }

        /* Media đã chia sẻ — gom ảnh từ /image trong tin nhắn */
        var msgs = (data && data.messages) || [];
        var imgs = [];
        msgs.forEach(function(m) {
            if (m.deleted || !m.content) return;
            var mm = m.content.match(/\/image:\s*(\S+)/);
            if (mm) imgs.push(mm[1]);
        });
        var mediaSec = el('div', 'mpc-fp-info-sec');
        mediaSec.innerHTML = '<div class="mpc-fp-info-sec-title">// ẢNH ĐÃ CHIA SẺ (' + imgs.length + ')</div>';
        if (imgs.length) {
            var grid = el('div', 'mpc-fp-media-grid');
            imgs.slice(-9).reverse().forEach(function(src) {
                var im = document.createElement('img');
                im.className = 'mpc-fp-media-thumb'; im.src = src; im.loading = 'lazy';
                im.onerror = function() { im.style.display = 'none'; };
                im.addEventListener('click', function() { window.open(src, '_blank'); });
                grid.appendChild(im);
            });
            mediaSec.appendChild(grid);
        } else {
            var noM = el('div', 'mpc-empty-sm'); noM.textContent = 'Chưa có ảnh nào.';
            mediaSec.appendChild(noM);
        }
        info.appendChild(mediaSec);
    }

    /* Full page friends view — render trực tiếp vào main area */
    function showFriendsViewFP() {
        if (!IS_FULL_PAGE) { showFriendsView(); return; }
        var main = UI.mainArea;
        if (!main) return;
        STATE.view = 'friends';
        adjustPollingRate();
        if (UI.infoArea) UI.infoArea.classList.remove('open');
        main.innerHTML = '';

        var hdr = el('div', 'mpc-chat-header mpc-fp-chat-header');
        hdr.innerHTML = '<button class="mpc-back-btn" id="mpc-fp-back-fr">← Về</button><div class="mpc-chat-title">👥 Bạn bè</div>';
        main.appendChild(hdr);
        document.getElementById('mpc-fp-back-fr').addEventListener('click', showWelcomeFP);

        /* Tab bar: BẠN BÈ | LỜI MỜI (N) */
        var reqCountFP = STATE.friendReqs.length;
        var tabBarFP = el('div', 'mpc-req-tab-bar');
        tabBarFP.innerHTML =
            '<button class="mpc-req-tab active" id="mpc-fp-fr-tab-friends">BẠN BÈ</button>' +
            '<button class="mpc-req-tab" id="mpc-fp-fr-tab-reqs">LỜI MỜI' + (reqCountFP ? ' (' + reqCountFP + ')' : '') + '</button>';
        main.appendChild(tabBarFP);

        var fpPanelFriends = el('div'); fpPanelFriends.id = 'mpc-fp-fr-panel-friends';
        var fpPanelReqs    = el('div'); fpPanelReqs.id = 'mpc-fp-fr-panel-reqs'; fpPanelReqs.style.display = 'none';
        main.appendChild(fpPanelFriends);
        main.appendChild(fpPanelReqs);

        document.getElementById('mpc-fp-fr-tab-friends').addEventListener('click', function() {
            document.getElementById('mpc-fp-fr-tab-friends').classList.add('active');
            document.getElementById('mpc-fp-fr-tab-reqs').classList.remove('active');
            fpPanelFriends.style.display = '';
            fpPanelReqs.style.display = 'none';
        });
        document.getElementById('mpc-fp-fr-tab-reqs').addEventListener('click', function() {
            document.getElementById('mpc-fp-fr-tab-reqs').classList.add('active');
            document.getElementById('mpc-fp-fr-tab-friends').classList.remove('active');
            fpPanelFriends.style.display = 'none';
            fpPanelReqs.style.display = '';
        });

        /* Friends list */
        var friendSection = el('div', 'mpc-section');
        var fTitle = el('div', 'mpc-section-title');
        fTitle.textContent = '// DANH SÁCH BẠN BÈ (' + STATE.friends.length + ')';
        friendSection.appendChild(fTitle);
        if (!STATE.friends.length) {
            var ep = el('div', 'mpc-empty-sm');
            ep.textContent = 'Chưa có bạn bè nào.';
            friendSection.appendChild(ep);
        } else {
            STATE.friends.forEach(function(fname) {
                var row = el('div', 'mpc-friend-row');
                var avEl = buildChatAvEl(fname, '32px');
                row.appendChild(avEl);
                var nameSpan = el('span', 'mpc-friend-name');
                nameSpan.textContent = fname;
                row.appendChild(nameSpan);
                var chatBtn = el('button', 'mpc-chat-friend-btn');
                chatBtn.textContent = '💬 Chat';
                chatBtn.addEventListener('click', function() {
                    openOrStartChat(fname);
                });
                row.appendChild(chatBtn);
                friendSection.appendChild(row);
            });
        }
        fpPanelFriends.appendChild(friendSection);

        /* Add friend search */
        var addSection = el('div', 'mpc-section');
        addSection.innerHTML =
            '<div class="mpc-section-title">// THÊM BẠN</div>' +
            '<div class="mpc-search-row">' +
            '<input class="mpc-search-input" id="mpc-fp-add-input" placeholder="Tìm tên người dùng…" type="text">' +
            '<button class="mpc-send-btn" id="mpc-fp-add-btn" style="padding:0 12px;">Tìm</button>' +
            '</div><div id="mpc-fp-user-results"></div>';
        fpPanelFriends.appendChild(addSection);

        var addInput  = document.getElementById('mpc-fp-add-input');
        var addBtn    = document.getElementById('mpc-fp-add-btn');
        var resultsEl = document.getElementById('mpc-fp-user-results');

        function doSearch() {
            var q = addInput.value.trim();
            if (!q) return;
            searchUsers(q, function(names) {
                resultsEl.innerHTML = '';
                if (!names.length) { resultsEl.innerHTML = '<div class="mpc-empty-sm">Không tìm thấy.</div>'; return; }
                names.forEach(function(name) {
                    var isFriend  = STATE.friends.indexOf(name) !== -1;
                    var isPending = STATE.pendingReqs.indexOf(name) !== -1;
                    var row = el('div', 'mpc-friend-row');
                    var avEl = buildChatAvEl(name, '32px');
                    row.appendChild(avEl);
                    var nameSpan = el('span', 'mpc-friend-name');
                    nameSpan.textContent = name;
                    row.appendChild(nameSpan);
                    if (isFriend) {
                        var tag = el('span', 'mpc-tag-friend'); tag.textContent = '✔ Bạn bè'; row.appendChild(tag);
                    } else if (isPending) {
                        var tag2 = el('span', 'mpc-tag-pending'); tag2.textContent = '⏳ Đã gửi'; row.appendChild(tag2);
                    } else {
                        var addB = el('button', 'mpc-add-btn'); addB.textContent = '➕ Kết bạn';
                        addB.addEventListener('click', function() {
                            sendFriendRequest(name, function(ok, err) {
                                if (ok) { addB.outerHTML = '<span class="mpc-tag-pending">⏳ Đã gửi</span>'; setStatus('Đã gửi lời mời đến ' + name, 'ok'); }
                                else setStatus(err || 'Lỗi.', 'err');
                            });
                        });
                        row.appendChild(addB);
                    }
                    resultsEl.appendChild(row);
                });
            });
        }
        addBtn.addEventListener('click', doSearch);
        addInput.addEventListener('keydown', function(e){ if (e.key === 'Enter') doSearch(); });

        /* ── Panel LỜI MỜI (FP) ── */
        var reqSecFP = el('div', 'mpc-section');
        if (!STATE.friendReqs.length) {
            reqSecFP.innerHTML = '<div class="mpc-empty-sm">Không có lời mời nào.</div>';
        } else {
            STATE.friendReqs.forEach(function(req) {
                var item = el('div', 'mpc-req-item');
                var avEl = buildChatAvEl(req.from, '32px'); item.appendChild(avEl);
                var nameSpan = el('span', 'mpc-req-name'); nameSpan.textContent = req.from; item.appendChild(nameSpan);
                var timeSpan = el('span', 'mpc-req-time'); timeSpan.textContent = fmtTime(req.ts); item.appendChild(timeSpan);
                var acceptBtn2 = el('button', 'mpc-req-btn accept'); acceptBtn2.textContent = '✔ Chấp nhận';
                acceptBtn2.addEventListener('click', function() {
                    acceptFriendRequest(req.from, function() {
                        setStatus(req.from + ' đã là bạn bè!', 'ok');
                        showFriendsViewFP();
                    });
                });
                var declineBtn2 = el('button', 'mpc-req-btn decline'); declineBtn2.textContent = '✕ Từ chối';
                declineBtn2.addEventListener('click', function() {
                    declineFriendRequest(req.from, function() { showFriendsViewFP(); });
                });
                item.appendChild(acceptBtn2);
                item.appendChild(declineBtn2);
                reqSecFP.appendChild(item);
            });
        }
        fpPanelReqs.appendChild(reqSecFP);
    }

    /* Full page: chat mới — render vào main area */
    function showNewChatViewFP() {
        if (!IS_FULL_PAGE) { showNewChatView(); return; }
        var main = UI.mainArea;
        if (!main) return;
        STATE.view = 'newchat';
        adjustPollingRate();
        if (UI.infoArea) UI.infoArea.classList.remove('open');
        main.innerHTML = '';

        var hdr = el('div', 'mpc-chat-header mpc-fp-chat-header');
        hdr.innerHTML = '<button class="mpc-back-btn" id="mpc-fp-back-nc">← Về</button><div class="mpc-chat-title">✉️ Chat mới</div>';
        main.appendChild(hdr);
        document.getElementById('mpc-fp-back-nc').addEventListener('click', showWelcomeFP);

        var content = el('div', 'mpc-section');
        content.innerHTML =
            '<div class="mpc-section-title">// CHỌN NGƯỜI DÙNG</div>' +
            '<div class="mpc-search-row">' +
            '<input class="mpc-search-input" id="mpc-ncfp-input" placeholder="Tìm tên người dùng…" type="text">' +
            '<button class="mpc-send-btn" id="mpc-ncfp-search" style="padding:0 12px;">Tìm</button>' +
            '</div><div id="mpc-ncfp-results"></div>';
        main.appendChild(content);

        if (STATE.friends.length) {
            var fSec = el('div', 'mpc-section');
            fSec.innerHTML = '<div class="mpc-section-title">// BẠN BÈ</div>';
            STATE.friends.forEach(function(fname) {
                var row = el('div', 'mpc-friend-row');
                var avEl = buildChatAvEl(fname, '32px'); row.appendChild(avEl);
                var nameSpan = el('span', 'mpc-friend-name'); nameSpan.textContent = fname; row.appendChild(nameSpan);
                var btn = el('button', 'mpc-chat-friend-btn'); btn.textContent = '💬 Chat';
                btn.addEventListener('click', function() { openOrStartChat(fname); });
                row.appendChild(btn);
                fSec.appendChild(row);
            });
            main.appendChild(fSec);
        }

        var inp = document.getElementById('mpc-ncfp-input');
        var sb  = document.getElementById('mpc-ncfp-search');
        var res = document.getElementById('mpc-ncfp-results');
        function doSearch() {
            searchUsers(inp.value.trim(), function(names) {
                res.innerHTML = '';
                if (!names.length) { res.innerHTML = '<div class="mpc-empty-sm">Không tìm thấy.</div>'; return; }
                names.forEach(function(name) {
                    var row = el('div', 'mpc-friend-row');
                    var avEl = buildChatAvEl(name, '32px'); row.appendChild(avEl);
                    var nameSpan = el('span', 'mpc-friend-name'); nameSpan.textContent = name; row.appendChild(nameSpan);
                    var btn = el('button', 'mpc-chat-friend-btn'); btn.textContent = '💬 Chat';
                    btn.addEventListener('click', function() { openOrStartChat(name); });
                    row.appendChild(btn);
                    res.appendChild(row);
                });
            });
        }
        sb.addEventListener('click', doSearch);
        inp.addEventListener('keydown', function(e){ if (e.key === 'Enter') doSearch(); });
    }

    /* Full page: tạo nhóm — render vào main area */
    function showNewGroupViewFP() {
        if (!IS_FULL_PAGE) { showNewGroupView(); return; }
        var main = UI.mainArea;
        if (!main) return;
        STATE.view = 'newgroup';
        adjustPollingRate();
        if (UI.infoArea) UI.infoArea.classList.remove('open');
        main.innerHTML = '';

        var hdr = el('div', 'mpc-chat-header mpc-fp-chat-header');
        hdr.innerHTML = '<button class="mpc-back-btn" id="mpc-fp-back-ng">← Về</button><div class="mpc-chat-title">👥﹢ Tạo nhóm</div>';
        main.appendChild(hdr);
        document.getElementById('mpc-fp-back-ng').addEventListener('click', showWelcomeFP);

        var selectedMembers = [];
        var content = el('div', 'mpc-section');
        content.innerHTML =
            '<div class="mpc-section-title">// TÊN NHÓM</div>' +
            '<input class="mpc-search-input" id="mpc-ngfp-name" placeholder="Tên nhóm…" type="text" style="margin-bottom:12px;width:100%;box-sizing:border-box;"><br>' +
            '<div class="mpc-section-title">// THÊM THÀNH VIÊN</div>' +
            '<div class="mpc-search-row">' +
            '<input class="mpc-search-input" id="mpc-ngfp-input" placeholder="Tìm người dùng…" type="text">' +
            '<button class="mpc-send-btn" id="mpc-ngfp-search" style="padding:0 12px;">Tìm</button>' +
            '</div>' +
            '<div id="mpc-ngfp-selected" class="mpc-selected-members"></div>' +
            '<div id="mpc-ngfp-results"></div>' +
            '<button class="mpc-send-btn" id="mpc-ngfp-create" style="margin-top:12px;width:100%;padding:10px;">✔ Tạo nhóm</button>';
        main.appendChild(content);

        function renderSelected() {
            var sel = document.getElementById('mpc-ngfp-selected');
            sel.innerHTML = selectedMembers.map(function(m) {
                return '<span class="mpc-member-chip">' + esc(m) + ' <span class="mpc-rm-member" data-name="' + esc(m) + '">✕</span></span>';
            }).join('');
            sel.querySelectorAll('.mpc-rm-member').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    selectedMembers = selectedMembers.filter(function(n){ return n !== btn.dataset.name; });
                    renderSelected();
                });
            });
        }

        var ngInput = document.getElementById('mpc-ngfp-input');
        var ngSearch = document.getElementById('mpc-ngfp-search');
        var ngResults = document.getElementById('mpc-ngfp-results');

        function addMember(name) {
            if (selectedMembers.indexOf(name) === -1) { selectedMembers.push(name); renderSelected(); }
        }
        ngSearch.addEventListener('click', function() {
            searchUsers(ngInput.value.trim(), function(names) {
                ngResults.innerHTML = '';
                names.forEach(function(name) {
                    var row = el('div', 'mpc-friend-row');
                    var avEl = buildChatAvEl(name, '32px'); row.appendChild(avEl);
                    var nameSpan = el('span', 'mpc-friend-name'); nameSpan.textContent = name; row.appendChild(nameSpan);
                    var btn = el('button', 'mpc-add-btn'); btn.textContent = '+ Thêm';
                    btn.addEventListener('click', function() { addMember(name); btn.outerHTML = '<span class="mpc-tag-friend">✔ Đã thêm</span>'; });
                    row.appendChild(btn);
                    ngResults.appendChild(row);
                });
            });
        });
        ngInput.addEventListener('keydown', function(e){ if (e.key === 'Enter') ngSearch.click(); });

        if (STATE.friends.length) {
            var fSec = el('div', 'mpc-section');
            fSec.innerHTML = '<div class="mpc-section-title">// BẠN BÈ</div>';
            STATE.friends.forEach(function(fname) {
                var row = el('div', 'mpc-friend-row');
                var avEl = buildChatAvEl(fname, '32px'); row.appendChild(avEl);
                var nameSpan = el('span', 'mpc-friend-name'); nameSpan.textContent = fname; row.appendChild(nameSpan);
                var btn = el('button', 'mpc-add-btn'); btn.textContent = '+ Thêm';
                btn.addEventListener('click', function() { addMember(fname); setStatus(fname + ' đã thêm.', 'ok'); });
                row.appendChild(btn);
                fSec.appendChild(row);
            });
            main.appendChild(fSec);
        }

        document.getElementById('mpc-ngfp-create').addEventListener('click', function() {
            var gname = (document.getElementById('mpc-ngfp-name').value || '').trim();
            if (!gname) return setStatus('Nhập tên nhóm.', 'err');
            if (!selectedMembers.length) return setStatus('Thêm ít nhất 1 thành viên.', 'err');
            startGroupChat(selectedMembers, gname, function(gid, conv) {
                if (!gid) return setStatus('Không thể tạo nhóm.', 'err');
                setStatus('Đã tạo nhóm ' + gname + '!', 'ok');
                loadInbox(function() {
                    renderFPConvList();
                    var meta = STATE.inbox.filter(function(c){ return c.convId === gid; })[0] ||
                        { convId: gid, partner: null, isGroup: true, title: gname, unread: 0, ts: new Date().toISOString(), owner: CURRENT_USER };
                    openConvFullPage(meta);
                });
            });
        });
    }

    /* Quan sát một vùng DOM để bind input chat khi nó xuất hiện */
    function watchForInputIn(target) {
        if (!target) return;
        var obs = new MutationObserver(function() {
            var input = document.getElementById('mpc-input');
            if (input && !input.dataset.bound) {
                input.dataset.bound = '1';
                bindInputEvents();
            }
        });
        obs.observe(target, { childList: true, subtree: true });
    }

    /* ════════════════════════════════════════════════════════════════════════
       TYPING INDICATOR
    ════════════════════════════════════════════════════════════════════════ */
    var TYPING_PAGE_PREFIX  = 'Người_dùng:';
    var TYPING_DEBOUNCE_MS  = 3000;
    var _typingTimer        = null;
    var _typingActive       = false;

    function getTypingPage(conv) {
        var owner = conv.owner || CURRENT_USER;
        return TYPING_PAGE_PREFIX + owner + '/Chat/' + conv.id + '/Typing';
    }

    /* Gửi trạng thái đang gõ (debounce 3s) */
    function sendTyping(conv) {
        if (_typingActive) return;
        _typingActive = true;
        var page = getTypingPage(conv);
        apiRead(page, function(res) {
            var data = {};
            if (!res.missing && !res.error) {
                try { data = JSON.parse(res.text); } catch(e) { data = {}; }
            }
            data[CURRENT_USER] = Date.now();
            apiWriteJSON(page, data, 'MAPLE-Chat: typing indicator', function() {
                _typingActive = false;
            });
        });
        if (_typingTimer) clearTimeout(_typingTimer);
        _typingTimer = setTimeout(function() {
            _typingActive = false;
            clearTyping(conv);
        }, TYPING_DEBOUNCE_MS);
    }

    function clearTyping(conv) {
        var page = getTypingPage(conv);
        apiRead(page, function(res) {
            if (res.missing || res.error) return;
            try {
                var data = JSON.parse(res.text);
                delete data[CURRENT_USER];
                apiWriteJSON(page, data, 'MAPLE-Chat: stop typing');
            } catch(e) {}
        });
    }

    function pollTyping(conv) {
        var page = getTypingPage(conv);
        var now  = Date.now();
        apiRead(page, function(res) {
            var typingEl = document.getElementById('mpc-typing-row');
            if (!typingEl) return;
            if (res.missing || res.error) { typingEl.style.display = 'none'; return; }
            try {
                var data = JSON.parse(res.text);
                var active = Object.keys(data).filter(function(u) {
                    return u !== CURRENT_USER && (now - data[u]) < 4000;
                });
                if (active.length) {
                    typingEl.style.display = 'flex';
                    typingEl.querySelector('.mpc-typing-name').textContent =
                        active.slice(0, 2).join(', ') + (active.length > 1 ? ' đang gõ…' : ' đang gõ…');
                } else {
                    typingEl.style.display = 'none';
                }
            } catch(e) { typingEl.style.display = 'none'; }
        });
    }

    /* ════════════════════════════════════════════════════════════════════════
       MESSAGE SEARCH IN CONVERSATION
    ════════════════════════════════════════════════════════════════════════ */
    function showSearchView(conv, data) {
        var area = IS_FULL_PAGE ? UI.mainArea : UI.body;
        if (!area) return;

        var searchOverlay = el('div', 'mpc-search-overlay');
        searchOverlay.id = 'mpc-msg-search';
        searchOverlay.innerHTML =
            '<div class="mpc-chat-header">' +
            '<button class="mpc-back-btn" id="mpc-search-close">✕ Đóng</button>' +
            '<div class="mpc-chat-title">🔍 Tìm tin nhắn</div>' +
            '</div>' +
            '<div class="mpc-search-row" style="padding:12px">' +
            '<input class="mpc-search-input" id="mpc-search-q" placeholder="Nhập từ khoá…" type="text" autofocus>' +
            '<button class="mpc-send-btn" id="mpc-search-go" style="padding:0 12px;">Tìm</button>' +
            '</div>' +
            '<div id="mpc-search-results" class="mpc-section" style="padding:0 12px;overflow-y:auto;max-height:calc(100% - 120px)"></div>';
        area.appendChild(searchOverlay);

        document.getElementById('mpc-search-close').addEventListener('click', function() {
            searchOverlay.parentNode.removeChild(searchOverlay);
        });

        function doSearch() {
            var q = (document.getElementById('mpc-search-q').value || '').toLowerCase().trim();
            var res = document.getElementById('mpc-search-results');
            if (!res) return;
            res.innerHTML = '';
            if (!q) return;
            var msgs = (data && data.messages) || [];
            var hits = msgs.filter(function(m) {
                return !m.deleted && m.content && m.content.toLowerCase().indexOf(q) !== -1;
            });
            if (!hits.length) { res.innerHTML = '<div class="mpc-empty-sm">Không tìm thấy "' + esc(q) + '".</div>'; return; }
            hits.reverse().forEach(function(m) {
                var row = el('div', 'mpc-conv-item');
                var av = buildChatAvEl(m.from || '?', '28px'); row.appendChild(av);
                var info = el('div', 'mpc-conv-info');
                var name = el('div', 'mpc-conv-name'); name.textContent = m.from || '?';
                var prev = el('div', 'mpc-conv-preview');
                var idx = m.content.toLowerCase().indexOf(q);
                var snip = m.content.slice(Math.max(0, idx - 20), idx + 60);
                prev.textContent = (idx > 20 ? '…' : '') + snip + (idx + 60 < m.content.length ? '…' : '');
                info.appendChild(name); info.appendChild(prev);
                var t = el('div', 'mpc-conv-time'); t.textContent = fmtTime(m.ts);
                row.appendChild(info); row.appendChild(t);
                res.appendChild(row);
            });
            res.innerHTML = '<div class="mpc-section-title">// ' + hits.length + ' KẾT QUẢ</div>' + res.innerHTML;
        }

        document.getElementById('mpc-search-go').addEventListener('click', doSearch);
        document.getElementById('mpc-search-q').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') doSearch();
        });
    }

    /* ════════════════════════════════════════════════════════════════════════
       PIN MESSAGES
    ════════════════════════════════════════════════════════════════════════ */
    function pinMessage(conv, msgId, cb) {
        var owner = conv.owner || CURRENT_USER;
        var page  = chatPage(owner, conv.id);
        apiReadJSON(page, { messages: [] }, function(data) {
            if (!data.pinned) data.pinned = [];
            var idx = data.pinned.indexOf(msgId);
            if (idx === -1) {
                data.pinned.push(msgId);
            } else {
                data.pinned.splice(idx, 1);
            }
            apiWriteJSON(page, data, 'MAPLE-Chat: ghim/bỏ ghim tin nhắn', function(ok) {
                if (ok) STATE.convData[conv.id] = data;
                cb(ok, data.pinned);
            });
        });
    }

    function renderPinnedBanner(data, conv) {
        var existing = document.getElementById('mpc-pinned-bar');
        if (existing) existing.parentNode.removeChild(existing);

        var pinned = data.pinned || [];
        if (!pinned.length) return;

        var lastPinnedId = pinned[pinned.length - 1];
        var pinnedMsg = (data.messages || []).filter(function(m) { return m.id === lastPinnedId; })[0];
        if (!pinnedMsg || pinnedMsg.deleted) return;

        var bar = el('div', 'mpc-pinned-bar');
        bar.id = 'mpc-pinned-bar';
        bar.innerHTML =
            '<span class="mpc-pinned-icon">📌</span>' +
            '<span class="mpc-pinned-text">' + esc((pinnedMsg.content || '').slice(0, 80)) + '</span>' +
            (pinned.length > 1 ? '<span class="mpc-pinned-count">+' + (pinned.length - 1) + ' khác</span>' : '') +
            '<button class="mpc-hdr-btn mpc-pinned-close" title="Bỏ hiện">✕</button>';

        bar.querySelector('.mpc-pinned-close').addEventListener('click', function() {
            bar.parentNode.removeChild(bar);
        });

        var msgsEl = document.getElementById('mpc-messages');
        if (msgsEl && msgsEl.parentNode) {
            msgsEl.parentNode.insertBefore(bar, msgsEl);
        }
    }

    /* ════════════════════════════════════════════════════════════════════════
       INIT
    ════════════════════════════════════════════════════════════════════════ */
    /* ════════════════════════════════════════════════════════════════════════
       PUBLIC API — window.MAPLEChat
    ════════════════════════════════════════════════════════════════════════ */
    window.MAPLEChat = {
        /* Mở chat panel và bắt đầu conversation với user chỉ định */
        openChatWith: function (partner) {
            if (!STATE.open) openPanel();
            else {
                loadInbox(function () {
                    loadFriends(function () {
                        loadFriendRequests(function () {
                            updateUnreadBadge();
                            updateFriendReqBadge();
                            openOrStartChat(partner);
                        });
                    });
                });
                return;
            }
            /* Đợi panel open xong rồi mới mở chat */
            var tries = 0;
            var wait = setInterval(function () {
                if (STATE.view === 'inbox' || ++tries > 20) {
                    clearInterval(wait);
                    openOrStartChat(partner);
                }
            }, 150);
        },
        /* Mở panel inbox */
        open: function () { openPanel(); },
    };

    /* Tự động tạo các trang lưu trữ nếu chưa tồn tại — tránh 404 đè lên UI */
    function ensureStoragePages() {
        var pages = [
            { title: inboxPage(CURRENT_USER),     init: { conversations: [] },          summary: 'MAPLE-Chat: Khởi tạo hộp thư' },
            { title: friendsPage(CURRENT_USER),   init: { friends: [], pendingOut: [] }, summary: 'MAPLE-Chat: Khởi tạo danh sách bạn bè' },
            { title: friendReqPage(CURRENT_USER), init: { requests: [] },               summary: 'MAPLE-Chat: Khởi tạo lời mời kết bạn' },
            { title: blockedPage(CURRENT_USER),   init: { blocked: [] },                summary: 'MAPLE-Chat: Khởi tạo danh sách chặn' },
        ];
        pages.forEach(function(p) {
            apiRead(p.title, function(res) {
                if (res.missing) {
                    apiWriteJSON(p.title, p.init, p.summary);
                }
            });
        });
    }

    function init() {
        injectCSS();
        buildShell();
        watchForInput();
        maybeFullPage();
        ensureStoragePages();
        checkBoardMessages();

        /* Xin quyền notification ngay từ đầu */
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        /* Background polling — cập nhật badge dù panel đóng */
        startBgPolling();

        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                stopTitleBlink();
                stopBgPolling();           /* tab ẩn → ngừng poll nền, tiết kiệm CPU/mạng */
            } else {
                startBgPolling();          /* quay lại → bật poll nền + cập nhật ngay */
                if (!STATE.open) pollUpdates();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(window.mw, window.jQuery);
