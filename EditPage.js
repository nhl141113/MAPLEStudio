/* ============================================
   M.A.P.L.E — MediaWiki:EditPage.js
   Entry point — điều phối load các module
   
   Load thứ tự trong Common.js:
     mw.loader.load('/wiki/MediaWiki:MAPLE-Core.js?action=raw&ctype=text/javascript');
     mw.loader.load('/wiki/MediaWiki:MAPLE-Toolbar.js?action=raw&ctype=text/javascript');
     mw.loader.load('/wiki/MediaWiki:EditPage.js?action=raw&ctype=text/javascript');
   
   CSS trong Common.css:
     @import url('/wiki/MediaWiki:MAPLE-Base.css?action=raw&ctype=text/css');
     @import url('/wiki/MediaWiki:MAPLE-Editor.css?action=raw&ctype=text/css');
     @import url('/wiki/MediaWiki:MAPLE-Preview.css?action=raw&ctype=text/css');
     @import url('/wiki/MediaWiki:MAPLE-NoAccess.css?action=raw&ctype=text/css');
   ============================================ */

(function () {
    function init() {
    'use strict';

    var wgAction = mw.config.get('wgAction');

    /* Chỉ chạy trên trang edit/submit */
    if (wgAction !== 'edit' && wgAction !== 'submit') return;

    /* ── Load CSS động (nếu không dùng @import trong Common.css) ── */
    /* Bỏ comment nếu muốn load CSS bằng JS thay vì @import: */
    /*
    var cssFiles = [
        '/wiki/MediaWiki:MAPLE-Base.css?action=raw&ctype=text/css',
        '/wiki/MediaWiki:MAPLE-Editor.css?action=raw&ctype=text/css',
        '/wiki/MediaWiki:MAPLE-Preview.css?action=raw&ctype=text/css',
        '/wiki/MediaWiki:MAPLE-NoAccess.css?action=raw&ctype=text/css',
    ];
    cssFiles.forEach(function(href) {
        var link = document.createElement('link');
        link.rel  = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    });
    */

    /* ── Điều phối theo action ── */
    if (wgAction === 'submit') {
        /* Xem trước hoặc xem thay đổi */
        mw.loader.load('/wiki/MediaWiki:MAPLE-Preview.js?action=raw&ctype=text/javascript');
        return;
    }

    /* wgAction === 'edit' */
    var canEdit = mw.config.get('wgIsProbablyEditable');
    if (canEdit === null || canEdit === undefined) {
        canEdit = !!document.getElementById('editform');
    }

    if (!canEdit) {
        /* Màn hình không có quyền */
        mw.loader.load('/wiki/MediaWiki:MAPLE-NoAccess.js?action=raw&ctype=text/javascript');
    } else {
        /* Editor chính */
        mw.loader.load('/wiki/MediaWiki:MAPLE-Editor.js?action=raw&ctype=text/javascript');
    }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
