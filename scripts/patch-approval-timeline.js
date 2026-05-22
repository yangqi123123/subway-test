const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "map-flight-plan.html");
let s = fs.readFileSync(file, "utf8");
const d = "d" + "iv";

s = s.replace(
  `<${d} class="max-h-[min(520px,58vh)] overflow-y-auto pr-1">\${renderApprovalRecords(p)}</${d}>`,
  `<${d} class="approval-records-scroll">\${renderApprovalRecords(p)}</${d}>`
);

const oldRender =
  "return approvalRecords(p).map(r=>`<" +
  d +
  ' class="approval-item ${recordClass(r.status)}"><' +
  d +
  ' class="flex flex-wrap items-center gap-3"><span class="font-semibold text-cyan-100">${r.person}</span>${approvalRecordBadge(r.status)}<span class="text-xs text-slate-400">${r.time}</span></' +
  d +
  '><' +
  d +
  ' class="mt-2 text-xs text-slate-300 leading-5">审批意见：${r.opinion}</' +
  d +
  "></" +
  d +
  '>`).join("");';

const newRender =
  "const list=approvalRecords(p);return list.map(function(r,i){const cls=recordClass(r.status);const last=i===list.length-1;return `<" +
  d +
  ' class="approval-item ${cls}${last?" approval-item--last":""}"><' +
  d +
  ' class="approval-item__rail"><span class="approval-item__dot" aria-hidden="true"></span>${last?"":`<span class="approval-item__line" aria-hidden="true"></span>`}</' +
  d +
  '><' +
  d +
  ' class="approval-item__content"><' +
  d +
  ' class="flex flex-wrap items-center gap-3"><span class="font-semibold text-cyan-100">${r.person}</span>${approvalRecordBadge(r.status)}<span class="text-xs text-slate-400">${r.time}</span></' +
  d +
  '><' +
  d +
  ' class="mt-2 text-xs text-slate-300 leading-5">审批意见：${r.opinion}</' +
  d +
  "></" +
  d +
  "></" +
  d +
  '>`;}).join("");';

if (!s.includes(oldRender)) {
  console.error("render block not found");
  process.exit(1);
}
s = s.replace(oldRender, newRender);

fs.writeFileSync(file, s);
console.log("ok", s.includes("approval-item__dot"), s.includes("approval-records-scroll"));
