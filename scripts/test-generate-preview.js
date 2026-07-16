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

    // 打开生成弹窗
    await clickBySelector(page, '#event-open-generate-btn');
    await sleep(500);

    // 切换到历史报警
    await clickBySelector(page, '[data-generate-tab="alarm"]');
    await sleep(400);
    await page.screenshot({ path: path.join(OUT_DIR, 'generate-preview-01-alarm-tab.png'), fullPage: false });

    // 点击第一个报警 thumb
    await clickBySelector(page, '#event-generate-alarm-list [data-preview-group="alarm"]');
    await sleep(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'generate-preview-02-alarm-open.png'), fullPage: false });

    // 关闭预览
    await clickBySelector(page, '[data-action="close-spectrum-preview-modal"]');
    await sleep(300);

    // 切换到典型事件
    await clickBySelector(page, '[data-generate-tab="typical"]');
    await sleep(400);
    await page.screenshot({ path: path.join(OUT_DIR, 'generate-preview-03-typical-tab.png'), fullPage: false });

    // 点击第一个典型事件 thumb
    await clickBySelector(page, '#event-generate-typical-gallery [data-preview-group="typical"]');
    await sleep(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'generate-preview-04-typical-open.png'), fullPage: false });

    // 切换到下一个
    await clickBySelector(page, '[data-action="spectrum-preview-next"]');
    await sleep(400);
    await page.screenshot({ path: path.join(OUT_DIR, 'generate-preview-05-typical-next.png'), fullPage: false });

    // 关闭
    await clickBySelector(page, '[data-action="close-spectrum-preview-modal"]');
    await sleep(300);

    console.log('Screenshots saved to', OUT_DIR);
  } catch (err) {
    console.error('Test failed:', err.message);
    await page.screenshot({ path: path.join(OUT_DIR, 'generate-preview-error.png'), fullPage: false });
  } finally {
    await browser.close();
  }
})();
