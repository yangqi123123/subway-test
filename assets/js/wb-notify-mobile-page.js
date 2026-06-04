/**
 * 移动端系统通知页
 */
(function (global) {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function $(id) {
    return document.getElementById(id);
  }

  function toast(msg) {
    var el = $("wb-mobile-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      el.classList.remove("show");
    }, 2200);
  }

  function readClass(read) {
    if (read === "未读") return "mp-wb-tag--warn";
    if (read === "已读") return "mp-wb-tag--ok";
    return "";
  }

  function cloneNotifyConfig() {
    var src = (global.WH_WORKBENCH_CONFIGS || {})["wb-sys-notify"];
    if (!src) return null;
    return JSON.parse(JSON.stringify(src));
  }

  function isAirspaceNotify(row) {
    if (global.WHWorkbenchNotify && global.WHWorkbenchNotify.isAirspaceNotify) {
      return global.WHWorkbenchNotify.isAirspaceNotify(row);
    }
    return row && (row.type === "空域许可提醒" || row.type === "提醒");
  }

  function bootNotifyMobilePage() {
    if (global.WHHeaderBadges && global.WHHeaderBadges.restoreNotifyDemoDefaults) {
      global.WHHeaderBadges.restoreNotifyDemoDefaults();
    }

    var config = cloneNotifyConfig();
    if (!config) return;

    if (global.WHHeaderBadges && global.WHHeaderBadges.applyNotifyReadToRows) {
      global.WHHeaderBadges.applyNotifyReadToRows(config.rows);
    }

    var state = {
      filtered: [],
    };

    var listEl = $("wb-mobile-list");
    var listView = $("wb-list-view");
    var detailView = $("wb-detail-view");
    var detailBody = $("wb-detail-body");
    var filterSheet = $("wb-filter-sheet");
    var searchInput = $("wb-search-trigger");
    var searchClearBtn = $("wb-search-clear");

    function syncSearchClear() {
      if (!searchInput || !searchClearBtn) return;
      searchClearBtn.hidden = !(searchInput.value || "").trim();
    }

    function getSearchQuery(qOverride) {
      if (typeof qOverride === "string") return qOverride;
      return searchInput && searchInput.value ? searchInput.value.trim() : "";
    }

    function readFilters() {
      return {
        type: ($("wb-filter-type") && $("wb-filter-type").value) || "全部",
        start: ($("wb-filter-start") && $("wb-filter-start").value) || "",
        end: ($("wb-filter-end") && $("wb-filter-end").value) || "",
        keyword: getSearchQuery(),
      };
    }

    function rowMatches(row, f) {
      if (f.type && f.type !== "全部") {
        var t = row.type === "提醒" ? "空域许可提醒" : row.type;
        if (t !== f.type) return false;
      }
      if (f.keyword && row.title && row.title.indexOf(f.keyword) < 0) return false;
      if (f.start && row.time && row.time.slice(0, 10) < f.start) return false;
      if (f.end && row.time && row.time.slice(0, 10) > f.end) return false;
      return true;
    }

    function allRows() {
      return config.rows || [];
    }

    function updateStats() {
      var rows = allRows();
      var set = function (id, val) {
        var el = $(id);
        if (el) el.textContent = String(val);
      };
      set("stat-total", rows.length);
      set(
        "stat-unread",
        rows.filter(function (r) {
          return r.read === "未读";
        }).length
      );
      set(
        "stat-approval-msg",
        rows.filter(function (r) {
          return r.type === "审批消息";
        }).length
      );
      set(
        "stat-airspace",
        rows.filter(function (r) {
          return isAirspaceNotify(r);
        }).length
      );
      if (global.WHHeaderBadges && global.WHHeaderBadges.refresh) {
        global.WHHeaderBadges.refresh();
      }
    }

    function applyFilter(qOverride, silent) {
      var q = getSearchQuery(qOverride);
      if (searchInput && typeof qOverride === "string") searchInput.value = qOverride;
      var f = readFilters();
      if (typeof qOverride === "string") f.keyword = q;
      state.filtered = allRows().filter(function (row) {
        return rowMatches(row, f);
      });
      renderList();
      updateStats();
      syncSearchClear();
      if (!silent && q) toast("已按当前条件筛选");
    }

    function clearSearch() {
      if (searchInput) searchInput.value = "";
      applyFilter("", true);
    }

    function initFromQuery() {
      try {
        var params = new URLSearchParams(global.location.search);
        var q = params.get("q") || "";
        if (q) applyFilter(q, true);
      } catch (e) {
        /* ignore */
      }
    }

    function renderList() {
      if (!listEl) return;
      if (!state.filtered.length) {
        listEl.innerHTML = '<div class="mp-project-empty">暂无数据</div>';
        return;
      }
      listEl.innerHTML = state.filtered
        .map(function (row, index) {
          var read = row.read || "—";
          var typeLabel = row.type === "提醒" ? "空域许可提醒" : row.type || "—";
          return (
            '<article class="mp-project-card mp-wb-card mp-wb-card--todo" data-index="' +
            index +
            '" role="listitem">' +
            '<div class="mp-wb-card__head">' +
            '<h3 class="mp-project-card__title mp-wb-card__title">' +
            esc(row.title) +
            "</h3>" +
            '<span class="mp-wb-tag ' +
            readClass(read) +
            '">' +
            esc(read) +
            "</span></div>" +
            '<div class="mp-wb-card__rows">' +
            '<div class="mp-wb-card__row"><span class="mp-wb-card__label">通知类型</span><span class="mp-wb-card__value">' +
            esc(typeLabel) +
            '</span></div>' +
            '<div class="mp-wb-card__row"><span class="mp-wb-card__label">发布时间</span><span class="mp-wb-card__value">' +
            esc(row.time || "—") +
            "</span></div></div>" +
            '<div class="mp-project-card__actions">' +
            '<button type="button" class="mp-project-action" data-action="wb-view">查看</button>' +
            "</div></article>"
          );
        })
        .join("");
    }

    function buildDetailGrid(pairs) {
      return (
        '<dl class="mp-disease-detail-grid">' +
        pairs
          .filter(function (p) {
            return p[1] != null && p[1] !== "";
          })
          .map(function (p) {
            return "<dt>" + esc(p[0]) + "</dt><dd>" + esc(p[1]) + "</dd>";
          })
          .join("") +
        "</dl>"
      );
    }

    function buildNotifyDetailHtml(row) {
      var pairs =
        global.WHWorkbenchNotify && global.WHWorkbenchNotify.notifyDetailPairs
          ? global.WHWorkbenchNotify.notifyDetailPairs(row)
          : [["标题", row.title], ["发布时间", row.time]];
      return (
        '<section class="mp-patrol-alert-section mp-todo-detail-section">' +
        '<h4 class="mp-patrol-alert-section__title">通知详情</h4>' +
        '<div class="mp-patrol-alert-section__body">' +
        buildDetailGrid(pairs) +
        "</div></section>"
      );
    }

    function openDetail(row) {
      if (!detailView || !detailBody) return;
      detailBody.innerHTML = buildNotifyDetailHtml(row);
      var titleEl = $("detail-wb-title");
      if (titleEl) titleEl.textContent = "详情";
      if (listView) listView.classList.add("hidden");
      detailView.classList.remove("hidden");
      global.dispatchEvent(new Event("wh-wb-view-change"));
    }

    function showList() {
      if (detailView) detailView.classList.add("hidden");
      if (listView) listView.classList.remove("hidden");
      global.dispatchEvent(new Event("wh-wb-view-change"));
    }

    function handleView(row) {
      if (row.read !== "已读") {
        row.read = "已读";
        if (global.WHHeaderBadges) global.WHHeaderBadges.markNotifyRead(row);
      }
      openDetail(row);
      applyFilter();
    }

    function bindEvents() {
      document.addEventListener("click", function (e) {
        var trigger = e.target.closest("[data-action]");
        if (!trigger) return;
        var action = trigger.getAttribute("data-action");

        if (action === "open-wb-filter") {
          if (filterSheet) {
            filterSheet.classList.add("is-open");
            filterSheet.setAttribute("aria-hidden", "false");
          }
          return;
        }
        if (action === "open-wb-search") {
          e.preventDefault();
          global.location.href = "notify-search.html";
          return;
        }
        if (action === "wb-search-clear") {
          clearSearch();
          return;
        }
        if (action === "close-wb-filter") {
          if (filterSheet) {
            filterSheet.classList.remove("is-open");
            filterSheet.setAttribute("aria-hidden", "true");
          }
          return;
        }
        if (action === "search-wb-filter") {
          if (filterSheet) {
            filterSheet.classList.remove("is-open");
            filterSheet.setAttribute("aria-hidden", "true");
          }
          applyFilter();
          return;
        }
        if (action === "reset-wb-filter") {
          ["wb-filter-type", "wb-filter-start", "wb-filter-end"].forEach(function (id) {
            var el = $(id);
            if (!el) return;
            if (el.tagName === "SELECT") el.selectedIndex = 0;
            else el.value = "";
          });
          if (searchInput) searchInput.value = "";
          applyFilter();
          toast("筛选已重置");
          return;
        }
        if (action === "wb-mark-all-read") {
          allRows().forEach(function (r) {
            r.read = "已读";
          });
          if (global.WHHeaderBadges) global.WHHeaderBadges.markAllNotifyRead();
          applyFilter();
          toast("已全部标记为已读");
          return;
        }

        var card = trigger.closest(".mp-wb-card");
        if (!card) return;
        var index = Number(card.getAttribute("data-index"));
        var row = state.filtered[index];
        if (!row) return;

        if (action === "wb-view") {
          handleView(row);
        }
      });
    }

    bindEvents();
    initFromQuery();
    applyFilter(undefined, true);

    global.WHNotifyMobilePage = {
      showList: showList,
    };
  }

  global.WHNotifyMobilePage = global.WHNotifyMobilePage || { boot: bootNotifyMobilePage };
  global.WHNotifyMobilePage.boot = bootNotifyMobilePage;
})(window);
