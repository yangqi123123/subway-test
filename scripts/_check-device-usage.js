const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.join(__dirname, '..', 'screenshots');

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
  try {
    await page.goto('http://127.0.0.1:8090/web/wb/in-track-device.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(2000);

    // 打开第一台设备详情
    await page.evaluate(() => document.querySelector('[data-action="detail-device"]').click());
    await sleep(400);
    console.log('usage btn exists:', await page.evaluate(() => {
      const b = document.getElementById('device-usage-btn');
      return b ? b.textContent.trim() : null;
    }));

    // 切换到领用记录
    await page.evaluate(() => document.getElementById('device-usage-btn').click());
    await sleep(300);
    console.log('usage headers:', await page.evaluate(() =>
      Array.from(document.querySelectorAll('.usage-table th')).map(th => th.textContent.trim())
    ));
    console.log('usage rows:', await page.evaluate(() => document.querySelectorAll('.usage-table tbody tr').length));
    console.log('btn text now:', await page.evaluate(() => document.getElementById('device-usage-btn').textContent.trim()));
    await page.screenshot({ path: path.join(OUT_DIR, 'device-detail-usage.png') });

    // 切回详情
    await page.evaluate(() => document.getElementById('device-usage-btn').click());
    await sleep(300);
    console.log('back to detail:', await page.evaluate(() => document.getElementById('device-detail-body').textContent.includes('设备IMEI')));
    await page.evaluate(() => document.querySelector('[data-action="close-device-detail"]').click());
    await sleep(200);

    // 无记录设备
    await page.evaluate(() => {
      Array.from(document.querySelectorAll('[data-action="detail-device"]'))[2].click();
    });
    await sleep(300);
    await page.evaluate(() => document.getElementById('device-usage-btn').click());
    await sleep(300);
    console.log('empty usage text:', await page.evaluate(() => {
      const el = document.querySelector('.usage-empty');
      return el ? el.textContent.trim() : '(none)';
    }));
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
})();
