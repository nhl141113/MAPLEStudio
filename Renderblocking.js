/* ══════════════════════════════════════════
   M.A.P.L.E — MediaWiki:Renderblocking.js
   Chạy ngay trong <head> — trước khi DOM parse
   KHÔNG dùng mw, $. KHÔNG wrap DOMContentLoaded.
   ══════════════════════════════════════════ */

/* Đánh dấu loading ngay lập tức trên <html> —
   document.documentElement luôn có sẵn dù body chưa tồn tại */
document.documentElement.classList.add('maple-loading');

/* Sau khi DOM parse xong, dùng MutationObserver detect
   khi page JS inject xong rồi mới reveal content */
window.addEventListener('DOMContentLoaded', function () {
    var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
            var added = mutations[i].addedNodes;
            for (var j = 0; j < added.length; j++) {
                var node = added[j];
                if (node.nodeType !== 1) continue;
                if (
                    node.id === 'maple-root' ||
                    (node.className && typeof node.className === 'string' && (
                        node.className.indexOf('mh-body') !== -1 ||
                        node.className.indexOf('maple-page-wrapper') !== -1 ||
                        node.className.indexOf('mgg-overlay') !== -1
                    ))
                ) {
                    document.documentElement.classList.remove('maple-loading');
                    observer.disconnect();
                    return;
                }
            }
        }
    });

    var contentText = document.getElementById('mw-content-text');
    if (contentText) {
        observer.observe(contentText, { childList: true, subtree: false });
    }

    /* Fallback 800ms — trang thường không có JS inject */
    setTimeout(function () {
        document.documentElement.classList.remove('maple-loading');
        observer.disconnect();
    }, 800);
});
