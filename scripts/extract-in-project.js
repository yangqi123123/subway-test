const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "web", "wb", "in-project.html");
const outPath = path.join(__dirname, "..", "assets", "js", "in-project-page.js");

const html = fs.readFileSync(htmlPath, "utf8");
const start = html.indexOf("<script>\n    (function () {");
const end = html.indexOf("    })();\n  </script>", start);
if (start < 0 || end < 0) {
  console.error("markers not found", start, end);
  process.exit(1);
}

const body = html.slice(start + "<script>\n    ".length, end);

const header = `/**
 * 项目管理页逻辑（Web / 移动端共用）
 */
(function (global) {
  "use strict";

  function bootInProjectPage(options) {
    options = options || {};
    var isMobile = !!options.mobile;
    var mobileListEl = isMobile ? document.getElementById("project-mobile-list") : null;

`;

const footer = `
    return {
      showList: showList,
      showProjectView: showProjectView,
      renderRows: renderRows,
      projects: projects
    };
  }

  global.WHInProjectPage = { boot: bootInProjectPage };
})(typeof window !== "undefined" ? window : this);
`;

fs.writeFileSync(outPath, header + body + footer, "utf8");
console.log("wrote", outPath, "bytes", Buffer.byteLength(header + body + footer));
