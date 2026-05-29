/**
 * 告警信息统计 — 与 map-alerts 示例数据对齐
 */
(function (global) {
  var SOURCE_ORDER = ["AI", "传统", "AI+传统", "无人机"];
  var SOURCE_COLORS = {
    AI: "#22d3ee",
    传统: "#91cb74",
    "AI+传统": "#a78bfa",
    无人机: "#f97316",
  };
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
      source: "无人机",
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
      source: "AI",
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
      source: "AI+传统",
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
      source: "传统",
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
      source: "AI+传统",
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
      source: "传统",
      workflowStatus: "未复核",
      riskLevel: "一般",
      startTime: "2026-03-05 05:55:29",
    },
  ];

  function normalizeSource(row) {
    if (row.source) return row.source;
    if (row.handleMode === "传统") return "传统";
    if (row.handleMode === "AI+传统") return "AI+传统";
    return "AI";
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
    return s === "AI" || s === "传统" || s === "AI+传统";
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
        return normalizeSource(r) === "无人机";
      }).length,
    };
  }

  function buildProjectChartConfig(alerts) {
    var projects = [];
    alerts.forEach(function (r) {
      if (projects.indexOf(r.projectName) < 0) projects.push(r.projectName);
    });
    projects.sort();
    var series = SOURCE_ORDER.map(function (src) {
      return {
        name: src,
        color: SOURCE_COLORS[src],
        values: projects.map(function (name) {
          return alerts.filter(function (r) {
            return r.projectName === name && normalizeSource(r) === src;
          }).length;
        }),
      };
    });
    var stackSums = projects.map(function (_, i) {
      var sum = 0;
      series.forEach(function (s) {
        sum += s.values[i] || 0;
      });
      return sum;
    });
    var subParts = SOURCE_ORDER.map(function (src) {
      var n = alerts.filter(function (r) {
        return normalizeSource(r) === src;
      }).length;
      return src + " " + n + "条";
    });
    return {
      title: "项目告警统计图",
      sub: subParts.join(" · ") + " · 共" + alerts.length + "条告警",
      axisLabel: "项目名称",
      yLabel: "告警条数",
      max: calcMaxFromValues([], stackSums),
      labels: projects,
      legend: SOURCE_ORDER.map(function (src) {
        return { name: src, color: SOURCE_COLORS[src] };
      }),
      defaultBarLayout: "stacked",
      series: series,
    };
  }

  function buildChartConfigs(alerts) {
    var total = alerts.length;
    var sourceAgg = countByOrder(
      alerts,
      normalizeSource,
      SOURCE_ORDER,
      SOURCE_ORDER.map(function (k) {
        return SOURCE_COLORS[k];
      })
    );
    var statusAgg = countByOrder(
      alerts,
      normalizeWorkflowStatus,
      STATUS_ORDER,
      STATUS_COLORS
    );
    var riskAgg = countByOrder(
      alerts,
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
        sub: "AI / 传统 / AI+传统 / 无人机 · 共" + total + "条告警",
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

  global.DCAlertStats = {
    ALERT_RECORDS: ALERT_RECORDS,
    filterAlerts: filterAlerts,
    computeSummary: computeSummary,
    buildChartConfigs: buildChartConfigs,
    getFilterOptions: getFilterOptions,
    normalizeSource: normalizeSource,
    normalizeWorkflowStatus: normalizeWorkflowStatus,
    normalizeRisk: normalizeRisk,
  };
})(typeof window !== "undefined" ? window : global);
