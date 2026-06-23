/**
 * M.A.P.L.E — MediaWiki:MAPLE-ExternalLink.js
 * Intercept external links → redirect sang trang relay cảnh báo
 */
(function () {
    'use strict';

    var RELAY_PAGE = 'https://maplewikivn.miraheze.org/wiki/D%E1%BB%B1_%C3%A1n:Open/link';

    /* Domain chính thức của wiki — mọi link không khớp đều bị chặn */
    var WIKI_HOST    = location.hostname; /* maplewikivn.miraheze.org (runtime) */
    var WIKI_DOMAINS = [
        'maplewikivn.miraheze.org',
        'miraheze.org',          /* meta, login, upload, special pages */
    ];

    /* ── Kiểm tra link ngoài ── */
    function isExternal(href) {
        if (!href) return false;
        /* Relative path, hash, anchor → nội bộ */
        if (href.charAt(0) === '/' || href.charAt(0) === '#' || href.charAt(0) === '?') return false;
        /* mailto / tel / javascript → bỏ qua (không phải web link) */
        if (/^(mailto|tel|javascript):/i.test(href)) return false;
        try {
            var url = new URL(href);
            /* Chỉ http/https mới check */
            if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
            /* So hostname với domain wiki + các subdomain miraheze */
            var host = url.hostname.toLowerCase();
            for (var i = 0; i < WIKI_DOMAINS.length; i++) {
                if (host === WIKI_DOMAINS[i] || host.endsWith('.' + WIKI_DOMAINS[i])) return false;
            }
            /* Cùng host runtime (phòng trường hợp custom domain) */
            if (host === WIKI_HOST) return false;
            return true;
        } catch (e) { return false; }
    }

    /* ── Redirect sang trang relay ── */
    function goRelay(href) {
        location.href = RELAY_PAGE + '?url=' + encodeURIComponent(href);
    }

    /* ── Trang relay: KHÔNG can thiệp (tránh vòng lặp "bug chết") ──
       Trên Dự_án:Open / Dự_án:Open/link, nút "Vẫn tiếp tục" trỏ thẳng URL
       ngoài — nếu handler này bắt lại sẽ relay vòng vô tận. Bỏ qua hẳn. */
    function onRelayPage() {
        var pn = (typeof mw !== 'undefined' && mw.config) ? (mw.config.get('wgPageName') || '') : '';
        if (pn === 'Dự_án:Open' || pn === 'Dự_án:Open/link') return true;
        var dec = '';
        try { dec = decodeURIComponent(location.pathname); } catch (e) { dec = location.pathname; }
        return /Open(\/link)?$/i.test(dec) || /Open(\/link)?\?/i.test(location.href);
    }

    /* ── Delegate click handler ── */
    function init() {
        if (onRelayPage()) return; /* mở link thẳng, không relay lại */

        document.addEventListener('click', function (e) {
            /* Tìm <a> gần nhất */
            var target = e.target;
            while (target && target.nodeName !== 'A') target = target.parentNode;
            if (!target || target.nodeName !== 'A') return;

            /* Bỏ qua nếu có attribute data-ext-skip */
            if (target.hasAttribute('data-ext-skip')) return;

            /* Dùng .href (absolute, đã resolve) */
            var href = target.href || target.getAttribute('href') || '';
            if (!isExternal(href)) return;

            e.preventDefault();
            e.stopPropagation();
            goRelay(href);
        }, true); /* capture phase — bắt trước mọi handler khác */
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
