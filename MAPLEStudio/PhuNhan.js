/* ============================================
   M.A.P.L.E — MediaWiki:PhuNhan.js
   Trang Dự án:Phủ nhận chung (General Disclaimer)
   Yêu cầu: TroGiup-Common.js (window.MHHelp) đã nạp trước (Common.js lo).
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
                crumb:   'Phủ nhận chung',
                eyebrow: 'General Disclaimer — M.A.P.L.E Wiki',
                title:   'PHỦ NHẬN <em>CHUNG</em>',
                sub:     'Tất cả nội dung trên Wiki này là hư cấu hoàn toàn. Đọc kỹ trước khi sử dụng bất kỳ thông tin nào từ đây.'
            })));

            /* 01 — Hư cấu */
            var s1 = MH.section({ tag: '01 <em>//</em> Bản chất nội dung', heading: 'Tất cả là hư cấu' });
            s1.appendChild(MH.infobox(
                '<strong>M.A.P.L.E Wiki là một dự án sáng tác hợp tác (collaborative fiction).</strong> ' +
                'Mọi thực thể, vật phẩm, sự kiện, tổ chức, nhân vật và địa điểm được mô tả trên Wiki này — ' +
                'bao gồm cả "The Maze", tổ chức M.A.P.L.E và toàn bộ tài liệu nội bộ — đều là <strong>hư cấu hoàn toàn</strong>, ' +
                'không tồn tại trong thực tế.', true));
            s1.appendChild(MH.prose([
                'Wiki này được lấy cảm hứng từ thể loại creepypasta và collaborative worldbuilding. ' +
                'Phong cách trình bày dạng "hồ sơ mật" hay "tài liệu nội bộ" là yếu tố nghệ thuật của thể loại, ' +
                'không nhằm gây hiểu nhầm về tính xác thực.',
                'M.A.P.L.E không phải tổ chức thực tế, không có trụ sở, không tuyển dụng nhân sự thực, ' +
                'và không thực hiện bất kỳ hoạt động nào ngoài phạm vi Wiki sáng tác này.'
            ]));
            page.appendChild(s1);

            /* 02 — Không nên làm theo */
            var s2 = MH.section({ tag: '02 <em>//</em> Cảnh báo sử dụng', heading: 'Không áp dụng vào thực tế' });
            s2.appendChild(MH.prose([
                'Các "giao thức an toàn", "thủ tục sinh tồn" hay "hướng dẫn xử lý thực thể" trên Wiki này ' +
                'là nội dung hư cấu phục vụ mục đích kể chuyện. <strong>Không thực hiện bất kỳ hành động nào dựa trên các tài liệu này.</strong>',
                'Nếu bạn đang trải qua tình huống nguy hiểm thực sự, hãy liên hệ cơ quan chức năng hoặc dịch vụ khẩn cấp tại địa phương.'
            ]));
            s2.appendChild(MH.steps([
                { main: 'Không phải lời khuyên y tế', sub: 'Mọi mô tả về triệu chứng, chất lạ hay hiện tượng thể chất đều là hư cấu — không thay thế tư vấn y tế chuyên nghiệp.' },
                { main: 'Không phải tài liệu khoa học', sub: 'Các "nghiên cứu", "số liệu" hay "dữ liệu thực nghiệm" trong Wiki đều được bịa đặt phục vụ lore.' },
                { main: 'Không phải tin tức hay báo cáo thực', sub: 'Mọi sự kiện, vụ việc hay "sự cố" được đề cập đều không xảy ra trong thực tế.' }
            ]));
            page.appendChild(s2);

            /* 03 — Nội dung người dùng */
            var s3 = MH.section({ tag: '03 <em>//</em> Nội dung thành viên', heading: 'Trách nhiệm người đóng góp' });
            s3.appendChild(MH.prose([
                'Nội dung trên Wiki được viết bởi các thành viên cộng đồng. BQT M.A.P.L.E không xác minh ' +
                'tính chính xác của mọi bài viết và không chịu trách nhiệm về nội dung do thành viên tạo ra.',
                'Nếu bạn phát hiện nội dung vi phạm pháp luật, gây hại hoặc chứa thông tin cá nhân của người thật, ' +
                'hãy báo cáo ngay cho BQT qua MAPLE Chat hoặc hệ thống Phản Hồi.'
            ]));
            page.appendChild(s3);

            /* 04 — Nhãn độ tuổi */
            var s4 = MH.section({ tag: '04 <em>//</em> Phân loại độ tuổi', heading: 'Nội dung người lớn' });
            s4.appendChild(MH.prose([
                'Wiki có hệ thống phân loại nội dung theo độ tuổi (13+ / 16+ / 18+). ' +
                'Nội dung 18+ được ẩn sau lớp bảo vệ và chỉ hiển thị khi thành viên xác nhận đủ tuổi.',
                'Phụ huynh lưu ý: wiki này có thể chứa nội dung kinh dị, bạo lực hư cấu và chủ đề người lớn ' +
                'phù hợp với thể loại. Khuyến nghị kiểm soát truy cập cho trẻ em dưới 13 tuổi.'
            ]));
            page.appendChild(s4);

            /* 05 — Liên kết ngoài */
            var s5 = MH.section({ tag: '05 <em>//</em> Liên kết ngoài', heading: 'Trang bên ngoài Wiki' });
            s5.appendChild(MH.prose([
                'Wiki có thể chứa liên kết đến trang web bên ngoài. M.A.P.L.E không kiểm soát, ' +
                'không xác nhận và không chịu trách nhiệm về nội dung của các trang đó.',
                'Liên kết ngoài được đánh dấu bằng ký hiệu riêng. Truy cập là quyết định của bạn.'
            ]));
            page.appendChild(s5);

            /* 06 — Bản quyền tóm tắt */
            var s6 = MH.section({ tag: '06 <em>//</em> Bản quyền', heading: 'Sở hữu trí tuệ' });
            s6.appendChild(MH.prose([
                'Mỗi tác phẩm trên Wiki thuộc về tác giả tương ứng và được cấp phép theo giấy phép ghi rõ trên trang đó. ' +
                'Mặc định là CC BY-SA 4.0 trừ khi có ghi chú khác.',
                'Tên, logo và nhận diện thương hiệu "M.A.P.L.E" trong phạm vi dự án thuộc về cộng đồng sáng lập. ' +
                'Không sử dụng cho mục đích thương mại ngoài phạm vi dự án khi chưa được phép.'
            ]));
            page.appendChild(s6);

            page.appendChild(MH.stuck({
                tag:  'Câu hỏi về phủ nhận này?',
                text: 'Liên hệ BQT qua MAPLE Chat hoặc Gmail mapleofficialvn@gmail.com.'
            }));
        });
    }

    if (window.MHHelp) build(window.MHHelp);
    else if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(build);
})();
