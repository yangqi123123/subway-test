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
    await page.goto('http://127.0.0.1:8090/web/wb/in-device-bind.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'in-device-bind-01-list.png') });

    console.log('rows:', await page.evaluate(() => document.querySelectorAll('#bind-table-body tr').length));
    console.log('quick links:', await page.evaluate(() =>
      Array.from(document.querySelectorAll('.disease-quick-link')).map(a => a.textContent.trim() + (a.classList.contains('is-active') ? '*' : '')).join(', ')
    ));

    // 单行绑定：点击未绑定行的【绑定】
    await page.evaluate(() => document.querySelector('[data-action="bind-device"]').click());
    await sleep(400);
    await page.screenshot({ path: path.join(OUT_DIR, 'in-device-bind-02-bind.png') });
    console.log('bind imei 回显:', await page.evaluate(() => document.getElementById('bind-imei').value));
    console.log('bind model 回显:', await page.evaluate(() => document.getElementById('bind-model').value));

    // 选择线路 -> 区间与人员联动
    await page.select('#bind-line', '8号线');
    await sleep(200);
    console.log('start options:', await page.evaluate(() => Array.from(document.getElementById('bind-start').options).map(o => o.textContent)));
    await page.select('#bind-start', '徐家棚');
    await page.select('#bind-end', '徐东');
    await sleep(200);
    console.log('person options:', await page.evaluate(() => Array.from(document.getElementById('bind-person').options).map(o => o.textContent)));
    await page.select('#bind-person', '李磊');
    await sleep(200);
    console.log('phone 回显:', await page.evaluate(() => document.getElementById('bind-phone').value),
      '| dept 回显:', await page.evaluate(() => document.getElementById('bind-dept').value));
    await page.evaluate(() => document.querySelector('[data-action="save-bind"]').click());
    await sleep(400);
    console.log('after bind dialog:', dialogs[dialogs.length - 1]);
    console.log('row3 now bound:', await page.evaluate(() => document.querySelectorAll('#bind-table-body tr')[2].textContent.includes('已绑定')));

    // 解绑二次确认
    await page.evaluate(() => document.querySelector('[data-action="unbind-device"]').click());
    await sleep(300);
    console.log('unbind confirm:', await page.evaluate(() => document.getElementById('confirm-message').textContent));
    await page.screenshot({ path: path.join(OUT_DIR, 'in-device-bind-03-unbind.png') });
    await page.evaluate(() => document.querySelector('[data-action="ok-confirm"]').click());
    await sleep(300);

    // 删除二次确认
    await page.evaluate(() => document.querySelector('[data-action="delete-device"]').click());
    await sleep(300);
    console.log('delete confirm:', await page.evaluate(() => document.getElementById('confirm-message').textContent));
    await page.evaluate(() => document.querySelector('[data-action="cancel-confirm"]').click());
    await sleep(200);

    // 批量绑定校验
    await page.evaluate(() => document.querySelector('[data-action="batch-bind"]').click());
    await sleep(200);
    console.log('batch-bind no selection dialog:', dialogs[dialogs.length - 1]);
    // 勾选未绑定行后批量绑定
    await page.evaluate(() => {
      Array.from(document.querySelectorAll('.row-check')).forEach(el => {
        el.checked = !el.closest('tr').textContent.includes('已绑定');
      });
    });
    await page.evaluate(() => document.querySelector('[data-action="batch-bind"]').click());
    await sleep(300);
    console.log('batch bind modal imeis:', await page.evaluate(() => document.getElementById('bind-imei').value));
    await page.evaluate(() => document.querySelector('[data-action="close-bind-modal"]').click());
    await sleep(200);

    // 导入弹窗
    await page.evaluate(() => document.getElementById('btn-import').click());
    await sleep(300);
    console.log('import accept:', await page.evaluate(() => document.getElementById('bind-import-file').getAttribute('accept')),
      '| template:', await page.evaluate(() => !!document.getElementById('bind-import-template')));
    await page.screenshot({ path: path.join(OUT_DIR, 'in-device-bind-04-import.png') });
    await page.evaluate(() => document.querySelector('[data-action="close-bind-import"]').click());
    await sleep(200);

    // 筛选
    await page.select('#filter-line', '8号线');
    await page.evaluate(() => document.getElementById('btn-search').click());
    await sleep(300);
    console.log('filter 8号线 rows:', await page.evaluate(() => document.querySelectorAll('#bind-table-body tr').length));

    // 详情
    await page.evaluate(() => document.querySelector('[data-action="detail-device"]').click());
    await sleep(300);
    await page.screenshot({ path: path.join(OUT_DIR, 'in-device-bind-05-detail.png') });
  } catch (err) {
    console.error('Test failed:', err.message);
    await page.screenshot({ path: path.join(OUT_DIR, 'in-device-bind-error.png') });
  } finally {
    await browser.close();
  }
})();
