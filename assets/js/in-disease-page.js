/**
 * 病害巡查 — Web / 移动端共用逻辑（对齐 patrol/in-disease.html）
 */
(function (global) {
  "use strict";

  function bootInDiseasePage(options) {
    options = options || {};
    var isMobile = !!options.mobile;
    var rows = (global.WH_DISEASE_ROWS || []).map(function (row) {
      return Object.assign({}, row, { logs: (row.logs || []).slice() });
    });
    var nextId = global.WH_DISEASE_NEXT_ID || 15070;
    var filteredRows = null;
    var lastRenderedList = [];
    var editingIndex = null;
    var pendingConfirm = null;
    var uploadStores = { photo: [], video: [] };
    var PHOTO_EXT = ["jpg", "jpeg", "png", "webp", "gif"];
    var VIDEO_EXT = ["mp4", "webm", "mov"];
    var PHOTO_MAX = 20 * 1024 * 1024;
    var VIDEO_MAX = 200 * 1024 * 1024;
    var MEDIA_MAX = 9;

    var listView = document.getElementById("disease-list-view");
    var detailView = document.getElementById("disease-detail-view");
    var formView = document.getElementById("disease-form-view");
    var mobileList = document.getElementById("disease-mobile-list");
    var tableBody = document.getElementById("disease-table-body");
    var detailBody = document.getElementById("disease-detail-body");
    var detailWebMask = document.getElementById("disease-detail-mask");
    var detailWebBody = document.getElementById("disease-detail-web-body");
    var recordMask = document.getElementById("disease-record-mask");
    var recordBody = document.getElementById("disease-record-body");
    var confirmMask = document.getElementById("disease-confirm-mask");
    var confirmTitle = document.getElementById("disease-confirm-title");
    var confirmMsg = document.getElementById("disease-confirm-msg");
    var toastEl = document.getElementById("disease-toast");

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

    function dictLabel(type, val) {
      return global.DiseaseDict ? global.DiseaseDict.labelByValue(type, val) : val || "—";
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
      var normalized = String(value || "").trim().replace(" ", "T");
      var time = Date.parse(normalized);
      return Number.isNaN(time) ? null : time;
    }

    function setStatText(id, val) {
      var el = $(id);
      if (el) el.textContent = String(val);
    }

    function updateDashboardStats(list) {
      var data = list || getListSource();
      setStatText("stat-total", rows.length);
      setStatText(
        "stat-month",
        rows.filter(function (r) {
          return r.date && String(r.date).indexOf("2026-03") === 0;
        }).length
      );
      setStatText(
        "stat-pending",
        rows.filter(function (r) {
          return (r.progress && r.progress.indexOf("未处理") >= 0) || r.development === "untreated";
        }).length
      );
      setStatText(
        "stat-completed",
        rows.filter(function (r) {
          return (
            r.progress &&
            (r.progress.indexOf("已完成") >= 0 ||
              r.progress.indexOf("已处理") >= 0 ||
              r.progress.indexOf("处理完成") >= 0)
          );
        }).length
      );
      setStatText("table-total", data.length);
    }

    function readFiltersFromForm() {
      return {
        line: fieldVal("filter-line"),
        direction: fieldVal("filter-direction"),
        section: fieldVal("filter-section"),
        station: fieldVal("filter-station"),
        diseaseType: fieldVal("filter-type"),
        level: fieldVal("filter-level"),
        development: fieldVal("filter-development"),
        dateStart: fieldVal("filter-date-start"),
        dateEnd: fieldVal("filter-date-end"),
      };
    }

    function rowMatchesSearch(row, query) {
      var q = (query || "").trim();
      if (!q) return true;
      return String(row.desc || "").indexOf(q) >= 0;
    }

    function rowMatchesFilters(row, f) {
      if (f.line && row.line !== f.line) return false;
      if (f.direction && row.direction !== f.direction) return false;
      if (f.section && row.section !== f.section) return false;
      if (f.station && row.station !== f.station) return false;
      if (f.diseaseType && row.diseaseType !== f.diseaseType) return false;
      if (f.level && row.level !== f.level) return false;
      if (f.development && row.development !== f.development) return false;
      var rowTime = parseDateTime(row.date);
      if (rowTime !== null) {
        var start = f.dateStart ? parseDateTime(f.dateStart) : null;
        var end = f.dateEnd ? parseDateTime(f.dateEnd) : null;
        if (start !== null && rowTime < start) return false;
        if (end !== null && rowTime > end) return false;
      }
      return true;
    }

    function syncDiseaseSearchClear() {
      var input = $("disease-search-trigger");
      var clearBtn = $("disease-search-clear");
      if (!input || !clearBtn) return;
      clearBtn.hidden = !(input.value || "").trim();
    }

    function clearDiseaseSearch() {
      var searchInput = $("disease-search-trigger");
      if (searchInput) searchInput.value = "";
      applyFilter(undefined, true);
    }

    function refreshFilterPickers() {
      if (global.WHProjectMobile && global.WHProjectMobile.enhanceSelectFields) {
        var sheet = $("disease-filter-sheet");
        if (sheet) global.WHProjectMobile.enhanceSelectFields(sheet);
      }
    }

    function refreshFormPickers() {
      if (global.WHProjectMobile && global.WHProjectMobile.enhanceSelectFields) {
        if (formView) global.WHProjectMobile.enhanceSelectFields(formView);
      }
    }

    function applyFilter(qOverride, silent) {
      var searchInput = $("disease-search-trigger");
      var q =
        typeof qOverride === "string"
          ? qOverride
          : searchInput && searchInput.value
            ? searchInput.value.trim()
            : "";
      if (searchInput && typeof qOverride === "string") searchInput.value = qOverride;
      var f = readFiltersFromForm();
      var hasFilter = !!(
        q ||
        f.line ||
        f.direction ||
        f.section ||
        f.station ||
        f.diseaseType ||
        f.level ||
        f.development ||
        f.dateStart ||
        f.dateEnd
      );
      filteredRows = hasFilter
        ? rows.filter(function (row) {
            if (q && !rowMatchesSearch(row, q)) return false;
            if (!rowMatchesFilters(row, f)) return false;
            return true;
          })
        : null;
      renderList();
      syncDiseaseSearchClear();
      if (!silent) showToast("已按当前条件筛选");
    }

    function resetFilters() {
      [
        "filter-line",
        "filter-direction",
        "filter-section",
        "filter-station",
        "filter-type",
        "filter-level",
        "filter-development",
        "filter-date-start",
        "filter-date-end",
      ].forEach(function (id) {
        var el = $(id);
        if (!el) return;
        if (el.tagName === "SELECT") el.selectedIndex = 0;
        else el.value = "";
      });
      var sheet = $("disease-filter-sheet");
      if (sheet && global.WHProjectMobile && global.WHProjectMobile.syncPickersFromForm) {
        global.WHProjectMobile.syncPickersFromForm(sheet);
      }
      applyFilter(undefined, true);
      showToast("筛选条件已重置");
    }

    function initFilterSelects() {
      if (!global.DiseaseDict) return;
      global.DiseaseDict.fillSelect($("filter-type"), "disease_type", "全部", "");
      global.DiseaseDict.fillSelect($("filter-level"), "disease_level", "全部", "");
      global.DiseaseDict.fillSelect($("filter-development"), "disease_development", "全部", "");
    }

    function fillDictSelects(data) {
      if (!global.DiseaseDict) return;
      global.DiseaseDict.fillSelect($("f-inspect-item"), "disease_inspect_item", "请选择巡查项", data && data.inspectItem);
      global.DiseaseDict.fillSelect(
        $("f-structure-type"),
        "disease_structure_type",
        "请选择结构类型",
        data && data.structureType
      );
      global.DiseaseDict.fillSelect($("f-disease-type"), "disease_type", "请选择病害类型", data && data.diseaseType);
      global.DiseaseDict.fillSelect($("f-disease-level"), "disease_level", "请选择病害程度", data && data.level);
      global.DiseaseDict.fillSelect(
        $("f-disease-development"),
        "disease_development",
        "请选择病害发展",
        data && data.development
      );
    }

    function fillHistoryOptions(excludeId, selected) {
      var sel = $("f-history");
      if (!sel) return;
      var html = '<option value="">请选择关联历史病害</option>';
      rows.forEach(function (r) {
        if (r.id === excludeId) return;
        html += '<option value="' + esc(r.id) + '">' + esc(r.id + " · " + r.desc) + "</option>";
      });
      sel.innerHTML = html;
      if (selected) sel.value = selected;
    }

    function mediaCell(kind, row, previewCount, directPreview) {
      if (!global.WHPatrolMediaGallery) return '<span class="mp-disease-media-empty">—</span>';
      return global.WHPatrolMediaGallery.renderCell({
        kind: kind,
        projectName: row.place,
        rowKey: row.id,
        previewCount: previewCount || 2,
        directPreview: !!directPreview,
      });
    }

    function progressClass(progress) {
      if (!progress) return "mp-disease-progress";
      if (progress.indexOf("未处理") >= 0) return "mp-disease-progress mp-disease-progress--pending";
      if (progress.indexOf("不受理") >= 0) return "mp-disease-progress mp-disease-progress--reject";
      if (progress.indexOf("复查") >= 0) return "mp-disease-progress mp-disease-progress--review";
      return "mp-disease-progress mp-disease-progress--done";
    }

    function renderMobileCard(row, index) {
      return (
        '<article class="mp-project-card mp-disease-card" data-row-index="' +
        index +
        '">' +
        '<div class="mp-project-card__head"><span class="mp-project-card__id">' +
        esc(row.id) +
        "</span>" +
        '<span class="' +
        progressClass(row.progress) +
        '">' +
        esc(row.progress) +
        "</span></div>" +
        '<h3 class="mp-project-card__title">' +
        esc(row.desc) +
        "</h3>" +
        '<dl class="mp-project-card__meta mp-disease-card__meta">' +
        "<div><dt>所属线路</dt><dd>" +
        esc(row.line) +
        "</dd></div>" +
        "<div><dt>上下行</dt><dd>" +
        esc(row.direction) +
        "</dd></div>" +
        "<div><dt>病害里程</dt><dd>" +
        esc(row.mileage) +
        "</dd></div>" +
        "<div><dt>病害类型</dt><dd>" +
        esc(dictLabel("disease_type", row.diseaseType)) +
        "</dd></div>" +
        "<div><dt>病害程度</dt><dd>" +
        esc(dictLabel("disease_level", row.level)) +
        "</dd></div>" +
        "<div><dt>巡查人</dt><dd>" +
        esc(row.inspector || "汪兵") +
        "</dd></div>" +
        '<div class="mp-disease-card__date"><dt>巡查日期</dt><dd>' +
        esc(row.date) +
        "</dd></div>" +
        "</dl>" +
        '<div class="mp-project-card__actions mp-disease-card__actions">' +
        '<button type="button" class="mp-project-action" data-action="disease-detail" data-index="' +
        index +
        '"><i class="fa-regular fa-eye"></i>详情</button>' +
        '<button type="button" class="mp-project-action" data-action="edit-disease" data-index="' +
        index +
        '"><i class="fa-regular fa-pen-to-square"></i>编辑</button>' +
        '<button type="button" class="mp-project-action" data-action="confirm-disease" data-index="' +
        index +
        '"><i class="fa-regular fa-circle-check"></i>工班确认</button>' +
        '<button type="button" class="mp-project-action" data-action="reject-disease" data-index="' +
        index +
        '"><i class="fa-regular fa-circle-xmark"></i>拒绝</button>' +
        '<button type="button" class="mp-project-action" data-action="view-disease-records" data-index="' +
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
          '<div class="mp-project-empty"><i class="fa-solid fa-stethoscope"></i><p>暂无病害巡查数据</p></div>';
        updateDashboardStats(list);
        return;
      }
      mobileList.innerHTML = list.map(renderMobileCard).join("");
      updateDashboardStats(list);
    }

    function renderTable(list) {
      if (!tableBody) return;
      lastRenderedList = list.slice();
      tableBody.innerHTML = list
        .map(function (row, index) {
          return (
            '<tr class="wh-row-open" data-row-index="' +
            index +
            '">' +
            "<td>" +
            esc(row.id) +
            "</td><td>" +
            esc(row.line) +
            "</td><td>" +
            esc(row.place) +
            "</td><td>" +
            esc(row.direction) +
            "</td><td>" +
            esc(row.mileage) +
            "</td><td>" +
            esc(dictLabel("disease_type", row.diseaseType)) +
            "</td><td>" +
            esc(dictLabel("disease_level", row.level)) +
            "</td><td>" +
            esc(row.desc) +
            "</td><td>" +
            mediaCell("photo", row, 2) +
            "</td><td>" +
            mediaCell("video", row, 2) +
            "</td><td>" +
            esc(row.inspector || "汪兵") +
            "</td><td>" +
            esc(row.date) +
            "</td><td>" +
            esc(row.progress) +
            '</td><td><span data-action="edit-disease" data-index="' +
            index +
            '">编辑</span></td></tr>'
          );
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

    function historyLabel(row) {
      if (!row || !row.historyId) return "—";
      var found = rows.filter(function (r) {
        return r.id === row.historyId;
      })[0];
      return found ? found.id + " · " + found.desc : row.historyId;
    }

    function buildDetailHtml(row) {
      return (
        '<dl class="mp-disease-detail-grid">' +
        "<div><dt>编号</dt><dd>" +
        esc(row.id) +
        "</dd></div>" +
        "<div><dt>所属线路</dt><dd>" +
        esc(row.line) +
        "</dd></div>" +
        "<div><dt>上下行</dt><dd>" +
        esc(row.direction) +
        "</dd></div>" +
        "<div><dt>所在区间</dt><dd>" +
        esc(row.section) +
        "</dd></div>" +
        "<div><dt>站点</dt><dd>" +
        esc(row.station) +
        "</dd></div>" +
        "<div><dt>病害里程</dt><dd>" +
        esc(row.mileage) +
        "</dd></div>" +
        "<div><dt>巡查项</dt><dd>" +
        esc(dictLabel("disease_inspect_item", row.inspectItem)) +
        "</dd></div>" +
        "<div><dt>结构类型</dt><dd>" +
        esc(dictLabel("disease_structure_type", row.structureType)) +
        "</dd></div>" +
        "<div><dt>病害类型</dt><dd>" +
        esc(dictLabel("disease_type", row.diseaseType)) +
        "</dd></div>" +
        "<div><dt>病害程度</dt><dd>" +
        esc(dictLabel("disease_level", row.level)) +
        "</dd></div>" +
        "<div><dt>病害发展</dt><dd>" +
        esc(dictLabel("disease_development", row.development)) +
        "</dd></div>" +
        "<div><dt>环号</dt><dd>" +
        esc(row.ring || "—") +
        "</dd></div>" +
        "<div><dt>标签</dt><dd>" +
        esc(row.tags || "—") +
        "</dd></div>" +
        "<div class=\"mp-disease-detail-grid__full\"><dt>病害描述</dt><dd>" +
        esc(row.desc) +
        "</dd></div>" +
        '<div class="mp-disease-detail-grid__full"><dt>病害照片</dt><dd>' +
        mediaCell("photo", row, 3, true) +
        "</dd></div>" +
        '<div class="mp-disease-detail-grid__full"><dt>病害视频</dt><dd>' +
        mediaCell("video", row, 2, true) +
        "</dd></div>" +
        "<div><dt>关联历史病害</dt><dd>" +
        esc(historyLabel(row)) +
        "</dd></div>" +
        "<div><dt>处理进度</dt><dd>" +
        esc(row.progress) +
        "</dd></div>" +
        "<div><dt>更新时间</dt><dd>" +
        esc(row.date) +
        "</dd></div>" +
        "<div><dt>巡查人</dt><dd>" +
        esc(row.inspector || "汪兵") +
        "</dd></div>" +
        "</dl>"
      );
    }

    function openDetail(index) {
      var row = lastRenderedList[index];
      if (!row) return;
      var titleEl = $("detail-disease-title");
      if (titleEl) titleEl.textContent = row.id + " · 病害详情";
      var html = buildDetailHtml(row);
      if (isMobile) {
        if (listView) listView.classList.add("hidden");
        if (detailView) detailView.classList.remove("hidden");
        if (detailBody) detailBody.innerHTML = html;
        if (global.WHPatrolMediaGallery && detailBody) global.WHPatrolMediaGallery.bind(detailBody);
      } else if (detailWebMask && detailWebBody) {
        detailWebBody.innerHTML = html;
        detailWebMask.classList.add("show");
        if (global.WHPatrolMediaGallery) global.WHPatrolMediaGallery.bind(detailWebBody);
      }
      global.dispatchEvent(new Event("wh-disease-view-change"));
    }

    function closeWebDetail() {
      if (detailWebMask) detailWebMask.classList.remove("show");
    }

    function genId() {
      return String(nextId++);
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
      var hint = $(kind === "photo" ? "f-photo-hint" : "f-video-hint");
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
        files.forEach(function (file) {
          if (uploadStores[kind].length >= MEDIA_MAX) {
            showToast(kind === "photo" ? "病害照片最多上传 9 张" : "病害视频最多上传 9 个");
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
      uploadStores.photo = [];
      uploadStores.video = [];
      renderUploadList("photo");
      renderUploadList("video");
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
      clearUploads();
      fillDictSelects(null);
      fillHistoryOptions(null);
      refreshFormPickers();
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
      refreshFormPickers();
    }

    function readForm() {
      var line = fieldVal("f-line");
      var section = fieldVal("f-section");
      var station = fieldVal("f-station");
      var place = (section || "—") + (station ? " / " + station : "");
      return {
        id: fieldVal("f-id"),
        line: line,
        section: section,
        station: station,
        place: place,
        direction: fieldVal("f-direction"),
        mileage: fieldVal("f-mileage"),
        inspectItem: fieldVal("f-inspect-item"),
        structureType: fieldVal("f-structure-type"),
        diseaseType: fieldVal("f-disease-type"),
        level: fieldVal("f-disease-level"),
        development: fieldVal("f-disease-development"),
        ring: fieldVal("f-ring"),
        tags: fieldVal("f-tags"),
        desc: fieldVal("f-desc"),
        historyId: fieldVal("f-history"),
      };
    }

    function validateForm() {
      var d = readForm();
      if (!d.line) {
        showToast("请选择所属线路");
        return false;
      }
      if (!d.direction) {
        showToast("请选择上下行");
        return false;
      }
      if (!d.mileage) {
        showToast("请填写病害里程");
        return false;
      }
      if (!d.inspectItem) {
        showToast("请选择巡查项");
        return false;
      }
      if (!d.structureType) {
        showToast("请选择结构类型");
        return false;
      }
      if (!d.diseaseType) {
        showToast("请选择病害类型");
        return false;
      }
      if (!d.level) {
        showToast("请选择病害程度");
        return false;
      }
      if (!d.development) {
        showToast("请选择病害发展");
        return false;
      }
      return true;
    }

    function showForm(mode, index) {
      editingIndex = mode === "edit" ? findRowIndex(lastRenderedList[index]) : null;
      var titleEl = $("disease-form-title");
      if (titleEl) titleEl.textContent = mode === "edit" ? "编辑病害" : "新建病害";
      if (mode === "edit" && editingIndex != null && rows[editingIndex]) loadForm(rows[editingIndex]);
      else resetForm();
      if (listView) listView.classList.add("hidden");
      if (detailView) detailView.classList.add("hidden");
      if (formView) formView.classList.remove("hidden");
      global.dispatchEvent(new Event("wh-disease-view-change"));
    }

    function showList() {
      if (formView) formView.classList.add("hidden");
      if (detailView) detailView.classList.add("hidden");
      if (listView) listView.classList.remove("hidden");
      closeWebDetail();
      global.dispatchEvent(new Event("wh-disease-view-change"));
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
        progress: editingIndex != null ? rows[editingIndex].progress : "病害未处理",
        date: now,
        inspector: "汪兵",
        logs:
          editingIndex != null
            ? rows[editingIndex].logs.slice()
            : [{ action: "新增病害巡查", user: "当前用户", time: now }],
      };
      if (editingIndex != null) rows[editingIndex] = row;
      else rows.unshift(row);
      filteredRows = null;
      renderList();
      showList();
      showToast("病害记录已保存");
    }

    function openConfirm(kind, index) {
      pendingConfirm = { kind: kind, index: index };
      if (confirmTitle) confirmTitle.textContent = kind === "confirm" ? "工班确认" : "拒绝受理";
      if (confirmMsg) confirmMsg.textContent = kind === "confirm" ? "确定通过该病害巡查记录？" : "确定拒绝该病害巡查记录？";
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
      rows[realIdx].logs.push({
        action: kind === "confirm" ? "工班确认" : "拒绝",
        user: "鲍雄澎",
        time: "2026-05-12 14:40:31",
      });
      rows[realIdx].progress = kind === "confirm" ? "病害复查" : "病害不受理";
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
      var searchPage = "disease-search.html";

      document.addEventListener("click", function (event) {
        var trigger = event.target.closest("[data-action]");
        if (!trigger) return;
        var action = trigger.getAttribute("data-action");
        var index = trigger.hasAttribute("data-index") ? Number(trigger.getAttribute("data-index")) : null;

        if (action === "open-disease-search") {
          event.preventDefault();
          global.location.href = searchPage;
          return;
        }
        if (action === "new-disease") {
          showForm("new");
          return;
        }
        if (action === "disease-detail") {
          openDetail(index);
          return;
        }
        if (action === "edit-disease") {
          showForm("edit", index);
          return;
        }
        if (action === "back-disease-list" || action === "cancel-disease") {
          showList();
          return;
        }
        if (action === "save-disease") {
          saveItem();
          return;
        }
        if (action === "confirm-disease") {
          openConfirm("confirm", index);
          return;
        }
        if (action === "reject-disease") {
          openConfirm("reject", index);
          return;
        }
        if (action === "disease-confirm-cancel" || action === "disease-confirm-mask-close") {
          closeConfirm();
          return;
        }
        if (action === "disease-confirm-ok") {
          submitConfirm();
          return;
        }
        if (action === "view-disease-records") {
          openRecords(index);
          return;
        }
        if (action === "close-disease-record" || action === "close-disease-record-mask") {
          closeRecords();
          return;
        }
        if (action === "close-disease-detail") {
          if (isMobile) showList();
          else closeWebDetail();
          return;
        }
        if (action === "open-disease-filter") {
          var sheet = $("disease-filter-sheet");
          if (sheet) {
            sheet.classList.add("is-open");
            refreshFilterPickers();
          }
          return;
        }
        if (action === "close-disease-filter") {
          var closeSheet = $("disease-filter-sheet");
          if (closeSheet) closeSheet.classList.remove("is-open");
          return;
        }
        if (action === "search-disease") {
          var searchSheet = $("disease-filter-sheet");
          if (searchSheet) searchSheet.classList.remove("is-open");
          applyFilter();
          return;
        }
        if (action === "reset-disease-filter") {
          var resetSheet = $("disease-filter-sheet");
          if (resetSheet) resetSheet.classList.remove("is-open");
          resetFilters();
          return;
        }
        if (action === "remove-upload") {
          var kind = trigger.getAttribute("data-kind");
          var idx = Number(trigger.getAttribute("data-idx"));
          var removed = uploadStores[kind].splice(idx, 1)[0];
          if (removed && removed._url) URL.revokeObjectURL(removed._url);
          renderUploadList(kind);
        }
      });

      if (mobileList) {
        mobileList.addEventListener("click", function (event) {
          if (event.target.closest("[data-action]")) return;
          var card = event.target.closest(".mp-disease-card[data-row-index]");
          if (!card) return;
          openDetail(Number(card.getAttribute("data-row-index")));
        });
      }

      var searchClear = $("disease-search-clear");
      if (searchClear) {
        searchClear.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          clearDiseaseSearch();
        });
      }
    }

    if (isMobile && global.WHProjectMobile && global.WHProjectMobile.init) {
      try {
        global.WHProjectMobile.init({
          clearListSearch: clearDiseaseSearch,
          showToast: showToast,
        });
      } catch (initErr) {
        console.warn("[WHInDiseasePage] mobile init", initErr);
      }
      syncDiseaseSearchClear();
    }

    if (global.ProjectOperationLog) {
      global.ProjectOperationLog.bindClose("disease-record-mask", "close-disease-record");
    }

    bindUploader("photo", "f-photo-input");
    bindUploader("video", "f-video-input");
    initFilterSelects();
    refreshFilterPickers();
    renderList();
    bindEvents();

    (function handleQueryOpen() {
      try {
        var params = new URLSearchParams(global.location.search);
        var q = params.get("q");
        if (q) {
          applyFilter(q, true);
          try {
            global.history.replaceState({ fromDiseaseSearch: true }, "", "disease.html");
          } catch (e) {
            /* ignore */
          }
        }
      } catch (e) {
        /* ignore */
      }
    })();

    if (!isMobile && global.WHTableRowClick && tableBody) {
      global.WHTableRowClick.bindById("disease-table-body", {
        getRows: function () {
          return lastRenderedList;
        },
        onOpen: function (row, index) {
          openDetail(index);
        },
      });
    }

    global.WHInDiseasePage.showList = showList;
    global.WHInDiseasePage.showForm = showForm;
    global.WHInDiseasePage.openDetail = openDetail;

    return { showList: showList, showForm: showForm, renderList: renderList };
  }

  global.WHInDiseasePage = {
    boot: bootInDiseasePage,
    showList: null,
    showForm: null,
    openDetail: null,
  };
})(typeof window !== "undefined" ? window : global);
