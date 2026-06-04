/**
 * 移动端夜班作业启动
 */
(function (global) {
  "use strict";

  function resolvePatrolHome() {
    return "../home.html";
  }

  function updateNavTitle(text) {
    var el = global.document.getElementById("night-nav-title");
    if (el) el.textContent = text || "夜班作业";
  }

  function bindNavBack() {
    global.document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action='mp-nav-back']");
      if (!btn) return;
      var form = global.document.getElementById("night-form-view");
      var detail = global.document.getElementById("night-detail-view");
      var list = global.document.getElementById("night-list-view");
      if (form && !form.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHInNightPage && typeof global.WHInNightPage.showList === "function") {
          global.WHInNightPage.showList();
        }
        return;
      }
      if (detail && !detail.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHInNightPage && typeof global.WHInNightPage.showList === "function") {
          global.WHInNightPage.showList();
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
    var listEl = global.document.getElementById("night-list-view");
    var detailEl = global.document.getElementById("night-detail-view");
    var formEl = global.document.getElementById("night-form-view");
    if (!listEl) return;

    function sync() {
      if (formEl && !formEl.classList.contains("hidden")) {
        var titleEl = global.document.getElementById("night-form-title");
        updateNavTitle(titleEl && titleEl.textContent ? titleEl.textContent : "编辑夜班作业");
        return;
      }
      if (detailEl && !detailEl.classList.contains("hidden")) {
        var nameEl = global.document.getElementById("detail-night-title");
        updateNavTitle(nameEl && nameEl.textContent ? nameEl.textContent : "夜班作业详情");
        return;
      }
      updateNavTitle("夜班作业");
    }

    [listEl, detailEl, formEl].forEach(function (node) {
      if (!node) return;
      var observer = new MutationObserver(sync);
      observer.observe(node, { attributes: true, attributeFilter: ["class"] });
    });
    global.addEventListener("wh-night-view-change", sync);
    sync();
  }

  function start() {
    bindNavBack();
    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
      global.MiniAppFrame.syncTabbar();
    }
    if (global.WHInNightPage && global.WHInNightPage.boot) {
      global.WHInNightPage.boot({ mobile: true });
    }
    patchViewNav();
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
