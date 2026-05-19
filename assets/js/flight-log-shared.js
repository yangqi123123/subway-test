(function (global) {
  var WUHAN = [30.5928, 114.3055];
  var rows = [
    {
      id: "FL20251225001",
      deviceName: "DJI-M300E-01",
      taskType: "自动执行计划/临时任务",
      planName: "梨园站周边计划01",
      takeoff: "2025-12-25 10:00",
      landing: "2025-12-25 18:15",
      maxHeight: "XXX",
      battery: "35%（此处是电池剩量占用电状态的百分比）",
      operator: "张三",
      droneNo: "DJI-M36e-01",
      airport: "Airport-SH01",
      duration: "6分15秒",
      takeoffPos: "WGS84 坐标",
      landingPos: "WGS84 坐标/未降落（标红）",
      totalDistance: "单位：公里，保留1位小数",
      takeoffPower: "85%",
      landingPower: "22%",
      weather: "晴，风速3m/s，能见度10km",
      track: [[30.5969,114.3005],[30.5961,114.3026],[30.5953,114.3048],[30.5942,114.3072],[30.5935,114.3093],[30.5927,114.3116],[30.5918,114.3131]],
      events: [
        { time: "2025-12-13 10:00:15", type: "系统", detail: "起飞准备已通过" },
        { time: "2025-12-13 10:00:23", type: "系统", detail: "自动起飞，开始执行巡检计划“跨A区AI监测”" },
        { time: "2025-12-13 10:05:24", type: "系统", detail: "到达巡检点#1，开始执行环境拍摄任务" },
        { time: "2025-12-13 10:06:16", type: "飞手操作", detail: "手动进入手动控制模式（操作员：张三）" },
        { time: "2025-12-13 10:08:25", type: "系统", detail: "恢复巡航执行" }
      ]
    }
  ];

  function injectStyle() {
    if (document.getElementById("flight-log-shared-style")) return;
    document.head.insertAdjacentHTML("beforeend", '<style id="flight-log-shared-style">' +
      '.fl-toolbar-btn{min-width:88px;height:32px;border-radius:6px;font-size:12px;font-weight:600}.fl-op-btn{color:#38bdf8;font-size:12px}.fl-op-btn:hover{color:#67e8f9;text-decoration:underline}.fl-search{height:32px}.fl-modal-mask{position:fixed;inset:0;background:rgba(2,8,23,.72);display:none;align-items:center;justify-content:center;z-index:80;padding:20px}.fl-modal-mask.show{display:flex}.fl-modal{width:min(1260px,96vw);max-height:90vh;overflow:auto;background:#071b33;border:1px solid rgba(34,211,238,.22);border-radius:10px;box-shadow:0 18px 56px rgba(0,0,0,.45)}.fl-close-x{margin-left:auto;color:#94a3b8;font-size:22px;line-height:1}.fl-close-x:hover{color:#e2e8f0}.fl-dot{width:10px;height:10px;border-radius:999px;display:inline-block}.fl-detail-grid{display:grid;grid-template-columns:330px 1fr 330px;gap:20px}.fl-map{width:100%;height:520px;border-radius:8px;overflow:hidden;border:1px solid rgba(34,211,238,.14)}.fl-event-item{position:relative;padding:0 0 18px 22px;border-left:1px solid rgba(34,211,238,.24)}.fl-event-item:last-child{padding-bottom:0}.fl-event-item::before{content:"";position:absolute;left:-5px;top:4px;width:9px;height:9px;border-radius:999px;background:#38bdf8;box-shadow:0 0 0 4px rgba(56,189,248,.14)}.fl-detail-link{color:#38bdf8;text-decoration:none}.fl-detail-link:hover{text-decoration:underline}.leaflet-container{background:#e8ecf1}@media(max-width:1180px){.fl-detail-grid{grid-template-columns:1fr}.fl-map{height:420px}}' +
    '</style>');
  }

  function statusHtml() {
    return '<div class="space-y-1"><div class="inline-flex items-center gap-2 text-emerald-200"><span class="fl-dot bg-emerald-400"></span>成功</div><div class="inline-flex items-center gap-2 text-amber-200"><span class="fl-dot bg-amber-400"></span>异常中止/手动取消</div><div class="inline-flex items-center gap-2 text-rose-200"><span class="fl-dot bg-rose-500"></span>失败</div></div>';
  }

  function detailItem(label, value) {
    return '<div class="grid grid-cols-[92px_1fr] gap-2 text-sm"><div class="text-slate-300">' + label + '</div><div class="text-slate-100">' + value + '</div></div>';
  }

  function render(containerId, options) {
    injectStyle();
    var opts = options || {};
    var root = document.getElementById(containerId);
    var filtered = rows.slice();
    var currentMap = null;
    root.innerHTML =
      '<nav class="neon-panel neon-panel--tight mb-4 px-4 py-2.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400"><span class="text-cyan-400"><i class="fa-solid fa-location-crosshairs"></i></span><span>' + (opts.parentName || "资产管理") + '</span><span class="text-slate-600">&gt;&gt;</span><span class="text-cyan-50 font-semibold tracking-wide">' + (opts.breadcrumb || "飞行日志管理") + '</span></nav>' +
      '<div class="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-cyan-400/10 pb-3"><h1 class="text-base md:text-lg font-semibold text-white tracking-tight" style="text-shadow:0 0 20px rgba(34,211,238,.25)">' + (opts.heading || "飞行日志记录列表") + '</h1><span class="text-[10px] px-2 py-1 rounded-md border border-cyan-400/25 text-cyan-100/80 bg-cyan-500/5">' + (opts.badge || "飞行任务执行记录原型") + '</span></div>' +
      '<section class="neon-panel neon-panel--tight p-3 mb-3"><div class="flex flex-wrap items-end justify-between gap-3"><div class="min-w-[320px] flex-1 max-w-[780px]"><label class="wh-filter-label block mb-1">飞行任务ID / 无人机编号 / 操作员姓名</label><input id="search-keyword" class="wh-input fl-search w-full px-3" placeholder="请输入任务ID、无人机编号、操作员姓名关键词"></div><div class="flex gap-2"><button id="search-btn" type="button" class="fl-toolbar-btn wh-btn-primary">搜索</button><button id="reset-btn" type="button" class="fl-toolbar-btn wh-btn-ghost">重置</button><button id="export-btn" type="button" class="fl-toolbar-btn wh-btn-ghost">导出</button></div></div></section>' +
      '<section class="wh-table-shell bg-slate-950/35"><div class="overflow-x-auto"><table class="w-full min-w-[1560px] text-left"><thead><tr><th class="px-3">飞行任务ID</th><th class="px-3">设备名称</th><th class="px-3">任务类型</th><th class="px-3">关联计划</th><th class="px-3">起飞时间</th><th class="px-3">降落时间</th><th class="px-3">飞行状态</th><th class="px-3">最大飞行高度（单位：米）</th><th class="px-3">电池消耗</th><th class="px-3">操作员姓名</th><th class="px-3">操作</th></tr></thead><tbody id="table-body"></tbody></table></div><div class="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 border-t border-cyan-400/15 bg-slate-950/55 text-[11px] text-slate-400"><span>共 <b id="total-count" class="text-cyan-200">0</b> 条</span><button class="min-w-[32px] h-8 rounded text-xs wh-btn-primary">1</button></div></section>' +
      '<div id="detail-modal" class="fl-modal-mask"><div class="fl-modal"><div class="flex items-center px-6 py-4 border-b border-white/10"><h3 class="text-base font-semibold text-white">' + (opts.detailTitle || "飞行日志详情") + '</h3><button type="button" class="fl-close-x" data-close="detail-modal">×</button></div><div class="p-6"><div class="flex justify-end mb-4"><button id="detail-export-btn" type="button" class="fl-toolbar-btn wh-btn-gold"><i class="fa-solid fa-download mr-1"></i>导出</button></div><div class="fl-detail-grid"><section><h4 class="text-sm font-semibold text-white mb-4">基本信息</h4><div id="detail-info" class="space-y-3 text-sm"></div></section><section><h4 class="text-sm font-semibold text-white mb-4">飞行轨迹</h4><div id="detail-map" class="fl-map"></div></section><section><h4 class="text-sm font-semibold text-white mb-4">操作与事件</h4><div id="detail-events" class="space-y-0"></div></section></div><div class="mt-6 pt-4 border-t border-white/10 flex justify-center"><button type="button" class="wh-btn-ghost px-6 py-2 text-sm" data-close="detail-modal">返回</button></div></div></div></div>';

    function $(id) { return root.querySelector("#" + id) || document.getElementById(id); }
    function table() {
      $("total-count").textContent = String(filtered.length);
      $("table-body").innerHTML = filtered.map(function (item, index) {
        return '<tr style="background:' + (index % 2 === 0 ? "rgba(12,24,48,.45)" : "rgba(15,32,58,.55)") + '"><td class="px-3 text-slate-100/95 leading-6"><div>' + item.id + '</div><div class="text-slate-400 text-[11px]">唯一标识（如 FL20251225001）</div></td><td class="px-3 text-cyan-300 leading-6"><button type="button" class="fl-detail-link" data-detail="' + item.id + '">显示设备名称（可点击跳转设备详情页面）</button></td><td class="px-3 text-slate-100/95">' + item.taskType + '</td><td class="px-3 text-cyan-300 leading-6"><button type="button" class="fl-detail-link" data-detail="' + item.id + '">显示关联计划名称（可点击跳转对应计划详情页面）</button></td><td class="px-3 text-slate-100/95 whitespace-nowrap">' + item.takeoff + '</td><td class="px-3 text-slate-100/95 whitespace-nowrap">' + item.landing + '</td><td class="px-3">' + statusHtml() + '</td><td class="px-3 text-slate-100/95">' + item.maxHeight + '</td><td class="px-3 text-slate-100/95 leading-6">' + item.battery + '</td><td class="px-3 text-slate-100/95">' + item.operator + '</td><td class="px-3 whitespace-nowrap"><button type="button" class="fl-op-btn" data-detail="' + item.id + '">查看详情</button></td></tr>';
      }).join("");
    }
    function openDetail(id) {
      var item = rows.find(function (row) { return row.id === id; });
      if (!item) return;
      $("detail-info").innerHTML = [detailItem("任务ID", item.id), detailItem("无人机编号", item.droneNo), detailItem("无人机名称", '<span class="fl-detail-link">A区巡检机01（可点击跳转设备详情页面）</span>'), detailItem("所属机场", '<span class="fl-detail-link">' + item.airport + '（可点击跳转设备详情页面）</span>'), detailItem("操作员", item.operator), detailItem("任务类型", item.taskType), detailItem("关联计划", '<span class="fl-detail-link">显示关联计划名称（可点击跳转对应计划详情页面）</span>'), detailItem("起飞时间", item.takeoff), detailItem("降落时间", item.landing), detailItem("飞行时长", item.duration), detailItem("起飞位置", item.takeoffPos), detailItem("降落位置", item.landingPos), detailItem("最大飞行高度", "单位：米，保留1位小数"), detailItem("总飞行距离", item.totalDistance), detailItem("起飞电量", item.takeoffPower), detailItem("降落电量", item.landingPower), detailItem("飞行状态", statusHtml()), detailItem("天气情况", item.weather)].join("");
      $("detail-events").innerHTML = item.events.map(function (evt) { return '<div class="fl-event-item"><div class="text-xs text-slate-300">' + evt.time + '</div><div class="text-xs text-slate-400 mt-1">事件类型：<span class="text-cyan-200">' + evt.type + '</span></div><div class="text-sm text-sky-300 mt-1 leading-6">' + evt.detail + '</div></div>'; }).join("");
      $("detail-modal").classList.add("show");
      setTimeout(function () {
        if (currentMap) currentMap.remove();
        $("detail-map").innerHTML = "";
        currentMap = L.map($("detail-map"), { center: WUHAN, zoom: 15, zoomControl: true });
        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { subdomains: "abcd", maxZoom: 20 }).addTo(currentMap);
        var line = L.polyline(item.track, { color: "#22c55e", weight: 5, opacity: .92 }).addTo(currentMap);
        L.circleMarker(item.track[0], { radius: 7, color: "#2563eb", fillColor: "#38bdf8", fillOpacity: 1, weight: 2 }).addTo(currentMap).bindTooltip("起点");
        L.circleMarker(item.track[item.track.length - 1], { radius: 8, color: "#dc2626", fillColor: "#f97316", fillOpacity: 1, weight: 2 }).addTo(currentMap).bindTooltip("终点");
        currentMap.fitBounds(line.getBounds(), { padding: [30, 30] });
        setTimeout(function () { currentMap.invalidateSize(); }, 120);
      }, 80);
    }
    function toast(text) {
      var old = document.getElementById("toast-box");
      if (old) old.remove();
      var node = document.createElement("div");
      node.id = "toast-box";
      node.className = "fixed right-5 bottom-5 z-[100] rounded bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg";
      node.textContent = text;
      document.body.appendChild(node);
      setTimeout(function () { node.remove(); }, 1800);
    }
    root.addEventListener("click", function (event) {
      var detailBtn = event.target.closest("[data-detail]");
      if (detailBtn) openDetail(detailBtn.dataset.detail);
      var closeBtn = event.target.closest("[data-close]");
      if (closeBtn) {
        $(closeBtn.dataset.close).classList.remove("show");
        if (currentMap) { currentMap.remove(); currentMap = null; $("detail-map").innerHTML = ""; }
      }
    });
    $("search-btn").addEventListener("click", function () {
      var keyword = $("search-keyword").value.trim();
      filtered = rows.filter(function (item) { return !keyword || [item.id, item.droneNo, item.operator].some(function (text) { return text.indexOf(keyword) > -1; }); });
      table();
    });
    $("reset-btn").addEventListener("click", function () { $("search-keyword").value = ""; filtered = rows.slice(); table(); });
    $("export-btn").addEventListener("click", function () { toast("已按当前列表导出"); });
    $("detail-export-btn").addEventListener("click", function () { toast("已导出当前详情"); });
    table();
  }

  global.WHFlightLog = { render: render };
})(window);
