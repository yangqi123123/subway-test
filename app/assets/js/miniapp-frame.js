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

  function isTabbarRootPath(path) {
    if (global.MiniAppConfig && global.MiniAppConfig.isTabbarRootPath) {
      return global.MiniAppConfig.isTabbarRootPath(path);
    }
    path = String(path || global.location.pathname || "").replace(/\\/g, "/");
    return DEFAULT_TAB_ROOTS.some(function (home) {
      return path.indexOf(home) >= 0;
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
