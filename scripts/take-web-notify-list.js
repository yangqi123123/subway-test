const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:8090';
const OUT = path.resolve(__dirname, '../screenshots/web-sys-notify-list.png');

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
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: OUT, fullPage: false });
  console.log('saved', OUT);
  await browser.close();
})();
