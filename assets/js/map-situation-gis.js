/**
 * 态势感知 / 专家工具 共用 GIS：浅色底图 + 全线告警点（与全景地图图标一致）
 */
(function () {
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

  /** 专家工具 GIS 固定展示的告警区间点位 */
  var EXPERT_ALARM_ROW = {
    location: "中南医院站-湖北日报站",
    time: "2026-03-05 08:27:07",
    source: "AI",
    status: "已复核",
    lat: 30.5859,
    lng: 114.3122,
  };

  var DEFAULT_CENTER = [30.5806, 114.3205];
  var DEFAULT_ZOOM = 11;

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

  function findRowByLocation(location) {
    if (!location) return null;
    var exact = ALARM_ROWS.filter(function (r) {
      return r.location === location;
    })[0];
    if (exact) return exact;
    return (
      ALARM_ROWS.filter(function (r) {
        return location.indexOf(r.location) >= 0 || r.location.indexOf(location) >= 0;
      })[0] || null
    );
  }

  function mountAlarmMap(containerId, options) {
    if (typeof L === "undefined") return null;
    options = options || {};

    var map =
      window.WuhanGIS && window.WuhanGIS.createSharedMap
        ? window.WuhanGIS.createSharedMap(containerId, {
            center: options.center || DEFAULT_CENTER,
            zoom: options.zoom != null ? options.zoom : DEFAULT_ZOOM,
            zoomControl: options.zoomControl !== false,
            satellite: false,
          })
        : null;
    if (!map) return null;

    var markers = [];
    var rows = options.rows && options.rows.length ? options.rows : ALARM_ROWS;
    var highlightRow = findRowByLocation(options.highlightLocation);
    if (!highlightRow && rows.length === 1) highlightRow = rows[0];
    var tooltipClass = options.tooltipClass || "sit-alarm-tooltip";

    rows.forEach(function (row) {
      var marker = L.marker([row.lat, row.lng], { icon: alarmIcon() }).addTo(map);
      marker.bindTooltip(row.location, {
        direction: "top",
        offset: [0, -14],
        opacity: 0.96,
        className: tooltipClass,
      });
      marker.on("mouseover", function () {
        marker.openTooltip();
      });
      if (typeof options.onMarkerClick === "function") {
        marker.on("click", function () {
          options.onMarkerClick(row, marker);
        });
      }
      if (highlightRow && highlightRow.location === row.location) {
        marker.setZIndexOffset(600);
        marker.openTooltip();
      }
      markers.push({ row: row, marker: marker });
    });

    if (highlightRow) {
      map.setView([highlightRow.lat, highlightRow.lng], options.focusZoom != null ? options.focusZoom : 13);
    } else if (rows.length === 1) {
      map.setView([rows[0].lat, rows[0].lng], options.focusZoom != null ? options.focusZoom : 13);
    }

    setTimeout(function () {
      map.invalidateSize();
    }, 80);

    return { map: map, markers: markers, rows: rows, highlightRow: highlightRow };
  }

  window.WuhanSituationGIS = {
    ALARM_ROWS: ALARM_ROWS,
    EXPERT_ALARM_ROW: EXPERT_ALARM_ROW,
    DEFAULT_CENTER: DEFAULT_CENTER,
    DEFAULT_ZOOM: DEFAULT_ZOOM,
    alarmIcon: alarmIcon,
    findRowByLocation: findRowByLocation,
    mountAlarmMap: mountAlarmMap,
  };
})();
