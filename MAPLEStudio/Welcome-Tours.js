/**
 * M.A.P.L.E — MediaWiki:Welcome-Tours.js
 * Cấu hình các bước cho Welcome Tour.
 * Module này được load bởi Welcome.js.
 */
(function () {
    'use strict';

    var TOURS = {
        'Trang_Chính': {
            steps: [
                {
                    title: 'Chào mừng tới Trang Chính',
                    content: 'Đây là trung tâm thông tin của M.A.P.L.E. Hãy cùng xem qua các khu vực chính.',
                    selector: '.maple-hero'
                },
                {
                    title: 'Thống kê nhanh',
                    content: 'Khu vực này hiển thị các số liệu quan trọng của Wiki theo thời gian thực.',
                    selector: '.maple-stats'
                },
                {
                    title: 'Truy cập nhanh',
                    content: 'Các liên kết này sẽ đưa bạn đến những khu vực cốt lõi như Kho Lưu Trữ, Thủ Tục, và trang Trợ Giúp.',
                    selector: '.maple-qa-grid'
                },
                {
                    title: 'Nội dung chính',
                    content: 'Bạn có thể chuyển qua lại các tab để xem giới thiệu về The Maze, các mẹo để bắt đầu, và các kênh cộng đồng.',
                    selector: '.maple-tabs-wrap'
                },
                {
                    title: 'Hoạt động gần đây',
                    content: 'Luôn cập nhật các bài viết mới nhất từ blog và cộng đồng tại đây.',
                    selector: '.maple-blog-grid'
                }
            ]
        },
        'Kho_Lưu_Trữ': {
            steps: [
                {
                    title: 'Kho Lưu Trữ',
                    content: 'Đây là cơ sở dữ liệu trung tâm, chứa tất cả hồ sơ về Thực thể, Vật phẩm và các tài liệu khác.',
                    selector: '.klt-hero'
                },
                {
                    title: 'Tìm kiếm và Lọc',
                    content: 'Sử dụng các bộ lọc này để nhanh chóng tìm thấy hồ sơ bạn cần theo loại, cấp độ, hoặc từ khóa.',
                    selector: '.klt-filters'
                },
                {
                    title: 'Thẻ Hồ sơ',
                    content: 'Mỗi hồ sơ được tóm tắt trong một thẻ như thế này, hiển thị các thông tin quan trọng nhất.',
                    selector: '.klt-card:first-of-type'
                },
                {
                    title: 'Phân trang',
                    content: 'Sử dụng các nút này để duyệt qua các trang kết quả khác nhau.',
                    selector: '.klt-pagination'
                }
            ]
        },
        'USER_PAGE_GENERIC': {
            steps: [
                {
                    title: 'Trang Hồ sơ cá nhân',
                    content: 'Đây là trang cá nhân của một thành viên, nơi hiển thị thông tin, hoạt động và thành tựu của họ.',
                    selector: '.up-hero'
                },
                {
                    title: 'Xếp hạng & Điểm uy tín',
                    content: 'Thẻ này cho biết cấp bậc, điểm uy tín (RP) và tiến độ lên hạng của thành viên.',
                    selector: '.up-rank-card'
                },
                {
                    title: 'Các Tab nội dung',
                    content: 'Chuyển qua các tab để xem thông tin tổng quan, thành tựu đã đạt được, danh sách bạn bè và các hoạt động khác.',
                    selector: '.up-tabs'
                }
            ]
        },
        'Dự_án:All_User': {
            steps: [
                {
                    title: 'Chào mừng bạn!',
                    content: 'Đây là trang <strong>Danh sách thành viên</strong>. Hãy cùng khám phá các chức năng chính nhé.',
                    selector: '.au-header'
                },
                {
                    title: 'Tìm kiếm & Lọc',
                    content: 'Bạn có thể tìm kiếm thành viên theo tên hoặc lọc theo cấp bậc để thu hẹp danh sách.',
                    selector: '.au-filters'
                },
                {
                    title: 'Thẻ thành viên',
                    content: 'Mỗi thành viên có một thẻ riêng hiển thị thông tin cơ bản như avatar, tên, cấp bậc và số sửa đổi.',
                    selector: '.au-card:first-child'
                },
                {
                    title: 'Xem hồ sơ chi tiết',
                    content: 'Bấm vào thẻ để truy cập trang hồ sơ cá nhân đầy đủ của thành viên đó.',
                    selector: '.au-card:first-child .au-card-main'
                },
                {
                    title: 'Kết thúc',
                    content: 'Bạn đã hoàn thành tour! Giờ hãy tự mình khám phá nhé. Bạn có thể truy cập lại tour này bất cứ lúc nào bằng cách thêm <code>/welcome</code> vào cuối URL.',
                    selector: '.au-grid'
                }
            ]
        },
        'Thủ_Tục': {
            steps: [
                {
                    title: 'Thủ Tục Sinh Tồn',
                    content: 'Đây là cẩm nang sống còn tại The Maze. Hãy ghi nhớ kỹ để bảo toàn mạng sống của bạn.',
                    selector: '.mhd3-hero, h1'
                },
                {
                    title: 'Các Giao Thức (SOP)',
                    content: 'Danh sách các quy trình tiêu chuẩn như A.L.O.P.S.I, P.A.T.Y.T được liệt kê chi tiết ở đây.',
                    selector: '.mhd3-section, h2'
                },
                {
                    title: 'Câu hỏi thường gặp',
                    content: 'Giải đáp nhanh các tình huống khẩn cấp mà bạn có thể gặp phải.',
                    selector: '.mhd3-faq, .faq-section'
                }
            ]
        },
        'Sự_Kiện': {
            steps: [
                {
                    title: 'Trung tâm Sự kiện',
                    content: 'Nơi tổng hợp các cuộc thi, hoạt động và dòng thời gian sự kiện của M.A.P.L.E.',
                    selector: '.sk-hero, h1'
                },
                {
                    title: 'Dòng thời gian',
                    content: 'Các sự kiện đang diễn ra, sắp tới và đã kết thúc được sắp xếp theo trình tự.',
                    selector: '.sk-timeline, .sk-list'
                },
                {
                    title: 'Chi tiết & Tham gia',
                    content: 'Bấm vào một sự kiện để xem chi tiết, theo dõi đếm ngược và nhấn nút tham gia.',
                    selector: '.sk-item:first-child, .sk-event-card'
                }
            ]
        },
        'Thành_Tựu': {
            steps: [
                {
                    title: 'Sảnh Danh Vọng',
                    content: 'Nơi ghi nhận mọi nỗ lực và đóng góp của các thành viên M.A.P.L.E.',
                    selector: '.tt-hero, h1'
                },
                {
                    title: 'Điều hướng',
                    content: 'Chuyển qua lại giữa các tab Vinh Danh, Thành Tựu và Huy Hiệu.',
                    selector: '.tt-tabs, .maple-tabs'
                },
                {
                    title: 'Bảng Xếp Hạng',
                    content: 'Xem top các thành viên có Điểm Uy Tín (RP) cao nhất trên toàn hệ thống.',
                    selector: '.tt-leaderboard, table'
                },
                {
                    title: 'Khám phá Danh mục',
                    content: 'Khám phá các thành tựu và huy hiệu bạn có thể mở khoá. Các thành tựu ẩn sẽ hiển thị "???" cho tới khi bạn tìm ra.',
                    selector: '.tt-grid, .badge-grid'
                }
            ]
        },
        'Nhiệm_Vụ': {
            steps: [
                {
                    title: 'Bảng Nhiệm Vụ',
                    content: 'Hoàn thành các công việc thực địa được giao để nhận Điểm Uy Tín (RP) hoàn toàn tự động.',
                    selector: '.nv-hero, h1'
                },
                {
                    title: 'Chu kỳ',
                    content: 'Nhiệm vụ được chia thành Ngày, Tuần và Tháng. Hãy chú ý thời hạn vì tiến độ sẽ reset khi hết chu kỳ!',
                    selector: '.nv-tabs, .maple-tabs'
                },
                {
                    title: 'Thẻ tiến độ',
                    content: 'Mỗi thẻ hiển thị tiến độ thực tế của bạn. Khi đầy thanh, RP sẽ được tự động cộng vào tài khoản.',
                    selector: '.nv-card:first-child, .task-card'
                },
                {
                    title: 'Hoàn thành nhiệm vụ',
                    content: 'Khi đạt đủ điều kiện, nhiệm vụ sẽ tự động chuyển sang trạng thái "✓ ĐÃ NHẬN RP". Bạn không cần phải bấm xác nhận, hệ thống đã tự lưu tiến độ cho bạn!',
                    selector: '.nv-tabs-content, .nv-grid'
                }
            ]
        },
        'Bảng_Tin': {
            steps: [
                {
                    title: 'Bảng Tin M.A.P.L.E',
                    content: 'Cập nhật các thông báo chính thức, bản vá và tin tức mới nhất từ hệ thống.',
                    selector: '.bt-hero, h1'
                },
                {
                    title: 'Thông báo',
                    content: 'Các tin tức được phân loại theo màu sắc: Xanh (Cập nhật), Vàng (Cảnh báo), Đỏ (Khẩn cấp).',
                    selector: '.bt-list, .news-list'
                }
            ]
        },
        'Donate': {
            steps: [
                {
                    title: 'Ủng hộ Dự án',
                    content: 'M.A.P.L.E Wiki hoạt động phi lợi nhuận. Sự đóng góp của bạn giúp duy trì máy chủ và phát triển cộng đồng.',
                    selector: '.dn-hero, h1'
                },
                {
                    title: 'Phương thức',
                    content: 'Các kênh quyên góp chính thức. Bấm để sao chép thông tin nhanh chóng.',
                    selector: '.dn-methods, .method-card'
                }
            ]
        },
        'Dự_án:Phản_hồi': {
            steps: [
                {
                    title: 'Trung tâm Phản Hồi',
                    content: 'Nơi tiếp nhận và theo dõi các báo cáo lỗi, khiếu nại, và góp ý từ cộng đồng.',
                    selector: '.ph-hero, h1'
                },
                {
                    title: 'Thẻ phản hồi',
                    content: 'Mỗi thẻ thể hiện chi tiết một yêu cầu và trạng thái giải quyết từ Admin (Chờ / Đang xử lý / Đã giải quyết).',
                    selector: '.ph-grid, .feedback-card:first-child'
                },
                {
                    title: 'Gửi phản hồi mới',
                    content: 'Bạn có thể tạo yêu cầu mới bất cứ lúc nào bằng cách sử dụng nút "PHẢN HỒI" trên thanh công cụ góc trên bên phải.',
                    selector: '.maple-nav-feedback'
                }
            ]
        },
        'Trợ_giúp': {
            steps: [
                {
                    title: 'Trung tâm Trợ Giúp',
                    content: 'Nơi giải đáp mọi thắc mắc về cách sử dụng, quy tắc và hệ thống của M.A.P.L.E.',
                    selector: '.tg-hero, .mhd3-hero, h1'
                },
                {
                    title: 'Khám phá Chủ đề',
                    content: 'Bạn có thể tìm hướng dẫn theo các danh mục như Biên soạn, Tài khoản, hay Vấn đề kỹ thuật.',
                    selector: '.tg-grid, .mhd3-section'
                },
                {
                    title: 'Hỗ trợ trực tiếp',
                    content: 'Nếu không tìm thấy câu trả lời, đừng ngại dùng MAPLE Chat để liên hệ trực tiếp với Ban Quản Trị.',
                    selector: '.mhd3-footer, .contact-btn'
                }
            ]
        },
        'Điều_Khoản': {
            steps: [
                {
                    title: 'Điều Khoản Người Dùng',
                    content: 'Chào mừng bạn đến với trang Điều Khoản Người Dùng. Hãy cùng xem qua các quy định quan trọng khi tham gia hệ thống.',
                    selector: '.mhd3-hero, h1'
                },
                {
                    title: 'Nội dung Điều khoản',
                    content: 'Các quy định về ứng xử, ranh giới pháp lý và các hành vi bị cấm được liệt kê chi tiết tại đây.',
                    selector: '.mhd3-section, h2'
                },
                {
                    title: 'Câu hỏi thường gặp',
                    content: 'Phần FAQ sẽ giải đáp nhanh những thắc mắc phổ biến nhất về quy định và tài khoản.',
                    selector: '.mhd3-faq, .faq-section'
                },
                {
                    title: 'Cần hỗ trợ?',
                    content: 'Nếu có bất kỳ câu hỏi nào chưa rõ, bạn có thể sử dụng khu vực này để liên hệ trực tiếp với Ban Quản Trị.',
                    selector: '.mhd3-footer, .contact-btn'
                }
            ]
        }
        // Thêm các tour cho trang khác ở đây
    };

    window.MAPLE_TOUR_CONFIG = {
        getTour: function (pageName) {
            if (TOURS[pageName]) return TOURS[pageName];
            
            if (pageName.startsWith('User:') || pageName.startsWith('Người_dùng:')) return TOURS.USER_PAGE_GENERIC;
            if (pageName.startsWith('Sự_Kiện/')) return TOURS['Sự_Kiện'];
            if (pageName.startsWith('Kho_Lưu_Trữ/')) return TOURS['Kho_Lưu_Trữ'];
            if (pageName.startsWith('Dự_án:Phản_hồi') || pageName.startsWith('Phản_hồi')) return TOURS['Dự_án:Phản_hồi'];
            if (pageName.startsWith('Trợ_giúp') || pageName.startsWith('Quy_Tắc')) return TOURS['Trợ_giúp'];
            if (pageName.startsWith('Điều_Khoản') || pageName.startsWith('Điều Khoản')) return TOURS['Điều_Khoản'];
            if (pageName.startsWith('Nhiệm_Vụ') || pageName.startsWith('Nhiệm Vụ')) return TOURS['Nhiệm_Vụ'];
            
            return null;
        }
    };

}());