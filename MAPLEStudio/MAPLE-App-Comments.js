/**
 * M.A.P.L.E — MediaWiki:MAPLE-App-Comments.js
 * APP (notifier): báo khi có BÌNH LUẬN mới trên bài của bạn.
 *
 * Client-side, không server push: khi user vào BẤT KỲ trang nào, đọc
 *   MediaWiki:Maple-Comments.json + MediaWiki:Maple-Pending.json,
 * map request_id → tác giả bài; lọc bình luận trên bài của CHÍNH user
 * (do người KHÁC viết), so mốc created_at đã thấy (localStorage) → notify.
 *
 * Nạp toàn cục từ Common.js khi đã đăng nhập. Cần MAPLE-Notify (MAPLE.notify).
 */
(function () {
    'use strict';

    if (typeof mw === 'undefined' || !mw.config) return;
    var ME = mw.config.get('wgUserName');
    if (!ME) return; /* chỉ chạy khi đã đăng nhập */

    var SEEN_KEY  = 'app_comments_seen_ts'; /* mốc created_at mới nhất đã thông báo */
    var FROM      = 'CommentBot';

    function fetchJson(title) {
        return $.getJSON(mw.config.get('wgScriptPath') + '/api.php', {
            action: 'query', titles: title,
            prop: 'revisions', rvprop: 'content', rvslots: 'main',
            format: 'json', origin: '*'
        }).then(function (d) {
            try {
                var pages = d.query.pages, pg = pages[Object.keys(pages)[0]];
                if (!pg || pg.missing !== undefined || !pg.revisions) return null;
                return JSON.parse(pg.revisions[0].slots.main['*']);
            } catch (e) { return null; }
        });
    }

    function run(notify) {
        $.when(
            fetchJson('MediaWiki:Maple-Comments.json'),
            fetchJson('MediaWiki:Maple-Pending.json')
        ).done(function (comments, pending) {
            if (!Array.isArray(comments) || !comments.length) return;
            pending = Array.isArray(pending) ? pending : [];

            /* map request_id → { author, title } của bài */
            var byReq = {};
            pending.forEach(function (p) {
                if (p && p.id) byReq[p.id] = { author: p.author, title: p.page_title || p.page_name || p.id };
            });

            /* mốc đã thông báo */
            var lastSeen = notify.seen(SEEN_KEY) || '';

            /* lọc bình luận: thuộc bài của ME, do người KHÁC viết, mới hơn mốc */
            var mine = comments.filter(function (c) {
                if (!c || !c.request_id) return false;
                var post = byReq[c.request_id];
                if (!post || post.author !== ME) return false;       /* phải là bài của mình */
                if (c.author === ME) return false;                   /* bỏ bình luận của chính mình */
                return String(c.created_at || '') > lastSeen;        /* mới hơn mốc */
            });
            if (!mine.length) return;

            /* mốc mới = created_at lớn nhất */
            var newest = mine.reduce(function (m, c) {
                return String(c.created_at) > m ? String(c.created_at) : m;
            }, lastSeen);

            /* Gộp thông báo: nếu nhiều, báo gọn 1 cái tổng */
            if (mine.length === 1) {
                var c = mine[0];
                var post = byReq[c.request_id];
                notify({
                    from: FROM,
                    title: '💬 Bình luận mới trên bài của bạn',
                    body: '<b>' + notify.esc(c.author || 'Ai đó') + '</b> đã bình luận trên <b>' +
                          notify.esc(post.title) + '</b>:<br>“' + notify.esc((c.text || '').slice(0, 120)) + '”',
                    summary: FROM + ': bình luận mới'
                });
            } else {
                notify({
                    from: FROM,
                    title: '💬 ' + mine.length + ' bình luận mới',
                    body: 'Có <b>' + mine.length + '</b> bình luận mới trên các bài của bạn. Mở trang bài để xem chi tiết.',
                    summary: FROM + ': nhiều bình luận mới'
                });
            }
            notify.markSeen(SEEN_KEY, newest);
        });
    }

    function start(notify) {
        if (typeof $ === 'undefined' || !$.getJSON) return;
        /* Trễ nhẹ để không tranh tài nguyên lúc tải trang */
        setTimeout(function () { try { run(notify); } catch (e) {} }, 2500);
    }

    function init() {
        if (window.MAPLE && window.MAPLE.notify) { start(window.MAPLE.notify); return; }
        if (mw.hook) mw.hook('maple.notify.ready').add(function (notify) { start(notify); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
