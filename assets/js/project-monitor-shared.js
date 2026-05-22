/**
 * 项目详情 — 监测台账 Tab（项目管理 / 完工项目共用）
 */
(function (global) {
  function escHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function fieldInput(label, id, value, type, extraClass) {
    type = type || "text";
    extraClass = extraClass || "";
    var safe = escHtml(value);
    var control =
      type === "textarea"
        ? '<textarea id="' +
          id +
          '" class="wh-input min-h-[88px] flex-1 min-w-0 max-w-[420px] px-2 py-2">' +
          safe +
          "</textarea>"
        : '<input id="' +
          id +
          '" type="' +
          (type === "date" ? "date" : "text") +
          '" class="wh-input h-8 flex-1 min-w-0 max-w-[420px] px-2" value="' +
          safe +
          '" />';
    return (
      '<div class="proj-monitor-field' +
      (extraClass ? " " + extraClass : "") +
      '">' +
      '<span class="proj-monitor-label">' +
      label +
      "</span>" +
      control +
      "</div>"
    );
  }

  function fieldTitle(label) {
    return (
      '<div class="proj-monitor-field proj-monitor-field--full proj-monitor-field--title-only">' +
      '<span class="proj-monitor-label proj-monitor-label--title">' +
      label +
      "</span></div>"
    );
  }

  function createHandlers(ctx) {
    function ensureStyles() {
      if (document.getElementById("project-monitor-style")) return;
      var style = document.createElement("style");
      style.id = "project-monitor-style";
      style.textContent =
        ".proj-monitor-wrap{max-width:1100px;margin:0 auto}" +
        ".proj-monitor-section{margin-bottom:28px}" +
        ".proj-monitor-section__title{font-size:14px;font-weight:600;color:#f0fdfa;margin:0 0 14px;padding-bottom:8px;border-bottom:1px solid rgba(34,211,238,.15)}" +
        ".proj-monitor-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 24px}" +
        ".proj-monitor-field{display:flex;align-items:flex-start;gap:10px;min-width:0;font-size:12px}" +
        ".proj-monitor-field--full{grid-column:1/-1}" +
        ".proj-monitor-label{flex:0 0 220px;text-align:right;color:rgba(226,245,255,.88);line-height:32px;padding-top:0}" +
        ".proj-monitor-field--internal .proj-monitor-label{flex:0 0 auto;min-width:0;text-align:left;white-space:nowrap;padding-right:10px}" +
        ".proj-monitor-field--internal{gap:14px}" +
        ".proj-monitor-field--title-only .proj-monitor-label--title{flex:none;width:auto;text-align:left;white-space:nowrap;line-height:1.5;padding-top:4px;color:rgba(148,163,184,.95)}" +
        ".proj-monitor-field--textarea .proj-monitor-label{line-height:1.45;padding-top:8px}" +
        ".proj-monitor-log-toolbar{display:flex;align-items:center;justify-content:flex-end;margin-bottom:10px}" +
        ".proj-monitor-log-table-wrap{border:1px solid rgba(34,211,238,.18);border-radius:8px;background:rgba(8,15,35,.45);overflow:hidden}" +
        ".proj-monitor-log-table-wrap .unit-contact-table{width:100%;margin:0}" +
        ".proj-monitor-log-table-wrap .unit-contact-table th{background:rgba(15,23,42,.85);padding:10px 14px;white-space:nowrap}" +
        ".proj-monitor-log-table-wrap .unit-contact-table td{padding:10px 14px;vertical-align:middle}" +
        ".proj-monitor-log-table-wrap .project-empty{border:0;border-radius:0;min-height:120px}" +
        "@media(max-width:900px){.proj-monitor-grid{grid-template-columns:1fr}.proj-monitor-label{flex:0 0 160px}.proj-monitor-field--internal .proj-monitor-label{text-align:left}}";
      document.head.appendChild(style);
    }

    function mountPanel(data) {
      ensureStyles();
      var root = document.getElementById(ctx.panelRootId);
      if (!root) return;
      var summaryText = (data && data.summary && data.summary.text) || "";
      root.innerHTML =
        '<div class="proj-monitor-wrap">' +
        '<section class="proj-monitor-section">' +
        '<h3 class="proj-monitor-section__title">基础信息</h3>' +
        '<div class="proj-monitor-grid">' +
        fieldInput("项目名称：", "mon-project-name", (data.base || {}).projectName) +
        fieldInput("监测区间/车站里程范围：", "mon-range", (data.base || {}).range) +
        fieldInput("基准点数量：", "mon-benchmark-count", (data.base || {}).benchmarkCount) +
        fieldInput("基准点布设位置及对应里程：", "mon-benchmark-location", (data.base || {}).benchmarkLocation) +
        fieldInput("预警值：", "mon-warning-value", (data.base || {}).warningValue, "text", "proj-monitor-field--full") +
        fieldInput("①控制值：", "mon-control-1", (data.base || {}).control1) +
        fieldInput("②评估报告控制值：", "mon-control-2", (data.base || {}).control2) +
        fieldInput("建设单位及联系人（或总承包单位）：", "mon-builder-contact", (data.base || {}).builderContact) +
        fieldInput("施工单位及联系人：", "mon-constructor-contact", (data.base || {}).constructorContact) +
        fieldInput("第三方监测单位及联系人：", "mon-third-contact", (data.base || {}).thirdContact) +
        fieldInput(
          "施工监测单位及联系人（集团内部项目）：",
          "mon-internal-contact",
          (data.base || {}).internalContact,
          "text",
          "proj-monitor-field--full proj-monitor-field--internal"
        ) +
        fieldInput("施工类型及影响等级：", "mon-type-level", (data.base || {}).typeLevel) +
        fieldInput("与地铁结构最近距离：", "mon-min-distance", (data.base || {}).minDistance) +
        fieldInput("项目跟进人：", "mon-follower", (data.base || {}).follower) +
        fieldInput("施工主要风险期：", "mon-risk-period", (data.base || {}).riskPeriod) +
        fieldInput("监测开始时间：", "mon-start-time", (data.base || {}).startTime, "date") +
        fieldInput("监测停测时间：", "mon-stop-time", (data.base || {}).stopTime, "date") +
        "</div></section>" +
        '<section class="proj-monitor-section">' +
        '<h3 class="proj-monitor-section__title">专项监测方案</h3>' +
        '<div class="proj-monitor-grid">' +
        fieldInput("①专家评审会时间：", "mon-expert-time", (data.plan || {}).expertTime, "date") +
        fieldInput("②人工及自动化监测设备型号：", "mon-equipment", (data.plan || {}).equipment) +
        fieldInput("③测点间距：", "mon-point-spacing", (data.plan || {}).pointSpacing) +
        fieldInput("④联测频次：", "mon-joint-frequency", (data.plan || {}).jointFrequency) +
        fieldTitle("⑤各施工阶段对应的监测频次及监测方式：") +
        fieldInput("施工阶段一：", "mon-stage-one", (data.plan || {}).stageOne, "text", "proj-monitor-field--full") +
        fieldInput("施工阶段二：", "mon-stage-two", (data.plan || {}).stageTwo, "text", "proj-monitor-field--full") +
        fieldInput(
          "基准点联测时间：",
          "mon-benchmark-joint-time",
          (data.plan || {}).benchmarkJointTime,
          "date",
          "proj-monitor-field--full"
        ) +
        "</div></section>" +
        '<section class="proj-monitor-section">' +
        '<h3 class="proj-monitor-section__title">项目情况简介</h3>' +
        '<div class="proj-monitor-field proj-monitor-field--full proj-monitor-field--textarea">' +
        '<span class="proj-monitor-label">工程概括：</span>' +
        '<textarea id="mon-summary" class="wh-input min-h-[100px] flex-1 min-w-0 max-w-full px-2 py-2">' +
        ctx.escapeHtml(summaryText) +
        "</textarea></div></section>" +
        '<section class="proj-monitor-section">' +
        '<h3 class="proj-monitor-section__title">第三方监测日志（含基准点复测数据、初始状态调查、监测总结等）</h3>' +
        '<div class="proj-monitor-log-toolbar">' +
        '<button type="button" class="px-4 py-1.5 rounded text-xs wh-btn-primary project-hidden-when-readonly" data-action="' +
        ctx.openLogAction +
        '"><i class="fa-solid fa-plus mr-1"></i>新增</button></div>' +
        '<div class="proj-monitor-log-table-wrap"><div id="' +
        ctx.listId +
        '"></div></div></section></div>';
      renderLogRows();
    }

    function val(id) {
      var el = document.getElementById(id);
      if (!el) return "";
      return (el.value || "").trim();
    }

    function collectLedger() {
      return {
        base: {
          projectName: val("mon-project-name"),
          range: val("mon-range"),
          benchmarkCount: val("mon-benchmark-count"),
          benchmarkLocation: val("mon-benchmark-location"),
          warningValue: val("mon-warning-value"),
          control1: val("mon-control-1"),
          control2: val("mon-control-2"),
          builderContact: val("mon-builder-contact"),
          constructorContact: val("mon-constructor-contact"),
          thirdContact: val("mon-third-contact"),
          internalContact: val("mon-internal-contact"),
          typeLevel: val("mon-type-level"),
          minDistance: val("mon-min-distance"),
          follower: val("mon-follower"),
          riskPeriod: val("mon-risk-period"),
          startTime: val("mon-start-time"),
          stopTime: val("mon-stop-time")
        },
        plan: {
          expertTime: val("mon-expert-time"),
          equipment: val("mon-equipment"),
          pointSpacing: val("mon-point-spacing"),
          jointFrequency: val("mon-joint-frequency"),
          stageOne: val("mon-stage-one"),
          stageTwo: val("mon-stage-two"),
          benchmarkJointTime: val("mon-benchmark-joint-time")
        },
        summary: { text: val("mon-summary") },
        logs: ctx.getLogs()
      };
    }

    function renderLogRows() {
      var listEl = document.getElementById(ctx.listId);
      if (!listEl) return;
      var logs = ctx.getLogs();
      if (!logs.length) {
        listEl.innerHTML =
          '<div class="project-empty"><i class="fa-regular fa-folder-open text-2xl mb-1"></i>暂无监测日志</div>';
        return;
      }
      listEl.innerHTML =
        '<table class="unit-contact-table proj-monitor-log-table"><thead><tr>' +
        "<th>日期</th><th>监测报告期数</th><th>监测数据</th><th>是否超预警</th><th>操作</th>" +
        "</tr></thead><tbody>" +
        logs
          .map(function (row, index) {
            return (
              "<tr>" +
              "<td>" +
              ctx.escapeHtml(row.date || "-") +
              "</td>" +
              "<td>" +
              ctx.escapeHtml(row.reportPeriod || "-") +
              "</td>" +
              '<td class="max-w-[280px] truncate" title="' +
              ctx.escapeHtml(row.monitorData || "") +
              '">' +
              ctx.escapeHtml(row.monitorData || "-") +
              "</td>" +
              "<td>" +
              ctx.escapeHtml(row.overWarning || "-") +
              "</td>" +
              '<td><div class="unit-contact-actions">' +
              '<span class="unit-inline-action" data-action="' +
              ctx.editLogAction +
              '" data-index="' +
              index +
              '">编辑</span>' +
              '<span class="unit-inline-action unit-inline-action--danger" data-action="' +
              ctx.deleteLogAction +
              '" data-index="' +
              index +
              '">删除</span></div></td></tr>'
            );
          })
          .join("") +
        "</tbody></table>";
    }

    function buildLogFormHtml(item) {
      item = item || {};
      return (
        '<div class="space-y-4 max-w-[560px] mx-auto">' +
        '<label class="flex items-center gap-3"><span class="project-form-label project-required">日期：</span><input id="mon-log-date" type="date" class="wh-input h-8 flex-1 px-2" value="' +
        ctx.escapeHtml(item.date || "") +
        '" /></label>' +
        '<label class="flex items-center gap-3"><span class="project-form-label project-required">监测报告期数：</span><input id="mon-log-period" class="wh-input h-8 flex-1 px-2" value="' +
        ctx.escapeHtml(item.reportPeriod || "") +
        '" /></label>' +
        '<label class="flex items-start gap-3"><span class="project-form-label">监测数据：</span><textarea id="mon-log-data" class="wh-input min-h-[96px] flex-1 px-2 py-2">' +
        ctx.escapeHtml(item.monitorData || "") +
        "</textarea></label>" +
        '<label class="flex items-center gap-3"><span class="project-form-label project-required">是否超预警：</span><select id="mon-log-warning" class="wh-input h-8 flex-1 px-2"><option' +
        ((item.overWarning || "") === "否" ? " selected" : "") +
        '>否</option><option' +
        ((item.overWarning || "") === "是" ? " selected" : "") +
        '>是</option></select></label></div>'
      );
    }

    function collectLogRecord() {
      return {
        date: val("mon-log-date"),
        reportPeriod: val("mon-log-period"),
        monitorData: val("mon-log-data"),
        overWarning: val("mon-log-warning") || "否"
      };
    }

    function validateLogRecord(record) {
      if (!record.date || !record.reportPeriod) {
        ctx.showToast("请先填写日期和监测报告期数");
        return false;
      }
      return true;
    }

    return {
      mountPanel: mountPanel,
      collectLedger: collectLedger,
      renderLogRows: renderLogRows,
      buildLogFormHtml: buildLogFormHtml,
      collectLogRecord: collectLogRecord,
      validateLogRecord: validateLogRecord
    };
  }

  global.ProjectMonitorShared = {
    createHandlers: createHandlers,
    fieldInput: fieldInput
  };
})(typeof window !== "undefined" ? window : global);
