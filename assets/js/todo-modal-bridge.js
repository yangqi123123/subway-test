/**
 * 待办页复用：飞行计划「查阅计划」、告警详情/复核/审核弹窗
 */
(function (global) {
  var FLIGHT_PLANS = [
    {
      id: 2,
      name: "梨园站告警复核",
      route: "梨园-中南医院演示航线",
      airport: "梨园机场",
      drone: "梨园巡检无人机 M30T",
      type: "告警复核",
      strategy: "立即起飞",
      line: "2号线",
      applicant: "李明",
      submit: "2026-05-14 17:30",
      audit: "审核中",
      exec: "未执行",
      planTime: "2026-05-13 16:00（即时起飞）",
      actualStart: "-",
      actualEnd: "-",
      airspaceValid: true,
    },
    {
      id: 5,
      name: "涉铁施工夜间复核",
      route: "涉铁施工复核航线",
      airport: "车辆段机场",
      drone: "长江新区无人机 M300",
      type: "告警复核",
      strategy: "单次定时",
      line: "8号线",
      applicant: "张文杰",
      submit: "2026-05-15 09:18",
      audit: "审核中",
      exec: "未执行",
      planTime: "2026-05-14 02:00",
      actualStart: "-",
      actualEnd: "-",
      airspaceValid: true,
    },
    {
      id: 106,
      name: "飞行计划 FP-20260513006",
      route: "涉铁施工复核航线",
      airport: "车辆段机场",
      drone: "长江新区无人机 M300",
      type: "常规巡检",
      strategy: "单次定时",
      line: "8号线",
      applicant: "张文杰",
      submit: "2026-05-13 16:00",
      audit: "已驳回",
      exec: "未执行",
      planTime: "2026-05-14 02:00",
      actualStart: "-",
      actualEnd: "-",
      airspaceValid: false,
    },
    {
      id: 109,
      name: "飞行计划 FP-20260512009",
      route: "车辆段日常巡查航线",
      airport: "车辆段机场",
      drone: "车辆段无人机 M350",
      type: "常规巡检",
      strategy: "周期起飞",
      line: "5号线",
      applicant: "李玲",
      submit: "2026-05-12 09:00",
      audit: "审核通过",
      exec: "已执行",
      planTime: "每周一、三 09:00",
      actualStart: "2026-05-13 09:02",
      actualEnd: "2026-05-13 09:48",
      airspaceValid: true,
    },
  ];

  var DEFAULT_PHOTOS = [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=300&q=80",
  ];

  var ALARM_PROJECTS = {
    201: {
      id: 201,
      projectName: "金融街六中北项目",
      type: "疑似机械施工",
      section: "中南医院站-湖北日报站",
      location: "里程 V20+066 左线外侧",
      code: "7.0.346.E",
      startTime: "2026-03-05 08:14:49",
      lastTime: "2026-03-05 18:30:46",
      workflowStatus: "未复核",
      locationNote: "金融街T2北侧围挡外，破拆机械作业面，需持续盯控。",
      image: DEFAULT_PHOTOS[0],
      review: { falseAlarm: "非误报", levelAdjust: "一级告警", scene: "", photos: DEFAULT_PHOTOS.slice() },
      uavRecord: {
        time: "2026-04-07 10:10",
        user: "hudanfeng",
        mistaken: "否",
        level: "一级告警",
        situation: "金融街T2大楼破拆机拆除",
        image: DEFAULT_PHOTOS[0],
      },
      alarmRecord: { code: "7.0.346.E", startTime: "03-05 08:14:49", endTime: "03-05 09:14:49", duration: "60s" },
      disposalRecord: [
        { time: "2026-04-07 02:05:50", type: "alarm", text: "告警产生，系统发送告警信息" },
        { time: "2026-04-07 10:08:50", type: "step", text: "hudanfeng确认接受工单，即将前往现场" },
        {
          time: "2026-04-07 10:10:50",
          type: "review",
          text: "hudanfeng提交现场复核情况",
          review: true,
          falseAlarm: "否",
          levelAdjust: "一级告警",
          scene: "金融街T2大楼破拆机拆除",
        },
      ],
    },
    202: {
      id: 202,
      projectName: "武铁投二期基坑工程",
      type: "疑似机械施工",
      section: "中南医院站-湖北日报站",
      location: "里程 V20+058 右线外侧",
      code: "7.0.346.E",
      startTime: "2026-03-05 09:02:11",
      lastTime: "2026-03-05 17:48:20",
      workflowStatus: "已复核",
      locationNote: "夜间巡查发现异常堆土，需二次确认。",
      detail: "现场有破拆机械挖掘施工，动静比较大",
      image: DEFAULT_PHOTOS[1],
      review: {
        falseAlarm: "非误报",
        levelAdjust: "二级告警",
        scene: "现场有破拆机械挖掘施工，动静比较大",
        photos: [DEFAULT_PHOTOS[1]],
      },
      uavRecord: {
        time: "2026-03-05 17:48",
        user: "hudanfeng",
        mistaken: "否",
        level: "二级告警",
        situation: "现场有破拆机械挖掘施工，动静比较大",
        image: DEFAULT_PHOTOS[1],
      },
      alarmRecord: { code: "7.0.346.E", startTime: "03-05 09:02:11", endTime: "03-05 17:48:20", duration: "8min" },
      disposalRecord: [
        { time: "2026-03-05 09:02:11", type: "alarm", text: "告警产生，系统发送告警信息" },
        {
          time: "2026-03-05 17:48:20",
          type: "review",
          text: "hudanfeng提交现场复核情况",
          review: true,
          falseAlarm: "非误报",
          levelAdjust: "二级告警",
          scene: "现场有破拆机械挖掘施工，动静比较大",
        },
      ],
    },
  };

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
    });
  }

  function formatAlarmSource(source) {
    if (global.WHMapAlerts && global.WHMapAlerts.formatAlertSourceDisplay) {
      return WHMapAlerts.formatAlertSourceDisplay(source);
    }
    if (source == null || source === "") return "—";
    if (String(source).indexOf("全时全域") >= 0 && source !== "无人机") return "全时全域";
    return String(source);
  }

  function showMask(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add("show");
  }

  function hideMask(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove("show");
  }

  function findPlan(planId) {
    return FLIGHT_PLANS.filter(function (p) {
      return p.id === planId;
    })[0];
  }

  function auditBadge(text) {
    return global.ApprovalTimeline
      ? ApprovalTimeline.statusBadge(text)
      : '<span class="wh-status">' + esc(text) + "</span>";
  }

  function detailField(label, value, full) {
    var v = value === undefined || value === null || value === "" ? "—" : value;
    return (
      '<div class="plan-detail-field' +
      (full ? " plan-detail-field--full" : "") +
      '"><div class="plan-detail-field__label">' +
      esc(label) +
      '</div><div class="plan-detail-field__value">' +
      esc(v) +
      "</div></div>"
    );
  }

  function approvalRecords(p) {
    var base = [
      { person: "张工", time: "2026-05-13 09:24", status: "审批通过", opinion: "申请资料完整，航线与空域许可匹配。" },
      { person: "李工", time: "2026-05-13 09:42", status: "审批通过", opinion: "施工保护区范围核对无误，同意执行。" },
      { person: "陈工", time: "2026-05-13 10:05", status: "审核中", opinion: "待核验无人机电池与载荷状态。" },
      { person: "王主任", time: "-", status: "待审批", opinion: "-" },
      { person: "赵经理", time: "-", status: "待审批", opinion: "-" },
    ];
    if (p.audit === "审核通过") {
      return base.map(function (r) {
        return Object.assign({}, r, {
          status: "审批通过",
          time: r.time === "-" ? "2026-05-13 10:36" : r.time,
          opinion: r.opinion === "-" ? "审批通过，同意按计划执行。" : r.opinion,
        });
      });
    }
    if (p.audit === "已驳回") {
      return base.map(function (r, i) {
        return i === 2
          ? Object.assign({}, r, {
              status: "已驳回",
              time: "2026-05-13 10:12",
              opinion: "空域许可临期，请补充续期材料后重新提交。",
            })
          : r;
      });
    }
    return base;
  }

  function renderApprovalRecords(p) {
    if (global.ApprovalTimeline) {
      return ApprovalTimeline.renderApprovalRecords(approvalRecords(p));
    }
    return "";
  }

  function buildFlightPlanDetailHtml(p) {
    var fields = [
      detailField("计划名称", p.name, true),
      detailField("飞行航线", p.route),
      detailField("适用机场", p.airport),
      detailField("适用航空器", p.drone),
      detailField("飞行策略", p.strategy),
      detailField("执行时间", p.planTime, true),
      detailField("计划类型", p.type),
      detailField("所属线路", p.line),
      detailField("申请人", p.applicant),
      detailField("提交时间", p.submit),
      detailField("审核状态", p.audit),
      detailField("执行状态", p.exec),
      detailField("空域许可", p.airspaceValid !== false ? "有效期内" : "不在有效期内"),
    ];
    return (
      '<div class="mb-4 flex items-center justify-between gap-3"><div><div class="text-cyan-100 font-semibold">' +
      esc(p.name) +
      '</div><div class="mt-1 text-xs text-slate-400">审批流程：提交 → 工长 → 工务 → 物管 → 车间主任 → 部门领导</div></div>' +
      auditBadge(p.audit) +
      '</div><div class="grid plan-detail-layout md:grid-cols-[1fr_340px] gap-4"><section class="rounded border border-cyan-400/20 bg-slate-950/25 p-4"><div class="text-sm font-semibold text-cyan-100 mb-3">计划详情</div><div class="plan-detail-grid">' +
      fields.join("") +
      '</div></section><section class="rounded border border-cyan-400/20 bg-slate-950/25 p-4"><div class="text-sm font-semibold text-cyan-100 mb-4">审批记录</div>' +
      renderApprovalRecords(p) +
      "</section></div>"
    );
  }

  function renderDisposal(item) {
    if (global.AlertDisposalTimeline) {
      return AlertDisposalTimeline.render(item);
    }
    return '<div class="alert-disposal-empty">暂无处警记录</div>';
  }

  function buildAlarmDetailHtml(item) {
    var note = (item.locationNote || "").trim();
    var grid = [
      ["项目名称", item.projectName],
      ["告警来源", formatAlarmSource(item.source)],
      ["报警类型", item.type],
      ["报警区间", item.section],
      ["位置", item.location],
      ["测点编码", '<span class="alert-code-tag">' + esc(item.code) + "</span>"],
      ["报警开始时间", item.startTime],
      ["最新报警时间", item.lastTime],
      ["处理状态", item.workflowStatus],
      ["当前位置备注", note || "暂无备注", "full"],
    ]
      .map(function (pair) {
        return (
          '<div class="todo-alarm-detail-item' +
          (pair[2] === "full" ? " todo-alarm-detail-item--full" : "") +
          '"><div class="todo-alarm-detail-key">' +
          esc(pair[0]) +
          '</div><div class="todo-alarm-detail-val">' +
          (pair[1] || "—") +
          "</div></div>"
        );
      })
      .join("");

    var alarmRec = item.alarmRecord || {};
    var alarmHtml =
      '<div class="text-center mb-2"><span class="alert-code-tag">' +
      esc(alarmRec.code || item.code) +
      '</span> <span class="text-xs text-slate-400">持续时间：' +
      esc(alarmRec.duration || "—") +
      "</span></div>" +
      '<div class="text-center text-sm text-slate-400">' +
      esc((alarmRec.startTime || "") + (alarmRec.endTime ? " ~" + alarmRec.endTime : "")) +
      "</div>";

    return (
      '<div class="todo-alarm-layout">' +
      '<div class="todo-alarm-layout__main">' +
      '<div class="todo-alarm-side-card todo-alarm-side-card--detail">' +
      '<div class="todo-alarm-side-title">告警详情</div>' +
      '<div class="todo-alarm-detail-grid">' +
      grid +
      "</div></div>" +
      '<div class="todo-alarm-record-row">' +
      '<div class="todo-alarm-side-card todo-alarm-side-card--record">' +
      '<div class="todo-alarm-side-title">告警记录</div>' +
      '<div class="todo-alarm-side-card__body">' +
      alarmHtml +
      "</div></div>" +
      '<div class="todo-alarm-side-card todo-alarm-side-card--uav">' +
      '<div class="todo-alarm-side-title">无人机实拍记录</div>' +
      '<div class="todo-alarm-side-card__body alert-uav-shot"><img src="' +
      esc(item.uavRecord && item.uavRecord.image ? item.uavRecord.image : item.image) +
      '" alt="实拍" /></div></div></div></div>' +
      '<div class="todo-alarm-layout__aside">' +
      '<div class="todo-alarm-side-card todo-alarm-side-card--disposal">' +
      '<div class="todo-alarm-side-title">处警记录</div>' +
      '<div class="alert-side-body">' +
      renderDisposal(item) +
      "</div></div></div></div>"
    );
  }

  function syncAlarmRow(row, project) {
    if (!row || !project) return;
    row.workflowStatus = project.workflowStatus;
    row.status = project.workflowStatus;
    row.alarmDetail = project.detail || row.alarmDetail;
  }

  function getAlarmProject(alertId, row) {
    if (global.WHMapAlerts && WHMapAlerts.findProject) {
      var live = WHMapAlerts.findProject(alertId);
      if (live) {
        if (row && (row.workflowStatus || row.status)) {
          live.workflowStatus = row.workflowStatus || row.status;
        }
        return live;
      }
    }
    var p = ALARM_PROJECTS[alertId];
    if (!p) return null;
    if (row && row.workflowStatus) {
      p = Object.assign({}, p, { workflowStatus: row.workflowStatus });
    }
    return p;
  }

  function mountModals() {
    if (document.getElementById("todo-modals-root")) return;

    var root = document.createElement("div");
    root.id = "todo-modals-root";
    root.innerHTML =
      '<div id="todo-plan-detail-mask" class="wb-todo-modal-mask">' +
      '<div class="wb-todo-modal"><div class="wb-todo-modal__head"><h3 class="text-base font-semibold text-white">查阅计划</h3>' +
      '<button type="button" class="wh-modal-close" data-todo-close="todo-plan-detail-mask" aria-label="关闭">×</button></div>' +
      '<div id="todo-plan-detail-body" class="wb-todo-modal__body"></div></div></div>' +
      '<div id="todo-alarm-detail-mask" class="wb-todo-modal-mask">' +
      '<div class="wb-todo-modal wb-todo-modal--xl"><div class="wb-todo-modal__head"><h3 class="text-base font-semibold text-white">告警详情</h3>' +
      '<button type="button" class="wh-modal-close" data-todo-close="todo-alarm-detail-mask" aria-label="关闭">×</button></div>' +
      '<div id="todo-alarm-detail-body" class="wb-todo-modal__body"></div></div></div>';

    document.body.appendChild(root);

    root.addEventListener("click", function (e) {
      var close = e.target.closest("[data-todo-close]");
      if (close) hideMask(close.getAttribute("data-todo-close"));
      if (e.target.classList.contains("wb-todo-modal-mask")) hideMask(e.target.id);
    });
  }

  function openFlightPlanDetail(planId) {
    var p = findPlan(planId);
    if (!p) {
      alert("未找到关联飞行计划");
      return;
    }
    var body = document.getElementById("todo-plan-detail-body");
    if (body) body.innerHTML = buildFlightPlanDetailHtml(p);
    showMask("todo-plan-detail-mask");
  }

  function openAlarmDetail(alertId, row) {
    var project = getAlarmProject(alertId, row);
    if (!project) {
      alert("未找到关联告警");
      return;
    }
    if (global.WHMapAlerts && WHMapAlerts.openDetail) {
      WHMapAlerts.openDetail(project);
      return;
    }
    var body = document.getElementById("todo-alarm-detail-body");
    if (body) body.innerHTML = buildAlarmDetailHtml(project);
    showMask("todo-alarm-detail-mask");
  }

  function openDroneAlarmReview(alertId, row) {
    var project = getAlarmProject(alertId, row);
    if (!project) {
      alert("未找到关联告警");
      return;
    }
    if (global.WHMapAlerts && WHMapAlerts.openDroneReview) {
      WHMapAlerts.openDroneReview(project);
      return;
    }
    alert("无人机复核模块未加载");
  }

  function collectAlarmProjectNames() {
    if (global.WHMapAlerts && WHMapAlerts.findProject) {
      var names = [];
      [201, 202, 205].forEach(function (id) {
        var p = WHMapAlerts.findProject(id);
        if (p && p.projectName && names.indexOf(p.projectName) < 0) names.push(p.projectName);
      });
      if (names.length) {
        return names.sort(function (a, b) {
          return a.localeCompare(b, "zh-CN");
        });
      }
    }
    return Object.keys(ALARM_PROJECTS)
      .map(function (id) {
        return ALARM_PROJECTS[id] && ALARM_PROJECTS[id].projectName;
      })
      .filter(Boolean)
      .filter(function (name, idx, arr) {
        return arr.indexOf(name) === idx;
      })
      .sort(function (a, b) {
        return a.localeCompare(b, "zh-CN");
      });
  }

  function applyAlarmReviewData(alertId, row, data) {
    var project = getAlarmProject(alertId, row);
    if (!project) return null;
    var t = global.WuhanExpertReviewModal ? global.WuhanExpertReviewModal.nowStr() : "";
    project.workflowStatus = "已复核";
    project.mistaken = data.mistaken;
    if (data.projectName) project.projectName = data.projectName;
    project.detail = data.scene || data.detail || project.detail;
    project.review = {
      projectName: data.projectName,
      falseAlarm: data.falseAlarm,
      levelAdjust: data.levelAdjust,
      scene: data.scene,
      photos: (data.photos || []).slice(),
    };
    project.disposalRecord = project.disposalRecord || [];
    project.disposalRecord.push({
      time: t,
      type: "review",
      text: (project.uavRecord && project.uavRecord.user ? project.uavRecord.user : "值班人员") + "提交现场复核情况",
      review: true,
      falseAlarm: data.falseAlarm,
      levelAdjust: data.levelAdjust,
      scene: data.scene,
    });
    ALARM_PROJECTS[alertId] = project;
    syncAlarmRow(row, project);
    return project;
  }

  function openAlarmReview(alertId, row, onDone) {
    var project = getAlarmProject(alertId, row);
    if (!project || !global.WuhanExpertReviewModal) {
      alert("复核弹窗未加载");
      return;
    }
    var projectSelectInst = null;
    global.WuhanExpertReviewModal.openReview(
      {
        projectName: project.projectName || "",
        projectNameOptions: collectAlarmProjectNames(),
        showProjectSelect: true,
        falseAlarm: project.review ? project.review.falseAlarm : "非误报",
        levelAdjust: project.review ? project.review.levelAdjust : "一级告警",
        scene: project.review ? project.review.scene : project.detail,
        photos: project.review && project.review.photos ? project.review.photos : [project.image],
        onFormReady: function () {
          if (!global.WHSearchSelect) return;
          projectSelectInst = WHSearchSelect.mountById(
            "review-project-name-select",
            "请搜索或选择项目名称",
            collectAlarmProjectNames()
          );
          if (projectSelectInst) projectSelectInst.setValue(project.projectName || "");
        },
      },
      function (data) {
        if (projectSelectInst && projectSelectInst.getValue) {
          var picked = projectSelectInst.getValue();
          if (picked) data.projectName = picked;
        }
        var updated = applyAlarmReviewData(alertId, row, data);
        if (typeof onDone === "function") onDone(updated ? data : null, data);
      }
    );
  }

  function openAlarmAudit(alertId, row, onDone) {
    var project = getAlarmProject(alertId, row);
    if (!project || !global.WuhanExpertReviewModal) {
      alert("审核弹窗未加载");
      return;
    }
    global.WuhanExpertReviewModal.openAudit(function (decision) {
      var t = global.WuhanExpertReviewModal.nowStr();
      project.workflowStatus = decision.result;
      project.disposalRecord = project.disposalRecord || [];
      project.disposalRecord.push({
        time: t,
        type: "audit",
        text: "管理员审批",
        auditor: "管理员",
        result: decision.result,
        opinion: decision.opinion,
      });
      ALARM_PROJECTS[alertId] = project;
      syncAlarmRow(row, project);
      if (typeof onDone === "function") onDone(project, decision);
    });
  }

  function flightPlanDetailPairs(planId) {
    var p = findPlan(planId);
    if (!p) return null;
    return [
      ["计划名称", p.name],
      ["飞行航线", p.route],
      ["适用机场", p.airport],
      ["适用航空器", p.drone],
      ["飞行策略", p.strategy],
      ["执行时间", p.planTime],
      ["计划类型", p.type],
      ["所属线路", p.line],
      ["申请人", p.applicant],
      ["提交时间", p.submit],
      ["审核状态", p.audit],
      ["执行状态", p.exec],
      ["空域许可", p.airspaceValid !== false ? "有效期内" : "不在有效期内"],
    ];
  }

  function alarmDetailPairs(alertId, row) {
    var item = getAlarmProject(alertId, row);
    if (!item) return null;
    var note = (item.locationNote || "").trim();
    return [
      ["项目名称", item.projectName],
      ["告警来源", formatAlarmSource(item.source)],
      ["报警类型", item.type],
      ["报警区间", item.section],
      ["位置", item.location],
      ["测点编码", item.code],
      ["报警开始时间", item.startTime],
      ["最新报警时间", item.lastTime],
      ["处理状态", item.workflowStatus],
      ["当前位置备注", note || "暂无备注"],
    ];
  }

  function todoPlanFromRow(row) {
    var name =
      row && row.title && row.title.indexOf("飞行计划审批 ") === 0
        ? row.title.slice("飞行计划审批 ".length)
        : row && row.title;
    return { name: name || (row && row.title) || "飞行计划", audit: "审核中" };
  }

  function approvalRecordsForPlan(plan) {
    return approvalRecords(plan || { audit: "审核中" });
  }

  global.TodoModalBridge = {
    mountModals: mountModals,
    openFlightPlanDetail: openFlightPlanDetail,
    openAlarmDetail: openAlarmDetail,
    openAlarmReview: openAlarmReview,
    openDroneAlarmReview: openDroneAlarmReview,
    applyAlarmReviewData: applyAlarmReviewData,
    collectAlarmProjectNames: collectAlarmProjectNames,
    openAlarmAudit: openAlarmAudit,
    findPlan: findPlan,
    getAlarmProject: getAlarmProject,
    flightPlanDetailPairs: flightPlanDetailPairs,
    alarmDetailPairs: alarmDetailPairs,
    todoPlanFromRow: todoPlanFromRow,
    approvalRecordsForPlan: approvalRecordsForPlan,
    buildFlightPlanDetailHtml: buildFlightPlanDetailHtml,
    buildAlarmDetailHtml: buildAlarmDetailHtml,
    syncAlarmRow: syncAlarmRow,
    FLIGHT_PLANS: FLIGHT_PLANS,
    ALARM_PROJECTS: ALARM_PROJECTS,
  };
})(window);
