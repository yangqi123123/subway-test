const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const pages = [
  ["map", "gis", "全景 GIS"],
  ["map", "situation", "态势感知"],
  ["map", "alerts", "告警信息"],
  ["map", "routes", "航线规划"],
  ["map", "flight-plan", "飞行计划"],
  ["map", "cockpit", "虚拟座舱"],
  ["patrol", "project", "项目管理"],
  ["patrol", "project-done", "完工项目"],
  ["patrol", "track-person", "人员轨迹"],
  ["patrol", "score", "巡查打分"],
  ["patrol", "quality", "统计分析"],
  ["patrol", "disease", "病害巡查"],
  ["patrol", "night", "夜班作业"],
  ["patrol", "manual", "人工巡检记录"],
  ["patrol", "uav", "无人机巡检记录"],
  ["patrol", "patrol-alerts", "告警信息"],
  ["asset", "emergency-staff", "应急人员"],
  ["asset", "emergency-warehouse", "应急仓库"],
  ["asset", "emergency-plan", "应急预案"],
  ["asset", "maintenance", "维修与检修记录"],
  ["asset", "flight-log", "飞行日志"],
  ["stats", "line-stats", "线路项目统计"],
  ["stats", "drone-ops", "无人机运行数据"],
  ["stats", "system-stats", "全时全域数据统计"],
  ["stats", "resource-monitor", "资源监控"],
  ["mine", "settings", "设置"],
  ["mine", "done", "已处理事项"],
];

const listPages = [
  ["mine", "todo", "待办", "todo"],
  ["mine", "notify", "系统通知", "notify"],
];

function tpl(module, file, title, mode, listKey) {
  const modeAttr = mode || "placeholder";
  const extra =
    modeAttr === "list"
      ? ' data-list="' + listKey + '"'
      : ' data-desc="对接后台「' + title + '」模块，当前为页面框架占位。"';
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous" />
  <link rel="stylesheet" href="../../assets/css/miniapp.css" />
</head>
<body data-miniapp="${modeAttr}" data-module="${module}" data-title="${title}" data-base="../"${extra}>
  <script src="../../assets/js/miniapp-config.js"></script>
  <script src="../../assets/js/miniapp-ui.js"></script>
</body>
</html>
`;
}

pages.forEach(function ([mod, file, title]) {
  const dir = path.join(root, mod, "pages");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, file + ".html"), tpl(mod, file, title), "utf8");
});

listPages.forEach(function ([mod, file, title, key]) {
  const dir = path.join(root, mod, "pages");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, file + ".html"), tpl(mod, file, title, "list", key), "utf8");
});

console.log("Generated", pages.length + listPages.length, "pages");
