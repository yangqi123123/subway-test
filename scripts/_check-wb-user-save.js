const puppeteer = require('puppeteer-core');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://127.0.0.1:8090/web/wb/wb-user.html';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page.on('console', m => console.log('[page]', m.text()));
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  try {
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(2000);
    await page.evaluate(() => {
      Array.from(document.querySelectorAll('button, a, span')).find(el => el.textContent.trim() === '编辑').click();
    });
    await sleep(800);

    await page.evaluate(() => document.getElementById('wb-line-section-add').click());
    await sleep(200);
    console.log('rows:', await page.evaluate(() => document.querySelectorAll('#wb-line-section-rows tr').length));

    // 删除新增的空行
    await page.evaluate(() => {
      const rows = document.querySelectorAll('#wb-line-section-rows tr');
      rows[rows.length - 1].querySelector('.wb-line-section__del').click();
    });
    await sleep(200);
    console.log('rows after del:', await page.evaluate(() => document.querySelectorAll('#wb-line-section-rows tr').length));

    // 直接点保存按钮
    const clicked = await page.evaluate(() => {
      const btn = document.getElementById('wb-modal-save');
      if (!btn) return 'no-btn';
      btn.click();
      return 'clicked:' + btn.textContent;
    });
    console.log('save click:', clicked);
    await sleep(600);
    console.log('modal still open:', await page.evaluate(() => !!document.getElementById('wb-line-section-rows')));
    console.log('body toast text:', await page.evaluate(() => document.body.innerText.match(/已保存|请选择|不能相同/g)));
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
})();
