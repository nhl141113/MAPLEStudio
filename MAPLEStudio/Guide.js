(function () {
    function init() {

    var root = document.getElementById("mw-content-text");
    if (!root) return;

    // inject layout
    root.innerHTML = `
    <div class="maple-ui">

        <div class="top-line"></div>

        <h1 class="title">HỆ THỐNG TẠM NGƯNG</h1>

        <div class="meta">
            PROTOCOL: OFFLINE // STATUS: UPDATING
        </div>

        <div class="quote">
            "Xin lỗi, hệ thống hiện đang được cập nhật."
        </div>

        <div class="section">
            <div class="label">THÔNG BÁO</div>
            <p>Toàn bộ nội dung đang được chỉnh sửa và nâng cấp.</p>
            <p>Vui lòng quay lại sau.</p>
        </div>

        <div class="section">
            <div class="label">TRẠNG THÁI</div>
            <p>Hệ thống đang bảo trì.</p>
        </div>

    </div>
    `;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();