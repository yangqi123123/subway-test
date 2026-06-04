const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const linePath = path.join(root, "web/stats/dc-line-stats.html");
const opsPath = path.join(root, "web/wb/am-ops-metro.html");

const lineTail = `
  <script src="../../assets/js/dc-line-stats-data.js"></script>
  <script src="../../assets/js/dc-line-stats-page.js"></script>
  <script src="../../assets/js/dc-chart-toolbar.js"></script>
  <script>
    (function () {
      document.addEventListener("DOMContentLoaded", function () {
        if (window.WHLineStatsPage) {
          WHLineStatsPage.boot({ mobile: false });
        }
      });
    })();
  </script>
  <script src="../../assets/js/menu-config.js"></script>
  <script src="../../assets/js/shell.js"></script>
</body>
</html>
`;

const opsTail = `
  <script src="../../assets/js/am-ops-metro-data.js"></script>
  <script src="../../assets/js/am-ops-metro-page.js"></script>
  <script src="../../assets/js/system-mgmt-quick-links.js"></script>
  <script>
    (function () {
      document.addEventListener("DOMContentLoaded", function () {
        if (window.WHOpsMetroPage) {
          WHOpsMetroPage.boot({ mobile: false, serverId: "metro" });
        }
      });
    })();
  </script>
  <script src="../../assets/js/menu-config.js"></script>
  <script src="../../assets/js/workbench-mega.js"></script>
  <script src="../../assets/js/shell.js"></script>
</body>
</html>
`;

let line = fs.readFileSync(linePath, "utf8");
const lineIdx = line.indexOf('  <script src="../../assets/js/menu-config.js"></script>');
if (lineIdx < 0) throw new Error("line stats anchor not found");
fs.writeFileSync(linePath, line.slice(0, lineIdx) + lineTail);

let ops = fs.readFileSync(opsPath, "utf8");
const opsIdx = ops.indexOf('  <script src="../../assets/js/menu-config.js"></script>');
if (opsIdx < 0) throw new Error("ops metro anchor not found");
fs.writeFileSync(opsPath, ops.slice(0, opsIdx) + opsTail);

console.log("patched dc-line-stats.html and am-ops-metro.html");
