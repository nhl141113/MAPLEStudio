(function (mw, $) {
    'use strict';

    var config = mw.config.get([
        'wgPageName',
        'wgAction',
        'wgUserId',
        'wgUserName',
        'wgUserGroups',
        'wgIsMainPage',
        'wgNamespaceNumber',
        'wgServer',
        'wgScript',
        'wgCanonicalSpecialPageName',
        'wgIsProbablyEditable'
    ]);

    var pageName        = config.wgPageName;
    var action          = config.wgAction;
    var isLoggedIn      = config.wgUserId !== 0;
    var isWelcomePage   = pageName && pageName.toLowerCase().endsWith('/welcome');
    if (isWelcomePage) {
        loadCSS('Welcome');
    }
    var namespaceNumber = config.wgNamespaceNumber;
    var normalizedPage  = pageName.replace(/_/g, ' ');
    var isUserAppealPage = normalizedPage && normalizedPage.indexOf('Người dùng:') === 0 && normalizedPage.indexOf('/Kháng cáo/') !== -1;

    // ── Helpers ───────────────────────────────────────────────────
    function getRawUrl(title, type) {
        var ext = (type === 'text/css') ? '.css' : '.js';
        return config.wgScript + '?title=MediaWiki:' + encodeURIComponent(title) + ext
             + '&action=raw&ctype=' + type;
    }

    function loadAsync(name) {
        mw.loader.getScript(getRawUrl(name, 'text/javascript'))
            .catch(function (err) {
                console.warn('[M.A.P.L.E] Không thể nạp module: ' + name, err);
            });
    }

    function loadSequence(name) {
        return mw.loader.getScript(getRawUrl(name, 'text/javascript'));
    }

    function loadCSS(name) {
        mw.loader.load(getRawUrl(name, 'text/css'), 'text/css');
    }

    // ════════════════════════════════════════════════════════════════
    // 0a. BRAND — Logo M.A.P.L.E (lá phong) dùng chung TOÀN CỤC
    //     Đặt tại Common.js vì file này luôn chạy ĐẦU TIÊN + ĐỒNG BỘ trên
    //     mọi trang → mọi module nạp sau (OpenLink, ErrorPage, NoAccess,
    //     MHHelp, HomePage, GlobalNav…) gọi được window.MAPLE.logoSVG ngay,
    //     KHÔNG lo race condition. 1 nguồn duy nhất, tránh copy-paste lệch.
    //     opts: { pulse:false (tắt mắt nhấp nháy), className:'...' }
    // ════════════════════════════════════════════════════════════════
    window.MAPLE = window.MAPLE || {};
    (function () {
        var seq = 0;
        window.MAPLE.logoSVG = function (size, opts) {
            opts = opts || {};
            size = size || 64;
            var fid       = 'maple-logo-g-' + (++seq); // filter id duy nhất/instance
            var cls       = opts.className ? ' class="' + opts.className + '"' : '';
            var eyeClass  = (opts.pulse === false) ? '' : ' class="maple-eye-pulse"';
            return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100"' +
                ' fill="none" xmlns="http://www.w3.org/2000/svg" role="img"' +
                ' aria-label="Logo M.A.P.L.E"' + cls + '>' +
                '<defs><filter id="' + fid + '">' +
                '<feGaussianBlur stdDeviation="1.5" result="b"/>' +
                '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
                '</filter></defs>' +
                '<path d="M50 5L95 40L80 95H20L5 40L50 5Z" stroke="#450a0a" stroke-width="0.8" opacity="0.6"/>' +
                '<g filter="url(#' + fid + ')">' +
                '<path d="M50 15V85M50 15L85 45L50 40L15 45L50 15Z" stroke="#ef4444" stroke-width="2" stroke-linejoin="miter"/>' +
                '<path d="M30 60L50 85L70 60" stroke="#ef4444" stroke-width="2"/>' +
                '</g>' +
                '<circle cx="50" cy="40" r="5.5" fill="#ef4444" filter="url(#' + fid + ')"' + eyeClass + '/>' +
                '</svg>';
        };

        window.MAPLE.getUserStatus = function (callback) {
            var cacheKey = 'maple_user_status_cache';
            var cached = null;
            try { cached = JSON.parse(sessionStorage.getItem(cacheKey)); } catch (e) {}

            if (cached && (Date.now() - cached.ts < 5 * 60 * 1000)) {
                callback(cached.data);
                return;
            }

            var userId = mw.config.get('wgUserId') || 0;
            var userName = mw.config.get('wgUserName') || '';
            if (userId === 0) {
                callback({ isLoggedIn: false, emailVerified: false, accountAgeDays: 0, rp: 0, groups: [] });
                return;
            }

            var api = new mw.Api();
            api.get({
                action: 'query',
                meta: 'userinfo',
                uiprop: 'email|registration|groups',
                format: 'json',
                formatversion: 2
            }).done(function(res) {
                var uinfo = res.query && res.query.userinfo;
                if (!uinfo) {
                    callback({ isLoggedIn: true, emailVerified: false, accountAgeDays: 0, rp: 0, groups: [] });
                    return;
                }

                var status = {
                    isLoggedIn: true,
                    emailVerified: !!uinfo.emailauthenticated,
                    accountAgeDays: 0,
                    groups: uinfo.groups || [],
                    rp: 0
                };

                var regDate = uinfo.registration ? new Date(uinfo.registration) : new Date();
                status.accountAgeDays = Math.floor((new Date() - regDate) / (1000 * 60 * 60 * 24));

                var tries = 0;
                var timer = setInterval(function() {
                    var CAT = window.MAPLE && window.MAPLE.catalog;
                    if (CAT || ++tries > 5) {
                        clearInterval(timer);
                        if (!CAT) {
                            saveAndCall(status);
                            return;
                        }
                        api.get({
                            action: 'query',
                            titles: 'MediaWiki:UserAchievements.json',
                            prop: 'revisions',
                            rvprop: 'content',
                            rvslots: 'main',
                            format: 'json',
                            formatversion: 2
                        }).done(function(achResp) {
                            var data = {};
                            try {
                                var pg  = achResp.query && achResp.query.pages && achResp.query.pages[0];
                                var rev = pg && pg.revisions && pg.revisions[0];
                                var t   = (rev && ((rev.slots && rev.slots.main && rev.slots.main.content) || rev.content || rev['*'])) || '{}';
                                data = JSON.parse(t);
                            } catch (e) {}

                            var central = data[userName.replace(/ /g, '_')] || data[userName] || [];

                            api.get({
                                action: 'query',
                                titles: CAT.userAchPage(userName),
                                prop: 'revisions',
                                rvprop: 'content',
                                rvslots: 'main',
                                format: 'json',
                                formatversion: 2
                            }).done(function(r2) {
                                var earnedMap = {}, actionRP = 0;
                                try {
                                    var p2 = r2.query && r2.query.pages && r2.query.pages[0];
                                    var v2 = p2 && !p2.missing && p2.revisions && p2.revisions[0];
                                    if (v2) {
                                        var t2 = (v2.slots && v2.slots.main && v2.slots.main.content) || v2.content || '{}';
                                        var j2 = JSON.parse(t2);
                                        earnedMap = j2.earned || {};
                                        actionRP = (j2.stats && j2.stats.rp) || 0;
                                    }
                                } catch (e) {}

                                var fullList = CAT.mergeEarned(central, earnedMap);
                                status.rp = CAT.computeRP(fullList) + actionRP;
                                saveAndCall(status);
                            }).fail(function() {
                                var fullList = CAT.mergeEarned(central, {});
                                status.rp = CAT.computeRP(fullList);
                                saveAndCall(status);
                            });
                        }).fail(function() {
                            saveAndCall(status);
                        });
                    }
                }, 200);
            }).fail(function() {
                callback({ isLoggedIn: true, emailVerified: false, accountAgeDays: 0, rp: 0, groups: [] });
            });

            function saveAndCall(status) {
                try { sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: status })); } catch (e) {}
                callback(status);
            }
        };

        window.MAPLE.clearUserStatusCache = function () {
            try { sessionStorage.removeItem('maple_user_status_cache'); } catch (e) {}
        };

        window.MAPLE.utils = {
            esc: function (s) {
                return String(s || '')
                    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
            },
            relTime: function (iso) {
                if (!iso) return '—';
                var diff = Date.now() - new Date(iso).getTime();
                if (diff < 60000)    return 'vừa xong';
                if (diff < 3600000)  return Math.floor(diff / 60000) + ' phút trước';
                if (diff < 86400000) return Math.floor(diff / 3600000) + ' giờ trước';
                return Math.floor(diff / 86400000) + ' ngày trước';
            },
            fmtDate: function (iso) {
                if (!iso) return '—';
                var d = new Date(iso);
                return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
                       ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            }
        };
    })();

    // ════════════════════════════════════════════════════════════════
    // 0. GLOBAL ATMOSPHERE — Noise + Scanline + Vignette (mọi trang)
    // ════════════════════════════════════════════════════════════════
    (function () {
        function initAtmosphere() {
            if (document.getElementById('maple-global-scanline')) return;

            // Scanline + chromatic
            var scanline = document.createElement('div');
            scanline.id = 'maple-global-scanline';
            document.body.appendChild(scanline);

            // Vignette
            var vignette = document.createElement('div');
            vignette.id = 'maple-global-vignette';
            document.body.appendChild(vignette);

            // Noise canvas — BỎ QUA trên mobile / máy yếu / prefers-reduced-motion
            // (canvas chạy mỗi 80ms rất tốn CPU/pin; scanline+vignette vẫn giữ qua CSS)
            var reduceFX = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            var lowEnd   = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
                           (navigator.deviceMemory && navigator.deviceMemory <= 4);
            if (reduceFX || window.innerWidth < 768 || lowEnd) return;

            var canvas = document.createElement('canvas');
            canvas.id = 'maple-global-noise';
            document.body.appendChild(canvas);

            var ctx = canvas.getContext('2d');
            var w, h;

            function resize() {
                w = canvas.width  = window.innerWidth;
                h = canvas.height = window.innerHeight;
            }
            resize();
            window.addEventListener('resize', resize);

            function drawNoise() {
                var img = ctx.createImageData(w, h);
                var d = img.data;
                for (var i = 0; i < d.length; i += 4) {
                    var v = Math.random() * 255 | 0;
                    d[i] = d[i+1] = d[i+2] = v;
                    d[i+3] = Math.random() < 0.035 ? 16 : 0;
                }
                ctx.putImageData(img, 0, 0);
            }

            var noiseTimer = null;
            function noiseLoop() {
                drawNoise();
                noiseTimer = setTimeout(noiseLoop, 80);
            }
            function startNoise() { if (!noiseTimer && !document.hidden) noiseLoop(); }
            function stopNoise()  { if (noiseTimer) { clearTimeout(noiseTimer); noiseTimer = null; } }

            // Tạm dừng vòng lặp noise khi tab ẩn → CPU/pin về 0, tránh chạy vô ích
            document.addEventListener('visibilitychange', function () {
                if (document.hidden) stopNoise(); else startNoise();
            });
            startNoise();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAtmosphere);
        } else {
            initAtmosphere();
        }
    })();

    // ════════════════════════════════════════════════════════════════
    // 0a-bis. GIẤY PHÉP — registry dùng chung (footer + trang Tạo Bài Mới)
    //   page = trang nội bộ (resolve qua mw.util.getUrl); url+ext = link ngoài (CC).
    // ════════════════════════════════════════════════════════════════
    /* Mọi giấy phép đều có TRANG NỘI BỘ tại Dự án:Bản quyền/Giấy phép/<Tên>.
       Trang CC sẽ có nút "Xem bản gốc tại …" (source) do MCLv1.js render. */
    window.MAPLE.LICENSES = {
        'mcl':         { name: 'Giấy phép Nội dung M.A.P.L.E (MCL) v1.0', cat: 'Giấy phép MCL',         page: 'Dự án:Bản quyền/Giấy phép/MCLv1' },
        'm-sa':        { name: 'M-SA 1.0',         cat: 'Giấy phép M-SA',         page: 'Dự án:Bản quyền/Giấy phép/M-SA 1.0' },
        'm-by-sa':     { name: 'M BY-SA 1.0',      cat: 'Giấy phép M BY-SA',      page: 'Dự án:Bản quyền/Giấy phép/M BY-SA 1.0' },
        'cc-by-sa':    { name: 'CC BY-SA 4.0',     cat: 'Giấy phép CC BY-SA',     page: 'Dự án:Bản quyền/Giấy phép/CC BY-SA 4.0' },
        'cc-by':       { name: 'CC BY 4.0',        cat: 'Giấy phép CC BY',        page: 'Dự án:Bản quyền/Giấy phép/CC BY 4.0' },
        'cc-by-nc-sa': { name: 'CC BY-NC-SA 4.0',  cat: 'Giấy phép CC BY-NC-SA',  page: 'Dự án:Bản quyền/Giấy phép/CC BY-NC-SA 4.0' },
        'cc-by-nd':    { name: 'CC BY-ND 4.0',     cat: 'Giấy phép CC BY-ND',     page: 'Dự án:Bản quyền/Giấy phép/CC BY-ND 4.0' },
        'cc0':         { name: 'CC0 1.0 (Phạm vi công cộng)', cat: 'Giấy phép CC0', page: 'Dự án:Bản quyền/Giấy phép/CC0 1.0' },
        'arr':         { name: 'Bản quyền toàn phần (©)', cat: 'Giấy phép Bản quyền toàn phần', page: 'Dự án:Bản quyền/Giấy phép/Bản quyền toàn phần' }
    };
    window.MAPLE.LICENSE_DEFAULT = 'cc-by-sa';   /* mặc định toàn wiki (theo Điều khoản bản quyền) */
    window.MAPLE.LICENSE_FALLBACK_PAGE = 'Dự án:Bản quyền/Giấy phép';  /* trang hub/fallback */
    window.MAPLE.licenseHref = function (lic) {
        if (!lic) return '#';
        if (lic.page && mw.util && mw.util.getUrl) return mw.util.getUrl(lic.page);
        return '#';
    };

    // ════════════════════════════════════════════════════════════════
    // 0b. GLOBAL UX — nút Lên đầu trang + meta SEO/chia sẻ + A2HS (cài như app)
    // ════════════════════════════════════════════════════════════════
    (function () {
        function meta(attr, key, val) {
            if (document.querySelector('meta[' + attr + '="' + key + '"]')) return;
            var m = document.createElement('meta');
            m.setAttribute(attr, key);
            m.setAttribute('content', val);
            document.head.appendChild(m);
        }
        function initGlobalUX() {
            var pageTitle = config.wgTitle || 'M.A.P.L.E';
            var fullTitle = pageTitle + ' — M.A.P.L.E Wiki';
            var desc = 'M.A.P.L.E — cơ sở dữ liệu hồ sơ thực thể, vật phẩm và tài liệu trong The Maze.';

            /* SEO + chia sẻ mạng xã hội */
            meta('name', 'theme-color', '#050505');
            if (!document.querySelector('meta[name="description"]')) meta('name', 'description', desc);
            meta('property', 'og:site_name', 'M.A.P.L.E Wiki');
            meta('property', 'og:title', fullTitle);
            meta('property', 'og:description', desc);
            meta('property', 'og:type', 'website');
            meta('property', 'og:url', location.href);
            meta('name', 'twitter:card', 'summary');
            meta('name', 'twitter:title', fullTitle);
            meta('name', 'twitter:description', desc);

            /* A2HS — cài như app (manifest qua data URI + meta Apple).
               LƯU Ý: Service Worker offline thật KHÓ trên Miraheze (scope) → chỉ "installable". */
            if (!document.querySelector('link[rel="manifest"]')) {
                var manifest = {
                    name: 'M.A.P.L.E Wiki', short_name: 'M.A.P.L.E',
                    start_url: '/wiki/Trang_Ch%C3%ADnh', display: 'standalone',
                    background_color: '#050505', theme_color: '#050505', description: desc
                };
                var link = document.createElement('link');
                link.rel = 'manifest';
                link.href = 'data:application/manifest+json,' + encodeURIComponent(JSON.stringify(manifest));
                document.head.appendChild(link);
            }
            meta('name', 'apple-mobile-web-app-capable', 'yes');
            meta('name', 'apple-mobile-web-app-status-bar-style', 'black-translucent');
            meta('name', 'apple-mobile-web-app-title', 'M.A.P.L.E');

            /* Nút "Lên đầu trang" toàn cục */
            if (!document.getElementById('maple-top-btn')) {
                var btn = document.createElement('button');
                btn.id = 'maple-top-btn';
                btn.type = 'button';
                btn.setAttribute('aria-label', 'Lên đầu trang');
                btn.textContent = '↑';
                document.body.appendChild(btn);
                btn.addEventListener('click', function () {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
                var onScroll = function () { btn.classList.toggle('show', window.pageYOffset > 480); };
                window.addEventListener('scroll', onScroll, { passive: true });
                onScroll();
            }

            injectLicenseFooter();
        }

        /* ── Chân trang: "Toàn bộ trang này sử dụng giấy phép {…}" ──
           Phát hiện giấy phép qua THỂ LOẠI của trang (wgCategories) khớp registry;
           không có → giấy phép mặc định + link trang hub/fallback. */
        function injectLicenseFooter() {
            if (document.getElementById('maple-license-footer')) return;
            var host = document.getElementById('mw-content-text');
            if (!host) return;
            var L = window.MAPLE.LICENSES || {};
            var cats = mw.config.get('wgCategories') || [];
            var key = null;
            for (var k in L) {
                if (L.hasOwnProperty(k) && cats.indexOf(L[k].cat) !== -1) { key = k; break; }
            }
            var isFallback = !key;
            var lic = L[key || window.MAPLE.LICENSE_DEFAULT] || { name: 'Giấy phép Nội dung', page: window.MAPLE.LICENSE_FALLBACK_PAGE };
            var href = isFallback
                ? (mw.util && mw.util.getUrl ? mw.util.getUrl(window.MAPLE.LICENSE_FALLBACK_PAGE) : '#')
                : window.MAPLE.licenseHref(lic);
            var a = document.createElement('a');
            a.href = href; a.className = 'maple-lic-link'; a.textContent = lic.name;
            var wrap = document.createElement('div');
            wrap.id = 'maple-license-footer';
            wrap.className = 'maple-license-footer';
            wrap.appendChild(document.createTextNode('🍁 Toàn bộ trang này sử dụng giấy phép '));
            wrap.appendChild(a);
            wrap.appendChild(document.createTextNode(isFallback ? ' (mặc định).' : '.'));
            host.appendChild(wrap);
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initGlobalUX);
        } else { initGlobalUX(); }
    })();

    // ════════════════════════════════════════════════════════════════
    // 1. GLOBAL MODULES
    // ════════════════════════════════════════════════════════════════
    loadAsync('MAPLE-Moderation'); // Kiểm duyệt dùng chung — nạp sớm cho Chat/Comments/SubmitWait
    loadAsync('MAPLE-Notify');     // Lõi gửi thông báo dùng chung — nạp sớm cho các app notifier
    loadAsync('GlobalNav');
    loadAsync('MAPLE-Apps');       // App Drawer (ngăn ứng dụng) — tự chèn nút ▦ vào navbar
    loadAsync('MAPLE-Widget-Maze'); // Widget The Maze (mở từ App Drawer)

    /* ── MAPLE Chat: load + gắn lazy DieuKhoan-Chat popup lần đầu dùng Chat ── */
    if (isLoggedIn) {
        loadAsync('MAPLE-Chat');
        /* Khi Chat panel lần đầu được mở → kiểm tra đã đọc điều khoản Chat chưa */
        mw.hook('maple.chat.first_open').add(function () {
            var CHAT_TOS_KEY = 'maple_tos_chat_seen';
            try {
                if (!localStorage.getItem(CHAT_TOS_KEY)) {
                    loadCSS('TroGiup');
                    loadSequence('TroGiup-Common').then(function () {
                        loadSequence('DieuKhoan-Chat').then(function () {
                            if (window.MHHelp && window.MHHelp.tosPopup) {
                                window.MHHelp.tosPopup('chat', function () {
                                    try { localStorage.setItem(CHAT_TOS_KEY, '1'); } catch (e) {}
                                });
                            } else {
                                try { localStorage.setItem(CHAT_TOS_KEY, '1'); } catch (e) {}
                            }
                        });
                    });
                }
            } catch (e) {}
        });
    }
    loadAsync('MAPLE-ExternalLink');
    loadAsync('Rating');
    loadAsync('SecureImage');
    loadAsync('Classified');
    loadCSS('Dossier');
    loadAsync('Dossier');
    loadAsync('RecordCard');
    loadAsync('GuestGate');
    loadAsync('GuestGate-Edit');
    loadAsync('WhatsNew-Popup');  // Popup "What's New" tự động (localStorage theo version)
    if (isLoggedIn) {
        loadAsync('Welcome-Popup');
    }
    loadAsync('DieuKhoan-Popup'); // Popup đồng ý Điều Khoản — hiện khi version thay đổi
    /* Tự ghi nhận thành tựu (đồng bộ theo user) — cần catalog trước; chỉ khi đã đăng nhập */
    if (isLoggedIn) {
        loadSequence('AchievementCatalog')
            .then(function () { loadAsync('MAPLE-Achievements'); })
            .catch(function () { /* bỏ qua nếu lỗi nạp */ });
        /* APP notifier (chạy nền, báo vào chuông + Chat qua MAPLE-Notify) */
        loadAsync('MAPLE-App-Comments');     // bình luận mới trên bài của bạn
        loadAsync('MAPLE-App-Achievements'); // mở khoá thành tựu mới
        loadAsync('MAPLE-App-Moderation');   // bài được duyệt / bị từ chối
    }

    // ════════════════════════════════════════════════════════════════
    // 2. PAGE-SPECIFIC LOGIC
    // ════════════════════════════════════════════════════════════════

    if (config.wgIsMainPage) {
        loadAsync('HomePage');
    }

    // ── Hàng chờ kiểm duyệt (MAPLE:Hàng_Chờ và mọi subpage ảo) ──────────────
    var QUEUE_ROOTS = [
        'MediaWiki:Maple-Queue/Xem',
        'Maple-Queue',
        'MAPLE:Hàng Chờ',
        'MAPLE:Hàng chờ',
    ];
    var QUEUE_ROOT_PREFIXES = [
        'MAPLE:Hàng Chờ/',
        'MAPLE:Hàng chờ/',
    ];

    var decodedPage = decodeURIComponent(pageName).replace(/_/g, ' ');

    var isQueuePage = (
        QUEUE_ROOTS.indexOf(pageName)       !== -1 ||
        QUEUE_ROOTS.indexOf(normalizedPage) !== -1 ||
        QUEUE_ROOTS.indexOf(decodedPage)    !== -1 ||
        QUEUE_ROOT_PREFIXES.some(function (prefix) {
            return decodedPage.indexOf(prefix) === 0 ||
                   normalizedPage.indexOf(prefix) === 0;
        }) ||
        $('.maple-queue-embed').length > 0
    );

if (isQueuePage) {
        console.log('[M.A.P.L.E] Nạp module hàng chờ tuần tự...');
        
        loadSequence('MAPLE-Comments')
            .then(function () {
                // Đợi cho đến khi MAPLE-Comments phát tín hiệu .fire()
                mw.hook('maple.comments.ready').add(function () {
                    loadSequence('MAPLE-QueuePage')
                        .catch(function (err) {
                            console.error('[M.A.P.L.E] Lỗi nạp MAPLE-QueuePage:', err);
                        });
                });
            })
            .catch(function (err) {
                console.error('[M.A.P.L.E] Lỗi nạp module MAPLE-Comments:', err);
            });
    }

    // ── Trang tải lên ─────────────────────────────────────────────────────────
    if (config.wgCanonicalSpecialPageName === 'Upload') {
        loadCSS('MapleUpload');
        loadAsync('MapleUpload');
    } else {
        function checkUploadEmbed() {
            if ($('.maple-upload-wrap').length) {
                loadCSS('MapleUpload');
                loadAsync('MapleUpload');
            }
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkUploadEmbed);
        } else {
            checkUploadEmbed();
        }
    }

    // ── Trang Chờ Duyệt của thành viên ───────────────────────────────────────
    if (isLoggedIn) {
        var userName = config.wgUserName;

        var PENDING_PREFIXES = [
            'Người dùng:' + userName + '/Chờ Duyệt',
            'User:'       + userName + '/Chờ Duyệt',
        ];

        var isPendingPage = PENDING_PREFIXES.some(function (prefix) {
            return normalizedPage === prefix ||
                   normalizedPage.indexOf(prefix + '/') === 0 ||
                   decodedPage   === prefix ||
                   decodedPage.indexOf(prefix + '/') === 0;
        });

        if (isPendingPage) {
            var groups    = config.wgUserGroups || [];
            var isOwnPage = pageName.indexOf(userName.replace(/ /g, '_')) !== -1 ||
                            pageName.indexOf(userName) !== -1;

            if (isOwnPage || groups.indexOf('sysop') !== -1) {
                console.log('[M.A.P.L.E] Nạp module trang chờ duyệt tuần tự...');
                loadSequence('MAPLE-Comments')
                    .then(function () {
                        return loadSequence('MAPLE-PendingPage');
                    })
                    .catch(function (err) {
                        console.error('[M.A.P.L.E] Không thể nạp các module Chờ Duyệt:', err);
                    });
            }
        }
    }

    // ── Không gian tên Trợ giúp ───────────────────────────────────────────────
    if (namespaceNumber === 12 || normalizedPage.indexOf('Trợ giúp') === 0) {
        loadCSS('TroGiup');
        var decodedHelp = decodeURIComponent(pageName);

        // Chọn module trang con theo tên
        var helpModule;
        if (decodedHelp === 'Trợ_giúp' || decodedHelp === 'Trợ giúp' ||
            pageName    === 'Trợ_giúp' || normalizedPage === 'Trợ giúp') {
            helpModule = 'TroGiup';
        } else if (/Dossier/i.test(decodedHelp))                     { helpModule = 'TroGiup-Dossier';   }
        else if (/Th[uự]c.*Th[eể]/i.test(decodedHelp))               { helpModule = 'TroGiup-ThucThe';   }
        else if (/Nh[aậ]t.*K[yý]/i.test(decodedHelp))                { helpModule = 'TroGiup-NhatKy';    }
        else if (/V[aậ]t.*Ph[aẩ]m/i.test(decodedHelp))              { helpModule = 'TroGiup-VatPham';   }
        else if (/[AẢ]nh.*B[aả]o/i.test(decodedHelp))               { helpModule = 'TroGiup-AnhBaoMat'; }
        else if (/Ph[aâ]n.*Lo[aạ]i/i.test(decodedHelp))             { helpModule = 'TroGiup-PhanLoai';  }
        else if (/Glossary/i.test(decodedHelp))                      { helpModule = 'TroGiup-Glossary';  }
        else if (/Changelog/i.test(decodedHelp))                     { helpModule = 'TroGiup-Changelog'; }
        else if (/Kh[oô]ng.*th[eể].*xem/i.test(decodedHelp))        { helpModule = 'TroGiup-KhongTheXem'; }
        else if (/Kh[oô]ng.*th[eể].*ch[iỉ]nh/i.test(decodedHelp))   { helpModule = 'TroGiup-KhongTheSua'; }
        else if (/Gi[oớ]i.*thi[eệ]u/i.test(decodedHelp))            { helpModule = 'TroGiup-GioiThieu'; }
        else if (/[Đd][aă]ng.*[Kk][yý]/i.test(decodedHelp))         { helpModule = 'TroGiup-DangKy';    }
        else if (/Ch[iỉ]nh.*s[uử]a/i.test(decodedHelp))             { helpModule = 'TroGiup-ChinhSua';  }
        else if (/Wikitext/i.test(decodedHelp))                      { helpModule = 'TroGiup-Wikitext';  }
        else if (/Quy.*t[aắ]c/i.test(decodedHelp))                  { helpModule = 'TroGiup-QuyTac';    }
        else if (/Li[eê]n.*h[eệ]/i.test(decodedHelp))               { helpModule = 'TroGiup-LienHe';    }
        else if (/Nhi[eệ]m.*V[uụ]/i.test(decodedHelp))              { helpModule = 'TroGiup-NhiemVu';   }
        else if (/FAQ/i.test(decodedHelp))                           { helpModule = 'TroGiup-FAQ';       }
        else if (/Che.*Ch[uữ]/i.test(decodedHelp))                  { helpModule = 'TroGiup-CheKy';     }
        else if (/Template/i.test(decodedHelp))                      { helpModule = 'TroGiup-Template';  }
        else if (/B[aả]ng/i.test(decodedHelp))                       { helpModule = 'TroGiup-Bang';      }
        else if (/Avatar/i.test(decodedHelp))                        { helpModule = 'TroGiup-AvatarLoi'; }
        else if (/B[iì]nh.*[Ll]u[aậ]n/i.test(decodedHelp))           { helpModule = 'TroGiup-BinhLuanBiChan'; }
        else if (/CSS[_\s]?JS/i.test(decodedHelp))                   { helpModule = 'TroGiup-CSSJS';      }
        else if (/\bLua\b/i.test(decodedHelp))                       { helpModule = 'TroGiup-Lua';        }
        else if (/Extensions/i.test(decodedHelp))                    { helpModule = 'TroGiup-Extensions'; }
        else                                                          { helpModule = 'TroGiup';            }

        // Nạp helper dùng chung TRƯỚC (MHHelp), rồi mới nạp trang con.
        // Trang chính TroGiup không phụ thuộc MHHelp nhưng vẫn an toàn nếu nạp sau.
        loadSequence('TroGiup-Common')
            .then(function () { loadAsync(helpModule); })
            .catch(function () { loadAsync(helpModule); }); /* fallback: vẫn nạp trang con */
    }

    // ── Trang cá nhân (namespace User = 2) ──────────────────────────────────
    if (namespaceNumber === 2) {
        var wgTitle = config.wgTitle || '';
        if (wgTitle.indexOf('/') === -1) {
            loadCSS('UserPage');
            /* Nạp AchievementCatalog TRƯỚC để UserPage hiện RP/Tier + huy hiệu */
            loadSequence('AchievementCatalog')
                .then(function () { loadAsync('UserPage'); })
                .catch(function () { loadAsync('UserPage'); }); /* fallback: vẫn nạp trang */
        } else if (/\/Chat$/.test(wgTitle) || /\/Chat$/.test(decodeURIComponent(wgTitle))) {
            /* Trang User:X/Chat — MAPLE-Chat đã load toàn cục, chỉ cần auto-tạo nếu page missing */
            if (isLoggedIn && $('.noarticletext, #noarticletext').length) {
                var API2 = new mw.Api();
                API2.get({ action: 'query', meta: 'tokens', type: 'csrf', format: 'json' })
                    .done(function (d) {
                        var token = d.query && d.query.tokens && d.query.tokens.csrftoken;
                        if (!token || token === '+\\') return;
                        API2.post({
                            action: 'edit',
                            title:  decodeURIComponent(wgTitle).replace(/_/g, ' '),
                            text:   '<!-- MAPLE Chat page — tự động tạo -->',
                            summary: 'Tự động tạo trang MAPLE Chat',
                            token:  token,
                            format: 'json'
                        }).done(function () { location.reload(); });
                    });
            }
        }
    }

    // ── Trang tài liệu mới (namespace chính) — dùng window.MHHelp (mhd3) ───────
    //    Nạp TroGiup.css + TroGiup-Common TRƯỚC rồi mới nạp module trang.
    var DOC_PAGES = {
        'Thủ Tục':       'ThuTuc',
        'Quy Tắc':       'QuyTac',
        'Đóng Góp':      'DongGop',
        'Giới Thiệu':    'GioiThieu',
        'Điều Khoản':    'DieuKhoan'
    };

    /* ── Điều Khoản phụ — trang con Điều_Khoản/{slug} ── */
    var DK_SUB_MAP = {
        'bình luận':       'DieuKhoan-BinhLuan',
        'binh luan':       'DieuKhoan-BinhLuan',
        'chat':            'DieuKhoan-Chat',
        'giới hạn tuổi':   'DieuKhoan-GioiHanTuoi',
        'gioi han tuoi':   'DieuKhoan-GioiHanTuoi',
        'độ tuổi':         'DieuKhoan-GioiHanTuoi',
        'do tuoi':         'DieuKhoan-GioiHanTuoi',
        'quyên góp':       'DieuKhoan-QuyenGop',
        'quyen gop':       'DieuKhoan-QuyenGop',
        'donate':          'DieuKhoan-QuyenGop',
        'tài khoản clone': 'DieuKhoan-TaiKhoanClone',
        'tai khoan clone': 'DieuKhoan-TaiKhoanClone',
        'clone':           'DieuKhoan-TaiKhoanClone',
        'bài rác':         'DieuKhoan-BaiRac',
        'bai rac':         'DieuKhoan-BaiRac',
        'bảo trì':         'DieuKhoan-BaiRac',
        'drama':           'DieuKhoan-Drama',
        'quyền sở hữu':    'DieuKhoan-QuyenSoHuu',
        'quyen so huu':    'DieuKhoan-QuyenSoHuu',
        'sở hữu':          'DieuKhoan-QuyenSoHuu',
        'tạo bài':         'DieuKhoan-TaoBlog',
        'tao bai':         'DieuKhoan-TaoBlog',
        'blog':            'DieuKhoan-TaoBlog',
        'dossier':         'DieuKhoan-TaoBlog',
        'writer':          'DieuKhoan-TaoBlog',
        'kiểm duyệt':      'DieuKhoan-KiemDuyet',
        'kiem duyet':      'DieuKhoan-KiemDuyet',
        'lọc từ':          'DieuKhoan-KiemDuyet',
        'loc tu':          'DieuKhoan-KiemDuyet',
    };
    (function () {
        var dkPrefix = 'Điều Khoản/';
        var dkPrefixNorm = 'Điều_Khoản/';
        var rawSub = null;
        if (normalizedPage.indexOf(dkPrefix) === 0) rawSub = normalizedPage.slice(dkPrefix.length).toLowerCase().replace(/_/g, ' ');
        else if (decodedPage.indexOf(dkPrefix) === 0) rawSub = decodedPage.slice(dkPrefix.length).toLowerCase().replace(/_/g, ' ');
        else if (pageName.indexOf(dkPrefixNorm) === 0) rawSub = decodeURIComponent(pageName.slice(dkPrefixNorm.length)).toLowerCase().replace(/_/g, ' ');
        if (rawSub) {
            var dkMod = DK_SUB_MAP[rawSub] || null;
            /* Thử match từng key có trong rawSub */
            if (!dkMod) {
                for (var dkKey in DK_SUB_MAP) {
                    if (DK_SUB_MAP.hasOwnProperty(dkKey) && rawSub.indexOf(dkKey) !== -1) {
                        dkMod = DK_SUB_MAP[dkKey]; break;
                    }
                }
            }
            if (dkMod) {
                loadCSS('TroGiup');
                loadSequence('TroGiup-Common')
                    .then(function () { loadAsync(dkMod); })
                    .catch(function () { loadAsync(dkMod); });
            }
        }
    })();
    /* Trang Dự án riêng dùng MHHelp nhưng không phải DOC_PAGES namespace chính */
    var docModule = DOC_PAGES[normalizedPage] || DOC_PAGES[decodedPage];
    if (docModule) {
        loadCSS('TroGiup');
        loadSequence('TroGiup-Common')
            .then(function () { loadAsync(docModule); })
            .catch(function () { loadAsync(docModule); }); /* fallback: vẫn nạp trang */
    }
    /* Văn bản pháp lý: 'Dự án:Bản quyền' (+ trang con /Giấy phép/...) và 'Dự án:Điều khoản' */
    function isLegalPrefix(p) {
        return p.indexOf('Dự án:Bản quyền') === 0 || p.indexOf('Dự án:Điều khoản') === 0;
    }
    var isLegalPage = isLegalPrefix(normalizedPage) || isLegalPrefix(decodedPage);

    /* Mọi trang nội dung mới (kể cả data-driven) — để ErrorPage không tranh #mw-content-text */
    var DATA_PAGES = ['Thành Tựu', 'Nhiệm Vụ', 'Bảng Tin', 'Sự Kiện', 'Donate', 'Ủng hộ', 'Dự án:Bộ phận', 'Tạo Bài Mới',
                      'Dự án:Phủ nhận chung', 'Dự án:Giới thiệu', 'Dự án:Kháng cáo',
                      'Dự án:Điều khoản nội dung', 'Dự án:Xin quyền Writer'];
    /* Sự Kiện có cả trang con Sự Kiện/{ID} → khớp theo tiền tố */
    var isEventPage = normalizedPage.indexOf('Sự Kiện') === 0 || decodedPage.indexOf('Sự Kiện') === 0;
    /* PhanHoi: modal chạy toàn cục; trang index + chi tiết cũng do cùng module xử lý */
    var isPhanHoiPage = decodedPage.indexOf('Dự án:Phản hồi') === 0 ||
                        normalizedPage.indexOf('Dự_án:Phản_hồi') === 0 ||
                        pageName.indexOf('D%E1%BB%B1_%C3%A1n:Ph%E1%BA%A3n_h%E1%BB%93i') === 0 ||
                        /* namespace 0 alias: /wiki/Phản_Hồi, /wiki/Phản_hồi */
                        /^Ph%E1%BA%A3n[_\s]?[Hh]%E1%BB%93i$/i.test(pageName) ||
                        /^Phản[_\s]?[Hh]ồi$/i.test(decodedPage) ||
                        /^Phản[_\s]?[Hh]ồi$/i.test(normalizedPage);
    var isThongBaoPageEarly = /^Th[oô]ng[_\s]b[aá]o\//i.test(decodedPage) ||
                              /^Th%C3%B4ng[_-]b%C3%A1o\//i.test(pageName);
    var isNewContentPage = !!docModule || isLegalPage || isEventPage || isPhanHoiPage ||
        isThongBaoPageEarly ||
        DATA_PAGES.indexOf(normalizedPage) !== -1 || DATA_PAGES.indexOf(decodedPage) !== -1;

    /* Sự Kiện (index + trang chi tiết Sự Kiện/{ID}) — module tự phân biệt theo URL */
    if (isEventPage) {
        loadCSS('SuKien');
        loadAsync('SuKien');
    }

    /* PhanHoi-Popup: modal toàn cục (mọi trang) */
    loadAsync('PhanHoi-Popup');
    /* PhanHoi: trang index + chi tiết (CSS + logic render) */
    if (isPhanHoiPage) {
        loadCSS('PhanHoi');
        loadAsync('PhanHoi');
    }

    // ── Trang bài viết Kho Lưu Trữ/{ID} — tab Tóm tắt/Thông tin + đánh giá/bình luận ──
    //    Khớp theo TIỀN TỐ (trang con), KHÔNG khớp trang index 'Kho Lưu Trữ' (xử lý ở switch).
    //    Kho_Lưu_Trữ.css đã được @import toàn cục trong Common.css → không cần loadCSS lại.
    (function () {
        var KLT_PREFIX = 'Kho Lưu Trữ/';
        var isArchiveArticle =
            normalizedPage.indexOf(KLT_PREFIX) === 0 ||
            decodedPage.indexOf(KLT_PREFIX) === 0;
        if (isArchiveArticle && action === 'view') {
            loadAsync('KhoLuuTru-Article');
        }
    })();

    // ── Các trang đặc biệt theo tên ──────────────────────────────────────────
    
    if (isWelcomePage) {
        mw.loader.using('mediawiki.api').then(function() {
            loadAsync('Welcome');
        });
    } else if (isUserAppealPage) {
        loadCSS('TroGiup');
        loadSequence('TroGiup-Common')
            .then(function () { loadAsync('KhangCao'); })
            .catch(function () { loadAsync('KhangCao'); });
    } else switch (normalizedPage) {
        case 'Kho Lưu Trữ':
            loadAsync('Kho_Lưu_Trữ');
            break;
        case 'Hướng Dẫn Viết':
            loadAsync('Hướng_Dẫn_Viết');
            break;
        case 'Dự án:All User':
        case 'Dự_án:All_User':
            loadAsync('AllUsers');
            break;
        case 'Dự án:WhatsNew':
        case 'Dự_án:WhatsNew':
            loadCSS('WhatsNews');
            loadAsync('WhatsNews');
            break;
        case 'Dự án:Open':
        case 'Dự_án:Open':
        case 'Dự án:Open/link':
        case 'Dự_án:Open/link':
        case 'Dự_án:Open%2Flink':
            loadAsync('MAPLE-OpenLink');
            break;
        /* ── Trang nội dung mới (data-driven) ── */
        case 'Thành Tựu':
            loadCSS('ThanhTuu');
            loadSequence('AchievementCatalog')
                .then(function () { loadAsync('ThanhTuu'); })
                .catch(function () { loadAsync('ThanhTuu'); }); /* fallback: vẫn nạp trang */
            break;
        case 'Nhiệm Vụ':
        case 'Nhiệm_Vụ':
            loadCSS('NhiemVu');
            loadSequence('AchievementCatalog')
                .then(function () { loadAsync('NhiemVu'); })
                .catch(function () { loadAsync('NhiemVu'); }); /* fallback: vẫn nạp trang */
            break;
        case 'Bảng Tin':
            loadCSS('BangTin'); loadAsync('BangTin');
            break;
        /* 'Sự Kiện' (index + Sự Kiện/{ID}) xử lý ở khối isEventPage phía trên */
        case 'Donate':
        case 'Ủng hộ':
            loadCSS('Donate'); loadAsync('Donate');
            break;
        case 'Dự án:Bộ phận':
        case 'Dự_án:Bộ_phận':
            loadCSS('BoPhan'); loadAsync('BoPhan');
            break;
        case 'Tạo Bài Mới':
        case 'Tạo_Bài_Mới':
            loadCSS('CreateDossier'); loadAsync('CreateDossier');
            break;
        case 'Dự án:Phủ nhận chung':
        case 'Dự_án:Phủ_nhận_chung':
            loadCSS('TroGiup');
            loadSequence('TroGiup-Common')
                .then(function () { loadAsync('PhuNhan'); })
                .catch(function () { loadAsync('PhuNhan'); });
            break;
        case 'Dự án:Giới thiệu':
        case 'Dự_án:Giới_thiệu':
            loadCSS('TroGiup');
            loadSequence('TroGiup-Common')
                .then(function () { loadAsync('DuAn-GioiThieu'); })
                .catch(function () { loadAsync('DuAn-GioiThieu'); });
            break;
        case 'Dự án:Kháng cáo':
        case 'Dự_án:Kháng_cáo':
            loadCSS('TroGiup');
            loadSequence('TroGiup-Common')
                .then(function () { loadAsync('KhangCao'); })
                .catch(function () { loadAsync('KhangCao'); });
            break;
        case 'Dự án:Điều khoản nội dung':
        case 'Dự_án:Điều_khoản_nội_dung':
            loadCSS('TroGiup');
            loadSequence('TroGiup-Common')
                .then(function () { loadAsync('DieuKhoan-Writer'); })
                .catch(function () { loadAsync('DieuKhoan-Writer'); });
            break;
        case 'Dự án:Xin quyền Writer':
        case 'Dự_án:Xin_quyền_Writer':
            loadCSS('TroGiup');
            loadSequence('TroGiup-Common')
                .then(function () { loadAsync('XinQuyenWriter'); })
                .catch(function () { loadAsync('XinQuyenWriter'); });
            break;

        /* ── Điều Khoản trang con trực tiếp (URL rõ ràng) ── */
        case 'Điều Khoản/Bình Luận':
        case 'Điều_Khoản/Bình_Luận':
            loadCSS('TroGiup');
            loadSequence('TroGiup-Common').then(function () { loadAsync('DieuKhoan-BinhLuan'); }).catch(function () { loadAsync('DieuKhoan-BinhLuan'); });
            break;
        case 'Điều Khoản/Chat':
        case 'Điều_Khoản/Chat':
            loadCSS('TroGiup');
            loadSequence('TroGiup-Common').then(function () { loadAsync('DieuKhoan-Chat'); }).catch(function () { loadAsync('DieuKhoan-Chat'); });
            break;
        case 'Điều Khoản/Giới Hạn Tuổi':
        case 'Điều_Khoản/Giới_Hạn_Tuổi':
            loadCSS('TroGiup');
            loadSequence('TroGiup-Common').then(function () { loadAsync('DieuKhoan-GioiHanTuoi'); }).catch(function () { loadAsync('DieuKhoan-GioiHanTuoi'); });
            break;
        case 'Điều Khoản/Quyên Góp':
        case 'Điều_Khoản/Quyên_Góp':
            loadCSS('TroGiup');
            loadSequence('TroGiup-Common').then(function () { loadAsync('DieuKhoan-QuyenGop'); }).catch(function () { loadAsync('DieuKhoan-QuyenGop'); });
            break;
        case 'Điều Khoản/Tài Khoản Clone':
        case 'Điều_Khoản/Tài_Khoản_Clone':
            loadCSS('TroGiup');
            loadSequence('TroGiup-Common').then(function () { loadAsync('DieuKhoan-TaiKhoanClone'); }).catch(function () { loadAsync('DieuKhoan-TaiKhoanClone'); });
            break;
        case 'Điều Khoản/Bài Rác':
        case 'Điều_Khoản/Bài_Rác':
            loadCSS('TroGiup');
            loadSequence('TroGiup-Common').then(function () { loadAsync('DieuKhoan-BaiRac'); }).catch(function () { loadAsync('DieuKhoan-BaiRac'); });
            break;
        case 'Điều Khoản/Drama':
        case 'Điều_Khoản/Drama':
            loadCSS('TroGiup');
            loadSequence('TroGiup-Common').then(function () { loadAsync('DieuKhoan-Drama'); }).catch(function () { loadAsync('DieuKhoan-Drama'); });
            break;
        case 'Điều Khoản/Quyền Sở Hữu':
        case 'Điều_Khoản/Quyền_Sở_Hữu':
            loadCSS('TroGiup');
            loadSequence('TroGiup-Common').then(function () { loadAsync('DieuKhoan-QuyenSoHuu'); }).catch(function () { loadAsync('DieuKhoan-QuyenSoHuu'); });
            break;
        case 'Điều Khoản/Tạo Bài':
        case 'Điều_Khoản/Tạo_Bài':
            loadCSS('TroGiup');
            loadSequence('TroGiup-Common').then(function () { loadAsync('DieuKhoan-TaoBlog'); }).catch(function () { loadAsync('DieuKhoan-TaoBlog'); });
            break;
        case 'Điều Khoản/Kiểm Duyệt':
        case 'Điều_Khoản/Kiểm_Duyệt':
            loadCSS('TroGiup');
            loadSequence('TroGiup-Common').then(function () { loadAsync('DieuKhoan-KiemDuyet'); }).catch(function () { loadAsync('DieuKhoan-KiemDuyet'); });
            break;
    }

    /* ── Lazy DieuKhoan popups theo tính năng ────────────────────────────────
       Mỗi tính năng lần đầu dùng → kiểm tra localStorage → nếu chưa đọc →
       hiện popup tóm tắt điều khoản tương ứng. User bấm "Đã hiểu" → lưu flag.
       Hook: mw.hook('maple.feature.first_use').fire({ feature: 'comments' })
       được gắn từ MAPLE-Comments.js / MAPLE-Chat.js / CreateDossier.js v.v.
    ── */
    (function () {
        var FEATURE_TOS = {
            'comments':    { key: 'maple_tos_comments_seen', mod: 'DieuKhoan-BinhLuan',    label: 'Bình Luận' },
            'chat':        { key: 'maple_tos_chat_seen',     mod: 'DieuKhoan-Chat',         label: 'MAPLE Chat' },
            'create_post': { key: 'maple_tos_create_seen',   mod: 'DieuKhoan-TaoBlog',      label: 'Tạo Bài' },
            'upload':      { key: 'maple_tos_upload_seen',   mod: 'DieuKhoan-TaoBlog',      label: 'Tải lên' },
        };

        mw.hook('maple.feature.first_use').add(function (data) {
            if (!data || !data.feature) return;
            var cfg2 = FEATURE_TOS[data.feature];
            if (!cfg2) return;
            try { if (localStorage.getItem(cfg2.key)) return; } catch (e) { return; }

            /* Nạp module điều khoản + hiện mini-popup */
            loadCSS('TroGiup');
            loadSequence('TroGiup-Common').then(function () {
                /* Gắn hook để module biết cần hiện popup */
                mw.hook('maple.tos_popup.request').fire({
                    module:  cfg2.mod,
                    label:   cfg2.label,
                    doneKey: cfg2.key
                });
                loadAsync(cfg2.mod);
            });
        });

        /* ── Tóm tắt popup mini (Chuyển thành Blocking Modal toàn màn hình) ── */
        var SUMMARIES = {
            'maple_tos_chat_seen': {
                tag: 'ĐIỀU KHOẢN // CHAT HỆ THỐNG',
                title: 'Quy tắc sử dụng MAPLE Chat',
                rules: [
                    '📌 <strong>Yêu cầu:</strong> Điểm RP ≥ 1, tuổi nick ≥ 7 ngày & email đã xác thực.',
                    '💬 <strong>Quy chế phát ngôn:</strong> Không lăng mạ, quấy rối, spam hoặc gửi liên kết độc hại.',
                    '🛡️ <strong>Ranh giới cá nhân:</strong> Tôn trọng đối phương. Cố nhắn tin khi bị block = quấy rối.'
                ],
                link: '/wiki/Điều_Khoản/Chat'
            },
            'maple_tos_comments_seen': {
                tag: 'ĐIỀU KHOẢN // BÌNH LUẬN',
                title: 'Nội quy bình luận & Thảo luận',
                rules: [
                    '💬 <strong>Tương tác văn minh:</strong> Thảo luận lịch sự, tôn trọng ý kiến đặc vụ khác.',
                    '🙈 <strong>Không phá cốt truyện:</strong> Bắt buộc dùng cú pháp spoiler để ẩn tiết lộ lore.',
                    '🚫 <strong>Chống spam:</strong> Cấm bình luận quảng cáo, thô tục hoặc spam vô nghĩa.'
                ],
                link: '/wiki/Điều_Khoản/Bình_Luận'
            },
            'maple_tos_create_seen': {
                tag: 'ĐIỀU KHOẢN // TẠO HỒ SƠ',
                title: 'Quy chuẩn biên soạn hồ sơ',
                rules: [
                    '✍️ <strong>Chuẩn định dạng:</strong> Hồ sơ viết theo mẫu M.A.P.L.E (Thực thể, Vật phẩm...).',
                    '⚠️ <strong>Bản quyền nội dung:</strong> Cấm sao chép nguyên văn (copy-paste) từ wiki khác.',
                    '🔍 <strong>Hàng chờ duyệt:</strong> Bài viết cần được Kiểm Duyệt Viên duyệt trước khi phát hành.'
                ],
                link: '/wiki/Điều_Khoản/Tạo_Bài'
            },
            'maple_tos_upload_seen': {
                tag: 'ĐIỀU KHOẢN // TẢI LÊN FILE',
                title: 'Quy tắc đăng tải hình ảnh',
                rules: [
                    '📸 <strong>Tính liên quan:</strong> Chỉ tải lên hình ảnh liên quan hồ sơ, nhật ký sinh tồn.',
                    '⚠️ <strong>Nội dung an toàn:</strong> Không tải ảnh nhạy cảm, bạo lực hoặc vi phạm bản quyền.',
                    '🏷️ <strong>Thẻ phân loại:</strong> Cần đặt tên file rõ ràng, ghi nguồn và gắn thẻ chuẩn xác.'
                ],
                link: '/wiki/Điều_Khoản'
            }
        };

        mw.hook('maple.tos_popup.request').add(function (req) {
            if (!req || !req.doneKey) return;
            /* Tránh double-show */
            if (document.getElementById('maple-tos-mini-overlay')) return;
            try { if (localStorage.getItem(req.doneKey)) return; } catch (e) {}

            var sum = SUMMARIES[req.doneKey] || {
                tag: 'ĐIỀU KHOẢN // HỆ THỐNG',
                title: 'Điều khoản sử dụng tính năng',
                rules: ['Vui lòng tuân thủ quy chế chung của Wiki.'],
                link: '/wiki/Điều_Khoản'
            };

            var s = document.createElement('style');
            s.textContent = [
                '#maple-tos-mini-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75);',
                '  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);',
                '  z-index: 100000; display: flex; align-items: center; justify-content: center;',
                '  animation: mtm-fade-in .3s ease-out; }',
                '#maple-tos-mini { width: min(480px, 95vw); background: #080808;',
                '  border: 1px solid rgba(239, 68, 68, 0.25); border-top: 4px solid #ef4444;',
                '  border-radius: 12px; font-family: "JetBrains Mono", monospace; color: #e4e4e7;',
                '  box-shadow: 0 30px 100px rgba(0,0,0,0.9), 0 0 20px rgba(239,68,68,0.1);',
                '  animation: mtm-scale-in .35s cubic-bezier(0.16, 1, 0.3, 1);',
                '  display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; }',
                '@keyframes mtm-fade-in { from { opacity: 0; } to { opacity: 1; } }',
                '@keyframes mtm-scale-in { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }',
                '#maple-tos-mini-h { padding: 18px 24px 14px; border-bottom: 1px solid #1c1c1c; text-align: left; }',
                '#maple-tos-mini-tag { font-size: 8px; letter-spacing: .25em; color: #ef4444; margin-bottom: 4px; font-weight: 700; }',
                '#maple-tos-mini-title { font-size: 14px; font-weight: 700; color: #e4e4e7; letter-spacing: .02em; }',
                '#maple-tos-mini-b { padding: 20px 24px; font-size: 11px; color: #a1a1aa; line-height: 1.8; text-align: left; }',
                '#maple-tos-mini-b li { margin-bottom: 10px; }',
                '#maple-tos-mini-b li:last-child { margin-bottom: 0; }',
                '#maple-tos-mini-f { padding: 14px 24px 20px; display: flex; gap: 10px; border-top: 1px solid #1c1c1c; }',
                '#maple-tos-mini-ok { flex: 1.5; font-family: inherit; font-size: 11px; letter-spacing: .1em;',
                '  font-weight: 700; text-transform: uppercase; padding: 10px 16px; background: #22c55e;',
                '  border: 1px solid #22c55e; color: #fff; border-radius: 6px; cursor: pointer; transition: all .15s; }',
                '#maple-tos-mini-ok:hover { background: #16a34a; border-color: #16a34a; }',
                '#maple-tos-mini-full { flex: 1; font-family: inherit; font-size: 10px; letter-spacing: .08em;',
                '  font-weight: 600; text-transform: uppercase; padding: 10px 14px; background: transparent;',
                '  border: 1px solid #27272a; color: #a1a1aa; border-radius: 6px; cursor: pointer; transition: all .15s;',
                '  text-decoration: none; text-align: center; display: flex; align-items: center; justify-content: center; }',
                '#maple-tos-mini-full:hover { border-color: #52525b; color: #e4e4e7; }'
            ].join('\n');
            document.head.appendChild(s);

            var overlay = document.createElement('div');
            overlay.id = 'maple-tos-mini-overlay';

            var panel = document.createElement('div');
            panel.id = 'maple-tos-mini';
            panel.setAttribute('role', 'alertdialog');
            
            var listItems = sum.rules.map(function(r) { return '<li>' + r + '</li>'; }).join('');

            panel.innerHTML =
                '<div id="maple-tos-mini-h">' +
                '  <div id="maple-tos-mini-tag">' + esc(sum.tag) + '</div>' +
                '  <div id="maple-tos-mini-title">' + esc(sum.title) + '</div>' +
                '</div>' +
                '<div id="maple-tos-mini-b">' +
                '  <ul style="margin: 0; padding-left: 20px; list-style-type: square;">' + listItems + '</ul>' +
                '</div>' +
                '<div id="maple-tos-mini-f">' +
                '  <a id="maple-tos-mini-full" href="' + esc(sum.link) + '" target="_blank">CHI TIẾT ➔</a>' +
                '  <button id="maple-tos-mini-ok">TÔI ĐỒNG Ý & TIẾP TỤC</button>' +
                '</div>';
            
            overlay.appendChild(panel);
            document.body.appendChild(overlay);

            document.getElementById('maple-tos-mini-ok').addEventListener('click', function () {
                try { localStorage.setItem(req.doneKey, '1'); } catch (e) {}
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            });
        });
    })();

    /* ── Popup HỎI TUỔI khi cần (Chat / Bình luận lần đầu, chưa rõ tuổi) ──────────
       Kiểm duyệt 2 bản (MAPLE-Moderation v2) cần biết người dùng ≥18 hay không.
       Nguồn chính: localStorage['maple_signup_age'] (NewSignupPage ghi khi đăng ký).
       Người dùng CŨ / xoá cache → chưa có key → hỏi 1 lần khi dùng tính năng có
       kiểm duyệt; trong khi chưa trả lời, Moderation mặc định áp bản GẮT (teen). ── */
    (function () {
        var AGE_KEY   = 'maple_signup_age';
        var ASKED_KEY = 'maple_age_asked';

        function ageKnown() {
            try { return /^(1[3-9]|[2-9]\d)$/.test(String(localStorage.getItem(AGE_KEY) || '')); }
            catch (e) { return true; } /* không truy cập được storage → đừng làm phiền */
        }
        function alreadyAsked() {
            try { return !!localStorage.getItem(ASKED_KEY); } catch (e) { return true; }
        }
        function remember(age) {
            try {
                if (window.MAPLE && window.MAPLE.Moderation && window.MAPLE.Moderation.setAudience) {
                    window.MAPLE.Moderation.setAudience(age);
                } else {
                    localStorage.setItem(AGE_KEY, String(age));
                }
                localStorage.setItem(ASKED_KEY, '1');
            } catch (e) {}
        }

        function showAgePopup() {
            if (ageKnown() || alreadyAsked()) return;
            if (document.getElementById('maple-age-mini')) return;

            var s = document.createElement('style');
            s.textContent = [
                '#maple-age-mini{position:fixed;bottom:80px;right:16px;z-index:99999;',
                '  width:min(340px,calc(100vw - 32px));background:#060606;',
                '  border:1px solid #1e1e1e;border-top:2px solid #ef4444;',
                '  font-family:"JetBrains Mono",ui-monospace,monospace;',
                '  box-shadow:0 20px 60px rgba(0,0,0,.7);animation:mtm-in .25s ease}',
                '#maple-age-mini-h{padding:12px 16px 10px;border-bottom:1px solid #111}',
                '#maple-age-mini-tag{font-size:7px;letter-spacing:.25em;color:#ef4444;margin-bottom:3px}',
                '#maple-age-mini-title{font-size:11px;font-weight:700;color:#e4e4e7;letter-spacing:.06em}',
                '#maple-age-mini-b{padding:10px 16px;font-size:8.5px;color:#52525b;line-height:1.7;letter-spacing:.04em}',
                '#maple-age-mini-b a{color:#71717a;text-decoration:underline}',
                '#maple-age-mini-f{padding:10px 16px 14px;display:flex;gap:8px}',
                '.maple-age-btn{flex:1;font-family:inherit;font-size:8.5px;letter-spacing:.12em;',
                '  font-weight:700;text-transform:uppercase;padding:9px 12px;cursor:pointer;transition:all .15s}',
                '#maple-age-yes{background:#22c55e;border:1px solid #22c55e;color:#fff}',
                '#maple-age-yes:hover{background:#16a34a;border-color:#16a34a}',
                '#maple-age-no{background:transparent;border:1px solid #1e1e1e;color:#a1a1aa}',
                '#maple-age-no:hover{border-color:#52525b;color:#e4e4e7}',
            ].join('');
            document.head.appendChild(s);

            var panel = document.createElement('div');
            panel.id = 'maple-age-mini';
            panel.setAttribute('role', 'alertdialog');
            panel.innerHTML =
                '<div id="maple-age-mini-h">' +
                '  <div id="maple-age-mini-tag">KIỂM DUYỆT // ĐỘ TUỔI</div>' +
                '  <div id="maple-age-mini-title">Bạn đã đủ 18 tuổi chưa?</div>' +
                '</div>' +
                '<div id="maple-age-mini-b">' +
                '  M.A.P.L.E lọc nội dung theo độ tuổi. Chọn đúng để áp dụng mức phù hợp. ' +
                '  Mặc định wiki dùng chế độ <strong>dưới 18 tuổi</strong> (chặt hơn) cho tới khi bạn xác nhận. ' +
                '  <a href="/wiki/%C4%90i%E1%BB%81u_Kho%E1%BA%A3n/Ki%E1%BB%83m_Duy%E1%BB%87t" target="_blank">Tìm hiểu →</a>' +
                '</div>' +
                '<div id="maple-age-mini-f">' +
                '  <button class="maple-age-btn" id="maple-age-no">TÔI DƯỚI 18</button>' +
                '  <button class="maple-age-btn" id="maple-age-yes">TÔI ĐỦ 18+</button>' +
                '</div>';
            document.body.appendChild(panel);

            function close() { if (panel.parentNode) panel.parentNode.removeChild(panel); }
            document.getElementById('maple-age-yes').addEventListener('click', function () { remember(18); close(); });
            document.getElementById('maple-age-no').addEventListener('click', function () { remember(13); close(); });
        }

        if (isLoggedIn) {
            mw.hook('maple.chat.first_open').add(showAgePopup);
            mw.hook('maple.feature.first_use').add(function (data) {
                if (data && (data.feature === 'comments' || data.feature === 'chat')) showAgePopup();
            });
        }
    })();

    /* Trang thông báo cá nhân Thông_báo/{username} — render JSON thành UI */
    if (isThongBaoPageEarly) {
        loadAsync('ThongBao');
    }

    // ── Văn bản pháp lý (Bản quyền / Giấy phép) — engine MCLv1 dùng chung ─────
    //    MCLv1.js nay render NHIỀU văn bản (MCL, M-SA, M BY-SA, Điều khoản BQ)
    //    theo đúng pageName. Mọi trang dưới "Dự án:Bản quyền" đều nạp engine này.
    if (isLegalPage) {
        console.log('[M.A.P.L.E] Nạp engine văn bản pháp lý (MCLv1)...');
        loadCSS('MCLv1');
        loadAsync('MCLv1');
    }

    // ── ErrorPage ─────────────────────────────────────────────────────────────
    if ($('.noarticletext, #noarticletext').length && action === 'view' && !isNewContentPage && !isUserAppealPage) {
        if (pageName.indexOf('Chờ_Duyệt') === -1 && pageName.indexOf('Chờ Duyệt') === -1 && normalizedPage.indexOf('Dự án:Open') === -1) {
            loadAsync('ErrorPage');
        }
    }

    // ── Special:CreateAccount — trang đăng ký tùy chỉnh ─────────────────────
    if (config.wgCanonicalSpecialPageName === 'CreateAccount') {
        loadAsync('NewSignupPage');
    }

    // ── Blocked — tài khoản bị khoá/ban ─────────────────────────────────────
    if ($('.mw-blockedtext, .mw-blocked-message').length && !isUserAppealPage) {
        loadAsync('MAPLE-Blocked');
    }

    // ── ViewAccess — trang bị từ chối quyền đọc ──────────────────────────────
    if (action === 'view' && $('.mw-permissionerrors').length) {
        loadCSS('MAPLE-Base');
        loadCSS('MAPLE-NoAccess');
        loadCSS('MAPLE-ViewAccess');
        loadSequence('MAPLE-Core')
            .then(function () { return loadSequence('MAPLE-ViewAccess'); })
            .catch(function (err) {
                console.error('[M.A.P.L.E] Không thể nạp màn hình từ chối đọc:', err);
            });
    }

    // ════════════════════════════════════════════════════════════════
    // 3. M.A.P.L.E EDIT ENGINE
    // ════════════════════════════════════════════════════════════════
    if (action === 'edit' || action === 'submit') {

        // ── Người ĐÃ đăng nhập nhưng KHÔNG có quyền sửa trang ──────────────────
        //    → màn hình "Truy cập bị từ chối" (403) thay vì trình soạn thảo.
        //    (Khách chưa đăng nhập do GuestGate-Edit xử lý riêng.)
        if (isLoggedIn && config.wgIsProbablyEditable === false) {
            loadCSS('MAPLE-Base');
            loadCSS('MAPLE-NoAccess');
            loadSequence('MAPLE-Core')
                .then(function () { return loadSequence('MAPLE-NoAccess'); })
                .catch(function (err) {
                    console.error('[M.A.P.L.E] Không thể nạp màn hình từ chối truy cập:', err);
                });
        } else {
            var cssFiles = ['MAPLE-Base', 'MAPLE-Editor', 'MAPLE-Preview'];
            cssFiles.forEach(loadCSS);

            loadSequence('MAPLE-Core')
                .then(function () { return loadSequence('MAPLE-Toolbar');    })
                .then(function () { return loadSequence('MAPLE-SubmitWait'); })
                .then(function () { return loadSequence('MAPLE-Editor');     })
                .then(function () {
                    mw.hook('wikipage.editform').add(function () {
                        if (window.MAPLE && MAPLE.activateUI) MAPLE.activateUI();
                        $('#wpSave').hide();
                    });
                })
                .catch(function (err) {
                    console.error('[M.A.P.L.E] Edit engine load thất bại:', err);
                });
        }
    }

})(mediaWiki, jQuery);