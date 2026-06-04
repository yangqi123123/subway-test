/**
 * 线路项目统计 — 演示数据（与 stats/dc-line-stats.html 一致）
 */
(function (global) {
  global.WH_LINE_STATS_SUMMARY = {
    line: 12,
    station: 317,
    section: 618,
    project: 680,
  };

  global.WH_LINE_CHART_BASE = {
    title: "线路项目统计图",
    sub: "一般项目456个，重点项目224个",
    axisLabel: "线路",
    yLabel: "项目数量",
    max: 180,
    labels: ["1号线", "2号线", "3号线", "4号线", "5号线", "6号线", "7号线", "8号线", "11号线", "16号线", "19号线", "阳逻线"],
    series: [
      {
        name: "一般项目",
        values: [11, 58, 13, 49, 20, 75, 132, 24, 20, 23, 12, 19],
        colorStart: "#2dd4bf",
        colorEnd: "#0ea5e9",
      },
      {
        name: "重点项目",
        values: [8, 48, 16, 31, 19, 21, 22, 12, 21, 11, 4, 11],
        color: "#f97316",
      },
    ],
  };

  global.WH_LINE_CHART_CONFIGS = {
    projectType: {
      title: "项目类型图",
      sub: "总计701个项目",
      axisLabel: "工程类别",
      yLabel: "项目数量",
      max: 150,
      labels: [
        "施工项目",
        "轨土保护区",
        "地铁保护工程",
        "委外项目",
        "桥梁工程",
        "涉铁工程",
        "泵站",
        "检修工程",
        "监测工程",
        "临铁施工工程",
        "拆除项目",
        "围栏封闭&机电工程",
        "桥改、扩建",
        "道路（跨）穿轨道路",
        "占用道路工程",
        "零散劳务、站厅工程",
        "采空沉降工程",
      ],
      series: [
        {
          name: "项目数量",
          values: [61, 41, 59, 83, 14, 148, 115, 12, 23, 13, 22, 24, 27, 31, 8, 18, 2],
          colors: [
            "#5a72c8",
            "#91cb74",
            "#f7c85a",
            "#f0625f",
            "#78c6df",
            "#44aa77",
            "#ff874d",
            "#a56cc1",
            "#d36cc2",
            "#f0b93f",
            "#ff7a59",
            "#61a4b7",
            "#cd7b58",
            "#c9332e",
            "#3d566e",
            "#5870c4",
            "#8bc47c",
          ],
        },
      ],
    },
    safety: {
      title: "安全协议图",
      sub: "总计701个项目",
      axisLabel: "签订状态",
      yLabel: "项目数量",
      max: 400,
      labels: ["签订协议", "未签订协议"],
      series: [{ name: "项目数量", values: [303, 398], colors: ["#5a72c8", "#91cb74"] }],
    },
    daily: {
      title: "日巡查统计图",
      sub: "总计43次巡查记录",
      axisLabel: "项目类型",
      yLabel: "巡查数量",
      max: 30,
      defaultBarLayout: "stacked",
      labels: ["一般项目", "重点项目"],
      legend: [
        { name: "无人机巡查", color: "#5a72c8" },
        { name: "人工巡查", color: "#91cb74" },
      ],
      series: [
        { name: "无人机巡查", values: [18, 10], color: "#5a72c8" },
        { name: "人工巡查", values: [8, 7], color: "#91cb74" },
      ],
    },
    weekly: {
      title: "周巡查统计图",
      sub: "总计462次巡查记录",
      axisLabel: "项目类型",
      yLabel: "巡查数量",
      max: 250,
      defaultBarLayout: "stacked",
      labels: ["一般项目", "重点项目"],
      legend: [
        { name: "无人机巡查", color: "#5a72c8" },
        { name: "人工巡查", color: "#91cb74" },
      ],
      series: [
        { name: "无人机巡查", values: [140, 152], color: "#5a72c8" },
        { name: "人工巡查", values: [86, 84], color: "#91cb74" },
      ],
    },
    risk: {
      title: "项目风险评估等级图",
      sub: "总计701个项目",
      axisLabel: "风险等级",
      yLabel: "项目数量",
      max: 600,
      labels: ["一级", "二级", "三级", "四级", "特级", "无"],
      series: [
        {
          name: "项目数量",
          values: [31, 18, 28, 7, 66, 551],
          colors: ["#5a72c8", "#8bc47c", "#f7c85a", "#f0625f", "#6bb2cf", "#44aa77"],
        },
      ],
    },
    techReply: {
      title: "技术回函图",
      sub: "总计701个项目",
      axisLabel: "回函类型",
      yLabel: "项目数量",
      max: 400,
      labels: ["OA流转回复意见", "书面回函"],
      series: [{ name: "项目数量", values: [412, 289], colors: ["#5a72c8", "#91cb74"] }],
    },
  };

  global.WH_LINE_STATS_TABS = [
    { key: "lineProject", label: "线路项目统计" },
    { key: "projectType", label: "项目类型" },
    { key: "safety", label: "安全协议" },
    { key: "daily", label: "当日巡查" },
    { key: "weekly", label: "当周巡查" },
    { key: "risk", label: "项目风险评估" },
    { key: "techReply", label: "技术回函" },
  ];
})(window);
