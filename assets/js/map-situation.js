/**
 * Situation awareness: shared GIS alarm points and list rendering.
 */
(function () {
  var EXPERT_URL = "map/map-expert.html";
  var MOBILE_EXPERT_URL = "./expert.html";

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getRows() {
    return (window.WuhanSituationGIS && window.WuhanSituationGIS.ALARM_ROWS) || [];
  }

  function goExpert(row) {
    var q = row ? "?from=situation&location=" + encodeURIComponent(row.location) : "?from=situation";
    var isMiniApp = !!document.body.closest("[data-miniapp]");
    var base = isMiniApp ? MOBILE_EXPERT_URL : (typeof whPageHref === "function" ? whPageHref(EXPERT_URL) : EXPERT_URL);
    window.location.href = base + q;
  }

  function renderTableRow(row, index) {
    return (
      '<tr class="sit-list-row' + (index === 4 ? ' active' : '') + '" data-alarm-index="' + index + '">' +
      '<td class="px-3 py-3 align-top text-slate-100">' + escapeHtml(row.location) + '</td>' +
      '<td class="px-3 py-3 align-top text-slate-200">' + escapeHtml(row.time) + '</td>' +
      '<td class="px-3 py-3 align-top text-slate-200">' + escapeHtml(row.source) + '</td>' +
      '<td class="px-3 py-3 align-top text-slate-200">' + escapeHtml(row.status) + '</td>' +
      '</tr>'
    );
  }

  function renderCard(row, index) {
    return (
      '<article class="mp-project-card mp-staff-card mp-situation-card' + (index === 4 ? ' mp-situation-card--active' : '') + '" data-alarm-index="' + index + '">' +
      '<div class="mp-project-card__head">' +
      '<span class="mp-project-card__id">#' + (index + 1) + '</span>' +
      '<span class="mp-situation-source-tag">' + escapeHtml(row.source) + '</span>' +
      '<span class="mp-situation-status-tag">' + escapeHtml(row.status) + '</span>' +
      '</div>' +
      '<h3 class="mp-project-card__title">' + escapeHtml(row.location) + '</h3>' +
      '<dl class="mp-project-card__meta mp-staff-card__meta mp-situation-card__meta">' +
      '<div class="mp-project-card__meta-full"><dt>\u6700\u65b0\u62a5\u8b66\u65f6\u95f4</dt><dd>' + escapeHtml(row.time) + '</dd></div>' +
      '<div class="mp-project-card__meta-full"><dt>\u62a5\u8b66\u6765\u6e90</dt><dd>' + escapeHtml(row.source) + '</dd></div>' +
      '<div class="mp-project-card__meta-full"><dt>\u5904\u7406\u72b6\u6001</dt><dd>' + escapeHtml(row.status) + '</dd></div>' +
      '</dl>' +
      '<div class="mp-project-card__actions mp-staff-card__actions mp-situation-card__actions">' +
      '<button type="button" class="mp-project-action" data-action="situation-open-expert" data-alarm-index="' + index + '"><i class="fa-solid fa-wave-square"></i>\u4e13\u5bb6\u5de5\u5177</button>' +
      '</div>' +
      '</article>'
    );
  }

  function renderList() {
    var rows = getRows();
    var container = document.getElementById("situation-rows");
    if (!container) return;
    if (container.tagName === "TBODY") {
      container.innerHTML = rows.map(renderTableRow).join("");
      return;
    }
    container.innerHTML = rows.map(renderCard).join("");
  }

  function bindList() {
    var container = document.getElementById("situation-rows");
    if (!container || container.__situationBound) return;
    container.__situationBound = true;

    container.addEventListener("click", function (event) {
      var rows = getRows();
      var btn = event.target.closest("[data-action='situation-open-expert']");
      var tableRow = event.target.closest("tr[data-alarm-index]");
      var card = event.target.closest("[data-alarm-index]");
      var index = NaN;

      if (btn && container.contains(btn)) {
        index = Number(btn.getAttribute("data-alarm-index"));
      } else if (tableRow && container.contains(tableRow)) {
        index = Number(tableRow.getAttribute("data-alarm-index"));
      } else if (card && container.contains(card) && container.tagName !== "TBODY") {
        index = Number(card.getAttribute("data-alarm-index"));
      }

      if (!Number.isFinite(index) || !rows[index]) return;
      goExpert(rows[index]);
    });
  }

  function init() {
    renderList();
    bindList();
    if (window.WuhanSituationGIS && window.WuhanSituationGIS.mountAlarmMap) {
      window.WuhanSituationGIS.mountAlarmMap("situation-map", {
        onMarkerClick: goExpert,
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
