/**
 * MapleQueue — Gadget tự động kiểm duyệt bài chờ bằng AI
 *
 * v2.0 — Đã fix:
 *  - readJson phân biệt rõ: ok | missing | error (không còn nuốt lỗi)
 *  - ensurePage không ghi đè khi lỗi mạng
 *  - Edit conflict detection bằng basetimestamp
 *  - Lock chống processBatch chạy đè
 *  - Retry với exponential backoff cho read/write
 *  - Pause khi tab ẩn
 *  - Backoff polling khi gặp lỗi liên tiếp
 *  - syncQueue loại bỏ entry rejected khỏi queue
 *  - Khi AI lỗi: giữ pending nguyên trạng để retry vòng sau
 */
( function () {
  "use strict";

  // ─── Logger ───────────────────────────────────────────────────────
  var LOG_PREFIX = "[MapleQueue]";
  function log()  { console.log.apply( console, [ LOG_PREFIX ].concat( [].slice.call( arguments ) ) ); }
  function warn() { console.warn.apply( console, [ LOG_PREFIX + " ⚠" ].concat( [].slice.call( arguments ) ) ); }
  function err()  { console.error.apply( console, [ LOG_PREFIX + " ✖" ].concat( [].slice.call( arguments ) ) ); }

  // ─── Config ───────────────────────────────────────────────────────
  var CFG = {
    proxyUrl:        "https://maple-ai-proxy.maplebot.workers.dev",
    queuePage:       "MediaWiki:Maple-Queue",
    pendingPage:     "MediaWiki:Maple-Pending.json",
    historyPage:     "MediaWiki:Maple-UserHistory",
    batchSize:       5,
    timeoutMs:       5 * 60 * 1000,   // 5 phút
    pollMs:          60 * 1000,       // 60 giây
    storageKey:      "maple_queue_first_submit",
    retryMax:        3,                // số lần retry cho read/write
    retryBaseMs:     1000,             // backoff base: 1s, 2s, 4s
    errorBackoffMax: 5,                // sau N lỗi liên tiếp thì giãn polling
  };

  // ─── Kiểm tra quyền ───────────────────────────────────────────────
  var rights = mw.config.get( "wgUserGroups" ) || [];
  log( "Quyền hiện tại:", rights );
  if ( rights.indexOf( "sysop" ) === -1 && rights.indexOf( "moderator" ) === -1 ) {
    warn( "Không đủ quyền (cần sysop hoặc moderator). Dừng." );
    return;
  }
  log( "Đủ quyền — gadget khởi động." );

  var api = new mw.Api();

  // ─── State ────────────────────────────────────────────────────────
  var state = {
    isRunning:         false,
    consecutiveErrors: 0,
    lastRunAt:         0,
  };

  // ─── Util: sleep ──────────────────────────────────────────────────
  function sleep( ms ) {
    return new Promise( function ( res ) { setTimeout( res, ms ); } );
  }

  // ─── Util: retry với exponential backoff ──────────────────────────
  function withRetry( fn, label ) {
    var attempt = 0;
    function tryOnce() {
      attempt++;
      return fn().catch( function ( e ) {
        if ( attempt >= CFG.retryMax ) throw e;
        var delay = CFG.retryBaseMs * Math.pow( 2, attempt - 1 );
        warn( "retry [" + label + "] lần " + attempt + " thất bại → chờ " + delay + "ms" );
        return sleep( delay ).then( tryOnce );
      } );
    }
    return tryOnce();
  }

  // ─── Đọc JSON: trả về { status, data, basetimestamp, error } ──────
  //   status = "ok"      → data có, basetimestamp có
  //   status = "missing" → trang chưa tồn tại
  //   status = "invalid" → trang có nhưng JSON hỏng (KHÔNG ghi đè)
  //   status = "error"   → lỗi API, ném exception ra ngoài
  function readJsonOnce( page ) {
    log( "readJson →", page );
    return api.get( {
      action: "query",
      titles: page,
      prop: "revisions",
      rvprop: [ "content", "timestamp" ],
      rvslots: "main",
      curtimestamp: 1,
      formatversion: 2,
    } ).then( function ( res ) {
      var page0 = res && res.query && res.query.pages && res.query.pages[ 0 ];
      var starttimestamp = res && res.curtimestamp;
      if ( !page0 || page0.missing ) {
        log( "readJson: trang missing →", page );
        return { status: "missing", starttimestamp: starttimestamp };
      }
      var rev = page0.revisions && page0.revisions[ 0 ];
      var content = rev && rev.slots && rev.slots.main && rev.slots.main.content;
      var basetimestamp = rev && rev.timestamp;
      try {
        var parsed = JSON.parse( content );
        log( "readJson OK →", page, "| bytes:", ( content || "" ).length );
        return {
          status:         "ok",
          data:           parsed,
          basetimestamp:  basetimestamp,
          starttimestamp: starttimestamp,
        };
      } catch ( e ) {
        err( "readJson: JSON parse lỗi →", page, e );
        // KHÔNG trả missing — trang có content nhưng hỏng, đừng ghi đè
        return { status: "invalid", error: e, basetimestamp: basetimestamp };
      }
    } );
  }

  function readJson( page ) {
    return withRetry( function () { return readJsonOnce( page ); }, "read " + page );
  }

  // ─── Ghi JSON với edit conflict detection ─────────────────────────
  function writeJsonOnce( page, data, summary, basetimestamp, starttimestamp ) {
    log( "writeJson →", page, "|", summary );
    var params = {
      action:  "edit",
      title:   page,
      text:    JSON.stringify( data, null, "\t" ),
      summary: summary || "MAPLE-Bot: cập nhật tự động",
      bot:     1,
    };
    // Chỉ gửi timestamp khi có → phòng edit conflict
    if ( basetimestamp )  params.basetimestamp  = basetimestamp;
    if ( starttimestamp ) params.starttimestamp = starttimestamp;

    return api.postWithToken( "csrf", params ).then( function ( res ) {
      log( "writeJson OK →", page, res && res.edit && res.edit.result );
      return res;
    } );
  }

  function writeJson( page, data, summary, basetimestamp, starttimestamp ) {
    return withRetry( function () {
      return writeJsonOnce( page, data, summary, basetimestamp, starttimestamp );
    }, "write " + page );
  }

  // ─── Tạo trang nếu chưa có — CHỈ tạo khi status = "missing" ──────
  function ensurePage( page, defaultData, summary ) {
    return readJson( page ).then( function ( res ) {
      if ( res.status === "ok" ) {
        log( "ensurePage: trang đã tồn tại →", page );
        return res;
      }
      if ( res.status === "invalid" ) {
        // Trang có nội dung nhưng hỏng → KHÔNG ghi đè, để admin xử lý
        throw new Error( "ensurePage: trang " + page + " có JSON hỏng, từ chối ghi đè" );
      }
      // status === "missing" → mới khởi tạo
      log( "ensurePage: trang chưa có, khởi tạo →", page );
      return writeJson( page, defaultData, summary || "MAPLE-Bot: khởi tạo" )
        .then( function () {
          // Đọc lại để lấy basetimestamp mới
          return readJson( page );
        } );
    } );
  }

  // ─── Helpers cho data ─────────────────────────────────────────────
  function getEntryId( entry ) {
    return entry.id || entry.pending_id || null;
  }

  function getPendingList( pendingData ) {
    if ( Array.isArray( pendingData ) ) return pendingData;
    if ( pendingData && Array.isArray( pendingData.pending ) ) return pendingData.pending;
    return [];
  }

  function getPendingEntries( pendingData ) {
    var list = getPendingList( pendingData );
    var waiting = list.filter( function ( e ) {
      return e.status === "pending" && !e.mod_result;
    } );
    log( "getPendingEntries: tổng", list.length, "| chờ xử lý:", waiting.length );
    return waiting;
  }

  function getViolationCount( history, username ) {
    if ( !username ) return 0;
    var count = ( history
      && history.users
      && history.users[ username ]
      && history.users[ username ].violations ) || 0;
    if ( count > 0 ) log( "violationCount[" + username + "] =", count );
    return count;
  }

  // ─── Gọi AI proxy ─────────────────────────────────────────────────
  function callAI( entries ) {
    log( "callAI: gửi", entries.length, "entries lên proxy" );
    var t0 = Date.now();
    return fetch( CFG.proxyUrl, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify( { action: "moderate", entries: entries } ),
    } ).then( function ( res ) {
      log( "callAI: status =", res.status, "| time =", Date.now() - t0, "ms" );
      if ( !res.ok ) throw new Error( "Proxy error: " + res.status );
      return res.json();
    } ).then( function ( json ) {
      log( "callAI: provider =", json && json.provider, "| results =", json && json.results && json.results.length );
      return json;
    } );
  }

  // ─── Áp kết quả AI vào pendingData ───────────────────────────────
  function applyAIResults( aiResults, pendingData ) {
    log( "applyAIResults: provider =", aiResults && aiResults.provider );
    var resultMap = {};
    ( ( aiResults && aiResults.results ) || [] ).forEach( function ( r ) {
      var rid = r.pending_id || r.id;
      if ( rid ) resultMap[ rid ] = r;
    } );

    var applied = 0, autoRejected = 0;
    getPendingList( pendingData ).forEach( function ( entry ) {
      var eid = getEntryId( entry );
      var r   = resultMap[ eid ];
      if ( !r ) return;
      if ( entry.mod_result ) return;

      entry.mod_result = {
        passed:       !r.auto_reject,
        level:        r.score > 0.6 ? "danger" : r.score > 0.2 ? "warn" : "ok",
        score:        r.score,
        auto_reject:  r.auto_reject,
        flags:        r.flags || [],
        priority:     r.priority,
        ai_provider:  ( aiResults && aiResults.provider ) || "unknown",
        processed_at: new Date().toISOString(),
      };
      applied++;

      if ( r.auto_reject ) {
        entry.status      = "rejected";
        entry.rejected_by = "MAPLE-Bot";
        entry.rejected_at = new Date().toISOString();
        entry.reason      = r.reason || "Auto-rejected bởi AI";
        autoRejected++;
        warn( "AUTO-REJECT →", eid, "|", entry.reason );
      }
    } );
    log( "applyAIResults: applied =", applied, "| auto-rejected =", autoRejected );
    return applied;
  }

  // ─── Đồng bộ queue — loại bỏ entry rejected ──────────────────────
  function syncQueue( queueData, pendingData ) {
    if ( !Array.isArray( queueData ) ) {
      warn( "syncQueue: queueData không phải array, bỏ qua." );
      return queueData;
    }
    var processed = {};
    getPendingList( pendingData )
      .filter( function ( e ) { return e.mod_result; } )
      .forEach( function ( e ) {
        var eid = getEntryId( e );
        if ( eid ) processed[ eid ] = e;
      } );

    log( "syncQueue: entries có mod_result =", Object.keys( processed ).length );

    // Lọc bỏ entry rejected khỏi queue (không cần hiển thị nữa)
    var result = queueData
      .map( function ( q ) {
        var key = q.id || q.pending_id;
        var p   = processed[ key ];
        if ( !p ) return q;
        if ( p.status === "rejected" ) {
          log( "syncQueue: queue[" + key + "] → rejected (sẽ loại)" );
          return null; // đánh dấu để filter sau
        }
        return Object.assign( {}, q, { status: "ai_reviewed" } );
      } )
      .filter( function ( q ) { return q !== null; } );

    return result;
  }

  // ─── Hàm chính ────────────────────────────────────────────────────
  function processBatch( force ) {
    // Lock chống chạy đè
    if ( state.isRunning ) {
      warn( "processBatch: đang chạy, bỏ qua lần này." );
      return Promise.resolve();
    }
    // Pause khi tab ẩn (trừ khi force)
    if ( !force && typeof document !== "undefined" && document.hidden ) {
      log( "processBatch: tab ẩn, bỏ qua." );
      return Promise.resolve();
    }

    state.isRunning = true;
    state.lastRunAt = Date.now();
    log( "processBatch START | force =", force );

    return Promise.all( [
      readJson( CFG.queuePage ),
      ensurePage( CFG.pendingPage, [], "MAPLE-Bot: khởi tạo Maple-Pending" ),
      readJson( CFG.historyPage ),
    ] ).then( function ( results ) {
      var queueRes   = results[ 0 ];
      var pendingRes = results[ 1 ];
      var historyRes = results[ 2 ];

      // Chỉ chấp nhận "ok" hoặc "missing" → các status khác = abort
      if ( queueRes.status === "invalid" )   throw new Error( "queueData JSON hỏng — abort" );
      if ( pendingRes.status === "invalid" ) throw new Error( "pendingData JSON hỏng — abort" );
      if ( historyRes.status === "invalid" ) throw new Error( "historyData JSON hỏng — abort" );

      var queueData   = queueRes.status   === "ok" ? queueRes.data   : null;
      var pendingData = pendingRes.status === "ok" ? pendingRes.data : [];
      var historyData = historyRes.status === "ok" ? historyRes.data : null;

      var list = getPendingList( pendingData );
      log( "processBatch: đọc xong 3 trang" );
      log( "  queueData   =", queueData   ? "OK (" + ( Array.isArray( queueData ) ? queueData.length + " items" : "object" ) + ")" : queueRes.status );
      log( "  pendingData =", "OK (" + list.length + " entries)" );
      log( "  historyData =", historyData ? "OK" : historyRes.status );

      var waiting = getPendingEntries( pendingData );
      if ( waiting.length === 0 ) {
        log( "processBatch: không có gì pending → dừng, xóa storageKey." );
        localStorage.removeItem( CFG.storageKey );
        return;
      }

      // Quản lý timestamp của lần đầu có entry chờ
      var firstTs = localStorage.getItem( CFG.storageKey );
      if ( !firstTs ) {
        firstTs = String( Date.now() );
        localStorage.setItem( CFG.storageKey, firstTs );
        log( "processBatch: lưu timestamp đầu tiên." );
      }

      var elapsed = Date.now() - parseInt( firstTs, 10 );
      log( "processBatch: waiting =", waiting.length,
        "| batchSize =", CFG.batchSize,
        "| elapsed =", Math.round( elapsed / 1000 ) + "s / " + ( CFG.timeoutMs / 1000 ) + "s",
        "| force =", force );

      var shouldProcess = force
        || waiting.length >= CFG.batchSize
        || elapsed >= CFG.timeoutMs;

      log( "processBatch: shouldProcess =", shouldProcess,
        "( force:" + !!force,
        "| enoughBatch:" + ( waiting.length >= CFG.batchSize ),
        "| timeout:" + ( elapsed >= CFG.timeoutMs ) + " )" );

      if ( !shouldProcess ) {
        log( "processBatch: chưa đủ điều kiện → chờ vòng tiếp theo." );
        return;
      }

      var enriched = waiting.map( function ( e ) {
        return Object.assign( {}, e, {
          pending_id:       getEntryId( e ),
          _violation_count: getViolationCount( historyData, e.author || "" ),
        } );
      } );

      log( "processBatch: gửi", enriched.length, "bài lên AI..." );

      return callAI( enriched ).then( function ( aiResult ) {
        // Có kết quả AI → áp vào và ghi
        var applied = applyAIResults( aiResult, pendingData );
        if ( applied === 0 ) {
          warn( "processBatch: AI trả nhưng không áp được entry nào → bỏ qua ghi." );
          return;
        }

        var updatedQueue = queueData ? syncQueue( queueData, pendingData ) : null;
        log( "processBatch: ghi kết quả về wiki..." );

        var writes = [
          writeJson(
            CFG.pendingPage,
            pendingData,
            "MAPLE-Bot: xử lý " + enriched.length + " bài (" + ( aiResult && aiResult.provider ) + ")",
            pendingRes.basetimestamp,
            pendingRes.starttimestamp
          ),
        ];
        if ( updatedQueue && queueRes.status === "ok" ) {
          writes.push( writeJson(
            CFG.queuePage,
            updatedQueue,
            "MAPLE-Bot: cập nhật queue",
            queueRes.basetimestamp,
            queueRes.starttimestamp
          ) );
        }

        return Promise.all( writes ).then( function () {
          // Chỉ reset timestamp khi đã ghi thành công
          localStorage.removeItem( CFG.storageKey );
          log( "processBatch: ✓ Hoàn thành batch." );
        } );
      } ).catch( function ( e ) {
        // AI lỗi → KHÔNG ghi gì cả, để retry vòng sau
        warn( "processBatch: AI thất bại →", e.message || e, "| giữ pending nguyên trạng, sẽ retry." );
      } );

    } ).then( function () {
      state.consecutiveErrors = 0;
    } ).catch( function ( e ) {
      state.consecutiveErrors++;
      err( "processBatch: lỗi (" + state.consecutiveErrors + "/" + CFG.errorBackoffMax + ") →", e.message || e );
    } ).then( function () {
      state.isRunning = false;
    } );
  }

  // ─── Scheduler với backoff khi lỗi ────────────────────────────────
  function scheduleNext() {
    var delay = CFG.pollMs;
    if ( state.consecutiveErrors >= CFG.errorBackoffMax ) {
      // Backoff: nhân đôi delay, max 10 phút
      delay = Math.min( CFG.pollMs * Math.pow( 2, state.consecutiveErrors - CFG.errorBackoffMax + 1 ), 10 * 60 * 1000 );
      warn( "scheduleNext: backoff vì lỗi liên tiếp → delay =", Math.round( delay / 1000 ) + "s" );
    }
    setTimeout( function () {
      processBatch( false ).then( scheduleNext );
    }, delay );
  }

  // ─── Khởi động ────────────────────────────────────────────────────
  log( "Gadget load xong. Chạy lần đầu sau 5s, rồi mỗi", CFG.pollMs / 1000, "giây." );
  setTimeout( function () {
    processBatch( false ).then( scheduleNext );
  }, 5000 );

  // Public API
  window.MapleQueue = {
    processBatch: processBatch,
    forceRun:     function () { return processBatch( true ); },
    state:        state,
    cfg:          CFG,
  };

  log( "window.MapleQueue đã sẵn sàng." );

}() );