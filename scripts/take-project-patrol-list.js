const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:8090';

async function screenshot(page, url, outPath, isMobile) {
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForSelector('table tbody tr, .mp-project-list .mp-patrol-card', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: outPath, fullPage: false });
  console.log('saved', outPath);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,900']
  });

  // desktop
  const desktop = await browser.newPage();
  await desktop.setViewport({ width: 1600, height: 900 });
  await screenshot(desktop, BASE + '/web/wb/in-project-patrol.html?project=武昌段排水改造工程', path.resolve(__dirname, '../screenshots/web-project-patrol-list.png'), false);

  // mobile
  const mobile = await browser.newPage();
  await mobile.setViewport({ width: 414, height: 896, deviceScaleFactor: 2, isMobile: true });
  await screenshot(mobile, BASE + '/app/patrol/pages/project-patrol.html?project=武昌段排水改造工程', path.resolve(__dirname, '../screenshots/mobile-project-patrol-list.png'), true);

  await browser.close();
})();
