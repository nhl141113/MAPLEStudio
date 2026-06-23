/**
 * M.A.P.L.E — MediaWiki:MAPLE-Blocked.js
 * Màn hình thông báo tài khoản bị khoá/ban — thay thế trang blocked mặc định của MediaWiki.
 *
 * Kích hoạt khi: trang chứa .mw-blockedtext (MediaWiki inject khi user bị block).
 */
(function () {
    'use strict';

    var BACKEND_URL = window.MAPLE_APPEAL_BACKEND_URL || 'http://localhost:5000';

    function init() {
        if (typeof mw === 'undefined') return;
        if (mw.config.get('wgAction') !== 'view') return;

        /* Chỉ kích hoạt khi có .mw-blockedtext */
        var blockedEl = document.querySelector('.mw-blockedtext, #mw-blocked-message, .permissions-errors');
        if (!blockedEl) return;

        var userName  = mw.config.get('wgUserName') || '';
        var homeURL   = '/wiki/Trang_Ch%C3%ADnh';

        injectCSS();

        // 1. Tạo hoặc lấy mã kháng cáo ngẫu nhiên
        var randomCode = sessionStorage.getItem('maple_appeal_code');
        if (!randomCode) {
            randomCode = 'KC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            sessionStorage.setItem('maple_appeal_code', randomCode);
        }

        // Đường dẫn kháng cáo cá nhân
        var appealURL = mw.config.get('wgServer') + mw.config.get('wgArticlePath')
            .replace('$1', 'Thảo_luận_Thành_viên:' + encodeURIComponent(userName)) + '?maple_appeal=' + randomCode;

        /* Lấy thông tin block từ API */
        fetchBlockInfo(userName, function (blockData) {
            // 2. Lấy thông tin OTP từ wiki
            fetchOTPList(function (otpList) {
                var userOtp = otpList[userName] || null;

                // 3. Lấy trạng thái kháng cáo từ backend
                fetchAppealStatus(userName, function (appealData) {
                    render(blockData, homeURL, appealURL, randomCode, userOtp, appealData);
                });
            });
        });
    }

    /* ── Fetch block info ── */
    function fetchBlockInfo(user, cb) {
        if (!user || typeof $ === 'undefined') { cb(null); return; }

        $.getJSON(mw.config.get('wgScriptPath') + '/api.php', {
            action:  'query',
            list:    'blocks',
            bkusers: user,
            bkprop:  'user|by|reason|expiry|timestamp|flags',
            format:  'json',
            origin:  '*'
        }).done(function (data) {
            var blocks = data && data.query && data.query.blocks;
            cb((blocks && blocks.length) ? blocks[0] : null);
        }).fail(function () { cb(null); });
    }

    /* ── Fetch OTP list from Wiki JSON page ── */
    function fetchOTPList(cb) {
        if (typeof $ === 'undefined') { cb({}); return; }
        $.ajax({
            url: mw.config.get('wgServer') + mw.config.get('wgScript') + '?title=MediaWiki:Maple-Blocked-OTPs.json&action=raw&ctype=application/json',
            dataType: 'json',
            cache: false
        }).done(function (data) {
            cb(data || {});
        }).fail(function () {
            cb({});
        });
    }

    /* ── Fetch Appeal Status from Python Backend ── */
    /* ── Fetch Appeal Status from Wiki Page ── */
    function fetchAppealStatus(user, cb) {
        if (!user || typeof $ === 'undefined') { cb(null); return; }
        var pageTitle = 'Thảo_luận_Thành_viên:' + user;
        $.getJSON(mw.config.get('wgScriptPath') + '/api.php', {
            action: 'query',
            titles: pageTitle,
            prop: 'revisions',
            rvprop: 'content',
            rvslots: '*',
            format: 'json',
            origin: '*'
        }).done(function (data) {
            var pages = data && data.query && data.query.pages;
            var p = pages && (pages[-1] ? null : Object.values(pages)[0]);
            if (p && p.revisions && p.revisions[0]) {
                var content = p.revisions[0].slots.main['*'] || p.revisions[0].slots.main.content || '';
                var match = content.match(/<!-- MAPLE_APPEAL_JSON:\s*(\{[\s\S]*?\})\s*-->/);
                if (match) {
                    try {
                        var meta = JSON.parse(match[1]);
                        cb(meta);
                        return;
                    } catch (e) {}
                }
            }
            cb(null);
        }).fail(function () { cb(null); });
    }

    /* ── Render màn hình ── */
    function render(block, homeURL, appealURL, appealCode, activeOtp, appealData) {
        /* Parse dữ liệu */
        var reason  = (block && block.reason)  ? block.reason  : 'Không có lý do cụ thể.';
        var blocker = (block && block.by)       ? block.by      : 'Ban Quản Trị';
        var expiry  = (block && block.expiry)   ? block.expiry  : null; /* 'infinity' hoặc ISO date */
        var since   = (block && block.timestamp)? block.timestamp: null;

        var isPermanent = !expiry || expiry === 'infinity' || expiry === 'infinite';
        var expiryDate  = isPermanent ? null : new Date(expiry);
        var sinceDate   = since ? new Date(since) : null;

        /* Ẩn UI mặc định */
        injectHideCSS();

        var target = document.getElementById('mw-content-text')
                   || document.querySelector('.mw-parser-output')
                   || document.getElementById('content');
        if (!target) return;

        /* Build HTML */
        var logoHTML = (window.MAPLE && window.MAPLE.logoSVG) ? window.MAPLE.logoSVG(96) : defaultLogo();

        // 1. Dòng thông báo khóa theo yêu cầu
        var banMessageHTML = '';
        if (isPermanent) {
            banMessageHTML = '<div class="blk-ban-msg blk-permanent">Bạn đã bị chặn vô thời hạn</div>';
        } else {
            var timeRemainingText = expiryDate ? getDurationText(expiryDate.getTime() - Date.now()) : '--';
            var startText = sinceDate ? fmtDate(sinceDate) : '?';
            var endText = expiryDate ? fmtDate(expiryDate) : '?';

            banMessageHTML = 
                '<div class="blk-ban-msg">' +
                    'Bạn đã bị chặn vì: <strong class="blk-highlight">' + esc(reason) + '</strong><br>' +
                    'Bạn còn: <span class="blk-highlight" id="blk-time-left">' + timeRemainingText + '</span> ' +
                    '(tính từ <span class="blk-meta-time">' + startText + '</span> đến <span class="blk-meta-time">' + endText + '</span>)' +
                '</div>';
        }

        // 2. Phần đếm ngược
        var countdownHTML = '';
        if (!isPermanent && expiryDate) {
            countdownHTML = 
                '<div class="blk-expiry-label">ĐẾM NGƯỢC THỜI GIAN MỞ KHÓA</div>' +
                '<div class="blk-countdown" id="blk-countdown">' +
                    '<div class="blk-cd-block"><span class="blk-cd-num" id="blk-cd-d">--</span><span class="blk-cd-unit">ngày</span></div>' +
                    '<div class="blk-cd-sep">:</div>' +
                    '<div class="blk-cd-block"><span class="blk-cd-num" id="blk-cd-h">--</span><span class="blk-cd-unit">giờ</span></div>' +
                    '<div class="blk-cd-sep">:</div>' +
                    '<div class="blk-cd-block"><span class="blk-cd-num" id="blk-cd-m">--</span><span class="blk-cd-unit">phút</span></div>' +
                    '<div class="blk-cd-sep">:</div>' +
                    '<div class="blk-cd-block"><span class="blk-cd-num" id="blk-cd-s">--</span><span class="blk-cd-unit">giây</span></div>' +
                '</div>';
        }

        // 3. Phần Kháng cáo & OTP
        var appealHTML = '';
        if (activeOtp) {
            // Có OTP hoạt động trong file JSON -> yêu cầu nhập OTP
            appealHTML = 
                '<div class="blk-appeal-box blk-approved">' +
                    '<div class="blk-appeal-title">✓ KHÁNG CÁO ĐÃ ĐƯỢC CHẤP THUẬN</div>' +
                    '<div class="blk-appeal-desc">Vui lòng kiểm tra Gmail của bạn để lấy mã OTP và nhập vào khung bên dưới để kích hoạt mở khóa tài khoản:</div>' +
                    '<div class="blk-otp-form">' +
                        '<input type="text" class="blk-otp-input" id="blk-otp-input" placeholder="MAPLE-XXXXXX" maxlength="15">' +
                        '<button class="blk-btn blk-btn-otp" id="blk-btn-otp">Xác nhận OTP</button>' +
                    '</div>' +
                    '<div class="blk-otp-msg" id="blk-otp-msg"></div>' +
                '</div>';
        } else if (appealData && appealData.status === 'pending') {
            // Đã gửi kháng cáo và đang chờ duyệt
            appealHTML = 
                '<div class="blk-appeal-box blk-pending">' +
                    '<div class="blk-appeal-title">⚡ KHÁNG CÁO ĐANG CHỜ DUYỆT</div>' +
                    '<div class="blk-appeal-desc">Kháng cáo của bạn (Mã: <strong style="color:#ef4444">' + appealData.code + '</strong>) đã được lưu nhận. Admin đang trong quá trình xem xét hồ sơ của bạn. Vui lòng quay lại sau.</div>' +
                '</div>';
        } else if (appealData && appealData.status === 'rejected') {
            // Kháng cáo bị từ chối
            appealHTML = 
                '<div class="blk-appeal-box blk-rejected">' +
                    '<div class="blk-appeal-title">❌ KHÁNG CÁO BỊ TỪ CHỐI</div>' +
                    '<div class="blk-appeal-desc">Rất tiếc, yêu cầu kháng cáo của bạn đã bị từ chối.<br>' +
                    'Lý do: <strong style="color:#fca5a5">' + esc(appealData.reject_reason || 'Không có lý do cụ thể.') + '</strong></div>' +
                    '<div style="margin-top: 14px;">' +
                        '<div class="blk-appeal-q">Bạn muốn thử gửi kháng cáo lại?</div>' +
                        '<a class="blk-btn blk-btn-appeal" id="blk-btn-reappeal" href="javascript:void(0)">GỬI LẠI KHÁNG CÁO</a>' +
                    '</div>' +
                '</div>';
        } else {
            // Chưa gửi kháng cáo
            appealHTML = 
                '<div class="blk-appeal-box">' +
                    '<div class="blk-appeal-q">Chúng tôi có nhầm lẫn sao?</div>' +
                    '<a class="blk-btn blk-btn-appeal" href="' + appealURL + '">KHÁNG CÁO</a>' +
                    '<div class="blk-appeal-alt">Kháng cáo sẽ được lưu tại trang thảo luận của bạn: <br><span style="color:#71717a">Thảo luận Thành viên:' + esc(mw.config.get('wgUserName')) + '?maple_appeal=' + appealCode + '</span></div>' +
                '</div>';
        }

        target.innerHTML =
            '<div class="blk-outer" id="blk-outer">' +
            '<div class="blk-card" id="blk-card">' +
            '<div class="blk-vline"></div>' +
            '<div class="blk-scan"></div>' +
            '<div class="blk-logo">' + logoHTML + '</div>' +
            '<div class="blk-code">ERR :: ACCOUNT_SUSPENDED</div>' +
            '<div class="blk-title">TÀI KHOẢN BỊ <em>KHOÁ</em></div>' +
            '<div class="blk-divider"><div class="blk-diamond"></div></div>' +
            
            banMessageHTML +
            countdownHTML +
            
            '<div class="blk-meta">' +
                '<div class="blk-meta-row"><span class="blk-meta-k">Lý do gốc</span><span class="blk-meta-v blk-meta-reason">' + esc(reason) + '</span></div>' +
                '<div class="blk-meta-row"><span class="blk-meta-k">Người khóa</span><span class="blk-meta-v">' + esc(blocker) + '</span></div>' +
            '</div>' +
            
            appealHTML +
            
            '<div class="blk-footer">' +
                '<span>M.A.P.L.E DATABASE</span>' +
                '<span>STATUS: SUSPENDED</span>' +
            '</div>' +
            '</div></div>';

        /* Đếm ngược */
        if (!isPermanent && expiryDate) {
            startCountdown(expiryDate);
        }

        // Gắn sự kiện nút Gửi lại kháng cáo
        var reappealBtn = document.getElementById('blk-btn-reappeal');
        if (reappealBtn) {
            reappealBtn.addEventListener('click', function() {
                sessionStorage.removeItem('maple_appeal_code');
                window.location.reload();
            });
        }

        // Gắn sự kiện nút Xác nhận OTP
        var otpBtn = document.getElementById('blk-btn-otp');
        if (otpBtn) {
            otpBtn.addEventListener('click', function() {
                var user = mw.config.get('wgUserName') || '';
                var enteredOtp = document.getElementById('blk-otp-input').value.trim();
                var msgEl = document.getElementById('blk-otp-msg');

                function showOtpMsg(txt, type) {
                    msgEl.textContent = txt;
                    msgEl.className = 'blk-otp-msg blk-msg-' + type;
                    msgEl.style.display = 'block';
                }

                if (!enteredOtp) {
                    showOtpMsg('Vui lòng nhập mã OTP.', 'error');
                    return;
                }

                // Chuẩn hóa OTP người dùng nhập (nếu nhập thiếu tiền tố MAPLE-)
                var checkOtp = enteredOtp.toUpperCase();
                if (checkOtp.indexOf('MAPLE-') === 0) {
                    checkOtp = checkOtp.replace('MAPLE-', '');
                }

                if (checkOtp !== activeOtp.toUpperCase()) {
                    showOtpMsg('Mã OTP không chính xác. Vui lòng kiểm tra lại Gmail.', 'error');
                    return;
                }

                otpBtn.disabled = true;
                otpBtn.textContent = 'ĐANG XỬ LÝ...';
                showOtpMsg('Đang gửi yêu cầu mở khóa lên hệ thống Wiki...', 'info');

                var api = new mw.Api();
                api.get({
                    action: 'query',
                    titles: 'Thảo_luận_Thành_viên:' + user,
                    prop: 'revisions',
                    rvprop: 'content',
                    rvslots: '*',
                    meta: 'tokens',
                    type: 'csrf',
                    format: 'json'
                }).done(function (d) {
                    var token = d.query && d.query.tokens && d.query.tokens.csrftoken;
                    var pages = d.query && d.query.pages;
                    var p = pages && Object.values(pages)[0];
                    if (!p || !p.revisions || !p.revisions[0]) {
                        showOtpMsg('Lỗi: Không tìm thấy nội dung đơn kháng cáo trên Wiki.', 'error');
                        otpBtn.disabled = false;
                        otpBtn.textContent = 'Xác nhận OTP';
                        return;
                    }
                    var content = p.revisions[0].slots.main['*'] || p.revisions[0].slots.main.content || '';
                    var match = content.match(/<!-- MAPLE_APPEAL_JSON:\s*(\{[\s\S]*?\})\s*-->/);
                    if (!match) {
                        showOtpMsg('Lỗi: Cấu trúc đơn kháng cáo bị hỏng.', 'error');
                        otpBtn.disabled = false;
                        otpBtn.textContent = 'Xác nhận OTP';
                        return;
                    }
                    try {
                        var meta = JSON.parse(match[1]);
                        meta.status = 'pending_unblock';
                        meta.entered_otp = checkOtp;

                        var updatedContent = content.replace(match[0], '<!-- MAPLE_APPEAL_JSON: ' + JSON.stringify(meta, null, 2) + ' -->');

                        api.post({
                            action: 'edit',
                            title: 'Thảo_luận_Thành_viên:' + user,
                            text: updatedContent,
                            summary: 'Yêu cầu mở khóa bằng mã OTP [M.A.P.L.E]',
                            token: token,
                            format: 'json'
                        }).done(function () {
                            showOtpMsg('✓ Yêu cầu mở khóa đã được gửi! Đang chờ Bot xử lý (khoảng 15-30 giây)...', 'success');
                            
                            // Polling kiểm tra trạng thái mỗi 5 giây
                            var checkInterval = setInterval(function () {
                                fetchAppealStatus(user, function (updatedMeta) {
                                    if (updatedMeta) {
                                        if (updatedMeta.status === 'unblocked') {
                                            clearInterval(checkInterval);
                                            showOtpMsg('✓ Tài khoản của bạn đã được mở khóa thành công! Đang tải lại trang...', 'success');
                                            setTimeout(function() {
                                                window.location.href = homeURL;
                                            }, 2000);
                                        } else if (updatedMeta.error_message) {
                                            clearInterval(checkInterval);
                                            showOtpMsg('Mở khóa thất bại: ' + updatedMeta.error_message, 'error');
                                            otpBtn.disabled = false;
                                            otpBtn.textContent = 'Xác nhận OTP';
                                        }
                                    }
                                });
                            }, 5000);
                        }).fail(function (errCode, errData) {
                            var errMsg = errData && errData.error && errData.error.info ? errData.error.info : errCode;
                            showOtpMsg('Gửi yêu cầu thất bại: ' + errMsg, 'error');
                            otpBtn.disabled = false;
                            otpBtn.textContent = 'Xác nhận OTP';
                        });
                    } catch (e) {
                        showOtpMsg('Lỗi xử lý dữ liệu đơn.', 'error');
                        otpBtn.disabled = false;
                        otpBtn.textContent = 'Xác nhận OTP';
                    }
                }).fail(function () {
                    showOtpMsg('Lỗi kết nối API Wiki.', 'error');
                    otpBtn.disabled = false;
                    otpBtn.textContent = 'Xác nhận OTP';
                });
            });
        }
    }

    /* ── Countdown ── */
    function startCountdown(target) {
        function tick() {
            var now  = Date.now();
            var diff = target.getTime() - now;

            if (diff <= 0) {
                /* Hết hạn — reload để MediaWiki tự bỏ block */
                window.location.reload();
                return;
            }

            var d  = Math.floor(diff / 86400000);
            var h  = Math.floor((diff % 86400000) / 3600000);
            var m  = Math.floor((diff % 3600000)  / 60000);
            var s  = Math.floor((diff % 60000)    / 1000);

            setText('blk-cd-d', pad(d));
            setText('blk-cd-h', pad(h));
            setText('blk-cd-m', pad(m));
            setText('blk-cd-s', pad(s));

            // Cập nhật text thời gian còn lại
            var timeLeftEl = document.getElementById('blk-time-left');
            if (timeLeftEl) {
                timeLeftEl.textContent = getDurationText(diff);
            }
        }

        tick();
        setInterval(tick, 1000);
    }

    /* ── CSS ── */
    function injectCSS() {
        if (document.getElementById('blk-style')) return;
        var s = document.createElement('style');
        s.id = 'blk-style';
        s.textContent = [
            /* Fullscreen layout */
            '.blk-outer{position:relative;min-height:100vh;display:flex;align-items:center;',
            'justify-content:center;padding:40px 20px;',
            'background:#020202;background-image:radial-gradient(#1a1a1a 1px,transparent 1px);',
            'background-size:24px 24px;font-family:"JetBrains Mono",ui-monospace,monospace;',
            'animation:blk-fade .3s ease}',
            '@keyframes blk-fade{from{opacity:0}to{opacity:1}}',
            '@keyframes blk-pop{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:none}}',

            /* Card */
            '.blk-card{position:relative;width:min(560px,100%);background:#060606;',
            'border:1px solid #1a1a1a;border-top:2px solid #ef4444;',
            'box-shadow:0 32px 100px rgba(0,0,0,.8);padding:40px 36px 32px;text-align:center;',
            'overflow:hidden;animation:blk-pop .3s cubic-bezier(.22,1,.36,1)}',

            /* Decorative */
            '.blk-vline{position:absolute;left:0;top:0;bottom:0;width:2px;',
            'background:linear-gradient(to bottom,#ef4444,transparent 60%)}',
            '.blk-scan{position:absolute;inset:0;pointer-events:none;',
            'background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,.012) 3px,rgba(255,255,255,.012) 4px)}',

            /* Logo */
            '.blk-logo{margin-bottom:20px}',

            /* Code */
            '.blk-code{font-size:8.5px;letter-spacing:.22em;color:#52525b;margin-bottom:12px}',

            /* Title */
            '.blk-title{font-size:clamp(1.2rem,4vw,1.8rem);font-weight:800;letter-spacing:.08em;',
            'color:#f4f4f5;text-transform:uppercase;line-height:1.2;margin-bottom:0}',
            '.blk-title em{color:#ef4444;font-style:normal}',

            /* Divider */
            '.blk-divider{display:flex;align-items:center;gap:12px;margin:20px 0;',
            'color:#1a1a1a}',
            '.blk-divider::before,.blk-divider::after{content:"";flex:1;height:1px;background:#1a1a1a}',
            '.blk-diamond{width:7px;height:7px;border:1px solid #52525b;transform:rotate(45deg);flex-shrink:0}',

            /* Ban Message */
            '.blk-ban-msg{font-size:11px;color:#a1a1aa;line-height:1.8;padding:16px 20px;',
            'border:1px solid #27272a;background:#09090b;margin-bottom:20px;text-align:left}',
            '.blk-highlight{color:#ef4444;font-weight:bold}',
            '.blk-meta-time{color:#e4e4e7;border-bottom:1px dashed #52525b;padding-bottom:1px}',
            '.blk-permanent{font-size:12px;letter-spacing:.06em;color:#ef4444;',
            'border-color:#3f0000;background:rgba(239,68,68,.04);text-align:center;font-weight:800}',

            /* Countdown */
            '.blk-expiry-label{font-size:7.5px;letter-spacing:.25em;color:#52525b;margin-bottom:14px}',
            '.blk-countdown{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:22px}',
            '.blk-cd-block{display:flex;flex-direction:column;align-items:center;min-width:52px}',
            '.blk-cd-num{font-size:2rem;font-weight:700;color:#f4f4f5;line-height:1;',
            'font-variant-numeric:tabular-nums;letter-spacing:-.02em}',
            '.blk-cd-unit{font-size:7px;letter-spacing:.2em;color:#52525b;text-transform:uppercase;margin-top:3px}',
            '.blk-cd-sep{font-size:1.6rem;font-weight:700;color:#52525b;align-self:flex-start;margin-top:4px}',

            /* Meta */
            '.blk-meta{text-align:left;border:1px solid #111;margin:16px 0 20px;',
            'background:#040404}',
            '.blk-meta-row{display:flex;align-items:flex-start;gap:0;border-bottom:1px solid #0d0d0d}',
            '.blk-meta-row:last-child{border-bottom:none}',
            '.blk-meta-k{flex-shrink:0;width:110px;font-size:8px;letter-spacing:.18em;',
            'color:#52525b;padding:8px 12px;border-right:1px solid #111;',
            'text-transform:uppercase;line-height:1.5}',
            '.blk-meta-v{font-size:9.5px;color:#71717a;padding:8px 12px;line-height:1.7;flex:1}',
            '.blk-meta-reason{color:#a1a1aa}',

            /* Appeal & OTP */
            '.blk-appeal-box{margin-top:20px;border:1px solid #1a1a1a;padding:20px;background:rgba(239,68,68,.02);text-align:left}',
            '.blk-appeal-title{font-size:10px;font-weight:bold;letter-spacing:.12em;margin-bottom:8px;color:#f4f4f5}',
            '.blk-appeal-desc{font-size:9.5px;color:#71717a;line-height:1.7;margin-bottom:14px}',
            '.blk-appeal-q{font-size:9.5px;letter-spacing:.12em;color:#52525b;margin-bottom:10px;text-align:center}',
            '.blk-appeal-alt{font-size:8px;letter-spacing:.05em;color:#52525b;line-height:1.6;margin-top:10px;text-align:center}',
            
            '.blk-approved{border-color:#166534;background:rgba(34,197,94,.02)}',
            '.blk-approved .blk-appeal-title{color:#4ade80}',
            '.blk-pending{border-color:#ca8a04;background:rgba(234,179,8,.02)}',
            '.blk-pending .blk-appeal-title{color:#fde047}',
            '.blk-rejected{border-color:#991b1b;background:rgba(239,68,68,.03)}',
            '.blk-rejected .blk-appeal-title{color:#fca5a5}',

            /* Buttons */
            '.blk-btn{display:block;font-family:"JetBrains Mono",monospace;font-size:9px;',
            'letter-spacing:.18em;font-weight:700;text-transform:uppercase;text-decoration:none!important;',
            'padding:11px 20px;border:1px solid;cursor:pointer;transition:all .16s;',
            'text-align:center}',
            '.blk-btn-appeal{background:#ef4444;color:#fff!important;border-color:#ef4444}',
            '.blk-btn-appeal:hover{background:#dc2626;border-color:#dc2626;box-shadow:0 0 20px rgba(239,68,68,.35)}',
            
            /* OTP Form */
            '.blk-otp-form{display:flex;gap:8px;margin-top:12px}',
            '.blk-otp-input{flex:1;background:#050505;border:1px solid #1a1a1a;color:#e4e4e7;',
            'font-family:"JetBrains Mono",monospace;font-size:11px;padding:9px 12px;outline:none;transition:border-color .15s}',
            '.blk-otp-input:focus{border-color:#22c55e}',
            '.blk-btn-otp{background:#22c55e;color:#fff!important;border-color:#22c55e;padding:9px 18px;font-size:9.5px}',
            '.blk-btn-otp:hover{background:#16a34a;border-color:#16a34a;box-shadow:0 0 15px rgba(34,197,94,.3)}',
            '.blk-otp-msg{font-size:9px;margin-top:10px;padding:8px 12px;border-left:2px solid;display:none;line-height:1.5}',
            '.blk-msg-error{border-color:#ef4444;background:rgba(239,68,68,.04);color:#fca5a5}',
            '.blk-msg-info{border-color:#3b82f6;background:rgba(59,130,246,.04);color:#93c5fd}',
            '.blk-msg-success{border-color:#22c55e;background:rgba(34,197,94,.04);color:#86efac}',

            /* Footer */
            '.blk-footer{display:flex;justify-content:space-between;margin-top:24px;',
            'font-size:7px;letter-spacing:.2em;color:#1e1e1e;text-transform:uppercase}',

            '@media(max-width:480px){',
            '.blk-card{padding:28px 18px 24px}',
            '.blk-cd-num{font-size:1.6rem}.blk-cd-block{min-width:40px}',
            '.blk-meta-k{width:90px}',
            '.blk-otp-form{flex-direction:column}}',
        ].join('');
        document.head.appendChild(s);
    }

    function injectHideCSS() {
        if (document.getElementById('blk-hide-style')) return;
        var s = document.createElement('style');
        s.id = 'blk-hide-style';
        s.textContent =
            '.vector-column-start,#mw-panel,.vector-main-menu-container,' +
            '#p-associated-pages,.mw-portlet-associated-pages,.vector-menu-tabs,' +
            '.vector-page-titlebar,.vector-header-container,header.mw-header,' +
            '.vector-sticky-header,#vector-sticky-header,#footer,' +
            '.mw-footer-container,#mw-head,#mw-head-base,#mw-page-base,' +
            '.vector-page-toolbar-container,.mw-body-header,' +
            '.vector-page-toolbar,.vector-column-end,' +
            '#firstHeading,.mw-indicators,#siteSub,#contentSub,' +
            '.mw-blockedtext,.mw-blocked-message,.permissions-errors{display:none!important}' +
            '.mw-page-container,#mw-content-text,.mw-body,#content,' +
            '.vector-column-content,.mw-page-container-inner{' +
            'padding:0!important;margin:0!important;max-width:100%!important;' +
            'width:100%!important;background:#020202!important;' +
            'border:none!important;box-shadow:none!important}' +
            'html,body{background:#020202!important}';
        document.head.appendChild(s);
    }

    /* ── Helpers ── */
    function pad(n) { return String(n).padStart(2, '0'); }
    function setText(id, val) {
        var el = document.getElementById(id);
        if (el) el.textContent = val;
    }
    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
        });
    }
    function fmtDate(d) {
        if (!d || isNaN(d.getTime())) return '?';
        return d.getFullYear() + '-' +
               pad(d.getMonth() + 1) + '-' +
               pad(d.getDate()) + ' ' +
               pad(d.getHours()) + ':' +
               pad(d.getMinutes());
    }
    function getDurationText(diffMs) {
        var diff = Math.max(0, diffMs);
        var d  = Math.floor(diff / 86400000);
        var h  = Math.floor((diff % 86400000) / 3600000);
        var m  = Math.floor((diff % 3600000)  / 60000);
        var s  = Math.floor((diff % 60000)    / 1000);

        var parts = [];
        if (d > 0) parts.push(d + ' ngày');
        if (h > 0) parts.push(h + ' giờ');
        if (m > 0) parts.push(m + ' phút');
        if (parts.length === 0 || s > 0) parts.push(s + ' giây');
        return parts.join(' ');
    }
    function defaultLogo() {
        return '<svg width="96" height="96" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M50 5L95 40L80 95H20L5 40L50 5Z" stroke="#450a0a" stroke-width="0.8" opacity="0.6"/>' +
            '<path d="M50 15V85M50 15L85 45L50 40L15 45L50 15Z" stroke="#ef4444" stroke-width="2" stroke-linejoin="miter"/>' +
            '<path d="M30 60L50 85L70 60" stroke="#ef4444" stroke-width="2"/>' +
            '<circle cx="50" cy="40" r="5.5" fill="#ef4444"/>' +
            '</svg>';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
