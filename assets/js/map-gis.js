(function () {
  var WUHAN = [30.5928, 114.3055];

  function createSharedMap(containerOrId, options) {
    if (typeof L === "undefined") return null;
    var target = typeof containerOrId === "string" ? document.getElementById(containerOrId) : containerOrId;
    if (!target) return null;

    var opts = options || {};
    var road =
      opts.roadLayer ||
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      });

    var satellite =
      opts.satelliteLayer ||
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri",
        maxZoom: 19,
      });

    var useSatellite = !!opts.satellite;
    var map = L.map(target, {
      center: opts.center || WUHAN,
      zoom: opts.zoom || 12,
      zoomControl: opts.zoomControl !== false,
      layers: [useSatellite ? satellite : road],
    });

    if (typeof opts.onReady === "function") {
      opts.onReady(map, { road: road, satellite: satellite });
    }
    return map;
  }

  window.WuhanGIS = window.WuhanGIS || {};
  window.WuhanGIS.createSharedMap = createSharedMap;

  function buildAirportDronePanelHtml(items) {
    return (
      '<div class="gis-airport-panel' + (items.length === 1 ? " gis-airport-panel--single" : "") + '">' +
      items
        .map(function (item) {
          return (
            '<div class="gis-airport-card">' +
            '<div class="gis-airport-card__row"><span class="gis-airport-card__label">机场名称:</span><span class="gis-airport-card__value">' +
            item.airportName +
            "</span></div>" +
            '<div class="gis-airport-card__row"><span class="gis-airport-card__label">当前状态:</span><span class="gis-airport-status"><i class="fa-solid fa-circle"></i>' +
            item.airportStatus +
            "</span></div>" +
            '<div class="gis-airport-card__spacer"></div>' +
            '<div class="gis-airport-card__row"><span class="gis-airport-card__label">无人机名称:</span><span class="gis-airport-card__value">' +
            item.droneName +
            "</span></div>" +
            '<div class="gis-airport-card__row"><span class="gis-airport-card__label">当前状态:</span><span class="gis-airport-status"><i class="fa-solid fa-circle"></i>' +
            item.droneStatus +
            "</span></div>" +
            '<div class="gis-airport-card__row"><span class="gis-airport-card__label">电量:</span><span class="gis-airport-card__value">' +
            item.battery +
            "</span></div>" +
            '<div class="gis-airport-card__row"><span class="gis-airport-card__label">是否满足起飞条件:</span><span class="gis-airport-card__value ' +
            (item.ready ? "is-ready" : "is-not-ready") +
            '">' +
            item.readyText +
            "</span></div>" +
            (item.distance
              ? '<div class="gis-airport-card__row"><span class="gis-airport-card__label">与该报警点之间的距离:</span><span class="gis-airport-card__value ' +
                (item.ready ? "" : "is-not-ready") +
                '">' +
                item.distance +
                "</span></div>"
              : "") +
            '<div class="gis-detail-action"><button type="button" class="gis-detail-btn" data-flight-url="map-cockpit-fly.html">启用此无人机</button></div>' +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function ensureDetailPanel(container) {
    if (!container) return null;
    var panel = container.querySelector(".gis-detail-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.className = "gis-detail-panel hidden";
      panel.innerHTML =
        '<div class="gis-detail-head">' +
        '<div class="gis-detail-title">详情</div>' +
        '<button type="button" class="gis-detail-close">×</button>' +
        "</div>" +
        '<div class="gis-detail-body"></div>';
      container.appendChild(panel);
    }
    return {
      panel: panel,
      title: panel.querySelector(".gis-detail-title"),
      body: panel.querySelector(".gis-detail-body"),
      close: panel.querySelector(".gis-detail-close"),
    };
  }

  function wireDetailPanel(detailEls) {
    if (!detailEls || !detailEls.panel) return null;
    function closePanel() {
      detailEls.panel.classList.add("hidden");
    }
    function openPanel(title, html) {
      detailEls.title.textContent = title;
      detailEls.body.innerHTML = html;
      detailEls.panel.classList.remove("hidden");
      detailEls.body.querySelectorAll("[data-flight-url]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          window.location.href = btn.getAttribute("data-flight-url");
        });
      });
    }
    if (detailEls.close && !detailEls.close.dataset.bound) {
      detailEls.close.dataset.bound = "1";
      detailEls.close.addEventListener("click", closePanel);
    }
    return { openPanel: openPanel, closePanel: closePanel };
  }

  window.WuhanGIS.renderAirportDronePanelHtml = buildAirportDronePanelHtml;
  window.WuhanGIS.mountCockpitMap = function (containerId, options) {
    if (typeof L === "undefined") return null;
    var container = typeof containerId === "string" ? document.getElementById(containerId) : containerId;
    if (!container) return null;
    var shell = container.parentElement || container;
    if (getComputedStyle(shell).position === "static") shell.style.position = "relative";

    var detailEls = ensureDetailPanel(shell);
    var detailApi = wireDetailPanel(detailEls);
    var config = options || {};
    var airportDetails = config.airportDetails || [
      { ll: [30.588, 114.302], airportName: "机场1", droneName: "001", battery: "100%", ready: true, readyText: "满足" },
      { ll: [30.602, 114.338], airportName: "机场2", droneName: "002", battery: "86%", ready: true, readyText: "满足" },
    ];
    var alarmDetails = config.alarmDetails || [
      {
        ll: [30.598, 114.318],
        items: [
          { airportName: "机场1", airportStatus: "在线", droneName: "001", droneStatus: "在线", battery: "100%", ready: true, readyText: "满足", distance: "1.3km" },
          { airportName: "机场2", airportStatus: "在线", droneName: "002", droneStatus: "在线", battery: "30%", ready: false, readyText: "不满足", distance: "5.3km" },
        ],
      },
      {
        ll: [30.572, 114.292],
        items: [
          { airportName: "机场1", airportStatus: "在线", droneName: "001", droneStatus: "在线", battery: "92%", ready: true, readyText: "满足", distance: "2.1km" },
        ],
      },
      {
        ll: [30.618, 114.328],
        items: [
          { airportName: "机场2", airportStatus: "在线", droneName: "002", droneStatus: "在线", battery: "64%", ready: true, readyText: "满足", distance: "2.8km" },
        ],
      },
    ];

    var map = createSharedMap(container, {
      center: config.center || [30.585, 114.365],
      zoom: config.zoom || 13,
      zoomControl: config.zoomControl !== false,
    });
    if (!map) return null;

    (config.polylines || []).forEach(function (line) {
      L.polyline(line.points, {
        color: line.color,
        weight: line.weight || 4,
        opacity: line.opacity == null ? 1 : line.opacity,
      }).addTo(map);
    });

    airportDetails.forEach(function (item) {
      var marker = L.marker(item.ll, { icon: makeBadgeIcon("#0f766e", "fa-solid fa-plane-departure", 30) }).addTo(map);
      marker.on("click", function () {
        detailApi.openPanel(
          "机场及关联无人机详情",
          buildAirportDronePanelHtml([
            {
              airportName: item.airportName,
              airportStatus: item.airportStatus || "在线",
              droneName: item.droneName,
              droneStatus: item.droneStatus || "在线",
              battery: item.battery,
              ready: item.ready,
              readyText: item.readyText,
            },
          ])
        );
      });
    });

    alarmDetails.forEach(function (item) {
      var marker = L.marker(item.ll, { icon: makeBadgeIcon("#ef4444", "fa-solid fa-circle-exclamation", 28) }).addTo(map);
      marker.on("click", function () {
        detailApi.openPanel("附近机场及关联无人机详情", buildAirportDronePanelHtml(item.items));
      });
    });

    return { map: map, detailApi: detailApi };
  };

  function haversineM(a, b) {
    var R = 6371000;
    var dLat = ((b[0] - a[0]) * Math.PI) / 180;
    var dLng = ((b[1] - a[1]) * Math.PI) / 180;
    var lat1 = (a[0] * Math.PI) / 180;
    var lat2 = (b[0] * Math.PI) / 180;
    var s =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
  }

  function ringAreaM2(latlngs) {
    if (latlngs.length < 3) return 0;
    var R = 6371000;
    var sum = 0;
    for (var i = 0; i < latlngs.length; i++) {
      var p1 = latlngs[i];
      var p2 = latlngs[(i + 1) % latlngs.length];
      var lng1 = (p1[1] * Math.PI) / 180;
      var lng2 = (p2[1] * Math.PI) / 180;
      var lat1 = (p1[0] * Math.PI) / 180;
      var lat2 = (p2[0] * Math.PI) / 180;
      sum += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    return Math.abs((sum * R * R) / 2);
  }

  function makeBadgeIcon(color, iconClass, size) {
    var badgeSize = size || 28;
    return L.divIcon({
      className: "gis-badge-icon",
      html:
        '<div style="' +
        "width:" + badgeSize + "px;" +
        "height:" + badgeSize + "px;" +
        "border-radius:999px;" +
        "background:" + color + ";" +
        "border:2px solid rgba(255,255,255,0.92);" +
        "display:flex;align-items:center;justify-content:center;" +
        "color:#ffffff;" +
        "box-shadow:0 0 0 2px rgba(34,211,238,0.24),0 0 14px rgba(34,211,238,0.35),0 0 22px " + color + ";" +
        'font-size:13px;font-weight:700;"><i class="' +
        iconClass +
        '"></i></div>',
      iconSize: [badgeSize, badgeSize],
      iconAnchor: [badgeSize / 2, badgeSize / 2],
    });
  }

  function makePhotoDropIcon() {
    return L.divIcon({
      className: "gis-photo-drop-icon",
      html: '<div class="gis-photo-drop"><i class="fa-solid fa-droplet"></i></div>',
      iconSize: [22, 30],
      iconAnchor: [11, 30],
      popupAnchor: [0, -18],
      tooltipAnchor: [0, -18],
    });
  }

  function init() {
    var container = document.getElementById("map-container");
    if (!container || typeof L === "undefined") return;

    var filterPanel = document.querySelector(".gis-filter-panel");
    var road = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    });
    var satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri",
      maxZoom: 19,
    });
    var map = createSharedMap(container, {
      center: WUHAN,
      zoom: 12,
      zoomControl: true,
      roadLayer: road,
      satelliteLayer: satellite,
    });
    if (!map) return;

    var detailPanel = document.getElementById("gis-detail-panel");
    var detailTitle = document.getElementById("gis-detail-title");
    var detailBody = document.getElementById("gis-detail-body");
    var detailClose = document.getElementById("gis-detail-close");

    var baseIsSatellite = false;
    var drawLayer = L.layerGroup().addTo(map);
    var pickLayer = L.layerGroup().addTo(map);

    var layers = {
      stations: L.layerGroup(),
      projects: L.layerGroup(),
      staff: L.layerGroup(),
      alarms: L.layerGroup(),
      airports: L.layerGroup(),
      drones: L.layerGroup(),
      patrolDone: L.layerGroup(),
      patrolTodo: L.layerGroup(),
      patrolPhotos: L.layerGroup(),
      emergency: {},
      metro: {},
    };

    var state = {
      stations: true,
      projects: true,
      staff: true,
      alarms: true,
      airports: true,
      drones: true,
      patrolDone: false,
      patrolTodo: true,
      emergency: {},
      metro: {},
    };

    var metroColors = {
      l1: "#1d4ed8",
      l2: "#db2777",
      l3: "#ca8a04",
      l4: "#16a34a",
      l5: "#7f1d1d",
      l6: "#14532d",
      l7: "#ea580c",
      l8: "#64748b",
      l11: "#ca8a04",
      l16: "#c026d3",
      l19: "#0d9488",
      lyl: "#6d28d9",
    };
    var emKeys = ["e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8"];
    var patrolPhotoMarkerCreated = false;

    function closeDetailPanel() {
      if (!detailPanel) return;
      detailPanel.classList.add("hidden");
    }

    function openDetailPanel(title, html) {
      if (!detailPanel || !detailTitle || !detailBody) return;
      detailTitle.textContent = title;
      detailBody.innerHTML = html;
      detailPanel.classList.remove("hidden");
      detailBody.querySelectorAll("[data-flight-url]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          window.location.href = btn.getAttribute("data-flight-url");
        });
      });
    }

    if (detailClose) {
      detailClose.addEventListener("click", function () {
        closeDetailPanel();
      });
    }

    function renderDetailFields(fields) {
      return (
        '<div class="gis-info-grid">' +
        fields
          .map(function (field) {
            return (
              '<div class="gis-detail-field">' +
              '<div class="gis-detail-label">' +
              field.label +
              "</div>" +
              '<div class="gis-detail-value">' +
              (field.value || "-") +
              "</div>" +
              "</div>"
            );
          })
          .join("") +
        "</div>"
      );
    }

    function renderTrackPanel(data) {
      return (
        '<div class="gis-track-card">' +
        '<div class="gis-track-head">' +
        '<div class="gis-detail-field"><div class="gis-detail-label">设备编号</div><div class="gis-detail-value">' +
        data.deviceCode +
        "</div></div>" +
        '<div class="gis-detail-field"><div class="gis-detail-label">时间范围</div><div class="gis-detail-value">' +
        data.timeRange +
        "</div></div>" +
        "</div>" +
        '<div class="gis-detail-list">' +
        data.records
          .map(function (item) {
            return (
              '<div class="gis-detail-list-row">' +
              '<div class="gis-track-row-title">' +
              item.code +
              "</div>" +
              '<div class="gis-track-row-time">' +
              item.time +
              "</div>" +
              "</div>"
            );
          })
          .join("") +
        "</div>" +
        '<div class="gis-detail-action"><button type="button" class="gis-detail-btn">播放轨迹</button></div>' +
        "</div>"
      );
    }

    function renderLongTextFields(fields) {
      return fields
        .map(function (field) {
          return (
            '<div class="gis-detail-field">' +
            '<div class="gis-detail-label">' +
            field.label +
            "</div>" +
            '<div class="gis-detail-value' +
            (field.multiline ? " gis-detail-value--block" : "") +
            '">' +
            (field.value || "-") +
            "</div>" +
            "</div>"
          );
        })
        .join("");
    }

    function renderAirportDronePanel(items) {
      return (
        '<div class="gis-airport-panel' + (items.length === 1 ? " gis-airport-panel--single" : "") + '">' +
        items
          .map(function (item) {
            return (
              '<div class="gis-airport-card">' +
              '<div class="gis-airport-card__row"><span class="gis-airport-card__label">机场名称:</span><span class="gis-airport-card__value">' +
              item.airportName +
              "</span></div>" +
              '<div class="gis-airport-card__row"><span class="gis-airport-card__label">当前状态:</span><span class="gis-airport-status"><i class="fa-solid fa-circle"></i>' +
              item.airportStatus +
              "</span></div>" +
              '<div class="gis-airport-card__spacer"></div>' +
              '<div class="gis-airport-card__row"><span class="gis-airport-card__label">无人机名称:</span><span class="gis-airport-card__value">' +
              item.droneName +
              "</span></div>" +
              '<div class="gis-airport-card__row"><span class="gis-airport-card__label">当前状态:</span><span class="gis-airport-status"><i class="fa-solid fa-circle"></i>' +
              item.droneStatus +
              "</span></div>" +
              '<div class="gis-airport-card__row"><span class="gis-airport-card__label">电量:</span><span class="gis-airport-card__value">' +
              item.battery +
              "</span></div>" +
              '<div class="gis-airport-card__row"><span class="gis-airport-card__label">是否满足起飞条件:</span><span class="gis-airport-card__value ' +
              (item.ready ? "is-ready" : "is-not-ready") +
              '">' +
              item.readyText +
              "</span></div>" +
            (item.distance
              ? '<div class="gis-airport-card__row"><span class="gis-airport-card__label">与该报警点之间的距离:</span><span class="gis-airport-card__value ' +
                (item.ready ? "" : "is-not-ready") +
                '">' +
                item.distance +
                "</span></div>"
              : "") +
            '<div class="gis-detail-action"><button type="button" class="gis-detail-btn" data-flight-url="map-cockpit-fly.html">启用此无人机</button></div>' +
            "</div>"
          );
        })
        .join("") +
        "</div>"
      );
    }

    function getProjectLatestPhoto(item) {
      var key = item.ll[0].toFixed(3) + "," + item.ll[1].toFixed(3);
      var photoMap = {
        "30.605,114.295": { src: "assets/img/ref-dashboard-neon.png", time: "2026/05/14 09:26", ll: [30.587, 114.296] },
        "30.575,114.325": { src: "assets/img/map-gis-satellite.png", time: "2026/05/14 10:42", ll: [30.584, 114.302] },
        "30.565,114.300": { src: "assets/img/map-gis-road.png", time: "2026/05/14 14:08", ll: [30.590, 114.306] },
      };
      return photoMap[key] || null;
    }

    function jitter(seed, i) {
      return ((seed * 9301 + 49297 + i * 17) % 233280) / 233280 - 0.5;
    }

    var metroPaths = {
      l1: [
        [30.614, 114.214], [30.610, 114.242], [30.606, 114.268], [30.602, 114.296], [30.600, 114.323],
        [30.598, 114.349], [30.596, 114.374], [30.594, 114.401], [30.592, 114.428]
      ],
      l2: [
        [30.671, 114.211], [30.653, 114.235], [30.635, 114.258], [30.618, 114.281], [30.602, 114.304],
        [30.586, 114.329], [30.571, 114.352], [30.556, 114.377], [30.541, 114.401]
      ],
      l3: [
        [30.645, 114.253], [30.629, 114.266], [30.612, 114.280], [30.595, 114.295], [30.578, 114.309],
        [30.563, 114.323], [30.548, 114.336], [30.532, 114.350]
      ],
      l4: [
        [30.625, 114.188], [30.617, 114.223], [30.609, 114.258], [30.601, 114.293], [30.592, 114.327],
        [30.584, 114.362], [30.576, 114.396], [30.568, 114.430]
      ],
      l5: [
        [30.621, 114.272], [30.607, 114.286], [30.593, 114.301], [30.579, 114.315], [30.565, 114.329],
        [30.551, 114.344], [30.537, 114.358]
      ],
      l6: [
        [30.690, 114.247], [30.667, 114.260], [30.644, 114.274], [30.620, 114.287], [30.597, 114.301],
        [30.574, 114.314], [30.551, 114.327]
      ],
      l7: [
        [30.654, 114.292], [30.635, 114.297], [30.616, 114.302], [30.597, 114.307], [30.578, 114.312],
        [30.559, 114.318], [30.540, 114.323]
      ],
      l8: [
        [30.676, 114.327], [30.654, 114.331], [30.632, 114.335], [30.610, 114.339], [30.588, 114.343],
        [30.566, 114.347], [30.544, 114.351]
      ],
      l11: [
        [30.602, 114.292], [30.594, 114.311], [30.586, 114.330], [30.579, 114.349], [30.572, 114.368],
        [30.565, 114.387], [30.558, 114.406]
      ],
      l16: [
        [30.739, 114.218], [30.714, 114.236], [30.690, 114.254], [30.666, 114.272], [30.642, 114.290],
        [30.618, 114.308]
      ],
      l19: [
        [30.746, 114.379], [30.724, 114.373], [30.701, 114.367], [30.678, 114.361], [30.655, 114.355],
        [30.632, 114.349], [30.609, 114.343]
      ],
      lyl: [
        [30.614, 114.252], [30.608, 114.270], [30.603, 114.289], [30.598, 114.307], [30.593, 114.326],
        [30.588, 114.344], [30.583, 114.363]
      ]
    };

    ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l11", "l16", "l19", "lyl"].forEach(function (key) {
      var glow = L.polyline(metroPaths[key], {
        color: metroColors[key],
        weight: 9,
        opacity: 0.18,
        lineCap: "round",
        lineJoin: "round"
      });
      var poly = L.polyline(metroPaths[key], {
        color: metroColors[key],
        weight: 5,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round"
      });
      layers.metro[key] = L.layerGroup([glow, poly]);
      state.metro[key] = key === "l8";
    });

    [
      {
        ll: [30.58, 114.28],
        name: "积玉桥站",
        line: "武汉地铁 2 号线",
        startMileage: "K12+340",
        endMileage: "K12+980",
        length: "640 米",
        lng: "114.280000",
        lat: "30.580000",
      },
      {
        ll: [30.595, 114.32],
        name: "中南路站",
        line: "武汉地铁 4 号线",
        startMileage: "K18+260",
        endMileage: "K19+040",
        length: "780 米",
        lng: "114.320000",
        lat: "30.595000",
      },
      {
        ll: [30.61, 114.34],
        name: "岳家嘴站",
        line: "武汉地铁 8 号线",
        startMileage: "K21+180",
        endMileage: "K21+860",
        length: "680 米",
        lng: "114.340000",
        lat: "30.610000",
      },
      {
        ll: [30.57, 114.31],
        name: "复兴路站",
        line: "武汉地铁 5 号线",
        startMileage: "K09+320",
        endMileage: "K09+960",
        length: "640 米",
        lng: "114.310000",
        lat: "30.570000",
      },
      {
        ll: [30.6, 114.29],
        name: "螃蟹岬站",
        line: "武汉地铁 7 号线",
        startMileage: "K15+200",
        endMileage: "K15+910",
        length: "710 米",
        lng: "114.290000",
        lat: "30.600000",
      },
      {
        ll: [30.585, 114.335],
        name: "宝通寺站",
        line: "武汉地铁 11 号线",
        startMileage: "K11+460",
        endMileage: "K12+150",
        length: "690 米",
        lng: "114.335000",
        lat: "30.585000",
      },
    ].forEach(function (item) {
      var marker = L.marker(item.ll, { icon: makeBadgeIcon("#2563eb", "fa-solid fa-train-subway", 28) }).addTo(layers.stations);
      marker.on("click", function () {
        openDetailPanel(
          "站点详情",
          renderDetailFields([
            { label: "站点名称", value: item.name },
            { label: "所属线路", value: item.line },
            { label: "开始里程", value: item.startMileage },
            { label: "结束里程", value: item.endMileage },
            { label: "长度", value: item.length },
            { label: "经度", value: item.lng },
            { label: "纬度", value: item.lat },
          ])
        );
      });
    });

    [
      {
        ll: [30.605, 114.295],
        name: "武昌段排水改造工程",
        line: "武汉地铁 2 号线",
        section: "积玉桥站 - 螃蟹岬站",
        projectType: "市政施工",
        category: "基坑开挖",
        minDistance: "13.6 米",
        depth: "18.2 米",
        relation: "项目位于地铁区间北侧，施工基坑与地铁主体平行布置，周边设围护桩及分级降水措施。",
      },
      {
        ll: [30.575, 114.325],
        name: "武珞路电力迁改项目",
        line: "武汉地铁 5 号线",
        section: "复兴路站 - 宝通寺站",
        projectType: "管线迁改",
        category: "浅埋开挖",
        minDistance: "10.8 米",
        depth: "15.4 米",
        relation: "项目跨越地铁保护区边界，施工范围与附属出入口邻近，需强化沉降及位移联测。",
      },
      {
        ll: [30.62, 114.31],
        name: "徐东片区综合开发",
        line: "武汉地铁 8 号线",
        section: "岳家嘴站 - 徐东站",
        projectType: "房建工程",
        category: "桩基施工",
        minDistance: "21.3 米",
        depth: "22.6 米",
        relation: "项目与车站东端设备区相邻，桩基施工需避让既有管线并执行夜间噪声管控要求。",
      },
      {
        ll: [30.565, 114.3],
        name: "首义片区道路整治",
        line: "武汉地铁 4 号线",
        section: "复兴路站 - 首义路站",
        projectType: "道路提升",
        category: "路面翻修",
        minDistance: "8.9 米",
        depth: "12.8 米",
        relation: "项目位于站点西南侧，施工车辆频繁进出，需重点关注路面荷载与围挡稳定情况。",
      },
    ].forEach(function (item) {
      var marker = L.marker(item.ll, { icon: makeBadgeIcon("#f97316", "fa-solid fa-building", 28) }).addTo(layers.projects);
      marker.on("click", function () {
        openDetailPanel(
          "项目详情",
          renderLongTextFields([
            { label: "项目名称", value: item.name },
            { label: "所属线路", value: item.line },
            { label: "所在区间站点", value: item.section },
            { label: "项目类型", value: item.projectType },
            { label: "工程类别", value: item.category },
            { label: "距离地铁结构最小净距", value: item.minDistance },
            { label: "地铁结构埋深", value: item.depth },
            { label: "位置关系", value: item.relation, multiline: true },
          ])
        );
      });

      var latestPhoto = getProjectLatestPhoto(item);
      if (latestPhoto && !patrolPhotoMarkerCreated) {
        patrolPhotoMarkerCreated = true;
        L.marker(latestPhoto.ll || item.ll, { icon: makePhotoDropIcon(), zIndexOffset: 680 })
          .addTo(layers.patrolPhotos)
          .bindTooltip(
            '<div class="gis-photo-tooltip">' +
              '<div class="gis-photo-tooltip__head">' +
                '<span class="gis-photo-tooltip__title">工地最新照片</span>' +
                '<span class="gis-photo-tooltip__time">' + latestPhoto.time + "</span>" +
              "</div>" +
              '<div class="gis-photo-tooltip__name">' + item.name + "</div>" +
              '<img class="gis-photo-tooltip__image" src="' + latestPhoto.src + '" alt="' + item.name + ' 最新照片" />' +
            "</div>",
            {
              direction: "top",
              offset: [0, -20],
              opacity: 1,
              className: "gis-photo-tooltip-wrap",
              sticky: true,
            }
          );
      }
    });

    [
      {
        ll: [WUHAN[0] + jitter(50, 0) * 0.04, WUHAN[1] + jitter(51, 0) * 0.05],
        deviceCode: "Y18807",
        timeRange: "2026/04/08 08:30:00 - 2026/04/08 18:00:00",
        records: [
          { code: "Y18807-248447", time: "2026/04/08 08:38:15" },
          { code: "Y18807-248451", time: "2026/04/08 10:12:06" },
          { code: "Y18807-248468", time: "2026/04/08 14:26:41" },
        ],
      },
      {
        ll: [WUHAN[0] + jitter(50, 1) * 0.04, WUHAN[1] + jitter(51, 1) * 0.05],
        deviceCode: "Y18812",
        timeRange: "2026/04/09 07:00:00 - 2026/04/09 17:30:00",
        records: [
          { code: "Y18812-248602", time: "2026/04/09 07:18:23" },
          { code: "Y18812-248615", time: "2026/04/09 11:43:08" },
          { code: "Y18812-248633", time: "2026/04/09 16:12:50" },
        ],
      },
      {
        ll: [WUHAN[0] + jitter(50, 2) * 0.04, WUHAN[1] + jitter(51, 2) * 0.05],
        deviceCode: "Y18819",
        timeRange: "2026/04/10 09:00:00 - 2026/04/10 20:00:00",
        records: [
          { code: "Y18819-248741", time: "2026/04/10 09:31:02" },
          { code: "Y18819-248763", time: "2026/04/10 13:22:47" },
          { code: "Y18819-248788", time: "2026/04/10 18:09:13" },
        ],
      },
      {
        ll: [WUHAN[0] + jitter(50, 3) * 0.04, WUHAN[1] + jitter(51, 3) * 0.05],
        deviceCode: "Y18824",
        timeRange: "2026/04/11 08:00:00 - 2026/04/11 19:00:00",
        records: [
          { code: "Y18824-248910", time: "2026/04/11 08:52:15" },
          { code: "Y18824-248926", time: "2026/04/11 12:40:31" },
          { code: "Y18824-248941", time: "2026/04/11 17:55:29" },
        ],
      },
      {
        ll: [WUHAN[0] + jitter(50, 4) * 0.04, WUHAN[1] + jitter(51, 4) * 0.05],
        deviceCode: "Y18831",
        timeRange: "2026/04/12 06:30:00 - 2026/04/12 18:30:00",
        records: [
          { code: "Y18831-249004", time: "2026/04/12 07:11:09" },
          { code: "Y18831-249028", time: "2026/04/12 11:26:14" },
          { code: "Y18831-249053", time: "2026/04/12 17:03:42" },
        ],
      },
      {
        ll: [WUHAN[0] + jitter(50, 5) * 0.04, WUHAN[1] + jitter(51, 5) * 0.05],
        deviceCode: "Y18837",
        timeRange: "2026/04/13 08:00:00 - 2026/04/13 18:00:00",
        records: [
          { code: "Y18837-249144", time: "2026/04/13 08:26:58" },
          { code: "Y18837-249158", time: "2026/04/13 13:17:05" },
          { code: "Y18837-249176", time: "2026/04/13 17:48:36" },
        ],
      },
    ].forEach(function (item) {
      var marker = L.marker(item.ll, {
        icon: makeBadgeIcon("#2563eb", "fa-solid fa-person-walking", 28),
      }).addTo(layers.staff);
      marker.on("click", function () {
        openDetailPanel("人员轨迹", renderTrackPanel(item));
      });
    });

    [
      [30.598, 114.318],
      [30.572, 114.292],
      [30.618, 114.328],
    ].forEach(function (ll, i) {
      var marker = L.marker(ll, { icon: makeBadgeIcon("#ef4444", "fa-solid fa-circle-exclamation", 28) }).addTo(layers.alarms);
      marker.on("click", function () {
        openDetailPanel(
          "告警点详情",
          renderDetailFields([
            { label: "告警编号", value: "ALM-20260514-0" + (i + 1) },
            { label: "告警类型", value: i === 0 ? "沉降异常" : i === 1 ? "越界施工" : "夜间违规作业" },
            { label: "所属线路", value: i === 0 ? "武汉地铁 2 号线" : i === 1 ? "武汉地铁 5 号线" : "武汉地铁 8 号线" },
            { label: "告警时间", value: i === 0 ? "2026/05/14 09:18:23" : i === 1 ? "2026/05/14 11:06:42" : "2026/05/14 18:32:17" },
            { label: "处置状态", value: i === 2 ? "待复核" : "处理中" },
          ])
        );
      });
    });

    [
      {
        ll: [30.588, 114.302],
        name: "武昌机场站点 01",
        line: "武汉地铁 2 号线",
        manager: "陈志远",
        phone: "138 0000 1298",
        coordinate: "114.302000, 30.588000",
      },
      {
        ll: [30.602, 114.338],
        name: "中北路机场站点 02",
        line: "武汉地铁 8 号线",
        manager: "王晓峰",
        phone: "138 0000 5516",
        coordinate: "114.338000, 30.602000",
      },
    ].forEach(function (item) {
      var marker = L.marker(item.ll, { icon: makeBadgeIcon("#0f766e", "fa-solid fa-plane-departure", 30) }).addTo(layers.airports);
      marker.on("click", function () {
        openDetailPanel(
          "机场详情",
          renderDetailFields([
            { label: "机场名称", value: item.name },
            { label: "所属线路", value: item.line },
            { label: "负责人", value: item.manager },
            { label: "联系电话", value: item.phone },
            { label: "位置坐标", value: item.coordinate },
          ])
        );
      });
    });

    layers.alarms.clearLayers();
    [
      [30.598, 114.318],
      [30.572, 114.292],
      [30.618, 114.328],
    ].forEach(function (ll) {
      var alarmMarker = L.marker(ll, { icon: makeBadgeIcon("#ef4444", "fa-solid fa-circle-exclamation", 28) }).addTo(layers.alarms);
      alarmMarker.on("click", function () {
        openDetailPanel(
          "附近机场及关联无人机详情",
          renderAirportDronePanel([
            {
              airportName: "机场1",
              airportStatus: "在线",
              droneName: "001",
              droneStatus: "在线",
              battery: "100%",
              ready: true,
              readyText: "满足",
              distance: "1.3km",
            },
            {
              airportName: "机场2",
              airportStatus: "在线",
              droneName: "002",
              droneStatus: "在线",
              battery: "30%",
              ready: false,
              readyText: "不满足",
              distance: "5.3km",
            },
          ])
        );
      });
    });

    layers.airports.clearLayers();
    [
      { ll: [30.588, 114.302], name: "机场1" },
      { ll: [30.602, 114.338], name: "机场2" },
    ].forEach(function (item) {
      var airportMarker = L.marker(item.ll, { icon: makeBadgeIcon("#0f766e", "fa-solid fa-plane-departure", 30) }).addTo(layers.airports);
      airportMarker.on("click", function () {
        openDetailPanel(
          "机场及关联无人机详情",
          renderAirportDronePanel([
            {
              airportName: item.name,
              airportStatus: "在线",
              droneName: item.name === "机场1" ? "001" : "002",
              droneStatus: "在线",
              battery: item.name === "机场1" ? "100%" : "86%",
              ready: true,
              readyText: "满足",
            },
          ])
        );
      });
    });

    [
      {
        ll: [30.584, 114.314],
        deviceCode: "DJI-M350-0007",
        timeRange: "2026/05/12 08:00:00 - 2026/05/12 18:00:00",
        records: [
          { code: "FLIGHT-350-1821", time: "2026/05/12 08:42:11" },
          { code: "FLIGHT-350-1830", time: "2026/05/12 11:28:37" },
          { code: "FLIGHT-350-1839", time: "2026/05/12 16:14:52" },
        ],
      },
      {
        ll: [30.609, 114.322],
        deviceCode: "DJI-M350-0012",
        timeRange: "2026/05/13 08:00:00 - 2026/05/13 18:00:00",
        records: [
          { code: "FLIGHT-350-1914", time: "2026/05/13 09:06:45" },
          { code: "FLIGHT-350-1927", time: "2026/05/13 13:52:26" },
          { code: "FLIGHT-350-1933", time: "2026/05/13 17:31:08" },
        ],
      },
    ].forEach(function (item) {
      var marker = L.marker(item.ll, { icon: makeBadgeIcon("#2563eb", "fa-solid fa-helicopter-symbol", 28) }).addTo(layers.drones);
      marker.on("click", function () {
        openDetailPanel("无人机详情", renderTrackPanel(item));
      });
    });

    L.polygon(
      [
        [30.578, 114.288],
        [30.592, 114.288],
        [30.592, 114.308],
        [30.578, 114.308],
      ],
      { color: "#22c55e", weight: 2, fillColor: "#22c55e", fillOpacity: 0.18 }
    ).bindPopup("已巡查区域").addTo(layers.patrolDone);

    L.polygon(
      [
        [30.598, 114.312],
        [30.612, 114.312],
        [30.612, 114.332],
        [30.598, 114.332],
      ],
      { color: "#db2777", weight: 2, fillColor: "#db2777", fillOpacity: 0.2 }
    ).bindPopup("待巡查区域").addTo(layers.patrolTodo);

    emKeys.forEach(function (ek, idx) {
      var g = L.layerGroup();
      for (var k = 0; k < 2; k++) {
        (function (markerIndex) {
          var person = {
            name: ["张鹏", "李威", "周敏", "徐强", "刘畅", "何俊", "陈洁", "彭凯"][(idx + markerIndex) % 8],
            phone: "138 0000 " + String(1200 + idx * 10 + markerIndex).padStart(4, "0"),
            code: "EMP" + String(8600 + idx * 10 + markerIndex),
            line: ["武汉地铁 2 号线", "武汉地铁 4 号线", "武汉地铁 5 号线", "武汉地铁 8 号线"][idx % 4],
            dept: ["抢险队", "轨道车间", "应急中心", "机电班组"][markerIndex % 4],
            post: ["应急抢修员", "值班员", "现场协调员", "巡查员"][idx % 4],
            address: ["武昌区中北路值守点", "洪山区宝通寺值守点", "青山区徐东应急点", "汉阳区钟家村值守点"][(idx + markerIndex) % 4],
          };
          var marker = L.marker(
          [
            WUHAN[0] + 0.02 * Math.sin(idx + k) + jitter(200 + idx, k) * 0.02,
            WUHAN[1] + 0.025 * Math.cos(idx * 2 + k) + jitter(201 + idx, k) * 0.02,
          ],
          {
            icon: makeBadgeIcon("#f97316", "fa-solid fa-user", 28),
          }
          ).addTo(g);
          marker.on("click", function () {
            openDetailPanel(
              "人员信息",
              renderDetailFields([
                { label: "姓名", value: person.name },
                { label: "电话", value: person.phone },
                { label: "工号", value: person.code },
                { label: "所属线路", value: person.line },
                { label: "部门", value: person.dept },
                { label: "岗位", value: person.post },
                { label: "常驻地址", value: person.address },
              ])
            );
          });
        })(k);
      }
      layers.emergency[ek] = g;
      state.emergency[ek] = false;
    });

    function syncLayer(group, on) {
      if (on) map.addLayer(group);
      else map.removeLayer(group);
    }

    function applyAnnotation() {
      syncLayer(layers.stations, state.stations);
      syncLayer(layers.projects, state.projects);
      syncLayer(layers.staff, state.staff);
      syncLayer(layers.alarms, state.alarms);
    }

    function applyAirports() {
      syncLayer(layers.airports, state.airports);
      syncLayer(layers.drones, state.drones);
    }

    function applyPatrol() {
      syncLayer(layers.patrolDone, state.patrolDone);
      syncLayer(layers.patrolTodo, state.patrolTodo);
      syncLayer(layers.patrolPhotos, state.patrolDone);
    }

    function applyMetro() {
      Object.keys(layers.metro).forEach(function (k) {
        syncLayer(layers.metro[k], !!state.metro[k]);
      });
    }

    function applyEmergency() {
      emKeys.forEach(function (k) {
        syncLayer(layers.emergency[k], !!state.emergency[k]);
      });
    }

    function setToggleBtn(el, on) {
      if (!el) return;
      el.classList.toggle("gis-toggle--on", !!on);
    }

    function setBatchSwitch(name, on) {
      var sw = document.querySelector('[data-batch-switch="' + name + '"]');
      if (!sw) return;
      sw.classList.toggle("is-on", !!on);
    }

    function refreshAnnoBatchSwitch() {
      setBatchSwitch("anno", state.stations && state.projects && state.staff && state.alarms);
    }

    function refreshPatrolBatchSwitch() {
      setBatchSwitch("patrol", state.patrolDone && state.patrolTodo);
    }

    function refreshMetroBatchSwitch() {
      var keys = Object.keys(state.metro);
      setBatchSwitch(
        "metro",
        keys.length > 0 &&
          keys.every(function (k) {
            return !!state.metro[k];
          })
      );
    }

    function refreshEmergencyBatchSwitch() {
      setBatchSwitch(
        "emergency",
        emKeys.every(function (k) {
          return !!state.emergency[k];
        })
      );
    }

    ["stations", "projects", "staff", "alarms"].forEach(function (key) {
      document.querySelectorAll('[data-anno="' + key + '"]').forEach(function (btn) {
        btn.addEventListener("click", function () {
          state[key] = !state[key];
          setToggleBtn(btn, state[key]);
          applyAnnotation();
          refreshAnnoBatchSwitch();
        });
        setToggleBtn(btn, state[key]);
      });
    });

    var annoBatch = document.querySelector('[data-batch-switch="anno"]');
    if (annoBatch) {
      annoBatch.addEventListener("click", function (event) {
        event.stopPropagation();
        var next = !annoBatch.classList.contains("is-on");
        state.stations = state.projects = state.staff = state.alarms = next;
        ["stations", "projects", "staff", "alarms"].forEach(function (key) {
          document.querySelectorAll('[data-anno="' + key + '"]').forEach(function (btn) {
            setToggleBtn(btn, next);
          });
        });
        applyAnnotation();
        refreshAnnoBatchSwitch();
      });
    }

    document.querySelectorAll('[data-airport="show"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.airports = true;
        applyAirports();
        setToggleBtn(document.querySelector('[data-airport="show"]'), true);
        setToggleBtn(document.querySelector('[data-airport="hide"]'), false);
      });
    });
    document.querySelectorAll('[data-airport="hide"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.airports = false;
        applyAirports();
        setToggleBtn(document.querySelector('[data-airport="show"]'), false);
        setToggleBtn(document.querySelector('[data-airport="hide"]'), true);
      });
    });
    setToggleBtn(document.querySelector('[data-airport="show"]'), true);
    setToggleBtn(document.querySelector('[data-airport="hide"]'), false);

    document.querySelectorAll('[data-drone="show"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.drones = true;
        applyAirports();
        setToggleBtn(document.querySelector('[data-drone="show"]'), true);
        setToggleBtn(document.querySelector('[data-drone="hide"]'), false);
      });
    });
    document.querySelectorAll('[data-drone="hide"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.drones = false;
        applyAirports();
        setToggleBtn(document.querySelector('[data-drone="show"]'), false);
        setToggleBtn(document.querySelector('[data-drone="hide"]'), true);
      });
    });
    setToggleBtn(document.querySelector('[data-drone="show"]'), true);
    setToggleBtn(document.querySelector('[data-drone="hide"]'), false);

    [
      { key: "patrolDone", selector: '[data-patrol="done"]' },
      { key: "patrolTodo", selector: '[data-patrol="todo"]' },
    ].forEach(function (def) {
      document.querySelectorAll(def.selector).forEach(function (btn) {
        btn.addEventListener("click", function () {
          state[def.key] = !state[def.key];
          setToggleBtn(btn, state[def.key]);
          applyPatrol();
          refreshPatrolBatchSwitch();
        });
        setToggleBtn(btn, state[def.key]);
      });
    });

    var patrolBatch = document.querySelector('[data-batch-switch="patrol"]');
    if (patrolBatch) {
      patrolBatch.addEventListener("click", function (event) {
        event.stopPropagation();
        var next = !patrolBatch.classList.contains("is-on");
        state.patrolDone = next;
        state.patrolTodo = next;
        setToggleBtn(document.querySelector('[data-patrol="done"]'), next);
        setToggleBtn(document.querySelector('[data-patrol="todo"]'), next);
        applyPatrol();
        refreshPatrolBatchSwitch();
      });
    }

    document.querySelectorAll("[data-metro]").forEach(function (btn) {
      var k = btn.getAttribute("data-metro");
      btn.addEventListener("click", function () {
        state.metro[k] = !state.metro[k];
        setToggleBtn(btn, state.metro[k]);
        applyMetro();
        refreshMetroBatchSwitch();
      });
      setToggleBtn(btn, !!state.metro[k]);
    });

    var metroBatch = document.querySelector('[data-batch-switch="metro"]');
    if (metroBatch) {
      metroBatch.addEventListener("click", function (event) {
        event.stopPropagation();
        var next = !metroBatch.classList.contains("is-on");
        Object.keys(state.metro).forEach(function (k) {
          state.metro[k] = next;
          document.querySelectorAll('[data-metro="' + k + '"]').forEach(function (btn) {
            setToggleBtn(btn, next);
          });
        });
        applyMetro();
        refreshMetroBatchSwitch();
      });
    }

    document.querySelectorAll("[data-emergency]").forEach(function (btn) {
      var k = btn.getAttribute("data-emergency");
      btn.addEventListener("click", function () {
        state.emergency[k] = !state.emergency[k];
        setToggleBtn(btn, state.emergency[k]);
        applyEmergency();
        refreshEmergencyBatchSwitch();
      });
      setToggleBtn(btn, !!state.emergency[k]);
    });

    var emergencyBatch = document.querySelector('[data-batch-switch="emergency"]');
    if (emergencyBatch) {
      emergencyBatch.addEventListener("click", function (event) {
        event.stopPropagation();
        var next = !emergencyBatch.classList.contains("is-on");
        emKeys.forEach(function (k) {
          state.emergency[k] = next;
          document.querySelectorAll('[data-emergency="' + k + '"]').forEach(function (btn) {
            setToggleBtn(btn, next);
          });
        });
        applyEmergency();
        refreshEmergencyBatchSwitch();
      });
    }

    var panelToggle = document.querySelector('[data-action="panel-toggle"]');
    var panelToggleIcon = document.querySelector("[data-panel-toggle-icon]");
    if (panelToggle && filterPanel) {
      panelToggle.addEventListener("click", function () {
        var collapsed = filterPanel.classList.toggle("is-collapsed");
        if (panelToggleIcon) panelToggleIcon.className = collapsed ? "fa-solid fa-layer-group" : "fa-solid fa-angles-left";
        panelToggle.setAttribute("title", collapsed ? "展开面板" : "收起面板");
        setTimeout(function () {
          map.invalidateSize();
        }, 240);
      });
    }

    document.querySelectorAll("[data-section-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        if (event.target.closest(".gis-head-switch")) return;
        var section = btn.closest(".gis-sec");
        if (!section) return;
        section.classList.toggle("gis-sec--collapsed");
      });
    });

    var hud = document.getElementById("gis-hud");
    function hudShow(html) {
      if (!hud) return;
      hud.innerHTML = html;
      hud.classList.remove("hidden");
    }
    function hudHide() {
      if (!hud) return;
      hud.classList.add("hidden");
      hud.innerHTML = "";
    }

    var toolMode = null;
    var distPoints = [];
    var distLine = null;
    var areaPoints = [];
    var areaPreview = null;
    var pickCount = 0;

    function clearToolGeometry() {
      drawLayer.clearLayers();
      pickLayer.clearLayers();
      distPoints = [];
      distLine = null;
      areaPoints = [];
      areaPreview = null;
      pickCount = 0;
    }

    function bindHudCancel() {
      if (!hud) return;
      var cancelBtn = hud.querySelector("[data-hud-cancel]");
      if (cancelBtn) {
        cancelBtn.onclick = function () {
          setToolMode(null);
          map.getContainer().style.cursor = "";
        };
      }
    }

    function refreshDistanceHud() {
      hudShow(
        '<span class="text-cyan-100">测距：</span>在地图上依次点击添加折点（当前 <b>' +
          distPoints.length +
          '</b> 点）<button type="button" class="gis-hud-btn" data-hud-finish-dist ' +
          (distPoints.length < 2 ? "disabled" : "") +
          '>完成测距</button><button type="button" class="gis-hud-btn" data-hud-cancel>取消</button>'
      );
      var finish = hud.querySelector("[data-hud-finish-dist]");
      if (finish) finish.onclick = finishDistanceMeasure;
      bindHudCancel();
    }

    function refreshAreaHud() {
      hudShow(
        '<span class="text-cyan-100">测面：</span>依次点击添加顶点（当前 <b>' +
          areaPoints.length +
          '</b> 点）<button type="button" class="gis-hud-btn" data-hud-finish-area ' +
          (areaPoints.length < 3 ? "disabled" : "") +
          '>闭合并计算</button><button type="button" class="gis-hud-btn" data-hud-cancel>取消</button>'
      );
      var finish = hud.querySelector("[data-hud-finish-area]");
      if (finish) finish.onclick = finishAreaMeasure;
      bindHudCancel();
    }

    function setToolMode(mode) {
      toolMode = mode;
      document.querySelectorAll("[data-tool]").forEach(function (btn) {
        btn.classList.toggle("gis-toolbar__btn--active", btn.getAttribute("data-tool") === mode);
      });

      if (mode === "pick" || mode === "distance" || mode === "area") map.doubleClickZoom.disable();
      else map.doubleClickZoom.enable();

      if (mode === "distance") refreshDistanceHud();
      else if (mode === "area") refreshAreaHud();
      else if (mode === "pick") {
        hudShow(
          '<span class="text-cyan-100">坐标拾取：</span>点击地图获取经纬度，可连续拾取。<button type="button" class="gis-hud-btn" data-hud-cancel>结束</button>'
        );
        bindHudCancel();
      } else hudHide();
    }

    function finishDistanceMeasure() {
      if (distPoints.length < 2) return;
      var total = 0;
      for (var i = 1; i < distPoints.length; i++) {
        total += haversineM([distPoints[i - 1].lat, distPoints[i - 1].lng], [distPoints[i].lat, distPoints[i].lng]);
      }
      if (distLine) drawLayer.removeLayer(distLine);
      L.polyline(distPoints, { color: "#38bdf8", weight: 4, opacity: 0.95 }).addTo(drawLayer);
      L.popup()
        .setLatLng(distPoints[distPoints.length - 1])
        .setContent("<b>测距结果</b><br/>总长约：<b>" + (total / 1000).toFixed(3) + " km</b>")
        .openOn(map);
      distPoints = [];
      setToolMode(null);
      map.getContainer().style.cursor = "";
    }

    function finishAreaMeasure() {
      if (areaPoints.length < 3) return;
      var area = ringAreaM2(areaPoints);
      if (areaPreview) drawLayer.removeLayer(areaPreview);
      L.polygon(areaPoints, { color: "#fbbf24", weight: 2, fillColor: "#fbbf24", fillOpacity: 0.22 }).addTo(drawLayer);
      L.popup()
        .setLatLng(areaPoints[areaPoints.length - 1])
        .setContent("<b>测面结果</b><br/>面积约：<b>" + (area / 1000000).toFixed(3) + " km²</b>")
        .openOn(map);
      areaPoints = [];
      setToolMode(null);
      map.getContainer().style.cursor = "";
    }

    map.on("click", function (e) {
      if (toolMode === "pick") {
        pickCount += 1;
        L.marker(e.latlng, {
          icon: L.divIcon({
            className: "",
            html:
              '<div style="min-width:22px;height:22px;border-radius:999px;background:#0ea5e9;border:2px solid #67e8f9;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#042f2e;">' +
              pickCount +
              "</div>",
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        })
          .bindPopup("<b>拾取坐标</b><br/>" + e.latlng.lat.toFixed(6) + ", " + e.latlng.lng.toFixed(6))
          .addTo(pickLayer)
          .openPopup();
        return;
      }

      if (toolMode === "distance") {
        distPoints.push(e.latlng);
        if (distLine) drawLayer.removeLayer(distLine);
        if (distPoints.length >= 2) {
          distLine = L.polyline(distPoints, { color: "#22d3ee", weight: 3, dashArray: "6,6" }).addTo(drawLayer);
        }
        refreshDistanceHud();
        return;
      }

      if (toolMode === "area") {
        areaPoints.push([e.latlng.lat, e.latlng.lng]);
        if (areaPreview) drawLayer.removeLayer(areaPreview);
        if (areaPoints.length >= 2) {
          areaPreview = L.polygon(areaPoints, { color: "#fbbf24", weight: 2, fillColor: "#fbbf24", fillOpacity: 0.15 }).addTo(drawLayer);
        }
        refreshAreaHud();
      }
    });

    var toolBase = document.querySelector('[data-tool="base"]');
    function syncBaseToolUi() {
      if (!toolBase) return;
      var icon = toolBase.querySelector("[data-base-icon]");
      toolBase.classList.toggle("gis-toolbar__btn--satellite", baseIsSatellite);
      if (baseIsSatellite) {
        if (icon) icon.className = "fa-solid fa-road";
        toolBase.setAttribute("title", "当前：卫星影像，点击切换为道路地图");
      } else {
        if (icon) icon.className = "fa-solid fa-layer-group";
        toolBase.setAttribute("title", "当前：道路地图，点击切换为卫星影像");
      }
    }

    if (toolBase) {
      syncBaseToolUi();
      toolBase.addEventListener("click", function () {
        baseIsSatellite = !baseIsSatellite;
        if (baseIsSatellite) {
          map.removeLayer(road);
          satellite.addTo(map);
        } else {
          map.removeLayer(satellite);
          road.addTo(map);
        }
        syncBaseToolUi();
      });
    }

    var pickBtn = document.querySelector('[data-tool="pick"]');
    if (pickBtn) {
      pickBtn.addEventListener("click", function () {
        if (toolMode === "pick") {
          setToolMode(null);
          map.getContainer().style.cursor = "";
        } else {
          setToolMode("pick");
          map.getContainer().style.cursor = "crosshair";
        }
      });
    }

    var distanceBtn = document.querySelector('[data-tool="distance"]');
    if (distanceBtn) {
      distanceBtn.addEventListener("click", function () {
        if (toolMode === "distance") {
          setToolMode(null);
          map.getContainer().style.cursor = "";
        } else {
          distPoints = [];
          distLine = null;
          setToolMode("distance");
          map.getContainer().style.cursor = "crosshair";
        }
      });
    }

    var areaBtn = document.querySelector('[data-tool="area"]');
    if (areaBtn) {
      areaBtn.addEventListener("click", function () {
        if (toolMode === "area") {
          setToolMode(null);
          map.getContainer().style.cursor = "";
        } else {
          areaPoints = [];
          areaPreview = null;
          setToolMode("area");
          map.getContainer().style.cursor = "crosshair";
        }
      });
    }

    var resetBtn = document.querySelector('[data-tool="reset"]');
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        clearToolGeometry();
        closeDetailPanel();
        setToolMode(null);
        map.doubleClickZoom.enable();
        map.getContainer().style.cursor = "";
        map.setView(WUHAN, 12, { animate: true });
        if (baseIsSatellite) {
          baseIsSatellite = false;
          map.removeLayer(satellite);
          road.addTo(map);
          syncBaseToolUi();
        }
      });
    }

    var searchBtn = document.querySelector('[data-action="search-jump"]');
    var searchInput = document.querySelector('[data-action="search-input"]');
    if (searchBtn && searchInput) {
      searchBtn.addEventListener("click", function () {
        var q = (searchInput.value || "").trim() || "武汉 地铁";
        searchBtn.disabled = true;
        fetch(
          "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
            encodeURIComponent(q) +
            "&email=wuhan-metro-prototype%40example.local",
          { headers: { Accept: "application/json" } }
        )
          .then(function (r) {
            return r.json();
          })
          .then(function (arr) {
            searchBtn.disabled = false;
            if (arr && arr[0]) {
              var lat = parseFloat(arr[0].lat);
              var lon = parseFloat(arr[0].lon);
              map.flyTo([lat, lon], 14, { duration: 1.2 });
              L.circleMarker([lat, lon], {
                radius: 12,
                color: "#fbbf24",
                fillColor: "#fde047",
                fillOpacity: 0.4,
                weight: 3,
              })
                .bindPopup("搜索：" + q + "<br/>" + (arr[0].display_name || ""))
                .addTo(drawLayer)
                .openPopup();
            } else {
              alert("未找到匹配位置，请更换关键词。");
            }
          })
          .catch(function () {
            searchBtn.disabled = false;
            alert("检索服务暂不可用，请稍后重试。");
          });
      });
    }

    applyAnnotation();
    applyAirports();
    applyPatrol();
    applyMetro();
    applyEmergency();
    refreshAnnoBatchSwitch();
    refreshPatrolBatchSwitch();
    refreshMetroBatchSwitch();
    refreshEmergencyBatchSwitch();

    setTimeout(function () {
      map.invalidateSize();
    }, 200);
    window.addEventListener("resize", function () {
      map.invalidateSize();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(init, 150);
    });
  } else {
    setTimeout(init, 150);
  }
})();
