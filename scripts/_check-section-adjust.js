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
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  try {
    await page.goto('http://127.0.0.1:8090/app/mine/pages/section-adjust.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(1500);
    console.log('default line:', await page.evaluate(() => document.getElementById('assigned-line-display').textContent));
    console.log('not readonly:', await page.evaluate(() => !document.querySelector('[data-field="assignedLine"]').classList.contains('is-readonly')));

    // 点击调配线路 -> 弹出选择 sheet
    await page.evaluate(() => document.querySelector('[data-field="assignedLine"]').click());
    await sleep(400);
    console.log('sheet open:', await page.evaluate(() => document.getElementById('select-sheet').classList.contains('is-open')));
    console.log('sheet title:', await page.evaluate(() => document.getElementById('select-sheet-title').textContent));
    console.log('options:', await page.evaluate(() =>
      Array.from(document.querySelectorAll('.mp-select-option')).map(e => e.textContent.trim())
    ));
    await page.screenshot({ path: path.join(OUT_DIR, 'mp-section-adjust-line.png') });

    // 选 8号线
    await page.evaluate(() => {
      Array.from(document.querySelectorAll('.mp-select-option')).find(e => e.textContent.trim() === '8号线').click();
    });
    await sleep(200);
    await page.evaluate(() => document.querySelector('[data-action="confirm-select-sheet"]').click());
    await sleep(300);
    console.log('after pick:', await page.evaluate(() => document.getElementById('assigned-line-display').textContent),
      '| hidden:', await page.evaluate(() => document.querySelector('input[name="assignedLine"]').value));
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
})();
