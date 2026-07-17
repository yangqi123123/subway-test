const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:8090';

async function screenshot(page, outPath, fullPage) {
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: outPath, fullPage: fullPage === true });
  console.log('saved', outPath);
}

async function screenshotCard(page, outPath, selector) {
  await page.waitForSelector(selector, { timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  const card = await page.evaluateHandle(sel => {
    const canvas = document.querySelector(sel);
    return canvas && canvas.closest('.mp-drone-chart-card');
  }, selector);
  if (!card.asElement()) throw new Error('No card found for selector ' + selector);
  await card.evaluate(e => { const scroller = document.querySelector('.mp-list-scroll'); if (scroller) { const top = e.getBoundingClientRect().top + scroller.scrollTop - 20; scroller.scrollTo({ top, behavior: 'instant' }); } });
  await new Promise(r => setTimeout(r, 400));
  await card.screenshot({ path: outPath });
  console.log('saved', outPath);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,900']
  });

  const desktop = await browser.newPage();
  await desktop.setViewport({ width: 1600, height: 900 });
  await desktop.goto(BASE + '/web/stats/dc-drone-stats.html', { waitUntil: 'load', timeout: 60000 });
  await screenshot(desktop, path.resolve(__dirname, '../screenshots/web-drone-stats.png'));

  const mobile = await browser.newPage();
  await mobile.setViewport({ width: 414, height: 896, deviceScaleFactor: 2, isMobile: true });
  await mobile.goto(BASE + '/app/stats/pages/drone-ops.html', { waitUntil: 'load', timeout: 60000 });
  await screenshotCard(mobile, path.resolve(__dirname, '../screenshots/mobile-drone-trend.png'), '#trend-chart');
  await screenshotCard(mobile, path.resolve(__dirname, '../screenshots/mobile-drone-duration.png'), '#duration-chart');

  await browser.close();
})();
