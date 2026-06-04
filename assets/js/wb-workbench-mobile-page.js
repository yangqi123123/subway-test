/**
 * 移动端工作台：待办 / 已处理 / 系统通知
 */
(function (global) {
  "use strict";

  var TODO_PENDING = ["待审批", "未复核", "已复核"];

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
    if (status === "未读" || status === "待审批" || status === "未复核") return "mp-wb-tag--warn";
    if (status === "驳回" || status === "审核不通过") return "mp-wb-tag--danger";
    if (
      status === "通过" ||
      status === "已处置" ||
      status === "已续期" ||
      status === "已读" ||
      status === "已复核" ||
      status === "审批通过"
    ) {
      return "mp-wb-tag--ok";
    }
    return "";
  }

  function cloneConfig(key) {
    var src = (global.WH_WORKBENCH_CONFIGS || {})[key];
    if (!src) return null;
    return JSON.parse(JSON.stringify(src));
  }

  function updateNavBadge(pageKey, count) {
    var badge = $("wb-nav-badge");
    if (!badge) return;
    if (!count || count < 1) {
      badge.hidden = true;
      badge.textContent = "";
      return;
    }
    badge.hidden = false;
    badge.textContent = count > 99 ? "99+" : String(count);
  }

  function syncTodoBadge(rows) {
    var count = (rows || []).filter(function (r) {
      return TODO_PENDING.indexOf(r.status) >= 0;
    }).length;
    if (global.WHHeaderBadges && global.WHHeaderBadges.todoPendingCount) {
      count = global.WHHeaderBadges.todoPendingCount();
    }
    updateNavBadge("wb-todo", count);
  }

  function syncNotifyBadge(rows) {
    var count = (rows || []).filter(function (r) {
      return r.read === "未读";
    }).length;
    if (global.WHHeaderBadges && global.WHHeaderBadges.notifyUnreadCount) {
      count = global.WHHeaderBadges.notifyUnreadCount();
    }
    updateNavBadge("wb-sys-notify", count);
  }

  function syncDoneBadge(rows) {
    updateNavBadge("wb-done", (rows || []).length);
  }

  function bootWorkbenchMobilePage(options) {
    options = options || {};
    var pageKey = options.pageKey || document.body.getAttribute("data-wb-page");
    if (pageKey === "wb-todo" || pageKey === "wb-sys-notify" || pageKey === "wb-done") return;

    if (global.WHTodoFlow) global.WHTodoFlow.applyToConfigs();

    var config = cloneConfig(pageKey);
    if (!config) return;

    if (pageKey === "wb-sys-notify" && global.WHHeaderBadges) {
      global.WHHeaderBadges.applyNotifyReadToRows(config.rows);
    }

    var state = {
      pageKey: pageKey,
      config: config,
      activeTab: config.activeTab || (config.tabs && config.tabs[0] && config.tabs[0].key) || "",
      filtered: [],
      selected: {},
    };

    var listEl = $("wb-mobile-list");
    var detailView = $("wb-detail-view");
    var detailBody = $("wb-detail-body");
    var listView = $("wb-list-view");
    var filterSheet = $("wb-filter-sheet");

    function readFilters() {
      var f = {};
      (config.filters || []).forEach(function (item) {
        var el = $("wb-filter-" + item.id);
        if (el) f[item.id] = el.value;
      });
      return f;
    }

    function rowMatches(row, f) {
      if (pageKey === "wb-todo" && state.activeTab && row.tab && row.tab !== state.activeTab) {
        return false;
      }
      if (pageKey === "wb-todo" && f.status && f.status !== "全部" && row.status !== f.status) {
        return false;
      }
      if (pageKey === "wb-sys-notify" && f.type && f.type !== "全部") {
        var t = row.type === "提醒" ? "空域许可提醒" : row.type;
        if (t !== f.type) return false;
      }
      if (pageKey === "wb-done" && f.type && f.type !== "全部" && row.type !== f.type) return false;
      if (pageKey === "wb-done" && f.result && f.result !== "全部" && row.result !== f.result) {
        return false;
      }
      if (f.start && row.time && row.time.slice(0, 10) < f.start) return false;
      if (f.end && row.time && row.time.slice(0, 10) > f.end) return false;
      return true;
    }

    function applyFilter() {
      var f = readFilters();
      state.filtered = (config.rows || []).filter(function (row) {
        return rowMatches(row, f);
      });
      renderList();
      updateStats();
    }

    function updateStats() {
      var total = state.filtered.length;
      var el = $("stat-total");
      if (el) el.textContent = String(total);
      if (pageKey === "wb-todo") syncTodoBadge(config.rows);
      if (pageKey === "wb-sys-notify") syncNotifyBadge(config.rows);
      if (pageKey === "wb-done") syncDoneBadge(config.rows);
    }

    function todoActions(row) {
      var acts = ['<button type="button" class="mp-project-action" data-action="wb-view">查看</button>'];
      if (row.tab === "approval" && row.status === "待审批") {
        acts.push(
          '<button type="button" class="mp-project-action mp-project-action--primary" data-action="wb-approve">审批</button>'
        );
      }
      if (row.tab === "alert" && row.status === "未复核") {
        acts.push(
          '<button type="button" class="mp-project-action" data-action="wb-review">复核</button>'
        );
      }
      if (row.tab === "alert" && row.status === "已复核") {
        acts.push(
          '<button type="button" class="mp-project-action" data-action="wb-audit">审核</button>'
        );
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
          var status = row.status || row.read || row.result || "—";
          var meta =
            pageKey === "wb-done"
              ? [row.type, row.user, row.time].filter(Boolean).join(" · ")
              : [row.source || row.type, row.user, row.time].filter(Boolean).join(" · ");
          var check =
            pageKey === "wb-todo" && state.activeTab === "approval" && row.status === "待审批"
              ? '<label class="mp-wb-check"><input type="checkbox" data-action="wb-check" data-index="' +
                index +
                '" /></label>'
              : "";
          return (
            '<article class="mp-project-card mp-wb-card" data-index="' +
            index +
            '" role="listitem">' +
            check +
            '<div class="mp-wb-card__head">' +
            '<h3 class="mp-project-card__title">' +
            esc(row.title) +
            "</h3>" +
            '<span class="mp-wb-tag ' +
            statusClass(status) +
            '">' +
            esc(status) +
            "</span></div>" +
            '<p class="mp-wb-card__meta">' +
            esc(meta) +
            "</p>" +
            '<div class="mp-project-card__actions">' +
            (pageKey === "wb-todo"
              ? todoActions(row)
              : '<button type="button" class="mp-project-action" data-action="wb-view">查看</button>') +
            "</div></article>"
          );
        })
        .join("");
    }

    function buildDetailGrid(pairs) {
      return (
        '<dl class="mp-disease-detail-grid">' +
        pairs
          .map(function (p) {
            return "<dt>" + esc(p[0]) + "</dt><dd>" + esc(p[1]) + "</dd>";
          })
          .join("") +
        "</dl>"
      );
    }

    function openDetail(row) {
      if (!detailView || !detailBody) return;
      var pairs = [["标题", row.title]];
      if (row.source) pairs.push(["来源", row.source]);
      if (row.type) pairs.push(["类型", row.type]);
      if (row.user) pairs.push(["发起人/处理人", row.user]);
      if (row.time) pairs.push(["时间", row.time]);
      if (row.status) pairs.push(["状态", row.status]);
      if (row.result) pairs.push(["处理结果", row.result]);
      if (row.note) pairs.push(["说明", row.note]);
      if (row.opinion) pairs.push(["意见", row.opinion]);
      if (row.read) pairs.push(["是否已读", row.read]);
      detailBody.innerHTML = buildDetailGrid(pairs);
      var titleEl = $("detail-wb-title");
      if (titleEl) titleEl.textContent = row.title || "详情";
      listView.classList.add("hidden");
      detailView.classList.remove("hidden");
      global.dispatchEvent(new Event("wh-wb-view-change"));
    }

    function showList() {
      if (detailView) detailView.classList.add("hidden");
      if (listView) listView.classList.remove("hidden");
      global.dispatchEvent(new Event("wh-wb-view-change"));
    }

    function handleView(row) {
      if (pageKey === "wb-todo" && global.TodoModalBridge) {
        if (row.tab === "approval" && row.planId) {
          global.TodoModalBridge.openFlightPlanDetail(row.planId);
          return;
        }
        if (row.tab === "alert" && row.alertId) {
          global.TodoModalBridge.openAlarmDetail(row.alertId, row);
          return;
        }
      }
      if (pageKey === "wb-done" && global.TodoModalBridge) {
        if (row.doneKind === "flight-plan" && row.planId) {
          global.TodoModalBridge.openFlightPlanDetail(row.planId);
          return;
        }
        if (row.doneKind === "alarm" && row.alertId) {
          global.TodoModalBridge.openAlarmDetail(row.alertId, row);
          return;
        }
      }
      if (pageKey === "wb-sys-notify") {
        row.read = "已读";
        if (global.WHHeaderBadges) global.WHHeaderBadges.markNotifyRead(row);
        applyFilter();
      }
      openDetail(row);
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
          (config.filters || []).forEach(function (item) {
            var el = $("wb-filter-" + item.id);
            if (el) el.selectedIndex = 0;
          });
          applyFilter();
          toast("筛选已重置");
          return;
        }
        if (action === "wb-mark-all-read") {
          (config.rows || []).forEach(function (r) {
            r.read = "已读";
          });
          if (global.WHHeaderBadges) global.WHHeaderBadges.markAllNotifyRead();
          applyFilter();
          toast("已全部标记为已读");
          return;
        }
        if (action === "wb-batch-approve") {
          var picked = Object.keys(state.selected).filter(function (k) {
            return state.selected[k];
          });
          if (!picked.length) {
            toast("请选择待审批项");
            return;
          }
          toast("已批量审批 " + picked.length + " 条（原型演示）");
          picked.forEach(function (idx) {
            var row = state.filtered[Number(idx)];
            if (row && row.status === "待审批") row.status = "审批通过";
          });
          state.selected = {};
          applyFilter();
          return;
        }
        if (action === "wb-back-list") {
          showList();
          return;
        }
        if (action === "wb-save-password") {
          var oldP = ($("pwd-old") && $("pwd-old").value) || "";
          var newP = ($("pwd-new") && $("pwd-new").value) || "";
          var confirmP = ($("pwd-confirm") && $("pwd-confirm").value) || "";
          if (!oldP || !newP || !confirmP) {
            toast("请填写完整密码信息");
            return;
          }
          if (newP !== confirmP) {
            toast("两次新密码不一致");
            return;
          }
          toast("密码已更新（原型演示）");
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
          row.status = "审批通过";
          applyFilter();
          toast("审批通过（原型演示）");
          return;
        }
        if (action === "wb-review" && global.TodoModalBridge) {
          global.TodoModalBridge.openAlarmReview(row.alertId, row, applyFilter);
          return;
        }
        if (action === "wb-audit" && global.TodoModalBridge) {
          global.TodoModalBridge.openAlarmAudit(row.alertId, row, applyFilter);
          return;
        }
      });

      document.addEventListener("change", function (e) {
        var cb = e.target.closest('[data-action="wb-check"]');
        if (!cb) return;
        var index = cb.getAttribute("data-index");
        state.selected[index] = cb.checked;
      });

      var tabBar = $("wb-tab-bar");
      if (tabBar) {
        tabBar.addEventListener("click", function (e) {
          var btn = e.target.closest("[data-tab]");
          if (!btn) return;
          state.activeTab = btn.getAttribute("data-tab");
          renderTabs();
          applyFilter();
        });
      }
    }

    renderTabs();
    bindEvents();
    applyFilter();

    global.WHWorkbenchMobilePage = global.WHWorkbenchMobilePage || {};
    global.WHWorkbenchMobilePage.showList = showList;
  }

  global.WHWorkbenchMobilePage = {
    boot: bootWorkbenchMobilePage,
  };
})(window);
