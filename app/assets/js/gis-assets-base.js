/**
 * 解析项目根目录 assets/ 的绝对 URL（兼容 dev-server 根目录、/app/ 子路径、file://）
 */
(function (global) {
  "use strict";

  function resolveProjectAssetsBase() {
    var path = (global.location && global.location.pathname) || "";
    path = path.replace(/\\/g, "/");

    if (global.location && global.location.protocol === "file:") {
      var href = (global.location.href || "").replace(/\\/g, "/");
      var appIdx = href.indexOf("/app/");
      if (appIdx >= 0) return href.slice(0, appIdx) + "/assets/";
      return new URL("../../../assets/", href).href;
    }

    if (path.indexOf("/app/") >= 0) {
      var rootPath = path.split("/app/")[0] || "";
      return global.location.origin + rootPath + "/assets/";
    }

    if (path.indexOf("/web/") >= 0) {
      var webRoot = path.split("/web/")[0] || "";
      return global.location.origin + webRoot + "/assets/";
    }

    return global.location.origin + "/assets/";
  }

  function joinAsset(rel) {
    var base = global.__WH_GIS_ASSETS_BASE || resolveProjectAssetsBase();
    if (!base.endsWith("/")) base += "/";
    var s = String(rel || "").replace(/^\//, "");
    if (s.indexOf("assets/") === 0) s = s.slice(7);
    return base + s;
  }

  global.__WH_GIS_ASSETS_BASE = resolveProjectAssetsBase();

  global.whAsset = function (rel) {
    if (!rel) return global.__WH_GIS_ASSETS_BASE;
    var s = String(rel);
    if (/^(https?:)?\/\//i.test(s) || s.indexOf("data:") === 0) return s;
    return joinAsset(s);
  };

  global.whAssetPrefix = function () {
    return global.__WH_GIS_ASSETS_BASE;
  };

  global.whResolveWebPage = function (canonical) {
    var base = global.__WH_GIS_ASSETS_BASE.replace(/\/assets\/?$/, "/");
    return base + "web/" + String(canonical || "").replace(/^\//, "");
  };

  function isGisMobilePage() {
    return (
      global.document &&
      global.document.body &&
      global.document.body.classList.contains("gis-mobile-page")
    );
  }

  var WH_GIS_MOBILE_ROUTES = {
    "wb/in-project.html": "../../patrol/pages/project.html",
    "patrol/in-manual.html": "../../patrol/pages/manual.html",
    "wb/am-emergency-warehouse.html": "../../asset/pages/emergency-warehouse.html",
    "wb/am-emergency-staff.html": "../../asset/pages/emergency-staff.html",
    "map/map-alerts.html": "../../patrol/pages/patrol-alerts.html",
  };

  function resolveGisMobileHref(canon, query) {
    var rel = WH_GIS_MOBILE_ROUTES[canon];
    if (!rel) return null;
    return rel + (query || "");
  }

  function pageHref(href) {
    if (!href || /^(https?:|#|mailto:)/i.test(href)) return href;
    var q = "";
    var i = href.indexOf("?");
    var pathPart = i >= 0 ? href.slice(0, i) : href;
    if (i >= 0) q = href.slice(i);
    var file = pathPart.split("/").pop();
    var routes = global.WH_PAGE_ROUTES || {};
    var canon = routes[file] || routes[pathPart] || pathPart;
    if (isGisMobilePage()) {
      var mobileHref = resolveGisMobileHref(canon, q);
      if (mobileHref) return mobileHref;
    }
    return global.whResolveWebPage(canon) + q;
  }

  global.whPageHref = pageHref;

  /** menu-config 加载后会覆盖 whPageHref，移动端在脚本链结束后需再次调用 */
  global.whApplyGisAssetPaths = function () {
    global.__WH_GIS_ASSETS_BASE = resolveProjectAssetsBase();
    global.whAssetPrefix = function () {
      return global.__WH_GIS_ASSETS_BASE;
    };
    global.whAsset = function (rel) {
      if (!rel) return global.__WH_GIS_ASSETS_BASE;
      var s = String(rel);
      if (/^(https?:)?\/\//i.test(s) || s.indexOf("data:") === 0) return s;
      return joinAsset(s);
    };
    global.whPageHref = pageHref;
  };
})(window);
