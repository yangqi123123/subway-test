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
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  try {
    await page.goto('http://127.0.0.1:8090/web/wb/in-score-rule.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'in-score-rule-01.png') });

    console.log('title:', await page.evaluate(() => document.getElementById('sr-title').textContent));
    console.log('minTime:', await page.evaluate(() => document.getElementById('sr-min-time').value));
    console.log('low text:', await page.evaluate(() => document.getElementById('sr-low-text').textContent));
    console.log('quick links:', await page.evaluate(() =>
      Array.from(document.querySelectorAll('.disease-quick-link')).map(a => a.textContent.trim() + (a.classList.contains('is-active') ? '*' : '')).join(', ')
    ));

    // 切换区间
    await page.evaluate(() => {
      Array.from(document.querySelectorAll('.sr-section-item')).find(e => e.textContent.trim() === '常青花园-长港路').click();
    });
    await sleep(300);
    console.log('after switch title:', await page.evaluate(() => document.getElementById('sr-title').textContent));

    // 修改并保存
    await page.evaluate(() => {
      const el = document.getElementById('sr-min-time');
      el.value = '30';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    console.log('low text after edit:', await page.evaluate(() => document.getElementById('sr-low-text').textContent));
    await page.evaluate(() => document.querySelector('[data-action="sr-save"]').click());
    await sleep(300);
    console.log('save toast:', await page.evaluate(() => document.getElementById('sr-toast').textContent));

    // 切走再切回 -> 应保持保存值
    await page.evaluate(() => {
      Array.from(document.querySelectorAll('.sr-section-item')).find(e => e.textContent.trim() === '园博园-园博大道').click();
    });
    await sleep(200);
    await page.evaluate(() => {
      Array.from(document.querySelectorAll('.sr-section-item')).find(e => e.textContent.trim() === '常青花园-长港路').click();
    });
    await sleep(200);
    console.log('persisted minTime:', await page.evaluate(() => document.getElementById('sr-min-time').value));

    // 校验：非递增
    await page.evaluate(() => {
      const first = document.querySelector('.sr-grade-input[data-boundary="1"]');
      first.value = '9';
      first.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.evaluate(() => document.querySelector('[data-action="sr-save"]').click());
    await sleep(200);
    console.log('invalid toast:', await page.evaluate(() => document.getElementById('sr-toast').textContent));
    console.log('boundary sync (80行左框=9):', await page.evaluate(() =>
      Array.from(document.querySelectorAll('.sr-grade-input[data-boundary="1"]')).map(i => i.value).join(',')
    ));

    // 取消恢复
    await page.evaluate(() => document.querySelector('[data-action="sr-cancel"]').click());
    await sleep(200);
    console.log('after cancel boundary1:', await page.evaluate(() => document.querySelector('.sr-grade-input[data-boundary="1"]').value));

    // 搜索
    await page.type('#sr-search', '2号线');
    await sleep(300);
    console.log('search 2号线 groups:', await page.evaluate(() =>
      Array.from(document.querySelectorAll('.sr-line-name')).map(e => e.textContent.trim())
    ));
    await page.screenshot({ path: path.join(OUT_DIR, 'in-score-rule-02-search.png') });
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
})();
