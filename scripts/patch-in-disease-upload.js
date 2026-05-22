const fs = require("fs");
const path = require("path");
const { assertInlinePageScript } = require("./lib/patch-html-utils");
const file = path.join(__dirname, "..", "in-disease.html");
let s = fs.readFileSync(file, "utf8");
const t = "d" + "iv";

const photoOld =
  '<' +
  t +
  ' class="flex items-start gap-4"><label class="form-label pt-2">病害照片：</label><' +
  t +
  ' class="flex flex-wrap gap-3"><label class="upload-tile"><i class="fa-solid fa-plus text-lg"></i><span>上传</span><input id="f-photo-input" type="file" accept="image/*" multiple /></label><span id="f-photo-names" class="text-slate-500 text-xs leading-8"></span></' +
  t +
  "></" +
  t +
  ">";

const photoNew = `          <${t} class="flex items-start gap-4">
            <label class="form-label pt-2">病害照片：</label>
            <${t} class="flex-1 min-w-0">
              <${t} class="flex flex-wrap gap-3 items-start">
                <label id="f-photo-tile" class="upload-tile"><i class="fa-solid fa-plus text-lg"></i><span>上传</span><input id="f-photo-input" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif" /></label>
                <${t} id="f-photo-list" class="flex flex-wrap gap-2 flex-1 min-w-0"></${t}>
              </${t}>
              <p id="f-photo-hint" class="upload-hint">支持 JPG、PNG、WEBP、GIF，最多上传 9 张，单张不超过 20MB</p>
            </${t}>
          </${t}>`;

const videoOld =
  '<' +
  t +
  ' class="flex items-start gap-4"><label class="form-label pt-2">病害视频：</label><' +
  t +
  ' class="flex flex-wrap gap-3"><label class="upload-tile"><i class="fa-solid fa-plus text-lg"></i><span>上传</span><input id="f-video-input" type="file" accept="video/*" multiple /></label><span id="f-video-names" class="text-slate-500 text-xs leading-8"></span></' +
  t +
  "></" +
  t +
  ">";

const videoNew = `          <${t} class="flex items-start gap-4">
            <label class="form-label pt-2">病害视频：</label>
            <${t} class="flex-1 min-w-0">
              <${t} class="flex flex-wrap gap-3 items-start">
                <label id="f-video-tile" class="upload-tile"><i class="fa-solid fa-plus text-lg"></i><span>上传</span><input id="f-video-input" type="file" multiple accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" /></label>
                <${t} id="f-video-list" class="flex flex-wrap gap-2 flex-1 min-w-0"></${t}>
              </${t}>
              <p id="f-video-hint" class="upload-hint">支持 MP4、WEBM、MOV，最多上传 9 个，单个不超过 200MB</p>
            </${t}>
          </${t}>`;

if (!s.includes(photoOld)) {
  console.error("photo block not found");
  process.exit(1);
}
s = s.replace(photoOld, photoNew);
s = s.replace(videoOld, videoNew);

s = s.replace(/inspectItem:"daily"/g, 'inspectItem:"segment"');
s = s.replace(/inspectItem:"special"/g, 'inspectItem:"sediment_pit"');
s = s.replace(/structureType:"section"/g, 'structureType:"shield"');
s = s.replace(/structureType:"tunnel"/g, 'structureType:"mined"');

const bindStart = s.indexOf("      function bindFileInput(inputId, nameId) {");
const bindEnd = s.indexOf("      function renderRows()", bindStart);
if (bindStart < 0 || bindEnd < 0) {
  console.error("bindFileInput not found");
  process.exit(1);
}

const uploadJs = `      var uploadStores = { photo: [], video: [] };
      var PHOTO_EXT = ["jpg", "jpeg", "png", "webp", "gif"];
      var VIDEO_EXT = ["mp4", "webm", "mov"];
      var PHOTO_MAX = 20 * 1024 * 1024;
      var VIDEO_MAX = 200 * 1024 * 1024;
      var MEDIA_MAX = 9;
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
                '<${t} class="relative">' +
                '<img class="upload-preview" src="' +
                file._url +
                '" alt="" />' +
                '<button type="button" class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] leading-4" data-action="remove-upload" data-kind="' +
                kind +
                '" data-idx="' +
                idx +
                '">×</button></${t}>'
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
              alert(kind === "photo" ? "病害照片最多上传 9 张" : "病害视频最多上传 9 个");
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
        renderUploadList("photo");
        renderUploadList("video");
      }
`;

s = s.slice(0, bindStart) + uploadJs.split("${t}").join(t) + s.slice(bindEnd);

s = s.replace(
  /\$\("f-photo-input"\)\.value = "";\s*\$\("f-video-input"\)\.value = "";\s*\$\("f-photo-names"\)\.textContent = "";\s*\$\("f-video-names"\)\.textContent = "";/,
  "clearUploads();"
);

s = s.replace(
  '      bindFileInput("f-photo-input", "f-photo-names");\n      bindFileInput("f-video-input", "f-video-names");',
  '      bindUploader("photo", "f-photo-input");\n      bindUploader("video", "f-video-input");'
);

if (!s.includes('if (action === "remove-upload")')) {
  s = s.replace(
    "        if (action === \"new-item\") showForm(\"new\");",
    `        if (action === "remove-upload") {
          var kind = target.getAttribute("data-kind");
          var idx = Number(target.getAttribute("data-idx"));
          var removed = uploadStores[kind].splice(idx, 1)[0];
          if (removed && removed._url) URL.revokeObjectURL(removed._url);
          renderUploadList(kind);
          return;
        }
        if (action === "new-item") showForm("new");`
  );
}

if (!s.includes(".upload-tile.is-disabled")) {
  s = s.replace(
    ".upload-tile input { display: none; }",
    ".upload-tile.is-disabled { opacity: 0.45; pointer-events: none; cursor: not-allowed; }\n    .upload-tile input { display: none; }"
  );
}

fs.writeFileSync(file, s);
assertInlinePageScript(s);
console.log("ok");
