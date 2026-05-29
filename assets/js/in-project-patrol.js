/**
 * 项目巡查 — 人工 / 无人机 / 全时全域告警统一列表
 */
(function (global) {
  var TYPE_MANUAL = "人工巡查";
  var TYPE_UAV = "无人机巡查";
  var TYPE_ALERT = "全时全域告警";
  var DEMO_PROJECT = "八一路102号水表改迁";

  var ALL_ROWS = [
    {
      id: "M-122820",
      patrolType: TYPE_MANUAL,
      projectName: DEMO_PROJECT,
      progress: "负二层消防泵房施工，负一层通风安装作业同步推进，现场文明施工情况正常。",
      updatedAt: "2026-03-05 12:07",
      operator: "李玲",
      line: "8号线",
      direction: "下行",
      section: "洪山路~小洪山",
      station: "小洪山",
      patrolDate: "2026-03-05 12:19",
      remark: "",
      logs: [
        { action: "新增人工巡查", user: "鲍雄澎", time: "2026-05-12 14:40:31" },
        { action: "工班确认", user: "工班长", time: "2026-05-12 15:02:10" },
      ],
    },
    {
      id: "FL20251225001",
      patrolType: TYPE_UAV,
      projectName: DEMO_PROJECT,
      progress: "—",
      updatedAt: "2025-12-25 18:15",
      operator: "张三",
      uav: {
        taskId: "FL20251225001",
        planId: 1,
        planName: "8号线车辆段常规巡检",
        route: "车辆段日常巡查航线",
        airport: "车辆段机场",
        deviceName: "车辆段无人机 M350",
        taskType: "自动执行计划/临时任务",
        line: "8号线",
        takeoff: "2025-12-25 10:00",
        landing: "2025-12-25 18:15",
        operator: "张三",
      },
    },
    {
      id: "AL-201",
      patrolType: TYPE_ALERT,
      projectName: DEMO_PROJECT,
      progress: "—",
      updatedAt: "2026-03-05 08:14:49",
      operator: "—",
      alertId: 201,
    },
  ];

  var filters = { type: "", timeStart: "", timeEnd: "", operator: "" };
  var pendingConfirm = null;
  var editingManualId = null;

  function pm$(id) {
    return document.getElementById(id);
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function getQueryProject() {
    try {
      return new URLSearchParams(location.search).get("project") || "";
    } catch (e) {
      return "";
    }
  }

  function toast(msg) {
    var el = document.getElementById("patrol-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      el.classList.remove("show");
    }, 1800);
  }

  function parseTime(s) {
    if (!s) return null;
    var d = new Date(String(s).replace(/-/g, "/"));
    return isNaN(d.getTime()) ? null : d;
  }

  function activeProject() {
    return (getQueryProject() || DEMO_PROJECT).trim();
  }

  function findSourceRow(row) {
    if (!row) return null;
    for (var i = 0; i < ALL_ROWS.length; i++) {
      if (ALL_ROWS[i].id === row.id) return ALL_ROWS[i];
    }
    return null;
  }

  function scopedRows() {
    var project = activeProject();
    return ALL_ROWS.map(function (row) {
      return Object.assign({}, row, { projectName: project });
    });
  }

  function rowMatches(row) {
    if (filters.type && row.patrolType !== filters.type) return false;
    if (filters.operator && String(row.operator).indexOf(filters.operator) < 0) return false;
    var t = parseTime(row.updatedAt);
    if (filters.timeStart) {
      var s = parseTime(filters.timeStart);
      if (s && t && t < s) return false;
    }
    if (filters.timeEnd) {
      var e = parseTime(filters.timeEnd);
      if (e && t && t > e) return false;
    }
    return true;
  }

  function filteredRows() {
    return scopedRows().filter(rowMatches);
  }

  function updateStats(rows) {
    var set = function (id, n) {
      var el = document.getElementById(id);
      if (el) el.textContent = String(n);
    };
    set("stat-total", rows.length);
    set(
      "stat-manual",
      rows.filter(function (r) {
        return r.patrolType === TYPE_MANUAL;
      }).length
    );
    set(
      "stat-uav",
      rows.filter(function (r) {
        return r.patrolType === TYPE_UAV;
      }).length
    );
    set(
      "stat-alert",
      rows.filter(function (r) {
        return r.patrolType === TYPE_ALERT;
      }).length
    );
    set("table-total", rows.length);
  }

  function typeBadge(type) {
    var cls = "patrol-type-tag";
    if (type === TYPE_UAV) cls += " patrol-type-tag--uav";
    else if (type === TYPE_ALERT) cls += " patrol-type-tag--alert";
    return '<span class="' + cls + '">' + esc(type) + "</span>";
  }

  function mediaCell(row, kind) {
    if (global.WHPatrolMediaGallery) {
      return WHPatrolMediaGallery.renderCell({
        kind: kind,
        projectName: row.projectName,
        rowKey: row.id,
        previewCount: kind === "photo" ? 2 : 1,
      });
    }
    return '<span class="text-slate-500">—</span>';
  }

  function manualActions(index) {
    return (
      '<span class="row-action text-sky-300" data-action="manual-edit" data-index="' +
      index +
      '"><i class="fa-regular fa-pen-to-square"></i>编辑</span>' +
      '<span class="row-action text-cyan-300" data-action="manual-confirm" data-index="' +
      index +
      '"><i class="fa-regular fa-circle-check"></i>工班确认</span>' +
      '<span class="row-action text-rose-300" data-action="manual-reject" data-index="' +
      index +
      '"><i class="fa-regular fa-circle-xmark"></i>拒绝</span>' +
      '<span class="row-action text-rose-300" data-action="manual-delete" data-index="' +
      index +
      '"><i class="fa-regular fa-trash-can"></i>删除</span>' +
      '<span class="row-action text-sky-300" data-action="manual-logs" data-index="' +
      index +
      '"><i class="fa-regular fa-clock"></i>操作记录</span>'
    );
  }

  function uavActions(row) {
    var id = row.uav && row.uav.taskId ? row.uav.taskId : row.id;
    return (
      '<span class="row-action text-sky-300" data-action="uav-view" data-task="' +
      esc(id) +
      '"><i class="fa-regular fa-file-lines"></i>查看报告</span>' +
      '<span class="row-action text-cyan-300" data-action="uav-download" data-task="' +
      esc(id) +
      '"><i class="fa-solid fa-download"></i>下载报告</span>'
    );
  }

  function alertActions(index) {
    return (
      '<span class="row-action text-sky-300" data-action="alert-detail" data-index="' +
      index +
      '"><i class="fa-regular fa-eye"></i>查看详情</span>'
    );
  }

  function openPatrolRow(row) {
    if (!row) return;
    if (row.patrolType === TYPE_MANUAL) {
      openManualEdit(row);
      return;
    }
    if (row.patrolType === TYPE_UAV) {
      var plan = planFromUav(row.uav);
      if (!plan || !global.WHFlightReportModal) {
        toast("暂无飞行报告数据");
        return;
      }
      WHFlightReportModal.open(plan, { editable: false });
      return;
    }
    openAlertDetail(row);
  }

  function renderActions(row, index) {
    var html = "";
    if (row.patrolType === TYPE_MANUAL) html = manualActions(index);
    else if (row.patrolType === TYPE_UAV) html = uavActions(row);
    else html = alertActions(index);
    return '<div class="disease-op-actions">' + html + "</div>";
  }

  function renderTable() {
    var tbody = document.getElementById("patrol-tbody");
    if (!tbody) return;
    var rows = filteredRows();
    updateStats(rows);
    if (!rows.length) {
      tbody.innerHTML =
        '<tr><td colspan="8" class="px-3 py-8 text-center text-slate-400">暂无巡查记录</td></tr>';
      return;
    }
    tbody.innerHTML = rows
      .map(function (row, index) {
        return (
          '<tr class="wh-row-open ' +
          (index % 2 ? "bg-slate-900/35" : "bg-slate-950/25") +
          '" data-row-index="' +
          index +
          '">' +
          '<td class="px-3 text-slate-100/95">' +
          esc(row.projectName) +
          "</td>" +
          '<td class="px-3">' +
          typeBadge(row.patrolType) +
          "</td>" +
          '<td class="px-3 text-slate-100/95 max-w-[240px] truncate" title="' +
          esc(row.progress) +
          '">' +
          esc(row.progress) +
          "</td>" +
          '<td class="px-3">' +
          mediaCell(row, "photo") +
          "</td>" +
          '<td class="px-3">' +
          mediaCell(row, "video") +
          "</td>" +
          '<td class="px-3 text-slate-100/95 whitespace-nowrap">' +
          esc(row.updatedAt) +
          "</td>" +
          '<td class="px-3 text-slate-100/95">' +
          esc(row.operator) +
          "</td>" +
          '<td class="px-3 disease-col-actions">' +
          renderActions(row, index) +
          "</td></tr>"
        );
      })
      .join("");
  }

  function planFromUav(uav) {
    if (!uav) return null;
    return {
      id: uav.planId,
      taskId: uav.taskId,
      name: uav.planName,
      route: uav.route,
      airport: uav.airport,
      drone: uav.deviceName,
      type: uav.taskType,
      line: uav.line,
      applicant: uav.operator,
      actualStart: uav.takeoff,
      actualEnd: uav.landing,
      audit: "审核通过",
    };
  }

  function resolveAlertItem(row) {
    if (!row) return null;
    if (global.WHMapAlerts && row.alertId != null) {
      var base = WHMapAlerts.findProject(row.alertId);
      if (base) {
        return Object.assign({}, base, {
          projectName: row.projectName || base.projectName,
          source: base.source || "AI",
          handleMode: base.handleMode || "AI",
        });
      }
    }
    if (row.alert) return row.alert;
    return null;
  }

  function openAlertDetail(row) {
    var item = resolveAlertItem(row);
    if (!item) {
      toast("暂无告警详情数据");
      return;
    }
    if (global.WHMapAlerts && WHMapAlerts.openDetail(item)) return;
    toast("告警详情组件未加载");
  }

  function openManualEdit(row) {
    var source = findSourceRow(row);
    if (!source) return;
    editingManualId = source.id;
    var mask = document.getElementById("patrol-manual-form-mask");
    if (!mask) {
      toast("编辑弹窗未加载");
      return;
    }
    loadManualForm(source);
    mask.classList.add("show");
  }

  function loadManualForm(row) {
    var displayId = String(row.id || "").replace(/^M-/, "");
    if (pm$("pm-f-id")) pm$("pm-f-id").value = displayId;
    if (pm$("pm-f-line")) pm$("pm-f-line").value = row.line || "";
    if (pm$("pm-f-direction")) pm$("pm-f-direction").value = row.direction || "";
    if (pm$("pm-f-section")) pm$("pm-f-section").value = row.section || "";
    if (pm$("pm-f-station")) pm$("pm-f-station").value = row.station || "";
    if (pm$("pm-f-project")) pm$("pm-f-project").value = row.projectName || activeProject();
    if (pm$("pm-f-patrol-date")) pm$("pm-f-patrol-date").value = row.patrolDate || "";
    if (pm$("pm-f-progress")) pm$("pm-f-progress").value = row.progress || "";
    if (pm$("pm-f-remark")) pm$("pm-f-remark").value = row.remark || "";
    if (pm$("pm-f-photo-list")) pm$("pm-f-photo-list").textContent = "暂无上传";
    if (pm$("pm-f-video-list")) pm$("pm-f-video-list").textContent = "暂无上传";
    var title = document.getElementById("patrol-manual-form-title");
    if (title) title.textContent = "编辑人工巡查记录";
  }

  function saveManualForm() {
    var row = findSourceRow({ id: editingManualId });
    if (!row) return closeManualEdit();
    if (!pm$("pm-f-line").value) return alert("请选择所属线路");
    if (!pm$("pm-f-direction").value) return alert("请选择上下行");
    if (!pm$("pm-f-project").value) return alert("请选择所在项目");
    if (!pm$("pm-f-patrol-date").value.trim()) return alert("请填写巡查日期");
    if (!pm$("pm-f-progress").value.trim()) return alert("请填写项目进展");
    var now = "2026-05-12 18:30";
    row.line = pm$("pm-f-line").value;
    row.direction = pm$("pm-f-direction").value;
    row.section = pm$("pm-f-section").value;
    row.station = pm$("pm-f-station").value;
    row.projectName = pm$("pm-f-project").value;
    row.patrolDate = pm$("pm-f-patrol-date").value.trim();
    row.progress = pm$("pm-f-progress").value.trim();
    row.remark = pm$("pm-f-remark").value.trim();
    row.updatedAt = now;
    row.logs = row.logs || [];
    row.logs.unshift({ action: "编辑人工巡查", user: "当前用户", time: now });
    closeManualEdit();
    renderTable();
    toast("已保存");
  }

  function closeManualEdit() {
    editingManualId = null;
    var mask = document.getElementById("patrol-manual-form-mask");
    if (mask) mask.classList.remove("show");
  }

  function bindManualUploadPreview(inputId, listId, label) {
    var input = pm$(inputId);
    var list = pm$(listId);
    if (!input || !list) return;
    input.addEventListener("change", function () {
      var files = input.files ? Array.prototype.slice.call(input.files) : [];
      list.textContent = files.length
        ? files
            .map(function (f) {
              return f.name;
            })
            .join("、")
        : "暂无上传";
      if (files.length && label) toast("已选择 " + files.length + " 个" + label);
    });
  }

  function openRecordLogs(row) {
    var mask = document.getElementById("patrol-record-mask");
    var body = document.getElementById("patrol-record-body");
    if (!mask || !body) return;
    var logs = row.logs || [];
    if (global.ProjectOperationLog) {
      body.innerHTML = ProjectOperationLog.renderTimelineHtml(logs);
    } else {
      body.innerHTML = logs.length
        ? logs
            .map(function (log) {
              return (
                '<div class="record-item"><p class="record-item__title">' +
                esc(log.action) +
                '</p><p class="record-item__meta">日期：' +
                esc(log.time) +
                '</p><p class="record-item__meta">操作者：' +
                esc(log.user) +
                "</p></div>"
              );
            })
            .join("")
        : '<div class="record-empty">暂无操作记录</div>';
    }
    mask.classList.add("show");
  }

  function openConfirm(kind, index, trigger) {
    pendingConfirm = { kind: kind, index: index };
    var pop = document.getElementById("patrol-confirm-pop");
    var text = document.getElementById("patrol-confirm-text");
    var icon = document.getElementById("patrol-confirm-icon");
    if (!pop || !text) return;
    text.textContent = kind === "confirm" ? "确定通过？" : "确定拒绝？";
    if (icon) icon.className = "fa-solid fa-star " + (kind === "confirm" ? "text-amber-400" : "text-red-400");
    var rect = trigger.getBoundingClientRect();
    pop.style.left = Math.max(16, rect.left + rect.width / 2 - 66) + "px";
    pop.style.top = Math.max(16, rect.top - 92) + "px";
    pop.classList.remove("hidden");
  }

  function applyConfirm() {
    if (!pendingConfirm) return;
    var kind = pendingConfirm.kind;
    var rows = filteredRows();
    var row = findSourceRow(rows[pendingConfirm.index]);
    if (!row) return;
    var now = "2026-05-12 18:30";
    row.logs = row.logs || [];
    row.logs.unshift({
      action: kind === "confirm" ? "工班确认" : "工班拒绝",
      user: "工班长",
      time: now,
    });
    row.updatedAt = now;
    pendingConfirm = null;
    document.getElementById("patrol-confirm-pop").classList.add("hidden");
    renderTable();
    toast(kind === "confirm" ? "工班已确认" : "工班已拒绝");
  }

  function readFiltersFromForm() {
    var t = document.getElementById("filter-type");
    var ts = document.getElementById("filter-time-start");
    var te = document.getElementById("filter-time-end");
    var o = document.getElementById("filter-operator");
    filters.type = t ? t.value : "";
    filters.timeStart = ts ? ts.value : "";
    filters.timeEnd = te ? te.value : "";
    filters.operator = o ? o.value.trim() : "";
  }

  function applyQueryProject() {}

  function resetFilters() {
    filters = { type: "", timeStart: "", timeEnd: "", operator: "" };
    var t = document.getElementById("filter-type");
    var ts = document.getElementById("filter-time-start");
    var te = document.getElementById("filter-time-end");
    var o = document.getElementById("filter-operator");
    if (t) t.value = "";
    if (ts) ts.value = "";
    if (te) te.value = "";
    if (o) o.value = "";
    renderTable();
  }

  function initQuickLinks() {
    document.querySelectorAll(".disease-quick-link[data-quick-href]").forEach(function (a) {
      var href = a.getAttribute("data-quick-href");
      if (href && typeof whPageHref === "function") a.setAttribute("href", whPageHref(href));
    });
  }

  function bindEvents() {
    var searchBtn = document.getElementById("filter-search");
    var resetBtn = document.getElementById("filter-reset");
    var tbody = document.getElementById("patrol-tbody");
    if (searchBtn) {
      searchBtn.addEventListener("click", function () {
        readFiltersFromForm();
        renderTable();
      });
    }
    if (resetBtn) resetBtn.addEventListener("click", resetFilters);
    if (!tbody) return;

    tbody.addEventListener("click", function (e) {
      if (e.target.closest("[data-action], input, button, a, label, .disease-col-actions")) return;
      var tr = e.target.closest("tr[data-row-index]");
      if (!tr) return;
      var index = Number(tr.getAttribute("data-row-index"));
      var rows = filteredRows();
      var row = rows[index];
      if (row) openPatrolRow(row);
    });

    tbody.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action]");
      if (!btn) return;
      var action = btn.getAttribute("data-action");
      var rows = filteredRows();
      var index = Number(btn.getAttribute("data-index"));
      var row = rows[index];

      if (action === "manual-edit" && row) {
        openManualEdit(row);
        return;
      }
      if ((action === "manual-confirm" || action === "manual-reject") && row) {
        openConfirm(action === "manual-confirm" ? "confirm" : "reject", index, btn);
        return;
      }
      if (action === "manual-delete" && row) {
        var source = findSourceRow(row);
        var idx = source ? ALL_ROWS.indexOf(source) : -1;
        if (idx >= 0 && confirm("确认删除该巡查记录？")) {
          ALL_ROWS.splice(idx, 1);
          renderTable();
          toast("已删除");
        }
        return;
      }
      if (action === "manual-logs" && row) {
        openRecordLogs(row);
        return;
      }
      if (action === "uav-view" || action === "uav-download") {
        var taskId = btn.getAttribute("data-task");
        var uavRow = ALL_ROWS.filter(function (r) {
          return r.patrolType === TYPE_UAV && ((r.uav && r.uav.taskId === taskId) || r.id === taskId);
        })[0];
        var plan = planFromUav(uavRow && uavRow.uav);
        if (!plan || !global.WHFlightReportModal) {
          toast("暂无飞行报告数据");
          return;
        }
        if (action === "uav-view") WHFlightReportModal.open(plan, { editable: false });
        else WHFlightReportModal.exportReport(plan);
        return;
      }
      if (action === "alert-detail" && row) {
        openAlertDetail(row);
      }
    });

    if (global.WHTableRowClick) WHTableRowClick.injectStyles();

    var confirmYes = document.getElementById("patrol-confirm-yes");
    var confirmNo = document.getElementById("patrol-confirm-no");
    if (confirmYes) confirmYes.addEventListener("click", applyConfirm);
    if (confirmNo) {
      confirmNo.addEventListener("click", function () {
        pendingConfirm = null;
        var pop = document.getElementById("patrol-confirm-pop");
        if (pop) pop.classList.add("hidden");
      });
    }

    if (global.ProjectOperationLog) {
      ProjectOperationLog.bindClose("patrol-record-mask", "close-patrol-record");
    } else {
      document.querySelectorAll("[data-action='close-patrol-record']").forEach(function (b) {
        b.addEventListener("click", function () {
          document.getElementById("patrol-record-mask").classList.remove("show");
        });
      });
    }
    document.querySelectorAll("[data-action='close-manual-form']").forEach(function (b) {
      b.addEventListener("click", closeManualEdit);
    });
    var saveManualBtn = document.querySelector("[data-action='save-manual-form']");
    if (saveManualBtn) saveManualBtn.addEventListener("click", saveManualForm);
    bindManualUploadPreview("pm-f-photo-input", "pm-f-photo-list", "照片");
    bindManualUploadPreview("pm-f-video-input", "pm-f-video-list", "视频");
    var manualMask = document.getElementById("patrol-manual-form-mask");
    if (manualMask) {
      manualMask.addEventListener("click", function (e) {
        if (e.target === manualMask) closeManualEdit();
      });
    }
  }

  function init() {
    applyQueryProject();
    initQuickLinks();
    bindEvents();
    renderTable();
    if (window.WHPatrolMediaGallery) {
      window.WHPatrolMediaGallery.bind(document.getElementById("page-root") || document);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.WHProjectPatrol = { ALL_ROWS: ALL_ROWS, renderTable: renderTable, getQueryProject: getQueryProject };
})(window);
