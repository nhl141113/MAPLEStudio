/**
 * M.A.P.L.E — MediaWiki:MAPLE-OpenLink.js
 * Trang relay cảnh báo: Dự_án:Open/link?url=<encoded>
 * Build UI kiểu Zalo — hiện URL đích, cảnh báo, 2 nút Trở về / Tiếp tục
 */
(function () {
    'use strict';

    /* Chỉ chạy trên đúng trang */
    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (pn !== 'Dự_án:Open' && pn !== 'Dự_án:Open/link' && !/Open(\/link)?/i.test(decoded)) return;

    /* Đọc ?url= từ query string */
    function getTargetUrl() {
        var m = location.search.match(/[?&]url=([^&]*)/);
        if (!m) return null;
        try {
            var url = decodeURIComponent(m[1]);
            /* Chỉ cho phép http / https */
            if (!/^https?:\/\//i.test(url)) return null;
            return url;
        } catch (e) { return null; }
    }

    /* Format domain ngắn */
    function getDomain(url) {
        try { return new URL(url).hostname; } catch (e) { return url.slice(0, 50); }
    }

    /* ── CSS ── */
    function injectCSS() {
        var s = document.createElement('style');
        s.textContent = [
            /* Full-screen takeover — ẩn TOÀN BỘ chrome wiki */
            'html,body{',
            'margin:0!important;padding:0!important;',
            'background:#040404!important;',
            'overflow:hidden!important;}',

            '#mw-teleport-target,',
            '.vector-column-start,#mw-panel,.vector-main-menu-container,',
            'header.mw-header,.vector-header-container,.vector-sticky-header,',
            '#vector-sticky-header,.vector-page-titlebar,.vector-page-toolbar,',
            '.vector-column-end,#footer,.mw-footer-container,#firstHeading,',
            '.mw-indicators,#siteSub,#contentSub,.printfooter,#catlinks,',
            '.mw-body-header,.vector-toc-landmark,.vector-column-start,',
            '.mw-table-of-contents-container{display:none!important}',

            /* Mw content container — fullscreen */
            '#mw-page-base,#mw-head-base,',
            '.mw-page-container,.mw-page-container-inner,.vector-column-content,',
            '.mw-body,.mw-body-content,#content,#mw-content-text{',
            'display:block!important;',
            'position:fixed!important;inset:0!important;',
            'width:100vw!important;height:100vh!important;',
            'max-width:none!important;max-height:none!important;',
            'margin:0!important;padding:0!important;',
            'background:#040404!important;',
            'border:none!important;box-shadow:none!important;',
            'overflow:auto!important;z-index:9999!important}',

            /* Centering wrapper — chiếm trọn màn hình */
            '.mol-wrap{min-height:100vh;width:100vw;display:flex;flex-direction:column;',
            'align-items:center;justify-content:center;',
            'padding:32px 20px;font-family:"JetBrains Mono",ui-monospace,monospace}',

            /* Card — TOÀN MÀN HÌNH (thông báo full-screen) */
            '.mol-card{width:100vw;min-height:100vh;background:#040404;',
            'border:none;display:flex;flex-direction:column;',
            'align-items:center;justify-content:center;padding:40px 20px;',
            'animation:mol-slide .26s cubic-bezier(.22,1,.36,1)}',
            '.mol-card>*{width:min(600px,100%)}',
            '.mol-card>.mol-hdr{border-top:2px solid #ef4444}',
            '@keyframes mol-slide{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}',

            /* Header */
            '.mol-hdr{padding:20px 22px 16px;border-bottom:1px solid #111;',
            'display:flex;align-items:center;gap:14px}',
            '.mol-hdr-icon{width:40px;height:40px;border-radius:50%;flex-shrink:0;',
            'background:#1c0000;border:1px solid #3f0000;',
            'display:flex;align-items:center;justify-content:center;font-size:1.1rem}',
            '.mol-hdr-title{font-size:11px;font-weight:700;letter-spacing:.14em;',
            'text-transform:uppercase;color:#e4e4e7;margin:0 0 3px}',
            '.mol-hdr-sub{font-size:8.5px;color:#52525b;letter-spacing:.08em;text-transform:uppercase}',

            /* Body */
            '.mol-body{padding:18px 22px 14px}',

            /* Domain badge */
            '.mol-domain-row{display:flex;align-items:center;gap:6px;margin-bottom:6px}',
            '.mol-domain-dot{width:7px;height:7px;border-radius:50%;background:#ef4444;flex-shrink:0}',
            '.mol-domain-label{font-size:8px;letter-spacing:.2em;text-transform:uppercase;color:#52525b}',
            '.mol-domain{font-size:14px;font-weight:700;color:#e4e4e7;',
            'letter-spacing:.04em;margin:0 0 12px;word-break:break-all}',

            /* URL full chip */
            '.mol-url-chip{display:flex;align-items:center;gap:8px;',
            'padding:9px 12px;background:#050505;border:1px solid #161616;',
            'border-left:2px solid #1a1a1a;margin-bottom:16px}',
            '.mol-url-icon{color:#52525b;font-size:9px;flex-shrink:0}',
            '.mol-url-text{font-size:9px;color:#52525b;word-break:break-all;line-height:1.6;',
            'font-family:"JetBrains Mono",monospace}',

            /* Warning */
            '.mol-warn{font-size:10px;color:#71717a;line-height:1.85;margin:0 0 8px}',
            '.mol-warn strong{color:#a1a1aa}',
            '.mol-note{font-size:9px;color:#52525b;line-height:1.75;',
            'border-left:2px solid #1a1a1a;padding-left:10px;margin:0}',
            '.mol-note strong{color:#52525b}',

            /* Divider */
            '.mol-divider{height:1px;background:#0f0f0f;margin:16px 0 0}',

            /* Buttons */
            '.mol-btns{display:flex;gap:8px;padding:14px 22px 18px}',
            '.mol-btn{flex:1;padding:10px 14px;',
            'font-family:"JetBrains Mono",monospace;font-size:9px;font-weight:700;',
            'letter-spacing:.15em;text-transform:uppercase;',
            'border:1px solid;cursor:pointer;transition:all .16s;text-align:center;',
            'text-decoration:none!important;display:flex;align-items:center;justify-content:center;gap:6px}',
            '.mol-btn-back{background:transparent;color:#71717a;border-color:#1a1a1a}',
            '.mol-btn-back:hover{background:#0d0d0d;border-color:#52525b;color:#a1a1aa}',
            '.mol-btn-go{background:#ef4444;color:#fff!important;border-color:#ef4444}',
            '.mol-btn-go:hover{background:#dc2626;border-color:#dc2626;',
            'box-shadow:0 0 16px rgba(239,68,68,.35)}',
            '.mol-btn-go.loading{opacity:.6;pointer-events:none}',

            /* Footer branding */
            '.mol-footer{margin-top:20px;font-size:8px;letter-spacing:.18em;',
            'text-transform:uppercase;color:#1e1e1e;text-align:center}',

            /* Error state */
            '.mol-error{text-align:center;padding:32px 22px;color:#52525b;font-size:10px;line-height:2}',
            '.mol-error strong{display:block;font-size:13px;color:#e4e4e7;margin-bottom:8px}',

            /* ── Trạng thái CHẶN (link không an toàn) ── */
            '.mol-card.blocked>.mol-hdr{border-top:2px solid #dc2626}',
            '.mol-blocked-icon{width:64px;height:64px;border-radius:50%;flex-shrink:0;',
            'background:#1c0000;border:1px solid #5b0000;',
            'display:flex;align-items:center;justify-content:center;font-size:1.9rem;',
            'animation:mol-pulse-block 1.6s ease-in-out infinite}',
            '@keyframes mol-pulse-block{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.4)}50%{box-shadow:0 0 0 10px rgba(220,38,38,0)}}',
            '.mol-block-tag{display:inline-block;font-size:8px;font-weight:700;letter-spacing:.22em;',
            'text-transform:uppercase;color:#fff;background:#dc2626;padding:5px 12px;margin-bottom:14px}',
            '.mol-block-title{font-size:16px;font-weight:700;color:#fca5a5;letter-spacing:.04em;',
            'text-transform:uppercase;margin:0 0 14px}',
            '.mol-block-reason{font-size:12px;color:#a1a1aa;line-height:2;margin:0 0 6px}',
            '.mol-block-reason strong{color:#fca5a5}',

            /* ── Phóng to cho chế độ TOÀN MÀN HÌNH ── */
            '.mol-hdr{padding:24px 26px 20px}',
            '.mol-hdr-icon{width:52px;height:52px;font-size:1.4rem}',
            '.mol-hdr-title{font-size:13px}',
            '.mol-hdr-sub{font-size:9.5px}',
            '.mol-body{padding:26px}',
            '.mol-domain{font-size:20px}',
            '.mol-domain-label{font-size:9px}',
            '.mol-url-text{font-size:10px}',
            '.mol-warn{font-size:12px;line-height:2}',
            '.mol-note{font-size:10px;line-height:1.9}',
            '.mol-btns{padding:18px 26px 22px;gap:12px}',
            '.mol-btn{padding:14px 18px;font-size:10.5px}',
            '.mol-footer{margin-top:32px;font-size:9px}',
            /* ══ BRAND — logo M.A.P.L.E + wordmark ══ */
            '.mol-brand{display:flex;flex-direction:column;align-items:center;gap:8px;',
            'margin-bottom:28px;animation:mol-fade-down .55s ease both}',
            '.mol-brand-logo svg{filter:drop-shadow(0 0 14px rgba(239,68,68,.45));',
            'animation:mol-float 4s ease-in-out infinite}',
            '@keyframes mol-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}',
            '@keyframes mol-fade-down{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}',
            '.mol-brand-name{font-size:15px;font-weight:700;letter-spacing:.42em;text-indent:.42em;',
            'background:repeating-linear-gradient(-60deg,#f4f4f5 0 2px,#52525b 2px 5px);',
            '-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:#f4f4f5}',
            '.mol-brand-sub{font-size:8px;letter-spacing:.34em;text-transform:uppercase;color:#52525b}',

            /* ══ Scanline overlay trong card (qua ::before, không chiếm DOM) ══ */
            '.mol-card{position:relative}',
            '.mol-card::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;',
            'background:repeating-linear-gradient(rgba(239,68,68,0) 0 2px,rgba(239,68,68,.022) 2px 3px)}',
            '.mol-card>*{position:relative;z-index:1}',
            '.mol-card>.mol-hdr{box-shadow:0 -1px 28px rgba(239,68,68,.10)}',
            '.mol-hdr-icon{box-shadow:0 0 0 0 rgba(239,68,68,.3);animation:mol-pulse-soft 2.6s ease-in-out infinite}',
            '@keyframes mol-pulse-soft{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.25)}50%{box-shadow:0 0 0 7px rgba(239,68,68,0)}}',
            '.mol-block-title{text-shadow:0 0 18px rgba(220,38,38,.45)}',

            /* ══ Responsive — điện thoại ══ */
            '@media(max-width:520px){.mol-domain{font-size:16px}.mol-hdr-icon{width:44px;height:44px}',
            '.mol-brand-name{font-size:13px;letter-spacing:.32em}.mol-brand{margin-bottom:20px}',
            '.mol-card{padding:32px 16px}.mol-btns{flex-direction:column}}',
        ].join('');
        document.head.appendChild(s);
    }

    /* ── Brand header dùng chung (logo M.A.P.L.E) ── */
    function brandHTML(sub) {
        var logo = (window.MAPLE && window.MAPLE.logoSVG) ? window.MAPLE.logoSVG(54) : '';
        return '<div class="mol-brand">' +
            '<div class="mol-brand-logo">' + logo + '</div>' +
            '<div class="mol-brand-name">M.A.P.L.E</div>' +
            '<div class="mol-brand-sub">' + escHtml(sub || 'EXTERNAL LINK GATEWAY') + '</div>' +
            '</div>';
    }
    function makeBrand(sub) {
        var b = document.createElement('div');
        b.innerHTML = brandHTML(sub);
        return b.firstChild;
    }

    /* ── Build trang lỗi (không có URL) ── */
    function buildError(container) {
        container.innerHTML =
            '<div class="mol-wrap">' +
                '<div class="mol-card">' +
                    brandHTML('EXTERNAL LINK GATEWAY') +
                    '<div class="mol-hdr">' +
                        '<div class="mol-hdr-icon">⚠</div>' +
                        '<div><div class="mol-hdr-title">Liên kết không hợp lệ</div>' +
                        '<div class="mol-hdr-sub">// MAPLE OPEN LINK</div></div>' +
                    '</div>' +
                    '<div class="mol-error">' +
                        '<strong>Không tìm thấy URL đích</strong>' +
                        'Tham số <code>?url=</code> bị thiếu hoặc không hợp lệ.<br>' +
                        'Chỉ chấp nhận địa chỉ http:// hoặc https://.' +
                    '</div>' +
                    '<div class="mol-btns">' +
                        '<a class="mol-btn mol-btn-back" href="javascript:history.back()">← Quay lại</a>' +
                    '</div>' +
                '</div>' +
            '</div>';
    }

    /* ── Build trang CHẶN (link không an toàn — KHÔNG cho qua) ── */
    function buildBlocked(container, targetUrl, verdict) {
        var domain = getDomain(targetUrl);

        var wrap = document.createElement('div');
        wrap.className = 'mol-wrap';

        var card = document.createElement('div');
        card.className = 'mol-card blocked';
        card.appendChild(makeBrand('LINK GUARD // TRUY CẬP BỊ CHẶN'));

        /* Header */
        var hdr = document.createElement('div');
        hdr.className = 'mol-hdr';
        hdr.innerHTML =
            '<div class="mol-blocked-icon">🚫</div>' +
            '<div>' +
                '<div class="mol-hdr-title">Truy cập bị chặn</div>' +
                '<div class="mol-hdr-sub">// MAPLE LINK GUARD</div>' +
            '</div>';
        card.appendChild(hdr);

        /* Body */
        var body = document.createElement('div');
        body.className = 'mol-body';

        var tag = document.createElement('div');
        tag.className = 'mol-block-tag';
        tag.textContent = 'Liên kết không an toàn — ' + (verdict.category || 'unsafe').toUpperCase();
        body.appendChild(tag);

        var title = document.createElement('div');
        title.className = 'mol-block-title';
        title.textContent = 'Đã chặn liên kết nguy hiểm';
        body.appendChild(title);

        /* Domain (hiển thị để minh bạch, KHÔNG phải link bấm được) */
        var domRow = document.createElement('div');
        domRow.className = 'mol-domain-row';
        domRow.innerHTML = '<span class="mol-domain-dot"></span><span class="mol-domain-label">Trang bị chặn</span>';
        body.appendChild(domRow);

        var domEl = document.createElement('div');
        domEl.className = 'mol-domain';
        domEl.textContent = domain;
        body.appendChild(domEl);

        var reason = document.createElement('p');
        reason.className = 'mol-block-reason';
        reason.textContent = verdict.reason || '🚫 Liên kết này bị chặn vì lý do an toàn.';
        body.appendChild(reason);

        /* teen-restricted: KHÔNG bất hợp pháp — chỉ giới hạn tuổi. Người đủ 18 có thể xác nhận để tiếp tục. */
        var isTeenRestricted = (verdict.category === 'teen-restricted');

        var note = document.createElement('p');
        note.className = 'mol-note';
        note.innerHTML = isTeenRestricted
            ? 'Liên kết này bị giới hạn ở <strong>chế độ dưới 18 tuổi</strong>. Nếu bạn thực sự đủ 18 tuổi, ' +
              'có thể xác nhận để tiếp tục. Tìm hiểu: <a href="/wiki/%C4%90i%E1%BB%81u_Kho%E1%BA%A3n/Ki%E1%BB%83m_Duy%E1%BB%87t">Điều Khoản/Kiểm Duyệt</a>.'
            : 'Vì lý do <strong>an toàn và pháp lý</strong>, M.A.P.L.E Wiki không cho phép ' +
              'mở liên kết này. Nếu bạn cho rằng đây là nhầm lẫn, hãy liên hệ quản trị viên.';
        body.appendChild(note);

        card.appendChild(body);
        card.appendChild(Object.assign(document.createElement('div'), { className: 'mol-divider' }));

        var btns = document.createElement('div');
        btns.className = 'mol-btns';
        var backBtn = document.createElement('button');
        backBtn.className = 'mol-btn mol-btn-back';
        backBtn.innerHTML = '← Quay lại nơi an toàn';
        backBtn.addEventListener('click', function () {
            if (history.length > 1) history.back();
            else location.href = '/wiki/Trang_Chính';
        });
        btns.appendChild(backBtn);

        /* CHỈ teen-restricted mới có nút xác nhận 18+ → đổi audience rồi dựng lại trang cảnh báo thường. */
        if (isTeenRestricted) {
            var ageBtn = document.createElement('button');
            ageBtn.className = 'mol-btn mol-btn-go';
            ageBtn.innerHTML = 'Tôi đủ 18 tuổi — tiếp tục';
            ageBtn.addEventListener('click', function () {
                var M = window.MAPLE && window.MAPLE.Moderation;
                if (M && M.setAudience) M.setAudience(18);
                container.innerHTML = '';
                buildPage(container, targetUrl);   // trang cảnh báo thường (có nút tiếp tục)
            });
            btns.appendChild(ageBtn);
        }
        card.appendChild(btns);

        wrap.appendChild(card);

        var footer = document.createElement('div');
        footer.className = 'mol-footer';
        footer.textContent = 'M.A.P.L.E Wiki — Hệ thống kiểm soát liên kết ngoài';
        wrap.appendChild(footer);

        container.appendChild(wrap);
    }

    /* ── Build trang cảnh báo ── */
    function buildPage(container, targetUrl) {
        var domain = getDomain(targetUrl);

        var wrap = document.createElement('div');
        wrap.className = 'mol-wrap';

        var card = document.createElement('div');
        card.className = 'mol-card';
        card.appendChild(makeBrand('EXTERNAL LINK GATEWAY'));

        /* Header */
        var hdr = document.createElement('div');
        hdr.className = 'mol-hdr';
        hdr.innerHTML =
            '<div class="mol-hdr-icon">🔗</div>' +
            '<div>' +
                '<div class="mol-hdr-title">Rời khỏi M.A.P.L.E Wiki</div>' +
                '<div class="mol-hdr-sub">// Liên kết bên ngoài</div>' +
            '</div>';
        card.appendChild(hdr);

        /* Body */
        var body = document.createElement('div');
        body.className = 'mol-body';

        /* Domain nổi bật */
        var domRow = document.createElement('div');
        domRow.className = 'mol-domain-row';
        domRow.innerHTML = '<span class="mol-domain-dot"></span><span class="mol-domain-label">Trang đích</span>';
        body.appendChild(domRow);

        var domEl = document.createElement('div');
        domEl.className = 'mol-domain';
        domEl.textContent = domain;
        body.appendChild(domEl);

        /* URL đầy đủ */
        var chip = document.createElement('div');
        chip.className = 'mol-url-chip';
        chip.innerHTML =
            '<span class="mol-url-icon">↗</span>' +
            '<span class="mol-url-text">' + escHtml(targetUrl) + '</span>';
        body.appendChild(chip);

        /* Cảnh báo */
        var warn = document.createElement('p');
        warn.className = 'mol-warn';
        warn.innerHTML =
            'Bạn sắp truy cập một <strong>trang web bên ngoài</strong> ' +
            'không thuộc hệ thống của <strong>Tổ chức M.A.P.L.E</strong>.';
        body.appendChild(warn);

        var note = document.createElement('p');
        note.className = 'mol-note';
        note.innerHTML =
            'M.A.P.L.E <strong>không kiểm soát</strong> nội dung, bảo mật hoặc ' +
            'chính sách riêng tư của trang này và <strong>không chịu trách nhiệm</strong> ' +
            'về bất kỳ rủi ro nào phát sinh khi bạn tiếp tục.';
        body.appendChild(note);

        card.appendChild(body);
        card.appendChild(Object.assign(document.createElement('div'), { className: 'mol-divider' }));

        /* Buttons */
        var btns = document.createElement('div');
        btns.className = 'mol-btns';

        var backBtn = document.createElement('button');
        backBtn.className = 'mol-btn mol-btn-back';
        backBtn.innerHTML = '← Trở về';
        backBtn.addEventListener('click', function () { history.back(); });

        var goBtn = document.createElement('a');
        goBtn.className = 'mol-btn mol-btn-go';
        goBtn.innerHTML = 'Vẫn tiếp tục ↗';
        goBtn.href = targetUrl;
        goBtn.target = '_blank';
        goBtn.rel = 'noopener noreferrer';
        goBtn.setAttribute('data-ext-skip', '1'); /* không để MAPLE-ExternalLink relay lại → tránh vòng lặp */
        goBtn.addEventListener('click', function () {
            goBtn.classList.add('loading');
            goBtn.innerHTML = 'Đang mở…';
        });

        btns.appendChild(backBtn);
        btns.appendChild(goBtn);
        card.appendChild(btns);

        wrap.appendChild(card);

        var footer = document.createElement('div');
        footer.className = 'mol-footer';
        footer.textContent = 'M.A.P.L.E Wiki — Hệ thống kiểm soát liên kết ngoài';
        wrap.appendChild(footer);

        container.appendChild(wrap);
    }

    function escHtml(s) {
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    /* Lấy bộ kiểm duyệt link; chờ tối đa ~1.2s nếu MAPLE-Moderation chưa nạp xong */
    function withModeration(cb) {
        if (window.MAPLE && window.MAPLE.Moderation && window.MAPLE.Moderation.checkUrl) {
            return cb(window.MAPLE.Moderation);
        }
        var done = false;
        function fire(mod) { if (!done) { done = true; cb(mod); } }
        if (typeof mw !== 'undefined' && mw.hook) {
            mw.hook('maple.moderation.ready').add(function (mod) {
                if (mod && mod.checkUrl) fire(mod);
            });
        }
        var tries = 0;
        var t = setInterval(function () {
            if (window.MAPLE && window.MAPLE.Moderation && window.MAPLE.Moderation.checkUrl) {
                clearInterval(t); fire(window.MAPLE.Moderation);
            } else if (++tries > 24) {
                clearInterval(t); fire(null); /* fallback: không có moderation → coi như cần cảnh báo thường */
            }
        }, 50);
    }

    /* ── Init ── */
    function init() {
        var mwText = document.querySelector('#mw-content-text');
        if (!mwText) return;

        injectCSS();
        mwText.innerHTML = '';

        var targetUrl = getTargetUrl();
        if (!targetUrl) {
            buildError(mwText);
            return;
        }

        /* Kiểm duyệt link TRƯỚC khi cho thấy nút "Vẫn tiếp tục" */
        withModeration(function (mod) {
            var verdict = mod && mod.checkUrl ? mod.checkUrl(targetUrl) : { blocked: false };
            mwText.innerHTML = '';
            if (verdict && verdict.blocked) {
                buildBlocked(mwText, targetUrl, verdict);
            } else {
                buildPage(mwText, targetUrl);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
