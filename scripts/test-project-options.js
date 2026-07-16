const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://127.0.0.1:8090';
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

async function getFilterSelects(page) {
  return await page.evaluate(() => {
    const result = {};
    document.querySelectorAll('select[data-filter]').forEach(function (sel) {
      const label = sel.closest('label');
      const text = label ? label.querySelector('span') : null;
      const name = text ? text.textContent.trim() : '';
      if (name) {
        result[name] = Array.from(sel.options).map(o => o.textContent.trim());
      }
    });
    return result;
  });
}

async function getFormSelectOptions(page, labelText) {
  return await page.evaluate((text) => {
    const labels = Array.from(document.querySelectorAll('label, .project-form-label'));
    const label = labels.find(l => l.textContent.trim() === text);
    if (!label) return null;
    let el = label.nextElementSibling;
    if (!el) el = label.parentElement.querySelector('select, input');
    if (!el) return null;
    if (el.tagName === 'SELECT') {
      return Array.from(el.options).map(o => o.textContent.trim());
    }
    return null;
  }, labelText);
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
    // 1. web in-project
    await page.goto(BASE + '/web/wb/in-project.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(1000);
    await page.screenshot({ path: path.join(OUT_DIR, 'project-options-web-in-project-filter.png'), fullPage: false });
    console.log('web in-project filter:', JSON.stringify(await getFilterSelects(page), null, 2));

    if (await clickBySelector(page, '[data-action="new-project"]')) {
      await sleep(800);
      await page.screenshot({ path: path.join(OUT_DIR, 'project-options-web-in-project-form.png'), fullPage: false });
      console.log('web in-project form 项目类型:', await getFormSelectOptions(page, '项目类型：'));
    }

    // 2. web in-project-done
    await page.goto(BASE + '/web/wb/in-project-done.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(1000);
    await page.screenshot({ path: path.join(OUT_DIR, 'project-options-web-in-project-done-filter.png'), fullPage: false });
    console.log('web in-project-done filter:', JSON.stringify(await getFilterSelects(page), null, 2));

    if (await clickBySelector(page, '[data-action="new-project"]')) {
      await sleep(800);
      await page.screenshot({ path: path.join(OUT_DIR, 'project-options-web-in-project-done-form.png'), fullPage: false });
      console.log('web in-project-done form 项目类型:', await getFormSelectOptions(page, '项目类型：'));
    }

    // 3. app project
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await mobilePage.goto(BASE + '/app/patrol/pages/project.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(1000);
    await clickBySelector(mobilePage, '[data-action="open-filter-sheet"]');
    await sleep(500);
    await mobilePage.screenshot({ path: path.join(OUT_DIR, 'project-options-app-project-filter.png'), fullPage: false });
    console.log('app project filter:', JSON.stringify(await getFilterSelects(mobilePage), null, 2));
    await clickBySelector(mobilePage, '[data-action="close-filter-sheet"]');
    await sleep(300);

    if (await clickBySelector(mobilePage, '[data-action="new-project"]')) {
      await sleep(800);
      await mobilePage.screenshot({ path: path.join(OUT_DIR, 'project-options-app-project-form.png'), fullPage: false });
      console.log('app project form 项目类型:', await getFormSelectOptions(mobilePage, '项目类型'));
    }

    // 4. app project-done
    await mobilePage.goto(BASE + '/app/patrol/pages/project-done.html', { waitUntil: 'networkidle0', timeout: 20000 });
    await sleep(1000);
    await clickBySelector(mobilePage, '[data-action="open-filter-sheet"]');
    await sleep(500);
    await mobilePage.screenshot({ path: path.join(OUT_DIR, 'project-options-app-project-done-filter.png'), fullPage: false });
    console.log('app project-done filter:', JSON.stringify(await getFilterSelects(mobilePage), null, 2));
    await clickBySelector(mobilePage, '[data-action="close-filter-sheet"]');
    await sleep(300);

    if (await clickBySelector(mobilePage, '[data-action="new-project"]')) {
      await sleep(800);
      await mobilePage.screenshot({ path: path.join(OUT_DIR, 'project-options-app-project-done-form.png'), fullPage: false });
      console.log('app project-done form 项目类型:', await getFormSelectOptions(mobilePage, '项目类型'));
    }

    console.log('Screenshots saved to', OUT_DIR);
  } catch (err) {
    console.error('Test failed:', err.message);
    await page.screenshot({ path: path.join(OUT_DIR, 'project-options-error.png'), fullPage: false });
  } finally {
    await browser.close();
  }
})();
