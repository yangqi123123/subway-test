/**
 * 使用 Chrome DevTools Protocol (原生 WebSocket) 验证项目巡查通知规则
 * 用法: node scripts/verify-manual-notify-cdp.js
 */
const http = require("http");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9222;
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
    const listeners = [];

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
          listeners.push({ event, handler });
        },
        close() {
          ws.close();
        },
      });
    });

    ws.addEventListener("message", (event) => {
      const data = event.data;
      const msg = JSON.parse(data.toString());
      if (msg.id && pending.has(msg.id)) {
        const p = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) p.reject(new Error(msg.error.message));
        else p.resolve(msg.result);
      }
      if (msg.method) {
        listeners.forEach((l) => {
          if (l.event === msg.method) l.handler(msg.params);
        });
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
  const userDataDir = path.join(OUT_DIR, "chrome-user-data-" + Date.now());
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

  // 清理 localStorage
  await evalExpr(cdp, `
    localStorage.clear();
    "cleared";
  `, true);

  // 步骤 1: 提交单条人工巡检记录（不应生成通知）
  const manualUrl = BASE + "/app/patrol/pages/manual.html?action=new&source=today-task&taskId=T001&project=" + encodeURIComponent("洪山路至小洪山商业公寓项目") + "&line=2号线&direction=上行&section=洪山路-小洪山&station=洪山路&patrolDate=2026-07-03";
  await navigate(cdp, manualUrl);
  await evalExpr(cdp, `
    document.getElementById('f-progress').value = '项目进展正常，无异常';
    document.getElementById('f-patrol-date').value = '2026-07-03T00:00';
    document.querySelector('[data-action="save-manual"]').click();
    "saved";
  `, true);
  await delay(600);

  let check = await evalExpr(cdp, `
    (function(){
      var extras = JSON.parse(localStorage.getItem('whmetro-notify-extra') || '[]');
      var rows = JSON.parse(localStorage.getItem('whmetro-manual-rows') || '[]');
      return { extras: extras.length, rows: rows.length };
    })()
  `, true);
  console.log("after manual save:", JSON.stringify(check.result.value));
  if (check.result.value.extras !== 0) {
    throw new Error("FAIL: 单条人工巡检保存不应生成通知");
  }
  if (check.result.value.rows !== 1) {
    throw new Error("FAIL: 单条人工巡检记录未保存");
  }

  // 步骤 2: 在今日任务页点击【完成当日巡线】
  await navigate(cdp, BASE + "/app/patrol/pages/today-task.html");
  await evalExpr(cdp, `
    document.querySelector('.mp-today-task-finish').click();
    "opened confirm";
  `, true);
  await delay(300);
  await evalExpr(cdp, `
    document.querySelector('[data-action="today-task-confirm-ok"]').click();
    "confirmed";
  `, true);
  await delay(600);

  check = await evalExpr(cdp, `
    (function(){
      var extras = JSON.parse(localStorage.getItem('whmetro-notify-extra') || '[]');
      var rows = JSON.parse(localStorage.getItem('whmetro-manual-rows') || '[]');
      var agg = extras.find(function(n){ return n.id && n.id.indexOf('task-notify-daily') === 0; });
      return {
        extras: extras.length,
        rows: rows.length,
        hasAgg: !!agg,
        projectCount: agg && agg.projects ? agg.projects.length : 0,
        read: agg ? agg.read : null,
        readSet: JSON.parse(localStorage.getItem('whmetro-notify-read') || '[]')
      };
    })()
  `, true);
  console.log("after finish daily:", JSON.stringify(check.result.value));
  if (!check.result.value.hasAgg || check.result.value.projectCount !== 1) {
    throw new Error("FAIL: 完成当日巡线后未生成汇总通知");
  }
  if (check.result.value.read !== "未读") {
    throw new Error("FAIL: 新通知默认应为未读");
  }

  // 步骤 3: 跳转通知页，验证隐藏【查看】按钮、可点击标题/项目
  await navigate(cdp, BASE + "/app/mine/pages/notify.html");
  await screenshot(cdp, "03-notify-list.png");

  const hasViewBtn = await evalExpr(cdp, `
    (function(){
      var cards = Array.from(document.querySelectorAll('.mp-wb-card--todo'));
      var agg = cards.find(function(c){ return c.textContent.indexOf('已完成以下项目的巡查') >= 0; });
      return agg ? agg.querySelector('.mp-project-card__actions, .mp-project-action') !== null : false;
    })()
  `, true);
  if (hasViewBtn.result.value) {
    throw new Error("FAIL: 项目巡查通知卡片不应显示【查看】按钮");
  }

  // 步骤 4: 点击通知标题进入详情，验证自动标记已读
  await evalExpr(cdp, `
    document.querySelector('.mp-wb-card__head[data-action="wb-view"]').click();
    "opened detail";
  `, true);
  await delay(500);
  await screenshot(cdp, "04-notify-detail.png");

  check = await evalExpr(cdp, `
    (function(){
      var extras = JSON.parse(localStorage.getItem('whmetro-notify-extra') || '[]');
      var agg = extras.find(function(n){ return n.id && n.id.indexOf('task-notify-daily') === 0; });
      return {
        read: agg ? agg.read : null,
        readSet: JSON.parse(localStorage.getItem('whmetro-notify-read') || '[]')
      };
    })()
  `, true);
  console.log("after view detail:", JSON.stringify(check.result.value));
  if (check.result.value.read !== "已读") {
    throw new Error("FAIL: 查看详情后通知应标记为已读");
  }

  // 步骤 5: 返回列表点击项目名称，验证跳转对应巡检记录
  await evalExpr(cdp, `
    document.querySelector('[data-action="mp-nav-back"]').click();
    "back to list";
  `, true);
  await delay(400);
  const navigated = new Promise((resolve) => {
    cdp.on("Page.loadEventFired", resolve);
  });
  await evalExpr(cdp, `
    document.querySelector('.mp-wb-card__project[data-action="wb-view-project"]').click();
    "clicked project";
  `, true);
  await navigated;
  await delay(600);
  await screenshot(cdp, "05-project-detail.png");

  const loc = await evalExpr(cdp, `
    (function(){
      return { href: location.href, title: document.title };
    })()
  `, true);
  console.log("project detail location:", JSON.stringify(loc.result.value));
  if (loc.result.value.href.indexOf('manual.html') < 0) {
    throw new Error("FAIL: 点击项目名称应跳转到人工巡检记录页");
  }

  cdp.close();
  chrome.kill();
  console.log("PASS: 所有验证通过");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
