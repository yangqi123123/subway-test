/**
 * 巡查模块移动端 — 通用导航启动工厂
 */
(function (global) {
  "use strict";

  function createPatrolBoot(config) {
    config = config || {};
    var prefix = config.prefix || "patrol";
    var defaultTitle = config.defaultTitle || "巡查";
    var pageGlobal = config.pageGlobal || "WHInPatrolPage";
    var formViewId = prefix + "-form-view";
    var detailViewId = prefix + "-detail-view";
    var listViewId = prefix + "-list-view";
    var navTitleId = config.navTitleId || prefix + "-nav-title";
    var formTitleId = prefix + "-form-title";
    var detailTitleId = "detail-" + prefix + "-title";
    var viewChangeEvent = config.viewChangeEvent || "wh-" + prefix + "-view-change";
    var homeHref = config.homeHref || "../home.html";

    function updateNavTitle(text) {
      var el = global.document.getElementById(navTitleId);
      if (el) el.textContent = text || defaultTitle;
    }

    function bindNavBack() {
      global.document.addEventListener("click", function (event) {
        var btn = event.target.closest("[data-action='mp-nav-back']");
        if (!btn) return;
        var api = global[pageGlobal];
        var form = global.document.getElementById(formViewId);
        var detail = global.document.getElementById(detailViewId);
        var list = global.document.getElementById(listViewId);
        if (form && !form.classList.contains("hidden")) {
          event.preventDefault();
          event.stopPropagation();
          if (api && typeof api.showList === "function") api.showList();
          return;
        }
        if (detail && !detail.classList.contains("hidden")) {
          event.preventDefault();
          event.stopPropagation();
          if (api && typeof api.showList === "function") api.showList();
          return;
        }
        if (list && !list.classList.contains("hidden")) {
          event.preventDefault();
          event.stopPropagation();
          global.location.href = homeHref;
        }
      });
    }

    function patchViewNav() {
      var listEl = global.document.getElementById(listViewId);
      var detailEl = global.document.getElementById(detailViewId);
      var formEl = global.document.getElementById(formViewId);
      if (!listEl) return;

      function sync() {
        if (formEl && !formEl.classList.contains("hidden")) {
          var titleEl = global.document.getElementById(formTitleId);
          updateNavTitle(titleEl && titleEl.textContent ? titleEl.textContent : defaultTitle);
          return;
        }
        if (detailEl && !detailEl.classList.contains("hidden")) {
          var nameEl = global.document.getElementById(detailTitleId);
          updateNavTitle(nameEl && nameEl.textContent ? nameEl.textContent : defaultTitle + "详情");
          return;
        }
        updateNavTitle(defaultTitle);
      }

      [listEl, detailEl, formEl].forEach(function (node) {
        if (!node) return;
        var observer = new MutationObserver(sync);
        observer.observe(node, { attributes: true, attributeFilter: ["class"] });
      });
      global.addEventListener(viewChangeEvent, sync);
      sync();
    }

    return function start(bootFn) {
      bindNavBack();
      if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
        global.MiniAppFrame.syncTabbar();
      }
      if (typeof bootFn === "function") bootFn({ mobile: true });
      patchViewNav();
    };
  }

  global.WHPatrolRecordBoot = { create: createPatrolBoot };
})(window);
