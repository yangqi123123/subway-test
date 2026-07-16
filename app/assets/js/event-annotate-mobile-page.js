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
    compareMode: "typical",
    compareTypicalId: "",
    compareCollapsed: false,
    summary: null,
    categoryModalOpen: false,
    generateModalOpen: false,
    generateTab: "custom",
    selectedPeriodId: "",
    selectedAlarmId: "",
    selectedGenerateTypicalId: "",
    customDate: "",
    customTime: "23:59",
    customDuration: "30"
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

  function formatDateInput(dateText) {
    var match = String(dateText || "").match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (!match) return "";
    var y = match[1];
    var m = String(Number(match[2])).padStart(2, "0");
    var d = String(Number(match[3])).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function formatRouteLabel(section) {
    var cleaned = String(section || "").replace(/\s+/g, "");
    if (cleaned.indexOf("->") >= 0) return cleaned;
    return cleaned.replace(/[-–—]/g, "->");
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

  function renderComparePoint() {
    var el = $("event-compare-point");
    if (!el) return;
    el.textContent = formatAlertPointTitle(state.summary);
  }

  function filteredTypicals(categoryId) {
    var cat = categoryId || state.category;
    return TYPICAL_EVENTS.filter(function (item) {
      return item.category === cat;
    });
  }

  function categoryList() {
    return CATEGORIES.slice();
  }

  function typicalById(id) {
    return TYPICAL_EVENTS.filter(function (item) { return item.id === id; })[0] || null;
  }

  function currentTypical() {
    var list = filteredTypicals();
    var found = typicalById(state.selectedTypicalId);
    if (found && found.category === state.category) return found;
    return list[0] || null;
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

  function renderCategoryTabs(hostId) {
    var host = $(hostId || "event-category-tabs");
    if (!host) return;
    host.innerHTML = categoryList().map(function (item) {
      return '<button type="button" class="mp-event-category-btn' + (item.id === state.category ? ' is-active' : '') + '" data-category="' + esc(item.id) + '">' + esc(item.label) + '</button>';
    }).join("");
  }

  function renderGenerateCategoryTabs() {
    var host = $("event-generate-category-tabs");
    if (!host) return;
    var buttons = categoryList().map(function (item) {
      return '<button type="button" class="mp-event-category-btn' + (item.id === state.category ? ' is-active' : '') + '" data-category="' + esc(item.id) + '">' + esc(item.label) + '</button>';
    });
    buttons.push('<button type="button" class="mp-event-generate-add-category-btn" id="event-generate-add-category-btn"><i class="fa-solid fa-plus-square"></i> 新增</button>');
    host.innerHTML = buttons.join("");
  }

  function formatAlarmDate(dateText) {
    var raw = String(dateText || "").trim();
    var match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return raw;
    return match[1].slice(2) + "/" + match[2] + "/" + match[3];
  }

  function renderTypicalGallery(hostId, selectedId) {
    var host = $(hostId || "event-typical-gallery");
    if (!host) return;
    var rows = filteredTypicals();
    var sel = selectedId || state.selectedTypicalId;
    if (!rows.length) {
      host.innerHTML = '<div class="mp-event-history-item"><dt>提示</dt><dd>当前分类暂无典型事件</dd></div>';
      return;
    }
    host.innerHTML = rows.map(function (item, index) {
      return '' +
        '<button type="button" class="mp-event-typical-card' + (item.id === sel ? ' is-active' : '') + '" data-typical-id="' + esc(item.id) + '">' +
          '<div class="mp-event-typical-thumb" data-action="spectrum-preview" data-preview-group="typical" data-preview-index="' + index + '"><img src="' + esc(SPECTRUM_SRC) + '" alt="' + esc(item.title) + '" /></div>' +
          '<div class="mp-event-typical-body">' +
            '<h3 class="mp-event-typical-title">' + esc(item.title) + '</h3>' +
            '<div class="mp-event-typical-meta">' + esc(formatAlarmDate(item.date)) + '</div>' +
          '</div>' +
        '</button>';
    }).join('');
  }

  function renderGenerateTypicalGallery() {
    var host = $("event-generate-typical-gallery");
    if (!host) return;
    var rows = filteredTypicals();
    var sel = state.selectedGenerateTypicalId;
    if (!rows.length) {
      host.innerHTML = '<div class="mp-event-history-item"><dt>提示</dt><dd>当前分类暂无典型事件</dd></div>';
      return;
    }
    host.innerHTML = rows.map(function (item, index) {
      return '' +
        '<button type="button" class="mp-event-typical-card' + (item.id === sel ? ' is-active' : '') + '" data-typical-id="' + esc(item.id) + '">' +
          '<div class="mp-event-typical-thumb" data-action="spectrum-preview" data-preview-group="typical" data-preview-index="' + index + '"><img src="' + esc(SPECTRUM_SRC) + '" alt="' + esc(item.title) + '" /></div>' +
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
    global.document.querySelectorAll('[data-mode]').forEach(function (button) {
      button.classList.toggle('is-active', button.getAttribute('data-mode') === state.mode);
    });
  }

  function renderCurrentSpectrum() {
    var img = $("event-current-spectrum");
    if (img) img.src = SPECTRUM_SRC;
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
    img.alt = state.compareSpectrumLabel || "对比频谱图";
  }

  function getSpectrumPreviewSlides() {
    var slides = [];
    slides.push({ src: SPECTRUM_SRC, title: "当前告警点频谱图" });
    if (state.compareLoaded) {
      slides.push({ src: SPECTRUM_SRC, title: state.compareSpectrumLabel || "对比频谱图" });
    }
    return slides;
  }

  function openSpectrumPreview(startIndex, slides) {
    var list = slides || getSpectrumPreviewSlides();
    if (!list.length) return;
    var index = Math.max(0, Math.min(startIndex || 0, list.length - 1));
    state.spectrumPreviewIndex = index;
    state.spectrumPreviewSlides = list;
    var modal = $("event-spectrum-preview-modal");
    if (modal) modal.hidden = false;
    renderSpectrumPreview();
  }

  function buildPreviewSlides(group) {
    if (group === "alarm") {
      return ALARM_HISTORY.map(function (item) {
        return { src: SPECTRUM_SRC, title: item.date + " " + item.time + " / " + item.code + " / " + item.level };
      });
    }
    if (group === "typical") {
      return filteredTypicals().map(function (item) {
        return { src: SPECTRUM_SRC, title: item.title + " / " + item.route + " " + item.chainage };
      });
    }
    return getSpectrumPreviewSlides();
  }

  function closeSpectrumPreview() {
    var modal = $("event-spectrum-preview-modal");
    if (modal) modal.hidden = true;
    state.spectrumPreviewIndex = 0;
    state.spectrumPreviewSlides = [];
  }

  function isSpectrumPreviewOpen() {
    var modal = $("event-spectrum-preview-modal");
    return modal && !modal.hidden;
  }

  function renderSpectrumPreview() {
    var slides = state.spectrumPreviewSlides || [];
    var index = state.spectrumPreviewIndex || 0;
    var img = $("event-spectrum-preview-img");
    var title = $("event-spectrum-preview-title");
    var indexEl = $("event-spectrum-preview-index");
    var totalEl = $("event-spectrum-preview-total");
    var prevBtn = global.document.querySelector('[data-action="spectrum-preview-prev"]');
    var nextBtn = global.document.querySelector('[data-action="spectrum-preview-next"]');

    var slide = slides[index];
    if (img && slide) {
      img.src = slide.src;
      img.alt = slide.title;
    }
    if (title && slide) title.textContent = slide.title;
    if (indexEl) indexEl.textContent = String(index + 1);
    if (totalEl) totalEl.textContent = String(slides.length);
    if (prevBtn) prevBtn.disabled = index <= 0;
    if (nextBtn) nextBtn.disabled = index >= slides.length - 1;
  }

  function switchSpectrumPreview(direction) {
    var slides = state.spectrumPreviewSlides || [];
    if (!slides.length) return;
    var newIndex = state.spectrumPreviewIndex + direction;
    if (newIndex < 0 || newIndex >= slides.length) return;
    state.spectrumPreviewIndex = newIndex;
    renderSpectrumPreview();
  }

  function renderCompareInfo() {
    var meta = $("event-compare-meta");
    var title = $("event-compare-title");
    var detail = $("event-compare-detail");
    var openBtn = $("event-open-generate-btn");

    if (!state.compareLoaded) {
      if (meta) meta.textContent = "";
      if (title) title.textContent = "对比频谱图";
      if (detail) detail.innerHTML = "";
      if (openBtn) {
        openBtn.textContent = "去生成对比频谱图";
        openBtn.classList.remove("is-regenerate");
      }
      return;
    }

    var typical = typicalById(state.compareTypicalId) || currentTypical();
    var label = state.compareSpectrumLabel || "对比频谱图";
    if (title) {
      if (state.compareMode === "typical" && typical) {
        title.textContent = typical.date + ' / ' + typical.route + ' ' + typical.chainage;
      } else {
        title.textContent = label;
      }
    }
    if (meta) {
      meta.textContent = "";
    }
    if (openBtn) {
      openBtn.textContent = "重新生成";
      openBtn.classList.add("is-regenerate");
    }

    if (detail) {
      if (state.compareMode === "typical" && typical) {
        detail.innerHTML = '' +
          '<img class="mp-event-compare-photo" src="' + esc(typical.photo) + '" alt="现场照片" />' +
          '<div class="mp-event-compare-info">' +
            '<div class="mp-event-compare-info-row"><dt>复核情况</dt><dd>' + esc(typical.review) + '</dd></div>' +
            '<div class="mp-event-compare-info-row"><dt>备注</dt><dd>' + esc(typical.remark || '—') + '</dd></div>' +
          '</div>' +
          '<div class="mp-event-compare-features">' +
            '<div class="mp-event-compare-features__title">特征信息</div>' +
            '<div class="mp-event-compare-features__grid">' +
              FEATURE_IMAGES.map(function (f) {
                return '<div><img src="' + esc(f.src) + '" alt="' + esc(f.title) + '" /><div class="mp-event-compare-features__label">' + esc(f.title) + '</div></div>';
              }).join('') +
            '</div>' +
          '</div>';
      } else {
        detail.innerHTML = "";
      }
    }
  }

  function clearCompareSpectrum() {
    state.compareLoaded = false;
    state.compareSpectrumLabel = "";
    state.compareMode = "typical";
    state.compareTypicalId = "";
    state.activeHistoryId = "";
    renderCompareSpectrum();
    renderCompareInfo();
    renderHistorySelector();
  }

  function loadCompareSpectrum(label, mode, typicalId) {
    state.compareLoaded = true;
    state.compareSpectrumLabel = label || "对比频谱图";
    state.compareMode = mode || "typical";
    state.compareTypicalId = typicalId || (currentTypical() || {}).id || "";
    renderCompareSpectrum();
    renderCompareInfo();
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
    renderGenerateCategoryTabs();
    renderTypicalGallery();
    renderGenerateTypicalGallery();
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
      loadCompareSpectrum(formatPeriodOptionLabel(item), "period");
    } else {
      loadCompareSpectrum(item.date + " " + item.time, "alarm");
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

  /* 生成频谱图弹窗 */
  function openGenerateModal() {
    var modal = $("event-generate-modal");
    if (!modal) return;
    state.generateModalOpen = true;
    modal.hidden = false;
    syncGenerateTabs();
    renderGeneratePanels();
    syncGenerateButton();
  }

  function closeGenerateModal() {
    var modal = $("event-generate-modal");
    if (!modal) return;
    state.generateModalOpen = false;
    modal.hidden = true;
  }

  function switchGenerateTab(tab) {
    state.generateTab = tab || "custom";
    syncGenerateTabs();
    renderGeneratePanels();
    syncGenerateButton();
  }

  function syncGenerateTabs() {
    global.document.querySelectorAll('[data-generate-tab]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-generate-tab') === state.generateTab);
    });
  }

  function renderGeneratePanels() {
    ['custom', 'period', 'alarm', 'typical'].forEach(function (tab) {
      var panel = $('event-generate-panel-' + tab);
      if (panel) panel.hidden = tab !== state.generateTab;
    });

    if (state.generateTab === 'typical') {
      renderGenerateCategoryTabs();
      renderGenerateTypicalGallery();
    }

    if (state.generateTab === 'period') {
      renderGeneratePeriodList();
    }

    if (state.generateTab === 'alarm') {
      renderGenerateAlarmList();
    }
  }

  function renderGeneratePeriodList() {
    var host = $("event-generate-period-list");
    if (!host) return;
    host.innerHTML = PERIOD_HISTORY.map(function (item) {
      return '' +
        '<button type="button" class="mp-event-generate-period-item' + (item.id === state.selectedPeriodId ? ' is-active' : '') + '" data-period-id="' + esc(item.id) + '">' +
          esc(formatPeriodOptionLabel(item)) +
        '</button>';
    }).join("");
  }

  function renderGenerateAlarmList() {
    var host = $("event-generate-alarm-list");
    if (!host) return;
    host.innerHTML = ALARM_HISTORY.map(function (item, index) {
      return '' +
        '<button type="button" class="mp-event-generate-alarm-item' + (item.id === state.selectedAlarmId ? ' is-active' : '') + '" data-alarm-id="' + esc(item.id) + '">' +
          '<div class="mp-event-generate-alarm-thumb" data-action="spectrum-preview" data-preview-group="alarm" data-preview-index="' + index + '"><img src="' + esc(SPECTRUM_SRC) + '" alt="' + esc(item.code) + '" /></div>' +
          '<div class="mp-event-generate-alarm-date">' + esc(item.date) + '</div>' +
        '</button>';
    }).join("");
  }

  function syncGenerateButton() {
    var btn = $("event-modal-generate-btn");
    if (!btn) return;
    var enabled = false;
    switch (state.generateTab) {
      case "custom":
        enabled = true;
        break;
      case "period":
        enabled = !!state.selectedPeriodId;
        break;
      case "alarm":
        enabled = !!state.selectedAlarmId;
        break;
      case "typical":
        enabled = !!state.selectedGenerateTypicalId;
        break;
    }
    btn.disabled = !enabled;
    btn.style.opacity = enabled ? "1" : "0.5";
  }

  function generateFromModal() {
    var label = "";
    var mode = state.generateTab;
    var typical = null;

    switch (state.generateTab) {
      case "custom":
        var dateInput = $("event-modal-generate-date");
        var timeInput = $("event-modal-generate-time");
        var durationInput = $("event-modal-generate-duration");
        var dateVal = dateInput ? dateInput.value : "";
        var timeVal = timeInput ? timeInput.value : "";
        var durationVal = durationInput ? durationInput.value : "30";
        var defaultDate = state.summary && state.summary.time ? state.summary.time.split(' ')[0] : '2026-03-05';
        label = (dateVal || defaultDate) + ' ' + (timeVal || '23:59') + ' / ' + durationVal + '分钟';
        break;
      case "period":
        var period = PERIOD_HISTORY.filter(function (i) { return i.id === state.selectedPeriodId; })[0];
        if (!period) { showToast("请选择历史时段"); return; }
        label = formatPeriodOptionLabel(period);
        break;
      case "alarm":
        var alarm = ALARM_HISTORY.filter(function (i) { return i.id === state.selectedAlarmId; })[0];
        if (!alarm) { showToast("请选择历史报警"); return; }
        label = alarm.date + " " + alarm.time;
        break;
      case "typical":
        typical = typicalById(state.selectedGenerateTypicalId);
        if (!typical) { showToast("请选择典型事件"); return; }
        label = typical.title + " / " + typical.route + " " + typical.chainage;
        break;
    }

    loadCompareSpectrum(label, mode, typical ? typical.id : "");
    closeGenerateModal();
    if (state.compareCollapsed) toggleCompareCollapse(false);
    showToast("对比频谱图已生成");
  }

  function toggleCompareCollapse(forceCollapsed) {
    state.compareCollapsed = typeof forceCollapsed === "boolean" ? forceCollapsed : !state.compareCollapsed;
    var body = $("event-compare-body");
    var btn = $("event-compare-collapse-btn");
    if (body) body.classList.toggle("is-collapsed", state.compareCollapsed);
    if (btn) {
      btn.setAttribute("aria-expanded", String(!state.compareCollapsed));
      btn.innerHTML = state.compareCollapsed ? '展开 <i class="fa-solid fa-chevron-down"></i>' : '收起 <i class="fa-solid fa-chevron-up"></i>';
    }
  }

  function updateRemarkCount() {
    var textarea = $("event-remark");
    var count = $("event-remark-count");
    if (count && textarea) count.textContent = String(textarea.value || "").length;
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

      var collapseBtn = event.target.closest('#event-compare-collapse-btn');
      if (collapseBtn) {
        toggleCompareCollapse();
        return;
      }

      var toggleLegacyBtn = event.target.closest('#event-toggle-legacy-btn');
      if (toggleLegacyBtn) {
        var legacyPanel = $('event-legacy-panel');
        if (legacyPanel) {
          var isHidden = legacyPanel.hidden;
          legacyPanel.hidden = !isHidden;
          toggleLegacyBtn.textContent = isHidden ? '收起更多参考信息' : '查看更多参考信息';
        }
        return;
      }

      var openGenerateBtn = event.target.closest('#event-open-generate-btn');
      if (openGenerateBtn) {
        openGenerateModal();
        return;
      }

      var closeGenerateBtn = event.target.closest('[data-action="event-close-generate-modal"]');
      if (closeGenerateBtn) {
        closeGenerateModal();
        return;
      }

      var generateTabBtn = event.target.closest('[data-generate-tab]');
      if (generateTabBtn) {
        switchGenerateTab(generateTabBtn.getAttribute('data-generate-tab'));
        return;
      }

      var generateBtn = event.target.closest('#event-modal-generate-btn');
      if (generateBtn) {
        generateFromModal();
        return;
      }

      var previewBtn = event.target.closest('[data-action="spectrum-preview"]');
      if (previewBtn) {
        var group = previewBtn.getAttribute('data-preview-group');
        if (group) {
          var idx = parseInt(previewBtn.getAttribute('data-preview-index') || '0', 10);
          openSpectrumPreview(idx, buildPreviewSlides(group));
        } else {
          var idx2 = parseInt(previewBtn.getAttribute('data-index') || '0', 10);
          if (idx2 === 1 && !state.compareLoaded) return;
          openSpectrumPreview(idx2);
        }
        return;
      }

      var categoryBtn = event.target.closest('[data-category]');
      if (categoryBtn) {
        state.category = categoryBtn.getAttribute('data-category') || 'drill';
        ensureSelection();
        renderCategoryTabs();
        renderGenerateCategoryTabs();
        renderTypicalGallery();
        renderGenerateTypicalGallery();
        renderReferenceSpectrum();
        renderClassifyOptions();
        return;
      }

      var addCategoryBtn = event.target.closest('#event-generate-add-category-btn');
      if (addCategoryBtn) {
        openCategoryModal();
        return;
      }

      var typicalBtn = event.target.closest('[data-typical-id]');
      if (typicalBtn) {
        var tid = typicalBtn.getAttribute('data-typical-id') || '';
        if (typicalBtn.closest('#event-generate-typical-gallery')) {
          state.selectedGenerateTypicalId = state.selectedGenerateTypicalId === tid ? "" : tid;
          renderGenerateTypicalGallery();
          syncGenerateButton();
        } else {
          state.selectedTypicalId = tid;
          renderTypicalGallery();
          renderReferenceSpectrum();
        }
        return;
      }

      var modeBtn = event.target.closest('[data-mode]');
      if (modeBtn) {
        state.mode = modeBtn.getAttribute('data-mode') || 'period';
        state.activeHistoryId = "";
        syncModeUi();
        renderHistorySelector();
        return;
      }

      var historyBtn = event.target.closest('[data-history-id]');
      if (historyBtn) {
        setHistorySelection(historyBtn.getAttribute('data-history-id') || '');
        return;
      }

      var periodBtn = event.target.closest('[data-period-id]');
      if (periodBtn) {
        var pid = periodBtn.getAttribute('data-period-id') || '';
        state.selectedPeriodId = state.selectedPeriodId === pid ? "" : pid;
        renderGeneratePeriodList();
        syncGenerateButton();
        return;
      }

      var alarmBtn = event.target.closest('[data-alarm-id]');
      if (alarmBtn) {
        var aid = alarmBtn.getAttribute('data-alarm-id') || '';
        state.selectedAlarmId = state.selectedAlarmId === aid ? "" : aid;
        renderGenerateAlarmList();
        syncGenerateButton();
        return;
      }

      var legacyGenerateBtn = event.target.closest('#event-generate-btn');
      if (legacyGenerateBtn) {
        var dateVal = $('event-generate-date') ? $('event-generate-date').value : '';
        var timeVal = $('event-generate-time') ? $('event-generate-time').value : '';
        var durationVal = $('event-generate-duration') ? $('event-generate-duration').value : '30';
        var defaultDate = state.summary && state.summary.time ? state.summary.time.split(' ')[0] : '2026-03-05';
        loadCompareSpectrum((dateVal || defaultDate) + ' ' + (timeVal || '03:00') + ' / ' + durationVal + '分钟', 'custom');
        if (state.compareCollapsed) toggleCompareCollapse(false);
        showToast('历史时段频谱图已生成');
        return;
      }

      var submitBtn = event.target.closest('#event-submit-btn');
      if (submitBtn) {
        var classify = $('event-classify') ? $('event-classify').selectedOptions[0].textContent : '钻探';
        showToast('已提交“' + classify + '”标注');
      }

      var closePreviewBtn = event.target.closest('[data-action="close-spectrum-preview-modal"]');
      if (closePreviewBtn) {
        closeSpectrumPreview();
        return;
      }

      var prevBtn = event.target.closest('[data-action="spectrum-preview-prev"]');
      if (prevBtn) {
        switchSpectrumPreview(-1);
        return;
      }

      var nextBtn = event.target.closest('[data-action="spectrum-preview-next"]');
      if (nextBtn) {
        switchSpectrumPreview(1);
        return;
      }
    });

    global.document.addEventListener('change', function (event) {
      if (event.target && event.target.id === 'event-history-select') {
        setHistorySelection(event.target.value || '');
      }
      if (event.target && event.target.id === 'event-classify') {
        var val = event.target.value || '';
        if (val && val !== state.category) {
          state.category = val;
          ensureSelection();
          renderCategoryTabs();
          renderCategoryTabs("event-generate-category-tabs");
          renderTypicalGallery();
          renderTypicalGallery("event-generate-typical-gallery", state.selectedGenerateTypicalId);
          renderReferenceSpectrum();
          renderClassifyOptions();
        }
      }
    });

    global.document.addEventListener('input', function (event) {
      if (event.target && event.target.id === 'event-remark') {
        updateRemarkCount();
      }
    });

    global.document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        if (isSpectrumPreviewOpen()) return closeSpectrumPreview();
        if (state.categoryModalOpen) closeCategoryModal();
        if (state.generateModalOpen) closeGenerateModal();
      }
      if (isSpectrumPreviewOpen()) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          switchSpectrumPreview(-1);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          switchSpectrumPreview(1);
        }
      }
    });
  }

  function start() {
    state.summary = parseSummary(readQuery());
    ensureSelection();
    renderCurrentPointTitle();
    renderComparePoint();
    renderCategoryTabs();
    renderCategoryTabs("event-generate-category-tabs");
    renderTypicalGallery();
    renderTypicalGallery("event-generate-typical-gallery", state.selectedGenerateTypicalId);
    renderReferenceSpectrum();
    renderFeatures();
    renderClassifyOptions();
    renderCurrentSpectrum();
    renderBaselineSpectrum();
    renderCompareSpectrum();
    renderCompareInfo();
    syncModeUi();
    renderHistorySelector();
    syncGenerateTabs();
    renderGeneratePanels();
    syncGenerateButton();
    updateRemarkCount();

    var defaultDate = formatDateInput(state.summary && state.summary.time ? state.summary.time : '2026-03-05');
    var dateInput = $('event-generate-date');
    if (dateInput) dateInput.value = defaultDate;
    var modalDateInput = $('event-modal-generate-date');
    if (modalDateInput) modalDateInput.value = defaultDate;

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
