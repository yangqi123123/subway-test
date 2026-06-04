/**
 * 应急仓库管理 — Web / 移动端共用逻辑（对齐 wb/am-emergency-warehouse.html）
 */
(function (global) {
  "use strict";

  var LINE_OPTIONS = ["2号线", "5号线", "7号线"];

  function bootEmergencyWarehousePage(options) {
    options = options || {};
    var isMobile = !!options.mobile;
    var deptSelect = options.deptSelect || global.__WHWarehouseDeptSelect || null;

    var rows = (global.WH_EMERGENCY_WAREHOUSE_ROWS || []).map(function (row) {
      return Object.assign({}, row);
    });
    var filteredRows = null;
    var lastRenderedList = [];
    var editingName = null;
    var pendingDeleteName = "";

    var listView = document.getElementById("warehouse-list-view");
    var detailView = document.getElementById("warehouse-detail-view");
    var formView = document.getElementById("warehouse-form-view");
    var mobileList = document.getElementById("warehouse-mobile-list");
    var detailBody = document.getElementById("warehouse-detail-body");
    var toastEl = document.getElementById("warehouse-toast");
    var tableBody = document.getElementById("warehouse-table-body");

    function $(id) {
      return document.getElementById(id);
    }

    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function showToast(msg) {
      if (!toastEl) {
        if (isMobile) return;
        alert(msg);
        return;
      }
      toastEl.textContent = msg;
      toastEl.classList.add("show");
      clearTimeout(showToast._t);
      showToast._t = setTimeout(function () {
        toastEl.classList.remove("show");
      }, 1800);
    }

    function dispatchViewChange() {
      global.dispatchEvent(new Event("wh-warehouse-view-change"));
    }

    function fieldVal(id) {
      var el = $(id);
      return el ? String(el.value || "").trim() : "";
    }

    function getListSource() {
      return filteredRows !== null ? filteredRows : rows;
    }

    function findRowIndex(name) {
      return rows.findIndex(function (row) {
        return row.name === name;
      });
    }

    function materialHref(warehouseName) {
      if (isMobile) {
        return (
          "emergency-material.html" +
          (warehouseName ? "?warehouse=" + encodeURIComponent(warehouseName) : "")
        );
      }
      var base =
        typeof global.whPageHref === "function"
          ? global.whPageHref("wb/am-emergency-material.html")
          : "../../../web/wb/am-emergency-material.html";
      if (!warehouseName) return base;
      return base + "?warehouse=" + encodeURIComponent(warehouseName);
    }

    function updateStats(list) {
      var data = list || getListSource();
      var lines = {};
      var depts = {};
      var owners = {};
      data.forEach(function (row) {
        lines[row.line] = true;
        depts[row.dept] = true;
        owners[row.owner] = true;
      });
      var set = function (id, val) {
        var el = $(id);
        if (el) el.textContent = String(val);
      };
      set("stat-total", data.length);
      set("stat-lines", Object.keys(lines).length);
      set("stat-dept", Object.keys(depts).length);
      set("stat-owners", Object.keys(owners).length);
      var totalEl = $("table-total");
      if (totalEl) totalEl.textContent = String(data.length);
    }

    function rowMatchesSearch(row, q) {
      if (!q) return true;
      return row.name.indexOf(q) >= 0;
    }

    function readFilters() {
      return {
        line: fieldVal("filter-line"),
        dept: fieldVal("filter-dept"),
      };
    }

    function rowMatchesFilters(row, f, q) {
      if (q && !rowMatchesSearch(row, q)) return false;
      if (f.line && row.line !== f.line) return false;
      if (f.dept && row.dept !== f.dept) return false;
      return true;
    }

    function syncSearchClear() {
      var input = $("warehouse-search-trigger");
      var clearBtn = $("warehouse-search-clear");
      if (!input || !clearBtn) return;
      clearBtn.hidden = !(input.value || "").trim();
    }

    function getSearchQuery(qOverride) {
      if (typeof qOverride === "string") return qOverride;
      if (isMobile) {
        var input = $("warehouse-search-trigger");
        return input && input.value ? input.value.trim() : "";
      }
      var nameFilter = $("filter-name");
      return nameFilter ? nameFilter.value.trim() : "";
    }

    function applyFilter(qOverride, silent) {
      var q = getSearchQuery(qOverride);
      if (isMobile) {
        var input = $("warehouse-search-trigger");
        if (input && typeof qOverride === "string") input.value = qOverride;
      }
      var f = readFilters();
      var hasFilter = !!(q || f.line || f.dept);
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
      if (isMobile) {
        ["filter-dept", "filter-line"].forEach(function (id) {
          var el = $(id);
          if (!el) return;
          if (el.tagName === "SELECT") el.selectedIndex = 0;
          else el.value = "";
        });
      } else {
        ["filter-name", "filter-dept", "filter-line"].forEach(function (id) {
          var el = $(id);
          if (!el) return;
          if (el.tagName === "SELECT") el.selectedIndex = 0;
          else el.value = "";
        });
      }
      var sheet = $("warehouse-filter-sheet");
      if (sheet && global.WHProjectMobile && global.WHProjectMobile.syncPickersFromForm) {
        global.WHProjectMobile.syncPickersFromForm(sheet);
      }
      applyFilter("", true);
      if (isMobile) showToast("筛选条件已重置");
    }

    function clearSearch() {
      var input = $("warehouse-search-trigger");
      if (input) input.value = "";
      applyFilter("", true);
    }

    function displayVal(value) {
      return esc(value === undefined || value === null || value === "" ? "—" : value);
    }

    function buildDetailHtml(row) {
      return (
        '<dl class="mp-disease-detail-grid">' +
        "<div><dt>名称</dt><dd>" +
        displayVal(row.name) +
        "</dd></div>" +
        "<div><dt>所属部门</dt><dd>" +
        displayVal(row.dept) +
        "</dd></div>" +
        "<div><dt>所属线路</dt><dd>" +
        displayVal(row.line) +
        "</dd></div>" +
        "<div><dt>负责人</dt><dd>" +
        displayVal(row.owner) +
        "</dd></div>" +
        "<div><dt>联系电话</dt><dd>" +
        displayVal(row.phone) +
        "</dd></div>" +
        '<div class="mp-disease-detail-grid__full"><dt>仓库地址</dt><dd>' +
        displayVal(row.address) +
        "</dd></div>" +
        "<div><dt>地址经度</dt><dd>" +
        displayVal(row.lng) +
        "</dd></div>" +
        "<div><dt>地址纬度</dt><dd>" +
        displayVal(row.lat) +
        "</dd></div>" +
        '<div class="mp-disease-detail-grid__full"><dt>备注</dt><dd>' +
        displayVal(row.remark) +
        "</dd></div></dl>"
      );
    }

    function renderCard(row, index) {
      return (
        '<article class="mp-project-card mp-warehouse-card" data-row-index="' +
        index +
        '">' +
        '<div class="mp-project-card__head"><span class="mp-project-card__id">' +
        esc(row.line) +
        "</span>" +
        '<span class="mp-warehouse-dept-tag">' +
        esc(row.dept) +
        "</span></div>" +
        '<h3 class="mp-project-card__title">' +
        esc(row.name) +
        "</h3>" +
        '<dl class="mp-project-card__meta mp-warehouse-card__meta">' +
        "<div><dt>负责人</dt><dd>" +
        esc(row.owner) +
        "</dd></div>" +
        "<div><dt>联系电话</dt><dd>" +
        esc(row.phone) +
        "</dd></div>" +
        '<div class="mp-project-card__meta-full"><dt>仓库地址</dt><dd>' +
        esc(row.address) +
        "</dd></div>" +
        "</dl>" +
        '<div class="mp-project-card__actions mp-warehouse-card__actions">' +
        '<button type="button" class="mp-project-action" data-action="warehouse-detail" data-index="' +
        index +
        '"><i class="fa-regular fa-eye"></i>详情</button>' +
        '<button type="button" class="mp-project-action" data-action="warehouse-edit" data-warehouse-name="' +
        esc(row.name) +
        '"><i class="fa-regular fa-pen-to-square"></i>编辑</button>' +
        '<button type="button" class="mp-project-action" data-action="view-material" data-warehouse-name="' +
        esc(row.name) +
        '"><i class="fa-regular fa-boxes-stacked"></i>查看物资</button>' +
        '<button type="button" class="mp-project-action mp-project-action--danger" data-action="warehouse-delete" data-warehouse-name="' +
        esc(row.name) +
        '"><i class="fa-regular fa-trash-can"></i>删除</button>' +
        "</div></article>"
      );
    }

    function renderMobileList(list) {
      if (!mobileList) return;
      if (!list.length) {
        mobileList.innerHTML =
          '<div class="mp-project-empty"><i class="fa-solid fa-warehouse"></i><p>暂无应急仓库</p></div>';
        return;
      }
      mobileList.innerHTML = list.map(renderCard).join("");
    }

    function renderWebTable(list) {
      if (!tableBody) return;
      if (!list.length) {
        tableBody.innerHTML =
          '<tr><td colspan="10" class="px-3 py-8 text-center text-slate-400">暂无应急仓库</td></tr>';
        return;
      }
      tableBody.innerHTML = list
        .map(function (row, index) {
          return (
            '<tr class="wh-row-open ' +
            (index % 2 ? "bg-slate-950/10" : "bg-slate-950/22") +
            '" data-row-index="' +
            index +
            '">' +
            '<td class="px-4">' +
            esc(row.name) +
            "</td>" +
            '<td class="px-4">' +
            esc(row.dept) +
            "</td>" +
            '<td class="px-4">' +
            esc(row.line) +
            "</td>" +
            '<td class="px-4">' +
            esc(row.address) +
            "</td>" +
            '<td class="px-4">' +
            esc(row.lng) +
            "</td>" +
            '<td class="px-4">' +
            esc(row.lat) +
            "</td>" +
            '<td class="px-4">' +
            esc(row.owner) +
            "</td>" +
            '<td class="px-4">' +
            esc(row.phone) +
            "</td>" +
            '<td class="px-4">' +
            esc(row.remark) +
            "</td>" +
            '<td class="px-4 disease-col-actions"><div class="disease-op-actions">' +
            '<span class="warehouse-action text-amber-300" data-action="edit-warehouse" data-warehouse-name="' +
            esc(row.name) +
            '"><i class="fa-regular fa-pen-to-square"></i>编辑</span>' +
            '<span class="warehouse-action text-amber-300" data-action="view-material" data-warehouse-name="' +
            esc(row.name) +
            '"><i class="fa-regular fa-boxes-stacked"></i>查看物资</span>' +
            '<span class="warehouse-action text-rose-300" data-action="delete-warehouse" data-warehouse-name="' +
            esc(row.name) +
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
      editingName = null;
      dispatchViewChange();
    }

    function showDetail(index) {
      var row = lastRenderedList[index];
      if (!row) return;
      var titleEl = $("detail-warehouse-title");
      if (titleEl) titleEl.textContent = row.name + " · 应急仓库详情";
      if (listView) listView.classList.add("hidden");
      if (formView) formView.classList.add("hidden");
      if (detailView) detailView.classList.remove("hidden");
      if (detailBody) detailBody.innerHTML = buildDetailHtml(row);
      dispatchViewChange();
    }

    function setFormTitle(text) {
      var el = $("warehouse-form-title");
      if (el) el.textContent = text;
    }

    function readDeptValue() {
      if (isMobile) return fieldVal("warehouse-dept");
      if (deptSelect && deptSelect.getValue) return deptSelect.getValue();
      return fieldVal("warehouse-dept");
    }

    function setDeptValue(val) {
      var hidden = $("warehouse-dept");
      if (hidden) hidden.value = val || "";
      if (deptSelect && deptSelect.setValue) deptSelect.setValue(val || "");
    }

    function loadForm(row) {
      $("warehouse-name").value = row ? row.name : "";
      setDeptValue(row ? row.dept : "");
      $("warehouse-line").value = row ? row.line : "";
      $("warehouse-address").value = row ? row.address : "";
      $("warehouse-lng").value = row ? row.lng : "";
      $("warehouse-lat").value = row ? row.lat : "";
      $("warehouse-owner").value = row ? row.owner : "";
      $("warehouse-phone").value = row ? row.phone : "";
      $("warehouse-remark").value = row ? row.remark : "";
      if (global.WHProjectMobile && global.WHProjectMobile.syncPickersFromForm) {
        global.WHProjectMobile.syncPickersFromForm(formView);
      }
    }

    function openForm(mode, warehouseName) {
      var index = warehouseName ? findRowIndex(warehouseName) : -1;
      editingName = mode === "edit" && index > -1 ? warehouseName : null;
      setFormTitle(mode === "edit" ? "编辑应急仓库" : "新增应急仓库");
      loadForm(index > -1 ? rows[index] : null);
      if (listView) listView.classList.add("hidden");
      if (detailView) detailView.classList.add("hidden");
      if (formView) formView.classList.remove("hidden");
      dispatchViewChange();
    }

    function readFormRow() {
      return {
        name: fieldVal("warehouse-name"),
        dept: readDeptValue(),
        line: fieldVal("warehouse-line") || LINE_OPTIONS[0],
        address: fieldVal("warehouse-address"),
        lng: fieldVal("warehouse-lng") || "-",
        lat: fieldVal("warehouse-lat") || "-",
        owner: fieldVal("warehouse-owner"),
        phone: fieldVal("warehouse-phone"),
        remark: fieldVal("warehouse-remark") || "-",
      };
    }

    function saveWarehouse() {
      var row = readFormRow();
      if (!row.name || !row.address || !row.owner || !row.phone) {
        showToast("请完善必填项：名称、仓库地址、负责人、联系电话");
        return;
      }
      if (!row.dept) {
        showToast("请选择所属部门");
        return;
      }
      if (editingName) {
        var editIndex = findRowIndex(editingName);
        if (editIndex > -1) rows[editIndex] = row;
      } else {
        if (rows.some(function (r) { return r.name === row.name; })) {
          showToast("仓库名称已存在");
          return;
        }
        rows.unshift(row);
      }
      showToast(editingName ? "应急仓库已更新" : "应急仓库已新增");
      editingName = null;
      if (isMobile) showList();
      else closeWebModal();
      applyFilter(undefined, true);
    }

    function getConfirmMask() {
      return $("warehouse-confirm-mask") || $("confirm-mask");
    }

    function openDeleteConfirm(warehouseName) {
      pendingDeleteName = warehouseName || "";
      var mask = getConfirmMask();
      if (mask) {
        if (mask.classList.contains("mp-confirm-mask")) {
          mask.classList.add("is-open");
        } else {
          mask.classList.add("show");
        }
        mask.setAttribute("aria-hidden", "false");
      }
    }

    function closeDeleteConfirm() {
      pendingDeleteName = "";
      var mask = getConfirmMask();
      if (mask) {
        mask.classList.remove("is-open");
        mask.classList.remove("show");
        mask.setAttribute("aria-hidden", "true");
      }
    }

    function confirmDelete() {
      var idx = pendingDeleteName ? findRowIndex(pendingDeleteName) : -1;
      if (idx > -1) rows.splice(idx, 1);
      closeDeleteConfirm();
      showToast("已删除");
      applyFilter(undefined, true);
    }

    function openWebModal(mode, warehouseName) {
      var mask = $("warehouse-modal-mask");
      var titleEl = $("warehouse-modal-title");
      if (!mask) return;
      if (global.WHSearchSelect && WHSearchSelect.closeAll) WHSearchSelect.closeAll(null);
      var index = warehouseName ? findRowIndex(warehouseName) : -1;
      editingName = mode === "edit" && index > -1 ? warehouseName : null;
      if (titleEl) titleEl.textContent = mode === "edit" ? "编辑应急仓库" : "新增应急仓库";
      loadForm(index > -1 ? rows[index] : null);
      mask.classList.add("show");
    }

    function closeWebModal() {
      var mask = $("warehouse-modal-mask");
      if (mask) mask.classList.remove("show");
      editingName = null;
    }

    function webDetailValue(value) {
      var text = value === undefined || value === null || value === "" ? "—" : String(value);
      return (
        '<div class="detail-value' +
        (text === "—" ? " detail-value--empty" : "") +
        '">' +
        esc(text) +
        "</div>"
      );
    }

    function openWebDetail(index) {
      var row = getListSource()[index];
      if (!row) return;
      var mask = $("warehouse-detail-mask");
      var body = $("warehouse-detail-body");
      var sub = $("warehouse-detail-subtitle");
      if (!mask || !body) return;
      if (sub) sub.textContent = row.name || "应急仓库详情";
      body.innerHTML =
        '<div class="warehouse-form-grid">' +
        '<label class="warehouse-form-item"><span class="warehouse-form-label">名称：</span>' +
        webDetailValue(row.name) +
        "</label>" +
        '<label class="warehouse-form-item"><span class="warehouse-form-label">所属部门：</span>' +
        webDetailValue(row.dept) +
        "</label>" +
        '<label class="warehouse-form-item"><span class="warehouse-form-label">所属线路：</span>' +
        webDetailValue(row.line) +
        "</label>" +
        '<label class="warehouse-form-item"><span class="warehouse-form-label">仓库地址：</span>' +
        webDetailValue(row.address) +
        "</label>" +
        '<label class="warehouse-form-item"><span class="warehouse-form-label">地址经度：</span>' +
        webDetailValue(row.lng) +
        "</label>" +
        '<label class="warehouse-form-item"><span class="warehouse-form-label">地址纬度：</span>' +
        webDetailValue(row.lat) +
        "</label>" +
        '<label class="warehouse-form-item"><span class="warehouse-form-label">负责人：</span>' +
        webDetailValue(row.owner) +
        "</label>" +
        '<label class="warehouse-form-item"><span class="warehouse-form-label">联系电话：</span>' +
        webDetailValue(row.phone) +
        "</label>" +
        '<label class="warehouse-form-item"><span class="warehouse-form-label">备注：</span>' +
        webDetailValue(row.remark) +
        "</label></div>";
      mask.classList.add("show");
      mask.setAttribute("aria-hidden", "false");
    }

    function closeWebDetail() {
      var mask = $("warehouse-detail-mask");
      if (mask) {
        mask.classList.remove("show");
        mask.setAttribute("aria-hidden", "true");
      }
    }

    function bindEvents() {
      document.addEventListener("click", function (event) {
        var trigger = event.target.closest("[data-action]");
        if (!trigger) return;
        var action = trigger.getAttribute("data-action");
        var index = trigger.hasAttribute("data-index") ? Number(trigger.getAttribute("data-index")) : null;
        var warehouseName = trigger.getAttribute("data-warehouse-name");

        if (action === "open-warehouse-search") {
          event.preventDefault();
          global.location.href = "emergency-warehouse-search.html";
          return;
        }
        if (action === "open-warehouse-filter") {
          var sheet = $("warehouse-filter-sheet");
          if (sheet) {
            sheet.classList.add("is-open");
            sheet.setAttribute("aria-hidden", "false");
          }
          return;
        }
        if (action === "close-warehouse-filter") {
          var closeSheet = $("warehouse-filter-sheet");
          if (closeSheet) {
            closeSheet.classList.remove("is-open");
            closeSheet.setAttribute("aria-hidden", "true");
          }
          return;
        }
        if (action === "search-warehouse") {
          var filterSheet = $("warehouse-filter-sheet");
          if (filterSheet) {
            filterSheet.classList.remove("is-open");
            filterSheet.setAttribute("aria-hidden", "true");
          }
          applyFilter();
          return;
        }
        if (action === "reset-warehouse-filter") {
          resetFilters();
          return;
        }
        if (action === "warehouse-search-clear") {
          clearSearch();
          return;
        }
        if (action === "new-warehouse") {
          if (isMobile) openForm("new");
          else openWebModal("new");
          return;
        }
        if (action === "warehouse-detail") {
          showDetail(index);
          return;
        }
        if (action === "warehouse-edit" || action === "edit-warehouse") {
          if (isMobile) openForm("edit", warehouseName);
          else openWebModal("edit", warehouseName);
          return;
        }
        if (action === "view-material") {
          global.location.href = materialHref(warehouseName || "");
          return;
        }
        if (action === "warehouse-delete" || action === "delete-warehouse") {
          openDeleteConfirm(warehouseName);
          return;
        }
        if (action === "cancel-warehouse-form") {
          showList();
          return;
        }
        if (action === "save-warehouse-form" || action === "save-warehouse") {
          saveWarehouse();
          return;
        }
        if (action === "close-warehouse-modal") {
          closeWebModal();
          return;
        }
        if (action === "close-warehouse-detail") {
          if (isMobile) showList();
          else closeWebDetail();
          return;
        }
        if (action === "warehouse-confirm-cancel" || action === "cancel-warehouse-delete") {
          closeDeleteConfirm();
          return;
        }
        if (action === "warehouse-confirm-ok" || action === "confirm-warehouse-delete") {
          confirmDelete();
          return;
        }
        if (action === "btn-search") applyFilter();
        if (action === "btn-reset") resetFilters();
      });

      var webSearchBtn = $("btn-search");
      var webResetBtn = $("btn-reset");
      if (webSearchBtn) webSearchBtn.addEventListener("click", function () { applyFilter(); });
      if (webResetBtn) webResetBtn.addEventListener("click", resetFilters);

      var filterName = $("filter-name");
      if (filterName) {
        filterName.addEventListener("keydown", function (e) {
          if (e.key === "Enter") applyFilter(filterName.value.trim());
        });
      }

      var detailMask = $("warehouse-detail-mask");
      if (detailMask) {
        detailMask.addEventListener("click", function (e) {
          if (e.target === detailMask) closeWebDetail();
        });
      }

      if (isMobile && global.WHProjectMobile) {
        global.WHProjectMobile.init({
          getOptions: function () { return []; },
        });
      }
    }

    function initFromQuery() {
      try {
        var params = new URLSearchParams(global.location.search);
        var q = params.get("q") || "";
        var name = params.get("name") || "";
        if (q) {
          applyFilter(q, true);
          return;
        }
        if (name && isMobile) {
          applyFilter(name, true);
          var list = getListSource();
          var idx = list.findIndex(function (r) { return r.name === name; });
          if (idx >= 0) showDetail(idx);
          return;
        }
        if (name && !isMobile) {
          var webList = getListSource();
          var webIdx = webList.findIndex(function (r) { return r.name === name; });
          if (webIdx >= 0) {
            setTimeout(function () { openWebDetail(webIdx); }, 120);
          }
        }
      } catch (e) {
        /* ignore */
      }
    }

    function setupWebRowClick() {
      if (isMobile || !tableBody || !global.WHTableRowClick) return;
      WHTableRowClick.bindById("warehouse-table-body", {
        getRows: function () { return getListSource(); },
        onOpen: function (row, index) { openWebDetail(index); },
      });
    }

    bindEvents();
    renderList();
    initFromQuery();
    syncSearchClear();
    setupWebRowClick();

    global.WHEmergencyWarehousePage.showList = showList;
  }

  global.WHEmergencyWarehousePage = {
    boot: bootEmergencyWarehousePage,
    LINE_OPTIONS: LINE_OPTIONS,
  };
})(window);
