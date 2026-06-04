/**
 * 移动端应急仓库启动
 */
(function (global) {
  "use strict";

  function resolveAssetHome() {
    return "../home.html";
  }

  function updateNavTitle(text) {
    var el = global.document.getElementById("warehouse-nav-title");
    if (el) el.textContent = text || "应急仓库";
  }

  function bindNavBack() {
    global.document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action='mp-nav-back']");
      if (!btn) return;
      var form = global.document.getElementById("warehouse-form-view");
      var detail = global.document.getElementById("warehouse-detail-view");
      var list = global.document.getElementById("warehouse-list-view");
      if (form && !form.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHEmergencyWarehousePage && typeof global.WHEmergencyWarehousePage.showList === "function") {
          global.WHEmergencyWarehousePage.showList();
        }
        return;
      }
      if (detail && !detail.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHEmergencyWarehousePage && typeof global.WHEmergencyWarehousePage.showList === "function") {
          global.WHEmergencyWarehousePage.showList();
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
    var listEl = global.document.getElementById("warehouse-list-view");
    var detailEl = global.document.getElementById("warehouse-detail-view");
    var formEl = global.document.getElementById("warehouse-form-view");
    if (!listEl) return;

    function sync() {
      if (formEl && !formEl.classList.contains("hidden")) {
        var titleEl = global.document.getElementById("warehouse-form-title");
        updateNavTitle(titleEl && titleEl.textContent ? titleEl.textContent : "编辑应急仓库");
        return;
      }
      if (detailEl && !detailEl.classList.contains("hidden")) {
        var nameEl = global.document.getElementById("detail-warehouse-title");
        updateNavTitle(nameEl && nameEl.textContent ? nameEl.textContent : "应急仓库详情");
        return;
      }
      updateNavTitle("应急仓库");
    }

    [listEl, detailEl, formEl].forEach(function (node) {
      if (!node) return;
      var observer = new MutationObserver(sync);
      observer.observe(node, { attributes: true, attributeFilter: ["class"] });
    });
    global.addEventListener("wh-warehouse-view-change", sync);
    sync();
  }

  function start() {
    bindNavBack();
    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
      global.MiniAppFrame.syncTabbar();
    }
    if (global.WHEmergencyWarehousePage && global.WHEmergencyWarehousePage.boot) {
      global.WHEmergencyWarehousePage.boot({ mobile: true });
    }
    patchViewNav();
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
