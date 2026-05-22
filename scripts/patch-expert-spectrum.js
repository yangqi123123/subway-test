const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "map-expert.html");
let s = fs.readFileSync(file, "utf8");

const tag = "d" + "iv";

const oldBlockStart = `              <${tag} class="relative h-[calc(100%-28px)] overflow-hidden bg-[#240900]">`;
const oldBlockEnd = `              </${tag}>\n            </${tag}>\n          </section>`;

const startIdx = s.indexOf(oldBlockStart);
const endIdx = s.indexOf(oldBlockEnd, startIdx);
if (startIdx < 0 || endIdx < 0) {
  console.error("spectrum block not found", startIdx, endIdx);
  process.exit(1);
}

const newBlock =
  `              <${tag} class="spec-view relative h-[calc(100%-28px)] overflow-hidden">\n` +
  `                <${tag} class="spec-legend">\n` +
  "                  <span><i class=\"is-normal\"></i>正常</span>\n" +
  "                  <span><i class=\"is-warn\"></i>预警</span>\n" +
  "                  <span><i class=\"is-danger\"></i>告警</span>\n" +
  `                </${tag}>\n` +
  `                <${tag} class="spec-chart-area">\n` +
  '                  <canvas id="expert-spectrum-canvas" aria-label="频谱图"></canvas>\n' +
  `                </${tag}>\n` +
  `                <${tag} class="spec-axis-y" id="expert-spec-axis-y"></${tag}>\n` +
  `                <${tag} class="spec-axis-x" id="expert-spec-axis-x"></${tag}>\n` +
  `                <${tag} class="spec-axis-unit spec-axis-unit--x">频率（Hz）</${tag}>\n` +
  `                <${tag} class="spec-axis-unit spec-axis-unit--y">时间</${tag}>\n` +
  `              </${tag}>\n` +
  `            </${tag}>\n` +
  "          </section>";

s = s.slice(0, startIdx) + newBlock + s.slice(endIdx + oldBlockEnd.length);

const cssOld = `      .spec-noise {
        position: absolute;
        inset: 0;
        background:
          repeating-linear-gradient(180deg, rgba(0, 0, 0, 0.16) 0 2px, rgba(255, 255, 255, 0.02) 2px 6px),
          repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.12) 0 1px, transparent 1px 9px),
          repeating-linear-gradient(180deg, transparent 0 13px, rgba(255, 240, 180, 0.08) 13px 14px);
        mix-blend-mode: multiply;
        opacity: 0.58;
      }`;

const cssNew = `      .spec-view {
        background: linear-gradient(180deg, #0a1222 0%, #0d1830 100%);
      }
      .spec-legend {
        position: absolute;
        right: 10px;
        top: 8px;
        z-index: 3;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 10px;
        color: #94a3b8;
      }
      .spec-legend span {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .spec-legend i {
        width: 7px;
        height: 7px;
        border-radius: 999px;
      }
      .spec-legend i.is-normal {
        background: #47a6ff;
        box-shadow: 0 0 6px rgba(71, 166, 255, 0.5);
      }
      .spec-legend i.is-warn {
        background: #ffbf33;
        box-shadow: 0 0 6px rgba(255, 191, 51, 0.45);
      }
      .spec-legend i.is-danger {
        background: #ff4d4f;
        box-shadow: 0 0 6px rgba(255, 77, 79, 0.5);
      }
      .spec-chart-area {
        position: absolute;
        left: 38px;
        right: 10px;
        top: 10px;
        bottom: 26px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 2px;
        overflow: hidden;
        background: #060d1a;
      }
      #expert-spectrum-canvas {
        display: block;
        width: 100%;
        height: 100%;
      }
      .spec-axis-y {
        position: absolute;
        left: 4px;
        top: 10px;
        bottom: 26px;
        width: 32px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-end;
        padding-right: 4px;
        font-size: 9px;
        color: #94a3b8;
        pointer-events: none;
      }
      .spec-axis-x {
        position: absolute;
        left: 38px;
        right: 10px;
        bottom: 8px;
        display: flex;
        justify-content: space-between;
        font-size: 9px;
        color: #94a3b8;
        pointer-events: none;
      }
      .spec-axis-unit {
        position: absolute;
        font-size: 9px;
        color: #64748b;
        pointer-events: none;
      }
      .spec-axis-unit--x {
        right: 10px;
        bottom: 2px;
      }
      .spec-axis-unit--y {
        left: 4px;
        top: 2px;
        writing-mode: vertical-rl;
        transform: rotate(180deg);
      }`;

if (s.includes(cssOld)) {
  s = s.replace(cssOld, cssNew);
} else if (!s.includes(".spec-view")) {
  s = s.replace(
    "      .map-chip {",
    cssNew + "\n\n      .map-chip {"
  );
}

fs.writeFileSync(file, s);
console.log("patched", s.includes("expert-spectrum-canvas"), s.includes(".spec-view"));
