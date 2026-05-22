const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "in-disease.html");
const s = fs.readFileSync(file, "utf8");
const start = s.indexOf("(function () {");
const end = s.indexOf("})();", start) + 5;
const code = s.slice(start, end);
try {
  new Function(code);
  console.log("script syntax OK, length", code.length);
} catch (e) {
  console.error("syntax error:", e.message);
  const line = code.split("\n")[e.lineNumber - 1];
  if (line) console.error("line:", line.slice(0, 200));
  process.exit(1);
}
