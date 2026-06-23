/* ============================================
   M.A.P.L.E — MediaWiki:MAPLE-ViewAccess.js
   Màn hình từ chối quyền XEM trang (403 / 401)
   Yêu cầu: MAPLE-Core.js đã load trước
   CSS: dùng chung MAPLE-NoAccess.css
   ============================================ */

(function () {
    'use strict';

    var wgPageName = mw.config.get('wgPageName') || '';
    var pageName   = wgPageName.replace(/_/g, ' ');
    var homeURL    = '/wiki/Trang_Ch%C3%ADnh';
    var isLoggedIn = mw.config.get('wgUserId') !== 0;

    var helpPageURL = mw.util.getUrl('Trợ_giúp:Không_thể_xem_trang');

    /* ── Nội dung thay đổi theo trạng thái đăng nhập ── */
    var errCode, statusLabel, titleText, descText, extraBtn, metaRows;

    if (!isLoggedIn) {
        errCode     = 'ERR :: 401_LOGIN_REQUIRED';
        statusLabel = 'AUTHENTICATION REQUIRED';
        titleText   = 'YÊU CẦU ĐĂNG NHẬP ĐỂ TIẾP TỤC';
        descText    = 'Nội dung <strong>"' + pageName + '"</strong> yêu cầu xác thực danh tính.<br>'
                    + 'Vui lòng đăng nhập bằng tài khoản Miraheze để truy cập.<br>'
                    + 'Chưa có tài khoản? <a href="/wiki/Special:CreateAccount">Đăng ký miễn phí</a>.';
        extraBtn    = '<a href="/wiki/Special:UserLogin" class="maple-noaccess-btn maple-noaccess-btn--login">⚿ ĐĂNG NHẬP</a>';
        metaRows    = [
            { label: 'OPERATION',  value: 'READ' },
            { label: 'STATUS',     value: 'UNAUTHENTICATED' },
            { label: 'CLEARANCE',  value: 'NONE' },
            { label: 'ACTION',     value: 'LOGIN REQUIRED' },
        ];
    } else {
        errCode     = 'ERR :: 403_READ_DENIED';
        statusLabel = 'READ ACCESS DENIED';
        titleText   = 'BẠN KHÔNG CÓ QUYỀN XEM TRANG NÀY';
        descText    = 'Hồ sơ <strong>"' + pageName + '"</strong> được phân loại ở cấp độ cao.<br>'
                    + 'Tài khoản hiện tại không đủ thẩm quyền để truy cập nội dung này.<br>'
                    + 'Nếu bạn cho rằng đây là nhầm lẫn, hãy liên hệ quản trị viên.';
        extraBtn    = '';
        metaRows    = [
            { label: 'OPERATION',  value: 'READ' },
            { label: 'STATUS',     value: 'FORBIDDEN' },
            { label: 'CLEARANCE',  value: 'INSUFFICIENT' },
            { label: 'ACTION',     value: 'CONTACT ADMIN' },
        ];
    }

    function buildMeta(rows) {
        return '<div class="mna-meta-panel">' +
            rows.map(function (r) {
                return '<div class="mna-meta-row">' +
                    '<span class="mna-meta-label">' + r.label + '</span>' +
                    '<span class="mna-meta-sep">//</span>' +
                    '<span class="mna-meta-value">' + r.value + '</span>' +
                    '</div>';
            }).join('') +
        '</div>';
    }

    MAPLE.activateUI();
    var root = MAPLE.createRoot();

    root.innerHTML =
        '<div class="maple-shell">' +

        MAPLE.buildHeader({
            title:      'TRUY CẬP BỊ TỪ CHỐI',
            sub:        pageName,
            badgeText:  'CLEARANCE: KHÔNG ĐỦ',
            badgeClass: 'maple-badge--danger'
        }) +

        /* Thêm class mna-view để CSS override tooltip label */
        '<div class="maple-noaccess-body mna-view">' +

        /* Sọc cảnh báo */
        '<div class="mna-warning-stripe"></div>' +

        /* Icon ổ khóa — biến thể "mắt bị chặn" cho view */
        '<div class="maple-noaccess-icon-wrap">' +
        '<svg class="maple-noaccess-icon" width="72" height="72" viewBox="0 0 100 100" fill="none">' +
        '<rect x="20" y="43" width="60" height="44" rx="4" stroke="#ef4444" stroke-width="1.8" fill="rgba(239,68,68,0.03)"/>' +
        '<path d="M33 43V30C33 16 67 16 67 30V43" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round"/>' +
        '<circle cx="50" cy="61" r="5.5" fill="#ef4444"/>' +
        '<path d="M47.5 66.5L47.5 76.5" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M52.5 66.5L52.5 76.5" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>' +
        '<line x1="18" y1="18" x2="82" y2="82" stroke="#7f1d1d" stroke-width="1" stroke-linecap="round" opacity="0.25"/>' +
        '</svg>' +

        '<div class="maple-noaccess-help-wrap">' +
        '<a href="' + helpPageURL + '" class="maple-noaccess-help-btn" title="Tại sao tôi không thể xem trang này?">?</a>' +
        '<div class="maple-noaccess-tooltip">' +
        'Trang bị giới hạn quyền đọc hoặc tài khoản chưa đủ điều kiện. ' +
        'Nhấn để xem giải thích chi tiết và cách yêu cầu quyền truy cập.' +
        '</div>' +
        '</div>' +
        '</div>' + /* .maple-noaccess-icon-wrap */

        /* Status row */
        '<div class="mna-status-row">' +
        '<span class="mna-status-dot"></span>' +
        '<span class="mna-status-label">' + statusLabel + '</span>' +
        '</div>' +

        /* Error code */
        '<div class="maple-noaccess-code" data-text="' + errCode + '">' + errCode + '</div>' +

        /* Tiêu đề */
        '<div class="maple-noaccess-title">' + titleText + '</div>' +

        /* Divider với điểm kim cương */
        '<div class="maple-noaccess-divider"><div class="mna-divider-diamond"></div></div>' +

        /* Mô tả */
        '<div class="maple-noaccess-desc">' + descText + '</div>' +

        /* Meta panel */
        buildMeta(metaRows) +

        /* Buttons */
        '<div class="maple-noaccess-actions">' +
        '<a href="' + homeURL + '" class="maple-noaccess-btn maple-noaccess-btn--home">↩ VỀ TRANG CHỦ</a>' +
        extraBtn +
        '</div>' +

        '</div>' + /* .maple-noaccess-body */
        '</div>'; /* .maple-shell */

})();
