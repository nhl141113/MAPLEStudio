( function () {
  "use strict";

  var PAGE_NAME = mw.config.get( "wgPageName" );
  var isSubmitPage = PAGE_NAME === "Đặc_biệt:MapleSubmit"
    || PAGE_NAME === "Special:MapleSubmit"
    || document.querySelector( ".maple-submit-form" );

  if ( !isSubmitPage ) return;

  var groups = mw.config.get( "wgUserGroups" ) || [];
  var isAutoconfirmed = groups.indexOf( "autoconfirmed" ) !== -1
    || groups.indexOf( "sysop" ) !== -1;

  var PAGES = {
    queue:   "MediaWiki:Maple-Queue",
    pending: "MediaWiki:Maple-Pending",
  };

  var CATEGORIES = [
    { id: "entity",   label: "Thực thể" },
    { id: "item",     label: "Vật phẩm" },
    { id: "location", label: "Địa điểm" },
    { id: "protocol", label: "Quy trình" },
    { id: "log",      label: "Nhật ký" },
  ];

  var ACCESS_LEVELS = [
    { id: "open",       label: "Mở (13+)" },
    { id: "restricted", label: "Hạn chế (16+)" },
    { id: "classified", label: "Phân loại (18+)" },
  ];

  function nextPendingId( pendingData ) {
    var entries = ( pendingData && pendingData.pending ) || [];
    if ( entries.length === 0 ) return "PND-0001";
    var nums = entries.map( function ( e ) {
      return parseInt( ( e.pending_id || "0" ).replace( /\D/g, "" ) ) || 0;
    } );
    return "PND-" + String( Math.max.apply( null, nums ) + 1 ).padStart( 4, "0" );
  }

  function genQueueId() {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    function seg( n ) {
      var s = "";
      for ( var i = 0; i < n; i++ ) {
        s += chars[ Math.floor( Math.random() * chars.length ) ];
      }
      return s;
    }
    return seg(8) + "-" + seg(6);
  }

  var api; // khai báo ở đây, gán sau khi mediawiki.api load

  function readJson( page ) {
    return api.get( {
      action: "query", titles: page,
      prop: "revisions", rvprop: "content", rvslots: "main", formatversion: 2,
    } ).then( function ( res ) {
      var content = res
        && res.query
        && res.query.pages
        && res.query.pages[0]
        && res.query.pages[0].revisions
        && res.query.pages[0].revisions[0]
        && res.query.pages[0].revisions[0].slots
        && res.query.pages[0].revisions[0].slots.main
        && res.query.pages[0].revisions[0].slots.main.content;
      try { return JSON.parse( content ); } catch ( e ) { return null; }
    } );
  }

  function writeJson( page, data, summary ) {
    return api.postWithToken( "csrf", {
      action: "edit",
      title: page,
      text: JSON.stringify( data, null, "\t" ),
      summary: summary || "Nộp bài mới",
    } );
  }

  function renderForm() {
    var root = document.getElementById( "mw-content-text" );

    if ( !isAutoconfirmed ) {
      root.innerHTML = '<div style="background:#FFF3E0;border:1px solid #E65100;border-radius:8px;padding:16px;max-width:600px">'
        + '<strong>Bạn cần là thành viên tự xác nhận để nộp bài.</strong><br>'
        + 'Hãy đăng ký và chờ xác nhận tài khoản.</div>';
      return;
    }

    root.innerHTML = '<div id="maple-submit" style="max-width:640px;font-family:sans-serif">'
      + '<div id="ms-alert" style="display:none;padding:12px 16px;border-radius:8px;margin-bottom:16px"></div>'

      + '<div style="margin-bottom:14px">'
      + '<label style="display:block;font-weight:500;margin-bottom:4px">Tiêu đề bài viết *</label>'
      + '<input id="ms-title" type="text" maxlength="120" placeholder="Ví dụ: The Wanderer"'
      + ' style="width:100%;padding:8px 10px;border:1px solid #ccc;border-radius:6px;font-size:14px;box-sizing:border-box">'
      + '</div>'

      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">'
      + '<div><label style="display:block;font-weight:500;margin-bottom:4px">Danh mục *</label>'
      + '<select id="ms-category" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;font-size:14px">'
      + CATEGORIES.map( function ( c ) { return '<option value="' + c.id + '">' + c.label + '</option>'; } ).join( "" )
      + '</select></div>'
      + '<div><label style="display:block;font-weight:500;margin-bottom:4px">Cấp độ truy cập *</label>'
      + '<select id="ms-access" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;font-size:14px">'
      + ACCESS_LEVELS.map( function ( a ) { return '<option value="' + a.id + '">' + a.label + '</option>'; } ).join( "" )
      + '</select></div>'
      + '</div>'

      + '<div style="margin-bottom:14px">'
      + '<label style="display:block;font-weight:500;margin-bottom:4px">Tên trang wiki *'
      + ' <span style="font-weight:400;color:#888;font-size:12px">(ví dụ: Kho_Lưu_Trữ/DB-006)</span></label>'
      + '<input id="ms-page" type="text" placeholder="Kho_Lưu_Trữ/DB-006"'
      + ' style="width:100%;padding:8px 10px;border:1px solid #ccc;border-radius:6px;font-size:14px;box-sizing:border-box">'
      + '</div>'

      + '<div style="margin-bottom:14px">'
      + '<label style="display:block;font-weight:500;margin-bottom:4px">ID bài viết *'
      + ' <span style="font-weight:400;color:#888;font-size:12px">(ví dụ: DB-006)</span></label>'
      + '<input id="ms-id" type="text" maxlength="20" placeholder="DB-006"'
      + ' style="width:100%;padding:8px 10px;border:1px solid #ccc;border-radius:6px;font-size:14px;box-sizing:border-box">'
      + '</div>'

      + '<div style="margin-bottom:18px">'
      + '<label style="display:block;font-weight:500;margin-bottom:4px">Mô tả / nội dung tóm tắt *</label>'
      + '<textarea id="ms-desc" rows="5" maxlength="2000" placeholder="Mô tả ngắn về bài viết..."'
      + ' style="width:100%;padding:8px 10px;border:1px solid #ccc;border-radius:6px;font-size:14px;resize:vertical;box-sizing:border-box"></textarea>'
      + '<div style="font-size:12px;color:#888;text-align:right"><span id="ms-count">0</span>/2000</div>'
      + '</div>'

      + '<button id="ms-submit" style="background:#378ADD;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:15px;cursor:pointer;width:100%">'
      + 'Nộp bài</button>'
      + '</div>';

    document.getElementById( "ms-desc" ).addEventListener( "input", function () {
      document.getElementById( "ms-count" ).textContent = this.value.length;
    } );

    document.getElementById( "ms-submit" ).onclick = doSubmit;
  }

  function showAlert( msg, type ) {
    var el = document.getElementById( "ms-alert" );
    var colors = {
      success: { bg: "#E8F5E9", border: "#388E3C", text: "#1B5E20" },
      error:   { bg: "#FFEBEE", border: "#C62828", text: "#B71C1C" },
      info:    { bg: "#E3F2FD", border: "#1565C0", text: "#0D47A1" },
    };
    var c = colors[ type ] || colors.info;
    el.style.cssText = "display:block;padding:12px 16px;border-radius:8px;margin-bottom:16px"
      + ";background:" + c.bg + ";border:1px solid " + c.border + ";color:" + c.text;
    el.textContent = msg;
  }

  function doSubmit() {
    var title    = document.getElementById( "ms-title" ).value.trim();
    var category = document.getElementById( "ms-category" ).value;
    var access   = document.getElementById( "ms-access" ).value;
    var pageName = document.getElementById( "ms-page" ).value.trim();
    var entryId  = document.getElementById( "ms-id" ).value.trim().toUpperCase();
    var desc     = document.getElementById( "ms-desc" ).value.trim();
    var btn      = document.getElementById( "ms-submit" );

    if ( !title || !pageName || !entryId || !desc ) {
      showAlert( "Vui lòng điền đầy đủ các trường bắt buộc.", "error" );
      return;
    }

    btn.disabled = true;
    btn.textContent = "Đang nộp...";
    showAlert( "Đang xử lý...", "info" );

    Promise.all( [
      readJson( PAGES.queue ),
      readJson( PAGES.pending ),
    ] ).then( function ( results ) {
      var queueData   = results[0];
      var pendingData = results[1];
      var safeQueue   = Array.isArray( queueData ) ? queueData : [];
      var safePending = pendingData || { pending: [] };
      var now         = new Date().toISOString();
      var pendingId   = nextPendingId( safePending );
      var queueId     = genQueueId();
      var author      = mw.config.get( "wgUserName" );
      var ageMap      = { open: "13+", restricted: "16+", classified: "18+" };

      var queueEntry = {
        id:           queueId,
        page_name:    pageName,
        page_title:   title,
        author:       author,
        namespace:    0,
        submitted_at: now,
        status:       "pending",
        risk_score:   0,
      };

      var pendingEntry = {
        pending_id: pendingId,
        entry: {
          id:       entryId,
          title:    title,
          category: category,
          access:   access,
          age:      ageMap[ access ] || "13+",
          tags:     [],
          author:   author,
          _page:    pageName,
          _desc:    desc,
        },
        submitted:  now,
        status:     "pending",
        mod_result: null,
      };

      safeQueue.push( queueEntry );
      safePending.pending.push( pendingEntry );

      return Promise.all( [
        writeJson( PAGES.queue,   safeQueue,   "Submit mới: " + title + " bởi " + author ),
        writeJson( PAGES.pending, safePending, "Pending mới: " + pendingId ),
      ] );

    } ).then( function () {
      showAlert( "Đã nộp thành công! Bài sẽ được kiểm duyệt sớm.", "success" );
      document.getElementById( "ms-submit" ).textContent = "Đã nộp";

    } ).catch( function ( e ) {
      showAlert( "Lỗi khi nộp bài: " + ( e && e.message || "Không rõ lỗi" ), "error" );
      btn.disabled = false;
      btn.textContent = "Nộp bài";
    } );
  }

  mw.loader.using( "mediawiki.api" ).then( function () {
    api = new mw.Api();
    renderForm();
  } );

}() );