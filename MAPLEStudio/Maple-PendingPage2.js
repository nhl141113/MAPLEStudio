/**
 * MediaWiki:MAPLE-PendingPage.js  v3.1
 *
 * UI hàng chờ kiểm duyệt cho thành viên.
 * Dùng window.MAPLEComments (từ MAPLE-Comments.js) cho tab bình luận.
 * Đồng bộ UI style với Admin:Censor (dark theme, JetBrains Mono).
 *
 * Phụ thuộc: MAPLE-Comments.js phải load trước.
 */
( function ( mw, $ ) {
  'use strict';

  if ( typeof window.MAPLEComments === 'undefined' ) {
    mw.log.warn( 'MAPLE-PendingPage: cần load MAPLE-Comments.js trước.' );
    return;
  }

  var currentUser = mw.config.get( 'wgUserName' );
  if ( !currentUser ) return;

  var thisPage      = mw.config.get( 'wgPageName' );
  var expectedBase  = 'Người_dùng:' + currentUser + '/Chờ_Duyệt';
  var expectedBaseA = 'User:'        + currentUser + '/Chờ_Duyệt';

  var isBaseQueue = ( thisPage === expectedBase || thisPage === expectedBaseA );
  var isVirtualSub = (
    thisPage.startsWith( expectedBase  + '/' ) ||
    thisPage.startsWith( expectedBaseA + '/' )
  );
  if ( !isBaseQueue && !isVirtualSub ) return;

  var groups  = mw.config.get( 'wgUserGroups' ) || [];
  var isSysop = groups.indexOf( 'sysop' ) !== -1;
  var pageOwner = thisPage.replace( /^(Người_dùng|User):/, '' ).split( '/' )[0];

  if ( pageOwner !== currentUser && !isSysop ) {
    document.getElementById( 'mw-content-text' ).innerHTML =
      '<div style="padding:32px;text-align:center;font-family:\'JetBrains Mono\',monospace;color:#ef4444;">⛔ Bạn không có quyền xem trang này.</div>';
    return;
  }

  var api = new mw.Api();

  // ══════════════════════════════════════════════════════════════════════════
  // CSS — đồng bộ với Censor dark theme
  // ══════════════════════════════════════════════════════════════════════════
  var CSS = [
    "@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;700&display=swap');",
    ':root{',
    '  --mp-bg:#050505;--mp-surface:#080808;--mp-panel:#0d0d0d;',
    '  --mp-border:#1e1e1e;--mp-border2:#52525b;',
    '  --mp-text:#e4e4e7;--mp-muted:#52525b;--mp-dim:#333;',
    '  --mp-blue:#60a5fa;--mp-green:#22c55e;',
    '  --mp-amber:#f59e0b;--mp-red:#ef4444;--mp-purple:#a855f7;',
    '  --mp-font:"JetBrains Mono","Fira Code","Consolas",monospace;',
    '}',
    '#mp-wrap{max-width:960px;margin:24px auto;font-family:var(--mp-font);}',
    '#mp-wrap *{box-sizing:border-box;margin:0;padding:0;}',

    /* Header */
    '#mp-header{display:flex;align-items:center;gap:14px;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--mp-border);}',
    '#mp-header-icon{width:42px;height:42px;background:#0d0d0d;border:1px solid var(--mp-border);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}',
    '#mp-header-text h1{font-size:13px;font-weight:700;color:var(--mp-blue);margin:0 0 3px;letter-spacing:.12em;text-transform:uppercase;}',
    '#mp-header-text p{font-size:10px;color:var(--mp-muted);margin:0;}',
    '#mp-sync-btn{margin-left:auto;background:transparent;border:1px solid var(--mp-border);color:var(--mp-muted);font-family:var(--mp-font);font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:8px 16px;cursor:pointer;transition:all .2s;}',
    '#mp-sync-btn:hover{border-color:var(--mp-blue);color:var(--mp-blue);}',

    /* Stats bar */
    '#mp-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--mp-border);border:1px solid var(--mp-border);margin-bottom:20px;}',
    '.mp-stat{background:var(--mp-surface);padding:16px 20px;position:relative;}',
    '.mp-stat-bar{position:absolute;top:0;left:0;right:0;height:2px;}',
    '.mp-stat-num{font-size:26px;font-weight:800;line-height:1;margin-bottom:5px;letter-spacing:-.02em;}',
    '.mp-stat-lbl{font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:var(--mp-muted);}',
    '.mp-stat.pending  .mp-stat-num{color:var(--mp-amber);}',
    '.mp-stat.approved .mp-stat-num{color:var(--mp-green);}',
    '.mp-stat.rejected .mp-stat-num{color:var(--mp-red);}',

    /* Tabs */
    '#mp-tabs{display:flex;gap:0;border-bottom:1px solid var(--mp-border);margin-bottom:16px;}',
    '.mp-tab{padding:9px 18px;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;color:var(--mp-muted);border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .2s;background:none;border-top:none;border-left:none;border-right:none;font-family:var(--mp-font);}',
    '.mp-tab:hover{color:var(--mp-text);}',
    '.mp-tab.active{color:var(--mp-blue);border-bottom-color:var(--mp-blue);}',
    '.mp-tab.tab-pending.active{color:var(--mp-amber);border-bottom-color:var(--mp-amber);}',
    '.mp-tab.tab-approved.active{color:var(--mp-green);border-bottom-color:var(--mp-green);}',
    '.mp-tab.tab-rejected.active{color:var(--mp-red);border-bottom-color:var(--mp-red);}',
    '.mp-tab .mp-badge{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 5px;border-radius:8px;font-size:8px;font-weight:700;margin-left:6px;background:var(--mp-border);color:var(--mp-muted);transition:all .18s;}',
    '.mp-tab.tab-pending.active  .mp-badge{background:rgba(245,158,11,.15);color:var(--mp-amber);}',
    '.mp-tab.tab-approved.active .mp-badge{background:rgba(34,197,94,.15);color:var(--mp-green);}',
    '.mp-tab.tab-rejected.active .mp-badge{background:rgba(239,68,68,.15);color:var(--mp-red);}',
    '.mp-panel{display:none;}.mp-panel.active{display:block;}',
    '.mp-empty{color:var(--mp-dim);font-size:10px;letter-spacing:.2em;padding:60px;text-align:center;border:1px solid var(--mp-border);}',

    /* Card */
    '.mp-card{border:1px solid var(--mp-border);border-left:3px solid transparent;background:var(--mp-surface);margin-bottom:2px;padding:18px 22px;cursor:pointer;transition:background .18s,border-left-color .18s;animation:mp-in .25s ease both;}',
    '@keyframes mp-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}',
    '.mp-card:hover{background:var(--mp-panel);}',
    '.mp-card.pending {border-left-color:var(--mp-amber);}',
    '.mp-card.approved{border-left-color:var(--mp-green);}',
    '.mp-card.rejected{border-left-color:var(--mp-red);}',
    '.mp-card-top{display:flex;align-items:flex-start;gap:10px;}',
    '.mp-card-title{font-size:13px;font-weight:700;color:var(--mp-text);margin-bottom:4px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}',
    '.mp-card-meta{font-size:9px;color:var(--mp-muted);display:flex;gap:10px;flex-wrap:wrap;align-items:center;}',

    /* Pill badge */
    '.mp-pill{font-family:var(--mp-font);font-size:8px;font-weight:700;letter-spacing:.1em;padding:2px 9px;border:1px solid;display:inline-block;}',
    '.mp-pill.pending {color:var(--mp-amber);border-color:rgba(245,158,11,.38);background:rgba(245,158,11,.07);}',
    '.mp-pill.approved{color:var(--mp-green);border-color:rgba(34,197,94,.38);background:rgba(34,197,94,.07);}',
    '.mp-pill.rejected{color:var(--mp-red);border-color:rgba(239,68,68,.4);background:rgba(239,68,68,.07);}',

    /* Score */
    '.mp-score-wrap{display:flex;align-items:center;gap:8px;margin-top:10px;}',
    '.mp-score-lbl{font-size:8px;color:var(--mp-muted);flex-shrink:0;width:54px;letter-spacing:.08em;}',
    '.mp-score-bar{flex:1;height:3px;background:var(--mp-border);}',
    '.mp-score-fill{height:100%;transition:width .4s;}',

    /* Card note */
    '.mp-card-note{margin-top:10px;padding:8px 12px;background:#000;font-size:10px;color:var(--mp-muted);border-left:2px solid var(--mp-border);}',
    '.mp-card-note b{color:var(--mp-dim);}',

    /* Loading */
    '#mp-loading{text-align:center;padding:64px;color:var(--mp-muted);font-size:10px;letter-spacing:.2em;}',

    /* ── DETAIL ── */
    '#mp-detail{max-width:960px;margin:24px auto;font-family:var(--mp-font);}',
    '#mp-detail *{box-sizing:border-box;margin:0;padding:0;}',

    '#mp-breadcrumb{display:flex;align-items:center;gap:8px;font-size:9px;color:var(--mp-muted);margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--mp-border);}',
    '#mp-breadcrumb .bc-link{color:var(--mp-blue);cursor:pointer;letter-spacing:.1em;}',
    '#mp-breadcrumb .bc-link:hover{text-decoration:underline;}',
    '#mp-breadcrumb .bc-sep{color:var(--mp-border2);}',

    '#mp-back-btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;background:transparent;border:1px solid var(--mp-border);color:var(--mp-muted);font-family:var(--mp-font);font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:all .2s;margin-bottom:16px;}',
    '#mp-back-btn:hover{border-color:var(--mp-blue);color:var(--mp-blue);}',

    /* Status banner */
    '.mp-banner{border:1px solid;padding:13px 18px;margin-bottom:16px;display:flex;align-items:center;gap:10px;font-size:10px;font-weight:700;letter-spacing:.08em;}',
    '.mp-banner.pending {border-color:rgba(245,158,11,.25);background:rgba(245,158,11,.07);color:var(--mp-amber);}',
    '.mp-banner.approved{border-color:rgba(34,197,94,.25);background:rgba(34,197,94,.07);color:var(--mp-green);}',
    '.mp-banner.rejected{border-color:rgba(239,68,68,.25);background:rgba(239,68,68,.07);color:var(--mp-red);}',

    /* Detail header */
    '#mp-det-header{background:var(--mp-surface);border:1px solid var(--mp-border);padding:22px 26px;margin-bottom:14px;position:relative;}',
    '#mp-det-header::before{content:"";position:absolute;top:0;left:0;width:14px;height:14px;border-top:2px solid var(--mp-border2);border-left:2px solid var(--mp-border2);}',
    '#mp-det-title{font-size:15px;font-weight:800;letter-spacing:.06em;color:var(--mp-text);text-transform:uppercase;margin-bottom:18px;}',
    '.mp-det-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;}',
    '.mp-det-field{display:flex;flex-direction:column;gap:3px;}',
    '.mp-det-key{font-size:7.5px;letter-spacing:.3em;text-transform:uppercase;color:var(--mp-muted);}',
    '.mp-det-val{font-size:11px;color:var(--mp-text);}',

    /* Score row */
    '.mp-score-row{display:flex;align-items:center;gap:10px;padding-top:14px;border-top:1px solid var(--mp-border);}',
    '.mp-score-row .mp-score-lbl{font-size:8px;color:var(--mp-muted);white-space:nowrap;letter-spacing:.12em;text-transform:uppercase;width:auto;}',
    '.mp-score-row .mp-score-track{flex:1;height:3px;background:var(--mp-border);}',
    '.mp-score-row .mp-score-num{font-size:11px;font-weight:700;white-space:nowrap;}',

    /* Detail tabs */
    '#mp-det-tabs{display:flex;gap:0;border-bottom:1px solid var(--mp-border);margin-bottom:16px;}',
    '.mp-dtab{padding:9px 18px;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;color:var(--mp-muted);border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .2s;background:none;border-top:none;border-left:none;border-right:none;font-family:var(--mp-font);}',
    '.mp-dtab:hover{color:var(--mp-text);}',
    '.mp-dtab.active{color:var(--mp-blue);border-bottom-color:var(--mp-blue);}',
    '.mp-dtab.tab-comments.active{color:var(--mp-blue);border-bottom-color:var(--mp-blue);}',
    '.mp-dtab .mp-badge{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 5px;border-radius:8px;font-size:8px;font-weight:700;margin-left:6px;background:var(--mp-border);color:var(--mp-muted);transition:all .18s;}',
    '.mp-dtab.tab-comments.active .mp-badge{background:rgba(96,165,250,.15);color:var(--mp-blue);}',
    '.mp-dpanel{display:none;}.mp-dpanel.active{display:block;}',

    /* Content box */
    '.mp-content-box{background:var(--mp-surface);border:1px solid var(--mp-border);margin-bottom:14px;}',
    '.mp-content-box-hd{padding:11px 18px;border-bottom:1px solid var(--mp-border);font-size:8px;letter-spacing:.25em;text-transform:uppercase;color:var(--mp-muted);background:var(--mp-panel);}',
    '.mp-content-body{padding:18px 22px;font-size:11.5px;color:var(--mp-text);line-height:1.85;white-space:pre-wrap;word-break:break-word;}',

    /* Flags */
    '.mp-flags-box{background:var(--mp-surface);border:1px solid var(--mp-border);padding:18px 22px;margin-bottom:14px;}',
    '.mp-flags-title{font-size:8px;letter-spacing:.25em;text-transform:uppercase;color:var(--mp-muted);margin-bottom:12px;}',
    '.mp-flag-item{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--mp-border);}',
    '.mp-flag-item:last-child{border-bottom:none;}',
    '.mp-flag-type{font-size:10px;font-weight:700;color:var(--mp-text);}',
    '.mp-flag-msg{font-size:9.5px;color:var(--mp-muted);margin-top:2px;}',

    /* Badge small */
    '.mp-badge-sm{font-family:var(--mp-font);font-size:8px;font-weight:700;letter-spacing:.1em;padding:2px 8px;border:1px solid;display:inline-block;}',
    '.mp-badge-red   {color:var(--mp-red);border-color:rgba(239,68,68,.4);background:rgba(239,68,68,.07);}',
    '.mp-badge-amber {color:var(--mp-amber);border-color:rgba(245,158,11,.38);background:rgba(245,158,11,.07);}',
    '.mp-badge-gray  {color:var(--mp-muted);border-color:var(--mp-border);}',
    '.mp-badge-green {color:var(--mp-green);border-color:rgba(34,197,94,.38);background:rgba(34,197,94,.07);}',
    '.mp-badge-purple{color:var(--mp-purple);border-color:rgba(168,85,247,.38);background:rgba(168,85,247,.07);}',

    /* Preview iframe */
    '.mp-preview-box{border:1px solid var(--mp-border);}',
    '.mp-preview-toolbar{padding:10px 16px;background:var(--mp-panel);border-bottom:1px solid var(--mp-border);display:flex;align-items:center;gap:8px;font-size:9px;color:var(--mp-muted);}',
    '.mp-preview-url{flex:1;padding:4px 10px;background:var(--mp-surface);border:1px solid var(--mp-border);color:var(--mp-muted);font-size:9px;font-family:var(--mp-font);}',
    '.mp-preview-iframe{width:100%;min-height:480px;border:none;background:#fff;display:block;}',

    /* Created banner */
    '.mp-created-banner{background:rgba(34,197,94,.05);border:1px solid rgba(34,197,94,.2);padding:12px 18px;margin-bottom:14px;display:flex;align-items:center;gap:10px;font-size:10px;color:var(--mp-green);}',

    /* Scrollbar */
    '#mp-wrap *::-webkit-scrollbar,#mp-detail *::-webkit-scrollbar{width:3px;}',
    '#mp-wrap *::-webkit-scrollbar-track,#mp-detail *::-webkit-scrollbar-track{background:var(--mp-panel);}',
    '#mp-wrap *::-webkit-scrollbar-thumb,#mp-detail *::-webkit-scrollbar-thumb{background:var(--mp-border2);}',
// ── Inline editor ──────────────────────────────────────────────────────────
'#mp-edit-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 16px;',
'background:transparent;border:1px solid var(--mp-blue);color:var(--mp-blue);',
'border-radius:6px;font-family:var(--mp-font);font-size:10px;cursor:pointer;',
'transition:all .2s;margin-bottom:12px;}',
'#mp-edit-btn:hover{background:#111d2b;}',
'#mp-edit-area{width:100%;min-height:320px;box-sizing:border-box;',
'padding:16px;background:#090d12;border:1px solid var(--mp-blue);',
'border-radius:8px;font-family:var(--mp-font);font-size:12px;',
'color:var(--mp-text);resize:vertical;outline:none;line-height:1.7;}',
'#mp-edit-summary{width:100%;box-sizing:border-box;margin-top:10px;',
'padding:8px 12px;background:var(--mp-surface);border:1px solid var(--mp-border);',
'border-radius:6px;font-family:var(--mp-font);font-size:11px;',
'color:var(--mp-text);outline:none;}',
'#mp-edit-summary:focus{border-color:var(--mp-blue);}',
'#mp-edit-actions{display:flex;gap:8px;margin-top:10px;}',
'.mp-btn-save{padding:8px 20px;background:var(--mp-green);border:none;',
'color:#fff;font-family:var(--mp-font);font-size:11px;font-weight:700;',
'border-radius:6px;cursor:pointer;transition:opacity .2s;}',
'.mp-btn-save:hover{opacity:.85;}',
'.mp-btn-save:disabled{opacity:.5;cursor:not-allowed;}',
'.mp-btn-cancel{padding:8px 16px;background:transparent;',
'border:1px solid var(--mp-border);color:var(--mp-muted);',
'font-family:var(--mp-font);font-size:11px;border-radius:6px;cursor:pointer;',
'transition:all .2s;}',
'.mp-btn-cancel:hover{border-color:var(--mp-red);color:var(--mp-red);}',
'#mp-edit-status{font-size:10px;color:var(--mp-muted);margin-top:6px;min-height:16px;}',
  ].join( '' );

  // ══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════════════════
  function esc( s ) {
    return String( s || '' )
      .replace( /&/g, '&amp;' ).replace( /</g, '&lt;' )
      .replace( />/g, '&gt;' ).replace( /"/g, '&quot;' );
  }
  function relTime( iso ) {
    if ( !iso ) return '—';
    var diff = Date.now() - new Date( iso ).getTime();
    if ( diff < 60000 )    return 'vừa xong';
    if ( diff < 3600000 )  return Math.floor( diff / 60000 ) + ' phút trước';
    if ( diff < 86400000 ) return Math.floor( diff / 3600000 ) + ' giờ trước';
    return Math.floor( diff / 86400000 ) + ' ngày trước';
  }
  function fmtDate( iso ) {
    if ( !iso ) return '—';
    var d = new Date( iso );
    return d.toLocaleDateString( 'vi-VN', {day:'2-digit',month:'2-digit',year:'numeric'} )
      + ' ' + d.toLocaleTimeString( 'vi-VN', {hour:'2-digit',minute:'2-digit'} );
  }
  function scoreColor( s ) {
    if ( s < 0.3 ) return 'var(--mp-green)';
    if ( s < 0.6 ) return 'var(--mp-amber)';
    return 'var(--mp-red)';
  }
  function statusLabel( s ) {
    if ( s === 'approved' ) return '✅ Đã duyệt';
    if ( s === 'rejected' ) return '❌ Không duyệt';
    return '⏳ Đang chờ';
  }
  function detailUrl( pageName ) {
    return mw.util.getUrl( expectedBase + '/' + pageName );
  }
  function previewUrl( pageName ) {
    return mw.util.getUrl( expectedBase + '/' + pageName + '/html' );
  }
  function getVirtualSubPath() {
    var p = expectedBase  + '/';
    var a = expectedBaseA + '/';
    if ( thisPage.startsWith(p) ) return thisPage.slice( p.length );
    if ( thisPage.startsWith(a) ) return thisPage.slice( a.length );
    return null;
  }
  function isHtmlPreviewPath( sub ) {
    return sub && ( sub.endsWith('/html') || sub.endsWith('%2Fhtml') );
  }
  function setH1( text ) {
    var h1 = document.querySelector( '#firstHeading, h1.firstHeading' );
    if ( h1 ) h1.textContent = text;
  }
  function setContent( html ) {
    var el = document.getElementById( 'mw-content-text' );
    if ( el ) el.innerHTML = html;
  }
  function appendToContent( node ) {
    var el = document.getElementById( 'mw-content-text' );
    if ( el ) { el.innerHTML = ''; el.appendChild( node ); }
  }
  function loadingHTML( msg ) {
    return '<div id="mp-loading">// ' + esc( msg || 'ĐANG TẢI…' ) + '</div>';
  }
  function goBackToList() {
    history.pushState( {}, '', mw.util.getUrl( expectedBase ) );
    setContent( loadingHTML('Đang tải danh sách...') );
    loadAllPending( function (items) {
      renderList( items );
      setH1( 'Hàng chờ kiểm duyệt — ' + pageOwner );
    } );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DATA — dùng formatversion:2 nhất quán với Censor
  // ══════════════════════════════════════════════════════════════════════════
  function loadAllPending( cb ) {
    api.get( {
      action:        'query',
      titles:        'MediaWiki:Maple-Pending.json',
      prop:          'revisions',
      rvprop:        'content',
      rvslots:       'main',
      formatversion: 2,
    } ).then( function ( data ) {
      var pages = data && data.query && data.query.pages;
      if ( !pages || !pages.length ) return cb( [] );
      var page = pages[0];
      if ( page.missing ) return cb( [] );
      var rev = page.revisions && page.revisions[0];
      if ( !rev ) return cb( [] );
      // formatversion:2: slots.main.content; fallback rev['*']
      var raw = ( rev.slots && rev.slots.main && rev.slots.main.content )
        || rev['*'] || rev.content || '[]';
      var list;
      try { list = JSON.parse( raw ); } catch (e) { list = []; }
      if ( !Array.isArray(list) ) list = [];
      cb( list.filter( function (x) { return x.author === pageOwner; } ) );
    } ).fail( function () { cb( [] ); } );
  }

  function findItem( list, pageName ) {
    var norm = ( pageName || '' ).replace( / /g, '_' );
    return list.find( function (x) {
      return ( x.page_name || '' ).replace( / /g, '_' ) === norm;
    } ) || null;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: DANH SÁCH
  // ══════════════════════════════════════════════════════════════════════════
  function buildCard( item ) {
    var status   = item.status || 'pending';
    var score    = parseFloat( item.risk_score || 0 );
    var scorePct = Math.round( score * 100 );
    var color    = scoreColor( score );

    var noteHtml = '';
    if ( status === 'approved' && item.approved_by ) {
      noteHtml = '<div class="mp-card-note"><b>Duyệt bởi:</b> ' + esc(item.approved_by)
        + ( item.approved_at ? ' &nbsp;·&nbsp; ' + relTime(item.approved_at) : '' ) + '</div>';
    } else if ( status === 'rejected' && item.rejected_by ) {
      noteHtml = '<div class="mp-card-note"><b>Từ chối bởi:</b> ' + esc(item.rejected_by)
        + ( item.rejected_at ? ' &nbsp;·&nbsp; ' + relTime(item.rejected_at) : '' )
        + ( item.reason ? '<br><b>Lý do:</b> ' + esc(item.reason) : '' ) + '</div>';
    } else if ( status === 'pending' && item.note ) {
      noteHtml = '<div class="mp-card-note"><b>Ghi chú:</b> ' + esc(item.note) + '</div>';
    }

    return [
      '<div class="mp-card ' + status + '" data-pagename="' + esc(item.page_name||'') + '" tabindex="0">',
      '  <div class="mp-card-top">',
      '    <div style="flex:1;min-width:0;">',
      '      <div class="mp-card-title">',
      '        ' + esc( item.page_title || item.page_name || '—' ),
      '        <span class="mp-pill ' + status + '">' + statusLabel(status) + '</span>',
      '      </div>',
      '      <div class="mp-card-meta">',
      '        <span>Gửi ' + relTime(item.submitted_at) + '</span>',
      '        <span style="color:var(--mp-dim)">·</span>',
      '        <span style="font-size:8px;color:var(--mp-dim);">' + esc(item.id||'') + '</span>',
      '      </div>',
      '      <div class="mp-score-wrap">',
      '        <div class="mp-score-lbl">Rủi ro: ' + scorePct + '%</div>',
      '        <div class="mp-score-bar"><div class="mp-score-fill" style="width:' + scorePct + '%;background:' + color + '"></div></div>',
      '      </div>',
      noteHtml,
      '    </div>',
      '  </div>',
      '</div>',
    ].join( '' );
  }

  function renderList( items ) {
    var pending  = items.filter( function (x) { return x.status === 'pending';  } );
    var approved = items.filter( function (x) { return x.status === 'approved'; } );
    var rejected = items.filter( function (x) { return x.status === 'rejected'; } );

    var wrap    = document.createElement( 'div' );
    wrap.id     = 'mp-wrap';
    wrap.innerHTML = [
      '<div id="mp-header">',
      '  <div id="mp-header-icon">📋</div>',
      '  <div id="mp-header-text">',
      '    <h1>Hàng chờ kiểm duyệt</h1>',
      '    <p>Bài viết của <strong>' + esc(pageOwner) + '</strong> đang chờ admin xem xét</p>',
      '  </div>',
      '  <button id="mp-sync-btn">⟳ Làm mới</button>',
      '</div>',

      '<div id="mp-stats">',
      statCell( 'ĐANG CHỜ',    pending.length,  'pending',  'var(--mp-amber)' ),
      statCell( 'ĐÃ DUYỆT',   approved.length, 'approved', 'var(--mp-green)' ),
      statCell( 'KHÔNG DUYỆT',rejected.length, 'rejected', 'var(--mp-red)'   ),
      '</div>',

      '<div id="mp-tabs">',
      tabBtn( 'pending',  'ĐANG CHỜ',    pending.length,  true  ),
      tabBtn( 'approved', 'ĐÃ DUYỆT',   approved.length, false ),
      tabBtn( 'rejected', 'KHÔNG DUYỆT',rejected.length, false ),
      '</div>',

      panel( 'pending',  pending.length  === 0 ? emptyMsg('✨','Không có bài nào đang chờ')   : pending.map(buildCard).join(''),  true  ),
      panel( 'approved', approved.length === 0 ? emptyMsg('📭','Chưa có bài nào được duyệt') : approved.map(buildCard).join(''), false ),
      panel( 'rejected', rejected.length === 0 ? emptyMsg('🗂️','Không có bài nào bị từ chối') : rejected.map(buildCard).join(''), false ),
    ].join( '' );

    appendToContent( wrap );
    document.title = 'Hàng chờ kiểm duyệt — ' + pageOwner;

    // Tab switching
    wrap.querySelectorAll( '.mp-tab' ).forEach( function (tab) {
      tab.addEventListener( 'click', function () {
        wrap.querySelectorAll( '.mp-tab' ).forEach( function (t) { t.classList.remove('active'); } );
        wrap.querySelectorAll( '.mp-panel' ).forEach( function (p) { p.classList.remove('active'); } );
        tab.classList.add('active');
        var panelEl = document.getElementById( 'mp-panel-' + tab.dataset.panel );
        if ( panelEl ) panelEl.classList.add('active');
      } );
    } );

    // Click card → detail
    wrap.addEventListener( 'click', function (e) {
      var card = e.target.closest( '.mp-card[data-pagename]' );
      if ( !card ) return;
      var pageName = card.getAttribute( 'data-pagename' );
      var item = items.find( function (x) { return x.page_name === pageName; } );
      history.pushState( { mpPageName: pageName }, '', detailUrl(pageName) );
      showDetail( item || { page_name: pageName } );
    } );

    document.getElementById( 'mp-sync-btn' ).addEventListener( 'click', function () {
      setContent( loadingHTML('Đang tải...') );
      loadAllPending( renderList );
    } );
  }

  function statCell( lbl, val, cls, color ) {
    return '<div class="mp-stat ' + cls + '">'
      + '<div class="mp-stat-bar" style="background:' + color + '33;"></div>'
      + '<div class="mp-stat-num">' + val + '</div>'
      + '<div class="mp-stat-lbl">' + lbl + '</div>'
      + '</div>';
  }
  function tabBtn( key, lbl, count, active ) {
    return '<button class="mp-tab tab-' + key + ( active ? ' active' : '' ) + '" data-panel="' + key + '">'
      + lbl + '<span class="mp-badge">' + count + '</span></button>';
  }
  function panel( key, html, active ) {
    return '<div class="mp-panel' + ( active ? ' active' : '' ) + '" id="mp-panel-' + key + '">' + html + '</div>';
  }
  function emptyMsg( icon, msg ) {
    return '<div class="mp-empty"><div style="font-size:28px;margin-bottom:10px;">' + icon + '</div>' + esc(msg) + '</div>';
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: CHI TIẾT
  // ══════════════════════════════════════════════════════════════════════════
  function showDetail( item ) {
    var status   = item.status || 'pending';
    var mr       = item.mod_result || {};
    var score    = parseFloat( item.risk_score || 0 );
    var scorePct = Math.round( score * 100 );
    var sColor   = scoreColor( score );
    var hasAI    = !!item.mod_result;

    var bannerMap = {
      pending:  { icon: '⏳', text: 'Bài viết đang trong hàng chờ — admin chưa xem xét.' },
      approved: { icon: '✅', text: 'Bài viết đã được duyệt và xuất bản.' },
      rejected: { icon: '❌', text: 'Bài viết bị từ chối. Xem tab Bình luận để biết lý do.' },
    };
    var banner = bannerMap[status] || bannerMap.pending;

    // Flags HTML
    var flagsHtml = ( mr.flags || [] ).map( function (f) {
      var sev = f.severity || 'low';
      var cls = sev === 'high' ? 'mp-badge-red' : sev === 'medium' ? 'mp-badge-amber' : 'mp-badge-gray';
      return '<div class="mp-flag-item">'
        + '<span class="mp-badge-sm ' + cls + '" style="flex-shrink:0;">' + esc(sev.toUpperCase()) + '</span>'
        + '<div><div class="mp-flag-type">' + esc(f.type) + '</div>'
        + '<div class="mp-flag-msg">' + esc(f.msg) + '</div></div>'
        + '</div>';
    } ).join( '' );

    var createdBanner = '';
    if ( status === 'approved' && item.page_name ) {
      createdBanner = '<div class="mp-created-banner"><span>🎉</span><span>Đã tạo trang: <strong>' + esc(item.page_name) + '</strong></span></div>';
    }

    var detail = document.createElement( 'div' );
    detail.id  = 'mp-detail';
    detail.innerHTML = [
      '<div id="mp-breadcrumb">',
      '  <span class="bc-link" data-back="list">📋 Hàng chờ</span>',
      '  <span class="bc-sep">›</span>',
      '  <span>' + esc( item.page_title || item.page_name || '—' ) + '</span>',
      '</div>',

      '<button id="mp-back-btn" data-back="list">← Quay lại hàng chờ</button>',

      createdBanner,

      '<div class="mp-banner ' + status + '">',
      '  <span style="font-size:16px;">' + banner.icon + '</span>',
      '  <span>' + banner.text + '</span>',
      '</div>',

      /* Reject reason (chỉ hiện khi rejected + có reason) */
      ( status === 'rejected' && item.reason
        ? '<div style="background:rgba(239,68,68,.05);border:1px solid rgba(239,68,68,.2);padding:12px 18px;margin-bottom:14px;font-size:10px;color:var(--mp-red);"><b>Lý do:</b> ' + esc(item.reason) + '</div>'
        : '' ),

      '<div id="mp-det-header">',
      '  <div id="mp-det-title">' + esc( (item.page_title || item.page_name || '—').toUpperCase() ) + '</div>',
      '  <div class="mp-det-grid">',
      metaField( 'ID Yêu cầu', '<span style="font-size:9px;color:var(--mp-muted);">' + esc(item.id||'—') + '</span>' ),
      metaField( 'Tác giả',    esc(item.author||'—') ),
      metaField( 'Thời gian gửi', fmtDate(item.submitted_at) ),
      metaField( 'Namespace',  esc(String(item.namespace!==undefined?item.namespace:'—')) ),
      metaField( 'Điểm rủi ro', '<span style="color:' + sColor + ';">' + scorePct + '%</span>' ),
      metaField( 'Phân tích AI',
        hasAI
          ? '<span class="mp-badge-sm mp-badge-green">ĐÃ PHÂN TÍCH</span>'
          : '<span class="mp-badge-sm mp-badge-purple">CHƯA CÓ</span>' ),
      '  </div>',
      '  <div class="mp-score-row">',
      '    <span class="mp-score-lbl">Mức rủi ro</span>',
      '    <div class="mp-score-track"><div class="mp-score-fill" style="width:' + scorePct + '%;background:' + sColor + '"></div></div>',
      '    <span class="mp-score-num" style="color:' + sColor + '">' + scorePct + '%</span>',
      '  </div>',
      '</div>',

      /* AI summary */
      ( mr.summary
        ? '<div style="background:var(--mp-surface);border:1px solid var(--mp-border);padding:14px 20px;margin-bottom:14px;font-size:10.5px;color:var(--mp-text);line-height:1.75;">'
          + '<div style="font-size:7.5px;letter-spacing:.25em;text-transform:uppercase;color:var(--mp-muted);margin-bottom:7px;">Nhận xét AI</div>'
          + esc(mr.summary) + '</div>'
        : '' ),

      /* Tabs */
      '<div id="mp-det-tabs">',
      '  <button class="mp-dtab active" data-dpanel="content">📄 NỘI DUNG</button>',
      '  <button class="mp-dtab tab-comments" data-dpanel="comments">💬 BÌNH LUẬN<span class="mp-badge" id="mp-cmt-badge">…</span></button>',
      '  <button class="mp-dtab" data-dpanel="preview">🌐 XEM TRƯỚC</button>',
      '</div>',

      /* Panel: Nội dung */
      '<div class="mp-dpanel active" id="mp-dpanel-content">',
      '  <div class="mp-content-box">',
      '    <div class="mp-content-box-hd">📄 NỘI DUNG BÀI VIẾT (WIKITEXT)</div>',
      '    <div class="mp-content-body">' + esc( item.content || '(Không có nội dung)' ) + '</div>',
      '  </div>',
      ( flagsHtml
        ? '<div class="mp-flags-box"><div class="mp-flags-title">// CỜ PHÁT HIỆN BỞI AI</div>' + flagsHtml + '</div>'
        : '' ),
      '</div>',

      /* Panel: Bình luận — MAPLEComments sẽ fill */
      '<div class="mp-dpanel" id="mp-dpanel-comments"></div>',

      /* Panel: Xem trước */
      '<div class="mp-dpanel" id="mp-dpanel-preview">',
      '  <div style="padding:14px 0 10px;font-size:10px;color:var(--mp-muted);">Render nội dung như Wikipedia — không có UI MAPLE.</div>',
      '  <div class="mp-preview-box">',
      '    <div class="mp-preview-toolbar"><span>🌐</span><div class="mp-preview-url">' + esc(item.page_title||item.page_name||'') + '</div></div>',
      '    <iframe class="mp-preview-iframe" id="mp-preview-iframe" sandbox="allow-same-origin allow-scripts"></iframe>',
      '  </div>',
      '</div>',

    ].join( '' );

    appendToContent( detail );
    setH1( item.page_title || item.page_name || '' );
    document.title = ( item.page_title || item.page_name || '' ) + ' — Chi tiết duyệt';

    // ── Khởi tạo MAPLEComments ─────────────────────────────────────────────
    var cmtContainer = document.getElementById( 'mp-dpanel-comments' );
    var cmtInstance  = null;
    if ( cmtContainer && item.id ) {
      cmtInstance = new window.MAPLEComments( {
        api:           api,
        requestId:     item.id,
        item:          item,
        container:     cmtContainer,
        currentUser:   currentUser,
        currentRoles:  groups,
        theme:         'dark',
        readOnly:      false,
        onCountChange: function (n) {
          var badge = document.getElementById( 'mp-cmt-badge' );
          if ( badge ) badge.textContent = n;
        },
      } );
    }
// ── Cho phép tác giả sửa nội dung ──────────────────────────────────
attachEditFeature(item);   // ← THÊM DÒNG NÀY
    // ── Tab switching ──────────────────────────────────────────────────────
    detail.querySelectorAll( '.mp-dtab' ).forEach( function (tab) {
      tab.addEventListener( 'click', function () {
        detail.querySelectorAll( '.mp-dtab' ).forEach( function (t) { t.classList.remove('active'); } );
        detail.querySelectorAll( '.mp-dpanel' ).forEach( function (p) { p.classList.remove('active'); } );
        tab.classList.add('active');
        var panelEl = document.getElementById( 'mp-dpanel-' + tab.dataset.dpanel );
        if ( panelEl ) panelEl.classList.add('active');

        // Lazy-load comments khi tab đầu tiên mở
        if ( tab.dataset.dpanel === 'comments' && cmtInstance && !panelEl.dataset.loaded ) {
          panelEl.dataset.loaded = '1';
          cmtInstance.init();
        }
        // Preview iframe
        if ( tab.dataset.dpanel === 'preview' ) {
          renderPreviewIframe( item );
        }
      } );
    } );

    // ── Quay lại ───────────────────────────────────────────────────────────
    detail.querySelectorAll( '[data-back]' ).forEach( function (el) {
      el.addEventListener( 'click', goBackToList );
    } );
  }

  function metaField( key, valHtml ) {
    return '<div class="mp-det-field"><span class="mp-det-key">' + esc(key) + '</span>'
      + '<span class="mp-det-val">' + valHtml + '</span></div>';
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PREVIEW IFRAME
  // ══════════════════════════════════════════════════════════════════════════
  function renderPreviewIframe( item ) {
    var iframe = document.getElementById( 'mp-preview-iframe' );
    if ( !iframe ) return;
    var iDoc = iframe.contentDocument || ( iframe.contentWindow && iframe.contentWindow.document );
    if ( !iDoc ) return;
    iDoc.open();
    iDoc.write( buildWikiHTML( item.page_title || item.page_name || '', item.content || '' ) );
    iDoc.close();
    iframe.onload = function () {
      try {
        var h = iframe.contentDocument.body.scrollHeight;
        iframe.style.minHeight = Math.max( h + 32, 400 ) + 'px';
      } catch (e) {}
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TRANG /html — Wikipedia-style, không có UI MAPLE
  // ══════════════════════════════════════════════════════════════════════════
  function showHtmlPreview( item ) {
    var title = item.page_title || item.page_name || '—';
    // Ẩn chrome MediaWiki
    [ '#mw-navigation','#mw-head','#mw-panel','#footer','#p-logo',
      '#mw-head-base','#mw-page-base','.mw-indicators','#p-views','#p-cactions'
    ].forEach( function (sel) {
      var el = document.querySelector( sel );
      if ( el ) el.style.display = 'none';
    } );
    [ 'mp-pending-styles','maple-comments-styles' ].forEach( function (id) {
      var el = document.getElementById(id); if (el) el.remove();
    } );
    document.body.style.background = '#fff';
    var wikiStyle = document.createElement('style');
    wikiStyle.id  = 'mp-wiki-style';
    wikiStyle.textContent = [
      'body{background:#fff!important;}',
      '#content,#mw-content-container{margin:0!important;padding:0!important;border:none!important;background:#fff!important;}',
      '#mw-content-text{max-width:960px;margin:32px auto;padding:0 24px;font-family:"Linux Libertine","Georgia","Times New Roman",serif;font-size:14px;line-height:1.75;color:#202122;}',
      '#firstHeading{display:none!important;}',
      '#mp-wiki-h1{font-size:1.95em;border-bottom:1px solid #a2a9b1;padding-bottom:.2em;font-weight:normal;margin:.5em 0 .3em;font-family:"Linux Libertine","Georgia",serif;}',
      '#mp-wiki-body h2{font-size:1.5em;border-bottom:1px solid #a2a9b1;margin:1em 0 .3em;font-weight:normal;}',
      '#mp-wiki-body h3{font-size:1.2em;margin:.8em 0 .2em;font-weight:bold;}',
      '#mp-wiki-body a{color:#3366cc;}',
      '#mp-wiki-body p{margin:.5em 0;}',
      '#mp-wiki-body ul,#mp-wiki-body ol{margin:.3em 0 .3em 1.6em;padding:0;}',
      '#mp-wiki-body table{border-collapse:collapse;margin:.5em 0;}',
      '#mp-wiki-body td,#mp-wiki-body th{border:1px solid #a2a9b1;padding:4px 8px;vertical-align:top;}',
      '#mp-wiki-body th{background:#eaecf0;font-weight:bold;}',
      '#mp-wiki-body code{font-family:monospace;background:#f8f9fa;padding:1px 4px;}',
      '#mp-wiki-body pre{background:#f8f9fa;border:1px solid #ddd;padding:12px;overflow:auto;}',
      '#mp-wiki-body img{max-width:100%;height:auto;}',
      '#mp-wiki-body hr{border:none;border-top:1px solid #a2a9b1;margin:1em 0;}',
    ].join('');
    document.head.appendChild( wikiStyle );
    setContent(
      '<h1 id="mp-wiki-h1">' + esc(title) + '</h1>'
      + '<div id="mp-wiki-body">' + ( item.content || '' ) + '</div>'
    );
    document.title = title;
  }

  function buildWikiHTML( title, content ) {
    return [
      '<!DOCTYPE html><html lang="vi"><head>',
      '<meta charset="utf-8"><title>' + esc(title) + '</title>',
      '<style>',
      'body{font-family:"Linux Libertine","Georgia","Times",serif;max-width:860px;margin:20px auto;padding:0 16px;font-size:14px;line-height:1.75;color:#202122;background:#fff;}',
      'h1{font-size:1.95em;border-bottom:1px solid #a2a9b1;padding-bottom:.2em;font-weight:normal;}',
      'h2{font-size:1.5em;border-bottom:1px solid #a2a9b1;margin-top:1.2em;font-weight:normal;}',
      'h3{font-size:1.2em;font-weight:bold;}a{color:#3366cc;}',
      'table{border-collapse:collapse;}td,th{border:1px solid #a2a9b1;padding:4px 8px;}th{background:#eaecf0;}',
      'code{font-family:monospace;background:#f8f9fa;padding:1px 4px;}pre{background:#f8f9fa;padding:12px;overflow:auto;}',
      'img{max-width:100%;height:auto;}',
      '</style></head><body>',
      '<h1>' + esc(title) + '</h1>',
      content,
      '</body></html>',
    ].join('');
  }
// ═══════════════════════════════════════════════════════════════════════════
// EDIT: cho phép tác giả sửa nội dung khi status = pending
// ═══════════════════════════════════════════════════════════════════════════
function attachEditFeature(item) {
    // Chỉ tác giả, chỉ pending
    if (item.status !== 'pending') return;
    if (item.author !== currentUser) return;

    var contentBox  = document.getElementById('mp-content-box');
    var contentBody = document.getElementById('mp-content-body');
    var summaryBox  = document.getElementById('mp-summary-box');
    var dpanel      = document.getElementById('mp-dpanel-content');
    if (!contentBox || !contentBody || !dpanel) return;

    // Nút ✏️ Chỉnh sửa
    var editBtn = document.createElement('button');
    editBtn.id  = 'mp-edit-btn';
    editBtn.innerHTML = '✏️ Chỉnh sửa nội dung';
    dpanel.insertBefore(editBtn, summaryBox || contentBox);

    var isEditing = false;

    editBtn.addEventListener('click', function () {
        if (isEditing) return;
        isEditing = true;
        editBtn.style.display = 'none';

        // Ẩn content box hiện tại, ẩn summary
        contentBox.style.display = 'none';
        if (summaryBox) summaryBox.style.display = 'none';

        // Build editor
        var editorWrap = document.createElement('div');
        editorWrap.id  = 'mp-editor-wrap';
        editorWrap.innerHTML = [
            '<div style="font-size:10px;color:var(--mp-muted);margin-bottom:8px;',
            '     letter-spacing:.5px;">✏️ CHỈNH SỬA NỘI DUNG</div>',
            '<textarea id="mp-edit-area" spellcheck="false">' + esc(item.content || '') + '</textarea>',
            '<input id="mp-edit-summary" type="text" placeholder="Tóm tắt thay đổi (không bắt buộc)"',
            '       value="' + esc(item.summary || '') + '">',
            '<div id="mp-edit-actions">',
            '  <button class="mp-btn-save" id="mp-save-btn">💾 Lưu thay đổi</button>',
            '  <button class="mp-btn-cancel" id="mp-cancel-btn">✕ Hủy</button>',
            '</div>',
            '<div id="mp-edit-status"></div>',
        ].join('');

        dpanel.insertBefore(editorWrap, contentBox);

        // Hủy
        document.getElementById('mp-cancel-btn').addEventListener('click', function () {
            editorWrap.remove();
            editBtn.style.display = '';
            contentBox.style.display = '';
            if (summaryBox) summaryBox.style.display = '';
            isEditing = false;
        });

        // Lưu
        document.getElementById('mp-save-btn').addEventListener('click', function () {
            var saveBtn    = document.getElementById('mp-save-btn');
            var statusEl   = document.getElementById('mp-edit-status');
            var newContent = document.getElementById('mp-edit-area').value;
            var newSummary = document.getElementById('mp-edit-summary').value;

            saveBtn.disabled   = true;
            saveBtn.textContent = '⏳ Đang lưu…';
            statusEl.textContent = '';

            // 1. Đọc JSON hiện tại
            api.get({
                action: 'query',
                titles: 'MediaWiki:Maple-Pending.json',
                prop:   'revisions',
                rvprop: 'content',
                format: 'json'
            }).done(function (data) {
                var pages = data.query.pages;
                var pg    = pages[Object.keys(pages)[0]];
                var raw   = (pg.revisions && pg.revisions[0] && pg.revisions[0]['*']) || '[]';
                raw = raw.replace(/,\s*([}\]])/g, '$1');
                var list;
                try { list = JSON.parse(raw); } catch (e) { list = []; }
                if (!Array.isArray(list)) list = [];

                // 2. Tìm và cập nhật entry
                var found = false;
                list = list.map(function (x) {
                    if (x.id === item.id) {
                        found = true;
                        return Object.assign({}, x, {
                            content:     newContent,
                            summary:     newSummary,
                            edited_at:   new Date().toISOString(),
                            edited_by:   currentUser
                        });
                    }
                    return x;
                });

                if (!found) {
                    statusEl.style.color = 'var(--mp-red)';
                    statusEl.textContent = '⚠️ Không tìm thấy mục để cập nhật.';
                    saveBtn.disabled    = false;
                    saveBtn.textContent = '💾 Lưu thay đổi';
                    return;
                }

                // 3. Ghi lại
                api.postWithEditToken({
                    action:  'edit',
                    title:   'MediaWiki:Maple-Pending.json',
                    text:    JSON.stringify(list, null, 2),
                    summary: 'MAPLE: [' + currentUser + '] sửa nội dung – ' + item.id
                }).done(function () {
                    // Cập nhật item local
                    item.content = newContent;
                    item.summary = newSummary;

                    // Refresh UI
                    contentBody.textContent = newContent;
                    if (summaryBox) {
                        summaryBox.innerHTML = newSummary
                            ? '<b>TÓM TẮT CHỈNH SỬA</b>' + esc(newSummary)
                            : '';
                    }

                    editorWrap.remove();
                    editBtn.style.display = '';
                    contentBox.style.display  = '';
                    if (summaryBox) summaryBox.style.display = newSummary ? '' : 'none';
                    isEditing = false;

                    // Flash thông báo thành công
                    var toast = document.createElement('div');
                    toast.style.cssText = [
                        'position:fixed;bottom:24px;right:24px;z-index:9999;',
                        'background:#122620;border:1px solid var(--mp-green);',
                        'color:var(--mp-green);padding:10px 18px;border-radius:8px;',
                        'font-family:var(--mp-font);font-size:11px;font-weight:700;',
                        'animation:mp-in .2s ease;',
                    ].join('');
                    toast.textContent = '✅ Đã lưu thay đổi!';
                    document.body.appendChild(toast);
                    setTimeout(function () { toast.remove(); }, 3000);

                }).fail(function (err) {
                    statusEl.style.color = 'var(--mp-red)';
                    statusEl.textContent = '❌ Lỗi khi lưu: ' + (err || 'unknown');
                    saveBtn.disabled    = false;
                    saveBtn.textContent = '💾 Lưu thay đổi';
                });

            }).fail(function () {
                statusEl.style.color = 'var(--mp-red)';
                statusEl.textContent = '❌ Không đọc được dữ liệu.';
                saveBtn.disabled    = false;
                saveBtn.textContent = '💾 Lưu thay đổi';
            });
        });
    });
}
  // ══════════════════════════════════════════════════════════════════════════
  // KHỞI ĐỘNG
  // ══════════════════════════════════════════════════════════════════════════
  mw.loader.using( ['mediawiki.api','mediawiki.util'] ).done( function () {

    var styleEl = document.createElement('style');
    styleEl.id  = 'mp-pending-styles';
    styleEl.textContent = CSS;
    document.head.appendChild( styleEl );

    setH1( 'Hàng chờ kiểm duyệt — ' + pageOwner );

    // Ẩn nút edit action cho người dùng thường (không phải sysop)
    if ( !isSysop && pageOwner === currentUser ) {
      var views = document.getElementById( 'p-views' );
      if ( views ) views.style.display = 'none';
    }

    setContent( loadingHTML( 'ĐANG TẢI DANH SÁCH BÀI...' ) );

    var subPath = getVirtualSubPath();

    if ( subPath && isHtmlPreviewPath(subPath) ) {
      var realPageName = subPath.replace( /\/html$/, '' ).replace( /%2Fhtml$/, '' );
      setContent( loadingHTML('Đang tải xem trước...') );
      loadAllPending( function (list) {
        var item = findItem( list, realPageName );
        if (!item) {
          setContent('<div style="text-align:center;padding:64px;color:var(--mp-muted);font-family:var(--mp-font);">Không tìm thấy: <b>' + esc(realPageName.replace(/_/g,' ')) + '</b></div>');
          return;
        }
        showHtmlPreview(item);
      });

    } else if ( subPath ) {
      var skTitle = decodeURIComponent( subPath.replace(/_/g,' ') );
      setH1( skTitle );
      setContent( loadingHTML('Đang tải chi tiết...') );
      loadAllPending( function (list) {
        var item = findItem( list, subPath );
        if ( !item ) {
          setContent( [
            '<div style="text-align:center;padding:64px;color:var(--mp-muted);font-family:var(--mp-font);">',
            '<div style="font-size:28px;margin-bottom:12px;">🔍</div>',
            '<div>Không tìm thấy: <b style="color:var(--mp-text);">' + esc(skTitle) + '</b></div>',
            '<button onclick="history.back()" style="margin-top:14px;background:transparent;border:1px solid var(--mp-border);color:var(--mp-blue);font-family:var(--mp-font);font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:8px 16px;cursor:pointer;">← Quay lại</button>',
            '</div>',
          ].join('') );
          return;
        }
        showDetail(item);
      });

    } else {
      loadAllPending( renderList );
    }

    // Browser back/forward
    window.addEventListener( 'popstate', function () {
      var newSub = getVirtualSubPath();
      if ( !newSub ) {
        loadAllPending( function (items) {
          renderList(items);
          setH1( 'Hàng chờ kiểm duyệt — ' + pageOwner );
        });
      } else if ( isHtmlPreviewPath(newSub) ) {
        var rp = newSub.replace(/\/html$/,'');
        loadAllPending( function (list) {
          var it = findItem(list, rp);
          if (it) showHtmlPreview(it);
        });
      } else {
        loadAllPending( function (list) {
          var it = findItem(list, newSub);
          if (it) showDetail(it);
        });
      }
    });

  }); // end mw.loader.using

} )( mediaWiki, jQuery );