/**
 * 应急预案管理 — Web / 移动端共用逻辑（对齐 wb/am-emergency-plan.html）
 */
(function (global) {
  "use strict";

  function normalizeDeptValue(dept) {
    if (!dept) return "";
    var parts = String(dept).split("、");
    return parts[0] ? parts[0].trim() : dept;
  }

  function bootEmergencyPlanPage(options) {
    options = options || {};
    var isMobile = !!options.mobile;
    var deptSelect = options.deptSelect || global.__WHPlanDeptSelect || null;

    var rows = (global.WH_EMERGENCY_PLAN_ROWS || []).map(function (row) {
      return Object.assign({}, row);
    });
    var filteredRows = null;
    var lastRenderedList = [];
    var editingName = null;
    var pendingDeleteName = "";

    var listView = document.getElementById("plan-list-view");
    var detailView = document.getElementById("plan-detail-view");
    var formView = document.getElementById("plan-form-view");
    var mobileList = document.getElementById("plan-mobile-list");
    var detailBody = document.getElementById("plan-detail-body");
    var toastEl = document.getElementById("plan-toast");
    var tableBody = document.getElementById("plan-table-body");

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
      global.dispatchEvent(new Event("wh-plan-view-change"));
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

    function materialHref() {
      var query = "from=plan";
      if (isMobile) return "emergency-material.html?" + query;
      var base =
        typeof global.whPageHref === "function"
          ? global.whPageHref("wb/am-emergency-material.html")
          : "am-emergency-material.html";
      return base + (base.indexOf("?") >= 0 ? "&" + query : "?" + query);
    }

    function updateStats(list) {
      var data = list || getListSource();
      var depts = {};
      var names = {};
      var emergency = 0;
      data.forEach(function (row) {
        depts[row.dept] = true;
        names[row.name] = true;
        if (row.dept === "应急中心") emergency += 1;
      });
      var set = function (id, val) {
        var el = $(id);
        if (el) el.textContent = String(val);
      };
      set("stat-total", data.length);
      set("stat-dept", Object.keys(depts).length);
      set("stat-emergency", emergency);
      set("stat-types", Object.keys(names).length);
      var totalEl = $("table-total");
      if (totalEl) totalEl.textContent = String(data.length);
    }

    function rowMatchesSearch(row, q) {
      if (!q) return true;
      return row.name.indexOf(q) >= 0 || (row.remark && row.remark.indexOf(q) >= 0);
    }

    function readFilters() {
      return {
        dept: fieldVal("filter-dept"),
      };
    }

    function rowMatchesFilters(row, f, q) {
      if (q && !rowMatchesSearch(row, q)) return false;
      if (f.dept && row.dept !== f.dept) return false;
      return true;
    }

    function syncSearchClear() {
      var input = $("plan-search-trigger");
      var clearBtn = $("plan-search-clear");
      if (!input || !clearBtn) return;
      clearBtn.hidden = !(input.value || "").trim();
    }

    function getSearchQuery(qOverride) {
      if (typeof qOverride === "string") return qOverride;
      if (isMobile) {
        var input = $("plan-search-trigger");
        return input && input.value ? input.value.trim() : "";
      }
      return fieldVal("filter-name");
    }

    function applyFilter(qOverride, silent) {
      var q = getSearchQuery(qOverride);
      if (isMobile) {
        var input = $("plan-search-trigger");
        if (input && typeof qOverride === "string") input.value = qOverride;
      }
      var f = readFilters();
      var hasFilter = !!(q || f.dept);
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
      ["filter-dept", "filter-name"].forEach(function (id) {
        var el = $(id);
        if (!el) return;
        if (el.tagName === "SELECT") el.selectedIndex = 0;
        else el.value = "";
      });
      var sheet = $("plan-filter-sheet");
      if (sheet && global.WHProjectMobile && global.WHProjectMobile.syncPickersFromForm) {
        global.WHProjectMobile.syncPickersFromForm(sheet);
      }
      applyFilter("", true);
      if (isMobile) showToast("筛选条件已重置");
    }

    function clearSearch() {
      var input = $("plan-search-trigger");
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
        "<div><dt>应急部门</dt><dd>" +
        displayVal(row.dept) +
        "</dd></div>" +
        '<div class="mp-disease-detail-grid__full"><dt>备注</dt><dd>' +
        displayVal(row.remark) +
        "</dd></div></dl>"
      );
    }

    function renderCard(row, index) {
      return (
        '<article class="mp-project-card mp-plan-card" data-row-index="' +
        index +
        '">' +
        '<div class="mp-plan-card__title-row">' +
        '<h3 class="mp-project-card__title">' +
        esc(row.name) +
        "</h3>" +
        '<span class="mp-plan-dept-tag">' +
        esc(row.dept) +
        "</span></div>" +
        '<dl class="mp-project-card__meta mp-plan-card__meta">' +
        '<div class="mp-project-card__meta-full"><dt>备注</dt><dd>' +
        esc(row.remark || "—") +
        "</dd></div>" +
        "</dl>" +
        '<div class="mp-project-card__actions mp-plan-card__actions">' +
        '<button type="button" class="mp-project-action" data-action="plan-detail" data-index="' +
        index +
        '"><i class="fa-regular fa-eye"></i>详情</button>' +
        '<button type="button" class="mp-project-action" data-action="plan-edit" data-plan-name="' +
        esc(row.name) +
        '"><i class="fa-regular fa-pen-to-square"></i>编辑</button>' +
        '<button type="button" class="mp-project-action" data-action="view-material"><i class="fa-regular fa-boxes-stacked"></i>物资调配</button>' +
        '<button type="button" class="mp-project-action mp-project-action--danger" data-action="plan-delete" data-plan-name="' +
        esc(row.name) +
        '"><i class="fa-regular fa-trash-can"></i>删除</button>' +
        "</div></article>"
      );
    }

    function renderMobileList(list) {
      if (!mobileList) return;
      if (!list.length) {
        mobileList.innerHTML =
          '<div class="mp-project-empty"><i class="fa-solid fa-file-shield"></i><p>暂无应急预案</p></div>';
        return;
      }
      mobileList.innerHTML = list.map(renderCard).join("");
    }

    function renderWebTable(list) {
      if (!tableBody) return;
      if (!list.length) {
        tableBody.innerHTML =
          '<tr><td colspan="4" class="px-3 py-8 text-center text-slate-400">暂无应急预案</td></tr>';
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
            esc(row.remark) +
            "</td>" +
            '<td class="px-4 disease-col-actions"><div class="disease-op-actions">' +
            '<span class="plan-action text-amber-300" data-action="edit-plan" data-plan-name="' +
            esc(row.name) +
            '"><i class="fa-regular fa-pen-to-square"></i>编辑</span>' +
            '<span class="plan-action text-amber-300" data-action="view-material"><i class="fa-regular fa-boxes-stacked"></i>物资调配</span>' +
            '<span class="plan-action text-rose-300" data-action="delete-plan" data-plan-name="' +
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
      var titleEl = $("detail-plan-title");
      if (titleEl) titleEl.textContent = row.name + " · 应急预案详情";
      if (listView) listView.classList.add("hidden");
      if (formView) formView.classList.add("hidden");
      if (detailView) detailView.classList.remove("hidden");
      if (detailBody) detailBody.innerHTML = buildDetailHtml(row);
      dispatchViewChange();
    }

    function setFormTitle(text) {
      var el = $("plan-form-title");
      if (el) el.textContent = text;
    }

    function readDeptValue() {
      if (isMobile) return fieldVal("plan-dept");
      if (deptSelect && deptSelect.getValue) return deptSelect.getValue();
      return fieldVal("plan-dept");
    }

    function setDeptValue(val) {
      var hidden = $("plan-dept");
      if (hidden) hidden.value = val || "";
      if (deptSelect && deptSelect.setValue) deptSelect.setValue(val || "");
    }

    function loadForm(row) {
      $("plan-name").value = row ? row.name : "";
      setDeptValue(row ? normalizeDeptValue(row.dept) : "");
      $("plan-remark").value = row ? row.remark || "" : "";
      if (global.WHProjectMobile && global.WHProjectMobile.syncPickersFromForm) {
        global.WHProjectMobile.syncPickersFromForm(formView);
      }
    }

    function openForm(mode, planName) {
      var index = planName ? findRowIndex(planName) : -1;
      editingName = mode === "edit" && index > -1 ? planName : null;
      setFormTitle(mode === "edit" ? "编辑应急预案" : "新增应急预案");
      loadForm(index > -1 ? rows[index] : null);
      if (listView) listView.classList.add("hidden");
      if (detailView) detailView.classList.add("hidden");
      if (formView) formView.classList.remove("hidden");
      dispatchViewChange();
    }

    function readFormRow() {
      return {
        name: fieldVal("plan-name"),
        dept: readDeptValue(),
        remark: fieldVal("plan-remark") || "-",
      };
    }

    function savePlan() {
      var row = readFormRow();
      if (!row.name) {
        showToast("请完善必填项：名称");
        return;
      }
      if (!row.dept) {
        showToast("请选择应急部门");
        return;
      }
      if (editingName) {
        var editIndex = findRowIndex(editingName);
        if (editIndex > -1) rows[editIndex] = row;
      } else {
        if (rows.some(function (r) { return r.name === row.name; })) {
          showToast("预案名称已存在");
          return;
        }
        rows.unshift(row);
      }
      var wasEdit = !!editingName;
      editingName = null;
      showToast(wasEdit ? "应急预案已更新" : "应急预案已新增");
      if (isMobile) showList();
      else closeWebModal();
      applyFilter(undefined, true);
    }

    function getConfirmMask() {
      return $("plan-confirm-mask") || $("confirm-mask");
    }

    function openDeleteConfirm(planName) {
      pendingDeleteName = planName || "";
      var mask = getConfirmMask();
      if (mask) {
        if (mask.classList.contains("mp-confirm-mask")) mask.classList.add("is-open");
        else mask.classList.add("show");
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

    function openWebModal(mode, planName) {
      var mask = $("plan-modal-mask");
      var titleEl = $("plan-modal-title");
      if (!mask) return;
      if (global.WHSearchSelect && WHSearchSelect.closeAll) WHSearchSelect.closeAll(null);
      var index = planName ? findRowIndex(planName) : -1;
      editingName = mode === "edit" && index > -1 ? planName : null;
      if (titleEl) titleEl.textContent = mode === "edit" ? "编辑应急预案" : "新增应急预案";
      loadForm(index > -1 ? rows[index] : null);
      mask.classList.add("show");
    }

    function closeWebModal() {
      var mask = $("plan-modal-mask");
      if (mask) mask.classList.remove("show");
      editingName = null;
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
      var mask = $("plan-detail-mask");
      var body = $("plan-detail-body-web") || $("plan-detail-body");
      var sub = $("plan-detail-subtitle");
      if (!mask || !body) return;
      if (sub) sub.textContent = row.name || "应急预案详情";
      body.innerHTML =
        '<div class="plan-form-grid">' +
        '<label class="plan-form-item"><span class="plan-form-label">名称：</span>' +
        webDetailValue(row.name) +
        "</label>" +
        '<label class="plan-form-item"><span class="plan-form-label">应急部门：</span>' +
        webDetailValue(row.dept) +
        "</label>" +
        '<label class="plan-form-item"><span class="plan-form-label">备注：</span>' +
        webDetailValue(row.remark, true) +
        "</label></div>";
      mask.classList.add("show");
      mask.setAttribute("aria-hidden", "false");
    }

    function closeWebDetail() {
      var mask = $("plan-detail-mask");
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
        var planName = trigger.getAttribute("data-plan-name");

        if (action === "open-plan-search") {
          event.preventDefault();
          global.location.href = "emergency-plan-search.html";
          return;
        }
        if (action === "open-plan-filter") {
          var sheet = $("plan-filter-sheet");
          if (sheet) {
            sheet.classList.add("is-open");
            sheet.setAttribute("aria-hidden", "false");
          }
          return;
        }
        if (action === "close-plan-filter") {
          var closeSheet = $("plan-filter-sheet");
          if (closeSheet) {
            closeSheet.classList.remove("is-open");
            closeSheet.setAttribute("aria-hidden", "true");
          }
          return;
        }
        if (action === "search-plan") {
          var filterSheet = $("plan-filter-sheet");
          if (filterSheet) {
            filterSheet.classList.remove("is-open");
            filterSheet.setAttribute("aria-hidden", "true");
          }
          applyFilter();
          return;
        }
        if (action === "reset-plan-filter") {
          resetFilters();
          return;
        }
        if (action === "plan-search-clear") {
          clearSearch();
          return;
        }
        if (action === "new-plan") {
          if (isMobile) openForm("new");
          else openWebModal("new");
          return;
        }
        if (action === "plan-detail") {
          showDetail(index);
          return;
        }
        if (action === "plan-edit" || action === "edit-plan") {
          if (isMobile) openForm("edit", planName);
          else openWebModal("edit", planName);
          return;
        }
        if (action === "view-material") {
          global.location.href = materialHref();
          return;
        }
        if (action === "plan-delete" || action === "delete-plan") {
          openDeleteConfirm(planName);
          return;
        }
        if (action === "cancel-plan-form") {
          showList();
          return;
        }
        if (action === "save-plan-form" || action === "save-plan") {
          savePlan();
          return;
        }
        if (action === "close-plan-modal") {
          closeWebModal();
          return;
        }
        if (action === "close-plan-detail") {
          if (isMobile) showList();
          else closeWebDetail();
          return;
        }
        if (action === "plan-confirm-cancel" || action === "cancel-plan-delete") {
          closeDeleteConfirm();
          return;
        }
        if (action === "plan-confirm-ok" || action === "confirm-plan-delete") {
          confirmDelete();
          return;
        }
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

      var detailMask = $("plan-detail-mask");
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
    }

    function setupWebRowClick() {
      if (isMobile || !tableBody) return;
      if (!global.WHTableRowClick) {
        setTimeout(setupWebRowClick, 40);
        return;
      }
      WHTableRowClick.bindById("plan-table-body", {
        getRows: function () { return getListSource(); },
        onOpen: function (row, index) { openWebDetail(index); },
      });
    }

    bindEvents();
    renderList();
    initFromQuery();
    syncSearchClear();
    setupWebRowClick();

    global.WHEmergencyPlanPage.showList = showList;
  }

  global.WHEmergencyPlanPage = {
    boot: bootEmergencyPlanPage,
    normalizeDeptValue: normalizeDeptValue,
  };
})(window);
