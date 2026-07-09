/**
 * 验证从项目巡查列表打开人工巡检详情后返回项目巡查列表
 * 用法: node scripts/test-notify-back.js
 */
const http = require("http");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9223;
const BASE = "http://127.0.0.1:8080";
const OUT_DIR = path.resolve(__dirname, "../screenshots");

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on("error", reject);
  });
}

function connectCdp(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();

    ws.addEventListener("open", () => {
      resolve({
        send(method, params = {}) {
          return new Promise((res, rej) => {
            const cid = ++id;
            pending.set(cid, { resolve: res, reject: rej });
            ws.send(JSON.stringify({ id: cid, method, params }));
          });
        },
        on(event, handler) {
          ws.addEventListener("message", (msg) => {
            const data = JSON.parse(msg.data.toString());
            if (data.method === event) handler(data.params);
          });
        },
        close() { ws.close(); }
      });
    });

    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data.toString());
      if (msg.id && pending.has(msg.id)) {
        const p = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) p.reject(new Error(msg.error.message));
        else p.resolve(msg.result);
      }
    });

    ws.addEventListener("error", reject);
  });
}

async function screenshot(cdp, filename) {
  const { data } = await cdp.send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(OUT_DIR, filename), Buffer.from(data, "base64"));
  console.log("screenshot saved:", filename);
}

async function evalExpr(cdp, expression, returnByValue) {
  return await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: false,
    returnByValue: !!returnByValue,
  });
}

async function navigate(cdp, url) {
  const loaded = new Promise((resolve) => {
    cdp.on("Page.loadEventFired", resolve);
  });
  await cdp.send("Page.navigate", { url });
  await loaded;
  await delay(600);
}

async function main() {
  const userDataDir = path.join(OUT_DIR, "chrome-user-data-back-" + Date.now());
  const chrome = spawn(CHROME, [
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    "--remote-debugging-port=" + PORT,
    "--user-data-dir=" + userDataDir,
    "--window-size=393,852",
    "--hide-scrollbars",
    "--disable-features=IsolateOrigins,site-per-process",
    "about:blank",
  ], { stdio: "ignore" });
  console.log("chrome started, pid:", chrome.pid);

  let info;
  for (let i = 0; i < 30; i++) {
    try {
      const pages = await fetchJson("http://127.0.0.1:" + PORT + "/json/list");
      info = pages.find((p) => p.type === "page");
      if (info && info.webSocketDebuggerUrl) break;
    } catch (e) {}
    await delay(500);
  }
  if (!info) throw new Error("Chrome 调试端口未就绪");
  console.log("connected to CDP page:", info.id, info.url);

  const cdp = await connectCdp(info.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Runtime.setAsyncCallStackDepth", { maxDepth: 32 });
  cdp.send("Console.enable").catch(() => {});
  cdp.on("Runtime.consoleAPICalled", (params) => {
    const text = (params.args || []).map(a => a.value || a.description || "").join(" ");
    console.log("[console]", text);
  });

  // 准备数据：创建一个今日巡线汇总通知
  await evalExpr(cdp, `
    localStorage.clear();
    localStorage.setItem('whmetro-notify-extra', JSON.stringify([{
      id: 'task-notify-test-001',
      title: '2026-07-09 李明 已完成以下项目的巡查',
      type: '项目巡查',
      time: '2026-07-09 10:30',
      read: '未读',
      source: '今日巡线',
      projects: [
        { projectName: '新建商业文化设施项目', taskId: 'T001', line: '8号线', direction: '上行', section: '水果湖-洪山路', station: '洪山路', patrolDate: '2026-07-09', progress: '正常', user: '李明', id: 'manual-001' },
        { projectName: '洪山路至小洪山商业公寓项目', taskId: 'T002', line: '8号线', direction: '下行', section: '洪山路-小洪山', station: '小洪山', patrolDate: '2026-07-09', progress: '正常', user: '李明', id: 'manual-002' }
      ]
    }]));
    localStorage.setItem('whmetro-manual-rows', JSON.stringify([
      { id: 'manual-001', projectName: '新建商业文化设施项目', taskId: 'T001', line: '8号线', direction: '上行', section: '水果湖-洪山路', station: '洪山路', patrolDate: '2026-07-09', progress: '正常', user: '李明', savedAt: '2026-07-09 10:30' },
      { id: 'manual-002', projectName: '洪山路至小洪山商业公寓项目', taskId: 'T002', line: '8号线', direction: '下行', section: '洪山路-小洪山', station: '小洪山', patrolDate: '2026-07-09', progress: '正常', user: '李明', savedAt: '2026-07-09 10:30' }
    ]));
    "prepared";
  `, true);

  // 打开通知页
  await navigate(cdp, BASE + "/app/mine/pages/notify.html");
  await delay(1000);
  await screenshot(cdp, "back-01-notify-list.png");

  // 点击“查看”打开项目巡查列表
  await evalExpr(cdp, `
    (function(){
      var cards = Array.from(document.querySelectorAll('.mp-wb-card--todo'));
      var card = cards.find(function(c){ return c.textContent.indexOf('已完成巡查') >= 0; });
      if (!card) return 'no patrol card';
      var btn = card.querySelector('[data-action="wb-view"]');
      if (!btn) return 'no view button';
      btn.click();
      return 'clicked view';
    })()
  `, true);
  await delay(500);
  await screenshot(cdp, "back-02-notify-detail.png");

  // 检查详情是否打开
  let detailOpen = await evalExpr(cdp, `
    var detail = document.getElementById('wb-detail-view');
    detail && !detail.classList.contains('hidden');
  `, true);
  console.log("detail opened:", detailOpen.result.value);
  if (!detailOpen.result.value) {
    throw new Error("FAIL: 点击查看后未打开项目巡查列表");
  }

  // 点击第一个项目
  const navigated = new Promise((resolve) => {
    cdp.on("Page.loadEventFired", resolve);
  });
  await evalExpr(cdp, `
    (function(){
      var btn = document.querySelector('.mp-wb-detail-project[data-action="wb-view-project"]');
      if (!btn) return 'no project button';
      btn.click();
      return 'clicked project';
    })()
  `, true);
  await navigated;
  await delay(600);
  await screenshot(cdp, "back-03-manual-detail.png");

  // 检查是否在 manual.html
  let loc = await evalExpr(cdp, `
    (function(){ return { href: location.href, search: location.search }; })()
  `, true);
  console.log("manual location:", JSON.stringify(loc.result.value));
  if (loc.result.value.href.indexOf('manual.html') < 0) {
    throw new Error("FAIL: 点击项目后未跳转到人工巡检详情");
  }
  if (loc.result.value.search.indexOf('fromNotifyDetail') < 0) {
    throw new Error("FAIL: 跳转链接未包含 fromNotifyDetail");
  }

  // 点击返回按钮
  const backNavigated = new Promise((resolve) => {
    cdp.on("Page.loadEventFired", resolve);
  });
  await evalExpr(cdp, `
    (function(){
      var btn = document.querySelector('[data-action="mp-nav-back"]');
      if (!btn) return 'no back button';
      btn.click();
      return 'clicked back';
    })()
  `, true);
  await backNavigated;
  await delay(800);
  await screenshot(cdp, "back-04-after-back.png");

  // 检查是否回到 notify.html 且详情打开
  loc = await evalExpr(cdp, `
    (function(){
      var detail = document.getElementById('wb-detail-view');
      return {
        href: location.href,
        detailOpen: detail && !detail.classList.contains('hidden'),
        detailText: document.getElementById('wb-detail-body') ? document.getElementById('wb-detail-body').textContent : ''
      };
    })()
  `, true);
  console.log("after back:", JSON.stringify(loc.result.value));
  if (loc.result.value.href.indexOf('notify.html') < 0) {
    throw new Error("FAIL: 返回后未回到系统通知页");
  }
  if (!loc.result.value.detailOpen) {
    throw new Error("FAIL: 返回后未自动打开项目巡查列表详情");
  }
  if (loc.result.value.detailText.indexOf('已完成项目') < 0) {
    throw new Error("FAIL: 返回后详情内容不正确");
  }

  cdp.close();
  chrome.kill();
  console.log("PASS: 返回项目巡查列表验证通过");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
