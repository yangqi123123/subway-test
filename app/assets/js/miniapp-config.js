/**
 * 小程序原型菜单与页面配置
 */
(function (global) {
  var MODULES = {
    map: {
      id: "map",
      label: "全景地图",
      menus: [],
    },
    patrol: {
      id: "patrol",
      label: "巡查",
      hero: {
        title: "智慧巡检",
        desc: "项目、质量、巡查记录",
        image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
      },
      menuGroups: [
        {
          title: "保护区项目",
          items: [
            { label: "项目管理", icon: "fa-folder-tree", tone: "blue", href: "pages/project.html" },
            { label: "完工项目", icon: "fa-circle-check", tone: "green", href: "pages/project-done.html" },
          ],
        },
        {
          title: "巡查质量",
          items: [
            { label: "人员轨迹", icon: "fa-location-dot", tone: "cyan", href: "pages/track-person.html" },
            { label: "巡查打分", icon: "fa-star", tone: "amber", href: "pages/score.html" },
            { label: "统计分析", icon: "fa-chart-line", tone: "blue", href: "pages/quality.html" },
          ],
        },
        {
          title: "巡查记录",
          items: [
            { label: "病害巡查", icon: "fa-stethoscope", tone: "blue", href: "pages/disease.html" },
            { label: "夜班作业", icon: "fa-moon", tone: "cyan", href: "pages/night.html" },
            { label: "人工巡查记录", icon: "fa-person-walking", tone: "green", href: "pages/manual.html" },
            { label: "无人机巡查记录", icon: "fa-helicopter", tone: "blue", href: "pages/uav.html" },
          ],
        },
        {
          title: "全时全域感知",
          items: [
            { label: "告警信息", icon: "fa-bell", tone: "amber", href: "pages/patrol-alerts.html" },
          ],
        },
        {
          title: "数据统计",
          items: [
            { label: "线路项目统计", icon: "fa-chart-column", tone: "blue", href: "../stats/pages/line-stats.html" },
            { label: "无人机数据统计", icon: "fa-helicopter", tone: "cyan", href: "../stats/pages/drone-ops.html" },
            { label: "全时全域数据统计", icon: "fa-chart-pie", tone: "green", href: "../stats/pages/system-stats.html" },
            { label: "知识库", icon: "fa-book-open", tone: "amber", href: "../stats/pages/library.html" },
          ],
        },
      ],
    },
    asset: {
      id: "asset",
      label: "资产",
      hero: {
        title: "资产管理",
        desc: "应急、无人机设备",
        image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80",
      },
      menuGroups: [
        {
          title: "应急管理",
          items: [
            { label: "应急人员", icon: "fa-user-group", tone: "blue", href: "pages/emergency-staff.html" },
            { label: "应急仓库", icon: "fa-warehouse", tone: "cyan", href: "pages/emergency-warehouse.html" },
            { label: "应急预案", icon: "fa-shield-halved", tone: "green", href: "pages/emergency-plan.html" },
          ],
        },
        {
          title: "无人机设备管理",
          items: [
            { label: "维修与检修记录", icon: "fa-screwdriver-wrench", tone: "amber", href: "pages/maintenance.html" },
            { label: "飞行日志", icon: "fa-book", tone: "blue", href: "pages/flight-log.html" },
          ],
        },
        {
          title: "服务器设备管理",
          items: [
            { label: "资源监控", icon: "fa-gauge-high", tone: "amber", href: "../stats/pages/resource-monitor.html" },
          ],
        },
      ],
    },
    stats: {
      id: "stats",
      label: "数据统计",
      hero: {
        title: "数据统计",
        desc: "统计入口已归入巡检菜单",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      },
      menus: [],
    },
    mine: {
      id: "mine",
      label: "我的",
      hubType: "mine",
      profile: {
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
        name: "张三",
        nickname: "张三",
        account: "zhangsan",
        email: "zhangsan@whmetro.com",
        phone: "13800138000",
        gender: "男",
        dept: "保护区运管部",
        pilotCert: "",
      },
      cells: [
        { label: "待办", icon: "fa-list-check", href: "pages/todo.html", list: "todo" },
        { label: "系统通知", icon: "fa-bell", href: "pages/notify.html", list: "notify" },
        { label: "已处理事项", icon: "fa-circle-check", href: "pages/done.html" },
        { label: "设置", icon: "fa-gear", href: "pages/settings.html" },
      ],
      logoutHref: "app-login.html",
    },
  };

  var TAB_ITEMS = [
    { id: "map", label: "全景地图", icon: "fa-map", home: "map/pages/gis.html" },
    { id: "patrol", label: "巡查", icon: "fa-clipboard-check", home: "patrol/home.html" },
    { id: "asset", label: "资产", icon: "fa-cubes", home: "asset/home.html" },
    { id: "stats", label: "数据统计", icon: "fa-chart-simple", home: "stats/home.html" },
    { id: "mine", label: "我的", icon: "fa-user", home: "mine/home.html" },
  ];

  var TAB_ROOT_HOMES = TAB_ITEMS.map(function (item) {
    return item.home;
  }).concat(["patrol/pages/today-task.html"]);

  function normalizePathname(path) {
    return String(path || "")
      .replace(/\\/g, "/")
      .split("?")[0]
      .replace(/\/+$/, "");
  }

  function pathMatchesTabHome(path, home) {
    path = normalizePathname(path);
    home = String(home || "").replace(/\\/g, "/");
    if (path.indexOf(home) >= 0) return true;
    var noExt = home.replace(/\.html$/i, "");
    return noExt !== home && path.indexOf(noExt) >= 0;
  }

  function isTabbarRootPath(path) {
    return TAB_ROOT_HOMES.some(function (home) {
      return pathMatchesTabHome(path, home);
    });
  }

  global.MiniAppConfig = {
    MODULES: MODULES,
    TAB_ITEMS: TAB_ITEMS,
    TAB_ROOT_HOMES: TAB_ROOT_HOMES,
    isTabbarRootPath: isTabbarRootPath,
  };
})(window);
