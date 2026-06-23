/* ══════════════════════════════════════════
   MAPLE — Rating Banner
   File: MediaWiki:RatingPage.js
   Load từ Common.js bằng:
   mw.loader.load('/wiki/MediaWiki:RatingPage.js?action=raw&ctype=text/javascript');
   ══════════════════════════════════════════ */

(function () {
    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
        });
    }

    function init() {

    var cards = document.querySelectorAll('.maple-rating');
    if (!cards.length) return;

    /* ── Màu theo mức ── */
    var colorMap = {
        '13': '#3b82f6',
        '16': '#eab308',
        '18': '#ef4444'
    };

    cards.forEach(function (el) {
        var muc      = (el.dataset.muc      || '13').trim();
        var moTa     = (el.dataset.moTa     || 'Không có mô tả.').trim();
        var canhBao  = (el.dataset.canhBao  || '').trim();
        var loiKhuyen= (el.dataset.loiKhuyen|| '').trim();
        var tagRaw   = (el.dataset.tag      || '').trim();

        var color = colorMap[muc] || '#3b82f6';

        /* Parse cảnh báo: ngăn cách bởi dấu ; */
        var warnItems = canhBao
            ? canhBao.split(';').map(function(s){ return s.trim(); }).filter(Boolean)
            : [];

        var warnHTML = warnItems.map(function(w){
            return '<li>' + esc(w) + '</li>';
        }).join('');

        /* Parse tags: mỗi token bắt đầu bằng # */
        var tags = tagRaw.match(/#\S+/g) || [];
        var tagsHTML = tags.map(function(t){
            return '<span class="mpr-tag">' + esc(t) + '</span>';
        }).join('');

        /* ── Render HTML ── */
        el.innerHTML =
            '<div class="mpr-scan"></div>' +
            '<div class="mpr-inner">' +

              '<div class="mpr-left">' +
                '<div class="mpr-badge">' + esc(muc) + '+</div>' +
                '<p class="mpr-desc">' + esc(moTa) + '</p>' +
                (tagsHTML ? '<div class="mpr-tags">' + tagsHTML + '</div>' : '') +
              '</div>' +

              '<div class="mpr-right">' +
                '<div class="mpr-warn-label">CONTENT WARNING</div>' +
                '<div class="mpr-warn-box">' +
                  (warnHTML ? '<ul>' + warnHTML + '</ul>' : '<p>Không có cảnh báo.</p>') +
                '</div>' +
                (loiKhuyen
                  ? '<div class="mpr-advice"><strong>Lời khuyên:</strong> ' + esc(loiKhuyen) + '</div>'
                  : '') +
              '</div>' +

            '</div>';

        /* Gắn màu qua CSS custom property */
        el.style.setProperty('--mpr-color', color);
        el.classList.add('mpr-card');
        el.classList.add('mpr-' + muc);

        /* ── Fade-in khi scroll vào ── */
        el.style.opacity = '0';
        el.style.transform = 'translateY(18px)';
        el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';

        var obs = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        obs.observe(el);
    });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
