const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.join(__dirname, '..', 'screenshots');
const PAGES = ['in-track-person', 'in-track-device', 'in-quality-stats', 'in-score'];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  for (const name of PAGES) {
    try {
      await page.goto('http://127.0.0.1:8090/web/wb/' + name + '.html', { waitUntil: 'networkidle0', timeout: 20000 });
      await sleep(1800);
      const info = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('.disease-quick-link')).map(a => ({
          text: a.textContent.trim(),
          href: a.getAttribute('href'),
          active: a.classList.contains('is-active')
        }));
        return links;
      });
      console.log(name, '->', JSON.stringify(info));
      await page.screenshot({ path: path.join(OUT_DIR, 'quicklinks-' + name + '.png') });
    } catch (err) {
      console.error(name, 'failed:', err.message);
    }
  }

  // 设备信息页：在线时间范围筛选
  try {
    await page.goto('http://127.0.0.1:8090/web/wb/in-track-device.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(1500);
    console.log('filter labels:', await page.evaluate(() =>
      Array.from(document.querySelectorAll('.disease-filter-panel label > span:first-child')).map(e => e.textContent.trim())
    ));
    await page.evaluate(() => {
      document.getElementById('filter-online-start').value = '2026-07-23';
      document.getElementById('filter-online-end').value = '2026-07-23';
      document.getElementById('btn-search').click();
    });
    await sleep(300);
    console.log('online-range 07-23~07-23 rows:', await page.evaluate(() => document.querySelectorAll('#device-table-body tr').length));
    await page.evaluate(() => {
      document.getElementById('filter-online-start').value = '2026-07-21';
      document.getElementById('filter-online-end').value = '2026-07-22';
      document.getElementById('btn-search').click();
    });
    await sleep(300);
    console.log('online-range 07-21~07-22 rows:', await page.evaluate(() => document.querySelectorAll('#device-table-body tr').length));
  } catch (err) {
    console.error('filter check failed:', err.message);
  }
  await browser.close();
})();
