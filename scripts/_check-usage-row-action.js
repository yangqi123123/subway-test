const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.join(__dirname, '..', 'screenshots');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  try {
    await page.goto('http://127.0.0.1:8090/web/wb/in-track-device.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(2000);

    console.log('row actions:', await page.evaluate(() => {
      return Array.from(document.querySelector('#bind-table-body, #device-table-body').querySelectorAll('tr')[0].querySelectorAll('.device-action')).map(a => a.textContent.trim());
    }));

    // 点击列表行的【领用记录】
    await page.evaluate(() => document.querySelector('[data-action="usage-device"]').click());
    await sleep(400);
    console.log('modal title:', await page.evaluate(() => document.getElementById('device-detail-title').textContent));
    console.log('usage rows:', await page.evaluate(() => document.querySelectorAll('.usage-table tbody tr').length));
    await page.screenshot({ path: path.join(OUT_DIR, 'device-usage-row-action.png') });
    await page.evaluate(() => document.querySelector('[data-action="close-device-detail"]').click());
    await sleep(300);

    // 点击【详情】仍是详情视图
    await page.evaluate(() => document.querySelector('[data-action="detail-device"]').click());
    await sleep(400);
    console.log('detail title:', await page.evaluate(() => document.getElementById('device-detail-title').textContent));
    console.log('detail has imei:', await page.evaluate(() => document.getElementById('device-detail-body').textContent.includes('设备IMEI')));
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
})();
