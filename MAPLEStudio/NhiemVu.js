/* ============================================
   M.A.P.L.E — MediaWiki:NhiemVu.js
   Trang "NHIỆM VỤ" (Việc Cần Làm) — tổ chức giao việc theo Ngày/Tuần/Tháng.
   Hoàn thành đủ điều kiện → TỰ ĐỘNG cộng RP qua hệ thống thành tựu sẵn có.

   Phụ thuộc:
     - MediaWiki:Maple-Tasks.json (?action=raw)   — danh sách nhiệm vụ do Admin quản lý
     - window.MAPLE.ach (MAPLE-Achievements.js)    — đọc stats + rpOnce (cộng RP)
     - window.MAPLE.catalog (AchievementCatalog.js) — tier/RP (tùy chọn, để hiện tier)
     - MediaWiki:Maple-Pending.json (?action=raw)  — đếm bài đã duyệt (rule approved_articles)

   CHỐNG GIAN LẬN: chỉ cộng RP cho điều kiện kiểm chứng được từ NGUỒN SERVER THẬT
   (số bài duyệt từ Pending.json; reads/streak từ stats đồng bộ). Mỗi nhiệm vụ cộng
   RP đúng 1 lần / chu kỳ (cờ rpOnce theo taskId + khóa-chu-kỳ).
   ============================================ */
(function () {
	'use strict';

	function init() {
		var loggedIn = mw.config.get('wgUserId') !== 0;
		var user = mw.config.get('wgUserName');

		mw.loader.using(['mediawiki.api', 'mediawiki.util']).done(function () {
			injectStyleFallback();
			if (!loggedIn || !user) { renderGuest(); return; }
			setH1('Nhiệm Vụ Thực Địa — M.A.P.L.E');
			setContent(loadingHTML('Đang tải nhiệm vụ…'));
			boot(user);
		});
	}

	/* ───────────────── Helpers chung ───────────────── */
	function esc(s) {
		return String(s == null ? '' : s)
			.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;').replace(/'/g, '&#039;');
	}
	function setH1(t) {
		var h1 = document.querySelector('#firstHeading, h1.firstHeading');
		if (h1) h1.textContent = t;
	}
	function setContent(html) {
		var el = document.getElementById('mw-content-text');
		if (el) el.innerHTML = html;
	}
	function mountNode(node) {
		var el = document.getElementById('mw-content-text');
		if (el) { el.innerHTML = ''; el.appendChild(node); }
	}
	function loadingHTML(msg) {
		return '<div id="nv-loading"><div class="nv-spin"></div><br>' + esc(msg || 'Đang tải…') + '</div>';
	}
	function pad(n) { return (n < 10 ? '0' : '') + n; }
	function todayKey(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
	function monthKey(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1); }
	/* Khóa tuần ISO (năm-Wxx) — đồng nhất cho cùng một tuần dù qua năm */
	function isoWeekKey(d) {
		d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
		var day = d.getUTCDay() || 7;            /* CN = 7 */
		d.setUTCDate(d.getUTCDate() + 4 - day);  /* về thứ Năm trong tuần */
		var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
		var week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
		return d.getUTCFullYear() + '-W' + pad(week);
	}
	function cyclePeriodKey(cycle) {
		if (cycle === 'monthly') return monthKey();
		if (cycle === 'weekly') return isoWeekKey(new Date());
		return todayKey();
	}
	function cycleStartMs(cycle) {
		var now = new Date();
		if (cycle === 'monthly') return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
		if (cycle === 'weekly') {
			var day = now.getDay() || 7;            /* CN = 7 → tuần bắt đầu thứ Hai */
			var monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day - 1));
			return monday.getTime();
		}
		return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
	}

	/* ───────────────── Chờ hệ thống thành tựu (RP) sẵn sàng ───────────────── */
	function whenAchReady(cb) {
		var tries = 0;
		(function poll() {
			if (window.MAPLE && window.MAPLE.ach && window.MAPLE.ach.ready) { cb(window.MAPLE.ach); return; }
			if (tries++ > 60) { cb(window.MAPLE && window.MAPLE.ach ? window.MAPLE.ach : null); return; } /* ~12s thì thôi */
			setTimeout(poll, 200);
		})();
	}

	/* ───────────────── Tải danh sách nhiệm vụ ───────────────── */
	function rawUrl(title) {
		return mw.config.get('wgScript') + '?title=' + encodeURIComponent(title) + '&action=raw';
	}
	function loadTasks(cb) {
		var api = new mw.Api();
		api.get({
			action: 'query', titles: 'MediaWiki:Maple-Tasks.json',
			prop: 'revisions', rvprop: 'content', rvslots: 'main',
			format: 'json', formatversion: 2
		}).done(function (r) {
			var tasks = [];
			try {
				var pg = r.query && r.query.pages && r.query.pages[0];
				if (pg && !pg.missing && pg.revisions && pg.revisions[0]) {
					var rev = pg.revisions[0];
					var t = (rev.slots && rev.slots.main && rev.slots.main.content) || rev.content || '{}';
					t = t.replace(/,\s*([}\]])/g, '$1'); /* dung thứ dấu phẩy thừa */
					var parsed = JSON.parse(t);
					tasks = Array.isArray(parsed) ? parsed : (parsed.tasks || []);
				}
			} catch (e) { tasks = []; }
			cb(tasks.filter(function (x) { return x && x.id && x.active !== false; }));
		}).fail(function () { cb([]); });
	}

	/* ───────────────── Đếm bài đã duyệt (rule approved_articles) ───────────────── */
	var _approvedCache = null;
	function loadApprovedCount(user, cb) {
		if (_approvedCache) { cb(_approvedCache); return; }
		var $req = jQuery.ajax({ url: rawUrl('MediaWiki:Maple-Pending.json'), dataType: 'text', cache: false });
		$req.done(function (raw) {
			var list = [];
			try {
				raw = raw.replace(/,\s*([}\]])/g, '$1');
				var parsed = JSON.parse(raw);
				if (Array.isArray(parsed)) list = parsed;
				else if (parsed && Array.isArray(parsed.pending)) list = parsed.pending;
			} catch (e) { list = []; }
			var unorm = (user || '').replace(/_/g, ' ').toLowerCase();
			var mine = list.filter(function (it) {
				var st = it.status || 'pending';
				var au = (it.author || '').replace(/_/g, ' ').toLowerCase();
				return st === 'approved' && au === unorm;
			}).map(function (it) {
				return { at: it.reviewed_at || it.approved_at || it.submitted_at || it.submitted || null };
			});
			_approvedCache = mine;
			cb(mine);
		}).fail(function () { _approvedCache = []; cb([]); });
	}

	/* ───────────────── Engine kiểm chứng điều kiện ───────────────── */
	/* Mỗi checker(ctx, rule, doneCb) → doneCb({ progress, target, done }).
	   ctx = { user, stats, approved } */
	var RULE_CHECKERS = {
		checkin_today: function (ctx, rule, doneCb) {
			var ok = ctx.stats && ctx.stats.lastLogin === todayKey();
			doneCb({ progress: ok ? 1 : 0, target: 1, done: !!ok });
		},
		checkin_streak: function (ctx, rule, doneCb) {
			var target = rule.count || 1;
			var sk = (ctx.stats && ctx.stats.streak) || 0;
			doneCb({ progress: Math.min(sk, target), target: target, done: sk >= target });
		},
		/* Đọc N hồ sơ trong chu kỳ — tính delta của stats.reads (lifetime) so với
		   snapshot đầu chu kỳ (lưu localStorage theo user + khóa-chu-kỳ). */
		reads_in_cycle: function (ctx, rule, doneCb) {
			var target = rule.count || 1;
			var lifetime = (ctx.stats && ctx.stats.reads) || 0;
			var key = 'maple_nv_reads_' + (ctx.user || '').replace(/\s/g, '_') + '_' + ctx.cycle + '_' + ctx.periodKey;
			var base = null;
			try { var v = localStorage.getItem(key); if (v !== null) base = parseInt(v, 10); } catch (e) {}
			if (base === null || isNaN(base) || base > lifetime) {
				base = lifetime; /* đầu chu kỳ (hoặc dữ liệu lệch) → chốt mốc */
				try { localStorage.setItem(key, String(base)); } catch (e) {}
			}
			var got = Math.max(0, lifetime - base);
			doneCb({ progress: Math.min(got, target), target: target, done: got >= target });
		},
		approved_articles: function (ctx, rule, doneCb) {
			var target = rule.count || 1;
			var startMs = cycleStartMs(rule.window === 'month' ? 'monthly' : (rule.window === 'week' ? 'weekly' : ctx.cycle));
			var n = 0;
			(ctx.approved || []).forEach(function (a) {
				if (!a.at) { n++; return; } /* không có mốc thời gian → vẫn tính (an toàn về phía user) */
				var t = new Date(a.at).getTime();
				if (!isNaN(t) && t >= startMs) n++;
			});
			doneCb({ progress: Math.min(n, target), target: target, done: n >= target });
		},
		has_achievement: function (ctx, rule, doneCb) {
			var earned = (ctx.ach && typeof ctx.ach.earnedMap === 'function' ? ctx.ach.earnedMap() : null) || {};
			var ok = !!earned[rule.id];
			doneCb({ progress: ok ? 1 : 0, target: 1, done: ok });
		},
		achievement_earned_today: function (ctx, rule, doneCb) {
			var earned = (ctx.ach && typeof ctx.ach.earnedMap === 'function' ? ctx.ach.earnedMap() : null) || {};
			var ok = earned[rule.id] === todayKey();
			doneCb({ progress: ok ? 1 : 0, target: 1, done: ok });
		},
		comments_in_cycle: function (ctx, rule, doneCb) {
			var target = rule.count || 1;
			var lifetime = (ctx.stats && ctx.stats.totalComments) || 0;
			var key = 'maple_nv_comments_' + (ctx.user || '').replace(/\s/g, '_') + '_' + ctx.cycle + '_' + ctx.periodKey;
			var base = null;
			try { var v = localStorage.getItem(key); if (v !== null) base = parseInt(v, 10); } catch (e) {}
			if (base === null || isNaN(base) || base > lifetime) {
				base = lifetime;
				try { localStorage.setItem(key, String(base)); } catch (e) {}
			}
			var got = Math.max(0, lifetime - base);
			doneCb({ progress: Math.min(got, target), target: target, done: got >= target });
		},
		chat_msgs_in_cycle: function (ctx, rule, doneCb) {
			var target = rule.count || 1;
			var lifetime = (ctx.stats && ctx.stats.totalChatMsgs) || 0;
			var key = 'maple_nv_chat_' + (ctx.user || '').replace(/\s/g, '_') + '_' + ctx.cycle + '_' + ctx.periodKey;
			var base = null;
			try { var v = localStorage.getItem(key); if (v !== null) base = parseInt(v, 10); } catch (e) {}
			if (base === null || isNaN(base) || base > lifetime) {
				base = lifetime;
				try { localStorage.setItem(key, String(base)); } catch (e) {}
			}
			var got = Math.max(0, lifetime - base);
			doneCb({ progress: Math.min(got, target), target: target, done: got >= target });
		},
		events_joined_in_cycle: function (ctx, rule, doneCb) {
			var target = rule.count || 1;
			var startMs = cycleStartMs(ctx.cycle);
			var count = 0;
			try {
				for (var i = 0; i < localStorage.length; i++) {
					var key = localStorage.key(i);
					if (key && key.indexOf('maple_ev_join_') === 0) {
						var val = localStorage.getItem(key);
						if (val) {
							if (val === '1') {
								count++;
							} else {
								var t = new Date(val).getTime();
								if (!isNaN(t) && t >= startMs) {
									count++;
								}
							}
						}
					}
				}
			} catch (e) {}
			doneCb({ progress: Math.min(count, target), target: target, done: count >= target });
		},
		friends_count: function (ctx, rule, doneCb) {
			var target = rule.count || 1;
			var page = 'Người_dùng:' + ctx.user + '/Chat/Friends';
			var api = new mw.Api();
			api.get({
				action: 'query', titles: page, prop: 'revisions',
				rvprop: 'content', rvslots: 'main', format: 'json', formatversion: 2
			}).done(function (r) {
				var count = 0;
				try {
					var pg = r.query && r.query.pages && r.query.pages[0];
					if (pg && !pg.missing && pg.revisions && pg.revisions[0]) {
						var content = pg.revisions[0].slots.main.content;
						var data = JSON.parse(content);
						if (data && Array.isArray(data.friends)) {
							count = data.friends.length;
						}
					}
				} catch (e) {}
				doneCb({ progress: Math.min(count, target), target: target, done: count >= target });
			}).fail(function () {
				doneCb({ progress: 0, target: target, done: false });
			});
		},
		profile_visit_today: function (ctx, rule, doneCb) {
			var ok = false;
			try {
				var today = todayKey();
				var val = localStorage.getItem('maple_profile_visit_' + (ctx.user || '').replace(/\s/g, '_') + '_' + today);
				ok = val === '1';
			} catch (e) {}
			doneCb({ progress: ok ? 1 : 0, target: 1, done: ok });
		},
		daily_completed_count: function (ctx, rule, doneCb) {
			var target = rule.count || 1;
			var currentMonthKey = todayKey().substring(0, 7); // e.g. "2026-06"
			var flags = (ctx.ach && typeof ctx.ach.data === 'function' && ctx.ach.data().stats && ctx.ach.data().stats.flags) || {};
			var uniqueDays = {};
			Object.keys(flags).forEach(function (key) {
				if (key.indexOf('task_daily_') === 0) {
					var parts = key.split('_');
					if (parts.length >= 3) {
						var datePart = parts[parts.length - 1];
						if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
							var monthPart = datePart.substring(0, 7);
							if (monthPart === currentMonthKey) {
								uniqueDays[datePart] = true;
							}
						}
					}
				}
			});
			var count = Object.keys(uniqueDays).length;
			doneCb({ progress: Math.min(count, target), target: target, done: count >= target });
		}
	};

	function evalTask(ctx, task, cb) {
		var rule = task.rule || {};
		var checker = RULE_CHECKERS[rule.type];
		if (!checker) { cb({ progress: 0, target: 1, done: false, unknown: true }); return; }
		try { checker(ctx, rule, cb); }
		catch (e) { cb({ progress: 0, target: 1, done: false, unknown: true }); }
	}

	/* ───────────────── Boot ───────────────── */
	function boot(user) {
		whenAchReady(function (ach) {
			loadTasks(function (tasks) {
				if (!tasks.length) { renderEmptyAll(user, ach); return; }
				var needApproved = tasks.some(function (t) { return t.rule && t.rule.type === 'approved_articles'; });
				var stats = (ach && ach.data && ach.data().stats) || {};

				var finish = function (approved) {
					var ctx = { user: user, stats: stats, approved: approved || [] };
					processAndRender(ctx, tasks, ach);
				};
				if (needApproved) loadApprovedCount(user, finish); else finish([]);
			});
		});
	}

	/* Đánh giá từng nhiệm vụ → cộng RP nếu đạt → render */
	function processAndRender(ctx, tasks, ach) {
		var results = [];
		var pending = tasks.length;

		tasks.forEach(function (task, idx) {
			var periodKey = cyclePeriodKey(task.cycle || 'daily');
			var localCtx = { user: ctx.user, stats: ctx.stats, approved: ctx.approved, ach: ach,
							 cycle: task.cycle || 'daily', periodKey: periodKey };
			evalTask(localCtx, task, function (res) {
				var flag = 'task_' + task.id + '_' + periodKey;
				var alreadyClaimed = !!(ach && ach.data && ach.data().stats &&
									 ach.data().stats.flags && ach.data().stats.flags[flag]);

				/* TỰ ĐỘNG cộng RP khi đạt & chưa nhận trong chu kỳ này */
				if (res.done && !alreadyClaimed && ach && typeof ach.rpOnce === 'function' && task.rp > 0) {
					ach.rpOnce(flag, task.rp, 'Nhiệm vụ: ' + task.title);
					alreadyClaimed = true;
				}

				results[idx] = { task: task, res: res, claimed: alreadyClaimed };
				if (--pending === 0) {
					if (ach && typeof ach.rpOnce === 'function') {
						var dailyTasks = results.filter(function(r) { return r.task.cycle === 'daily'; });
						var weeklyTasks = results.filter(function(r) { return r.task.cycle === 'weekly'; });
						var monthlyTasks = results.filter(function(r) { return r.task.cycle === 'monthly'; });
						
						var allDailyDone = dailyTasks.length > 0 && dailyTasks.every(function(r) { return r.res.done || r.claimed; });
						var allWeeklyDone = weeklyTasks.length > 0 && weeklyTasks.every(function(r) { return r.res.done || r.claimed; });
						var allMonthlyDone = monthlyTasks.length > 0 && monthlyTasks.every(function(r) { return r.res.done || r.claimed; });
						
						if (allDailyDone) {
							ach.rpOnce('combo_daily_' + cyclePeriodKey('daily'), 15, 'Hoàn thành tất cả Daily Tasks 🌟');
						}
						if (allWeeklyDone) {
							var addedW = ach.rpOnce('combo_weekly_' + cyclePeriodKey('weekly'), 50, 'Hoàn thành tất cả Weekly Tasks 🏆');
							if (addedW > 0 && window.MAPLE && window.MAPLE.award) {
								window.MAPLE.award('weekly_champion');
							}
						}
						if (allMonthlyDone) {
							var addedM = ach.rpOnce('combo_monthly_' + cyclePeriodKey('monthly'), 150, 'Hoàn thành tất cả Monthly Tasks 👑');
							if (addedM > 0 && window.MAPLE && window.MAPLE.award) {
								window.MAPLE.award('monthly_legend');
							}
						}
					}
					renderBoard(ctx, results, ach);
				}
			});
		});
	}

	/* ───────────────── Render bảng nhiệm vụ ───────────────── */
	var _activeTab = 'daily';
	var CYCLES = [
		{ key: 'daily', label: '📅 NGÀY' },
		{ key: 'weekly', label: '🗓️ TUẦN' },
		{ key: 'monthly', label: '🏆 THÁNG' }
	];

	function renderBoard(ctx, results, ach) {
		var totalRP = (ach && typeof ach.totalRP === 'function') ? ach.totalRP() : 0;
		var tier = null;
		if (window.MAPLE && window.MAPLE.catalog && window.MAPLE.catalog.tierOf) {
			tier = window.MAPLE.catalog.tierOf(totalRP);
		}

		var byCycle = { daily: [], weekly: [], monthly: [] };
		results.forEach(function (r) {
			var c = (r.task.cycle || 'daily');
			(byCycle[c] || byCycle.daily).push(r);
		});

		var wrap = document.createElement('div');
		wrap.id = 'nv-wrap';
		wrap.innerHTML = [
			'<div id="nv-header">',
			'  <div id="nv-header-icon">🎯</div>',
			'  <div id="nv-header-text">',
			'    <h1>NHIỆM VỤ THỰC ĐỊA</h1>',
			'    <p>Hoàn thành nhiệm vụ M.A.P.L.E giao để nhận điểm uy tín (RP)</p>',
			'  </div>',
			'  <button id="nv-sync-btn">↻ Làm mới</button>',
			'</div>',

			'<div id="nv-rpbar">',
			'  <div><div id="nv-rp-num">' + esc(String(totalRP)) + '</div><div id="nv-rp-lbl">ĐIỂM UY TÍN (RP)</div></div>',
			(tier ? '  <div id="nv-rp-tier" style="color:' + esc(tier.color) + ';">' + esc(tier.label) + '</div>' : ''),
			'</div>',

			'<div id="nv-tabs">' + CYCLES.map(function (c) {
				var n = byCycle[c.key].length;
				return '<button class="nv-tab' + (c.key === _activeTab ? ' active' : '') + '" data-cycle="' + c.key + '">' +
					c.label + '<span class="nv-badge">' + n + '</span></button>';
			}).join('') + '</div>',

			'<div id="nv-list"></div>',

			'<div id="nv-footer">Tự động cập nhật khi bạn hoạt động · Cập nhật: ' +
				esc(new Date().toLocaleString('vi-VN')) + '</div>'
		].join('\n');

		mountNode(wrap);
		setH1('Nhiệm Vụ Thực Địa — M.A.P.L.E');
		document.title = 'Nhiệm Vụ — M.A.P.L.E';

		function renderList() {
			var list = document.getElementById('nv-list');
			if (!list) return;
			var items = byCycle[_activeTab] || [];
			if (!items.length) {
				list.innerHTML = '<div class="nv-empty"><div class="nv-empty-icon">🗒️</div>Chưa có nhiệm vụ nào cho chu kỳ này.</div>';
				return;
			}
			list.innerHTML = items.map(buildCard).join('');
		}

		renderList();

		wrap.querySelectorAll('.nv-tab').forEach(function (tab) {
			tab.addEventListener('click', function () {
				wrap.querySelectorAll('.nv-tab').forEach(function (t) { t.classList.remove('active'); });
				tab.classList.add('active');
				_activeTab = tab.getAttribute('data-cycle');
				renderList();
			});
		});

		document.getElementById('nv-sync-btn').addEventListener('click', function () {
			_approvedCache = null;
			setContent(loadingHTML('Đang làm mới…'));
			boot(ctx.user);
		});
	}

	function buildCard(r) {
		var task = r.task, res = r.res;
		var pct = res.target > 0 ? Math.round(Math.min(res.progress / res.target, 1) * 100) : (res.done ? 100 : 0);
		var statusHtml;
		if (r.claimed) statusHtml = '<span class="nv-status claimed">✓ ĐÃ NHẬN RP</span>';
		else if (res.done) statusHtml = '<span class="nv-status done">HOÀN THÀNH</span>';
		else if (res.unknown) statusHtml = '<span class="nv-status todo">ĐANG THEO DÕI</span>';
		else statusHtml = '<span class="nv-status todo">CHƯA XONG</span>';

		return [
			'<div class="nv-card' + ((res.done || r.claimed) ? ' done' : '') + '">',
			'  <div class="nv-card-top">',
			'    <div class="nv-card-icon">' + esc(task.icon || '🎯') + '</div>',
			'    <div class="nv-card-body">',
			'      <div class="nv-card-title">' + esc(task.title || '(nhiệm vụ)') + '</div>',
			'      <div class="nv-card-desc">' + esc(task.desc || '') + '</div>',
			'      <div class="nv-progress-wrap">',
			'        <div class="nv-progress-bar"><div class="nv-progress-fill" style="width:' + pct + '%"></div></div>',
			'        <div class="nv-progress-lbl">' + esc(res.progress) + '/' + esc(res.target) + '</div>',
			'      </div>',
			'    </div>',
			'    <div class="nv-reward">',
			'      <span class="nv-rp-pill">✨ +' + esc(String(task.rp || 0)) + ' RP</span>',
			'      ' + statusHtml,
			'    </div>',
			'  </div>',
			'</div>'
		].join('\n');
	}

	function renderEmptyAll(user, ach) {
		var wrap = document.createElement('div');
		wrap.id = 'nv-wrap';
		wrap.innerHTML = [
			'<div id="nv-header">',
			'  <div id="nv-header-icon">🎯</div>',
			'  <div id="nv-header-text">',
			'    <h1>NHIỆM VỤ THỰC ĐỊA</h1>',
			'    <p>Hiện chưa có nhiệm vụ nào được giao</p>',
			'  </div>',
			'</div>',
			'<div class="nv-empty"><div class="nv-empty-icon">🗒️</div>',
			'Ban Quản Trị chưa giao nhiệm vụ nào. Hãy quay lại sau!</div>'
		].join('\n');
		mountNode(wrap);
		setH1('Nhiệm Vụ Thực Địa — M.A.P.L.E');
	}

	function renderGuest() {
		var loginUrl = mw.util.getUrl('Special:UserLogin', { returnto: mw.config.get('wgPageName') });
		var node = document.createElement('div');
		node.id = 'nv-guest';
		node.innerHTML = [
			'<div class="nv-guest-icon">🔒</div>',
			'<h2>Cần đăng nhập để nhận nhiệm vụ</h2>',
			'<p>Nhiệm vụ thực địa của M.A.P.L.E chỉ dành cho thành viên đã đăng nhập. ',
			'Đăng nhập để theo dõi tiến độ và nhận điểm uy tín (RP).</p>',
			'<a class="nv-cta" href="' + esc(loginUrl) + '">ĐĂNG NHẬP →</a>'
		].join('');
		mountNode(node);
		setH1('Nhiệm Vụ Thực Địa — M.A.P.L.E');
	}

	/* CSS fallback nếu vì lý do nào đó NhiemVu.css chưa nạp (an toàn) */
	function injectStyleFallback() {
		if (document.getElementById('nv-style-loaded') || document.getElementById('nv-styles')) return;
		/* NhiemVu.css nạp qua Common.js; ở đây chỉ đánh dấu, không nhân đôi CSS lớn. */
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
	else init();
})();
