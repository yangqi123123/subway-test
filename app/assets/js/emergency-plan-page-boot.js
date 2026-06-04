/**
 * 移动端应急预案启动
 */
(function (global) {
  "use strict";

  function resolveAssetHome() {
    return "../home.html";
  }

  function updateNavTitle(text) {
    var el = global.document.getElementById("plan-nav-title");
    if (el) el.textContent = text || "应急预案";
  }

  function bindNavBack() {
    global.document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action='mp-nav-back']");
      if (!btn) return;
      var form = global.document.getElementById("plan-form-view");
      var detail = global.document.getElementById("plan-detail-view");
      var list = global.document.getElementById("plan-list-view");
      if (form && !form.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHEmergencyPlanPage && typeof global.WHEmergencyPlanPage.showList === "function") {
          global.WHEmergencyPlanPage.showList();
        }
        return;
      }
      if (detail && !detail.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHEmergencyPlanPage && typeof global.WHEmergencyPlanPage.showList === "function") {
          global.WHEmergencyPlanPage.showList();
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
    var listEl = global.document.getElementById("plan-list-view");
    var detailEl = global.document.getElementById("plan-detail-view");
    var formEl = global.document.getElementById("plan-form-view");
    if (!listEl) return;

    function sync() {
      if (formEl && !formEl.classList.contains("hidden")) {
        var titleEl = global.document.getElementById("plan-form-title");
        updateNavTitle(titleEl && titleEl.textContent ? titleEl.textContent : "编辑应急预案");
        return;
      }
      if (detailEl && !detailEl.classList.contains("hidden")) {
        var nameEl = global.document.getElementById("detail-plan-title");
        updateNavTitle(nameEl && nameEl.textContent ? nameEl.textContent : "应急预案详情");
        return;
      }
      updateNavTitle("应急预案");
    }

    [listEl, detailEl, formEl].forEach(function (node) {
      if (!node) return;
      var observer = new MutationObserver(sync);
      observer.observe(node, { attributes: true, attributeFilter: ["class"] });
    });
    global.addEventListener("wh-plan-view-change", sync);
    sync();
  }

  function start() {
    bindNavBack();
    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
      global.MiniAppFrame.syncTabbar();
    }
    if (global.WHEmergencyPlanPage && global.WHEmergencyPlanPage.boot) {
      global.WHEmergencyPlanPage.boot({ mobile: true });
    }
    patchViewNav();
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
