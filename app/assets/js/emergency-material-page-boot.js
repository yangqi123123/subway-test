/**
 * 移动端应急物资启动
 */
(function (global) {
  "use strict";

  function resolveBackHref() {
    try {
      var params = new URLSearchParams(global.location.search);
      if (params.get("from") === "plan") return "emergency-plan.html";
    } catch (e) {
      /* ignore */
    }
    return "emergency-warehouse.html";
  }

  function updateNavTitle(text) {
    var el = global.document.getElementById("material-nav-title");
    if (el) el.textContent = text || "应急物资";
  }

  function bindNavBack() {
    global.document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action='mp-nav-back']");
      if (!btn) return;
      var form = global.document.getElementById("material-form-view");
      var detail = global.document.getElementById("material-detail-view");
      var list = global.document.getElementById("material-list-view");
      if (form && !form.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHEmergencyMaterialPage && typeof global.WHEmergencyMaterialPage.showList === "function") {
          global.WHEmergencyMaterialPage.showList();
        }
        return;
      }
      if (detail && !detail.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHEmergencyMaterialPage && typeof global.WHEmergencyMaterialPage.showList === "function") {
          global.WHEmergencyMaterialPage.showList();
        }
        return;
      }
      if (list && !list.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        global.location.href = resolveBackHref();
      }
    });
  }

  function patchViewNav() {
    var listEl = global.document.getElementById("material-list-view");
    var detailEl = global.document.getElementById("material-detail-view");
    var formEl = global.document.getElementById("material-form-view");
    if (!listEl) return;

    function sync() {
      if (formEl && !formEl.classList.contains("hidden")) {
        var titleEl = global.document.getElementById("material-form-title");
        updateNavTitle(titleEl && titleEl.textContent ? titleEl.textContent : "编辑应急物资");
        return;
      }
      if (detailEl && !detailEl.classList.contains("hidden")) {
        var nameEl = global.document.getElementById("detail-material-title");
        updateNavTitle(nameEl && nameEl.textContent ? nameEl.textContent : "应急物资详情");
        return;
      }
      updateNavTitle("应急物资");
    }

    [listEl, detailEl, formEl].forEach(function (node) {
      if (!node) return;
      var observer = new MutationObserver(sync);
      observer.observe(node, { attributes: true, attributeFilter: ["class"] });
    });
    global.addEventListener("wh-material-view-change", sync);
    sync();
  }

  function start() {
    bindNavBack();
    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
      global.MiniAppFrame.syncTabbar();
    }
    if (global.WHEmergencyMaterialPage && global.WHEmergencyMaterialPage.boot) {
      global.WHEmergencyMaterialPage.boot({ mobile: true });
    }
    patchViewNav();
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
