/**
 * 批量生成带侧栏的标准 B2B 列表/表单原型页（内容区结构一致，文案按模块区分）。
 * 运行：node scripts/generate-inner-pages.js
 */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

const head = (title) => `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous" />
  <link rel="stylesheet" href="../assets/css/theme.css" />
</head>`;

function moduleName(top) {
  const map = {
    dc: "数据中心",
    am: "资产管理",
    in: "智慧巡检",
    wb: "我的工作台",
    patrol: "巡查记录",
    st: "数据统计",
    cockpit: "虚拟座舱",
    map: "全景地图",
    ai: "AI识别",
  };
  return map[top] || "";
}

function metricsRow(items) {
  return `<div class="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
  ${items
    .map((m) => {
      const ic = m.icon || "fa-solid fa-chart-line";
      const tone = m.iconTone || "text-cyan-300";
      const neg = /(^|\s)-\d/.test(String(m.delta));
      const deltaHtml = m.delta
        ? `<div class="text-[11px] mt-1.5 font-medium ${neg ? "text-rose-300" : "text-emerald-300"}">${m.delta}</div>`
        : "";
      return `<div class="wh-kpi-card text-white flex gap-3 items-start">
      <div class="wh-kpi-icon ${tone} shrink-0"><i class="${ic}"></i></div>
      <div class="flex-1 min-w-0 relative z-[1]">
        <div class="text-[11px] font-medium tracking-wide text-sky-200/75">${m.label}</div>
        <div class="text-2xl font-bold mt-1 leading-tight">${m.value}</div>
        ${deltaHtml}
      </div>
    </div>`;
    })
    .join("")}
</div>`;
}

function wrapPage(title, top, key, inner) {
  const mod = moduleName(top);
  return `${head(title)}
<body data-shell="default" data-top="${top}" data-sidebar-key="${key}"${top === "wb" ? ' data-wb-view="page"' : ""}>
  <div id="page-root" class="max-w-[1920px] mx-auto min-h-full">
    <nav class="neon-panel neon-panel--tight mb-4 px-4 py-2.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
      <span class="text-cyan-400"><i class="fa-solid fa-location-crosshairs"></i></span>
      <span class="text-slate-600">/</span>
      <span>${mod}</span>
      <span class="text-slate-600">/</span>
      <span class="text-cyan-50 font-semibold tracking-wide">${title}</span>
    </nav>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-cyan-400/10 pb-3">
      <h1 class="text-base md:text-lg font-semibold text-white tracking-tight" style="text-shadow:0 0 20px rgba(34,211,238,0.25)">${title}</h1>
      <span class="text-[10px] px-2 py-1 rounded-md border border-cyan-400/25 text-cyan-100/80 bg-cyan-500/5">运维指挥视图 · 示例数据</span>
    </div>
    ${inner}
  </div>
  <script src="../assets/js/menu-config.js"></script>
  ${top === "wb" ? '<script src="../assets/js/workbench-mega.js"></script>\n  ' : ""}<script src="../assets/js/shell.js"></script>
</body>
</html>`;
}

function filtersAboveTable() {
  return `<div class="neon-panel neon-panel--tight p-3">
    <div class="flex flex-wrap items-end gap-3 lg:gap-4">
      <div class="min-w-[160px]">
        <div class="wh-filter-label mb-1.5">筛选状态</div>
        <div class="flex flex-wrap gap-1.5">
          <button type="button" class="wh-chip wh-chip--active">全部</button>
          <button type="button" class="wh-chip">进行中</button>
          <button type="button" class="wh-chip">已完成</button>
          <button type="button" class="wh-chip">待处理</button>
        </div>
      </div>
      <div class="min-w-[128px]">
        <label class="wh-filter-label block mb-1">业务类型</label>
        <select class="wh-input w-full px-2 py-1.5"><option>全部类型</option><option>故障维修</option><option>定期巡检</option><option>保养</option></select>
      </div>
      <div class="flex flex-wrap gap-2 items-end">
        <div>
          <label class="wh-filter-label block mb-1">开始日期</label>
          <input type="date" class="wh-input px-2 py-1.5 w-36" />
        </div>
        <div>
          <label class="wh-filter-label block mb-1">结束日期</label>
          <input type="date" class="wh-input px-2 py-1.5 w-36" />
        </div>
      </div>
      <div class="flex gap-2 ml-auto">
        <button type="button" class="px-4 py-1.5 rounded text-xs wh-btn-primary">查询</button>
        <button type="button" class="px-4 py-1.5 rounded text-xs wh-btn-ghost">重置</button>
      </div>
    </div>
  </div>`;
}

/** 筛选条在表格上方；不含右侧快捷栏 */
function standardToolbar() {
  return `<div class="w-full max-w-full space-y-3">
      ${filtersAboveTable()}
      <div class="neon-panel neon-panel--tight p-3 flex flex-wrap gap-2 items-center">
        <button type="button" class="px-4 py-2 rounded-md text-xs font-semibold transition-ui wh-btn-gold">
          <i class="fa-solid fa-plus mr-1"></i>新增记录
        </button>
        <button type="button" class="px-3 py-2 rounded-md text-xs wh-btn-ghost transition-ui">导出数据</button>
        <div class="ml-auto flex flex-wrap gap-2 items-center justify-end">
          <input type="search" placeholder="输入编号 / 责任人…" class="wh-input px-3 py-1.5 w-44 sm:w-56 lg:w-64 text-xs" />
          <button type="button" class="px-3 py-1.5 rounded-md text-xs wh-btn-primary">筛选</button>
          <button type="button" class="px-3 py-1.5 rounded-md text-xs wh-btn-ghost">重置</button>
        </div>
      </div>
      __TABLE__
    </div>`;
}

function tableBlock(headers, rows, totalText) {
  const total = totalText || "128";
  const body = rows
    .map(
      (cells, i) =>
        `<tr style="background:${i % 2 ? "rgba(15,32,58,0.55)" : "rgba(12,24,48,0.45)"}">${cells
          .map((c, j) => {
            if (j === cells.length - 1 && c === "__OPS__") {
              return `<td class="px-2.5 whitespace-nowrap space-x-2">
              <i class="fa-regular fa-eye text-cyan-400 cursor-pointer table-action transition-ui"></i>
              <i class="fa-regular fa-pen-to-square text-amber-300 cursor-pointer table-action transition-ui"></i>
              <i class="fa-regular fa-trash-can text-rose-400 cursor-pointer table-action transition-ui"></i>
            </td>`;
            }
            return `<td class="px-2.5 align-middle text-slate-100/95">${c}</td>`;
          })
          .join("")}</tr>`
    )
    .join("");
  const th = headers
    .map((h) => `<th class="px-2.5 text-left text-cyan-50/95 uppercase tracking-wide">${h}</th>`)
    .join("");
  return `<div class="wh-table-shell bg-slate-950/35">
  <div class="overflow-x-auto max-h-[min(520px,calc(100vh-300px))]">
  <table class="w-full text-left">
    <thead><tr>${th}</tr></thead>
    <tbody>${body}</tbody>
  </table>
  </div>
  <div class="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 border-t border-cyan-400/15 bg-slate-950/55 text-[11px] text-slate-400">
    <span>共 <b class="text-cyan-200">${total}</b> 条记录</span>
    <div class="flex items-center gap-2 flex-wrap">
      <button class="min-w-[32px] h-8 rounded text-xs wh-btn-primary">1</button>
      <button class="min-w-[32px] h-8 rounded text-xs wh-btn-ghost">2</button>
      <button class="min-w-[32px] h-8 rounded text-xs wh-btn-ghost">3</button>
      <span class="text-slate-500">…</span>
      <select class="wh-input px-2 py-1 text-[11px]"><option>10 条/页</option><option>20 条/页</option><option>50 条/页</option></select>
      <span class="text-slate-500">跳转</span>
      <input class="wh-input w-12 px-1 py-1 text-center text-[11px]" value="1" />
    </div>
  </div>
</div>`;
}

const pages = [];

function add(p) {
  pages.push(p);
}

// 数据中心
add({
  file: "dc-library.html",
  top: "dc",
  key: "dc-library",
  title: "资料库",
  inner: () => {
    const t = tableBlock(
      ["目录", "文件数", "更新人", "更新时间", "操作"],
      [
        ['保护区技术资料 / 7号线', "128", "张三", "2026-05-07 16:20", "__OPS__"],
        ['无人机航测 / 原始影像', "56", "李四", "2026-05-06 11:02", "__OPS__"],
      ]
    );
    return standardToolbar().replace("__TABLE__", t);
  },
});

add({
  file: "dc-line-stats.html",
  top: "dc",
  key: "dc-line-stats",
  title: "线路项目统计",
  inner: () => {
    const m = metricsRow([
      { label: "总项目数", value: "326", delta: "+12" },
      { label: "总巡查次数", value: "1,204", delta: "+48" },
      { label: "高风险项目", value: "14", delta: "-1" },
      { label: "本周新增协议", value: "6", delta: "+2" },
    ]);
    const chart = `<div class="neon-panel neon-panel--tight overflow-hidden mb-4">
      <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80" class="w-full h-56 object-cover opacity-95" alt="统计图表" />
      <div class="p-3 text-[11px] text-slate-400 border-t border-cyan-400/10">柱状图：项目类型 / 风险评估 / 巡查统计（联动示意）</div>
    </div>`;
    const tabs = `<div class="flex gap-2 mb-4 flex-wrap text-xs">
      <span class="px-3 py-1.5 rounded-md cursor-pointer font-semibold wh-chip--active">项目类型</span>
      <span class="px-3 py-1.5 rounded-md cursor-pointer wh-chip">风险评估</span>
      <span class="px-3 py-1.5 rounded-md cursor-pointer wh-chip">安全协议</span>
      <span class="px-3 py-1.5 rounded-md cursor-pointer wh-chip">当日巡查</span>
    </div>`;
    return m + tabs + chart + standardToolbar().replace("__TABLE__", tableBlock(["线路", "项目数", "巡查次数", "风险占比"], [["7号线", "42", "186", "12%"], ["2号线", "38", "162", "9%"]]));
  },
});

add({
  file: "dc-drone-stats.html",
  top: "dc",
  key: "dc-drone-stats",
  title: "无人机运行数据统计",
  inner: () => {
    const m = metricsRow([
      { label: "飞行总时长(h)", value: "3,842", delta: "+120" },
      { label: "起降次数", value: "9,210", delta: "+305" },
      { label: "完成任务", value: "1,502", delta: "+44" },
      { label: "告警次数", value: "87", delta: "-3" },
    ]);
    const img = `<div class="grid md:grid-cols-2 gap-4 mb-4">
      <div class="neon-panel neon-panel--tight overflow-hidden h-48"><img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80" class="h-full w-full object-cover" alt="趋势" /></div>
      <div class="neon-panel neon-panel--tight overflow-hidden h-48"><img src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=900&q=80" class="h-full w-full object-cover" alt="排行" /></div>
    </div>`;
    return m + img + standardToolbar().replace("__TABLE__", tableBlock(["设备", "飞行时长", "任务数", "告警"], [["M300-01", "128h", "42", "3"], ["M350-02", "96h", "31", "1"]]));
  },
});

add({
  file: "dc-system-stats.html",
  top: "dc",
  key: "dc-system-stats",
  title: "全时全域系统数据统计",
  inner: () => {
    const cards = metricsRow([
      { label: "线路数量", value: "12" },
      { label: "站点数量", value: "228" },
      { label: "区间数量", value: "256" },
      { label: "项目数量", value: "326" },
    ]);
    const time = `<div class="neon-panel neon-panel--tight p-4 mb-4 flex flex-wrap items-center gap-6 text-sm">
      <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80" class="h-20 w-32 object-cover rounded-md border border-cyan-400/20" alt="" />
      <div><div class="wh-filter-label">系统当前时间</div><div class="text-2xl text-white font-mono mt-1">2026-05-08 14:32:08</div></div>
      <div class="text-slate-400 text-xs max-w-xl">全局汇总：监测在线率 99.2%，无人机在线率 94.5%。点击指标可下钻列表（示意）。</div>
    </div>`;
    return cards + time + standardToolbar().replace("__TABLE__", tableBlock(["模块", "在线", "告警", "操作"], [["结构监测", "正常", "2", "下钻"], ["视频分析", "正常", "0", "下钻"]]));
  },
});

// 资产管理 — 列表型页面批量
const amSpecs = [
  ["am-line.html", "am-line", "线路管理", ["编号", "线路名称", "起始站", "终点站", "里程", "操作"], [["L07", "7号线", "园博园北", "青龙山地铁小镇", "68km", "__OPS__"]]],
  ["am-station.html", "am-station", "站点管理", ["编号", "站点", "线路", "经度", "纬度", "操作"], [["S701", "光谷广场", "7号线", "114.40", "30.50", "__OPS__"]]],
  ["am-section.html", "am-section", "区间管理", ["编号", "区间", "线路", "上下行", "长度", "操作"], [["Q701", "光谷广场—杨家湾", "7号线", "上行", "1.2km", "__OPS__"]]],
  ["am-emergency-staff.html", "am-emergency-staff", "应急人员", ["姓名", "部门", "工号", "线路", "电话", "操作"], [["王强", "应急中心", "E1029", "7号线", "138****0000", "__OPS__"]]],
  ["am-emergency-warehouse.html", "am-emergency-warehouse", "应急仓库列表", ["名称", "部门", "线路", "负责人", "电话", "操作"], [["南湖应急仓", "物资部", "7号线", "赵敏", "027-****", "__OPS__"]]],
  ["am-emergency-material.html", "am-emergency-material", "应急物资", ["名称", "型号", "数量", "所属仓库", "操作"], [["防爆沙袋", "FZ-20", "200", "南湖应急仓", "__OPS__"]]],
  ["am-emergency-plan.html", "am-emergency-plan", "应急预案", ["名称", "类型", "场景", "版本", "更新时间", "操作"], [["雨水倒灌专项", "防汛", "区间", "V3", "2026-04-01", "__OPS__"]]],
  ["am-airport.html", "am-airport", "机场设备管理", ["机场", "线路", "状态", "最后在线", "操作"], [["光谷广场机场", "7号线", "在线", "09:12", "__OPS__"]]],
  ["am-drone.html", "am-drone", "无人机设备管理", ["型号", "SN", "名称", "线路", "状态", "操作"], [["M300", "SN20260198", "巡查一号", "7号线", "待命", "__OPS__"]]],
  ["am-flight-log.html", "am-flight-log", "飞行日志管理", ["任务ID", "设备", "类型", "计划", "状态", "操作"], [["FL-98231", "M300", "巡查", "P-771", "已完成", "__OPS__"]]],
];

amSpecs.forEach(([file, key, title, headers, rows]) => {
  add({
    file,
    top: "am",
    key,
    title,
    inner: () => standardToolbar().replace("__TABLE__", tableBlock(headers, rows)),
  });
});

add({
  file: "am-maintenance.html",
  top: "am",
  key: "am-maintenance",
  title: "维护与检修记录",
  inner: () => {
    const m = metricsRow([
      {
        label: "设备总数",
        value: "128 台",
        delta: "较昨日 +8",
        icon: "fa-solid fa-satellite-dish",
        iconTone: "text-cyan-300",
      },
      {
        label: "本月维护完成",
        value: "32 台",
        delta: "较上月 +12",
        icon: "fa-solid fa-shield-halved",
        iconTone: "text-emerald-300",
      },
      {
        label: "维护进行中",
        value: "6 台",
        delta: "较昨日 +2",
        icon: "fa-solid fa-wrench",
        iconTone: "text-amber-300",
      },
      {
        label: "故障设备",
        value: "3 台",
        delta: "较昨日 -1",
        icon: "fa-solid fa-triangle-exclamation",
        iconTone: "text-rose-300",
      },
    ]);
    const tb = tableBlock(
      [
        "记录编号",
        "关联设备",
        "维护类型",
        "内容摘要",
        "更换部件",
        "责任人",
        "起止时间",
        "状态",
        "操作",
      ],
      [
        [
          '<span class="font-mono text-cyan-200/90">MR202512001</span>',
          '<a href="#" class="wh-link font-mono text-[11px]">UAV-MR-001</a>',
          "故障维修",
          "云台自检异常，返厂检测",
          "螺旋桨组件",
          "李维",
          "2025-12-01 09:00 — 18:00",
          '<span class="wh-status wh-status--done">已完成</span>',
          "__OPS__",
        ],
        [
          '<span class="font-mono text-cyan-200/90">MR202512002</span>',
          '<a href="#" class="wh-link font-mono text-[11px]">UAV-MR-002</a>',
          "定期巡检",
          "电池循环检测、固件升级",
          "—",
          "王晨",
          "2025-12-02 08:30 — 11:20",
          '<span class="wh-status wh-status--progress">进行中</span>',
          "__OPS__",
        ],
        [
          '<span class="font-mono text-cyan-200/90">MR202512003</span>',
          '<a href="#" class="wh-link font-mono text-[11px]">UAV-MR-005</a>',
          "故障维修",
          "图传链路不稳定，待更换模块",
          "图传小板",
          "赵敏",
          "2025-12-03 10:00 —",
          '<span class="wh-status wh-status--pending">待处理</span>',
          "__OPS__",
        ],
      ],
      "128"
    );
    return m + standardToolbar().replace("__TABLE__", tb);
  },
});

[
  ["am-ops-metro.html", "am-ops-metro", "地铁信息系统运行管理"],
  ["am-ops-settings.html", "am-ops-settings", "资源监控设置"],
  ["am-ops-fulltime.html", "am-ops-fulltime", "全时全域运行管理"],
  ["am-ops-uav.html", "am-ops-uav", "无人机系统运行管理"],
].forEach(([file, key, title]) => {
  add({
    file,
    top: "am",
    key,
    title,
    inner: () => {
      const img = `<div class="grid md:grid-cols-3 gap-4 mb-4">
        <div class="rounded-lg p-4 border border-white/10" style="background:#0c203f">
          <div class="text-xs text-[#B0C1D6] mb-2">CPU</div>
          <div class="text-3xl font-bold text-white">38%</div>
          <div class="h-2 rounded mt-2 bg-[#142B4A]"><div class="h-2 rounded bg-[#1E90FF]" style="width:38%"></div></div>
        </div>
        <div class="rounded-lg p-4 border border-white/10" style="background:#0d2348">
          <div class="text-xs text-[#B0C1D6] mb-2">内存</div>
          <div class="text-3xl font-bold text-[#FF4D4F]">82%</div>
          <div class="h-2 rounded mt-2 bg-[#142B4A]"><div class="h-2 rounded bg-[#FF4D4F]" style="width:82%"></div></div>
        </div>
        <div class="rounded-lg p-4 border border-white/10" style="background:#0c203f">
          <div class="text-xs text-[#B0C1D6] mb-2">磁盘</div>
          <div class="text-3xl font-bold text-white">54%</div>
          <div class="h-2 rounded mt-2 bg-[#142B4A]"><div class="h-2 rounded bg-[#17C3B2]" style="width:54%"></div></div>
        </div>
      </div>
      <div class="rounded-lg overflow-hidden border border-white/10 mb-4">
        <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80" class="w-full h-40 object-cover" alt="机房监控" />
      </div>`;
      return img + standardToolbar().replace("__TABLE__", tableBlock(["资源", "数量/大小", "备注"], [["照片视频", "12.4 TB", "增长正常"], ["项目文件", "3.1 TB", "—"], ["资料库", "860 GB", "—"]]));
    },
  });
});

// 智慧巡检
const inSpecs = [
  ["in-disease.html", "in-disease", "病害巡查", ["编号", "时间", "线路", "位置", "巡查人", "操作"], [["BH-908", "2026-05-08", "7号线", "K12+200", "周洋", "__OPS__"]]],
  ["in-night.html", "in-night", "夜班作业", ["编号", "作业时间", "线路", "负责人", "操作"], [["NY-112", "2026-05-07 23:00", "2号线", "吴磊", "__OPS__"]]],
  ["in-manual.html", "in-manual", "人工巡查记录", ["编号", "线路", "项目", "日期", "状态", "操作"], [["RG-221", "7号线", "XX 基坑", "2026-05-08", "已提交", "__OPS__"]]],
  ["in-project.html", "in-project", "项目管理", ["编号", "名称", "类型", "区间/站点", "风险", "操作"], [["PR-778", "XX 基坑", "深基坑", "光谷广场", "较高", "__OPS__"]]],
  ["in-project-done.html", "in-project-done", "完工项目", ["编号", "名称", "类型", "完工日期", "操作"], [["PR-601", "路面恢复", "市政", "2026-03-01", "__OPS__"]]],
  ["in-project-patrol.html", "in-project-patrol", "项目巡查", ["巡查类型", "线路", "项目", "日期", "巡查人", "操作"], [["无人机", "7号线", "XX 基坑", "2026-05-08", "系统", "__OPS__"]]],
  ["in-score.html", "in-score", "巡查打分", ["账号", "人员", "线路", "日期", "最低分", "操作"], [["zhangsan", "张三", "7号线", "2026-05-08", "82", "__OPS__"]]],
];
inSpecs.forEach(([file, key, title, headers, rows]) => {
  add({
    file,
    top: "in",
    key,
    title,
    inner: () => standardToolbar().replace("__TABLE__", tableBlock(headers, rows)),
  });
});

add({
  file: "in-uav-report.html",
  top: "in",
  key: "in-uav-report",
  title: "无人机巡查记录",
  inner: () => `<div class="grid lg:grid-cols-3 gap-4">
    <div class="lg:col-span-2 space-y-4">
      <div class="rounded-lg p-4 border border-white/10" style="background:#0c203f">
        <h2 class="text-white text-sm font-medium mb-3">任务信息</h2>
        <p class="text-sm text-[#E1EAF5] leading-relaxed">任务编号 U-20260508-01 · 线路 7 号线 · 起降机场光谷广场 · 航线 L7-W01。</p>
      </div>
      <div class="rounded-lg p-4 border border-white/10" style="background:#0d2348">
        <h2 class="text-white text-sm font-medium mb-3">巡查结果 / AI 结论</h2>
        <p class="text-sm text-[#B0C1D6]">AI：围挡完整度 92%，发现 1 处疑似材料堆放越界，建议人工复核。</p>
        <div class="grid grid-cols-3 gap-2 mt-3">
          <img src="https://images.unsplash.com/photo-1508610492156-ea1acabf2964?auto=format&fit=crop&w=400&q=80" class="h-24 w-full object-cover rounded" alt="" />
          <img src="https://images.unsplash.com/photo-1494412574643-ff11b0a101c0?auto=format&fit=crop&w=400&q=80" class="h-24 w-full object-cover rounded" alt="" />
          <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80" class="h-24 w-full object-cover rounded" alt="" />
        </div>
      </div>
    </div>
    <div class="space-y-3">
      <button class="w-full py-2 rounded text-sm font-medium" style="background:#ffd600;color:#000">导出 PDF</button>
      <button class="w-full py-2 rounded text-sm bg-[#1E90FF] text-white">复核</button>
      <button class="w-full py-2 rounded text-sm bg-[#1E3A5F] text-white">打印</button>
    </div>
  </div>`,
});

add({
  file: "in-track-person.html",
  top: "in",
  key: "in-track-person",
  title: "人员轨迹",
  inner: () => `<div class="flex flex-col lg:flex-row gap-4">
    <aside class="w-full lg:w-64 shrink-0 rounded-lg p-4 border border-white/10 space-y-3 text-sm" style="background:#0C203F">
      <label class="text-[#B0C1D6] text-xs">人员</label>
      <select class="w-full rounded px-2 py-2 text-white border border-white/10" style="background:#1E3A5F"><option>张三</option></select>
      <label class="text-[#B0C1D6] text-xs">线路</label>
      <select class="w-full rounded px-2 py-2 text-white border border-white/10" style="background:#1E3A5F"><option>7号线</option></select>
      <label class="text-[#B0C1D6] text-xs">日期</label>
      <input type="date" class="w-full rounded px-2 py-2 text-[#E1EAF5] border border-white/10" style="background:#142B4A" />
      <button class="w-full py-2 rounded text-sm bg-[#1E90FF] text-white">轨迹回放</button>
    </aside>
    <div class="flex-1 rounded-lg overflow-hidden border border-white/10 relative min-h-[360px]">
      <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80" class="w-full h-full object-cover min-h-[360px]" alt="地图" />
      <svg class="absolute inset-0 w-full h-full"><polyline points="100,280 220,200 400,220 520,160" fill="none" stroke="#FFD600" stroke-width="3"/></svg>
    </div>
  </div>`,
});

add({
  file: "in-track-drone.html",
  top: "in",
  key: "in-track-drone",
  title: "无人机轨迹",
  inner: () => `<div class="rounded-lg overflow-hidden border border-white/10 relative min-h-[400px]">
    <img src="https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1800&q=80" class="w-full h-[420px] object-cover" alt="" />
    <a href="am-flight-log.html" class="absolute bottom-4 right-4 text-sm px-3 py-2 rounded bg-[#0C203F] text-[#FFD600] border border-white/10">关联飞行日志</a>
  </div>`,
});

add({
  file: "in-quality-stats.html",
  top: "in",
  key: "in-quality-stats",
  title: "统计分析",
  inner: () =>
    metricsRow([
      { label: "本日重点巡查", value: "18" },
      { label: "本周重点巡查", value: "96" },
      { label: "本月一般项目巡查", value: "412" },
      { label: "本月重点巡查", value: "124" },
    ]) +
    standardToolbar().replace(
      "__TABLE__",
      tableBlock(
        ["线路", "项目", "类型", "日次数", "周次数", "月次数"],
        [["7号线", "XX 基坑", "重点", "3", "11", "38"]]
      )
    ),
});

// 我的工作台
const wbList = [
  ["wb-role.html", "wb-role", "角色管理", ["角色名", "编码", "人数", "操作"], [["系统管理员", "admin", "3", "__OPS__"]]],
  ["wb-user.html", "wb-user", "用户管理", ["登录名", "姓名", "部门", "状态", "操作"], [["zhangsan", "张三", "运管中心", "启用", "__OPS__"]]],
  ["wb-dept.html", "wb-dept", "部门管理", ["部门", "编码", "负责人", "操作"], [["运管中心", "YG", "李华", "__OPS__"]]],
  ["wb-menu.html", "wb-menu", "菜单管理", ["菜单名", "路径", "排序", "操作"], [["资产管理", "/am", "20", "__OPS__"]]],
  ["wb-dict.html", "wb-dict", "字典管理", ["字典类型", "标签", "键值", "操作"], [["line_type", "深基坑", "1", "__OPS__"]]],
  ["wb-log.html", "wb-log", "日志管理", ["时间", "用户", "IP", "模块", "操作"], [["09:12:01", "admin", "10.0.0.8", "登录", "__OPS__"]]],
  ["wb-param.html", "wb-param", "参数设置", ["参数名", "键", "值", "操作"], [["空域到期提醒(天)", "air.alert.days", "7", "__OPS__"]]],
  ["wb-notice.html", "wb-notice", "通知公告", ["标题", "类型", "发布时间", "操作"], [["五一期间巡查安排", "通知", "2026-04-28", "__OPS__"]]],
  ["wb-todo.html", "wb-todo", "待办", ["标题", "类型", "到达时间", "操作"], [["飞行计划审批-U982", "审批", "2026-05-08 08:10", "__OPS__"]]],
  ["wb-sys-notify.html", "wb-sys-notify", "系统通知", ["标题", "级别", "时间", "操作"], [["存储容量预警", "重要", "2026-05-07", "__OPS__"]]],
  ["wb-done.html", "wb-done", "已处理事项", ["标题", "处理人", "完成时间", "操作"], [["周报归档", "张三", "2026-05-06", "__OPS__"]]],
  ["wb-wf-category.html", "wb-wf-category", "流程分类", ["分类名", "编码", "排序", "操作"], [["飞行审批", "wf_fly", "1", "__OPS__"]]],
  ["wb-wf-design.html", "wb-wf-design", "流程设计", ["流程名", "版本", "状态", "操作"], [["飞行计划审批", "v2", "发布", "__OPS__"]]],
];
wbList.forEach(([file, key, title, headers, rows]) => {
  add({
    file,
    top: "wb",
    key,
    title,
    inner: () => standardToolbar().replace("__TABLE__", tableBlock(headers, rows)),
  });
});

add({
  file: "wb-profile.html",
  top: "wb",
  key: "wb-profile",
  title: "个人资料",
  inner: () => `<div class="max-w-xl rounded-lg border border-white/10 p-6 space-y-4" style="background:#0c203f">
    <div class="flex items-center gap-4">
      <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80" class="w-20 h-20 rounded-full object-cover border-2 border-[#FFD600]" alt="" />
      <div>
        <div class="text-white font-medium">张三</div>
        <div class="text-xs text-[#88A0C2]">运管中心 · 飞手</div>
      </div>
    </div>
    <label class="block text-sm text-[#B0C1D6]">手机号<input class="mt-1 w-full rounded px-3 py-2 border border-white/10 text-white" style="background:#142B4A" value="138****0000"/></label>
    <label class="block text-sm text-[#B0C1D6]">修改密码<input type="password" class="mt-1 w-full rounded px-3 py-2 border border-white/10 text-white" style="background:#142B4A" placeholder="新密码"/></label>
    <div>
      <span class="text-sm text-[#B0C1D6]">飞手证</span>
      <div class="mt-2 flex items-center gap-3">
        <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80" class="h-24 rounded object-cover border border-white/10" alt="证件示意" />
        <button type="button" class="px-4 py-2 rounded text-sm bg-[#1E90FF] text-white">上传飞手证</button>
      </div>
    </div>
    <button type="button" class="px-6 py-2 rounded text-sm font-medium" style="background:#ffd600;color:#000">保存</button>
  </div>`,
});

pages.forEach((p) => {
  const inner = typeof p.inner === "function" ? p.inner() : p.inner;
  const html = wrapPage(p.title, p.top, p.key, inner);
  fs.writeFileSync(path.join(root, "web", p.file), html, "utf8");
  console.log("Wrote", p.file);
});

console.log("Done,", pages.length, "pages.");
