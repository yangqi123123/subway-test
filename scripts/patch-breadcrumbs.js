/**
 * 面包屑一级模块名与顶部菜单对齐（UTF-8）。
 * Run: node scripts/patch-breadcrumbs.js
 */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

function patch(name, pairs) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) return;
  let t = fs.readFileSync(p, "utf8");
  let n = t;
  pairs.forEach(function ([a, b]) {
    n = n.split(a).join(b);
  });
  if (n !== t) fs.writeFileSync(p, n, "utf8");
}

patch("map-routes.html", [["<span>资产管理</span>", "<span>虚拟座舱</span>"]]);
patch("dc-library.html", [["<span>数据中心</span>", "<span>我的工作台</span>"]]);
["dc-line-stats.html", "dc-drone-stats.html", "dc-system-stats.html"].forEach(function (f) {
  patch(f, [["<span>数据中心</span>", "<span>数据统计</span>"]]);
});

const amFiles = fs.readdirSync(root).filter((f) => f.startsWith("am-") && f.endsWith(".html"));
amFiles.forEach(function (f) {
  patch(f, [["<span>资产管理</span>", "<span>我的工作台</span>"]]);
});

const inWb = [
  "in-project.html",
  "in-project-done.html",
  "in-project-patrol.html",
  "in-track-person.html",
  "in-track-drone.html",
  "in-quality-stats.html",
  "in-score.html",
];
inWb.forEach(function (f) {
  patch(f, [["<span>智慧巡检</span>", "<span>我的工作台</span>"]]);
});

console.log("patch-breadcrumbs: ok");
