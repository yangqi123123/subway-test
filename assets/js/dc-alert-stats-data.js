/**
 * 告警信息统计 — 与 map-alerts 示例数据对齐
 */
(function (global) {
  var SOURCE_AI = "全时全域·AI";
  var SOURCE_TRADITIONAL = "全时全域·传统";
  var SOURCE_MIXED = "全时全域·传统+AI";
  var SOURCE_UAV = "无人机";
  var SOURCE_FULLTIME = "全时全域";
  var FULLTIME_SOURCES = [SOURCE_AI, SOURCE_TRADITIONAL, SOURCE_MIXED];
  var SOURCE_ORDER = [SOURCE_AI, SOURCE_TRADITIONAL, SOURCE_MIXED, SOURCE_UAV];
  var SOURCE_COLORS = {};
  SOURCE_COLORS[SOURCE_AI] = "#22d3ee";
  SOURCE_COLORS[SOURCE_TRADITIONAL] = "#91cb74";
  SOURCE_COLORS[SOURCE_MIXED] = "#a78bfa";
  SOURCE_COLORS[SOURCE_UAV] = "#f97316";
  var STATUS_ORDER = ["未复核", "已复核"];
  var STATUS_COLORS = ["#f59e0b", "#38bdf8"];
  var RISK_ORDER = ["一般", "严重", "较重", "特别严重"];
  var RISK_COLORS = {
    一般: "#91cb74",
    严重: "#f97316",
    较重: "#f7c85a",
    特别严重: "#ef4444",
  };

  /** @type {Array<object>} */
  var ALERT_RECORDS = [
    {
      id: 205,
      projectName: "梨园站保护区无人机巡线",
      alarmArea: "中南医院站-湖北日报站",
      line: "2号线",
      station: "梨园站",
      source: SOURCE_UAV,
      workflowStatus: "未复核",
      riskLevel: "严重",
      startTime: "2026-05-13 11:22:18",
    },
    {
      id: 201,
      projectName: "金融街六中北项目",
      alarmArea: "中南医院站-湖北日报站",
      line: "2号线",
      station: "中南医院站",
      source: SOURCE_AI,
      workflowStatus: "未复核",
      riskLevel: "一般",
      startTime: "2026-03-05 08:14:49",
    },
    {
      id: 202,
      projectName: "武铁投二期基坑工程",
      alarmArea: "中南医院站-湖北日报站",
      line: "2号线",
      station: "中南医院站",
      source: SOURCE_MIXED,
      workflowStatus: "已复核",
      riskLevel: "较重",
      startTime: "2026-03-05 09:02:11",
    },
    {
      id: 203,
      projectName: "轨道交通配套施工",
      alarmArea: "中南医院站-湖北日报站",
      line: "2号线",
      station: "中南医院站",
      source: SOURCE_TRADITIONAL,
      workflowStatus: "审核通过",
      riskLevel: "较重",
      startTime: "2026-03-04 11:52:14",
    },
    {
      id: 204,
      projectName: "市政道路改造工程",
      alarmArea: "中南医院站-湖北日报站",
      line: "2号线",
      station: "中南医院站",
      source: SOURCE_MIXED,
      workflowStatus: "审核不通过",
      riskLevel: "特别严重",
      startTime: "2026-03-04 11:55:14",
    },
    {
      id: 301,
      projectName: "梨园站附属施工",
      alarmArea: "岳家嘴-梨园",
      line: "2号线",
      station: "梨园站",
      source: SOURCE_TRADITIONAL,
      workflowStatus: "未复核",
      riskLevel: "一般",
      startTime: "2026-03-05 05:55:29",
    },
    {
      id: 401,
      projectName: "长江新区涉铁施工监测",
      alarmArea: "徐家棚-汪家墩",
      line: "8号线",
      station: "汪家墩站",
      source: SOURCE_AI,
      workflowStatus: "未复核",
      riskLevel: "较重",
      startTime: "2026-05-15 09:20:00",
    },
    {
      id: 402,
      projectName: "8号线保护区基坑工程",
      alarmArea: "汪家墩-岳家嘴",
      line: "8号线",
      station: "岳家嘴站",
      source: SOURCE_MIXED,
      workflowStatus: "已复核",
      riskLevel: "一般",
      startTime: "2026-05-17 14:08:00",
    },
    {
      id: 403,
      projectName: "徐东大道市政改造",
      alarmArea: "汪家墩-岳家嘴",
      line: "8号线",
      station: "汪家墩站",
      source: SOURCE_TRADITIONAL,
      workflowStatus: "未复核",
      riskLevel: "严重",
      startTime: "2026-05-18 11:30:00",
    },
  ];

  function normalizeSource(row) {
    if (row.source) return row.source;
    if (row.handleMode === SOURCE_TRADITIONAL) return SOURCE_TRADITIONAL;
    if (row.handleMode === SOURCE_MIXED) return SOURCE_MIXED;
    return SOURCE_AI;
  }

  function normalizeWorkflowStatus(row) {
    if (row.workflowStatus === "未复核") return "未复核";
    return "已复核";
  }

  function normalizeRisk(row) {
    var level = row.riskLevel || "";
    if (RISK_ORDER.indexOf(level) >= 0) return level;
    if (level.indexOf("严重") >= 0 || level === "严重") return "严重";
    if (level.indexOf("特别") >= 0) return "特别严重";
    if (level.indexOf("一级") >= 0 || level.indexOf("二级") >= 0) return "较重";
    return "一般";
  }

  function countByOrder(alerts, keyFn, order, colors) {
    var map = {};
    alerts.forEach(function (row) {
      var k = keyFn(row);
      map[k] = (map[k] || 0) + 1;
    });
    var labels = order.slice();
    var values = order.map(function (k) {
      return map[k] || 0;
    });
    var palette = colors || order.map(function (k, i) {
      return ["#5a72c8", "#91cb74", "#f7c85a", "#f0625f"][i % 4];
    });
    return { labels: labels, values: values, colors: palette };
  }

  function calcMaxFromValues(values, stackedPerLabel) {
    var peak = 0;
    if (stackedPerLabel && stackedPerLabel.length) {
      stackedPerLabel.forEach(function (sum) {
        if (sum > peak) peak = sum;
      });
    } else {
      values.forEach(function (v) {
        if (v > peak) peak = v;
      });
    }
    if (peak <= 0) return 4;
    return Math.max(4, Math.ceil(peak / 2) * 2 + 2);
  }

  function isFulltimeSource(row) {
    var s = normalizeSource(row);
    return FULLTIME_SOURCES.indexOf(s) >= 0;
  }

  function filterFulltimeAlerts(alerts) {
    return alerts.filter(isFulltimeSource);
  }

  function formatDateInput(d) {
    var pad = function (n) {
      return n < 10 ? "0" + n : String(n);
    };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function getDefaultFilters() {
    var end = new Date();
    var start = new Date();
    start.setDate(end.getDate() - 6);
    return {
      line: "8号线",
      area: "",
      station: "",
      start: formatDateInput(start),
      end: formatDateInput(end),
    };
  }

  function filterAlerts(filters) {
    filters = filters || {};
    return ALERT_RECORDS.filter(function (row) {
      if (filters.area && filters.area !== row.alarmArea) return false;
      if (filters.line && filters.line !== row.line) return false;
      if (filters.station && filters.station !== row.station) return false;
      var day = (row.startTime || "").slice(0, 10);
      if (filters.start && day && day < filters.start) return false;
      if (filters.end && day && day > filters.end) return false;
      return true;
    });
  }

  function computeSummary(alerts) {
    return {
      total: alerts.length,
      pending: alerts.filter(function (r) {
        return normalizeWorkflowStatus(r) === "未复核";
      }).length,
      fulltime: alerts.filter(isFulltimeSource).length,
      uav: alerts.filter(function (r) {
        return normalizeSource(r) === SOURCE_UAV;
      }).length,
    };
  }

  function buildProjectChartConfig(alerts) {
    var fulltimeAlerts = filterFulltimeAlerts(alerts);
    var projects = [];
    fulltimeAlerts.forEach(function (r) {
      if (projects.indexOf(r.projectName) < 0) projects.push(r.projectName);
    });
    projects.sort();
    var values = projects.map(function (name) {
      return fulltimeAlerts.filter(function (r) {
        return r.projectName === name;
      }).length;
    });
    return {
      title: "项目告警统计图",
      sub: "",
      axisLabel: "项目名称",
      yLabel: "告警条数",
      max: calcMaxFromValues(values),
      labels: projects,
      legend: [],
      defaultBarLayout: "grouped",
      series: [
        {
          name: SOURCE_FULLTIME,
          color: "#22d3ee",
          values: values,
        },
      ],
    };
  }

  function buildChartConfigs(alerts) {
    var fulltimeAlerts = filterFulltimeAlerts(alerts);
    var total = fulltimeAlerts.length;
    var sourceAgg = countByOrder(
      fulltimeAlerts,
      normalizeSource,
      FULLTIME_SOURCES,
      FULLTIME_SOURCES.map(function (k) {
        return SOURCE_COLORS[k];
      })
    );
    var statusAgg = countByOrder(
      fulltimeAlerts,
      normalizeWorkflowStatus,
      STATUS_ORDER,
      STATUS_COLORS
    );
    var riskAgg = countByOrder(
      fulltimeAlerts,
      normalizeRisk,
      RISK_ORDER,
      RISK_ORDER.map(function (k) {
        return RISK_COLORS[k];
      })
    );

    return {
      projectAlert: buildProjectChartConfig(alerts),
      alertSource: {
        title: "告警来源统计图",
        sub: "全时全域·AI / 全时全域·传统 / 全时全域·传统+AI / 无人机 · 共" + total + "条告警",
        axisLabel: "告警来源",
        yLabel: "告警条数",
        max: calcMaxFromValues(sourceAgg.values),
        labels: sourceAgg.labels,
        legend: SOURCE_ORDER.map(function (src) {
          return { name: src, color: SOURCE_COLORS[src] };
        }),
        series: [
          {
            name: "告警条数",
            values: sourceAgg.values,
            colors: sourceAgg.colors,
          },
        ],
      },
      riskLevel: {
        title: "风险等级统计图",
        sub: "一般 / 严重 / 较重 / 特别严重 · 共" + total + "条告警",
        axisLabel: "风险等级",
        yLabel: "告警条数",
        max: calcMaxFromValues(riskAgg.values),
        labels: riskAgg.labels,
        legend: RISK_ORDER.map(function (k) {
          return { name: k, color: RISK_COLORS[k] };
        }),
        series: [
          {
            name: "告警条数",
            values: riskAgg.values,
            colors: riskAgg.colors,
          },
        ],
      },
      workflowStatus: {
        title: "处理状态统计图",
        sub: "未复核 / 已复核 · 共" + total + "条告警",
        axisLabel: "处理状态",
        yLabel: "告警条数",
        max: calcMaxFromValues(statusAgg.values),
        labels: statusAgg.labels,
        legend: STATUS_ORDER.map(function (k, i) {
          return { name: k, color: STATUS_COLORS[i] };
        }),
        series: [
          {
            name: "告警条数",
            values: statusAgg.values,
            colors: statusAgg.colors,
          },
        ],
      },
    };
  }

  function getFilterOptions() {
    var areas = [];
    var lines = [];
    var stations = [];
    ALERT_RECORDS.forEach(function (r) {
      if (r.alarmArea && areas.indexOf(r.alarmArea) < 0) areas.push(r.alarmArea);
      if (r.line && lines.indexOf(r.line) < 0) lines.push(r.line);
      if (r.station && stations.indexOf(r.station) < 0) stations.push(r.station);
    });
    areas.sort();
    lines.sort();
    stations.sort();
    return { areas: areas, lines: lines, stations: stations };
  }

  /** 示例数据日期对齐到近 7 天，避免默认筛选后图表无数据 */
  function alignDemoAlertDates() {
    var today = new Date();
    ALERT_RECORDS.forEach(function (row, index) {
      var d = new Date(today);
      d.setDate(today.getDate() - (index % 7));
      var timePart = (row.startTime || "10:00:00").slice(10).trim();
      if (!timePart) timePart = "10:00:00";
      row.startTime = formatDateInput(d) + " " + timePart;
    });
  }

  alignDemoAlertDates();

  global.DCAlertStats = {
    ALERT_RECORDS: ALERT_RECORDS,
    filterAlerts: filterAlerts,
    filterFulltimeAlerts: filterFulltimeAlerts,
    computeSummary: computeSummary,
    buildChartConfigs: buildChartConfigs,
    getFilterOptions: getFilterOptions,
    getDefaultFilters: getDefaultFilters,
    normalizeSource: normalizeSource,
    normalizeWorkflowStatus: normalizeWorkflowStatus,
    normalizeRisk: normalizeRisk,
  };
})(typeof window !== "undefined" ? window : global);
