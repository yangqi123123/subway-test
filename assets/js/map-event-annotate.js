/**
 * 典型事件标注 — 频谱图统一使用专家工具同源图片，不变形展示
 */
(function (global) {
  "use strict";

  var SPECTRUM_SRC = "../../assets/images/annotate-spectrum.png";
  var SHARED_SITE_PHOTO = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80";

  var CATEGORIES = [
    { id: "drill", label: "钻探" },
    { id: "demolish", label: "破拆" },
    { id: "cat3", label: "分类3" },
    { id: "cat4", label: "分类4" },
    { id: "cat5", label: "分类5" },
    { id: "cat6", label: "分类6" },
    { id: "cat7", label: "分类7" },
    { id: "cat8", label: "分类8" },
    { id: "cat9", label: "分类9" },
    { id: "cat10", label: "分类10" },
    { id: "cat11", label: "分类11" },
  ];

  var TYPICAL_EVENTS = [
    {
      id: "typ-23",
      category: "drill",
      fbg: "FBG#23",
      date: "2022-3-25",
      route: "马房山 -> 街道口",
      chainage: "Z25+312",
      type: "钻探",
      review: "现场有钻孔机",
      remark: "典型钻探振动特征，可作为对比基准",
      photo: SHARED_SITE_PHOTO,
    },
    {
      id: "typ-24",
      category: "drill",
      fbg: "FBG#24",
      date: "2022-4-12",
      route: "马房山 -> 街道口",
      chainage: "Z25+298",
      type: "钻探",
      review: "复核通过",
      remark: "夜间施工钻探",
      photo: SHARED_SITE_PHOTO,
    },
    {
      id: "typ-26",
      category: "drill",
      fbg: "FBG#26",
      date: "2022-8-03",
      route: "马房山 -> 街道口",
      chainage: "Z25+340",
      type: "钻探",
      review: "现场有钻孔机",
      remark: "",
      photo: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "typ-31",
      category: "drill",
      fbg: "FBG#31",
      date: "2023-1-08",
      route: "街道口 -> 广埠屯",
      chainage: "Z26+105",
      type: "钻探",
      review: "现场有钻孔机",
      remark: "",
      photo: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "typ-33",
      category: "drill",
      fbg: "FBG#33",
      date: "2023-3-19",
      route: "马房山 -> 街道口",
      chainage: "Z25+420",
      type: "钻探",
      review: "非误报",
      remark: "白天施工",
      photo: "https://images.unsplash.com/photo-1599707254554-027aeb4deacd?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "typ-38",
      category: "drill",
      fbg: "FBG#38",
      date: "2023-9-11",
      route: "马房山 -> 街道口",
      chainage: "Z25+505",
      type: "钻探",
      review: "复核通过",
      remark: "",
      photo: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "typ-41",
      category: "drill",
      fbg: "FBG#41",
      date: "2024-1-22",
      route: "街道口 -> 广埠屯",
      chainage: "Z26+188",
      type: "钻探",
      review: "现场有钻孔机",
      remark: "",
      photo: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "typ-45",
      category: "demolish",
      fbg: "FBG#45",
      date: "2023-6-18",
      route: "马房山 -> 街道口",
      chainage: "Z25+580",
      type: "破拆",
      review: "破拆机械作业",
      remark: "破拆频段特征明显",
      photo: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "typ-47",
      category: "demolish",
      fbg: "FBG#47",
      date: "2023-11-02",
      route: "马房山 -> 街道口",
      chainage: "Z25+620",
      type: "破拆",
      review: "破拆机械作业",
      remark: "",
      photo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "typ-52",
      category: "drill",
      fbg: "FBG#52",
      date: "2024-2-03",
      route: "马房山 -> 街道口",
      chainage: "Z25+640",
      type: "钻探",
      review: "非误报",
      remark: "",
      photo: "https://images.unsplash.com/photo-1599707254554-027aeb4deacd?auto=format&fit=crop&w=400&q=80",
    },
  ];

  var FEATURE_LINES = ["直线波动", "直线缓变", "直线断续"];

  var PERIOD_HISTORY = [
    "2024-6-5 15:53:54",
    "2024-6-5 14:20:11",
    "2024-6-4 09:18:33",
    "2024-6-3 22:07:45",
    "2024-6-2 16:42:08",
  ];

  var ALARM_HISTORY = [
    { id: "ah1", label: "2024-6-5 15:53", fbg: "FBG#381" },
    { id: "ah2", label: "2024-6-4 11:26", fbg: "FBG#372" },
    { id: "ah3", label: "2024-6-3 08:14", fbg: "FBG#365" },
    { id: "ah4", label: "2024-6-1 19:42", fbg: "FBG#358" },
    { id: "ah5", label: "2024-5-28 16:08", fbg: "FBG#349" },
    { id: "ah6", label: "2024-5-25 09:33", fbg: "FBG#341" },
  ];

  var state = {
    category: "drill",
    selectedTypicalId: null,
    targetCase: null,
    bootParams: null,
    mode: "period",
    activePeriod: null,
    activeAlarmId: null,
    generatedLabel: null,
  };

  function $(id) {
    return document.getElementById(id);
  }

  function esc(text) {
    return String(text == null ? "" : text).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function spectrumSrc() {
    return SPECTRUM_SRC;
  }

  function spectrumImgHtml(alt) {
    return (
      '<div class="expert-chart-img-wrap"><img class="expert-chart-img" src="' +
      esc(spectrumSrc()) +
      '" alt="' +
      esc(alt || "频谱图") +
      '" /></div>'
    );
  }

  function specBlockHtml(title, half) {
    return (
      '<div class="annotate-spec-block">' +
      '<div class="annotate-spec-title">' +
      esc(title) +
      '</div><div class="annotate-spec-img-wrap' +
      (half ? " annotate-spec-img-wrap--half" : "") +
      '">' +
      spectrumImgHtml(title) +
      "</div></div>"
    );
  }

  function showToast(msg) {
    var el = $("annotate-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      el.classList.remove("show");
    }, 1800);
  }

  function parseBootParams() {
    var params = new URLSearchParams(global.location.search);
    return {
      alertId: params.get("alertId") || "",
      location: params.get("location") || "马房山 -> 街道口 Z25+610",
      project: params.get("project") || "",
      time: params.get("time") || "2024-6-23 08:14:49",
      from: params.get("from") || "",
    };
  }

  function parseDateForInput(text) {
    if (!text) return "";
    var m = String(text).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (!m) return "";
    return m[1] + "-" + String(m[2]).padStart(2, "0") + "-" + String(m[3]).padStart(2, "0");
  }

  function displayDate(isoDate) {
    if (!isoDate) return "";
    var m = String(isoDate).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (!m) return isoDate;
    return m[1] + "-" + Number(m[2]) + "-" + Number(m[3]);
  }

  function buildTargetCase(params) {
    var loc = params.location || "马房山 -> 街道口 Z25+610";
    var route = loc;
    var chainage = "";
    var match = loc.match(/^(.*?)\s+(Z\d+\+\d+)\s*$/i);
    if (match) {
      route = match[1].trim();
      chainage = match[2];
    }
    return {
      alertId: params.alertId,
      date: parseDateForInput(params.time) || "2024-06-23",
      route: route,
      chainage: chainage || "Z25+610",
      fbg: params.alertId ? "FBG#" + params.alertId : "FBG#399",
      project: params.project || "—",
    };
  }

  function buildBackHref(params) {
    var base =
      typeof global.whPageHref === "function" ? global.whPageHref("map/map-alerts.html") : "map-alerts.html";
    if (!params.alertId) return base;
    return base + (base.indexOf("?") >= 0 ? "&" : "?") + "alertId=" + encodeURIComponent(params.alertId);
  }

  function filteredTypicalEvents() {
    return TYPICAL_EVENTS.filter(function (item) {
      return item.category === state.category;
    });
  }

  function findTypical(id) {
    return TYPICAL_EVENTS.find(function (item) {
      return item.id === id;
    });
  }

  function findAlarmHistory(id) {
    return ALARM_HISTORY.find(function (item) {
      return item.id === id;
    });
  }

  function renderTabs() {
    var wrap = $("annotate-tabs");
    if (!wrap) return;
    wrap.innerHTML = CATEGORIES.map(function (cat) {
      return (
        '<button type="button" class="annotate-tab' +
        (cat.id === state.category ? " is-active" : "") +
        '" data-category="' +
        esc(cat.id) +
        '">' +
        esc(cat.label) +
        "</button>"
      );
    }).join("");
  }

  function renderGallery() {
    var gallery = $("annotate-gallery");
    if (!gallery) return;
    var list = filteredTypicalEvents();
    if (!list.length) {
      gallery.innerHTML = '<div class="annotate-empty-compare" style="margin:0;border:none;min-height:72px">该分类暂无典型事件</div>';
      updateGalleryNav(false);
      return;
    }
    gallery.innerHTML = list
      .map(function (item) {
        return (
          '<button type="button" class="annotate-thumb' +
          (item.id === state.selectedTypicalId ? " is-selected" : "") +
          '" data-typical-id="' +
          esc(item.id) +
          '">' +
          '<div class="annotate-thumb__img-wrap">' +
          spectrumImgHtml(item.fbg) +
          "</div>" +
          '<div class="annotate-thumb__label">' +
          esc(item.fbg) +
          "</div>" +
          "</button>"
        );
      })
      .join("");
    updateGalleryNav(list.length > 5);
  }

  function updateGalleryNav(show) {
    var prev = $("annotate-gallery-prev");
    var next = $("annotate-gallery-next");
    var display = show ? "" : "none";
    if (prev) prev.style.display = display;
    if (next) next.style.display = display;
  }

  function renderFeatureInfo() {
    var lines = $("annotate-feature-lines");
    if (lines) {
      lines.innerHTML = FEATURE_LINES.map(function (label, idx) {
        var dash = idx === 2 ? "6 4" : "none";
        return (
          "<div>" +
          esc(label) +
          '<svg viewBox="0 0 80 16" aria-hidden="true"><path d="M2 8 H78" stroke="#64748b" stroke-width="2" fill="none" stroke-dasharray="' +
          dash +
          '"/></svg></div>'
        );
      }).join("");
    }
    var specsWrap = $("annotate-feature-specs");
    if (!specsWrap) return;
    specsWrap.innerHTML = FEATURE_LINES.map(function () {
      return '<div class="annotate-feature-spec">' + spectrumImgHtml("特征频谱") + "</div>";
    }).join("");
  }

  function typicalHeadline(item) {
    return "典型事件对比：" + item.date + " " + item.route + " " + item.chainage + " " + item.type;
  }

  function targetHeadline() {
    var c = state.targetCase;
    return displayDate(c.date) + " " + c.route + " " + c.chainage;
  }

  function renderCompareEmpty() {
    var panel = $("annotate-compare-panel");
    if (!panel) return;
    panel.innerHTML = '<div class="annotate-empty-compare">请在上方典型事件中单击缩略图，选择对比案例</div>';
  }

  function renderComparePanel() {
    var item = findTypical(state.selectedTypicalId);
    var panel = $("annotate-compare-panel");
    if (!item || !panel) {
      renderCompareEmpty();
      return;
    }
    panel.innerHTML =
      '<div class="annotate-compare-head">' +
      esc(typicalHeadline(item)) +
      '</div><div class="annotate-compare-body"><div class="annotate-spec-block"><div class="annotate-spec-title">' +
      esc(item.fbg) +
      '</div><div class="annotate-spec-img-wrap">' +
      spectrumImgHtml(item.fbg) +
      '</div></div><div class="annotate-side-info"><div><dt>现场照片</dt><img src="' +
      esc(item.photo) +
      '" alt="现场照片" /></div><div><dt>复核情况</dt><dd>' +
      esc(item.review) +
      '</dd></div><div><dt>备注</dt><dd>' +
      esc(item.remark || "—") +
      "</dd></div></div></div>";
  }

  function renderTargetHeader() {
    var title = $("annotate-target-title");
    if (title) title.textContent = targetHeadline();
    var head = $("annotate-target-head");
    if (head) head.textContent = "";
  }

  function initTargetControls() {
    var dateInput = $("annotate-gen-date");
    var timeInput = $("annotate-gen-time");
    if (dateInput && state.targetCase.date) dateInput.value = state.targetCase.date;
    if (timeInput) timeInput.value = "03:00";
  }

  function renderTargetPlaceholder() {
    var wrap = $("annotate-target-spec-wrap");
    if (!wrap) return;
    wrap.className = "annotate-target-spec-wrap annotate-target-spec-wrap--dual";
    wrap.innerHTML =
      specBlockHtml("当前告警点频谱图", false) +
      '<div class="annotate-spec-block"><div class="annotate-spec-title">对比频谱图</div><div class="annotate-spec-img-wrap"><div class="annotate-empty-compare" id="annotate-target-placeholder">点击「生成」或选择历史记录加载右侧频谱图</div></div></div>';
    state.generatedLabel = null;
  }

  function renderPeriodSpectrum(label) {
    var wrap = $("annotate-target-spec-wrap");
    if (!wrap) return;
    wrap.className = "annotate-target-spec-wrap annotate-target-spec-wrap--dual";
    wrap.innerHTML =
      specBlockHtml("当前告警点频谱图", false) +
      specBlockHtml(label || state.targetCase.fbg, false);
    state.generatedLabel = label || state.targetCase.fbg;
  }

  function renderDualSpectrum(currentTitle, historyTitle) {
    var wrap = $("annotate-target-spec-wrap");
    if (!wrap) return;
    wrap.className = "annotate-target-spec-wrap annotate-target-spec-wrap--dual";
    wrap.innerHTML = specBlockHtml("当前告警点频谱图", false) + specBlockHtml(historyTitle || currentTitle, false);
    state.generatedLabel = currentTitle;
  }

  function syncModeUi() {
    var isPeriod = state.mode === "period";
    var genRow = $("annotate-gen-row");
    var sidebarTitle = $("annotate-sidebar-title");
    if (genRow) genRow.style.display = isPeriod ? "" : "none";
    if (sidebarTitle) {
      sidebarTitle.textContent = isPeriod ? "已生成的历史时段频谱图" : "该点位历史频谱图";
    }
    renderSidebarHistory();
    renderTargetPlaceholder();
  }

  function renderSidebarHistory() {
    var list = $("annotate-history-list");
    if (!list) return;
    if (state.mode === "period") {
      list.className = "annotate-history-list";
      list.innerHTML = PERIOD_HISTORY.map(function (slot) {
        return (
          '<button type="button" class="annotate-history-item' +
          (slot === state.activePeriod ? " is-active" : "") +
          '" data-period-slot="' +
          esc(slot) +
          '">' +
          esc(slot) +
          "</button>"
        );
      }).join("");
      return;
    }
    list.className = "annotate-history-list annotate-history-list--thumbs";
    list.innerHTML = ALARM_HISTORY.map(function (item) {
      return (
        '<button type="button" class="annotate-history-item annotate-history-thumb' +
        (item.id === state.activeAlarmId ? " is-active" : "") +
        '" data-alarm-id="' +
        esc(item.id) +
        '">' +
        '<div class="annotate-history-thumb__img">' +
        spectrumImgHtml(item.fbg) +
        "</div>" +
        '<div class="annotate-history-thumb__label">' +
        esc(item.label) +
        "<br />" +
        esc(item.fbg) +
        "</div></button>"
      );
    }).join("");
  }

  function generatePeriodSpectrum() {
    state.activePeriod = null;
    renderSidebarHistory();
    renderPeriodSpectrum("生成频谱图 · " + state.targetCase.fbg);
    showToast("频谱图已生成");
  }

  function selectPeriodHistory(slot) {
    state.activePeriod = slot;
    renderSidebarHistory();
    renderPeriodSpectrum("历史时段 · " + slot);
    showToast("已加载历史时段频谱图");
  }

  function selectAlarmHistory(id) {
    var item = findAlarmHistory(id);
    if (!item) return;
    state.activeAlarmId = id;
    renderSidebarHistory();
    renderDualSpectrum(state.targetCase.fbg, "历史报警 · " + item.fbg + " · " + item.label);
    showToast("已加载历史报警频谱对比");
  }

  function selectTypical(id) {
    state.selectedTypicalId = id;
    renderGallery();
    renderComparePanel();
  }

  function bindEvents() {
    var tabs = $("annotate-tabs");
    if (tabs) {
      tabs.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-category]");
        if (!btn) return;
        state.category = btn.getAttribute("data-category");
        if (state.selectedTypicalId) {
          var selected = findTypical(state.selectedTypicalId);
          if (!selected || selected.category !== state.category) {
            state.selectedTypicalId = null;
            renderCompareEmpty();
          }
        }
        renderTabs();
        renderGallery();
      });
    }

    var gallery = $("annotate-gallery");
    if (gallery) {
      gallery.addEventListener("click", function (e) {
        var thumb = e.target.closest("[data-typical-id]");
        if (!thumb) return;
        selectTypical(thumb.getAttribute("data-typical-id"));
      });
    }

    var prev = $("annotate-gallery-prev");
    var next = $("annotate-gallery-next");
    if (prev && gallery) {
      prev.addEventListener("click", function () {
        gallery.scrollBy({ left: -360, behavior: "smooth" });
      });
    }
    if (next && gallery) {
      next.addEventListener("click", function () {
        gallery.scrollBy({ left: 360, behavior: "smooth" });
      });
    }

    var genBtn = $("annotate-gen-btn");
    if (genBtn) {
      genBtn.addEventListener("click", function () {
        generatePeriodSpectrum();
      });
    }

    var history = $("annotate-history-list");
    if (history) {
      history.addEventListener("click", function (e) {
        var periodBtn = e.target.closest("[data-period-slot]");
        if (periodBtn && state.mode === "period") {
          selectPeriodHistory(periodBtn.getAttribute("data-period-slot"));
          return;
        }
        var alarmBtn = e.target.closest("[data-alarm-id]");
        if (alarmBtn && state.mode === "alarm") {
          selectAlarmHistory(alarmBtn.getAttribute("data-alarm-id"));
        }
      });
    }

    document.querySelectorAll(".annotate-mode-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var mode = btn.getAttribute("data-mode") || "period";
        if (state.mode === mode) return;
        state.mode = mode;
        state.activePeriod = null;
        state.activeAlarmId = null;
        document.querySelectorAll(".annotate-mode-btn").forEach(function (el) {
          el.classList.toggle("is-active", el === btn);
        });
        syncModeUi();
      });
    });

    var submit = $("annotate-submit-btn");
    if (submit) {
      submit.addEventListener("click", function () {
        showToast("标注信息已提交");
      });
    }
  }

  function init() {
    state.bootParams = parseBootParams();
    state.targetCase = buildTargetCase(state.bootParams);
    var back = $("annotate-back-alert");
    if (back) back.setAttribute("href", buildBackHref(state.bootParams));
    renderTabs();
    renderFeatureInfo();
    renderGallery();
    renderCompareEmpty();
    renderTargetHeader();
    initTargetControls();
    syncModeUi();
    bindEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : this);
