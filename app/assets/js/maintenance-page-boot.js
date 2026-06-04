/**
 * 移动端维修与检修记录启动
 */
(function (global) {
  "use strict";

  function resolveAssetHome() {
    return "../home.html";
  }

  function updateNavTitle(text) {
    var el = global.document.getElementById("maintenance-nav-title");
    if (el) el.textContent = text || "维修与检修记录";
  }

  function bindNavBack() {
    global.document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action='mp-nav-back']");
      if (!btn) return;
      var form = global.document.getElementById("maintenance-form-view");
      var detail = global.document.getElementById("maintenance-detail-view");
      var list = global.document.getElementById("maintenance-list-view");
      if (form && !form.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHMaintenancePage && typeof global.WHMaintenancePage.showList === "function") {
          global.WHMaintenancePage.showList();
        }
        return;
      }
      if (detail && !detail.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHMaintenancePage && typeof global.WHMaintenancePage.showList === "function") {
          global.WHMaintenancePage.showList();
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
    var listEl = global.document.getElementById("maintenance-list-view");
    var detailEl = global.document.getElementById("maintenance-detail-view");
    var formEl = global.document.getElementById("maintenance-form-view");
    if (!listEl) return;

    function sync() {
      if (formEl && !formEl.classList.contains("hidden")) {
        var titleEl = global.document.getElementById("maintenance-form-title");
        updateNavTitle(titleEl && titleEl.textContent ? titleEl.textContent : "编辑维修记录");
        return;
      }
      if (detailEl && !detailEl.classList.contains("hidden")) {
        var nameEl = global.document.getElementById("detail-maintenance-title");
        updateNavTitle(nameEl && nameEl.textContent ? nameEl.textContent : "维修记录详情");
        return;
      }
      updateNavTitle("维修与检修记录");
    }

    [listEl, detailEl, formEl].forEach(function (node) {
      if (!node) return;
      var observer = new MutationObserver(sync);
      observer.observe(node, { attributes: true, attributeFilter: ["class"] });
    });
    global.addEventListener("wh-maintenance-view-change", sync);
    sync();
  }

  function start() {
    bindNavBack();
    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
      global.MiniAppFrame.syncTabbar();
    }
    if (global.WHMaintenancePage && global.WHMaintenancePage.boot) {
      global.WHMaintenancePage.boot({ mobile: true });
    }
    patchViewNav();
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
