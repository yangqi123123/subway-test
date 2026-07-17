const puppeteer = require('puppeteer-core');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox','--window-size=414,896'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 414, height: 896, deviceScaleFactor: 2, isMobile: true });
  await page.goto('http://127.0.0.1:8090/app/stats/pages/drone-ops.html', { waitUntil: 'networkidle0', timeout: 60000 });
  const dims = await page.evaluate(() => ({ docH: document.documentElement.scrollHeight, bodyH: document.body.scrollHeight, winH: window.innerHeight }));
  console.log(dims);
  await browser.close();
})();
