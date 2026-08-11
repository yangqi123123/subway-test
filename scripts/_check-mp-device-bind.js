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
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  try {
    // 首页菜单
    await page.goto('http://127.0.0.1:8090/app/patrol/home.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(1800);
    console.log('menu has 设备领用:', await page.evaluate(() => document.body.innerText.includes('设备领用')));

    await page.goto('http://127.0.0.1:8090/app/patrol/pages/device-bind.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'mp-device-bind-01-list.png') });
    console.log('cards:', await page.evaluate(() => document.querySelectorAll('.mp-project-card').length));
    console.log('stats:', await page.evaluate(() => ['stat-total','stat-bound','stat-unbound','stat-online'].map(id => document.querySelector('#' + id + ' .mp-stat-card__num').textContent).join('/')));
    console.log('no batch buttons:', await page.evaluate(() => !document.body.innerText.includes('批量绑定') && !document.body.innerText.includes('导入')));

    // 详情
    await page.evaluate(() => document.querySelector('[data-action="bind-detail"]').click());
    await sleep(400);
    console.log('detail nav title:', await page.evaluate(() => document.getElementById('bind-nav-title').textContent));
    console.log('detail has imei:', await page.evaluate(() => document.getElementById('bind-detail-grid').textContent.includes('864502070112345')));
    await page.screenshot({ path: path.join(OUT_DIR, 'mp-device-bind-02-detail.png') });
    await page.evaluate(() => document.querySelector('[data-action="mp-nav-back"]').click());
    await sleep(300);

    // 绑定表单（未绑定行）
    await page.evaluate(() => document.querySelector('[data-action="bind-open"]').click());
    await sleep(400);
    console.log('bind nav title:', await page.evaluate(() => document.getElementById('bind-nav-title').textContent));
    console.log('imei readonly value:', await page.evaluate(() => document.getElementById('bind-imei').value));
    // 选择线路（直接操作原生 select 触发 change）
    await page.select('#bind-line', '8号线');
    await sleep(300);
    console.log('start options:', await page.evaluate(() => Array.from(document.getElementById('bind-start').options).map(o => o.textContent)));
    await page.select('#bind-start', '徐家棚');
    await page.select('#bind-end', '徐东');
    await sleep(300);
    console.log('person options:', await page.evaluate(() => Array.from(document.getElementById('bind-person').options).map(o => o.textContent)));
    await page.select('#bind-person', '李磊');
    await sleep(200);
    console.log('phone:', await page.evaluate(() => document.getElementById('bind-phone').value));
    await page.screenshot({ path: path.join(OUT_DIR, 'mp-device-bind-03-bindform.png') });
    await page.evaluate(() => document.querySelector('[data-action="bind-save"]').click());
    await sleep(400);
    console.log('toast:', await page.evaluate(() => document.getElementById('bind-toast').textContent));
    console.log('bound stat now:', await page.evaluate(() => document.querySelector('#stat-bound .mp-stat-card__num').textContent));

    // 解绑确认
    await page.evaluate(() => document.querySelector('[data-action="bind-unbind"]').click());
    await sleep(400);
    console.log('unbind confirm:', await page.evaluate(() => document.getElementById('mp-confirm-msg').textContent));
    await page.screenshot({ path: path.join(OUT_DIR, 'mp-device-bind-04-unbind.png') });
    await page.evaluate(() => document.querySelector('[data-action="mp-confirm-ok"]').click());
    await sleep(300);

    // 筛选 sheet
    await page.evaluate(() => document.querySelector('[data-action="open-bind-filter"]').click());
    await sleep(400);
    console.log('filter fields:', await page.evaluate(() =>
      Array.from(document.querySelectorAll('#bind-filter-sheet .mp-filter-field > span')).map(e => e.textContent.trim())
    ));
    await page.select('#filter-line', '8号线');
    await page.evaluate(() => document.querySelector('[data-action="search-bind"]').click());
    await sleep(300);
    console.log('filtered 8号线 cards:', await page.evaluate(() => document.querySelectorAll('.mp-project-card').length));

    // 关键词搜索
    await page.evaluate(() => document.querySelector('[data-action="reset-bind-filter"]'));
    await page.type('#bind-search-trigger', 'GT-06N');
    await sleep(400);
    console.log('search GT-06N cards:', await page.evaluate(() => document.querySelectorAll('.mp-project-card').length));
  } catch (err) {
    console.error('Test failed:', err.message);
    await page.screenshot({ path: path.join(OUT_DIR, 'mp-device-bind-error.png') });
  } finally {
    await browser.close();
  }
})();
