/**
 * ════════════════════════════════════════════════════════════════════════
 * M.A.P.L.E — MediaWiki:WhatsNews.js
 * Trang "Có gì mới" — phong cách Google Chrome "See what's new".
 *
 * Hiển thị trên trang:  Dự án:WhatsNew
 * Nội dung do admin tự sửa tại:  MediaWiki:WhatsNews-data.json
 *
 * Cấu trúc JSON (phần dùng cho trang này):
 *   {
 *     "title": "Có gì mới trong M.A.P.L.E",
 *     "sub":   "Khám phá những tính năng mới nhất",
 *     "features": [
 *       { "key":"...", "navLabel":"Tên thẻ", "navColor":"#3b82f6",
 *         "title":"Tiêu đề lớn", "intro":"Đoạn mô tả",
 *         "bullets":["...", "..."],          // gạch đầu dòng (tuỳ chọn)
 *         "steps":["...", "..."],            // các bước đánh số (tuỳ chọn)
 *         "image":"https://.../anh.png" }    // ảnh minh hoạ (tuỳ chọn)
 *     ]
 *   }
 * (Khối "items" vẫn dùng cho popup WhatsNew-Popup.js.)
 * ════════════════════════════════════════════════════════════════════════
 */
(function () {
    'use strict';

    var state = {
        idx: 0,
        isPlaying: true,
        readFeatures: JSON.parse(localStorage.getItem('maple_whatsnew_read_features') || '[]'),
        feedbackData: {}
    };
    var version = '0.0.0';
    var features = [];

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
        });
    }

    /* Logo M.A.P.L.E (lá phong) — lấy từ HomePage, id filter riêng cho trang này */
    var MAPLE_LOGO =
        '<svg width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<defs><filter id="wn-glow"><feGaussianBlur stdDeviation="1.5" result="b"/>' +
        '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
        '<path d="M50 5L95 40L80 95H20L5 40L50 5Z" stroke="#450a0a" stroke-width="0.8" opacity="0.6"/>' +
        '<g filter="url(#wn-glow)">' +
        '<path d="M50 15V85M50 15L85 45L50 40L15 45L50 15Z" stroke="#ef4444" stroke-width="2" stroke-linejoin="miter"/>' +
        '<path d="M30 60L50 85L70 60" stroke="#ef4444" stroke-width="2"/>' +
        '</g>' +
        '<circle cx="50" cy="40" r="5.5" fill="#ef4444" filter="url(#wn-glow)" class="maple-eye-pulse"/>' +
        '</svg>';

    function el(tag, cls, html) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (html != null) e.innerHTML = html;
        return e;
    }

    function init() {
        var pn = mw.config.get('wgPageName') || '';
        var dec = pn;
        try { dec = decodeURIComponent(pn); } catch (e) {}
        var norm = dec.replace(/_/g, ' ');
        if (norm !== 'Dự án:WhatsNew') return;

        var root = document.getElementById('mw-content-text');
        if (!root) return;

        hideChrome();
        root.innerHTML = '<div id="wn-root"><div class="wn-loading">// ĐANG TẢI…</div></div>';
        var box = document.getElementById('wn-root');

        $.getJSON(mw.config.get('wgScriptPath') + '/api.php', {
            action:  'query',
            titles:  'MediaWiki:WhatsNews-data.json',
            prop:    'revisions',
            rvprop:  'content',
            rvslots: 'main',
            format:  'json',
            origin:  '*'
        })
        .done(function (apiData) {
            try {
                var pages  = apiData.query.pages;
                var pageId = Object.keys(pages)[0];
                if (pageId === '-1' || !pages[pageId].revisions) {
                    return renderEmpty(box);
                }
                var raw  = pages[pageId].revisions[0].slots.main['*'];
                var data = JSON.parse(raw);
                render(box, data);
            } catch (e) {
                box.innerHTML = '<div class="wn-error">// LỖI ĐỌC DỮ LIỆU<br><span>' + esc(e.message) + '</span></div>';
            }
        })
        .fail(function (xhr, status, err) {
            box.innerHTML = '<div class="wn-error">// KHÔNG TẢI ĐƯỢC DỮ LIỆU<br><span>' + esc(status + ' — ' + err) + '</span></div>';
        });
    }

    function hideChrome() {
        if (document.getElementById('wn-hidechrome')) return;
        var s = document.createElement('style');
        s.id = 'wn-hidechrome';
        s.textContent =
            '#firstHeading,#siteSub,#contentSub,.mw-indicators,.printfooter,#catlinks,' +
            '.mw-body-header{display:none!important}' +
            '#mw-content-text,.mw-body,#content,.mw-body-content{background:transparent!important;' +
            'border:none!important}';
        document.head.appendChild(s);
    }

    function renderEmpty(box) {
        box.innerHTML = '<div class="wn-empty">// CHƯA CÓ NỘI DUNG NÀO ĐƯỢC ĐĂNG.</div>';
    }

    function render(box, data) {
        features = (data && data.features) || [];
        version = String(data.version || '0.0.0');

        if (!features.length) { renderEmpty(box); return; }

        box.innerHTML = '';

        // Fetch feedback counts
        var api = new mw.Api();
        api.get({
            action: 'query',
            titles: 'Dự án:WhatsNew/Feedback.json',
            prop: 'revisions',
            rvprop: 'content',
            rvslots: 'main',
            format: 'json',
            origin: '*'
        }).done(function (res) {
            try {
                var pages = res.query.pages;
                var pid = Object.keys(pages)[0];
                if (pid !== '-1' && pages[pid].revisions) {
                    state.feedbackData = JSON.parse(pages[pid].revisions[0].slots.main['*']);
                }
            } catch (e) {}
            // Update feedback counts in current view
            var f = features[state.idx];
            if (f) {
                var fdb = state.feedbackData[f.key] || { up: 0, down: 0 };
                var upVal = document.querySelector('.wn-feedback-up');
                var downVal = document.querySelector('.wn-feedback-down');
                if (upVal) upVal.innerHTML = '👍 ' + fdb.up;
                if (downVal) downVal.innerHTML = '👎 ' + fdb.down;
            }
        });

        /* ── Tiêu đề trang (logo M.A.P.L.E + title) ── */
        var head = el('div', 'wn-head');
        head.appendChild(el('div', 'wn-logo', MAPLE_LOGO));
        var headText = el('div', 'wn-head-text');
        headText.appendChild(el('h1', 'wn-title', esc((data && data.title) || 'Có gì mới')));
        if (data && data.sub) headText.appendChild(el('p', 'wn-sub', esc(data.sub)));
        head.appendChild(headText);
        box.appendChild(head);

        /* ── Khu vực feature (2 cột) ── */
        var stage = el('div', 'wn-stage');
        box.appendChild(stage);

        /* ── Autoplay timer ── */
        var autoplayTimer = null;
        function startAutoplay() {
            stopAutoplay();
            if (state.isPlaying && features.length > 1) {
                autoplayTimer = setInterval(function () {
                    go(state.idx + 1);
                }, 8000);
            }
        }
        function stopAutoplay() {
            if (autoplayTimer) {
                clearInterval(autoplayTimer);
                autoplayTimer = null;
            }
        }

        // Play/Pause button
        var playBtn = el('button', 'wn-play-btn', state.isPlaying ? '⏸' : '▶');
        playBtn.type = 'button';
        playBtn.title = 'Tạm dừng / Tiếp tục tự động chuyển';
        playBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            state.isPlaying = !state.isPlaying;
            playBtn.textContent = state.isPlaying ? '⏸' : '▶';
            playBtn.classList.toggle('paused', !state.isPlaying);
            if (state.isPlaying) {
                startAutoplay();
            } else {
                stopAutoplay();
            }
        });

        // Progress dots
        var dotsWrap = el('div', 'wn-dots');
        features.forEach(function (_, i) {
            var dot = el('span', 'wn-dot' + (i === 0 ? ' active' : ''));
            dot.addEventListener('click', function () { go(i); });
            dotsWrap.appendChild(dot);
        });

        var ctrlBar = el('div', 'wn-controls');
        ctrlBar.appendChild(playBtn);
        ctrlBar.appendChild(dotsWrap);
        box.appendChild(ctrlBar);

        // Pause autoplay when hovering on root
        box.addEventListener('mouseenter', stopAutoplay);
        box.addEventListener('mouseleave', startAutoplay);

        /* ── Carousel dưới ── */
        var navWrap = el('div', 'wn-nav');
        var prevBtn = el('button', 'wn-nav-arrow', '‹'); prevBtn.type = 'button';
        var track   = el('div', 'wn-nav-track');
        var nextBtn = el('button', 'wn-nav-arrow', '›'); nextBtn.type = 'button';
        navWrap.appendChild(prevBtn);
        navWrap.appendChild(track);
        navWrap.appendChild(nextBtn);
        box.appendChild(navWrap);

        /* Build các thẻ nav */
        features.forEach(function (f, i) {
            var color = f.navColor || '#3b82f6';
            var card = el('button', 'wn-nav-card');
            card.type = 'button';
            card.style.setProperty('--wn-accent', color);
            var isRead = state.readFeatures.indexOf(f.key) !== -1;
            card.classList.toggle('read', isRead);
            card.innerHTML =
                '<span class="wn-nav-card-label">' + esc(f.navLabel || f.title || ('Mục ' + (i + 1))) + '</span>' +
                '<span class="wn-nav-card-thumb">' + thumbHtml(f) + '</span>';
            card.addEventListener('click', function () { go(i); });
            track.appendChild(card);
        });

        function go(i) {
            state.idx = (i + features.length) % features.length;
            renderFeature(stage, features[state.idx]);
            /* highlight thẻ nav đang chọn */
            Array.prototype.forEach.call(track.children, function (c, k) {
                c.classList.toggle('active', k === state.idx);
                var f = features[k];
                c.classList.toggle('read', state.readFeatures.indexOf(f.key) !== -1);
            });
            /* highlight dots */
            Array.prototype.forEach.call(dotsWrap.children, function (d, k) {
                d.classList.toggle('active', k === state.idx);
            });
            /* cuộn thẻ đang chọn vào tầm nhìn */
            var active = track.children[state.idx];
            if (active && active.scrollIntoView) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            
            if (state.isPlaying) {
                startAutoplay();
            }
        }

        prevBtn.addEventListener('click', function () { go(state.idx - 1); });
        nextBtn.addEventListener('click', function () { go(state.idx + 1); });

        go(0);
        if (state.isPlaying) {
            startAutoplay();
        }
    }

    /* Mockup nhỏ cho thẻ nav (ảnh thu nhỏ hoặc placeholder) */
    function thumbHtml(f) {
        if (f.image) {
            return '<img src="' + esc(f.image) + '" alt="" loading="lazy">';
        }
        if (f.iframe || f.page || (f.mock && MOCKS[f.mock])) {
            /* Thumbnail mini cho demo tương tác / nhúng trực tiếp */
            return '<span class="wn-thumb-ph wn-thumb-live"></span>';
        }
        return '<span class="wn-thumb-ph"></span>';
    }

    /* ════════════════════════════════════════════════════════════════
       MOCK TƯƠNG TÁC — giả lập giao diện bằng HTML/CSS, cuộn & bấm được
       Mỗi builder trả về phần TRONG khung trình duyệt (đã có thanh bar).
       ════════════════════════════════════════════════════════════════ */

    /* Khung "trình duyệt" bao ngoài mọi mock tương tác */
    function buildLiveMock(key) {
        var wrap = el('div', 'wn-live');
        var bar = el('div', 'wn-live-bar',
            '<span class="wn-live-dots"><i></i><i></i><i></i></span>' +
            '<span class="wn-live-url">maple.wiki' + esc(MOCKS[key].url || '/') + '</span>' +
            '<span class="wn-live-tag">DEMO TƯƠNG TÁC</span>' +
            '<button class="wn-live-full" type="button" title="Xem toàn trang (giả lập)" aria-label="Xem toàn trang">⛶</button>');
        var screen = el('div', 'wn-live-screen');
        var inner = MOCKS[key].build();
        screen.appendChild(inner);
        wrap.appendChild(bar);
        wrap.appendChild(screen);
        var fbtn = bar.querySelector('.wn-live-full');
        if (fbtn) fbtn.addEventListener('click', function (e) {
            e.stopPropagation(); openFullPage({ mock: key, title: 'M.A.P.L.E' });
        });
        return wrap;
    }

    /* ── Resolve URL trang để nhúng (chấp nhận tên trang hoặc URL) ── */
    function pageUrl(target) {
        if (/^https?:\/\//.test(target)) return target;
        if (target.charAt(0) === '/') return target;
        return (mw.util && mw.util.getUrl) ? mw.util.getUrl(target) : ('/wiki/' + encodeURIComponent(target));
    }

    /* ── Nhúng TRANG THẬT qua iframe + hiệu ứng + fallback nếu bị chặn ── */
    function buildLiveEmbed(target, f) {
        var url = pageUrl(target);
        /* MẶC ĐỊNH: nhúng trực tiếp trang để TƯƠNG TÁC (1:1, cuộn/bấm được).
           Nút 🖱 chuyển qua lại "showcase" (thu nhỏ + tilt + auto-scroll). */
        var wrap = el('div', 'wn-live wn-live--embed wn-live--interact');

        var bar = el('div', 'wn-live-bar',
            '<span class="wn-live-dots"><i></i><i></i><i></i></span>' +
            '<span class="wn-live-url">' + esc(url) + '</span>' +
            '<span class="wn-live-tag wn-live-tag--on">● LIVE</span>' +
            '<button class="wn-live-int" type="button" title="Bật tương tác trực tiếp" aria-label="Bật tương tác">🖱</button>' +
            '<button class="wn-live-full" type="button" title="Xem toàn trang (giả lập)" aria-label="Xem toàn trang">⛶</button>');

        var screen = el('div', 'wn-live-screen wn-live-screen--embed');
        var stageInner = el('div', 'wn-embed-stage');
        var scan = el('div', 'wn-embed-scan');           /* lớp scanline phủ trên */
        var frame = document.createElement('iframe');
        frame.className = 'wn-embed-frame';
        frame.setAttribute('loading', 'lazy');
        frame.setAttribute('scrolling', 'yes');
        frame.setAttribute('title', f.title || 'M.A.P.L.E');
        /* Cho phép tương tác (cuộn/bấm/điền form) khi wiki same-origin */
        frame.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox');
        frame.src = url + (url.indexOf('?') === -1 ? '?' : '&') + 'wn-embed=1';

        stageInner.appendChild(frame);
        stageInner.appendChild(scan);
        screen.appendChild(stageInner);
        wrap.appendChild(bar);
        wrap.appendChild(screen);

        /* Fallback: nếu iframe không load được (CSP/X-Frame-Options) → mock/mockup */
        var loaded = false;
        frame.addEventListener('load', function () { loaded = true; wrap.classList.add('wn-live--ready'); });
        setTimeout(function () {
            if (loaded || !wrap.isConnected) return;
            var fb = el('div', 'wn-feature-media wn-feature-media--live');
            if (f.mock && MOCKS[f.mock]) fb.appendChild(buildLiveMock(f.mock));
            else if (f.image) { var im = el('img', 'wn-feature-img'); im.src = f.image; fb.appendChild(im); }
            else fb.appendChild(el('div', 'wn-feature-mock',
                '<div class="wn-mock-bar"><span></span><span></span><span></span></div>' +
                '<div class="wn-mock-body"><div class="wn-mock-line w70"></div>' +
                '<div class="wn-mock-line w90"></div><div class="wn-mock-line w50"></div></div>'));
            if (wrap.parentNode) wrap.parentNode.replaceChild(fb.firstChild ? fb : wrap, wrap);
        }, 2600);

        /* Nút ⛶ → mở giả lập "load cả trang" toàn màn hình */
        var fbtn = bar.querySelector('.wn-live-full');
        if (fbtn) fbtn.addEventListener('click', function (e) {
            e.stopPropagation(); openFullPage({ url: url, title: f.title, mock: f.mock });
        });

        /* Nút 🖱 → bật/tắt TƯƠNG TÁC: gỡ scale/tilt/auto-scroll để dùng trang thật */
        var ibtn = bar.querySelector('.wn-live-int');
        if (ibtn) {
            ibtn.classList.add('on');               /* mặc định đang tương tác */
            ibtn.title = 'Đang tương tác — bấm để xem dạng showcase';
            ibtn.addEventListener('click', function (e) {
                e.stopPropagation();
                var on = wrap.classList.toggle('wn-live--interact');
                ibtn.classList.toggle('on', on);
                ibtn.title = on ? 'Đang tương tác — bấm để xem dạng showcase' : 'Bật tương tác trực tiếp';
                if (on) stageInner.style.transform = 'none';
            });
        }

        /* Hiệu ứng: parallax/tilt + auto-scroll demo (tự tắt khi vào chế độ tương tác) */
        applyFrameEffects(wrap, stageInner, screen, frame);
        return wrap;
    }

    /* ════════════════════════════════════════════════════════════════
       FULL-PAGE SIM — giả lập "load cả trang" (overlay toàn màn hình)
       opts: { url? , mock? , title? }. Có loading bar giả lập rồi hiện
       trang thật (iframe) / mock toàn trang; fallback nếu nhúng bị chặn.
       ════════════════════════════════════════════════════════════════ */
    function wrapMockFull(key) {
        var w = el('div', 'wn-fp-mockwrap');
        w.appendChild(MOCKS[key].build());
        return w;
    }
    function buildFullPlaceholder(url) {
        return el('div', 'wn-fp-ph',
            '<div class="wn-fp-ph-logo">' + MAPLE_LOGO + '</div>' +
            '<div class="wn-fp-ph-text">Không thể nhúng trang này (bị chặn nhúng).<br>' +
            (url ? 'Mở trực tiếp: <a href="' + esc(url) + '" target="_blank" rel="noopener" style="color:#ef4444">' + esc(url) + '</a>' : 'Mở trực tiếp để xem đầy đủ.') +
            '</div>');
    }

    function openFullPage(opts) {
        opts = opts || {};
        if (document.getElementById('wn-fp')) return; /* đã mở */

        var urlText = opts.url
            ? opts.url
            : ('maple.wiki' + ((opts.mock && MOCKS[opts.mock] && MOCKS[opts.mock].url) || '/'));

        var ov = el('div', 'wn-fp'); ov.id = 'wn-fp';
        var winEl = el('div', 'wn-fp-win');
        var bar = el('div', 'wn-fp-bar',
            '<span class="wn-live-dots"><i></i><i></i><i></i></span>' +
            '<span class="wn-fp-url">' + esc(urlText) + '</span>' +
            '<button class="wn-fp-close" type="button" aria-label="Đóng">✕</button>');
        var body = el('div', 'wn-fp-body');
        winEl.appendChild(bar);
        winEl.appendChild(body);
        ov.appendChild(winEl);
        document.body.appendChild(ov);
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(function () { ov.classList.add('show'); });

        /* Nội dung (nằm dưới lớp loading) */
        if (opts.url) {
            var frame = document.createElement('iframe');
            frame.className = 'wn-fp-frame';
            frame.setAttribute('title', opts.title || 'M.A.P.L.E');
            frame.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');
            frame.src = opts.url + (opts.url.indexOf('?') === -1 ? '?' : '&') + 'wn-full=1';
            body.appendChild(frame);
        } else if (opts.mock && MOCKS[opts.mock]) {
            body.appendChild(wrapMockFull(opts.mock));
        } else {
            body.appendChild(buildFullPlaceholder());
        }

        /* Lớp loading giả lập (trên cùng) */
        var load = el('div', 'wn-fp-load',
            '<div class="wn-fp-logo">' + MAPLE_LOGO + '</div>' +
            '<div class="wn-fp-load-text">// ĐANG TẢI TRANG…</div>' +
            '<div class="wn-fp-bar-wrap"><div class="wn-fp-bar-fill"></div></div>' +
            '<div class="wn-fp-load-url">' + esc(urlText) + '</div>');
        body.appendChild(load);

        var fill = load.querySelector('.wn-fp-bar-fill');
        var pct = 0;
        var prog = setInterval(function () {
            pct = Math.min(pct + Math.random() * 14, 90);
            fill.style.width = pct + '%';
        }, 180);

        var finished = false;
        function finish() {
            if (finished) return; finished = true;
            clearInterval(prog);
            fill.style.width = '100%';
            setTimeout(function () {
                if (!load.isConnected) return;
                load.classList.add('done');
                setTimeout(function () { if (load.parentNode) load.parentNode.removeChild(load); }, 440);
            }, 260);
        }

        if (opts.url) {
            var fr = body.querySelector('.wn-fp-frame');
            var done = false;
            fr.addEventListener('load', function () { if (done) return; done = true; finish(); });
            /* Fallback: nhúng bị chặn (CSP/X-Frame) → mock toàn trang / placeholder */
            setTimeout(function () {
                if (done || !ov.isConnected) return;
                done = true;
                var fb = (opts.mock && MOCKS[opts.mock]) ? wrapMockFull(opts.mock) : buildFullPlaceholder(opts.url);
                if (fr.parentNode) fr.parentNode.replaceChild(fb, fr);
                finish();
            }, 3500);
        } else {
            setTimeout(finish, 1400); /* mock/placeholder: giả lập tải ~1.4s */
        }

        function close() {
            ov.classList.remove('show');
            document.body.style.overflow = '';
            document.removeEventListener('keydown', onKey);
            clearInterval(prog);
            setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 300);
        }
        function onKey(e) { if (e.key === 'Escape') close(); }
        document.addEventListener('keydown', onKey);
        bar.querySelector('.wn-fp-close').addEventListener('click', close);
        ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    }

    /* Parallax/tilt theo chuột + auto-scroll showcase (dừng khi người dùng chạm) */
    function applyFrameEffects(wrap, stageInner, screen, frame) {
        /* Tilt nhẹ theo vị trí chuột trong khung (bỏ qua khi đang tương tác) */
        wrap.addEventListener('mousemove', function (e) {
            if (wrap.classList.contains('wn-live--interact')) return;
            var r = wrap.getBoundingClientRect();
            var rx = ((e.clientY - r.top) / r.height - 0.5) * -4;
            var ry = ((e.clientX - r.left) / r.width - 0.5) * 4;
            stageInner.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
        });
        wrap.addEventListener('mouseleave', function () {
            stageInner.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
        });

        /* Auto-scroll demo: chỉ chạy được nếu same-origin (đọc được contentDocument) */
        var userTouched = false;
        ['wheel', 'mousedown', 'touchstart', 'keydown'].forEach(function (ev) {
            screen.addEventListener(ev, function () { userTouched = true; }, { passive: true });
        });
        frame.addEventListener('load', function () {
            var doc = null;
            try { doc = frame.contentDocument || (frame.contentWindow && frame.contentWindow.document); } catch (e) { doc = null; }
            if (!doc) return; /* cross-origin → bỏ auto-scroll, vẫn nhúng được */
            var dir = 1;
            function loop() {
                if (!wrap.isConnected) return;
                if (!userTouched && !wrap.classList.contains('wn-live--interact')) {
                    var win = frame.contentWindow;
                    var max = doc.documentElement.scrollHeight - win.innerHeight;
                    var y = win.pageYOffset || 0;
                    if (y >= max - 2) dir = -1; else if (y <= 2) dir = 1;
                    win.scrollTo(0, y + dir * 1.1);
                }
                requestAnimationFrame(loop);
            }
            setTimeout(loop, 1200);
        });
    }

    /* Logo nhỏ tái dùng trong mock */
    function miniLogo(size) {
        size = size || 26;
        return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100" fill="none">' +
            '<path d="M50 15V85M50 15L85 45L50 40L15 45L50 15Z" stroke="#ef4444" stroke-width="3" stroke-linejoin="miter"/>' +
            '<path d="M30 60L50 85L70 60" stroke="#ef4444" stroke-width="3"/>' +
            '<circle cx="50" cy="40" r="6" fill="#ef4444"/></svg>';
    }

    var MOCKS = {
        /* ── Trang chủ v4.0: cuộn dọc, tab bấm được, thẻ hover ── */
        homepage: {
            url: '/Trang_Chính',
            build: function () {
                var root = el('div', 'wnm-home');

                /* Hero */
                var hero = el('div', 'wnm-hero',
                    '<div class="wnm-logo">' + miniLogo(46) + '</div>' +
                    '<div class="wnm-h1">TỔ CHỨC M.A.P.L.E</div>' +
                    '<div class="wnm-status"><i></i><span class="wnm-type"></span><b>_</b></div>');
                root.appendChild(hero);

                /* Stat chips — đếm số khi mock xuất hiện */
                var stats = el('div', 'wnm-stats');
                [['Tài liệu', 248], ['Sửa đổi', 5120], ['Thành viên', 63], ['Tệp tin', 91]].forEach(function (s) {
                    stats.appendChild(el('div', 'wnm-stat',
                        '<span class="wnm-stat-n" data-to="' + s[1] + '">0</span>' +
                        '<span class="wnm-stat-l">' + s[0] + '</span>'));
                });
                root.appendChild(stats);

                /* Quick access — hover được */
                var qaLabel = el('div', 'wnm-eyebrow', '// TRUY CẬP NHANH');
                root.appendChild(qaLabel);
                var qa = el('div', 'wnm-qa');
                ['Kho Lưu Trữ', 'Thực Thể', 'Thủ Tục', 'Nhân Sự', 'Bản Đồ', 'Trợ Giúp'].forEach(function (n, i) {
                    qa.appendChild(el('div', 'wnm-qa-card',
                        '<span class="wnm-qa-id">' + ['DB', 'EN', 'PR', 'HR', 'MP', 'HP'][i] + '</span>' +
                        '<span class="wnm-qa-n">' + n + '</span>' +
                        '<span class="wnm-qa-ar">→</span>'));
                });
                root.appendChild(qa);

                /* Tab bấm được */
                var tabNames = ['GIỚI THIỆU', 'THE MAZE', 'BẮT ĐẦU', 'KÊNH'];
                var tabBodies = [
                    'Kho lưu trữ kỹ thuật và hồ sơ thực địa về chiều không gian The Maze.',
                    'The Maze: mê cung nối tiếp 001 → ∞, kích thước 5×5m → 15×15m phi tuyến.',
                    '01 Đọc Trợ Giúp · 02 Hướng Dẫn Viết · 03 Quy Tắc.',
                    'M.A.P.L.E OFFICIAL — kênh thông tin thị giác của tổ chức.'
                ];
                var tabsWrap = el('div', 'wnm-tabs');
                var bar = el('div', 'wnm-tabbar');
                var body = el('div', 'wnm-tabbody', tabBodies[0]);
                tabNames.forEach(function (t, i) {
                    var b = el('button', 'wnm-tab' + (i === 0 ? ' active' : ''), t);
                    b.type = 'button';
                    b.addEventListener('click', function () {
                        bar.querySelectorAll('.wnm-tab').forEach(function (x) { x.classList.remove('active'); });
                        b.classList.add('active');
                        body.style.opacity = '0';
                        setTimeout(function () { body.textContent = tabBodies[i]; body.style.opacity = '1'; }, 120);
                    });
                    bar.appendChild(b);
                });
                tabsWrap.appendChild(bar);
                tabsWrap.appendChild(body);
                root.appendChild(tabsWrap);

                /* Blog list — hover */
                root.appendChild(el('div', 'wnm-eyebrow', '// BÀI MỚI'));
                var blog = el('div', 'wnm-blog');
                [['The Wanderer', '2 giờ trước'], ['DB-006 · Lối thoát', '1 ngày trước'], ['Quy trình No-Clip', '3 ngày trước']].forEach(function (b) {
                    blog.appendChild(el('div', 'wnm-blog-i',
                        '<span class="wnm-blog-t">' + b[0] + '</span><span class="wnm-blog-m">' + b[1] + '</span>'));
                });
                root.appendChild(blog);

                /* Kích hoạt hiệu ứng khi mock đã gắn vào DOM */
                setTimeout(function () { animateHomeMock(root); }, 80);
                return root;
            }
        },

        /* ── Hệ thống form yêu cầu: chọn loại + form ── */
        nav: {
            url: '/',
            build: function () {
                var root = el('div', 'wnm-navdemo');
                root.appendChild(el('div', 'wnm-nav-hint', 'Di chuột vào các mục — hiệu ứng gạch chân trượt + phát sáng:'));
                var nav = el('div', 'wnm-navbar');
                nav.appendChild(el('div', 'wnm-nav-brand', miniLogo(22) + '<span>M.A.P.L.E</span>'));
                var links = el('div', 'wnm-nav-links');
                ['TRANG CHỦ', 'KHO LƯU TRỮ', 'THỰC THỂ', 'THỦ TỤC', 'TRỢ GIÚP'].forEach(function (n, i) {
                    links.appendChild(el('a', 'wnm-nav-link' + (i === 0 ? ' active' : ''), n));
                });
                nav.appendChild(links);
                nav.appendChild(el('div', 'wnm-nav-live', '<i></i>LIVE'));
                root.appendChild(nav);
                root.appendChild(el('div', 'wnm-nav-note', 'Khi cuộn trang, thanh điều hướng đổi nền đậm dần và mắt logo nhấp nháy.'));
                return root;
            }
        }
    };

    /* Hiệu ứng cho mock trang chủ: typing + đếm số + reveal */
    function animateHomeMock(root) {
        /* Typing */
        var typeEl = root.querySelector('.wnm-type');
        if (typeEl) {
            var phr = 'SYSTEM ONLINE // ALL UNITS STANDBY';
            var ci = 0;
            (function tk() {
                if (!typeEl.isConnected) return;
                typeEl.textContent = phr.slice(0, ci + 1);
                ci = (ci + 1) % (phr.length + 8);
                setTimeout(tk, ci < phr.length ? 60 : 90);
            })();
        }
        /* Count-up stat */
        root.querySelectorAll('.wnm-stat-n').forEach(function (el2) {
            var to = parseInt(el2.getAttribute('data-to'), 10) || 0, t0 = null;
            (function step(ts) {
                if (!el2.isConnected) return;
                if (!t0) t0 = ts;
                var p = Math.min((ts - t0) / 1000, 1), e = 1 - Math.pow(1 - p, 3);
                el2.textContent = Math.floor(e * to);
                if (p < 1) requestAnimationFrame(step); else el2.textContent = to;
            })(performance.now());
        });
        /* Reveal lần lượt */
        var rows = root.querySelectorAll('.wnm-stats,.wnm-qa,.wnm-tabs,.wnm-blog,.wnm-eyebrow');
        rows.forEach(function (r, i) {
            r.style.opacity = '0'; r.style.transform = 'translateY(12px)';
            r.style.transition = 'opacity .5s, transform .5s';
            setTimeout(function () { r.style.opacity = '1'; r.style.transform = 'none'; }, 120 + i * 80);
        });
    }

    /* Render một feature ra khu vực 2 cột */
    function renderFeature(stage, f) {
        var left = el('div', 'wn-feature-text');

        left.appendChild(el('h2', 'wn-feature-title', esc(f.title || '')));
        if (f.intro) left.appendChild(el('p', 'wn-feature-intro', esc(f.intro)));

        if (f.bullets && f.bullets.length) {
            var ul = el('ul', 'wn-feature-bullets');
            f.bullets.forEach(function (b) { ul.appendChild(el('li', null, esc(b))); });
            left.appendChild(ul);
        }

        if (f.steps && f.steps.length) {
            left.appendChild(el('p', 'wn-feature-steps-label', 'Cách sử dụng:'));
            var ol = el('ol', 'wn-feature-steps');
            f.steps.forEach(function (s) { ol.appendChild(el('li', null, esc(s))); });
            left.appendChild(ol);
        }

        /* Action buttons: Mark as Read & Feedback */
        var actions = el('div', 'wn-feature-actions');
        
        var isRead = state.readFeatures.indexOf(f.key) !== -1;
        var seenBtn = el('button', 'wn-btn-seen' + (isRead ? ' read' : ''));
        seenBtn.type = 'button';
        seenBtn.innerHTML = isRead ? '✓ ĐÃ XEM' : '✓ ĐÁNH DẤU ĐÃ XEM';
        seenBtn.addEventListener('click', function () {
            if (state.readFeatures.indexOf(f.key) === -1) {
                state.readFeatures.push(f.key);
                localStorage.setItem('maple_whatsnew_read_features', JSON.stringify(state.readFeatures));
                seenBtn.classList.add('read');
                seenBtn.innerHTML = '✓ ĐÃ XEM';
                
                // Highlight corresponding nav card
                var track = document.querySelector('.wn-nav-track');
                if (track) {
                    var activeCard = track.children[state.idx];
                    if (activeCard) activeCard.classList.add('read');
                }
                
                // Check if all features are read
                var allRead = true;
                for (var j = 0; j < features.length; j++) {
                    if (state.readFeatures.indexOf(features[j].key) === -1) {
                        allRead = false;
                        break;
                    }
                }
                if (allRead) {
                    localStorage.setItem('maple_whatsnew_seen', version);
                }
            }
        });
        actions.appendChild(seenBtn);

        var fbox = el('div', 'wn-feedback-box');
        var fLabel = el('span', 'wn-feedback-label', 'Bạn thấy tính năng này thế nào?');
        fbox.appendChild(fLabel);

        var voted = localStorage.getItem('maple_whatsnew_feedback_' + f.key);
        
        var upBtn = el('button', 'wn-feedback-btn wn-feedback-up' + (voted === 'up' ? ' voted' : ''));
        upBtn.type = 'button';
        var downBtn = el('button', 'wn-feedback-btn wn-feedback-down' + (voted === 'down' ? ' voted' : ''));
        downBtn.type = 'button';

        function updateFeedbackCounts() {
            var fdb = state.feedbackData[f.key] || { up: 0, down: 0 };
            upBtn.innerHTML = '👍 <span class="wn-feedback-count">' + (fdb.up || 0) + '</span>';
            downBtn.innerHTML = '👎 <span class="wn-feedback-count">' + (fdb.down || 0) + '</span>';
        }

        updateFeedbackCounts();

        function sendVote(voteType) {
            var user = mw.config.get('wgUserName');
            if (!user) {
                mw.notify('Bạn cần đăng nhập để gửi phản hồi.', { type: 'warn' });
                return;
            }
            if (localStorage.getItem('maple_whatsnew_feedback_' + f.key)) {
                mw.notify('Bạn đã phản hồi tính năng này rồi.', { type: 'warn' });
                return;
            }

            upBtn.disabled = true;
            downBtn.disabled = true;

            var api = new mw.Api();
            api.get({ action: 'query', meta: 'tokens', type: 'csrf', format: 'json' })
                .done(function (tokenRes) {
                    var token = tokenRes.query && tokenRes.query.tokens && tokenRes.query.tokens.csrftoken;
                    if (!token || token === '+\\') {
                        mw.notify('Không lấy được token — hãy đăng nhập và thử lại.', { type: 'error' });
                        upBtn.disabled = false; downBtn.disabled = false;
                        return;
                    }

                    api.get({
                        action: 'query',
                        titles: 'Dự án:WhatsNew/Feedback.json',
                        prop: 'revisions',
                        rvprop: 'content',
                        rvslots: 'main',
                        format: 'json',
                        origin: '*'
                    }).done(function (res) {
                        var pageText = '{}';
                        try {
                            var pages = res.query.pages;
                            var pid = Object.keys(pages)[0];
                            if (pid !== '-1' && pages[pid].revisions) {
                                pageText = pages[pid].revisions[0].slots.main['*'];
                            }
                        } catch(e) {}

                        var feedback = {};
                        try { feedback = JSON.parse(pageText); } catch(e) {}
                        
                        feedback[f.key] = feedback[f.key] || { up: 0, down: 0 };
                        feedback[f.key][voteType] = (feedback[f.key][voteType] || 0) + 1;

                        api.post({
                            action: 'edit',
                            title: 'Dự án:WhatsNew/Feedback.json',
                            text: JSON.stringify(feedback, null, 2),
                            summary: '[Feedback] Phản hồi tính năng: ' + f.key + ' -> ' + voteType,
                            token: token,
                            format: 'json'
                        }).done(function () {
                            state.feedbackData = feedback;
                            localStorage.setItem('maple_whatsnew_feedback_' + f.key, voteType);
                            upBtn.classList.toggle('voted', voteType === 'up');
                            downBtn.classList.toggle('voted', voteType === 'down');
                            updateFeedbackCounts();
                            mw.notify('Cảm ơn bạn đã phản hồi!', { type: 'success' });
                        }).fail(function () {
                            mw.notify('Gửi phản hồi thất bại. Thử lại sau.', { type: 'error' });
                            upBtn.disabled = false; downBtn.disabled = false;
                        });
                    });
                }).fail(function () {
                    mw.notify('Lỗi kết nối. Thử lại sau.', { type: 'error' });
                    upBtn.disabled = false; downBtn.disabled = false;
                });
        }

        upBtn.addEventListener('click', function () { sendVote('up'); });
        downBtn.addEventListener('click', function () { sendVote('down'); });

        fbox.appendChild(upBtn);
        fbox.appendChild(downBtn);
        actions.appendChild(fbox);
        left.appendChild(actions);

        /* Khung minh hoạ bên phải */
        var right = el('div', 'wn-feature-media');
        var iframeTarget = f.iframe || f.page;
        if (iframeTarget) {
            right.classList.add('wn-feature-media--live');
            right.appendChild(buildLiveEmbed(iframeTarget, f));
        } else if (f.mock && MOCKS[f.mock]) {
            right.classList.add('wn-feature-media--live');
            right.appendChild(buildLiveMock(f.mock));
        } else if (f.image) {
            var img = el('img', 'wn-feature-img');
            img.src = f.image; img.alt = f.title || '';
            img.loading = 'lazy';
            right.appendChild(img);
        } else {
            right.appendChild(el('div', 'wn-feature-mock',
                '<div class="wn-mock-bar"><span></span><span></span><span></span></div>' +
                '<div class="wn-mock-body"><div class="wn-mock-line w70"></div>' +
                '<div class="wn-mock-line w90"></div><div class="wn-mock-line w50"></div>' +
                '<div class="wn-mock-line w80"></div><div class="wn-mock-line w40"></div></div>'));
        }

        /* Animation: clear rồi gắn lại */
        stage.innerHTML = '';
        stage.appendChild(left);
        stage.appendChild(right);
        stage.classList.remove('wn-stage-in');
        void stage.offsetWidth;
        stage.classList.add('wn-stage-in');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
