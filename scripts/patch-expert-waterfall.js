const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "map-expert.html");
let s = fs.readFileSync(file, "utf8");

const tag = "d" + "iv";

if (!s.includes('class="waterfall-legend"')) {
  const needle =
    `              <${tag} class="relative h-[calc(100%-28px)] bg-[#f7f8fb] overflow-hidden">\n`;
  const legend =
    `                <${tag} class="waterfall-legend">\n` +
    "                  <span><i class=\"is-normal\"></i>正常</span>\n" +
    "                  <span><i class=\"is-warn\"></i>预警</span>\n" +
    "                  <span><i class=\"is-danger\"></i>告警</span>\n" +
    `                </${tag}>\n`;
  if (!s.includes(needle)) {
    console.error("marker not found");
    process.exit(1);
  }
  s = s.replace(needle, needle + legend);
}

const warnTops = new Set(["118px", "124px", "324px", "331px"]);
const dotRe = new RegExp(
  `<${tag} class="waterfall-dot left-\\[([^\\]]+)\\] top-\\[([^\\]]+)\\] text-\\[#f6b347\\] bg-current"></${tag}>`,
  "g"
);
s = s.replace(dotRe, (_m, left, top) => {
  const cls = warnTops.has(top) ? "waterfall-dot--warn" : "waterfall-dot--danger";
  return `<${tag} class="waterfall-dot left-[${left}] top-[${top}] ${cls}"></${tag}>`;
});

fs.writeFileSync(file, s);
console.log(
  JSON.stringify(
    {
      legend: s.includes("waterfall-legend"),
      normal: (s.match(/waterfall-dot--normal/g) || []).length,
      warn: (s.match(/waterfall-dot--warn/g) || []).length,
      danger: (s.match(/waterfall-dot--danger/g) || []).length,
      oldOrange: (s.match(/text-\[#f6b347\]/g) || []).length,
    },
    null,
    2
  )
);
