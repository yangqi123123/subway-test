/**
 * 移动端无人机巡检记录启动
 */
(function (global) {
  "use strict";

  function resolvePatrolHome() {
    return "../home.html";
  }

  function updateNavTitle(text) {
    var el = global.document.getElementById("uav-nav-title");
    if (el) el.textContent = text || "无人机巡检记录";
  }

  function bindNavBack() {
    global.document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action='mp-nav-back']");
      if (!btn) return;
      var detail = global.document.getElementById("uav-detail-view");
      var list = global.document.getElementById("uav-list-view");
      if (detail && !detail.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHInUavPage && typeof global.WHInUavPage.showList === "function") {
          global.WHInUavPage.showList();
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
    var listEl = global.document.getElementById("uav-list-view");
    var detailEl = global.document.getElementById("uav-detail-view");
    if (!listEl) return;

    function sync() {
      if (detailEl && !detailEl.classList.contains("hidden")) {
        var nameEl = global.document.getElementById("detail-uav-title");
        updateNavTitle(nameEl && nameEl.textContent ? nameEl.textContent : "无人机巡查详情");
        return;
      }
      updateNavTitle("无人机巡检记录");
    }

    [listEl, detailEl].forEach(function (node) {
      if (!node) return;
      var observer = new MutationObserver(sync);
      observer.observe(node, { attributes: true, attributeFilter: ["class"] });
    });
    global.addEventListener("wh-uav-view-change", sync);
    sync();
  }

  function start() {
    bindNavBack();
    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
      global.MiniAppFrame.syncTabbar();
    }
    if (global.WHInUavPage && global.WHInUavPage.boot) {
      global.WHInUavPage.boot({ mobile: true });
    }
    patchViewNav();
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
