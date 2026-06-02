/**
 * 按序加载后台 map-gis 依赖并启动 init（路径自检）
 */
(function (global) {
  "use strict";

  var scriptEl = global.document.currentScript;
  /** app/assets/js/ → 项目根 assets/ */
  var APP_ASSETS = scriptEl
    ? new URL("../../../assets/", scriptEl.src).href
    : global.location.origin + "/assets/";

  var CHAIN = [
    "js/menu-config.js",
    "js/map-metro-data.js",
    "js/map-patrol-clear-settings.js",
    "js/map-patrol-overlay.js",
    "js/map-gis.js",
  ];

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var s = global.document.createElement("script");
      s.src = url;
      s.onload = function () {
        resolve(url);
      };
      s.onerror = function () {
        reject(new Error("无法加载: " + url));
      };
      global.document.head.appendChild(s);
    });
  }

  function loadChain(index, base) {
    if (index >= CHAIN.length) {
      return Promise.resolve(base);
    }
    var url = base + CHAIN[index];
    return loadScript(url).then(function () {
      return loadChain(index + 1, base);
    });
  }

  function tryBoot() {
    if (typeof global.whApplyGisAssetPaths === "function") {
      global.whApplyGisAssetPaths();
    }
    var gis = global.WuhanGIS;
    if (!gis || typeof gis.bootGisPage !== "function") {
      return;
    }
    try {
      gis.bootGisPage();
    } catch (e) {
      return;
    }
    global.dispatchEvent(new Event("wh-gis-ready"));
  }

  function start() {
    if (typeof global.L === "undefined") {
      return;
    }

    var primary = global.__WH_GIS_ASSETS_BASE;
    var fallback = APP_ASSETS;

    loadChain(0, primary)
      .then(function () {
        tryBoot();
      })
      .catch(function () {
        if (primary === fallback) {
          return;
        }
        loadChain(0, fallback)
          .then(function () {
            global.__WH_GIS_ASSETS_BASE = fallback;
            tryBoot();
          })
          .catch(function () {});
      });
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
