/**
 * M.A.P.L.E — MediaWiki:MAPLE-Widget-Maze.js
 * WIDGET (không phải notifier): tiện ích nhập vai "Bảng điều khiển The Maze".
 *
 * Panel nổi mở từ App Drawer (window.MAPLE.widgetMaze.open):
 *   - Đồng hồ The Maze (giờ thực + "chu kỳ" giả lập)
 *   - Máy tính bỏ túi nhỏ
 *   - Bộ tạo MÃ TRUY CẬP / SEED ngẫu nhiên (nhập vai)
 * Thuần client, KHÔNG ghi wiki. CSS nội tuyến.
 */
(function () {
    'use strict';

    if (typeof mw === 'undefined') return;
    window.MAPLE = window.MAPLE || {};
    if (window.MAPLE.widgetMaze) return;

    function injectCSS() {
        if (document.getElementById('mwz-style')) return;
        var s = document.createElement('style');
        s.id = 'mwz-style';
        s.textContent = [
            '#mwz-overlay{position:fixed;inset:0;z-index:9100;display:none;background:rgba(2,2,2,.6);',
            '  backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}',
            '#mwz-overlay.open{display:block;animation:mwz-fade .18s ease}',
            '@keyframes mwz-fade{from{opacity:0}to{opacity:1}}',
            '#mwz-panel{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9101;',
            '  width:min(380px,calc(100vw - 28px));max-height:88vh;overflow:auto;background:#070707;',
            '  border:1px solid #1a1a1a;border-top:2px solid #8b5cf6;box-shadow:0 24px 70px rgba(0,0,0,.7);',
            '  font-family:"JetBrains Mono",ui-monospace,monospace;display:none}',
            '#mwz-panel.open{display:block;animation:mwz-pop .24s cubic-bezier(.22,1,.36,1)}',
            '@keyframes mwz-pop{from{opacity:0;transform:translate(-50%,-48%) scale(.97)}to{opacity:1;transform:translate(-50%,-50%)}}',
            '.mwz-head{padding:16px 18px 12px;border-bottom:1px solid #111;display:flex;align-items:center;justify-content:space-between}',
            '.mwz-head-l .mwz-eyebrow{font-size:7px;letter-spacing:.3em;color:#8b5cf6;text-transform:uppercase;margin-bottom:3px}',
            '.mwz-head-l .mwz-title{font-size:12px;font-weight:700;color:#e4e4e7;letter-spacing:.06em}',
            '.mwz-close{background:transparent;border:1px solid #1f1f1f;color:#71717a;cursor:pointer;',
            '  width:26px;height:26px;font-size:13px;line-height:1;transition:all .15s}',
            '.mwz-close:hover{border-color:#8b5cf6;color:#a78bfa}',
            '.mwz-sec{padding:14px 18px;border-bottom:1px solid #0e0e0e}',
            '.mwz-sec:last-child{border-bottom:none}',
            '.mwz-sec-l{font-size:7.5px;letter-spacing:.22em;color:#52525b;text-transform:uppercase;margin-bottom:9px}',
            '.mwz-clock{font-size:1.9rem;font-weight:700;color:#e4e4e7;letter-spacing:.06em;text-align:center}',
            '.mwz-cycle{font-size:8px;letter-spacing:.14em;color:#8b5cf6;text-align:center;margin-top:4px}',
            '.mwz-calc{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}',
            '.mwz-calc-disp{grid-column:1/-1;background:#0a0a0a;border:1px solid #1a1a1a;color:#e4e4e7;',
            '  font-family:inherit;font-size:14px;padding:8px 10px;text-align:right;margin-bottom:4px;min-height:34px}',
            '.mwz-k{font-family:inherit;font-size:12px;padding:9px 0;background:#0c0c0c;border:1px solid #161616;',
            '  color:#a1a1aa;cursor:pointer;transition:all .12s}',
            '.mwz-k:hover{background:#121212;border-color:#2a2a2a;color:#e4e4e7}',
            '.mwz-k.op{color:#a78bfa}.mwz-k.eq{background:#8b5cf6;border-color:#8b5cf6;color:#fff}',
            '.mwz-k.eq:hover{background:#7c3aed}',
            '.mwz-seed{display:flex;gap:8px;align-items:center}',
            '.mwz-seed-out{flex:1;background:#0a0a0a;border:1px solid #1a1a1a;color:#a78bfa;',
            '  font-family:inherit;font-size:12px;padding:9px 11px;letter-spacing:.1em;word-break:break-all}',
            '.mwz-seed-btn{font-family:inherit;font-size:9px;letter-spacing:.12em;font-weight:700;text-transform:uppercase;',
            '  padding:9px 14px;background:#8b5cf6;border:1px solid #8b5cf6;color:#fff;cursor:pointer;transition:all .15s}',
            '.mwz-seed-btn:hover{background:#7c3aed;border-color:#7c3aed}',
            '@media(max-width:480px){#mwz-panel{top:auto;bottom:0;left:0;transform:none;width:100%;max-height:80vh}',
            '#mwz-panel.open{animation:none}}'
        ].join('');
        document.head.appendChild(s);
    }

    var clockTimer = null;

    function tick() {
        var el = document.getElementById('mwz-clock');
        var cy = document.getElementById('mwz-cycle');
        if (!el) return;
        var d = new Date();
        function pad(n) { return (n < 10 ? '0' : '') + n; }
        el.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
        if (cy) {
            /* "Chu kỳ" nhập vai: đổi mỗi 10 phút trong ngày */
            var cycle = Math.floor((d.getHours() * 60 + d.getMinutes()) / 10) + 1;
            cy.textContent = '// CHU KỲ THE MAZE #' + cycle + ' / 144';
        }
    }

    function randSeed() {
        var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        var blocks = [];
        for (var b = 0; b < 3; b++) {
            var s = '';
            for (var i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
            blocks.push(s);
        }
        return 'MZ-' + blocks.join('-');
    }

    function buildCalc() {
        var keys = ['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'];
        var html = '<input class="mwz-calc-disp" id="mwz-disp" value="0" readonly>';
        keys.forEach(function (k) {
            var cls = 'mwz-k';
            if (/[\/*\-+]/.test(k)) cls += ' op';
            if (k === '=') cls += ' eq';
            html += '<button class="' + cls + '" data-k="' + k + '">' + k + '</button>';
        });
        return html;
    }

    function wireCalc(panel) {
        var disp = panel.querySelector('#mwz-disp');
        var expr = '';
        function refresh() { disp.value = expr || '0'; }
        panel.querySelectorAll('.mwz-k').forEach(function (b) {
            b.addEventListener('click', function () {
                var k = b.getAttribute('data-k');
                if (k === '=') {
                    try {
                        /* Chỉ cho phép số và toán tử cơ bản — an toàn */
                        if (/^[0-9.+\-*/() ]+$/.test(expr)) {
                            /* eslint-disable no-new-func */
                            var r = Function('"use strict";return (' + expr + ')')();
                            expr = (r == null || !isFinite(r)) ? 'Lỗi' : String(Math.round(r * 1e8) / 1e8);
                        } else { expr = 'Lỗi'; }
                    } catch (e) { expr = 'Lỗi'; }
                    refresh();
                    if (expr === 'Lỗi') expr = '';
                    return;
                }
                if (expr === 'Lỗi') expr = '';
                expr += k;
                refresh();
            });
        });
    }

    function build() {
        if (document.getElementById('mwz-panel')) return;
        injectCSS();

        var overlay = document.createElement('div');
        overlay.id = 'mwz-overlay';
        overlay.addEventListener('click', close);
        document.body.appendChild(overlay);

        var panel = document.createElement('div');
        panel.id = 'mwz-panel';
        panel.setAttribute('role', 'dialog');
        panel.innerHTML =
            '<div class="mwz-head">' +
                '<div class="mwz-head-l">' +
                    '<div class="mwz-eyebrow">// The Maze</div>' +
                    '<div class="mwz-title">Bảng điều khiển</div>' +
                '</div>' +
                '<button class="mwz-close" id="mwz-close" title="Đóng">✕</button>' +
            '</div>' +
            '<div class="mwz-sec">' +
                '<div class="mwz-sec-l">Đồng hồ</div>' +
                '<div class="mwz-clock" id="mwz-clock">--:--:--</div>' +
                '<div class="mwz-cycle" id="mwz-cycle"></div>' +
            '</div>' +
            '<div class="mwz-sec">' +
                '<div class="mwz-sec-l">Máy tính</div>' +
                '<div class="mwz-calc">' + buildCalc() + '</div>' +
            '</div>' +
            '<div class="mwz-sec">' +
                '<div class="mwz-sec-l">Mã truy cập ngẫu nhiên</div>' +
                '<div class="mwz-seed">' +
                    '<div class="mwz-seed-out" id="mwz-seed">MZ-····-····-····</div>' +
                    '<button class="mwz-seed-btn" id="mwz-seed-btn" type="button">Tạo</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(panel);

        panel.querySelector('#mwz-close').addEventListener('click', close);
        panel.querySelector('#mwz-seed-btn').addEventListener('click', function () {
            panel.querySelector('#mwz-seed').textContent = randSeed();
        });
        wireCalc(panel);
        document.addEventListener('keydown', onKey);
    }

    function onKey(e) { if (e.key === 'Escape') close(); }

    function open() {
        build();
        document.getElementById('mwz-overlay').classList.add('open');
        document.getElementById('mwz-panel').classList.add('open');
        tick();
        if (!clockTimer) clockTimer = setInterval(tick, 1000);
    }

    function close() {
        var ov = document.getElementById('mwz-overlay');
        var pn = document.getElementById('mwz-panel');
        if (ov) ov.classList.remove('open');
        if (pn) pn.classList.remove('open');
        if (clockTimer) { clearInterval(clockTimer); clockTimer = null; }
    }

    window.MAPLE.widgetMaze = { open: open, close: close };
})();
