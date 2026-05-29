/**
 * 无人机巡查记录 — 查看/下载报告复用 WHFlightReportModal
 */
(function (global) {
  var PATROL_ROWS = [
    {
      taskId: "FL20251225001",
      planId: 1,
      line: "8号线",
      section: "徐东~梨园",
      projectName: "项目1、项目2、项目3",
      projectNames: ["项目1", "项目2", "项目3"],
      deviceName: "车辆段无人机 M350",
      taskType: "自动执行计划/临时任务",
      planName: "8号线车辆段常规巡检",
      route: "车辆段日常巡查航线",
      airport: "车辆段机场",
      takeoff: "2025-12-25 10:00",
      landing: "2025-12-25 18:15",
      operator: "张三",
      alarmCount: 2,
    },
    {
      taskId: "FL20251224008",
      planId: 4,
      line: "5号线",
      section: "青山站—工业四路",
      projectName: "青山站保护区巡查",
      deviceName: "青山巡检无人机 M350",
      taskType: "常规巡检",
      planName: "青山站周期巡检",
      route: "青山站周期巡检航线",
      airport: "青山机场",
      takeoff: "2025-12-24 09:02",
      landing: "2025-12-24 09:38",
      operator: "赵六",
      alarmCount: 1,
    },
  ];

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
    });
  }

  function toast(text) {
    var old = document.getElementById("uav-report-toast");
    if (old) old.remove();
    var node = document.createElement("div");
    node.id = "uav-report-toast";
    node.className =
      "fixed right-5 bottom-5 z-[100] rounded bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg";
    node.textContent = text;
    document.body.appendChild(node);
    setTimeout(function () {
      node.remove();
    }, 1800);
  }

  function findRow(taskId) {
    return PATROL_ROWS.find(function (r) {
      return r.taskId === taskId;
    });
  }

  function planFromPatrol(row) {
    if (!row) return null;
    return {
      id: row.planId,
      taskId: row.taskId,
      name: row.planName,
      route: row.route,
      airport: row.airport,
      drone: row.deviceName,
      type: row.taskType,
      line: row.line,
      applicant: row.operator,
      actualStart: row.takeoff,
      actualEnd: row.landing,
      audit: "审核通过",
    };
  }

  function showPatrolReport(taskId) {
    var row = findRow(taskId);
    var plan = planFromPatrol(row);
    if (!plan || !global.WHFlightReportModal) {
      toast("暂无飞行报告数据");
      return;
    }
    WHFlightReportModal.open(plan, {
      editable: false,
      onSave: function () {
        toast("飞行报告补充说明已保存");
      },
      onExport: function () {
        toast("飞行报告 PDF 已导出");
      },
    });
  }

  function downloadPatrolReport(taskId) {
    var row = findRow(taskId);
    var plan = planFromPatrol(row);
    if (!plan || !global.WHFlightReportModal) {
      toast("暂无飞行报告数据");
      return;
    }
    WHFlightReportModal.exportReport(plan);
  }

  function updateDashboardStats() {
    var setText = function (id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = String(val);
    };
    var now = new Date();
    var monthKey =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0");
    setText("stat-total", PATROL_ROWS.length);
    setText(
      "stat-month",
      PATROL_ROWS.filter(function (r) {
        return r.takeoff && String(r.takeoff).indexOf(monthKey) === 0;
      }).length
    );
    setText(
      "stat-alarm",
      PATROL_ROWS.filter(function (r) {
        return (r.alarmCount || 0) > 0;
      }).length
    );
    setText(
      "stat-normal",
      PATROL_ROWS.filter(function (r) {
        return (r.alarmCount || 0) === 0;
      }).length
    );
    setText("table-total", PATROL_ROWS.length);
  }

  function initQuickLinks() {
    document.querySelectorAll(".disease-quick-link[data-quick-href]").forEach(function (anchor) {
      var target = anchor.getAttribute("data-quick-href");
      if (target && typeof whPageHref === "function") {
        anchor.setAttribute("href", whPageHref(target));
      }
    });
  }

  function renderTable() {
    var tbody = document.getElementById("uav-report-tbody");
    if (!tbody) return;
    updateDashboardStats();
    tbody.innerHTML = PATROL_ROWS.map(function (row, index) {
      return (
        '<tr class="wh-row-open ' +
        (index % 2 === 0 ? "bg-slate-950/25" : "bg-slate-950/40") +
        '" data-task-id="' +
        esc(row.taskId) +
        '">' +
        '<td class="px-3 text-slate-100/95 leading-relaxed">' +
        esc(row.taskId) +
        "</td>" +
        '<td class="px-3 text-slate-100/95">' +
        esc(row.line) +
        "</td>" +
        '<td class="px-3 text-slate-100/95">' +
        esc(row.section) +
        "</td>" +
        '<td class="px-3 text-slate-100/95">' +
        esc(row.projectName) +
        "</td>" +
        '<td class="px-3 leading-relaxed"><a class="uav-link" href="' +
        (typeof whPageHref === "function" ? whPageHref("wb/am-drone.html") : "../wb/am-drone.html") +
        '">' +
        esc(row.deviceName) +
        "</a></td>" +
        '<td class="px-3 text-slate-100/95">' +
        esc(row.taskType) +
        "</td>" +
        '<td class="px-3">' +
        (global.WHPatrolMediaGallery
          ? WHPatrolMediaGallery.renderCell({
              kind: "photo",
              projectName: row.projectName,
              projectNames: row.projectNames,
              rowKey: row.taskId,
              previewCount: 2,
            })
          : "") +
        "</td>" +
        '<td class="px-3">' +
        (global.WHPatrolMediaGallery
          ? WHPatrolMediaGallery.renderCell({
              kind: "video",
              projectName: row.projectName,
              projectNames: row.projectNames,
              rowKey: row.taskId,
              previewCount: 2,
            })
          : "") +
        "</td>" +
        '<td class="px-3 leading-relaxed"><a class="uav-link" href="' +
        (typeof whPageHref === "function" ? whPageHref("map/map-flight-plan.html") : "../map/map-flight-plan.html") +
        '">' +
        esc(row.planName) +
        "</a></td>" +
        '<td class="px-3 text-slate-100/95 whitespace-nowrap">' +
        esc(row.takeoff) +
        "</td>" +
        '<td class="px-3 text-slate-100/95 whitespace-nowrap">' +
        esc(row.landing) +
        "</td>" +
        '<td class="px-3 text-slate-100/95">' +
        esc(row.operator) +
        "</td>" +
        '<td class="px-3 text-slate-100/95">' +
        esc(row.alarmCount) +
        "</td>" +
        '<td class="px-3 disease-col-actions">' +
        '<div class="disease-op-actions">' +
        '<button type="button" class="uav-link bg-transparent border-0 p-0" data-uav-report="' +
        esc(row.taskId) +
        '">查看报告</button>' +
        '<button type="button" class="uav-link bg-transparent border-0 p-0" data-uav-download="' +
        esc(row.taskId) +
        '">下载报告</button>' +
        "</div></td></tr>"
      );
    }).join("");
  }

  function bindTable() {
    var tbody = document.getElementById("uav-report-tbody");
    if (!tbody || tbody.dataset.whRowClickBound) return;
    tbody.dataset.whRowClickBound = "1";
    tbody.classList.add("wh-row-open-tbody");
    if (window.WHTableRowClick) WHTableRowClick.injectStyles();
    tbody.addEventListener("click", function (e) {
      var reportBtn = e.target.closest("[data-uav-report]");
      if (reportBtn) {
        e.preventDefault();
        showPatrolReport(reportBtn.getAttribute("data-uav-report"));
        return;
      }
      var dlBtn = e.target.closest("[data-uav-download]");
      if (dlBtn) {
        e.preventDefault();
        downloadPatrolReport(dlBtn.getAttribute("data-uav-download"));
        return;
      }
      if (e.target.closest("a, button, input, .disease-col-actions")) return;
      var tr = e.target.closest("tr[data-task-id]");
      if (tr) showPatrolReport(tr.getAttribute("data-task-id"));
    });
  }

  function init() {
    initQuickLinks();
    renderTable();
    bindTable();
    if (global.WHPatrolMediaGallery) {
      WHPatrolMediaGallery.bind(document.getElementById("page-root") || document);
    }
  }

  global.WHUavPatrolReport = {
    showReport: showPatrolReport,
    downloadReport: downloadPatrolReport,
    init: init,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
