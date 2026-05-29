const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function patch(file, replacements) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    console.warn("skip missing", file);
    return;
  }
  let s = fs.readFileSync(full, "utf8");
  let changed = false;
  replacements.forEach(function (r) {
    if (!s.includes(r.old)) {
      if (r.optional) return;
      console.warn("pattern not found in", file, r.old.slice(0, 80));
      return;
    }
    s = s.replace(r.old, r.new);
    changed = true;
  });
  if (changed) {
    fs.writeFileSync(full, s);
    console.log("patched", file);
  }
}

function amBind(tbodyId, findExpr) {
  return (
    "\n      function setupListRowClick() {\n" +
    "        if (!window.WHTableRowClick) return window.setTimeout(setupListRowClick, 40);\n" +
    "        WHTableRowClick.bindById(\"" +
    tbodyId +
    "\", {\n" +
    "          getRows: function () { return displayRows; },\n" +
    "          onOpen: function (row) {\n" +
    "            var idx = rows.findIndex(function (r) { return " +
    findExpr +
    "; });\n" +
    "            if (idx >= 0) openModal(\"edit\", idx);\n" +
    "          }\n" +
    "        });\n" +
    "      }\n" +
    "      setupListRowClick();\n"
  );
}

[
  ["web/wb/am-line.html", "line-table-body"],
  ["web/wb/am-station.html", "station-table-body"],
  ["web/wb/am-section.html", "section-table-body"],
  ["web/wb/am-emergency-staff.html", "staff-table-body"],
  ["web/wb/am-emergency-warehouse.html", "warehouse-table-body"],
].forEach(function (item) {
  patch(item[0], [
    {
      old: "      initQuickLinks();\n      renderRows();",
      new: "      initQuickLinks();" + amBind(item[1], "r.id === row.id") + "      renderRows();",
    },
  ]);
});

const patrolSetup =
  "\n      var lastRenderedList = [];\n" +
  "      function setupPatrolRowClick() {\n" +
  "        if (!window.WHTableRowClick) return window.setTimeout(setupPatrolRowClick, 40);\n" +
  "        WHTableRowClick.bindById(\"table-body\", {\n" +
  "          getRows: function () { return lastRenderedList; },\n" +
  "          onOpen: function (row, index) { showForm(\"edit\", index); }\n" +
  "        });\n" +
  "      }\n" +
  "      setupPatrolRowClick();\n";

patch("web/patrol/in-disease.html", [
  {
    old: "        updateDashboardStats(list);",
    new: "        lastRenderedList = list;\n        updateDashboardStats(list);",
  },
  {
    old: "      initQuickLinks();\n      renderRows();",
    new: patrolSetup + "      initQuickLinks();\n      renderRows();",
  },
]);

patch("web/patrol/in-night.html", [
  {
    old: "        updateDashboardStats();",
    new: "        lastRenderedList = rows;\n        updateDashboardStats();",
  },
  {
    old: "      initQuickLinks();\n      renderRows();",
    new: patrolSetup + "      initQuickLinks();\n      renderRows();",
  },
]);

patch("web/patrol/in-manual.html", [
  {
    old: "        updateDashboardStats();",
    new: "        lastRenderedList = rows;\n        updateDashboardStats();",
  },
  {
    old: "      initQuickLinks();\n      renderRows();",
    new: patrolSetup + "      initQuickLinks();\n      renderRows();",
  },
]);

patch("web/wb/in-project.html", [
  {
    old: "      initQuickLinks();\n      renderRows();",
    new:
      "      function setupProjectRowClick() {\n" +
      "        if (!window.WHTableRowClick) return window.setTimeout(setupProjectRowClick, 40);\n" +
      "        WHTableRowClick.bindById(\"project-table-body\", {\n" +
      "          onOpenByTr: function (tr) {\n" +
      "            var index = Number(tr.getAttribute(\"data-row\"));\n" +
      "            if (!Number.isNaN(index) && index >= 0) showProjectView(\"detail\");\n" +
      "          }\n" +
      "        });\n" +
      "      }\n" +
      "      initQuickLinks();\n" +
      "      setupProjectRowClick();\n" +
      "      renderRows();",
  },
]);

patch("web/wb/in-project-done.html", [
  {
    old: "      initQuickLinks();\n      renderRows();",
    new:
      "      function setupDoneRowClick() {\n" +
      "        if (!window.WHTableRowClick) return window.setTimeout(setupDoneRowClick, 40);\n" +
      "        WHTableRowClick.bindById(\"done-table-body\", {\n" +
      "          onOpenByTr: function (tr) {\n" +
      "            var index = Number(tr.getAttribute(\"data-row\"));\n" +
      "            if (!Number.isNaN(index) && index >= 0) showProjectView(\"detail\");\n" +
      "          }\n" +
      "        });\n" +
      "      }\n" +
      "      initQuickLinks();\n" +
      "      setupDoneRowClick();\n" +
      "      renderRows();",
  },
]);

patch("web/wb/in-track-person.html", [
  {
    old: "    initQuickLinks();\n    renderTable(trackRows);",
    new:
      "    function setupTrackRowClick() {\n" +
      "      if (!window.WHTableRowClick) return window.setTimeout(setupTrackRowClick, 40);\n" +
      "      WHTableRowClick.bindById(\"track-table-body\", {\n" +
      "        getRows: function () { return trackRows; },\n" +
      "        getIndex: function (tr) { return Number(tr.getAttribute(\"data-row-index\")); },\n" +
      "        onOpen: function (row) { openDetail(row.id); }\n" +
      "      });\n" +
      "    }\n" +
      "    initQuickLinks();\n" +
      "    setupTrackRowClick();\n" +
      "    renderTable(trackRows);",
  },
  {
    old: '        <tr style="background:${index % 2 === 0 ? \'var(--row-a)\' : \'var(--row-b)\'}">',
    new: '        <tr data-row-index="${index}" style="background:${index % 2 === 0 ? \'var(--row-a)\' : \'var(--row-b)\'}">',
  },
]);

patch("web/wb/in-score.html", [
  {
    old: "      initQuickLinks();\n      renderList();",
    new:
      "      function setupScoreRowClick() {\n" +
      "        if (!window.WHTableRowClick) return window.setTimeout(setupScoreRowClick, 40);\n" +
      "        WHTableRowClick.bindById(\"score-table-body\", {\n" +
      "          getRows: function () { return listRows; },\n" +
      "          onOpen: function (row) { openDetail(row.device); }\n" +
      "        });\n" +
      "      }\n" +
      "      initQuickLinks();\n" +
      "      setupScoreRowClick();\n" +
      "      renderList();",
  },
]);

patch("web/wb/am-flight-log.html", [
  {
    old: '        <tr style="background:${index % 2 === 0 ? "rgba(12,24,48,0.45)" : "rgba(15,32,58,0.55)"}">',
    new: '        <tr data-id="${item.id}" style="background:${index % 2 === 0 ? "rgba(12,24,48,0.45)" : "rgba(15,32,58,0.55)"}">',
  },
  {
    old: "    initQuickLinks();\n    renderTable();",
    new:
      "    function setupFlightLogRowClick() {\n" +
      "      if (!window.WHTableRowClick) return window.setTimeout(setupFlightLogRowClick, 40);\n" +
      "      WHTableRowClick.bindById(\"table-body\", {\n" +
      "        onOpenByTr: function (tr) {\n" +
      "          var id = tr.getAttribute(\"data-id\");\n" +
      "          if (id) showDetail(id);\n" +
      "        }\n" +
      "      });\n" +
      "    }\n" +
      "    initQuickLinks();\n" +
      "    setupFlightLogRowClick();\n" +
      "    renderTable();",
  },
]);

patch("web/wb/am-maintenance.html", [
  {
    old: '        <tr style="background:${index % 2 === 0 ? "rgba(12,24,48,0.45)" : "rgba(15,32,58,0.55)"}">',
    new: '        <tr data-id="${item.id}" style="background:${index % 2 === 0 ? "rgba(12,24,48,0.45)" : "rgba(15,32,58,0.55)"}">',
  },
  {
    old: "    initQuickLinks();\n    renderTable();",
    new:
      "    function setupMaintenanceRowClick() {\n" +
      "      if (!window.WHTableRowClick) return window.setTimeout(setupMaintenanceRowClick, 40);\n" +
      "      WHTableRowClick.bindById(\"table-body\", {\n" +
      "        onOpenByTr: function (tr) {\n" +
      "          var id = tr.getAttribute(\"data-id\");\n" +
      "          if (id) showDetail(id);\n" +
      "        }\n" +
      "      });\n" +
      "    }\n" +
      "    initQuickLinks();\n" +
      "    setupMaintenanceRowClick();\n" +
      "    renderTable();",
  },
]);

patch("web/wb/am-drone.html", [
  {
    old: "          return '<tr class=\"'+(i%2?'bg-slate-950/10':'bg-slate-950/22')+'\"><td class=\"px-4\">'+r.model+'</td>",
    new: "          return '<tr data-drone-sn=\"'+r.sn+'\" class=\"'+(i%2?'bg-slate-950/10':'bg-slate-950/22')+'\"><td class=\"px-4\">'+r.model+'</td>",
  },
  {
    old: "      initQuickLinks();\n      render(displayRows);",
    new:
      "      function setupDroneRowClick() {\n" +
      "        if (!window.WHTableRowClick) return window.setTimeout(setupDroneRowClick, 40);\n" +
      "        WHTableRowClick.bindById(\"table-body\", {\n" +
      "          onOpenByTr: function (tr) {\n" +
      "            var sn = tr.getAttribute(\"data-drone-sn\");\n" +
      "            if (!sn) return;\n" +
      "            var idx = rows.findIndex(function (r) { return r.sn === sn; });\n" +
      "            if (idx > -1 && window.WHDroneDetail) WHDroneDetail.open(rows[idx]);\n" +
      "          }\n" +
      "        });\n" +
      "      }\n" +
      "      initQuickLinks();\n" +
      "      setupDroneRowClick();\n" +
      "      render(displayRows);",
  },
]);

patch("web/wb/am-airport.html", [
  {
    old: "return '<tr class=\"'+(isAirport?'bg-slate-950/25':'bg-slate-950/10')+'\"><td class=\"px-4\">",
    new: "return '<tr data-row-index=\"'+index+'\" class=\"'+(isAirport?'bg-slate-950/25':'bg-slate-950/10')+'\"><td class=\"px-4\">",
  },
  {
    old: "      initQuickLinks();\n      render(rows);",
    new:
      "      function setupAirportRowClick() {\n" +
      "        if (!window.WHTableRowClick) return window.setTimeout(setupAirportRowClick, 40);\n" +
      "        WHTableRowClick.bindById(\"table-body\", {\n" +
      "          onOpenByTr: function (tr) {\n" +
      "            var idx = Number(tr.getAttribute(\"data-row-index\"));\n" +
      "            if (!Number.isNaN(idx) && idx >= 0) showDetail(idx);\n" +
      "          }\n" +
      "        });\n" +
      "      }\n" +
      "      initQuickLinks();\n" +
      "      setupAirportRowClick();\n" +
      "      render(rows);",
  },
]);

console.log("done");
