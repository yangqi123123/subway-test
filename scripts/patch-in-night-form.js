const fs = require("fs");
const path = require("path");
const { TAG, joinTag, assertBrowserScriptSafe, assertInlinePageScript } = require("./lib/patch-html-utils");
const file = path.join(__dirname, "..", "in-night.html");
let s = fs.readFileSync(file, "utf8");
const d = TAG;

const formStart = s.indexOf('    <section id="form-view"');
const nl = s.includes("\r\n") ? "\r\n" : "\n";
const formEnd = s.indexOf("  <" + d + ' id="confirm-pop"', formStart);
if (formStart < 0 || formEnd < 0) {
  console.error("markers", formStart, formEnd);
  process.exit(1);
}

const newForm =
  `    <section id="form-view" class="hidden">
      <${d} class="mb-5 flex items-center gap-3">
        <button type="button" class="w-8 h-8 rounded-md wh-btn-ghost" data-action="back-list"><i class="fa-solid fa-arrow-left"></i></button>
        <${d}><h1 id="form-page-title" class="text-base font-semibold text-white tracking-tight">新建夜班作业</h1><${d} class="text-[11px] text-slate-400 mt-0.5">新增/编辑夜班作业</${d}></${d}>
      </${d}>
      <${d} class="neon-panel neon-panel--tight p-6">
        <${d} class="max-w-[1280px] space-y-4 text-xs">
          <${d} class="flex items-center gap-4"><label class="form-label required">编号：</label><input id="f-id" class="wh-input wh-input--readonly h-8 w-[360px] px-2" readonly tabindex="-1" /></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label required">所属线路：</label><select id="f-line" class="wh-input h-8 w-[360px] px-2"><option value="">请选择</option><option value="5号线">5号线</option><option value="2号线">2号线</option><option value="19号线">19号线</option></select></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label required">上下行：</label><select id="f-direction" class="wh-input h-8 w-[360px] px-2"><option value="">请选择</option><option value="上行">上行</option><option value="下行">下行</option></select></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label">所在区间：</label><select id="f-section" class="wh-input h-8 w-[360px] px-2"><option value="">请选择</option><option value="白沙六路-光霞">白沙六路-光霞</option><option value="盘龙城-宏图大道">盘龙城-宏图大道</option></select></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label">站点：</label><select id="f-station" class="wh-input h-8 w-[360px] px-2"><option value="">请选择</option><option value="白沙六路">白沙六路</option><option value="盘龙城">盘龙城</option></select></${d}>
          <${d} class="flex items-start gap-4"><label class="form-label required">夜班作业描述：</label><textarea id="f-desc" class="wh-input min-h-[140px] flex-1 px-2 py-2" placeholder="请输入夜班作业描述"></textarea></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label">作业单位：</label><input id="f-company" class="wh-input h-8 flex-1 max-w-[720px] px-2" placeholder="作业单位" /></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label">特种作业类型：</label><select id="f-special-type" class="wh-input h-8 flex-1 max-w-[720px] px-2"><option value="">请选择</option><option value="动火作业">动火作业</option><option value="吊装作业">吊装作业</option><option value="有限空间作业">有限空间作业</option></select></${d}>
          <${d} class="flex items-start gap-4">
            <label class="form-label pt-2">特种作业资料：</label>
            <${d} class="flex-1 min-w-0">
              <${d} class="flex flex-wrap gap-3 items-start">
                <label id="f-doc-tile" class="upload-tile"><i class="fa-solid fa-plus text-lg"></i><span>上传</span><input id="f-doc-input" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar" /></label>
                <${d} id="f-doc-list" class="flex flex-wrap gap-2 flex-1 min-w-0"></${d}>
              </${d}>
              <p class="upload-hint">支持 PDF、Word（doc/docx）、Excel（xls/xlsx）、ZIP/RAR，单文件不超过 50MB</p>
            </${d}>
          </${d}>
          <${d} class="flex items-start gap-4">
            <label class="form-label pt-2">作业照片：</label>
            <${d} class="flex-1 min-w-0">
              <${d} class="flex flex-wrap gap-3 items-start">
                <label id="f-photo-tile" class="upload-tile"><i class="fa-solid fa-plus text-lg"></i><span>上传</span><input id="f-photo-input" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif" /></label>
                <${d} id="f-photo-list" class="flex flex-wrap gap-2 flex-1 min-w-0"></${d}>
              </${d}>
              <p id="f-photo-hint" class="upload-hint">支持 JPG、PNG、WEBP、GIF，最多上传 9 张，单张不超过 20MB</p>
            </${d}>
          </${d}>
          <${d} class="flex items-start gap-4">
            <label class="form-label pt-2">作业视频：</label>
            <${d} class="flex-1 min-w-0">
              <${d} class="flex flex-wrap gap-3 items-start">
                <label id="f-video-tile" class="upload-tile"><i class="fa-solid fa-plus text-lg"></i><span>上传</span><input id="f-video-input" type="file" multiple accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" /></label>
                <${d} id="f-video-list" class="flex flex-wrap gap-2 flex-1 min-w-0"></${d}>
              </${d}>
              <p id="f-video-hint" class="upload-hint">支持 MP4、WEBM、MOV，最多上传 9 个，单个不超过 200MB</p>
            </${d}>
          </${d}>
          <${d} class="flex items-center gap-4"><label class="form-label required">作业时间：</label><input id="f-time" class="wh-input h-8 w-[360px] px-2" placeholder="作业时间" /></${d}>
          <${d} class="flex justify-end gap-3 pt-5 border-t border-cyan-400/10"><button type="button" class="px-6 py-2 rounded text-xs wh-btn-ghost" data-action="back-list">取消</button><button type="button" class="px-6 py-2 rounded text-xs wh-btn-primary" data-action="save-item">保存</button></${d}>
        </${d}>
      </${d}>
    </section>
`;

s = s.slice(0, formStart) + newForm + "\n" + s.slice(formEnd);

// add readonly style if missing
if (!s.includes("wh-input--readonly")) {
  s = s.replace(
    ".upload-tile input { display: none; }",
    ".upload-tile input { display: none; }\n    .wh-input--readonly { background: rgba(8, 47, 73, 0.55); color: #b8d4e8; cursor: not-allowed; }"
  );
}

const jsStart = s.indexOf("  <script>" + nl + "    (function () {");
const jsEndMarker = "    })();" + nl + "  </script>";
const jsEnd = s.indexOf(jsEndMarker, jsStart);

const newJs = `  <script>
    (function () {
      var rows = [
        { id:"4627", time:"2026-03-05 17:34", line:"5号线", place:"白沙六路-光霞 / 上行", desc:"白沙六路至光霞区间夜间施工巡查，重点核查围挡、动火和人员管控。", company:"地铁集团", user:"杨俊杰", updatedAt:"2026-03-05 17:22", logs:[{ action:"新增夜班作业", user:"鲍雄澎", time:"2026-05-12 14:40:31" }] },
        { id:"4626", time:"2026-03-05 11:16", line:"2号线", place:"盘龙城-宏图大道 / 下行", desc:"盘龙城至宏图大道区间夜间作业复核，已完成照明和围挡检查。", company:"城建单位", user:"董治昊", updatedAt:"2026-03-05 11:04", logs:[{ action:"新增夜班作业", user:"鲍雄澎", time:"2026-05-12 14:40:31" }] },
        { id:"4625", time:"2026-03-05 11:10", line:"2号线", place:"天河停车场 / 场段", desc:"夜间进场实名制检查，核对人员名单和特种作业证件。", company:"施工总包", user:"董治昊", updatedAt:"2026-03-05 10:58", logs:[{ action:"新增夜班作业", user:"鲍雄澎", time:"2026-05-12 14:40:31" }] }
      ];
      var photos = [
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=80&q=80",
        "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=80&q=80",
        "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=80&q=80"
      ];
      var nextId = 4628;
      var editingIndex = null;
      var uploadStores = { doc: [], photo: [], video: [] };
      var DOC_EXT = ["pdf", "doc", "docx", "xls", "xlsx", "zip", "rar"];
      var PHOTO_EXT = ["jpg", "jpeg", "png", "webp", "gif"];
      var VIDEO_EXT = ["mp4", "webm", "mov"];
      var DOC_MAX = 50 * 1024 * 1024;
      var PHOTO_MAX = 20 * 1024 * 1024;
      var VIDEO_MAX = 200 * 1024 * 1024;
      var MEDIA_MAX = 9;

      var tbody = document.getElementById("table-body");
      var confirmPop = document.getElementById("confirm-pop");
      var confirmText = document.getElementById("confirm-text");
      var confirmIcon = document.getElementById("confirm-icon");
      var recordMask = document.getElementById("record-mask");
      var recordBody = document.getElementById("record-body");
      var pendingConfirm = null;

      function $(id) { return document.getElementById(id); }
      function extOf(name) {
        var p = (name || "").lastIndexOf(".");
        return p >= 0 ? name.slice(p + 1).toLowerCase() : "";
      }
      function formatSize(n) {
        if (n < 1024) return n + " B";
        if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
        return (n / (1024 * 1024)).toFixed(1) + " MB";
      }
      function validateFile(file, kind) {
        var ext = extOf(file.name);
        if (kind === "doc") {
          if (DOC_EXT.indexOf(ext) < 0) return "资料仅支持 PDF、Word、Excel、ZIP/RAR 格式";
          if (file.size > DOC_MAX) return "资料单文件不能超过 50MB";
        }
        if (kind === "photo") {
          if (PHOTO_EXT.indexOf(ext) < 0) return "照片仅支持 JPG、PNG、WEBP、GIF 格式";
          if (file.size > PHOTO_MAX) return "单张照片不能超过 20MB";
        }
        if (kind === "video") {
          if (VIDEO_EXT.indexOf(ext) < 0) return "视频仅支持 MP4、WEBM、MOV 格式";
          if (file.size > VIDEO_MAX) return "单个视频不能超过 200MB";
        }
        return "";
      }
      function renderUploadList(kind) {
        var list = uploadStores[kind];
        var listEl = $(kind === "doc" ? "f-doc-list" : kind === "photo" ? "f-photo-list" : "f-video-list");
        var tile = $(kind === "doc" ? "f-doc-tile" : kind === "photo" ? "f-photo-tile" : "f-video-tile");
        var hint = kind === "photo" ? $("f-photo-hint") : kind === "video" ? $("f-video-hint") : null;
        if (!listEl) return;
        listEl.innerHTML = list
          .map(function (file, idx) {
            if (kind === "photo" && file._url) {
              return (
                '<${d} class="relative">' +
                '<img class="upload-preview" src="' +
                file._url +
                '" alt="" />' +
                '<button type="button" class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] leading-4" data-action="remove-upload" data-kind="' +
                kind +
                '" data-idx="' +
                idx +
                '">×</button></${d}>'
              );
            }
            return (
              '<span class="upload-chip"><span title="' +
              file.name +
              '">' +
              file.name +
              " (" +
              formatSize(file.size) +
              ')</span><button type="button" data-action="remove-upload" data-kind="' +
              kind +
              '" data-idx="' +
              idx +
              '">×</button></span>'
            );
          })
          .join("");
        if (tile) tile.classList.toggle("is-disabled", kind !== "doc" && list.length >= MEDIA_MAX);
        if (hint && kind !== "doc") {
          hint.textContent =
            (kind === "photo"
              ? "支持 JPG、PNG、WEBP、GIF，最多上传 9 张，单张不超过 20MB"
              : "支持 MP4、WEBM、MOV，最多上传 9 个，单个不超过 200MB") +
            "（已选 " +
            list.length +
            "/" +
            MEDIA_MAX +
            "）";
        }
      }
      function bindUploader(kind, inputId) {
        var input = $(inputId);
        if (!input) return;
        input.addEventListener("change", function () {
          var files = Array.from(input.files || []);
          input.value = "";
          var store = uploadStores[kind];
          var max = kind === "doc" ? Infinity : MEDIA_MAX;
          files.forEach(function (file) {
            if (store.length >= max) {
              alert(kind === "photo" ? "作业照片最多上传 9 张" : "作业视频最多上传 9 个");
              return;
            }
            var err = validateFile(file, kind);
            if (err) return alert(err);
            if (kind === "photo") {
              file._url = URL.createObjectURL(file);
            }
            store.push(file);
          });
          renderUploadList(kind);
        });
      }
      function clearUploads() {
        uploadStores.photo.forEach(function (f) {
          if (f._url) URL.revokeObjectURL(f._url);
        });
        uploadStores.doc = [];
        uploadStores.photo = [];
        uploadStores.video = [];
        ["doc", "photo", "video"].forEach(renderUploadList);
      }
      function genId() { return String(nextId++); }
      function renderRows() {
        tbody.innerHTML = rows
          .map(function (row, index) {
            var imgs =
              '<img class="thumb" src="' +
              photos[index % photos.length] +
              '" alt="作业图片" /><img class="thumb" src="' +
              photos[(index + 1) % photos.length] +
              '" alt="作业图片" />';
            return (
              '<tr class="' +
              (index % 2 ? "bg-slate-900/35" : "bg-slate-950/25") +
              '">' +
              '<td class="px-3 text-slate-100/95">' +
              row.id +
              '</td><td class="px-3 text-slate-100/95">' +
              row.time +
              '</td><td class="px-3 text-slate-100/95">' +
              row.line +
              '</td><td class="px-3 text-slate-100/95">' +
              row.place +
              '</td><td class="px-3 text-slate-100/95 max-w-[240px] truncate" title="' +
              row.desc +
              '">' +
              row.desc +
              '</td><td class="px-3 text-slate-100/95">' +
              row.company +
              '</td><td class="px-3"><${d} class="flex items-center">' +
              imgs +
              '</${d}></td><td class="px-3 text-slate-500"></td><td class="px-3 text-slate-100/95">' +
              row.user +
              '</td><td class="px-3 text-slate-100/95">' +
              row.updatedAt +
              '</td><td class="px-3"><span class="row-action text-sky-300" data-action="edit-item" data-index="' +
              index +
              '"><i class="fa-regular fa-pen-to-square"></i>编辑</span><span class="row-action text-cyan-300" data-action="confirm-item" data-index="' +
              index +
              '"><i class="fa-regular fa-circle-check"></i>工班确认</span><span class="row-action text-rose-300" data-action="reject-item" data-index="' +
              index +
              '"><i class="fa-regular fa-circle-xmark"></i>拒绝</span><span class="row-action text-rose-300"><i class="fa-regular fa-trash-can"></i>删除</span><span class="row-action text-sky-300" data-action="view-records" data-index="' +
              index +
              '"><i class="fa-regular fa-clock"></i>操作记录</span></td></tr>'
            );
          })
          .join("");
      }
      function resetForm() {
        $("f-id").value = genId();
        $("f-line").value = "";
        $("f-direction").value = "";
        $("f-section").value = "";
        $("f-station").value = "";
        $("f-desc").value = "";
        $("f-company").value = "";
        $("f-special-type").value = "";
        $("f-time").value = "";
        clearUploads();
        $("form-page-title").textContent = "新建夜班作业";
      }
      function loadForm(row) {
        $("f-id").value = row.id;
        $("f-line").value = row.line || "";
        $("f-direction").value = row.direction || "";
        $("f-section").value = row.section || "";
        $("f-station").value = row.station || "";
        $("f-desc").value = row.desc || "";
        $("f-company").value = row.company || "";
        $("f-special-type").value = row.specialType || "";
        $("f-time").value = row.time || "";
        clearUploads();
        $("form-page-title").textContent = "编辑夜班作业";
      }
      function showForm(mode, index) {
        editingIndex = mode === "edit" ? index : null;
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
        if (!$("f-line").value) return alert("请选择所属线路");
        if (!$("f-direction").value) return alert("请选择上下行");
        if (!$("f-desc").value.trim()) return alert("请填写夜班作业描述");
        if (!$("f-time").value.trim()) return alert("请填写作业时间");
        var now = "2026-05-12 18:30";
        var section = $("f-section").value;
        var station = $("f-station").value;
        var place = (section || "—") + " / " + ($("f-direction").value || "—") + (station ? " · " + station : "");
        var row = {
          id: $("f-id").value,
          time: $("f-time").value.trim(),
          line: $("f-line").value,
          direction: $("f-direction").value,
          section: section,
          station: station,
          place: place,
          desc: $("f-desc").value.trim(),
          company: $("f-company").value.trim(),
          specialType: $("f-special-type").value,
          user: "当前用户",
          updatedAt: now,
          logs: editingIndex != null ? rows[editingIndex].logs : [{ action: "新增夜班作业", user: "当前用户", time: now }],
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
        confirmPop.style.left = Math.max(16, rect.left + rect.width / 2 - 66) + "px";
        confirmPop.style.top = Math.max(16, rect.top - 92) + "px";
        confirmPop.classList.remove("hidden");
      }
      function closeConfirm() {
        confirmPop.classList.add("hidden");
        pendingConfirm = null;
      }
      function openRecords(index) {
        recordBody.innerHTML = rows[index].logs
          .map(function (log) {
            return '<${d} class="record-item"><${d} class="mb-3">' + log.action + '</${d}><${d} class="text-[13px] text-slate-400 mb-3">日期：' + log.time + '</${d}><${d} class="text-[13px] text-slate-400">操作者：' + log.user + '</${d}></${d}>';
          })
          .join("");
        recordMask.classList.add("show");
      }

      bindUploader("doc", "f-doc-input");
      bindUploader("photo", "f-photo-input");
      bindUploader("video", "f-video-input");
      renderRows();

      document.addEventListener("click", function (event) {
        var target = event.target.closest("[data-action]");
        if (!target) return;
        var action = target.getAttribute("data-action");
        var index = target.hasAttribute("data-index") ? Number(target.getAttribute("data-index")) : null;
        if (action === "remove-upload") {
          var kind = target.getAttribute("data-kind");
          var idx = Number(target.getAttribute("data-idx"));
          var removed = uploadStores[kind].splice(idx, 1)[0];
          if (removed && removed._url) URL.revokeObjectURL(removed._url);
          renderUploadList(kind);
          return;
        }
        if (action === "new-item") showForm("new");
        if (action === "edit-item") showForm("edit", index);
        if (action === "back-list") showList();
        if (action === "save-item") saveItem();
        if (action === "confirm-item") openConfirm("confirm", index, target);
        if (action === "reject-item") openConfirm("reject", index, target);
        if (action === "cancel-confirm") closeConfirm();
        if (action === "submit-confirm" && pendingConfirm) {
          rows[pendingConfirm.index].logs.push({
            action: pendingConfirm.kind === "confirm" ? "工班确认" : "拒绝",
            user: "鲍雄澎",
            time: "2026-05-12 14:40:31",
          });
          closeConfirm();
        }
        if (action === "view-records") openRecords(Number(target.getAttribute("data-index")));
        if (action === "close-record") recordMask.classList.remove("show");
      });
    })();
  </script>
`;

// Replace ${TAG} / legacy ${d} in template; never leave bare `d` in browser script
const newJsFixed = assertBrowserScriptSafe(joinTag(newJs.split("${d}").join("${TAG}")));

if (jsStart < 0 || jsEnd < 0) {
  console.error("script", jsStart, jsEnd);
  process.exit(1);
}

s = s.slice(0, jsStart) + newJsFixed + s.slice(jsEnd + jsEndMarker.length);
fs.writeFileSync(file, s);
assertInlinePageScript(s);
console.log("ok", s.includes("特种作业资料"), s.includes("f-photo-input"));
