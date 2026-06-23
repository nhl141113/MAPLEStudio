/* ============================================
   M.A.P.L.E — MediaWiki:ErrorPage.js
   Chỉ chạy khi trang không tồn tại (404)
   ============================================ */
(function () {
    function init() {

    if (mw.config.get('wgIsMainPage')) return;

    /* Không chạy trên Special:Search */
    var _pn = mw.config.get('wgPageName') || '';
    var _ns = mw.config.get('wgNamespaceNumber');
    var _canonical = mw.config.get('wgCanonicalSpecialPageName');
    if (_canonical === 'Search') return;
    if (_pn.indexOf('Special:Search') === 0) return;
    if (_ns === -1 && window.location.href.indexOf('search=') !== -1) return;
    if (window.mapleSearchActive) return;

    if (mw.config.get('wgArticleId') !== 0) return;
    if (mw.config.get('wgAction') !== 'view') return;

    var pageName = (mw.config.get('wgPageName') || '').replace(/_/g, ' ');
    var homeURL  = '/wiki/Trang_Ch%C3%ADnh';
    var editURL  = mw.util.getUrl(mw.config.get('wgPageName'), { action: 'edit', redlink: '1' });

    var fontLink = document.createElement('link');
    fontLink.rel  = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Plus+Jakarta+Sans:wght@900&display=swap';
    document.head.appendChild(fontLink);

    var hideCSS = document.createElement('style');
    hideCSS.textContent =
        '.vector-column-start,#mw-panel,.vector-main-menu-container,' +
        '#p-associated-pages,.mw-portlet-associated-pages,.vector-menu-tabs,' +
        '.vector-page-titlebar,.vector-header-container,header.mw-header,' +
        '.vector-sticky-header,#vector-sticky-header,#footer,' +
        '.mw-footer-container,#mw-head,#mw-head-base,#mw-page-base,' +
        '.vector-page-toolbar-container,.mw-body-header,' +
        '.vector-page-toolbar,.vector-column-end,' +
        '#firstHeading,.mw-indicators,#siteSub,#contentSub,' +
        '.noarticletext .mw-parser-output>p,' +
        '.noarticletext .mw-parser-output>ul{display:none!important}' +
        '.mw-page-container,#mw-content-text,.mw-body,#content,' +
        '.vector-column-content,.mw-page-container-inner{' +
        'padding:0!important;margin:0!important;max-width:100%!important;' +
        'width:100%!important;background:#020202!important;' +
        'border:none!important;box-shadow:none!important}' +
        'html,body{background-color:#020202!important;' +
        'background-image:radial-gradient(#1a1a1a 1px,transparent 1px)!important;' +
        'background-size:24px 24px!important}';
    document.head.appendChild(hideCSS);

    var target = document.getElementById('mw-content-text')
                 || document.querySelector('.mw-parser-output')
                 || document.getElementById('content');
    if (!target) return;

    function navigateWithFadeOut(url) {
        var outer = document.getElementById('maple-err-outer');
        var card  = document.getElementById('maple-err-card');
        if (card)  card.classList.add('maple-leaving');
        if (outer) outer.classList.add('maple-leaving');
        setTimeout(function () { window.location.href = url; }, 450);
    }

    target.innerHTML =
        '<div class="maple-err-outer" id="maple-err-outer">' +
        '<div class="maple-err-card" id="maple-err-card">' +
        '<div class="maple-err-vline"></div>' +
        '<div class="maple-err-scan"></div>' +
        '<div class="maple-err-logo">' +
        ((window.MAPLE && window.MAPLE.logoSVG) ? window.MAPLE.logoSVG(120) :
            '<svg width="120" height="120" viewBox="0 0 100 100" fill="none">' +
            '<path d="M50 5L95 40L80 95H20L5 40L50 5Z" stroke="#450a0a" stroke-width="1"/>' +
            '<path d="M50 15V85M50 15L85 45L50 40L15 45L50 15Z" stroke="#ef4444" stroke-width="3" stroke-linejoin="miter"/>' +
            '<path d="M30 60L50 85L70 60" stroke="#ef4444" stroke-width="3"/>' +
            '<circle cx="50" cy="40" r="6" fill="#ef4444" class="maple-err-eye"/>' +
            '</svg>') +
        '</div>' +
        '<div class="maple-err-404">404</div>' +
        '<div class="maple-err-status">D\u1eef li\u1ec7u kh\xf4ng t\u1ed3n t\u1ea1i</div>' +
        '<p class="maple-err-desc">Truy c\u1eadp th\u1ea5t b\u1ea1i. T\xe0i li\u1ec7u <strong>\u201c' + pageName + '\u201d</strong>' +
        ' \u0111\xe3 <strong>b\u1ecb x\xf3a v\u0129nh vi\u1ec5n kh\u1ecfi Wiki</strong>' +
        ' ho\u1eb7c ch\u01b0a bao gi\u1edd t\u1ed3n t\u1ea1i trong c\u01a2 s\u1edf d\u1eef li\u1ec7u M.A.P.L.E.</p>' +
        '<div class="maple-err-actions">' +
        '<a class="maple-err-btn maple-err-btn-primary" id="maple-btn-home" href="#">QUAY L\u1ea0I TRANG CH\u1ee6</a>' +
        '<a class="maple-err-btn maple-err-btn-secondary" id="maple-btn-create" href="#">T\u1ea0O TRANG N\xe0Y</a>' +
        '</div>' +
        '<div class="maple-err-footer">' +
        '<span>DATABASE-ID: WIKI-DB</span>' +
        '<span>ERROR-CODE: 0x404_NULL</span>' +
        '</div>' +
        '</div></div>';

    document.getElementById('maple-btn-home').addEventListener('click', function (e) {
        e.preventDefault(); navigateWithFadeOut(homeURL);
    });
    document.getElementById('maple-btn-create').addEventListener('click', function (e) {
        e.preventDefault(); navigateWithFadeOut(editURL);
    });
    window.addEventListener('pagehide', function () {
        var card = document.getElementById('maple-err-card');
        if (card) card.classList.add('maple-leaving');
    });

    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
