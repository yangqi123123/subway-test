/**
 * 应急人员管理 — Web / 移动端共用逻辑（对齐 wb/am-emergency-staff.html）
 */
(function (global) {
  "use strict";

  var LINE_OPTIONS = ["2号线", "5号线", "7号线", "11号线"];
  var FILTER_DEPT_OPTIONS = ["应急中心", "巡检部", "调度部"];

  function bootEmergencyStaffPage(options) {
    options = options || {};
    var isMobile = !!options.mobile;
    var deptSelect = options.deptSelect || global.__WHStaffDeptSelect || null;

    var rows = (global.WH_EMERGENCY_STAFF_ROWS || []).map(function (row) {
      return Object.assign({}, row);
    });
    var filteredRows = null;
    var lastRenderedList = [];
    var editingNo = null;
    var pendingDeleteNo = "";

    var listView = document.getElementById("staff-list-view");
    var detailView = document.getElementById("staff-detail-view");
    var formView = document.getElementById("staff-form-view");
    var mobileList = document.getElementById("staff-mobile-list");
    var detailBody = document.getElementById("staff-detail-body");
    var toastEl = document.getElementById("staff-toast");
    var tableBody = document.getElementById("staff-table-body");

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
      global.dispatchEvent(new Event("wh-staff-view-change"));
    }

    function fieldVal(id) {
      var el = $(id);
      return el ? String(el.value || "").trim() : "";
    }

    function getListSource() {
      return filteredRows !== null ? filteredRows : rows;
    }

    function findRowIndex(no) {
      return rows.findIndex(function (row) {
        return row.no === no;
      });
    }

    function updateStats(list) {
      var data = list || getListSource();
      var depts = {};
      var lines = {};
      var emergency = 0;
      data.forEach(function (row) {
        depts[row.dept] = true;
        lines[row.line] = true;
        if (row.dept === "应急中心") emergency += 1;
      });
      var set = function (id, val) {
        var el = $(id);
        if (el) el.textContent = String(val);
      };
      set("stat-total", rows.length);
      set("stat-dept", Object.keys(depts).length);
      set("stat-lines", Object.keys(lines).length);
      set("stat-emergency", emergency);
      var totalEl = $("table-total");
      if (totalEl) totalEl.textContent = String(data.length);
    }

    function rowMatchesSearch(row, q) {
      if (!q) return true;
      if (isMobile) return row.name.indexOf(q) >= 0 || row.no.indexOf(q) >= 0;
      return row.name.indexOf(q) >= 0;
    }

    function readFilters() {
      return {
        dept: fieldVal("filter-dept"),
        no: fieldVal("filter-no"),
        line: fieldVal("filter-line"),
      };
    }

    function rowMatchesFilters(row, f, q) {
      if (q && !rowMatchesSearch(row, q)) return false;
      if (f.dept && row.dept !== f.dept) return false;
      if (f.no && row.no.indexOf(f.no) === -1) return false;
      if (f.line && row.line !== f.line) return false;
      return true;
    }

    function syncSearchClear() {
      var input = $("staff-search-trigger");
      var clearBtn = $("staff-search-clear");
      if (!input || !clearBtn) return;
      clearBtn.hidden = !(input.value || "").trim();
    }

    function getSearchQuery(qOverride) {
      if (typeof qOverride === "string") return qOverride;
      if (isMobile) {
        var input = $("staff-search-trigger");
        return input && input.value ? input.value.trim() : "";
      }
      var nameFilter = $("filter-name");
      return nameFilter ? nameFilter.value.trim() : "";
    }

    function applyFilter(qOverride, silent) {
      var q = getSearchQuery(qOverride);
      if (isMobile) {
        var input = $("staff-search-trigger");
        if (input && typeof qOverride === "string") input.value = qOverride;
      }
      var f = readFilters();
      var hasFilter = !!(q || f.dept || f.no || f.line);
      filteredRows = hasFilter
        ? rows.filter(function (row) {
            return rowMatchesFilters(row, f, q);
          })
        : null;
      renderList();
      syncSearchClear();
      if (!silent) showToast("已按当前条件筛选");
    }

    function resetFilters() {
      if (isMobile) {
        ["filter-dept", "filter-no", "filter-line"].forEach(function (id) {
          var el = $(id);
          if (!el) return;
          if (el.tagName === "SELECT") el.selectedIndex = 0;
          else el.value = "";
        });
      } else {
        ["filter-name", "filter-dept", "filter-no", "filter-line"].forEach(function (id) {
          var el = $(id);
          if (!el) return;
          if (el.tagName === "SELECT") el.selectedIndex = 0;
          else el.value = "";
        });
      }
      var sheet = $("staff-filter-sheet");
      if (sheet && global.WHProjectMobile && global.WHProjectMobile.syncPickersFromForm) {
        global.WHProjectMobile.syncPickersFromForm(sheet);
      }
      applyFilter("", true);
      showToast("筛选条件已重置");
    }

    function clearSearch() {
      var input = $("staff-search-trigger");
      if (input) input.value = "";
      applyFilter("", true);
    }

    function displayVal(value) {
      return esc(value === undefined || value === null || value === "" ? "—" : value);
    }

    function buildDetailHtml(row) {
      return (
        '<dl class="mp-disease-detail-grid">' +
        "<div><dt>姓名</dt><dd>" +
        displayVal(row.name) +
        "</dd></div>" +
        "<div><dt>部门</dt><dd>" +
        displayVal(row.dept) +
        "</dd></div>" +
        "<div><dt>工号</dt><dd>" +
        displayVal(row.no) +
        "</dd></div>" +
        "<div><dt>岗位</dt><dd>" +
        displayVal(row.post) +
        "</dd></div>" +
        "<div><dt>所属线路</dt><dd>" +
        displayVal(row.line) +
        "</dd></div>" +
        "<div><dt>联系方式</dt><dd>" +
        displayVal(row.phone) +
        "</dd></div>" +
        '<div class="mp-disease-detail-grid__full"><dt>常驻地址</dt><dd>' +
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
        '<article class="mp-project-card mp-staff-card" data-row-index="' +
        index +
        '">' +
        '<div class="mp-project-card__head"><span class="mp-project-card__id">' +
        esc(row.no) +
        "</span>" +
        '<span class="mp-staff-dept-tag">' +
        esc(row.dept) +
        "</span></div>" +
        '<h3 class="mp-project-card__title">' +
        esc(row.name) +
        "</h3>" +
        '<dl class="mp-project-card__meta mp-staff-card__meta">' +
        "<div><dt>岗位</dt><dd>" +
        esc(row.post) +
        "</dd></div>" +
        "<div><dt>所属线路</dt><dd>" +
        esc(row.line) +
        "</dd></div>" +
        '<div class="mp-project-card__meta-full"><dt>联系方式</dt><dd>' +
        esc(row.phone) +
        "</dd></div>" +
        '<div class="mp-project-card__meta-full"><dt>常驻地址</dt><dd>' +
        esc(row.address) +
        "</dd></div>" +
        "</dl>" +
        '<div class="mp-project-card__actions mp-staff-card__actions">' +
        '<button type="button" class="mp-project-action" data-action="staff-detail" data-index="' +
        index +
        '"><i class="fa-regular fa-eye"></i>详情</button>' +
        '<button type="button" class="mp-project-action" data-action="staff-edit" data-staff-no="' +
        esc(row.no) +
        '"><i class="fa-regular fa-pen-to-square"></i>编辑</button>' +
        '<button type="button" class="mp-project-action mp-project-action--danger" data-action="staff-delete" data-staff-no="' +
        esc(row.no) +
        '"><i class="fa-regular fa-trash-can"></i>删除</button>' +
        "</div></article>"
      );
    }

    function renderMobileList(list) {
      if (!mobileList) return;
      if (!list.length) {
        mobileList.innerHTML =
          '<div class="mp-project-empty"><i class="fa-solid fa-user-shield"></i><p>暂无应急人员</p></div>';
        return;
      }
      mobileList.innerHTML = list.map(renderCard).join("");
    }

    function renderWebTable(list) {
      if (!tableBody) return;
      if (!list.length) {
        tableBody.innerHTML =
          '<tr><td colspan="11" class="px-3 py-8 text-center text-slate-400">暂无应急人员</td></tr>';
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
            esc(row.no) +
            "</td>" +
            '<td class="px-4">' +
            esc(row.post) +
            "</td>" +
            '<td class="px-4">' +
            esc(row.line) +
            "</td>" +
            '<td class="px-4">' +
            esc(row.phone) +
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
            esc(row.remark) +
            "</td>" +
            '<td class="px-4 disease-col-actions"><div class="disease-op-actions">' +
            '<span class="staff-action text-amber-300" data-action="edit-staff" data-staff-no="' +
            esc(row.no) +
            '"><i class="fa-regular fa-pen-to-square"></i>编辑</span>' +
            '<span class="staff-action text-rose-300" data-action="delete-staff" data-staff-no="' +
            esc(row.no) +
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
      editingNo = null;
      dispatchViewChange();
    }

    function showDetail(index) {
      var row = lastRenderedList[index];
      if (!row) return;
      var titleEl = $("detail-staff-title");
      if (titleEl) titleEl.textContent = row.name + " · 应急人员详情";
      if (listView) listView.classList.add("hidden");
      if (formView) formView.classList.add("hidden");
      if (detailView) detailView.classList.remove("hidden");
      if (detailBody) detailBody.innerHTML = buildDetailHtml(row);
      dispatchViewChange();
    }

    function setFormTitle(text) {
      var el = $("staff-form-title");
      if (el) el.textContent = text;
    }

    function readDeptValue() {
      if (isMobile) return fieldVal("staff-dept");
      if (deptSelect && deptSelect.getValue) return deptSelect.getValue();
      return fieldVal("staff-dept");
    }

    function setDeptValue(val) {
      var hidden = $("staff-dept");
      if (hidden) hidden.value = val || "";
      if (deptSelect && deptSelect.setValue) deptSelect.setValue(val || "");
    }

    function loadForm(row) {
      $("staff-name").value = row ? row.name : "";
      setDeptValue(row ? row.dept : "");
      $("staff-no").value = row ? row.no : "";
      $("staff-post").value = row ? row.post : "";
      $("staff-line").value = row ? row.line : "";
      $("staff-phone").value = row ? row.phone : "";
      $("staff-address").value = row ? row.address : "";
      $("staff-lng").value = row ? row.lng : "";
      $("staff-lat").value = row ? row.lat : "";
      $("staff-remark").value = row ? row.remark : "";
      if (global.WHProjectMobile && global.WHProjectMobile.syncPickersFromForm) {
        global.WHProjectMobile.syncPickersFromForm(formView);
      }
    }

    function openForm(mode, staffNo) {
      var index = staffNo ? findRowIndex(staffNo) : -1;
      editingNo = mode === "edit" && index > -1 ? staffNo : null;
      setFormTitle(mode === "edit" ? "编辑应急人员" : "新增应急人员");
      loadForm(index > -1 ? rows[index] : null);
      if (listView) listView.classList.add("hidden");
      if (detailView) detailView.classList.add("hidden");
      if (formView) formView.classList.remove("hidden");
      dispatchViewChange();
    }

    function readFormRow() {
      return {
        name: fieldVal("staff-name"),
        dept: readDeptValue(),
        no: fieldVal("staff-no"),
        post: fieldVal("staff-post") || "-",
        line: fieldVal("staff-line") || LINE_OPTIONS[0],
        phone: fieldVal("staff-phone"),
        address: fieldVal("staff-address") || "-",
        lng: fieldVal("staff-lng") || "-",
        lat: fieldVal("staff-lat") || "-",
        remark: fieldVal("staff-remark") || "-",
      };
    }

    function saveStaff() {
      var row = readFormRow();
      if (!row.name || !row.no || !row.phone) {
        showToast("请完善必填项：姓名、工号、联系方式");
        return;
      }
      if (!row.dept) {
        showToast("请选择部门");
        return;
      }
      if (editingNo) {
        var editIndex = findRowIndex(editingNo);
        if (editIndex > -1) rows[editIndex] = row;
      } else {
        if (rows.some(function (r) { return r.no === row.no; })) {
          showToast("工号已存在");
          return;
        }
        rows.unshift(row);
      }
      showToast(editingNo ? "应急人员已更新" : "应急人员已新增");
      editingNo = null;
      if (isMobile) showList();
      else closeWebModal();
      applyFilter(undefined, true);
    }

    function getConfirmMask() {
      return $("staff-confirm-mask") || $("confirm-mask");
    }

    function openDeleteConfirm(staffNo) {
      pendingDeleteNo = staffNo || "";
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
      pendingDeleteNo = "";
      var mask = getConfirmMask();
      if (mask) {
        mask.classList.remove("is-open");
        mask.classList.remove("show");
        mask.setAttribute("aria-hidden", "true");
      }
    }

    function confirmDelete() {
      var idx = pendingDeleteNo ? findRowIndex(pendingDeleteNo) : -1;
      if (idx > -1) rows.splice(idx, 1);
      closeDeleteConfirm();
      showToast("已删除");
      applyFilter(undefined, true);
    }

    function openWebModal(mode, staffNo) {
      var mask = $("staff-modal-mask");
      var titleEl = $("staff-modal-title");
      if (!mask) return;
      if (global.WHSearchSelect && WHSearchSelect.closeAll) WHSearchSelect.closeAll(null);
      var index = staffNo ? findRowIndex(staffNo) : -1;
      editingNo = mode === "edit" && index > -1 ? staffNo : null;
      if (titleEl) titleEl.textContent = mode === "edit" ? "编辑应急人员" : "新增应急人员";
      loadForm(index > -1 ? rows[index] : null);
      mask.classList.add("show");
    }

    function closeWebModal() {
      var mask = $("staff-modal-mask");
      if (mask) mask.classList.remove("show");
      editingNo = null;
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
      var mask = $("staff-detail-mask");
      var body = $("staff-detail-body-web") || $("staff-detail-body");
      var sub = $("staff-detail-subtitle");
      if (!mask || !body) return;
      if (sub) sub.textContent = row.name || "应急人员详情";
      body.innerHTML =
        '<div class="staff-form-grid">' +
        '<label class="staff-form-item"><span class="staff-form-label">姓名：</span>' +
        webDetailValue(row.name) +
        "</label>" +
        '<label class="staff-form-item"><span class="staff-form-label">部门：</span>' +
        webDetailValue(row.dept) +
        "</label>" +
        '<label class="staff-form-item"><span class="staff-form-label">工号：</span>' +
        webDetailValue(row.no) +
        "</label>" +
        '<label class="staff-form-item"><span class="staff-form-label">岗位：</span>' +
        webDetailValue(row.post) +
        "</label>" +
        '<label class="staff-form-item"><span class="staff-form-label">所属线路：</span>' +
        webDetailValue(row.line) +
        "</label>" +
        '<label class="staff-form-item"><span class="staff-form-label">联系方式：</span>' +
        webDetailValue(row.phone) +
        "</label>" +
        '<label class="staff-form-item"><span class="staff-form-label">常驻地址：</span>' +
        webDetailValue(row.address) +
        "</label>" +
        '<label class="staff-form-item"><span class="staff-form-label">地址经度：</span>' +
        webDetailValue(row.lng) +
        "</label>" +
        '<label class="staff-form-item"><span class="staff-form-label">地址纬度：</span>' +
        webDetailValue(row.lat) +
        "</label>" +
        '<label class="staff-form-item"><span class="staff-form-label">备注：</span>' +
        webDetailValue(row.remark) +
        "</label></div>";
      mask.classList.add("show");
      mask.setAttribute("aria-hidden", "false");
    }

    function closeWebDetail() {
      var mask = $("staff-detail-mask");
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
        var staffNo = trigger.getAttribute("data-staff-no");

        if (action === "open-staff-search") {
          event.preventDefault();
          global.location.href = "emergency-staff-search.html";
          return;
        }
        if (action === "open-staff-filter") {
          var sheet = $("staff-filter-sheet");
          if (sheet) {
            sheet.classList.add("is-open");
            sheet.setAttribute("aria-hidden", "false");
          }
          return;
        }
        if (action === "close-staff-filter") {
          var closeSheet = $("staff-filter-sheet");
          if (closeSheet) {
            closeSheet.classList.remove("is-open");
            closeSheet.setAttribute("aria-hidden", "true");
          }
          return;
        }
        if (action === "search-staff") {
          var filterSheet = $("staff-filter-sheet");
          if (filterSheet) {
            filterSheet.classList.remove("is-open");
            filterSheet.setAttribute("aria-hidden", "true");
          }
          applyFilter();
          return;
        }
        if (action === "reset-staff-filter") {
          resetFilters();
          return;
        }
        if (action === "staff-search-clear") {
          clearSearch();
          return;
        }
        if (action === "new-staff") {
          if (isMobile) openForm("new");
          else openWebModal("new");
          return;
        }
        if (action === "staff-detail") {
          showDetail(index);
          return;
        }
        if (action === "staff-edit" || action === "edit-staff") {
          var editNo = staffNo;
          if (!editNo && action === "edit-staff") editNo = staffNo;
          if (isMobile) openForm("edit", staffNo);
          else openWebModal("edit", staffNo);
          return;
        }
        if (action === "staff-delete" || action === "delete-staff") {
          openDeleteConfirm(staffNo);
          return;
        }
        if (action === "cancel-staff-form") {
          showList();
          return;
        }
        if (action === "save-staff-form" || action === "save-staff") {
          saveStaff();
          if (!isMobile) closeWebModal();
          return;
        }
        if (action === "close-staff-modal") {
          closeWebModal();
          return;
        }
        if (action === "close-staff-detail") {
          if (isMobile) showList();
          else closeWebDetail();
          return;
        }
        if (action === "staff-confirm-cancel" || action === "cancel-delete") {
          closeDeleteConfirm();
          return;
        }
        if (action === "staff-confirm-ok" || action === "confirm-delete") {
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

      var detailMask = $("staff-detail-mask");
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
        var no = params.get("no") || "";
        if (q) {
          applyFilter(q, true);
          return;
        }
        if (isMobile && (params.get("view") === "detail" || name || no)) {
          var match = rows.find(function (row) {
            return (no && row.no === no) || (name && row.name === name);
          });
          if (match) {
            if (name) applyFilter(name, true);
            var idx = lastRenderedList.findIndex(function (row) {
              return row.no === match.no;
            });
            if (idx >= 0) {
              setTimeout(function () {
                showDetail(idx);
              }, 120);
            }
          }
        }
      } catch (e) {
        /* ignore */
      }
    }

    function setupWebRowClick() {
      if (isMobile || !tableBody || !global.WHTableRowClick) return;
      WHTableRowClick.bindById("staff-table-body", {
        getRows: function () { return getListSource(); },
        onOpen: function (row, index) { openWebDetail(index); },
      });
    }

    bindEvents();
    renderList();
    initFromQuery();
    syncSearchClear();
    setupWebRowClick();

    global.WHEmergencyStaffPage.showList = showList;

    if (!isMobile) {
      var exportBtn = $("btn-export-template");
      var importBtn = $("btn-import");
      if (exportBtn) {
        exportBtn.addEventListener("click", function () { alert("模板导出（原型演示）"); });
      }
      if (importBtn) {
        importBtn.addEventListener("click", function () { alert("导入人员（原型演示）"); });
      }
    }
  }

  global.WHEmergencyStaffPage = {
    boot: bootEmergencyStaffPage,
    LINE_OPTIONS: LINE_OPTIONS,
    FILTER_DEPT_OPTIONS: FILTER_DEPT_OPTIONS,
  };
})(window);
