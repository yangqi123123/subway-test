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

    // 1. 单个绑定弹窗：字段顺序
    await page.evaluate(() => document.querySelector('[data-action="bind-device"]').click());
    await sleep(400);
    console.log('bind modal labels:', await page.evaluate(() =>
      Array.from(document.querySelectorAll('#bind-modal-mask .bind-form-label')).map(e => e.textContent.trim())
    ));
    // 线路级联 + 人员搜索选择
    await page.select('#bind-line', '8号线');
    await sleep(200);
    await page.select('#bind-start', '徐家棚');
    await page.select('#bind-end', '徐东');
    await sleep(200);
    // 打开搜索选择并选 李磊
    await page.evaluate(() => document.querySelector('#bind-person-select .wh-search-select__trigger').click());
    await sleep(300);
    console.log('person search options:', await page.evaluate(() =>
      Array.from(document.querySelectorAll('#bind-person-select .wh-search-select__option')).map(e => e.textContent.trim())
    ));
    await page.screenshot({ path: path.join(OUT_DIR, 'bind-modal-search.png') });
    await page.evaluate(() => {
      Array.from(document.querySelectorAll('.wh-search-select__option')).find(e => e.textContent.trim() === '李磊').click();
    });
    await sleep(300);
    console.log('phone:', await page.evaluate(() => document.getElementById('bind-phone').value),
      '| dept:', await page.evaluate(() => document.getElementById('bind-dept').value));
    console.log('useStart has value:', await page.evaluate(() => !!document.getElementById('bind-use-start').value));
    await page.evaluate(() => document.querySelector('[data-action="save-bind"]').click());
    await sleep(300);
    console.log('save dialog:', dialogs[dialogs.length - 1]);

    // 2. 批量绑定弹窗（表格形式）
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
    // 删除一行
    await page.evaluate(() => document.querySelector('#batch-bind-rows .batch-bind-del').click());
    await sleep(200);
    console.log('batch rows after del:', await page.evaluate(() => document.querySelectorAll('#batch-bind-rows tr').length));
    // 未选人员直接保存 -> 提示
    await page.evaluate(() => document.querySelector('[data-action="save-batch-bind"]').click());
    await sleep(200);
    console.log('batch save w/o person:', dialogs[dialogs.length - 1]);
    // 选人员后保存
    await page.evaluate(() => document.querySelector('#batch-bind-rows .wh-search-select__trigger').click());
    await sleep(300);
    await page.evaluate(() => {
      document.querySelector('.wh-search-select__option').click();
    });
    await sleep(200);
    await page.evaluate(() => document.querySelector('[data-action="save-batch-bind"]').click());
    await sleep(300);
    console.log('batch save dialog:', dialogs[dialogs.length - 1]);

    // 3. 模板表头
    await page.evaluate(() => document.getElementById('btn-import').click());
    await sleep(300);
    await page.evaluate(() => document.getElementById('bind-import-template').click());
    await sleep(1200);
    const files = fs.readdirSync(DL_DIR);
    files.forEach(f => {
      const content = fs.readFileSync(path.join(DL_DIR, f), 'utf8');
      const cells = Array.from(content.matchAll(/<Data ss:Type="String">([^<]*)<\/Data>/g)).map(m => m[1]);
      console.log(f, '->', JSON.stringify(cells));
    });
  } catch (err) {
    console.error('Test failed:', err.message);
    await page.screenshot({ path: path.join(OUT_DIR, 'bind-check-error.png') });
  } finally {
    await browser.close();
  }
})();
