/**
 * 移动端飞行日志启动
 */
(function (global) {
  "use strict";

  function resolveAssetHome() {
    return "../home.html";
  }

  function updateNavTitle(text) {
    var el = global.document.getElementById("flight-log-nav-title");
    if (el) el.textContent = text || "飞行日志";
  }

  function bindNavBack() {
    global.document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action='mp-nav-back']");
      if (!btn) return;
      var detail = global.document.getElementById("flight-log-detail-view");
      var list = global.document.getElementById("flight-log-list-view");
      if (detail && !detail.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHFlightLogPage && typeof global.WHFlightLogPage.showList === "function") {
          global.WHFlightLogPage.showList();
        }
        return;
      }
      if (list && !list.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        global.location.href = resolveAssetHome();
      }
    });
  }

  function patchViewNav() {
    var listEl = global.document.getElementById("flight-log-list-view");
    var detailEl = global.document.getElementById("flight-log-detail-view");
    if (!listEl) return;

    function sync() {
      if (detailEl && !detailEl.classList.contains("hidden")) {
        var nameEl = global.document.getElementById("detail-flight-log-title");
        updateNavTitle(nameEl && nameEl.textContent ? nameEl.textContent : "飞行日志详情");
        return;
      }
      updateNavTitle("飞行日志");
    }

    [listEl, detailEl].forEach(function (node) {
      if (!node) return;
      var observer = new MutationObserver(sync);
      observer.observe(node, { attributes: true, attributeFilter: ["class"] });
    });
    global.addEventListener("wh-flight-log-view-change", sync);
    sync();
  }

  function start() {
    bindNavBack();
    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
      global.MiniAppFrame.syncTabbar();
    }
    if (global.WHFlightLogPage && global.WHFlightLogPage.boot) {
      global.WHFlightLogPage.boot({ mobile: true });
    }
    patchViewNav();
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
