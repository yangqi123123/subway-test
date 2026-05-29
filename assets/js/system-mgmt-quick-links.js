(function (global) {
  var LINKS = [
    { label: "用户管理", path: "wb/wb-user.html", icon: "fa-user" },
    { label: "角色管理", path: "wb/wb-role.html", icon: "fa-user-shield" },
    { label: "部门管理", path: "wb/wb-dept.html", icon: "fa-sitemap" },
    { label: "岗位管理", path: "wb/wb-post.html", icon: "fa-briefcase" },
    { label: "菜单管理", path: "wb/wb-menu.html", icon: "fa-bars" },
    { label: "字典管理", path: "wb/wb-dict.html", icon: "fa-book" },
    { label: "日志管理", path: "wb/wb-log.html", icon: "fa-clock-rotate-left" },
    { label: "参数设置", path: "wb/wb-param.html", icon: "fa-sliders" },
    { label: "通知公告", path: "wb/wb-notice.html", icon: "fa-bullhorn" },
    { label: "消息模板", path: "wb/wb-msg-template.html", icon: "fa-envelope" },
    { label: "资源监控", path: "wb/am-ops-metro.html", icon: "fa-gauge-high" },
    { label: "设置", path: "wb/am-ops-settings.html", icon: "fa-gear" },
  ];

  function getLinks(activePath) {
    return LINKS.map(function (item) {
      return {
        label: item.label,
        path: item.path,
        icon: item.icon,
        active: item.path === activePath,
      };
    });
  }

  function mountQuickLinks(container, activePath) {
    if (!container) return;
    container.innerHTML = "";
    getLinks(activePath).forEach(function (link) {
      var anchor = document.createElement("a");
      anchor.className = "disease-quick-link" + (link.active ? " is-active" : "");
      anchor.setAttribute("data-quick-href", link.path);
      anchor.href =
        typeof global.whPageHref === "function" ? global.whPageHref(link.path) : link.path;
      anchor.innerHTML =
        '<i class="fa-solid ' + link.icon + '"></i><span>' + link.label + "</span>";
      container.appendChild(anchor);
    });
  }

  global.SystemMgmtQuickLinks = {
    getLinks: getLinks,
    mount: mountQuickLinks,
  };
})(typeof window !== "undefined" ? window : this);
