/**
 * M.A.P.L.E — MediaWiki:TroGiup-ChinhSua.js  (mhd3)
 * Trang Trợ_giúp:Chỉnh_sửa
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/Ch[iỉ]nh.*s[uử]a/i.test(decoded)) return;
    if (pn && pn !== 'Trợ_giúp:Chỉnh_sửa' && !/Ch[iỉ]nh.*s[uử]a/i.test(decoded)) return;

    function whenReady(cb) {
        if (window.MHHelp) return cb(window.MHHelp);
        if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(function (H) { if (H) cb(H); });
        var n = 0, t = setInterval(function () {
            if (window.MHHelp) { clearInterval(t); cb(window.MHHelp); }
            else if (++n > 40) clearInterval(t);
        }, 50);
    }

    function build() {
      whenReady(function (H) {
        H.mount(function (page) {
            page.appendChild(H.hero({
                crumb: 'Chỉnh Sửa Trang',
                eyebrow: 'Bắt đầu — Chỉnh sửa trang wiki',
                title: 'CHỈNH SỬA <em>TRANG</em>',
                sub: 'MAPLE-Editor, toolbar, lưu trang và quản lý lịch sử chỉnh sửa.'
            }));

            var s1 = H.section({ id: 'open', tag: '01 <em>//</em> Mở editor', heading: 'Mở Trình Soạn Thảo' });
            s1.appendChild(H.prose([
                'Có 3 cách mở trình soạn thảo: nhấn tab <strong>"Sửa đổi"</strong> ở đầu trang (chỉnh sửa toàn bộ), nhấn <strong>"[sửa đổi]"</strong> bên cạnh từng tiêu đề (chỉnh sửa một section), hoặc nhấn <strong>"Sửa đổi nguồn"</strong> để vào chế độ wikitext thô.',
                'M.A.P.L.E Wiki sử dụng <strong>MAPLE-Editor</strong> — trình soạn thảo tùy chỉnh có toolbar với các snippet template sẵn, thay thế trình soạn thảo mặc định của MediaWiki.'
            ]));
            page.appendChild(s1);

            var s2 = H.section({ id: 'toolbar', tag: '02 <em>//</em> Toolbar', heading: 'Thanh Công Cụ MAPLE-Editor' });
            s2.appendChild(H.prose('Toolbar hiển thị ở đầu trình soạn thảo. Các nút cơ bản:'));
            s2.appendChild(H.keys([
                ['B',    "In đậm → <code>'''văn bản'''</code>"],
                ['I',    "In nghiêng → <code>''văn bản''</code>"],
                ['==',   '→ <code>== Tiêu đề ==</code>'],
                ['🔗',   '→ <code>[[Tên trang|Hiển thị]]</code>'],
                ['📷',   '→ <code>[[Tập tin:tên.jpg|300px]]</code>'],
                ['{{ }}','Mở menu chọn template nhanh'],
            ]));
            s2.appendChild(H.prose('Menu template trong toolbar cho phép chèn nhanh: Dossier, Hồ Sơ Thực Thể, Hồ Sơ Nhật Ký, Hồ Sơ Vật Phẩm, Ảnh Bảo Mật, Phân Loại Nội Dung — đầy đủ tham số mặc định.'));
            page.appendChild(s2);

            var s3 = H.section({ id: 'save', tag: '03 <em>//</em> Lưu', heading: 'Lưu & Xem Trước' });
            s3.appendChild(H.prose('Trước khi lưu, điền tóm tắt chỉnh sửa vào ô "Tóm tắt" — ví dụ: "Tạo hồ sơ thực thể MA-E007", "Cập nhật mô tả section hành vi", "Sửa lỗi chính tả". Sau đó nhấn "Lưu trang".'));
            s3.appendChild(H.infobox('<strong>Luôn xem trước:</strong> nhấn "Xem trước" để kiểm tra template render đúng trước khi lưu — lỗi tham số chỉ hiển thị khi render thực tế.'));
            s3.appendChild(H.infobox('<strong>Xem trước bắt buộc:</strong> với template Dossier và RecordCard, xem trước trước khi lưu để đảm bảo tham số không bị lỗi format.', true));
            page.appendChild(s3);

            var s4 = H.section({ id: 'history', tag: '04 <em>//</em> Lịch sử', heading: 'Lịch Sử Chỉnh Sửa' });
            s4.appendChild(H.prose('Mọi thay đổi đều được lưu vào lịch sử. Nhấn tab "Lịch sử" để xem danh sách, so sánh hai phiên bản, hoặc khôi phục về phiên bản cũ hơn nếu cần.'));
            s4.appendChild(H.infobox('<strong>Không mất dữ liệu:</strong> ngay cả khi lỡ xóa nội dung, admin vẫn có thể khôi phục từ lịch sử. Liên hệ admin nếu cần.'));
            page.appendChild(s4);

            var s5 = H.section({ id: 'draft', tag: '05 <em>//</em> Nháp', heading: 'Trang Nháp' });
            s5.appendChild(H.prose('Nếu chưa muốn đăng công khai, lưu bài tại Người_dùng:[Tên]/Nháp_[Tên bài]. Khi hoàn chỉnh, chuyển nội dung sang trang chính thức hoặc lưu vào Chờ_Duyệt để admin xem xét.'));
            page.appendChild(s5);
        });
      });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
