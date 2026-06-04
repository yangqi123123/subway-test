/**
 * 移动端待办页
 */
(function (global) {
  "use strict";

  var TODO_ACTIVE = ["待审批", "未复核"];

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

  function statusClass(status) {
    if (status === "待审批" || status === "未复核") return "mp-wb-tag--warn";
    if (status === "驳回" || status === "已驳回" || status === "审核不通过") return "mp-wb-tag--danger";
    if (status === "已复核" || status === "审批通过" || status === "审核通过") return "mp-wb-tag--ok";
    return "";
  }

  function cloneTodoConfig() {
    if (global.WHTodoFlow) global.WHTodoFlow.applyToConfigs();
    var src = (global.WH_WORKBENCH_CONFIGS || {})["wb-todo"];
    if (!src) return null;
    return JSON.parse(JSON.stringify(src));
  }

  function currentMonthPrefix() {
    var d = new Date();
    var pad = function (n) {
      return n < 10 ? "0" + n : String(n);
    };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1);
  }

  function bootTodoMobilePage() {
    if (global.WHTodoFlow && global.WHTodoFlow.restoreDemoDefaults) {
      global.WHTodoFlow.restoreDemoDefaults();
    }
    var config = cloneTodoConfig();
    if (!config) return;

    var state = {
      activeTab: config.activeTab || "approval",
      filtered: [],
      selected: {},
      currentRow: null,
      approvalTargets: null,
      approvalMode: "approval",
    };

    var listEl = $("wb-mobile-list");
    var listView = $("wb-list-view");
    var detailView = $("wb-detail-view");
    var approvalView = $("wb-approval-view");
    var detailBody = $("wb-detail-body");
    var approvalBody = $("wb-approval-body");
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
        start: ($("wb-filter-start") && $("wb-filter-start").value) || "",
        end: ($("wb-filter-end") && $("wb-filter-end").value) || "",
        keyword: getSearchQuery(),
      };
    }

    function rowMatches(row, f) {
      if (state.activeTab && row.tab && row.tab !== state.activeTab) return false;
      if (f.keyword && row.title && row.title.indexOf(f.keyword) < 0) return false;
      if (f.start && row.time && row.time.slice(0, 10) < f.start) return false;
      if (f.end && row.time && row.time.slice(0, 10) > f.end) return false;
      return true;
    }

    function allTodoRows() {
      return config.rows || [];
    }

    function updateStats() {
      var all = allTodoRows();
      var month = currentMonthPrefix();
      var set = function (id, val) {
        var el = $(id);
        if (el) el.textContent = String(val);
      };
      set("stat-total", all.length);
      set(
        "stat-approval",
        all.filter(function (r) {
          return r.tab === "approval";
        }).length
      );
      set(
        "stat-alert",
        all.filter(function (r) {
          return r.tab === "alert";
        }).length
      );
      set(
        "stat-month",
        all.filter(function (r) {
          return r.time && r.time.slice(0, 7) === month;
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
      state.filtered = allTodoRows().filter(function (row) {
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

    function rowBatchSelectable(row) {
      if (state.activeTab === "approval") return row.status === "待审批";
      if (state.activeTab === "alert") return true;
      return false;
    }

    function rowBatchActionable(row) {
      if (state.activeTab === "approval") return row.tab === "approval" && row.status === "待审批";
      if (state.activeTab === "alert") return row.tab === "alert" && row.status === "未复核";
      return false;
    }

    function syncApprovalFooter(mode) {
      var split = $("wb-approval-footer-split");
      var save = $("wb-approval-footer-save");
      if (split) split.classList.toggle("hidden", mode === "batchReview");
      if (save) save.classList.toggle("hidden", mode !== "batchReview");
    }

    function finishAlertReview(row, data) {
      var flow = global.WHTodoFlow;
      if (flow) {
        flow.patchTodoRow(row, { status: "已复核", workflowStatus: "已复核" }, config.rows);
      }
      var opinion = (data && data.scene) || "";
      if (flow && flow.shouldMoveToDone(row, "已复核")) {
        flow.moveTodoRowToDone(row, "已复核", opinion, config.rows);
        return true;
      }
      return false;
    }

    function buildBatchListHtml(rows, label) {
      return (
        '<section class="mp-patrol-alert-section mp-todo-approval-block">' +
        '<h4 class="mp-patrol-alert-section__title">' +
        esc(label) +
        '</h4><div class="mp-todo-batch-scroll">' +
        rows
          .map(function (r) {
            return (
              '<div class="mp-todo-batch-item">' +
              '<div class="mp-todo-batch-item__title">' +
              esc(r.title) +
              '</div><div class="mp-todo-batch-item__meta">' +
              esc(r.user || "—") +
              " · " +
              esc(r.time || "—") +
              "</div></div>"
            );
          })
          .join("") +
        "</div></section>"
      );
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

    function buildPlanDetailSection(pairs) {
      return (
        '<section class="mp-patrol-alert-section mp-todo-detail-section">' +
        '<h4 class="mp-patrol-alert-section__title">计划详情</h4>' +
        '<div class="mp-patrol-alert-section__body">' +
        buildDetailGrid(pairs) +
        "</div></section>"
      );
    }

    function buildAlarmDetailSection(pairs) {
      return (
        '<section class="mp-todo-detail-section">' +
        '<h3 class="mp-todo-section-title">告警详情</h3>' +
        buildDetailGrid(pairs) +
        "</section>"
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

    function openDetailView(title, innerHtml) {
      if (!detailView || !detailBody) return;
      detailBody.innerHTML = innerHtml;
      $("detail-wb-title").textContent = title || "详情";
      hideAllViews();
      detailView.classList.remove("hidden");
      dispatchViewChange();
    }

    function hideAllViews() {
      if (listView) listView.classList.add("hidden");
      if (detailView) detailView.classList.add("hidden");
      if (approvalView) approvalView.classList.add("hidden");
    }

    function showList() {
      hideAllViews();
      if (listView) listView.classList.remove("hidden");
      state.currentRow = null;
      state.approvalTargets = null;
      state.approvalMode = "approval";
      syncApprovalFooter("approval");
      dispatchViewChange();
      if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) global.MiniAppFrame.syncTabbar();
    }

    function dispatchViewChange() {
      global.dispatchEvent(new Event("wh-wb-view-change"));
    }

    function openApprovalView(row, batchRows, opts) {
      if (!approvalView || !approvalBody) return;
      var bridge = global.TodoModalBridge;
      if (!bridge) return;

      opts = opts || {};
      var fromBatch = !!opts.fromBatch;
      var targets = batchRows && batchRows.length ? batchRows.slice() : row ? [row] : [];
      if (opts.submitTargets && opts.submitTargets.length) {
        state.approvalTargets = opts.submitTargets.slice();
      } else {
        state.approvalTargets = targets;
      }
      var displayRows = fromBatch && batchRows && batchRows.length ? batchRows.slice() : targets;
      var isBatchReview = fromBatch && state.activeTab === "alert";
      var isAudit = false;
      state.approvalMode = isBatchReview ? "batchReview" : "approval";

      var plan = bridge.todoPlanFromRow(row || state.approvalTargets[0] || targets[0] || {});
      var heading = isBatchReview
        ? "批量复核" + (displayRows.length > 1 ? "（" + displayRows.length + " 条）" : "")
        : fromBatch && targets.length > 1
          ? "批量审批（" + targets.length + " 条）"
          : fromBatch && targets.length === 1
            ? "批量审批"
            : targets.length > 1
              ? "批量审批（" + targets.length + " 条）"
              : isAudit
                ? (row && row.title) || "告警审核"
                : plan.name;
      var batchLabel = isBatchReview ? "待复核事项" : isAudit ? "待审核事项" : "待审批事项";
      var batchSection =
        fromBatch && displayRows.length ? buildBatchListHtml(displayRows, batchLabel) : "";
      var reviewFormSection =
        isBatchReview && global.WuhanExpertReviewModal && global.WuhanExpertReviewModal.buildInlineReviewFormHtml
          ? global.WuhanExpertReviewModal.buildInlineReviewFormHtml()
          : "";
      var recordsSection =
        !isAudit && !isBatchReview && targets.length <= 1
          ? renderTimelineSection("审批记录", renderApprovalRecords(plan))
          : "";
      var tipSection =
        !isAudit && !isBatchReview
          ? '<p class="mp-todo-approval-tip">系统校验：飞行计划审批通过、航线空域许可有效、无人机满足起飞条件才允许起飞。</p>'
          : "";
      var opinionSection = isBatchReview
        ? ""
        : '<label class="mp-form-row mp-form-row--full"><span class="project-form-label project-required">审批意见</span>' +
          '<textarea id="wb-approval-opinion" class="wh-input mp-field mp-field--textarea" placeholder="请输入审批意见">' +
          esc(isAudit ? "" : "同意该飞行计划按审批流程继续执行。") +
          "</textarea></label>";

      approvalBody.innerHTML =
        '<div class="mp-todo-approval-head"><h2>' +
        esc(heading) +
        "</h2>" +
        (isBatchReview
          ? ""
          : '<p class="mp-todo-approval-flow">审批流程：提交 → 工长 → 工务 → 物管 → 车间主任 → 部门领导</p>') +
        "</div>" +
        batchSection +
        reviewFormSection +
        opinionSection +
        recordsSection +
        tipSection;

      if (isBatchReview && global.WuhanExpertReviewModal) {
        var firstRow = state.approvalTargets[0] || row || {};
        var firstProject =
          bridge.getAlarmProject && firstRow.alertId != null
            ? bridge.getAlarmProject(firstRow.alertId, firstRow)
            : null;
        global.WuhanExpertReviewModal.initInlineReviewForm({
          projectName: (firstProject && firstProject.projectName) || "",
          projectNameOptions: bridge.collectAlarmProjectNames ? bridge.collectAlarmProjectNames() : [],
          falseAlarm: "非误报",
          levelAdjust: "一级告警",
          scene: "",
          photos: global.WuhanExpertReviewModal.DEFAULT_PHOTOS,
        });
      }

      $("detail-wb-title").textContent = isBatchReview
        ? "批量复核"
        : fromBatch || targets.length > 1
          ? "批量审批"
          : isAudit
            ? "告警审核"
            : "飞行计划审批";
      syncApprovalFooter(state.approvalMode);
      hideAllViews();
      approvalView.classList.remove("hidden");
      dispatchViewChange();
    }

    function applyAuditToRow(row, result, opinion) {
      var bridge = global.TodoModalBridge;
      if (!bridge || !row || row.tab !== "alert" || row.status !== "已复核") return false;
      var project = bridge.getAlarmProject(row.alertId, row);
      if (!project) return false;
      var t =
        global.WuhanExpertReviewModal && global.WuhanExpertReviewModal.nowStr
          ? global.WuhanExpertReviewModal.nowStr()
          : new Date().toISOString().slice(0, 19).replace("T", " ");
      project.workflowStatus = result;
      project.disposalRecord = project.disposalRecord || [];
      project.disposalRecord.push({
        time: t,
        type: "audit",
        text: "管理员审批",
        auditor: "管理员",
        result: result,
        opinion: opinion,
      });
      if (bridge.ALARM_PROJECTS && row.alertId != null) {
        bridge.ALARM_PROJECTS[row.alertId] = project;
      }
      bridge.syncAlarmRow(row, project);
      var flow = global.WHTodoFlow;
      if (flow && flow.shouldMoveToDone(row, result)) {
        flow.moveTodoRowToDone(row, result, opinion, config.rows);
      } else if (flow) {
        flow.patchTodoRow(row, { status: result, workflowStatus: result }, config.rows);
      }
      return true;
    }

    function submitBatchAudit(passed) {
      var opinionEl = $("wb-approval-opinion");
      var opinion = (opinionEl && opinionEl.value.trim()) || "";
      if (!opinion) {
        toast("请填写审批意见");
        return;
      }
      var result = passed ? "审核通过" : "审核不通过";
      var targets = state.approvalTargets || [];
      var applied = 0;
      targets.forEach(function (row) {
        if (applyAuditToRow(row, result, opinion)) applied++;
      });
      if (!applied) {
        toast("所选待办均不可审核");
        return;
      }
      state.selected = {};
      state.approvalTargets = null;
      state.approvalMode = "approval";
      showList();
      applyFilter();
      toast(passed ? "审核通过，已移入已处理事项" : "已驳回，已移入已处理事项");
    }

    function submitBatchReview() {
      var bridge = global.TodoModalBridge;
      var reviewModal = global.WuhanExpertReviewModal;
      if (!bridge || !reviewModal || !reviewModal.readInlineReviewForm) {
        toast("复核模块未加载");
        return;
      }
      var data = reviewModal.readInlineReviewForm();
      if (!data.scene && data.falseAlarm !== "误报") {
        toast("请填写现场复核情况");
        return;
      }
      var targets = state.approvalTargets || [];
      var applied = 0;
      targets.forEach(function (row) {
        if (!row || row.tab !== "alert" || row.status !== "未复核") return;
        if (bridge.applyAlarmReviewData(row.alertId, row, data)) {
          if (finishAlertReview(row, data)) applied++;
        }
      });
      if (!applied) {
        toast("所选待办均不可复核");
        return;
      }
      state.selected = {};
      state.approvalTargets = null;
      state.approvalMode = "approval";
      showList();
      applyFilter();
      toast("批量复核完成，已移入已处理事项");
    }

    function submitApproval(status) {
      if (state.approvalMode === "batchReview") {
        submitBatchReview();
        return;
      }
      if (state.approvalMode === "audit") {
        submitBatchAudit(status === "审批通过");
        return;
      }
      var opinionEl = $("wb-approval-opinion");
      var opinion = (opinionEl && opinionEl.value.trim()) || "";
      if (!opinion) {
        toast("请填写审批意见");
        return;
      }
      var targets = state.approvalTargets || (state.currentRow ? [state.currentRow] : []);
      var applied = 0;
      var flow = global.WHTodoFlow;

      targets.forEach(function (row) {
        if (!row || row.tab !== "approval" || row.status !== "待审批") return;
        if (flow && flow.shouldMoveToDone(row, status)) {
          flow.moveTodoRowToDone(row, status, opinion, config.rows);
        } else {
          row.status = status;
          row.opinion = opinion;
        }
        applied++;
      });

      if (!applied) {
        toast("所选待办均不可审批");
        return;
      }
      state.selected = {};
      state.approvalTargets = null;
      showList();
      applyFilter();
      toast(status === "审批通过" ? "审批通过，已移入已处理事项" : "已驳回，已移入已处理事项");
    }

    function handleFlightPlanView(row) {
      var bridge = global.TodoModalBridge;
      if (!bridge || !row.planId) {
        openDetailView(
          row.title,
          buildDetailGrid([
            ["标题", row.title],
            ["发起人", row.user],
            ["创建时间", row.time],
            ["状态", row.status],
          ])
        );
        return;
      }
      var pairs = bridge.flightPlanDetailPairs(row.planId);
      if (!pairs) {
        toast("未找到关联飞行计划");
        return;
      }
      var plan = bridge.todoPlanFromRow(row);
      openDetailView(
        row.title,
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
      if (!bridge || !row.alertId) {
        openDetailView(
          row.title,
          buildDetailGrid([
            ["标题", row.title],
            ["发起人", row.user],
            ["创建时间", row.time],
            ["状态", row.status],
          ])
        );
        return;
      }
      toast("未找到关联告警");
    }

    function handleView(row) {
      state.currentRow = row;
      if (row.tab === "approval") {
        handleFlightPlanView(row);
        return;
      }
      if (row.tab === "alert") {
        handleAlarmView(row);
        return;
      }
      openDetailView(
        row.title,
        buildDetailGrid([
          ["标题", row.title],
          ["发起人", row.user],
          ["创建时间", row.time],
          ["状态", row.status],
        ])
      );
    }

    function handleApprove(row) {
      state.currentRow = row;
      openApprovalView(row);
    }

    function handleReview(row) {
      var bridge = global.TodoModalBridge;
      if (!bridge || !global.WuhanExpertReviewModal) {
        toast("复核模块未加载");
        return;
      }
      bridge.openAlarmReview(row.alertId, row, function (project, data) {
        var reviewData = data || (project && project.review) || {};
        if (finishAlertReview(row, reviewData)) {
          applyFilter();
          toast("复核完成，已移入已处理事项");
          return;
        }
        applyFilter();
        toast("复核情况已保存");
      });
    }

    function todoActions(row) {
      var acts = ['<button type="button" class="mp-project-action" data-action="wb-view">查看</button>'];
      if (row.tab === "approval" && row.status === "待审批") {
        acts.push(
          '<button type="button" class="mp-project-action mp-project-action--primary" data-action="wb-approve">审批</button>'
        );
      }
      if (row.tab === "alert" && row.status === "未复核") {
        acts.push('<button type="button" class="mp-project-action" data-action="wb-review">复核</button>');
      }
      return acts.join("");
    }

    function renderList() {
      if (!listEl) return;
      if (!state.filtered.length) {
        listEl.innerHTML = '<div class="mp-project-empty">暂无数据</div>';
        return;
      }
      listEl.innerHTML = state.filtered
        .map(function (row, index) {
          var status = row.status || "—";
          var check = rowBatchSelectable(row)
              ? '<label class="mp-wb-check"><input type="checkbox" data-action="wb-check" data-index="' +
                index +
                '" /></label>'
              : "";
          return (
            '<article class="mp-project-card mp-wb-card mp-wb-card--todo" data-index="' +
            index +
            '" role="listitem">' +
            check +
            '<div class="mp-wb-card__head">' +
            '<h3 class="mp-project-card__title mp-wb-card__title">' +
            esc(row.title) +
            "</h3>" +
            '<span class="mp-wb-tag ' +
            statusClass(status) +
            '">' +
            esc(status) +
            "</span></div>" +
            '<div class="mp-wb-card__rows">' +
            '<div class="mp-wb-card__row"><span class="mp-wb-card__label">发起人</span><span class="mp-wb-card__value">' +
            esc(row.user || "—") +
            '</span></div>' +
            '<div class="mp-wb-card__row"><span class="mp-wb-card__label">创建时间</span><span class="mp-wb-card__value">' +
            esc(row.time || "—") +
            "</span></div></div>" +
            '<div class="mp-project-card__actions">' +
            todoActions(row) +
            "</div></article>"
          );
        })
        .join("");
    }

    function renderTabs() {
      var wrap = $("wb-tab-bar");
      if (!wrap || !config.tabs) return;
      wrap.innerHTML = config.tabs
        .map(function (tab) {
          return (
            '<button type="button" class="mp-wb-tab' +
            (state.activeTab === tab.key ? " active" : "") +
            '" data-tab="' +
            esc(tab.key) +
            '">' +
            esc(tab.label) +
            "</button>"
          );
        })
        .join("");
      var footer = $("wb-todo-list-footer");
      if (footer) {
        footer.hidden = false;
      }
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
          global.location.href = "todo-search.html";
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
          ["wb-filter-start", "wb-filter-end"].forEach(function (id) {
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
        if (action === "wb-batch-approve") {
          var picked = Object.keys(state.selected).filter(function (k) {
            return state.selected[k];
          });
          if (!picked.length) {
            toast(state.activeTab === "alert" ? "请选择待复核项" : "请选择待审批项");
            return;
          }
          var pickedRows = picked
            .map(function (idx) {
              return state.filtered[Number(idx)];
            })
            .filter(Boolean);
          var rows = pickedRows.filter(function (r) {
            return rowBatchActionable(r);
          });
          if (!rows.length) {
            toast(
              state.activeTab === "alert"
                ? "所选待办均不可复核"
                : "所选待办均不可审批"
            );
            return;
          }
          openApprovalView(rows[0], pickedRows, { fromBatch: true, submitTargets: rows });
          return;
        }
        if (action === "wb-approve-submit") {
          submitApproval("审批通过");
          return;
        }
        if (action === "wb-reject-submit") {
          submitApproval("已驳回");
          return;
        }
        if (action === "wb-batch-review-save") {
          submitBatchReview();
          return;
        }

        var card = trigger.closest(".mp-wb-card");
        if (!card) return;
        var index = Number(card.getAttribute("data-index"));
        var row = state.filtered[index];
        if (!row) return;
        if (action === "wb-check") return;

        if (action === "wb-view") {
          handleView(row);
          return;
        }
        if (action === "wb-approve") {
          handleApprove(row);
          return;
        }
        if (action === "wb-review") {
          handleReview(row);
          return;
        }
      });

      document.addEventListener("change", function (e) {
        var cb = e.target.closest('[data-action="wb-check"]');
        if (!cb) return;
        state.selected[cb.getAttribute("data-index")] = cb.checked;
      });

      var tabBar = $("wb-tab-bar");
      if (tabBar) {
        tabBar.addEventListener("click", function (e) {
          var btn = e.target.closest("[data-tab]");
          if (!btn) return;
          state.activeTab = btn.getAttribute("data-tab");
          state.selected = {};
          renderTabs();
          applyFilter();
        });
      }
    }

    global.WHWorkbenchMobilePage = global.WHWorkbenchMobilePage || {};
    global.WHWorkbenchMobilePage.showList = showList;

    renderTabs();
    bindEvents();
    initFromQuery();
    applyFilter(undefined, true);
  }

  global.WBTodoMobilePage = { boot: bootTodoMobilePage };
})(window);
