/**
 * One-off: set data-top on HTML pages for new menu structure (UTF-8).
 * Run: node scripts/patch-menu-tops.js
 */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

function patchFile(name, from, to) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) return;
  let t = fs.readFileSync(p, "utf8");
  const t2 = t.split(from).join(to);
  if (t2 !== t) fs.writeFileSync(p, t2, "utf8");
}

function patchGlob(pred, from, to) {
  for (const f of fs.readdirSync(root)) {
    if (!f.endsWith(".html")) continue;
    if (pred && !pred(f)) continue;
    patchFile(f, from, to);
  }
}

patchGlob((f) => f.startsWith("am-"), 'data-top="am"', 'data-top="wb"');
patchFile("dc-library.html", 'data-top="dc"', 'data-top="wb"');
["dc-line-stats.html", "dc-drone-stats.html", "dc-system-stats.html"].forEach((n) =>
  patchFile(n, 'data-top="dc"', 'data-top="st"')
);

const patrolPages = new Set([
  "in-disease.html",
  "in-night.html",
  "in-uav-report.html",
  "in-manual.html",
]);
for (const f of fs.readdirSync(root)) {
  if (!f.startsWith("in-") || !f.endsWith(".html")) continue;
  const to = patrolPages.has(f) ? 'data-top="patrol"' : 'data-top="wb"';
  patchFile(f, 'data-top="in"', to);
}

["map-flight-plan.html", "map-routes.html", "map-cockpit-prep.html", "map-cockpit-fly.html"].forEach((n) =>
  patchFile(n, 'data-top="map"', 'data-top="cockpit"')
);

console.log("patch-menu-tops: ok");
