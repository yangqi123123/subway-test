const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://127.0.0.1:8090/web/wb/wb-role.html';
const OUT_DIR = path.join(__dirname, '..', 'screenshots');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function clickBySelector(page, selector) {
  const exists = await page.evaluate((sel) => !!document.querySelector(sel), selector);
  if (!exists) return false;
  await page.evaluate((sel) => document.querySelector(sel).click(), selector);
  return true;
}

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  try {
    await page.goto(URL, { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(2000);
    await page.screenshot({ path: path.join(OUT_DIR, 'wb-role-01-list.png'), fullPage: false });

    const tableHeaders = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('table th')).map(th => th.textContent.trim());
    });
    console.log('Table headers:', JSON.stringify(tableHeaders, null, 2));

    await clickBySelector(page, '[data-action="add"], .wh-btn-primary');
    await sleep(800);
    await page.screenshot({ path: path.join(OUT_DIR, 'wb-role-02-form.png'), fullPage: false });

    const formOptions = await page.evaluate(() => {
      const sel = document.querySelector('select[data-form="roleType"]');
      return sel ? Array.from(sel.options).map(o => o.textContent.trim()) : null;
    });
    console.log('Role type options:', JSON.stringify(formOptions, null, 2));

    console.log('Screenshots saved to', OUT_DIR);
  } catch (err) {
    console.error('Test failed:', err.message);
    await page.screenshot({ path: path.join(OUT_DIR, 'wb-role-error.png'), fullPage: false });
  } finally {
    await browser.close();
  }
})();
