/**
 * 全局菜单与侧栏结构 — 与《武汉地铁保护区管理平台 - 原型需求文档》一致。
 * 新增页面：在此补一条 { key, href, label, parent? }，并在对应 HTML 的 data-sidebar-key 声明相同 key。
 */
(function (global) {
  var TOP_NAV = [
    { id: "map", label: "全景地图", href: "map-gis.html" },
    { id: "dc", label: "数据中心", href: "dc-library.html" },
    { id: "am", label: "资产管理", href: "am-line.html" },
    { id: "in", label: "智慧巡检", href: "in-disease.html" },
    { id: "wb", label: "我的工作台", href: "wb-todo.html" },
    { id: "ai", label: "AI 识别", href: "ai.html" },
  ];

  /**
   * 侧栏分组：type = 'item' | 'group'
   * group.children 为叶子菜单
   */
  var SIDEBAR = {
    dc: [
      { type: "item", key: "dc-library", label: "资料库", href: "dc-library.html" },
      {
        type: "item",
        key: "dc-line-stats",
        label: "线路项目统计",
        href: "dc-line-stats.html",
      },
      {
        type: "item",
        key: "dc-drone-stats",
        label: "无人机运行数据统计",
        href: "dc-drone-stats.html",
      },
      {
        type: "item",
        key: "dc-system-stats",
        label: "全时全域系统数据统计",
        href: "dc-system-stats.html",
      },
    ],
    am: [
      {
        type: "group",
        key: "am-net",
        label: "地铁路网管理",
        children: [
          { key: "am-line", label: "线路管理", href: "am-line.html" },
          { key: "am-station", label: "站点管理", href: "am-station.html" },
          { key: "am-section", label: "区间管理", href: "am-section.html" },
        ],
      },
      {
        type: "group",
        key: "am-em",
        label: "应急管理",
        children: [
          { key: "am-emergency-staff", label: "应急人员", href: "am-emergency-staff.html" },
          {
            key: "am-emergency-warehouse",
            label: "应急仓库列表",
            href: "am-emergency-warehouse.html",
          },
          {
            key: "am-emergency-material",
            label: "应急物资",
            href: "am-emergency-material.html",
          },
          { key: "am-emergency-plan", label: "应急预案", href: "am-emergency-plan.html" },
        ],
      },
      {
        type: "group",
        key: "am-uav",
        label: "无人机设备管理",
        children: [
          { key: "am-airport", label: "机场设备管理", href: "am-airport.html" },
          { key: "am-drone", label: "无人机设备管理", href: "am-drone.html" },
          {
            key: "am-maintenance",
            label: "维护与检修记录",
            href: "am-maintenance.html",
          },
          { key: "am-flight-log", label: "飞行日志管理", href: "am-flight-log.html" },
        ],
      },
      {
        type: "group",
        key: "am-ops",
        label: "运行维护",
        children: [
          {
            key: "am-ops-metro",
            label: "地铁信息系统运行管理",
            href: "am-ops-metro.html",
          },
          {
            key: "am-ops-fulltime",
            label: "全时全域运行管理",
            href: "am-ops-fulltime.html",
          },
          {
            key: "am-ops-uav",
            label: "无人机系统运行管理",
            href: "am-ops-uav.html",
          },
        ],
      },
    ],
    in: [
      {
        type: "group",
        key: "in-rec",
        label: "巡检记录",
        children: [
          { key: "in-disease", label: "病害巡查", href: "in-disease.html" },
          { key: "in-night", label: "夜班作业", href: "in-night.html" },
          {
            key: "in-uav-report",
            label: "无人机巡查报告",
            href: "in-uav-report.html",
          },
          { key: "in-manual", label: "人工巡查记录", href: "in-manual.html" },
        ],
      },
      {
        type: "group",
        key: "in-proj",
        label: "保护区项目",
        children: [
          { key: "in-project", label: "项目管理", href: "in-project.html" },
          { key: "in-project-done", label: "完工项目", href: "in-project-done.html" },
          {
            key: "in-project-patrol",
            label: "项目巡查",
            href: "in-project-patrol.html",
          },
        ],
      },
      {
        type: "group",
        key: "in-quality",
        label: "巡检质量",
        children: [
          {
            key: "in-track-person",
            label: "人员轨迹",
            href: "in-track-person.html",
          },
          { key: "in-track-drone", label: "无人机轨迹", href: "in-track-drone.html" },
          {
            key: "in-quality-stats",
            label: "统计分析",
            href: "in-quality-stats.html",
          },
          { key: "in-score", label: "巡查打分", href: "in-score.html" },
        ],
      },
    ],
    wb: [
      {
        type: "group",
        key: "wb-sys",
        label: "系统管理",
        children: [
          { key: "wb-role", label: "角色管理", href: "wb-role.html" },
          { key: "wb-user", label: "用户管理", href: "wb-user.html" },
          { key: "wb-dept", label: "部门管理", href: "wb-dept.html" },
          { key: "wb-post", label: "岗位管理", href: "wb-post.html" },
          { key: "wb-menu", label: "菜单管理", href: "wb-menu.html" },
          { key: "wb-dict", label: "字典管理", href: "wb-dict.html" },
          { key: "wb-log", label: "日志管理", href: "wb-log.html" },
          { key: "wb-param", label: "参数设置", href: "wb-param.html" },
          { key: "wb-notice", label: "通知公告", href: "wb-notice.html" },
        ],
      },
      { type: "item", key: "wb-todo", label: "待办", href: "wb-todo.html" },
      {
        type: "item",
        key: "wb-sys-notify",
        label: "系统通知",
        href: "wb-sys-notify.html",
      },
      { type: "item", key: "wb-done", label: "已处理事项", href: "wb-done.html" },
      {
        type: "group",
        key: "wb-wf",
        label: "工作流",
        children: [
          {
            key: "wb-wf-category",
            label: "流程分类",
            href: "wb-wf-category.html",
          },
          { key: "wb-wf-design", label: "流程设计", href: "wb-wf-design.html" },
        ],
      },
      { type: "item", key: "wb-profile", label: "个人资料", href: "wb-profile.html" },
    ],
  };

  function findGroupContainingKey(topId, leafKey) {
    var tree = SIDEBAR[topId];
    if (!tree) return null;
    for (var i = 0; i < tree.length; i++) {
      var n = tree[i];
      if (n.type === "item" && n.key === leafKey) return n.key;
      if (n.type === "group" && n.children) {
        for (var j = 0; j < n.children.length; j++) {
          if (n.children[j].key === leafKey) return n.key;
        }
      }
    }
    return null;
  }

  global.WHMetroMenu = {
    TOP_NAV: TOP_NAV,
    SIDEBAR: SIDEBAR,
    findGroupContainingKey: findGroupContainingKey,
  };
})(typeof window !== "undefined" ? window : this);
