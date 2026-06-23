/**
 * M.A.P.L.E — MediaWiki:TroGiup-CheKy.js  (mhd3)
 * Trang Trợ_giúp:Che_Chữ
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/Che.*Ch[uữ]/i.test(decoded)) return;
    if (pn && pn !== 'Trợ_giúp:Che_Chữ' && !/Che.*Ch[uữ]/i.test(decoded)) return;

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
                crumb: 'Che Chữ & Che Từ',
                eyebrow: 'Bản mẫu — Che thông tin mật',
                title: 'CHE <em>CHỮ</em> & CHE TỪ',
                sub: 'maple-classified và maple-redacted — che khối nội dung và từng từ bị kiểm duyệt.'
            }));

            var s1 = H.section({ id: 'classified', tag: '01 <em>//</em> Khối', heading: 'maple-classified — Che Khối Nội Dung' });
            s1.appendChild(H.prose('Dùng để che toàn bộ một đoạn văn bản, bảng, hoặc khối nội dung. Người đọc thấy một hộp đen với nhãn "CLASSIFIED" và cần click (hoặc có quyền) để xem nội dung bên trong.'));
            s1.appendChild(H.code('Cú pháp cơ bản',
                '<div class="maple-classified"\n     data-clearance="3"\n     data-ref="DOC-7731"\n     data-label="THÔNG TIN MẬT ĐỘ CAO">\n  Nội dung bị che — chỉ hiển thị sau khi giải mã.\n  Có thể chứa wikitext, bảng, hoặc nhiều đoạn văn.\n</div>'));
            s1.appendChild(H.params([
                ['class', 'bắt buộc', '"maple-classified" — kích hoạt component'],
                ['data-clearance', 'số', 'Cấp độ clearance cần thiết để xem (1–5). Mặc định: 1'],
                ['data-ref', 'chuỗi', 'Mã tham chiếu tài liệu hiển thị trên hộp che (tùy chọn)'],
                ['data-label', 'chuỗi', 'Nhãn tùy chỉnh thay "CLASSIFIED" (tùy chọn)'],
            ]));
            s1.appendChild(H.infobox('<strong>Không bắt buộc đăng nhập:</strong> maple-classified chỉ che nội dung trực quan — ai cũng có thể click để xem. Dùng để tạo cảm giác "tài liệu mật" trong lore, không phải bảo mật thực sự.'));
            page.appendChild(s1);

            var s2 = H.section({ id: 'redacted', tag: '02 <em>//</em> Từ', heading: 'maple-redacted — Che Từng Từ' });
            s2.appendChild(H.prose('Dùng để che một từ hoặc cụm từ ngắn inline trong văn bản. Hiển thị như thanh đen kiểu kiểm duyệt tài liệu — thường không thể click để xem (intentionally redacted).'));
            s2.appendChild(H.code('Cú pháp inline',
                'Thực thể này được quan sát tại <span class="maple-redacted">tên địa điểm</span>\ntrước khi biến mất vào <span class="maple-redacted">ngày tháng</span>.'));
            s2.appendChild(H.code('Với tooltip',
                '<span class="maple-redacted" data-reason="Thông tin bị xóa theo Điều 3.2">từ bị che</span>'));
            s2.appendChild(H.params([
                ['class', 'bắt buộc', '"maple-redacted" — kích hoạt kiểu che inline'],
                ['data-reason', 'chuỗi', 'Lý do bị kiểm duyệt — hiển thị khi hover (tùy chọn)'],
            ]));
            page.appendChild(s2);

            var s3 = H.section({ id: 'combined', tag: '03 <em>//</em> Kết hợp', heading: 'Kết Hợp Cả Hai' });
            s3.appendChild(H.prose('Có thể dùng cả hai trong cùng một đoạn — maple-classified bao ngoài, maple-redacted bên trong để tạo cảm giác tài liệu bị kiểm duyệt nhiều lớp:'));
            s3.appendChild(H.code('Ví dụ kết hợp',
                '<div class="maple-classified" data-ref="MA-CASE-0391" data-clearance="4">\n  Thực thể <span class="maple-redacted">tên thực thể</span> lần đầu được ghi nhận\n  bởi đặc vụ <span class="maple-redacted">tên đặc vụ</span> vào ngày\n  <span class="maple-redacted">ngày tháng năm</span>.\n\n  Hành vi: phản ứng với sóng âm tần số > 18kHz bằng cách\n  <span class="maple-redacted">hành vi bị xóa</span>.\n</div>'));
            s3.appendChild(H.infobox('<strong>Lưu ý thẩm mỹ:</strong> không nên redact quá nhiều từ trong 1 câu — làm mất tính đọc được. Chỉ che thông tin quan trọng đến lore (tên, ngày, địa điểm nhạy cảm).'));
            page.appendChild(s3);

            var s4 = H.section({ id: 'tips', tag: '04 <em>//</em> Lưu ý', heading: 'Lưu Ý Khi Sử Dụng' });
            s4.appendChild(H.infobox('<strong>Trong Dossier:</strong> khi dùng trong dossier-slot-data type="text", cả hai component đều hoạt động bình thường — Dossier.js không can thiệp vào nội dung text slot.'));
            s4.appendChild(H.infobox('<strong>Không dùng thay clearance thực:</strong> maple-classified không bảo vệ nội dung khỏi tìm kiếm hay view-source. Dùng thuần túy cho lore/thẩm mỹ.', true));
            s4.appendChild(H.infobox('<strong>Cache khi chỉnh sửa:</strong> nếu thêm maple-classified/redacted mà không thấy hiệu ứng, thử Ctrl+F5 — Classified.js và CSS cần được tải.'));
            page.appendChild(s4);
        });
      });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
