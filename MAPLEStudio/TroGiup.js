/**
 * M.A.P.L.E HELP PAGE — MediaWiki:TroGiup.js
 * Trang Trợ_giúp chính — build toàn bộ layout bằng JS
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var onPage = pn === 'Trợ_giúp' 
        || document.body.className.indexOf('page-Tr') !== -1
        || /\/wiki\/Tr/.test(location.pathname);

    if (!onPage) return;

    /* Không chạy trên trang con (có dấu :) */
    var pageName = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    if (pageName && pageName.indexOf(':') !== -1 && pageName.indexOf('Tr') === -1) return;

    /* ── Data: Sidebar nav ─────────────────────────── */
    var NAV = [
        { group: 'Bắt Đầu', items: [
            { label: 'Giới thiệu',        href: '/wiki/Trợ_giúp:Giới_thiệu' },
            { label: 'Đăng ký tài khoản', href: '/wiki/Trợ_giúp:Đăng_ký' },
            { label: 'Chỉnh sửa trang',   href: '/wiki/Trợ_giúp:Chỉnh_sửa' },
        ]},
        { group: 'Viết Hồ Sơ', items: [
            { label: 'Dossier',          href: '/wiki/Trợ_giúp:Dossier' },
            { label: 'Hồ Sơ Thực Thể',  href: '/wiki/Trợ_giúp:Thực_Thể' },
            { label: 'Hồ Sơ Nhật Ký',   href: '/wiki/Trợ_giúp:Nhật_Ký' },
            { label: 'Hồ Sơ Vật Phẩm',  href: '/wiki/Trợ_giúp:Vật_Phẩm' },
        ]},
        { group: 'Bản Mẫu', items: [
            { label: 'Ảnh Bảo Mật',           href: '/wiki/Trợ_giúp:Ảnh_Bảo_Mật' },
            { label: 'Phân Loại Nội Dung',     href: '/wiki/Trợ_giúp:Phân_Loại' },
            { label: 'Che Chữ & Che Từ',       href: '/wiki/Trợ_giúp:Che_Chữ' },
        ]},
        { group: 'Cú Pháp', items: [
            { label: 'Wikitext cơ bản', href: '/wiki/Trợ_giúp:Wikitext' },
            { label: 'Template',        href: '/wiki/Trợ_giúp:Template' },
            { label: 'Bảng biểu',       href: '/wiki/Trợ_giúp:Bảng' },
        ]},
        { group: 'Nâng Cao', items: [
            { label: 'CSS & JavaScript', href: '/wiki/Trợ_giúp:CSS_JS' },
            { label: 'Lua Modules',      href: '/wiki/Trợ_giúp:Lua' },
            { label: 'Extensions',       href: '/wiki/Trợ_giúp:Extensions' },
        ]},
        { group: 'Cộng Đồng', items: [
            { label: 'Nhiệm vụ', href: '/wiki/Trợ_giúp:Nhiệm_Vụ' },
            { label: 'Quy tắc',  href: '/wiki/Trợ_giúp:Quy_tắc' },
            { label: 'Liên hệ',  href: '/wiki/Trợ_giúp:Liên_hệ' },
            { label: 'FAQ',      href: '/wiki/Trợ_giúp:FAQ' },
        ]},
        { group: 'Tham Khảo', items: [
            { label: 'Glossary',  href: '/wiki/Trợ_giúp:Glossary' },
            { label: 'Changelog', href: '/wiki/Trợ_giúp:Changelog' },
        ]},
    ];

    /* ── Data: Sections + Cards ────────────────────── */
    var SECTIONS = [
        { title: 'Bắt Đầu Với M.A.P.L.E', cards: [
            { num:'01', title:'Giới Thiệu',       desc:'Tìm hiểu về M.A.P.L.E Wiki — hệ thống lưu trữ tài liệu The Maze, cách hoạt động và quy trình cơ bản.', href:'/wiki/Trợ_giúp:Giới_thiệu', cta:'Xem thêm' },
            { num:'02', title:'Chỉnh Sửa Trang',  desc:'Hướng dẫn tạo và chỉnh sửa trang wiki, sử dụng trình soạn thảo MAPLE-Editor và các công cụ toolbar.', href:'/wiki/Trợ_giúp:Chỉnh_sửa', cta:'Bắt đầu' },
            { num:'03', title:'Tạo Tài Khoản',    desc:'Đăng ký tài khoản để đóng góp nội dung, theo dõi thay đổi và tùy chỉnh trải nghiệm cá nhân.', href:'/wiki/Trợ_giúp:Đăng_ký', cta:'Đăng ký' },
        ]},
        { title: 'Viết Hồ Sơ', cards: [
            { num:'04', title:'Dossier',           desc:'Khung hồ sơ tổng hợp với header, ticker chạy, sections tự do (ảnh, text, record) và grid aux.', href:'/wiki/Trợ_giúp:Dossier', cta:'Xem hướng dẫn' },
            { num:'05', title:'Hồ Sơ Thực Thể',   desc:'Hồ sơ thực thể dạng RecordCard — Entity class, địa điểm gặp, mức nguy hiểm, mô tả và ảnh bảo mật.', href:'/wiki/Trợ_giúp:Thực_Thể', cta:'Xem hướng dẫn' },
            { num:'06', title:'Hồ Sơ Nhật Ký',    desc:'Ghi chú thực địa, nhật ký sự kiện — phân loại, nguồn tư liệu và metadata theo chuẩn M.A.P.L.E.', href:'/wiki/Trợ_giúp:Nhật_Ký', cta:'Xem hướng dẫn' },
            { num:'07', title:'Hồ Sơ Vật Phẩm',   desc:'Phân loại đồ vật thu hồi — độ hiếm, loại, công dụng và ảnh tham chiếu không bảo mật.', href:'/wiki/Trợ_giúp:Vật_Phẩm', cta:'Xem hướng dẫn' },
        ]},
        { title: 'Bản Mẫu Hỗ Trợ', cards: [
            { num:'08', title:'Ảnh Bảo Mật',       desc:'Hiển thị ảnh có lớp mã hóa — click để giải mã. Dùng khi ảnh chứa thông tin nhạy cảm.', href:'/wiki/Trợ_giúp:Ảnh_Bảo_Mật', cta:'Xem hướng dẫn' },
            { num:'09', title:'Phân Loại Nội Dung', desc:'Thẻ cảnh báo độ tuổi và nội dung nhạy cảm — luôn đặt đầu trang trước khi viết nội dung 13/16/18+.', href:'/wiki/Trợ_giúp:Phân_Loại', cta:'Xem hướng dẫn' },
            { num:'0A', title:'Che Chữ & Che Từ',   desc:'maple-classified để che khối nội dung cần giải mã, maple-redacted cho từng từ/cụm từ bị xoá.', href:'/wiki/Trợ_giúp:Che_Chữ', cta:'Xem hướng dẫn' },
        ]},
        { title: 'Cú Pháp & Định Dạng', cards: [
            { num:'0B', title:'Wikitext Cơ Bản', desc:'In đậm, in nghiêng, tiêu đề, liên kết, hình ảnh, danh sách — các ký hiệu cơ bản của MediaWiki.', href:'/wiki/Trợ_giúp:Wikitext', cta:'Học ngay' },
            { num:'0C', title:'Template',        desc:'Sử dụng và tham số hóa template để tái sử dụng cấu trúc trên nhiều trang khác nhau.', href:'/wiki/Trợ_giúp:Template', cta:'Khám phá' },
            { num:'0D', title:'Bảng Biểu',       desc:'Tạo và định dạng bảng wiki để hiển thị dữ liệu có cấu trúc rõ ràng.', href:'/wiki/Trợ_giúp:Bảng', cta:'Tìm hiểu' },
        ]},
        { title: 'Nâng Cao', cards: [
            { num:'0E', title:'CSS & JavaScript', desc:'Tùy chỉnh giao diện trang wiki bằng CSS và thêm tính năng tương tác bằng JavaScript.', href:'/wiki/Trợ_giúp:CSS_JS', cta:'Tùy chỉnh' },
            { num:'0F', title:'Lua Modules',      desc:'Tạo chức năng động phức tạp bằng ngôn ngữ Lua qua extension Scribunto.', href:'/wiki/Trợ_giúp:Lua', cta:'Lập trình' },
            { num:'10', title:'Extensions',       desc:'Tìm hiểu các tiện ích mở rộng MediaWiki có sẵn và cách kích hoạt chúng.', href:'/wiki/Trợ_giúp:Extensions', cta:'Khám phá' },
        ]},
        { title: 'Cộng Đồng & Hỗ Trợ', cards: [
            { num:'14', title:'Nhiệm Vụ', desc:'Hoàn thành nhiệm vụ Ngày/Tuần/Tháng do M.A.P.L.E giao để tự động nhận Điểm Uy Tín (RP).', href:'/wiki/Trợ_giúp:Nhiệm_Vụ', cta:'Nhận nhiệm vụ' },
            { num:'11', title:'Quy Tắc',  desc:'Quy tắc ứng xử, tiêu chuẩn nội dung và nguyên tắc duy trì cộng đồng M.A.P.L.E Wiki.', href:'/wiki/Trợ_giúp:Quy_tắc', cta:'Đọc ngay' },
            { num:'12', title:'Liên Hệ', desc:'Cần trợ giúp? Liên hệ quản trị viên hoặc đặt câu hỏi cho cộng đồng.', href:'/wiki/Trợ_giúp:Liên_hệ', cta:'Liên hệ' },
            { num:'13', title:'FAQ',     desc:'Câu hỏi thường gặp — giải đáp nhanh các vấn đề phổ biến khi sử dụng wiki.', href:'/wiki/Trợ_giúp:FAQ', cta:'Xem FAQ' },
        ]},
        { title: 'Tham Khảo', cards: [
            { num:'◎', title:'Glossary',           desc:'Từ điển thuật ngữ — giải thích các khái niệm: The Maze, No-Clip, Entity Class, F.I.F.R.O...', href:'/wiki/Trợ_giúp:Glossary', cta:'Tra từ điển' },
            { num:'∿', title:'Changelog',          desc:'Lịch sử cập nhật wiki — phiên bản mới, tính năng bổ sung, thay đổi hệ thống template.', href:'/wiki/Trợ_giúp:Changelog', cta:'Xem changelog' },
            { num:'↗', title:'Tìm Kiếm Nhanh',    desc:'Tìm kiếm toàn bộ nội dung wiki.', href:'/wiki/Đặc_biệt:Tìm_kiếm', cta:'Tìm kiếm' },
        ]},
    ];

    /* ── Helpers ───────────────────────────────────── */
    function el(tag, cls) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        return e;
    }
    function txt(node, t) { node.textContent = t; return node; }
    function a(cls, href, text) {
        var e = el('a', cls);
        e.href = href;
        e.textContent = text;
        return e;
    }

    /* ── Hero ──────────────────────────────────────── */
    function buildHero() {
        var hero = el('div', 'mh-hero');
        var inner = el('div', 'mh-hero-inner');

        var svgWrap = el('div', 'mh-logo-svg');
        svgWrap.innerHTML =
            '<svg width="110" height="110" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M50 5L95 40L80 95H20L5 40L50 5Z" stroke="#450a0a" stroke-width="0.8" opacity="0.6"/>' +
            '<defs><filter id="mh-glow"><feGaussianBlur stdDeviation="2" result="blur"/>' +
            '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
            '<g filter="url(#mh-glow)">' +
            '<path d="M50 15V85M50 15L85 45L50 40L15 45L50 15Z" stroke="#ef4444" stroke-width="2" stroke-linejoin="miter"/>' +
            '<path d="M30 60L50 85L70 60" stroke="#ef4444" stroke-width="2"/>' +
            '</g>' +
            '<circle class="maple-eye-pulse" cx="50" cy="40" r="5.5" fill="#ef4444" filter="url(#mh-glow)"/>' +
            '</svg>';
        inner.appendChild(svgWrap);

        inner.appendChild(txt(el('p', 'mh-eyebrow'), '// HỆ THỐNG TRỢ GIÚP — QUYỀN TRUY CẬP: ĐÃ XÁC THỰC'));
        var h1 = el('h1', 'mh-title');
        h1.innerHTML = 'TRỢ <em>GIÚP</em>';
        inner.appendChild(h1);
        inner.appendChild(txt(el('p', 'mh-sub'), 'Trung tâm tài liệu & hướng dẫn — M.A.P.L.E Wiki'));
        hero.appendChild(inner);
        return hero;
    }

    /* ── Sidebar ───────────────────────────────────── */
    function buildSidebar() {
        var aside = el('aside', 'mh-sidebar');

        var sw = el('div', 'mh-search');
        var inp = document.createElement('input');
        inp.type = 'text'; inp.id = 'mh-q';
        inp.setAttribute('placeholder', 'Tìm kiếm...');
        inp.setAttribute('autocomplete', 'off');
        sw.appendChild(inp);
        aside.appendChild(sw);

        NAV.forEach(function (grp) {
            var g = el('div', 'mh-nav-group');
            g.appendChild(txt(el('p', 'mh-nav-label'), grp.group));
            var ul = el('ul', 'mh-nav-list');
            grp.items.forEach(function (item) {
                var li = document.createElement('li');
                var link = a('mh-nav-link', item.href, item.label);
                if (location.href.indexOf(encodeURIComponent(item.href.replace('/wiki/', ''))) !== -1 ||
                    location.href.indexOf(item.href) !== -1) {
                    link.classList.add('active');
                }
                li.appendChild(link);
                ul.appendChild(li);
            });
            g.appendChild(ul);
            aside.appendChild(g);
        });
        return aside;
    }

    /* ── Card ──────────────────────────────────────── */
    function buildCard(d) {
        var card = el('div', 'mh-card');
        card.appendChild(txt(el('div', 'mh-card-num'), d.num));
        card.appendChild(txt(el('h3', 'mh-card-title'), d.title));
        card.appendChild(txt(el('p', 'mh-card-desc'), d.desc));
        card.appendChild(a('mh-card-link', d.href, d.cta));
        return card;
    }

    /* ── Content ───────────────────────────────────── */
    function buildContent() {
        var main = el('div', 'mh-main');
        SECTIONS.forEach(function (sec) {
            var s = el('div', 'mh-section');
            var head = el('div', 'mh-section-head');
            head.appendChild(txt(el('h2', 'mh-section-title'), sec.title));
            head.appendChild(el('div', 'mh-rule'));
            s.appendChild(head);
            var grid = el('div', 'mh-grid');
            sec.cards.forEach(function (c) { grid.appendChild(buildCard(c)); });
            s.appendChild(grid);
            main.appendChild(s);
        });
        return main;
    }

    /* ── Footer ────────────────────────────────────── */
    function buildFooter() {
        var f = el('footer', 'mh-footer');
        f.appendChild(document.createTextNode('M.A.P.L.E WIKI © ' + new Date().getFullYear()));
        var sep1 = el('span', 'mh-footer-sep'); sep1.textContent = '|';
        f.appendChild(sep1);
        f.appendChild(a('', '/wiki/Trợ_giúp:Changelog', 'Changelog'));
        var sep2 = el('span', 'mh-footer-sep'); sep2.textContent = '|';
        f.appendChild(sep2);
        f.appendChild(a('', '/wiki/Trợ_giúp:Glossary', 'Glossary'));
        return f;
    }

    /* ── Search filter ─────────────────────────────── */
    function setupSearch() {
        var inp = document.getElementById('mh-q');
        if (!inp) return;
        inp.addEventListener('input', function () {
            var q = inp.value.toLowerCase().trim();
            document.querySelectorAll('.mh-nav-list li').forEach(function (li) {
                li.style.display = (!q || li.textContent.toLowerCase().indexOf(q) !== -1) ? '' : 'none';
            });
            /* Ẩn group nếu tất cả item ẩn */
            document.querySelectorAll('.mh-nav-group').forEach(function (grp) {
                var visible = grp.querySelectorAll('li:not([style*="none"])').length;
                grp.style.display = (!q || visible > 0) ? '' : 'none';
            });
        });
        inp.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && inp.value.trim()) {
                location.href = '/wiki/Đặc_biệt:Tìm_kiếm?search=' + encodeURIComponent(inp.value.trim());
            }
        });
    }

    /* ── Card animations ───────────────────────────── */
    function animateCards() {
        if (!window.IntersectionObserver) return;
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                var c = en.target;
                c.style.opacity = '0';
                c.style.transform = 'translateY(16px)';
                c.style.transition = 'opacity 0.44s ease, transform 0.44s ease';
                setTimeout(function () {
                    c.style.opacity = '1';
                    c.style.transform = 'translateY(0)';
                }, 50);
                obs.unobserve(c);
            });
        }, { threshold: 0.05 });
        document.querySelectorAll('.mh-card').forEach(function (c, i) {
            c.style.transitionDelay = (i % 3 * 0.06) + 's';
            obs.observe(c);
        });
    }

    /* ── Main build ────────────────────────────────── */
    function build() {
        var mwText = document.querySelector('#mw-content-text');
        if (!mwText) return;

        var fh = document.querySelector('#firstHeading');
        if (fh) fh.style.display = 'none';

        /* Ẩn chrome Vector */
        var s = document.createElement('style');
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
            'html,body{background:#050505!important}';
        document.head.appendChild(s);

        mwText.innerHTML = '';
        mwText.appendChild(buildHero());

        var body = el('div', 'mh-body');
        body.appendChild(buildSidebar());
        body.appendChild(buildContent());
        mwText.appendChild(body);
        mwText.appendChild(buildFooter());

        setupSearch();
        animateCards();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else {
        build();
    }

})();
