/**
 * 移动端人工巡检记录启动
 */
(function (global) {
  "use strict";

  var STORAGE_TASK_DONE = "whmetro-today-task-done";
  var STORAGE_NOTIFY_EXTRA = "whmetro-notify-extra";

  function readQuery() {
    try {
      var params = new URLSearchParams(global.location.search);
      return {
        action: params.get("action") || "",
        source: params.get("source") || "",
        taskId: params.get("taskId") || "",
        project: params.get("project") || "",
        notifyType: params.get("notifyType") || ""
      };
    } catch (e) {
      return { action: "", source: "", taskId: "", project: "", notifyType: "" };
    }
  }

  function resolvePatrolHome(query) {
    if (query && query.source === "today-task") return "today-task.html";
    if (query && query.source === "notify") return "../../mine/pages/notify.html";
    return "../home.html";
  }

  function readJson(key, fallback) { try { var raw = global.localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; } }
  function writeJson(key, value) { try { global.localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }
  function updateNavTitle(text) { var el = global.document.getElementById("manual-nav-title"); if (el) el.textContent = text || "人工巡检记录"; }
  function ensureProjectOption(field, projectName) { if (!field || !projectName) return; var exists = Array.prototype.some.call(field.options || [], function (option) { return option.value === projectName; }); if (!exists) { var option = global.document.createElement("option"); option.value = projectName; option.textContent = projectName; field.appendChild(option); } }
  function lockProjectField(projectName) { if (!projectName) return; var field = global.document.getElementById("f-project"); if (!field) return; ensureProjectOption(field, projectName); field.value = projectName; field.disabled = true; field.setAttribute("data-locked", "true"); }
  function openTodayTaskNewForm(query) { if (query.action !== "new") return; if (!global.WHInManualPage || typeof global.WHInManualPage.showForm !== "function") return; global.WHInManualPage.showForm("new"); setTimeout(function () { lockProjectField(query.project); }, 0); }
  function openNotifyManualDetail(query) {
    if (query.source !== "notify" || query.notifyType !== "manual") return;
    if (!global.WHInManualPage || typeof global.WHInManualPage.getRows !== "function" || typeof global.WHInManualPage.openDetail !== "function") return;
    var rows = global.WHInManualPage.getRows() || [];
    var index = rows.findIndex(function (row) { return row.projectName === query.project; });
    if (index >= 0) {
      global.WHInManualPage.openDetail(index);
    }
  }
  function markTodayTaskDone(taskId) { if (!taskId) return; var doneMap = readJson(STORAGE_TASK_DONE, {}); doneMap[taskId] = true; writeJson(STORAGE_TASK_DONE, doneMap); }
  function formatNow() { var d = new Date(); var y = d.getFullYear(); var m = String(d.getMonth() + 1).padStart(2, "0"); var day = String(d.getDate()).padStart(2, "0"); var h = String(d.getHours()).padStart(2, "0"); var min = String(d.getMinutes()).padStart(2, "0"); return y + "-" + m + "-" + day + " " + h + ":" + min; }
  function projectTypeByName(projectName) { if (projectName === "洪山路至小洪山商业公寓项目") return "重点项目"; return "一般项目"; }
  function pushTaskNotify(projectName, taskId) {
    var rows = readJson(STORAGE_NOTIFY_EXTRA, []);
    var notifyId = taskId ? "task-notify-" + taskId : "task-notify-" + Date.now();
    rows = rows.filter(function (row) { return row.id !== notifyId; });
    rows.unshift({
      id: notifyId,
      title: projectName + " 已提交巡线记录",
      type: "项目巡查",
      time: formatNow(),
      read: "未读",
      source: "今日巡线",
      projectName: projectName,
      projectType: projectTypeByName(projectName),
      patrolDate: formatNow(),
      progress: "已完成人工巡查记录填写",
      result: "已提交"
    });
    writeJson(STORAGE_NOTIFY_EXTRA, rows);
  }

  function bindNavBack(query) {
    global.document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action='mp-nav-back']");
      if (!btn) return;
      var form = global.document.getElementById("manual-form-view");
      var detail = global.document.getElementById("manual-detail-view");
      var list = global.document.getElementById("manual-list-view");
      if (form && !form.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        global.location.href = resolvePatrolHome(query);
        return;
      }
      if (detail && !detail.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (query && query.source === "notify") {
          global.location.href = resolvePatrolHome(query);
          return;
        }
        if (global.WHInManualPage && typeof global.WHInManualPage.showList === "function") {
          global.WHInManualPage.showList();
        }
        return;
      }
      if (list && !list.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        global.location.href = resolvePatrolHome(query);
      }
    });
  }

  function patchViewNav(query) {
    var listEl = global.document.getElementById("manual-list-view");
    var detailEl = global.document.getElementById("manual-detail-view");
    var formEl = global.document.getElementById("manual-form-view");
    if (!listEl) return;
    function sync() {
      if (formEl && !formEl.classList.contains("hidden")) {
        var titleEl = global.document.getElementById("manual-form-title");
        updateNavTitle(titleEl && titleEl.textContent ? titleEl.textContent : "编辑人工巡查记录");
        if (query && query.project) lockProjectField(query.project);
        return;
      }
      if (detailEl && !detailEl.classList.contains("hidden")) {
        var nameEl = global.document.getElementById("detail-manual-title");
        updateNavTitle(nameEl && nameEl.textContent ? nameEl.textContent : "人工巡查详情");
        return;
      }
      updateNavTitle("人工巡检记录");
    }
    [listEl, detailEl, formEl].forEach(function (node) {
      if (!node) return;
      var observer = new MutationObserver(sync);
      observer.observe(node, { attributes: true, attributeFilter: ["class"] });
    });
    global.addEventListener("wh-manual-view-change", sync);
    sync();
  }

  function bindTodayTaskSave(query) {
    global.addEventListener("wh-patrol-form-saved", function (event) {
      var detail = event.detail || {};
      var href = resolvePatrolHome(query);
      if (detail.prefix !== "manual") return;
      if (query.source !== "today-task") return;
      var projectName = (detail.row && detail.row.projectName) || query.project;
      markTodayTaskDone(query.taskId);
      pushTaskNotify(projectName || "项目", query.taskId);
      try {
        if (global.top && global.top.WHHeaderBadges && global.top.WHHeaderBadges.refreshMineHubBadges) {
          global.top.WHHeaderBadges.refreshMineHubBadges();
        }
      } catch (e) {}
      global.setTimeout(function () {
        try {
          if (global.top && global.top !== global && global.top.document) {
            var frame = global.top.document.getElementById("app-frame");
            if (frame) {
              frame.src = "patrol/pages/" + href;
              return;
            }
          }
        } catch (e) {}
        global.location.href = href;
      }, 120);
    });
  }
  function start() {
    var query = readQuery();
    bindNavBack(query);
    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
      global.MiniAppFrame.syncTabbar();
    }
    if (global.WHInManualPage && global.WHInManualPage.boot) {
      global.WHInManualPage.boot({ mobile: true });
    }
    patchViewNav(query);
    bindTodayTaskSave(query);
    setTimeout(function () {
      openTodayTaskNewForm(query);
      openNotifyManualDetail(query);
    }, 0);
  }

  if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded", start); else start();
})(window);