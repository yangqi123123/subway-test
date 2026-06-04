/**
 * 移动端线路项目统计启动
 */
(function (global) {
  "use strict";

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
    if (global.WHLineStatsPage && global.WHLineStatsPage.boot) {
      global.WHLineStatsPage.boot({ mobile: true });
    }
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
