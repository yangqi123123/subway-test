const puppeteer = require('puppeteer-core');

async function runTest(doneMap, label) {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=414,896'] });
  const p = await b.newPage();
  await p.setViewport({ width: 414, height: 896, deviceScaleFactor: 2, isMobile: true });

  await p.goto('http://127.0.0.1:8090/app/patrol/pages/today-task.html', { waitUntil: 'load', timeout: 60000 });
  await p.evaluate(() => { window.localStorage.clear(); });
  await p.reload({ waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 800));

  await p.evaluate((doneMap) => {
    const today = '2026-07-16';
    window.localStorage.setItem('whmetro-today-task-done', JSON.stringify(doneMap));
    window.localStorage.setItem('whmetro-today-task-notified-keys', JSON.stringify({ [today]: [] }));
  }, doneMap);

  await p.evaluate(() => {
    const finish = document.querySelector('.mp-today-task-finish');
    if (finish) finish.click();
  });
  await new Promise(r => setTimeout(r, 300));
  await p.evaluate(() => {
    const ok = document.querySelector('[data-action="today-task-confirm-ok"]');
    if (ok) ok.click();
  });
  await new Promise(r => setTimeout(r, 500));

  const title = await p.evaluate(() => {
    const raw = window.localStorage.getItem('whmetro-notify-extra');
    const extras = raw ? JSON.parse(raw) : [];
    const row = extras.find(r => r.type === '项目巡查' && r.source === '今日巡线');
    return row ? row.title : null;
  });
  console.log(label + ':', title);
  await b.close();
}

(async () => {
  await runTest({ 'T-007': '2026-07-16' }, 'single project');
  await runTest({ 'T-007': '2026-07-16', 'T-001': '2026-07-16' }, 'multiple projects');
})();
