# 项目巡查汇总通知实现计划

> **Goal:** 将移动端「项目巡查」通知的生成时机改为「完成当日巡线」确认后，并以一条汇总通知展示当天所有已完成项目，项目名称可点击打开对应完整巡线记录详情。

> **Architecture:** 人工巡检表单提交时把记录持久化到 localStorage；今日巡线页面在确认「完成当日巡线」后读取当天已完成的记录，生成/更新一条包含 `projects` 数组的汇总通知；系统通知列表与详情针对该结构渲染蓝色可点击的项目名称，点击后复用现有人工巡检详情组件。

> **Tech Stack:** 纯前端 HTML/CSS/JS，localStorage 持久化，基于现有 `wb-notify-mobile-page.js` 与 `patrol-crud-page.js` 事件机制。

---

## Task 1: 持久化人工巡检记录并移除填写时通知

**Files:**
- Modify: `app/assets/js/manual-page-boot.js`

- [x] **Step 1: 新增 localStorage key 与读写辅助函数**

```js
var STORAGE_MANUAL_ROWS = "whmetro-manual-rows";
function readManualRows() { return readJson(STORAGE_MANUAL_ROWS, []); }
function writeManualRows(rows) { writeJson(STORAGE_MANUAL_ROWS, rows); }
```

- [x] **Step 2: 实现 `saveManualRow(row, taskId)`**

将表单提交的记录补充 `taskId`、`projectType`、`source`、`savedAt`、`user` 后写入 `whmetro-manual-rows`，同 `id` 覆盖、新记录置顶。

- [x] **Step 3: 替换 `pushTaskNotify` 调用**

在 `wh-patrol-form-saved` 事件处理中，保留 `markTodayTaskDone(query.taskId)`，改为调用 `saveManualRow(detail.row, query.taskId)`，不再向 `whmetro-notify-extra` 写入单条通知。

---

## Task 2: 完成当日巡线时生成汇总通知

**Files:**
- Modify: `app/assets/js/today-task-page-boot.js`

- [x] **Step 1: 新增日期与汇总辅助函数**

```js
function formatNow() { /* YYYY-MM-DD HH:mm */ }
function todayStr() { /* YYYY-MM-DD */ }
function uniqueUsers(rows) { /* 去重 user 字段 */ }
function readManualRows() { return readJson(STORAGE_MANUAL_ROWS, []); }
```

- [x] **Step 2: 实现 `generateDailyNotify()`**

读取 `whmetro-today-task-done` 与 `whmetro-manual-rows`，筛选 `savedAt` 为今天且 `taskId` 已完成的记录；按 `task-notify-daily-YYYY-MM-DD` 生成/覆盖一条汇总通知，写入 `whmetro-notify-extra`。

- [x] **Step 3: 在确认提交时调用**

在 `[data-action='today-task-confirm-ok']` 点击处理中，于 `closeConfirm()` 后调用 `generateDailyNotify()`。

---

## Task 3: 系统通知列表支持汇总通知

**Files:**
- Modify: `assets/js/wb-notify-mobile-page.js`
- Modify: `app/assets/css/mine-mobile.css`

- [x] **Step 1: 改造 `renderManualNotifyCard`**

判断 `row.projects` 是否存在：
- 汇总通知：标题使用 `row.title`，额外展示「已完成项目」及蓝色可点击的项目名称按钮（`data-action="wb-view-project"`）。
- 单条通知：保持原有展示。

- [x] **Step 2: 新增项目点击事件处理**

在 `bindEvents` 中处理 `wb-view-project`：找到对应通知行与项目索引，调用 `openProjectDetail(row, projectIndex)`，标记通知为已读并打开该项目的人工巡检详情。

- [x] **Step 3: 新增汇总详情视图 `buildAggregatedNotifyDetailHtml`**

展示 `row.title` 与所有已完成项目名称，点击项目名称同样打开对应详情。

- [x] **Step 4: 新增 CSS 样式**

为 `.mp-wb-card__projects`、`.mp-wb-card__project`、`.mp-wb-detail-project` 等添加蓝色下划线可点击样式，并保留通知标题换行。

---

## Task 4: 验证

**Files:**
- 验证页面：`app/mine/pages/notify.html`、`app/patrol/pages/today-task.html`

- [x] **Step 1: 语法检查**

```bash
node --check app/assets/js/manual-page-boot.js
node --check app/assets/js/today-task-page-boot.js
node --check assets/js/wb-notify-mobile-page.js
```

- [x] **Step 2: 截图验证**

使用 Chrome headless 分别验证：
1. 汇总通知列表卡片样式；
2. 汇总通知详情（项目列表）；
3. 单个项目完整巡线记录详情。

---

## Spec Coverage Check

| 需求 | 实现位置 |
|---|---|
| 完成当日巡线后生成提醒通知 | `today-task-page-boot.js` `generateDailyNotify` |
| 项目巡查通知展示所有已完成项目 | `wb-notify-mobile-page.js` `renderManualNotifyCard` |
| 展示消息标题、状态、类型、时间、项目名称 | 同上 |
| 项目名称蓝色可点击 | `mine-mobile.css` + `wb-notify-mobile-page.js` `wb-view-project` |
| 点击打开完整巡线记录详情 | `wb-notify-mobile-page.js` `openProjectDetail` + `buildManualNotifyDetailHtml` |
