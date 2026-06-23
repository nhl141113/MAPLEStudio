/**
 * M.A.P.L.E — MediaWiki:TroGiup-QuyTac.js  (mhd3)
 * Trang Trợ_giúp:Quy_tắc
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/Quy.*t[aắ]c/i.test(decoded)) return;
    if (pn && pn !== 'Trợ_giúp:Quy_tắc' && !/Quy.*t[aắ]c/i.test(decoded)) return;

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
                crumb: 'Quy Tắc',
                eyebrow: 'Cộng đồng — Quy tắc & điều khoản',
                title: 'QUY <em>TẮC</em>',
                sub: 'Điều khoản nội dung v3.0 — tóm tắt và liên kết đến bản đầy đủ.'
            }));

            var s0 = H.section({ id: 'd0', tag: 'Điều 0 <em>//</em> Tôn trọng', heading: 'Đừng Làm Kẻ Khốn Nạn' });
            s0.appendChild(H.prose('Luật tối cao. Tôn trọng là nền tảng của cộng đồng. Mọi hành vi toxic, tỏ thái độ "thượng đẳng", công kích cá nhân, hoặc phân biệt vùng miền / chủng tộc / giới tính đều sẽ bị xử lý nghiêm theo Điều 5.'));
            s0.appendChild(H.infobox('<strong>Muốn được respect?</strong> Respect người khác trước.', true));
            page.appendChild(s0);

            var s1 = H.section({ id: 'd1', tag: 'Điều 1 <em>//</em> Chất lượng', heading: 'Chất Lượng Sáng Tạo' });
            s1.appendChild(H.prose([
                'Bài viết phải do chính bạn sáng tác. Cấm sao chép từ SCP Foundation, Backrooms Wiki, hay bất kỳ nguồn nào (≥50% nội dung từ nguồn ngoài = vi phạm đạo văn).',
                'Không dùng AI để viết toàn bộ bài (≥60% nội dung do AI sinh = vi phạm). Được phép dùng AI để sửa lỗi chính tả, tạo ảnh minh họa, viết code CSS/JS.',
                'Không tự ý thay đổi những thiết lập cốt lõi của thế giới. Nếu có ý tưởng mới, liên hệ BQT trao đổi trước.'
            ]));
            page.appendChild(s1);

            var s2 = H.section({ id: 'd2', tag: 'Điều 2 <em>//</em> Phân loại', heading: 'Phân Loại Nội Dung' });
            s2.appendChild(H.syntax([
                ['13+', 'Bạo lực nhẹ, không tình dục, ngôn từ phù hợp'],
                ['16+', 'Bạo lực trung bình, yếu tố kinh dị / trưởng thành nhẹ'],
                ['18+', 'Bạo lực mạnh, tình dục, trauma nặng, self-harm reference'],
            ]));
            s2.appendChild(H.infobox('<strong>Gore phải có mục đích:</strong> mô tả chi tiết chỉ để "sốc" mà không liên quan cốt truyện = bị xóa. Bài có gore bắt buộc rating 18+.'));
            page.appendChild(s2);

            var s3 = H.section({ id: 'd3', tag: 'Điều 3 <em>//</em> Ranh giới', heading: 'Ranh Giới Pháp Lý & An Toàn' });
            s3.appendChild(H.infobox('<strong>Không chính trị / tôn giáo thực:</strong> cổ xúy quan điểm chính trị / tôn giáo thực tế = vi phạm.', true));
            s3.appendChild(H.infobox('<strong>Không cổ xúy tội ác thực:</strong> hướng dẫn hành động gây hại ngoài đời thực = TERMINATION ngay.', true));
            s3.appendChild(H.infobox('<strong>Tuyệt đối cấm nội dung xâm hại trẻ em:</strong> vi phạm = TERMINATION ngay + báo cáo cơ quan có thẩm quyền.', true));
            page.appendChild(s3);

            var s5 = H.section({ id: 'd5', tag: 'Điều 5 <em>//</em> Hình phạt', heading: 'Hệ Thống Hình Phạt (3 Strike)' });
            s5.appendChild(H.steps([
                { main: '<strong>Strike 1 — Warning</strong>', sub: 'Cảnh cáo, đình chỉ đăng bài 3 ngày. Bài vi phạm bị ẩn để sửa lại.' },
                { main: '<strong>Strike 2 — Isolation</strong>', sub: 'Cấm toàn bộ hoạt động trên Wiki 14 ngày. Bài cũ vẫn hiển thị.' },
                { main: '<strong>Strike 3 — Termination</strong>', sub: 'Trục xuất vĩnh viễn + Blacklist. Không thể quay lại trừ lý do đặc biệt được BQT xét duyệt.' },
            ]));
            s5.appendChild(H.infobox('<strong>Kháng cáo:</strong> nhắn BQT trong vòng 7 ngày. Kháng cáo spam vô lý → cộng thêm 1 Strike.'));
            page.appendChild(s5);

            var sfull = H.section({ id: 'full', tag: 'Tham khảo <em>//</em> Đầy đủ', heading: 'Bản Điều Khoản Đầy Đủ' });
            sfull.appendChild(H.prose('Trang này chỉ là tóm tắt nhanh. Đọc toàn bộ điều khoản (bao gồm Điều 4 về bản quyền, Điều 6 về quyền hạn BQT, và các ghi chú pháp lý) tại bản đầy đủ.'));
            var fb = H.btns();
            fb.appendChild(H.btn('/wiki/Project:Điều_Khoản', '→ Xem bản đầy đủ', true));
            sfull.appendChild(fb);
            page.appendChild(sfull);
        });
      });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
