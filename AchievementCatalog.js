/* ============================================
   M.A.P.L.E — MediaWiki:AchievementCatalog.js
   NGUỒN DỮ LIỆU DÙNG CHUNG cho hệ thống Thành Tựu + Huy Hiệu + RP.
   Định nghĩa window.MAPLE.catalog — ThanhTuu.js & UserPage.js cùng đọc.
   CHỈ DỮ LIỆU + LOGIC HIỂN THỊ (không tự cộng RP, không gate quyền — xem he-thong-diem.txt NT-5).
   Đồng bộ từ else/Thanh-tu-va-huy-hieu.txt.
   ============================================ */
(function () {
    'use strict';
    window.MAPLE = window.MAPLE || {};
    if (window.MAPLE.catalog) return; /* đã nạp */

    /* ── ĐỘ HIẾM: 12 bậc (THƯỜNG → ẨN → ĐẶC BIỆT) ── */
    var RARITY = {
        common:    { rp: 5,   label: 'THƯỜNG',     rank: 1,  cls: 'tt-common' },
        rare:      { rp: 15,  label: 'HIẾM',       rank: 2,  cls: 'tt-rare' },
        epic:      { rp: 40,  label: 'SỬ THI',     rank: 3,  cls: 'tt-epic' },
        legendary: { rp: 100, label: 'HUYỀN THOẠI', rank: 4, cls: 'tt-legendary' },
        mythic:    { rp: 150, label: 'THẦN THOẠI', rank: 5,  cls: 'tt-mythic' },
        ancient:   { rp: 200, label: 'CỔ ĐẠI',     rank: 6,  cls: 'tt-ancient' },
        artifact:  { rp: 250, label: 'THÁNH TÍCH', rank: 7,  cls: 'tt-artifact' },
        immortal:  { rp: 300, label: 'BẤT TỬ',     rank: 8,  cls: 'tt-immortal' },
        exclusive: { rp: 350, label: 'ĐỘC QUYỀN',  rank: 9,  cls: 'tt-exclusive' },
        ultimate:  { rp: 400, label: 'TỐI THƯỢNG', rank: 10, cls: 'tt-ultimate' },
        relic:     { rp: 450, label: 'DI VẬT',     rank: 11, cls: 'tt-relic' },
        divine:    { rp: 500, label: 'THẦN THÁNH', rank: 12, cls: 'tt-divine' }
    };

    /* ── TIER UY TÍN theo RP tổng (≠ rank quyền) ── */
    var TIERS = [
        { n: 0, label: 'NGƯỜI MỚI',  min: 0,    color: '#52525b' },
        { n: 1, label: 'TIN CẬY',    min: 50,   color: '#3b82f6' },
        { n: 2, label: 'CỘNG TÁC',   min: 200,  color: '#06b6d4' },
        { n: 3, label: 'KỲ CỰU',     min: 500,  color: '#a855f7' },
        { n: 4, label: 'HUYỀN THOẠI', min: 1500, color: '#eab308' }
    ];

    /* helper dựng object thành tựu/huy hiệu gọn */
    function A(id, icon, label, rarity, desc, hidden) {
        return { id: id, icon: icon, label: label, rarity: rarity, desc: desc, hidden: !!hidden };
    }
    function B(id, icon, label, rarity, desc, opts) {
        opts = opts || {};
        return { id: id, icon: icon, label: label, rarity: rarity, desc: desc,
                 hidden: !!opts.hidden, limited: !!opts.limited };
    }

    /* ═══════════════ THÀNH TỰU — 16 nhóm ═══════════════ */
    var ACH_GROUPS = [
        { group: 'CỘNG ĐỒNG', items: [
            A('welcome', '◉', 'LÍNH MỚI!', 'common', 'Tạo tài khoản — chính thức nhập hội 🎉'),
            A('verified', '✓', "I'M NOT ROBOT", 'common', 'Xác thực email → ô là người thật, bot biến đi 🤖'),
            A('verified_agent', '✓', 'ĐẶC VỤ XÁC THỰC', 'rare', 'Xác thực email thành công trên hệ thống'),
            A('decorator', '🎨', 'NHÀ TRANG TRÍ', 'common', 'Tùy biến Accent Color hoặc Banner cá nhân lần đầu'),
            A('generous_soul', '💖', 'LÒNG DẠ PHÓNG KHOÁNG', 'rare', 'Bật tab Donate ủng hộ lần đầu'),
            A('commenter_pro', '💬', 'BÌNH LUẬN GIA CHUYÊN NGHIỆP', 'epic', 'Gửi 200 bình luận hữu ích'),
            A('profile', '☺', 'GLOW-UP HỒ SƠ', 'common', 'Up avatar + viết bio xịn → flex nhẹ profile'),
            A('first_comment', '✎', 'REP PHÁT MỘT', 'common', 'Thả cmt đầu tiên (được duyệt) — phá đảo nỗi sợ'),
            A('chatter', '✉', 'MỎ HỖN (có tâm)', 'rare', '100 cmt được duyệt — kỹ năng đấu khẩu max'),
            A('reactor', '☝', 'CỬA TÍNH TÍCH CỰC', 'common', 'Tặng 100 reaction cho ae trong hội'),
            A('beloved', '♥', 'CRUSH CỦA CẢ WIKI', 'rare', 'Nhận 100 reaction — ai cũng simp bạn 😳'),
            A('social', '✦', 'CÓ HỘI CÓ PHƯỜNG', 'rare', 'Kết đủ 10 bạn'),
            A('socialite', '✸', 'QUAN HỆ RỘNG', 'epic', 'Kết 50 bạn — social butterfly real'),
            A('mentor', '⚐', 'SENPAI DẮT TAY', 'epic', 'Dìu 5 newbie nhập môn (BQT xác nhận)'),
            A('night_owl', '☾', 'CÚ ĐÊM', 'common', 'Online lúc 0–4h — ngủ là cho kẻ yếu 😪'),
            A('early_bird', '☼', 'CHIM SOM MỰC', 'common', 'Online lúc 5–7h sáng — kỷ luật phết'),
            A('comeback', '↺', 'TÁI XUẤT GIANG HỒ', 'rare', 'Quay lại sau 90 ngày mất tích — comeback cháy'),
            A('anniversary', '✺', 'TRÒN 1 TUỔI TẠI MAZE', 'epic', 'Acc đủ 1 năm — già làng rồi đó 🎂'),
            A('touch_grass', '🌿', 'BRO ĐI CHẠM CỎ ĐI', 'mythic', 'Online liên tục 7 ngày không tương tác', true),
            A('sus', '🤨', 'HƠI SUS ĐÓ', 'mythic', 'Đổi avatar/bio 5 lần trong 1 ngày — làm gì mờ ám', true),
            A('ping_pong', '🏓', 'PING PONG CUỒNG ĐỘI', 'mythic', 'Gửi 200 tin nhắn trong 1 giờ — rảnh vậy thú?', true),
            A('meme_lord', '😂', 'CHÚA TỂ MEME', 'ancient', 'Đăng 50 ảnh meme chất lượng', true),
            A('rizz_god', '🔥', 'CUỐN HÚT VẬY SEO?', 'mythic', 'Kết 15 bạn + được chấp nhận trong 1 ngày', true),
            A('ghost_writer', '👻', 'BÓNG MA CHỈNH SỬA', 'ancient', 'Sửa 100 bài của người khác im lặng', true),
            A('lurker_no_more', '👁️‍🗨️', 'LURKER TÁI XUẤT', 'mythic', 'Bình luận đầu tiên sau 60 ngày chỉ đọc', true),
            A('midnight_explorer', '🌌', 'THÁM HIỂM ĐÊM', 'epic', 'Truy cập trang lore lúc 2–4h sáng', true),
            A('marathon_reader', '📖', 'ĐỌC XUYÊN ĐÊM', 'rare', 'Đọc 10 bài liên tục từ 0h–4h sáng', true),
            A('knowledge_hoarder', '📚', 'KHO TÀNG TRI THỨC', 'epic', 'Đọc 500 bài viết', true)
        ]},
        { group: 'TƯƠNG TÁC XÃ HỘI', items: [
            A('first_message', '💬', 'KẾT NỐI ĐẦU TIÊN', 'common', 'Gửi tin nhắn đầu tiên qua hệ thống chat'),
            A('group_founder', '👥', 'NGƯỜI SÁNG LẬP NHÓM', 'rare', 'Tạo nhóm chat đầu tiên thành công'),
            A('event_first', '🎫', 'HỘI VIÊN MỚI', 'common', 'Tham gia sự kiện đầu tiên'),
            A('event_veteran', '🎟️', 'CHIẾN BINH SỰ KIỆN', 'epic', 'Tham gia 5 sự kiện khác nhau')
        ]},
        { group: 'CHUYÊN CẦN', items: [
            A('streak_7', '⚡', 'CÀY 7 NGÀY KHÔNG TRƯỢT', 'rare', 'Login 7 ngày liên tục'),
            A('streak_30', '☀️', 'NO DAYS OFF', 'epic', 'Login 30 ngày liên tục — kỷ luật max'),
            A('streak_100', '✹', 'NGHIỆN MAZE LV.MAX', 'legendary', 'Login 100 ngày liên tục — ơi trời 😭'),
            A('daily_reader', '◷', 'ĐỌC NHƯ HƠI THỞ', 'rare', 'Đọc mỗi ngày liên tục 7 ngày'),
            A('weekly_champion', '🏆', 'CHIẾN BINH TUẦN', 'rare', 'Hoàn thành tất cả nhiệm vụ hàng tuần'),
            A('monthly_legend', '👑', 'HUYỀN THOẠI THÁNG', 'epic', 'Hoàn thành tất cả nhiệm vụ hàng tháng')
        ]},
        { group: 'ĐỌC & KHÁM PHÁ', items: [
            A('first_read', '▤', 'MỞ HÀNG', 'common', 'Đọc bài viết đầu tiên'),
            A('bookworm_50', '▦', 'MỌT CHÍNH HIỆU', 'rare', 'Đọc 50 bài'),
            A('bookworm_200', '▩', 'NUỐT CHỬNG TRI THỨC', 'epic', 'Đọc 200 bài — đọc cho bằng được'),
            A('explorer', '✥', 'ĐI KHẮP TỨ PHƯƠNG', 'rare', 'Ghé đủ 6 khu vực ở Trang Chủ'),
            A('lore_seeker', '◎', 'THÁM TỬ LORE', 'rare', 'Đọc 25 hồ sơ thực thể'),
            A('archivist_read', '❒', 'THUỘC NHƯ LÒNG BÀN TAY', 'epic', 'Đọc hết hồ sơ một thể loại'),
            A('completionist', '✯', '100% MAP CLEARED', 'legendary', 'Cày sạch TOÀN BỘ Kho Lưu Trữ — GOAT'),
            A('deep_lore', '📜', 'THÁM HIỂM LORE SÂU', 'epic', 'Đọc 50 hồ sơ thực thể', true),
            A('maze_navigator', '🧭', 'ĐỊNH VỊ MAZE', 'rare', 'Ghé thăm toàn bộ khu vực trên bản đồ', true)
        ]},
        { group: 'ĐÓNG GÓP NỘI DUNG', items: [
            A('first_article', '✍️', 'BÀI ĐẦU TAY', 'rare', 'Có bài đầu tiên được duyệt — mãi mận 🥳'),
            A('writer_10', '✦', 'NGÒI BÚT CÓ SỐ', 'epic', '10 bài được duyệt'),
            A('writer_25', '✶', 'CÂY VIẾT CỨNG CỰA', 'epic', '25 bài được duyệt'),
            A('writer_50', '★', 'TRÙM HỒ SƠ', 'legendary', '50 bài được duyệt'),
            A('writer_100', '✪', 'GOAT LÀNG VIẾT', 'legendary', '100 bài được duyệt — đỉnh nóc kịch trần'),
            A('triple_threat', '⁂', 'CÂN CẢ MAP', 'epic', 'Viết đủ 3 thể loại (Thực Thể/Vật Phẩm/Nhật Ký)'),
            A('dossier_master', '❖', 'KIẾN TRÚC SƯ HỒ SƠ', 'rare', 'Làm 1 Dossier full mục — plot twist xịn'),
            A('series_author', '❡', 'CHA ĐẺ VŨ TRỤ', 'epic', 'Viết series ≥ 3 bài liên kết'),
            A('collaborator', '⚭', 'COMBO ĐÔI', 'rare', 'Đồng tác giả 1 bài cùng ae'),
            A('editor_help', '✂️', 'CHỈNH SỬA SIÊU MẠNH', 'rare', '50 sửa đổi hữu ích được giữ lại'),
            A('typo_hunter', '⌫', 'CẢNH SÁT NGỮ PHÁP', 'rare', 'Sửa 100 lỗi chính tả/cú pháp 🚓'),
            A('tagger', '#', 'THẦN PHÂN LOẠI', 'common', 'Gắn tag/thể loại cho 50 bài'),
            A('photographer', '📸', 'THỢ CHỤP SIÊU PRO', 'rare', 'Up 25 ảnh hợp lệ trong 1 tiếng'),
            A('ngu_photographer', '🎞️', 'KIÊN TRÌ', 'mythic', 'Up 1 ảnh 25 lần liên tiếp, lần 26 mới được duyệt', true),
            A('popular_1k', '▲', 'VIRAL NHẸ', 'epic', 'Một bài chạm 1.000 view'),
            A('popular_10k', '⏏️', 'BÀI CHÁY PHỐ', 'legendary', 'Một bài chạm 10.000 view — top trending real'),
            A('yapper', '🗣️', 'CHÚA TỂ YAPPER', 'epic', 'Đăng bài siêu dài (>5k chữ) — yap quá yap'),
            A('cook', '🍳', 'LET HIM COOK', 'rare', 'Sửa 1 bài quá 50 lần — để anh ấy nấu đi 👨‍🍳'),
            A('slay', '💅', 'SLAY KỊCH TRẦN', 'epic', 'Nhận 50 tim/react trong 1 ngày — slayyyyy'),
            A('rapper', '🎤', 'NHANH NHƯ BẮN RAP', 'epic', 'Viết 1 bài 1000 từ trong 1 giờ — flow như rap'),
            A('many_free_time', '⏰', 'RẢNH SINH NÔNG NỔI', 'mythic', 'Dành vài tiếng bình luận liên tục là người đầu tiên', true)
        ]},
        { group: 'KIỂM DUYỆT & TIN CẬY', items: [
            A('curator', '⚑', 'BẢO KÊ CHẤT LƯỢNG', 'epic', 'Duyệt/báo cáo 25 nội dung'),
            A('chief_curator', '🛡️', 'CƠ QUAN PHÁN QUYẾT', 'legendary', 'Duyệt hoặc từ chối 50 bài viết trong hàng chờ'),
            A('accurate_report', '⚖️', 'MẮT CÚ VỌ', 'rare', '10 report chuẩn xác không cần chỉnh'),
            A('guardian', '⛨', 'VỆ THẦN WIKI', 'epic', 'Làm Kiểm Duyệt Viên active'),
            A('clean_record', '✔️', 'HỒ SƠ TRẮNG TINH', 'rare', '1 năm không dính phốt — no L'),
            A('very_nice', '🤝', 'THẬT TỐT BỤNG!!!', 'rare', 'Được tặng nhiều quà nhất trong cộng đồng', true)
        ]},
        { group: 'UY TÍN / CỘT MỐC RP', items: [
            A('tier_1', '◈', 'REAL RECOGNIZE REAL', 'common', 'Chạm mốc 50 RP'),
            A('tier_2', '◆', 'CÓ TIẾNG TRONG HỘI', 'rare', 'Chạm 200 RP'),
            A('tier_3', '❖', 'LÃO LÀNG (OG)', 'epic', 'Chạm 500 RP'),
            A('tier_4', '✪', 'HUYỀN THOẠI MAZE', 'legendary', 'Chạm 1500 RP'),
            A('rp_5000', '♕', 'FINAL BOSS RP', 'legendary', 'Chạm 5000 RP — kẻ xứng đáng 👑'),
            A('are_you_cheat', '🎰', 'CÓ LÍ DO NGHI CHEAT', 'immortal', 'Chạm 10.000 RP — ơi trời ơi!!!', true)
        ]},
        { group: 'SỰ KIỆN', items: [
            A('event_join', '⚑', 'GÓP VUI', 'common', 'Tham gia 1 sự kiện'),
            A('event_3', '⚐', 'ĐI EVENT NHƯ ĐI CHỢ', 'rare', 'Tham gia 3 sự kiện'),
            A('event_for_fun', '🥳', 'VUI LÀ CHÍNH', 'rare', 'Tham gia 5 sự kiện'),
            A('just_fun', '😅', 'THẤT HỨA VẬY -_-', 'mythic', 'Tham gia 10 sự kiện liên tiếp rồi bỏ hết', true),
            A('ngu', '🏆', 'KHÔNG BAO GIỜ BỎ CUỘC', 'mythic', 'Bét bảng một cuộc thi nhưng vẫn tham gia đều', true),
            A('contest_3rd', '➂', 'TOP 3 CŨNG LÀ TOP', 'epic', 'Giải Ba một cuộc thi'),
            A('contest_2nd', '➁', 'Á QUÂN NGẦU', 'epic', 'Giải Nhì một cuộc thi'),
            A('contest_1st', '♛', 'W ĐẬM — VƯƠNG VỚI CÓI', 'legendary', 'Giải Nhất/thắng sự kiện — W vàng lạt')
        ]},
        { group: 'LORE / THE MAZE', items: [
            A('first_contact', '◉', 'LẦN ĐẦU RÉN', 'common', 'Đọc hồ sơ thực thể đầu tiên (hơi sợ tí)'),
            A('survivor', '☗', 'SỐNG SÓT QUA ĐÊM', 'common', 'Đọc hết Thủ Tục Sinh Tồn'),
            A('the_hollow', '⊘', 'ĐỪNG CHỚP MẮT', 'rare', 'Đọc hồ sơ The Hollow (MA-E001) 👁️'),
            A('deep_diver', '⇊', 'CẤM MÀ CỨ ĐỌC', 'epic', 'Đọc 1 hồ sơ mức bảo mật cao'),
            A('whisper', '◌', '??? (tiếng thì thầm)', 'legendary', 'Tự đi mà tìm easter egg 👀', true),
            A('sigma_lurker', '🗿', 'SIGMA MẶT LẠNH', 'epic', 'Đọc 100 bài nhưng 0 bình luận — kẻ bí ẩn', true),
            A('what_you_want', '❓', 'BẠN MUỐN LÀM GÌ?', 'mythic', 'Liên tục đánh giá thấp bài viết/blog của ad', true),
            A('open_door', '🥚', 'GÕ CỬA CỐC CỐC', 'epic', 'Click vào logo M.A.P.L.E 10 lần liên tục', true),
            A('maple_secret', '🍁', 'BÍ MẬT LÁ PHONG', 'rare', 'Kích hoạt hiệu ứng lá phong rơi trên trang chủ', true),
            A('eye_of_maple', '👁️', 'MẮT THẦN LORE', 'rare', 'Mở khóa câu chuyện lore ẩn từ logo', true)
        ]},
        { group: 'ĐẶC BIỆT / DANH DỰ', items: [
            A('donor', '♥️', 'MẠNH THƯỜNG QUÂN', 'rare', 'Donate ủng hộ Wiki ❤️'),
            A('donor_gold', '👑', 'ĐẠI GIA / WHALE 🐋', 'legendary', 'Donate mức cao (BQT ghi nhận)'),
            A('happy_birthday', '🎂', 'CẢM ƠN VÌ QUÀ SINH NHẬT', 'mythic', 'Donate ngay sinh nhật của wiki', true),
            A('founder_era', '⬡', 'OG GEN ĐẦU', 'epic', 'Tham gia năm đầu của Wiki'),
            A('staff', '⚙️', 'NGƯỜI CẦM QUYỀN', 'legendary', 'BQT/Admin/Dev của M.A.P.L.E'),
            A('beta_tester', '⚗️', 'CHUỘT BẠCH TỰ NGUYỆN', 'rare', 'Thử tính năng beta + góp ý'),
            A('bug_hunter', '🐛', 'THỢ SĂN BUG', 'rare', 'Báo lỗi kỹ thuật được ghi nhận'),
            A('bot_account', '⌨️', 'BEEP BOOP 🤖', 'rare', 'Bot hệ thống tự động'),
            A('helping_hand', '✋', 'NGƯỜI TỐT VIỆC TỐT', 'rare', 'Giúp newbie/trả lời FAQ 10 lần')
        ]},
        { group: 'LỄ HỘI VIỆT NAM', items: [
            A('tet_reunion', '🧧', 'SUM VẦY TẾT', 'rare', 'Online dịp Tết Nguyên Đán — gia đình sum vầy'),
            A('pregame_tet', '✨', 'CHUẨN BỊ LỄ', 'common', 'Hoạt động từ 20 Chạp trở lên (pre-Tết)'),
            A('tet_lucky_7', '🎆', 'MAY MẮN TẾT', 'epic', 'Đăng bài vào 1–7 Tết (ngày lành)'),
            A('lucky_money', '🧧', 'LÌ XÌ ĐẦU NĂM', 'mythic', 'Donate cho wiki dịp Tết', true),
            A('watch_fireworks', '🎇', 'PHÁO HOA ĐẬP LÊN!', 'immortal', 'Online đúng lúc bắn pháo hoa — đặc biệt thực sự', true),
            A('so_free', '📱', 'TẾT RỒI RẢNH LẮM', 'artifact', 'Hoạt động 24/7 trong wiki ngày Tết', true),
            A('new_year_cleaning', '🧹', 'DỌN DẸP SẠCH SẼ', 'ancient', 'Sửa/xóa 50+ lỗi chính tả hoặc trang rác ngày 29–30 Tết', true),
            A('first_footer', '🚪', 'XÔNG ĐẤT MAY MẮN', 'mythic', 'Người đầu chỉnh sửa/đăng bài sau giao thừa (00:01–00:05)', true),
            A('lucky_scholar', '🖌️', 'KHAI BÚT ĐẦU XUÂN', 'ultimate', 'Viết bài chất lượng cao vào mùng 1 Tết', true),
            A('festival_master', '🐉', 'TRẢY HỘI MÙA XUÂN', 'divine', 'Hoàn thành all event Tết', true),
            A('new_year_wish', '🌟', 'ƯỚC NGUYỆN ĐẦU NĂM', 'common', 'Đăng blog/bình luận về ước nguyện năm mới', true),
            A('spring_blessing', '🧧', 'LỘC ĐẦU NĂM', 'rare', 'Nhận lì xì từ BQT/members trong 3 ngày Tết', true),
            A('lantern_fest', '🏮', 'VÔN VĂN SÁNG TRĂNG', 'rare', 'Online dịp Trung Thu — chiêm ngưỡng đêm trăng'),
            A('moon_dreamer', '🌙', 'ƯỚC MƠ VỚI TRĂNG', 'rare', 'Làm gì đó đặc biệt lúc Trung Thu (cảm xúc)'),
            A('womens_tribute', '♀️', 'CHỊ ĐẠO MAZE', 'rare', 'Online dịp 8/3'),
            A('teacher_legend', '📚', 'SU PHỤ THANH NIÊN', 'rare', 'Đóng góp ngày 20/11 — vinh danh người thầy'),
            A('code_ninja', '💻', 'LẬP TRÌNH ĐẢO LẠC', 'epic', 'Online dịp 12–13/9 (Lập Trình Viên) — dev flex'),
            A('freedom_spirit', '🇻🇳', 'TỔNG KHỞI NGHĨA', 'epic', 'Đóng góp vào 2/9 — nước nhà nước nhân dân'),
            A('harvest_scholar', '🌾', 'TÒ MỤC NGÀN GIỤ', 'epic', 'Đọc sạch 1 series liên kết (harvest knowledge)'),
            A('child_spirit', '🎡', 'TRẺ CON VỚI MAZE', 'common', 'Tham gia sự kiện liên quan trẻ em/Tết thiếu nhi'),
            A('ancestor_honor', '🙏', 'TỔNG TIÊN LÃO', 'epic', 'Viết về lịch sử/tổ tiên Việt Nam'),
            A('heartfelt', '❤️', 'QUÝ VỊ TRONG TIM', 'rare', 'Active trên Valentine + viết bài lãng mạn'),
            A('pilgrim_soul', '🛕', 'HÀNH HƯƠNG MAZY', 'legendary', 'Khám phá tất cả 7 Cấp Độ Mê Cung')
        ]},
        { group: 'GIÁNG SINH', items: [
            A('christmas_spirit', '🎄', 'TINH THẦN GIÁNG SINH', 'rare', 'Online đêm Giáng Sinh (24/12) + gửi lời chúc', true),
            A('santa_helper', '🎁', 'TRỢ LÝ ÔNG GIÀ NOEL', 'epic', 'Tặng quà cho 5 members dịp Giáng Sinh', true),
            A('santa', '🎅', 'ÔNG GIÀ NOEL', 'common', 'Tặng quà cho toàn bộ wiki (kể cả admin)', true),
            A('nice_child', '😇', 'ĐỨA TRẺ NGOAN', 'rare', 'Được admin tặng quà', true),
            A('very_nice_child', '👼', 'ĐỨA TRẺ CỰC NGOAN', 'epic', 'Được cả wiki tặng quà', true),
            A('perfect_santa', '💰', 'ÔNG GIÀ HOÀN HẢO', 'legendary', 'Donate cho wiki dịp Giáng Sinh', true),
            A('santa_or_satan', '😈', 'ÔNG NỘI HAY ÁC QUỶ?', 'mythic', 'Online đêm Giáng Sinh + chửi admin (rồi bị ban)', true)
        ]},
        { group: 'EASTER EGG & ẨN', items: [
            A('self_love', '🪞', 'GƯƠNG XA MAY', 'common', 'Like chính comment của mình 5 lần — self-simp ớn', true),
            A('obsessed_editor', '🔄', 'MA CHỈNH SỬA', 'rare', 'Sửa chính bài 100+ lần 1 ngày — OCD quá', true),
            A('void_voice', '💬', 'NƯỚC NGOÀI', 'epic', 'Comment trên trang 404 — nói với hư không', true),
            A('search_junkie', '🔍', 'TÌM KIẾM CUỒNG', 'rare', 'Tìm cùng 1 từ 200+ lần tuần — ghiền tìm', true),
            A('avatar_swap', '👯', 'COSPLAY SPEEDRUN', 'rare', 'Đổi avatar 7 lần trong 24h — đổi như chơi', true),
            A('speedrunner', '⚡', 'CHƠI LIÊN TỤC', 'epic', 'Viết + duyệt 10 bài trong 1 giờ — flow state', true),
            A('midnight_opus', '🌌', 'TIẾNG GỌI ĐÊM', 'epic', 'Viết bài 5k+ từ lúc 2–5h sáng — peak time', true),
            A('echo_seeker', '📡', 'TÌM ECHO', 'rare', 'Để tin nhắn với chính mình 10 lần', true),
            A('easter_collector', '🥚', 'TRỨNG PHỤC SINH', 'legendary', 'Tìm 10 easter egg riêng biệt trên Wiki', true),
            A('parallel_soul', '👥', 'NHÂN VẬT SONG', 'epic', 'Tạo 2 account có RP hoàn toàn giống nhau (?)', true),
            A('forbidden_lore', '🔐', 'LỊN LƯỢM', 'epic', 'Đọc bài bảo mật cao lúc 4–6h sáng', true),
            A('comment_phantom', '👻', 'COMMENT 幻', 'rare', 'Viết comment 1000+ từ rồi xoá (regret)', true),
            A('deja_vu', '♲', 'NHÂN SINH CÓ CHÍ', 'epic', 'Viết 2 bài nội dung hệt nhau (parallel)', true),
            A('time_capsule', '🕰️', 'HỘP THỜI GIAN', 'legendary', 'Đăng bài lúc 00:00 ngày 1/1 — timing perfect', true),
            A('wiki_ghost', '👻', 'BÓNG MA WIKI', 'epic', 'Đọc 100 bài mà 0 like/comment/edit — vô hình', true),
            A('the_matrix', '💊', 'MA TRẬN', 'rare', 'Click liên kết ẩn → trang không tồn tại (5 lần)', true),
            A('inception', '🌀', 'GIẤC MƠ TRONG MƠ', 'epic', 'Viết bài về giấc mơ hoặc thế giới song song', true),
            A('glitch_in_matrix', '👾', 'LỖI MA TRẬN', 'legendary', 'Phát hiện + báo cáo bug hệ thống nghiêm trọng', true),
            A('fourth_wall', '🎭', 'PHÁ VỠ TƯỜNG THỨ TƯ', 'epic', 'Tương tác sáng tạo với BQT về nội dung Wiki', true),
            A('time_loop', '♾️', 'VÒNG LẶP THỜI GIAN', 'rare', 'Đăng bài lặp lại chính xác sau 24h', true),
            A('paradox', '☯️', 'NGHỊCH LÝ', 'epic', 'Tạo tình huống mâu thuẫn hoặc khó hiểu', true)
        ]},
        { group: 'GEEK & LẬP TRÌNH', items: [
            A('system_overflow', '💥', 'TRÀO BỘ NHỚ', 'rare', 'Nhập 10 lệnh tìm kiếm sai hoặc làm treo trang'),
            A('hello_world', '👋', 'KHỞI NGUYÊN ĐẢO', 'common', 'Bài/bình luận đầu = "Hello World" thôi'),
            A('missing_semi', '🛑', 'CHẤM PHẨY NƠI ĐÂY', 'rare', 'Đăng bài lúc 4:04 sáng hoặc tìm trang 404 liên'),
            A('binary_soul', '🤖', 'LINH HỒN NHỊ PHÂN', 'epic', 'Tương tác chạm mốc: 2, 4, 8, 16, 32, 64...', true),
            A('code_breaker', '🔓', 'PHÁ MÃ', 'epic', 'Giải mã đoạn mã ẩn trong Wiki', true),
            A('debug_mode', '🐞', 'CHẾ ĐỘ GỠ LỖI', 'rare', 'Dùng dev tools để inspect mã nguồn Wiki', true),
            A('syntax_error', '❌', 'LỖI CÚ PHÁP', 'common', 'Đăng code/công thức lỗi nhưng hệ thống chấp nhận', true),
            A('open_source', '🌐', 'MÃ NGUỒN MỞ', 'epic', 'Đóng góp mã hoặc đề xuất cải tiến kỹ thuật', true),
            A('algorithm_master', '🧠', 'THUẬT TOÁN GIA', 'legendary', 'Giải câu đố logic/thuật toán phức tạp ẩn', true)
        ]},
        { group: 'HÀNH VI KỲ LẠ & TROLL', items: [
            A('konami_code', '🕹️', 'PHÁ ĐẢO HUYỀN THOẠI', 'legendary', 'Nhấn ↑↑↓↓←→←→BA (Konami cheat code)'),
            A('night_stalker', '🦉', 'MA CÀ RÔ MAZE', 'rare', 'Online 1–4h sáng liên tục mà không post'),
            A('typo_intentional', '✍️', 'CHÚA TỂ CHÍNH TẢ', 'common', 'Viết 5+ từ sai chuẩn cố ý nhưng vẫn pass duyệt', true),
            A('clickbait_addict', '🖱️', 'BẤM VÔ VÔ ĐỊNH', 'rare', 'Click icon trang trí 20 lần liên tục', true)
        ]},
        { group: 'VĂN HÓA & TRUYỀN THUYẾT', items: [
            A('bamboo_warrior', '🎋', 'THÁNH GIÓNG BAY LÊN', 'epic', 'Hoàn 3 Cấp Độ Mê Cung liên tiếp 1 ngày'),
            A('magic_treasure', '🏹', 'TRẢ CƠ ĐỒ', 'rare', 'Bị hệ thống gỡ danh hiệu do lỗi/gian lận'),
            A('turtle_wisdom', '🐢', 'HOÀN KIẾM TÙ MỤC', 'epic', 'Tìm link ẩn dưới footer/đáy trang web'),
            A('mountain_peak', '⛰️', 'NÚI CAO VẠN TRƯỢNG', 'rare', 'Post bài ngay sau khi acc bị khóa (nước dâng)')
        ]},
        { group: 'BẬT CÔNG TẮC', items: [
            A('secret_agent', '🕵️', 'ĐIỆP VIÊN MAZE', 'rare', 'Tìm kiếm "Easter Egg" đúng 7 lần'),
            A('time_traveler', '⏳', 'KẺ TRỘM THỜI GIAN', 'epic', 'Edit bài cũ 1 năm trước + thêm từ khóa mới')
        ]},
        { group: 'BỐN MÙA VIỆT NAM', items: [
            A('spring_traveler', '⛰️', 'TRẨY HỘI TRĂNG TƠN', 'common', 'Tham gia sự kiện lễ hội/viết về chùa Hương'),
            A('dragon_ascends', '🐉', 'CÁ CHÉP HÓA RỒNG', 'epic', 'Đạt cột mốc quan trọng trước 23 Chạp'),
            A('green_sprout', '🌱', 'ĐÂM TRỒI NẢY LỘC', 'common', 'Tạo acc/post bài đầu tiên trong Lập Xuân'),
            A('cold_food_fest', '🍡', 'BÁNH TRÔI NƯỚC', 'rare', 'Online + tương tác ngày Hàn Thực (3/3 âm lịch)'),
            A('summer_vibe', '🌊', 'TIẾNG VE ĐẦU ĐỜI', 'common', 'Chia sẻ ký ức học trò/hoa phượng tháng 5–6'),
            A('monsoon_warrior', '⛈️', 'VƯỢT QUA GIÔNG BÃO', 'rare', 'Hoạt động liên tục suốt mùa mưa bão tháng 7'),
            A('exam_hero', '💯', 'SỨ TẬT VƯỢT MÔN', 'epic', 'Hoàn thành thử thách khó dịp thi cử tháng 6–7', true),
            A('reunification', '🕊️', 'GIANG SƠN THỐNG NHẤT', 'epic', 'Đóng góp lớn dịp 30/4 – 1/5 Giải Phóng'),
            A('back_to_school', '🎒', 'KHAI TRƯỜNG ĐẢO', 'common', 'Đăng nhập/hoạt động đúng ngày khai giảng 5/9'),
            A('monsoon_chill', '🧣', 'GIÓ MÙA ĐÔ BẮC', 'rare', 'Chia sẻ cảm xúc khi đón gió lạnh đầu mùa'),
            A('capital_soul', '🌼', 'HÀ NỘI 12 MÙA HOA', 'epic', 'Viết về danh lam thắng cảnh Việt Nam tháng 10'),
            A('cozy_winter', '🍲', 'ĐÔNG CHÍ SUM VẦY', 'common', 'Tham gia sự kiện nhóm/chia sẻ công thức nấu ăn'),
            A('year_in_review', '⏳', 'NHÌN LẠI NĂM QUA', 'epic', 'Viết bài tổng kết hành trình trước 31/12'),
            A('christmas_gift', '🎄', 'GIÁNG SINH ĐẢO ĐÁ', 'rare', 'Tặng quà/kiến thức cho members vào 24/12')
        ]}
    ];

    /* ═══════════════ HUY HIỆU — 13 loại ═══════════════ */
    var BADGE_TYPES = [
        { type: 'role', label: 'HUY HIỆU VAI TRÒ', note: 'Tự động theo nhóm quyền', items: [
            B('b_guest', '👤', 'KHÁCH VÃNG LAI', 'common', 'Chưa đăng nhập — lurk cho vui'),
            B('b_reader', '◔', 'ĐỘC GIẢ', 'common', 'Đăng nhập, mới vào nghề'),
            B('b_member', '◉', 'THÀNH VIÊN', 'rare', 'Tài khoản đã xác thực'),
            B('b_writer', '✍', 'CÂY BÚT (Writer)', 'rare', 'Được BQT duyệt làm Writer'),
            B('b_reviewer', '⚑', 'TAY DUYỆT (KDV)', 'epic', 'Được cấp quyền Kiểm Duyệt Viên'),
            B('b_dev', '⟡', 'CODER (Dev)', 'epic', 'Interface-admin / lập trình viên'),
            B('b_sysop', '⚙', 'SẾP HỆ THỐNG', 'legendary', 'Quản Trị Viên / Admin'),
            B('b_founder', '♔', 'TRÙM SÒ (Founder)', 'legendary', 'Người sáng lập / bureaucrat'),
            B('b_bot', '🤖', 'BEEP BOOP', 'rare', 'Tài khoản bot hệ thống'),
            B('b_banned', '⊘', 'TÙ NHÂN MAZE', 'common', 'Bị cấm (tên gạch ngang, sọc đỏ cảnh báo)')
        ]},
        { type: 'frame', label: 'KHUNG UY TÍN', note: 'Tự động theo RP — viền quanh avatar', items: [
            B('f_t0', '▢', 'KHUNG TÂN BINH', 'common', 'Tier 0 (0–49 RP) — viền xám mờ'),
            B('f_t1', '▣', 'KHUNG ĐÁNG TIN', 'rare', 'Tier 1 (≥50 RP) — viền xanh nhạt'),
            B('f_t2', '◈', 'KHUNG CỘNG TÁC', 'epic', 'Tier 2 (≥200 RP) — viền cyan'),
            B('f_t3', '❖', 'KHUNG LÃO LÀNG', 'epic', 'Tier 3 (≥500 RP) — viền tím'),
            B('f_t4', '✪', 'KHUNG HUYỀN THOẠI', 'legendary', 'Tier 4 (≥1500 RP) — viền vàng phát sáng')
        ]},
        { type: 'season', label: 'HUY HIỆU MÙA / SỰ KIỆN', note: 'Limited — đóng là hết', items: [
            B('s_tet', '🧧', 'LÌ XÌ MAZE', 'rare', 'Online dịp Tết Nguyên Đán', { limited: true }),
            B('s_tet_early', '✨', 'CHUẨN BỊ TẾT XỨNG XỈ', 'common', 'Online từ 20 tháng Chạp', { limited: true }),
            B('s_halloween', '☠', 'ĐÊM MA MAZE', 'rare', 'Hoạt động dịp Halloween', { limited: true }),
            B('s_xmas', '❅', 'GIÁNG SINH LẠNH', 'rare', 'Hoạt động dịp Giáng Sinh', { limited: true }),
            B('s_birthday', '🎂', 'SINH NHẬT WIKI', 'epic', 'Online đúng dịp sinh nhật M.A.P.L.E', { limited: true }),
            B('s_summer', '☀', 'HÈ RỰC LỬA', 'rare', 'Tham gia sự kiện hè', { limited: true }),
            B('s_newyear', '🎆', 'ĐÓN NĂM MỚI', 'rare', 'Online dịp Tết Dương lịch', { limited: true }),
            B('s_valentine', '❤️', 'CRUSH CỦA MAZE', 'rare', 'Online dịp Valentine', { limited: true }),
            B('s_midautumn', '🏮', 'TRĂNG RẰM MAZE', 'rare', 'Online dịp Trung Thu', { limited: true }),
            B('s_aprilfools', '🤡', 'CÁ THÁNG TƯ', 'rare', 'Online dịp Cá tháng Tư', { limited: true }),
            B('s_pride', '🌈', 'CẦU VỒNG MAZE', 'rare', 'Online dịp Pride Month', { limited: true }),
            B('s_earthday', '🌍', 'NGÀY TRÁI ĐẤT', 'rare', 'Online dịp Ngày Trái Đất', { limited: true }),
            B('s_womensday', '♀️', 'NỮ CƯỜNG MAZE', 'rare', 'Online dịp Quốc tế Phụ nữ', { limited: true }),
            B('s_teachersday', '📚', 'SU PHỤ THANH NIÊN', 'rare', 'Online dịp 20/11 Ngày Giáo dục VN', { limited: true }),
            B('s_vietnam_day', '🇻🇳', 'TỔNG KHỞI NGHĨA', 'epic', 'Online dịp 2/9 Quốc Khánh VN', { limited: true }),
            B('s_coder_day', '💻', 'NGÀY LẬP TRÌNH', 'rare', 'Online dịp 12–13/9 Ngày Lập trình viên', { limited: true }),
            B('s_dragon', '🐉', 'RỒNG VÀNG MAY', 'legendary', 'Sự kiện Tết Rồng (11 năm 1 lần) — ultra-rare', { limited: true })
        ]},
        { type: 'title', label: 'DANH HIỆU GHIM', note: 'Mở từ thành tựu rồi chọn đeo cạnh tên', items: [
            B('t_goat', '★', '«GOAT Làng Viết»', 'legendary', 'Mở khoá thành tựu writer_100 rồi ghim'),
            B('t_og', '◆', '«OG»', 'epic', 'Mở khoá tier_3 (Lão Làng) rồi ghim'),
            B('t_legend', '✪', '«Huyền Thoại»', 'legendary', 'Mở khoá tier_4 rồi ghim'),
            B('t_curator', '⚑', '«Bảo Kê»', 'epic', 'Mở khoá curator rồi ghim'),
            B('t_lore', '◎', '«Mọt Lore»', 'rare', 'Mở khoá lore_seeker rồi ghim'),
            B('t_donor', '♥', '«Mạnh Thường Quân»', 'rare', 'Mở khoá donor rồi ghim'),
            B('t_sigma', '🗿', '«Sigma»', 'epic', 'Mở khoá sigma_lurker rồi ghim'),
            B('t_yapper', '🗣️', '«Yapper»', 'epic', 'Mở khoá yapper rồi ghim'),
            B('t_slay', '💅', '«Slayyy»', 'epic', 'Mở khoá slay kịch trần rồi ghim')
        ]},
        { type: 'honor', label: 'HUY HIỆU DANH DỰ / ĐẶC BIỆT', note: 'BQT trao tay hoặc tự động', items: [
            B('h_staff', '⚙', 'NGƯỜI CẦM QUYỀN', 'legendary', 'Thành viên BQT / Admin / Dev (BQT gắn)'),
            B('h_donor', '♥', 'NHÀ TÀI TRỢ', 'rare', 'Donate ủng hộ Wiki (auto từ trang Donate)'),
            B('h_whale', '🐋', 'WHALE', 'legendary', 'Donate mức cao (BQT ghi nhận)'),
            B('h_og', '⬡', 'GEN ĐẦU', 'epic', 'Tham gia trong năm đầu của Wiki'),
            B('h_beta', '⚗', 'CHUỘT BẠCH', 'rare', 'Beta tester có góp ý được ghi nhận'),
            B('h_mvp', '♛', 'MVP THÁNG', 'epic', 'BQT trao mỗi tháng cho đóng góp nổi bật nhất'),
            B('h_human', '✓', 'NGƯỜI THẬT 100%', 'epic', 'Đạt ngưỡng "tự xác nhận con người"'),
            B('h_ghostwriter', '🔮', 'TRUYỆN BÓNG', 'epic', 'Sửa 1000+ từ trong các bài khác mà ẩn danh'),
            B('h_archaeologist', '🏺', 'CỔ VẬT HỌC', 'epic', 'Khám phá tất cả bài archived/lịch sử cũ'),
            B('h_polymath', '🧠', 'BÁCH KHOA TOÀN THƯ', 'epic', 'Đọc/viết có depth về 5+ thể loại khác nhau')
        ]},
        { type: 'secret', label: 'HUY HIỆU ẨN & EASTER EGG', note: 'Hidden tới khi unlock', items: [
            B('se_shadow', '👻', 'BẢN SẮC ẨN', 'epic', 'Mở từ easter_collector + void_voice (combo 2 secret)', { hidden: true }),
            B('se_whisper', '🤫', 'TIẾNG THẦM', 'epic', 'Unlock forbidden_lore + midnight_opus (combo late-night)', { hidden: true }),
            B('se_legends', '🗿', 'HUYỀN SỬ', 'legendary', 'Combo 5 achievement bí mật — người khắc sâu lịch sử', { hidden: true }),
            B('se_paradox', '♲', 'NGŨ HÀNH', 'legendary', 'Unlock parallel_soul + avatar_swap + déjà_vu', { hidden: true }),
            B('se_veil', '🎭', 'MÀN TRƯỚNG', 'legendary', 'Unlock 10 achievement ẩn cùng lúc — master của bí mật', { hidden: true }),
            B('se_glitch', '🌀', 'LỖI HỆ THỐNG', 'epic', 'Click logo M.A.P.L.E khi trang load error', { hidden: true }),
            B('se_watermark', '💧', 'DẤU NƯỚC', 'epic', 'Screenshot trang + tìm dấu ẩn nơi footer', { hidden: true })
        ]},
        { type: 'geek', label: 'HUY HIỆU GEEK & LẬP TRÌNH', note: 'Programmer culture', items: [
            B('g_overflow', '💥', 'TRÀO BỘ NHỚ', 'rare', 'Tìm kiếm lỗi syntax/lệnh sai 10+ lần liên tục'),
            B('g_hello', '👋', 'KHỞI NGUYÊN ĐẢO', 'common', 'Post toàn chữ "Hello World" thôi'),
            B('g_semicolon', '🛑', 'CHẤM PHẨY TẠI ĐÂY', 'rare', 'Post lúc 4:04 sáng hoặc tìm lỗi 404'),
            B('g_binary', '🤖', 'LINH HỒN NHỊ PHÂN', 'epic', 'Đạt tương tác = 2, 4, 8, 16, 32, 64, 128, 256...'),
            B('g_konami', '🕹️', 'PHÁ ĐẢO HUYỀN THOẠI', 'legendary', 'Nhấn ↑↑↓↓←→←→BA trên bàn phím tại trang chủ'),
            B('g_stackoverflow', '📚', 'LỤP XỤP STACK', 'rare', 'Spam từ khóa lập trình 50+ lần'),
            B('g_regex', '🧮', 'REGEX MASTER', 'epic', 'Viết regex quá phức tạp (20+ ký tự) nhưng nó run')
        ]},
        { type: 'troll', label: 'HUY HIỆU TROLL & HỖN LOẠN', note: 'Chaotic energy', items: [
            B('t_midnight', '🦉', 'MA CÀ RÔ MAZE', 'rare', 'Online 1–4h sáng liên tục mà không post'),
            B('t_typo', '✍️', 'CHÚA TỂ CHÍNH TẢ', 'common', 'Viết 5+ lỗi cố ý nhưng vẫn được duyệt'),
            B('t_clickbait', '🖱️', 'BẤM VÔ VÔ ĐỊNH', 'rare', 'Click icon trang trí (không link) 20 lần'),
            B('t_spam', '📢', 'THÉT CHỊ ĐÁNH ĐỨC', 'epic', 'Spam liên tục 50+ tin nhắn trong 1 giờ'),
            B('t_edit_war', '⚔️', 'CHIẾN TRANH EDIT', 'rare', 'Edit/revert cùng bài 10+ lần với người khác'),
            B('t_caps_lock', '🔊', 'ĐÓN GỌI ĐỈNH OAI', 'common', 'Viết toàn chữ IN HOA trong 100 từ liên tục'),
            B('t_selfvote', '🪞', 'TỰ SIMP', 'rare', 'Like chính comment của mình 10 lần')
        ]},
        { type: 'vn', label: 'HUY HIỆU VĂN HÓA VIỆT NAM', note: 'Cultural pride', items: [
            B('v_bamboo', '🎋', 'THÁNH GIÓNG BAY LÊN', 'epic', 'Hoàn 3 cấp độ Mê Cung trong 1 ngày'),
            B('v_treasure', '🏹', 'TRẢ CƠ ĐỒ', 'rare', 'Bị gỡ danh hiệu do lỗi hệ thống (ADVK moment)'),
            B('v_turtle', '🐢', 'HOÀN KIẾM TÙ MỤC', 'epic', 'Tìm link ẩn dưới footer'),
            B('v_mountain', '⛰️', 'NÚI CAO VẠN TRƯỢNG', 'rare', 'Post ngay sau khi acc bạn bị khóa'),
            B('v_ancestor', '🙏', 'TỔNG TIÊN LÃO', 'epic', 'Viết về lịch sử/tổ tiên Việt Nam'),
            B('v_silk_road', '🛣️', 'CON ĐƯỜNG TƠ LỤA', 'epic', 'Explore 7+ bài về lịch sử thương mại/giao lưu'),
            B('v_dragon', '🐉', 'CÁ CHÉP HÓA RỒNG', 'epic', 'Đạt mục tiêu lớn trước 23 Chạp (Tết Táo)'),
            B('v_lacquer', '🎨', 'SƠN MÀI MAZE', 'rare', 'Tạo/sửa bài với màu sắc/thiết kế đặc biệt'),
            B('v_lantern', '🏮', 'VÔN VĂN SÁNG TRĂNG', 'rare', 'Online dịp Trung Thu + đọc bài trad về Trăng')
        ]},
        { type: 'seasonal', label: 'HUY HIỆU MÙA & THIÊN NHIÊN', note: 'Seasonal/nature vibes', items: [
            B('s_tet_eve', '✨', 'CHUẨN BỊ TẾT XỨNG XỈ', 'common', 'Online từ 20 tháng Chạp'),
            B('s_tet_luck', '🧧', 'MAY MẮN TẾT', 'epic', 'Post bài ngày 1–7 Tết (ngày lành)'),
            B('s_spring_new', '🌱', 'TIẾT LẬP XUÂN', 'common', 'Post lúc Lập Xuân (thường 4–5/2)'),
            B('s_cozy_rain', '🌧️', 'MƯA VẦN MAZE', 'rare', 'Active khi trời mưa (location-based hint)'),
            B('s_summer_hot', '☀️', 'HÈ RỰC LỬA', 'rare', 'Post 10+ bài trong tháng hè (6–8)'),
            B('s_autumn_sad', '🍂', 'LẠNH MƯỚT THU', 'rare', 'Viết tản văn buồn vào mùa thu'),
            B('s_winter_cozy', '❄️', 'ĐÔNG CHÍ SUM VẦY', 'common', 'Chia sẻ nấu ăn/ấm áp vào Đông Chí'),
            B('s_monsoon', '⛈️', 'VƯỢT QUA GIÔNG BÃO', 'rare', 'Active liên tục suốt mưa bão'),
            B('s_drought', '🔥', 'NẮNG KINH HOÀNG', 'rare', 'Online khi nhiệt độ >35°C (theo vị trí)')
        ]},
        { type: 'holiday', label: 'HUY HIỆU LỄ VIỆT NAM', note: 'Celebrate with Wiki', items: [
            B('h_8march', '♀️', 'NỮ CƯỜNG MAZE', 'rare', 'Active/post dịp 8/3 Quốc tế Phụ nữ'),
            B('h_teachers', '📚', 'SU PHỤ THANH NIÊN', 'rare', 'Online dịp 20/11 Ngày Giáo dục'),
            B('h_vietnam', '🇻🇳', 'TỔNG KHỞI NGHĨA', 'epic', 'Online dịp 2/9 Giải Phóng'),
            B('h_coder_day', '💻', 'LẬP TRÌNH ĐẢO LẠC', 'rare', 'Active dịp 12–13/9 Programmer Day'),
            B('h_valentine', '❤️', 'CRUSH CỦA MAZE', 'rare', 'Post lãng mạn/tình cảm vào 14/2'),
            B('h_children', '👶', 'TRẺ CON MAZE', 'common', 'Active dịp 1/6 Quốc tế Thiếu nhi'),
            B('h_reunite', '🕊️', 'GIANG SƠN THỐNG NHẤT', 'epic', 'Post bài về 30/4–1/5'),
            B('h_midautumn', '🌕', 'TRĂNG RẰM MAZE', 'rare', 'Online dịp Trung Thu + kể chuyện cổ tích')
        ]},
        { type: 'knowledge', label: 'HUY HIỆU BÁCH KHOA & KIẾN THỨC', note: 'Knowledge hoarder', items: [
            B('k_polyglot', '🗣️', 'ĐA NGÔN NGỮ', 'epic', 'Viết bài/comment với 3+ ngôn ngữ khác nhau'),
            B('k_researcher', '🔬', 'NHÀ KHOA HỌC', 'epic', 'Cite 10+ tài liệu trong 1 bài'),
            B('k_philosopher', '🧠', 'NHÀ TRIẾT HỌC', 'epic', 'Viết bài >3k từ về lý thuyết/tâm lý'),
            B('k_meme_lord', '😂', 'CHÚA TỂ MEME', 'common', 'Post 10 meme hợp lệ'),
            B('k_speedread', '⚡', 'ĐỌC CHỚP', 'rare', 'Đọc 20 bài trong 1 giờ (dwell time tối thiểu)'),
            B('k_visual_art', '🎨', 'HOẠ SĨ MAZE', 'rare', 'Upload/tạo 20+ ảnh/artwork')
        ]},
        { type: 'combo', label: 'HUY HIỆU COMBO & HIDDEN', note: 'Multi-achievement unlock', items: [
            B('c_mastery', '👑', 'THẤU ĐẠO VĂN PHÒNG', 'legendary', 'Unlock 20+ huy hiệu từ 5 loại khác nhau', { hidden: true }),
            B('c_mad_lad', '🤪', 'ĐIÊN CUỒNG MÔ PHẠM', 'legendary', 'Unlock 10 ẩn + 10 geek huy hiệu cùng lúc', { hidden: true }),
            B('c_cultured', '🎭', 'NHÂN VẬT VĂN HOÁ', 'epic', 'Unlock 5 huy hiệu Việt Nam + 5 geek cùng lúc', { hidden: true }),
            B('c_time_lord', '⏰', 'CHỦNG TỘC THỜI GIAN', 'legendary', 'Unlock huy hiệu từ mỗi mùa (4 mùa tất cả)', { hidden: true }),
            B('c_chaos', '🌀', 'HỖN LOẠN MAZE', 'legendary', 'Unlock 1 từ mỗi loại 7.1–7.13 cùng ngày', { hidden: true })
        ]}
    ];

    /* ── Flatten + index ── */
    var achievements = [];
    var achById = {};
    ACH_GROUPS.forEach(function (g) {
        g.items.forEach(function (a) { a.group = g.group; achievements.push(a); achById[a.id] = a; });
    });

    var badges = [];
    var badgeById = {};
    BADGE_TYPES.forEach(function (t) {
        t.items.forEach(function (b) { b.type = t.type; b.typeLabel = t.label; badges.push(b); badgeById[b.id] = b; });
    });

    /* ── Helpers ── */
    function rarityRP(r) { return (RARITY[r] && RARITY[r].rp) || 0; }

    function isAchievement(id) { return !!achById[id]; }

    function byId(id) { return achById[id] || badgeById[id] || null; }

    /* RP = tổng điểm của các THÀNH TỰU đã trao (huy hiệu cho 0 RP). */
    function computeRP(awarded) {
        if (!awarded || !awarded.length) return 0;
        var sum = 0;
        for (var i = 0; i < awarded.length; i++) {
            var id = awarded[i] && awarded[i].id;
            var a = id && achById[id];
            if (a) sum += rarityRP(a.rarity);
        }
        return sum;
    }

    function tierOf(rp) {
        var t = TIERS[0];
        for (var i = 0; i < TIERS.length; i++) { if (rp >= TIERS[i].min) t = TIERS[i]; }
        return t;
    }
    function nextTier(rp) {
        for (var i = 0; i < TIERS.length; i++) { if (rp < TIERS[i].min) return TIERS[i]; }
        return null; /* đã max */
    }

    /* Trang lưu thành tựu TỰ GHI NHẬN của 1 user (đồng bộ qua thiết bị) */
    function userAchPage(name) {
        return 'Thành viên:' + String(name || '').replace(/ /g, '_') + '/Maple-Achievements.json';
    }
    /* Dựng 1 entry hiển thị từ id (+ ngày) — để merge vào danh sách đã trao */
    function entryFromId(id, date) {
        var a = byId(id);
        if (!a) return null;
        var normDate = date || '';
        // Chuẩn hóa định dạng ngày cũ DD/MM/YYYY sang YYYY-MM-DD nếu cần
        if (normDate && /^\d{2}\/\d{2}\/\d{4}$/.test(normDate)) {
            var parts = normDate.split('/');
            normDate = parts[2] + '-' + parts[1] + '-' + parts[0];
        }
        return {
            id: id, icon: a.icon, label: a.label, desc: a.desc,
            category: (a.group || a.typeLabel || ''), rarity: a.rarity, date: normDate, self: true
        };
    }
    /* Gộp danh sách trung tâm + map earned tự ghi nhận → danh sách entry (loại trùng theo id) */
    function mergeEarned(centralList, earnedMap) {
        var out = (centralList || []).slice().map(function(item) {
            if (item && item.date && /^\d{2}\/\d{2}\/\d{4}$/.test(item.date)) {
                var parts = item.date.split('/');
                item.date = parts[2] + '-' + parts[1] + '-' + parts[0];
            }
            return item;
        });
        var seen = {};
        out.forEach(function (e) { if (e && e.id) seen[e.id] = true; });
        if (earnedMap) {
            Object.keys(earnedMap).forEach(function (id) {
                if (seen[id]) return;
                var e = entryFromId(id, earnedMap[id]);
                if (e) { out.push(e); seen[id] = true; }
            });
        }
        return out;
    }

    window.MAPLE.catalog = {
        RARITY: RARITY,
        TIERS: TIERS,
        achGroups: ACH_GROUPS,
        badgeTypes: BADGE_TYPES,
        achievements: achievements,
        badges: badges,
        byId: byId,
        isAchievement: isAchievement,
        rarityRP: rarityRP,
        computeRP: computeRP,
        tierOf: tierOf,
        nextTier: nextTier,
        userAchPage: userAchPage,
        entryFromId: entryFromId,
        mergeEarned: mergeEarned
    };
})();
