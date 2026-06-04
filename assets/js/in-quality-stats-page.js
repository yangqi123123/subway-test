/**
 * 统计分析 — Web / 移动端共用逻辑（对齐 wb/in-quality-stats.html）
 */
(function (global) {
  "use strict";

  function bootInQualityStatsPage(options) {
    options = options || {};
    var isMobile = !!options.mobile;
    var allRows = (global.WH_QUALITY_STATS_ROWS || []).map(function (row) {
      return Object.assign({}, row);
    });
    var summary = global.WH_QUALITY_STATS_SUMMARY || {};

    var filteredRows = null;

    var mobileList = document.getElementById("quality-mobile-list");
    var tableBody = document.getElementById("quality-table-body");
    var toastEl = document.getElementById("quality-toast");

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

    function fieldVal(id) {
      var el = document.getElementById(id);
      return el ? String(el.value || "").trim() : "";
    }

    function getListSource() {
      return filteredRows !== null ? filteredRows : allRows;
    }

    function setStatText(id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = String(val);
    }

    function initSummaryStats() {
      setStatText("stat-key-today", summary.keyToday || "0");
      setStatText("stat-normal-today", summary.normalToday || "0");
      setStatText("stat-key-week", summary.keyWeek || "0");
      setStatText("stat-key-month", summary.keyMonth || "0");
    }

    function typeBadgeClass(type) {
      return type === "重点项目" ? "mp-quality-type mp-quality-type--key" : "mp-quality-type mp-quality-type--general";
    }

    function readFiltersFromForm() {
      return {
        line: fieldVal("filter-line"),
        type: fieldVal("filter-type"),
      };
    }

    function rowMatchesSearch(row, query) {
      var q = (query || "").trim();
      if (!q) return true;
      return row.name.indexOf(q) >= 0 || String(row.seq).indexOf(q) >= 0 || row.line.indexOf(q) >= 0;
    }

    function syncQualitySearchClear() {
      var input = document.getElementById("quality-search-trigger");
      var clearBtn = document.getElementById("quality-search-clear");
      if (!input || !clearBtn) return;
      clearBtn.hidden = !(input.value || "").trim();
    }

    function clearQualitySearch() {
      var searchInput = document.getElementById("quality-search-trigger");
      if (searchInput) searchInput.value = "";
      applyFilter(undefined, true);
    }

    function refreshQualityFilterPickers() {
      if (global.WHProjectMobile && global.WHProjectMobile.enhanceSelectFields) {
        var sheet = document.getElementById("quality-filter-sheet");
        if (sheet) global.WHProjectMobile.enhanceSelectFields(sheet);
      }
    }

    function applyFilter(qOverride, silent) {
      var searchInput = document.getElementById("quality-search-trigger");
      var q =
        typeof qOverride === "string"
          ? qOverride
          : searchInput && searchInput.value
            ? searchInput.value.trim()
            : "";
      if (searchInput && typeof qOverride === "string") searchInput.value = qOverride;
      var f = readFiltersFromForm();
      var hasFilter = !!(q || f.line || f.type);
      filteredRows = hasFilter
        ? allRows.filter(function (row) {
            if (q && !rowMatchesSearch(row, q)) return false;
            if (f.line && row.line !== f.line) return false;
            if (f.type && row.type !== f.type) return false;
            return true;
          })
        : null;
      renderList();
      syncQualitySearchClear();
      if (!silent) showToast("已按当前条件筛选");
    }

    function resetFilters() {
      ["filter-line", "filter-type"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.selectedIndex = 0;
      });
      var filterSheet = document.getElementById("quality-filter-sheet");
      if (filterSheet && global.WHProjectMobile && global.WHProjectMobile.syncPickersFromForm) {
        global.WHProjectMobile.syncPickersFromForm(filterSheet);
      }
      applyFilter(undefined, true);
      showToast("筛选条件已重置");
    }

    function renderMobileCard(row) {
      return (
        '<article class="mp-project-card mp-quality-card" data-row-id="' +
        row.id +
        '">' +
        '<div class="mp-project-card__head"><span class="mp-project-card__id">#' +
        esc(row.seq) +
        "</span>" +
        '<span class="' +
        typeBadgeClass(row.type) +
        '">' +
        esc(row.type) +
        "</span></div>" +
        '<h3 class="mp-project-card__title">' +
        esc(row.name) +
        "</h3>" +
        '<dl class="mp-project-card__meta mp-quality-card__meta">' +
        "<div><dt>所属线路</dt><dd>" +
        esc(row.line) +
        "</dd></div>" +
        "<div><dt>本日巡查</dt><dd>" +
        esc(row.today) +
        " 次</dd></div>" +
        "<div><dt>本周巡查</dt><dd>" +
        esc(row.thisWeek) +
        " 次</dd></div>" +
        "<div><dt>本月巡查</dt><dd>" +
        esc(row.thisMonth) +
        " 次</dd></div>" +
        "<div><dt>昨日巡查</dt><dd>" +
        esc(row.yesterday) +
        " 次</dd></div>" +
        "<div><dt>上周巡查</dt><dd>" +
        esc(row.lastWeek) +
        " 次</dd></div>" +
        "<div><dt>上月巡查</dt><dd>" +
        esc(row.lastMonth) +
        " 次</dd></div>" +
        "</dl></article>"
      );
    }

    function renderMobileList(rows) {
      if (!mobileList) return;
      if (!rows.length) {
        mobileList.innerHTML =
          '<div class="mp-project-empty"><i class="fa-solid fa-chart-line"></i><p>暂无统计分析数据</p></div>';
        return;
      }
      mobileList.innerHTML = rows.map(renderMobileCard).join("");
    }

    function renderTable(rows) {
      if (!tableBody) return;
      tableBody.innerHTML = rows
        .map(function (row, index) {
          return (
            '<tr class="' +
            (index % 2 ? "bg-slate-950/8" : "bg-slate-950/18") +
            '">' +
            "<td class=\"px-4\">" +
            esc(row.seq) +
            "</td><td class=\"px-4\">" +
            esc(row.line) +
            "</td><td class=\"px-4\">" +
            esc(row.name) +
            "</td><td class=\"px-4\">" +
            esc(row.type) +
            "</td><td class=\"px-4\">" +
            esc(row.yesterday) +
            "</td><td class=\"px-4\">" +
            esc(row.lastWeek) +
            "</td><td class=\"px-4\">" +
            esc(row.lastMonth) +
            "</td><td class=\"px-4\">" +
            esc(row.today) +
            "</td><td class=\"px-4\">" +
            esc(row.thisWeek) +
            "</td><td class=\"px-4\">" +
            esc(row.thisMonth) +
            "</td></tr>"
          );
        })
        .join("");
    }

    function renderList() {
      var rows = getListSource();
      if (isMobile) renderMobileList(rows);
      else renderTable(rows);
    }

    function bindEvents() {
      var searchPage = "quality-search.html";

      document.addEventListener("click", function (event) {
        var trigger = event.target.closest("[data-action]");
        if (!trigger) return;
        var action = trigger.getAttribute("data-action");
        if (action === "open-quality-search") {
          event.preventDefault();
          global.location.href = searchPage;
          return;
        }
        if (action === "open-quality-filter") {
          var sheet = document.getElementById("quality-filter-sheet");
          if (sheet) {
            sheet.classList.add("is-open");
            refreshQualityFilterPickers();
          }
          return;
        }
        if (action === "close-quality-filter") {
          var closeSheet = document.getElementById("quality-filter-sheet");
          if (closeSheet) closeSheet.classList.remove("is-open");
          return;
        }
        if (action === "search-quality") {
          var searchSheet = document.getElementById("quality-filter-sheet");
          if (searchSheet) searchSheet.classList.remove("is-open");
          applyFilter();
          return;
        }
        if (action === "reset-quality-filter") {
          var resetSheet = document.getElementById("quality-filter-sheet");
          if (resetSheet) resetSheet.classList.remove("is-open");
          resetFilters();
          return;
        }
      });

      var searchClear = document.getElementById("quality-search-clear");
      if (searchClear) {
        searchClear.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          clearQualitySearch();
        });
      }

      var searchWrap = document.querySelector(".mp-search-input-wrap[data-action='open-quality-search']");
      if (searchWrap) {
        searchWrap.addEventListener("click", function (e) {
          if (e.target.closest("#quality-search-clear")) return;
        });
      }

      var btnSearch = document.getElementById("btn-search");
      if (btnSearch) btnSearch.addEventListener("click", function () { applyFilter(); });
      var btnReset = document.getElementById("btn-reset");
      if (btnReset) btnReset.addEventListener("click", resetFilters);
    }

    if (isMobile && global.WHProjectMobile && global.WHProjectMobile.init) {
      try {
        global.WHProjectMobile.init({
          clearListSearch: clearQualitySearch,
          showToast: showToast,
        });
      } catch (initErr) {
        console.warn("[WHInQualityStatsPage] mobile init", initErr);
      }
      refreshQualityFilterPickers();
      syncQualitySearchClear();
    }

    initSummaryStats();
    renderList();
    bindEvents();

    (function handleQueryOpen() {
      try {
        var params = new URLSearchParams(global.location.search);
        var q = params.get("q");
        if (q) {
          applyFilter(q, true);
          try {
            global.history.replaceState({ fromQualitySearch: true }, "", "quality.html");
          } catch (e) {
            /* ignore */
          }
        }
      } catch (e) {
        /* ignore */
      }
    })();

    return { renderList: renderList, applyFilter: applyFilter };
  }

  global.WHInQualityStatsPage = { boot: bootInQualityStatsPage };
})(typeof window !== "undefined" ? window : global);
