const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:8090';
const OUT = path.resolve(__dirname, '../screenshots/web-patrol-detail-default.png');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,900']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900 });
  await page.goto(BASE + '/web/wb/wb-sys-notify.html', { waitUntil: 'networkidle0' });
  await page.waitForSelector('#wb-body tr[data-row-index]', { timeout: 15000 });
  const titles = await page.evaluate(() => Array.from(document.querySelectorAll('#wb-body tr[data-row-index]')).map(r => r.textContent.replace(/\s+/g, ' ').trim()));
  const rowIndex = titles.findIndex(t => t.includes('洪山路-小洪山已完成巡查'));
  const rows = await page.$$('#wb-body tr[data-row-index]');
  await rows[rowIndex].click();
  await page.waitForSelector('.wb-modal--patrol-split', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: OUT, fullPage: false });
  console.log('saved', OUT);
  await browser.close();
})();
