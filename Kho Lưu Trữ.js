/* ============================================
   M.A.P.L.E — MediaWiki:Kho_Lưu_Trữ.js
   ============================================ */

(function () {
    function init() {

    if (mw.config.get('wgPageName') !== 'Kho_Lưu_Trữ' &&
        mw.config.get('wgPageName') !== 'Kho_L%C6%B0u_Tr%E1%BB%AF') return;

    var target = document.getElementById('klt-root-placeholder');
if (!target) return;

    /* Ẩn chrome Vector */
    

    /* ══════════════════════════════════════════
       FETCH DỮ LIỆU QUA MEDIAWIKI API
       ══════════════════════════════════════════ */
    target.innerHTML =
    '<div id="klt-root"><div class="klt-dot-bg"></div>' +
    '<div class="klt-loading">' +
    '<div class="klt-loading-spinner"></div>' +
    '<div class="klt-loading-text">// ĐANG TẢI DỮ LIỆU...</div>' +
    '<div class="klt-loading-sub">CONNECTING TO M.A.P.L.E DATABASE</div>' +
    '</div></div>';

    $.getJSON(mw.config.get('wgScriptPath') + '/api.php', {
        action:  'query',
        titles:  'MediaWiki:Kho Luu Tru-data.json',
        prop:    'revisions',
        rvprop:  'content',
        rvslots: 'main',
        format:  'json',
        origin:  '*'
    })
    .done(function (apiData) {
  console.log('API response:', JSON.stringify(apiData));
        try {
            var pages   = apiData.query.pages;
            var pageId  = Object.keys(pages)[0];
            var raw     = pages[pageId].revisions[0].slots.main['*'];
            var data = JSON.parse(raw);
setTimeout(function () {
    initApp(data.entries || [], data.categories || []);
}, 1500);
        } catch (e) {
            target.innerHTML = '<p style="color:#ef4444;padding:2rem;font-family:\'JetBrains Mono\',monospace">// LỖI: PARSE JSON THẤT BẠI — ' + e.message + '</p>';
        }
    })
    .fail(function (xhr, status, err) {
        target.innerHTML = '<p style="color:#ef4444;padding:2rem;font-family:\'JetBrains Mono\',monospace">// LỖI KẾT NỐI: ' + status + ' — ' + err + '</p>';
    });

    /* ══════════════════════════════════════════
       TOÀN BỘ LOGIC ỨNG DỤNG
       ══════════════════════════════════════════ */
    function initApp(ENTRIES, CATS) {

        var ACCESS_LABEL = { open: 'MỞ', restricted: 'HẠN CHẾ', classified: 'TỐI MẬT' };
        var ALL_ACCESS   = ['open', 'restricted', 'classified'];

        /* Tính dữ liệu phụ trợ */
        var ALL_TAGS = (function () {
            var seen = {}, out = [];
            ENTRIES.forEach(function (e) {
                e.tags.forEach(function (t) { if (!seen[t]) { seen[t] = true; out.push(t); } });
            });
            return out.sort(function (a, b) { return a.localeCompare(b, 'vi'); });
        })();

        var ALL_TITLES  = ENTRIES.map(function (e) { return e.title; });
        var ALL_AUTHORS = (function () {
            var seen = {}, out = [];
            ENTRIES.forEach(function (e) { if (!seen[e.author]) { seen[e.author] = true; out.push(e.author); } });
            return out;
        })();

        var F           = { title: '', author: '', tags: [], access: '', age: '', category: 'all', sort: '' };
F.category = 'all';  // đã có sẵn rồi, giữ nguyên

        var pendingTags = [];

        /* ── Helpers ── */
        function esc(str) {
            return String(str).replace(/[&<>"']/g, function (c) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
            });
        }

        function highlight(text, query) {
            if (!query) return esc(text);
            var re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
            return esc(text).replace(re, '<mark>$1</mark>');
        }

        function accessBadge(a) {
            var cls = { open: 'klt-open', restricted: 'klt-restricted', classified: 'klt-classified' }[a] || '';
            return '<span class="klt-badge ' + cls + '">' + (ACCESS_LABEL[a] || esc(a)) + '</span>';
        }

        function ageBadge(a) {
            var cls = { '13+': 'klt-age-13', '16+': 'klt-age-16', '18+': 'klt-age-18' }[a] || '';
            return '<span class="klt-badge ' + cls + '">' + esc(a) + '</span>';
        }

        function buildCard(e, delay) {
            var tags = e.tags.map(function (t) { return '<span class="klt-tag">' + esc(t) + '</span>'; }).join('');
            return '<a class="klt-card" href="/wiki/Kho_L%C6%B0u_Tr%E1%BB%AF/' + esc(e.id) + '" style="animation-delay:' + (delay || 0) + 's">' +
                '<div class="klt-card-id">' + esc(e.id) + '</div>' +
                '<div class="klt-card-title">' + esc(e.title) + '</div>' +
                '<div class="klt-card-badges">' + accessBadge(e.access) + ageBadge(e.age) + '</div>' +
                '<div class="klt-card-tags">' + tags + '</div>' +
                '<div class="klt-card-author"><span class="klt-author-icon">◈</span><span>' + esc(e.author) + '</span></div>' +
                '</a>';
        }

        function render() {
    var grid = document.getElementById('klt-grid');
    var badge = document.getElementById('klt-searching-badge');
    if (!grid) return;

    // Fade out
    grid.classList.add('fading');

    setTimeout(function () {
        var result = ENTRIES.filter(function (e) {
            if (F.category !== 'all' && e.category !== F.category) return false;
            if (F.title  && e.title.toLowerCase().indexOf(F.title.toLowerCase())   === -1) return false;
            if (F.author && e.author.toLowerCase().indexOf(F.author.toLowerCase()) === -1) return false;
            if (F.access && e.access !== F.access) return false;
            if (F.age    && e.age    !== F.age)    return false;
            if (F.tags.length && !F.tags.every(function (t) { return e.tags.indexOf(t) !== -1; })) return false;
            return true;
        });

        /* Sắp xếp kết quả theo tên */
        if (F.sort === 'az') result.sort(function (a, b) { return String(a.title).localeCompare(String(b.title), 'vi'); });
        else if (F.sort === 'za') result.sort(function (a, b) { return String(b.title).localeCompare(String(a.title), 'vi'); });

        /* Bộ đếm kết quả */
        var countEl = document.getElementById('klt-count');
        if (countEl) countEl.textContent = result.length + ' / ' + ENTRIES.length + ' HỒ SƠ';

        grid.innerHTML = result.length
            ? result.map(function (e, i) { return buildCard(e, i * 0.04); }).join('')
            : '<div class="klt-empty">// KHÔNG TÌM THẤY HỒ SƠ PHÙ HỢP</div>';

        // Fade in
        grid.classList.remove('fading');
        if (badge) badge.classList.remove('visible');
    }, 180);
}

        /* ── Build HTML ── */
 

        var accessOpts = '<div class="klt-opt-row klt-opt-selected" data-val=""><span class="klt-opt-dot"></span>Tất cả</div>' +
            ALL_ACCESS.map(function (a) {
                return '<div class="klt-opt-row" data-val="' + esc(a) + '"><span class="klt-opt-dot"></span>' + ACCESS_LABEL[a] + '</div>';
            }).join('');

        var modalPills = ALL_TAGS.map(function (t) {
            return '<button class="klt-mp-pill" data-tag="' + esc(t) + '">' + esc(t) + '</button>';
        }).join('');

        target.innerHTML =
            '<div id="klt-root">' +
            '<div class="klt-dot-bg"></div>' +

            /* HERO */
            '<div class="klt-hero">' +
                '<div class="klt-hero-corner klt-corner-tl"></div>' +
                '<div class="klt-hero-corner klt-corner-tr"></div>' +
                '<div class="klt-eyebrow">M.A.P.L.E CENTRAL DATABASE &nbsp;// ACCESS: AUTHORIZED</div>' +
                '<h1 class="klt-hero-title">KHO <span>LƯU TRỮ</span></h1>' +
                '<p class="klt-hero-sub">Hệ thống phân loại thực thể, vật phẩm và tài liệu nội bộ của M.A.P.L.E</p>' +
            '</div>' +

            /* TABS BAR — category filter */

            /* SEARCH PANEL */
            '<div class="klt-sp">' +
                '<div class="klt-sp-eyebrow" style="display:flex;align-items:center;gap:12px">' +
'// BỘ LỌC TÌM KIẾM' +
'<span class="klt-searching-badge" id="klt-searching-badge">// ĐANG TÌM KIẾM...</span>' +
'</div>' +
                '<div class="klt-sp-grid">' +

                    /* Tên tài liệu */
                    '<div class="klt-sp-field">' +
                        '<div class="klt-sp-label">TÊN TÀI LIỆU</div>' +
                        '<div class="klt-ac-wrap">' +
                            '<div class="klt-inp-wrap">' +
                                '<input id="klt-f-title" class="klt-inp" type="text" placeholder="Nhập tên tài liệu..." autocomplete="off" />' +
                                '<button class="klt-inp-x" data-for="klt-f-title" data-filter="title">✕</button>' +
                            '</div>' +
                            '<div class="klt-ac-list" id="klt-ac-title"></div>' +
                        '</div>' +
                    '</div>' +

                    /* Tên tác giả */
                    '<div class="klt-sp-field">' +
                        '<div class="klt-sp-label">TÊN TÁC GIẢ</div>' +
                        '<div class="klt-ac-wrap">' +
                            '<div class="klt-inp-wrap">' +
                                '<input id="klt-f-author" class="klt-inp" type="text" placeholder="Nhập tên tác giả..." autocomplete="off" />' +
                                '<button class="klt-inp-x" data-for="klt-f-author" data-filter="author">✕</button>' +
                            '</div>' +
                            '<div class="klt-ac-list" id="klt-ac-author"></div>' +
                        '</div>' +
                    '</div>' +

                    /* Cấp độ truy cập */
                    '<div class="klt-sp-field">' +
                        '<div class="klt-sp-label">CẤP ĐỘ TRUY CẬP</div>' +
                        '<div class="klt-dd" id="klt-dd-access">' +
                            '<button class="klt-dd-btn" id="klt-dd-access-btn">' +
                                '<span id="klt-dd-access-val">Tất cả</span>' +
                                '<span class="klt-dd-caret">▾</span>' +
                            '</button>' +
                            '<div class="klt-dd-panel" id="klt-dd-access-panel">' + accessOpts + '</div>' +
                        '</div>' +
                    '</div>' +

                    /* Độ tuổi */
                    '<div class="klt-sp-field">' +
                        '<div class="klt-sp-label">ĐỘ TUỔI</div>' +
                        '<div class="klt-age-row">' +
                            '<button class="klt-age-btn active" data-age="">TẤT CẢ</button>' +
                            '<button class="klt-age-btn klt-a13" data-age="13+">13+</button>' +
                            '<button class="klt-age-btn klt-a16" data-age="16+">16+</button>' +
                            '<button class="klt-age-btn klt-a18" data-age="18+">18+</button>' +
                        '</div>' +
                    '</div>' +

                    /* Tags */
                    '<div class="klt-sp-field klt-sp-field--full">' +
                        '<div class="klt-sp-label">TAGS <span id="klt-tag-count" class="klt-tag-count"></span></div>' +
                        '<button class="klt-tag-open-btn" id="klt-tag-open-btn">' +
                            '<span id="klt-tag-btn-text">Nhấn để chọn tags...</span>' +
                            '<span style="font-size:11px;opacity:0.4">▣</span>' +
                        '</button>' +
                    '</div>' +

                '</div>' +
                '<div class="klt-sp-actions">' +
                    '<div class="klt-sort-wrap">' +
                        '<span class="klt-sort-label">SẮP XẾP</span>' +
                        '<button class="klt-sort-btn active" data-sort="">Mặc định</button>' +
                        '<button class="klt-sort-btn" data-sort="az">Tên A→Z</button>' +
                        '<button class="klt-sort-btn" data-sort="za">Tên Z→A</button>' +
                    '</div>' +
                    '<span class="klt-count" id="klt-count"></span>' +
                    '<button id="klt-reset" class="klt-reset-btn">↺ ĐẶT LẠI BỘ LỌC</button>' +
                '</div>' +
            '</div>' +

            /* GRID */
            '<div class="klt-grid" id="klt-grid"></div>' +

            /* FOOTER */
            '<div class="klt-footer">' +
                '<span>M.A.P.L.E DATABASE SYSTEM // v3.3.0</span>' +
                '<a href="/wiki/Trang_Chính">← Quay về Trang Chủ</a>' +
            '</div>' +

            /* TAG MODAL */
            '<div class="klt-modal-overlay" id="klt-tag-modal">' +
                '<div class="klt-modal">' +
                    '<div class="klt-modal-hd">' +
                        '<div>' +
                            '<div class="klt-modal-eyebrow">// CHỌN TAGS</div>' +
                            '<div class="klt-modal-title">TAG PICKER</div>' +
                            '<div class="klt-modal-sel-count" id="klt-modal-count">Chưa chọn tag nào</div>' +
                        '</div>' +
                        '<button class="klt-modal-x" id="klt-modal-close">✕</button>' +
                    '</div>' +
                    '<div class="klt-modal-body" id="klt-modal-pills">' + modalPills + '</div>' +
                    '<div class="klt-modal-ft">' +
                        '<button class="klt-modal-clear" id="klt-modal-clear">↺ BỎ CHỌN TẤT CẢ</button>' +
                        '<button class="klt-modal-confirm" id="klt-modal-confirm">✓ XÁC NHẬN</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +

            '</div>'; /* end klt-root */

        /* ── Events ── */
        var debTimer;
function db(fn) {
    var badge = document.getElementById('klt-searching-badge');
    if (badge) badge.classList.add('visible');
    clearTimeout(debTimer);
    debTimer = setTimeout(fn, 220);
}

        /* Đóng dropdowns khi click ra ngoài */
        document.addEventListener('click', function () {
            document.getElementById('klt-dd-access').classList.remove('open');
            closeAllAC();
        });

        /* Autocomplete */
        function closeAllAC() {
            ['klt-ac-title', 'klt-ac-author'].forEach(function (id) {
                var el = document.getElementById(id);
                if (el) { el.classList.remove('visible'); el.innerHTML = ''; }
            });
        }

        function setupAC(inputId, listId, dataSource, filterKey) {
            var inp     = document.getElementById(inputId);
            var list    = document.getElementById(listId);
            var focused = -1;

            function closeAC() { list.classList.remove('visible'); list.innerHTML = ''; focused = -1; }

            inp.addEventListener('input', function () {
                var q = this.value.trim();
                F[filterKey] = this.value;
                db(render);
                if (!q) { closeAC(); return; }
                var matches = dataSource.filter(function (v) {
                    return v.toLowerCase().indexOf(q.toLowerCase()) !== -1;
                }).slice(0, 8);
                if (!matches.length) { closeAC(); return; }
                focused = -1;
                list.innerHTML = matches.map(function (v) {
                    return '<div class="klt-ac-item" data-val="' + esc(v) + '">' + highlight(v, q) + '</div>';
                }).join('');
                list.classList.add('visible');
            });

            inp.addEventListener('keydown', function (e) {
                var items = list.querySelectorAll('.klt-ac-item');
                if (e.key === 'ArrowDown' && list.classList.contains('visible')) {
                    e.preventDefault();
                    focused = Math.min(focused + 1, items.length - 1);
                    items.forEach(function (el, i) { el.classList.toggle('focused', i === focused); });
                } else if (e.key === 'ArrowUp' && list.classList.contains('visible')) {
                    e.preventDefault();
                    focused = Math.max(focused - 1, 0);
                    items.forEach(function (el, i) { el.classList.toggle('focused', i === focused); });
                } else if (e.key === 'Enter') {
                    if (focused >= 0 && items[focused]) {
                        inp.value = items[focused].getAttribute('data-val');
                        F[filterKey] = inp.value;
                    }
                    closeAC(); render();
                } else if (e.key === 'Escape') { closeAC(); }
            });

            list.addEventListener('click', function (e) {
                var item = e.target.closest('.klt-ac-item');
                if (!item) return;
                e.stopPropagation();
                inp.value = item.getAttribute('data-val');
                F[filterKey] = inp.value;
                closeAC(); render();
            });

            inp.addEventListener('click', function (e) {
                e.stopPropagation();
                if (this.value.trim() && !list.classList.contains('visible')) {
                    $(this).trigger('input');
                }
            });
        }

        setupAC('klt-f-title',  'klt-ac-title',  ALL_TITLES,  'title');
        setupAC('klt-f-author', 'klt-ac-author', ALL_AUTHORS, 'author');

        /* Clear X */
        document.querySelectorAll('.klt-inp-x').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var inp = document.getElementById(btn.getAttribute('data-for'));
                inp.value = '';
                F[btn.getAttribute('data-filter')] = '';
                var list = document.getElementById(btn.getAttribute('data-for').replace('klt-f-', 'klt-ac-'));
                if (list) list.classList.remove('visible');
                render();
            });
        });

        /* Dropdown Access */
        var ddAccess = document.getElementById('klt-dd-access');
        document.getElementById('klt-dd-access-btn').addEventListener('click', function (e) {
            e.stopPropagation(); closeAllAC();
            ddAccess.classList.toggle('open');
        });
        document.getElementById('klt-dd-access-panel').addEventListener('click', function (e) { e.stopPropagation(); });
        document.querySelectorAll('#klt-dd-access-panel .klt-opt-row').forEach(function (row) {
            row.addEventListener('click', function () {
                document.querySelectorAll('#klt-dd-access-panel .klt-opt-row').forEach(function (r) { r.classList.remove('klt-opt-selected'); });
                row.classList.add('klt-opt-selected');
                F.access = row.getAttribute('data-val');
                document.getElementById('klt-dd-access-val').textContent = F.access ? ACCESS_LABEL[F.access] : 'Tất cả';
                ddAccess.classList.remove('open');
                render();
            });
        });

        /* Age buttons */
        document.querySelectorAll('.klt-age-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.klt-age-btn').forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                F.age = btn.getAttribute('data-age');
                render();
            });
        });

        /* Sort buttons */
        document.querySelectorAll('.klt-sort-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.klt-sort-btn').forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                F.sort = btn.getAttribute('data-sort');
                render();
            });
        });

        /* Category tabs */


        /* Tag Modal */
        var modalOverlay = document.getElementById('klt-tag-modal');
        var modalCount   = document.getElementById('klt-modal-count');

        function updateModalCount() {
            if (pendingTags.length === 0) {
                modalCount.textContent = 'Chưa chọn tag nào';
                modalCount.classList.remove('has-sel');
            } else {
                modalCount.textContent = 'Đã chọn: ' + pendingTags.length + ' tag' + (pendingTags.length > 1 ? 's' : '');
                modalCount.classList.add('has-sel');
            }
        }

        function updateTagBtn() {
            var btn  = document.getElementById('klt-tag-open-btn');
            var text = document.getElementById('klt-tag-btn-text');
            var tc   = document.getElementById('klt-tag-count');
            if (F.tags.length === 0) {
                text.textContent = 'Nhấn để chọn tags...';
                btn.classList.remove('has-tags');
                tc.textContent = '';
            } else {
                text.innerHTML = F.tags.map(function (t) {
                    return '<span class="klt-tp-chip-applied" data-tag="' + esc(t) + '">' +
                        esc(t) +
                        '<span class="klt-tp-chip-x" title="Xoá tag này">✕</span>' +
                        '</span>';
                }).join('');
                btn.classList.add('has-tags');
                tc.textContent = '';
            }
        }

        function openModal() {
            pendingTags = F.tags.slice();
            document.querySelectorAll('.klt-mp-pill').forEach(function (p) {
                p.classList.toggle('active', pendingTags.indexOf(p.getAttribute('data-tag')) !== -1);
            });
            updateModalCount();
            modalOverlay.classList.add('visible');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            modalOverlay.classList.remove('visible');
            document.body.style.overflow = '';
        }

        document.getElementById('klt-tag-open-btn').addEventListener('click', function (e) {
            var x = e.target.closest('.klt-tp-chip-x');
            if (x) {
                e.stopPropagation();
                var chip = x.closest('.klt-tp-chip-applied');
                var tag  = chip.getAttribute('data-tag');
                var fi   = F.tags.indexOf(tag);       if (fi !== -1) F.tags.splice(fi, 1);
                var pi   = pendingTags.indexOf(tag);  if (pi !== -1) pendingTags.splice(pi, 1);
                updateTagBtn(); render();
            } else {
                openModal();
            }
        });

        modalOverlay.addEventListener('click', function (e) { if (e.target === modalOverlay) closeModal(); });
        document.getElementById('klt-modal-close').addEventListener('click', closeModal);
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

        document.querySelectorAll('.klt-mp-pill').forEach(function (pill) {
            pill.addEventListener('click', function () {
                var tag = pill.getAttribute('data-tag');
                var idx = pendingTags.indexOf(tag);
                if (idx === -1) { pendingTags.push(tag); pill.classList.add('active'); }
                else            { pendingTags.splice(idx, 1); pill.classList.remove('active'); }
                updateModalCount();
            });
        });

        document.getElementById('klt-modal-clear').addEventListener('click', function () {
            pendingTags = [];
            document.querySelectorAll('.klt-mp-pill').forEach(function (p) { p.classList.remove('active'); });
            updateModalCount();
        });

        document.getElementById('klt-modal-confirm').addEventListener('click', function () {
            F.tags = pendingTags.slice();
            updateTagBtn();
            render();
            closeModal();
        });

        /* Reset */
        document.getElementById('klt-reset').addEventListener('click', function () {
            F.title = ''; F.author = ''; F.tags = []; F.access = ''; F.age = ''; F.category = 'all'; F.sort = '';
            pendingTags = [];
            document.querySelectorAll('.klt-sort-btn').forEach(function (b) { b.classList.remove('active'); });
            var sortDefault = document.querySelector('.klt-sort-btn[data-sort=""]');
            if (sortDefault) sortDefault.classList.add('active');

            document.getElementById('klt-f-title').value  = '';
            document.getElementById('klt-f-author').value = '';
            closeAllAC();

            document.getElementById('klt-dd-access-val').textContent = 'Tất cả';
            document.querySelectorAll('#klt-dd-access-panel .klt-opt-row').forEach(function (r) { r.classList.remove('klt-opt-selected'); });
            document.querySelector('#klt-dd-access-panel .klt-opt-row[data-val=""]').classList.add('klt-opt-selected');

            document.querySelectorAll('.klt-mp-pill').forEach(function (p) { p.classList.remove('active'); });

            document.querySelectorAll('.klt-age-btn').forEach(function (b) { b.classList.remove('active'); });
            document.querySelector('.klt-age-btn[data-age=""]').classList.add('active');


            updateTagBtn();
            render();
        });

        /* Render lần đầu */
        render();

    } /* end initApp */

    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
