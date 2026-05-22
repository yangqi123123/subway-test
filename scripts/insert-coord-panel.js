const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "map-gis.html");
const d = "motion".replace("motion", "div");
let c = fs.readFileSync(p, "utf8");
if (c.includes("gis-coord-panel")) {
  console.log("coord panel already present");
  process.exit(0);
}
const ins = [
  "",
  `      <${d} id="gis-coord-panel" class="gis-coord-panel hidden" aria-live="polite">`,
  `        <${d} class="gis-detail-head">`,
  `          <${d} class="gis-detail-title">坐标拾取</${d}>`,
  `          <button type="button" class="wh-modal-close gis-detail-close" id="gis-coord-close" aria-label="关闭">×</button>`,
  `        </${d}>`,
  `        <${d} class="gis-coord-body">`,
  `          <label class="gis-coord-field">`,
  `            <span class="gis-coord-label">经度</span>`,
  `            <input type="text" id="gis-coord-lng" class="gis-coord-input" placeholder="如 114.305500" inputmode="decimal" />`,
  `          </label>`,
  `          <label class="gis-coord-field">`,
  `            <span class="gis-coord-label">纬度</span>`,
  `            <input type="text" id="gis-coord-lat" class="gis-coord-input" placeholder="如 30.592800" inputmode="decimal" />`,
  `          </label>`,
  `        </${d}>`,
  `        <${d} class="gis-coord-foot">`,
  `          <button type="button" class="gis-coord-btn gis-coord-btn--ghost" id="gis-coord-pick-map">图上拾取</button>`,
  `          <button type="button" class="gis-coord-btn gis-coord-btn--primary" id="gis-coord-locate">坐标定位</button>`,
  `        </${d}>`,
  `      </${d}>`,
  "",
].join("\n");
c = c.replace('      <div id="gis-hud"', ins + '\n      <motion id="gis-hud"').replace("<motion id=\"gis-hud\"", '<div id="gis-hud"');
fs.writeFileSync(p, c, "utf8");
console.log("ok");
