/**
 * 移动端设备领用启动
 */
(function (global) {
  "use strict";

  function updateNavTitle(text) {
    var el = global.document.getElementById("bind-nav-title");
    if (el) el.textContent = text || "设备领用";
  }

  function bindNavBack() {
    global.document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action='mp-nav-back']");
      if (!btn) return;
      var page = global.WHInDeviceBindPage;
      var view = page && typeof page.currentViewName === "function" ? page.currentViewName() : "list";
      if (view !== "list") {
        event.preventDefault();
        event.stopPropagation();
        if (page && typeof page.showList === "function") page.showList();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      global.location.href = "../home.html";
    });
  }

  function patchViewNav() {
    var listEl = global.document.getElementById("bind-list-view");
    var detailEl = global.document.getElementById("bind-detail-view");
    var bindEl = global.document.getElementById("bind-form-view");
    if (!listEl || !detailEl || !bindEl) return;

    function sync() {
      if (!bindEl.classList.contains("hidden")) {
        updateNavTitle("绑定人员");
        return;
      }
      if (!detailEl.classList.contains("hidden")) {
        var nameEl = global.document.getElementById("bind-detail-name");
        updateNavTitle(nameEl && nameEl.textContent ? nameEl.textContent : "领用详情");
        return;
      }
      updateNavTitle("设备领用");
    }

    global.addEventListener("wh-bind-view-change", sync);
    sync();
  }

  function start() {
    bindNavBack();
    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
      global.MiniAppFrame.syncTabbar();
    }
    if (typeof global.whApplyGisAssetPaths === "function") {
      global.whApplyGisAssetPaths();
    }
    if (global.WHInDeviceBindPage && global.WHInDeviceBindPage.boot) {
      global.WHInDeviceBindPage.boot({ mobile: true });
    }
    patchViewNav();
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
