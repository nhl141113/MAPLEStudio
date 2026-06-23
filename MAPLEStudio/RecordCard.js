/* ============================================
   M.A.P.L.E — MediaWiki:RecordCard.js
   Tự động render các template hồ sơ từ thẻ div
   trong nội dung wiki.

   CÁCH DÙNG TRONG WIKI (wikitext):
   <div class="maple-record-data maple-record-diary"
        data-id="NKA-001"
        data-title="Nhật Ký Người Lính"
        data-clearance="F.I.F.R.O"
        data-author="[Đã xóa]"
        data-source="M.A.P.L.E / LOGS"
        data-desc="Mô tả ngắn về tài liệu này..."
        data-notes="Ghi chú 1|Ghi chú 2|Ghi chú 3"
   ></div>

   Thay class:
     maple-record-diary  → Nhật Ký  (đỏ hồng)
     maple-record-entity → Thực Thể (xanh dương)
     maple-record-item   → Vật Phẩm (vàng)

   data-clearance: chuỗi cấp độ bảo mật, ví dụ "LEVEL 3+"
   data-notes: các ghi chú cách nhau bằng |
   ============================================ */

(function () {
    function init() {
    // Cờ phát hiện chế độ Welcome Tour
    var isWelcomeTour = window.location.pathname.endsWith('/welcome');
    /* ── Icon SVG theo loại ── */
    var SVG_DOC = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>';
    var ICONS = {
        diary: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
        entity: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
        item: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
        log: SVG_DOC,
        event: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        location: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
        personnel: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        classified: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><line x1="12" y1="15" x2="12" y2="18"/></svg>'
    };

    /* ── Label tiêu đề theo loại ── */
    var TYPE_CONFIG = {
        diary:      { prefix: 'TÀI LIỆU: NHẬT KÝ', secLabel: 'PHÂN LOẠI TRUY CẬP', fields: ['Người Viết', 'Nguồn'],   dotPos: 0 },
        entity:     { prefix: 'THỰC THỂ',          secLabel: 'MỨC ĐỘ NGUY HIỂM',   fields: ['Gặp Tại', 'Nguy Hiểm'],  dotPos: 1 },
        item:       { prefix: 'VẬT PHẨM',          secLabel: 'PHÂN LOẠI',           fields: ['Độ Hiếm', 'Loại'],       dotPos: 2 },
        log:        { prefix: 'BẢN GHI',           secLabel: 'PHÂN LOẠI SỰ VỤ',     fields: ['Mã Sự Vụ', 'Phân Loại'], dotPos: 0 },
        event:      { prefix: 'SỰ KIỆN',           secLabel: 'QUY MÔ',              fields: ['Thời Điểm', 'Quy Mô'],   dotPos: 1 },
        location:   { prefix: 'ĐỊA ĐIỂM',          secLabel: 'MỨC ỔN ĐỊNH',         fields: ['Khu Vực', 'Mức Ổn Định'], dotPos: 2 },
        personnel:  { prefix: 'NHÂN SỰ',           secLabel: 'PHÂN LOẠI TRUY CẬP',  fields: ['Bộ Phận', 'Chức Vụ'],    dotPos: 0 },
        classified: { prefix: 'TÀI LIỆU TỐI MẬT',  secLabel: 'CẤP ĐỘ BẢO MẬT',      fields: ['Cấp Độ', 'Phụ Trách'],   dotPos: 2 }
    };

    /* ── Helper: escape HTML ── */
    function esc(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /* ── Render từng card ── */
    document.querySelectorAll('.maple-record-data').forEach(function (el) {

        /* Xác định loại */
        var type = 'diary';
        if (el.classList.contains('maple-record-entity')) type = 'entity';
        if (el.classList.contains('maple-record-item'))   type = 'item';
        if (el.classList.contains('maple-record-log'))    type = 'log';
        if (el.classList.contains('maple-record-event'))  type = 'event';
        if (el.classList.contains('maple-record-location')) type = 'location';
        if (el.classList.contains('maple-record-personnel')) type = 'personnel';
        if (el.classList.contains('maple-record-classified')) type = 'classified';

        var cfg = TYPE_CONFIG[type];

        /* Đọc data attributes */
        var id         = el.dataset.id         || '—';
        var title      = el.dataset.title      || '—';
        var clearance  = el.dataset.clearance  || '—';
        var field1     = el.dataset.field1     || '—';
        var field2     = el.dataset.field2     || '—';
        var desc       = el.dataset.desc       || '';
        var notesRaw   = el.dataset.notes      || '';
        var notes      = notesRaw ? notesRaw.split('|').map(function(s){ return s.trim(); }) : [];

        /* Dots footer */
        var dots = [0,1,2].map(function(i) {
            return '<div class="maple-record-dot' + (i === cfg.dotPos ? ' active' : '') + '"></div>';
        }).join('');

        /* Ghi chú list */
        var notesHTML = '';
        if (notes.length) {
            notesHTML = '<ul class="maple-record-notes">' +
                notes.map(function(n){ return '<li>' + esc(n) + '</li>'; }).join('') +
                '</ul>';
        }

        /* Mô tả */
        var descHTML = desc
            ? '<div class="maple-record-desc">' +
              '<span class="maple-record-desc-label">// Mô Tả</span>' +
              esc(desc) + notesHTML +
              '</div>'
            : (notesHTML
                ? '<div class="maple-record-desc">' + notesHTML + '</div>'
                : '');

        /* Build HTML */
        var html =
            '<div class="maple-record maple-record-' + type + '">' +
            '<div class="maple-record-accent"></div>' +

            '<div class="maple-record-header">' +
            '<div class="maple-record-title">' + esc(cfg.prefix) + ': <span>' + esc(id) + '</span></div>' +
            '<div class="maple-record-security">' +
            '<div class="maple-record-security-code">' + esc(clearance) + '</div>' +
            '<div class="maple-record-security-label">' + cfg.secLabel + '</div>' +
            '</div></div>' +

            '<div class="maple-record-grid">' +

            '<div class="maple-record-primary">' +
            '<div>' +
            '<div class="maple-record-primary-label">TÊN HỒ SƠ:</div>' +
            '<div class="maple-record-primary-value">' + esc(title) + '</div>' +
            '</div>' +
            '<div class="maple-record-lock">' + ICONS[type] + '</div>' +
            '</div>' +

            '<div class="maple-record-cells">' +
            '<div class="maple-record-cell">' +
            '<div class="maple-record-cell-label">' + esc(cfg.fields[0]) + ':</div>' +
            '<div class="maple-record-cell-value">' + esc(field1) + '</div>' +
            '</div>' +
            '<div class="maple-record-cell">' +
            '<div class="maple-record-cell-label">' + esc(cfg.fields[1]) + ':</div>' +
            '<div class="maple-record-cell-value">' + esc(field2) + '</div>' +
            '</div>' +
            '</div>' +

            '</div>' + /* end grid */

            descHTML +

            '<div class="maple-record-footer">' +
            '<div class="maple-record-dots">' + dots + '</div>' +
            '<div class="maple-record-line"></div>' +
            '<div class="maple-record-footer-code">M.A.P.L.E ARCHIVE // ' + esc(id) + '</div>' +
            '</div>' +

            '</div>'; /* end maple-record */

        el.outerHTML = html;
    });

    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
