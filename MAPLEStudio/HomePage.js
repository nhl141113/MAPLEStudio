/* ============================================
   M.A.P.L.E — MediaWiki:HomePage.js  v6.5
   Trang chủ thiết kế lại: hero + thống kê, truy cập nhanh,
   tab tự build, blog 2 nguồn (BlogPage + bài mới API), nhiều hiệu ứng.
   ============================================ */

(function () {
    function init() {
        var isMainPage = mw.config.get('wgIsMainPage');
        if (!isMainPage) return;

        var root = document.getElementById('maple-root');
        if (!root) return;

        /* ── Gating hiệu năng: tắt hiệu ứng nặng khi giảm chuyển động / máy yếu / mobile ── */
        var reduceFX = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ||
                       window.innerWidth < 768 ||
                       (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

        /* ── Helper: escape XSS ── */
        function esc(s) {
            return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
            });
        }

        /* ── Helper: định dạng số ── */
        function fmt(n) {
            return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }

        /* ── Helper: thời gian tương đối ── */
        function relTime(iso) {
            var d = new Date(iso), now = new Date(), s = Math.floor((now - d) / 1000);
            if (isNaN(s)) return '';
            if (s < 60) return 'vừa xong';
            if (s < 3600) return Math.floor(s / 60) + ' phút trước';
            if (s < 86400) return Math.floor(s / 3600) + ' giờ trước';
            if (s < 2592000) return Math.floor(s / 86400) + ' ngày trước';
            return d.toLocaleDateString('vi-VN');
        }

        /* ── Icons (lấy từ bộ icon GlobalNav) ── */
        var ICON = {
            db: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
            entity: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
            shield: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
            id: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
            map: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
            help: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            doc: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
            pen: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>'
        };

        /* ── Quick access các khu vực ── */
        var AREAS = [
            { href: '/wiki/Kho_L%C6%B0u_Tr%E1%BB%AF', id: 'DB', name: 'Kho Lưu Trữ', tag: 'Cơ sở dữ liệu hồ sơ', icon: ICON.db },
            { href: '/wiki/Th%E1%BB%B1c_Th%E1%BB%83', id: 'EN', name: 'Thực Thể', tag: 'Hồ sơ thực thể Maze', icon: ICON.entity },
            { href: '/wiki/Th%E1%BB%A7_T%E1%BB%A5c', id: 'PR', name: 'Thủ Tục', tag: 'Quy trình sinh tồn', icon: ICON.shield },
            { href: '/wiki/Nh%C3%A2n_S%E1%BB%B1', id: 'HR', name: 'Nhân Sự', tag: 'Danh bạ tổ chức', icon: ICON.id },
            { href: '/wiki/B%E1%BA%A3n_%C4%90%E1%BB%93', id: 'MP', name: 'Bản Đồ', tag: 'Sơ đồ các tầng Maze', icon: ICON.map },
            { href: '/wiki/Tr%E1%BB%A3_gi%C3%BAp', id: 'HP', name: 'Trợ Giúp', tag: 'Hướng dẫn sử dụng', icon: ICON.help }
        ];

        function buildAreaCards() {
            return AREAS.map(function (a) {
                return '<a class="maple-card maple-qa-card reveal" href="' + a.href + '">' +
                    '<span class="maple-qa-icon">' + a.icon + '</span>' +
                    '<span class="maple-qa-text">' +
                    '<span class="maple-card-id">' + esc(a.id) + '</span>' +
                    '<span class="maple-card-name">' + esc(a.name) + '</span>' +
                    '<span class="maple-card-tag">' + esc(a.tag) + '</span>' +
                    '</span>' +
                    '<span class="maple-qa-arrow">→</span>' +
                    '</a>';
            }).join('');
        }

        /* ── Build HTML chính ── */
        root.innerHTML =
            '<div class="maple-page-wrapper">' +
            '<div class="maple-container">' +

            /* Header Section (Cố định ở trên) */
            '<div class="maple-header-section">' +
            '  <div class="maple-logo-wrap" id="maple-logo-wrap">' +
            '    <svg width="180" height="180" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '      <defs>' +
            '        <filter id="gnav-g"><feGaussianBlur stdDeviation="1.5" result="b"/>' +
            '        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
            '      </defs>' +
            '      <path d="M50 5L95 40L80 95H20L5 40L50 5Z" stroke="#450a0a" stroke-width="0.8" opacity="0.6"/>' +
            '      <g filter="url(#gnav-g)">' +
            '        <path d="M50 15V85M50 15L85 45L50 40L15 45L50 15Z" stroke="#ef4444" stroke-width="2" stroke-linejoin="miter"/>' +
            '        <path d="M30 60L50 85L70 60" stroke="#ef4444" stroke-width="2"/>' +
            '      </g>' +
            '      <circle id="maple-logo-eye" cx="50" cy="40" r="5.5" fill="#ef4444" filter="url(#gnav-g)" class="maple-eye-pulse"/>' +
            '    </svg>' +
            '  </div>' +
            '  <div class="maple-heading">' +
            '    <h1 id="maple-glitch-title" data-text="TỔ CHỨC M.A.P.L.E">TỔ CHỨC M.A.P.L.E</h1>' +
            '    <div class="maple-heading-divider"><span class="line"></span>CHI NHÁNH VIỆT NAM<span class="line"></span></div>' +
            '    <div class="maple-system-status">' +
            '      <span class="maple-status-dot"></span>' +
            '      <span id="maple-typing-text"></span>' +
            '      <span class="maple-cursor">_</span>' +
            '    </div>' +
            '  </div>' +
            '</div>' +

            /* Main Tactical Navigation Tabs */
            '<div class="maple-main-tabs-wrap reveal">' +
            '  <div class="maple-main-tab-bar" id="maple-main-tab-bar">' +
            '    <button class="maple-main-tab-btn active" data-tab="dashboard">[01] TỔNG QUAN</button>' +
            '    <button class="maple-main-tab-btn" data-tab="archives">[02] DỮ LIỆU</button>' +
            '    <button class="maple-main-tab-btn" data-tab="leaderboard">[03] VINH DANH</button>' +
            '    <button class="maple-main-tab-btn" data-tab="intel">[04] INTEL & HD</button>' +
            '    <span class="maple-main-tab-indicator" id="maple-main-tab-indicator"></span>' +
            '  </div>' +
            '</div>' +

            /* Main Active Tab Panels */
            '<div class="maple-tab-contents">' +
            
            /* TAB 1: DASHBOARD */
            '  <div class="maple-main-tab-panel active" data-tab="dashboard">' +
            '    <div class="maple-dashboard-layout reveal">' +
            '      <div class="maple-intel-banner">' +
            '        <span class="banner-tag">TACTICAL INTEL REPORT</span>' +
            '        <h2>Chào mừng đặc vụ đến với Hệ thống thông tin M.A.P.L.E</h2>' +
            '        <p>Hệ thống hỗ trợ sinh tồn, lưu trữ thực địa và quản lý nhân sự hoạt động trong không gian The Maze.</p>' +
            '      </div>' +
            '      <div class="maple-stats" id="maple-stats">' +
            '        <div class="maple-stat"><span class="maple-stat-num" data-count="0" id="maple-stat-pages">—</span><span class="maple-stat-lbl">Tài liệu</span></div>' +
            '        <div class="maple-stat"><span class="maple-stat-num" data-count="0" id="maple-stat-edits">—</span><span class="maple-stat-lbl">Sửa đổi</span></div>' +
            '        <div class="maple-stat"><span class="maple-stat-num" data-count="0" id="maple-stat-users">—</span><span class="maple-stat-lbl">Thành viên</span></div>' +
            '        <div class="maple-stat"><span class="maple-stat-num" data-count="0" id="maple-stat-rp">—</span><span class="maple-stat-lbl">Tổng RP</span></div>' +
            '        <div class="maple-stat"><span class="maple-stat-num" data-count="0" id="maple-stat-files">—</span><span class="maple-stat-lbl">Tệp tin</span></div>' +
            '      </div>' +
            '      <div class="maple-qa-section">' +
            '        <p class="maple-block-eyebrow">// TRUY CẬP NHANH CÁC PHÂN KHU CHUYÊN BIỆT</p>' +
            '        <div class="maple-qa-grid">' + buildAreaCards() + '</div>' +
            '      </div>' +
            '    </div>' +
            '  </div>' +

            /* TAB 2: ARCHIVES (CƠ SỞ DỮ LIỆU) */
            '  <div class="maple-main-tab-panel" data-tab="archives">' +
            '    <div class="maple-blog-section reveal">' +
            '      <div class="maple-blog-col">' +
            '        <div class="maple-blog-head">' +
            '          <p class="maple-block-eyebrow">// BÀI VIẾT MỚI CẬP NHẬT</p>' +
            '          <a class="maple-blog-write" href="/wiki/%C4%90%E1%BA%B7c_bi%E1%BB%87t:Thay_%C4%91%E1%BB%95i_g%E1%BA%A7n_%C4%91%C3%A2y">' + ICON.doc + ' Tất cả</a>' +
            '        </div>' +
            '        <div class="maple-blog-list" id="maple-recent-list"><div class="maple-blog-loading">Đang tải bài mới...</div></div>' +
            '      </div>' +
            '      <div class="maple-blog-col">' +
            '        <div class="maple-blog-head">' +
            '          <p class="maple-block-eyebrow">// BLOG CỘNG ĐỒNG</p>' +
            '          <a class="maple-blog-write" href="/wiki/Special:CreateBlogPost">' + ICON.pen + ' Viết blog</a>' +
            '        </div>' +
            '        <div class="maple-blog-list" id="maple-blog-list"><div class="maple-blog-loading">Đang tải blog...</div></div>' +
            '      </div>' +
            '    </div>' +
            '  </div>' +

            /* TAB 3: LEADERBOARD (VINH DANH) */
            '  <div class="maple-main-tab-panel" data-tab="leaderboard">' +
            '    <div class="maple-leaderboard-section reveal">' +
            '      <div class="leaderboard-header-info">' +
            '        <h3>Bảng xếp hạng danh dự đặc vụ</h3>' +
            '        <p>Vinh danh những đặc vụ có đóng góp xuất sắc nhất dựa trên chỉ số Uy Tín (Reputation Points).</p>' +
            '      </div>' +
            '      <div class="maple-leaderboard-grid" id="maple-leaderboard-list">' +
            '        <div class="maple-blog-loading">Đang tải bảng xếp hạng...</div>' +
            '      </div>' +
            '      <div class="maple-leaderboard-footer">' +
            '        <a class="maple-leaderboard-more" href="' + mw.util.getUrl('Thành tựu') + '#tab-vinh">Xem bảng xếp hạng đầy đủ →</a>' +
            '      </div>' +
            '    </div>' +
            '  </div>' +

            /* TAB 4: INTEL & HƯỚNG DẪN */
            '  <div class="maple-main-tab-panel" data-tab="intel">' +
            '    <div class="maple-intel-section reveal">' +
            '      <div class="maple-intel-grid">' +
            '        <div class="intel-docs">' +
            '          <p class="maple-block-eyebrow">// TÀI LIỆU HƯỚNG DẪN CỐT LÕI</p>' +
            '          <div class="intel-docs-list">' +
            '            <a class="intel-doc-card" href="/wiki/Tr%E1%BB%A3_gi%C3%BAp"><span class="num">01</span><div class="text"><strong>Hồ sơ Trợ Giúp</strong><span>Hướng dẫn sử dụng các công cụ wiki và cách tương tác hệ thống.</span></div></a>' +
            '            <a class="intel-doc-card" href="/wiki/H%C6%B0%E1%BB%9Bng_D%E1%BA%ABn_Vi%E1%BA%BFt"><span class="num">02</span><div class="text"><strong>Hướng Dẫn Viết</strong><span>Quy chuẩn định dạng hồ sơ thực thể Maze và vật phẩm sinh tồn.</span></div></a>' +
            '            <a class="intel-doc-card" href="/wiki/Quy_T%E1%BA%AFc"><span class="num">03</span><div class="text"><strong>Quy Tắc Chung</strong><span>Nội quy hoạt động và đạo đức ứng xử của đặc vụ M.A.P.L.E.</span></div></a>' +
            '          </div>' +
            '        </div>' +
            '        <div class="intel-video">' +
            '          <p class="maple-block-eyebrow">// LƯU TRỮ TRỰC QUAN (YOUTUBE CHANNEL)</p>' +
            '          <div class="video-wrapper">' +
            '            <iframe src="https://www.youtube.com/embed/147Gp4nPBd4" title="M.A.P.L.E. - Tài liệu hướng dẫn nhân viên (Phần 1)" frameborder="0" allowfullscreen></iframe>' +
            '          </div>' +
            '        </div>' +
            '      </div>' +
            '      <div class="maple-info-panels">' +
            '        <div class="info-box">' +
            '          <h4>Hệ thống The Maze là gì?</h4>' +
            '          <p>The Maze là tập hợp các mê cung không gian phi tuyến tính được đánh số liên tiếp từ 001 đến vô hạn. Các Maze tự động mở rộng từ kích thước 5x5m lên tới hàng chục mét và kết nối với nhau bằng các cổng không gian ngẫu nhiên. M.A.P.L.E Việt Nam là chi nhánh hỗ trợ định vị và giải cứu các cá nhân không may bị "No-Clip" rơi vào chiều không gian này.</p>' +
            '        </div>' +
            '        <div class="info-box warning">' +
            '          <h4>⚠️ CẢNH BÁO BẢO MẬT</h4>' +
            '          <p>Tất cả nội dung lưu trữ trong tài liệu này thuộc quyền sở hữu bảo mật của tổ chức M.A.P.L.E. Các thông tin phản ánh hoạt động điều phối sinh tồn đều là giả tưởng phục vụ mục đích xây dựng thế giới lore sáng tạo của cộng đồng.</p>' +
            '        </div>' +
            '      </div>' +
            '    </div>' +
            '  </div>' +
            '</div>' +

            /* Footer */
            '<div class="maple-footer">' +
            '  <div class="maple-footer-line"></div>' +
            '  <div class="maple-footer-info"><span id="maple-clock">⏱ --:--:--</span><span>TERMINAL v6.5.0</span><span>SECURED BY MAPLE-CORE</span></div>' +
            '</div>' +
            '</div></div>';

        /* ── Typing effect ── */
        var phrases = [
            'SYSTEM ONLINE // ALL UNITS STANDBY',
            'MONITORING MAZE ACTIVITY...',
            'NO ANOMALIES DETECTED',
            'ARCHIVE ACCESS: GRANTED'
        ];
        (function () {
            var el = document.getElementById('maple-typing-text');
            if (!el) return;
            var pi = 0, ci = 0, deleting = false, wait = 0;

            function tick() {
                var phrase = phrases[pi];
                if (wait > 0) { wait--; setTimeout(tick, 60); return; }
                if (!deleting) {
                    el.textContent = phrase.slice(0, ci + 1);
                    ci++;
                    if (ci === phrase.length) { deleting = true; wait = 28; }
                    setTimeout(tick, 55);
                } else {
                    el.textContent = phrase.slice(0, ci - 1);
                    ci--;
                    if (ci === 0) {
                        deleting = false;
                        pi = (pi + 1) % phrases.length;
                        wait = 6;
                    }
                    setTimeout(tick, 28);
                }
            }
            setTimeout(tick, 1200);
        })();

        /* ── Glitch effect trên title ── */
        (function () {
            var title = document.getElementById('maple-glitch-title');
            if (!title) return;
            function glitch() {
                title.classList.add('glitching');
                /* thỉnh thoảng glitch mạnh (dài hơn) — kiểu tín hiệu nhiễu */
                var hard = Math.random() < 0.35;
                if (hard) title.classList.add('glitching--hard');
                setTimeout(function () {
                    title.classList.remove('glitching');
                    title.classList.remove('glitching--hard');
                }, hard ? 320 : 180);
                setTimeout(glitch, 1800 + Math.random() * 3200);
            }
            setTimeout(glitch, 1500);
        })();

        /* ── Parallax logo theo con trỏ (nhẹ) — gated + throttle rAF ── */
        (function () {
            var wrap = document.getElementById('maple-logo-wrap');
            if (!wrap || reduceFX) return;
            var queued = false, mx = 0, my = 0;
            window.addEventListener('mousemove', function (e) {
                mx = (e.clientX / window.innerWidth - 0.5) * 14;
                my = (e.clientY / window.innerHeight - 0.5) * 14;
                if (queued) return;
                queued = true;
                requestAnimationFrame(function () {
                    wrap.style.transform = 'translate(' + mx.toFixed(1) + 'px,' + my.toFixed(1) + 'px)';
                    queued = false;
                });
            });
        })();

        /* ── Đồng hồ hệ thống (footer) ── */
        (function () {
            var c = document.getElementById('maple-clock');
            if (!c) return;
            function p(n) { return (n < 10 ? '0' : '') + n; }
            function upd() {
                var d = new Date();
                c.textContent = '⏱ ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
            }
            upd(); setInterval(upd, 1000);
        })();

        /* ════════════════════════════════════════
           EASTER EGG — toast + mở khoá (cosmetic, localStorage)
           ════════════════════════════════════════ */
        function showToast(msg) {
            var t = document.createElement('div');
            t.className = 'maple-toast'; t.textContent = msg;
            document.body.appendChild(t);
            requestAnimationFrame(function () { t.classList.add('in'); });
            setTimeout(function () {
                t.classList.remove('in');
                setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 400);
            }, 3600);
        }
        /* Map easter egg → id thành tựu thật để TỰ GHI NHẬN (đồng bộ) */
        var EGG_ACH = { konami: 'konami_code', open_door: 'open_door', maple_secret: 'maple_secret', eye_of_maple: 'eye_of_maple' };
        function unlockEgg(id, msg) {
            var KEY = 'maple_eggs', set = {};
            try { set = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
            var first = !set[id];
            set[id] = Date.now();
            try { localStorage.setItem(KEY, JSON.stringify(set)); } catch (e) {}
            /* Ghi nhận chính thức (nếu hệ thống thành tựu đã nạp) — sẽ tự hiện toast + cộng RP */
            var achId = EGG_ACH[id];
            if (achId && window.MAPLE && window.MAPLE.award && window.MAPLE.award(achId)) return;
            showToast((first ? '🎉 ' : '↺ ') + msg);
        }

        /* Mưa Matrix tự kết thúc (~3.5s) — bỏ qua nếu giảm chuyển động */
        function matrixRain() {
            if (reduceFX) return;
            var cv = document.createElement('canvas');
            cv.className = 'maple-matrix';
            var ctx = cv.getContext('2d');
            function size() { cv.width = window.innerWidth; cv.height = window.innerHeight; }
            size();
            document.body.appendChild(cv);
            var step = 14, cols = Math.floor(cv.width / step), drops = [];
            for (var i = 0; i < cols; i++) drops[i] = Math.random() * -50;
            var chars = 'アイウエオ0123456789MAPLE@#$%▓░'.split('');
            var t0 = Date.now();
            function draw() {
                ctx.fillStyle = 'rgba(5,5,5,0.09)'; ctx.fillRect(0, 0, cv.width, cv.height);
                ctx.fillStyle = '#ef4444'; ctx.font = step + 'px monospace';
                for (var i = 0; i < drops.length; i++) {
                    ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * step, drops[i] * step);
                    if (drops[i] * step > cv.height && Math.random() > 0.975) drops[i] = 0;
                    drops[i]++;
                }
                if (Date.now() - t0 < 3500) requestAnimationFrame(draw);
                else { cv.classList.add('out'); setTimeout(function () { if (cv.parentNode) cv.parentNode.removeChild(cv); }, 500); }
            }
            draw();
        }

        /* ── Konami code: ↑↑↓↓←→←→ B A ── */
        (function () {
            var seq = ['arrowup','arrowup','arrowdown','arrowdown','arrowleft','arrowright','arrowleft','arrowright','b','a'];
            var pos = 0;
            window.addEventListener('keydown', function (e) {
                var k = (e.key || '').toLowerCase();
                if (k === seq[pos]) {
                    pos++;
                    if (pos === seq.length) {
                        pos = 0;
                        unlockEgg('konami', 'KONAMI! Mở khoá huy hiệu «PHÁ ĐẢO HUYỀN THOẠI» 🕹️');
                        matrixRain();
                    }
                } else {
                    pos = (k === seq[0]) ? 1 : 0;
                }
            });
        })();

        /* ── Easter Egg: gõ "maple" ── */
        (function () {
            var seq = ['m','a','p','l','e'];
            var pos = 0;
            window.addEventListener('keydown', function (e) {
                var k = (e.key || '').toLowerCase();
                if (k === seq[pos]) {
                    pos++;
                    if (pos === seq.length) {
                        pos = 0;
                        unlockEgg('maple_secret', 'BÍ MẬT LÁ PHONG! Khởi động hiệu ứng lá phong rơi 🍁');
                        startMapleLeavesRain();
                    }
                } else {
                    pos = (k === seq[0]) ? 1 : 0;
                }
            });
        })();

        function startMapleLeavesRain() {
            if (reduceFX) return;
            var container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.left = '0';
            container.style.top = '0';
            container.style.width = '100vw';
            container.style.height = '100vh';
            container.style.pointerEvents = 'none';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
            
            for (var i = 0; i < 30; i++) {
                createLeaf(container);
            }
            
            setTimeout(function () {
                if (container.parentNode) container.parentNode.removeChild(container);
            }, 6000);
        }
        
        function createLeaf(parent) {
            var leaf = document.createElement('div');
            leaf.className = 'maple-leaf';
            leaf.innerHTML = '🍁';
            leaf.style.position = 'absolute';
            leaf.style.fontSize = (Math.random() * 12 + 12) + 'px';
            leaf.style.color = '#ef4444';
            leaf.style.opacity = Math.random() * 0.5 + 0.4;
            leaf.style.left = Math.random() * 100 + 'vw';
            leaf.style.top = '-5vh';
            parent.appendChild(leaf);
            
            var duration = Math.random() * 3000 + 2500;
            var startX = parseFloat(leaf.style.left);
            var drift = Math.random() * 100 - 50;
            var rotation = Math.random() * 360;
            var rotDir = Math.random() < 0.5 ? -1 : 1;
            
            var t0 = Date.now();
            function tick() {
                var elapsed = Date.now() - t0;
                var p = elapsed / duration;
                if (p >= 1) {
                    if (leaf.parentNode) leaf.parentNode.removeChild(leaf);
                    return;
                }
                var y = p * 110;
                var x = startX + Math.sin(p * Math.PI * 2) * (drift / 10);
                var rot = rotation + p * 360 * rotDir;
                leaf.style.top = y + 'vh';
                leaf.style.left = x + 'vw';
                leaf.style.transform = 'rotate(' + rot.toFixed(0) + 'deg)';
                requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        }

        /* ── Click logo 10 lần → «GÕ CỬA CỐC CỐC» (open_door) ── */
        (function () {
            var wrap = document.getElementById('maple-logo-wrap');
            if (!wrap) return;
            var n = 0, t = null;
            wrap.style.cursor = 'pointer';
            wrap.addEventListener('click', function () {
                n++; clearTimeout(t); t = setTimeout(function () { n = 0; }, 2500);
                wrap.classList.remove('maple-logo-bump'); void wrap.offsetWidth; wrap.classList.add('maple-logo-bump');
                if (n >= 10) { n = 0; unlockEgg('open_door', 'Mở khoá huy hiệu «GÕ CỬA CỐC CỐC» 🥚'); }
            });
        })();

        /* ── Click mắt logo 5 lần → «MẮT THẦN LORE» (eye_of_maple) ── */
        (function () {
            var eye = document.getElementById('maple-logo-eye');
            if (!eye) return;
            var n = 0, t = null;
            eye.style.cursor = 'pointer';
            eye.addEventListener('click', function (e) {
                e.stopPropagation();
                n++; clearTimeout(t); t = setTimeout(function () { n = 0; }, 2500);
                if (n >= 5) {
                    n = 0;
                    unlockEgg('eye_of_maple', 'MỞ KHÓA MẮT THẦN LORE! Đang kết nối tài liệu mật... 👁️');
                    showLoreOverlay();
                }
            });
        })();

        function showLoreOverlay() {
            if (document.getElementById('maple-lore-overlay')) return;
            var ov = document.createElement('div');
            ov.id = 'maple-lore-overlay';
            ov.className = 'maple-embed';
            ov.innerHTML =
                '<div class="maple-embed-win" style="max-width:550px; border-color:#ef4444;">' +
                    '<div class="maple-embed-bar" style="background:#1a0e0e; border-bottom-color:#ef4444;">' +
                        '<span class="maple-embed-dots"><i></i><i></i><i></i></span>' +
                        '<span class="maple-embed-url" style="color:#ef4444; font-family:monospace; font-size:10px;">[CLASSIFIED] LORE_DOCUMENT // M.A.P.L.E</span>' +
                        '<button class="maple-embed-close" type="button" aria-label="Đóng" style="border-color:#ef4444; color:#ef4444;">✕</button>' +
                    '</div>' +
                    '<div class="maple-embed-body" style="padding:24px; background:#050505; color:#e4e4e7; font-family:monospace; font-size:11px; line-height:1.7; overflow-y:auto; max-height:400px;">' +
                        '<p style="color:#ef4444; font-weight:bold; font-size:12px; margin-bottom:12px; border-bottom:1px solid #450a0a; padding-bottom:6px;">// THÔNG TIN BẢO MẬT CẤP ĐỘ 4</p>' +
                        '<p><b>M.A.P.L.E</b> không phải là một tổ chức cứu hộ thông thường. Chúng tôi được thành lập vào năm 1989 sau Sự Cố No-Clip đầu tiên tại Hà Nội, Việt Nam.</p>' +
                        '<p style="margin-top:10px;">Thực tại mà các bạn gọi là "Mê cung" thực chất là một sinh thể không gian đang phát triển liên tục. Mỗi Maze là một tế bào của nó. Khi các bạn di chuyển qua các Maze, các bạn đang giúp nó hấp thụ và xử lý thông tin của thế giới thực.</p>' +
                        '<p style="margin-top:10px; color:#a1a1aa;"><i>"Chúng tôi giữ cho các bạn sống sót không phải vì lòng nhân từ. Mà vì các bạn là các nút mạng giúp hệ thống M.A.P.L.E hoạt động."</i></p>' +
                        '<p style="margin-top:12px; border-top:1px dashed #ef4444; padding-top:10px; text-align:right; font-size:9px; color:#ef4444;">SYSTEM WARNING: TERMINATE CONNECTION IMMEDIATELY.</p>' +
                    '</div>' +
                '</div>';
            document.body.appendChild(ov);
            document.body.style.overflow = 'hidden';
            requestAnimationFrame(function () { ov.classList.add('show'); });
            
            function close() {
                ov.classList.remove('show');
                document.body.style.overflow = '';
                setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 300);
            }
            ov.querySelector('.maple-embed-close').addEventListener('click', close);
            ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
        }

        /* Confetti particle burst on QA card hover */
        function createConfettiBurst(el) {
            var rect = el.getBoundingClientRect();
            var container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.left = rect.left + 'px';
            container.style.top = rect.top + 'px';
            container.style.width = rect.width + 'px';
            container.style.height = rect.height + 'px';
            container.style.pointerEvents = 'none';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
            
            var colors = ['#ef4444', '#dc2626', '#f43f5e', '#b91c1c', '#ea580c'];
            for (var i = 0; i < 15; i++) {
                var p = document.createElement('div');
                p.style.position = 'absolute';
                p.style.width = (Math.random() * 4 + 3) + 'px';
                p.style.height = (Math.random() * 4 + 3) + 'px';
                p.style.background = colors[Math.floor(Math.random() * colors.length)];
                p.style.borderRadius = '50%';
                p.style.left = (rect.width / 2) + 'px';
                p.style.top = (rect.height / 2) + 'px';
                
                var angle = Math.random() * Math.PI * 2;
                var speed = Math.random() * 3 + 2;
                var vx = Math.cos(angle) * speed;
                var vy = Math.sin(angle) * speed - 1.5;
                
                container.appendChild(p);
                animateParticle(p, vx, vy);
            }
            
            setTimeout(function () {
                if (container.parentNode) container.parentNode.removeChild(container);
            }, 1000);
        }
        
        function animateParticle(p, vx, vy) {
            var x = 0, y = 0, opacity = 1;
            var g = 0.15;
            function tick() {
                x += vx;
                y += vy;
                vy += g;
                opacity -= 0.025;
                p.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
                p.style.opacity = opacity;
                if (opacity > 0) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        }

        root.addEventListener('mouseenter', function (e) {
            var card = e.target.closest('.maple-qa-card');
            if (!card || reduceFX) return;
            createConfettiBurst(card);
        }, true);

        /* ── Reveal khi cuộn (IntersectionObserver) ── */
        (function () {
            var els = document.querySelectorAll('.reveal');
            if (!('IntersectionObserver' in window)) {
                els.forEach(function (el) { el.classList.add('in'); });
                return;
            }
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    if (en.isIntersecting) {
                        en.target.classList.add('in');
                        io.unobserve(en.target);
                    }
                });
            }, { threshold: 0.12 });
            els.forEach(function (el) { io.observe(el); });
        })();

        /* ════════════════════════════════════════
           BLOG — mở bài trong overlay NHÚNG TƯƠNG TÁC (iframe), fallback điều hướng
           ════════════════════════════════════════ */
        function openEmbed(url, title) {
            if (!url || document.getElementById('maple-embed')) return;
            var ov = document.createElement('div');
            ov.id = 'maple-embed'; ov.className = 'maple-embed';
            ov.innerHTML =
                '<div class="maple-embed-win">' +
                    '<div class="maple-embed-bar">' +
                        '<span class="maple-embed-dots"><i></i><i></i><i></i></span>' +
                        '<span class="maple-embed-url">' + esc(title || url) + '</span>' +
                        '<a class="maple-embed-open" href="' + esc(url) + '" target="_blank" rel="noopener" title="Mở tab mới">↗</a>' +
                        '<button class="maple-embed-close" type="button" aria-label="Đóng">✕</button>' +
                    '</div>' +
                    '<div class="maple-embed-body">' +
                        '<div class="maple-embed-load"><span class="maple-embed-spin"></span> // ĐANG TẢI…</div>' +
                    '</div>' +
                '</div>';
            document.body.appendChild(ov);
            document.body.style.overflow = 'hidden';
            requestAnimationFrame(function () { ov.classList.add('show'); });

            var body = ov.querySelector('.maple-embed-body');
            var load = ov.querySelector('.maple-embed-load');
            var frame = document.createElement('iframe');
            frame.className = 'maple-embed-frame';
            frame.setAttribute('title', title || 'M.A.P.L.E');
            frame.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox');
            frame.src = url;
            var done = false;
            frame.addEventListener('load', function () { done = true; if (load) load.classList.add('done'); });
            body.appendChild(frame);
            setTimeout(function () {
                if (done || !ov.isConnected || !load) return;
                load.innerHTML = 'Không nhúng được trang này — <a href="' + esc(url) + '" style="color:#ef4444">mở trực tiếp ↗</a>';
                load.classList.add('maple-embed-failed');
            }, 4500);

            function close() {
                ov.classList.remove('show');
                document.body.style.overflow = '';
                document.removeEventListener('keydown', onKey);
                setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 300);
            }
            function onKey(e) { if (e.key === 'Escape') close(); }
            document.addEventListener('keydown', onKey);
            ov.querySelector('.maple-embed-close').addEventListener('click', close);
            ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
        }

        /* Click bài blog / bài mới → mở overlay nhúng (giữ Ctrl/giữa chuột để mở tab) */
        root.addEventListener('click', function (e) {
            var a = e.target.closest ? e.target.closest('.maple-blog-item') : null;
            if (!a) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
            e.preventDefault();
            var titleEl = a.querySelector('.maple-blog-title');
            openEmbed(a.getAttribute('href'), titleEl ? titleEl.textContent : 'M.A.P.L.E');
        });

        /* ── Tab logic ── */
        (function () {
            var bar = document.getElementById('maple-main-tab-bar');
            var indicator = document.getElementById('maple-main-tab-indicator');
            if (!bar) return;
            var btns = bar.querySelectorAll('.maple-main-tab-btn');
            var panels = document.querySelectorAll('.maple-main-tab-panel');

            function moveIndicator(btn) {
                if (!indicator || !btn) return;
                indicator.style.left = btn.offsetLeft + 'px';
                indicator.style.width = btn.offsetWidth + 'px';
            }

            function activate(id, scroll) {
                btns.forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-tab') === id); });
                panels.forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-tab') === id); });
                var activeBtn = bar.querySelector('.maple-main-tab-btn.active');
                moveIndicator(activeBtn);
                if (scroll && activeBtn) {
                    bar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
                // Save state to sessionStorage
                try { sessionStorage.setItem('maple_homepage_tab', id); } catch (e) {}
            }

            btns.forEach(function (b) {
                b.addEventListener('click', function () {
                    activate(b.getAttribute('data-tab'), false);
                });
            });

            // Restore state from sessionStorage or hash
            var savedTab = '';
            try { savedTab = sessionStorage.getItem('maple_homepage_tab'); } catch (e) {}
            var hash = (location.hash || '').replace(/^#tab-/, '');
            var defaultTab = hash || savedTab || 'dashboard';
            
            var validTabs = ['dashboard', 'archives', 'leaderboard', 'intel'];
            if (validTabs.indexOf(defaultTab) === -1) {
                defaultTab = 'dashboard';
            }
            
            activate(defaultTab, !!hash);

            window.addEventListener('resize', function () {
                moveIndicator(bar.querySelector('.maple-main-tab-btn.active'));
            });
            /* Đặt indicator đúng sau khi layout ổn định */
            setTimeout(function () { moveIndicator(bar.querySelector('.maple-main-tab-btn.active')); }, 100);
        })();

        /* ════════════════════════════════════════
           API: thống kê + blog + bài mới
           ════════════════════════════════════════ */
        mw.loader.using('mediawiki.api').then(function () {
            var api = new mw.Api();

            /* ── Thống kê + count-up ── */
            function countUp(el, target) {
                if (!el) return;
                var dur = 1100, start = null;
                function step(ts) {
                    if (!start) start = ts;
                    var p = Math.min((ts - start) / dur, 1);
                    var ease = 1 - Math.pow(1 - p, 3);
                    el.textContent = fmt(Math.floor(ease * target));
                    if (p < 1) requestAnimationFrame(step);
                    else el.textContent = fmt(target);
                }
                requestAnimationFrame(step);
            }

            var activeUsersCount = 0;
            var newPagesCount = 0;

            api.get({ action: 'query', meta: 'siteinfo', siprop: 'statistics', formatversion: 2 })
                .then(function (res) {
                    var s = res && res.query && res.query.statistics;
                    if (!s) return;
                    activeUsersCount = s.activeusers || s.users || 0;
                    countUp(document.getElementById('maple-stat-pages'), s.articles || s.pages || 0);
                    countUp(document.getElementById('maple-stat-edits'), s.edits || 0);
                    countUp(document.getElementById('maple-stat-users'), s.activeusers || s.users || 0);
                    countUp(document.getElementById('maple-stat-files'), s.images || 0);
                })
                .catch(function () { });

            // Recent changes count for last 24 hours
            var oneDayAgo = new Date(Date.now() - 86400000).toISOString();
            api.get({
                action: 'query', list: 'recentchanges',
                rctype: 'new', rcnamespace: 0, rcshow: '!bot|!redirect',
                rcend: oneDayAgo, rclimit: 100, formatversion: 2
            }).then(function (res) {
                var items = (res && res.query && res.query.recentchanges) || [];
                newPagesCount = items.length;
            }).catch(function () { })
            .then(function () {
                if (newPagesCount > 0) phrases.push(newPagesCount + ' HỒ SƠ MỚI ĐƯỢC TẠO TRONG 24H QUA');
                if (activeUsersCount > 0) phrases.push(activeUsersCount + ' ĐẶC VỤ ĐANG HOẠT ĐỘNG TRÊN TOÀN HỆ THỐNG');
            });

            /* ── Leaderboard + Total RP stats ── */
            var achPage = 'MediaWiki:UserAchievements.json';
            api.get({ action: 'query', titles: achPage, prop: 'revisions', rvprop: 'content', rvslots: 'main', format: 'json', formatversion: 2 })
                .then(function (res) {
                    var pg = res && res.query && res.query.pages && res.query.pages[0];
                    var content = pg && pg.revisions && pg.revisions[0] && pg.revisions[0].slots && pg.revisions[0].slots.main && pg.revisions[0].slots.main.content;
                    var data = {};
                    try { data = JSON.parse(content || '{}'); } catch (e) {}
                    
                    var CAT = window.MAPLE.catalog;
                    if (!CAT) return;
                    
                    var totalCommunityRP = 0;
                    var users = Object.keys(data).map(function (name) {
                        var list = data[name] || [];
                        var rp = CAT.computeRP(list);
                        totalCommunityRP += rp;
                        return { name: name, list: list, rp: rp };
                    }).filter(function (u) { return u.list.length > 0; });
                    
                    // Update total community RP stat chip
                    countUp(document.getElementById('maple-stat-rp'), totalCommunityRP);
                    
                    users.sort(function (a, b) { return b.rp - a.rp || b.list.length - a.list.length; });
                    var top5 = users.slice(0, 5);
                    var container = document.getElementById('maple-leaderboard-list');
                    if (!container) return;
                    
                    if (top5.length === 0) {
                        container.innerHTML = '<div class="maple-blog-empty">Chưa có dữ liệu vinh danh.</div>';
                        return;
                    }
                    
                    container.innerHTML = top5.map(function (u, i) {
                        var tier = CAT.tierOf(u.rp);
                        var firstChar = esc(u.name.substring(0, 1).toUpperCase());
                        return '<div class="maple-leaderboard-item">' +
                            '  <span class="maple-leaderboard-rank">#' + (i + 1) + '</span>' +
                            '  <span class="maple-leaderboard-avatar" style="border-color:' + esc(tier.color) + ';box-shadow:0 0 10px ' + esc(tier.color) + '33;">' + firstChar + '</span>' +
                            '  <div class="maple-leaderboard-info">' +
                            '    <a class="maple-leaderboard-name" href="' + mw.util.getUrl('Thành viên:' + u.name) + '">' + esc(u.name) + '</a>' +
                            '    <span class="maple-leaderboard-tier" style="color:' + esc(tier.color) + ';">TIER ' + tier.n + ' · ' + esc(tier.label) + '</span>' +
                            '  </div>' +
                            '  <span class="maple-leaderboard-rp">' + u.rp + ' RP</span>' +
                            '</div>';
                    }).join('');
                })
                .catch(function () {
                    var container = document.getElementById('maple-leaderboard-list');
                    if (container) container.innerHTML = '<div class="maple-blog-empty">Không thể tải bảng xếp hạng.</div>';
                });

            /* ── Blog (BlogPage) — dò động thể loại + featured/pinned blog ── */
            var BLOG_CATS = ['Thể_loại:Blog_posts', 'Thể_loại:Blog', 'Category:Blog_posts', 'Category:Blog'];

            function tryBlogCat(i) {
                if (i >= BLOG_CATS.length) return Promise.resolve([]);
                return api.get({
                    action: 'query', list: 'categorymembers',
                    cmtitle: BLOG_CATS[i].replace(/_/g, ' '),
                    cmsort: 'timestamp', cmdir: 'desc', cmlimit: 5,
                    cmprop: 'title|timestamp', formatversion: 2
                }).then(function (res) {
                    var items = (res && res.query && res.query.categorymembers) || [];
                    if (items.length) return items;
                    return tryBlogCat(i + 1);
                }).catch(function () { return tryBlogCat(i + 1); });
            }

            function renderBlogList(el, items, emptyMsg, thumbs) {
                if (!el) return;
                if (!items.length) {
                    el.innerHTML = '<div class="maple-blog-empty">' + esc(emptyMsg) + '</div>';
                    return;
                }
                thumbs = thumbs || {};
                el.innerHTML = items.map(function (it) {
                    var title = it.title.replace(/^[^:]+:/, '');
                    var thumbUrl = thumbs[it.title] || '';
                    var thumbHtml = thumbUrl ? '<img class="maple-blog-thumbnail" src="' + esc(thumbUrl) + '" style="margin-right:12px; width:40px; height:40px; object-fit:cover; border-radius:4px; border:1px solid #18181b; flex-shrink:0;">' : '';
                    var pinHtml = it.pinned ? '<span class="maple-blog-pin" style="color:#ef4444; font-weight:bold; margin-right:6px;">📌 [GHIM]</span>' : '';
                    return '<a class="maple-blog-item" href="' + mw.util.getUrl(it.title) + '" style="display:flex; align-items:center;">' +
                        thumbHtml +
                        '<div style="flex:1; min-width:0; display:flex; flex-direction:column; gap:4px; text-align:left;">' +
                        '  <span class="maple-blog-title" style="display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + pinHtml + esc(title) + '</span>' +
                        '  <span class="maple-blog-meta">' + esc(relTime(it.timestamp)) + '</span>' +
                        '</div>' +
                        '</a>';
                }).join('');
            }

            function fetchThumbnailsAndRender(el, items, emptyMsg) {
                if (!items.length) {
                    renderBlogList(el, items, emptyMsg);
                    return;
                }
                var titles = items.map(function (it) { return it.title; });
                api.get({
                    action: 'query', titles: titles.join('|'),
                    prop: 'pageimages', piprop: 'thumbnail', pithumbsize: 80, formatversion: 2
                }).then(function (res) {
                    var pages = (res && res.query && res.query.pages) || [];
                    var thumbs = {};
                    pages.forEach(function (p) {
                        if (p.thumbnail && p.thumbnail.source) thumbs[p.title] = p.thumbnail.source;
                    });
                    renderBlogList(el, items, emptyMsg, thumbs);
                }).catch(function () {
                    renderBlogList(el, items, emptyMsg);
                });
            }

            // Pinned/Featured blog logic
            var pinnedBlogTitle = '';
            var configPage = 'MediaWiki:Maple-Config.json';
            api.get({ action: 'query', titles: configPage, prop: 'revisions', rvprop: 'content', rvslots: 'main', format: 'json', formatversion: 2 })
                .then(function (res) {
                    var pg = res && res.query && res.query.pages && res.query.pages[0];
                    var content = pg && pg.revisions && pg.revisions[0] && pg.revisions[0].slots && pg.revisions[0].slots.main && pg.revisions[0].slots.main.content;
                    if (content) {
                        var cfgJson = JSON.parse(content);
                        if (cfgJson && cfgJson.pinnedBlog) {
                            pinnedBlogTitle = cfgJson.pinnedBlog;
                        }
                    }
                })
                .catch(function () { })
                .then(function () {
                    if (pinnedBlogTitle) {
                        return api.get({
                            action: 'query', titles: pinnedBlogTitle,
                            prop: 'revisions', rvprop: 'timestamp', formatversion: 2
                        }).then(function (res) {
                            var pg = res && res.query && res.query.pages && res.query.pages[0];
                            if (pg && !pg.missing && pg.revisions && pg.revisions[0]) {
                                return {
                                    title: pg.title,
                                    timestamp: pg.revisions[0].timestamp,
                                    pinned: true
                                };
                            }
                            return null;
                        });
                    }
                    return null;
                })
                .then(function (pinnedItem) {
                    tryBlogCat(0).then(function (catItems) {
                        var items = catItems.slice();
                        if (pinnedItem) {
                            items = items.filter(function (it) { return it.title !== pinnedItem.title; });
                            items.unshift(pinnedItem);
                            items = items.slice(0, 5);
                        }
                        fetchThumbnailsAndRender(document.getElementById('maple-blog-list'), items, 'Chưa có bài blog. Hãy là người đầu tiên!');
                    }).catch(function () {
                        fetchThumbnailsAndRender(document.getElementById('maple-blog-list'), [], 'Không tải được blog.');
                    });
                });

            /* ── Bài mới (recentchanges, namespace bài viết) ── */
            api.get({
                action: 'query', list: 'recentchanges',
                rctype: 'new', rcnamespace: 0, rcshow: '!bot|!redirect',
                rcprop: 'title|timestamp', rclimit: 6, formatversion: 2
            }).then(function (res) {
                var items = (res && res.query && res.query.recentchanges) || [];
                fetchThumbnailsAndRender(document.getElementById('maple-recent-list'), items, 'Chưa có bài mới.');
            }).catch(function () {
                fetchThumbnailsAndRender(document.getElementById('maple-recent-list'), [], 'Không tải được bài mới.');
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else { init(); }
})();
