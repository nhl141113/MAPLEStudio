/* ============================================
   M.A.P.L.E — MediaWiki:Donate.js
   Trang Donate / Ủng hộ Wiki — đọc MediaWiki:Donate-data.json (admin sửa)
   ============================================ */
(function () {
    function init() {
        var target = document.getElementById('dn-root-placeholder')
                  || document.getElementById('mw-content-text');
        if (!target) return;

        function esc(s) {
            return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
            });
        }
        function logo(sz) { return (window.MAPLE && window.MAPLE.logoSVG) ? window.MAPLE.logoSVG(sz) : ''; }

        var DEFAULT = {
            intro: 'M.A.P.L.E Wiki là dự án PHI LỢI NHUẬN do cộng đồng vận hành. Mọi khoản đóng góp đều tự nguyện và được dùng để duy trì hạ tầng, tên miền và phát triển tính năng.',
            goal: { label: 'Mục tiêu vận hành', current: 0, target: 0, currency: '₫', note: 'Cập nhật khi có dữ liệu thực tế.' },
            methods: [
                { name: 'Chuyển khoản ngân hàng', icon: '🏦', detail: 'Số tài khoản / chủ TK', value: 'Đang cập nhật', color: '#22c55e' },
                { name: 'Momo / Ví điện tử', icon: '📱', detail: 'Số điện thoại / QR', value: 'Đang cập nhật', color: '#a855f7' },
                { name: 'Ko-fi / PayPal', icon: '☕', detail: 'Link ủng hộ quốc tế', value: 'Đang cập nhật', color: '#3b82f6' }
            ],
            perks: [
                'Huy hiệu "Nhà tài trợ" trên trang cá nhân (Thành Tựu).',
                'Được vinh danh tại trang này (nếu đồng ý).',
                'Góp phần giữ Wiki online & không quảng cáo xâm phạm.'
            ],
            thanks: []
        };

        target.innerHTML = '<div id="dn-root"><div class="dn-loading"><div class="dn-spin"></div>// ĐANG TẢI…</div></div>';

        $.getJSON(mw.config.get('wgScriptPath') + '/api.php', {
            action: 'query', titles: 'MediaWiki:Donate-data.json',
            prop: 'revisions', rvprop: 'content', rvslots: 'main', format: 'json', origin: '*'
        }).done(function (d) {
            var data = DEFAULT;
            try {
                var pages = d.query.pages, pg = pages[Object.keys(pages)[0]];
                if (pg.missing === undefined && pg.revisions) {
                    var parsed = JSON.parse(pg.revisions[0].slots.main['*']);
                    data = $.extend(true, {}, DEFAULT, parsed);
                }
            } catch (e) {}
            render(data);
        }).fail(function () { render(DEFAULT); });

        function render(data) {
            var pct = (data.goal && data.goal.target > 0)
                ? Math.min(100, Math.round((data.goal.current / data.goal.target) * 100)) : 0;

            var methods = (data.methods || []).map(function (m) {
                return '<div class="dn-method" style="--dn-accent:' + esc(m.color || '#ef4444') + '">' +
                    '<div class="dn-method-icon">' + esc(m.icon || '◈') + '</div>' +
                    '<div class="dn-method-body">' +
                        '<div class="dn-method-name">' + esc(m.name || '') + '</div>' +
                        '<div class="dn-method-detail">' + esc(m.detail || '') + '</div>' +
                        '<div class="dn-method-value"><span>' + esc(m.value || '') + '</span>' +
                            '<button class="dn-copy" type="button" data-copy="' + esc(m.value || '') + '">Sao chép</button></div>' +
                    '</div>' +
                '</div>';
            }).join('');

            var perks = (data.perks || []).map(function (p) {
                return '<li><span class="dn-perk-dot">+</span>' + esc(p) + '</li>';
            }).join('');

            var thanks = (data.thanks && data.thanks.length)
                ? '<div class="dn-thanks"><div class="dn-eyebrow">// NHÀ TÀI TRỢ</div><div class="dn-thanks-grid">' +
                    data.thanks.map(function (t) { return '<span class="dn-thanks-chip">◈ ' + esc(t) + '</span>'; }).join('') +
                  '</div></div>'
                : '';

            var goalBlock = (data.goal && data.goal.target > 0)
                ? '<div class="dn-goal">' +
                    '<div class="dn-goal-top"><span>' + esc(data.goal.label || 'Mục tiêu') + '</span>' +
                        '<span class="dn-goal-num">' + esc(String(data.goal.current)) + ' / ' + esc(String(data.goal.target)) + ' ' + esc(data.goal.currency || '') + '</span></div>' +
                    '<div class="dn-goal-bar"><div class="dn-goal-fill" style="width:' + pct + '%"></div></div>' +
                    (data.goal.note ? '<div class="dn-goal-note">' + esc(data.goal.note) + '</div>' : '') +
                  '</div>'
                : '';

            target.innerHTML =
                '<div id="dn-root">' +
                '<div class="dn-hero">' +
                    '<div class="dn-hero-logo">' + logo(78) + '</div>' +
                    '<div class="dn-eyebrow">// PHI LỢI NHUẬN — CỘNG ĐỒNG VẬN HÀNH</div>' +
                    '<h1 class="dn-title">ỦNG HỘ <span>M.A.P.L.E</span></h1>' +
                    '<p class="dn-sub">' + esc(data.intro) + '</p>' +
                    '<a class="dn-cta" href="#dn-methods">↓ Cách ủng hộ</a>' +
                '</div>' +
                goalBlock +
                '<div class="dn-section" id="dn-methods"><div class="dn-eyebrow">// CÁCH ỦNG HỘ</div>' +
                    '<div class="dn-methods">' + (methods || '<div class="dn-empty">// CHƯA CÓ PHƯƠNG THỨC</div>') + '</div></div>' +
                (perks ? '<div class="dn-section"><div class="dn-eyebrow">// QUYỀN LỢI NHÀ TÀI TRỢ</div><ul class="dn-perks">' + perks + '</ul></div>' : '') +
                thanks +
                '<div class="dn-note">100% đóng góp dùng cho hạ tầng & phát triển Wiki — KHÔNG chia cho cá nhân BQT. ' +
                    'Xem <a href="/wiki/D%E1%BB%B1_%C3%A1n:B%E1%BA%A3n_quy%E1%BB%81n">Điều khoản bản quyền</a>.</div>' +
                '<div class="dn-footer"><a href="/wiki/Trang_Ch%C3%ADnh">← Trang Chủ</a>' +
                    '<span>M.A.P.L.E WIKI — Cảm ơn bạn 🍁</span></div>' +
                '</div>';

            target.querySelectorAll('.dn-copy').forEach(function (b) {
                b.addEventListener('click', function () {
                    var v = b.getAttribute('data-copy') || '';
                    if (navigator.clipboard) navigator.clipboard.writeText(v).then(function () {
                        b.textContent = 'Đã sao chép!'; b.classList.add('copied');
                        setTimeout(function () { b.textContent = 'Sao chép'; b.classList.remove('copied'); }, 1600);
                    });
                });
            });
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
