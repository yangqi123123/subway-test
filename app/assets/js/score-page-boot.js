/**
 * 移动端巡查打分启动
 */
(function (global) {
  "use strict";

  function updateNavTitle(text) {
    var el = global.document.getElementById("score-nav-title");
    if (el) el.textContent = text || "巡查打分";
  }

  function resolvePatrolHome() {
    return "../home.html";
  }

  function bindNavBack() {
    global.document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action='mp-nav-back']");
      if (!btn) return;
      var detail = global.document.getElementById("score-detail-view");
      var list = global.document.getElementById("score-list-view");
      if (detail && !detail.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHInScorePage && typeof global.WHInScorePage.showList === "function") {
          global.WHInScorePage.showList();
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
    var listEl = global.document.getElementById("score-list-view");
    var detailEl = global.document.getElementById("score-detail-view");
    if (!listEl || !detailEl) return;

    function sync() {
      if (!detailEl.classList.contains("hidden")) {
        var nameEl = global.document.getElementById("detail-score-title");
        updateNavTitle(nameEl && nameEl.textContent ? nameEl.textContent : "巡查详情");
        return;
      }
      updateNavTitle("巡查打分");
    }

    var observer = new MutationObserver(sync);
    observer.observe(listEl, { attributes: true, attributeFilter: ["class"] });
    observer.observe(detailEl, { attributes: true, attributeFilter: ["class"] });
    global.addEventListener("wh-score-view-change", sync);
    sync();
  }

  function start() {
    bindNavBack();
    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
      global.MiniAppFrame.syncTabbar();
    }
    if (global.WHInScorePage && global.WHInScorePage.boot) {
      global.WHInScorePage.boot({ mobile: true });
    }
    patchViewNav();
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
