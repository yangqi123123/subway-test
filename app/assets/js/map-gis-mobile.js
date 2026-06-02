/**
 * 移动端全景 GIS — 图层底栏、底图切换、弹窗与遮罩
 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var root = document.getElementById("page-root");
    var filterPanel = document.querySelector(".gis-filter-panel");
    var overlay = document.getElementById("gis-mobile-overlay");
    var layerFab = document.getElementById("gis-mobile-layer-btn");
    var baseFab = document.getElementById("gis-mobile-base-btn");
    var detailPanel = document.getElementById("gis-detail-panel");
    var whPanel = document.getElementById("gis-wh-panel");
    var detailClose = document.getElementById("gis-detail-close");
    var whClose = document.getElementById("gis-wh-close");

    if (!root || !filterPanel) return;

    filterPanel.classList.add("gis-mobile-drawer-closed");

    function syncOverlay() {
      var layerOpen = !filterPanel.classList.contains("gis-mobile-drawer-closed");
      var detailOpen = detailPanel && !detailPanel.classList.contains("hidden");
      var whOpen = whPanel && !whPanel.classList.contains("hidden");
      var sheetOpen = layerOpen || detailOpen || whOpen;
      /* 仓库列表单独展示时不铺遮罩；详情/图层筛选关闭后同步去掉遮罩 */
      var showOverlay = layerOpen || detailOpen;
      if (overlay) overlay.classList.toggle("is-open", showOverlay);
      document.body.classList.toggle("gis-mobile-drawer-open", sheetOpen);
    }

    function closeLayer() {
      filterPanel.classList.add("gis-mobile-drawer-closed");
      if (layerFab) layerFab.setAttribute("aria-expanded", "false");
      syncOverlay();
    }

    function closeDetail() {
      if (detailPanel) detailPanel.classList.add("hidden");
      syncOverlay();
    }

    function closeWarehouseList() {
      if (whPanel) whPanel.classList.add("hidden");
      syncOverlay();
    }

    function closeAll() {
      closeLayer();
      closeDetail();
      closeWarehouseList();
    }

    function setDrawerOpen(open) {
      if (open) {
        if (detailPanel) detailPanel.classList.add("hidden");
        if (whPanel) whPanel.classList.add("hidden");
      }
      filterPanel.classList.toggle("gis-mobile-drawer-closed", !open);
      if (layerFab) layerFab.setAttribute("aria-expanded", open ? "true" : "false");
      syncOverlay();
      setTimeout(function () {
        window.dispatchEvent(new Event("resize"));
      }, 300);
    }

    function toggleDrawer() {
      var open = filterPanel.classList.contains("gis-mobile-drawer-closed");
      setDrawerOpen(open);
    }

    if (layerFab) {
      layerFab.addEventListener("click", toggleDrawer);
    }

    if (overlay) {
      overlay.addEventListener("click", closeAll);
    }

    document.querySelectorAll("[data-mobile-drawer-close]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        setDrawerOpen(false);
      });
    });

    if (detailClose) {
      detailClose.addEventListener("click", function () {
        setTimeout(syncOverlay, 0);
      });
    }

    if (whClose) {
      whClose.addEventListener("click", function () {
        setTimeout(syncOverlay, 0);
      });
    }

    if (baseFab) {
      baseFab.addEventListener("click", function () {
        var toolBase = document.querySelector('[data-tool="base"]');
        if (toolBase) toolBase.click();
      });
    }

    function watchPanel(panel, onOpen) {
      if (!panel || typeof MutationObserver === "undefined") return;
      var obs = new MutationObserver(function () {
        var open = !panel.classList.contains("hidden");
        if (open && typeof onOpen === "function") {
          onOpen();
        }
        syncOverlay();
      });
      obs.observe(panel, { attributes: true, attributeFilter: ["class"] });
    }

    watchPanel(detailPanel, function () {
      closeLayer();
    });

    watchPanel(whPanel, function () {
      closeLayer();
      if (detailPanel) detailPanel.classList.add("hidden");
    });

    function bumpMapSize() {
      window.dispatchEvent(new Event("resize"));
    }

    function onMapReady() {
      bumpMapSize();
      [80, 280, 600, 1200].forEach(function (ms) {
        setTimeout(bumpMapSize, ms);
      });
    }

    function waitForLeafletMap() {
      var timer = setInterval(function () {
        var el = document.getElementById("map-container");
        if (el && el.querySelector(".leaflet-container")) {
          clearInterval(timer);
          onMapReady();
        }
      }, 100);
    }

    window.addEventListener("wh-gis-ready", onMapReady);

    var mapWrap = document.querySelector(".gis-mobile-map-wrap");
    if (mapWrap && typeof ResizeObserver !== "undefined") {
      new ResizeObserver(bumpMapSize).observe(mapWrap);
    }

    var layerObs = new MutationObserver(function () {
      var layerOpen = !filterPanel.classList.contains("gis-mobile-drawer-closed");
      if (layerOpen) {
        if (detailPanel) detailPanel.classList.add("hidden");
        if (whPanel) whPanel.classList.add("hidden");
      }
      syncOverlay();
    });
    layerObs.observe(filterPanel, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("load", waitForLeafletMap);
    waitForLeafletMap();
    syncOverlay();
  });
})();
