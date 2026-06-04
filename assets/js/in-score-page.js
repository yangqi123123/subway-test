/**
 * 巡查打分 — Web / 移动端共用逻辑（对齐 wb/in-score.html）
 */
(function (global) {
  "use strict";

  function bootInScorePage(options) {
    options = options || {};
    var isMobile = !!options.mobile;
    var allRows = (global.WH_SCORE_LIST_ROWS || []).map(function (row) {
      return Object.assign({}, row);
    });
    var detailMap = global.WH_SCORE_DETAIL_MAP || {};
    var defaultStart = global.WH_SCORE_DEFAULT_DATE_START || "";
    var defaultEnd = global.WH_SCORE_DEFAULT_DATE_END || "";

    var filteredRows = null;
    var currentRow = null;

    var listView = document.getElementById("score-list-view");
    var detailView = document.getElementById("score-detail-view");
    var tableBody = document.getElementById("score-table-body");
    var mobileList = document.getElementById("score-mobile-list");
    var detailList = document.getElementById("score-detail-list");
    var detailSummary = document.getElementById("score-detail-summary");
    var toastEl = document.getElementById("score-toast");
    var modalMask = document.getElementById("score-modal-mask");
    var detailBody = document.getElementById("score-detail-body");

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

    function parseDateTime(value) {
      var normalized = String(value || "").trim().replace(" ", "T");
      var time = Date.parse(normalized);
      return Number.isNaN(time) ? null : time;
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

    function updateScoreStats(rows) {
      var data = rows || getListSource();
      var people = {};
      var sum = 0;
      var low = 0;
      data.forEach(function (row) {
        people[row.user] = true;
        sum += Number(row.minScore) || 0;
        if (Number(row.minScore) < 60) low += 1;
      });
      setStatText("stat-total", data.length);
      setStatText("stat-people", Object.keys(people).length);
      setStatText("stat-avg", data.length ? (sum / data.length).toFixed(1) : "0");
      setStatText("stat-low", low);
      setStatText("table-total", data.length);
    }

    function scoreBadgeClass(minScore) {
      return Number(minScore) < 60 ? "mp-score-badge mp-score-badge--low" : "mp-score-badge mp-score-badge--ok";
    }

    function readFiltersFromForm() {
      return {
        user: fieldVal("filter-user"),
        dateStart: fieldVal("filter-date-start"),
        dateEnd: fieldVal("filter-date-end"),
      };
    }

    function rowMatchesSearch(row, query) {
      var q = (query || "").trim().toLowerCase();
      if (!q) return true;
      return (
        String(row.account || "").toLowerCase().indexOf(q) >= 0 ||
        String(row.user || "").toLowerCase().indexOf(q) >= 0 ||
        String(row.line || "").toLowerCase().indexOf(q) >= 0 ||
        String(row.device || "").toLowerCase().indexOf(q) >= 0
      );
    }

    function rowMatchesDateRange(row, dateStart, dateEnd) {
      var rowTime = parseDateTime(row.date);
      if (rowTime === null) return true;
      var start = dateStart ? parseDateTime(dateStart) : null;
      var end = dateEnd ? parseDateTime(dateEnd) : null;
      if (start !== null && rowTime < start) return false;
      if (end !== null && rowTime > end) return false;
      return true;
    }

    function syncScoreSearchClear() {
      var input = document.getElementById("score-search-trigger");
      var clearBtn = document.getElementById("score-search-clear");
      if (!input || !clearBtn) return;
      clearBtn.hidden = !(input.value || "").trim();
    }

    function clearScoreSearch() {
      var searchInput = document.getElementById("score-search-trigger");
      if (searchInput) searchInput.value = "";
      applyFilter(undefined, true);
    }

    function applyFilter(qOverride, silent) {
      var searchInput = document.getElementById("score-search-trigger");
      var q =
        typeof qOverride === "string"
          ? qOverride
          : searchInput && searchInput.value
            ? searchInput.value.trim()
            : "";
      if (searchInput && typeof qOverride === "string") searchInput.value = qOverride;
      var f = readFiltersFromForm();
      var hasFilter = !!(q || f.user || f.dateStart || f.dateEnd);
      filteredRows = hasFilter
        ? allRows.filter(function (row) {
            if (q && !rowMatchesSearch(row, q)) return false;
            if (f.user && String(row.user || "").indexOf(f.user) < 0) return false;
            if (!rowMatchesDateRange(row, f.dateStart, f.dateEnd)) return false;
            return true;
          })
        : null;
      renderList();
      syncScoreSearchClear();
      if (!silent) showToast("已按当前条件筛选");
    }

    function resetFilters() {
      var userEl = document.getElementById("filter-user");
      var startEl = document.getElementById("filter-date-start");
      var endEl = document.getElementById("filter-date-end");
      if (userEl) userEl.value = "";
      if (startEl) startEl.value = defaultStart;
      if (endEl) endEl.value = defaultEnd;
      applyFilter(undefined, true);
      showToast("筛选条件已重置");
    }

    function renderMobileCard(row) {
      return (
        '<article class="mp-project-card" data-row-id="' +
        row.id +
        '">' +
        '<div class="mp-project-card__head"><span class="mp-project-card__id">' +
        esc(row.device) +
        "</span>" +
        '<span class="' +
        scoreBadgeClass(row.minScore) +
        '">最低 ' +
        esc(row.minScore) +
        " 分</span></div>" +
        '<h3 class="mp-project-card__title">' +
        esc(row.user) +
        "</h3>" +
        '<dl class="mp-project-card__meta">' +
        "<div><dt>账号</dt><dd>" +
        esc(row.account) +
        "</dd></div>" +
        "<div><dt>负责线路</dt><dd>" +
        esc(row.line) +
        "</dd></div>" +
        "<div><dt>巡查日期</dt><dd>" +
        esc(row.date) +
        "</dd></div>" +
        "</dl>" +
        '<div class="mp-project-card__actions">' +
        '<button type="button" class="mp-project-action" data-action="score-detail" data-id="' +
        row.id +
        '"><i class="fa-regular fa-eye"></i>详情</button>' +
        "</div></article>"
      );
    }

    function renderMobileList(rows) {
      if (!mobileList) return;
      if (!rows.length) {
        mobileList.innerHTML =
          '<div class="mp-project-empty"><i class="fa-solid fa-star-half-stroke"></i><p>暂无巡查打分数据</p></div>';
        updateScoreStats(rows);
        return;
      }
      mobileList.innerHTML = rows.map(renderMobileCard).join("");
      updateScoreStats(rows);
    }

    function renderTable(rows) {
      if (!tableBody) return;
      tableBody.innerHTML = rows
        .map(function (row, index) {
          return (
            '<tr class="' +
            (index % 2 ? "bg-slate-950/10" : "bg-slate-950/22") +
            '">' +
            "<td class=\"px-4\">" +
            esc(row.account) +
            "</td><td class=\"px-4\">" +
            esc(row.user) +
            "</td><td class=\"px-4\">" +
            esc(row.line) +
            "</td><td class=\"px-4\">" +
            esc(row.device) +
            "</td><td class=\"px-4\">" +
            esc(row.date) +
            "</td><td class=\"px-4\">" +
            esc(row.minScore) +
            '</td><td class="px-4 disease-col-actions"><div class="disease-op-actions"><span class="score-action-link" data-action="open-detail" data-id="' +
            row.id +
            '">详情</span></div></td></tr>'
          );
        })
        .join("");
      updateScoreStats(rows);
    }

    function renderList() {
      var rows = getListSource();
      if (isMobile) renderMobileList(rows);
      else renderTable(rows);
    }

    function getDetailRows(row) {
      var rows = detailMap[row.device] || [];
      var rowDate = String(row.date || "").slice(0, 10);
      return rows.filter(function (item) {
        return String(item.date || "").slice(0, 10) === rowDate;
      });
    }

    function renderDetailSectionCards(rows) {
      if (!detailList) return;
      if (!rows.length) {
        detailList.innerHTML =
          '<div class="mp-project-empty"><i class="fa-solid fa-clipboard-list"></i><p>暂无区间评分明细</p></div>';
        return;
      }
      detailList.innerHTML = rows
        .map(function (item, index) {
          return (
            '<article class="mp-score-detail-card' +
            (Number(item.score) < 60 ? " mp-score-detail-card--low" : "") +
            '">' +
            '<div class="mp-score-detail-card__head">' +
            '<span class="mp-score-detail-card__index">' +
            (index + 1) +
            "</span>" +
            '<h3 class="mp-score-detail-card__title">' +
            esc(item.section) +
            "</h3>" +
            '<span class="' +
            scoreBadgeClass(item.score) +
            '">' +
            esc(item.score) +
            " 分</span></div>" +
            '<dl class="mp-score-detail-card__meta">' +
            "<div><dt>设备号</dt><dd>" +
            esc(item.device) +
            "</dd></div>" +
            "<div><dt>巡查人员</dt><dd>" +
            esc(item.user) +
            "</dd></div>" +
            "<div><dt>所属线路</dt><dd>" +
            esc(item.line) +
            "</dd></div>" +
            "<div><dt>线内时长</dt><dd>" +
            esc(item.inside) +
            " 分钟</dd></div>" +
            "<div><dt>线外时长</dt><dd>" +
            esc(item.outside) +
            " 分钟</dd></div>" +
            "<div><dt>巡查日期</dt><dd>" +
            esc(item.date) +
            "</dd></div>" +
            "</dl></article>"
          );
        })
        .join("");
    }

    function renderDetailSummary(row) {
      if (!detailSummary) return;
      detailSummary.innerHTML =
        '<dl class="mp-score-summary-grid">' +
        "<div><dt>巡查人员</dt><dd>" +
        esc(row.user) +
        "</dd></div>" +
        "<div><dt>账号</dt><dd>" +
        esc(row.account) +
        "</dd></div>" +
        "<div><dt>负责线路</dt><dd>" +
        esc(row.line) +
        "</dd></div>" +
        "<div><dt>设备号</dt><dd>" +
        esc(row.device) +
        "</dd></div>" +
        "<div><dt>巡查日期</dt><dd>" +
        esc(row.date) +
        "</dd></div>" +
        "<div><dt>最低分数</dt><dd><span class=\"" +
        scoreBadgeClass(row.minScore) +
        "\">" +
        esc(row.minScore) +
        " 分</span></dd></div>" +
        "</dl>";
    }

    function renderWebDetailTable(rows) {
      if (!detailBody) return;
      detailBody.innerHTML = rows
        .map(function (row, index) {
          return (
            '<tr class="' +
            (index % 2 ? "bg-slate-950/10" : "bg-slate-950/22") +
            '">' +
            "<td class=\"px-4\">" +
            esc(row.device) +
            "</td><td class=\"px-4\">" +
            esc(row.user) +
            "</td><td class=\"px-4\">" +
            esc(row.section) +
            "</td><td class=\"px-4\">" +
            esc(row.line) +
            "</td><td class=\"px-4\">" +
            esc(row.inside) +
            "</td><td class=\"px-4\">" +
            esc(row.outside) +
            "</td><td class=\"px-4\">" +
            esc(row.date) +
            "</td><td class=\"px-4\">" +
            esc(row.score) +
            "</td></tr>"
          );
        })
        .join("");
    }

    function openDetail(id) {
      var row = allRows.filter(function (item) {
        return item.id === id;
      })[0];
      if (!row) return;
      currentRow = row;
      var detailRows = getDetailRows(row);
      var navName = document.getElementById("detail-score-title");
      if (navName) navName.textContent = row.user || "巡查详情";

      if (isMobile) {
        if (listView) listView.classList.add("hidden");
        if (detailView) detailView.classList.remove("hidden");
        renderDetailSummary(row);
        renderDetailSectionCards(detailRows);
      } else {
        renderWebDetailTable(detailRows);
        if (modalMask) modalMask.classList.add("show");
      }
      global.dispatchEvent(new Event("wh-score-view-change"));
    }

    function showList() {
      currentRow = null;
      if (detailView) detailView.classList.add("hidden");
      if (listView) listView.classList.remove("hidden");
      if (modalMask) modalMask.classList.remove("show");
      global.dispatchEvent(new Event("wh-score-view-change"));
    }

    function closeWebDetail() {
      if (modalMask) modalMask.classList.remove("show");
    }

    function findRowById(id) {
      return allRows.filter(function (item) {
        return item.id === id;
      })[0];
    }

    function bindEvents() {
      var searchPage = "score-search.html";

      document.addEventListener("click", function (event) {
        var trigger = event.target.closest("[data-action]");
        if (!trigger) return;
        var action = trigger.getAttribute("data-action");
        if (action === "open-score-search") {
          event.preventDefault();
          global.location.href = searchPage;
          return;
        }
        if (action === "score-detail" || action === "open-detail") {
          openDetail(Number(trigger.getAttribute("data-id")));
          return;
        }
        if (action === "back-score-list" || action === "close-detail") {
          if (isMobile) showList();
          else closeWebDetail();
          return;
        }
        if (action === "open-score-filter") {
          var sheet = document.getElementById("score-filter-sheet");
          if (sheet) sheet.classList.add("is-open");
          return;
        }
        if (action === "close-score-filter") {
          var closeSheet = document.getElementById("score-filter-sheet");
          if (closeSheet) closeSheet.classList.remove("is-open");
          return;
        }
        if (action === "search-score") {
          var searchSheet = document.getElementById("score-filter-sheet");
          if (searchSheet) searchSheet.classList.remove("is-open");
          applyFilter();
          return;
        }
        if (action === "reset-score-filter") {
          var resetSheet = document.getElementById("score-filter-sheet");
          if (resetSheet) resetSheet.classList.remove("is-open");
          resetFilters();
        }
      });

      if (mobileList) {
        mobileList.addEventListener("click", function (event) {
          if (event.target.closest("[data-action]")) return;
          var card = event.target.closest(".mp-project-card[data-row-id]");
          if (!card) return;
          openDetail(Number(card.getAttribute("data-row-id")));
        });
      }

      var searchClear = document.getElementById("score-search-clear");
      if (searchClear) {
        searchClear.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          clearScoreSearch();
        });
      }

      var searchWrap = document.querySelector(".mp-search-input-wrap[data-action='open-score-search']");
      if (searchWrap) {
        searchWrap.addEventListener("click", function (e) {
          if (e.target.closest("#score-search-clear")) return;
        });
      }

      var btnSearch = document.getElementById("btn-search");
      if (btnSearch) btnSearch.addEventListener("click", function () { applyFilter(); });
      var btnReset = document.getElementById("btn-reset");
      if (btnReset) btnReset.addEventListener("click", resetFilters);
    }

    function initDefaultFilters() {
      var startEl = document.getElementById("filter-date-start");
      var endEl = document.getElementById("filter-date-end");
      if (startEl && defaultStart) startEl.value = defaultStart;
      if (endEl && defaultEnd) endEl.value = defaultEnd;
    }

    if (isMobile && global.WHProjectMobile && global.WHProjectMobile.init) {
      try {
        global.WHProjectMobile.init({
          clearListSearch: clearScoreSearch,
          showToast: showToast,
        });
      } catch (initErr) {
        console.warn("[WHInScorePage] mobile init", initErr);
      }
      syncScoreSearchClear();
    }

    initDefaultFilters();
    renderList();
    bindEvents();

    (function handleQueryOpen() {
      try {
        var params = new URLSearchParams(global.location.search);
        var id = params.get("id");
        if (id) {
          setTimeout(function () {
            openDetail(Number(id));
          }, 120);
          return;
        }
        var q = params.get("q");
        if (q) {
          applyFilter(q, true);
          try {
            global.history.replaceState({ fromScoreSearch: true }, "", "score.html");
          } catch (e) {
            /* ignore */
          }
        }
      } catch (e) {
        /* ignore */
      }
    })();

    if (!isMobile && global.WHTableRowClick) {
      global.WHTableRowClick.bindById("score-table-body", {
        getRows: getListSource,
        onOpen: function (row) {
          openDetail(row.id);
        },
      });
    }

    global.WHInScorePage.showList = showList;
    global.WHInScorePage.openDetail = openDetail;
    global.WHInScorePage.renderList = renderList;
    global.WHInScorePage.findRowById = findRowById;

    return { showList: showList, openDetail: openDetail, renderList: renderList };
  }

  global.WHInScorePage = {
    boot: bootInScorePage,
    showList: null,
    openDetail: null,
    renderList: null,
    findRowById: null,
  };
})(typeof window !== "undefined" ? window : global);
