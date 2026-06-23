/**
 * M.A.P.L.E — MediaWiki:GuestGate-Edit.js
 * Tự động hiện GuestGate overlay khi người chưa đăng nhập vào trang edit
 */
(function () {
    'use strict';

    var cfg = mw.config.get(['wgAction', 'wgUserId', 'wgPageName']);
    if (cfg.wgAction !== 'edit' && cfg.wgAction !== 'submit') return;
    if (cfg.wgUserId !== 0) return;

    function init() {
        /* Tạo overlay cứng — không cần element .mgg-gate trên trang */
        var loginUrl = '/wiki/Special:UserLogin?returnto=' + encodeURIComponent(cfg.wgPageName);
        var regUrl   = '/wiki/Special:CreateAccount?returnto=' + encodeURIComponent(cfg.wgPageName);

        var overlay = document.createElement('div');
        overlay.className = 'mgg-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;' +
            'align-items:center;justify-content:center;' +
            'background:rgba(5,5,5,0.85);backdrop-filter:blur(4px)';

        overlay.innerHTML =
            '<div class="mgg-modal" data-type="edit" style="position:relative;width:min(480px,92vw);' +
            'background:#0d0d0d;border:1px solid #1a1a1a;border-top:3px solid #3b82f6;' +
            'font-family:\'JetBrains Mono\',monospace;overflow:hidden">' +
                '<div class="mgg-header">' +
                    '<span class="mgg-badge">LOGIN</span>' +
                    '<span class="mgg-title">Cần Đăng Nhập</span>' +
                    '<span class="mgg-sys">SYS // ACCESS DENIED</span>' +
                '</div>' +
                '<div class="mgg-body">' +
                    '<p class="mgg-desc">Bạn cần <strong>đăng nhập</strong> để chỉnh sửa trang này.' +
                    ' Tạo tài khoản miễn phí hoặc đăng nhập nếu đã có tài khoản.</p>' +
                    '<div class="mgg-tags">' +
                        '<span class="mgg-tag">Chỉnh sửa</span>' +
                        '<span class="mgg-tag">Thành viên</span>' +
                    '</div>' +
                    '<div class="mgg-actions">' +
                        '<a class="mgg-btn mgg-btn-primary" href="' + loginUrl + '">Đăng nhập</a>' +
                        '<a class="mgg-btn mgg-btn-secondary" href="' + regUrl + '">Tạo tài khoản</a>' +
                        '<button class="mgg-btn mgg-btn-secondary" id="mgg-back-btn">Quay lại</button>' +
                    '</div>' +
                '</div>' +
                '<div class="mgg-footer-note">M.A.P.L.E Wiki — Quyền truy cập theo thành viên</div>' +
                '<button class="mgg-btn-close" id="mgg-close-btn" title="Đóng">✕</button>' +
            '</div>';

        document.body.appendChild(overlay);

        document.getElementById('mgg-close-btn').addEventListener('click', function () {
            overlay.style.display = 'none';
        });
        document.getElementById('mgg-back-btn').addEventListener('click', function () {
            history.back();
        });
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) overlay.style.display = 'none';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
