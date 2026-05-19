/**
 * 全局菜单 — 顶部一级 + 侧栏 / 工作台超级卡片（与 shell.js 同步）。
 * 新增页面：补 TOP_NAV 下拉项或 WB_MEGA 叶子，并在 HTML 的 data-top / data-sidebar-key 与之一致。
 */
(function (global) {
  /** @type {Array<{id:string,label:string,href?:string,kind?:string,items?:Array<{label:string,href:string}>}>} */
  var TOP_NAV = [
    { id: "map", label: "全景地图", kind: "link", href: "map-gis.html" },
    { id: "cockpit", label: "虚拟座舱", kind: "link", href: "map-cockpit-prep.html" },
    {
      id: "patrol",
      label: "巡查记录",
      kind: "dropdown",
      items: [
        { label: "病害巡查", href: "in-disease.html" },
        { label: "夜班作业", href: "in-night.html" },
        { label: "无人机巡查报告", href: "in-uav-report.html" },
        { label: "人工巡查报告", href: "in-manual.html" },
      ],
    },
    { id: "ai", label: "AI识别", kind: "link", href: "ai.html" },
    {
      id: "st",
      label: "数据统计",
      kind: "dropdown",
      items: [
        { label: "线路项目统计", href: "dc-line-stats.html" },
        { label: "全时全域数据统计报表", href: "dc-system-stats.html" },
      ],
    },
    { id: "wb", label: "我的工作台", kind: "link", href: "wb-hub.html" },
  ];

  /**
   * 侧栏：type = 'item' | 'group'
   * 我的工作台使用 WB_MEGA（超级卡片），此处不放 wb 键。
   */
  var SIDEBAR = {
    patrol: [
      { type: "item", key: "in-disease", label: "病害巡查", href: "in-disease.html" },
      { type: "item", key: "in-night", label: "夜班作业", href: "in-night.html" },
      {
        type: "group",
        key: "patrol-reports",
        label: "巡查报告",
        children: [
          { key: "in-uav-report", label: "无人机巡查报告", href: "in-uav-report.html" },
          { key: "in-manual", label: "人工巡查报告", href: "in-manual.html" },
        ],
      },
    ],
    st: [
      { type: "item", key: "dc-line-stats", label: "线路项目统计", href: "dc-line-stats.html" },
      {
        type: "item",
        key: "dc-system-stats",
        label: "全时全域数据统计报表",
        href: "dc-system-stats.html",
      },
    ],
  };

  /**
   * 工作台超级卡片：card.blocks[] 每项为 { subtitle?: string, items: {key,label,href}[] }
   */
  var WB_MEGA = [
    {
      key: "wb-card-personal",
      title: "个人中心",
      icon: "fa-regular fa-user",
      tone: "amber",
      blocks: [
        {
          items: [
            { key: "wb-todo", label: "待办", href: "wb-todo.html" },
            { key: "wb-sys-notify", label: "系统通知", href: "wb-sys-notify.html" },
            { key: "wb-done", label: "已处理事项", href: "wb-done.html" },
          ],
        },
        {
          items: [{ key: "map-routes", label: "航线管理", href: "map-routes.html" }],
        },
      ],
    },
    {
      key: "wb-card-inspection",
      title: "智慧巡检",
      icon: "fa-solid fa-route",
      tone: "lime",
      blocks: [
        {
          subtitle: "保护区项目",
          items: [
            { key: "in-project", label: "项目管理", href: "in-project.html" },
            { key: "in-project-done", label: "完工项目", href: "in-project-done.html" },
          ],
        },
        {
          subtitle: "巡查质量",
          items: [
            { key: "in-track-person", label: "人员轨迹", href: "in-track-person.html" },
            { key: "in-quality-stats", label: "统计分析", href: "in-quality-stats.html" },
            { key: "in-score", label: "巡查打分", href: "in-score.html" },
          ],
        },
      ],
    },
    {
      key: "wb-card-asset",
      title: "资产管理",
      icon: "fa-solid fa-train-subway",
      tone: "cyan",
      blocks: [
        {
          subtitle: "地铁路网管理",
          items: [
            { key: "am-line", label: "线路管理", href: "am-line.html" },
            { key: "am-station", label: "站点管理", href: "am-station.html" },
            { key: "am-section", label: "区间管理", href: "am-section.html" },
          ],
        },
        {
          subtitle: "应急管理",
          items: [
            { key: "am-emergency-staff", label: "应急人员", href: "am-emergency-staff.html" },
            { key: "am-emergency-warehouse", label: "应急仓库", href: "am-emergency-warehouse.html" },
            { key: "am-emergency-plan", label: "应急预案", href: "am-emergency-plan.html" },
          ],
        },
        {
          subtitle: "无人机设备管理",
          items: [
            { key: "am-airport", label: "机场设备管理", href: "am-airport.html" },
            { key: "am-drone", label: "无人机设备管理", href: "am-drone.html" },
          ],
        },
      ],
    },
    {
      key: "wb-card-dc",
      title: "数据中心",
      icon: "fa-solid fa-database",
      tone: "violet",
      blocks: [
        {
          items: [
            { key: "dc-drone-stats", label: "分析报告", href: "dc-drone-stats.html" },
            { key: "am-flight-log", label: "飞行日志记录", href: "am-flight-log.html" },
            { key: "am-maintenance", label: "维修与检修记录", href: "am-maintenance.html" },
            { key: "am-ops-metro", label: "地铁信息系统运行管理", href: "am-ops-metro.html" },
            { key: "am-ops-fulltime", label: "全时全域运行管理", href: "am-ops-fulltime.html" },
            { key: "am-ops-uav", label: "无人机系统运行管理", href: "am-ops-uav.html" },
            { key: "dc-library", label: "资料库", href: "dc-library.html" },
          ],
        },
      ],
    },
    {
      key: "wb-card-sys",
      title: "系统管理",
      icon: "fa-solid fa-gears",
      tone: "orange",
      blocks: [
        {
          items: [
            { key: "wb-user", label: "用户管理", href: "wb-user.html" },
            { key: "wb-role", label: "角色管理", href: "wb-role.html" },
            { key: "wb-permission", label: "权限管理", href: "wb-permission.html" },
            { key: "wb-dept", label: "部门管理", href: "wb-dept.html" },
            { key: "wb-post", label: "岗位管理", href: "wb-post.html" },
            { key: "wb-menu", label: "菜单管理", href: "wb-menu.html" },
            { key: "wb-dict", label: "字典管理", href: "wb-dict.html" },
            { key: "wb-log", label: "日志管理", href: "wb-log.html" },
            { key: "wb-param", label: "参数设置", href: "wb-param.html" },
            { key: "wb-notice", label: "通知公告", href: "wb-notice.html" },
          ],
        },
        {
          subtitle: "工作流",
          items: [
            { key: "wb-wf-category", label: "流程分类", href: "wb-wf-category.html" },
            { key: "wb-wf-design", label: "流程设计", href: "wb-wf-design.html" },
          ],
        },
      ],
    },
  ];

  function pageFile() {
    var name = (typeof location !== "undefined" && location.pathname && location.pathname.split("/").pop()) || "";
    if (!name) return "index.html";
    return name.split("?")[0] || "index.html";
  }

  function dropdownContainsPage(item, file) {
    if (!item.items) return false;
    for (var i = 0; i < item.items.length; i++) {
      if (item.items[i].href === file) return true;
    }
    return false;
  }

  function topNavMatchId(file, bodyTopId) {
    for (var i = 0; i < TOP_NAV.length; i++) {
      var it = TOP_NAV[i];
      if (it.kind === "dropdown") {
        if (dropdownContainsPage(it, file)) return it.id;
      } else if (it.href === file) return it.id;
    }
    return bodyTopId;
  }

  function findInTree(nodes, leafKey) {
    if (!nodes) return null;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.type === "item" && n.key === leafKey) return n.key;
      if (n.type === "group" && n.children) {
        for (var j = 0; j < n.children.length; j++) {
          if (n.children[j].key === leafKey) return n.key;
        }
      }
    }
    return null;
  }

  function findGroupContainingKey(topId, leafKey) {
    if (topId === "wb") {
      for (var c = 0; c < WB_MEGA.length; c++) {
        var card = WB_MEGA[c];
        for (var b = 0; b < card.blocks.length; b++) {
          var items = card.blocks[b].items || [];
          for (var k = 0; k < items.length; k++) {
            if (items[k].key === leafKey) return card.key;
          }
        }
      }
      return null;
    }
    return findInTree(SIDEBAR[topId], leafKey);
  }

  global.WHMetroMenu = {
    TOP_NAV: TOP_NAV,
    SIDEBAR: SIDEBAR,
    WB_MEGA: WB_MEGA,
    findGroupContainingKey: findGroupContainingKey,
    pageFile: pageFile,
    topNavMatchId: topNavMatchId,
    dropdownContainsPage: dropdownContainsPage,
  };
})(typeof window !== "undefined" ? window : this);
