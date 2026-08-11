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

    // 打开第一台设备的领用记录
    await page.evaluate(() => document.querySelector('[data-action="usage-device"]').click());
    await sleep(400);
    console.log('filter labels:', await page.evaluate(() =>
      Array.from(document.querySelectorAll('.usage-filter label > span')).map(e => e.textContent.trim())
    ));
    console.log('rows before filter:', await page.evaluate(() => document.querySelectorAll('.usage-table tbody tr').length));

    // 领用开始时间 >= 2026-06-10 -> 只剩 6-15 那条
    await page.evaluate(() => {
      document.getElementById('usage-f-start').value = '2026-06-10';
      document.querySelector('[data-action="usage-search"]').click();
    });
    await sleep(300);
    console.log('rows start>=06-10:', await page.evaluate(() => document.querySelectorAll('.usage-table tbody tr').length));

    // 加结束时间 <= 2026-06-30 仍 1 条；<= 2026-06-05 则 0 条
    await page.evaluate(() => {
      document.getElementById('usage-f-end').value = '2026-06-05';
      document.querySelector('[data-action="usage-search"]').click();
    });
    await sleep(300);
    console.log('rows 06-10~06-05 (empty end excluded):', await page.evaluate(() =>
      document.querySelectorAll('.usage-table tbody tr').length || document.querySelector('.usage-empty').textContent.trim()
    ));

    // 用户名称筛选
    await page.evaluate(() => {
      document.querySelector('[data-action="usage-reset"]').click();
    });
    await sleep(200);
    await page.evaluate(() => {
      document.getElementById('usage-f-user').value = '张强';
      document.querySelector('[data-action="usage-search"]').click();
    });
    await sleep(300);
    console.log('rows user=张强:', await page.evaluate(() => document.querySelectorAll('.usage-table tbody tr').length));
    await page.evaluate(() => {
      document.getElementById('usage-f-user').value = '李磊';
      document.querySelector('[data-action="usage-search"]').click();
    });
    await sleep(300);
    console.log('rows user=李磊:', await page.evaluate(() =>
      document.querySelectorAll('.usage-table tbody tr').length || document.querySelector('.usage-empty').textContent.trim()
    ));
    await page.screenshot({ path: path.join(OUT_DIR, 'device-usage-filter.png') });
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
})();
