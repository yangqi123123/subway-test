/**
 * 无人机巡查记录 — 演示数据（与 patrol/in-uav-report.html 一致）
 */
(function (global) {
  global.WH_UAV_ROWS = [
    {
      taskId: "FL20251225001",
      planId: 1,
      line: "8号线",
      section: "徐东~梨园",
      projectName: "项目1、项目2、项目3",
      projectNames: ["项目1", "项目2", "项目3"],
      deviceName: "车辆段无人机 M350",
      taskType: "自动执行计划/临时任务",
      planName: "8号线车辆段常规巡检",
      route: "车辆段日常巡查航线",
      airport: "车辆段机场",
      takeoff: "2025-12-25 10:00",
      landing: "2025-12-25 18:15",
      operator: "张三",
      alarmCount: 2,
    },
    {
      taskId: "FL20251224008",
      planId: 4,
      line: "5号线",
      section: "青山站—工业四路",
      projectName: "青山站保护区巡查",
      deviceName: "青山巡检无人机 M350",
      taskType: "常规巡检",
      planName: "青山站周期巡检",
      route: "青山站周期巡检航线",
      airport: "青山机场",
      takeoff: "2025-12-24 09:02",
      landing: "2025-12-24 09:38",
      operator: "赵六",
      alarmCount: 1,
    },
  ];
})(typeof window !== "undefined" ? window : global);
