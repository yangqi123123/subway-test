/**
 * 全局菜单 — 顶部一级 + 侧栏 / 工作台超级卡片（与 shell.js 同步）。
 * 新增页面：补 TOP_NAV 下拉项或 WB_MEGA 叶子，并在 HTML 的 data-top / data-sidebar-key 与之一致。
 */
(function (global) {
  /** web 子目录深度：web-login=0，web/map/xxx=1 */
  function whWebPageDepth() {
    if (typeof location === "undefined" || !location.pathname) return 0;
    var path = String(location.pathname).replace(/\\/g, "/");
    var m = path.match(/\/web\/([^?#]*)/i);
    if (!m) return 0;
    var parts = m[1].split("/").filter(Boolean);
    if (parts.length <= 1) return 0;
    return parts.length - 1;
  }

  function whWebPageDir() {
    if (typeof location === "undefined" || !location.pathname) return "";
    var path = String(location.pathname).replace(/\\/g, "/");
    var m = path.match(/\/web\/([^?#]*)/i);
    if (!m) return "";
    var parts = m[1].split("/").filter(Boolean);
    parts.pop();
    return parts.join("/");
  }

  function relPageHref(fromDir, toCanonical) {
    var toDir = toCanonical.indexOf("/") >= 0 ? toCanonical.replace(/\/[^/]+$/, "") : "";
    if (fromDir === toDir) return toCanonical.split("/").pop();
    var depth = fromDir ? fromDir.split("/").filter(Boolean).length : 0;
    return (depth ? "../".repeat(depth) : "") + toCanonical;
  }

  /** 页面在 web/ 或 app/ 下时，静态资源需加 ../ 前缀 */
  function whAssetPrefix() {
    if (typeof location === "undefined" || !location.pathname) return "";
    var path = String(location.pathname).replace(/\\/g, "/");
    if (/\/web\//i.test(path)) {
      var d = whWebPageDepth();
      return d === 0 ? "../" : "../".repeat(d + 1);
    }
    if (/\/app(\/|$)/i.test(path)) {
      var am = path.match(/\/app\/(.+)/i);
      if (!am) return "../";
      var appDepth = am[1].split("/").filter(Boolean).length;
      return "../".repeat(appDepth);
    }
    return "";
  }

  function whAsset(rel) {
    if (!rel) return whAssetPrefix();
    var s = String(rel);
    if (/^(https?:)?\/\//i.test(s) || s.indexOf("data:") === 0) return s;
    return whAssetPrefix() + s.replace(/^\//, "");
  }

  function hrefFileName(href) {
    if (!href) return "";
    return href.split("?")[0].split("/").pop() || href;
  }

  function whPageHref(href) {
    if (!href || /^(https?:|#|mailto:)/i.test(href)) return href;
    var q = "";
    var i = href.indexOf("?");
    var pathPart = i >= 0 ? href.slice(0, i) : href;
    if (i >= 0) q = href.slice(i);
    var file = pathPart.split("/").pop();
    var routes = global.WH_PAGE_ROUTES || {};
    var canon = routes[file] || routes[pathPart] || pathPart;
    return relPageHref(whWebPageDir(), canon) + q;
  }

  global.whWebPageDepth = whWebPageDepth;
  global.whWebPageDir = whWebPageDir;
  global.whAssetPrefix = whAssetPrefix;
  global.whAsset = whAsset;
  global.whPageHref = whPageHref;
  global.WH_PAGE_ROUTES = {
  "ai.html": "ai/ai.html",
  "map-cockpit-fly.html": "cockpit/map-cockpit-fly.html",
  "map-cockpit-prep.html": "cockpit/map-cockpit-prep.html",
  "map-alerts.html": "map/map-alerts.html",
  "map-expert.html": "map/map-expert.html",
  "map-flight-plan.html": "map/map-flight-plan.html",
  "map-gis.html": "map/map-gis.html",
  "map-routes.html": "map/map-routes.html",
  "map-situation.html": "map/map-situation.html",
  "in-disease.html": "patrol/in-disease.html",
  "in-manual.html": "patrol/in-manual.html",
  "in-night.html": "patrol/in-night.html",
  "in-patrol-results.html": "patrol/in-patrol-results.html",
  "in-uav-report.html": "patrol/in-uav-report.html",
  "dc-drone-stats.html": "stats/dc-drone-stats.html",
  "dc-library.html": "stats/dc-library.html",
  "dc-line-stats.html": "stats/dc-line-stats.html",
  "dc-system-stats.html": "stats/dc-system-stats.html",
  "am-airport.html": "wb/am-airport.html",
  "am-drone.html": "wb/am-drone.html",
  "am-emergency-material.html": "wb/am-emergency-material.html",
  "am-emergency-plan.html": "wb/am-emergency-plan.html",
  "am-emergency-staff.html": "wb/am-emergency-staff.html",
  "am-emergency-warehouse.html": "wb/am-emergency-warehouse.html",
  "am-flight-log.html": "wb/am-flight-log.html",
  "am-line.html": "wb/am-line.html",
  "am-maintenance.html": "wb/am-maintenance.html",
  "am-ops-metro.html": "wb/am-ops-metro.html",
  "am-ops-settings.html": "wb/am-ops-settings.html",
  "am-section.html": "wb/am-section.html",
  "am-station.html": "wb/am-station.html",
  "in-project-done.html": "wb/in-project-done.html",
  "in-project-patrol.html": "wb/in-project-patrol.html",
  "in-project.html": "wb/in-project.html",
  "in-quality-stats.html": "wb/in-quality-stats.html",
  "in-score.html": "wb/in-score.html",
  "in-track-drone.html": "wb/in-track-drone.html",
  "in-track-person.html": "wb/in-track-person.html",
  "wb-dept.html": "wb/wb-dept.html",
  "wb-dict.html": "wb/wb-dict.html",
  "wb-done.html": "wb/wb-done.html",
  "wb-hub.html": "wb/wb-hub.html",
  "wb-log.html": "wb/wb-log.html",
  "wb-menu.html": "wb/wb-menu.html",
  "wb-msg-template.html": "wb/wb-msg-template.html",
  "wb-notice.html": "wb/wb-notice.html",
  "wb-param.html": "wb/wb-param.html",
  "wb-permission.html": "wb/wb-permission.html",
  "wb-post.html": "wb/wb-post.html",
  "wb-role.html": "wb/wb-role.html",
  "wb-sys-notify.html": "wb/wb-sys-notify.html",
  "wb-todo.html": "wb/wb-todo.html",
  "wb-user.html": "wb/wb-user.html",
  "wb-wf-category.html": "wb/wb-wf-category.html",
  "wb-wf-design.html": "wb/wb-wf-design.html",
  "web-login.html": "web-login.html"
};
  global.hrefFileName = hrefFileName;

  /** @type {Array<{id:string,label:string,href?:string,kind?:string,items?:Array<{label:string,href:string}>}>} */
  var TOP_NAV = [
    { id: "map", label: "全景地图", kind: "link", href: "map/map-gis.html" },
    { id: "cockpit", label: "虚拟座舱", kind: "link", href: "cockpit/map-cockpit-prep.html" },
    {
      id: "patrol",
      label: "巡查记录",
      kind: "link",
      href: "patrol/in-disease.html",
      matchTop: "patrol",
    },
    {
      id: "st",
      label: "数据统计",
      kind: "link",
      href: "stats/dc-line-stats.html",
      matchTop: "st",
    },
    {
      id: "project",
      label: "项目管理",
      kind: "link",
      href: "wb/in-project.html",
    },
    { id: "wb", label: "我的工作台", kind: "link", href: "wb/wb-hub.html" },
  ];

  /**
   * 侧栏：type = 'item' | 'group'
   * 我的工作台使用 WB_MEGA（超级卡片），此处不放 wb 键。
   */
  var SIDEBAR = {
    patrol: [
      { type: "item", key: "in-disease", label: "病害巡查", href: "patrol/in-disease.html" },
      { type: "item", key: "in-night", label: "夜班作业", href: "patrol/in-night.html" },
      {
        type: "group",
        key: "patrol-reports",
        label: "巡查记录",
        children: [
          { key: "in-uav-report", label: "无人机巡查记录", href: "patrol/in-uav-report.html" },
          { key: "in-manual", label: "人工巡查记录", href: "patrol/in-manual.html" },
          { key: "in-patrol-results", label: "巡检成果", href: "patrol/in-patrol-results.html" },
        ],
      },
    ],
    st: [
      { type: "item", key: "dc-line-stats", label: "线路项目统计", href: "stats/dc-line-stats.html" },
      {
        type: "item",
        key: "dc-system-stats",
        label: "全时全域数据统计报表",
        href: "stats/dc-system-stats.html",
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
            { key: "wb-todo", label: "待办", href: "wb/wb-todo.html" },
            { key: "wb-sys-notify", label: "系统通知", href: "wb/wb-sys-notify.html" },
            { key: "wb-done", label: "已处理事项", href: "wb/wb-done.html" },
          ],
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
            { key: "in-project", label: "项目管理", href: "wb/in-project.html" },
            { key: "in-project-done", label: "完工项目", href: "wb/in-project-done.html" },
          ],
        },
        {
          subtitle: "巡查质量",
          items: [
            { key: "in-track-person", label: "人员轨迹", href: "wb/in-track-person.html" },
            { key: "in-quality-stats", label: "统计分析", href: "wb/in-quality-stats.html" },
            { key: "in-score", label: "巡查打分", href: "wb/in-score.html" },
          ],
        },
        {
          subtitle: "巡检记录",
          items: [
            { key: "in-disease", label: "病害巡查", href: "patrol/in-disease.html" },
            { key: "in-night", label: "夜班作业", href: "patrol/in-night.html" },
            { key: "in-manual", label: "人工巡检记录", href: "patrol/in-manual.html" },
            { key: "in-uav-report", label: "无人机巡检记录", href: "patrol/in-uav-report.html" },
            { key: "in-patrol-results", label: "巡检成果", href: "patrol/in-patrol-results.html" },
          ],
        },
        {
          subtitle: "全时全域感知",
          items: [
            { key: "map-situation", label: "态势感知", href: "map/map-situation.html" },
            { key: "map-alerts", label: "告警信息", href: "map/map-alerts.html" },
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
            { key: "am-line", label: "线路管理", href: "wb/am-line.html" },
            { key: "am-station", label: "站点管理", href: "wb/am-station.html" },
            { key: "am-section", label: "区间管理", href: "wb/am-section.html" },
          ],
        },
        {
          subtitle: "应急管理",
          items: [
            { key: "am-emergency-staff", label: "应急人员", href: "wb/am-emergency-staff.html" },
            { key: "am-emergency-warehouse", label: "应急仓库", href: "wb/am-emergency-warehouse.html" },
            { key: "am-emergency-plan", label: "应急预案", href: "wb/am-emergency-plan.html" },
          ],
        },
        {
          subtitle: "无人机设备管理",
          items: [
            { key: "am-airport", label: "机场设备管理", href: "wb/am-airport.html" },
            { key: "am-drone", label: "无人机设备管理", href: "wb/am-drone.html" },
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
          subtitle: "数据统计",
          items: [
            { key: "dc-line-stats", label: "线路项目统计", href: "stats/dc-line-stats.html" },
            { key: "dc-drone-stats", label: "无人机数据统计", href: "stats/dc-drone-stats.html" },
            {
              key: "dc-system-stats",
              label: "全时全域数据统计报表",
              href: "stats/dc-system-stats.html",
            },
          ],
        },
        {
          items: [
            { key: "am-flight-log", label: "飞行日志记录", href: "wb/am-flight-log.html" },
            { key: "am-maintenance", label: "维修与检修记录", href: "wb/am-maintenance.html" },
            { key: "dc-library", label: "资料库", href: "stats/dc-library.html" },
            /* 入口隐藏，页面保留：am-ops-fulltime.html、am-ops-uav.html */
          ],
        },
      ],
    },
    {
      key: "wb-card-sys",
      title: "配置中心",
      icon: "fa-solid fa-gears",
      tone: "orange",
      blocks: [
        {
          subtitle: "系统管理",
          items: [
            { key: "wb-user", label: "用户管理", href: "wb/wb-user.html" },
            { key: "wb-role", label: "角色管理", href: "wb/wb-role.html" },
            { key: "wb-dept", label: "部门管理", href: "wb/wb-dept.html" },
            { key: "wb-post", label: "岗位管理", href: "wb/wb-post.html" },
            { key: "wb-menu", label: "菜单管理", href: "wb/wb-menu.html" },
            { key: "wb-dict", label: "字典管理", href: "wb/wb-dict.html" },
            { key: "wb-log", label: "日志管理", href: "wb/wb-log.html" },
            { key: "wb-param", label: "参数设置", href: "wb/wb-param.html" },
            { key: "wb-notice", label: "通知公告", href: "wb/wb-notice.html" },
            { key: "wb-msg-template", label: "消息模板", href: "wb/wb-msg-template.html" },
            { key: "am-ops-metro", label: "资源监控", href: "wb/am-ops-metro.html" },
            { key: "am-ops-settings", label: "设置", href: "wb/am-ops-settings.html" },
          ],
        },
        {
          items: [
            { key: "map-flight-plan", label: "飞行计划", href: "map/map-flight-plan.html" },
            { key: "map-routes", label: "航线管理", href: "map/map-routes.html" },
          ],
        },
        {
          subtitle: "工作流",
          items: [
            { key: "wb-wf-category", label: "流程分类", href: "wb/wb-wf-category.html" },
            { key: "wb-wf-design", label: "流程设计", href: "wb/wb-wf-design.html" },
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
      if (hrefFileName(item.items[i].href) === file) return true;
    }
    return false;
  }

  function isProjectNavPage(file) {
    return (
      file === "in-project.html" ||
      file === "in-project-done.html" ||
      file === "in-project-patrol.html"
    );
  }

  function topNavMatchId(file, bodyTopId) {
    for (var i = 0; i < TOP_NAV.length; i++) {
      var it = TOP_NAV[i];
      if (it.matchTop && it.matchTop === bodyTopId) return it.id;
      if (it.id === "project" && isProjectNavPage(file)) return it.id;
      if (it.kind === "dropdown") {
        if (dropdownContainsPage(it, file)) return it.id;
      } else if (it.href && hrefFileName(it.href) === file) return it.id;
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

  /** 顶部搜索：汇总所有可跳转菜单（按名称去重） */
  function collectAllMenuItems() {
    var list = [];
    var seen = {};
    function add(label, href, group) {
      if (!href || !label) return;
      var resolved = typeof whPageHref === "function" ? whPageHref(href) : href;
      if (seen[resolved]) return;
      seen[resolved] = true;
      list.push({ label: label, href: resolved, group: group || "" });
    }
    TOP_NAV.forEach(function (item) {
      if (item.href) add(item.label, item.href, "顶部导航");
      if (item.items) {
        item.items.forEach(function (sub) {
          add(sub.label, sub.href, item.label);
        });
      }
    });
    add("AI识别", "ai/ai.html", "业务功能");
    add("完工项目", "wb/in-project-done.html", "项目管理");
    Object.keys(SIDEBAR).forEach(function (topId) {
      (SIDEBAR[topId] || []).forEach(function (node) {
        if (node.type === "item") add(node.label, node.href, topId);
        if (node.type === "group" && node.children) {
          node.children.forEach(function (child) {
            add(child.label, child.href, node.label);
          });
        }
      });
    });
    WB_MEGA.forEach(function (card) {
      (card.blocks || []).forEach(function (block) {
        var group = card.title + (block.subtitle ? " · " + block.subtitle : "");
        (block.items || []).forEach(function (item) {
          if (item.hidden) return;
          add(item.label, item.href, group);
        });
      });
    });
    list.sort(function (a, b) {
      return a.label.localeCompare(b.label, "zh-CN");
    });
    return list;
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
    collectAllMenuItems: collectAllMenuItems,
    pageFile: pageFile,
    topNavMatchId: topNavMatchId,
    dropdownContainsPage: dropdownContainsPage,
    assetPrefix: whAssetPrefix,
    asset: whAsset,
    pageHref: whPageHref,
  };
})(typeof window !== "undefined" ? window : this);

/** 顶栏待办 / 系统通知角标（与 workbench-module 列表对齐） */
(function (global) {
  var STORAGE_NOTIFY_READ = "whmetro-notify-read";
  var TODO_PENDING_STATUS = ["待审批", "未复核"];

  var NOTIFY_ROWS = [
    { id: "n1", read: "未读" },
    { id: "n2", read: "已读" },
    { id: "n3", read: "未读" },
    { id: "n4", read: "未读" },
  ];

  var TODO_ROWS = [
    { id: "t1", status: "待审批" },
    { id: "t2", status: "待审批" },
    { id: "t3", status: "未复核" },
  ];

  function getNotifyReadSet() {
    try {
      var raw = localStorage.getItem(STORAGE_NOTIFY_READ);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveNotifyReadSet(ids) {
    localStorage.setItem(STORAGE_NOTIFY_READ, JSON.stringify(ids || []));
  }

  function isNotifyRead(row) {
    if (!row) return true;
    if (row.read === "已读") return true;
    if (row.id && getNotifyReadSet().indexOf(row.id) >= 0) return true;
    return false;
  }

  function notifyUnreadCount() {
    var cfg = global.WH_WORKBENCH_CONFIGS && global.WH_WORKBENCH_CONFIGS["wb-sys-notify"];
    var rows = cfg && cfg.rows && cfg.rows.length ? cfg.rows : NOTIFY_ROWS;
    if (cfg && cfg.rows) applyNotifyReadToRows(cfg.rows);
    return rows.filter(function (r) {
      return !isNotifyRead(r);
    }).length;
  }

  function todoPendingCount() {
    if (global.WHTodoFlow && typeof global.WHTodoFlow.applyToConfigs === "function") {
      global.WHTodoFlow.applyToConfigs();
    }
    var cfg = global.WH_WORKBENCH_CONFIGS && global.WH_WORKBENCH_CONFIGS["wb-todo"];
    if (cfg && cfg.rows && cfg.rows.length) {
      return cfg.rows.filter(function (r) {
        return TODO_PENDING_STATUS.indexOf(r.status) >= 0;
      }).length;
    }
    return TODO_ROWS.filter(function (r) {
      return TODO_PENDING_STATUS.indexOf(r.status) >= 0;
    }).length;
  }

  function formatBadgeCount(count) {
    if (!count || count < 1) return "";
    return count > 99 ? "99+" : String(count);
  }

  function badgeHtml(count) {
    var text = formatBadgeCount(count);
    if (!text) return "";
    return (
      '<span class="wh-shell-badge" aria-label="未处理 ' + text + ' 条">' + text + "</span>"
    );
  }

  function markNotifyRead(rowOrId) {
    var id = typeof rowOrId === "string" ? rowOrId : rowOrId && rowOrId.id;
    if (!id) return;
    var set = getNotifyReadSet();
    if (set.indexOf(id) < 0) {
      set.push(id);
      saveNotifyReadSet(set);
    }
    NOTIFY_ROWS.forEach(function (r) {
      if (r.id === id) r.read = "已读";
    });
    var cfg = global.WH_WORKBENCH_CONFIGS && global.WH_WORKBENCH_CONFIGS["wb-sys-notify"];
    if (cfg && cfg.rows) {
      cfg.rows.forEach(function (r) {
        if (r.id === id) r.read = "已读";
      });
    }
    refresh();
  }

  function markAllNotifyRead() {
    saveNotifyReadSet(
      NOTIFY_ROWS.map(function (r) {
        return r.id;
      })
    );
    NOTIFY_ROWS.forEach(function (r) {
      r.read = "已读";
    });
    var cfg = global.WH_WORKBENCH_CONFIGS && global.WH_WORKBENCH_CONFIGS["wb-sys-notify"];
    if (cfg && cfg.rows) {
      cfg.rows.forEach(function (r) {
        r.read = "已读";
      });
    }
    refresh();
  }

  function applyNotifyReadToRows(rows) {
    (rows || []).forEach(function (row, index) {
      if (!row.id) row.id = NOTIFY_ROWS[index] && NOTIFY_ROWS[index].id;
      if (row.id && isNotifyRead({ id: row.id, read: row.read })) row.read = "已读";
    });
    return rows;
  }

  function restoreNotifyDemoDefaults() {
    try {
      global.localStorage.removeItem(STORAGE_NOTIFY_READ);
    } catch (e) {}
    NOTIFY_ROWS.forEach(function (r) {
      r.read = r.id === "n2" ? "已读" : "未读";
    });
    var defaults = global.WH_WORKBENCH_DEFAULTS;
    var configs = global.WH_WORKBENCH_CONFIGS;
    if (defaults && defaults["wb-sys-notify"] && configs) {
      configs["wb-sys-notify"] = JSON.parse(JSON.stringify(defaults["wb-sys-notify"]));
    }
    refreshMineHubBadges();
  }

  function refreshMineHubBadges() {
    document.querySelectorAll(".miniapp-cell[data-list]").forEach(function (cell) {
      var list = cell.getAttribute("data-list");
      var badge = cell.querySelector(".miniapp-cell__badge");
      if (!badge) return;
      var count = 0;
      if (list === "todo") count = todoPendingCount();
      else if (list === "notify") count = notifyUnreadCount();
      if (!count) {
        badge.hidden = true;
        badge.textContent = "";
        return;
      }
      badge.hidden = false;
      badge.textContent = count > 99 ? "99+" : String(count);
    });
  }

  function refresh() {
    var todoCount = todoPendingCount();
    var notifyCount = notifyUnreadCount();
    document.querySelectorAll("[data-shell-badge='todo']").forEach(function (node) {
      node.innerHTML = badgeHtml(todoCount);
      node.classList.toggle("wh-shell-badge-wrap--hidden", !todoCount);
    });
    document.querySelectorAll("[data-shell-badge='notify']").forEach(function (node) {
      node.innerHTML = badgeHtml(notifyCount);
      node.classList.toggle("wh-shell-badge-wrap--hidden", !notifyCount);
    });
    refreshMineHubBadges();
  }

  global.WHHeaderBadges = {
    todoPendingCount: todoPendingCount,
    notifyUnreadCount: notifyUnreadCount,
    badgeHtml: badgeHtml,
    markNotifyRead: markNotifyRead,
    markAllNotifyRead: markAllNotifyRead,
    applyNotifyReadToRows: applyNotifyReadToRows,
    restoreNotifyDemoDefaults: restoreNotifyDemoDefaults,
    refreshMineHubBadges: refreshMineHubBadges,
    refresh: refresh,
  };
})(typeof window !== "undefined" ? window : this);
