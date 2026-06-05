/**
 * 移动端筛选区 select → 底部弹窗选择器（统计页等轻量场景）
 */
(function (global) {
  "use strict";

  var bound = false;
  var pickerState = {
    dynamicSelectId: null,
    multiple: false,
    selected: [],
    options: [],
    title: "请选择",
  };

  var FILTER_SHEET_BY_ACTION = {
    "open-line-stats-filter": "line-stats-filter-sheet",
    "open-system-stats-filter": "system-stats-filter-sheet",
    "open-drone-stats-filter": "drone-stats-filter-sheet",
  };

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function esc(v) {
    return String(v || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function getSelectLabel(select) {
    if (!select) return "请选择";
    var row = select.closest(".mp-filter-field, .mp-form-row, label");
    if (!row) return "请选择";
    var label = row.querySelector("span");
    if (label) return String(label.textContent || "").replace(/[：:\s]+$/g, "").trim() || "请选择";
    return "请选择";
  }

  function syncSelectPickerButton(select) {
    if (!select || !select.id) return;
    var btn = document.querySelector('[data-dynamic-select="' + select.id + '"]');
    if (!btn) return;
    var span = btn.querySelector(".mp-picker-field__text");
    if (!span) return;
    var opt = select.options[select.selectedIndex];
    var text = opt ? opt.text : "";
    var placeholder = btn.getAttribute("data-placeholder") || "请选择";
    var isEmpty = !text || /^请选择/.test(text) || text === "全部" || text === "全部线路" || text === "全部机场" || text === "全部设备";
    span.textContent = isEmpty ? placeholder : text;
    span.classList.toggle("is-placeholder", isEmpty);
  }

  function enhanceSelect(select) {
    if (!select || select.tagName !== "SELECT") return;
    if (select.dataset.mpPickerBound === "1") {
      syncSelectPickerButton(select);
      return;
    }
    if (select.closest(".mp-picker-field")) return;
    if (!select.id) select.id = "mp-sel-" + Math.random().toString(36).slice(2, 10);

    select.dataset.mpPickerBound = "1";
    select.classList.add("mp-select-native");

    var labelText = getSelectLabel(select);
    var placeholder = /^请选择/.test(labelText) ? labelText : "请选择" + labelText.replace(/^是否/, "");

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mp-picker-field mp-select-picker";
    btn.setAttribute("data-dynamic-select", select.id);
    btn.setAttribute("data-picker-title", labelText);
    btn.setAttribute("data-placeholder", placeholder);

    var span = document.createElement("span");
    span.className = "mp-picker-field__text";
    btn.appendChild(span);

    var icon = document.createElement("i");
    icon.className = "fa-solid fa-chevron-down";
    btn.appendChild(icon);

    select.style.display = "none";
    select.parentNode.insertBefore(btn, select.nextSibling);
    syncSelectPickerButton(select);
  }

  function enhanceSelectFields(root) {
    qsa("select.wh-input, select.mp-field", root || document).forEach(enhanceSelect);
  }

  function syncAll(root) {
    qsa("select.mp-select-native", root || document).forEach(syncSelectPickerButton);
  }

  function closePicker() {
    var sheet = document.getElementById("mp-picker-sheet");
    if (sheet) {
      sheet.classList.remove("is-open");
      sheet.setAttribute("aria-hidden", "true");
    }
    pickerState.dynamicSelectId = null;
  }

  function renderPickerOptions() {
    var body = document.getElementById("mp-picker-body");
    if (!body) return;
    body.innerHTML = pickerState.options
      .map(function (opt) {
        var checked = pickerState.selected.indexOf(opt) >= 0;
        return (
          '<label class="mp-picker-option">' +
          '<input type="radio" name="mp-picker-opt" value="' +
          esc(opt) +
          '"' +
          (checked ? " checked" : "") +
          ' data-single="1" />' +
          "<span>" +
          esc(opt) +
          "</span></label>"
        );
      })
      .join("");
  }

  function openDynamicPicker(selectId, title) {
    var select = document.getElementById(selectId);
    if (!select) return;
    var options = Array.prototype.map
      .call(select.options, function (o) {
        return o.text;
      })
      .filter(function (t) {
        return t && t !== "请选择" && t !== "请选择站点" && t !== "请选择区间";
      });
    if (!options.length) return;

    var current = select.options[select.selectedIndex];
    pickerState.dynamicSelectId = selectId;
    pickerState.options = options;
    pickerState.title = title || getSelectLabel(select);
    pickerState.selected =
      current && current.text && !/^请选择/.test(current.text) && current.text !== "全部" && current.text !== "全部线路" && current.text !== "全部机场" && current.text !== "全部设备"
        ? [current.text]
        : [];

    var titleEl = document.getElementById("mp-picker-title");
    if (titleEl) titleEl.textContent = pickerState.title;
    renderPickerOptions();
    var sheet = document.getElementById("mp-picker-sheet");
    if (sheet) {
      sheet.classList.add("is-open");
      sheet.setAttribute("aria-hidden", "false");
    }
  }

  function confirmPicker() {
    if (!pickerState.dynamicSelectId) return closePicker();
    var inputs = qsa('#mp-picker-body input[name="mp-picker-opt"]:checked');
    var values = inputs.map(function (inp) {
      return inp.value;
    });
    var select = document.getElementById(pickerState.dynamicSelectId);
    if (select) {
      var picked = values[0] || "";
      var matched = -1;
      Array.prototype.forEach.call(select.options, function (opt, idx) {
        if (opt.text === picked) matched = idx;
      });
      if (matched >= 0) select.selectedIndex = matched;
      else select.selectedIndex = 0;
      syncSelectPickerButton(select);
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
    closePicker();
  }

  function enhanceFilterSheet(sheetId) {
    var sheet = typeof sheetId === "string" ? document.getElementById(sheetId) : sheetId;
    if (sheet) {
      enhanceSelectFields(sheet);
      syncAll(sheet);
    }
  }

  function bindPickers() {
    if (bound) return;
    bound = true;

    document.addEventListener("click", function (e) {
      var field = e.target.closest(".mp-picker-field.mp-select-picker");
      if (field && !field.disabled) {
        var dynamicId = field.getAttribute("data-dynamic-select");
        if (dynamicId) openDynamicPicker(dynamicId, field.getAttribute("data-picker-title"));
        return;
      }

      var act = e.target.closest("[data-action]");
      if (!act) return;
      var action = act.getAttribute("data-action");
      if (action === "mp-picker-cancel" || action === "mp-picker-mask-close") closePicker();
      if (action === "mp-picker-confirm") confirmPicker();

      var sheetId = FILTER_SHEET_BY_ACTION[action];
      if (sheetId) {
        setTimeout(function () {
          enhanceFilterSheet(sheetId);
        }, 0);
      }
    });

    var pickerBody = document.getElementById("mp-picker-body");
    if (pickerBody) {
      pickerBody.addEventListener("change", function (e) {
        if (e.target.matches('input[data-single="1"]')) {
          qsa('#mp-picker-body input[data-single="1"]').forEach(function (inp) {
            if (inp !== e.target) inp.checked = false;
          });
          e.target.checked = true;
        }
      });
    }
  }

  function init(sheetIds) {
    bindPickers();
    (sheetIds || []).forEach(enhanceFilterSheet);
  }

  global.WHFilterPicker = {
    init: init,
    enhanceSelectFields: enhanceSelectFields,
    enhanceFilterSheet: enhanceFilterSheet,
    syncAll: syncAll,
    closePicker: closePicker,
  };
})(typeof window !== "undefined" ? window : global);
