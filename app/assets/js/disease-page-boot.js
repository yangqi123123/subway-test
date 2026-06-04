/**
 * 移动端病害巡查启动
 */
(function (global) {
  "use strict";

  function resolvePatrolHome() {
    return "../home.html";
  }

  function updateNavTitle(text) {
    var el = global.document.getElementById("disease-nav-title");
    if (el) el.textContent = text || "病害巡查";
  }

  function bindNavBack() {
    global.document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action='mp-nav-back']");
      if (!btn) return;
      var form = global.document.getElementById("disease-form-view");
      var detail = global.document.getElementById("disease-detail-view");
      var list = global.document.getElementById("disease-list-view");
      if (form && !form.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHInDiseasePage && typeof global.WHInDiseasePage.showList === "function") {
          global.WHInDiseasePage.showList();
        }
        return;
      }
      if (detail && !detail.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHInDiseasePage && typeof global.WHInDiseasePage.showList === "function") {
          global.WHInDiseasePage.showList();
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
    var listEl = global.document.getElementById("disease-list-view");
    var detailEl = global.document.getElementById("disease-detail-view");
    var formEl = global.document.getElementById("disease-form-view");
    if (!listEl) return;

    function sync() {
      if (formEl && !formEl.classList.contains("hidden")) {
        var titleEl = global.document.getElementById("disease-form-title");
        updateNavTitle(titleEl && titleEl.textContent ? titleEl.textContent : "编辑病害");
        return;
      }
      if (detailEl && !detailEl.classList.contains("hidden")) {
        var nameEl = global.document.getElementById("detail-disease-title");
        updateNavTitle(nameEl && nameEl.textContent ? nameEl.textContent : "病害详情");
        return;
      }
      updateNavTitle("病害巡查");
    }

    [listEl, detailEl, formEl].forEach(function (node) {
      if (!node) return;
      var observer = new MutationObserver(sync);
      observer.observe(node, { attributes: true, attributeFilter: ["class"] });
    });
    global.addEventListener("wh-disease-view-change", sync);
    sync();
  }

  function start() {
    bindNavBack();
    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
      global.MiniAppFrame.syncTabbar();
    }
    if (global.WHInDiseasePage && global.WHInDiseasePage.boot) {
      global.WHInDiseasePage.boot({ mobile: true });
    }
    patchViewNav();
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
