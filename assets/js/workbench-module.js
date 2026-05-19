(function () {
  var configs = {
    "wb-todo": {
      title: "待办",
      badge: "当前用户待处理任务",
      filters: [
        { id: "type", label: "事项类型", options: ["全部", "审批", "告警"] },
        { id: "status", label: "状态", options: ["全部", "待审批", "待处理", "处理中"] },
        { id: "start", label: "开始时间", type: "date" },
        { id: "end", label: "结束时间", type: "date" }
      ],
      columns: ["标题", "类型", "来源模块", "发起人", "创建时间", "当前状态", "操作"],
      rows: [
        { title: "飞行计划审批 FP-20260515003", type: "审批", source: "飞行计划", user: "张文杰", time: "2026-05-15 09:18", status: "待审批", note: "审批通过/驳回后流转至申请人通知及已处理事项。" },
        { title: "重点保护区越界告警处置", type: "告警", source: "地图驾驶舱", user: "系统", time: "2026-05-15 08:42", status: "待处理", note: "报警点附近机场及关联无人机已完成推荐。" },
        { title: "飞行计划审批 FP-20260514011", type: "审批", source: "飞行计划", user: "李明", time: "2026-05-14 17:30", status: "待审批", note: "审批人处理后，申请人将收到审批消息。" },
        { title: "夜间巡查异常复核", type: "告警", source: "智慧巡检", user: "系统", time: "2026-05-14 14:06", status: "处理中", note: "需补充现场处置意见。" }
      ],
      actions: ["查看", "立即处理"]
    },
    "wb-sys-notify": {
      title: "系统通知",
      badge: "审批结果与到期提醒",
      filters: [
        { id: "type", label: "通知类型", options: ["全部", "提醒", "审批消息"] },
        { id: "start", label: "发布开始", type: "date" },
        { id: "end", label: "发布结束", type: "date" }
      ],
      columns: ["标题", "通知类型", "来源", "发布时间", "是否已读", "操作"],
      rows: [
        { title: "飞行计划 FP-20260514011 已审批通过", type: "审批消息", source: "飞行计划", time: "2026-05-15 10:02", read: "未读", note: "审批结果通知申请人，无需再次审批处理。" },
        { title: "飞行计划 FP-20260513006 已驳回", type: "审批消息", source: "飞行计划", time: "2026-05-14 18:20", read: "已读", note: "驳回原因：航线空域许可缺失。" },
        { title: "青山站外业巡检航线空域许可即将到期", type: "提醒", source: "空域许可", time: "2026-05-14 09:00", read: "未读", note: "到期前自动提醒相关负责人及时续期，不需要审批处理。" },
        { title: "车辆段日常巡查航线空域许可剩余 7 天", type: "提醒", source: "空域许可", time: "2026-05-13 09:00", read: "未读", note: "请负责人完成续期材料准备。" }
      ],
      actions: ["查看详情", "标记已读", "删除"],
      toolbar: ["全部已读"]
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
      columns: ["标题", "类型", "来源模块", "处理人", "处理时间", "处理结果", "处理意见", "操作"],
      rows: [
        { title: "飞行计划审批 FP-20260513006", type: "审批", source: "飞行计划", user: "王主任", time: "2026-05-14 18:20", result: "驳回", opinion: "航线空域许可缺失，需补充材料后重新提交。" },
        { title: "飞行计划审批 FP-20260512009", type: "审批", source: "飞行计划", user: "王主任", time: "2026-05-13 11:16", result: "通过", opinion: "同意按计划执行，起飞前再次校验机场状态。" },
        { title: "重点保护区越界告警", type: "告警", source: "地图驾驶舱", user: "鲍雄澎", time: "2026-05-12 16:42", result: "已处置", opinion: "已派发人工复核，现场确认无新增施工。" },
        { title: "车辆段日常巡查航线许可续期", type: "空域许可续期", source: "空域许可", user: "李玲", time: "2026-05-11 10:30", result: "已续期", opinion: "新许可有效期已同步至航线库。" }
      ],
      actions: ["查看详情"]
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
      '.wb-approval-modal .field-label{color:#9cc6df;font-size:12px;margin-bottom:6px;display:block}.status-dot{width:7px;height:7px;border-radius:999px;display:inline-block;margin-right:6px}' +
      '.approval-item{position:relative;padding:0 0 18px 28px;border-left:1px solid rgba(34,211,238,.28)}.approval-item:last-child{padding-bottom:0}.approval-item::before{content:"";position:absolute;left:-6px;top:2px;width:11px;height:11px;border-radius:50%;background:#64748b;box-shadow:0 0 0 4px rgba(100,116,139,.15)}' +
      '.approval-item.pass::before{background:#22c55e;box-shadow:0 0 0 4px rgba(34,197,94,.16)}.approval-item.wait::before{background:#f59e0b;box-shadow:0 0 0 4px rgba(245,158,11,.16)}.approval-item.reject::before{background:#ef4444;box-shadow:0 0 0 4px rgba(239,68,68,.16)}' +
    '</style>');
  }

  function filterControl(item) {
    if (item.type === "date") return '<div class="min-w-[150px]"><label class="wh-filter-label block mb-1.5">' + item.label + '</label><input data-filter="' + item.id + '" type="date" class="wh-input h-8 w-full px-2"></div>';
    return '<div class="min-w-[150px]"><label class="wh-filter-label block mb-1.5">' + item.label + '</label><select data-filter="' + item.id + '" class="wh-input h-8 w-full px-2">' + item.options.map(function (option) { return '<option>' + option + '</option>'; }).join("") + '</select></div>';
  }

  function tag(value) {
    var cls = value === "未读" || value === "待处理" || value === "待审批" ? "wb-tag--warn" : value === "驳回" ? "wb-tag--danger" : value === "通过" || value === "已处置" || value === "已续期" || value === "已读" ? "wb-tag--ok" : "";
    return '<span class="wb-tag ' + cls + '">' + esc(value) + '</span>';
  }

  function rowCells(key, row, index) {
    if (key === "wb-todo") return [row.title, tag(row.type), row.source, row.user, row.time, tag(row.status), actions(row, index)];
    if (key === "wb-sys-notify") return [row.title, tag(row.type), row.source, row.time, tag(row.read), actions(row, index)];
    return [row.title, tag(row.type), row.source, row.user, row.time, tag(row.result), row.opinion, actions(row, index)];
  }

  function actions(row, index) {
    var names = current.actions.slice();
    if (document.body.dataset.sidebarKey === "wb-todo" && row.type === "审批" && row.source === "飞行计划") {
      names = names.map(function (n) { return n === "立即处理" ? "审批" : n; });
    }
    return names.map(function (name) {
      var cls = name.indexOf("删除") > -1 ? " wb-action--danger" : name.indexOf("处理") > -1 || name.indexOf("标记") > -1 || name === "审批" ? " wb-action--hot" : "";
      var icon = name.indexOf("删除") > -1 ? "fa-trash-can" : name === "审批" ? "fa-file-signature" : name.indexOf("处理") > -1 ? "fa-bolt" : name.indexOf("标记") > -1 ? "fa-envelope-open" : "fa-eye";
      return '<span class="wb-action' + cls + '" data-action="' + esc(name) + '" data-index="' + index + '" data-row-title="' + esc(row.title) + '"><i class="fa-regular ' + icon + '"></i>' + name + "</span>";
    }).join("");
  }

  function renderRows(rows) {
    var key = document.body.dataset.sidebarKey;
    document.getElementById("wb-total").textContent = rows.length;
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

  function auditBadgeHtml(text) {
    var type = text === "审核通过" || text === "审批通过" ? "wh-status--done" : text === "审核中" ? "wh-status--progress" : "wh-status--pending";
    return '<span class="wh-status ' + type + '"><span class="status-dot" style="background:currentColor"></span>' + esc(text) + "</span>";
  }

  function renderApprovalRecordsTodo(plan) {
    return approvalRecordsTodo(plan).map(function (r) {
      var badgeText = r.status === "待审批" ? "审核中" : r.status;
      return '<div class="approval-item ' + recordClassTodo(r.status) + '"><div class="flex flex-wrap items-center gap-3"><span class="font-semibold text-cyan-100">' + esc(r.person) + "</span>" + auditBadgeHtml(badgeText) + '<span class="text-xs text-slate-400">' + esc(r.time) + '</span></div><div class="mt-2 text-xs text-slate-300 leading-5">审批意见：' + esc(r.opinion) + "</div></div>";
    }).join("");
  }

  function buildTodoApprovalHtml(plan) {
    return '<div class="mb-4 flex items-center justify-between gap-3"><div><div class="text-cyan-100 font-semibold">' + esc(plan.name) + '</div><div class="mt-1 text-xs text-slate-400">审批流程：提交 → 工长 → 工务 → 物管 → 车间主任 → 部门领导</div></div>' + auditBadgeHtml(plan.audit) + '</div><div class="grid md:grid-cols-[360px_1fr] gap-4"><section class="rounded border border-cyan-400/20 bg-slate-950/25 p-4"><div class="text-sm font-semibold text-cyan-100 mb-3">审批意见</div><label><span class="field-label">审批意见</span><textarea id="wb-approval-opinion" class="wh-input w-full px-3 py-2 min-h-[132px]" placeholder="请输入审批意见">同意该飞行计划按审批流程继续执行。</textarea></label><div class="mt-4 flex justify-end gap-2"><button type="button" id="wb-reject-btn" class="wh-btn-ghost px-4 py-2">驳回</button><button type="button" id="wb-approve-btn" class="wh-btn-primary px-4 py-2">审批通过</button></div><div class="mt-3 text-xs text-cyan-100 leading-6">系统校验：空域许可有效、无人机状态正常、航线审批通过后才允许起飞。</div></section><section class="rounded border border-cyan-400/20 bg-slate-950/25 p-4"><div class="text-sm font-semibold text-cyan-100 mb-4">审批记录</div><div id="wb-approval-records">' + renderApprovalRecordsTodo(plan) + "</div></section></div>";
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

  function detail(row) {
    var body = Object.keys(row).filter(function (key) { return key !== "note"; }).map(function (key) {
      var labels = { title: "标题", type: "类型", source: "来源模块", user: "人员", time: "时间", status: "当前状态", read: "是否已读", result: "处理结果", opinion: "处理意见" };
      return '<div class="grid grid-cols-[96px_1fr] gap-3 text-xs"><span class="text-cyan-100/70 text-right">' + (labels[key] || key) + '：</span><span class="text-slate-100">' + esc(row[key]) + '</span></div>';
    }).join("");
    document.getElementById("wb-modal-body").innerHTML = body + (row.note ? '<div class="mt-4 rounded border border-cyan-400/15 bg-cyan-500/5 px-3 py-2 text-xs text-cyan-50/85">' + esc(row.note) + '</div>' : "");
    document.getElementById("wb-modal-mask").classList.add("show");
  }

  function applyFilter() {
    var values = {};
    document.querySelectorAll("[data-filter]").forEach(function (el) { values[el.dataset.filter] = el.value; });
    var rows = current.rows.filter(function (row) {
      if (values.type && values.type !== "全部" && row.type !== values.type) return false;
      if (values.status && values.status !== "全部" && row.status !== values.status) return false;
      if (values.result && values.result !== "全部" && row.result !== values.result) return false;
      var rowTime = row.time ? row.time.slice(0, 10) : "";
      if (values.start && rowTime < values.start) return false;
      if (values.end && rowTime > values.end) return false;
      return true;
    });
    renderRows(rows);
  }

  var current = null;
  function init() {
    var key = document.body.dataset.sidebarKey;
    current = configs[key];
    if (!current) return;
    style();
    document.title = current.title;
    document.getElementById("wb-app").innerHTML =
      '<nav class="neon-panel neon-panel--tight mb-4 px-4 py-2.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400"><span class="text-cyan-400"><i class="fa-solid fa-location-crosshairs"></i></span><span>我的工作台</span><span class="text-slate-600">&gt;&gt;</span><span class="text-cyan-50 font-semibold tracking-wide">' + current.title + '</span></nav>' +
      '<section class="wb-hero mb-4 px-5 py-4 flex flex-wrap items-center gap-4"><div><h1 class="text-lg font-semibold text-white">' + current.title + '</h1><div class="text-xs text-cyan-100/70 mt-1">' + current.badge + '</div></div><div class="wb-stat ml-auto text-xs text-slate-300">今日新增 <b class="text-cyan-200 text-lg ml-2">' + current.rows.length + '</b></div></section>' +
      '<section class="neon-panel neon-panel--tight p-3 mb-4 flex flex-wrap items-end gap-3">' + current.filters.map(filterControl).join("") + '<div class="ml-auto flex gap-2"><button data-action="query" class="px-4 h-8 rounded text-xs wh-btn-primary">查询</button><button data-action="reset" class="px-4 h-8 rounded text-xs wh-btn-ghost">重置</button></div></section>' +
      '<section class="neon-panel neon-panel--tight p-3 mb-4 flex flex-wrap items-center gap-2">' + (current.toolbar || []).map(function (name) { return '<button data-action="' + name + '" class="px-4 h-8 rounded text-xs wh-btn-primary">' + name + '</button>'; }).join("") + '<button data-action="export" class="px-4 h-8 rounded text-xs wh-btn-ghost">导出</button></section>' +
      '<section class="wh-table-shell bg-slate-950/35"><div class="overflow-x-auto"><table class="wb-table min-w-[1180px] w-full text-left"><thead><tr>' + current.columns.map(function (col) { return '<th class="px-3 text-cyan-50/95">' + col + '</th>'; }).join("") + '</tr></thead><tbody id="wb-body"></tbody></table></div><div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-cyan-400/15 bg-slate-950/55 text-[11px] text-slate-400"><span>共 <b id="wb-total" class="text-cyan-200">0</b> 条</span><button class="min-w-[32px] h-8 rounded text-xs wh-btn-primary">1</button></div></section>' +
      '<div id="wb-modal-mask" class="wb-modal-mask"><div class="wb-modal"><div class="h-14 px-6 flex items-center border-b border-cyan-400/15"><h3 class="text-white text-[16px] font-semibold">详情</h3><button data-action="close-modal" class="ml-auto text-slate-400 hover:text-slate-200 text-xl">×</button></div><div id="wb-modal-body" class="p-6 space-y-3"></div></div></div>' +
      '<div id="wb-approval-mask" class="wb-approval-mask"><div class="wb-approval-modal"><div class="flex items-center justify-between px-5 py-4 border-b border-white/10"><h3 class="text-base font-semibold text-white">飞行计划审批</h3><button type="button" data-action="close-approval" class="px-3 py-1 rounded text-xs wh-btn-ghost">关闭</button></div><div id="wb-approval-box" class="p-5"></div></div></div>';
    renderRows(current.rows);
    document.addEventListener("click", function (event) {
      var node = event.target.closest("[data-action]");
      if (!node) return;
      var action = node.dataset.action;
      var index = Number(node.dataset.index);
      if (action === "query") applyFilter();
      if (action === "reset") { document.querySelectorAll("[data-filter]").forEach(function (el) { el.selectedIndex = 0; el.value = ""; }); renderRows(current.rows); }
      if (action === "close-modal") document.getElementById("wb-modal-mask").classList.remove("show");
      if (action === "close-approval") document.getElementById("wb-approval-mask").classList.remove("show");
      var rowFromClick = rowByTitle(node.dataset.rowTitle);
      if (action === "查看" || action === "查看详情") {
        var r = rowFromClick != null ? rowFromClick : current.rows[index];
        if (r) detail(r);
      }
      if (action === "审批") {
        var ar = rowFromClick != null ? rowFromClick : current.rows[index];
        if (ar && ar.type === "审批" && ar.source === "飞行计划") openTodoFlightApproval(ar);
      }
      if (action === "立即处理" || action === "标记已读" || action === "全部已读" || action === "删除" || action === "export") alert("原型演示：操作已触发");
    });
  }
  document.addEventListener("DOMContentLoaded", init);
})();
