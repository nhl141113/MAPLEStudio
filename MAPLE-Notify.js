/**
 * ════════════════════════════════════════════════════════════════════════
 * M.A.P.L.E — MediaWiki:MAPLE-Notify.js
 * Lõi gửi THÔNG BÁO dùng chung cho mọi "app"/notifier của wiki.
 *
 * Trích từ logic EventNotifier (SuKien.js) → tham số hoá theo `from` để
 * nhiều app cùng dùng (CommentBot, AchievementBot, ModerationBot…).
 *
 * Ghi đến 2 kênh (như EventNotifier):
 *   1. Thông_báo/{username}            — JSON array [{ts,from,title,body,read}], ≤50 (chuông navbar)
 *   2. Người_dùng:{username}/Chat/Inbox + Người_dùng:{from}/Chat/SYS-<FROM> (MAPLE-Chat, một chiều)
 *
 * API (global):
 *   window.MAPLE.notify(opts)              — gửi 1 thông báo cho CHÍNH user đang đăng nhập
 *       opts = { from, title, body, channels:{bell:true,chat:true}, summary }
 *   window.MAPLE.notify.toUser(user, opts) — gửi cho user bất kỳ (vd notifier bình luận → chủ bài)
 *   window.MAPLE.notify.once(key, opts)    — chỉ gửi nếu key chưa từng gửi (localStorage) → chống trùng
 *   window.MAPLE.notify.seen(key) / markSeen(key) — quản mốc "đã thông báo"
 *
 * Phát tín hiệu: mw.hook('maple.notify.ready').fire(window.MAPLE.notify)
 * ════════════════════════════════════════════════════════════════════════
 */
(function () {
    'use strict';

    if (typeof mw === 'undefined' || !mw.Api) return;

    window.MAPLE = window.MAPLE || {};
    if (window.MAPLE.notify) return; /* đã nạp */

    var API = new mw.Api();
    var MAX_NOTIF = 50;

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
        });
    }

    function pageOfUser(user) { return String(user).replace(/ /g, '_'); }

    /* ── Mốc chống gửi trùng (localStorage) ── */
    function seen(key) {
        try { return localStorage.getItem('maple_notify_' + key); } catch (e) { return null; }
    }
    function markSeen(key, val) {
        try { localStorage.setItem('maple_notify_' + key, val == null ? '1' : String(val)); } catch (e) {}
    }

    /* ── Ghi trang Thông_báo/{user} (chuông) ── */
    function writeBell(toUser, from, title, body, now, summary) {
        var pageTitle = 'Thông_báo/' + pageOfUser(toUser);
        API.get({
            action: 'query', titles: pageTitle,
            prop: 'revisions', rvprop: 'content', rvslots: 'main',
            format: 'json', formatversion: 2
        }).done(function (d) {
            var pages = d.query && d.query.pages;
            var pg    = pages && pages[0];
            var list  = [];
            if (pg && !pg.missing) {
                try { list = JSON.parse((pg.revisions[0].slots.main.content) || '[]'); } catch (e) {}
            }
            if (!Array.isArray(list)) list = [];
            list.unshift({ ts: now, from: from, title: title, body: body, read: false });
            if (list.length > MAX_NOTIF) list = list.slice(0, MAX_NOTIF);
            API.get({ action: 'query', meta: 'tokens', type: 'csrf', format: 'json' }).done(function (td) {
                var token = td.query && td.query.tokens && td.query.tokens.csrftoken;
                if (!token || token === '+\\') return;
                API.post({
                    action: 'edit', title: pageTitle,
                    text: JSON.stringify(list, null, 2),
                    summary: summary || (from + ': thông báo'),
                    token: token, format: 'json'
                });
            });
        });
    }

    /* ── Ghi inbox Chat + conversation hệ thống SYS-<FROM> ── */
    function writeChat(toUser, from, title, body, now, summary) {
        var convId     = 'SYS-' + String(from).toUpperCase().replace(/[^A-Z0-9]+/g, '');
        var inboxTitle = 'Người_dùng:' + pageOfUser(toUser) + '/Chat/Inbox';
        API.get({
            action: 'query', titles: inboxTitle,
            prop: 'revisions', rvprop: 'content', rvslots: 'main',
            format: 'json', formatversion: 2
        }).done(function (d) {
            var pages = d.query && d.query.pages;
            var pg    = pages && pages[0];
            var inbox = { conversations: [] };
            if (pg && !pg.missing) {
                try { inbox = JSON.parse(pg.revisions[0].slots.main.content || '{}'); } catch (e) {}
            }
            var convs = inbox.conversations || [];

            var existing = convs.filter(function (c) { return c.convId === convId; })[0];
            if (!existing) {
                convs.unshift({
                    convId: convId, partner: from, isGroup: false, title: from,
                    lastMsg: title.slice(0, 60), unread: 1, ts: now,
                    owner: from, isSystem: true
                });
            } else {
                existing.lastMsg  = title.slice(0, 60);
                existing.unread   = (existing.unread || 0) + 1;
                existing.ts       = now;
                existing.isSystem = true;
                convs.splice(convs.indexOf(existing), 1);
                convs.unshift(existing);
            }

            API.get({ action: 'query', meta: 'tokens', type: 'csrf', format: 'json' }).done(function (td) {
                var token = td.query && td.query.tokens && td.query.tokens.csrftoken;
                if (!token || token === '+\\') return;
                API.post({
                    action: 'edit', title: inboxTitle,
                    text: JSON.stringify({ conversations: convs }, null, 2),
                    summary: summary || (from + ': thông báo'),
                    token: token, format: 'json'
                });
                writeChatConvMsg(from, convId, title, body, now, token, summary);
            });
        });
    }

    /* ── Ghi tin nhắn vào trang conversation của <from> ── */
    function writeChatConvMsg(from, convId, title, body, now, token, summary) {
        var convPage = 'Người_dùng:' + pageOfUser(from) + '/Chat/' + convId;
        API.get({
            action: 'query', titles: convPage,
            prop: 'revisions', rvprop: 'content', rvslots: 'main',
            format: 'json', formatversion: 2
        }).done(function (d) {
            var pages = d.query && d.query.pages;
            var pg    = pages && pages[0];
            var conv  = { id: convId, owner: from, messages: [], created: now, isSystem: true };
            if (pg && !pg.missing) {
                try { conv = JSON.parse(pg.revisions[0].slots.main.content || '{}'); } catch (e) {}
            }
            if (!Array.isArray(conv.messages)) conv.messages = [];
            conv.messages.push({
                id:       'm-' + Date.now().toString(36),
                from:     from,
                content:  '<b>' + title + '</b><br>' + body,
                ts:       now,
                isSystem: true
            });
            API.post({
                action: 'edit', title: convPage,
                text: JSON.stringify(conv, null, 2),
                summary: summary || (from + ': thông báo'),
                token: token, format: 'json'
            });
        });
    }

    /* ════════════════════════════════════════════════════════════
       API CÔNG KHAI
       ════════════════════════════════════════════════════════════ */

    /* Gửi cho 1 user cụ thể */
    function notifyToUser(toUser, opts) {
        opts = opts || {};
        if (!toUser) return;
        var from  = opts.from  || 'M.A.P.L.E';
        var title = opts.title || '';
        var body  = opts.body  || '';
        var now   = new Date().toISOString();
        var ch    = opts.channels || { bell: true, chat: true };
        if (ch.bell !== false) writeBell(toUser, from, title, body, now, opts.summary);
        if (ch.chat !== false) writeChat(toUser, from, title, body, now, opts.summary);
    }

    /* ── Bật/tắt notifier theo app (lưu localStorage, do user tự cấu hình) ──
       Mặc định BẬT. Tắt → notify() cho chính user sẽ bỏ qua app đó. */
    function offKey(from) { return 'maple_notify_off_' + String(from || '').toLowerCase(); }
    function isEnabled(from) {
        try { return localStorage.getItem(offKey(from)) !== '1'; } catch (e) { return true; }
    }
    function setEnabled(from, on) {
        try {
            if (on) localStorage.removeItem(offKey(from));
            else localStorage.setItem(offKey(from), '1');
        } catch (e) {}
    }

    /* Gửi cho user đang đăng nhập */
    function notify(opts) {
        var me = mw.config.get('wgUserName');
        if (!me) return;
        /* Tôn trọng cài đặt tắt của user cho app này */
        if (opts && opts.from && !isEnabled(opts.from)) return;
        notifyToUser(me, opts);
    }

    /* Chỉ gửi nếu key chưa từng gửi (chống trùng) — cho user đang đăng nhập */
    function notifyOnce(key, opts) {
        if (!key || seen(key)) return false;
        notify(opts);
        markSeen(key);
        return true;
    }

    notify.toUser    = notifyToUser;
    notify.once      = notifyOnce;
    notify.seen      = seen;
    notify.markSeen  = markSeen;
    notify.esc       = esc;
    notify.isEnabled = isEnabled;
    notify.setEnabled = setEnabled;

    window.MAPLE.notify = notify;

    if (mw.hook) mw.hook('maple.notify.ready').fire(notify);
})();
