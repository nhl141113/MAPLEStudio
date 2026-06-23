/**
 * M.A.P.L.E — MediaWiki:GuestGate.js
 * Overlay cho người chưa đăng nhập gặp nội dung 16+/18+ hoặc trang chỉnh sửa
 *
 * Cách dùng trong wikitext:
 *   <loggedout><div class="mgg-gate" data-type="16">nội dung</div></loggedout>
 *   <loggedout><div class="mgg-gate" data-type="18">nội dung</div></loggedout>
 *   <loggedout><div class="mgg-gate" data-type="edit">nội dung</div></loggedout>
 */
(function () {
    'use strict';

    var CONFIGS = {
        '16': {
            badge:   '16+',
            title:   'Nội Dung Hạn Chế',
            color:   '#f59e0b',
            tags:    ['Ngôn ngữ mạnh', 'Bạo lực nhẹ', 'Chủ đề nhạy cảm'],
            desc:    'Trang này chứa <strong>nội dung phù hợp từ 16 tuổi trở lên</strong>. Đăng nhập để xác minh bạn đủ tuổi và truy cập.',
            note:    'M.A.P.L.E Wiki — Hệ thống phân loại nội dung MCL',
            btnLogin:'Đăng nhập',
            btnBack: 'Quay lại',
        },
        '18': {
            badge:   '18+',
            title:   'Nội Dung Người Lớn',
            color:   '#ef4444',
            tags:    ['Nội dung 18+', 'Bạo lực cao', 'Chủ đề nhạy cảm', 'Dành cho người lớn'],
            desc:    'Trang này chứa <strong>nội dung chỉ dành cho người từ 18 tuổi trở lên</strong>. Đăng nhập để xác minh độ tuổi và tiếp tục.',
            note:    'M.A.P.L.E Wiki — Hệ thống phân loại nội dung MCL',
            btnLogin:'Đăng nhập',
            btnBack: 'Quay lại',
        },
        'edit': {
            badge:   'LOGIN',
            title:   'Cần Đăng Nhập',
            color:   '#3b82f6',
            tags:    ['Chỉnh sửa', 'Thành viên'],
            desc:    'Bạn cần <strong>đăng nhập</strong> để chỉnh sửa trang này. Tạo tài khoản miễn phí hoặc đăng nhập nếu đã có tài khoản.',
            note:    'M.A.P.L.E Wiki — Quyền truy cập theo thành viên',
            btnLogin:'Đăng nhập',
            btnReg:  'Tạo tài khoản',
            btnBack: 'Quay lại',
        },
    };

    function el(tag, cls) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        return e;
    }

    function getLoginUrl() {
        return '/wiki/Special:UserLogin?returnto=' + encodeURIComponent(
            (typeof mw !== 'undefined' && mw.config)
                ? mw.config.get('wgPageName')
                : location.pathname
        );
    }

    function getRegUrl() {
        return '/wiki/Special:CreateAccount?returnto=' + encodeURIComponent(
            (typeof mw !== 'undefined' && mw.config)
                ? mw.config.get('wgPageName')
                : location.pathname
        );
    }

    function buildModal(type, cfg) {
        var modal = el('div', 'mgg-modal');
        modal.setAttribute('data-type', type);

        /* Header */
        var header = el('div', 'mgg-header');
        var badge = el('span', 'mgg-badge');
        badge.textContent = cfg.badge;
        var title = el('span', 'mgg-title');
        title.textContent = cfg.title;
        var sys = el('span', 'mgg-sys');
        sys.textContent = 'SYS // ACCESS DENIED';
        header.appendChild(badge);
        header.appendChild(title);
        header.appendChild(sys);
        modal.appendChild(header);

        /* Body */
        var body = el('div', 'mgg-body');

        var desc = el('p', 'mgg-desc');
        desc.innerHTML = cfg.desc;
        body.appendChild(desc);

        if (cfg.tags && cfg.tags.length) {
            var tagsWrap = el('div', 'mgg-tags');
            cfg.tags.forEach(function (t) {
                var tag = el('span', 'mgg-tag');
                tag.textContent = t;
                tagsWrap.appendChild(tag);
            });
            body.appendChild(tagsWrap);
        }

        var actions = el('div', 'mgg-actions');

        var btnLogin = el('a', 'mgg-btn mgg-btn-primary');
        btnLogin.href = getLoginUrl();
        btnLogin.textContent = cfg.btnLogin;
        actions.appendChild(btnLogin);

        if (cfg.btnReg) {
            var btnReg = el('a', 'mgg-btn mgg-btn-secondary');
            btnReg.href = getRegUrl();
            btnReg.textContent = cfg.btnReg;
            actions.appendChild(btnReg);
        }

        if (cfg.btnBack) {
            var btnBack = el('button', 'mgg-btn mgg-btn-secondary');
            btnBack.textContent = cfg.btnBack;
            btnBack.addEventListener('click', function () { history.back(); });
            actions.appendChild(btnBack);
        }

        body.appendChild(actions);
        modal.appendChild(body);

        /* Footer note */
        var footerNote = el('div', 'mgg-footer-note');
        footerNote.textContent = cfg.note;
        modal.appendChild(footerNote);

        return modal;
    }

    function wrapGate(gateEl) {
        var type = gateEl.getAttribute('data-type')
                || (gateEl.className.match(/\bmgg-(\d+|edit)\b/) || [])[1]
                || '16';
        var cfg = CONFIGS[type] || CONFIGS['16'];

        /* Blur nội dung gốc */
        gateEl.classList.add('mgg-blur');

        /* Overlay bám vào #mw-content-text để che toàn vùng nội dung */
        var contentArea = document.querySelector('#mw-content-text');
        if (!contentArea) return;
        contentArea.classList.add('mgg-content-host');

        var overlay = el('div', 'mgg-overlay');
        var modal = buildModal(type, cfg);
        overlay.appendChild(modal);
        contentArea.appendChild(overlay);
    }

    function showGuestGate(type) {
        var cfg = CONFIGS[type] || CONFIGS['edit'];
        var overlay = document.querySelector('.mgg-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            // Update return urls based on current page
            var loginBtn = overlay.querySelector('.mgg-btn-primary');
            if (loginBtn) loginBtn.href = getLoginUrl();
            var regBtn = overlay.querySelector('.mgg-btn-secondary');
            if (regBtn && regBtn.tagName === 'A') regBtn.href = getRegUrl();
            return;
        }

        overlay = el('div', 'mgg-overlay');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:100000;display:flex;' +
            'align-items:center;justify-content:center;' +
            'background:rgba(5,5,5,0.85);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);';

        var modal = buildModal(type, cfg);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        var closeBtn = el('button', 'mgg-btn-close');
        closeBtn.id = 'mgg-close-btn';
        closeBtn.title = 'Đóng';
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = 'position:absolute;top:10px;right:10px;background:transparent;border:none;color:#52525b;font-size:1.1rem;cursor:pointer;';
        closeBtn.addEventListener('click', function() {
            overlay.style.display = 'none';
        });
        modal.appendChild(closeBtn);

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.style.display = 'none';
        });
    }

    window.MAPLE = window.MAPLE || {};
    window.MAPLE.showGuestGate = showGuestGate;

    function init() {
        /* Tìm cả .mgg-gate lẫn fallback class .mgg-16/.mgg-18/.mgg-edit
           phòng trường hợp MediaWiki strip class "mgg-gate" khỏi whitelist */
        var seen = [];
        var gates = document.querySelectorAll('.mgg-gate, .mgg-16, .mgg-18, .mgg-edit');
        console.log('[GuestGate] Tìm thấy ' + gates.length + ' gate element(s)');
        if (!gates.length) return;
        [].forEach.call(gates, function (g) {
            if (seen.indexOf(g) === -1) { seen.push(g); wrapGate(g); }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
