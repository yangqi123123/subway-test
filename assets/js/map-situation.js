/**
 * 态势感知：GIS 告警点（与全景地图图标一致）+ 全线预警列表跳转专家工具
 */
(function () {
  var EXPERT_URL = "map-expert.html";

  var ALARM_ROWS = [
    {
      location: "省博湖北日报-中南医院 V20+065",
      time: "2026-03-05 08:27:27",
      source: "AI",
      status: "已复核",
      lat: 30.5878,
      lng: 114.3004,
    },
    {
      location: "中南医院-省博湖北日报 V20+066",
      time: "2026-03-05 08:27:07",
      source: "AI",
      status: "已复核",
      lat: 30.5859,
      lng: 114.3122,
    },
    {
      location: "省博湖北日报-中南医院 V20+030",
      time: "2026-03-05 08:21:36",
      source: "AI",
      status: "已复核",
      lat: 30.5842,
      lng: 114.3188,
    },
    {
      location: "岳家嘴-梨园 Y16+581",
      time: "2026-03-05 05:55:29",
      source: "传统",
      status: "已复核",
      lat: 30.5677,
      lng: 114.3651,
    },
    {
      location: "黄浦路-赵家条 Z8+689",
      time: "2026-03-05 00:14:51",
      source: "传统",
      status: "未处理",
      lat: 30.6201,
      lng: 114.3039,
    },
  ];

  function alarmIcon() {
    if (window.WuhanGIS && typeof window.WuhanGIS.makeBadgeIcon === "function") {
      return window.WuhanGIS.makeBadgeIcon("#ef4444", "fa-solid fa-circle-exclamation", 28);
    }
    return L.divIcon({
      className: "gis-badge-icon",
      html:
        '<div style="width:28px;height:28px;border-radius:999px;background:#ef4444;border:2px solid rgba(255,255,255,.92);display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 0 14px rgba(239,68,68,.45);font-size:13px;"><i class="fa-solid fa-circle-exclamation"></i></div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }

  function goExpert(row) {
    var q = row
      ? "?from=situation&location=" + encodeURIComponent(row.location)
      : "?from=situation";
    window.location.href = EXPERT_URL + q;
  }

  function renderTableBody() {
    var tbody = document.getElementById("situation-rows");
    if (!tbody) return;
    tbody.innerHTML = ALARM_ROWS.map(function (row, index) {
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
    }).join("");
  }

  function initMap(markersOut) {
    if (typeof L === "undefined") return null;
    var map =
      window.WuhanGIS && window.WuhanGIS.createSharedMap
        ? window.WuhanGIS.createSharedMap("situation-map", {
            center: [30.5806, 114.3205],
            zoom: 11,
          })
        : null;
    if (!map) return null;

    ALARM_ROWS.forEach(function (row, index) {
      var marker = L.marker([row.lat, row.lng], { icon: alarmIcon() }).addTo(map);
      marker.bindTooltip(row.location, {
        direction: "top",
        offset: [0, -14],
        opacity: 0.96,
        className: "sit-alarm-tooltip",
      });
      marker.on("mouseover", function () {
        marker.openTooltip();
      });
      marker.on("click", function () {
        goExpert(row);
      });
      markersOut.push(marker);
    });

    return map;
  }

  function initList() {
    document.querySelectorAll("#situation-rows tr.sit-list-row").forEach(function (tr) {
      tr.addEventListener("click", function () {
        var index = Number(tr.getAttribute("data-alarm-index"));
        goExpert(ALARM_ROWS[index]);
      });
    });
  }

  function init() {
    renderTableBody();
    var markers = [];
    var map = initMap(markers);
    initList();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
