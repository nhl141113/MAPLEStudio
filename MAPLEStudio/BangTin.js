/* ============================================
   M.A.P.L.E — MediaWiki:BangTin.js
   Trang Bảng Tin / Thông Báo — đọc MediaWiki:BangTin-data.json
   Admin tự sửa dữ liệu trong file JSON (mọi field được escape — an toàn XSS).
   ============================================ */
(function () {
    function init() {
        var target = document.getElementById('bt-root-placeholder')
                  || document.getElementById('mw-content-text');
        if (!target) return;

        var TYPE = {
            notice:  { label: 'THÔNG BÁO', cls: 'bt-notice' },
            update:  { label: 'CẬP NHẬT',  cls: 'bt-update' },
            warning: { label: 'CẢNH BÁO',  cls: 'bt-warning' },
            event:   { label: 'SỰ KIỆN',   cls: 'bt-event' }
        };

        function esc(s) {
            return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
            });
        }
        function logo(sz) { return (window.MAPLE && window.MAPLE.logoSVG) ? window.MAPLE.logoSVG(sz) : ''; }

        function relTime(dateStr) {
            if (window.MAPLE && window.MAPLE.utils && window.MAPLE.utils.relTime) {
                return window.MAPLE.utils.relTime(dateStr);
            }
            try {
                var diff = Date.now() - new Date(dateStr).getTime();
                var days = Math.floor(diff / (1000 * 60 * 60 * 24));
                if (days <= 0) return 'Hôm nay';
                if (days === 1) return 'Hôm qua';
                return days + ' ngày trước';
            } catch(e) {
                return dateStr;
            }
        }

        function getAuthorAvatarHtml(author) {
            if (!author) return '';
            var firstChar = esc(author.charAt(0).toUpperCase());
            var userUrl = mw.util.getUrl('Thành viên:' + author);
            return '<a class="bt-author-link" href="' + userUrl + '" title="Xem trang cá nhân của ' + esc(author) + '">' +
                '<span class="bt-author-avatar">' + firstChar + '</span>' +
                '<span class="bt-author-name">' + esc(author) + '</span>' +
                '</a>';
        }

        target.innerHTML = '<div id="bt-root"><div class="bt-loading"><div class="bt-spin"></div>// ĐANG TẢI BẢNG TIN...</div></div>';

        $.getJSON(mw.config.get('wgScriptPath') + '/api.php', {
            action: 'query', titles: 'MediaWiki:BangTin-data.json',
            prop: 'revisions', rvprop: 'content', rvslots: 'main', format: 'json', origin: '*'
        }).done(function (d) {
            try {
                var pages = d.query.pages;
                var pg = pages[Object.keys(pages)[0]];
                if (pg.missing !== undefined) { render({ items: [] }); return; }
                render(JSON.parse(pg.revisions[0].slots.main['*']));
            } catch (e) {
                target.innerHTML = '<p style="color:#ef4444;padding:2rem;font-family:monospace">// LỖI PARSE: ' + esc(e.message) + '</p>';
            }
        }).fail(function (x, s) {
            target.innerHTML = '<p style="color:#ef4444;padding:2rem;font-family:monospace">// LỖI KẾT NỐI: ' + esc(s) + '</p>';
        });

        function render(data) {
            var allItems = data.items || [];
            var filterType = 'all';
            var searchQuery = '';
            var limit = 10;

            target.innerHTML =
                '<div id="bt-root">' +
                '<div class="bt-hero">' +
                    '<div class="bt-hero-logo">' + logo(64) + '</div>' +
                    '<div class="bt-eyebrow">// KÊNH THÔNG BÁO CHÍNH THỨC</div>' +
                    '<h1 class="bt-title">BẢNG <span>TIN</span></h1>' +
                    '<p class="bt-sub">Thông báo, cập nhật và tin tức từ ban quản trị M.A.P.L.E.</p>' +
                '</div>' +
                '<div class="bt-toolbar">' +
                    '<div class="bt-filter-bar">' +
                        '<button class="bt-filter-btn active" data-type="all">TẤT CẢ</button>' +
                        '<button class="bt-filter-btn" data-type="notice">THÔNG BÁO</button>' +
                        '<button class="bt-filter-btn" data-type="update">CẬP NHẬT</button>' +
                        '<button class="bt-filter-btn" data-type="warning">CẢNH BÁO</button>' +
                        '<button class="bt-filter-btn" data-type="event">SỰ KIỆN</button>' +
                    '</div>' +
                    '<div class="bt-search-wrap">' +
                        '<input type="search" class="bt-search-input" placeholder="Tìm kiếm tin tức...">' +
                    '</div>' +
                '</div>' +
                '<div class="bt-list" id="bt-list-container"></div>' +
                '<div class="bt-load-more-wrap" id="bt-load-more-container"></div>' +
                '<div class="bt-footer"><a href="' + mw.util.getUrl('Trang_Chính') + '">← Trang Chủ</a>' +
                    '<a href="' + mw.util.getUrl('Dự_án:WhatsNew') + '">Có gì mới? →</a></div>' +
                '</div>';

            var listContainer = document.getElementById('bt-list-container');
            var loadMoreContainer = document.getElementById('bt-load-more-container');
            var searchInput = target.querySelector('.bt-search-input');

            // Filter button event listeners
            target.querySelectorAll('.bt-filter-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    target.querySelectorAll('.bt-filter-btn').forEach(function (b) { b.classList.remove('active'); });
                    btn.classList.add('active');
                    filterType = btn.getAttribute('data-type');
                    limit = 10;
                    renderFiltered();
                });
            });

            // Search input event listener
            searchInput.addEventListener('input', function () {
                searchQuery = searchInput.value.toLowerCase().trim();
                limit = 10;
                renderFiltered();
            });

            function renderFiltered() {
                var filtered = allItems.filter(function (it) {
                    var matchesType = (filterType === 'all' || it.type === filterType);
                    var matchesSearch = !searchQuery || 
                        (it.title && it.title.toLowerCase().indexOf(searchQuery) !== -1) ||
                        (it.body && it.body.toLowerCase().indexOf(searchQuery) !== -1);
                    return matchesType && matchesSearch;
                });

                var sliced = filtered.slice(0, limit);

                if (sliced.length === 0) {
                    listContainer.innerHTML = '<div class="bt-empty">// KHÔNG TÌM THẤY THÔNG BÁO NÀO</div>';
                    loadMoreContainer.innerHTML = '';
                    return;
                }

                var cards = sliced.map(function (it, idx) {
                    var t = TYPE[it.type] || TYPE.notice;
                    var dateFormatted = it.date ? relTime(it.date) : '';
                    var authorHtml = it.author ? getAuthorAvatarHtml(it.author) : '';

                    return '<article class="bt-card ' + t.cls + '" data-index="' + idx + '">' +
                        '<div class="bt-card-hd">' +
                            '<span class="bt-tag">' + t.label + '</span>' +
                            (it.tag ? '<span class="bt-cat">' + esc(it.tag) + '</span>' : '') +
                            '<time class="bt-date" title="' + esc(it.date || '') + '">' + dateFormatted + '</time>' +
                        '</div>' +
                        '<h2 class="bt-card-title">' + esc(it.title || '') + '</h2>' +
                        '<div class="bt-card-body-wrap">' +
                            '<p class="bt-card-body">' + esc(it.body || '') + '</p>' +
                        '</div>' +
                        '<div class="bt-card-ft">' +
                            authorHtml +
                            '<span class="bt-expand-toggle">Bấm để mở rộng ⌵</span>' +
                        '</div>' +
                        '</article>';
                }).join('');

                listContainer.innerHTML = cards;

                // Expandable cards listeners
                listContainer.querySelectorAll('.bt-card').forEach(function (card) {
                    card.style.cursor = 'pointer';
                    card.addEventListener('click', function (e) {
                        if (e.target.closest('.bt-author-link')) return;
                        var isExpanded = card.classList.toggle('expanded');
                        var toggleText = card.querySelector('.bt-expand-toggle');
                        if (toggleText) {
                            toggleText.innerHTML = isExpanded ? 'Thu gọn ⌃' : 'Bấm để mở rộng ⌵';
                        }
                    });
                });

                // Load more button
                if (filtered.length > limit) {
                    loadMoreContainer.innerHTML = '<button class="bt-load-more-btn" type="button">XEM THÊM (' + (filtered.length - limit) + ')</button>';
                    loadMoreContainer.querySelector('.bt-load-more-btn').addEventListener('click', function () {
                        limit += 10;
                        renderFiltered();
                    });
                } else {
                    loadMoreContainer.innerHTML = '';
                }
            }

            renderFiltered();
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
