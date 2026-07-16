const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:8090';
const OUT = path.resolve(__dirname, '../screenshots/mobile-batch-notify.png');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=414,896']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 414, height: 896, deviceScaleFactor: 2, isMobile: true });

  // setup batch completion
  await page.goto(BASE + '/app/patrol/pages/today-task.html', { waitUntil: 'load', timeout: 60000 });
  await page.evaluate(() => { window.localStorage.clear(); });
  await page.reload({ waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 800));
  await page.evaluate(() => {
    const today = '2026-07-16';
    window.localStorage.setItem('whmetro-today-task-done', JSON.stringify({ 'T-007': today, 'T-001': today }));
    window.localStorage.setItem('whmetro-today-task-notified-keys', JSON.stringify({ [today]: [] }));
  });
  await page.evaluate(() => { document.querySelector('.mp-today-task-finish').click(); });
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => { document.querySelector('[data-action="today-task-confirm-ok"]').click(); });
  await new Promise(r => setTimeout(r, 500));

  // view notify list
  await page.goto(BASE + '/app/mine/pages/notify.html', { waitUntil: 'load', timeout: 60000 });
  await page.waitForSelector('#wb-mobile-list', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#wb-mobile-list > *'));
    const target = cards.find(c => {
      const t = c.querySelector('h3, .mp-wb-card__title')?.textContent || '';
      return t.includes('已完成巡查');
    });
    if (target) target.scrollIntoView({ block: 'start' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: OUT, fullPage: false });
  console.log('saved', OUT);
  await browser.close();
})();
