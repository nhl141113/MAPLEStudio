/* ============================================
   M.A.P.L.E — MediaWiki:SearchPage.js
   v4.0 — Miraheze / Vector · BeeStudio 2026
   ============================================
   FIX LOG:
   · Scan line overflow → dùng position:fixed + transform thay top
   · Autocomplete → MW opensearch + filter đúng namespace
   · Enter KHÔNG navigate → chỉ submit form (full-page search)
   · Lọc Special: và MediaWiki: khỏi suggest
   · UI redesign: noise, glow, corner brackets, cursor blink
   ============================================ */
(function () {
    function init() {

    /* ══════════════════════════════════════════
       DETECT SPECIAL:SEARCH
    ══════════════════════════════════════════ */
    var canonical = mw.config.get('wgCanonicalSpecialPageName');
    var ns        = mw.config.get('wgNamespaceNumber');
    var pageName  = mw.config.get('wgPageName') || '';

    var isSearch = canonical === 'Search'
        || pageName.indexOf('\u0110\u1eb7c_bi\u1ec7t:T\xecm_ki\u1ebfm') === 0
        || pageName.indexOf('Special:Search') === 0
        || (ns === -1 && window.location.href.indexOf('search=') !== -1);

    if (!isSearch) return;
    window.mapleSearchActive = true;

    /* ══════════════════════════════════════════
       FONTS
    ══════════════════════════════════════════ */
    var fl = document.createElement('link');
    fl.rel  = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Plus+Jakarta+Sans:wght@800;900&display=swap';
    document.head.appendChild(fl);

    /* ══════════════════════════════════════════
       HIDE MEDIAWIKI CHROME
    ══════════════════════════════════════════ */
    var hideCSS = document.createElement('style');
    hideCSS.textContent =
        /* --- hide sidebar, header, footer, toolbars --- */
        '.vector-column-start,#mw-panel,.vector-main-menu-container,' +
        'header.mw-header,.vector-header-container,.vector-sticky-header,' +
        '#vector-sticky-header,.vector-page-titlebar,.vector-page-toolbar-container,' +
        '.vector-page-toolbar,.vector-column-end,#footer,.mw-footer-container,' +
        '#firstHeading,.mw-indicators,#siteSub,#contentSub,.printfooter,' +
        '#catlinks,#mw-head,#mw-head-base,#mw-page-base,' +
        '#mw-navigation,#p-logo,.portal,#p-search,#p-cactions,' +
        '#p-personal,#p-namespaces,#p-views{display:none!important}' +

        /* --- reset content wrappers --- */
        '.mw-page-container,#mw-content-text,.mw-body,#content,' +
        '.vector-column-content,.mw-page-container-inner,' +
        '#bodyContent,#mw-content-text,#contentSub2{' +
        'padding:0!important;margin:0!important;max-width:100%!important;' +
        'width:100%!important;background:#040404!important;' +
        'border:none!important;box-shadow:none!important;display:block!important}' +

        'html,body{background:#040404!important;margin:0!important;' +
        'padding:0!important;overflow-x:hidden!important}';
    document.head.appendChild(hideCSS);

    /* ══════════════════════════════════════════
       READ QUERY
    ══════════════════════════════════════════ */
    var urlParams  = new URLSearchParams(window.location.search);
    var query      = urlParams.get('search') || urlParams.get('query') || '';
    var queryInput = document.querySelector('input[name="search"]');
    if (!query && queryInput) query = (queryInput.value || '').trim();

    /* ══════════════════════════════════════════
       NAMESPACE FILTER — loại trừ Special & MediaWiki
    ══════════════════════════════════════════ */
    var EXCLUDED_NS_PREFIXES = [
        'special:', 'đặc_biệt:', 'đặc biệt:',
        'mediawiki:', 'trợ_giúp:', 'help:',
        'wikipedia:', 'wikiepdia:'
    ];
    function isExcludedTitle(title) {
        var lower = title.toLowerCase();
        for (var i = 0; i < EXCLUDED_NS_PREFIXES.length; i++) {
            if (lower.indexOf(EXCLUDED_NS_PREFIXES[i]) === 0) return true;
        }
        return false;
    }

    /* ══════════════════════════════════════════
       PARSE MW SEARCH RESULTS FROM DOM
    ══════════════════════════════════════════ */
    var results = [];
    document.querySelectorAll('.mw-search-result').forEach(function (item) {
        var titleEl   = item.querySelector('.mw-search-result-heading a');
        var snippetEl = item.querySelector('.searchresult');
        var metaEl    = item.querySelector('.mw-search-result-data');
        if (!titleEl) return;

        var title       = titleEl.textContent.trim();
        if (isExcludedTitle(title)) return; /* lọc namespace cấm */

        var href        = titleEl.getAttribute('href') || '#';
        var snippetHTML = snippetEl ? snippetEl.innerHTML : '';
        var snippetText = snippetEl ? snippetEl.textContent : '';
        var meta        = metaEl ? metaEl.textContent.trim() : '';

        /* Detect page type từ ID prefix */
        var pageId   = '';
        var pageType = 'Hồ sơ';
        var access   = 'open';
        var idMatch  = title.match(/^(DB|LOC|PRO|LOG|EVT|ITM|NPC)-\d+/i);
        if (idMatch) pageId = idMatch[0].toUpperCase();

        if      (/^DB-/i.test(pageId))  { pageType = 'Thực thể';   access = 'classified'; }
        else if (/^LOC-/i.test(pageId)) { pageType = 'Địa điểm';   access = 'restricted'; }
        else if (/^PRO-/i.test(pageId)) { pageType = 'Quy trình';  access = 'open'; }
        else if (/^LOG-/i.test(pageId)) { pageType = 'Nhật ký';    access = 'restricted'; }
        else if (/^EVT-/i.test(pageId)) { pageType = 'Sự kiện';    access = 'restricted'; }
        else if (/^ITM-/i.test(pageId)) { pageType = 'Vật phẩm';   access = 'open'; }
        else if (/^NPC-/i.test(pageId)) { pageType = 'Nhân vật';   access = 'restricted'; }

        results.push({
            title: title, href: href,
            snippetHTML: snippetHTML, snippetText: snippetText,
            meta: meta, pageId: pageId, pageType: pageType, access: access
        });
    });

    /* ══════════════════════════════════════════
       HIDE ORIGINAL MW CONTENT
    ══════════════════════════════════════════ */
    document.querySelectorAll(
        '#mw-content-text,.mw-parser-output,#content,' +
        '.searchresults,.mw-search-results-container,' +
        '.mw-search-top-table,.mw-search-profile-tabs'
    ).forEach(function (el) { el.style.cssText = 'display:none!important'; });

    /* ══════════════════════════════════════════
       HELPERS
    ══════════════════════════════════════════ */
    function esc(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
        });
    }

    function accessBadge(a) {
        if (a === 'classified') return '<span class="msr-access msr-access-classified">Tối mật</span>';
        if (a === 'restricted') return '<span class="msr-access msr-access-restricted">Hạn chế</span>';
        return '<span class="msr-access msr-access-open">Mở</span>';
    }

    function buildCard(r, delay) {
        return (
            '<div class="msr-item" data-href="' + esc(r.href) + '"' +
            ' style="animation-delay:' + (delay || 0) + 's">' +
            '<div class="msr-item-glow"></div>' +
            '<div class="msr-item-top">' +
            (r.pageId ? '<span class="msr-id">' + esc(r.pageId) + '</span>' : '') +
            '<span class="msr-type">' + esc(r.pageType) + '</span>' +
            accessBadge(r.access) +
            '</div>' +
            '<div class="msr-title">' + esc(r.title) + '</div>' +
            (r.snippetHTML ? '<div class="msr-snippet">' + r.snippetHTML + '</div>' : '') +
            (r.meta ? '<div class="msr-meta">' + esc(r.meta) + '</div>' : '') +
            '</div>'
        );
    }

    function buildResultsHTML(list) {
        if (!list || !list.length) {
            return (
                '<div class="msr-noresult">' +
                '<span class="msr-noresult-icon">◈</span>' +
                '<div class="msr-noresult-code">STATUS: NULL_MATCH · ' + new Date().toISOString().slice(0,10) + '</div>' +
                '<div class="msr-noresult-msg">Không tìm thấy hồ sơ nào phù hợp</div>' +
                '<div class="msr-noresult-sub">Dữ liệu có thể đã bị xóa hoặc chưa được lưu trữ trong hệ thống MAPLE.</div>' +
                '</div>'
            );
        }
        return list.map(function (r, i) { return buildCard(r, i * 0.045); }).join('');
    }

    /* ══════════════════════════════════════════
       LOGO SVG
    ══════════════════════════════════════════ */
    var LOGO_SVG =
        '<svg width="86" height="86" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M50 5L95 40L80 95H20L5 40L50 5Z" stroke="#1a0303" stroke-width="1.5"/>' +
        '<path d="M50 15V85M50 15L85 45L50 40L15 45L50 15Z" stroke="#ef4444" stroke-width="2.5" stroke-linejoin="miter"/>' +
        '<path d="M30 60L50 85L70 60" stroke="#ef4444" stroke-width="2.5"/>' +
        '<path d="M50 5L95 40" stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
        '<path d="M50 5L5 40"  stroke="rgba(239,68,68,0.15)" stroke-width="0.5"/>' +
        '<circle cx="50" cy="40" r="6" fill="#ef4444" class="msr-logo-eye"/>' +
        '</svg>';

    /* ══════════════════════════════════════════
       FORM ACTION
    ══════════════════════════════════════════ */
    var searchForm = document.querySelector('form[action*="search"],form[action*="Search"],#searchform');
    var formAction = '/w/index.php';
    if (searchForm) { var fa = searchForm.getAttribute('action'); if (fa) formAction = fa; }

    /* ══════════════════════════════════════════
       INJECT ROOT
    ══════════════════════════════════════════ */
    var root = document.createElement('div');
    root.id  = 'maple-search-root';
    document.body.appendChild(root);

    root.innerHTML =
        /* Scan line */
        '<div class="msr-scan-wrap"><div class="msr-scan-line"></div></div>' +

        '<div class="msr-outer">' +

        /* Hero */
        '<div class="msr-hero">' +
        '<div class="msr-logo-wrap">' +
        '<div class="msr-hero-ring msr-hero-ring-2"></div>' +
        '<div class="msr-hero-ring"></div>' +
        LOGO_SVG +
        '</div>' +
        '<h1 class="msr-hero-title">M.<span class="msr-red">A</span>.P.L.E</h1>' +
        '<p class="msr-hero-sub">Containment &nbsp;//&nbsp; Archive &nbsp;//&nbsp; Classification</p>' +
        '<div class="msr-security-stamp">Authenticated &nbsp; Internal Asset 2026<span class="msr-cursor"></span></div>' +
        '</div>' +

        /* Search form — action POST về MW, Enter = submit (không tự navigate) */
        '<form class="msr-bar-wrap" id="msr-form"' +
        ' action="' + esc(formAction) + '" method="get" autocomplete="off">' +
        '<input type="hidden" name="title" value="\u0110\u1eb7c_bi\u1ec7t:T\xecm_ki\u1ebfm"/>' +
        '<div class="msr-input-wrap">' +
        '<span class="msr-input-icon">&#x25B6;</span>' +
        '<input class="msr-input" id="msr-input" type="text" name="search"' +
        ' value="' + esc(query) + '"' +
        ' placeholder="Nhập từ khóa tìm kiếm..." autocomplete="off"/>' +
        '<ul class="msr-suggest" id="msr-suggest"></ul>' +
        '</div>' +
        '<button class="msr-btn" type="submit">TÌM KIẾM</button>' +
        '</form>' +

        /* Stats */
        '<div class="msr-stats" id="msr-stats">' +
        (results.length
            ? 'Tìm thấy <strong>' + results.length + '</strong> hồ sơ' +
              '<span class="msr-stat-sep"></span>QUERY: <strong>' + esc(query || '---') + '</strong>'
            : 'Không có kết quả') +
        '</div>' +

        /* Results */
        '<div class="msr-results" id="msr-results">' + buildResultsHTML(results) + '</div>' +

        /* Footer */
        '<div class="msr-footer">' +
        '<span>DATABASE-ID: WIKI-SEARCH</span>' +
        '<span class="msr-footer-mid">MAPLE-CORE // QUERY ENGINE v4.0</span>' +
        '<span>BEESTUDIO © 2026</span>' +
        '</div>' +

        '</div>'; /* end .msr-outer */

    /* ══════════════════════════════════════════
       CARD CLICK → NAVIGATE
       Enter trong form → Submit (MW search), KHÔNG navigate
    ══════════════════════════════════════════ */
    var resultsEl = document.getElementById('msr-results');
    resultsEl.addEventListener('click', function (e) {
        var card = e.target.closest('.msr-item');
        if (!card) return;
        var href = card.getAttribute('data-href');
        if (href && href !== '#') window.location.href = href;
    });

    /* ══════════════════════════════════════════
       AUTOCOMPLETE
    ══════════════════════════════════════════ */
    var inputEl   = document.getElementById('msr-input');
    var suggestEl = document.getElementById('msr-suggest');
    var statsEl   = document.getElementById('msr-stats');
    var activeIdx = -1;
    var apiTimeout = null;
    var api = new mw.Api();

    /* Namespace content (0) chỉ — loại Special (-1) & MediaWiki (8) */
    var SEARCH_NS = [0];

    function closeSuggest() {
        suggestEl.innerHTML = '';
        suggestEl.classList.remove('msr-suggest-open');
        activeIdx = -1;
    }

    function renderSuggest(titles, urls) {
        if (!titles || !titles.length) { closeSuggest(); return; }

        /* Lọc Special: / MediaWiki: */
        var filtered = [], filteredUrls = [];
        titles.forEach(function (t, i) {
            if (!isExcludedTitle(t)) {
                filtered.push(t);
                filteredUrls.push(urls && urls[i] ? urls[i] : '');
            }
        });

        if (!filtered.length) { closeSuggest(); return; }

        suggestEl.innerHTML = filtered.slice(0, 8).map(function (t, i) {
            return '<li class="msr-sug-item"' +
                ' data-href="' + esc(filteredUrls[i]) + '"' +
                ' data-title="' + esc(t) + '">' +
                '<span class="msr-sug-arrow">&#x25B6;</span>' +
                esc(t) + '</li>';
        }).join('');
        suggestEl.classList.add('msr-suggest-open');
        activeIdx = -1;
    }

    function fetchSuggest(val) {
        /* 1) Local filter — hiện ngay */
        var localMatched = results.filter(function (r) {
            return r.title.toLowerCase().indexOf(val.toLowerCase()) !== -1;
        });
        if (localMatched.length) {
            renderSuggest(
                localMatched.map(function (r) { return r.title; }),
                localMatched.map(function (r) { return r.href; })
            );
        }

        /* 2) MW API opensearch — namespace 0 (content pages) chỉ */
        clearTimeout(apiTimeout);
        apiTimeout = setTimeout(function () {
            api.get({
                action: 'opensearch',
                search: val,
                limit: 10,
                namespace: SEARCH_NS.join('|'),
                redirects: 'resolve'
            }).done(function (data) {
                /* data = [query, [titles], [descs], [urls]] */
                if (!data || !data[1] || !data[1].length) return;
                renderSuggest(data[1], data[3]);
            });
            /* Lỗi API → giữ local results, im lặng */
        }, 220);
    }

    /* ── Local filter kết quả đang hiển thị ── */
    function filterLocalResults(val) {
        var statsText;
        if (!val) {
            resultsEl.innerHTML = buildResultsHTML(results);
            statsEl.innerHTML = results.length
                ? 'Tìm thấy <strong>' + results.length + '</strong> hồ sơ'
                : 'Không có kết quả';
            return;
        }
        var lv = val.toLowerCase();
        var filtered = results.filter(function (r) {
            return r.title.toLowerCase().indexOf(lv) !== -1
                || r.snippetText.toLowerCase().indexOf(lv) !== -1;
        });
        resultsEl.innerHTML = buildResultsHTML(filtered);
        statsEl.innerHTML = filtered.length
            ? 'Tìm thấy <strong>' + filtered.length + '</strong> hồ sơ' +
              '<span class="msr-stat-sep"></span>QUERY: <strong>' + esc(val) + '</strong>'
            : 'Không có kết quả';
    }

    /* ── Input events ── */
    inputEl.addEventListener('input', function () {
        var val = this.value.trim();
        filterLocalResults(val);
        if (val.length >= 1) fetchSuggest(val);
        else closeSuggest();
    });

    inputEl.addEventListener('keydown', function (e) {
        var items = suggestEl.querySelectorAll('.msr-sug-item');

        if (e.key === 'Escape') {
            closeSuggest();
            return;
        }

        /* Arrow navigation trong suggest */
        if (items.length) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                activeIdx = Math.min(activeIdx + 1, items.length - 1);
                items.forEach(function (it, i) {
                    it.classList.toggle('msr-sug-active', i === activeIdx);
                });
                /* Cập nhật input text → chỉ filter, KHÔNG navigate */
                if (items[activeIdx]) {
                    inputEl.value = items[activeIdx].dataset.title;
                    filterLocalResults(inputEl.value);
                }
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                activeIdx = Math.max(activeIdx - 1, 0);
                items.forEach(function (it, i) {
                    it.classList.toggle('msr-sug-active', i === activeIdx);
                });
                if (items[activeIdx]) {
                    inputEl.value = items[activeIdx].dataset.title;
                    filterLocalResults(inputEl.value);
                }
                return;
            }
        }

        /* Enter → đóng suggest, để form tự submit (MW full-page search)
           KHÔNG tự navigate vào bất kỳ trang nào */
        if (e.key === 'Enter') {
            closeSuggest();
            /* form sẽ submit bình thường → không cần làm gì thêm */
        }
    });

    /* Click vào suggest item → chỉ điền vào input, KHÔNG navigate */
    suggestEl.addEventListener('mousedown', function (e) {
        var li = e.target.closest('.msr-sug-item');
        if (!li) return;
        e.preventDefault(); /* tránh blur input */
        inputEl.value = li.dataset.title || '';
        closeSuggest();
        filterLocalResults(inputEl.value);
        inputEl.focus();
    });

    /* Đóng suggest khi click ra ngoài */
    document.addEventListener('mousedown', function (e) {
        if (!suggestEl.contains(e.target) && e.target !== inputEl) {
            closeSuggest();
        }
    });

    /* Focus input */
    inputEl.focus();
    inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);

    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
