/* ============================================
   M.A.P.L.E — MediaWiki:MAPLE-Editor.js
   Chế độ chỉnh sửa chính (action=edit)
   Yêu cầu: MAPLE-Core.js + MAPLE-Toolbar.js + MAPLE-SubmitWait.js đã load trước

   v2.1 — Nút LƯU TRANG giờ trigger MAPLE Scanner thay vì submit thẳng.
           submitForm() được expose qua MAPLE.Editor.submitForm để
           SubmitWait.js gọi lại sau khi scan pass.
   ============================================ */

(function () {
    'use strict';

    var wgPageName  = mw.config.get('wgPageName') || '';
    var wgArticleId = mw.config.get('wgArticleId');
    var pageName    = wgPageName.replace(/_/g, ' ');
    var isRedLink   = wgArticleId === 0;

    /* ── Quyền chỉnh sửa ── */
    var canEdit = mw.config.get('wgIsProbablyEditable');
    if (canEdit === null || canEdit === undefined) {
        canEdit = !!document.getElementById('editform');
    }
    if (!canEdit) {
        if (typeof MAPLE.NoAccess === 'function') MAPLE.NoAccess();
        return;
    }

    /* ── Đọc form gốc của MediaWiki ── */
    var formOld       = document.getElementById('editform');
    var txOld         = document.getElementById('wpTextbox1');
    var smOld         = document.getElementById('wpSummary');
    var watchOld      = formOld ? formOld.querySelector('input[name="wpWatchthis"]') : null;
    var existingText  = txOld    ? txOld.value    : '';
    var existingSum   = smOld    ? smOld.value    : '';
    var existingWatch = watchOld ? watchOld.checked : false;
    var formAction    = formOld  ? formOld.action  : window.location.href;

    var hiddenHTML = '';
    if (formOld) {
        formOld.querySelectorAll('input[type="hidden"]').forEach(function (inp) {
            hiddenHTML += '<input type="hidden" name="' + inp.name +
                '" value="' + inp.value.replace(/"/g, '&quot;') + '">';
        });
        formOld.style.cssText = 'display:none!important';
    }
    var mwContent = document.getElementById('mw-content-text') ||
                    document.querySelector('.mw-parser-output') ||
                    document.getElementById('content');
    if (mwContent) mwContent.style.cssText = 'display:none!important';

    /* ── Kích hoạt UI ── */
    MAPLE.activateUI();
    var root = MAPLE.createRoot();

    /* ── Alert trang mới ── */
    var alertHTML = isRedLink
        ? '<div class="maple-alert">' +
          '<span class="maple-alert-title">CẢNH BÁO: TRANG CHƯA TỒN TẠI</span>' +
          'Bạn đang khởi tạo một hồ sơ mới trong hệ thống. ' +
          'Kiểm tra kỹ tên trang trước khi lưu. ' +
          '<a href="/wiki/Trang_Ch%C3%ADnh">Về trang chủ</a> · ' +
          '<a href="/wiki/Tr%E1%BB%A3_gi%C3%BAp">Xem trợ giúp</a>.' +
          '</div>'
        : '';

    var titleText = isRedLink ? 'TẠO HỒ SƠ MỚI' : 'CHỈNH SỬA HỒ SƠ';

    /* ── Encoding panel HTML ── */
    var encodingPanelHTML =
        '<div id="maple-encoding-panel" class="maple-encoding-panel" style="display:none">' +
        '<div class="maple-encoding-header">// BỘ MÃ HOÁ</div>' +
        '<div class="maple-encoding-grid">' +
        '<div class="maple-encoding-row"><span>Mã hoá</span><span class="enc-val">UTF-8</span></div>' +
        '<div class="maple-encoding-row"><span>BOM</span><span class="enc-val enc-no">KHÔNG</span></div>' +
        '<div class="maple-encoding-row"><span>Unicode</span><span class="enc-val enc-yes">ĐẦY ĐỦ</span></div>' +
        '<div class="maple-encoding-row"><span>Ký tự</span><span class="enc-val" id="enc-char-count">0</span></div>' +
        '<div class="maple-encoding-row"><span>Byte</span><span class="enc-val" id="enc-byte-count">0</span></div>' +
        '<div class="maple-encoding-row"><span>Dòng</span><span class="enc-val" id="enc-line-count">0</span></div>' +
        '</div>' +
        '<button id="maple-encoding-close" class="maple-encoding-close">ĐÓNG</button>' +
        '</div>';

    /* ── Build shell ── */
    root.innerHTML =
        '<div class="maple-shell">' +

        MAPLE.buildHeader({
            title:      titleText,
            sub:        pageName,
            badgeText:  'HỆ THỐNG: ĐÃ XÁC THỰC',
            badgeClass: 'maple-badge--ok'
        }) +

        alertHTML +

        '<div class="maple-editor-body">' +
        MAPLE.buildToolbarHTML() +
        MAPLE.MODAL_HTML +
        encodingPanelHTML +

        '<form id="maple-editform" method="post" action="' + formAction + '">' +
        hiddenHTML +
        '<div class="maple-editor-split-container">' +
        '  <textarea id="maple-textarea" name="wpTextbox1"></textarea>' +
        '  <div id="maple-preview-pane" class="maple-preview-pane" style="display:none">' +
        '    <div class="maple-preview-header">// BẢN XEM TRƯỚC HỒ SƠ</div>' +
        '    <div class="maple-preview-content mw-parser-output"></div>' +
        '  </div>' +
        '</div>' +

        '<div class="maple-editor-footer">' +
        '<div class="maple-summary-label">TÓM LƯỢC THAY ĐỔI</div>' +
        '<input type="text" id="maple-summary" name="wpSummary" ' +
        'placeholder="Mô tả ngắn về thay đổi..." ' +
        'value="' + existingSum.replace(/"/g, '&quot;') + '">' +

        '<div class="maple-editor-btns">' +

        // ── Nút LƯU TRANG: trigger MAPLE Scanner, KHÔNG submit thẳng ──
        '<button type="button" id="maple-btn-save" class="maple-btn maple-btn-save">📤 GỬI KIỂM DUYỆT</button>' +

        // Preview và Diff vẫn submit thẳng (không cần qua scanner)
        '<button type="button" id="maple-btn-preview" class="maple-btn maple-btn-secondary">XEM TRƯỚC</button>' +
        '<button type="button" id="maple-btn-split"   class="maple-btn maple-btn-secondary">CHIA ĐÔI PREVIEW</button>' +
        '<button type="button" id="maple-btn-diff"    class="maple-btn maple-btn-secondary">XEM THAY ĐỔI</button>' +

        '<div class="maple-watch-wrap"><label class="maple-watch-label">' +
        '<input type="checkbox" name="wpWatchthis"' + (existingWatch ? ' checked' : '') + '>THEO DÕI' +
        '</label></div>' +
        '<button type="button" id="maple-btn-cancel" class="maple-btn maple-btn-cancel">HỦY BỎ</button>' +
        '</div>' +

        '<div class="maple-editor-meta">' +
        '<span>CLEARANCE LEVEL 4</span>' +
        '<span id="maple-wordcount">0 từ · 0 dòng</span>' +
        '<span>MAPLE v4.0.4</span>' +
        '</div>' +
        '</div>' + /* .maple-editor-footer */
        '</form>' +
        '</div>'; /* .maple-editor-body */

    /* Gán text tránh HTML encode */
    var textarea = document.getElementById('maple-textarea');
    textarea.value = existingText;

    var mapleForm = document.getElementById('maple-editform');

    /* ── Init helpers & modal ── */
    MAPLE.Editor.initHelpers(textarea);
    MAPLE.Modal.init();

    /* ── Stats ── */
    MAPLE.Editor.updateStats = function () {
        var v     = textarea.value;
        var lines = v ? v.split('\n').length : 0;
        var words = v.trim() ? v.trim().split(/\s+/).length : 0;
        var chars = v.length;
        var bytes = (new TextEncoder()).encode(v).length;
        var ec = document.getElementById('enc-char-count');
        var eb = document.getElementById('enc-byte-count');
        var el = document.getElementById('enc-line-count');
        if (ec) ec.textContent = chars.toLocaleString('vi-VN');
        if (eb) eb.textContent = bytes.toLocaleString('vi-VN');
        if (el) el.textContent = lines.toLocaleString('vi-VN');
        var wc = document.getElementById('maple-wordcount');
        if (wc) wc.textContent = words.toLocaleString('vi-VN') + ' từ · ' + lines + ' dòng';
    };
    textarea.addEventListener('input', MAPLE.Editor.updateStats);
    MAPLE.Editor.updateStats();

    /* ── Toolbar click ── */
    document.querySelectorAll('.maple-tool-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            MAPLE.Editor.tool(btn.getAttribute('data-action'));
        });
    });

    /* ── Encoding panel close ── */
    document.getElementById('maple-encoding-close').addEventListener('click', function () {
        document.getElementById('maple-encoding-panel').style.display = 'none';
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            var ep = document.getElementById('maple-encoding-panel');
            if (ep && ep.style.display !== 'none') ep.style.display = 'none';
        }
    });

    /* ── Keyboard shortcuts ── */
    textarea.addEventListener('keydown', function (e) {
        var ctrl = e.ctrlKey || e.metaKey;
        if (ctrl && e.key === 'b') { e.preventDefault(); MAPLE.Editor.tool('bold'); }
        if (ctrl && e.key === 'i') { e.preventDefault(); MAPLE.Editor.tool('italic'); }
        if (ctrl && e.key === 'k') { e.preventDefault(); MAPLE.Editor.tool('link'); }
        if (ctrl && e.shiftKey && e.key === 'S') { e.preventDefault(); MAPLE.Editor.tool('strike'); }
        if (e.key === 'Tab') { e.preventDefault(); MAPLE.Editor.insert('  '); }
    });

    /* ══════════════════════════════════════════════════════════════════
       submitForm — expose ra MAPLE.Editor.submitForm để SubmitWait.js
       gọi lại SAU KHI scan pass + user xác nhận.

       Dùng cho: Preview, Diff (gọi thẳng vì không cần scan).
                 Lưu trang: SubmitWait.js gọi sau khi scan xong.
    ══════════════════════════════════════════════════════════════════ */
    function submitForm(name, value, label) {
        if (name === 'wpSave') {
            localStorage.removeItem(DRAFT_KEY);
        }
        if (window.autoSaveInterval) clearInterval(window.autoSaveInterval);
        
        MAPLE.showOverlay(label);
        mapleForm.querySelectorAll('.maple-sentinel').forEach(function (el) {
            el.parentNode.removeChild(el);
        });
        var s = document.createElement('input');
        s.type = 'hidden'; s.className = 'maple-sentinel';
        s.name = name; s.value = value;
        mapleForm.appendChild(s);
        setTimeout(function () { mapleForm.submit(); }, 80);
    }

    // Expose để SubmitWait.js gọi sau scan
    MAPLE.Editor.submitForm = submitForm;

    // Expose content + summary getter để SubmitWait đọc
    MAPLE.Editor.getContent = function () {
        return document.getElementById('maple-textarea')
            ? document.getElementById('maple-textarea').value : '';
    };
    MAPLE.Editor.getSummary = function () {
        return document.getElementById('maple-summary')
            ? document.getElementById('maple-summary').value : '';
    };

    /* ── Nút GỬI KIỂM DUYỆT — trigger MAPLE Scanner ── */
    document.getElementById('maple-btn-save').addEventListener('click', function () {
        // SubmitWait.js lắng nghe event này để mở scanner panel
        // Sau khi scan pass + user bấm "Xác nhận" → nó sẽ gọi:
        //   MAPLE.Editor.submitForm('wpSave', 'Lưu trang', 'ENCRYPTING DATA...')
        var content = MAPLE.Editor.getContent();
        var summary = MAPLE.Editor.getSummary();

        if (typeof MAPLE.SubmitWait === 'function') {
            // SubmitWait mới — gọi trực tiếp
            MAPLE.SubmitWait(content, summary);
        } else {
            // Fallback: fire custom event để SubmitWait.js bắt
            document.dispatchEvent(new CustomEvent('maple:requestSave', {
                detail: { content: content, summary: summary }
            }));
        }
    });

    /* ── Preview & Diff — submit thẳng, không cần scan ── */
    document.getElementById('maple-btn-preview').addEventListener('click', function () {
        // Sync content từ maple-textarea về form gốc trước khi submit
        submitForm('wpPreview', 'Xem trước', 'RENDERING PREVIEW...');
    });
    document.getElementById('maple-btn-diff').addEventListener('click', function () {
        submitForm('wpDiff', 'Xem thay đổi', 'COMPARING CHANGES...');
    });

    /* ── Hủy bỏ ── */
    document.getElementById('maple-btn-cancel').addEventListener('click', function () {
        if (textarea.value !== existingText) {
            MAPLE.Modal.open('// XÁC NHẬN HỦY BỎ',
                '<div class="maple-confirm-body">' +
                '<div class="maple-confirm-icon">⚠</div>' +
                '<div class="maple-confirm-text">Bạn có thay đổi chưa được lưu.<br>' +
                'Rời trang sẽ làm mất tất cả chỉnh sửa.</div>' +
                '</div>' +
                '<div class="maple-modal-actions">' +
                '<button id="ml-leave" class="maple-modal-btn maple-modal-btn--danger">RỜI TRANG</button>' +
                '<button id="ml-stay"  class="maple-modal-btn maple-modal-btn--primary">Ở LẠI</button>' +
                '</div>'
            );
            document.getElementById('ml-stay').onclick  = MAPLE.Modal.close;
            document.getElementById('ml-leave').onclick = function () {
                MAPLE.Modal.close();
                doCancel();
            };
        } else {
            doCancel();
        }
    });

    function doCancel() {
        if (window.autoSaveInterval) clearInterval(window.autoSaveInterval);
        MAPLE.showOverlay('CANCELLING...');
        var r = document.getElementById('maple-edit-root');
        if (r) r.classList.add('maple-leaving');
        setTimeout(function () {
            var ov = document.getElementById('maple-overlay');
            if (ov) ov.classList.add('out');
        }, 300);
        setTimeout(function () {
            window.location.href = mw.util.getUrl(wgPageName);
        }, 700);
    }

    /* ── Split Preview & Live Render ── */
    var splitBtn = document.getElementById('maple-btn-split');
    var splitContainer = document.querySelector('.maple-editor-split-container');
    var previewPane = document.getElementById('maple-preview-pane');
    var previewContent = previewPane ? previewPane.querySelector('.maple-preview-content') : null;
    var previewTimer = null;

    function updateSplitPreview() {
        if (!previewPane || previewPane.style.display === 'none') return;
        previewContent.innerHTML = '<div class="maple-preview-loading">// ĐANG GENERATE PREVIEW...</div>';
        
        var api = new mw.Api();
        api.post({
            action: 'parse',
            text: textarea.value,
            title: wgPageName,
            pst: true,
            disablelimitreport: true,
            format: 'json'
        }).done(function (data) {
            if (data && data.parse && data.parse.text) {
                previewContent.innerHTML = data.parse.text['*'];
                mw.hook('wikipage.content').fire($(previewContent));
            } else {
                previewContent.innerHTML = '<div class="maple-preview-error">// LỖI KHI GENERATE PREVIEW</div>';
            }
        }).fail(function () {
            previewContent.innerHTML = '<div class="maple-preview-error">// LỖI KẾT NỐI API</div>';
        });
    }

    if (splitBtn && previewPane) {
        splitBtn.addEventListener('click', function () {
            var isVisible = previewPane.style.display !== 'none';
            if (isVisible) {
                previewPane.style.display = 'none';
                if (splitContainer) splitContainer.classList.remove('split-active');
                splitBtn.classList.remove('maple-btn-active');
            } else {
                previewPane.style.display = 'block';
                if (splitContainer) splitContainer.classList.add('split-active');
                splitBtn.classList.add('maple-btn-active');
                updateSplitPreview();
            }
        });
    }

    textarea.addEventListener('input', function () {
        if (previewPane && previewPane.style.display !== 'none') {
            if (previewTimer) clearTimeout(previewTimer);
            previewTimer = setTimeout(updateSplitPreview, 1200);
        }
    });

    /* ── Auto-draft System ── */
    var DRAFT_KEY = 'maple_draft_' + encodeURIComponent(wgPageName);

    function saveDraft() {
        var currentText = textarea.value;
        var currentSum = document.getElementById('maple-summary') ? document.getElementById('maple-summary').value : '';
        if (currentText && currentText !== existingText) {
            var draftData = {
                text: currentText,
                summary: currentSum,
                timestamp: Date.now()
            };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
            showAutoSavedIndicator();
        }
    }

    function showAutoSavedIndicator() {
        var indicator = document.getElementById('maple-draft-indicator');
        if (!indicator) {
            var metaBar = document.querySelector('.maple-editor-meta');
            if (metaBar) {
                indicator = document.createElement('span');
                indicator.id = 'maple-draft-indicator';
                indicator.style.color = '#4ade80';
                indicator.style.fontSize = '8px';
                indicator.style.marginRight = 'auto';
                indicator.style.marginLeft = '12px';
                metaBar.insertBefore(indicator, metaBar.lastChild);
            }
        }
        if (indicator) {
            indicator.textContent = '// ĐÃ LƯU BẢN NHÁP (' + new Date().toLocaleTimeString('vi-VN') + ')';
            indicator.style.opacity = '1';
            setTimeout(function () {
                if (indicator) indicator.style.opacity = '0.4';
            }, 3000);
        }
    }

    // Auto-save every 30 seconds
    window.autoSaveInterval = setInterval(saveDraft, 30000);

    // Check draft on load
    (function checkDraftOnLoad() {
        var rawDraft = localStorage.getItem(DRAFT_KEY);
        if (!rawDraft) return;
        try {
            var draft = JSON.parse(rawDraft);
            if (draft.text && draft.text !== existingText && draft.text.trim() !== '') {
                var timeStr = new Date(draft.timestamp).toLocaleString('vi-VN');
                
                MAPLE.Modal.open('// PHÁT HIỆN BẢN NHÁP CHƯA LƯU',
                    '<div class="maple-confirm-body">' +
                    '<div class="maple-confirm-icon">📝</div>' +
                    '<div class="maple-confirm-text">Tìm thấy bản nháp được tự động lưu lúc <strong>' + timeStr + '</strong>.<br>' +
                    'Bạn có muốn khôi phục bản nháp này để tiếp tục chỉnh sửa không?</div>' +
                    '</div>' +
                    '<div class="maple-modal-actions">' +
                    '<button id="md-restore" class="maple-modal-btn maple-modal-btn--primary">KHÔI PHỤC BẢN NHÁP</button>' +
                    '<button id="md-discard" class="maple-modal-btn maple-modal-btn--danger">BỎ QUA</button>' +
                    '</div>'
                );
                
                document.getElementById('md-restore').onclick = function () {
                    textarea.value = draft.text;
                    var summaryInput = document.getElementById('maple-summary');
                    if (summaryInput && draft.summary) summaryInput.value = draft.summary;
                    MAPLE.Editor.updateStats();
                    if (previewPane && previewPane.style.display !== 'none') {
                        updateSplitPreview();
                    }
                    MAPLE.Modal.close();
                };
                
                document.getElementById('md-discard').onclick = function () {
                    localStorage.removeItem(DRAFT_KEY);
                    MAPLE.Modal.close();
                };
            }
        } catch (e) {
            console.error('Lỗi khi đọc bản nháp:', e);
        }
    })();

})();