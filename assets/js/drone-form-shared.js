(function (global) {
  var saveCallback = null;
  var airports = [
    { name: "车辆段机场", line: "8号线" },
    { name: "青山机场", line: "8号线" },
    { name: "黄家湖机场", line: "7号线" },
    { name: "长江新区机场", line: "11号线" }
  ];

  function airportOptions() {
    return airports.map(function (item) {
      return '<option value="' + item.name + '">' + item.name + '</option>';
    }).join("");
  }

  function findAirport(name) {
    for (var i = 0; i < airports.length; i++) {
      if (airports[i].name === name) return airports[i];
    }
    return null;
  }

  function inferAirport(row) {
    if (!row) return airports[0].name;
    if (row.airport) return row.airport;
    for (var i = 0; i < airports.length; i++) {
      if (airports[i].line === row.line && row.name && row.name.indexOf(airports[i].name.replace("机场", "")) > -1) return airports[i].name;
    }
    for (var j = 0; j < airports.length; j++) {
      if (airports[j].line === row.line) return airports[j].name;
    }
    return airports[0].name;
  }

  function syncLineByAirport() {
    var airport = findAirport(getValue("airport")) || airports[0];
    setValue("line", airport.line);
  }

  function ensureForm() {
    if (document.getElementById("drone-form-mask")) return;
    document.body.insertAdjacentHTML("beforeend",
      '<div id="drone-form-mask" class="dr-modal-mask">' +
        '<div class="dr-modal">' +
          '<div class="h-14 px-6 flex items-center justify-between gap-3 border-b border-cyan-400/15"><h3 id="drone-form-title" class="text-white text-[16px] font-semibold">新增无人机设备</h3><button type="button" class="wh-modal-close" aria-label="关闭" data-action="close-drone-form">×</button></div>' +
          '<div class="p-6"><div class="dr-form-grid">' +
            '<label class="dr-form-item"><span class="dr-form-label"><b class="req">*</b>设备型号：</span><input id="df-model" class="wh-input h-8 flex-1 px-3" /></label>' +
            '<label class="dr-form-item"><span class="dr-form-label"><b class="req">*</b>设备SN：</span><input id="df-sn" class="wh-input h-8 flex-1 px-3" /></label>' +
            '<label class="dr-form-item"><span class="dr-form-label"><b class="req">*</b>设备名称：</span><input id="df-name" class="wh-input h-8 flex-1 px-3" /></label>' +
            '<label class="dr-form-item"><span class="dr-form-label"><b class="req">*</b>所属机场：</span><select id="df-airport" class="wh-input h-8 flex-1 px-2">' + airportOptions() + '</select></label>' +
            '<label class="dr-form-item"><span class="dr-form-label">所属线路：</span><input id="df-line" class="wh-input h-8 flex-1 px-3 opacity-80" readonly /></label>' +
            '<label class="dr-form-item"><span class="dr-form-label"><b class="req">*</b>当前状态：</span><select id="df-status" class="wh-input h-8 flex-1 px-2"><option>在线</option><option>离线</option><option>故障</option><option>维护中</option></select></label>' +
            '<label class="dr-form-item"><span class="dr-form-label">飞手姓名：</span><input id="df-pilot" class="wh-input h-8 flex-1 px-3" /></label>' +
            '<label class="dr-form-item"><span class="dr-form-label">经度：</span><input id="df-lng" class="wh-input h-8 flex-1 px-3" /></label>' +
            '<label class="dr-form-item"><span class="dr-form-label">纬度：</span><input id="df-lat" class="wh-input h-8 flex-1 px-3" /></label>' +
            '<label class="dr-form-item"><span class="dr-form-label">购买日期：</span><input id="df-buy" type="date" class="wh-input h-8 flex-1 px-3" /></label>' +
            '<label class="dr-form-item"><span class="dr-form-label">质保结束日期：</span><input id="df-warranty" type="date" class="wh-input h-8 flex-1 px-3" /></label>' +
            '<label class="dr-form-item"><span class="dr-form-label">厂家：</span><input id="df-maker" class="wh-input h-8 flex-1 px-3" /></label>' +
            '<label class="dr-form-item"><span class="dr-form-label">重量：</span><input id="df-weight" class="wh-input h-8 flex-1 px-3" /></label>' +
            '<label class="dr-form-item"><span class="dr-form-label">上传照片：</span><input id="df-photo" type="file" accept="image/*" class="wh-input h-8 flex-1 px-2 py-1" /></label>' +
            '<label class="dr-form-item" style="grid-column:1/-1"><span class="dr-form-label">配件信息：</span><input id="df-parts" class="wh-input h-8 flex-1 px-3" /></label>' +
          '</div></div>' +
          '<div class="px-6 py-4 flex justify-end gap-3 border-t border-cyan-400/15"><button type="button" class="px-6 h-8 rounded text-xs wh-btn-ghost" data-action="close-drone-form">取消</button><button type="button" class="px-6 h-8 rounded text-xs wh-btn-primary" data-action="save-drone-form">确定</button></div>' +
        '</div>' +
      '</div>');
  }

  function setValue(key, value) {
    var el = document.getElementById("df-" + key);
    if (el) el.value = value || "";
  }

  function getValue(key) {
    var el = document.getElementById("df-" + key);
    return el ? el.value.trim() : "";
  }

  function open(row, callback) {
    ensureForm();
    saveCallback = callback;
    document.getElementById("drone-form-title").textContent = row ? "编辑无人机设备" : "新增无人机设备";
    ["model","sn","name","status","pilot","lng","lat","buy","warranty","maker","weight","parts"].forEach(function (key) {
      setValue(key, row ? row[key] : "");
    });
    setValue("airport", inferAirport(row));
    syncLineByAirport();
    if (!row) {
      setValue("status", "在线");
    }
    document.getElementById("drone-form-mask").classList.add("show");
  }

  function save() {
    syncLineByAirport();
    var required = ["model", "sn", "name", "airport", "status"];
    for (var i = 0; i < required.length; i++) {
      if (!getValue(required[i])) {
        alert("请完善必填项");
        return;
      }
    }
    var data = {};
    ["model","sn","name","airport","line","status","pilot","lng","lat","buy","warranty","maker","weight","parts"].forEach(function (key) {
      data[key] = getValue(key);
    });
    data.last = data.last || "2026-05-13 10:00";
    document.getElementById("drone-form-mask").classList.remove("show");
    if (typeof saveCallback === "function") saveCallback(data);
  }

  document.addEventListener("click", function (event) {
    var node = event.target.closest("[data-action]");
    if (!node) return;
    if (node.dataset.action === "close-drone-form") document.getElementById("drone-form-mask").classList.remove("show");
    if (node.dataset.action === "save-drone-form") save();
  });

  document.addEventListener("change", function (event) {
    if (event.target && event.target.id === "df-airport") syncLineByAirport();
  });

  global.WHDroneForm = {
    open: open,
    ensure: ensureForm
  };
})(window);
