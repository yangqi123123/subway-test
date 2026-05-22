const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "in-disease.html");
const s = fs.readFileSync(file, "utf8");
const nl = s.includes("\r\n") ? "\r\n" : "\n";
const start = s.indexOf("  <script>" + nl + "    (function () {");
const end = s.indexOf("    })();" + nl + "  </script>", start);
const code = s.slice(start + "  <script>".length, end);
try {
  new Function(code);
  console.log("script syntax OK");
} catch (e) {
  console.error("syntax error:", e.message);
  process.exit(1);
}
