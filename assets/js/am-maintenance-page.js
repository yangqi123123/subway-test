/**
 * 维修与检修记录 — Web / 移动端共用逻辑
 */
(function (global) {
  "use strict";

  function deviceOptionsByType(deviceType) {
    return (global.WH_MAINTENANCE_DEVICE_CATALOG || [])
      .filter(function (item) {
        return item.type === deviceType;
      })
      .map(function (item) {
        return item.label;
      });
  }

  function inferDeviceType(item) {
    if (item && item.deviceType) return item.deviceType;
    if (item && /机场/.test(item.device || "")) return "airport";
    return "drone";
  }

  function bootMaintenancePage(options) {
    options = options || {};
    var isMobile = !!options.mobile;
    var deviceSelect = options.deviceSelect || null;
    var uploaders = options.uploaders || {};

    var rows = (global.WH_MAINTENANCE_ROWS || []).map(function (row) {
      return Object.assign({}, row, {
        docs: (row.docs || []).slice(),
        photos: (row.photos || []).slice(),
        videos: (row.videos || []).slice(),
      });
    });
    var filteredRows = null;
    var lastRenderedList = [];
    var editingId = null;
    var pendingDeleteId = "";
    var preservedMedia = null;

    var listView = document.getElementById("maintenance-list-view");
    var detailView = document.getElementById("maintenance-detail-view");
    var formView = document.getElementById("maintenance-form-view");
    var mobileList = document.getElementById("maintenance-mobile-list");
    var detailBody = document.getElementById("maintenance-detail-body");
    var toastEl = document.getElementById("maintenance-toast");
    var tableBody = document.getElementById("table-body");

    function $(id) {
      return document.getElementById(id);
    }

    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function showToast(msg) {
      if (toastEl) {
        toastEl.textContent = msg;
        toastEl.classList.add("show");
        clearTimeout(showToast._t);
        showToast._t = setTimeout(function () {
          toastEl.classList.remove("show");
        }, 1800);
        return;
      }
      if (isMobile) return;
      var existing = document.getElementById("toast-box");
      if (existing) existing.remove();
      var box = document.createElement("div");
      box.id = "toast-box";
      box.className =
        "fixed right-5 bottom-5 z-[100] rounded bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg";
      box.textContent = msg;
      document.body.appendChild(box);
      setTimeout(function () {
        box.remove();
      }, 1800);
    }

    function dispatchViewChange() {
      global.dispatchEvent(new Event("wh-maintenance-view-change"));
    }

    function fieldVal(id) {
      var el = $(id);
      return el ? String(el.value || "").trim() : "";
    }

    function getListSource() {
      return filteredRows !== null ? filteredRows : rows;
    }

    function findRowIndex(id) {
      return rows.findIndex(function (row) {
        return row.id === id;
      });
    }

    function statusBadge(row) {
      if (row.status === "已完成") {
        return { text: "已完成", className: "mp-maintenance-status mp-maintenance-status--done" };
      }
      return { text: "进行中", className: "mp-maintenance-status mp-maintenance-status--progress" };
    }

    function updateStats(list) {
      var data = list || getListSource();
      var done = 0;
      var progress = 0;
      var fault = 0;
      data.forEach(function (item) {
        if (item.status === "已完成") done += 1;
        if (item.status === "进行中") progress += 1;
        if (item.type === "故障处理") fault += 1;
      });
      var set = function (id, val) {
        var el = $(id);
        if (el) el.textContent = String(val);
      };
      set("stat-total", data.length);
      set("stat-done", done);
      set("stat-progress", progress);
      set("stat-fault", fault);
      var totalEl = $("table-total");
      if (totalEl) totalEl.textContent = String(data.length);
    }

    function getSearchQuery(qOverride) {
      if (typeof qOverride === "string") return qOverride;
      if (isMobile) {
        var input = $("maintenance-search-trigger");
        return input && input.value ? input.value.trim() : "";
      }
      return fieldVal("search-keyword");
    }

    function readFilters() {
      return {
        type: fieldVal("filter-type") || fieldVal("search-type"),
        status: fieldVal("filter-status") || fieldVal("search-status"),
      };
    }

    function rowMatchesFilters(row, f, q) {
      if (q) {
        var hit = [row.id, row.device, row.summary].some(function (text) {
          return String(text || "").indexOf(q) >= 0;
        });
        if (!hit) return false;
      }
      if (f.type && row.type !== f.type) return false;
      if (f.status && row.status !== f.status) return false;
      return true;
    }

    function syncSearchClear() {
      var input = $("maintenance-search-trigger");
      var clearBtn = $("maintenance-search-clear");
      if (!input || !clearBtn) return;
      clearBtn.hidden = !(input.value || "").trim();
    }

    function applyFilter(qOverride, silent) {
      var q = getSearchQuery(qOverride);
      if (isMobile) {
        var input = $("maintenance-search-trigger");
        if (input && typeof qOverride === "string") input.value = qOverride;
      }
      var f = readFilters();
      var hasFilter = !!(q || f.type || f.status);
      filteredRows = hasFilter
        ? rows.filter(function (row) {
            return rowMatchesFilters(row, f, q);
          })
        : null;
      renderList();
      syncSearchClear();
      if (!silent && isMobile) showToast("已按当前条件筛选");
    }

    function resetFilters() {
      ["filter-type", "filter-status", "search-type", "search-status", "search-keyword"].forEach(function (id) {
        var el = $(id);
        if (!el) return;
        if (el.tagName === "SELECT") el.selectedIndex = 0;
        else el.value = "";
      });
      var sheet = $("maintenance-filter-sheet");
      if (sheet && global.WHProjectMobile && global.WHProjectMobile.syncPickersFromForm) {
        global.WHProjectMobile.syncPickersFromForm(sheet);
      }
      applyFilter("", true);
      if (isMobile) showToast("筛选条件已重置");
    }

    function clearSearch() {
      var input = $("maintenance-search-trigger");
      if (input) input.value = "";
      applyFilter("", true);
    }

    function displayVal(value) {
      return esc(value === undefined || value === null || value === "" ? "—" : value);
    }

    function renderDetailDocs(docs) {
      if (!docs || !docs.length) return '<p class="mp-maintenance-empty-media">暂无维修资料</p>';
      return (
        '<div class="mp-maintenance-chip-list">' +
        docs
          .map(function (d) {
            var name = typeof d === "string" ? d : d.name;
            if (isMobile) {
              return (
                '<button type="button" class="mp-maintenance-chip mp-maintenance-chip--clickable" data-action="maintenance-media-preview" data-name="' +
                esc(name) +
                '" data-kind="file"><i class="fa-regular fa-file-lines"></i>' +
                esc(name) +
                "</button>"
              );
            }
            return (
              '<span class="mp-maintenance-chip"><i class="fa-regular fa-file-lines"></i>' + esc(name) + "</span>"
            );
          })
          .join("") +
        "</div>"
      );
    }

    function renderDetailPhotos(photos) {
      if (!photos || !photos.length) return '<p class="mp-maintenance-empty-media">暂无维修照片</p>';
      return (
        '<div class="mp-maintenance-photo-grid">' +
        photos
          .map(function (src, i) {
            if (isMobile) {
              return (
                '<button type="button" class="mp-maintenance-photo mp-maintenance-photo--clickable" data-action="maintenance-media-preview" data-url="' +
                esc(src) +
                '" data-name="维修照片' +
                (i + 1) +
                '" data-kind="image"><img src="' +
                esc(src) +
                '" alt="维修照片' +
                (i + 1) +
                '" loading="lazy" /></button>'
              );
            }
            return (
              '<div class="mp-maintenance-photo"><img src="' +
              esc(src) +
              '" alt="维修照片' +
              (i + 1) +
              '" loading="lazy" /></div>'
            );
          })
          .join("") +
        "</div>"
      );
    }

    function renderDetailVideos(videos) {
      if (!videos || !videos.length) return '<p class="mp-maintenance-empty-media">暂无维修视频</p>';
      return (
        '<div class="mp-maintenance-video-list">' +
        videos
          .map(function (v, i) {
            var name = v.name || "视频" + (i + 1);
            if (v.url) {
              if (isMobile) {
                return (
                  '<button type="button" class="mp-maintenance-video mp-maintenance-video--clickable" data-action="maintenance-media-preview" data-url="' +
                  esc(v.url) +
                  '" data-name="' +
                  esc(name) +
                  '" data-kind="video"><span class="mp-maintenance-video__play"><i class="fa-solid fa-play"></i></span><span class="mp-maintenance-video__label">' +
                  esc(name) +
                  "</span></button>"
                );
              }
              return (
                '<div class="mp-maintenance-video"><video src="' +
                esc(v.url) +
                '" controls preload="metadata"></video><span>' +
                esc(name) +
                "</span></div>"
              );
            }
            if (isMobile) {
              return (
                '<button type="button" class="mp-maintenance-chip mp-maintenance-chip--clickable" data-action="maintenance-media-preview" data-name="' +
                esc(name) +
                '" data-kind="video"><i class="fa-solid fa-film"></i>' +
                esc(name) +
                "</button>"
              );
            }
            return (
              '<span class="mp-maintenance-chip"><i class="fa-solid fa-film"></i>' + esc(name) + "</span>"
            );
          })
          .join("") +
        "</div>"
      );
    }

    function detailRow(label, innerHtml, full) {
      return (
        '<label class="wb-detail-form-item' +
        (full ? " wb-detail-form-item--full" : "") +
        '"><span class="wb-detail-form-label">' +
        esc(label) +
        '：</span><div class="wb-detail-value wb-detail-value--multiline">' +
        innerHtml +
        "</div></label>"
      );
    }

    function detailRowText(label, value, full) {
      var text = displayVal(value);
      return (
        '<label class="wb-detail-form-item' +
        (full ? " wb-detail-form-item--full" : "") +
        '"><span class="wb-detail-form-label">' +
        esc(label) +
        '：</span><div class="wb-detail-value' +
        (full ? " wb-detail-value--multiline" : "") +
        (text === "—" ? " wb-detail-value--empty" : "") +
        '">' +
        esc(text) +
        "</div></label>"
      );
    }

    function renderWebDetailDocs(docs) {
      if (!docs || !docs.length) return '<p class="mm-detail-empty">暂无维修资料</p>';
      return (
        '<div class="mm-detail-chip-list">' +
        docs
          .map(function (d) {
            var name = typeof d === "string" ? d : d.name;
            return (
              '<span class="mm-detail-chip"><i class="fa-regular fa-file-lines"></i>' + esc(name) + "</span>"
            );
          })
          .join("") +
        "</div>"
      );
    }

    function renderWebDetailPhotos(photos) {
      if (!photos || !photos.length) return '<p class="mm-detail-empty">暂无维修照片</p>';
      return (
        '<div class="mm-detail-photo-grid">' +
        photos
          .map(function (src, i) {
            return (
              '<div class="mm-detail-photo"><img src="' +
              esc(src) +
              '" alt="维修照片' +
              (i + 1) +
              '" loading="lazy" /></div>'
            );
          })
          .join("") +
        "</div>"
      );
    }

    function renderWebDetailVideos(videos) {
      if (!videos || !videos.length) return '<p class="mm-detail-empty">暂无维修视频</p>';
      return (
        '<div class="mm-detail-video-list">' +
        videos
          .map(function (v, i) {
            var name = v.name || "视频" + (i + 1);
            if (v.url) {
              return (
                '<div class="mm-detail-video"><video src="' +
                esc(v.url) +
                '" controls preload="metadata"></video><span>' +
                esc(name) +
                "</span></div>"
              );
            }
            return (
              '<span class="mm-detail-chip"><i class="fa-solid fa-film"></i>' + esc(name) + "</span>"
            );
          })
          .join("") +
        "</div>"
      );
    }

    function buildWebDetailHtml(row) {
      var typeLabel = (global.WH_MAINTENANCE_DEVICE_TYPE_LABEL || {})[inferDeviceType(row)] || "—";
      return (
        '<div class="wb-detail-form-grid">' +
        detailRowText("记录编号", row.id) +
        detailRowText("设备类型", typeLabel) +
        detailRowText("关联设备", row.device) +
        detailRowText("维修类型", row.type) +
        detailRowText("责任人", row.owner) +
        detailRowText("开始维修时间", row.start) +
        detailRowText("完成维修时间", row.end) +
        detailRowText("状态", row.status) +
        detailRowText("更换部件", row.parts) +
        detailRowText("维护内容摘要", row.summary, true) +
        detailRow("维修资料", renderWebDetailDocs(row.docs), true) +
        detailRow("维修照片", renderWebDetailPhotos(row.photos), true) +
        detailRow("维修视频", renderWebDetailVideos(row.videos), true) +
        "</div>"
      );
    }

    function buildDetailHtml(row) {
      if (!isMobile) return buildWebDetailHtml(row);
      var typeLabel = (global.WH_MAINTENANCE_DEVICE_TYPE_LABEL || {})[inferDeviceType(row)] || "—";
      return (
        '<dl class="mp-disease-detail-grid">' +
        "<div><dt>记录编号</dt><dd>" +
        displayVal(row.id) +
        "</dd></div>" +
        "<div><dt>设备类型</dt><dd>" +
        displayVal(typeLabel) +
        "</dd></div>" +
        "<div><dt>关联设备</dt><dd>" +
        displayVal(row.device) +
        "</dd></div>" +
        "<div><dt>维修类型</dt><dd>" +
        displayVal(row.type) +
        "</dd></div>" +
        "<div><dt>责任人</dt><dd>" +
        displayVal(row.owner) +
        "</dd></div>" +
        "<div><dt>开始维修时间</dt><dd>" +
        displayVal(row.start) +
        "</dd></div>" +
        "<div><dt>完成维修时间</dt><dd>" +
        displayVal(row.end) +
        "</dd></div>" +
        "<div><dt>状态</dt><dd>" +
        displayVal(row.status) +
        "</dd></div>" +
        "<div><dt>更换部件</dt><dd>" +
        displayVal(row.parts) +
        "</dd></div>" +
        '<div class="mp-disease-detail-grid__full"><dt>维护内容摘要</dt><dd>' +
        displayVal(row.summary) +
        "</dd></div>" +
        '<div class="mp-disease-detail-grid__full"><dt>维修资料</dt><dd>' +
        renderDetailDocs(row.docs) +
        "</dd></div>" +
        '<div class="mp-disease-detail-grid__full"><dt>维修照片</dt><dd>' +
        renderDetailPhotos(row.photos) +
        "</dd></div>" +
        '<div class="mp-disease-detail-grid__full"><dt>维修视频</dt><dd>' +
        renderDetailVideos(row.videos) +
        "</dd></div></dl>"
      );
    }

    function deviceShortLabel(device) {
      if (!device) return "—";
      var parts = String(device).split(" / ");
      return parts.length > 1 ? parts[1] : device;
    }

    function renderCard(row, index) {
      var badge = statusBadge(row);
      return (
        '<article class="mp-project-card mp-maintenance-card" data-row-index="' +
        index +
        '">' +
        '<div class="mp-project-card__head"><span class="mp-maintenance-type-tag">' +
        esc(row.type) +
        "</span>" +
        '<span class="' +
        esc(badge.className) +
        '">' +
        esc(badge.text) +
        "</span></div>" +
        '<h3 class="mp-project-card__title">' +
        esc(deviceShortLabel(row.device)) +
        "</h3>" +
        '<dl class="mp-project-card__meta mp-maintenance-card__meta">' +
        '<div class="mp-project-card__meta-full"><dt>记录编号</dt><dd>' +
        esc(row.id) +
        "</dd></div>" +
        '<div class="mp-project-card__meta-full"><dt>责任人</dt><dd>' +
        esc(row.owner) +
        "</dd></div>" +
        '<div class="mp-project-card__meta-full mp-project-card__meta-nowrap"><dt>开始维修时间</dt><dd>' +
        esc(row.start) +
        "</dd></div>" +
        '<div class="mp-project-card__meta-full mp-project-card__meta-nowrap"><dt>完成维修时间</dt><dd>' +
        esc(row.end || "—") +
        "</dd></div>" +
        "</dl>" +
        '<div class="mp-project-card__actions mp-maintenance-card__actions">' +
        '<button type="button" class="mp-project-action" data-action="maintenance-detail" data-index="' +
        index +
        '"><i class="fa-regular fa-eye"></i>详情</button>' +
        '<button type="button" class="mp-project-action" data-action="maintenance-edit" data-record-id="' +
        esc(row.id) +
        '"><i class="fa-regular fa-pen-to-square"></i>编辑</button>' +
        '<button type="button" class="mp-project-action mp-project-action--danger" data-action="maintenance-delete" data-record-id="' +
        esc(row.id) +
        '"><i class="fa-regular fa-trash-can"></i>删除</button>' +
        "</div></article>"
      );
    }

    function renderMobileList(list) {
      if (!mobileList) return;
      if (!list.length) {
        mobileList.innerHTML =
          '<div class="mp-project-empty"><i class="fa-solid fa-screwdriver-wrench"></i><p>暂无维修与检修记录</p></div>';
        return;
      }
      mobileList.innerHTML = list.map(renderCard).join("");
    }

    function renderWebTable(list) {
      if (!tableBody) return;
      if (!list.length) {
        tableBody.innerHTML =
          '<tr><td colspan="10" class="px-3 py-8 text-center text-slate-400">暂无维修与检修记录</td></tr>';
        return;
      }
      tableBody.innerHTML = list
        .map(function (item, index) {
          return (
            '<tr data-id="' +
            esc(item.id) +
            '" style="background:' +
            (index % 2 === 0 ? "rgba(12,24,48,0.45)" : "rgba(15,32,58,0.55)") +
            '">' +
            '<td class="px-3 text-slate-100/95 font-mono">' +
            esc(item.id) +
            "</td>" +
            '<td class="px-3 text-cyan-300">' +
            esc(item.device) +
            "</td>" +
            '<td class="px-3 text-slate-100/95">' +
            esc(item.type) +
            "</td>" +
            '<td class="px-3 text-slate-100/95">' +
            esc(item.summary) +
            "</td>" +
            '<td class="px-3 text-slate-100/95">' +
            esc(item.parts || "--") +
            "</td>" +
            '<td class="px-3 text-slate-100/95">' +
            esc(item.owner) +
            "</td>" +
            '<td class="px-3 text-slate-100/95 whitespace-nowrap">' +
            esc(item.start) +
            "</td>" +
            '<td class="px-3 text-slate-100/95 whitespace-nowrap">' +
            esc(item.end || "--") +
            "</td>" +
            '<td class="px-3 text-slate-100/95">' +
            esc(item.status) +
            "</td>" +
            '<td class="px-3 disease-col-actions"><div class="disease-op-actions">' +
            '<span class="mm-op-btn text-amber-300" data-action="maintenance-edit" data-record-id="' +
            esc(item.id) +
            '"><i class="fa-regular fa-pen-to-square"></i>编辑</span>' +
            '<span class="mm-op-btn text-rose-300" data-action="maintenance-delete" data-record-id="' +
            esc(item.id) +
            '"><i class="fa-regular fa-trash-can"></i>删除</span>' +
            "</div></td></tr>"
          );
        })
        .join("");
    }

    function renderList() {
      var list = getListSource();
      lastRenderedList = list.slice();
      updateStats(list);
      if (isMobile) renderMobileList(list);
      else renderWebTable(list);
    }

    function showList() {
      if (formView) formView.classList.add("hidden");
      if (detailView) detailView.classList.add("hidden");
      if (listView) listView.classList.remove("hidden");
      editingId = null;
      preservedMedia = null;
      dispatchViewChange();
    }

    function showDetail(index) {
      var row = lastRenderedList[index];
      if (!row) return;
      var titleEl = $("detail-maintenance-title");
      if (titleEl) titleEl.textContent = row.id + " · 维修记录详情";
      if (listView) listView.classList.add("hidden");
      if (formView) formView.classList.add("hidden");
      if (detailView) detailView.classList.remove("hidden");
      if (detailBody) detailBody.innerHTML = buildDetailHtml(row);
      dispatchViewChange();
    }

    function syncMobileDeviceSelect(deviceType, selected) {
      var select = $("f-device");
      if (!select) return;
      var options = deviceOptionsByType(deviceType);
      select.innerHTML =
        '<option value="">请选择关联设备</option>' +
        options
          .map(function (label) {
            return '<option value="' + esc(label) + '">' + esc(label) + "</option>";
          })
          .join("");
      if (selected) select.value = selected;
    }

    function mountWebDeviceSelect(deviceType, selected) {
      var wrap = $("f-device-wrap");
      if (!wrap || !global.WHSearchSelect) return;
      wrap.innerHTML = "";
      deviceSelect = global.WHSearchSelect.create(
        wrap,
        deviceOptionsByType(deviceType),
        deviceType ? "请搜索或选择关联设备" : "请先选择设备类型"
      );
      if (selected && deviceSelect.setValue) deviceSelect.setValue(selected);
    }

    function readDeviceValue() {
      if (isMobile) return fieldVal("f-device");
      if (deviceSelect && deviceSelect.getValue) return deviceSelect.getValue();
      return fieldVal("f-device");
    }

    function loadForm(row) {
      var deviceType = row ? inferDeviceType(row) : "";
      $("f-device-type").value = deviceType;
      if (isMobile) syncMobileDeviceSelect(deviceType, row ? row.device : "");
      else mountWebDeviceSelect(deviceType, row ? row.device : "");
      $("f-type").value = row ? row.type : "故障处理";
      $("f-owner").value = row ? row.owner : "";
      $("f-parts").value = row ? row.parts : "";
      $("f-start").value = row && row.start ? row.start.replace(" ", "T") : "";
      $("f-end").value = row && row.end ? row.end.replace(" ", "T") : "";
      $("f-status").value = row ? row.status : "进行中";
      $("f-summary").value = row ? row.summary : "";
      preservedMedia = row
        ? { docs: (row.docs || []).slice(), photos: (row.photos || []).slice(), videos: (row.videos || []).slice() }
        : { docs: [], photos: [], videos: [] };
      if (!isMobile && uploaders.doc) uploaders.doc.setFromItems(preservedMedia.docs);
      if (!isMobile && uploaders.photo) uploaders.photo.setFromItems(preservedMedia.photos);
      if (!isMobile && uploaders.video) uploaders.video.setFromItems(preservedMedia.videos);
    }

    function setFormTitle(text) {
      var el = $("maintenance-form-title");
      if (el) el.textContent = text;
      var webTitle = $("form-title");
      if (webTitle) webTitle.textContent = text;
    }

    function openForm(mode, recordId) {
      var index = recordId ? findRowIndex(recordId) : -1;
      editingId = mode === "edit" && index > -1 ? recordId : null;
      setFormTitle(mode === "edit" ? "编辑维修记录" : "新增维修记录");
      loadForm(index > -1 ? rows[index] : null);
      if (isMobile) {
        if (listView) listView.classList.add("hidden");
        if (detailView) detailView.classList.add("hidden");
        if (formView) formView.classList.remove("hidden");
        dispatchViewChange();
      } else {
        openWebModal("form-modal");
      }
    }

    function openWebModal(id) {
      var mask = $(id);
      if (!mask) return;
      mask.classList.add("show");
      mask.setAttribute("aria-hidden", "false");
    }

    function closeWebModal(id) {
      var mask = $(id);
      if (!mask) return;
      mask.classList.remove("show");
      mask.setAttribute("aria-hidden", "true");
    }

    function readFormRow() {
      var docs = preservedMedia ? preservedMedia.docs.slice() : [];
      var photos = preservedMedia ? preservedMedia.photos.slice() : [];
      var videos = preservedMedia ? preservedMedia.videos.slice() : [];
      if (!isMobile) {
        if (uploaders.doc && uploaders.doc.serialize) docs = uploaders.doc.serialize();
        if (uploaders.photo && uploaders.photo.getPhotoUrls) photos = uploaders.photo.getPhotoUrls();
        if (uploaders.video && uploaders.video.serialize) videos = uploaders.video.serialize();
      }
      return {
        deviceType: fieldVal("f-device-type"),
        device: readDeviceValue(),
        type: fieldVal("f-type"),
        owner: fieldVal("f-owner"),
        parts: fieldVal("f-parts"),
        start: fieldVal("f-start").replace("T", " "),
        end: fieldVal("f-end") ? fieldVal("f-end").replace("T", " ") : "",
        status: fieldVal("f-status"),
        summary: fieldVal("f-summary"),
        docs: docs,
        photos: photos,
        videos: videos,
      };
    }

    function saveRecord() {
      var row = readFormRow();
      if (!row.deviceType) return showToast("请选择设备类型");
      if (!row.device) return showToast("请选择关联设备");
      if (!row.type) return showToast("请选择维修类型");
      if (!row.owner) return showToast("请填写责任人");
      if (!row.start) return showToast("请选择开始维修时间");
      if (!row.summary) return showToast("请填写维护内容摘要");
      if (editingId) {
        var editIndex = findRowIndex(editingId);
        if (editIndex > -1) rows[editIndex] = Object.assign({ id: editingId }, row);
      } else {
        rows.unshift(Object.assign({ id: "WX" + Date.now().toString().slice(-11) }, row));
      }
      var wasEdit = !!editingId;
      editingId = null;
      preservedMedia = null;
      showToast(wasEdit ? "维修记录已更新" : "维修记录已新增");
      if (isMobile) showList();
      else {
        closeWebModal("form-modal");
        if (uploaders.doc && uploaders.doc.clear) uploaders.doc.clear();
        if (uploaders.photo && uploaders.photo.clear) uploaders.photo.clear();
        if (uploaders.video && uploaders.video.clear) uploaders.video.clear();
      }
      applyFilter(undefined, true);
    }

    function getConfirmMask() {
      return $("maintenance-confirm-mask") || $("delete-modal");
    }

    function openDeleteConfirm(recordId) {
      pendingDeleteId = recordId || "";
      if (isMobile) {
        var mask = getConfirmMask();
        if (mask) {
          mask.classList.add("is-open");
          mask.setAttribute("aria-hidden", "false");
        }
      } else {
        openWebModal("delete-modal");
      }
    }

    function closeDeleteConfirm() {
      pendingDeleteId = "";
      var mask = getConfirmMask();
      if (!mask) return;
      mask.classList.remove("is-open");
      mask.classList.remove("show");
      mask.setAttribute("aria-hidden", "true");
    }

    function confirmDelete() {
      var idx = pendingDeleteId ? findRowIndex(pendingDeleteId) : -1;
      if (idx > -1) rows.splice(idx, 1);
      closeDeleteConfirm();
      showToast("维修记录已删除");
      applyFilter(undefined, true);
    }

    function openWebDetail(recordId) {
      var index = getListSource().findIndex(function (row) {
        return row.id === recordId;
      });
      if (index < 0) return;
      var row = getListSource()[index];
      var body = $("detail-body");
      var sub = $("detail-subtitle");
      if (!body) return;
      if (sub) sub.textContent = row.device || row.id || "维修记录详情";
      body.innerHTML = buildDetailHtml(row);
      openWebModal("detail-modal");
    }

    function bindEvents() {
      document.addEventListener("click", function (event) {
        var trigger = event.target.closest("[data-action]");
        if (!trigger) return;
        var action = trigger.getAttribute("data-action");
        var index = trigger.hasAttribute("data-index") ? Number(trigger.getAttribute("data-index")) : -1;
        var recordId = trigger.getAttribute("data-record-id");

        if (action === "maintenance-media-preview") {
          var previewUrl = trigger.getAttribute("data-url") || "";
          var previewName = trigger.getAttribute("data-name") || "文件预览";
          var previewKind = trigger.getAttribute("data-kind") || "file";
          if (global.WHProjectMobile && global.WHProjectMobile.openFilePreview) {
            global.WHProjectMobile.openFilePreview({
              url: previewUrl,
              name: previewName,
              kind: previewKind,
              title: previewName,
            });
          } else {
            showToast("暂不支持预览");
          }
          return;
        }
        if (action === "open-maintenance-search") {
          event.preventDefault();
          global.location.href = "maintenance-search.html";
          return;
        }
        if (action === "open-maintenance-filter") {
          var sheet = $("maintenance-filter-sheet");
          if (sheet) {
            sheet.classList.add("is-open");
            sheet.setAttribute("aria-hidden", "false");
          }
          return;
        }
        if (action === "close-maintenance-filter") {
          var closeSheet = $("maintenance-filter-sheet");
          if (closeSheet) {
            closeSheet.classList.remove("is-open");
            closeSheet.setAttribute("aria-hidden", "true");
          }
          return;
        }
        if (action === "search-maintenance") {
          var filterSheet = $("maintenance-filter-sheet");
          if (filterSheet) {
            filterSheet.classList.remove("is-open");
            filterSheet.setAttribute("aria-hidden", "true");
          }
          applyFilter();
          return;
        }
        if (action === "reset-maintenance-filter") {
          resetFilters();
          return;
        }
        if (action === "maintenance-search-clear") {
          clearSearch();
          return;
        }
        if (action === "new-maintenance") {
          openForm("new");
          return;
        }
        if (action === "maintenance-detail") {
          showDetail(index);
          return;
        }
        if (action === "maintenance-edit") {
          openForm("edit", recordId);
          return;
        }
        if (action === "maintenance-delete") {
          openDeleteConfirm(recordId);
          return;
        }
        if (action === "cancel-maintenance-form") {
          showList();
          return;
        }
        if (action === "save-maintenance-form" || action === "save-maintenance") {
          saveRecord();
          return;
        }
        if (action === "maintenance-confirm-cancel" || action === "cancel-maintenance-delete") {
          closeDeleteConfirm();
          return;
        }
        if (action === "maintenance-confirm-ok" || action === "confirm-maintenance-delete") {
          confirmDelete();
          return;
        }
        if (action === "close-form-modal") {
          closeWebModal("form-modal");
          return;
        }
        if (action === "close-detail-modal") {
          closeWebModal("detail-modal");
          return;
        }
      });

      var deviceTypeEl = $("f-device-type");
      if (deviceTypeEl) {
        deviceTypeEl.addEventListener("change", function () {
          var type = deviceTypeEl.value;
          if (isMobile) syncMobileDeviceSelect(type, "");
          else mountWebDeviceSelect(type, "");
        });
      }

      var searchBtn = $("search-btn");
      var resetBtn = $("reset-btn");
      if (searchBtn) searchBtn.addEventListener("click", function () { applyFilter(); });
      if (resetBtn) resetBtn.addEventListener("click", resetFilters);

      var saveBtn = $("save-btn");
      if (saveBtn) saveBtn.addEventListener("click", saveRecord);
      var addBtn = $("add-btn");
      if (addBtn) addBtn.addEventListener("click", function () { openForm("new"); });
      var exportBtn = $("export-btn");
      if (exportBtn) exportBtn.addEventListener("click", function () { showToast("已按示例数据导出"); });
      var confirmDeleteBtn = $("confirm-delete-btn");
      if (confirmDeleteBtn) confirmDeleteBtn.addEventListener("click", confirmDelete);

      document.querySelectorAll("[data-close]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var target = btn.getAttribute("data-close");
          if (target === "form-modal" && uploaders.doc && uploaders.doc.clear) {
            uploaders.doc.clear();
            if (uploaders.photo) uploaders.photo.clear();
            if (uploaders.video) uploaders.video.clear();
          }
          closeWebModal(target);
        });
      });

      if (isMobile && global.WHProjectMobile) {
        global.WHProjectMobile.init({ getOptions: function () { return []; } });
      }
    }

    function initFromQuery() {
      try {
        var params = new URLSearchParams(global.location.search);
        var q = params.get("q") || "";
        if (q) applyFilter(q, true);
      } catch (e) {
        /* ignore */
      }
    }

    function setupWebRowClick() {
      if (isMobile || !tableBody) return;
      if (!global.WHTableRowClick) {
        setTimeout(setupWebRowClick, 40);
        return;
      }
      WHTableRowClick.bindById("table-body", {
        onOpenByTr: function (tr) {
          var id = tr.getAttribute("data-id");
          if (id) openWebDetail(id);
        },
      });
    }

    bindEvents();
    renderList();
    initFromQuery();
    syncSearchClear();
    setupWebRowClick();

    global.WHMaintenancePage.showList = showList;
  }

  global.WHMaintenancePage = {
    boot: bootMaintenancePage,
    deviceOptionsByType: deviceOptionsByType,
    inferDeviceType: inferDeviceType,
  };
})(window);
