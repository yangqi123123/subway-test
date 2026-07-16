const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://127.0.0.1:8090/app/map/pages/event-annotate.html';
const OUT_DIR = path.join(__dirname, '..', 'screenshots');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function clickBySelector(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.click();
    else throw new Error('element not found: ' + sel);
  }, selector);
}

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  try {
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(1000);
    await page.screenshot({ path: path.join(OUT_DIR, 'spectrum-preview-01-default.png'), fullPage: false });

    // 点击左侧当前告警点频谱图
    await clickBySelector(page, '[data-action="spectrum-preview"][data-index="0"]');
    await sleep(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'spectrum-preview-02-left-open.png'), fullPage: false });

    // 关闭
    await clickBySelector(page, '[data-action="close-spectrum-preview-modal"]');
    await sleep(300);

    // 生成右侧对比频谱图
    await clickBySelector(page, '#event-open-generate-btn');
    await sleep(500);
    await clickBySelector(page, '[data-generate-tab="typical"]');
    await sleep(300);
    await clickBySelector(page, '#event-generate-typical-gallery [data-typical-id]');
    await sleep(300);
    await clickBySelector(page, '#event-modal-generate-btn');
    await sleep(700);
    await page.screenshot({ path: path.join(OUT_DIR, 'spectrum-preview-03-compare-loaded.png'), fullPage: false });

    // 点击右侧对比频谱图
    await clickBySelector(page, '[data-action="spectrum-preview"][data-index="1"]');
    await sleep(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'spectrum-preview-04-right-open.png'), fullPage: false });

    // 点击左箭头切换
    await clickBySelector(page, '[data-action="spectrum-preview-prev"]');
    await sleep(400);
    await page.screenshot({ path: path.join(OUT_DIR, 'spectrum-preview-05-switch-prev.png'), fullPage: false });

    // 点击右箭头切换
    await clickBySelector(page, '[data-action="spectrum-preview-next"]');
    await sleep(400);
    await page.screenshot({ path: path.join(OUT_DIR, 'spectrum-preview-06-switch-next.png'), fullPage: false });

    console.log('Screenshots saved to', OUT_DIR);
  } catch (err) {
    console.error('Test failed:', err.message);
    await page.screenshot({ path: path.join(OUT_DIR, 'spectrum-preview-error.png'), fullPage: false });
  } finally {
    await browser.close();
  }
})();
