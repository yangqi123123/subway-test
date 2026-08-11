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
  try {
    await page.goto('http://127.0.0.1:8090/web/wb/in-track-device.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(2000);

    // 统计卡片
    const stats = await page.evaluate(() => ({
      total: document.querySelector('#stat-total .disease-stat-card__num').textContent,
      online: document.querySelector('#stat-online .disease-stat-card__num').textContent,
      offline: document.querySelector('#stat-offline .disease-stat-card__num').textContent,
      bound: document.querySelector('#stat-bound .disease-stat-card__num').textContent,
      labels: Array.from(document.querySelectorAll('.disease-stat-card__label')).map(e => e.textContent.trim())
    }));
    console.log('stats:', JSON.stringify(stats));
    await page.screenshot({ path: path.join(OUT_DIR, 'in-track-device-06-stats.png') });

    // 下载模板
    await page.evaluate(() => document.getElementById('btn-import').click());
    await sleep(300);
    await page.evaluate(() => document.getElementById('device-import-template').click());
    await sleep(1200);

    // 导出
    await page.evaluate(() => document.querySelector('[data-action="close-device-import"]').click());
    await sleep(200);
    await page.evaluate(() => document.getElementById('btn-export').click());
    await sleep(1200);

    const files = fs.readdirSync(DL_DIR);
    console.log('downloaded files:', files);
    files.forEach(f => {
      const content = fs.readFileSync(path.join(DL_DIR, f), 'utf8');
      const cells = Array.from(content.matchAll(/<Data ss:Type="String">([^<]*)<\/Data>/g)).map(m => m[1]);
      console.log(f, '-> cells:', JSON.stringify(cells));
    });
  } catch (err) {
    console.error('Test failed:', err.message);
  } finally {
    await browser.close();
  }
})();
