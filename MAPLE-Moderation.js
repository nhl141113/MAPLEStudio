/**
 * ════════════════════════════════════════════════════════════════════════
 * M.A.P.L.E — MediaWiki:MAPLE-Moderation.js
 * Hệ thống kiểm duyệt DÙNG CHUNG cho toàn wiki.
 *
 * Mục tiêu thiết kế:
 *   • MẠNH HƠN: bắt leet/homoglyph/khoảng-trắng-chèn, tiếng Anh + tiếng Việt.
 *   • ÍT BÁO NHẦM: phân biệt "các"/"lớn" (hợp lệ) với "cặc"/"lồn" (tục) nhờ
 *     khớp tiếng Việt theo DẤU CHÍNH XÁC + whitelist từ trắng.
 *   • HARD_BLOCK: ấu dâm/CSAM + nội dung phạm pháp → chặn tuyệt đối, không tha.
 *
 * HAI BẢN THEO ĐỘ TUỔI (v2.0):
 *   • 'adult' (≥18): bộ luật gốc.
 *   • 'teen'  (13–17, HOẶC chưa rõ tuổi → mặc định GẮT): siết THÊM mảng tục/18+
 *     RÕ RÀNG + link 16+, hạ ngưỡng cảnh báo→chặn, chặt doxx hơn.
 *   Nguồn tuổi: localStorage['maple_signup_age'] ('13'|'16'|'18') do NewSignupPage ghi.
 *   CHỐNG BÁO NHẦM: bản teen CHỈ thêm từ tục/18+ rõ ràng (khớp DẤU chính xác / cụm),
 *     KHÔNG thêm từ đa nghĩa ("thuốc lá"≈"thuốc là", "rượu/bia/cờ bạc") → không chặn oan.
 *
 * API (global):
 *   window.MAPLE.Moderation.check(text, opts)  → { ok, blocked, severity, score, reason, logs, audience }
 *   window.MAPLE.Moderation.checkUrl(url, opts) → { ok, blocked, category, reason }
 *       CHẶN TUYỆT ĐỐI link: dark web (.onion/i2p), 18+, lừa đảo, CSAM, mã độc.
 *       teen còn chặn link 16+ rõ ràng (category 'teen-restricted').
 *   window.MAPLE.Moderation.normalize(text)    → string
 *   window.MAPLE.Moderation.getAudience()      → 'adult' | 'teen'
 *   window.MAPLE.Moderation.setAudience(age)   → lưu localStorage (age số hoặc 'adult'/'teen')
 *
 *   opts = {
 *     minLen:   Number (mặc định 0),
 *     maxLen:   Number (mặc định 2000),
 *     doxx:     Boolean (mặc định true)  — bật phát hiện lộ thông tin cá nhân,
 *     spam:     Boolean (mặc định true)  — bật phát hiện spam/zalgo/control,
 *     allcaps:  Boolean (mặc định true)  — cảnh báo (warn) chữ hoa dài,
 *     audience: 'adult' | 'teen'         — override; mặc định tự đọc getAudience().
 *   }
 *
 * Các module gọi:  MAPLE-Comments, MAPLE-Chat, MAPLE-SubmitWait, MAPLE-OpenLink.
 * Phát tín hiệu:  mw.hook('maple.moderation.ready').fire(MAPLE.Moderation)
 * ════════════════════════════════════════════════════════════════════════
 */
(function () {
    'use strict';

    window.MAPLE = window.MAPLE || {};
    if (window.MAPLE.Moderation) return; /* đã nạp — tránh đăng ký lại */

    var VERSION = '2.0';

    // ════════════════════════════════════════════════════════════════════
    // 0. ĐỘ TUỔI / KHÁN GIẢ — chọn bản kiểm duyệt (adult vs teen)
    //    Nguồn: localStorage['maple_signup_age'] do NewSignupPage ghi ('13'|'16'|'18').
    //    KHÔNG rõ tuổi → 'teen' (mặc định GẮT để bảo vệ trẻ).
    // ════════════════════════════════════════════════════════════════════
    var AGE_KEY = 'maple_signup_age';

    function getAudience() {
        try {
            var a = parseInt(localStorage.getItem(AGE_KEY), 10);
            if (a >= 18) return 'adult';
            if (a >= 13) return 'teen';
        } catch (e) {}
        return 'teen'; // không rõ → bản gắt
    }

    /* age: số tuổi (18) HOẶC 'adult' / 'teen'. Lưu về localStorage để các lần sau đọc. */
    function setAudience(age) {
        var v;
        if (age === 'adult') v = 18;
        else if (age === 'teen') v = 13;
        else v = parseInt(age, 10);
        if (!(v >= 13)) v = 13;
        try { localStorage.setItem(AGE_KEY, String(v)); } catch (e) {}
        return getAudience();
    }

    // ════════════════════════════════════════════════════════════════════
    // 1. NORMALIZE — chống leet / homoglyph / zalgo (BỎ dấu tiếng Việt)
    //    Dùng cho tầng tiếng Anh + evasion, KHÔNG dùng cho tiếng Việt-có-dấu.
    // ════════════════════════════════════════════════════════════════════
    var HOMOGLYPHS = {
        'à':'a','á':'a','â':'a','ã':'a','ä':'a','å':'a','ă':'a','ắ':'a','ặ':'a','ầ':'a','ấ':'a','ẩ':'a','ẫ':'a','ậ':'a','ả':'a','ạ':'a',
        'è':'e','é':'e','ê':'e','ë':'e','ě':'e','ẽ':'e','ề':'e','ế':'e','ể':'e','ễ':'e','ệ':'e','ẻ':'e','ẹ':'e',
        'ì':'i','í':'i','î':'i','ï':'i','ĩ':'i','ỉ':'i','ị':'i',
        'ò':'o','ó':'o','ô':'o','õ':'o','ö':'o','ø':'o','ơ':'o','ờ':'o','ớ':'o','ổ':'o','ỡ':'o','ộ':'o','ồ':'o','ố':'o','ỏ':'o','ọ':'o',
        'ù':'u','ú':'u','û':'u','ü':'u','ũ':'u','ư':'u','ừ':'u','ứ':'u','ử':'u','ữ':'u','ự':'u','ủ':'u','ụ':'u',
        'ỳ':'y','ý':'y','ỷ':'y','ỹ':'y','ỵ':'y',
        'đ':'d',
        // Leet số → chữ
        '0':'o','1':'i','3':'e','4':'a','5':'s','6':'g','7':'t','8':'b','9':'g','@':'a','$':'s','!':'i',
        // Cyrillic / Hy Lạp lookalike
        'а':'a','е':'e','о':'o','р':'p','с':'c','х':'x','у':'u','к':'k','м':'m','т':'t','н':'h','в':'b',
        'α':'a','ο':'o','ρ':'p','ε':'e','ι':'i','κ':'k','τ':'t',
        // Khoảng trắng / ký tự vô hình → space
        '​':' ','‌':' ','‍':' ','﻿':' ',' ':' ',
    };

    function normalize(text) {
        var s = (text && text.normalize) ? text.normalize('NFD') : (text || '');
        // Xoá combining marks (zalgo + dấu kết hợp)
        s = s.replace(/[̀-ͯ᷀-᷿⃐-⃿︠-︯]/g, '');
        s = s.split('').map(function (ch) {
            return HOMOGLYPHS.hasOwnProperty(ch) ? HOMOGLYPHS[ch] : ch;
        }).join('');
        return s.toLowerCase();
    }

    /* Gộp ký tự phân tách (space . _ - * ·) để bắt "d i t" / "f.u.c.k" */
    function compact(s) {
        return s.replace(/[\s._\-*·•|/\\]+/g, '');
    }

    // ════════════════════════════════════════════════════════════════════
    // 2. WHITELIST — từ tiếng Việt HỢP LỆ có dạng bỏ-dấu trùng với từ tục.
    //    Token thuộc whitelist được LOẠI trước khi khớp tầng evasion.
    // ════════════════════════════════════════════════════════════════════
    var WHITELIST = {
        'cac':1,   // các (≠ cặc)
        'lon':1,   // lớn, lon (nước) (≠ lồn)
        'cat':1,   // cắt, cát (≠ ...)
        'con':1,   // còn, con
        'cot':1,   // cốt, cột
        'cut':1,   // cút (đi), cụt  → vẫn chặn "cứt" qua tầng có-dấu nếu cần
        'ban':1,   // bạn, ban (hành), bàn
        'banbe':1, // bạn bè
        'cốc':1,'coc':1, // cốc
        'do':1,    // đỏ, đó, do
        'di':1,    // đi, dì
        'ma':1,    // mà, má, mã, ma
        'me':1,    // mẹ, mè, me
        'bo':1,    // bò, bố, bỏ, bộ
        'duong':1, // đường, dương
        'dao':1,   // đào, dao, đạo
        'deu':1,   // đều, đểu? (giữ đểu qua tầng có-dấu)
        'tao':1,   // tạo, táo (≠ "tao" xưng hô thô — ngữ cảnh)
        'sech':1,
        'phim':1,  // phim (≠ porn)
    };

    // ════════════════════════════════════════════════════════════════════
    // 3. HARD_BLOCK — CHẶN TUYỆT ĐỐI, không bao giờ tha, không cảnh báo.
    //    Ấu dâm / CSAM + nội dung phạm pháp (luật Mỹ / chính sách Miraheze).
    //    Khớp trên cả: lower (có dấu), norm (bỏ dấu), compactNorm (gộp né).
    // ════════════════════════════════════════════════════════════════════
    var HARD_BLOCK = [
        // ── Ấu dâm / CSAM ──
        /child\s*(porn|sex|sexual|abuse|nude)/,
        /(kid|minor|underage|preteen|infant)\s*(porn|sex|sexual|nude|nudes)/,
        /\bc[\W_]*p\b.{0,12}(porn|child|kid|sex)/,
        /\bpedo(phile|philia)?\b/, /\bped[o0]\b/,
        /\bloli(con|ta)?\b/, /\bshota(con)?\b/,
        /\bjailbait\b/, /\bchildp(orn)?\b/, /\bcsam\b/,
        /au\s*dam/, /\bdam\s*o\b.{0,8}tre\s*em/, /tre\s*em.{0,12}(khoa\s*than|khieu\s*dam|tinh\s*duc)/,
        // ── Phạm pháp: vũ khí / chất nổ hướng dẫn ──
        /how\s*to\s*(make|build).{0,18}(bomb|explosive|c4|nerve\s*gas)/,
        /(che\s*tao|huong\s*dan).{0,18}(bom|thuoc\s*no|chat\s*no)/,
        // ── Buôn ma túy / dữ liệu trộm ──
        /(buy|sell|order).{0,12}(meth|heroin|cocaine|mdma|fentanyl)\b/,
        /(mua|ban).{0,10}(ma\s*tuy|heroin|ke|hang\s*trang|hang\s*da)/,
        /(sell|dump|leak).{0,12}(credit\s*card|cvv|fullz|ssn|database)/,
        // ── Khủng bố / diệt chủng có chủ đích ──
        /\b(isis|al\s*qaeda)\b.{0,18}(join|attack|kill|bom)/,
        /\b(diet\s*chung|genocide)\b.{0,18}(thuc\s*hien|huong\s*dan|cach)/,
    ];

    // ════════════════════════════════════════════════════════════════════
    // 4. VI_EXACT — Tục tĩu/đe doạ TIẾNG VIỆT khớp theo DẤU CHÍNH XÁC.
    //    Vì giữ nguyên dấu nên "các/lớn/cắt" KHÔNG dính (chỉ "cặc/lồn" mới dính).
    //    Khớp trên: lower (có dấu) + compactDia (gộp né nhưng giữ dấu).
    // ════════════════════════════════════════════════════════════════════
    var VI_EXACT = [
        /(^|[^a-zà-ỹ])(cặc|cạc)([^a-zà-ỹ]|$)/i,
        /(^|[^a-zà-ỹ])lồn([^a-zà-ỹ]|$)/i,
        /(^|[^a-zà-ỹ])(địt|đụ|đú)([^a-zà-ỹ]|$)/i,
        /(^|[^a-zà-ỹ])buồi([^a-zà-ỹ]|$)/i,
        /(^|[^a-zà-ỹ])(đĩ|điếm)([^a-zà-ỹ]|$)/i,
        /(^|[^a-zà-ỹ])(đéo|đếch)([^a-zà-ỹ]|$)/i,
        /(^|[^a-zà-ỹ])cứt([^a-zà-ỹ]|$)/i,
        /(^|[^a-zà-ỹ])dái([^a-zà-ỹ]|$)/i,
        /(^|[^a-zà-ỹ])(đụ\s*má|đm|đmm|đcm|đkm|vãi\s*lồn|vl|vcl|vkl|clm|đậu\s*má)([^a-zà-ỹ]|$)/i,
        /(^|[^a-zà-ỹ])(thằng|con|đồ)\s*(chó|ngu|điên|khùng|đĩ|chết|mặt\s*lồn)([^a-zà-ỹ]|$)/i,
        /(^|[^a-zà-ỹ])(óc\s*chó|đầu\s*buồi|mặt\s*lồn|ngậm\s*cặc|liếm\s*đít)([^a-zà-ỹ]|$)/i,
        /(^|[^a-zà-ỹ])(súc\s*vật|khốn\s*nạn|chó\s*đẻ|đĩ\s*mẹ)([^a-zà-ỹ]|$)/i,
        // Đe doạ bạo lực
        /(tao|tau|tôi)\s*(sẽ\s*)?(giết|đánh|chém|phá|hack)\s*(mày|m|bay|chúng)/i,
        /(giết|chém|đâm)\s*(mày|chết\s*mày|cả\s*nhà)/i,
        // Tự hại
        /(tự\s*tử|treo\s*cổ|cắt\s*tay\s*tự|nhảy\s*lầu|uống\s*thuốc\s*ngủ\s*chết)/i,
    ];

    // ════════════════════════════════════════════════════════════════════
    // 5. BLOCKED_NORM — Tiếng Anh + evasion bỏ-dấu KHÔNG đụng từ trắng.
    //    Khớp trên norm/compactNorm SAU KHI loại token whitelist.
    // ════════════════════════════════════════════════════════════════════
    var BLOCKED_NORM = [
        // Tiếng Việt không dấu (evasion) — đã trừ whitelist nên an toàn
        /\bdit\b/, /ditme/, /ditcha/, /ditmemay/, /ditconme/, /ducon/, /dumay/, /dume/,
        /\bdcm\b/, /\bdmm\b/, /\bvcl\b/, /\bvkl\b/, /\bvcc\b/, /\bclm\b/, /\bdkm\b/, /\bclgt\b/, /\bdmcs\b/,
        /\bbuoi\b/, /matlon/, /ngamcac/, /lstlon/, / occho/, /occho/, /daubuoi/,
        // Tiếng Anh
        /f+u+c+k+/, /f[uvoa0*]+ck/, /f+c+k\b/, /\bfuk\b/, /\bwtf\b/, /motherf/, /\bmf\b/,
        /s+h+i+t+/, /\bsht\b/, /bullshit/,
        /a+s+h+o+l+e/, /assh[o0]le/, /\bass\b/,
        /b+i+t+c+h+/, /\bbtch\b/,
        /\bcunt\b/, /\bcock\b/, /\bdick\b/, /\bdik\b/, /\bpussy\b/, /\bpuss[iy]\b/,
        /bastard/, /\bwhore\b/, /\bslut\b/,
        /\bfag+([o0]t)?\b/, /\bnig+(er|a)\b/, /\bnigg/,
        /\bpenis\b/, /\bvagina\b/, /\banus\b/, /\brape\b/, /\bmolest/,
        /\bsex\b/, /\bporn\b/, /\bxxx\b/, /\bnudes?\b/, /\bhentai\b/, /\bcumshot\b/, /\bblowjob\b/,
        // Đe doạ tiếng Anh
        /kill\s*your\s*self/, /\bkys\b/, /kill\s*you/, /go\s*die/, /end\s*your\s*life/,
        /slit\s*your/, /shoot\s*you/, /stab\s*you/,
        // Hack / phá hoại
        /hack\s*(this|the|wiki|web|site|trang)/, /\bddos\b/, /sql\s*inject/, /xss\s*attack/,
        // Thù ghét
        /nazi/, /heil\s*hitler/, /white\s*power/, /\bkkk\b/, /white\s*supremacy/,
    ];

    // ════════════════════════════════════════════════════════════════════
    // 5b. TEEN — luật BỔ SUNG chỉ áp cho khán giả 'teen' (13–17 / chưa rõ).
    //     NGUYÊN TẮC CHỐNG NHẦM: chỉ thêm từ tục/18+/gợi dục RÕ RÀNG.
    //     KHÔNG thêm từ đa nghĩa (thuốc lá/rượu/bia/cờ bạc…).
    // ════════════════════════════════════════════════════════════════════

    /* Tiếng Việt CÓ DẤU — khớp ranh giới chính xác như VI_EXACT (để "các/lớn/thuốc là" KHÔNG dính).
       Đây là các từ gợi dục/tục mức "vừa" mà bản 18+ có thể cho qua nhưng teen thì chặn. */
    var TEEN_VI_EXACT = [
        /(^|[^a-zà-ỹ])(dâm\s*đãng|dâm\s*ô|đồi\s*trụy|khiêu\s*dâm)([^a-zà-ỹ]|$)/i,
        /(^|[^a-zà-ỹ])(làm\s*tình|quan\s*hệ\s*tình\s*dục|thủ\s*dâm|tự\s*sướng)([^a-zà-ỹ]|$)/i,
        /(^|[^a-zà-ỹ])(ngực\s*to|vếu|núm\s*vú|cởi\s*truồng|khỏa\s*thân|lõa\s*thể)([^a-zà-ỹ]|$)/i,
        /(^|[^a-zà-ỹ])(phim\s*sex|phim\s*người\s*lớn|ảnh\s*nóng|clip\s*nóng|gái\s*gọi|gái\s*ngành)([^a-zà-ỹ]|$)/i,
        /(^|[^a-zà-ỹ])(chịch|chếch|xoạc|nứng|dâm\s*dục)([^a-zà-ỹ]|$)/i,
    ];

    /* Tiếng Anh + né dấu — chỉ TỪ KHOÁ 18+/gợi dục RÕ RÀNG (đa số là token tường minh). */
    var TEEN_BLOCKED_NORM = [
        /\bsexy\b/, /\bsexual\b/, /\berotic/, /\bnsfw\b/, /\bnudity\b/, /\bstrip(per|tease)?\b/,
        /\bhorny\b/, /\bmasturbat/, /\borgasm\b/, /\bejaculat/, /\bfetish\b/, /\bbdsm\b/,
        /\bdildo\b/, /\bvibrator\b/, /\bcamgirl\b/, /\bsugar\s*daddy\b/, /\bescort\b/,
        /\bboob(s|ies)?\b/, /\btiddies\b/, /\bbutt\s*naked\b/, /\bthong\b/,
        /\bonlyfans\b/, /\bhentai\b/, /\becchi\b/, /\bahegao\b/, /\blewd\b/,
        /\bsimp\b/, /\bthicc\b/,
        /lam\s*tinh/, /thu\s*dam/, /khieu\s*dam/, /dam\s*dang/, /khoa\s*than/, /loa\s*the/,
        /phim\s*sex/, /gai\s*goi/, /gai\s*nganh/, /\bchich\b/, /\bnung\b/,
    ];

    /* DOXX bổ sung cho teen — CHỈ khi đi kèm cụm rõ nghĩa, không bắt token đơn mơ hồ. */
    var TEEN_DOXX = [
        /(tên|ten)\s*(trường|truong|lớp|lop)\s*(là|la|:)/i,                // "tên trường là …"
        /(trường|truong)\s+(thpt|thcs|tiểu\s*học|tieu\s*hoc|cấp\s*[123]|cap\s*[123])\b/i,
        /\blớp\s*\d{1,2}\s*[a-z]\d?\b/i,                                   // "lớp 9a1"
        /(facebook|fb|insta(gram)?|ig|tiktok|zalo|telegram|tele)\s*[:.]?\s*[@/]?\s*[\w.\-]{3,}/i,
        /(fb|facebook|instagram|tiktok)\.com\/[\w.\-]{3,}/i,
        /(địa\s*chỉ|dia\s*chi|nhà\s*ở|nha\s*o)\s*(là|la|:)?\s*(số|so)?\s*\d+/i,
    ];

    // ════════════════════════════════════════════════════════════════════
    // 6. SPAM — control chars / zalgo / lặp / link-spam (trên text gốc)
    // ════════════════════════════════════════════════════════════════════
    var SPAM = [
        /(.)\1{9,}/,                          // ký tự lặp ≥10
        /[a-z]{45,}/i,                        // chuỗi liền không khoảng trắng quá dài
        /(\b\w{2,}\b)(\s+\1){4,}/i,           // từ lặp ≥5 lần
        /(https?:\/\/[^\s]+\s*){5,}/i,        // ≥5 URL (link spam)
        /[̀-ͯ᷀-᷿]{5,}/,   // zalgo stacked
        /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/,   // control characters
    ];

    // ── DOXX — lộ thông tin cá nhân ──
    var DOXX = [
        /(^|[^\d])\d{10,11}([^\d]|$)/,                                  // SĐT VN
        /\b\d{12}\b/,                                                   // CCCD
        /[a-z0-9._%+\-]{2,}@[a-z0-9.\-]+\.[a-z]{2,}/i,                  // email
        /\b(\d{1,3}\.){3}\d{1,3}\b/,                                    // IP
        /(so\s*nha|dia\s*chi|cmnd|cccd|passport|ho\s*chieu|the\s*tin\s*dung|credit\s*card|cvv).{0,25}\d{3,}/i,
    ];

    // ── Tiện ích kết quả ──
    function R(ok, blocked, severity, score, reason, logs) {
        return { ok: ok, blocked: !!blocked, severity: severity || null,
                 score: score || 0, reason: reason || null, logs: logs || [] };
    }
    function anyTest(list, str) {
        for (var i = 0; i < list.length; i++) { if (list[i].test(str)) return i; }
        return -1;
    }

    var BLOCK_MSG = '⚠️ Nội dung chứa từ ngữ không phù hợp hoặc vi phạm quy tắc cộng đồng.';
    var HARD_MSG  = '🚫 Nội dung vi phạm nghiêm trọng (bất hợp pháp / lạm dụng) — bị chặn vĩnh viễn.';
    /* Thông điệp riêng cho bản teen — nêu rõ lý do giới hạn tuổi + trang giải thích. */
    var TEEN_MSG  = '🔞 Nội dung này bị chặn ở chế độ dưới 18 tuổi. Nếu bạn đủ 18, hãy xác nhận tuổi trong trang cá nhân. Tìm hiểu: Điều Khoản/Kiểm Duyệt.';

    // ════════════════════════════════════════════════════════════════════
    // CHECK
    // ════════════════════════════════════════════════════════════════════
    function check(text, opts) {
        opts = opts || {};
        var minLen   = opts.minLen != null ? opts.minLen : 0;
        var maxLen   = opts.maxLen != null ? opts.maxLen : 2000;
        var useDoxx  = opts.doxx    !== false;
        var useSpam  = opts.spam    !== false;
        var useCaps  = opts.allcaps !== false;
        var aud      = opts.audience || getAudience();   // 'adult' | 'teen'
        var isTeen   = (aud === 'teen');
        var logs = [];

        /* Gắn audience vào mọi kết quả trả về (truy vết + module hiển thị đúng lý do). */
        function RA(ok, blocked, severity, score, reason, lg) {
            var r = R(ok, blocked, severity, score, reason, lg);
            r.audience = aud;
            return r;
        }

        if (text == null || !String(text).trim()) {
            return RA(false, true, 'block', 1, 'Nội dung không được để trống.', logs);
        }
        var raw = String(text).trim();
        if (raw.length < minLen) return RA(false, true, 'block', 1, 'Nội dung quá ngắn (tối thiểu ' + minLen + ' ký tự).', logs);
        if (raw.length > maxLen) return RA(false, true, 'block', 1, 'Nội dung quá dài (tối đa ' + maxLen + ' ký tự).', logs);

        var lower      = raw.toLowerCase();
        var compactDia = compact(lower);                 // giữ dấu, gộp né
        var norm       = normalize(raw);                 // bỏ dấu + leet
        var compactN   = compact(norm);

        // Loại token whitelist khỏi chuỗi norm → bản "an toàn" cho tầng evasion
        var safeTokens = norm.split(/\s+/).filter(function (t) {
            var key = compact(t);
            return key && !WHITELIST.hasOwnProperty(key);
        });
        var normSafe    = safeTokens.join(' ');
        var compactSafe = compact(normSafe);

        // ── 1) HARD_BLOCK — tuyệt đối (CẢ HAI bản) ──
        if (anyTest(HARD_BLOCK, lower) !== -1 ||
            anyTest(HARD_BLOCK, norm) !== -1 ||
            anyTest(HARD_BLOCK, compactN) !== -1) {
            logs.push({ lvl: 'critical', msg: 'HARD_BLOCK: nội dung bất hợp pháp / lạm dụng.' });
            return RA(false, true, 'block', 1.0, HARD_MSG, logs);
        }

        // ── 2) SPAM / control / zalgo ──
        if (useSpam && anyTest(SPAM, raw) !== -1) {
            logs.push({ lvl: 'block', msg: 'Spam / ký tự bất thường.' });
            return RA(false, true, 'block', 0.9, '⚠️ Nội dung bị phát hiện là spam hoặc chứa ký tự bất thường.', logs);
        }

        // ── 3) Tiếng Việt có dấu (chính xác) ──
        if (anyTest(VI_EXACT, lower) !== -1 || anyTest(VI_EXACT, compactDia) !== -1) {
            logs.push({ lvl: 'block', msg: 'Từ ngữ tục tĩu / đe doạ (tiếng Việt).' });
            return RA(false, true, 'block', 0.95, BLOCK_MSG, logs);
        }

        // ── 4) Tiếng Anh + evasion bỏ dấu (đã trừ whitelist) ──
        if (anyTest(BLOCKED_NORM, normSafe) !== -1 || anyTest(BLOCKED_NORM, compactSafe) !== -1) {
            logs.push({ lvl: 'block', msg: 'Từ ngữ tục tĩu / vi phạm (tiếng Anh / né dấu).' });
            return RA(false, true, 'block', 0.9, BLOCK_MSG, logs);
        }

        // ── 4b) TEEN — siết thêm từ 18+/gợi dục RÕ RÀNG (chỉ khi audience='teen') ──
        if (isTeen) {
            if (anyTest(TEEN_VI_EXACT, lower) !== -1 || anyTest(TEEN_VI_EXACT, compactDia) !== -1 ||
                anyTest(TEEN_BLOCKED_NORM, normSafe) !== -1 || anyTest(TEEN_BLOCKED_NORM, compactSafe) !== -1) {
                logs.push({ lvl: 'block', msg: 'TEEN: từ ngữ 18+/gợi dục bị chặn ở chế độ dưới 18 tuổi.' });
                return RA(false, true, 'block', 0.9, TEEN_MSG, logs);
            }
        }

        // ── 5) DOXX ──
        if (useDoxx && anyTest(DOXX, lower) !== -1) {
            logs.push({ lvl: 'high', msg: 'Có thể lộ thông tin cá nhân.' });
            return RA(false, true, 'block', 0.8, '⚠️ Nội dung có thể chứa thông tin cá nhân (SĐT, email, địa chỉ…). Vui lòng không chia sẻ.', logs);
        }

        // ── 5b) DOXX bổ sung cho teen (trường/lớp/MXH/địa chỉ — chặt hơn để bảo vệ trẻ) ──
        if (isTeen && useDoxx && anyTest(TEEN_DOXX, lower) !== -1) {
            logs.push({ lvl: 'high', msg: 'TEEN: lộ thông tin cá nhân (trường/lớp/MXH/địa chỉ).' });
            return RA(false, true, 'block', 0.8, '🔞 Để bảo vệ bạn, ở chế độ dưới 18 tuổi không được chia sẻ thông tin cá nhân (trường, lớp, mạng xã hội, địa chỉ…). Tìm hiểu: Điều Khoản/Kiểm Duyệt.', logs);
        }

        // ── 6) Toàn chữ hoa — teen CHẶN, adult chỉ CẢNH BÁO (hạ ngưỡng warn→block) ──
        if (useCaps) {
            var alpha = raw.replace(/[^a-zA-ZÀ-ỹ]/g, '');
            if (alpha.length > 30 && alpha === alpha.toUpperCase()) {
                if (isTeen) {
                    logs.push({ lvl: 'block', msg: 'TEEN: toàn chữ hoa (hạ ngưỡng cảnh báo→chặn).' });
                    return RA(false, true, 'block', 0.5, '🔞 Ở chế độ dưới 18 tuổi, vui lòng không viết toàn chữ hoa (gây cảm giác la hét).', logs);
                }
                logs.push({ lvl: 'warn', msg: 'Toàn chữ hoa.' });
                return RA(true, false, 'warn', 0.2, '💬 Lưu ý: Nội dung toàn chữ hoa có thể gây khó chịu cho người đọc.', logs);
            }
        }

        return RA(true, false, null, 0, null, logs);
    }

    // ════════════════════════════════════════════════════════════════════
    // 7. URL / LINK MODERATION — CHẶN TUYỆT ĐỐI link không an toàn.
    //    Trả về { ok, blocked, category, reason }.
    //    category ∈ 'csam' | 'darkweb' | 'adult' | 'phishing' | 'malware' |
    //               'illegal' | null
    //    blocked === true  → KHÔNG cho phép truy cập, dù người dùng xác nhận.
    // ════════════════════════════════════════════════════════════════════

    /* TLD / hậu tố dark web & ẩn danh — chặn thẳng */
    var DARKWEB_TLD = /\.(onion|i2p|loki|bit)\b/i;

    /* Cổng dịch vụ proxy .onion phổ biến (clearnet gateway) */
    var DARKWEB_GATEWAY = /\b(tor2web|onion\.(to|ly|cab|city|link|ws|sh|pet|moe|dog)|onion\.gq|darkweb|hiddenwiki|dark\.fail)\b/i;

    /* CSAM — ấu dâm: CHẶN, không bao giờ tha (dùng lại tinh thần HARD_BLOCK) */
    var URL_CSAM = [
        /child\s*p(orn|ron)?/i, /\bchildporn\b/i, /\bcp[\W_]*(video|pic|porn|link)/i,
        /(pre[\W_]*teen|under\s*age|underage|jail\s*bait|jailbait)/i,
        /\bloli(con|ta)?\b/i, /\bshota(con)?\b/i, /\bpedo(phile|philia)?\b/i,
        /\bpthc\b/i, /\bcsam\b/i, /\bkidporn\b/i,
        /(tre[\W_]*em|au[\W_]*dam).{0,20}(sex|porn|khieu[\W_]*dam|khoa[\W_]*than|18)/i,
    ];

    /* 18+ / khiêu dâm — CHẶN */
    var URL_ADULT = [
        /\b(porn|porno|pornhub|xvideos|xhamster|xnxx|redtube|youporn|brazzers|onlyfans|chaturbate|stripchat|camsoda|bongacams|spankbang|hentai|nhentai|rule34|e-?hentai)\b/i,
        /\b(sex|sexcam|sexvideo|camgirl|escort|fuck|milf|nude|nudes|nsfw|hardcore|xxx|jav|18\+?)\b/i,
        /(phim|truyen)[\W_]*(sex|18|nguoi[\W_]*lon|jav|heo)/i,
        /\bsex[\W_]*(viet|vn|hd|hay|moi)\b/i,
    ];

    /* Lừa đảo / phishing — CHẶN */
    var URL_PHISHING = [
        /(free|win|claim|bonus|reward|prize)[\W_]*(money|btc|bitcoin|crypto|nft|iphone|gift[\W_]*card|robux|vbuck)/i,
        /(verify|confirm|update|secure)[\W_]*(account|wallet|bank|paypal|login)/i,
        /(double|x2|nhan[\W_]*gap[\W_]*doi)[\W_]*(bitcoin|btc|eth|crypto|tien)/i,
        /(nap[\W_]*the|trung[\W_]*thuong|qua[\W_]*tang|nhan[\W_]*qua|vong[\W_]*quay)[\W_]*(mien[\W_]*phi|free|100)/i,
        /\b(garena[\W_]*free|kim[\W_]*cuong[\W_]*free|hack[\W_]*(robux|vbuck|kc|gold))\b/i,
        /(login|signin)[\W_]*[\W_]*(faceb00k|g00gle|paypa1|micros0ft)/i, /\b(faceb00k|g00gle|paypa1|micros0ft|amaz0n)\b/i,
    ];

    /* Mã độc / phạm pháp / chợ đen — CHẶN */
    var URL_ILLEGAL = [
        /\b(malware|ransomware|keylogger|rat[\W_]*(tool|builder)|botnet|stealer|trojan|virus[\W_]*download)\b/i,
        /(crack|keygen|nulled|warez|serial[\W_]*key)[\W_]*(download|free)/i,
        /\b(buy|sell|order|shop)[\W_]*(meth|heroin|cocaine|mdma|fentanyl|lsd|weed|drug)\b/i,
        /(mua|ban|order)[\W_]*(ma[\W_]*tuy|sung|vu[\W_]*khi|hang[\W_]*cam)/i,
        /\b(carding|cvv[\W_]*shop|fullz|dump[\W_]*cc|stolen[\W_]*(card|data|account))\b/i,
        /\b(hire[\W_]*hacker|hitman|killer[\W_]*for[\W_]*hire)\b/i,
        /\b(fake[\W_]*(id|passport|document)|counterfeit[\W_]*money)\b/i,
    ];

    /* TEEN — link 16+ RÕ RÀNG: casino/cá cược + phim/nội dung người lớn mức 16+.
       Chỉ tên miền/cụm tường minh — KHÔNG bắt từ đa nghĩa (rượu/bia/thuốc lá). */
    var URL_TEEN = [
        /\b(bet365|188bet|fun88|w88|m88|12bet|fb88|nohu|nổ\s*hũ|no\s*hu|sun\s*win|sunwin|b52|rikvip|789club|iwin|go88|game\s*bài|game\s*bai|đánh\s*bài\s*online|danh\s*bai\s*online|casino|poker\s*online|cá\s*cược|ca\s*cuoc|cá\s*độ|ca\s*do|lô\s*đề|lo\s*de|cá\s*độ\s*bóng\s*đá)\b/i,
        /\b(phim18|phim\s*18|truyen18|truyen\s*18|phim\s*nguoi\s*lon|phimsex|phim\s*sex|truyensex|truyen\s*sex|anh\s*sex|web\s*sex)\b/i,
        /\b(chatsex|sex\s*chat|hookup|dating\s*18|hen\s*ho\s*nguoi\s*lon)\b/i,
    ];

    function checkUrl(url, opts) {
        if (!url) return { ok: true, blocked: false, category: null, reason: null };
        var raw = String(url);
        var lower = raw.toLowerCase();
        var aud   = (opts && opts.audience) || getAudience();

        var host = '', path = '';
        try {
            var u = new URL(raw);
            host = (u.hostname || '').toLowerCase();
            path = (u.pathname + u.search + u.hash).toLowerCase();
        } catch (e) {
            host = lower; path = lower;
        }
        /* Chuỗi đã bỏ-dấu + gộp-né, để bắt domain/path né tránh */
        var normFull    = normalize(raw);
        var compactFull = compact(normFull);
        var hay = [lower, normFull, compactFull, host, path];

        function hit(list) {
            for (var i = 0; i < hay.length; i++) {
                if (anyTest(list, hay[i]) !== -1) return true;
            }
            return false;
        }

        /* 1) CSAM — ưu tiên tuyệt đối */
        if (hit(URL_CSAM)) {
            return { ok: false, blocked: true, category: 'csam',
                reason: '🚫 Liên kết bị nghi chứa nội dung lạm dụng trẻ em (CSAM). Truy cập bị CHẶN VĨNH VIỄN và có thể bị báo cáo.' };
        }
        /* 2) Dark web / .onion / gateway ẩn danh */
        if (DARKWEB_TLD.test(host) || DARKWEB_TLD.test(lower) || DARKWEB_GATEWAY.test(lower)) {
            return { ok: false, blocked: true, category: 'darkweb',
                reason: '🚫 Liên kết dẫn tới dark web / mạng ẩn danh (.onion, i2p…). Truy cập bị CHẶN vì lý do an toàn và pháp lý.' };
        }
        /* 3) 18+ / khiêu dâm */
        if (hit(URL_ADULT)) {
            return { ok: false, blocked: true, category: 'adult',
                reason: '🚫 Liên kết dẫn tới nội dung người lớn (18+). M.A.P.L.E Wiki CHẶN mọi liên kết khiêu dâm.' };
        }
        /* 4) Lừa đảo / phishing */
        if (hit(URL_PHISHING)) {
            return { ok: false, blocked: true, category: 'phishing',
                reason: '🚫 Liên kết có dấu hiệu LỪA ĐẢO / giả mạo (phishing, scam). Truy cập bị CHẶN để bảo vệ bạn.' };
        }
        /* 5) Mã độc / phạm pháp / chợ đen */
        if (hit(URL_ILLEGAL)) {
            return { ok: false, blocked: true, category: 'illegal',
                reason: '🚫 Liên kết chứa nội dung phạm pháp hoặc mã độc. Truy cập bị CHẶN.' };
        }
        /* 6) TEEN — link 16+ (cá cược / nội dung người lớn mức 16+). CHỈ chặn ở chế độ dưới 18. */
        if (aud === 'teen' && hit(URL_TEEN)) {
            return { ok: false, blocked: true, category: 'teen-restricted',
                reason: '🔞 Liên kết giới hạn 16+/18+ (cờ bạc / nội dung người lớn) bị CHẶN ở chế độ dưới 18 tuổi. Nếu bạn đủ 18, hãy xác nhận tuổi trong trang cá nhân.' };
        }
        return { ok: true, blocked: false, category: null, reason: null };
    }

    // ════════════════════════════════════════════════════════════════════
    // EXPORT
    // ════════════════════════════════════════════════════════════════════
    window.MAPLE.Moderation = {
        version:     VERSION,
        check:       check,
        checkUrl:    checkUrl,
        normalize:   normalize,
        getAudience: getAudience,
        setAudience: setAudience,
        MAX_LEN:     2000,
        MIN_LEN:     3
    };

    if (typeof mw !== 'undefined' && mw.hook) {
        mw.hook('maple.moderation.ready').fire(window.MAPLE.Moderation);
    }
})();
