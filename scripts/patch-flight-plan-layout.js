const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "map-flight-plan.html");
let s = fs.readFileSync(file, "utf8");
const d = "d" + "iv";

const start = '        <motion class="p-5 space-y-4">'.replace(/motion/g, "div");
const end = '    <motion id="detail-modal"'.replace(/motion/g, "motion");
const end2 = '    <div id="detail-modal"';

const i0 = s.indexOf(start);
const i1 = s.indexOf(end2, i0);
if (i0 < 0 || i1 < 0) {
  console.error("range not found", i0, i1);
  process.exit(1);
}

const execTime =
  `              <section id="exec-time-panel" class="rounded border border-cyan-400/20 bg-slate-950/25 p-4 space-y-3" aria-labelledby="exec-time-heading">\n` +
  `                <h4 id="exec-time-heading" class="text-sm font-semibold text-cyan-100">执行时间</h4>\n` +
  `                <${d} id="exec-block-single" class="exec-strategy-block">\n` +
  `                  <label><span class="field-label req">计划执行时间</span><input id="p-single-datetime" type="datetime-local" class="wh-input w-full max-w-md px-3 py-2" /></label>\n` +
  `                </${d}>\n` +
  `                <${d} id="exec-block-periodic" class="exec-strategy-block space-y-4">\n` +
  `                  <label><span class="field-label req">周期类型</span><select id="p-cycle-type" class="wh-input w-full max-w-xs px-3 py-2"><option value="日">日</option><option value="周">周</option><option value="月">月</option></select></label>\n` +
  `                  <${d} id="exec-cycle-day" class="exec-cycle-sub">\n` +
  `                    <label><span class="field-label req">每天执行时间</span><input id="p-cycle-daily-time" type="time" class="wh-input w-full max-w-xs px-3 py-2" /></label>\n` +
  `                  </${d}>\n` +
  `                  <${d} id="exec-cycle-week" class="exec-cycle-sub space-y-3">\n` +
  `                    <${d}>\n` +
  `                      <span class="field-label req">执行星期（可多选）</span>\n` +
  `                      <${d} class="weekday-grid mt-2" id="p-weekday-wrap">\n` +
  `                        <label><input type="checkbox" class="p-weekday" value="1" />周一</label>\n` +
  `                        <label><input type="checkbox" class="p-weekday" value="2" />周二</label>\n` +
  `                        <label><input type="checkbox" class="p-weekday" value="3" />周三</label>\n` +
  `                        <label><input type="checkbox" class="p-weekday" value="4" />周四</label>\n` +
  `                        <label><input type="checkbox" class="p-weekday" value="5" />周五</label>\n` +
  `                        <label><input type="checkbox" class="p-weekday" value="6" />周六</label>\n` +
  `                        <label><input type="checkbox" class="p-weekday" value="7" />周日</label>\n` +
  `                      </${d}>\n` +
  `                    </${d}>\n` +
  `                    <label><span class="field-label req">执行时间</span><input id="p-cycle-week-time" type="time" class="wh-input w-full max-w-xs px-3 py-2" /></label>\n` +
  `                  </${d}>\n` +
  `                  <${d} id="exec-cycle-month" class="exec-cycle-sub space-y-3">\n` +
  `                    <label class="block"><span class="field-label req">每月执行日期（可多选）</span>\n` +
  `                      <select id="p-cycle-month-days" class="wh-input w-full px-2 py-1 text-sm month-days-select" multiple size="8" aria-label="选择每月几号执行"></select>\n` +
  `                    </label>\n` +
  `                    <label><span class="field-label req">执行时间</span><input id="p-cycle-month-time" type="time" class="wh-input w-full max-w-xs px-3 py-2" /></label>\n` +
  `                  </${d}>\n` +
  `                </${d}>\n` +
  `              </section>\n`;

const block =
  `        <${d} class="p-5 space-y-4">\n` +
  `          <label class="plan-form-name-row block"><span class="field-label req">计划名称</span><input id="p-name" class="wh-input w-full px-3 py-2" placeholder="请输入计划名称" /></label>\n` +
  `          <${d} class="plan-form-grid">\n` +
  `            <label><span class="field-label req">飞行航线</span><select id="p-route" class="wh-input w-full px-3 py-2"><option value="">请选择飞行航线</option></select></label>\n` +
  `            <label><span class="field-label req">适用机场</span><input id="p-airport" type="text" class="wh-input wh-input--readonly w-full px-3 py-2" readonly placeholder="选择航线后自动带出" tabindex="-1" /></label>\n` +
  `            <label><span class="field-label req">适用航空器</span><select id="p-drone" class="wh-input w-full px-3 py-2"><option value="">请选择适用航空器</option></select></label>\n` +
  `            <label><span class="field-label req">返航高度(ALT)</span><${d} class="num-stepper"><button type="button" class="num-stepper__btn" data-step="-10" data-target="p-rth-alt">−</button><input id="p-rth-alt" type="number" class="wh-input num-stepper__input" value="100" min="20" max="500" step="10" /><button type="button" class="num-stepper__btn" data-step="10" data-target="p-rth-alt">+</button></${d}></label>\n` +
  `            <label><span class="field-label">AI识别模型</span><select id="p-ai-model" class="wh-input w-full px-3 py-2"><option value="">请选择AI模型</option><option>地铁保护区通用模型</option><option>施工机械识别模型</option><option>堆土围挡识别模型</option></select></label>\n` +
  `            <label><span class="field-label">电量限制</span><${d} class="num-stepper num-stepper--suffix"><button type="button" class="num-stepper__btn" data-step="-5" data-target="p-battery">−</button><input id="p-battery" type="number" class="wh-input num-stepper__input" value="30" min="10" max="100" step="5" /><button type="button" class="num-stepper__btn" data-step="5" data-target="p-battery">+</button><span class="num-stepper__unit">%</span></${d}></label>\n` +
  `            <label><span class="field-label">巡查类型</span><select id="p-inspect-type" class="wh-input w-full px-3 py-2"><option>日常巡查</option><option>专项巡查</option><option>应急巡查</option></select></label>\n` +
  `            <${d} class="plan-form-strategy-col">\n` +
  `              <label class="block"><span class="field-label req">飞行策略</span><select id="p-strategy" class="wh-input w-full px-3 py-2"><option>立即起飞</option><option>单次定时</option><option>周期定时</option></select></label>\n` +
  execTime +
  `            </${d}>\n` +
  `          </${d}>\n` +
  `          <button type="button" id="plan-form-toggle" class="plan-form-toggle">收起</button>\n` +
  `          <${d} id="plan-form-advanced" class="plan-form-grid">\n` +
  `            <label><span class="field-label req">计划类型</span><select id="p-type" class="wh-input w-full px-3 py-2"><option>常规计划</option><option>告警复核</option><option>临时任务</option></select></label>\n` +
  `            <label><span class="field-label req">执行方式</span><select id="p-exec-method" class="wh-input w-full px-3 py-2"><option>自主飞行</option><option>手动飞行</option></select></label>\n` +
  `            <label><span class="field-label req">任务精度</span><select id="p-task-precision" class="wh-input w-full px-3 py-2"><option>GNSS</option><option>RTK</option></select></label>\n` +
  `            <label><span class="field-label">飞行模式</span><select id="p-flight-mode" class="wh-input w-full px-3 py-2"><option>超视距</option><option>视距内</option></select></label>\n` +
  `            <label><span class="field-label">遥控器失控动作</span><select id="p-rc-lost" class="wh-input w-full px-3 py-2"><option>返航</option><option>悬停</option><option>降落</option></select></label>\n` +
  `            <label><span class="field-label">返航高度模式</span><select id="p-rth-mode" class="wh-input w-full px-3 py-2"><option>设定高度</option><option>智能高度</option></select></label>\n` +
  `            <label><span class="field-label req">飞手</span><select id="p-pilot" class="wh-input w-full px-3 py-2"><option>武汉地保1</option><option>武汉地保2</option><option>武汉地保3</option></select></label>\n` +
  `            <label><span class="field-label req">航线失控动作</span><select id="p-route-lost" class="wh-input w-full px-3 py-2"><option>返航</option><option>悬停</option><option>降落</option></select></label>\n` +
  `            <label><span class="field-label">视频模式</span><select id="p-video-mode" class="wh-input w-full px-3 py-2"><option>默认</option><option>可见光</option><option>红外</option><option>双光</option></select></label>\n` +
  `            <label><span class="field-label">适用挂载设备</span><select id="p-mount" class="wh-input w-full px-3 py-2"><option value="">请选择适用挂载设备</option><option>可见光相机</option><option>红外热成像</option><option>激光雷达</option><option>喊话器</option></select></label>\n` +
  `            <label class="hidden-field"><span class="field-label">所属线路</span><select id="p-line" class="wh-input w-full px-3 py-2"></select></label>\n` +
  `            <label class="hidden-field"><span class="field-label">申请人</span><input id="p-applicant" class="wh-input w-full px-3 py-2" value="当前用户" readonly /></label>\n` +
  `          </${d}>\n` +
  `          <${d} class="rounded border border-cyan-400/20 bg-cyan-950/20 p-3 text-xs text-cyan-100 leading-6">\n` +
  `            业务校验：仅可选择审批通过且空域许可有效的航线；计划需完成“提交 → 工长 → 工务 → 物管 → 车间主任 → 部门领导”审批后才允许执行；空域许可临期自动预警。\n` +
  `          </${d}>\n` +
  `        </${d}>\n` +
  `        <${d} class="px-5 py-4 border-t border-white/10 flex justify-end gap-2"><button type="button" class="wh-btn-ghost px-4 py-2" data-close="form-modal">取消</button><button type="button" id="save-plan-btn" class="wh-btn-primary px-4 py-2">确定</button></${d}>\n` +
  `      </${d}>\n` +
  `    </${d}>\n\n`;

s = s.slice(0, i0) + block + s.slice(i1);

// JS: routeIndex + syncFromRoute
const jsOld = `      function lineFromAirport(airport){
        return Object.keys(linkData).find(function (line) {
          return linkData[line].airports.indexOf(airport) >= 0;
        }) || "8号线";
      }
      function allAirports(){
        const set = new Set();
        Object.keys(linkData).forEach(function (line) {
          linkData[line].airports.forEach(function (a) { set.add(a); });
        });
        return Array.from(set);
      }
      function syncFromAirport(){
        const airport = $("p-airport").value;
        if (!airport) return;
        const line = lineFromAirport(airport);
        $("p-line").value = line;
        fillSelect("p-route", linkData[line].routes, "请选择飞行航线");
        fillSelect("p-drone", linkData[line].drones[airport] || [], "请选择适用航空器");
      }`;

const jsNew = `      const routeIndex = (function () {
        const idx = {};
        Object.keys(linkData).forEach(function (line) {
          const data = linkData[line];
          data.routes.forEach(function (route) {
            idx[route] = { line: line, airport: data.airports[0] };
          });
        });
        return idx;
      })();
      function allRoutes() {
        return Object.keys(routeIndex);
      }
      function lineFromAirport(airport) {
        return Object.keys(linkData).find(function (line) {
          return linkData[line].airports.indexOf(airport) >= 0;
        }) || "8号线";
      }
      function syncFromRoute() {
        const route = $("p-route").value;
        if (!route) {
          $("p-airport").value = "";
          $("p-line").value = "";
          fillSelect("p-drone", [], "请选择适用航空器");
          return;
        }
        const meta = routeIndex[route];
        if (!meta) return;
        $("p-line").value = meta.line;
        $("p-airport").value = meta.airport;
        fillSelect("p-drone", linkData[meta.line].drones[meta.airport] || [], "请选择适用航空器");
      }`;

if (s.includes(jsOld)) s = s.replace(jsOld, jsNew);
else console.warn("js block not replaced");

s = s.replace('$("p-airport").onchange = syncFromAirport;', '$("p-route").onchange = syncFromRoute;');

const openOld = `        fillSelect("p-line", Object.keys(linkData));
        fillSelect("p-airport", allAirports(), "请选择适用机场");
        if (p) {
          $("p-name").value = p.name;
          $("p-line").value = p.line;
          $("p-airport").value = p.airport;
          syncFromAirport();
          $("p-route").value = p.route;
          $("p-drone").value = p.drone;`;

const openNew = `        fillSelect("p-line", Object.keys(linkData));
        fillSelect("p-route", allRoutes(), "请选择飞行航线");
        if (p) {
          $("p-name").value = p.name;
          $("p-route").value = p.route;
          syncFromRoute();
          $("p-drone").value = p.drone;`;

if (s.includes(openOld)) s = s.replace(openOld, openNew);

const openElseOld = `          $("p-line").value = "8号线";
          $("p-airport").value = "";
          fillSelect("p-route", [], "请选择飞行航线");
          fillSelect("p-drone", [], "请选择适用航空器");`;

const openElseNew = `          $("p-line").value = "";
          $("p-airport").value = "";
          fillSelect("p-route", allRoutes(), "请选择飞行航线");
          $("p-route").value = "";
          fillSelect("p-drone", [], "请选择适用航空器");`;

if (s.includes(openElseOld)) s = s.replace(openElseOld, openElseNew);

s = s.replace(
  'if(!$("p-airport").value) return toast("请选择适用机场");',
  'if(!$("p-airport").value) return toast("请先选择飞行航线以带出适用机场");'
);

fs.writeFileSync(file, s);
console.log(
  "done",
  (s.match(/id="exec-time-panel"/g) || []).length,
  s.includes("syncFromRoute")
);
