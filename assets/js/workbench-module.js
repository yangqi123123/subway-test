(function (global) {
  var configs = {
    "wb-todo": {
      title: "待办",
      badge: "当前用户待处理任务",
      tabs: [
        { key: "approval", label: "审批" },
        { key: "alert", label: "告警" },
      ],
      activeTab: "approval",
      filters: [
        { id: "status", label: "状态", options: ["全部", "待审批", "未复核", "已复核"] },
        { id: "start", label: "开始时间", type: "date" },
        { id: "end", label: "结束时间", type: "date" },
      ],
      columns: ["标题", "来源模块", "发起人", "创建时间", "当前状态", "操作"],
      rows: [
        {
          tab: "approval",
          title: "飞行计划审批 FP-20260515003",
          source: "飞行计划",
          user: "张文杰",
          time: "2026-05-15 09:18",
          status: "待审批",
          planId: 5,
          note: "审批通过/驳回后流转至申请人通知及已处理事项。",
        },
        {
          tab: "approval",
          title: "飞行计划审批 FP-20260514011",
          source: "飞行计划",
          user: "李明",
          time: "2026-05-14 17:30",
          status: "待审批",
          planId: 2,
          note: "审批人处理后，申请人将收到审批消息。",
        },
        {
          tab: "alert",
          title: "重点保护区越界告警处置",
          source: "地图驾驶舱",
          user: "系统",
          time: "2026-05-15 08:42",
          status: "未复核",
          workflowStatus: "未复核",
          alertId: 201,
          note: "报警点附近机场及关联无人机已完成推荐。",
        },
        {
          tab: "alert",
          title: "夜间巡查异常复核",
          source: "智慧巡检",
          user: "系统",
          time: "2026-05-14 14:06",
          status: "已复核",
          workflowStatus: "已复核",
          alertId: 202,
          note: "需进入审核环节确认处置结果。",
        },
      ],
    },
    "wb-sys-notify": {
      title: "系统通知",
      badge: "审批结果与到期提醒",
      filters: [
        { id: "type", label: "通知类型", options: ["全部", "空域许可提醒", "审批消息"] },
        { id: "start", label: "发布开始", type: "date" },
        { id: "end", label: "发布结束", type: "date" }
      ],
      columns: ["标题", "通知类型", "发布时间", "是否已读", "操作"],
      rows: [
        {
          id: "n1",
          title: "飞行计划 FP-20260514011 已审批通过",
          type: "审批消息",
          time: "2026-05-15 10:02",
          read: "未读",
          planName: "梨园站周期巡检计划",
          route: "梨园-中南医院演示航线",
          airport: "梨园机场",
          auditResult: "审批通过",
        },
        {
          id: "n2",
          title: "飞行计划 FP-20260513006 已驳回",
          type: "审批消息",
          time: "2026-05-14 18:20",
          read: "已读",
          planName: "车辆段结构巡检",
          route: "车辆段日常巡查航线",
          airport: "车辆段机场",
          auditResult: "已驳回",
        },
        {
          id: "n3",
          title: "青山站外业巡检航线空域许可即将到期",
          type: "空域许可提醒",
          time: "2026-05-14 09:00",
          read: "未读",
          approvalNo: "KY-2026-0412-086",
          routeName: "青山站外业巡检航线",
          approvedAt: "2026-04-12 09:00",
          permitEnd: "2026-05-21 18:00",
          remark: "到期前请及时办理续期，避免影响计划执行。",
        },
        {
          id: "n4",
          title: "车辆段日常巡查航线空域许可剩余 7 天",
          type: "空域许可提醒",
          time: "2026-05-13 09:00",
          read: "未读",
          approvalNo: "KY-2026-0328-015",
          routeName: "车辆段日常巡查航线",
          approvedAt: "2026-03-28 14:20",
          permitEnd: "2026-05-20 18:00",
          remark: "请负责人完成续期材料准备。",
        },
      ],
      actions: ["查看"],
      toolbar: ["全部已读"],
    },
    "wb-done": {
      title: "已处理事项",
      badge: "历史记录追溯查询",
      filters: [
        { id: "type", label: "事项类型", options: ["全部", "审批", "告警", "空域许可续期"] },
        { id: "start", label: "处理开始", type: "date" },
        { id: "end", label: "处理结束", type: "date" },
        { id: "result", label: "处理结果", options: ["全部", "通过", "驳回", "已处置", "已续期"] }
      ],
      columns: ["标题", "类型", "来源模块", "处理人", "处理时间", "处理结果", "操作"],
      rows: [
        {
          doneKind: "flight-plan",
          planId: 106,
          title: "飞行计划审批 FP-20260513006",
          type: "审批",
          source: "飞行计划",
          user: "王主任",
          time: "2026-05-14 18:20",
          result: "驳回",
          opinion: "航线空域许可缺失，需补充材料后重新提交。",
        },
        {
          doneKind: "flight-plan",
          planId: 109,
          title: "飞行计划审批 FP-20260512009",
          type: "审批",
          source: "飞行计划",
          user: "王主任",
          time: "2026-05-13 11:16",
          result: "通过",
          opinion: "同意按计划执行，起飞前再次校验机场状态。",
        },
        {
          doneKind: "alarm",
          alertId: 201,
          title: "重点保护区越界告警",
          type: "告警",
          source: "地图驾驶舱",
          user: "鲍雄澎",
          time: "2026-05-12 16:42",
          result: "已处置",
          workflowStatus: "已处置",
          opinion: "已派发人工复核，现场确认无新增施工。",
        },
        {
          doneKind: "airspace",
          title: "车辆段日常巡查航线许可续期",
          type: "空域许可续期",
          source: "空域许可",
          user: "李玲",
          time: "2026-05-11 10:30",
          result: "已续期",
          approvalNo: "KY-2026-0315-006",
          routeName: "车辆段日常巡查航线",
          approvedAt: "2026-03-28 14:20",
          permitEnd: "2026-06-20 18:00",
          remark: "新许可有效期已同步至航线库。",
          notifyTime: "2026-05-11 10:30",
        },
      ],
      actions: ["查看"]
    }
  };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
    });
  }

  function style() {
    if (document.getElementById("wb-module-style")) return;
    document.head.insertAdjacentHTML("beforeend", '<style id="wb-module-style">' +
      '.wb-hero{border:1px solid rgba(34,211,238,.16);background:linear-gradient(135deg,rgba(2,8,23,.92),rgba(8,47,73,.28));box-shadow:0 22px 60px rgba(0,0,0,.28);border-radius:8px}.wb-stat{border-left:1px solid rgba(34,211,238,.18);padding-left:18px}.wb-table th,.wb-table td{height:52px;border-bottom:1px solid rgba(34,211,238,.09);border-right:1px solid rgba(34,211,238,.06);vertical-align:middle}.wb-table th:last-child,.wb-table td:last-child{border-right:0}.wb-table thead th{background:rgba(2,8,23,.72);font-size:12px;font-weight:600;white-space:nowrap}.wb-table tbody td{font-size:12px;color:rgba(226,245,255,.9)}.wb-tag{display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:999px;border:1px solid rgba(34,211,238,.22);background:rgba(34,211,238,.08);color:#bae6fd;font-size:11px}.wb-tag--warn{border-color:rgba(251,191,36,.3);background:rgba(251,191,36,.08);color:#fde68a}.wb-tag--danger{border-color:rgba(251,113,133,.32);background:rgba(251,113,133,.08);color:#fecdd3}.wb-tag--ok{border-color:rgba(52,211,153,.3);background:rgba(52,211,153,.08);color:#bbf7d0}.wb-action{display:inline-flex;align-items:center;gap:5px;margin-right:10px;white-space:nowrap;cursor:pointer;color:#67e8f9}.wb-action:hover{color:#fff}.wb-action--hot{color:#fbbf24}.wb-action--danger{color:#fb7185}.wb-modal-mask{position:fixed;inset:0;z-index:120;display:none;align-items:center;justify-content:center;background:rgba(2,8,23,.68);padding:20px}.wb-modal-mask.show{display:flex}.wb-modal{width:min(760px,94vw);border:1px solid rgba(34,211,238,.2);border-radius:8px;background:#071426;box-shadow:0 30px 90px rgba(0,0,0,.5)}' +
      '.wb-approval-mask{position:fixed;inset:0;z-index:130;display:none;align-items:center;justify-content:center;background:rgba(2,8,23,.72);padding:22px}.wb-approval-mask.show{display:flex}.wb-approval-modal{width:min(1080px,96vw);max-height:88vh;overflow:auto;border:1px solid rgba(34,211,238,.25);border-radius:10px;background:#071b33;box-shadow:0 20px 60px rgba(0,0,0,.55)}' +
      '.wb-notify-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 24px}.wb-notify-detail-item--full{grid-column:1/-1}.wb-notify-detail-key{display:block;font-size:11px;color:#9cc6df;margin-bottom:6px}.wb-notify-detail-val{display:block;font-size:13px;color:#ecfeff;line-height:1.5;word-break:break-word}.wb-notify-detail-val--pass{color:#34d399;font-weight:600}.wb-notify-detail-val--reject{color:#fb7185;font-weight:600}' +
      '.wb-approval-modal .field-label{color:#9cc6df;font-size:12px;margin-bottom:6px;display:block}.status-dot{width:7px;height:7px;border-radius:999px;display:inline-block;margin-right:6px}' +
      '.approval-records-scroll{max-height:min(520px,58vh);overflow-y:auto;padding:2px 8px 2px 2px}.approval-item{display:flex;gap:12px;align-items:stretch;padding:0 0 18px;border:none}.approval-item--last{padding-bottom:0}.approval-item__rail{display:flex;flex-direction:column;align-items:center;width:20px;flex-shrink:0}.approval-item__dot{width:12px;height:12px;min-width:12px;min-height:12px;border-radius:50%;background:#64748b;flex-shrink:0}.approval-item__line{flex:1;width:2px;min-height:14px;margin-top:4px;background:rgba(148,163,184,.22)}.approval-item.pass .approval-item__dot{background:#22c55e}.approval-item.wait .approval-item__dot{background:#f59e0b}.approval-item.reject .approval-item__dot{background:#ef4444}.approval-item__content{flex:1;min-width:0}' +
    '</style>');
  }

  function filterControl(item) {
    if (item.type === "date") return '<div class="min-w-[150px]"><label class="wh-filter-label block mb-1.5">' + item.label + '</label><input data-filter="' + item.id + '" type="date" class="wh-input h-8 w-full px-2"></div>';
    return '<div class="min-w-[150px]"><label class="wh-filter-label block mb-1.5">' + item.label + '</label><select data-filter="' + item.id + '" class="wh-input h-8 w-full px-2">' + item.options.map(function (option) { return '<option>' + option + '</option>'; }).join("") + '</select></div>';
  }

  function tag(value) {
    var cls =
      value === "未读" || value === "待处理" || value === "待审批" || value === "未复核"
        ? "wb-tag--warn"
        : value === "驳回" || value === "审核不通过"
          ? "wb-tag--danger"
          : value === "通过" ||
              value === "已处置" ||
              value === "已续期" ||
              value === "已读" ||
              value === "已复核" ||
              value === "审核通过"
            ? "wb-tag--ok"
            : "";
    return '<span class="wb-tag ' + cls + '">' + esc(value) + '</span>';
  }

  function rowCells(key, row, index) {
    if (key === "wb-todo") return [row.title, row.source, row.user, row.time, tag(row.status), todoActions(row, index)];
    if (key === "wb-sys-notify") return [row.title, tag(row.type), row.time, tag(row.read), actions(row, index)];
    if (key === "wb-done") {
      return [row.title, tag(row.type), row.source, row.user, row.time, tag(row.result), actions(row, index)];
    }
    return [row.title, tag(row.type), row.source, row.user, row.time, tag(row.result), row.opinion, actions(row, index)];
  }

  function todoActionNames(row) {
    if (row.tab === "approval") return ["查看", "审批"];
    var ws = row.workflowStatus || row.status;
    if (ws === "未复核") return ["查看", "复核"];
    if (ws === "已复核") return ["查看", "审核"];
    return ["查看"];
  }

  function todoActions(row, index) {
    return todoActionNames(row)
      .map(function (name) {
        var cls =
          name === "审批" || name === "复核" || name === "审核"
            ? " wb-action--hot"
            : "";
        var icon =
          name === "审批"
            ? "fa-file-signature"
            : name === "复核"
              ? "fa-clipboard-check"
              : name === "审核"
                ? "fa-stamp"
                : "fa-eye";
        return (
          '<span class="wb-action' +
          cls +
          '" data-action="' +
          esc(name) +
          '" data-index="' +
          index +
          '" data-row-title="' +
          esc(row.title) +
          '"><i class="fa-regular ' +
          icon +
          '"></i>' +
          name +
          "</span>"
        );
      })
      .join("");
  }

  function actions(row, index) {
    var names = (current.actions || []).slice();
    return names.map(function (name) {
      var cls = name.indexOf("删除") > -1 ? " wb-action--danger" : name.indexOf("处理") > -1 || name.indexOf("标记") > -1 || name === "审批" ? " wb-action--hot" : "";
      var icon = name.indexOf("删除") > -1 ? "fa-trash-can" : name === "审批" ? "fa-file-signature" : name.indexOf("处理") > -1 ? "fa-bolt" : name.indexOf("标记") > -1 ? "fa-envelope-open" : "fa-eye";
      return '<span class="wb-action' + cls + '" data-action="' + esc(name) + '" data-index="' + index + '" data-row-title="' + esc(row.title) + '"><i class="fa-regular ' + icon + '"></i>' + name + "</span>";
    }).join("");
  }

  function renderRows(rows) {
    var key = document.body.dataset.sidebarKey;
    document.getElementById("wb-total").textContent = rows.length;
    var tabCount = document.getElementById("wb-todo-tab-count");
    if (tabCount && key === "wb-todo") tabCount.textContent = rows.length;
    document.getElementById("wb-body").innerHTML = rows.map(function (row, index) {
      return '<tr class="' + (index % 2 ? "bg-slate-950/10" : "bg-slate-950/25") + '">' + rowCells(key, row, index).map(function (cell) {
        return '<td class="px-3">' + cell + '</td>';
      }).join("") + '</tr>';
    }).join("");
  }

  function rowByTitle(title) {
    var t = title == null ? "" : String(title);
    return current.rows.find(function (r) { return r.title === t; });
  }

  function todoPlanFromRow(row) {
    var name = row.title.indexOf("飞行计划审批 ") === 0 ? row.title.slice("飞行计划审批 ".length) : row.title;
    return { name: name || row.title, audit: "审核中" };
  }

  function approvalRecordsTodo(plan) {
    var base = [
      { person: "张工", time: "2026-05-13 09:24", status: "审批通过", opinion: "申请资料完整，航线与空域许可匹配。" },
      { person: "李工", time: "2026-05-13 09:42", status: "审批通过", opinion: "施工保护区范围核对无误，同意执行。" },
      { person: "陈工", time: "2026-05-13 10:05", status: "审核中", opinion: "待核验无人机电池与载荷状态。" },
      { person: "王主任", time: "-", status: "待审批", opinion: "-" },
      { person: "赵经理", time: "-", status: "待审批", opinion: "-" }
    ];
    if (plan.audit === "审核通过") return base.map(function (r) { return Object.assign({}, r, { status: "审批通过", time: r.time === "-" ? "2026-05-13 10:36" : r.time, opinion: r.opinion === "-" ? "审批通过，同意按计划执行。" : r.opinion }); });
    if (plan.audit === "已驳回") return base.map(function (r, i) { return i === 2 ? Object.assign({}, r, { status: "已驳回", time: "2026-05-13 10:12", opinion: "空域许可临期，请补充续期材料后重新提交。" }) : r; });
    return base;
  }

  function recordClassTodo(status) {
    if (status === "审批通过") return "pass";
    if (status === "审核中") return "wait";
    if (status === "已驳回") return "reject";
    return "";
  }

  function renderApprovalRecordsTodo(plan) {
    if (window.ApprovalTimeline) {
      return ApprovalTimeline.renderApprovalRecords(approvalRecordsTodo(plan));
    }
    return "";
  }

  function buildTodoApprovalHtml(plan) {
    var planBadge = window.ApprovalTimeline
      ? ApprovalTimeline.statusBadge(plan.audit)
      : esc(plan.audit);
    return '<div class="mb-4 flex items-center justify-between gap-3"><div><div class="text-cyan-100 font-semibold">' + esc(plan.name) + '</div><div class="mt-1 text-xs text-slate-400">审批流程：提交 → 工长 → 工务 → 物管 → 车间主任 → 部门领导</div></div>' + planBadge + '</div><div class="grid md:grid-cols-[360px_1fr] gap-4"><section class="rounded border border-cyan-400/20 bg-slate-950/25 p-4"><div class="text-sm font-semibold text-cyan-100 mb-3">审批意见</div><label><span class="field-label">审批意见</span><textarea id="wb-approval-opinion" class="wh-input w-full px-3 py-2 min-h-[132px]" placeholder="请输入审批意见">同意该飞行计划按审批流程继续执行。</textarea></label><div class="mt-4 flex justify-end gap-2"><button type="button" id="wb-reject-btn" class="wh-btn-ghost px-4 py-2">驳回</button><button type="button" id="wb-approve-btn" class="wh-btn-primary px-4 py-2">审批通过</button></div><div class="mt-3 text-xs text-cyan-100 leading-6">系统校验：飞行计划审批通过、航线空域许可有效、无人机满足起飞条件才允许起飞。</div></section><section class="rounded border border-cyan-400/20 bg-slate-950/25 p-4"><div class="text-sm font-semibold text-cyan-100 mb-4">审批记录</div><div id="wb-approval-records">' + renderApprovalRecordsTodo(plan) + "</div></section></div>";
  }

  function openTodoFlightApproval(row) {
    var plan = todoPlanFromRow(row);
    document.getElementById("wb-approval-box").innerHTML = buildTodoApprovalHtml(plan);
    document.getElementById("wb-approve-btn").onclick = function () { submitTodoApproval("审批通过"); };
    document.getElementById("wb-reject-btn").onclick = function () { submitTodoApproval("已驳回"); };
    document.getElementById("wb-approval-mask").classList.add("show");
  }

  function submitTodoApproval(status) {
    var ta = document.getElementById("wb-approval-opinion");
    var opinion = (ta && ta.value || "").trim();
    if (!opinion) {
      alert("请填写审批意见");
      return;
    }
    document.getElementById("wb-approval-mask").classList.remove("show");
    alert(status === "审批通过" ? "审批通过，已写入审批记录" : "已驳回，审批意见已记录");
  }

  function notifyTypeLabel(row) {
    if (row.type === "提醒" || row.type === "空域许可提醒") return "空域许可提醒";
    return row.type || "—";
  }

  function isAirspaceNotify(row) {
    return row.type === "空域许可提醒" || row.type === "提醒";
  }

  function notifyDetailField(label, value, opts) {
    opts = opts || {};
    var valClass = "wb-notify-detail-val";
    if (opts.tone === "pass") valClass += " wb-notify-detail-val--pass";
    if (opts.tone === "reject") valClass += " wb-notify-detail-val--reject";
    var itemClass = "wb-notify-detail-item" + (opts.full ? " wb-notify-detail-item--full" : "");
    return (
      '<div class="' +
      itemClass +
      '"><span class="wb-notify-detail-key">' +
      esc(label) +
      '</span><span class="' +
      valClass +
      '">' +
      esc(value == null || value === "" ? "—" : value) +
      "</span></div>"
    );
  }

  function notifyDetail(row) {
    var html;
    if (row.type === "审批消息") {
      var resultTone = row.auditResult === "审批通过" ? "pass" : row.auditResult === "已驳回" ? "reject" : "";
      html = [
        notifyDetailField("标题", row.title, { full: true }),
        notifyDetailField("计划名称", row.planName),
        notifyDetailField("飞行航线", row.route),
        notifyDetailField("使用机场", row.airport),
        notifyDetailField("审批结果", row.auditResult, { tone: resultTone }),
        notifyDetailField("通知类型", "审批消息"),
        notifyDetailField("发布时间", row.time),
      ].join("");
    } else if (isAirspaceNotify(row)) {
      html = [
        notifyDetailField("标题", row.title, { full: true }),
        notifyDetailField("审批号", row.approvalNo),
        notifyDetailField("航线名称", row.routeName),
        notifyDetailField("审批通过", row.approvedAt),
        notifyDetailField("许可结束", row.permitEnd),
        notifyDetailField("备注", row.remark, { full: true }),
        notifyDetailField("通知类型", "空域许可提醒"),
        notifyDetailField("发布时间", row.time),
      ].join("");
    } else {
      html = notifyDetailField("标题", row.title, { full: true }) + notifyDetailField("发布时间", row.time);
    }
    document.getElementById("wb-modal-body").innerHTML = '<div class="wb-notify-detail-grid">' + html + "</div>";
    document.getElementById("wb-modal-mask").classList.add("show");
  }

  function markNotifyRead(row) {
    if (!row || row.read === "已读") return;
    row.read = "已读";
    if (global.WHHeaderBadges) WHHeaderBadges.markNotifyRead(row);
  }

  function openNotifyView(row) {
    markNotifyRead(row);
    notifyDetail(row);
    applyFilter();
  }

  function openDoneView(row) {
    if (!row) return;
    if (row.doneKind === "flight-plan" && row.planId && global.TodoModalBridge) {
      global.TodoModalBridge.mountModals();
      global.TodoModalBridge.openFlightPlanDetail(row.planId);
      return;
    }
    if (row.doneKind === "alarm" && row.alertId && global.TodoModalBridge) {
      global.TodoModalBridge.mountModals();
      global.TodoModalBridge.openAlarmDetail(row.alertId, row);
      return;
    }
    if (row.doneKind === "airspace") {
      notifyDetail({
        type: "空域许可提醒",
        title: row.title,
        approvalNo: row.approvalNo,
        routeName: row.routeName,
        approvedAt: row.approvedAt,
        permitEnd: row.permitEnd,
        remark: row.remark || row.opinion,
        time: row.notifyTime || row.time,
      });
      return;
    }
    detail(row);
  }

  function detail(row) {
    var key = document.body.dataset.sidebarKey;
    if (key === "wb-sys-notify") {
      notifyDetail(row);
      return;
    }
    var body = Object.keys(row).filter(function (k) { return k !== "note"; }).map(function (k) {
      var labels = { title: "标题", type: "类型", source: "来源模块", user: "人员", time: "时间", status: "当前状态", read: "是否已读", result: "处理结果", opinion: "处理意见" };
      return '<div class="grid grid-cols-[96px_1fr] gap-3 text-xs"><span class="text-cyan-100/70 text-right">' + (labels[k] || k) + '：</span><span class="text-slate-100">' + esc(row[k]) + '</span></div>';
    }).join("");
    document.getElementById("wb-modal-body").innerHTML = body + (row.note ? '<div class="mt-4 rounded border border-cyan-400/15 bg-cyan-500/5 px-3 py-2 text-xs text-cyan-50/85">' + esc(row.note) + '</div>' : "");
    document.getElementById("wb-modal-mask").classList.add("show");
  }

  function visibleTodoRows() {
    var tab = current.activeTab || "approval";
    return current.rows.filter(function (row) {
      return row.tab === tab;
    });
  }

  function applyFilter() {
    var values = {};
    document.querySelectorAll("[data-filter]").forEach(function (el) {
      values[el.dataset.filter] = el.value;
    });
    var base = document.body.dataset.sidebarKey === "wb-todo" ? visibleTodoRows() : current.rows;
    var rows = base.filter(function (row) {
      if (values.status && values.status !== "全部" && row.status !== values.status) return false;
      if (values.result && values.result !== "全部" && row.result !== values.result) return false;
      if (values.type && values.type !== "全部" && row.type !== values.type) return false;
      var rowTime = row.time ? row.time.slice(0, 10) : "";
      if (values.start && rowTime < values.start) return false;
      if (values.end && rowTime > values.end) return false;
      return true;
    });
    renderRows(rows);
  }

  function switchTodoTab(tabKey) {
    current.activeTab = tabKey;
    document.querySelectorAll("[data-todo-tab]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-todo-tab") === tabKey);
    });
    document.querySelectorAll("[data-filter]").forEach(function (el) {
      el.selectedIndex = 0;
      el.value = "";
    });
    renderRows(visibleTodoRows());
  }

  var current = null;
  function init() {
    var key = document.body.dataset.sidebarKey;
    current = configs[key];
    if (!current) return;
    style();
    document.title = current.title;
    var tabBarHtml =
      key === "wb-todo" && current.tabs
        ? '<section class="neon-panel neon-panel--tight px-4 py-3 mb-4"><div class="wb-todo-tabbar">' +
          current.tabs
            .map(function (tab) {
              return (
                '<button type="button" class="wb-todo-tab' +
                (tab.key === current.activeTab ? " is-active" : "") +
                '" data-todo-tab="' +
                tab.key +
                '">' +
                tab.label +
                "</button>"
              );
            })
            .join("") +
          "</div></section>"
        : "";

    document.getElementById("wb-app").innerHTML =
      '<nav class="neon-panel neon-panel--tight mb-4 px-4 py-2.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400"><span class="text-cyan-400"><i class="fa-solid fa-location-crosshairs"></i></span><span>我的工作台</span><span class="text-slate-600">&gt;&gt;</span><span class="text-cyan-50 font-semibold tracking-wide">' + current.title + '</span></nav>' +
      '<section class="wb-hero mb-4 px-5 py-4 flex flex-wrap items-center gap-4"><div><h1 class="text-lg font-semibold text-white">' + current.title + '</h1><div class="text-xs text-cyan-100/70 mt-1">' + current.badge + '</div></div><div class="wb-stat ml-auto text-xs text-slate-300">' + (key === "wb-done" ? "已处理" : "待处理") + ' <b class="text-cyan-200 text-lg ml-2" id="wb-todo-tab-count">' + (key === "wb-todo" ? visibleTodoRows().length : current.rows.length) + '</b></div></section>' +
      tabBarHtml +
      '<section class="neon-panel neon-panel--tight p-3 mb-4 flex flex-wrap items-end gap-3">' + current.filters.map(filterControl).join("") + '<div class="ml-auto flex gap-2"><button data-action="query" class="px-4 h-8 rounded text-xs wh-btn-primary">查询</button><button data-action="reset" class="px-4 h-8 rounded text-xs wh-btn-ghost">重置</button></div></section>' +
      '<section class="neon-panel neon-panel--tight p-3 mb-4 flex flex-wrap items-center gap-2">' + (current.toolbar || []).map(function (name) { return '<button data-action="' + name + '" class="px-4 h-8 rounded text-xs wh-btn-primary">' + name + '</button>'; }).join("") + '<button data-action="export" class="px-4 h-8 rounded text-xs wh-btn-ghost">导出</button></section>' +
      '<section class="wh-table-shell bg-slate-950/35"><div class="overflow-x-auto"><table class="wb-table min-w-[1180px] w-full text-left"><thead><tr>' + current.columns.map(function (col) { return '<th class="px-3 text-cyan-50/95">' + col + '</th>'; }).join("") + '</tr></thead><tbody id="wb-body"></tbody></table></div><div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-cyan-400/15 bg-slate-950/55 text-[11px] text-slate-400"><span>共 <b id="wb-total" class="text-cyan-200">0</b> 条</span><button class="min-w-[32px] h-8 rounded text-xs wh-btn-primary">1</button></div></section>' +
      '<div id="wb-modal-mask" class="wb-modal-mask"><div class="wb-modal"><div class="h-14 px-6 flex items-center justify-between gap-3 border-b border-cyan-400/15"><h3 class="text-white text-[16px] font-semibold">详情</h3><button type="button" data-action="close-modal" class="wh-modal-close" aria-label="关闭">×</button></div><div id="wb-modal-body" class="p-6 space-y-3"></div></div></div>' +
      '<div id="wb-approval-mask" class="wb-approval-mask"><div class="wb-approval-modal"><div class="flex items-center justify-between px-5 py-4 border-b border-white/10"><h3 class="text-base font-semibold text-white">飞行计划审批</h3><button type="button" data-action="close-approval" class="wh-modal-close" aria-label="关闭">×</button></div><div id="wb-approval-box" class="p-5"></div></div></div>';
    if (key === "wb-sys-notify" && global.WHHeaderBadges) {
      WHHeaderBadges.applyNotifyReadToRows(current.rows);
    }
    if (key === "wb-todo") {
      if (global.TodoModalBridge) global.TodoModalBridge.mountModals();
      renderRows(visibleTodoRows());
    } else if (key === "wb-done") {
      if (global.TodoModalBridge) global.TodoModalBridge.mountModals();
      renderRows(current.rows);
    } else {
      renderRows(current.rows);
    }
    if (global.WHHeaderBadges) WHHeaderBadges.refresh();

    document.getElementById("wb-app").addEventListener("click", function (event) {
      var tabBtn = event.target.closest("[data-todo-tab]");
      if (tabBtn && key === "wb-todo") {
        switchTodoTab(tabBtn.getAttribute("data-todo-tab"));
        return;
      }

      var node = event.target.closest("[data-action]");
      if (!node) return;
      var action = node.dataset.action;
      var index = Number(node.dataset.index);
      if (action === "query") applyFilter();
      if (action === "reset") {
        document.querySelectorAll("[data-filter]").forEach(function (el) {
          el.selectedIndex = 0;
          el.value = "";
        });
        if (key === "wb-todo") renderRows(visibleTodoRows());
        else renderRows(current.rows);
      }
      if (action === "close-modal") document.getElementById("wb-modal-mask").classList.remove("show");
      if (action === "close-approval") document.getElementById("wb-approval-mask").classList.remove("show");

      var rowFromClick = rowByTitle(node.dataset.rowTitle);
      var r = rowFromClick != null ? rowFromClick : current.rows[index];

      if (key === "wb-todo" && r) {
        if (action === "查看") {
          if (r.tab === "approval" && r.planId && window.TodoModalBridge) {
            TodoModalBridge.openFlightPlanDetail(r.planId);
          } else if (r.tab === "alert" && r.alertId && window.TodoModalBridge) {
            TodoModalBridge.openAlarmDetail(r.alertId, r);
          } else {
            detail(r);
          }
          return;
        }
        if (action === "审批") {
          openTodoFlightApproval(r);
          return;
        }
        if (action === "复核" && r.alertId && window.TodoModalBridge) {
          TodoModalBridge.openAlarmReview(r.alertId, r, function () {
            applyFilter();
          });
          return;
        }
        if (action === "审核" && r.alertId && window.TodoModalBridge) {
          TodoModalBridge.openAlarmAudit(r.alertId, r, function () {
            applyFilter();
          });
          return;
        }
      }

      if (key === "wb-sys-notify" && r) {
        if (action === "查看") {
          openNotifyView(r);
          return;
        }
        if (action === "全部已读") {
          current.rows.forEach(function (item) {
            item.read = "已读";
          });
          if (global.WHHeaderBadges) WHHeaderBadges.markAllNotifyRead();
          applyFilter();
          return;
        }
      }

      if (key === "wb-done" && r && action === "查看") {
        openDoneView(r);
        return;
      }

      if (action === "查看" || action === "查看详情") {
        if (r) detail(r);
      }
      if (action === "删除" || action === "export") alert("原型演示：操作已触发");
    });
  }
  document.addEventListener("DOMContentLoaded", init);
})(typeof window !== "undefined" ? window : this);
