const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "map-flight-plan.html");
let s = fs.readFileSync(file, "utf8");
const d = "d" + "iv";

const oldBlock =
  `              <${d} id="exec-block-periodic" class="exec-strategy-block plan-exec-inner">\n` +
  `                <${d} class="plan-exec-fields">\n` +
  `                  <label><span class="field-label req">周期类型</span><select id="p-cycle-type" class="wh-input w-full px-3 py-2"><option value="日">日</option><option value="周">周</option><option value="月">月</option></select></label>\n` +
  `                  <${d} id="exec-cycle-day" class="exec-cycle-sub">\n` +
  `                    <label><span class="field-label req">每天执行时间</span><input id="p-cycle-daily-time" type="time" class="wh-input w-full px-3 py-2" /></label>\n` +
  `                  </${d}>\n` +
  `                </${d}>\n`;

const newBlock =
  `              <${d} id="exec-block-periodic" class="exec-strategy-block plan-exec-inner">\n` +
  `                <label class="block plan-cycle-type-field">\n` +
  `                  <span class="field-label req">周期类型</span>\n` +
  `                  <select id="p-cycle-type" class="wh-input w-full max-w-xs px-3 py-2"><option value="日">日</option><option value="周">周</option><option value="月">月</option></select>\n` +
  `                </label>\n` +
  `                <${d} id="exec-cycle-day" class="exec-cycle-sub">\n` +
  `                  <${d} class="plan-exec-fields plan-exec-fields--single">\n` +
  `                    <label><span class="field-label req">每天执行时间</span><input id="p-cycle-daily-time" type="time" class="wh-input w-full px-3 py-2" /></label>\n` +
  `                  </${d}>\n` +
  `                </${d}>\n`;

if (!s.includes(oldBlock)) {
  console.error("old block not found");
  process.exit(1);
}
s = s.replace(oldBlock, newBlock);

const cssInsert = `      .plan-cycle-type-field { max-width: 280px; margin-bottom: 4px; }\n      #exec-cycle-month.exec-cycle-sub.is-active { display: block !important; }\n`;

if (!s.includes(".plan-cycle-type-field")) {
  s = s.replace(
    "      #exec-cycle-week.exec-cycle-sub.is-active { display: flex !important; flex-direction: column; gap: 12px; }",
    "      #exec-cycle-week.exec-cycle-sub.is-active { display: flex !important; flex-direction: column; gap: 12px; }\n" +
      cssInsert
  );
}

// Hide plan-exec-fields wrapper visibility when parent cycle sub inactive
const cssHideGrid = `      .exec-cycle-sub:not(.is-active) .plan-exec-fields { display: none !important; }\n`;
if (!s.includes("exec-cycle-sub:not(.is-active)")) {
  s = s.replace(".plan-cycle-type-field", cssHideGrid + "      .plan-cycle-type-field");
}

fs.writeFileSync(file, s);
console.log("ok");
