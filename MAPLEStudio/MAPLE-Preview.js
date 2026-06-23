/* ============================================
   M.A.P.L.E — MediaWiki:MAPLE-Preview.js
   Chế độ Xem trước & Xem thay đổi (action=submit)
   Yêu cầu: MAPLE-Core.js đã load trước
   ============================================ */

(function () {
    'use strict';

    var wgPageName = mw.config.get('wgPageName') || '';
    var pageName   = wgPageName.replace(/_/g, ' ');

    /* ── Lấy dữ liệu từ DOM gốc của MediaWiki TRƯỚC khi ẩn ── */
    var previewNode = document.getElementById('wikiPreview');
    var diffNode    = document.getElementById('wikiDiff') || document.querySelector('table.diff');
    var formOld     = document.getElementById('editform');
    var txOld       = document.getElementById('wpTextbox1');
    var smOld       = document.getElementById('wpSummary');
    var watchOld    = formOld ? formOld.querySelector('input[name="wpWatchthis"]') : null;

    var savedText   = txOld    ? txOld.value    : '';
    var savedSum    = smOld    ? smOld.value    : '';
    var savedWatch  = watchOld ? watchOld.checked : false;
    var formAction  = formOld  ? formOld.action  : window.location.href;

    /* Thu thập hidden inputs */
    var hiddenHTML = '';
    if (formOld) {
        formOld.querySelectorAll('input[type="hidden"]').forEach(function (inp) {
            hiddenHTML += '<input type="hidden" name="' + inp.name +
                '" value="' + inp.value.replace(/"/g, '&quot;') + '">';
        });
    }

    var isDiff     = !!diffNode;
    var modeLabel  = isDiff ? 'XEM THAY ĐỔI' : 'XEM TRƯỚC';
    var modeCode   = isDiff ? 'DIFF_MODE'    : 'PREVIEW_MODE';
    var badgeClass = isDiff ? 'maple-badge--warn' : 'maple-badge--warn';

    /* Nội dung */
    var contentHTML = isDiff
        ? '<div class="maple-diff-legend">' +
          '<div class="maple-diff-legend-item"><span class="maple-diff-dot maple-diff-dot--del"></span><span>Đã xóa</span></div>' +
          '<div class="maple-diff-legend-item"><span class="maple-diff-dot maple-diff-dot--add"></span><span>Đã thêm</span></div>' +
          '<div class="maple-diff-legend-item"><span class="maple-diff-dot maple-diff-dot--ctx"></span><span>Không đổi</span></div>' +
          '</div>' +
          '<div class="maple-preview-diff"><div class="maple-diff-title">// SO SÁNH THAY ĐỔI</div>' +
          (diffNode ? diffNode.outerHTML : '') + '</div>'
        : '<div class="maple-preview-rendered">' + (previewNode ? previewNode.innerHTML : '') + '</div>';

    /* ── Kích hoạt UI ── */
    MAPLE.activateUI();
    var root = MAPLE.createRoot();

    root.innerHTML =
        '<div class="maple-shell">' +

        MAPLE.buildHeader({
            title:      modeLabel,
            sub:        pageName,
            badgeText:  modeCode,
            badgeClass: badgeClass
        }) +

        '<div class="maple-preview-wrap">' +

        /* Tabs */
        '<div class="maple-preview-tabs">' +
        '<div class="maple-preview-tab active">' +
        '<span class="tab-icon">' + (isDiff ? '⟷' : '◉') + '</span>' + modeLabel +
        '</div>' +
        '</div>' +

        /* Content */
        '<div class="maple-preview-body">' + contentHTML + '</div>' +

        /* Hidden form */
        '<form id="maple-previewform" method="post" action="' + formAction + '" style="display:none">' +
        hiddenHTML +
        '<input type="hidden" name="wpTextbox1" id="maple-pf-text" value="">' +
        '<input type="hidden" name="wpSummary" value="' + savedSum.replace(/"/g, '&quot;') + '">' +
        (savedWatch ? '<input type="hidden" name="wpWatchthis" value="1">' : '') +
        '</form>' +

        /* Footer */
        '<div class="maple-preview-footer">' +
        '<button id="maple-back-edit"          class="maple-preview-btn maple-preview-btn--edit">✏ TIẾP TỤC CHỈNH SỬA</button>' +
        '<button id="maple-save-from-preview"  class="maple-preview-btn maple-preview-btn--save">✓ LƯU TRANG</button>' +
        '<button id="maple-cancel-from-preview" class="maple-preview-btn maple-preview-btn--cancel">✕ HỦY BỎ</button>' +
        '<div class="maple-preview-footer-info">' + pageName + ' // ' + (isDiff ? 'DIFF' : 'PREVIEW') + '</div>' +
        '</div>' +

        '</div>' + /* .maple-preview-wrap */
        '</div>'; /* .maple-shell */

    /* Gán text qua JS (tránh HTML encode) */
    document.getElementById('maple-pf-text').value = savedText;

    /* ── Events ── */
    document.getElementById('maple-back-edit').addEventListener('click', function () {
        MAPLE.showOverlay('LOADING EDITOR...');
        window.location.href = mw.util.getUrl(wgPageName, { action: 'edit' });
    });

    document.getElementById('maple-save-from-preview').addEventListener('click', function () {
        MAPLE.showOverlay('ENCRYPTING DATA...');
        var pf = document.getElementById('maple-previewform');
        var s = document.createElement('input');
        s.type = 'hidden'; s.name = 'wpSave'; s.value = 'Lưu trang';
        pf.appendChild(s);
        setTimeout(function () { pf.submit(); }, 80);
    });

    document.getElementById('maple-cancel-from-preview').addEventListener('click', function () {
        MAPLE.showOverlay('CANCELLING...');
        setTimeout(function () { window.location.href = mw.util.getUrl(wgPageName); }, 600);
    });

})();