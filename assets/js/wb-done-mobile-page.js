/**
 * 移动端已处理事项页
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

  function resultClass(result) {
    if (result === "驳回") return "mp-wb-tag--danger";
    if (result === "通过" || result === "已续期" || result === "已复核") {
      return "mp-wb-tag--ok";
    }
    return "mp-wb-tag--warn";
  }

  function isClosedResult(result) {
    if (global.WHWorkbenchDone && global.WHWorkbenchDone.isClosedResult) {
      return global.WHWorkbenchDone.isClosedResult(result);
    }
    return result === "通过" || result === "已复核";
  }

  function cloneDoneConfig() {
    if (global.WHTodoFlow && global.WHTodoFlow.applyToConfigs) {
      global.WHTodoFlow.applyToConfigs();
    }
    var src = (global.WH_WORKBENCH_CONFIGS || {})["wb-done"];
    if (!src) return null;
    return JSON.parse(JSON.stringify(src));
  }

  function bootDoneMobilePage() {
    var config = cloneDoneConfig();
    if (!config) return;

    var state = { filtered: [] };
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
        result: ($("wb-filter-result") && $("wb-filter-result").value) || "全部",
        start: ($("wb-filter-start") && $("wb-filter-start").value) || "",
        end: ($("wb-filter-end") && $("wb-filter-end").value) || "",
        keyword: getSearchQuery(),
      };
    }

    function rowMatches(row, f) {
      if (f.type && f.type !== "全部" && row.type !== f.type) return false;
      if (f.result && f.result !== "全部" && row.result !== f.result) return false;
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
        "stat-approval",
        rows.filter(function (r) {
          return r.type === "审批";
        }).length
      );
      set(
        "stat-alarm",
        rows.filter(function (r) {
          return r.type === "告警";
        }).length
      );
      set(
        "stat-closed",
        rows.filter(function (r) {
          return isClosedResult(r.result);
        }).length
      );
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
          var result = row.result || "—";
          return (
            '<article class="mp-project-card mp-wb-card mp-wb-card--todo" data-index="' +
            index +
            '" role="listitem">' +
            '<div class="mp-wb-card__head">' +
            '<h3 class="mp-project-card__title mp-wb-card__title">' +
            esc(row.title) +
            "</h3>" +
            '<span class="mp-wb-tag ' +
            resultClass(result) +
            '">' +
            esc(result) +
            "</span></div>" +
            '<div class="mp-wb-card__rows">' +
            '<div class="mp-wb-card__row"><span class="mp-wb-card__label">类型</span><span class="mp-wb-card__value">' +
            esc(row.type || "—") +
            '</span></div>' +
            '<div class="mp-wb-card__row"><span class="mp-wb-card__label">处理时间</span><span class="mp-wb-card__value">' +
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

    function buildDoneDetailHtml(row) {
      var pairs =
        global.WHWorkbenchDone && global.WHWorkbenchDone.doneDetailPairs
          ? global.WHWorkbenchDone.doneDetailPairs(row)
          : [
              ["标题", row.title],
              ["处理时间", row.time],
            ];
      return (
        '<section class="mp-patrol-alert-section mp-todo-detail-section">' +
        '<h4 class="mp-patrol-alert-section__title">事项详情</h4>' +
        '<div class="mp-patrol-alert-section__body">' +
        buildDetailGrid(pairs) +
        "</div></section>"
      );
    }

    function buildPlanDetailSection(pairs) {
      return (
        '<section class="mp-patrol-alert-section mp-todo-detail-section">' +
        '<h4 class="mp-patrol-alert-section__title">计划详情</h4>' +
        '<div class="mp-patrol-alert-section__body">' +
        buildDetailGrid(pairs) +
        "</div></section>"
      );
    }

    function renderTimelineSection(title, html) {
      if (!html) return "";
      return (
        '<section class="mp-patrol-alert-section mp-todo-detail-block">' +
        '<h4 class="mp-patrol-alert-section__title">' +
        esc(title) +
        '</h4><div class="mp-patrol-alert-section__body mp-todo-record-log">' +
        html +
        "</div></section>"
      );
    }

    function renderApprovalRecords(plan) {
      var bridge = global.TodoModalBridge;
      if (!bridge) return "";
      var records = bridge.approvalRecordsForPlan(plan);
      if (global.ApprovalTimeline && global.ApprovalTimeline.renderApprovalRecordsMobile) {
        return global.ApprovalTimeline.renderApprovalRecordsMobile(records);
      }
      return "";
    }

    function donePlanFromRow(row) {
      var bridge = global.TodoModalBridge;
      var plan = bridge && bridge.todoPlanFromRow ? bridge.todoPlanFromRow(row) : { name: row.title, audit: "审核中" };
      if (row.result === "通过") plan.audit = "审批通过";
      else if (row.result === "驳回") plan.audit = "已驳回";
      return plan;
    }

    function doneRowAsNotify(row) {
      return {
        title: row.title,
        type: "空域许可提醒",
        time: row.notifyTime || row.time,
        approvalNo: row.approvalNo,
        routeName: row.routeName,
        approvedAt: row.approvedAt,
        permitEnd: row.permitEnd,
        remark: row.remark,
      };
    }

    function buildNotifyDetailHtml(row) {
      var notifyRow = doneRowAsNotify(row);
      var pairs =
        global.WHWorkbenchNotify && global.WHWorkbenchNotify.notifyDetailPairs
          ? global.WHWorkbenchNotify.notifyDetailPairs(notifyRow)
          : [
              ["标题", row.title],
              ["发布时间", row.time],
            ];
      return (
        '<section class="mp-patrol-alert-section mp-todo-detail-section">' +
        '<h4 class="mp-patrol-alert-section__title">通知详情</h4>' +
        '<div class="mp-patrol-alert-section__body">' +
        buildDetailGrid(pairs) +
        "</div></section>"
      );
    }

    function openDetailView(title, innerHtml) {
      if (!detailView || !detailBody) return;
      detailBody.innerHTML = innerHtml;
      var titleEl = $("detail-wb-title");
      if (titleEl) titleEl.textContent = title || "详情";
      if (listView) listView.classList.add("hidden");
      detailView.classList.remove("hidden");
      global.dispatchEvent(new Event("wh-wb-view-change"));
    }

    function handleFlightPlanView(row) {
      var bridge = global.TodoModalBridge;
      if (!bridge || !row.planId) {
        openDetail(row);
        return;
      }
      var pairs = bridge.flightPlanDetailPairs(row.planId);
      if (!pairs) {
        toast("未找到关联飞行计划");
        return;
      }
      var plan = donePlanFromRow(row);
      openDetailView(
        "详情",
        buildPlanDetailSection(pairs) + renderTimelineSection("审批记录", renderApprovalRecords(plan))
      );
    }

    function handleAlarmView(row) {
      var maps = global.WHMapAlerts;
      var bridge = global.TodoModalBridge;
      if (maps && row.alertId != null) {
        var item = maps.findProject(row.alertId);
        if (!item && bridge) item = bridge.getAlarmProject(row.alertId, row);
        if (item && maps.openDetail(item)) return;
      }
      toast("未找到关联告警");
    }

    function handleAirspaceView(row) {
      openDetailView("详情", buildNotifyDetailHtml(row));
    }

    function openDetail(row) {
      if (!detailView || !detailBody) return;
      detailBody.innerHTML = buildDoneDetailHtml(row);
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
      if (row.doneKind === "flight-plan" || row.type === "审批") {
        handleFlightPlanView(row);
        return;
      }
      if (row.doneKind === "alarm" || row.type === "告警") {
        handleAlarmView(row);
        return;
      }
      if (row.doneKind === "airspace" || row.type === "空域许可续期") {
        handleAirspaceView(row);
        return;
      }
      openDetail(row);
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
          global.location.href = "done-search.html";
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
          ["wb-filter-type", "wb-filter-result", "wb-filter-start", "wb-filter-end"].forEach(function (id) {
            var el = $(id);
            if (!el) return;
            if (el.tagName === "SELECT") el.selectedIndex = 0;
            else el.value = "";
          });
          if (searchInput) searchInput.value = "";
          applyFilter(undefined, true);
          toast("筛选已重置");
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

    global.WHDoneMobilePage = { showList: showList };
  }

  global.WHDoneMobilePage = global.WHDoneMobilePage || { boot: bootDoneMobilePage };
  global.WHDoneMobilePage.boot = bootDoneMobilePage;
})(window);
