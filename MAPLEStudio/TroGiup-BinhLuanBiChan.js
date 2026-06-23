/**
 * M.A.P.L.E — MediaWiki:TroGiup-BinhLuanBiChan.js (mhd3)
 * Trang Trợ_giúp:Bình_luận_chờ_duyệt
 */
(function () {
    'use strict';
    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/B[iì]nh.*[Ll]u[aậ]n/i.test(decoded)) return;

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
                crumb: 'Tương tác',
                eyebrow: 'Trợ giúp Cộng đồng',
                title: 'BÌNH LUẬN <em>BỊ CHẶN</em>',
                sub: 'Bạn gửi bình luận nhưng không xuất hiện ngay hoặc bị chặn? Dưới đây là nguyên nhân và cách xử lý chi tiết.'
            }));

            var s1 = H.section({ id: 'why', tag: '01', heading: 'Tại sao bình luận bị chặn?' });
            s1.appendChild(H.prose('Hệ thống kiểm duyệt tự động (Auto-Mod) của wiki sẽ chặn hoặc đưa bình luận vào hàng chờ nếu:'));
            var ul = document.createElement('ul');
            ul.innerHTML = '<li>Chứa từ ngữ xúc phạm / phân biệt / ấu dâm / cổ xuý tự sát hoặc vi phạm pháp luật.</li><li>Chứa link tới các trang web độc hại, dark web.</li><li>Chứa từ khóa spam (vd: quảng cáo mua bán, lửa tây ba lô).</li><li>Tài khoản của bạn quá mới hoặc uy tín thấp.</li>';
            s1.appendChild(ul);
            page.appendChild(s1);

            var s2 = H.section({ id: 'causes', tag: '02', heading: 'Các nguyên nhân chính & Giải pháp' });
            var diag = document.createElement('div');
            diag.className = 'mhd3-prose';
            diag.innerHTML = [
                '<h4>1. Tài khoản mới (dưới 7 ngày) hoặc Uy tín thấp (RP < 50)</h4>',
                '<p>Wiki áp dụng hàng rào chống bot. Tài khoản mới sẽ bị đưa bình luận vào hàng chờ duyệt (mất 1-3 ngày).</p>',
                '<p><strong>Cách giải quyết:</strong> Tăng Điểm Uy Tín (RP) bằng cách: Xác thực email (+15 RP), hoàn thiện profile (+10 RP), hoặc đọc bài, vote bài thường xuyên. Đạt mốc 50 RP, bình luận sẽ hiển thị ngay.</p>',
                '<h4>2. Email chưa xác thực</h4>',
                '<p>Bạn chưa xác nhận địa chỉ email nên hệ thống chặn tương tác.</p>',
                '<p><strong>Cách giải quyết:</strong> Vào <em>Cài đặt</em> -> Mục Email -> Nhấn <em>Gửi email xác thực</em>. Check hộp thư và click link xác nhận.</p>',
                '<h4>3. Chứa Liên Kết Ngoài (Link)</h4>',
                '<p>Hệ thống tự động chặn link bên ngoài để chống spam phishing. Thông báo: <code>[Comment - pending: external link]</code>.</p>',
                '<p><strong>Cách giải quyết:</strong> Xóa link khỏi bình luận. Nếu cần trỏ đến trang trong wiki, dùng cú pháp <code>[[Tên_Trang]]</code>. Nếu thực sự cần gửi link ngoài, hãy dùng MAPLE Chat.</p>',
                '<h4>4. Chứa Từ Khóa Spam / Vi Phạm</h4>',
                '<p>Hệ thống bắt gặp ngôn từ độc hại hoặc spam quảng cáo.</p>',
                '<p><strong>Cách giải quyết:</strong> Sửa lại từ ngữ cho lịch sự, tránh dùng các từ nhạy cảm. Bộ lọc từ ngữ V2.0 đặc biệt gắt gao với các tài khoản khai báo dưới 18 tuổi.</p>'
            ].join('');
            s2.appendChild(diag);
            page.appendChild(s2);

            var s3 = H.section({ id: 'check', tag: '03', heading: 'Kiểm tra trạng thái bình luận' });
            s3.appendChild(H.steps([
                { main: 'Mở trang bạn vừa bình luận.' },
                { main: 'Chuyển sang tab <strong>History</strong> (Lịch sử chỉnh sửa).' },
                { main: 'Tìm entry của bạn:', sub: '❌ <em>[Comment - pending review]</em> = đang chờ<br>✅ <em>[Comment - approved]</em> = đã duyệt<br>❌ <em>[Comment - declined]</em> = bị từ chối' }
            ]));
            page.appendChild(s3);
        });
      });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
    else build();
})();