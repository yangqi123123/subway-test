const puppeteer = require('puppeteer-core');

(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,900'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1600, height: 900 });
  await p.goto('http://127.0.0.1:8090/web/wb/wb-sys-notify.html', { waitUntil: 'networkidle0' });
  await p.waitForSelector('#wb-body tr[data-row-index]', { timeout: 15000 });
  const titles = await p.evaluate(() => Array.from(document.querySelectorAll('#wb-body tr[data-row-index]')).map(r => r.textContent.replace(/\s+/g, ' ').trim()));
  const rowIndex = titles.findIndex(t => t.includes('洪山路-小洪山已完成巡查'));
  const rows = await p.$$('#wb-body tr[data-row-index]');
  await rows[rowIndex].click();
  await p.waitForSelector('.wb-modal--patrol-split', { timeout: 15000 });
  await new Promise(r => setTimeout(r, 500));
  const classes = await p.evaluate(() => Array.from(document.querySelectorAll('[data-action="patrol-view-pending-project"]')).map(el => el.className));
  console.log('pending project classes:', classes);
  await b.close();
})();
