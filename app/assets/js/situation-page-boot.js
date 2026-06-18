/**
 * Mobile situation awareness page boot.
 */
(function (global) {
  "use strict";

  function resolvePatrolHome() {
    return "../../patrol/home.html";
  }

  function updateStats() {
    var rows = (global.WuhanSituationGIS && global.WuhanSituationGIS.ALARM_ROWS) || [];
    var reviewed = 0;
    var pending = 0;
    var areas = {};

    rows.forEach(function (row) {
      if (String(row.status || "").indexOf("\u672a\u590d\u6838") >= 0) pending += 1;
      else reviewed += 1;
      if (row.location) {
        var areaKey = row.location.split(" ")[0];
        if (areaKey) areas[areaKey] = true;
      }
    });

    function setText(id, val) {
      var el = global.document.getElementById(id);
      if (el) el.textContent = String(val);
    }

    setText("situation-stat-total", rows.length);
    setText("situation-stat-pending", pending);
    setText("situation-stat-reviewed", reviewed);
    setText("situation-stat-lines", Object.keys(areas).length);
  }

  function bindBack() {
    global.document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action='mp-nav-back']");
      if (!btn) return;
      event.preventDefault();
      event.stopPropagation();
      global.location.href = resolvePatrolHome();
    });
  }

  function start() {
    bindBack();
    updateStats();
    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
      global.MiniAppFrame.syncTabbar();
    }
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);
