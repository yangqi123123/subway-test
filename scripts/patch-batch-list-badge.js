const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "map-flight-plan.html");
let s = fs.readFileSync(file, "utf8");
const old =
  'return selected.map(p=>`<motion class="flex items-center justify-between gap-3 py-2 border-b border-cyan-400/10 last:border-0"><motion class="min-w-0"><motion class="text-cyan-100 font-medium truncate">${p.name}</motion><motion class="text-xs text-slate-400 mt-0.5">${p.route} · ${p.line}</motion></motion>${auditBadge(p.audit)}</motion>`).join("");';
const neu =
  'return selected.map(p=>`<motion class="py-2 border-b border-cyan-400/10 last:border-0"><motion class="text-cyan-100 font-medium truncate">${p.name}</motion><motion class="text-xs text-slate-400 mt-0.5">${p.route} · ${p.line}</motion></motion>`).join("");';
const d = "d" + "iv";
if (!s.includes("${auditBadge(p.audit)}</" + d + ">`).join")) {
  console.error("pattern not found");
  process.exit(1);
}
s = s.replace(
  "${auditBadge(p.audit)}</" + d + ">`).join",
  "</" + d + ">`).join"
);
s = s.replace(
  'class="flex items-center justify-between gap-3 py-2 border-b border-cyan-400/10 last:border-0"><' +
    d +
    ' class="min-w-0"><' +
    d +
    ' class="text-cyan-100 font-medium truncate"',
  'class="py-2 border-b border-cyan-400/10 last:border-0"><' + d + ' class="text-cyan-100 font-medium truncate"'
);
s = s.replace(
  "</" + d + "></" + d + "></" + d + ">`).join",
  "</" + d + "></" + d + ">`).join"
);
fs.writeFileSync(file, s);
console.log("ok", !s.includes("auditBadge(p.audit)"));
