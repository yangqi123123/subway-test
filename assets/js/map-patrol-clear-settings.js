(function (global) {
  var STORAGE_KEY = "wh-map-patrol-clear-v1";
  var DAY_MS = 86400000;

  var DEFAULT_ZONE_DEFS = [
    {
      lineKey: "l2",
      start: 0,
      end: 1,
      kind: "splitLR",
      photoStart: 0.4,
      photoEnd: 0.58,
      popupLeft: "已巡查区域（线路左侧）",
      popupRight: "风险区域（线路右侧）",
      lineFilter: "l2",
    },
    {
      lineKey: "l8",
      start: 0.5,
      end: 0.7,
      kind: "todo",
      popup: "待巡查区域",
      lineFilter: "l8",
    },
  ];

  var DEFAULT_PHOTO_DROPS = [
    {
      lineKey: "l2",
      ratio: 0.44,
      name: "光谷广场站区间基坑工程",
      time: "2026/05/14 09:26",
      src: "assets/img/ref-dashboard-neon.png",
    },
    {
      lineKey: "l2",
      ratio: 0.5,
      name: "街道口站联络通道工程",
      time: "2026/05/14 10:42",
      src: "assets/img/map-gis-satellite.png",
    },
    {
      lineKey: "l2",
      ratio: 0.54,
      name: "中南路站附属结构施工",
      time: "2026/05/14 14:08",
      src: "assets/img/map-gis-road.png",
    },
  ];

  function cloneJson(arr) {
    return JSON.parse(JSON.stringify(arr));
  }

  function load() {
    try {
      var raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function save(state) {
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore */
    }
    return state;
  }

  function defaults() {
    return {
      intervalDays: 7,
      zonesSuppressed: false,
      zonesSeededAt: Date.now(),
      lastClearAt: null,
    };
  }

  function getState() {
    var state = load();
    if (!state) {
      state = defaults();
      save(state);
    }
    if (!state.zonesSeededAt && !state.zonesSuppressed) {
      state.zonesSeededAt = Date.now();
      save(state);
    }
    return state;
  }

  function formatDateTime(ts) {
    if (!ts) return "—";
    var d = new Date(ts);
    if (isNaN(d.getTime())) return "—";
    var pad = function (n) {
      return n < 10 ? "0" + n : String(n);
    };
    return (
      d.getFullYear() +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate()) +
      " " +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes())
    );
  }

  function clampDays(days) {
    var n = parseInt(days, 10);
    if (isNaN(n) || n < 1) return 1;
    if (n > 365) return 365;
    return n;
  }

  function performClear() {
    var state = getState();
    state.zonesSuppressed = true;
    state.lastClearAt = Date.now();
    save(state);
    return state;
  }

  function restoreDemoZones() {
    var state = getState();
    state.zonesSuppressed = false;
    state.zonesSeededAt = Date.now();
    state.lastClearAt = null;
    save(state);
    return state;
  }

  function setIntervalDays(days) {
    var state = getState();
    state.intervalDays = clampDays(days);
    save(state);
    return state;
  }

  function getNextClearAt(state) {
    state = state || getState();
    if (state.zonesSuppressed) return null;
    var anchor = state.zonesSeededAt || Date.now();
    return anchor + state.intervalDays * DAY_MS;
  }

  function maybeAutoClear() {
    var state = getState();
    if (state.zonesSuppressed) return false;
    var anchor = state.zonesSeededAt;
    if (!anchor) return false;
    if (Date.now() - anchor >= state.intervalDays * DAY_MS) {
      performClear();
      return true;
    }
    return false;
  }

  function getZoneDefs() {
    var state = getState();
    if (state.zonesSuppressed) return [];
    return cloneJson(DEFAULT_ZONE_DEFS);
  }

  function getPhotoDrops() {
    var state = getState();
    if (state.zonesSuppressed) return [];
    return cloneJson(DEFAULT_PHOTO_DROPS);
  }

  function getSummary() {
    var state = getState();
    return {
      intervalDays: state.intervalDays,
      zonesSuppressed: state.zonesSuppressed,
      lastClearAt: state.lastClearAt,
      lastClearText: formatDateTime(state.lastClearAt),
      zonesSeededAt: state.zonesSeededAt,
      zonesSeededText: formatDateTime(state.zonesSeededAt),
      nextClearAt: getNextClearAt(state),
      nextClearText: state.zonesSuppressed ? "—" : formatDateTime(getNextClearAt(state)),
      statusText: state.zonesSuppressed ? "已清空（全景地图不显示已巡查/待巡查色块）" : "",
    };
  }

  global.MapPatrolClearSettings = {
    STORAGE_KEY: STORAGE_KEY,
    DEFAULT_ZONE_DEFS: DEFAULT_ZONE_DEFS,
    DEFAULT_PHOTO_DROPS: DEFAULT_PHOTO_DROPS,
    getState: getState,
    getSummary: getSummary,
    getZoneDefs: getZoneDefs,
    getPhotoDrops: getPhotoDrops,
    setIntervalDays: setIntervalDays,
    performClear: performClear,
    restoreDemoZones: restoreDemoZones,
    maybeAutoClear: maybeAutoClear,
    formatDateTime: formatDateTime,
  };
})(typeof window !== "undefined" ? window : this);
