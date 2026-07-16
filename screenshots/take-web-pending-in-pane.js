const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  await page.goto('http://127.0.0.1:8090/web/wb/wb-sys-notify.html', { waitUntil: 'networkidle2', timeout: 30000 });
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1500)));

  const viewBtns = await page.$$('span[data-action="查看"]');
  for (const btn of viewBtns) {
    const rowTitle = await btn.evaluate(el => el.getAttribute('data-row-title') || '');
    if (rowTitle.indexOf('洪山路-小洪山') >= 0 || rowTitle.indexOf('洪山路~小洪山') >= 0) {
      await btn.click();
      break;
    }
  }
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

  await page.click('[data-action="patrol-view-pending-project"]');
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1200)));

  await page.screenshot({ path: path.join(__dirname, 'web-pending-patrol-in-pane.png'), fullPage: true });
  console.log('saved screenshot');
  await browser.close();
})();
