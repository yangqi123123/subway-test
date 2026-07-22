// 截图：巡线任务频率设置 设计稿（临时脚本，仅生成 PNG 预览，不改业务代码）
const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const MOCK = 'file:///' + path.resolve(__dirname, '../screenshots/_mock-task-frequency.html').replace(/\\/g, '/');

const SHOTS = [
  ['?modal=rule', 'task-frequency-rules-prototype.png'],
  ['?tab=shallow&modal=shallow', 'task-frequency-shallow-prototype.png'],
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

  for (const [query, file] of SHOTS) {
    await page.goto(MOCK + query, { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.resolve(__dirname, '..', file), fullPage: true });
    console.log('saved', file);
  }

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
