/* ============================================
   M.A.P.L.E — MediaWiki:Classified.js
   Hệ thống mã hoá / giải mã nội dung nhạy cảm

   ── CÁCH DÙNG TRONG WIKI ──

   [1] KHỐI HỒ SƠ MẬT (click để mở toàn bộ):
   <div class="maple-classified"
        data-ref="SEC-001"
        data-level="5">
   Nội dung bí mật ở đây...
   </div>

   Tuỳ chọn:
     data-ref   = mã tham chiếu hiển thị góc phải (mặc định: CLASSIFIED)
     data-level = cấp độ bảo mật (mặc định: 4)

   ──────────────────────────────────────────

   [2] CỤM TỪ BỊ XOÁ (click từng cụm để hiện):
   <span class="maple-redacted">Nội dung bí mật</span>

   Thêm hint ở dưới đoạn văn:
   <span class="maple-redacted-hint">>>> Click vào cụm từ bị mờ để giải mã</span>

   ============================================ */

(function () {
    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
        });
    }

    function init() {

    /* ══════════════════════════════════════════
       [1] CONFIDENTIAL BLOCK
       ══════════════════════════════════════════ */
    document.querySelectorAll('.maple-classified').forEach(function (el) {

        var ref   = esc(el.dataset.ref   || 'CLASSIFIED');
        var level = esc(el.dataset.level || '4');

        /* Lấy nội dung gốc */
        var originalHTML = el.innerHTML;

        /* Build lại cấu trúc */
        el.innerHTML =
            '<div class="maple-classified-header">' +
            '<span>' +
            '<span class="maple-classified-status-dot"></span>' +
            'DỮ LIỆU ĐANG KHÓA — CẤP ' + level + ' YÊU CẦU' +
            '</span>' +
            '<span class="maple-classified-ref">REF: ' + ref + '</span>' +
            '</div>' +
            '<div class="maple-classified-body">' +
            '<div class="maple-classified-scanline"></div>' +
            '<div class="maple-classified-badge">' +
            '<div class="maple-classified-badge-inner">NỘI DUNG BÍ MẬT — CLICK ĐỂ XÁC MINH</div>' +
            '<div class="maple-classified-level">YÊU CẦU CẤP ĐỘ TRUY CẬP ' + level + '+</div>' +
            '</div>' +
            '<div class="maple-classified-content">' + originalHTML + '</div>' +
            '</div>';

        /* Click để giải mã */
        var body = el.querySelector('.maple-classified-body');
        var header = el.querySelector('.maple-classified-header');
        var statusDot = el.querySelector('.maple-classified-status-dot');

        body.addEventListener('click', function () {
            if (el.classList.contains('decrypted')) return;

            /* Hiệu ứng scan */
            el.classList.add('scanning');
            setTimeout(function () { el.classList.remove('scanning'); }, 650);

            /* Decrypt */
            setTimeout(function () {
                el.classList.add('decrypted');
                header.querySelector('span:first-child').innerHTML =
                    '<span class="maple-classified-status-dot"></span>' +
                    'DỮ LIỆU ĐÃ GIẢI MÃ';
            }, 300);
        });
    });

    /* ══════════════════════════════════════════
       [2] INLINE REDACTED
       ══════════════════════════════════════════ */
    document.querySelectorAll('.maple-redacted').forEach(function (el) {
        el.addEventListener('click', function () {
            el.classList.toggle('revealed');
        });
    });

    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
