/**
 * 巡查类 CRUD 列表/详情/表单 — Web / 移动端共用工厂（对齐 in-disease-page.js）
 */
(function (global) {
  "use strict";

  var DOC_EXT = ["pdf", "doc", "docx", "xls", "xlsx", "zip", "rar"];
  var PHOTO_EXT = ["jpg", "jpeg", "png", "webp", "gif"];
  var VIDEO_EXT = ["mp4", "webm", "mov"];
  var DOC_MAX = 50 * 1024 * 1024;
  var PHOTO_MAX = 20 * 1024 * 1024;
  var VIDEO_MAX = 200 * 1024 * 1024;
  var MEDIA_MAX = 9;

  function capitalize(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
  }

  function pageGlobalName(prefix) {
    return "WHIn" + capitalize(prefix) + "Page";
  }

  function requireOpt(options, key) {
    if (options[key] === undefined || options[key] === null) {
      throw new Error("[WHPatrolCrudPage] missing required option: " + key);
    }
    return options[key];
  }

  function bootPatrolCrudPage(options) {
    options = options || {};

    var prefix = requireOpt(options, "prefix");
    var isMobile = !!options.mobile;
    var rows = requireOpt(options, "rows");
    var nextIdRef =
      typeof options.nextId === "object" && options.nextId !== null && "value" in options.nextId
        ? options.nextId
        : { value: Number(options.nextId) || 1 };
    var searchPage = requireOpt(options, "searchPage");
    var listPage = requireOpt(options, "listPage");
    var emptyIcon = options.emptyIcon || "fa-solid fa-inbox";
    var emptyText = options.emptyText || "暂无数据";
    var newLogAction = requireOpt(options, "newLogAction");
    var confirmMessages = options.confirmMessages || {};
    var uploadKinds = options.uploadKinds || ["photo", "video"];
    var dateField = options.dateField || "date";

    var readFiltersFromForm = requireOpt(options, "readFiltersFromForm");
    var rowMatchesFilters = requireOpt(options, "rowMatchesFilters");
    var stats = requireOpt(options, "stats");
    var statusBadge = requireOpt(options, "statusBadge");
    var cardTitle = requireOpt(options, "cardTitle");
    var cardMeta = requireOpt(options, "cardMeta");
    var buildDetailHtml = requireOpt(options, "buildDetailHtml");
    var readForm = requireOpt(options, "readForm");
    var loadForm = requireOpt(options, "loadForm");
    var resetForm = requireOpt(options, "resetForm");
    var validateForm = requireOpt(options, "validateForm");
    var buildRowFromForm = requireOpt(options, "buildRowFromForm");
    var mediaProjectName = requireOpt(options, "mediaProjectName");
    var renderTableRow = options.renderTableRow || null;
    var onConfirm = options.onConfirm || null;
    var initFilters = options.initFilters || null;
    var formTitleFn = options.formTitle || null;
    var detailTitleFn = options.detailTitle || null;
    var saveToast = options.saveToast || "记录已保存";
    var cardClass = options.cardClass || "mp-project-card";
    var viewChangeEvent = options.viewChangeEvent || "wh-" + prefix + "-view-change";

    var filteredRows = null;
    var lastRenderedList = [];
    var editingIndex = null;
    var pendingConfirm = null;
    var uploadStores = { photo: [], video: [], doc: [] };

    var listView = document.getElementById(prefix + "-list-view");
    var detailView = document.getElementById(prefix + "-detail-view");
    var formView = document.getElementById(prefix + "-form-view");
    var mobileList = document.getElementById(prefix + "-mobile-list");
    var tableBody = document.getElementById(prefix + "-table-body");
    var detailBody = document.getElementById(prefix + "-detail-body");
    var detailWebMask = document.getElementById(prefix + "-detail-mask");
    var detailWebBody =
      document.getElementById(prefix + "-detail-web-body") || document.getElementById(prefix + "-detail-body");
    var recordMask = document.getElementById(prefix + "-record-mask");
    var recordBody = document.getElementById(prefix + "-record-body");
    var confirmMask = document.getElementById(prefix + "-confirm-mask");
    var confirmTitle = document.getElementById(prefix + "-confirm-title");
    var confirmMsg = document.getElementById(prefix + "-confirm-msg");
    var toastEl = document.getElementById(prefix + "-toast");

    function $(id) {
      return document.getElementById(id);
    }

    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function showToast(msg) {
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.classList.add("show");
      clearTimeout(showToast._t);
      showToast._t = setTimeout(function () {
        toastEl.classList.remove("show");
      }, 1800);
    }

    function fieldVal(id) {
      var el = $(id);
      return el ? String(el.value || "").trim() : "";
    }

    function getListSource() {
      return filteredRows !== null ? filteredRows : rows;
    }

    function findRowIndex(row) {
      if (!row) return -1;
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].id === row.id) return i;
      }
      return -1;
    }

    function parseDateTime(value) {
      var normalized = String(value || "")
        .trim()
        .replace(" ", "T");
      var time = Date.parse(normalized);
      return Number.isNaN(time) ? null : time;
    }

    function setStatText(id, val) {
      var el = $(id);
      if (el) el.textContent = String(val);
    }

    function updateDashboardStats(list) {
      var data = list || getListSource();
      var s = stats(rows);
      setStatText("stat-total", s.total);
      setStatText("stat-month", s.month);
      setStatText("stat-pending", s.pending);
      setStatText("stat-completed", s.completed);
      setStatText("table-total", data.length);
    }

    function rowMatchesSearch(row, query) {
      var q = (query || "").trim();
      if (!q) return true;
      return String(row.id).indexOf(q) >= 0;
    }

    function matchDateRange(row, f) {
      if (!dateField || (!f.dateStart && !f.dateEnd)) return true;
      var rowTime = parseDateTime(row[dateField]);
      if (rowTime === null) return true;
      var start = f.dateStart ? parseDateTime(f.dateStart) : null;
      var end = f.dateEnd ? parseDateTime(f.dateEnd) : null;
      if (start !== null && rowTime < start) return false;
      if (end !== null && rowTime > end) return false;
      return true;
    }

    function filtersActive(f, q) {
      if (q) return true;
      var key;
      for (key in f) {
        if (Object.prototype.hasOwnProperty.call(f, key) && f[key]) return true;
      }
      return false;
    }

    function syncSearchClear() {
      var input = $(prefix + "-search-trigger");
      var clearBtn = $(prefix + "-search-clear");
      if (!input || !clearBtn) return;
      clearBtn.hidden = !(input.value || "").trim();
    }

    function clearSearch() {
      var searchInput = $(prefix + "-search-trigger");
      if (searchInput) searchInput.value = "";
      applyFilter(undefined, true);
    }

    function refreshFilterPickers() {
      if (global.WHProjectMobile && global.WHProjectMobile.enhanceSelectFields) {
        var sheet = $(prefix + "-filter-sheet");
        if (sheet) global.WHProjectMobile.enhanceSelectFields(sheet);
      }
    }

    function refreshFormPickers() {
      if (global.WHProjectMobile && global.WHProjectMobile.enhanceSelectFields) {
        if (formView) global.WHProjectMobile.enhanceSelectFields(formView);
      }
    }

    function applyFilter(qOverride, silent) {
      var searchInput = $(prefix + "-search-trigger");
      var q =
        typeof qOverride === "string"
          ? qOverride
          : searchInput && searchInput.value
            ? searchInput.value.trim()
            : "";
      if (searchInput && typeof qOverride === "string") searchInput.value = qOverride;
      var f = readFiltersFromForm();
      var hasFilter = filtersActive(f, q);
      filteredRows = hasFilter
        ? rows.filter(function (row) {
            if (q && !rowMatchesSearch(row, q)) return false;
            if (!rowMatchesFilters(row, f)) return false;
            if (!matchDateRange(row, f)) return false;
            return true;
          })
        : null;
      renderList();
      syncSearchClear();
      if (!silent) showToast("已按当前条件筛选");
    }

    function resetFilters() {
      var sheet = $(prefix + "-filter-sheet");
      if (sheet) {
        sheet.querySelectorAll("select, input, textarea").forEach(function (el) {
          if (el.tagName === "SELECT") el.selectedIndex = 0;
          else el.value = "";
        });
      }
      if (sheet && global.WHProjectMobile && global.WHProjectMobile.syncPickersFromForm) {
        global.WHProjectMobile.syncPickersFromForm(sheet);
      }
      applyFilter(undefined, true);
      showToast("筛选条件已重置");
    }

    function mediaCell(kind, row, previewCount, directPreview) {
      if (!global.WHPatrolMediaGallery) return '<span class="mp-disease-media-empty">—</span>';
      return global.WHPatrolMediaGallery.renderCell({
        kind: kind,
        projectName: mediaProjectName(row),
        rowKey: row.id,
        previewCount: previewCount || 2,
        directPreview: !!directPreview,
      });
    }

    var helpers = {
      esc: esc,
      mediaCell: mediaCell,
      fieldVal: fieldVal,
      $: $,
    };

    function formHelpers() {
      return {
        genId: genId,
        clearUploads: clearUploads,
        fieldVal: fieldVal,
        $: $,
        refreshFormPickers: refreshFormPickers,
        showToast: showToast,
      };
    }

    function renderMobileCard(row, index) {
      var badge = statusBadge(row);
      var metaHtml = (cardMeta(row) || [])
        .map(function (item) {
          var clsParts = [];
          if (item.fullWidth) clsParts.push("mp-project-card__meta-full");
          if (item.nowrap) clsParts.push("mp-project-card__meta-nowrap");
          var cls = clsParts.length ? " " + clsParts.join(" ") : "";
          return (
            "<div" +
            (cls ? ' class="' + cls.trim() + '"' : "") +
            "><dt>" +
            esc(item.label) +
            "</dt><dd>" +
            esc(item.value) +
            "</dd></div>"
          );
        })
        .join("");

      return (
        '<article class="' +
        cardClass +
        " mp-" +
        prefix +
        '-card" data-row-index="' +
        index +
        '">' +
        '<div class="mp-project-card__head"><span class="mp-project-card__id">' +
        esc(row.id) +
        "</span>" +
        '<span class="' +
        esc(badge.className || "mp-disease-progress") +
        '">' +
        esc(badge.text) +
        "</span></div>" +
        '<h3 class="mp-project-card__title">' +
        esc(cardTitle(row)) +
        "</h3>" +
        '<dl class="mp-project-card__meta mp-' +
        prefix +
        '-card__meta">' +
        metaHtml +
        "</dl>" +
        '<div class="mp-project-card__actions mp-' +
        prefix +
        '-card__actions">' +
        '<button type="button" class="mp-project-action" data-action="' +
        prefix +
        '-detail" data-index="' +
        index +
        '"><i class="fa-regular fa-eye"></i>详情</button>' +
        '<button type="button" class="mp-project-action" data-action="edit-' +
        prefix +
        '" data-index="' +
        index +
        '"><i class="fa-regular fa-pen-to-square"></i>编辑</button>' +
        '<button type="button" class="mp-project-action" data-action="confirm-' +
        prefix +
        '" data-index="' +
        index +
        '"><i class="fa-regular fa-circle-check"></i>工班确认</button>' +
        '<button type="button" class="mp-project-action" data-action="reject-' +
        prefix +
        '" data-index="' +
        index +
        '"><i class="fa-regular fa-circle-xmark"></i>拒绝</button>' +
        '<button type="button" class="mp-project-action" data-action="view-' +
        prefix +
        '-records" data-index="' +
        index +
        '"><i class="fa-regular fa-clock"></i>操作记录</button>' +
        "</div></article>"
      );
    }

    function renderMobileList(list) {
      if (!mobileList) return;
      lastRenderedList = list.slice();
      if (!list.length) {
        mobileList.innerHTML =
          '<div class="mp-project-empty"><i class="' +
          esc(emptyIcon) +
          '"></i><p>' +
          esc(emptyText) +
          "</p></div>";
        updateDashboardStats(list);
        return;
      }
      mobileList.innerHTML = list.map(renderMobileCard).join("");
      updateDashboardStats(list);
    }

    function renderTable(list) {
      if (!tableBody || !renderTableRow) return;
      lastRenderedList = list.slice();
      tableBody.innerHTML = list
        .map(function (row, index) {
          return renderTableRow(row, index, helpers);
        })
        .join("");
      updateDashboardStats(list);
      if (global.WHPatrolMediaGallery) global.WHPatrolMediaGallery.bind(tableBody);
    }

    function renderList() {
      var list = getListSource();
      if (isMobile) renderMobileList(list);
      else renderTable(list);
    }

    function resolveDetailTitle(row) {
      if (detailTitleFn) return detailTitleFn(row);
      return row.id + " · 详情";
    }

    function resolveFormTitle(mode) {
      if (formTitleFn) return formTitleFn(mode);
      var titleEl = $(prefix + "-form-title");
      if (titleEl && titleEl.textContent) return titleEl.textContent;
      return mode === "edit" ? "编辑" : "新建";
    }

    function openDetail(index) {
      var row = lastRenderedList[index];
      if (!row) return;
      var titleEl = $("detail-" + prefix + "-title");
      var titleText = resolveDetailTitle(row);
      if (titleEl) titleEl.textContent = titleText;
      var html = buildDetailHtml(row, helpers);
      if (isMobile) {
        if (listView) listView.classList.add("hidden");
        if (detailView) detailView.classList.remove("hidden");
        if (detailBody) {
          detailBody.innerHTML = html;
          if (global.WHPatrolMediaGallery) global.WHPatrolMediaGallery.bind(detailBody);
        }
      } else if (detailWebMask && detailWebBody) {
        var webTitle = detailWebMask.querySelector("[id$='-detail-title']");
        if (webTitle) webTitle.textContent = titleText;
        detailWebBody.innerHTML = html;
        detailWebMask.classList.add("show");
        detailWebMask.setAttribute("aria-hidden", "false");
        if (global.WHPatrolMediaGallery) global.WHPatrolMediaGallery.bind(detailWebBody);
      }
      global.dispatchEvent(new Event(viewChangeEvent));
    }

    function closeWebDetail() {
      if (detailWebMask) {
        detailWebMask.classList.remove("show");
        detailWebMask.setAttribute("aria-hidden", "true");
      }
    }

    function genId() {
      return String(nextIdRef.value++);
    }

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

    function uploadListId(kind) {
      if (kind === "doc") return "f-doc-list";
      if (kind === "photo") return "f-photo-list";
      return "f-video-list";
    }

    function uploadTileId(kind) {
      if (kind === "doc") return "f-doc-tile";
      if (kind === "photo") return "f-photo-tile";
      return "f-video-tile";
    }

    function uploadHintId(kind) {
      if (kind === "photo") return "f-photo-hint";
      if (kind === "video") return "f-video-hint";
      return null;
    }

    function uploadInputId(kind) {
      if (kind === "doc") return "f-doc-input";
      if (kind === "photo") return "f-photo-input";
      return "f-video-input";
    }

    function renderUploadList(kind) {
      if (uploadKinds.indexOf(kind) < 0) return;
      var list = uploadStores[kind];
      var listEl = $(uploadListId(kind));
      var tile = $(uploadTileId(kind));
      var hint = uploadHintId(kind) ? $(uploadHintId(kind)) : null;
      if (!listEl) return;
      listEl.innerHTML = list
        .map(function (file, idx) {
          if (kind === "photo" && file._url) {
            return (
              '<div class="mp-disease-upload-preview">' +
              '<img src="' +
              esc(file._url) +
              '" alt="" />' +
              '<button type="button" class="mp-disease-upload-remove" data-action="remove-upload" data-kind="' +
              kind +
              '" data-idx="' +
              idx +
              '"><i class="fa-solid fa-xmark"></i></button></div>'
            );
          }
          return (
            '<span class="mp-disease-upload-chip"><span title="' +
            esc(file.name) +
            '">' +
            esc(file.name) +
            " (" +
            formatSize(file.size) +
            ')</span><button type="button" data-action="remove-upload" data-kind="' +
            kind +
            '" data-idx="' +
            idx +
            '"><i class="fa-solid fa-xmark"></i></button></span>'
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

    function bindUploader(kind) {
      if (uploadKinds.indexOf(kind) < 0) return;
      var input = $(uploadInputId(kind));
      if (!input) return;
      input.addEventListener("change", function () {
        var files = Array.from(input.files || []);
        input.value = "";
        var max = kind === "doc" ? Infinity : MEDIA_MAX;
        files.forEach(function (file) {
          if (uploadStores[kind].length >= max) {
            showToast(kind === "photo" ? "照片最多上传 9 张" : kind === "video" ? "视频最多上传 9 个" : "资料数量已达上限");
            return;
          }
          var err = validateFile(file, kind);
          if (err) {
            showToast(err);
            return;
          }
          if (kind === "photo") file._url = URL.createObjectURL(file);
          uploadStores[kind].push(file);
        });
        renderUploadList(kind);
      });
    }

    function clearUploads() {
      uploadStores.photo.forEach(function (f) {
        if (f._url) URL.revokeObjectURL(f._url);
      });
      uploadKinds.forEach(function (kind) {
        uploadStores[kind] = [];
        renderUploadList(kind);
      });
    }

    function showForm(mode, index) {
      editingIndex = mode === "edit" ? findRowIndex(lastRenderedList[index]) : null;
      var titleEl = $(prefix + "-form-title");
      if (titleEl) titleEl.textContent = resolveFormTitle(mode);
      if (mode === "edit" && editingIndex != null && rows[editingIndex]) {
        loadForm(rows[editingIndex], formHelpers());
      } else {
        resetForm(formHelpers());
      }
      refreshFormPickers();
      if (listView) listView.classList.add("hidden");
      if (detailView) detailView.classList.add("hidden");
      if (formView) formView.classList.remove("hidden");
      global.dispatchEvent(new Event(viewChangeEvent));
    }

    function showList() {
      if (formView) formView.classList.add("hidden");
      if (detailView) detailView.classList.add("hidden");
      if (listView) listView.classList.remove("hidden");
      closeWebDetail();
      global.dispatchEvent(new Event(viewChangeEvent));
    }

    function saveItem() {
      if (!validateForm(formHelpers())) return;
      var data = readForm(formHelpers());
      var editingRow = editingIndex != null ? rows[editingIndex] : null;
      var row = buildRowFromForm(data, editingRow, formHelpers());
      if (!row.logs) row.logs = [];
      if (!editingRow && !row.logs.length) {
        row.logs.push({
          action: newLogAction,
          user: "当前用户",
          time: row.date || row.updatedAt || row.time || "2026-05-12 18:30",
        });
      }
      if (editingIndex != null) rows[editingIndex] = row;
      else rows.unshift(row);
      filteredRows = null;
      renderList();
      showList();
      showToast(saveToast);
    }

    function openConfirm(kind, index) {
      pendingConfirm = { kind: kind, index: index };
      if (confirmTitle) {
        confirmTitle.textContent =
          kind === "confirm"
            ? confirmMessages.confirmTitle || "工班确认"
            : confirmMessages.rejectTitle || "拒绝受理";
      }
      if (confirmMsg) {
        confirmMsg.textContent =
          kind === "confirm"
            ? confirmMessages.confirmMsg || "确定通过该记录？"
            : confirmMessages.rejectMsg || "确定拒绝该记录？";
      }
      if (confirmMask) {
        confirmMask.classList.add("is-open");
        confirmMask.setAttribute("aria-hidden", "false");
      }
    }

    function closeConfirm() {
      pendingConfirm = null;
      if (confirmMask) {
        confirmMask.classList.remove("is-open");
        confirmMask.setAttribute("aria-hidden", "true");
      }
    }

    function submitConfirm() {
      if (!pendingConfirm) return;
      var kind = pendingConfirm.kind;
      var row = lastRenderedList[pendingConfirm.index];
      var realIdx = findRowIndex(row);
      if (realIdx < 0) {
        closeConfirm();
        return;
      }
      if (!rows[realIdx].logs) rows[realIdx].logs = [];
      rows[realIdx].logs.push({
        action: kind === "confirm" ? "工班确认" : "拒绝",
        user: "鲍雄澎",
        time: "2026-05-12 14:40:31",
      });
      if (onConfirm) onConfirm(rows[realIdx], kind);
      closeConfirm();
      renderList();
      showToast(kind === "confirm" ? "已工班确认" : "已拒绝");
    }

    function syncRecordScrollLock() {
      var locked = recordMask && recordMask.classList.contains("show");
      document.body.classList.toggle("mp-scroll-locked", !!locked);
    }

    function openRecords(index) {
      var row = lastRenderedList[index];
      if (!row || !recordBody) return;
      recordBody.innerHTML = global.ProjectOperationLog
        ? global.ProjectOperationLog.renderTimelineHtml(row.logs)
        : "";
      if (recordMask) {
        recordMask.classList.add("show");
        recordMask.setAttribute("aria-hidden", "false");
      }
      syncRecordScrollLock();
    }

    function closeRecords() {
      if (recordMask) {
        recordMask.classList.remove("show");
        recordMask.setAttribute("aria-hidden", "true");
      }
      syncRecordScrollLock();
    }

    function bindEvents() {
      document.addEventListener("click", function (event) {
        var trigger = event.target.closest("[data-action]");
        if (!trigger) return;
        var action = trigger.getAttribute("data-action");
        var index = trigger.hasAttribute("data-index") ? Number(trigger.getAttribute("data-index")) : null;

        if (action === "open-" + prefix + "-search") {
          event.preventDefault();
          global.location.href = searchPage;
          return;
        }
        if (action === "new-" + prefix) {
          showForm("new");
          return;
        }
        if (action === prefix + "-detail") {
          openDetail(index);
          return;
        }
        if (action === "edit-" + prefix) {
          showForm("edit", index);
          return;
        }
        if (action === "back-" + prefix + "-list" || action === "cancel-" + prefix) {
          showList();
          return;
        }
        if (action === "save-" + prefix) {
          saveItem();
          return;
        }
        if (action === "confirm-" + prefix) {
          openConfirm("confirm", index);
          return;
        }
        if (action === "reject-" + prefix) {
          openConfirm("reject", index);
          return;
        }
        if (action === prefix + "-confirm-cancel" || action === prefix + "-confirm-mask-close") {
          closeConfirm();
          return;
        }
        if (action === prefix + "-confirm-ok") {
          submitConfirm();
          return;
        }
        if (action === "view-" + prefix + "-records") {
          openRecords(index);
          return;
        }
        if (action === "close-" + prefix + "-record" || action === "close-" + prefix + "-record-mask") {
          closeRecords();
          return;
        }
        if (action === "close-" + prefix + "-detail") {
          if (isMobile) showList();
          else closeWebDetail();
          return;
        }
        if (action === "open-" + prefix + "-filter") {
          var sheet = $(prefix + "-filter-sheet");
          if (sheet) {
            sheet.classList.add("is-open");
            refreshFilterPickers();
          }
          return;
        }
        if (action === "close-" + prefix + "-filter") {
          var closeSheet = $(prefix + "-filter-sheet");
          if (closeSheet) closeSheet.classList.remove("is-open");
          return;
        }
        if (action === "search-" + prefix) {
          var searchSheet = $(prefix + "-filter-sheet");
          if (searchSheet) searchSheet.classList.remove("is-open");
          applyFilter();
          return;
        }
        if (action === "reset-" + prefix + "-filter") {
          var resetSheet = $(prefix + "-filter-sheet");
          if (resetSheet) resetSheet.classList.remove("is-open");
          resetFilters();
          return;
        }
        if (action === "remove-upload") {
          var kind = trigger.getAttribute("data-kind");
          var idx = Number(trigger.getAttribute("data-idx"));
          if (uploadStores[kind]) {
            var removed = uploadStores[kind].splice(idx, 1)[0];
            if (removed && removed._url) URL.revokeObjectURL(removed._url);
            renderUploadList(kind);
          }
        }
      });

      if (mobileList) {
        mobileList.addEventListener("click", function (event) {
          if (event.target.closest("[data-action]")) return;
          var card = event.target.closest(".mp-" + prefix + "-card[data-row-index]");
          if (!card) return;
          openDetail(Number(card.getAttribute("data-row-index")));
        });
      }

      var searchClear = $(prefix + "-search-clear");
      if (searchClear) {
        searchClear.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          clearSearch();
        });
      }

      if (detailWebMask) {
        detailWebMask.addEventListener("click", function (event) {
          if (event.target === detailWebMask) closeWebDetail();
        });
      }
    }

    if (isMobile && global.WHProjectMobile && global.WHProjectMobile.init) {
      try {
        global.WHProjectMobile.init({
          clearListSearch: clearSearch,
          showToast: showToast,
        });
      } catch (initErr) {
        console.warn("[WHPatrolCrudPage:" + prefix + "] mobile init", initErr);
      }
      syncSearchClear();
    }

    if (global.ProjectOperationLog) {
      global.ProjectOperationLog.bindClose(prefix + "-record-mask", "close-" + prefix + "-record");
    }

    uploadKinds.forEach(bindUploader);
    if (initFilters) initFilters(helpers);
    refreshFilterPickers();
    renderList();
    bindEvents();

    (function handleQueryOpen() {
      try {
        var params = new URLSearchParams(global.location.search);
        var detailId = params.get("detail") || params.get("id");
        if (detailId && isMobile) {
          var renderedIdx = lastRenderedList.findIndex(function (row) {
            return String(row.id || row.code || "") === String(detailId);
          });
          if (renderedIdx >= 0) {
            setTimeout(function () {
              openDetail(renderedIdx);
            }, 120);
            return;
          }
        }
        var q = params.get("q");
        if (q) {
          applyFilter(q, true);
          try {
            global.history.replaceState({ fromPatrolSearch: true, prefix: prefix }, "", listPage);
          } catch (e) {
            /* ignore */
          }
        }
      } catch (e) {
        /* ignore */
      }
    })();

    if (!isMobile && global.WHTableRowClick && tableBody) {
      global.WHTableRowClick.bindById(prefix + "-table-body", {
        getRows: function () {
          return lastRenderedList;
        },
        onOpen: function (row, index) {
          openDetail(index);
        },
      });
    }

    var pageGlobal = global[pageGlobalName(prefix)] || {};
    pageGlobal.showList = showList;
    pageGlobal.showForm = showForm;
    pageGlobal.openDetail = openDetail;
    global[pageGlobalName(prefix)] = pageGlobal;

    return {
      showList: showList,
      showForm: showForm,
      openDetail: openDetail,
      renderList: renderList,
      applyFilter: applyFilter,
      clearSearch: clearSearch,
      showToast: showToast,
      getRows: function () {
        return rows;
      },
      getUploadStores: function () {
        return uploadStores;
      },
      helpers: helpers,
    };
  }

  global.WHPatrolCrudPage = {
    boot: bootPatrolCrudPage,
    pageGlobalName: pageGlobalName,
  };
})(typeof window !== "undefined" ? window : global);
