(function (global) {
  "use strict";

  var STORAGE_TASK_DONE = "whmetro-today-task-done";
  var STORAGE_NOTIFY_EXTRA = "whmetro-notify-extra";
  var STORAGE_NOTIFY_READ = "whmetro-notify-read";
  var STORAGE_NOTIFY_BATCH = "whmetro-today-task-notified-keys";
  var STORAGE_MANUAL_ROWS = "whmetro-manual-rows";
  var DEFAULT_NOTIFY_ROWS = [
    { id: "n1", read: "未读" },
    { id: "n2", read: "已读" },
    { id: "n3", read: "未读" },
    { id: "n4", read: "未读" }
  ];

  var TASK_ROWS = [
    { id: "T-001", name: "新建商业文化设施项目", distance: 13, type: "一般项目", lastTime: "2025-06-27 10:54:00", progress: "现场混凝土养护", lat: 30.5864, lng: 114.3098, level: "normal", done: false, line: "8号线", direction: "上行", section: "水果湖-洪山路", station: "洪山路", patrolDate: "2025-06-27" },
    { id: "T-002", name: "洪山路至小洪山商业公寓项目", distance: 156, type: "重点项目", lastTime: "2025-06-27 10:54:00", progress: "现场混凝土养护", lat: 30.5852, lng: 114.3146, level: "key", done: false, line: "8号线", direction: "下行", section: "洪山路-小洪山", station: "小洪山", patrolDate: "2025-06-27" },
    { id: "T-003", name: "三金潭车辆段上盖物业综合开发项目", distance: 1543, type: "一般项目", lastTime: "2025-06-27 10:54:00", progress: "现场钢筋绑扎施工", lat: 30.5812, lng: 114.3201, level: "normal", done: false, line: "2号线", direction: "上行", section: "金潭路-宏图大道", station: "宏图大道", patrolDate: "2025-06-27" },
    { id: "T-004", name: "中北路地下商业连通道项目", distance: 268, type: "一般项目", lastTime: "2025-06-27 09:42:00", progress: "围护结构施工准备", lat: 30.5844, lng: 114.3168, level: "normal", done: false, line: "8号线", direction: "上行", section: "水果湖-洪山路", station: "洪山路", patrolDate: "2025-06-27" },
    { id: "T-005", name: "东亭停车场附属配套工程", distance: 836, type: "重点项目", lastTime: "2025-06-27 08:35:00", progress: "基坑支护监测中", lat: 30.5891, lng: 114.3187, level: "key", done: false, line: "7号线", direction: "下行", section: "洪山路-小洪山", station: "小洪山", patrolDate: "2025-06-27" },
    { id: "T-006", name: "楚河汉街区间市政接驳改造项目", distance: 1124, type: "一般项目", lastTime: "2025-06-27 11:18:00", progress: "临边围挡加固施工", lat: 30.5827, lng: 114.3129, level: "normal", done: false, line: "8号线", direction: "上行", section: "水果湖-洪山路", station: "洪山路", patrolDate: "2025-06-27" }
  ];

  var currentTab = "route";
  var alertFrameLoaded = false;

  function $(id) { return document.getElementById(id); }
  function esc(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function readJson(key, fallback) { try { var raw = global.localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; } }
  function readTaskDoneMap() { return readJson(STORAGE_TASK_DONE, {}); }
  function readNotifyExtras() { return readJson(STORAGE_NOTIFY_EXTRA, []); }
  function readNotifyReadIds() { return readJson(STORAGE_NOTIFY_READ, []); }
  function isNotifyRead(row, readIds) { if (!row) return true; if (row.read === "已读") return true; return readIds.indexOf(row.id) >= 0; }

  function syncTaskDoneState() {
    var doneMap = readTaskDoneMap();
    TASK_ROWS.forEach(function (item) {
      item.done = !!doneMap[item.id];
    });
  }
  function resetMockTaskState() {
    TASK_ROWS.forEach(function (item) { item.done = false; });
    try { global.localStorage.removeItem(STORAGE_TASK_DONE); } catch (e) {}
  }
  function isPageReload() {
    try {
      var nav = performance.getEntriesByType("navigation")[0];
      return nav && nav.type === "reload";
    } catch (e) {
      return false;
    }
  }
  function getTaskById(id) { for (var i = 0; i < TASK_ROWS.length; i += 1) { if (TASK_ROWS[i].id === id) return TASK_ROWS[i]; } return null; }
  function projectHref(item) { var name = item && item.name ? "?project=" + encodeURIComponent(item.name) : ""; return "project.html" + name; }
  function manualNewHref(item) {
    return "manual.html?action=new&source=today-task&taskId=" + encodeURIComponent(item.id) +
      "&project=" + encodeURIComponent(item.name) +
      "&line=" + encodeURIComponent(item.line || "") +
      "&direction=" + encodeURIComponent(item.direction || "") +
      "&section=" + encodeURIComponent(item.section || "") +
      "&station=" + encodeURIComponent(item.station || "") +
      "&patrolDate=" + encodeURIComponent(item.patrolDate || "");
  }
  function notifyHref() { return "../../mine/pages/notify.html"; }
  function pendingCount() { return TASK_ROWS.filter(function (item) { return !item.done; }).length; }
  function setStats() {
    var pendingTotal = pendingCount();
    var keyCount = TASK_ROWS.filter(function (item) { return item.level === "key"; }).length;
    var normalCount = TASK_ROWS.filter(function (item) { return item.level === "normal"; }).length;
    ["today-task-total", "today-task-key", "today-task-normal"].forEach(function (id, idx) {
      var el = $(id);
      if (!el) return;
      var numEl = el.querySelector(".mp-stat-card__num");
      var val = idx === 0 ? pendingTotal : (idx === 1 ? keyCount : normalCount);
      if (numEl) numEl.textContent = String(val);
      else el.textContent = String(val);
    });
  }
  function updateNotifyBadge() { var badge = $("today-task-notify-badge"); if (!badge) return; var readIds = readNotifyReadIds(); var rows = DEFAULT_NOTIFY_ROWS.concat(readNotifyExtras()); var unread = rows.filter(function (row) { return !isNotifyRead(row, readIds); }).length; if (!unread) { badge.hidden = true; badge.textContent = "0"; return; } badge.hidden = false; badge.textContent = unread > 99 ? "99+" : String(unread); }
  function readManualRows() { return readJson(STORAGE_MANUAL_ROWS, []); }
  function formatNow() { var d = new Date(); var y = d.getFullYear(); var m = String(d.getMonth() + 1).padStart(2, "0"); var day = String(d.getDate()).padStart(2, "0"); var h = String(d.getHours()).padStart(2, "0"); var min = String(d.getMinutes()).padStart(2, "0"); return y + "-" + m + "-" + day + " " + h + ":" + min; }
  function todayStr() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function uniqueUsers(rows) { var users = []; rows.forEach(function (r) { var u = r.user || "李明"; if (u === "当前用户") u = "李明"; if (users.indexOf(u) < 0) users.push(u); }); return users; }
  function readNotifiedKeys() {
    var data = readJson(STORAGE_NOTIFY_BATCH, {});
    return data[todayStr()] || [];
  }
  function writeNotifiedKeys(keys) {
    var data = readJson(STORAGE_NOTIFY_BATCH, {});
    data[todayStr()] = keys;
    try { global.localStorage.setItem(STORAGE_NOTIFY_BATCH, JSON.stringify(data)); } catch (e) {}
  }
  function manualRowNotifyKey(row) {
    if (row.taskId) return "task:" + row.taskId;
    if (row.id) return "manual:" + row.id;
    return "proj:" + (row.projectName || row.title || "") + ":" + (row.savedAt || "");
  }
  function enrichNotifyProject(row) {
    var task = getTaskById(row.taskId);
    var name = row.projectName || row.title || (task && task.name) || "";
    return Object.assign({}, task || {}, row, {
      projectName: name,
      recordId: row.recordId || row.id || "",
      line: row.line || (task && task.line) || "",
      direction: row.direction || (task && task.direction) || "",
      section: row.section || (task && task.section) || "",
      station: row.station || (task && task.station) || "",
      progress: row.progress || (task && task.progress) || "",
      user: row.user || "李明",
      patrolDate: row.patrolDate || row.savedAt || formatNow(),
      updatedAt: row.updatedAt || row.savedAt || formatNow()
    });
  }
  function purgeInstantTodayTaskNotifies() {
    try {
      var extras = readNotifyExtras();
      var cleaned = extras.filter(function (row) {
        if (row.type !== "项目巡查") return true;
        if (row.source === "今日巡线" && !Array.isArray(row.projects)) return false;
        return true;
      });
      if (cleaned.length !== extras.length) {
        global.localStorage.setItem(STORAGE_NOTIFY_EXTRA, JSON.stringify(cleaned));
      }
    } catch (e) {}
  }
  function findTodayBatchNotifyIndex(extras, today) {
    for (var i = 0; i < extras.length; i += 1) {
      var row = extras[i];
      if (
        row &&
        row.type === "项目巡查" &&
        row.source === "今日巡线" &&
        Array.isArray(row.projects) &&
        row.time &&
        String(row.time).slice(0, 10) === today
      ) {
        return i;
      }
    }
    return -1;
  }
  function mergeNotifyProjects(existing, incoming) {
    var merged = (existing || []).slice();
    var seen = {};
    merged.forEach(function (proj) {
      var key = (proj.taskId || "") + "|" + (proj.projectName || proj.title || "");
      seen[key] = true;
    });
    incoming.forEach(function (proj) {
      var key = (proj.taskId || "") + "|" + (proj.projectName || proj.title || "");
      if (seen[key]) return;
      seen[key] = true;
      merged.push(proj);
    });
    return merged;
  }
  function buildPendingNotifyProjects() {
    var manualRows = readManualRows();
    var today = todayStr();
    var notified = readNotifiedKeys();
    var projects = [];
    var newKeys = [];
    var seen = {};

    manualRows.forEach(function (row) {
      if (!row.savedAt || row.savedAt.slice(0, 10) !== today) return;
      if (!row.taskId) return;
      var key = manualRowNotifyKey(row);
      if (notified.indexOf(key) >= 0) return;
      var name = row.projectName || row.title || "";
      if (!name || seen[name]) return;
      seen[name] = true;
      projects.push(enrichNotifyProject(Object.assign({}, row, { projectName: name })));
      newKeys.push(key);
    });

    return { projects: projects, newKeys: newKeys };
  }
  function generateDailyNotify() {
    var pending = buildPendingNotifyProjects();
    if (!pending.projects.length) return { created: false, count: 0 };
    var today = todayStr();
    var extras = readNotifyExtras();
    extras = extras.filter(function (row) {
      return !(row.type === "项目巡查" && row.source === "今日巡线" && !Array.isArray(row.projects));
    });
    var existingIdx = findTodayBatchNotifyIndex(extras, today);
    var mergedProjects;
    var notifyRow;
    if (existingIdx >= 0) {
      notifyRow = Object.assign({}, extras[existingIdx]);
      mergedProjects = mergeNotifyProjects(notifyRow.projects, pending.projects);
      notifyRow.projects = mergedProjects;
      notifyRow.time = formatNow();
      notifyRow.read = notifyRow.read || "未读";
      notifyRow.title = today + " " + uniqueUsers(mergedProjects).join("、") + " 已完成以下项目的巡查";
      extras.splice(existingIdx, 1);
      extras.unshift(notifyRow);
    } else {
      mergedProjects = pending.projects;
      notifyRow = {
        id: "task-notify-" + Date.now(),
        title: today + " " + uniqueUsers(mergedProjects).join("、") + " 已完成以下项目的巡查",
        type: "项目巡查",
        time: formatNow(),
        read: "未读",
        source: "今日巡线",
        projects: mergedProjects
      };
      extras.unshift(notifyRow);
    }
    try { global.localStorage.setItem(STORAGE_NOTIFY_EXTRA, JSON.stringify(extras)); } catch (e) {}
    var notified = readNotifiedKeys();
    pending.newKeys.forEach(function (key) {
      if (notified.indexOf(key) < 0) notified.push(key);
    });
    writeNotifiedKeys(notified);
    updateNotifyBadge();
    try { if (global.top && global.top.WHHeaderBadges && global.top.WHHeaderBadges.refreshMineHubBadges) { global.top.WHHeaderBadges.refreshMineHubBadges(); } } catch (e) {}
    return { created: true, count: pending.projects.length, total: mergedProjects.length };
  }

  function renderList() {
    var host = $("today-task-list");
    if (!host) return;
    var rows = TASK_ROWS.slice().sort(function (a, b) { if (a.done === b.done) return 0; return a.done ? 1 : -1; });
    host.innerHTML = rows.map(function (item) {
      var cardClass = "mp-today-task-item" + (item.done ? " is-completed" : "");
      return '' +
        '<article class="' + cardClass + '" data-id="' + esc(item.id) + '">' +
          '<div class="mp-today-task-item__click" data-action="open-project" data-id="' + esc(item.id) + '">' +
            '<div class="mp-today-task-item__head">' +
              '<div class="mp-today-task-item__title-wrap">' +
                '<h3 class="mp-today-task-item__title">' + esc(item.name) + '</h3>' +
                (item.done ? '<span class="mp-today-task-item__done">已完成</span>' : '') +
              '</div>' +
              '<div class="mp-today-task-item__distance">距离' + esc(item.distance) + 'm</div>' +
            '</div>' +
            '<dl class="mp-today-task-item__meta">' +
              '<dt>项目类型</dt><dd>' + esc(item.type) + '</dd>' +
              '<dt>最近巡查时间</dt><dd>' + esc(item.lastTime) + '</dd>' +
              '<dt>项目进展</dt><dd>' + esc(item.progress) + '</dd>' +
            '</dl>' +
          '</div>' +
          '<div class="mp-today-task-item__foot">' +
            '<button type="button" class="mp-today-task-item__fill"' +
            (item.done ? ' disabled aria-disabled="true"' : '') +
            ' data-action="fill-task" data-id="' + esc(item.id) + '"><span class="mp-today-task-item__fill-text">填写</span></button>' +
          '</div>' +
        '</article>';
    }).join("");
    bindFillButtons(host);
  }

  function navigateFillTask(id) {
    var fillTask = getTaskById(id);
    if (!fillTask || fillTask.done) return;
    global.location.href = manualNewHref(fillTask);
  }

  function bindFillButtons(host) {
    if (!host) return;
    host.querySelectorAll("[data-action='fill-task']").forEach(function (btn) {
      if (btn._fillBound) return;
      btn._fillBound = true;
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (btn.disabled) return;
        navigateFillTask(btn.getAttribute("data-id"));
      });
    });
  }

  function setActiveRouteTab() { var tabs = document.querySelectorAll(".mp-today-task-tab"); tabs.forEach(function (node) { var active = node.getAttribute("data-tab") === "route"; node.classList.toggle("is-active", active); node.setAttribute("aria-selected", active ? "true" : "false"); }); }
  function setActiveAlertTab() { var tabs = document.querySelectorAll(".mp-today-task-tab"); tabs.forEach(function (node) { var active = node.getAttribute("data-tab") === "alert"; node.classList.toggle("is-active", active); node.setAttribute("aria-selected", active ? "true" : "false"); }); }
  function makeTaskIcon(level) { var color = level === "key" ? "#ef4444" : "#3b82f6"; return L.divIcon({ className: "", html: '<div style="width:18px;height:18px;border-radius:999px;background:' + color + ';border:2px solid #fff;box-shadow:0 0 12px rgba(37,99,235,.25);"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }); }
  function makeUserIcon() { return L.divIcon({ className: "", html: '<div style="width:22px;height:22px;border-radius:999px;background:#236aff;border:3px solid #fff;box-shadow:0 0 16px rgba(35,106,255,.28);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;"><i class="fa-solid fa-location-dot"></i></div>', iconSize: [22, 22], iconAnchor: [11, 11] }); }

  function mountMap() {
    var host = $("today-task-map");
    if (!host || typeof L === "undefined") return;
    if (host._leaflet_id != null) { host._leaflet_id = null; host.innerHTML = ""; }
    var map = L.map(host, { zoomControl: false, attributionControl: false }).setView([30.5858, 114.3121], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
    var markers = [];
    TASK_ROWS.forEach(function (item) {
      var marker = L.marker([item.lat, item.lng], { icon: makeTaskIcon(item.level) }).addTo(map);
      marker.bindTooltip(item.name, { direction: "top", offset: [0, -10], opacity: 0.96 });
      markers.push(marker);
    });
    var userMarker = L.marker([30.5846, 114.3109], { icon: makeUserIcon() }).addTo(map);
    userMarker.bindTooltip("当前人员位置", { direction: "top", offset: [0, -12], opacity: 0.96 });
    markers.push(userMarker);
    if (markers.length) {
      var group = new L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.18));
    }
    setTimeout(function () { map.invalidateSize(); }, 80);
  }

  function openConfirm() {
    var mask = $("today-task-confirm-mask");
    var text = $("today-task-confirm-text");
    if (!mask || !text) return;
    var remain = pendingCount();
    text.textContent = remain === 0 ? "今日巡线任务已完成" : "今日巡线任务剩余 " + remain + " 条未完成";
    mask.classList.add("is-show");
    mask.setAttribute("aria-hidden", "false");
    document.body.classList.add("today-task-confirm-open");
  }
  function closeConfirm() {
    var mask = $("today-task-confirm-mask");
    if (!mask) return;
    mask.classList.remove("is-show");
    mask.setAttribute("aria-hidden", "true");
    document.body.classList.remove("today-task-confirm-open");
  }

  function showRouteView() { currentTab = "route"; var route = $("today-task-route-view"); var alertFrame = $("today-task-alert-frame"); if (route) route.hidden = false; if (alertFrame) { alertFrame.hidden = true; } setActiveRouteTab(); }
  function showAlertView() { currentTab = "alert"; var route = $("today-task-route-view"); var alertFrame = $("today-task-alert-frame"); if (route) route.hidden = true; if (alertFrame) { alertFrame.hidden = false; if (!alertFrameLoaded) { alertFrame.src = "patrol-alerts.html?embedded=1&hideHeader=1"; alertFrameLoaded = true; } } setActiveAlertTab(); }
  function refreshView() {
    syncTaskDoneState();
    setStats();
    renderList();
    updateNotifyBadge();
    if (currentTab === "alert") setActiveAlertTab();
    else setActiveRouteTab();
  }

  function bindEvents() {
    document.addEventListener("click", function (event) {
      var tab = event.target.closest(".mp-today-task-tab");
      if (tab) {
        var tabKey = tab.getAttribute("data-tab");
        if (tabKey === "alert") { showAlertView(); return; }
        showRouteView();
        return;
      }

      var fillBtn = event.target.closest("[data-action='fill-task']");
      if (fillBtn) {
        event.preventDefault();
        event.stopPropagation();
        if (fillBtn.disabled) return;
        navigateFillTask(fillBtn.getAttribute("data-id"));
        return;
      }
      var projectCard = event.target.closest("[data-action='open-project']");
      if (projectCard) {
        if (event.target.closest(".mp-today-task-item__fill")) return;
        var row = getTaskById(projectCard.getAttribute("data-id"));
        global.location.href = projectHref(row);
        return;
      }
      var finishBtn = event.target.closest(".mp-today-task-finish"); if (finishBtn) { openConfirm(); return; }
      var noticeBtn = event.target.closest(".mp-today-task-notice"); if (noticeBtn) { global.location.href = notifyHref(); return; }
      if (event.target.closest("[data-action='today-task-confirm-cancel']") || event.target.id === "today-task-confirm-mask") { closeConfirm(); return; }
      if (event.target.closest("[data-action='today-task-confirm-ok']")) {
        closeConfirm();
        var notifyResult = generateDailyNotify();
        if (global.MiniApp && global.MiniApp.toast) {
          var remain = pendingCount();
          var toastMsg = "";
          if (notifyResult.created) {
            toastMsg = "已生成巡查通知（" + (notifyResult.total || notifyResult.count) + " 个项目）";
            if (remain > 0) toastMsg += "，剩余 " + remain + " 条未完成";
            else toastMsg += "，今日巡线已全部完成";
          } else if (remain === 0) {
            toastMsg = "今日巡线任务已完成，暂无新填写的巡查项目";
          } else {
            toastMsg = "暂无新填写的巡查项目，剩余 " + remain + " 条未完成";
          }
          global.MiniApp.toast(toastMsg);
        }
      }
    });
    global.addEventListener("pageshow", refreshView);
    global.addEventListener("focus", refreshView);
  }

  function boot() {
    if (isPageReload()) resetMockTaskState();
    refreshView();
    mountMap();
    bindEvents();
    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) { global.MiniAppFrame.syncTabbar(); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})(window);