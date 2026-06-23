/* ============================================================
   M.A.P.L.E — MediaWiki:PhanHoi.js  v2.0
   Hệ thống phản hồi:
   - Nút nav → Popup modal toàn cục (mọi trang)
   - Mỗi submission → 1 trang Dự_án:Phản_hồi/{id}
   - Trang Dự_án:Phản_hồi → danh sách đẹp (grid card)
   - Trang Dự_án:Phản_hồi/{id} → chi tiết từng phản hồi
   ============================================================ */
(function () {
    'use strict';

    if (typeof mw === 'undefined') return;

    var isLoggedIn = !!(mw.config.get('wgUserId'));
    var userName   = mw.config.get('wgUserName') || '';
    var pageName   = mw.config.get('wgPageName') || '';
    var decoded    = decodeURIComponent(pageName).replace(/_/g, ' ');

    /* Namespace prefix "Dự án:" có thể bị encode */
    var INDEX_PAGE  = 'Dự_án:Phản_hồi';
    var DETAIL_PRE  = 'Dự_án:Phản_hồi/';
    var INDEX_DEC   = 'Dự án:Phản hồi';

    var isIndexPage  = (pageName === INDEX_PAGE || decoded === INDEX_DEC ||
                        pageName === 'D%E1%BB%B1_%C3%A1n:Ph%E1%BA%A3n_h%E1%BB%93i' ||
                        /* namespace 0 alias */
                        /^Ph%E1%BA%A3n[_\s]?[Hh]%E1%BB%93i$/i.test(pageName) ||
                        /^Phản[_\s]?[Hh]ồi$/i.test(decoded));
    var isDetailPage = (decoded.indexOf(INDEX_DEC + '/') === 0 ||
                        pageName.indexOf(INDEX_PAGE + '/') === 0);

    /* ════════════════════════════════════════
       A. POPUP MODAL — chạy toàn cục
       ════════════════════════════════════════ */

    function buildModal() {
        if (document.getElementById('ph-modal-overlay')) return;

        /* Inject CSS */
        if (!document.getElementById('ph-modal-css')) {
            var s = document.createElement('link');
            s.id   = 'ph-modal-css';
            s.rel  = 'stylesheet';
            /* CSS được load qua Common.js rồi — link này chỉ là safety net */
            document.head.appendChild(s);
        }

        var cats = [
            { id: 'bug',     icon: '🐛', label: 'Báo lỗi',   desc: 'Lỗi kỹ thuật, JS/CSS không hoạt động' },
            { id: 'suggest', icon: '💡', label: 'Góp ý',      desc: 'Đề xuất tính năng, cải tiến' },
            { id: 'content', icon: '📄', label: 'Nội dung',   desc: 'Sai thông tin, thiếu trang, bản quyền' },
            { id: 'other',   icon: '📨', label: 'Khác',       desc: 'Vấn đề khác' }
        ];
        var selCat = 'bug';

        /* ── Overlay + modal shell ── */
        var overlay = document.createElement('div');
        overlay.id = 'ph-modal-overlay';

        var modal = document.createElement('div');
        modal.id = 'ph-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Gửi phản hồi');

        /* Header */
        var mHead = document.createElement('div');
        mHead.className = 'ph-m-head';
        mHead.innerHTML =
            '<div class="ph-m-eyebrow">M.A.P.L.E // FEEDBACK</div>' +
            '<h2 class="ph-m-title">GỬI PHẢN <em>HỒI</em></h2>' +
            '<button class="ph-m-close" id="ph-m-close" aria-label="Đóng">✕</button>';

        /* Body */
        var mBody = document.createElement('div');
        mBody.className = 'ph-m-body';

        /* Category row */
        var catRow = document.createElement('div');
        catRow.className = 'ph-cat-row';
        cats.forEach(function (c) {
            var btn = document.createElement('button');
            btn.className = 'ph-cat-btn' + (c.id === selCat ? ' active' : '');
            btn.setAttribute('data-id', c.id);
            btn.title = c.desc;
            btn.innerHTML = '<span class="ph-cat-icon">' + c.icon + '</span><span>' + c.label + '</span>';
            btn.addEventListener('click', function () {
                selCat = c.id;
                catRow.querySelectorAll('.ph-cat-btn').forEach(function (b) {
                    b.classList.toggle('active', b.getAttribute('data-id') === selCat);
                });
            });
            catRow.appendChild(btn);
        });

        /* Fields */
        function mkField(lbl, el, hint) {
            var w = document.createElement('div');
            w.className = 'ph-field';
            var l = document.createElement('label');
            l.className = 'ph-label';
            l.textContent = lbl;
            w.appendChild(l);
            w.appendChild(el);
            if (hint) {
                var h = document.createElement('div');
                h.className = 'ph-hint';
                h.textContent = hint;
                w.appendChild(h);
            }
            return w;
        }

        var titleInput = document.createElement('input');
        titleInput.type = 'text'; titleInput.className = 'ph-inp';
        titleInput.placeholder = 'Tóm tắt ngắn gọn vấn đề…';
        titleInput.maxLength = 120;

        var pageInput = document.createElement('input');
        pageInput.type = 'text'; pageInput.className = 'ph-inp';
        pageInput.placeholder = 'Tên trang wiki (tuỳ chọn)';
        pageInput.maxLength = 200;

        var bodyArea = document.createElement('textarea');
        bodyArea.className = 'ph-textarea';
        bodyArea.placeholder = 'Mô tả chi tiết: chuyện gì xảy ra, bước tái hiện, trình duyệt…';
        bodyArea.rows = 5;
        bodyArea.maxLength = 2000;

        var charCount = document.createElement('div');
        charCount.className = 'ph-charcount';
        charCount.textContent = '0 / 2000';
        bodyArea.addEventListener('input', function () {
            charCount.textContent = bodyArea.value.length + ' / 2000';
        });

        /* ── Tác giả: 3 chế độ ── */
        var AUTHOR_MODES = [
            { id: 'public',  label: '👤 Công khai', desc: isLoggedIn ? 'Tên: ' + userName : 'Tên khách' },
            { id: 'alias',   label: '🎭 Bí danh',   desc: 'Nhập tên tuỳ chọn' },
            { id: 'anon',    label: '🔒 Ẩn danh',   desc: 'Hiển thị N/A' }
        ];
        var selAuthor = 'public';

        var authorRow = document.createElement('div');
        authorRow.className = 'ph-author-row';

        var aliasInput = document.createElement('input');
        aliasInput.type = 'text'; aliasInput.className = 'ph-inp ph-alias-inp';
        aliasInput.placeholder = 'Nhập bí danh của bạn…';
        aliasInput.maxLength = 50;
        aliasInput.style.display = 'none';

        AUTHOR_MODES.forEach(function (m) {
            var btn = document.createElement('button');
            btn.className = 'ph-author-btn' + (m.id === selAuthor ? ' active' : '');
            btn.setAttribute('data-id', m.id);
            btn.title = m.desc;
            btn.textContent = m.label;
            btn.addEventListener('click', function () {
                selAuthor = m.id;
                authorRow.querySelectorAll('.ph-author-btn').forEach(function (b) {
                    b.classList.toggle('active', b.getAttribute('data-id') === selAuthor);
                });
                aliasInput.style.display = (selAuthor === 'alias') ? 'block' : 'none';
                if (selAuthor === 'alias') aliasInput.focus();
            });
            authorRow.appendChild(btn);
        });

        /* Status + Submit */
        var statusBar = document.createElement('div');
        statusBar.className = 'ph-status'; statusBar.style.display = 'none';

        var submitBtn = document.createElement('button');
        submitBtn.className = 'ph-submit';
        submitBtn.textContent = 'GỬI PHẢN HỒI →';

        /* Assemble body */
        var catField = document.createElement('div');
        catField.className = 'ph-field';
        catField.innerHTML = '<label class="ph-label">Loại phản hồi</label>';
        catField.appendChild(catRow);

        var authorField = document.createElement('div');
        authorField.className = 'ph-field';
        authorField.innerHTML = '<label class="ph-label">Tác giả</label>';
        authorField.appendChild(authorRow);
        authorField.appendChild(aliasInput);

        var bodyField = document.createElement('div');
        bodyField.className = 'ph-field';
        bodyField.innerHTML = '<label class="ph-label">Nội dung *</label>';
        bodyField.appendChild(bodyArea);
        bodyField.appendChild(charCount);

        mBody.appendChild(catField);
        mBody.appendChild(mkField('Tiêu đề *', titleInput, 'Tối đa 120 ký tự'));
        mBody.appendChild(mkField('Trang liên quan', pageInput, 'Để trống nếu không liên quan trang cụ thể'));
        mBody.appendChild(authorField);
        mBody.appendChild(bodyField);
        mBody.appendChild(statusBar);
        mBody.appendChild(submitBtn);

        modal.appendChild(mHead);
        modal.appendChild(mBody);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        /* ── Open / Close ── */
        function openModal() {
            overlay.classList.add('open');
            document.body.style.overflow = 'hidden';
            setTimeout(function () { titleInput.focus(); }, 100);
        }
        function closeModal() {
            overlay.classList.remove('open');
            document.body.style.overflow = '';
        }

        document.getElementById('ph-m-close').addEventListener('click', closeModal);
        overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

        /* ── Wire nav button ── */
        var navBtn = document.getElementById('maple-nav-feedback') ||
                     document.querySelector('.maple-nav-feedback');
        if (navBtn) {
            navBtn.addEventListener('click', function (e) {
                e.preventDefault();
                openModal();
            });
        }

        /* ── Submit logic ── */
        submitBtn.addEventListener('click', function () {
            var title = titleInput.value.trim();
            var body  = bodyArea.value.trim();
            if (!title) { showStatus('error', 'Vui lòng nhập tiêu đề.'); titleInput.focus(); return; }
            if (body.length < 10) { showStatus('error', 'Mô tả quá ngắn.'); bodyArea.focus(); return; }

            /* Tính tên tác giả */
            var authorName;
            if (selAuthor === 'public') {
                authorName = isLoggedIn ? userName : 'Khách';
            } else if (selAuthor === 'alias') {
                authorName = aliasInput.value.trim() || 'Bí danh';
            } else {
                authorName = 'N/A';
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'ĐANG GỬI…';
            showStatus('info', 'Đang xử lý…');

            var now  = new Date();
            var ts   = now.toISOString();
            var id   = 'PH-' + now.getFullYear() +
                       String(now.getMonth()+1).padStart(2,'0') +
                       String(now.getDate()).padStart(2,'0') + '-' +
                       String(now.getTime()).slice(-5);
            var relPage = pageInput.value.trim() || null;

            var entry = {
                id:         id,
                ts:         ts,
                cat:        selCat,
                title:      title,
                body:       body,
                relPage:    relPage,
                authorMode: selAuthor,
                author:     authorName,
                userId:     (isLoggedIn && selAuthor === 'public') ? mw.config.get('wgUserId') : null,
                status:     'open'
            };

            /* Nội dung trang chi tiết */
            var pageText = buildDetailWikitext(entry);

            var api = new mw.Api();
            api.get({ action: 'query', meta: 'tokens', type: 'csrf', format: 'json' })
                .done(function (d) {
                    var token = d.query && d.query.tokens && d.query.tokens.csrftoken;
                    if (!token || token === '+\\') {
                        showStatus('error', 'Không lấy được token — hãy đăng nhập và thử lại.');
                        resetBtn(); return;
                    }
                    api.post({
                        action:  'edit',
                        title:   'Dự_án:Phản_hồi/' + id,
                        text:    pageText,
                        summary: '[Phản hồi] ' + selCat + ' — ' + title.substring(0, 60),
                        token:   token,
                        format:  'json'
                    }).done(function () {
                        showSuccessAndClose();
                    }).fail(function () {
                        showStatus('error', 'Lưu thất bại. Vui lòng thử lại sau.');
                        resetBtn();
                    });
                }).fail(function () {
                    showStatus('error', 'Lỗi kết nối. Kiểm tra mạng và thử lại.');
                    resetBtn();
                });
        });

        function showStatus(type, msg) {
            statusBar.className = 'ph-status ph-status--' + type;
            statusBar.textContent = msg;
            statusBar.style.display = 'block';
        }
        function resetBtn() {
            submitBtn.disabled = false;
            submitBtn.textContent = 'GỬI PHẢN HỒI →';
        }
        function showSuccessAndClose() {
            mBody.innerHTML =
                '<div class="ph-success">' +
                '<div class="ph-success-icon">✓</div>' +
                '<div class="ph-success-title">Đã gửi!</div>' +
                '<div class="ph-success-sub">Cảm ơn bạn đã góp ý — BQT sẽ xem xét sớm.</div>' +
                '</div>';
            setTimeout(function () {
                closeModal();
                /* Reset về form sau khi đóng */
                setTimeout(function () { location.reload(); }, 400);
            }, 2000);
        }
    }

    /* Wikitext cho trang chi tiết */
    function buildDetailWikitext(e) {
        var catLabel = { bug: 'Báo lỗi', suggest: 'Góp ý', content: 'Nội dung', other: 'Khác' }[e.cat] || e.cat;
        var lines = [
            '{{PhanHoi-detail',
            '|id='      + e.id,
            '|ts='      + e.ts,
            '|cat='     + catLabel,
            '|title='   + e.title,
            '|author='  + e.author,
            '|relPage=' + (e.relPage || ''),
            '|status='  + e.status,
            '|body=\n'  + e.body,
            '}}'
        ];
        /* Cũng lưu JSON thô trong comment ẩn để JS đọc */
        lines.push('');
        lines.push('<!-- MAPLE_PH_DATA:' + JSON.stringify(e) + ' -->');
        return lines.join('\n');
    }

    /* ════════════════════════════════════════
       B. TRANG INDEX: Dự_án:Phản_hồi
       ════════════════════════════════════════ */

    function buildIndexPage() {
        var host = document.getElementById('mw-content-text');
        if (!host) return;
        host.innerHTML =
            '<div id="ph-index-root">' +
            '<div class="ph-dot-bg"></div>' +
            '<div class="ph-loading">' +
            '<div class="ph-loading-spinner"></div>' +
            '<div class="ph-loading-text">// ĐANG TẢI PHẢN HỒI...</div>' +
            '</div>' +
            '</div>';

        /* Lấy danh sách subpages qua API */
        var api = new mw.Api();
        api.get({
            action: 'query',
            list: 'allpages',
            apprefix: 'Phản_hồi/',
            apnamespace: 4,
            aplimit: 500,
            format: 'json'
        }).done(function (d) {
            var pages = (d.query && d.query.allpages) || [];
            if (!pages.length) {
                renderIndex([]); return;
            }
            /* Lấy nội dung tất cả trang — theo batch 50 */
            var titles = pages.map(function (p) { return p.title; });
            fetchBatch(titles, 0, [], function (entries) {
                renderIndex(entries);
            });
        }).fail(function () {
            document.getElementById('ph-index-root').innerHTML =
                '<p class="ph-err">// LỖI: Không thể tải danh sách phản hồi.</p>';
        });

        function fetchBatch(titles, offset, acc, cb) {
            var batch = titles.slice(offset, offset + 50);
            if (!batch.length) { cb(acc); return; }
            api.get({
                action: 'query',
                titles: batch.join('|'),
                prop: 'revisions',
                rvprop: 'content',
                rvslots: 'main',
                format: 'json',
                formatversion: '2'
            }).done(function (d) {
                var pages = (d.query && d.query.pages) || [];
                pages.forEach(function (pg) {
                    if (pg.missing) return;
                    var content = pg.revisions && pg.revisions[0] && pg.revisions[0].slots.main.content;
                    if (!content) return;
                    var m = content.match(/<!--\s*MAPLE_PH_DATA:(.*?)\s*-->/);
                    if (!m) return;
                    try { acc.push(JSON.parse(m[1])); } catch(e) {}
                });
                fetchBatch(titles, offset + 50, acc, cb);
            }).fail(function () {
                fetchBatch(titles, offset + 50, acc, cb);
            });
        }
    }

    function renderIndex(entries) {
        /* Sắp xếp mới nhất trước */
        entries.sort(function (a, b) { return b.ts > a.ts ? 1 : -1; });

        var catIcons = { bug: '🐛', suggest: '💡', content: '📄', other: '📨' };
        var catLabels = { bug: 'Báo lỗi', suggest: 'Góp ý', content: 'Nội dung', other: 'Khác' };
        var statusCls = { open: 'ph-st-open', resolved: 'ph-st-resolved', wip: 'ph-st-wip' };
        var statusLabel = { open: 'Mở', resolved: 'Đã xử lý', wip: 'Đang xử lý' };

        var isAdmin = (mw.config.get('wgUserGroups') || []).some(function (g) {
            return ['sysop','bureaucrat','interface-admin'].indexOf(g) !== -1;
        });

        /* Bộ lọc */
        var filterCat = 'all', filterStatus = 'all', filterQ = '';

        function esc(s) {
            return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
                return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
            });
        }

        function dateStr(ts) {
            if (!ts) return '';
            var d = new Date(ts);
            return d.getFullYear() + '-' +
                   String(d.getMonth()+1).padStart(2,'0') + '-' +
                   String(d.getDate()).padStart(2,'0');
        }

        function buildCard(e, delay) {
            var icon = catIcons[e.cat] || '📨';
            var clabel = catLabels[e.cat] || e.cat;
            var scls   = statusCls[e.status] || 'ph-st-open';
            var slabel = statusLabel[e.status] || e.status;
            var detailUrl = '/wiki/D%E1%BB%B1_%C3%A1n:Ph%E1%BA%A3n_h%E1%BB%93i/' + encodeURIComponent(e.id);
            return '<a class="ph-card" href="' + detailUrl + '" style="animation-delay:' + (delay * 0.04) + 's">' +
                '<div class="ph-card-top">' +
                '<span class="ph-card-cat">' + icon + ' ' + esc(clabel) + '</span>' +
                '<span class="ph-card-status ' + scls + '">' + esc(slabel) + '</span>' +
                '</div>' +
                '<div class="ph-card-id">' + esc(e.id) + '</div>' +
                '<div class="ph-card-title">' + esc(e.title) + '</div>' +
                (e.relPage ? '<div class="ph-card-page">↳ ' + esc(e.relPage) + '</div>' : '') +
                '<div class="ph-card-footer">' +
                '<span class="ph-card-author">◈ ' + esc(e.author) + '</span>' +
                '<span class="ph-card-date">' + dateStr(e.ts) + '</span>' +
                '</div>' +
                '</a>';
        }

        function render() {
            var grid = document.getElementById('ph-grid');
            if (!grid) return;
            grid.classList.add('ph-fading');
            setTimeout(function () {
                var q = filterQ.toLowerCase();
                var result = entries.filter(function (e) {
                    if (filterCat !== 'all' && e.cat !== filterCat) return false;
                    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
                    if (q && e.title.toLowerCase().indexOf(q) === -1 &&
                        e.author.toLowerCase().indexOf(q) === -1) return false;
                    return true;
                });
                var countEl = document.getElementById('ph-count');
                if (countEl) countEl.textContent = result.length + ' / ' + entries.length + ' PHẢN HỒI';
                grid.innerHTML = result.length
                    ? result.map(function (e, i) { return buildCard(e, i); }).join('')
                    : '<div class="ph-empty">// KHÔNG CÓ PHẢN HỒI PHÙ HỢP</div>';
                grid.classList.remove('ph-fading');
            }, 150);
        }

        var root = document.getElementById('ph-index-root');
        root.innerHTML =
            '<div class="ph-dot-bg"></div>' +

            /* HERO */
            '<div class="ph-hero">' +
            '<div class="ph-hero-eyebrow">M.A.P.L.E // COMMUNITY FEEDBACK</div>' +
            '<h1 class="ph-hero-title">PHẢN <em>HỒI</em></h1>' +
            '<p class="ph-hero-sub">Danh sách phản hồi, báo lỗi và góp ý từ cộng đồng. ' +
            'Mọi thành viên đều có thể xem — nhấn vào thẻ để đọc chi tiết.</p>' +
            (isAdmin ? '<a class="ph-admin-badge" href="/wiki/Special:WhatLinksHere/D%E1%BB%B1_%C3%A1n:Ph%E1%BA%A3n_h%E1%BB%93i">⚙ Quản lý</a>' : '') +
            '</div>' +

            /* FILTER BAR */
            '<div class="ph-filter-bar">' +
            '<div class="ph-filter-search-wrap">' +
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
            '<input type="text" id="ph-f-q" class="ph-filter-search" placeholder="Tìm theo tiêu đề hoặc tác giả…">' +
            '</div>' +
            '<div class="ph-filter-chips" id="ph-filter-cat">' +
            '<button class="ph-filter-chip active" data-val="all">Tất cả</button>' +
            '<button class="ph-filter-chip" data-val="bug">🐛 Lỗi</button>' +
            '<button class="ph-filter-chip" data-val="suggest">💡 Góp ý</button>' +
            '<button class="ph-filter-chip" data-val="content">📄 Nội dung</button>' +
            '<button class="ph-filter-chip" data-val="other">📨 Khác</button>' +
            '</div>' +
            '<div class="ph-filter-chips" id="ph-filter-status">' +
            '<button class="ph-filter-chip active" data-val="all">Tất cả trạng thái</button>' +
            '<button class="ph-filter-chip" data-val="open">Mở</button>' +
            '<button class="ph-filter-chip" data-val="wip">Đang xử lý</button>' +
            '<button class="ph-filter-chip" data-val="resolved">Đã xử lý</button>' +
            '</div>' +
            '<div id="ph-count" class="ph-count">' + entries.length + ' / ' + entries.length + ' PHẢN HỒI</div>' +
            '</div>' +

            /* GRID */
            '<div class="ph-grid" id="ph-grid"></div>';

        /* Wire filters */
        var fQ = document.getElementById('ph-f-q');
        if (fQ) fQ.addEventListener('input', function () { filterQ = fQ.value; render(); });

        document.getElementById('ph-filter-cat').querySelectorAll('.ph-filter-chip').forEach(function (btn) {
            btn.addEventListener('click', function () {
                filterCat = btn.getAttribute('data-val');
                document.getElementById('ph-filter-cat').querySelectorAll('.ph-filter-chip').forEach(function (b) {
                    b.classList.toggle('active', b === btn);
                });
                render();
            });
        });
        document.getElementById('ph-filter-status').querySelectorAll('.ph-filter-chip').forEach(function (btn) {
            btn.addEventListener('click', function () {
                filterStatus = btn.getAttribute('data-val');
                document.getElementById('ph-filter-status').querySelectorAll('.ph-filter-chip').forEach(function (b) {
                    b.classList.toggle('active', b === btn);
                });
                render();
            });
        });

        render();
    }

    /* ════════════════════════════════════════
       C. TRANG CHI TIẾT: Dự_án:Phản_hồi/{id}
       ════════════════════════════════════════ */

    function buildDetailPage() {
        var host = document.getElementById('mw-content-text');
        if (!host) return;

        /* Đọc JSON từ nội dung trang hiện tại */
        var rawContent = '';
        var revSlot = document.querySelector('.mw-parser-output');
        /* Thử lấy qua API */
        var api = new mw.Api();
        api.get({
            action: 'query',
            titles: pageName,
            prop: 'revisions',
            rvprop: 'content',
            rvslots: 'main',
            format: 'json',
            formatversion: '2'
        }).done(function (d) {
            var pgs = d.query && d.query.pages;
            var pg  = pgs && pgs[0];
            if (!pg || pg.missing) { renderDetail(null); return; }
            var content = pg.revisions && pg.revisions[0] && pg.revisions[0].slots.main.content;
            var m = content && content.match(/<!--\s*MAPLE_PH_DATA:(.*?)\s*-->/);
            if (!m) { renderDetail(null); return; }
            try { renderDetail(JSON.parse(m[1])); } catch(e) { renderDetail(null); }
        }).fail(function () { renderDetail(null); });
    }

    function renderDetail(e) {
        var host = document.getElementById('mw-content-text');
        if (!host) return;

        var isAdmin = (mw.config.get('wgUserGroups') || []).some(function (g) {
            return ['sysop','bureaucrat','interface-admin'].indexOf(g) !== -1;
        });

        function esc(s) {
            return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
                return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
            });
        }

        if (!e) {
            host.innerHTML = '<div class="ph-detail-wrap ph-detail-err"><p>// Không tìm thấy dữ liệu phản hồi.</p>' +
                '<a href="/wiki/D%E1%BB%B1_%C3%A1n:Ph%E1%BA%A3n_h%E1%BB%93i" class="ph-back-link">← Danh sách</a></div>';
            return;
        }

        var catLabel = { bug: '🐛 Báo lỗi', suggest: '💡 Góp ý', content: '📄 Nội dung', other: '📨 Khác' }[e.cat] || e.cat;
        var statusCls = { open: 'ph-st-open', resolved: 'ph-st-resolved', wip: 'ph-st-wip' };
        var statusLabel = { open: 'Đang mở', resolved: 'Đã xử lý', wip: 'Đang xử lý' };
        var d = new Date(e.ts);
        var dateStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0') +
                      ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');

        host.innerHTML =
            '<div class="ph-detail-wrap">' +
            '<a href="/wiki/D%E1%BB%B1_%C3%A1n:Ph%E1%BA%A3n_h%E1%BB%93i" class="ph-back-link">← Danh sách phản hồi</a>' +

            '<div class="ph-detail-head">' +
            '<div class="ph-detail-id">' + esc(e.id) + '</div>' +
            '<h1 class="ph-detail-title">' + esc(e.title) + '</h1>' +
            '<div class="ph-detail-meta">' +
            '<span class="ph-card-cat">' + catLabel + '</span>' +
            '<span class="ph-card-status ' + (statusCls[e.status] || 'ph-st-open') + '">' + (statusLabel[e.status] || e.status) + '</span>' +
            '</div>' +
            '</div>' +

            '<div class="ph-detail-info">' +
            '<div class="ph-info-row"><span class="ph-info-lbl">Tác giả</span><span class="ph-info-val">◈ ' + esc(e.author) + '</span></div>' +
            '<div class="ph-info-row"><span class="ph-info-lbl">Thời gian</span><span class="ph-info-val">' + esc(dateStr) + '</span></div>' +
            (e.relPage ? '<div class="ph-info-row"><span class="ph-info-lbl">Trang liên quan</span>' +
                '<span class="ph-info-val"><a href="/wiki/' + encodeURIComponent(e.relPage) + '">' + esc(e.relPage) + '</a></span></div>' : '') +
            '</div>' +

            '<div class="ph-detail-body">' +
            '<div class="ph-detail-body-label">// NỘI DUNG</div>' +
            '<div class="ph-detail-body-text">' + esc(e.body).replace(/\n/g, '<br>') + '</div>' +
            '</div>' +

            /* Admin panel */
            (isAdmin ?
                '<div class="ph-admin-panel">' +
                '<div class="ph-admin-panel-label">⚙ ADMIN — Cập nhật trạng thái</div>' +
                '<div class="ph-admin-actions">' +
                '<button class="ph-admin-btn" data-status="wip">Đang xử lý</button>' +
                '<button class="ph-admin-btn ph-admin-btn--green" data-status="resolved">Đã xử lý ✓</button>' +
                '<button class="ph-admin-btn ph-admin-btn--red" data-status="open">Mở lại</button>' +
                '</div>' +
                '<div id="ph-admin-msg" class="ph-admin-msg"></div>' +
                '</div>'
                : '') +

            '</div>';

        /* Admin status update */
        if (isAdmin) {
            host.querySelectorAll('.ph-admin-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var newStatus = btn.getAttribute('data-status');
                    var msg = document.getElementById('ph-admin-msg');
                    msg.textContent = 'Đang lưu…';
                    var api = new mw.Api();
                    api.get({ action: 'query', meta: 'tokens', type: 'csrf', format: 'json' })
                        .done(function (d) {
                            var token = d.query && d.query.tokens && d.query.tokens.csrftoken;
                            e.status = newStatus;
                            api.post({
                                action: 'edit',
                                title: pageName,
                                text: buildDetailWikitext(e),
                                summary: 'Cập nhật trạng thái: ' + newStatus,
                                token: token,
                                format: 'json'
                            }).done(function () {
                                msg.textContent = '✓ Đã lưu — ' + newStatus;
                                location.reload();
                            }).fail(function () {
                                msg.textContent = '✕ Lưu thất bại.';
                            });
                        });
                });
            });
        }
    }

    function buildDetailWikitext(e) {
        var catLabel = { bug: 'Báo lỗi', suggest: 'Góp ý', content: 'Nội dung', other: 'Khác' }[e.cat] || e.cat;
        return [
            '{{PhanHoi-detail',
            '|id=' + e.id,
            '|ts=' + e.ts,
            '|cat=' + catLabel,
            '|title=' + e.title,
            '|author=' + e.author,
            '|relPage=' + (e.relPage || ''),
            '|status=' + e.status,
            '|body=\n' + e.body,
            '}}',
            '',
            '<!-- MAPLE_PH_DATA:' + JSON.stringify(e) + ' -->'
        ].join('\n');
    }

    /* ════════════════════════════════════════
       INIT
       ════════════════════════════════════════ */
    function init() {
        if (isIndexPage)  buildIndexPage();
        if (isDetailPage) buildDetailPage();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
