const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:8090';
const OUT = path.resolve(__dirname, '../screenshots/mobile-sys-notify-list.png');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=414,896']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 414, height: 896, deviceScaleFactor: 2, isMobile: true });
  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.log('PAGEERR:', err.message));
  await page.goto(BASE + '/app/mine/pages/notify.html', { waitUntil: 'load', timeout: 60000 });
  await page.waitForSelector('#wb-mobile-list', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  // scroll to project patrol cards
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#wb-mobile-list > *'));
    const target = cards.find(c => {
      const t = c.querySelector('h3, .mp-wb-card__title')?.textContent || '';
      return t.includes('已完成巡查');
    });
    if (target) target.scrollIntoView({ block: 'start' });
    else window.scrollTo(0, 600);
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: OUT, fullPage: false });
  console.log('saved', OUT);
  await browser.close();
})();
