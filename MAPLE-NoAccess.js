/* ============================================
   M.A.P.L.E — MediaWiki:MAPLE-NoAccess.js
   Màn hình từ chối quyền CHỈNH SỬA (403 / 401)
   Yêu cầu: MAPLE-Core.js đã load trước
   ============================================ */

(function () {
    'use strict';

    var wgPageName = mw.config.get('wgPageName') || '';
    var pageName   = wgPageName.replace(/_/g, ' ');
    var homeURL    = '/wiki/Trang_Ch%C3%ADnh';
    var isLoggedIn = mw.config.get('wgUserId') !== 0;

    var helpPageURL = mw.util.getUrl('Trợ_giúp:Không_thể_chỉnh_sửa_trang');

    /* ── Nội dung thay đổi theo trạng thái đăng nhập ── */
    var errCode, statusLabel, titleText, descText, extraBtn, metaRows;

    if (!isLoggedIn) {
        errCode     = 'ERR :: 401_LOGIN_REQUIRED';
        statusLabel = 'AUTHENTICATION REQUIRED';
        titleText   = 'YÊU CẦU ĐĂNG NHẬP ĐỂ CHỈNH SỬA';
        descText    = 'Tài liệu <strong>"' + pageName + '"</strong> yêu cầu xác thực danh tính.<br>'
                    + 'Vui lòng đăng nhập bằng tài khoản Miraheze để thực hiện thao tác ghi.<br>'
                    + 'Chưa có tài khoản? <a href="/wiki/Special:CreateAccount">Đăng ký miễn phí</a>.';
        extraBtn    = '<a href="/wiki/Special:UserLogin" class="maple-noaccess-btn maple-noaccess-btn--login">⚿ ĐĂNG NHẬP</a>';
        metaRows    = [
            { label: 'OPERATION',  value: 'WRITE' },
            { label: 'STATUS',     value: 'UNAUTHENTICATED' },
            { label: 'CLEARANCE',  value: 'NONE' },
            { label: 'ACTION',     value: 'LOGIN REQUIRED' },
        ];
    } else {
        errCode     = 'ERR :: 403_WRITE_DENIED';
        statusLabel = 'WRITE ACCESS DENIED';
        titleText   = 'BẠN KHÔNG CÓ QUYỀN CHỈNH SỬA TRANG NÀY';
        descText    = 'Hồ sơ <strong>"' + pageName + '"</strong> được bảo vệ ở cấp độ cao.<br>'
                    + 'Tài khoản hiện tại không đủ thẩm quyền thực hiện thao tác ghi.<br>'
                    + 'Nếu bạn cho rằng đây là nhầm lẫn, hãy liên hệ quản trị viên.';
        extraBtn    = '';
        metaRows    = [
            { label: 'OPERATION',  value: 'WRITE' },
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

        '<div class="maple-noaccess-body">' +

        /* Sọc cảnh báo */
        '<div class="mna-warning-stripe"></div>' +

        /* Icon ổ khóa + nút ? */
        '<div class="maple-noaccess-icon-wrap">' +
        '<svg class="maple-noaccess-icon" width="72" height="72" viewBox="0 0 100 100" fill="none">' +
        '<rect x="20" y="43" width="60" height="44" rx="4" stroke="#ef4444" stroke-width="1.8" fill="rgba(239,68,68,0.03)"/>' +
        '<path d="M33 43V30C33 16 67 16 67 30V43" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round"/>' +
        /* Keyhole */
        '<circle cx="50" cy="61" r="5.5" fill="#ef4444"/>' +
        '<path d="M47.5 66.5L47.5 76.5" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M52.5 66.5L52.5 76.5" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>' +
        /* Gạch chéo mờ */
        '<line x1="18" y1="18" x2="82" y2="82" stroke="#7f1d1d" stroke-width="1" stroke-linecap="round" opacity="0.25"/>' +
        '</svg>' +

        '<div class="maple-noaccess-help-wrap">' +
        '<a href="' + helpPageURL + '" class="maple-noaccess-help-btn" title="Tại sao tôi không thể chỉnh sửa trang này?">?</a>' +
        '<div class="maple-noaccess-tooltip">' +
        'Trang bị bảo vệ hoặc tài khoản chưa đủ điều kiện. ' +
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
