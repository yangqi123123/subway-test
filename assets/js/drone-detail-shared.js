(function (global) {
  var permits = [
    { no: "WHKY-20260501", route: "车辆段日常巡查航线", pass: "2026-05-01", end: "2026-06-30", remark: "许可有效", fileName: "WHKY-20260501.pdf" },
    { no: "WHKY-20260508", route: "青山站外业巡检航线", pass: "2026-05-08", end: "2026-06-20", remark: "覆盖8号线北段", fileName: "WHKY-20260508.pdf" }
  ];
  var permitFileBound = false;
  var photoUrls = [
    "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=520&q=80",
    "https://images.unsplash.com/photo-1508444845599-5c89863b1c44?auto=format&fit=crop&w=520&q=80",
    "https://images.unsplash.com/photo-1524143986875-3b098d78b363?auto=format&fit=crop&w=520&q=80",
    "https://images.unsplash.com/photo-1487887235947-a955ef187fcc?auto=format&fit=crop&w=520&q=80"
  ];
  var permitEditIndex = -1;

  function ensureDetailStyles() {
    var oldStyle = document.getElementById("drone-detail-shared-style");
    if (oldStyle) oldStyle.remove();
    var css = [
      ".dr-table th,.dr-table td{height:52px;border-right:1px solid rgba(34,211,238,.08);border-bottom:1px solid rgba(34,211,238,.08);vertical-align:middle}",
      ".dr-table th:last-child,.dr-table td:last-child{border-right:0}.dr-table thead th{background:rgba(2,8,23,.66);color:rgba(240,249,255,.96);font-size:12px;font-weight:600;white-space:nowrap}.dr-table tbody td{color:rgba(226,245,255,.88);font-size:12px}",
      ".dr-action{display:inline-flex;align-items:center;gap:4px;margin-right:10px;white-space:nowrap;cursor:pointer;font-size:12px}.dr-dot{display:inline-block;width:8px;height:8px;border-radius:999px;margin-right:6px;box-shadow:0 0 10px currentColor}.online{color:#86efac}.offline{color:#94a3b8}.error{color:#fb7185}.maintain{color:#fde047}",
      ".dr-modal-mask{position:fixed;inset:0;z-index:100;display:none;align-items:center;justify-content:center;background:rgba(2,8,23,.72);padding:12px;box-sizing:border-box;overflow:hidden}.dr-modal-mask.show{display:flex}",
      ".dr-modal{width:min(960px,calc(100vw - 24px));max-height:min(94vh,calc(100vh - 24px));overflow:auto;border-radius:10px;border:1px solid rgba(34,211,238,.22);background:#071b33;box-shadow:0 18px 56px rgba(0,0,0,.45)}.dr-modal--wide{width:min(1820px,calc(100vw - 24px))}",
      ".dr-modal--detail-fit{display:flex;flex-direction:column;width:min(1820px,calc(100vw - 24px));max-height:min(94vh,calc(100vh - 24px));min-height:min(720px,calc(100vh - 24px));overflow:hidden}.dr-modal--detail-fit>.dr-modal__head{flex-shrink:0}.dr-modal--detail-fit>.dr-detail-body{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;padding:20px}",
      ".dr-detail-layout{display:flex;flex-direction:column;gap:16px}.dr-detail-tip{margin:0;padding:8px 12px;border-radius:8px;border:1px solid rgba(251,113,133,.28);background:rgba(244,63,94,.1);color:#fecdd3;font-size:12px;line-height:1.5;flex-shrink:0}",
      ".dr-detail-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.38fr) minmax(0,.88fr);gap:16px;align-items:start}",
      ".dr-detail-layout .dr-card{padding:16px;display:flex;flex-direction:column;overflow:visible}.dr-detail-layout .dr-sec-title{margin:0 0 12px;font-size:14px;font-weight:600;color:#f0fdfa;line-height:1.35}.dr-detail-layout .dr-sec-title--spaced{margin-top:16px}",
      ".dr-detail-layout .dr-info-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 16px;font-size:12px;line-height:1.45;color:rgba(203,213,225,.92)}.dr-detail-layout .dr-info-grid .col-span-2{grid-column:span 2}",
      ".dr-detail-layout .dr-table-wrap{overflow:visible}.dr-detail-layout .dr-table th,.dr-detail-layout .dr-table td{height:40px;padding:0 12px;font-size:12px;line-height:1.3}.dr-detail-layout .dr-table thead th{height:38px;font-size:12px}",
      ".dr-detail-layout .dr-action{font-size:12px;margin-right:8px}",
      ".dr-card--permit{overflow:visible}.dr-card--permit .dr-card__head{flex-shrink:0;display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 0 12px;padding-bottom:12px;border-bottom:1px solid rgba(34,211,238,.12);position:sticky;top:0;z-index:3;background:rgba(8,15,35,.98)}.dr-card--permit .dr-card__head .dr-sec-title{margin:0;flex:1 1 auto;min-width:0}.dr-card--permit .dr-card__head .dr-card__action{flex-shrink:0}.dr-card--permit .dr-card__body{overflow:visible}",
      ".dr-detail-layout .dr-pager{margin-top:12px;display:flex;justify-content:flex-end;gap:8px}.dr-detail-layout .dr-pager button{min-width:30px;height:28px;font-size:12px}",
      ".dr-detail-layout .dr-photo-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:12px}.dr-detail-layout .dr-photo{height:80px;border-radius:8px}.dr-detail-layout .dr-map{height:140px;flex-shrink:0}.dr-detail-layout .dr-map-badge{font-size:11px;padding:4px 8px;line-height:1.35}",
      ".dr-modal--permit{width:min(480px,92vw)}.dr-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 28px}.dr-form-item{display:flex;align-items:center;gap:10px}.dr-form-label{width:120px;flex:0 0 120px;text-align:right;color:rgba(226,245,255,.78);font-size:12px}",
      ".dr-permit-body{padding:20px 24px}.dr-permit-form{display:flex;flex-direction:column;gap:12px;max-width:400px;margin:0 auto;width:100%}.dr-permit-field{display:flex;flex-direction:column;align-items:stretch;gap:4px;margin:0}.dr-permit-field .dr-form-label{width:auto;flex:none;text-align:left;line-height:1.35}",
      ".dr-permit-hint{font-size:11px;color:#64748b;line-height:1.4;margin:0}.dr-permit-file-name{font-size:11px;color:rgba(103,232,249,.88);line-height:1.4;margin:0;min-height:16px}.dr-required,.req{color:#fb7185;margin-right:3px}",
      ".dr-card{border:1px solid rgba(34,211,238,.18);border-radius:8px;background:rgba(8,15,35,.68);box-shadow:0 12px 32px rgba(0,0,0,.25)}",
      ".dr-map{border:1px solid rgba(34,211,238,.18);border-radius:8px;position:relative;overflow:hidden;background:#081525}.dr-map img{width:100%;height:100%;object-fit:cover;filter:saturate(1.08) contrast(1.08) brightness(.76)}",
      ".dr-map::after{content:\"\";position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,8,23,.04),rgba(2,8,23,.48));pointer-events:none}",
      ".dr-marker{position:absolute;left:56%;top:45%;z-index:2;width:14px;height:14px;border-radius:999px;background:#fbbf24;box-shadow:0 0 0 6px rgba(251,191,36,.16),0 0 18px rgba(251,191,36,.8)}",
      ".dr-photo{border-radius:8px;border:1px solid rgba(34,211,238,.16);overflow:hidden;background:#0f172a}.dr-photo img{width:100%;height:100%;object-fit:cover;display:block}",
      ".dr-preview{height:360px;border:1px solid rgba(34,211,238,.18);border-radius:8px;background:linear-gradient(135deg,rgba(8,47,73,.55),rgba(15,23,42,.95));display:flex;align-items:center;justify-content:center;color:#bae6fd}"
    ].join("");
    var style = document.createElement("style");
    style.id = "drone-detail-shared-style";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function ensureDetailModal() {
    ensureDetailStyles();
    var mask = document.getElementById("shared-drone-detail-mask");
    if (mask && mask.getAttribute("data-dr-detail-v") === "2") return;
    if (mask) mask.remove();
    document.body.insertAdjacentHTML("beforeend",
      '<div id="shared-drone-detail-mask" class="dr-modal-mask" data-dr-detail-v="2">' +
        '<div class="dr-modal dr-modal--wide dr-modal--detail-fit">' +
          '<div class="dr-modal__head flex items-center justify-between px-5 py-4 border-b border-white/10">' +
            '<h3 class="text-base font-semibold text-white m-0">设备详情</h3>' +
            '<div class="flex items-center gap-2">' +
              '<button type="button" class="px-3 h-8 rounded text-xs wh-btn-ghost" data-action="toast">导出</button>' +
              '<button type="button" class="wh-modal-close" data-action="close-shared-drone-detail" aria-label="关闭">×</button>' +
            '</div>' +
          '</div>' +
          '<div id="shared-drone-detail-body" class="dr-detail-body"></div>' +
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
        '<td class="whitespace-nowrap">' + item.no + '</td>' +
        '<td class="whitespace-nowrap">' + item.route + '</td>' +
        '<td class="whitespace-nowrap">' + item.pass + '</td>' +
        '<td class="whitespace-nowrap">' + item.end + '</td>' +
        '<td class="whitespace-nowrap">' + item.remark + '</td>' +
        '<td class="whitespace-nowrap">' +
          '<span class="dr-action text-cyan-300" data-action="preview">查看</span>' +
          '<span class="dr-action text-amber-300" data-action="permit-edit" data-index="' + index + '">编辑</span>' +
          '<span class="dr-action text-sky-300" data-action="download">下载</span>' +
          '<span class="dr-action text-rose-300" data-action="permit-delete" data-index="' + index + '">删除</span>' +
        '</td>' +
      '</tr>';
    }).join("");
  }

  function ensurePermitModal() {
    var mask = document.getElementById("permit-mask");
    if (mask && mask.querySelector(".dr-permit-form")) return;
    if (mask) mask.remove();
    permitFileBound = false;
    document.body.insertAdjacentHTML("beforeend",
        '<div id="permit-mask" class="dr-modal-mask"><div class="dr-modal dr-modal--permit">' +
          '<div class="h-14 px-6 flex items-center justify-between gap-3 border-b border-cyan-400/15"><h3 id="permit-title" class="text-white text-[16px] font-semibold">新增审批文件</h3><button type="button" class="wh-modal-close" aria-label="关闭" data-action="close-permit">×</button></div>' +
          '<div class="dr-permit-body"><div class="dr-permit-form">' +
            '<label class="dr-permit-field"><span class="dr-form-label"><b class="dr-required">*</b>选择航线：</span><select id="p-route" class="wh-input h-8 w-full px-2"><option value="">请选择航线</option><option>车辆段日常巡查航线</option><option>涉铁施工复核航线</option><option>青山站外业巡检航线</option></select></label>' +
            '<label class="dr-permit-field"><span class="dr-form-label"><b class="dr-required">*</b>上传文件：</span><input id="p-file" type="file" accept=".pdf,application/pdf" class="wh-input h-8 w-full px-2 py-1" /><p class="dr-permit-hint">仅支持 PDF 格式，且只能上传 1 个文件</p><p id="p-file-name" class="dr-permit-file-name"></p></label>' +
            '<label class="dr-permit-field"><span class="dr-form-label"><b class="dr-required">*</b>备注：</span><textarea id="p-remark" class="wh-input w-full px-3 py-2 min-h-[72px]" placeholder="请输入备注"></textarea></label>' +
          '</div></div>' +
          '<div class="px-6 py-4 flex justify-end gap-3 border-t border-cyan-400/15"><button type="button" class="px-6 h-8 rounded text-xs wh-btn-ghost" data-action="close-permit">取消</button><button type="button" class="px-6 h-8 rounded text-xs wh-btn-primary" data-action="save-permit">确定</button></div>' +
        '</div></div>');
    bindPermitFileInput();
  }

  function ensureSharedModals() {
    ensureDetailStyles();
    ensurePermitModal();
    if (!document.getElementById("preview-mask")) {
      document.body.insertAdjacentHTML("beforeend",
        '<div id="preview-mask" class="dr-modal-mask"><div class="dr-modal">' +
          '<div class="h-14 px-6 flex items-center justify-between gap-3 border-b border-cyan-400/15"><h3 class="text-white text-[16px] font-semibold">文件预览</h3><button type="button" class="wh-modal-close" aria-label="关闭" data-action="close-preview">×</button></div>' +
          '<div class="p-6"><div class="dr-preview"><div class="text-center"><i class="fa-regular fa-file-lines text-4xl mb-3"></i><div>空域审批文件预览</div><div class="mt-2 text-xs text-slate-400">WHKY-20260501.pdf</div></div></div></div>' +
        '</div></div>');
    }
  }

  function renderDroneDetail(row, container) {
    ensureSharedModals();
    container.className = "dr-detail-body";
    container.innerHTML =
      '<div class="dr-detail-layout">' +
        '<p class="dr-detail-tip">上传审批文件后自动识别并同步空域许可；无有效许可或计划未审批通过不可起飞。</p>' +
        '<div class="dr-detail-grid">' +
          '<section class="dr-card">' +
            '<h4 class="dr-sec-title">基本信息</h4>' +
            '<div class="dr-info-grid">' +
              '<span>设备型号：' + row.model + '</span><span>设备SN：' + row.sn + '</span><span>设备名称：' + row.name + '</span><span>所属机场：' + (row.airport || "-") + '</span><span>所属线路：' + row.line + '</span>' +
              '<span>当前状态：' + statusHtml(row.status) + '</span><span>飞手姓名：' + (row.pilot || "-") + '</span><span>位置坐标：' + row.lng + " / " + row.lat + '</span>' +
              '<span>最后在线：' + row.last + '</span><span>购买日期：' + row.buy + '</span><span>质保结束：' + row.warranty + '</span><span>厂家：' + row.maker + '</span><span>重量：' + row.weight + '</span><span class="col-span-2">配件：' + row.parts + "</span>" +
            "</div>" +
            '<h4 class="dr-sec-title dr-sec-title--spaced">空域许可信息</h4>' +
            '<div class="dr-table-wrap"><table class="dr-table w-full text-left"><thead><tr><th>航线</th><th>状态</th><th>审批通过</th><th>许可结束</th></tr></thead>' +
            '<tbody><tr><td>车辆段日常巡查航线</td><td class="text-emerald-300">可通行</td><td>2026-05-01</td><td>2026-06-30</td></tr><tr><td>涉铁施工复核航线</td><td class="text-rose-300">不可通行</td><td>-</td><td>许可缺失</td></tr></tbody></table></div>' +
          "</section>" +
          '<section class="dr-card dr-card--permit">' +
            '<div class="dr-card__head"><h4 class="dr-sec-title">审批文件管理</h4><button type="button" class="dr-card__action px-3 h-8 rounded text-xs wh-btn-primary whitespace-nowrap" data-action="permit-new">新增</button></div>' +
            '<div class="dr-card__body">' +
            '<div class="dr-table-wrap"><table class="dr-table w-full text-left"><thead><tr><th>审批号</th><th>航线</th><th>审批通过</th><th>许可结束</th><th>备注</th><th>操作</th></tr></thead><tbody id="permit-body">' +
            permitRows() +
            "</tbody></table></div>" +
            '<div class="dr-pager"><button type="button" class="rounded wh-btn-primary">1</button><button type="button" class="rounded wh-btn-ghost">2</button></div>' +
            "</div></section>" +
          '<section class="dr-card">' +
            '<h4 class="dr-sec-title">照片</h4><div class="dr-photo-grid">' +
            photoUrls
              .map(function (src, n) {
                return '<div class="dr-photo"><img src="' + src + '" alt="无人机照片' + (n + 1) + '" loading="lazy" /></div>';
              })
              .join("") +
            '</div><h4 class="dr-sec-title">存放位置</h4><div class="dr-map"><img src="' +
            (typeof whAsset === "function" ? whAsset("assets/img/map-gis-satellite.png") : "assets/img/map-gis-satellite.png") +
            '" alt="GIS地图" onerror="this.style.display=\'none\'" /><span class="dr-marker"></span><span class="absolute left-2 bottom-2 z-10 dr-map-badge text-cyan-50 bg-slate-950/70 border border-cyan-400/20 rounded">停放点 ' +
            row.lng +
            " / " +
            row.lat +
            '</span></div></section></div></div>';
  }

  function openDroneDetail(row) {
    ensureDetailModal();
    renderDroneDetail(row, document.getElementById("shared-drone-detail-body"));
    document.getElementById("shared-drone-detail-mask").classList.add("show");
  }

  function setPermitFileNameHint(name) {
    var el = document.getElementById("p-file-name");
    if (!el) return;
    el.textContent = name ? "已选文件：" + name : "";
  }

  function bindPermitFileInput() {
    if (permitFileBound) return;
    var input = document.getElementById("p-file");
    if (!input) return;
    permitFileBound = true;
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      if (!file) {
        setPermitFileNameHint("");
        return;
      }
      var ext = (file.name.split(".").pop() || "").toLowerCase();
      if (ext !== "pdf") {
        input.value = "";
        alert("仅支持上传 PDF 文件");
        return;
      }
      setPermitFileNameHint(file.name);
    });
  }

  function openPermit(index) {
    ensureSharedModals();
    bindPermitFileInput();
    permitEditIndex = typeof index === "number" ? index : -1;
    var p = permits[permitEditIndex] || {};
    var routeEl = document.getElementById("p-route");
    var fileEl = document.getElementById("p-file");
    var remarkEl = document.getElementById("p-remark");
    document.getElementById("permit-title").textContent = permitEditIndex > -1 ? "编辑审批文件" : "新增审批文件";
    if (routeEl) routeEl.value = p.route || "";
    if (remarkEl) remarkEl.value = p.remark || "";
    if (fileEl) fileEl.value = "";
    setPermitFileNameHint(permitEditIndex > -1 && p.fileName ? p.fileName + "（重新上传将替换）" : "");
    document.getElementById("permit-mask").classList.add("show");
  }

  function savePermit() {
    var routeEl = document.getElementById("p-route");
    var fileEl = document.getElementById("p-file");
    var remarkEl = document.getElementById("p-remark");
    var route = routeEl ? routeEl.value : "";
    var remark = remarkEl ? remarkEl.value.trim() : "";
    var file = fileEl && fileEl.files && fileEl.files[0];
    var existing = permitEditIndex > -1 ? permits[permitEditIndex] : null;

    if (!route) {
      alert("请选择航线");
      return;
    }
    if (!remark) {
      alert("请填写备注");
      return;
    }
    if (!file && !(existing && existing.fileName)) {
      alert("请上传 PDF 文件");
      return;
    }
    if (file) {
      var ext = (file.name.split(".").pop() || "").toLowerCase();
      if (ext !== "pdf") {
        alert("仅支持上传 PDF 文件");
        return;
      }
    }

    var fileName = file ? file.name : existing.fileName;
    var item = {
      no: existing && existing.no ? existing.no : "WHKY-" + Date.now().toString().slice(-8),
      route: route,
      pass: existing && existing.pass ? existing.pass : "2026-05-13",
      end: existing && existing.end ? existing.end : "2026-06-30",
      remark: remark,
      fileName: fileName
    };
    if (permitEditIndex > -1) permits[permitEditIndex] = item;
    else permits.unshift(item);
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
