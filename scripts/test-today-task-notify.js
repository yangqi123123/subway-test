/**
 * 单元测试：验证今日任务每次点击【完成当日巡线】仅对新增项目发送新通知
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

// 模拟 localStorage
const storage = {};
global.localStorage = {
  getItem(k) { return storage[k] || null; },
  setItem(k, v) { storage[k] = String(v); },
  removeItem(k) { delete storage[k]; },
};

// 模拟 DOM
global.document = {
  readyState: "complete",
  addEventListener(type, fn) {
    if (type === "click") global._clickHandler = fn;
  },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  createElement() { return { appendChild() {}, classList: { add() {}, remove() {} } }; },
  body: { classList: { add() {}, remove() {} } },
  getElementById(id) {
    if (id === "today-task-confirm-mask") {
      return {
        classList: { add() {}, remove() {} },
        setAttribute() {},
        getAttribute() { return null; },
      };
    }
    if (id === "today-task-confirm-text") {
      return { textContent: "" };
    }
    if (id === "today-task-route-view") {
      return { hidden: false, clientHeight: 0, scrollTo() {} };
    }
    if (id === "today-task-list") {
      return { innerHTML: "" };
    }
    if (id === "today-task-notify-badge") {
      return { hidden: true, textContent: "0" };
    }
    return null;
  },
};

global.window = global;
global.location = { href: "" };
global.addEventListener = function () {};
global.setTimeout = function (fn) { fn(); };

// 模拟 Leaflet
global.L = {
  map: function () {
    return {
      setView: function () { return this; },
      flyTo: function () {},
      fitBounds: function () {},
      invalidateSize: function () {},
    };
  },
  tileLayer: function () { return { addTo: function () {} }; },
  divIcon: function () { return {}; },
  marker: function () {
    return {
      addTo: function () { return this; },
      bindTooltip: function () {},
      on: function () {},
      getLatLng: function () { return { lat: 0, lng: 0 }; },
    };
  },
  featureGroup: function () {
    return { getBounds: function () { return { pad: function () { return this; } }; } };
  },
};

// 模拟 performance
Object.defineProperty(global, "performance", {
  value: { getEntriesByType: function () { return []; } },
  configurable: true,
});

// 模拟 MiniApp.toast
global.MiniApp = { toast: function () {} };

// 加载今日任务脚本
require(path.join(root, "app", "assets", "js", "today-task-page-boot.js"));

if (typeof global._clickHandler !== "function") {
  console.error("FAIL: 未注册点击事件处理函数");
  process.exit(1);
}

const today = new Date().getFullYear() + "-" +
  String(new Date().getMonth() + 1).padStart(2, "0") + "-" +
  String(new Date().getDate()).padStart(2, "0");

function makeClickEvent(selector) {
  return {
    target: {
      closest: function (sel) {
        if (sel === selector) return {};
        return null;
      }
    }
  };
}

// 第一次点击前：模拟已填写项目 A 的巡查记录
storage["whmetro-manual-rows"] = JSON.stringify([
  { id: "M001", taskId: "T-001", projectName: "新建商业文化设施项目", savedAt: today + " 10:00", user: "李明" },
]);

global._clickHandler(makeClickEvent("[data-action='today-task-confirm-ok']"));

var extras1 = JSON.parse(storage["whmetro-notify-extra"] || "[]");
if (extras1.length !== 1) {
  console.error("FAIL: 第一次点击应生成 1 条通知，实际", extras1.length);
  process.exit(1);
}
if ((extras1[0].projects || []).length !== 1 || extras1[0].projects[0].projectName !== "新建商业文化设施项目") {
  console.error("FAIL: 第一条通知应只包含项目 A", extras1[0]);
  process.exit(1);
}

// 第二次点击前：新增项目 B 的巡查记录
storage["whmetro-manual-rows"] = JSON.stringify([
  { id: "M001", taskId: "T-001", projectName: "新建商业文化设施项目", savedAt: today + " 10:00", user: "李明" },
  { id: "M002", taskId: "T-002", projectName: "洪山路至小洪山商业公寓项目", savedAt: today + " 11:00", user: "李明" },
]);

global._clickHandler(makeClickEvent("[data-action='today-task-confirm-ok']"));

var extras2 = JSON.parse(storage["whmetro-notify-extra"] || "[]");
if (extras2.length !== 2) {
  console.error("FAIL: 第二次点击应再生成 1 条新通知，总通知数应为 2，实际", extras2.length);
  process.exit(1);
}
if ((extras2[0].projects || []).length !== 1 || extras2[0].projects[0].projectName !== "洪山路至小洪山商业公寓项目") {
  console.error("FAIL: 第二条通知应只包含新增的项目 B", extras2[0]);
  process.exit(1);
}

console.log("PASS: 每次【完成当日巡线】仅对新增项目生成新通知");
