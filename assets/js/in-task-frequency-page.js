/**
 * 巡线任务频率设置 — 页面逻辑
 * 依赖：in-project-data.js（WH_PROJECT_DEMO_ROWS）、in-task-frequency-data.js（WHTaskFreqData）
 */
(function (global) {
  "use strict";

  var D = global.WHTaskFreqData;
  var rules = D.rules;
  var shallowSections = D.shallowSections;

  var editingRuleId = null;
  var editingSectionId = null;
  var pendingConfirm = null;
  var filteredRules = null;
  var ruleDraft = { scope: "all", types: [], weekdays: [] };
  var selectedStations = [];

  function $(id) {
    return document.getElementById(id);
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function showToast(msg) {
    var el = $("page-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      el.classList.remove("show");
    }, 2200);
  }

  function tag(cls, text) {
    return '<span class="tf-tag ' + cls + '">' + esc(text) + "</span>";
  }

  var TYPE_TAG = { 重点项目: "tf-tag--red", 一般项目: "tf-tag--slate", 临时项目: "tf-tag--amber" };

  /* ---------- 统计 ---------- */

  function setStat(id, val) {
    var el = $(id);
    if (!el) return;
    var num = el.querySelector(".disease-stat-card__num");
    if (num) num.textContent = String(val);
    else el.textContent = String(val);
  }

  function renderStats() {
    setStat("stat-rules", rules.length);
    setStat("stat-all", rules.filter(function (r) { return r.scope === "all"; }).length);
    setStat("stat-shallow", rules.filter(function (r) { return r.scope === "shallow"; }).length);
    setStat("stat-sections", shallowSections.length);
  }

  /* ---------- 规则列表 ---------- */

  /** 同范围、同类型的规则相邻排布：范围 → 首个项目类型 → 编号 */
  function sortRules(list) {
    var scopeOrder = { all: 0, shallow: 1 };
    return list.slice().sort(function (a, b) {
      if (scopeOrder[a.scope] !== scopeOrder[b.scope]) return scopeOrder[a.scope] - scopeOrder[b.scope];
      var ta = D.PROJECT_TYPES.indexOf(a.types[0] || "");
      var tb = D.PROJECT_TYPES.indexOf(b.types[0] || "");
      if (ta !== tb) return ta - tb;
      return String(a.id).localeCompare(String(b.id));
    });
  }

  /* ---------- 快捷筛选 ---------- */

  function readFilters() {
    return {
      id: ($("filter-id") ? $("filter-id").value : "").trim(),
      scope: $("filter-scope") ? $("filter-scope").value : "",
      type: $("filter-type") ? $("filter-type").value : "",
    };
  }

  function ruleMatchesFilters(rule, f) {
    if (f.id && String(rule.id).toLowerCase().indexOf(f.id.toLowerCase()) < 0) return false;
    if (f.scope && rule.scope !== f.scope) return false;
    if (f.type && rule.types.indexOf(f.type) < 0) return false;
    return true;
  }

  function applyFilters(silent) {
    var f = readFilters();
    filteredRules =
      f.id || f.scope || f.type
        ? rules.filter(function (r) {
            return ruleMatchesFilters(r, f);
          })
        : null;
    renderRules();
    if (!silent) showToast("已按当前条件筛选");
  }

  function resetFilters() {
    ["filter-id", "filter-scope", "filter-type"].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      if (el.tagName === "SELECT") el.selectedIndex = 0;
      else el.value = "";
    });
    applyFilters(true);
    showToast("筛选条件已重置");
  }

  function renderRules() {
    var tbody = $("rules-table-body");
    if (!tbody) return;
    var list = sortRules(filteredRules !== null ? filteredRules : rules);
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="tf-empty">暂无频率规则，请点击「新增」创建</td></tr>';
      return;
    }
    tbody.innerHTML = list
      .map(function (rule) {
        var scopeTag =
          rule.scope === "all" ? tag("tf-tag--amber", "全线范围") : tag("tf-tag--violet", "浅埋段范围");
        var typeTags = rule.types
          .map(function (t) {
            return tag(TYPE_TAG[t] || "tf-tag--slate", t);
          })
          .join("");
        var dayTags = rule.weekdays
          .map(function (d) {
            return tag("tf-tag--cyan", d);
          })
          .join("");
        return (
          "<tr>" +
          "<td>" + esc(rule.id) + "</td>" +
          "<td>" + scopeTag + "</td>" +
          "<td>" + typeTags + "</td>" +
          "<td>" + dayTags + "</td>" +
          "<td>" + esc(rule.lastGen || "—") + "</td>" +
          '<td class="tf-ops">' +
          '<a data-action="edit-rule" data-id="' + esc(rule.id) + '">编辑</a>' +
          "</td></tr>"
        );
      })
      .join("");
  }

  /* ---------- 浅埋段列表 ---------- */

  function renderShallow() {
    var tbody = $("shallow-table-body");
    if (!tbody) return;
    if (!shallowSections.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="tf-empty">暂无浅埋段设置，请点击「新增浅埋段」创建</td></tr>';
      return;
    }
    tbody.innerHTML = shallowSections
      .map(function (s) {
        return (
          "<tr>" +
          "<td>" + esc(s.id) + "</td>" +
          "<td>" + tag("tf-tag--cyan", s.line) + "</td>" +
          "<td>" + esc((s.stations && s.stations.length ? s.stations : [s.from, s.to]).filter(Boolean).join("、")) + "</td>" +
          "<td>" + esc(s.remark || "—") + "</td>" +
          '<td class="tf-ops">' +
          '<a data-action="edit-section" data-id="' + esc(s.id) + '">编辑</a>' +
          '<a class="danger" data-action="del-section" data-id="' + esc(s.id) + '">删除</a>' +
          "</td></tr>"
        );
      })
      .join("");
  }

  /* ---------- 规则弹窗 ---------- */

  function checkedValues(attr) {
    return Array.prototype.map.call(document.querySelectorAll("[" + attr + "]:checked"), function (el) {
      return el.getAttribute(attr);
    });
  }

  function syncCheckGroup(attr, values) {
    Array.prototype.forEach.call(document.querySelectorAll("[" + attr + "]"), function (el) {
      var on = values.indexOf(el.getAttribute(attr)) >= 0;
      el.checked = on;
      var chip = el.closest(".tf-check");
      if (chip) chip.classList.toggle("on", on);
    });
  }

  function syncScopeRadios(scope) {
    Array.prototype.forEach.call(document.querySelectorAll('input[name="rule-scope"]'), function (el) {
      el.checked = el.value === scope;
      var chip = el.closest(".tf-check");
      if (chip) chip.classList.toggle("on", el.checked);
    });
  }

  function setRuleEditMode(editing) {
    Array.prototype.forEach.call(document.querySelectorAll('input[name="rule-scope"], [data-type]'), function (el) {
      el.disabled = editing;
      var chip = el.closest(".tf-check");
      if (chip) chip.classList.toggle("is-disabled", editing);
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-rule-required]"), function (el) {
      el.style.display = editing ? "none" : "";
    });
  }

  function readRuleForm() {
    var scopeEl = document.querySelector('input[name="rule-scope"]:checked');
    return {
      scope: scopeEl ? scopeEl.value : "all",
      types: checkedValues("data-type"),
      weekdays: checkedValues("data-weekday"),
      remark: ($("rule-remark") ? $("rule-remark").value : "").trim(),
    };
  }

  /** 同范围、项目类型重叠的其它启用规则 → 冲突提示 */
  function findConflicts(form) {
    return rules.filter(function (r) {
      if (!r.enabled) return false;
      if (editingRuleId && r.id === editingRuleId) return false;
      if (r.scope !== form.scope) return false;
      return r.types.some(function (t) {
        return form.types.indexOf(t) >= 0;
      });
    });
  }

  function refreshConflict() {
    var box = $("rule-conflict");
    if (!box) return;
    if (editingRuleId) {
      box.hidden = true;
      box.innerHTML = "";
      return;
    }
    var form = readRuleForm();
    var conflicts = findConflicts(form);
    if (!conflicts.length || !form.types.length) {
      box.hidden = true;
      box.innerHTML = "";
      return;
    }
    var overlap = form.types.filter(function (t) {
      return conflicts.some(function (r) {
        return r.types.indexOf(t) >= 0;
      });
    });
    var refs = conflicts
      .map(function (r) {
        return "<b>" + esc(r.id) + "</b>（" + (r.scope === "all" ? "全线范围" : "浅埋段范围") + " · " + r.weekdays.join("/") + "）";
      })
      .join("、");
    box.innerHTML =
      "<span>⚠</span><div><b>冲突提示：</b>「" +
      esc(overlap.join("」、「")) +
      "」已存在于规则 " +
      refs +
      "。保存后该类型将按多条规则的<b>并集</b>生效，同一项目同一天仅生成一条任务。</div>";
    box.hidden = false;
  }

  function openRuleModal(rule) {
    editingRuleId = rule ? rule.id : null;
    $("rule-modal-title").textContent = rule ? "编辑规则" : "新增规则";
    ruleDraft = rule
      ? { scope: rule.scope, types: rule.types.slice(), weekdays: rule.weekdays.slice() }
      : { scope: "all", types: [], weekdays: [] };
    syncScopeRadios(ruleDraft.scope);
    syncCheckGroup("data-type", ruleDraft.types);
    syncCheckGroup("data-weekday", ruleDraft.weekdays);
    setRuleEditMode(Boolean(rule));
    $("rule-remark").value = rule ? rule.remark || "" : D.DEFAULT_RULE_REMARK;
    refreshConflict();
    $("rule-modal").classList.add("show");
  }

  function closeRuleModal() {
    $("rule-modal").classList.remove("show");
    editingRuleId = null;
  }

  function saveRule() {
    var form = readRuleForm();
    if (!form.types.length) return showToast("请勾选项目类型");
    if (!form.weekdays.length) return showToast("请勾选生成周期");
    if (editingRuleId) {
      var rule = rules.filter(function (r) { return r.id === editingRuleId; })[0];
      if (rule) {
        rule.weekdays = form.weekdays;
        rule.remark = form.remark;
      }
      showToast("规则已保存");
    } else {
      var seq = 1;
      rules.forEach(function (r) {
        var m = /^R-(\d+)$/.exec(r.id);
        if (m) seq = Math.max(seq, Number(m[1]) + 1);
      });
      rules.push({
        id: "R-" + ("00" + seq).slice(-3),
        scope: form.scope,
        types: form.types,
        weekdays: form.weekdays,
        enabled: true,
        remark: form.remark,
        lastGen: "",
      });
      showToast("规则已新增");
    }
    closeRuleModal();
    renderStats();
    renderRules();
  }

  /* ---------- 浅埋段弹窗 ---------- */

  function renderStationPicker() {
    var line = $("shallow-line") ? $("shallow-line").value : "";
    var keyword = ($("shallow-station-search") ? $("shallow-station-search").value : "").trim().toLowerCase();
    var stations = (D.LINE_STATIONS[line] || []).filter(function (station) {
      return !keyword || station.toLowerCase().indexOf(keyword) >= 0;
    });
    var tags = $("shallow-station-tags");
    var options = $("shallow-station-options");
    var placeholder = $("shallow-station-placeholder");
    if (tags) {
      tags.innerHTML = selectedStations
        .map(function (station) {
          return '<span class="wh-search-select__tag"><span class="wh-search-select__tag-text">' + esc(station) + '</span><button type="button" class="wh-search-select__tag-remove" data-action="station-remove" data-station="' + esc(station) + '" aria-label="移除' + esc(station) + '">×</button></span>';
        })
        .join("");
    }
    if (placeholder) {
      placeholder.classList.toggle("is-hidden", selectedStations.length > 0);
      placeholder.classList.toggle("is-placeholder", selectedStations.length === 0);
    }
    if (options) {
      options.innerHTML = stations.length
        ? stations
            .map(function (station) {
              var selected = selectedStations.indexOf(station) >= 0;
              return '<li class="wh-search-select__option' + (selected ? " is-selected" : "") + '" data-action="station-toggle" data-station="' + esc(station) + '"><i class="fa-solid fa-check wh-search-select__check"></i><span>' + esc(station) + '</span></li>';
            })
            .join("")
        : '<li class="wh-search-select__empty">无匹配项</li>';
    }
  }

  function setSelectedStations(stations) {
    selectedStations = stations.filter(function (station, index, list) {
      return station && list.indexOf(station) === index;
    });
    if ($("shallow-station-search")) $("shallow-station-search").value = "";
    renderStationPicker();
  }

  function toggleStation(station) {
    var index = selectedStations.indexOf(station);
    if (index >= 0) selectedStations.splice(index, 1);
    else selectedStations.push(station);
    renderStationPicker();
  }

  function openShallowModal(section) {
    editingSectionId = section ? section.id : null;
    $("shallow-modal-title").textContent = section ? "编辑浅埋段" : "新增浅埋段";
    var lineSel = $("shallow-line");
    lineSel.innerHTML = Object.keys(D.LINE_STATIONS)
      .map(function (line) {
        return '<option value="' + esc(line) + '"' + (section && section.line === line ? " selected" : "") + ">" + esc(line) + "</option>";
      })
      .join("");
    var line = section ? section.line : lineSel.value;
    var stations = section
      ? section.stations && section.stations.length
        ? section.stations.slice()
        : [section.from, section.to]
      : [];
    setSelectedStations(stations);
    $("shallow-remark").value = section ? section.remark || "" : "";
    $("shallow-modal").classList.add("show");
  }

  function closeShallowModal() {
    $("shallow-modal").classList.remove("show");
    $("shallow-station-picker").classList.remove("is-open");
    selectedStations = [];
    editingSectionId = null;
  }

  function saveShallow() {
    var line = $("shallow-line").value;
    var remark = $("shallow-remark").value.trim();
    if (selectedStations.length < 2) return showToast("请至少选择两个所属站点");
    var from = selectedStations[0];
    var to = selectedStations[selectedStations.length - 1];
    if (editingSectionId) {
      var section = shallowSections.filter(function (s) { return s.id === editingSectionId; })[0];
      if (section) {
        section.line = line;
        section.from = from;
        section.to = to;
        section.stations = selectedStations.slice();
        section.remark = remark;
      }
      showToast("浅埋段已保存");
    } else {
      var seq = 1;
      shallowSections.forEach(function (s) {
        var m = /^S-(\d+)$/.exec(s.id);
        if (m) seq = Math.max(seq, Number(m[1]) + 1);
      });
      shallowSections.push({ id: "S-" + ("00" + seq).slice(-3), line: line, from: from, to: to, stations: selectedStations.slice(), remark: remark });
      showToast("浅埋段已新增");
    }
    closeShallowModal();
    renderStats();
    renderShallow();
  }

  /* ---------- 二次确认（删除 / 停用 / 启用） ---------- */

  function openConfirm(kind, id, title, text) {
    pendingConfirm = { kind: kind, id: id };
    $("confirm-title").textContent = title;
    $("confirm-text").textContent = text;
    $("confirm-ok-btn").textContent = kind === "toggle-rule" ? "确定" : "确定删除";
    $("confirm-modal").classList.add("show");
  }

  function closeConfirm() {
    pendingConfirm = null;
    $("confirm-modal").classList.remove("show");
  }

  function submitConfirm() {
    if (!pendingConfirm) return;
    if (pendingConfirm.kind === "toggle-rule") {
      var t = rules.filter(function (r) { return r.id === pendingConfirm.id; })[0];
      if (t) {
        t.enabled = !t.enabled;
        renderRules();
        showToast(t.enabled ? "规则已启用" : "规则已停用");
      }
      closeConfirm();
      return;
    }
    if (pendingConfirm.kind === "rule") {
      var ri = -1;
      rules.forEach(function (r, i) { if (r.id === pendingConfirm.id) ri = i; });
      if (ri >= 0) rules.splice(ri, 1);
      renderRules();
      showToast("规则已删除");
    } else {
      var si = -1;
      shallowSections.forEach(function (s, i) { if (s.id === pendingConfirm.id) si = i; });
      if (si >= 0) shallowSections.splice(si, 1);
      renderShallow();
      showToast("浅埋段已删除");
    }
    closeConfirm();
    renderStats();
  }

  /* ---------- Tab 与事件 ---------- */

  function switchTab(tab) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-tab]"), function (el) {
      el.classList.toggle("active", el.getAttribute("data-tab") === tab);
    });
    $("panel-rules").style.display = tab === "rules" ? "" : "none";
    $("panel-shallow").style.display = tab === "shallow" ? "" : "none";
  }

  function bindEvents() {
    document.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-action]");
      if (!trigger) return;
      var action = trigger.getAttribute("data-action");
      var id = trigger.getAttribute("data-id");

      if (action === "new-rule") return openRuleModal(null);
      if (action === "new-section") return openShallowModal(null);
      if (action === "edit-rule") {
        var rule = rules.filter(function (r) { return r.id === id; })[0];
        return openRuleModal(rule || null);
      }
      if (action === "edit-section") {
        var section = shallowSections.filter(function (s) { return s.id === id; })[0];
        return openShallowModal(section || null);
      }
      if (action === "del-section") return openConfirm("section", id, "确认删除", "确定删除该浅埋段设置吗？删除后不可恢复。");
      if (action === "filter-search") return applyFilters();
      if (action === "filter-reset") return resetFilters();
      if (action === "rule-cancel") return closeRuleModal();
      if (action === "rule-save") return saveRule();
      if (action === "rule-edit-original") {
        var conflicts = findConflicts(readRuleForm());
        if (conflicts.length) openRuleModal(conflicts[0]);
        return;
      }
      if (action === "shallow-cancel") return closeShallowModal();
      if (action === "shallow-save") return saveShallow();
      if (action === "station-picker-open") {
        $("shallow-station-picker").classList.toggle("is-open");
        $("shallow-station-search").focus();
        return;
      }
      if (action === "station-toggle") {
        toggleStation(trigger.getAttribute("data-station"));
        $("shallow-station-picker").classList.add("is-open");
        return;
      }
      if (action === "station-remove") {
        var station = trigger.getAttribute("data-station");
        selectedStations = selectedStations.filter(function (item) { return item !== station; });
        renderStationPicker();
        return;
      }
      if (action === "station-picker-done") {
        $("shallow-station-picker").classList.remove("is-open");
        return;
      }
      if (action === "confirm-cancel") return closeConfirm();
      if (action === "confirm-ok") return submitConfirm();
      if (action === "switch-tab") return switchTab(trigger.getAttribute("data-tab"));
    });

    document.addEventListener("change", function (event) {
      var el = event.target;
      if (el.matches("input[name='rule-scope']")) {
        syncScopeRadios(el.value);
        refreshConflict();
        return;
      }
      if (el.matches("[data-type]")) {
        syncCheckGroup("data-type", checkedValues("data-type"));
        refreshConflict();
        return;
      }
      if (el.matches("[data-weekday]")) {
        syncCheckGroup("data-weekday", checkedValues("data-weekday"));
        return;
      }
      if (el.matches("[data-weekday-all]")) {
        var on = el.checked;
        syncCheckGroup("data-weekday", on ? D.WEEKDAYS.slice() : []);
        var chip = el.closest(".tf-check");
        if (chip) chip.classList.toggle("on", on);
        return;
      }
      if (el.id === "shallow-line") {
        setSelectedStations([]);
      }
    });

    document.addEventListener("input", function (event) {
      if (event.target.id === "shallow-station-search") {
        $("shallow-station-picker").classList.add("is-open");
        renderStationPicker();
      }
    });

    document.addEventListener("click", function (event) {
      var picker = $("shallow-station-picker");
      var path = event.composedPath ? event.composedPath() : [];
      if (picker && path.indexOf(picker) < 0 && !picker.contains(event.target)) picker.classList.remove("is-open");
    });
  }

  function boot() {
    renderStats();
    renderRules();
    renderShallow();
    bindEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  global.WHTaskFreqPage = { renderRules: renderRules, renderShallow: renderShallow };
})(typeof window !== "undefined" ? window : this);
