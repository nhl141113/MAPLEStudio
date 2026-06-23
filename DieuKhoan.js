/* ============================================
   M.A.P.L.E — MediaWiki:DieuKhoan.js
   Trang Điều Khoản Người Dùng (namespace chính)
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
                crumb:   'Điều Khoản Người Dùng',
                eyebrow: 'Terms of Service v2.0 — Có hiệu lực từ 2026-01-01',
                title:   'ĐIỀU KHOẢN <em>NGƯỜI DÙNG</em>',
                sub:     'Bằng cách truy cập hoặc sử dụng Wiki — dù chỉ để đọc — bạn đồng ý với toàn bộ nội dung tài liệu này.'
            })));

            /* 01 — Định nghĩa */
            var s1 = MH.section({ tag: '01 <em>//</em> Định nghĩa', heading: 'Các thuật ngữ' });
            s1.appendChild(MH.prose([
                '<strong>"Wiki" / "M.A.P.L.E Wiki"</strong> — Nền tảng tại maple-wiki.miraheze.org và mọi trang con, subdomain hoặc dịch vụ liên quan do BQT vận hành.',
                '<strong>"BQT" / "Ban Quản Trị"</strong> — Nhóm quản trị viên, kiểm duyệt viên và người sáng lập chịu trách nhiệm vận hành Wiki (sysop, bureaucrat, interface-admin).',
                '<strong>"Thành viên" / "Người dùng"</strong> — Bất kỳ cá nhân nào truy cập Wiki, bất kể có tài khoản hay không.',
                '<strong>"Nội dung"</strong> — Mọi văn bản, hình ảnh, code, bình luận, tin nhắn Chat và tài liệu khác được tạo ra bởi thành viên trên Wiki.'
            ]));
            page.appendChild(s1);

            /* 02 — Tài khoản */
            var s2 = MH.section({ tag: '02 <em>//</em> Tài khoản', heading: 'Đăng ký & bảo mật' });
            s2.appendChild(MH.steps([
                { main: 'Một người — một tài khoản chính', sub: 'Tài khoản phụ (alt) chỉ được phép nếu có lý do hợp lệ và được BQT phê duyệt, phải khai báo công khai.' },
                { main: 'Tên người dùng', sub: 'Không được chứa thông tin cá nhân của người khác, ngôn từ phân biệt/công kích, hoặc mạo danh cá nhân/tổ chức thực tế.' },
                { main: 'Bảo mật tài khoản', sub: 'Bạn chịu trách nhiệm hoàn toàn về mọi hoạt động dưới tài khoản của mình. Phát hiện truy cập trái phép → liên hệ BQT ngay.' },
                { main: 'Tuổi tối thiểu', sub: 'Người dưới 13 tuổi không được đăng ký. Người 13–17 tuổi chỉ được truy cập nội dung 13+ và 16+. Truy cập nội dung 18+ khi chưa đủ tuổi là vi phạm.' }
            ]));
            page.appendChild(s2);

            /* 03 — Quyền truy cập */
            var s3 = MH.section({ tag: '03 <em>//</em> Truy cập', heading: 'Quyền sử dụng' });
            s3.appendChild(MH.prose([
                'Mọi người đều có thể đọc nội dung công khai mà không cần tài khoản, trừ các trang bị hạn chế theo mức phân loại.',
                'Chỉ thành viên đã đăng nhập mới được đăng bài, chỉnh sửa, bình luận hoặc sử dụng các tính năng tương tác.',
                'Wiki có thể tạm ngừng bất kỳ lúc nào để bảo trì. BQT không chịu trách nhiệm về gián đoạn.'
            ]));
            s3.appendChild(MH.infobox(
                '<strong>Hành vi kỹ thuật bị cấm:</strong> Scraping/crawling tự động, tấn công DoS/DDoS, khai thác lỗ hổng bảo mật, ' +
                'đăng nhập tài khoản người khác khi chưa được phép, phát tán malware/phishing/liên kết độc hại.', true));
            page.appendChild(s3);

            /* 04 — Ứng xử */
            var s4 = MH.section({ tag: '04 <em>//</em> Ứng xử', heading: 'Quy tắc giao tiếp' });
            s4.appendChild(MH.infobox(
                'Điều này áp dụng cho <strong>MỌI</strong> hình thức tương tác: bình luận, MAPLE Chat, trang thảo luận, phản hồi, trang cá nhân. Không có ngoại lệ.'));
            s4.appendChild(MH.prose([
                '<strong>Phân biệt đối xử</strong> — Nghiêm cấm mọi hành vi kỳ thị hoặc công kích dựa trên: chủng tộc, dân tộc, vùng miền, quốc tịch, màu da, giới tính, xu hướng tình dục, bản dạng giới (bao gồm người chuyển giới và phi nhị nguyên giới), tôn giáo, khuyết tật, hoặc ngoại hình. Dù nói thẳng, gián tiếp hay qua "đùa" — <em>Không có "đùa thôi mà" ở đây.</em>'
            ]));
            s4.appendChild(MH.steps([
                { main: 'Toxic & quấy rối', sub: 'Cấm: công kích cá nhân, spam Chat, theo dõi/nhắn tin liên tục dù đã bị yêu cầu dừng, đe doạ, cố tình làm nhục trước cộng đồng, lan truyền tin đồn về thành viên.' },
                { main: 'Thao túng & gian lận', sub: 'Cấm: mạo danh thành viên/BQT, dùng nhiều tài khoản để tạo ảo giác đồng thuận, báo cáo gian lận nhằm trả thù, cố tình kéo thành viên khác vi phạm.' },
                { main: 'Role-play trong Chat', sub: 'MAPLE Chat không phải sân khấu. Dùng nhân vật hư cấu để kỳ thị/quấy rối thành viên thật vẫn là vi phạm. "Tôi đang nhập vai" không phải lý do hợp lệ. Tuy nhiên nên hạn chế việc role-play để tránh trường hợp hiểu sai ý.' },
                { main: 'Ranh giới cá nhân', sub: 'Nếu một thành viên yêu cầu dừng liên lạc, bạn phải dừng. Tiếp tục liên hệ sau đó là quấy rối và sẽ bị xử lý.' }
            ]));
            s4.appendChild(MH.infobox(
                '<strong>Ranh giới pháp lý tuyệt đối — không ngoại lệ:</strong> Nội dung cổ xúy bạo lực/khủng bố/tự tử; ' +
                'nội dung xâm hại trẻ em (CSAM — vi phạm = báo cáo ngay cơ quan có thẩm quyền); ' +
                'chia sẻ thông tin cá nhân của người khác khi chưa được phép (doxxing).', true));
            page.appendChild(s4);

            /* 05 — Dữ liệu */
            var s5 = MH.section({ tag: '05 <em>//</em> Dữ liệu', heading: 'Quyền riêng tư' });
            s5.appendChild(MH.prose([
                'Wiki thu thập để vận hành: tên người dùng và email (qua Miraheze), lịch sử chỉnh sửa (công khai), địa chỉ IP (log hệ thống), dữ liệu localStorage (trạng thái UI, chỉ lưu cục bộ).',
                'M.A.P.L.E <strong>không bán</strong> dữ liệu cá nhân cho bên thứ ba. Dữ liệu chỉ dùng để vận hành tính năng và ngăn lạm dụng.',
                '<a href="https://meta.miraheze.org/wiki/Privacy_Policy" target="_blank" rel="noopener">Miraheze Privacy Policy</a> áp dụng song song.',
                'Yêu cầu xoá dữ liệu: liên hệ BQT. Log MediaWiki được lưu theo chính sách Miraheze, có thể không xoá hoàn toàn được.'
            ]));
            page.appendChild(s5);

            /* 06 — Tính năng */
            var s6 = MH.section({ tag: '06 <em>//</em> Tính năng', heading: 'Đặc thù hệ thống' });
            s6.appendChild(MH.steps([
                { main: 'MAPLE Chat', sub: 'Hệ thống nhắn tin nội bộ — Điều 4 áp dụng đầy đủ. BQT có quyền xem nội dung Chat khi điều tra vi phạm.' },
                { main: 'Sự Kiện & Hệ thống Điểm RP', sub: 'Tham gia tự nguyện. Phần thưởng (huy hiệu, RP) chỉ có giá trị trong Wiki, không quy đổi thực tế. BQT có thể thu hồi nếu phát hiện gian lận.' },
                { main: 'Phản Hồi (Feedback)', sub: 'Nội dung gửi qua Phản Hồi được lưu công khai tại Dự án:Phản hồi. Chọn "Ẩn danh" → hiển thị N/A, nhưng BQT vẫn có thể truy xuất tài khoản nếu cần điều tra vi phạm.' }
            ]));
            page.appendChild(s6);

            /* 07 — Vi phạm */
            var s7 = MH.section({ tag: '07 <em>//</em> Xử lý', heading: 'Hệ thống vi phạm' });
            s7.appendChild(MH.steps([
                { main: 'Mức 1 — Cảnh báo', sub: 'Vi phạm nhẹ lần đầu. Đình chỉ đăng bài 3 ngày. Ví dụ: toxic nhẹ, spam nhỏ, comment thiếu tôn trọng.' },
                { main: 'Mức 2 — Cách ly 14 ngày', sub: 'Cấm toàn bộ hoạt động tương tác. Ví dụ: quấy rối có chủ đích, phân biệt đối xử, tái phạm sau Mức 1.' },
                { main: 'Mức 3 — Chấm dứt', sub: 'Khoá vĩnh viễn + Blacklist. Ví dụ: phân biệt chủng tộc/giới tính có chủ đích, doxxing, CSAM, đe doạ nghiêm trọng.' }
            ]));
            s7.appendChild(MH.prose([
                'Một số vi phạm bỏ qua thang 3 bước — khoá ngay lập tức: CSAM, doxxing, tấn công hệ thống, đe doạ bạo lực nghiêm trọng.',
                'Kháng cáo: gửi cho BQT trong vòng 7 ngày kể từ quyết định. Cần lý do cụ thể và bằng chứng. Spam kháng cáo vô lý → cộng thêm 1 mức xử phạt.'
            ]));
            page.appendChild(s7);

            /* 08 — Quyền BQT */
            var s8 = MH.section({ tag: '08 <em>//</em> BQT', heading: 'Quyền hạn Ban Quản Trị' });
            s8.appendChild(MH.prose([
                'BQT có toàn quyền về: phân quyền thành viên, duyệt/xoá nội dung, khoá tài khoản, thay đổi cấu hình hệ thống và cập nhật điều khoản.',
                'BQT có quyền từ chối truy cập với bất kỳ người dùng nào nếu đánh giá sự hiện diện đó gây hại cho cộng đồng — kể cả khi chưa có vi phạm cụ thể.',
                'BQT không có nghĩa vụ giám sát toàn bộ nội dung mọi lúc. Trách nhiệm báo cáo vi phạm thuộc về cả cộng đồng.',
                'Sau khi xem xét kháng cáo hợp lệ, quyết định của BQT là quyết định cuối cùng trong phạm vi Wiki.'
            ]));
            page.appendChild(s8);

            /* 09 — Giới hạn */
            var s9 = MH.section({ tag: '09 <em>//</em> Trách nhiệm', heading: 'Giới hạn trách nhiệm' });
            s9.appendChild(MH.prose([
                'Wiki cung cấp "nguyên trạng". M.A.P.L.E không đảm bảo hoạt động liên tục, không lỗi, hoặc nội dung luôn chính xác.',
                'Mọi thực thể, vật phẩm, sự kiện trong The Maze là <strong>hư cấu hoàn toàn</strong>. M.A.P.L.E không chịu trách nhiệm nếu ai hiểu nhầm và hành động dựa trên nội dung đó như thể là thật.',
                'Wiki có thể chứa liên kết trang bên ngoài. M.A.P.L.E không kiểm soát và không chịu trách nhiệm về nội dung của chúng.'
            ]));
            page.appendChild(s9);

            /* 10 — Thay đổi */
            var s10 = MH.section({ tag: '10 <em>//</em> Cập nhật', heading: 'Thay đổi điều khoản' });
            s10.appendChild(MH.prose([
                'BQT có thể cập nhật điều khoản bất kỳ lúc nào. Thay đổi lớn sẽ thông báo qua What\'s New hoặc Bảng Tin ít nhất 7 ngày trước khi có hiệu lực.',
                'Tiếp tục sử dụng Wiki sau khi cập nhật = chấp nhận phiên bản mới. Không đồng ý → ngừng sử dụng và yêu cầu xoá tài khoản trước ngày có hiệu lực.',
                'Wiki vận hành trên hạ tầng Miraheze (Hoa Kỳ & Anh). Các vấn đề pháp lý điều chỉnh bởi luật liên bang Hoa Kỳ.'
            ]));
            page.appendChild(s10);

            /* FAQ */
            var sf = MH.section({ tag: '11 <em>//</em> FAQ', heading: 'Câu hỏi thường gặp' });
            sf.appendChild(MH.faq([
                { q: 'Tôi vừa bị khoá tài khoản oan, phải làm sao?', a: 'Gửi kháng cáo cho BQT trong vòng 7 ngày kể từ quyết định kèm lý do cụ thể và bằng chứng. Liên hệ qua MAPLE Chat hoặc Gmail.' },
                { q: 'Alt account có được phép không?', a: 'Được, nhưng phải có lý do hợp lệ, được BQT phê duyệt và khai báo công khai. Dùng alt để lách lệnh cấm là vi phạm nghiêm trọng.' },
                { q: 'Chọn "Ẩn danh" khi gửi Phản Hồi có thực sự ẩn danh không?', a: 'Hiển thị N/A cho công khai. Tuy nhiên BQT vẫn có thể truy xuất tài khoản gốc nếu cần điều tra vi phạm.' },
                { q: 'Role-play trong Chat có được không?', a: 'Được phép trong phạm vi lore M.A.P.L.E đã thoả thuận giữa các bên, không nhắm vào thành viên thật, không chứa nội dung phân biệt. Tuy nhiên nên hạn chế để tránh hiểu nhầm.' }
            ]));
            page.appendChild(sf);

            /* 12 — Điều khoản chuyên biệt */
            var s12 = MH.section({ tag: '12 <em>//</em> Chuyên biệt', heading: 'Điều khoản theo tính năng' });
            s12.appendChild(MH.prose(['Mỗi tính năng của Wiki có điều khoản riêng — được áp dụng thêm VÀO điều khoản chung này, không thay thế.']));
            s12.appendChild(MH.btns([
                MH.btn({ label: 'Bình Luận',          href: '/wiki/Điều_Khoản/Bình_Luận' }),
                MH.btn({ label: 'MAPLE Chat',          href: '/wiki/Điều_Khoản/Chat' }),
                MH.btn({ label: 'Tạo Bài / Writer',   href: '/wiki/Điều_Khoản/Tạo_Bài' }),
                MH.btn({ label: 'Tài Khoản Clone',    href: '/wiki/Điều_Khoản/Tài_Khoản_Clone' }),
                MH.btn({ label: 'Bài Viết Rác',       href: '/wiki/Điều_Khoản/Bài_Rác' }),
                MH.btn({ label: 'Giới Hạn Tuổi',      href: '/wiki/Điều_Khoản/Giới_Hạn_Tuổi' }),
                MH.btn({ label: 'Quyên Góp / Donate', href: '/wiki/Điều_Khoản/Quyên_Góp' }),
                MH.btn({ label: 'Drama Ngoài Đời',    href: '/wiki/Điều_Khoản/Drama' }),
                MH.btn({ label: 'Quyền Sở Hữu',       href: '/wiki/Điều_Khoản/Quyền_Sở_Hữu' }),
            ]));
            page.appendChild(s12);

            /* CTA */
            page.appendChild(MH.stuck({
                tag:  'Câu hỏi hoặc thắc mắc?',
                text: 'Liên hệ BQT qua MAPLE Chat, Gmail mapleofficialvn@gmail.com hoặc Discord server M.A.P.L.E.'
            }));
        });
    }

    if (window.MHHelp) build(window.MHHelp);
    else if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(build);
})();
