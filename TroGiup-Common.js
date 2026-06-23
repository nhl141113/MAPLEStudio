/**
 * ════════════════════════════════════════════════════════════════════════
 * M.A.P.L.E — MediaWiki:TroGiup-Common.js
 * Helper DÙNG CHUNG cho mọi trang trợ giúp con (phong cách mhd3-*).
 *
 * Export:  window.MHHelp = {
 *     el, hideChrome, ribbon, hero, section, prose, steps, faq,
 *     infobox, btns, btn, contactAdminBtn, stuck, footer, mount
 * }
 *
 * CSS class mhd3-* nằm ở MediaWiki:TroGiup.css (đã loadCSS('TroGiup') cho ns=12).
 * Mỗi trang con: chờ MHHelp sẵn sàng (loadSequence ở Common.js) → gọi build().
 * ════════════════════════════════════════════════════════════════════════
 */
(function () {
    'use strict';

    if (window.MHHelp) return; /* đã nạp */

    /* Admin liên hệ (đã chốt) */
    var ADMIN_PRIMARY = 'Mapleofficialvn';
    var ADMIN_BACKUP  = 'Maplewikiofficialvn';

    /* ── el(tag, cls, html) — html là innerHTML; người gọi tự đảm bảo an toàn ── */
    function el(tag, cls, html) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (html != null) e.innerHTML = html;
        return e;
    }
    function txt(node, t) { node.textContent = t; return node; }

    /* ── Ẩn chrome MediaWiki + nền tối ── */
    function hideChrome() {
        if (document.getElementById('mhd3-hidechrome')) return;
        var s = document.createElement('style');
        s.id = 'mhd3-hidechrome';
        s.textContent =
            '.vector-column-start,#mw-panel,.vector-main-menu-container,' +
            'header.mw-header,.vector-header-container,.vector-sticky-header,' +
            '#vector-sticky-header,.vector-page-titlebar,.vector-page-toolbar,' +
            '.vector-column-end,#footer,.mw-footer-container,' +
            '#firstHeading,.mw-indicators,#siteSub,#contentSub,' +
            '.printfooter,#catlinks,.mw-body-header{display:none!important}' +
            '.mw-page-container,#mw-content-text,.mw-body,#content,' +
            '.vector-column-content,.mw-page-container-inner{' +
            'padding:0!important;margin:0!important;max-width:100%!important;' +
            'width:100%!important;background:transparent!important;' +
            'border:none!important;box-shadow:none!important}' +
            'html,body{background:#040404!important}';
        document.head.appendChild(s);
    }

    /* ── Ribbon đỏ ở đầu ── */
    function ribbon() { return el('div', 'mhd3-ribbon'); }

    /* ── Hero: { crumb, eyebrow, title (cho phép <em>), sub } ── */
    function hero(opts) {
        opts = opts || {};
        var h = el('div', 'mhd3-hero');

        var bc = el('div', 'mhd3-hero-bc');
        var a = el('a'); a.href = '/wiki/Trợ_giúp'; a.textContent = 'Trợ Giúp';
        bc.appendChild(a);
        bc.appendChild(el('span', 'mhd3-hero-bc-sep', '/'));
        bc.appendChild(document.createTextNode(opts.crumb || ''));
        h.appendChild(bc);

        if (opts.eyebrow) {
            var eb = el('div', 'mhd3-hero-eyebrow');
            eb.appendChild(el('span', 'mhd3-hero-eyebrow-dot'));
            eb.appendChild(txt(el('span', 'mhd3-hero-eyebrow-text'), opts.eyebrow));
            h.appendChild(eb);
        }

        var h1 = el('h1');
        h1.innerHTML = opts.title || ''; /* title có thể chứa <em> — người gọi kiểm soát */
        h.appendChild(h1);

        if (opts.sub) h.appendChild(txt(el('p', 'mhd3-hero-sub'), opts.sub));
        return h;
    }

    /* ── Section: tag (vd "01 // Tổng quan") + heading ── */
    function section(opts) {
        opts = opts || {};
        var s = el('div', 'mhd3-section');
        if (opts.id) s.id = opts.id;
        if (opts.tag) {
            var t = el('div', 'mhd3-section-tag');
            t.innerHTML = opts.tag; /* cho phép <em> phân cách */
            s.appendChild(t);
        }
        if (opts.heading) s.appendChild(txt(el('h2'), opts.heading));
        return s;
    }

    /* ── Prose: nhận chuỗi HTML (người gọi kiểm soát) hoặc mảng đoạn ── */
    function prose(html) {
        var d = el('div', 'mhd3-prose');
        if (Array.isArray(html)) {
            html.forEach(function (p) { d.appendChild(el('p', null, p)); });
        } else {
            d.innerHTML = html || '';
        }
        return d;
    }

    /* ── Steps: [{ main, sub }] ── */
    function steps(items) {
        var wrap = el('div', 'mhd3-steps');
        (items || []).forEach(function (s) {
            var step = el('div', 'mhd3-step');
            step.appendChild(el('div', 'mhd3-step-n'));
            var body = el('div', 'mhd3-step-body');
            body.innerHTML = s.main + (s.sub ? '<span class="mhd3-step-sub">' + s.sub + '</span>' : '');
            step.appendChild(body);
            wrap.appendChild(step);
        });
        return wrap;
    }

    /* ── FAQ accordion: [{ q, a }] (q = text, a = HTML) ── */
    function faq(items) {
        var wrap = el('div', 'mhd3-faq');
        (items || []).forEach(function (item) {
            var acc = el('div', 'mhd3-faq-item');
            var btn = el('button', 'mhd3-faq-btn');
            var ico = el('span', 'mhd3-faq-ico'); ico.textContent = '+';
            var lbl = el('span'); lbl.textContent = item.q;
            btn.appendChild(ico); btn.appendChild(lbl);
            var body = el('div', 'mhd3-faq-body'); body.innerHTML = item.a;
            btn.addEventListener('click', function () {
                var open = acc.classList.toggle('open');
                ico.textContent = open ? '−' : '+';
            });
            acc.appendChild(btn); acc.appendChild(body);
            wrap.appendChild(acc);
        });
        return wrap;
    }

    /* ── Infobox: (html, warn?) ── */
    function infobox(html, warn) {
        var d = el('div', warn ? 'mhd3-infobox warn' : 'mhd3-infobox');
        d.innerHTML = html;
        return d;
    }

    /* ── Bảng phím tắt / cú pháp: [[key, desc], ...] ── */
    function keys(rows) {
        var wrap = el('div', 'mhd3-keys');
        (rows || []).forEach(function (r) {
            var item = el('div', 'mhd3-key-item');
            var k = el('kbd', 'mhd3-kbd'); k.textContent = r[0];
            item.appendChild(k);
            var d = el('span', 'mhd3-key-desc'); d.innerHTML = r[1]; /* desc có thể chứa cú pháp */
            item.appendChild(d);
            wrap.appendChild(item);
        });
        return wrap;
    }

    /* ── Lưới vai trò/quyền: [{ role, items:[...] , edit?:bool }] ── */
    function roles(cards) {
        var grid = el('div', 'mhd3-perm-grid');
        (cards || []).forEach(function (c) {
            var card = el('div', c.edit ? 'mhd3-perm-card edit' : 'mhd3-perm-card');
            card.appendChild(txt(el('div', 'mhd3-perm-role'), c.role));
            (c.items || []).forEach(function (t) {
                card.appendChild(txt(el('div', 'mhd3-perm-item can'), t));
            });
            grid.appendChild(card);
        });
        return grid;
    }

    /* ── Bảng cú pháp: [[code, desc], ...] (code = text, desc = text) ── */
    function syntax(rows) {
        var wrap = el('div', 'mhd3-syntax');
        (rows || []).forEach(function (r) {
            var item = el('div', 'mhd3-syntax-item');
            item.appendChild(txt(el('code', 'mhd3-syntax-code'), r[0]));
            item.appendChild(txt(el('span', 'mhd3-syntax-arrow'), '→'));
            item.appendChild(txt(el('span', 'mhd3-syntax-desc'), r[1]));
            wrap.appendChild(item);
        });
        return wrap;
    }

    /* ── Code block có nút copy ── */
    function code(label, codeText) {
        var wrap = el('div', 'mhd3-code-block');
        if (label) wrap.appendChild(txt(el('span', 'mhd3-code-label'), label));
        var b = el('button', 'mhd3-code-copy'); b.type = 'button'; b.textContent = 'Copy';
        b.addEventListener('click', function () {
            if (navigator.clipboard) navigator.clipboard.writeText(codeText).then(function () {
                b.textContent = 'Copied!'; b.classList.add('copied');
                setTimeout(function () { b.textContent = 'Copy'; b.classList.remove('copied'); }, 1800);
            });
        });
        wrap.appendChild(b);
        var pre = document.createElement('pre'); pre.textContent = codeText;
        wrap.appendChild(pre);
        return wrap;
    }

    /* ── Bảng tham số: rows = [[name, type, desc], ...]; heads tùy chọn ── */
    function params(rows, heads) {
        heads = heads || ['Thuộc tính', 'Loại', 'Mô tả'];
        var t = el('table', 'mhd3-params');
        var thead = document.createElement('thead');
        var hr = document.createElement('tr');
        heads.forEach(function (h) { hr.appendChild(txt(document.createElement('th'), h)); });
        thead.appendChild(hr); t.appendChild(thead);
        var tb = document.createElement('tbody');
        (rows || []).forEach(function (row) {
            var tr = document.createElement('tr');
            row.forEach(function (cell, i) {
                var td = document.createElement('td');
                if (i === 0) { var c = document.createElement('code'); c.textContent = cell; td.appendChild(c); }
                else td.textContent = cell;
                tr.appendChild(td);
            });
            tb.appendChild(tr);
        });
        t.appendChild(tb);
        return t;
    }

    /* ── Buttons container ── */
    function btns() { return el('div', 'mhd3-btns'); }

    /* ── btn(href, label, primary) — link điều hướng ── */
    function btn(href, label, primary) {
        var a = el('a', primary ? 'mhd3-btn mhd3-btn-primary' : 'mhd3-btn mhd3-btn-ghost');
        a.href = href; a.textContent = label;
        a.setAttribute('data-ext-skip', '1'); /* link nội bộ — không relay */
        return a;
    }

    /* ── Mở MAPLE-Chat với admin (thay cho "trang liên hệ") ── */
    function openAdminChat(e) {
        if (e) e.preventDefault();
        if (window.MAPLEChat && window.MAPLEChat.openChatWith) {
            window.MAPLEChat.openChatWith(ADMIN_PRIMARY);
        } else if (window.MAPLEChat && window.MAPLEChat.open) {
            window.MAPLEChat.open();
        } else {
            /* MAPLE-Chat chỉ nạp khi đã đăng nhập → khách: điều hướng đăng nhập */
            location.href = '/wiki/Đặc_biệt:Đăng_nhập';
        }
    }

    /* ── Nút "Nhắn tin cho Admin" — mở chat thật ── */
    function contactAdminBtn(label, primary) {
        var b = el('button', (primary !== false ? 'mhd3-btn mhd3-btn-primary' : 'mhd3-btn mhd3-btn-ghost'));
        b.type = 'button';
        b.textContent = label || '↗ Nhắn tin cho Admin';
        b.addEventListener('click', openAdminChat);
        return b;
    }

    /* ── Khối "Vẫn cần trợ giúp?" với nút liên hệ admin ── */
    function stuck(opts) {
        opts = opts || {};
        var d = el('div', 'mhd3-stuck');
        d.appendChild(txt(el('div', 'mhd3-stuck-tag'), opts.tag || 'Vẫn cần hỗ trợ?'));
        d.appendChild(txt(el('p', 'mhd3-stuck-p'), opts.text ||
            'Nếu chưa tìm được câu trả lời, hãy nhắn trực tiếp cho đội ngũ quản trị — chúng tôi sẽ hỗ trợ bạn.'));
        var bs = btns();
        bs.style.justifyContent = 'center';
        bs.appendChild(contactAdminBtn(opts.btnLabel || '↗ Nhắn tin cho Admin', true));
        d.appendChild(bs);
        return d;
    }

    /* ── Footer chuẩn ── */
    function footer() {
        var f = el('div', 'mhd3-footer');
        var a = el('a'); a.href = '/wiki/Trợ_giúp'; a.textContent = '← Trợ Giúp';
        f.appendChild(a);
        f.appendChild(el('span', 'mhd3-footer-sep', '|'));
        f.appendChild(document.createTextNode('M.A.P.L.E WIKI © ' + new Date().getFullYear()));
        return f;
    }

    /* ── mount(buildFn): chuẩn bị #mw-content-text, ẩn chrome, gắn .mhd3 ──
       buildFn(page) nhận container .mhd3 để append nội dung. */
    function mount(buildFn) {
        function run() {
            var mwText = document.querySelector('#mw-content-text');
            if (!mwText) return;
            hideChrome();
            mwText.innerHTML = '';
            var root = el('div');
            root.appendChild(ribbon());
            var page = el('div', 'mhd3');
            buildFn(page);
            page.appendChild(footer());
            root.appendChild(page);
            mwText.appendChild(root);
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', run);
        } else { run(); }
    }

    window.MHHelp = {
        el: el, txt: txt, hideChrome: hideChrome, ribbon: ribbon,
        hero: hero, section: section, prose: prose, steps: steps,
        faq: faq, infobox: infobox, keys: keys, roles: roles,
        syntax: syntax, code: code, params: params, btns: btns, btn: btn,
        contactAdminBtn: contactAdminBtn, openAdminChat: openAdminChat,
        stuck: stuck, footer: footer, mount: mount,
        ADMIN_PRIMARY: ADMIN_PRIMARY, ADMIN_BACKUP: ADMIN_BACKUP
    };

    if (typeof mw !== 'undefined' && mw.hook) {
        mw.hook('maple.help.ready').fire(window.MHHelp);
    }
})();
