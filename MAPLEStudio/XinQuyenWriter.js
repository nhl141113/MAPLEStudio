/* ============================================
   M.A.P.L.E — MediaWiki:XinQuyenWriter.js
   Trang Dự_án:Xin_quyền_Writer
   Hiển thị hướng dẫn + form xin quyền Writer.
   Nếu đã là Writer/sysop → hiện thông báo tương ứng.
   Yêu cầu: TroGiup-Common.js (window.MHHelp) đã nạp trước (Common.js lo).
   ============================================ */
(function () {
    'use strict';

    /* ── Inline CSS ── */
    var CSS = [
        '#wr-form{background:#0d0d0d;border:1px solid #1e1e1e;border-radius:8px;padding:32px;margin-top:24px}',
        '#wr-form label{display:block;font-size:.78rem;letter-spacing:.08em;color:#9ca3af;text-transform:uppercase;margin-bottom:6px;margin-top:20px}',
        '#wr-form label:first-of-type{margin-top:0}',
        '#wr-form input[type=text],#wr-form input[type=url],#wr-form textarea,#wr-form select{',
        '  width:100%;box-sizing:border-box;background:#111;border:1px solid #52525b;border-radius:6px;',
        '  color:#e5e7eb;padding:10px 14px;font-size:.92rem;font-family:inherit;resize:vertical;',
        '  transition:border-color .2s}',
        '#wr-form input:focus,#wr-form textarea:focus,#wr-form select:focus{outline:none;border-color:#ef4444}',
        '#wr-form textarea{min-height:110px}',
        '.wr-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}',
        '.wr-chip{padding:6px 14px;border-radius:20px;border:1px solid #333;background:#111;',
        '  color:#9ca3af;font-size:.82rem;cursor:pointer;transition:all .18s;user-select:none}',
        '.wr-chip:hover{border-color:#6b7280;color:#d1d5db}',
        '.wr-chip.active{border-color:#ef4444;background:#1a0000;color:#ef4444}',
        '.wr-char{font-size:.75rem;color:#6b7280;text-align:right;margin-top:4px}',
        '.wr-char.warn{color:#f59e0b}',
        '.wr-char.over{color:#ef4444}',
        '#wr-submit{margin-top:28px;width:100%;padding:13px;background:#ef4444;border:none;',
        '  border-radius:6px;color:#fff;font-size:.95rem;letter-spacing:.06em;font-weight:700;',
        '  cursor:pointer;text-transform:uppercase;transition:background .2s,opacity .2s}',
        '#wr-submit:disabled{background:#52525b;color:#555;cursor:not-allowed;opacity:.6}',
        '#wr-submit:not(:disabled):hover{background:#dc2626}',
        '#wr-note{font-size:.8rem;color:#6b7280;margin-top:14px;line-height:1.6}',
        '.wr-success{background:#0a1a0a;border:1px solid #166534;border-radius:8px;padding:32px;text-align:center;margin-top:24px}',
        '.wr-success h3{color:#4ade80;font-size:1.3rem;margin-bottom:12px}',
        '.wr-success p{color:#9ca3af;line-height:1.7}',
        '.wr-success a{color:#ef4444}',
        '.wr-already{background:#0d1117;border:1px solid #1e3a5f;border-radius:8px;padding:28px;margin-top:24px;text-align:center}',
        '.wr-already h3{color:#60a5fa;margin-bottom:10px}',
        '.wr-already p{color:#9ca3af;line-height:1.7}',
        '.wr-guest{background:#0d0d0d;border:1px solid #1e1e1e;border-radius:8px;padding:28px;margin-top:24px;text-align:center}',
        '.wr-guest p{color:#9ca3af;line-height:1.7}',
        '.wr-guest a{color:#ef4444}'
    ].join('');

    function injectCSS() {
        if (document.getElementById('wr-css')) return;
        var s = document.createElement('style');
        s.id = 'wr-css';
        s.textContent = CSS;
        document.head.appendChild(s);
    }

    /* ── Helpers ── */
    function getConfig() {
        if (typeof mw === 'undefined') return { userId: 0, userName: '', groups: [] };
        var c = mw.config.get(['wgUserId', 'wgUserName', 'wgUserGroups']);
        return { userId: c.wgUserId || 0, userName: c.wgUserName || '', groups: c.wgUserGroups || [] };
    }

    function hasGroup(groups, target) {
        return groups.indexOf(target) !== -1;
    }

    function isWriter(groups) {
        return hasGroup(groups, 'writer') || hasGroup(groups, 'sysop') || hasGroup(groups, 'bureaucrat');
    }

    /* ── Form ── */
    function buildForm(MH, page, userName) {
        var section = MH.section({ tag: 'Đơn đăng ký', heading: 'Điền thông tin' });

        var formWrap = document.createElement('div');
        formWrap.id = 'wr-form';

        formWrap.innerHTML = [
            /* Tên hiển thị (readonly) */
            '<label for="wr-uname">Tên tài khoản</label>',
            '<input type="text" id="wr-uname" value="' + escAttr(userName) + '" readonly ' +
                'style="opacity:.5;cursor:default">',

            /* Loại nội dung */
            '<label>Thể loại bạn muốn viết <span style="color:#ef4444">*</span></label>',
            '<div class="wr-chips" id="wr-genres">',
            genreChip('Thực thể'),
            genreChip('Vật phẩm'),
            genreChip('Nhật ký'),
            genreChip('Tài liệu lore'),
            genreChip('Bài ngoại truyện'),
            genreChip('Lore cốt lõi'),
            '</div>',

            /* Rating */
            '<label for="wr-rating">Rating nội dung dự kiến <span style="color:#ef4444">*</span></label>',
            '<select id="wr-rating">',
            '<option value="">— Chọn rating —</option>',
            '<option value="13+">13+ (an toàn, bạo lực nhẹ)</option>',
            '<option value="16+">16+ (bạo lực trung bình, trưởng thành nhẹ)</option>',
            '<option value="18+">18+ (bạo lực nặng, tình dục, trauma)</option>',
            '</select>',

            /* Giới thiệu ý tưởng */
            '<label for="wr-idea">Giới thiệu ngắn về ý tưởng đầu tiên của bạn <span style="color:#ef4444">*</span></label>',
            '<textarea id="wr-idea" placeholder="Thực thể là gì? Cơ chế hoạt động ra sao? Kết nối với lore ntn?" maxlength="1500"></textarea>',
            '<div class="wr-char" id="wr-idea-count">0 / 1500</div>',

            /* Kinh nghiệm */
            '<label for="wr-exp">Kinh nghiệm sáng tác của bạn (nếu có)</label>',
            '<textarea id="wr-exp" placeholder="Wiki khác, wattpad, fiction, lần đầu viết... — không bắt buộc" maxlength="600"></textarea>',
            '<div class="wr-char" id="wr-exp-count">0 / 600</div>',

            /* Link mẫu */
            '<label for="wr-sample">Link bài viết mẫu (nếu có)</label>',
            '<input type="url" id="wr-sample" placeholder="https://...  — không bắt buộc">',

            /* Cam kết */
            '<label style="flex-direction:row;display:flex;align-items:flex-start;gap:10px;text-transform:none;font-size:.88rem;color:#d1d5db;cursor:pointer;margin-top:24px">',
            '<input type="checkbox" id="wr-agree" style="width:auto;margin-top:2px;accent-color:#ef4444">',
            '<span>Tôi đã đọc <a href="/wiki/D%E1%BB%B1_%C3%A1n:%C4%90i%E1%BB%81u_kho%E1%BA%A3n_n%E1%BB%99i_dung" ',
            'target="_blank" style="color:#ef4444">Điều khoản Nội dung</a> và ',
            '<a href="/wiki/D%E1%BB%B1_%C3%A1n:B%E1%BA%A3n_quy%E1%BB%81n" ',
            'target="_blank" style="color:#ef4444">Điều khoản Bản quyền</a>, ',
            'và đồng ý tuân thủ các quy định đó.</span>',
            '</label>',

            '<button id="wr-submit" disabled>GỬI ĐƠN ĐĂNG KÝ</button>',
            '<div id="wr-note">',
            'BQT xét duyệt trong vòng <strong>3–7 ngày</strong>. Kết quả sẽ được thông báo qua MAPLE Chat hoặc ',
            'trang thảo luận tài khoản của bạn. Một đơn đang chờ xét = không nộp thêm.',
            '</div>'
        ].join('');

        section.appendChild(formWrap);
        page.appendChild(section);

        wireForm(userName);
    }

    function genreChip(label) {
        return '<span class="wr-chip" data-genre="' + escAttr(label) + '">' + esc(label) + '</span>';
    }

    function wireForm(userName) {
        var chips       = document.querySelectorAll('#wr-genres .wr-chip');
        var ideaTA      = document.getElementById('wr-idea');
        var expTA       = document.getElementById('wr-exp');
        var ratingEl    = document.getElementById('wr-rating');
        var agreeEl     = document.getElementById('wr-agree');
        var submitBtn   = document.getElementById('wr-submit');
        var ideaCount   = document.getElementById('wr-idea-count');
        var expCount    = document.getElementById('wr-exp-count');

        var selectedGenres = [];

        function charStatus(el, countEl, max) {
            var n = el.value.length;
            countEl.textContent = n + ' / ' + max;
            countEl.className = 'wr-char' + (n > max * 0.9 ? (n >= max ? ' over' : ' warn') : '');
        }

        function canSubmit() {
            return selectedGenres.length > 0 &&
                   ratingEl.value &&
                   ideaTA.value.trim().length >= 30 &&
                   agreeEl.checked;
        }

        function refresh() {
            submitBtn.disabled = !canSubmit();
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                var g = chip.getAttribute('data-genre');
                var idx = selectedGenres.indexOf(g);
                if (idx === -1) {
                    selectedGenres.push(g);
                    chip.classList.add('active');
                } else {
                    selectedGenres.splice(idx, 1);
                    chip.classList.remove('active');
                }
                refresh();
            });
        });

        ideaTA.addEventListener('input', function () { charStatus(ideaTA, ideaCount, 1500); refresh(); });
        expTA.addEventListener('input', function () { charStatus(expTA, expCount, 600); });
        ratingEl.addEventListener('change', refresh);
        agreeEl.addEventListener('change', refresh);

        submitBtn.addEventListener('click', function () {
            if (!canSubmit()) return;
            submitBtn.disabled = true;
            submitBtn.textContent = 'ĐANG GỬI...';
            submitApplication(userName, selectedGenres);
        });
    }

    function submitApplication(userName, genres) {
        var ideaVal   = (document.getElementById('wr-idea').value || '').trim();
        var expVal    = (document.getElementById('wr-exp').value || '').trim();
        var sampleVal = (document.getElementById('wr-sample').value || '').trim();
        var ratingVal = (document.getElementById('wr-rating').value || '');
        var now       = new Date();
        var dateStr   = now.getFullYear() + '-' +
                        String(now.getMonth() + 1).padStart(2, '0') + '-' +
                        String(now.getDate()).padStart(2, '0');
        var timeStr   = String(now.getHours()).padStart(2, '0') + ':' +
                        String(now.getMinutes()).padStart(2, '0');

        var wikiText = [
            '== Đơn xin quyền Writer ==',
            '; Người nộp đơn: [[Người dùng:' + userName + '|' + userName + ']]',
            '; Ngày nộp: ' + dateStr + ' ' + timeStr + ' (giờ địa phương)',
            '; Thể loại: ' + genres.join(', '),
            '; Rating dự kiến: ' + ratingVal,
            '',
            '=== Ý tưởng ===',
            ideaVal,
            '',
            expVal ? ('=== Kinh nghiệm ===\n' + expVal + '\n') : '',
            sampleVal ? ('=== Link mẫu ===\n' + sampleVal + '\n') : '',
            '<!-- MAPLE_WR_APP:{"user":"' + userName + '","date":"' + dateStr + '","status":"pending"} -->'
        ].filter(Boolean).join('\n');

        var pageTitle = 'Dự án:Xin quyền Writer/' + userName;

        var api = new mw.Api();
        api.get({ action: 'query', meta: 'tokens', type: 'csrf', format: 'json' })
            .then(function (d) {
                var token = d.query && d.query.tokens && d.query.tokens.csrftoken;
                if (!token || token === '+\\') throw new Error('Không lấy được token');
                return api.post({
                    action: 'edit', title: pageTitle,
                    text: wikiText,
                    summary: 'Nộp đơn xin quyền Writer [bot]',
                    token: token, format: 'json'
                });
            })
            .then(function () { showSuccess(pageTitle); })
            .catch(function (err) {
                console.error('[XinQuyenWriter] Lỗi gửi đơn:', err);
                showError();
            });
    }

    function showSuccess(pageTitle) {
        var form = document.getElementById('wr-form');
        if (!form) return;
        var pageUrl = mw.util ? mw.util.getUrl(pageTitle) : '/wiki/' + encodeURIComponent(pageTitle);
        form.outerHTML = [
            '<div class="wr-success">',
            '<h3>✅ Đơn đã được gửi thành công!</h3>',
            '<p>BQT sẽ xem xét trong vòng <strong>3–7 ngày</strong>.<br>',
            'Kết quả được thông báo qua MAPLE Chat hoặc trang thảo luận tài khoản của bạn.<br><br>',
            'Xem đơn của bạn: <a href="' + pageUrl + '">' + esc(pageTitle) + '</a></p>',
            '</div>'
        ].join('');
    }

    function showError() {
        var btn = document.getElementById('wr-submit');
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'GỬI LẠI';
        }
        var note = document.getElementById('wr-note');
        if (note) note.innerHTML = '<span style="color:#ef4444">⚠ Gửi thất bại. Kiểm tra kết nối và thử lại, hoặc liên hệ BQT trực tiếp.</span>';
    }

    /* ── Tình trạng: đã là Writer ── */
    function buildAlready(MH, page) {
        var section = MH.section({ tag: 'Thông báo', heading: 'Bạn đã có quyền Writer' });
        var box = document.createElement('div');
        box.className = 'wr-already';
        box.innerHTML = [
            '<h3>🎉 Bạn đã là Writer!</h3>',
            '<p>Tài khoản của bạn đã có quyền đăng bài. ',
            'Vào <a href="/wiki/T%E1%BA%A1o_B%C3%A0i_M%E1%BB%9Bi" style="color:#ef4444">Tạo Bài Mới</a> để bắt đầu sáng tác.<br><br>',
            'Nếu gặp vấn đề về quyền hạn, liên hệ BQT qua MAPLE Chat.</p>'
        ].join('');
        section.appendChild(box);
        page.appendChild(section);
    }

    /* ── Tình trạng: chưa đăng nhập ── */
    function buildGuest(MH, page) {
        var section = MH.section({ tag: 'Đăng nhập', heading: 'Cần tài khoản để đăng ký' });
        var box = document.createElement('div');
        box.className = 'wr-guest';
        box.innerHTML = [
            '<p>Bạn cần <a href="/wiki/D%E1%BB%B1_%C3%A1n:%C4%90%C4%83ng_k%C3%BD" style="color:#ef4444">đăng ký tài khoản</a> ',
            'và đăng nhập để nộp đơn xin quyền Writer.<br><br>',
            'Đã có tài khoản? <a href="/wiki/Special:UserLogin" style="color:#ef4444">Đăng nhập ngay</a>.</p>'
        ].join('');
        section.appendChild(box);
        page.appendChild(section);
    }

    /* ── Escape utils ── */
    function esc(s) {
        return String(s || '').replace(/[&<>"']/g, function (c) {
            return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
        });
    }
    function escAttr(s) { return esc(s); }

    /* ── Main build ── */
    function build(MH) {
        injectCSS();

        var cfg     = getConfig();
        var loggedIn = cfg.userId !== 0;
        var groups   = cfg.groups;

        MH.mount(function (page) {
            /* Hero */
            var heroEl = MH.hero({
                crumb:   'Xin quyền Writer',
                eyebrow: 'Writer Application — M.A.P.L.E Wiki',
                title:   'XIN QUYỀN <em>WRITER</em>',
                sub:     'Quyền Writer cho phép bạn đăng bài và tham gia xây dựng kho lưu trữ của M.A.P.L.E.'
            });
            if (window.MAPLE && window.MAPLE.logoSVG) {
                var logo = MH.el('div', 'mhd3-hero-logo', window.MAPLE.logoSVG(56));
                heroEl.insertBefore(logo, heroEl.firstChild);
            }
            page.appendChild(heroEl);

            /* Điều kiện */
            var s0 = MH.section({ tag: 'Điều kiện', heading: 'Ai có thể nộp đơn?' });
            s0.appendChild(MH.steps([
                { main: 'Có tài khoản Miraheze', sub: 'Tài khoản phải đã đăng nhập trên Wiki ít nhất một lần.' },
                { main: 'Đọc Điều khoản Nội dung', sub: 'Bắt buộc đọc và đồng ý trước khi nộp đơn. Link ở cuối form.' },
                { main: 'Có ý tưởng thực sự', sub: 'BQT xét duyệt dựa trên chất lượng ý tưởng, không phải thâm niên hay quen biết.' },
                { main: 'Không cần kinh nghiệm trước', sub: 'Lần đầu viết wiki hoàn toàn OK. Sẽ có BQT hỗ trợ bài đầu tiên.' }
            ]));
            s0.appendChild(MH.infobox(
                '<strong>Lưu ý:</strong> Quyền Writer KHÔNG được tự động sau khi đăng ký tài khoản — ' +
                'bạn phải nộp đơn và được BQT phê duyệt. Bài đăng mà không có quyền = bị xoá + cảnh báo.'
            ));
            page.appendChild(s0);

            /* Quy trình */
            var s1 = MH.section({ tag: 'Quy trình', heading: 'Sau khi nộp đơn' });
            s1.appendChild(MH.steps([
                { main: 'Đơn được tạo tự động', sub: 'Hệ thống tạo trang Dự án:Xin quyền Writer/[tên bạn] với thông tin đã điền.' },
                { main: 'BQT xem xét (3–7 ngày)', sub: 'BQT sẽ đọc ý tưởng, kiểm tra tiêu chí và bỏ phiếu nội bộ.' },
                { main: 'Thông báo kết quả', sub: 'Nếu được duyệt → tài khoản nhận nhóm "writer" và thông báo qua Chat. Nếu chưa đạt → BQT để lại phản hồi để bạn cải thiện và nộp lại.' }
            ]));
            page.appendChild(s1);

            /* Form / Trạng thái */
            if (!loggedIn) {
                buildGuest(MH, page);
            } else if (isWriter(groups)) {
                buildAlready(MH, page);
            } else {
                buildForm(MH, page, cfg.userName);
            }

            /* Câu hỏi thường gặp */
            var sf = MH.section({ tag: 'FAQ', heading: 'Câu hỏi thường gặp' });
            sf.appendChild(MH.faq([
                {
                    q: 'Bị từ chối thì có nộp lại được không?',
                    a: 'Được. BQT sẽ để lại phản hồi về điểm cần cải thiện. ' +
                       'Sau khi chỉnh lại ý tưởng, bạn có thể nộp đơn mới sau 14 ngày.'
                },
                {
                    q: 'Tôi đã nộp đơn nhưng chưa thấy kết quả sau 7 ngày?',
                    a: 'Liên hệ BQT qua MAPLE Chat hoặc nhắn tin trực tiếp. ' +
                       'Có thể đơn bị bỏ sót trong thời gian BQT bận.'
                },
                {
                    q: 'Quyền Writer có thể bị thu hồi không?',
                    a: 'Có. Vi phạm Điều khoản Nội dung (đặc biệt Strike 3) = quyền Writer bị thu hồi kèm khoá tài khoản.'
                },
                {
                    q: 'Writer có thể đề xuất thêm lore cốt lõi không?',
                    a: 'Được — và đây là đặc quyền của Writer. Tạo trang thảo luận trên Dự án và trình bày đề xuất. BQT + cộng đồng sẽ bỏ phiếu.'
                }
            ]));
            page.appendChild(sf);

            /* CTA cuối */
            page.appendChild(MH.stuck({
                tag:  'Đọc trước khi điền đơn',
                text: 'Nắm rõ Điều khoản Nội dung trước để đơn của bạn được xét duyệt nhanh hơn.'
            }));
            page.appendChild(MH.btns([
                MH.btn('/wiki/D%E1%BB%B1_%C3%A1n:%C4%90i%E1%BB%81u_kho%E1%BA%A3n_n%E1%BB%99i_dung', '📋 Điều khoản Nội dung', true),
                MH.btn('/wiki/D%E1%BB%B1_%C3%A1n:Kh%C3%A1ng_c%C3%A1o', '⚖️ Kháng cáo', false)
            ]));
        });
    }

    if (window.MHHelp) build(window.MHHelp);
    else if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(build);
})();
