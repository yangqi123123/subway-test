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

    // F 档文案
    console.log('F row:', await page.evaluate(() => document.getElementById('sr-low-text').textContent));

    // 实时校验：B档左框输入 100（t0=100 > t1=5）
    await page.evaluate(() => {
      const el = document.querySelector('.sr-grade-input[data-boundary="1"]');
      el.value = '100';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await sleep(300);
    console.log('invalid marks:', await page.evaluate(() => ({
      b1: document.querySelectorAll('.sr-grade-input[data-boundary="1"].is-invalid').length,
      b2: document.querySelectorAll('.sr-grade-input[data-boundary="2"].is-invalid').length,
      hint: document.getElementById('sr-error-hint').textContent
    })));
    await page.screenshot({ path: path.join(OUT_DIR, 'score-rule-invalid.png') });

    // 修正后恢复
    await page.evaluate(() => {
      const el = document.querySelector('.sr-grade-input[data-boundary="1"]');
      el.value = '0';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await sleep(200);
    console.log('after fix invalid count:', await page.evaluate(() => document.querySelectorAll('.is-invalid').length));

    // 复制 -> toast + 粘贴按钮隐藏（当前区间）
    await page.evaluate(() => document.querySelector('[data-action="sr-copy"]').click());
    await sleep(200);
    console.log('copy toast:', await page.evaluate(() => document.getElementById('sr-toast').textContent));
    console.log('paste hidden on same section:', await page.evaluate(() => document.getElementById('sr-paste').classList.contains('hidden')));

    // 切到其他区间 -> 粘贴按钮显示
    await page.evaluate(() => {
      Array.from(document.querySelectorAll('.sr-section-item')).find(e => e.textContent.trim() === '常青花园-长港路').click();
    });
    await sleep(300);
    console.log('paste visible after switch:', await page.evaluate(() => !document.getElementById('sr-paste').classList.contains('hidden')));
    console.log('before paste minTime:', await page.evaluate(() => document.getElementById('sr-min-time').value));

    // 修改源区间特征值再复制? 已复制的是 红霞-黄家湖 默认 22。先改当前区间再粘贴验证覆盖
    await page.evaluate(() => document.querySelector('[data-action="sr-paste"]').click());
    await sleep(300);
    console.log('paste toast:', await page.evaluate(() => document.getElementById('sr-toast').textContent));
    console.log('after paste minTime:', await page.evaluate(() => document.getElementById('sr-min-time').value));

    // 再切到第三个区间，粘贴按钮仍可用（批量应用）
    await page.evaluate(() => {
      Array.from(document.querySelectorAll('.sr-section-item')).find(e => e.textContent.trim() === '园博园-园博大道').click();
    });
    await sleep(200);
    console.log('paste visible on third section:', await page.evaluate(() => !document.getElementById('sr-paste').classList.contains('hidden')));
    await page.screenshot({ path: path.join(OUT_DIR, 'score-rule-paste.png') });
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
})();
