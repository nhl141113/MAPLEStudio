/* ============================================
   M.A.P.L.E — MediaWiki:MapleUpload.js
   Giao diện tải lên tệp theo theme M.A.P.L.E

   2 chế độ:
   • Special:Upload  → khoác giao diện cho form tải lên gốc (proxy các trường thật,
                       giữ nguyên pipeline upload + token + cảnh báo của MediaWiki)
   • Nhúng           → <div class="maple-upload-wrap" data-comment="..."></div>
                       widget tải lên qua mw.Api (action=upload)

   Nạp từ Common.js (Special:Upload hoặc khi có .maple-upload-wrap).
   Không phụ thuộc MAPLE-Core.
   ============================================ */

(function () {
    'use strict';

    var LOGO_SVG =
        '<svg width="34" height="34" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M50 5L95 40L80 95H20L5 40L50 5Z" stroke="#450a0a" stroke-width="1" opacity="0.4"/>' +
        '<path d="M50 15V85M50 15L85 45L50 40L15 45L50 15Z" stroke="#ef4444" stroke-width="2.5" stroke-linejoin="miter"/>' +
        '<path d="M30 60L50 85L70 60" stroke="#ef4444" stroke-width="2.5"/>' +
        '<circle cx="50" cy="40" r="5" fill="#ef4444"/>' +
        '</svg>';

    /* ── Helpers ── */
    function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function fmtSize(bytes) {
        if (!bytes && bytes !== 0) return '';
        var u = ['B', 'KB', 'MB', 'GB'], i = 0, n = bytes;
        while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
        return (i === 0 ? n : n.toFixed(1)) + ' ' + u[i];
    }
    /* Suy ra tên đích từ tên tệp: bỏ đường dẫn, đổi khoảng trắng → _ */
    function deriveDest(name) {
        return String(name || '').replace(/^.*[\\/]/, '').replace(/\s+/g, '_');
    }

    /* ════════════════════════════════════════════════════════════════
       CHẾ ĐỘ 1 — SPECIAL:UPLOAD (proxy form gốc)
       ════════════════════════════════════════════════════════════════ */
    function enhanceSpecialUpload() {
        var form = document.getElementById('mw-upload-form') ||
                   document.querySelector('form#upload, form[name="upload"]');
        var fileInput = document.getElementById('wpUploadFile') ||
                        (form && form.querySelector('input[type="file"]'));
        if (!form || !fileInput) return; /* cấu trúc lạ → để form gốc nguyên vẹn */

        function field(id, sel) {
            return document.getElementById(id) || (form && form.querySelector(sel));
        }
        var destInput  = field('wpDestFile',          '[name="wpDestFile"]');
        var descInput  = field('wpUploadDescription', '[name="wpUploadDescription"]');
        var licenseSel = field('wpLicense',           'select[name="wpLicense"]');
        var watchChk   = field('wpWatchthis',         '[name="wpWatchthis"]');
        var ignoreChk  = field('wpIgnoreWarning',     '[name="wpIgnoreWarning"]');
        var submitBtn  = field('wpUpload',            '[name="wpUpload"]');

        /* Gom cảnh báo / lỗi sẵn có (vd: tệp đã tồn tại) để hiển thị lại */
        var msgs = [];
        document.querySelectorAll(
            '#mw-content-text .errorbox, #mw-content-text .warningbox, ' +
            '#mw-content-text .error, #mw-content-text .mw-message-box-error, ' +
            '#mw-content-text .mw-message-box-warning, #mw-content-text .mw-destfile-warning'
        ).forEach(function (m) {
            var t = (m.textContent || '').trim();
            if (t) msgs.push(t);
        });

        document.documentElement.classList.add('maple-upload-active');

        var root = el('div'); root.id = 'mu-root';
        root.appendChild(buildShell({
            sub:      'SECURE UPLOAD PROTOCOL',
            messages: msgs,
            license:  licenseSel,
            watch:    watchChk,
            ignore:   ignoreChk,
            descVal:  descInput ? descInput.value : '',
            destVal:  destInput ? destInput.value : ''
        }));
        document.body.appendChild(root);

        var zone     = root.querySelector('#mu-drop');
        var preview  = root.querySelector('#mu-preview');
        var muDest   = root.querySelector('#mu-dest');
        var muDesc   = root.querySelector('#mu-desc');
        var muLic    = root.querySelector('#mu-license');
        var muWatch  = root.querySelector('#mu-watch');
        var muIgnore = root.querySelector('#mu-ignore');
        var muBtn    = root.querySelector('#mu-submit');

        /* ── File ── */
        function showFile() {
            var f = fileInput.files && fileInput.files[0];
            if (!f) { preview.innerHTML = ''; zone.classList.remove('has-file'); return; }
            zone.classList.add('has-file');
            var thumb = '';
            if (/^image\//.test(f.type)) {
                try { thumb = '<img class="mu-thumb" src="' + URL.createObjectURL(f) + '" alt="">'; } catch (e) {}
            }
            preview.innerHTML =
                thumb +
                '<div class="mu-file-meta">' +
                '<div class="mu-file-name">' + esc(f.name) + '</div>' +
                '<div class="mu-file-size">' + esc(fmtSize(f.size)) + (f.type ? ' · ' + esc(f.type) : '') + '</div>' +
                '</div>';
            if (destInput && !destInput.value) {
                destInput.value = deriveDest(f.name);
                if (muDest) muDest.value = destInput.value;
            }
        }
        zone.addEventListener('click', function () { fileInput.click(); });
        fileInput.addEventListener('change', showFile);
        ['dragenter', 'dragover'].forEach(function (ev) {
            zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add('drag'); });
        });
        ['dragleave', 'drop'].forEach(function (ev) {
            zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove('drag'); });
        });
        zone.addEventListener('drop', function (e) {
            var files = e.dataTransfer && e.dataTransfer.files;
            if (!files || !files.length) return;
            try { fileInput.files = files; } catch (err) { /* trình duyệt cũ không cho gán */ }
            showFile();
        });
        if (fileInput.files && fileInput.files.length) showFile();

        /* ── Mirror các trường text → form gốc (ẩn nhưng vẫn submit) ── */
        if (muDest && destInput) muDest.addEventListener('input', function () { destInput.value = muDest.value; });
        if (muDesc && descInput) muDesc.addEventListener('input', function () { descInput.value = muDesc.value; });
        if (muLic && licenseSel) muLic.addEventListener('change', function () { licenseSel.value = muLic.value; });
        if (muWatch && watchChk) muWatch.addEventListener('change', function () { watchChk.checked = muWatch.checked; });
        if (muIgnore && ignoreChk) muIgnore.addEventListener('change', function () { ignoreChk.checked = muIgnore.checked; });

        /* ── Submit qua form gốc (giữ token + xử lý cảnh báo của MediaWiki) ── */
        muBtn.addEventListener('click', function () {
            if (!fileInput.files || !fileInput.files.length) {
                flash(root, 'Vui lòng chọn một tệp để tải lên.', 'err');
                return;
            }
            if (destInput && muDest) destInput.value = muDest.value || deriveDest(fileInput.files[0].name);
            if (descInput && muDesc) descInput.value = muDesc.value;
            muBtn.disabled = true;
            muBtn.textContent = '↥ ĐANG TẢI LÊN…';
            if (submitBtn) submitBtn.click();
            else if (form.requestSubmit) form.requestSubmit();
            else form.submit();
        });
    }

    /* Dựng shell giao diện cho Special:Upload */
    function buildShell(opt) {
        var shell = el('div', 'mu-shell');

        /* License options (clone từ select gốc nếu có) */
        var licenseHTML = '';
        if (opt.license) {
            var opts = '';
            Array.prototype.forEach.call(opt.license.options, function (o) {
                opts += '<option value="' + esc(o.value) + '"' + (o.selected ? ' selected' : '') + '>' + esc(o.text) + '</option>';
            });
            licenseHTML =
                '<div class="mu-row">' +
                '<label class="mu-label">Giấy phép</label>' +
                '<select id="mu-license" class="mu-input mu-select">' + opts + '</select>' +
                '</div>';
        }

        var msgsHTML = '';
        if (opt.messages && opt.messages.length) {
            msgsHTML = '<div class="mu-msgs">' + opt.messages.map(function (m) {
                return '<div class="mu-msg">⚠ ' + esc(m) + '</div>';
            }).join('') + '</div>';
        }

        shell.innerHTML =
            '<div class="mu-header">' +
                '<div class="mu-header-logo">' + LOGO_SVG +
                    '<div class="mu-title"><h1>TẢI LÊN TỆP</h1>' +
                    '<div class="mu-title-sub">M.A.P.L.E ARCHIVE SYSTEM // ' + esc(opt.sub) + '</div></div>' +
                '</div>' +
                '<span class="mu-badge">UPLOAD</span>' +
            '</div>' +

            '<div class="mu-body">' +
                msgsHTML +

                '<div id="mu-drop" class="mu-drop">' +
                    '<div class="mu-drop-idle">' +
                        '<div class="mu-drop-icon">↥</div>' +
                        '<div class="mu-drop-text">Kéo &amp; thả tệp vào đây, hoặc <span class="mu-drop-link">chọn tệp</span></div>' +
                        '<div class="mu-drop-hint">Ảnh, tài liệu, âm thanh… theo giới hạn của wiki</div>' +
                    '</div>' +
                    '<div id="mu-preview" class="mu-preview"></div>' +
                '</div>' +

                '<div class="mu-row">' +
                    '<label class="mu-label" for="mu-dest">Tên tệp đích</label>' +
                    '<input id="mu-dest" class="mu-input" type="text" placeholder="Ten_tep.png" value="' + esc(opt.destVal) + '">' +
                '</div>' +

                '<div class="mu-row">' +
                    '<label class="mu-label" for="mu-desc">Mô tả / Nguồn / Giấy phép</label>' +
                    '<textarea id="mu-desc" class="mu-input mu-textarea" rows="5" placeholder="Mô tả tệp, nguồn gốc, ghi chú bản quyền…">' + esc(opt.descVal) + '</textarea>' +
                '</div>' +

                licenseHTML +

                '<div class="mu-checks">' +
                    (opt.watch ? '<label class="mu-check"><input id="mu-watch" type="checkbox"' + (opt.watch.checked ? ' checked' : '') + '><span>Theo dõi tệp này</span></label>' : '') +
                    (opt.ignore ? '<label class="mu-check"><input id="mu-ignore" type="checkbox"' + (opt.ignore.checked ? ' checked' : '') + '><span>Bỏ qua cảnh báo</span></label>' : '') +
                '</div>' +

                '<div class="mu-actions">' +
                    '<button id="mu-submit" class="mu-btn mu-btn-primary" type="button">↥ TẢI LÊN</button>' +
                    '<a class="mu-btn mu-btn-ghost" href="/wiki/Trang_Ch%C3%ADnh">↩ HỦY</a>' +
                '</div>' +
                '<div id="mu-status" class="mu-status"></div>' +
            '</div>';
        return shell;
    }

    function flash(root, text, type) {
        var s = root.querySelector('#mu-status');
        if (!s) return;
        s.textContent = text;
        s.className = 'mu-status' + (type ? ' mu-status-' + type : '');
    }

    /* ════════════════════════════════════════════════════════════════
       CHẾ ĐỘ 2 — NHÚNG (.maple-upload-wrap) qua mw.Api
       ════════════════════════════════════════════════════════════════ */
    function buildEmbedUploader(wrap) {
        if (wrap.dataset.muReady) return;
        wrap.dataset.muReady = '1';

        var defComment = wrap.dataset.comment || 'Tải lên qua M.A.P.L.E Upload';
        var box = el('div', 'mu-embed');
        box.innerHTML =
            '<div class="mu-embed-head">' + LOGO_SVG + '<span>TẢI LÊN TỆP</span></div>' +
            '<div id="mu-edrop" class="mu-drop mu-drop-sm">' +
                '<div class="mu-drop-idle">' +
                    '<div class="mu-drop-icon">↥</div>' +
                    '<div class="mu-drop-text">Kéo &amp; thả hoặc <span class="mu-drop-link">chọn tệp</span></div>' +
                '</div>' +
                '<div id="mu-epreview" class="mu-preview"></div>' +
            '</div>' +
            '<input id="mu-efile" type="file" hidden>' +
            '<input id="mu-edest" class="mu-input" type="text" placeholder="Ten_tep.png">' +
            '<textarea id="mu-edesc" class="mu-input mu-textarea" rows="3" placeholder="Mô tả / nguồn / giấy phép…"></textarea>' +
            '<label class="mu-check"><input id="mu-eignore" type="checkbox"><span>Bỏ qua cảnh báo (ghi đè nếu trùng tên)</span></label>' +
            '<div class="mu-actions"><button id="mu-esubmit" class="mu-btn mu-btn-primary" type="button">↥ TẢI LÊN</button></div>' +
            '<div id="mu-estatus" class="mu-status"></div>' +
            '<div id="mu-ebar" class="mu-bar"><div class="mu-bar-fill"></div></div>';
        wrap.appendChild(box);

        var fileInput = box.querySelector('#mu-efile');
        var zone      = box.querySelector('#mu-edrop');
        var preview   = box.querySelector('#mu-epreview');
        var destInput = box.querySelector('#mu-edest');
        var descInput = box.querySelector('#mu-edesc');
        var ignoreChk = box.querySelector('#mu-eignore');
        var btn       = box.querySelector('#mu-esubmit');
        var status    = box.querySelector('#mu-estatus');
        var bar       = box.querySelector('#mu-ebar');
        var barFill   = bar.querySelector('.mu-bar-fill');

        function setStatus(t, type) {
            status.textContent = t || '';
            status.className = 'mu-status' + (type ? ' mu-status-' + type : '');
        }
        function showFile() {
            var f = fileInput.files && fileInput.files[0];
            if (!f) { preview.innerHTML = ''; zone.classList.remove('has-file'); return; }
            zone.classList.add('has-file');
            var thumb = '';
            if (/^image\//.test(f.type)) {
                try { thumb = '<img class="mu-thumb" src="' + URL.createObjectURL(f) + '" alt="">'; } catch (e) {}
            }
            preview.innerHTML = thumb +
                '<div class="mu-file-meta"><div class="mu-file-name">' + esc(f.name) + '</div>' +
                '<div class="mu-file-size">' + esc(fmtSize(f.size)) + '</div></div>';
            if (!destInput.value) destInput.value = deriveDest(f.name);
        }
        zone.addEventListener('click', function () { fileInput.click(); });
        fileInput.addEventListener('change', showFile);
        ['dragenter', 'dragover'].forEach(function (ev) {
            zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add('drag'); });
        });
        ['dragleave', 'drop'].forEach(function (ev) {
            zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove('drag'); });
        });
        zone.addEventListener('drop', function (e) {
            var files = e.dataTransfer && e.dataTransfer.files;
            if (!files || !files.length) return;
            try { fileInput.files = files; } catch (err) {}
            showFile();
        });

        btn.addEventListener('click', function () {
            var f = fileInput.files && fileInput.files[0];
            if (!f) { setStatus('Vui lòng chọn tệp.', 'err'); return; }
            var dest = (destInput.value || deriveDest(f.name)).trim();
            btn.disabled = true; btn.textContent = '↥ ĐANG TẢI…';
            setStatus('Đang tải lên…');
            bar.classList.add('active'); barFill.style.width = '8%';

            mw.loader.using(['mediawiki.api']).then(function () {
                var api = new mw.Api();
                return api.upload(f, {
                    filename:       dest,
                    comment:        descInput.value || defComment,
                    text:           descInput.value || '',
                    ignorewarnings: ignoreChk.checked ? 1 : undefined
                });
            }).then(function (data) {
                barFill.style.width = '100%';
                var name = (data && data.upload && data.upload.filename) || dest;
                setStatus('✓ Đã tải lên: ' + name, 'ok');
                var url = mw.util ? mw.util.getUrl('File:' + name) : '/wiki/File:' + encodeURIComponent(name);
                status.innerHTML = '✓ Đã tải lên — <a href="' + esc(url) + '">Xem tệp →</a>';
                btn.textContent = '✓ HOÀN TẤT';
            }).fail(function (code, res) {
                bar.classList.remove('active'); barFill.style.width = '0';
                var info = (res && res.error && res.error.info) || (res && res.upload && res.upload.warnings && 'Trùng tên / cảnh báo — bật "Bỏ qua cảnh báo"') || code || 'Lỗi không xác định';
                setStatus('✗ ' + info, 'err');
                btn.disabled = false; btn.textContent = '↥ THỬ LẠI';
            });
        });
    }

    /* ════════════════════════════════════════════════════════════════
       INIT
       ════════════════════════════════════════════════════════════════ */
    function init() {
        var isSpecialUpload = (mw.config.get('wgCanonicalSpecialPageName') === 'Upload');
        var embeds = document.querySelectorAll('.maple-upload-wrap');

        if (isSpecialUpload || embeds.length) {
            if (typeof mw !== 'undefined' && mw.hook) {
                mw.hook('maple.feature.first_use').fire({ feature: 'upload' });
            }
        }

        if (isSpecialUpload) {
            enhanceSpecialUpload();
            return;
        }
        if (embeds.length) embeds.forEach(buildEmbedUploader);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
