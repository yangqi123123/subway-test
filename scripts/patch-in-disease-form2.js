const fs = require("fs");
const path = require("path");
const { TAG, joinTag, assertBrowserScriptSafe, assertInlinePageScript } = require("./lib/patch-html-utils");
const file = path.join(__dirname, "..", "in-disease.html");
let s = fs.readFileSync(file, "utf8");
const d = TAG;

const start = s.indexOf('    <section id="form-view"');
const end = s.indexOf('  <' + d + ' id="confirm-pop"');
const nl = s.includes("\r\n") ? "\r\n" : "\n";
if (start < 0 || end < 0) {
  console.error("markers", start, end);
  process.exit(1);
}

const newForm =
  `    <section id="form-view" class="hidden">
      <${d} class="mb-5 flex items-center gap-3">
        <button type="button" class="w-8 h-8 rounded-md wh-btn-ghost" data-action="back-list"><i class="fa-solid fa-arrow-left"></i></button>
        <${d}><h1 id="form-page-title" class="text-base font-semibold text-white tracking-tight">新建病害</h1><${d} class="text-[11px] text-slate-400 mt-0.5">新增/编辑病害</${d}></${d}>
      </${d}>
      <${d} class="neon-panel neon-panel--tight p-6">
        <${d} class="max-w-[980px] space-y-4 text-xs">
          <${d} class="flex items-center gap-4"><label class="form-label required">编号：</label><input id="f-id" type="text" class="wh-input wh-input--readonly h-8 form-input-w px-2" readonly tabindex="-1" /></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label required">所属线路：</label><select id="f-line" class="wh-input h-8 form-input-w px-2"><option value="">请选择所属线路</option><option value="2号线">2号线</option><option value="5号线">5号线</option><option value="7号线">7号线</option></select></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label required">上下行：</label><select id="f-direction" class="wh-input h-8 form-input-w px-2"><option value="">请选择上下行</option><option value="上行">上行</option><option value="下行">下行</option></select></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label">所在区间：</label><select id="f-section" class="wh-input h-8 form-input-w px-2"><option value="">请选择所在区间</option><option value="常青花园-长港路">常青花园-长港路</option><option value="长港路-汉口火车站">长港路-汉口火车站</option><option value="白沙六路-光霞">白沙六路-光霞</option></select></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label">站点：</label><select id="f-station" class="wh-input h-8 form-input-w px-2"><option value="">请选择站点</option><option value="常青花园">常青花园</option><option value="长港路">长港路</option><option value="汉口火车站">汉口火车站</option></select></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label required">病害里程：</label><input id="f-mileage" class="wh-input h-8 form-input-w px-2" placeholder="病害里程" /></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label required">巡查项<span class="dict-hint">（数据字典）</span>：</label><select id="f-inspect-item" class="wh-input h-8 form-input-w px-2"></select></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label required">结构类型<span class="dict-hint">（数据字典）</span>：</label><select id="f-structure-type" class="wh-input h-8 form-input-w px-2"></select></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label required">病害类型<span class="dict-hint">（数据字典）</span>：</label><select id="f-disease-type" class="wh-input h-8 form-input-w px-2"></select></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label required">病害程度<span class="dict-hint">（数据字典）</span>：</label><select id="f-disease-level" class="wh-input h-8 form-input-w px-2"></select></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label required">病害发展<span class="dict-hint">（数据字典）</span>：</label><select id="f-disease-development" class="wh-input h-8 form-input-w px-2"></select></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label">环号：</label><input id="f-ring" class="wh-input h-8 form-input-w px-2" placeholder="环号" /></${d}>
          <${d} class="flex items-start gap-4"><label class="form-label pt-1">病害描述：</label><textarea id="f-desc" class="wh-input min-h-[86px] flex-1 px-2 py-2" placeholder="请输入病害描述"></textarea></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label">标签：</label><input id="f-tags" class="wh-input h-8 flex-1 max-w-[720px] px-2" placeholder="标签" /></${d}>
          <${d} class="flex items-start gap-4"><label class="form-label pt-2">病害照片：</label><${d} class="flex flex-wrap gap-3"><label class="upload-tile"><i class="fa-solid fa-plus text-lg"></i><span>上传</span><input id="f-photo-input" type="file" accept="image/*" multiple /></label><span id="f-photo-names" class="text-slate-500 text-xs leading-8"></span></${d}></${d}>
          <${d} class="flex items-start gap-4"><label class="form-label pt-2">病害视频：</label><${d} class="flex flex-wrap gap-3"><label class="upload-tile"><i class="fa-solid fa-plus text-lg"></i><span>上传</span><input id="f-video-input" type="file" accept="video/*" multiple /></label><span id="f-video-names" class="text-slate-500 text-xs leading-8"></span></${d}></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label">关联历史病害：</label><select id="f-history" class="wh-input h-8 flex-1 max-w-[720px] px-2"><option value="">请选择关联历史病害</option></select></${d}>
          <${d} class="flex justify-end gap-3 pt-5 border-t border-cyan-400/10"><button type="button" class="px-6 py-2 rounded text-xs wh-btn-ghost" data-action="back-list">取消</button><button type="button" class="px-6 py-2 rounded text-xs wh-btn-primary" data-action="save-item">保存</button></${d}>
        </${d}>
      </${d}>
    </section>
`;

s = s.slice(0, start) + newForm + s.slice(end);

if (!s.includes("disease-dict.js")) {
  s = s.replace(
    "  <script src=\"assets/js/menu-config.js\">",
    "  <script src=\"assets/js/disease-dict.js\"></script>\n  <script src=\"assets/js/menu-config.js\">"
  );
}

const jsStart = s.indexOf("  <script>" + nl + "    (function () {");
const jsEndMarker = "    })();" + nl + "  </script>";
const jsEnd = s.indexOf(jsEndMarker, jsStart);
if (jsStart < 0 || jsEnd < 0) {
  console.error("script block not found", jsStart, jsEnd);
  process.exit(1);
}

const newJs = `  <script>
    (function () {
      var rows = [
        { id:"15069", line:"2号线", section:"常青花园-长港路", station:"常青花园", place:"常青花园-长港路 / 常青花园", direction:"上行", mileage:"Z1+644", inspectItem:"daily", structureType:"section", diseaseType:"bulge", level:"normal", development:"untreated", ring:"", tags:"", desc:"常青区间Z1+644中心沟盖板鼓包", progress:"病害未处理", date:"2026-03-05 10:49", historyId:"", logs:[{ action:"新增病害巡查", user:"鲍雄澎", time:"2026-05-12 09:20:16" }, { action:"工班确认", user:"汪兵", time:"2026-05-12 10:42:31" }] },
        { id:"15068", line:"2号线", section:"常青花园-长港路", station:"长港路", place:"常青花园-长港路 / 长港路", direction:"上行", mileage:"Z1+820", inspectItem:"daily", structureType:"section", diseaseType:"bulge", level:"normal", development:"untreated", ring:"", tags:"", desc:"常青区间Z1+820中心沟盖板鼓包", progress:"病害未处理", date:"2026-03-05 10:48", historyId:"", logs:[{ action:"新增病害巡查", user:"鲍雄澎", time:"2026-05-12 09:18:45" }, { action:"拒绝", user:"汪兵", time:"2026-05-12 11:16:08" }] },
        { id:"15067", line:"2号线", section:"常青花园-长港路", station:"常青花园", place:"常青花园-长港路 / 常青花园", direction:"上行", mileage:"Z1+603", inspectItem:"special", structureType:"tunnel", diseaseType:"other", level:"normal", development:"developing", ring:"", tags:"", desc:"常青区间Z1+603沉沙井排水盖板破损", progress:"病害未处理", date:"2026-03-05 10:46", historyId:"", logs:[{ action:"新增病害巡查", user:"鲍雄澎", time:"2026-05-12 09:15:22" }, { action:"工班确认", user:"汪兵", time:"2026-05-12 09:56:42" }, { action:"拒绝", user:"王军", time:"2026-05-12 12:08:19" }] }
      ];
      var photos = [
        "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=80&q=80",
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=80&q=80",
        "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=80&q=80"
      ];
      var editingIndex = null;
      var nextId = 15070;
      var tbody = document.getElementById("table-body");
      var confirmPop = document.getElementById("confirm-pop");
      var confirmText = document.getElementById("confirm-text");
      var confirmIcon = document.getElementById("confirm-icon");
      var recordMask = document.getElementById("record-mask");
      var recordBody = document.getElementById("record-body");
      var pendingConfirm = null;

      function $(id) { return document.getElementById(id); }
      function dictLabel(type, val) {
        return window.DiseaseDict ? DiseaseDict.labelByValue(type, val) : val;
      }
      function genId() { return String(nextId++); }
      function fillDictSelects(data) {
        if (!window.DiseaseDict) return;
        DiseaseDict.fillSelect($("f-inspect-item"), "disease_inspect_item", "请选择巡查项", data && data.inspectItem);
        DiseaseDict.fillSelect($("f-structure-type"), "disease_structure_type", "请选择结构类型", data && data.structureType);
        DiseaseDict.fillSelect($("f-disease-type"), "disease_type", "请选择病害类型", data && data.diseaseType);
        DiseaseDict.fillSelect($("f-disease-level"), "disease_level", "请选择病害程度", data && data.level);
        DiseaseDict.fillSelect($("f-disease-development"), "disease_development", "请选择病害发展", data && data.development);
      }
      function fillHistoryOptions(excludeId, selected) {
        var sel = $("f-history");
        if (!sel) return;
        var html = '<option value="">请选择关联历史病害</option>';
        rows.forEach(function (r) {
          if (r.id === excludeId) return;
          html += '<option value="' + r.id + '">' + r.id + " · " + r.desc + "</option>";
        });
        sel.innerHTML = html;
        if (selected) sel.value = selected;
      }
      function bindFileInput(inputId, nameId) {
        var input = $(inputId);
        var nameEl = $(nameId);
        if (!input || !nameEl) return;
        input.addEventListener("change", function () {
          var names = Array.from(input.files || []).map(function (f) { return f.name; });
          nameEl.textContent = names.length ? names.join("、") : "";
        });
      }
      function renderRows() {
        tbody.innerHTML = rows.map(function (row, index) {
          var imgs = '<img class="thumb" src="' + photos[index % photos.length] + '" alt="病害图片" />';
          var typeLabel = dictLabel("disease_type", row.diseaseType);
          var levelLabel = dictLabel("disease_level", row.level);
          return '<tr class="' + (index % 2 ? "bg-slate-900/35" : "bg-slate-950/25") + '">' +
            '<td class="px-3 text-slate-100/95">' + row.id + '</td><td class="px-3 text-slate-100/95">' + row.line + '</td><td class="px-3 text-slate-100/95">' + row.place + '</td><td class="px-3 text-slate-100/95">' + row.direction + '</td><td class="px-3 text-slate-100/95">' + row.mileage + '</td><td class="px-3 text-slate-100/95">' + typeLabel + '</td><td class="px-3 text-slate-100/95">' + levelLabel + '</td><td class="px-3 text-slate-100/95 max-w-[170px] truncate" title="' + row.desc + '">' + row.desc + '</td><td class="px-3"><${TAG} class="flex items-center">' + imgs + '</${TAG}></td><td class="px-3 text-slate-500"></td><td class="px-3 text-slate-100/95">汪兵</td><td class="px-3 text-slate-100/95">' + row.date + '</td><td class="px-3 text-slate-100/95">' + row.progress + '</td><td class="px-3"><span class="row-action text-sky-300" data-action="edit-item" data-index="' + index + '"><i class="fa-regular fa-pen-to-square"></i>编辑</span><span class="row-action text-cyan-300" data-action="confirm-item" data-index="' + index + '"><i class="fa-regular fa-circle-check"></i>工班确认</span><span class="row-action text-rose-300" data-action="reject-item" data-index="' + index + '"><i class="fa-regular fa-circle-xmark"></i>拒绝</span><span class="row-action text-rose-300"><i class="fa-regular fa-trash-can"></i>删除</span><span class="row-action text-sky-300" data-action="view-records" data-index="' + index + '"><i class="fa-regular fa-clock"></i>操作记录</span></td></tr>';
        }).join("");
      }
      function resetForm() {
        $("f-id").value = genId();
        $("f-line").value = "";
        $("f-direction").value = "下行";
        $("f-section").value = "";
        $("f-station").value = "";
        $("f-mileage").value = "";
        $("f-ring").value = "";
        $("f-desc").value = "";
        $("f-tags").value = "";
        $("f-photo-input").value = "";
        $("f-video-input").value = "";
        $("f-photo-names").textContent = "";
        $("f-video-names").textContent = "";
        fillDictSelects(null);
        fillHistoryOptions(null);
      }
      function loadForm(row) {
        $("f-id").value = row.id;
        $("f-line").value = row.line || "";
        $("f-direction").value = row.direction || "";
        $("f-section").value = row.section || "";
        $("f-station").value = row.station || "";
        $("f-mileage").value = row.mileage || "";
        $("f-ring").value = row.ring || "";
        $("f-desc").value = row.desc || "";
        $("f-tags").value = row.tags || "";
        fillDictSelects(row);
        fillHistoryOptions(row.id, row.historyId || "");
      }
      function readForm() {
        var line = $("f-line").value;
        var section = $("f-section").value;
        var station = $("f-station").value;
        var place = (section || "—") + (station ? " / " + station : "");
        return {
          id: $("f-id").value,
          line: line,
          section: section,
          station: station,
          place: place,
          direction: $("f-direction").value,
          mileage: $("f-mileage").value.trim(),
          inspectItem: $("f-inspect-item").value,
          structureType: $("f-structure-type").value,
          diseaseType: $("f-disease-type").value,
          level: $("f-disease-level").value,
          development: $("f-disease-development").value,
          ring: $("f-ring").value.trim(),
          tags: $("f-tags").value.trim(),
          desc: $("f-desc").value.trim(),
          historyId: $("f-history").value,
          diseaseTypeLabel: dictLabel("disease_type", $("f-disease-type").value),
          levelLabel: dictLabel("disease_level", $("f-disease-level").value)
        };
      }
      function validateForm() {
        var d = readForm();
        if (!d.line) return alert("请选择所属线路"), false;
        if (!d.direction) return alert("请选择上下行"), false;
        if (!d.mileage) return alert("请填写病害里程"), false;
        if (!d.inspectItem) return alert("请选择巡查项"), false;
        if (!d.structureType) return alert("请选择结构类型"), false;
        if (!d.diseaseType) return alert("请选择病害类型"), false;
        if (!d.level) return alert("请选择病害程度"), false;
        if (!d.development) return alert("请选择病害发展"), false;
        return true;
      }
      function showForm(mode, index) {
        editingIndex = mode === "edit" ? index : null;
        $("form-page-title").textContent = mode === "edit" ? "编辑病害" : "新建病害";
        if (mode === "edit" && rows[index]) loadForm(rows[index]);
        else resetForm();
        document.getElementById("list-view").classList.add("hidden");
        document.getElementById("form-view").classList.remove("hidden");
      }
      function showList() {
        document.getElementById("form-view").classList.add("hidden");
        document.getElementById("list-view").classList.remove("hidden");
      }
      function saveItem() {
        if (!validateForm()) return;
        var data = readForm();
        var now = "2026-05-12 18:30";
        var row = {
          id: data.id,
          line: data.line,
          section: data.section,
          station: data.station,
          place: data.place,
          direction: data.direction,
          mileage: data.mileage,
          inspectItem: data.inspectItem,
          structureType: data.structureType,
          diseaseType: data.diseaseType,
          level: data.level,
          development: data.development,
          ring: data.ring,
          tags: data.tags,
          desc: data.desc,
          historyId: data.historyId,
          progress: dictLabel("disease_development", data.development),
          date: now,
          logs: editingIndex != null ? rows[editingIndex].logs : [{ action: "新增病害巡查", user: "当前用户", time: now }]
        };
        if (editingIndex != null) rows[editingIndex] = row;
        else rows.unshift(row);
        renderRows();
        showList();
      }
      function openConfirm(kind, index, trigger) {
        pendingConfirm = { kind: kind, index: index };
        confirmText.textContent = kind === "confirm" ? "确定通过？" : "确定拒绝？";
        confirmIcon.className = "fa-solid fa-star " + (kind === "confirm" ? "text-amber-400" : "text-red-400");
        var rect = trigger.getBoundingClientRect();
        confirmPop.style.left = Math.max(16, rect.left + rect.width / 2 - 78) + "px";
        confirmPop.style.top = Math.max(16, rect.top - 92) + "px";
        confirmPop.classList.remove("hidden");
      }
      function closeConfirm() { confirmPop.classList.add("hidden"); pendingConfirm = null; }
      function openRecords(index) {
        recordBody.innerHTML = rows[index].logs.map(function (log) {
          return '<${TAG} class="record-item"><${TAG} class="mb-3">' + log.action + '</${TAG}><${TAG} class="text-[13px] text-slate-400 mb-3">日期：' + log.time + '</${TAG}><${TAG} class="text-[13px] text-slate-400">操作者：' + log.user + '</${TAG}></${TAG}>';
        }).join("");
        recordMask.classList.add("show");
      }

      bindFileInput("f-photo-input", "f-photo-names");
      bindFileInput("f-video-input", "f-video-names");
      renderRows();

      document.addEventListener("click", function (event) {
        var target = event.target.closest("[data-action]");
        if (!target) return;
        var action = target.getAttribute("data-action");
        var index = target.hasAttribute("data-index") ? Number(target.getAttribute("data-index")) : null;
        if (action === "new-item") showForm("new");
        if (action === "edit-item") showForm("edit", index);
        if (action === "back-list") showList();
        if (action === "save-item") saveItem();
        if (action === "confirm-item") openConfirm("confirm", index, target);
        if (action === "reject-item") openConfirm("reject", index, target);
        if (action === "cancel-confirm") closeConfirm();
        if (action === "submit-confirm" && pendingConfirm) {
          rows[pendingConfirm.index].logs.push({ action: pendingConfirm.kind === "confirm" ? "工班确认" : "拒绝", user: "鲍雄澎", time: "2026-05-12 14:40:31" });
          closeConfirm();
        }
        if (action === "view-records") openRecords(index);
        if (action === "close-record") recordMask.classList.remove("show");
      });
    })();
  </script>
`;

const newJsOut = assertBrowserScriptSafe(joinTag(newJs));
s = s.slice(0, jsStart) + newJsOut + s.slice(jsEnd + jsEndMarker.length);

fs.writeFileSync(file, s);
assertInlinePageScript(s);
console.log("ok", s.includes("f-inspect-item"), s.includes("DiseaseDict"));
