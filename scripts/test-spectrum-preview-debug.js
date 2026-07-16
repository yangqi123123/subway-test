const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://127.0.0.1:8090/app/map/pages/event-annotate.html';
const OUT_DIR = path.join(__dirname, '..', 'screenshots');

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 20000 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, 'spectrum-preview-debug.png'), fullPage: true });

  const info = await page.evaluate(() => {
    const left = document.querySelector('[data-action="spectrum-preview"][data-index="0"]');
    const right = document.querySelector('[data-action="spectrum-preview"][data-index="1"]');
    const img = document.getElementById('event-current-spectrum');
    const app = document.getElementById('event-annotate-app');
    const view = document.getElementById('event-annotate-view');
    return {
      appDisplay: app ? getComputedStyle(app).display : null,
      viewDisplay: view ? getComputedStyle(view).display : null,
      leftDisplay: left ? getComputedStyle(left).display : null,
      leftVisibility: left ? getComputedStyle(left).visibility : null,
      leftOpacity: left ? getComputedStyle(left).opacity : null,
      leftRect: left ? { x: left.offsetLeft, y: left.offsetTop, w: left.offsetWidth, h: left.offsetHeight } : null,
      imgDisplay: img ? getComputedStyle(img).display : null,
      imgRect: img ? { x: img.offsetLeft, y: img.offsetTop, w: img.offsetWidth, h: img.offsetHeight } : null
    };
  });

  console.log(JSON.stringify(info, null, 2));

  await browser.close();
})();
