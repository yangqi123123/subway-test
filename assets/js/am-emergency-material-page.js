/**
 * 应急物资管理 — Web / 移动端共用逻辑（对齐 wb/am-emergency-material.html）
 */
(function (global) {
  "use strict";

  function rowKey(row) {
    return [row.name, row.model, row.warehouse].join("\u0001");
  }

  function bootEmergencyMaterialPage(options) {
    options = options || {};
    var isMobile = !!options.mobile;

    var allRows = (global.WH_EMERGENCY_MATERIAL_ROWS || []).map(function (row) {
      return Object.assign({}, row);
    });

    var currentWarehouse = "南湖应急仓";
    var backFromPlan = false;
    try {
      var bootParams = new URLSearchParams(global.location.search);
      currentWarehouse = bootParams.get("warehouse") || currentWarehouse;
      backFromPlan = bootParams.get("from") === "plan";
    } catch (e) {
      /* ignore */
    }

    function warehouseRows() {
      return allRows.filter(function (row) {
        return row.warehouse === currentWarehouse;
      });
    }

    var rows = warehouseRows();
    var filteredRows = null;
    var lastRenderedList = [];
    var editingKey = null;
    var pendingDeleteIndex = -1;

    var listView = document.getElementById("material-list-view");
    var detailView = document.getElementById("material-detail-view");
    var formView = document.getElementById("material-form-view");
    var mobileList = document.getElementById("material-mobile-list");
    var detailBody = document.getElementById("material-detail-body");
    var toastEl = document.getElementById("material-toast");
    var tableBody = document.getElementById("material-table-body");
    var warehouseSubtitle = document.getElementById("material-warehouse-subtitle");

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
      global.dispatchEvent(new Event("wh-material-view-change"));
    }

    function fieldVal(id) {
      var el = $(id);
      return el ? String(el.value || "").trim() : "";
    }

    function getListSource() {
      return filteredRows !== null ? filteredRows : rows;
    }

    function syncWarehouseSubtitle() {
      if (!warehouseSubtitle) return;
      warehouseSubtitle.textContent = isMobile
        ? "所属仓库：" + currentWarehouse
        : "所属仓库：" + currentWarehouse;
    }

    function findAllRowIndex(row) {
      return allRows.findIndex(function (item) {
        return item.name === row.name && item.model === row.model && item.warehouse === row.warehouse;
      });
    }

    function refreshWarehouseRows() {
      rows = warehouseRows();
      if (filteredRows !== null) {
        var f = readFilters();
        var q = getSearchQuery();
        filteredRows = rows.filter(function (row) {
          return rowMatchesFilters(row, f, q);
        });
      }
    }

    function updateStats(list) {
      var data = list || getListSource();
      var models = {};
      var qtySum = 0;
      var remarkCount = 0;
      data.forEach(function (row) {
        models[row.model] = true;
        var n = parseInt(row.qty, 10);
        if (!isNaN(n)) qtySum += n;
        if (row.remark) remarkCount += 1;
      });
      var set = function (id, val) {
        var el = $(id);
        if (el) el.textContent = String(val);
      };
      set("stat-total", data.length);
      set("stat-models", Object.keys(models).length);
      set("stat-qty", qtySum);
      set("stat-remark", remarkCount);
      var totalEl = $("material-table-total");
      if (totalEl) totalEl.textContent = String(data.length);
    }

    function rowMatchesSearch(row, q) {
      if (!q) return true;
      return row.name.indexOf(q) >= 0;
    }

    function readFilters() {
      return {
        model: fieldVal("filter-model"),
      };
    }

    function rowMatchesFilters(row, f, q) {
      if (q && !rowMatchesSearch(row, q)) return false;
      if (f.model && row.model.indexOf(f.model) === -1) return false;
      return true;
    }

    function syncSearchClear() {
      var input = $("material-search-trigger");
      var clearBtn = $("material-search-clear");
      if (!input || !clearBtn) return;
      clearBtn.hidden = !(input.value || "").trim();
    }

    function getSearchQuery(qOverride) {
      if (typeof qOverride === "string") return qOverride;
      if (isMobile) {
        var input = $("material-search-trigger");
        return input && input.value ? input.value.trim() : "";
      }
      return fieldVal("filter-name");
    }

    function applyFilter(qOverride, silent) {
      var q = getSearchQuery(qOverride);
      if (isMobile) {
        var input = $("material-search-trigger");
        if (input && typeof qOverride === "string") input.value = qOverride;
      }
      var f = readFilters();
      var hasFilter = !!(q || f.model);
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
      ["filter-model", "filter-name"].forEach(function (id) {
        var el = $(id);
        if (!el) return;
        el.value = "";
      });
      var sheet = $("material-filter-sheet");
      if (sheet && global.WHProjectMobile && global.WHProjectMobile.syncPickersFromForm) {
        global.WHProjectMobile.syncPickersFromForm(sheet);
      }
      applyFilter("", true);
      if (isMobile) showToast("筛选条件已重置");
    }

    function clearSearch() {
      var input = $("material-search-trigger");
      if (input) input.value = "";
      var nameFilter = $("filter-name");
      if (nameFilter) nameFilter.value = "";
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
        "<div><dt>型号</dt><dd>" +
        displayVal(row.model) +
        "</dd></div>" +
        "<div><dt>数量</dt><dd>" +
        displayVal(row.qty) +
        "</dd></div>" +
        "<div><dt>所属仓库</dt><dd>" +
        displayVal(row.warehouse) +
        "</dd></div>" +
        '<div class="mp-disease-detail-grid__full"><dt>备注</dt><dd>' +
        displayVal(row.remark) +
        "</dd></div></dl>"
      );
    }

    function renderCard(row, index) {
      return (
        '<article class="mp-project-card mp-material-card" data-row-index="' +
        index +
        '">' +
        '<div class="mp-project-card__head"><span class="mp-material-model-tag">' +
        esc(row.model) +
        "</span>" +
        '<span class="mp-material-qty-tag">' +
        esc(row.qty) +
        " 件</span></div>" +
        '<h3 class="mp-project-card__title">' +
        esc(row.name) +
        "</h3>" +
        '<dl class="mp-project-card__meta mp-material-card__meta">' +
        "<div><dt>所属仓库</dt><dd>" +
        esc(row.warehouse) +
        "</dd></div>" +
        '<div class="mp-project-card__meta-full"><dt>备注</dt><dd>' +
        esc(row.remark || "—") +
        "</dd></div>" +
        "</dl>" +
        '<div class="mp-project-card__actions mp-material-card__actions">' +
        '<button type="button" class="mp-project-action" data-action="material-detail" data-index="' +
        index +
        '"><i class="fa-regular fa-eye"></i>详情</button>' +
        '<button type="button" class="mp-project-action" data-action="material-edit" data-index="' +
        index +
        '"><i class="fa-regular fa-pen-to-square"></i>编辑</button>' +
        '<button type="button" class="mp-project-action mp-project-action--danger" data-action="material-delete" data-index="' +
        index +
        '"><i class="fa-regular fa-trash-can"></i>删除</button>' +
        "</div></article>"
      );
    }

    function renderMobileList(list) {
      if (!mobileList) return;
      if (!list.length) {
        mobileList.innerHTML =
          '<div class="mp-project-empty"><i class="fa-solid fa-boxes-stacked"></i><p>暂无应急物资</p></div>';
        return;
      }
      mobileList.innerHTML = list.map(renderCard).join("");
    }

    function renderWebTable(list) {
      if (!tableBody) return;
      if (!list.length) {
        tableBody.innerHTML =
          '<tr><td colspan="6" class="px-3 py-8 text-center text-slate-400">暂无应急物资</td></tr>';
        return;
      }
      tableBody.innerHTML = list
        .map(function (row, index) {
          var remark = row.remark || "—";
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
            esc(row.model) +
            "</td>" +
            '<td class="px-4">' +
            esc(row.qty) +
            "</td>" +
            '<td class="px-4">' +
            esc(row.warehouse) +
            "</td>" +
            '<td class="px-4 max-w-[220px] truncate" title="' +
            esc(remark) +
            '">' +
            esc(remark) +
            "</td>" +
            '<td class="px-4 disease-col-actions"><div class="disease-op-actions">' +
            '<span class="material-action text-amber-300" data-action="edit-material" data-index="' +
            index +
            '"><i class="fa-regular fa-pen-to-square"></i>编辑</span>' +
            '<span class="material-action text-rose-300" data-action="delete-material" data-index="' +
            index +
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
      editingKey = null;
      dispatchViewChange();
    }

    function showDetail(index) {
      var row = lastRenderedList[index];
      if (!row) return;
      var titleEl = $("detail-material-title");
      if (titleEl) titleEl.textContent = row.name + " · 应急物资详情";
      if (listView) listView.classList.add("hidden");
      if (formView) formView.classList.add("hidden");
      if (detailView) detailView.classList.remove("hidden");
      if (detailBody) detailBody.innerHTML = buildDetailHtml(row);
      dispatchViewChange();
    }

    function setFormTitle(text) {
      var el = $("material-form-title");
      if (el) el.textContent = text;
    }

    function loadForm(row) {
      $("material-name").value = row ? row.name : "";
      $("material-model").value = row ? row.model : "";
      $("material-qty").value = row ? row.qty : "";
      $("material-warehouse").value = row ? row.warehouse : currentWarehouse;
      $("material-remark").value = row ? row.remark || "" : "";
    }

    function openForm(mode, index) {
      var row = typeof index === "number" && index > -1 ? lastRenderedList[index] : null;
      editingKey = mode === "edit" && row ? rowKey(row) : null;
      setFormTitle(mode === "edit" ? "编辑应急物资" : "新增应急物资");
      loadForm(row);
      if (listView) listView.classList.add("hidden");
      if (detailView) detailView.classList.add("hidden");
      if (formView) formView.classList.remove("hidden");
      dispatchViewChange();
    }

    function readFormRow() {
      return {
        name: fieldVal("material-name"),
        model: fieldVal("material-model"),
        qty: fieldVal("material-qty"),
        warehouse: fieldVal("material-warehouse") || currentWarehouse,
        remark: fieldVal("material-remark"),
      };
    }

    function saveMaterial() {
      var row = readFormRow();
      if (!row.name || !row.model || !row.qty) {
        showToast("请完善必填项：名称、型号、数量");
        return;
      }
      if (editingKey) {
        var oldIndex = allRows.findIndex(function (item) {
          return rowKey(item) === editingKey;
        });
        if (oldIndex > -1) allRows[oldIndex] = row;
      } else {
        allRows.unshift(row);
      }
      var wasEdit = !!editingKey;
      editingKey = null;
      refreshWarehouseRows();
      showToast(wasEdit ? "应急物资已更新" : "应急物资已新增");
      if (isMobile) showList();
      else closeWebModal();
      applyFilter(undefined, true);
    }

    function getConfirmMask() {
      return $("material-confirm-mask") || $("confirm-mask");
    }

    function openDeleteConfirm(index) {
      pendingDeleteIndex = typeof index === "number" ? index : -1;
      var mask = getConfirmMask();
      if (mask) {
        if (mask.classList.contains("mp-confirm-mask")) mask.classList.add("is-open");
        else mask.classList.add("show");
        mask.setAttribute("aria-hidden", "false");
      }
    }

    function closeDeleteConfirm() {
      pendingDeleteIndex = -1;
      var mask = getConfirmMask();
      if (mask) {
        mask.classList.remove("is-open");
        mask.classList.remove("show");
        mask.setAttribute("aria-hidden", "true");
      }
    }

    function confirmDelete() {
      if (pendingDeleteIndex > -1) {
        var removed = getListSource()[pendingDeleteIndex];
        if (removed) {
          var removeIdx = findAllRowIndex(removed);
          if (removeIdx > -1) allRows.splice(removeIdx, 1);
        }
      }
      closeDeleteConfirm();
      refreshWarehouseRows();
      showToast("已删除");
      applyFilter(undefined, true);
    }

    function openWebModal(mode, index) {
      var mask = $("material-modal-mask");
      var titleEl = $("material-modal-title");
      if (!mask) return;
      var row = typeof index === "number" && index > -1 ? getListSource()[index] : null;
      editingKey = mode === "edit" && row ? rowKey(row) : null;
      if (titleEl) titleEl.textContent = mode === "edit" ? "编辑应急物资" : "新增应急物资";
      loadForm(row);
      mask.classList.add("show");
    }

    function closeWebModal() {
      var mask = $("material-modal-mask");
      if (mask) mask.classList.remove("show");
      editingKey = null;
    }

    function webDetailValue(value, multiline) {
      var text = value === undefined || value === null || value === "" ? "—" : String(value);
      var cls =
        "detail-value" +
        (text === "—" ? " detail-value--empty" : "") +
        (multiline ? " detail-value--multiline" : "");
      return '<div class="' + cls + '">' + esc(text) + "</div>";
    }

    function openWebDetail(index) {
      var row = getListSource()[index];
      if (!row) return;
      var mask = $("material-detail-mask");
      var body = $("material-detail-body");
      var sub = $("material-detail-subtitle");
      if (!mask || !body) return;
      if (sub) sub.textContent = row.name || "应急物资详情";
      body.innerHTML =
        '<div class="material-form-grid">' +
        '<label class="material-form-item"><span class="material-form-label">名称：</span>' +
        webDetailValue(row.name) +
        "</label>" +
        '<label class="material-form-item"><span class="material-form-label">型号：</span>' +
        webDetailValue(row.model) +
        "</label>" +
        '<label class="material-form-item"><span class="material-form-label">数量：</span>' +
        webDetailValue(row.qty) +
        "</label>" +
        '<label class="material-form-item"><span class="material-form-label">所属仓库：</span>' +
        webDetailValue(row.warehouse) +
        "</label>" +
        '<label class="material-form-item material-form-item--textarea"><span class="material-form-label">备注：</span>' +
        webDetailValue(row.remark, true) +
        "</label></div>";
      mask.classList.add("show");
      mask.setAttribute("aria-hidden", "false");
    }

    function closeWebDetail() {
      var mask = $("material-detail-mask");
      if (mask) {
        mask.classList.remove("show");
        mask.setAttribute("aria-hidden", "true");
      }
    }

    function pageBackHref() {
      if (backFromPlan) {
        if (isMobile) return "emergency-plan.html";
        return typeof global.whPageHref === "function"
          ? global.whPageHref("wb/am-emergency-plan.html")
          : "am-emergency-plan.html";
      }
      if (isMobile) return "emergency-warehouse.html";
      return typeof global.whPageHref === "function"
        ? global.whPageHref("wb/am-emergency-warehouse.html")
        : "am-emergency-warehouse.html";
    }

    function bindEvents() {
      document.addEventListener("click", function (event) {
        var trigger = event.target.closest("[data-action]");
        if (!trigger) return;
        var action = trigger.getAttribute("data-action");
        var index = trigger.hasAttribute("data-index") ? Number(trigger.getAttribute("data-index")) : -1;

        if (action === "back-warehouse") {
          global.location.href = pageBackHref();
          return;
        }
        if (action === "open-material-search") {
          event.preventDefault();
          global.location.href =
            "emergency-material-search.html?warehouse=" + encodeURIComponent(currentWarehouse);
          return;
        }
        if (action === "open-material-filter") {
          var sheet = $("material-filter-sheet");
          if (sheet) {
            sheet.classList.add("is-open");
            sheet.setAttribute("aria-hidden", "false");
          }
          return;
        }
        if (action === "close-material-filter") {
          var closeSheet = $("material-filter-sheet");
          if (closeSheet) {
            closeSheet.classList.remove("is-open");
            closeSheet.setAttribute("aria-hidden", "true");
          }
          return;
        }
        if (action === "search-material") {
          var filterSheet = $("material-filter-sheet");
          if (filterSheet) {
            filterSheet.classList.remove("is-open");
            filterSheet.setAttribute("aria-hidden", "true");
          }
          applyFilter();
          return;
        }
        if (action === "reset-material-filter") {
          resetFilters();
          return;
        }
        if (action === "material-search-clear") {
          clearSearch();
          return;
        }
        if (action === "new-material") {
          if (isMobile) openForm("new");
          else openWebModal("new");
          return;
        }
        if (action === "material-detail") {
          showDetail(index);
          return;
        }
        if (action === "material-edit" || action === "edit-material") {
          if (isMobile) openForm("edit", index);
          else openWebModal("edit", index);
          return;
        }
        if (action === "material-delete" || action === "delete-material") {
          openDeleteConfirm(index);
          return;
        }
        if (action === "cancel-material-form") {
          showList();
          return;
        }
        if (action === "save-material-form" || action === "save-material") {
          saveMaterial();
          return;
        }
        if (action === "close-material-modal") {
          closeWebModal();
          return;
        }
        if (action === "close-material-detail") {
          if (isMobile) showList();
          else closeWebDetail();
          return;
        }
        if (action === "material-confirm-cancel" || action === "cancel-material-delete") {
          closeDeleteConfirm();
          return;
        }
        if (action === "material-confirm-ok" || action === "confirm-material-delete") {
          confirmDelete();
          return;
        }
      });

      var webSearchBtn = $("btn-search-material");
      var webResetBtn = $("btn-reset-material");
      if (webSearchBtn) webSearchBtn.addEventListener("click", function () { applyFilter(); });
      if (webResetBtn) webResetBtn.addEventListener("click", resetFilters);

      var filterName = $("filter-name");
      if (filterName) {
        filterName.addEventListener("keydown", function (e) {
          if (e.key === "Enter") applyFilter(filterName.value.trim());
        });
      }

      var detailMask = $("material-detail-mask");
      if (detailMask) {
        detailMask.addEventListener("click", function (e) {
          if (e.target === detailMask) closeWebDetail();
        });
      }

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
      if (backFromPlan) {
        var sub = warehouseSubtitle;
        if (sub) sub.textContent = "应急预案 · 物资调配清单";
        var backBtn = document.querySelector('[data-action="back-warehouse"]');
        if (backBtn) backBtn.setAttribute("title", "返回应急预案列表");
        var pageTitle = document.querySelector("#page-root h1");
        if (pageTitle) pageTitle.textContent = "物资调配";
      }
    }

    function setupWebRowClick() {
      if (isMobile || !tableBody) return;
      if (!global.WHTableRowClick) {
        setTimeout(setupWebRowClick, 40);
        return;
      }
      WHTableRowClick.bindById("material-table-body", {
        getRows: function () { return getListSource(); },
        onOpen: function (row, index) { openWebDetail(index); },
      });
    }

    syncWarehouseSubtitle();
    bindEvents();
    renderList();
    initFromQuery();
    syncSearchClear();
    setupWebRowClick();

    global.WHEmergencyMaterialPage.showList = showList;
    global.WHEmergencyMaterialPage.getCurrentWarehouse = function () {
      return currentWarehouse;
    };
  }

  global.WHEmergencyMaterialPage = {
    boot: bootEmergencyMaterialPage,
  };
})(window);
