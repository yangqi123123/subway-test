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
  try {
    // Web 端
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://127.0.0.1:8090/web/wb/in-device-bind.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(2000);
    console.log('web rows (bound? | hasDelete):', await page.evaluate(() =>
      Array.from(document.querySelectorAll('#bind-table-body tr')).map(tr => {
        const bound = tr.textContent.includes('已绑定');
        const hasDel = !!tr.querySelector('[data-action="delete-device"]');
        return bound + '|' + hasDel;
      })
    ));

    // 移动端
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto('http://127.0.0.1:8090/app/patrol/pages/device-bind.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(2000);
    console.log('mobile cards (bound? | hasDelete):', await page.evaluate(() =>
      Array.from(document.querySelectorAll('.mp-project-card')).map(card => {
        const bound = card.textContent.includes('已绑定');
        const hasDel = !!card.querySelector('[data-action="bind-delete"]');
        return bound + '|' + hasDel;
      })
    ));
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
})();
