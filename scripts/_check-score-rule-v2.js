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
    await page.goto('http://127.0.0.1:8090/web/wb/in-score-rule.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'in-score-rule-03-bands.png') });

    console.log('grade rows:', await page.evaluate(() =>
      Array.from(document.querySelectorAll('.sr-grade-item')).map(item =>
        item.querySelector('.sr-grade-score').textContent.trim().replace(/\s+/g, '') +
        ' | ' + item.querySelector('.sr-grade-text').textContent.trim().replace(/\s+/g, ' ')
      )
    ));
    console.log('low row html has chip:', await page.evaluate(() =>
      document.getElementById('sr-low-text').querySelector('.sr-var') !== null
    ));

    // 改 t0=1 -> B档行左右两框联动、F档不变
    await page.evaluate(() => {
      const el = document.querySelector('.sr-grade-input[data-boundary="1"]');
      el.value = '1';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await sleep(200);
    console.log('t0 synced:', await page.evaluate(() =>
      Array.from(document.querySelectorAll('.sr-grade-input[data-boundary="1"]')).map(i => i.value).join(',')
    ));
    // 保存校验：t0=1 < t1=5 OK
    await page.evaluate(() => document.querySelector('[data-action="sr-save"]').click());
    await sleep(300);
    console.log('save toast:', await page.evaluate(() => document.getElementById('sr-toast').textContent));
    await page.screenshot({ path: path.join(OUT_DIR, 'in-score-rule-04-saved.png') });
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
})();
