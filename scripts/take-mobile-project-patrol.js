const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:8090';
const OUT = path.resolve(__dirname, '../screenshots/mobile-project-patrol-list.png');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=414,896']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 414, height: 896, deviceScaleFactor: 2, isMobile: true });
  await page.goto(BASE + '/app/patrol/pages/project-patrol.html?project=武昌段排水改造工程', { waitUntil: 'load', timeout: 60000 });
  await page.waitForSelector('#patrol-mobile-list > *', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: OUT, fullPage: false });
  console.log('saved', OUT);
  await browser.close();
})();
