/**
 * Mobile expert tools page.
 */
(function (global) {
  "use strict";

  var DEFAULT_LABEL = "\u4e2d\u5357\u533b\u9662\u7ad9-\u6e56\u5317\u65e5\u62a5\u7ad9";
  var ALERT_DETAIL_URL = "../../patrol/pages/patrol-alerts.html?fromGis=1&id=201";
  var DEFAULT_PHOTOS = [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1599707254554-027aeb4deacd?auto=format&fit=crop&w=300&q=80",
  ];

  var reviewState = {
    projectName: "\u91d1\u878d\u8857\u516d\u4e2d\u5317\u9879\u76ee",
    falseAlarm: "\u975e\u8bef\u62a5",
    levelAdjust: "\u4e00\u7ea7\u544a\u8b66",
    scene: "\u73b0\u573a\u5de5\u5730\u6709\u7834\u62c6\u673a\u68b0\u4f5c\u4e1a",
    photos: DEFAULT_PHOTOS.slice(),
  };

  var historyRows = [
    {
      title: "\u5386\u53f2\u544a\u8b66\u4fe1\u606f1",
      start: "2026-03-02 11:46:38",
      latest: "2026-03-02 11:46:38",
      source: "\u5168\u65f6\u5168\u57df\u00b7AI",
      falseAlarm: "\u975e\u8bef\u62a5",
      review: "\u91d1\u878d\u8857\u9879\u76ee\u73b0\u573a\u6316\u571f\uff0c\u5927\u578b\u673a\u68b0\u65bd\u5de5\u4e2d\uff0c\u73b0\u573a\u52a8\u9759\u8f83\u5927\uff0c\u9700\u6301\u7eed\u5173\u6ce8\u3002",
    },
    {
      title: "\u5386\u53f2\u544a\u8b66\u4fe1\u606f2",
      start: "2026-03-04 11:52:14",
      latest: "2026-03-04 18:22:07",
      source: "\u5168\u65f6\u5168\u57df\u00b7AI",
      falseAlarm: "\u975e\u8bef\u62a5",
      review: "\u73b0\u573a\u6709\u7834\u62c6\u673a\u68b0\u6316\u6398\u65bd\u5de5\uff0c\u52a8\u9759\u6bd4\u8f83\u5927\u3002",
    },
    {
      title: "\u5386\u53f2\u544a\u8b66\u4fe1\u606f3",
      start: "2026-03-04 11:55:14",
      latest: "2026-03-04 11:55:29",
      source: "\u5168\u65f6\u5168\u57df\u00b7AI",
      falseAlarm: "\u975e\u8bef\u62a5",
      review: "\u73b0\u573a\u5de5\u5730\u6709\u6316\u673a\u540a\u88c5\u65bd\u5de5\u3002",
    },
  ];

  var locationNoteText = "";
  var noteEditing = false;

  function getQueryLocation() {
    try {
      var params = new URLSearchParams(global.location.search || "");
      return params.get("location") || DEFAULT_LABEL;
    } catch (e) {
      return DEFAULT_LABEL;
    }
  }

  function resolveSituationHome() {
    return "./situation.html";
  }

  function getExpertRow() {
    var label = getQueryLocation();
    var fallback = {
      location: label,
      time: "2026-03-05 18:30:46",
      source: "\u5168\u65f6\u5168\u57df\u00b7AI",
      status: "\u5df2\u590d\u6838",
      lat: 30.5859,
      lng: 114.3122,
    };
    if (!global.WuhanSituationGIS || !global.WuhanSituationGIS.ALARM_ROWS) return fallback;
    var found = global.WuhanSituationGIS.ALARM_ROWS.filter(function (row) {
      return row.location === label || label.indexOf(row.location) >= 0 || row.location.indexOf(label) >= 0;
    })[0];
    return found ? Object.assign({}, found, { location: label }) : fallback;
  }

  function photoGridHtml(list) {
    return (
      '<div class="mp-expert-photo-grid">' +
      list
        .map(function (src) {
          return '<img src="' + src + '" alt="\u73b0\u573a\u56fe\u7247" />';
        })
        .join("") +
      '</div>'
    );
  }

  function renderInfoCard(row) {
    var wrap = global.document.getElementById("expert-mobile-info");
    if (!wrap) return;
    wrap.innerHTML =
      '<article class="mp-project-card mp-expert-info-item">' +
      '<div class="mp-project-card__head">' +
      '<span class="mp-project-card__id">#1</span>' +
      '<span class="mp-expert-source-tag">' + row.source + '</span>' +
      '<span class="mp-expert-status-tag">' + row.status + '</span>' +
      '</div>' +
      '<h3 class="mp-project-card__title">' + row.location + '</h3>' +
      '<dl class="mp-project-card__meta">' +
      '<div class="mp-project-card__meta-full"><dt>\u6700\u65b0\u544a\u8b66\u65f6\u95f4</dt><dd>' + row.time + '</dd></div>' +
      '<div class="mp-project-card__meta-full"><dt>\u544a\u8b66\u6765\u6e90</dt><dd>' + row.source + '</dd></div>' +
      '<div class="mp-project-card__meta-full"><dt>\u5904\u7406\u72b6\u6001</dt><dd>' + row.status + '</dd></div>' +
      '</dl>' +
      '<div class="mp-project-card__actions mp-expert-actions">' +
      '<button type="button" class="mp-project-action" data-action="expert-open-alert-detail"><i class="fa-solid fa-circle-exclamation"></i>\u524d\u5f80\u544a\u8b66\u8be6\u60c5</button>' +
      '</div>' +
      '</article>';
  }

  function renderReviewCard() {
    var wrap = global.document.getElementById("expert-mobile-review");
    if (!wrap) return;
    wrap.innerHTML =
      '<article class="mp-project-card mp-expert-review-item">' +
      '<dl class="mp-project-card__meta">' +
      '<div class="mp-project-card__meta-full"><dt>\u9879\u76ee\u540d\u79f0</dt><dd>' + reviewState.projectName + '</dd></div>' +
      '<div class="mp-project-card__meta-full"><dt>\u662f\u5426\u8bef\u62a5</dt><dd>' + reviewState.falseAlarm + '</dd></div>' +
      '<div class="mp-project-card__meta-full"><dt>\u544a\u8b66\u7ea7\u522b\u8c03\u6574</dt><dd>' + reviewState.levelAdjust + '</dd></div>' +
      '<div class="mp-project-card__meta-full"><dt>\u73b0\u573a\u60c5\u51b5</dt><dd>' + reviewState.scene + '</dd></div>' +
      '<div class="mp-project-card__meta-full"><dt>\u73b0\u573a\u7167\u7247</dt><dd>' + photoGridHtml(reviewState.photos) + '</dd></div>' +
      '</dl>' +
      '</article>';
  }

  function renderHistoryCard(containerId, item, index) {
    var wrap = global.document.getElementById(containerId);
    if (!wrap) return;
    wrap.innerHTML =
      '<article class="mp-project-card mp-expert-history-item">' +
      '<dl class="mp-project-card__meta">' +
      '<div class="mp-project-card__meta-full"><dt>\u544a\u8b66\u5f00\u59cb\u65f6\u95f4</dt><dd>' + item.start + '</dd></div>' +
      '<div class="mp-project-card__meta-full"><dt>\u6700\u65b0\u544a\u8b66\u65f6\u95f4</dt><dd>' + item.latest + '</dd></div>' +
      '<div class="mp-project-card__meta-full"><dt>\u544a\u8b66\u6765\u6e90</dt><dd>' + item.source + '</dd></div>' +
      '<div class="mp-project-card__meta-full"><dt>\u662f\u5426\u8bef\u62a5</dt><dd>' + item.falseAlarm + '</dd></div>' +
      '<div class="mp-project-card__meta-full"><dt>\u590d\u6838\u60c5\u51b5</dt><dd>' + item.review + '</dd></div>' +
      '<div class="mp-project-card__meta-full"><dt>\u73b0\u573a\u7167\u7247</dt><dd>' + photoGridHtml(DEFAULT_PHOTOS) + '</dd></div>' +
      '</dl>' +
      '</article>';
  }

  function syncNoteView() {
    var view = global.document.getElementById("expert-mobile-note-view");
    var input = global.document.getElementById("expert-mobile-note-input");
    var actions = global.document.getElementById("expert-mobile-note-actions");
    if (!view || !input || !actions) return;
    if (noteEditing) {
      view.classList.add("hidden");
      input.classList.remove("hidden");
      input.value = locationNoteText;
      actions.classList.add("is-editing");
      return;
    }
    input.classList.add("hidden");
    view.classList.remove("hidden");
    actions.classList.remove("is-editing");
    var text = (locationNoteText || "").trim();
    if (!text) {
      view.textContent = "\u6682\u65e0\u5907\u6ce8";
      view.classList.add("is-empty");
    } else {
      view.textContent = text;
      view.classList.remove("is-empty");
    }
  }

  function renderLocationNote() {
    var wrap = global.document.getElementById("expert-mobile-note");
    if (!wrap) return;
    wrap.innerHTML =
      '<article class="mp-project-card mp-expert-note-item">' +
      '<div id="expert-mobile-note-view" class="mp-expert-note-view"></div>' +
      '<textarea id="expert-mobile-note-input" class="mp-expert-note-input hidden" placeholder="\u8bf7\u8f93\u5165\u5f53\u524d\u4f4d\u7f6e\u5907\u6ce8"></textarea>' +
      '<div id="expert-mobile-note-actions" class="mp-project-card__actions mp-expert-actions mp-expert-note-actions">' +
      '<div class="mp-expert-note-actions__view"><button type="button" class="mp-project-action" data-action="expert-note-edit"><i class="fa-regular fa-pen-to-square"></i>\u7f16\u8f91</button></div>' +
      '<div class="mp-expert-note-actions__edit flex gap-2">' +
      '<button type="button" class="mp-project-action" data-action="expert-note-cancel"><i class="fa-regular fa-xmark"></i>\u53d6\u6d88</button>' +
      '<button type="button" class="mp-project-action" data-action="expert-note-save"><i class="fa-regular fa-floppy-disk"></i>\u4fdd\u5b58</button>' +
      '</div>' +
      '</div>' +
      '</article>';
    syncNoteView();
  }

  function mountMap(row) {
    if (!global.WuhanSituationGIS || !global.WuhanSituationGIS.mountAlarmMap) return;
    global.WuhanSituationGIS.mountAlarmMap("expert-mobile-map", {
      rows: [row],
      center: [row.lat, row.lng],
      zoom: 13,
      focusZoom: 14,
      tooltipClass: "sit-alarm-tooltip",
    });
  }

  function showToast(msg) {
    var el = global.document.getElementById("expert-mobile-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      el.classList.remove("show");
    }, 1800);
  }

  function bindNav() {
    global.document.addEventListener("click", function (event) {
      var backBtn = event.target.closest("[data-action='mp-nav-back']");
      if (backBtn) {
        event.preventDefault();
        event.stopPropagation();
        global.location.href = resolveSituationHome();
        return;
      }
      var detailBtn = event.target.closest("[data-action='expert-open-alert-detail']");
      if (detailBtn) {
        event.preventDefault();
        event.stopPropagation();
        global.location.href = ALERT_DETAIL_URL;
        return;
      }
      var noteEdit = event.target.closest("[data-action='expert-note-edit']");
      if (noteEdit) {
        event.preventDefault();
        noteEditing = true;
        syncNoteView();
        return;
      }
      var noteCancel = event.target.closest("[data-action='expert-note-cancel']");
      if (noteCancel) {
        event.preventDefault();
        noteEditing = false;
        syncNoteView();
        return;
      }
      var noteSave = event.target.closest("[data-action='expert-note-save']");
      if (noteSave) {
        event.preventDefault();
        var input = global.document.getElementById("expert-mobile-note-input");
        locationNoteText = input ? (input.value || "").trim() : "";
        noteEditing = false;
        syncNoteView();
        showToast(locationNoteText ? "\u5907\u6ce8\u5df2\u4fdd\u5b58" : "\u5907\u6ce8\u5df2\u6e05\u7a7a");
      }
    });
  }

  function start() {
    var row = getExpertRow();
    var title = global.document.getElementById("expert-mobile-location");
    if (title) title.textContent = row.location;
    renderInfoCard(row);
    renderReviewCard();
    renderHistoryCard("expert-mobile-history-1", historyRows[0], 0);
    renderHistoryCard("expert-mobile-history-2", historyRows[1], 1);
    renderHistoryCard("expert-mobile-history-3", historyRows[2], 2);
    renderLocationNote();
    mountMap(row);
    bindNav();
    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
      global.MiniAppFrame.syncTabbar();
    }
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
