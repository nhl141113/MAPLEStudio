/**
 * M.A.P.L.E — MediaWiki:PhanHoi-Popup.js
 * Popup phản hồi toàn cục — nút nav "PHẢN HỒI" → modal.
 * Chạy mọi trang, độc lập với PhanHoi.js (trang index/detail).
 * Submit → tạo trang Dự_án:Phản_hồi/{id}. Thành công → "Cảm ơn" 2s → tự đóng.
 */
(function () {
    'use strict';

    if (typeof mw === 'undefined') return;

    var isLoggedIn = !!(mw.config.get('wgUserId'));
    var userName   = mw.config.get('wgUserName') || '';

    /* ── CSS ── */
    function injectCSS() {
        if (document.getElementById('ph-popup-style')) return;
        var s = document.createElement('style');
        s.id = 'ph-popup-style';
        s.textContent = [
            /* Overlay */
            '#ph-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;',
            'justify-content:center;padding:20px;background:rgba(2,2,2,.80);',
            'backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);',
            'opacity:0;pointer-events:none;transition:opacity .2s ease;',
            'font-family:"JetBrains Mono",ui-monospace,monospace}',
            '#ph-overlay.ph-open{opacity:1;pointer-events:all}',

            /* Card */
            '@keyframes ph-pop{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}',
            '#ph-card{width:min(500px,100%);max-height:90vh;overflow-y:auto;background:#080808;',
            'border:1px solid #1e1e1e;border-top:2px solid #ef4444;',
            'box-shadow:0 28px 80px rgba(0,0,0,.7);',
            'animation:ph-pop .24s cubic-bezier(.22,1,.36,1)}',
            '@media(max-width:540px){#ph-card{max-height:100vh;border-left:none;border-right:none;',
            'border-bottom:none;position:fixed;bottom:0;left:0;right:0;animation:ph-sheet .24s cubic-bezier(.22,1,.36,1)}}',
            '@keyframes ph-sheet{from{transform:translateY(100%)}to{transform:translateY(0)}}',

            /* Header */
            '.ph-hd{display:flex;align-items:flex-start;justify-content:space-between;',
            'padding:18px 20px 14px;border-bottom:1px solid #141414;',
            'background:radial-gradient(ellipse 90% 80% at 50% 0%,rgba(239,68,68,.09),transparent 70%)}',
            '.ph-hd-left{}',
            '.ph-hd-ey{font-size:7.5px;letter-spacing:.28em;color:#52525b;margin-bottom:5px}',
            '.ph-hd-title{font-size:1.05rem;font-weight:800;letter-spacing:.1em;color:#f4f4f5;',
            'margin:0;line-height:1.1}',
            '.ph-hd-title em{color:#ef4444;font-style:normal}',
            '.ph-x{background:transparent;border:1px solid #1e1e1e;color:#52525b;',
            'width:26px;height:26px;font-size:11px;cursor:pointer;display:flex;align-items:center;',
            'justify-content:center;flex-shrink:0;transition:all .15s;font-family:inherit;margin-top:2px}',
            '.ph-x:hover{border-color:#ef4444;color:#ef4444}',

            /* Body */
            '.ph-bd{padding:18px 20px;display:flex;flex-direction:column;gap:14px}',

            /* Category */
            '.ph-cat-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}',
            '.ph-cat-btn{font-family:inherit;font-size:9.5px;letter-spacing:.07em;',
            'padding:5px 11px;border:1px solid #222;background:transparent;color:#52525b;',
            'cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:5px}',
            '.ph-cat-btn:hover{border-color:#ef4444;color:#e4e4e7}',
            '.ph-cat-btn.ph-active{border-color:#ef4444;background:rgba(239,68,68,.08);color:#ef4444}',

            /* Author */
            '.ph-au-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}',
            '.ph-au-btn{font-family:inherit;font-size:9.5px;letter-spacing:.07em;',
            'padding:5px 11px;border:1px solid #222;background:transparent;color:#52525b;',
            'cursor:pointer;transition:all .15s}',
            '.ph-au-btn:hover{border-color:#3b82f6;color:#e4e4e7}',
            '.ph-au-btn.ph-active{border-color:#3b82f6;background:rgba(59,130,246,.07);color:#93c5fd}',

            /* Field */
            '.ph-field{display:flex;flex-direction:column;gap:5px}',
            '.ph-lbl{font-size:8px;letter-spacing:.2em;color:#52525b;text-transform:uppercase}',
            '.ph-hint{font-size:8.5px;color:#52525b;letter-spacing:.04em}',
            '.ph-inp,.ph-ta,.ph-alias{font-family:inherit;font-size:11px;background:#050505;',
            'border:1px solid #1a1a1a;color:#e4e4e7;padding:8px 11px;outline:none;',
            'transition:border-color .15s;width:100%;box-sizing:border-box;line-height:1.6}',
            '.ph-inp:focus,.ph-ta:focus,.ph-alias:focus{border-color:#ef4444}',
            '.ph-ta{resize:vertical;min-height:96px}',
            '.ph-alias{margin-top:7px;display:none}',
            '.ph-cc{font-size:8.5px;color:#52525b;text-align:right;letter-spacing:.08em}',

            /* Status */
            '.ph-msg{font-size:9.5px;letter-spacing:.06em;padding:6px 10px;border-left:3px solid #52525b;display:none}',
            '.ph-msg.ph-err{border-left-color:#ef4444;background:rgba(239,68,68,.06);color:#fca5a5}',
            '.ph-msg.ph-info{border-left-color:#3b82f6;background:rgba(59,130,246,.05);color:#93c5fd}',

            /* Submit */
            '.ph-sub{font-family:inherit;font-size:9.5px;letter-spacing:.18em;font-weight:700;',
            'padding:10px 22px;background:#ef4444;color:#fff;border:none;cursor:pointer;',
            'transition:background .15s,opacity .15s;align-self:flex-start}',
            '.ph-sub:hover:not(:disabled){background:#dc2626}',
            '.ph-sub:disabled{opacity:.45;cursor:not-allowed}',

            /* Footer note */
            '.ph-foot-note{font-size:8px;letter-spacing:.1em;color:#52525b;text-align:center;',
            'padding:0 20px 16px}',
            '.ph-foot-note a{color:#52525b;text-decoration:none}',
            '.ph-foot-note a:hover{color:#71717a}',

            /* Success */
            '.ph-ok{display:flex;flex-direction:column;align-items:center;',
            'justify-content:center;gap:10px;padding:48px 20px;text-align:center}',
            '.ph-ok-icon{width:44px;height:44px;border-radius:50%;border:1px solid #166534;',
            'background:rgba(34,197,94,.1);color:#4ade80;font-size:20px;display:flex;',
            'align-items:center;justify-content:center}',
            '.ph-ok-title{font-size:1rem;letter-spacing:.12em;color:#f4f4f5;margin:0}',
            '.ph-ok-sub{font-size:9.5px;color:#52525b;line-height:1.7;max-width:300px}',
        ].join('');
        document.head.appendChild(s);
    }

    /* ── Build & mount modal ── */
    function buildModal() {
        if (document.getElementById('ph-overlay')) return;
        injectCSS();

        var selCat    = 'bug';
        var selAuthor = 'public';

        var overlay = document.createElement('div');
        overlay.id  = 'ph-overlay';

        var cats = [
            { id:'bug',     icon:'🐛', label:'Báo lỗi'  },
            { id:'suggest', icon:'💡', label:'Góp ý'    },
            { id:'content', icon:'📄', label:'Nội dung' },
            { id:'other',   icon:'📨', label:'Khác'     }
        ];
        var authors = [
            { id:'public', label: isLoggedIn ? ('👤 ' + userName) : '👤 Khách' },
            { id:'alias',  label: '🎭 Bí danh' },
            { id:'anon',   label: '🔒 Ẩn danh' }
        ];

        /* ── Tạo DOM từng phần ── */
        /* Category buttons */
        var catRow = document.createElement('div');
        catRow.className = 'ph-cat-row';
        cats.forEach(function (c) {
            var b = document.createElement('button');
            b.className = 'ph-cat-btn' + (c.id === selCat ? ' ph-active' : '');
            b.setAttribute('data-id', c.id);
            b.textContent = c.icon + ' ' + c.label;
            b.addEventListener('click', function () {
                selCat = c.id;
                catRow.querySelectorAll('.ph-cat-btn').forEach(function (x) {
                    x.classList.toggle('ph-active', x.getAttribute('data-id') === selCat);
                });
            });
            catRow.appendChild(b);
        });

        /* Author buttons + alias input */
        var auRow = document.createElement('div');
        auRow.className = 'ph-au-row';
        var aliasInp = document.createElement('input');
        aliasInp.type = 'text'; aliasInp.className = 'ph-alias ph-inp';
        aliasInp.placeholder = 'Nhập bí danh…'; aliasInp.maxLength = 50;

        authors.forEach(function (a) {
            var b = document.createElement('button');
            b.className = 'ph-au-btn' + (a.id === selAuthor ? ' ph-active' : '');
            b.setAttribute('data-id', a.id);
            b.textContent = a.label;
            b.addEventListener('click', function () {
                selAuthor = a.id;
                auRow.querySelectorAll('.ph-au-btn').forEach(function (x) {
                    x.classList.toggle('ph-active', x.getAttribute('data-id') === selAuthor);
                });
                aliasInp.style.display = (selAuthor === 'alias') ? 'block' : 'none';
                if (selAuthor === 'alias') aliasInp.focus();
            });
            auRow.appendChild(b);
        });

        /* Inputs */
        var titleInp = document.createElement('input');
        titleInp.type = 'text'; titleInp.className = 'ph-inp';
        titleInp.placeholder = 'Tóm tắt ngắn gọn vấn đề…'; titleInp.maxLength = 120;

        var pageInp = document.createElement('input');
        pageInp.type = 'text'; pageInp.className = 'ph-inp';
        pageInp.placeholder = 'Tên trang liên quan (tuỳ chọn)'; pageInp.maxLength = 200;

        var bodyTa = document.createElement('textarea');
        bodyTa.className = 'ph-ta';
        bodyTa.placeholder = 'Mô tả chi tiết: chuyện gì xảy ra, bước tái hiện, trình duyệt…';
        bodyTa.rows = 5; bodyTa.maxLength = 2000;

        var cc = document.createElement('div');
        cc.className = 'ph-cc'; cc.textContent = '0 / 2000';
        bodyTa.addEventListener('input', function () { cc.textContent = bodyTa.value.length + ' / 2000'; });

        /* Status + submit */
        var msgEl  = document.createElement('div');
        msgEl.className = 'ph-msg';

        var subBtn = document.createElement('button');
        subBtn.className = 'ph-sub'; subBtn.textContent = 'GỬI PHẢN HỒI →';

        /* ── Helper: build field row ── */
        function fld(lbl, el, hint) {
            var w = document.createElement('div'); w.className = 'ph-field';
            var l = document.createElement('label'); l.className = 'ph-lbl'; l.textContent = lbl;
            w.appendChild(l); w.appendChild(el);
            if (hint) { var h = document.createElement('div'); h.className = 'ph-hint'; h.textContent = hint; w.appendChild(h); }
            return w;
        }

        /* ── Assemble card ── */
        var catFld = document.createElement('div'); catFld.className = 'ph-field';
        catFld.innerHTML = '<label class="ph-lbl">Loại phản hồi</label>';
        catFld.appendChild(catRow);

        var auFld = document.createElement('div'); auFld.className = 'ph-field';
        auFld.innerHTML = '<label class="ph-lbl">Tác giả</label>';
        auFld.appendChild(auRow);
        auFld.appendChild(aliasInp);

        var bodyFld = document.createElement('div'); bodyFld.className = 'ph-field';
        bodyFld.innerHTML = '<label class="ph-lbl">Nội dung *</label>';
        bodyFld.appendChild(bodyTa);
        bodyFld.appendChild(cc);

        var bd = document.createElement('div'); bd.className = 'ph-bd';
        bd.appendChild(catFld);
        bd.appendChild(fld('Tiêu đề *', titleInp, 'Tối đa 120 ký tự'));
        bd.appendChild(fld('Trang liên quan', pageInp, 'Để trống nếu không liên quan trang cụ thể'));
        bd.appendChild(auFld);
        bd.appendChild(bodyFld);
        bd.appendChild(msgEl);
        bd.appendChild(subBtn);

        var footNote = document.createElement('div');
        footNote.className = 'ph-foot-note';
        footNote.innerHTML = 'Xem tất cả phản hồi tại <a href="/wiki/D%E1%BB%B1_%C3%A1n:Ph%E1%BA%A3n_h%E1%BB%93i">Dự_án:Phản_hồi</a>';

        var card = document.createElement('div');
        card.id = 'ph-card';
        card.setAttribute('role', 'dialog');
        card.setAttribute('aria-modal', 'true');
        card.setAttribute('aria-label', 'Gửi phản hồi');
        card.innerHTML =
            '<div class="ph-hd">' +
            '<div class="ph-hd-left">' +
            '<div class="ph-hd-ey">M.A.P.L.E // FEEDBACK</div>' +
            '<h2 class="ph-hd-title">GỬI PHẢN <em>HỒI</em></h2>' +
            '</div>' +
            '<button class="ph-x" id="ph-x" aria-label="Đóng">✕</button>' +
            '</div>';
        card.appendChild(bd);
        card.appendChild(footNote);
        overlay.appendChild(card);
        document.body.appendChild(overlay);

        /* ── Open / Close ── */
        function open() {
            overlay.classList.add('ph-open');
            document.body.style.overflow = 'hidden';
            setTimeout(function () { titleInp.focus(); }, 80);
        }
        function close() {
            overlay.classList.remove('ph-open');
            document.body.style.overflow = '';
        }

        document.getElementById('ph-x').addEventListener('click', close);
        overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

        /* ── Wire nav button (polling vì GlobalNav có thể chưa render) ── */
        function wireNavBtn() {
            var btn = document.getElementById('maple-nav-feedback') ||
                      document.querySelector('.maple-nav-feedback');
            if (btn) {
                btn.addEventListener('click', function (e) { e.preventDefault(); open(); });
                return;
            }
            setTimeout(wireNavBtn, 200);
        }
        wireNavBtn();

        /* ── Submit ── */
        subBtn.addEventListener('click', function () {
            var title = titleInp.value.trim();
            var body  = bodyTa.value.trim();
            if (!title) { showMsg('err', 'Vui lòng nhập tiêu đề.'); titleInp.focus(); return; }
            if (body.length < 10) { showMsg('err', 'Mô tả quá ngắn — hãy thêm chi tiết.'); bodyTa.focus(); return; }

            var authorName = selAuthor === 'public'
                ? (isLoggedIn ? userName : 'Khách')
                : selAuthor === 'alias'
                    ? (aliasInp.value.trim() || 'Bí danh')
                    : 'N/A';

            subBtn.disabled = true;
            subBtn.textContent = 'ĐANG GỬI…';
            showMsg('info', 'Đang xử lý…');

            var now = new Date();
            var id  = 'PH-' + now.getFullYear() +
                      pad(now.getMonth()+1) + pad(now.getDate()) + '-' +
                      String(now.getTime()).slice(-5);
            var ts  = now.toISOString();

            var entry = {
                id:         id,
                ts:         ts,
                cat:        selCat,
                title:      title,
                body:       body,
                relPage:    pageInp.value.trim() || null,
                authorMode: selAuthor,
                author:     authorName,
                userId:     (isLoggedIn && selAuthor === 'public') ? mw.config.get('wgUserId') : null,
                status:     'open'
            };

            var catLabel = { bug:'Báo lỗi', suggest:'Góp ý', content:'Nội dung', other:'Khác' };
            var pageText = [
                '<!-- MAPLE_PH_DATA:' + JSON.stringify(entry) + ' -->',
                '',
                '== Phản hồi: ' + entry.title + ' ==',
                '; ID: ' + entry.id,
                '; Loại: ' + (catLabel[entry.cat] || entry.cat),
                '; Tác giả: ' + entry.author,
                '; Ngày gửi: ' + ts.substring(0,10),
                '; Trạng thái: ' + entry.status,
                (entry.relPage ? '; Trang liên quan: [[' + entry.relPage + ']]' : ''),
                '',
                entry.body
            ].join('\n');

            var api = new mw.Api();
            api.get({ action:'query', meta:'tokens', type:'csrf', format:'json' })
                .done(function (d) {
                    var token = d.query && d.query.tokens && d.query.tokens.csrftoken;
                    if (!token || token === '+\\') {
                        showMsg('err', 'Không lấy được token — vui lòng đăng nhập.');
                        resetBtn(); return;
                    }
                    api.post({
                        action: 'edit',
                        title:  'Dự_án:Phản_hồi/' + id,
                        text:   pageText,
                        summary: '[PH] ' + (catLabel[selCat]||selCat) + ' — ' + title.substring(0,60),
                        token:  token,
                        format: 'json'
                    }).done(function () {
                        showSuccess();
                    }).fail(function () {
                        showMsg('err', 'Lưu thất bại. Thử lại sau.');
                        resetBtn();
                    });
                }).fail(function () {
                    showMsg('err', 'Lỗi kết nối. Kiểm tra mạng.');
                    resetBtn();
                });
        });

        function pad(n) { return n < 10 ? '0' + n : String(n); }
        function showMsg(type, txt) {
            msgEl.className = 'ph-msg ' + (type === 'err' ? 'ph-err' : 'ph-info');
            msgEl.textContent = txt;
            msgEl.style.display = 'block';
        }
        function resetBtn() {
            subBtn.disabled = false;
            subBtn.textContent = 'GỬI PHẢN HỒI →';
        }
        function showSuccess() {
            var DURATION = 3000; /* ms trước khi tự đóng */
            bd.innerHTML =
                '<div class="ph-ok">' +
                '<div class="ph-ok-icon">✓</div>' +
                '<h3 class="ph-ok-title">Cảm ơn bạn!</h3>' +
                '<p class="ph-ok-sub">Phản hồi đã được ghi nhận — BQT sẽ xem xét và phản hồi sớm nhất có thể.</p>' +
                '<div class="ph-ok-bar-wrap">' +
                '<div class="ph-ok-bar" id="ph-ok-bar"></div>' +
                '</div>' +
                '<p class="ph-ok-closing">Tự động đóng sau <span id="ph-ok-sec">3</span>s</p>' +
                '</div>';

            /* Inject keyframe nếu chưa có */
            if (!document.getElementById('ph-bar-kf')) {
                var kf = document.createElement('style');
                kf.id = 'ph-bar-kf';
                kf.textContent =
                    '.ph-ok-bar-wrap{width:100%;max-width:260px;height:2px;background:#1a1a1a;margin-top:16px;overflow:hidden}' +
                    '.ph-ok-bar{height:100%;background:#ef4444;width:100%;' +
                    'transition:width ' + DURATION + 'ms linear}' +
                    '.ph-ok-closing{font-size:8px;letter-spacing:.16em;color:#52525b;margin:6px 0 0}';
                document.head.appendChild(kf);
            }

            /* Trigger thanh chạy — cần 1 frame để CSS transition kích hoạt */
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    var bar = document.getElementById('ph-ok-bar');
                    if (bar) bar.style.width = '0%';
                });
            });

            /* Đếm ngược giây */
            var secEl = document.getElementById('ph-ok-sec');
            var remaining = Math.round(DURATION / 1000) - 1;
            var ticker = setInterval(function () {
                if (secEl) secEl.textContent = remaining;
                remaining--;
                if (remaining < 0) clearInterval(ticker);
            }, 1000);

            setTimeout(function () {
                clearInterval(ticker);
                close();
                setTimeout(function () {
                    /* Reset form để dùng lại */
                    titleInp.value = ''; bodyTa.value = ''; pageInp.value = '';
                    aliasInp.value = ''; cc.textContent = '0 / 2000';
                    msgEl.style.display = 'none'; msgEl.className = 'ph-msg';
                    subBtn.disabled = false; subBtn.textContent = 'GỬI PHẢN HỒI →';
                    bd.innerHTML = '';
                    bd.appendChild(catFld);
                    bd.appendChild(fld('Tiêu đề *', titleInp, 'Tối đa 120 ký tự'));
                    bd.appendChild(fld('Trang liên quan', pageInp, 'Để trống nếu không liên quan'));
                    bd.appendChild(auFld);
                    bd.appendChild(bodyFld);
                    bd.appendChild(msgEl);
                    bd.appendChild(subBtn);
                }, 300);
            }, DURATION);
        }
    }

    /* ── Init ── */
    function init() {
        if (mw.config.get('wgAction') !== 'view') return;
        buildModal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
