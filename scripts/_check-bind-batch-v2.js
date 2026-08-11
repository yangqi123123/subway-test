const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.join(__dirname, '..', 'screenshots');
const DL_DIR = path.join(__dirname, '..', 'screenshots', 'dl-check');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  fs.rmSync(DL_DIR, { recursive: true, force: true });
  fs.mkdirSync(DL_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const client = await page.createCDPSession();
  await client.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: DL_DIR });
  const dialogs = [];
  page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });
  try {
    await page.goto('http://127.0.0.1:8090/web/wb/in-device-bind.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(2000);

    // 批量绑定：勾选两台未绑定设备
    await page.evaluate(() => {
      Array.from(document.querySelectorAll('.row-check')).forEach(el => {
        el.checked = !el.closest('tr').textContent.includes('已绑定');
      });
    });
    await page.evaluate(() => document.querySelector('[data-action="batch-bind"]').click());
    await sleep(400);
    console.log('batch rows:', await page.evaluate(() =>
      Array.from(document.querySelectorAll('#batch-bind-rows tr')).map(tr => tr.cells[0].textContent.trim())
    ));
    await page.screenshot({ path: path.join(OUT_DIR, 'bind-batch-modal.png') });

    // 逐行搜索选择人员：第1行选 王芳，第2行选 陈杰
    const names = ['王芳', '陈杰'];
    for (let i = 0; i < names.length; i++) {
      await page.evaluate((idx) => {
        document.querySelectorAll('#batch-bind-rows .wh-search-select__trigger')[idx].click();
      }, i);
      await sleep(300);
      await page.evaluate((name) => {
        Array.from(document.querySelectorAll('.wh-search-select__option')).find(e => e.textContent.trim() === name).click();
      }, names[i]);
      await sleep(300);
    }
    await page.evaluate(() => document.querySelector('[data-action="save-batch-bind"]').click());
    await sleep(400);
    console.log('batch save dialog:', dialogs[dialogs.length - 1]);
    console.log('bound count after:', await page.evaluate(() =>
      Array.from(document.querySelectorAll('#bind-table-body tr')).filter(tr => tr.textContent.includes('已绑定')).length
    ));
    console.log('stats bound:', await page.evaluate(() => document.querySelector('#stat-bound .disease-stat-card__num').textContent));

    // 模板表头
    await page.evaluate(() => document.getElementById('btn-import').click());
    await sleep(300);
    await page.evaluate(() => document.getElementById('bind-import-template').click());
    await sleep(1200);
    fs.readdirSync(DL_DIR).forEach(f => {
      const content = fs.readFileSync(path.join(DL_DIR, f), 'utf8');
      const cells = Array.from(content.matchAll(/<Data ss:Type="String">([^<]*)<\/Data>/g)).map(m => m[1]);
      console.log(f, '->', JSON.stringify(cells));
    });
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
})();
