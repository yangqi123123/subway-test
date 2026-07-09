/**
 * iframe 内页与外壳通信：仅五个一级 Tab 页显示底部导航
 */
(function (global) {
  "use strict";

  var DEFAULT_TAB_ROOTS = [
    "map/pages/gis.html",
    "patrol/home.html",
    "asset/home.html",
    "stats/home.html",
    "mine/home.html",
  ];

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
    if (global.MiniAppConfig && global.MiniAppConfig.isTabbarRootPath) {
      return global.MiniAppConfig.isTabbarRootPath(path);
    }
    path = path || global.location.pathname || "";
    return DEFAULT_TAB_ROOTS.some(function (home) {
      return pathMatchesTabHome(path, home);
    });
  }

  function isTabbarRootPage() {
    return isTabbarRootPath(global.location.pathname || "");
  }

  function shouldHideTabbar() {
    return !isTabbarRootPage();
  }

  function syncTabbar() {
    var hidden = shouldHideTabbar();
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage({ type: "wh-miniapp-tabbar", hidden: hidden }, "*");
      }
    } catch (e) {
      /* ignore */
    }
  }

  global.MiniAppFrame = {
    syncTabbar: syncTabbar,
    shouldHideTabbar: shouldHideTabbar,
    isTabbarRootPage: isTabbarRootPage,
    isTabbarRootPath: isTabbarRootPath,
  };

  syncTabbar();
  global.addEventListener("pageshow", syncTabbar);
})(window);
