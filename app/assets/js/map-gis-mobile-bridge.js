/**
 * 移动端 app/map/pages/* 下资源与后台 web 页面路径桥接
 */
(function (global) {
  "use strict";

  function appAssetPrefix() {
    if (typeof location === "undefined" || !location.pathname) return "../../../";
    var path = String(location.pathname).replace(/\\/g, "/");
    var m = path.match(/\/app\/(.+)/i);
    if (!m) return "../../../";
    var depth = m[1].split("/").filter(Boolean).length;
    return "../".repeat(depth);
  }

  var ROOT = appAssetPrefix();
  var WEB = ROOT + "web/";

  /** 覆盖 menu-config 在 app 子目录下错误的 ../ 前缀 */
  global.whAssetPrefix = function () {
    return ROOT + "assets/";
  };

  global.whAsset = function (rel) {
    if (!rel) return global.whAssetPrefix();
    var s = String(rel);
    if (/^(https?:)?\/\//i.test(s) || s.indexOf("data:") === 0) return s;
    if (s.indexOf("assets/") === 0) return ROOT + s;
    return ROOT + "assets/" + s.replace(/^\//, "");
  };

  global.whPageHref = function (href) {
    if (!href || /^(https?:|#|mailto:)/i.test(href)) return href;
    var q = "";
    var i = href.indexOf("?");
    var pathPart = i >= 0 ? href.slice(0, i) : href;
    if (i >= 0) q = href.slice(i);
    var file = pathPart.split("/").pop();
    var routes = global.WH_PAGE_ROUTES || {};
    var canon = routes[file] || routes[pathPart] || pathPart;
    return WEB + canon + q;
  };
})(window);
