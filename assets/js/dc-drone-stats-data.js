/**
 * 无人机数据统计 — 演示数据与纯函数（对齐 stats/dc-drone-stats.html）
 */
(function (global) {
  "use strict";

  var USAGE_RECORDS = [
    {
      id: "FL20251225001",
      device: "A区巡检机01",
      airport: "车辆段机场",
      line: "8",
      taskType: "自动执行计划",
      takeoff: "2025-12-25 10:00",
      landing: "2025-12-25 18:15",
      duration: "6分15秒",
      discovered: 2,
      maxHeight: "128.6",
      battery: "35%",
      operator: "张三",
    },
    {
      id: "FL20251224008",
      device: "青山巡检无人机",
      airport: "青山机场",
      line: "8",
      taskType: "临时任务",
      takeoff: "2025-12-24 09:12",
      landing: "2025-12-24 09:48",
      duration: "36分02秒",
      discovered: 3,
      maxHeight: "96.2",
      battery: "42%",
      operator: "李四",
    },
    {
      id: "FL20251223015",
      device: "DJI-M300E-01",
      airport: "光谷广场机场",
      line: "7",
      taskType: "自动执行计划",
      takeoff: "2025-12-23 14:20",
      landing: "2025-12-23 15:05",
      duration: "45分18秒",
      discovered: 1,
      maxHeight: "110.0",
      battery: "28%",
      operator: "王五",
    },
    {
      id: "FL20251222003",
      device: "徐家棚巡检机02",
      airport: "徐家棚机场",
      line: "8",
      taskType: "临时任务",
      takeoff: "2025-12-22 08:30",
      landing: "2025-12-22 09:02",
      duration: "32分10秒",
      discovered: 2,
      maxHeight: "88.5",
      battery: "51%",
      operator: "赵六",
    },
  ];

  var LINE_VIOLATION_DATA = {
    all: {
      monthly: [18, 22, 48, 42, 28, 86],
      pie: [
        { name: "徐家棚商业综合体项目", value: 24, color: "#38bdf8" },
        { name: "小洪山地下商业项目", value: 19, color: "#22d3ee" },
        { name: "八一路102号水表改迁", value: 16, color: "#2dd4bf" },
        { name: "华中科技大学创新楼项目", value: 14, color: "#67e8f9" },
        { name: "航空室内柜建设项目", value: 11, color: "#f0b93f" },
        { name: "万源广场停车场充电桩项目", value: 8, color: "#a78bfa" },
      ],
    },
    "8": {
      monthly: [20, 25, 50, 45, 30, 100],
      pie: [
        { name: "徐家棚商业综合体项目", value: 32, color: "#38bdf8" },
        { name: "小洪山地下商业项目", value: 26, color: "#22d3ee" },
        { name: "八一路102号水表改迁", value: 18, color: "#2dd4bf" },
        { name: "小洪山数据产业园外联工程", value: 12, color: "#67e8f9" },
        { name: "武汉惠丽甲第", value: 8, color: "#f0b93f" },
        { name: "其他项目", value: 4, color: "#94a3b8" },
      ],
    },
    "7": {
      monthly: [12, 18, 32, 28, 22, 58],
      pie: [
        { name: "航空室内柜建设项目", value: 22, color: "#38bdf8" },
        { name: "洪山街板桥村农用地恢复项目", value: 15, color: "#22d3ee" },
        { name: "经开2136G-Q12地块建设工程", value: 12, color: "#2dd4bf" },
        { name: "水森活项目中心地勘", value: 6, color: "#67e8f9" },
        { name: "其他项目", value: 3, color: "#94a3b8" },
      ],
    },
    "19": {
      monthly: [8, 14, 22, 18, 12, 36],
      pie: [
        { name: "花山河保护区外部管廊项目", value: 28, color: "#38bdf8" },
        { name: "沿线市政迁改项目", value: 6, color: "#22d3ee" },
        { name: "其他项目", value: 2, color: "#94a3b8" },
      ],
    },
  };

  function formatDateInput(d) {
    var pad = function (n) {
      return n < 10 ? "0" + n : String(n);
    };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function getDefaultDateRange() {
    var end = new Date();
    var start = new Date();
    start.setDate(end.getDate() - 6);
    return { start: formatDateInput(start), end: formatDateInput(end) };
  }

  function alignUsageRecordDates(records) {
    var today = new Date();
    records.forEach(function (row, index) {
      var d = new Date(today);
      d.setDate(today.getDate() - index);
      var timePart = (row.takeoff || "10:00").slice(11).trim() || "10:00";
      row.takeoff = formatDateInput(d) + " " + timePart;
      var landTime = (row.landing || "11:00").slice(11).trim() || "11:00";
      row.landing = formatDateInput(d) + " " + landTime;
    });
  }

  function parseDurationSeconds(text) {
    var str = String(text || "");
    var hourMatch = str.match(/(\d+)小时/);
    var minMatch = str.match(/(\d+)分/);
    var secMatch = str.match(/(\d+)秒/);
    var hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    var mins = minMatch ? parseInt(minMatch[1], 10) : 0;
    var secs = secMatch ? parseInt(secMatch[1], 10) : 0;
    return hours * 3600 + mins * 60 + secs;
  }

  function formatFlightHours(totalSeconds) {
    var hours = totalSeconds / 3600;
    if (hours >= 1) return hours.toFixed(1) + "h";
    var mins = Math.round(totalSeconds / 60);
    return mins + "min";
  }

  function getLineData(lineKey) {
    return LINE_VIOLATION_DATA[lineKey] || LINE_VIOLATION_DATA.all;
  }

  function getMonthUsageRecords(records, lineKey) {
    var now = new Date();
    var month = now.getMonth() + 1;
    var monthPrefix = now.getFullYear() + "-" + (month < 10 ? "0" + month : String(month));
    return records.filter(function (row) {
      if (lineKey !== "all" && row.line !== lineKey) return false;
      return (row.takeoff || "").slice(0, 7) === monthPrefix;
    });
  }

  function filterUsageRecords(records, filters) {
    filters = filters || {};
    var airport = filters.airport || "";
    var device = filters.device || "";
    var line = filters.line || "";
    var start = filters.start || "";
    var end = filters.end || "";
    var keyword = (filters.keyword || "").trim();

    return records.filter(function (row) {
      if (airport && row.airport !== airport) return false;
      if (device && row.device !== device) return false;
      if (line && row.line !== line) return false;
      var day = (row.takeoff || "").slice(0, 10);
      if (start && day && day < start) return false;
      if (end && day && day > end) return false;
      if (keyword) {
        var hit = [row.id, row.device, row.operator].some(function (text) {
          return String(text || "").indexOf(keyword) >= 0;
        });
        if (!hit) return false;
      }
      return true;
    });
  }

  function computeSummary(records, lineKey) {
    lineKey = lineKey || "all";
    var monthFlights = getMonthUsageRecords(records, lineKey);
    var flightCount = monthFlights.length;
    var totalDiscovered = monthFlights.reduce(function (sum, row) {
      return sum + (row.discovered || 0);
    }, 0);
    var totalSeconds = monthFlights.reduce(function (sum, row) {
      return sum + parseDurationSeconds(row.duration);
    }, 0);
    var avgPerFlight = flightCount ? totalDiscovered / flightCount : 0;
    return {
      violations: totalDiscovered,
      avgDiscovered: flightCount ? Math.round(avgPerFlight) : 0,
      flightCount: flightCount,
      flightHours: formatFlightHours(totalSeconds),
    };
  }

  alignUsageRecordDates(USAGE_RECORDS);

  global.DCDroneStats = {
    USAGE_RECORDS: USAGE_RECORDS,
    LINE_VIOLATION_DATA: LINE_VIOLATION_DATA,
    getDefaultDateRange: getDefaultDateRange,
    getLineData: getLineData,
    getMonthUsageRecords: getMonthUsageRecords,
    filterUsageRecords: filterUsageRecords,
    computeSummary: computeSummary,
    parseDurationSeconds: parseDurationSeconds,
    formatFlightHours: formatFlightHours,
  };
})(typeof window !== "undefined" ? window : global);
