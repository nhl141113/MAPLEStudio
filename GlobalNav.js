/* ============================================
   M.A.P.L.E — MediaWiki:GlobalNav.js
   Global nav + sidebar trên MỌI trang
   - Dropdown "MAPLE Chat" (thay "Trang thảo luận"), mở qua window.MAPLEChat.open()
   - Nút chat nhanh + badge tin chưa đọc ở nav-right (khi đã đăng nhập)
   ============================================ */

(function () {
    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
        });
    }
    function init() {
        var pageName   = mw.config.get('wgPageName') || '';
        var isMainPage = mw.config.get('wgIsMainPage');
        var userId     = mw.config.get('wgUserId');
        var userName   = mw.config.get('wgUserName');
        var userNameEsc = esc(userName);
        var isLoggedIn = !!userId;
        var uploadPath = mw.config.get('wgUploadPath') || '/images';

        /* ── Helper functions ── */
        function navLink(href, label, active, icon) {
            return '<li>' +
                '<a class="maple-nav-item' + (active ? ' active' : '') + '" href="' + href + '">' +
                (icon ? '<span class="maple-nav-icon">' + icon + '</span>' : '') +
                '<span class="maple-nav-label">' + label + '</span>' +
                '</a></li>';
        }
        function sideItem(href, icon, label, sub) {
            return '<a class="maple-sidebar-item" href="' + href + '">' +
                '<span class="maple-sidebar-icon">' + icon + '</span>' +
                '<span class="maple-sidebar-text">' +
                '<span class="maple-sidebar-label">' + label + '</span>' +
                (sub ? '<span class="maple-sidebar-sub">' + sub + '</span>' : '') +
                '</span>' +
                '</a>';
        }

        /* ── Icons ── */
        function iconHome()    { return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'; }
        function iconDB()      { return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>'; }
        function iconShield()  { return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'; }
        function iconID()      { return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>'; }
        function iconDoc()     { return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'; }
        function iconCog()     { return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'; }
        function iconEntity()  { return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'; }
        function iconMap()     { return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>'; }
        function iconHelp()    { return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'; }
        function iconFeedback(){ return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="9" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="15" y1="10" x2="15" y2="10"/></svg>'; }
        function iconUser()    { return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'; }
        function iconLogout()  { return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>'; }
        function iconChevron() { return '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>'; }

        var LOGO_SVG =
            '<svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<defs><filter id="gnav-g" x="-20%" y="-20%" width="140%" height="140%">' +
            '<feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur"/>' +
            '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>' +
            '</filter></defs>' +
            '<path d="M50 5L95 40L80 95H20L5 40L50 5Z" stroke="#450a0a" stroke-width="1" opacity="0.4"/>' +
            '<g filter="url(#gnav-g)">' +
            '<path d="M50 15V85M50 15L85 45L50 40L15 45L50 15Z" stroke="#ef4444" stroke-width="2.5" stroke-linejoin="miter"/>' +
            '<path d="M30 60L50 85L70 60" stroke="#ef4444" stroke-width="2.5"/>' +
            '</g>' +
            '<circle cx="50" cy="40" r="5.5" fill="#ef4444" filter="url(#gnav-g)" class="maple-eye-pulse"/>' +
            '</svg>';

        /* ── CSS ── */
        var navCSS = document.createElement('style');
        navCSS.textContent =
            /* Ẩn Vector header */
            '.vector-header-container,header.mw-header,' +
            '.vector-sticky-header,#vector-sticky-header{display:none!important}' +
            /* Chỉ padding, KHÔNG set background */
            'body{padding-top:70px!important;box-sizing:border-box}' +

            /* Burger */
            '.maple-burger{' +
            'background:transparent!important;border:1px solid #1a1a1a!important;' +
            'color:#ef4444!important;width:36px!important;height:36px!important;' +
            'display:flex!important;align-items:center!important;justify-content:center!important;' +
            'cursor:pointer!important;flex-shrink:0!important;padding:0!important;' +
            'transition:border-color 0.15s,color 0.15s!important;' +
            'filter:none!important;outline:none!important}' +
            '.maple-burger:hover{border-color:#ef4444!important;color:#ef4444!important}' +
            '.maple-burger svg rect{fill:#ef4444!important}' +

            /* Nav links */
            '.maple-nav-links{position:relative;display:flex;list-style:none;margin:0;padding:0;gap:0}' +
            '.maple-nav-item{display:flex;align-items:center;gap:6px;position:relative;' +
            'padding:6px 12px;font-size:10.5px;letter-spacing:0.12em;color:#52525b;' +
            'text-decoration:none;transition:color 0.2s;white-space:nowrap}' +
            '.maple-nav-item:hover{color:#e4e4e7;text-decoration:none}' +
            '.maple-nav-item.active{color:#ef4444}' +
            '.maple-nav-item.active::after,.maple-nav-item.active::before{display:none!important}' +
            '.maple-nav-item li.active::after,.maple-nav-links li.active a::after{display:none!important}' +
            '.maple-nav-links li a.active{border-bottom:none!important;box-shadow:none!important}' +
            '.maple-nav-icon{opacity:0.5;flex-shrink:0;transition:opacity 0.2s}' +
            '.maple-nav-item:hover .maple-nav-icon,.maple-nav-item.active .maple-nav-icon{opacity:1}' +

            /* Sliding indicator */
            '.maple-nav-indicator{position:absolute;bottom:-1px;height:2px;background:#ef4444;' +
            'transition:left 0.25s cubic-bezier(0.22,1,0.36,1),width 0.25s cubic-bezier(0.22,1,0.36,1),opacity 0.2s ease;' +
            'box-shadow:0 0 8px rgba(239,68,68,0.6);pointer-events:none}' +

            /* ── Responsive: ≤900px ẩn thanh nav ngang (7 mục tràn) → dùng burger + sidebar ── */
            '@media(max-width:900px){.maple-nav-links,.maple-nav-indicator{display:none!important}}' +
            '@media(max-width:480px){.maple-nav-brand-text{display:none!important}}' +

            /* Sidebar items */
            '.maple-sidebar-item{display:flex;align-items:center;gap:12px;padding:10px 20px;' +
            'text-decoration:none;transition:background 0.15s,border-left-color 0.15s;' +
            'border-left:2px solid transparent}' +
            '.maple-sidebar-item:hover{background:rgba(239,68,68,0.05);border-left-color:#ef4444;text-decoration:none}' +
            '.maple-sidebar-icon{color:#52525b;flex-shrink:0;transition:color 0.15s}' +
            '.maple-sidebar-item:hover .maple-sidebar-icon{color:#ef4444}' +
            '.maple-sidebar-text{display:flex;flex-direction:column;gap:2px}' +
            '.maple-sidebar-label{font-size:11px;letter-spacing:0.1em;color:#71717a;transition:color 0.15s}' +
            '.maple-sidebar-item:hover .maple-sidebar-label{color:#e4e4e7}' +
            '.maple-sidebar-sub{font-size:9px;letter-spacing:0.08em;color:#52525b}' +
            '.maple-sidebar-divider{font-size:8px;letter-spacing:0.22em;color:#52525b;' +
            'padding:14px 20px 6px;font-weight:700;font-family:"JetBrains Mono",monospace}' +

            /* Overlay */
            '#maple-nav-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);' +
            'z-index:998;display:none}' +
            '#maple-nav-overlay.active{display:block}' +

            /* ── Account section ── */
            '.maple-nav-account{display:flex;align-items:center;gap:8px;padding:0 12px;' +
            'flex-shrink:0;position:relative;border-left:1px solid #1a1a1a;margin-left:4px}' +

            /* Trigger (logged in) */
            '.maple-account-trigger{display:flex;align-items:center;gap:7px;padding:5px 8px;' +
            'cursor:pointer;border:1px solid transparent;' +
            'transition:border-color 0.15s,background 0.15s;user-select:none}' +
            '.maple-account-trigger:hover,.maple-account-trigger.open{' +
            'border-color:#1a1a1a;background:rgba(255,255,255,0.02)}' +

            /* Avatar wrap */
            '.maple-account-avatar-wrap{position:relative;width:24px;height:24px;flex-shrink:0}' +
            '.maple-account-avatar{width:24px;height:24px;border-radius:2px;' +
            'object-fit:cover;display:none;border:1px solid #1a1a1a}' +
            '.maple-account-avatar-fallback{width:24px;height:24px;display:flex;' +
            'align-items:center;justify-content:center;color:#52525b;' +
            'border:1px solid #1a1a1a;border-radius:2px}' +
            '.maple-account-trigger:hover .maple-account-avatar-fallback,' +
            '.maple-account-trigger.open .maple-account-avatar-fallback{color:#71717a}' +

            /* Account name */
            '.maple-account-name{font-size:10px;letter-spacing:0.1em;color:#71717a;' +
            'max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;' +
            'transition:color 0.15s}' +
            '.maple-account-trigger:hover .maple-account-name,' +
            '.maple-account-trigger.open .maple-account-name{color:#e4e4e7}' +

            /* Chevron */
            '.maple-account-chevron{color:#52525b;transition:transform 0.2s,color 0.15s;' +
            'display:flex;align-items:center}' +
            '.maple-account-trigger.open .maple-account-chevron{transform:rotate(180deg)}' +
            '.maple-account-trigger:hover .maple-account-chevron{color:#71717a}' +

            /* Dropdown */
            '.maple-account-dropdown{position:absolute;top:calc(100% + 6px);right:0;' +
            'background:#0a0a0a;border:1px solid #1a1a1a;min-width:170px;' +
            'display:none;flex-direction:column;z-index:1001}' +
            '.maple-account-dropdown.open{display:flex}' +
            '.maple-dropdown-header{padding:10px 14px 8px;border-bottom:1px solid #1a1a1a}' +
            '.maple-dropdown-username{font-size:9px;letter-spacing:0.15em;color:#52525b;' +
            'display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
            '.maple-account-dropdown-item{display:flex;align-items:center;gap:10px;' +
            'padding:9px 14px;font-size:10px;letter-spacing:0.1em;color:#71717a;' +
            'text-decoration:none;transition:background 0.15s,color 0.15s;white-space:nowrap}' +
            '.maple-account-dropdown-item:hover{background:rgba(255,255,255,0.03);' +
            'color:#e4e4e7;text-decoration:none}' +
            '.maple-dropdown-icon{color:#52525b;flex-shrink:0;transition:color 0.15s;' +
            'display:flex;align-items:center}' +
            '.maple-account-dropdown-item:hover .maple-dropdown-icon{color:#ef4444}' +
            '.maple-dropdown-divider{height:1px;background:#1a1a1a}' +
            '.maple-logout:hover{background:rgba(239,68,68,0.06)!important;color:#ef4444!important}' +
            '.maple-logout:hover .maple-dropdown-icon{color:#ef4444!important}' +

            /* Auth buttons (logged out) */
            '.maple-auth-btn{font-size:9px;letter-spacing:0.15em;padding:5px 10px;' +
            'text-decoration:none;transition:all 0.15s;white-space:nowrap;display:inline-flex;' +
            'align-items:center}' +
            '.maple-auth-register{color:#52525b;border:1px solid #1a1a1a}' +
            '.maple-auth-register:hover{color:#e4e4e7;border-color:#52525b;text-decoration:none}' +
            '.maple-auth-login{color:#ef4444;border:1px solid #450a0a}' +
            '.maple-auth-login:hover{background:rgba(239,68,68,0.08);border-color:#ef4444;' +
            'color:#ef4444;text-decoration:none}' +

            /* ── Quick chat button (nav-right, khi đã đăng nhập) ── */
            '.maple-nav-chat{position:relative;display:flex;align-items:center;justify-content:center;' +
            'width:30px;height:30px;flex-shrink:0;cursor:pointer;color:#52525b;' +
            'border:1px solid #1a1a1a;background:transparent;padding:0;' +
            'transition:color 0.15s,border-color 0.15s,background 0.15s}' +
            '.maple-nav-chat:hover{color:#ef4444;border-color:#450a0a;background:rgba(239,68,68,0.05)}' +
            '.maple-nav-chat-badge{position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;' +
            'font-size:8px;font-weight:700;line-height:14px;min-width:14px;height:14px;padding:0 3px;' +
            'border-radius:8px;text-align:center;display:none;box-shadow:0 0 6px rgba(239,68,68,0.6)}' +

            /* ── Nút phản hồi (feedback) ── */
            '.maple-nav-feedback{display:flex;align-items:center;gap:5px;flex-shrink:0;cursor:pointer;' +
            'font-family:inherit;font-size:9px;letter-spacing:0.15em;color:#52525b;' +
            'border:1px solid #1a1a1a;background:transparent;padding:5px 10px;' +
            'text-decoration:none;transition:all 0.15s;white-space:nowrap}' +
            '.maple-nav-feedback:hover{color:#4ade80;border-color:#166534;background:rgba(74,222,128,0.05);text-decoration:none}' +
            '.maple-nav-feedback svg{flex-shrink:0}' +

            /* ── Nút thông báo sự kiện (chuông) ── */
            '.maple-nav-notif{position:relative;display:flex;align-items:center;justify-content:center;' +
            'width:30px;height:30px;flex-shrink:0;cursor:pointer;color:#52525b;' +
            'border:1px solid #1a1a1a;background:transparent;padding:0;text-decoration:none;' +
            'transition:color 0.15s,border-color 0.15s,background 0.15s}' +
            '.maple-nav-notif:hover,.maple-nav-notif.open{color:#eab308;border-color:#713f12;background:rgba(234,179,8,0.06);text-decoration:none}' +
            '.maple-nav-notif-badge{position:absolute;top:-6px;right:-6px;background:#eab308;color:#0a0a0a;' +
            'font-size:8px;font-weight:800;line-height:14px;min-width:14px;height:14px;padding:0 3px;' +
            'border-radius:8px;text-align:center;display:none;box-shadow:0 0 6px rgba(234,179,8,0.5)}' +

            /* Notif dropdown */
            '.maple-notif-dropdown{position:absolute;top:calc(100% + 8px);right:-8px;width:320px;' +
            'background:#0a0a0a;border:1px solid #1e1e1e;z-index:1002;display:none;flex-direction:column}' +
            '.maple-notif-dropdown.open{display:flex}' +
            '.mnd-header{display:flex;align-items:center;justify-content:space-between;' +
            'padding:10px 14px 8px;border-bottom:1px solid #1a1a1a}' +
            '.mnd-title{font-size:9px;letter-spacing:.18em;color:#52525b;text-transform:uppercase}' +
            '.mnd-see-all{font-size:9px;letter-spacing:.12em;color:#52525b;text-decoration:none;' +
            'transition:color .15s}' +
            '.mnd-see-all:hover{color:#eab308;text-decoration:none}' +
            '.mnd-list{display:flex;flex-direction:column;overflow-y:auto;max-height:340px}' +
            '.mnd-item{display:flex;gap:10px;padding:10px 14px;border-bottom:1px solid #111;' +
            'transition:background .12s;cursor:default}' +
            '.mnd-item.unread{background:#0a0900;border-left:2px solid #eab308}' +
            '.mnd-item-icon{flex-shrink:0;font-size:.9rem;line-height:1.4}' +
            '.mnd-item-body{flex:1;min-width:0}' +
            '.mnd-item-title{font-size:.72rem;font-weight:600;color:#a1a1aa;' +
            'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}' +
            '.mnd-item.unread .mnd-item-title{color:#f4f4f5}' +
            '.mnd-item-sub{font-size:.66rem;color:#52525b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
            '.mnd-item-ts{font-size:.62rem;color:#52525b;margin-top:2px}' +
            '.mnd-empty{text-align:center;padding:28px 14px;font-size:.75rem;color:#52525b;letter-spacing:.08em}' +
            '.mnd-footer{padding:8px 14px;border-top:1px solid #1a1a1a;text-align:center}' +
            '.mnd-footer a{font-size:9px;letter-spacing:.12em;color:#52525b;text-decoration:none;' +
            'transition:color .15s}' +
            '.mnd-footer a:hover{color:#eab308}' +

            /* ── Hiệu ứng logo nav: mắt đỏ nhấp nháy + brand hover ── */
            '@keyframes maple-nav-eye{0%,100%{opacity:1}50%{opacity:0.55}}' +
            '.maple-nav-brand .maple-eye-pulse{animation:maple-nav-eye 2.4s ease-in-out infinite;' +
            'transform-box:fill-box;transform-origin:center}' +
            '.maple-nav-brand svg{transition:filter 0.3s,transform 0.3s}' +
            '.maple-nav-brand:hover svg{filter:drop-shadow(0 0 8px rgba(239,68,68,0.55));transform:scale(1.05)}' +
            '.maple-nav-brand .brand-title{transition:text-shadow 0.3s}' +
            '.maple-nav-brand:hover .brand-title{text-shadow:0 0 12px rgba(239,68,68,0.5)}';

        document.head.appendChild(navCSS);

        /* ── Account HTML ── */
        var accountHtml;
        if (isLoggedIn) {
            var avatarUrl = uploadPath + '/avatars/' + userId + '_l.png';
            accountHtml =
                '<div class="maple-nav-account" id="maple-nav-account">' +
                '<div class="maple-account-trigger" id="maple-account-trigger" role="button" aria-label="Tài khoản">' +
                '<div class="maple-account-avatar-wrap">' +
                '<img class="maple-account-avatar" id="maple-account-avatar" src="' + avatarUrl + '" alt="">' +
                '<span class="maple-account-avatar-fallback" id="maple-account-avatar-fallback">' + iconUser() + '</span>' +
                '</div>' +
                '<span class="maple-account-name">' + userNameEsc + '</span>' +
                '<span class="maple-account-chevron">' + iconChevron() + '</span>' +
                '</div>' +
                '<div class="maple-account-dropdown" id="maple-account-dropdown">' +
                '<div class="maple-dropdown-header">' +
                '<span class="maple-dropdown-username">' + userNameEsc + '</span>' +
                '</div>' +
                '<a class="maple-account-dropdown-item" href="' + mw.util.getUrl('User:' + userName) + '">' +
                '<span class="maple-dropdown-icon">' + iconUser() + '</span>Trang cá nhân' +
                '</a>' +
                '<a class="maple-account-dropdown-item" id="maple-chat-trigger" href="' + mw.util.getUrl('User:' + userName + '/Chat') + '">' +
                '<span class="maple-dropdown-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="12" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></svg></span>MAPLE Chat' +
                '<span class="maple-chat-nav-badge" id="maple-chat-nav-badge" style="display:none;margin-left:6px;background:#ef4444;color:#fff;font-size:8px;font-weight:700;padding:1px 5px;border-radius:8px;min-width:14px;text-align:center;line-height:14px;">0</span>' +
                '</a>' +
                '<a class="maple-account-dropdown-item" href="' + mw.util.getUrl('User:' + userName + '/Chờ_Duyệt') + '">' +
                '<span class="maple-dropdown-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>Bài chờ duyệt' +
                '</a>' +
                '<div class="maple-dropdown-divider"></div>' +
                '<a class="maple-account-dropdown-item" href="' + mw.util.getUrl('Special:Preferences') + '">' +
                '<span class="maple-dropdown-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span>Cài đặt tài khoản' +
                '</a>' +
                '<a class="maple-account-dropdown-item" href="/wiki/D%E1%BB%B1_%C3%A1n:All_User">' +
                '<span class="maple-dropdown-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>Danh sách thành viên' +
                '</a>' +
                '<div class="maple-dropdown-divider"></div>' +
                '<a class="maple-account-dropdown-item maple-logout" href="' + mw.util.getUrl('Special:UserLogout') + '">' +
                '<span class="maple-dropdown-icon">' + iconLogout() + '</span>Đăng xuất' +
                '</a>' +
                '</div>' +
                '</div>';
        } else {
            accountHtml =
                '<div class="maple-nav-account" id="maple-nav-account">' +
                '<a class="maple-auth-btn maple-auth-register" href="' + mw.util.getUrl('Special:CreateAccount') + '">ĐĂNG KÝ</a>' +
                '<a class="maple-auth-btn maple-auth-login" href="' + mw.util.getUrl('Special:UserLogin') + '">ĐĂNG NHẬP</a>' +
                '</div>';
        }

        /* ── Build HTML ── */
        var navEl = document.createElement('div');
        navEl.innerHTML =

            '<div class="maple-nav-overlay" id="maple-nav-overlay"></div>' +

            '<aside class="maple-sidebar" id="maple-sidebar">' +
            '<div class="maple-sidebar-items">' +
            '<div class="maple-sidebar-label">Menu điều hướng</div>' +

            '<div class="maple-sidebar-divider">// ĐIỀU HƯỚNG</div>' +
            sideItem(mw.util.getUrl('Trang Chính'),  iconHome(),   'Trang Chủ',       'Trang chính của wiki') +
            sideItem(mw.util.getUrl('Kho Lưu Trữ'),  iconDB(),     'Kho Lưu Trữ',     'Cơ sở dữ liệu hồ sơ') +
            sideItem(mw.util.getUrl('Thủ Tục'),      iconShield(), 'Thủ Tục',         'Quy trình sinh tồn') +

            '<div class="maple-sidebar-divider">// CỘNG ĐỒNG</div>' +
            sideItem(mw.util.getUrl('Bảng Tin'),     iconDoc(),    'Bảng Tin',        'Thông báo chính thức') +
            sideItem(mw.util.getUrl('Sự Kiện'),      iconMap(),    'Sự Kiện',         'Cuộc thi & hoạt động') +
            sideItem(mw.util.getUrl('Thành Tựu'),    iconID(),     'Thành Tựu',       'Vinh danh & huy hiệu') +
            sideItem(mw.util.getUrl('Nhiệm Vụ'),     iconMap(),    'Nhiệm Vụ',        'Việc cần làm — nhận RP') +
            sideItem(mw.util.getUrl('Đóng Góp'),     iconEntity(), 'Đóng Góp',        'Bắt đầu đóng góp') +
            sideItem(mw.util.getUrl('Donate'),       iconCog(),    'Ủng Hộ',          'Donate cho wiki') +
            sideItem(mw.util.getUrl('Phản Hồi'),    iconFeedback(),'Phản Hồi',        'Báo lỗi & góp ý') +

            '<div class="maple-sidebar-divider">// TÀI LIỆU</div>' +
            sideItem(mw.util.getUrl('Giới Thiệu'),   iconDoc(),    'Giới Thiệu',      'Về tổ chức M.A.P.L.E') +
            sideItem('/wiki/H%C6%B0%E1%BB%9Bng_D%E1%BA%ABn_Vi%E1%BA%BFt',             iconDoc(),    'Hướng Dẫn Viết',  'Tiêu chuẩn biên soạn') +
            sideItem('/wiki/Quy_T%E1%BA%AFc',                                           iconCog(),    'Quy Tắc',         'Nội quy & đạo đức') +
            sideItem('/wiki/Tr%E1%BB%A3_gi%C3%BAp',                                     iconShield(), 'Trợ Giúp',        'Hướng dẫn sử dụng wiki') +

            '<div class="maple-sidebar-divider">// CÔNG CỤ</div>' +
            sideItem('/wiki/%C4%90%E1%BA%B7c_bi%E1%BB%87t:T%C3%ACm_ki%E1%BA%BFm',     iconMap(),    'Tìm Kiếm',        'Tra cứu toàn bộ wiki') +
            sideItem('/wiki/%C4%90%E1%BA%B7c_bi%E1%BB%87t:Thay_%C4%91%E1%BB%95i_g%E1%BA%A7n_%C4%91%C3%A2y', iconDB(), 'Thay Đổi Gần Đây', 'Cập nhật mới nhất') +
            sideItem('/wiki/%C4%90%E1%BA%B7c_bi%E1%BB%87t:Trang_ng%E1%BA%ABu_nhi%C3%AAn', iconEntity(), 'Trang Ngẫu Nhiên', 'Khám phá wiki') +

            '</div>' +
            '<div class="maple-sidebar-footer">' +
            '<span style="color:#52525b;font-size:9px;letter-spacing:0.1em">LOGGED AS</span>' +
            '<span style="color:#71717a;font-size:10px;letter-spacing:0.08em">' + (userNameEsc || 'GUEST') + '</span>' +
            '</div>' +
            '</aside>' +

            '<nav class="maple-global-nav" id="maple-global-nav">' +

            '<button class="maple-burger" id="maple-burger" aria-label="Menu">' +
            '<svg width="18" height="14" viewBox="0 0 18 14" fill="none">' +
            '<rect y="0"  width="18" height="2" fill="#ef4444"/>' +
            '<rect y="6"  width="18" height="2" fill="#ef4444"/>' +
            '<rect y="12" width="18" height="2" fill="#ef4444"/>' +
            '</svg>' +
            '</button>' +

            '<a class="maple-nav-brand" href="/wiki/Trang_Ch%C3%ADnh">' +
            LOGO_SVG +
            '<div class="maple-nav-brand-text">' +
            '<span class="brand-title">M.A.P.L.E</span>' +
            '<span class="brand-sub">Central Archive / System</span>' +
            '</div></a>' +

            '<ul class="maple-nav-links" id="maple-nav-links">' +
            navLink('/wiki/Trang_Ch%C3%ADnh',             'TRANG CHỦ',   isMainPage,                      iconHome()) +
            navLink('/wiki/Kho_L%C6%B0u_Tr%E1%BB%AF',    'KHO LƯU TRỮ', pageName === 'Kho_Lưu_Trữ',     iconDB()) +
            /* THỰC THỂ: hồ sơ thực thể nằm trong Kho Lưu Trữ → trỏ thẳng tới đó (không tạo trang riêng) */
            navLink('/wiki/Kho_L%C6%B0u_Tr%E1%BB%AF#thuc-the', 'THỰC THỂ', false, iconEntity()) +
            navLink('/wiki/Th%E1%BB%A7_T%E1%BB%A5c',     'THỦ TỤC',     pageName === 'Thủ_Tục',          iconShield()) +
            /* SỰ KIỆN & THÀNH TỰU đã có trang thật → thay cho NHÂN SỰ/BẢN ĐỒ (chưa tạo) */
            navLink(mw.util.getUrl('Sự Kiện'),   'SỰ KIỆN',   pageName.indexOf('Sự_Kiện') === 0, iconMap()) +
            navLink(mw.util.getUrl('Thành Tựu'), 'THÀNH TỰU', pageName === 'Thành_Tựu',          iconID()) +
            navLink(mw.util.getUrl('Nhiệm Vụ'),  'NHIỆM VỤ',  pageName === 'Nhiệm_Vụ',          iconMap()) +
            navLink('/wiki/Tr%E1%BB%A3_gi%C3%BAp',       'TRỢ GIÚP',    pageName.indexOf('Trợ_giúp') === 0, iconHelp()) +
            '</ul>' +

            '<div class="maple-nav-right">' +
            '<div class="maple-nav-search-wrap">' +
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' +
            '</svg>' +
            '<input type="text" class="maple-nav-search" id="maple-search-input" placeholder="TRUY XUẤT DỮ LIỆU...">' +
            '</div>' +
            '<a class="maple-nav-feedback" href="/wiki/Ph%E1%BA%A3n_H%E1%BB%93i" title="Phản hồi & báo lỗi">' +
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
            '</svg>PHẢN HỒI</a>' +
            (isLoggedIn ?
                '<button class="maple-nav-notif" id="maple-nav-notif" ' +
                'title="Thông báo" aria-label="Thông báo" type="button">' +
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>' +
                '<path d="M13.73 21a2 2 0 0 1-3.46 0"/>' +
                '</svg>' +
                '<span class="maple-nav-notif-badge" id="maple-nav-notif-badge">0</span>' +
                '<div class="maple-notif-dropdown" id="maple-notif-dropdown">' +
                '<div class="mnd-header"><span class="mnd-title">Thông báo</span>' +
                '<a class="mnd-see-all" href="/wiki/Th%C3%B4ng_b%C3%A1o/' + encodeURIComponent(userName) + '">Xem tất cả →</a>' +
                '</div>' +
                '<div class="mnd-list" id="maple-notif-list"><div class="mnd-empty">Đang tải...</div></div>' +
                '<div class="mnd-footer"><a href="/wiki/Th%C3%B4ng_b%C3%A1o/' + encodeURIComponent(userName) + '">MỞ TRANG THÔNG BÁO</a></div>' +
                '</div>' +
                '</button>' +
                '<button class="maple-nav-chat" id="maple-nav-chat" title="MAPLE Chat" aria-label="MAPLE Chat">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="12" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/></svg>' +
                '<span class="maple-nav-chat-badge" id="maple-nav-chat-badge">0</span>' +
                '</button>'
                : '') +
            '<div class="maple-live-badge"><span class="maple-live-dot"></span>LIVE</div>' +
            '</div>' +

            accountHtml +

            '</nav>';

        document.body.insertBefore(navEl, document.body.firstChild);

        /* ── Avatar load/error handling ── */
        if (isLoggedIn) {
            var avatarImg      = document.getElementById('maple-account-avatar');
            var avatarFallback = document.getElementById('maple-account-avatar-fallback');
            if (avatarImg) {
                avatarImg.addEventListener('load', function () {
                    avatarFallback.style.display = 'none';
                    avatarImg.style.display = 'block';
                });
                avatarImg.addEventListener('error', function () {
                    avatarImg.style.display = 'none';
                    avatarFallback.style.display = 'flex';
                });
                /* Xử lý ảnh đã cache sẵn */
                if (avatarImg.complete && avatarImg.naturalWidth > 0) {
                    avatarFallback.style.display = 'none';
                    avatarImg.style.display = 'block';
                }
            }
        }

        /* ── Mở MAPLE-Chat: ưu tiên public API, fallback FAB, cuối cùng navigate ── */
        function openMapleChat(e) {
            if (window.MAPLEChat && window.MAPLEChat.open) {
                if (e) e.preventDefault();
                /* Đóng dropdown trước */
                var dd = document.getElementById('maple-account-dropdown');
                var tr = document.getElementById('maple-account-trigger');
                if (dd) dd.classList.remove('open');
                if (tr) tr.classList.remove('open');
                window.MAPLEChat.open();
                return;
            }
            var fab = document.getElementById('mpc-fab');
            if (fab) { if (e) e.preventDefault(); fab.click(); }
            /* Nếu MAPLE-Chat chưa load → để link điều hướng tới trang /Chat (fallback) */
        }

        if (isLoggedIn) {
            var chatTriggerEl = document.getElementById('maple-chat-trigger');
            if (chatTriggerEl) chatTriggerEl.addEventListener('click', openMapleChat);

            var navChatBtn = document.getElementById('maple-nav-chat');
            if (navChatBtn) navChatBtn.addEventListener('click', openMapleChat);

            /* Sync badge số tin chưa đọc từ #mpc-badge vào cả 2 badge của nav */
            var _ddBadge = null;
            var _navBadge = null;
            setInterval(function () {
                // Tối ưu: Dừng kiểm tra DOM liên tục nếu người dùng đang ở tab khác
                if (document.hidden) return;

                var fabBadge   = document.getElementById('mpc-badge');
                var hasUnread  = fabBadge && fabBadge.style.display !== 'none';
                var count      = hasUnread ? fabBadge.textContent : '';
                
                if (!_ddBadge) _ddBadge = document.getElementById('maple-chat-nav-badge');
                if (_ddBadge) {
                    if (hasUnread) { _ddBadge.textContent = count; _ddBadge.style.display = 'inline-block'; }
                    else _ddBadge.style.display = 'none';
                }
                
                if (!_navBadge) _navBadge = document.getElementById('maple-nav-chat-badge');
                if (_navBadge) {
                    if (hasUnread) { _navBadge.textContent = count; _navBadge.style.display = 'block'; }
                    else _navBadge.style.display = 'none';
                }
            }, 3000);

            /* Poll badge + dropdown thông báo (Thông_báo/{user}) — mỗi 60s */
            var _notifList = [];
            function fmtTsShort(ts) {
                if (!ts) return '';
                var d = new Date(ts), now = new Date(), diff = Math.floor((now - d) / 1000);
                if (isNaN(d)) return '';
                if (diff < 60)    return 'vừa xong';
                if (diff < 3600)  return Math.floor(diff / 60) + ' phút';
                if (diff < 86400) return Math.floor(diff / 3600) + ' giờ';
                return Math.floor(diff / 86400) + ' ngày';
            }
            function notifIconSmall(from, title) {
                if (/EventNotifier/i.test(from)) {
                    if (/bắt đầu|started/i.test(title)) return '🎉';
                    return '📢';
                }
                if (/CommentBot/i.test(from))     return '💬';
                if (/AchievementBot/i.test(from)) return '🏆';
                if (/ModerationBot/i.test(from)) {
                    if (/từ chối|reject/i.test(title)) return '❌';
                    return '✅';
                }
                return '📬';
            }
            function renderNotifDropdown(list) {
                var el = document.getElementById('maple-notif-list');
                if (!el) return;
                if (!list || !list.length) {
                    el.innerHTML = '<div class="mnd-empty">Chưa có thông báo nào</div>';
                    return;
                }
                var html = '';
                var shown = list.slice(0, 5);
                shown.forEach(function (n) {
                    var unread = !n.read;
                    /* Strip HTML tags for preview text */
                    var bodyText = (n.body || '').replace(/<[^>]+>/g, '').trim().substring(0, 60);
                    html +=
                        '<div class="mnd-item' + (unread ? ' unread' : '') + '">' +
                        '<div class="mnd-item-icon">' + notifIconSmall(n.from || '', n.title || '') + '</div>' +
                        '<div class="mnd-item-body">' +
                        '<div class="mnd-item-title">' + esc(n.title || '') + '</div>' +
                        (bodyText ? '<div class="mnd-item-sub">' + esc(bodyText) + (n.body && n.body.replace(/<[^>]+>/g,'').length > 60 ? '…' : '') + '</div>' : '') +
                        '<div class="mnd-item-ts">' + esc(fmtTsShort(n.ts)) + (unread ? ' · <span style="color:#eab308">chưa đọc</span>' : '') + '</div>' +
                        '</div>' +
                        '</div>';
                });
                el.innerHTML = html;
            }
            (function pollNotifBadge() {
                // Tối ưu: Nếu tab đang ẩn, tạm hoãn gọi API và thử lại sau 15 giây
                // Tiết kiệm băng thông và request thừa lên Miraheze server
                if (document.hidden) {
                    setTimeout(pollNotifBadge, 15000);
                    return;
                }

                var notifBadgeEl = document.getElementById('maple-nav-notif-badge');
                if (!notifBadgeEl) return;
                var notifPageTitle = 'Thông_báo/' + userName.replace(/ /g, '_');
                $.getJSON(mw.config.get('wgScriptPath') + '/api.php', {
                    action: 'query', titles: notifPageTitle,
                    prop: 'revisions', rvprop: 'content', rvslots: 'main',
                    format: 'json', origin: '*'
                }).done(function (d) {
                    try {
                        var pages = d.query && d.query.pages;
                        var pg    = pages && pages[Object.keys(pages)[0]];
                        if (!pg || pg.missing !== undefined) {
                            _notifList = [];
                            notifBadgeEl.style.display = 'none';
                            renderNotifDropdown([]);
                            return;
                        }
                        var raw  = (pg.revisions[0].slots.main['*']) || (pg.revisions[0].slots.main.content) || '[]';
                        var list = JSON.parse(raw);
                        if (!Array.isArray(list)) list = [];
                        _notifList = list;
                        var unread = list.filter(function (n) { return !n.read; }).length;
                        if (unread > 0) {
                            notifBadgeEl.textContent = unread > 9 ? '9+' : String(unread);
                            notifBadgeEl.style.display = 'block';
                        } else {
                            notifBadgeEl.style.display = 'none';
                        }
                        renderNotifDropdown(list);
                    } catch(e) { notifBadgeEl.style.display = 'none'; }
                }).fail(function () { notifBadgeEl.style.display = 'none'; });
                setTimeout(pollNotifBadge, 60000);
            })();

            /* Toggle dropdown khi click chuông */
            var notifBtn = document.getElementById('maple-nav-notif');
            var notifDD  = document.getElementById('maple-notif-dropdown');
            if (notifBtn && notifDD) {
                notifBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    var isOpen = notifDD.classList.toggle('open');
                    notifBtn.classList.toggle('open', isOpen);
                    /* Đóng account dropdown nếu đang mở */
                    var aDD = document.getElementById('maple-account-dropdown');
                    var aTr = document.getElementById('maple-account-trigger');
                    if (aDD) aDD.classList.remove('open');
                    if (aTr) aTr.classList.remove('open');
                    if (isOpen && _notifList.length === 0) {
                        renderNotifDropdown([]);
                    }
                });
                document.addEventListener('click', function () {
                    notifDD.classList.remove('open');
                    notifBtn.classList.remove('open');
                });
                /* Ngăn click bên trong dropdown đóng dropdown */
                notifDD.addEventListener('click', function (e) { e.stopPropagation(); });
            }
        }

        /* ── Account dropdown toggle ── */
        if (isLoggedIn) {
            var accountTrigger  = document.getElementById('maple-account-trigger');
            var accountDropdown = document.getElementById('maple-account-dropdown');
            if (accountTrigger && accountDropdown) {
                accountTrigger.addEventListener('click', function (e) {
                    e.stopPropagation();
                    accountDropdown.classList.toggle('open');
                    accountTrigger.classList.toggle('open');
                });
                document.addEventListener('click', function () {
                    accountDropdown.classList.remove('open');
                    accountTrigger.classList.remove('open');
                });
            }
        }

        /* ── Sidebar toggle ── */
        var burger  = document.getElementById('maple-burger');
        var sidebar = document.getElementById('maple-sidebar');
        var overlay = document.getElementById('maple-nav-overlay');

        burger.addEventListener('click', function () {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });
        overlay.addEventListener('click', function () {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });

        /* ── Search ── */
        var searchInput = document.getElementById('maple-search-input');
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && searchInput.value.trim()) {
                window.location.href = '/wiki/Special:Search?search=' + encodeURIComponent(searchInput.value.trim());
            }
        });

        /* ── Scroll: ẩn/hiện nav + đậm nền khi cuộn ── */
        var lastST = 0;
        var nav = document.getElementById('maple-global-nav');
        var scrollTicking = false;

        window.addEventListener('scroll', function () {
            var st = window.pageYOffset || document.documentElement.scrollTop;
            
            // Tối ưu: Sử dụng requestAnimationFrame để tránh Layout Thrashing
            if (!scrollTicking) {
                window.requestAnimationFrame(function () {
                    if (st > lastST && st > 80) nav.classList.add('nav-hidden');
                    else nav.classList.remove('nav-hidden');
                    
                    /* Nền nav đậm dần + viền đỏ nhẹ khi đã cuộn qua đỉnh trang */
                    if (st > 10) nav.classList.add('scrolled');
                    else nav.classList.remove('scrolled');
                    lastST = st <= 0 ? 0 : st;
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        }, { passive: true });

        /* ── Sliding nav indicator ── */
        (function () {
            var links = document.getElementById('maple-nav-links');
            if (!links) return;

            var bar = document.createElement('div');
            bar.className = 'maple-nav-indicator';
            links.appendChild(bar);

            function moveTo(el) {
                var linkRect = links.getBoundingClientRect();
                var elRect   = el.getBoundingClientRect();
                bar.style.left    = (elRect.left - linkRect.left) + 'px';
                bar.style.width   = elRect.width + 'px';
                bar.style.opacity = '1';
            }

            var activeTab = links.querySelector('.maple-nav-item.active');

            if (activeTab) {
                bar.style.transition = 'none';
                moveTo(activeTab);
                requestAnimationFrame(function () {
                    bar.style.transition =
                        'left 0.28s cubic-bezier(0.22,1,0.36,1),' +
                        'width 0.28s cubic-bezier(0.22,1,0.36,1),' +
                        'opacity 0.2s ease';
                });
            } else {
                bar.style.opacity = '0';
            }

            // Tối ưu: Event Delegation thay vì loop gắn sự kiện cho từng item
            links.addEventListener('mouseover', function (e) {
                var item = e.target.closest('.maple-nav-item');
                if (item) moveTo(item);
            }, { passive: true });

            links.addEventListener('mouseleave', function () {
                if (activeTab) moveTo(activeTab);
                else bar.style.opacity = '0';
            });
        })();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
