/**
 * 公共快捷操作面板组件
 *
 * 用法：页面在右侧栏放置 <div data-quick-links-group="巡查质量"></div>，
 * 并在 menu-config.js 之后引入本脚本即可自动渲染。
 *
 * 数据源：assets/js/menu-config.js 中 WB_MEGA 对应 subtitle 分组的 items。
 * 新增菜单只需在 menu-config.js 的对应分组中追加一项，所有引用页面自动同步；
 * 当前页面（body data-sidebar-key 与菜单 key 一致）自动高亮。
 */
(function (global) {
  var DEFAULT_ICON = "fa-solid fa-link";
  var ICON_BY_KEY = {
    "in-track-person": "fa-solid fa-person-walking",
    "in-track-device": "fa-solid fa-microchip",
    "in-device-bind": "fa-solid fa-hand-holding",
    "in-quality-stats": "fa-solid fa-chart-line",
    "in-score": "fa-solid fa-star-half-stroke",
    "in-score-rule": "fa-solid fa-list-ol",
  };

  function findGroupItems(subtitle) {
    var mega = global.WHMetroMenu && global.WHMetroMenu.WB_MEGA;
    if (!mega) return [];
    for (var c = 0; c < mega.length; c++) {
      var blocks = mega[c].blocks || [];
      for (var b = 0; b < blocks.length; b++) {
        if (blocks[b].subtitle === subtitle) return blocks[b].items || [];
      }
    }
    return [];
  }

  function escHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function currentPageKey() {
    return (document.body && document.body.getAttribute("data-sidebar-key")) || "";
  }

  function currentFileName() {
    var path = location.pathname || "";
    return path.substring(path.lastIndexOf("/") + 1);
  }

  function resolveHref(href) {
    return typeof global.whPageHref === "function" ? global.whPageHref(href) : href;
  }

  function renderInto(container) {
    var subtitle = container.getAttribute("data-quick-links-group") || "";
    var items = findGroupItems(subtitle).filter(function (item) {
      return !item.hidden;
    });
    if (!items.length) return;
    var activeKey = currentPageKey();
    var activeFile = currentFileName();
    var links = items
      .map(function (item) {
        var icon = ICON_BY_KEY[item.key] || DEFAULT_ICON;
        var href = resolveHref(item.href);
        var hrefFile = String(item.href || "").substring(String(item.href || "").lastIndexOf("/") + 1);
        var active = item.key === activeKey || (!activeKey && hrefFile === activeFile);
        return (
          '<a class="disease-quick-link' + (active ? " is-active" : "") + '"' +
          ' data-quick-key="' + escHtml(item.key) + '"' +
          ' href="' + escHtml(href) + '">' +
          '<i class="' + escHtml(icon) + '"></i><span>' + escHtml(item.label) + "</span></a>"
        );
      })
      .join("");
    container.innerHTML =
      '<div class="disease-quick-panel">' +
      '<div class="disease-panel-title"><i class="fa-solid fa-bolt mr-2 text-cyan-400"></i>快捷操作</div>' +
      '<div class="disease-panel-body">' + links + "</div>" +
      "</div>";
  }

  function mountAll() {
    document.querySelectorAll("[data-quick-links-group]").forEach(renderInto);
  }

  global.WHQuickLinksPanel = { render: renderInto, mountAll: mountAll, findGroupItems: findGroupItems };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountAll);
  } else {
    mountAll();
  }
})(window);
