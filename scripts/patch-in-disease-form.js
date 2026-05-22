const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "..", "in-disease.html");
let s = fs.readFileSync(file, "utf8");
const d = "d" + "iv";

const styleAdd = `
    .form-input-w { width: min(360px, 100%); }
    .wh-input--readonly { background: rgba(8, 47, 73, 0.55); color: #b8d4e8; cursor: not-allowed; }
    .upload-tile {
      width: 88px; height: 88px; border: 1px dashed rgba(34, 211, 238, 0.28); border-radius: 6px;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
      color: #67e8f9; font-size: 12px; cursor: pointer; background: rgba(2, 8, 23, 0.45);
    }
    .upload-tile:hover { border-color: #22d3ee; background: rgba(34, 211, 238, 0.08); }
    .upload-tile input { display: none; }
    .dict-hint { font-size: 11px; color: #64748b; margin-left: 4px; }
`;

if (!s.includes(".upload-tile")) {
  s = s.replace("@media (max-width: 768px)", styleAdd + "\n    @media (max-width: 768px)");
}

const oldForm = `    <section id="form-view" class="hidden">
      <div class="mb-5 flex items-center gap-3">
        <button type="button" class="w-8 h-8 rounded-md wh-btn-ghost" data-action="back-list"><i class="fa-solid fa-arrow-left"></i></button>
        <div><h1 class="text-base font-semibold text-white tracking-tight">编辑病害</h1><motion class="text-[11px] text-slate-400 mt-0.5">新增/编辑病害</motion></motion>
      </motion>
      <motion class="neon-panel neon-panel--tight p-6">
        <motion class="max-w-[980px] space-y-4">
          <motion class="flex items-center gap-4"><label class="form-label required">编号：</label><input class="wh-input h-8 w-[360px] px-2" value="15069" /></motion>
          <motion class="flex items-center gap-4"><label class="form-label required">所属线路：</label><select class="wh-input h-8 w-[360px] px-2"><option>2号线</option></select></motion>
          <motion class="flex items-start gap-4"><label class="form-label">病害描述：</label><textarea class="wh-input min-h-[86px] flex-1 px-2 py-2">常青区间Z1+644中心沟盖板鼓包</textarea></motion>
          <motion class="flex justify-center gap-3 pt-5 border-t border-cyan-400/10"><button type="button" class="px-6 py-2 rounded text-xs wh-btn-primary" data-action="back-list">保存</button><button type="button" class="px-6 py-2 rounded text-xs wh-btn-ghost" data-action="back-list">取消</button></motion>
        </motion>
      </motion>
    </section>`;

const newForm =
  `    <section id="form-view" class="hidden">
      <${d} class="mb-5 flex items-center gap-3">
        <button type="button" class="w-8 h-8 rounded-md wh-btn-ghost" data-action="back-list"><i class="fa-solid fa-arrow-left"></i></button>
        <${d}><h1 id="form-page-title" class="text-base font-semibold text-white tracking-tight">新建病害</h1><${d} class="text-[11px] text-slate-400 mt-0.5">新增/编辑病害</${d}></${d}>
      </${d}>
      <${d} class="neon-panel neon-panel--tight p-6">
        <${d} class="max-w-[980px] space-y-4 text-xs">
          <${d} class="flex items-center gap-4"><label class="form-label required">编号：</label><input id="f-id" type="text" class="wh-input wh-input--readonly h-8 form-input-w px-2" readonly tabindex="-1" /></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label required">所属线路：</label><select id="f-line" class="wh-input h-8 form-input-w px-2"><option value="">请选择所属线路</option><option value="2号线">2号线</option><option value="5号线">5号线</option><option value="7号线">7号线</option></select></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label required">上下行：</label><select id="f-direction" class="wh-input h-8 form-input-w px-2"><option value="">请选择上下行</option><option value="上行">上行</option><option value="下行">下行</option></select></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label">所在区间：</label><select id="f-section" class="wh-input h-8 form-input-w px-2"><option value="">请选择所在区间</option><option value="常青花园-长港路">常青花园-长港路</option><option value="长港路-汉口火车站">长港路-汉口火车站</option><option value="白沙六路-光霞">白沙六路-光霞</option></select></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label">站点：</label><select id="f-station" class="wh-input h-8 form-input-w px-2"><option value="">请选择站点</option><option value="常青花园">常青花园</option><option value="长港路">长港路</option><option value="汉口火车站">汉口火车站</option></select></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label required">病害里程：</label><input id="f-mileage" class="wh-input h-8 form-input-w px-2" placeholder="病害里程" /></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label required">巡查项<span class="dict-hint">（数据字典）</span>：</label><select id="f-inspect-item" class="wh-input h-8 form-input-w px-2"></select></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label required">结构类型<span class="dict-hint">（数据字典）</span>：</label><select id="f-structure-type" class="wh-input h-8 form-input-w px-2"></select></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label required">病害类型<span class="dict-hint">（数据字典）</span>：</label><select id="f-disease-type" class="wh-input h-8 form-input-w px-2"></select></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label required">病害程度<span class="dict-hint">（数据字典）</span>：</label><select id="f-disease-level" class="wh-input h-8 form-input-w px-2"></select></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label required">病害发展<span class="dict-hint">（数据字典）</span>：</label><select id="f-disease-development" class="wh-input h-8 form-input-w px-2"></select></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label">环号：</label><input id="f-ring" class="wh-input h-8 form-input-w px-2" placeholder="环号" /></${d}>
          <${d} class="flex items-start gap-4"><label class="form-label pt-1">病害描述：</label><textarea id="f-desc" class="wh-input min-h-[86px] flex-1 px-2 py-2" placeholder="请输入病害描述"></textarea></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label">标签：</label><input id="f-tags" class="wh-input h-8 flex-1 max-w-[720px] px-2" placeholder="标签" /></${d}>
          <${d} class="flex items-start gap-4"><label class="form-label pt-2">病害照片：</label><${d} class="flex flex-wrap gap-3"><label class="upload-tile"><i class="fa-solid fa-plus text-lg"></i><span>上传</span><input id="f-photo-input" type="file" accept="image/*" multiple /></label><span id="f-photo-names" class="text-slate-500 text-xs leading-8"></span></${d}></${d}>
          <${d} class="flex items-start gap-4"><label class="form-label pt-2">病害视频：</label><${d} class="flex flex-wrap gap-3"><label class="upload-tile"><i class="fa-solid fa-plus text-lg"></i><span>上传</span><input id="f-video-input" type="file" accept="video/*" multiple /></label><span id="f-video-names" class="text-slate-500 text-xs leading-8"></span></${d}></${d}>
          <${d} class="flex items-center gap-4"><label class="form-label">关联历史病害：</label><select id="f-history" class="wh-input h-8 flex-1 max-w-[720px] px-2"><option value="">请选择关联历史病害</option></select></${d}>
          <${d} class="flex justify-end gap-3 pt-5 border-t border-cyan-400/10"><button type="button" class="px-6 py-2 rounded text-xs wh-btn-ghost" data-action="back-list">取消</button><button type="button" class="px-6 py-2 rounded text-xs wh-btn-primary" data-action="save-item">保存</button></${d}>
        </${d}>
      </${d}>
    </section>`;

const oldFormReal =
  `    <section id="form-view" class="hidden">
      <div class="mb-5 flex items-center gap-3">
        <button type="button" class="w-8 h-8 rounded-md wh-btn-ghost" data-action="back-list"><i class="fa-solid fa-arrow-left"></i></button>
        <motion><h1 class="text-base font-semibold text-white tracking-tight">编辑病害</h1><motion class="text-[11px] text-slate-400 mt-0.5">新增/编辑病害</motion></motion>
      </motion>
      <motion class="neon-panel neon-panel--tight p-6">
        <motion class="max-w-[980px] space-y-4">
          <motion class="flex items-center gap-4"><label class="form-label required">编号：</label><input class="wh-input h-8 w-[360px] px-2" value="15069" /></motion>
          <motion class="flex items-center gap-4"><label class="form-label required">所属线路：</label><select class="wh-input h-8 w-[360px] px-2"><option>2号线</option></select></motion>
          <motion class="flex items-start gap-4"><label class="form-label">病害描述：</label><textarea class="wh-input min-h-[86px] flex-1 px-2 py-2">常青区间Z1+644中心沟盖板鼓包</textarea></motion>
          <motion class="flex justify-center gap-3 pt-5 border-t border-cyan-400/10"><button type="button" class="px-6 py-2 rounded text-xs wh-btn-primary" data-action="back-list">保存</button><button type="button" class="px-6 py-2 rounded text-xs wh-btn-ghost" data-action="back-list">取消</button></motion>
        </motion>
      </motion>
    </section>`;

let oldBlock = oldFormReal.replace(/motion/g, d);
if (!s.includes(oldBlock.slice(0, 80))) {
  oldBlock = `    <section id="form-view" class="hidden">
      <div class="mb-5 flex items-center gap-3">
        <button type="button" class="w-8 h-8 rounded-md wh-btn-ghost" data-action="back-list"><i class="fa-solid fa-arrow-left"></i></button>
        <motion><h1 class="text-base font-semibold text-white tracking-tight">编辑病害</h1><motion class="text-[11px] text-slate-400 mt-0.5">新增/编辑病害</motion></motion>
      </motion>
      <motion class="neon-panel neon-panel--tight p-6">
        <motion class="max-w-[980px] space-y-4">
          <motion class="flex items-center gap-4"><label class="form-label required">编号：</label><input class="wh-input h-8 w-[360px] px-2" value="15069" /></motion>
          <motion class="flex items-center gap-4"><label class="form-label required">所属线路：</label><select class="wh-input h-8 w-[360px] px-2"><option>2号线</option></select></motion>
          <motion class="flex items-start gap-4"><label class="form-label">病害描述：</label><textarea class="wh-input min-h-[86px] flex-1 px-2 py-2">常青区间Z1+644中心沟盖板鼓包</textarea></motion>
          <motion class="flex justify-center gap-3 pt-5 border-t border-cyan-400/10"><button type="button" class="px-6 py-2 rounded text-xs wh-btn-primary" data-action="back-list">保存</button><button type="button" class="px-6 py-2 rounded text-xs wh-btn-ghost" data-action="back-list">取消</button></motion>
        </motion>
      </motion>
    </section>`.replace(/motion/g, d);
}

if (!s.includes('id="f-id"')) {
  if (!s.includes(oldBlock)) {
    console.error("form block not found");
    process.exit(1);
  }
  s = s.replace(oldBlock, newForm);
}

if (!s.includes("disease-dict.js")) {
  s = s.replace(
    '<script src="assets/js/menu-config.js">',
    '<script src="assets/js/disease-dict.js"></script>\n  <script src="assets/js/menu-config.js">'
  );
}

fs.writeFileSync(file, s);
console.log("form ok", s.includes("f-inspect-item"));
