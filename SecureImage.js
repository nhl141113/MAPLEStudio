/* ============================================
   M.A.P.L.E — MediaWiki:SecureImage.js
   Hệ thống ảnh mật — click để giải mã

   ── CÁCH DÙNG TRONG WIKI ──

   <div class="maple-secure-image"
        data-src="https://url-anh-cua-ban.jpg"
        data-ref="VIS-001"
        data-level="3"
        data-rating="13"
        data-caption="Mô tả ảnh tại đây"
   ></div>

   Tham số:
     data-src     = URL ảnh (bắt buộc)
     data-ref     = mã tham chiếu (mặc định: CLASSIFIED)
     data-level   = cấp độ bảo mật 1-5 (mặc định: 4)
     data-rating  = 13 | 16 | 18 (hiển thị nhãn độ tuổi)
     data-caption = chú thích ảnh hiện sau khi mở (tuỳ chọn)

   ============================================ */

(function () {
    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
        });
    }

    function init() {

    /* Nhãn cấp độ */
    var LEVEL_LABELS = {
        '1': 'CẤP 1 — CÔNG KHAI',
        '2': 'CẤP 2 — NỘI BỘ',
        '3': 'CẤP 3 — HẠN CHẾ',
        '4': 'CẤP 4 — MẬT',
        '5': 'CẤP 5 — TỐI MẬT'
    };

    /* Cảnh báo theo rating */
    var RATING_WARNINGS = {
        '13': 'NỘI DUNG 13+ — CLICK ĐỂ GIẢI MÃ',
        '16': 'KHU VỰC HẠN CHẾ 16+ — CLICK ĐỂ GIẢI MÃ',
        '18': 'TỐI MẬT 18+ — CLICK ĐỂ GIẢI MÃ'
    };

    var RATING_SUB = {
        '13': 'TRUY CẬP TRÁI PHÉP BỊ NGHIÊM CẤM',
        '16': 'TÀI SẢN ĐỘC QUYỀN CỦA M.A.P.L.E',
        '18': 'CHỈ DÀNH CHO MẮT ĐƯỢC PHÉP. ĐANG GIÁM SÁT TÂM LÝ.'
    };

    document.querySelectorAll('.maple-secure-image').forEach(function (el) {

        var src     = esc(el.dataset.src     || '');
        var ref     = esc(el.dataset.ref     || 'CLASSIFIED');
        var level   = el.dataset.level   || '4';
        var rating  = el.dataset.rating  || '';
        var caption = esc(el.dataset.caption || '');

        var levelLabel  = esc(LEVEL_LABELS[level]  || ('CẤP ' + level + ' — MẬT'));
        var warnText    = esc((rating && RATING_WARNINGS[rating]) || 'NỘI DUNG MẬT — CLICK ĐỂ GIẢI MÃ');
        var warnSub     = esc((rating && RATING_SUB[rating])     || 'TRUY CẬP TRÁI PHÉP BỊ NGHIÊM CẤM');
        var ratingClass = rating ? 'r' + esc(rating) : '';

        /* Rating badge HTML */
        var ratingHTML = rating
            ? '<div class="maple-secure-image-rating ' + ratingClass + '">' + esc(rating) + '+</div>'
            : '';

        /* Caption HTML */
        var captionHTML = caption
            ? '<div class="maple-secure-image-caption">' +
              '<span>// ' + caption + '</span>' +
              '<span>REF: ' + ref + '</span>' +
              '</div>'
            : '<div class="maple-secure-image-caption">' +
              '<span>M.A.P.L.E VISUAL ARCHIVE</span>' +
              '<span>REF: ' + ref + '</span>' +
              '</div>';

        /* Build HTML */
        el.innerHTML =
            '<div class="maple-secure-image-header">' +
            '<span>' +
            '<span class="maple-secure-image-dot"></span>' +
            'DỮ LIỆU ĐANG KHÓA — ' + levelLabel + ' YÊU CẦU' +
            '</span>' +
            '<span class="maple-secure-image-ref">REF: ' + ref + '</span>' +
            '</div>' +

            '<div class="maple-secure-image-body" id="body-' + ref + '">' +
            '<div class="maple-secure-image-scanline"></div>' +
            '<div class="maple-secure-image-sweep"></div>' +
            ratingHTML +
            '<div class="maple-secure-image-warning">' +
            '<div class="maple-secure-image-warning-box">' + warnText + '</div>' +
            '<div class="maple-secure-image-warning-sub">' + warnSub + '</div>' +
            '</div>' +
            '<img src="' + src + '" alt="' + ref + '" draggable="false">' +
            '</div>' +

            captionHTML;

        /* Click để giải mã */
        el.querySelector('.maple-secure-image-body').addEventListener('click', function () {
            if (el.classList.contains('decrypted')) return;

            /* Hiệu ứng sweep */
            el.classList.add('sweeping');
            setTimeout(function () { el.classList.remove('sweeping'); }, 750);

            /* Decrypt sau delay nhỏ */
            setTimeout(function () {
                el.classList.add('decrypted');
                var header = el.querySelector('.maple-secure-image-header span:first-child');
                header.innerHTML =
                    '<span class="maple-secure-image-dot"></span>' +
                    'DỮ LIỆU ĐÃ GIẢI MÃ — QUYỀN TRUY CẬP ĐÃ CẤP';
            }, 200);
        });
    });

    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
