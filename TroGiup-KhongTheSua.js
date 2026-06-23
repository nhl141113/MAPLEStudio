/**
 * M.A.P.L.E — MediaWiki:TroGiup-KhongTheSua.js  v3
 * Trang Trợ_giúp:Không_thể_chỉnh_sửa_trang
 * Design mới: full diagnostic — timeline + cards + perm grid
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    var rEdit = /Kh[oô]ng.*th[eể].*ch[iỉ]nh/i;
    if (pn && pn !== 'Trợ_giúp:Không_thể_chỉnh_sửa_trang' && !rEdit.test(decoded)) return;
    if (!pn && !rEdit.test(decoded)) return;

    function el(tag, cls, html) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (html) e.innerHTML = html;
        return e;
    }

    /* Diagnostic-specific CSS (diag-grid + solution panels) — chỉ riêng trang này.
       Các class chung (mhd3-hero/section/steps/faq/infobox/perm/btns/footer)
       đã nằm ở MediaWiki:TroGiup.css. */
    function injectCSS() {
        if (document.getElementById('mhd3e-style')) return;
        var s = document.createElement('style');
        s.id = 'mhd3e-style';
        s.textContent = [
            '.mhd3-diag-label{font-size:9.5px;color:#71717a;margin-bottom:12px;letter-spacing:.06em}', /* Body text */
            '.mhd3-diag-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#111}',
            '@media(max-width:600px){.mhd3-diag-grid{grid-template-columns:1fr}}',
            '.mhd3-diag-card{background:#070707;padding:20px 18px;cursor:pointer;border:2px solid transparent;transition:all .15s;position:relative}',
            '.mhd3-diag-card:hover{background:#0d0d0d;border-color:#1f1f1f}',
            '.mhd3-diag-card.active{background:#0b0b0b;border-color:#ef4444}',
            '.mhd3-dc-code{font-size:7.5px;font-weight:700;letter-spacing:.3em;color:#52525b;text-transform:uppercase;margin-bottom:10px}', /* Meta, label nhỏ */
            '.mhd3-diag-card.active .mhd3-dc-code{color:#ef4444}',
            '.mhd3-dc-icon{font-size:1.4rem;margin-bottom:10px;line-height:1}',
            '.mhd3-dc-title{font-size:11.5px;font-weight:700;color:#52525b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px}', /* Meta, label nhỏ */
            '.mhd3-diag-card.active .mhd3-dc-title{color:#d4d4d8}', /* Text chính */
            '.mhd3-dc-desc{font-size:9.5px;color:#71717a;line-height:1.8}', /* Body text */
            '.mhd3-diag-card.active .mhd3-dc-desc{color:#71717a}', /* Body text */
            '.mhd3-dc-cta{font-size:8.5px;color:#71717a;margin-top:12px;display:flex;align-items:center;gap:6px;transition:color .15s}', /* Body text */
            '.mhd3-diag-card.active .mhd3-dc-cta{color:#ef4444}',
            '.mhd3-diag-hint{font-size:8.5px;color:#3f3f46;letter-spacing:.1em;margin-top:6px}', /* Decoration / timestamp mờ */
            '.mhd3-sol{display:none;margin-top:24px;background:#070707;border:1px solid #141414;border-top:2px solid #ef4444;animation:mhd3-fadein .2s ease}',
            '.mhd3-sol.show{display:block}',
            '@keyframes mhd3-fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
            '.mhd3-sol-hdr{padding:20px 24px 16px;border-bottom:1px solid #0f0f0f;display:flex;align-items:center;gap:14px}',
            '.mhd3-sol-hdr-icon{font-size:1.4rem;flex-shrink:0}',
            '.mhd3-sol-hdr-title{font-size:9.5px;font-weight:700;letter-spacing:.2em;color:#ef4444;text-transform:uppercase}',
            '.mhd3-sol-hdr-sub{font-size:9px;color:#52525b;margin-top:2px}', /* Meta, label nhỏ */
            '.mhd3-sol-body{padding:22px 24px}',
            '.mhd3-sol-intro{font-size:10.5px;color:#71717a;line-height:1.9;margin-bottom:20px}', /* Body text */
            '.mhd3-sol-intro strong{color:#a1a1aa}',
            '.mhd3-sol-intro a{color:#ef4444!important;text-decoration:underline!important;text-underline-offset:2px}',
        ].join('');
        document.head.appendChild(s);
    }

    /* Ẩn chrome — ưu tiên helper chung, fallback tối thiểu */
    function hideChrome() {
        if (window.MHHelp && window.MHHelp.hideChrome) { window.MHHelp.hideChrome(); return; }
        var s = document.createElement('style');
        s.textContent =
            '.vector-column-start,#mw-panel,.vector-main-menu-container,header.mw-header,' +
            '.vector-header-container,.vector-sticky-header,#vector-sticky-header,' +
            '.vector-page-titlebar,.vector-page-toolbar,.vector-column-end,' +
            '#footer,.mw-footer-container,#firstHeading,.mw-indicators,' +
            '#siteSub,#contentSub,.printfooter,#catlinks,.mw-body-header{display:none!important}' +
            '.mw-page-container,#mw-content-text,.mw-body,#content,' +
            '.vector-column-content,.mw-page-container-inner{padding:0!important;margin:0!important;' +
            'max-width:100%!important;width:100%!important;background:transparent!important;' +
            'border:none!important;box-shadow:none!important}' +
            'html,body{background:#040404!important}';
        document.head.appendChild(s);
    }

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

    function makeBtn(href, label, primary) {
        var a = el('a', primary ? 'mhd3-btn mhd3-btn-primary' : 'mhd3-btn mhd3-btn-ghost');
        a.href = href; a.textContent = label;
        return a;
    }

    /* Nút "Liên hệ Admin" — MỞ MAPLE-Chat thật (không trỏ trang tĩnh nữa) */
    function adminBtn(label, primary) {
        if (window.MHHelp && window.MHHelp.contactAdminBtn) {
            return window.MHHelp.contactAdminBtn(label, primary);
        }
        var b = el('button', primary ? 'mhd3-btn mhd3-btn-primary' : 'mhd3-btn mhd3-btn-ghost');
        b.type = 'button'; b.textContent = label;
        b.addEventListener('click', function () {
            if (window.MAPLEChat && window.MAPLEChat.openChatWith) window.MAPLEChat.openChatWith('Mapleofficialvn');
            else if (window.MAPLEChat && window.MAPLEChat.open) window.MAPLEChat.open();
            else location.href = '/wiki/Đặc_biệt:Đăng_nhập';
        });
        return b;
    }

    function makePermGrid() {
        var grid = el('div', 'mhd3-perm-grid');
        [
            { role: 'Khách',          can: [],                                    cant: ['Tạo trang','Chỉnh sửa'] },
            { role: 'Tài Khoản Mới', can: [],                                    cant: ['Tạo trang','Chỉnh sửa'] },
            { role: 'Writer',         can: ['Tạo trang','Chỉnh sửa*'],            cant: [], edit: true },
            { role: 'Kiểm Duyệt',    can: ['Tạo trang','Chỉnh sửa','Duyệt bài'],cant: [], edit: true },
            { role: 'LTV',            can: ['Chỉnh sửa','MW JS/CSS'],             cant: [], edit: true },
            { role: 'Admin',          can: ['Toàn quyền'],                        cant: [], edit: true },
        ].forEach(function(g) {
            var card = el('div', g.edit ? 'mhd3-perm-card edit' : 'mhd3-perm-card');
            card.appendChild(el('div', 'mhd3-perm-role', g.role));
            g.can.forEach(function(t) { card.appendChild(el('div', 'mhd3-perm-item can', t)); });
            g.cant.forEach(function(t) { card.appendChild(el('div', 'mhd3-perm-item cant', t)); });
            grid.appendChild(card);
        });
        var wrap = el('div');
        wrap.appendChild(grid);
        wrap.appendChild(el('p', 'mhd3-perm-note', '* Writer chỉ sửa được trang do mình tạo hoặc trang chưa bị khóa.'));
        return wrap;
    }

    function build() {
        var mwText = document.querySelector('#mw-content-text');
        if (!mwText) return;
        hideChrome();
        injectCSS();
        mwText.innerHTML = '';

        var root = el('div');
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
        bc.appendChild(document.createTextNode('Không Thể Chỉnh Sửa'));
        hero.appendChild(bc);

        var eyebrow = el('div', 'mhd3-hero-eyebrow');
        eyebrow.appendChild(el('span', 'mhd3-hero-eyebrow-dot'));
        eyebrow.appendChild(el('span', 'mhd3-hero-eyebrow-text', 'Trang chẩn đoán — bạn được dẫn đến đây từ màn hình từ chối chỉnh sửa'));
        hero.appendChild(eyebrow);

        var h1 = el('h1');
        h1.innerHTML = 'TẠI SAO TÔI KHÔNG THỂ <em>CHỈNH SỬA TRANG?</em>';
        hero.appendChild(h1);
        hero.appendChild(el('p', 'mhd3-hero-sub', 'Chọn tình huống phù hợp — hệ thống sẽ hướng dẫn từng bước cụ thể.'));
        page.appendChild(hero);

        /* ══ CHẨN ĐOÁN ══ */
        var diagSec = el('div', 'mhd3-section');
        diagSec.appendChild(el('div', 'mhd3-section-tag', 'Bước 01 <em>//</em> Xác định tình huống'));

        var diagLabel = el('p', 'mhd3-diag-label');
        diagLabel.textContent = 'Bạn nhấn nút "Sửa đổi" nhưng hệ thống từ chối. Tình huống nào dưới đây mô tả bạn chính xác nhất?';
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
                id: 'c-403w',
                code: 'HTTP 403 / NO WRITER', icon: '✍️',
                title: 'Chưa Có Quyền Writer',
                desc: 'Đã đăng nhập nhưng chưa được cấp nhóm Writer — nhóm tối thiểu để chỉnh sửa.',
                cta: '→ Cách xin quyền Writer',
            },
            {
                id: 'c-403l',
                code: 'HTTP 403 / PROTECTED', icon: '🔒',
                title: 'Trang Bị Khóa',
                desc: 'Đã có Writer nhưng trang cụ thể này bị Admin khóa ở cấp cao hơn.',
                cta: '→ Cách yêu cầu mở khóa',
            },
        ];

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
        diagSec.appendChild(grid);
        diagSec.appendChild(el('p', 'mhd3-diag-hint', '↑ Nhấn vào tình huống để xem hướng dẫn'));

        /* ══ SOL 1 — Chưa đăng nhập ══ */
        var sol1 = el('div', 'mhd3-sol');
        solPanels['c-401'] = sol1;
        var s1h = el('div', 'mhd3-sol-hdr');
        s1h.innerHTML = '<div class="mhd3-sol-hdr-icon">🔑</div><div><div class="mhd3-sol-hdr-title">// Giải pháp — Đăng Nhập Để Chỉnh Sửa</div><div class="mhd3-sol-hdr-sub">ERR 401 · Chưa xác thực danh tính</div></div>';
        sol1.appendChild(s1h);
        var s1body = el('div', 'mhd3-sol-body');
        s1body.appendChild(el('p', 'mhd3-sol-intro', 'Chỉnh sửa trang yêu cầu tài khoản xác thực. Khách không thể thực hiện bất kỳ thao tác ghi nào trên M.A.P.L.E Wiki — kể cả chỉnh sửa nhỏ.'));
        s1body.appendChild(makeSteps([
            { main: 'Nhấn nút <strong>ĐĂNG NHẬP</strong> trên màn hình từ chối', sub: 'Hoặc vào: <a href="/wiki/Special:UserLogin">Special:UserLogin</a>' },
            { main: 'Đăng nhập bằng tài khoản <strong>Miraheze</strong>', sub: 'Cùng tài khoản dùng cho tất cả wiki trong mạng lưới Miraheze' },
            { main: 'Quay lại trang và thử chỉnh sửa lại', sub: 'Nếu bạn có quyền Writer, trang sẽ mở được — nếu không, xem tình huống 2 bên dưới' },
        ]));
        s1body.appendChild(makeFaq([
            { q: 'Tôi chưa có tài khoản',
              a: 'Đăng ký tại <a href="/wiki/Special:CreateAccount">Special:CreateAccount</a> (miễn phí). Sau đó bạn cần xin quyền Writer — xem tình huống 2.' },
            { q: 'Đăng nhập rồi nhưng vẫn bị lỗi 401',
              a: 'Phiên có thể hết hạn. Đăng xuất tại <a href="/wiki/Special:UserLogout">Special:UserLogout</a> rồi đăng nhập lại, hoặc thử xóa cookie trình duyệt.' },
        ]));
        var s1btns = el('div', 'mhd3-btns');
        s1btns.appendChild(makeBtn('/wiki/Special:UserLogin', '⚿ Đăng Nhập', true));
        s1btns.appendChild(makeBtn('/wiki/Special:CreateAccount', 'Tạo Tài Khoản', false));
        s1body.appendChild(s1btns);
        sol1.appendChild(s1body);
        diagSec.appendChild(sol1);

        /* ══ SOL 2 — Thiếu quyền Writer ══ */
        var sol2 = el('div', 'mhd3-sol');
        solPanels['c-403w'] = sol2;
        var s2h = el('div', 'mhd3-sol-hdr');
        s2h.innerHTML = '<div class="mhd3-sol-hdr-icon">✍️</div><div><div class="mhd3-sol-hdr-title">// Giải pháp — Xin Cấp Quyền Writer</div><div class="mhd3-sol-hdr-sub">ERR 403 · Không đủ quyền ghi</div></div>';
        sol2.appendChild(s2h);
        var s2body = el('div', 'mhd3-sol-body');
        s2body.appendChild(el('p', 'mhd3-sol-intro',
            'Tài khoản Miraheze mới <strong>không tự động có quyền chỉnh sửa</strong> trên M.A.P.L.E Wiki. Bạn cần được Admin cấp nhóm <strong>Writer</strong> trước khi có thể tạo hoặc sửa bất kỳ trang nào.'));

        s2body.appendChild(makePermGrid());

        s2body.appendChild(makeSteps([
            { main: 'Đảm bảo bạn <strong>đã đăng nhập</strong>', sub: 'Quyền Writer chỉ áp dụng cho tài khoản đã xác thực' },
            { main: 'Liên hệ Admin qua <a href="/wiki/Trợ_giúp:Liên_hệ">Trợ_giúp:Liên_hệ</a>', sub: 'Đề nghị cấp quyền Writer, nêu tên người dùng Miraheze của bạn' },
            { main: 'Chờ Admin xử lý', sub: 'Thường trong vòng 24 giờ — không gửi yêu cầu lặp lại' },
            { main: 'Sau khi được cấp, thử chỉnh sửa lại', sub: 'Có thể cần đăng xuất và đăng nhập lại để quyền có hiệu lực' },
        ]));

        s2body.appendChild(makeFaq([
            { q: 'Tôi đã có Writer nhưng vẫn không sửa được trang này',
              a: 'Trang có thể bị khóa ở cấp cao hơn Writer. Xem tình huống 3 — "Trang bị khóa".' },
            { q: 'Tôi muốn xin quyền cao hơn (KDV / LTV)',
              a: 'Các quyền cao hơn được cấp theo đánh giá nội bộ của Admin. Không thể tự yêu cầu — Admin sẽ chủ động cấp khi thấy đủ điều kiện.' },
        ]));
        var s2btns = el('div', 'mhd3-btns');
        s2btns.appendChild(adminBtn('Xin Quyền Writer', true));
        s2body.appendChild(s2btns);
        sol2.appendChild(s2body);
        diagSec.appendChild(sol2);

        /* ══ SOL 3 — Trang bị khóa ══ */
        var sol3 = el('div', 'mhd3-sol');
        solPanels['c-403l'] = sol3;
        var s3h = el('div', 'mhd3-sol-hdr'); /* Meta, label nhỏ */
        s3h.innerHTML = '<div class="mhd3-sol-hdr-icon">🔒</div><div><div class="mhd3-sol-hdr-title">// Giải pháp — Trang Bị Khóa Chỉnh Sửa</div><div class="mhd3-sol-hdr-sub">ERR 403 · PROTECTED — Trang bị lock cấp cao</div></div>';
        sol3.appendChild(s3h);
        var s3body = el('div', 'mhd3-sol-body');
        s3body.appendChild(el('p', 'mhd3-sol-intro',
            'Admin có thể khóa một trang cụ thể để ngăn chỉnh sửa, kể cả với Writer. Trang bị khóa vẫn có thể đọc được, nhưng nút sửa đổi sẽ dẫn đến màn hình từ chối.'));

        var s3ib = el('div', 'mhd3-infobox');
        s3ib.innerHTML =
            '<strong>Lý do trang thường bị khóa:</strong><br>' +
            '· Nội dung đang chờ kiểm duyệt<br>' +
            '· Trang hệ thống / nội dung chính thức không cho phép sửa ngoài ý<br>' +
            '· Trang bị vandal — khóa tạm thời<br>' +
            '· Trang nội bộ chỉ Admin mới sửa';
        s3body.appendChild(s3ib);

        s3body.appendChild(makeFaq([
            { q: 'Làm sao biết trang có bị khóa không?',
              a: 'Xem tab <em>Lịch sử</em> của trang — log khóa sẽ xuất hiện ở đó. Biểu tượng ổ khóa nhỏ cũng thường xuất hiện góc tiêu đề trang với một số skin.' },
            { q: 'Tôi cần sửa một lỗi nhỏ trên trang bị khóa',
              a: 'Liên hệ Admin qua <a href="/wiki/Trợ_giúp:Liên_hệ">Trợ_giúp:Liên_hệ</a>, cung cấp URL trang và nội dung cụ thể cần sửa. Admin có thể sửa hộ hoặc mở khóa tạm thời.' },
            { q: 'Trang bị khóa vì đang trong kiểm duyệt',
              a: 'Nếu đây là trang do bạn tạo và đang chờ duyệt, theo dõi trạng thái tại trang Chờ_Duyệt của bạn. Không sửa trang gốc trong thời gian chờ duyệt — có thể gây conflict.' },
        ]));
        var s3btns = el('div', 'mhd3-btns');
        s3btns.appendChild(adminBtn('Yêu Cầu Mở Khóa', true));
        s3body.appendChild(s3btns);
        sol3.appendChild(s3body);
        diagSec.appendChild(sol3);

        page.appendChild(diagSec);

        /* ══ STILL STUCK ══ */
        var stuck = el('div', 'mhd3-stuck');
        stuck.innerHTML =
            '<div class="mhd3-stuck-tag">Vẫn chưa giải quyết được?</div>' +
            '<p class="mhd3-stuck-p">Nếu không có tình huống nào phù hợp, hoặc bạn đã thử các bước nhưng vẫn gặp vấn đề, hãy liên hệ trực tiếp đội Admin — chúng tôi sẽ xem xét cụ thể trường hợp của bạn.</p>';
        var stuckBtns = el('div', 'mhd3-btns');
        stuckBtns.style.justifyContent = 'center';
        stuckBtns.appendChild(adminBtn('↗ Nhắn tin cho Admin', true));
        stuck.appendChild(stuckBtns);
        page.appendChild(stuck);

        /* ══ FOOTER ══ */
        var footer = el('div', 'mhd3-footer');
        var fa = el('a'); fa.href = '/wiki/Trợ_giúp'; fa.textContent = '← Trợ Giúp';
        footer.appendChild(fa);
        footer.appendChild(el('span', 'mhd3-footer-sep', '|')); /* Divider, decoration */
        footer.appendChild(document.createTextNode('M.A.P.L.E WIKI © ' + new Date().getFullYear()));
        page.appendChild(footer);

        root.appendChild(page);
        mwText.appendChild(root);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
