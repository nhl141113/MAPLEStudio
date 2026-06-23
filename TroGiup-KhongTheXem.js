/**
 * M.A.P.L.E — MediaWiki:TroGiup-KhongTheXem.js  v3
 * Trang Trợ_giúp:Không_thể_xem_trang
 * Design mới: full diagnostic — timeline + cards + search-style UI
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (pn && pn !== 'Trợ_giúp:Không_thể_xem_trang' && !/Kh[oô]ng.*th[eể].*xem/i.test(decoded)) return;
    if (!pn && !/Kh[oô]ng.*th[eể].*xem/i.test(decoded)) return;

    /* ── Helpers ── */
    function el(tag, cls, html) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (html) e.innerHTML = html;
        return e;
    }

    /* ── CSS ── */
    function injectCSS() {
        if (document.getElementById('mhd3-style')) return;
        var s = document.createElement('style');
        s.id = 'mhd3-style';
        s.textContent = [
            /* Reset & base */
            '*{box-sizing:border-box}',
            '.mhd3{max-width:900px;margin:0 auto;padding:0 28px 100px;font-family:"JetBrains Mono",ui-monospace,monospace;color:#71717a}',

            /* ── Chrome hide ── */
            '.vector-column-start,#mw-panel,.vector-main-menu-container,header.mw-header,' +
            '.vector-header-container,.vector-sticky-header,#vector-sticky-header,' +
            '.vector-page-titlebar,.vector-page-toolbar,.vector-column-end,' +
            '#footer,.mw-footer-container,#firstHeading,.mw-indicators,' +
            '#siteSub,#contentSub,.printfooter,#catlinks,.mw-body-header{display:none!important}',
            '.mw-page-container,#mw-content-text,.mw-body,#content,' +
            '.vector-column-content,.mw-page-container-inner{padding:0!important;margin:0!important;' +
            'max-width:100%!important;width:100%!important;background:transparent!important;' +
            'border:none!important;box-shadow:none!important}',
            'html,body{background:#040404!important}',

            /* ── Top ribbon ── */
            '.mhd3-ribbon{height:2px;background:linear-gradient(90deg,#ef4444 0%,#7f1d1d 60%,transparent 100%);margin-bottom:0}',

            /* ── Hero ── */
            '.mhd3-hero{padding:56px 0 44px;border-bottom:1px solid #0f0f0f}',
            '.mhd3-hero-bc{display:flex;align-items:center;gap:6px;font-size:9.5px;' +
                'letter-spacing:.2em;color:#52525b;text-transform:uppercase;margin-bottom:20px}', /* Meta, label nhỏ */
            '.mhd3-hero-bc a{color:#71717a;text-decoration:none}', /* Body text */
            '.mhd3-hero-bc a:hover{color:#ef4444}',
            '.mhd3-hero-bc-sep{color:#2a2a2a}', /* Divider, decoration */
            '.mhd3-hero-eyebrow{display:inline-flex;align-items:center;gap:10px;' +
                'padding:6px 14px;background:#0a0a0a;border:1px solid #161616;' +
                'border-left:2px solid #ef4444;margin-bottom:24px}',
            '.mhd3-hero-eyebrow-dot{width:6px;height:6px;border-radius:50%;background:#ef4444;' +
                'animation:mhd3-pulse 2s ease-in-out infinite;flex-shrink:0}',
            '@keyframes mhd3-pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(239,68,68,.4)}' +
                '50%{opacity:.7;box-shadow:0 0 0 5px rgba(239,68,68,0)}}',
            '.mhd3-hero-eyebrow-text{font-size:9.5px;color:#3f3f46;letter-spacing:.12em;text-transform:uppercase}', /* Decoration / timestamp mờ */
            '.mhd3-hero h1{font-size:clamp(1.6rem,4.5vw,2.6rem);font-weight:700;color:#d4d4d8;' +
                'letter-spacing:.03em;text-transform:uppercase;margin:0 0 10px;line-height:1.2}',
            '.mhd3-hero h1 em{font-style:normal;color:#ef4444}',
            '.mhd3-hero-sub{font-size:10.5px;color:#71717a;margin:0}', /* Body text */

            /* ── Error code display ── */
            '.mhd3-errcode{font-size:9px;font-weight:700;letter-spacing:.3em;' + /* Decoration / timestamp mờ */
                'color:#3f3f46;text-transform:uppercase;margin-bottom:6px}',
            '.mhd3-errcode em{color:#b91c1c;font-style:normal}',

            /* ── Section wrapper ── */
            '.mhd3-section{padding:40px 0 0}', /* Decoration / timestamp mờ */
            '.mhd3-section-tag{font-size:8px;font-weight:700;letter-spacing:.3em;' + /* Decoration / timestamp mờ */
                'color:#3f3f46;text-transform:uppercase;margin-bottom:12px}',
            '.mhd3-section-tag em{color:#ef4444;font-style:normal}',

            /* ── Diagnostic selector ── */
            '.mhd3-diag{margin-bottom:6px}', /* Body text */
            '.mhd3-diag-label{font-size:9.5px;color:#71717a;margin-bottom:12px;letter-spacing:.06em}', /* Body text */
            '.mhd3-diag-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#111}',
            '@media(max-width:600px){.mhd3-diag-grid{grid-template-columns:1fr}}',
            '.mhd3-diag-card{background:#070707;padding:20px 18px;cursor:pointer;' +
                'border:2px solid transparent;transition:all .15s;position:relative;overflow:hidden}',
            '.mhd3-diag-card::before{content:"";position:absolute;inset:0;' +
                'background:linear-gradient(135deg,rgba(239,68,68,.03) 0%,transparent 60%);' +
                'opacity:0;transition:opacity .2s}',
            '.mhd3-diag-card:hover{background:#0d0d0d;border-color:#1f1f1f}',
            '.mhd3-diag-card:hover::before{opacity:1}',
            '.mhd3-diag-card.active{background:#0b0b0b;border-color:#ef4444}',
            '.mhd3-diag-card.active::before{opacity:1}',
            '.mhd3-dc-code{font-size:7.5px;font-weight:700;letter-spacing:.3em;' + /* Meta, label nhỏ */
                'color:#52525b;text-transform:uppercase;margin-bottom:10px}',
            '.mhd3-diag-card.active .mhd3-dc-code{color:#ef4444}',
            '.mhd3-dc-icon{font-size:1.4rem;margin-bottom:10px;line-height:1}',
            '.mhd3-dc-title{font-size:11.5px;font-weight:700;color:#52525b;' + /* Meta, label nhỏ */
                'text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px}',
            '.mhd3-diag-card.active .mhd3-dc-title{color:#d4d4d8}', /* Text chính */
            '.mhd3-dc-desc{font-size:9.5px;color:#71717a;line-height:1.8}', /* Body text */
            '.mhd3-diag-card.active .mhd3-dc-desc{color:#71717a}', /* Body text */
            '.mhd3-dc-cta{font-size:8.5px;color:#71717a;margin-top:12px;' + /* Body text */
                'display:flex;align-items:center;gap:6px;transition:color .15s}',
            '.mhd3-diag-card.active .mhd3-dc-cta{color:#ef4444}',
            '.mhd3-diag-hint{font-size:8.5px;color:#3f3f46;letter-spacing:.1em;margin-top:6px}', /* Decoration / timestamp mờ */

            /* ── Solution panel ── */
            '.mhd3-sol{display:none;margin-top:24px;background:#070707;' +
                'border:1px solid #141414;border-top:2px solid #ef4444;animation:mhd3-fadein .2s ease}',
            '.mhd3-sol.show{display:block}',
            '@keyframes mhd3-fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',

            /* Sol header */
            '.mhd3-sol-hdr{padding:20px 24px 16px;border-bottom:1px solid #0f0f0f;' +
                'display:flex;align-items:center;gap:14px}',
            '.mhd3-sol-hdr-icon{font-size:1.4rem;flex-shrink:0}',
            '.mhd3-sol-hdr-title{font-size:9.5px;font-weight:700;letter-spacing:.2em;' +
                'color:#ef4444;text-transform:uppercase}',
            '.mhd3-sol-hdr-sub{font-size:9px;color:#52525b;margin-top:2px}', /* Meta, label nhỏ */

            /* Sol body */
            '.mhd3-sol-body{padding:22px 24px}', /* Body text */
            '.mhd3-sol-intro{font-size:10.5px;color:#71717a;line-height:1.9;margin-bottom:20px}', /* Body text */
            '.mhd3-sol-intro strong{color:#a1a1aa}',
            '.mhd3-sol-intro a{color:#ef4444!important;text-decoration:underline!important;text-underline-offset:2px}',

            /* Steps */
            '.mhd3-steps{counter-reset:st;display:flex;flex-direction:column;gap:0;margin:0 0 20px}',
            '.mhd3-step{counter-increment:st;display:grid;grid-template-columns:40px 1fr;' +
                'gap:0;border-bottom:1px solid #0a0a0a;padding:14px 0}',
            '.mhd3-step:last-child{border-bottom:none}',
            '.mhd3-step-n{font-size:8px;font-weight:700;letter-spacing:.15em;color:#3f3f46;' + /* Decoration / timestamp mờ */
                'padding-top:3px}',
            '.mhd3-step-n::before{content:"0" counter(st)}',
            '.mhd3-step-body{font-size:10.5px;color:#71717a;line-height:1.9}', /* Body text */
            '.mhd3-step-body strong{color:#a1a1aa}',
            '.mhd3-step-body a{color:#ef4444!important;text-decoration:underline!important}',
            '.mhd3-step-sub{display:block;font-size:9px;color:#52525b;margin-top:3px}', /* Meta, label nhỏ */

            /* Info box */
            '.mhd3-infobox{background:#0a0a0a;border:1px solid #111;border-left:2px solid #52525b;' +
                'padding:14px 16px;margin:14px 0;font-size:9.5px;color:#71717a;line-height:1.8}', /* Body text */
            '.mhd3-infobox.warn{border-left-color:#f59e0b}',
            '.mhd3-infobox.warn strong{color:#d97706}',
            '.mhd3-infobox strong{color:#a1a1aa}',
            '.mhd3-infobox a{color:#ef4444!important;text-decoration:underline!important}',

            /* Rating table */
            '.mhd3-table{width:100%;border-collapse:collapse;margin:14px 0 4px;font-size:9.5px}',
            '.mhd3-table th{padding:8px 12px;background:#070707;color:#3f3f46;font-size:7.5px;' + /* Decoration / timestamp mờ */
                'letter-spacing:.2em;text-transform:uppercase;border-bottom:1px solid #111;text-align:left}',
            '.mhd3-table td{padding:10px 12px;border-bottom:1px solid #0a0a0a;color:#71717a;vertical-align:top}', /* Body text */
            '.mhd3-table tr:last-child td{border-bottom:none}',
            '.mhd3-td-access{color:#4ade80!important;font-weight:700}',
            '.mhd3-td-block{color:#ef4444!important}',
            '.mhd3-td-ok{color:#4ade80!important}',

            /* Accordion */
            '.mhd3-faq{display:flex;flex-direction:column;gap:1px;margin:16px 0}',
            '.mhd3-faq-item{background:#080808;border:1px solid #0f0f0f}',
            '.mhd3-faq-btn{width:100%;display:flex;align-items:center;gap:10px;' +
                'background:none;border:none;padding:12px 14px;cursor:pointer;text-align:left;' +
                'font-family:"JetBrains Mono",monospace;font-size:9.5px;font-weight:700;' +
                'color:#71717a;letter-spacing:.05em;text-transform:uppercase;transition:color .12s}', /* Body text */
            '.mhd3-faq-btn:hover,.mhd3-faq-item.open .mhd3-faq-btn{color:#ef4444}',
            '.mhd3-faq-item.open .mhd3-faq-btn{border-bottom:1px solid #0f0f0f}',
            '.mhd3-faq-ico{flex-shrink:0;width:15px;height:15px;border:1px solid #2a2a2a;' + /* Divider, decoration */
                'border-radius:50%;display:flex;align-items:center;justify-content:center;' +
                'font-size:10px;line-height:1;color:inherit;transition:border-color .12s}',
            '.mhd3-faq-item.open .mhd3-faq-ico{border-color:#ef4444}',
            '.mhd3-faq-body{display:none;padding:14px;font-size:10px;color:#71717a;line-height:1.9}', /* Body text */
            '.mhd3-faq-body a{color:#ef4444!important;text-decoration:underline!important}',
            '.mhd3-faq-item.open .mhd3-faq-body{display:block}',

            /* Buttons */
            '.mhd3-btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px;padding-top:16px;border-top:1px solid #0a0a0a}',
            '.mhd3-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 20px;' +
                'font-family:"JetBrains Mono",monospace;font-size:9px;font-weight:700;' +
                'letter-spacing:.14em;text-transform:uppercase;text-decoration:none!important;' +
                'border:1px solid;transition:all .18s;cursor:pointer}',
            '.mhd3-btn-primary{background:#ef4444;color:#fff!important;border-color:#ef4444}',
            '.mhd3-btn-primary:hover{background:#dc2626;border-color:#dc2626;' +
                'box-shadow:0 0 16px rgba(239,68,68,.3);color:#fff!important}',
            '.mhd3-btn-ghost{background:transparent;color:#71717a!important;border-color:#2a2a2a}', /* Body text, Divider */
            '.mhd3-btn-ghost:hover{background:#0d0d0d;border-color:#52525b;color:#a1a1aa!important}',

            /* Divider */
            '.mhd3-div{display:flex;align-items:center;gap:12px;margin:32px 0;color:#3f3f46;font-size:8px;letter-spacing:.2em;text-transform:uppercase}', /* Decoration / timestamp mờ */
            '.mhd3-div::before,.mhd3-div::after{content:"";flex:1;height:1px;background:#2a2a2a}', /* Divider, decoration */

            /* Still stuck */
            '.mhd3-stuck{text-align:center;padding:32px 24px;background:#070707;' +
                'border:1px solid #0f0f0f;margin-top:40px}',
            '.mhd3-stuck-tag{font-size:7.5px;font-weight:700;letter-spacing:.3em;' + /* Decoration / timestamp mờ */
                'color:#3f3f46;text-transform:uppercase;margin-bottom:10px}',
            '.mhd3-stuck-p{font-size:10px;color:#71717a;line-height:1.9;margin:0 0 18px}', /* Body text */
            '.mhd3-stuck-p a{color:#ef4444!important;text-decoration:underline!important}',

            /* Footer */
            '.mhd3-footer{margin-top:48px;padding-top:18px;border-top:1px solid #0a0a0a;' +
                'display:flex;align-items:center;gap:10px;font-size:8.5px;color:#3f3f46;' + /* Decoration / timestamp mờ */
                'letter-spacing:.15em;text-transform:uppercase}',
            '.mhd3-footer a{color:#3f3f46!important;text-decoration:none!important}', /* Decoration / timestamp mờ */
            '.mhd3-footer a:hover{color:#ef4444!important}',
            '.mhd3-footer-sep{color:#2a2a2a}', /* Divider, decoration */
        ].join('');
        document.head.appendChild(s);
    }

    function hideChrome() {
        var s = document.createElement('style');
        s.textContent = [
            '.vector-column-start,#mw-panel,.vector-main-menu-container,header.mw-header,',
            '.vector-header-container,.vector-sticky-header,#vector-sticky-header,',
            '.vector-page-titlebar,.vector-page-toolbar,.vector-column-end,',
            '#footer,.mw-footer-container,#firstHeading,.mw-indicators,',
            '#siteSub,#contentSub,.printfooter,#catlinks,.mw-body-header{display:none!important}',
            '.mw-page-container,#mw-content-text,.mw-body,#content,',
            '.vector-column-content,.mw-page-container-inner{padding:0!important;margin:0!important;',
            'max-width:100%!important;width:100%!important;background:transparent!important;',
            'border:none!important;box-shadow:none!important}',
            'html,body{background:#040404!important}',
        ].join('');
        document.head.appendChild(s);
    }

    /* ── FAQ accordion helper ── */
    function makeFaq(items) {
        var wrap = el('div', 'mhd3-faq');
        items.forEach(function(item) {
            var acc = el('div', 'mhd3-faq-item');
            var btn = el('button', 'mhd3-faq-btn');
            var ico = el('span', 'mhd3-faq-ico'); ico.textContent = '+';
            var lbl = el('span'); lbl.textContent = item.q;
            btn.appendChild(ico); btn.appendChild(lbl);
            var body = el('div', 'mhd3-faq-body'); body.innerHTML = item.a;
            btn.addEventListener('click', function() {
                var open = acc.classList.toggle('open');
                ico.textContent = open ? '−' : '+';
            });
            acc.appendChild(btn); acc.appendChild(body);
            wrap.appendChild(acc);
        });
        return wrap;
    }

    /* ── Steps helper ── */
    function makeSteps(items) {
        var wrap = el('div', 'mhd3-steps');
        items.forEach(function(s) {
            var step = el('div', 'mhd3-step');
            step.appendChild(el('div', 'mhd3-step-n'));
            var body = el('div', 'mhd3-step-body');
            body.innerHTML = s.main + (s.sub ? '<span class="mhd3-step-sub">' + s.sub + '</span>' : '');
            step.appendChild(body);
            wrap.appendChild(step);
        });
        return wrap;
    }

    /* ── Button helper ── */
    function makeBtn(href, label, primary) {
        var a = el('a', primary ? 'mhd3-btn mhd3-btn-primary' : 'mhd3-btn mhd3-btn-ghost');
        a.href = href; a.textContent = label;
        return a;
    }

    /* ── Build ── */
    function build() {
        var mwText = document.querySelector('#mw-content-text');
        if (!mwText) return;
        hideChrome();
        inlineCSS();
        injectCSS();
        mwText.innerHTML = '';

        var root = el('div');

        /* Top ribbon */
        root.appendChild(el('div', 'mhd3-ribbon'));

        var page = el('div', 'mhd3');

        /* ══ HERO ══ */
        var hero = el('div', 'mhd3-hero');
        hero.appendChild(el('div', 'mhd3-hero-logo',
            (window.MAPLE && window.MAPLE.logoSVG) ? window.MAPLE.logoSVG(58) : ''));

        var bc = el('div', 'mhd3-hero-bc');
        var bcA = el('a'); bcA.href = '/wiki/Trợ_giúp'; bcA.textContent = 'Trợ Giúp';
        bc.appendChild(bcA);
        bc.appendChild(el('span', 'mhd3-hero-bc-sep', '/'));
        bc.appendChild(document.createTextNode('Không Thể Xem Trang'));
        hero.appendChild(bc);

        var eyebrow = el('div', 'mhd3-hero-eyebrow');
        eyebrow.appendChild(el('span', 'mhd3-hero-eyebrow-dot'));
        eyebrow.appendChild(el('span', 'mhd3-hero-eyebrow-text', 'Trang chẩn đoán — bạn được dẫn đến đây từ màn hình truy cập bị từ chối'));
        hero.appendChild(eyebrow);

        var h1 = el('h1');
        h1.innerHTML = 'TẠI SAO TÔI KHÔNG THỂ <em>XEM TRANG NÀY?</em>';
        hero.appendChild(h1);
        hero.appendChild(el('p', 'mhd3-hero-sub', 'Chọn tình huống phù hợp — hệ thống sẽ hướng dẫn từng bước cụ thể.'));
        page.appendChild(hero);

        /* ══ CHẨN ĐOÁN ══ */
        var diagSec = el('div', 'mhd3-section');
        diagSec.appendChild(el('div', 'mhd3-section-tag', 'Bước 01 <em>//</em> Xác định tình huống'));

        var diagLabel = el('p', 'mhd3-diag-label');
        diagLabel.textContent = 'Hệ thống hiển thị màn hình "Truy cập bị từ chối" khi trang yêu cầu quyền cao hơn trạng thái tài khoản hiện tại. Tình huống nào dưới đây mô tả bạn chính xác nhất?';
        diagSec.appendChild(diagLabel);

        var cases = [
            {
                id: 'c-401',
                code: 'HTTP 401', icon: '🔑',
                title: 'Chưa Đăng Nhập',
                desc: 'Đang xem với tư cách khách, hoặc phiên đăng nhập đã hết hạn.',
                cta: '→ Hướng dẫn đăng nhập',
            },
            {
                id: 'c-403r',
                code: 'HTTP 403 / RATING', icon: '🔞',
                title: 'Nội Dung Bị Giới Hạn Độ Tuổi',
                desc: 'Đã đăng nhập nhưng trang được gắn nhãn 16+ hoặc 18+ — tài khoản chưa đủ điều kiện.',
                cta: '→ Xem cách mở khóa',
            },
            {
                id: 'c-403p',
                code: 'HTTP 403 / RESTRICTED', icon: '🔒',
                title: 'Trang Bị Giới Hạn Nhóm',
                desc: 'Trang bị Admin đặt chế độ read-protect — chỉ nhóm cụ thể mới truy cập được.',
                cta: '→ Cách yêu cầu quyền',
            },
        ];

        var diag = el('div', 'mhd3-diag');
        var grid = el('div', 'mhd3-diag-grid');
        var solPanels = {};

        cases.forEach(function(c) {
            var card = el('div', 'mhd3-diag-card');
            card.innerHTML =
                '<div class="mhd3-dc-code">' + c.code + '</div>' +
                '<div class="mhd3-dc-icon">' + c.icon + '</div>' +
                '<div class="mhd3-dc-title">' + c.title + '</div>' +
                '<div class="mhd3-dc-desc">' + c.desc + '</div>' +
                '<div class="mhd3-dc-cta">' + c.cta + '</div>';
            card.addEventListener('click', function() {
                grid.querySelectorAll('.mhd3-diag-card').forEach(function(cd) { cd.classList.remove('active'); });
                card.classList.add('active');
                Object.keys(solPanels).forEach(function(k) { solPanels[k].classList.remove('show'); });
                if (solPanels[c.id]) {
                    solPanels[c.id].classList.add('show');
                    setTimeout(function() { solPanels[c.id].scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 60);
                }
            });
            grid.appendChild(card);
        });
        diag.appendChild(grid);
        diag.appendChild(el('p', 'mhd3-diag-hint', '↑ Nhấn vào tình huống để xem hướng dẫn'));
        diagSec.appendChild(diag);
        page.appendChild(diagSec);

        /* ══ SOL 1 — Chưa đăng nhập ══ */
        var sol1 = el('div', 'mhd3-sol');
        solPanels['c-401'] = sol1;

        var s1h = el('div', 'mhd3-sol-hdr');
        s1h.innerHTML = '<div class="mhd3-sol-hdr-icon">🔑</div><div><div class="mhd3-sol-hdr-title">// Giải pháp — Đăng Nhập Để Tiếp Tục</div><div class="mhd3-sol-hdr-sub">ERR 401 · Chưa xác thực danh tính</div></div>';
        sol1.appendChild(s1h);

        var s1body = el('div', 'mhd3-sol-body');
        s1body.appendChild(el('p', 'mhd3-sol-intro',
            'M.A.P.L.E Wiki cho phép khách xem nội dung <strong>13+</strong>. Trang bạn đang cố truy cập có phân loại cao hơn — cần đăng nhập để xác thực danh tính.'));
        s1body.appendChild(makeSteps([
            { main: 'Nhấn nút <strong>ĐĂNG NHẬP</strong> trên màn hình từ chối', sub: 'Hoặc vào trực tiếp: <a href="/wiki/Special:UserLogin">Special:UserLogin</a>' },
            { main: 'Nhập tên người dùng và mật khẩu <strong>Miraheze</strong>', sub: 'Tài khoản Miraheze dùng chung cho tất cả wiki trong mạng lưới' },
            { main: 'Quay lại trang bạn muốn xem', sub: 'Hệ thống sẽ tự động kiểm tra lại quyền truy cập sau khi đăng nhập' },
        ]));
        s1body.appendChild(makeFaq([
            { q: 'Tôi chưa có tài khoản Miraheze',
              a: 'Đăng ký miễn phí tại <a href="/wiki/Special:CreateAccount">Special:CreateAccount</a>. Sau khi tạo tài khoản, bạn có thể đăng nhập và xem nội dung 16+ ngay lập tức.' },
            { q: 'Đã đăng nhập nhưng vẫn nhận lỗi 401',
              a: 'Phiên đăng nhập có thể hết hạn. Hãy đăng xuất tại <a href="/wiki/Special:UserLogout">Special:UserLogout</a> rồi đăng nhập lại. Nếu vẫn lỗi, xóa cache trình duyệt (Ctrl+Shift+Delete).' },
            { q: 'Tôi quên mật khẩu',
              a: 'Dùng tính năng "Quên mật khẩu" tại trang đăng nhập Miraheze. Admin M.A.P.L.E không thể can thiệp hệ thống mật khẩu Miraheze — liên hệ Miraheze Support nếu cả email cũng không truy cập được.' },
        ]));
        var s1btns = el('div', 'mhd3-btns');
        s1btns.appendChild(makeBtn('/wiki/Special:UserLogin', '⚿ Đăng Nhập', true));
        s1btns.appendChild(makeBtn('/wiki/Special:CreateAccount', 'Tạo Tài Khoản', false));
        s1body.appendChild(s1btns);
        sol1.appendChild(s1body);
        diagSec.appendChild(sol1);

        /* ══ SOL 2 — Nội dung 16+/18+ ══ */
        var sol2 = el('div', 'mhd3-sol');
        solPanels['c-403r'] = sol2;

        var s2h = el('div', 'mhd3-sol-hdr');
        s2h.innerHTML = '<div class="mhd3-sol-hdr-icon">🔞</div><div><div class="mhd3-sol-hdr-title">// Giải pháp — Nội Dung Phân Loại Độ Tuổi</div><div class="mhd3-sol-hdr-sub">ERR 403 · RATING — Phân loại nội dung nhạy cảm</div></div>';
        sol2.appendChild(s2h);

        var s2body = el('div', 'mhd3-sol-body');
        s2body.appendChild(el('p', 'mhd3-sol-intro',
            'Dù đã đăng nhập, một số nội dung vẫn bị giới hạn theo <strong>hệ thống phân loại nội dung M.A.P.L.E</strong>. Tài khoản cần được xác nhận thêm để xem nội dung nhạy cảm.'));

        var rtable = el('table', 'mhd3-table');
        rtable.innerHTML =
            '<tr><th>Mức phân loại</th><th>Ai có thể xem</th><th>Hành động</th></tr>' +
            '<tr><td>🟢 13+</td><td>Tất cả, kể cả khách</td><td class="mhd3-td-ok">Không cần làm gì</td></tr>' +
            '<tr><td>🟡 16+</td><td>Tài khoản đã đăng nhập</td><td class="mhd3-td-ok">Đăng nhập là đủ</td></tr>' +
            '<tr><td>🔴 18+</td><td>Tài khoản được Admin xác nhận</td><td class="mhd3-td-block">Cần liên hệ Admin</td></tr>';
        s2body.appendChild(rtable);

        s2body.appendChild(el('div', 'mhd3-infobox warn',
            '<strong>Đã đăng nhập vẫn bị chặn với nội dung 16+?</strong> Một số tài khoản mới cần được Admin kích hoạt thủ công. Hãy liên hệ theo hướng dẫn bên dưới.'));

        s2body.appendChild(makeFaq([
            { q: 'Đã đăng nhập nhưng trang 16+ vẫn bị chặn',
              a: 'Kiểm tra bạn đã thực sự đăng nhập (biểu tượng tài khoản góc trên phải). Nếu xác nhận đã đăng nhập mà vẫn bị chặn nội dung 16+, hãy <a href="/wiki/Trợ_giúp:Liên_hệ">liên hệ Admin</a> — tài khoản có thể cần được kích hoạt thủ công.' },
            { q: 'Muốn xem nội dung 18+ — cần làm gì?',
              a: 'Liên hệ Admin qua <a href="/wiki/Trợ_giúp:Liên_hệ">Trợ_giúp:Liên_hệ</a> và yêu cầu xác nhận tài khoản cho nội dung 18+. Admin sẽ kiểm tra và xác nhận trong vòng 48 giờ.' },
            { q: 'Thử xóa cache trình duyệt nếu mọi thứ vẫn không đúng',
              a: 'Nhấn Ctrl+F5 hoặc Ctrl+Shift+R để buộc trình duyệt tải lại trang. Nếu vẫn không được, thử mở trang trong cửa sổ ẩn danh sau khi đăng nhập.' },
        ]));
        var s2btns = el('div', 'mhd3-btns');
        s2btns.appendChild(makeBtn('/wiki/Trợ_giúp:Liên_hệ', 'Liên Hệ Admin', true));
        s2btns.appendChild(makeBtn('/wiki/Special:UserLogin', '⚿ Đăng Nhập', false));
        s2body.appendChild(s2btns);
        sol2.appendChild(s2body);
        diagSec.appendChild(sol2);

        /* ══ SOL 3 — Trang bị bảo vệ ══ */
        var sol3 = el('div', 'mhd3-sol');
        solPanels['c-403p'] = sol3;

        var s3h = el('div', 'mhd3-sol-hdr');
        s3h.innerHTML = '<div class="mhd3-sol-hdr-icon">🔒</div><div><div class="mhd3-sol-hdr-title">// Giải pháp — Trang Bị Giới Hạn Truy Cập</div><div class="mhd3-sol-hdr-sub">ERR 403 · RESTRICTED — Read-protect theo nhóm</div></div>';
        sol3.appendChild(s3h);

        var s3body = el('div', 'mhd3-sol-body');
        s3body.appendChild(el('p', 'mhd3-sol-intro',
            'Một số trang được Admin đặt chế độ <strong>read-protect</strong> — chỉ các nhóm cụ thể mới truy cập được, bất kể trạng thái đăng nhập. Đây thường là tài liệu nội bộ, hồ sơ mật chưa công bố, hoặc nội dung đang xử lý.'));

        var s3infobox = el('div', 'mhd3-infobox');
        s3infobox.innerHTML =
            '<strong>Các loại trang thường bị read-protect:</strong><br>' +
            '· Tài liệu nội bộ Admin / Kiểm Duyệt Viên<br>' +
            '· Hồ sơ mật (Classified) chưa được công bố<br>' +
            '· Trang đang xây dựng hoặc kiểm tra<br>' +
            '· Nội dung chứa thông tin nhạy cảm cộng đồng';
        s3body.appendChild(s3infobox);

        s3body.appendChild(makeSteps([
            { main: 'Xác nhận bạn <strong>đã đăng nhập</strong>', sub: 'Nếu chưa, đăng nhập trước tại <a href="/wiki/Special:UserLogin">Special:UserLogin</a>' },
            { main: 'Copy toàn bộ URL của trang muốn xem' },
            { main: 'Liên hệ Admin qua <a href="/wiki/Trợ_giúp:Liên_hệ">Trợ_giúp:Liên_hệ</a>', sub: 'Cung cấp URL và giải thích lý do bạn cần truy cập' },
            { main: 'Chờ phản hồi trong <strong>48 giờ</strong>', sub: 'Không gửi yêu cầu lặp lại trước khi hết thời gian — yêu cầu spam có thể dẫn đến hạn chế tài khoản' },
        ]));
        s3body.appendChild(makeFaq([
            { q: 'Tôi được mời đọc trang này bởi một thành viên',
              a: 'Yêu cầu thành viên đó liên hệ Admin thay bạn, hoặc tự liên hệ Admin và đề cập tên thành viên đã mời. Admin có thể cấp quyền đọc cá nhân cho bạn.' },
            { q: 'Trang hiển thị "không tồn tại" thay vì "từ chối"',
              a: 'Đây là cách MediaWiki ẩn trang được bảo vệ mạnh — trang vẫn tồn tại nhưng ẩn hoàn toàn với người không đủ quyền. Cách xử lý tương tự: liên hệ Admin với URL.' },
        ]));
        var s3btns = el('div', 'mhd3-btns');
        s3btns.appendChild(makeBtn('/wiki/Trợ_giúp:Liên_hệ', 'Liên Hệ Admin', true));
        s3body.appendChild(s3btns);
        sol3.appendChild(s3body);
        diagSec.appendChild(sol3);

        /* ══ STILL STUCK ══ */
        var stuck = el('div', 'mhd3-stuck');
        stuck.innerHTML =
            '<div class="mhd3-stuck-tag">Vẫn chưa giải quyết được?</div>' +
            '<p class="mhd3-stuck-p">Nếu không có tình huống nào ở trên phù hợp, hoặc bạn đã thử các bước nhưng vẫn gặp vấn đề, hãy liên hệ trực tiếp đội Admin — chúng tôi sẽ xem xét cụ thể trường hợp của bạn.</p>';
        var stuckBtns = el('div', 'mhd3-btns');
        stuckBtns.style.justifyContent = 'center';
        stuckBtns.appendChild(makeBtn('/wiki/Trợ_giúp:Liên_hệ', '↗ Liên Hệ Admin', true));
        stuck.appendChild(stuckBtns);
        page.appendChild(stuck);

        /* ══ FOOTER ══ */
        var footer = el('div', 'mhd3-footer');
        var fa = el('a'); fa.href = '/wiki/Trợ_giúp'; fa.textContent = '← Trợ Giúp';
        footer.appendChild(fa);
        footer.appendChild(el('span', 'mhd3-footer-sep', '|'));
        footer.appendChild(document.createTextNode('M.A.P.L.E WIKI © ' + new Date().getFullYear()));
        page.appendChild(footer);

        root.appendChild(page);
        mwText.appendChild(root);
    }

    function inlineCSS() { /* alias — đã gộp vào injectCSS */ }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
