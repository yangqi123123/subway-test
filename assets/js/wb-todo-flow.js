/**
 * 待办 → 已处理事项 流转（localStorage 同步）
 */
(function (global) {
  "use strict";

  var STORAGE_KEY = "wh-wb-todo-state-v1";

  function resetDemoState() {
    try {
      global.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function restoreDemoDefaults() {
    resetDemoState();
    var defaults = global.WH_WORKBENCH_DEFAULTS;
    var configs = global.WH_WORKBENCH_CONFIGS;
    if (!defaults || !configs) return;
    if (defaults["wb-todo"]) {
      configs["wb-todo"] = JSON.parse(JSON.stringify(defaults["wb-todo"]));
    }
    if (defaults["wb-done"]) {
      configs["wb-done"] = JSON.parse(JSON.stringify(defaults["wb-done"]));
    }
  }

  function isPageReload() {
    try {
      var nav =
        global.performance && global.performance.getEntriesByType
          ? global.performance.getEntriesByType("navigation")[0]
          : null;
      if (nav && nav.type === "reload") return true;
    } catch (e) {}
    try {
      if (global.performance && global.performance.navigation) {
        return global.performance.navigation.type === 1;
      }
    } catch (e2) {}
    return false;
  }

  /** 非待办页加载脚本时：刷新后恢复示例数据 */
  function restoreDemoDefaultsOnReload() {
    if (isPageReload()) restoreDemoDefaults();
  }

  restoreDemoDefaultsOnReload();

  function loadState() {
    try {
      var raw = global.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { removedTitles: [], doneAdds: [], todoPatches: {} };
  }

  function saveState(state) {
    global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function nowText() {
    var d = new Date();
    var pad = function (n) {
      return n < 10 ? "0" + n : String(n);
    };
    return (
      d.getFullYear() +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate()) +
      " " +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes())
    );
  }

  function mapApprovalResult(status) {
    if (status === "审批通过") return "通过";
    if (status === "已驳回") return "驳回";
    return status;
  }

  function mapAlarmAuditResult(result) {
    if (result === "审核通过") return "已复核";
    if (result === "审核不通过") return "驳回";
    if (result === "已复核") return "已复核";
    return result;
  }

  function buildDoneRow(todoRow, result, opinion) {
    var time = nowText();
    if (todoRow.tab === "approval") {
      return {
        doneKind: "flight-plan",
        planId: todoRow.planId,
        title: todoRow.title,
        type: "审批",
        source: todoRow.source || "飞行计划",
        user: "王主任",
        time: time,
        result: mapApprovalResult(result),
        opinion: opinion || "",
      };
    }
    return {
      doneKind: "alarm",
      alertId: todoRow.alertId,
      title: todoRow.title,
      type: "告警",
      source: todoRow.source || "地图驾驶舱",
      user: "鲍雄澎",
      time: time,
      result: mapAlarmAuditResult(result),
      workflowStatus: result === "审核通过" ? "已复核" : result,
      opinion: opinion || "",
    };
  }

  function applyToConfigs() {
    var configs = global.WH_WORKBENCH_CONFIGS;
    if (!configs || !configs["wb-todo"] || !configs["wb-done"]) return;
    var state = loadState();
    var todo = configs["wb-todo"];
    var done = configs["wb-done"];

    todo.rows = (todo.rows || []).filter(function (row) {
      return state.removedTitles.indexOf(row.title) < 0;
    });

    todo.rows.forEach(function (row) {
      var patch = state.todoPatches[row.title];
      if (patch) Object.assign(row, patch);
    });

    (state.doneAdds || []).forEach(function (item) {
      var exists = (done.rows || []).some(function (r) {
        return r.title === item.title && r.time === item.time;
      });
      if (!exists) {
        done.rows.unshift(item);
      }
    });
  }

  function removeFromTodoRows(todoRows, title) {
    for (var i = todoRows.length - 1; i >= 0; i--) {
      if (todoRows[i].title === title) todoRows.splice(i, 1);
    }
  }

  function moveTodoRowToDone(todoRow, result, opinion, todoRows) {
    if (!todoRow) return false;
    var state = loadState();
    var doneRow = buildDoneRow(todoRow, result, opinion);

    if (state.removedTitles.indexOf(todoRow.title) < 0) {
      state.removedTitles.push(todoRow.title);
    }
    state.doneAdds = state.doneAdds || [];
    state.doneAdds.unshift(doneRow);
    saveState(state);

    if (Array.isArray(todoRows)) {
      removeFromTodoRows(todoRows, todoRow.title);
    }

    applyToConfigs();
    if (global.WHHeaderBadges && global.WHHeaderBadges.refresh) {
      global.WHHeaderBadges.refresh();
    }
    return true;
  }

  function patchTodoRow(todoRow, patch, todoRows) {
    if (!todoRow || !patch) return;
    Object.assign(todoRow, patch);
    var state = loadState();
    state.todoPatches[todoRow.title] = Object.assign({}, state.todoPatches[todoRow.title] || {}, patch);
    saveState(state);
    if (Array.isArray(todoRows)) {
      todoRows.forEach(function (r) {
        if (r.title === todoRow.title) Object.assign(r, patch);
      });
    }
  }

  function shouldMoveToDone(todoRow, statusOrResult) {
    if (!todoRow) return false;
    if (todoRow.tab === "approval") {
      return statusOrResult === "审批通过" || statusOrResult === "已驳回";
    }
    if (todoRow.tab === "alert") {
      return (
        statusOrResult === "审核通过" ||
        statusOrResult === "审核不通过" ||
        statusOrResult === "已复核"
      );
    }
    return false;
  }

  global.WHTodoFlow = {
    applyToConfigs: applyToConfigs,
    moveTodoRowToDone: moveTodoRowToDone,
    patchTodoRow: patchTodoRow,
    shouldMoveToDone: shouldMoveToDone,
    nowText: nowText,
    resetDemoState: resetDemoState,
    restoreDemoDefaults: restoreDemoDefaults,
  };
})(window);
