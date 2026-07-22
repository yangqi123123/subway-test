/**
 * 生成移动端功能清单 Excel（docs/功能清单-移动端.xlsx）
 * 纯 Node 实现（zlib + 手工 ZIP 容器），无第三方依赖。
 * 数据来源：docs/功能清单-移动端.md（改动清单后同步更新本脚本 DATA）。
 */
"use strict";

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const HEADERS = ["一级模块", "二级模块", "功能点", "功能描述"];

const DATA = [
  // 一、系统入口
  ["系统入口", "登录", "账号登录", "账号/密码登录（演示账号 admin 直登），支持密码显隐、记住密码、忘记密码入口"],
  ["系统入口", "登录", "找回密码", "手机号 + 短信验证码验证后重置新密码（演示验证码 123456）"],
  ["系统入口", "底部导航", "Tabbar", "4 个一级 Tab：全景地图（默认）、巡查、资产、我的；中间 FAB 为「今日任务」快捷入口"],
  // 二、全景地图
  ["全景地图", "GIS 一张图", "地图浏览", "Leaflet 地图，支持底图切换、地名搜索定位、要素点选查看详情面板"],
  ["全景地图", "GIS 一张图", "图层筛选", "站点/项目/人员/告警点标注开关（含全部显示总开关）、机场与无人机、巡查区域（已巡/待巡色块）、12 条地铁线路开关、8 类应急资源图层"],
  ["全景地图", "GIS 一张图", "图层搜索", "独立搜索页模糊检索站点/项目等要素，点击结果回地图定位"],
  ["全景地图", "态势感知", "告警态势", "统计卡片（告警总数/未复核/已复核/告警区间）、GIS 报警点位、报警列表、左右线瀑布图"],
  ["全景地图", "专家工具", "告警诊断", "区间级诊断视图：GIS 地图、瀑布图、频谱图，最新告警及复核情况、历史告警、位置备注"],
  ["全景地图", "典型事件标注", "事件归类", "当前告警频谱与对比频谱对照（可放大预览/左右切换）、4 种方式生成对比频谱图、事件归类/标签/备注并提交入典型事件库"],
  ["全景地图", "告警信息/虚拟座舱/飞行计划/航线规划", "—", "占位页，待对接后台对应模块"],
  // 三、巡查
  ["巡查", "今日任务", "任务清单", "Tabbar 中间 FAB 直达，查看当日巡查任务"],
  ["巡查", "保护区项目", "项目管理", "统计卡片、搜索/筛选、新增/编辑/详情、重点/一般项目标记、巡查记录、操作记录、删除（二次确认）"],
  ["巡查", "保护区项目", "完工项目", "完工项目列表查询"],
  ["巡查", "保护区项目", "巡查记录", "项目维度巡查记录列表（项目详情下钻）"],
  ["巡查", "巡查质量", "人员轨迹", "巡查人员轨迹列表查询与查看"],
  ["巡查", "巡查质量", "巡查打分", "巡查质量打分列表、搜索、打分规则查看"],
  ["巡查", "巡查质量", "统计分析", "巡查质量统计分析（搜索/筛选）"],
  ["巡查", "巡查质量", "巡检成果", "巡检成果汇总展示"],
  ["巡查", "巡查记录", "病害巡查", "统计卡片、搜索/筛选；新增/编辑/详情；默认线路、默认描述文案；区间信息卡片（起点里程/终点里程/长度/施工方法）；病害里程双框（里程+数字）、环号限数字；照片/视频上传与预览；工班确认/拒绝流转"],
  ["巡查", "巡查记录", "夜班作业", "统计卡片、搜索/筛选；新增/编辑/详情；默认线路、默认描述文案；区间/站点多选（Tag/弹层），区间信息卡片；特种作业资料/照片/视频上传；状态流转：待确认→工班确认→车间确认→已完成、已拒绝；各状态操作按钮与红色删除（二次确认）"],
  ["巡查", "巡查记录", "人工巡查记录", "统计卡片、搜索/筛选；新增/编辑/详情；默认线路、巡查日期默认当天、项目进展/备注预填；区间信息卡片；照片/视频上传；状态流转与删除同夜班作业"],
  ["巡查", "巡查记录", "无人机巡查记录", "无人机巡查记录列表、搜索/详情查看"],
  ["巡查", "全时全域感知", "告警信息", "告警列表查看（移动端入口）"],
  ["巡查", "数据统计", "线路项目统计", "线路/站点/区间/项目数量统计卡片，筛选（线路/区间/站点/起止日期），项目统计图/类型图，图表与表格切换、横屏全屏"],
  ["巡查", "数据统计", "无人机数据统计", "统计总览（违规项目/飞行趟次/时长等 4 图）+ 使用记录两视图，搜索与筛选"],
  ["巡查", "数据统计", "全时全域数据统计", "项目告警统计图、处理状态统计图（图/表切换、全屏）"],
  ["巡查", "数据统计", "知识库", "典型告警频谱图样本按项目分组查阅、预览，搜索与筛选"],
  // 四、资产
  ["资产", "应急管理", "应急人员", "统计卡片（人员/部门/线路/应急中心）、搜索/筛选、新增/编辑/详情/删除"],
  ["资产", "应急管理", "应急仓库", "统计卡片、搜索/筛选、仓库增删改查，可下钻仓内物资"],
  ["资产", "应急管理", "应急物资", "按所属仓库管理物资台账（名称/型号/数量），增删改查"],
  ["资产", "应急管理", "应急预案", "统计卡片（预案/部门/仓库/物资）、搜索/筛选、预案增删改查"],
  ["资产", "无人机设备管理", "维修与检修记录", "统计卡片（总数/已完成/进行中/故障处理）、搜索/筛选、增删改查；设备类型联动、维修资料/照片/视频上传与在线预览"],
  ["资产", "无人机设备管理", "飞行日志", "统计卡片（总数/成功/异常/取消/失败）、搜索、详情、轨迹回放、飞行报告查看（只读）"],
  ["资产", "服务器设备管理", "资源监控", "服务器拓扑图（在线/告警状态）、CPU/内存/磁盘监控、存储信息与占用分析"],
  ["资产", "机场/无人机/线路/区间/站点管理", "—", "占位页，待对接后台"],
  // 五、我的
  ["我的", "个人中心", "首页", "个人信息卡（头像/姓名/账号/部门/飞手证）、功能入口、退出登录"],
  ["我的", "个人中心", "个人资料", "更换头像、昵称/邮箱/手机号/性别维护、飞手证上传与预览"],
  ["我的", "个人中心", "修改密码", "旧密码校验 + 新密码设置（8-16 位字母+数字规则），密码显隐切换"],
  ["我的", "待办", "待办处理", "分类 Tab、搜索/筛选、批量审批；审批通过/驳回（意见弹窗）；告警复核（误报判定、级别调整、现场情况/照片）；告警详情（地图定位/告警记录/无人机实拍/处警记录）"],
  ["我的", "系统通知", "通知管理", "四类通知统计（项目巡查/审批消息/空域许可/区间调配）、搜索/类型筛选、详情、全部已读"],
  ["我的", "已处理事项", "历史查询", "已办结审批/告警事项查询，按类型/结果/时间筛选，详情查看"],
  ["我的", "区间临时调配", "调配申请", "同线路跨区间人员临时支援：调配人员（带搜索弹窗）、起止区间、起止时间、调配原因"],
  ["我的", "设置", "色块清空设置", "全景地图巡查色块自动清空周期（1-365 天）配置、立即清空"],
  ["我的", "关于系统", "—", "占位页"],
  // 附录：通用能力
  ["附录", "通用能力", "独立搜索页", "病害/夜班/人工/无人机/项目/打分/轨迹/待办/通知/已处理等列表均配独立搜索页，关键字搜索后结果回跳"],
  ["附录", "通用能力", "通用骨架", "列表页统一为「统计卡片 + 搜索条 + 筛选抽屉 + 卡片列表 + 详情视图 + 表单视图 + 删除确认 + 底部选择器弹层」结构"],
  ["附录", "通用能力", "上传能力", "资料（PDF/Word/Excel/ZIP ≤50MB）、照片（≤9 张 ≤20MB）、视频（≤9 个 ≤200MB），支持在线预览"],
  ["附录", "通用能力", "操作记录", "业务单据均记录操作时间轴（新增/确认/拒绝等），可弹窗查看"],
];

/* ---------- XML ---------- */

function xmlEscape(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function colName(idx) {
  // 0 -> A, 1 -> B ...
  return String.fromCharCode(65 + idx);
}

function buildSheetXml() {
  const rows = [];
  rows.push(
    '<row r="1">' +
      HEADERS.map(function (h, i) {
        return '<c r="' + colName(i) + '1" s="1" t="inlineStr"><is><t>' + xmlEscape(h) + "</t></is></c>";
      }).join("") +
      "</row>"
  );
  DATA.forEach(function (r, ri) {
    const rn = ri + 2;
    rows.push(
      '<row r="' + rn + '">' +
        r.map(function (cell, ci) {
          return '<c r="' + colName(ci) + rn + '" s="2" t="inlineStr"><is><t>' + xmlEscape(cell) + "</t></is></c>";
        }).join("") +
        "</row>"
    );
  });
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<cols><col min="1" max="1" width="12" customWidth="1"/><col min="2" max="2" width="22" customWidth="1"/>' +
    '<col min="3" max="3" width="16" customWidth="1"/><col min="4" max="4" width="90" customWidth="1"/></cols>' +
    "<sheetData>" +
    rows.join("") +
    "</sheetData>" +
    '<autoFilter ref="A1:D' + (DATA.length + 1) + '"/>' +
    "</worksheet>"
  );
}

const FILES = {
  "[Content_Types].xml":
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
    "</Types>",
  "_rels/.rels":
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
    "</Relationships>",
  "xl/workbook.xml":
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    '<sheets><sheet name="移动端功能清单" sheetId="1" r:id="rId1"/></sheets></workbook>',
  "xl/_rels/workbook.xml.rels":
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
    "</Relationships>",
  "xl/styles.xml":
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<fonts count="2"><font><sz val="11"/><name val="等线"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="等线"/></font></fonts>' +
    '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>' +
    '<fill><patternFill patternType="solid"><fgColor rgb="FF2F5597"/><bgColor indexed="64"/></patternFill></fill></fills>' +
    '<borders count="2"><border/><border><left style="thin"><color rgb="FFBFBFBF"/></left><right style="thin"><color rgb="FFBFBFBF"/></right>' +
    '<top style="thin"><color rgb="FFBFBFBF"/></top><bottom style="thin"><color rgb="FFBFBFBF"/></bottom></border></borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="3">' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
    '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>' +
    "</cellXfs></styleSheet>",
  "xl/worksheets/sheet1.xml": buildSheetXml(),
};

/* ---------- ZIP (deflate) ---------- */

const CRC_TABLE = (function () {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function dosDateTime(date) {
  const d = date || new Date();
  const time = ((d.getHours() & 0x1f) << 11) | ((d.getMinutes() & 0x3f) << 5) | ((d.getSeconds() / 2) & 0x1f);
  const day = (((d.getFullYear() - 1980) & 0x7f) << 9) | (((d.getMonth() + 1) & 0xf) << 5) | (d.getDate() & 0x1f);
  return { time: time, day: day };
}

function buildZip(files) {
  const names = Object.keys(files);
  const dt = dosDateTime();
  const chunks = [];
  const central = [];
  let offset = 0;

  names.forEach(function (name) {
    const nameBuf = Buffer.from(name, "utf8");
    const data = Buffer.from(files[name], "utf8");
    const compressed = zlib.deflateRawSync(data, { level: 9 });
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0x0800, 6); // UTF-8 flag
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt16LE(dt.time, 10);
    local.writeUInt16LE(dt.day, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    chunks.push(local, nameBuf, compressed);

    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0);
    cen.writeUInt16LE(20, 4); // version made by
    cen.writeUInt16LE(20, 6); // version needed
    cen.writeUInt16LE(0x0800, 8);
    cen.writeUInt16LE(8, 10);
    cen.writeUInt16LE(dt.time, 12);
    cen.writeUInt16LE(dt.day, 14);
    cen.writeUInt32LE(crc, 16);
    cen.writeUInt32LE(compressed.length, 20);
    cen.writeUInt32LE(data.length, 24);
    cen.writeUInt16LE(nameBuf.length, 28);
    cen.writeUInt32LE(offset, 42);
    central.push(Buffer.concat([cen, nameBuf]));

    offset += 30 + nameBuf.length + compressed.length;
  });

  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(names.length, 8);
  end.writeUInt16LE(names.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);

  return Buffer.concat([Buffer.concat(chunks), centralBuf, end]);
}

/* ---------- main ---------- */

const outPath = path.join(__dirname, "..", "docs", "功能清单-移动端.xlsx");
fs.writeFileSync(outPath, buildZip(FILES));
console.log("written:", outPath, "(" + DATA.length + " rows)");
