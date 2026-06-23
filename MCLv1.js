/* ============================================================
   MediaWiki:MCLv1.js
   M.A.P.L.E LEGAL ENGINE — bộ render văn bản pháp lý DÙNG CHUNG
   ------------------------------------------------------------
   File này (giữ tên MCLv1 để Common.js & lịch sử tương thích) nay
   render NHIỀU văn bản pháp lý từ một engine data-driven, tái dùng
   MediaWiki:MCLv1.css (class mcl-*):
     • Dự án:Bản quyền/Giấy phép/MCLv1      → MCL v1.0 (theo else/MCLv1.md)
     • Dự án:Bản quyền/Giấy phép/M-SA 1.0   → M-SA 1.0
     • Dự án:Bản quyền/Giấy phép/M BY-SA 1.0→ M BY-SA 1.0
     • Dự án:Bản quyền                       → Điều khoản bản quyền v3.0
   Toàn bộ nội dung inject bằng JS, KHÔNG dùng wikitext.
   ============================================================ */
( function ( mw, $ ) {
    'use strict';

    function esc( s ) {
        return String( s == null ? '' : s ).replace( /[&<>"']/g, function ( c ) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ c ];
        } );
    }
    function logoSVG() {
        if ( window.MAPLE && window.MAPLE.logoSVG ) return window.MAPLE.logoSVG( 130, { className: 'mcl-logo' } );
        return '<svg class="mcl-logo" viewBox="0 0 100 100" fill="none">' +
            '<path d="M50 5L95 40L80 95H20L5 40L50 5Z" stroke="#450a0a" stroke-width="1.2"/>' +
            '<path d="M50 15V85M50 15L85 45L50 40L15 45L50 15Z" stroke="#ef4444" stroke-width="2.5" stroke-linejoin="miter"/>' +
            '<path d="M30 60L50 85L70 60" stroke="#ef4444" stroke-width="2.5"/>' +
            '<circle class="mcl-eye maple-eye-pulse" cx="50" cy="40" r="6" fill="#ef4444"/></svg>';
    }

    /* ── Block renderer ── (content là HTML tin cậy do file tự viết) */
    function cellClass( c ) {
        c = String( c ).trim();
        if ( /^(✅|✓)/.test( c ) ) return 'mcl-yes';
        if ( /^(🚫|❌|✕|✗)/.test( c ) ) return 'mcl-no';
        if ( /^➖/.test( c ) ) return 'mcl-cond';
        return '';
    }
    function table( headers, rows ) {
        return '<div class="mcl-table-wrap"><table class="mcl-summary-table"><thead><tr>' +
            headers.map( function ( h ) { return '<th>' + esc( h ) + '</th>'; } ).join( '' ) +
            '</tr></thead><tbody>' +
            rows.map( function ( r ) {
                return '<tr>' + r.map( function ( cell, i ) {
                    var cls = i === 0 ? 'mcl-cell-first' : cellClass( cell );
                    return '<td' + ( cls ? ' class="' + cls + '"' : '' ) + '>' + esc( cell ) + '</td>';
                } ).join( '' ) + '</tr>';
            } ).join( '' ) +
            '</tbody></table></div>';
    }
    function block( b ) {
        switch ( b[ 0 ] ) {
            case 'p':    return '<p>' + b[ 1 ] + '</p>';
            case 'sub':  return '<div class="mcl-subheading">' + esc( b[ 1 ] ) + '</div>';
            case 'ul':   return '<ul' + ( b[ 2 ] ? ' class="mcl-deny"' : '' ) + '>' +
                              b[ 1 ].map( function ( i ) { return '<li>' + i + '</li>'; } ).join( '' ) + '</ul>';
            case 'note': return '<div class="mcl-note">' + b[ 1 ] + '</div>';
            case 'code': return '<pre class="mcl-code">' + esc( b[ 1 ] ) + '</pre>';
            case 'table':return table( b[ 1 ], b[ 2 ] );
        }
        return '';
    }

    /* ════════════════════════════════════════════════════════
       DỮ LIỆU 4 VĂN BẢN
       ════════════════════════════════════════════════════════ */
    var DOCS = {};

    /* ---------- MCL v1.0 (else/MCLv1.md) ---------- */
    DOCS[ 'Dự án:Bản quyền/Giấy phép/MCLv1' ] = {
        docId: 'DOC // MCL-V1.0 // LEGAL',
        title: 'M.<span class="mcl-accent">A</span>.P.L.E CUSTOM LICENSE',
        subtitle: 'PHIÊN BẢN 1.0 — 2026',
        bar: [ 'STATUS: ACTIVE', 'JURISDICTION: 17 U.S.C.' ],
        notice:
            'Bằng việc gắn nhãn <strong>MCL</strong> lên bất kỳ Nội Dung nào, Tác Giả xác nhận đã đọc, hiểu và tự nguyện ' +
            'chấp nhận toàn bộ điều khoản; đủ năng lực pháp lý; sở hữu hợp pháp hoặc có quyền cấp phép Nội Dung; và Nội Dung ' +
            'không vi phạm quyền của bên thứ ba. M.A.P.L.E Wiki là dự án <strong>phi lợi nhuận</strong> trên hạ tầng Miraheze. ' +
            'Giấy phép này <strong>không thay thế</strong> quyền tác giả gốc và chỉ có hiệu lực trong phạm vi hệ sinh thái M.A.P.L.E Wiki.',
        toc: [ 'Định nghĩa', 'Quyền được cấp phép', 'Quyền tác giả & cấp phép ngoài', 'Hiệu lực & chấm dứt', 'Giới hạn trách nhiệm', 'Luật áp dụng & tranh chấp', 'Điều khoản bổ sung' ],
        articles: [
            { num: '01', title: 'Định nghĩa', blocks: [
                [ 'p', 'Trong giấy phép này, các thuật ngữ sau được hiểu như sau:' ],
                [ 'p', '<span class="mcl-def">Tác Giả</span> — Cá nhân/nhóm đã tạo và đăng Nội Dung lên Wiki dưới MCL, đủ năng lực pháp lý.' ],
                [ 'p', '<span class="mcl-def">Nội Dung</span> — Tác phẩm gắn nhãn MCL: văn bản, hình ảnh do Tác Giả tạo (trừ ảnh AI có giấy phép riêng), cấu trúc bài, nhân vật, lore… Không gồm dữ liệu hệ thống/metadata/nội dung tự sinh.' ],
                [ 'p', '<span class="mcl-def">Nền Tảng</span> — M.A.P.L.E Wiki (BQT + hệ thống kỹ thuật). <strong>Không</strong> bao gồm Miraheze Limited (bên thứ ba độc lập).' ],
                [ 'p', '<span class="mcl-def">Thành Viên</span> — Cá nhân có tài khoản và hoạt động trên Wiki.' ],
                [ 'p', '<span class="mcl-def">Bên Thứ Ba</span> — Cá nhân/tổ chức/nền tảng ngoài hệ sinh thái M.A.P.L.E (kể cả Miraheze).' ],
                [ 'p', '<span class="mcl-def">Trích Dẫn Ngắn</span> — Đoạn trích ≤ 300 từ hoặc 10% tổng số từ (lấy giá trị nhỏ hơn), không tái hiện phần cốt lõi.' ],
                [ 'p', '<span class="mcl-def">Mục Đích Phi Lợi Nhuận</span> — Không tạo doanh thu cho cá nhân BQT; quyên góp/merchandise chỉ để tái đầu tư vào Wiki.' ]
            ] },
            { num: '02', title: 'Quyền được cấp phép', blocks: [
                [ 'sub', '2.1 — Quyền của Nền Tảng' ],
                [ 'p', 'Tác Giả cấp cho Nền Tảng các quyền <strong>không độc quyền, miễn phí bản quyền, toàn cầu</strong>:' ],
                [ 'ul', [ 'Lưu trữ, hiển thị, phân phối Nội Dung trong phạm vi Wiki cho Mục Đích Phi Lợi Nhuận',
                    'Tạo bản sao lưu (backup)', 'Chuyển Nội Dung sang hạ tầng host khác nếu Wiki đổi nhà cung cấp (giữ nguyên MCL)',
                    'Hiển thị snippet/preview cho công cụ tìm kiếm', 'Ẩn/khóa tạm Nội Dung theo quy trình xử lý vi phạm',
                    'Thay đổi kỹ thuật không ảnh hưởng nội dung sáng tạo' ] ],
                [ 'p', 'Nền Tảng <strong>không</strong> được:' ],
                [ 'ul', [ 'Bán/cho thuê/cấp phép lại Nội Dung cho Bên Thứ Ba vì thương mại',
                    'Sinh lợi cá nhân cho BQT', 'Cấp Nội Dung để huấn luyện AI của Bên Thứ Ba (Điều 2.4)',
                    'Xóa/thay thông tin ghi công', 'Đổi giấy phép MCL mà không có đồng ý của Tác Giả (trừ Điều 4.3)' ], true ],
                [ 'sub', '2.2 — Quyền của Thành Viên (nội bộ Wiki)' ],
                [ 'ul', [ 'Đọc, tham khảo, Trích Dẫn Ngắn (ghi tên TG + link gốc)',
                    'Liên kết tới Nội Dung từ bài khác', 'Sửa đổi Nội Dung <strong>sau khi TG đồng ý rõ ràng</strong>',
                    'Tái sử dụng một phần với ghi công đầy đủ, không vượt Trích Dẫn Ngắn' ] ],
                [ 'p', 'Thành Viên <strong>không</strong> được sửa khi chưa có đồng ý của TG, đưa Nội Dung ra ngoài Wiki, xóa ghi công, tuyên bố sở hữu/đồng tác giả, hay dùng Nội Dung để huấn luyện AI.' ],
                [ 'sub', '2.3 — Quyền sửa lỗi nhỏ' ],
                [ 'p', 'BQT/editor được sửa <strong>không cần xin phép</strong>: lỗi chính tả/ngữ pháp, cú pháp wiki/link hỏng/template lỗi, cập nhật link nội bộ khi đổi tên, thêm/sửa thể loại-tag-infobox không đổi nội dung sáng tạo. Tác Giả có quyền hoàn tác bất kỳ sửa đổi nào.' ],
                [ 'sub', '2.4 — AI và machine learning' ],
                [ 'p', 'Tác Giả <strong>bảo lưu rõ ràng</strong> mọi quyền liên quan đến việc dùng Nội Dung làm dữ liệu huấn luyện AI. Nền Tảng triển khai biện pháp kỹ thuật hợp lý (robots.txt, header noai) và không trực tiếp dùng Nội Dung để huấn luyện AI, nhưng không cam kết ngăn được mọi scraping trái phép.' ]
            ] },
            { num: '03', title: 'Quyền tác giả & cấp phép bên ngoài', blocks: [
                [ 'sub', '3.1 — Quyền tuyệt đối của Tác Giả' ],
                [ 'p', 'MCL chỉ quy định cách dùng Nội Dung <strong>trong phạm vi Wiki</strong>, không hạn chế quyền của Tác Giả với chính tác phẩm: dùng/sửa/phân phối ở bất kỳ đâu ngoài Wiki, cấp phép cho Bên Thứ Ba theo ý mình, xuất bản thương mại, đăng ký bản quyền chính thức.' ],
                [ 'sub', '3.2 — Cấp phép cho Bên Thứ Ba' ],
                [ 'p', 'Tác Giả cấp phép cho Bên Thứ Ba <strong>không cần đồng ý của BQT</strong>. Khuyến nghị thông báo BQT các thỏa thuận quan trọng (không bắt buộc). Bắt buộc thông báo nếu thỏa thuận làm thay đổi/xóa Nội Dung trên Wiki.' ],
                [ 'sub', '3.3 — Tuyên bố & bảo đảm của Tác Giả' ],
                [ 'p', 'Tác Giả cam đoan: (a) Nội Dung là tác phẩm gốc/có quyền cấp phép; (b) không vi phạm quyền bên thứ ba; (c) không chứa nội dung bất hợp pháp theo luật nơi cư trú và luật Hoa Kỳ; (d) tự chịu trách nhiệm pháp lý với vi phạm (a)–(c).' ]
            ] },
            { num: '04', title: 'Hiệu lực & chấm dứt giấy phép', blocks: [
                [ 'sub', '4.1 — Hiệu lực' ],
                [ 'p', 'MCL có hiệu lực từ khi Nội Dung được đăng với nhãn MCL, đến khi chấm dứt theo 4.2/4.3.' ],
                [ 'sub', '4.2 — Tác Giả chủ động chấm dứt' ],
                [ 'p', 'Tác Giả có quyền yêu cầu xóa Nội Dung bất kỳ lúc nào; BQT xử lý trong <strong>14 ngày</strong>. Sau xóa: MCL chấm dứt hiển thị công khai; backup giữ tối đa <strong>30 ngày</strong> rồi xóa vĩnh viễn (ngoại lệ: tranh chấp pháp lý đang diễn ra). Trích Dẫn Ngắn/link đã có trước thời điểm xóa hiển thị "[Nội dung đã được tác giả yêu cầu xóa]".' ],
                [ 'sub', '4.3 — Tác Giả rời Wiki / tài khoản không hoạt động' ],
                [ 'p', '<strong>4.3.1</strong> Nếu Tác Giả chỉ định trước → xử lý theo chỉ định. <strong>4.3.2</strong> Không chỉ định & tài khoản bị xóa → giữ nguyên MCL kèm ghi chú "đã rời Wiki", KHÔNG tự đổi license. <strong>4.3.3</strong> Không hoạt động ≥ 24 tháng & không chỉ định → BQT đăng thông báo tìm TG 90 ngày; nếu không phản hồi có thể chuyển "lưu trữ orphan". BQT <strong>không có quyền</strong> tự đổi sang CC BY-SA hay license khác.' ],
                [ 'sub', '4.4 — Vi phạm giấy phép' ],
                [ 'p', 'Vi phạm nội bộ → báo BQT, xử lý trong 14 ngày. Vi phạm bên ngoài → BQT không có nghĩa vụ can thiệp, có thể hỗ trợ bằng chứng thời điểm đăng. Khiếu nại bản quyền theo quy trình DMCA (17 U.S.C. §512).' ]
            ] },
            { num: '05', title: 'Giới hạn trách nhiệm & bồi thường', blocks: [
                [ 'sub', '5.1 — Miễn trừ bảo đảm' ],
                [ 'p', 'NỀN TẢNG CUNG CẤP DỊCH VỤ "NHƯ HIỆN TRẠNG" VÀ "NHƯ CÓ SẴN", KHÔNG KÈM BẢO ĐẢM dưới bất kỳ hình thức nào.' ],
                [ 'sub', '5.2 — Giới hạn trách nhiệm' ],
                [ 'p', 'Trong phạm vi luật cho phép, Nền Tảng/BQT không chịu trách nhiệm với tranh chấp TG–Bên Thứ Ba, thiệt hại do Thành Viên/Bên Thứ Ba vi phạm, Nội Dung vi phạm quyền bên thứ tư, mất dữ liệu do sự cố Miraheze, hay thiệt hại gián tiếp/hậu quả. <strong>Tổng trách nhiệm tối đa được giới hạn ở mức 0 USD</strong> (Wiki phi lợi nhuận).' ],
                [ 'sub', '5.3 — Bồi thường' ],
                [ 'p', 'Tác Giả đồng ý bồi thường và giữ vô hại cho Nền Tảng/BQT khỏi khiếu nại phát sinh từ Nội Dung vi phạm quyền bên thứ ba, vi phạm cam đoan 3.3, hoặc vi phạm điều khoản. Không áp dụng nếu khiếu nại đến từ hành vi sai trái cố ý/cẩu thả nghiêm trọng của BQT.' ]
            ] },
            { num: '06', title: 'Luật áp dụng & giải quyết tranh chấp', blocks: [
                [ 'sub', '6.1 — Luật áp dụng' ],
                [ 'p', 'Áp dụng <strong>luật liên bang Hoa Kỳ</strong> cho bản quyền (17 U.S.C., DMCA) và <strong>luật Bang California</strong> cho hợp đồng/bồi thường, không áp dụng quy tắc xung đột luật.' ],
                [ 'sub', '6.2 — Nơi giải quyết tranh chấp' ],
                [ 'p', '<strong>Bước 1 — Hòa giải nội bộ</strong> (60 ngày). <strong>Bước 2 — Trọng tài trực tuyến</strong> (VIAC / HKIAC / AAA, do bên khiếu nại chọn), phán quyết chung thẩm. <strong>Bước 3 — Tòa án</strong> chỉ cho biện pháp khẩn cấp/thi hành phán quyết, tại nơi cư trú của bị đơn.' ],
                [ 'note', 'Ý nghĩa thực tế: người cư trú tại Việt Nam <strong>không bị buộc sang Mỹ kiện tụng</strong>, và ngược lại. Tranh chấp xử lý online qua trọng tài hoặc tại tòa nơi bị đơn cư trú.' ],
                [ 'sub', '6.3 — Từ bỏ kiện tập thể' ],
                [ 'p', 'Các bên đồng ý chỉ giải quyết tranh chấp trên cơ sở cá nhân và từ bỏ quyền tham gia vụ kiện tập thể (class action) trong phạm vi luật cho phép.' ]
            ] },
            { num: '07', title: 'Điều khoản bổ sung', blocks: [
                [ 'p', '<strong>7.1 Miraheze.</strong> Đăng Nội Dung đồng nghĩa chấp nhận Terms of Use & Content Policy của Miraheze; yêu cầu kỹ thuật/pháp lý của Miraheze được ưu tiên trong phạm vi cần thiết để duy trì host.' ],
                [ 'p', '<strong>7.2 Ưu tiên giải thích.</strong> Mâu thuẫn nội bộ → Điều Khoản Nội Dung ưu tiên; quyền TG ra ngoài → MCL ưu tiên.' ],
                [ 'p', '<strong>7.3 Tách rời.</strong> Điều khoản vô hiệu không ảnh hưởng các điều khoản còn lại.' ],
                [ 'p', '<strong>7.4 Không từ bỏ quyền.</strong> Không thực thi một điều khoản không phải từ bỏ quyền thực thi sau này.' ],
                [ 'p', '<strong>7.5 Toàn bộ thỏa thuận.</strong> MCL + Điều Khoản Nội Dung + Điều Khoản Bản Quyền tạo thành toàn bộ thỏa thuận.' ],
                [ 'p', '<strong>7.6 Cập nhật.</strong> Nội Dung giữ phiên bản MCL đã đăng trừ khi TG chủ động chuyển; BQT thông báo trước ≥ 30 ngày.' ],
                [ 'p', '<strong>7.7 Ngôn ngữ.</strong> Bản tiếng Việt là bản gốc có hiệu lực pháp lý.' ],
                [ 'p', '<strong>7.8 Liên hệ.</strong> Qua kênh chính thức BQT, hoặc mapleofficialvn@gmail.com và maplewikiofficialvn@gmail.com.' ]
            ] }
        ],
        summary: {
            label: '► QUICK REFERENCE', title: 'Tóm tắt nhanh',
            note: 'Bảng dưới chỉ mang tính tham khảo — không thay thế văn bản đầy đủ.',
            headers: [ 'Hành động', 'Nền Tảng', 'Thành Viên', 'Bên Thứ Ba' ],
            rows: [
                [ 'Đọc & tham khảo', '✅', '✅', '✅' ],
                [ 'Lưu trữ & backup', '✅', '✕', '✕' ],
                [ 'Trích Dẫn Ngắn (ghi công)', '✅', '✅', '✕' ],
                [ 'Sửa lỗi nhỏ', '✅', '✅ (editor)', '✕' ],
                [ 'Sửa đổi nội dung sáng tạo', '✕', 'Cần xin phép TG', '✕' ],
                [ 'Đưa ra ngoài Wiki', '✕', '✕', 'Nếu TG cho phép' ],
                [ 'Dùng thương mại', '✕', '✕', 'Tùy thỏa thuận' ],
                [ 'Huấn luyện AI', '✕', '✕', '✕' ],
                [ 'Đổi license của TG', '✕', '✕', '✕' ],
                [ 'Xóa ghi công TG', '✕', '✕', '✕' ]
            ]
        },
        footer: { stamp: 'AUTHENTICATED // INTERNAL ASSET 2026', meta: [ 'MCL v1.0', 'M.A.P.L.E WIKI', 'Mọi thắc mắc → liên hệ BQT' ] }
    };

    /* ---------- M-SA 1.0 (else/M-SA 1.0.txt) ---------- */
    DOCS[ 'Dự án:Bản quyền/Giấy phép/M-SA 1.0' ] = {
        docId: 'DOC // M-SA-1.0 // LICENSE',
        title: 'M-<span class="mcl-accent">SA</span> 1.0',
        subtitle: 'M.A.P.L.E SHAREALIKE — 2025',
        bar: [ 'TYPE: SHAREALIKE', 'COMMERCIAL: 🚫' ],
        notice: 'Giấy phép M-SA 1.0 là văn bản pháp lý độc lập do M.A.P.L.E Wiki phát triển, <strong>không liên kết</strong> với Creative Commons Corporation. Mọi trách nhiệm pháp lý thuộc về người áp dụng và người sử dụng tác phẩm.',
        toc: [ 'Định nghĩa', 'Phạm vi cấp phép', 'Điều kiện sử dụng', 'Không ghi công', 'Miễn bảo hành', 'Chấm dứt', 'Luật áp dụng' ],
        articles: [
            { num: '01', title: 'Định nghĩa', blocks: [
                [ 'p', '<span class="mcl-def">Tác Giả</span> — Cá nhân/nhóm tạo Tác Phẩm gốc và áp dụng M-SA 1.0.' ],
                [ 'p', '<span class="mcl-def">Tác Phẩm</span> — Nội dung gốc cấp phép M-SA 1.0: văn bản, hình ảnh, dữ liệu, mô hình, prompt, output AI có biên tập, tài liệu liên quan AI do con người tạo/chỉnh sửa.' ],
                [ 'p', '<span class="mcl-def">Bản Phái Sinh</span> — Tác phẩm tạo ra bằng cách sửa đổi/chuyển thể/dịch/remix dựa trên phần đáng kể của Tác Phẩm gốc.' ],
                [ 'p', '<span class="mcl-def">Sử Dụng Thương Mại</span> — Dùng với mục đích chính là thu lợi tài chính.' ],
                [ 'p', '<span class="mcl-def">Nội Dung AI</span> — Tác phẩm liên quan đến tạo/huấn luyện/tinh chỉnh/sử dụng mô hình AI.' ],
                [ 'p', '<span class="mcl-def">Nhóm người đặc thù</span> — Ban Quản Trị, Admin, Lập trình viên của dự án M.A.P.L.E Wiki Việt Nam.' ]
            ] },
            { num: '02', title: 'Phạm vi cấp phép', blocks: [
                [ 'sub', '2.1 — Đối tượng áp dụng' ],
                [ 'p', 'M-SA 1.0 dành riêng cho <strong>Nội Dung AI</strong> và nội dung do nhóm người đặc thù viết (prompt, dataset, output AI biên tập, tài liệu hướng dẫn AI, điều khoản sử dụng, mã nguồn wiki…). Nội dung không liên quan AI và không thuộc nhóm đặc thù nên dùng CC hoặc MCL.' ],
                [ 'sub', '2.2 — Quyền được cấp' ],
                [ 'ul', [ 'Sao chép và Phân Phối Tác Phẩm', 'Tạo Bản Phái Sinh', 'Phân Phối Bản Phái Sinh' ] ],
                [ 'p', 'với điều kiện tuân thủ đầy đủ Điều 3.' ],
                [ 'sub', '2.3 — Giới hạn' ],
                [ 'ul', [ 'Không dùng cho bất kỳ mục đích thương mại nào', 'Không áp dụng biện pháp hạn chế quyền được cấp', 'Không tuyên bố Tác Giả gốc ủng hộ/bảo lãnh Bản Phái Sinh' ], true ]
            ] },
            { num: '03', title: 'Điều kiện sử dụng', blocks: [
                [ 'sub', '3.1 — ShareAlike' ],
                [ 'p', 'Khi Phân Phối Bản Phái Sinh, bạn <strong>bắt buộc</strong> áp dụng <strong>M BY-SA 1.0</strong> lên toàn bộ. Lý do nâng lên M BY-SA: Bản Phái Sinh có đóng góp của người mới cần được ghi nhận. Không được dùng giấy phép khác (kể cả CC BY-SA, MIT…) hay thêm điều kiện hạn chế.' ],
                [ 'sub', '3.2 — Không thương mại' ],
                [ 'p', 'Cả Tác Phẩm gốc lẫn mọi Bản Phái Sinh đều không được dùng thương mại (bán, dịch vụ thu phí, huấn luyện AI thương mại…). Điều kiện này <strong>kế thừa bắt buộc</strong> sang M BY-SA 1.0 và không thể gỡ bỏ.' ],
                [ 'sub', '3.3 — Toàn vẹn Tác Phẩm' ],
                [ 'p', 'Phải ghi rõ Tác Phẩm gốc đã được sửa đổi và mô tả ngắn gọn thay đổi; không trình bày gây nhầm lẫn rằng đây là Tác Phẩm gốc.' ]
            ] },
            { num: '04', title: 'Không ghi công', blocks: [
                [ 'p', 'M-SA 1.0 <strong>không yêu cầu ghi công Tác Giả</strong> gốc, trừ khi Tác Giả có yêu cầu riêng ghi kèm Tác Phẩm. Tuy nhiên, khi Bản Phái Sinh được Phân Phối dưới M BY-SA 1.0, giấy phép đó yêu cầu ghi công Người Remix.' ]
            ] },
            { num: '05', title: 'Miễn bảo hành & giới hạn trách nhiệm', blocks: [
                [ 'p', 'Tác Phẩm cấp phép "nguyên trạng" (as-is). Tác Giả không đảm bảo tính chính xác/an toàn/phù hợp, đặc biệt với Nội Dung AI vốn không xác định. Trong phạm vi luật cho phép, Tác Giả không chịu trách nhiệm với mọi thiệt hại phát sinh.' ]
            ] },
            { num: '06', title: 'Chấm dứt giấy phép', blocks: [
                [ 'p', 'Quyền tự động chấm dứt nếu vi phạm: Phân Phối Bản Phái Sinh dưới giấy phép khác M BY-SA 1.0 (vi phạm 3.1), dùng thương mại (vi phạm 3.2). Bên đã nhận hợp lệ trước khi vi phạm vẫn giữ quyền.' ]
            ] },
            { num: '07', title: 'Luật áp dụng', blocks: [
                [ 'p', 'Giải thích theo luật Hoa Kỳ, đặc biệt 17 U.S.C. (Copyright Act). Xung đột liên quan Nội Dung AI ưu tiên quy định về tác phẩm do con người tạo/biên tập đáng kể.' ]
            ] }
        ],
        summary: {
            label: '► QUICK REFERENCE', title: 'Tóm tắt nhanh', note: 'Tham khảo — không thay thế văn bản đầy đủ.',
            headers: [ 'Hành động', 'Được phép?' ],
            rows: [
                [ 'Sao chép & chia sẻ Tác Phẩm', '✅' ],
                [ 'Tạo Bản Phái Sinh', '✅ (phải dùng M BY-SA 1.0)' ],
                [ 'Dùng phi thương mại', '✅' ],
                [ 'Dùng thương mại', '🚫' ],
                [ 'Ghi công Tác Giả gốc', 'Không bắt buộc' ],
                [ 'Đổi giấy phép Bản Phái Sinh', '🚫 Bắt buộc M BY-SA 1.0' ],
                [ 'Huấn luyện AI thương mại', '🚫' ]
            ]
        },
        footer: { stamp: 'M-SA 1.0 // INTERNAL LICENSE', meta: [ 'M-SA 1.0', 'M.A.P.L.E WIKI', 'Không liên kết Creative Commons' ] }
    };

    /* ---------- M BY-SA 1.0 (else/M BY-SA 1.0.txt) ---------- */
    DOCS[ 'Dự án:Bản quyền/Giấy phép/M BY-SA 1.0' ] = {
        docId: 'DOC // M-BY-SA-1.0 // LICENSE',
        title: 'M <span class="mcl-accent">BY-SA</span> 1.0',
        subtitle: 'ATTRIBUTION-SHAREALIKE — 2025',
        bar: [ 'TYPE: BY-SA', 'COMMERCIAL: 🚫' ],
        notice: 'Giấy phép M BY-SA 1.0 là văn bản pháp lý độc lập do M.A.P.L.E Wiki phát triển, <strong>không liên kết</strong> với Creative Commons Corporation. ⚠️ Chỉ áp dụng được khi tác phẩm gốc mang giấy phép <strong>M-SA 1.0</strong> và đây là Bản Remix hợp lệ (Điều 3). Nếu là tác phẩm gốc tự tạo, <strong>không</strong> áp dụng giấy phép này.',
        toc: [ 'Nguồn gốc & quan hệ M-SA', 'Định nghĩa', 'Tiêu chuẩn Remix hợp lệ', 'Ghi công', 'Điều kiện phân phối', 'Miễn bảo hành', 'Chấm dứt', 'Luật áp dụng' ],
        articles: [
            { num: '01', title: 'Nguồn gốc & quan hệ với M-SA 1.0', blocks: [
                [ 'p', 'M BY-SA 1.0 <strong>chỉ được kích hoạt qua hành vi Remix hợp lệ</strong> từ Tác Phẩm gốc mang M-SA 1.0 — không áp dụng độc lập lên Tác Phẩm gốc.' ],
                [ 'code', 'Tác Phẩm gốc [M-SA 1.0]\n        ↓ Remix hợp lệ\nBản Phái Sinh [M BY-SA 1.0]\n        ↓ Remix hợp lệ tiếp theo\nBản Phái Sinh thế hệ 2 [M BY-SA 1.0]\n        ↓ (tiếp tục...)' ],
                [ 'p', 'Từ thế hệ Bản Phái Sinh thứ hai trở đi, giấy phép giữ nguyên M BY-SA 1.0 — không leo thang thêm.' ]
            ] },
            { num: '02', title: 'Định nghĩa', blocks: [
                [ 'p', '<span class="mcl-def">Tác Giả Gốc</span> — Người tạo Tác Phẩm gốc dưới M-SA 1.0.' ],
                [ 'p', '<span class="mcl-def">Người Remix</span> — Người thực hiện Remix hợp lệ và tạo Bản Phái Sinh; được ghi công chính.' ],
                [ 'p', '<span class="mcl-def">Bản Phái Sinh</span> — Tác phẩm từ Remix hợp lệ, khác biệt đáng kể về sáng tạo/kỹ thuật so với gốc.' ],
                [ 'p', '<span class="mcl-def">Remix</span> — Sửa đổi/chuyển thể/tái cấu trúc/bổ sung theo tiêu chuẩn Điều 3 (không phải mọi thay đổi đều hợp lệ).' ]
            ] },
            { num: '03', title: 'Tiêu chuẩn Remix hợp lệ', blocks: [
                [ 'p', 'Điều khoản quan trọng nhất. M BY-SA 1.0 chỉ kích hoạt khi Remix đáp ứng <strong>ít nhất một</strong> tiêu chuẩn:' ],
                [ 'sub', '3.1 — Tiêu chuẩn kỹ thuật (dữ liệu & AI)' ],
                [ 'ul', [ 'Bổ sung/làm sạch tối thiểu <strong>20%</strong> tổng lượng dữ liệu (entries/dòng/token)',
                    'Fine-tuning mô hình khiến output thay đổi đáng kể', 'Tái cấu trúc kiến trúc ảnh hưởng kết quả hoạt động' ] ],
                [ 'sub', '3.2 — Tiêu chuẩn sáng tạo (văn bản/hình ảnh/tài liệu)' ],
                [ 'ul', [ 'Chuyển thể có chiều sâu (định dạng/thể loại/ngôn ngữ mới + diễn giải/bổ sung)',
                    'Tích hợp sáng tạo tạo giá trị độc lập', 'Biên tập có hệ thống thay đổi đáng kể ý nghĩa/phạm vi' ] ],
                [ 'sub', '3.3 — KHÔNG được coi là Remix hợp lệ' ],
                [ 'ul', [ 'Sao chép nguyên bản phần lớn Tác Phẩm gốc', 'Đổi định dạng file không biên tập (.csv → .json)',
                    'Sửa lỗi chính tả/kỹ thuật nhỏ, chuẩn hóa ký tự', 'Thêm metadata/tag không đổi nội dung',
                    'Bổ sung dữ liệu < 20%', 'Đổi giao diện trình bày không đổi nội dung thực chất' ], true ],
                [ 'sub', '3.4 — Tranh chấp tính hợp lệ' ],
                [ 'p', 'Nghĩa vụ chứng minh thuộc về <strong>người tuyên bố Remix</strong>. BQT/bên thứ ba độc lập có thể tham gia đánh giá trong cộng đồng.' ]
            ] },
            { num: '04', title: 'Ghi công (Attribution)', blocks: [
                [ 'p', 'M BY-SA 1.0 yêu cầu ghi công <strong>Người Remix</strong> (người tạo Bản Phái Sinh). Tác Giả Gốc của M-SA 1.0 không bắt buộc được ghi công trừ khi có yêu cầu riêng.' ],
                [ 'p', 'Hình thức ghi công gồm: tên/định danh Người Remix; mô tả ngắn bản chất Remix; link tham chiếu Bản Phái Sinh gốc (nếu có); tuyên bố rõ cấp phép theo M BY-SA 1.0. Không ghi công theo cách ngụ ý được Tác Giả Gốc/Wiki bảo lãnh.' ]
            ] },
            { num: '05', title: 'Điều kiện phân phối Bản Phái Sinh', blocks: [
                [ 'sub', '5.1 — ShareAlike' ],
                [ 'p', 'Bản Phái Sinh của Bản Phái Sinh (Remix hợp lệ tiếp theo) phải cấp phép <strong>M BY-SA 1.0</strong> — chuỗi ShareAlike ổn định từ thế hệ thứ hai.' ],
                [ 'sub', '5.2 — Không thương mại (kế thừa)' ],
                [ 'p', 'Điều kiện phi thương mại kế thừa từ M-SA 1.0 và <strong>không thể gỡ bỏ</strong> ở mọi thế hệ: cấm bán, tích hợp dịch vụ thu phí, huấn luyện AI thương mại, mọi hình thức kiếm lợi trực tiếp.' ],
                [ 'sub', '5.3 — Toàn vẹn & minh bạch' ],
                [ 'p', 'Ghi rõ đây là Bản Phái Sinh; mô tả thay đổi so với phiên bản tiếp nhận; không áp dụng biện pháp hạn chế quyền M BY-SA 1.0 cấp.' ]
            ] },
            { num: '06', title: 'Miễn bảo hành & giới hạn trách nhiệm', blocks: [
                [ 'p', 'Bản Phái Sinh cấp phép "nguyên trạng". Cả Tác Giả Gốc lẫn Người Remix không chịu trách nhiệm với thiệt hại phát sinh, trong phạm vi luật cho phép.' ]
            ] },
            { num: '07', title: 'Chấm dứt giấy phép', blocks: [
                [ 'p', 'Quyền tự động chấm dứt khi vi phạm: không ghi công Người Remix (Điều 4), đổi giấy phép thế hệ tiếp (5.1), dùng thương mại (5.2), hoặc tuyên bố sai một hành vi là Remix (Điều 3). Bên đã nhận hợp lệ trước vi phạm vẫn giữ quyền.' ]
            ] },
            { num: '08', title: 'Luật áp dụng', blocks: [
                [ 'p', 'Giải thích theo luật Hoa Kỳ, đặc biệt 17 U.S.C. Tranh chấp liên quan Nội Dung AI xét theo tiền lệ hiện hành về quyền tác giả với tác phẩm có sự tham gia của AI.' ]
            ] }
        ],
        summary: {
            label: '► QUICK REFERENCE', title: 'Tóm tắt nhanh', note: 'Tham khảo — không thay thế văn bản đầy đủ.',
            headers: [ 'Hành động', 'Được phép?' ],
            rows: [
                [ 'Sao chép & chia sẻ Bản Phái Sinh', '✅' ],
                [ 'Remix tiếp (M BY-SA 1.0, hợp lệ)', '✅' ],
                [ 'Dùng phi thương mại', '✅' ],
                [ 'Dùng thương mại', '🚫 Kế thừa từ M-SA 1.0' ],
                [ 'Ghi công Người Remix', '✅ Bắt buộc' ],
                [ 'Ghi công Tác Giả Gốc', 'Không bắt buộc' ],
                [ 'Đổi giấy phép thế hệ sau', '🚫 Bắt buộc M BY-SA 1.0' ],
                [ 'Thay đổi <20% rồi tuyên bố Remix', '🚫 Không hợp lệ' ]
            ]
        },
        footer: { stamp: 'M BY-SA 1.0 // DERIVATIVE LICENSE', meta: [ 'M BY-SA 1.0', 'M.A.P.L.E WIKI', 'Chỉ kích hoạt từ M-SA 1.0' ] }
    };

    /* ---------- Điều khoản bản quyền v4.0 (else/điểukhoản2.txt) ---------- */
    DOCS[ 'Dự án:Bản quyền' ] = {
        docId: 'DOC // COPYRIGHT-POLICY // V4.0',
        title: 'ĐIỀU KHOẢN <span class="mcl-accent">BẢN QUYỀN</span>',
        subtitle: 'COPYRIGHT & LICENSING POLICY V4.0 — 2026',
        bar: [ 'DEFAULT: CC BY-SA 4.0', 'DMCA: COMPLIANT' ],
        notice: 'M.A.P.L.E là wiki cộng đồng — nội dung mang tính <strong>mở và cộng tác</strong>. Khi đăng bài, bạn tự động chấp nhận một giấy phép tùy loại nội dung. <strong>Giấy phép mặc định: CC BY-SA 4.0</strong>. Đọc kỹ trước khi đăng — bài đã publish có thể bị sao chép/sửa/tái sử dụng theo giấy phép tương ứng.',
        toc: [ 'Giấy phép nội dung', 'Quyền của Nền Tảng & Thành Viên', 'Nội dung bản quyền nguồn ngoài', 'Quyền tác giả sau khi đăng', 'DMCA & khiếu nại' ],
        articles: [
            { num: '01', title: 'Giấy phép nội dung trên Wiki', blocks: [
                [ 'sub', '1.1 — Nhóm Creative Commons (CC)' ],
                [ 'table', [ 'Giấy phép', 'Sao chép', 'Ghi công', 'Phái sinh', 'Thương mại' ], [
                    [ 'CC BY 4.0', '✅', 'Bắt buộc', 'Tự do', '✅' ],
                    [ 'CC BY-SA 4.0', '✅', 'Bắt buộc', 'Cùng giấy phép', '✅' ],
                    [ 'CC BY-ND 4.0', '✅ Nguyên bản', 'Bắt buộc', '🚫 Không sửa', '✅' ],
                    [ 'CC BY-NC 4.0', '✅', 'Bắt buộc', 'Tự do', '🚫' ],
                    [ 'CC BY-NC-SA 4.0', '✅', 'Bắt buộc', 'Cùng giấy phép', '🚫' ],
                    [ 'CC BY-NC-ND 4.0', '✅ Nguyên bản', 'Bắt buộc', '🚫', '🚫' ],
                    [ 'CC0 (Public Domain)', '✅ Tự do', '—', '✅', '✅' ]
                ] ],
                [ 'p', '<strong>CC BY-SA</strong> là giấy phép của Wikipedia và là <strong>mặc định của M.A.P.L.E</strong>. <strong>CC0</strong> ≈ Public Domain, tự do tuyệt đối.' ],
                [ 'sub', '1.2 — Nhóm giấy phép M.A.P.L.E (nội bộ)' ],
                [ 'note', 'Các giấy phép này là văn bản pháp lý độc lập do M.A.P.L.E Wiki phát triển, không liên kết Creative Commons.' ],
                [ 'table', [ 'Giấy phép', 'Sao chép', 'Ghi công', 'Phái sinh', 'Thương mại' ], [
                    [ 'M-SA 1.0', '✅', '—', '→ M BY-SA 1.0', '🚫' ],
                    [ 'M BY-SA 1.0', '✅', 'Ghi Người Remix', 'Cùng giấy phép', '🚫' ],
                    [ 'MCL', '🚫 ngoài Wiki', '✅', 'Trong Wiki (xin phép)', '🚫' ]
                ] ],
                [ 'p', 'Xem chi tiết: <a href="/wiki/D%E1%BB%B1_%C3%A1n:B%E1%BA%A3n_quy%E1%BB%81n/Gi%E1%BA%A5y_ph%C3%A9p/M-SA_1.0">M-SA 1.0</a> · <a href="/wiki/D%E1%BB%B1_%C3%A1n:B%E1%BA%A3n_quy%E1%BB%81n/Gi%E1%BA%A5y_ph%C3%A9p/M_BY-SA_1.0">M BY-SA 1.0</a> · <a href="/wiki/D%E1%BB%B1_%C3%A1n:B%E1%BA%A3n_quy%E1%BB%81n/Gi%E1%BA%A5y_ph%C3%A9p/MCLv1">MCL</a>.' ],
                [ 'sub', '1.3 — Giấy phép đặc biệt khác' ],
                [ 'p', '<strong>All Rights Reserved (ARR)</strong> — không tương thích tinh thần mở; BQT có thể từ chối. <strong>Dual License</strong> — cấp phép khác nhau cho Wiki và bên ngoài, phải ghi rõ và được BQT chấp thuận.' ]
            ] },
            { num: '02', title: 'Quyền của Nền Tảng & Thành Viên', blocks: [
                [ 'sub', '2.1 — Quyền của M.A.P.L.E (nền tảng)' ],
                [ 'table', [ 'Hành động', 'CC BY', 'CC BY-SA', 'CC BY-NC*', 'CC0', 'M-SA', 'M BY-SA', 'MCL' ], [
                    [ 'Lưu trữ & hiển thị', '✅', '✅', '✅', '✅', '✅', '✅', '✅' ],
                    [ 'Dùng thương mại', '✅', '✅', '🚫', '✅', '🚫', '🚫', '🚫' ],
                    [ 'Chia sẻ ra ngoài Wiki', '✅', '✅', '✅', '✅', '✅', '✅', '🚫' ],
                    [ 'Xoá theo yêu cầu TG', '✅', '✅', '✅', '🚫**', '✅', '✅', '✅' ]
                ] ],
                [ 'p', '*nhóm NC/ND tương tự. **CC0: sau khi từ bỏ quyền, không thể yêu cầu xoá bản sao đã tạo.' ],
                [ 'sub', '2.2 — Quyền của thành viên khác' ],
                [ 'table', [ 'Hành động', 'CC BY-SA', 'CC BY-ND', 'CC0', 'M-SA', 'M BY-SA', 'MCL' ], [
                    [ 'Đọc & tham khảo', '✅', '✅', '✅', '✅', '✅', '✅' ],
                    [ 'Sửa đổi trong Wiki', '✅', '🚫', '✅', '✅', '✅', '✅ (nội bộ)' ],
                    [ 'Dùng ngoài (thương mại)', '✅', '✅', '✅', '🚫', '🚫', '🚫' ],
                    [ 'Bỏ tên TG / Người Remix', '🚫', '🚫', '✅', '✅ (gốc)', '🚫', '🚫' ]
                ] ]
            ] },
            { num: '03', title: 'Nội dung bản quyền từ nguồn ngoài', blocks: [
                [ 'p', '<strong>3.1 Cấm</strong> đăng nội dung đang có bản quyền của bên thứ ba khi chưa xin phép (văn bản từ sách/báo, artwork/ảnh người khác, nội dung wiki khác, nhân vật/lore thương mại, nhạc/video).' ],
                [ 'p', '<strong>3.2</strong> Nội dung giấy phép mở tương thích CC BY-SA (Wikipedia, Wikimedia Commons) được dùng nếu ghi rõ nguồn/tác giả/giấy phép. Không lấy CC BY-ND / BY-NC-ND rồi sửa.' ],
                [ 'p', '<strong>3.3 Fair Use</strong> — trích dẫn ngắn để phân tích/bình luận, ghi nguồn, không chiếm phần lớn bài. Nghi ngờ → hỏi BQT.' ],
                [ 'p', '<strong>3.4 Ảnh AI</strong> — được dùng, bắt buộc ghi chú "AI-generated image"; không tái tạo phong cách một nghệ sĩ cụ thể gây nhầm lẫn nguồn gốc.' ],
                [ 'p', '<strong>3.5 Hậu quả</strong> — BQT có quyền xoá bài vi phạm không báo trước, có thể Strike tài khoản; nhận DMCA Takedown → gỡ ngay.' ]
            ] },
            { num: '04', title: 'Quyền tác giả sau khi đăng bài', blocks: [
                [ 'p', 'Dù chọn giấy phép nào, <strong>bạn vẫn là tác giả gốc</strong> — M.A.P.L.E không lấy quyền sở hữu.' ],
                [ 'p', '<strong>M.A.P.L.E không bao giờ được:</strong> bán nội dung cho bên thứ ba; xoá ghi công (trừ CC0/M-SA); dùng thương mại cho nền tảng (trừ khi bạn cho phép); đổi giấy phép bài bạn mà không có đồng ý.' ],
                [ 'p', '<strong>Bạn có quyền:</strong> yêu cầu xoá bài bất kỳ lúc nào (trừ CC0); đổi giấy phép bài cũ qua BQT; đăng cùng nội dung nơi khác với điều kiện khác (trừ MCL có ràng buộc riêng).' ]
            ] },
            { num: '05', title: 'DMCA & khiếu nại bản quyền', blocks: [
                [ 'p', 'M.A.P.L.E tuân thủ <strong>DMCA</strong>. Chủ sở hữu bản quyền phát hiện vi phạm → liên hệ BQT kèm: mô tả tác phẩm bị vi phạm, link nội dung vi phạm, bằng chứng sở hữu. BQT xử lý trong <strong>72 giờ</strong>. Bị gỡ nhầm → kháng cáo với BQT kèm bằng chứng.' ],
                [ 'note', 'Điều khoản có thể cập nhật khi luật/chính sách thay đổi. Tiếp tục dùng Wiki sau cập nhật = đồng ý phiên bản mới.' ]
            ] }
        ],
        footer: { stamp: 'COPYRIGHT POLICY // V4.0 // 2026', meta: [ 'v4.0', 'M.A.P.L.E WIKI', 'Mọi thắc mắc → liên hệ BQT' ] }
    };

    /* ---------- ĐIỀU KHOẢN NỘI DUNG v4.0 (else/điềukhoan.txt) ---------- */
    DOCS[ 'Dự án:Điều khoản' ] = {
        docId: 'DOC // CONTENT-TOS // V4.0',
        title: 'ĐIỀU KHOẢN <span class="mcl-accent">NỘI DUNG</span>',
        subtitle: 'CONTENT TERMS OF SERVICE V4.0 — 2026',
        bar: [ 'STATUS: ACTIVE', '3-STRIKE SYSTEM' ],
        notice: 'Tài liệu này quy định tiêu chuẩn <strong>nội dung</strong> trên M.A.P.L.E Wiki — áp dụng cho mọi Writer đóng góp bài viết. Khác với <a href="/wiki/D%E1%BB%B1_%C3%A1n:%C4%90i%E1%BB%81u_kho%E1%BA%A3n_ng%C6%B0%E1%BB%9Di_d%C3%B9ng">Điều khoản Người Dùng</a> (ứng xử cộng đồng) và <a href="/wiki/D%E1%BB%B1_%C3%A1n:B%E1%BA%A3n_quy%E1%BB%81n">Điều khoản Bản quyền</a> (giấy phép), tài liệu này tập trung vào <strong>chất lượng sáng tác, phân loại, ranh giới pháp lý và hệ thống vi phạm nội dung</strong>.',
        toc: [ 'Chất lượng & nguyên bản', 'Phân loại nội dung', 'Ranh giới pháp lý & đạo đức', 'Bản quyền & tài sản', 'Hệ thống xử lý vi phạm', 'Quyền hạn BQT' ],
        articles: [
            { num: '01', title: 'Chất lượng và tính nguyên bản', blocks: [
                [ 'p', '<strong>1.1 Bài phải là của bạn.</strong> M.A.P.L.E không phải bãi rác copy-paste. Cấm chép từ SCP Foundation, Backrooms Wiki, hay bất kỳ nguồn nào khác. Lấy ≥50% nội dung/cấu trúc/ý chính từ nguồn khác mà không khai báo = vi phạm. Tham khảo rồi viết lại bằng lời của mình → hoàn toàn OK.' ],
                [ 'p', '<strong>1.2 Giới hạn sử dụng AI.</strong> AI sinh ra ≥60% nội dung chính (text, ý tưởng cốt lõi) = vi phạm. Được phép dùng AI để: sửa lỗi chính tả, cải thiện văn phong, brainstorm ý tưởng (nhưng phải tự viết lại), tạo ảnh minh họa (ghi chú "AI-generated"), viết code CSS/JS hỗ trợ bài. Không được phép: để AI viết thay toàn bộ nội dung lore, nhân vật, dialog.' ],
                [ 'p', '<strong>1.3 Không phá lore cốt lõi.</strong> M.A.P.L.E tôn trọng sáng tạo tự do, nhưng nếu muốn thay đổi khái niệm nền tảng (định nghĩa thực thể, khu vực, cơ chế chính của The Maze) → liên hệ BQT xin phép trước. Tự ý thay đổi = bài bị xoá, không cảnh báo.' ],
                [ 'p', '<strong>1.4 Chất lượng tối thiểu.</strong> Bài quá sơ sài (stub không có kế hoạch phát triển), spam nội dung vô nghĩa, hoặc vandalism = bị từ chối/xoá qua hàng chờ kiểm duyệt.' ]
            ] },
            { num: '02', title: 'Phân loại nội dung', blocks: [
                [ 'sub', '2.1 — Dùng đúng rating' ],
                [ 'table', [ 'Rating', 'Nội dung cho phép' ], [
                    [ '13+', 'An toàn, bạo lực nhẹ, không tình dục' ],
                    [ '16+', 'Bạo lực trung bình, yếu tố trưởng thành nhẹ' ],
                    [ '18+', 'Bạo lực nặng, tình dục, trauma nặng, self-harm reference' ]
                ] ],
                [ 'p', 'Phân loại sai = Warning. BQT có quyền điều chỉnh rating nếu đánh giá mức hiện tại chưa phù hợp với nội dung thực tế.' ],
                [ 'sub', '2.2 — Nội dung kinh dị và gore' ],
                [ 'p', 'Được chấp nhận nếu có ý nghĩa với cốt truyện hoặc nhân vật — đây là wiki kinh dị, gore là một phần của thể loại. Mô tả bạo lực chỉ để "gây sốc" mà không có mục đích tường thuật = bị xoá. Bài có gore nặng bắt buộc rating 18+ và cảnh báo rõ ràng.' ],
                [ 'sub', '2.3 — Nội dung 18+ và tình dục' ],
                [ 'p', 'Được phép nếu đặt sau lớp bảo vệ (Ảnh Bảo Mật / phân loại 18+). Không được xuất hiện ở đầu bài hoặc phần tóm tắt hiển thị công khai.' ],
                [ 'sub', '2.4 — Cảnh báo nội dung (Content Warning)' ],
                [ 'p', 'Bắt buộc với: trauma nặng, self-harm, tự tử, lạm dụng, phân biệt đối xử trong lore. Dùng bản mẫu Phân Loại chuẩn — không tự ý viết cảnh báo kiểu khác.' ]
            ] },
            { num: '03', title: 'Ranh giới pháp lý và đạo đức', blocks: [
                [ 'p', '<strong>3.1 Không chính trị/tôn giáo thực.</strong> Cấm dùng Wiki để cổ xuý quan điểm chính trị/tôn giáo thực tế, hoặc tạo xung đột có chủ ý dựa trên chúng. Thế giới hư cấu có hệ thống chính trị/tôn giáo riêng → hoàn toàn OK, miễn là không nhắm vào thực tế.' ],
                [ 'p', '<strong>3.2 Không cổ xuý tội ác thực.</strong> Cấm nội dung khuyến khích hoặc hướng dẫn chi tiết có thể áp dụng thực tế: khủng bố, tự tử, bạo lực có tổ chức… Mô tả tội ác trong lore hư cấu → OK nếu không phải hướng dẫn thực hành. Vi phạm = TERMINATION ngay lập tức.' ],
                [ 'p', '<strong>3.3 Tuyệt đối cấm nội dung xâm hại trẻ em (CSAM).</strong> Mọi nội dung mô tả, gợi ý hoặc cổ xuý hành vi tình dục hoặc bạo lực nhắm vào người dưới 18 tuổi — dù là hư cấu. Vi phạm = TERMINATION ngay + báo cáo cơ quan có thẩm quyền. <strong>Không có quy trình kháng cáo cho vi phạm này.</strong>' ],
                [ 'p', '<strong>3.4 Tuân thủ pháp luật Hoa Kỳ.</strong> Wiki hoạt động trên hạ tầng Miraheze (Hoa Kỳ). Nội dung vi phạm DMCA, CSAM laws hoặc các quy định liên bang liên quan = bị xoá ngay và có thể bị báo cáo cơ quan chức năng.' ]
            ] },
            { num: '04', title: 'Bản quyền và tài sản', blocks: [
                [ 'p', '<strong>4.1 Không sao chép có bản quyền.</strong> Cấm đăng văn bản, nhân vật, artwork, lore từ tác phẩm có bản quyền (sách, truyện, wiki khác, game, phim) mà không có quyền sử dụng hợp lệ.' ],
                [ 'p', '<strong>4.2 Quyền của tác giả.</strong> Bài đăng lên Wiki vẫn là tài sản tinh thần của bạn. M.A.P.L.E có quyền lưu trữ, hiển thị và backup nội dung, nhưng không dùng cho mục đích thương mại. Xem chi tiết về giấy phép tại <a href="/wiki/D%E1%BB%B1_%C3%A1n:B%E1%BA%A3n_quy%E1%BB%81n">Điều khoản Bản quyền</a>.' ],
                [ 'p', '<strong>4.3 Không sửa bài người khác.</strong> Sửa nội dung có ý nghĩa (>20% bài) mà chưa xin phép tác giả = Warning. Ngoại lệ được phép không cần xin trước: sửa lỗi chính tả nhỏ, link hỏng, CSS — sau đó thông báo tác giả.' ]
            ] },
            { num: '05', title: 'Hệ thống xử lý vi phạm nội dung', blocks: [
                [ 'sub', 'Strike 1 — Warning' ],
                [ 'p', 'Đình chỉ đăng bài 3 ngày. Bài vi phạm bị ẩn để sửa lại. VD: phân loại rating sai, sửa bài người khác, stub quá sơ sài nộp lên hàng chờ.' ],
                [ 'sub', 'Strike 2 — Isolation (14 ngày)' ],
                [ 'p', 'Cấm toàn bộ hoạt động (đăng bài, chỉnh sửa). Bài cũ vẫn hiển thị. VD: tái phạm Strike 1, copy-paste một phần có khai báo không đầy đủ, AI-assisted quá mức.' ],
                [ 'sub', 'Strike 3 — Termination' ],
                [ 'p', 'Khoá vĩnh viễn + Blacklist. Bài bị ẩn hoặc xoá tuỳ nội dung. VD: copy-paste rõ ràng, AI viết bài, cổ xuý tội ác, CSAM.' ],
                [ 'note', 'Xoá vĩnh viễn chỉ khi: đạo văn hoặc copy rõ ràng không thể sửa; vi phạm Điều 3.2–3.3; có yêu cầu pháp lý (DMCA takedown); spam/vandalism/hack. Lỗi khác → bài chỉ bị ẩn đến khi sửa xong. Kháng cáo: gửi BQT trong 7 ngày kể từ quyết định, kèm lý do và bằng chứng. Xem <a href="/wiki/D%E1%BB%B1_%C3%A1n:Kh%C3%A1ng_c%C3%A1o">Dự án:Kháng cáo</a>.' ]
            ] },
            { num: '06', title: 'Quyền hạn BQT', blocks: [
                [ 'p', '<strong>6.1</strong> BQT có quyền yêu cầu tác giả chỉnh sửa nếu bài có vấn đề về trình bày, phân loại sai hoặc cấu trúc lộn xộn. Tác giả có 7 ngày để sửa — quá hạn thì bài bị ẩn cho đến khi hoàn thiện.' ],
                [ 'p', '<strong>6.2</strong> BQT có quyền điều chỉnh rating, thêm/sửa cảnh báo nội dung, hoặc di chuyển bài sang namespace phù hợp mà không cần xin phép tác giả — sau đó sẽ thông báo.' ],
                [ 'p', '<strong>6.3</strong> Quyết định của BQT sau khi xem xét kháng cáo hợp lệ là quyết định cuối cùng trong phạm vi Wiki.' ]
            ] }
        ],
        footer: { stamp: 'CONTENT ToS // V4.0 // 2026', meta: [ 'v4.0', 'M.A.P.L.E WIKI', 'Tài liệu dành cho Writer — nội dung & sáng tác' ] }
    };

    /* ---------- Nội dung chuẩn Creative Commons Commons Deed (tiếng Việt, theo deed.vi) ---------- */
    var CC_FREE_SHARE = '<strong>Chia sẻ</strong> — sao chép và phân phối lại tài liệu dưới mọi phương tiện hoặc định dạng.';
    var CC_FREE_ADAPT = '<strong>Phỏng theo</strong> — pha trộn, biến đổi và xây dựng dựa trên tài liệu.';
    var CC_PURPOSE_COM = 'Áp dụng cho <strong>bất kỳ mục đích nào, kể cả mục đích thương mại</strong>.';
    var CC_PURPOSE_NC  = 'Áp dụng cho <strong>bất kỳ mục đích phi thương mại nào</strong>.';
    var CC_IRREVOCABLE = 'Người cấp phép không thể thu hồi những quyền tự do này miễn là bạn tuân thủ các điều khoản của giấy phép.';
    var CC_T_BY = '<strong>Ghi công</strong> — Bạn phải ghi công thích hợp, cung cấp liên kết đến giấy phép, và cho biết nếu có thay đổi. Bạn có thể làm điều đó theo bất kỳ cách hợp lý nào, nhưng không theo cách gợi ý rằng người cấp phép tán thành bạn hoặc cách bạn sử dụng.';
    var CC_T_SA = '<strong>Chia sẻ tương tự</strong> — Nếu bạn pha trộn, biến đổi hoặc xây dựng dựa trên tài liệu, bạn phải phân phối phần đóng góp của mình theo cùng giấy phép như bản gốc.';
    var CC_T_NC = '<strong>Phi thương mại</strong> — Bạn không được sử dụng tài liệu cho mục đích thương mại.';
    var CC_T_ND = '<strong>Không có sản phẩm phái sinh</strong> — Nếu bạn pha trộn, biến đổi hoặc xây dựng dựa trên tài liệu, bạn không được phân phối tài liệu đã chỉnh sửa.';
    var CC_T_NOADD = '<strong>Không có thêm hạn chế</strong> — Bạn không được áp dụng các điều khoản pháp lý hoặc biện pháp công nghệ ngăn cản người khác làm bất cứ điều gì giấy phép cho phép.';
    var CC_N_PD = 'Bạn không bắt buộc tuân thủ giấy phép đối với những thành phần của tài liệu thuộc phạm vi công cộng, hoặc khi việc sử dụng của bạn được cho phép bởi một ngoại lệ / giới hạn hiện hành.';
    var CC_N_NW = 'Không có bảo đảm nào được đưa ra. Giấy phép có thể không trao cho bạn tất cả các quyền cần thiết cho mục đích sử dụng. Ví dụ, các quyền khác như công khai hình ảnh, quyền riêng tư hoặc quyền nhân thân có thể giới hạn cách bạn sử dụng tài liệu.';

    /* ---------- Helper: trang giấy phép Creative Commons (deed đầy đủ + nút bản gốc) ---------- */
    function ccDoc( o ) {
        var free = [ CC_FREE_SHARE ];
        if ( o.adapt !== false ) free.push( CC_FREE_ADAPT );
        return {
            docId: 'DOC // ' + o.code + ' // CREATIVE COMMONS',
            title: o.title, subtitle: o.subtitle, bar: o.bar,
            source: { url: o.source, label: 'creativecommons.org' },
            notice: 'Đây là bản trình bày lại phần <em>tóm tắt dễ đọc</em> (Commons Deed) của giấy phép <strong>' + o.full +
                '</strong> theo phong cách M.A.P.L.E — bản thân Deed <strong>không phải</strong> văn bản pháp lý. ' +
                'Toàn văn pháp lý (Legal Code) do Creative Commons phát hành, nằm tại creativecommons.org — bấm ' +
                '<em>“Xem bản gốc”</em> bên dưới.',
            toc: [ 'Bạn được tự do', 'Theo các điều khoản sau', 'Lưu ý', 'Tóm tắt nhanh' ],
            articles: [
                { num: '01', title: 'Bạn được tự do', blocks: [
                    [ 'ul', free ],
                    [ 'p', ( o.commercial === false ? CC_PURPOSE_NC : CC_PURPOSE_COM ) ],
                    [ 'note', CC_IRREVOCABLE ]
                ] },
                { num: '02', title: 'Theo các điều khoản sau', blocks: [ [ 'ul', o.terms ] ] },
                { num: '03', title: 'Lưu ý', blocks: [ [ 'ul', [ CC_N_PD, CC_N_NW ] ] ] }
            ],
            summary: { label: '► QUICK REFERENCE', title: 'Tóm tắt nhanh', note: 'Tham khảo — bản gốc tại creativecommons.org.',
                headers: [ 'Hành động', 'Được phép?' ], rows: o.rows },
            footer: { stamp: o.code + ' // CREATIVE COMMONS', meta: [ o.full, 'Creative Commons', 'Bản gốc: creativecommons.org' ] }
        };
    }

    DOCS[ 'Dự án:Bản quyền/Giấy phép/CC BY-SA 4.0' ] = ccDoc( {
        code: 'CC-BY-SA-4.0', title: 'CC <span class="mcl-accent">BY-SA</span> 4.0', subtitle: 'ATTRIBUTION-SHAREALIKE 4.0 INTERNATIONAL',
        bar: [ 'COMMERCIAL: ✅', 'SHAREALIKE' ], full: 'CC BY-SA 4.0', source: 'https://creativecommons.org/licenses/by-sa/4.0/deed.vi',
        adapt: true, commercial: true, terms: [ CC_T_BY, CC_T_SA, CC_T_NOADD ],
        rows: [ [ 'Sao chép & chia sẻ', '✅' ], [ 'Tạo bản phái sinh', '✅ (cùng CC BY-SA)' ], [ 'Dùng thương mại', '✅' ], [ 'Ghi công tác giả', '✅ Bắt buộc' ], [ 'Đổi sang giấy phép khác', '🚫' ] ]
    } );
    DOCS[ 'Dự án:Bản quyền/Giấy phép/CC BY 4.0' ] = ccDoc( {
        code: 'CC-BY-4.0', title: 'CC <span class="mcl-accent">BY</span> 4.0', subtitle: 'ATTRIBUTION 4.0 INTERNATIONAL',
        bar: [ 'COMMERCIAL: ✅', 'PHÁI SINH TỰ DO' ], full: 'CC BY 4.0', source: 'https://creativecommons.org/licenses/by/4.0/deed.vi',
        adapt: true, commercial: true, terms: [ CC_T_BY, CC_T_NOADD ],
        rows: [ [ 'Sao chép & chia sẻ', '✅' ], [ 'Tạo bản phái sinh', '✅ (giấy phép tuỳ chọn)' ], [ 'Dùng thương mại', '✅' ], [ 'Ghi công tác giả', '✅ Bắt buộc' ] ]
    } );
    DOCS[ 'Dự án:Bản quyền/Giấy phép/CC BY-NC-SA 4.0' ] = ccDoc( {
        code: 'CC-BY-NC-SA-4.0', title: 'CC <span class="mcl-accent">BY-NC-SA</span> 4.0', subtitle: 'ATTRIBUTION-NONCOMMERCIAL-SHAREALIKE 4.0',
        bar: [ 'COMMERCIAL: 🚫', 'SHAREALIKE' ], full: 'CC BY-NC-SA 4.0', source: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.vi',
        adapt: true, commercial: false, terms: [ CC_T_BY, CC_T_NC, CC_T_SA, CC_T_NOADD ],
        rows: [ [ 'Sao chép & chia sẻ', '✅' ], [ 'Tạo bản phái sinh', '✅ (cùng giấy phép)' ], [ 'Dùng thương mại', '🚫' ], [ 'Ghi công tác giả', '✅ Bắt buộc' ] ]
    } );
    DOCS[ 'Dự án:Bản quyền/Giấy phép/CC BY-ND 4.0' ] = ccDoc( {
        code: 'CC-BY-ND-4.0', title: 'CC <span class="mcl-accent">BY-ND</span> 4.0', subtitle: 'ATTRIBUTION-NODERIVATIVES 4.0',
        bar: [ 'COMMERCIAL: ✅', 'KHÔNG PHÁI SINH' ], full: 'CC BY-ND 4.0', source: 'https://creativecommons.org/licenses/by-nd/4.0/deed.vi',
        adapt: false, commercial: true, terms: [ CC_T_BY, CC_T_ND, CC_T_NOADD ],
        rows: [ [ 'Sao chép & chia sẻ (nguyên bản)', '✅' ], [ 'Tạo & phát hành bản phái sinh', '🚫' ], [ 'Dùng thương mại', '✅' ], [ 'Ghi công tác giả', '✅ Bắt buộc' ] ]
    } );
    DOCS[ 'Dự án:Bản quyền/Giấy phép/CC0 1.0' ] = {
        docId: 'DOC // CC0-1.0 // CREATIVE COMMONS',
        title: 'CC<span class="mcl-accent">0</span> 1.0', subtitle: 'CC0 1.0 UNIVERSAL — HIẾN TẶNG PHẠM VI CÔNG CỘNG',
        bar: [ 'PUBLIC DOMAIN', 'NO RIGHTS RESERVED' ],
        source: { url: 'https://creativecommons.org/publicdomain/zero/1.0/deed.vi', label: 'creativecommons.org' },
        notice: 'Đây là bản trình bày lại phần <em>tóm tắt dễ đọc</em> (Commons Deed) của <strong>CC0 1.0 Universal</strong> ' +
            'theo phong cách M.A.P.L.E — không phải văn bản pháp lý. Toàn văn pháp lý do Creative Commons phát hành tại ' +
            'creativecommons.org (bấm “Xem bản gốc”).',
        toc: [ 'Không bảo lưu quyền', 'Bạn được tự do', 'Lưu ý' ],
        articles: [
            { num: '01', title: 'Không bảo lưu quyền nào', blocks: [
                [ 'p', 'Người đã gắn tác phẩm với văn bản này đã <strong>hiến tặng tác phẩm vào phạm vi công cộng</strong> ' +
                    'bằng cách từ bỏ mọi quyền của mình đối với tác phẩm trên toàn thế giới theo luật bản quyền và các quyền ' +
                    'liên quan, trong phạm vi luật cho phép.' ]
            ] },
            { num: '02', title: 'Bạn được tự do', blocks: [
                [ 'p', 'Bạn có thể <strong>sao chép, sửa đổi, phân phối và biểu diễn</strong> tác phẩm, kể cả cho ' +
                    '<strong>mục đích thương mại</strong>, mà <strong>không cần xin phép</strong>.' ],
                [ 'note', 'Khuyến nghị (không bắt buộc): vẫn nên ghi nguồn tác phẩm khi sử dụng — đây là phép lịch sự, không phải nghĩa vụ pháp lý.' ]
            ] },
            { num: '03', title: 'Lưu ý', blocks: [
                [ 'ul', [
                    'Trong nhiều trường hợp tác phẩm vẫn có thể bị giới hạn bởi <strong>các luật khác</strong> (quyền công khai hình ảnh, quyền riêng tư, quyền nhân thân của người trong tác phẩm…).',
                    'Người hiến tặng <strong>không đưa ra bảo đảm</strong> nào về tác phẩm và không chịu trách nhiệm với mọi việc sử dụng, trong phạm vi luật cho phép.',
                    'Sau khi đã hiến tặng, <strong>không thể yêu cầu xoá</strong> các bản sao đã được người khác tạo ra.'
                ] ]
            ] }
        ],
        summary: { label: '► QUICK REFERENCE', title: 'Tóm tắt nhanh', note: 'Tham khảo — bản gốc tại creativecommons.org.',
            headers: [ 'Hành động', 'Được phép?' ], rows: [
                [ 'Sao chép & chia sẻ', '✅ Tự do' ], [ 'Tạo bản phái sinh', '✅ Tự do' ],
                [ 'Dùng thương mại', '✅' ], [ 'Ghi công tác giả', 'Không bắt buộc' ]
            ] },
        footer: { stamp: 'CC0 1.0 // CREATIVE COMMONS', meta: [ 'CC0 1.0 Universal', 'Creative Commons', 'Bản gốc: creativecommons.org' ] }
    };

    /* ---------- Bản quyền toàn phần (All Rights Reserved) ---------- */
    DOCS[ 'Dự án:Bản quyền/Giấy phép/Bản quyền toàn phần' ] = {
        docId: 'DOC // ARR // ALL RIGHTS RESERVED',
        title: 'BẢN QUYỀN <span class="mcl-accent">TOÀN PHẦN</span>',
        subtitle: 'ALL RIGHTS RESERVED (©)',
        bar: [ 'COMMERCIAL: 🚫', 'PHÁI SINH: 🚫' ],
        notice: '⚠️ Giấy phép <strong>Bản quyền toàn phần (©)</strong> giữ lại MỌI quyền cho tác giả. Loại này <strong>không tương thích tinh thần mở</strong> của wiki — BQT có thể từ chối hoặc yêu cầu đổi sang giấy phép mở. Chỉ dùng khi thật sự cần thiết và được BQT chấp thuận.',
        toc: [ 'Quyền giữ lại', 'Người khác được/không được', 'Lưu ý' ],
        articles: [
            { num: '01', title: 'Quyền giữ lại', blocks: [
                [ 'p', 'Tác giả giữ <strong>toàn bộ</strong> quyền: sao chép, phân phối, sửa đổi, phái sinh, thương mại hoá. Mọi việc sử dụng đều cần <strong>sự đồng ý bằng văn bản</strong> của tác giả.' ]
            ] },
            { num: '02', title: 'Người khác được / không được', blocks: [
                [ 'ul', [ 'Được: ĐỌC trên Wiki, liên kết tới bài', 'Được: Trích dẫn ngắn có ghi nguồn (fair use)' ] ],
                [ 'ul', [ 'Không: sao chép/đăng lại', 'Không: tạo bản phái sinh', 'Không: dùng thương mại', 'Không: bỏ ghi công' ], true ]
            ] },
            { num: '03', title: 'Lưu ý', blocks: [
                [ 'note', 'M.A.P.L.E khuyến nghị dùng giấy phép mở (CC BY-SA, MCL…) để cộng đồng phát triển nội dung. ARR nên là ngoại lệ.' ]
            ] }
        ],
        footer: { stamp: 'ALL RIGHTS RESERVED // ©', meta: [ 'ARR', 'M.A.P.L.E WIKI', 'Cần đồng ý của tác giả' ] }
    };

    /* ---------- HUB / FALLBACK: danh mục giấy phép hỗ trợ ---------- */
    DOCS[ 'Dự án:Bản quyền/Giấy phép' ] = {
        docId: 'DOC // LICENSE-INDEX // HUB',
        title: 'DANH MỤC <span class="mcl-accent">GIẤY PHÉP</span>',
        subtitle: 'CÁC GIẤY PHÉP ĐƯỢC HỖ TRỢ — M.A.P.L.E WIKI',
        bar: [ 'DEFAULT: CC BY-SA 4.0' ],
        notice: 'Đây là trang tổng hợp (và <strong>fallback</strong>) mọi giấy phép M.A.P.L.E hỗ trợ. Khi tạo bài bằng <a href="/wiki/T%E1%BA%A1o_B%C3%A0i_M%E1%BB%9Bi">Tạo Bài Mới</a>, bạn chọn một giấy phép — chân trang sẽ tự hiển thị và liên kết tới đúng trang giấy phép đó. Trang nào chưa khai báo sẽ dùng <strong>mặc định CC BY-SA 4.0</strong>.',
        toc: [ 'Nhóm Creative Commons', 'Nhóm M.A.P.L.E', 'Khác' ],
        articles: [
            { num: '01', title: 'Nhóm Creative Commons (CC)', blocks: [
                [ 'p', 'Giấy phép quốc tế phổ biến. Bấm để xem trang tóm tắt nội bộ (kèm nút "Xem bản gốc" tại creativecommons.org):' ],
                [ 'ul', [
                    '<a href="/wiki/D%E1%BB%B1_%C3%A1n:B%E1%BA%A3n_quy%E1%BB%81n/Gi%E1%BA%A5y_ph%C3%A9p/CC_BY-SA_4.0">CC BY-SA 4.0</a> — ghi công + chia sẻ tương tự (mặc định)',
                    '<a href="/wiki/D%E1%BB%B1_%C3%A1n:B%E1%BA%A3n_quy%E1%BB%81n/Gi%E1%BA%A5y_ph%C3%A9p/CC_BY_4.0">CC BY 4.0</a> — chỉ ghi công',
                    '<a href="/wiki/D%E1%BB%B1_%C3%A1n:B%E1%BA%A3n_quy%E1%BB%81n/Gi%E1%BA%A5y_ph%C3%A9p/CC_BY-NC-SA_4.0">CC BY-NC-SA 4.0</a> — phi thương mại + chia sẻ tương tự',
                    '<a href="/wiki/D%E1%BB%B1_%C3%A1n:B%E1%BA%A3n_quy%E1%BB%81n/Gi%E1%BA%A5y_ph%C3%A9p/CC_BY-ND_4.0">CC BY-ND 4.0</a> — không phái sinh',
                    '<a href="/wiki/D%E1%BB%B1_%C3%A1n:B%E1%BA%A3n_quy%E1%BB%81n/Gi%E1%BA%A5y_ph%C3%A9p/CC0_1.0">CC0 1.0</a> — phạm vi công cộng'
                ] ]
            ] },
            { num: '02', title: 'Nhóm giấy phép M.A.P.L.E', blocks: [
                [ 'note', 'Văn bản pháp lý độc lập do M.A.P.L.E phát triển, không liên kết Creative Commons.' ],
                [ 'ul', [
                    '<a href="/wiki/D%E1%BB%B1_%C3%A1n:B%E1%BA%A3n_quy%E1%BB%81n/Gi%E1%BA%A5y_ph%C3%A9p/MCLv1">MCL v1.0</a> — giấy phép nội dung M.A.P.L.E',
                    '<a href="/wiki/D%E1%BB%B1_%C3%A1n:B%E1%BA%A3n_quy%E1%BB%81n/Gi%E1%BA%A5y_ph%C3%A9p/M-SA_1.0">M-SA 1.0</a> — ShareAlike (nội dung AI / nhóm đặc thù)',
                    '<a href="/wiki/D%E1%BB%B1_%C3%A1n:B%E1%BA%A3n_quy%E1%BB%81n/Gi%E1%BA%A5y_ph%C3%A9p/M_BY-SA_1.0">M BY-SA 1.0</a> — bản phái sinh của M-SA'
                ] ]
            ] },
            { num: '03', title: 'Khác', blocks: [
                [ 'ul', [ '<a href="/wiki/D%E1%BB%B1_%C3%A1n:B%E1%BA%A3n_quy%E1%BB%81n/Gi%E1%BA%A5y_ph%C3%A9p/B%E1%BA%A3n_quy%E1%BB%81n_to%C3%A0n_ph%E1%BA%A7n">Bản quyền toàn phần (©)</a> — giữ mọi quyền (BQT có thể từ chối)' ] ],
                [ 'p', 'Xem thêm <a href="/wiki/D%E1%BB%B1_%C3%A1n:B%E1%BA%A3n_quy%E1%BB%81n">Điều khoản Bản quyền</a> để hiểu cách áp dụng từng loại.' ]
            ] }
        ],
        footer: { stamp: 'LICENSE INDEX // M.A.P.L.E', meta: [ 'HUB', 'M.A.P.L.E WIKI', 'Mặc định: CC BY-SA 4.0' ] }
    };

    /* ════════════════════════════════════════════════════════
       MATCH TRANG + RENDER
       ════════════════════════════════════════════════════════ */
    function currentDoc() {
        var pn = mw.config.get( 'wgPageName' ) || '';
        var variants = [ pn, pn.replace( /_/g, ' ' ) ];
        try { variants.push( decodeURIComponent( pn ).replace( /_/g, ' ' ) ); } catch ( e ) {}
        for ( var i = 0; i < variants.length; i++ ) {
            if ( DOCS[ variants[ i ] ] ) return DOCS[ variants[ i ] ];
        }
        return null;
    }

    function buildHTML( doc ) {
        var bar = ( doc.bar || [] ).map( function ( s, i ) {
            return ( i ? '<span class="mcl-dot"></span>' : '' ) + '<span>' + esc( s ) + '</span>';
        } ).join( '' );

        var tocItems = ( doc.toc || [] ).map( function ( t, i ) {
            return '<li><a href="#mcl-dieu-' + ( i + 1 ) + '">' + esc( t ) + '</a></li>';
        } ).join( '' );

        var articles = ( doc.articles || [] ).map( function ( a, i ) {
            return '<section class="mcl-article" id="mcl-dieu-' + ( i + 1 ) + '">' +
                '<div class="mcl-article-header">' +
                    '<span class="mcl-article-num">ĐIỀU ' + esc( a.num ) + '</span>' +
                    '<h2 class="mcl-article-title">' + esc( a.title ) + '</h2>' +
                '</div>' +
                '<div class="mcl-article-body">' + a.blocks.map( block ).join( '' ) + '</div>' +
            '</section>';
        } ).join( '' );

        var summary = '';
        if ( doc.summary ) {
            var s = doc.summary;
            summary = '<div class="mcl-summary-wrapper" id="mcl-tom-tat">' +
                '<div class="mcl-summary-label">' + esc( s.label || '► QUICK REFERENCE' ) + '</div>' +
                '<h2 class="mcl-summary-title">' + esc( s.title || 'Tóm tắt nhanh' ) + '</h2>' +
                ( s.note ? '<p class="mcl-summary-note">' + esc( s.note ) + '</p>' : '' ) +
                table( s.headers, s.rows ) +
            '</div>';
        }

        var meta = ( doc.footer && doc.footer.meta || [] ).map( function ( m, i ) {
            return ( i ? '<span>—</span>' : '' ) + '<span>' + esc( m ) + '</span>';
        } ).join( '' );

        return '<div class="mcl-page"><div class="mcl-scan-line"></div><div class="mcl-container">' +
            '<header class="mcl-header">' + logoSVG() +
                '<div class="mcl-doc-id">' + esc( doc.docId ) + '</div>' +
                '<h1 class="mcl-title">' + doc.title + '</h1>' +
                '<div class="mcl-subtitle">' + esc( doc.subtitle ) + '</div>' +
                '<div class="mcl-version-bar">' + bar + '<span class="mcl-dot"></span><span class="mcl-timestamp" style="color:#3f3f46">— : — UTC</span></div>' + /* Decoration / timestamp mờ */
            '</header>' +
            '<div class="mcl-legal-notice"><span class="mcl-notice-label">► LƯU Ý PHÁP LÝ</span>' + doc.notice + '</div>' +
            ( doc.source ? '<div class="mcl-source"><a class="mcl-source-btn" href="' + esc( doc.source.url ) + '" target="_blank" rel="noopener">⎋ XEM BẢN GỐC TẠI: ' + esc( doc.source.label ) + '</a></div>' : '' ) +
            '<nav class="mcl-toc"><div class="mcl-toc-label">▌ MỤC LỤC // INDEX</div><ol>' + tocItems + '</ol></nav>' +
            articles + summary +
            '<footer class="mcl-footer"><div class="mcl-stamp">' + esc( doc.footer && doc.footer.stamp || '' ) + '</div>' +
                '<div class="mcl-meta">' + meta + '</div></footer>' +
        '</div></div>';
    }

    /* ── Behaviours ── */
    function setupReveal() {
        var nodes = document.querySelectorAll( '.mcl-article' );
        if ( !nodes.length ) return;
        if ( !( 'IntersectionObserver' in window ) ) {
            nodes.forEach( function ( n ) { n.classList.add( 'is-visible' ); } ); return;
        }
        var ob = new IntersectionObserver( function ( entries ) {
            entries.forEach( function ( e, i ) {
                if ( e.isIntersecting ) {
                    var el = e.target;
                    setTimeout( function () { el.classList.add( 'is-visible' ); }, i * 70 );
                    ob.unobserve( el );
                }
            } );
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' } );
        nodes.forEach( function ( n ) { ob.observe( n ); } );
    }
    function setupSmoothScroll() {
        $( document ).on( 'click', '.mcl-toc a[href^="#"]', function ( e ) {
            var id = $( this ).attr( 'href' ).slice( 1 ), t = document.getElementById( id );
            if ( !t ) return;
            e.preventDefault();
            window.scrollTo( { top: t.getBoundingClientRect().top + window.pageYOffset - 30, behavior: 'smooth' } );
            t.style.transition = 'background-color .6s ease'; t.style.backgroundColor = 'rgba(239,68,68,.05)';
            setTimeout( function () { t.style.backgroundColor = ''; }, 900 );
        } );
    }
    function updateTimestamp() {
        var slot = document.querySelector( '.mcl-timestamp' );
        if ( !slot ) return;
        var n = new Date(), p = function ( x ) { return x < 10 ? '0' + x : '' + x; };
        slot.textContent = n.getUTCFullYear() + '-' + p( n.getUTCMonth() + 1 ) + '-' + p( n.getUTCDate() ) +
            ' / ' + p( n.getUTCHours() ) + ':' + p( n.getUTCMinutes() ) + ' UTC';
    }

    function loadCSS( name ) {
        mw.loader.load( mw.config.get( 'wgScript' ) + '?title=MediaWiki:' + encodeURIComponent( name ) + '.css&action=raw&ctype=text/css', 'text/css' );
    }

    function init() {
        var doc = currentDoc();
        if ( !doc ) return;
        var $content = $( '#mw-content-text' );
        if ( !$content.length ) return;

        loadCSS( 'MCLv1' );
        if ( !document.getElementById( 'mcl-font-jakarta' ) ) {
            var f = document.createElement( 'link' );
            f.id = 'mcl-font-jakarta'; f.rel = 'stylesheet';
            f.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;800;900&display=swap';
            document.head.appendChild( f );
        }
        $( 'body' ).addClass( 'mcl-active' );
        document.title = esc( doc.subtitle ) + ' — M.A.P.L.E Wiki';
        $content.html( buildHTML( doc ) );
        setTimeout( function () { setupReveal(); setupSmoothScroll(); updateTimestamp(); }, 50 );
        console.log( '[M.A.P.L.E] Legal doc rendered:', doc.docId );
    }

    mw.hook( 'wikipage.content' ).add( function () {
        if ( document.querySelector( '.mcl-page' ) ) return; /* tránh chạy 2 lần */
        init();
    } );

}( mediaWiki, jQuery ) );
