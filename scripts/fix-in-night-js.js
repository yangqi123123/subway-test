const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "in-night.html");
let s = fs.readFileSync(file, "utf8");
const t = "d" + "iv";

s = s.replace(/<\/?motion\b/g, (m) => m.replace("motion", t));

const openBad =
  "return (\n              '<motion class=\"record-item\"><motion class=\"mb-3\">' +\n              log.action +\n              \"</\" +\n              d +";
if (s.includes("+ d +")) {
  s = s.replace(
    /return \(\s*'<div class="record-item"><motion class="mb-3">' \+\s*log\.action \+[\s\S]*?">\s*\);\s*\}\)/
      .test(s)
      ? /return \(\s*'<div class="record-item"><div class="mb-3">' \+\s*log\.action \+[\s\S]*?">\s*\);\s*\}\)/
      : /return \(\s*'<div class="record-item"><div class="mb-3">' \+\s*log\.action \+[\s\S]*?">\s*\);/,
    "return '<" +
      t +
      " class=\"record-item\"><" +
      t +
      " class=\"mb-3\">' + log.action + '</" +
      t +
      "><" +
      t +
      " class=\"text-[13px] text-slate-400 mb-3\">日期：' + log.time + '</" +
      t +
      "><" +
      t +
      " class=\"text-[13px] text-slate-400\">操作者：' + log.user + '</" +
      t +
      "></" +
      t +
      ">';"
  );
}

// simpler openRecords fix
if (s.includes("+ d +")) {
  const a = s.indexOf("function openRecords");
  const b = s.indexOf("bindUploader", a);
  const chunk = s.slice(a, b);
  const fixed =
    `function openRecords(index) {
        recordBody.innerHTML = rows[index].logs
          .map(function (log) {
            return '<${t} class="record-item"><${t} class="mb-3">' + log.action + '</${t}><${t} class="text-[13px] text-slate-400 mb-3">日期：' + log.time + '</${t}><${t} class="text-[13px] text-slate-400">操作者：' + log.user + '</${t}></${t}>';
          })
          .join("");
        recordMask.classList.add("show");
      }

      `;
  s = s.slice(0, a) + fixed + s.slice(b);
}

if (/\+\s*d\s*\+/.test(s)) {
  console.error("still + d +");
  process.exit(1);
}

fs.writeFileSync(file, s);
const start = s.indexOf("(function () {");
const end = s.indexOf("})();", start) + 5;
new Function(s.slice(start, end));
console.log("fixed, syntax OK");
