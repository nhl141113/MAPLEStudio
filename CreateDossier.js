/* ============================================
   M.A.P.L.E — MediaWiki:CreateDossier.js
   Trang "Tạo Bài Mới" — dựng hồ sơ (Dossier) mới:
     • Form nhập thông tin hồ sơ + chọn GIẤY PHÉP (window.MAPLE.LICENSES)
     • Xem bản mẫu (preview) trực quan + sinh WIKITEXT .maple-dossier
     • Tạo trang / bản nháp qua mw.Api; gắn [[Thể loại:Giấy phép …]] để chân trang nhận diện
   Route: Common.js case 'Tạo Bài Mới'. Cần Dossier.css (đã nạp toàn cục) + Common (LICENSES).
   ============================================ */
(function () {
    function init() {
        var pn = (mw.config.get('wgPageName') || '').replace(/_/g, ' ');
        try { pn = decodeURIComponent(pn); } catch (e) {}
        if (pn !== 'Tạo Bài Mới') return;

        var root = document.getElementById('mw-content-text');
        if (!root) return;

        /* Kích hoạt hiển thị Điều khoản Tạo bài (nếu người dùng chưa từng xem/đồng ý) */
        if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.feature.first_use').fire({ feature: 'create_post' });

        function esc(s) {
            return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
            });
        }
        function attr(s) { return String(s == null ? '' : s).replace(/"/g, '&quot;'); }
        function logo(sz) { return (window.MAPLE && window.MAPLE.logoSVG) ? window.MAPLE.logoSVG(sz) : ''; }

        var viewer = mw.config.get('wgUserName');
        var LIC = (window.MAPLE && window.MAPLE.LICENSES) || {};

        /* Cấu hình theo loại hồ sơ */
        var TYPES = {
            entity:    { label: 'Thực Thể', cat: 'Thực thể', f1: 'Gặp Tại',    f2: 'Nguy Hiểm', idHint: 'MA-E001' },
            item:      { label: 'Vật Phẩm', cat: 'Vật phẩm', f1: 'Độ Hiếm',    f2: 'Loại',      idHint: 'MA-I001' },
 diary:     { label: 'Nhật Ký',  cat: 'Nhật ký',  f1: 'Người Viết', f2: 'Nguồn',     idHint: 'MA-D001' },
            log:       { label: 'Bản Ghi',  cat: 'Bản ghi',  f1: 'Mã Sự Vụ',   f2: 'Phân Loại', idHint: 'MA-L001' },
            event:     { label: 'Sự Kiện',  cat: 'Sự kiện',  f1: 'Thời Điểm',  f2: 'Quy Mô',    idHint: 'MA-EV01' },
            location:  { label: 'Địa Điểm', cat: 'Địa điểm', f1: 'Khu Vực',    f2: 'Mức Ổn Định', idHint: 'MA-LOC01' },
            personnel: { label: 'Nhân Sự',  cat: 'Nhân sự',  f1: 'Bộ Phận',    f2: 'Chức Vụ',   idHint: 'MA-P001' },
            classified:{ label: 'Tối Mật',  cat: 'Tối mật',  f1: 'Cấp Độ',     f2: 'Phụ Trách', idHint: 'MA-C001' },
            log:       { label: 'Bản Ghi',  cat: 'Bản ghi',  f1: 'Mã Sự Vụ',   f2: 'Phân Loại', idHint: 'MA-L001' },
            event:     { label: 'Sự Kiện',  cat: 'Sự kiện',  f1: 'Thời Điểm',  f2: 'Quy Mô',    idHint: 'MA-EV01' },
            location:  { label: 'Địa Điểm', cat: 'Địa điểm', f1: 'Khu Vực',    f2: 'Mức Ổn Định', idHint: 'MA-LOC01' },
            personnel: { label: 'Nhân Sự',  cat: 'Nhân sự',  f1: 'Bộ Phận',    f2: 'Chức Vụ',   idHint: 'MA-P001' },
            classified:{ label: 'Tối Mật',  cat: 'Tối mật',  f1: 'Cấp Độ',     f2: 'Phụ Trách', idHint: 'MA-C001' }
        };

        /* Tùy chọn giấy phép cho <select> (mặc định CC BY-SA) */
        var licOptions = Object.keys(LIC).map(function (k) {
            var sel = (k === (window.MAPLE.LICENSE_DEFAULT || 'cc-by-sa')) ? ' selected' : '';
            return '<option value="' + esc(k) + '"' + sel + '>' + esc(LIC[k].name) + '</option>';
        }).join('');

        root.innerHTML =
            '<div id="cd-root">' +
            '<div class="cd-hero">' +
                '<div class="cd-hero-logo">' + logo(60) + '</div>' +
                '<div class="cd-eyebrow">// TRÌNH TẠO HỒ SƠ M.A.P.L.E</div>' +
                '<h1 class="cd-title">TẠO <span>BÀI MỚI</span></h1>' +
                '<p class="cd-sub">Điền thông tin → xem bản mẫu Dossier → tạo trang. Đọc <a href="/wiki/H%C6%B0%E1%BB%9Bng_D%E1%BA%ABn_Vi%E1%BA%BFt">Hướng Dẫn Viết</a> và <a href="/wiki/Quy_T%E1%BA%AFc">Quy Tắc</a> trước khi đăng.</p>' +
            '</div>' +
            '<div class="cd-grid">' +
                /* FORM */
                '<form class="cd-form" id="cd-form" autocomplete="off">' +
                    '<div class="cd-block-eyebrow">// THÔNG TIN HỒ SƠ</div>' +
                    field('Tiêu đề bài', '<input class="cd-in" id="cd-title" type="text" maxlength="120" placeholder="VD: Thực Thể MA-E001 — The Hollow">') +
                    field('Loại hồ sơ', '<select class="cd-in" id="cd-type">' +
                        '<option value="entity">Thực Thể</option>' +
                        '<option value="item">Vật Phẩm</option>' +
                        '<option value="diary">Nhật Ký</option>' +
                        '<option value="log">Bản Ghi</option>' +
                        '<option value="event">Sự Kiện</option>' +
                        '<option value="location">Địa Điểm</option>' +
                        '<option value="personnel">Nhân Sự</option>' +
                        '<option value="classified">Tối Mật</option></select>') +
                    row(
                        field('Mã hồ sơ (ID)', '<input class="cd-in" id="cd-id" type="text" maxlength="24" placeholder="MA-E001">'),
                        field('Trạng thái', '<input class="cd-in" id="cd-status" type="text" maxlength="24" value="ACTIVE">')
                    ) +
                    row(
                        field('Mức bảo mật', '<select class="cd-in" id="cd-clr"><option value="1">Cấp 1 — Công khai</option><option value="2">Cấp 2 — Nội bộ</option><option value="3">Cấp 3 — Hạn chế</option><option value="4" selected>Cấp 4 — Mật</option><option value="5">Cấp 5 — Tối mật</option></select>'),
                        field('Phân loại (rating)', '<select class="cd-in" id="cd-rating"><option value="13">13+</option><option value="16" selected>16+</option><option value="18">18+</option></select>')
                    ) +
                    row(
                        field('<span id="cd-l1">Gặp Tại</span>', '<input class="cd-in" id="cd-f1" type="text" maxlength="48" placeholder="—">'),
                        field('<span id="cd-l2">Nguy Hiểm</span>', '<input class="cd-in" id="cd-f2" type="text" maxlength="48" placeholder="—">')
                    ) +
                    field('Tóm tắt ngắn', '<textarea class="cd-in cd-ta" id="cd-desc" rows="2" maxlength="300" placeholder="Một câu mô tả hồ sơ…"></textarea>') +
                    field('Nội dung chi tiết', '<textarea class="cd-in cd-ta" id="cd-body" rows="5" maxlength="4000" placeholder="Mô tả đầy đủ về thực thể/vật phẩm/nhật ký…"></textarea>') +
                    field('Ảnh minh hoạ (URL — tuỳ chọn)', '<input class="cd-in" id="cd-img" type="text" placeholder="https://…/anh.png">') +

                    '<div class="cd-block-eyebrow">// DIỆN MẠO (tuỳ chọn)</div>' +
                    row(
                        field('Animation', '<select class="cd-in" id="cd-anim"><option value="full">Đầy đủ</option><option value="minimal">Tối giản</option><option value="off">Tắt</option></select>'),
                        field('Bề rộng', '<select class="cd-in" id="cd-width"><option value="normal">Bình thường</option><option value="narrow">Hẹp</option><option value="wide">Rộng</option><option value="full">Tràn</option></select>')
                    ) +
                    row(
                        field('Kiểu khung', '<select class="cd-in" id="cd-frame"><option value="bracket">Ngoặc góc</option><option value="plain">Viền đơn</option><option value="heavy">Viền dày</option><option value="sharp">Sắc</option></select>'),
                        field('Mật độ', '<select class="cd-in" id="cd-density"><option value="comfortable">Thoáng</option><option value="compact">Gọn</option></select>')
                    ) +
                    '<div class="cd-lic-note">Màu sắc tự động theo Loại hồ sơ (Thực thể/Vật phẩm/Nhật ký) — không chọn màu thủ công.</div>' +

                    '<div class="cd-block-eyebrow">// GIẤY PHÉP</div>' +
                    field('Giấy phép cho bài này', '<select class="cd-in" id="cd-lic">' + licOptions + '</select>') +
                    '<div class="cd-lic-note" id="cd-lic-note"></div>' +
                '</form>' +

                /* PREVIEW + WIKITEXT */
                '<div class="cd-side">' +
                    '<div class="cd-block-eyebrow">// XEM BẢN MẪU (DOSSIER)</div>' +
                    '<div class="cd-preview" id="cd-preview"></div>' +
                    '<div class="cd-block-eyebrow">// WIKITEXT (dán vào trang mới)</div>' +
                    '<textarea class="cd-wikitext" id="cd-wikitext" readonly rows="10"></textarea>' +
                    '<div class="cd-actions">' +
                        '<button type="button" class="cd-btn" id="cd-copy">📋 Sao chép</button>' +
                        '<button type="button" class="cd-btn cd-btn-primary" id="cd-create">🚀 Tạo trang</button>' +
                        '<button type="button" class="cd-btn" id="cd-draft">📝 Tạo bản nháp</button>' +
                    '</div>' +
                    '<div class="cd-status-msg" id="cd-msg"></div>' +
                '</div>' +
            '</div>' +
            '</div>';

        function field(label, control) {
            return '<label class="cd-field"><span class="cd-label">' + label + '</span>' + control + '</label>';
        }
        function row(a, b) { return '<div class="cd-row">' + a + b + '</div>'; }

        var $ = function (id) { return document.getElementById(id); };

        /* Đồng bộ nhãn field động + ID hint theo loại */
        function syncType() {
            var t = TYPES[$('cd-type').value] || TYPES.entity;
            $('cd-l1').textContent = t.f1;
            $('cd-l2').textContent = t.f2;
            if (!$('cd-id').value) $('cd-id').placeholder = t.idHint;
        }

        function licNote() {
            var lic = LIC[$('cd-lic').value];
            if (!lic) { $('cd-lic-note').innerHTML = ''; return; }
            var href = window.MAPLE.licenseHref(lic);
            $('cd-lic-note').innerHTML = 'Bài sẽ gắn thể loại <code>[[Thể loại:' + esc(lic.cat) + ']]</code> — chân trang hiển thị ' +
                '"<a href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(lic.name) + '</a>".';
        }

        function val(id) { return ($(id).value || '').trim(); }

        /* ── Sinh wikitext .maple-dossier ── */
        function buildWikitext() {
            var typeKey = $('cd-type').value;
            var t = TYPES[typeKey] || TYPES.entity;
            var title = val('cd-title') || 'Hồ sơ chưa đặt tên';
            var id = val('cd-id') || t.idHint;
            var status = val('cd-status') || 'ACTIVE';
            var clr = val('cd-clr');
            var rating = val('cd-rating');
            var f1 = val('cd-f1') || '—';
            var f2 = val('cd-f2') || '—';
            var desc = val('cd-desc');
            var body = val('cd-body') || 'Chưa có nội dung chi tiết.';
            var img = val('cd-img');
            var lic = LIC[$('cd-lic').value] || {};

            var imgAttrs = img
                ? ' data-img-src="' + attr(img) + '" data-img-type="secure" data-img-ref="' + attr(id) +
                  '" data-img-level="' + attr(clr) + '" data-img-rating="' + attr(rating) + '" data-img-caption="' + attr(title) + '"'
                : '';

            var ratingDesc = desc || ('Nội dung phân loại ' + rating + '+.');

            /* Diện mạo (chỉ ghi attribute khi KHÁC mặc định cho wikitext gọn) */
            var look = '';
            var anim = val('cd-anim'), width = val('cd-width'), frame = val('cd-frame'), dens = val('cd-density');
            if (anim && anim !== 'full')          look += ' data-anim="' + attr(anim) + '"';
            if (width && width !== 'normal')      look += ' data-width="' + attr(width) + '"';
            if (frame && frame !== 'bracket')     look += ' data-frame="' + attr(frame) + '"';
            if (dens && dens !== 'comfortable')   look += ' data-density="' + attr(dens) + '"';

            var w =
'<div class="maple-dossier" data-type="' + attr(typeKey) + '" data-header-left="MAPLE ARCHIVE // ' + attr(id) + '" data-header-right="' + attr(status) +
'" data-ticker="' + attr(title + ' // ' + t.label + ' // CLEARANCE ' + clr) + '" data-footer-note="Tài liệu nội bộ M.A.P.L.E"' + look + '>\n\n' +
'<div class="dossier-section" data-index="01" data-title="Tổng quan" data-layout="record">\n' +
'<div class="dossier-slot-data" data-type="record" data-record-type="' + attr(typeKey) + '" data-id="' + attr(id) +
'" data-title="' + attr(title) + '" data-clearance="LEVEL ' + attr(clr) + '+" data-field1="' + attr(f1) +
'" data-field2="' + attr(f2) + '"' + (desc ? ' data-desc="' + attr(desc) + '"' : '') + imgAttrs + '></div>\n' +
'</div>\n\n' +
'<div class="dossier-section" data-index="02" data-title="Mô tả" data-layout="text">\n' +
'<div class="dossier-slot-data" data-type="text">' + esc(body) + '</div>\n' +
'</div>\n\n' +
'<div class="dossier-section" data-index="03" data-title="Phân loại" data-layout="rating">\n' +
'<div class="dossier-slot-data" data-type="rating" data-muc="' + attr(rating) + '" data-mo-ta="' + attr(ratingDesc) + '"></div>\n' +
'</div>\n\n' +
'</div>\n\n' +
/* Đánh giá (VoteNY) + Bình luận (Comments) — KhoLuuTru-Article.js sẽ restyle khối này */
'<vote type=1 />\n' +
'<comments />\n\n' +
(lic.cat ? '[[Thể loại:' + lic.cat + ']]\n' : '') +
'[[Thể loại:' + t.cat + ']]\n';
            return w;
        }

        /* ── Preview trực quan (gọn) ── */
        function buildPreview() {
            var t = TYPES[$('cd-type').value] || TYPES.entity;
            var title = esc(val('cd-title') || 'Hồ sơ chưa đặt tên');
            var id = esc(val('cd-id') || t.idHint);
            var clr = esc(val('cd-clr'));
            var rating = val('cd-rating');
            var f1 = esc(val('cd-f1') || '—'), f2 = esc(val('cd-f2') || '—');
            var desc = esc(val('cd-desc') || '—');
            var body = esc(val('cd-body') || 'Chưa có nội dung chi tiết.');
            var img = val('cd-img');
            var rColor = { '13': '#3b82f6', '16': '#eab308', '18': '#ef4444' }[rating] || '#3b82f6';

            return '<div class="cd-doc">' +
                '<div class="cd-doc-bar"><span><span class="cd-dot"></span>MAPLE ARCHIVE // ' + id + '</span><span>' + esc(val('cd-status') || 'ACTIVE') + '</span></div>' +
                '<div class="cd-doc-body">' +
                    '<div class="cd-doc-head"><span class="cd-doc-type">' + esc(t.label.toUpperCase()) + '</span>' +
                        '<span class="cd-doc-rating" style="background:' + rColor + '">' + esc(rating) + '+</span></div>' +
                    '<div class="cd-doc-title">' + title + '</div>' +
                    '<div class="cd-doc-clr">LEVEL ' + clr + '+ CLEARANCE</div>' +
                    (img ? '<div class="cd-doc-img" style="background-image:url(' + JSON.stringify(img) + ')"></div>' : '<div class="cd-doc-img cd-doc-img--ph">// AWAITING DATA</div>') +
                    '<div class="cd-doc-cells"><div><b>' + esc(t.f1) + '</b><span>' + f1 + '</span></div><div><b>' + esc(t.f2) + '</b><span>' + f2 + '</span></div></div>' +
                    '<div class="cd-doc-sec"><span class="cd-doc-sec-l">// Tóm tắt</span>' + desc + '</div>' +
                    '<div class="cd-doc-sec"><span class="cd-doc-sec-l">// Nội dung</span>' + body + '</div>' +
                '</div>' +
                '</div>';
        }

        function refresh() {
            $('cd-preview').innerHTML = buildPreview();
            $('cd-wikitext').value = buildWikitext();
        }

        /* ── Tạo trang qua API ── */
        function createPage(title, text, summary, onOk, onErr) {
            if (!mw.Api) { onErr('API chưa sẵn sàng'); return; }
            var api = new mw.Api();
            api.postWithToken('csrf', {
                action: 'edit', title: title, text: text, createonly: 1, summary: summary, format: 'json'
            }).done(function (r) {
                if (r && r.edit && r.edit.result === 'Success') onOk(title);
                else onErr((r && r.error && r.error.info) || 'Không tạo được trang');
            }).fail(function (c, d) {
                onErr((d && d.error && d.error.info) || c || 'Lỗi kết nối / trang đã tồn tại');
            });
        }
        function msg(text, color) {
            var m = $('cd-msg'); m.textContent = text; m.style.color = color || '#a1a1aa';
        }

        /* ── Wire ── */
        $('cd-form').addEventListener('input', refresh);
        $('cd-type').addEventListener('change', function () { syncType(); refresh(); });
        $('cd-lic').addEventListener('change', licNote);

        $('cd-copy').addEventListener('click', function () {
            var ta = $('cd-wikitext'); ta.select();
            try {
                if (navigator.clipboard) navigator.clipboard.writeText(ta.value);
                else document.execCommand('copy');
                msg('✓ Đã sao chép wikitext.', '#22c55e');
            } catch (e) { msg('Không sao chép được — hãy chọn & Ctrl+C.', '#f59e0b'); }
        });

        $('cd-create').addEventListener('click', function () {
            if (!viewer) { msg('Bạn cần đăng nhập để tạo trang.', '#ef4444'); return; }
            var title = val('cd-title');
            if (!title) { msg('Hãy nhập Tiêu đề bài.', '#ef4444'); return; }
            msg('Đang tạo trang…');
            createPage(title, buildWikitext(), 'Tạo hồ sơ mới qua Tạo Bài Mới',
                function (t) { msg('✓ Đã tạo! Đang mở…', '#22c55e'); setTimeout(function () { location.href = mw.util.getUrl(t); }, 700); },
                function (e) { msg('✗ ' + e + ' (có thể trang đã tồn tại — thử Bản nháp).', '#ef4444'); });
        });

        $('cd-draft').addEventListener('click', function () {
            if (!viewer) { msg('Bạn cần đăng nhập để tạo bản nháp.', '#ef4444'); return; }
            var title = val('cd-title');
            if (!title) { msg('Hãy nhập Tiêu đề bài.', '#ef4444'); return; }
            var draft = 'Thành viên:' + viewer + '/Nháp/' + title;
            msg('Đang tạo bản nháp…');
            createPage(draft, buildWikitext(), 'Tạo bản nháp hồ sơ qua Tạo Bài Mới',
                function (t) { msg('✓ Đã tạo bản nháp! Đang mở…', '#22c55e'); setTimeout(function () { location.href = mw.util.getUrl(t); }, 700); },
                function (e) { msg('✗ ' + e, '#ef4444'); });
        });

        syncType(); licNote(); refresh();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
