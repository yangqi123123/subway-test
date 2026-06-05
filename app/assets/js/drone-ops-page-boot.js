/**
 * 移动端无人机数据统计启动
 */
(function (global) {
  "use strict";

  function readInitialTab() {
    try {
      var params = new URLSearchParams(global.location.search);
      return params.get("tab") === "records" ? "records" : "overview";
    } catch (e) {
      return "overview";
    }
  }

  function start() {
    global.document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action='mp-nav-back']");
      if (!btn) return;
      event.preventDefault();
      event.stopPropagation();
      global.location.href = "../home.html";
    });

    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
      global.MiniAppFrame.syncTabbar();
    }
    if (global.WHStatsFilterPickerBoot) {
      global.WHStatsFilterPickerBoot.boot("drone-stats-filter-sheet");
    }
    if (global.WHDroneStatsPage && global.WHDroneStatsPage.boot) {
      global.WHDroneStatsPage.boot({ mobile: true, initialTab: readInitialTab() });
    }
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
