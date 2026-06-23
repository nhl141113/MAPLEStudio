/* ============================================
   M.A.P.L.E — MediaWiki:KhangCao.js
   Trang Dự án:Kháng Cáo và trang kháng cáo cá nhân của người dùng
   Yêu cầu: TroGiup-Common.js (window.MHHelp) đã nạp trước (Common.js lo).
   ============================================ */
(function () {
    'use strict';

    var BACKEND_URL = window.MAPLE_APPEAL_BACKEND_URL || 'http://localhost:5000';

    function withLogo(MH, heroEl) {
        var logo = (window.MAPLE && window.MAPLE.logoSVG) ? window.MAPLE.logoSVG(56) : '';
        heroEl.insertBefore(MH.el('div', 'mhd3-hero-logo', logo), heroEl.firstChild);
        return heroEl;
    }

    /* ── CSS inline cho form kháng cáo ── */
    function injectCSS() {
        if (document.getElementById('kc-style')) return;
        var s = document.createElement('style');
        s.id = 'kc-style';
        s.textContent = [
            '.kc-form{display:flex;flex-direction:column;gap:16px;margin-top:16px}',
            '.kc-field{display:flex;flex-direction:column;gap:6px}',
            '.kc-lbl{font-size:8px;letter-spacing:.22em;color:#52525b;text-transform:uppercase;',
            'font-family:"JetBrains Mono",ui-monospace,monospace}',
            '.kc-req{color:#ef4444}',
            '.kc-inp,.kc-ta,.kc-sel{font-family:"JetBrains Mono",ui-monospace,monospace;',
            'font-size:11px;background:#050505;border:1px solid #1a1a1a;color:#e4e4e7;',
            'padding:9px 12px;outline:none;transition:border-color .15s;',
            'width:100%;box-sizing:border-box;line-height:1.6}',
            '.kc-inp:focus,.kc-ta:focus,.kc-sel:focus{border-color:#ef4444}',
            '.kc-sel{appearance:none;-webkit-appearance:none;cursor:pointer;',
            'background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\'%3E%3Cpath d=\'M0 0l5 6 5-6z\' fill=\'%2352525b\'/%3E%3C/svg%3E");',
            'background-repeat:no-repeat;background-position:right 12px center}',
            '.kc-ta{resize:vertical;min-height:110px}',
            '.kc-hint{font-size:8.5px;color:#52525b;letter-spacing:.04em;',
            'font-family:"JetBrains Mono",ui-monospace,monospace}',
            '.kc-cc{font-size:8.5px;color:#52525b;text-align:right;letter-spacing:.08em;',
            'font-family:"JetBrains Mono",ui-monospace,monospace}',
            '.kc-msg{font-size:9.5px;letter-spacing:.06em;padding:8px 12px;border-left:3px solid;',
            'display:none;font-family:"JetBrains Mono",ui-monospace,monospace;line-height:1.6}',
            '.kc-msg.kc-err{border-left-color:#ef4444;background:rgba(239,68,68,.06);color:#fca5a5}',
            '.kc-msg.kc-ok{border-left-color:#22c55e;background:rgba(34,197,94,.06);color:#86efac}',
            '.kc-msg.kc-info{border-left-color:#3b82f6;background:rgba(59,130,246,.05);color:#93c5fd}',
            '.kc-submit{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:9.5px;',
            'letter-spacing:.18em;font-weight:700;text-transform:uppercase;padding:11px 24px;',
            'background:#ef4444;color:#fff;border:none;cursor:pointer;transition:all .15s;',
            'align-self:flex-start}',
            '.kc-submit:hover:not(:disabled){background:#dc2626}',
            '.kc-submit:disabled{opacity:.4;cursor:not-allowed}',
            '.kc-status-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}',
            '.kc-chip{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:9px;',
            'letter-spacing:.1em;padding:4px 12px;border:1px solid #1e1e1e;',
            'background:transparent;color:#52525b;cursor:pointer;transition:all .15s}',
            '.kc-chip:hover{border-color:#ef4444;color:#e4e4e7}',
            '.kc-chip.kc-active{border-color:#ef4444;background:rgba(239,68,68,.08);color:#ef4444}',
            '.kc-divider{border:none;border-top:1px solid #111;margin:8px 0}',
            /* Timeline trạng thái xử lý */
            '.kc-timeline{list-style:none;margin:12px 0 0;padding:0;position:relative}',
            '.kc-timeline::before{content:"";position:absolute;left:8px;top:6px;bottom:6px;',
            'width:1px;background:#1a1a1a}',
            '.kc-tl-item{display:flex;gap:14px;align-items:flex-start;padding:8px 0;position:relative}',
            '.kc-tl-dot{flex-shrink:0;width:17px;height:17px;border-radius:50%;border:1px solid #52525b;',
            'background:#0a0a0a;display:flex;align-items:center;justify-content:center;',
            'font-size:8px;z-index:1;margin-top:1px}',
            '.kc-tl-dot.kc-dot-active{border-color:#ef4444;background:rgba(239,68,68,.12);color:#ef4444}',
            '.kc-tl-dot.kc-dot-done{border-color:#22c55e;background:rgba(34,197,94,.1);color:#4ade80}',
            '.kc-tl-body{flex:1}',
            '.kc-tl-main{font-size:10px;color:#a1a1aa;letter-spacing:.04em;font-weight:600}',
            '.kc-tl-sub{font-size:9px;color:#52525b;line-height:1.6;margin-top:2px}'
        ].join('');
        document.head.appendChild(s);
    }

    function build(MH) {
        injectCSS();

        MH.mount(function (page) {
            var normalizedPage = (mw.config.get('wgPageName') || '').replace(/_/g, ' ');
            var match = normalizedPage.match(/^Thảo luận Thành viên:([^/]+)$/);
            var appealCode = new URLSearchParams(window.location.search).get('maple_appeal');

            if (match && appealCode) {
                var username = match[1];
                buildUserAppeal(MH, page, username, appealCode);
            } else {
                buildDefaultAppeal(MH, page);
            }
        });
    }

    /* ── Render trang Kháng cáo cá nhân (Cho tài khoản bị khóa) ── */
    function buildUserAppeal(MH, page, username, appealCode) {
        page.appendChild(withLogo(MH, MH.hero({
            crumb:   'Nộp kháng cáo cá nhân',
            eyebrow: 'MÃ KHÁNG CÁO: ' + appealCode,
            title:   'KHÁNG <em>CÁO</em>',
            sub:     'Tài khoản: ' + username + ' // Vui lòng nhập thông tin kháng cáo bên dưới.'
        })));

        var s1 = MH.section({ tag: '01 <em>//</em> Khai báo', heading: 'Thông tin Kháng Cáo' });

        var wrap = document.createElement('div');
        wrap.className = 'kc-form';

        // 1. Email field
        var emailFld = document.createElement('div');
        emailFld.className = 'kc-field';
        emailFld.innerHTML = 
            '<label class="kc-lbl">Địa chỉ Email (Gmail) <span class="kc-req">*</span></label>' +
            '<input type="email" class="kc-inp" id="kc-email" placeholder="Ví dụ: name@gmail.com" required>' +
            '<div class="kc-hint">Địa chỉ email để nhận kết quả duyệt và mã OTP mở khoá.</div>';
        wrap.appendChild(emailFld);

        // 2. Reason field
        var reasonFld = document.createElement('div');
        reasonFld.className = 'kc-field';
        reasonFld.innerHTML = 
            '<label class="kc-lbl">Lý do kháng cáo <span class="kc-req">*</span></label>' +
            '<textarea class="kc-ta" id="kc-reason" rows="6" placeholder="Trình bày chi tiết lý do của bạn..." required></textarea>' +
            '<div class="kc-cc" id="kc-reason-cc">0 / 2000</div>' +
            '<div class="kc-hint">Nhập tối thiểu 30 ký tự. Vui lòng giữ thái độ tôn trọng BQT.</div>';
        
        var ta = reasonFld.querySelector('#kc-reason');
        var cc = reasonFld.querySelector('#kc-reason-cc');
        ta.addEventListener('input', function () {
            cc.textContent = ta.value.length + ' / 2000';
        });
        wrap.appendChild(reasonFld);

        // 3. Message & Submit
        var msgEl = document.createElement('div');
        msgEl.className = 'kc-msg';
        wrap.appendChild(msgEl);

        var subBtn = document.createElement('button');
        subBtn.type = 'button';
        subBtn.className = 'kc-submit';
        subBtn.textContent = 'GỬI YÊU CẦU KHÁNG CÁO →';
        wrap.appendChild(subBtn);

        s1.appendChild(wrap);
        page.appendChild(s1);

        // Submit logic
        subBtn.addEventListener('click', function () {
            var email = wrap.querySelector('#kc-email').value.trim();
            var reason = ta.value.trim();

            if (!email) {
                showMsg('err', 'Vui lòng nhập địa chỉ Email.');
                wrap.querySelector('#kc-email').focus();
                return;
            }

            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMsg('err', 'Địa chỉ Email không hợp lệ.');
                wrap.querySelector('#kc-email').focus();
                return;
            }

            if (reason.length < 30) {
                showMsg('err', 'Lý do quá ngắn — vui lòng nhập tối thiểu 30 ký tự.');
                ta.focus();
                return;
            }

            subBtn.disabled = true;
            subBtn.textContent = 'ĐANG GỬI...';
            showMsg('info', 'Đang thực hiện lưu dữ liệu kháng cáo lên Wiki...');

            // Bước 1: Lưu trực tiếp dữ liệu dạng JSON lên trang Wiki của người dùng
            var api = new mw.Api();
            api.get({ action: 'query', meta: 'tokens', type: 'csrf', format: 'json' })
                .done(function (d) {
                    var token = d.query && d.query.tokens && d.query.tokens.csrftoken;
                    if (!token || token === '+\\') {
                        showMsg('err', 'Không lấy được token chỉnh sửa từ Wiki. Vui lòng F5 trang.');
                        resetBtn();
                        return;
                    }

                    var meta = {
                        username: username,
                        email: email,
                        reason: reason,
                        code: appealCode,
                        status: 'pending',
                        timestamp: new Date().toISOString()
                    };

                    var pageTitle = 'Thảo_luận_Thành_viên:' + username;
                    var pageText = '<!-- MAPLE_APPEAL_JSON: ' + JSON.stringify(meta, null, 2) + ' -->\n[[Thể loại:Yêu cầu kháng cáo Maple]]';

                    api.post({
                        action: 'edit',
                        title: pageTitle,
                        text: pageText,
                        summary: 'Lưu đơn kháng cáo tài khoản dạng JSON [M.A.P.L.E]',
                        token: token,
                        format: 'json'
                    }).done(function () {
                        showSuccess(username, email, appealCode);
                    }).fail(function (errCode, errData) {
                        resetBtn();
                        var errMsg = errData && errData.error && errData.error.info ? errData.error.info : errCode;
                        showMsg('err', 'Không thể tạo trang kháng cáo trên Wiki: ' + errMsg);
                    });
                })
                .fail(function () {
                    resetBtn();
                    showMsg('err', 'Lỗi khi lấy token xác thực từ Wiki.');
                });
        });

        function resetBtn() {
            subBtn.disabled = false;
            subBtn.textContent = 'GỬI YÊU CẦU KHÁNG CÁO →';
        }

        function showMsg(type, txt) {
            msgEl.className = 'kc-msg ' + (type === 'err' ? 'kc-err' : type === 'ok' ? 'kc-ok' : 'kc-info');
            msgEl.textContent = txt;
            msgEl.style.display = 'block';
        }

        function showSuccess(usr, eml, code) {
            wrap.innerHTML =
                '<div style="text-align:center;padding:32px 20px;font-family:\'JetBrains Mono\',monospace">' +
                '<div style="width:48px;height:48px;border-radius:50%;border:1px solid #166534;' +
                'background:rgba(34,197,94,.1);color:#4ade80;font-size:22px;display:flex;' +
                'align-items:center;justify-content:center;margin:0 auto 16px">✓</div>' +
                '<div style="font-size:1rem;font-weight:800;letter-spacing:.1em;color:#f4f4f5;margin-bottom:8px">ĐÃ GỬI KHÁNG CÁO THÀNH CÔNG</div>' +
                '<div style="font-size:9.5px;color:#52525b;line-height:1.8;max-width:360px;margin:0 auto 14px">' +
                'Mã kháng cáo: <strong style="color:#ef4444">' + code + '</strong><br>' +
                'Tài khoản: <strong style="color:#a1a1aa">' + usr + '</strong><br>' +
                'Email thông báo: <strong style="color:#a1a1aa">' + eml + '</strong><br>' +
                'Vui lòng quay lại màn hình thông báo bị chặn để theo dõi kết quả. ' +
                'Khi được phê duyệt, mã OTP xác nhận sẽ được gửi tới Email của bạn.' +
                '</div>' +
                '<button class="kc-submit" id="kc-btn-back" style="margin: 0 auto; display: block">Quay lại trang bị chặn</button>' +
                '</div>';

            wrap.querySelector('#kc-btn-back').addEventListener('click', function () {
                window.location.href = mw.config.get('wgServer') + '/wiki/Trang_Ch%C3%ADnh';
            });
        }
    }

    /* ── Render trang Kháng cáo mặc định (Cho tài khoản thường xem) ── */
    function buildDefaultAppeal(MH, page) {
        page.appendChild(withLogo(MH, MH.hero({
            crumb:   'Kháng cáo',
            eyebrow: 'Quy trình kháng cáo — M.A.P.L.E Wiki',
            title:   'KHÁNG <em>CÁO</em>',
            sub:     'Bạn cho rằng quyết định xử lý vi phạm không đúng? Gửi kháng cáo theo quy trình này — BQT sẽ xem xét lại.'
        })));

        /* 01 — Điều kiện */
        var s1 = MH.section({ tag: '01 <em>//</em> Điều kiện', heading: 'Khi nào được kháng cáo?' });
        s1.appendChild(MH.prose([
            'Bạn có quyền kháng cáo bất kỳ quyết định xử lý vi phạm nào từ BQT: cảnh báo, cách ly, ' +
            'hoặc chấm dứt tài khoản — <strong>trong vòng 7 ngày kể từ khi quyết định được đưa ra.</strong>',
            'Kháng cáo không phải cơ chế phủ nhận mọi quyết định — mà là cơ hội để bạn trình bày ' +
            'góc nhìn của mình nếu quyết định đó thiếu bằng chứng, có sai sót về quy trình, hoặc không tương xứng với vi phạm.'
        ]));
        s1.appendChild(MH.infobox(
            '<strong>Không thể kháng cáo:</strong> Các trường hợp bị khoá ngay lập tức do vi phạm Điều 4.5 ' +
            '(CSAM, doxxing, đe doạ bạo lực nghiêm trọng) — những vi phạm này không có ngoại lệ.', true));
        page.appendChild(s1);

        /* 02 — Quy trình */
        var s2 = MH.section({ tag: '02 <em>//</em> Quy trình', heading: 'Các bước xử lý kháng cáo' });

        var timeline = document.createElement('ul');
        timeline.className = 'kc-timeline';

        var steps = [
            { dot: '1', state: 'active', main: 'Gửi kháng cáo', sub: 'Điền form bên dưới hoặc liên hệ BQT trực tiếp qua MAPLE Chat/Gmail. Kèm đầy đủ thông tin và bằng chứng.' },
            { dot: '2', state: '', main: 'BQT tiếp nhận (48 giờ)', sub: 'BQT xác nhận đã nhận kháng cáo và chỉ định thành viên xem xét độc lập (không phải người ra quyết định gốc).' },
            { dot: '3', state: '', main: 'Xem xét & điều tra (72 giờ)', sub: 'Kiểm tra lại bằng chứng, lịch sử vi phạm, quy trình xử lý gốc và lập luận của bạn.' },
            { dot: '4', state: '', main: 'Phán quyết cuối cùng', sub: 'BQT thông báo kết quả qua MAPLE Chat hoặc trang thảo luận. Giữ nguyên, giảm nhẹ, hoặc huỷ quyết định gốc.' }
        ];

        steps.forEach(function (st) {
            var li = document.createElement('li');
            li.className = 'kc-tl-item';
            li.innerHTML =
                '<div class="kc-tl-dot' + (st.state ? ' kc-dot-' + st.state : '') + '">' + st.dot + '</div>' +
                '<div class="kc-tl-body">' +
                '<div class="kc-tl-main">' + st.main + '</div>' +
                '<div class="kc-tl-sub">' + st.sub + '</div>' +
                '</div>';
            timeline.appendChild(li);
        });
        s2.appendChild(timeline);
        page.appendChild(s2);

        /* 03 — Lưu ý */
        var s3 = MH.section({ tag: '03 <em>//</em> Lưu ý', heading: 'Trước khi gửi kháng cáo' });
        s3.appendChild(MH.steps([
            { main: 'Kháng cáo phải có nội dung', sub: 'Đơn giản nói "oan" hoặc "không công bằng" không đủ. Cần chỉ rõ: điều gì sai, bằng chứng nào hỗ trợ, và kết quả mong muốn.' },
            { main: 'Giữ thái độ bình tĩnh', sub: 'Kháng cáo mang tính công kích BQT sẽ không được xem xét và có thể làm tình hình xấu hơn.' },
            { main: 'Không spam kháng cáo', sub: 'Gửi nhiều đơn kháng cáo cho cùng một vụ việc → cộng thêm 1 mức xử phạt theo Điều khoản Người Dùng.' },
            { main: 'Quyết định của BQT là cuối cùng', sub: 'Sau khi xem xét kháng cáo hợp lệ, phán quyết của BQT là quyết định cuối cùng trong phạm vi Wiki.' }
        ]));
        page.appendChild(s3);

        /* 04 — Form */
        var s4 = MH.section({ tag: '04 <em>//</em> Gửi kháng cáo', heading: 'Form kháng cáo' });
        s4.appendChild(buildForm(MH));
        page.appendChild(s4);

        /* 05 — Liên hệ thay thế */
        var s5 = MH.section({ tag: '05 <em>//</em> Liên hệ', heading: 'Không muốn dùng form?' });
        s5.appendChild(MH.prose([
            'Bạn có thể gửi kháng cáo trực tiếp qua các kênh sau — đảm bảo đính kèm đủ thông tin ' +
            '(tên tài khoản, quyết định bị kháng cáo, lý do, bằng chứng).'
        ]));
        s5.appendChild(MH.steps([
            { main: 'MAPLE Chat', sub: 'Nhắn trực tiếp cho tài khoản BQT trong Wiki. Phản hồi nhanh nhất.' },
            { main: 'Gmail', sub: 'mapleofficialvn@gmail.com — dành cho trường hợp không thể đăng nhập Wiki.' },
            { main: 'Discord', sub: 'Server chính thức M.A.P.L.E — kênh #kháng-cáo (nếu có).' }
        ]));
        page.appendChild(s5);

        page.appendChild(MH.stuck({
            tag:  'Cần hỗ trợ trước khi kháng cáo?',
            text: 'Đọc lại Điều Khoản Người Dùng và Quy Tắc để hiểu rõ cơ sở của quyết định.'
        }));
    }

    function buildForm(MH) {
        if (typeof mw === 'undefined') return MH.prose(['Đăng nhập để sử dụng form kháng cáo.']);

        var isLoggedIn = !!(mw.config.get('wgUserId'));
        var userName   = mw.config.get('wgUserName') || '';

        if (!isLoggedIn) {
            var w = document.createElement('div');
            w.appendChild(MH.infobox('Bạn cần <strong>đăng nhập</strong> để gửi kháng cáo. ' +
                'Nếu tài khoản đã bị khoá, sử dụng kênh Gmail hoặc Discord bên dưới.', true));
            return w;
        }

        var wrap = document.createElement('div');
        wrap.className = 'kc-form';

        /* Loại kháng cáo */
        var typeField = document.createElement('div'); typeField.className = 'kc-field';
        typeField.innerHTML = '<label class="kc-lbl">Loại quyết định bị kháng cáo <span class="kc-req">*</span></label>';
        var typeRow = document.createElement('div'); typeRow.className = 'kc-status-row';
        var types = [
            { id: 'warning',     label: 'Cảnh báo (Mức 1)' },
            { id: 'isolation',   label: 'Cách ly (Mức 2)'  },
            { id: 'termination', label: 'Chấm dứt (Mức 3)' },
            { id: 'other',       label: 'Quyết định khác'  }
        ];
        var selType = 'warning';
        types.forEach(function (t) {
            var b = document.createElement('button');
            b.type = 'button'; b.className = 'kc-chip' + (t.id === selType ? ' kc-active' : '');
            b.setAttribute('data-id', t.id); b.textContent = t.label;
            b.addEventListener('click', function () {
                selType = t.id;
                typeRow.querySelectorAll('.kc-chip').forEach(function (x) {
                    x.classList.toggle('kc-active', x.getAttribute('data-id') === selType);
                });
            });
            typeRow.appendChild(b);
        });
        typeField.appendChild(typeRow);
        wrap.appendChild(typeField);

        /* Địa chỉ Email */
        var emailFld = mkField('Địa chỉ Email (Gmail) <span class="kc-req">*</span>', 'Địa chỉ email để nhận kết quả duyệt và mã OTP mở khoá.');
        var emailInp = document.createElement('input');
        emailInp.type = 'email'; emailInp.className = 'kc-inp';
        emailInp.placeholder = 'Ví dụ: name@gmail.com'; emailInp.required = true;
        emailFld.appendChild(emailInp);
        wrap.appendChild(emailFld);

        /* Ngày quyết định */
        var dateFld = mkField('Ngày quyết định bị kháng cáo <span class="kc-req">*</span>');
        var dateInp = document.createElement('input');
        dateInp.type = 'date'; dateInp.className = 'kc-inp'; dateInp.maxLength = 20;
        dateFld.appendChild(dateInp);
        wrap.appendChild(dateFld);

        /* Ai ra quyết định */
        var byFld = mkField('Người/nhóm ra quyết định (nếu biết)');
        var byInp = document.createElement('input');
        byInp.type = 'text'; byInp.className = 'kc-inp';
        byInp.placeholder = 'Tên tài khoản BQT hoặc "Không rõ"'; byInp.maxLength = 100;
        byFld.appendChild(byInp);
        wrap.appendChild(byFld);

        /* Lý do kháng cáo */
        var reasonFld = mkField('Lý do kháng cáo <span class="kc-req">*</span>', 'Chỉ rõ điều gì sai, quy trình nào bị vi phạm, hoặc quyết định không tương xứng ở điểm nào.');
        var reasonTa = document.createElement('textarea');
        reasonTa.className = 'kc-ta'; reasonTa.rows = 5; reasonTa.maxLength = 2000;
        reasonTa.placeholder = 'Trình bày cụ thể: sự việc xảy ra thế nào, lý do bạn cho là xử lý không đúng, bằng chứng bạn có…';
        var reasonCc = document.createElement('div'); reasonCc.className = 'kc-cc'; reasonCc.textContent = '0 / 2000';
        reasonTa.addEventListener('input', function () { reasonCc.textContent = reasonTa.value.length + ' / 2000'; });
        reasonFld.appendChild(reasonTa);
        reasonFld.appendChild(reasonCc);
        wrap.appendChild(reasonFld);

        /* Kết quả mong muốn */
        var expectFld = mkField('Kết quả mong muốn <span class="kc-req">*</span>');
        var expectSel = document.createElement('select'); expectSel.className = 'kc-sel';
        [
            ['', '— Chọn kết quả —'],
            ['cancel',  'Huỷ toàn bộ quyết định'],
            ['reduce',  'Giảm nhẹ mức xử phạt'],
            ['explain', 'Giải thích rõ lý do quyết định'],
            ['review',  'Xem xét lại quy trình']
        ].forEach(function (opt) {
            var o = document.createElement('option');
            o.value = opt[0]; o.textContent = opt[1];
            expectSel.appendChild(o);
        });
        expectFld.appendChild(expectSel);
        wrap.appendChild(expectFld);

        /* Bằng chứng */
        var evFld = mkField('Bằng chứng / thông tin bổ sung', 'Đường dẫn trang, tên phiên Chat, thời gian cụ thể hoặc bất kỳ thông tin nào hỗ trợ kháng cáo.');
        var evTa = document.createElement('textarea');
        evTa.className = 'kc-ta'; evTa.rows = 3; evTa.maxLength = 1000;
        evTa.placeholder = 'Dán link, mô tả ảnh chụp màn hình, hoặc trích dẫn nội dung liên quan…';
        evFld.appendChild(evTa);
        wrap.appendChild(evFld);

        /* Msg + submit */
        var msgEl = document.createElement('div'); msgEl.className = 'kc-msg';
        var subBtn = document.createElement('button');
        subBtn.type = 'button'; subBtn.className = 'kc-submit'; subBtn.textContent = 'NỘP KHÁNG CÁO →';

        wrap.appendChild(msgEl);
        wrap.appendChild(subBtn);

        /* ── Submit logic ── */
        subBtn.addEventListener('click', function () {
            var reason = reasonTa.value.trim();
            var expect = expectSel.value;
            var date   = dateInp.value.trim();
            var email  = emailInp.value.trim();

            if (!email)           { showMsg('err', 'Vui lòng nhập địa chỉ Email.'); emailInp.focus(); return; }
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) { showMsg('err', 'Địa chỉ Email không hợp lệ.'); emailInp.focus(); return; }
            if (!date)            { showMsg('err', 'Vui lòng nhập ngày ra quyết định.'); dateInp.focus(); return; }
            if (reason.length < 30) { showMsg('err', 'Lý do kháng cáo quá ngắn — cần ít nhất 30 ký tự.'); reasonTa.focus(); return; }
            if (!expect)          { showMsg('err', 'Vui lòng chọn kết quả mong muốn.'); expectSel.focus(); return; }

            subBtn.disabled = true; subBtn.textContent = 'ĐANG GỬI…';
            showMsg('info', 'Đang xử lý…');

            var now  = new Date();
            var id   = 'KC-' + now.getFullYear() + pad(now.getMonth()+1) + pad(now.getDate()) + '-' + String(now.getTime()).slice(-5);
            var ts   = now.toISOString();
            var typeLabel = { warning:'Cảnh báo', isolation:'Cách ly', termination:'Chấm dứt', other:'Khác' };
            var expectLabel = { cancel:'Huỷ quyết định', reduce:'Giảm nhẹ', explain:'Giải thích', review:'Xem xét lại' };

            var meta = {
                username: userName,
                email: email,
                reason: reason,
                code: id,
                status: 'pending',
                timestamp: ts,
                type: selType,
                decisionDate: date,
                decidedBy: byInp.value.trim() || 'Không rõ',
                expectation: expect,
                evidence: evTa.value.trim()
            };

            var pageText = '<!-- MAPLE_APPEAL_JSON: ' + JSON.stringify(meta, null, 2) + ' -->\n[[Thể loại:Yêu cầu kháng cáo Maple]]';

            var api = new mw.Api();
            api.get({ action: 'query', meta: 'tokens', type: 'csrf', format: 'json' })
                .done(function (d) {
                    var token = d.query && d.query.tokens && d.query.tokens.csrftoken;
                    if (!token || token === '+\\') {
                        showMsg('err', 'Không lấy được token. Vui lòng tải lại trang.'); resetBtn(); return;
                    }
                    var pageTitle = 'Thảo_luận_Thành_viên:' + userName;
                    api.post({
                        action: 'edit',
                        title:  pageTitle,
                        text:   pageText,
                        summary: '[KC] ' + (typeLabel[selType] || selType) + ' — ' + userName,
                        token:  token,
                        format: 'json'
                    }).done(function () {
                        showSuccess(id);
                    }).fail(function (errCode, errData) {
                        console.error('API Edit Failed:', errCode, errData);
                        var errMsg = errData && errData.error && errData.error.info ? errData.error.info : errCode;
                        showMsg('err', 'Lưu thất bại: ' + errMsg + '. Thử lại sau hoặc liên hệ BQT trực tiếp.'); resetBtn();
                    });
                }).fail(function () {
                    showMsg('err', 'Lỗi kết nối. Kiểm tra mạng và thử lại.'); resetBtn();
                });
        });

        function mkField(lbl, hint) {
            var d = document.createElement('div'); d.className = 'kc-field';
            var l = document.createElement('label'); l.className = 'kc-lbl'; l.innerHTML = lbl;
            d.appendChild(l);
            if (hint) { var h = document.createElement('div'); h.className = 'kc-hint'; h.textContent = hint; d.appendChild(h); }
            return d;
        }
        function pad(n) { return n < 10 ? '0' + n : String(n); }
        function showMsg(type, txt) {
            msgEl.className = 'kc-msg ' + (type === 'err' ? 'kc-err' : type === 'ok' ? 'kc-ok' : 'kc-info');
            msgEl.textContent = txt; msgEl.style.display = 'block';
        }
        function resetBtn() {
            subBtn.disabled = false; subBtn.textContent = 'NỘP KHÁNG CÁO →';
        }
        function showSuccess(id) {
            wrap.innerHTML =
                '<div style="text-align:center;padding:32px 20px;font-family:\'JetBrains Mono\',monospace">' +
                '<div style="width:48px;height:48px;border-radius:50%;border:1px solid #166534;' +
                'background:rgba(34,197,94,.1);color:#4ade80;font-size:22px;display:flex;' +
                'align-items:center;justify-content:center;margin:0 auto 16px">✓</div>' +
                '<div style="font-size:1rem;font-weight:800;letter-spacing:.1em;color:#f4f4f5;margin-bottom:8px">ĐÃ NHẬN KHÁNG CÁO</div>' +
                '<div style="font-size:9.5px;color:#52525b;line-height:1.8;max-width:360px;margin:0 auto 14px">' +
                'Mã kháng cáo: <strong style="color:#a1a1aa">' + id + '</strong><br>' +
                'BQT sẽ xem xét và phản hồi trong vòng <strong style="color:#a1a1aa">48–120 giờ</strong>.<br>' +
                'Theo dõi kết quả tại trang thảo luận tài khoản của bạn.' +
                '</div>' +
                '<a href="/wiki/D%E1%BB%B9_%C3%A1n:Kh%C3%A1ng_c%C3%A1o/' + id + '" ' +
                'style="font-size:8.5px;letter-spacing:.14em;color:#3b82f6;text-decoration:none">' +
                'Xem trang kháng cáo →</a>' +
                '</div>';
        }

        return wrap;
    }

    if (window.MHHelp) build(window.MHHelp);
    else if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(build);
})();
