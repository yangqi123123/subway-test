const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.join(__dirname, '..', 'screenshots');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  try {
    await page.goto('http://127.0.0.1:8090/web/wb/in-track-device.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(2000);
    await page.evaluate(() => document.querySelector('[data-action="usage-device"]').click());
    await sleep(400);
    const check = await page.evaluate(() => {
      const filter = document.querySelector('.usage-filter');
      const items = Array.from(filter.children);
      const bottoms = new Set(items.map(el => Math.round(el.getBoundingClientRect().bottom)));
      return { sameLine: bottoms.size === 1, dialogWidth: Math.round(document.querySelector('.am-detail-dialog').getBoundingClientRect().width) };
    });
    console.log('filter same line:', check.sameLine, '| dialog width:', check.dialogWidth);
    await page.screenshot({ path: path.join(OUT_DIR, 'device-usage-filter-oneline.png') });
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
})();
