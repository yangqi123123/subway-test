/**
 * 移动端告警信息启动
 */
(function (global) {
  "use strict";

  function resolvePatrolHome() {
    return "../home.html";
  }

  function updateNavTitle(text) {
    var el = global.document.getElementById("patrol-alerts-nav-title");
    if (el) el.textContent = text || "告警信息";
  }

  function isAlertDetailModalOpen() {
    var mask = global.document.getElementById("wh-alert-detail-modal-mask");
    return !!(mask && mask.classList.contains("show"));
  }

  function bindNavBack() {
    global.document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action='mp-nav-back']");
      if (!btn) return;

      var reviewMask = global.document.getElementById("expert-review-modal-mask");
      if (reviewMask && reviewMask.classList.contains("show")) {
        event.preventDefault();
        event.stopPropagation();
        var reviewClose = reviewMask.querySelector("[data-action='close-review-modal']");
        if (reviewClose) reviewClose.click();
        return;
      }

      var auditMask = global.document.getElementById("alert-audit-modal-mask");
      if (auditMask && auditMask.classList.contains("show")) {
        event.preventDefault();
        event.stopPropagation();
        var auditClose = auditMask.querySelector("[data-action='close-audit-modal']");
        if (auditClose) auditClose.click();
        return;
      }

      if (isAlertDetailModalOpen()) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHMapAlerts && typeof global.WHMapAlerts.closeDetail === "function") {
          global.WHMapAlerts.closeDetail();
        }
        return;
      }

      var uavDetail = global.document.getElementById("patrol-alerts-uav-detail-view");
      var list = global.document.getElementById("patrol-alerts-list-view");
      if (uavDetail && !uavDetail.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHMapAlertsMobile && typeof global.WHMapAlertsMobile.showList === "function") {
          global.WHMapAlertsMobile.showList();
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
    var listEl = global.document.getElementById("patrol-alerts-list-view");
    var uavDetailEl = global.document.getElementById("patrol-alerts-uav-detail-view");
    if (!listEl) return;

    function sync() {
      if (isAlertDetailModalOpen()) {
        var titleEl = global.document.getElementById("wh-alert-detail-title");
        updateNavTitle(titleEl && titleEl.textContent ? titleEl.textContent : "告警详情");
        return;
      }
      if (uavDetailEl && !uavDetailEl.classList.contains("hidden")) {
        var nameEl = global.document.getElementById("detail-uav-alert-title");
        updateNavTitle(nameEl && nameEl.textContent ? nameEl.textContent : "告警详情");
        return;
      }
      updateNavTitle("告警信息");
    }

    [listEl, uavDetailEl].forEach(function (node) {
      if (!node) return;
      var observer = new MutationObserver(sync);
      observer.observe(node, { attributes: true, attributeFilter: ["class"] });
    });
    var detailMask = global.document.getElementById("wh-alert-detail-modal-mask");
    if (detailMask) {
      var maskObserver = new MutationObserver(sync);
      maskObserver.observe(detailMask, { attributes: true, attributeFilter: ["class"] });
    }
    global.addEventListener("wh-patrol-alerts-view-change", sync);
    sync();
  }

  function initPickers() {
    var sheet = global.document.getElementById("patrol-alerts-filter-sheet");
    if (!sheet || !global.WHProjectMobile || !global.WHProjectMobile.enhanceSelectFields) return;
    global.WHProjectMobile.enhanceSelectFields(sheet);
  }

  function start() {
    bindNavBack();
    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
      global.MiniAppFrame.syncTabbar();
    }
    initPickers();
    if (global.WHMapAlertsMobilePage && global.WHMapAlertsMobilePage.boot) {
      global.WHMapAlertsMobilePage.boot();
    }
    patchViewNav();
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
