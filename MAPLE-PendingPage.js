/**
 * MediaWiki:MAPLE-PendingPage.js  v3.0
 *
 * UI hàng chờ kiểm duyệt — chỉ xử lý giao diện.
 * Logic bình luận uỷ quyền hoàn toàn cho MAPLE-Comments.js (window.MAPLEComments).
 *
 * Phụ thuộc:
 *   - MediaWiki:MAPLE-Comments.js  (phải load trước)
 *   - mediawiki.api, mediawiki.util
 */
(function (mw, $) {
    'use strict';

    // ── Kiểm tra phụ thuộc ───────────────────────────────────────────────────
    if (typeof window.MAPLEComments === 'undefined') {
        mw.log.warn('MAPLE-PendingPage: cần load MAPLE-Comments.js trước.');
        return;
    }

    // ── Xác định user & trang ────────────────────────────────────────────────
    var currentUser = mw.config.get('wgUserName');
    if (!currentUser) return;

    var thisPage      = mw.config.get('wgPageName');
    var expectedBase  = 'Người_dùng:' + currentUser + '/Chờ_Duyệt';
    var expectedBaseA = 'User:'        + currentUser + '/Chờ_Duyệt';

    var isBaseQueue  = (thisPage === expectedBase || thisPage === expectedBaseA);
    var isVirtualSub = (
        thisPage.startsWith(expectedBase  + '/') ||
        thisPage.startsWith(expectedBaseA + '/')
    );

    if (!isBaseQueue && !isVirtualSub) return;

    var groups    = mw.config.get('wgUserGroups') || [];
    var isSysop   = groups.indexOf('sysop') !== -1;
    var pageOwner = thisPage.replace(/^(Người_dùng|User):/, '').split('/')[0];

    if (pageOwner !== currentUser && !isSysop) {
        document.getElementById('mw-content-text').innerHTML =
            '<div style="padding:32px;text-align:center;color:#f85149;">⛔ Bạn không có quyền xem trang này.</div>';
        return;
    }

    var api = new mw.Api();

    // ═══════════════════════════════════════════════════════════════════════════
    // CSS — chỉ phần UI danh sách + detail (KHÔNG bao gồm comments)
    // ═══════════════════════════════════════════════════════════════════════════
    var CSS = [
    ':root{--mp-bg:#0a0e14;--mp-surface:#0d1117;--mp-border:#1e2733;',
      '--mp-text:#c9d1d9;--mp-muted:#484f58;--mp-blue:#388bfd;',
      '--mp-green:#2ea043;--mp-yellow:#d29922;--mp-red:#f85149;',
      '--mp-purple:#a371f7;--mp-cyan:#76e3ea;',
      '--mp-font:"JetBrains Mono","Fira Code","Cascadia Code","Consolas",monospace;}',

    // ── Danh sách ─────────────────────────────────────────────────────────────
    '#mp-wrap{max-width:900px;margin:24px auto;font-family:var(--mp-font);}',

    '#mp-header{display:flex;align-items:center;gap:14px;margin-bottom:24px;',
      'padding-bottom:16px;border-bottom:1px solid var(--mp-border);}',
    '#mp-header-icon{width:42px;height:42px;background:#111d2b;border:1px solid #1f3e6e;',
      'border-radius:10px;display:flex;align-items:center;justify-content:center;',
      'font-size:20px;flex-shrink:0;}',
    '#mp-header-text h1{font-size:15px;font-weight:700;color:var(--mp-blue);margin:0 0 3px;letter-spacing:.5px;}',
    '#mp-header-text p{font-size:11px;color:var(--mp-muted);margin:0;}',
    '#mp-sync-btn{margin-left:auto;background:transparent;border:1px solid var(--mp-border);',
      'color:var(--mp-muted);font-family:var(--mp-font);font-size:10px;padding:5px 12px;',
      'border-radius:5px;cursor:pointer;transition:all .2s;}',
    '#mp-sync-btn:hover{border-color:var(--mp-blue);color:var(--mp-blue);}',

    '#mp-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;}',
    '.mp-stat{background:var(--mp-surface);border:1px solid var(--mp-border);',
      'border-radius:8px;padding:12px 16px;text-align:center;}',
    '.mp-stat-num{font-size:24px;font-weight:700;line-height:1;}',
    '.mp-stat-lbl{font-size:10px;color:var(--mp-muted);margin-top:4px;letter-spacing:.5px;}',
    '.mp-stat.pending  .mp-stat-num{color:var(--mp-yellow);}',
    '.mp-stat.approved .mp-stat-num{color:var(--mp-green);}',
    '.mp-stat.rejected .mp-stat-num{color:var(--mp-red);}',

    '#mp-tabs{display:flex;gap:0;border-bottom:1px solid var(--mp-border);margin-bottom:16px;}',
    '.mp-tab{padding:8px 18px;font-size:11px;font-weight:700;cursor:pointer;',
      'color:var(--mp-muted);border-bottom:2px solid transparent;margin-bottom:-1px;',
      'transition:all .2s;letter-spacing:.5px;background:none;',
      'border-top:none;border-left:none;border-right:none;font-family:var(--mp-font);}',
    '.mp-tab:hover{color:var(--mp-text);}',
    '.mp-tab.active{color:var(--mp-blue);border-bottom-color:var(--mp-blue);}',
    '.mp-tab .mp-badge{display:inline-block;min-width:18px;padding:1px 5px;',
      'border-radius:9px;font-size:9px;margin-left:6px;background:var(--mp-border);}',
    '.mp-tab.active.tab-pending  .mp-badge{background:#2d2108;color:var(--mp-yellow);}',
    '.mp-tab.active.tab-approved .mp-badge{background:#122620;color:var(--mp-green);}',
    '.mp-tab.active.tab-rejected .mp-badge{background:#2d0f0f;color:var(--mp-red);}',
    '.mp-panel{display:none;}.mp-panel.active{display:block;}',

    '.mp-empty{text-align:center;padding:48px 24px;color:var(--mp-muted);font-size:12px;}',
    '.mp-empty-icon{font-size:32px;margin-bottom:12px;}',

    '.mp-card{background:var(--mp-surface);border:1px solid var(--mp-border);',
      'border-radius:8px;padding:16px 18px;margin-bottom:10px;',
      'transition:border-color .2s;animation:mp-in .22s ease;}',
    '@keyframes mp-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}',
    '.mp-card:hover{border-color:#2d3a4a;}',
    '.mp-card.pending {border-left:3px solid var(--mp-yellow);}',
    '.mp-card.approved{border-left:3px solid var(--mp-green);}',
    '.mp-card.rejected{border-left:3px solid var(--mp-red);}',
    '.mp-card-top{display:flex;align-items:flex-start;gap:10px;}',
    '.mp-status-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:4px;}',
    '.mp-status-dot.pending {background:var(--mp-yellow);}',
    '.mp-status-dot.approved{background:var(--mp-green);}',
    '.mp-status-dot.rejected{background:var(--mp-red);}',
    '.mp-card-title{font-size:13px;font-weight:700;color:var(--mp-text);margin:0 0 3px;}',
    '.mp-card-title a{color:inherit;text-decoration:none;cursor:pointer;}',
    '.mp-card-title a:hover{color:var(--mp-blue);}',
    '.mp-card-meta{font-size:10px;color:var(--mp-muted);display:flex;gap:12px;flex-wrap:wrap;}',

    '.mp-pill{display:inline-flex;align-items:center;padding:3px 10px;border-radius:10px;',
      'font-size:9px;font-weight:700;letter-spacing:.5px;border:1px solid;}',
    '.mp-pill.pending {background:#2d2108;color:var(--mp-yellow);border-color:#6e5409;}',
    '.mp-pill.approved{background:#122620;color:var(--mp-green);border-color:#196327;}',
    '.mp-pill.rejected{background:#2d0f0f;color:var(--mp-red);border-color:#6e1c1c;}',

    '.mp-card-note{margin-top:10px;padding:8px 12px;background:#111820;',
      'border-radius:5px;font-size:11px;color:#8b949e;border-left:2px solid var(--mp-border);}',
    '.mp-card-note b{color:var(--mp-muted);}',

    '.mp-score-wrap{display:flex;align-items:center;gap:8px;margin-top:8px;}',
    '.mp-score-bar{flex:1;height:3px;background:var(--mp-border);border-radius:2px;overflow:hidden;}',
    '.mp-score-fill{height:100%;border-radius:2px;transition:width .4s;}',
    '.mp-score-lbl{font-size:9px;color:var(--mp-muted);flex-shrink:0;width:52px;}',

    // ── Loading ───────────────────────────────────────────────────────────────
    '#mp-loading{text-align:center;padding:64px;color:var(--mp-muted);font-size:12px;}',
    '@keyframes mp-spin{to{transform:rotate(360deg)}}',
    '.mp-spin{display:inline-block;width:18px;height:18px;border:2px solid var(--mp-border);',
      'border-top-color:var(--mp-blue);border-radius:50%;animation:mp-spin .8s linear infinite;',
      'margin-bottom:12px;}',

    // ── Trang chi tiết ────────────────────────────────────────────────────────
    '#mp-detail{max-width:900px;margin:24px auto;font-family:var(--mp-font);}',

    '#mp-breadcrumb{display:flex;align-items:center;gap:6px;font-size:11px;',
      'color:var(--mp-muted);margin-bottom:20px;}',
    '#mp-breadcrumb [data-back]{color:var(--mp-blue);cursor:pointer;}',
    '#mp-breadcrumb [data-back]:hover{text-decoration:underline;}',
    '#mp-breadcrumb .sep{color:var(--mp-border);}',

    '#mp-back-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 16px;',
      'background:transparent;border:1px solid var(--mp-border);color:var(--mp-muted);',
      'border-radius:6px;font-family:var(--mp-font);font-size:10px;cursor:pointer;',
      'transition:all .2s;margin-bottom:16px;}',
    '#mp-back-btn:hover{border-color:var(--mp-blue);color:var(--mp-blue);}',

    '#mp-status-banner{border-radius:8px;padding:12px 18px;margin-bottom:16px;',
      'display:flex;align-items:center;gap:10px;font-size:12px;font-weight:700;}',
    '#mp-status-banner.pending {background:#2d2108;border:1px solid #6e5409;color:var(--mp-yellow);}',
    '#mp-status-banner.approved{background:#122620;border:1px solid #196327;color:var(--mp-green);}',
    '#mp-status-banner.rejected{background:#2d0f0f;border:1px solid #6e1c1c;color:var(--mp-red);}',
    '#mp-status-banner .sb-icon{font-size:18px;}',

    '#mp-created-banner{background:#0e1f2e;border:1px solid #1f6feb;border-radius:8px;',
      'padding:12px 18px;margin-bottom:16px;display:flex;align-items:center;gap:10px;',
      'font-size:12px;color:#79c0ff;}',

    '#mp-detail-header{background:var(--mp-surface);border:1px solid var(--mp-border);',
      'border-radius:10px;padding:24px 28px;margin-bottom:16px;}',
    '#mp-detail-header h2{font-size:18px;font-weight:700;color:var(--mp-text);margin:0 0 16px;}',
    '#mp-detail-meta-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;}',
    '.mp-meta-item{display:flex;flex-direction:column;gap:3px;}',
    '.mp-meta-key{font-size:9px;color:var(--mp-muted);letter-spacing:.6px;text-transform:uppercase;}',
    '.mp-meta-val{font-size:12px;color:var(--mp-text);}',

    '#mp-detail-tabs{display:flex;gap:0;border-bottom:1px solid var(--mp-border);margin-bottom:16px;}',
    '.mp-dtab{padding:8px 16px;font-size:10px;font-weight:700;cursor:pointer;',
      'color:var(--mp-muted);border-bottom:2px solid transparent;margin-bottom:-1px;',
      'transition:all .2s;letter-spacing:.5px;background:none;',
      'border-top:none;border-left:none;border-right:none;font-family:var(--mp-font);}',
    '.mp-dtab:hover{color:var(--mp-text);}',
    '.mp-dtab.active{color:var(--mp-blue);border-bottom-color:var(--mp-blue);}',
    '.mp-dtab .mp-badge{display:inline-block;min-width:16px;padding:1px 4px;',
      'border-radius:8px;font-size:9px;margin-left:5px;',
      'background:var(--mp-border);color:var(--mp-muted);}',
    '.mp-dtab.active .mp-badge{background:#111d2b;color:var(--mp-blue);}',
    '.mp-dpanel{display:none;}.mp-dpanel.active{display:block;}',

    '#mp-content-box{background:var(--mp-surface);border:1px solid var(--mp-border);',
      'border-radius:10px;overflow:hidden;margin-bottom:16px;}',
    '#mp-content-box-header{padding:12px 18px;border-bottom:1px solid var(--mp-border);',
      'font-size:10px;font-weight:700;color:var(--mp-muted);letter-spacing:.6px;',
      'display:flex;align-items:center;gap:8px;background:#090d12;}',
    '#mp-content-body{padding:20px 24px;font-size:13px;color:var(--mp-text);',
      'line-height:1.75;white-space:pre-wrap;word-break:break-word;}',

    '#mp-summary-box{background:var(--mp-surface);border:1px solid var(--mp-border);',
      'border-radius:8px;padding:14px 18px;margin-bottom:16px;font-size:11px;color:#8b949e;}',
    '#mp-summary-box b{color:var(--mp-muted);display:block;font-size:9px;',
      'letter-spacing:.6px;margin-bottom:4px;}',

    '#mp-preview-box{border:1px solid var(--mp-border);border-radius:10px;overflow:hidden;}',
    '#mp-preview-toolbar{padding:10px 16px;background:#090d12;',
      'border-bottom:1px solid var(--mp-border);',
      'display:flex;align-items:center;gap:10px;font-size:10px;color:var(--mp-muted);}',
    '#mp-preview-toolbar .preview-url{flex:1;padding:4px 10px;background:var(--mp-surface);',
      'border:1px solid var(--mp-border);border-radius:4px;',
      'color:var(--mp-muted);font-size:10px;font-family:var(--mp-font);}',
    '#mp-preview-iframe{width:100%;min-height:480px;border:none;background:#fff;display:block;}',

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
        if (s === 'rejected') return '❌ Không duyệt';
        return '⏳ Đang chờ';
    }

    function detailUrl(pageName) {
        return mw.util.getUrl(expectedBase + '/' + pageName);
    }

    function previewUrl(pageName) {
        return mw.util.getUrl(expectedBase + '/' + pageName + '/html');
    }

    function getVirtualSubPath() {
        var p = expectedBase  + '/';
        var a = expectedBaseA + '/';
        if (thisPage.startsWith(p)) return thisPage.slice(p.length);
        if (thisPage.startsWith(a)) return thisPage.slice(a.length);
        return null;
    }

    function isHtmlPreviewPath(sub) {
        return sub && (sub.endsWith('/html') || sub.endsWith('%2Fhtml'));
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
        return '<div id="mp-loading"><div class="mp-spin"></div><br>' + esc(msg || 'Đang tải…') + '</div>';
    }

    function goBackToList() {
        history.pushState({}, '', mw.util.getUrl(expectedBase));
        loadAllPending(function (items) {
            render(items);
            setH1('Hàng chờ kiểm duyệt — ' + pageOwner);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DATA
    // ═══════════════════════════════════════════════════════════════════════════
    function loadAllPending(cb) {
        api.get({
            action: 'query',
            titles: 'MediaWiki:Maple-Pending.json',
            prop:   'revisions',
            rvprop: 'content',
            format: 'json'
        }).done(function (data) {
            var pages = data.query.pages;
            var page  = pages[Object.keys(pages)[0]];
            if (page.missing !== undefined) return cb([]);
            var raw = (page.revisions && page.revisions[0] && page.revisions[0]['*']) || '[]';
            raw = raw.replace(/,\s*([}\]])/g, '$1');
            var list;
            try { list = JSON.parse(raw); } catch (e) { list = []; }
            if (!Array.isArray(list)) { try { list = [JSON.parse(raw)]; } catch (e2) { list = []; } }
            cb(list.filter(function (x) { return x.author === pageOwner; }));
        }).fail(function () { cb([]); });
    }

    function findItem(list, pageName) {
        var norm = (pageName || '').replace(/ /g, '_');
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

        var noteHtml = '';
        if (status === 'approved' && item.reviewed_by) {
            noteHtml = '<div class="mp-card-note"><b>Duyệt bởi:</b> ' + esc(item.reviewed_by) +
                       (item.reviewed_at ? ' &nbsp;·&nbsp; ' + relTime(item.reviewed_at) : '') + '</div>';
        } else if (status === 'rejected' && item.reviewed_by) {
            noteHtml = '<div class="mp-card-note"><b>Từ chối bởi:</b> ' + esc(item.reviewed_by) +
                       (item.reviewed_at ? ' &nbsp;·&nbsp; ' + relTime(item.reviewed_at) : '') +
                       (item.note ? '<br><b>Lý do:</b> ' + esc(item.note) : '') + '</div>';
        } else if (status === 'pending' && item.note) {
            noteHtml = '<div class="mp-card-note"><b>Ghi chú:</b> ' + esc(item.note) + '</div>';
        }

        return [
            '<div class="mp-card ' + status + '">',
            '  <div class="mp-card-top">',
            '    <div class="mp-status-dot ' + status + '"></div>',
            '    <div style="flex:1;min-width:0;">',
            '      <div class="mp-card-title">',
            '        <a href="' + esc(detailUrl(item.page_name || '')) + '"',
            '           data-mp-pagename="' + esc(item.page_name || '') + '">',
            esc(item.page_title || item.page_name),
            '        </a>',
            '      </div>',
            '      <div class="mp-card-meta">',
            '        <span>Gửi ' + relTime(item.submitted_at) + '</span>',
            (item.rev_id ? '<span>rev#' + esc(String(item.rev_id)) + '</span>' : ''),
            '        <span class="mp-pill ' + status + '">' + statusLabel(status) + '</span>',
            (item.id ? '<span style="font-size:9px;color:var(--mp-muted);">' + esc(item.id) + '</span>' : ''),
            '      </div>',
            '      <div class="mp-score-wrap">',
            '        <div class="mp-score-lbl">Rủi ro: ' + scorePct + '%</div>',
            '        <div class="mp-score-bar">',
            '          <div class="mp-score-fill" style="width:' + scorePct + '%;background:' + color + '"></div>',
            '        </div>',
            '      </div>',
            noteHtml,
            '    </div>',
            '  </div>',
            '</div>',
        ].join('\n');
    }

    function render(items) {
        var pending  = items.filter(function (x) { return x.status === 'pending';  });
        var approved = items.filter(function (x) { return x.status === 'approved'; });
        var rejected = items.filter(function (x) { return x.status === 'rejected'; });

        var wrap = document.createElement('div');
        wrap.id  = 'mp-wrap';
        wrap.innerHTML = [
            '<div id="mp-header">',
            '  <div id="mp-header-icon">📋</div>',
            '  <div id="mp-header-text">',
            '    <h1>HÀNG CHỜ KIỂM DUYỆT</h1>',
            '    <p>Bài viết của <b>' + esc(pageOwner) + '</b> đang chờ admin xem xét</p>',
            '  </div>',
            '  <button id="mp-sync-btn">↻ Làm mới</button>',
            '</div>',

            '<div id="mp-stats">',
            '  <div class="mp-stat pending"><div class="mp-stat-num">'  + pending.length  + '</div><div class="mp-stat-lbl">ĐANG CHỜ</div></div>',
            '  <div class="mp-stat approved"><div class="mp-stat-num">' + approved.length + '</div><div class="mp-stat-lbl">ĐÃ DUYỆT</div></div>',
            '  <div class="mp-stat rejected"><div class="mp-stat-num">' + rejected.length + '</div><div class="mp-stat-lbl">KHÔNG DUYỆT</div></div>',
            '</div>',

            '<div id="mp-tabs">',
            '  <button class="mp-tab tab-pending active"  data-panel="pending">ĐANG CHỜ<span class="mp-badge">'    + pending.length  + '</span></button>',
            '  <button class="mp-tab tab-approved"        data-panel="approved">ĐÃ DUYỆT<span class="mp-badge">'   + approved.length + '</span></button>',
            '  <button class="mp-tab tab-rejected"        data-panel="rejected">KHÔNG DUYỆT<span class="mp-badge">' + rejected.length + '</span></button>',
            '</div>',

            '<div class="mp-panel active" id="mp-panel-pending">',
            pending.length  === 0 ? '<div class="mp-empty"><div class="mp-empty-icon">✨</div>Không có bài nào đang chờ</div>'   : pending.map(buildCard).join(''),
            '</div>',
            '<div class="mp-panel" id="mp-panel-approved">',
            approved.length === 0 ? '<div class="mp-empty"><div class="mp-empty-icon">📭</div>Chưa có bài nào được duyệt</div>' : approved.map(buildCard).join(''),
            '</div>',
            '<div class="mp-panel" id="mp-panel-rejected">',
            rejected.length === 0 ? '<div class="mp-empty"><div class="mp-empty-icon">🗂️</div>Không có bài nào bị từ chối</div>': rejected.map(buildCard).join(''),
            '</div>',
        ].join('\n');

        appendToContent(wrap);
        document.title = 'Hàng chờ kiểm duyệt — ' + pageOwner;

        // Tab switching
        wrap.querySelectorAll('.mp-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                wrap.querySelectorAll('.mp-tab').forEach(function (t) { t.classList.remove('active'); });
                wrap.querySelectorAll('.mp-panel').forEach(function (p) { p.classList.remove('active'); });
                tab.classList.add('active');
                document.getElementById('mp-panel-' + tab.dataset.panel).classList.add('active');
            });
        });

        // Click card → detail
        wrap.addEventListener('click', function (e) {
            var link = e.target.closest('a[data-mp-pagename]');
            if (!link) return;
            e.preventDefault();
            var pageName = link.getAttribute('data-mp-pagename');
            var item     = items.find(function (x) { return x.page_name === pageName; });
            history.pushState({ mpPageName: pageName }, '', detailUrl(pageName));
            showDetail(item || { page_name: pageName });
        });

        document.getElementById('mp-sync-btn').addEventListener('click', function () {
            setContent(loadingHTML('Đang tải…'));
            loadAllPending(render);
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

        var bannerMap = {
            pending:  { icon: '⏳', text: 'Bài viết đang trong hàng chờ — admin chưa xem xét.' },
            approved: { icon: '✅', text: 'Bài viết đã được duyệt và xuất bản.' },
            rejected: { icon: '❌', text: 'Bài viết bị từ chối. Xem tab Bình luận để biết lý do.' }
        };
        var banner = bannerMap[status] || bannerMap.pending;

        var createdBanner = '';
        if (status === 'approved' && item.created_page) {
            createdBanner = [
                '<div id="mp-created-banner">',
                '  <span>🎉</span>',
                '  <span>Đã tạo trang: <a href="' + esc(mw.util.getUrl(item.created_page)) + '"',
                '    style="color:#79c0ff;font-weight:700;">' + esc(item.created_page) + '</a></span>',
                '</div>',
            ].join('');
        }

        var summaryHtml = item.summary
            ? '<div id="mp-summary-box"><b>TÓM TẮT CHỈNH SỬA</b>' + esc(item.summary) + '</div>'
            : '';

        var detail = document.createElement('div');
        detail.id  = 'mp-detail';
        detail.innerHTML = [
            '<div id="mp-breadcrumb">',
            '  <span data-back="list">📋 Hàng chờ</span>',
            '  <span class="sep">›</span>',
            '  <span>' + esc(item.page_title || item.page_name || '—') + '</span>',
            '</div>',

            '<button id="mp-back-btn" data-back="list">← Quay lại hàng chờ</button>',

            createdBanner,

            '<div id="mp-status-banner" class="' + status + '">',
            '  <span class="sb-icon">' + banner.icon + '</span>',
            '  <span>' + banner.text + '</span>',
            '</div>',

            '<div id="mp-detail-header">',
            '  <h2>' + esc(item.page_title || item.page_name || '—') + '</h2>',
            '  <div id="mp-detail-meta-grid">',
            '    <div class="mp-meta-item"><span class="mp-meta-key">ID Yêu cầu</span>',
            '      <span class="mp-meta-val" style="font-size:10px;color:var(--mp-muted);">' + esc(item.id || '—') + '</span></div>',
            '    <div class="mp-meta-item"><span class="mp-meta-key">Tác giả</span>',
            '      <span class="mp-meta-val">' + esc(item.author || '—') + '</span></div>',
            '    <div class="mp-meta-item"><span class="mp-meta-key">Thời gian gửi</span>',
            '      <span class="mp-meta-val">' + fmtDate(item.submitted_at) + '</span></div>',
            '    <div class="mp-meta-item"><span class="mp-meta-key">Namespace</span>',
            '      <span class="mp-meta-val">' + esc(String(item.namespace !== undefined ? item.namespace : '—')) + '</span></div>',
            (item.rev_id
                ? '<div class="mp-meta-item"><span class="mp-meta-key">Revision ID</span>' +
                  '<span class="mp-meta-val">rev#' + esc(String(item.rev_id)) + '</span></div>'
                : ''),
            '    <div class="mp-meta-item"><span class="mp-meta-key">Điểm rủi ro</span>',
            '      <span class="mp-meta-val" style="color:' + color + ';">' + scorePct + '%',
            '        <span style="font-size:9px;color:var(--mp-muted);"> (0% = an toàn)</span>',
            '      </span></div>',
            '  </div>',
            '</div>',

            // ── 3 Tabs ──────────────────────────────────────────────────────
            '<div id="mp-detail-tabs">',
            '  <button class="mp-dtab active" data-dpanel="content">📄 NỘI DUNG</button>',
            '  <button class="mp-dtab"        data-dpanel="preview">🌐 XEM TRƯỚC</button>',
            '  <button class="mp-dtab"        data-dpanel="comments">💬 BÌNH LUẬN',
            '    <span class="mp-badge" id="mp-comment-badge">…</span>',
            '  </button>',
            '</div>',

            // Panel: Nội dung
            '<div class="mp-dpanel active" id="mp-dpanel-content">',
            summaryHtml,
            '<div id="mp-content-box">',
            '  <div id="mp-content-box-header"><span>📄</span><span>NỘI DUNG BÀI VIẾT (WIKITEXT / HTML)</span></div>',
            '  <div id="mp-content-body">' + esc(item.content || '(Không có nội dung)') + '</div>',
            '</div>',
            '</div>',

            // Panel: Xem trước
            '<div class="mp-dpanel" id="mp-dpanel-preview">',
            '<div style="padding:16px 0 8px;font-size:11px;color:var(--mp-muted);">',
            '  Trang ảo /html render nội dung sạch như Wikipedia — không có UI MAPLE.',
            '</div>',
            '<a href="' + esc(previewUrl(item.page_name || '')) + '"',
            '   data-mp-preview="1" data-mp-pagename="' + esc(item.page_name || '') + '"',
            '   style="display:inline-flex;align-items:center;gap:8px;padding:9px 20px;',
            '   background:#111d2b;border:1px solid var(--mp-blue);color:var(--mp-blue);',
            '   border-radius:7px;font-size:11px;font-weight:700;text-decoration:none;"',
            '   onmouseover="this.style.background=\'#1a2d44\'"',
            '   onmouseout="this.style.background=\'#111d2b\'">',
            '  🌐 Mở trang /html',
            '</a>',
            '<div id="mp-preview-box" style="margin-top:16px;">',
            '  <div id="mp-preview-toolbar">',
            '    <span>🌐</span>',
            '    <div class="preview-url">' + esc(item.page_title || item.page_name || '') + '</div>',
            '  </div>',
            '  <iframe id="mp-preview-iframe" sandbox="allow-same-origin allow-scripts"></iframe>',
            '</div>',
            '</div>',

            // Panel: Bình luận — container rỗng, MAPLEComments tự điền
            '<div class="mp-dpanel" id="mp-dpanel-comments"></div>',

        ].join('\n');

        appendToContent(detail);
        setH1(item.page_title || item.page_name || '');
        document.title = (item.page_title || item.page_name || '') + ' — Chi tiết duyệt';

        // ── Khởi động MAPLEComments ──────────────────────────────────────────
        var commentsContainer = document.getElementById('mp-dpanel-comments');
        if (commentsContainer && item.id) {
            new window.MAPLEComments({
                api:           api,
                requestId:     item.id,
                item:          item,
                container:     commentsContainer,
                currentUser:   currentUser,
                pageOwner:     pageOwner,
                onCountChange: function (n) {
                    var badge = document.getElementById('mp-comment-badge');
                    if (badge) badge.textContent = n;
                }
            }).init();
        }

        // ── Tab switching ────────────────────────────────────────────────────
        detail.querySelectorAll('.mp-dtab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                detail.querySelectorAll('.mp-dtab').forEach(function (t) { t.classList.remove('active'); });
                detail.querySelectorAll('.mp-dpanel').forEach(function (p) { p.classList.remove('active'); });
                tab.classList.add('active');
                var panel = document.getElementById('mp-dpanel-' + tab.dataset.dpanel);
                if (panel) panel.classList.add('active');
                if (tab.dataset.dpanel === 'preview') renderPreviewIframe(item);
            });
        });

        // ── Nút mở /html ────────────────────────────────────────────────────
        detail.querySelectorAll('[data-mp-preview]').forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                var pn = link.getAttribute('data-mp-pagename');
                history.pushState({ mpPageName: pn, htmlPreview: true }, '', previewUrl(pn));
                showHtmlPreview(item);
            });
        });

        // ── Quay lại ─────────────────────────────────────────────────────────
        detail.querySelectorAll('[data-back]').forEach(function (el) {
            el.addEventListener('click', goBackToList);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER: IFRAME INLINE (tab xem trước trong detail)
    // ═══════════════════════════════════════════════════════════════════════════
    function renderPreviewIframe(item) {
        var iframe = document.getElementById('mp-preview-iframe');
        if (!iframe) return;
        var iDoc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
        if (!iDoc) return;
        iDoc.open();
        iDoc.write(buildWikiHTML(item.page_title || item.page_name || '', item.content || ''));
        iDoc.close();
        iframe.onload = function () {
            try {
                var h = iframe.contentDocument.body.scrollHeight;
                iframe.style.minHeight = Math.max(h + 32, 400) + 'px';
            } catch (e) {}
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER: TRANG /html — SẠCH HOÀN TOÀN, KHÔNG CÓ UI MAPLE
    // ═══════════════════════════════════════════════════════════════════════════
    function showHtmlPreview(item) {
        var title = item.page_title || item.page_name || '—';

        // Ẩn toàn bộ chrome MediaWiki
        ['#mw-navigation', '#mw-head', '#mw-panel', '#footer',
         '#p-logo', '#mw-head-base', '#mw-page-base',
         '.mw-indicators', '#p-views', '#p-cactions'].forEach(function (sel) {
            var el = document.querySelector(sel);
            if (el) el.style.display = 'none';
        });

        // Dọn style MAPLE
        ['mp-pending-styles', 'maple-comments-styles'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.remove();
        });

        document.body.style.background = '#fff';

        // Inject Wikipedia style
        var wikiStyle = document.createElement('style');
        wikiStyle.id  = 'mp-wiki-style';
        wikiStyle.textContent = [
            'body{background:#fff!important;}',
            '#content,#mw-content-container{margin:0!important;padding:0!important;',
            '  border:none!important;background:#fff!important;}',
            '#mw-content-text{max-width:960px;margin:32px auto;padding:0 24px;',
            '  font-family:"Linux Libertine","Georgia","Times New Roman",serif;',
            '  font-size:14px;line-height:1.75;color:#202122;}',
            '#firstHeading{display:none!important;}',
            '#mp-wiki-h1{font-size:1.95em;border-bottom:1px solid #a2a9b1;',
            '  padding-bottom:.2em;font-weight:normal;margin:.5em 0 .3em;',
            '  font-family:"Linux Libertine","Georgia",serif;}',
            '#mp-wiki-body h2{font-size:1.5em;border-bottom:1px solid #a2a9b1;',
            '  margin:1em 0 .3em;font-weight:normal;}',
            '#mp-wiki-body h3{font-size:1.2em;margin:.8em 0 .2em;font-weight:bold;}',
            '#mp-wiki-body h4,#mp-wiki-body h5{margin:.6em 0 .2em;font-weight:bold;}',
            '#mp-wiki-body a{color:#3366cc;}',
            '#mp-wiki-body a:visited{color:#795cb2;}',
            '#mp-wiki-body p{margin:.5em 0;}',
            '#mp-wiki-body ul,#mp-wiki-body ol{margin:.3em 0 .3em 1.6em;padding:0;}',
            '#mp-wiki-body table{border-collapse:collapse;margin:.5em 0;}',
            '#mp-wiki-body td,#mp-wiki-body th{border:1px solid #a2a9b1;padding:4px 8px;vertical-align:top;}',
            '#mp-wiki-body th{background:#eaecf0;font-weight:bold;}',
            '#mp-wiki-body code{font-family:monospace;background:#f8f9fa;padding:1px 4px;border-radius:2px;}',
            '#mp-wiki-body pre{background:#f8f9fa;border:1px solid #ddd;padding:12px;',
            '  overflow:auto;font-size:13px;border-radius:2px;}',
            '#mp-wiki-body img{max-width:100%;height:auto;}',
            '#mp-wiki-body hr{border:none;border-top:1px solid #a2a9b1;margin:1em 0;}',
            '#mp-wiki-body .infobox{float:right;margin:0 0 12px 24px;font-size:88%;',
            '  border:1px solid #a2a9b1;background:#f8f9fa;padding:6px;max-width:280px;}',
        ].join('\n');
        document.head.appendChild(wikiStyle);

        setContent(
            '<h1 id="mp-wiki-h1">' + esc(title) + '</h1>' +
            '<div id="mp-wiki-body">' + (item.content || '') + '</div>'
        );

        document.title = title;
    }

    // HTML dùng chung cho iframe preview
    function buildWikiHTML(title, content) {
        return [
            '<!DOCTYPE html><html lang="vi"><head>',
            '<meta charset="utf-8"><title>' + esc(title) + '</title>',
            '<style>',
            'body{font-family:"Linux Libertine","Georgia","Times",serif;',
            '  max-width:860px;margin:20px auto;padding:0 16px;',
            '  font-size:14px;line-height:1.75;color:#202122;background:#fff;}',
            'h1{font-size:1.95em;border-bottom:1px solid #a2a9b1;padding-bottom:.2em;font-weight:normal;}',
            'h2{font-size:1.5em;border-bottom:1px solid #a2a9b1;margin-top:1.2em;font-weight:normal;}',
            'h3{font-size:1.2em;font-weight:bold;}',
            'a{color:#3366cc;}',
            'table{border-collapse:collapse;}',
            'td,th{border:1px solid #a2a9b1;padding:4px 8px;}th{background:#eaecf0;}',
            'code{font-family:monospace;background:#f8f9fa;padding:1px 4px;}',
            'pre{background:#f8f9fa;padding:12px;overflow:auto;}',
            '.infobox{float:right;margin:0 0 12px 24px;border:1px solid #a2a9b1;',
            '  background:#f8f9fa;padding:6px;font-size:88%;max-width:280px;}',
            '</style></head><body>',
            '<h1>' + esc(title) + '</h1>',
            content,
            '</body></html>',
        ].join('\n');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // KHỞI ĐỘNG
    // ═══════════════════════════════════════════════════════════════════════════
    mw.loader.using(['mediawiki.api', 'mediawiki.util']).done(function () {

        var styleEl = document.createElement('style');
        styleEl.id  = 'mp-pending-styles';
        styleEl.textContent = CSS;
        document.head.appendChild(styleEl);

        setH1('Hàng chờ kiểm duyệt — ' + pageOwner);

        if (!isSysop && pageOwner === currentUser) {
            var actions = document.getElementById('p-views');
            if (actions) actions.style.display = 'none';
        }

        setContent(loadingHTML('Đang tải danh sách bài...'));

        var subPath = getVirtualSubPath();

        if (subPath && isHtmlPreviewPath(subPath)) {
            // ── Trang /html ──────────────────────────────────────────────────
            var realPageName = subPath.replace(/\/html$/, '').replace(/%2Fhtml$/, '');
            setContent(loadingHTML('Đang tải xem trước...'));
            loadAllPending(function (list) {
                var item = findItem(list, realPageName);
                if (!item) {
                    setContent(
                        '<div style="text-align:center;padding:64px;color:#555;font-family:serif;">' +
                        '<div style="font-size:32px;margin-bottom:12px;">🔍</div>' +
                        '<div>Không tìm thấy: <b>' + esc(realPageName.replace(/_/g, ' ')) + '</b></div>' +
                        '</div>'
                    );
                    return;
                }
                showHtmlPreview(item);
            });

        } else if (subPath) {
            // ── Trang chi tiết ───────────────────────────────────────────────
            var skTitle = decodeURIComponent(subPath.replace(/_/g, ' '));
            setH1(skTitle);
            setContent(loadingHTML('Đang tải chi tiết...'));
            loadAllPending(function (list) {
                var item = findItem(list, subPath);
                if (!item) {
                    setContent([
                        '<div style="text-align:center;padding:64px;color:var(--mp-muted);font-family:var(--mp-font);">',
                        '<div style="font-size:32px;margin-bottom:12px;">🔍</div>',
                        '<div>Không tìm thấy: <b style="color:var(--mp-text);">' + esc(skTitle) + '</b></div>',
                        '<a href="' + esc(mw.util.getUrl(expectedBase)) + '"',
                        '   style="display:inline-block;margin-top:16px;color:var(--mp-blue);font-size:11px;">',
                        '  ← Quay lại hàng chờ</a>',
                        '</div>',
                    ].join(''));
                    return;
                }
                showDetail(item);
            });

        } else {
            // ── Trang gốc: danh sách ─────────────────────────────────────────
            loadAllPending(render);
        }

        // ── Browser back/forward ─────────────────────────────────────────────
        window.addEventListener('popstate', function () {
            var newSub = getVirtualSubPath();
            if (!newSub) {
                loadAllPending(function (items) {
                    render(items);
                    setH1('Hàng chờ kiểm duyệt — ' + pageOwner);
                });
            } else if (isHtmlPreviewPath(newSub)) {
                var rp = newSub.replace(/\/html$/, '');
                loadAllPending(function (list) {
                    var it = findItem(list, rp);
                    if (it) showHtmlPreview(it);
                });
            } else {
                loadAllPending(function (list) {
                    var it = findItem(list, newSub);
                    if (it) showDetail(it);
                });
            }
        });

    }); // end mw.loader.using

})(mediaWiki, jQuery);