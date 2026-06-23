/**
 * M.A.P.L.E — MediaWiki:NewSignupPage.js
 *
 * Tùy chỉnh trang Special:CreateAccount:
 *  - Thay thế form gốc bằng giao diện 3 bước: Thông tin → Độ tuổi → Điều khoản
 *  - Điều khoản: tóm tắt inline + 3 ô tích (TOS, tuổi, MCL v1)
 *  - Submit fill vào form MediaWiki gốc, sau đó submit thật
 *
 * Load từ Common.js khi wgCanonicalSpecialPageName === 'CreateAccount'.
 * Extension NewSignupPage cũng thêm checkbox mặc định — JS này ghi đè hoàn toàn.
 */
(function () {
    'use strict';

    if (typeof mw === 'undefined') return;
    if (mw.config.get('wgCanonicalSpecialPageName') !== 'CreateAccount') return;

    /* ── CSS ── */
    function injectCSS() {
        if (document.getElementById('nsp-style')) return;
        var s = document.createElement('style');
        s.id = 'nsp-style';
        s.textContent = [
            /* Ẩn form gốc khi JS đã khởi tạo */
            '.nsp-mw-hidden{display:none!important}',
            '#nsp-wrap *{box-sizing:border-box}',
            '#nsp-wrap{font-family:"JetBrains Mono",ui-monospace,monospace;',
            '  max-width:480px;margin:40px auto;padding:0 16px 60px;color:#e4e4e7}',

            /* Brand */
            '#nsp-brand{text-align:center;margin-bottom:32px}',
            '#nsp-brand-logo{display:flex;justify-content:center;margin-bottom:14px}',
            '#nsp-eyebrow{font-size:7.5px;letter-spacing:.35em;color:#ef4444;',
            '  text-transform:uppercase;margin-bottom:6px}',
            '#nsp-title{font-size:1.4rem;font-weight:800;letter-spacing:.1em;',
            '  color:#f4f4f5;text-transform:uppercase;margin:0 0 8px}',
            '#nsp-title em{color:#ef4444;font-style:normal}',
            '#nsp-sub{font-size:9px;color:#52525b;letter-spacing:.07em;line-height:1.7}',

            /* Steps */
            '#nsp-steps{display:flex;align-items:center;justify-content:center;margin-bottom:32px}',
            '.nsp-step{display:flex;flex-direction:column;align-items:center;gap:4px;',
            '  position:relative;flex:1}',
            '.nsp-step::after{content:"";position:absolute;top:12px;left:50%;',
            '  width:100%;height:1px;background:#1e1e1e;z-index:0}',
            '.nsp-step:last-child::after{display:none}',
            '.nsp-step-dot{width:24px;height:24px;border:1px solid #1e1e1e;background:#080808;',
            '  display:flex;align-items:center;justify-content:center;font-size:8px;',
            '  color:#52525b;position:relative;z-index:1;transition:all .2s}',
            '.nsp-step.active .nsp-step-dot{border-color:#ef4444;color:#ef4444;background:rgba(239,68,68,.08)}',
            '.nsp-step.done .nsp-step-dot{border-color:#22c55e;background:rgba(34,197,94,.1);color:#4ade80}',
            '.nsp-step-label{font-size:7px;letter-spacing:.15em;color:#3f3f46;text-transform:uppercase}',
            '.nsp-step.active .nsp-step-label{color:#71717a}',
            '.nsp-step.done .nsp-step-label{color:#4ade80}',

            /* Panel */
            '.nsp-panel{border:1px solid #1e1e1e;background:#060606;margin-bottom:16px;',
            '  border-top:2px solid #ef4444;animation:nsp-in .2s ease}',
            '@keyframes nsp-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
            '.nsp-ph{padding:16px 20px 12px;border-bottom:1px solid #111}',
            '.nsp-pt{font-size:7px;letter-spacing:.25em;color:#52525b;text-transform:uppercase;margin-bottom:4px}',
            '.nsp-ph h2{font-size:12px;font-weight:700;letter-spacing:.06em;color:#e4e4e7;',
            '  margin:0;border-left:2px solid #ef4444;padding-left:10px}',
            '.nsp-pb{padding:16px 20px}',

            /* Fields */
            '.nsp-f{margin-bottom:16px}',
            '.nsp-lbl{font-size:8.5px;letter-spacing:.15em;color:#71717a;text-transform:uppercase;',
            '  margin-bottom:6px;display:block}',
            '.nsp-lbl .req{color:#ef4444;margin-left:3px}',
            '.nsp-inp{width:100%;background:#0a0a0a;border:1px solid #1e1e1e;color:#e4e4e7;',
            '  font-family:inherit;font-size:11px;padding:10px 12px;outline:none;',
            '  transition:border-color .15s;letter-spacing:.04em}',
            '.nsp-inp:focus{border-color:#52525b}',
            '.nsp-inp.error{border-color:#ef4444}',
            '.nsp-inp::placeholder{color:#3f3f46}',
            '.nsp-hint{font-size:8px;color:#3f3f46;margin-top:4px;letter-spacing:.05em}',
            '.nsp-ferr{font-size:8px;color:#ef4444;margin-top:4px;letter-spacing:.05em;display:none}',
            '.nsp-ferr.show{display:block}',

            /* Age */
            '#nsp-age-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}',
            '.nsp-ac{border:1px solid #1e1e1e;background:#0a0a0a;padding:12px 8px;',
            '  text-align:center;cursor:pointer;transition:all .15s;user-select:none}',
            '.nsp-ac:hover{border-color:#52525b}',
            '.nsp-ac.sel{border-color:#ef4444;background:rgba(239,68,68,.06)}',
            '.nsp-ac-num{font-size:1.1rem;font-weight:800;color:#e4e4e7;margin-bottom:4px}',
            '.nsp-ac-sub{font-size:7.5px;letter-spacing:.12em;color:#52525b;text-transform:uppercase}',
            '.nsp-ac.sel .nsp-ac-num,.nsp-ac.sel .nsp-ac-sub{color:#ef4444}',
            '#nsp-age-note{margin-top:10px;font-size:8.5px;color:#52525b;',
            '  line-height:1.7;padding:8px 10px;border-left:2px solid #1e1e1e}',

            /* TOS scroll */
            '#nsp-tos-scroll{max-height:240px;overflow-y:auto;background:#0a0a0a;',
            '  border:1px solid #141414;padding:14px;margin-bottom:10px;',
            '  scrollbar-width:thin;scrollbar-color:#1e1e1e #080808}',
            '#nsp-tos-scroll::-webkit-scrollbar{width:3px}',
            '#nsp-tos-scroll::-webkit-scrollbar-thumb{background:#1e1e1e}',
            '.nsp-ts{margin-bottom:14px}',
            '.nsp-ts:last-child{margin-bottom:0}',
            '.nsp-tt{font-size:7px;letter-spacing:.2em;color:#52525b;margin-bottom:2px}',
            '.nsp-th{font-size:10px;font-weight:700;color:#a1a1aa;',
            '  border-left:2px solid #ef4444;padding-left:8px;margin:0 0 6px}',
            '.nsp-tp{font-size:9px;color:#52525b;line-height:1.75;margin:0 0 4px}',
            '.nsp-tp strong{color:#71717a}',
            '.nsp-tw{background:rgba(239,68,68,.05);border-left:2px solid #ef4444;',
            '  padding:8px 10px;font-size:9px;color:#fca5a5;line-height:1.7;margin:5px 0}',
            '#nsp-scroll-hint{font-size:7.5px;letter-spacing:.12em;color:#3f3f46;',
            '  text-align:center;padding:5px;transition:opacity .3s}',
            '#nsp-scroll-hint.hidden{opacity:0}',

            /* Checkboxes */
            '.nsp-cr{display:flex;gap:10px;align-items:flex-start;cursor:pointer;',
            '  padding:10px;border:1px solid #1a1a1a;margin-bottom:8px;',
            '  user-select:none;transition:border-color .15s}',
            '.nsp-cr:hover{border-color:#52525b}',
            '.nsp-cr.chk{border-color:#22c55e;background:rgba(34,197,94,.03)}',
            '.nsp-ck{flex-shrink:0;width:16px;height:16px;border:1px solid #3f3f46;',
            '  background:#080808;display:flex;align-items:center;justify-content:center;',
            '  font-size:9px;color:transparent;margin-top:1px;transition:all .15s}',
            '.nsp-cr.chk .nsp-ck{border-color:#22c55e;background:rgba(34,197,94,.12);color:#4ade80}',
            '.nsp-ct{font-size:9px;color:#52525b;line-height:1.6;letter-spacing:.04em}',
            '.nsp-cr.chk .nsp-ct{color:#86efac}',

            /* Buttons */
            '.nsp-nav{display:flex;gap:8px;margin-top:14px}',
            '.nsp-btn{font-family:inherit;font-size:9px;letter-spacing:.15em;font-weight:700;',
            '  text-transform:uppercase;padding:11px 20px;border:1px solid;cursor:pointer;',
            '  transition:all .18s;flex:1}',
            '.nsp-back{background:transparent;border-color:#1e1e1e;color:#52525b}',
            '.nsp-back:hover{border-color:#52525b;color:#71717a}',
            '.nsp-next{background:#ef4444;border-color:#ef4444;color:#fff}',
            '.nsp-next:hover:not(:disabled){background:#dc2626;border-color:#dc2626}',
            '.nsp-next:disabled,.nsp-sub:disabled{background:#1a1a1a;border-color:#1a1a1a;',
            '  color:#3f3f46;cursor:not-allowed}',
            '.nsp-sub{background:#22c55e;border-color:#22c55e;color:#fff}',
            '.nsp-sub:hover:not(:disabled){background:#16a34a;border-color:#16a34a}',

            /* Misc */
            '.nsp-notice{font-size:8.5px;color:#52525b;letter-spacing:.05em;line-height:1.7;',
            '  border-left:2px solid #1e1e1e;padding:8px 10px;margin:12px 0}',
            '.nsp-notice a{color:#71717a;text-decoration:underline}',
            '#nsp-err{display:none;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.4);',
            '  border-left:3px solid #ef4444;padding:10px 14px;margin-bottom:14px;',
            '  font-size:9px;color:#fca5a5;line-height:1.6}',
            '#nsp-err.show{display:block}',

            '@media(max-width:480px){#nsp-wrap{padding:0 8px 40px}}',
        ].join('');
        document.head.appendChild(s);
    }

    /* ── TOS tóm tắt inline ── */
    function tosHTML() {
        var D = '<hr style="border:none;border-top:1px solid #111;margin:12px 0">';
        function sec(tag, h, b) {
            return '<div class="nsp-ts"><div class="nsp-tt">' + tag + '</div>' +
                   '<h4 class="nsp-th">' + h + '</h4>' + b + '</div>' + D;
        }
        function p(t) { return '<p class="nsp-tp">' + t + '</p>'; }
        function w(t) { return '<div class="nsp-tw">' + t + '</div>'; }
        return [
            sec('01 // Định nghĩa', 'Thuật ngữ',
                p('"<strong>Wiki</strong>" — Nền tảng M.A.P.L.E tại maple-wiki.miraheze.org do BQT vận hành.') +
                p('"<strong>Thành viên</strong>" — Bất kỳ cá nhân truy cập hoặc sử dụng Wiki.')),
            sec('02 // Tài khoản', 'Đăng ký & bảo mật',
                p('<strong>Một người — một tài khoản chính.</strong> Tài khoản phụ phải được BQT phê duyệt.') +
                p('Tên người dùng không được mạo danh, phân biệt đối xử, hoặc chứa thông tin người khác.') +
                w('<strong>Tuổi tối thiểu 13+</strong> theo quy định Miraheze. Người dưới 13 tuổi không được đăng ký. Khai gian tuổi = vi phạm, tài khoản bị xóa ngay.')),
            sec('03 // Ứng xử', 'Quy tắc cốt lõi',
                w('<strong>Nghiêm cấm tuyệt đối:</strong> Phân biệt đối xử · Quấy rối · Doxxing · Đe dọa bạo lực · Nội dung xâm hại trẻ em (CSAM) · Spam · Mạo danh.') +
                p('Vi phạm: cảnh báo → cách ly 14 ngày → khóa vĩnh viễn. Một số vi phạm bị khóa ngay.')),
            sec('04 // Nội dung & Giấy phép', 'MCL v1 / M BY-SA 1.0',
                p('Bài đăng chịu giấy phép <strong>MCL v1 / M BY-SA 1.0</strong>. Bài đã đăng thuộc Wiki vĩnh viễn — chỉ có thể archive, không xóa vĩnh viễn.') +
                p('Chỉ <strong>Writer</strong> (RP ≥ 200, được BQT phê duyệt) được tạo bài. Mọi bài qua hàng chờ duyệt bắt buộc.')),
            sec('05 // Dữ liệu', 'Quyền riêng tư',
                p('Wiki thu thập: tên TK, email (qua Miraheze), lịch sử chỉnh sửa, IP (log hệ thống). M.A.P.L.E <strong>không bán</strong> dữ liệu. Áp dụng Miraheze Privacy Policy.')),
            sec('06 // Điều khoản', 'Thay đổi & cập nhật',
                p('Thay đổi lớn thông báo trước ≥ 7 ngày qua What\'s New. Tiếp tục sử dụng sau cập nhật = chấp nhận phiên bản mới.')),
        ].join('');
    }

    /* ── Render ── */
    function render() {
        var mwForm = document.querySelector(
            '#userlogin2, #userlogin, form[name="userlogin2"], .mw-htmlform, form[id^="mw-createaccount"]'
        );
        if (!mwForm) return;
        mwForm.classList.add('nsp-mw-hidden');

        var logoHTML = (window.MAPLE && window.MAPLE.logoSVG) ? window.MAPLE.logoSVG(52) : '';

        var wrap = document.createElement('div');
        wrap.id = 'nsp-wrap';
        wrap.innerHTML =
            /* Brand */
            '<div id="nsp-brand">' +
            '  <div id="nsp-brand-logo">' + logoHTML + '</div>' +
            '  <div id="nsp-eyebrow">M.A.P.L.E Wiki — Tạo tài khoản</div>' +
            '  <h1 id="nsp-title">GIA NHẬP <em>M.A.P.L.E</em></h1>' +
            '  <p id="nsp-sub">Miễn phí · Mãi mãi · Cộng đồng sáng tạo lore The Maze.</p>' +
            '</div>' +

            /* Steps */
            '<div id="nsp-steps">' +
            '<div class="nsp-step active" id="nsp-s1"><div class="nsp-step-dot">1</div><div class="nsp-step-label">Thông tin</div></div>' +
            '<div class="nsp-step" id="nsp-s2"><div class="nsp-step-dot">2</div><div class="nsp-step-label">Độ tuổi</div></div>' +
            '<div class="nsp-step" id="nsp-s3"><div class="nsp-step-dot">3</div><div class="nsp-step-label">Điều khoản</div></div>' +
            '</div>' +

            '<div id="nsp-err"></div>' +

            /* Panel 1 — Thông tin */
            '<div class="nsp-panel" id="nsp-p1">' +
            '<div class="nsp-ph"><div class="nsp-pt">01 // Thông tin</div><h2>Tạo tài khoản</h2></div>' +
            '<div class="nsp-pb">' +
            '<div class="nsp-f"><label class="nsp-lbl" for="nsp-u">Tên người dùng<span class="req">*</span></label>' +
            '<input class="nsp-inp" id="nsp-u" type="text" autocomplete="username" placeholder="VD: MapleFan2026" maxlength="85">' +
            '<div class="nsp-hint">Chỉ dùng chữ cái, số, dấu gạch dưới. Không thay đổi được sau đăng ký.</div>' +
            '<div class="nsp-ferr" id="nsp-eu"></div></div>' +
            '<div class="nsp-f"><label class="nsp-lbl" for="nsp-em">Email<span class="req">*</span></label>' +
            '<input class="nsp-inp" id="nsp-em" type="email" autocomplete="email" placeholder="email@example.com">' +
            '<div class="nsp-hint">Dùng để xác minh tài khoản. Có thể ẩn khỏi công khai.</div>' +
            '<div class="nsp-ferr" id="nsp-eem"></div></div>' +
            '<div class="nsp-f"><label class="nsp-lbl" for="nsp-pw">Mật khẩu<span class="req">*</span></label>' +
            '<input class="nsp-inp" id="nsp-pw" type="password" autocomplete="new-password" placeholder="Tối thiểu 8 ký tự">' +
            '<div class="nsp-ferr" id="nsp-epw"></div></div>' +
            '<div class="nsp-f"><label class="nsp-lbl" for="nsp-pw2">Xác nhận mật khẩu<span class="req">*</span></label>' +
            '<input class="nsp-inp" id="nsp-pw2" type="password" autocomplete="new-password" placeholder="Nhập lại mật khẩu">' +
            '<div class="nsp-ferr" id="nsp-epw2"></div></div>' +
            '<div class="nsp-nav"><button class="nsp-btn nsp-next" id="nsp-n1">TIẾP THEO →</button></div>' +
            '<div class="nsp-notice">Đã có tài khoản? <a href="/wiki/Special:UserLogin">Đăng nhập →</a></div>' +
            '</div></div>' +

            /* Panel 2 — Độ tuổi */
            '<div class="nsp-panel" id="nsp-p2" style="display:none">' +
            '<div class="nsp-ph"><div class="nsp-pt">02 // Độ tuổi</div><h2>Xác nhận độ tuổi</h2></div>' +
            '<div class="nsp-pb">' +
            '<div id="nsp-age-grid">' +
            '<div class="nsp-ac" data-age="13"><div class="nsp-ac-num">13+</div><div class="nsp-ac-sub">Cơ bản</div></div>' +
            '<div class="nsp-ac" data-age="16"><div class="nsp-ac-num">16+</div><div class="nsp-ac-sub">Nội dung nặng</div></div>' +
            '<div class="nsp-ac" data-age="18"><div class="nsp-ac-num">18+</div><div class="nsp-ac-sub">Người lớn</div></div>' +
            '</div>' +
            '<div id="nsp-age-note">← Chọn mức độ tuổi phù hợp với bạn.</div>' +
            '<div style="margin-top:8px;font-size:7.5px;color:#3f3f46;letter-spacing:.07em;line-height:1.7">' +
            '⚠ Người dưới <strong style="color:#52525b">13 tuổi</strong> không được đăng ký theo quy định Miraheze. Khai gian tuổi = vi phạm điều khoản.' +
            '</div>' +
            '<div class="nsp-nav">' +
            '<button class="nsp-btn nsp-back" id="nsp-b2">← QUAY LẠI</button>' +
            '<button class="nsp-btn nsp-next" id="nsp-n2" disabled>TIẾP THEO →</button>' +
            '</div></div></div>' +

            /* Panel 3 — Điều khoản */
            '<div class="nsp-panel" id="nsp-p3" style="display:none">' +
            '<div class="nsp-ph"><div class="nsp-pt">03 // Điều khoản</div><h2>Đọc & đồng ý</h2></div>' +
            '<div class="nsp-pb">' +
            '<div id="nsp-tos-scroll">' + tosHTML() + '</div>' +
            '<div id="nsp-scroll-hint">↓ Cuộn xuống để đọc toàn bộ điều khoản</div>' +
            '<div class="nsp-cr" id="nsp-c1" role="checkbox" aria-checked="false" tabindex="0">' +
            '<div class="nsp-ck">✓</div>' +
            '<div class="nsp-ct">Tôi đã đọc và đồng ý với <strong>Điều Khoản Người Dùng</strong> của M.A.P.L.E Wiki.</div>' +
            '</div>' +
            '<div class="nsp-cr" id="nsp-c2" role="checkbox" aria-checked="false" tabindex="0">' +
            '<div class="nsp-ck">✓</div>' +
            '<div class="nsp-ct">Tôi xác nhận mình đủ <strong id="nsp-age-confirm">13 tuổi</strong> trở lên và chịu trách nhiệm nếu khai gian.</div>' +
            '</div>' +
            '<div class="nsp-cr" id="nsp-c3" role="checkbox" aria-checked="false" tabindex="0">' +
            '<div class="nsp-ck">✓</div>' +
            '<div class="nsp-ct">Tôi hiểu bài viết đăng lên được cấp phép <strong>MCL v1 / M BY-SA 1.0</strong> và thuộc Wiki vĩnh viễn.</div>' +
            '</div>' +
            '<div class="nsp-nav">' +
            '<button class="nsp-btn nsp-back" id="nsp-b3">← QUAY LẠI</button>' +
            '<button class="nsp-btn nsp-sub" id="nsp-sb" disabled>ĐĂNG KÝ →</button>' +
            '</div>' +
            '<div class="nsp-notice">' +
            'Đọc đầy đủ: <a href="/wiki/%C4%90i%E1%BB%81u_Kho%E1%BA%A3n" target="_blank">Điều Khoản Người Dùng</a> · ' +
            '<a href="/wiki/%C4%90i%E1%BB%81u_Kho%E1%BA%A3n/Gi%E1%BB%9Bi_H%E1%BA%A1n_Tu%E1%BB%95i" target="_blank">Chính sách Độ Tuổi</a> · ' +
            '<a href="/wiki/D%E1%BB%B1_%C3%A1n:B%E1%BA%A3n_quy%E1%BB%81n/Gi%E1%BA%A5y_ph%C3%A9p/MCLv1" target="_blank">MCL v1</a>' +
            '</div>' +
            '</div></div>';

        var host = document.querySelector('#mw-content-text') || document.body;
        host.insertBefore(wrap, host.firstChild);

        /* ── State ── */
        var selectedAge = null;
        var ck = [false, false, false];

        /* ── Step helper ── */
        function goStep(n) {
            document.getElementById('nsp-p1').style.display = n === 1 ? '' : 'none';
            document.getElementById('nsp-p2').style.display = n === 2 ? '' : 'none';
            document.getElementById('nsp-p3').style.display = n === 3 ? '' : 'none';
            [1, 2, 3].forEach(function (i) {
                var el = document.getElementById('nsp-s' + i);
                el.classList.toggle('active', i === n);
                el.classList.toggle('done', i < n);
                el.querySelector('.nsp-step-dot').textContent = i < n ? '✓' : String(i);
            });
            document.getElementById('nsp-err').classList.remove('show');
            wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function showErr(msg) {
            var el = document.getElementById('nsp-err');
            el.textContent = msg; el.classList.add('show');
        }

        /* ── Validate step 1 ── */
        function ferr(inp, errId, msg) {
            var e = document.getElementById(errId);
            e.textContent = msg; e.classList.toggle('show', !!msg);
            inp.classList.toggle('error', !!msg);
            return !msg;
        }
        function v1() {
            var u  = document.getElementById('nsp-u');
            var em = document.getElementById('nsp-em');
            var pw = document.getElementById('nsp-pw');
            var p2 = document.getElementById('nsp-pw2');
            var ok = true;
            ok = ferr(u,  'nsp-eu',   !u.value.trim() ? 'Vui lòng nhập tên người dùng.' : u.value.trim().length < 2 ? 'Tối thiểu 2 ký tự.' : '') && ok;
            ok = ferr(em, 'nsp-eem',  !em.value.trim() ? 'Vui lòng nhập email.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value.trim()) ? 'Email không hợp lệ.' : '') && ok;
            ok = ferr(pw, 'nsp-epw',  !pw.value ? 'Vui lòng nhập mật khẩu.' : pw.value.length < 8 ? 'Tối thiểu 8 ký tự.' : '') && ok;
            ok = ferr(p2, 'nsp-epw2', p2.value !== pw.value ? 'Mật khẩu không khớp.' : '') && ok;
            return ok;
        }

        /* ── Age cards ── */
        var ageNotes = {
            13: '13+ — Nội dung cơ bản phù hợp mọi đối tượng. Nội dung 16+ và 18+ sẽ bị ẩn tự động.',
            16: '16+ — Bao gồm nội dung bạo lực điều độ và chủ đề tâm lý nặng. Người 13–15 nên có sự đồng ý của phụ huynh.',
            18: '18+ — Toàn bộ nội dung bao gồm nội dung người lớn. Chỉ chọn nếu bạn thực sự ≥ 18 tuổi — khai gian là vi phạm điều khoản.'
        };
        wrap.querySelectorAll('.nsp-ac').forEach(function (card) {
            card.addEventListener('click', function () {
                wrap.querySelectorAll('.nsp-ac').forEach(function (c) { c.classList.remove('sel'); });
                card.classList.add('sel');
                selectedAge = parseInt(card.getAttribute('data-age'), 10);
                document.getElementById('nsp-n2').disabled = false;
                document.getElementById('nsp-age-note').textContent = ageNotes[selectedAge] || '';
                var ac = document.getElementById('nsp-age-confirm');
                if (ac) ac.textContent = selectedAge + ' tuổi';
            });
        });

        /* ── Checkboxes ── */
        ['nsp-c1', 'nsp-c2', 'nsp-c3'].forEach(function (id, i) {
            var row = document.getElementById(id);
            function toggle() {
                ck[i] = !ck[i];
                row.classList.toggle('chk', ck[i]);
                row.setAttribute('aria-checked', String(ck[i]));
                document.getElementById('nsp-sb').disabled = !(ck[0] && ck[1] && ck[2]);
            }
            row.addEventListener('click', toggle);
            row.addEventListener('keydown', function (e) {
                if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
            });
        });

        /* Scroll hint */
        var scrolled = false;
        document.getElementById('nsp-tos-scroll').addEventListener('scroll', function () {
            if (!scrolled) { document.getElementById('nsp-scroll-hint').classList.add('hidden'); scrolled = true; }
        }, { passive: true });

        /* ── Nav buttons ── */
        document.getElementById('nsp-n1').addEventListener('click', function () {
            if (!v1()) { showErr('Vui lòng điền đầy đủ và chính xác thông tin.'); return; }
            goStep(2);
        });
        document.getElementById('nsp-b2').addEventListener('click', function () { goStep(1); });
        document.getElementById('nsp-n2').addEventListener('click', function () {
            if (!selectedAge) { showErr('Vui lòng chọn độ tuổi.'); return; }
            goStep(3);
        });
        document.getElementById('nsp-b3').addEventListener('click', function () { goStep(2); });

        /* ── Submit ── */
        document.getElementById('nsp-sb').addEventListener('click', function () {
            if (!(ck[0] && ck[1] && ck[2])) { showErr('Vui lòng tích đủ cả 3 ô xác nhận.'); return; }

            /* Lưu tuổi + đánh dấu TOS đã đồng ý để DieuKhoan-Popup không hiện lại */
            try {
                localStorage.setItem('maple_signup_age', String(selectedAge));
                var tosVer = (window.MAPLE && window.MAPLE.tosVersion) ? window.MAPLE.tosVersion : '2.0';
                localStorage.setItem('maple_tos_seen', tosVer);
            } catch (e) {}

            /* Điền vào form MediaWiki gốc */
            var map = {
                wpName:    document.getElementById('nsp-u').value.trim(),
                wpPassword: document.getElementById('nsp-pw').value,
                wpRetype:   document.getElementById('nsp-pw2').value,
                wpEmail:    document.getElementById('nsp-em').value.trim()
            };
            Object.keys(map).forEach(function (k) {
                var inp = mwForm.querySelector('[name="' + k + '"]');
                if (inp) inp.value = map[k];
            });
            var hi = document.createElement('input');
            hi.type = 'hidden'; hi.name = 'wpMapleAge'; hi.value = String(selectedAge);
            mwForm.appendChild(hi);

            /* Hiện lại form và submit */
            mwForm.classList.remove('nsp-mw-hidden');
            var sb = mwForm.querySelector('[name="wpCreateaccount"], button[type="submit"], input[type="submit"]');
            if (sb) sb.click(); else mwForm.submit();
        });
    }

    function init() {
        injectCSS();
        if (typeof mw !== 'undefined' && mw.loader) {
            mw.loader.using('mediawiki.util').then(render).catch(render);
        } else {
            render();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
