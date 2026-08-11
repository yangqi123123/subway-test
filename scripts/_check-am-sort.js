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

  for (const name of ['am-station', 'am-section']) {
    const prefix = name === 'am-station' ? 'station' : 'section';
    try {
      await page.goto('http://127.0.0.1:8090/web/wb/' + name + '.html', { waitUntil: 'networkidle0', timeout: 20000 });
      await sleep(1500);
      // 打开新建弹窗
      await page.evaluate((act) => {
        document.querySelector('[data-action="' + act + '"]').click();
      }, 'new-' + prefix);
      await sleep(400);
      const hasSort = await page.evaluate((id) => !!document.getElementById(id), prefix + '-sort');
      // 输入非数字应被过滤
      await page.evaluate((id) => {
        const el = document.getElementById(id);
        el.value = 'ab12c3';
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }, prefix + '-sort');
      const filtered = await page.evaluate((id) => document.getElementById(id).value, prefix + '-sort');
      // 直接保存（排序已填数字，但其它必填空）-> 应提示必填
      await page.evaluate((act) => {
        document.querySelector('[data-action="' + act + '"]').click();
      }, 'save-' + prefix);
      await sleep(300);
      console.log(name, '| sort field:', hasSort, '| digit filter "ab12c3" ->', JSON.stringify(filtered), '| dialog:', dialogs[dialogs.length - 1] || '(none)');
      await page.screenshot({ path: path.join(OUT_DIR, name + '-sort-form.png') });
      // 关闭弹窗
      await page.evaluate((act) => {
        const btn = document.querySelector('[data-action="' + act + '"]');
        if (btn) btn.click();
      }, 'close-' + prefix + '-modal');
      await sleep(200);
    } catch (err) {
      console.error(name, 'failed:', err.message);
    }
  }
  await browser.close();
})();
