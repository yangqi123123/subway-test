const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "map-flight-plan.html");
let s = fs.readFileSync(file, "utf8");
const d = "d" + "iv";

const start = '            <div class="plan-form-strategy-col">';
const i0 = s.indexOf(start);
const i1fixed = s.indexOf('          </motion>\n          <button type="button" id="plan-form-toggle"', i0);
const i1 = i1fixed >= 0 ? i1fixed : s.indexOf('          </motion>\n          <button type="button" id="plan-form-toggle"', i0);
const i1div = s.indexOf('          </motion>\n          <button type="button" id="plan-form-toggle"', i0);
const endMarker = '          </motion>\n          <button type="button" id="plan-form-toggle"';
const endMarkerDiv = '          </motion>\n          <button type="button" id="plan-form-toggle"'.replace(/motion/g, "div");
const endIdx = s.indexOf('          </motion>\n          <button type="button" id="plan-form-toggle"', i0);
const endIdx2 = s.indexOf(
  '          </motion>\n          <button type="button" id="plan-form-toggle"'.replace(/<\/motion>/g, "</motion>"),
  i0
);
const end = s.indexOf('          </motion>\n          <button type="button" id="plan-form-toggle"', i0);
// fix: use div
const endPos = s.indexOf('          </motion>\n          <button type="button" id="plan-form-toggle"', i0);
const endPosReal = s.indexOf(
  "          </" + d + ">\n          <button type=\"button\" id=\"plan-form-toggle\"",
  i0
);

if (i0 < 0 || endPosReal < 0) {
  console.error("not found", i0, endPosReal);
  process.exit(1);
}

const block =
  `            <label><span class="field-label">巡查类型</span><select id="p-inspect-type" class="wh-input w-full px-3 py-2"><option>日常巡查</option><option>项目巡查</option><option>其他巡查</option></select></label>\n` +
  `            <label><span class="field-label req">飞行策略</span><select id="p-strategy" class="wh-input w-full px-3 py-2"><option>立即起飞</option><option>单次定时</option><option>周期定时</option></select></label>\n` +
  `          </${d}>\n` +
  `          <section id="exec-time-panel" class="plan-form-exec-row" aria-labelledby="exec-time-heading">\n` +
  `            <h4 id="exec-time-heading" class="plan-exec-title">执行时间</h4>\n` +
  `            <${d} class="plan-exec-inner">\n` +
  `              <${d} id="exec-block-single" class="exec-strategy-block">\n` +
  `                <${d} class="plan-exec-fields plan-exec-fields--single">\n` +
  `                  <label><span class="field-label req">计划执行时间</span><input id="p-single-datetime" type="datetime-local" class="wh-input w-full px-3 py-2" /></label>\n` +
  `                </${d}>\n` +
  `              </${d}>\n` +
  `              <${d} id="exec-block-periodic" class="exec-strategy-block plan-exec-inner">\n` +
  `                <${d} class="plan-exec-fields">\n` +
  `                  <label><span class="field-label req">周期类型</span><select id="p-cycle-type" class="wh-input w-full px-3 py-2"><option value="日">日</option><option value="周">周</option><option value="月">月</option></select></label>\n` +
  `                  <${d} id="exec-cycle-day" class="exec-cycle-sub">\n` +
  `                    <label><span class="field-label req">每天执行时间</span><input id="p-cycle-daily-time" type="time" class="wh-input w-full px-3 py-2" /></label>\n` +
  `                  </${d}>\n` +
  `                </${d}>\n` +
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
  `                </${d}>\n` +
  `                <${d} id="exec-cycle-month" class="exec-cycle-sub">\n` +
  `                  <${d} class="plan-exec-fields">\n` +
  `                    <label class="block"><span class="field-label req">每月执行日期（可多选）</span>\n` +
  `                      <select id="p-cycle-month-days" class="wh-input w-full px-2 py-1 text-sm month-days-select" multiple size="6" aria-label="选择每月几号执行"></select>\n` +
  `                    </label>\n` +
  `                    <label><span class="field-label req">执行时间</span><input id="p-cycle-month-time" type="time" class="wh-input w-full px-3 py-2" /></label>\n` +
  `                  </${d}>\n` +
  `                </${d}>\n` +
  `              </${d}>\n` +
  `            </${d}>\n` +
  `          </section>\n`;

const before = s.slice(0, i0);
const inspectLine = '            <label><span class="field-label">巡查类型</span>';
const inspectIdx = before.lastIndexOf(inspectLine);
if (inspectIdx < 0) {
  console.error("inspect line not found");
  process.exit(1);
}

s = before.slice(0, inspectIdx) + block + s.slice(endPosReal);

fs.writeFileSync(file, s);
console.log("ok", s.includes("plan-form-exec-row"), !s.includes("plan-form-strategy-col"));
