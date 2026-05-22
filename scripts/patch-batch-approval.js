const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "map-flight-plan.html");
let s = fs.readFileSync(file, "utf8");
const d = "d" + "iv";

const oldShow = `      function showApproval(id){
        approvalId=id;
        const p=plans.find(x=>x.id===id);
        $("approval-box").innerHTML=\`<${d} class="mb-4 flex items-center justify-between gap-3"><${d}><${d} class="text-cyan-100 font-semibold">\${p.name}</${d}><${d} class="mt-1 text-xs text-slate-400">审批流程：提交 → 工长 → 工务 → 物管 → 车间主任 → 部门领导</${d}></${d}>\${auditBadge(p.audit)}</${d}><${d} class="grid md:grid-cols-[360px_1fr] gap-4"><section class="rounded border border-cyan-400/20 bg-slate-950/25 p-4"><${d} class="text-sm font-semibold text-cyan-100 mb-3">审批意见</${d}><label><span class="field-label">审批意见</span><textarea id="approval-opinion" class="wh-input w-full px-3 py-2 min-h-[132px]" placeholder="请输入审批意见">同意该飞行计划按审批流程继续执行。</textarea></label><${d} class="mt-4 flex justify-end gap-2"><button id="reject-btn" class="wh-btn-ghost px-4 py-2">驳回</button><button id="approve-btn" class="wh-btn-primary px-4 py-2">审批通过</button></${d}><${d} class="mt-3 text-xs text-cyan-100 leading-6">系统校验：飞行计划审批通过、航线空域许可有效、无人机满足起飞条件才允许起飞。</${d}></section><section class="rounded border border-cyan-400/20 bg-slate-950/25 p-4"><${d} class="text-sm font-semibold text-cyan-100 mb-4">审批记录</${d}><${d} id="approval-records">\${renderApprovalRecords(p)}</${d}></section></${d}>\`;
        $("approve-btn").onclick=()=>submitApproval("审批通过");
        $("reject-btn").onclick=()=>submitApproval("已驳回");
        openModal("approval-modal");
      }`;

const newBlock = `      function approvalActionSection(){
        return \`<section class="rounded border border-cyan-400/20 bg-slate-950/25 p-4"><${d} class="text-sm font-semibold text-cyan-100 mb-3">审批意见</${d}><label><span class="field-label">审批意见</span><textarea id="approval-opinion" class="wh-input w-full px-3 py-2 min-h-[132px]" placeholder="请输入审批意见">同意该飞行计划按审批流程继续执行。</textarea></label><${d} class="mt-4 flex justify-end gap-2"><button type="button" id="reject-btn" class="wh-btn-ghost px-4 py-2">驳回</button><button type="button" id="approve-btn" class="wh-btn-primary px-4 py-2">审批通过</button></${d}><${d} class="mt-3 text-xs text-cyan-100 leading-6">系统校验：飞行计划审批通过、航线空域许可有效、无人机满足起飞条件才允许起飞。</${d}></section>\`;
      }
      function bindApprovalActions(){
        $("approve-btn").onclick=()=>submitApproval("审核通过");
        $("reject-btn").onclick=()=>submitApproval("已驳回");
      }
      function renderBatchApprovalList(selected){
        return selected.map(p=>\`<${d} class="flex items-center justify-between gap-3 py-2 border-b border-cyan-400/10 last:border-0"><${d} class="min-w-0"><${d} class="text-cyan-100 font-medium truncate">\${p.name}</${d}><${d} class="text-xs text-slate-400 mt-0.5">\${p.route} · \${p.line}</${d}></${d}>\${auditBadge(p.audit)}</${d}>\`).join("");
      }
      function openApprovalModal(headerHtml, sideHtml){
        $("approval-box").innerHTML=headerHtml+\`<${d} class="grid md:grid-cols-[360px_1fr] gap-4">\`+approvalActionSection()+\`<section class="rounded border border-cyan-400/20 bg-slate-950/25 p-4">\`+sideHtml+\`</section></${d}>\`;
        bindApprovalActions();
        openModal("approval-modal");
      }
      function showApproval(id){
        const p=plans.find(x=>x.id===id);
        if(!p) return;
        if(p.audit!=="审核中") return toast("仅「审核中」状态的计划可审批");
        approvalId=id;
        approvalBatchIds=null;
        const header=\`<${d} class="mb-4 flex items-center justify-between gap-3"><${d}><${d} class="text-cyan-100 font-semibold">\${p.name}</${d}><${d} class="mt-1 text-xs text-slate-400">审批流程：提交 → 工长 → 工务 → 物管 → 车间主任 → 部门领导</${d}></${d}>\${auditBadge(p.audit)}</${d}>\`;
        const side=\`<${d} class="text-sm font-semibold text-cyan-100 mb-4">审批记录</${d}><${d} id="approval-records">\${renderApprovalRecords(p)}</${d}>\`;
        openApprovalModal(header, side);
      }
      function openBatchApproval(){
        const ids=[...document.querySelectorAll(".row-check:checked:not(:disabled)")].map(c=>Number(c.value));
        if(!ids.length) return toast("请选择需要审批的计划");
        const selected=ids.map(id=>plans.find(x=>x.id===id)).filter(Boolean);
        const invalid=selected.filter(p=>p.audit!=="审核中");
        if(invalid.length) return toast("批量审批仅支持「审核中」状态的飞行计划");
        approvalId=null;
        approvalBatchIds=ids;
        const header=\`<${d} class="mb-4 flex items-center justify-between gap-3"><${d}><${d} class="text-cyan-100 font-semibold">批量审批（\${selected.length} 条）</${d}><${d} class="mt-1 text-xs text-slate-400">审批流程：提交 → 工长 → 工务 → 物管 → 车间主任 → 部门领导</${d}></${d}>\${auditBadge("审核中")}</${d}>\`;
        const side=\`<${d} class="text-sm font-semibold text-cyan-100 mb-3">待审批计划</${d}><${d} class="max-h-[320px] overflow-y-auto pr-1">\${renderBatchApprovalList(selected)}</${d}>\`;
        openApprovalModal(header, side);
      }`;

if (!s.includes(oldShow)) {
  console.error("showApproval block not found");
  process.exit(1);
}
s = s.replace(oldShow, newBlock);

const oldSubmit = `      function submitApproval(status){
        const p=plans.find(x=>x.id===approvalId);
        const opinion=($("approval-opinion")?.value || "").trim();
        if(!opinion) return toast("请填写审批意见");
        p.audit=status;
        if(status === "已驳回") p.exec="执行终止";
        if(status === "审批通过" && p.exec === "执行终止") p.exec="未执行";
        closeModal("approval-modal");
        render();
        toast(status === "审批通过" ? "审批通过，已写入审批记录" : "已驳回，审批意见已记录");
      }`;

const newSubmit = `      function submitApproval(status){
        const ids=approvalBatchIds && approvalBatchIds.length ? approvalBatchIds.slice() : approvalId ? [approvalId] : [];
        if(!ids.length) return;
        const opinion=($("approval-opinion")?.value || "").trim();
        if(!opinion) return toast("请填写审批意见");
        const isBatch=ids.length>1;
        let applied=0;
        ids.forEach(function(id){
          const p=plans.find(x=>x.id===id);
          if(!p||p.audit!=="审核中") return;
          p.audit=status;
          if(status==="已驳回") p.exec="执行终止";
          if(status==="审核通过"&&p.exec==="执行终止") p.exec="未执行";
          applied++;
        });
        approvalId=null;
        approvalBatchIds=null;
        closeModal("approval-modal");
        render();
        if(!applied) return toast("所选计划均不可审批");
        if(isBatch){
          toast(status==="审核通过" ? "已批量审批通过 "+applied+" 条" : "已批量驳回 "+applied+" 条");
        } else {
          toast(status==="审核通过" ? "审批通过，已写入审批记录" : "已驳回，审批意见已记录");
        }
      }`;

if (!s.includes(oldSubmit)) {
  console.error("submitApproval not found");
  process.exit(1);
}
s = s.replace(oldSubmit, newSubmit);

s = s.replace(
  `$("check-all").onchange=e=>document.querySelectorAll(".row-check").forEach(c=>c.checked=e.target.checked);`,
  `$("check-all").onchange=e=>document.querySelectorAll(".row-check:not(:disabled)").forEach(c=>c.checked=e.target.checked);\n      document.addEventListener("change",e=>{ if(e.target.classList&&e.target.classList.contains("row-check")) syncCheckAllState(); });\n      $("batch-approve-btn").onclick=openBatchApproval;`
);

s = s.replace(
  `$("batch-approve-btn").onclick=()=>{ const ids=[...document.querySelectorAll(".row-check:checked")].map(c=>Number(c.value)); if(!ids.length) return toast("请选择需要审批的计划"); plans.forEach(p=>{ if(ids.includes(p.id)) p.audit="审核通过"; }); render(); toast("已批量审批通过"); };`,
  ""
);

fs.writeFileSync(file, s);
console.log("ok", s.includes("openBatchApproval"));
