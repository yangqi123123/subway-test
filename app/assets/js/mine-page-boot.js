/**
 * 移动端「我的」子页 — 导航返回与标题
 */
(function (global) {
  "use strict";

  function bindNavBack(homeHref, keepTabbar) {
    global.document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action='mp-nav-back']");
      if (!btn) return;
      var detail = global.document.getElementById("wb-detail-view");
      var approval = global.document.getElementById("wb-approval-view");
      if (detail && !detail.classList.contains("hidden")) {
        event.preventDefault();
        if (global.WHWorkbenchMobilePage && global.WHWorkbenchMobilePage.showList) {
          global.WHWorkbenchMobilePage.showList();
        } else if (global.WHNotifyMobilePage && global.WHNotifyMobilePage.showList) {
          global.WHNotifyMobilePage.showList();
        } else if (global.WHDoneMobilePage && global.WHDoneMobilePage.showList) {
          global.WHDoneMobilePage.showList();
        }
        return;
      }
      if (approval && !approval.classList.contains("hidden")) {
        event.preventDefault();
        if (global.WHWorkbenchMobilePage && global.WHWorkbenchMobilePage.showList) {
          global.WHWorkbenchMobilePage.showList();
        } else if (global.WHNotifyMobilePage && global.WHNotifyMobilePage.showList) {
          global.WHNotifyMobilePage.showList();
        } else if (global.WHDoneMobilePage && global.WHDoneMobilePage.showList) {
          global.WHDoneMobilePage.showList();
        }
        return;
      }
      var alertMask = global.document.getElementById("wh-alert-detail-modal-mask");
      if (alertMask && alertMask.classList.contains("show")) {
        event.preventDefault();
        if (global.WHMapAlerts && global.WHMapAlerts.closeDetail) {
          global.WHMapAlerts.closeDetail();
        }
        return;
      }
      event.preventDefault();
      global.location.href = homeHref || "../home.html";
    });
  }

  function patchWorkbenchNav(defaultTitle) {
    var listEl = global.document.getElementById("wb-list-view");
    var detailEl = global.document.getElementById("wb-detail-view");
    var approvalEl = global.document.getElementById("wb-approval-view");
    var titleEl = global.document.getElementById("wb-nav-title");
    if (!titleEl) return;

    function sync() {
      if (approvalEl && !approvalEl.classList.contains("hidden")) {
        var hiddenApproval = global.document.getElementById("detail-wb-title");
        titleEl.textContent = (hiddenApproval && hiddenApproval.textContent) || "飞行计划审批";
        return;
      }
      if (detailEl && !detailEl.classList.contains("hidden")) {
        var hidden = global.document.getElementById("detail-wb-title");
        titleEl.textContent = (hidden && hidden.textContent) || "详情";
        return;
      }
      titleEl.textContent = defaultTitle || titleEl.textContent;
    }

    [listEl, detailEl, approvalEl].forEach(function (node) {
      if (!node) return;
      var obs = new MutationObserver(sync);
      obs.observe(node, { attributes: true, attributeFilter: ["class"] });
    });
    global.addEventListener("wh-wb-view-change", sync);
    sync();
  }

  function start(options) {
    options = options || {};
    bindNavBack(options.homeHref || "../home.html", options.keepTabbar);
    if (options.navTitle) patchWorkbenchNav(options.navTitle);
    if (global.document.body.dataset.keepTabbar === "true" || options.keepTabbar) {
      if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
        global.MiniAppFrame.syncTabbar();
      }
      return;
    }
    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
      global.MiniAppFrame.syncTabbar();
    }
  }

  global.MinePageBoot = { start: start };
})(window);
