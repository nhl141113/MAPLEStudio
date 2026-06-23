/**
 * M.A.P.L.E — MediaWiki:WebChat.js
 * Theme M.A.P.L.E cho trang Special:WebChat (IRC)
 */
(function () {
    'use strict';

    function init() {
        var mwText = document.querySelector('#mw-content-text');
        if (!mwText) return;

        /* Ẩn Chrome Vector, reset layout */
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
            'html,body{background:#050505!important;overflow:hidden}';
        document.head.appendChild(s);

        /* Thu thập iframe/widget đã được extension render */
        var existingIframe  = mwText.querySelector('iframe');
        var existingWidget  = mwText.querySelector('.mw-ext-webchat-container, #kiwi, [id*="kiwi"], [id*="webchat"]');
        var chatContent     = existingIframe || existingWidget;

        /* Tạo wrapper M.A.P.L.E */
        var wrap = document.createElement('div');
        wrap.className = 'mwc-root';
        wrap.innerHTML =
            '<div class="mwc-header">' +
            '<div class="mwc-header-left">' +
            '<div class="mwc-title"><span class="mwc-title-slash">//</span> M.A.P.L.E IRC <span class="mwc-dot">·</span> WEBCHAT</div>' +
            '<div class="mwc-channel">Kết nối IRC · Special:WebChat</div>' +
            '</div>' +
            '<div class="mwc-header-right">' +
            '<div class="mwc-status"><span class="mwc-status-dot"></span><span class="mwc-status-text">ONLINE</span></div>' +
            '<a class="mwc-btn" href="/wiki/D%E1%BB%B1_%C3%A1n:All_User">◎ Thành Viên</a>' +
            '</div>' +
            '</div>' +
            '<div class="mwc-frame-wrap" id="mwc-frame-wrap"></div>' +
            '<div class="mwc-footer">// M.A.P.L.E IRC — Dữ liệu chat không lưu trữ bởi wiki này</div>';

        mwText.innerHTML = '';
        mwText.appendChild(wrap);

        var frameWrap = wrap.querySelector('#mwc-frame-wrap');
        if (chatContent) {
            /* Kiểu style lại iframe */
            if (chatContent.tagName === 'IFRAME') {
                chatContent.style.cssText = 'width:100%;height:100%;border:none;display:block;background:#050505;';
                chatContent.allow = 'fullscreen';
            }
            frameWrap.appendChild(chatContent);
        } else {
            /* Fallback nếu extension chưa render hoặc cấu hình thiếu */
            frameWrap.innerHTML =
                '<div class="mwc-no-chat">' +
                '<div class="mwc-no-chat-icon">⌘</div>' +
                '<div class="mwc-no-chat-msg">// WEBCHAT CHƯA ĐƯỢC CẤU HÌNH</div>' +
                '<div class="mwc-no-chat-sub">Kiểm tra $wgWebChatChannel và $wgWebChatClient trong LocalSettings.php</div>' +
                '<a class="mwc-btn mwc-btn-lg" href="/wiki/Tr%E1%BB%A3_gi%C3%BAp:Extensions">Đọc hướng dẫn →</a>' +
                '</div>';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
