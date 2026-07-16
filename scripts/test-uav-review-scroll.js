const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://127.0.0.1:8090/app/patrol/pages/patrol-alerts.html';
const OUT_DIR = path.join(__dirname, '..', 'screenshots');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 600, deviceScaleFactor: 2 });

  try {
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(1500);

    // 直接打开无人机复核弹窗并填充数据
    await page.evaluate(() => {
      var modal = document.getElementById('uav-review-modal');
      if (!modal) throw new Error('modal not found');
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('mp-scroll-locked');

      document.getElementById('uav-review-time').textContent = '2026-05-13 11:22:18';
      document.getElementById('uav-review-coord').textContent = '114.3145, 30.5868';
      document.getElementById('uav-review-project').textContent = '梨园站保护区无人机巡线';
      document.getElementById('uav-review-position').textContent = '里程 V20+072 左线外侧';
      document.getElementById('uav-review-type').textContent = '疑似机械施工';
      document.getElementById('uav-review-level').textContent = '严重';
      document.getElementById('uav-review-source').textContent = '无人机';
    });
    await sleep(500);
    await page.screenshot({ path: path.join(OUT_DIR, 'uav-review-scroll-01-open.png'), fullPage: false });

    const scrollInfo = await page.evaluate(() => {
      const body = document.querySelector('.mp-uav-review-modal__body');
      return {
        bodyOverflowY: body ? getComputedStyle(body).overflowY : null,
        bodyScrollHeight: body ? body.scrollHeight : 0,
        bodyClientHeight: body ? body.clientHeight : 0
      };
    });
    console.log(JSON.stringify(scrollInfo, null, 2));

    await page.evaluate(() => {
      const body = document.querySelector('.mp-uav-review-modal__body');
      if (body) body.scrollTop = body.scrollHeight;
    });
    await sleep(400);
    await page.screenshot({ path: path.join(OUT_DIR, 'uav-review-scroll-02-scrolled.png'), fullPage: false });

    console.log('Screenshots saved to', OUT_DIR);
  } catch (err) {
    console.error('Test failed:', err.message);
    await page.screenshot({ path: path.join(OUT_DIR, 'uav-review-scroll-error.png'), fullPage: false });
  } finally {
    await browser.close();
  }
})();
