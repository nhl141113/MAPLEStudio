/* ============================================
   M.A.P.L.E — MediaWiki:ThuTuc.js
   Trang Thủ Tục — Giao thức sinh tồn (SOP) trong Maze
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
                crumb:   'Thủ Tục',
                eyebrow: 'Quy trình thao tác chuẩn (SOP) — sinh tồn khi chạm trán thực thể trong Maze',
                title:   'THỦ TỤC <em>SINH TỒN</em>',
                sub:     'Tài liệu huấn luyện bắt buộc cho mọi nhân sự M.A.P.L.E trước khi vào hiện trường.'
            })));

            /* Cảnh báo đầu trang */
            page.appendChild(MH.infobox(
                '<strong>LƯU Ý:</strong> Các giao thức dưới đây là quy tắc chung. Mỗi thực thể có giao thức ' +
                'riêng — luôn đọc hồ sơ trong <a href="/wiki/Kho_L%C6%B0u_Tr%E1%BB%AF">Kho Lưu Trữ</a> trước khi tiếp cận.', true));

            /* 01 — Nguyên tắc nền */
            var s1 = MH.section({ tag: '01 <em>//</em> Nền tảng', heading: 'Bốn nguyên tắc sống còn' });
            s1.appendChild(MH.steps([
                { main: 'Không bao giờ đi một mình', sub: 'Tối thiểu 2 người mỗi đội. Luôn có ít nhất một người quan sát môi trường.' },
                { main: 'Luôn theo dõi thiết bị', sub: 'Tablet/cảm biến nhiễu bất thường = dấu hiệu lãnh thổ thực thể. Đừng phớt lờ.' },
                { main: 'Biết đường rút', sub: 'Trước khi tiến vào khu vực mới, xác định ít nhất một lối thoát và vật chắn an toàn.' },
                { main: 'Giữ bình tĩnh', sub: 'Hoảng loạn giết bạn nhanh hơn thực thể. Hít thở, bám giao thức, di chuyển dứt khoát.' }
            ]));
            page.appendChild(s1);

            /* 02 — Giao thức chuẩn (mẫu The Hollow) */
            var s2 = MH.section({ tag: '02 <em>//</em> Giao thức', heading: 'SOP chạm trán thực thể tàng hình' });
            s2.appendChild(MH.prose('Áp dụng với các thực thể chỉ tấn công khi không bị quan sát (vd: The Hollow / MA-E001):'));
            s2.appendChild(MH.steps([
                { main: 'A.L.O.P.S.I — <em>At Least One Person Saw It</em>', sub: 'Luôn có ít nhất một người NHÌN thực thể. Chớp mắt luân phiên (A chớp thì B mở) để không bao giờ mất dấu.' },
                { main: 'P.A.T.Y.T — <em>Pay Attention To Your Tablet</em>', sub: 'Chú ý thiết bị: nhiễu liên tục nghĩa là bạn đã vào lãnh thổ của nó.' },
                { main: 'F.A.B — <em>Find A Barrier</em>', sub: 'Tìm vật chắn để thực thể không nhìn/cảm nhận được bạn, sau đó rời khỏi lãnh thổ.' },
                { main: 'A.E.O.T.A.F.W.E.O.T — <em>Avoid Encroaching On Territory…</em>', sub: 'Hạn chế xâm phạm lãnh thổ. Khi đã lỡ xâm phạm: chạy NGAY.' }
            ]));
            page.appendChild(s2);

            /* 03 — Sau sự cố */
            var s3 = MH.section({ tag: '03 <em>//</em> Sau sự cố', heading: 'Quy trình báo cáo' });
            s3.appendChild(MH.steps([
                { main: 'Rút về điểm an toàn', sub: 'Không quay lại "cứu đồ". Mạng người trên hết.' },
                { main: 'Ghi nhật ký', sub: 'Lập tức ghi lại hành vi quan sát được — bổ sung vào hồ sơ thực thể giúp đồng đội sau này.' },
                { main: 'Gửi báo cáo', sub: 'Tạo bài nhật ký/hồ sơ qua hàng chờ kiểm duyệt để Kiểm Duyệt Viên cập nhật cơ sở dữ liệu.' }
            ]));
            page.appendChild(s3);

            /* FAQ */
            var sf = MH.section({ tag: '04 <em>//</em> FAQ', heading: 'Câu hỏi thường gặp' });
            sf.appendChild(MH.faq([
                { q: 'Nếu chỉ có một mình thì sao?', a: 'Không khuyến khích. Nếu bắt buộc: dùng gương/camera để duy trì "quan sát" gián tiếp, và ưu tiên rút lui hơn khám phá.' },
                { q: 'Giao thức này áp dụng cho mọi thực thể?', a: 'Không. Đây là khung chung. Mỗi thực thể có giao thức riêng trong hồ sơ — đọc kỹ <a href="/wiki/Kho_L%C6%B0u_Tr%E1%BB%AF">Kho Lưu Trữ</a>.' },
                { q: 'Tôi muốn viết một giao thức mới?', a: 'Tuyệt vời — xem <a href="/wiki/H%C6%B0%E1%BB%9Bng_D%E1%BA%ABn_Vi%E1%BA%BFt">Hướng Dẫn Viết</a> rồi gửi qua hàng chờ kiểm duyệt.' }
            ]));
            page.appendChild(sf);

            /* Liên kết nhanh */
            var bs = MH.btns();
            bs.appendChild(MH.btn('/wiki/Kho_L%C6%B0u_Tr%E1%BB%AF', 'Kho Lưu Trữ', true));
            bs.appendChild(MH.btn('/wiki/H%C6%B0%E1%BB%9Bng_D%E1%BA%ABn_Vi%E1%BA%BFt', 'Hướng Dẫn Viết'));
            bs.appendChild(MH.btn('/wiki/Quy_T%E1%BA%AFc', 'Quy Tắc'));
            page.appendChild(bs);

            page.appendChild(MH.stuck({
                tag:  'Cần làm rõ giao thức?',
                text: 'Nhắn đội ngũ quản trị nếu bạn gặp tình huống chưa có trong tài liệu.'
            }));
        });
    }

    if (window.MHHelp) build(window.MHHelp);
    else if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(build);
})();
