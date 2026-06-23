/**
 * M.A.P.L.E — MediaWiki:TroGiup-Glossary.js  (mhd3)
 * Trang Trợ_giúp:Glossary — từ điển thuật ngữ
 */
(function () {
    'use strict';

    var pn = (typeof mw !== 'undefined' && mw.config) ? mw.config.get('wgPageName') : '';
    var decoded = decodeURIComponent(location.pathname);
    if (!pn && !/Glossary/i.test(decoded)) return;
    if (pn && pn !== 'Trợ_giúp:Glossary' && !/Glossary/i.test(decoded)) return;

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
        });
    }

    function whenReady(cb) {
        if (window.MHHelp) return cb(window.MHHelp);
        if (typeof mw !== 'undefined' && mw.hook) mw.hook('maple.help.ready').add(function (H) { if (H) cb(H); });
        var n = 0, t = setInterval(function () {
            if (window.MHHelp) { clearInterval(t); cb(window.MHHelp); }
            else if (++n > 40) clearInterval(t);
        }, 50);
    }

    var GLOSSARY = [
        { letter: 'E', terms: [
            { term: 'Entity',         def: 'Thực thể — bất kỳ sinh vật, anomaly, hoặc đối tượng bất thường nào trong The Maze. Được phân loại theo mức nguy hiểm và hành vi.', tags: ['Maze', 'Thực Thể'] },
            { term: 'Entity Class',   def: 'Hệ thống phân loại mức độ nguy hiểm của thực thể, từ F.I.F.R.O (an toàn tương đối) đến cực kỳ nguy hiểm.', tags: ['Phân Loại'] },
        ]},
        { letter: 'F', terms: [
            { term: 'F.I.F.R.O',      def: 'Fairly Inert, Fairly Recognizable Object — phân loại thực thể ít hoặc không chủ động tấn công, nhận dạng tương đối rõ ràng.', tags: ['Entity Class'] },
        ]},
        { letter: 'M', terms: [
            { term: 'M.A.P.L.E',      def: 'Tổ chức hư cấu trong thế giới The Maze — chịu trách nhiệm điều phối, nghiên cứu và hỗ trợ những người bị No-Clip vào The Maze.', tags: ['Tổ Chức'] },
            { term: 'Maze / The Maze',def: 'Chiều không gian mê cung hư cấu — hệ thống các phòng và hành lang vô tận, nơi những người bị No-Clip mắc kẹt.', tags: ['Thế Giới'] },
        ]},
        { letter: 'N', terms: [
            { term: 'No-Clip',        def: 'Hiện tượng hư cấu — người bị "rơi xuyên" khỏi thực tại thông thường và xuất hiện trong The Maze thay vì vị trí ban đầu.', tags: ['Hiện Tượng', 'Maze'] },
        ]},
        { letter: 'S', terms: [
            { term: 'S.O.P',          def: 'Standard Operating Procedure — quy trình vận hành tiêu chuẩn của M.A.P.L.E, ghi trong phần quy_trinh của hồ sơ thực thể.', tags: ['Giao Thức'] },
        ]},
        { letter: 'V', terms: [
            { term: 'VIS-xxx',        def: 'Mã tham chiếu ảnh — định dạng chuẩn cho data-ref của ảnh bảo mật trong hệ thống Dossier. VIS = Visual Reference.', tags: ['Hệ Thống'] },
        ]},
    ];

    function build() {
      whenReady(function (H) {
        H.mount(function (page) {
            page.appendChild(H.hero({
                crumb: 'Glossary',
                eyebrow: 'Tham khảo — Từ điển thuật ngữ',
                title: '<em>GLOSSARY</em>',
                sub: 'Giải thích các thuật ngữ và khái niệm trong M.A.P.L.E Wiki.'
            }));

            GLOSSARY.forEach(function (group) {
                var sec = H.section({ id: 'letter-' + group.letter, tag: 'Chữ cái <em>//</em> ' + group.letter, heading: '' });
                group.terms.forEach(function (it) {
                    var tags = (it.tags || []).map(function (t) {
                        return '<span class="mhd3-gloss-tag">' + esc(t) + '</span>';
                    }).join('');
                    sec.appendChild(H.prose(
                        '<span class="mhd3-gloss-term">' + esc(it.term) + '</span> — ' + esc(it.def) +
                        (tags ? '<div class="mhd3-gloss-tags">' + tags + '</div>' : '')
                    ));
                });
                page.appendChild(sec);
            });
        });
      });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else { build(); }
})();
