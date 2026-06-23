/* ============================================
   M.A.P.L.E — MediaWiki:MAPLE-Core.js
   Tiện ích dùng chung: logo, overlay, khởi tạo giao diện
   Load trước tất cả file MAPLE JS khác.
   ============================================ */

window.MAPLE = window.MAPLE || {};

/* ── Logo SVG ── */
MAPLE.LOGO_SVG =
    '<svg class="maple-logo-svg" width="40" height="40" viewBox="0 0 100 100" fill="none">' +
    '<defs>' +
    '<filter id="mge" x="-25%" y="-25%" width="150%" height="150%">' +
    '<feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur"/>' +
    '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>' +
    '</filter>' +
    '</defs>' +
    '<path d="M50 5L95 40L80 95H20L5 40L50 5Z" stroke="#450a0a" stroke-width="1" opacity="0.35"/>' +
    '<g filter="url(#mge)">' +
    '<path d="M50 15V85M50 15L85 45L50 40L15 45L50 15Z" stroke="#ef4444" stroke-width="2.5" stroke-linejoin="miter"/>' +
    '<path d="M30 60L50 85L70 60" stroke="#ef4444" stroke-width="2.5"/>' +
    '</g>' +
    '<circle cx="50" cy="40" r="5" fill="#ef4444" filter="url(#mge)" class="maple-eye-pulse"/>' +
    '</svg>';

/* ── Thêm class vào <html> để kích hoạt CSS ẩn MediaWiki UI ── */
MAPLE.activateUI = function () {
    document.documentElement.classList.add('maple-ui-active');

    // Set ngay lập tức
    document.documentElement.style.setProperty('overflow', 'auto', 'important');
    document.documentElement.style.setProperty('overflow-x', 'auto', 'important');

    // Dùng MutationObserver để chặn skin reset lại
    var observer = new MutationObserver(function () {
        var html = document.documentElement;
        if (html.style.overflow !== 'auto') {
            html.style.setProperty('overflow', 'auto', 'important');
        }
        if (html.style.overflowX !== 'auto') {
            html.style.setProperty('overflow-x', 'auto', 'important');
        }
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['style', 'class']
    });

    // Lưu lại để có thể disconnect sau nếu cần
    MAPLE._overflowObserver = observer;
};

/* ── Root container ── */
MAPLE.createRoot = function () {
    var root = document.createElement('div');
    root.id = 'maple-edit-root';
    document.body.appendChild(root);
    return root;
};

/* ── Overlay loading/saving ── */
MAPLE.showOverlay = function (label) {
    var existing = document.getElementById('maple-overlay');
    if (existing) existing.parentNode.removeChild(existing);

    var el = document.createElement('div');
    el.id = 'maple-overlay';
    el.innerHTML =
        '<svg class="maple-overlay-logo" width="72" height="72" viewBox="0 0 100 100" fill="none">' +
        '<path d="M50 5L95 40L80 95H20L5 40L50 5Z" stroke="#450a0a" stroke-width="1" opacity="0.35"/>' +
        '<path d="M50 15V85M50 15L85 45L50 40L15 45L50 15Z" stroke="#ef4444" stroke-width="2.5" stroke-linejoin="miter"/>' +
        '<path d="M30 60L50 85L70 60" stroke="#ef4444" stroke-width="2.5"/>' +
        '<circle cx="50" cy="40" r="5" fill="#ef4444" class="maple-eye-pulse"/>' +
        '</svg>' +
        '<div class="maple-overlay-bar-wrap"><div class="maple-overlay-bar"></div></div>' +
        '<div class="maple-overlay-label">' + label + '</div>' +
        '<div class="maple-overlay-sub">MAPLE-CORE // SECURE WRITE PROTOCOL</div>';
    document.body.appendChild(el);
};

MAPLE.hideOverlay = function (delay) {
    var el = document.getElementById('maple-overlay');
    if (!el) return;
    setTimeout(function () { el.classList.add('out'); }, delay || 0);
};

/* ── Header builder ── */
MAPLE.buildHeader = function (opts) {
    // opts: { title, sub, badgeText, badgeClass }
    return (
        '<div class="maple-header">' +
        '<div class="maple-header-logo">' +
        MAPLE.LOGO_SVG +
        '<div class="maple-title">' +
        '<h1>' + opts.title + '</h1>' +
        '<div class="maple-title-sub">M.A.P.L.E ARCHIVE SYSTEM // ' + opts.sub + '</div>' +
        '</div>' +
        '</div>' +
        '<span class="maple-badge ' + (opts.badgeClass || 'maple-badge--ok') + '">' + opts.badgeText + '</span>' +
        '</div>'
    );
};

/* ── Modal system ── */
MAPLE.Modal = (function () {
    var overlay, titleEl, bodyEl;

    function ensureDOM() {
        overlay  = document.getElementById('maple-modal-overlay');
        titleEl  = document.getElementById('maple-modal-title');
        bodyEl   = document.getElementById('maple-modal-body');
    }

    function open(title, html) {
        ensureDOM();
        if (!overlay) return;
        titleEl.textContent = title;
        bodyEl.innerHTML = html;
        overlay.style.display = 'flex';
        setTimeout(function () {
            var f = bodyEl.querySelector(
                'input:not([type=radio]):not([type=checkbox]),textarea'
            );
            if (f) f.focus();
        }, 60);
    }

    function close() {
        ensureDOM();
        if (!overlay) return;
        overlay.style.display = 'none';
        bodyEl.innerHTML = '';
        var ta = document.getElementById('maple-textarea');
        if (ta) ta.focus();
    }

    function init() {
        ensureDOM();
        if (!overlay) return;
        document.getElementById('maple-modal-close').addEventListener('click', close);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) close();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && overlay.style.display !== 'none') close();
        });
    }

    return { open: open, close: close, init: init };
})();

/* ── Modal HTML fragment (nhúng vào shell) ── */
MAPLE.MODAL_HTML =
    '<div id="maple-modal-overlay" class="maple-modal-overlay" style="display:none">' +
    '<div id="maple-modal" class="maple-modal">' +
    '<div class="maple-modal-header">' +
    '<span id="maple-modal-title" class="maple-modal-title"></span>' +
    '<button id="maple-modal-close" class="maple-modal-close">✕</button>' +
    '</div>' +
    '<div id="maple-modal-body" class="maple-modal-body"></div>' +
    '</div>' +
    '</div>';