/**
 * M.A.P.L.E — MediaWiki:TroGiup-FAQ.js  (mhd3)
 * Trang Trợ_giúp:FAQ
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/FAQ/i.test(decoded)) return;
    if (pn && pn !== 'Trợ_giúp:FAQ' && !/FAQ/i.test(decoded)) return;

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
        });
    }

    var FAQ_DATA = [
        { cat: 'Về M.A.P.L.E & The Maze', tag: '01 <em>//</em> Bối cảnh', items: [
            { q: 'M.A.P.L.E là gì?',
              a: 'M.A.P.L.E (Mapping, Assessment, Protocol, Logistics, Education) là một tổ chức hư cấu hoạt động trong The Maze. Nhiệm vụ chính của tổ chức là điều phối, nghiên cứu, phân loại thực thể và hỗ trợ những người bị mắc kẹt.' },
            { q: 'The Maze là gì?',
              a: 'The Maze là một hệ thống các mê cung không gian hư cấu vô tận được đánh số từ 001. Những người bị "No-Clip" (hiện tượng rơi xuyên khỏi thực tại) sẽ xuất hiện tại đây.' },
            { q: 'Những tài liệu trên Wiki có thật không?',
              a: 'Không. Toàn bộ nội dung, hồ sơ mật, thực thể và sự kiện trên M.A.P.L.E Wiki đều là sản phẩm sáng tác và giải trí hư cấu của cộng đồng tác giả.' }
        ]},
        { cat: 'Tài Khoản', tag: '02 <em>//</em> Tài khoản', items: [
            { q: 'Tôi cần tài khoản để đọc wiki không?',
              a: 'Không bắt buộc với các nội dung thông thường (13+). Tuy nhiên, nhằm bảo vệ độc giả (đặc biệt là trẻ em), các nội dung được dán nhãn 16+ và 18+ yêu cầu bạn BẮT BUỘC phải đăng nhập mới có thể truy cập.' },
            { q: 'Tài khoản mới có thể làm gì ngay lập tức?',
              a: 'Đọc toàn bộ nội dung (kể cả 18+), bình chọn và khiếu nại. Cần xin quyền Writer để tạo/sửa bài.' },
            { q: 'Tôi quên mật khẩu thì làm sao?',
              a: 'Dùng chức năng "Quên mật khẩu" tại trang đăng nhập. Nếu không nhớ email đã đăng ký, bạn cần liên hệ trực tiếp với bộ phận hỗ trợ của Miraheze. Vì M.A.P.L.E hoạt động trên nền tảng Miraheze, Admin nội bộ của Wiki không có quyền truy cập hay can thiệp vào hệ thống dữ liệu khôi phục tài khoản của bạn.' },
            { q: 'Tên người dùng có thể thay đổi không?',
              a: 'Có thể. Tuy nhiên, thao tác này phải do đội ngũ quản trị toàn cục (Steward/Global Sysop) của Miraheze thực hiện. Admin M.A.P.L.E Wiki không có quyền đổi tên người dùng do giới hạn quyền hạn trên hệ thống máy chủ Miraheze.' },
            { q: 'Tài khoản bị khóa dù không làm gì sai?',
              a: 'Có thể bị nhầm. Liên hệ admin qua Gmail hoặc Discord và giải thích — admin sẽ kiểm tra và gỡ khóa nếu là nhầm lẫn.' },
        ]},
        { cat: 'Viết Nội Dung', tag: '03 <em>//</em> Nội dung', items: [
            { q: 'Tôi muốn viết hồ sơ thực thể mới — bắt đầu từ đâu?',
              a: 'Đọc Trợ_giúp:Dossier và Trợ_giúp:Thực_Thể trước. Tạo nháp tại Người_dùng:[Tên]/Nháp, dùng template {{Hồ Sơ Thực Thể}} hoặc {{Dossier}}.' },
            { q: 'ID thực thể của tôi có bị trùng không?',
              a: 'Vào Kho_Lưu_Trữ và tìm ID đó. Không có kết quả = chưa dùng. Nếu không chắc, hỏi admin trước khi publish.' },
            { q: 'Có thể viết nội dung 18+ không?',
              a: 'Được, nhưng bắt buộc đặt {{Phân Loại Nội Dung | muc=18 | ...}} ở đầu trang. Không có template cảnh báo → admin có thể ẩn hoặc xóa.' },
            { q: 'Có thể dùng ảnh AI không?',
              a: 'Được — ảnh AI cho phép dùng làm minh họa trong M.A.P.L.E Wiki.' },
            { q: 'Có thể dùng ảnh từ Google tìm được không?',
              a: 'Tùy bản quyền. Ảnh Creative Commons hoặc Public Domain thì OK. Ảnh có bản quyền → wiki có thể bị yêu cầu gỡ theo DMCA.' },
            { q: 'Có thể viết thực thể tương tự SCP đã có không?',
              a: 'Hoàn toàn được, nhưng bạn phải tự sáng tác bằng văn phong của riêng mình, điều chỉnh sao cho phù hợp với bối cảnh The Maze và tuyệt đối không sao chép câu chữ hay cấu trúc từ SCP Foundation.' },
            { q: 'Bài của tôi cần được duyệt không?',
              a: 'Có, bắt buộc. Mọi bài viết mới đều phải trải qua quá trình kiểm tra và được duyệt bởi Kiểm Duyệt Viên hoặc Admin trước khi xuất hiện trên không gian chính thức của Wiki.' },
            { q: 'Có thể viết nhiều thực thể trong 1 trang không?',
              a: 'Không khuyến nghị — mỗi thực thể nên có trang riêng để dễ tìm kiếm. Dùng bảng wikitable nếu chỉ cần danh sách tóm tắt.' },
        ]},
        { cat: 'Template & Kỹ Thuật', tag: '04 <em>//</em> Kỹ thuật', items: [
            { q: 'Dossier khác gì Hồ Sơ Thực Thể?',
              a: 'Dossier là khung linh hoạt dùng cho bất cứ thứ gì. Hồ Sơ Thực Thể là template cụ thể cho entity với RecordCard, ID dạng MA-E... và phân loại Entity Class.' },
            { q: 'Template không render — chỉ thấy tên template?',
              a: 'Kiểm tra: (1) tên đúng chính tả chưa, (2) trang Bản_Mẫu:Tên có tồn tại không, (3) xóa cache Ctrl+F5.' },
            { q: 'Ảnh luôn hiển thị dù đã đặt anh_rating?',
              a: 'SecureImage.js phải chạy mới xử lý lớp bảo mật. Mở F12 → Console xem có lỗi JS không. Nếu có, báo admin.' },
            { q: 'Layout trang của tôi trông khác trang khác?',
              a: 'Mỗi trang dùng template riêng. Kiểm tra trang kia đang dùng template gì và dùng lại cùng template.' },
            { q: 'Ticker trong Dossier không chạy?',
              a: 'Kiểm tra JS có lỗi không (F12 → Console). Nếu không có lỗi, có thể do tham số ticker bị để trống hoặc thiếu dấu // phân cách.' },
            { q: 'Tôi có thể tùy chỉnh CSS cho trang của mình không?',
              a: 'Được — dùng Người_dùng:[Tên]/common.css. Chỉ áp dụng cho tài khoản bạn, không ảnh hưởng người khác.' },
        ]},
        { cat: 'Quy Tắc & Vi Phạm', tag: '05 <em>//</em> Quy tắc', items: [
            { q: 'Tôi có thể sửa bài của người khác không?',
              a: 'Được với sửa nhỏ (lỗi chính tả, link hỏng). Thay đổi lớn (>20% nội dung) cần xin phép tác giả trước.' },
            { q: 'Trang của tôi bị ẩn — tại sao?',
              a: 'Thường do: thiếu template cảnh báo, rating sai, nội dung không phù hợp hoặc vi phạm quy tắc. Liên hệ admin để biết lý do cụ thể.' },
            { q: 'Tôi bị Strike — có thể kháng cáo không?',
              a: 'Được, inbox BQT trong vòng 7 ngày từ khi nhận Strike. Giải thích rõ lý do kháng cáo. Kháng cáo spam vô lý sẽ bị cộng thêm Strike.' },
            { q: 'Tôi bị Termination — có thể quay lại không?',
              a: 'Trường hợp đặc biệt có thể xin xét duyệt lại qua BQT. Không đảm bảo được chấp nhận, đặc biệt với vi phạm Điều 3.' },
            { q: 'Có giới hạn số bài viết mỗi ngày không?',
              a: 'Không giới hạn chính thức, nhưng đăng quá nhiều bài chất lượng thấp liên tiếp có thể bị admin yêu cầu xem lại nội dung.' },
            { q: 'Tôi muốn xóa bài của mình — có tự xóa được không?',
              a: 'Không — chỉ admin mới xóa được trang. Liên hệ admin và nêu lý do muốn xóa.' },
        ]},
        { cat: 'Bản Quyền & Giấy Phép', tag: '06 <em>//</em> Bản quyền', items: [
            { q: 'Bài viết của tôi trên Wiki thuộc bản quyền của ai?',
              a: 'Tác giả (chính bạn) luôn giữ toàn bộ quyền sở hữu trí tuệ đối với tác phẩm do mình viết. Nền tảng M.A.P.L.E Wiki chỉ được cấp quyền lưu trữ và hiển thị tuỳ theo giấy phép.' },
            { q: 'Tôi có thể mang bài viết của mình đăng ở nơi khác không?',
              a: 'Hoàn toàn được. Bản quyền thuộc về bạn nên bạn có toàn quyền sử dụng, sửa đổi và phân phối sáng tác của mình ở bất kỳ đâu ngoài Wiki.' },
            { q: 'Nếu tôi rời khỏi Wiki hoặc xóa tài khoản thì bài viết sẽ ra sao?',
              a: 'Bạn có thể yêu cầu xóa hoặc giữ lại. Nếu xóa tài khoản mà không để lại chỉ định, theo quy định, nội dung sẽ tự động chuyển sang giấy phép mở CC BY-SA 4.0 sau 30 ngày.' }
        ]},
    ];

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
                crumb: 'FAQ',
                eyebrow: 'Tham khảo — Câu hỏi thường gặp',
                title: 'CÂU HỎI <em>THƯỜNG GẶP</em>',
                sub: 'Giải đáp nhanh các vấn đề phổ biến khi sử dụng M.A.P.L.E Wiki.'
            }));

            FAQ_DATA.forEach(function (group) {
                var sec = H.section({ tag: group.tag, heading: group.cat });
                sec.appendChild(H.faq(group.items.map(function (it) {
                    return { q: it.q, a: esc(it.a) };
                })));
                page.appendChild(sec);
            });

            page.appendChild(H.stuck({
                tag: 'Chưa có câu trả lời?',
                text: 'Không tìm thấy điều bạn cần? Nhắn trực tiếp cho đội ngũ quản trị qua MAPLE Chat.'
            }));
        });
      });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
