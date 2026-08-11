const puppeteer = require('puppeteer-core');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  try {
    await page.goto('http://127.0.0.1:8090/app/patrol/pages/device-bind.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(2000);

    // 详情字段值（input value）
    await page.evaluate(() => document.querySelector('[data-action="bind-detail"]').click());
    await sleep(400);
    console.log('detail values:', await page.evaluate(() =>
      Array.from(document.querySelectorAll('#bind-detail-grid input')).map(i => i.value).slice(0, 8)
    ));
    await page.evaluate(() => document.querySelector('[data-action="mp-nav-back"]').click());
    await sleep(300);

    // 关键词搜索（无筛选残留）
    await page.type('#bind-search-trigger', 'GT-06N');
    await sleep(400);
    console.log('search GT-06N cards:', await page.evaluate(() => document.querySelectorAll('.mp-project-card').length));
    await page.evaluate(() => { document.getElementById('bind-search-trigger').value = ''; });
    await page.evaluate(() => document.getElementById('bind-search-trigger').dispatchEvent(new Event('input', { bubbles: true })));
    await sleep(300);
    console.log('cleared search cards:', await page.evaluate(() => document.querySelectorAll('.mp-project-card').length));
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
})();
