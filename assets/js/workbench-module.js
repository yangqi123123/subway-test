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
    if (key === "wb-todo") return [row.title, tag(row.type), row.source, row.user, row.time, tag(row.status), actions(index)];
    if (key === "wb-sys-notify") return [row.title, tag(row.type), row.source, row.time, tag(row.read), actions(index)];
    return [row.title, tag(row.type), row.source, row.user, row.time, tag(row.result), row.opinion, actions(index)];
  }

  function actions(index) {
    return current.actions.map(function (name) {
      var cls = name.indexOf("删除") > -1 ? " wb-action--danger" : name.indexOf("处理") > -1 || name.indexOf("标记") > -1 ? " wb-action--hot" : "";
      var icon = name.indexOf("删除") > -1 ? "fa-trash-can" : name.indexOf("处理") > -1 ? "fa-bolt" : name.indexOf("标记") > -1 ? "fa-envelope-open" : "fa-eye";
      return '<span class="wb-action' + cls + '" data-action="' + esc(name) + '" data-index="' + index + '"><i class="fa-regular ' + icon + '"></i>' + name + '</span>';
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
      '<div id="wb-modal-mask" class="wb-modal-mask"><div class="wb-modal"><div class="h-14 px-6 flex items-center border-b border-cyan-400/15"><h3 class="text-white text-[16px] font-semibold">详情</h3><button data-action="close-modal" class="ml-auto text-slate-400 hover:text-slate-200 text-xl">×</button></div><div id="wb-modal-body" class="p-6 space-y-3"></div></div></div>';
    renderRows(current.rows);
    document.addEventListener("click", function (event) {
      var node = event.target.closest("[data-action]");
      if (!node) return;
      var action = node.dataset.action;
      var index = Number(node.dataset.index);
      if (action === "query") applyFilter();
      if (action === "reset") { document.querySelectorAll("[data-filter]").forEach(function (el) { el.selectedIndex = 0; el.value = ""; }); renderRows(current.rows); }
      if (action === "close-modal") document.getElementById("wb-modal-mask").classList.remove("show");
      if (action === "查看" || action === "查看详情") detail(current.rows[index]);
      if (action === "立即处理" || action === "标记已读" || action === "全部已读" || action === "删除" || action === "export") alert("原型演示：操作已触发");
    });
  }
  document.addEventListener("DOMContentLoaded", init);
})();
