const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=414,896']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 414, height: 896, deviceScaleFactor: 2, isMobile: true });
  await page.goto('http://127.0.0.1:8090/app/mine/pages/section-adjust.html', { waitUntil: 'load', timeout: 60000 });
  await page.waitForSelector('#section-adjust-form', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.resolve(__dirname, '../screenshots/mobile-section-adjust.png'), fullPage: true });
  console.log('saved mobile-section-adjust.png');
  await browser.close();
})();
