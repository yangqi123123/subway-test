(function (global) {
  "use strict";

  var SPECTRUM_SRC = "../../../assets/images/annotate-spectrum.png";
  var SITE_PHOTO = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=480&q=80";
  var FEATURE_IMAGES = [
    { title: "波形特征", src: "../../../assets/images/annotate-waveform-feature.png" },
    { title: "频谱特征", src: "../../../assets/images/annotate-spectrum-feature.png" }
  ];

  var CATEGORIES = [
    { id: "drill", label: "钻探" },
    { id: "demolish", label: "破拆" },
    { id: "machine", label: "机械施工" },
    { id: "dewater", label: "降水" }
  ];

  var TYPICAL_EVENTS = [
    {
      id: "typ-23",
      category: "drill",
      title: "FBG#23",
      date: "2022-03-25",
      route: "马房山站 - 街道口站",
      chainage: "Z25+312",
      review: "现场有钻孔机作业，复核结果与频谱特征一致。",
      remark: "典型钻探振动特征明显，可作为当前点位对比基准。",
      photo: SITE_PHOTO
    },
    {
      id: "typ-24",
      category: "drill",
      title: "FBG#24",
      date: "2022-04-12",
      route: "马房山站 - 街道口站",
      chainage: "Z25+298",
      review: "复核通过，确认为夜间钻探施工。",
      remark: "夜间作业频带更集中，适合作为夜间工况对比样本。",
      photo: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=480&q=80"
    },
    {
      id: "typ-26",
      category: "drill",
      title: "FBG#26",
      date: "2022-08-03",
      route: "马房山站 - 街道口站",
      chainage: "Z25+340",
      review: "现场有钻孔机，误报已排除。",
      remark: "白天作业时冲击段更明显，适合与当前点位做相近工况对比。",
      photo: "https://images.unsplash.com/photo-1599707254554-027aeb4deacd?auto=format&fit=crop&w=480&q=80"
    },
    {
      id: "typ-45",
      category: "demolish",
      title: "FBG#45",
      date: "2023-06-18",
      route: "马房山站 - 街道口站",
      chainage: "Z25+580",
      review: "现场存在破拆机械作业。",
      remark: "破拆频段特征明显，可快速区分施工类型。",
      photo: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=480&q=80"
    },
    {
      id: "typ-61",
      category: "machine",
      title: "FBG#61",
      date: "2024-01-09",
      route: "中南医院站 - 湖北日报站",
      chainage: "Z25+602",
      review: "大型机械吊装施工，复核结论明确。",
      remark: "机械施工频带更宽，能量分布更分散。",
      photo: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=480&q=80"
    },
    {
      id: "typ-70",
      category: "dewater",
      title: "FBG#70",
      date: "2024-04-15",
      route: "中南医院站 - 湖北日报站",
      chainage: "Z25+640",
      review: "连续降水泵作业，现场工况稳定。",
      remark: "低频连续稳定振动，适合作为降水工况参照。",
      photo: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=480&q=80"
    }
  ];

  var PERIOD_HISTORY = [
    { id: "p1", date: "2026-03-05", time: "15:53:54", duration: "30分钟" },
    { id: "p2", date: "2026-03-05", time: "14:20:11", duration: "60分钟" },
    { id: "p3", date: "2026-03-04", time: "09:18:33", duration: "120分钟" }
  ];

  var ALARM_HISTORY = [
    { id: "a1", time: "18:30:46", date: "2026-03-05", code: "FBG#201", level: "一级告警" },
    { id: "a2", time: "11:46:38", date: "2026-03-04", code: "FBG#198", level: "二级告警" },
    { id: "a3", time: "11:46:38", date: "2026-03-02", code: "FBG#193", level: "二级告警" }
  ];

  var state = {
    category: "drill",
    selectedTypicalId: "typ-23",
    mode: "period",
    activeHistoryId: "",
    compareLoaded: false,
    compareSpectrumLabel: "",
    summary: null,
    categoryModalOpen: false
  };

  var categorySeed = CATEGORIES.length + 1;

  function $(id) {
    return global.document.getElementById(id);
  }

  function esc(text) {
    return String(text == null ? "" : text).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function showToast(msg) {
    var el = $("event-annotate-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function () {
      el.classList.remove("show");
    }, 1800);
  }

  function readQuery() {
    try {
      var params = new URLSearchParams(global.location.search || "");
      return {
        alertId: params.get("alertId") || "201",
        location: params.get("location") || "马房山->街道口 Z25+610",
        project: params.get("project") || "金融街六中北项目",
        time: params.get("time") || "2024-6-23 08:14:49"
      };
    } catch (error) {
      return {
        alertId: "201",
        location: "马房山->街道口 Z25+610",
        project: "金融街六中北项目",
        time: "2024-6-23 08:14:49"
      };
    }
  }

  function parseSummary(query) {
    var raw = query.location || "";
    var section = raw;
    var position = "";
    var match = raw.match(/^(.*?)(Z\d+\+\d+)$/i);
    if (match) {
      section = match[1].trim();
      position = match[2].trim();
    }
    return {
      alertId: query.alertId,
      time: query.time,
      section: section || "马房山->街道口",
      project: query.project || "金融街六中北项目",
      position: position || "Z25+610"
    };
  }

  function formatAlertDate(timeText) {
    var match = String(timeText || "").match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (!match) return "";
    return match[1] + "-" + Number(match[2]) + "-" + Number(match[3]);
  }

  function formatRouteLabel(section) {
    return String(section || "")
      .replace(/\s*[-–—]\s*/g, "->")
      .replace(/\s+/g, "");
  }

  function formatAlertPointTitle(summary) {
    if (!summary) return "当前点位频谱图";
    var parts = [
      formatAlertDate(summary.time),
      formatRouteLabel(summary.section),
      summary.position || ""
    ].filter(Boolean);
    return parts.join(" ") || "当前点位频谱图";
  }

  function renderCurrentPointTitle() {
    var title = $("event-current-point-title");
    if (!title) return;
    title.textContent = formatAlertPointTitle(state.summary);
  }

  function filteredTypicals() {
    return TYPICAL_EVENTS.filter(function (item) {
      return item.category === state.category;
    });
  }

  function categoryList() {
    return CATEGORIES.slice();
  }

  function currentTypical() {
    var list = filteredTypicals();
    var found = list.filter(function (item) { return item.id === state.selectedTypicalId; })[0];
    return found || list[0] || null;
  }

  function ensureSelection() {
    var current = currentTypical();
    if (current) state.selectedTypicalId = current.id;
  }

  function currentHistoryRows() {
    return state.mode === "alarm" ? ALARM_HISTORY : PERIOD_HISTORY;
  }

  function currentHistoryItem() {
    return currentHistoryRows().filter(function (item) {
      return item.id === state.activeHistoryId;
    })[0] || null;
  }

  function renderCategoryTabs() {
    var host = $("event-category-tabs");
    if (!host) return;
    host.innerHTML = categoryList().map(function (item) {
      return '<button type="button" class="mp-event-category-btn' + (item.id === state.category ? ' is-active' : '') + '" data-category="' + esc(item.id) + '">' + esc(item.label) + '</button>';
    }).join("");
  }

  function formatAlarmDate(dateText) {
    var raw = String(dateText || "").trim();
    var match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return raw;
    return match[1].slice(2) + "/" + match[2] + "/" + match[3];
  }

  function renderTypicalGallery() {
    var host = $("event-typical-gallery");
    if (!host) return;
    var rows = filteredTypicals();
    if (!rows.length) {
      host.innerHTML = '<div class="mp-event-history-item"><dt>提示</dt><dd>当前分类暂无典型事件</dd></div>';
      return;
    }
    host.innerHTML = rows.map(function (item) {
      return '' +
        '<button type="button" class="mp-event-typical-card' + (item.id === state.selectedTypicalId ? ' is-active' : '') + '" data-typical-id="' + esc(item.id) + '">' +
          '<div class="mp-event-typical-thumb"><img src="' + esc(SPECTRUM_SRC) + '" alt="' + esc(item.title) + '" /></div>' +
          '<div class="mp-event-typical-body">' +
            '<h3 class="mp-event-typical-title">' + esc(item.title) + '</h3>' +
            '<div class="mp-event-typical-meta">' + esc(formatAlarmDate(item.date)) + '</div>' +
          '</div>' +
        '</button>';
    }).join('');
  }

  function renderReferenceSpectrum() {
    var item = currentTypical();
    var img = $("event-reference-spectrum");
    var meta = $("event-reference-meta");
    var detail = $("event-reference-detail");
    if (img) img.src = SPECTRUM_SRC;
    if (meta && item) meta.textContent = item.title + ' / ' + item.route + ' ' + item.chainage;
    if (detail && item) {
      detail.innerHTML = '' +
        '<dl class="mp-event-reference-item"><dt>现场照片</dt><dd><img class="mp-event-reference-photo" src="' + esc(item.photo) + '" alt="现场照片" /></dd></dl>' +
        '<dl class="mp-event-reference-item"><dt>复核情况</dt><dd>' + esc(item.review) + '</dd></dl>' +
        '<dl class="mp-event-reference-item"><dt>备注</dt><dd>' + esc(item.remark || '—') + '</dd></dl>';
    }
  }

  function renderFeatures() {
    var host = $("event-feature-list");
    if (!host) return;
    host.innerHTML = FEATURE_IMAGES.map(function (feature) {
      return '' +
        '<div class="mp-event-feature-shot">' +
          '<div class="mp-event-feature-shot__title">' + esc(feature.title) + '</div>' +
          '<img src="' + esc(feature.src) + '" alt="' + esc(feature.title) + '" />' +
        '</div>';
    }).join('');
  }

  function formatPeriodOptionLabel(item) {
    return item.date + " " + item.time;
  }

  function syncModeUi() {
    var bar = $("event-generate-bar");
    var periodPanel = $("event-period-history-panel");
    var alarmPanel = $("event-alarm-history-panel");
    if (bar) bar.style.display = state.mode === "period" ? "grid" : "none";
    if (periodPanel) periodPanel.hidden = state.mode !== "period";
    if (alarmPanel) alarmPanel.hidden = state.mode !== "alarm";
    global.document.querySelectorAll('.mp-event-tool-btn').forEach(function (button) {
      button.classList.toggle('is-active', button.getAttribute('data-mode') === state.mode);
    });
  }

  function renderBaselineSpectrum() {
    var img = $("event-baseline-spectrum");
    if (img) img.src = SPECTRUM_SRC;
  }

  function renderCompareSpectrum() {
    var wrap = $("event-compare-wrap");
    var img = $("event-compare-spectrum");
    if (!wrap || !img) return;
    if (!state.compareLoaded) {
      wrap.classList.remove("is-loaded");
      img.removeAttribute("src");
      return;
    }
    wrap.classList.add("is-loaded");
    img.src = SPECTRUM_SRC;
    img.alt = state.compareSpectrumLabel || "历史时段频谱图";
  }

  function clearCompareSpectrum() {
    state.compareLoaded = false;
    state.compareSpectrumLabel = "";
    state.activeHistoryId = "";
    renderCompareSpectrum();
    renderHistorySelector();
  }

  function loadCompareSpectrum(label) {
    state.compareLoaded = true;
    state.compareSpectrumLabel = label || "历史时段频谱图";
    renderCompareSpectrum();
  }

  function renderHistorySelector() {
    var select = $("event-history-select");
    var list = $("event-history-list");
    if (state.mode === "period") {
      if (!select) return;
      select.innerHTML = '<option value="">请选择历史时段</option>' + PERIOD_HISTORY.map(function (item) {
        return '<option value="' + esc(item.id) + '"' + (item.id === state.activeHistoryId ? ' selected' : '') + '>' + esc(formatPeriodOptionLabel(item)) + '</option>';
      }).join("");
      return;
    }
    if (!list) return;
    list.innerHTML = ALARM_HISTORY.map(function (item) {
      return '' +
        '<button type="button" class="mp-event-history-card-item' + (item.id === state.activeHistoryId ? ' is-active' : '') + '" data-history-id="' + esc(item.id) + '">' +
          '<div class="mp-event-history-card-thumb"><img src="' + esc(SPECTRUM_SRC) + '" alt="' + esc(item.code) + '" /></div>' +
          '<div class="mp-event-history-card-body">' +
            '<div class="mp-event-history-card-title">' + esc(formatAlarmDate(item.date)) + '</div>' +
          '</div>' +
        '</button>';
    }).join("");
  }

  function renderClassifyOptions() {
    var host = $("event-classify");
    if (!host) return;
    host.innerHTML = categoryList().map(function (item) {
      return '<option value="' + esc(item.id) + '">' + esc(item.label) + '</option>';
    }).join('');
    host.value = state.category;
  }

  function slugifyCategory(name) {
    var normalized = String(name || "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\u4e00-\u9fa5-]/g, "");
    if (!normalized) {
      normalized = "category-" + categorySeed;
    }
    while (CATEGORIES.some(function (item) { return item.id === normalized; })) {
      normalized = normalized + "-" + categorySeed;
      categorySeed += 1;
    }
    categorySeed += 1;
    return normalized;
  }

  function openCategoryModal() {
    var modal = $("event-category-modal");
    var nameInput = $("event-category-name");
    if (!modal) return;
    state.categoryModalOpen = true;
    modal.hidden = false;
    if (nameInput) {
      nameInput.value = "";
      nameInput.focus();
    }
  }

  function closeCategoryModal() {
    var modal = $("event-category-modal");
    if (!modal) return;
    state.categoryModalOpen = false;
    modal.hidden = true;
  }

  function saveCategory() {
    var nameInput = $("event-category-name");
    var name = nameInput ? String(nameInput.value || "").trim() : "";
    if (!name) {
      showToast("请输入分类标签名称");
      if (nameInput) nameInput.focus();
      return;
    }
    if (CATEGORIES.some(function (item) { return item.label === name; })) {
      showToast("分类标签名称已存在");
      if (nameInput) nameInput.focus();
      return;
    }

    var newCategory = {
      id: slugifyCategory(name),
      label: name
    };
    CATEGORIES.push(newCategory);
    state.category = newCategory.id;
    ensureSelection();

    renderCategoryTabs();
    renderTypicalGallery();
    renderReferenceSpectrum();
    renderClassifyOptions();
    closeCategoryModal();
    showToast("分类标签已新增");

    var tabsHost = $("event-category-tabs");
    if (tabsHost) {
      tabsHost.scrollLeft = tabsHost.scrollWidth;
    }
  }

  function setHistorySelection(id) {
    state.activeHistoryId = id || "";
    var item = currentHistoryItem();
    if (!item) {
      clearCompareSpectrum();
      return;
    }
    if (state.mode === "period") {
      loadCompareSpectrum(formatPeriodOptionLabel(item));
    } else {
      loadCompareSpectrum(item.date + " " + item.time + " / " + item.code + " / " + item.level);
    }
    renderHistorySelector();
    showToast("已加载历史时段频谱图");
  }

  function goBack() {
    var href = '../../patrol/pages/patrol-alerts.html?fromGis=1&id=' + encodeURIComponent((state.summary && state.summary.alertId) || '201');
    try {
      if (global.top && global.top !== global && global.top.document) {
        var frame = global.top.document.getElementById('app-frame');
        if (frame) {
          frame.src = 'patrol/pages/patrol-alerts.html?fromGis=1&id=' + encodeURIComponent((state.summary && state.summary.alertId) || '201');
          return;
        }
      }
    } catch (error) {}
    global.location.href = href;
  }

  function bindEvents() {
    global.document.addEventListener('click', function (event) {
      var backBtn = event.target.closest('[data-action="mp-nav-back"]');
      if (backBtn) {
        event.preventDefault();
        event.stopPropagation();
        goBack();
        return;
      }

      var addCategoryBtn = event.target.closest('#event-add-category-btn');
      if (addCategoryBtn) {
        openCategoryModal();
        return;
      }

      var closeModalBtn = event.target.closest('[data-action="event-close-category-modal"]');
      if (closeModalBtn) {
        closeCategoryModal();
        return;
      }

      var saveCategoryBtn = event.target.closest('#event-category-save-btn');
      if (saveCategoryBtn) {
        saveCategory();
        return;
      }

      var categoryBtn = event.target.closest('[data-category]');
      if (categoryBtn) {
        state.category = categoryBtn.getAttribute('data-category') || 'drill';
        ensureSelection();
        renderCategoryTabs();
        renderTypicalGallery();
        renderReferenceSpectrum();
        renderClassifyOptions();
        return;
      }

      var typicalBtn = event.target.closest('[data-typical-id]');
      if (typicalBtn) {
        state.selectedTypicalId = typicalBtn.getAttribute('data-typical-id') || state.selectedTypicalId;
        renderTypicalGallery();
        renderReferenceSpectrum();
        return;
      }

      var modeBtn = event.target.closest('[data-mode]');
      if (modeBtn) {
        state.mode = modeBtn.getAttribute('data-mode') || 'period';
        clearCompareSpectrum();
        syncModeUi();
        renderHistorySelector();
        return;
      }

      var historyBtn = event.target.closest('[data-history-id]');
      if (historyBtn) {
        setHistorySelection(historyBtn.getAttribute('data-history-id') || '');
        return;
      }

      var generateBtn = event.target.closest('#event-generate-btn');
      if (generateBtn) {
        var dateVal = $('event-generate-date') ? $('event-generate-date').value : '';
        var timeVal = $('event-generate-time') ? $('event-generate-time').value : '';
        var durationVal = $('event-generate-duration') ? $('event-generate-duration').value : '30';
        var defaultDate = state.summary && state.summary.time ? state.summary.time.split(' ')[0] : '2026-03-05';
        state.activeHistoryId = "";
        renderHistorySelector();
        loadCompareSpectrum((dateVal || defaultDate) + ' ' + (timeVal || '03:00') + ' / ' + durationVal + '分钟');
        showToast('历史时段频谱图已生成');
        return;
      }

      var submitBtn = event.target.closest('#event-submit-btn');
      if (submitBtn) {
        var classify = $('event-classify') ? $('event-classify').selectedOptions[0].textContent : '钻探';
        showToast('已提交“' + classify + '”标注');
      }
    });

    global.document.addEventListener('change', function (event) {
      if (event.target && event.target.id === 'event-history-select') {
        setHistorySelection(event.target.value || '');
      }
    });

    global.document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && state.categoryModalOpen) {
        closeCategoryModal();
      }
    });
  }

  function start() {
    state.summary = parseSummary(readQuery());
    ensureSelection();
    renderCurrentPointTitle();
    renderCategoryTabs();
    renderTypicalGallery();
    renderReferenceSpectrum();
    renderFeatures();
    renderClassifyOptions();
    renderBaselineSpectrum();
    renderCompareSpectrum();
    syncModeUi();
    renderHistorySelector();
    var dateInput = $('event-generate-date');
    if (dateInput) {
      dateInput.value = (state.summary && state.summary.time ? state.summary.time.split(' ')[0] : '2026-03-05');
    }
    bindEvents();
    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
      global.MiniAppFrame.syncTabbar();
    }
  }

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})(window);
