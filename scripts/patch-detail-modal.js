const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "map-flight-plan.html");
let s = fs.readFileSync(file, "utf8");
const d = "d" + "iv";

if (!s.includes(".modal-card--detail")) {
  s = s.replace(
    ".modal-card--plan { width: min(920px, 96vw); }",
    `.modal-card--plan { width: min(920px, 96vw); }\n      .modal-card--detail { width: min(960px, 96vw); }\n      .plan-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; }\n      .plan-detail-field__label { font-size: 12px; color: #9cc6df; margin-bottom: 4px; }\n      .plan-detail-field__value { font-size: 13px; color: #e2f5ff; line-height: 1.45; word-break: break-word; }\n      .plan-detail-field--full { grid-column: 1 / -1; }\n      @media (max-width: 720px) { .plan-detail-layout { grid-template-columns: 1fr !important; } }`
  );
}

s = s.replace(
  `<${d} id="detail-modal" class="modal-mask"><${d} class="modal-card"><${d} class="flex items-center justify-between px-5 py-4 border-b border-white/10"><h3 class="text-base font-semibold">查阅计划</h3>`,
  `<${d} id="detail-modal" class="modal-mask"><${d} class="modal-card modal-card--detail"><${d} class="flex items-center justify-between px-5 py-4 border-b border-white/10"><h3 class="text-base font-semibold">查阅计划</h3>`
);

const oldDetail = `      function detailHtml(p){
        const vals=[p.name,p.route,p.airport,p.drone,p.type,p.strategy,p.line,p.applicant,p.submit,p.audit,p.exec,p.planTime];
        return \`<${d} class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">\${["计划名称","航线名称","起降机场","无人机设备","计划类型","飞行策略","所属线路","申请人","提交时间","审核状态","执行状态","计划执行时间"].map((k,i)=>\`<${d} class="rounded border border-cyan-400/15 bg-slate-900/35 p-3"><${d} class="text-cyan-300 text-xs mb-1">\${k}</${d}><${d}>\${vals[i]}</${d}></${d}>\`).join("")}</${d}><${d} class="mt-4 rounded border border-cyan-400/15 p-3 text-xs leading-6">审批流程：提交 → 工长 → 工务 → 物管 → 车间主任 → 部门领导。当前计划\${p.audit === "审核通过" ? "已满足执行条件，系统将在计划时间自动校验并执行。" : p.audit === "已驳回" ? "已退回，可复制或编辑后重新提交。" : "正在审批中，未通过前不能起飞。"}</${d}>\`;
      }
      function showDetail(id){ const p=plans.find(x=>x.id===id); $("detail-box").innerHTML = detailHtml(p); openModal("detail-modal"); }`;

const newDetail = `      function getPlanExtraDisplay(p){
        const x=p.planExtra||{};
        return {
          aiModel:x.aiModel||"—",
          inspectType:x.inspectType||"日常巡查",
          flightMode:x.flightMode||"超视距",
          rthMode:x.rthMode||"设定高度",
          routeLostAction:x.routeLostAction||"返航",
          mountDevice:x.mountDevice||"—",
          rthAlt:x.rthAlt!=null?x.rthAlt+" m":"100 m",
          batteryLimit:x.batteryLimit!=null?x.batteryLimit+"%":"30%",
          execMethod:normalizeExecMethod(x.execMethod),
          taskPrecision:normalizeTaskPrecision(x.taskPrecision),
          rcLostAction:x.rcLostAction||"返航",
          pilot:x.pilot||"武汉地保1",
          videoMode:normalizeVideoMode(x.videoMode),
        };
      }
      function airspaceStatusText(p){
        if(p.audit!=="审核通过") return "—";
        return isAirspaceValid(p)?"有效期内":"不在有效期内";
      }
      function detailField(label,value,full){
        const v=value===undefined||value===null||value===""?"—":value;
        return \`<${d} class="plan-detail-field\${full?" plan-detail-field--full":""}"><${d} class="plan-detail-field__label">\${label}</${d}><${d} class="plan-detail-field__value">\${v}</${d}></${d}>\`;
      }
      function approvalRecordsInner(p){
        return \`<${d} class="text-sm font-semibold text-cyan-100 mb-4">审批记录</${d}><${d} class="max-h-[min(520px,58vh)] overflow-y-auto pr-1">\${renderApprovalRecords(p)}</${d}>\`;
      }
      function detailHtml(p){
        const x=getPlanExtraDisplay(p);
        const fields=[
          detailField("计划名称",p.name,true),
          detailField("飞行航线",p.route),
          detailField("适用机场",p.airport),
          detailField("适用航空器",p.drone),
          detailField("返航高度(ALT)",x.rthAlt),
          detailField("AI识别模型",x.aiModel),
          detailField("电量限制",x.batteryLimit),
          detailField("巡查类型",x.inspectType),
          detailField("飞行策略",p.strategy),
          detailField("执行时间",p.planTime,true),
          detailField("计划类型",displayPlanType(normalizePlanType(p.type))),
          detailField("执行方式",x.execMethod),
          detailField("任务精度",x.taskPrecision),
          detailField("飞行模式",x.flightMode),
          detailField("遥控器失控动作",x.rcLostAction),
          detailField("返航高度模式",x.rthMode),
          detailField("飞手",x.pilot),
          detailField("航线失控动作",x.routeLostAction),
          detailField("视频模式",x.videoMode),
          detailField("适用挂载设备",x.mountDevice),
          detailField("所属线路",p.line),
          detailField("申请人",p.applicant),
          detailField("提交时间",p.submit),
          detailField("审核状态",p.audit),
          detailField("执行状态",p.exec),
          detailField("计划执行时间",p.planTime),
          detailField("实际执行时间",p.actualStart),
          detailField("实际结束时间",p.actualEnd),
          detailField("空域许可",airspaceStatusText(p)),
        ];
        return \`<${d} class="mb-4 flex items-center justify-between gap-3"><${d}><${d} class="text-cyan-100 font-semibold">\${p.name}</${d}><${d} class="mt-1 text-xs text-slate-400">审批流程：提交 → 工长 → 工务 → 物管 → 车间主任 → 部门领导</${d}></${d}>\${auditBadge(p.audit)}</${d}><${d} class="grid plan-detail-layout md:grid-cols-[1fr_340px] gap-4"><section class="rounded border border-cyan-400/20 bg-slate-950/25 p-4"><${d} class="text-sm font-semibold text-cyan-100 mb-3">计划详情</${d}><${d} class="plan-detail-grid">\${fields.join("")}</${d}></section><section class="rounded border border-cyan-400/20 bg-slate-950/25 p-4">\${approvalRecordsInner(p)}</section></${d}>\`;
      }
      function showDetail(id){
        const p=plans.find(x=>x.id===id);
        if(!p) return;
        $("detail-box").innerHTML=detailHtml(p);
        openModal("detail-modal");
      }`;

if (!s.includes(oldDetail)) {
  console.error("detailHtml block not found");
  process.exit(1);
}
s = s.replace(oldDetail, newDetail);

s = s.replace(
  'const side=`<div class="text-sm font-semibold text-cyan-100 mb-4">审批记录</motion><motion id="approval-records">${renderApprovalRecords(p)}</motion>`;',
  "const side=approvalRecordsInner(p);"
);
// fix if div not motion in file
if (s.includes('id="approval-records"')) {
  s = s.replace(
    /const side=`<div class="text-sm font-semibold text-cyan-100 mb-4">审批记录<\/motion><[^>]+ id="approval-records">\$\{renderApprovalRecords\(p\)\}<\/[^>]+>`;/,
    "const side=approvalRecordsInner(p);"
  );
}

const showApprovalLine = s.match(/const side=.*renderApprovalRecords/);
if (showApprovalLine) {
  s = s.replace(
    /const side=`<div class="text-sm font-semibold text-cyan-100 mb-4">审批记录<\/motion><div id="approval-records">\$\{renderApprovalRecords\(p\)\}<\/motion>`;/,
    "const side=approvalRecordsInner(p);"
  );
}

// direct replace for actual file content
s = s.replace(
  'const side=`<motion class="text-sm font-semibold text-cyan-100 mb-4">审批记录</motion><motion id="approval-records">${renderApprovalRecords(p)}</motion>`;'.replace(/motion/g, d),
  "const side=approvalRecordsInner(p);"
);

const needle =
  'const side=`<div class="text-sm font-semibold text-cyan-100 mb-4">审批记录</motion><div id="approval-records">${renderApprovalRecords(p)}</div>`;';
if (s.includes(needle.replace(/motion/g, d))) {
  s = s.replace(needle, "const side=approvalRecordsInner(p);");
} else if (s.includes('const side=`<div class="text-sm font-semibold text-cyan-100 mb-4">审批记录</motion><div id="approval-records">${renderApprovalRecords(p)}</div>`;')) {
  s = s.replace(
    'const side=`<div class="text-sm font-semibold text-cyan-100 mb-4">审批记录</div><motion id="approval-records">${renderApprovalRecords(p)}</motion>`;',
    "const side=approvalRecordsInner(p);"
  );
}

// grep actual line
const idx = s.indexOf("审批记录</div><motion id");
if (idx < 0) {
  const idx2 = s.indexOf('审批记录</motion><motion id="approval-records"');
  const idx3 = s.indexOf('审批记录</div><div id="approval-records"');
  if (idx3 >= 0) {
    const lineStart = s.lastIndexOf("const side=", idx3);
    const lineEnd = s.indexOf(";", idx3) + 1;
    s = s.slice(0, lineStart) + "const side=approvalRecordsInner(p);" + s.slice(lineEnd);
  }
} else {
  const lineStart = s.lastIndexOf("const side=", idx);
  const lineEnd = s.indexOf(";", idx) + 1;
  s = s.slice(0, lineStart) + "const side=approvalRecordsInner(p);" + s.slice(lineEnd);
}

// Add planExtra to id1 for richer demo
if (!s.includes("planExtra:")) {
  s = s.replace(
    'airspaceValid:true,exec:"未执行",planTime:"2026-05-13 15:30"',
    'airspaceValid:true,exec:"未执行",planTime:"2026-05-13 15:30",planExtra:{aiModel:"地铁保护区通用模型",inspectType:"日常巡查",flightMode:"超视距",rthMode:"设定高度",routeLostAction:"返航",mountDevice:"可见光相机",rthAlt:100,batteryLimit:30,execMethod:"自主飞行",taskPrecision:"GNSS",rcLostAction:"返航",pilot:"武汉地保1",videoMode:"默认"}'
  );
}

fs.writeFileSync(file, s);
console.log("ok", s.includes("approvalRecordsInner"), s.includes("plan-detail-layout"));
