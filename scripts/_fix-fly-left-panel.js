const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "map-cockpit-fly.html");
const d = "d" + "iv";

let s = fs.readFileSync(file, "utf8");
s = s.replace(/<motion\b/g, "<" + d);
s = s.replace(/<\/motion>/g, "</" + d + ">");

// Remove duplicate manual panel inside map-section (keep left one with --left class)
const dupRe =
  /\n            <div id="cockpit-manual-panel" class="cockpit-manual-inline">\n[\s\S]*?\n            <\/div>\n(?=          <\/section>\n        <\/aside>)/;
if (dupRe.test(s) && s.includes("cockpit-manual-inline--left")) {
  s = s.replace(dupRe, "\n");
  console.log("removed duplicate panel from map");
}

// Fix duplicate id if two panels remain - remove second cockpit-manual-panel without --left
const panels = s.match(/id="cockpit-manual-panel"/g);
if (panels && panels.length > 1) {
  const idx = s.indexOf('id="cockpit-manual-panel" class="cockpit-manual-inline">');
  if (idx > -1) {
    const end = s.indexOf("\n          </section>", idx);
    const block = s.slice(idx - 13, end);
    s = s.slice(0, idx - 13) + s.slice(end);
    console.log("removed second panel");
  }
}

fs.writeFileSync(file, s);
console.log("done");
