/**
 * 移动端人工巡检记录启动
 */
(function (global) {
  "use strict";

  var STORAGE_TASK_DONE = "whmetro-today-task-done";
  var STORAGE_MANUAL_ROWS = "whmetro-manual-rows";
  var STORAGE_NOTIFY_MANUAL_DETAIL = "whmetro-notify-manual-detail";
  var STORAGE_NOTIFY_EXTRA = "whmetro-notify-extra";

  var TASK_PROJECT_FALLBACK = {
    "新建商业文化设施项目": { taskId: "T-001", line: "8号线", direction: "上行", section: "水果湖-洪山路", station: "洪山路", patrolDate: "2025-06-27", progress: "现场混凝土养护", projectType: "一般项目" },
    "洪山路至小洪山商业公寓项目": { taskId: "T-002", line: "8号线", direction: "下行", section: "洪山路-小洪山", station: "小洪山", patrolDate: "2025-06-27", progress: "现场混凝土养护", projectType: "重点项目" },
    "三金潭车辆段上盖物业综合开发项目": { taskId: "T-003", line: "2号线", direction: "上行", section: "金潭路-宏图大道", station: "宏图大道", patrolDate: "2025-06-27", progress: "现场钢筋绑扎施工", projectType: "一般项目" },
    "中北路地下商业连通道项目": { taskId: "T-004", line: "8号线", direction: "上行", section: "水果湖-洪山路", station: "洪山路", patrolDate: "2025-06-27", progress: "围护结构施工准备", projectType: "一般项目" },
    "东亭停车场附属配套工程": { taskId: "T-005", line: "7号线", direction: "下行", section: "洪山路-小洪山", station: "小洪山", patrolDate: "2025-06-27", progress: "基坑支护监测中", projectType: "重点项目" },
    "楚河汉街区间市政接驳改造项目": { taskId: "T-006", line: "8号线", direction: "上行", section: "水果湖-洪山路", station: "洪山路", patrolDate: "2025-06-27", progress: "临边围挡加固施工", projectType: "一般项目" },
    "金融街六中北项目": { taskId: "T-007", line: "2号线", direction: "上行", section: "中南路-宝通寺", station: "中南路", patrolDate: "2025-06-27", progress: "基坑降水与支护施工", projectType: "重点项目" },
    "光谷广场综合体基坑项目": { taskId: "T-008", line: "2号线", direction: "下行", section: "光谷广场-杨家湾", station: "光谷广场", patrolDate: "2025-06-27", progress: "土方开挖与栈桥搭设", projectType: "一般项目" },
    "武昌滨江总部基地项目": { taskId: "T-009", line: "7号线", direction: "上行", section: "徐家棚-湖北大学", station: "徐家棚", patrolDate: "2025-06-27", progress: "桩基施工与泥浆外运", projectType: "重点项目" },
    "后湖大道市政管廊项目": { taskId: "T-010", line: "3号线", direction: "下行", section: "后湖大道-兴业路", station: "后湖大道", patrolDate: "2025-06-27", progress: "管廊顶板浇筑养护", projectType: "一般项目" },
    "街道口站联络通道工程": { taskId: "T-011", line: "8号线", direction: "下行", section: "街道口-马房山", station: "街道口", patrolDate: "2025-06-27", progress: "联络通道开挖支护", projectType: "一般项目" },
    "青山区徐东应急点配套施工": { taskId: "T-012", line: "4号线", direction: "上行", section: "岳家嘴-铁机路", station: "岳家嘴", patrolDate: "2025-06-27", progress: "临建拆除与场地平整", projectType: "重点项目" }
  };

  function readQuery() {
    try {
      var params = new URLSearchParams(global.location.search);
      return {
        action: params.get("action") || "",
        source: params.get("source") || "",
        taskId: params.get("taskId") || "",
        manualId: params.get("manualId") || "",
        project: params.get("project") || "",
        notifyType: params.get("notifyType") || "",
        fromNotifyDetail: params.get("fromNotifyDetail") || "",
        notifyId: params.get("notifyId") || "",
        line: params.get("line") || "",
        direction: params.get("direction") || "",
        section: params.get("section") || "",
        station: params.get("station") || "",
        patrolDate: params.get("patrolDate") || ""
      };
    } catch (e) {
      return { action: "", source: "", taskId: "", manualId: "", project: "", notifyType: "", fromNotifyDetail: "", notifyId: "", line: "", direction: "", section: "", station: "", patrolDate: "" };
    }
  }

  function resolvePatrolHome(query) {
    if (query && query.source === "today-task") return "today-task.html";
    if (query && query.fromNotifyDetail && query.notifyId) return "../../mine/pages/notify.html?openDetail=1&notifyId=" + encodeURIComponent(query.notifyId);
    if (query && query.source === "notify") return "../../mine/pages/notify.html";
    return "../home.html";
  }

  function readJson(key, fallback) { try { var raw = global.localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; } }
  function writeJson(key, value) { try { global.localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }
  function updateNavTitle(text) { var el = global.document.getElementById("manual-nav-title"); if (el) el.textContent = text || "人工巡检记录"; }
  function ensureSelectOption(field, value) {
    if (!field || !value) return;
    var exists = Array.prototype.some.call(field.options || [], function (option) { return option.value === value; });
    if (!exists) {
      var option = global.document.createElement("option");
      option.value = value;
      option.textContent = value;
      field.appendChild(option);
    }
  }
  function syncPickerTextFor(id) {
    var field = global.document.getElementById(id);
    if (!field) return;
    if (global.WHProjectMobile && typeof global.WHProjectMobile.syncPickersFromForm === "function") {
      global.WHProjectMobile.syncPickersFromForm(field.closest("#manual-form-view") || global.document);
    }
  }
  function lockField(id, value, isSelect) {
    if (!value) return;
    var field = global.document.getElementById(id);
    if (!field) return;
    if (isSelect) {
      ensureSelectOption(field, value);
      field.value = value;
      syncPickerTextFor(id);
    } else {
      field.value = value;
    }
    field.disabled = true;
    field.setAttribute("data-locked", "true");
    var btn = global.document.querySelector('[data-dynamic-select="' + id + '"]');
    if (btn) {
      btn.disabled = true;
      btn.setAttribute("data-locked", "true");
    }
  }
  function lockProjectField(projectName) { lockField("f-project", projectName, true); }
  function toDatetimeLocal(value) {
    if (!value) return "";
    var s = String(value).trim().replace(" ", "T");
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += "T00:00";
    return s;
  }
  function lockTodayTaskFields(query) {
    lockField("f-line", query.line, true);
    lockField("f-direction", query.direction, true);
    lockField("f-section", query.section, true);
    lockField("f-station", query.station, true);
    lockField("f-project", query.project, true);
    lockField("f-patrol-date", toDatetimeLocal(query.patrolDate), false);
  }
  function openTodayTaskNewForm(query) {
    if (query.action !== "new") return;
    if (!global.WHInManualPage || typeof global.WHInManualPage.showForm !== "function") return;
    global.WHInManualPage.showForm("new");
    setTimeout(function () { lockTodayTaskFields(query); }, 0);
  }
  function projectNameOf(row) {
    return String((row && (row.projectName || row.title || row.name)) || "").trim();
  }
  function projectNamesMatch(a, b) {
    return projectNameOf({ projectName: a }) === projectNameOf({ projectName: b });
  }
  function readCachedNotifyProject(query) {
    try {
      var raw = global.sessionStorage.getItem(STORAGE_NOTIFY_MANUAL_DETAIL);
      if (!raw) return null;
      var row = JSON.parse(raw);
      if (query.manualId && String(row.id || "") === String(query.manualId)) return row;
      if (query.taskId && String(row.taskId || "") === String(query.taskId)) return row;
      if (query.project && projectNamesMatch(row.projectName || row.title, query.project)) return row;
    } catch (e) {}
    return null;
  }
  function clearCachedNotifyProject() {
    try { global.sessionStorage.removeItem(STORAGE_NOTIFY_MANUAL_DETAIL); } catch (e) {}
  }
  function findProjectInNotifyExtras(query) {
    var extras = readJson(STORAGE_NOTIFY_EXTRA, []);
    var i;
    var j;
    for (i = 0; i < extras.length; i += 1) {
      var notify = extras[i];
      if (!Array.isArray(notify.projects)) continue;
      for (j = 0; j < notify.projects.length; j += 1) {
        var proj = notify.projects[j];
        if (query.manualId && String(proj.id || "") === String(query.manualId)) return proj;
        if (query.taskId && String(proj.taskId || "") === String(query.taskId)) return proj;
        if (query.project && projectNamesMatch(proj.projectName || proj.title, query.project)) return proj;
      }
    }
    return null;
  }
  function buildFallbackNotifyRow(query) {
    var name = String(query.project || "").trim();
    if (!name) return null;
    var meta = TASK_PROJECT_FALLBACK[name] || {};
    return normalizeManualDetailRow(Object.assign({
      projectName: name,
      taskId: query.taskId || meta.taskId || "",
      line: query.line || meta.line || "",
      direction: query.direction || meta.direction || "",
      section: query.section || meta.section || "",
      station: query.station || meta.station || "",
      patrolDate: query.patrolDate || meta.patrolDate || "",
      progress: meta.progress || "已完成巡查",
      remark: meta.remark || "",
      user: "李明"
    }, meta));
  }
  function normalizeManualDetailRow(row) {
    if (!row) return null;
    var next = Object.assign({}, row);
    if (!next.id) {
      var nextId = global.WH_MANUAL_NEXT_ID || 122821;
      next.id = String(nextId);
      global.WH_MANUAL_NEXT_ID = nextId + 1;
    }
    if (!next.user) next.user = "李明";
    if (!next.patrolDate) next.patrolDate = next.savedAt || formatNow();
    if (!next.updatedAt) next.updatedAt = next.savedAt || next.patrolDate || formatNow();
    if (!next.projectType) next.projectType = projectTypeByName(next.projectName);
    if (!next.logs) {
      next.logs = [{ action: "新增人工巡检", user: next.user, time: next.updatedAt }];
    }
    return next;
  }
  function findNotifyManualRow(query) {
    var cached = readCachedNotifyProject(query);
    if (cached) return normalizeManualDetailRow(cached);

    var manualRows = readManualRows();
    var matches = manualRows.filter(function (row) {
      if (query.manualId && String(row.id || "") === String(query.manualId)) return true;
      if (query.taskId && String(row.taskId || "") === String(query.taskId)) return true;
      if (query.project && projectNamesMatch(row.projectName || row.title, query.project)) return true;
      return false;
    });
    if (matches.length) {
      matches.sort(function (a, b) {
        return String(b.savedAt || "").localeCompare(String(a.savedAt || ""));
      });
      return normalizeManualDetailRow(matches[0]);
    }

    var notifyProject = findProjectInNotifyExtras(query);
    if (notifyProject) return normalizeManualDetailRow(notifyProject);

    if (global.WHInManualPage && typeof global.WHInManualPage.getRows === "function") {
      var seedRows = global.WHInManualPage.getRows() || [];
      for (var i = 0; i < seedRows.length; i += 1) {
        if (query.manualId && String(seedRows[i].id) === String(query.manualId)) return seedRows[i];
        if (query.project && projectNamesMatch(seedRows[i].projectName, query.project)) return seedRows[i];
      }
    }

    return buildFallbackNotifyRow(query);
  }
  function openNotifyManualDetail(query) {
    if (query.source !== "notify" || query.notifyType !== "manual") return;
    var row = findNotifyManualRow(query);
    if (!row) return;
    clearCachedNotifyProject();
    function openDetail() {
      if (global.WHInManualPage && typeof global.WHInManualPage.openDetailByRow === "function") {
        global.WHInManualPage.openDetailByRow(row);
        return true;
      }
      if (global.WHInManualPage && typeof global.WHInManualPage.openDetail === "function") {
        var rows = global.WHInManualPage.getRows() || [];
        var index = rows.findIndex(function (item) {
          return String(item.id) === String(row.id) || projectNamesMatch(item.projectName, row.projectName);
        });
        if (index >= 0) {
          global.WHInManualPage.openDetail(index);
          return true;
        }
      }
      return false;
    }
    if (!openDetail()) {
      setTimeout(function () {
        openDetail();
      }, 120);
    }
  }
  function gatherTodayTaskRecords(query) {
    var manualRows = readManualRows();
    var matches = manualRows.filter(function (row) {
      if (query.taskId && String(row.taskId || "") === String(query.taskId)) return true;
      if (query.project && projectNamesMatch(row.projectName || row.title, query.project)) return true;
      return false;
    });
    matches.sort(function (a, b) {
      return String(b.savedAt || "").localeCompare(String(a.savedAt || ""));
    });
    if (matches.length) {
      return matches.map(function (row) { return normalizeManualDetailRow(row); });
    }
    var base = buildFallbackNotifyRow(query);
    if (!base) return [];
    var second = normalizeManualDetailRow(Object.assign({}, base, {
      savedAt: (query.patrolDate || base.patrolDate) + " 10:19",
      patrolDate: query.patrolDate || base.patrolDate
    }));
    base.savedAt = (query.patrolDate || base.patrolDate) + " 12:07";
    return [base, second];
  }
  function openTodayTaskDetail(query) {
    if (query.source !== "today-task" || query.action !== "detail") return;
    var records = gatherTodayTaskRecords(query);
    if (!records.length) return;
    var row = records[0];
    if (records.length > 1) row.records = records;
    function openDetail() {
      if (global.WHInManualPage && typeof global.WHInManualPage.openDetailByRow === "function") {
        global.WHInManualPage.openDetailByRow(row);
        return true;
      }
      if (global.WHInManualPage && typeof global.WHInManualPage.openDetail === "function") {
        var rows = global.WHInManualPage.getRows() || [];
        var index = rows.findIndex(function (item) {
          return String(item.id) === String(row.id) || projectNamesMatch(item.projectName, row.projectName);
        });
        if (index >= 0) {
          global.WHInManualPage.openDetail(index);
          return true;
        }
      }
      return false;
    }
    if (!openDetail()) {
      setTimeout(function () { openDetail(); }, 120);
    }
  }
  function markTodayTaskDone(taskId) {
    if (!taskId) return;
    var doneMap = readJson(STORAGE_TASK_DONE, {});
    doneMap[taskId] = todayStr();
    writeJson(STORAGE_TASK_DONE, doneMap);
  }
  function todayStr() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function readNotifyExtras() { return readJson(STORAGE_NOTIFY_EXTRA, []); }
  function writeNotifyExtras(rows) { writeJson(STORAGE_NOTIFY_EXTRA, rows); }
  function refreshNotifyBadges() {
    try {
      if (global.top && global.top.WHHeaderBadges && global.top.WHHeaderBadges.refreshMineHubBadges) {
        global.top.WHHeaderBadges.refreshMineHubBadges();
      }
      if (global.top && global.top.WHHeaderBadges && global.top.WHHeaderBadges.refresh) {
        global.top.WHHeaderBadges.refresh();
      }
    } catch (e) {}
  }
  function purgeInstantTodayTaskNotifies() {
    try {
      var extras = readNotifyExtras();
      var cleaned = extras.filter(function (row) {
        if (row.type !== "项目巡查") return true;
        if (row.source === "今日巡线" && !Array.isArray(row.projects)) return false;
        return true;
      });
      if (cleaned.length !== extras.length) {
        writeNotifyExtras(cleaned);
      }
    } catch (e) {}
  }
  function createManualPatrolNotify(record) {
    if (!record || !record.projectName || record.taskId) return;
    var today = todayStr();
    var user = record.user || "李明";
    if (user === "当前用户") user = "李明";
    var project = Object.assign({}, record, { projectName: record.projectName });
    var extras = readNotifyExtras();
    extras.unshift({
      id: "manual-notify-" + Date.now(),
      title: today + " " + user + " 已完成以下项目的巡查",
      type: "项目巡查",
      time: formatNow(),
      read: "未读",
      source: "人工巡检",
      projects: [project]
    });
    writeNotifyExtras(extras);
    refreshNotifyBadges();
  }
  function formatNow() { var d = new Date(); var y = d.getFullYear(); var m = String(d.getMonth() + 1).padStart(2, "0"); var day = String(d.getDate()).padStart(2, "0"); var h = String(d.getHours()).padStart(2, "0"); var min = String(d.getMinutes()).padStart(2, "0"); return y + "-" + m + "-" + day + " " + h + ":" + min; }
  function projectTypeByName(projectName) { var meta = TASK_PROJECT_FALLBACK[projectName]; if (meta && meta.projectType) return meta.projectType; if (projectName === "洪山路至小洪山商业公寓项目") return "重点项目"; return "一般项目"; }
  function readManualRows() { return readJson(STORAGE_MANUAL_ROWS, []); }
  function writeManualRows(rows) { writeJson(STORAGE_MANUAL_ROWS, rows); }
  function saveManualRow(row, taskId) {
    var rows = readManualRows();
    var record = Object.assign({}, row);
    record.taskId = taskId || row.taskId || "";
    record.projectType = projectTypeByName(record.projectName);
    record.source = record.taskId ? "今日巡线" : "人工巡检";
    record.updatedAt = record.updatedAt || formatNow();
    record.savedAt = formatNow();
    if (!record.user) record.user = "李明";
    if (!record.id) {
      var nextId = global.WH_MANUAL_NEXT_ID || 122821;
      record.id = String(nextId);
      global.WH_MANUAL_NEXT_ID = nextId + 1;
    }
    var idx = rows.findIndex(function (r) { return r.id === record.id; });
    if (idx >= 0) rows[idx] = record;
    else rows.unshift(record);
    writeManualRows(rows);
    return record;
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
        if (query && (query.source === "notify" || query.source === "today-task" || query.fromNotifyDetail)) {
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
        if (query && query.source === "today-task") lockTodayTaskFields(query);
        return;
      }
      if (detailEl && !detailEl.classList.contains("hidden")) {
        var nameEl = global.document.getElementById("detail-manual-title");
        updateNavTitle(nameEl && nameEl.textContent ? nameEl.textContent : "人工巡查详情");
        return;
      }
      updateNavTitle("人工巡查记录");
    }
    [listEl, detailEl, formEl].forEach(function (node) {
      if (!node) return;
      var observer = new MutationObserver(sync);
      observer.observe(node, { attributes: true, attributeFilter: ["class"] });
    });
    global.addEventListener("wh-manual-view-change", sync);
    sync();
  }

  function onManualPatrolSaved(row, isEditing) {
    try {
      var query = readQuery();
      var projectName = (row && row.projectName) || query.project;
      var taskId = query.source === "today-task" ? query.taskId : "";
      if (query.source === "today-task") {
        markTodayTaskDone(query.taskId);
        purgeInstantTodayTaskNotifies();
      }
      var saved = saveManualRow(row || { projectName: projectName }, taskId);
      if (!isEditing && query.source !== "today-task" && query.source !== "notify") {
        createManualPatrolNotify(saved);
        refreshNotifyBadges();
      }
      if (query.source === "today-task") {
        var href = resolvePatrolHome(query);
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
      }
    } catch (err) {
      try {
        var logs = readJson("whmetro-manual-boot-errors", []);
        logs.push({ time: formatNow(), message: String(err && err.message || err) });
        global.localStorage.setItem("whmetro-manual-boot-errors", JSON.stringify(logs.slice(-10)));
      } catch (e) {}
    }
  }

  function bindPatrolFormSave(query) {
    global.addEventListener("wh-patrol-form-saved", function (event) {
      try {
        var detail = event.detail || {};
        if (detail.prefix !== "manual") return;
        onManualPatrolSaved(detail.row, detail.editing);
      } catch (err) {
        try {
          var logs = readJson("whmetro-manual-boot-errors", []);
          logs.push({ time: formatNow(), message: String(err && err.message || err) });
          global.localStorage.setItem("whmetro-manual-boot-errors", JSON.stringify(logs.slice(-10)));
        } catch (e) {}
      }
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
    bindPatrolFormSave(query);
    setTimeout(function () {
      openTodayTaskNewForm(query);
      openNotifyManualDetail(query);
      openTodayTaskDetail(query);
    }, 180);
  }

  if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded", start); else start();
})(window);