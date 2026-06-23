/**
 * M.A.P.L.E — MediaWiki:MAPLE-App-Moderation.js
 * APP (notifier): báo khi bài của bạn được DUYỆT hoặc bị TỪ CHỐI.
 *
 * Đọc MediaWiki:Maple-Pending.json, lọc bài author === user, so trạng thái
 * (approved/rejected) với danh sách đã-thông-báo (localStorage) → notify.
 *
 * Nạp toàn cục từ Common.js khi đã đăng nhập. Cần MAPLE-Notify (MAPLE.notify).
 */
(function () {
    'use strict';

    if (typeof mw === 'undefined' || !mw.config) return;
    var ME = mw.config.get('wgUserName');
    if (!ME) return;

    var SEEN_KEY = 'app_mod_seen'; /* JSON map { "<id>:<status>": 1 } đã báo */
    var FROM     = 'ModerationBot';

    function getSeen(notify) {
        try { return JSON.parse(notify.seen(SEEN_KEY) || '{}') || {}; } catch (e) { return {}; }
    }
    function setSeen(notify, map) {
        try { notify.markSeen(SEEN_KEY, JSON.stringify(map)); } catch (e) {}
    }

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
        fetchJson('MediaWiki:Maple-Pending.json').done(function (pending) {
            if (!Array.isArray(pending) || !pending.length) return;

            /* bài của ME đã có kết quả duyệt */
            var mine = pending.filter(function (p) {
                return p && p.author === ME && (p.status === 'approved' || p.status === 'rejected');
            });
            if (!mine.length) return;

            var seen = getSeen(notify);
            var firstRun = !notify.seen(SEEN_KEY);

            var fresh = mine.filter(function (p) {
                return !seen[p.id + ':' + p.status];
            });

            /* Đánh dấu tất cả là đã biết */
            mine.forEach(function (p) { seen[p.id + ':' + p.status] = 1; });
            setSeen(notify, seen);

            /* Lần đầu: chỉ ghi mốc, không spam kết quả cũ */
            if (firstRun) return;
            if (!fresh.length) return;

            fresh.forEach(function (p) {
                var title = p.page_title || p.page_name || p.id;
                if (p.status === 'approved') {
                    notify({
                        from: FROM,
                        title: '✅ Bài của bạn đã được duyệt',
                        body: 'Bài <b>' + notify.esc(title) + '</b> đã được duyệt' +
                              (p.approved_by ? ' bởi <b>' + notify.esc(p.approved_by) + '</b>' : '') + '. Cảm ơn đóng góp của bạn!',
                        summary: FROM + ': bài được duyệt'
                    });
                } else {
                    notify({
                        from: FROM,
                        title: '❌ Bài của bạn bị từ chối',
                        body: 'Bài <b>' + notify.esc(title) + '</b> chưa được duyệt. Hãy xem ghi chú kiểm duyệt và chỉnh sửa rồi gửi lại.',
                        summary: FROM + ': bài bị từ chối'
                    });
                }
            });
        });
    }

    function start(notify) {
        if (typeof $ === 'undefined' || !$.getJSON) return;
        setTimeout(function () { try { run(notify); } catch (e) {} }, 3000);
    }

    function init() {
        if (window.MAPLE && window.MAPLE.notify) { start(window.MAPLE.notify); return; }
        if (mw.hook) mw.hook('maple.notify.ready').add(start);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
