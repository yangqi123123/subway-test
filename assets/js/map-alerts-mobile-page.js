/**
 * 移动端告警信息 — 扁平子级列表，无地图，UI 对齐应急人员
 */
(function (global) {
  "use strict";

  var searchQuery = "";
  var lastRendered = [];
  var currentDetailId = null;

  function $(id) {
    return document.getElementById(id);
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function api() {
    return global.WHMapAlerts;
  }

  function showToast(msg) {
    var el = $("patrol-alerts-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      el.classList.remove("show");
    }, 1800);
  }

  function dispatchViewChange() {
    global.dispatchEvent(new Event("wh-patrol-alerts-view-change"));
  }

  function setSheetOpen(sheet, open) {
    if (!sheet) return;
    sheet.classList.toggle("is-open", !!open);
    sheet.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.classList.toggle("mp-scroll-locked", !!open);
  }

  function syncSearchClear() {
    var input = $("patrol-alerts-search-trigger");
    var clearBtn = $("patrol-alerts-search-clear");
    if (!input || !clearBtn) return;
    clearBtn.hidden = !(input.value || "").trim();
  }

  function getDisplayProjects() {
    var WA = api();
    if (!WA || typeof WA.getFilteredProjects !== "function") return [];
    var list = WA.getFilteredProjects();
    if (!searchQuery) return list;
    return list.filter(function (p) {
      return (
        (p.projectName && p.projectName.indexOf(searchQuery) >= 0) ||
        (p.alarmPosition && p.alarmPosition.indexOf(searchQuery) >= 0) ||
        (p.alarmArea && p.alarmArea.indexOf(searchQuery) >= 0)
      );
    });
  }

  function updateStats(list) {
    var WA = api();
    var data = list || getDisplayProjects();
    var pending = 0;
    var reviewed = 0;
    var uav = 0;
    data.forEach(function (p) {
      if (p.workflowStatus === "未复核") pending += 1;
      if (p.workflowStatus === "已复核" || p.workflowStatus === "审核通过") reviewed += 1;
      if (WA && WA.isUavSourceAlert(p)) uav += 1;
    });
    var set = function (id, val) {
      var el = $(id);
      if (el) el.textContent = String(val);
    };
    set("stat-alert-total", data.length);
    set("stat-alert-pending", pending);
    set("stat-alert-reviewed", reviewed);
    set("stat-alert-uav", uav);
    var totalEl = $("table-total");
    if (totalEl) totalEl.textContent = String(data.length);
  }

  function renderCardActions(project) {
    var WA = api();
    if (!WA) return "";
    var btns = [];
    btns.push(
      '<button type="button" class="mp-project-action" data-action="alert-detail" data-id="' +
        esc(project.id) +
        '"><i class="fa-regular fa-eye"></i>详情</button>'
    );
    var isUav = WA.isUavSourceAlert(project);
    if (isUav) {
      return '<div class="mp-project-card__actions mp-alert-card__actions">' + btns.join("") + "</div>";
    }
    if (project.workflowStatus === "未复核") {
      btns.push(
        '<button type="button" class="mp-project-action" data-action="alert-review-manual" data-id="' +
          esc(project.id) +
          '"><i class="fa-regular fa-user-check"></i>人工复核</button>'
      );
    }
    return '<div class="mp-project-card__actions mp-alert-card__actions">' + btns.join("") + "</div>";
  }

  function renderCard(project, index) {
    var WA = api();
    var sourceText = WA ? WA.formatAlertSourceDisplay(project.source) : project.source || "—";
    var statusClass = WA ? WA.statusClass(project.workflowStatus) : "";
    return (
      '<article class="mp-project-card mp-alert-card" data-alert-index="' +
      index +
      '">' +
      '<div class="mp-project-card__head">' +
      '<span class="mp-project-card__id">#' +
      esc(project.id) +
      "</span>" +
      '<span class="mp-alert-source-tag">' +
      esc(sourceText) +
      "</span>" +
      '<span class="mp-alert-status-tag ' +
      esc(statusClass) +
      '">' +
      esc(project.workflowStatus || "—") +
      "</span></div>" +
      '<h3 class="mp-project-card__title">' +
      esc(project.projectName) +
      "</h3>" +
      '<dl class="mp-project-card__meta mp-alert-card__meta">' +
      "<div><dt>报警位置</dt><dd>" +
      esc(project.alarmPosition || "—") +
      "</dd></div>" +
      "<div><dt>报警区间</dt><dd>" +
      esc(project.alarmArea || "—") +
      "</dd></div>" +
      "<div><dt>开始时间</dt><dd>" +
      esc(project.startTime || "—") +
      "</dd></div>" +
      '<div class="mp-project-card__meta-full"><dt>最新时间</dt><dd>' +
      esc(project.latestTime || "—") +
      "</dd></div>" +
      "<div><dt>是否误报</dt><dd>" +
      esc(project.mistaken || "—") +
      "</dd></div>" +
      "</dl>" +
      (project.image
        ? '<div class="mp-alert-card__thumb"><img src="' +
          esc(project.image) +
          '" alt="" loading="lazy" /></div>'
        : "") +
      renderCardActions(project) +
      "</article>"
    );
  }

  function renderList() {
    var listEl = $("patrol-alerts-mobile-list");
    if (!listEl) return;
    lastRendered = getDisplayProjects();
    updateStats(lastRendered);
    if (!lastRendered.length) {
      listEl.innerHTML =
        '<div class="mp-project-empty"><i class="fa-solid fa-bell-slash"></i><p>暂无告警记录</p></div>';
      return;
    }
    listEl.innerHTML = lastRendered.map(renderCard).join("");
  }

  function showList() {
    var WA = api();
    if (WA && typeof WA.closeDetail === "function") WA.closeDetail();
    if (WA && typeof WA.destroyPatrolUavDetailMap === "function") WA.destroyPatrolUavDetailMap();
    var listView = $("patrol-alerts-list-view");
    var uavView = $("patrol-alerts-uav-detail-view");
    if (listView) listView.classList.remove("hidden");
    if (uavView) uavView.classList.add("hidden");
    currentDetailId = null;
    dispatchViewChange();
  }

  function showUavDetailPage(project) {
    var WA = api();
    if (!WA || !project) return;
    currentDetailId = project.id;
    var listView = $("patrol-alerts-list-view");
    var uavView = $("patrol-alerts-uav-detail-view");
    if (listView) listView.classList.add("hidden");
    if (uavView) uavView.classList.remove("hidden");
    var titleEl = $("detail-uav-alert-title");
    if (titleEl) titleEl.textContent = project.projectName || "告警详情";
    if (typeof WA.fillPatrolAlertsUavDetail === "function") {
      WA.fillPatrolAlertsUavDetail(project);
    }
    dispatchViewChange();
  }

  function showDetail(id) {
    var WA = api();
    if (!WA) return;
    var project = WA.findProject(id);
    if (!project) return;
    if (WA.isUavSourceAlert(project)) {
      showUavDetailPage(project);
      clearDeepLinkAlertId();
      return;
    }
    currentDetailId = id;
    if (typeof WA.openDetail === "function" && WA.openDetail(project)) {
      clearDeepLinkAlertId();
      return;
    }
    showToast("无法打开告警详情");
  }

  function applyFilters(silent) {
    var WA = api();
    if (WA && typeof WA.applyListFiltersFromForm === "function") {
      WA.applyListFiltersFromForm();
    }
    renderList();
    if (!silent) showToast("已按当前条件筛选");
  }

  function resetFilters() {
    var WA = api();
    if (WA && typeof WA.resetListFilterForm === "function") {
      WA.resetListFilterForm();
    }
    var sheet = $("patrol-alerts-filter-sheet");
    if (sheet && global.WHProjectMobile && global.WHProjectMobile.syncPickersFromForm) {
      global.WHProjectMobile.syncPickersFromForm(sheet);
    }
    applyFilters(true);
    showToast("筛选条件已重置");
  }

  function clearSearch() {
    searchQuery = "";
    var input = $("patrol-alerts-search-trigger");
    if (input) input.value = "";
    renderList();
    syncSearchClear();
  }

  function openSearchPage() {
    var q = prompt("搜索项目名称 / 报警位置 / 报警区间", searchQuery || "");
    if (q == null) return;
    searchQuery = String(q).trim();
    var input = $("patrol-alerts-search-trigger");
    if (input) input.value = searchQuery;
    renderList();
    syncSearchClear();
  }

  function handleActionClick(e) {
    var btn = e.target.closest("[data-action]");
    if (!btn) return;
    var action = btn.getAttribute("data-action");
    var WA = api();
    if (!WA) return;

    if (action === "open-patrol-alerts-filter") {
      e.preventDefault();
      if (global.WHProjectMobile && global.WHProjectMobile.enhanceSelectFields) {
        global.WHProjectMobile.enhanceSelectFields($("patrol-alerts-filter-sheet"));
      }
      setSheetOpen($("patrol-alerts-filter-sheet"), true);
      return;
    }
    if (action === "close-patrol-alerts-filter") {
      e.preventDefault();
      setSheetOpen($("patrol-alerts-filter-sheet"), false);
      return;
    }
    if (action === "search-patrol-alerts") {
      e.preventDefault();
      setSheetOpen($("patrol-alerts-filter-sheet"), false);
      applyFilters(false);
      return;
    }
    if (action === "reset-patrol-alerts-filter") {
      e.preventDefault();
      resetFilters();
      return;
    }
    if (action === "open-patrol-alerts-search") {
      e.preventDefault();
      openSearchPage();
      return;
    }
    if (action === "patrol-alerts-search-clear") {
      e.preventDefault();
      clearSearch();
      return;
    }

    var id = btn.getAttribute("data-id");
    if (!id) return;
    var project = WA.findProject(id);
    if (!project) return;

    if (action === "alert-detail") {
      e.preventDefault();
      e.stopPropagation();
      showDetail(id);
      return;
    }
    if (action === "alert-review-manual") {
      e.preventDefault();
      e.stopPropagation();
      WA.openManualReview(project);
      return;
    }
  }

  function bindEvents() {
    document.addEventListener("click", handleActionClick);
    document.addEventListener("keydown", function (e) {
      var wrap = e.target.closest("[data-action='open-patrol-alerts-search']");
      if (!wrap) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openSearchPage();
      }
    });
    document.addEventListener("wh-map-alerts-list-change", function () {
      renderList();
      if (currentDetailId != null) {
        var WA = api();
        var project = WA && WA.findProject(currentDetailId);
        if (!project || !WA) return;
        if (WA.isUavSourceAlert(project) && typeof WA.fillPatrolAlertsUavDetail === "function") {
          WA.fillPatrolAlertsUavDetail(project);
        } else if (typeof WA.fillDetail === "function") {
          WA.fillDetail(project);
        }
      }
    });
  }

  var pendingDeepLinkId = null;

  function peekDeepLinkAlertId() {
    if (pendingDeepLinkId != null) return pendingDeepLinkId;
    var WA = api();
    if (WA && typeof WA.readPatrolAlertsDeepLinkId === "function") {
      pendingDeepLinkId = WA.readPatrolAlertsDeepLinkId() || "";
      return pendingDeepLinkId;
    }
    return "";
  }

  function clearDeepLinkAlertId() {
    pendingDeepLinkId = null;
    var WA = api();
    if (WA && typeof WA.finishPatrolAlertsDeepLink === "function") {
      WA.finishPatrolAlertsDeepLink();
    } else if (WA && typeof WA.clearPatrolAlertsDeepLinkState === "function") {
      WA.clearPatrolAlertsDeepLinkState();
    }
  }

  function isDetailOpened() {
    var mask = $("wh-alert-detail-modal-mask");
    var uavView = $("patrol-alerts-uav-detail-view");
    return !!(
      (mask && mask.classList.contains("show")) ||
      (uavView && !uavView.classList.contains("hidden"))
    );
  }

  function tryOpenQueryDetail() {
    var id = peekDeepLinkAlertId();
    if (!id) return false;
    var WA = api();
    if (!WA || typeof WA.findProject !== "function") return false;
    var project = WA.findProject(id);
    if (!project) {
      showToast("未找到对应告警（ID " + id + "）");
      return false;
    }
    showDetail(id);
    if (isDetailOpened()) {
      clearDeepLinkAlertId();
      return true;
    }
    return false;
  }

  function scheduleDeepLinkOpen() {
    if (tryOpenQueryDetail()) return;
    [80, 200, 500].forEach(function (delay) {
      setTimeout(function () {
        tryOpenQueryDetail();
      }, delay);
    });
  }

  function boot() {
    if (!$("patrol-alerts-app")) return;
    bindEvents();
    applyFilters(true);
    syncSearchClear();
    scheduleDeepLinkOpen();
    global.WHMapAlertsMobile = {
      refresh: function () {
        applyFilters(true);
      },
      showList: showList,
      showDetail: showDetail,
    };
  }

  global.WHMapAlertsMobilePage = { boot: boot };
})(window);
