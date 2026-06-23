/* ============================================
   M.A.P.L.E — MediaWiki:Hướng_Dẫn_Viết.js
   ============================================ */

(function () {
    function init() {

    if (mw.config.get('wgPageName') !== 'Hướng_Dẫn_Viết' &&
        mw.config.get('wgPageName') !== 'H%C6%B0%E1%BB%9Bng_D%E1%BA%ABn_Vi%E1%BA%BFt') return;

    var target = document.getElementById('mw-content-text')
              || document.getElementById('content');
    if (!target) return;

    /* Ẩn chrome Vector */
    var s = document.createElement('style');
    s.textContent =
        '.vector-column-start,#mw-panel,.vector-main-menu-container,' +
        'header.mw-header,.vector-header-container,.vector-sticky-header,' +
        '#vector-sticky-header,.vector-page-titlebar,.vector-page-toolbar,' +
        '.vector-column-end,#footer,.mw-footer-container,' +
        '#firstHeading,.mw-indicators,#siteSub,#contentSub,' +
        '.printfooter,#catlinks,.mw-body-header{display:none!important}' +
        '.mw-page-container,#mw-content-text,.mw-body,#content,' +
        '.vector-column-content,.mw-page-container-inner{' +
        'padding:0!important;margin:0!important;max-width:100%!important;' +
        'width:100%!important;background:transparent!important;' +
        'border:none!important;box-shadow:none!important}' +
        'html,body{background:#030303!important}';
    document.head.appendChild(s);

    /* ── Helper functions ── */
    function sect(label, color, cards) {
        return '<div class="hdv-section">' +
            '<div class="hdv-section-head">' +
            '<span class="hdv-section-badge" style="color:' + color + ';border-color:' + color + '">' + label + '</span>' +
            '<div class="hdv-section-line"></div>' +
            '</div>' +
            '<div class="hdv-cards">' + cards.join('') + '</div>' +
            '</div>';
    }

    function card(required, color, name, desc) {
        var tagText  = required ? 'BẮT BUỘC' : 'TÙY CHỌN';
        var tagStyle = required
            ? 'background:rgba(' + hexToRgb(color) + ',0.1);color:' + color + ';border-color:rgba(' + hexToRgb(color) + ',0.2)'
            : '';
        var tagClass  = required ? 'hdv-tag-req' : 'hdv-tag-opt';
        var cardClass = required ? 'hdv-card-required' : 'hdv-card-optional';
        return '<div class="hdv-card ' + cardClass + '" style="--card-color:' + (required ? color : '#27272a') + '">' +
            '<div class="hdv-card-header">' +
            '<span class="hdv-card-name">' + name + '</span>' +
            '<span class="hdv-card-tag ' + tagClass + '" style="' + tagStyle + '">' + tagText + '</span>' +
            '</div>' +
            '<p class="hdv-card-desc">' + desc + '</p>' +
            '</div>';
    }

    function hexToRgb(hex) {
        return parseInt(hex.slice(1,3),16) + ',' +
               parseInt(hex.slice(3,5),16) + ',' +
               parseInt(hex.slice(5,7),16);
    }

    function divider(label, color) {
        return '<div class="hdv-divider" style="--div-color:' + color + '">' +
            '<span class="hdv-divider-line"></span>' +
            '<span class="hdv-divider-label">' + label + '</span>' +
            '<span class="hdv-divider-line"></span>' +
            '</div>';
    }

    function testTable() {
        return '<div class="hdv-section" style="margin-top:32px">' +
            '<div class="hdv-section-head">' +
            '<span class="hdv-section-badge" style="color:#a78bfa;border-color:#a78bfa">BẢNG MẪU</span>' +
            '<span class="hdv-section-title">Định dạng Bảng Thử nghiệm</span>' +
            '<div class="hdv-section-line"></div>' +
            '</div>' +
            '<div class="hdv-table-wrap">' +
            '<table class="hdv-table">' +
            '<thead><tr><th>Mã Thử nghiệm</th><th>Biến số</th><th>Kết quả Quan sát</th><th>Tình trạng</th></tr></thead>' +
            '<tbody>' +
            '<tr><td>T-01</td><td>Tiếp xúc Ánh sáng UV</td><td>Thực thể co lại, phát ra tiếng kêu đau đớn.</td><td><span class="status-alive">Còn sống</span></td></tr>' +
            '<tr><td>T-02</td><td>Tiếp xúc Hóa chất C₆H₆</td><td>Không phản ứng.</td><td><span class="status-normal">Bình thường</span></td></tr>' +
            '<tr><td>T-03</td><td>Tương tác với Con người</td><td>Thực thể tấn công ngay lập tức vào vùng cổ.</td><td><span class="status-dead">Đối tượng tử vong</span></td></tr>' +
            '</tbody></table></div></div>';
    }

    /* ══════════════════════════════════════════
       DATA — 3 TABS: ENTITY, ITEM, DIARY
       ══════════════════════════════════════════ */
    var TABS = [
        { id: 'entity', label: 'ENTITY', color: '#3b82f6' },
        { id: 'item',   label: 'ITEM',   color: '#f59e0b' },
        { id: 'diary',  label: 'DIARY',  color: '#f43f5e' }
    ];

    var PANELS = {

        /* ══ ENTITY ══ */
        entity: {
            accent: '#3b82f6',
            html:
                /* Bắt buộc */
                sect('BẮT BUỘC', '#3b82f6', [
                    card(true, '#3b82f6', 'Hình thái học (Morphology)',
                        'Mô tả chi tiết cấu trúc giải phẫu, các cơ quan nhận biết được, màu sắc, kết cấu bề mặt (da, vảy, lông) và kích thước trung bình (nếu có).' +
                        '<em>Với thực thể nguy hiểm không thể bắt giữ: mô tả chi tiết ngoại hình từ quan sát từ xa.</em>'),
                    card(true, '#3b82f6', 'Phân tích Hành vi (Ethology)',
                        'Các kiểu mẫu di chuyển, chu kỳ hoạt động (ngày/đêm), mức độ thông minh và xu hướng tương tác với môi trường.'),
                    card(true, '#3b82f6', 'Khả năng Đặc biệt & Cơ chế Tấn công',
                        'Danh sách các năng lực siêu nhiên hoặc vật lý. Mô tả cách thực thể tiêu diệt hoặc vô hiệu hóa mục tiêu.'),
                    card(true, '#3b82f6', 'Quy trình Ứng phó & Sinh tồn (Survival Protocol)',
                        'Các bước cụ thể để sống sót khi chạm trán. Bao gồm khoảng cách an toàn, các dấu hiệu báo động khi thực thể chuẩn bị tấn công.')
                ]) +
                /* Mở rộng */
                sect('MỞ RỘNG — KHÔNG BẮT BUỘC', '#27272a', [
                    card(false, '#3b82f6', 'Giả thuyết Nguồn gốc (Origin Hypothesis)',
                        'Phân tích các dấu vết địa chất, lịch sử hoặc DNA (nếu có) để dự đoán sự hình thành của thực thể.'),
                    card(false, '#3b82f6', 'Sinh lý học Chuyên sâu (Advanced Physiology)',
                        'Cấu trúc tế bào, hệ thống tuần hoàn, khả năng tái tạo mô và các phản ứng hóa học nội sinh đặc thù.'),
                    card(false, '#3b82f6', 'Tâm lý học Thực thể (Psychological Profile)',
                        'Phân tích xem thực thể có cảm xúc, nỗi sợ, hay sự thù hận hay không. Có khả năng giao tiếp không?'),
                    card(false, '#3b82f6', 'Điểm yếu & Khắc chế (Vulnerabilities)',
                        'Các tác nhân môi trường (nhiệt độ, độ ẩm, âm tần) hoặc hóa chất có thể làm suy yếu thực thể.'),
                    card(false, '#3b82f6', 'Ghi chú Thực địa (Field Notes)',
                        'Các quan sát ngắn từ nhân viên kỹ thuật hoặc đặc vụ đã từng tiếp xúc trực tiếp.'),
                    card(false, '#3b82f6', 'Tình trạng Quản thúc (Containment Status)',
                        'Nếu thực thể đã được bắt giữ: mô tả buồng giam và các điều kiện duy trì đặc biệt.'),
                    card(false, '#3b82f6', 'Phân loại Nguy hiểm (Hazard Classification)',
                        'Đánh giá mức độ rủi ro dựa trên thang đo của M.A.P.L.E.<em>Ví dụ: Class-D, Class-X...</em>')
                ]) +
                /* Thử nghiệm */
                divider('NHẬT KÝ THỬ NGHIỆM', '#a78bfa') +
                sect('THỬ NGHIỆM', '#a78bfa', [
                    card(false, '#a78bfa', 'Bản Tường thuật Thử nghiệm (Experiment Narrative)',
                        '<strong style="color:#a78bfa">Mã số:</strong> Ví dụ: EXP-772-Alpha<br>' +
                        '<strong style="color:#a78bfa">Đối tượng:</strong> Nhân viên cấp thấp, động vật thí nghiệm, hoặc cảm biến tự động<br>' +
                        '<strong style="color:#a78bfa">Mục tiêu:</strong> Xác định phản ứng của đối tượng với [Biến số X]<br>' +
                        '<strong style="color:#a78bfa">Diễn biến:</strong> Mô tả từng bước từ lúc bắt đầu đến khi kết thúc<br>' +
                        '<strong style="color:#a78bfa">Kết quả:</strong> Thành công, thất bại, hoặc các hệ quả không mong đợi')
                ]) +
                testTable() +
                /* Đa phương tiện */
                sect('DỮ LIỆU ĐA PHƯƠNG TIỆN', '#a78bfa', [
                    card(false, '#a78bfa', 'Bản ghi âm / Lời thoại (Audio Logs)',
                        'Trích dẫn hội thoại giữa các nhà nghiên cứu. Mô tả tiếng động lạ: <em>[Tiếng rít tần số cao] &nbsp; [Tiếng cào vào kim loại]</em><br>Lời khai cuối cùng của Recovery Team.'),
                    card(false, '#a78bfa', 'Phụ lục Dữ liệu (Data Appendices)',
                        'Biểu đồ & chỉ số đo lường (phóng xạ, sóng não, nồng độ hóa chất).<br>Mô tả ảnh chụp lén, ảnh hồng ngoại, siêu âm.<br>Sơ đồ Phẫu thuật cho Entity đã chết hoặc Item đã tháo rời.')
                ]) +
                /* Ghi chú chuyên gia */
                sect('GHI CHÚ CHUYÊN GIA', '#a78bfa', [
                    card(false, '#a78bfa', 'Ghi chú của Trưởng dự án (Project Lead Note)',
                        'Cảnh báo về việc cắt giảm ngân sách nghiên cứu hoặc sự nguy hiểm tiềm tàng mà cấp trên đang che giấu.'),
                    card(false, '#a78bfa', 'Đề xuất Phân loại lại (Reclassification Proposal)',
                        'Ý kiến về việc nâng mức độ nguy hiểm hoặc thay đổi quy trình quản thúc dựa trên những khám phá mới nhất.')
                ]) +
                /* Tài liệu tham khảo */
                divider('TÀI LIỆU THAM KHẢO', '#34d399') +
                sect('TÀI LIỆU THAM KHẢO', '#34d399', [
                    card(false, '#34d399', 'Trích dẫn Cổ thư & Tài liệu Bị xóa',
                        'Danh sách cổ thư liên quan (nếu là thực thể tâm linh/ma thuật).<br>Các bài báo khoa học đã bị xóa khỏi cơ sở dữ liệu công cộng.'),
                    card(false, '#34d399', 'Cross-Reference (Liên kết Chéo)',
                        'Liên kết đến các hồ sơ thực thể khác có đặc điểm tương đồng.<em>Ví dụ: Xem thêm DB-441 — hành vi tương tự được ghi nhận tại Tầng 7.</em>'),
                    card(false, '#34d399', 'Định dạng Trích dẫn',
                        '<span style="color:#34d399">[M.A.P.L.E-REF-001]</span> &nbsp; Tên tài liệu. Năm. Tác giả/Nguồn.<br>' +
                        '<span style="color:#34d399">[REDACTED-SCI-2019]</span> &nbsp; Tên bài báo. Đã bị xóa khỏi arXiv vào 03/2019.')
                ]) +
                '<div class="hdv-callout" style="margin-top:12px">' +
                '<span class="hdv-callout-icon">⚠</span>' +
                '<p class="hdv-callout-text">Tài liệu tham khảo phải được xác minh bởi ít nhất <strong style="color:#34d399">hai nguồn độc lập</strong>. Nguồn đơn lẻ ghi chú <strong style="color:#34d399">[UNVERIFIED]</strong>.</p>' +
                '</div>'
        },

        /* ══ ITEM ══ */
        item: {
            accent: '#f59e0b',
            html:
                sect('BẮT BUỘC', '#f59e0b', [
                    card(true, '#f59e0b', 'Cấu tạo & Nguyên lý Hoạt động',
                        'Giải thích cách vật phẩm hoạt động về mặt vật lý/hóa học. Các thành phần chính tạo nên vật phẩm.'),
                    card(true, '#f59e0b', 'Phổ Tác động (Effect Spectrum)',
                        '<strong style="color:#f59e0b">Tác động Chính:</strong> Công dụng mong muốn khi sử dụng.<br>' +
                        '<strong style="color:#71717a">Tác động Phụ/Hệ lụy:</strong> Các biến chứng sinh lý, tâm lý hoặc hỏng hóc thiết bị có thể xảy ra.'),
                    card(true, '#f59e0b', 'Quy trình Sử dụng Tiêu chuẩn (SOP)',
                        'Các bước kích hoạt, bảo quản và xử lý sau khi sử dụng.')
                ]) +
                sect('MỞ RỘNG — KHÔNG BẮT BUỘC', '#27272a', [
                    card(false, '#f59e0b', 'Độc tính & Giới hạn Chịu đựng',
                        'Liều lượng tối đa có thể sử dụng trước khi gây tử vong hoặc tổn thương vĩnh viễn.'),
                    card(false, '#f59e0b', 'Phân tích Vật liệu Chuyên sâu',
                        'Các nguyên tố hiếm, hợp kim lạ hoặc các hợp chất hữu cơ không có trong bảng tuần hoàn.'),
                    card(false, '#f59e0b', 'Lịch sử Thu thập (Recovery Log)',
                        'Hoàn cảnh và địa điểm tổ chức M.A.P.L.E đã tìm thấy vật phẩm này.'),
                    card(false, '#f59e0b', 'Khả năng Tương thích (Compatibility)',
                        'Vật phẩm này có thể kết hợp với các vật phẩm khác để tạo ra hiệu ứng cộng hưởng hay không?'),
                    card(false, '#f59e0b', 'Bảo trì & Lưu trữ (Storage Requirements)',
                        'Các điều kiện môi trường nghiêm ngặt (áp suất, bức xạ, nhiệt độ âm) để vật phẩm không bị biến chất.'),
                    card(false, '#f59e0b', 'Dự báo Sản xuất (Manufacturing Outlook)',
                        'Khả năng tái tạo, sản xuất hàng loạt hoặc tính độc bản của vật phẩm.')
                ]) +
                /* Thử nghiệm */
                divider('NHẬT KÝ THỬ NGHIỆM', '#a78bfa') +
                sect('THỬ NGHIỆM', '#a78bfa', [
                    card(false, '#a78bfa', 'Bản Tường thuật Thử nghiệm (Experiment Narrative)',
                        '<strong style="color:#a78bfa">Mã số:</strong> Ví dụ: EXP-I001-Beta<br>' +
                        '<strong style="color:#a78bfa">Đối tượng thử nghiệm:</strong> Cảm biến môi trường, thiết bị đo lường<br>' +
                        '<strong style="color:#a78bfa">Mục tiêu:</strong> Xác định giới hạn tác động của vật phẩm với [Biến số X]<br>' +
                        '<strong style="color:#a78bfa">Diễn biến:</strong> Mô tả từng bước từ lúc kích hoạt đến khi kết thúc<br>' +
                        '<strong style="color:#a78bfa">Kết quả:</strong> Thành công, thất bại, hoặc các hệ quả không mong đợi')
                ]) +
                testTable() +
                sect('DỮ LIỆU ĐA PHƯƠNG TIỆN', '#a78bfa', [
                    card(false, '#a78bfa', 'Bản ghi âm / Lời thoại (Audio Logs)',
                        'Ghi chép phản ứng của người dùng trong quá trình thử nghiệm.<br>Các âm thanh bất thường phát ra từ vật phẩm khi hoạt động.'),
                    card(false, '#a78bfa', 'Phụ lục Dữ liệu (Data Appendices)',
                        'Biểu đồ hiệu suất, đồ thị tác động theo thời gian.<br>Ảnh chụp cận cảnh cấu trúc vật liệu, ảnh X-quang.<br>Sơ đồ tháo rời và các thành phần bên trong.')
                ]) +
                sect('GHI CHÚ CHUYÊN GIA', '#a78bfa', [
                    card(false, '#a78bfa', 'Ghi chú của Trưởng dự án (Project Lead Note)',
                        'Nhận xét về tiềm năng ứng dụng hoặc mức độ nguy hiểm thực tế so với báo cáo ban đầu.'),
                    card(false, '#a78bfa', 'Đề xuất Phân loại lại (Reclassification Proposal)',
                        'Ý kiến điều chỉnh mức độ kiểm soát hoặc quy trình bảo quản dựa trên kết quả thử nghiệm mới nhất.')
                ]) +
                divider('TÀI LIỆU THAM KHẢO', '#34d399') +
                sect('TÀI LIỆU THAM KHẢO', '#34d399', [
                    card(false, '#34d399', 'Tài liệu Kỹ thuật & Nghiên cứu Liên quan',
                        'Các báo cáo kỹ thuật, bằng sáng chế, hoặc công trình nghiên cứu có liên quan đến nguyên lý hoạt động của vật phẩm.'),
                    card(false, '#34d399', 'Cross-Reference (Liên kết Chéo)',
                        'Liên kết đến các vật phẩm khác có tính năng tương tự hoặc có thể tương thích.<em>Ví dụ: Xem thêm I-014 — cùng cơ chế năng lượng.</em>'),
                    card(false, '#34d399', 'Định dạng Trích dẫn',
                        '<span style="color:#34d399">[M.A.P.L.E-REF-001]</span> &nbsp; Tên tài liệu. Năm. Tác giả/Nguồn.<br>' +
                        '<span style="color:#34d399">[CLASSIFIED-TECH-2021]</span> &nbsp; Tên báo cáo. Phân loại: Mật.')
                ]) +
                '<div class="hdv-callout" style="margin-top:12px">' +
                '<span class="hdv-callout-icon">⚠</span>' +
                '<p class="hdv-callout-text">Tài liệu tham khảo phải được xác minh bởi ít nhất <strong style="color:#34d399">hai nguồn độc lập</strong>. Nguồn đơn lẻ ghi chú <strong style="color:#34d399">[UNVERIFIED]</strong>.</p>' +
                '</div>'
        },

        /* ══ DIARY ══ */
        diary: {
            accent: '#f43f5e',
            html:
                '<div class="hdv-section">' +
                '<div class="hdv-section-head">' +
                '<span class="hdv-section-badge" style="color:#f43f5e;border-color:#f43f5e">DIARY</span>' +
                '<span class="hdv-section-title">Nhật ký / Ghi chép cá nhân</span>' +
                '<div class="hdv-section-line"></div>' +
                '</div>' +
                '<div class="hdv-cards">' +
                '<div class="hdv-card hdv-card-required" style="--card-color:#f43f5e">' +
                '<div class="hdv-card-header">' +
                '<span class="hdv-card-name">Không có cấu trúc bắt buộc</span>' +
                '<span class="hdv-card-tag hdv-tag-req" style="background:rgba(244,63,94,0.1);color:#f43f5e;border-color:rgba(244,63,94,0.2)">TỰ DO</span>' +
                '</div>' +
                '<p class="hdv-card-desc">Thân bài là một đoạn văn kể chuyện hoặc các dòng ghi chép rời rạc theo mốc thời gian. Không có quy tắc định dạng cứng nhắc — đây là không gian viết sáng tạo.</p>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '<div class="hdv-callout" style="margin-top:28px">' +
                '<span class="hdv-callout-icon">📋</span>' +
                '<p class="hdv-callout-text">Gợi ý mở đầu: <strong style="color:#f43f5e">"Ngày... tháng... năm..."</strong> &nbsp;|&nbsp; <strong style="color:#f43f5e">"Tôi nghe thấy tiếng động ở tầng trên..."</strong> &nbsp;|&nbsp; <strong style="color:#f43f5e">"Cái thứ đó không giống như những gì báo cáo mô tả..."</strong></p>' +
                '</div>' +
                '<div class="hdv-diary-block">' +
                '<span class="hdv-diary-date">// VÍ DỤ MINH HỌA</span>' +
                'Ngày 14 tháng 3.<br>' +
                'Chúng tôi đã hạ trại ở tầng 4 được hai ngày. Không khí ở đây đặc hơn tôi tưởng — không phải vì bụi, mà là thứ gì đó khác. Nặng nề hơn.<br><br>' +
                'Đêm qua Reyes không ngủ được. Cô ấy nói cô ấy nghe thấy tiếng gõ nhịp từ phía sau tường bê tông. Ba lần gõ, rồi im. Ba lần nữa.<br><br>' +
                'Tôi không dám ghi vào báo cáo chính thức.' +
                '</div>'
        }
    };

    /* ── Build HTML ── */
    var tabBtns = TABS.map(function (t) {
        return '<button class="hdv-tab-btn' + (t.id === 'entity' ? ' active' : '') +
            '" data-tab="' + t.id + '" style="--tab-color:' + t.color + '">' + t.label + '</button>';
    }).join('');

    var panelHtml = TABS.map(function (t) {
        var p = PANELS[t.id];
        return '<div class="hdv-panel' + (t.id === 'entity' ? ' active' : '') +
            '" id="hdv-panel-' + t.id + '" style="--panel-accent:' + p.accent + '">' +
            p.html + '</div>';
    }).join('');

    target.innerHTML =
        '<div id="hdv-root">' +

        '<div class="hdv-hero">' +
        '<div class="hdv-hero-eyebrow">M.A.P.L.E ARCHIVE // DOCUMENTATION STANDARD v2.4</div>' +
        '<h1>Hướng Dẫn Viết Bài</h1>' +
        '<p class="hdv-hero-sub">Cấu trúc chuẩn cho các báo cáo khoa học M.A.P.L.E. Chọn loại tài liệu bên dưới để xem hướng dẫn chi tiết.</p>' +
        '</div>' +

        '<div class="hdv-tabs-wrap">' +
        '<div class="hdv-tabs-bar">' + tabBtns + '</div>' +
        '</div>' +

        '<div class="hdv-panels">' + panelHtml + '</div>' +

        '<div class="hdv-footer">' +
        '<span>M.A.P.L.E DOCUMENTATION SYSTEM // v2.4.0</span>' +
        '<a href="/wiki/Trang_Ch%C3%ADnh">← Quay về Trang Chủ</a>' +
        '</div>' +

        '</div>';

    /* ── Tab switching ── */
    document.querySelectorAll('.hdv-tab-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var id = btn.getAttribute('data-tab');
            document.querySelectorAll('.hdv-tab-btn').forEach(function (b) { b.classList.remove('active'); });
            document.querySelectorAll('.hdv-panel').forEach(function (p) { p.classList.remove('active'); });
            btn.classList.add('active');
            var panel = document.getElementById('hdv-panel-' + id);
            if (panel) panel.classList.add('active');
        });
    });

    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();