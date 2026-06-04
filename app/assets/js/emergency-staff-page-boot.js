/**
 * 移动端应急人员启动
 */
(function (global) {
  "use strict";

  function resolveAssetHome() {
    return "../home.html";
  }

  function updateNavTitle(text) {
    var el = global.document.getElementById("staff-nav-title");
    if (el) el.textContent = text || "应急人员";
  }

  function bindNavBack() {
    global.document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action='mp-nav-back']");
      if (!btn) return;
      var form = global.document.getElementById("staff-form-view");
      var detail = global.document.getElementById("staff-detail-view");
      var list = global.document.getElementById("staff-list-view");
      if (form && !form.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHEmergencyStaffPage && typeof global.WHEmergencyStaffPage.showList === "function") {
          global.WHEmergencyStaffPage.showList();
        }
        return;
      }
      if (detail && !detail.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHEmergencyStaffPage && typeof global.WHEmergencyStaffPage.showList === "function") {
          global.WHEmergencyStaffPage.showList();
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
    var listEl = global.document.getElementById("staff-list-view");
    var detailEl = global.document.getElementById("staff-detail-view");
    var formEl = global.document.getElementById("staff-form-view");
    if (!listEl) return;

    function sync() {
      if (formEl && !formEl.classList.contains("hidden")) {
        var titleEl = global.document.getElementById("staff-form-title");
        updateNavTitle(titleEl && titleEl.textContent ? titleEl.textContent : "编辑应急人员");
        return;
      }
      if (detailEl && !detailEl.classList.contains("hidden")) {
        var nameEl = global.document.getElementById("detail-staff-title");
        updateNavTitle(nameEl && nameEl.textContent ? nameEl.textContent : "应急人员详情");
        return;
      }
      updateNavTitle("应急人员");
    }

    [listEl, detailEl, formEl].forEach(function (node) {
      if (!node) return;
      var observer = new MutationObserver(sync);
      observer.observe(node, { attributes: true, attributeFilter: ["class"] });
    });
    global.addEventListener("wh-staff-view-change", sync);
    sync();
  }

  function start() {
    bindNavBack();
    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
      global.MiniAppFrame.syncTabbar();
    }
    if (global.WHEmergencyStaffPage && global.WHEmergencyStaffPage.boot) {
      global.WHEmergencyStaffPage.boot({ mobile: true });
    }
    patchViewNav();
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
