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

  var filters = { type: "", operator: "", timeStart: "", timeEnd: "" };
  var mobileFilterRows = null;
  var pendingConfirm = null;
  var editingManualId = null;
  var manualFormFootHtml = "";
  var manualFormReadonly = false;

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

  function normalizeSearchText(text) {
    return String(text || "")
      .replace(/\s+/g, "")
      .toLowerCase();
  }

  function matchSearchScore(query, target) {
    var q = normalizeSearchText(query);
    var n = normalizeSearchText(target);
    if (!q) return 0;
    if (!n) return -1;
    if (n.indexOf(q) >= 0) return 100 + (q.length / Math.max(n.length, 1)) * 40;
    var qi = 0;
    for (var i = 0; i < n.length && qi < q.length; i++) {
      if (n.charAt(i) === q.charAt(qi)) qi++;
    }
    if (qi === q.length) return 50 + (qi / Math.max(n.length, 1)) * 30;
    return -1;
  }

  function rowMatchesSearch(row, query) {
    var q = (query || "").trim();
    if (!q) return true;
    return (
      Math.max(
        matchSearchScore(q, row.projectName),
        matchSearchScore(q, row.id),
        matchSearchScore(q, row.operator)
      ) > 0
    );
  }

  function rowMatches(row) {
    var searchInput = document.getElementById("patrol-search-trigger");
    var nameKw = searchInput && searchInput.value ? searchInput.value.trim() : "";
    if (nameKw && !rowMatchesSearch(row, nameKw)) return false;
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

  function getListSource() {
    return mobileFilterRows || scopedRows();
  }

  function filteredRows() {
    return getListSource().filter(rowMatches);
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
      '<button type="button" class="mp-project-action" data-action="manual-edit" data-index="' +
      index +
      '"><i class="fa-regular fa-pen-to-square"></i>编辑</button>' +
      '<button type="button" class="mp-project-action" data-action="manual-confirm" data-index="' +
      index +
      '"><i class="fa-regular fa-circle-check"></i>工班确认</button>' +
      '<button type="button" class="mp-project-action" data-action="manual-reject" data-index="' +
      index +
      '"><i class="fa-regular fa-circle-xmark"></i>拒绝</button>' +
      '<button type="button" class="mp-project-action mp-project-action--danger" data-action="manual-delete" data-index="' +
      index +
      '"><i class="fa-regular fa-trash-can"></i>删除</button>' +
      '<button type="button" class="mp-project-action" data-action="manual-logs" data-index="' +
      index +
      '"><i class="fa-regular fa-clock"></i>操作记录</button>'
    );
  }

  function desktopActionLink(colorClass, action, attrs, iconClass, label) {
    return (
      '<span class="row-action ' +
      colorClass +
      '" data-action="' +
      action +
      '" ' +
      attrs +
      '><i class="' +
      iconClass +
      '"></i>' +
      label +
      "</span>"
    );
  }

  function manualActionsDesktop(index) {
    var idx = 'data-index="' + index + '"';
    return (
      desktopActionLink("text-sky-300", "manual-edit", idx, "fa-regular fa-pen-to-square", "编辑") +
      desktopActionLink("text-cyan-300", "manual-confirm", idx, "fa-regular fa-circle-check", "工班确认") +
      desktopActionLink("text-rose-300", "manual-reject", idx, "fa-regular fa-circle-xmark", "拒绝") +
      desktopActionLink("text-rose-300", "manual-delete", idx, "fa-regular fa-trash-can", "删除") +
      desktopActionLink("text-sky-300", "manual-logs", idx, "fa-regular fa-clock", "操作记录")
    );
  }

  function uavActions(row) {
    var id = row.uav && row.uav.taskId ? row.uav.taskId : row.id;
    return (
      '<button type="button" class="mp-project-action" data-action="uav-view" data-task="' +
      esc(id) +
      '"><i class="fa-regular fa-file-lines"></i>查看报告</button>' +
      '<button type="button" class="mp-project-action" data-action="uav-download" data-task="' +
      esc(id) +
      '"><i class="fa-solid fa-download"></i>下载报告</button>'
    );
  }

  function uavActionsDesktop(row) {
    var id = row.uav && row.uav.taskId ? row.uav.taskId : row.id;
    var task = 'data-task="' + esc(id) + '"';
    return (
      desktopActionLink("text-sky-300", "uav-view", task, "fa-regular fa-file-lines", "查看报告") +
      desktopActionLink("text-sky-300", "uav-download", task, "fa-solid fa-download", "下载报告")
    );
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

  function alertActions(index) {
    return (
      '<button type="button" class="mp-project-action" data-action="alert-detail" data-index="' +
      index +
      '"><i class="fa-regular fa-eye"></i>查看详情</button>'
    );
  }

  function alertActionsDesktop(index) {
    return desktopActionLink(
      "text-sky-300",
      "alert-detail",
      'data-index="' + index + '"',
      "fa-regular fa-eye",
      "查看详情"
    );
  }

  function renderActions(row, index, desktop) {
    if (desktop) {
      if (row.patrolType === TYPE_MANUAL) return manualActionsDesktop(index);
      if (row.patrolType === TYPE_UAV) return uavActionsDesktop(row);
      return alertActionsDesktop(index);
    }
    if (row.patrolType === TYPE_MANUAL) return manualActions(index);
    if (row.patrolType === TYPE_UAV) return uavActions(row);
    return alertActions(index);
  }

  function openPatrolRow(row) {
    if (!row) return;
    if (row.patrolType === TYPE_MANUAL) {
      openManualDetail(row);
      return;
    }
    if (row.patrolType === TYPE_UAV) {
      openUavReport(row);
      return;
    }
    openAlertDetail(row);
  }

  function openUavReport(row) {
    var plan = planFromUav(row && row.uav);
    if (!plan || !global.WHFlightReportModal) {
      toast("暂无飞行报告数据");
      return;
    }
    WHFlightReportModal.open(plan, { editable: false, patrolMobile: true });
  }

  function downloadUavReport(row) {
    var plan = planFromUav(row && row.uav);
    if (!plan || !global.WHFlightReportModal) {
      toast("暂无飞行报告数据");
      return;
    }
    WHFlightReportModal.exportReport(plan);
  }

  function findUavRowByTask(taskId) {
    return ALL_ROWS.filter(function (r) {
      return r.patrolType === TYPE_UAV && ((r.uav && r.uav.taskId === taskId) || r.id === taskId);
    })[0];
  }

  function renderMobilePatrolList(rows, listEl) {
    if (!listEl) return;
    if (!rows.length) {
      listEl.innerHTML =
        '<div class="mp-project-empty"><i class="fa-regular fa-clipboard"></i><p>暂无巡查记录</p></div>';
      return;
    }
    listEl.innerHTML = rows
      .map(function (row, index) {
        var progress =
          row.progress && String(row.progress).trim() && row.progress !== "—" ? row.progress : "";
        return (
          '<article class="mp-project-card" data-row-index="' +
          index +
          '">' +
          '<div class="mp-project-card__head"><span class="mp-project-card__id">' +
          esc(row.id) +
          "</span>" +
          typeBadge(row.patrolType) +
          "</div>" +
          '<h3 class="mp-project-card__title">' +
          esc(row.projectName) +
          "</h3>" +
          '<dl class="mp-project-card__meta">' +
          "<div><dt>更新时间</dt><dd>" +
          esc(row.updatedAt) +
          "</dd></div>" +
          "<div><dt>巡查人/飞手</dt><dd>" +
          esc(row.operator) +
          "</dd></div>" +
          (progress
            ? '<div class="mp-patrol-card__progress"><dt>项目进展</dt><dd>' + esc(progress) + "</dd></div>"
            : "") +
          "</dl>" +
          '<div class="mp-project-card__actions">' +
          renderActions(row, index) +
          "</div></article>"
        );
      })
      .join("");
  }

  function renderTable() {
    var rows = filteredRows();
    var mobileList = document.getElementById("patrol-mobile-list");
    if (mobileList) {
      updateStats(rows);
      renderMobilePatrolList(rows, mobileList);
      var totalEl = document.getElementById("table-total");
      if (totalEl) totalEl.textContent = String(rows.length);
      return;
    }
    var tbody = document.getElementById("patrol-tbody");
    if (!tbody) return;
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
          '<td class="px-3 disease-col-actions"><div class="disease-op-actions">' +
          renderActions(row, index, true) +
          "</div></td></tr>"
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
          source: base.source || (global.WHMapAlerts && WHMapAlerts.ALERT_SOURCE_AI) || "全时全域·AI",
          handleMode: base.handleMode || (global.WHMapAlerts && WHMapAlerts.ALERT_SOURCE_AI) || "全时全域·AI",
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

  function cacheManualFormFoot() {
    if (manualFormFootHtml) return;
    var foot = document.querySelector("#patrol-manual-form-mask .mp-project-modal__foot");
    if (foot) manualFormFootHtml = foot.innerHTML;
  }

  function patrolEventImage() {
    if (global.WHPatrolPreviewAssets && global.WHPatrolPreviewAssets.eventUrl) {
      return global.WHPatrolPreviewAssets.eventUrl();
    }
    if (global.whAsset) return global.whAsset("assets/images/flight-report-event.png");
    return "";
  }

  function renderManualPhotoPreview() {
    var row = document.getElementById("pm-f-photo-row");
    var list = document.getElementById("pm-f-photo-list");
    if (!row || !list) return;
    var url = patrolEventImage();
    row.hidden = false;
    list.innerHTML = url
      ? '<div class="mp-patrol-photo-thumb"><img src="' +
        esc(url) +
        '" alt="巡查照片预览" /></div>'
      : '<span class="mp-patrol-photo-empty">暂无照片</span>';
  }

  function hideManualPhotoPreview() {
    var row = document.getElementById("pm-f-photo-row");
    var list = document.getElementById("pm-f-photo-list");
    if (row) row.hidden = true;
    if (list) list.innerHTML = "";
  }

  function setManualFormMode(readonly) {
    manualFormReadonly = !!readonly;
    cacheManualFormFoot();
    var root = document.getElementById("patrol-manual-form-root");
    var mask = document.getElementById("patrol-manual-form-mask");
    var foot = document.querySelector("#patrol-manual-form-mask .mp-project-modal__foot");
    var title = document.getElementById("patrol-manual-form-title");
    if (title) title.textContent = readonly ? "人工巡查详情" : "编辑人工巡查记录";
    if (mask) mask.classList.toggle("mp-manual-form--readonly", readonly);
    if (foot) {
      foot.innerHTML = readonly
        ? '<button type="button" class="mp-project-modal__btn mp-project-modal__btn--primary" data-action="close-manual-form">关闭</button>'
        : manualFormFootHtml;
    }
    if (!root) return;
    root.classList.toggle("mp-modal-form--readonly", readonly);
    root.querySelectorAll("input, select, textarea").forEach(function (el) {
      if (readonly) {
        if (el.tagName === "SELECT") {
          el.disabled = true;
        } else {
          el.disabled = false;
          el.readOnly = true;
        }
        el.setAttribute("aria-disabled", "true");
        el.tabIndex = -1;
      } else {
        if (el.tagName === "SELECT") el.disabled = false;
        else {
          el.disabled = false;
          el.removeAttribute("readonly");
        }
        el.removeAttribute("aria-disabled");
        el.tabIndex = 0;
        if (el.id === "pm-f-id") el.readOnly = true;
      }
    });
    root.querySelectorAll("button.mp-picker-field").forEach(function (btn) {
      btn.disabled = readonly;
      btn.tabIndex = readonly ? -1 : 0;
    });
    if (readonly) renderManualPhotoPreview();
    else hideManualPhotoPreview();
  }

  function openManualForm(row, readonly) {
    var source = findSourceRow(row);
    if (!source) return;
    editingManualId = readonly ? null : source.id;
    var mask = document.getElementById("patrol-manual-form-mask");
    if (!mask) {
      toast(readonly ? "详情弹窗未加载" : "编辑弹窗未加载");
      return;
    }
    loadManualForm(source);
    setManualFormMode(readonly);
    mask.classList.add("show");
    mask.setAttribute("aria-hidden", "false");
    if (!readonly && global.WHProjectMobile && global.WHProjectMobile.enhanceSelectFields) {
      global.WHProjectMobile.enhanceSelectFields(document.getElementById("patrol-manual-form-root"));
    }
  }

  function openManualDetail(row) {
    openManualForm(row, true);
  }

  function openManualEdit(row) {
    openManualForm(row, false);
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
    if (!manualFormReadonly) hideManualPhotoPreview();
  }

  function saveManualForm() {
    if (manualFormReadonly) return closeManualEdit();
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
    manualFormReadonly = false;
    var mask = document.getElementById("patrol-manual-form-mask");
    if (mask) {
      mask.classList.remove("show");
      mask.setAttribute("aria-hidden", "true");
    }
    setManualFormMode(false);
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
    mask.setAttribute("aria-hidden", "false");
  }

  function runWithConfirm(options, onConfirm) {
    if (global.WHProjectMobile && global.WHProjectMobile.showConfirm) {
      global.WHProjectMobile.showConfirm(
        Object.assign({}, options, { onConfirm: onConfirm })
      );
      return;
    }
    if (global.confirm(options.message || "确定？")) onConfirm();
  }

  function openConfirm(kind, index) {
    pendingConfirm = { kind: kind, index: index };
    runWithConfirm(
      {
        title: kind === "confirm" ? "工班确认" : "工班拒绝",
        message: kind === "confirm" ? "确定通过该巡查记录？" : "确定拒绝该巡查记录？",
        okText: "确定",
        danger: kind !== "confirm"
      },
      applyConfirm
    );
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
    renderTable();
    toast(kind === "confirm" ? "工班已确认" : "工班已拒绝");
  }

  function readPatrolFilterSheet() {
    var sheet = document.getElementById("patrol-filter-sheet");
    if (!sheet) return;
    var typeEl = sheet.querySelector('[data-patrol-filter="type"]');
    var operatorEl = sheet.querySelector('[data-patrol-filter="operator"]');
    var startEl = sheet.querySelector('[data-patrol-filter="time-start"]');
    var endEl = sheet.querySelector('[data-patrol-filter="time-end"]');
    filters.type = typeEl ? typeEl.value : "";
    filters.operator = operatorEl ? operatorEl.value.trim() : "";
    filters.timeStart = startEl ? startEl.value : "";
    filters.timeEnd = endEl ? endEl.value : "";
  }

  function applyPatrolFilter(nameOverride) {
    var searchInput = document.getElementById("patrol-search-trigger");
    var nameKw =
      typeof nameOverride === "string"
        ? nameOverride
        : searchInput && searchInput.value
          ? searchInput.value.trim()
          : "";
    if (searchInput && typeof nameOverride === "string") searchInput.value = nameOverride;
    readPatrolFilterSheet();
    mobileFilterRows = scopedRows().filter(function (row) {
      if (nameKw && !rowMatchesSearch(row, nameKw)) return false;
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
    });
    renderTable();
    syncPatrolSearchClear();
  }

  function clearPatrolSearch() {
    var searchInput = document.getElementById("patrol-search-trigger");
    if (searchInput) searchInput.value = "";
    mobileFilterRows = null;
    filters = { type: "", operator: "", timeStart: "", timeEnd: "" };
    var sheet = document.getElementById("patrol-filter-sheet");
    if (sheet) {
      sheet.querySelectorAll("[data-patrol-filter]").forEach(function (el) {
        if (el.tagName === "SELECT") el.selectedIndex = 0;
        else el.value = "";
      });
    }
    renderTable();
    syncPatrolSearchClear();
  }

  function syncPatrolSearchClear() {
    var input = document.getElementById("patrol-search-trigger");
    var clearBtn = document.getElementById("patrol-search-clear");
    if (!input || !clearBtn) return;
    clearBtn.hidden = !input.value.trim();
  }

  function refreshPatrolFilterPickers() {
    if (global.WHProjectMobile && global.WHProjectMobile.enhanceSelectFields) {
      var sheet = document.getElementById("patrol-filter-sheet");
      if (sheet) global.WHProjectMobile.enhanceSelectFields(sheet);
    }
  }

  function applyQueryProject() {
    var project = getQueryProject();
    var sub = document.getElementById("patrol-project-subtitle");
    if (sub) sub.textContent = project ? "关联项目：" + project : "";
  }

  function bindPatrolSearch() {
    var clearBtn = document.getElementById("patrol-search-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        clearPatrolSearch();
      });
    }
  }

  function initQuickLinks() {
    document.querySelectorAll(".disease-quick-link[data-quick-href]").forEach(function (a) {
      var href = a.getAttribute("data-quick-href");
      if (href && typeof whPageHref === "function") a.setAttribute("href", whPageHref(href));
    });
  }

  function bindPatrolListRoot(root) {
    if (!root) return;
    root.addEventListener("click", function (e) {
      if (e.target.closest("[data-action], input, button, a, label, .disease-col-actions, .mp-project-card__actions")) return;
      var item = e.target.closest("tr[data-row-index], .mp-project-card[data-row-index]");
      if (!item) return;
      var index = Number(item.getAttribute("data-row-index"));
      var rows = filteredRows();
      var row = rows[index];
      if (row) openPatrolRow(row);
    });

    root.addEventListener("click", function (e) {
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
        openConfirm(action === "manual-confirm" ? "confirm" : "reject", index);
        return;
      }
      if (action === "manual-delete" && row) {
        var source = findSourceRow(row);
        var idx = source ? ALL_ROWS.indexOf(source) : -1;
        if (idx < 0) return;
        runWithConfirm(
          {
            title: "确认删除",
            message: "确定删除该巡查记录吗？删除后不可恢复。",
            okText: "确定删除",
            danger: true
          },
          function () {
            ALL_ROWS.splice(idx, 1);
            applyPatrolFilter();
            toast("已删除");
          }
        );
        return;
      }
      if (action === "manual-logs" && row) {
        openRecordLogs(row);
        return;
      }
      if (action === "uav-view") {
        var taskId = btn.getAttribute("data-task");
        openUavReport(findUavRowByTask(taskId));
        return;
      }
      if (action === "uav-download") {
        var downloadTaskId = btn.getAttribute("data-task");
        downloadUavReport(findUavRowByTask(downloadTaskId));
        return;
      }
      if (action === "alert-detail" && row) {
        openAlertDetail(row);
      }
    });
  }

  function bindEvents() {
    bindPatrolSearch();
    var searchBtn = document.getElementById("filter-search");
    var resetBtn = document.getElementById("filter-reset");
    if (searchBtn) {
      searchBtn.addEventListener("click", function () {
        readFiltersFromForm();
        mobileFilterRows = null;
        renderTable();
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        filters = { type: "", operator: "", timeStart: "", timeEnd: "" };
        mobileFilterRows = null;
        var typeEl = document.getElementById("filter-type");
        var o = document.getElementById("filter-operator");
        var ts = document.getElementById("filter-time-start");
        var te = document.getElementById("filter-time-end");
        if (typeEl) typeEl.value = "";
        if (o) o.value = "";
        if (ts) ts.value = "";
        if (te) te.value = "";
        renderTable();
      });
    }

    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-action]");
      if (!trigger) return;
      var action = trigger.getAttribute("data-action");
      if (action === "open-patrol-search") {
        if (e.target.closest("#patrol-search-clear")) return;
        var project = getQueryProject();
        var url = "patrol-search.html";
        if (project) url += "?project=" + encodeURIComponent(project);
        global.location.href = url;
        return;
      }
      if (action === "open-patrol-filter-sheet") {
        var sheet = document.getElementById("patrol-filter-sheet");
        if (sheet) {
          sheet.classList.add("is-open");
          refreshPatrolFilterPickers();
        }
        return;
      }
      if (action === "close-patrol-filter-sheet") {
        var closeSheet = document.getElementById("patrol-filter-sheet");
        if (closeSheet) closeSheet.classList.remove("is-open");
        return;
      }
      if (action === "search-patrol") {
        var filterSheet = document.getElementById("patrol-filter-sheet");
        if (filterSheet) filterSheet.classList.remove("is-open");
        applyPatrolFilter();
        toast("已按当前条件筛选");
        return;
      }
      if (action === "reset-patrol-filter") {
        var resetSheet = document.getElementById("patrol-filter-sheet");
        if (resetSheet) {
          resetSheet.querySelectorAll("[data-patrol-filter]").forEach(function (el) {
            if (el.tagName === "SELECT") el.selectedIndex = 0;
            else el.value = "";
          });
        }
        filters = { type: "", operator: "", timeStart: "", timeEnd: "" };
        applyPatrolFilter();
        return;
      }
    });

    bindPatrolListRoot(document.getElementById("patrol-tbody"));
    bindPatrolListRoot(document.getElementById("patrol-mobile-list"));

    if (global.WHTableRowClick) WHTableRowClick.injectStyles();

    if (global.ProjectOperationLog) {
      ProjectOperationLog.bindClose("patrol-record-mask", "close-patrol-record");
    } else {
      document.querySelectorAll("[data-action='close-patrol-record']").forEach(function (b) {
        b.addEventListener("click", function () {
          var mask = document.getElementById("patrol-record-mask");
          if (mask) {
            mask.classList.remove("show");
            mask.setAttribute("aria-hidden", "true");
          }
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
    var alertMask = document.getElementById("wh-alert-detail-modal-mask");
    if (alertMask) {
      alertMask.addEventListener("click", function (e) {
        if (e.target === alertMask) {
          if (global.WHMapAlerts && WHMapAlerts.closeDetail) WHMapAlerts.closeDetail();
          else {
            alertMask.classList.remove("show");
            alertMask.setAttribute("aria-hidden", "true");
          }
        }
      });
    }
    document.querySelectorAll("[data-action='close-alert-detail-modal']").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (global.WHMapAlerts && WHMapAlerts.closeDetail) WHMapAlerts.closeDetail();
        else {
          var mask = document.getElementById("wh-alert-detail-modal-mask");
          if (mask) {
            mask.classList.remove("show");
            mask.setAttribute("aria-hidden", "true");
          }
        }
      });
    });
  }

  function init() {
    cacheManualFormFoot();
    if (global.WHMapAlerts && WHMapAlerts.initPortalDetailModal) {
      WHMapAlerts.initPortalDetailModal();
    }
    applyQueryProject();
    initQuickLinks();
    bindEvents();
    syncPatrolSearchClear();
    renderTable();
    try {
      var params = new URLSearchParams(global.location.search);
      var q = params.get("q");
      if (q) {
        applyPatrolFilter(q);
        try {
          global.history.replaceState({}, "", global.location.pathname + (getQueryProject() ? "?project=" + encodeURIComponent(getQueryProject()) : ""));
        } catch (e) {
          /* ignore */
        }
      }
    } catch (e) {
      /* ignore */
    }
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
