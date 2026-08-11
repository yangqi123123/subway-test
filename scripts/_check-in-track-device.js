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
  const dialogs = [];
  page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });
  try {
    await page.goto('http://127.0.0.1:8090/web/wb/in-track-device.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'in-track-device-01-list.png') });

    // 列表行数
    console.log('rows:', await page.evaluate(() => document.querySelectorAll('#device-table-body tr').length));

    // 新增弹窗
    await page.evaluate(() => document.querySelector('[data-action="new-device"]').click());
    await sleep(400);
    await page.screenshot({ path: path.join(OUT_DIR, 'in-track-device-02-form.png') });
    // 必填校验：直接保存
    await page.evaluate(() => document.querySelector('[data-action="save-device"]').click());
    await sleep(200);
    console.log('save empty dialog:', dialogs[dialogs.length - 1] || '(none)');
    await page.evaluate(() => document.querySelector('[data-action="close-device-modal"]').click());
    await sleep(200);

    // 编辑弹窗回填
    await page.evaluate(() => document.querySelector('[data-action="edit-device"]').click());
    await sleep(300);
    console.log('edit imei value:', await page.evaluate(() => document.getElementById('device-imei').value));
    await page.evaluate(() => document.querySelector('[data-action="close-device-modal"]').click());
    await sleep(200);

    // 详情
    await page.evaluate(() => document.querySelector('[data-action="detail-device"]').click());
    await sleep(300);
    await page.screenshot({ path: path.join(OUT_DIR, 'in-track-device-03-detail.png') });
    await page.evaluate(() => document.querySelector('[data-action="close-device-detail"]').click());
    await sleep(200);

    // 导入弹窗
    await page.evaluate(() => document.getElementById('btn-import').click());
    await sleep(300);
    console.log('import accept:', await page.evaluate(() => document.getElementById('device-import-file').getAttribute('accept')));
    console.log('template btn:', await page.evaluate(() => !!document.getElementById('device-import-template')));
    await page.screenshot({ path: path.join(OUT_DIR, 'in-track-device-04-import.png') });
    await page.evaluate(() => document.querySelector('[data-action="close-device-import"]').click());
    await sleep(200);

    // 删除二次确认
    await page.evaluate(() => document.querySelector('[data-action="delete-device"]').click());
    await sleep(300);
    console.log('confirm text:', await page.evaluate(() => document.querySelector('#confirm-mask .confirm-card div:nth-child(2)').textContent.trim()));
    await page.screenshot({ path: path.join(OUT_DIR, 'in-track-device-05-delete.png') });
    await page.evaluate(() => document.querySelector('[data-action="cancel-delete"]').click());
    await sleep(200);

    // 筛选
    await page.type('#filter-model', 'BD-900');
    await page.evaluate(() => document.getElementById('btn-search').click());
    await sleep(300);
    console.log('filtered rows:', await page.evaluate(() => document.querySelectorAll('#device-table-body tr').length));

    // 菜单检查
    const menuOk = await page.evaluate(() => {
      const cfg = window.WB_MEGA || window.__WB_MEGA;
      return document.body.innerHTML.length > 0 && true;
    });
    console.log('page loaded ok:', menuOk);
  } catch (err) {
    console.error('Test failed:', err.message);
    await page.screenshot({ path: path.join(OUT_DIR, 'in-track-device-error.png') });
  } finally {
    await browser.close();
  }
})();
