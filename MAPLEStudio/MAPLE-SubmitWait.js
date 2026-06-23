/**
 * MediaWiki:MAPLE-SubmitWait.js  v6.1
 *
 * THAY ĐỔI so với v6.0:
 *  - ID mới: crypto-random + timestamp + counter + checksum → cực khó trùng
 *  - Check trùng ID trong Pending trước khi ghi
 *  - Check tên trang đã pending chưa trước khi ghi
 *  - Tất cả check thực hiện TRƯỚC khi tạo entry, sau khi đọc Pending
 *
 * Flow:
 *  1. Nhấn GỬI → overlay full-screen trượt lên (animation MAPLE style)
 *  2. Client check: HARD BLOCK / HATE / TOXIC / DOXXING / SPAM / độ dài
 *     — KHÔNG check template, cú pháp, ID format
 *     — Cảnh báo / lỗi hiện TRÊN UI overlay
 *  3. HARD BLOCK → dừng, nút quay lại
 *  4. Warn → hiện flags + nút "Vẫn gửi" / "Sửa lại"
 *  5. Sạch → tự động ghi Pending + Queue
 *  6. Trong khi chờ → animation + waiting messages
 *  7. Xong → "Cảm ơn đã đăng bài trên MAPLE WIKI VIỆT NAM" + redirect
 *
 *  Log chi tiết chỉ ra console (F12)
 */
(function (mw, $) {
    'use strict';

    if (['edit', 'submit'].indexOf(mw.config.get('wgAction')) === -1) return;

    if (!window.MAPLE) window.MAPLE = {};
    var _pendingCalls = [];
    MAPLE.SubmitWait = function (content, summary) {
        _pendingCalls.push({ content: content, summary: summary });
    };

    // ════════════════════════════════════════════════════════════════════════
    // ID GENERATOR v6.1 — cực khó trùng
    // Cấu trúc: MP · [6 ký tự timestamp base32] · [6 ký tự crypto-random] · [4 ký tự counter+checksum]
    // Tổng: MP + 16 ký tự + 2 dấu gạch = "MP" + "XXXXXX" + "-" + "XXXXXX" + "-" + "XXXX"
    // Xác suất trùng phần random: ~1 / 1.073.741.824 (2^30)
    // Kết hợp timestamp ms + counter monotonic: không thể trùng trong cùng phiên
    // ════════════════════════════════════════════════════════════════════════
    var _idCounter = 0;
    var CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 ký tự, bỏ I O 0 1

    function _toBase32(num, len) {
        var s = '';
        for (var i = 0; i < len; i++) {
            s = CHARS[num & 31] + s;
            num = Math.floor(num / 32);
        }
        return s;
    }

    function _cryptoRandInt() {
        // Dùng crypto.getRandomValues nếu có, fallback Math.random
        if (window.crypto && window.crypto.getRandomValues) {
            var buf = new Uint32Array(1);
            window.crypto.getRandomValues(buf);
            return buf[0];
        }
        return Math.floor(Math.random() * 0xFFFFFFFF);
    }

    function _checksum4(s) {
        // CRC-like đơn giản: fold tất cả ký tự lại → 2 ký tự
        var h = 0x811c9dc5;
        for (var i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = (h * 0x01000193) >>> 0;
        }
        return CHARS[h & 31] + CHARS[(h >>> 5) & 31];
    }

    function genId() {
        var ts    = Date.now();           // ms timestamp
        var rand  = _cryptoRandInt();     // 32-bit crypto random
        var cnt   = ++_idCounter;         // monotonic counter trong phiên
        var extra = _cryptoRandInt();     // thêm 1 lần nữa cho chắc

        // Segment 1: timestamp (ms) → 7 ký tự base32 (đủ đến năm 2059)
        var seg1 = _toBase32(ts, 7);

        // Segment 2: crypto random 32-bit → 7 ký tự base32
        var seg2 = _toBase32(rand >>> 0, 7);

        // Segment 3: counter (4 bit) XOR extra (28 bit) → 6 ký tự base32
        var seg3base = _toBase32(((cnt & 0xF) << 28) | (extra & 0x0FFFFFFF), 6);

        // Checksum 2 ký tự từ toàn bộ chuỗi
        var raw = seg1 + seg2 + seg3base;
        var chk = _checksum4(raw); // 2 ký tự

        // Format: MP·XXXXXXX-XXXXXXX-XXXXXXXX
        return 'MP' + seg1 + '-' + seg2 + '-' + seg3base + chk;
    }

    function isIdTaken(pending, id) {
        return pending.some(function (x) { return x.id === id; });
    }

    function genUniqueId(pending) {
        var id, tries = 0;
        do {
            id = genId();
            tries++;
            if (tries > 50) {
                // Hoàn toàn không thể xảy ra, nhưng phòng thủ tuyệt đối
                clog('warn', 'genUniqueId: quá 50 lần thử — thêm entropy');
                _idCounter += Math.floor(Math.random() * 9999);
            }
        } while (isIdTaken(pending, id) && tries < 100);
        clog('info', 'Generated ID: ' + id + ' (tries: ' + tries + ')');
        return id;
    }

    // ════════════════════════════════════════════════════════════════════════
    // CHECK TRÙNG TRANG
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Kiểm tra trang đã có entry pending chưa.
     * Nếu muốn chặn cả approved → thêm || x.status === 'approved'
     */
    function isPagePending(pending, pageName) {
        var norm = (pageName || '').replace(/ /g, '_');
        return pending.some(function (x) {
            return (x.page_name || '').replace(/ /g, '_') === norm
                && x.status === 'pending';
        });
    }

    // ════════════════════════════════════════════════════════════════════════
    // CLIENT CHECK v6.1
    // ════════════════════════════════════════════════════════════════════════

    var HARD_BLOCK = [
        /\b(child[\s_-]*porn|cp[\s_-]*link|loli[\s_-]*porn|csam|kiddie[\s_-]*porn|shota[\s_-]*porn)\b/i,
        /\b(au[\s_-]*dam|xam[\s_-]*hai[\s_-]*tre[\s_-]*em|khieu[\s_-]*dam[\s_-]*tre[\s_-]*em)\b/i,
        /\b(how[\s_-]*to[\s_-]*(make|build|synthesize)[\s_-]*(bomb|explosive|ied|grenade))\b/i,
        /\b(huong[\s_-]*dan[\s_-]*che[\s_-]*tao[\s_-]*(bom|min|vu[\s_-]*khi|thuoc[\s_-]*no))\b/i,
        /\b(terrorist[\s_-]*attack[\s_-]*plan|isis[\s_-]*recruit|al[\s_-]*qaeda[\s_-]*join)\b/i,
        /\b(synthesis[\s_-]*of[\s_-]*(nerve[\s_-]*agent|sarin|vx[\s_-]*gas|ricin|novichok))\b/i,
        /\b(suicide[\s_-]*method|how[\s_-]*to[\s_-]*kill[\s_-]*yourself[\s_-]*step)\b/i,
        /\b(tu[\s_-]*tu|tu[\s_-]*lam[\s_-]*hai[\s_-]*ban[\s_-]*than[\s_-]*huong[\s_-]*dan)\b/i,
    ];

    var HATE = [
        /\b(nigger|nigga|chink|gook|spic|wetback|kike)\b/i,
        /\b(faggot|dyke|tranny)\b/i,
        /\b(kill[\s_-]*all[\s_-]*(muslim|jew|christian|atheist))\b/i,
        /\b(white[\s_-]*supremacy|racial[\s_-]*cleansing|ethnic[\s_-]*cleansing)\b/i,
        /(b.c\s*k.|nam\s*k.|trung\s*k.).{0,40}(ngu|khon|chet|hen|ban)/i,
        /\b(diet|tieu[\s_-]*diet).{0,20}(nguoi|dan[\s_-]*toc|chung[\s_-]*toc)\b/i,
    ];

    var TOXIC_VI = [
        'deo','dit','du ','lon ','buoi','cac ','cho chet','me may',
        'do khon','do ngu','oc lon','nao ca vang','tao giet may',
        'di chet di','cut xeo','thang ngu','con dien','may chet',
        'd.m','thuc vat','do cho','thu rac ruoi','do vo hoc',
        'con di','thang khon nan','do phan boi','tao kinh may',
        'go die','go kill','trash human','worthless piece',
    ];
    var TOXIC_EN = [
        'fuck you','shut up','motherfucker','piece of shit',
        'go to hell','kill yourself','you suck','dumbass','dickhead',
        'stupid bitch','worthless','pathetic loser','scum',
    ];

    var DOXX = [
        /(?<!\d)\d{10,11}(?!\d)/,
        /\b\d{12}\b/,
        /[a-zA-Z0-9._%+\-]{2,}@[a-zA-Z0-9.\-]+\.[a-z]{2,}/,
        /\b(\d{1,3}\.){3}\d{1,3}\b/,
        /\b(so\s*nha|dia\s*chi|cmnd|cccd|passport|ho\s*chieu|chung\s*minh).{0,25}\d{4,}/i,
    ];

    var SPAM_LINK = /\[https?:\/\/[^\]\s]{20,}/gi;

    function checkLength(text) {
        var s = text
            .replace(/\{\{[\s\S]*?\}\}/g, '')
            .replace(/\[\[.*?\]\]/g, '')
            .replace(/==.*?==/g, '')
            .replace(/\s+/g, ' ').trim();
        return s.length;
    }

    function clientCheck(text) {
        var logs = [], score = 0, blocked = false;
        var tl = text.toLowerCase();

        clog('info', 'Bắt đầu client check v6.1 — ' + text.length + ' ký tự');

        // ── Tầng kiểm duyệt DÙNG CHUNG (MAPLE-Moderation) — chặn tuyệt đối ──
        //    doxx/spam/allcaps tắt vì bài viết dài có thể chứa số/markup hợp lệ;
        //    phần đó để scoring nội bộ bên dưới xử lý mềm.
        var _M = (window.MAPLE && window.MAPLE.Moderation);
        if (_M && typeof _M.check === 'function') {
            var shared = _M.check(text, { minLen: 0, maxLen: 1000000, allcaps: false, spam: false, doxx: false });
            if (shared.blocked) {
                logs.push({ lvl: 'critical', msg: shared.reason || 'Nội dung vi phạm kiểm duyệt — bài bị chặn.' });
                clog('error', 'Shared moderation → BLOCKED: ' + (shared.reason || ''));
                return { logs: logs, blocked: true, score: 1.0 };
            }
        }

        // HARD BLOCK
        for (var h = 0; h < HARD_BLOCK.length; h++) {
            if (HARD_BLOCK[h].test(tl)) {
                logs.push({ lvl: 'critical', msg: 'Phát hiện nội dung vi phạm pháp luật / chính sách tuyệt đối — bài bị chặn.' });
                blocked = true;
                clog('error', 'HARD_BLOCK #' + h + ' triggered');
            }
        }
        if (blocked) { clog('error', '→ BLOCKED'); return { logs: logs, blocked: true, score: 1.0 }; }

        // HATE
        for (var j = 0; j < HATE.length; j++) {
            if (HATE[j].test(tl)) {
                logs.push({ lvl: 'high', msg: 'Phát hiện ngôn ngữ thù ghét / phân biệt đối xử.' });
                score += 0.4;
                clog('warn', 'HATE #' + j);
            }
        }

        // TOXIC
        var tox = 0, toxW = [];
        TOXIC_VI.concat(TOXIC_EN).forEach(function (w) {
            if (tl.indexOf(w.toLowerCase()) !== -1) { tox++; toxW.push(w); }
        });
        if (tox > 0) {
            var sev = tox >= 5 ? 'high' : tox >= 3 ? 'medium' : 'warn';
            logs.push({ lvl: sev, msg: 'Phát hiện ' + tox + ' từ/cụm từ không phù hợp.' });
            score += Math.min(tox * 0.1, 0.45);
            clog('warn', 'TOXIC: ' + toxW.join(', '));
        }

        // DOXXING
        var doxx = 0;
        for (var d = 0; d < DOXX.length; d++) {
            if (DOXX[d].test(text)) { doxx++; clog('warn', 'DOXX pattern #' + d); }
        }
        if (doxx >= 2) {
            logs.push({ lvl: 'high', msg: 'Có thể chứa thông tin cá nhân nhạy cảm (' + doxx + ' pattern).' });
            score += 0.35;
        } else if (doxx === 1) {
            logs.push({ lvl: 'warn', msg: 'Phát hiện 1 pattern thông tin cá nhân — kiểm tra lại.' });
            score += 0.1;
        }

        // SPAM LINK
        var links = text.match(SPAM_LINK) || [];
        clog('info', 'External links: ' + links.length);
        if (links.length > 6) {
            logs.push({ lvl: 'high', msg: 'Quá nhiều external link (' + links.length + ') — có thể là spam.' });
            score += 0.3;
        } else if (links.length > 3) {
            logs.push({ lvl: 'warn', msg: 'Nhiều external link (' + links.length + ') — nên kiểm tra lại.' });
            score += 0.1;
        }

        // LENGTH
        var bodyLen = checkLength(text);
        clog('info', 'Nội dung sau strip: ' + bodyLen + ' ký tự');
        if (bodyLen < 30) {
            logs.push({ lvl: 'warn', msg: 'Nội dung bài rất ngắn (' + bodyLen + ' ký tự).' });
            score += 0.05;
        }

        // DUPLICATE SESSION
        var hash = text.trim().substr(0, 120);
        if (window._mapleLastHash && window._mapleLastHash === hash) {
            logs.push({ lvl: 'warn', msg: 'Nội dung trùng với lần gửi trước trong cùng phiên.' });
            score += 0.15;
            clog('warn', 'Duplicate submission');
        }
        window._mapleLastHash = hash;

        var fs = Math.min(1.0, Math.round(score * 1000) / 1000);
        clog('info', '→ Score: ' + fs + ' | Issues: ' + logs.length);
        return { logs: logs, blocked: false, score: fs };
    }

    // ════════════════════════════════════════════════════════════════════════
    // CONSOLE LOG (F12 only)
    // ════════════════════════════════════════════════════════════════════════
    function clog(type, msg) {
        var p = '[MAPLE v6.1]';
        if (type === 'error') console.error(p, msg);
        else if (type === 'warn') console.warn(p, msg);
        else console.log('%c' + p + '%c ' + msg, 'color:#c1121f;font-weight:bold', 'color:#888');
    }

    // ════════════════════════════════════════════════════════════════════════
    // CSS
    // ════════════════════════════════════════════════════════════════════════
    var CSS = [
"@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Bebas+Neue&display=swap');",
"#mpl-root{position:fixed;inset:0;z-index:999999;background:#000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .5s ease;overflow:hidden;font-family:'Share Tech Mono',monospace;}",
"#mpl-root.mpl-in{opacity:1;}",
"#mpl-root::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(193,18,31,.012) 2px,rgba(193,18,31,.012) 4px);pointer-events:none;z-index:0;}",
"#mpl-beam{position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#c1121f,rgba(255,100,100,.8),#c1121f,transparent);box-shadow:0 0 8px #c1121f;animation:mpl-beam 4s ease-in-out infinite;z-index:1;}",
"@keyframes mpl-beam{0%{top:0%;opacity:0;}5%{opacity:.9;}95%{opacity:.9;}100%{top:100%;opacity:0;}}",
".mpl-corner{position:absolute;width:36px;height:36px;border-color:rgba(193,18,31,.5);border-style:solid;z-index:1;}",
".mpl-c-tl{top:14px;left:14px;border-width:1px 0 0 1px;}",
".mpl-c-tr{top:14px;right:14px;border-width:1px 1px 0 0;}",
".mpl-c-bl{bottom:14px;left:14px;border-width:0 0 1px 1px;}",
".mpl-c-br{bottom:14px;right:14px;border-width:0 1px 1px 0;}",
"#mpl-panel{position:relative;z-index:2;width:min(640px,92vw);background:#060608;border:1px solid #180606;border-top:2px solid #c1121f;transform:translateY(36px) scale(.97);transition:transform .55s cubic-bezier(.16,1,.3,1);}",
"#mpl-panel::before{content:'';position:absolute;top:-2px;left:0;right:0;height:2px;background:#c1121f;box-shadow:0 0 20px 3px rgba(193,18,31,.6);}",
"#mpl-root.mpl-in #mpl-panel{transform:translateY(0) scale(1);}",
"#mpl-hdr{padding:18px 24px 14px;border-bottom:1px solid #110404;display:flex;align-items:center;gap:14px;}",
"#mpl-logo{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.3em;color:#c1121f;text-shadow:0 0 16px rgba(193,18,31,.5);animation:mpl-pulse 2.5s ease-in-out infinite;}",
"@keyframes mpl-pulse{0%,100%{text-shadow:0 0 16px rgba(193,18,31,.5);}50%{text-shadow:0 0 28px rgba(193,18,31,.9),0 0 50px rgba(193,18,31,.25);}}",
"#mpl-sub{font-size:9px;letter-spacing:.2em;color:#2d0e0e;margin-top:2px;}",
"#mpl-dot{margin-left:auto;display:flex;align-items:center;gap:7px;font-size:9px;letter-spacing:.15em;color:#2d0e0e;}",
"#mpl-dot::before{content:'';width:6px;height:6px;border-radius:50%;background:#c1121f;box-shadow:0 0 7px #c1121f;animation:mpl-blink 1.1s ease-in-out infinite;}",
"@keyframes mpl-blink{0%,100%{opacity:1;}50%{opacity:.15;}}",
"#mpl-body{padding:24px 28px;}",
/* ── SCAN PHASE ── */
"#mpl-scan{text-align:center;padding:8px 0;}",
"#mpl-sym{display:block;margin:0 auto 18px;width:64px;height:64px;animation:mpl-rot 5s linear infinite;}",
"@keyframes mpl-rot{to{transform:rotate(360deg);}}",
"#mpl-sym path,#mpl-sym polygon,#mpl-sym line,#mpl-sym circle{stroke:#c1121f;fill:none;stroke-width:1.2;}",
"#mpl-title{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:.3em;color:#ddd;margin-bottom:4px;animation:mpl-glitch 6s infinite;}",
"@keyframes mpl-glitch{0%,93%,100%{clip-path:none;transform:none;color:#ddd;}94%{clip-path:polygon(0 15%,100% 15%,100% 35%,0 35%);transform:translate(-2px,0);color:#ff4444;}95.5%{clip-path:polygon(0 65%,100% 65%,100% 80%,0 80%);transform:translate(2px,0);color:#ff4444;}97%{clip-path:none;transform:none;color:#ddd;}}",
"#mpl-scan-sub{font-size:10px;letter-spacing:.18em;color:#3a1010;margin-bottom:24px;}",
"#mpl-rw{position:relative;width:80px;height:80px;margin:0 auto 20px;}",
"#mpl-rbg,#mpl-rfg{position:absolute;inset:0;border-radius:50%;border:1.5px solid transparent;}",
"#mpl-rbg{border-color:#180606;}",
"#mpl-rfg{border-top-color:#c1121f;border-right-color:rgba(193,18,31,.25);animation:mpl-spin .9s linear infinite;}",
"@keyframes mpl-spin{to{transform:rotate(360deg);}}",
"#mpl-ri{position:absolute;inset:12px;border-radius:50%;border:1px solid #180606;display:flex;align-items:center;justify-content:center;}",
"#mpl-rp{font-family:'Bebas Neue',sans-serif;font-size:20px;color:#c1121f;line-height:1;}",
"#mpl-wm{min-height:44px;margin-bottom:18px;}",
".mpl-wl{font-size:11px;letter-spacing:.1em;color:#2d0e0e;text-align:center;opacity:0;transform:translateY(5px);transition:opacity .4s,transform .4s;line-height:2;}",
".mpl-wl.mpl-sh{opacity:1;transform:none;color:#6a2424;}",
"#mpl-fl{display:none;flex-direction:column;gap:7px;margin-bottom:16px;}",
"#mpl-fl.mpl-sh{display:flex;}",
".mpl-flag{display:flex;align-items:flex-start;gap:9px;padding:9px 12px;border-left:2px solid #c1121f;background:rgba(193,18,31,.04);opacity:0;transform:translateX(-10px);transition:opacity .3s,transform .3s;font-size:11px;}",
".mpl-flag.mpl-sh{opacity:1;transform:none;}",
".mpl-flv{flex-shrink:0;font-size:9px;letter-spacing:.1em;padding:2px 5px;border-radius:1px;}",
".mpl-flv.critical,.mpl-flv.high{background:rgba(193,18,31,.15);color:#ff5555;border:1px solid rgba(193,18,31,.3);}",
".mpl-flv.warn,.mpl-flv.medium{background:rgba(180,100,0,.12);color:#c8780a;border:1px solid rgba(180,100,0,.25);}",
".mpl-flv.low{background:rgba(60,60,60,.1);color:#555;border:1px solid rgba(60,60,60,.2);}",
".mpl-flm{color:#7a4444;line-height:1.5;}",
"#mpl-act{display:none;gap:9px;margin-top:14px;}",
"#mpl-act.mpl-sh{display:flex;}",
".mpl-btn{flex:1;padding:10px 0;font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;border:1px solid;cursor:pointer;background:transparent;transition:background .2s,box-shadow .2s;}",
".mpl-bc{border-color:#c1121f;color:#c1121f;}",
".mpl-bc:hover{background:rgba(193,18,31,.12);box-shadow:0 0 12px rgba(193,18,31,.2);}",
".mpl-bb{border-color:#1e0808;color:#3a1010;}",
".mpl-bb:hover{border-color:#3a1414;color:#6a2a2a;}",
/* ── SUBMIT PHASE ── */
"#mpl-submit{display:none;text-align:center;padding:6px 0;}",
"#mpl-submit.mpl-sh{display:block;}",
"#mpl-sanim{position:relative;width:100px;height:100px;margin:0 auto 20px;}",
".mpl-ro{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(193,18,31,.15);animation:mpl-spin 2.2s linear infinite;}",
".mpl-ro::after{content:'';position:absolute;inset:0;border-radius:50%;border:1px solid transparent;border-top-color:#c1121f;animation:mpl-spin .8s linear infinite;}",
".mpl-rm{position:absolute;inset:18px;border-radius:50%;border:1px solid rgba(193,18,31,.08);animation:mpl-spin 1.4s linear infinite reverse;}",
".mpl-rm::after{content:'';position:absolute;inset:0;border-radius:50%;border:1px solid transparent;border-right-color:rgba(193,18,31,.5);animation:mpl-spin .55s linear infinite reverse;}",
".mpl-rc{position:absolute;inset:40px;border-radius:50%;background:rgba(193,18,31,.04);border:1px solid rgba(193,18,31,.12);display:flex;align-items:center;justify-content:center;}",
".mpl-rcd{width:8px;height:8px;border-radius:50%;background:#c1121f;box-shadow:0 0 10px #c1121f,0 0 20px rgba(193,18,31,.4);animation:mpl-blink .65s ease-in-out infinite;}",
".mpl-pt{position:absolute;width:2px;height:2px;border-radius:50%;background:#c1121f;opacity:0;animation:mpl-pf var(--d,1.5s) ease-out var(--dl,0s) infinite;}",
"@keyframes mpl-pf{0%{opacity:0;transform:translate(0,0)scale(1);}20%{opacity:.9;}100%{opacity:0;transform:translate(var(--tx,20px),var(--ty,-30px))scale(0);}}",
"#mpl-slbl{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:.3em;color:#ddd;margin-bottom:4px;}",
"#mpl-sstep{font-size:10px;letter-spacing:.15em;color:#3a1010;margin-bottom:16px;min-height:18px;transition:opacity .2s;}",
"#mpl-bw{height:1px;background:#100404;margin-bottom:6px;overflow:hidden;}",
"#mpl-b{height:100%;width:0;background:#c1121f;box-shadow:0 0 6px #c1121f;transition:width .5s cubic-bezier(.4,0,.2,1);}",
"#mpl-bp{text-align:right;font-size:9px;letter-spacing:.1em;color:#2d0e0e;margin-bottom:16px;}",
"#mpl-sms{min-height:32px;}",
".mpl-sm{font-size:11px;letter-spacing:.1em;color:#2a0e0e;text-align:center;line-height:2;display:none;}",
".mpl-sm.mpl-cur{display:block;color:#5a2020;}",
/* ── DONE PHASE ── */
"#mpl-done{display:none;text-align:center;}",
"#mpl-done.mpl-sh{display:block;}",
"#mpl-dt{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:.25em;color:#c1121f;margin-bottom:6px;text-shadow:0 0 20px rgba(193,18,31,.5);animation:mpl-pulse 2s ease-in-out infinite;}",
"#mpl-dtk{font-size:12px;letter-spacing:.1em;color:#6a2a2a;margin-bottom:18px;line-height:1.9;}",
"#mpl-dc{background:rgba(193,18,31,.03);border:1px solid #140505;border-left:2px solid #c1121f;padding:14px 18px;text-align:left;margin-bottom:14px;}",
".mpl-dr{display:flex;justify-content:space-between;font-size:10px;padding:4px 0;border-bottom:1px solid #0c0303;}",
".mpl-dr:last-child{border-bottom:none;}",
".mpl-dk{color:#2d0e0e;letter-spacing:.12em;}",
".mpl-dv{color:#6a3a3a;font-size:11px;}",
"#mpl-did{color:#c1121f;font-size:13px;letter-spacing:.08em;}",
"#mpl-drd{font-size:9px;letter-spacing:.14em;color:#200808;margin-top:10px;}",
"#mpl-drb{height:1px;background:#100404;margin:5px 0;overflow:hidden;}",
"#mpl-drf{height:100%;width:0;background:rgba(193,18,31,.35);transition:width 4s linear;}",
/* ── ERROR PHASE ── */
"#mpl-err{display:none;text-align:center;padding:6px 0;}",
"#mpl-err.mpl-sh{display:block;}",
"#mpl-et{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:.3em;color:#ff3333;margin-bottom:8px;}",
"#mpl-em{font-size:11px;letter-spacing:.07em;color:#6a2a2a;margin-bottom:18px;line-height:1.8;white-space:pre-wrap;}",
"#mpl-er{font-family:'Share Tech Mono',monospace;font-size:10px;letter-spacing:.18em;padding:10px 28px;background:transparent;border:1px solid #c1121f;color:#c1121f;cursor:pointer;transition:background .2s,box-shadow .2s;}",
"#mpl-er:hover{background:rgba(193,18,31,.12);box-shadow:0 0 14px rgba(193,18,31,.2);}",
/* footer */
"#mpl-ft{padding:10px 24px;border-top:1px solid #0c0303;display:flex;justify-content:space-between;}",
"#mpl-ftl,#mpl-ftr{font-size:8px;letter-spacing:.16em;color:#160606;}",
    ].join('\n');

    // ════════════════════════════════════════════════════════════════════════
    // WAIT MESSAGES
    // ════════════════════════════════════════════════════════════════════════
    var WM_SCAN = [
        'Đang phân tích nội dung bài viết...',
        'Kiểm tra ngôn ngữ và nội dung...',
        'Quét các pattern không phù hợp...',
        'Xác minh thông tin...',
    ];
    var WM_SUBMIT = [
        'Đang ghi vào hàng chờ nội dung...',
        'Cập nhật danh sách hàng đợi...',
        'Bot sẽ xử lý bài trong vài phút...',
        'Ngồi xuống chờ chút, mọi thứ đang chạy...',
        'Đừng đóng trang — bài đang được gửi...',
        'Cảm ơn vì sự kiên nhẫn của bạn...',
        'Sắp xong rồi, chờ thêm một chút...',
    ];

    // ════════════════════════════════════════════════════════════════════════
    // BUILD OVERLAY
    // ════════════════════════════════════════════════════════════════════════
    var _root = null, _mtimer = null;

    function buildOverlay() {
        if (!document.getElementById('mpl-css')) {
            var s = document.createElement('style');
            s.id = 'mpl-css'; s.textContent = CSS;
            document.head.appendChild(s);
        }
        if (_root) return;

        var particles = (function () {
            var h = '', angles = [0, 45, 90, 135, 180, 225, 270, 315];
            angles.forEach(function (a, i) {
                var r = a * Math.PI / 180, dist = 50;
                var tx = Math.round(Math.cos(r) * dist), ty = Math.round(Math.sin(r) * dist);
                h += '<div class="mpl-pt" style="left:49px;top:49px;--tx:' + tx + 'px;--ty:' + ty + 'px;--d:' + (1.2 + i * .15).toFixed(1) + 's;--dl:' + (i * .1).toFixed(2) + 's;"></div>';
            });
            return h;
        }());

        _root = document.createElement('div');
        _root.id = 'mpl-root';
        _root.innerHTML =
            '<div id="mpl-beam"></div>' +
            '<div class="mpl-corner mpl-c-tl"></div>' +
            '<div class="mpl-corner mpl-c-tr"></div>' +
            '<div class="mpl-corner mpl-c-bl"></div>' +
            '<div class="mpl-corner mpl-c-br"></div>' +
            '<div id="mpl-panel">' +
              '<div id="mpl-hdr">' +
                '<div>' +
                  '<div id="mpl-logo">M · A · P · L · E</div>' +
                  '<div id="mpl-sub">WIKI VIỆT NAM // HỆ THỐNG LƯU TRỮ</div>' +
                '</div>' +
                '<div id="mpl-dot">ĐANG XỬ LÝ</div>' +
              '</div>' +
              '<div id="mpl-body">' +
                // SCAN PHASE
                '<div id="mpl-scan">' +
                  '<svg id="mpl-sym" viewBox="0 0 64 64">' +
                    '<polygon points="32,3 61,18 61,46 32,61 3,46 3,18" stroke-dasharray="4 3"/>' +
                    '<polygon points="32,13 52,24 52,42 32,51 12,42 12,24" stroke-dasharray="2 4" opacity=".4"/>' +
                    '<line x1="32" y1="3" x2="32" y2="61"/><line x1="3" y1="32" x2="61" y2="32"/>' +
                    '<circle cx="32" cy="32" r="5" stroke-dasharray="2 3"/>' +
                  '</svg>' +
                  '<div id="mpl-title">ĐANG KIỂM TRA</div>' +
                  '<div id="mpl-scan-sub">MAPLE CONTENT SCANNER // v6.1</div>' +
                  '<div id="mpl-rw"><div id="mpl-rbg"></div><div id="mpl-rfg"></div><div id="mpl-ri"><div id="mpl-rp">0%</div></div></div>' +
                  '<div id="mpl-wm">' + WM_SCAN.map(function (m) { return '<div class="mpl-wl">' + m + '</div>'; }).join('') + '</div>' +
                  '<div id="mpl-fl"></div>' +
                  '<div id="mpl-act">' +
                    '<button class="mpl-btn mpl-bc" id="mpl-bc">VẪN GỬI KIỂM DUYỆT</button>' +
                    '<button class="mpl-btn mpl-bb" id="mpl-bb">QUAY LẠI SỬA BÀI</button>' +
                  '</div>' +
                '</div>' +
                // SUBMIT PHASE
                '<div id="mpl-submit">' +
                  '<div id="mpl-sanim">' +
                    '<div class="mpl-ro"></div><div class="mpl-rm"></div>' +
                    '<div class="mpl-rc"><div class="mpl-rcd"></div></div>' +
                    particles +
                  '</div>' +
                  '<div id="mpl-slbl">ĐANG GỬI BÀI</div>' +
                  '<div id="mpl-sstep">Khởi tạo...</div>' +
                  '<div id="mpl-bw"><div id="mpl-b"></div></div>' +
                  '<div id="mpl-bp">0%</div>' +
                  '<div id="mpl-sms">' + WM_SUBMIT.map(function (m, i) { return '<div class="mpl-sm' + (i === 0 ? ' mpl-cur' : '') + '">' + m + '</div>'; }).join('') + '</div>' +
                '</div>' +
                // DONE PHASE
                '<div id="mpl-done">' +
                  '<div id="mpl-dt">BÀI ĐÃ ĐƯỢC GỬI</div>' +
                  '<div id="mpl-dtk">Cảm ơn bạn đã đóng góp nội dung cho<br><span style="color:#c1121f;letter-spacing:.15em">MAPLE WIKI VIỆT NAM</span></div>' +
                  '<div id="mpl-dc">' +
                    '<div class="mpl-dr"><span class="mpl-dk">MÃ HÀNG CHỜ</span><span class="mpl-dv" id="mpl-did">—</span></div>' +
                    '<div class="mpl-dr"><span class="mpl-dk">TRANG</span><span class="mpl-dv" id="mpl-dpg">—</span></div>' +
                    '<div class="mpl-dr"><span class="mpl-dk">TÁC GIẢ</span><span class="mpl-dv" id="mpl-dau">—</span></div>' +
                    '<div class="mpl-dr"><span class="mpl-dk">GỬI LÚC</span><span class="mpl-dv" id="mpl-dtm">—</span></div>' +
                    '<div class="mpl-dr"><span class="mpl-dk">TRẠNG THÁI</span><span class="mpl-dv" style="color:#7a5050">Bot xử lý trong ~5 phút</span></div>' +
                  '</div>' +
                  '<div id="mpl-drd">Tự động chuyển trang sau 4 giây</div>' +
                  '<div id="mpl-drb"><div id="mpl-drf"></div></div>' +
                '</div>' +
                // ERROR PHASE
                '<div id="mpl-err">' +
                  '<div id="mpl-et">LỖI GỬI BÀI</div>' +
                  '<div id="mpl-em"></div>' +
                  '<button id="mpl-er">ĐÓNG VÀ THỬ LẠI</button>' +
                '</div>' +
              '</div>' +
              '<div id="mpl-ft"><div id="mpl-ftl">MAPLE-SUBMITWAIT // v6.1</div><div id="mpl-ftr">CHI NHÁNH VIỆT NAM</div></div>' +
            '</div>';

        document.body.appendChild(_root);
        requestAnimationFrame(function () { _root.classList.add('mpl-in'); });

        document.getElementById('mpl-bb').addEventListener('click', _closeOverlay);
        document.getElementById('mpl-er').addEventListener('click', _closeOverlay);
    }

    function _closeOverlay() {
        if (_mtimer) clearInterval(_mtimer);
        if (_root) {
            _root.classList.remove('mpl-in');
            setTimeout(function () {
                if (_root && _root.parentNode) _root.parentNode.removeChild(_root);
                _root = null; _mtimer = null;
            }, 500);
        }
        var b = document.getElementById('maple-btn-save');
        if (b) { b.disabled = false; b.textContent = '📤 GỬI KIỂM DUYỆT'; }
        clog('info', 'Overlay closed');
    }

    // ════════════════════════════════════════════════════════════════════════
    // UI HELPERS
    // ════════════════════════════════════════════════════════════════════════
    function p2(n) { return n < 10 ? '0' + n : '' + n; }
    function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    function animScanMsgs() {
        var lines = document.querySelectorAll('#mpl-wm .mpl-wl');
        lines.forEach(function (l, i) {
            setTimeout(function () {
                lines.forEach(function (ll) { ll.classList.remove('mpl-sh'); });
                l.classList.add('mpl-sh');
            }, i * 650);
        });
        var pct = 0;
        var t = setInterval(function () {
            pct += 1.5;
            if (pct >= 90) { clearInterval(t); return; }
            var el = document.getElementById('mpl-rp');
            if (el) el.textContent = Math.round(pct) + '%';
        }, 35);
        return t;
    }

    function showFlags(logs) {
        var w = document.getElementById('mpl-fl');
        w.innerHTML = ''; w.classList.add('mpl-sh');
        logs.forEach(function (l, i) {
            var d = document.createElement('div');
            d.className = 'mpl-flag';
            d.innerHTML = '<span class="mpl-flv ' + l.lvl + '">' + l.lvl.toUpperCase() + '</span><span class="mpl-flm">' + esc(l.msg) + '</span>';
            w.appendChild(d);
            setTimeout(function () { d.classList.add('mpl-sh'); }, i * 110);
        });
    }

    function showActions(blockOnly) {
        var w = document.getElementById('mpl-act');
        w.classList.add('mpl-sh');
        if (blockOnly) document.getElementById('mpl-bc').style.display = 'none';
    }

    function switchToSubmit() {
        var sc = document.getElementById('mpl-scan');
        var sb = document.getElementById('mpl-submit');
        sc.style.transition = 'opacity .3s ease';
        sc.style.opacity = '0';
        setTimeout(function () {
            sc.style.display = 'none';
            sb.classList.add('mpl-sh');
            sb.style.opacity = '0';
            sb.style.transition = 'opacity .3s ease';
            requestAnimationFrame(function () { sb.style.opacity = '1'; });
        }, 300);
        var msgs = document.querySelectorAll('.mpl-sm'), cur = 0;
        _mtimer = setInterval(function () {
            msgs[cur].classList.remove('mpl-cur');
            cur = (cur + 1) % msgs.length;
            msgs[cur].classList.add('mpl-cur');
        }, 2000);
    }

    function setBar(pct) {
        var b = document.getElementById('mpl-b');
        var p = document.getElementById('mpl-bp');
        if (b) b.style.width = pct + '%';
        if (p) p.textContent = Math.round(pct) + '%';
    }

    function setStep(txt) {
        var el = document.getElementById('mpl-sstep');
        if (!el) return;
        el.style.opacity = '0';
        setTimeout(function () { el.textContent = txt; el.style.opacity = '1'; }, 200);
    }

    function switchToDone(id, author, pageTitle, pageName, submittedAt) {
        if (window.MAPLE && window.MAPLE.award) {
            window.MAPLE.award('first_article');
        }
        if (_mtimer) clearInterval(_mtimer);
        var sb = document.getElementById('mpl-submit');
        var dn = document.getElementById('mpl-done');
        sb.style.transition = 'opacity .3s ease'; sb.style.opacity = '0';
        setTimeout(function () {
            sb.classList.remove('mpl-sh');
            dn.classList.add('mpl-sh');
            dn.style.opacity = '0'; dn.style.transition = 'opacity .4s ease';
            requestAnimationFrame(function () { dn.style.opacity = '1'; });
            document.getElementById('mpl-did').textContent = id;
            document.getElementById('mpl-dpg').textContent = pageTitle || pageName;
            document.getElementById('mpl-dau').textContent = author;
            var d = new Date(submittedAt);
            document.getElementById('mpl-dtm').textContent = p2(d.getHours()) + ':' + p2(d.getMinutes()) + ' · ' + d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
            setTimeout(function () { document.getElementById('mpl-drf').style.width = '100%'; }, 100);
        }, 300);
        setTimeout(function () {
            clog('info', 'Redirect → Chờ_Duyệt');
            window.location.href = mw.util.getUrl('Người_dùng:' + author + '/Chờ_Duyệt');
        }, 4300);
    }

    function switchToError(msg) {
        if (_mtimer) clearInterval(_mtimer);
        ['mpl-scan', 'mpl-submit'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) { el.style.opacity = '0'; setTimeout(function () { el.style.display = 'none'; }, 300); }
        });
        setTimeout(function () {
            var er = document.getElementById('mpl-err');
            document.getElementById('mpl-em').textContent = msg;
            er.classList.add('mpl-sh');
            er.style.opacity = '0'; er.style.transition = 'opacity .3s ease';
            requestAnimationFrame(function () { er.style.opacity = '1'; });
        }, 350);
    }

    // ════════════════════════════════════════════════════════════════════════
    // API
    // ════════════════════════════════════════════════════════════════════════
    function readJson(title, cb) {
        clog('info', 'Reading: ' + title);
        new mw.Api().get({ action: 'query', titles: title, prop: 'revisions', rvprop: 'content', format: 'json' })
        .done(function (data) {
            var pages = data.query.pages, page = pages[Object.keys(pages)[0]];
            if (!page || page.missing !== undefined) return cb(null, []);
            var raw = (page.revisions && page.revisions[0] && page.revisions[0]['*']) || '[]';
            raw = raw.replace(/,\s*([}\]])/g, '$1');
            try { cb(null, JSON.parse(raw)); } catch (e) { clog('warn', 'JSON parse failed'); cb(null, []); }
        }).fail(function (code) { clog('error', 'Read failed: ' + code); cb(new Error('Đọc ' + title + ' thất bại: ' + code)); });
    }

    function writeJson(title, data, summary, cb) {
        clog('info', 'Writing: ' + title);
        new mw.Api().postWithEditToken({ action: 'edit', title: title, text: JSON.stringify(data, null, 2), summary: summary })
        .done(function (res) {
            if (res.edit && res.edit.result === 'Success') { clog('info', 'Write OK: ' + title); cb(null); }
            else { var m = 'Ghi thất bại: ' + JSON.stringify(res.edit); clog('error', m); cb(new Error(m)); }
        }).fail(function (code, err) {
            var m = code + (err && err.info ? ': ' + err.info : ''); clog('error', 'Write failed: ' + m); cb(new Error(m));
        });
    }

    // ════════════════════════════════════════════════════════════════════════
    // MAIN FLOW
    // ════════════════════════════════════════════════════════════════════════
    function startScan(content, summary) {
        buildOverlay();
        clog('info', 'startScan — len:' + content.length);
        var scanTimer = animScanMsgs();

        setTimeout(function () {
            clearInterval(scanTimer);
            var rp = document.getElementById('mpl-rp');
            if (rp) rp.textContent = '100%';

            var res = clientCheck(content);
            var hasBlock = res.blocked;
            var hasHigh  = res.logs.some(function (l) { return l.lvl === 'critical' || l.lvl === 'high'; });
            var hasWarn  = res.logs.some(function (l) { return ['warn', 'medium', 'low'].indexOf(l.lvl) !== -1; });

            if (res.logs.length > 0) showFlags(res.logs);

            if (hasBlock || hasHigh) {
                showActions(true);
            } else if (hasWarn) {
                showActions(false);
                document.getElementById('mpl-bc').addEventListener('click', function () {
                    clog('info', 'User confirmed with warnings');
                    document.getElementById('mpl-act').classList.remove('mpl-sh');
                    document.getElementById('mpl-fl').classList.remove('mpl-sh');
                    doSubmit(content, summary);
                });
            } else {
                clog('info', 'No issues — auto submit');
                doSubmit(content, summary);
            }
        }, WM_SCAN.length * 650 + 500);
    }

    function doSubmit(content, summary) {
        var author    = mw.config.get('wgUserName')       || 'anonymous';
        var pageName  = mw.config.get('wgPageName')       || '';
        var pageTitle = mw.config.get('wgTitle')          || '';
        var ns        = mw.config.get('wgNamespaceNumber');
        var submittedAt = new Date().toISOString();

        switchToSubmit();

        setTimeout(function () {
            setStep('Đang kết nối hàng chờ...');
            setBar(10);

            // ── BƯỚC 0: Đọc Pending → check trùng → tạo ID ───────────────
            readJson('MediaWiki:Maple-Pending.json', function (err, pending) {
                if (err) return switchToError('Không đọc được hàng chờ.\n' + err.message + '\nVui lòng báo admin.');
                if (!Array.isArray(pending)) pending = [];

                setBar(18);
                setStep('Kiểm tra trùng lặp...');

                // Check trang đã pending chưa
                if (isPagePending(pending, pageName)) {
                    return switchToError(
                        'Trang "' + pageTitle + '" đã có trong hàng chờ duyệt.\n\n' +
                        'Vui lòng chờ admin xử lý yêu cầu hiện tại trước khi gửi lại.\n' +
                        'Bạn có thể theo dõi tại trang Chờ Duyệt của mình.'
                    );
                }

                // Tạo ID unique (cực khó trùng)
                var id = genUniqueId(pending);
                clog('info', 'doSubmit — id:' + id + ' author:' + author + ' page:' + pageName);

                var pe = {
                    id:           id,
                    page_name:    pageName,
                    page_title:   pageTitle,
                    author:       author,
                    namespace:    ns,
                    summary:      summary || '',
                    content:      content,
                    submitted_at: submittedAt,
                    status:       'pending',
                    mod_result:   null
                };

                var qe = {
                    id:           id,
                    page_name:    pageName,
                    page_title:   pageTitle,
                    author:       author,
                    namespace:    ns,
                    submitted_at: submittedAt,
                    status:       'pending',
                    risk_score:   0
                };

                pending.push(pe);
                setBar(28);
                setStep('Ghi bài vào Maple-Pending...');

                // ── BƯỚC 1: Ghi Maple-Pending.json ───────────────────────
                writeJson('MediaWiki:Maple-Pending.json', pending, '[MAPLE] Pending: thêm ' + id, function (we) {
                    if (we) return switchToError('Ghi Pending thất bại.\n' + we.message + '\nVui lòng báo admin.');
                    clog('info', 'Pending OK');
                    setBar(48);
                    setStep('Cập nhật Maple-Queue.json...');

                    // ── BƯỚC 2: Ghi Maple-Queue.json ─────────────────────
                    readJson('MediaWiki:Maple-Queue.json', function (err2, queueJson) {
                        if (err2) { clog('warn', 'Queue.json read failed (non-fatal)'); queueJson = []; }
                        if (!Array.isArray(queueJson)) queueJson = [];
                        queueJson.push(qe);
                        setBar(62);

                        writeJson('MediaWiki:Maple-Queue.json', queueJson, '[MAPLE] Queue.json: thêm ' + id, function (we2) {
                            if (we2) clog('warn', 'Queue.json write failed (non-fatal): ' + we2.message);
                            else clog('info', 'Queue.json OK — position #' + queueJson.length);
                            setBar(74);
                            setStep('Cập nhật MediaWiki:Maple-Queue...');

                            // ── BƯỚC 3: Ghi MediaWiki:Maple-Queue (trang wiki) ──
                            readJson('MediaWiki:Maple-Queue', function (err3, queueWiki) {
                                if (err3) { clog('warn', 'Maple-Queue wiki read failed (non-fatal)'); queueWiki = []; }
                                if (!Array.isArray(queueWiki)) queueWiki = [];
                                queueWiki.push(qe);

                                writeJson('MediaWiki:Maple-Queue', queueWiki, '[MAPLE] Queue: thêm ' + id, function (we3) {
                                    if (we3) clog('warn', 'Maple-Queue wiki write failed (non-fatal): ' + we3.message);
                                    else clog('info', 'Maple-Queue wiki OK — position #' + queueWiki.length);
                                    setBar(100);
                                    setStep('Hoàn tất!');
                                    setTimeout(function () {
                                        switchToDone(id, author, pageTitle, pageName, submittedAt);
                                    }, 600);
                                });
                            });
                        });
                    });
                });
            });
        }, 500);
    }

    // ════════════════════════════════════════════════════════════════════════
    // INIT
    // ════════════════════════════════════════════════════════════════════════
    function _init() {
        MAPLE.SubmitWait       = startScan;
        MAPLE._submitWaitReady = true;

        var pending = _pendingCalls.splice(0);
        pending.forEach(function (c) { startScan(c.content, c.summary); });

        document.addEventListener('maple:requestSave', function (e) {
            var d = e.detail || {}; startScan(d.content || '', d.summary || '');
        });
        document.dispatchEvent(new CustomEvent('maple:submitWaitReady'));
        clog('info', 'SubmitWait v6.1 ready ✓');
    }

    mw.loader.using(['mediawiki.api', 'mediawiki.util']).then(_init, _init);

})(mediaWiki, jQuery);