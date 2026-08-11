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
    console.log('chips per row:', await page.evaluate(() =>
      Array.from(document.querySelectorAll('.sr-grade-item')).map(item => {
        const band = item.querySelector('.sr-grade-band').textContent.trim();
        const chip = item.querySelector('.sr-var');
        return band + ' -> ' + (chip ? chip.textContent.trim() : '(无)');
      })
    ));
    await page.screenshot({ path: path.join(OUT_DIR, 'in-score-rule-05-band-chips.png') });
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
})();
