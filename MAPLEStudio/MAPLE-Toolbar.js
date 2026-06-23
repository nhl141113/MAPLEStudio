/* ============================================
   M.A.P.L.E — MediaWiki:MAPLE-Toolbar.js
   Định nghĩa toolbar và tất cả hành động chèn văn bản
   Yêu cầu: MAPLE-Core.js + MAPLE-Editor.js đã load trước
   ✨ CẬP NHẬT: Upload file + Giấy phép + Cảnh báo bản quyền
   ============================================ */

window.MAPLE = window.MAPLE || {};

/* ── Nút chính (hiển thị thường xuyên) ── */
MAPLE.TOOLBAR_ITEMS = [
    /* Định dạng ký tự */
    { id:'bold',    label:"B",        title:'In đậm (Ctrl+B)' },
    { id:'italic',  label:"I",        title:'In nghiêng (Ctrl+I)' },
    { id:'strike',  label:'S̶',        title:'Gạch ngang' },
    { id:'under',   label:'U̲',        title:'Gạch dưới' },
    { sep: true },
    /* Cấu trúc */
    { id:'h2',      label:'H2',       title:'Tiêu đề cấp 2' },
    { id:'h3',      label:'H3',       title:'Tiêu đề cấp 3' },
    { sep: true },
    /* Danh sách */
    { id:'ul',      label:'• UL',     title:'Danh sách dấu đầu dòng' },
    { id:'ol',      label:'1. OL',    title:'Danh sách đánh số' },
    { id:'indent',  label:'→',        title:'Thụt lề' },
    { sep: true },
    /* Chèn thường dùng */
    { id:'link',    label:'[[LK]]',   title:'Liên kết nội bộ (Ctrl+K)' },
    { id:'file',    label:'[IMG]',    title:'Hình ảnh / Tệp' },
    { id:'dossier', label:'[DOS]',    title:'Chèn Dossier' },
{ id:'maple_rating',     label:'[PCL]',   title:'Phân loại nội dung' },
{ id:'maple_diary',     label:'[Nhật kí]', title:'Hồ sơ Nhật ký' },
{ id:'maple_entity',     label:'[Thực thể]', title:'Hồ sơ Thực thể' },
{ id:'maple_item',     label:'[Vật phẩm]', title:'Hồ sơ Vật phẩm' },
{ id:'maple_classified', label:'[MẬT]',   title:'Khối hồ sơ mật' },
{ id:'maple_redacted',   label:'[███]',   title:'Cụm từ bị xoá' },
{ id:'maple_img',        label:'[CHE]',   title:'Che ảnh' },
    { sep: true },
    /* Ký tên */
    { id:'sign',    label:'[[~]]',    title:'Ký tên' },
    /* Nút mở rộng */
    { id:'more',    label:'[+]',      title:'Thêm công cụ' },
    { sep: true },
    /* Phải */
    { id:'wikitag', label:'[WIKI-TAG]', title:'Wiki tags' },
    { id:'encoding',label:'UTF-8',    title:'Bộ mã hoá', right: true },
];

/* ── Nút ẩn trong [+] ── */
MAPLE.TOOLBAR_MORE = [
    { id:'sup',     label:'Xⁿ',       title:'Chỉ số trên',              d:'Chỉ số trên' },
    { id:'sub',     label:'Xₙ',       title:'Chỉ số dưới',              d:'Chỉ số dưới' },
    { id:'h4',      label:'H4',       title:'Tiêu đề cấp 4',            d:'Tiêu đề cấp 4' },
    { id:'hr',      label:'──',       title:'Đường kẻ ngang',           d:'Đường kẻ ngang' },
    { id:'extlink', label:'[URL]',    title:'Liên kết ngoài',           d:'Liên kết ngoài' },
    { id:'table',   label:'[TBL]',   title:'Bảng',                     d:'Chèn bảng' },
    { id:'ref',     label:'[REF]',    title:'Chú thích',                d:'Chú thích <ref>' },
    { id:'reflist', label:'[REFS]',   title:'Danh sách chú thích',      d:'<references/>' },
    { id:'code',    label:'</>',      title:'Inline code',              d:'Inline code' },
    { id:'pre',     label:'[PRE]',    title:'Khối code',                d:'Khối <pre>' },
    { id:'quote',   label:'❝❞',      title:'Trích dẫn',                d:'Blockquote' },
    { id:'nowiki',  label:'[RAW]',    title:'Nowiki',                   d:'<nowiki>' },
];

/* ── Build HTML toolbar ── */
MAPLE.buildToolbarHTML = function () {
    var html = '<div class="maple-toolbar" id="maple-toolbar">';
    MAPLE.TOOLBAR_ITEMS.forEach(function (t) {
        if (t.sep) {
            html += '<span class="maple-toolbar-sep"></span>';
        } else {
            html += '<span class="maple-tool-btn' +
                (t.right  ? ' toolbar-right' : '') +
                (t.id === 'more' ? ' maple-more-btn' : '') +
                '" data-action="' + t.id + '" title="' + t.title + '">' + t.label + '</span>';
        }
    });
    html += '</div>';
    return html;
};

/* ── [+] More panel ── */
MAPLE.buildMorePanel = function () {
    var html = '<div class="maple-more-panel" id="maple-more-panel" style="display:none;">';
    MAPLE.TOOLBAR_MORE.forEach(function (t) {
        html += '<span class="maple-tool-btn maple-more-item" data-action="' + t.id +
                '" title="' + t.title + '">' +
                '<span class="maple-more-label">' + t.label + '</span>' +
                '<span class="maple-more-desc">' + t.d + '</span></span>';
    });
    html += '</div>';
    return html;
};

MAPLE.initMorePanel = function () {
    var btn = document.querySelector('.maple-more-btn');
    if (!btn) return;

    // Append thẳng vào body — thoát khỏi mọi overflow chain
    var panel = document.createElement('div');
    panel.innerHTML = MAPLE.buildMorePanel();
    document.body.appendChild(panel.firstChild);

    // Đóng khi click ngoài
    document.addEventListener('click', function () {
        var p = document.getElementById('maple-more-panel');
        if (p) p.style.display = 'none';
        if (btn) btn.classList.remove('maple-more-btn--active');
    });

    // Click item trong panel
    document.addEventListener('click', function (e) {
        var item = e.target.closest('.maple-more-item');
        if (!item) return;
        var p = document.getElementById('maple-more-panel');
        if (p) p.style.display = 'none';
        btn.classList.remove('maple-more-btn--active');
        MAPLE.Editor.tool(item.getAttribute('data-action'));
    });
};

/* ── Selection / insert helpers ── */
MAPLE.Editor = MAPLE.Editor || {};

MAPLE.Editor.initHelpers = function (textarea) {
    var ta = textarea;

    function getSel() {
        var s = ta.selectionStart, e = ta.selectionEnd;
        return {
            s: s, e: e,
            text:   ta.value.substring(s, e),
            before: ta.value.substring(0, s),
            after:  ta.value.substring(e)
        };
    }

    function apply(val, cs, ce) {
        ta.value = val;
        ta.setSelectionRange(cs, ce !== undefined ? ce : cs);
        ta.focus();
        if (typeof MAPLE.Editor.updateStats === 'function') MAPLE.Editor.updateStats();
    }

    MAPLE.Editor.wrap = function (open, close, placeholder) {
        var g = getSel();
        var inner = g.text || placeholder || '';
        apply(
            g.before + open + inner + close + g.after,
            g.before.length + open.length,
            g.before.length + open.length + inner.length
        );
    };

    MAPLE.Editor.insert = function (text) {
        var g = getSel();
        apply(g.before + text + g.after, g.before.length + text.length);
    };

    MAPLE.Editor.prefixLines = function (prefix, placeholder) {
        var g = getSel();
        if (g.text) {
            var lines = g.text.split('\n').map(function (l) { return prefix + l; }).join('\n');
            apply(g.before + lines + g.after, g.before.length, g.before.length + lines.length);
        } else {
            var ins = prefix + (placeholder || '');
            apply(g.before + ins + g.after, g.before.length + prefix.length, g.before.length + ins.length);
        }
    };
};

/* ── Hành động từng nút ── */
MAPLE.Editor.tool = function (action) {
    var wrap        = MAPLE.Editor.wrap;
    var insert      = MAPLE.Editor.insert;
    var prefixLines = MAPLE.Editor.prefixLines;
    var openModal   = MAPLE.Modal.open;
    var closeModal  = MAPLE.Modal.close;

    var userName = mw.config.get('wgUserName') || 'Người_dùng';
    var userLink = '[[Thành viên:' + userName + '|' + userName + ']] ' +
                   '([[Thảo luận Thành viên:' + userName + '|thảo luận]])';
    var now = new Date();
    var timestamp =
        now.getUTCHours().toString().padStart(2, '0') + ':' +
        now.getUTCMinutes().toString().padStart(2, '0') + ', ngày ' +
        now.getUTCDate() + ' tháng ' + (now.getUTCMonth() + 1) +
        ' năm ' + now.getUTCFullYear() + ' (UTC)';

    switch (action) {

        /* ── Định dạng ── */
        case 'bold':    wrap("'''", "'''", 'văn bản đậm'); break;
        case 'italic':  wrap("''",  "''",  'văn bản nghiêng'); break;
        case 'strike':  wrap('<s>', '</s>', 'văn bản gạch ngang'); break;
        case 'under':   wrap('<u>', '</u>', 'văn bản gạch dưới'); break;
        case 'sup':     wrap('<sup>', '</sup>', 'trên'); break;
        case 'sub':     wrap('<sub>', '</sub>', 'dưới'); break;

        /* ── Cấu trúc ── */
        case 'h2':      wrap('== ',   ' ==',   'Tiêu đề cấp 2'); break;
        case 'h3':      wrap('=== ',  ' ===',  'Tiêu đề cấp 3'); break;
        case 'h4':      wrap('==== ', ' ====', 'Tiêu đề cấp 4'); break;
        case 'hr':      insert('\n----\n'); break;

        /* ── Danh sách ── */
        case 'ul':      prefixLines('* ', 'Mục danh sách'); break;
        case 'ol':      prefixLines('# ', 'Mục đánh số'); break;
        case 'indent':  prefixLines(': ', 'Nội dung thụt lề'); break;

        /* ── Code / định dạng đặc biệt ── */
        case 'code':    wrap('<code>', '</code>', 'code'); break;
        case 'pre':     wrap('<pre>\n', '\n</pre>', 'code block'); break;
        case 'quote':   wrap('<blockquote>\n', '\n</blockquote>', 'Trích dẫn'); break;
        case 'nowiki':  wrap('<nowiki>', '</nowiki>', 'văn bản nguyên văn'); break;
        case 'sign':    insert(userLink + ' ' + timestamp); break;
        case 'reflist': insert('\n<references/>\n'); break;

        /* ── [+] MORE — toggle panel ── */
case 'more': {
    var moreItems = MAPLE.TOOLBAR_MORE.map(function(t) {
        return '<div class="ml-tag-item maple-more-modal-item" data-action="' + t.id + '">' +
               '<code>' + t.label + '</code>' +
               '<span>' + t.d + '</span>' +
               '</div>';
    }).join('');

    MAPLE.Modal.open('// THÊM CÔNG CỤ',
        '<div class="ml-tag-list" id="ml-more-list">' + moreItems + '</div>'
    );

    document.getElementById('ml-more-list').addEventListener('click', function(e) {
        var item = e.target.closest('.maple-more-modal-item');
        if (!item) return;
        MAPLE.Modal.close();
        MAPLE.Editor.tool(item.getAttribute('data-action'));
    });
    break;
}

        /* ── Dossier ── */
        case 'dossier':
            insert(
                '{{Dossier\n' +
                '| header_left    = MAPLE ARCHIVE // DOC-001\n' +
                '| header_right   = ACTIVE\n' +
                '| ticker         = Dữ liệu A // Dữ liệu B\n' +
                '| footer_hash    = 0xDEAD\n' +
                '| footer_note    = Tài liệu nội bộ\n' +
                '| side_left      = MAPLE\n' +
                '| side_right     = ARCHIVE\n' +
                '| anh_src        = \n' +
                '| anh_ref        = VIS-001\n' +
                '| anh_rating     = \n' +
                '| anh_caption    = \n' +
                '| mo_ta          = (Mô tả ngoại hình, đặc điểm nhận dạng)\n' +
                '| hanh_vi        = (Tính cách, hành vi, thói quen)\n' +
                '| quy_trinh      = (Cảnh báo, giao thức xử lý — tuỳ chọn)\n' +
                '| aux_nhan_1     = Phân Loại\n' +
                '| aux_noi_dung_1 = \n' +
                '| aux_nhan_2     = Trạng Thái\n' +
                '| aux_noi_dung_2 = \n' +
                '}}'
            );
            break;

        /* ── REF ── */
        case 'ref': {
            var ta2 = document.getElementById('maple-textarea');
            if (ta2 && ta2.selectionEnd > ta2.selectionStart) {
                wrap('<ref>', '</ref>', '');
                break;
            }
            openModal('// CHÈN CHÚ THÍCH',
                '<div class="maple-modal-field"><label>Nội dung chú thích</label>' +
                '<textarea id="ml-ref-content" rows="3" class="maple-modal-textarea" placeholder="Nguồn, tài liệu..."></textarea></div>' +
                '<div class="maple-modal-field"><label>Tên ref <span class="maple-modal-hint">(tuỳ chọn)</span></label>' +
                '<input type="text" id="ml-ref-name" placeholder="VD: nguon1"></div>' +
                '<div class="maple-modal-actions">' +
                '<button id="ml-ref-insert" class="maple-modal-btn maple-modal-btn--primary">CHÈN</button>' +
                '<button id="ml-ref-cancel" class="maple-modal-btn">HỦY</button></div>'
            );
            document.getElementById('ml-ref-cancel').onclick = closeModal;
            document.getElementById('ml-ref-insert').onclick = function () {
                var c = document.getElementById('ml-ref-content').value;
                var n = document.getElementById('ml-ref-name').value.trim();
                closeModal();
                insert((n ? '<ref name="' + n + '">' : '<ref>') + c + '</ref>');
            };
            break;
        }

        /* ── LINK nội bộ ── */
        case 'link': {
            var ta3 = document.getElementById('maple-textarea');
            var selTxt = ta3 ? ta3.value.substring(ta3.selectionStart, ta3.selectionEnd) : '';
            openModal('// LIÊN KẾT NỘI BỘ',
                '<div class="maple-modal-field"><label>Tên trang đích</label>' +
                '<input type="text" id="ml-lk-target" placeholder="Tên_trang" value="' + selTxt.replace(/"/g, '&quot;') + '"></div>' +
                '<div class="maple-modal-field"><label>Nhãn hiển thị <span class="maple-modal-hint">(để trống = tên trang)</span></label>' +
                '<input type="text" id="ml-lk-label" placeholder="Văn bản..."></div>' +
                '<div class="maple-modal-actions">' +
                '<button id="ml-lk-insert" class="maple-modal-btn maple-modal-btn--primary">CHÈN</button>' +
                '<button id="ml-lk-cancel" class="maple-modal-btn">HỦY</button></div>'
            );
            document.getElementById('ml-lk-cancel').onclick = closeModal;
            var doLink = function () {
                var t = document.getElementById('ml-lk-target').value.trim();
                var l = document.getElementById('ml-lk-label').value.trim();
                if (!t) return;
                closeModal();
                insert(l ? '[[' + t + '|' + l + ']]' : '[[' + t + ']]');
            };
            document.getElementById('ml-lk-insert').onclick = doLink;
            var mb = document.getElementById('maple-modal-body');
            mb.addEventListener('keydown', function h(e) {
                if (e.key === 'Enter') { doLink(); mb.removeEventListener('keydown', h); }
            });
            break;
        }

        /* ── LINK ngoài ── */
        case 'extlink': {
            openModal('// LIÊN KẾT NGOÀI',
                '<div class="maple-modal-field"><label>URL</label>' +
                '<input type="text" id="ml-el-url" placeholder="https://..."></div>' +
                '<div class="maple-modal-field"><label>Nhãn <span class="maple-modal-hint">(để trống = URL)</span></label>' +
                '<input type="text" id="ml-el-label" placeholder="Tên liên kết..."></div>' +
                '<div class="maple-modal-actions">' +
                '<button id="ml-el-insert" class="maple-modal-btn maple-modal-btn--primary">CHÈN</button>' +
                '<button id="ml-el-cancel" class="maple-modal-btn">HỦY</button></div>'
            );
            document.getElementById('ml-el-cancel').onclick = closeModal;
            document.getElementById('ml-el-insert').onclick = function () {
                var u = document.getElementById('ml-el-url').value.trim();
                var l = document.getElementById('ml-el-label').value.trim();
                if (!u) return;
                closeModal();
                insert(l ? '[' + u + ' ' + l + ']' : '[' + u + ']');
            };
            break;
        }

        /* ── FILE — ✨ CẬP NHẬT: Upload + Giấy phép + Cảnh báo ── */
        case 'file': {
            openModal('// HÌNH ẢNH / TỆP',
                '<div class="maple-modal-warning" style="background:#fff3cd;padding:12px;border-radius:4px;margin-bottom:16px;border-left:4px solid #ffc107;">' +
                '<strong>⚠️ CẢNH BÁO BẢN QUYỀN:</strong><br>' +
                'Hãy nhớ thêm thông tin giấy phép (nếu có) về tập tin đã tải lên. Tất cả các tập tin phải tuân theo luật bản quyền của Hoa Kỳ, bao gồm cả việc sử dụng hợp pháp. Việc không làm như vậy nhiều lần có thể dẫn đến vi phạm bản quyền cũng như khiến wiki của bạn có nguy cơ bị đóng.' +
                '</div>' +
                '<div class="maple-modal-field">' +
                '<label>📁 Tải tệp từ PC</label>' +
                '<input type="file" id="ml-fi-upload" accept="image/*,.pdf,.doc,.docx,.zip" style="padding:8px;border:1px solid #ccc;border-radius:4px;cursor:pointer;display:block;width:100%;">' +
                '<span class="maple-modal-hint" style="display:block;margin-top:6px;">Hoặc nhập tên tệp đã tồn tại trên wiki</span>' +
                '</div>' +
                '<div class="maple-modal-field"><label>Tên tệp <span class="maple-modal-hint">(không cần "Tập tin:" — định dạng: [[Tập tin:TênFile.jpg]])</span></label>' +
                '<input type="text" id="ml-fi-name" placeholder="VD: Hinh.png"></div>' +
                '<div class="maple-modal-field"><label>Chú thích</label>' +
                '<input type="text" id="ml-fi-cap" placeholder="Mô tả hình ảnh hoặc tệp..."></div>' +
                '<div class="maple-modal-field"><label>🔐 Giấy phép <span class="maple-modal-hint" style="color:#d9534f;font-weight:bold;">(bắt buộc)</span></label>' +
                '<select id="ml-fi-license" style="padding:8px;border:1px solid #ccc;border-radius:4px;width:100%;font-size:14px;">' +
                '<option value="">-- Chọn giấy phép --</option>' +
                '<option value="{{cc-by-4.0}}">Creative Commons Attribution 4.0 (CC-BY)</option>' +
                '<option value="{{cc-by-sa-4.0}}">Creative Commons BY-SA 4.0 (CC-BY-SA)</option>' +
                '<option value="{{cc-0}}">Creative Commons Zero (CC-0 / Public Domain)</option>' +
                '<option value="{{public domain}}">Phạm vi công cộng - Public Domain</option>' +
                '<option value="{{fair use}}">Sử dụng hợp pháp - Fair Use</option>' +
                '<option value="{{pd-self}}">Phát hành công khai từ tác giả</option>' +
                '<option value="{{PD-US}}">Public Domain - US Government</option>' +
                '<option value="{{copyrighted}}">⚠️ Có bản quyền - Cần phép từ tác giả</option>' +
                '</select>' +
                '</div>' +
                '<div class="maple-modal-field"><label>Kích thước</label>' +
                '<input type="text" id="ml-fi-size" placeholder="300px (tuỳ chọn)"></div>' +
                '<div class="maple-modal-field maple-modal-field--row">' +
                '<label><input type="radio" name="ml-fi-align" value="none" checked> Mặc định</label>' +
                '<label><input type="radio" name="ml-fi-align" value="left"> Trái</label>' +
                '<label><input type="radio" name="ml-fi-align" value="center"> Giữa</label>' +
                '<label><input type="radio" name="ml-fi-align" value="right"> Phải</label></div>' +
                '<div class="maple-modal-field maple-modal-field--row">' +
                '<label><input type="checkbox" id="ml-fi-thumb"> Thumb</label>' +
                '<label><input type="checkbox" id="ml-fi-frame"> Frame</label>' +
                '<label><input type="checkbox" id="ml-fi-frameless"> Frameless</label></div>' +
                '<div class="maple-modal-actions">' +
                '<button id="ml-fi-insert" class="maple-modal-btn maple-modal-btn--primary">✓ CHÈN</button>' +
                '<button id="ml-fi-cancel" class="maple-modal-btn">HỦY</button></div>'
            );
            document.getElementById('ml-fi-cancel').onclick = closeModal;
            
            // ✨ Xử lý tải file từ PC
            var fileUploadInput = document.getElementById('ml-fi-upload');
            fileUploadInput.addEventListener('change', function (e) {
                var file = e.target.files[0];
                if (file) {
                    var nameField = document.getElementById('ml-fi-name');
                    // Loại bỏ khoảng trắng, chuyển thành dấu gạch dưới
                    var cleanName = file.name.replace(/\s+/g, '_');
                    nameField.value = cleanName;
                    // Log thông tin file
                    console.log('[MAPLE Upload] Tệp được chọn: ' + file.name);
                    console.log('[MAPLE Upload] Dung lượng: ' + (file.size / 1024).toFixed(2) + ' KB');
                    console.log('[MAPLE Upload] Loại: ' + file.type);
                }
            });
            
            document.getElementById('ml-fi-insert').onclick = function () {
                var name = document.getElementById('ml-fi-name').value.trim();
                var license = document.getElementById('ml-fi-license').value.trim();
                
                if (!name) {
                    alert('❌ Vui lòng nhập tên tệp!');
                    return;
                }
                if (!license) {
                    alert('❌ Vui lòng chọn giấy phép! (Bắt buộc để đảm bảo tuân thủ bản quyền)');
                    return;
                }
                
                // Tạo định dạng [[Tập tin:...]] đúng
                var parts = ['Tập tin:' + name];
                if      (document.getElementById('ml-fi-thumb').checked)     parts.push('thumb');
                else if (document.getElementById('ml-fi-frame').checked)     parts.push('frame');
                else if (document.getElementById('ml-fi-frameless').checked) parts.push('frameless');
                var align = document.querySelector('input[name="ml-fi-align"]:checked').value;
                if (align !== 'none') parts.push(align);
                var sz  = document.getElementById('ml-fi-size').value.trim();
                var cap = document.getElementById('ml-fi-cap').value.trim();
                if (sz)  parts.push(sz);
                if (cap) parts.push(cap);
                
                // Chèn với giấy phép
                closeModal();
                insert('[[' + parts.join('|') + ']]\n' + license);
            };
            break;
        }

        /* ── BẢNG ── */
        case 'table': {
            openModal('// CHÈN BẢNG',
                '<div class="maple-modal-field maple-modal-field--row">' +
                '<div style="flex:1"><label>Số cột</label><input id="ml-tb-cols" type="number" value="3" min="1" max="20"></div>' +
                '<div style="flex:1;margin-left:12px"><label>Số hàng</label><input id="ml-tb-rows" type="number" value="3" min="1" max="50"></div></div>' +
                '<div class="maple-modal-field"><label>Tiêu đề bảng <span class="maple-modal-hint">(tuỳ chọn)</span></label>' +
                '<input type="text" id="ml-tb-cap" placeholder="Tên bảng..."></div>' +
                '<div class="maple-modal-field maple-modal-field--row">' +
                '<label><input type="checkbox" id="ml-tb-hdr" checked> Hàng header</label>' +
                '<label style="margin-left:16px"><input type="checkbox" id="ml-tb-bdr" checked> wikitable</label></div>' +
                '<div class="maple-modal-actions">' +
                '<button id="ml-tb-insert" class="maple-modal-btn maple-modal-btn--primary">CHÈN BẢNG</button>' +
                '<button id="ml-tb-cancel" class="maple-modal-btn">HỦY</button></div>'
            );
            document.getElementById('ml-tb-cancel').onclick = closeModal;
            document.getElementById('ml-tb-insert').onclick = function () {
                var cols = parseInt(document.getElementById('ml-tb-cols').value) || 3;
                var rows = parseInt(document.getElementById('ml-tb-rows').value) || 3;
                var cap  = document.getElementById('ml-tb-cap').value.trim();
                var hdr  = document.getElementById('ml-tb-hdr').checked;
                var bdr  = document.getElementById('ml-tb-bdr').checked;
                var out  = ['{|' + (bdr ? ' class="wikitable"' : '')];
                if (cap) out.push('|+ ' + cap);
                for (var r = 0; r < rows; r++) {
                    out.push('|-');
                    for (var c = 0; c < cols; c++) {
                        out.push((r === 0 && hdr) ? '! Tiêu đề ' + (c + 1) : '| ');
                    }
                }
                out.push('|}');
                closeModal();
                insert('\n' + out.join('\n') + '\n');
            };
            break;
        }

        /* ── WIKI TAGS ── */
        case 'wikitag': {
            var TAGS = [
                { l:'{{PAGENAME}}',      w:'{{PAGENAME}}',                                          d:'Tên trang hiện tại' },
                { l:'{{FULLPAGENAME}}',  w:'{{FULLPAGENAME}}',                                      d:'Tên trang đầy đủ' },
                { l:'{{NAMESPACE}}',     w:'{{NAMESPACE}}',                                         d:'Namespace hiện tại' },
                { l:'{{CURRENTYEAR}}',   w:'{{CURRENTYEAR}}',                                       d:'Năm hiện tại' },
                { l:'{{CURRENTMONTH}}',  w:'{{CURRENTMONTH}}',                                      d:'Tháng hiện tại' },
                { l:'{{CURRENTDAY}}',    w:'{{CURRENTDAY}}',                                        d:'Ngày hiện tại' },
                { l:'{{NUMBEROFPAGES}}', w:'{{NUMBEROFPAGES}}',                                     d:'Tổng số trang' },
                { l:'{{Tl|}}',           w:'{{Tl|TênTemplate}}',                                    d:'Liên kết template' },
                { l:'{{Stub}}',          w:'{{Stub}}',                                              d:'Trang sơ khai' },
                { l:'{{Đang xây dựng}}', w:'{{Đang xây dựng}}',                                    d:'Trang đang xây dựng' },
                { l:'{{Xóa}}',           w:'{{Xóa}}',                                              d:'Đề xuất xóa' },
                { l:'<nowiki>',          w:'<nowiki></nowiki>',                                     d:'Hiển thị nguyên văn' },
                { l:'<ref>',             w:'<ref></ref>',                                           d:'Chú thích' },
                { l:'<references/>',     w:'<references/>',                                         d:'Danh sách chú thích' },
                { l:'<gallery>',         w:'<gallery>\nTập tin:Hinh.jpg|Chú thích\n</gallery>',    d:'Thư viện ảnh' },
                { l:'<poem>',            w:'<poem>\nNội dung\n</poem>',                            d:'Thơ/văn vần' },
                { l:'<math>',            w:'<math>x^2</math>',                                     d:'Toán học LaTeX' },
                { l:'__TOC__',           w:'__TOC__',                                               d:'Hiện mục lục tại đây' },
                { l:'__NOTOC__',         w:'__NOTOC__',                                             d:'Ẩn mục lục' },
                { l:'__NOEDITSECTION__', w:'__NOEDITSECTION__',                                     d:'Ẩn nút sửa từng phần' },
                { l:'[[Thể loại:]]',     w:'[[Thể loại:]]',                                        d:'Thêm thể loại' },
                { l:'{{DEFAULTSORT:}}',  w:'{{DEFAULTSORT:}}',                                     d:'Khoá sắp xếp' },
                { l:'----',              w:'----',                                                  d:'Đường kẻ ngang' },
            ];
            var items = TAGS.map(function (t) {
                return '<div class="ml-tag-item" data-wiki="' + t.w.replace(/"/g, '&quot;') + '">' +
                       '<code>' + t.l.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code>' +
                       '<span>' + t.d + '</span></div>';
            }).join('');
            openModal('// WIKI TAGS — click để chèn',
                '<div class="ml-tag-search-wrap"><input id="ml-tag-q" type="text" placeholder="Tìm tag..."></div>' +
                '<div class="ml-tag-list" id="ml-tag-list">' + items + '</div>'
            );
            document.getElementById('ml-tag-q').addEventListener('input', function () {
                var q = this.value.toLowerCase();
                document.querySelectorAll('.ml-tag-item').forEach(function (el) {
                    el.style.display = el.textContent.toLowerCase().includes(q) ? '' : 'none';
                });
            });
            document.getElementById('ml-tag-list').addEventListener('click', function (e) {
                var item = e.target.closest('.ml-tag-item');
                if (!item) return;
                closeModal();
                insert(item.getAttribute('data-wiki'));
            });
            break;
        }
        case 'maple_rating':
            insert(
                '{{Phân Loại Nội Dung\n' +
                '| muc        = 13\n' +
                '| mo_ta      = \n' +
                '| canh_bao   = Cảnh báo 1;Cảnh báo 2\n' +
                '| loi_khuyen = \n' +
                '| tag        = \n' +
                '}}'
            );
            break;

        case 'maple_classified':
            insert(
                '<div class="maple-classified" data-ref="SEC-001" data-level="4">\n' +
                'Nội dung bí mật ở đây\n' +
                '</div>'
            );
            break;

        case 'maple_redacted':
            wrap('<span class="maple-redacted">', '</span>', 'cụm từ bị xoá');
            break;

        case 'maple_diary':
            insert(
                '{{Hồ Sơ Nhật Ký\n' +
                '| id         = MA-D001\n' +
                '| tieu_de    = \n' +
                '| muc_do     = F.I.F.R.O\n' +
                '| nguon      = \n' +
                '| phan_loai  = M.A.P.L.E / LOGS\n' +
                '| mo_ta      = \n' +
                '| ghi_chu    = \n' +
                '}}'
            );
            break;

        case 'maple_entity':
            insert(
                '{{Hồ Sơ Thực Thể\n' +
                '| id         = MA-E001\n' +
                '| tieu_de    = \n' +
                '| muc_do     = NGUY HIỂM\n' +
                '| gap_tai    = \n' +
                '| nguy_hiem  = \n' +
                '| mo_ta      = \n' +
                '| ghi_chu    = \n' +
                '| anh_src    = \n' +
                '| anh_ref    = VIS-001\n' +
                '| anh_rating = \n' +
                '}}'
            );
            break;

        case 'maple_item':
            insert(
                '{{Hồ Sơ Vật Phẩm\n' +
                '| id        = MA-I001\n' +
                '| tieu_de   = \n' +
                '| muc_do    = ITEM-CLASS-A\n' +
                '| do_hiem   = \n' +
                '| loai      = \n' +
                '| mo_ta     = \n' +
                '| ghi_chu   = \n' +
                '| anh_src   = \n' +
                '}}'
            );
            break;

        case 'maple_img':
            insert(
                '{{Ảnh Bảo Mật\n' +
                '| src     = \n' +
                '| ref     = VIS-001\n' +
                '| level   = 4\n' +
                '| rating  = \n' +
                '| caption = \n' +
                '| ratio   = 16/9\n' +
                '}}'
            );
            break;
        /* ── ENCODING ── */
        case 'encoding': {
            if (typeof MAPLE.Editor.updateStats === 'function') MAPLE.Editor.updateStats();
            var ep = document.getElementById('maple-encoding-panel');
            if (ep) ep.style.display = ep.style.display === 'none' ? 'block' : 'none';
            break;
        }
    }
};