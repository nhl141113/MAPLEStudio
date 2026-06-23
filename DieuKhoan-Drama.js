/* ============================================
   M.A.P.L.E — MediaWiki:DieuKhoan-Drama.js
   Điều Khoản — Xử Lý Drama Ngoài Đời Thực
   Yêu cầu: TroGiup-Common.js (window.MHHelp) đã nạp trước.
   ============================================ */
(function () {
    'use strict';

    function withLogo(MH, heroEl) {
        var logo = (window.MAPLE && window.MAPLE.logoSVG) ? window.MAPLE.logoSVG(56) : '';
        heroEl.insertBefore(MH.el('div', 'mhd3-hero-logo', logo), heroEl.firstChild);
        return heroEl;
    }

    function build(MH) {
        MH.mount(function (page) {

            page.appendChild(withLogo(MH, MH.hero({
                crumb:   'Điều Khoản Drama',
                eyebrow: 'Drama Policy v1.0 — Có hiệu lực từ 2026-01-01',
                title:   'XỬ LÝ <em>DRAMA</em> NGOÀI ĐỜI',
                sub:     'Quy tắc khi xung đột cá nhân ngoài đời thực (hoặc nền tảng khác) ảnh hưởng đến môi trường Wiki M.A.P.L.E.'
            })));

            /* 01 — Nguyên tắc */
            var s1 = MH.section({ tag: '01 <em>//</em> Nguyên tắc', heading: 'Wiki là không gian sáng tạo — không phải sân chiến' });
            s1.appendChild(MH.infobox(
                'Wiki không giải quyết xung đột cá nhân ngoài đời. BQT không đứng về phía nào trong tranh cãi cá nhân. ' +
                'Mọi xung đột cần để lại ngoài cổng Wiki.'));
            s1.appendChild(MH.steps([
                { main: 'Không viết bài ám chỉ người mình ghét', sub: 'Nhân vật phản diện với tên/đặc điểm nhắm vào người thật = vi phạm.' },
                { main: 'Không dùng bình luận để tấn công gián tiếp', sub: 'Bình luận bêu xấu tác giả bài → bị xóa + cảnh báo.' },
                { main: 'Không kéo "phe" vào Wiki', sub: '"Mọi người vào downvote bài của X giúp tao" = coordinated harassment, xử lý nặng ngay.' },
                { main: 'Không dùng Chat tiếp tục cãi vã từ Discord', sub: 'MAPLE Chat chịu sự điều chỉnh của Điều Khoản Chat — ứng xử xấu từ nơi khác mang vào vẫn bị xử lý.' }
            ]));
            page.appendChild(s1);

            /* 02 — Hành vi bị cấm */
            var s2 = MH.section({ tag: '02 <em>//</em> Bị cấm', heading: 'Các hành vi bị cấm' });
            s2.appendChild(MH.steps([
                { main: 'Công kích gián tiếp qua nội dung', sub: 'Viết bài về "nhân vật phản diện" ám chỉ rõ ràng đến người thật → BQT yêu cầu chỉnh sửa hoặc xóa. Cố tình → trừ RP + cảnh báo.' },
                { main: 'Tập hợp "băng đảng" tấn công', sub: 'Phối hợp downvote/báo cáo ác ý nhắm vào 1 người → vi phạm nghiêm trọng, khóa ngay không cần 3 bước.' },
                { main: 'Đăng thông tin cá nhân để "ăn vạ"', sub: 'Screenshot cuộc trò chuyện riêng tư để bêu xấu = doxxing/privacy violation → xóa ngay + khóa nghiêm trọng.' },
                { main: 'Lạm dụng hệ thống báo cáo', sub: 'Báo cáo hàng loạt bài của người mình ghét (dù bài không vi phạm) → BQT điều tra người báo cáo, có thể trừ RP + cảnh báo.' },
                { main: 'Mạo danh gây thêm mâu thuẫn', sub: 'Tạo tài khoản giả với tên giống người khác → xử lý theo điều khoản clone + mạo danh.' }
            ]));
            page.appendChild(s2);

            /* 03 — BQT không can thiệp gì */
            var s3 = MH.section({ tag: '03 <em>//</em> Phạm vi BQT', heading: 'BQT không can thiệp vào đâu' });
            s3.appendChild(MH.prose([
                'BQT <strong>không</strong>: phán xét ai đúng ai sai trong drama ngoài Wiki · điều tra hành vi NGOÀI Wiki · ' +
                'đứng về phía ai dù họ là thành viên lâu năm · yêu cầu người khác "xin lỗi" ngoài đời.'
            ]));
            s3.appendChild(MH.infobox(
                'BQT <strong>chỉ xử lý khi</strong>: hành vi ảnh hưởng trực tiếp đến Wiki · có bằng chứng rõ ràng xảy ra TRONG Wiki · có khiếu nại chính thức kèm bằng chứng.'));
            page.appendChild(s3);

            /* 04 — Quy trình khi bị kéo vào */
            var s4 = MH.section({ tag: '04 <em>//</em> Quy trình', heading: 'Nếu bạn bị kéo vào drama' });
            s4.appendChild(MH.steps([
                { main: 'Không phản ứng công khai trên Wiki', sub: 'Không tranh cãi lại trong bình luận. Không tạo bài "đáp trả". Giữ bình tĩnh.' },
                { main: 'Báo cáo cho BQT kèm bằng chứng', sub: 'Screenshot bình luận/chat/bài viết + mô tả ngắn gọn tình huống. Gửi qua MAPLE Chat hoặc email.' },
                { main: 'BQT xem xét và xử lý', sub: 'BQT sẽ xóa nội dung vi phạm, cảnh báo/xử phạt người vi phạm, và thông báo kết quả cho bạn.' }
            ]));
            page.appendChild(s4);

            /* 05 — Tình huống đặc biệt */
            var s5 = MH.section({ tag: '05 <em>//</em> Khẩn cấp', heading: 'Tình huống đặc biệt' });
            s5.appendChild(MH.steps([
                { main: 'Bị đe dọa thân thể ngoài đời', sub: 'Email BQT ngay: mapleofficialvn@gmail.com. BQT sẽ xem xét khóa tài khoản người đó. Trường hợp nghiêm trọng → liên hệ cảnh sát. Wiki sẽ hợp tác cung cấp thông tin nếu cơ quan pháp luật yêu cầu.' },
                { main: 'Người dưới 18 tuổi bị quấy rối', sub: 'BQT ưu tiên xử lý trong 24 giờ. Khóa tài khoản người quấy rối ngay lập tức (chờ điều tra). Thông báo phụ huynh nếu cần.' },
                { main: 'Thành viên dùng Wiki để theo dõi', sub: 'Theo dõi lịch sử bài đăng để biết thói quen = doxxing kỹ thuật số → xử lý theo điều khoản doxxing.' }
            ]));
            page.appendChild(s5);

            /* FAQ */
            var sf = MH.section({ tag: '06 <em>//</em> FAQ', heading: 'Câu hỏi thường gặp' });
            sf.appendChild(MH.faq([
                { q: 'Ai đó đang viết bài ám chỉ tôi, phải làm gì?', a: 'Chụp màn hình bài/bình luận đó → gửi báo cáo cho BQT kèm bằng chứng. Không phản ứng công khai trên Wiki để tránh leo thang.' },
                { q: 'BQT có xử lý hành vi xấu trên Discord không?', a: 'Không. BQT chỉ có thẩm quyền trong phạm vi Wiki. Hành vi trên Discord/Facebook/ngoài đời = tự giải quyết hoặc báo cáo nền tảng đó.' },
                { q: 'Tôi bị oan, bài của tôi bị xóa vì "drama" nhưng tôi không vi phạm?', a: 'Gửi kháng cáo cho BQT trong 7 ngày kèm lý do + bằng chứng. BQT sẽ xem xét lại.' }
            ]));
            page.appendChild(sf);

            page.appendChild(MH.stuck({
                tag:  'Đang bị kéo vào drama trên Wiki?',
                text: 'Đừng phản ứng công khai. Báo cáo BQT ngay kèm bằng chứng để được xử lý nhanh nhất.'
            }));
        });
    }

    if (window.MHHelp) build(window.MHHelp);
    else if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(build);
})();
