const fs = require("fs");
const path = require("path");
const srcPath = path.join(__dirname, "..", "assets", "js", "map-gis.js");
const src = fs.readFileSync(srcPath, "utf8");
const start = src.indexOf("var metroPaths = {");
const end = src.indexOf("};", start) + 2;
const pathsBlock = src.slice(start, end);
const colorsStart = src.indexOf("var metroColors = {");
const colorsEnd = src.indexOf("};", colorsStart) + 2;
const colorsBlock = src.slice(colorsStart, colorsEnd);
const out =
  "(function () {\n  window.WuhanGIS = window.WuhanGIS || {};\n  window.WuhanGIS." +
  pathsBlock.replace("var metroPaths", "METRO_PATHS") +
  "\n  window.WuhanGIS." +
  colorsBlock.replace("var metroColors", "METRO_COLORS") +
  "\n})();\n";
fs.writeFileSync(path.join(__dirname, "..", "assets", "js", "map-metro-data.js"), out);
console.log("wrote map-metro-data.js", out.length, "bytes");
