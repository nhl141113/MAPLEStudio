/**
 * M.A.P.L.E — MediaWiki:Welcome-Popup.js
 * Hiển thị popup chào mừng & khởi chạy tour hành trình liên trang (Cross-page Tour)
 * Thiết kế lấy cảm hứng từ giao diện Onboarding của Anthropic Claude.
 */
(function () {
    'use strict';

    var user = mw.config.get('wgUserName');
    var loggedIn = mw.config.get('wgUserId') !== 0;

    // Chỉ hiển thị popup nếu đã đăng nhập và đang ở Trang Chính
    if (!loggedIn || !user || mw.config.get('wgPageName') !== 'Trang_Chính') {
        return;
    }

    var STORAGE_KEY = 'maple_welcome_tour_seen';

    function hasSeenTour() {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'true';
        } catch (e) {
            return true; 
        }
    }

    function setTourSeen() {
        try {
            localStorage.setItem(STORAGE_KEY, 'true');
        } catch (e) {}
    }

    function showPopup() {
        var overlay = document.createElement('div');
        overlay.id = 'wt-popup-overlay';
        overlay.style.cssText = [
            'position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7);',
            'backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);',
            'z-index: 99999; display: flex; align-items: center; justify-content: center;',
            'opacity: 0; transition: opacity .4s cubic-bezier(0.16, 1, 0.3, 1);'
        ].join(' ');

        var modal = document.createElement('div');
        modal.id = 'wt-popup-modal';
        modal.style.cssText = [
            'background: #080808; border: 1px solid rgba(239, 68, 68, 0.2);',
            'border-top: 4px solid #ef4444; border-radius: 16px;',
            'width: min(850px, 95vw); height: min(600px, 85vh);',
            'display: flex; flex-direction: column; overflow: hidden;',
            'font-family: "JetBrains Mono", monospace; color: #e4e4e7;',
            'box-shadow: 0 30px 100px rgba(0, 0, 0, 0.9), 0 0 30px rgba(239, 68, 68, 0.1);',
            'transform: scale(0.96); transition: transform .4s cubic-bezier(0.16, 1, 0.3, 1);'
        ].join(' ');

        // SVG Logo M.A.P.L.E
        var logoHtml = '';
        if (window.MAPLE && typeof window.MAPLE.logoSVG === 'function') {
            logoHtml = window.MAPLE.logoSVG(96, { pulse: true });
        } else {
            logoHtml = '<div style="font-size: 72px; filter: drop-shadow(0 0 10px #ef4444);">🍁</div>';
        }

        modal.innerHTML = [
            '<div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 32px; text-align: center; box-sizing: border-box;">',
            '  <div style="margin-bottom: 24px; animation: wt-logo-glow 2s ease-in-out infinite alternate;">' + logoHtml + '</div>',
            '  <h1 style="font-size: 20px; font-weight: 700; color: #ef4444; margin: 0 0 12px; letter-spacing: 1px; text-transform: uppercase;">Khởi Chạy Giao Thức M.A.P.L.E</h1>',
            '  <p style="font-size: 11px; color: #a1a1aa; line-height: 1.8; max-width: 580px; margin: 0 0 36px; letter-spacing: 0.5px;">',
            '    Chào mừng Đặc vụ <strong>' + esc(user) + '</strong> đến với Trung tâm Dữ liệu Bảo mật M.A.P.L.E. ',
            '    Chúng tôi đã chuẩn bị một hành trình hướng dẫn ngắn đi qua tất cả phân khu công tác công khai (Trang Chủ, Kho Lưu Trữ, Thủ Tục, Nhiệm Vụ...) ',
            '    để giúp bạn nhanh chóng làm quen với cơ chế vận hành của hệ thống sinh tồn trong The Maze.',
            '  </p>',
            '  <div style="display: flex; gap: 16px; width: 100%; max-width: 420px;">',
            '    <button id="wt-popup-skip" style="flex: 1; font-family: inherit; font-size: 11px; font-weight: 700; padding: 12px 20px; background: transparent; border: 1px solid #27272a; color: #71717a; border-radius: 8px; cursor: pointer; transition: all .2s; text-transform: uppercase; letter-spacing: 0.5px;">Tự khám phá (Skip)</button>',
            '    <button id="wt-popup-start" style="flex: 1.5; font-family: inherit; font-size: 11px; font-weight: 700; padding: 12px 20px; background: #ef4444; border: 1px solid #ef4444; color: #fff; border-radius: 8px; cursor: pointer; transition: all .2s; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);">Bắt đầu chuyến đi ➔</button>',
            '  </div>',
            '</div>',
            '<style>',
            '@keyframes wt-logo-glow {',
            '  from { filter: drop-shadow(0 0 5px rgba(239,68,68,0.3)); }',
            '  to { filter: drop-shadow(0 0 20px rgba(239,68,68,0.7)); }',
            '}',
            '#wt-popup-skip:hover { border-color: #52525b; color: #e4e4e7; }',
            '#wt-popup-start:hover { background: #ff3333; border-color: #ff3333; box-shadow: 0 4px 20px rgba(239, 68, 68, 0.45); }',
            '</style>'
        ].join('\n');

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        requestAnimationFrame(function () {
            overlay.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        });

        // Bắt đầu tour: đặt cờ hoạt động, lưu trạng thái đã xem popup, chuyển hướng
        document.getElementById('wt-popup-start').onclick = function () {
            setTourSeen();
            try {
                localStorage.setItem('maple_tour_active_flow', 'true');
            } catch(e) {}
            
            overlay.style.opacity = '0';
            modal.style.transform = 'scale(0.96)';
            setTimeout(function () {
                overlay.remove();
                window.location.href = mw.util.getUrl('Trang_Chính/welcome');
            }, 300);
        };

        // Bỏ qua tour
        document.getElementById('wt-popup-skip').onclick = function () {
            setTourSeen();
            overlay.style.opacity = '0';
            modal.style.transform = 'scale(0.96)';
            setTimeout(function () { overlay.remove(); }, 300);
        };
    }

    function esc(s) {
        return String(s || '').replace(/[&<>"']/g, function (c) {
            return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (!hasSeenTour()) setTimeout(showPopup, 1200);
        });
    } else {
        if (!hasSeenTour()) setTimeout(showPopup, 1200);
    }

})();