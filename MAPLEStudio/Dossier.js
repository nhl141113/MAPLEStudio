/* ============================================================
   M.A.P.L.E — MediaWiki:Dossier.js
   Hệ thống render Dossier với layout tự do tối đa.

   ── CÁCH DÙNG TRONG WIKI ──────────────────────────────────

   <div class="maple-dossier"
        data-header-left="MAPLE ARCHIVE // DOC-001"
        data-header-right="ACTIVE"
        data-ticker="Thông tin A // Thông tin B // Thông tin C"
        data-footer-hash="0xDEAD"
        data-footer-note="Tài liệu nội bộ"
        data-sides="true"
        data-side-left-label="MAPLE"
        data-side-right-label="ARCHIVE"

        ── TUỲ BIẾN (tất cả OPTIONAL — thiếu thì dùng mặc định) ──
        MÀU: KHÔNG chọn màu tự do. Màu nhấn theo TYPE nội dung:
          data-type="entity|item|diary|research|ref"   (entity=xanh dương, item=cam,
                     diary=hồng, research=tím, ref=lục; bỏ trống = cyan trung tính)
        ANIMATION:
          data-anim="full|minimal|off"      (minimal: bỏ animation lặp; off: tắt hẳn)
          data-reveal="slide|fade|rise|glitch|none"   (kiểu khối hiện ra)
          data-speed="slow|normal|fast"
        DIỆN MẠO / BỐ CỤC:
          data-width="normal|narrow|wide|full"
          data-frame="bracket|plain|heavy|sharp"
          data-pattern="none|grid|dots|scanline"
          data-header="full|minimal|none"
          data-density="comfortable|compact"
          data-radius="0..14"   data-corners="on|off"   data-glow="on|off"
          data-side-pattern="lines|none"
   >

     Trên .dossier-section (cấp MỤC), ngoài data-index/data-title/data-variant cũ:
        data-align="left|center|right"  data-gap="tight|normal|loose"
        data-index-col="on|off"   data-title-style="bar|plain|center|none"
     Trên .dossier-slot-data:
        record: data-record-layout="auto|img-left|img-right|img-top|no-img"
        img:    data-fit="cover|contain"     text: data-align="left|center|right"

     ── SECTION: khối nội dung ──────────────────────────────
     <div class="dossier-section"
          data-index="01"
          data-title="Tên Mục"
          data-variant="default|critical"
          data-layout="[slot1-type]|[slot2-type]|[slot3-type]"
          data-cols="2fr 3fr"
     >

       Mỗi .dossier-slot-data là một ô trong layout.
       data-layout xác định kiểu từng ô (text|img|secure|record|rating|classified).
       Số ô phải khớp số token trong data-layout.

       ── SLOT TEXT ──
       <div class="dossier-slot-data" data-type="text">
         Nội dung HTML tự do
       </div>

       ── SLOT IMG (ảnh thường) ──
       <div class="dossier-slot-data" data-type="img"
            data-src="https://..."
            data-caption="Chú thích"
            data-ratio="16/9|4/3|3/4|1/1"
            data-secure="true|false"
            data-ref="VIS-001"
            data-level="4"
            data-rating="13|16|18"
       ></div>
       Lưu ý: data-secure="true" → tự động dùng SecureImage overlay

       ── SLOT RECORD ──
       <div class="dossier-slot-data" data-type="record"
            data-record-type="diary|entity|item"
            data-id="MA-001"
            data-title="Tên Hồ Sơ"
            data-clearance="LEVEL 4+"
            data-field1="Giá trị 1"
            data-field2="Giá trị 2"
            data-desc="Mô tả"
            data-notes="Ghi chú 1|Ghi chú 2"
            data-img-src="https://..."
            data-img-type="plain|secure"
            data-img-ref="VIS-001"
            data-img-level="4"
            data-img-rating="16"
            data-img-caption="Chú thích ảnh"
       ></div>

       ── SLOT RATING ──
       <div class="dossier-slot-data" data-type="rating"
            data-muc="13|16|18"
            data-mo-ta="Mô tả nội dung"
            data-canh-bao="Cảnh báo 1;Cảnh báo 2"
            data-loi-khuyen="Lời khuyên"
            data-tag="#tag1 #tag2"
       ></div>

       ── SLOT CLASSIFIED (khối blur) ──
       <div class="dossier-slot-data" data-type="classified"
            data-ref="SEC-001"
            data-level="5"
       >Nội dung bí mật</div>

     </div>
     ── /SECTION ─────────────────────────────────────────────

     ── AUX GRID: lưới 2 cột phụ ────────────────────────────
     <div class="dossier-aux"
          data-label1="Nhãn A" data-content1="Nội dung A"
          data-label2="Nhãn B" data-content2="Nội dung B"
     ></div>

   </div>
   ── /DOSSIER ─────────────────────────────────────────────

   ============================================================ */

(function () {
    function init() {

    /* ══════════════════════════════════════════════════════
       CONSTANTS
       ══════════════════════════════════════════════════════ */

    var LEVEL_LABELS = {
        '1': 'CẤP 1 — CÔNG KHAI',
        '2': 'CẤP 2 — NỘI BỘ',
        '3': 'CẤP 3 — HẠN CHẾ',
        '4': 'CẤP 4 — MẬT',
        '5': 'CẤP 5 — TỐI MẬT'
    };

    var RATING_WARN = {
        '13': 'NỘI DUNG 13+ — CLICK ĐỂ GIẢI MÃ',
        '16': 'KHU VỰC HẠN CHẾ 16+ — CLICK ĐỂ GIẢI MÃ',
        '18': 'TỐI MẬT 18+ — CLICK ĐỂ GIẢI MÃ'
    };
    var RATING_SUB = {
        '13': 'TRUY CẬP TRÁI PHÉP BỊ NGHIÊM CẤM',
        '16': 'TÀI SẢN ĐỘC QUYỀN CỦA M.A.P.L.E',
        '18': 'CHỈ DÀNH CHO MẮT ĐƯỢC PHÉP. ĐANG GIÁM SÁT TÂM LÝ.'
    };
    var RATING_COLOR = { '13': '#3b82f6', '16': '#eab308', '18': '#ef4444' };

    var RECORD_ICONS = {
        diary:  '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
        entity: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        item:   '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>'
    };
    var RECORD_TYPE_CONFIG = {
        diary:  { prefix: 'TÀI LIỆU: NHẬT KÝ', secLabel: 'PHÂN LOẠI TRUY CẬP', fields: ['Người Viết', 'Nguồn'],   dotPos: 0 },
        entity: { prefix: 'THỰC THỂ',           secLabel: 'MỨC ĐỘ NGUY HIỂM',   fields: ['Gặp Tại', 'Nguy Hiểm'], dotPos: 1 },
        item:   { prefix: 'VẬT PHẨM',           secLabel: 'PHÂN LOẠI',           fields: ['Độ Hiếm', 'Loại'],      dotPos: 2 }
    };

    /* Màu nhấn CỐ ĐỊNH theo type (khớp Hướng Dẫn Viết.css — KHÔNG cho tác giả tự chọn màu) */
    var TYPE_COLORS = {
        entity:   '#3b82f6',
        item:     '#f59e0b',
        diary:    '#f43f5e',
        research: '#a78bfa',
        ref:      '#34d399'
    };
    /* Giá trị hợp lệ cho các tuỳ biến diện mạo/bố cục (whitelist → tránh class rác) */
    var DOSSIER_ENUM = {
        anim:    { full: 1, minimal: 1, off: 1 },
        reveal:  { slide: 1, fade: 1, rise: 1, glitch: 1, none: 1 },
        speed:   { slow: 1, normal: 1, fast: 1 },
        width:   { normal: 1, narrow: 1, wide: 1, full: 1 },
        frame:   { bracket: 1, plain: 1, heavy: 1, sharp: 1 },
        pattern: { none: 1, grid: 1, dots: 1, scanline: 1 },
        header:  { full: 1, minimal: 1, none: 1 }
    };
    function pick(val, table, dflt) {
        val = (val || '').toLowerCase();
        return (table[val]) ? val : dflt;
    }

    /* ══════════════════════════════════════════════════════
       HELPERS
       ══════════════════════════════════════════════════════ */

    function esc(s) {
        return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function uid() {
        return Math.random().toString(36).slice(2, 8);
    }

    /* ══════════════════════════════════════════════════════
       SLOT BUILDERS
       ══════════════════════════════════════════════════════ */

    /* ── SecureImage overlay (dùng trong slot img hoặc record) ── */
    function buildSecureOverlay(src, ref, level, rating, caption, ratioClass) {
        var levelLabel  = LEVEL_LABELS[level] || ('CẤP ' + level + ' — MẬT');
        var warnText    = (rating && RATING_WARN[rating])  || 'NỘI DUNG MẬT — CLICK ĐỂ GIẢI MÃ';
        var warnSub     = (rating && RATING_SUB[rating])   || 'TRUY CẬP TRÁI PHÉP BỊ NGHIÊM CẤM';
        var ratingClass = rating ? ' r' + rating : '';
        var id          = 'si-' + uid();

        var ratingBadge = rating
            ? '<div class="dsi-rating' + ratingClass + '">' + esc(rating) + '+</div>'
            : '';

        var captionBar = caption
            ? '<div class="dsi-caption"><span>// ' + esc(caption) + '</span><span>REF: ' + esc(ref) + '</span></div>'
            : '<div class="dsi-caption"><span>M.A.P.L.E VISUAL ARCHIVE</span><span>REF: ' + esc(ref) + '</span></div>';

        return '<div class="dsi' + (ratioClass ? ' ' + ratioClass : '') + '" data-ref="' + esc(ref) + '" id="' + id + '">' +
               '<div class="dsi-header">' +
                   '<span><span class="dsi-dot"></span>DỮ LIỆU ĐANG KHÓA — ' + esc(levelLabel) + ' YÊU CẦU</span>' +
                   '<span class="dsi-ref">REF: ' + esc(ref) + '</span>' +
               '</div>' +
               '<div class="dsi-body">' +
                   '<div class="dsi-scanline"></div>' +
                   '<div class="dsi-sweep"></div>' +
                   ratingBadge +
                   '<div class="dsi-warning">' +
                       '<div class="dsi-warning-box">' + esc(warnText) + '</div>' +
                       '<div class="dsi-warning-sub">' + esc(warnSub) + '</div>' +
                   '</div>' +
                   '<img src="' + esc(src) + '" alt="' + esc(ref) + '" draggable="false">' +
               '</div>' +
               captionBar +
               '</div>';
    }

    /* ── Plain image ── */
    function buildPlainImage(src, caption, ref, ratioClass) {
        return '<div class="dpi' + (ratioClass ? ' ' + ratioClass : '') + '">' +
               '<img src="' + esc(src) + '" alt="' + esc(ref || '') + '" draggable="false">' +
               '<div class="dpi-caption"><span>' + esc(caption || 'M.A.P.L.E VISUAL ARCHIVE') + '</span><span>' + esc(ref || '') + '</span></div>' +
               '</div>';
    }

    /* ── Slot: img ── */
    function buildSlotImg(el) {
        var src     = el.dataset.src     || '';
        var caption = el.dataset.caption || '';
        var ratio   = el.dataset.ratio   || '16/9';
        var secure  = (el.dataset.secure || 'true') !== 'false';
        var ref     = el.dataset.ref     || 'VIS-' + uid().toUpperCase();
        var level   = el.dataset.level   || '4';
        var rating  = el.dataset.rating  || '';

        var ratioClass = 'ratio-' + ratio.replace('/', '-');
        if ((el.dataset.fit || '').toLowerCase() === 'contain') ratioClass += ' fit-contain';

        if (!src) {
            return '<div class="dossier-placeholder ' + ratioClass + '">' +
                   '<div class="dossier-placeholder-inner">' +
                   '<div class="dp-circle"></div>' +
                   '<div class="dp-label">AWAITING DATA</div>' +
                   '</div></div>';
        }

        return secure
            ? buildSecureOverlay(src, ref, level, rating, caption, ratioClass)
            : buildPlainImage(src, caption, ref, ratioClass);
    }

    /* ── Slot: text ── */
    function buildSlotText(el) {
        var al = (el.dataset.align || '').toLowerCase();
        var cls = (al === 'center' || al === 'right') ? ' dsec-' + al : '';
        return '<div class="dossier-text-slot' + cls + '">' + el.innerHTML + '</div>';
    }

    /* ── Slot: classified (blur block) ── */
    function buildSlotClassified(el) {
        var ref     = el.dataset.ref   || 'CLASSIFIED';
        var level   = el.dataset.level || '4';
        var content = el.innerHTML;
        var id      = 'cl-' + uid();

        return '<div class="dossier-classified" id="' + id + '" data-ref="' + esc(ref) + '" data-level="' + esc(level) + '">' +
               '<div class="dcl-header">' +
                   '<span><span class="dcl-dot"></span>DỮ LIỆU ĐANG KHÓA — CẤP ' + esc(level) + ' YÊU CẦU</span>' +
                   '<span class="dcl-ref">REF: ' + esc(ref) + '</span>' +
               '</div>' +
               '<div class="dcl-body">' +
                   '<div class="dcl-scanline"></div>' +
                   '<div class="dcl-badge">' +
                       '<div class="dcl-badge-inner">NỘI DUNG BÍ MẬT — CLICK ĐỂ XÁC MINH</div>' +
                       '<div class="dcl-level">YÊU CẦU CẤP ĐỘ TRUY CẬP ' + esc(level) + '+</div>' +
                   '</div>' +
                   '<div class="dcl-content">' + content + '</div>' +
               '</div>' +
               '</div>';
    }

    /* ── Slot: rating ── */
    function buildSlotRating(el) {
        var muc       = (el.dataset.muc      || '13').trim();
        var moTa      = (el.dataset.moTa     || 'Không có mô tả.').trim();
        var canhBao   = (el.dataset.canhBao  || '').trim();
        var loiKhuyen = (el.dataset.loiKhuyen|| '').trim();
        var tagRaw    = (el.dataset.tag      || '').trim();
        var color     = RATING_COLOR[muc] || '#3b82f6';

        var warnItems = canhBao ? canhBao.split(';').map(function(s){ return s.trim(); }).filter(Boolean) : [];
        var warnHTML  = warnItems.map(function(w){ return '<li>' + esc(w) + '</li>'; }).join('');
        var tags      = (tagRaw.match(/#\S+/g) || []).map(function(t){ return '<span class="drt-tag">' + esc(t) + '</span>'; }).join('');

        return '<div class="dossier-rating" style="--mpr-color:' + color + '; border-left-color:' + color + '">' +
               '<div class="drt-scan"></div>' +
               '<div class="drt-inner">' +
                   '<div class="drt-left">' +
                       '<div class="drt-badge">' + esc(muc) + '+</div>' +
                       '<p class="drt-desc">' + esc(moTa) + '</p>' +
                       (tags ? '<div class="drt-tags">' + tags + '</div>' : '') +
                   '</div>' +
                   '<div class="drt-right">' +
                       '<div class="drt-warn-label">CONTENT WARNING</div>' +
                       '<div class="drt-warn-box">' +
                           (warnHTML ? '<ul>' + warnHTML + '</ul>' : '<p>Không có cảnh báo.</p>') +
                       '</div>' +
                       (loiKhuyen ? '<div class="drt-advice"><strong>Lời khuyên:</strong> ' + esc(loiKhuyen) + '</div>' : '') +
                   '</div>' +
               '</div>' +
               '</div>';
    }

    /* ── Slot: record (RecordCard inline) ── */
    function buildSlotRecord(el) {
        var type = (el.dataset.recordType || 'diary').trim();
        if (!RECORD_TYPE_CONFIG[type]) type = 'diary';
        var cfg = RECORD_TYPE_CONFIG[type];

        var id        = el.dataset.id        || '—';
        var title     = el.dataset.title     || '—';
        var clearance = el.dataset.clearance || '—';
        var field1    = el.dataset.field1    || '—';
        var field2    = el.dataset.field2    || '—';
        var desc      = el.dataset.desc      || '';
        var notesRaw  = el.dataset.notes     || '';
        var notes     = notesRaw ? notesRaw.split('|').map(function(s){ return s.trim(); }) : [];

        var imgSrc     = el.dataset.imgSrc     || '';
        var imgType    = el.dataset.imgType    || 'plain';
        var imgRef     = el.dataset.imgRef     || 'IMG-REF';
        var imgLevel   = el.dataset.imgLevel   || '4';
        var imgRating  = el.dataset.imgRating  || '';
        var imgCaption = el.dataset.imgCaption || '';
        /* Bố cục ảnh trong thẻ: auto | img-left | img-right | img-top | no-img */
        var recLayout  = (el.dataset.recordLayout || 'auto').toLowerCase();
        var hasImage   = !!imgSrc && recLayout !== 'no-img';

        var dots = [0,1,2].map(function(i){
            return '<div class="mrc-dot' + (i === cfg.dotPos ? ' active' : '') + '"></div>';
        }).join('');

        var notesHTML = notes.length
            ? '<ul class="mrc-notes">' + notes.map(function(n){ return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>'
            : '';

        var descHTML = desc
            ? '<div class="mrc-desc"><span class="mrc-desc-label">// Mô Tả</span>' + esc(desc) + notesHTML + '</div>'
            : (notesHTML ? '<div class="mrc-desc">' + notesHTML + '</div>' : '');

        var imgHTML = '';
        if (hasImage) {
            if (imgType === 'secure') {
                imgHTML = buildSecureOverlay(imgSrc, imgRef, imgLevel, imgRating, imgCaption, '');
            } else {
                imgHTML = buildPlainImage(imgSrc, imgCaption, imgRef, '');
            }
        }

        var infoGrid =
            '<div class="mrc-grid">' +
                '<div class="mrc-primary">' +
                    '<div>' +
                        '<div class="mrc-primary-label">TÊN HỒ SƠ:</div>' +
                        '<div class="mrc-primary-value">' + esc(title) + '</div>' +
                    '</div>' +
                    '<div class="mrc-lock">' + (RECORD_ICONS[type] || '') + '</div>' +
                '</div>' +
                '<div class="mrc-cells">' +
                    '<div class="mrc-cell"><div class="mrc-cell-label">' + esc(cfg.fields[0]) + ':</div><div class="mrc-cell-value">' + esc(field1) + '</div></div>' +
                    '<div class="mrc-cell"><div class="mrc-cell-label">' + esc(cfg.fields[1]) + ':</div><div class="mrc-cell-value">' + esc(field2) + '</div></div>' +
                '</div>' +
            '</div>' +
            descHTML;

        var layCls = (recLayout === 'img-left' || recLayout === 'img-right' || recLayout === 'img-top') ? ' mrc-lay-' + recLayout : '';
        var body = hasImage
            ? '<div class="mrc-body has-image' + layCls + '">' +
                  '<div class="mrc-img-col">' + imgHTML + '</div>' +
                  '<div class="mrc-info-col">' + infoGrid + '</div>' +
              '</div>'
            : infoGrid;

        return '<div class="dossier-record mrc maple-record-' + type + '">' +
               '<div class="mrc-accent"></div>' +
               '<div class="mrc-header">' +
                   '<div class="mrc-title">' + esc(cfg.prefix) + ': <span>' + esc(id) + '</span></div>' +
                   '<div class="mrc-security">' +
                       '<div class="mrc-security-code">' + esc(clearance) + '</div>' +
                       '<div class="mrc-security-label">' + esc(cfg.secLabel) + '</div>' +
                   '</div>' +
               '</div>' +
               body +
               '<div class="mrc-footer">' +
                   '<div class="mrc-dots">' + dots + '</div>' +
                   '<div class="mrc-line"></div>' +
                   '<div class="mrc-footer-code">M.A.P.L.E ARCHIVE // ' + esc(id) + '</div>' +
               '</div>' +
               '</div>';
    }

    /* ── Dispatcher ── */
    function buildSlot(el) {
        var type = (el.dataset.type || 'text').trim();
        switch (type) {
            case 'img':        return buildSlotImg(el);
            case 'record':     return buildSlotRecord(el);
            case 'rating':     return buildSlotRating(el);
            case 'classified': return buildSlotClassified(el);
            default:           return buildSlotText(el);
        }
    }

    /* ══════════════════════════════════════════════════════
       SECTION BUILDER
       ══════════════════════════════════════════════════════ */

    function buildSection(el, idx) {
        var index   = el.dataset.index   || String(idx + 1).padStart(2, '0');
        var title   = el.dataset.title   || '';
        var variant = el.dataset.variant || 'default';
        var layout  = (el.dataset.layout || 'text').split('|').map(function(s){ return s.trim(); });
        var cols    = el.dataset.cols    || '';

        /* Tuỳ biến bố cục cấp mục (màu KHÔNG đổi — theo type hồ sơ).
           Lưu ý: data-index = SỐ thứ tự, data-title = CHỮ tiêu đề (đã dùng) →
           dùng data-index-col / data-title-style cho tuỳ biến. */
        var secAlign = (el.dataset.align || '').toLowerCase();
        var secGap   = (el.dataset.gap   || '').toLowerCase();
        var secTitle = (el.dataset.titleStyle || '').toLowerCase();
        var noIndex  = (el.dataset.indexCol || '').toLowerCase() === 'off';
        var secCls = '';
        if (secAlign === 'center' || secAlign === 'right') secCls += ' dsec-' + secAlign;
        if (secGap === 'tight' || secGap === 'loose') secCls += ' dgap-' + secGap;
        if (secTitle === 'plain' || secTitle === 'center' || secTitle === 'none') secCls += ' dtitle-' + secTitle;
        if (noIndex) secCls += ' dnoindex';

        /* Collect slot elements */
        var slotEls = el.querySelectorAll(':scope > .dossier-slot-data');

        /* Build each slot HTML */
        var slotsHTML = [];
        for (var i = 0; i < layout.length; i++) {
            var slotEl = slotEls[i] || null;
            var html;
            if (slotEl) {
                /* Override type from layout token if slot has no explicit type */
                if (!slotEl.dataset.type) slotEl.dataset.type = layout[i];
                html = buildSlot(slotEl);
            } else {
                html = '<div class="dossier-text-slot"></div>';
            }
            slotsHTML.push('<div class="dossier-slot">' + html + '</div>');
        }

        /* Grid columns */
        var gridCols;
        if (cols) {
            gridCols = cols;
        } else {
            /* Auto equal columns */
            gridCols = layout.map(function(t){
                return (t === 'img' || t === 'secure') ? '2fr' : '3fr';
            }).join(' ');
        }

        var titleHTML = title
            ? '<div class="dossier-content-title">' +
              '<div class="dossier-title-accent"></div>' +
              esc(title) +
              '</div>'
            : '';

        return '<div class="dossier-section-container' + (variant === 'critical' ? ' critical-zone' : '') + secCls + '">' +
               '<div class="dossier-link-indicator"></div>' +
               '<div class="dossier-section-index"><div class="dossier-index-text">' + esc(index) + '</div></div>' +
               '<div class="dossier-section-content">' +
                   titleHTML +
                   '<div class="dossier-layout-grid" style="grid-template-columns:' + esc(gridCols) + '">' +
                       slotsHTML.join('') +
                   '</div>' +
               '</div>' +
               '</div>';
    }

    /* ══════════════════════════════════════════════════════
       AUX GRID BUILDER
       ══════════════════════════════════════════════════════ */

    function buildAux(el) {
        var items = [];
        var i = 1;
        while (el.dataset['label' + i] !== undefined || el.dataset['content' + i] !== undefined) {
            var label   = el.dataset['label' + i]   || '';
            var content = el.dataset['content' + i] || '';
            items.push(
                '<div class="dossier-aux-item">' +
                '<span class="dossier-aux-label">' + esc(label) + '</span>' +
                '<div class="dossier-aux-content">' + content + '</div>' +
                '</div>'
            );
            i++;
        }
        if (!items.length) return '';
        return '<div class="dossier-aux-grid">' + items.join('') + '</div>';
    }

    /* ══════════════════════════════════════════════════════
       TICKER BUILDER
       ══════════════════════════════════════════════════════ */

    function buildTicker(raw) {
        if (!raw) return '';
        var items = raw.split('//').map(function(s){ return s.trim(); }).filter(Boolean);
        var inner = items.map(function(s){
            return '<span>' + esc(s) + '</span><span class="dossier-tick-sep">·</span>';
        }).join('');
        var track = inner + inner; /* duplicate for seamless loop */
        return '<div class="dossier-data-ticker">' +
               '<span class="dossier-ticker-label">DATA</span>' +
               '<div class="dossier-ticker-track">' + track + '</div>' +
               '</div>';
    }

    /* ══════════════════════════════════════════════════════
       SIDE STRIP BUILDER
       ══════════════════════════════════════════════════════ */

    function buildSideStrip(el, side) {
        var label  = el.dataset['side' + side + 'Label'] || (side === 'Left' ? 'MAPLE' : 'ARCHIVE');

        /* Collect any side-image children */
        var imgs = el.querySelectorAll(':scope > .dossier-side-img-' + side.toLowerCase());
        var imgHTML = '';
        imgs.forEach(function(imgEl) {
            imgHTML += '<img src="' + esc(imgEl.dataset.src || '') + '" alt="">';
        });

        return '<div class="dossier-side dossier-side-' + side.toLowerCase() + '">' +
               '<div class="dossier-side-label">' + esc(label) + '</div>' +
               imgHTML +
               '</div>';
    }

    /* ══════════════════════════════════════════════════════
       MAIN DOSSIER BUILDER
       ══════════════════════════════════════════════════════ */

    document.querySelectorAll('.maple-dossier').forEach(function(dossierEl) {

        var headerLeft   = dossierEl.dataset.headerLeft   || 'M.A.P.L.E ARCHIVE';
        var headerRight  = dossierEl.dataset.headerRight  || 'ACTIVE';
        var tickerRaw    = dossierEl.dataset.ticker        || '';
        var footerHash   = dossierEl.dataset.footerHash   || ('0x' + uid().toUpperCase());
        var footerNote   = dossierEl.dataset.footerNote   || 'M.A.P.L.E INTERNAL DOCUMENT';
        var showSides    = (dossierEl.dataset.sides || 'true') !== 'false';

        /* ── Tuỳ biến tác giả: animation + diện mạo/bố cục (màu chỉ qua data-type) ── */
        var ds = dossierEl.dataset;
        var dossierType = (ds.type || '').toLowerCase();
        var frameClasses = [
            'danim-'   + pick(ds.anim,    DOSSIER_ENUM.anim,    'full'),
            'dreveal-' + pick(ds.reveal,  DOSSIER_ENUM.reveal,  'slide'),
            'dspeed-'  + pick(ds.speed,   DOSSIER_ENUM.speed,   'normal'),
            'dw-'      + pick(ds.width,   DOSSIER_ENUM.width,   'normal'),
            'dframe-'  + pick(ds.frame,   DOSSIER_ENUM.frame,   'bracket'),
            'dpat-'    + pick(ds.pattern, DOSSIER_ENUM.pattern, 'none'),
            'dhead-'   + pick(ds.header,  DOSSIER_ENUM.header,  'full')
        ];
        if ((ds.density || '').toLowerCase() === 'compact') frameClasses.push('ddense');
        if ((ds.glow    || '').toLowerCase() === 'off')     frameClasses.push('dnoglow');
        if ((ds.corners || '').toLowerCase() === 'off')     frameClasses.push('dnocorners');
        if ((ds.sidePattern || '').toLowerCase() === 'none') frameClasses.push('dnoside');
        var frameRadius = parseInt(ds.radius, 10);

        /* Gather child elements before clearing */
        var children = Array.prototype.slice.call(dossierEl.children);

        /* ── Build sections & aux ── */
        var contentHTML = '';
        var sectionIdx  = 0;
        children.forEach(function(child) {
            if (child.classList.contains('dossier-section')) {
                contentHTML += buildSection(child, sectionIdx);
                sectionIdx++;
            } else if (child.classList.contains('dossier-aux')) {
                contentHTML += buildAux(child);
            }
        });

        /* ── Assemble ── */
        var sidesHTML = showSides
            ? '<div class="dossier-side dossier-side-left"><div class="dossier-side-label">' + esc(dossierEl.dataset.sideLeftLabel || 'MAPLE') + '</div></div>' +
              '<div class="dossier-side dossier-side-right"><div class="dossier-side-label">' + esc(dossierEl.dataset.sideRightLabel || 'ARCHIVE') + '</div></div>'
            : '';

        var html =
            '<div class="dossier-frame">' +
            '<div class="dossier-corner-tr"></div>' +
            '<div class="dossier-corner-bl"></div>' +

            /* Header */
            '<div class="dossier-header-strip">' +
                '<span><span class="dossier-status-dot"></span>' + esc(headerLeft) + '</span>' +
                '<span>' + esc(headerRight) + '</span>' +
            '</div>' +

            /* Ticker */
            buildTicker(tickerRaw) +

            /* Body: sides + main */
            '<div class="dossier-body' + (showSides ? '' : ' no-sides') + '">' +
                (showSides
                    ? '<div class="dossier-side dossier-side-left"><div class="dossier-side-label">' + esc(dossierEl.dataset.sideLeftLabel || 'MAPLE') + '</div></div>'
                    : '') +
                '<div class="dossier-main">' + contentHTML + '</div>' +
                (showSides
                    ? '<div class="dossier-side dossier-side-right"><div class="dossier-side-label">' + esc(dossierEl.dataset.sideRightLabel || 'ARCHIVE') + '</div></div>'
                    : '') +
            '</div>' +

            /* Footer */
            '<div class="dossier-footer">' +
                '<span class="dossier-footer-hash">' + esc(footerHash) + '</span>' +
                '<span>' + esc(footerNote) + '</span>' +
                '<div class="dossier-barcode"></div>' +
            '</div>' +

            '</div>';

        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        var frame = tmp.firstChild;

        /* Áp tuỳ biến tác giả lên frame */
        frameClasses.forEach(function (c) { frame.classList.add(c); });
        if (TYPE_COLORS[dossierType]) frame.style.setProperty('--d-cyan', TYPE_COLORS[dossierType]);
        if (!isNaN(frameRadius)) frame.style.borderRadius = Math.max(0, Math.min(14, frameRadius)) + 'px';

        dossierEl.parentNode.replaceChild(frame, dossierEl);

        /* ── Bind events ── */
        bindEvents(frame);

        /* ── IntersectionObserver for section animations ── */
        var obs = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });

        frame.querySelectorAll('.dossier-section-container, .dossier-aux-grid, .dossier-data-ticker, .dossier-footer').forEach(function(el) {
            obs.observe(el);
        });
    });

    /* ══════════════════════════════════════════════════════
       EVENT BINDING
       ══════════════════════════════════════════════════════ */

    function bindEvents(root) {

        /* SecureImage (dsi) */
        root.querySelectorAll('.dsi').forEach(function(el) {
            var body = el.querySelector('.dsi-body');
            if (!body) return;
            body.addEventListener('click', function() {
                if (el.classList.contains('decrypted')) return;
                el.classList.add('sweeping');
                setTimeout(function() { el.classList.remove('sweeping'); }, 750);
                setTimeout(function() {
                    el.classList.add('decrypted');
                    var hdr = el.querySelector('.dsi-header span:first-child');
                    if (hdr) hdr.innerHTML = '<span class="dsi-dot"></span>DỮ LIỆU ĐÃ GIẢI MÃ — QUYỀN TRUY CẬP ĐÃ CẤP';
                }, 200);
            });
        });

        /* Classified block (dcl) */
        root.querySelectorAll('.dossier-classified').forEach(function(el) {
            var body = el.querySelector('.dcl-body');
            if (!body) return;
            body.addEventListener('click', function() {
                if (el.classList.contains('decrypted')) return;
                el.classList.add('scanning');
                setTimeout(function() { el.classList.remove('scanning'); }, 650);
                setTimeout(function() {
                    el.classList.add('decrypted');
                    var hdr = el.querySelector('.dcl-header span:first-child');
                    if (hdr) hdr.innerHTML = '<span class="dcl-dot"></span>DỮ LIỆU ĐÃ GIẢI MÃ';
                }, 300);
            });
        });

        /* Inline redacted */
        root.querySelectorAll('.maple-redacted').forEach(function(el) {
            el.addEventListener('click', function() {
                el.classList.toggle('revealed');
            });
        });
    }

    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
