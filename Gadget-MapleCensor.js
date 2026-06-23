( function () {
  "use strict";

  var thisPage = mw.config.get( "wgPageName" );
  var isBase   = thisPage === "Admin:Censor";
  var isDetail = thisPage.startsWith( "Admin:Censor/" );
  if ( !isBase && !isDetail ) return;

  var rights = mw.config.get( "wgUserGroups" ) || [];
  if ( rights.indexOf( "sysop" ) === -1 && rights.indexOf( "moderator" ) === -1 ) {
    $( function () {
      document.getElementById( "mw-content-text" ).innerHTML =
        '<div style="min-height:60vh;display:flex;align-items:center;justify-content:center;' +
        'font-family:\'JetBrains Mono\',monospace;background:#050505;">' +
        '<div style="text-align:center;background:#080808;border:1px solid #1a1a1a;border-radius:12px;padding:48px 64px;">' +
        '<div style="font-size:32px;margin-bottom:16px;">🔒</div>' +
        '<div style="color:#ef4444;font-size:11px;letter-spacing:.5px;margin-bottom:8px;">TRUY CẬP BỊ TỪ CHỐI</div>' +
        '<div style="color:#6b6b78;font-size:10px;">Bạn không có quyền truy cập trang này.</div>' +
        '</div></div>';
    } );
    return;
  }

  $( function () {
    mw.loader.using( [ "mediawiki.api", "ext.MAPLEComments" ] ).then( function () {
      var api  = new mw.Api();
      var user = mw.config.get( "wgUserName" );
      var WIKI_BASE = "https://maplewikivn.miraheze.org/wiki/";

      var PAGES = {
        pending:  "MediaWiki:Maple-Pending.json",
        queue:    "MediaWiki:Maple-Queue",
        history:  "MediaWiki:Maple-UserHistory",
        archive:  "MediaWiki:Kho_Luu_Tru-data.json",
      };

      // ════════════════════════════════════════════════════════════════════
      // CSS — GitHub dark (mq- tokens)
      // ════════════════════════════════════════════════════════════════════
      var CSS = [
        "@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');",
        ":root{",
        /* ── Tone M.A.P.L.E (đỏ/đen) — accent chính = đỏ thay cho xanh GitHub ── */
        "  --mq-bg:#050505;--mq-surface:#080808;--mq-panel:#0a0a0a;",
        "  --mq-border:#1a1a1a;--mq-border2:#27272a;",
        "  --mq-text:#e4e4e7;--mq-muted:#6b6b78;--mq-dim:#27272a;",
        "  --mq-blue:#ef4444;--mq-green:#2ea043;--mq-yellow:#d29922;",
        "  --mq-red:#f85149;--mq-purple:#a371f7;--mq-cyan:#76e3ea;",
        "  --mq-font:'JetBrains Mono','Fira Code','Cascadia Code','Consolas',monospace;",
        "  --mp-bg:#050505;--mp-surface:#080808;--mp-border:#1a1a1a;",
        "  --mp-text:#e4e4e7;--mp-muted:#6b6b78;",
        "  --mp-blue:#ef4444;--mp-green:#2ea043;--mp-red:#f85149;",
        "  --mp-purple:#a371f7;--mp-cyan:#76e3ea;",
        "  --mp-font:'JetBrains Mono','Fira Code','Consolas',monospace;",
        "}",
        "#mc-root *{box-sizing:border-box;margin:0;padding:0;}",
        "#mc-root{font-family:var(--mq-font);background:var(--mq-bg);color:var(--mq-text);min-height:100vh;}",
        "#mc-inner{max-width:960px;margin:0 auto;padding:24px 24px 64px;}",

        /* ── Header ── */
        ".mc-header{display:flex;align-items:center;gap:14px;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid var(--mq-border);}",
        ".mc-header-icon{width:40px;height:40px;background:#1a0e0e;border:1px solid #7f1d1d;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}",
        ".mc-header-title{font-size:15px;font-weight:700;color:var(--mq-blue);margin-bottom:3px;letter-spacing:.5px;}",
        ".mc-header-sub{font-size:11px;color:var(--mq-muted);}",
        ".mc-header-user{margin-left:auto;display:flex;align-items:center;gap:8px;}",
        ".mc-header-user-name{font-size:10px;color:var(--mq-muted);letter-spacing:.3px;}",

        /* ── Stats ── */
        ".mc-stats{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:20px;}",
        ".mc-stat{background:var(--mq-surface);border:1px solid var(--mq-border);border-radius:8px;padding:12px 14px;text-align:center;}",
        ".mc-stat-num{font-size:22px;font-weight:700;line-height:1;}",
        ".mc-stat-lbl{font-size:9px;color:var(--mq-muted);margin-top:4px;letter-spacing:.4px;text-transform:uppercase;}",
        ".mc-stat.s-blue   .mc-stat-num{color:var(--mq-blue);}",
        ".mc-stat.s-purple .mc-stat-num{color:var(--mq-purple);}",
        ".mc-stat.s-green  .mc-stat-num{color:var(--mq-green);}",
        ".mc-stat.s-red    .mc-stat-num{color:var(--mq-red);}",
        ".mc-stat.s-muted  .mc-stat-num{color:var(--mq-muted);}",

        /* ── Toolbar ── */
        ".mc-toolbar{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap;}",
        ".mc-toolbar-left{display:flex;align-items:center;gap:8px;flex:1;}",
        ".mc-search{background:var(--mq-surface);border:1px solid var(--mq-border);color:var(--mq-text);font-family:var(--mq-font);font-size:11px;padding:6px 12px;border-radius:6px;outline:none;width:220px;transition:border-color .2s;}",
        ".mc-search:focus{border-color:var(--mq-blue);}",
        ".mc-status-text{font-size:10px;color:var(--mq-muted);}",

        /* ── Buttons ── */
        ".mc-btn{font-family:var(--mq-font);font-size:10px;font-weight:700;letter-spacing:.4px;padding:6px 16px;border-radius:6px;border:1px solid;cursor:pointer;background:transparent;transition:all .18s;display:inline-flex;align-items:center;gap:6px;}",
        ".mc-btn-ghost{color:var(--mq-muted);border-color:var(--mq-border);}",
        ".mc-btn-ghost:hover{color:var(--mq-text);border-color:var(--mq-border2);}",
        ".mc-btn-blue{color:var(--mq-blue);border-color:#7f1d1d;}",
        ".mc-btn-blue:hover{background:#1a0e0e;}",
        ".mc-btn-green{color:var(--mq-green);border-color:#196327;}",
        ".mc-btn-green:hover{background:#122620;}",
        ".mc-btn-red{color:var(--mq-red);border-color:#6e1c1c;}",
        ".mc-btn-red:hover{background:#2d0f0f;}",
        ".mc-btn-purple{color:var(--mq-purple);border-color:#4a2d7a;}",
        ".mc-btn-purple:hover{background:#1a1230;}",
        ".mc-btn-solid-green{background:#196327;color:#fff;border-color:#2ea043;}",
        ".mc-btn-solid-green:hover{background:#1a7430;}",
        ".mc-btn-solid-red{background:#6e1c1c;color:#fff;border-color:#f85149;}",
        ".mc-btn-solid-red:hover{background:#8a2020;}",
        ".mc-btn-solid-blue{background:#1a0e0e;color:var(--mq-blue);border-color:var(--mq-blue);}",
        ".mc-btn-solid-blue:hover{background:#2d0f0f;}",
        ".mc-btn-solid-purple{background:#1a1230;color:var(--mq-purple);border-color:var(--mq-purple);}",
        ".mc-btn-solid-purple:hover{background:#241a40;}",

        /* ── Tabs ── */
        ".mc-tabs{display:flex;gap:0;border-bottom:1px solid var(--mq-border);margin-bottom:16px;}",
        ".mc-tab{font-family:var(--mq-font);font-size:11px;font-weight:700;letter-spacing:.4px;padding:8px 18px;cursor:pointer;color:var(--mq-muted);border:none;border-bottom:2px solid transparent;margin-bottom:-1px;background:transparent;transition:all .18s;}",
        ".mc-tab:hover{color:var(--mq-text);}",
        ".mc-tab.active{color:var(--mq-blue);border-bottom-color:var(--mq-blue);}",
        ".mc-tab.tab-approved.active{color:var(--mq-green);border-bottom-color:var(--mq-green);}",
        ".mc-tab.tab-rejected.active{color:var(--mq-red);border-bottom-color:var(--mq-red);}",
        ".mc-tab .mc-cnt{display:inline-block;min-width:18px;padding:1px 5px;border-radius:9px;font-size:9px;margin-left:5px;background:var(--mq-border);color:var(--mq-muted);}",
        ".mc-tab.active .mc-cnt{background:#1a0e0e;color:var(--mq-blue);}",
        ".mc-tab.tab-approved.active .mc-cnt{background:#122620;color:var(--mq-green);}",
        ".mc-tab.tab-rejected.active .mc-cnt{background:#2d0f0f;color:var(--mq-red);}",
        ".mc-panel{display:none;}.mc-panel.active{display:block;}",

        /* ── Cards ── */
        ".mc-card{background:var(--mq-surface);border:1px solid var(--mq-border);border-radius:8px;padding:16px 18px;margin-bottom:8px;transition:border-color .18s;animation:mc-cardin .22s ease;position:relative;}",
        "@keyframes mc-cardin{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}",
        ".mc-card:hover{border-color:var(--mq-border2);}",
        ".mc-card.pri-high{border-left:3px solid var(--mq-red);}",
        ".mc-card.pri-low{border-left:3px solid var(--mq-border2);}",
        ".mc-card.pri-noai{border-left:3px solid var(--mq-purple);}",
        ".mc-card.pri-approved{border-left:3px solid var(--mq-green);}",
        ".mc-card.pri-rejected{border-left:3px solid var(--mq-red);}",
        ".mc-card-top{display:flex;align-items:flex-start;gap:10px;}",
        ".mc-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px;}",
        ".mc-dot.d-yellow{background:var(--mq-yellow);}",
        ".mc-dot.d-green{background:var(--mq-green);}",
        ".mc-dot.d-red{background:var(--mq-red);}",
        ".mc-dot.d-purple{background:var(--mq-purple);}",
        ".mc-card-main{flex:1;min-width:0;}",
        ".mc-card-title{font-size:13px;font-weight:700;color:var(--mq-text);margin-bottom:4px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}",
        ".mc-card-title a{color:var(--mq-text);text-decoration:none;}",
        ".mc-card-title a:hover{color:var(--mq-blue);}",
        ".mc-card-meta{font-size:10px;color:var(--mq-muted);display:flex;gap:10px;flex-wrap:wrap;align-items:center;}",
        ".mc-card-meta a{color:var(--mq-blue);text-decoration:none;font-size:10px;}",
        ".mc-card-meta a:hover{text-decoration:underline;}",
        ".mc-card-preview{margin-top:8px;font-size:10px;color:#6b6b78;background:#000;border:1px solid var(--mq-border);border-radius:4px;padding:7px 12px;max-height:44px;overflow:hidden;line-height:1.6;position:relative;}",
        ".mc-card-preview::after{content:'';position:absolute;bottom:0;left:0;right:0;height:16px;background:linear-gradient(transparent,#000);}",
        ".mc-card-tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px;}",
        ".mc-card-actions{display:flex;flex-direction:column;gap:4px;flex-shrink:0;padding-left:10px;}",

        /* ── Pills / badges ── */
        ".mc-pill{display:inline-flex;align-items:center;padding:2px 8px;border-radius:10px;font-size:9px;font-weight:700;letter-spacing:.4px;border:1px solid;}",
        ".mc-pill.p-yellow{background:#2d2108;color:var(--mq-yellow);border-color:#6e5409;}",
        ".mc-pill.p-green{background:#122620;color:var(--mq-green);border-color:#196327;}",
        ".mc-pill.p-red{background:#2d0f0f;color:var(--mq-red);border-color:#6e1c1c;}",
        ".mc-pill.p-purple{background:#1a1230;color:var(--mq-purple);border-color:#4a2d7a;}",
        ".mc-pill.p-blue{background:#1a0e0e;color:var(--mq-blue);border-color:#7f1d1d;}",
        ".mc-pill.p-gray{background:var(--mq-panel);color:var(--mq-muted);border-color:var(--mq-border);}",
        ".mc-tag-item{font-size:9px;color:var(--mq-muted);border:1px solid var(--mq-border);border-radius:4px;padding:2px 7px;background:rgba(255,255,255,.015);}",

        /* ── Score bar ── */
        ".mc-score-row{display:flex;align-items:center;gap:8px;margin-top:8px;}",
        ".mc-score-lbl{font-size:9px;color:var(--mq-muted);flex-shrink:0;width:60px;}",
        ".mc-score-track{flex:1;height:3px;background:var(--mq-border);border-radius:2px;overflow:hidden;}",
        ".mc-score-fill{height:100%;border-radius:2px;transition:width .4s;}",
        ".mc-score-num{font-size:10px;font-weight:700;flex-shrink:0;min-width:36px;text-align:right;}",

        /* ── Empty ── */
        ".mc-empty{text-align:center;padding:56px 24px;color:var(--mq-muted);font-size:11px;border:1px solid var(--mq-border);border-radius:8px;}",
        ".mc-empty-icon{font-size:28px;margin-bottom:10px;}",

        /* ── AI Overlay ── */
        "#mc-ai-overlay{position:fixed;inset:0;z-index:9000;display:none;background:rgba(10,14,20,.97);align-items:center;justify-content:center;}",
        "#mc-ai-overlay.open{display:flex;}",
        ".mc-ai-inner{display:flex;flex-direction:column;align-items:center;gap:20px;width:380px;}",
        ".mc-ai-title{font-size:13px;font-weight:700;color:var(--mq-text);letter-spacing:.5px;}",
        ".mc-ai-spinner{width:24px;height:24px;border:2px solid var(--mq-border);border-top-color:var(--mq-blue);border-radius:50%;animation:mc-spin .8s linear infinite;}",
        "@keyframes mc-spin{to{transform:rotate(360deg)}}",
        ".mc-ai-log{width:100%;background:var(--mq-surface);border:1px solid var(--mq-border);border-radius:8px;overflow:hidden;}",
        ".mc-ai-log-hd{padding:7px 14px;border-bottom:1px solid var(--mq-border);font-size:9px;letter-spacing:.3px;color:var(--mq-muted);background:var(--mq-panel);}",
        ".mc-ai-log-body{padding:10px 14px;max-height:140px;overflow-y:auto;display:flex;flex-direction:column;gap:3px;}",
        ".mc-ai-log-line{font-size:10px;color:var(--mq-muted);display:flex;gap:10px;animation:mc-fade .18s ease;}",
        "@keyframes mc-fade{from{opacity:0}to{opacity:1}}",
        ".mc-ai-log-time{color:var(--mq-dim);flex-shrink:0;}",
        ".mc-ai-log-ok .mc-ai-log-msg{color:var(--mq-green);}",
        ".mc-ai-log-err .mc-ai-log-msg{color:var(--mq-red);}",

        /* ── Detail page ── */
        "#mc-breadcrumb{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--mq-muted);margin-bottom:16px;}",
        "#mc-breadcrumb a{color:var(--mq-blue);text-decoration:none;}",
        "#mc-breadcrumb a:hover{text-decoration:underline;}",
        "#mc-breadcrumb .bc-sep{color:var(--mq-border);}",
        ".mc-det-header{background:var(--mq-surface);border:1px solid var(--mq-border);border-radius:10px;padding:22px 26px;margin-bottom:14px;}",
        ".mc-det-header h2{font-size:17px;font-weight:700;color:var(--mq-text);margin-bottom:14px;}",
        ".mc-det-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}",
        ".mc-det-field{display:flex;flex-direction:column;gap:3px;}",
        ".mc-det-key{font-size:8.5px;letter-spacing:.4px;text-transform:uppercase;color:var(--mq-muted);}",
        ".mc-det-val{font-size:11.5px;color:var(--mq-text);}",
        ".mc-det-tabs{display:flex;gap:0;border-bottom:1px solid var(--mq-border);margin-bottom:16px;}",
        ".mc-dtab{font-family:var(--mq-font);font-size:10px;font-weight:700;letter-spacing:.4px;padding:8px 16px;cursor:pointer;color:var(--mq-muted);border:none;border-bottom:2px solid transparent;margin-bottom:-1px;background:transparent;transition:all .18s;}",
        ".mc-dtab:hover{color:var(--mq-text);}",
        ".mc-dtab.active{color:var(--mq-blue);border-bottom-color:var(--mq-blue);}",
        ".mc-dtab.dtab-comments.active{color:var(--mq-cyan);border-bottom-color:var(--mq-cyan);}",
        ".mc-dtab.dtab-manual.active{color:var(--mq-purple);border-bottom-color:var(--mq-purple);}",
        ".mc-dtab .mc-badge{display:inline-block;min-width:16px;padding:1px 4px;border-radius:8px;font-size:9px;margin-left:5px;background:var(--mq-border);color:var(--mq-muted);}",
        ".mc-dtab.active .mc-badge{background:#1a0e0e;color:var(--mq-blue);}",
        ".mc-dtab.dtab-comments.active .mc-badge{background:#0e1a20;color:var(--mq-cyan);}",
        ".mc-dpanel{display:none;}.mc-dpanel.active{display:block;}",
        ".mc-content-box{background:var(--mq-surface);border:1px solid var(--mq-border);border-radius:8px;overflow:hidden;margin-bottom:14px;}",
        ".mc-content-box-hd{padding:10px 16px;border-bottom:1px solid var(--mq-border);font-size:9px;font-weight:700;color:var(--mq-muted);letter-spacing:.4px;display:flex;align-items:center;justify-content:space-between;background:var(--mq-panel);}",
        ".mc-content-body{padding:18px 22px;font-size:12px;color:var(--mq-text);line-height:1.75;white-space:pre-wrap;word-break:break-word;}",
        ".mc-content-rendered{padding:18px 22px;font-size:13px;line-height:1.8;color:var(--mq-text);}",
        ".mc-render-toggle{display:flex;gap:4px;}",
        ".mc-tog{font-family:var(--mq-font);font-size:8.5px;font-weight:700;letter-spacing:.3px;border:1px solid var(--mq-border);padding:3px 10px;cursor:pointer;background:transparent;color:var(--mq-muted);border-radius:4px;transition:all .15s;}",
        ".mc-tog.active{background:#1a0e0e;color:var(--mq-blue);border-color:#7f1d1d;}",
        ".mc-flags-box{background:var(--mq-surface);border:1px solid var(--mq-border);border-radius:8px;padding:16px 20px;margin-bottom:14px;}",
        ".mc-flags-hd{font-size:9px;letter-spacing:.3px;text-transform:uppercase;color:var(--mq-muted);margin-bottom:12px;}",
        ".mc-flag-item{display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-bottom:1px solid var(--mq-border);}",
        ".mc-flag-item:last-child{border-bottom:none;}",
        ".mc-flag-type{font-size:11px;color:var(--mq-text);font-weight:700;}",
        ".mc-flag-msg{font-size:10px;color:var(--mq-muted);margin-top:2px;}",
        ".mc-banner{border-radius:8px;padding:11px 16px;margin-bottom:14px;display:flex;align-items:center;gap:10px;font-size:11px;font-weight:700;}",
        ".mc-banner.b-pending{background:#2d2108;border:1px solid #6e5409;color:var(--mq-yellow);}",
        ".mc-banner.b-approved{background:#122620;border:1px solid #196327;color:var(--mq-green);}",
        ".mc-banner.b-rejected{background:#2d0f0f;border:1px solid #6e1c1c;color:var(--mq-red);}",
        ".mc-banner.b-noai{background:#1a1230;border:1px solid #4a2d7a;color:var(--mq-purple);}",
        ".mc-det-actions{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;align-items:center;}",
        ".mc-ai-summary{background:var(--mq-surface);border:1px solid var(--mq-border);border-radius:8px;padding:14px 18px;margin-bottom:14px;font-size:11.5px;color:var(--mq-text);line-height:1.7;}",
        ".mc-ai-summary-hd{font-size:9px;letter-spacing:.3px;text-transform:uppercase;color:var(--mq-muted);margin-bottom:8px;}",

        /* ── Manual panel ── */
        ".mc-manual-notice{background:#1a1230;border:1px solid #4a2d7a;border-radius:8px;padding:12px 16px;margin-bottom:14px;font-size:10px;color:var(--mq-purple);line-height:1.6;}",
        ".mc-manual-section{background:var(--mq-surface);border:1px solid var(--mq-border);border-radius:8px;overflow:hidden;margin-bottom:12px;}",
        ".mc-manual-section-hd{padding:9px 16px;border-bottom:1px solid var(--mq-border);font-size:9px;font-weight:700;letter-spacing:.3px;color:var(--mq-muted);background:var(--mq-panel);display:flex;align-items:center;justify-content:space-between;}",
        ".mc-manual-section-body{padding:16px 20px;}",
        ".mc-manual-field{margin-bottom:12px;}",
        ".mc-manual-label{display:block;font-size:9px;letter-spacing:.3px;text-transform:uppercase;color:var(--mq-muted);margin-bottom:6px;}",
        ".mc-manual-label span{color:var(--mq-red);}",
        ".mc-manual-input,.mc-manual-select,.mc-manual-textarea{width:100%;background:#0a0a0a;border:1px solid var(--mq-border);color:var(--mq-text);font-family:var(--mq-font);font-size:11px;padding:8px 12px;border-radius:6px;outline:none;transition:border-color .18s;}",
        ".mc-manual-input:focus,.mc-manual-select:focus,.mc-manual-textarea:focus{border-color:var(--mq-purple);}",
        ".mc-manual-textarea{resize:vertical;min-height:180px;line-height:1.65;}",
        ".mc-manual-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}",
        ".mc-manual-score-row{display:flex;align-items:center;gap:10px;}",
        ".mc-manual-flag-row{display:flex;gap:6px;margin-bottom:6px;align-items:center;}",
        ".mc-manual-flag-rm{background:transparent;border:1px solid var(--mq-border);color:var(--mq-red);border-radius:4px;font-family:var(--mq-font);font-size:10px;padding:5px 9px;cursor:pointer;transition:all .15s;}",
        ".mc-manual-flag-rm:hover{background:#2d0f0f;}",
        ".mc-manual-save-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:12px;border-top:1px solid var(--mq-border);}",
        ".mc-manual-save-info{font-size:9.5px;color:var(--mq-muted);}",

        /* ── Modal ── */
        ".mc-modal-overlay{position:fixed;inset:0;z-index:8000;background:rgba(0,0,0,.82);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .22s;}",
        ".mc-modal-overlay.mc-modal-vis{opacity:1;}",
        ".mc-modal{background:var(--mq-surface);border:1px solid var(--mq-border);border-radius:12px;width:min(580px,96vw);max-height:90vh;overflow-y:auto;transform:translateY(16px) scale(.97);transition:transform .26s cubic-bezier(.22,1,.36,1);}",
        ".mc-modal-overlay.mc-modal-vis .mc-modal{transform:none;}",
        ".mc-modal-hd{padding:20px 24px 16px;border-bottom:1px solid var(--mq-border);background:var(--mq-panel);border-radius:12px 12px 0 0;display:flex;align-items:flex-start;justify-content:space-between;}",
        ".mc-modal-hd h2{font-size:14px;font-weight:700;color:var(--mq-text);}",
        ".mc-modal-hd p{font-size:10px;color:var(--mq-muted);margin-top:3px;}",
        ".mc-modal-close{background:transparent;border:1px solid var(--mq-border);color:var(--mq-muted);width:30px;height:30px;border-radius:6px;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;transition:all .15s;}",
        ".mc-modal-close:hover{border-color:#6e1c1c;color:var(--mq-red);}",
        ".mc-modal-body{padding:20px 24px;}",
        ".mc-modal-ft{padding:14px 24px;border-top:1px solid var(--mq-border);display:flex;justify-content:flex-end;gap:8px;background:var(--mq-panel);border-radius:0 0 12px 12px;}",
        ".mc-field{margin-bottom:16px;}",
        ".mc-label{display:block;font-size:9px;letter-spacing:.3px;text-transform:uppercase;color:var(--mq-muted);margin-bottom:6px;}",
        ".mc-label span{color:var(--mq-red);}",
        ".mc-input,.mc-textarea,.mc-select{width:100%;background:#0a0a0a;border:1px solid var(--mq-border);color:var(--mq-text);font-family:var(--mq-font);font-size:11px;padding:8px 12px;border-radius:6px;outline:none;transition:border-color .18s;}",
        ".mc-input:focus,.mc-textarea:focus,.mc-select:focus{border-color:var(--mq-blue);}",
        ".mc-textarea{resize:vertical;min-height:90px;line-height:1.6;}",
        ".mc-form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}",
        ".mc-preset-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-bottom:14px;}",
        ".mc-preset-btn{font-family:var(--mq-font);font-size:9px;font-weight:700;letter-spacing:.3px;border:1px solid var(--mq-border);padding:9px 12px;cursor:pointer;background:rgba(255,255,255,.015);color:var(--mq-muted);border-radius:6px;transition:all .15s;text-align:left;line-height:1.4;}",
        ".mc-preset-btn:hover{border-color:var(--mq-border2);color:var(--mq-text);}",
        ".mc-preset-btn.active{border-color:var(--mq-blue);color:var(--mq-blue);background:#1a0e0e;}",
        ".mc-preset-btn-green.active{border-color:var(--mq-green);color:var(--mq-green);background:#122620;}",
        ".mc-preset-btn-green:hover{border-color:#196327;color:var(--mq-green);}",
        ".mc-preset-icon{font-size:13px;display:block;margin-bottom:3px;}",
        ".mc-preset-name{display:block;font-size:9px;margin-bottom:1px;}",
        ".mc-preset-desc{display:block;font-size:8px;color:var(--mq-muted);font-weight:400;text-transform:none;letter-spacing:0;}",
        ".mc-divider{font-size:8.5px;letter-spacing:.3px;text-transform:uppercase;color:var(--mq-muted);margin:12px 0 8px;padding-bottom:6px;border-bottom:1px solid var(--mq-border);}",
        ".mc-hint{font-size:9px;color:var(--mq-muted);margin-top:4px;}",

        /* ── Footer ── */
        "#mc-footer{text-align:right;font-size:10px;color:var(--mq-muted);margin-top:16px;padding-top:10px;border-top:1px solid var(--mq-border);}",

        /* ── Loading ── */
        "#mc-loading{text-align:center;padding:64px;color:var(--mq-muted);font-size:12px;}",
        ".mc-spin-big{display:inline-block;width:20px;height:20px;border:2px solid var(--mq-border);border-top-color:var(--mq-blue);border-radius:50%;animation:mc-spin .8s linear infinite;margin-bottom:12px;vertical-align:middle;margin-right:8px;}",

        "#mc-list{transition:opacity .18s;}",
        "#mc-list.fading{opacity:0;pointer-events:none;}",
      ].join( "" );

      var styleEl = document.createElement( "style" );
      styleEl.textContent = CSS;
      document.head.appendChild( styleEl );

      // ════════════════════════════════════════════════════════════════════
      // HELPERS
      // ════════════════════════════════════════════════════════════════════
      function esc( s ) {
        return String( s || "" )
          .replace( /&/g, "&amp;" ).replace( /</g, "&lt;" )
          .replace( />/g, "&gt;" ).replace( /"/g, "&quot;" );
      }
      function fmtDate( iso ) {
        if ( !iso ) return "—";
        return new Date( iso ).toLocaleString( "vi-VN" );
      }
      function relTime( iso ) {
        if ( !iso ) return "—";
        var diff = Date.now() - new Date( iso ).getTime();
        if ( diff < 60000 )    return "vừa xong";
        if ( diff < 3600000 )  return Math.floor( diff / 60000 ) + " phút trước";
        if ( diff < 86400000 ) return Math.floor( diff / 3600000 ) + " giờ trước";
        return Math.floor( diff / 86400000 ) + " ngày trước";
      }
      function scoreColor( s ) {
        if ( s < 0.3 ) return "var(--mq-green)";
        if ( s < 0.6 ) return "var(--mq-yellow)";
        return "var(--mq-red)";
      }
      function scorePillClass( s ) {
        if ( s >= 0.7 ) return "p-red";
        if ( s >= 0.4 ) return "p-yellow";
        return "p-green";
      }
      function slugify( name ) { return ( name || "" ).replace( / /g, "_" ); }
      function genId() {
        return "cmt-" + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
      }

      // ── Đoán metadata duyệt từ nội dung bài (template Phân_loại / HS… / Dossier) ──
      //    Trả { access, age, category, tags } — gợi ý, admin vẫn sửa được.
      function guessMeta( entry ) {
        var c = String( ( entry && entry.content ) || "" );
        var out = { access: "open", age: "13+", category: ( entry && entry.category ) || "", tags: [] };

        var mAge = c.match( /(?:m[ứuự]c|muc|rating|data-muc)\s*[=:]\s*"?\s*(13|16|18)/i );
        if ( mAge ) out.age = mAge[1] + "+";

        if ( /HST?h[ựu]c[_\s]*th[eể]|data-record-type\s*=\s*"?entity|data-type\s*=\s*"?entity/i.test( c ) ) out.category = out.category || "entity";
        else if ( /HSV[aậ]t[_\s]*ph[aẩ]m|data-type\s*=\s*"?item/i.test( c ) ) out.category = out.category || "item";
        else if ( /HSNh[aậ]t[_\s]*k[yý]|data-type\s*=\s*"?diary|\blog\b/i.test( c ) ) out.category = out.category || "log";

        if ( /t[oố]i[_\s]*m[aậ]t|classified|clearance\s*level\s*[45]/i.test( c ) ) out.access = "classified";
        else if ( /h[aạ]n[_\s]*ch[eế]|restricted/i.test( c ) ) out.access = "restricted";

        var tagMatch = c.match( /(?:data-tag|tag)\s*=\s*"?([^"\n}|]+)/i );
        if ( tagMatch ) {
          out.tags = ( tagMatch[1].match( /#?[^\s#,]+/g ) || [] )
            .map( function ( t ) { return t.replace( /^#/, "" ).trim(); } )
            .filter( Boolean ).slice( 0, 8 );
        }
        var mr = entry && entry.mod_result;
        if ( mr && parseFloat( mr.score || 0 ) >= 0.6 && out.age === "13+" ) out.age = "16+";

        return out;
      }

      // ── API ─────────────────────────────────────────────────────────────
      function readJson( page ) {
        return api.get( {
          action: "query", titles: page,
          prop: "revisions", rvprop: "content", rvslots: "main", formatversion: 2,
        } ).then( function ( res ) {
          var pages = res && res.query && res.query.pages;
          if ( !pages || !pages.length ) return null;
          var p = pages[0];
          if ( p.missing ) return null;
          var rev = p.revisions && p.revisions[0];
          if ( !rev ) return null;
          var content = ( rev.slots && rev.slots.main && rev.slots.main.content ) || rev["*"] || rev.content || "";
          if ( !content ) return null;
          try { return JSON.parse( content ); } catch ( e ) { return null; }
        } );
      }
      function writeJson( page, data, summary ) {
        var text;
        try { text = JSON.stringify( data, null, 2 ); } catch ( e ) {
          return Promise.reject( new Error( "JSON stringify failed" ) );
        }
        return api.postWithToken( "csrf", {
          action: "edit", title: page, text: text,
          summary: summary || "Admin: cập nhật kiểm duyệt",
        } );
      }

      // ── AI LOG ──────────────────────────────────────────────────────────
      function aiLog( msg, type ) {
        var log = document.getElementById( "mc-ai-log-inner" );
        if ( !log ) return;
        var t    = new Date().toLocaleTimeString( "vi-VN" );
        var line = document.createElement( "div" );
        line.className = "mc-ai-log-line" + ( type ? " mc-ai-log-" + type : "" );
        line.innerHTML = '<span class="mc-ai-log-time">' + t + '</span>'
          + '<span class="mc-ai-log-msg">' + esc( msg ) + '</span>';
        log.appendChild( line );
        log.parentElement.scrollTop = log.parentElement.scrollHeight;
      }
      function showAIOverlay( title ) {
        var o = document.getElementById( "mc-ai-overlay" );
        if ( !o ) return;
        var t = o.querySelector( ".mc-ai-title" );
        if ( t ) t.textContent = title || "Đang xử lý";
        var inner = document.getElementById( "mc-ai-log-inner" );
        if ( inner ) inner.innerHTML = "";
        o.classList.add( "open" );
      }
      function hideAIOverlay() {
        var o = document.getElementById( "mc-ai-overlay" );
        if ( o ) {
          o.style.opacity = "0"; o.style.transition = "opacity .3s";
          setTimeout( function () {
            o.classList.remove( "open" );
            o.style.opacity = ""; o.style.transition = "";
          }, 300 );
        }
      }

      // ── AI Overlay HTML ─────────────────────────────────────────────────
      function aiOverlayHTML() {
        return [
          '<div id="mc-ai-overlay">',
          '  <div class="mc-ai-inner">',
          '    <div style="display:flex;align-items:center;gap:12px;">',
          '      <div class="mc-ai-spinner"></div>',
          '      <div class="mc-ai-title">Đang xử lý</div>',
          '    </div>',
          '    <div class="mc-ai-log">',
          '      <div class="mc-ai-log-hd">SYSTEM LOG</div>',
          '      <div class="mc-ai-log-body" id="mc-ai-log-inner"></div>',
          '    </div>',
          '  </div>',
          '</div>',
        ].join( "" );
      }

      // ════════════════════════════════════════════════════════════════════
      // DASHBOARD
      // ════════════════════════════════════════════════════════════════════
      function renderDashboard( all ) {
        var allArr   = Array.isArray( all ) ? all : [];
        var pending  = allArr.filter( function (e) { return e.status === "pending"; } );
        var approved = allArr.filter( function (e) { return e.status === "approved"; } );
        var rejected = allArr.filter( function (e) { return e.status === "rejected"; } );
        var withAI   = pending.filter( function (e) { return !!e.mod_result; } );
        var noAI     = pending.filter( function (e) { return !e.mod_result; } );

        var sortedPending = pending.slice().sort( function ( a, b ) {
          var mr_a = a.mod_result || {}; var mr_b = b.mod_result || {};
          var pa = mr_a.priority === "high" ? 0 : 1;
          var pb = mr_b.priority === "high" ? 0 : 1;
          if ( pa !== pb ) return pa - pb;
          return new Date( a.submitted_at ) - new Date( b.submitted_at );
        } );

        document.getElementById( "mw-content-text" ).innerHTML = [
          '<div id="mc-root">',
          '<div id="mc-inner">',
          aiOverlayHTML(),
          '<div class="mc-header">',
          '  <div class="mc-header-icon">📋</div>',
          '  <div><div class="mc-header-title">MAPLE CENSOR</div><div class="mc-header-sub">Hệ thống kiểm duyệt nội dung</div></div>',
          '  <div class="mc-header-user">',
          '    <span class="mc-header-user-name">' + esc( user ) + '</span>',
          '    <button id="mc-refresh" class="mc-btn mc-btn-ghost">⟳ Làm mới</button>',
          '  </div>',
          '</div>',
          '<div class="mc-stats">',
          '<div class="mc-stat s-blue"><div class="mc-stat-num">' + withAI.length + '</div><div class="mc-stat-lbl">Chờ (có AI)</div></div>',
          '<div class="mc-stat s-purple"><div class="mc-stat-num">' + noAI.length + '</div><div class="mc-stat-lbl">Chờ (thủ công)</div></div>',
          '<div class="mc-stat s-green"><div class="mc-stat-num">' + approved.length + '</div><div class="mc-stat-lbl">Đã duyệt</div></div>',
          '<div class="mc-stat s-red"><div class="mc-stat-num">' + rejected.length + '</div><div class="mc-stat-lbl">Từ chối</div></div>',
          '<div class="mc-stat s-muted"><div class="mc-stat-num">' + allArr.length + '</div><div class="mc-stat-lbl">Tổng</div></div>',
          '</div>',
          '<div class="mc-toolbar">',
          '  <div class="mc-toolbar-left">',
          '    <input id="mc-search" class="mc-search" placeholder="Tìm kiếm bài viết...">',
          '    <span id="mc-status-text" class="mc-status-text"></span>',
          '  </div>',
          '</div>',
          '<div class="mc-tabs" id="mc-tabs">',
          '  <button class="mc-tab active" data-tab="pending">Chờ duyệt <span class="mc-cnt">' + pending.length + '</span></button>',
          '  <button class="mc-tab tab-approved" data-tab="approved">Đã duyệt <span class="mc-cnt">' + approved.length + '</span></button>',
          '  <button class="mc-tab tab-rejected" data-tab="rejected">Từ chối <span class="mc-cnt">' + rejected.length + '</span></button>',
          '  <button class="mc-tab" data-tab="stats">📊 Thống kê</button>',
          '</div>',
          '<div class="mc-panel active" id="mc-panel-pending">',
          sortedPending.length === 0
            ? '<div class="mc-empty"><div class="mc-empty-icon">✅</div>Không có bài nào đang chờ duyệt</div>'
            : '<div id="mc-list">' + sortedPending.map( function (e,i) { return renderCard(e,i); } ).join("") + '</div>',
          '</div>',
          '<div class="mc-panel" id="mc-panel-approved">',
          approved.length === 0
            ? '<div class="mc-empty"><div class="mc-empty-icon">📭</div>Chưa có bài nào được duyệt</div>'
            : approved.map( function (e,i) { return renderCard(e,i); } ).join(""),
          '</div>',
          '<div class="mc-panel" id="mc-panel-rejected">',
          rejected.length === 0
            ? '<div class="mc-empty"><div class="mc-empty-icon">📭</div>Chưa có bài nào bị từ chối</div>'
            : rejected.map( function (e,i) { return renderCard(e,i); } ).join(""),
          '</div>',
          '<div class="mc-panel" id="mc-panel-stats">' + renderStats( allArr ) + '</div>',
          '<div id="mc-footer">Cập nhật lúc ' + new Date().toLocaleTimeString("vi-VN") + '</div>',
          '</div></div>',
        ].join( "" );

        document.querySelectorAll( ".mc-tab" ).forEach( function (tab) {
          tab.onclick = function () {
            document.querySelectorAll( ".mc-tab" ).forEach( function (t) { t.classList.remove("active"); } );
            document.querySelectorAll( ".mc-panel" ).forEach( function (p) { p.classList.remove("active"); } );
            tab.classList.add("active");
            var panel = document.getElementById( "mc-panel-" + tab.dataset.tab );
            if ( panel ) panel.classList.add("active");
          };
        } );

        document.getElementById( "mc-refresh" ).onclick = function () { loadAndRefresh(); };

        var searchEl = document.getElementById( "mc-search" );
        if ( searchEl ) {
          searchEl.oninput = function () {
            var q = searchEl.value.toLowerCase();
            document.querySelectorAll( ".mc-card" ).forEach( function (card) {
              var title = ( card.querySelector( ".mc-card-title" ) || {} ).textContent || "";
              var author = ( card.querySelector( ".mc-card-author" ) || {} ).textContent || "";
              card.style.display = ( title + author ).toLowerCase().indexOf( q ) !== -1 ? "" : "none";
            } );
          };
        }

        document.querySelectorAll( "[data-approve]" ).forEach( function (btn) {
          btn.onclick = function (e) { e.stopPropagation(); doApprove( btn.getAttribute("data-approve") ); };
        } );
        document.querySelectorAll( "[data-reject]" ).forEach( function (btn) {
          btn.onclick = function (e) { e.stopPropagation(); doReject( btn.getAttribute("data-reject") ); };
        } );
      }

      // ── Thống kê kiểm duyệt (tính từ Maple-Pending) ──
      function renderStats( allArr ) {
        var arr = Array.isArray( allArr ) ? allArr : [];
        var approved = arr.filter(function(e){return e.status==="approved";});
        var rejected = arr.filter(function(e){return e.status==="rejected";});
        var pending  = arr.filter(function(e){return e.status==="pending";});
        var decided  = approved.length + rejected.length;
        var rate     = decided ? Math.round( approved.length / decided * 100 ) : 0;

        /* Xếp hạng người duyệt/từ chối */
        var byMod = {};
        function bump( who, key ) {
          if ( !who ) return;
          if ( !byMod[who] ) byMod[who] = { approved:0, rejected:0 };
          byMod[who][key]++;
        }
        approved.forEach(function(e){ bump( e.approved_by, "approved" ); });
        rejected.forEach(function(e){ bump( e.rejected_by, "rejected" ); });
        var mods = Object.keys(byMod).map(function(w){
          return { name:w, approved:byMod[w].approved, rejected:byMod[w].rejected, total:byMod[w].approved+byMod[w].rejected };
        }).sort(function(a,b){return b.total-a.total;}).slice(0,8);

        /* Top tác giả bị từ chối */
        var byAuthor = {};
        rejected.forEach(function(e){ if(e.author) byAuthor[e.author]=(byAuthor[e.author]||0)+1; });
        var authors = Object.keys(byAuthor).map(function(a){return {name:a,count:byAuthor[a]};})
          .sort(function(x,y){return y.count-x.count;}).slice(0,6);

        function statCard( cls, num, lbl ) {
          return '<div class="mc-stat ' + cls + '"><div class="mc-stat-num">' + num + '</div><div class="mc-stat-lbl">' + lbl + '</div></div>';
        }
        function bar( label, val, max, color ) {
          var pct = max ? Math.round( val / max * 100 ) : 0;
          return '<div class="mc-score-row" style="margin:6px 0;">'
            + '<span class="mc-score-lbl" style="width:130px;">' + esc(label) + '</span>'
            + '<div class="mc-score-track"><div class="mc-score-fill" style="width:' + pct + '%;background:' + color + '"></div></div>'
            + '<span class="mc-score-num" style="color:' + color + '">' + val + '</span></div>';
        }

        var modMax = mods.length ? mods[0].total : 0;
        var modRows = mods.length
          ? mods.map(function(m){ return bar( m.name, m.total, modMax, "var(--mq-blue)" )
              + '<div style="font-size:8.5px;color:var(--mq-muted);margin:-2px 0 8px 130px;">✓ ' + m.approved + ' duyệt · ✕ ' + m.rejected + ' từ chối</div>'; }).join("")
          : '<div style="font-size:10px;color:var(--mq-muted);">Chưa có dữ liệu.</div>';

        var authMax = authors.length ? authors[0].count : 0;
        var authRows = authors.length
          ? authors.map(function(a){ return bar( a.name, a.count, authMax, "var(--mq-red)" ); }).join("")
          : '<div style="font-size:10px;color:var(--mq-muted);">Chưa có dữ liệu.</div>';

        return [
          '<div class="mc-stats" style="margin-bottom:20px;">',
            statCard("s-muted",  arr.length,       "Tổng yêu cầu"),
            statCard("s-green",  approved.length,  "Đã duyệt"),
            statCard("s-red",    rejected.length,  "Từ chối"),
            statCard("s-purple", pending.length,   "Đang chờ"),
            statCard("s-blue",   rate + "%",       "Tỉ lệ duyệt"),
          '</div>',
          '<div class="mc-flags-box"><div class="mc-flags-hd">Hoạt động kiểm duyệt viên (top 8)</div>' + modRows + '</div>',
          '<div class="mc-flags-box"><div class="mc-flags-hd">Tác giả bị từ chối nhiều nhất (top 6)</div>' + authRows + '</div>',
        ].join("");
      }

      function renderCard( e, idx ) {
        var mr       = e.mod_result || null;
        var hasAI    = !!mr;
        var status   = e.status || "pending";
        var isHigh   = hasAI && mr.priority === "high";
        var score    = hasAI ? parseFloat(mr.score||0) : parseFloat(e.risk_score||0);
        var scorePct = Math.round( score * 100 );
        var sColor   = scoreColor( score );
        var sPill    = scorePillClass( score );
        var delay    = Math.min( idx * 0.04, 0.4 );
        var pageLink = e.page_name ? "/wiki/Admin:Censor/" + encodeURIComponent(e.page_name) : "";

        var dotClass = status === "approved" ? "d-green"
          : status === "rejected" ? "d-red"
          : !hasAI ? "d-purple"
          : isHigh ? "d-red" : "d-yellow";

        var cardClass = "mc-card "
          + ( status === "approved" ? "pri-approved"
            : status === "rejected" ? "pri-rejected"
            : !hasAI ? "pri-noai"
            : isHigh ? "pri-high" : "pri-low" );

        var tags = hasAI ? ( mr.flags || [] ).map( function (f) {
          return '<span class="mc-tag-item">' + esc(f.type) + '</span>';
        } ).join("") : "";

        var eid = esc(e.id);

        var rightActions = status === "pending" ? [
          '<button data-approve="' + eid + '" class="mc-btn mc-btn-green" style="font-size:9px;padding:5px 12px;">✓ Duyệt</button>',
          '<button data-reject="'  + eid + '" class="mc-btn mc-btn-red" style="font-size:9px;padding:5px 12px;">✕ Từ chối</button>',
          pageLink ? '<a href="' + pageLink + '" class="mc-btn mc-btn-ghost" style="font-size:9px;padding:5px 12px;text-decoration:none;">↗ Xem</a>' : "",
        ].join("") : (
          pageLink ? '<a href="' + pageLink + '" class="mc-btn mc-btn-ghost" style="font-size:9px;padding:5px 12px;text-decoration:none;">↗ Chi tiết</a>' : ""
        );

        return '<div class="' + cardClass + '" style="animation-delay:' + delay + 's">'
          + '<div class="mc-card-top">'
          + '<div class="mc-dot ' + dotClass + '" style="margin-top:6px;"></div>'
          + '<div class="mc-card-main">'
          + '<div class="mc-card-title">'
          + ( pageLink ? '<a href="' + pageLink + '">' + esc(e.page_title||e.page_name||"—") + '</a>' : esc(e.page_title||e.page_name||"—") )
          + ( !hasAI ? '<span class="mc-pill p-purple">CHƯA AI</span>' : "" )
          + ( hasAI && isHigh ? '<span class="mc-pill p-red">HIGH</span>' : "" )
          + ( hasAI ? '<span class="mc-pill ' + sPill + '">' + scorePct + '%</span>' : "" )
          + ( status === "approved" ? '<span class="mc-pill p-green">APPROVED</span>' : "" )
          + ( status === "rejected" ? '<span class="mc-pill p-red">REJECTED</span>' : "" )
          + '</div>'
          + '<div class="mc-card-meta mc-card-author">'
          + '<span>Tác giả: <strong style="color:#a1a1aa">' + esc(e.author||"?") + '</strong></span>'
          + '<span>' + relTime(e.submitted_at) + '</span>'
          + ( e.category ? '<span class="mc-tag-item">' + esc(e.category) + '</span>' : "" )
          + '</div>'
          + ( !hasAI && status === "pending" ? '<div style="font-size:9px;color:var(--mq-purple);margin-top:4px;">⚠ Bot chưa phân tích — cần kiểm tra thủ công</div>' : "" )
          + ( e.content ? '<div class="mc-card-preview">' + esc(e.content.slice(0,280)) + '</div>' : "" )
          + ( tags ? '<div class="mc-card-tags">' + tags + '</div>' : "" )
          + '<div class="mc-score-row">'
          + '<span class="mc-score-lbl">' + (hasAI?"Rủi ro AI":"Rủi ro") + '</span>'
          + '<div class="mc-score-track"><div class="mc-score-fill" style="width:' + scorePct + '%;background:' + sColor + '"></div></div>'
          + '<span class="mc-score-num" style="color:' + sColor + '">' + scorePct + '%</span>'
          + '</div>'
          + '</div>'
          + '<div class="mc-card-actions">' + rightActions + '</div>'
          + '</div>'
          + '</div>';
      }

      // ════════════════════════════════════════════════════════════════════
      // DETAIL PAGE
      // ════════════════════════════════════════════════════════════════════
      function getDetailSubPath() {
        var prefix = "Admin:Censor/";
        return thisPage.startsWith( prefix ) ? thisPage.slice( prefix.length ) : null;
      }
      var _renderMode = "raw";

      function buildContentDisplay( content ) {
        if ( _renderMode === "rendered" ) {
          return '<div class="mc-content-rendered">' + parseWikitext( content ) + '</div>';
        }
        return '<div class="mc-content-body">' + esc( content || "(Không có nội dung)" ) + '</div>';
      }

      function bindRenderToggle( content ) {
        var rawBtn  = document.getElementById( "mc-tog-raw" );
        var renBtn  = document.getElementById( "mc-tog-ren" );
        var display = document.getElementById( "mc-content-display" );
        if ( !rawBtn || !renBtn || !display ) return;
        rawBtn.onclick = function () {
          _renderMode = "raw"; rawBtn.classList.add("active"); renBtn.classList.remove("active");
          display.style.opacity = "0";
          setTimeout( function () { display.innerHTML = buildContentDisplay(content); display.style.transition = "opacity .18s"; display.style.opacity = "1"; }, 160 );
        };
        renBtn.onclick = function () {
          _renderMode = "rendered"; renBtn.classList.add("active"); rawBtn.classList.remove("active");
          display.style.opacity = "0";
          setTimeout( function () { display.innerHTML = buildContentDisplay(content); display.style.transition = "opacity .18s"; display.style.opacity = "1"; }, 160 );
        };
      }

      // ════════════════════════════════════════════════════════════════════
      // PREFETCH COMMENT COUNT  ← FIX CHÍNH
      // Gọi MAPLEComments.getCount() hoặc .load() ngay khi render detail,
      // không cần chờ user click tab Comments.
      // ════════════════════════════════════════════════════════════════════
      function prefetchCommentCount( requestId ) {
        var badge = document.getElementById( "mc-cmt-badge" );
        if ( !badge ) return;

        // Ưu tiên static method getCount nếu có
        if ( typeof MAPLEComments !== "undefined" && typeof MAPLEComments.getCount === "function" ) {
          MAPLEComments.getCount( api, requestId, function ( n ) {
            var b = document.getElementById( "mc-cmt-badge" );
            if ( b ) b.textContent = ( n !== null && n !== undefined ) ? n : 0;
          } );
          return;
        }

        // Fallback: dùng MAPLEComments.load nếu có
        if ( typeof MAPLEComments !== "undefined" && typeof MAPLEComments.load === "function" ) {
          MAPLEComments.load( api, requestId, function ( data ) {
            var b = document.getElementById( "mc-cmt-badge" );
            if ( b ) b.textContent = data ? ( data.comments || [] ).length : 0;
          } );
          return;
        }

        // Fallback cuối: đặt 0 thay vì "…"
        badge.textContent = 0;
      }

      function renderDetailPage( item, backUrl ) {
        if ( !item ) {
          document.getElementById( "mw-content-text" ).innerHTML =
            '<div id="mc-root"><div id="mc-inner">'
            + '<div class="mc-empty" style="margin-top:60px;"><div class="mc-empty-icon">🔍</div>Không tìm thấy bài viết.<br><br>'
            + '<a href="' + esc(backUrl||"/wiki/Admin:Censor") + '" style="color:var(--mq-blue);">← Quay lại</a>'
            + '</div></div></div>';
          return;
        }

        var status   = item.status || "pending";
        var mr       = item.mod_result || {};
        var hasAI    = !!item.mod_result;
        var score    = parseFloat( mr.score || item.risk_score || 0 );
        var scorePct = Math.round( score * 100 );
        var sColor   = scoreColor( score );

        var bannerClass = status === "pending" && !hasAI ? "b-noai"
          : status === "approved" ? "b-approved"
          : status === "rejected" ? "b-rejected" : "b-pending";
        var bannerText = status === "pending" && !hasAI
          ? "⚠ Bot chưa phân tích — cần kiểm tra thủ công."
          : status === "approved" ? "✅ Bài viết đã được duyệt và xuất bản."
          : status === "rejected" ? "❌ Bài viết bị từ chối."
          : "⏳ Bài viết đang chờ xem xét.";

        var flagsHtml = ( mr.flags || [] ).map( function (f) {
          var sev = f.severity || "low";
          var sc = sev === "high" ? "p-red" : sev === "medium" ? "p-yellow" : "p-gray";
          return '<div class="mc-flag-item">'
            + '<span class="mc-pill ' + sc + '" style="flex-shrink:0">' + esc(sev.toUpperCase()) + '</span>'
            + '<div><div class="mc-flag-type">' + esc(f.type) + '</div><div class="mc-flag-msg">' + esc(f.msg) + '</div></div>'
            + '</div>';
        } ).join("");

        var approvedLink = "";
        if ( status === "approved" && item.page_name ) {
          var wikiUrl = WIKI_BASE + encodeURIComponent(slugify(item.page_name));
          approvedLink = '<a href="' + esc(wikiUrl) + '" target="_blank" rel="noopener" class="mc-btn mc-btn-green">↗ Xem trang Miraheze</a>';
        }

        document.getElementById( "mw-content-text" ).innerHTML = [
          '<div id="mc-root"><div id="mc-inner">',
          aiOverlayHTML(),
          '<div id="mc-breadcrumb">',
          '  <a href="/wiki/Admin:Censor">Admin:Censor</a>',
          '  <span class="bc-sep">›</span>',
          '  <span>' + esc(item.page_title||item.page_name||"—") + '</span>',
          '</div>',
          '<div class="mc-det-header">',
          '  <h2>' + esc(item.page_title||item.page_name||"—") + '</h2>',
          '  <div class="mc-det-grid">',
          '    <div class="mc-det-field"><span class="mc-det-key">ID Yêu cầu</span><span class="mc-det-val" style="font-size:10px;color:var(--mq-muted);">' + esc(item.id||"—") + '</span></div>',
          '    <div class="mc-det-field"><span class="mc-det-key">Tác giả</span><span class="mc-det-val">' + esc(item.author||"—") + '</span></div>',
          '    <div class="mc-det-field"><span class="mc-det-key">Thời gian gửi</span><span class="mc-det-val">' + fmtDate(item.submitted_at) + '</span></div>',
          '    <div class="mc-det-field"><span class="mc-det-key">Namespace</span><span class="mc-det-val">' + esc(String(item.namespace!==undefined?item.namespace:"—")) + '</span></div>',
          '    <div class="mc-det-field"><span class="mc-det-key">Điểm rủi ro</span><span class="mc-det-val" style="color:' + sColor + '">' + scorePct + '%</span></div>',
          '    <div class="mc-det-field"><span class="mc-det-key">Phân tích AI</span><span class="mc-pill ' + (hasAI?"p-green":"p-purple") + '">' + (hasAI?"ĐÃ PHÂN TÍCH":"CHƯA CÓ") + '</span></div>',
          hasAI ? '    <div class="mc-det-field"><span class="mc-det-key">Độ ưu tiên</span><span class="mc-pill ' + (mr.priority==="high"?"p-red":"p-gray") + '">' + (mr.priority==="high"?"CAO":"THẤP") + '</span></div>' : "",
          ( item.access ? '    <div class="mc-det-field"><span class="mc-det-key">Cấp truy cập</span><span class="mc-det-val">' + esc(item.access) + '</span></div>' : "" ),
          ( item.reason ? '    <div class="mc-det-field" style="grid-column:span 3;"><span class="mc-det-key">Lý do từ chối</span><span class="mc-det-val" style="color:var(--mq-red);">' + esc(item.reason) + '</span></div>' : "" ),
          '  </div>',
          '  <div class="mc-score-row" style="margin-top:14px;">',
          '    <span class="mc-score-lbl">Rủi ro</span>',
          '    <div class="mc-score-track"><div class="mc-score-fill" style="width:' + scorePct + '%;background:' + sColor + '"></div></div>',
          '    <span class="mc-score-num" style="color:' + sColor + '">' + scorePct + '%</span>',
          '  </div>',
          '</div>',
          '<div class="mc-banner ' + bannerClass + '">' + bannerText + '</div>',
          '<div class="mc-det-actions">',
          '  <a href="/wiki/Admin:Censor" class="mc-btn mc-btn-ghost" style="text-decoration:none;">← Quay lại</a>',
          ( status === "pending"
            ? '<button id="mc-det-approve" class="mc-btn mc-btn-green">✓ Duyệt bài</button>'
              + '<button id="mc-det-reject" class="mc-btn mc-btn-red">✕ Từ chối</button>'
            : "" ),
          approvedLink,
          '</div>',
          ( mr.summary ? '<div class="mc-ai-summary"><div class="mc-ai-summary-hd">Nhận xét AI</div>' + esc(mr.summary) + '</div>' : "" ),
          '<div class="mc-det-tabs">',
          '  <button class="mc-dtab active" data-panel="content">📄 Nội dung</button>',
          '  <button class="mc-dtab dtab-comments" data-panel="comments">💬 Bình luận <span class="mc-badge" id="mc-cmt-badge">…</span></button>',
          '  <button class="mc-dtab dtab-manual" data-panel="manual">✎ Thủ công</button>',
          '</div>',
          '<div class="mc-dpanel active" id="mc-dpanel-content">',
          '<div class="mc-content-box">',
          '  <div class="mc-content-box-hd">',
          '    <span>Nội dung bài viết</span>',
          '    <div class="mc-render-toggle">',
          '      <button id="mc-tog-raw" class="mc-tog active">Mã nguồn</button>',
          '      <button id="mc-tog-ren" class="mc-tog">Render</button>',
          '    </div>',
          '  </div>',
          '  <div id="mc-content-display">' + buildContentDisplay(item.content) + '</div>',
          '</div>',
          ( flagsHtml ? '<div class="mc-flags-box"><div class="mc-flags-hd">Cờ phát hiện bởi AI</div>' + flagsHtml + '</div>' : "" ),
          '</div>',
          '<div class="mc-dpanel" id="mc-dpanel-comments"></div>',
          '<div class="mc-dpanel" id="mc-dpanel-manual"></div>',
          '</div></div>',
        ].join( "" );

        bindRenderToggle( item.content );

        var approveBtn = document.getElementById( "mc-det-approve" );
        var rejectBtn  = document.getElementById( "mc-det-reject" );
        if ( approveBtn ) approveBtn.onclick = function () { doApprove( item.id, function () { window.location.href = "/wiki/Admin:Censor"; } ); };
        if ( rejectBtn  ) rejectBtn.onclick  = function () { doReject( item.id,  function () { window.location.href = "/wiki/Admin:Censor"; } ); };

        // ── FIX: Prefetch comment count ngay khi render, không chờ click tab ──
        prefetchCommentCount( item.id );

        // Tab switching
        var dtabs   = document.querySelectorAll( ".mc-dtab" );
        var dpanels = document.querySelectorAll( ".mc-dpanel" );
        dtabs.forEach( function (tab) {
          tab.addEventListener( "click", function () {
            dtabs.forEach( function (t) { t.classList.remove("active"); } );
            dpanels.forEach( function (p) { p.classList.remove("active"); } );
            tab.classList.add("active");
            var panel = document.getElementById( "mc-dpanel-" + tab.dataset.panel );
            if ( panel ) panel.classList.add("active");

            // Lazy-load comments via MAPLEComments
            if ( tab.dataset.panel === "comments" && !panel.dataset.loaded ) {
              panel.dataset.loaded = "1";
              if ( typeof MAPLEComments !== "undefined" ) {
                var mc = new MAPLEComments( {
                  api:           api,
                  requestId:     item.id,
                  item:          item,
                  container:     panel,
                  currentUser:   user,
                  pageOwner:     item.author,
                  autoProvision: true,
                  onCountChange: function ( n ) {
                    // onCountChange là source of truth — luôn ghi đè prefetch
                    var badge = document.getElementById( "mc-cmt-badge" );
                    if ( badge ) badge.textContent = n;
                  },
                } );
                mc.init();
              } else {
                panel.innerHTML = '<div class="mc-empty"><div class="mc-empty-icon">⚠️</div>MAPLEComments chưa được tải.</div>';
              }
            }

            // Lazy-load manual panel
            if ( tab.dataset.panel === "manual" && !panel.dataset.loaded ) {
              panel.dataset.loaded = "1";
              renderManualPanel( panel, item );
            }
          } );
        } );
      }

      // ════════════════════════════════════════════════════════════════════
      // MANUAL REVIEW PANEL
      // ════════════════════════════════════════════════════════════════════
      function renderManualPanel( container, item ) {
        var mr    = item.mod_result || {};
        var flags = mr.flags || [];
        var hasAI = !!item.mod_result;

        function flagRowHtml( f, idx ) {
          return '<div class="mc-manual-flag-row" data-fidx="' + idx + '">'
            + '<input class="mc-manual-input mc-manual-flag-type" placeholder="Loại cờ" value="' + esc(f.type||"") + '" data-field="type" style="flex:1;">'
            + '<input class="mc-manual-input mc-manual-flag-msg" placeholder="Mô tả" value="' + esc(f.msg||"") + '" data-field="msg" style="flex:2;">'
            + '<select class="mc-manual-select mc-manual-flag-sev" data-field="sev" style="flex:0 0 110px;">'
            + ['low','medium','high'].map(function(s){return '<option value="'+s+'"'+(f.severity===s?' selected':'')+'>'+s.toUpperCase()+'</option>';}).join("")
            + '</select>'
            + '<button class="mc-manual-flag-rm" data-rm="'+idx+'">✕</button>'
            + '</div>';
        }

        container.innerHTML = [
          '<div style="padding:4px 0;">',
          '<div class="mc-manual-notice">',
          '  ⚠ ' + ( hasAI ? 'Chỉnh sửa kết quả AI — thay đổi cập nhật trực tiếp vào Maple-Pending.json' : 'Kiểm tra thủ công — bot chưa phân tích bài viết này' ),
          '</div>',
          '<div class="mc-manual-section">',
          '  <div class="mc-manual-section-hd"><span>Metadata AI / Điểm rủi ro</span></div>',
          '  <div class="mc-manual-section-body">',
          '    <div class="mc-manual-row">',
          '      <div class="mc-manual-field">',
          '        <label class="mc-manual-label">Điểm rủi ro (0–100%) <span>*</span></label>',
          '        <div class="mc-manual-score-row">',
          '          <input type="range" id="mc-m-score-range" min="0" max="100" value="' + Math.round(parseFloat(mr.score||item.risk_score||0)*100) + '" style="flex:1;accent-color:var(--mq-purple);">',
          '          <span id="mc-m-score-val" style="color:var(--mq-purple);font-weight:700;min-width:38px;text-align:right;">' + Math.round(parseFloat(mr.score||item.risk_score||0)*100) + '%</span>',
          '        </div>',
          '      </div>',
          '      <div class="mc-manual-field">',
          '        <label class="mc-manual-label">Độ ưu tiên</label>',
          '        <select id="mc-m-priority" class="mc-manual-select">',
          '          <option value="low"' +(mr.priority!=="high"?" selected":"")+ '>Thấp</option>',
          '          <option value="high"'+(mr.priority==="high"?" selected":"")+ '>Cao</option>',
          '        </select>',
          '      </div>',
          '    </div>',
          '    <div class="mc-manual-field">',
          '      <label class="mc-manual-label">Nhận xét / tóm tắt</label>',
          '      <textarea id="mc-m-summary" class="mc-manual-textarea" style="min-height:70px;">' + esc(mr.summary||"") + '</textarea>',
          '    </div>',
          '  </div>',
          '</div>',
          '<div class="mc-manual-section">',
          '  <div class="mc-manual-section-hd">',
          '    <span>Cờ phát hiện (flags)</span>',
          '    <button id="mc-m-add-flag" class="mc-btn mc-btn-purple" style="font-size:9px;padding:4px 12px;">+ Thêm cờ</button>',
          '  </div>',
          '  <div class="mc-manual-section-body">',
          '    <div id="mc-m-flags-list">' + ( flags.map(flagRowHtml).join("") || '<div style="font-size:10px;color:var(--mq-muted);text-align:center;padding:12px;">Chưa có cờ nào.</div>' ) + '</div>',
          '  </div>',
          '</div>',
          '<div class="mc-manual-section">',
          '  <div class="mc-manual-section-hd"><span>Chỉnh sửa nội dung bài viết</span></div>',
          '  <div class="mc-manual-section-body">',
          '    <div style="font-size:9px;color:var(--mq-yellow);margin-bottom:8px;">⚠ Chỉ chỉnh sửa khi thực sự cần thiết.</div>',
          '    <textarea id="mc-m-content" class="mc-manual-textarea">' + esc(item.content||"") + '</textarea>',
          '  </div>',
          '</div>',
          '<div class="mc-manual-section">',
          '  <div class="mc-manual-section-hd"><span>Thông tin trang</span></div>',
          '  <div class="mc-manual-section-body">',
          '    <div class="mc-manual-row">',
          '      <div class="mc-manual-field"><label class="mc-manual-label">Tiêu đề trang</label><input type="text" id="mc-m-title" class="mc-manual-input" value="' + esc(item.page_title||"") + '"></div>',
          '      <div class="mc-manual-field"><label class="mc-manual-label">Ghi chú nội bộ</label><input type="text" id="mc-m-note" class="mc-manual-input" placeholder="(Chỉ admin thấy)" value="' + esc(item.note||"") + '"></div>',
          '    </div>',
          '  </div>',
          '</div>',
          '<div class="mc-manual-save-bar">',
          '  <span class="mc-manual-save-info" id="mc-m-save-status">Chưa lưu thay đổi</span>',
          '  <div style="display:flex;gap:8px;">',
          '    <button id="mc-m-reset" class="mc-btn mc-btn-ghost">↺ Khôi phục</button>',
          '    <button id="mc-m-save"  class="mc-btn mc-btn-solid-purple">💾 Lưu thay đổi</button>',
          '  </div>',
          '</div>',
          '</div>',
        ].join( "" );

        var range    = container.querySelector( "#mc-m-score-range" );
        var scoreVal = container.querySelector( "#mc-m-score-val" );
        range.oninput = function () { scoreVal.textContent = range.value + "%"; };

        container.querySelector( "#mc-m-add-flag" ).onclick = function () {
          var list = container.querySelector( "#mc-m-flags-list" );
          var idx  = list.querySelectorAll( ".mc-manual-flag-row" ).length;
          var div  = document.createElement( "div" );
          div.innerHTML = flagRowHtml( {type:"",msg:"",severity:"low"}, idx );
          list.appendChild( div.firstChild );
          bindFlagRemove( list );
        };
        bindFlagRemove( container.querySelector( "#mc-m-flags-list" ) );

        function readFlags( list ) {
          return Array.from( list.querySelectorAll(".mc-manual-flag-row") ).map( function (row) {
            return {
              type:     row.querySelector('[data-field="type"]').value.trim(),
              msg:      row.querySelector('[data-field="msg"]').value.trim(),
              severity: row.querySelector('[data-field="sev"]').value,
            };
          } ).filter( function (f) { return f.type; } );
        }

        container.querySelector( "#mc-m-reset" ).onclick = function () {
          if ( !confirm("Khôi phục về dữ liệu gốc?") ) return;
          renderManualPanel( container, item );
        };

        container.querySelector( "#mc-m-save" ).onclick = function () {
          var statusEl = container.querySelector( "#mc-m-save-status" );
          statusEl.textContent = "Đang lưu…"; statusEl.style.color = "var(--mq-yellow)";

          var scoreRaw  = parseInt(container.querySelector("#mc-m-score-range").value,10) / 100;
          var priority  = container.querySelector("#mc-m-priority").value;
          var summary   = container.querySelector("#mc-m-summary").value.trim();
          var content   = container.querySelector("#mc-m-content").value;
          var title     = container.querySelector("#mc-m-title").value.trim();
          var note      = container.querySelector("#mc-m-note").value.trim();
          var flagsData = readFlags(container.querySelector("#mc-m-flags-list"));

          readJson( PAGES.pending ).then( function (freshData) {
            var all = Array.isArray(freshData) ? freshData : [];
            all.forEach( function (e) {
              if ( e.id === item.id ) {
                e.mod_result = { score:scoreRaw, priority:priority, summary:summary, flags:flagsData,
                  reviewed_manually_by:user, reviewed_manually_at:new Date().toISOString() };
                e.risk_score = scoreRaw;
                if ( content !== item.content ) e.content = content;
                if ( title )  e.page_title = title;
                if ( note )   e.note = note;
                Object.assign( item, e );
              }
            } );
            return writeJson( PAGES.pending, all, "Manual review: " + item.id + " by " + user );
          } ).then( function () {
            statusEl.textContent = "Đã lưu lúc " + new Date().toLocaleTimeString("vi-VN");
            statusEl.style.color = "var(--mq-green)";
          } ).catch( function (err) {
            statusEl.textContent = "Lỗi: " + (err&&err.message||""); statusEl.style.color = "var(--mq-red)";
          } );
        };
      }

      function bindFlagRemove( list ) {
        list.querySelectorAll( "[data-rm]" ).forEach( function (btn) {
          btn.onclick = function () { var row = btn.closest(".mc-manual-flag-row"); if (row) row.remove(); };
        } );
      }

      // ════════════════════════════════════════════════════════════════════
      // MODAL
      // ════════════════════════════════════════════════════════════════════
      function buildModal( opts ) {
        var accentColor = opts.accentColor || "var(--mq-blue)";
        var el = document.createElement( "div" );
        el.className = "mc-modal-overlay";
        el.innerHTML = [
          '<div class="mc-modal" style="border-top:2px solid ' + accentColor + ';">',
          '  <div class="mc-modal-hd">',
          '    <div><h2>' + (opts.title||"") + '</h2><p>' + (opts.subtitle||"") + '</p></div>',
          '    <button class="mc-modal-close">✕</button>',
          '  </div>',
          '  <div class="mc-modal-body">' + (opts.bodyHtml||"") + '</div>',
          '  <div class="mc-modal-ft">' + (opts.footerHtml||"") + '</div>',
          '</div>',
        ].join( "" );
        document.body.appendChild( el );
        requestAnimationFrame( function () { requestAnimationFrame( function () { el.classList.add("mc-modal-vis"); } ); } );
        function closeModal() {
          el.classList.remove("mc-modal-vis");
          setTimeout( function () { if ( el.parentNode ) el.parentNode.removeChild(el); }, 240 );
        }
        el.querySelector(".mc-modal-close").onclick = closeModal;
        el.addEventListener( "click", function (e) { if (e.target===el) closeModal(); } );
        el._close = closeModal;
        return el;
      }

      // ════════════════════════════════════════════════════════════════════
      // APPROVE FORM
      // ════════════════════════════════════════════════════════════════════
      var APPROVE_PRESETS = [
        { id:"entity",    icon:"⬡", name:"Thực thể",      desc:"Entity / sinh vật / hiện tượng",   access:"restricted",age:"16+",category:"entity",   tags:"thực-thể,MAPLE" },
        { id:"item",      icon:"◈", name:"Vật phẩm",      desc:"Item / trang thiết bị / vật dụng", access:"open",      age:"13+",category:"item",     tags:"vật-phẩm" },
        { id:"log",       icon:"◉", name:"Bản ghi / LOG", desc:"Nhật ký / hồ sơ sự kiện",         access:"restricted",age:"13+",category:"log",      tags:"log,hồ-sơ" },
        { id:"event",     icon:"◎", name:"Sự kiện",       desc:"Event / incident / diễn biến",     access:"open",      age:"13+",category:"event",    tags:"sự-kiện" },
        { id:"location",  icon:"⊞", name:"Địa điểm",     desc:"Maze / khu vực / địa bàn",         access:"open",      age:"13+",category:"location", tags:"địa-điểm,maze" },
        { id:"personnel", icon:"◇", name:"Nhân sự",       desc:"Hồ sơ nhân viên / thành viên",     access:"classified",age:"16+",category:"personnel",tags:"nhân-sự" },
        { id:"classified",icon:"◆", name:"Tối mật",       desc:"Tài liệu hạn chế / nội bộ",        access:"classified",age:"18+",category:"classified",tags:"tối-mật,restricted" },
        { id:"custom",    icon:"○", name:"Tuỳ chỉnh",     desc:"Nhập thông tin thủ công",           access:"open",      age:"13+",category:"",        tags:"" },
      ];

      function showApproveForm( entry, onConfirm ) {
        var presetBtns = APPROVE_PRESETS.map( function (p) {
          return '<button class="mc-preset-btn mc-preset-btn-green" data-preset="' + p.id + '">'
            + '<span class="mc-preset-icon">' + p.icon + '</span>'
            + '<span class="mc-preset-name">' + p.name + '</span>'
            + '<span class="mc-preset-desc">' + p.desc + '</span>'
            + '</button>';
        } ).join("");

        var g = guessMeta( entry );   // gợi ý access/age/category/tags từ nội dung

        var modal = buildModal( {
          title: "Duyệt bài viết",
          subtitle: esc(entry.page_title||entry.page_name||entry.id),
          accentColor: "var(--mq-green)",
          bodyHtml: [
            /* ── Thông tin xuất bản: tự điền nhưng admin PHẢI gõ/xác nhận ── */
            '<div class="mc-divider">Thông tin xuất bản — admin xác nhận</div>',
            '<div class="mc-field"><label class="mc-label">Tên tài liệu (trang) <span>*</span></label>',
            '  <input type="text" id="mc-af-pagename" class="mc-input" value="' + esc(entry.page_name||"") + '" placeholder="Gõ đầy đủ tên trang..."></div>',
            '<div class="mc-form-row">',
            '  <div class="mc-field"><label class="mc-label">Tiêu đề hiển thị</label><input type="text" id="mc-af-title" class="mc-input" value="' + esc(entry.page_title||entry.page_name||"") + '"></div>',
            '  <div class="mc-field"><label class="mc-label">Mã ID bài <span>*</span></label><input type="text" id="mc-af-id" class="mc-input" value="' + esc(entry.id||"") + '"></div>',
            '</div>',
            '<div class="mc-field"><label class="mc-label">Người duyệt</label><input type="text" id="mc-af-reviewer" class="mc-input" value="' + esc(user) + '"></div>',
            '<div class="mc-hint">Các ô được điền sẵn từ dữ liệu bài — kiểm tra & sửa nếu cần trước khi duyệt.</div>',
            '<div class="mc-divider">Chọn mẫu nhanh</div>',
            '<div class="mc-preset-grid">' + presetBtns + '</div>',
            '<div class="mc-divider">Phân loại (tự đoán từ nội dung)</div>',
            '<div class="mc-form-row">',
            '  <div class="mc-field"><label class="mc-label">Cấp độ truy cập <span>*</span></label>',
            '    <select id="mc-af-access" class="mc-select"><option value="open">Mở — Công khai</option><option value="restricted">Hạn chế</option><option value="classified">Tối mật</option></select></div>',
            '  <div class="mc-field"><label class="mc-label">Độ tuổi <span>*</span></label>',
            '    <select id="mc-af-age" class="mc-select"><option value="13+">13+</option><option value="16+">16+</option><option value="18+">18+</option></select></div>',
            '</div>',
            '<div class="mc-form-row">',
            '  <div class="mc-field"><label class="mc-label">Danh mục <span>*</span></label><input type="text" id="mc-af-category" class="mc-input" placeholder="entity, item, log..."></div>',
            '  <div class="mc-field"><label class="mc-label">Tags</label><input type="text" id="mc-af-tags" class="mc-input" placeholder="tag-1,tag-2"></div>',
            '</div>',
            '<div class="mc-field"><label class="mc-label">Ghi chú duyệt</label><input type="text" id="mc-af-note" class="mc-input" placeholder="Tuỳ chọn..."></div>',
            '<div style="background:#0e1a0d;border:1px solid #196327;border-radius:6px;padding:10px 14px;font-size:9.5px;color:var(--mq-muted);">',
            '  ✓ Trang sẽ được tạo tại <span id="mc-af-target" style="color:var(--mq-green);">' + WIKI_BASE + esc(slugify(entry.page_name||entry.id)) + '</span>',
            '</div>',
          ].join(""),
          footerHtml: '<button id="mc-af-cancel" class="mc-btn mc-btn-ghost">Hủy</button><button id="mc-af-confirm" class="mc-btn mc-btn-solid-green">✓ Xác nhận duyệt</button>',
        } );

        /* Tự điền access/age/category/tags từ guessMeta (admin vẫn sửa được) */
        document.getElementById("mc-af-access").value   = g.access;
        document.getElementById("mc-af-age").value      = g.age;
        document.getElementById("mc-af-category").value = g.category || "";
        document.getElementById("mc-af-tags").value     = (g.tags||[]).join(",");

        /* Cập nhật đường dẫn đích khi đổi tên tài liệu */
        var pnInput = document.getElementById("mc-af-pagename");
        var target  = document.getElementById("mc-af-target");
        pnInput.oninput = function () {
          target.textContent = WIKI_BASE + slugify((pnInput.value||"").trim());
        };

        modal.querySelectorAll(".mc-preset-btn").forEach( function (btn) {
          btn.onclick = function () {
            var preset = APPROVE_PRESETS.find( function (p) { return p.id===btn.getAttribute("data-preset"); } );
            if (!preset) return;
            modal.querySelectorAll(".mc-preset-btn").forEach(function(b){b.classList.remove("active");});
            btn.classList.add("active");
            if ( preset.id !== "custom" ) {
              document.getElementById("mc-af-access").value   = preset.access;
              document.getElementById("mc-af-age").value      = preset.age;
              document.getElementById("mc-af-category").value = preset.category;
              document.getElementById("mc-af-tags").value     = preset.tags;
            }
          };
        } );
        document.getElementById("mc-af-cancel").onclick  = function () { modal._close(); };
        document.getElementById("mc-af-confirm").onclick = function () {
          var pageName = (document.getElementById("mc-af-pagename").value||"").trim();
          var title    = (document.getElementById("mc-af-title").value||"").trim();
          var id       = (document.getElementById("mc-af-id").value||"").trim();
          var reviewer = (document.getElementById("mc-af-reviewer").value||"").trim();
          var access   = document.getElementById("mc-af-access").value;
          var age      = document.getElementById("mc-af-age").value || "13+";
          var category = (document.getElementById("mc-af-category").value||"").trim();
          var tagsRaw  = (document.getElementById("mc-af-tags").value||"").trim();
          var note     = (document.getElementById("mc-af-note").value||"").trim();
          var tags     = tagsRaw ? tagsRaw.split(",").map(function(t){return t.trim();}).filter(Boolean) : [];
          if (!pageName) { alert("Vui lòng gõ đầy đủ TÊN TÀI LIỆU (tên trang)."); return; }
          if (!id)       { alert("Vui lòng nhập MÃ ID bài."); return; }
          if (!category) { alert("Vui lòng nhập danh mục."); return; }
          modal._close();
          setTimeout( function () {
            onConfirm({ page_name:pageName, page_title:title||pageName, id:id, reviewer:reviewer,
              access:access, age:age, tags:tags, category:category, note:note });
          }, 260 );
        };
      }

      // ════════════════════════════════════════════════════════════════════
      // REJECT FORM
      // ════════════════════════════════════════════════════════════════════
      var REJECT_PRESETS = [
        { id:"toxic",      icon:"⚠", name:"Nội dung độc hại",      desc:"Tục tĩu, chửi bới, phân biệt",   reason:"Nội dung vi phạm — chứa ngôn ngữ độc hại hoặc tục tĩu.",      severity:"high"   },
        { id:"plagiarism", icon:"©", name:"Đạo văn",               desc:"Sao chép không ghi nguồn",        reason:"Vi phạm đạo văn — sao chép nội dung mà không ghi rõ nguồn.", severity:"high"   },
        { id:"spam",       icon:"⊗", name:"Spam / rác",             desc:"Nội dung vô nghĩa, test, spam",  reason:"Nội dung spam hoặc không có giá trị thông tin.",              severity:"low"    },
        { id:"duplicate",  icon:"⊙", name:"Trùng lặp",             desc:"Đã tồn tại bài tương tự",         reason:"Nội dung trùng lặp với bài đã có trên wiki.",                 severity:"low"    },
        { id:"misinform",  icon:"✗", name:"Thông tin sai",          desc:"Không có nguồn / sai sự thật",   reason:"Nội dung chứa thông tin sai lệch hoặc không có nguồn.",       severity:"medium" },
        { id:"format",     icon:"◫", name:"Sai định dạng",          desc:"Thiếu template / sai cấu trúc",  reason:"Định dạng sai hoặc thiếu thông tin bắt buộc.",                severity:"low"    },
        { id:"age",        icon:"⊘", name:"Không phù hợp độ tuổi", desc:"Nội dung 18+ không khai báo",    reason:"Nội dung không phù hợp với độ tuổi đề xuất, thiếu cảnh báo.",severity:"medium" },
        { id:"other",      icon:"◌", name:"Lý do khác",             desc:"Nhập lý do thủ công",             reason:"",                                                             severity:"low"    },
      ];

      function showRejectForm( entry, onConfirm ) {
        var presetBtns = REJECT_PRESETS.map( function (p) {
          return '<button class="mc-preset-btn" data-preset="' + p.id + '">'
            + '<span class="mc-preset-icon">' + p.icon + '</span>'
            + '<span class="mc-preset-name">' + p.name + '</span>'
            + '<span class="mc-preset-desc">' + p.desc + '</span>'
            + '</button>';
        } ).join("");

        var modal = buildModal( {
          title: "Từ chối bài viết",
          subtitle: esc(entry.page_title||entry.page_name||entry.id),
          accentColor: "var(--mq-red)",
          bodyHtml: [
            '<div style="background:#2d0f0f;border:1px solid #6e1c1c;border-radius:6px;padding:10px 14px;font-size:10px;color:#a1a1aa;margin-bottom:14px;">',
            'Bài viết sẽ bị đánh dấu <strong style="color:var(--mq-red)">TỪ CHỐI</strong> và lịch sử vi phạm của tác giả sẽ được cập nhật.</div>',
            '<div class="mc-divider">Chọn lý do mẫu</div>',
            '<div class="mc-preset-grid">' + presetBtns + '</div>',
            '<div class="mc-divider">Chi tiết</div>',
            '<div class="mc-form-row">',
            '  <div class="mc-field"><label class="mc-label">Mã ID bài</label><input type="text" id="mc-rf-id" class="mc-input" value="' + esc(entry.id||"") + '" readonly style="opacity:.7;"></div>',
            '  <div class="mc-field"><label class="mc-label">Người xử lý</label><input type="text" id="mc-rf-reviewer" class="mc-input" value="' + esc(user) + '"></div>',
            '</div>',
            '<div class="mc-field"><label class="mc-label">Lý do từ chối <span>*</span></label><textarea id="mc-rf-reason" class="mc-textarea" style="min-height:80px;" placeholder="Lý do tự động điền khi chọn mẫu..."></textarea></div>',
            '<div class="mc-form-row">',
            '  <div class="mc-field"><label class="mc-label">Mức độ vi phạm</label><select id="mc-rf-severity" class="mc-select"><option value="low">Thấp — Nhắc nhở</option><option value="medium">Trung bình — Cảnh cáo</option><option value="high">Cao — Ghi hồ sơ</option></select></div>',
            '  <div class="mc-field"><label class="mc-label">Ghi chú nội bộ</label><input type="text" id="mc-rf-internal" class="mc-input" placeholder="(Chỉ mod thấy — tuỳ chọn)"></div>',
            '</div>',
          ].join(""),
          footerHtml: '<button id="mc-rf-cancel" class="mc-btn mc-btn-ghost">Hủy bỏ</button><button id="mc-rf-confirm" class="mc-btn mc-btn-solid-red">✕ Xác nhận từ chối</button>',
        } );

        modal.querySelectorAll(".mc-preset-btn").forEach( function (btn) {
          btn.onclick = function () {
            var preset = REJECT_PRESETS.find(function(p){return p.id===btn.getAttribute("data-preset");});
            if (!preset) return;
            modal.querySelectorAll(".mc-preset-btn").forEach(function(b){b.classList.remove("active");});
            btn.classList.add("active");
            if (preset.reason) document.getElementById("mc-rf-reason").value = preset.reason;
            document.getElementById("mc-rf-severity").value = preset.severity||"low";
          };
        } );
        document.getElementById("mc-rf-cancel").onclick  = function () { modal._close(); };
        document.getElementById("mc-rf-confirm").onclick = function () {
          var reason   = (document.getElementById("mc-rf-reason").value||"").trim();
          var internal = (document.getElementById("mc-rf-internal").value||"").trim();
          var severity = document.getElementById("mc-rf-severity").value;
          var reviewer = (document.getElementById("mc-rf-reviewer").value||"").trim();
          if (!reason) { alert("Vui lòng nhập lý do từ chối."); return; }
          modal._close();
          setTimeout( function () { onConfirm({reason:reason,internal:internal,severity:severity,reviewer:reviewer}); }, 260 );
        };
      }

      // ════════════════════════════════════════════════════════════════════
      // ACTIONS
      // ════════════════════════════════════════════════════════════════════
      function doApprove( entryId, cb ) {
        readJson( PAGES.pending ).then( function (freshAll) {
          var all   = Array.isArray(freshAll) ? freshAll : [];
          var entry = null;
          all.forEach( function (e) { if (e.id===entryId) entry=e; } );
          if (!entry) { alert("Không tìm thấy entry: " + entryId); return; }

          showApproveForm( entry, function (meta) {
            delete entry.rejected_by; delete entry.rejected_at; delete entry.reason;
            delete entry.reject_severity; delete entry.reject_internal;
            entry.status      = "approved";
            entry.approved_by = meta.reviewer || user;   /* admin xác nhận (ký tên) */
            entry.approved_at = new Date().toISOString();
            /* Tên tài liệu/tiêu đề do admin gõ/xác nhận — quyết định nơi tạo trang */
            if (meta.page_name)  entry.page_name  = meta.page_name;
            if (meta.page_title) entry.page_title = meta.page_title;
            entry.access      = meta.access;
            entry.age         = meta.age;
            entry.tags        = meta.tags;
            entry.category    = meta.category;
            if (meta.note) entry.approve_note = meta.note;

            showAIOverlay("Đang xuất bản");
            aiLog("Đọc dữ liệu mới nhất...");
            aiLog("Cập nhật trạng thái → approved");

            addToArchive( entry )
              .then( function () { aiLog("Đã thêm vào kho lưu trữ.", "ok"); return writeJson(PAGES.pending, all, "Duyệt " + entryId + " bởi " + user); } )
              .then( function () { aiLog("Đã cập nhật Pending.json.", "ok"); return updateQueueStatus(entryId,"approved"); } )
              .then( function () { aiLog("Tạo trang tại Miraheze..."); return publishApprovedPage(entry); } )
              .then( function () {
                aiLog("Trang đã xuất bản!", "ok");
                aiLog("Hoàn tất.", "ok");
                if (window.MAPLE && window.MAPLE.ach) {
                  var ach = window.MAPLE.ach;
                  var stats = ach.data().stats || {};
                  stats.totalModerations = (stats.totalModerations || 0) + 1;
                  ach.rpAdd(5, 'moderation', 25, 'Duyệt bài viết');
                  if (stats.totalModerations >= 25) window.MAPLE.award('curator');
                  if (stats.totalModerations >= 50) window.MAPLE.award('chief_curator');
                }
                setTimeout(function(){hideAIOverlay();if(cb)cb();else loadAndRefresh();},1000);
              } )
              .catch( function (e) { aiLog("Lỗi: " + (e&&e.message||String(e)), "err"); setTimeout(function(){hideAIOverlay();},2000); } );
          });
        });
      }

      function publishApprovedPage( entry ) {
        var tags = (entry.tags||[]).join(", ")||"—";
        var wikitext = [
          "{{MAPLE-Approved}}",
          "; Trạng thái: Đã duyệt",
          "; Danh mục: " + (entry.category||"—"),
          "; Cấp truy cập: " + (entry.access||"open"),
          "; Độ tuổi: " + (entry.age||"13+"),
          "; Tags: " + tags,
          "; Duyệt bởi: [[Người dùng:" + entry.approved_by + "]]",
          "; Duyệt lúc: " + fmtDate(entry.approved_at),
          "",
          "== Nội dung ==",
          entry.content||"",
        ].join("\n");
        return api.postWithToken("csrf",{action:"edit",title:entry.page_name,text:wikitext,
          summary:"MAPLE: Xuất bản bài đã duyệt — "+entry.id
        }).catch(function(){return Promise.resolve();});
      }

      function doReject( entryId, cb ) {
        readJson( PAGES.pending ).then( function (freshAll) {
          var all   = Array.isArray(freshAll) ? freshAll : [];
          var entry = null;
          all.forEach( function (e) { if (e.id===entryId) entry=e; } );
          if (!entry) { alert("Không tìm thấy entry: " + entryId); return; }

          showRejectForm( entry, function (meta) {
            delete entry.approved_by; delete entry.approved_at; delete entry.access;
            delete entry.age; delete entry.tags; delete entry.category; delete entry.approve_note;
            entry.status          = "rejected";
            entry.rejected_by     = meta.reviewer || user;
            entry.rejected_at     = new Date().toISOString();
            entry.reason          = meta.reason;
            entry.reject_severity = meta.severity;
            if (meta.internal) entry.reject_internal = meta.internal;

            showAIOverlay("Đang từ chối");
            aiLog("Xử lý từ chối: " + entryId);
            aiLog("Lý do: " + meta.reason);

            updateUserHistory(entry.author, meta.reason, meta.severity)
              .then( function () { aiLog("Đã cập nhật hồ sơ: " + (entry.author||"—"), "ok"); return writeJson(PAGES.pending, all, "Từ chối " + entryId + " bởi " + user); } )
              .then( function () { aiLog("Đã cập nhật Pending.json.", "ok"); return updateQueueStatus(entryId,"rejected"); } )
              .then( function () {
                aiLog("Hoàn tất.", "ok");
                if (window.MAPLE && window.MAPLE.ach) {
                  var ach = window.MAPLE.ach;
                  var stats = ach.data().stats || {};
                  stats.totalModerations = (stats.totalModerations || 0) + 1;
                  ach.rpAdd(5, 'moderation', 25, 'Từ chối bài viết');
                  if (stats.totalModerations >= 25) window.MAPLE.award('curator');
                  if (stats.totalModerations >= 50) window.MAPLE.award('chief_curator');
                }
                setTimeout(function(){hideAIOverlay();if(cb)cb();else loadAndRefresh();},800);
              } )
              .catch( function (e) { aiLog("Lỗi: " + (e&&e.message||String(e)), "err"); setTimeout(function(){hideAIOverlay();},2000); } );
          });
        });
      }

      function addToArchive( entry ) {
        return readJson( PAGES.archive ).then( function (archiveData) {
          var existing = archiveData || {};
          var arr  = Array.isArray(existing) ? existing : (Array.isArray(existing.entries)?existing.entries:[]);
          var cats = (!Array.isArray(existing)&&Array.isArray(existing.categories))?existing.categories:[];
          if (!arr.some(function(e){return e.id===entry.id;})) {
            var n = JSON.parse(JSON.stringify(entry));
            delete n.mod_result;
            n.title=n.page_title||n.page_name||n.id; n.tags=n.tags||[]; n.access=n.access||"open";
            n.age=n.age||"13+"; n.category=n.category||"general";
            arr.push(n);
            return writeJson(PAGES.archive,{entries:arr,categories:cats},"Thêm "+entry.id+" vào kho");
          }
          return Promise.resolve();
        });
      }

      function updateQueueStatus( entryId, status ) {
        return readJson(PAGES.queue).then(function(queueData){
          if (!queueData) return Promise.resolve();
          var arr = Array.isArray(queueData)?queueData:[];
          arr.forEach(function(q){
            if (q.id===entryId){
              q.status=status; q.reviewed_by=user;
              if (status==="approved") q.approved_at=new Date().toISOString();
              if (status==="rejected") q.rejected_at=new Date().toISOString();
            }
          });
          return writeJson(PAGES.queue,arr,"Cập nhật queue "+entryId);
        }).catch(function(){return Promise.resolve();});
      }

      function updateUserHistory( username, reason, severity ) {
        if (!username) return Promise.resolve();
        return readJson(PAGES.history).then(function(histData){
          histData=histData||{users:{}};
          histData.users=histData.users||{};
          var u=histData.users[username]||{violations:0,events:[]};
          u.violations=(u.violations||0)+1;
          u.events=u.events||[];
          u.events.push({at:new Date().toISOString(),reason:reason||"",severity:severity||"low",by:user});
          histData.users[username]=u;
          return writeJson(PAGES.history,histData,"Vi phạm: "+username);
        }).catch(function(){return Promise.resolve();});
      }

      // ════════════════════════════════════════════════════════════════════
      // WIKITEXT PARSER
      // ════════════════════════════════════════════════════════════════════
      function parseWikitext( raw ) {
        if (!raw) return "(Không có nội dung)";
        var result="",i=0,len=raw.length;
        while(i<len){
          var open=raw.indexOf("{{",i);
          if(open===-1){result+=parseWikitextInline(raw.slice(i));break;}
          if(open>i) result+=parseWikitextInline(raw.slice(i,open));
          var depth=1,j=open+2;
          while(j<len&&depth>0){
            if(raw[j]==="{"&&raw[j+1]==="{"){ depth++;j+=2; }
            else if(raw[j]==="}"&&raw[j+1]==="}"){ depth--;j+=2; }
            else j++;
          }
          result+=renderTemplate(raw.slice(open+2,j-2));
          i=j;
        }
        return result;
      }
      function parseTemplateParams(inner){
        var normalized=inner.replace(/\r\n/g,"\n").replace(/\n[ \t]*\|/g,"|").replace(/^\n+/,"");
        var parts=[],cur="",depth=0;
        for(var ci=0;ci<normalized.length;ci++){
          var c=normalized[ci],c2=normalized[ci+1];
          if(c==="{"&&c2==="{"){depth++;cur+="{{";ci++;}
          else if(c==="}"&&c2==="}"){depth--;cur+="}}";ci++;}
          else if(c==="|"&&depth===0){parts.push(cur);cur="";}
          else cur+=c;
        }
        parts.push(cur);
        var tplName=(parts[0]||"").trim(),params={},pos=1;
        for(var k=1;k<parts.length;k++){
          var eq=parts[k].indexOf("=");
          if(eq!==-1){params[parts[k].slice(0,eq).trim()]=parts[k].slice(eq+1).trim();}
          else{params[pos++]=parts[k].trim();}
        }
        return{name:tplName,params:params};
      }
      function renderTemplate(inner){
        var parsed=parseTemplateParams(inner),tplName=parsed.name,params=parsed.params;
        var paramRows=Object.keys(params).map(function(k){
          return '<tr><td style="font-size:9px;color:var(--mq-muted);padding:4px 12px 4px 0;vertical-align:top;white-space:nowrap;">'+esc(k)+'</td>'
            +'<td style="font-size:11px;color:var(--mq-text);padding:4px 0;line-height:1.6;">'+parseWikitextInline(params[k])+'</td></tr>';
        }).join("");
        return '<div style="border:1px solid var(--mq-border);border-radius:6px;margin-bottom:8px;overflow:hidden;">'
          +'<div style="background:var(--mq-panel);padding:6px 12px;font-size:8.5px;letter-spacing:.2em;color:var(--mq-muted);border-bottom:1px solid var(--mq-border);">{{&nbsp;'+esc(tplName)+'&nbsp;}}</div>'
          +(paramRows?'<table style="width:100%;padding:8px 12px;border-collapse:collapse;"><tbody>'+paramRows+'</tbody></table>':'')
          +'</div>';
      }
      function parseWikitextInline(text){
        if(!text)return"";
        var t=text;
        t=t.replace(/^={3}(.+?)={3}\s*$/gm,'<h3 style="color:var(--mq-text);">$1</h3>');
        t=t.replace(/^={2}(.+?)={2}\s*$/gm,'<h2 style="color:var(--mq-text);">$1</h2>');
        t=t.replace(/'''(.+?)'''/g,'<strong style="color:#fff;">$1</strong>');
        t=t.replace(/''(.+?)''/g,'<em style="color:#a1a1aa;">$1</em>');
        t=t.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g,'<a href="/wiki/$1" style="color:var(--mq-blue)">$2</a>');
        t=t.replace(/\[\[([^\]]+)\]\]/g,'<a href="/wiki/$1" style="color:var(--mq-blue)">$1</a>');
        t=t.replace(/^\*\s(.+)$/gm,'<li>$1</li>');
        t=t.replace(/(<li>[\s\S]*?<\/li>)/g,'<ul style="padding-left:16px;margin:4px 0;">$1</ul>');
        t=t.replace(/\n{2,}/g,'</p><p style="margin:6px 0;">');
        t=t.replace(/\n/g,'<br>');
        return'<p style="margin:0 0 4px;">'+t+'</p>';
      }

      // ════════════════════════════════════════════════════════════════════
      // UTILITIES
      // ════════════════════════════════════════════════════════════════════
      function loadAndRefresh() {
        var list = document.getElementById("mc-list");
        if (list) list.classList.add("fading");
        setTimeout( function () {
          readJson(PAGES.pending).then(function(data){
            renderDashboard(Array.isArray(data)?data:[]);
          }).catch(function(){renderDashboard([]);});
        }, 180 );
      }

      // ════════════════════════════════════════════════════════════════════
      // BOOT
      // ════════════════════════════════════════════════════════════════════
      var subPath = getDetailSubPath();
      if ( isDetail && subPath ) {
        document.getElementById("mw-content-text").innerHTML=
          '<div id="mc-root"><div id="mc-inner">'
          +'<div id="mc-loading"><span class="mc-spin-big"></span>Đang tải dữ liệu...</div>'
          +'</div></div>';
        readJson(PAGES.pending).then(function(data){
          var all  = Array.isArray(data)?data:[];
          var norm = decodeURIComponent(subPath).replace(/ /g,"_");
          var item = all.find(function(e){return (e.page_name||"").replace(/ /g,"_")===norm;});
          renderDetailPage(item,"/wiki/Admin:Censor");
        }).catch(function(){renderDetailPage(null,"/wiki/Admin:Censor");});
      } else {
        document.getElementById("mw-content-text").innerHTML=
          '<div id="mc-root"><div id="mc-inner">'
          +'<div id="mc-loading"><span class="mc-spin-big"></span>Đang tải...</div>'
          +'</div></div>';
        readJson(PAGES.pending).then(function(data){
          renderDashboard(Array.isArray(data)?data:[]);
        }).catch(function(){renderDashboard([]);});
      }

    }); // end mw.loader.using
  }); // end $(function)
}() );