(function (global) {
  var permits = [
    { no: "WHKY-20260501", route: "车辆段日常巡查航线", pass: "2026-05-01", end: "2026-06-30", remark: "许可有效" },
    { no: "WHKY-20260508", route: "青山站外业巡检航线", pass: "2026-05-08", end: "2026-06-20", remark: "覆盖8号线北段" }
  ];
  var photoUrls = [
    "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=520&q=80",
    "https://images.unsplash.com/photo-1508444845599-5c89863b1c44?auto=format&fit=crop&w=520&q=80",
    "https://images.unsplash.com/photo-1524143986875-3b098d78b363?auto=format&fit=crop&w=520&q=80",
    "https://images.unsplash.com/photo-1487887235947-a955ef187fcc?auto=format&fit=crop&w=520&q=80"
  ];
  var permitEditIndex = -1;

  function ensureDetailStyles() {
    if (document.getElementById("drone-detail-shared-style")) return;
    document.head.insertAdjacentHTML("beforeend",
      '<style id="drone-detail-shared-style">' +
        '.dr-table th,.dr-table td{height:52px;border-right:1px solid rgba(34,211,238,.08);border-bottom:1px solid rgba(34,211,238,.08);vertical-align:middle}' +
        '.dr-table th:last-child,.dr-table td:last-child{border-right:0}.dr-table thead th{background:rgba(2,8,23,.66);color:rgba(240,249,255,.96);font-size:12px;font-weight:600;white-space:nowrap}.dr-table tbody td{color:rgba(226,245,255,.88);font-size:12px}' +
        '.dr-action{display:inline-flex;align-items:center;gap:4px;margin-right:10px;white-space:nowrap;cursor:pointer;font-size:12px}.dr-dot{display:inline-block;width:8px;height:8px;border-radius:999px;margin-right:6px;box-shadow:0 0 10px currentColor}.online{color:#86efac}.offline{color:#94a3b8}.error{color:#fb7185}.maintain{color:#fde047}' +
        '.dr-modal-mask{position:fixed;inset:0;z-index:100;display:none;align-items:center;justify-content:center;background:rgba(15,23,42,.58);padding:20px}.dr-modal-mask.show{display:flex}.dr-modal{width:min(960px,94vw);max-height:90vh;overflow:auto;border-radius:8px;border:1px solid rgba(34,211,238,.16);background:#071426;box-shadow:0 24px 80px rgba(0,0,0,.48)}.dr-modal--wide{width:min(1500px,96vw)}' +
        '.dr-card{border:1px solid rgba(34,211,238,.18);border-radius:8px;background:rgba(8,15,35,.68);box-shadow:0 12px 32px rgba(0,0,0,.25)}.dr-map{height:220px;border:1px solid rgba(34,211,238,.18);border-radius:8px;position:relative;overflow:hidden;background:#081525}.dr-map img{width:100%;height:100%;object-fit:cover;filter:saturate(1.08) contrast(1.08) brightness(.76)}.dr-map::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,8,23,.04),rgba(2,8,23,.48));pointer-events:none}.dr-marker{position:absolute;left:56%;top:45%;z-index:2;width:16px;height:16px;border-radius:999px;background:#fbbf24;box-shadow:0 0 0 8px rgba(251,191,36,.16),0 0 24px rgba(251,191,36,.8)}.dr-photo{height:112px;border-radius:8px;border:1px solid rgba(34,211,238,.16);overflow:hidden;background:#0f172a}.dr-photo img{width:100%;height:100%;object-fit:cover;display:block}.dr-preview{height:360px;border:1px solid rgba(34,211,238,.18);border-radius:8px;background:linear-gradient(135deg,rgba(8,47,73,.55),rgba(15,23,42,.95));display:flex;align-items:center;justify-content:center;color:#bae6fd}' +
      '</style>');
  }

  function ensureDetailModal() {
    ensureDetailStyles();
    if (document.getElementById("shared-drone-detail-mask")) return;
    document.body.insertAdjacentHTML("beforeend",
      '<div id="shared-drone-detail-mask" class="dr-modal-mask">' +
        '<div class="dr-modal dr-modal--wide">' +
          '<div class="h-14 px-6 flex items-center border-b border-cyan-400/15"><h3 class="text-white text-[16px] font-semibold">设备详情</h3><button type="button" class="ml-auto px-4 h-8 rounded text-xs wh-btn-ghost" data-action="toast">导出</button><button type="button" class="ml-3 text-slate-400 hover:text-slate-200 text-xl" data-action="close-shared-drone-detail">×</button></div>' +
          '<div id="shared-drone-detail-body" class="p-5"></div>' +
        '</div>' +
      '</div>');
  }

  function statusHtml(status) {
    var cls = status === "在线" ? "online" : status === "故障" ? "error" : status === "维护中" ? "maintain" : "offline";
    return '<span class="' + cls + '"><i class="dr-dot"></i>' + status + '</span>';
  }

  function permitRows() {
    return permits.map(function (item, index) {
      return '<tr>' +
        '<td class="px-3 whitespace-nowrap">' + item.no + '</td>' +
        '<td class="px-3 whitespace-nowrap">' + item.route + '</td>' +
        '<td class="px-3 whitespace-nowrap">' + item.pass + '</td>' +
        '<td class="px-3 whitespace-nowrap">' + item.end + '</td>' +
        '<td class="px-3 whitespace-nowrap">' + item.remark + '</td>' +
        '<td class="px-3 whitespace-nowrap">' +
          '<span class="dr-action text-cyan-300" data-action="preview">查看</span>' +
          '<span class="dr-action text-amber-300" data-action="permit-edit" data-index="' + index + '">编辑</span>' +
          '<span class="dr-action text-sky-300" data-action="download">下载</span>' +
          '<span class="dr-action text-rose-300" data-action="permit-delete" data-index="' + index + '">删除</span>' +
        '</td>' +
      '</tr>';
    }).join("");
  }

  function ensureSharedModals() {
    ensureDetailStyles();
    if (!document.getElementById("permit-mask")) {
      document.body.insertAdjacentHTML("beforeend",
        '<div id="permit-mask" class="dr-modal-mask"><div class="dr-modal">' +
          '<div class="h-14 px-6 flex items-center border-b border-cyan-400/15"><h3 id="permit-title" class="text-white text-[16px] font-semibold">新增审批文件</h3><button type="button" class="ml-auto text-slate-400 hover:text-slate-200 text-xl" data-action="close-permit">×</button></div>' +
          '<div class="p-6"><div class="dr-form-grid">' +
            '<label class="dr-form-item"><span class="dr-form-label">审批号：</span><input id="p-no" class="wh-input h-8 flex-1 px-3" placeholder="请输入审批号" /></label>' +
            '<label class="dr-form-item"><span class="dr-form-label">选择航线：</span><select id="p-route" class="wh-input h-8 flex-1 px-2"><option>车辆段日常巡查航线</option><option>涉铁施工复核航线</option><option>青山站外业巡检航线</option></select></label>' +
            '<label class="dr-form-item"><span class="dr-form-label">审批通过时间：</span><input id="p-pass" type="date" class="wh-input h-8 flex-1 px-3" /></label>' +
            '<label class="dr-form-item"><span class="dr-form-label">空域许可结束时间：</span><input id="p-end" type="date" class="wh-input h-8 flex-1 px-3" /></label>' +
            '<label class="dr-form-item"><span class="dr-form-label">上传文件：</span><input id="p-file" type="file" class="wh-input h-8 flex-1 px-2 py-1" /></label>' +
            '<label class="dr-form-item" style="grid-column:1/-1"><span class="dr-form-label">备注：</span><input id="p-remark" class="wh-input h-8 flex-1 px-3" placeholder="请输入备注" /></label>' +
          '</div></div>' +
          '<div class="px-6 py-4 flex justify-end gap-3 border-t border-cyan-400/15"><button type="button" class="px-6 h-8 rounded text-xs wh-btn-ghost" data-action="close-permit">取消</button><button type="button" class="px-6 h-8 rounded text-xs wh-btn-primary" data-action="save-permit">确定</button></div>' +
        '</div></div>');
    }
    if (!document.getElementById("preview-mask")) {
      document.body.insertAdjacentHTML("beforeend",
        '<div id="preview-mask" class="dr-modal-mask"><div class="dr-modal">' +
          '<div class="h-14 px-6 flex items-center border-b border-cyan-400/15"><h3 class="text-white text-[16px] font-semibold">文件预览</h3><button type="button" class="ml-auto text-slate-400 hover:text-slate-200 text-xl" data-action="close-preview">×</button></div>' +
          '<div class="p-6"><div class="dr-preview"><div class="text-center"><i class="fa-regular fa-file-lines text-4xl mb-3"></i><div>空域审批文件预览</div><div class="mt-2 text-xs text-slate-400">WHKY-20260501.pdf</div></div></div></div>' +
        '</div></div>');
    }
  }

  function renderDroneDetail(row, container) {
    ensureSharedModals();
    container.innerHTML =
      '<div class="mb-4 px-4 py-3 rounded border border-rose-400/30 bg-rose-500/10 text-rose-100 text-xs">上传审批文件后自动识别审批号、审批通过时间、空域许可结束时间；支持查看、下载、编辑备注，并同步至空域许可信息。无空域许可、计划未审批通过或系统校验未通过均不能起飞。</div>' +
      '<div class="grid grid-cols-1 xl:grid-cols-[1fr_1.12fr_.82fr] gap-4">' +
        '<section class="dr-card p-4 overflow-x-auto">' +
          '<h4 class="text-cyan-50 font-semibold mb-3">基本信息</h4>' +
          '<div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-300">' +
            '<span>设备型号：' + row.model + '</span><span>设备SN：' + row.sn + '</span><span>设备名称：' + row.name + '</span><span>所属机场：' + (row.airport || '-') + '</span><span>所属线路：' + row.line + '</span>' +
            '<span>当前状态：' + statusHtml(row.status) + '</span><span>飞手姓名：' + (row.pilot || "-") + '</span><span class="col-span-2 text-cyan-300">位置坐标：' + row.lng + ' / ' + row.lat + '</span>' +
            '<span>最后在线时间：' + row.last + '</span><span>购买日期：' + row.buy + '</span><span>质保结束日期：' + row.warranty + '</span><span>厂家：' + row.maker + '</span><span>重量：' + row.weight + '</span><span>配件信息：' + row.parts + '</span>' +
          '</div>' +
          '<h4 class="text-cyan-50 font-semibold mt-5 mb-3">空域许可信息</h4>' +
          '<table class="dr-table min-w-[720px] w-full text-left"><thead><tr><th class="px-3 whitespace-nowrap">航线</th><th class="px-3 whitespace-nowrap">状态</th><th class="px-3 whitespace-nowrap">审批通过时间</th><th class="px-3 whitespace-nowrap">空域许可结束时间</th></tr></thead>' +
          '<tbody><tr><td class="px-3 whitespace-nowrap">车辆段日常巡查航线</td><td class="px-3 whitespace-nowrap text-emerald-300">可通行</td><td class="px-3 whitespace-nowrap">2026-05-01</td><td class="px-3 whitespace-nowrap">2026-06-30</td></tr><tr><td class="px-3 whitespace-nowrap">涉铁施工复核航线</td><td class="px-3 whitespace-nowrap text-rose-300">不可通行</td><td class="px-3 whitespace-nowrap">-</td><td class="px-3 whitespace-nowrap">许可缺失</td></tr></tbody></table>' +
        '</section>' +
        '<section class="dr-card p-4 overflow-x-auto">' +
          '<div class="flex items-center gap-2 mb-3"><h4 class="text-cyan-50 font-semibold mr-auto whitespace-nowrap">审批文件管理</h4><button class="px-3 h-7 rounded text-xs wh-btn-primary whitespace-nowrap" data-action="permit-new">新增</button></div>' +
          '<table class="dr-table min-w-[940px] w-full text-left"><thead><tr><th class="px-3 whitespace-nowrap">审批号</th><th class="px-3 whitespace-nowrap">航线</th><th class="px-3 whitespace-nowrap">审批通过时间</th><th class="px-3 whitespace-nowrap">空域许可结束时间</th><th class="px-3 whitespace-nowrap">备注</th><th class="px-3 whitespace-nowrap">操作</th></tr></thead><tbody id="permit-body">' + permitRows() + '</tbody></table>' +
          '<div class="mt-3 flex justify-end gap-2 text-xs text-slate-400"><button class="min-w-[30px] h-7 rounded wh-btn-primary">1</button><button class="min-w-[30px] h-7 rounded wh-btn-ghost">2</button></div>' +
        '</section>' +
        '<section class="dr-card p-4">' +
          '<h4 class="text-cyan-50 font-semibold mb-3">照片</h4><div class="grid grid-cols-2 gap-3 mb-4">' + photoUrls.map(function(src,n){ return '<div class="dr-photo"><img src="' + src + '" alt="无人机照片' + (n + 1) + '"></div>'; }).join("") + '</div>' +
          '<h4 class="text-cyan-50 font-semibold mb-3">存放位置信息</h4><div class="dr-map"><img src="assets/img/map-gis-satellite.png" alt="GIS地图"><span class="dr-marker"></span><span class="absolute left-4 bottom-4 z-10 text-xs text-cyan-50 bg-slate-950/70 border border-cyan-400/20 rounded px-2 py-1">机场停放点 ' + row.lng + ' / ' + row.lat + '</span><span class="absolute right-4 top-4 z-10 text-xs text-cyan-50 bg-slate-950/70 border border-cyan-400/20 rounded px-2 py-1">GIS地图</span></div>' +
        '</section>' +
      '</div>';
  }

  function openDroneDetail(row) {
    ensureDetailModal();
    renderDroneDetail(row, document.getElementById("shared-drone-detail-body"));
    document.getElementById("shared-drone-detail-mask").classList.add("show");
  }

  function openPermit(index) {
    ensureSharedModals();
    permitEditIndex = typeof index === "number" ? index : -1;
    var p = permits[permitEditIndex] || {};
    document.getElementById("permit-title").textContent = permitEditIndex > -1 ? "编辑审批文件" : "新增审批文件";
    document.getElementById("p-no").value = p.no || "";
    document.getElementById("p-route").value = p.route || "车辆段日常巡查航线";
    document.getElementById("p-pass").value = p.pass || "";
    document.getElementById("p-end").value = p.end || "";
    document.getElementById("p-remark").value = p.remark || "";
    document.getElementById("permit-mask").classList.add("show");
  }

  function savePermit() {
    var item = {
      no: document.getElementById("p-no").value || "WHKY-20260513",
      route: document.getElementById("p-route").value,
      pass: document.getElementById("p-pass").value || "2026-05-13",
      end: document.getElementById("p-end").value || "2026-06-30",
      remark: document.getElementById("p-remark").value || "许可文件已上传"
    };
    if (permitEditIndex > -1) permits[permitEditIndex] = item; else permits.unshift(item);
    document.getElementById("permit-mask").classList.remove("show");
    var body = document.getElementById("permit-body");
    if (body) body.innerHTML = permitRows();
  }

  document.addEventListener("click", function (event) {
    var actionNode = event.target.closest("[data-action]");
    if (!actionNode) return;
    var action = actionNode.dataset.action;
    var index = Number(actionNode.dataset.index);
    if (action === "permit-new") openPermit();
    if (action === "permit-edit") openPermit(index);
    if (action === "save-permit") savePermit();
    if (action === "close-permit") document.getElementById("permit-mask").classList.remove("show");
    if (action === "permit-delete" && confirm("确认删除该审批文件？")) {
      permits.splice(index, 1);
      var body = document.getElementById("permit-body");
      if (body) body.innerHTML = permitRows();
    }
    if (action === "preview") {
      ensureSharedModals();
      document.getElementById("preview-mask").classList.add("show");
    }
    if (action === "close-preview") document.getElementById("preview-mask").classList.remove("show");
    if (action === "close-shared-drone-detail") document.getElementById("shared-drone-detail-mask").classList.remove("show");
    if (action === "download") alert("原型演示：下载已触发");
  });

  global.WHDroneDetail = {
    open: openDroneDetail,
    render: renderDroneDetail,
    ensureModals: ensureSharedModals
  };
})(window);
