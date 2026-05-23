/**
 * 态势感知：GIS 告警点 + 全线预警列表跳转专家工具
 */
(function () {
  var EXPERT_URL = "map/map-expert.html";

  function goExpert(row) {
    var q = row
      ? "?from=situation&location=" + encodeURIComponent(row.location)
      : "?from=situation";
    var base = typeof whPageHref === "function" ? whPageHref(EXPERT_URL) : EXPERT_URL;
    window.location.href = base + q;
  }

  function renderTableBody() {
    var rows = (window.WuhanSituationGIS && window.WuhanSituationGIS.ALARM_ROWS) || [];
    var tbody = document.getElementById("situation-rows");
    if (!tbody) return;
    tbody.innerHTML = rows
      .map(function (row, index) {
        return (
          '<tr class="sit-list-row' +
          (index === 4 ? " active" : "") +
          '" data-alarm-index="' +
          index +
          '">' +
          '<td class="px-3 py-3 text-slate-100">' +
          row.location +
          "</td>" +
          '<td class="px-3 py-3 text-slate-100">' +
          row.time +
          "</td>" +
          '<td class="px-3 py-3 text-slate-100">' +
          row.source +
          "</td>" +
          '<td class="px-3 py-3 text-slate-100">' +
          row.status +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function initList() {
    var rows = (window.WuhanSituationGIS && window.WuhanSituationGIS.ALARM_ROWS) || [];
    document.querySelectorAll("#situation-rows tr.sit-list-row").forEach(function (tr) {
      tr.addEventListener("click", function () {
        var index = Number(tr.getAttribute("data-alarm-index"));
        goExpert(rows[index]);
      });
    });
  }

  function init() {
    renderTableBody();
    if (window.WuhanSituationGIS && window.WuhanSituationGIS.mountAlarmMap) {
      window.WuhanSituationGIS.mountAlarmMap("situation-map", {
        onMarkerClick: goExpert,
      });
    }
    initList();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
