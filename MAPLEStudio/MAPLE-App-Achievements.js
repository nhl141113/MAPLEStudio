/**
 * M.A.P.L.E — MediaWiki:MAPLE-App-Achievements.js
 * APP (notifier): báo khi bạn MỞ KHOÁ thành tựu / huy hiệu mới.
 *
 * Dựa trên window.MAPLE.ach (MAPLE-Achievements.js) — đồng bộ theo user.
 * So earnedMap() {id:date} với danh sách id đã-thông-báo (localStorage) →
 * id mới → notify qua MAPLE.notify (CommentBot-style).
 *
 * Nạp toàn cục từ Common.js khi đã đăng nhập. Cần MAPLE-Notify + MAPLE.ach.
 */
(function () {
    'use strict';

    if (typeof mw === 'undefined' || !mw.config) return;
    if (!mw.config.get('wgUserName')) return;

    var SEEN_KEY = 'app_ach_seen_ids'; /* JSON mảng id đã báo */
    var FROM     = 'AchievementBot';

    function getSeenIds(notify) {
        try { return JSON.parse(notify.seen(SEEN_KEY) || '[]') || []; } catch (e) { return []; }
    }
    function setSeenIds(notify, ids) {
        try { notify.markSeen(SEEN_KEY, JSON.stringify(ids)); } catch (e) {}
    }

    function titleOf(id) {
        var CAT = window.MAPLE && window.MAPLE.catalog;
        if (CAT && typeof CAT.entryFromId === 'function') {
            var e = CAT.entryFromId(id);
            if (e && (e.title || e.name)) return e.title || e.name;
        }
        return id;
    }

    function run(notify) {
        var ach = window.MAPLE && window.MAPLE.ach;
        if (!ach || typeof ach.earnedMap !== 'function') return;
        var earned = ach.earnedMap() || {};
        var earnedIds = Object.keys(earned);
        if (!earnedIds.length) return;

        var seenIds = getSeenIds(notify);

        /* Lần đầu chạy (chưa có mốc) → KHÔNG spam toàn bộ thành tựu cũ:
           coi tất cả hiện có là "đã biết", chỉ báo từ lần sau. */
        if (!notify.seen(SEEN_KEY)) { setSeenIds(notify, earnedIds); return; }

        var fresh = earnedIds.filter(function (id) { return seenIds.indexOf(id) === -1; });
        if (!fresh.length) return;

        if (fresh.length === 1) {
            notify({
                from: FROM,
                title: '🏆 Mở khoá thành tựu mới!',
                body: 'Bạn vừa nhận được thành tựu <b>' + notify.esc(titleOf(fresh[0])) + '</b>. Chúc mừng!',
                summary: FROM + ': thành tựu mới'
            });
        } else {
            notify({
                from: FROM,
                title: '🏆 ' + fresh.length + ' thành tựu mới!',
                body: 'Bạn vừa mở khoá <b>' + fresh.length + '</b> thành tựu mới. Xem trang Thành Tựu để biết chi tiết.',
                summary: FROM + ': nhiều thành tựu mới'
            });
        }
        setSeenIds(notify, earnedIds);
    }

    /* Chờ MAPLE.ach.ready (poll tối đa ~6s) rồi chạy */
    function waitAch(notify) {
        var tries = 0;
        var t = setInterval(function () {
            var ach = window.MAPLE && window.MAPLE.ach;
            if (ach && ach.ready) { clearInterval(t); try { run(notify); } catch (e) {} }
            else if (++tries > 30) { clearInterval(t); }
        }, 200);
    }

    function init() {
        function go(notify) { setTimeout(function () { waitAch(notify); }, 2500); }
        if (window.MAPLE && window.MAPLE.notify) { go(window.MAPLE.notify); return; }
        if (mw.hook) mw.hook('maple.notify.ready').add(go);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
