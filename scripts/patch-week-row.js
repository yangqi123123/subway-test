const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "map-flight-plan.html");
let s = fs.readFileSync(file, "utf8");
const d = "d" + "iv";

const oldBlock =
  `                <${d} id="exec-cycle-week" class="exec-cycle-sub plan-exec-inner">\n` +
  `                  <label class="block"><span class="field-label req">执行星期（可多选）</span>\n` +
  `                    <${d} class="weekday-grid mt-2" id="p-weekday-wrap">\n` +
  `                      <label><input type="checkbox" class="p-weekday" value="1" />周一</label>\n` +
  `                      <label><input type="checkbox" class="p-weekday" value="2" />周二</label>\n` +
  `                      <label><input type="checkbox" class="p-weekday" value="3" />周三</label>\n` +
  `                      <label><input type="checkbox" class="p-weekday" value="4" />周四</label>\n` +
  `                      <label><input type="checkbox" class="p-weekday" value="5" />周五</label>\n` +
  `                      <label><input type="checkbox" class="p-weekday" value="6" />周六</label>\n` +
  `                      <label><input type="checkbox" class="p-weekday" value="7" />周日</label>\n` +
  `                    </${d}>\n` +
  `                  </label>\n` +
  `                  <${d} class="plan-exec-fields plan-exec-fields--single">\n` +
  `                    <label><span class="field-label req">执行时间</span><input id="p-cycle-week-time" type="time" class="wh-input w-full px-3 py-2" /></label>\n` +
  `                  </${d}>\n` +
  `                </${d}>\n`;

const newBlock =
  `                <${d} id="exec-cycle-week" class="exec-cycle-sub">\n` +
  `                  <${d} class="plan-exec-week-row">\n` +
  `                    <label class="block min-w-0"><span class="field-label req">执行星期（可多选）</span>\n` +
  `                      <${d} class="weekday-grid mt-2" id="p-weekday-wrap">\n` +
  `                        <label><input type="checkbox" class="p-weekday" value="1" />周一</label>\n` +
  `                        <label><input type="checkbox" class="p-weekday" value="2" />周二</label>\n` +
  `                        <label><input type="checkbox" class="p-weekday" value="3" />周三</label>\n` +
  `                        <label><input type="checkbox" class="p-weekday" value="4" />周四</label>\n` +
  `                        <label><input type="checkbox" class="p-weekday" value="5" />周五</label>\n` +
  `                        <label><input type="checkbox" class="p-weekday" value="6" />周六</label>\n` +
  `                        <label><input type="checkbox" class="p-weekday" value="7" />周日</label>\n` +
  `                      </${d}>\n` +
  `                    </label>\n` +
  `                    <label class="plan-exec-week-time block"><span class="field-label req">执行时间</span><input id="p-cycle-week-time" type="time" class="wh-input w-full px-3 py-2" /></label>\n` +
  `                  </${d}>\n` +
  `                </${d}>\n`;

if (!s.includes(oldBlock)) {
  console.error("old block not found");
  process.exit(1);
}
s = s.replace(oldBlock, newBlock);
fs.writeFileSync(file, s);
console.log("ok", s.includes("plan-exec-week-row"));
