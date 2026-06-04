/**
 * 项目交底及交涉信息 — 交涉记录表单、卡片列表（项目管理 / 完工项目共用）
 */
(function (global) {
  var EXCHANGE_FIELDS = [
    { label: "项目交涉日期", key: "date" },
    { label: "项目交涉单位", key: "unit" },
    { label: "项目交涉内容", key: "content" },
    { label: "是否履行保护区程序", key: "procedure" },
    { label: "交涉现场照片", key: "photos", type: "media", mediaKind: "photo" },
    { label: "交涉现场视频", key: "videos", type: "media", mediaKind: "video" },
    { label: "交涉资料", key: "attachment", type: "file" }
  ];

  function normalizeRecord(record) {
    record = record || {};
    if (!record.photos || !record.photos.length) {
      if (record.image) {
        record.photos = [{ name: record.image, url: record.imageUrl || "" }];
      } else {
        record.photos = [];
      }
    }
    if (!record.videos) record.videos = [];
    record.photos = record.photos.map(function (item) {
      item = item || {};
      if (global.ProjectPreviewMock) {
        if (global.ProjectPreviewMock.isRemoteBlockedUrl(item.url)) item.url = "";
        if (!item.url && item.name) item.url = global.ProjectPreviewMock.resolveMockPreviewUrl(item.name, "");
      }
      return item;
    });
    record.videos = record.videos.map(function (item) {
      item = item || {};
      if (global.ProjectPreviewMock) {
        if (global.ProjectPreviewMock.isRemoteBlockedUrl(item.url)) item.url = "";
        if (!item.url && item.name) item.url = global.ProjectPreviewMock.resolveMockPreviewUrl(item.name, "");
      }
      return item;
    });
    if (global.ProjectPreviewMock) {
      if (global.ProjectPreviewMock.isRemoteBlockedUrl(record.attachmentUrl)) record.attachmentUrl = "";
      if (!record.attachmentUrl && record.attachment) {
        record.attachmentUrl = global.ProjectPreviewMock.resolveMockPreviewUrl(record.attachment, "");
      }
      if (!record.attachmentMimeType && record.attachment && global.ProjectDocShared) {
        record.attachmentMimeType = global.ProjectDocShared.inferMimeFromFileName(record.attachment);
      }
    } else if (!record.attachmentUrl && record.attachment && global.ProjectDocShared && global.ProjectDocShared.resolveDemoFileUrl) {
      record.attachmentUrl = global.ProjectDocShared.resolveDemoFileUrl(record.attachment);
    }
    return record;
  }

  function mediaUploadBlock(kind, idPrefix) {
    var isPhoto = kind === "photo";
    var label = isPhoto ? "交涉现场照片" : "交涉现场视频";
    var accept = isPhoto
      ? 'image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif'
      : "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov";
    var hint = isPhoto
      ? "支持 JPG、PNG、WEBP、GIF，最多上传 9 张，单张不超过 20MB"
      : "支持 MP4、WEBM、MOV，最多上传 9 个，单个不超过 200MB";
    return (
      '<label class="flex items-start gap-3">' +
      '<span class="project-form-label pt-2">' +
      label +
      "：</span>" +
      '<div class="flex-1 min-w-0">' +
      '<div class="flex flex-wrap gap-3 items-start">' +
      '<label id="' +
      idPrefix +
      '-tile" class="upload-tile"><i class="fa-solid fa-plus text-lg"></i><span>上传</span>' +
      '<input id="' +
      idPrefix +
      '-input" type="file" multiple accept="' +
      accept +
      '" /></label>' +
      '<div id="' +
      idPrefix +
      '-list" class="flex flex-wrap gap-2 flex-1 min-w-0"></div>' +
      "</div>" +
      '<p id="' +
      idPrefix +
      '-hint" class="upload-hint">' +
      hint +
      "</p></div></label>"
    );
  }

  function createHandlers(ctx) {
    function ensureCardStyles() {
      if (document.getElementById("project-exchange-card-style")) return;
      var style = document.createElement("style");
      style.id = "project-exchange-card-style";
      style.textContent =
        ".proj-exchange-section{margin-bottom:8px}" +
        ".proj-exchange-section__head{display:flex;align-items:center;justify-content:flex-end;margin-bottom:14px;gap:12px}" +
        ".proj-exchange-cards{display:flex;flex-direction:column;gap:12px}" +
        ".proj-exchange-card{display:flex;align-items:stretch;gap:0;border:1px solid rgba(34,211,238,.18);border-radius:10px;background:rgba(8,15,35,.55);overflow:hidden}" +
        ".proj-exchange-card__main{flex:1 1 auto;min-width:0;padding:16px 18px}" +
        ".proj-exchange-card__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 28px}" +
        ".proj-exchange-field{display:flex;align-items:flex-start;gap:10px;min-width:0;font-size:12px;line-height:1.45}" +
        ".proj-exchange-field__label{flex:0 0 132px;color:rgba(148,163,184,.95);text-align:right}" +
        ".proj-exchange-field__value{flex:1 1 auto;min-width:0;color:rgba(226,245,255,.92);word-break:break-all}" +
        ".proj-exchange-field__empty{color:rgba(100,116,139,.9)}" +
        ".proj-exchange-field__links{display:flex;flex-wrap:wrap;gap:8px 12px}" +
        ".proj-exchange-card__actions{flex:0 0 auto;display:flex;flex-direction:column;justify-content:center;gap:10px;padding:16px 18px;border-left:1px solid rgba(34,211,238,.12);background:rgba(2,8,23,.35)}" +
        ".proj-exchange-card__actions .unit-inline-action{display:block;text-align:center;white-space:nowrap}" +
        "@media(max-width:900px){.proj-exchange-card{flex-direction:column}.proj-exchange-card__actions{flex-direction:row;border-left:0;border-top:1px solid rgba(34,211,238,.12)}.proj-exchange-card__grid{grid-template-columns:1fr}.proj-exchange-field__label{flex:0 0 108px}}";
      document.head.appendChild(style);
    }

    function renderMediaLinks(items, index, previewAction, mediaKind) {
      items = items || [];
      if (!items.length) {
        return '<span class="proj-exchange-field__empty">未上传</span>';
      }
      return (
        '<span class="proj-exchange-field__links">' +
        items
          .map(function (item, mediaIndex) {
            var name = (item && item.name) || "文件";
            return (
              '<span class="project-link-action" data-action="' +
              previewAction +
              '" data-index="' +
              index +
              '" data-media-kind="' +
              mediaKind +
              '" data-media-index="' +
              mediaIndex +
              '">' +
              ctx.escapeHtml(name) +
              "</span>"
            );
          })
          .join("") +
        "</span>"
      );
    }

    function renderFieldValue(record, field, index) {
      var normalized = normalizeRecord(record);
      if (field.type === "media") {
        return renderMediaLinks(
          normalized[field.key],
          index,
          field.mediaKind === "video" ? ctx.previewVideoAction : ctx.previewPhotoAction,
          field.mediaKind
        );
      }
      if (field.type === "file") {
        var fileName = normalized.attachment;
        if (!fileName) return '<span class="proj-exchange-field__empty">未上传</span>';
        return (
          '<span class="project-link-action" data-action="' +
          ctx.previewFileAction +
          '" data-index="' +
          index +
          '">' +
          ctx.escapeHtml(fileName) +
          "</span>"
        );
      }
      var text = normalized[field.key];
      if (text === undefined || text === null || String(text).trim() === "") {
        return '<span class="proj-exchange-field__empty">-</span>';
      }
      return ctx.escapeHtml(String(text));
    }

    function renderCard(record, index) {
      var gridHtml = EXCHANGE_FIELDS.map(function (field) {
        return (
          '<div class="proj-exchange-field">' +
          '<span class="proj-exchange-field__label">' +
          ctx.escapeHtml(field.label) +
          "：</span>" +
          '<span class="proj-exchange-field__value">' +
          renderFieldValue(record, field, index) +
          "</span></div>"
        );
      }).join("");
      return (
        '<article class="proj-exchange-card">' +
        '<div class="proj-exchange-card__main"><div class="proj-exchange-card__grid">' +
        gridHtml +
        "</div></div>" +
        '<div class="proj-exchange-card__actions">' +
        '<span class="unit-inline-action" data-action="' +
        ctx.editAction +
        '" data-index="' +
        index +
        '">编辑</span>' +
        '<span class="unit-inline-action unit-inline-action--danger" data-action="' +
        ctx.deleteAction +
        '" data-index="' +
        index +
        '">删除</span>' +
        "</div></article>"
      );
    }

    function renderRows() {
      ensureCardStyles();
      var records = ctx.getRecords();
      var listEl = document.getElementById(ctx.listId);
      if (!listEl) return;
      if (!records.length) {
        listEl.innerHTML =
          '<div class="project-empty"><i class="fa-regular fa-folder-open text-2xl mb-1"></i>暂无数据</div>';
        return;
      }
      listEl.innerHTML =
        '<div class="proj-exchange-cards">' +
        records.map(function (record, index) {
          return renderCard(record, index);
        }).join("") +
        "</div>";
    }

    function buildFormHtml(item) {
      item = normalizeRecord(item || {});
      return (
        '<div class="space-y-4 max-w-[720px] mx-auto">' +
        '<label class="flex items-center gap-3"><span class="project-form-label project-required">项目交涉日期：</span><input id="exchange-date" type="date" class="wh-input h-8 flex-1 px-2" value="' +
        ctx.escapeHtml(item.date || "") +
        '" /></label>' +
        '<label class="flex items-center gap-3"><span class="project-form-label project-required">项目交涉单位：</span><input id="exchange-unit" class="wh-input h-8 flex-1 px-2" placeholder="请输入项目交涉单位" value="' +
        ctx.escapeHtml(item.unit || "") +
        '" /></label>' +
        '<label class="flex items-start gap-3"><span class="project-form-label">项目交涉内容：</span><textarea id="exchange-content" class="wh-input min-h-[96px] flex-1 px-2 py-2" placeholder="请输入项目交涉内容">' +
        ctx.escapeHtml(item.content || "") +
        "</textarea></label>" +
        '<label class="flex items-center gap-3"><span class="project-form-label project-required">是否履行保护区程序：</span><select id="exchange-procedure" class="wh-input h-8 flex-1 px-2"><option' +
        ((item.procedure || "") === "否" ? " selected" : "") +
        '>否</option><option' +
        ((item.procedure || "") !== "否" ? " selected" : "") +
        '>是</option></select></label>' +
        mediaUploadBlock("photo", "exchange-photo") +
        mediaUploadBlock("video", "exchange-video") +
        '<label class="flex items-start gap-3"><span class="project-form-label">交涉资料：</span><div class="flex-1">' +
        ctx.uploadField("exchange-file", item.attachment || "", "未上传文件") +
        "</div></label></div>"
      );
    }

    function mountUploaders(item) {
      ctx.clearUploaders();
      if (typeof global.WHUpload === "undefined") return;
      item = normalizeRecord(item || {});
      var photo = global.WHUpload.createPhotoUploader({
        inputId: "exchange-photo-input",
        listId: "exchange-photo-list",
        tileId: "exchange-photo-tile",
        hintId: "exchange-photo-hint"
      });
      var video = global.WHUpload.createVideoUploader({
        inputId: "exchange-video-input",
        listId: "exchange-video-list",
        tileId: "exchange-video-tile",
        hintId: "exchange-video-hint"
      });
      photo.setFromItems(item.photos);
      video.setFromItems(item.videos);
      ctx.setUploaders({ photo: photo, video: video });
    }

    function collectRecord(existing) {
      existing = normalizeRecord(existing || {});
      var uploaders = ctx.getUploaders() || {};
      var exchangeFileInput = document.getElementById("exchange-file-input");
      var pickedAttachment =
        exchangeFileInput && exchangeFileInput.files && exchangeFileInput.files[0]
          ? exchangeFileInput.files[0]
          : null;
      var hiddenUrl = document.getElementById("exchange-file-url");
      var hiddenMime = document.getElementById("exchange-file-mime");
      return {
        date: val("exchange-date"),
        unit: val("exchange-unit"),
        content: val("exchange-content"),
        procedure: val("exchange-procedure") || "是",
        photos: uploaders.photo ? uploaders.photo.serialize() : existing.photos,
        videos: uploaders.video ? uploaders.video.serialize() : existing.videos,
        attachment: pickedAttachment ? pickedAttachment.name : existing.attachment || "",
        attachmentUrl: pickedAttachment
          ? URL.createObjectURL(pickedAttachment)
          : (hiddenUrl && hiddenUrl.value) || existing.attachmentUrl || "",
        attachmentMimeType: pickedAttachment
          ? pickedAttachment.type
          : (hiddenMime && hiddenMime.value) || existing.attachmentMimeType || ""
      };
    }

    function validateRecord(record) {
      if (!record.date || !record.unit) {
        ctx.showToast("请先填写交涉日期和交涉单位");
        return false;
      }
      return true;
    }

    function buildPhotoPreviewPayload(record, mediaIndex) {
      record = normalizeRecord(record);
      var item = record.photos[mediaIndex] || {};
      var mime = inferMimeFromFileName(item.name);
      return {
        kind: "image",
        title: "图片预览",
        name: item.name || "现场照片",
        unit: record.unit,
        date: record.date,
        url: item.url || (global.ProjectPreviewMock ? global.ProjectPreviewMock.resolveMockPreviewUrl(item.name, "") : ""),
        mimeType: mime,
        tip: "交涉现场照片预览"
      };
    }

    function buildVideoPreviewPayload(record, mediaIndex) {
      record = normalizeRecord(record);
      var item = record.videos[mediaIndex] || {};
      var mime = inferMimeFromFileName(item.name);
      return {
        kind: "video",
        title: "视频预览",
        name: item.name || "现场视频",
        unit: record.unit,
        date: record.date,
        url: item.url || (global.ProjectPreviewMock ? global.ProjectPreviewMock.resolveMockPreviewUrl(item.name, "") : ""),
        mimeType: mime,
        tip: "交涉现场视频预览"
      };
    }

    function buildFilePreviewPayload(record) {
      record = normalizeRecord(record);
      var mime = record.attachmentMimeType || inferMimeFromFileName(record.attachment);
      return {
        kind: global.ProjectDocShared ? global.ProjectDocShared.inferPreviewKind(mime, record.attachment) : "file",
        title: "文件预览",
        name: record.attachment || "交涉资料",
        unit: record.unit,
        date: record.date,
        url:
          record.attachmentUrl ||
          (global.ProjectPreviewMock ? global.ProjectPreviewMock.resolveMockPreviewUrl(record.attachment, "") : ""),
        mimeType: mime,
        tip: "交涉资料预览"
      };
    }

    function inferMimeFromFileName(name) {
      if (global.ProjectDocShared && global.ProjectDocShared.inferMimeFromFileName) {
        return global.ProjectDocShared.inferMimeFromFileName(name);
      }
      return "";
    }

    function val(id) {
      var el = document.getElementById(id);
      if (!el) return "";
      return (el.value || "").trim();
    }

    return {
      normalizeRecord: normalizeRecord,
      renderRows: renderRows,
      buildFormHtml: buildFormHtml,
      mountUploaders: mountUploaders,
      collectRecord: collectRecord,
      validateRecord: validateRecord,
      buildPhotoPreviewPayload: buildPhotoPreviewPayload,
      buildVideoPreviewPayload: buildVideoPreviewPayload,
      buildFilePreviewPayload: buildFilePreviewPayload
    };
  }

  global.ProjectExchangeShared = {
    createHandlers: createHandlers
  };
})(typeof window !== "undefined" ? window : global);
