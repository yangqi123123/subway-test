const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://127.0.0.1:8090/scripts/test-uav-review-shell.html';
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
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  try {
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(2500);
    await page.screenshot({ path: path.join(OUT_DIR, 'uav-review-tabbar-00-shell.png'), fullPage: false });

    const frameHandle = await page.$('#test-frame');
    if (!frameHandle) throw new Error('test frame not found');
    const frame = await frameHandle.contentFrame();
    if (!frame) throw new Error('frame content not accessible');

    // 直接打开 UAV 复核弹窗
    await frame.evaluate(() => {
      var modal = document.getElementById('uav-review-modal');
      if (!modal) throw new Error('modal not found in frame');
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('mp-scroll-locked');
      // 模拟 openUavReviewModal 中的 tabbar 隐藏逻辑
      try {
        var target = window.top || window.parent;
        if (target && target !== window) {
          target.postMessage({ type: 'wh-miniapp-tabbar', hidden: true }, '*');
        }
      } catch (e) {}
    });
    await sleep(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'uav-review-tabbar-01-modal-open.png'), fullPage: false });

    const tabbarInfo = await page.evaluate(() => {
      const tabbar = document.getElementById('test-tabbar');
      return {
        tabbarExists: !!tabbar,
        tabbarHidden: tabbar ? tabbar.classList.contains('is-hidden') : null,
        tabbarDisplay: tabbar ? getComputedStyle(tabbar).display : null
      };
    });
    console.log('Open modal:', JSON.stringify(tabbarInfo, null, 2));

    // 关闭弹窗
    await frame.evaluate(() => {
      var modal = document.getElementById('uav-review-modal');
      if (modal) {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('mp-scroll-locked');
      }
      try {
        var target = window.top || window.parent;
        if (target && target !== window) {
          target.postMessage({ type: 'wh-miniapp-tabbar', hidden: false }, '*');
        }
      } catch (e) {}
    });
    await sleep(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'uav-review-tabbar-02-modal-closed.png'), fullPage: false });

    const tabbarInfo2 = await page.evaluate(() => {
      const tabbar = document.getElementById('test-tabbar');
      return {
        tabbarHidden: tabbar ? tabbar.classList.contains('is-hidden') : null,
        tabbarDisplay: tabbar ? getComputedStyle(tabbar).display : null
      };
    });
    console.log('Close modal:', JSON.stringify(tabbarInfo2, null, 2));

    console.log('Screenshots saved to', OUT_DIR);
  } catch (err) {
    console.error('Test failed:', err.message);
    await page.screenshot({ path: path.join(OUT_DIR, 'uav-review-tabbar-error.png'), fullPage: false });
  } finally {
    await browser.close();
  }
})();
