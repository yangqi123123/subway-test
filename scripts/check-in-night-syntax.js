const fs = require("fs");
const path = require("path");
const s = fs.readFileSync(path.join(__dirname, "..", "in-night.html"), "utf8");
const start = s.indexOf("(function () {");
const end = s.indexOf("})();", start) + 5;
try {
  new Function(s.slice(start, end));
  console.log("OK");
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
