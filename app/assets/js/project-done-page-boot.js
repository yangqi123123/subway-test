/**
 * 移动端完工项目：复用 WHInProjectPage（module=done）
 */
(function (global) {
  "use strict";

  var LIST_TITLE = "完工项目";

  function resolvePatrolPage() {
    if (typeof global.whResolveWebPage === "function") {
      return global.whResolveWebPage("wb/in-project-patrol.html");
    }
    var base = global.__WH_GIS_ASSETS_BASE || "";
    if (base) {
      return base.replace(/\/assets\/?$/, "/web/wb/in-project-patrol.html");
    }
    return "../../../web/wb/in-project-patrol.html";
  }

  function updateNavTitle(text) {
    var el = global.document.getElementById("project-nav-title");
    if (el) el.textContent = text || LIST_TITLE;
  }

  function resolvePatrolHome() {
    return "../home.html";
  }

  function bindNavBack() {
    global.document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action='mp-nav-back']");
      if (!btn) return;
      var detail = global.document.getElementById("project-detail-view");
      var patrol = global.document.getElementById("project-patrol-view");
      var list = global.document.getElementById("project-list-view");
      if (detail && !detail.classList.contains("hidden")) {
        event.preventDefault();
        var back = global.document.querySelector("[data-action='back-list']");
        if (back) back.click();
        return;
      }
      if (patrol && !patrol.classList.contains("hidden")) {
        event.preventDefault();
        var back2 = global.document.querySelector("[data-action='back-list']");
        if (back2) back2.click();
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
    var listEl = global.document.getElementById("project-list-view");
    var detailEl = global.document.getElementById("project-detail-view");
    var patrolEl = global.document.getElementById("project-patrol-view");
    if (!listEl || !detailEl) return;

    function sync() {
      if (patrolEl && !patrolEl.classList.contains("hidden")) {
        updateNavTitle("项目巡查");
        return;
      }
      if (!detailEl.classList.contains("hidden")) {
        var mode = detailEl.getAttribute("data-project-mode") || "detail";
        if (mode === "edit") {
          updateNavTitle("编辑完工项目");
          return;
        }
        var nameEl = global.document.getElementById("proj-name");
        updateNavTitle(nameEl && nameEl.value ? nameEl.value : "完工项目详情");
        return;
      }
      updateNavTitle(LIST_TITLE);
    }

    var observer = new MutationObserver(sync);
    [listEl, detailEl, patrolEl].forEach(function (node) {
      if (node) observer.observe(node, { attributes: true, attributeFilter: ["class", "data-project-mode"] });
    });
    global.addEventListener("wh-project-view-change", sync);
    sync();
  }

  function tryBoot() {
    if (typeof global.whApplyGisAssetPaths === "function") {
      global.whApplyGisAssetPaths();
    }
    if (!global.WHInProjectPage || typeof global.WHInProjectPage.boot !== "function") {
      console.warn("[project-done-page] 未找到 WHInProjectPage");
      return;
    }
    try {
      global.WHInProjectPage.boot({
        mobile: true,
        module: "done",
        patrolPage: resolvePatrolPage(),
        searchPage: "project-search.html?module=done",
        listPage: "project-done.html",
      });
      patchViewNav();
      global.dispatchEvent(new Event("wh-project-mobile-ready"));
    } catch (err) {
      console.warn("[project-done-page]", err && err.message ? err.message : err);
    }
  }

  function start() {
    bindNavBack();
    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
      global.MiniAppFrame.syncTabbar();
    }
    tryBoot();
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
