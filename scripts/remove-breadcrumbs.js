/**
 * 全站移除页面顶部面包屑 <nav>。
 * Run: node scripts/remove-breadcrumbs.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const webDir = path.join(root, "web");

function isBreadcrumbNav(block) {
  if (!/^<nav\b/i.test(block)) return false;
  if (/map-breadcrumb|cockpit-crumb/.test(block)) return true;
  if (!/neon-panel--tight/.test(block)) return false;
  if (/&gt;&gt;|>>/.test(block)) return true;
  if (/location-crosshairs|fa-plane\b/.test(block)) return true;
  return false;
}

function stripBreadcrumbs(html) {
  return html.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>\s*/gi, function (block) {
    return isBreadcrumbNav(block) ? "" : block;
  });
}

function walk(dir) {
  var changed = 0;
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (ent) {
    var full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      changed += walk(full);
      return;
    }
    if (!ent.name.endsWith(".html")) return;
    var raw = fs.readFileSync(full, "utf8");
    var next = stripBreadcrumbs(raw);
    if (next !== raw) {
      fs.writeFileSync(full, next, "utf8");
      changed++;
      console.log("  " + path.relative(root, full));
    }
  });
  return changed;
}

var n = walk(webDir);
console.log("remove-breadcrumbs: " + n + " file(s) updated");
