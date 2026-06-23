/**
 * MediaWiki:MAPLE-Comments.js  v4.1
 *
 * Thư viện bình luận nâng cao cho hệ thống MAPLE.
 *
 * ── Thay đổi v4.1 so với v4.0 ────────────────────────────────────────────
 *  • ANONYMOUS USER   : Người dùng chưa đăng nhập vẫn có thể gửi bình luận.
 *                       Tên hiển thị: "Ẩn danh#XXXX" (ID ngẫu nhiên 4 ký tự,
 *                       lưu vào localStorage để nhất quán trong phiên/trình duyệt).
 *
 *  • COLLAPSIBLE REPLY: Các reply trong thread có thể thu gọn/mở rộng bằng
 *                       nút "▾ N trả lời" ngay dưới comment gốc.
 *
 *  • MODERATION v2    : Kiểm duyệt cực mạnh —
 *                       • Unicode homoglyph / leet-speak normalization trước khi so khớp
 *                       • Thêm hàng trăm pattern mới: tiếng Việt, tiếng Anh, leet,
 *                         tiếng lóng, tên gọi kích động, nội dung 18+, doxxing, threat
 *                       • Kiểm tra mật độ link (>3 URL/comment → spam)
 *                       • Kiểm tra ký tự không in được / control characters
 *                       • Phát hiện zalgo text (unicode stacking)
 *                       • Phát hiện all-caps dài (>30 ký tự toàn hoa)
 *                       • Phát hiện lặp từ liên tục (>4 lần cùng từ)
 *
 *  • HARD LOCK khi locked: Khi conversation bị khóa (locked=true hoặc
 *                       status approved/rejected), toàn bộ nút tương tác
 *                       (reaction, reply, edit, delete, pin) bị vô hiệu hóa
 *                       hoàn toàn — không chỉ ẩn form nhập.
 *
 * ── Tính năng giữ nguyên từ v4.0 ─────────────────────────────────────────
 *  @MENTION, SLASH COMMANDS, REACTIONS, REPLY THREAD, EDIT/DELETE, PIN,
 *  RICH PREVIEW, LIVE CHAR COUNT, AUTO-PROVISION
 *
 * ── Expose ra global ──────────────────────────────────────────────────────
 *  window.MAPLEComments
 *  window.MAPLEComments.provision(api, cb)
 */
(function (mw, $, global) {
    'use strict';

    // ════════════════════════════════════════════════════════════════════════
    // CSS
    // ════════════════════════════════════════════════════════════════════════
    var CSS_ID = 'maple-comments-styles-v41';
    var CSS = [
        '.mc-wrap{display:flex;flex-direction:column;gap:10px;}',
        '.mc-comment{border-radius:8px;padding:14px 16px;border:1px solid var(--mp-border,#1e2733);animation:mc-in .22s ease;position:relative;}',
        '@keyframes mc-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}',
        '.mc-comment.type-bot   {background:#0e1a2b;border-color:#1f3e6e;}',
        '.mc-comment.type-admin {background:#1a1230;border-color:#4a2d7a;}',
        '.mc-comment.type-author{background:#111820;border-color:#1f3e6e;}',
        '.mc-comment.type-user  {background:var(--mp-surface,#0d1117);border-color:var(--mp-border,#1e2733);}',
        '.mc-comment.type-anon  {background:#0f0f18;border-color:#2a2540;}',
        '.mc-comment.type-wiki  {background:#0d1a0d;border-color:#196327;}',
        '.mc-comment.type-reject{background:#2d0f0f;border-color:#6e1c1c;}',
        '.mc-comment.type-approve{background:#122620;border-color:#196327;}',
        '.mc-comment.pinned     {border-color:#e3b341;box-shadow:0 0 0 1px #e3b34122;}',
        '.mc-comment.deleted    {opacity:.45;filter:grayscale(.7);}',
        /* Reply indent */
        '.mc-comment.is-reply{margin-left:24px;border-left:3px solid var(--mp-border,#1e2733);}',
        '.mc-reply-ref{font-size:10px;color:var(--mp-muted,#484f58);background:#0a0e14;border-radius:4px;padding:5px 10px;margin-bottom:8px;border-left:2px solid var(--mp-blue,#388bfd);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
        '.mc-reply-ref strong{color:var(--mp-blue,#388bfd);}',
        /* Collapsible reply group */
        '.mc-reply-group{margin-left:24px;}',
        '.mc-reply-toggle{display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;font-size:10px;color:var(--mp-muted,#484f58);padding:4px 8px;border-radius:4px;font-family:var(--mp-font,"Consolas",monospace);transition:all .15s;margin:2px 0 4px 0;}',
        '.mc-reply-toggle:hover{background:#1a1f28;color:var(--mp-text,#c9d1d9);}',
        '.mc-reply-toggle .arrow{display:inline-block;transition:transform .2s;font-size:9px;}',
        '.mc-reply-toggle.collapsed .arrow{transform:rotate(-90deg);}',
        '.mc-reply-children{display:flex;flex-direction:column;gap:8px;}',
        '.mc-reply-children.hidden{display:none;}',
        /* Header */
        '.mc-comment-header{display:flex;align-items:center;gap:8px;margin-bottom:8px;}',
        '.mc-avatar{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}',
        '.mc-avatar.bot   {background:#111d2b;}.mc-avatar.admin{background:#1e1040;}',
        '.mc-avatar.author{background:#0e1a2b;}.mc-avatar.user {background:#1a1f28;}',
        '.mc-avatar.anon  {background:#18182a;}.mc-avatar.wiki  {background:#0d1a0d;}',
        '.mc-avatar.reject{background:#2d0f0f;}.mc-avatar.approve{background:#122620;}',
        '.mc-meta{flex:1;min-width:0;}',
        '.mc-author{font-size:11px;font-weight:700;color:var(--mp-text,#c9d1d9);}',
        '.mc-author.bot   {color:var(--mp-cyan,#76e3ea);}.mc-author.admin{color:var(--mp-purple,#a371f7);}',
        '.mc-author.wiki  {color:var(--mp-green,#2ea043);}.mc-author.author{color:var(--mp-blue,#388bfd);}',
        '.mc-author.anon  {color:#9988cc;font-style:italic;}',
        '.mc-author.reject{color:var(--mp-red,#f85149);}.mc-author.approve{color:var(--mp-green,#2ea043);}',
        '.mc-time{font-size:9px;color:var(--mp-muted,#484f58);margin-top:1px;}',
        '.mc-edited{font-size:9px;color:var(--mp-muted,#484f58);font-style:italic;}',
        '.mc-tag{font-size:8px;padding:2px 7px;border-radius:6px;font-weight:700;letter-spacing:.4px;}',
        '.mc-tag.bot    {background:#111d2b;color:var(--mp-cyan,#76e3ea);border:1px solid #1f3e6e;}',
        '.mc-tag.admin  {background:#1e1040;color:var(--mp-purple,#a371f7);border:1px solid #4a2d7a;}',
        '.mc-tag.wiki   {background:#0d1a0d;color:var(--mp-green,#2ea043);border:1px solid #196327;}',
        '.mc-tag.author {background:#0e1a2b;color:var(--mp-blue,#388bfd);border:1px solid #1f3e6e;}',
        '.mc-tag.user   {background:#1a1f28;color:var(--mp-muted,#484f58);border:1px solid var(--mp-border,#1e2733);}',
        '.mc-tag.anon   {background:#18182a;color:#9988cc;border:1px solid #2a2540;}',
        '.mc-tag.reject {background:#2d0f0f;color:var(--mp-red,#f85149);border:1px solid #6e1c1c;}',
        '.mc-tag.approve{background:#122620;color:var(--mp-green,#2ea043);border:1px solid #196327;}',
        '.mc-pin-badge  {font-size:9px;padding:2px 7px;border-radius:6px;background:#2a2000;color:#e3b341;border:1px solid #4a3800;font-weight:700;}',
        /* Body */
        '.mc-body{font-size:12px;color:var(--mp-text,#c9d1d9);line-height:1.7;white-space:pre-wrap;word-break:break-word;}',
        '.mc-body a{color:var(--mp-green,#2ea043);text-decoration:none;}.mc-body a:hover{text-decoration:underline;}',
        '.mc-mention{display:inline-block;background:#111d2b;color:var(--mp-cyan,#76e3ea);border:1px solid #1f4060;border-radius:4px;padding:0 5px;font-size:11px;font-weight:700;cursor:default;}',
        '.mc-quote{border-left:3px solid var(--mp-purple,#a371f7);background:#12102a;padding:8px 12px;border-radius:0 6px 6px 0;font-size:11px;color:#9d8cd4;margin:4px 0;white-space:pre-wrap;word-break:break-word;}',
        '.mc-spoiler{display:inline-block;background:#1a1a2e;border:1px solid #2d2d50;border-radius:4px;padding:1px 8px;cursor:pointer;user-select:none;font-size:12px;transition:all .2s;}',
        '.mc-spoiler .mc-spoiler-text{filter:blur(4px);transition:filter .2s;pointer-events:none;}',
        '.mc-spoiler.revealed .mc-spoiler-text{filter:none;}',
        '.mc-spoiler-hint{font-size:9px;color:var(--mp-purple,#a371f7);margin-left:4px;}',
        '.mc-spoiler.revealed .mc-spoiler-hint{display:none;}',
        '.mc-code{display:block;background:#090d12;border:1px solid #1e2733;border-radius:6px;padding:8px 12px;font-family:var(--mp-font,"Consolas",monospace);font-size:11px;color:#e6edf3;overflow-x:auto;margin:4px 0;white-space:pre;}',
        '.mc-bold{font-weight:700;color:#fff;}',
        '.mc-hr{border:none;border-top:1px solid var(--mp-border,#1e2733);margin:8px 0;}',
        '.mc-image-attach{max-width:100%;max-height:220px;border-radius:6px;border:1px solid var(--mp-border,#1e2733);margin:6px 0;display:block;cursor:zoom-in;}',
        /* Action bar */
        '.mc-actions{display:flex;align-items:center;gap:6px;margin-top:10px;flex-wrap:wrap;}',
        '.mc-reactions{display:flex;gap:4px;flex-wrap:wrap;}',
        '.mc-reaction-btn{background:#111820;border:1px solid var(--mp-border,#1e2733);border-radius:20px;padding:2px 8px;font-size:11px;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:3px;color:var(--mp-muted,#484f58);}',
        '.mc-reaction-btn:hover{border-color:#388bfd;color:#388bfd;}',
        '.mc-reaction-btn.active{background:#111d2b;border-color:#388bfd;color:var(--mp-blue,#388bfd);}',
        '.mc-reaction-btn .cnt{font-size:10px;font-weight:700;}',
        /* Locked reaction / action */
        '.mc-locked-wrap .mc-reaction-btn,.mc-locked-wrap .mc-act-btn{opacity:.3;cursor:not-allowed;pointer-events:none;}',
        '.mc-act-btn{background:none;border:none;font-size:10px;color:var(--mp-muted,#484f58);cursor:pointer;padding:3px 7px;border-radius:4px;transition:all .15s;font-family:var(--mp-font,"Consolas",monospace);}',
        '.mc-act-btn:hover{background:#1a1f28;color:var(--mp-text,#c9d1d9);}',
        '.mc-act-btn.del:hover{color:var(--mp-red,#f85149);}',
        '.mc-act-btn.pin-act:hover{color:#e3b341;}',
        /* Inline edit */
        '.mc-edit-area{margin-top:8px;display:none;}',
        '.mc-edit-area.open{display:block;}',
        '.mc-edit-textarea{width:100%;min-height:60px;background:#090d12;border:1px solid var(--mp-blue,#388bfd);border-radius:6px;padding:8px 10px;font-family:var(--mp-font,"Consolas",monospace);font-size:12px;color:var(--mp-text,#c9d1d9);resize:vertical;box-sizing:border-box;outline:none;}',
        '.mc-edit-bar{display:flex;gap:6px;margin-top:6px;}',
        '.mc-edit-save{padding:5px 14px;background:#111d2b;border:1px solid var(--mp-blue,#388bfd);color:var(--mp-blue,#388bfd);border-radius:5px;font-size:10px;font-weight:700;cursor:pointer;font-family:var(--mp-font,"Consolas",monospace);}',
        '.mc-edit-cancel{padding:5px 12px;background:none;border:1px solid var(--mp-border,#1e2733);color:var(--mp-muted,#484f58);border-radius:5px;font-size:10px;cursor:pointer;font-family:var(--mp-font,"Consolas",monospace);}',
        /* Reply form */
        '.mc-reply-form{margin-top:8px;display:none;animation:mc-in .18s ease;}',
        '.mc-reply-form.open{display:block;}',
        '.mc-reply-form textarea{width:100%;min-height:56px;background:#090d12;border:1px solid #2a3a2a;border-radius:6px;padding:8px 10px;font-family:var(--mp-font,"Consolas",monospace);font-size:12px;color:var(--mp-text,#c9d1d9);resize:vertical;box-sizing:border-box;outline:none;transition:border-color .2s;}',
        '.mc-reply-form textarea:focus{border-color:var(--mp-green,#2ea043);}',
        '.mc-reply-bar{display:flex;gap:6px;margin-top:6px;align-items:center;}',
        '.mc-reply-send{padding:5px 14px;background:#122620;border:1px solid var(--mp-green,#2ea043);color:var(--mp-green,#2ea043);border-radius:5px;font-size:10px;font-weight:700;cursor:pointer;font-family:var(--mp-font,"Consolas",monospace);}',
        '.mc-reply-cancel{padding:5px 12px;background:none;border:1px solid var(--mp-border,#1e2733);color:var(--mp-muted,#484f58);border-radius:5px;font-size:10px;cursor:pointer;font-family:var(--mp-font,"Consolas",monospace);}',
        /* Empty */
        '.mc-empty{text-align:center;padding:32px 24px;color:var(--mp-muted,#484f58);font-size:12px;}',
        '.mc-empty-icon{font-size:28px;margin-bottom:8px;}',
        /* Main form */
        '.mc-form{background:var(--mp-surface,#0d1117);border:1px solid var(--mp-border,#1e2733);border-radius:10px;padding:16px 18px;margin-top:16px;}',
        '.mc-form-tabs{display:flex;gap:0;margin-bottom:10px;border-bottom:1px solid var(--mp-border,#1e2733);}',
        '.mc-tab{background:none;border:none;padding:6px 14px;font-size:10px;font-weight:700;color:var(--mp-muted,#484f58);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;font-family:var(--mp-font,"Consolas",monospace);letter-spacing:.4px;transition:all .15s;}',
        '.mc-tab.active{color:var(--mp-blue,#388bfd);border-bottom-color:var(--mp-blue,#388bfd);}',
        '.mc-form h4{font-size:10px;font-weight:700;color:var(--mp-muted,#484f58);letter-spacing:.6px;margin:0 0 10px;text-transform:uppercase;font-family:var(--mp-font,"Consolas",monospace);}',
        '.mc-char-count{font-size:9px;color:var(--mp-muted,#484f58);text-align:right;margin-top:3px;}',
        '.mc-char-count.warn{color:#e3b341;}.mc-char-count.over{color:var(--mp-red,#f85149);}',
        '.mc-textarea{width:100%;min-height:80px;background:#090d12;border:1px solid var(--mp-border,#1e2733);border-radius:6px;padding:10px 12px;font-family:var(--mp-font,"Consolas",monospace);font-size:12px;color:var(--mp-text,#c9d1d9);resize:vertical;box-sizing:border-box;transition:border-color .2s;outline:none;}',
        '.mc-textarea:focus{border-color:var(--mp-blue,#388bfd);}',
        '.mc-textarea::placeholder{color:var(--mp-muted,#484f58);}',
        '.mc-textarea.mod-flagged{border-color:var(--mp-red,#f85149) !important;}',
        '.mc-preview-pane{display:none;min-height:80px;background:#090d12;border:1px solid var(--mp-border,#1e2733);border-radius:6px;padding:10px 12px;font-size:12px;color:var(--mp-text,#c9d1d9);line-height:1.7;word-break:break-word;}',
        '.mc-preview-pane.active{display:block;}',
        /* Anonymous name input */
        '.mc-anon-row{display:flex;align-items:center;gap:8px;margin-bottom:8px;}',
        '.mc-anon-label{font-size:9px;color:var(--mp-muted,#484f58);white-space:nowrap;font-family:var(--mp-font,"Consolas",monospace);}',
        '.mc-anon-input{flex:1;background:#090d12;border:1px solid var(--mp-border,#1e2733);border-radius:5px;padding:5px 9px;font-size:11px;color:var(--mp-text,#c9d1d9);font-family:var(--mp-font,"Consolas",monospace);outline:none;transition:border-color .2s;}',
        '.mc-anon-input:focus{border-color:#9988cc;}',
        '.mc-anon-id{font-size:9px;color:#9988cc;white-space:nowrap;}',
        /* Slash command menu */
        '.mc-slash-menu{position:absolute;bottom:calc(100% + 6px);left:0;background:#0d1117;border:1px solid var(--mp-border,#1e2733);border-radius:8px;min-width:260px;box-shadow:0 8px 24px #00000080;z-index:9999;overflow:hidden;animation:mc-in .15s ease;}',
        '.mc-slash-item{display:flex;align-items:flex-start;gap:10px;padding:9px 14px;cursor:pointer;transition:background .1s;}',
        '.mc-slash-item:hover,.mc-slash-item.focused{background:#1a1f28;}',
        '.mc-slash-icon{font-size:16px;flex-shrink:0;margin-top:1px;}',
        '.mc-slash-name{font-size:11px;font-weight:700;color:var(--mp-text,#c9d1d9);font-family:var(--mp-font,"Consolas",monospace);}',
        '.mc-slash-desc{font-size:9px;color:var(--mp-muted,#484f58);margin-top:1px;}',
        /* Mention dropdown */
        '.mc-mention-menu{position:absolute;bottom:calc(100% + 6px);left:0;background:#0d1117;border:1px solid var(--mp-border,#1e2733);border-radius:8px;min-width:180px;box-shadow:0 8px 24px #00000080;z-index:9999;overflow:hidden;animation:mc-in .15s ease;}',
        '.mc-mention-item{display:flex;align-items:center;gap:8px;padding:8px 12px;cursor:pointer;transition:background .1s;}',
        '.mc-mention-item:hover,.mc-mention-item.focused{background:#1a1f28;}',
        '.mc-mention-avatar{width:22px;height:22px;border-radius:5px;background:#1a2233;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--mp-cyan,#76e3ea);flex-shrink:0;}',
        '.mc-mention-name{font-size:11px;color:var(--mp-text,#c9d1d9);}',
        '.mc-form-body{position:relative;}',
        /* Submit */
        '.mc-submit{margin-top:8px;padding:7px 18px;background:#111d2b;border:1px solid var(--mp-blue,#388bfd);color:var(--mp-blue,#388bfd);border-radius:6px;font-family:var(--mp-font,"Consolas",monospace);font-size:10px;font-weight:700;cursor:pointer;transition:all .2s;letter-spacing:.5px;}',
        '.mc-submit:hover{background:#1a2d44;}.mc-submit:disabled{opacity:.4;cursor:not-allowed;}',
        '.mc-status{font-size:10px;margin-top:6px;color:var(--mp-muted,#484f58);}',
        '.mc-status.ok{color:var(--mp-green,#2ea043);}.mc-status.err{color:var(--mp-red,#f85149);}.mc-status.warn{color:#e3b341;}',
        '.mc-mod-hint{font-size:9px;margin-top:4px;padding:4px 8px;background:#1a0f0f;border:1px solid #4a1515;border-radius:4px;color:#f85149;}',
        '.mc-hint-bar{font-size:9px;color:var(--mp-muted,#484f58);margin-top:4px;display:flex;gap:10px;flex-wrap:wrap;}',
        '.mc-hint-bar span{cursor:default;}.mc-hint-bar kbd{background:#1a1f28;border:1px solid #2a3040;border-radius:3px;padding:0 4px;font-family:monospace;font-size:9px;color:#76e3ea;}',
        '.mc-locked{background:#111820;border:1px solid var(--mp-border,#1e2733);border-radius:8px;padding:12px 16px;margin-top:16px;font-size:11px;color:var(--mp-muted,#484f58);display:flex;align-items:center;gap:8px;}',
        '.mc-syncing{text-align:center;padding:8px;font-size:10px;color:var(--mp-muted,#484f58);}',
        '@keyframes mp-spin{to{transform:rotate(360deg)}}',
        '.mc-spin{display:inline-block;width:14px;height:14px;border:2px solid var(--mp-border,#1e2733);border-top-color:var(--mp-blue,#388bfd);border-radius:50%;animation:mp-spin .8s linear infinite;vertical-align:middle;margin-right:6px;}',
        '.mc-lightbox{position:fixed;inset:0;background:#000000cc;z-index:99999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;animation:mc-in .2s ease;}',
        '.mc-lightbox img{max-width:90vw;max-height:90vh;border-radius:8px;box-shadow:0 20px 60px #000;}',
        '.mc-provision-bar{display:flex;align-items:center;gap:10px;background:#0d1117;border:1px solid #1e2733;border-radius:8px;padding:10px 14px;font-size:10px;color:#484f58;font-family:var(--mp-font,"Consolas"),monospace;margin-bottom:12px;}',
        '.mc-provision-bar .ok{color:#2ea043;}.mc-provision-bar .err{color:#f85149;}.mc-provision-bar .info{color:#388bfd;}',
    ].join('\n');

    function injectCSS() {
        if (document.getElementById(CSS_ID)) return;
        var s = document.createElement('style');
        s.id = CSS_ID; s.textContent = CSS;
        document.head.appendChild(s);
    }

    // ════════════════════════════════════════════════════════════════════════
    // Constants
    // ════════════════════════════════════════════════════════════════════════
    var EDIT_WINDOW_MS = 15 * 60 * 1000;
    var REACTIONS_LIST = ['👍', '❤️', '😂', '😮', '😢', '🔥'];
    var SLASH_COMMANDS = [
        { cmd: 'link',    icon: '🔗', name: '/link:URL',           desc: 'Đính kèm liên kết — /link:https://... hoặc /link:URL|Tên hiển thị' },
        { cmd: 'image',   icon: '🖼️', name: '/image:URL',          desc: 'Nhúng ảnh từ URL' },
        { cmd: 'quote',   icon: '💬', name: '/quote:nội dung',     desc: 'Blockquote nổi bật' },
        { cmd: 'spoiler', icon: '🙈', name: '/spoiler:nội dung',   desc: 'Ẩn nội dung — click để xem' },
        { cmd: 'code',    icon: '💻', name: '/code:nội dung',      desc: 'Code block monospace' },
        { cmd: 'bold',    icon: '𝐁',  name: '/bold:nội dung',      desc: 'In đậm văn bản' },
        { cmd: 'hr',      icon: '━',  name: '/hr',                  desc: 'Đường kẻ phân cách' },
    ];

    // ════════════════════════════════════════════════════════════════════════
    // ANONYMOUS USER SUPPORT
    // ════════════════════════════════════════════════════════════════════════
    var ANON_KEY = 'maple_anon_id';

    /** Lấy (hoặc tạo) ID ẩn danh, lưu vào localStorage */
    function getAnonId() {
        var stored = null;
        try { stored = localStorage.getItem(ANON_KEY); } catch (e) {}
        if (stored) return stored;
        var id = Math.random().toString(36).slice(2, 6).toUpperCase();
        try { localStorage.setItem(ANON_KEY, id); } catch (e) {}
        return id;
    }

    function getAnonUsername() {
        return 'Ẩn danh#' + getAnonId();
    }

    /** Lấy tên người dùng hiện tại; nếu không có thì trả về tên ẩn danh */
    function resolveCurrentUser(username) {
        if (username && username.trim() && username !== '0') return username.trim();
        return getAnonUsername();
    }

    // ════════════════════════════════════════════════════════════════════════
    // Helpers
    // ════════════════════════════════════════════════════════════════════════
    function esc(s) {
        return String(s || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    function fmtDate(iso) {
        if (!iso) return '—';
        var d = new Date(iso);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
               ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }

    function isBot(name) { return /bot/i.test(name || ''); }
    function isAnonUser(name) { return /^Ẩn danh#/i.test(name || ''); }

    function runSerial(tasks, done) {
        var i = 0;
        function next() { if (i >= tasks.length) return done(); tasks[i++](next); }
        next();
    }

    function isAdmin(username) {
        if (typeof mw !== 'undefined' && mw.config) {
            var groups = mw.config.get('wgUserGroups') || [];
            if (Array.isArray(groups) && (groups.indexOf('sysop') !== -1 || groups.indexOf('admin') !== -1)) return true;
        }
        return /admin|maple|official/i.test(username || '');
    }

    // ════════════════════════════════════════════════════════════════════════
    // MODERATION v2  (kiểm duyệt cực mạnh)
    // ════════════════════════════════════════════════════════════════════════
    var MOD_LOCAL = (function () {

        // ── Normalize unicode để chống leet/homoglyph ─────────────────────
        var HOMOGLYPHS = {
            // Chữ cái Latin → a-z
            'à':'a','á':'a','â':'a','ã':'a','ä':'a','å':'a','ă':'a','ắ':'a','ặ':'a','ầ':'a','ấ':'a','ẩ':'a','ẫ':'a','ậ':'a','ả':'a','ạ':'a',
            'è':'e','é':'e','ê':'e','ë':'e','ě':'e','ẽ':'e','ề':'e','ế':'e','ể':'e','ễ':'e','ệ':'e','ẻ':'e','ẹ':'e',
            'ì':'i','í':'i','î':'i','ï':'i','ĩ':'i','ỉ':'i','ị':'i',
            'ò':'o','ó':'o','ô':'o','õ':'o','ö':'o','ø':'o','ơ':'o','ờ':'o','ớ':'o','ổ':'o','ỡ':'o','ộ':'o','ồ':'o','ố':'o','ỏ':'o','ọ':'o',
            'ù':'u','ú':'u','û':'u','ü':'u','ũ':'u','ư':'u','ừ':'u','ứ':'u','ử':'u','ữ':'u','ự':'u','ủ':'u','ụ':'u',
            'ỳ':'y','ý':'y','ỷ':'y','ỹ':'y','ỵ':'y',
            'đ':'d',
            // Leet speak số → chữ
            '0':'o','1':'i','3':'e','4':'a','5':'s','6':'g','7':'t','8':'b','9':'g',
            // Cyrillic lookalikes
            'а':'a','е':'e','о':'o','р':'p','с':'c','х':'x','у':'u',
            // Special spacing / invisible chars → space
            '\u200b':' ','\u200c':' ','\u200d':' ','\ufeff':' ','\u00a0':' ',
        };

        function normalize(text) {
            // 1. Bỏ dấu kết hợp (combining marks) — bắt zalgo
            var s = text.normalize ? text.normalize('NFD') : text;
            // Xoá combining diacritics (U+0300–U+036F) và các block combining khác
            s = s.replace(/[\u0300-\u036f\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/g, '');
            // 2. Áp dụng bảng homoglyph
            s = s.split('').map(function (ch) {
                return HOMOGLYPHS.hasOwnProperty(ch) ? HOMOGLYPHS[ch] : ch;
            }).join('');
            // 3. Chuyển về thường
            return s.toLowerCase();
        }

        // ── Blocked patterns (kiểm tra trên text đã normalize) ────────────
        var BLOCKED = [
            // ─── Tiếng Việt tục tĩu (đầy đủ) ───────────────────────────
            /d[ij]t/,/dit\s*me/,/dit\s*cha/,/dit\s*bo/,/d\.?\s?[ij]\.?\s?t/,
            /cut/,/c\.?\s?u\.?\s?t/,/cac/,/cặc/,/lon/,/l\.?\s?o\.?\s?n/,
            /buoi/,/b\.?\s?u\.?\s?o\.?\s?i/,/dum/,/du\s*ma/,/duong\s*vat/,
            /chim\s*(cu)?/,/dcm\b/,/vcl\b/,/vkl\b/,/vcc\b/,/clm\b/,/đmm\b/,
            /ngudi/,/deo\b/,/đeo\b/,/vãi\s*l/,/vai\s*lon/,
            /mat\s*lon/,/dau\s*(cho|bo|lon)/,/suc\s*vat/,/khon\s*nan/,/doc\s*ham/,
            /cho\s*(chet|de)/,/do\s*(cho|ngu|dien)/,/thang\s*(cho|ngu|dien|khung|dan)/,
            /con\s*(di|diem|cho|me|cut)/,/me\s*may/,/bo\s*may/,/cut\s*(di|me)/,
            /oc\s*cho/,/dau\s*bo/,/tau\s*khi/,/ngu\s*(vl|vcc|vai)/,
            /du\s*may/,/cho\s*chet/,/lo\s*dit/,
            // ─── Tiếng lóng / viết tắt tục ─────────────────────────────
            /dmcs\b/,/đmcs\b/,/clgt\b/,/đcm\b/,/đkm\b/,/dkm\b/,
            /bitch\s*me/,/fuck\s*me/,/fk\s*you/,
            // ─── Tiếng Anh ───────────────────────────────────────────────
            /f[u*@x]+c+k/,/f[u*]+ck/,/fck\b/,/wtf\b/,
            /s+h[i!1]+t/,/sh[i1]t/,/sht\b/,
            /a[s$]+h[o0]+le/,/a[s$]{2,}/,
            /b[i!1]+tch/,/btch\b/,
            /c[u*]+nt/,
            /d[i!1]+ck/,/dik\b/,
            /p[u*]+ss[iy]/,
            /b[a@]+st[a@]+rd/,
            /wh[o0]+re/,
            /f[a@]+g+[o0]?t?/,
            /n[i!1]+gg+[ae]?r?/,/n[i1]gg/,
            /c[o0]+ck/,/c0ck/,
            /p[e3]n[i1]s/,
            /[a@]n[u@]s/,
            /r[a@]+p[e3]/,/r4pe/,
            /m[o0]+l[e3]st/,
            /sex/,/porn/,/p0rn/,/xxx/,/x\.?x\.?x/,
            /n[u*@]+de/,/n4ked/,
            /h[e3]nt[a@][i1]/,
            // ─── Đe dọa / bạo lực ────────────────────────────────────────
            /kill\s*you/,/kill\s*my(self)?/,/i\s*will\s*kill/,/i['']m\s*gonna\s*kill/,
            /go\s*die/,/kys\b/,/end\s*your(self)?/,/slit\s*your/,
            /pha\s*(nat|hoai|huy)/,/giet/,/toi\s*se\s*(danh|pha|giet|hack)/,
            /tao\s*se\s*(danh|pha|giet|hack)/,/ban\s*chet/,
            /shoot\s*you/,/stab\s*you/,/hurt\s*you/,
            // ─── Hack / phá hoại ─────────────────────────────────────────
            /hack\s*(wiki|web|trang|site)/,/ddos/,/d\.?d\.?o\.?s/,
            /inject\s*sql/,/sql\s*inject/,/xss\s*attack/,/cross.?site/,
            /exploit\s*(this|that|the)/,
            // ─── Nội dung nguy hại / kích động ──────────────────────────
            /child\s*(porn|sex|abuse)/,/cp\b.*sex/,/pedo/,/lolicon/,
            /nazi/,/heil\s*hitler/,/white\s*power/,/kkk\b/,
            /jihad/,/infidel/,/allahu\s*akbar.*kill/,
            /tự\s*tử/,/tu\s*tu\b/,/treo\s*co/,/uong\s*thuoc\s*ngu/,/cat\s*(tay|co)/,
            /suicide/,/self.?harm/,/cut\s*(my)?\s*wrist/,
            // ─── Doxxing / lộ thông tin cá nhân ─────────────────────────
            /dia\s*chi\s*(nha|truong)/,/so\s*(dien\s*thoai|the\s*can)/,
            /cmnd\b/,/can\s*cuoc/,/cccd\b/,
            /home\s*address/,/phone\s*number.*of/,/social\s*security/,/ssn\b/,
            /credit\s*card\s*number/,/cvv\b.*\d{3}/,
        ];

        // ── Spam / chất lượng thấp ────────────────────────────────────────
        var SPAM = [
            /(.)\1{9,}/,                        // ký tự lặp ≥10 lần liên tiếp
            /[a-z]{40,}/,                       // chuỗi không khoảng trắng quá dài
            /(\b\w{2,}\b)(\s+\1){4,}/,          // từ lặp ≥5 lần
            /(https?:\/\/[^\s]+\s*){4,}/,       // ≥4 URL trong 1 comment (link spam)
            /[\u0300-\u036f\u1dc0-\u1dff]{5,}/, // zalgo text (combining marks stacked)
            /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/, // control characters
        ];

        var MAX_LEN = 2000;
        var MIN_LEN = 3;
        var MAX_URLS = 3;

        function countUrls(text) {
            var m = text.match(/https?:\/\/[^\s]+/g);
            return m ? m.length : 0;
        }

        function check(text) {
            if (!text || !text.trim()) return { ok: false, reason: 'Nội dung bình luận không được để trống.', severity: 'block' };
            var raw = text.trim();
            if (raw.length < MIN_LEN) return { ok: false, reason: 'Bình luận quá ngắn (tối thiểu ' + MIN_LEN + ' ký tự).', severity: 'block' };
            if (raw.length > MAX_LEN) return { ok: false, reason: 'Bình luận quá dài (tối đa ' + MAX_LEN + ' ký tự).', severity: 'block' };

            // Kiểm tra control/zalgo trên text gốc trước
            for (var si = 0; si < SPAM.length; si++) {
                if (SPAM[si].test(raw)) return { ok: false, reason: '⚠️ Nội dung bị phát hiện là spam hoặc ký tự bất thường.', severity: 'block' };
            }

            // Kiểm tra link spam
            if (countUrls(raw) > MAX_URLS) return { ok: false, reason: '⚠️ Quá nhiều liên kết trong một bình luận.', severity: 'block' };

            // Kiểm tra từ ngữ — dùng text đã normalize
            var norm = normalize(raw);
            for (var bi = 0; bi < BLOCKED.length; bi++) {
                if (BLOCKED[bi].test(norm)) return { ok: false, reason: '⚠️ Bình luận chứa từ ngữ không phù hợp hoặc vi phạm quy tắc cộng đồng.', severity: 'block' };
            }

            // Cảnh báo all-caps dài
            var alphaOnly = raw.replace(/[^a-zA-ZÀ-ỹ]/g, '');
            if (alphaOnly.length > 30 && alphaOnly === alphaOnly.toUpperCase()) {
                return { ok: true, reason: '💬 Lưu ý: Bình luận toàn chữ hoa có thể gây khó chịu cho người đọc.', severity: 'warn' };
            }

            return { ok: true, reason: null, severity: null };
        }

        return { check: check, MAX_LEN: MAX_LEN };
    })();

    // ── Ưu tiên module kiểm duyệt DÙNG CHUNG (MAPLE-Moderation) nếu đã nạp;
    //    nếu chưa có thì dùng bản nội bộ MOD_LOCAL làm fallback. ──────────────
    var MOD = {
        MAX_LEN: 2000,
        check: function (text) {
            var M = (window.MAPLE && window.MAPLE.Moderation);
            if (M && typeof M.check === 'function') {
                return M.check(text, { minLen: 3, maxLen: this.MAX_LEN });
            }
            return MOD_LOCAL.check(text);
        }
    };

    // ════════════════════════════════════════════════════════════════════════
    // Rich text renderer
    // ════════════════════════════════════════════════════════════════════════
    function renderRichText(text) {
        if (!text) return '';
        return String(text).split('\n').map(renderLine).join('\n');
    }

    function renderLine(line) {
        var result = '', remaining = line;
        var patterns = [
            { re: /^\/hr\b/, handler: function () { return '<hr class="mc-hr">'; } },
            { re: /^\/(link|image|quote|spoiler|code|bold):([^\n]*)/, handler: handleSlashToken },
            { re: /^@([\w\u00C0-\u024F\u1E00-\u1EFF]+)/, handler: function (m) {
                return '<span class="mc-mention">@' + esc(m[1]) + '</span>';
            }},
            { re: /^(https?:\/\/[^\s<>"']+)/, handler: function (m) {
                return '<a href="' + esc(m[1]) + '" target="_blank" rel="noopener">' + esc(m[1]) + '</a>';
            }},
        ];
        while (remaining.length > 0) {
            var matched = false;
            for (var i = 0; i < patterns.length; i++) {
                var m = remaining.match(patterns[i].re);
                if (m) { result += patterns[i].handler(m); remaining = remaining.slice(m[0].length); matched = true; break; }
            }
            if (!matched) { result += esc(remaining[0]); remaining = remaining.slice(1); }
        }
        return result;
    }

    function handleSlashToken(m) {
        var cmd = m[1], value = m[2].trim();
        switch (cmd) {
            case 'link': {
                var parts = value.split('|'), url = parts[0].trim(), label = parts[1] ? parts[1].trim() : url;
                return '<a href="' + esc(url) + '" target="_blank" rel="noopener" style="color:var(--mp-green,#2ea043);">🔗 ' + esc(label) + '</a>';
            }
            case 'image': return '<img class="mc-image-attach" src="' + esc(value) + '" alt="Ảnh đính kèm" loading="lazy" onerror="this.style.display=\'none\'">';
            case 'quote': return '<div class="mc-quote">' + esc(value) + '</div>';
            case 'spoiler': return '<span class="mc-spoiler" title="Click để xem nội dung ẩn"><span class="mc-spoiler-text">' + esc(value) + '</span><span class="mc-spoiler-hint"> 🙈 Spoiler — click để xem</span></span>';
            case 'code': return '<code class="mc-code">' + esc(value) + '</code>';
            case 'bold': return '<strong class="mc-bold">' + esc(value) + '</strong>';
        }
        return esc(m[0]);
    }

    // ════════════════════════════════════════════════════════════════════════
    // Type config
    // ════════════════════════════════════════════════════════════════════════
    var TYPE_CONFIG = {
        bot:     { icon: '🤖', tag: 'BOT',        cls: 'bot'    },
        admin:   { icon: '🛡️', tag: 'ADMIN',      cls: 'admin'  },
        author:  { icon: '✏️', tag: 'TÁC GIẢ',   cls: 'author' },
        user:    { icon: '👤', tag: 'NGƯỜI DÙNG', cls: 'user'   },
        anon:    { icon: '👻', tag: 'ẨN DANH',    cls: 'anon'   },
        wiki:    { icon: '🔄', tag: 'HỆ THỐNG',   cls: 'wiki'   },
        reject:  { icon: '❌', tag: 'TỪ CHỐI',    cls: 'reject' },
        approve: { icon: '✅', tag: 'ĐÃ DUYỆT',   cls: 'approve'}
    };

    // ════════════════════════════════════════════════════════════════════════
    // Page titles
    // ════════════════════════════════════════════════════════════════════════
    var QUEUE_PAGE = 'MediaWiki:Maple-Pending.json';
    function commentsPageTitle(requestId) { return 'MediaWiki:Maple-Comments-' + requestId + '.json'; }

    // ════════════════════════════════════════════════════════════════════════
    // System comments builder
    // ════════════════════════════════════════════════════════════════════════
    function buildSystemComments(item) {
        var sys = [], status = item.status || 'pending';
        if (status === 'rejected' && item.rejected_by) {
            sys.push({ id: '_sys_reject', _system: true, _sysKey: 'reject',
                type: isBot(item.rejected_by) ? 'bot' : 'reject', author: item.rejected_by,
                content: item.reason || item.reject_reason || 'Yêu cầu bị từ chối.',
                created_at: item.rejected_at || new Date().toISOString(), edited_at: null });
        }
        if (status === 'approved' && item.approved_by) {
            var pageName = item.page_name || item.created_page || '';
            sys.push({ id: '_sys_approve', _system: true, _sysKey: 'approve',
                type: 'approve', author: item.approved_by,
                content: '✅ Bài viết của bạn đã được xem xét kỹ lưỡng và chính thức được duyệt. ' +
                         'Cảm ơn bạn đã dành thời gian đóng góp cho MAPLE Wiki Việt Nam.' +
                         (pageName ? '\n\n📄 Trang đã được tạo tại: ' + pageName : ''),
                created_at: item.approved_at || new Date().toISOString(), edited_at: null,
                _page_name: pageName });
        }
        return sys;
    }

    // ════════════════════════════════════════════════════════════════════════
    // API helpers
    // ════════════════════════════════════════════════════════════════════════
    function readPage(api, title, cb) {
        api.get({ action: 'query', titles: title, prop: 'revisions', rvprop: 'content', format: 'json' })
        .done(function (data) {
            var pages = data.query.pages, page = pages[Object.keys(pages)[0]];
            if (page.missing !== undefined) return cb({ missing: true });
            var text = (page.revisions && page.revisions[0] && page.revisions[0]['*']) || '';
            cb({ missing: false, text: text });
        }).fail(function (err) { cb({ error: String(err || 'unknown') }); });
    }

    function writePage(api, title, text, summary, cb) {
        api.postWithToken('csrf', { action: 'edit', title: title, text: text, summary: summary || 'MAPLE: auto-update' })
        .done(function () { cb(true, null); })
        .fail(function (err) { cb(false, String(err || 'write error')); });
    }

    // ════════════════════════════════════════════════════════════════════════
    // AUTO-PROVISION
    // ════════════════════════════════════════════════════════════════════════
    function provision(api, cb) {
        var report = { total: 0, created: 0, patched: 0, skipped: 0, errors: [] };
        readPage(api, QUEUE_PAGE, function (res) {
            if (res.error) { report.errors.push('Không đọc được Queue: ' + res.error); return cb(report); }
            if (res.missing) { report.errors.push(QUEUE_PAGE + ' không tồn tại.'); return cb(report); }
            var queue;
            try { queue = JSON.parse(res.text); } catch (e) { report.errors.push('Parse queue thất bại: ' + e.message); return cb(report); }
            var requests = Array.isArray(queue) ? queue : (Array.isArray(queue.requests) ? queue.requests : []);
            report.total = requests.length;
            if (requests.length === 0) return cb(report);
            runSerial(requests.map(function (item) { return function (next) { provisionOne(api, item, report, next); }; }), function () { cb(report); });
        });
    }

    function provisionOne(api, item, report, done) {
        var requestId = item.request_id || item.id;
        if (!requestId) { report.errors.push('Item thiếu request_id'); return done(); }
        var title = commentsPageTitle(requestId);
        var sysComments = buildSystemComments(item);
        var status = item.status || 'pending';
        var shouldLock = (status === 'approved' || status === 'rejected');
        readPage(api, title, function (res) {
            if (res.error) { report.errors.push('[' + requestId + '] đọc lỗi: ' + res.error); return done(); }
            if (res.missing) {
                var newData = { request_id: requestId, page_name: item.page_name || '', locked: shouldLock, pinnedIds: [], reactions: {}, comments: sysComments.slice() };
                writePage(api, title, JSON.stringify(newData, null, 2), 'MAPLE: Tạo comments file cho ' + requestId,
                    function (ok, err) { if (ok) report.created++; else report.errors.push('[' + requestId + '] tạo file lỗi: ' + err); done(); });
                return;
            }
            var existing;
            try { existing = JSON.parse(res.text); } catch (e) { report.errors.push('[' + requestId + '] parse lỗi: ' + e.message); return done(); }
            if (!Array.isArray(existing.comments)) existing.comments = [];
            if (!existing.pinnedIds) existing.pinnedIds = [];
            if (!existing.reactions) existing.reactions = {};
            var missing = sysComments.filter(function (sc) { return !existing.comments.some(function (c) { return c._sysKey === sc._sysKey; }); });
            var needLockUpdate = shouldLock && !existing.locked;
            if (missing.length === 0 && !needLockUpdate) { report.skipped++; return done(); }
            missing.forEach(function (sc) { existing.comments.unshift(sc); });
            if (shouldLock) existing.locked = true;
            writePage(api, title, JSON.stringify(existing, null, 2), 'MAPLE: Bổ sung system comments cho ' + requestId,
                function (ok, err) { if (ok) report.patched++; else report.errors.push('[' + requestId + '] patch lỗi: ' + err); done(); });
        });
    }

    // ════════════════════════════════════════════════════════════════════════
    // Load / Submit helpers
    // ════════════════════════════════════════════════════════════════════════
    function loadComments(api, requestId, cb) {
        if (!requestId) return cb(null, 'Thiếu request_id');
        readPage(api, commentsPageTitle(requestId), function (res) {
            if (res.error) return cb(null, 'API lỗi: ' + res.error);
            if (res.missing) return cb({ comments: [], locked: false, pinnedIds: [], reactions: {}, _exists: false });
            var obj;
            try { obj = JSON.parse(res.text); } catch (e) { obj = {}; }
            if (!Array.isArray(obj.comments)) obj.comments = [];
            if (!obj.pinnedIds) obj.pinnedIds = [];
            if (!obj.reactions) obj.reactions = {};
            obj._exists = true;
            cb(obj);
        });
    }

    function submitComment(api, requestId, pageName, currentUser, pageOwner, commentData, cb) {
        var modResult = MOD.check(commentData.content);
        if (!modResult.ok) return cb(false, modResult.reason);

        // ─── Spam prevention & Shadow-muting ───
        var now = Date.now();
        
        // 1. Check lock
        var lockedUntil = parseInt(localStorage.getItem('maple_comments_locked_until') || '0', 10);
        if (lockedUntil && now < lockedUntil) {
            var remain = Math.ceil((lockedUntil - now) / 1000 / 60);
            return cb(false, 'Tài khoản của bạn tạm thời bị khóa đăng bình luận trong ' + remain + ' phút do vi phạm quy tắc spam.');
        }

        // 2. Load comment history from localStorage
        var history = [];
        try { history = JSON.parse(localStorage.getItem('maple_comment_history') || '[]'); } catch (e) {}
        
        // Filter history for last 60 seconds
        history = history.filter(function (h) { return now - h.ts < 60000; });

        // Check duplicate content
        var duplicates = history.filter(function (h) { return h.content === commentData.content.trim(); });
        var isDuplicateSpam = (duplicates.length >= 2); // 3rd time duplicate (2 existing + current)

        // Check frequency
        var isFrequencySpam = (history.length >= 5); // 6th comment in 1 minute

        if (isDuplicateSpam || isFrequencySpam) {
            // Escalation level
            var spamOffenses = parseInt(localStorage.getItem('maple_spam_offenses') || '0', 10) + 1;
            localStorage.setItem('maple_spam_offenses', spamOffenses);

            if (spamOffenses === 1) {
                // Lần 1: Cảnh báo nhẹ (toast/alert)
                return cb(false, '⚠️ Cảnh báo: Bạn đang gửi bình luận quá nhanh hoặc nội dung trùng lặp. Vui lòng dừng lại!');
            } else if (spamOffenses === 2) {
                // Lần 2: Khóa bình luận 10 phút
                localStorage.setItem('maple_comments_locked_until', now + 10 * 60 * 1000);
                return cb(false, '⚠️ Phát hiện hành vi spam liên tục. Tài khoản của bạn đã bị khóa tính năng bình luận trong 10 phút.');
            } else {
                // Lần 3+: Shadow-mute và gửi log cho Admin
                localStorage.setItem('maple_shadow_muted', '1');
                
                // Ghi log báo cho Admin
                var apiLog = new mw.Api();
                apiLog.get({ action: 'query', meta: 'tokens', type: 'csrf', format: 'json' }).done(function (tData) {
                    var token = tData.query && tData.query.tokens && tData.query.tokens.csrftoken;
                    if (token && token !== '+\\') {
                        apiLog.post({
                            action: 'edit',
                            title: 'Dự án:Spam_Logs',
                            summary: '[SPAM BLOCK] Phát hiện tài khoản spam: ' + currentUser,
                            appendtext: '\n* ' + new Date().toISOString() + ': Tài khoản ' + currentUser + ' bị Shadow-Muted tự động do gửi spam liên tiếp.',
                            token: token,
                            format: 'json'
                        });
                    }
                });
            }
        }

        // Add current comment to local history
        history.push({ ts: now, content: commentData.content.trim() });
        localStorage.setItem('maple_comment_history', JSON.stringify(history));

        // Determine type: anon users get 'anon', owner gets 'author', rest 'user'
        var type;
        if (isAnonUser(currentUser)) {
            type = 'anon';
        } else if (currentUser === pageOwner) {
            type = 'author';
        } else {
            type = 'user';
        }

        var title = commentsPageTitle(requestId);
        readPage(api, title, function (res) {
            if (res.error) return cb(false, 'Không thể tải: ' + res.error);
            var existing;
            if (res.missing) {
                existing = { request_id: requestId, page_name: pageName, locked: false, pinnedIds: [], reactions: {}, comments: [] };
            } else {
                try { existing = JSON.parse(res.text); } catch (e) { existing = {}; }
                if (!Array.isArray(existing.comments)) existing.comments = [];
                if (!existing.pinnedIds) existing.pinnedIds = [];
                if (!existing.reactions) existing.reactions = {};
            }
            if (existing.locked) return cb(false, 'Bình luận đã bị khóa — cuộc trò chuyện này đã kết thúc.');
            
            var isShadowMuted = localStorage.getItem('maple_shadow_muted') === '1';
            var newComment = {
                id: 'c-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
                type: type, author: currentUser,
                content: commentData.content.trim(),
                replyTo: commentData.replyTo || null,
                created_at: new Date().toISOString(), edited_at: null, deleted: false
            };
            if (isShadowMuted) {
                newComment.shadowMuted = true;
            }
            existing.comments.push(newComment);
            writePage(api, title, JSON.stringify(existing, null, 2), 'MAPLE: Comment từ ' + currentUser, function (ok, err) { cb(ok, err); });
        });
    }

    function updateReaction(api, requestId, commentId, emoji, currentUser, isLocked, cb) {
        if (isLocked) return cb(false, null, 'locked');
        var title = commentsPageTitle(requestId);
        readPage(api, title, function (res) {
            if (res.error || res.missing) return cb(false);
            var existing;
            try { existing = JSON.parse(res.text); } catch (e) { return cb(false); }
            if (existing.locked) return cb(false, null, 'locked');
            if (!existing.reactions) existing.reactions = {};
            if (!existing.reactions[commentId]) existing.reactions[commentId] = {};
            var bucket = existing.reactions[commentId];
            if (!Array.isArray(bucket[emoji])) bucket[emoji] = [];
            var idx = bucket[emoji].indexOf(currentUser);
            if (idx === -1) bucket[emoji].push(currentUser); else bucket[emoji].splice(idx, 1);
            writePage(api, title, JSON.stringify(existing, null, 2), 'MAPLE: Reaction từ ' + currentUser, function (ok) { cb(ok, existing.reactions); });
        });
    }

    function togglePin(api, requestId, commentId, cb) {
        var title = commentsPageTitle(requestId);
        readPage(api, title, function (res) {
            if (res.error || res.missing) return cb(false);
            var existing;
            try { existing = JSON.parse(res.text); } catch (e) { return cb(false); }
            if (!Array.isArray(existing.pinnedIds)) existing.pinnedIds = [];
            var idx = existing.pinnedIds.indexOf(commentId);
            if (idx === -1) existing.pinnedIds.push(commentId); else existing.pinnedIds.splice(idx, 1);
            writePage(api, title, JSON.stringify(existing, null, 2), 'MAPLE: Pin/Unpin comment', function (ok) { cb(ok, existing.pinnedIds); });
        });
    }

    function editComment(api, requestId, commentId, newContent, currentUser, isLocked, cb) {
        if (isLocked) return cb(false, 'Không thể sửa — cuộc trò chuyện đã kết thúc.');
        var modResult = MOD.check(newContent);
        if (!modResult.ok) return cb(false, modResult.reason);
        var title = commentsPageTitle(requestId);
        readPage(api, title, function (res) {
            if (res.error || res.missing) return cb(false, 'Không tải được');
            var existing;
            try { existing = JSON.parse(res.text); } catch (e) { return cb(false, 'Parse lỗi'); }
            if (existing.locked) return cb(false, 'Không thể sửa — cuộc trò chuyện đã kết thúc.');
            var c = (existing.comments || []).filter(function (x) { return x.id === commentId; })[0];
            if (!c) return cb(false, 'Không tìm thấy comment');
            if (c.author !== currentUser) return cb(false, 'Không có quyền');
            var age = Date.now() - new Date(c.created_at).getTime();
            if (age > EDIT_WINDOW_MS && !isAdmin(currentUser)) return cb(false, 'Quá 15 phút không thể sửa.');
            c.content = newContent.trim(); c.edited_at = new Date().toISOString();
            writePage(api, title, JSON.stringify(existing, null, 2), 'MAPLE: Sửa comment', function (ok, err) { cb(ok, err); });
        });
    }

    function deleteComment(api, requestId, commentId, currentUser, isLocked, cb) {
        if (isLocked) return cb(false, 'Không thể xóa — cuộc trò chuyện đã kết thúc.');
        var title = commentsPageTitle(requestId);
        readPage(api, title, function (res) {
            if (res.error || res.missing) return cb(false);
            var existing;
            try { existing = JSON.parse(res.text); } catch (e) { return cb(false); }
            if (existing.locked) return cb(false, 'Không thể xóa — cuộc trò chuyện đã kết thúc.');
            var c = (existing.comments || []).filter(function (x) { return x.id === commentId; })[0];
            if (!c) return cb(false);
            if (c.author !== currentUser && !isAdmin(currentUser)) return cb(false);
            var age = Date.now() - new Date(c.created_at).getTime();
            if (age > EDIT_WINDOW_MS && !isAdmin(currentUser)) return cb(false, 'Quá 15 phút không thể xóa.');
            c.deleted = true; c.content = '[Bình luận đã bị xóa]';
            writePage(api, title, JSON.stringify(existing, null, 2), 'MAPLE: Xóa comment', function (ok) { cb(ok); });
        });
    }

    // ════════════════════════════════════════════════════════════════════════
    // Mention candidates
    // ════════════════════════════════════════════════════════════════════════
    function getMentionCandidates(data, pageOwner) {
        var names = {};
        ((data && data.comments) || []).forEach(function (c) { if (c.author && !c._system) names[c.author] = true; });
        if (pageOwner) names[pageOwner] = true;
        return Object.keys(names);
    }

    // ════════════════════════════════════════════════════════════════════════
    // RENDER COMMENT
    // ════════════════════════════════════════════════════════════════════════
    function renderComment(c, data, currentUser, isAdminUser, isLocked) {
        if (!c) return '';
        var type     = c.type || 'user';
        var cfg      = TYPE_CONFIG[type] || TYPE_CONFIG.user;
        var isPinned = data.pinnedIds && data.pinnedIds.indexOf(c.id) !== -1;
        var isDeleted = c.deleted;
        var edited   = c.edited_at ? ' <span class="mc-edited">(sửa lúc ' + fmtDate(c.edited_at) + ')</span>' : '';

        var bodyHtml;
        if (isDeleted) {
            bodyHtml = '<em style="color:var(--mp-muted,#484f58);">[Bình luận đã bị xóa]</em>';
        } else if (type === 'approve' && c._page_name) {
            var contentHtml = renderRichText(c.content || '');
            var pageUrl = (typeof mw !== 'undefined' && mw.util) ? mw.util.getUrl(c._page_name) : '/wiki/' + encodeURIComponent(c._page_name);
            contentHtml = contentHtml.replace(esc(c._page_name), '<a href="' + esc(pageUrl) + '" style="color:var(--mp-green,#2ea043);">' + esc(c._page_name) + '</a>');
            bodyHtml = contentHtml;
        } else {
            bodyHtml = renderRichText(c.content || '');
        }

        var replyRefHtml = '';
        if (c.replyTo && c.replyTo.author) {
            replyRefHtml = '<div class="mc-reply-ref">↩ Trả lời <strong>' + esc(c.replyTo.author) + '</strong>: ' +
                           esc((c.replyTo.snippet || '').slice(0, 80)) + (c.replyTo.snippet && c.replyTo.snippet.length > 80 ? '…' : '') + '</div>';
        }

        // Reactions — disabled visually when locked
        var reactions = (data.reactions && data.reactions[c.id]) || {};
        var reactionsHtml = '<div class="mc-reactions">';
        REACTIONS_LIST.forEach(function (emoji) {
            var users  = Array.isArray(reactions[emoji]) ? reactions[emoji] : [];
            var count  = users.length;
            var active = users.indexOf(currentUser) !== -1 ? ' active' : '';
            var dis    = isLocked ? ' disabled title="Cuộc trò chuyện đã kết thúc"' : ' title="' + esc(users.slice(0,5).join(', ')) + '"';
            reactionsHtml += '<button class="mc-reaction-btn' + active + '"' + dis +
                             ' data-comment-id="' + esc(c.id) + '" data-emoji="' + esc(emoji) + '">' +
                             emoji + (count > 0 ? ' <span class="cnt">' + count + '</span>' : '') + '</button>';
        });
        reactionsHtml += '</div>';

        var actionsHtml = '';
        if (!isDeleted && !c._system) {
            if (!isLocked) {
                actionsHtml += '<button class="mc-act-btn reply-btn" data-comment-id="' + esc(c.id) + '" data-author="' + esc(c.author) + '" data-snippet="' + esc((c.content || '').slice(0, 100)) + '">↩ Trả lời</button>';
            }
            var age = Date.now() - new Date(c.created_at).getTime();
            var canEdit   = !isLocked && (c.author === currentUser) && (age <= EDIT_WINDOW_MS || isAdminUser);
            var canDelete = !isLocked && ((c.author === currentUser && (age <= EDIT_WINDOW_MS || isAdminUser)) || isAdminUser);
            if (canEdit)   actionsHtml += '<button class="mc-act-btn edit-btn" data-comment-id="' + esc(c.id) + '" data-content="' + esc(c.content) + '">✏️ Sửa</button>';
            if (canDelete) actionsHtml += '<button class="mc-act-btn del delete-btn" data-comment-id="' + esc(c.id) + '">🗑️ Xóa</button>';
        }
        if (isAdminUser && !c._system && !isLocked) {
            var pinLabel = isPinned ? '📌 Bỏ ghim' : '📌 Ghim';
            actionsHtml += '<button class="mc-act-btn pin-act pin-btn" data-comment-id="' + esc(c.id) + '">' + pinLabel + '</button>';
        }

        var editAreaHtml = (!c._system && !isLocked) ? [
            '<div class="mc-edit-area" data-edit-for="' + esc(c.id) + '">',
            '  <textarea class="mc-edit-textarea"></textarea>',
            '  <div class="mc-edit-bar">',
            '    <button class="mc-edit-save" data-comment-id="' + esc(c.id) + '">💾 Lưu</button>',
            '    <button class="mc-edit-cancel" data-comment-id="' + esc(c.id) + '">Hủy</button>',
            '  </div>',
            '</div>',
        ].join('\n') : '';

        var replyFormHtml = (!c._system && !isLocked) ? [
            '<div class="mc-reply-form" data-reply-for="' + esc(c.id) + '">',
            '  <textarea placeholder="Trả lời ' + esc(c.author) + '…"></textarea>',
            '  <div class="mc-reply-bar">',
            '    <button class="mc-reply-send" data-reply-to-id="' + esc(c.id) + '" data-reply-to-author="' + esc(c.author) + '" data-reply-snippet="' + esc((c.content || '').slice(0, 100)) + '">↩ Gửi trả lời</button>',
            '    <button class="mc-reply-cancel" data-reply-for="' + esc(c.id) + '">Hủy</button>',
            '  </div>',
            '</div>',
        ].join('\n') : '';

        var isReply = !!(c.replyTo && c.replyTo.id);
        var classes = ['mc-comment', 'type-' + type, isPinned ? 'pinned' : '', isDeleted ? 'deleted' : '', isReply ? 'is-reply' : ''].filter(Boolean).join(' ');

        return [
            '<div class="' + classes + '" data-id="' + esc(c.id) + '">',
            isPinned ? '  <div style="margin-bottom:6px;"><span class="mc-pin-badge">📌 GHIM</span></div>' : '',
            '  <div class="mc-comment-header">',
            '    <div class="mc-avatar ' + cfg.cls + '">' + cfg.icon + '</div>',
            '    <div class="mc-meta">',
            '      <div class="mc-author ' + cfg.cls + '">' + esc(c.author || '—') + '</div>',
            '      <div class="mc-time">' + fmtDate(c.created_at) + edited + '</div>',
            '    </div>',
            '    <span class="mc-tag ' + cfg.cls + '">' + cfg.tag + '</span>',
            '  </div>',
            replyRefHtml,
            '  <div class="mc-body">' + bodyHtml + '</div>',
            editAreaHtml,
            '  <div class="mc-actions">',
            '    ' + reactionsHtml,
            '    ' + actionsHtml,
            '  </div>',
            replyFormHtml,
            '</div>',
        ].filter(function (x) { return x !== ''; }).join('\n');
    }

    // ════════════════════════════════════════════════════════════════════════
    // RENDER LIST — với collapsible reply groups
    // ════════════════════════════════════════════════════════════════════════
    function renderList(data, currentUser, isAdminUser, isLocked) {
        var comments  = (data && data.comments) || [];
        var pinnedIds = (data && data.pinnedIds) || [];

        // Filter out shadow-muted comments if not the author or admin
        comments = comments.filter(function (c) {
            if (c.shadowMuted) {
                return (c.author === currentUser || isAdminUser);
            }
            return true;
        });

        if (comments.length === 0) {
            return '<div class="mc-empty"><div class="mc-empty-icon">💬</div>Chưa có bình luận nào</div>';
        }

        // Tách root (không replyTo) và replies (có replyTo)
        var roots   = comments.filter(function (c) { return !c.replyTo || !c.replyTo.id; });
        var replies = comments.filter(function (c) { return !!(c.replyTo && c.replyTo.id); });

        // Build map: parentId → [reply, ...]
        var replyMap = {};
        replies.forEach(function (c) {
            var pid = c.replyTo.id;
            if (!replyMap[pid]) replyMap[pid] = [];
            replyMap[pid].push(c);
        });

        // Sort: pinned first, then chronological
        var pinned  = roots.filter(function (c) { return pinnedIds.indexOf(c.id) !== -1; });
        var regular = roots.filter(function (c) { return pinnedIds.indexOf(c.id) === -1; });
        var sorted  = pinned.concat(regular);

        var parts = sorted.map(function (root) {
            var rootHtml   = renderComment(root, data, currentUser, isAdminUser, isLocked);
            var children   = replyMap[root.id] || [];
            if (children.length === 0) return rootHtml;

            var childrenHtml = children.map(function (child) {
                return renderComment(child, data, currentUser, isAdminUser, isLocked);
            }).join('\n');

            return [
                rootHtml,
                '<div class="mc-reply-group">',
                '  <button class="mc-reply-toggle" data-for="' + esc(root.id) + '">',
                '    <span class="arrow">▾</span>',
                '    <span class="lbl">' + children.length + ' trả lời</span>',
                '  </button>',
                '  <div class="mc-reply-children" data-children-for="' + esc(root.id) + '">',
                childrenHtml,
                '  </div>',
                '</div>',
            ].join('\n');
        });

        return '<div class="mc-wrap' + (isLocked ? ' mc-locked-wrap' : '') + '">' + parts.join('\n') + '</div>';
    }

    // ════════════════════════════════════════════════════════════════════════
    // Render form (với anonymous name row)
    // ════════════════════════════════════════════════════════════════════════
    function renderForm(commentType, isAnon, currentUser) {
        var placeholder = commentType === 'author'
            ? 'Thêm ghi chú cho admin… (Dùng @ để tag, / để lệnh đặc biệt)'
            : 'Viết bình luận… Dùng @ để tag người dùng, / để xem lệnh đặc biệt';

        var anonRow = isAnon ? [
            '<div class="mc-anon-row">',
            '  <span class="mc-anon-label">Tên hiển thị:</span>',
            '  <input class="mc-anon-input" type="text" maxlength="30" placeholder="Nhập tên (tùy chọn)" value="">',
            '  <span class="mc-anon-id">ID: ' + esc(currentUser.replace('Ẩn danh#', '')) + '</span>',
            '</div>',
        ].join('\n') : '';

        return [
            '<div class="mc-form">',
            '  <div class="mc-form-tabs">',
            '    <button class="mc-tab active" data-tab="write">✏️ VIẾT</button>',
            '    <button class="mc-tab" data-tab="preview">👁 XEM TRƯỚC</button>',
            '  </div>',
            anonRow,
            '  <div class="mc-form-body">',
            '    <textarea class="mc-textarea" placeholder="' + esc(placeholder) + '" maxlength="' + MOD.MAX_LEN + '"></textarea>',
            '    <div class="mc-preview-pane"></div>',
            '  </div>',
            '  <div class="mc-char-count">0 / ' + MOD.MAX_LEN + '</div>',
            '  <div class="mc-hint-bar">',
            '    <span><kbd>@</kbd> tag người dùng</span>',
            '    <span><kbd>/link:URL</kbd> đính kèm</span>',
            '    <span><kbd>/image:URL</kbd> ảnh</span>',
            '    <span><kbd>/quote:...</kbd> trích dẫn</span>',
            '    <span><kbd>/spoiler:...</kbd> ẩn nội dung</span>',
            '    <span><kbd>/code:...</kbd> code</span>',
            '  </div>',
            '  <div class="mc-mod-hint" style="display:none;"></div>',
            '  <br>',
            '  <button class="mc-submit" data-type="' + esc(commentType) + '">💬 Gửi bình luận</button>',
            '  <div class="mc-status"></div>',
            '</div>',
        ].join('\n');
    }

    function renderLocked() {
        return '<div class="mc-locked">🔒 <span>Cuộc trò chuyện đã kết thúc — mọi tương tác đã bị khóa.</span></div>';
    }

    // ════════════════════════════════════════════════════════════════════════
    // Spoiler + Lightbox
    // ════════════════════════════════════════════════════════════════════════
    function bindSpoilers(container) {
        container.addEventListener('click', function (e) {
            var sp = e.target.closest && e.target.closest('.mc-spoiler');
            if (sp) sp.classList.toggle('revealed');
        });
    }

    function bindLightbox(container) {
        container.addEventListener('click', function (e) {
            if (e.target.classList.contains('mc-image-attach')) {
                var lb = document.createElement('div'); lb.className = 'mc-lightbox';
                var img = document.createElement('img'); img.src = e.target.src;
                lb.appendChild(img);
                lb.addEventListener('click', function () { document.body.removeChild(lb); });
                document.body.appendChild(lb);
            }
        });
    }

    // ════════════════════════════════════════════════════════════════════════
    // Collapsible reply toggle
    // ════════════════════════════════════════════════════════════════════════
    function bindReplyToggles(container) {
        container.querySelectorAll('.mc-reply-toggle').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id       = btn.getAttribute('data-for');
                var children = container.querySelector('.mc-reply-children[data-children-for="' + id + '"]');
                if (!children) return;
                var collapsed = children.classList.toggle('hidden');
                btn.classList.toggle('collapsed', collapsed);
                var lbl = btn.querySelector('.lbl');
                if (lbl) {
                    var count = children.querySelectorAll('.mc-comment').length;
                    lbl.textContent = collapsed ? ('Hiện ' + count + ' trả lời') : (count + ' trả lời');
                }
            });
        });
    }

    // ════════════════════════════════════════════════════════════════════════
    // Dropdown helpers (unchanged logic, same as v4.0)
    // ════════════════════════════════════════════════════════════════════════
    function createSlashMenu(textarea, onSelect) {
        var menu = null, focusIdx = 0;
        function getQuery() { var m = textarea.value.slice(0, textarea.selectionStart).match(/\/(\w*)$/); return m ? m[1].toLowerCase() : null; }
        function getItems(q) { return q === null ? [] : SLASH_COMMANDS.filter(function (c) { return c.cmd.startsWith(q) || c.name.toLowerCase().indexOf(q) !== -1; }); }
        function destroyMenu() { if (menu && menu.parentNode) menu.parentNode.removeChild(menu); menu = null; }
        function render(items) {
            destroyMenu(); if (!items.length) return; focusIdx = 0;
            menu = document.createElement('div'); menu.className = 'mc-slash-menu';
            items.forEach(function (item, i) {
                var el = document.createElement('div'); el.className = 'mc-slash-item' + (i === 0 ? ' focused' : '');
                el.innerHTML = '<span class="mc-slash-icon">' + item.icon + '</span><div><div class="mc-slash-name">' + esc(item.name) + '</div><div class="mc-slash-desc">' + esc(item.desc) + '</div></div>';
                el.addEventListener('mousedown', function (e) { e.preventDefault(); select(item); });
                menu.appendChild(el);
            });
            textarea.parentNode.appendChild(menu);
        }
        function select(item) {
            var pos = textarea.selectionStart, before = textarea.value.slice(0, pos), after = textarea.value.slice(pos);
            var nb = before.replace(/\/\w*$/, '/' + item.cmd + (item.cmd === 'hr' ? '' : ':'));
            textarea.value = nb + after; textarea.setSelectionRange(nb.length, nb.length);
            destroyMenu(); textarea.focus(); if (onSelect) onSelect();
        }
        function update() { var q = getQuery(); render(getItems(q)); if (q === null) destroyMenu(); }
        function onKeydown(e) {
            if (!menu) return;
            var items = menu.querySelectorAll('.mc-slash-item');
            if (e.key === 'ArrowDown') { e.preventDefault(); focusIdx = (focusIdx + 1) % items.length; items.forEach(function (el, i) { el.classList.toggle('focused', i === focusIdx); }); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); focusIdx = (focusIdx - 1 + items.length) % items.length; items.forEach(function (el, i) { el.classList.toggle('focused', i === focusIdx); }); }
            else if (e.key === 'Enter' || e.key === 'Tab') { var f = menu.querySelector('.mc-slash-item.focused'); if (f) { e.preventDefault(); f.dispatchEvent(new MouseEvent('mousedown')); } }
            else if (e.key === 'Escape') destroyMenu();
        }
        textarea.addEventListener('input', update); textarea.addEventListener('keydown', onKeydown);
        textarea.addEventListener('blur', function () { setTimeout(destroyMenu, 150); });
        return { destroy: destroyMenu };
    }

    function createMentionMenu(textarea, candidates, onSelect) {
        var menu = null, focusIdx = 0;
        function getQuery() { var m = textarea.value.slice(0, textarea.selectionStart).match(/@([\w\u00C0-\u024F\u1E00-\u1EFF]*)$/); return m ? m[1].toLowerCase() : null; }
        function getItems(q) { return q === null ? [] : candidates.filter(function (n) { return n.toLowerCase().startsWith(q); }).slice(0, 8); }
        function destroyMenu() { if (menu && menu.parentNode) menu.parentNode.removeChild(menu); menu = null; }
        function render(items) {
            destroyMenu(); if (!items.length) return; focusIdx = 0;
            menu = document.createElement('div'); menu.className = 'mc-mention-menu';
            items.forEach(function (name, i) {
                var el = document.createElement('div'); el.className = 'mc-mention-item' + (i === 0 ? ' focused' : '');
                el.innerHTML = '<div class="mc-mention-avatar">' + esc(name[0].toUpperCase()) + '</div><div class="mc-mention-name">' + esc(name) + '</div>';
                el.addEventListener('mousedown', function (e) { e.preventDefault(); select(name); });
                menu.appendChild(el);
            });
            textarea.parentNode.appendChild(menu);
        }
        function select(name) {
            var pos = textarea.selectionStart, before = textarea.value.slice(0, pos), after = textarea.value.slice(pos);
            var nb = before.replace(/@[\w\u00C0-\u024F\u1E00-\u1EFF]*$/, '@' + name + ' ');
            textarea.value = nb + after; textarea.setSelectionRange(nb.length, nb.length);
            destroyMenu(); textarea.focus(); if (onSelect) onSelect();
        }
        function update() { var q = getQuery(); render(getItems(q)); if (q === null) destroyMenu(); }
        function onKeydown(e) {
            if (!menu) return;
            var items = menu.querySelectorAll('.mc-mention-item');
            if (e.key === 'ArrowDown') { e.preventDefault(); focusIdx = (focusIdx + 1) % items.length; items.forEach(function (el, i) { el.classList.toggle('focused', i === focusIdx); }); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); focusIdx = (focusIdx - 1 + items.length) % items.length; items.forEach(function (el, i) { el.classList.toggle('focused', i === focusIdx); }); }
            else if (e.key === 'Enter' || e.key === 'Tab') { var f = menu.querySelector('.mc-mention-item.focused'); if (f) { e.preventDefault(); f.dispatchEvent(new MouseEvent('mousedown')); } }
            else if (e.key === 'Escape') destroyMenu();
        }
        textarea.addEventListener('input', update); textarea.addEventListener('keydown', onKeydown);
        textarea.addEventListener('blur', function () { setTimeout(destroyMenu, 150); });
        return { destroy: destroyMenu };
    }

    // ════════════════════════════════════════════════════════════════════════
    // CLASS MAPLEComments
    // ════════════════════════════════════════════════════════════════════════
    function MAPLEComments(opts) {
        this.api           = opts.api;
        this.requestId     = opts.requestId;
        this.item          = opts.item;
        this.container     = opts.container;
        this.currentUser   = resolveCurrentUser(opts.currentUser);
        this.pageOwner     = opts.pageOwner;
        this.onCountChange = opts.onCountChange || null;
        this.autoProvision = opts.autoProvision !== false;
        this._data         = null;
        this._isAdmin      = isAdmin(this.currentUser);
        this._isAnon       = isAnonUser(this.currentUser);
    }

    MAPLEComments.prototype.init = function () {
        injectCSS(); this._renderLoading();
        if (this.autoProvision) this._provisionSingleThenLoad(); else this._load();
    };

    MAPLEComments.prototype.reload = function () { this._renderLoading(); this._provisionSingleThenLoad(); };

    MAPLEComments.prototype._renderLoading = function () {
        this.container.innerHTML = '<div style="text-align:center;padding:32px;color:var(--mp-muted,#484f58);font-size:11px;"><span class="mc-spin"></span>Đang tải bình luận…</div>';
    };

    MAPLEComments.prototype._provisionSingleThenLoad = function () {
        var self = this, item = this.item, status = (item || {}).status || 'pending';
        var sysComments = buildSystemComments(item);
        if (sysComments.length === 0) return self._load();
        var title = commentsPageTitle(self.requestId);
        var shouldLock = (status === 'approved' || status === 'rejected');
        readPage(self.api, title, function (res) {
            if (res.error) return self._load();
            if (res.missing) {
                var newData = { request_id: self.requestId, page_name: item.page_name || '', locked: shouldLock, pinnedIds: [], reactions: {}, comments: sysComments.slice() };
                writePage(self.api, title, JSON.stringify(newData, null, 2), 'MAPLE: Tạo comments file cho ' + self.requestId, function () { self._load(); });
                return;
            }
            var existing;
            try { existing = JSON.parse(res.text); } catch (e) { existing = {}; }
            if (!Array.isArray(existing.comments)) existing.comments = [];
            if (!existing.pinnedIds) existing.pinnedIds = [];
            if (!existing.reactions) existing.reactions = {};
            var missing = sysComments.filter(function (sc) { return !existing.comments.some(function (c) { return c._sysKey === sc._sysKey; }); });
            var needLockUpdate = shouldLock && !existing.locked;
            if (missing.length === 0 && !needLockUpdate) return self._load();
            missing.forEach(function (sc) { existing.comments.unshift(sc); });
            if (shouldLock) existing.locked = true;
            writePage(self.api, title, JSON.stringify(existing, null, 2), 'MAPLE: Bổ sung system comments cho ' + self.requestId, function () { self._load(); });
        });
    };

    MAPLEComments.prototype._load = function () {
        var self = this;
        loadComments(this.api, this.requestId, function (data, err) {
            if (err || !data) {
                self.container.innerHTML = '<div class="mc-empty"><div class="mc-empty-icon">⚠️</div>' + esc(err || 'Lỗi tải bình luận') + '</div>';
                return;
            }
            self._data = data;
            self._render();
        });
    };

    MAPLEComments.prototype._isLocked = function () {
        var status = (this.item || {}).status || 'pending';
        return !!(this._data && this._data.locked) || status === 'approved' || status === 'rejected';
    };

    MAPLEComments.prototype._render = function () {
        var data        = this._data;
        var isLocked    = this._isLocked();
        var commentType = this._isAnon ? 'anon' : ((this.currentUser === this.pageOwner) ? 'author' : 'user');
        var candidates  = getMentionCandidates(data, this.pageOwner);

        this._notifyCount(data);

        this.container.innerHTML =
            renderList(data, this.currentUser, this._isAdmin, isLocked) +
            (isLocked ? renderLocked() : renderForm(commentType, this._isAnon, this.currentUser));

        bindSpoilers(this.container);
        bindLightbox(this.container);
        bindReplyToggles(this.container);

        if (!isLocked) this._bindForm(candidates);
        this._bindActions(isLocked);
    };

    MAPLEComments.prototype._notifyCount = function (data) {
        if (!this.onCountChange) return;
        this.onCountChange(((data && data.comments) || []).length);
    };

    // ────────────────────────────────────────────────────────────────────────
    // Bind main form
    // ────────────────────────────────────────────────────────────────────────
    MAPLEComments.prototype._bindForm = function (candidates) {
        var self      = this;
        var container = this.container;
        var btn       = container.querySelector('.mc-submit');
        var textarea  = container.querySelector('.mc-textarea');
        var statusEl  = container.querySelector('.mc-status');
        var charEl    = container.querySelector('.mc-char-count');
        var hintEl    = container.querySelector('.mc-mod-hint');
        var preview   = container.querySelector('.mc-preview-pane');
        var anonInput = container.querySelector('.mc-anon-input');
        if (!btn || !textarea) return;

        if (typeof window.MAPLE !== 'undefined' && window.MAPLE.getUserStatus) {
            window.MAPLE.getUserStatus(function (status) {
                var isSysop = status.groups && (status.groups.indexOf('sysop') !== -1 || status.groups.indexOf('founder') !== -1 || status.groups.indexOf('interface-admin') !== -1 || status.groups.indexOf('reviewer') !== -1);
                var isWriter = status.groups && status.groups.indexOf('writer') !== -1;
                var bypass = isSysop;

                var ageOk = status.accountAgeDays >= 7 || isWriter;
                var emailOk = status.emailVerified;

                if (!status.isLoggedIn) {
                    textarea.disabled = true;
                    textarea.placeholder = '🔒 Bạn cần đăng nhập để bình luận.';
                    btn.disabled = true;
                    return;
                }

                if (!bypass && (!emailOk || !ageOk)) {
                    textarea.disabled = true;
                    textarea.value = '';
                    var reasons = [];
                    if (!emailOk) reasons.push('Xác thực Email (Thiếu)');
                    if (!ageOk) reasons.push('Tuổi nick ≥ 7 ngày (Thiếu)');
                    textarea.placeholder = '🔒 Bình luận đang khóa. Yêu cầu: ' + reasons.join(' & ') + '. Vào Trang cá nhân để kiểm tra.';
                    btn.disabled = true;
                }
            });
        }

        // Tabs
        container.querySelectorAll('.mc-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                container.querySelectorAll('.mc-tab').forEach(function (t) { t.classList.remove('active'); });
                tab.classList.add('active');
                var isPreview = tab.getAttribute('data-tab') === 'preview';
                textarea.style.display = isPreview ? 'none' : '';
                preview.classList.toggle('active', isPreview);
                if (isPreview) preview.innerHTML = renderRichText(textarea.value) || '<em style="color:var(--mp-muted,#484f58)">Chưa có nội dung…</em>';
            });
        });

        createSlashMenu(textarea, function () { textarea.dispatchEvent(new Event('input')); });
        createMentionMenu(textarea, candidates, function () { textarea.dispatchEvent(new Event('input')); });

        textarea.addEventListener('focus', function () {
            mw.hook('maple.feature.first_use').fire({ feature: 'comments' });
        });

        // Char count + moderation
        textarea.addEventListener('input', function () {
            var len = textarea.value.length;
            charEl.textContent = len + ' / ' + MOD.MAX_LEN;
            charEl.className = 'mc-char-count' + (len > MOD.MAX_LEN * 0.9 ? ' warn' : '') + (len >= MOD.MAX_LEN ? ' over' : '');
            if (len > 0) {
                var res = MOD.check(textarea.value);
                if (!res.ok && res.severity === 'block') {
                    textarea.classList.add('mod-flagged'); hintEl.textContent = res.reason; hintEl.style.display = 'block'; btn.disabled = true;
                } else if (res.severity === 'warn') {
                    textarea.classList.remove('mod-flagged'); hintEl.textContent = res.reason; hintEl.style.display = 'block'; btn.disabled = false;
                } else {
                    textarea.classList.remove('mod-flagged'); hintEl.style.display = 'none'; btn.disabled = false;
                }
            } else {
                textarea.classList.remove('mod-flagged'); hintEl.style.display = 'none'; btn.disabled = false;
            }
        });

        // Resolve actual author name (anon may have custom display name)
        function resolveAuthor() {
            if (!self._isAnon) return self.currentUser;
            var custom = anonInput ? anonInput.value.trim() : '';
            if (custom) return 'Ẩn danh(' + custom + ')#' + getAnonId();
            return self.currentUser; // default "Ẩn danh#XXXX"
        }

        btn.addEventListener('click', function () {
            var content = textarea.value.trim();
            var modResult = MOD.check(content);
            if (!modResult.ok) { statusEl.textContent = modResult.reason; statusEl.className = 'mc-status err'; textarea.classList.add('mod-flagged'); return; }
            btn.disabled = true; statusEl.textContent = 'Đang gửi…'; statusEl.className = 'mc-status'; hintEl.style.display = 'none';
            var author = resolveAuthor();
            submitComment(self.api, self.requestId, self.item.page_name, author, self.pageOwner,
                { type: btn.getAttribute('data-type'), content: content },
                function (ok, err) {
                    if (ok) {
                        textarea.value = ''; charEl.textContent = '0 / ' + MOD.MAX_LEN; charEl.className = 'mc-char-count';
                        statusEl.textContent = '✅ Đã gửi thành công!'; statusEl.className = 'mc-status ok'; btn.disabled = false;
                        
                        // Trigger achievements & RP for comments
                        if (window.MAPLE && window.MAPLE.ach && !self._isAnon) {
                            window.MAPLE.award('first_comment');
                            window.MAPLE.ach.rpAdd(2, 'comment', 10, 'Đăng bình luận ✓');
                            var stats = window.MAPLE.ach.data().stats || {};
                            stats.totalComments = (stats.totalComments || 0) + 1;
                            if (stats.totalComments >= 100) window.MAPLE.award('chatter');
                        }

                        self._load();
                    } else { statusEl.textContent = '❌ ' + (err || 'Lỗi không xác định.'); statusEl.className = 'mc-status err'; btn.disabled = false; }
                }
            );
        });
    };

    // ────────────────────────────────────────────────────────────────────────
    // Bind action buttons
    // ────────────────────────────────────────────────────────────────────────
    MAPLEComments.prototype._bindActions = function (isLocked) {
        var self      = this;
        var container = this.container;

        // Reactions — short circuit if locked
        container.querySelectorAll('.mc-reaction-btn').forEach(function (btn) {
            if (isLocked) { btn.disabled = true; return; }
            btn.addEventListener('click', function () {
                var cid = btn.getAttribute('data-comment-id'), emoji = btn.getAttribute('data-emoji');
                btn.disabled = true;
                updateReaction(self.api, self.requestId, cid, emoji, self.currentUser, false, function (ok, reactions) {
                    if (ok) {
                        self._data.reactions = reactions;
                        var commentEl = container.querySelector('.mc-comment[data-id="' + cid + '"]');
                        if (commentEl) {
                            var reactEl = commentEl.querySelector('.mc-reactions');
                            if (reactEl) {
                                var bucket = (reactions && reactions[cid]) || {};
                                var newHtml = '';
                                REACTIONS_LIST.forEach(function (em) {
                                    var users = Array.isArray(bucket[em]) ? bucket[em] : [];
                                    var cnt   = users.length;
                                    var act   = users.indexOf(self.currentUser) !== -1 ? ' active' : '';
                                    newHtml += '<button class="mc-reaction-btn' + act + '" data-comment-id="' + esc(cid) + '" data-emoji="' + esc(em) + '" title="' + esc(users.slice(0,5).join(', ')) + '">' + em + (cnt > 0 ? ' <span class="cnt">' + cnt + '</span>' : '') + '</button>';
                                });
                                reactEl.innerHTML = newHtml;
                                reactEl.querySelectorAll('.mc-reaction-btn').forEach(function (b) {
                                    b.addEventListener('click', function () {
                                        var c2 = b.getAttribute('data-comment-id'), e2 = b.getAttribute('data-emoji');
                                        b.disabled = true;
                                        updateReaction(self.api, self.requestId, c2, e2, self.currentUser, false, function (ok2, r2) { if (ok2) self._data.reactions = r2; b.disabled = false; });
                                    });
                                });
                            }
                        }
                    }
                    btn.disabled = false;
                });
            });
        });

        if (isLocked) return; // All write actions blocked below this point

        // Reply toggle
        container.querySelectorAll('.reply-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var cid  = btn.getAttribute('data-comment-id');
                var form = container.querySelector('.mc-reply-form[data-reply-for="' + cid + '"]');
                if (!form) return;
                var isOpen = form.classList.contains('open');
                container.querySelectorAll('.mc-reply-form.open').forEach(function (f) { f.classList.remove('open'); });
                if (!isOpen) form.classList.add('open');
            });
        });

        container.querySelectorAll('.mc-reply-cancel').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var form = container.querySelector('.mc-reply-form[data-reply-for="' + btn.getAttribute('data-reply-for') + '"]');
                if (form) form.classList.remove('open');
            });
        });

        container.querySelectorAll('.mc-reply-send').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var replyToId = btn.getAttribute('data-reply-to-id'), replyToAuthor = btn.getAttribute('data-reply-to-author'), snippet = btn.getAttribute('data-reply-snippet');
                var form = container.querySelector('.mc-reply-form[data-reply-for="' + replyToId + '"]');
                if (!form) return;
                var ta = form.querySelector('textarea'), content = ta ? ta.value.trim() : '';
                var modRes = MOD.check(content);
                if (!modRes.ok) { alert(modRes.reason); return; }
                btn.disabled = true;
                submitComment(self.api, self.requestId, self.item.page_name, self.currentUser, self.pageOwner,
                    { type: self._isAnon ? 'anon' : (self.currentUser === self.pageOwner ? 'author' : 'user'), content: content, replyTo: { id: replyToId, author: replyToAuthor, snippet: snippet } },
                    function (ok, err) {
                        btn.disabled = false;
                        if (ok) {
                            // Trigger achievements & RP for reply comment
                            if (window.MAPLE && window.MAPLE.ach && !self._isAnon) {
                                window.MAPLE.award('first_comment');
                                window.MAPLE.ach.rpAdd(2, 'comment', 10, 'Đăng trả lời bình luận ✓');
                                var stats = window.MAPLE.ach.data().stats || {};
                                stats.totalComments = (stats.totalComments || 0) + 1;
                                if (stats.totalComments >= 100) window.MAPLE.award('chatter');
                            }
                            self._load();
                        } else {
                            alert(err || 'Lỗi gửi trả lời.');
                        }
                    }
                );
            });
        });

        container.querySelectorAll('.edit-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var cid = btn.getAttribute('data-comment-id'), content = btn.getAttribute('data-content');
                var area = container.querySelector('.mc-edit-area[data-edit-for="' + cid + '"]');
                if (!area) return;
                var ta = area.querySelector('.mc-edit-textarea'); if (ta) ta.value = content;
                area.classList.add('open'); if (ta) ta.focus();
            });
        });

        container.querySelectorAll('.mc-edit-cancel').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var area = container.querySelector('.mc-edit-area[data-edit-for="' + btn.getAttribute('data-comment-id') + '"]');
                if (area) area.classList.remove('open');
            });
        });

        container.querySelectorAll('.mc-edit-save').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var cid = btn.getAttribute('data-comment-id');
                var area = container.querySelector('.mc-edit-area[data-edit-for="' + cid + '"]');
                if (!area) return;
                var ta = area.querySelector('.mc-edit-textarea'), content = ta ? ta.value.trim() : '';
                btn.disabled = true;
                editComment(self.api, self.requestId, cid, content, self.currentUser, false, function (ok, err) { btn.disabled = false; if (ok) self._load(); else alert(err || 'Lỗi sửa bình luận.'); });
            });
        });

        container.querySelectorAll('.delete-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (!confirm('Xóa bình luận này?')) return;
                var cid = btn.getAttribute('data-comment-id'); btn.disabled = true;
                deleteComment(self.api, self.requestId, cid, self.currentUser, false, function (ok, err) { btn.disabled = false; if (ok) self._load(); else alert(err || 'Lỗi xóa bình luận.'); });
            });
        });

        container.querySelectorAll('.pin-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var cid = btn.getAttribute('data-comment-id'); btn.disabled = true;
                togglePin(self.api, self.requestId, cid, function (ok, pinnedIds) { btn.disabled = false; if (ok) { self._data.pinnedIds = pinnedIds; self._render(); } });
            });
        });
    };

    // ════════════════════════════════════════════════════════════════════════
    // Static API
    // ════════════════════════════════════════════════════════════════════════
    MAPLEComments.provision           = provision;
    MAPLEComments.load                = loadComments;
    MAPLEComments.renderList          = renderList;
    MAPLEComments.buildSystemComments = buildSystemComments;
    MAPLEComments.renderRichText      = renderRichText;
    MAPLEComments.mod                 = MOD;
    MAPLEComments.QUEUE_PAGE          = QUEUE_PAGE;
    MAPLEComments.commentsPageTitle   = commentsPageTitle;
    MAPLEComments.resolveCurrentUser  = resolveCurrentUser;
    MAPLEComments.countFor            = function (item, data) { return ((data && data.comments) || []).length; };

    global.MAPLEComments = MAPLEComments;
    if (typeof mw !== 'undefined') mw.hook('maple.comments.ready').fire();

})(
    typeof mediaWiki !== 'undefined' ? mediaWiki : { hook: function () { return { fire: function () {} }; } },
    typeof jQuery !== 'undefined' ? jQuery : {},
    window
);

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * CHANGELOG v4.1
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ── 1. NGƯỜI DÙNG ẨN DANH ─────────────────────────────────────────────────
 *   Ai không đăng nhập (currentUser = null / '0' / rỗng) vẫn bình luận được.
 *   Tên tự động: "Ẩn danh#XXXX" (XXXX = ID 4 ký tự lưu localStorage).
 *   Tùy chọn: trong form có ô nhập "Tên hiển thị" để đặt tên riêng
 *   → hiển thị dạng "Ẩn danh(Tên)#XXXX".
 *   Badge tag: ẨN DANH (màu tím nhạt, icon 👻).
 *   Cách khởi tạo: currentUser có thể truyền null/undefined/'' —
 *     resolveCurrentUser() tự xử lý.
 *
 * ── 2. REPLY CÓ THỂ THU GỌN ───────────────────────────────────────────────
 *   Sau mỗi comment gốc có reply, hiện nút "▾ N trả lời".
 *   Click → thu gọn toàn bộ reply (hidden), nút đổi thành "Hiện N trả lời".
 *   Click lại → mở rộng.
 *   Reply riêng lẻ vẫn giữ indent + header trích dẫn gốc.
 *
 * ── 3. KIỂM DUYỆT v2 (cực mạnh) ──────────────────────────────────────────
 *   • Unicode normalization: NFD + bỏ combining marks → chặn zalgo.
 *   • Bảng homoglyph 50+ ký tự (Latin, Cyrillic, leet 0→o, 1→i, 3→e…).
 *   • 100+ pattern mới: tục tĩu tiếng Việt đầy đủ, leet speak tiếng Anh,
 *     nội dung 18+, đe dọa, hack/ddos, kích động, doxxing, tự làm hại,
 *     từ viết tắt nhạy cảm (dcm, vcl, vkl, clgt…).
 *   • Spam: lặp ký tự ≥10, chuỗi liên tục ≥40 ký tự, lặp từ ≥5 lần,
 *     ≥4 URL, control characters, zalgo combining ≥5.
 *   • All-caps cảnh báo: >30 ký tự alpha toàn hoa → warn (không block).
 *   • Tất cả kiểm tra đều chạy trên text đã normalize → không bypass được
 *     bằng cách gõ "đ!t", "f.u.c.k", "ⓕⓤⓒⓚ"…
 *
 * ── 4. HARD LOCK KHI CUỘC TRÒ CHUYỆN KẾT THÚC ────────────────────────────
 *   Khi locked=true HOẶC status = approved/rejected:
 *   • Form nhập bình luận KHÔNG hiển thị (thay bằng banner 🔒).
 *   • Toàn bộ nút reaction bị disable (pointer-events:none + opacity .3).
 *   • Nút "↩ Trả lời", "✏️ Sửa", "🗑️ Xóa", "📌 Ghim" không render.
 *   • submitComment/editComment/deleteComment/updateReaction đều kiểm tra
 *     locked ở phía server (double-check) → trả về lỗi nếu ai cố gọi API.
 *   • Wrapper có class mc-locked-wrap → CSS vô hiệu hóa toàn bộ buttons
 *     ngay cả khi JS không chạy.
 *
 * ── Cách khởi tạo (không đổi) ─────────────────────────────────────────────
 *   var mc = new MAPLEComments({
 *       api:           new mw.Api(),
 *       requestId:     'MP85E0DQ-BH91Z6',
 *       item:          { status: 'pending', page_name: '...', ... },
 *       container:     document.getElementById('comments-box'),
 *       currentUser:   mw.config.get('wgUserName'), // hoặc null/'' cho ẩn danh
 *       pageOwner:     'Beestudio2026',
 *       autoProvision: true,
 *       onCountChange: function(n) { badgeEl.textContent = n; }
 *   });
 *   mc.init();
 */