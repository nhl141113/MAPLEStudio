/**
 * MediaWiki:MAPLE-QueuePage.js  v3.1
 *
 * Giao diện hàng chờ kiểm duyệt — admin/public view.
 * Giống hệt MAPLE-PendingPage.js về cấu trúc UI.
 *
 * Quy tắc hiển thị nội dung:
 *   - pending  → KHÔNG xem nội dung, không xem trước. Xem được comment.
 *   - rejected → KHÔNG xem nội dung, không xem trước. Xem được lý do + comment.
 *   - approved → XEM được nội dung + xem trước + link tới trang chính thức.
 *
 * Phụ thuộc:
 *   - MediaWiki:MAPLE-Comments.js  (phải load trước)
 *   - mediawiki.api, mediawiki.util
 */
(function (mw, $) {
    'use strict';

    // ── Kiểm tra phụ thuộc ───────────────────────────────────────────────────
    if (typeof window.MAPLEComments === 'undefined') {
        mw.log.warn('MAPLE-QueuePage: cần load MAPLE-Comments.js trước.');
        return;
    }

    var QUEUE_BASE   = 'MAPLE:Hàng_Chờ';
    var QUEUE_BASE_E = 'MAPLE:H%C3%A0ng_Ch%E1%BB%9D';

    var pageName     = mw.config.get('wgPageName');
    var currentUser  = mw.config.get('wgUserName');
    var groups       = mw.config.get('wgUserGroups') || [];
    var isSysop      = groups.indexOf('sysop') !== -1;

    var QUEUE_ROOTS = [
        'MediaWiki:Maple-Queue/Xem',
        'Maple-Queue',
        QUEUE_BASE,
        QUEUE_BASE_E,
    ];
    var isRoot      = QUEUE_ROOTS.indexOf(pageName) !== -1 ||
                      document.querySelector('.maple-queue-embed') !== null;
    var isVirtualSub = pageName.startsWith(QUEUE_BASE + '/') ||
                       pageName.startsWith(QUEUE_BASE_E + '/');

    if (!isRoot && !isVirtualSub) return;

    var api = new mw.Api();

    // ═══════════════════════════════════════════════════════════════════════════
    // CSS
    // ═══════════════════════════════════════════════════════════════════════════
    var CSS = [
    ':root{--mq-bg:#0a0e14;--mq-surface:#0d1117;--mq-border:#1e2733;',
      '--mq-text:#c9d1d9;--mq-muted:#484f58;--mq-blue:#388bfd;',
      '--mq-green:#2ea043;--mq-yellow:#d29922;--mq-red:#f85149;',
      '--mq-purple:#a371f7;--mq-cyan:#76e3ea;',
      '--mq-font:"JetBrains Mono","Fira Code","Cascadia Code","Consolas",monospace;}',

    '#mq-wrap{max-width:900px;margin:24px auto;font-family:var(--mq-font);}',

    '#mq-header{display:flex;align-items:center;gap:14px;margin-bottom:24px;',
      'padding-bottom:16px;border-bottom:1px solid var(--mq-border);}',
    '#mq-header-icon{width:42px;height:42px;background:#111d2b;border:1px solid #1f3e6e;',
      'border-radius:10px;display:flex;align-items:center;justify-content:center;',
      'font-size:20px;flex-shrink:0;}',
    '#mq-header-text h1{font-size:15px;font-weight:700;color:var(--mq-blue);margin:0 0 3px;letter-spacing:.5px;}',
    '#mq-header-text p{font-size:11px;color:var(--mq-muted);margin:0;}',
    '#mq-sync-btn{margin-left:auto;background:transparent;border:1px solid var(--mq-border);',
      'color:var(--mq-muted);font-family:var(--mq-font);font-size:10px;padding:5px 12px;',
      'border-radius:5px;cursor:pointer;transition:all .2s;}',
    '#mq-sync-btn:hover{border-color:var(--mq-blue);color:var(--mq-blue);}',

    '#mq-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;}',
    '.mq-stat{background:var(--mq-surface);border:1px solid var(--mq-border);',
      'border-radius:8px;padding:12px 16px;text-align:center;}',
    '.mq-stat-num{font-size:24px;font-weight:700;line-height:1;}',
    '.mq-stat-lbl{font-size:10px;color:var(--mq-muted);margin-top:4px;letter-spacing:.5px;}',
    '.mq-stat.all      .mq-stat-num{color:var(--mq-blue);}',
    '.mq-stat.pending  .mq-stat-num{color:var(--mq-yellow);}',
    '.mq-stat.approved .mq-stat-num{color:var(--mq-green);}',
    '.mq-stat.rejected .mq-stat-num{color:var(--mq-red);}',

    '#mq-tabs{display:flex;gap:0;border-bottom:1px solid var(--mq-border);margin-bottom:16px;}',
    '.mq-tab{padding:8px 18px;font-size:11px;font-weight:700;cursor:pointer;',
      'color:var(--mq-muted);border-bottom:2px solid transparent;margin-bottom:-1px;',
      'transition:all .2s;letter-spacing:.5px;background:none;',
      'border-top:none;border-left:none;border-right:none;font-family:var(--mq-font);}',
    '.mq-tab:hover{color:var(--mq-text);}',
    '.mq-tab.active{color:var(--mq-blue);border-bottom-color:var(--mq-blue);}',
    '.mq-tab .mq-badge{display:inline-block;min-width:18px;padding:1px 5px;',
      'border-radius:9px;font-size:9px;margin-left:6px;background:var(--mq-border);}',
    '.mq-tab.active.tab-pending  .mq-badge{background:#2d2108;color:var(--mq-yellow);}',
    '.mq-tab.active.tab-approved .mq-badge{background:#122620;color:var(--mq-green);}',
    '.mq-tab.active.tab-rejected .mq-badge{background:#2d0f0f;color:var(--mq-red);}',
    '.mq-panel{display:none;}.mq-panel.active{display:block;}',

    '#mq-search-bar{padding:10px 0;margin-bottom:4px;}',
    '#mq-search{background:var(--mq-surface);border:1px solid var(--mq-border);',
      'color:var(--mq-text);font-family:var(--mq-font);font-size:11px;padding:6px 12px;',
      'border-radius:5px;outline:none;width:260px;}',
    '#mq-search:focus{border-color:var(--mq-blue);}',

    '.mq-empty{text-align:center;padding:48px 24px;color:var(--mq-muted);font-size:12px;}',
    '.mq-empty-icon{font-size:32px;margin-bottom:12px;}',

    '.mq-card{background:var(--mq-surface);border:1px solid var(--mq-border);',
      'border-radius:8px;padding:16px 18px;margin-bottom:10px;',
      'transition:border-color .2s;animation:mq-in .22s ease;}',
    '@keyframes mq-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}',
    '.mq-card:hover{border-color:#2d3a4a;}',
    '.mq-card.pending {border-left:3px solid var(--mq-yellow);}',
    '.mq-card.approved{border-left:3px solid var(--mq-green);}',
    '.mq-card.rejected{border-left:3px solid var(--mq-red);}',
    '.mq-card-top{display:flex;align-items:flex-start;gap:10px;}',
    '.mq-status-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:4px;}',
    '.mq-status-dot.pending {background:var(--mq-yellow);}',
    '.mq-status-dot.approved{background:var(--mq-green);}',
    '.mq-status-dot.rejected{background:var(--mq-red);}',
    '.mq-card-title{font-size:13px;font-weight:700;color:var(--mq-text);margin:0 0 3px;}',
    '.mq-card-title a{color:inherit;text-decoration:none;cursor:pointer;}',
    '.mq-card-title a:hover{color:var(--mq-blue);}',
    '.mq-card-meta{font-size:10px;color:var(--mq-muted);display:flex;gap:12px;flex-wrap:wrap;}',

    '.mq-pill{display:inline-flex;align-items:center;padding:3px 10px;border-radius:10px;',
      'font-size:9px;font-weight:700;letter-spacing:.5px;border:1px solid;}',
    '.mq-pill.pending {background:#2d2108;color:var(--mq-yellow);border-color:#6e5409;}',
    '.mq-pill.approved{background:#122620;color:var(--mq-green);border-color:#196327;}',
    '.mq-pill.rejected{background:#2d0f0f;color:var(--mq-red);border-color:#6e1c1c;}',

    '.mq-card-note{margin-top:10px;padding:8px 12px;background:#111820;',
      'border-radius:5px;font-size:11px;color:#8b949e;border-left:2px solid var(--mq-border);}',
    '.mq-card-note b{color:var(--mq-muted);}',

    '.mq-score-wrap{display:flex;align-items:center;gap:8px;margin-top:8px;}',
    '.mq-score-bar{flex:1;height:3px;background:var(--mq-border);border-radius:2px;overflow:hidden;}',
    '.mq-score-fill{height:100%;border-radius:2px;transition:width .4s;}',
    '.mq-score-lbl{font-size:9px;color:var(--mq-muted);flex-shrink:0;width:52px;}',

    '#mq-footer{text-align:right;font-size:10px;color:var(--mq-muted);margin-top:12px;',
      'padding-top:10px;border-top:1px solid var(--mq-border);}',

    '#mq-loading{text-align:center;padding:64px;color:var(--mq-muted);font-size:12px;',
      'font-family:var(--mq-font);}',
    '@keyframes mq-spin{to{transform:rotate(360deg)}}',
    '.mq-spin{display:inline-block;width:18px;height:18px;border:2px solid var(--mq-border);',
      'border-top-color:var(--mq-blue);border-radius:50%;animation:mq-spin .8s linear infinite;',
      'margin-bottom:12px;}',

    '#mq-detail{max-width:900px;margin:24px auto;font-family:var(--mq-font);}',

    '#mq-breadcrumb{display:flex;align-items:center;gap:6px;font-size:11px;',
      'color:var(--mq-muted);margin-bottom:20px;}',
    '#mq-breadcrumb [data-back]{color:var(--mq-blue);cursor:pointer;}',
    '#mq-breadcrumb [data-back]:hover{text-decoration:underline;}',
    '#mq-breadcrumb .sep{color:var(--mq-border);}',

    '#mq-back-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 16px;',
      'background:transparent;border:1px solid var(--mq-border);color:var(--mq-muted);',
      'border-radius:6px;font-family:var(--mq-font);font-size:10px;cursor:pointer;',
      'transition:all .2s;margin-bottom:16px;}',
    '#mq-back-btn:hover{border-color:var(--mq-blue);color:var(--mq-blue);}',

    '#mq-status-banner{border-radius:8px;padding:12px 18px;margin-bottom:16px;',
      'display:flex;align-items:center;gap:10px;font-size:12px;font-weight:700;}',
    '#mq-status-banner.pending {background:#2d2108;border:1px solid #6e5409;color:var(--mq-yellow);}',
    '#mq-status-banner.approved{background:#122620;border:1px solid #196327;color:var(--mq-green);}',
    '#mq-status-banner.rejected{background:#2d0f0f;border:1px solid #6e1c1c;color:var(--mq-red);}',
    '#mq-status-banner .sb-icon{font-size:18px;}',

    '#mq-official-banner{background:#0e1f2e;border:1px solid #1f6feb;border-radius:8px;',
      'padding:12px 18px;margin-bottom:16px;display:flex;align-items:center;gap:10px;',
      'font-size:12px;color:#79c0ff;}',
    '#mq-official-banner a{color:#79c0ff;font-weight:700;}',

    '#mq-detail-header{background:var(--mq-surface);border:1px solid var(--mq-border);',
      'border-radius:10px;padding:24px 28px;margin-bottom:16px;}',
    '#mq-detail-header h2{font-size:18px;font-weight:700;color:var(--mq-text);margin:0 0 16px;}',
    '#mq-detail-meta-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;}',
    '.mq-meta-item{display:flex;flex-direction:column;gap:3px;}',
    '.mq-meta-key{font-size:9px;color:var(--mq-muted);letter-spacing:.6px;text-transform:uppercase;}',
    '.mq-meta-val{font-size:12px;color:var(--mq-text);}',

    '.mq-detail-score{display:flex;align-items:center;gap:10px;margin-top:16px;',
      'padding-top:14px;border-top:1px solid var(--mq-border);}',
    '.mq-detail-score-bar{flex:1;height:4px;background:var(--mq-border);border-radius:2px;overflow:hidden;}',
    '.mq-detail-score-fill{height:100%;border-radius:2px;transition:width .5s;}',
    '.mq-detail-score-label{font-size:10px;color:var(--mq-muted);flex-shrink:0;min-width:110px;}',

    '#mq-detail-tabs{display:flex;gap:0;border-bottom:1px solid var(--mq-border);margin-bottom:16px;}',
    '.mq-dtab{padding:8px 16px;font-size:10px;font-weight:700;cursor:pointer;',
      'color:var(--mq-muted);border-bottom:2px solid transparent;margin-bottom:-1px;',
      'transition:all .2s;letter-spacing:.5px;background:none;',
      'border-top:none;border-left:none;border-right:none;font-family:var(--mq-font);}',
    '.mq-dtab:hover{color:var(--mq-text);}',
    '.mq-dtab.active{color:var(--mq-blue);border-bottom-color:var(--mq-blue);}',
    '.mq-dtab .mq-badge{display:inline-block;min-width:16px;padding:1px 4px;',
      'border-radius:8px;font-size:9px;margin-left:5px;',
      'background:var(--mq-border);color:var(--mq-muted);}',
    '.mq-dtab.active .mq-badge{background:#111d2b;color:var(--mq-blue);}',
    '.mq-dpanel{display:none;}.mq-dpanel.active{display:block;}',

    '#mq-content-box{background:var(--mq-surface);border:1px solid var(--mq-border);',
      'border-radius:10px;overflow:hidden;margin-bottom:16px;}',
    '#mq-content-box-header{padding:12px 18px;border-bottom:1px solid var(--mq-border);',
      'font-size:10px;font-weight:700;color:var(--mq-muted);letter-spacing:.6px;',
      'display:flex;align-items:center;gap:8px;background:#090d12;}',
    '#mq-content-body{padding:20px 24px;font-size:13px;color:var(--mq-text);',
      'line-height:1.75;white-space:pre-wrap;word-break:break-word;}',

    '#mq-locked-box{background:var(--mq-surface);border:1px solid var(--mq-border);',
      'border-radius:8px;padding:40px;text-align:center;color:var(--mq-muted);',
      'font-size:12px;margin-bottom:16px;}',
    '#mq-locked-box .nc-icon{font-size:32px;margin-bottom:12px;}',

    '#mq-preview-box{border:1px solid var(--mq-border);border-radius:10px;overflow:hidden;}',
    '#mq-preview-toolbar{padding:10px 16px;background:#090d12;',
      'border-bottom:1px solid var(--mq-border);',
      'display:flex;align-items:center;gap:10px;font-size:10px;color:var(--mq-muted);}',
    '#mq-preview-toolbar .preview-url{flex:1;padding:4px 10px;background:var(--mq-surface);',
      'border:1px solid var(--mq-border);border-radius:4px;',
      'color:var(--mq-muted);font-size:10px;font-family:var(--mq-font);}',
    '#mq-preview-iframe{width:100%;min-height:480px;border:none;background:#fff;display:block;}',

    ].join('\n');

    // ═══════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════════
    function esc(s) {
        return String(s || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    function relTime(iso) {
        if (!iso) return '—';
        var diff = Date.now() - new Date(iso).getTime();
        if (diff < 60000)    return 'vừa xong';
        if (diff < 3600000)  return Math.floor(diff / 60000) + ' phút trước';
        if (diff < 86400000) return Math.floor(diff / 3600000) + ' giờ trước';
        return Math.floor(diff / 86400000) + ' ngày trước';
    }

    function fmtDate(iso) {
        if (!iso) return '—';
        var d = new Date(iso);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
               ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }

    function scoreColor(s) {
        if (s < 0.25) return '#2ea043';
        if (s < 0.55) return '#d29922';
        return '#f85149';
    }

    function statusLabel(s) {
        if (s === 'approved') return '✅ Đã duyệt';
        if (s === 'rejected') return '❌ Từ chối';
        return '⏳ Đang chờ';
    }

    function detailUrl(pn) {
        return mw.util.getUrl(QUEUE_BASE + '/' + (pn || ''));
    }

    function isHtmlPreviewPath(sub) {
        return sub && (sub.endsWith('/html') || sub.endsWith('%2Fhtml'));
    }

    function getVirtualSubPath() {
        var p  = QUEUE_BASE  + '/';
        var pe = decodeURIComponent(QUEUE_BASE_E) + '/';
        var d  = decodeURIComponent(pageName);
        if (d.startsWith(decodeURIComponent(p)))  return d.slice(p.length);
        if (d.startsWith(pe)) return d.slice(pe.length);
        return null;
    }

    function setH1(text) {
        var h1 = document.querySelector('#firstHeading, h1.firstHeading');
        if (h1) h1.textContent = text;
    }

    function setContent(html) {
        var el = document.getElementById('mw-content-text');
        if (el) el.innerHTML = html;
    }

    function appendToContent(node) {
        var el = document.getElementById('mw-content-text');
        if (el) { el.innerHTML = ''; el.appendChild(node); }
    }

    function loadingHTML(msg) {
        return '<div id="mq-loading"><div class="mq-spin"></div><br>' + esc(msg || 'Đang tải…') + '</div>';
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════════
    var _allItems    = [];
    var _lastUpdated = null;
    var _activeTab   = 'all';
    var _search      = '';
    var _sortBy      = 'rp'; // 'rp' or 'date'
    var _authorRPCache = {}; // Cache map for authors' RP values: { authorName: { rp: X, tier: Y } }

    // Load author RP from session cache if available
    try {
        var cached = sessionStorage.getItem('maple_queue_rp_cache');
        if (cached) _authorRPCache = JSON.parse(cached);
    } catch(e) {}

    // Fetch RP for a list of authors
    function fetchAuthorsRP(authors, cb) {
        var uniqAuthors = Array.from(new Set(authors)).filter(function(a) {
            return a && a !== '—' && !_authorRPCache[a];
        });

        if (uniqAuthors.length === 0) {
            return cb();
        }

        var promises = uniqAuthors.map(function(author) {
            var PAGE = 'Thành viên:' + author.replace(/ /g, '_') + '/Maple-Achievements.json';
            return api.get({
                action: 'query', titles: PAGE, prop: 'revisions',
                rvprop: 'content', rvslots: 'main', format: 'json', formatversion: 2
            }).then(function(r) {
                var rpVal = 0;
                try {
                    var pg = r.query && r.query.pages && r.query.pages[0];
                    if (pg && !pg.missing && pg.revisions && pg.revisions[0]) {
                        var rev = pg.revisions[0];
                        var t = (rev.slots && rev.slots.main && rev.slots.main.content) || rev.content || '{}';
                        var parsed = JSON.parse(t);
                        var ss = parsed.stats || {};
                        var selfRP = ss.rp || 0;
                        var earnedList = Object.keys(parsed.earned || {}).map(function(id) {
                            return window.MAPLE.catalog.entryFromId(id, parsed.earned[id]);
                        }).filter(Boolean);
                        var achRP = window.MAPLE.catalog.computeRP(earnedList);
                        rpVal = selfRP + achRP;
                    }
                } catch(e) {}
                var tierObj = window.MAPLE.catalog.tierOf(rpVal);
                _authorRPCache[author] = { rp: rpVal, tier: tierObj };
            }).catch(function() {
                var tierObj = window.MAPLE.catalog.tierOf(0);
                _authorRPCache[author] = { rp: 0, tier: tierObj };
            });
        });

        $.when.apply($, promises).always(function() {
            try {
                sessionStorage.setItem('maple_queue_rp_cache', JSON.stringify(_authorRPCache));
            } catch(e) {}
            cb();
        });
    }

    function getAuthorRP(author) {
        if (!author || author === '—') return { rp: 0, tier: window.MAPLE.catalog.tierOf(0) };
        if (!_authorRPCache[author]) {
            _authorRPCache[author] = { rp: 0, tier: window.MAPLE.catalog.tierOf(0) };
        }
        return _authorRPCache[author];
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DATA — fetch JSON trực tiếp từ URL raw
    // ═══════════════════════════════════════════════════════════════════════════
    function loadQueue(cb) {
        var JSON_URL = 'https://maplewikivn.miraheze.org/wiki/MediaWiki:Maple-Pending.json?action=raw';

        $.ajax({
            url:      JSON_URL,
            dataType: 'text',
            cache:    false,
        }).done(function (raw) {
            var ts = new Date().toISOString();

            raw = raw.replace(/,\s*([}\]])/g, '$1');

            var parsed;
            try { parsed = JSON.parse(raw); } catch (e) { parsed = []; }

            var q;
            if (Array.isArray(parsed))                        q = parsed;
            else if (parsed && Array.isArray(parsed.pending)) q = parsed.pending;
            else                                              q = [];

            q = q.map(function (item) {
                var status = item.status || 'pending';
                return {
                    id:           item.id            || item.pending_id || '',
                    page_name:    item.page_name      || '',
                    page_title:   item.page_title     || item.page_name || '',
                    author:       item.author         || '—',
                    namespace:    item.namespace,
                    submitted_at: item.submitted_at   || item.submitted || '',
                    status:       status,
                    risk_score:   typeof item.risk_score === 'number' ? item.risk_score :
                                  (item.mod_result && typeof item.mod_result.score === 'number'
                                      ? item.mod_result.score : 0),
                    note:         item.note || (status === 'rejected' ? item.reason || '' : '') || '',
                    reviewed_by:  item.reviewed_by || item.approved_by || item.rejected_by || '',
                    reviewed_at:  item.reviewed_at || item.approved_at || item.rejected_at || '',
                    rev_id:       item.rev_id         || null,
                    created_page: item.created_page   || '',
                    // Nội dung KHÔNG bao giờ expose — giữ nguyên logic cũ
                    content:      null,
                    summary:      null,
                };
            });

            // Fetch authors' RP first before calling callback
            var authors = q.map(function(x) { return x.author; });
            fetchAuthorsRP(authors, function() {
                sortQueue(q);
                cb(q, ts);
            });
        }).fail(function () { cb([], null); });
    }

    function sortQueue(list) {
        list.sort(function (a, b) {
            // Priority 1: pending status first
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;

            if (_sortBy === 'rp') {
                var rpA = getAuthorRP(a.author).rp;
                var rpB = getAuthorRP(b.author).rp;
                if (rpA !== rpB) return rpB - rpA; // Higher RP first
            }

            // Default fallback or 'date' sort: oldest first for pending (FIFO), newest first for approved/rejected (LIFO)
            var dateA = new Date(a.submitted_at);
            var dateB = new Date(b.submitted_at);
            if (a.status === 'pending') {
                return dateA - dateB; // FIFO
            }
            return dateB - dateA; // LIFO
        });
    }

    function findItem(list, pn) {
        var norm = (pn || '').replace(/ /g, '_');
        return list.find(function (x) {
            return (x.page_name || '').replace(/ /g, '_') === norm;
        }) || null;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER: DANH SÁCH
    // ═══════════════════════════════════════════════════════════════════════════
    function buildCard(item) {
        var status   = item.status || 'pending';
        var score    = typeof item.risk_score === 'number' ? item.risk_score : 0;
        var scorePct = Math.round(score * 100);
        var color    = scoreColor(score);
        var authorData = getAuthorRP(item.author);

        var noteHtml = '';
        if (status === 'approved' && item.reviewed_by) {
            noteHtml = '<div class="mq-card-note"><b>Duyệt bởi:</b> ' + esc(item.reviewed_by) +
                       (item.reviewed_at ? ' &nbsp;·&nbsp; ' + relTime(item.reviewed_at) : '') + '</div>';
        } else if (status === 'rejected' && item.reviewed_by) {
            noteHtml = '<div class="mq-card-note"><b>Từ chối bởi:</b> ' + esc(item.reviewed_by) +
                       (item.reviewed_at ? ' &nbsp;·&nbsp; ' + relTime(item.reviewed_at) : '') +
                       (item.note ? '<br><b>Lý do:</b> ' + esc(item.note) : '') + '</div>';
        } else if (item.note) {
            noteHtml = '<div class="mq-card-note"><b>Ghi chú:</b> ' + esc(item.note) + '</div>';
        }

        var rpBadgeHtml = '';
        if (item.author && item.author !== '—') {
            rpBadgeHtml = '<span style="display:inline-flex;align-items:center;gap:4px;padding:1px 6px;border-radius:4px;font-size:9px;font-weight:bold;margin-left:6px;background:' + authorData.tier.color + '22;color:' + authorData.tier.color + ';border:1px solid ' + authorData.tier.color + '44;">' +
                          authorData.rp + ' RP (' + authorData.tier.label + ')</span>';
        }

        return [
            '<div class="mq-card ' + status + '">',
            '  <div class="mq-card-top">',
            '    <div class="mq-status-dot ' + status + '"></div>',
            '    <div style="flex:1;min-width:0;">',
            '      <div class="mq-card-title">',
            '        <a href="' + esc(detailUrl(item.page_name || '')) + '"',
            '           data-mq-pagename="' + esc(item.page_name || '') + '">',
            esc(item.page_title || item.page_name),
            '        </a>',
            '      </div>',
            '      <div class="mq-card-meta">',
            '        <span>' + esc(item.author || '—') + rpBadgeHtml + '</span>',
            '        <span>Gửi ' + relTime(item.submitted_at) + '</span>',
            (item.rev_id ? '<span>rev#' + esc(String(item.rev_id)) + '</span>' : ''),
            '        <span class="mq-pill ' + status + '">' + statusLabel(status) + '</span>',
            (item.id ? '<span style="font-size:9px;color:var(--mq-muted);">' + esc(item.id.substring(0, 12)) + '</span>' : ''),
            '      </div>',
            '      <div class="mq-score-wrap">',
            '        <div class="mq-score-lbl">Rủi ro: ' + scorePct + '%</div>',
            '        <div class="mq-score-bar">',
            '          <div class="mq-score-fill" style="width:' + scorePct + '%;background:' + color + '"></div>',
            '        </div>',
            '      </div>',
            noteHtml,
            '    </div>',
            '  </div>',
            '</div>',
        ].join('\n');
    }

    function filteredItems(tab, search) {
        return _allItems.filter(function (item) {
            var statusOk = tab === 'all' || item.status === tab;
            var searchOk = !search ||
                (item.page_title || '').toLowerCase().indexOf(search) !== -1 ||
                (item.author     || '').toLowerCase().indexOf(search) !== -1 ||
                (item.id         || '').toLowerCase().indexOf(search) !== -1;
            return statusOk && searchOk;
        });
    }

    function renderList() {
        var pending  = _allItems.filter(function (x) { return x.status === 'pending';  });
        var approved = _allItems.filter(function (x) { return x.status === 'approved'; });
        var rejected = _allItems.filter(function (x) { return x.status === 'rejected'; });

        var wrap = document.createElement('div');
        wrap.id  = 'mq-wrap';
        wrap.innerHTML = [
            '<div id="mq-header">',
            '  <div id="mq-header-icon">📋</div>',
            '  <div id="mq-header-text">',
            '    <h1>HÀNG CHỜ KIỂM DUYỆT</h1>',
            '    <p>Danh sách bài viết đang chờ admin xem xét</p>',
            '  </div>',
            '  <button id="mq-sync-btn">↻ Làm mới</button>',
            '</div>',
 
            '<div id="mq-stats">',
            '  <div class="mq-stat all">     <div class="mq-stat-num">' + _allItems.length + '</div><div class="mq-stat-lbl">TỔNG CỘNG</div></div>',
            '  <div class="mq-stat pending"> <div class="mq-stat-num">' + pending.length   + '</div><div class="mq-stat-lbl">ĐANG CHỜ</div></div>',
            '  <div class="mq-stat approved"><div class="mq-stat-num">' + approved.length  + '</div><div class="mq-stat-lbl">ĐÃ DUYỆT</div></div>',
            '  <div class="mq-stat rejected"><div class="mq-stat-num">' + rejected.length  + '</div><div class="mq-stat-lbl">TỪ CHỐI</div></div>',
            '</div>',

            '<div id="mq-tabs">',
            '  <button class="mq-tab tab-all active"  data-filter="all">TẤT CẢ<span class="mq-badge">'          + _allItems.length + '</span></button>',
            '  <button class="mq-tab tab-pending"     data-filter="pending">⏳ ĐANG CHỜ<span class="mq-badge">'  + pending.length   + '</span></button>',
            '  <button class="mq-tab tab-approved"    data-filter="approved">✅ ĐÃ DUYỆT<span class="mq-badge">' + approved.length  + '</span></button>',
            '  <button class="mq-tab tab-rejected"    data-filter="rejected">❌ TỪ CHỐI<span class="mq-badge">'  + rejected.length  + '</span></button>',
            '</div>',

            '<div id="mq-search-bar" style="display:flex;justify-content:space-between;align-items:center;">',
            '  <input id="mq-search" type="text" placeholder="Tìm tên trang, tác giả, ID...">',
            '  <div style="font-size:11px;color:var(--mq-muted);display:flex;align-items:center;gap:6px;">',
            '    <span>Sắp xếp:</span>',
            '    <select id="mq-sort-select" style="background:var(--mq-surface);border:1px solid var(--mq-border);color:var(--mq-text);font-family:var(--mq-font);font-size:10px;padding:3px 6px;border-radius:4px;outline:none;cursor:pointer;">',
            '      <option value="rp"' + (_sortBy === 'rp' ? ' selected' : '') + '>Theo RP Uy Tín</option>',
            '      <option value="date"' + (_sortBy === 'date' ? ' selected' : '') + '>Theo ngày gửi</option>',
            '    </select>',
            '  </div>',
            '</div>',

            '<div id="mq-list-body"></div>',

            '<div id="mq-footer">Cập nhật lần cuối: ' + esc(_lastUpdated ? new Date(_lastUpdated).toLocaleString('vi-VN') : '—') + '</div>',
        ].join('\n');

        appendToContent(wrap);
        setH1('Hàng Chờ Kiểm Duyệt — MAPLE');
        document.title = 'Hàng Chờ Kiểm Duyệt — MAPLE';

        function renderListBody() {
            var items = filteredItems(_activeTab, _search);
            var body  = document.getElementById('mq-list-body');
            if (!body) return;
            if (items.length === 0) {
                body.innerHTML = '<div class="mq-empty"><div class="mq-empty-icon">🔍</div>Không có kết quả</div>';
                return;
            }
            body.innerHTML = items.map(buildCard).join('');
            body.querySelectorAll('a[data-mq-pagename]').forEach(function (a) {
                a.addEventListener('click', function (e) {
                    e.preventDefault();
                    var pn   = a.getAttribute('data-mq-pagename');
                    var item = _allItems.find(function (x) { return x.page_name === pn; });
                    history.pushState({ mqPageName: pn }, '', detailUrl(pn));
                    showDetail(item || { page_name: pn });
                });
            });
        }

        renderListBody();

        wrap.querySelectorAll('.mq-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                wrap.querySelectorAll('.mq-tab').forEach(function (t) { t.classList.remove('active'); });
                tab.classList.add('active');
                _activeTab = tab.getAttribute('data-filter');
                renderListBody();
            });
        });

        var sortEl = document.getElementById('mq-sort-select');
        if (sortEl) {
            sortEl.addEventListener('change', function (e) {
                _sortBy = e.target.value;
                sortQueue(_allItems);
                renderListBody();
            });
        }

        var searchEl = document.getElementById('mq-search');
        if (searchEl) {
            searchEl.value = _search;
            searchEl.addEventListener('input', function (e) {
                _search = e.target.value.toLowerCase().trim();
                renderListBody();
            });
        }

        document.getElementById('mq-sync-btn').addEventListener('click', function () {
            setContent(loadingHTML('Đang tải…'));
            loadQueue(function (items, ts) {
                _allItems    = items;
                _lastUpdated = ts;
                renderList();
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER: CHI TIẾT
    // ═══════════════════════════════════════════════════════════════════════════
    function showDetail(item) {
        var status   = item.status || 'pending';
        var score    = typeof item.risk_score === 'number' ? item.risk_score : 0;
        var scorePct = Math.round(score * 100);
        var color    = scoreColor(score);
        // Nội dung KHÔNG bao giờ hiển thị (content luôn null)
        var canView  = false;

        var bannerMap = {
            pending:  { icon: '⏳', text: 'Bài viết đang trong hàng chờ — admin chưa xem xét.' },
            approved: { icon: '✅', text: 'Bài viết đã được duyệt và xuất bản.' },
            rejected: { icon: '❌', text: 'Bài viết bị từ chối. Xem tab Bình luận để biết lý do.' }
        };
        var banner = bannerMap[status] || bannerMap.pending;

        // Banner link tới trang chính thức (approved) — vẫn hiện link, chỉ không hiện nội dung
        var officialBanner = '';
        if (status === 'approved' && (item.created_page || item.page_name)) {
            var target = item.created_page || item.page_name;
            officialBanner = [
                '<div id="mq-official-banner">',
                '  <span>🔗</span>',
                '  <span>Trang chính thức: <a href="' + esc(mw.util.getUrl(target)) + '" target="_blank">',
                esc(target),
                '  </a></span>',
                '</div>',
            ].join('');
        }

        // Tabs: tất cả status chỉ có tab Bình luận
        var tabsHtml = [
            '<div id="mq-detail-tabs">',
            '  <button class="mq-dtab active" data-dpanel="comments">💬 BÌNH LUẬN<span class="mq-badge" id="mq-comment-badge">…</span></button>',
            '</div>',
        ].join('');

        // Locked box cho tất cả (kể cả approved — không lộ nội dung)
        var lockedNotice = [
            '<div id="mq-locked-box">',
            '  <div class="nc-icon">🔒</div>',
            (status === 'approved'
                ? 'Bài viết đã được duyệt. Truy cập trang chính thức qua link bên trên.'
                : status === 'rejected'
                    ? 'Nội dung bài viết không được hiển thị — bài đã bị từ chối.'
                    : 'Nội dung bài viết chưa được hiển thị — bài đang trong hàng chờ xem xét.'),
            '<br><span style="font-size:10px;">Bạn vẫn có thể đọc bình luận và lý do phía dưới.</span>',
            '</div>',
        ].join('');

        var detail = document.createElement('div');
        detail.id  = 'mq-detail';
        detail.innerHTML = [
            '<div id="mq-breadcrumb">',
            '  <span data-back="list">📋 MAPLE:Hàng_Chờ</span>',
            '  <span class="sep">›</span>',
            '  <span>' + esc(item.page_title || item.page_name || '—') + '</span>',
            '</div>',

            '<button id="mq-back-btn" data-back="list">← Quay lại hàng chờ</button>',

            officialBanner,

            '<div id="mq-status-banner" class="' + status + '">',
            '  <span class="sb-icon">' + banner.icon + '</span>',
            '  <span>' + banner.text + '</span>',
            '</div>',

            lockedNotice,

            '<div id="mq-detail-header">',
            '  <h2>' + esc(item.page_title || item.page_name || '—') + '</h2>',
            '  <div id="mq-detail-meta-grid">',

            '    <div class="mq-meta-item"><span class="mq-meta-key">ID Yêu cầu</span>',
            '      <span class="mq-meta-val" style="font-size:10px;color:var(--mq-muted);">' + esc(item.id || '—') + '</span></div>',

            '    <div class="mq-meta-item"><span class="mq-meta-key">Tác giả</span>',
            '      <span class="mq-meta-val">' + esc(item.author || '—') + '</span></div>',

            '    <div class="mq-meta-item"><span class="mq-meta-key">Thời gian gửi</span>',
            '      <span class="mq-meta-val">' + fmtDate(item.submitted_at) + '</span></div>',

            '    <div class="mq-meta-item"><span class="mq-meta-key">Không gian tên</span>',
            '      <span class="mq-meta-val">' + esc(String(item.namespace !== undefined ? item.namespace : '—')) + '</span></div>',

            (item.rev_id
                ? '<div class="mq-meta-item"><span class="mq-meta-key">Revision ID</span>' +
                  '<span class="mq-meta-val" style="font-size:10px;color:var(--mq-muted);">rev#' + esc(String(item.rev_id)) + '</span></div>'
                : ''),

            '    <div class="mq-meta-item"><span class="mq-meta-key">Trạng thái</span>',
            '      <span class="mq-meta-val"><span class="mq-pill ' + status + '">' + statusLabel(status) + '</span></span></div>',

            '  </div>',

            '  <div class="mq-detail-score">',
            '    <span class="mq-detail-score-label">Điểm rủi ro: <b style="color:' + color + ';">' + scorePct + '%</b></span>',
            '    <div class="mq-detail-score-bar">',
            '      <div class="mq-detail-score-fill" style="width:' + scorePct + '%;background:' + color + ';"></div>',
            '    </div>',
            '  </div>',

            '</div>',

            tabsHtml,

            '<div class="mq-dpanel active" id="mq-dpanel-comments"></div>',

        ].join('\n');

        appendToContent(detail);
        setH1(item.page_title || item.page_name || '');
        document.title = (item.page_title || item.page_name || '') + ' — Chi tiết MAPLE';

        // Khởi động MAPLEComments
        var commentsContainer = document.getElementById('mq-dpanel-comments');
        if (commentsContainer && item.id) {
            new window.MAPLEComments({
                api:           api,
                requestId:     item.id,
                item:          item,
                container:     commentsContainer,
                currentUser:   currentUser,
                pageOwner:     item.author || '',
                onCountChange: function (n) {
                    var badge = document.getElementById('mq-comment-badge');
                    if (badge) badge.textContent = n;
                }
            }).init();
        }

        detail.querySelectorAll('[data-back]').forEach(function (el) {
            el.addEventListener('click', goBackToList);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // NAVIGATION
    // ═══════════════════════════════════════════════════════════════════════════
    function goBackToList() {
        history.pushState({}, '', mw.util.getUrl(QUEUE_BASE));
        setH1('Hàng Chờ Kiểm Duyệt — MAPLE');
        renderList();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // KHỞI ĐỘNG
    // ═══════════════════════════════════════════════════════════════════════════
    mw.loader.using(['mediawiki.api', 'mediawiki.util']).done(function () {

        if (!document.getElementById('mq-styles')) {
            var styleEl      = document.createElement('style');
            styleEl.id       = 'mq-styles';
            styleEl.textContent = CSS;
            document.head.appendChild(styleEl);
        }

        setH1('Hàng Chờ Kiểm Duyệt — MAPLE');
        setContent(loadingHTML('Đang tải hàng chờ...'));

        var subPath = getVirtualSubPath();

        loadQueue(function (items, ts) {
            _allItems    = items;
            _lastUpdated = ts;

            if (subPath) {
                var skTitle = decodeURIComponent(subPath.replace(/_/g, ' '));
                setH1(skTitle);
                var item = findItem(_allItems, subPath);
                if (item) {
                    showDetail(item);
                } else {
                    setContent([
                        '<div style="text-align:center;padding:64px;color:var(--mq-muted);font-family:var(--mq-font);">',
                        '<div style="font-size:32px;margin-bottom:12px;">🔍</div>',
                        '<div>Không tìm thấy: <b style="color:var(--mq-text);">' + esc(skTitle) + '</b></div>',
                        '<a href="' + esc(mw.util.getUrl(QUEUE_BASE)) + '"',
                        '   style="display:inline-block;margin-top:16px;color:var(--mq-blue);font-size:11px;">← Quay lại hàng chờ</a>',
                        '</div>',
                    ].join(''));
                }
            } else {
                renderList();
            }
        });

        window.addEventListener('popstate', function () {
            var newSub = getVirtualSubPath();
            if (!newSub) {
                loadQueue(function (items, ts) {
                    _allItems    = items;
                    _lastUpdated = ts;
                    setH1('Hàng Chờ Kiểm Duyệt — MAPLE');
                    renderList();
                });
            } else {
                loadQueue(function (items, ts) {
                    _allItems = items;
                    var it = findItem(_allItems, newSub);
                    if (it) showDetail(it);
                });
            }
        });

    });

})(mediaWiki, jQuery);