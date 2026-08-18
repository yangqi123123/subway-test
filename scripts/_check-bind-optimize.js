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

  // ========== Web 后台 ==========
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const dialogs = [];
  page.on('dialog', async d => { dialogs.push(d.message()); await d.dismiss(); });
  try {
    await page.goto('http://127.0.0.1:8090/web/wb/in-device-bind.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(2000);

    console.log('== Web 表头顺序 ==');
    console.log(await page.evaluate(() =>
      Array.from(document.querySelectorAll('.bind-table thead th')).map(th => th.textContent.trim()).join(' | ')
    ));

    console.log('== Web 列表排序（IMEI/状态/最后在线） ==');
    console.log(await page.evaluate(() =>
      Array.from(document.querySelectorAll('#bind-table-body tr')).map(tr => {
        const tds = tr.querySelectorAll('td');
        return [tds[1].textContent.trim(), tds[3].textContent.trim(), tds[8].textContent.trim()].join(' | ');
      }).join('\n')
    ));
    await page.screenshot({ path: path.join(OUT_DIR, 'bind-opt-web-01-list.png') });

    // 打开绑定弹窗，检查默认回显
    await page.evaluate(() => document.querySelector('[data-action="bind-device"]').click());
    await sleep(400);
    console.log('== Web 绑定弹窗默认回显 ==');
    console.log('line:', await page.evaluate(() => document.getElementById('bind-line').value),
      '| start:', await page.evaluate(() => document.getElementById('bind-start').value),
      '| end:', await page.evaluate(() => document.getElementById('bind-end').value),
      '| person:', await page.evaluate(() => document.getElementById('bind-person-value').value),
      '| phone:', await page.evaluate(() => document.getElementById('bind-phone').value));
    console.log('start options:', await page.evaluate(() => Array.from(document.getElementById('bind-start').options).map(o => o.textContent).join(',')));

    // 人员组件模糊搜索（下拉打开时会挂载到 body）
    await page.evaluate(() => document.querySelector('#bind-person-select .wh-search-select__trigger').click());
    await sleep(300);
    await page.type('.wh-search-select__dropdown .wh-search-select__search', '李');
    await sleep(200);
    console.log('搜索"李"匹配项:', await page.evaluate(() =>
      Array.from(document.querySelectorAll('.wh-search-select__dropdown .wh-search-select__option')).map(li => li.textContent.trim()).join(',')
    ));
    await page.evaluate(() => document.querySelector('.wh-search-select__dropdown .wh-search-select__option').click());
    await sleep(200);
    console.log('改选人员:', await page.evaluate(() => document.getElementById('bind-person-value').value),
      '| phone:', await page.evaluate(() => document.getElementById('bind-phone').value));
    await page.screenshot({ path: path.join(OUT_DIR, 'bind-opt-web-02-modal.png') });

    // 改选其他线路仍可保存
    await page.select('#bind-line', '2号线');
    await sleep(200);
    await page.select('#bind-start', '常青花园');
    await page.select('#bind-end', '长港路');
    await page.evaluate(() => document.querySelector('[data-action="save-bind"]').click());
    await sleep(400);
    console.log('save dialog:', dialogs[dialogs.length - 1]);
    console.log('首行（绑定后应排到最后）:', await page.evaluate(() => {
      const trs = document.querySelectorAll('#bind-table-body tr');
      const last = trs[trs.length - 1];
      return last.textContent.includes('李磊') && last.textContent.includes('2号线') ? '李磊/2号线 在末行' : last.textContent.slice(0, 60);
    }));
  } catch (err) {
    console.error('Web test failed:', err.message);
    await page.screenshot({ path: path.join(OUT_DIR, 'bind-opt-web-error.png') });
  }
  await page.close();

  // ========== 移动端 ==========
  const mp = await browser.newPage();
  await mp.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  mp.on('pageerror', e => console.log('[mp pageerror]', e.message));
  try {
    await mp.goto('http://127.0.0.1:8090/app/patrol/pages/device-bind.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(2000);

    console.log('== 移动端 列表排序（IMEI/状态） ==');
    console.log(await mp.evaluate(() =>
      Array.from(document.querySelectorAll('.mp-project-card')).map(c =>
        c.querySelector('.mp-project-card__id').textContent.trim() + ' | ' + c.querySelector('.bind-status').textContent.trim()
      ).join('\n')
    ));

    console.log('== 移动端 卡片字段 ==');
    console.log(await mp.evaluate(() => {
      const c = document.querySelector('.mp-project-card');
      return c.querySelector('.mp-project-card__title').textContent.trim() + ' || ' +
        Array.from(c.querySelectorAll('.mp-project-card__meta dt')).map(dt => dt.textContent.trim()).join(',');
    }));
    await mp.screenshot({ path: path.join(OUT_DIR, 'bind-opt-mp-01-list.png') });

    // 打开绑定表单，检查默认回显
    await mp.evaluate(() => document.querySelector('[data-action="bind-open"]').click());
    await sleep(500);
    console.log('== 移动端 绑定表单默认回显 ==');
    console.log('line:', await mp.evaluate(() => document.getElementById('bind-line').value),
      '| start:', await mp.evaluate(() => document.getElementById('bind-start').value),
      '| end:', await mp.evaluate(() => document.getElementById('bind-end').value),
      '| person:', await mp.evaluate(() => document.getElementById('bind-person').value),
      '| display:', await mp.evaluate(() => document.getElementById('bind-person-display').textContent),
      '| phone:', await mp.evaluate(() => document.getElementById('bind-phone').value));

    // 人员选择弹层 + 模糊搜索
    await mp.evaluate(() => document.querySelector('[data-action="open-person-sheet"]').click());
    await sleep(400);
    await mp.screenshot({ path: path.join(OUT_DIR, 'bind-opt-mp-02-person-sheet.png') });
    await mp.type('#person-sheet-search', '李');
    await sleep(300);
    console.log('搜索"李"匹配项:', await mp.evaluate(() =>
      Array.from(document.querySelectorAll('#person-sheet-options .mp-select-option')).map(o => o.textContent.trim()).join(',')
    ));
    await mp.evaluate(() => document.querySelector('#person-sheet-options .mp-select-option').click());
    await sleep(200);
    await mp.evaluate(() => document.querySelector('[data-action="confirm-person-sheet"]').click());
    await sleep(300);
    console.log('改选人员:', await mp.evaluate(() => document.getElementById('bind-person').value),
      '| phone:', await mp.evaluate(() => document.getElementById('bind-phone').value));
    await mp.screenshot({ path: path.join(OUT_DIR, 'bind-opt-mp-03-form.png') });

    // 保存绑定
    await mp.evaluate(() => document.querySelector('[data-action="bind-save"]').click());
    await sleep(500);
    console.log('toast:', await mp.evaluate(() => document.getElementById('bind-toast').textContent));
    console.log('绑定后末位卡片:', await mp.evaluate(() => {
      const cards = document.querySelectorAll('.mp-project-card');
      const last = cards[cards.length - 1];
      return last.querySelector('.mp-project-card__id').textContent.trim() + ' | ' + last.querySelector('.bind-status').textContent.trim();
    }));
  } catch (err) {
    console.error('MP test failed:', err.message);
    await mp.screenshot({ path: path.join(OUT_DIR, 'bind-opt-mp-error.png') });
  } finally {
    await browser.close();
  }
})();
