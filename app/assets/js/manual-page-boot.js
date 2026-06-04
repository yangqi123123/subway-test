/**
 * 移动端人工巡检记录启动
 */
(function (global) {
  "use strict";

  function resolvePatrolHome() {
    return "../home.html";
  }

  function updateNavTitle(text) {
    var el = global.document.getElementById("manual-nav-title");
    if (el) el.textContent = text || "人工巡检记录";
  }

  function bindNavBack() {
    global.document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action='mp-nav-back']");
      if (!btn) return;
      var form = global.document.getElementById("manual-form-view");
      var detail = global.document.getElementById("manual-detail-view");
      var list = global.document.getElementById("manual-list-view");
      if (form && !form.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHInManualPage && typeof global.WHInManualPage.showList === "function") {
          global.WHInManualPage.showList();
        }
        return;
      }
      if (detail && !detail.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHInManualPage && typeof global.WHInManualPage.showList === "function") {
          global.WHInManualPage.showList();
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
    var listEl = global.document.getElementById("manual-list-view");
    var detailEl = global.document.getElementById("manual-detail-view");
    var formEl = global.document.getElementById("manual-form-view");
    if (!listEl) return;

    function sync() {
      if (formEl && !formEl.classList.contains("hidden")) {
        var titleEl = global.document.getElementById("manual-form-title");
        updateNavTitle(titleEl && titleEl.textContent ? titleEl.textContent : "编辑人工巡查记录");
        return;
      }
      if (detailEl && !detailEl.classList.contains("hidden")) {
        var nameEl = global.document.getElementById("detail-manual-title");
        updateNavTitle(nameEl && nameEl.textContent ? nameEl.textContent : "人工巡查详情");
        return;
      }
      updateNavTitle("人工巡检记录");
    }

    [listEl, detailEl, formEl].forEach(function (node) {
      if (!node) return;
      var observer = new MutationObserver(sync);
      observer.observe(node, { attributes: true, attributeFilter: ["class"] });
    });
    global.addEventListener("wh-manual-view-change", sync);
    sync();
  }

  function start() {
    bindNavBack();
    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
      global.MiniAppFrame.syncTabbar();
    }
    if (global.WHInManualPage && global.WHInManualPage.boot) {
      global.WHInManualPage.boot({ mobile: true });
    }
    patchViewNav();
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
