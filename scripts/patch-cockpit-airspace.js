const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "map-flight-plan.html");
let s = fs.readFileSync(file, "utf8");
const d = "d" + "iv";

const modal =
  `    <${d} id="cockpit-airspace-modal" class="modal-mask"><${d} class="modal-card" style="width:min(440px,92vw)"><${d} class="flex items-center justify-between px-5 py-4 border-b border-white/10"><h3 class="text-base font-semibold">虚拟座舱</h3><button type="button" class="wh-modal-close" data-close="cockpit-airspace-modal" aria-label="关闭">×</button></${d}><p id="cockpit-airspace-msg" class="px-5 py-6 text-sm text-cyan-50 leading-7"></p><${d} id="cockpit-airspace-actions-blocked" class="hidden px-5 py-4 border-t border-white/10 flex justify-end"><button type="button" class="wh-btn-primary px-4 py-2" data-close="cockpit-airspace-modal">关闭</button></${d}><${d} id="cockpit-airspace-actions-confirm" class="hidden px-5 py-4 border-t border-white/10 flex justify-end gap-2"><button type="button" class="wh-btn-ghost px-4 py-2" data-close="cockpit-airspace-modal">取消</button><button type="button" id="cockpit-launch-btn" class="wh-btn-primary px-4 py-2">立即起飞</button></${d}></${d}></${d}>\n`;

if (!s.includes("cockpit-airspace-modal")) {
  s = s.replace(
    `    <${d} id="toast" class="fixed right-5 bottom-5`,
    modal + `    <${d} id="toast" class="fixed right-5 bottom-5`
  );
}

s = s.replace(
  '{id:1,name:"8号线车辆段常规巡检",route:"车辆段日常巡查航线",airport:"车辆段机场",drone:"车辆段无人机 M350",type:"常规巡检",strategy:"单次定时",line:"8号线",applicant:"张三",submit:"2026-05-13 09:20",audit:"审核通过",exec:"未执行",',
  '{id:1,name:"8号线车辆段常规巡检",route:"车辆段日常巡查航线",airport:"车辆段机场",drone:"车辆段无人机 M350",type:"常规巡检",strategy:"单次定时",line:"8号线",applicant:"张三",submit:"2026-05-13 09:20",audit:"审核通过",airspaceValid:true,exec:"未执行",'
);
s = s.replace(
  '{id:4,name:"青山站周期巡检",route:"青山站周期巡检航线",airport:"青山机场",drone:"青山巡检无人机 M350",type:"常规巡检",strategy:"周期定时",line:"5号线",applicant:"赵六",submit:"2026-05-11 14:05",audit:"审核通过",exec:"已执行",',
  '{id:4,name:"青山站周期巡检",route:"青山站周期巡检航线",airport:"青山机场",drone:"青山巡检无人机 M350",type:"常规巡检",strategy:"周期定时",line:"5号线",applicant:"赵六",submit:"2026-05-11 14:05",audit:"审核通过",airspaceValid:false,exec:"已执行",'
);

const oldOpen =
  'function openCockpit(id){ const p=plans.find(x=>x.id===id); if(p.audit!=="审核通过") return toast("飞行计划未审批通过，不能进入虚拟座舱"); location.href="map-cockpit-prep.html"; }';

const newOpen = `function isAirspaceValid(p){ return p.airspaceValid !== false; }
      function showCockpitAirspaceModal(mode){
        const blocked=$("cockpit-airspace-actions-blocked");
        const confirm=$("cockpit-airspace-actions-confirm");
        if(mode==="blocked"){
          $("cockpit-airspace-msg").textContent="相关空域不在有效期内，无法起飞";
          blocked.classList.remove("hidden");
          confirm.classList.add("hidden");
        } else {
          $("cockpit-airspace-msg").textContent="相关空域在有效期内，请确认是否立即起飞";
          blocked.classList.add("hidden");
          confirm.classList.remove("hidden");
        }
        openModal("cockpit-airspace-modal");
      }
      function openCockpit(id){
        const p=plans.find(x=>x.id===id);
        if(!p||p.audit!=="审核通过") return toast("飞行计划未审批通过，不能进入虚拟座舱");
        if(isAirspaceValid(p)) showCockpitAirspaceModal("confirm");
        else showCockpitAirspaceModal("blocked");
      }`;

if (!s.includes(oldOpen)) {
  console.error("openCockpit not found");
  process.exit(1);
}
s = s.replace(oldOpen, newOpen);

if (!s.includes('cockpit-launch-btn").onclick')) {
  s = s.replace(
    'document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>closeModal(b.dataset.close));',
    'document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>closeModal(b.dataset.close));\n      $("cockpit-launch-btn").onclick=()=>{ closeModal("cockpit-airspace-modal"); location.href="map-cockpit-prep.html"; };'
  );
}

fs.writeFileSync(file, s);
console.log("ok", s.includes("airspaceValid:true"), s.includes("showCockpitAirspaceModal"));
