/**
 * 夜班作业 — 演示数据（与 patrol/in-night.html 一致）
 */
(function (global) {
  global.WH_NIGHT_NEXT_ID = 4628;

  global.WH_NIGHT_ROWS = [
    {
      id: "4627",
      time: "2026-03-05 17:34",
      line: "5号线",
      direction: "上行",
      section: "白沙六路-光霞",
      station: "",
      place: "白沙六路-光霞 / 上行",
      desc: "白沙六路至光霞区间夜间施工巡查，重点核查围挡、动火和人员管控。",
      company: "地铁集团",
      specialType: "动火作业",
      user: "杨俊杰",
      updatedAt: "2026-03-05 17:22",
      logs: [{ action: "新增夜班作业", user: "鲍雄澎", time: "2026-05-12 14:40:31" }],
    },
    {
      id: "4626",
      time: "2026-03-05 11:16",
      line: "2号线",
      direction: "下行",
      section: "盘龙城-宏图大道",
      station: "",
      place: "盘龙城-宏图大道 / 下行",
      desc: "盘龙城至宏图大道区间夜间作业复核，已完成照明和围挡检查。",
      company: "城建单位",
      specialType: "",
      user: "董治昊",
      updatedAt: "2026-03-05 11:04",
      logs: [{ action: "新增夜班作业", user: "鲍雄澎", time: "2026-05-12 14:40:31" }],
    },
    {
      id: "4625",
      time: "2026-03-05 11:10",
      line: "2号线",
      direction: "下行",
      section: "",
      station: "天河停车场",
      place: "天河停车场 / 场段",
      desc: "夜间进场实名制检查，核对人员名单和特种作业证件。",
      company: "施工总包",
      specialType: "有限空间作业",
      user: "董治昊",
      updatedAt: "2026-03-05 10:58",
      logs: [{ action: "新增夜班作业", user: "鲍雄澎", time: "2026-05-12 14:40:31" }],
    },
  ];
})(typeof window !== "undefined" ? window : global);
