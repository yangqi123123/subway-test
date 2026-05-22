(function (global) {
  var DOC_EXT = ["pdf", "doc", "docx", "xls", "xlsx", "zip", "rar"];
  var PHOTO_EXT = ["jpg", "jpeg", "png", "webp", "gif"];
  var VIDEO_EXT = ["mp4", "webm", "mov"];
  var DOC_MAX = 50 * 1024 * 1024;
  var PHOTO_MAX = 20 * 1024 * 1024;
  var VIDEO_MAX = 200 * 1024 * 1024;
  var MEDIA_MAX = 9;

  var KIND_META = {
    doc: {
      hint: "支持 PDF、Word（doc/docx）、Excel（xls/xlsx）、ZIP/RAR，单文件不超过 50MB",
      max: Infinity,
      alertMax: "资料数量已达上限",
    },
    photo: {
      hint: "支持 JPG、PNG、WEBP、GIF，最多上传 9 张，单张不超过 20MB",
      max: MEDIA_MAX,
      alertMax: "最多上传 9 张照片",
    },
    video: {
      hint: "支持 MP4、WEBM、MOV，最多上传 9 个，单个不超过 200MB",
      max: MEDIA_MAX,
      alertMax: "最多上传 9 个视频",
    },
  };

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

  function revokeStore(store, kind) {
    store.forEach(function (f) {
      if (f._url && !f._remote && kind !== "doc") URL.revokeObjectURL(f._url);
    });
  }

  /**
   * @param {{ kind: 'doc'|'photo'|'video', inputId, listId, tileId, hintId?, hintText?, store?, max? }} config
   */
  function createMediaUploader(config) {
    var kind = config.kind;
    var meta = KIND_META[kind];
    var store = config.store || [];
    var max = config.max == null ? meta.max : config.max;
    var hintBase = config.hintText || meta.hint;
    var input = document.getElementById(config.inputId);
    var listEl = document.getElementById(config.listId);
    var tile = document.getElementById(config.tileId);
    var hint = config.hintId ? document.getElementById(config.hintId) : null;

    function render() {
      if (!listEl) return;
      listEl.innerHTML = store
        .map(function (file, idx) {
          if (kind === "photo" && file._url) {
            return (
              '<div class="relative">' +
              '<img class="upload-preview" src="' +
              file._url +
              '" alt="" />' +
              '<button type="button" class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] leading-4" data-wh-upload-remove data-idx="' +
              idx +
              '">×</button></div>'
            );
          }
          if (kind === "video" && file._url) {
            return (
              '<div class="relative max-w-[200px]">' +
              '<video class="upload-preview w-[200px] h-[72px] object-cover" src="' +
              file._url +
              '" controls muted></video>' +
              '<button type="button" class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] leading-4" data-wh-upload-remove data-idx="' +
              idx +
              '">×</button></div>'
            );
          }
          return (
            '<span class="upload-chip"><span title="' +
            file.name +
            '">' +
            file.name +
            (file.size ? " (" + formatSize(file.size) + ")" : "") +
            '</span><button type="button" data-wh-upload-remove data-idx="' +
            idx +
            '">×</button></span>'
          );
        })
        .join("");
      if (tile) tile.classList.toggle("is-disabled", kind !== "doc" && store.length >= max);
      if (hint && kind !== "doc") {
        hint.textContent = hintBase + "（已选 " + store.length + "/" + max + "）";
      } else if (hint) {
        hint.textContent = hintBase + (store.length ? "（已选 " + store.length + " 个）" : "");
      }
    }

    function clear() {
      revokeStore(store, kind);
      store.length = 0;
      render();
    }

    function setFromItems(items) {
      clear();
      (items || []).forEach(function (item, i) {
        if (!item) return;
        if (typeof item === "string") {
          if (kind === "photo") {
            store.push({ name: "照片" + (i + 1), _url: item, _remote: true });
          } else {
            store.push({ name: item, _remote: true });
          }
          return;
        }
        var entry = { name: item.name || "文件" + (i + 1), _remote: true };
        if (item.url) entry._url = item.url;
        if (item.size) entry.size = item.size;
        store.push(entry);
      });
      render();
    }

    function serialize() {
      return store.map(function (f) {
        return { name: f.name, url: f._url || "", size: f.size || 0 };
      });
    }

    function getPhotoUrls() {
      if (kind !== "photo") return [];
      return store.map(function (f) {
        return f._url || "";
      }).filter(Boolean);
    }

    if (input) {
      input.addEventListener("change", function () {
        var files = Array.from(input.files || []);
        input.value = "";
        files.forEach(function (file) {
          if (store.length >= max) {
            alert(meta.alertMax);
            return;
          }
          var err = validateFile(file, kind);
          if (err) return alert(err);
          if (kind === "photo" || kind === "video") {
            file._url = URL.createObjectURL(file);
          }
          store.push(file);
        });
        render();
      });
    }

    if (listEl) {
      listEl.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-wh-upload-remove]");
        if (!btn) return;
        var idx = Number(btn.dataset.idx);
        var f = store[idx];
        if (f && f._url && !f._remote) URL.revokeObjectURL(f._url);
        store.splice(idx, 1);
        render();
      });
    }

    return {
      kind: kind,
      store: store,
      render: render,
      clear: clear,
      setFromItems: setFromItems,
      serialize: serialize,
      getPhotoUrls: getPhotoUrls,
    };
  }

  function createPhotoUploader(config) {
    return createMediaUploader(Object.assign({ kind: "photo" }, config));
  }

  function createDocUploader(config) {
    return createMediaUploader(Object.assign({ kind: "doc" }, config));
  }

  function createVideoUploader(config) {
    return createMediaUploader(Object.assign({ kind: "video" }, config));
  }

  global.WHUpload = {
    createMediaUploader: createMediaUploader,
    createPhotoUploader: createPhotoUploader,
    createDocUploader: createDocUploader,
    createVideoUploader: createVideoUploader,
    MEDIA_MAX: MEDIA_MAX,
  };
})(window);
