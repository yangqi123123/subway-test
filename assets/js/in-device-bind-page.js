/**
 * 设备领用 — 移动端页面逻辑（对齐 wb/in-device-bind.html，无批量/导入/导出）
 */
(function (global) {
  "use strict";

  function bootInDeviceBindPage(options) {
    options = options || {};
    var LINES = global.WH_DEVICE_BIND_LINES || {};
    var LINE_OPTIONS = Object.keys(LINES);
    var PERSONS = global.WH_DEVICE_BIND_PERSONS || [];
    /** 当前登录用户（原型 mock），绑定表单默认回显其线路、区间与姓名 */
    var CURRENT_USER = global.WH_DEVICE_BIND_CURRENT_USER || PERSONS[0] || null;
    var rows = (global.WH_DEVICE_BIND_ROWS || []).map(function (row) {
      return Object.assign({}, row);
    });

    /** 列表排序：未绑定在前、已绑定在后；同状态按最后在线时间升序（越早越靠前） */
    function compareBindRows(a, b) {
      if (!!a.bound !== !!b.bound) return a.bound ? 1 : -1;
      var ta = String(a.lastOnline || "");
      var tb = String(b.lastOnline || "");
      return ta < tb ? -1 : ta > tb ? 1 : 0;
    }
    function sortBindRows() {
      rows.sort(compareBindRows);
    }

    var filteredRows = null;
    var currentRow = null;

    var listView = document.getElementById("bind-list-view");
    var detailView = document.getElementById("bind-detail-view");
    var bindView = document.getElementById("bind-form-view");
    var mobileList = document.getElementById("bind-mobile-list");
    var detailGrid = document.getElementById("bind-detail-grid");
    var detailStatusBadge = document.getElementById("bind-detail-status");
    var toastEl = document.getElementById("bind-toast");

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

    function getListSource() {
      return filteredRows !== null ? filteredRows : rows;
    }

    function setStatText(id, val) {
      var el = document.getElementById(id);
      if (!el) return;
      var numEl = el.querySelector(".mp-stat-card__num");
      if (numEl) {
        numEl.textContent = String(val);
        return;
      }
      el.textContent = String(val);
    }

    function updateBindStats(list) {
      var data = list || getListSource();
      var bound = 0;
      var latest = "";
      data.forEach(function (row) {
        var day = String(row.lastOnline || "").slice(0, 10);
        if (day > latest) latest = day;
      });
      var online = 0;
      data.forEach(function (row) {
        if (row.bound) bound += 1;
        if (latest && String(row.lastOnline || "").indexOf(latest) === 0) online += 1;
      });
      setStatText("stat-total", data.length);
      setStatText("stat-bound", bound);
      setStatText("stat-unbound", data.length - bound);
      setStatText("stat-online", online);
    }

    function fieldVal(id) {
      var el = document.getElementById(id);
      return el ? String(el.value || "").trim() : "";
    }

    function rowMatchesSearch(row, query) {
      var q = (query || "").trim().toLowerCase();
      if (!q) return true;
      return (
        String(row.user || "").toLowerCase().indexOf(q) >= 0 ||
        String(row.imei || "").toLowerCase().indexOf(q) >= 0 ||
        String(row.model || "").toLowerCase().indexOf(q) >= 0 ||
        String(row.devName || "").toLowerCase().indexOf(q) >= 0
      );
    }

    function applyFilter(silent) {
      sortBindRows();
      var q = fieldVal("bind-search-trigger");
      var f = {
        imei: fieldVal("filter-imei"),
        model: fieldVal("filter-model"),
        user: fieldVal("filter-user"),
        line: fieldVal("filter-line"),
        start: fieldVal("filter-start"),
        end: fieldVal("filter-end"),
      };
      var hasFilter = !!(q || f.imei || f.model || f.user || f.line || f.start || f.end);
      filteredRows = hasFilter
        ? rows.filter(function (row) {
            if (q && !rowMatchesSearch(row, q)) return false;
            if (f.imei && row.imei.indexOf(f.imei) === -1) return false;
            if (f.model && row.model.indexOf(f.model) === -1) return false;
            if (f.user && (row.user || "").indexOf(f.user) === -1) return false;
            if (f.line && row.line !== f.line) return false;
            if (f.start && (row.section || "").split("-")[0].indexOf(f.start) === -1) return false;
            if (f.end) {
              var endPart = (row.section || "").split("-")[1] || "";
              if (endPart.indexOf(f.end) === -1) return false;
            }
            return true;
          })
        : null;
      renderList();
      if (!silent) showToast("已按当前条件筛选");
    }

    function resetFilters() {
      ["filter-imei", "filter-model", "filter-user", "filter-start", "filter-end"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.value = "";
      });
      var lineSel = document.getElementById("filter-line");
      if (lineSel) lineSel.selectedIndex = 0;
      var sheet = document.getElementById("bind-filter-sheet");
      if (sheet && global.WHProjectMobile && global.WHProjectMobile.syncPickersFromForm) {
        global.WHProjectMobile.syncPickersFromForm(sheet);
      }
      applyFilter(true);
      showToast("筛选条件已重置");
    }

    function statusBadge(row) {
      return row.bound
        ? '<span class="bind-status bind-status--bound">已绑定</span>'
        : '<span class="bind-status bind-status--unbound">未绑定</span>';
    }

    function renderMobileCard(row) {
      var toggle = row.bound
        ? '<button type="button" class="mp-project-action" data-action="bind-unbind" data-id="' + row.id + '"><i class="fa-solid fa-link-slash"></i>解绑</button>'
        : '<button type="button" class="mp-project-action" data-action="bind-open" data-id="' + row.id + '"><i class="fa-solid fa-link"></i>绑定</button>';
      var delBtn = row.bound
        ? ''
        : '<button type="button" class="mp-project-action" data-action="bind-delete" data-id="' + row.id + '"><i class="fa-regular fa-trash-can"></i>删除</button>';
      return (
        '<article class="mp-project-card" data-row-id="' + row.id + '">' +
        '<div class="mp-project-card__head"><span class="mp-project-card__id">' + esc(row.imei) + "</span>" + statusBadge(row) + "</div>" +
        '<h3 class="mp-project-card__title">' + esc(row.devName) + "</h3>" +
        '<dl class="mp-project-card__meta">' +
        "<div><dt>用户名称</dt><dd>" + esc(row.user || "-") + "</dd></div>" +
        "<div><dt>所属线路</dt><dd>" + esc(row.line || "-") + "</dd></div>" +
        "<div><dt>所属区间</dt><dd>" + esc(row.section || "-") + "</dd></div>" +
        "<div><dt>设备型号</dt><dd>" + esc(row.model) + "</dd></div>" +
        "<div><dt>最后在线时间</dt><dd>" + esc(row.lastOnline) + "</dd></div>" +
        "</dl>" +
        '<div class="mp-project-card__actions">' +
        '<button type="button" class="mp-project-action" data-action="bind-detail" data-id="' + row.id + '"><i class="fa-regular fa-eye"></i>详情</button>' +
        toggle +
        delBtn +
        "</div></article>"
      );
    }

    function renderList() {
      var list = getListSource();
      if (!mobileList) return;
      if (!list.length) {
        mobileList.innerHTML = '<div class="mp-project-empty"><i class="fa-solid fa-microchip"></i><p>暂无设备领用数据</p></div>';
      } else {
        mobileList.innerHTML = list.map(renderMobileCard).join("");
      }
      updateBindStats(list);
    }

    function switchView(view) {
      [listView, detailView, bindView].forEach(function (el) {
        if (el) el.classList.add("hidden");
      });
      if (view) view.classList.remove("hidden");
      global.dispatchEvent(new Event("wh-bind-view-change"));
    }

    function findRow(id) {
      return rows.filter(function (row) { return row.id === id; })[0];
    }

    function openDetail(id) {
      var row = findRow(id);
      if (!row || !detailGrid) return;
      currentRow = row;
      var fields = [
        { label: "用户名称", value: row.user },
        { label: "手机号码", value: row.phone },
        { label: "所属部门", value: row.dept },
        { label: "所属线路", value: row.line },
        { label: "所属区间", value: row.section },
        { label: "设备IMEI", value: row.imei },
        { label: "设备型号", value: row.model },
        { label: "设备名称", value: row.devName },
        { label: "最后在线时间", value: row.lastOnline },
        { label: "绑定时间", value: row.bindTime },
        { label: "领用开始时间", value: row.useStart },
        { label: "领用结束时间", value: row.useEnd },
      ];
      detailGrid.innerHTML = fields
        .map(function (field) {
          return (
            '<div class="mp-form-row"><label class="project-form-label">' + esc(field.label) + "</label>" +
            '<input class="wh-input mp-field" value="' + esc(field.value || "—") + '" readonly /></div>'
          );
        })
        .join("");
      if (detailStatusBadge) {
        detailStatusBadge.className = "bind-status " + (row.bound ? "bind-status--bound" : "bind-status--unbound");
        detailStatusBadge.textContent = row.bound ? "已绑定" : "未绑定";
      }
      var navName = document.getElementById("bind-detail-name");
      if (navName) navName.textContent = row.devName || "";
      switchView(detailView);
    }

    function fillSelect(select, options, placeholder) {
      if (!select) return;
      select.innerHTML = '<option value="">' + esc(placeholder) + "</option>" + options
        .map(function (opt) {
          return '<option value="' + esc(opt) + '">' + esc(opt) + "</option>";
        })
        .join("");
    }

    function syncBindPickers() {
      if (global.WHProjectMobile && global.WHProjectMobile.enhanceSelectFields) {
        // enhanceSelect 对已增强的 select 会同步刷新对应选择按钮的文案
        global.WHProjectMobile.enhanceSelectFields(bindView);
      }
      if (global.WHProjectMobile && global.WHProjectMobile.syncPickersFromForm) {
        global.WHProjectMobile.syncPickersFromForm(bindView);
      }
    }

    /* ---- 绑定人员选择弹层（支持模糊搜索，对齐“选择调配人员”交互） ---- */
    var personSheet = document.getElementById("person-sheet");
    var personSheetSearch = document.getElementById("person-sheet-search");
    var personSheetOptions = document.getElementById("person-sheet-options");
    var personTempValue = "";

    function setPersonValue(name) {
      var hidden = document.getElementById("bind-person");
      var display = document.getElementById("bind-person-display");
      if (hidden) hidden.value = name || "";
      if (display) {
        display.textContent = name || "请选择绑定人员";
        display.classList.toggle("is-placeholder", !name);
      }
      var person = PERSONS.filter(function (p) { return p.name === name; })[0];
      document.getElementById("bind-phone").value = person ? person.phone : "";
      document.getElementById("bind-dept").value = person ? person.dept : "";
    }

    function renderPersonOptions(keyword) {
      if (!personSheetOptions) return;
      var kw = (keyword || "").trim();
      var matched = PERSONS.filter(function (p) {
        return !kw || p.name.indexOf(kw) >= 0;
      });
      if (!matched.length) {
        personSheetOptions.innerHTML = '<div class="mp-select-empty">未搜索到相关结果</div>';
        return;
      }
      personSheetOptions.innerHTML = matched
        .map(function (p) {
          var selected = personTempValue === p.name;
          return (
            '<div class="mp-select-option' + (selected ? " is-selected" : "") + '" data-value="' + esc(p.name) + '">' +
            '<span class="mp-select-option__radio"></span>' +
            "<span>" + esc(p.name) + "</span>" +
            "</div>"
          );
        })
        .join("");
    }

    function openPersonSheet() {
      if (!personSheet) return;
      personTempValue = fieldVal("bind-person");
      if (personSheetSearch) personSheetSearch.value = "";
      renderPersonOptions("");
      personSheet.classList.add("is-open");
      personSheet.setAttribute("aria-hidden", "false");
      document.body.classList.add("mp-scroll-locked");
    }

    function closePersonSheet() {
      if (!personSheet) return;
      personSheet.classList.remove("is-open");
      personSheet.setAttribute("aria-hidden", "true");
      document.body.classList.remove("mp-scroll-locked");
      personTempValue = "";
    }

    function confirmPersonSheet() {
      setPersonValue(personTempValue);
      closePersonSheet();
    }

    function openBindForm(id) {
      var row = findRow(id);
      if (!row) return;
      currentRow = row;
      document.getElementById("bind-imei").value = row.imei;
      document.getElementById("bind-model").value = row.model;
      fillSelect(document.getElementById("bind-line"), LINE_OPTIONS, "请选择线路");
      var defaultLine = CURRENT_USER ? CURRENT_USER.line : "";
      var defaultStations = LINES[defaultLine] || [];
      fillSelect(document.getElementById("bind-start"), defaultStations, "请选择站点");
      fillSelect(document.getElementById("bind-end"), defaultStations, "请选择站点");
      // 默认回显当前用户的线路、区间与姓名，可改选其他
      if (CURRENT_USER) {
        document.getElementById("bind-line").value = defaultLine;
        document.getElementById("bind-start").value = CURRENT_USER.start;
        document.getElementById("bind-end").value = CURRENT_USER.end;
        setPersonValue(CURRENT_USER.name);
      } else {
        setPersonValue("");
      }
      var now = new Date();
      var local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      document.getElementById("bind-use-start").value = local;
      document.getElementById("bind-use-end").value = "";
      syncBindPickers();
      switchView(bindView);
    }

    function saveBind() {
      if (!currentRow) return;
      var line = fieldVal("bind-line");
      var start = fieldVal("bind-start");
      var end = fieldVal("bind-end");
      var personName = fieldVal("bind-person");
      var useStart = fieldVal("bind-use-start");
      var useEnd = fieldVal("bind-use-end");
      if (!line || !start || !end) {
        showToast("请完善：所属线路、起始区间、终点区间");
        return;
      }
      if (start === end) {
        showToast("起始区间与终点区间不能相同");
        return;
      }
      if (!personName) {
        showToast("请选择绑定人员");
        return;
      }
      if (useStart && useEnd && useEnd < useStart) {
        showToast("领用结束时间不能早于领用开始时间");
        return;
      }
      var person = PERSONS.filter(function (p) { return p.name === personName; })[0];
      currentRow.user = person.name;
      currentRow.phone = person.phone;
      currentRow.dept = person.dept;
      currentRow.line = line;
      currentRow.section = start + "-" + end;
      currentRow.bound = true;
      currentRow.bindTime = "2026-07-23 20:00";
      currentRow.useStart = useStart ? useStart.replace("T", " ") : "";
      currentRow.useEnd = useEnd ? useEnd.replace("T", " ") : "";
      switchView(listView);
      applyFilter(true);
      showToast("绑定成功");
    }

    function doUnbind(row) {
      row.user = "";
      row.phone = "";
      row.dept = "";
      row.line = "";
      row.section = "";
      row.bound = false;
      row.bindTime = "";
      row.useStart = "";
      row.useEnd = "";
      applyFilter(true);
      showToast("已解绑");
    }

    function doDelete(row) {
      var idx = rows.indexOf(row);
      if (idx > -1) rows.splice(idx, 1);
      applyFilter(true);
      showToast("已删除领用记录");
    }

    function showList() {
      currentRow = null;
      switchView(listView);
    }

    function currentViewName() {
      if (bindView && !bindView.classList.contains("hidden")) return "bind";
      if (detailView && !detailView.classList.contains("hidden")) return "detail";
      return "list";
    }

    function bindEvents() {
      document.addEventListener("click", function (event) {
        var trigger = event.target.closest("[data-action]");
        if (!trigger) return;
        var action = trigger.getAttribute("data-action");
        var id = Number(trigger.getAttribute("data-id")) || 0;

        if (action === "bind-detail") {
          openDetail(id);
          return;
        }
        if (action === "bind-open") {
          openBindForm(id);
          return;
        }
        if (action === "bind-unbind") {
          var row = findRow(id);
          if (!row) return;
          if (global.WHProjectMobile && global.WHProjectMobile.showConfirm) {
            global.WHProjectMobile.showConfirm({
              title: "解绑确认",
              message: "确认将设备（" + row.imei + "）与 " + (row.user || "当前人员") + " 解绑吗？",
              okText: "确定解绑",
              danger: true,
              onConfirm: function () { doUnbind(row); },
            });
          }
          return;
        }
        if (action === "bind-delete") {
          var delRow = findRow(id);
          if (!delRow) return;
          if (global.WHProjectMobile && global.WHProjectMobile.showConfirm) {
            global.WHProjectMobile.showConfirm({
              title: "删除确认",
              message: "确认删除当前领用记录吗？",
              okText: "确定删除",
              danger: true,
              onConfirm: function () { doDelete(delRow); },
            });
          }
          return;
        }
        if (action === "bind-save") {
          saveBind();
          return;
        }
        if (action === "bind-cancel") {
          showList();
          return;
        }
        if (action === "open-person-sheet") {
          openPersonSheet();
          return;
        }
        if (action === "close-person-sheet") {
          closePersonSheet();
          return;
        }
        if (action === "confirm-person-sheet") {
          confirmPersonSheet();
          return;
        }
        if (action === "open-bind-filter") {
          var sheet = document.getElementById("bind-filter-sheet");
          if (sheet) sheet.classList.add("is-open");
          return;
        }
        if (action === "close-bind-filter") {
          var closeSheet = document.getElementById("bind-filter-sheet");
          if (closeSheet) closeSheet.classList.remove("is-open");
          return;
        }
        if (action === "search-bind") {
          var searchSheet = document.getElementById("bind-filter-sheet");
          if (searchSheet) searchSheet.classList.remove("is-open");
          applyFilter();
          return;
        }
        if (action === "reset-bind-filter") {
          var resetSheet = document.getElementById("bind-filter-sheet");
          if (resetSheet) resetSheet.classList.remove("is-open");
          resetFilters();
        }
      });

      if (mobileList) {
        mobileList.addEventListener("click", function (event) {
          if (event.target.closest("[data-action]")) return;
          var card = event.target.closest(".mp-project-card[data-row-id]");
          if (!card) return;
          openDetail(Number(card.getAttribute("data-row-id")));
        });
      }

      var searchInput = document.getElementById("bind-search-trigger");
      if (searchInput) {
        searchInput.addEventListener("input", function () {
          applyFilter(true);
        });
      }

      var lineSelect = document.getElementById("bind-line");
      if (lineSelect) {
        lineSelect.addEventListener("change", function () {
          var stations = LINES[this.value] || [];
          fillSelect(document.getElementById("bind-start"), stations, "请选择站点");
          fillSelect(document.getElementById("bind-end"), stations, "请选择站点");
          syncBindPickers();
        });
      }

      if (personSheetSearch) {
        personSheetSearch.addEventListener("input", function () {
          renderPersonOptions(this.value);
        });
      }
      if (personSheetOptions) {
        personSheetOptions.addEventListener("click", function (event) {
          var option = event.target.closest(".mp-select-option");
          if (!option) return;
          personTempValue = option.getAttribute("data-value");
          renderPersonOptions(personSheetSearch ? personSheetSearch.value : "");
        });
      }
    }

    if (global.WHProjectMobile && global.WHProjectMobile.init) {
      try {
        global.WHProjectMobile.init({
          clearListSearch: function () {
            var input = document.getElementById("bind-search-trigger");
            if (input) input.value = "";
            applyFilter(true);
          },
          showToast: showToast,
        });
      } catch (initErr) {
        console.warn("[WHInDeviceBindPage] mobile init", initErr);
      }
    }
    if (global.WHProjectMobile && global.WHProjectMobile.enhanceSelectFields) {
      global.WHProjectMobile.enhanceSelectFields(document.getElementById("bind-filter-sheet"));
      global.WHProjectMobile.enhanceSelectFields(bindView);
    }

    sortBindRows();
    renderList();
    bindEvents();

    global.WHInDeviceBindPage.showList = showList;
    global.WHInDeviceBindPage.openDetail = openDetail;
    global.WHInDeviceBindPage.currentViewName = currentViewName;
    return { showList: showList, openDetail: openDetail };
  }

  global.WHInDeviceBindPage = {
    boot: bootInDeviceBindPage,
    showList: null,
    openDetail: null,
    currentViewName: null,
  };
})(typeof window !== "undefined" ? window : global);
