/**
 * 移动端人员轨迹启动
 */
(function (global) {
  "use strict";

  function updateNavTitle(text) {
    var el = global.document.getElementById("track-nav-title");
    if (el) el.textContent = text || "人员轨迹";
  }

  function resolvePatrolHome() {
    return "../home.html";
  }

  function bindNavBack() {
    global.document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action='mp-nav-back']");
      if (!btn) return;
      var detail = global.document.getElementById("track-detail-view");
      var list = global.document.getElementById("track-list-view");
      if (detail && !detail.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHInTrackPersonPage && typeof global.WHInTrackPersonPage.showList === "function") {
          global.WHInTrackPersonPage.showList();
        }
        return;
      }
      if (list && !list.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        global.location.href = resolvePatrolHome();
      }
    });
  }

  function patchViewNav() {
    var listEl = global.document.getElementById("track-list-view");
    var detailEl = global.document.getElementById("track-detail-view");
    if (!listEl || !detailEl) return;

    function sync() {
      if (!detailEl.classList.contains("hidden")) {
        var nameEl = global.document.getElementById("detail-person-name");
        updateNavTitle(nameEl && nameEl.textContent ? nameEl.textContent : "轨迹详情");
        return;
      }
      updateNavTitle("人员轨迹");
    }

    var observer = new MutationObserver(sync);
    observer.observe(listEl, { attributes: true, attributeFilter: ["class"] });
    observer.observe(detailEl, { attributes: true, attributeFilter: ["class"] });
    global.addEventListener("wh-track-view-change", sync);
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
    if (global.WHInTrackPersonPage && global.WHInTrackPersonPage.boot) {
      global.WHInTrackPersonPage.boot({ mobile: true });
    }
    patchViewNav();
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
