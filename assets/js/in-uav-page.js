/**
 * 无人机巡查记录 — 移动端（只读列表 + 详情 + 查看报告）
 */
(function (global) {
  "use strict";

  function bootUavPage(options) {
    options = options || {};
    var isMobile = !!options.mobile;
    if (!isMobile) return;

    var rows = (global.WH_UAV_ROWS || []).slice();
    var filteredRows = null;
    var lastRenderedList = [];

    var listView = document.getElementById("uav-list-view");
    var detailView = document.getElementById("uav-detail-view");
    var mobileList = document.getElementById("uav-mobile-list");
    var detailBody = document.getElementById("uav-detail-body");
    var toastEl = document.getElementById("uav-toast");

    function $(id) {
      return document.getElementById(id);
    }

    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function showToast(msg) {
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.classList.add("show");
      clearTimeout(showToast._t);
      showToast._t = setTimeout(function () {
        toastEl.classList.remove("show");
      }, 1800);
    }

    function getListSource() {
      return filteredRows !== null ? filteredRows : rows;
    }

    function parseDateTime(value) {
      var normalized = String(value || "").trim().replace(" ", "T");
      var time = Date.parse(normalized);
      return Number.isNaN(time) ? null : time;
    }

    function fieldVal(id) {
      var el = $(id);
      return el ? String(el.value || "").trim() : "";
    }

    function updateStats(list) {
      var monthKey = "2025-12";
      $("stat-total").textContent = String(rows.length);
      $("stat-month").textContent = String(
        rows.filter(function (r) {
          return r.takeoff && String(r.takeoff).indexOf(monthKey) === 0;
        }).length
      );
      $("stat-alarm").textContent = String(
        rows.filter(function (r) {
          return (r.alarmCount || 0) > 0;
        }).length
      );
      $("stat-normal").textContent = String(
        rows.filter(function (r) {
          return (r.alarmCount || 0) === 0;
        }).length
      );
      var totalEl = $("table-total");
      if (totalEl) totalEl.textContent = String((list || getListSource()).length);
    }

    function rowMatchesSearch(row, q) {
      if (!q) return true;
      return String(row.taskId).indexOf(q) >= 0;
    }

    function readFilters() {
      return {
        line: fieldVal("filter-line"),
        section: fieldVal("filter-section"),
        project: fieldVal("filter-project"),
        dateStart: fieldVal("filter-date-start"),
        dateEnd: fieldVal("filter-date-end"),
      };
    }

    function rowMatchesFilters(row, f) {
      if (f.line && row.line !== f.line) return false;
      if (f.section && row.section !== f.section) return false;
      if (f.project && row.projectName !== f.project) return false;
      var rowTime = parseDateTime(row.takeoff);
      if (rowTime !== null) {
        var start = f.dateStart ? parseDateTime(f.dateStart) : null;
        var end = f.dateEnd ? parseDateTime(f.dateEnd) : null;
        if (start !== null && rowTime < start) return false;
        if (end !== null && rowTime > end) return false;
      }
      return true;
    }

    function syncSearchClear() {
      var input = $("uav-search-trigger");
      var clearBtn = $("uav-search-clear");
      if (!input || !clearBtn) return;
      clearBtn.hidden = !(input.value || "").trim();
    }

    function clearSearch() {
      var input = $("uav-search-trigger");
      if (input) input.value = "";
      applyFilter(undefined, true);
    }

    function applyFilter(qOverride, silent) {
      var input = $("uav-search-trigger");
      var q =
        typeof qOverride === "string" ? qOverride : input && input.value ? input.value.trim() : "";
      if (input && typeof qOverride === "string") input.value = qOverride;
      var f = readFilters();
      var hasFilter = !!(q || f.line || f.section || f.project || f.dateStart || f.dateEnd);
      filteredRows = hasFilter
        ? rows.filter(function (row) {
            if (q && !rowMatchesSearch(row, q)) return false;
            if (!rowMatchesFilters(row, f)) return false;
            return true;
          })
        : null;
      renderList();
      syncSearchClear();
      if (!silent) showToast("已按当前条件筛选");
    }

    function resetFilters() {
      ["filter-line", "filter-section", "filter-project", "filter-date-start", "filter-date-end"].forEach(
        function (id) {
          var el = $(id);
          if (!el) return;
          if (el.tagName === "SELECT") el.selectedIndex = 0;
          else el.value = "";
        }
      );
      var sheet = $("uav-filter-sheet");
      if (sheet && global.WHProjectMobile && global.WHProjectMobile.syncPickersFromForm) {
        global.WHProjectMobile.syncPickersFromForm(sheet);
      }
      applyFilter(undefined, true);
      showToast("筛选条件已重置");
    }

    function mediaCell(kind, row, count, direct) {
      if (!global.WHPatrolMediaGallery) return '<span class="mp-disease-media-empty">—</span>';
      if (direct && global.WHPatrolMediaGallery.renderDetailGrid) {
        return global.WHPatrolMediaGallery.renderDetailGrid({
          kind: kind,
          projectName: row.projectName,
          projectNames: row.projectNames,
        });
      }
      return global.WHPatrolMediaGallery.renderCell({
        kind: kind,
        projectName: row.projectName,
        projectNames: row.projectNames,
        rowKey: row.taskId,
        previewCount: count || 2,
        directPreview: !!direct,
      });
    }

    function alarmClass(count) {
      return (count || 0) > 0
        ? "mp-disease-progress mp-disease-progress--reject"
        : "mp-disease-progress mp-disease-progress--done";
    }

    function renderCard(row, index) {
      return (
        '<article class="mp-project-card mp-disease-card" data-row-index="' +
        index +
        '">' +
        '<div class="mp-project-card__head"><span class="mp-project-card__id">' +
        esc(row.taskId) +
        "</span>" +
        '<span class="' +
        alarmClass(row.alarmCount) +
        '">' +
        ((row.alarmCount || 0) > 0 ? "报警 " + row.alarmCount : "正常") +
        "</span></div>" +
        '<h3 class="mp-project-card__title">' +
        esc(row.projectName) +
        "</h3>" +
        '<dl class="mp-project-card__meta mp-uav-card__meta">' +
        "<div><dt>所属线路</dt><dd>" +
        esc(row.line) +
        "</dd></div>" +
        "<div><dt>巡查区间</dt><dd>" +
        esc(row.section) +
        "</dd></div>" +
        "<div><dt>设备名称</dt><dd>" +
        esc(row.deviceName) +
        "</dd></div>" +
        "<div><dt>任务类型</dt><dd>" +
        esc(row.taskType) +
        "</dd></div>" +
        '<div class="mp-project-card__meta-full mp-project-card__meta-nowrap"><dt>起飞时间</dt><dd>' +
        esc(row.takeoff) +
        "</dd></div>" +
        '<div class="mp-project-card__meta-full mp-project-card__meta-nowrap"><dt>降落时间</dt><dd>' +
        esc(row.landing) +
        "</dd></div>" +
        "</dl>" +
        '<div class="mp-project-card__actions mp-uav-card__actions">' +
        '<button type="button" class="mp-project-action" data-action="uav-detail" data-index="' +
        index +
        '"><i class="fa-regular fa-eye"></i>详情</button>' +
        '<button type="button" class="mp-project-action" data-action="uav-report" data-index="' +
        index +
        '"><i class="fa-regular fa-file-lines"></i>查看报告</button>' +
        '<button type="button" class="mp-project-action" data-action="uav-download" data-index="' +
        index +
        '"><i class="fa-regular fa-file-arrow-down"></i>下载报告</button>' +
        "</div></article>"
      );
    }

    function buildDetailHtml(row) {
      return (
        '<dl class="mp-disease-detail-grid">' +
        "<div><dt>飞行任务ID</dt><dd>" +
        esc(row.taskId) +
        "</dd></div>" +
        "<div><dt>所属线路</dt><dd>" +
        esc(row.line) +
        "</dd></div>" +
        "<div><dt>巡查区间范围</dt><dd>" +
        esc(row.section) +
        "</dd></div>" +
        "<div><dt>巡查项目名称</dt><dd>" +
        esc(row.projectName) +
        "</dd></div>" +
        "<div><dt>设备名称</dt><dd>" +
        esc(row.deviceName) +
        "</dd></div>" +
        "<div><dt>任务类型</dt><dd>" +
        esc(row.taskType) +
        "</dd></div>" +
        '<div class="mp-disease-detail-grid__full"><dt>巡查照片</dt><dd>' +
        mediaCell("photo", row, 3, true) +
        "</dd></div>" +
        '<div class="mp-disease-detail-grid__full"><dt>巡查视频</dt><dd>' +
        mediaCell("video", row, 2, true) +
        "</dd></div>" +
        "<div><dt>关联计划</dt><dd>" +
        esc(row.planName) +
        "</dd></div>" +
        "<div><dt>起飞时间</dt><dd>" +
        esc(row.takeoff) +
        "</dd></div>" +
        "<div><dt>降落时间</dt><dd>" +
        esc(row.landing) +
        "</dd></div>" +
        "<div><dt>操作员姓名</dt><dd>" +
        esc(row.operator) +
        "</dd></div>" +
        "<div><dt>报警数量</dt><dd>" +
        esc(row.alarmCount) +
        "</dd></div></dl>"
      );
    }

    function renderList() {
      var list = getListSource();
      lastRenderedList = list.slice();
      if (!mobileList) return;
      if (!list.length) {
        mobileList.innerHTML =
          '<div class="mp-project-empty"><i class="fa-solid fa-helicopter"></i><p>暂无无人机巡查记录</p></div>';
        updateStats(list);
        return;
      }
      mobileList.innerHTML = list.map(renderCard).join("");
      updateStats(list);
    }

    function openDetail(index) {
      var row = lastRenderedList[index];
      if (!row) return;
      var titleEl = $("detail-uav-title");
      if (titleEl) titleEl.textContent = row.taskId + " · 无人机巡查详情";
      if (listView) listView.classList.add("hidden");
      if (detailView) detailView.classList.remove("hidden");
      if (detailBody) {
        detailBody.innerHTML = buildDetailHtml(row);
        if (global.WHPatrolMediaGallery) global.WHPatrolMediaGallery.bind(detailBody);
      }
      global.dispatchEvent(new Event("wh-uav-view-change"));
    }

    function showList() {
      if (detailView) detailView.classList.add("hidden");
      if (listView) listView.classList.remove("hidden");
      global.dispatchEvent(new Event("wh-uav-view-change"));
    }

    function showReport(index) {
      var row = lastRenderedList[index];
      if (!row) return;
      if (global.WHUavPatrolReport && global.WHUavPatrolReport.showReport) {
        global.WHUavPatrolReport.showReport(row.taskId, rows, { patrolMobile: true });
        return;
      }
      showToast("暂无飞行报告数据");
    }

    function downloadReport(index) {
      var row = lastRenderedList[index];
      if (!row) return;
      if (global.WHUavPatrolReport && global.WHUavPatrolReport.downloadReport) {
        global.WHUavPatrolReport.downloadReport(row.taskId);
        return;
      }
      showToast("暂无飞行报告数据");
    }

    function bindEvents() {
      document.addEventListener("click", function (event) {
        var trigger = event.target.closest("[data-action]");
        if (!trigger) return;
        var action = trigger.getAttribute("data-action");
        var index = trigger.hasAttribute("data-index") ? Number(trigger.getAttribute("data-index")) : null;

        if (action === "open-uav-search") {
          event.preventDefault();
          global.location.href = "uav-search.html";
          return;
        }
        if (action === "uav-detail") {
          openDetail(index);
          return;
        }
        if (action === "uav-report") {
          showReport(index);
          return;
        }
        if (action === "uav-download") {
          downloadReport(index);
          return;
        }
        if (action === "open-uav-filter") {
          var sheet = $("uav-filter-sheet");
          if (sheet) {
            sheet.classList.add("is-open");
            if (global.WHProjectMobile) global.WHProjectMobile.enhanceSelectFields(sheet);
          }
          return;
        }
        if (action === "close-uav-filter") {
          var closeSheet = $("uav-filter-sheet");
          if (closeSheet) closeSheet.classList.remove("is-open");
          return;
        }
        if (action === "search-uav") {
          applyFilter();
          var s = $("uav-filter-sheet");
          if (s) s.classList.remove("is-open");
          return;
        }
        if (action === "reset-uav-filter") {
          resetFilters();
          var sh = $("uav-filter-sheet");
          if (sh) sh.classList.remove("is-open");
        }
      });

      var clearBtn = $("uav-search-clear");
      if (clearBtn) clearBtn.addEventListener("click", clearSearch);
    }

    if (global.WHProjectMobile && global.WHProjectMobile.init) {
      global.WHProjectMobile.init({ clearListSearch: clearSearch, showToast: showToast });
    }

    var filterSheet = $("uav-filter-sheet");
    if (filterSheet && global.WHProjectMobile) {
      global.WHProjectMobile.enhanceSelectFields(filterSheet);
    }

    bindEvents();
    renderList();
    syncSearchClear();

    try {
      var params = new URLSearchParams(global.location.search);
      var q = params.get("q");
      if (q) {
        applyFilter(q, true);
        global.history.replaceState({ fromUavSearch: true }, "", "uav.html");
      }
    } catch (e) {
      /* ignore */
    }

    global.WHInUavPage.showList = showList;
    global.WHInUavPage.openDetail = openDetail;
    return { showList: showList, openDetail: openDetail, renderList: renderList };
  }

  global.WHInUavPage = { boot: bootUavPage, showList: null, openDetail: null };
})(typeof window !== "undefined" ? window : global);
