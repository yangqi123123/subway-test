/**
 * 单元测试：验证单条人工巡检保存不生成系统通知
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

// 模拟 DOM / localStorage / window
const storage = {};
global.localStorage = {
  getItem(k) { return storage[k] || null; },
  setItem(k, v) { storage[k] = String(v); },
  removeItem(k) { delete storage[k]; },
};

global.document = {
  readyState: "complete",
  addEventListener() {},
  getElementById() { return null; },
  querySelector() { return null; },
  createElement() { return { appendChild() {} }; },
};

global.window = global;
global.location = { search: "?source=today-task&taskId=T001&project=测试项目" };
global.addEventListener = function (type, fn) {
  global._listeners = global._listeners || {};
  global._listeners[type] = global._listeners[type] || [];
  global._listeners[type].push(fn);
};
global.dispatchEvent = function (event) {
  var listeners = global._listeners || {};
  var arr = listeners[event.type] || [];
  arr.forEach(function (fn) { fn(event); });
};
global.setTimeout = function (fn) { fn(); };

// 加载人工巡检启动脚本
require(path.join(root, "app", "assets", "js", "manual-page-boot.js"));

// 模拟单条人工巡检提交
const row = {
  id: "M001",
  projectName: "测试项目",
  line: "2号线",
  user: "李明",
  updatedAt: "2026-05-12 18:30",
};

global.dispatchEvent(new CustomEvent("wh-patrol-form-saved", {
  detail: { prefix: "manual", row: row, editing: false }
}));

var extras = JSON.parse(storage["whmetro-notify-extra"] || "[]");
if (extras.length !== 0) {
  console.error("FAIL: 单条人工巡检保存不应生成系统通知", extras);
  process.exit(1);
}

var manualRows = JSON.parse(storage["whmetro-manual-rows"] || "[]");
if (!manualRows.length || manualRows[0].projectName !== "测试项目") {
  console.error("FAIL: 人工巡检记录未保存", manualRows);
  process.exit(1);
}

console.log("PASS: 单条人工巡检保存成功，未生成系统通知");
