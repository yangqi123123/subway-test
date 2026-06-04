const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(root, "web", "wb", "in-project.html"), "utf8");

function sliceBetween(startMark, endMark) {
  const a = src.indexOf(startMark);
  const b = src.indexOf(endMark, a);
  if (a < 0 || b < 0) throw new Error("slice failed: " + startMark);
  return src.slice(a, b);
}

const detailBlock = sliceBetween(
  '<section id="project-detail-view"',
  '<section id="project-patrol-view"'
);
const patrolBlock = sliceBetween(
  '<section id="project-patrol-view"',
  "</div>\n\n  <div class=\"project-modal-mask\""
);
const modalsBlock = sliceBetween(
  '<div class="project-modal-mask" id="project-modal-mask"',
  '<script src="../../assets/js/search-select.js">'
);

const out = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>项目管理</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous" />
  <link rel="stylesheet" href="../../assets/css/miniapp.css" />
  <link rel="stylesheet" href="../../assets/css/in-project-mobile.css" />
</head>
<body class="mp-project-page" data-miniapp="page" data-module="patrol" data-title="项目管理" data-base="../">
  <header class="miniapp-navbar miniapp-navbar--inner" id="project-nav">
    <button type="button" class="miniapp-navbar__back" data-action="mp-nav-back" aria-label="返回">
      <i class="fa-solid fa-chevron-left"></i>
    </button>
    <h1 class="miniapp-navbar__title" id="project-nav-title">项目管理</h1>
  </header>
  <div id="project-app" class="mp-project-app">
    <section id="project-list-view" class="mp-project-view">
      <div class="mp-project-stats">
        <div class="mp-stat-card">
          <div class="mp-stat-card__value" id="stat-total">0</div>
          <div class="mp-stat-card__label">项目总数</div>
        </div>
        <div class="mp-stat-card mp-stat-card--warn">
          <div class="mp-stat-card__value" id="stat-key">0</div>
          <div class="mp-stat-card__label">重点项目</div>
        </div>
        <div class="mp-stat-card">
          <div class="mp-stat-card__value" id="stat-general">0</div>
          <div class="mp-stat-card__label">一般项目</div>
        </div>
        <div class="mp-stat-card">
          <div class="mp-stat-card__value" id="stat-month">0</div>
          <div class="mp-stat-card__label">本月更新</div>
        </div>
      </div>
      <div class="mp-project-toolbar">
        <button type="button" class="mp-btn mp-btn--ghost" data-action="open-filter-sheet"><i class="fa-solid fa-filter"></i>筛选</button>
        <button type="button" class="mp-btn mp-btn--primary" data-action="new-project"><i class="fa-solid fa-plus"></i>新增</button>
        <button type="button" class="mp-btn mp-btn--ghost" data-action="export-project"><i class="fa-solid fa-file-export"></i>导出</button>
      </div>
      <div id="project-mobile-list" class="mp-project-list" role="list"></div>
      <p class="mp-project-list-footer">共 <strong id="table-total">0</strong> 条</p>
      <div id="project-table-body" hidden aria-hidden="true" style="display:none"></div>
    </section>

    ${detailBlock}
    ${patrolBlock}
  </div>

  ${modalsBlock}

  <div id="project-filter-sheet" class="mp-filter-sheet" aria-hidden="true">
    <div class="mp-filter-sheet__mask" data-action="close-filter-sheet"></div>
    <div class="mp-filter-sheet__panel" role="dialog" aria-label="筛选条件">
      <div class="mp-filter-sheet__head">
        <h2>快捷筛选</h2>
        <button type="button" class="mp-icon-btn" data-action="close-filter-sheet" aria-label="关闭"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="mp-filter-sheet__body project-filter-panel">
        <label class="mp-filter-field mp-filter-field--full"><span>项目名称</span><input class="wh-input w-full px-2" data-filter placeholder="请输入搜索项目名称" /></label>
        <label class="mp-filter-field"><span>所属线路</span><select class="wh-input w-full px-2" data-filter><option>全部</option><option>7号线</option><option>8号线</option><option>19号线</option></select></label>
        <label class="mp-filter-field"><span>上下行</span><select class="wh-input w-full px-2" data-filter><option>全部</option><option>上行</option><option>下行</option></select></label>
        <label class="mp-filter-field"><span>所属区间</span><select class="wh-input w-full px-2" data-filter><option>请选择区间</option><option>洪山路~小洪山</option><option>松槐路~天阳大道</option></select></label>
        <label class="mp-filter-field"><span>所在站点</span><select class="wh-input w-full px-2" data-filter><option>请选择站点</option><option>洪山路</option><option>小洪山</option></select></label>
        <label class="mp-filter-field"><span>项目类型</span><select class="wh-input w-full px-2" data-filter><option>全部</option><option>一般项目</option><option>重点项目</option></select></label>
        <label class="mp-filter-field"><span>工程类别</span><select class="wh-input w-full px-2" data-filter><option>全部</option><option>钻孔、地勘、打桩</option><option>道路排水工程</option><option>房建工程</option></select></label>
        <label class="mp-filter-field"><span>是否发函</span><select class="wh-input w-full px-2" data-filter><option>全部</option><option>是</option><option>否</option></select></label>
        <label class="mp-filter-field"><span>是否降水</span><select class="wh-input w-full px-2" data-filter><option>全部</option><option>是</option><option>否</option></select></label>
        <label class="mp-filter-field"><span>是否监测</span><select class="wh-input w-full px-2" data-filter><option>全部</option><option>是</option><option>否</option></select></label>
        <label class="mp-filter-field"><span>评估报告风险</span><select class="wh-input w-full px-2" data-filter><option>全部</option><option>一级</option><option>二级</option><option>三级</option><option>四级</option><option>特级</option><option>无</option></select></label>
        <label class="mp-filter-field"><span>地质类型</span><select class="wh-input w-full px-2" data-filter><option>全部</option><option>长江三级阶地</option></select></label>
        <label class="mp-filter-field"><span>地铁结构类型</span><select class="wh-input w-full px-2" data-filter><option>全部</option><option>盾构结构</option><option>明挖结构</option></select></label>
        <label class="mp-filter-field"><span>是否与车站接驳</span><select class="wh-input w-full px-2" data-filter><option>全部</option><option>是</option><option>否</option></select></label>
        <label class="mp-filter-field mp-filter-field--full"><span>是否签订安全协议</span><select class="wh-input w-full px-2" data-filter><option>全部</option><option>是</option><option>否</option></select></label>
      </div>
      <div class="mp-filter-sheet__foot">
        <button type="button" class="mp-btn mp-btn--ghost flex-1" data-action="reset-filter">重置</button>
        <button type="button" class="mp-btn mp-btn--primary flex-1" data-action="search-project">搜索</button>
      </div>
    </div>
  </div>

  <script src="../../assets/js/miniapp-config.js"></script>
  <script src="../../assets/js/gis-assets-base.js"></script>
  <script src="../../../assets/js/search-select.js"></script>
  <script src="../../../assets/js/upload-widget.js"></script>
  <script src="../../../assets/js/project-doc-shared.js"></script>
  <script src="../../../assets/js/project-exchange-shared.js"></script>
  <script src="../../../assets/js/project-monitor-shared.js"></script>
  <script src="../../../assets/js/project-operation-log.js"></script>
  <script src="../../../assets/js/in-project-page.js"></script>
  <script src="../../assets/js/project-page-boot.js"></script>
</body>
</html>
`;

const target = path.join(root, "app", "patrol", "pages", "project.html");
fs.writeFileSync(target, out, "utf8");
console.log("wrote", target, "chars", out.length);
