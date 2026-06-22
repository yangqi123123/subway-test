(function (global) {
  "use strict";

  var STORAGE_TASK_DONE = "whmetro-today-task-done";
  var STORAGE_NOTIFY_EXTRA = "whmetro-notify-extra";
  var STORAGE_NOTIFY_READ = "whmetro-notify-read";
  var DEFAULT_NOTIFY_ROWS = [
    { id: "n1", read: "未读" },
    { id: "n2", read: "已读" },
    { id: "n3", read: "未读" },
    { id: "n4", read: "未读" }
  ];

  var TASK_ROWS = [
    { id: "T-001", name: "新建商业文化设施项目", distance: 13, type: "一般项目", lastTime: "2025-06-27 10:54:00", progress: "现场混凝土养护", lat: 30.5864, lng: 114.3098, level: "normal", done: true },
    { id: "T-002", name: "洪山路至小洪山商业公寓项目", distance: 156, type: "重点项目", lastTime: "2025-06-27 10:54:00", progress: "现场混凝土养护", lat: 30.5852, lng: 114.3146, level: "key", done: false },
    { id: "T-003", name: "三金潭车辆段上盖物业综合开发项目", distance: 1543, type: "一般项目", lastTime: "2025-06-27 10:54:00", progress: "现场钢筋绑扎施工", lat: 30.5812, lng: 114.3201, level: "normal", done: false }
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

  function syncTaskDoneState() { var doneMap = readTaskDoneMap(); TASK_ROWS.forEach(function (item) { if (doneMap[item.id]) item.done = true; }); }
  function getTaskById(id) { for (var i = 0; i < TASK_ROWS.length; i += 1) { if (TASK_ROWS[i].id === id) return TASK_ROWS[i]; } return null; }
  function projectHref(item) { var name = item && item.name ? "?project=" + encodeURIComponent(item.name) : ""; return "project.html" + name; }
  function manualNewHref(item) { return "manual.html?action=new&source=today-task&taskId=" + encodeURIComponent(item.id) + "&project=" + encodeURIComponent(item.name); }
  function notifyHref() { return "../../mine/pages/notify.html"; }
  function pendingCount() { return TASK_ROWS.filter(function (item) { return !item.done; }).length; }
  function setStats() { var total = TASK_ROWS.length; var keyCount = TASK_ROWS.filter(function (item) { return item.level === "key"; }).length; var normalCount = TASK_ROWS.filter(function (item) { return item.level === "normal"; }).length; if ($("today-task-total")) $("today-task-total").textContent = String(total); if ($("today-task-key")) $("today-task-key").textContent = String(keyCount); if ($("today-task-normal")) $("today-task-normal").textContent = String(normalCount); }
  function updateNotifyBadge() { var badge = $("today-task-notify-badge"); if (!badge) return; var readIds = readNotifyReadIds(); var rows = DEFAULT_NOTIFY_ROWS.concat(readNotifyExtras()); var unread = rows.filter(function (row) { return !isNotifyRead(row, readIds); }).length; if (!unread) { badge.hidden = true; badge.textContent = "0"; return; } badge.hidden = false; badge.textContent = unread > 99 ? "99+" : String(unread); }

  function renderList() {
    var host = $("today-task-list");
    if (!host) return;
    var rows = TASK_ROWS.slice().sort(function (a, b) { if (a.done === b.done) return 0; return a.done ? 1 : -1; });
    host.innerHTML = rows.map(function (item) {
      var cardClass = "mp-today-task-item mp-today-task-item__click" + (item.done ? " is-completed" : "");
      return '' +
        '<article class="' + cardClass + '" data-action="open-project" data-id="' + esc(item.id) + '">' +
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
          '<div class="mp-today-task-item__foot">' +
            '<button type="button" class="mp-today-task-item__fill" data-action="fill-task" data-id="' + esc(item.id) + '"><span class="mp-today-task-item__fill-text">填写</span></button>' +
          '</div>' +
        '</article>';
    }).join("");
  }

  function setActiveRouteTab() { var tabs = document.querySelectorAll(".mp-today-task-tab"); tabs.forEach(function (node) { var active = node.getAttribute("data-tab") === "route"; node.classList.toggle("is-active", active); node.setAttribute("aria-selected", active ? "true" : "false"); }); }
  function setActiveAlertTab() { var tabs = document.querySelectorAll(".mp-today-task-tab"); tabs.forEach(function (node) { var active = node.getAttribute("data-tab") === "alert"; node.classList.toggle("is-active", active); node.setAttribute("aria-selected", active ? "true" : "false"); }); }
  function makeTaskIcon(level) { var color = level === "key" ? "#ef4444" : "#3b82f6"; return L.divIcon({ className: "", html: '<div style="width:18px;height:18px;border-radius:999px;background:' + color + ';border:2px solid #fff;box-shadow:0 0 12px rgba(37,99,235,.25);"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }); }
  function makeUserIcon() { return L.divIcon({ className: "", html: '<div style="width:22px;height:22px;border-radius:999px;background:#236aff;border:3px solid #fff;box-shadow:0 0 16px rgba(35,106,255,.28);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;"><i class="fa-solid fa-location-dot"></i></div>', iconSize: [22, 22], iconAnchor: [11, 11] }); }

  function mountMap() { var host = $("today-task-map"); if (!host || typeof L === "undefined") return; if (host._leaflet_id != null) { host._leaflet_id = null; host.innerHTML = ""; } var map = L.map(host, { zoomControl: false, attributionControl: false }).setView([30.5858, 114.3121], 15); L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map); TASK_ROWS.forEach(function (item) { var marker = L.marker([item.lat, item.lng], { icon: makeTaskIcon(item.level) }).addTo(map); marker.bindTooltip(item.name, { direction: "top", offset: [0, -10], opacity: 0.96 }); }); var userMarker = L.marker([30.5846, 114.3109], { icon: makeUserIcon() }).addTo(map); userMarker.bindTooltip("当前人员位置", { direction: "top", offset: [0, -12], opacity: 0.96 }); var area = L.circle([30.5854, 114.3112], { radius: 220, color: "#22c55e", weight: 2, opacity: 0.7, dashArray: "8 6", fillOpacity: 0.03 }).addTo(map); map.fitBounds(area.getBounds().pad(0.18)); setTimeout(function () { map.invalidateSize(); }, 80); }

  function openConfirm() { var mask = $("today-task-confirm-mask"); var text = $("today-task-confirm-text"); if (!mask || !text) return; var remain = pendingCount(); text.textContent = remain === 0 ? "今日巡线任务已完成" : "今日巡线任务剩余 " + remain + " 条未完成"; mask.classList.add("is-show"); mask.setAttribute("aria-hidden", "false"); }
  function closeConfirm() { var mask = $("today-task-confirm-mask"); if (!mask) return; mask.classList.remove("is-show"); mask.setAttribute("aria-hidden", "true"); }

  function showRouteView() { currentTab = "route"; var route = $("today-task-route-view"); var alertFrame = $("today-task-alert-frame"); if (route) route.hidden = false; if (alertFrame) { alertFrame.hidden = true; } setActiveRouteTab(); }
  function showAlertView() { currentTab = "alert"; var route = $("today-task-route-view"); var alertFrame = $("today-task-alert-frame"); if (route) route.hidden = true; if (alertFrame) { alertFrame.hidden = false; if (!alertFrameLoaded) { alertFrame.src = "patrol-alerts.html?embedded=1&hideHeader=1"; alertFrameLoaded = true; } } setActiveAlertTab(); }
  function refreshView() { syncTaskDoneState(); setStats(); renderList(); updateNotifyBadge(); if (currentTab === "alert") setActiveAlertTab(); else setActiveRouteTab(); }

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
      if (fillBtn) { event.preventDefault(); event.stopPropagation(); var fillTask = getTaskById(fillBtn.getAttribute("data-id")); if (fillTask) global.location.href = manualNewHref(fillTask); return; }
      var projectCard = event.target.closest("[data-action='open-project']");
      if (projectCard) { var row = getTaskById(projectCard.getAttribute("data-id")); global.location.href = projectHref(row); return; }
      var finishBtn = event.target.closest(".mp-today-task-finish"); if (finishBtn) { openConfirm(); return; }
      var noticeBtn = event.target.closest(".mp-today-task-notice"); if (noticeBtn) { global.location.href = notifyHref(); return; }
      if (event.target.closest("[data-action='today-task-confirm-cancel']") || event.target.id === "today-task-confirm-mask") { closeConfirm(); return; }
      if (event.target.closest("[data-action='today-task-confirm-ok']")) { closeConfirm(); if (global.MiniApp && global.MiniApp.toast) { var remain = pendingCount(); global.MiniApp.toast(remain === 0 ? "今日巡线任务已完成" : "今日巡线任务剩余 " + remain + " 条未完成"); } }
    });
    global.addEventListener("pageshow", refreshView);
    global.addEventListener("focus", refreshView);
  }

  function boot() { refreshView(); mountMap(); bindEvents(); if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) { global.MiniAppFrame.syncTabbar(); } }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})(window);