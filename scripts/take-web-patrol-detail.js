const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://127.0.0.1:8090';
const OUT = path.resolve(__dirname, '../screenshots/web-pending-patrol-in-pane.png');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,900']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900 });
  page.on('console', msg => console.log('PAGE:', msg.text()));
  page.on('pageerror', err => console.log('PAGEERR:', err.message));

  await page.goto(BASE + '/web/wb/wb-sys-notify.html', { waitUntil: 'networkidle0' });

  await page.waitForSelector('#wb-body tr[data-row-index]', { timeout: 15000 });

  const titles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('#wb-body tr[data-row-index]')).map(r => r.textContent.replace(/\s+/g, ' ').trim());
  });
  console.log('rows:', titles.length, titles.slice(0, 5));

  const rowIndex = titles.findIndex(t => t.includes('洪山路-小洪山已完成巡查') || (t.includes('已完成项目') && t.includes('项目巡查')));
  console.log('rowIndex', rowIndex);
  if (rowIndex < 0) throw new Error('project patrol row not found');

  const rows = await page.$$('#wb-body tr[data-row-index]');
  await rows[rowIndex].click();
  await new Promise(r => setTimeout(r, 500));

  const modalClass = await page.evaluate(() => {
    const m = document.getElementById('wb-modal-mask');
    return m ? m.className : 'no modal';
  });
  console.log('modal class after click:', modalClass);

  await page.waitForSelector('.wb-modal--patrol-split', { timeout: 15000 });

  await page.waitForSelector('[data-action="patrol-view-pending-project"]', { timeout: 10000 });
  const pendingBtn = await page.$('[data-action="patrol-view-pending-project"]');
  await pendingBtn.click();

  await page.waitForSelector('.wb-project-patrol-table tbody tr', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: OUT, fullPage: false });
  console.log('saved', OUT);
  await browser.close();
})();
