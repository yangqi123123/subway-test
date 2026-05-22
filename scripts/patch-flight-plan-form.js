const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "map-flight-plan.html");
let s = fs.readFileSync(file, "utf8");
const d = "d" + "iv";

const formStart = `    <${d} id="form-modal" class="modal-mask">`;
const formEnd = `    <${d} id="detail-modal" class="modal-mask">`;

const i0 = s.indexOf(formStart);
const i1 = s.indexOf(formEnd, i0);
if (i0 < 0 || i1 < 0) {
  console.error("form block not found");
  process.exit(1);
}

const newForm =
  `    <${d} id="form-modal" class="modal-mask">\n` +
  `      <${d} class="modal-card modal-card--plan">\n` +
  `        <${d} class="flex items-center justify-between px-5 py-4 border-b border-white/10"><h3 id="form-title" class="text-base font-semibold">新增计划</h3><button type="button" class="wh-modal-close" data-close="form-modal" aria-label="关闭">×</button></${d}>\n` +
  `        <${d} class="p-5 space-y-4">\n` +
  `          <${d} class="plan-form-grid">\n` +
  `            <label><span class="field-label req">计划名称</span><input id="p-name" class="wh-input w-full px-3 py-2" placeholder="请输入计划名称" /></label>\n` +
  `            <label><span class="field-label req">适用机场</span><select id="p-airport" class="wh-input w-full px-3 py-2"><option value="">请选择适用机场</option></select></label>\n` +
  `            <label><span class="field-label req">飞行航线</span><select id="p-route" class="wh-input w-full px-3 py-2"><option value="">请选择飞行航线</option></select></label>\n` +
  `            <label><span class="field-label req">返航高度(ALT)</span><${d} class="num-stepper"><button type="button" class="num-stepper__btn" data-step="-10" data-target="p-rth-alt">−</button><input id="p-rth-alt" type="number" class="wh-input num-stepper__input" value="100" min="20" max="500" step="10" /><button type="button" class="num-stepper__btn" data-step="10" data-target="p-rth-alt">+</button></${d}></label>\n` +
  `            <label><span class="field-label req">适用航空器</span><select id="p-drone" class="wh-input w-full px-3 py-2"><option value="">请选择适用航空器</option></select></label>\n` +
  `            <label><span class="field-label">电量限制</span><${d} class="num-stepper num-stepper--suffix"><button type="button" class="num-stepper__btn" data-step="-5" data-target="p-battery">−</button><input id="p-battery" type="number" class="wh-input num-stepper__input" value="30" min="10" max="100" step="5" /><button type="button" class="num-stepper__btn" data-step="5" data-target="p-battery">+</button><span class="num-stepper__unit">%</span></${d}></label>\n` +
  `            <label><span class="field-label">AI识别模型</span><select id="p-ai-model" class="wh-input w-full px-3 py-2"><option value="">请选择AI模型</option><option>地铁保护区通用模型</option><option>施工机械识别模型</option><option>堆土围挡识别模型</option></select></label>\n` +
  `            <label><span class="field-label req">飞行策略</span><select id="p-strategy" class="wh-input w-full px-3 py-2"><option>立即起飞</option><option>单次定时</option><option>周期定时</option></select></label>\n` +
  `            <label><span class="field-label">巡查类型</span><select id="p-inspect-type" class="wh-input w-full px-3 py-2"><option>日常巡查</option><option>专项巡查</option><option>应急巡查</option></select></label>\n` +
  `            <label><span class="field-label req">执行方式</span><select id="p-exec-method" class="wh-input w-full px-3 py-2"><option>自主飞行</option><option>手动飞行</option></select></label>\n` +
  `          </${d}>\n` +
  `          <button type="button" id="plan-form-toggle" class="plan-form-toggle">收起</button>\n` +
  `          <${d} id="plan-form-advanced" class="plan-form-grid">\n` +
  `            <label><span class="field-label req">计划类型</span><select id="p-type" class="wh-input w-full px-3 py-2"><option>常规计划</option><option>告警复核</option><option>临时任务</option></select></label>\n` +
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
  `          <section id="exec-time-panel" class="rounded border border-cyan-400/20 bg-slate-950/25 p-4 space-y-3" aria-labelledby="exec-time-heading">\n` +
  `            <h4 id="exec-time-heading" class="text-sm font-semibold text-cyan-100">执行时间</h4>\n` +
  `            <${d} id="exec-block-single" class="exec-strategy-block">\n` +
  `              <label><span class="field-label req">计划执行时间</span><input id="p-single-datetime" type="datetime-local" class="wh-input w-full max-w-md px-3 py-2" /></label>\n` +
  `            </${d}>\n` +
  `            <${d} id="exec-block-periodic" class="exec-strategy-block space-y-4">\n` +
  `              <label><span class="field-label req">周期类型</span><select id="p-cycle-type" class="wh-input w-full max-w-xs px-3 py-2"><option value="日">日</option><option value="周">周</option><option value="月">月</option></select></label>\n` +
  `              <${d} id="exec-cycle-day" class="exec-cycle-sub">\n` +
  `                <label><span class="field-label req">每天执行时间</span><input id="p-cycle-daily-time" type="time" class="wh-input w-full max-w-xs px-3 py-2" /></label>\n` +
  `              </${d}>\n` +
  `              <${d} id="exec-cycle-week" class="exec-cycle-sub space-y-3">\n` +
  `                <${d}>\n` +
  `                  <span class="field-label req">执行星期（可多选）</span>\n` +
  `                  <${d} class="weekday-grid mt-2" id="p-weekday-wrap">\n` +
  `                    <label><input type="checkbox" class="p-weekday" value="1" />周一</label>\n` +
  `                    <label><input type="checkbox" class="p-weekday" value="2" />周二</label>\n` +
  `                    <label><input type="checkbox" class="p-weekday" value="3" />周三</label>\n` +
  `                    <label><input type="checkbox" class="p-weekday" value="4" />周四</label>\n` +
  `                    <label><input type="checkbox" class="p-weekday" value="5" />周五</label>\n` +
  `                    <label><input type="checkbox" class="p-weekday" value="6" />周六</label>\n` +
  `                    <label><input type="checkbox" class="p-weekday" value="7" />周日</label>\n` +
  `                  </${d}>\n` +
  `                </${d}>\n` +
  `                <label><span class="field-label req">执行时间</span><input id="p-cycle-week-time" type="time" class="wh-input w-full max-w-xs px-3 py-2" /></label>\n` +
  `              </${d}>\n` +
  `              <${d} id="exec-cycle-month" class="exec-cycle-sub space-y-3">\n` +
  `                <label class="block"><span class="field-label req">每月执行日期（可多选）</span>\n` +
  `                  <select id="p-cycle-month-days" class="wh-input w-full px-2 py-1 text-sm month-days-select" multiple size="8" aria-label="选择每月几号执行"></select>\n` +
  `                </label>\n` +
  `                <label><span class="field-label req">执行时间</span><input id="p-cycle-month-time" type="time" class="wh-input w-full max-w-xs px-3 py-2" /></label>\n` +
  `              </${d}>\n` +
  `            </${d}>\n` +
  `          </section>\n` +
  `          <${d} class="rounded border border-cyan-400/20 bg-cyan-950/20 p-3 text-xs text-cyan-100 leading-6">\n` +
  `            业务校验：仅可选择审批通过且空域许可有效的航线；计划需完成“提交 → 工长 → 工务 → 物管 → 车间主任 → 部门领导”审批后才允许执行；空域许可临期自动预警。\n` +
  `          </${d}>\n` +
  `        </${d}>\n` +
  `        <${d} class="px-5 py-4 border-t border-white/10 flex justify-end gap-2"><button type="button" class="wh-btn-ghost px-4 py-2" data-close="form-modal">取消</button><button type="button" id="save-plan-btn" class="wh-btn-primary px-4 py-2">确定</button></${d}>\n` +
  `      </${d}>\n` +
  `    </${d}>\n\n`;

s = s.slice(0, i0) + newForm + s.slice(i1);

const cssInsert =
  `      .modal-card--plan { width: min(920px, 96vw); }\n` +
  `      .plan-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 20px; }\n` +
  `      @media (max-width: 720px) { .plan-form-grid { grid-template-columns: 1fr; } }\n` +
  `      .plan-form-toggle { width: 100%; text-align: center; font-size: 12px; color: #67e8f9; background: transparent; border: none; cursor: pointer; padding: 4px 0; }\n` +
  `      .plan-form-toggle:hover { color: #a5f3fc; text-decoration: underline; }\n` +
  `      #plan-form-advanced.is-collapsed { display: none; }\n` +
  `      .hidden-field { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }\n` +
  `      .num-stepper { display: flex; align-items: center; gap: 0; border: 1px solid rgba(34, 211, 238, 0.22); border-radius: 6px; overflow: hidden; background: rgba(8, 47, 73, 0.35); }\n` +
  `      .num-stepper__btn { width: 32px; height: 36px; flex-shrink: 0; border: none; background: rgba(15, 55, 85, 0.9); color: #e2f5ff; font-size: 16px; cursor: pointer; line-height: 1; }\n` +
  `      .num-stepper__btn:hover { background: rgba(34, 211, 238, 0.18); }\n` +
  `      .num-stepper__input { flex: 1; min-width: 0; border: none !important; border-radius: 0 !important; text-align: center; box-shadow: none !important; }\n` +
  `      .num-stepper--suffix { position: relative; padding-right: 28px; }\n` +
  `      .num-stepper__unit { position: absolute; right: 38px; font-size: 12px; color: #9cc6df; pointer-events: none; }\n`;

if (!s.includes(".plan-form-grid")) {
  s = s.replace("      .month-days-select {", cssInsert + "      .month-days-select {");
}

fs.writeFileSync(file, s);
console.log("patched form", s.includes("p-inspect-type"), s.includes("exec-time-panel"));
