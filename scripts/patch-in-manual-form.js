const fs = require("fs");
const path = require("path");
const { joinTag, assertInlinePageScript } = require("./lib/patch-html-utils");

const file = path.join(__dirname, "..", "in-manual.html");
let s = fs.readFileSync(file, "utf8");

const formStart = s.indexOf('    <section id="form-view"');
if (formStart < 0) throw new Error("form-view not found");
let end = s.indexOf("    </section>", formStart);
if (end < 0) throw new Error("form section end not found");
end += "    </section>".length;

const newForm = joinTag(`
    <section id="form-view" class="hidden">
      <\${TAG} class="mb-5 flex items-center gap-3">
        <button type="button" class="w-8 h-8 rounded-md wh-btn-ghost" data-action="back-list"><i class="fa-solid fa-arrow-left"></i></button>
        <\${TAG}><h1 id="form-page-title" class="text-base font-semibold text-white tracking-tight">新建人工巡查记录</h1><\${TAG} class="text-[11px] text-slate-400 mt-0.5">新增/编辑人工巡查记录</\${TAG}></\${TAG}>
      </\${TAG}>
      <\${TAG} class="neon-panel neon-panel--tight p-6">
        <\${TAG} class="max-w-[1280px] space-y-4 text-xs">
          <\${TAG} class="flex items-center gap-4"><label class="form-label required">编号：</label><input id="f-id" type="text" class="wh-input wh-input--readonly h-8 w-[360px] px-2" readonly tabindex="-1" placeholder="自动生成" /></\${TAG}>
          <\${TAG} class="flex items-center gap-4"><label class="form-label required">所属线路：</label><select id="f-line" class="wh-input h-8 w-[360px] px-2"><option value="">请选择</option><option value="8号线">8号线</option><option value="2号线">2号线</option><option value="7号线">7号线</option></select></\${TAG}>
          <\${TAG} class="flex items-center gap-4"><label class="form-label required">上下行：</label><select id="f-direction" class="wh-input h-8 w-[360px] px-2"><option value="">请选择</option><option value="上行">上行</option><option value="下行">下行</option></select></\${TAG}>
          <\${TAG} class="flex items-center gap-4"><label class="form-label">所在区间：</label><select id="f-section" class="wh-input h-8 w-[360px] px-2"><option value="">请选择</option><option value="水果湖-洪山路">水果湖-洪山路</option><option value="洪山路-小洪山">洪山路-小洪山</option></select></\${TAG}>
          <\${TAG} class="flex items-center gap-4"><label class="form-label">站点：</label><select id="f-station" class="wh-input h-8 w-[360px] px-2"><option value="">请选择</option><option value="洪山路">洪山路</option><option value="小洪山">小洪山</option></select></\${TAG}>
          <\${TAG} class="flex items-center gap-4"><label class="form-label required">所在项目：</label><select id="f-project" class="wh-input h-8 flex-1 max-w-[720px] px-2"><option value="">请选择项目</option><option value="新建商业文化设施项目">新建商业文化设施项目</option><option value="洪山路至小洪山商业公寓项目">洪山路至小洪山商业公寓项目</option></select></\${TAG}>
          <\${TAG} class="flex items-center gap-4"><label class="form-label required">巡查日期：</label><input id="f-patrol-date" class="wh-input h-8 w-[360px] px-2" placeholder="巡查日期" /></\${TAG}>
          <\${TAG} class="flex items-start gap-4">
            <label class="form-label pt-2">巡查照片：</label>
            <\${TAG} class="flex-1 min-w-0">
              <\${TAG} class="flex flex-wrap gap-3 items-start">
                <label id="f-photo-tile" class="upload-tile"><i class="fa-solid fa-plus text-lg"></i><span>上传</span><input id="f-photo-input" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif" /></label>
                <\${TAG} id="f-photo-list" class="flex flex-wrap gap-2 flex-1 min-w-0"></\${TAG}>
              </\${TAG}>
              <p id="f-photo-hint" class="upload-hint">支持 JPG、PNG、WEBP、GIF，最多上传 9 张，单张不超过 20MB</p>
            </\${TAG}>
          </\${TAG}>
          <\${TAG} class="flex items-start gap-4">
            <label class="form-label pt-2">巡查视频：</label>
            <\${TAG} class="flex-1 min-w-0">
              <\${TAG} class="flex flex-wrap gap-3 items-start">
                <label id="f-video-tile" class="upload-tile"><i class="fa-solid fa-plus text-lg"></i><span>上传</span><input id="f-video-input" type="file" multiple accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" /></label>
                <\${TAG} id="f-video-list" class="flex flex-wrap gap-2 flex-1 min-w-0"></\${TAG}>
              </\${TAG}>
              <p id="f-video-hint" class="upload-hint">支持 MP4、WEBM、MOV，最多上传 9 个，单个不超过 200MB</p>
            </\${TAG}>
          </\${TAG}>
          <\${TAG} class="flex items-start gap-4"><label class="form-label required">项目进展：</label><textarea id="f-progress" class="wh-input min-h-[86px] flex-1 px-2 py-2" placeholder="请输入项目进展"></textarea></\${TAG}>
          <\${TAG} class="flex items-start gap-4"><label class="form-label">协调情况及备注：</label><textarea id="f-remark" class="wh-input min-h-[86px] flex-1 px-2 py-2" placeholder="协调情况及备注"></textarea></\${TAG}>
          <\${TAG} class="flex justify-center gap-3 pt-5 border-t border-cyan-400/10"><button type="button" class="px-6 py-2 rounded text-xs wh-btn-primary" data-action="save-item">保存</button><button type="button" class="px-6 py-2 rounded text-xs wh-btn-ghost" data-action="back-list">取消</button></\${TAG}>
        </\${TAG}>
      </\${TAG}>
    </section>
`);

s = s.slice(0, formStart) + newForm + s.slice(end);

const scriptOld = `      var tbody = document.getElementById("table-body");`;
const scriptNew = `      var nextId = 122821;
      var editingIndex = null;
      var uploadStores = { photo: [], video: [] };
      var PHOTO_EXT = ["jpg", "jpeg", "png", "webp", "gif"];
      var VIDEO_EXT = ["mp4", "webm", "mov"];
      var PHOTO_MAX = 20 * 1024 * 1024;
      var VIDEO_MAX = 200 * 1024 * 1024;
      var MEDIA_MAX = 9;
      var tbody = document.getElementById("table-body");`;
if (!s.includes(scriptOld)) throw new Error("script anchor not found");
s = s.replace(scriptOld, scriptNew);

const helpers = joinTag(`
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
        var listEl = $(kind === "photo" ? "f-photo-list" : "f-video-list");
        var tile = $(kind === "photo" ? "f-photo-tile" : "f-video-tile");
        var hint = kind === "photo" ? $("f-photo-hint") : $("f-video-hint");
        if (!listEl) return;
        listEl.innerHTML = list
          .map(function (file, idx) {
            if (kind === "photo" && file._url) {
              return (
                '<\${TAG} class="relative">' +
                '<img class="upload-preview" src="' +
                file._url +
                '" alt="" />' +
                '<button type="button" class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] leading-4" data-action="remove-upload" data-kind="' +
                kind +
                '" data-idx="' +
                idx +
                '">×</button></\${TAG}>'
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
        if (tile) tile.classList.toggle("is-disabled", list.length >= MEDIA_MAX);
        if (hint) {
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
          files.forEach(function (file) {
            if (store.length >= MEDIA_MAX) {
              alert(kind === "photo" ? "巡查照片最多上传 9 张" : "巡查视频最多上传 9 个");
              return;
            }
            var err = validateFile(file, kind);
            if (err) return alert(err);
            if (kind === "photo") file._url = URL.createObjectURL(file);
            store.push(file);
          });
          renderUploadList(kind);
        });
      }
      function clearUploads() {
        uploadStores.photo.forEach(function (f) {
          if (f._url) URL.revokeObjectURL(f._url);
        });
        uploadStores.photo = [];
        uploadStores.video = [];
        ["photo", "video"].forEach(renderUploadList);
      }
      function genId() { return String(nextId++); }
      function lockIdField() {
        var el = $("f-id");
        if (!el) return;
        el.readOnly = true;
        el.setAttribute("readonly", "readonly");
      }
`);

const insertBefore = "      function renderRows() {";
if (!s.includes(insertBefore)) throw new Error("renderRows not found");
s = s.replace(insertBefore, helpers + insertBefore);

s = s.replace(
  '<span class="row-action text-sky-300" data-action="edit-item"><i class="fa-regular fa-pen-to-square"></i>编辑</span>',
  '<span class="row-action text-sky-300" data-action="edit-item" data-index="' + "' + index + '" + '"><i class="fa-regular fa-pen-to-square"></i>编辑</span>'
);

const showFormOld = `      function showForm(){ document.getElementById("list-view").classList.add("hidden"); document.getElementById("form-view").classList.remove("hidden"); }
      function showList(){ document.getElementById("form-view").classList.add("hidden"); document.getElementById("list-view").classList.remove("hidden"); }`;

const showFormNew = `      function resetForm() {
        lockIdField();
        $("f-id").value = genId();
        $("f-line").value = "";
        $("f-direction").value = "";
        $("f-section").value = "";
        $("f-station").value = "";
        $("f-project").value = "";
        $("f-patrol-date").value = "";
        $("f-progress").value = "";
        $("f-remark").value = "";
        clearUploads();
        $("form-page-title").textContent = "新建人工巡查记录";
      }
      function loadForm(row) {
        lockIdField();
        $("f-id").value = row.id;
        $("f-line").value = row.line || "";
        $("f-direction").value = row.direction || "";
        $("f-section").value = row.section || "";
        $("f-station").value = row.station || "";
        $("f-project").value = row.projectName || "";
        $("f-patrol-date").value = row.patrolDate || "";
        $("f-progress").value = row.progress || "";
        $("f-remark").value = row.remark || "";
        clearUploads();
        $("form-page-title").textContent = "编辑人工巡查记录";
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
        if (!$("f-project").value) return alert("请选择所在项目");
        if (!$("f-patrol-date").value.trim()) return alert("请填写巡查日期");
        if (!$("f-progress").value.trim()) return alert("请填写项目进展");
        var now = "2026-05-12 18:30";
        var section = $("f-section").value;
        var station = $("f-station").value;
        var place = (section || "—") + (station ? " / " + station : "");
        var row = {
          id: $("f-id").value,
          line: $("f-line").value,
          direction: $("f-direction").value,
          section: section,
          station: station,
          place: place,
          projectName: $("f-project").value,
          progress: $("f-progress").value.trim(),
          remark: $("f-remark").value.trim(),
          patrolDate: $("f-patrol-date").value.trim(),
          user: "当前用户",
          updatedAt: now,
          logs: editingIndex != null ? rows[editingIndex].logs : [{ action: "新增人工巡查记录", user: "当前用户", time: now }],
        };
        if (editingIndex != null) rows[editingIndex] = row;
        else rows.unshift(row);
        renderRows();
        showList();
      }`;

s = s.replace(showFormOld, showFormNew);

s = s.replace(
  `        if (action === "new-item" || action === "edit-item") showForm();`,
  `        var index = target.hasAttribute("data-index") ? Number(target.getAttribute("data-index")) : null;
        if (action === "new-item") showForm("new");
        if (action === "edit-item") showForm("edit", index);
        if (action === "save-item") saveItem();
        if (action === "remove-upload") {
          var kind = target.getAttribute("data-kind");
          var idx = Number(target.getAttribute("data-idx"));
          var removed = uploadStores[kind].splice(idx, 1)[0];
          if (removed && removed._url) URL.revokeObjectURL(removed._url);
          renderUploadList(kind);
          return;
        }`
);

s = s.replace(
  "      renderRows();\n      document.addEventListener",
  '      bindUploader("photo", "f-photo-input");\n      bindUploader("video", "f-video-input");\n      renderRows();\n      document.addEventListener'
);

assertInlinePageScript(s);
fs.writeFileSync(file, s);
console.log("[OK] patched in-manual.html");
