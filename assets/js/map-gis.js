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

  /** Catmull-Rom 样条：将折线锚点转为贴合道路走向的平滑曲线 */
  function smoothMetroCurve(points, options) {
    options = options || {};
    var segments = options.segmentsPerLeg == null ? 16 : options.segmentsPerLeg;
    if (!points || points.length < 2) return points ? points.slice() : [];

    function sample(p0, p1, p2, p3, t) {
      var t2 = t * t;
      var t3 = t2 * t;
      return [
        0.5 *
          (2 * p1[0] +
            (-p0[0] + p2[0]) * t +
            (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
            (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 *
          (2 * p1[1] +
            (-p0[1] + p2[1]) * t +
            (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
            (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ];
    }

    var result = [];
    var extended = [points[0]].concat(points).concat([points[points.length - 1]]);
    for (var i = 1; i < extended.length - 2; i++) {
      var p0 = extended[i - 1];
      var p1 = extended[i];
      var p2 = extended[i + 1];
      var p3 = extended[i + 2];
      for (var j = 0; j < segments; j++) {
        if (i > 1 || j > 0) result.push(sample(p0, p1, p2, p3, j / segments));
      }
    }
    result.push(points[points.length - 1]);
    return result;
  }

  window.WuhanGIS.smoothMetroCurve = smoothMetroCurve;

  function lineKeyFromLabel(line) {
    if (!line) return null;
    if (line.indexOf("阳逻") >= 0) return "lyl";
    var m = String(line).match(/(\d+)\s*号线/);
    return m ? "l" + m[1] : null;
  }

  function buildInfoGridHtml(fields) {
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

  function gisDetailHref(path, query) {
    var qs = "";
    if (query && typeof query === "object") {
      var parts = [];
      Object.keys(query).forEach(function (key) {
        if (query[key] != null && query[key] !== "") {
          parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(String(query[key])));
        }
      });
      if (parts.length) qs = "?" + parts.join("&");
    }
    var href = path + qs;
    return typeof whPageHref === "function" ? whPageHref(href) : href;
  }

  var FLIGHT_PLAN_ALERT_STORE_KEY = "whFlightPlansByAlert";

  function readFlightPlansByAlert() {
    try {
      var raw = sessionStorage.getItem(FLIGHT_PLAN_ALERT_STORE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function getFlightPlanForAlert(alertId) {
    if (alertId == null) return null;
    var store = readFlightPlansByAlert();
    return store[String(alertId)] || null;
  }

  function saveFlightPlanForAlert(alertId, plan) {
    if (alertId == null || !plan) return;
    var store = readFlightPlansByAlert();
    store[String(alertId)] = plan;
    try {
      sessionStorage.setItem(FLIGHT_PLAN_ALERT_STORE_KEY, JSON.stringify(store));
    } catch (e) {}
  }

  function mergeStoredAlertFlightPlans(plans) {
    if (!plans || !plans.unshift) return;
    var store = readFlightPlansByAlert();
    Object.keys(store).forEach(function (key) {
      var p = store[key];
      if (!p || p.id == null) return;
      var idx = plans.findIndex(function (x) {
        return x.id === p.id;
      });
      if (idx >= 0) Object.assign(plans[idx], p);
      else plans.unshift(p);
    });
  }

  function flightPlanFormHref(alertId) {
    if (alertId == null) return null;
    return gisDetailHref("map/map-flight-plan.html", {
      create: "1",
      fromAlert: "1",
      alertId: alertId,
    });
  }

  var GIS_ALERT_FLIGHT_PREFILL_BY_LINE = {
    "2号线": {
      line: "2号线",
      route: "梨园-中南医院演示航线",
      airport: "梨园机场",
      drone: "梨园巡检无人机 M30T",
    },
    "5号线": {
      line: "5号线",
      route: "青山站周期巡检航线",
      airport: "青山机场",
      drone: "青山巡检无人机 M350",
    },
    "8号线": {
      line: "8号线",
      route: "车辆段日常巡查航线",
      airport: "车辆段机场",
      drone: "车辆段无人机 M350",
    },
  };

  function guessAlarmFlightLine(alarm) {
    var airports = alarm && alarm.airports ? alarm.airports : [];
    var planName = airports[0] && airports[0].flightPlan ? airports[0].flightPlan : "";
    if (planName.indexOf("8号线") >= 0 || planName.indexOf("车辆段") >= 0) return "8号线";
    if (planName.indexOf("青山") >= 0 || planName.indexOf("周期") >= 0) return "5号线";
    var section = (alarm && alarm.alarmSection) || "";
    if (section.indexOf("8号") >= 0) return "8号线";
    if (section.indexOf("5号") >= 0) return "5号线";
    return "2号线";
  }

  function buildGisAlertFlightPrefill(alarm) {
    var flight =
      GIS_ALERT_FLIGHT_PREFILL_BY_LINE[guessAlarmFlightLine(alarm)] ||
      GIS_ALERT_FLIGHT_PREFILL_BY_LINE["2号线"];
    var time = (alarm && (alarm.latestTime || alarm.startTime)) || "";
    return {
      name: (alarm.projectName || "告警复核") + (time ? " " + time : ""),
      line: flight.line,
      route: flight.route,
      airport: flight.airport,
      drone: flight.drone,
      type: "告警复核",
      lockType: true,
      alertId: alarm.alertId,
    };
  }

  function openAlertFlightPlanForm(alarm) {
    if (!alarm || alarm.alertId == null) return;
    var alertId = alarm.alertId;
    if (!getFlightPlanForAlert(alertId)) {
      try {
        sessionStorage.setItem("whFlightPlanAlertPrefill", JSON.stringify(buildGisAlertFlightPrefill(alarm)));
      } catch (e) {}
    }
    window.location.href = flightPlanFormHref(alertId);
  }

  function bindAlarmFlightPlanAction(body, alarm) {
    if (!body) return;
    if (alarm && alarm.alertId != null) {
      body._gisOpenAlertFlightPlan = function () {
        openAlertFlightPlanForm(alarm);
      };
    } else {
      delete body._gisOpenAlertFlightPlan;
    }
  }

  var PATROL_ALERT_OPEN_KEY = "whPatrolAlertOpenId";
  var PATROL_ALERT_FROM_GIS_KEY = "whPatrolAlertFromGis";

  function openAlarmDetailPage(alarm) {
    if (!alarm || alarm.alertId == null) return;
    var id = String(alarm.alertId);
    if (isGisMobilePage()) {
      try {
        sessionStorage.setItem(PATROL_ALERT_OPEN_KEY, id);
        sessionStorage.setItem(PATROL_ALERT_FROM_GIS_KEY, "1");
      } catch (e) {}
      window.location.href = gisDetailHref("map/map-alerts.html", { id: id, fromGis: 1 });
      return;
    }
    window.location.href = alarmDetailUrl(alarm);
  }

  function bindAlarmDetailNavigation(body, alarm) {
    if (!body) return;
    if (alarm && alarm.alertId != null) {
      body._gisOpenAlarmDetail = function () {
        openAlarmDetailPage(alarm);
      };
    } else {
      delete body._gisOpenAlarmDetail;
    }
  }

  function buildFlightPlanNavHtml() {
    return (
      '<div class="gis-detail-action gis-alarm-panel__action">' +
      '<button type="button" class="gis-detail-btn gis-detail-btn--block" data-alert-flight-plan="1">前往飞行计划</button></div>'
    );
  }

  function isGisMobilePage() {
    return !!(
      typeof document !== "undefined" &&
      document.body &&
      document.body.classList.contains("gis-mobile-page")
    );
  }

  function buildDetailNavHtml(url) {
    if (!url) return "";
    return (
      '<div class="gis-detail-action">' +
      '<button type="button" class="gis-detail-btn gis-detail-btn--block" data-detail-url="' +
      String(url).replace(/"/g, "&quot;") +
      '">前往详情页</button></div>'
    );
  }

  function buildCockpitNavHtml() {
    if (isGisMobilePage()) return "";
    return (
      '<div class="gis-detail-action">' +
      '<button type="button" class="gis-detail-btn gis-detail-btn--block" data-cockpit-url="cockpit/map-cockpit-prep.html">前往虚拟座舱</button></div>'
    );
  }

  function buildAirportCardActionsHtml(item, options) {
    options = options || {};
    if (isGisMobilePage()) return "";
    if (options.hideCockpitNav) {
      return buildDetailNavHtml(airportDetailUrl(item.airportName));
    }
    return buildCockpitNavHtml() + buildDetailNavHtml(airportDetailUrl(item.airportName));
  }

  function trackPersonDetailUrl(deviceCode) {
    var idMap = { Y18807: 1, Y18812: 2, Y18819: 3, Y18824: 4, Y18831: 5, Y18837: 6 };
    return gisDetailHref("wb/in-track-person.html", { id: idMap[deviceCode] || 1 });
  }

  function flightLogDetailUrl() {
    return gisDetailHref("wb/am-flight-log.html", { detail: "FL20251225001" });
  }

  function stationDetailUrl(item) {
    var row = typeof item === "string" ? { name: item } : item || {};
    return gisDetailHref("wb/am-station.html", {
      view: "detail",
      name: row.name || "",
      line: row.line || "",
      startMile: row.startMileage || row.startMile || "",
      endMile: row.endMileage || row.endMile || "",
      length: row.length || "",
      lng: row.lng || "",
      lat: row.lat || "",
    });
  }

  function projectDetailUrl(name) {
    return gisDetailHref("wb/in-project.html", { view: "detail", project: name });
  }

  function alarmDetailUrl(alarm) {
    var id = (alarm && alarm.alertId) || 201;
    if (isGisMobilePage()) {
      return gisDetailHref("map/map-alerts.html", { id: id });
    }
    return gisDetailHref("map/map-alerts.html", {
      view: "detail",
      id: id,
    });
  }

  function airportDetailUrl(name) {
    var idMap = { "机场1": "dock-a", "机场2": "dock-b" };
    return gisDetailHref("wb/am-airport.html", { detail: idMap[name] || "dock-a" });
  }

  function manualPatrolDetailUrl() {
    return gisDetailHref("patrol/in-manual.html", { detail: "122820" });
  }

  function emergencyStaffDetailUrl(person) {
    person = person || {};
    return gisDetailHref("wb/am-emergency-staff.html", {
      view: "detail",
      name: person.name || "",
      no: person.code || person.no || "",
      phone: person.phone || "",
      line: person.line || "",
      dept: person.dept || "",
      post: person.post || "",
      address: person.address || "",
    });
  }

  function emergencyWarehouseDetailUrl(wh) {
    return gisDetailHref("wb/am-emergency-warehouse.html", { name: wh && wh.name ? wh.name : "" });
  }

  function gisEscapeAttr(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  var emergencyMaterialWarehouses = [
    { material: "万能道尺", warehouses: ["阳逻线委外项目部应急库"] },
    { material: "轨温计", warehouses: ["2号线中南路应急仓库", "2号线中山公园应急仓库"] },
    {
      material: "撬棍",
      warehouses: [
        "4号线土建洪山广场应急仓库",
        "2号线中南路应急仓库",
        "4号线武昌火车站仓库",
        "7号线三阳路仓库",
      ],
    },
  ];

  function buildWarehouseListHtml(groups) {
    return (
      '<div class="gis-wh-list">' +
      (groups || [])
        .map(function (group) {
          return (
            '<div class="gis-wh-group">' +
            '<div class="gis-wh-material">' +
            (group.material || "") +
            "</div>" +
            (group.warehouses || [])
              .map(function (name) {
                return (
                  '<button type="button" class="gis-wh-item" data-warehouse-pick="' +
                  gisEscapeAttr(name) +
                  '">' +
                  name +
                  "</button>"
                );
              })
              .join("") +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function buildWarehouseDetailBodyHtml(wh) {
    if (!wh) return "";
    return (
      buildInfoGridHtml([
        { label: "仓库名称", value: wh.name },
        { label: "存储物资数量", value: wh.materialCount },
        { label: "仓库经度", value: wh.lng },
        { label: "仓库纬度", value: wh.lat },
        { label: "仓库地址", value: wh.address },
        { label: "仓库负责人", value: wh.manager },
        { label: "联系电话", value: wh.phone },
      ]) + buildDetailNavHtml(emergencyWarehouseDetailUrl(wh))
    );
  }

  var defaultAlarmAirportPair = [
    {
      airportName: "机场1",
      flightPlan: "8号线车辆段常规巡检",
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
      flightPlan: "长江新区临时巡检",
      airportStatus: "在线",
      droneName: "002",
      droneStatus: "在线",
      battery: "30%",
      ready: false,
      readyText: "不满足",
      distance: "5.3km",
    },
  ];

  function resolveAlarmAirports(airports) {
    var list = airports && airports.length ? airports.slice() : [];
    if (list.length >= 2) return list;
    return defaultAlarmAirportPair.map(function (item) {
      return {
        airportName: item.airportName,
        airportStatus: item.airportStatus,
        droneName: item.droneName,
        droneStatus: item.droneStatus,
        battery: item.battery,
        ready: item.ready,
        readyText: item.readyText,
        flightPlan: item.flightPlan,
        distance: item.distance,
      };
    });
  }


  function gisAirportCardFlightPlanRow(item) {
    var plan = item.flightPlan || "-";
    return (
      '<div class="gis-airport-card__row"><span class="gis-airport-card__label">飞行计划:</span><span class="gis-airport-card__value">' +
      plan +
      "</span></div>"
    );
  }
  function buildAlarmAirportCardHtml(item) {
    return (
      '<div class="gis-airport-card gis-alarm-carousel__card" data-carousel-card>' +
      '<div class="gis-airport-card__row"><span class="gis-airport-card__label">机场名称:</span><span class="gis-airport-card__value">' +
      item.airportName +
      "</span></div>" +
      gisAirportCardFlightPlanRow(item) +
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
      "</div>"
    );
  }

  function buildAlarmPanelHtml(alarm, airports, options) {
    options = options || {};
    var statusClass =
      alarm.status === "已复核" ? "gis-alarm-status gis-alarm-status--done" : "gis-alarm-status gis-alarm-status--pending";
    var airportList = resolveAlarmAirports(airports);
    var airportPanelClass =
      "gis-airport-panel gis-alarm-carousel__viewport" + (airportList.length === 1 ? " gis-airport-panel--single" : "");
    var panelClass = "gis-alarm-panel" + (options.hideCockpitNav ? " gis-alarm-panel--cockpit" : "");

    var detailNavHtml = buildDetailNavHtml(alarmDetailUrl(alarm));
    var flightPlanHtml = options.hideCockpitNav || isGisMobilePage() ? "" : buildFlightPlanNavHtml();

    return (
      '<div class="' +
      panelClass +
      '">' +
      '<section class="gis-alarm-section">' +
      '<h4 class="gis-alarm-section__title">告警信息</h4>' +
      buildInfoGridHtml([
        { label: "项目名称", value: alarm.projectName },
        { label: "报警区间", value: alarm.alarmSection },
        { label: "报警位置", value: alarm.alarmPosition },
        { label: "开始时间", value: alarm.startTime },
        { label: "最新报警时间", value: alarm.latestTime },
        {
          label: "状态",
          value: '<span class="' + statusClass + '">' + (alarm.status || "-") + "</span>",
        },
      ]) +
      "</section>" +
      '<section class="gis-alarm-section gis-alarm-section--airport" data-alarm-carousel data-carousel-page-size="2">' +
      '<div class="gis-alarm-section__head">' +
      '<h4 class="gis-alarm-section__title">附近机场及关联无人机详情</h4>' +
      '<div class="gis-alarm-section__arrows">' +
      '<button type="button" class="gis-alarm-carousel__btn gis-alarm-carousel__btn--mini" data-carousel-prev aria-label="上一组机场"><i class="fa-solid fa-chevron-left"></i></button>' +
      '<button type="button" class="gis-alarm-carousel__btn gis-alarm-carousel__btn--mini" data-carousel-next aria-label="下一组机场"><i class="fa-solid fa-chevron-right"></i></button>' +
      "</div>" +
      "</div>" +
      '<div class="' +
      airportPanelClass +
      '">' +
      airportList.map(buildAlarmAirportCardHtml).join("") +
      "</div>" +
      "</section>" +
      flightPlanHtml +
      detailNavHtml +
      "</div>"
    );
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function getTodayTrackRange() {
    var now = new Date();
    var start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    var end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { start: start, end: end };
  }

  function toDatetimeLocalValue(date) {
    return (
      date.getFullYear() +
      "-" +
      pad2(date.getMonth() + 1) +
      "-" +
      pad2(date.getDate()) +
      "T" +
      pad2(date.getHours()) +
      ":" +
      pad2(date.getMinutes())
    );
  }

  function formatTrackDisplayTime(date) {
    return (
      date.getFullYear() +
      "/" +
      pad2(date.getMonth() + 1) +
      "/" +
      pad2(date.getDate()) +
      " " +
      pad2(date.getHours()) +
      ":" +
      pad2(date.getMinutes()) +
      ":" +
      pad2(date.getSeconds())
    );
  }

  function parseTrackRecordTime(text) {
    if (!text) return NaN;
    var normalized = String(text).trim().replace(/\//g, "-");
    var ts = Date.parse(normalized.replace(" ", "T"));
    if (!isNaN(ts)) return ts;
    return Date.parse(normalized);
  }

  function normalizeTrackRecords(records) {
    return (records || []).map(function (record) {
      var ts = record.ts != null ? Number(record.ts) : parseTrackRecordTime(record.time);
      return Object.assign({}, record, { ts: ts });
    });
  }

  function buildTrackItemData(cfg) {
    var range = getTodayTrackRange();
    var slots = cfg.slots || [
      { h: 8, m: 52, s: 15, suffix: "001" },
      { h: 12, m: 40, s: 31, suffix: "002" },
      { h: 17, m: 55, s: 29, suffix: "003" },
    ];
    var records = slots.map(function (slot) {
      var d = new Date(range.start);
      d.setHours(slot.h, slot.m || 0, slot.s || 0, 0);
      return {
        code: cfg.deviceCode + "-" + slot.suffix,
        time: formatTrackDisplayTime(d),
        ts: d.getTime(),
      };
    });
    return {
      ll: cfg.ll,
      deviceCode: cfg.deviceCode,
      records: records,
    };
  }

  function renderTrackPanelHtml(data, options) {
    options = options || {};
    var range = getTodayTrackRange();
    var records = normalizeTrackRecords(data.records || []);
    var recordsJson = encodeURIComponent(JSON.stringify(records));
    return (
      '<div class="gis-track-card" data-gis-track-panel data-track-records="' +
      recordsJson +
      '">' +
      '<div class="gis-track-head">' +
      '<div class="gis-detail-field"><div class="gis-detail-label">设备编号</div><div class="gis-detail-value">' +
      (data.deviceCode || "-") +
      "</div></div>" +
      '<div class="gis-detail-field gis-track-range-field">' +
      '<div class="gis-detail-label">时间范围</div>' +
      '<div class="gis-track-range-inputs">' +
      '<input type="datetime-local" class="gis-track-range-input wh-input" data-track-range-start value="' +
      toDatetimeLocalValue(range.start) +
      '" step="60" />' +
      '<span class="gis-track-range-sep">至</span>' +
      '<input type="datetime-local" class="gis-track-range-input wh-input" data-track-range-end value="' +
      toDatetimeLocalValue(range.end) +
      '" step="60" />' +
      "</div></div>" +
      "</div>" +
      '<div class="gis-detail-list" data-track-record-list></div>' +
      '<div class="gis-detail-action"><button type="button" class="gis-detail-btn">播放轨迹</button></div>' +
      (options.detailUrl ? buildDetailNavHtml(options.detailUrl) : "") +
      "</div>"
    );
  }

  function renderTrackRecordListHtml(records) {
    if (!records.length) {
      return '<div class="gis-detail-list-row gis-track-list-empty">该时间范围内暂无轨迹记录</div>';
    }
    return records
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
      .join("");
  }

  function wireTrackPanel(body) {
    var card = body.querySelector("[data-gis-track-panel]");
    if (!card) return;
    var startInput = card.querySelector("[data-track-range-start]");
    var endInput = card.querySelector("[data-track-range-end]");
    var listEl = card.querySelector("[data-track-record-list]");
    if (!startInput || !endInput || !listEl) return;
    var raw = card.getAttribute("data-track-records");
    var allRecords = [];
    try {
      allRecords = raw ? normalizeTrackRecords(JSON.parse(decodeURIComponent(raw))) : [];
    } catch (err) {
      allRecords = [];
    }

    function readRange() {
      var start = startInput.value ? new Date(startInput.value) : getTodayTrackRange().start;
      var end = endInput.value ? new Date(endInput.value) : getTodayTrackRange().end;
      if (endInput.value && endInput.value.length === 16) {
        end.setSeconds(59, 999);
      }
      return { start: start, end: end };
    }

    function applyFilter() {
      var range = readRange();
      var filtered = allRecords.filter(function (record) {
        if (isNaN(record.ts)) return false;
        return record.ts >= range.start.getTime() && record.ts <= range.end.getTime();
      });
      filtered.sort(function (a, b) {
        return a.ts - b.ts;
      });
      listEl.innerHTML = renderTrackRecordListHtml(filtered);
    }

    startInput.addEventListener("change", applyFilter);
    endInput.addEventListener("change", applyFilter);
    applyFilter();
  }

  window.WuhanGIS.renderTrackPanelHtml = renderTrackPanelHtml;

  function wireDetailInteractivity(body) {
    if (!body) return;
    wireTrackPanel(body);
    body.querySelectorAll("[data-flight-url]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var flightUrl = btn.getAttribute("data-flight-url");
        window.location.href =
          typeof whPageHref === "function" ? whPageHref(flightUrl) : flightUrl;
      });
    });
    body.querySelectorAll("[data-cockpit-url]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cockpitUrl = btn.getAttribute("data-cockpit-url");
        window.location.href =
          typeof whPageHref === "function" ? whPageHref(cockpitUrl) : cockpitUrl;
      });
    });
    body.querySelectorAll("[data-detail-url]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (typeof body._gisOpenAlarmDetail === "function") {
          body._gisOpenAlarmDetail();
          return;
        }
        var detailUrl = btn.getAttribute("data-detail-url");
        if (detailUrl) {
          window.location.href = detailUrl;
        }
      });
    });
    body.querySelectorAll("[data-warehouse-pick]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var pickHandler = body._gisWarehousePick;
        if (typeof pickHandler === "function") {
          pickHandler(btn.getAttribute("data-warehouse-pick"));
        }
      });
    });
    body.querySelectorAll("[data-alert-flight-plan]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (typeof body._gisOpenAlertFlightPlan === "function") body._gisOpenAlertFlightPlan();
      });
    });
    var carousel = body.querySelector("[data-alarm-carousel]");
    if (!carousel) return;
    var cards = carousel.querySelectorAll("[data-carousel-card]");
    if (!cards.length) return;
    var prev = carousel.querySelector("[data-carousel-prev]");
    var next = carousel.querySelector("[data-carousel-next]");
    var pageSize = parseInt(carousel.getAttribute("data-carousel-page-size"), 10) || 2;
    var page = 0;
    function renderCarousel() {
      var totalPages = Math.max(1, Math.ceil(cards.length / pageSize));
      cards.forEach(function (card, i) {
        card.classList.toggle("is-active", i >= page * pageSize && i < page * pageSize + pageSize);
      });
      if (prev) prev.disabled = page <= 0;
      if (next) next.disabled = page >= totalPages - 1;
    }
    if (prev) {
      prev.addEventListener("click", function () {
        if (page > 0) {
          page -= 1;
          renderCarousel();
        }
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        var totalPages = Math.max(1, Math.ceil(cards.length / pageSize));
        if (page < totalPages - 1) {
          page += 1;
          renderCarousel();
        }
      });
    }
    renderCarousel();
  }

  function buildAirportDronePanelHtml(items, options) {
    options = options || {};
    return (
      '<div class="gis-airport-panel' +
      (items.length === 1 ? " gis-airport-panel--single" : "") +
      (options.hideCockpitNav ? " gis-airport-panel--cockpit" : "") +
      '">' +
      items
        .map(function (item) {
          return (
            '<div class="gis-airport-card">' +
            '<div class="gis-airport-card__row"><span class="gis-airport-card__label">机场名称:</span><span class="gis-airport-card__value">' +
            item.airportName +
            "</span></div>" +
            gisAirportCardFlightPlanRow(item) +
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
            buildAirportCardActionsHtml(item, options) +
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
        '<button type="button" class="wh-modal-close gis-detail-close" aria-label="关闭">×</button>' +
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
    function openPanel(title, html, options) {
      options = options || {};
      detailEls.title.textContent = title;
      detailEls.body.innerHTML = html;
      detailEls.panel.classList.remove("hidden");
      wireDetailInteractivity(detailEls.body);
      bindAlarmFlightPlanAction(detailEls.body, options.alarm);
      bindAlarmDetailNavigation(detailEls.body, options.alarm);
    }
    if (detailEls.close && !detailEls.close.dataset.bound) {
      detailEls.close.dataset.bound = "1";
      detailEls.close.addEventListener("click", closePanel);
    }
    return { openPanel: openPanel, closePanel: closePanel };
  }

  var defaultAlarmDetails = [
    {
      ll: [30.598, 114.318],
      alertId: 201,
      projectName: "光谷广场综合体基坑项目",
      alarmSection: "省博湖北日报-中南医院",
      alarmPosition: "里程Z23+200,左线外侧37米",
      startTime: "2026-03-05 08:21:36",
      latestTime: "2026-03-05 08:27:27",
      status: "已复核",
      airports: [
        { airportName: "机场1", flightPlan: "8号线车辆段常规巡检", airportStatus: "在线", droneName: "001", droneStatus: "在线", battery: "100%", ready: true, readyText: "满足", distance: "1.3km" },
        { airportName: "机场2", flightPlan: "长江新区临时巡检", airportStatus: "在线", droneName: "002", droneStatus: "在线", battery: "30%", ready: false, readyText: "不满足", distance: "5.3km" },
      ],
    },
    {
      ll: [30.572, 114.292],
      alertId: 202,
      projectName: "武昌滨江总部基地项目",
      alarmSection: "武昌火车站-梅苑小区",
      alarmPosition: "里程Y18+065,右线外侧21米",
      startTime: "2026-03-05 07:52:10",
      latestTime: "2026-03-05 08:04:18",
      status: "已复核",
      airports: [
        { airportName: "机场1", flightPlan: "8号线车辆段常规巡检", airportStatus: "在线", droneName: "001", droneStatus: "在线", battery: "92%", ready: true, readyText: "满足", distance: "2.1km" },
      ],
    },
    {
      ll: [30.618, 114.328],
      alertId: 203,
      projectName: "后湖大道市政管廊项目",
      alarmSection: "宏图大道-市民之家",
      alarmPosition: "里程Z31+480,左线外侧15米",
      startTime: "2026-03-05 09:10:02",
      latestTime: "2026-03-05 09:18:44",
      status: "已复核",
      airports: [
        { airportName: "机场2", flightPlan: "青山站周期巡检", airportStatus: "在线", droneName: "002", droneStatus: "在线", battery: "64%", ready: true, readyText: "满足", distance: "2.8km" },
      ],
    },
  ];

  window.WuhanGIS.renderAirportDronePanelHtml = buildAirportDronePanelHtml;
  window.WuhanGIS.buildDetailNavHtml = buildDetailNavHtml;
  window.WuhanGIS.gisDetailHref = gisDetailHref;
  window.WuhanGIS.manualPatrolDetailUrl = manualPatrolDetailUrl;
  window.WuhanGIS.buildAlarmPanelHtml = buildAlarmPanelHtml;
  window.WuhanGIS.getFlightPlanForAlert = getFlightPlanForAlert;
  window.WuhanGIS.saveFlightPlanForAlert = saveFlightPlanForAlert;
  window.WuhanGIS.mergeStoredAlertFlightPlans = mergeStoredAlertFlightPlans;
  window.WuhanGIS.flightPlanDetailHref = flightPlanFormHref;
  window.WuhanGIS.flightPlanFormHref = flightPlanFormHref;
  window.WuhanGIS.openAlertFlightPlanForm = openAlertFlightPlanForm;
  window.WuhanGIS.wireDetailInteractivity = wireDetailInteractivity;
  window.WuhanGIS.wireTrackPanel = wireTrackPanel;
  function normalizeCockpitAlarm(item, index) {
    var base = defaultAlarmDetails[index] || defaultAlarmDetails[0];
    if (!item) return Object.assign({}, base);
    return {
      ll: item.ll || base.ll,
      alertId: item.alertId || base.alertId,
      projectName: item.projectName || base.projectName,
      alarmSection: item.alarmSection || base.alarmSection,
      alarmPosition: item.alarmPosition || base.alarmPosition,
      startTime: item.startTime || base.startTime,
      latestTime: item.latestTime || base.latestTime,
      status: item.status || base.status,
      airports: item.airports || item.items || base.airports,
    };
  }

  window.WuhanGIS.normalizeCockpitAlarm = normalizeCockpitAlarm;
  window.WuhanGIS.defaultAlarmDetails = defaultAlarmDetails;
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
      { ll: [30.588, 114.302], airportName: "机场1", flightPlan: "8号线车辆段常规巡检", droneName: "001", battery: "100%", ready: true, readyText: "满足" },
      { ll: [30.602, 114.338], airportName: "机场2", flightPlan: "青山站周期巡检", droneName: "002", battery: "86%", ready: true, readyText: "满足" },
    ];
    var alarmDetails = config.alarmDetails || defaultAlarmDetails;

    var map = createSharedMap(container, {
      center: config.center || [30.585, 114.365],
      zoom: config.zoom || 13,
      zoomControl: config.zoomControl !== false,
    });
    if (!map) return null;

    if (config.flightTrack) {
      return mountCockpitFlightTrackLayers(map, config.flightTrack, config);
    }

    (config.polylines || []).forEach(function (line) {
      L.polyline(line.points, {
        color: line.color,
        weight: line.weight || 4,
        opacity: line.opacity == null ? 1 : line.opacity,
      }).addTo(map);
    });

    var patrolLayers = {
      patrolDone: L.layerGroup().addTo(map),
      patrolTodo: L.layerGroup().addTo(map),
      patrolPhotos: L.layerGroup().addTo(map),
    };
    if (window.WuhanGIS.mountPatrolLayers) {
      window.WuhanGIS.mountPatrolLayers(map, {
        layers: patrolLayers,
        showPhotos: config.showPatrolPhotos !== false,
        makePhotoDropIcon: makePhotoDropIcon,
        halfWidthM: config.patrolHalfWidthM,
      });
    }

    airportDetails.forEach(function (item) {
      var marker = L.marker(item.ll, { icon: makeBadgeIcon("#0f766e", "fa-solid fa-plane-departure", 30) }).addTo(map);
      marker.on("click", function () {
        detailApi.openPanel(
          "机场及关联无人机详情",
          buildAirportDronePanelHtml(
            [
              {
                airportName: item.airportName,
                airportStatus: item.airportStatus || "在线",
                droneName: item.droneName,
                droneStatus: item.droneStatus || "在线",
                battery: item.battery,
                ready: item.ready,
                readyText: item.readyText,
                flightPlan: item.flightPlan,
              },
            ],
            { hideCockpitNav: config.hideCockpitNav !== false }
          )
        );
      });
    });

    alarmDetails.forEach(function (item, alarmIdx) {
      var alarm = normalizeCockpitAlarm(item, alarmIdx);
      var marker = L.marker(alarm.ll, { icon: makeBadgeIcon("#ef4444", "fa-solid fa-circle-exclamation", 28) }).addTo(map);
      marker.on("click", function () {
        detailApi.openPanel(
          "告警详情",
          buildAlarmPanelHtml(alarm, alarm.airports, {
            hideCockpitNav: config.hideCockpitNav !== false,
          }),
          { alarm: alarm }
        );
      });
    });

    return { map: map, detailApi: detailApi, patrolLayers: patrolLayers };
  };

  function pathLengthM(points) {
    var len = 0;
    for (var i = 1; i < points.length; i++) len += haversineM(points[i - 1], points[i]);
    return len;
  }

  function splitPathAtFraction(points, frac) {
    var f = Math.max(0, Math.min(1, frac));
    if (points.length < 2) {
      return { traveled: points.slice(), remaining: points.slice(), drone: points[0] || [0, 0] };
    }
    var total = pathLengthM(points);
    if (total <= 0) {
      return { traveled: [points[0]], remaining: [points[0]], drone: points[0] };
    }
    var target = total * f;
    var traveled = [points[0]];
    var acc = 0;
    for (var i = 1; i < points.length; i++) {
      var seg = haversineM(points[i - 1], points[i]);
      if (acc + seg >= target) {
        var r = (target - acc) / seg;
        var mid = [
          points[i - 1][0] + (points[i][0] - points[i - 1][0]) * r,
          points[i - 1][1] + (points[i][1] - points[i - 1][1]) * r,
        ];
        traveled.push(mid);
        var remaining = [mid];
        for (var j = i; j < points.length; j++) remaining.push(points[j]);
        return { traveled: traveled, remaining: remaining, drone: mid };
      }
      traveled.push(points[i]);
      acc += seg;
    }
    return { traveled: points, remaining: [points[points.length - 1]], drone: points[points.length - 1] };
  }

  function bearingDeg(a, b) {
    var lat1 = (a[0] * Math.PI) / 180;
    var lat2 = (b[0] * Math.PI) / 180;
    var dLng = ((b[1] - a[1]) * Math.PI) / 180;
    var y = Math.sin(dLng) * Math.cos(lat2);
    var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return (Math.atan2(y, x) * 180) / Math.PI;
  }

  function makeFlightAirportIcon() {
    return L.divIcon({
      className: "cockpit-flight-marker",
      html:
        '<div class="cockpit-flight-marker__wrap">' +
        '<div class="cockpit-flight-marker__airport"><i class="fa-solid fa-plane-departure"></i></div>' +
        '<span class="cockpit-flight-marker__label">机场</span></div>',
      iconSize: [56, 62],
      iconAnchor: [28, 30],
    });
  }

  function makeFlightTargetIcon() {
    return L.divIcon({
      className: "cockpit-flight-marker",
      html:
        '<div class="cockpit-flight-marker__wrap">' +
        '<div class="cockpit-flight-marker__target"><i class="fa-solid fa-location-dot"></i></div>' +
        '<span class="cockpit-flight-marker__label cockpit-flight-marker__label--target">目标点</span></div>',
      iconSize: [56, 68],
      iconAnchor: [28, 52],
    });
  }

  function makeFlightDroneIcon(heading) {
    var deg = heading || 0;
    return L.divIcon({
      className: "cockpit-flight-marker",
      html:
        '<div class="cockpit-drone-marker" style="transform:rotate(' +
        deg +
        'deg)">' +
        '<div class="cockpit-drone-marker__fov"></div>' +
        '<div class="cockpit-drone-marker__body"><i class="fa-solid fa-location-arrow"></i></div>' +
        "</div>",
      iconSize: [72, 72],
      iconAnchor: [36, 36],
    });
  }

  function mountCockpitFlightTrackLayers(map, trackOpts, config) {
    trackOpts = trackOpts || {};
    var path = trackOpts.path || [
      [30.6042, 114.3728],
      [30.5968, 114.3659],
      [30.5882, 114.3543],
      [30.5784, 114.3442],
      [30.5686, 114.3346],
    ];
    var airportLl = trackOpts.airport || path[0];
    var targetLl = trackOpts.target || path[path.length - 1];
    var lineWeight = trackOpts.weight || 5;
    var lineColor = trackOpts.color || "#3b82f6";

    var trackGroup = L.layerGroup().addTo(map);
    var layers = { traveled: null, remaining: null, drone: null, airport: null, target: null };

    function drawProgress(frac) {
      if (layers.traveled) trackGroup.removeLayer(layers.traveled);
      if (layers.remaining) trackGroup.removeLayer(layers.remaining);
      if (layers.drone) trackGroup.removeLayer(layers.drone);

      var split = splitPathAtFraction(path, frac);
      if (split.traveled.length >= 2) {
        layers.traveled = L.polyline(split.traveled, {
          color: lineColor,
          weight: lineWeight,
          opacity: 1,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(trackGroup);
      }
      if (split.remaining.length >= 2) {
        layers.remaining = L.polyline(split.remaining, {
          color: lineColor,
          weight: lineWeight,
          opacity: 0.95,
          dashArray: "10 8",
          lineCap: "round",
          lineJoin: "round",
        }).addTo(trackGroup);
      }

      var next =
        split.remaining.length >= 2
          ? split.remaining[1]
          : split.traveled.length >= 2
            ? split.traveled[split.traveled.length - 1]
            : split.drone;
      var prev =
        split.traveled.length >= 2
          ? split.traveled[split.traveled.length - 2]
          : path[0];
      var heading = bearingDeg(prev, next);
      layers.drone = L.marker(split.drone, { icon: makeFlightDroneIcon(heading), zIndexOffset: 800 }).addTo(
        trackGroup
      );
    }

    layers.airport = L.marker(airportLl, { icon: makeFlightAirportIcon(), zIndexOffset: 600 }).addTo(trackGroup);
    layers.target = L.marker(targetLl, { icon: makeFlightTargetIcon(), zIndexOffset: 600 }).addTo(trackGroup);

    var progress = trackOpts.progress != null ? trackOpts.progress : 0.42;
    drawProgress(progress);

    try {
      map.fitBounds(L.latLngBounds(path), { padding: [28, 28], maxZoom: trackOpts.maxZoom || 15 });
    } catch (e) {}

    var animId = null;
    if (trackOpts.animate !== false) {
      var p = progress;
      var dir = 1;
      animId = setInterval(function () {
        p += dir * 0.006;
        if (p >= 0.78) dir = -1;
        if (p <= 0.18) dir = 1;
        drawProgress(p);
      }, 120);
    }

    return {
      map: map,
      trackGroup: trackGroup,
      stopAnimation: function () {
        if (animId) {
          clearInterval(animId);
          animId = null;
        }
      },
      setProgress: drawProgress,
    };
  }

  window.WuhanGIS.mountCockpitFlightTrackMap = function (containerId, options) {
    if (typeof L === "undefined") return null;
    var container = typeof containerId === "string" ? document.getElementById(containerId) : containerId;
    if (!container) return null;
    options = options || {};
    var trackOpts = options.flightTrack || options;
    var path = trackOpts.path || [
      [30.6042, 114.3728],
      [30.5968, 114.3659],
      [30.5882, 114.3543],
      [30.5784, 114.3442],
      [30.5686, 114.3346],
    ];

    var map = createSharedMap(container, {
      center: options.center || path[Math.floor(path.length / 2)],
      zoom: options.zoom || 14,
      zoomControl: options.zoomControl === true,
    });
    if (!map) return null;

    return mountCockpitFlightTrackLayers(map, trackOpts, options);
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

  window.WuhanGIS.makeBadgeIcon = makeBadgeIcon;

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

  window.WuhanGIS.makePhotoDropIcon = makePhotoDropIcon;

  var GIS_SEARCH_TYPE_LABELS = {
    stations: "站点",
    projects: "项目",
    staff: "人员",
    alarms: "告警点",
    airports: "机场",
    drones: "无人机",
    patrolDone: "已巡查",
    patrolTodo: "待巡查",
    patrolPhotos: "巡查照片",
    emergency: "应急人员",
    ew: "应急仓库",
  };

  function normalizeSearchText(text) {
    return String(text || "")
      .replace(/\s+/g, "")
      .toLowerCase();
  }

  function searchMatchScore(query, target) {
    var q = normalizeSearchText(query);
    var n = normalizeSearchText(target);
    if (!q) return 0;
    if (!n) return -1;
    if (n.indexOf(q) >= 0) return 100 + (q.length / Math.max(n.length, 1)) * 40;
    var qi = 0;
    for (var i = 0; i < n.length && qi < q.length; i++) {
      if (n.charAt(i) === q.charAt(qi)) qi++;
    }
    if (qi === q.length) return 50 + (qi / Math.max(n.length, 1)) * 30;
    return -1;
  }

  function entrySearchScore(entry, query) {
    var best = searchMatchScore(query, entry.name);
    if (entry.aliases) {
      entry.aliases.forEach(function (alias) {
        var s = searchMatchScore(query, alias);
        if (s > best) best = s;
      });
    }
    return best;
  }

  function layerSearchEntryId(entry) {
    return (entry.category || "") + ":" + (entry.name || "");
  }

  function serializeLayerSearchEntry(entry) {
    return {
      id: layerSearchEntryId(entry),
      name: entry.name,
      typeLabel: entry.typeLabel || GIS_SEARCH_TYPE_LABELS[entry.category] || "标注",
      ll: entry.ll,
      category: entry.category,
      emergencyKey: entry.emergencyKey || null,
    };
  }

  function filterLayerSearchIndex(index, query, limit) {
    var q = (query || "").trim();
    if (!q) return [];
    var max = limit == null ? 50 : limit;
    return index
      .map(function (entry) {
        return { entry: entry, score: entrySearchScore(entry, q) };
      })
      .filter(function (row) {
        return row.score > 0;
      })
      .sort(function (a, b) {
        return b.score - a.score;
      })
      .slice(0, max);
  }

  window.WuhanGIS.GIS_SEARCH_TYPE_LABELS = GIS_SEARCH_TYPE_LABELS;
  window.WuhanGIS.entrySearchScore = entrySearchScore;
  window.WuhanGIS.filterLayerSearchIndex = filterLayerSearchIndex;
  window.WuhanGIS.serializeLayerSearchEntry = serializeLayerSearchEntry;
  window.WuhanGIS.layerSearchEntryId = layerSearchEntryId;

  window.WuhanGIS.publishLayerSearchIndex = function (index) {
    try {
      var data = (index || []).map(serializeLayerSearchEntry);
      sessionStorage.setItem("whGisLayerSearchIndex", JSON.stringify(data));
    } catch (e) {}
  };

  window.WuhanGIS.readLayerSearchIndex = function () {
    try {
      var raw = sessionStorage.getItem("whGisLayerSearchIndex");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  function tryApplyGisPickOnRuntime(rt) {
    if (!rt || typeof rt.findSearchEntryById !== "function" || typeof rt.pickSearchEntry !== "function") {
      return;
    }
    try {
      var params = new URLSearchParams(window.location.search);
      var pickId = params.get("gisPick");
      if (!pickId) return;
      var entry = rt.findSearchEntryById(pickId);
      if (entry) {
        setTimeout(function () {
          rt.pickSearchEntry(entry);
        }, 400);
      }
      if (window.history.replaceState) {
        window.history.replaceState({}, "", window.location.pathname + window.location.hash);
      }
    } catch (e) {}
  }

  function init() {
    var container = document.getElementById("map-container");
    if (!container || typeof L === "undefined") return;
    if (container._leaflet_id != null) {
      tryApplyGisPickOnRuntime(window.__whGisRuntime);
      return;
    }

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
    var whPanel = document.getElementById("gis-wh-panel");
    var whBody = document.getElementById("gis-wh-body");
    var whClose = document.getElementById("gis-wh-close");

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
      patrolDone: true,
      patrolTodo: true,
      emergency: {},
    };

    var metroKeys = ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l11", "l16", "l19", "lyl"];
    /** 线路多选：与图层开关叠加，选中线路的关联要素才显示 */
    var lineSelected = {};
    var filteredFeatures = [];

    var metroColors = window.WuhanGIS.METRO_COLORS || {
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
    var emKeys = ["e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "ew"];
    var emergencyWarehouses = [
      {
        ll: [30.6842, 114.5531],
        name: "阳逻线委外项目部应急库",
        materialCount: "86 件",
        lng: "114.553100",
        lat: "30.684200",
        address: "新洲区阳逻开发区地铁委外基地",
        manager: "王磊",
        phone: "138 0000 2101",
        line: "武汉地铁阳逻线",
      },
      {
        ll: [30.5365, 114.3328],
        name: "2号线中南路应急仓库",
        materialCount: "214 件",
        lng: "114.332800",
        lat: "30.536500",
        address: "武昌区中南路 168 号",
        manager: "赵敏",
        phone: "138 0000 2102",
        line: "武汉地铁 2 号线",
      },
      {
        ll: [30.5872, 114.2715],
        name: "2号线中山公园应急仓库",
        materialCount: "178 件",
        lng: "114.271500",
        lat: "30.587200",
        address: "江汉区解放大道 1265 号",
        manager: "刘凯",
        phone: "138 0000 2103",
        line: "武汉地铁 2 号线",
      },
      {
        ll: [30.5512, 114.3378],
        name: "4号线土建洪山广场应急仓库",
        materialCount: "265 件",
        lng: "114.337800",
        lat: "30.551200",
        address: "武昌区中北路洪山广场段",
        manager: "李倩",
        phone: "138 0000 2104",
        line: "武汉地铁 4 号线",
      },
      {
        ll: [30.5301, 114.3168],
        name: "4号线武昌火车站仓库",
        materialCount: "192 件",
        lng: "114.316800",
        lat: "30.530100",
        address: "武昌区中山路武昌火车站",
        manager: "陈涛",
        phone: "138 0000 2105",
        line: "武汉地铁 4 号线",
      },
      {
        ll: [30.6012, 114.3085],
        name: "7号线三阳路仓库",
        materialCount: "143 件",
        lng: "114.308500",
        lat: "30.601200",
        address: "江岸区三阳路地铁站旁",
        manager: "周芳",
        phone: "138 0000 2106",
        line: "武汉地铁 7 号线",
      },
    ];
    var warehouseByName = {};
    var warehouseMarkers = {};
    var staffLineKeys = ["l2", "l4", "l5", "l8", "l2", "l4"];

    function registerFeature(layer, parent, category, metroKey, emergencyKey) {
      filteredFeatures.push({
        layer: layer,
        parent: parent,
        category: category,
        metroKey: metroKey,
        emergencyKey: emergencyKey || null,
      });
    }

    var layerSearchIndex = [];
    var emTypeLabels = {
      e1: "道岔挤岔",
      e2: "钢轨折断",
      e3: "雨水倒灌",
      e4: "胀轨",
      e5: "道床变形",
      e6: "隧道结构",
      e7: "其他",
      e8: "土建",
      ew: "应急仓库",
    };

    function addSearchEntry(entry) {
      if (!entry || !entry.name || !entry.ll || entry.ll.length < 2) return;
      entry.typeLabel = entry.typeLabel || GIS_SEARCH_TYPE_LABELS[entry.category] || "标注";
      layerSearchIndex.push(entry);
    }

    metroKeys.forEach(function (k) {
      lineSelected[k] = true;
    });

    function matchesLineFilter(metroKey) {
      if (!metroKey) return false;
      return !!lineSelected[metroKey];
    }

    function isCategoryOn(f) {
      if (f.category === "emergency") return !!state.emergency[f.emergencyKey];
      if (f.category === "patrolPhotos") return !!state.patrolDone;
      return !!state[f.category];
    }

    function shouldShowFeature(f) {
      return isCategoryOn(f) && matchesLineFilter(f.metroKey);
    }

    function syncFilteredFeatures() {
      filteredFeatures.forEach(function (f) {
        var show = shouldShowFeature(f);
        if (show) {
          if (!f.parent.hasLayer(f.layer)) f.parent.addLayer(f.layer);
        } else if (f.parent.hasLayer(f.layer)) {
          f.parent.removeLayer(f.layer);
        }
      });
    }

    function refreshMetroLineStyles() {
      var allOn = metroKeys.every(function (k) {
        return !!lineSelected[k];
      });
      var anyOn = metroKeys.some(function (k) {
        return !!lineSelected[k];
      });
      Object.keys(layers.metro).forEach(function (k) {
        var entry = layers.metro[k];
        if (!entry || !entry.line) return;
        var focused = allOn || !anyOn || !!lineSelected[k];
        entry.line.setStyle({
          opacity: focused ? 0.95 : 0.32,
          weight: focused ? 5 : 3,
        });
        entry.glow.setStyle({
          opacity: focused ? 0.18 : 0.05,
          weight: focused ? 9 : 5,
        });
      });
    }

    function setLineFilterBtn(btn, on) {
      if (!btn) return;
      btn.classList.toggle("gis-line-btn--active", !!on);
    }

    function refreshMetroBatchSwitch() {
      setBatchSwitch(
        "metro",
        metroKeys.every(function (k) {
          return !!lineSelected[k];
        })
      );
    }

    function refreshMetroFilterUI() {
      document.querySelectorAll("[data-metro]").forEach(function (btn) {
        var key = btn.getAttribute("data-metro");
        setLineFilterBtn(btn, !!lineSelected[key]);
      });
      refreshMetroBatchSwitch();
      refreshMetroLineStyles();
    }

    function closeDetailPanel() {
      if (!detailPanel) return;
      detailPanel.classList.add("hidden");
    }

    function closeWarehouseListPanel() {
      if (!whPanel) return;
      whPanel.classList.add("hidden");
    }

    function openDetailPanel(title, html, options) {
      if (!detailPanel || !detailTitle || !detailBody) return;
      detailTitle.textContent = title;
      detailBody.innerHTML = html;
      detailPanel.classList.remove("hidden");
      wireDetailInteractivity(detailBody);
      bindAlarmFlightPlanAction(detailBody, options && options.alarm);
      bindAlarmDetailNavigation(detailBody, options && options.alarm);
    }

    function openWarehouseListPanel() {
      if (!whPanel || !whBody) return;
      whBody.innerHTML = buildWarehouseListHtml(emergencyMaterialWarehouses);
      whPanel.classList.remove("hidden");
      whBody._gisWarehousePick = focusWarehouseByName;
      wireDetailInteractivity(whBody);
    }

    function openWarehouseDetailPanel(wh) {
      openDetailPanel("仓库信息", buildWarehouseDetailBodyHtml(wh));
    }

    function focusWarehouseByName(name) {
      var wh = warehouseByName[name];
      if (!wh) return;
      if (!state.emergency.ew) {
        state.emergency.ew = true;
        applyEmergency();
      }
      map.flyTo(wh.ll, 15, { duration: 0.75 });
      openWarehouseDetailPanel(wh);
      var marker = warehouseMarkers[name];
      if (marker && marker.setZIndexOffset) marker.setZIndexOffset(1000);
    }

    detailBody._gisWarehousePick = focusWarehouseByName;

    if (detailClose) {
      detailClose.addEventListener("click", function () {
        closeDetailPanel();
      });
    }

    if (whClose) {
      whClose.addEventListener("click", function () {
        closeWarehouseListPanel();
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

    function renderTrackPanel(data, detailUrl) {
      return renderTrackPanelHtml(data, { detailUrl: detailUrl });
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
      return buildAirportDronePanelHtml(items, { hideCockpitNav: false });
    }

    function getProjectLatestPhoto(item) {
      var key = item.ll[0].toFixed(3) + "," + item.ll[1].toFixed(3);
      var photoMap = {
        "30.605,114.295": { src: "assets/img/ref-dashboard-neon.png", time: "2026/05/14 09:26", ll: [30.587, 114.296] },
        "30.575,114.325": { src: "assets/img/map-gis-satellite.png", time: "2026/05/14 10:42", ll: [30.584, 114.302] },
        "30.565,114.300": { src: "assets/img/map-gis-road.png", time: "2026/05/14 14:08", ll: [30.590, 114.306] },
      };
      var hit = photoMap[key];
      if (!hit) return null;
      return {
        src: typeof whAsset === "function" ? whAsset(hit.src) : hit.src,
        time: hit.time,
        ll: hit.ll,
      };
    }

    function jitter(seed, i) {
      return ((seed * 9301 + 49297 + i * 17) % 233280) / 233280 - 0.5;
    }

    var metroPaths = window.WuhanGIS.METRO_PATHS;
    if (!metroPaths) {
      console.warn("[map-gis] METRO_PATHS 未加载，请检查 map-metro-data.js");
      applyAnnotation();
      applyAirports();
      applyPatrol();
      applyEmergency();
      if (document.body.classList.contains("gis-mobile-page")) {
        setupMobileSearchNav();
      } else {
        setupLayerSearch();
      }
      if (window.WuhanGIS.publishLayerSearchIndex) {
        window.WuhanGIS.publishLayerSearchIndex(layerSearchIndex);
      }
      setTimeout(function () {
        map.invalidateSize();
      }, 200);
      window.addEventListener("resize", function () {
        map.invalidateSize();
      });
      return;
    }

    ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l11", "l16", "l19", "lyl"].forEach(function (key) {
      var curve = smoothMetroCurve(metroPaths[key], { segmentsPerLeg: 16 });
      var glow = L.polyline(curve, {
        color: metroColors[key],
        weight: 9,
        opacity: 0.18,
        lineCap: "round",
        lineJoin: "round",
        smoothFactor: 0
      });
      var poly = L.polyline(curve, {
        color: metroColors[key],
        weight: 5,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
        smoothFactor: 0
      });
      layers.metro[key] = { group: L.layerGroup([glow, poly]), glow: glow, line: poly };
      map.addLayer(layers.metro[key].group);
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
      registerFeature(marker, layers.stations, "stations", lineKeyFromLabel(item.line));
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
          ]) + (isGisMobilePage() ? "" : buildDetailNavHtml(stationDetailUrl(item)))
        );
      });
      addSearchEntry({ name: item.name, typeLabel: "站点", ll: item.ll, category: "stations", marker: marker });
    });

    function projectMarkerIcon(level) {
      var isKey = level === "重点项目";
      return makeBadgeIcon(isKey ? "#ef4444" : "#f97316", "fa-solid fa-building", 28);
    }

    [
      {
        ll: [30.605, 114.295],
        name: "武昌段排水改造工程",
        line: "武汉地铁 2 号线",
        section: "积玉桥站 - 螃蟹岬站",
        level: "重点项目",
        workType: "市政施工",
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
        level: "一般项目",
        workType: "管线迁改",
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
        level: "重点项目",
        workType: "房建工程",
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
        level: "一般项目",
        workType: "道路提升",
        category: "路面翻修",
        minDistance: "8.9 米",
        depth: "12.8 米",
        relation: "项目位于站点西南侧，施工车辆频繁进出，需重点关注路面荷载与围挡稳定情况。",
      },
    ].forEach(function (item) {
      var marker = L.marker(item.ll, { icon: projectMarkerIcon(item.level) }).addTo(layers.projects);
      registerFeature(marker, layers.projects, "projects", lineKeyFromLabel(item.line));
      marker.on("click", function () {
        openDetailPanel(
          "项目详情",
          renderLongTextFields([
            { label: "项目名称", value: item.name },
            { label: "所属线路", value: item.line },
            { label: "所在区间站点", value: item.section },
            { label: "项目类型", value: item.level },
            { label: "工程类型", value: item.workType },
            { label: "工程类别", value: item.category },
            { label: "距离地铁结构最小净距", value: item.minDistance },
            { label: "地铁结构埋深", value: item.depth },
            { label: "位置关系", value: item.relation, multiline: true },
          ]) + buildDetailNavHtml(projectDetailUrl(item.name))
        );
      });
      addSearchEntry({ name: item.name, typeLabel: "项目", ll: item.ll, category: "projects", marker: marker });
    });

    [
      buildTrackItemData({
        ll: [WUHAN[0] + jitter(50, 0) * 0.04, WUHAN[1] + jitter(51, 0) * 0.05],
        deviceCode: "Y18807",
        slots: [
          { h: 8, m: 38, s: 15, suffix: "248447" },
          { h: 10, m: 12, s: 6, suffix: "248451" },
          { h: 14, m: 26, s: 41, suffix: "248468" },
        ],
      }),
      buildTrackItemData({
        ll: [WUHAN[0] + jitter(50, 1) * 0.04, WUHAN[1] + jitter(51, 1) * 0.05],
        deviceCode: "Y18812",
        slots: [
          { h: 7, m: 18, s: 23, suffix: "248602" },
          { h: 11, m: 43, s: 8, suffix: "248615" },
          { h: 16, m: 12, s: 50, suffix: "248633" },
        ],
      }),
      buildTrackItemData({
        ll: [WUHAN[0] + jitter(50, 2) * 0.04, WUHAN[1] + jitter(51, 2) * 0.05],
        deviceCode: "Y18819",
        slots: [
          { h: 9, m: 31, s: 2, suffix: "248741" },
          { h: 13, m: 22, s: 47, suffix: "248763" },
          { h: 18, m: 9, s: 13, suffix: "248788" },
        ],
      }),
      buildTrackItemData({
        ll: [WUHAN[0] + jitter(50, 3) * 0.04, WUHAN[1] + jitter(51, 3) * 0.05],
        deviceCode: "Y18824",
        slots: [
          { h: 8, m: 52, s: 15, suffix: "248910" },
          { h: 12, m: 40, s: 31, suffix: "248926" },
          { h: 17, m: 55, s: 29, suffix: "248941" },
        ],
      }),
      buildTrackItemData({
        ll: [WUHAN[0] + jitter(50, 4) * 0.04, WUHAN[1] + jitter(51, 4) * 0.05],
        deviceCode: "Y18831",
        slots: [
          { h: 7, m: 11, s: 9, suffix: "249004" },
          { h: 11, m: 26, s: 14, suffix: "249028" },
          { h: 17, m: 3, s: 42, suffix: "249053" },
        ],
      }),
      buildTrackItemData({
        ll: [WUHAN[0] + jitter(50, 5) * 0.04, WUHAN[1] + jitter(51, 5) * 0.05],
        deviceCode: "Y18837",
        slots: [
          { h: 8, m: 26, s: 58, suffix: "249144" },
          { h: 13, m: 17, s: 5, suffix: "249158" },
          { h: 17, m: 48, s: 36, suffix: "249176" },
        ],
      }),
    ].forEach(function (item, staffIdx) {
      var marker = L.marker(item.ll, {
        icon: makeBadgeIcon("#2563eb", "fa-solid fa-person-walking", 28),
      }).addTo(layers.staff);
      registerFeature(marker, layers.staff, "staff", staffLineKeys[staffIdx % staffLineKeys.length]);
      marker.on("click", function () {
        openDetailPanel("人员轨迹", renderTrackPanel(item, isGisMobilePage() ? null : trackPersonDetailUrl(item.deviceCode)));
      });
      addSearchEntry({
        name: item.deviceCode,
        typeLabel: "人员",
        ll: item.ll,
        category: "staff",
        marker: marker,
      });
    });

    layers.alarms.clearLayers();
    defaultAlarmDetails.forEach(function (alarm, i) {
      var alarmLines = ["l2", "l5", "l8"];
      var alarmMarker = L.marker(alarm.ll, { icon: makeBadgeIcon("#ef4444", "fa-solid fa-circle-exclamation", 28) }).addTo(layers.alarms);
      registerFeature(alarmMarker, layers.alarms, "alarms", alarmLines[i]);
      alarmMarker.bindTooltip(alarm.alarmPosition, {
        direction: "top",
        offset: [0, -14],
        opacity: 0.96,
        className: "gis-alarm-tooltip",
      });
      alarmMarker.on("mouseover", function () {
        alarmMarker.openTooltip();
      });
      alarmMarker.on("click", function () {
        openDetailPanel("告警详情", buildAlarmPanelHtml(alarm, alarm.airports || []), { alarm: alarm });
      });
      addSearchEntry({
        name: alarm.projectName,
        aliases: [alarm.alarmSection, alarm.alarmPosition],
        typeLabel: "告警点",
        ll: alarm.ll,
        category: "alarms",
        marker: alarmMarker,
      });
    });

    layers.airports.clearLayers();
    [
      { ll: [30.588, 114.302], name: "机场1" },
      { ll: [30.602, 114.338], name: "机场2" },
    ].forEach(function (item, airportIdx) {
      var airportMarker = L.marker(item.ll, { icon: makeBadgeIcon("#0f766e", "fa-solid fa-plane-departure", 30) }).addTo(layers.airports);
      registerFeature(airportMarker, layers.airports, "airports", airportIdx === 0 ? "l2" : "l8");
      airportMarker.on("click", function () {
        openDetailPanel(
          "机场及关联无人机详情",
          renderAirportDronePanel([
            {
              airportName: item.name,
              flightPlan: item.name === "机场1" ? "8号线车辆段常规巡检" : "青山站周期巡检",
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
      addSearchEntry({ name: item.name, typeLabel: "机场", ll: item.ll, category: "airports", marker: airportMarker });
    });

    [
      buildTrackItemData({
        ll: [30.584, 114.314],
        deviceCode: "DJI-M350-0007",
        slots: [
          { h: 8, m: 42, s: 11, suffix: "1821" },
          { h: 11, m: 28, s: 37, suffix: "1830" },
          { h: 16, m: 14, s: 52, suffix: "1839" },
        ],
      }),
      buildTrackItemData({
        ll: [30.609, 114.322],
        deviceCode: "DJI-M350-0012",
        slots: [
          { h: 9, m: 6, s: 45, suffix: "1914" },
          { h: 13, m: 52, s: 26, suffix: "1927" },
          { h: 17, m: 31, s: 8, suffix: "1933" },
        ],
      }),
    ].forEach(function (item, droneIdx) {
      var marker = L.marker(item.ll, { icon: makeBadgeIcon("#2563eb", "fa-solid fa-helicopter-symbol", 28) }).addTo(layers.drones);
      registerFeature(marker, layers.drones, "drones", droneIdx === 0 ? "l2" : "l8");
      marker.on("click", function () {
        openDetailPanel("无人机详情", renderTrackPanel(item, isGisMobilePage() ? null : flightLogDetailUrl(item.deviceCode)));
      });
      addSearchEntry({
        name: item.deviceCode,
        typeLabel: "无人机",
        ll: item.ll,
        category: "drones",
        marker: marker,
      });
    });

    if (window.WuhanGIS.mountPatrolLayers) {
      window.WuhanGIS.mountPatrolLayers(map, {
        layers: layers,
        registerFeature: registerFeature,
        makePhotoDropIcon: makePhotoDropIcon,
        showPhotos: true,
        onSearchItem: addSearchEntry,
        onPhotoClick: function (drop) {
          var src = typeof whAsset === "function" ? whAsset(drop.src) : drop.src;
          openDetailPanel(
            "工地最新照片",
            renderLongTextFields([
              { label: "工程项目", value: drop.name },
              { label: "拍摄时间", value: drop.time },
              {
                label: "现场照片",
                value: '<img src="' + src + '" alt="' + (drop.name || "工地照片") + '" style="max-width:100%;border-radius:8px;display:block" />',
                multiline: true,
              },
            ]) + buildDetailNavHtml(manualPatrolDetailUrl(drop))
          );
        },
      });
    }

    emKeys.forEach(function (ek, idx) {
      var g = L.layerGroup();
      if (ek === "ew") {
        emergencyWarehouses.forEach(function (wh) {
          warehouseByName[wh.name] = wh;
          var marker = L.marker(wh.ll, {
            icon: makeBadgeIcon("#d97706", "fa-solid fa-warehouse", 28),
          }).addTo(g);
          warehouseMarkers[wh.name] = marker;
          registerFeature(marker, g, "emergency", lineKeyFromLabel(wh.line), ek);
          marker.on("click", function () {
            openWarehouseDetailPanel(wh);
          });
          addSearchEntry({
            name: wh.name,
            typeLabel: "应急仓库",
            ll: wh.ll,
            category: "ew",
            emergencyKey: "ew",
            marker: marker,
          });
        });
      } else {
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
            registerFeature(marker, g, "emergency", lineKeyFromLabel(person.line), ek);
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
                ]) + buildDetailNavHtml(emergencyStaffDetailUrl(person))
              );
            });
            (function (personMarker, personData) {
              var ll = personMarker.getLatLng();
              addSearchEntry({
                name: personData.name,
                aliases: [personData.code, personData.dept, personData.address],
                typeLabel: emTypeLabels[ek] || "应急人员",
                ll: [ll.lat, ll.lng],
                category: "emergency",
                emergencyKey: ek,
                marker: personMarker,
              });
            })(marker, person);
          })(k);
        }
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
      syncFilteredFeatures();
    }

    function applyAirports() {
      syncLayer(layers.airports, state.airports);
      syncLayer(layers.drones, state.drones);
      syncFilteredFeatures();
    }

    function applyPatrol() {
      syncLayer(layers.patrolDone, state.patrolDone);
      syncLayer(layers.patrolTodo, state.patrolTodo);
      syncLayer(layers.patrolPhotos, state.patrolDone);
      syncFilteredFeatures();
    }

    function applyEmergency() {
      var anyStaffOn = emKeys.some(function (k) {
        return k !== "ew" && !!state.emergency[k];
      });
      state.emergency.ew = anyStaffOn;
      emKeys.forEach(function (k) {
        syncLayer(layers.emergency[k], !!state.emergency[k]);
      });
      syncFilteredFeatures();
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
        lineSelected[k] = !lineSelected[k];
        setLineFilterBtn(btn, lineSelected[k]);
        refreshMetroBatchSwitch();
        refreshMetroLineStyles();
        syncFilteredFeatures();
      });
      setLineFilterBtn(btn, !!lineSelected[k]);
    });

    var metroBatch = document.querySelector('[data-batch-switch="metro"]');
    if (metroBatch) {
      metroBatch.addEventListener("click", function (event) {
        event.stopPropagation();
        var next = !metroBatch.classList.contains("is-on");
        metroKeys.forEach(function (key) {
          lineSelected[key] = next;
          document.querySelectorAll('[data-metro="' + key + '"]').forEach(function (lineBtn) {
            setLineFilterBtn(lineBtn, next);
          });
        });
        setBatchSwitch("metro", next);
        refreshMetroLineStyles();
        syncFilteredFeatures();
      });
    }

    document.querySelectorAll("[data-emergency]").forEach(function (btn) {
      var k = btn.getAttribute("data-emergency");
      btn.addEventListener("click", function () {
        state.emergency[k] = !state.emergency[k];
        setToggleBtn(btn, state.emergency[k]);
        applyEmergency();
        refreshEmergencyBatchSwitch();
        if (state.emergency[k] && k !== "ew") {
          openWarehouseListPanel();
        }
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
        if (next) openWarehouseListPanel();
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
    var coordPanel = document.getElementById("gis-coord-panel");
    var coordLngInput = document.getElementById("gis-coord-lng");
    var coordLatInput = document.getElementById("gis-coord-lat");
    var coordPickMapBtn = document.getElementById("gis-coord-pick-map");
    var coordLocateBtn = document.getElementById("gis-coord-locate");
    var coordCloseBtn = document.getElementById("gis-coord-close");
    var coordMapPickActive = false;

    function clearToolGeometry() {
      drawLayer.clearLayers();
      pickLayer.clearLayers();
      distPoints = [];
      distLine = null;
      areaPoints = [];
      areaPreview = null;
    }

    function parseCoordInputs() {
      if (!coordLngInput || !coordLatInput) return null;
      var lng = parseFloat(String(coordLngInput.value).trim());
      var lat = parseFloat(String(coordLatInput.value).trim());
      if (!isFinite(lng) || !isFinite(lat)) return null;
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) return null;
      return { lng: lng, lat: lat };
    }

    function setCoordInputs(lng, lat) {
      if (coordLngInput) coordLngInput.value = Number(lng).toFixed(6);
      if (coordLatInput) coordLatInput.value = Number(lat).toFixed(6);
    }

    function showCoordMarker(lat, lng) {
      pickLayer.clearLayers();
      L.marker([lat, lng], {
        icon: makeBadgeIcon("#22d3ee", "fa-solid fa-location-crosshairs", 28),
      }).addTo(pickLayer);
    }

    function stopCoordMapPick() {
      coordMapPickActive = false;
      if (coordPickMapBtn) coordPickMapBtn.classList.remove("gis-coord-btn--active");
      if (toolMode !== "distance" && toolMode !== "area") {
        map.getContainer().style.cursor = "";
        map.doubleClickZoom.enable();
      }
    }

    function startCoordMapPick() {
      stopCoordMapPick();
      coordMapPickActive = true;
      if (coordPickMapBtn) coordPickMapBtn.classList.add("gis-coord-btn--active");
      map.getContainer().style.cursor = "crosshair";
      map.doubleClickZoom.disable();
    }

    function closeCoordPanel() {
      if (coordPanel) coordPanel.classList.add("hidden");
      stopCoordMapPick();
      pickLayer.clearLayers();
      if (toolMode === "pick") {
        toolMode = null;
        document.querySelectorAll("[data-tool]").forEach(function (btn) {
          btn.classList.remove("gis-toolbar__btn--active");
        });
      }
    }

    function openCoordPanel() {
      if (coordPanel) coordPanel.classList.remove("hidden");
      toolMode = "pick";
      document.querySelectorAll("[data-tool]").forEach(function (btn) {
        btn.classList.toggle("gis-toolbar__btn--active", btn.getAttribute("data-tool") === "pick");
      });
      hudHide();
    }

    function locateByCoords() {
      var coords = parseCoordInputs();
      if (!coords) {
        alert("请输入有效的经度和纬度。");
        return;
      }
      setCoordInputs(coords.lng, coords.lat);
      showCoordMarker(coords.lat, coords.lng);
      map.flyTo([coords.lat, coords.lng], 16, { duration: 0.85 });
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

      if (mode === "distance" || mode === "area") map.doubleClickZoom.disable();
      else if (mode !== "pick") map.doubleClickZoom.enable();

      if (mode === "distance") refreshDistanceHud();
      else if (mode === "area") refreshAreaHud();
      else if (mode !== "pick") {
        stopCoordMapPick();
        hudHide();
      }
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
      if (coordMapPickActive) {
        setCoordInputs(e.latlng.lng, e.latlng.lat);
        showCoordMarker(e.latlng.lat, e.latlng.lng);
        stopCoordMapPick();
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

    if (coordCloseBtn) {
      coordCloseBtn.addEventListener("click", closeCoordPanel);
    }
    if (coordPickMapBtn) {
      coordPickMapBtn.addEventListener("click", function () {
        if (coordMapPickActive) stopCoordMapPick();
        else startCoordMapPick();
      });
    }
    if (coordLocateBtn) {
      coordLocateBtn.addEventListener("click", locateByCoords);
    }

    var pickBtn = document.querySelector('[data-tool="pick"]');
    if (pickBtn) {
      pickBtn.addEventListener("click", function () {
        if (coordPanel && !coordPanel.classList.contains("hidden")) {
          closeCoordPanel();
        } else {
          openCoordPanel();
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
        closeCoordPanel();
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

    function ensureSearchTargetVisible(entry) {
      var cat = entry.category;
      var ek = entry.emergencyKey;
      if (cat === "stations" || cat === "projects" || cat === "staff" || cat === "alarms") {
        if (!state[cat]) {
          state[cat] = true;
          document.querySelectorAll('[data-anno="' + cat + '"]').forEach(function (btn) {
            setToggleBtn(btn, true);
          });
          applyAnnotation();
          refreshAnnoBatchSwitch();
        }
      } else if (cat === "airports") {
        if (!state.airports) {
          state.airports = true;
          setToggleBtn(document.querySelector('[data-airport="show"]'), true);
          setToggleBtn(document.querySelector('[data-airport="hide"]'), false);
          applyAirports();
        }
      } else if (cat === "drones") {
        if (!state.drones) {
          state.drones = true;
          setToggleBtn(document.querySelector('[data-drone="show"]'), true);
          setToggleBtn(document.querySelector('[data-drone="hide"]'), false);
          applyAirports();
        }
      } else if (cat === "patrolDone" || cat === "patrolPhotos") {
        if (!state.patrolDone) {
          state.patrolDone = true;
          document.querySelectorAll('[data-patrol="done"]').forEach(function (btn) {
            setToggleBtn(btn, true);
          });
          applyPatrol();
          refreshPatrolBatchSwitch();
        }
      } else if (cat === "patrolTodo") {
        if (!state.patrolTodo) {
          state.patrolTodo = true;
          document.querySelectorAll('[data-patrol="todo"]').forEach(function (btn) {
            setToggleBtn(btn, true);
          });
          applyPatrol();
          refreshPatrolBatchSwitch();
        }
      } else if (ek && !state.emergency[ek]) {
        state.emergency[ek] = true;
        document.querySelectorAll('[data-emergency="' + ek + '"]').forEach(function (btn) {
          btn.classList.add("gis-em-btn--active");
        });
        if (ek === "ew") {
          syncLayer(layers.emergency.ew, true);
        } else {
          applyEmergency();
        }
        refreshEmergencyBatchSwitch();
      }
    }

    var searchHighlight = null;

    function clearSearchHighlight() {
      if (searchHighlight) {
        drawLayer.removeLayer(searchHighlight);
        searchHighlight = null;
      }
    }

    function pickSearchEntry(entry) {
      if (!entry || !entry.ll) return;
      ensureSearchTargetVisible(entry);
      map.flyTo(entry.ll, entry.zoom || 15, { duration: 0.85 });
      clearSearchHighlight();
      searchHighlight = L.circleMarker(entry.ll, {
        radius: 10,
        color: "#236aff",
        fillColor: "#60a5fa",
        fillOpacity: 0.35,
        weight: 2,
      }).addTo(drawLayer);
      if (entry.marker && entry.marker.fire) {
        setTimeout(function () {
          entry.marker.fire("click");
        }, 420);
      } else if (typeof entry.onPick === "function") {
        entry.onPick();
      }
    }

    function findSearchEntryById(pickId) {
      if (!pickId) return null;
      for (var i = 0; i < layerSearchIndex.length; i++) {
        if (layerSearchEntryId(layerSearchIndex[i]) === pickId) return layerSearchIndex[i];
      }
      return null;
    }

    function applyGisPickFromUrl() {
      tryApplyGisPickOnRuntime({
        findSearchEntryById: findSearchEntryById,
        pickSearchEntry: pickSearchEntry,
      });
    }

    function setupMobileSearchNav() {
      var searchInput = document.querySelector('[data-action="search-input"]');
      var searchBtn = document.querySelector('[data-action="search-jump"]');
      function openSearchPage() {
        var q = searchInput ? (searchInput.value || "").trim() : "";
        var url = "gis-search.html" + (q ? "?q=" + encodeURIComponent(q) : "");
        window.location.href = url;
      }
      if (searchBtn) {
        searchBtn.addEventListener("click", function (e) {
          e.preventDefault();
          openSearchPage();
        });
      }
      if (searchInput) {
        searchInput.setAttribute("readonly", "readonly");
        searchInput.addEventListener("click", openSearchPage);
        searchInput.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            openSearchPage();
          }
        });
      }
    }

    function setupLayerSearch() {
      var searchInput = document.querySelector('[data-action="search-input"]');
      var searchBtn = document.querySelector('[data-action="search-jump"]');
      var searchRow = searchInput && searchInput.closest(".gis-search-row");
      if (!searchInput || !searchRow) return;

      var resultsEl = document.getElementById("gis-search-results");
      if (!resultsEl) {
        resultsEl = document.createElement("div");
        resultsEl.id = "gis-search-results";
        resultsEl.className = "gis-search-results";
        resultsEl.setAttribute("role", "listbox");
        resultsEl.hidden = true;
        searchRow.parentNode.insertBefore(resultsEl, searchRow.nextSibling);
      }

      function hideResults() {
        resultsEl.hidden = true;
        resultsEl.innerHTML = "";
      }

      function pickSearchEntryInline(entry) {
        hideResults();
        pickSearchEntry(entry);
      }

      function renderSearchResults(query) {
        var q = (query || "").trim();
        if (!q) {
          hideResults();
          return;
        }
        var hits = layerSearchIndex
          .map(function (entry) {
            return { entry: entry, score: entrySearchScore(entry, q) };
          })
          .filter(function (row) {
            return row.score > 0;
          })
          .sort(function (a, b) {
            return b.score - a.score;
          })
          .slice(0, 12);

        if (!hits.length) {
          resultsEl.hidden = false;
          resultsEl.innerHTML = '<div class="gis-search-results__empty">未找到匹配的标注</div>';
          return;
        }

        resultsEl.hidden = false;
        resultsEl.innerHTML = hits
          .map(function (row, idx) {
            var e = row.entry;
            return (
              '<button type="button" class="gis-search-result" role="option" data-search-index="' +
              idx +
              '">' +
              '<span class="gis-search-result__name">' +
              escapeHtml(e.name) +
              "</span>" +
              '<span class="gis-search-result__type">' +
              escapeHtml(e.typeLabel) +
              "</span>" +
              "</button>"
            );
          })
          .join("");

        resultsEl.querySelectorAll(".gis-search-result").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var idx = Number(btn.getAttribute("data-search-index"));
            if (hits[idx]) pickSearchEntryInline(hits[idx].entry);
          });
        });
      }

      function escapeHtml(text) {
        return String(text)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }

      searchInput.addEventListener("input", function () {
        renderSearchResults(searchInput.value);
      });

      searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          var first = resultsEl.querySelector(".gis-search-result");
          if (first) first.click();
        }
      });

      if (searchBtn) {
        searchBtn.addEventListener("click", function () {
          var q = (searchInput.value || "").trim();
          if (!q) {
            searchInput.focus();
            return;
          }
          renderSearchResults(q);
          var first = resultsEl.querySelector(".gis-search-result");
          if (first) first.click();
          else alert("未找到匹配的标注，请更换关键词。");
        });
      }

      document.addEventListener("click", function (e) {
        if (!searchRow.contains(e.target) && !resultsEl.contains(e.target)) {
          hideResults();
        }
      });
    }

    if (document.body.classList.contains("gis-mobile-page")) {
      setupMobileSearchNav();
    } else {
      setupLayerSearch();
    }

    if (window.WuhanGIS.publishLayerSearchIndex) {
      window.WuhanGIS.publishLayerSearchIndex(layerSearchIndex);
    }

    window.__whGisRuntime = {
      map: map,
      layerSearchIndex: layerSearchIndex,
      findSearchEntryById: findSearchEntryById,
      pickSearchEntry: pickSearchEntry,
      publishIndex: function () {
        if (window.WuhanGIS.publishLayerSearchIndex) {
          window.WuhanGIS.publishLayerSearchIndex(layerSearchIndex);
        }
      },
    };

    applyGisPickFromUrl();

    applyAnnotation();
    applyAirports();
    applyPatrol();
    applyEmergency();
    refreshMetroFilterUI();
    syncFilteredFeatures();
    refreshMetroBatchSwitch();
    refreshAnnoBatchSwitch();
    refreshPatrolBatchSwitch();
    refreshEmergencyBatchSwitch();

    setTimeout(function () {
      map.invalidateSize();
    }, 200);
    window.addEventListener("resize", function () {
      map.invalidateSize();
    });
  }

  window.WuhanGIS.bootGisPage = function () {
    setTimeout(init, 50);
  };

  var autoBoot = document.getElementById("map-container") && !document.body.classList.contains("gis-mobile-page");
  if (autoBoot) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        setTimeout(init, 150);
      });
    } else {
      setTimeout(init, 150);
    }
  }
})();
