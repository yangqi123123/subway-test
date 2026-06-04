/**
 * 移动端统计分析启动
 */
(function (global) {
  "use strict";

  function resolvePatrolHome() {
    return "../home.html";
  }

  function bindNavBack() {
    global.document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action='mp-nav-back']");
      if (!btn) return;
      var list = global.document.getElementById("quality-list-view");
      if (list && !list.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        global.location.href = resolvePatrolHome();
      }
    });
  }

  function start() {
    bindNavBack();
    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
      global.MiniAppFrame.syncTabbar();
    }
    if (global.WHInQualityStatsPage && global.WHInQualityStatsPage.boot) {
      global.WHInQualityStatsPage.boot({ mobile: true });
    }
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
