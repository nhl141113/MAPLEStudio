/**
 * M.A.P.L.E — MediaWiki:Welcome.js
 * Engine cho tính năng Welcome Tour, hiển thị hướng dẫn tương tác trên các trang.
 * Kích hoạt bằng cách thêm /welcome vào cuối URL của một trang.
 */
(function () {
    'use strict';

    var pageName = mw.config.get('wgPageName') || '';
    if (!pageName.toLowerCase().endsWith('/welcome')) {
        return;
    }

    var viewer = (mw.config.get('wgUserName') || '').replace(/ /g, '_');
    var tourFlow = [
        { page: 'Trang_Chính', welcome: 'Trang_Chính/welcome', name: 'Trang Chủ' },
        { page: 'Kho_Lưu_Trữ', welcome: 'Kho_Lưu_Trữ/welcome', name: 'Kho Lưu Trữ' },
        { page: 'Thủ_Tục', welcome: 'Thủ_Tục/welcome', name: 'Thủ Tục' },
        { page: 'Sự_Kiện', welcome: 'Sự_Kiện/welcome', name: 'Sự Kiện' },
        { page: 'Thành_Tựu', welcome: 'Thành_Tựu/welcome', name: 'Thành Tựu' },
        { page: 'Nhiệm_Vụ', welcome: 'Nhiệm_Vụ/welcome', name: 'Nhiệm Vụ' },
        { page: 'Bảng_Tin', welcome: 'Bảng_Tin/welcome', name: 'Bảng Tin' },
        { page: 'Trợ_giúp', welcome: 'Trợ_giúp/welcome', name: 'Trợ Giúp' },
        { page: 'User:' + viewer, welcome: 'User:' + viewer + '/welcome', name: 'Hồ Sơ Cá Nhân' }
    ];

    // --- Config & State ---
    var state = {
        currentStep: 0,
        tour: null,
        basePageName: '',
        autoPlayInterval: null
    };

    // Tìm vị trí trang hiện tại trong flow liên trang
    state.basePageName = pageName.substring(0, pageName.length - 8); // Bỏ '/welcome' ở cuối
    var normalizedBase = state.basePageName.replace(/_/g, ' ').toLowerCase();

    var currentIndex = -1;
    for (var i = 0; i < tourFlow.length; i++) {
        var flowPage = tourFlow[i].page.replace(/_/g, ' ').toLowerCase();
        if (flowPage === normalizedBase || 
            (flowPage.indexOf('user:') === 0 && (normalizedBase.indexOf('user:') === 0 || normalizedBase.indexOf('người dùng:') === 0 || normalizedBase.indexOf('người_dùng:') === 0))) {
            currentIndex = i;
            break;
        }
    }

    // --- Helpers ---
    function esc(s) {
        return String(s || '').replace(/[&<>"']/g, function (c) {
            return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
        });
    }

    // --- Core Functions ---

    /**
     * Tìm tour phù hợp cho trang hiện tại
     */
    function getTourForPage(pageName) {
        if (window.MAPLE_TOUR_CONFIG && typeof window.MAPLE_TOUR_CONFIG.getTour === 'function') {
            return window.MAPLE_TOUR_CONFIG.getTour(pageName);
        }
        return null;
    }

    /**
     * Lưu bio của người dùng thông qua API
     */
    function saveUserBio(username, bioText, onSuccess, onError) {
        var profilePage = 'User:' + username.replace(/ /g, '_') + '/Maple-Profile';
        var api = new mw.Api();

        api.get({
            action: 'query', titles: profilePage,
            prop: 'revisions', rvprop: 'content', rvslots: 'main',
            format: 'json', formatversion: 2
        }).done(function(r) {
            var data = { bio: bioText };
            try {
                var pg = r.query && r.query.pages && r.query.pages[0];
                if (pg && !pg.missing && pg.revisions && pg.revisions[0]) {
                    var content = pg.revisions[0].slots.main.content || '{}';
                    data = JSON.parse(content);
                    data.bio = bioText;
                }
            } catch(e) {}

            api.get({ action: 'query', meta: 'tokens', type: 'csrf', format: 'json' })
            .done(function(tokData) {
                var token = tokData.query && tokData.query.tokens && tokData.query.tokens.csrftoken;
                if (!token || token === '+\\') { onError('Chưa đăng nhập hoặc thiếu token'); return; }

                api.post({
                    action: 'edit', title: profilePage, format: 'json',
                    text: JSON.stringify(data),
                    summary: 'Cập nhật bio qua Welcome Tour',
                    token: token
                }).done(function(res) {
                    if (res.error) {
                        onError(res.error.info || 'Lỗi lưu trữ');
                    } else {
                        var cacheKey = 'maple_profile_cache_' + username.replace(/\s/g, '_');
                        try {
                            localStorage.setItem(cacheKey, JSON.stringify(data));
                        } catch(e) {}
                        onSuccess();
                    }
                }).fail(function() { onError('Lỗi mạng khi lưu hồ sơ'); });
            }).fail(function() { onError('Không lấy được CSRF token'); });
        }).fail(function() { onError('Lỗi mạng khi lấy hồ sơ'); });
    }

    /**
     * Render giao diện tour
     */
    function renderTourUI() {
        var tour = state.tour;
        var container = document.getElementById('mw-content-text');
        if (!container || !tour) return;

        var sidebarSteps = tour.steps.map(function (step, index) {
            return (
                '<div class="wt-step' + (index === state.currentStep ? ' active' : '') + '" data-step="' + index + '">' +
                '<div class="wt-step-num">' + (index + 1) + '</div>' +
                '<div class="wt-step-title">' + esc(step.title) + '</div>' +
                '</div>'
            );
        }).join('');

        var tourHtml =
            '<div id="wt-root">' +
            '  <div id="wt-backdrop"></div>' +
            '  <div id="wt-highlight"></div>' +
            '  <div id="wt-popover">' +
            '    <div id="wt-popover-title"></div>' +
            '    <div id="wt-popover-content"></div>' +
            '    <div id="wt-popover-nav">' +
            '      <button id="wt-prev-btn" class="wt-btn wt-btn-ghost">‹ Quay lại</button>' +
            '      <button id="wt-next-btn" class="wt-btn">Tiếp theo ›</button>' +
            '    </div>' +
            '  </div>' +
            '  <div id="wt-sidebar">' +
            '    <div class="wt-sidebar-header">' +
            '      <div class="wt-sidebar-icon">🧭</div>' +
            '      <div class="wt-sidebar-title">Hướng dẫn trang</div>' +
            '      <div class="wt-sidebar-page">' + esc(state.basePageName.replace(/_/g, ' ')) + '</div>' +
            '    </div>' +
            '    <div class="wt-steps">' + sidebarSteps + '</div>' +
            '    <div class="wt-sidebar-footer">' +
            '      <div style="margin-bottom: 8px;">' +
            '        <button id="wt-autoplay-btn" class="wt-btn wt-btn-ghost" style="width: 100%;">▶ Tự động phát</button>' +
            '        <div id="wt-autoplay-progress-bg" style="width:100%;height:2px;background:#27272a;margin-top:4px;border-radius:2px;display:none;overflow:hidden;">' +
            '          <div id="wt-autoplay-progress" style="width:0%;height:100%;background:#ef4444;border-radius:2px;"></div>' +
            '        </div>' +
            '      </div>' +
            '      <button id="wt-finish-btn" class="wt-btn wt-btn-finish">✓ Kết thúc</button>' +
            '    </div>' +
            '  </div>' +
            '</div>';

        var tourContainer = document.createElement('div');
        tourContainer.innerHTML = tourHtml;
        document.body.appendChild(tourContainer);

        // --- Event Listeners ---
        document.getElementById('wt-prev-btn').addEventListener('click', function () { stopAutoPlay(); goToStep(state.currentStep - 1); });
        document.getElementById('wt-next-btn').addEventListener('click', function () { stopAutoPlay(); });
        document.getElementById('wt-finish-btn').addEventListener('click', finishTour);
        document.getElementById('wt-autoplay-btn').addEventListener('click', toggleAutoPlay);
        document.querySelectorAll('.wt-step').forEach(function (el) {
            el.addEventListener('click', function () { stopAutoPlay(); goToStep(parseInt(el.getAttribute('data-step'), 10)); });
        });

        // Lắng nghe phím tắt điều khiển
        document.addEventListener('keydown', handleKeyPress);
    }

    function handleKeyPress(e) {
        if (!state.tour) return;
        if (e.key === 'ArrowRight') {
            stopAutoPlay();
            var nextBtn = document.getElementById('wt-next-btn');
            if (nextBtn) nextBtn.click();
        } else if (e.key === 'ArrowLeft') {
            stopAutoPlay();
            goToStep(state.currentStep - 1);
        } else if (e.key === 'Escape') {
            finishTour();
        }
    }

    function toggleAutoPlay() {
        if (state.autoPlayInterval) stopAutoPlay();
        else startAutoPlay();
    }

    function startAutoPlay() {
        var btn = document.getElementById('wt-autoplay-btn');
        var progBg = document.getElementById('wt-autoplay-progress-bg');
        if (btn) {
            btn.innerHTML = '⏸ Tạm dừng';
            btn.style.borderColor = '#ef4444';
            btn.style.color = '#ef4444';
            btn.style.background = 'rgba(239, 68, 68, 0.1)';
        }
        if (progBg) progBg.style.display = 'block';

        if (state.autoPlayInterval) clearInterval(state.autoPlayInterval);

        function runProgress() {
            var prog = document.getElementById('wt-autoplay-progress');
            if (prog) {
                prog.style.transition = 'none';
                prog.style.width = '0%';
                void prog.offsetWidth;
                prog.style.transition = 'width 5s linear';
                prog.style.width = '100%';
            }
        }

        runProgress();
        state.autoPlayInterval = setInterval(function() {
            if (state.tour && state.currentStep < state.tour.steps.length - 1) {
                goToStep(state.currentStep + 1);
                runProgress();
            } else {
                stopAutoPlay();
                // Tự động kích hoạt chuyển trang nếu trong flow liên tục
                var nextBtn = document.getElementById('wt-next-btn');
                if (nextBtn) nextBtn.click();
            }
        }, 5000);
    }

    function stopAutoPlay() {
        var btn = document.getElementById('wt-autoplay-btn');
        var progBg = document.getElementById('wt-autoplay-progress-bg');
        if (btn) {
            btn.innerHTML = '▶ Tự động phát';
            btn.style.borderColor = '';
            btn.style.color = '';
            btn.style.background = '';
        }
        if (progBg) progBg.style.display = 'none';

        var prog = document.getElementById('wt-autoplay-progress');
        if (prog) {
            prog.style.transition = 'none';
            prog.style.width = '0%';
        }

        if (state.autoPlayInterval) {
            clearInterval(state.autoPlayInterval);
            state.autoPlayInterval = null;
        }
    }

    /**
     * Chuyển đến một bước cụ thể trong tour
     */
    function goToStep(stepIndex) {
        var tour = state.tour;
        if (stepIndex < 0 || stepIndex >= tour.steps.length) {
            return;
        }
        state.currentStep = stepIndex;

        // Cập nhật sidebar
        document.querySelectorAll('.wt-step').forEach(function (el) {
            el.classList.toggle('active', parseInt(el.getAttribute('data-step'), 10) === stepIndex);
        });

        // Cập nhật popover và highlight
        var step = tour.steps[stepIndex];
        var popover = document.getElementById('wt-popover');
        var highlight = document.getElementById('wt-highlight');
        var targetEl = step.selector ? document.querySelector(step.selector) : null;

        popover.classList.remove('wt-popover-center');

        if (targetEl) {
            var rect = targetEl.getBoundingClientRect();
            highlight.style.display = 'block';
            highlight.style.width = rect.width + 'px';
            highlight.style.height = rect.height + 'px';
            highlight.style.top = (rect.top + window.scrollY) + 'px';
            highlight.style.left = (rect.left + window.scrollX) + 'px';

            popover.style.display = 'block';
            document.getElementById('wt-popover-title').textContent = step.title;
            
            var contentEl = document.getElementById('wt-popover-content');
            setupContentAndBio(contentEl, step);

            // Vị trí popover
            popover.style.top = (rect.bottom + window.scrollY + 10) + 'px';
            popover.style.left = (rect.left + window.scrollX) + 'px';
            
            // Cuộn trang mượt mà
            var windowHeight = window.innerHeight;
            if (rect.height > windowHeight * 0.8) {
                window.scrollTo({ top: rect.top + window.scrollY - 80, behavior: 'smooth' });
            } else {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

        } else {
            // Không tìm thấy phần tử -> Đưa ra giữa dạng Modal
            highlight.style.display = 'none';
            popover.style.display = 'block';
            popover.classList.add('wt-popover-center');

            document.getElementById('wt-popover-title').textContent = step.title;
            var contentEl = document.getElementById('wt-popover-content');
            setupContentAndBio(contentEl, step);
        }

        // Cập nhật nút nav
        document.getElementById('wt-prev-btn').style.visibility = (stepIndex === 0) ? 'hidden' : 'visible';
        var nextBtn = document.getElementById('wt-next-btn');
        var isLastStep = (stepIndex === tour.steps.length - 1);
        var isFlowActive = localStorage.getItem('maple_tour_active_flow') === 'true';

        if (isLastStep) {
            nextBtn.classList.add('wt-btn-finish-step');
            
            if (isFlowActive && currentIndex !== -1 && currentIndex < tourFlow.length - 1) {
                var nextName = tourFlow[currentIndex + 1].name;
                nextBtn.textContent = 'Tiếp tục đến ' + nextName + ' ➔';
                nextBtn.onclick = function() {
                    stopAutoPlay();
                    window.location.href = mw.util.getUrl(tourFlow[currentIndex + 1].welcome);
                };
            } else {
                nextBtn.textContent = 'Hoàn thành ➔';
                nextBtn.onclick = finishTour;
            }
        } else {
            nextBtn.classList.remove('wt-btn-finish-step');
            nextBtn.textContent = 'Tiếp theo ›';
            nextBtn.onclick = function () { goToStep(state.currentStep + 1); };
        }
    }

    /**
     * Đổ nội dung mô tả hoặc tiêm form nhập Bio
     */
    function setupContentAndBio(contentEl, step) {
        if (step.interactive === 'bio') {
            contentEl.innerHTML = step.content +
                '<div class="wt-bio-form" style="margin-top: 12px;">' +
                '  <textarea id="wt-bio-input" placeholder="Viết mô tả ngắn của bạn (ví dụ: Chuyên gia sinh tồn)..." rows="3" style="width:100%;background:#09090b;border:1px solid #27272a;color:#fff;font-family:inherit;font-size:11px;padding:8px;border-radius:6px;resize:none;margin-bottom:8px;outline:none;box-sizing:border-box;"></textarea>' +
                '  <div style="display:flex;gap:6px;justify-content:flex-end;">' +
                '    <button id="wt-bio-skip-btn" class="wt-btn wt-btn-ghost" style="padding:4px 8px;font-size:10px;">Bỏ qua</button>' +
                '    <button id="wt-bio-save-btn" class="wt-btn" style="padding:4px 10px;font-size:10px;background:#22c55e;border-color:#16a34a;color:#fff;">Lưu hồ sơ</button>' +
                '  </div>' +
                '  <div id="wt-bio-status" style="font-size:10px;margin-top:6px;display:none;"></div>' +
                '</div>';

            setTimeout(function() {
                var btnSave = document.getElementById('wt-bio-save-btn');
                var btnSkip = document.getElementById('wt-bio-skip-btn');
                var inputBio = document.getElementById('wt-bio-input');
                var status = document.getElementById('wt-bio-status');

                if (btnSave) {
                    btnSave.addEventListener('click', function() {
                        var bioText = inputBio.value.trim();
                        if (!bioText) {
                            status.style.display = 'block';
                            status.style.color = '#ef4444';
                            status.textContent = 'Vui lòng nhập nội dung!';
                            return;
                        }
                        status.style.display = 'block';
                        status.style.color = '#a1a1aa';
                        status.textContent = 'Đang lưu hồ sơ...';
                        btnSave.disabled = true;

                        saveUserBio(mw.config.get('wgUserName'), bioText, function() {
                            status.style.color = '#10b981';
                            status.textContent = 'Lưu thành công! Đang chuyển tiếp...';
                            setTimeout(function() {
                                goToStep(state.currentStep + 1);
                            }, 1000);
                        }, function(err) {
                            btnSave.disabled = false;
                            status.style.color = '#ef4444';
                            status.textContent = 'Lỗi: ' + err;
                        });
                    });
                }

                if (btnSkip) {
                    btnSkip.addEventListener('click', function() {
                        goToStep(state.currentStep + 1);
                    });
                }
            }, 50);
        } else {
            contentEl.innerHTML = step.content;
        }
    }

    /**
     * Kết thúc tour
     */
    function finishTour() {
        stopAutoPlay();
        document.removeEventListener('keydown', handleKeyPress);
        localStorage.removeItem('maple_tour_active_flow');
        window.location.href = mw.util.getUrl(state.basePageName);
    }

    /**
     * Tải nội dung trang gốc và bắt đầu tour
     */
    function fetchAndRender(basePageName) {
        var api = new mw.Api();
        var contentContainer = document.getElementById('mw-content-text');
        contentContainer.innerHTML = '<div class="wt-loading"><div class="wt-spin"></div><br>Đang tải trang hướng dẫn...</div>';

        api.get({
            action: 'parse',
            page: basePageName,
            prop: 'text',
            formatversion: 2
        }).done(function (data) {
            if (data && data.parse && data.parse.text) {
                contentContainer.innerHTML = data.parse.text;
                mw.hook('wikipage.content').fire($(contentContainer));

                setTimeout(function() {
                    renderTourUI();
                    goToStep(0);
                }, 400);

            } else {
                contentContainer.innerHTML = '<div class="wt-error">Không thể tải nội dung trang gốc.</div>';
            }
        }).fail(function () {
            contentContainer.innerHTML = '<div class="wt-error">Lỗi API khi tải trang.</div>';
        });
    }

    /**
     * Khởi tạo
     */
    function init() {
        document.body.classList.add('wt-active');

        // Tải cấu hình Tour động bằng cách đọc raw Welcome-Tours.js
        var tourUrl = mw.config.get('wgScript') + '?title=MediaWiki:Welcome-Tours.js&action=raw&ctype=text/javascript';
        mw.loader.getScript(tourUrl).done(function() {
            state.tour = getTourForPage(state.basePageName);

            if (state.tour) {
                // Tự động tiêm các bước bio nếu đang ở trang cá nhân của chính mình
                var isOwnPage = viewer && (
                    state.basePageName === 'User:' + viewer ||
                    state.basePageName === 'Người_dùng:' + viewer
                );

                if (isOwnPage) {
                    var hasBioStep = state.tour.steps.some(function(s) { return s.interactive === 'bio'; });
                    if (!hasBioStep) {
                        state.tour.steps.push({
                            title: 'Cập nhật tiểu sử (Bio)',
                            content: 'Đặc vụ hãy nhập một mô tả ngắn tại đây để hoàn tất hồ sơ cá nhân và nhận dạng trên toàn mạng.',
                            selector: '.up-customize-btn',
                            interactive: 'bio'
                        });
                        state.tour.steps.push({
                            title: 'Hoàn thành hành trình!',
                            content: 'Chuyên án hướng dẫn thực địa đã hoàn tất. Bạn đã nắm rõ cấu trúc và vận hành của hệ thống M.A.P.L.E.',
                            selector: '#wt-root'
                        });
                    }
                }

                fetchAndRender(state.basePageName);
            } else {
                document.getElementById('mw-content-text').innerHTML =
                    '<div class="wt-error" style="min-height: 60vh; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 1rem;">' +
                    '<h2>Không có hướng dẫn cho trang này</h2>' +
                    '<p>Hiện tại chưa có tour hướng dẫn nào được thiết lập cho trang <strong>' + esc(state.basePageName.replace(/_/g, ' ')) + '</strong>.</p>' +
                    '<a href="' + esc(mw.util.getUrl(state.basePageName)) + '" class="wt-btn">Quay lại trang gốc</a>' +
                    '</div>';
            }
        }).fail(function() {
            document.getElementById('mw-content-text').innerHTML = '<div class="wt-error">Không thể tải cấu hình Welcome Tours.</div>';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();