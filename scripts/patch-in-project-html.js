const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "web", "wb", "in-project.html");
let html = fs.readFileSync(htmlPath, "utf8");

const start = html.indexOf('  <script data-removed-inline="1"');
const altStart = html.indexOf("  <script>\n    (function () {");
const end = html.indexOf("  <script src=\"../../assets/js/menu-config.js\">");

const blockStart = start >= 0 ? start : altStart;
if (blockStart < 0 || end < 0) {
  console.error("markers missing", blockStart, end);
  process.exit(1);
}

const replacement =
  '  <script src="../../assets/js/in-project-page.js"></script>\n' +
  "  <script>WHInProjectPage.boot();</script>\n";

html = html.slice(0, blockStart) + replacement + html.slice(end);
fs.writeFileSync(htmlPath, html, "utf8");
console.log("patched", htmlPath);
