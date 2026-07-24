const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://127.0.0.1:8090/web/wb/wb-user.html';
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
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  try {
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(2000);

    // 打开第一行的编辑弹窗
    const opened = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button, a, span')).find(el => el.textContent.trim() === '编辑');
      if (btn) { btn.click(); return true; }
      return false;
    });
    console.log('edit modal opened:', opened);
    await sleep(1000);
    await page.screenshot({ path: path.join(OUT_DIR, 'wb-user-form-01-edit.png') });

    // 点击线路区间的【新增】加一行
    await page.evaluate(() => {
      const add = document.getElementById('wb-line-section-add');
      if (add) add.click();
    });
    await sleep(400);
    const rows = await page.evaluate(() => document.querySelectorAll('#wb-line-section-rows tr').length);
    console.log('line-section rows after add:', rows);
    await page.screenshot({ path: path.join(OUT_DIR, 'wb-user-form-02-added.png') });

    // 校验岗位下方文案已移除
    const hint = await page.evaluate(() => {
      const wrap = document.getElementById('wb-post-select');
      const item = wrap && wrap.closest('.wb-form-item');
      return item ? item.textContent : '';
    });
    console.log('post field text contains hint:', hint.indexOf('选择岗位时请先选择部门') >= 0);
  } catch (err) {
    console.error('Test failed:', err.message);
    await page.screenshot({ path: path.join(OUT_DIR, 'wb-user-form-error.png') });
  } finally {
    await browser.close();
  }
})();
