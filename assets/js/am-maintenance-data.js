/**
 * 维修与检修记录 — 演示数据（与 wb/am-maintenance.html 一致）
 */
(function (global) {
  global.WH_MAINTENANCE_SAMPLE_PHOTOS = [
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=520&q=80",
    "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=520&q=80",
  ];
  global.WH_MAINTENANCE_SAMPLE_VIDEO_URL = "https://www.w3schools.com/html/mov_bbb.mp4";

  global.WH_MAINTENANCE_DEVICE_CATALOG = [
    { type: "drone", label: "UAV-MR-001 / 8号线车辆段无人机" },
    { type: "drone", label: "UAV-MR-002 / 梨园巡检无人机" },
    { type: "drone", label: "UAV-MR-004 / 长江新区无人机" },
    { type: "drone", label: "UAV-MR-005 / 青山巡检无人机" },
    { type: "airport", label: "AP-MR-001 / 8号线车辆段机场" },
    { type: "airport", label: "AP-MR-002 / 青山机场" },
    { type: "airport", label: "AP-MR-003 / 长江新区机场" },
  ];

  global.WH_MAINTENANCE_DEVICE_TYPE_LABEL = { drone: "无人机", airport: "机场" };

  global.WH_MAINTENANCE_ROWS = [
    {
      id: "WX20251119001",
      deviceType: "drone",
      device: "UAV-MR-001 / 8号线车辆段无人机",
      type: "故障处理",
      summary: "云台自检异常，完成返厂检测并重新校准。",
      parts: "云台减震球",
      owner: "张工",
      start: "2025-11-19 11:12:45",
      end: "2025-11-27 17:30:00",
      status: "已完成",
      docs: [{ name: "云台检测报告.pdf" }, { name: "返厂校准记录.xlsx" }],
      photos: global.WH_MAINTENANCE_SAMPLE_PHOTOS,
      videos: [{ name: "维修过程记录.mp4", url: global.WH_MAINTENANCE_SAMPLE_VIDEO_URL }],
    },
    {
      id: "WX20251119002",
      deviceType: "drone",
      device: "UAV-MR-002 / 梨园巡检无人机",
      type: "定期检修",
      summary: "完成电池循环检测、固件升级与机身外观检查。",
      parts: "桨叶组件",
      owner: "王晨",
      start: "2025-11-19 11:12:45",
      end: "",
      status: "进行中",
      docs: [{ name: "电池循环检测表.pdf" }],
      photos: [global.WH_MAINTENANCE_SAMPLE_PHOTOS[0]],
      videos: [],
    },
  ];
})(window);
