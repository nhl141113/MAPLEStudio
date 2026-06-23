/* ============================================
   M.A.P.L.E — MediaWiki:KhoLuuTru-Article.js
   Trang bài viết Kho Lưu Trữ/{ID}:
     • 2 tab nội dung: "Tóm tắt" (nội dung bài) + "Thông tin bài viết" (metadata)
     • Cuối bài: khối Đánh giá (VoteNY <vote>) + Bình luận (Comments <comments>)
       — kích hoạt extension THẬT (lưu được) qua action=parse rồi restyle bằng CSS.
   Nạp từ Common.js khi wgPageName bắt đầu bằng 'Kho Lưu Trữ/' + action=view.
   Kho_Lưu_Trữ.css (đã @import toàn cục trong Common.css) chứa style .klt-* dùng chung.
   ============================================ */
(function () {

    var ACCESS_LABEL = { open: 'MỞ', restricted: 'HẠN CHẾ', classified: 'TỐI MẬT' };

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function accessBadge(a) {
        var cls = { open: 'klt-open', restricted: 'klt-restricted', classified: 'klt-classified' }[a] || '';
        return '<span class="klt-badge ' + cls + '">' + (ACCESS_LABEL[a] || esc(a)) + '</span>';
    }

    function ageBadge(a) {
        if (!a) return '';
        var cls = { '13+': 'klt-age-13', '16+': 'klt-age-16', '18+': 'klt-age-18' }[a] || '';
        return '<span class="klt-badge ' + cls + '">' + esc(a) + '</span>';
    }

    /* Tags trong data có thể là mảng nhiều phần tử HOẶC 1 chuỗi gộp "#a #b #c" */
    function splitTags(tags) {
        var out = [];
        (tags || []).forEach(function (t) {
            String(t).split(/\s+/).forEach(function (tok) {
                tok = tok.trim();
                if (tok) out.push(tok);
            });
        });
        return out;
    }

    function fmtDate(s) {
        if (!s) return '';
        var d = new Date(s);
        if (isNaN(d.getTime())) return esc(s);
        try { return d.toLocaleString('vi-VN'); } catch (e) { return d.toISOString(); }
    }

    function metaRow(label, valueHtml) {
        if (valueHtml == null || valueHtml === '') return '';
        return '<tr><th>' + esc(label) + '</th><td>' + valueHtml + '</td></tr>';
    }

    function init() {
        var pageName = mw.config.get('wgPageName') || '';
        var decoded;
        try { decoded = decodeURIComponent(pageName); } catch (e) { decoded = pageName; }
        decoded = decoded.replace(/_/g, ' ');

        var PREFIX = 'Kho Lưu Trữ/';
        if (decoded.indexOf(PREFIX) !== 0) return;

        var id = decoded.slice(PREFIX.length);
        if (!id) return;

        var content = document.querySelector('#mw-content-text .mw-parser-output');
        if (!content) return;

        /* Tránh chạy 2 lần (ResourceLoader có thể nạp lại) */
        if (content.getAttribute('data-klt-article') === '1') return;
        content.setAttribute('data-klt-article', '1');

        /* Fetch metadata từ JSON dùng chung (cùng pattern Kho Lưu Trữ.js) */
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
            var entry = null;
            try {
                var pages  = apiData.query.pages;
                var pageId = Object.keys(pages)[0];
                var raw    = pages[pageId].revisions[0].slots.main['*'];
                var data   = JSON.parse(raw);
                var list   = data.entries || [];
                entry = findEntry(list, id);
            } catch (e) { entry = null; }
            buildTabs(content, id, entry);
            buildFeedback(content, id);
        })
        .fail(function () {
            /* Không có data → vẫn dựng tab (Tóm tắt = nội dung gốc) + feedback */
            buildTabs(content, id, null);
            buildFeedback(content, id);
        });
    }

    /* Khớp entry theo id / page_name / title (data không đồng nhất giữa các bản ghi) */
    function findEntry(list, id) {
        var norm = function (s) { return String(s == null ? '' : s).trim().toLowerCase(); };
        var key = norm(id);
        for (var i = 0; i < list.length; i++) {
            var e = list[i];
            if (norm(e.id) === key || norm(e.page_name) === key || norm(e.title) === key) return e;
        }
        return null;
    }

    /* ── Dựng thanh tab + 2 panel ─────────────────────────────────────────── */
    function buildTabs(content, id, entry) {
        /* Panel "Tóm tắt": header tóm tắt (nếu có) + giữ NGUYÊN nội dung wiki gốc */
        var summaryText = entry && entry.summary ? String(entry.summary).trim() : '';
        var badges = '';
        if (entry) {
            badges = accessBadge(entry.access) + ageBadge(entry.age);
        }
        var tagHtml = entry ? splitTags(entry.tags).map(function (t) {
            return '<span class="klt-tag">' + esc(t) + '</span>';
        }).join('') : '';

        var summaryHeader =
            '<div class="klt-art-summary">' +
                '<div class="klt-art-eyebrow">// TÓM TẮT</div>' +
                (badges ? '<div class="klt-art-badges">' + badges + '</div>' : '') +
                (summaryText
                    ? '<p class="klt-art-summary-text">' + esc(summaryText) + '</p>'
                    : '<p class="klt-art-summary-text klt-art-empty">// Chưa có tóm tắt cho bài viết này.</p>') +
                (tagHtml ? '<div class="klt-art-tags">' + tagHtml + '</div>' : '') +
            '</div>';

        /* Panel "Thông tin bài viết": bảng metadata */
        var infoHtml;
        if (entry) {
            var authorHtml = entry.author
                ? '<a href="' + esc(mw.util.getUrl('Người dùng:' + entry.author)) + '">' + esc(entry.author) + '</a>'
                : '<span class="klt-meta-na">—</span>';
            var statusHtml = entry.status
                ? '<span class="klt-meta-status klt-meta-status--' + esc(String(entry.status).toLowerCase()) + '">' + esc(String(entry.status).toUpperCase()) + '</span>'
                : '';
            var infoTagHtml = splitTags(entry.tags).map(function (t) {
                return '<span class="klt-tag">' + esc(t) + '</span>';
            }).join('');

            infoHtml =
                '<table class="klt-meta-table"><tbody>' +
                    metaRow('Mã hồ sơ', '<code>' + esc(entry.id || id) + '</code>') +
                    metaRow('Tác giả', authorHtml) +
                    metaRow('Quyền truy cập', entry.access ? accessBadge(entry.access) : '') +
                    metaRow('Độ tuổi', entry.age ? ageBadge(entry.age) : '') +
                    metaRow('Phân loại', entry.category ? '<span class="klt-meta-cat">' + esc(entry.category) + '</span>' : '') +
                    metaRow('Trạng thái', statusHtml) +
                    metaRow('Người duyệt', entry.approved_by ? esc(entry.approved_by) : '') +
                    metaRow('Ngày gửi', entry.submitted_at ? esc(fmtDate(entry.submitted_at)) : '') +
                    metaRow('Ngày duyệt', entry.approved_at ? esc(fmtDate(entry.approved_at)) : '') +
                    metaRow('Tags', infoTagHtml || '') +
                '</tbody></table>';
        } else {
            infoHtml =
                '<p class="klt-art-empty">// Không tìm thấy thông tin của bài viết này trong cơ sở dữ liệu M.A.P.L.E.</p>' +
                '<table class="klt-meta-table"><tbody>' +
                    metaRow('Mã hồ sơ', '<code>' + esc(id) + '</code>') +
                '</tbody></table>';
        }

        /* Thanh tab — tái dùng class .klt-tabs-bar + .klt-filter-btn của Kho Lưu Trữ */
        var bar = document.createElement('div');
        bar.className = 'klt-tabs-bar klt-art-tabs';
        bar.innerHTML =
            '<button type="button" class="klt-filter-btn active" data-tab="summary">TÓM TẮT</button>' +
            '<button type="button" class="klt-filter-btn" data-tab="info">THÔNG TIN BÀI VIẾT</button>';

        /* Panel tóm tắt: header + nội dung wiki gốc (di chuyển toàn bộ con của .mw-parser-output) */
        var panelSummary = document.createElement('div');
        panelSummary.className = 'klt-tab-panel active';
        panelSummary.setAttribute('data-tab', 'summary');

        var summaryHead = document.createElement('div');
        summaryHead.innerHTML = summaryHeader;

        var origWrap = document.createElement('div');
        origWrap.className = 'klt-art-original';
        /* Chuyển mọi node con hiện có của .mw-parser-output vào origWrap (giữ Dossier nguyên vẹn) */
        while (content.firstChild) {
            origWrap.appendChild(content.firstChild);
        }
        panelSummary.appendChild(summaryHead);
        panelSummary.appendChild(origWrap);

        var panelInfo = document.createElement('div');
        panelInfo.className = 'klt-tab-panel';
        panelInfo.setAttribute('data-tab', 'info');
        panelInfo.innerHTML = '<div class="klt-art-info">' + infoHtml + '</div>';

        /* Gắn lại theo thứ tự: tab bar → panel tóm tắt → panel info */
        content.appendChild(bar);
        content.appendChild(panelSummary);
        content.appendChild(panelInfo);

        /* Bind chuyển tab (pattern Kho Lưu Trữ.js) */
        var btns   = bar.querySelectorAll('.klt-filter-btn');
        var panels = [panelSummary, panelInfo];
        btns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var tab = btn.getAttribute('data-tab');
                btns.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                panels.forEach(function (p) {
                    p.classList.toggle('active', p.getAttribute('data-tab') === tab);
                });
            });
        });
    }

    /* ── Khối Đánh giá + Bình luận cuối bài (extension THẬT, lưu được) ──────── */
    function buildFeedback(content, id) {
        if (document.getElementById('klt-feedback')) return;

        var wrap = document.createElement('div');
        wrap.id = 'klt-feedback';
        wrap.className = 'klt-feedback';
        wrap.innerHTML =
            '<div class="klt-fb-block">' +
                '<div class="klt-fb-eyebrow">// ĐÁNH GIÁ CỘNG ĐỒNG</div>' +
                '<div class="klt-fb-body" id="klt-fb-vote">' +
                    '<div class="klt-fb-loading">// ĐANG TẢI HỘP ĐÁNH GIÁ...</div>' +
                '</div>' +
            '</div>' +
            '<div class="klt-fb-block">' +
                '<div class="klt-fb-eyebrow">// BÌNH LUẬN</div>' +
                '<div class="klt-fb-body" id="klt-fb-comments">' +
                    '<div class="klt-fb-loading">// ĐANG TẢI BÌNH LUẬN...</div>' +
                '</div>' +
            '</div>';
        content.appendChild(wrap);

        /* Nếu nội dung gốc đã chứa <vote>/<comments> do template render sẵn →
           DI CHUYỂN chúng vào khối feedback (đã được parse + có JS extension gắn).
           Nếu chưa có → dùng action=parse để render mới (kích hoạt extension thật). */
        var existingVote     = content.querySelector('.vote, .vote-rating, [id^="vote"]');
        var existingComments = content.querySelector('#allcomments, .comments-body, .c-container, .comments');

        if (existingVote || existingComments) {
            if (existingVote) {
                var vc = existingVote.closest('.vote') || existingVote;
                document.getElementById('klt-fb-vote').innerHTML = '';
                document.getElementById('klt-fb-vote').appendChild(vc);
            } else {
                renderParsed('<vote type=1 />', 'klt-fb-vote');
            }
            if (existingComments) {
                document.getElementById('klt-fb-comments').innerHTML = '';
                document.getElementById('klt-fb-comments').appendChild(existingComments);
            } else {
                renderParsed('<comments />', 'klt-fb-comments');
            }
        } else {
            /* Parse cả hai trong CÙNG ngữ cảnh trang hiện tại để extension gắn đúng trang */
            renderParsed('<vote type=1 />', 'klt-fb-vote');
            renderParsed('<comments />', 'klt-fb-comments');
        }
    }

    /* Gọi action=parse để render parser-tag trong ngữ cảnh trang hiện tại,
       sau đó nạp module ResourceLoader đi kèm (để nút vote/comment hoạt động). */
    function renderParsed(wikitext, targetId) {
        var api = new mw.Api();
        api.get({
            action: 'parse',
            title:  mw.config.get('wgPageName'),
            text:   wikitext,
            prop:   'text|modules|modulestyles|jsconfigvars',
            disablelimitreport: 1,
            contentmodel: 'wikitext',
            format: 'json'
        }).done(function (r) {
            var box = document.getElementById(targetId);
            if (!box) return;
            var html = r && r.parse && r.parse.text && r.parse.text['*'];
            if (!html) { box.innerHTML = '<div class="klt-fb-loading">// Không tải được nội dung.</div>'; return; }
            box.innerHTML = html;

            /* Nạp đúng module JS/CSS mà extension yêu cầu để tương tác hoạt động */
            var mods = (r.parse.modules || []).concat(r.parse.modulestyles || []);
            if (mw.loader && mods.length) {
                try { mw.loader.load(mods); } catch (e) {}
            }
            /* Cho phép extension hook lại vào DOM mới chèn */
            try { mw.hook('wikipage.content').fire($(box)); } catch (e) {}
        }).fail(function () {
            var box = document.getElementById(targetId);
            if (box) box.innerHTML = '<div class="klt-fb-loading">// Không tải được nội dung (lỗi kết nối).</div>';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
