/**
 * 移动端资源监控启动
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
    if (global.WHOpsMetroPage && global.WHOpsMetroPage.boot) {
      global.WHOpsMetroPage.boot({ mobile: true, serverId: "metro" });
    }
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
